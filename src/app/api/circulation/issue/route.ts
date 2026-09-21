import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { issueBookCopy } from "@/lib/circulation";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!hasPermission(user, "LOAN_ISSUE")) {
      return NextResponse.json(
        { error: "Access Denied: You do not possess the LOAN_ISSUE permission." },
        { status: 403 }
      );
    }

    const { memberId, copyBarcode } = await req.json();
    if (!memberId || !copyBarcode) {
      return NextResponse.json(
        { error: "Member ID and Copy Barcode are required." },
        { status: 400 }
      );
    }

    const result = await issueBookCopy({
      memberId,
      copyBarcode,
      staffId: user?.id,
      staffName: user?.fullName,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
