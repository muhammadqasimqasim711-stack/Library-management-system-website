import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { issueBookCopy } from "@/lib/circulation";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(user) && !hasPermission(user, "BOOK_ISSUE") && !hasPermission(user, "LOAN_ISSUE")) {
      return NextResponse.json(
        { error: "Forbidden: Issuance permission required" },
        { status: 403 }
      );
    }

    const { memberId, copyBarcode, copyId } = await req.json();
    if (!memberId || (!copyBarcode && !copyId)) {
      return NextResponse.json(
        { error: "Member ID and either Copy Barcode or Copy ID are required." },
        { status: 400 }
      );
    }

    const result = await issueBookCopy({
      memberId,
      copyBarcode,
      copyId,
      staffId: user?.id,
      staffName: user?.fullName,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
