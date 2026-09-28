import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        authors: { include: { author: true } },
        category: true,
        publisher: true,
        department: true,
        section: true,
        copies: {
          include: {
            shelf: {
              include: {
                section: true,
              },
            },
            loans: {
              where: { status: { in: ["ACTIVE", "OVERDUE"] } },
              select: {
                id: true,
                dueDate: true,
                status: true,
              },
            },
          },
          orderBy: { copyNumber: "asc" },
        },
        reservations: {
          where: { status: { in: ["PENDING", "ON_HOLD"] } },
          orderBy: { queuePosition: "asc" },
          select: {
            id: true,
            queuePosition: true,
            status: true,
            userId: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    const availableCopies = book.copies.filter((c) => c.status === "AVAILABLE").length;
    const totalCopies = book.copies.length;

    return NextResponse.json({
      book: {
        ...book,
        availableCopies,
        totalCopies,
        isReservable: availableCopies === 0 && totalCopies > 0,
        pendingReservationsCount: book.reservations.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
      edition,
      publicationYear,
      language,
      description,
      subject,
      classificationNumber,
      coverUrl,
      categoryId,
      publisherId,
      departmentId,
      sectionId,
    } = body;

    const existing = await prisma.book.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    const updated = await prisma.book.update({
      where: { id: params.id },
      data: {
        title: title || existing.title,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        edition: edition !== undefined ? edition : existing.edition,
        publicationYear: publicationYear ? parseInt(publicationYear, 10) : existing.publicationYear,
        language: language || existing.language,
        description: description !== undefined ? description : existing.description,
        subject: subject !== undefined ? subject : existing.subject,
        classificationNumber: classificationNumber !== undefined ? classificationNumber : existing.classificationNumber,
        coverUrl: coverUrl || existing.coverUrl,
        categoryId: categoryId || existing.categoryId,
        publisherId: publisherId || existing.publisherId,
        departmentId: departmentId || existing.departmentId,
        sectionId: sectionId || existing.sectionId,
      },
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Cataloger",
      action: "BOOK_UPDATE",
      entity: "Book",
      entityId: updated.id,
      oldValue: existing,
      newValue: updated,
    });

    return NextResponse.json({ success: true, book: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if any copies are currently borrowed
    const activeLoans = await prisma.loan.count({
      where: {
        copy: { bookId: params.id },
        status: { in: ["ACTIVE", "OVERDUE"] },
      },
    });

    if (activeLoans > 0) {
      return NextResponse.json(
        { error: `Cannot archive book: ${activeLoans} physical copy/copies are currently borrowed.` },
        { status: 400 }
      );
    }

    // Soft-archive to preserve historical records as required by domain rules
    const archived = await prisma.book.update({
      where: { id: params.id },
      data: { isArchived: true },
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Director",
      action: "BOOK_ARCHIVE",
      entity: "Book",
      entityId: archived.id,
      newValue: { isArchived: true },
    });

    return NextResponse.json({ success: true, message: "Book archived successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
