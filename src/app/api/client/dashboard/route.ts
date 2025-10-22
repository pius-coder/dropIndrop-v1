import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { clientAuthMiddleware } from "../../../../lib/middleware/client-auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

/**
 * GET /api/client/dashboard
 * Get client dashboard data (orders and tickets)
 */
export async function GET(request: NextRequest) {
  try {
    // Check client authentication
    const authResult = await clientAuthMiddleware(request);

    // If middleware returned an error response, return it
    if (authResult.response) {
      return authResult.response;
    }

    // User is authenticated
    const user = authResult.user;
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user's orders with product details through OrderItem
    const orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user's tickets with order details
    const tickets = await prisma.ticket.findMany({
      where: { usedBy: user.id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format orders for client (handle multiple products per order)
    const formattedOrders = orders.map((order) => {
      // For now, take the first product (assuming one product per order as per spec)
      const firstItem = order.items[0];
      if (!firstItem) {
        return null;
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        product: {
          id: firstItem.product.id,
          name: firstItem.product.name,
          description: firstItem.product.description,
          price: Number(firstItem.product.price),
          images: firstItem.product.images,
        },
      };
    }).filter(Boolean); // Remove null entries

    // Format tickets for client
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      uniqueCode: ticket.uniqueCode,
      qrCodeData: ticket.qrCodeData,
      isUsed: ticket.isUsed,
      usedAt: ticket.usedAt?.toISOString(),
      expiresAt: ticket.expiresAt.toISOString(),
      createdAt: ticket.createdAt.toISOString(),
      order: {
        id: ticket.order.id,
        orderNumber: ticket.order.orderNumber,
        totalAmount: Number(ticket.order.totalAmount),
        status: ticket.order.status,
      },
    }));

    // Prepare client data
    const clientData = {
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      orders: formattedOrders,
      tickets: formattedTickets,
    };

    return NextResponse.json({
      success: true,
      data: clientData,
    });
  } catch (error) {
    console.error("Error getting client dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
