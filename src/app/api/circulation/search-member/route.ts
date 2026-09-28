import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const member = await prisma.user.findFirst({
      where: {
        OR: [
          { memberId: { equals: query } },
          { email: { equals: query } },
          { id: { equals: query } },
        ],
      },
      include: {
        department: true,
        loans: {
          where: { status: { in: ["ACTIVE", "OVERDUE"] } },
          include: {
            copy: {
              include: {
                book: true,
                shelf: true,
              },
            },
          },
          orderBy: { dueDate: "asc" },
        },
        fines: {
          where: { status: "PENDING" },
        },
        reservations: {
          where: { status: { in: ["PENDING", "ON_HOLD"] } },
          include: { book: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: `Member "${query}" not found.` }, { status: 404 });
    }

    // Get policy for this member type
    const policy = await prisma.borrowingPolicy.findUnique({
      where: { memberType: member.memberType },
    });

    const maxLoans = member.borrowingLimitOverride || policy?.maxActiveLoans || 5;
    const totalPendingFines = member.fines.reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);

    return NextResponse.json({
      member: {
        id: member.id,
        memberId: member.memberId,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        memberType: member.memberType,
        status: member.status,
        department: member.department?.name,
        maxLoans,
        activeLoansCount: member.loans.length,
        isEligible: member.status === "ACTIVE" && member.loans.length < maxLoans,
        totalPendingFines,
        loans: member.loans,
        fines: member.fines,
        reservations: member.reservations,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
