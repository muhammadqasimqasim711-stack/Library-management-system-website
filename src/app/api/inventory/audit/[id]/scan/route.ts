import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function POST(
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

    const auditId = params.id;
    const body = await req.json();
    const { barcode } = body;

    if (!barcode?.trim()) {
      return NextResponse.json({ error: "Barcode is required." }, { status: 400 });
    }

    const cleanBarcode = barcode.trim();

    const audit = await prisma.inventoryAudit.findUnique({
      where: { id: auditId },
      include: { shelf: true },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit session not found." }, { status: 404 });
    }

    if (audit.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot scan items into a completed audit." }, { status: 400 });
    }

    // Check if already scanned in this audit session
    const existingScan = await prisma.inventoryAuditItem.findFirst({
      where: { auditId, barcode: cleanBarcode },
    });

    if (existingScan) {
      return NextResponse.json(
        { error: `Barcode ${cleanBarcode} has already been recorded in this audit.` },
        { status: 409 }
      );
    }

    // Find physical copy in database
    const copy = await prisma.bookCopy.findUnique({
      where: { barcode: cleanBarcode },
      include: {
        book: true,
        shelf: true,
      },
    });

    let status = "UNEXPECTED";
    let expectedShelfId = null;

    if (copy) {
      expectedShelfId = copy.shelfId;
      if (copy.shelfId === audit.shelfId) {
        status = "MATCHED";
      } else {
        status = "MISPLACED"; // Belongs to another shelf!
      }
    }

    const auditItem = await prisma.inventoryAuditItem.create({
      data: {
        auditId,
        copyId: copy ? copy.id : null,
        barcode: cleanBarcode,
        expectedShelfId,
        scannedShelfId: audit.shelfId,
        status,
      },
      include: {
        copy: { include: { book: true, shelf: true } },
      },
    });

    return NextResponse.json({
      success: true,
      item: auditItem,
      status,
      message:
        status === "MATCHED"
          ? `Verified: "${copy?.book.title}" matches shelf ${audit.shelf.code}.`
          : status === "MISPLACED"
          ? `MISPLACED ITEM: "${copy?.book.title}" belongs on shelf ${copy?.shelf?.code || "Unknown"}, not ${audit.shelf.code}!`
          : `UNEXPECTED BARCODE: Barcode ${cleanBarcode} is not in the library database.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
