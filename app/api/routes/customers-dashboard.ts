/**
 * Customer Dashboard API Route
 * Provides dashboard data for authenticated customers
 */

import { Hono } from "hono";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const app = new Hono();

/**
 * Get customer dashboard data
 */
app.get("/dashboard", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    ) as any;

    if (payload.type !== "customer") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const customer = await prisma.customer.findUnique({
      where: { id: payload.customerId },
      include: {
        orders: {
          where: {
            paymentStatus: "PAID",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
          include: {
            article: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // Get active tickets (orders with PENDING or PAID status)
    const activeTickets = await prisma.order.findMany({
      where: {
        customerId: payload.customerId,
        paymentStatus: "PAID",
        pickupStatus: {
          in: ["PENDING", "PICKED_UP"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        article: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    });

    // Calculate stats
    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + Number(order.amount),
      0
    );

    return c.json({
      stats: {
        totalOrders,
        totalSpent,
        activeTickets: activeTickets.length,
        memberSince: customer.createdAt.toISOString(),
      },
      recentOrders: customer.orders,
      activeTickets,
    });
  } catch (error) {
    console.error("Error fetching customer dashboard:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
