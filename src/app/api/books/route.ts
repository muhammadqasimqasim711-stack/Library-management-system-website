import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const categoryId = searchParams.get("categoryId");
    const departmentId = searchParams.get("departmentId");
    const sectionId = searchParams.get("sectionId");
    const availability = searchParams.get("availability"); // 'available', 'all'
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: any = {
      isArchived: false,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { isbn: { contains: q } },
        { subject: { contains: q } },
        { classificationNumber: { contains: q } },
        { authors: { some: { author: { name: { contains: q } } } } },
        { publisher: { name: { contains: q } } },
        { copies: { some: { barcode: { contains: q } } } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (sectionId) where.sectionId = sectionId;

    if (availability === "available") {
      where.copies = {
        some: {
          status: "AVAILABLE",
        },
      };
    }

    const [books, totalCount] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          authors: { include: { author: true } },
          category: true,
          publisher: true,
          department: true,
          section: true,
          copies: {
            select: {
              id: true,
              barcode: true,
              status: true,
              condition: true,
              rack: true,
              shelf: {
                select: {
                  code: true,
                  name: true,
                  section: { select: { name: true, floor: true, building: true } },
                },
              },
            },
          },
          _count: {
            select: {
              copies: true,
              reservations: { where: { status: "PENDING" } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { title: "asc" },
      }),
      prisma.book.count({ where }),
    ]);

    // Enhance books with calculated availability metrics
    const enhancedBooks = books.map((b) => {
      const totalCopies = b.copies.length;
      const availableCopies = b.copies.filter((c) => c.status === "AVAILABLE").length;
      const borrowedCopies = b.copies.filter((c) => c.status === "BORROWED" || c.status === "OVERDUE").length;
      const reservedCopies = b.copies.filter((c) => c.status === "RESERVED" || c.status === "ON_HOLD").length;

      return {
        ...b,
        totalCopies,
        availableCopies,
        borrowedCopies,
        reservedCopies,
      };
    });

    return NextResponse.json({
      books: enhancedBooks,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      isbn,
      publicationYear,
      edition,
      language,
      description,
      subject,
      classificationNumber,
      coverUrl,
      tags,
      categoryId,
      publisherId,
      departmentId,
      sectionId,
      authorNames, // Array of author strings
      initialCopiesCount = 1,
      initialShelfId,
      purchaseCost = 50.0,
    } = body;

    if (!title || !isbn) {
      return NextResponse.json(
        { error: "Title and ISBN are required fields." },
        { status: 400 }
      );
    }

    // Check duplicate ISBN
    const existingBook = await prisma.book.findUnique({
      where: { isbn },
    });
    if (existingBook) {
      return NextResponse.json(
        { error: `A book with ISBN ${isbn} already exists in the catalog ("${existingBook.title}").` },
        { status: 409 }
      );
    }

    // Create book and copies in transaction
    const newBook = await prisma.$transaction(async (tx) => {
      const created = await tx.book.create({
        data: {
          title,
          subtitle,
          isbn,
          publicationYear: parseInt(publicationYear, 10) || new Date().getFullYear(),
          edition,
          language: language || "English",
          description,
          subject,
          classificationNumber,
          coverUrl: coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
          tags,
          categoryId: categoryId || null,
          publisherId: publisherId || null,
          departmentId: departmentId || null,
          sectionId: sectionId || null,
        },
      });

      // Handle authors
      if (Array.isArray(authorNames) && authorNames.length > 0) {
        for (const aName of authorNames) {
          if (!aName.trim()) continue;
          let author = await tx.author.findFirst({ where: { name: aName.trim() } });
          if (!author) {
            author = await tx.author.create({ data: { name: aName.trim() } });
          }
          await tx.bookAuthor.create({
            data: { bookId: created.id, authorId: author.id },
          });
        }
      }

      // Generate initial physical copies
      const cleanIsbnSuffix = isbn.replace(/[^0-9]/g, "").slice(-4);
      for (let i = 1; i <= (initialCopiesCount || 1); i++) {
        const barcode = `LIB-ACC-${cleanIsbnSuffix}-${String(i).padStart(3, "0")}`;
        await tx.bookCopy.create({
          data: {
            bookId: created.id,
            barcode,
            copyNumber: i,
            shelfId: initialShelfId || null,
            condition: "NEW",
            status: "AVAILABLE",
            purchaseCost: parseFloat(purchaseCost) || 50.0,
          },
        });
      }

      return created;
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Cataloging System",
      action: "BOOK_CREATE",
      entity: "Book",
      entityId: newBook.id,
      newValue: { title: newBook.title, isbn: newBook.isbn, copies: initialCopiesCount },
    });

    return NextResponse.json({ success: true, book: newBook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
