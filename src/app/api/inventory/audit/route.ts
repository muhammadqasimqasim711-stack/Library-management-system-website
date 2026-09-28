import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
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
    const audits = await prisma.inventoryAudit.findMany({
      include: {
        shelf: {
          include: {
            section: true,
          },
        },
        auditor: {
          select: { id: true, memberId: true, fullName: true },
        },
        items: {
          include: {
            copy: { include: { book: true } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ audits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Start a new Shelf Audit Session
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
    const { shelfId, notes } = body;

    if (!shelfId) {
      return NextResponse.json({ error: "Shelf ID is required." }, { status: 400 });
    }

    const shelf = await prisma.shelf.findUnique({
      where: { id: shelfId },
      include: {
        copies: {
          where: { status: { notIn: ["WITHDRAWN", "LOST"] } },
          include: { book: true },
        },
      },
    });

    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found." }, { status: 404 });
    }

    const auditCode = `AUDIT-${new Date().toISOString().slice(0, 10)}-${shelf.code}`;

    const newAudit = await prisma.inventoryAudit.create({
      data: {
        code: auditCode,
        shelfId: shelf.id,
        auditorId: user?.id || "DIR-001",
        status: "IN_PROGRESS",
        totalExpected: shelf.copies.length,
        notes: notes || `Live Shelf Audit for ${shelf.code} (${shelf.name})`,
      },
      include: {
        shelf: { include: { section: true } },
      },
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Inventory Staff",
      action: "INVENTORY_AUDIT_START",
      entity: "InventoryAudit",
      entityId: newAudit.id,
      newValue: { shelf: shelf.code, totalExpected: shelf.copies.length },
    });

    return NextResponse.json({ success: true, audit: newAudit }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Finalize Audit Session
export async function PUT(req: Request) {
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
    const { auditId, reconcileMissing } = body;

    const audit = await prisma.inventoryAudit.findUnique({
      where: { id: auditId },
      include: {
        shelf: {
          include: {
            copies: { where: { status: { notIn: ["WITHDRAWN", "LOST"] } } },
          },
        },
        items: true,
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 });
    }

    const scannedCopyIds = new Set(audit.items.filter((i) => i.copyId).map((i) => i.copyId));
    const missingCopies = audit.shelf.copies.filter((c) => !scannedCopyIds.has(c.id));

    // Record missing items into audit
    for (const mc of missingCopies) {
      await prisma.inventoryAuditItem.create({
        data: {
          auditId: audit.id,
          copyId: mc.id,
          barcode: mc.barcode,
          expectedShelfId: audit.shelfId,
          status: "MISSING",
        },
      });

      // If user chooses to mark missing copies in catalog
      if (reconcileMissing) {
        await prisma.bookCopy.update({
          where: { id: mc.id },
          data: { status: "MISSING" },
        });
      }
    }

    const matchedCount = audit.items.filter((i) => i.status === "MATCHED").length;
    const misplacedCount = audit.items.filter((i) => i.status === "MISPLACED").length;
    const missingCount = missingCopies.length;

    const completed = await prisma.inventoryAudit.update({
      where: { id: audit.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        totalScanned: audit.items.length,
        totalMatched: matchedCount,
        totalMisplaced: misplacedCount,
        totalMissing: missingCount,
      },
      include: {
        shelf: { include: { section: true } },
        items: { include: { copy: { include: { book: true } } } },
      },
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Auditor",
      action: "INVENTORY_AUDIT_FINALIZE",
      entity: "InventoryAudit",
      entityId: audit.id,
      newValue: {
        shelf: audit.shelf.code,
        matched: matchedCount,
        misplaced: misplacedCount,
        missing: missingCount,
      },
    });

    return NextResponse.json({ success: true, audit: completed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
