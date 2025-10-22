import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";
import { OrderService } from "../../../../entities/order/domain/order-service";
import { ConfigurationRepository } from "../../../../entities/configuration/domain/configuration-repository";

const prisma = new PrismaClient();
const configurationRepository = new ConfigurationRepository(prisma);
const orderService = new OrderService(prisma, configurationRepository);

/**
 * GET /api/orders/[id]
 * Get a specific order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);
    if (authResult.response) {
      return authResult.response;
    }

    const user = authResult.user!;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = (await params).id;

    // Get the order
    const order = await orderService.getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user can access this order
    if (user.role === UserRole.CLIENT && order.customerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders/[id]/pay
 * Process payment for a specific order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);
    if (authResult.response) {
      return authResult.response;
    }

    const user = authResult.user!;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { action } = body;

    // Check if user owns this order (clients can only pay for their own orders)
    if (user.role === UserRole.CLIENT) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true, status: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.customerId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      if (order.status !== "PENDING") {
        return NextResponse.json(
          { error: "Order is not in a payable state" },
          { status: 400 }
        );
      }
    }

    // Handle different actions
    if (action === "initiate_payment") {
      // Process payment
      const paymentResult = await orderService.processPayment(orderId);

      if (!paymentResult.success) {
        return NextResponse.json({ error: paymentResult.error }, { status: 400 });
      }

      return NextResponse.json(paymentResult);
    }

    // Default action - process payment directly
    const paymentResult = await orderService.processPayment(orderId);

    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.error }, { status: 400 });
    }

    return NextResponse.json(paymentResult);
  } catch (error) {
    console.error("Process payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
