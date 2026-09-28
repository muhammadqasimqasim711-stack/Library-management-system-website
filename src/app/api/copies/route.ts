import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get("barcode")?.trim();
    const bookId = searchParams.get("bookId");
    const shelfId = searchParams.get("shelfId");
    const status = searchParams.get("status");
    const condition = searchParams.get("condition");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const where: any = {};
    if (barcode) where.barcode = { contains: barcode };
    if (bookId) where.bookId = bookId;
    if (shelfId) where.shelfId = shelfId;
    if (status) where.status = status;
    if (condition) where.condition = condition;

    const [copies, totalCount] = await Promise.all([
      prisma.bookCopy.findMany({
        where,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              coverUrl: true,
              classificationNumber: true,
              category: { select: { name: true } },
            },
          },
          shelf: {
            include: {
              section: true,
            },
          },
          loans: {
            where: { status: { in: ["ACTIVE", "OVERDUE"] } },
            include: { user: { select: { fullName: true, memberId: true } } },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.bookCopy.count({ where }),
    ]);

    return NextResponse.json({
      copies,
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
    const { bookId, barcode, shelfId, rack, condition = "NEW", purchaseCost = 0.0, notes } = body;

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required." }, { status: 400 });
    }

    // Verify book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book title not found." }, { status: 404 });
    }

    // Determine copy number
    const existingCopiesCount = await prisma.bookCopy.count({ where: { bookId } });
    const nextCopyNumber = existingCopiesCount + 1;

    // Generate barcode if not explicitly supplied
    let generatedBarcode = barcode ? barcode.trim() : null;
    if (!generatedBarcode) {
      const isbnClean = book.isbn.replace(/[^0-9]/g, "").slice(-4);
      generatedBarcode = `LIB-ACC-${isbnClean}-${String(nextCopyNumber).padStart(3, "0")}`;
    }

    // Validate barcode uniqueness
    const existingWithBarcode = await prisma.bookCopy.findUnique({
      where: { barcode: generatedBarcode },
    });
    if (existingWithBarcode) {
      return NextResponse.json(
        { error: `Barcode "${generatedBarcode}" is already assigned to another physical copy.` },
        { status: 409 }
      );
    }

    const newCopy = await prisma.bookCopy.create({
      data: {
        bookId,
        barcode: generatedBarcode,
        copyNumber: nextCopyNumber,
        shelfId: shelfId || null,
        rack: rack || null,
        condition,
        status: "AVAILABLE",
        purchaseCost: parseFloat(purchaseCost) || 0.0,
        notes: notes || null,
      },
      include: {
        book: true,
        shelf: { include: { section: true } },
      },
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Staff",
      action: "COPY_CREATE",
      entity: "BookCopy",
      entityId: newCopy.id,
      newValue: { barcode: newCopy.barcode, bookTitle: book.title, copyNumber: nextCopyNumber },
    });

    return NextResponse.json({ success: true, copy: newCopy }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
