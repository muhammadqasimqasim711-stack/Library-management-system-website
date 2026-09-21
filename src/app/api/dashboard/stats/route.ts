import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      overdueCopies,
      reservedCopies,
      lostCopies,
      damagedCopies,
      missingCopies,
      repairCopies,
      totalMembers,
      studentsCount,
      facultyCount,
      activeLoansCount,
      pendingReservationsCount,
      fines,
      categoriesWithCount,
      recentLoans,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.book.count({ where: { isArchived: false } }),
      prisma.bookCopy.count(),
      prisma.bookCopy.count({ where: { status: "AVAILABLE" } }),
      prisma.bookCopy.count({ where: { status: "BORROWED" } }),
      prisma.loan.count({ where: { status: "OVERDUE" } }),
      prisma.bookCopy.count({ where: { status: { in: ["RESERVED", "ON_HOLD"] } } }),
      prisma.bookCopy.count({ where: { status: "LOST" } }),
      prisma.bookCopy.count({ where: { status: "DAMAGED" } }),
      prisma.bookCopy.count({ where: { status: "MISSING" } }),
      prisma.bookCopy.count({ where: { status: "UNDER_REPAIR" } }),
      prisma.user.count(),
      prisma.user.count({ where: { memberType: "STUDENT" } }),
      prisma.user.count({ where: { memberType: "FACULTY" } }),
      prisma.loan.count({ where: { status: "ACTIVE" } }),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.fine.findMany({ select: { amount: true, paidAmount: true, status: true } }),
      prisma.category.findMany({
        select: {
          name: true,
          _count: { select: { books: true } },
        },
      }),
      prisma.loan.findMany({
        take: 5,
        orderBy: { issuedAt: "desc" },
        include: {
          user: { select: { fullName: true, memberId: true } },
          copy: { include: { book: { select: { title: true } } } },
        },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const outstandingFines = fines
      .filter((f) => f.status === "PENDING" || f.status === "PARTIAL")
      .reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);

    const collectedFines = fines
      .reduce((acc, f) => acc + f.paidAmount, 0);

    // Simulated 7-day circulation trends for charts
    const now = new Date();
    const circulationTrends = [
      { day: "Mon", issues: 42, returns: 38 },
      { day: "Tue", issues: 55, returns: 49 },
      { day: "Wed", issues: 63, returns: 58 },
      { day: "Thu", issues: 71, returns: 64 },
      { day: "Fri", issues: 48, returns: 52 },
      { day: "Sat", issues: 24, returns: 19 },
      { day: "Sun", issues: 18, returns: 12 },
    ];

    return NextResponse.json({
      kpis: {
        totalBooks,
        totalCopies,
        availableCopies,
        borrowedCopies,
        overdueCopies,
        reservedCopies,
        lostCopies,
        damagedCopies,
        missingCopies,
        repairCopies,
        totalMembers,
        studentsCount,
        facultyCount,
        activeLoansCount,
        pendingReservationsCount,
        outstandingFines: parseFloat(outstandingFines.toFixed(2)),
        collectedFines: parseFloat(collectedFines.toFixed(2)),
      },
      circulationTrends,
      categoryDistribution: categoriesWithCount.map((c) => ({
        name: c.name,
        count: c._count.books,
      })),
      recentLoans,
      recentAuditLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
