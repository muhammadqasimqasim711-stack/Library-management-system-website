import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { memberId } = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { memberId },
          { id: memberId },
          { email: memberId },
        ],
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cookieStore = cookies();
    cookieStore.set("ulms_active_user", user.memberId, {
      path: "/",
      httpOnly: false, // Accessible to client if needed
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        memberId: user.memberId,
        fullName: user.fullName,
        email: user.email,
        memberType: user.memberType,
        roles: user.roles.map((r) => r.role.name),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
