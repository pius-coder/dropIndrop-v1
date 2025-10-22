import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { paymentService } from "@/lib/services/payment-service";

const prisma = new PrismaClient();

/**
 * POST /api/payments/webhook
 * Handle payment status updates from payment gateways
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, status, amount, orderId } = body;

    if (!paymentIntentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: paymentIntentId, status" },
        { status: 400 }
      );
    }

    // Verify the payment status with the payment service
    const verification = await paymentService.verifyPaymentIntent(
      paymentIntentId
    );

    if (!verification) {
      return NextResponse.json(
        { error: "Payment intent not found" },
        { status: 404 }
      );
    }

    // Find the order associated with this payment intent
    const order = await prisma.order.findFirst({
      where: {
        paymentIntentId: paymentIntentId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found for payment intent" },
        { status: 404 }
      );
    }

    // Update order status based on payment status
    let updateData: any = {};
    let paidAt = null;

    switch (status) {
      case "succeeded":
        updateData.status = "PAID";
        paidAt = new Date();
        break;
      case "failed":
      case "cancelled":
        updateData.status = "CANCELLED";
        break;
      case "expired":
        updateData.status = "CANCELLED";
        break;
      default:
        updateData.status = "PENDING";
    }

    if (paidAt) {
      updateData.paidAt = paidAt;
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        customer: {
          select: {
            username: true,
            email: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // TODO: Send WhatsApp notification to customer about payment status
    // TODO: Generate ticket for paid orders
    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        totalAmount: Number(updatedOrder.totalAmount),
        paidAt: updatedOrder.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
