import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderService } from "../../../../entities/order/domain/order-service";

const prisma = new PrismaClient();

// Initialize services
const orderService = new OrderService(prisma);

/**
 * POST /api/payment/callback
 * Handle payment callbacks from Lygos payment gateway
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, transaction_id, amount } = body;

    console.log("Payment callback received:", {
      order_id,
      status,
      transaction_id,
      amount,
    });

    // Validate required fields
    if (!order_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: order_id, status" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      console.error("Order not found for payment callback:", order_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status based on payment status
    let updateData: any = {};

    switch (status) {
      case "paid":
        updateData.status = "PAID";
        updateData.paidAt = new Date();
        break;
      case "failed":
        updateData.status = "CANCELLED";
        break;
      case "cancelled":
        updateData.status = "CANCELLED";
        break;
      case "expired":
        updateData.status = "CANCELLED";
        break;
      default:
        console.warn("Unknown payment status:", status);
        return NextResponse.json(
          { error: "Unknown payment status" },
          { status: 400 }
        );
    }

    // Update the order
    await prisma.order.update({
      where: { id: order_id },
      data: updateData,
    });

    console.log("Order updated successfully:", {
      order_id,
      status,
      newStatus: updateData.status,
    });

    // If payment was successful, we could trigger ticket generation here
    // For now, we'll let a separate process handle ticket generation

    return NextResponse.json({
      success: true,
      message: "Payment callback processed successfully",
    });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/callback
 * Alternative callback method for GET requests (if Lygos supports it)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const order_id = searchParams.get("order_id");
  const status = searchParams.get("status");
  const transaction_id = searchParams.get("transaction_id");

  if (!order_id || !status) {
    return NextResponse.json(
      { error: "Missing required parameters: order_id, status" },
      { status: 400 }
    );
  }

  // Process the callback (reuse the POST logic)
  const mockBody = { order_id, status, transaction_id };
  const mockRequest = new NextRequest(request.url, {
    method: "POST",
    body: JSON.stringify(mockBody),
    headers: { "content-type": "application/json" },
  });

  return POST(mockRequest);
}
