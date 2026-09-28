import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.set("ulms_active_user", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
