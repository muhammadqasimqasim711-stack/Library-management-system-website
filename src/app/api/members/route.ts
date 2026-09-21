import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const memberType = searchParams.get("memberType");
    const status = searchParams.get("status");

    const where: any = {};
    if (memberType) where.memberType = memberType;
    if (status) where.status = status;

    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { memberId: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const members = await prisma.user.findMany({
      where,
      include: {
        department: true,
        roles: { include: { role: true } },
        loans: {
          where: { status: { in: ["ACTIVE", "OVERDUE"] } },
          include: { copy: { include: { book: true } } },
        },
        fines: {
          where: { status: "PENDING" },
        },
        _count: {
          select: {
            loans: true,
            reservations: true,
            fines: true,
          },
        },
      },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!hasPermission(user, "STAFF_MANAGE")) {
      return NextResponse.json(
        { error: "Access Denied: You do not possess the STAFF_MANAGE permission." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { memberId, email, fullName, phone, memberType, departmentId, roleName } = body;

    if (!memberId || !email || !fullName || !memberType) {
      return NextResponse.json(
        { error: "Member ID, Email, Full Name, and Member Type are required." },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await prisma.user.findFirst({
      where: { OR: [{ memberId }, { email }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: `A member with ID "${memberId}" or Email "${email}" already exists.` },
        { status: 409 }
      );
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          memberId,
          email,
          fullName,
          phone: phone || null,
          memberType,
          status: "ACTIVE",
          departmentId: departmentId || null,
          passwordHash: "pbkdf2_sha256$mock$salt$password123",
        },
      });

      const assignedRole = roleName || (memberType === "STUDENT" ? "STUDENT" : memberType === "FACULTY" ? "FACULTY" : "LIBRARIAN");
      const roleRecord = await tx.role.findUnique({ where: { name: assignedRole } });
      if (roleRecord) {
        await tx.userRole.create({
          data: { userId: created.id, roleId: roleRecord.id },
        });
      }

      return created;
    });

    await logAudit({
      actorId: user?.id,
      actorName: user?.fullName || "Admin",
      action: "USER_CREATE",
      entity: "User",
      entityId: newUser.id,
      newValue: { memberId: newUser.memberId, fullName: newUser.fullName, type: newUser.memberType },
    });

    return NextResponse.json({ success: true, member: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
