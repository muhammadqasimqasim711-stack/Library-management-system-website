import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { renewLoan } from "@/lib/circulation";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { loanId } = await req.json();
    if (!loanId) {
      return NextResponse.json({ error: "Loan ID is required." }, { status: 400 });
    }

    // Check if user is renewing their own book or has LOAN_RENEW staff permission
    const targetLoan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!targetLoan) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    const isOwnLoan = targetLoan.userId === user.id;
    const canRenewOthers = hasPermission(user, "LOAN_RENEW");

    if (!isOwnLoan && !canRenewOthers) {
      return NextResponse.json(
        { error: "Access Denied: You cannot renew another member's loan." },
        { status: 403 }
      );
    }

    const result = await renewLoan({
      loanId,
      userId: user.id,
      actorName: user.fullName,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
