import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

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
    const { status, condition, shelfId, rack, notes, barcode } = body;

    const existing = await prisma.bookCopy.findUnique({
      where: { id: params.id },
      include: { book: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Physical copy not found." }, { status: 404 });
    }

    // Check barcode change uniqueness if barcode is being replaced
    if (barcode && barcode !== existing.barcode) {
      const duplicateBarcode = await prisma.bookCopy.findUnique({
        where: { barcode },
      });
      if (duplicateBarcode) {
        return NextResponse.json(
          { error: `Barcode "${barcode}" is already in use.` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.bookCopy.update({
      where: { id: params.id },
      data: {
        status: status || existing.status,
        condition: condition || existing.condition,
        shelfId: shelfId !== undefined ? shelfId : existing.shelfId,
        rack: rack !== undefined ? rack : existing.rack,
        notes: notes !== undefined ? notes : existing.notes,
        barcode: barcode || existing.barcode,
      },
      include: {
        book: true,
        shelf: { include: { section: true } },
      },
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Staff",
      action: "COPY_STATUS_CHANGE",
      entity: "BookCopy",
      entityId: updated.id,
      oldValue: {
        status: existing.status,
        condition: existing.condition,
        shelfId: existing.shelfId,
        barcode: existing.barcode,
      },
      newValue: {
        status: updated.status,
        condition: updated.condition,
        shelfId: updated.shelfId,
        barcode: updated.barcode,
      },
    });

    return NextResponse.json({ success: true, copy: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
