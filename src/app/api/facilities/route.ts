import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          include: { user: { select: { fullName: true, memberId: true } } },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ facilities });
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

    const body = await req.json();
    const { facilityId, startTime, endTime, purpose } = body;

    if (!facilityId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Facility ID, Start Time, and End Time are required." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return NextResponse.json(
        { error: "End time must be after start time." },
        { status: 400 }
      );
    }

    // Check conflict
    const conflict = await prisma.facilityBooking.findFirst({
      where: {
        facilityId,
        status: "CONFIRMED",
        OR: [
          { startTime: { lte: start }, endTime: { gt: start } },
          { startTime: { lt: end }, endTime: { gte: end } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "This facility is already reserved during the chosen timeframe." },
        { status: 409 }
      );
    }

    const booking = await prisma.facilityBooking.create({
      data: {
        facilityId,
        userId: user.id,
        startTime: start,
        endTime: end,
        purpose: purpose || "Academic Study / Research",
        status: "CONFIRMED",
      },
      include: { facility: true },
    });

    await logAudit({
      actorId: user.id,
      actorName: user.fullName,
      action: "FACILITY_BOOKING",
      entity: "FacilityBooking",
      entityId: booking.id,
      newValue: { facility: booking.facility.name, start: start.toISOString(), end: end.toISOString() },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
