import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";
import { OrderService } from "../../../../entities/order/domain/order-service";

const prisma = new PrismaClient();
const orderService = new OrderService(prisma);

export interface AdminOrderFilters {
  status?: OrderStatus;
  customerId?: string;
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * GET /api/admin/orders
 * Get all orders with admin filtering capabilities
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authMiddleware(request);
    if (authResult.response) {
      return authResult.response;
    }

    const user = authResult.user!;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: AdminOrderFilters = {
      status: (searchParams.get("status") as OrderStatus) || undefined,
      customerId: searchParams.get("customerId") || undefined,
      productId: searchParams.get("productId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    };

    // Build Prisma filters
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: "insensitive" } },
        {
          customer: {
            username: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          customer: {
            email: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    // Handle product filtering through order items
    if (filters.productId) {
      where.items = {
        some: {
          productId: filters.productId,
        },
      };
    }

    // Get orders using the order service
    const result = await orderService.getAllOrders({
      status: filters.status,
      customerId: filters.customerId,
      productId: filters.productId,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      search: filters.search,
      page: filters.page!,
      limit: filters.limit!,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get admin orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Update order status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authMiddleware(request);
    if (authResult.response) {
      return authResult.response;
    }

    const user = authResult.user!;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status, notes, deliveredBy } = body;

    // Validate required fields
    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PAID",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate status transitions
    if (
      currentOrder.status === "DELIVERED" ||
      currentOrder.status === "CANCELLED"
    ) {
      return NextResponse.json(
        { error: "Cannot change status of delivered or cancelled orders" },
        { status: 400 }
      );
    }

    if (status === "PAID" && !currentOrder.paymentIntentId) {
      return NextResponse.json(
        { error: "Cannot mark as paid without payment intent" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
      if (deliveredBy) {
        updateData.deliveredBy = deliveredBy;
      }
    }

    if (status === "PAID" && currentOrder.status === "PENDING") {
      updateData.paidAt = new Date();
    }

    // Update order using the order service
    const result = await orderService.updateOrderStatus(
      orderId,
      status,
      notes,
      deliveredBy
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
