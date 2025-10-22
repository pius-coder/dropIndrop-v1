import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../lib/middleware/auth-middleware";
import { OrderService } from "../../../entities/order/domain/order-service";

const prisma = new PrismaClient();
const orderService = new OrderService(prisma);

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { items } = body;

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item: productId and positive quantity required" },
          { status: 400 }
        );
      }
    }

    // Create order
    const result = await orderService.createOrder({
      customerId: user.id,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0, // Will be calculated from product
      })),
      createdById: user.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Get orders for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get orders based on user role
    let orders: any[] = [];
    if (user.role === UserRole.CLIENT) {
      // Clients can only see their own orders
      orders = await orderService.getOrdersByCustomer(user.id);
    } else {
      // Admin and delivery managers can see all orders
      // For now, return empty array - could be extended with filtering
      orders = [];
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
