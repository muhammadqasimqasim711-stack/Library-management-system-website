import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};

    if (bookId) where.bookId = bookId;
    if (status) where.status = status;

    if (isAdmin(currentUser)) {
      if (userId) where.userId = userId;
    } else {
      // Regular users only see their own reservations
      where.userId = currentUser.id;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            isbn: true,
            coverUrl: true,
            classificationNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            memberId: true,
            fullName: true,
            email: true,
            memberType: true,
          },
        },
        assignedCopy: {
          select: {
            id: true,
            barcode: true,
            shelf: { select: { code: true, name: true } },
          },
        },
      },
      orderBy: [{ bookId: "asc" }, { queuePosition: "asc" }],
    });

    return NextResponse.json({ reservations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookId, targetUserId } = body;

    const reservationUserId = targetUserId || currentUser.id;

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required." }, { status: 400 });
    }

    // Verify member exists and is active
    const member = await prisma.user.findUnique({
      where: { id: reservationUserId },
      include: {
        reservations: { where: { status: { in: ["PENDING", "ON_HOLD"] } } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    if (member.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Cannot place reservation: Member account status is ${member.status}.` },
        { status: 400 }
      );
    }

    // Check reservation limit based on borrowing policy
    const policy = await prisma.borrowingPolicy.findUnique({
      where: { memberType: member.memberType },
    }) || { reservationLimit: 3 };

    if (member.reservations.length >= policy.reservationLimit) {
      return NextResponse.json(
        { error: `Reservation quota reached: Member currently has ${member.reservations.length} active reservations (limit is ${policy.reservationLimit}).` },
        { status: 400 }
      );
    }

    // Check if member already reserved this exact book
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        bookId,
        userId: member.id,
        status: { in: ["PENDING", "ON_HOLD"] },
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "You already have an active hold / reservation for this book." },
        { status: 409 }
      );
    }

    // Calculate next queue position
    const currentQueueLength = await prisma.reservation.count({
      where: {
        bookId,
        status: "PENDING",
      },
    });
    const nextQueuePosition = currentQueueLength + 1;

    // Check if there happens to be an available copy right now
    const availableCopy = await prisma.bookCopy.findFirst({
      where: {
        bookId,
        status: "AVAILABLE",
      },
    });

    let newReservation;
    if (availableCopy) {
      // Put copy directly on hold
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      newReservation = await prisma.$transaction(async (tx) => {
        await tx.bookCopy.update({
          where: { id: availableCopy.id },
          data: { status: "ON_HOLD" },
        });

        const res = await tx.reservation.create({
          data: {
            bookId,
            userId: member.id,
            copyId: availableCopy.id,
            queuePosition: 1,
            status: "ON_HOLD",
            notifiedAt: new Date(),
            expiresAt,
          },
        });

        await tx.notification.create({
          data: {
            userId: member.id,
            title: "Hold Confirmed - Ready for Pickup",
            message: `A copy (${availableCopy.barcode}) is ready for pickup at the Main Circulation Desk. Collect within 48 hours.`,
            type: "RESERVATION_AVAILABLE",
          },
        });

        return res;
      });
    } else {
      newReservation = await prisma.reservation.create({
        data: {
          bookId,
          userId: member.id,
          queuePosition: nextQueuePosition,
          status: "PENDING",
        },
      });
    }

    await logAudit({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: "RESERVATION_CREATE",
      entity: "Reservation",
      entityId: newReservation.id,
      newValue: { bookId, member: member.memberId, queuePosition: newReservation.queuePosition },
    });

    return NextResponse.json({ success: true, reservation: newReservation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { assignedCopy: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (reservation.userId !== currentUser.id && !isAdmin(currentUser)) {
      return NextResponse.json(
        { error: "Access Denied: You cannot cancel another member's reservation." },
        { status: 403 }
      );
    }

    // Cancel reservation and release copy if it was ON_HOLD
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      if (reservation.assignedCopy && reservation.status === "ON_HOLD") {
        // Check if there is another member waiting in queue
        const nextInQueue = await tx.reservation.findFirst({
          where: {
            bookId: reservation.bookId,
            status: "PENDING",
          },
          orderBy: { queuePosition: "asc" },
        });

        if (nextInQueue) {
          const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
          await tx.reservation.update({
            where: { id: nextInQueue.id },
            data: {
              status: "ON_HOLD",
              copyId: reservation.assignedCopy.id,
              notifiedAt: new Date(),
              expiresAt,
            },
          });
        } else {
          await tx.bookCopy.update({
            where: { id: reservation.assignedCopy.id },
            data: { status: "AVAILABLE" },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Reservation cancelled." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
