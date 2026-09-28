import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [requests, orders, vendors, budgets] = await Promise.all([
      prisma.purchaseRequest.findMany({
        include: { requester: { select: { fullName: true, memberId: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.purchaseOrder.findMany({
        include: { vendor: true, request: true },
        orderBy: { orderedAt: "desc" },
      }),
      prisma.vendor.findMany({
        include: { _count: { select: { copies: true, purchaseOrders: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.budgetAllocation.findMany({
        orderBy: { category: "asc" },
      }),
    ]);

    return NextResponse.json({
      requests,
      orders,
      vendors,
      budgets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_REQUEST") {
      const { title, author, isbn, publisher, quantity = 1, estimatedCost = 50.0, reason } = body;
      const request = await prisma.purchaseRequest.create({
        data: {
          title,
          author: author || null,
          isbn: isbn || null,
          publisher: publisher || null,
          quantity: parseInt(quantity, 10),
          estimatedCost: parseFloat(estimatedCost),
          requesterId: user.id,
          reason: reason || null,
          status: "PENDING",
        },
      });

      await logAudit({
        actorId: user.id,
        actorName: user.fullName,
        action: "ACQUISITION_REQUEST",
        entity: "PurchaseRequest",
        entityId: request.id,
        newValue: { title, quantity, estimatedCost },
      });

      return NextResponse.json({ success: true, request }, { status: 201 });
    } else if (action === "APPROVE_REQUEST") {
      if (!hasPermission(user, "ACQUISITION_MANAGE")) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }

      const { requestId, vendorId } = body;
      const pr = await prisma.purchaseRequest.findUnique({ where: { id: requestId } });
      if (!pr) return NextResponse.json({ error: "Request not found" }, { status: 404 });

      const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

      const [updatedPr, newPo] = await prisma.$transaction([
        prisma.purchaseRequest.update({
          where: { id: requestId },
          data: { status: "ORDERED" },
        }),
        prisma.purchaseOrder.create({
          data: {
            orderNumber: poNumber,
            requestId: pr.id,
            vendorId,
            totalAmount: pr.estimatedCost * pr.quantity,
            status: "ISSUED",
          },
        }),
      ]);

      return NextResponse.json({ success: true, order: newPo, request: updatedPr });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
