import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const policies = await prisma.borrowingPolicy.findMany({
      orderBy: { memberType: "asc" },
    });
    return NextResponse.json({ policies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const {
      memberType,
      maxActiveLoans,
      loanDurationDays,
      maxRenewals,
      reservationLimit,
      dailyFineRate,
      gracePeriodDays,
      lostBookMultiplier,
      allowRenewIfReserved,
    } = body;

    if (!memberType) {
      return NextResponse.json({ error: "Member Type is required." }, { status: 400 });
    }

    const existing = await prisma.borrowingPolicy.findUnique({
      where: { memberType },
    });

    const updated = await prisma.borrowingPolicy.upsert({
      where: { memberType },
      update: {
        maxActiveLoans: parseInt(maxActiveLoans, 10),
        loanDurationDays: parseInt(loanDurationDays, 10),
        maxRenewals: parseInt(maxRenewals, 10),
        reservationLimit: parseInt(reservationLimit, 10),
        dailyFineRate: parseFloat(dailyFineRate),
        gracePeriodDays: parseInt(gracePeriodDays, 10),
        lostBookMultiplier: parseFloat(lostBookMultiplier),
        allowRenewIfReserved: Boolean(allowRenewIfReserved),
      },
      create: {
        memberType,
        maxActiveLoans: parseInt(maxActiveLoans, 10),
        loanDurationDays: parseInt(loanDurationDays, 10),
        maxRenewals: parseInt(maxRenewals, 10),
        reservationLimit: parseInt(reservationLimit, 10),
        dailyFineRate: parseFloat(dailyFineRate),
        gracePeriodDays: parseInt(gracePeriodDays, 10),
        lostBookMultiplier: parseFloat(lostBookMultiplier),
        allowRenewIfReserved: Boolean(allowRenewIfReserved),
      },
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Director",
      action: "POLICY_UPDATE",
      entity: "BorrowingPolicy",
      entityId: memberType,
      oldValue: existing,
      newValue: updated,
    });

    return NextResponse.json({ success: true, policy: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
