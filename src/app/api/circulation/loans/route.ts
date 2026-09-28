import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search")?.trim();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (isAdmin(currentUser)) {
      if (userId) {
        whereClause.userId = userId;
      }
    } else {
      // Regular users can only view their own loans
      whereClause.userId = currentUser.id;
    }

    if (search) {
      whereClause.OR = [
        { copy: { barcode: { contains: search } } },
        { copy: { book: { title: { contains: search } } } },
        { user: { fullName: { contains: search } } },
        { user: { memberId: { contains: search } } },
      ];
    }

    const loans = await prisma.loan.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, memberId: true, fullName: true, email: true, memberType: true },
        },
        copy: {
          include: {
            book: true,
            shelf: { include: { section: true } },
          },
        },
        fines: true,
      },
      orderBy: { issuedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ loans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
