import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { checkMemberEligibility } from "@/lib/circulation";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(user) && !hasPermission(user, "LOAN_VIEW") && !hasPermission(user, "BOOK_ISSUE") && !hasPermission(user, "LOAN_ISSUE")) {
      return NextResponse.json(
        { error: "Forbidden: Circulation permissions required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId")?.trim();
    const bookId = searchParams.get("bookId")?.trim() || undefined;

    if (!memberId) {
      return NextResponse.json({ error: "memberId parameter is required" }, { status: 400 });
    }

    const result = await checkMemberEligibility({ memberId, bookId });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
