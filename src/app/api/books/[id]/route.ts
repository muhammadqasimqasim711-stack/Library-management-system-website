import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const canViewBorrowers =
      isAdmin(user) ||
      hasPermission(user, "BORROWER_VIEW") ||
      hasPermission(user, "LOAN_VIEW") ||
      user?.memberType === "STAFF" ||
      user?.memberType === "ADMIN";

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
              include: {
                user: {
                  select: {
                    id: true,
                    memberId: true,
                    fullName: true,
                    memberType: true,
                    email: true,
                    department: { select: { name: true } },
                  },
                },
              },
              orderBy: { issuedAt: "desc" },
              take: 1,
            },
          },
          orderBy: { copyNumber: "asc" },
        },
        reservations: {
          where: { status: { in: ["PENDING", "ON_HOLD"] } },
          orderBy: { queuePosition: "asc" },
          include: {
            user: {
              select: {
                id: true,
                memberId: true,
                fullName: true,
                memberType: true,
              },
            },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    // Fetch historical loans for this book's copies
    const historicalLoans = await prisma.loan.findMany({
      where: {
        copy: { bookId: params.id },
        status: { in: ["RETURNED", "LOST"] },
      },
      include: {
        copy: {
          select: {
            id: true,
            barcode: true,
            copyNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            memberId: true,
            fullName: true,
            memberType: true,
          },
        },
      },
      orderBy: { returnedAt: "desc" },
      take: 50,
    });

    const totalCopies = book.copies.length;
    const availableCopies = book.copies.filter((c) => c.status === "AVAILABLE").length;
    const borrowedCopies = book.copies.filter((c) => c.status === "BORROWED" || c.status === "OVERDUE").length;
    const reservedCopies = book.copies.filter((c) => c.status === "RESERVED" || c.status === "ON_HOLD").length;
    const lostCopies = book.copies.filter((c) => c.status === "LOST").length;
    const damagedCopies = book.copies.filter((c) => c.status === "DAMAGED" || c.status === "UNDER_REPAIR").length;

    // Process copies with borrower info if authorized
    const processedCopies = book.copies.map((copy) => {
      const activeLoan = copy.loans[0] || null;
      let currentBorrower = null;

      if (activeLoan && canViewBorrowers) {
        currentBorrower = {
          loanId: activeLoan.id,
          memberId: activeLoan.user.memberId,
          name: activeLoan.user.fullName,
          memberType: activeLoan.user.memberType,
          email: activeLoan.user.email,
          department: activeLoan.user.department?.name || null,
          issuedAt: activeLoan.issuedAt,
          dueDate: activeLoan.dueDate,
          status: activeLoan.status,
          renewCount: activeLoan.renewCount,
        };
      }

      return {
        id: copy.id,
        copyNumber: copy.copyNumber,
        barcode: copy.barcode,
        status: copy.status,
        condition: copy.condition,
        rack: copy.rack,
        shelf: copy.shelf,
        location: copy.shelf
          ? `${copy.shelf.section?.name || "Main Library"} / Shelf ${copy.shelf.code}${copy.rack ? ` (${copy.rack})` : ""}`
          : "Unassigned Shelf",
        acquisitionDate: copy.acquisitionDate,
        purchaseCost: copy.purchaseCost,
        currentBorrower,
      };
    });

    // Active loans list for the Current Loans tab
    const activeLoans = processedCopies
      .filter((c) => c.currentBorrower !== null)
      .map((c) => ({
        copyId: c.id,
        barcode: c.barcode,
        copyNumber: c.copyNumber,
        ...c.currentBorrower!,
      }));

    // Historical loans (mask borrower if unauthorized)
    const processedHistory = historicalLoans.map((hl) => ({
      loanId: hl.id,
      copyBarcode: hl.copy.barcode,
      copyNumber: hl.copy.copyNumber,
      borrowerName: canViewBorrowers ? hl.user.fullName : "Protected Member",
      memberId: canViewBorrowers ? hl.user.memberId : "PROTECTED",
      memberType: canViewBorrowers ? hl.user.memberType : "MEMBER",
      issuedAt: hl.issuedAt,
      returnedAt: hl.returnedAt,
      status: hl.status,
    }));

    return NextResponse.json({
      book: {
        ...book,
        copies: processedCopies,
        activeLoans,
        historicalLoans: processedHistory,
        summary: {
          totalCopies,
          availableCopies,
          borrowedCopies,
          reservedCopies,
          lostCopies,
          damagedCopies,
        },
        availableCopies,
        totalCopies,
        borrowedCopies,
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
