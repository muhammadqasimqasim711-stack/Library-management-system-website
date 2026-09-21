import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get("barcode")?.trim();

    if (!barcode) {
      return NextResponse.json({ error: "Barcode parameter is required" }, { status: 400 });
    }

    const copy = await prisma.bookCopy.findUnique({
      where: { barcode },
      include: {
        book: {
          include: {
            authors: { include: { author: true } },
            category: true,
            publisher: true,
          },
        },
        shelf: {
          include: {
            section: true,
          },
        },
        loans: {
          where: { status: { in: ["ACTIVE", "OVERDUE"] } },
          include: { user: true },
          take: 1,
        },
        assignedReservations: {
          where: { status: "ON_HOLD" },
          include: { user: true },
          take: 1,
        },
      },
    });

    if (!copy) {
      return NextResponse.json({ error: `Physical copy with barcode "${barcode}" not found.` }, { status: 404 });
    }

    const currentLoan = copy.loans[0] || null;
    const holdReservation = copy.assignedReservations[0] || null;

    return NextResponse.json({
      copy: {
        id: copy.id,
        barcode: copy.barcode,
        copyNumber: copy.copyNumber,
        status: copy.status,
        condition: copy.condition,
        purchaseCost: copy.purchaseCost,
        rack: copy.rack,
        shelf: copy.shelf ? {
          code: copy.shelf.code,
          name: copy.shelf.name,
          section: copy.shelf.section?.name,
          floor: copy.shelf.section?.floor,
          building: copy.shelf.section?.building,
        } : null,
        book: {
          id: copy.book.id,
          title: copy.book.title,
          isbn: copy.book.isbn,
          coverUrl: copy.book.coverUrl,
          authors: copy.book.authors.map((a) => a.author.name).join(", "),
          category: copy.book.category?.name,
          classificationNumber: copy.book.classificationNumber,
        },
        currentLoan: currentLoan ? {
          id: currentLoan.id,
          borrowerId: currentLoan.user.memberId,
          borrowerName: currentLoan.user.fullName,
          borrowerEmail: currentLoan.user.email,
          issuedAt: currentLoan.issuedAt,
          dueDate: currentLoan.dueDate,
          renewCount: currentLoan.renewCount,
          status: currentLoan.status,
        } : null,
        heldFor: holdReservation ? {
          memberId: holdReservation.user.memberId,
          memberName: holdReservation.user.fullName,
          expiresAt: holdReservation.expiresAt,
        } : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
