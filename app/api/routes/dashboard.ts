/**
 * Dashboard Routes
 * 
 * Dashboard statistics and analytics
 */

import { Hono } from "hono";
import { prisma } from "@/lib/db";
import { authMiddleware, type AuthContext } from "@/lib/api/middleware/auth";

const app = new Hono<AuthContext>();

/**
 * GET /dashboard/stats
 * Get dashboard statistics
 */
app.get("/stats", authMiddleware, async (c) => {
  try {
    // Articles stats
    const [totalArticles, lowStockArticles, outOfStockArticles] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({
        where: {
          stock: {
            gt: 0,
            lte: 10,
          },
        },
      }),
      prisma.article.count({
        where: {
          stock: 0,
        },
      }),
    ]);

    // Drops stats
    const [totalDrops, draftDrops, scheduledDrops, sentDrops] = await Promise.all([
      prisma.drop.count(),
      prisma.drop.count({
        where: { status: "DRAFT" },
      }),
      prisma.drop.count({
        where: { status: "SCHEDULED" },
      }),
      prisma.drop.count({
        where: { status: "SENT" },
      }),
    ]);

    // Orders stats
    const [totalOrders, pendingOrders, paidOrders, pickedUpOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { paymentStatus: "PENDING" },
      }),
      prisma.order.count({
        where: { paymentStatus: "PAID" },
      }),
      prisma.order.count({
        where: { pickupStatus: "PICKED_UP" },
      }),
    ]);

    // Revenue stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: today,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: weekAgo,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: monthAgo,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return c.json({
      articles: {
        total: totalArticles,
        lowStock: lowStockArticles,
        outOfStock: outOfStockArticles,
      },
      drops: {
        total: totalDrops,
        draft: draftDrops,
        scheduled: scheduledDrops,
        sent: sentDrops,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        paid: paidOrders,
        pickedUp: pickedUpOrders,
      },
      revenue: {
        today: todayRevenue._sum?.amount?.toNumber() || 0,
        thisWeek: weekRevenue._sum?.amount?.toNumber() || 0,
        thisMonth: monthRevenue._sum?.amount?.toNumber() || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return c.json(
      {
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des statistiques",
      },
      500
    );
  }
});

export default app;
