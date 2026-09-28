import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin, hasPermission } from "@/lib/auth";
import { returnBookCopy } from "@/lib/circulation";

export async function POST(req: Request) {
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

    const body = await req.json();
    const {
      copyBarcode,
      condition,
      notes,
      isDamaged,
      damageSeverity,
      damageDescription,
    } = body;

    if (!copyBarcode) {
      return NextResponse.json(
        { error: "Copy Barcode is required." },
        { status: 400 }
      );
    }

    const result = await returnBookCopy({
      copyBarcode,
      condition,
      staffId: user?.id,
      staffName: user?.fullName,
      notes,
      isDamaged,
      damageSeverity,
      damageDescription,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
