import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;

    if (isAdmin(currentUser)) {
      if (userId) where.userId = userId;
    } else {
      // Regular users only see their own fines
      where.userId = currentUser.id;
    }

    const fines = await prisma.fine.findMany({
      where,
      include: {
        user: { select: { id: true, memberId: true, fullName: true, email: true, memberType: true } },
        loan: {
          include: {
            copy: { include: { book: true } },
          },
        },
        waivedBy: { select: { fullName: true, memberId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalOutstanding = fines
      .filter((f) => f.status === "PENDING" || f.status === "PARTIAL")
      .reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);

    const totalCollected = fines
      .reduce((acc, f) => acc + f.paidAmount, 0);

    const totalWaived = fines
      .filter((f) => f.status === "WAIVED")
      .reduce((acc, f) => acc + f.amount, 0);

    return NextResponse.json({
      fines,
      metrics: {
        totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
        totalCollected: parseFloat(totalCollected.toFixed(2)),
        totalWaived: parseFloat(totalWaived.toFixed(2)),
        totalCount: fines.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Payment collection
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(user) && !hasPermission(user, "FINE_MANAGE")) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { fineId, paymentAmount } = body;

    if (!fineId || !paymentAmount) {
      return NextResponse.json(
        { error: "Fine ID and Payment Amount are required." },
        { status: 400 }
      );
    }

    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: { user: true },
    });

    if (!fine) {
      return NextResponse.json({ error: "Fine not found." }, { status: 404 });
    }

    if (fine.status === "PAID" || fine.status === "WAIVED") {
      return NextResponse.json(
        { error: `This fine has already been settled (Status: ${fine.status}).` },
        { status: 400 }
      );
    }

    const newPaidAmount = fine.paidAmount + parseFloat(paymentAmount);
    const newStatus = newPaidAmount >= fine.amount ? "PAID" : "PARTIAL";

    const updated = await prisma.fine.update({
      where: { id: fine.id },
      data: {
        paidAmount: Math.min(newPaidAmount, fine.amount),
        status: newStatus,
      },
    });

    // Check if user still has any pending fines; if not and status was RESTRICTED, restore to ACTIVE
    const remainingPendingFines = await prisma.fine.count({
      where: {
        userId: fine.userId,
        status: { in: ["PENDING", "PARTIAL"] },
      },
    });

    if (remainingPendingFines === 0 && fine.user.status === "RESTRICTED") {
      await prisma.user.update({
        where: { id: fine.userId },
        data: { status: "ACTIVE" },
      });
    }

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Circulation Staff",
      action: "FINE_PAYMENT",
      entity: "Fine",
      entityId: fine.id,
      newValue: { paidAmount: paymentAmount, status: newStatus, member: fine.user.memberId },
    });

    return NextResponse.json({ success: true, fine: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fine Waiver (Requires Director / Super Admin permission FINE_WAIVE and mandatory reason)
export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(user) && !hasPermission(user, "FINE_WAIVE")) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { fineId, waiveReason } = body;

    if (!fineId || !waiveReason?.trim()) {
      return NextResponse.json(
        { error: "Fine ID and a formal waiver reason are mandatory for institutional audit compliance." },
        { status: 400 }
      );
    }

    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: { user: true },
    });

    if (!fine) {
      return NextResponse.json({ error: "Fine not found." }, { status: 404 });
    }

    const waived = await prisma.fine.update({
      where: { id: fine.id },
      data: {
        status: "WAIVED",
        waivedById: user?.id,
        waivedAt: new Date(),
        waiveReason: waiveReason.trim(),
      },
    });

    // Check if member should be restored to ACTIVE
    const remainingPendingFines = await prisma.fine.count({
      where: {
        userId: fine.userId,
        status: { in: ["PENDING", "PARTIAL"] },
      },
    });

    if (remainingPendingFines === 0 && fine.user.status === "RESTRICTED") {
      await prisma.user.update({
        where: { id: fine.userId },
        data: { status: "ACTIVE" },
      });
    }

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Director",
      action: "FINE_WAIVE",
      entity: "Fine",
      entityId: fine.id,
      oldValue: { amount: fine.amount, status: fine.status },
      newValue: { status: "WAIVED", waiveReason: waiveReason.trim(), waivedBy: user?.fullName },
    });

    return NextResponse.json({ success: true, fine: waived });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
