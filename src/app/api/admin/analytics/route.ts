import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";
import { UserService } from "../../../../entities/user/domain/user-service";
import { UserRepository } from "../../../../entities/user/domain/user-repository";
import { ProductService } from "../../../../entities/product/domain/product-service";
import { ProductRepository } from "../../../../entities/product/domain/product-repository";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const userRepository = new UserRepository(prisma);
const userService = new UserService({
  userRepository,
  prisma,
});

const productRepository = new ProductRepository(prisma);
const productService = new ProductService({
  productRepository,
  categoryRepository: null, // Will be added when CategoryService is implemented
  prisma,
});

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await authMiddleware(request, {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    });

    // If middleware returned an error response, return it
    if (authResult.response) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d

    // Calculate date range based on period
    const now = new Date();
    const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get user analytics
    const userAnalyticsResult = await userService.getAllUsersAnalytics();

    // Get product view analytics
    const topProducts = await prisma.product.findMany({
      orderBy: { viewCount: "desc" },
      take: 10,
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    // Get recent orders analytics
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        customer: {
          select: { username: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Calculate revenue analytics
    const totalRevenue = recentOrders
      .filter((order) => order.status === "DELIVERED")
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);

    const averageOrderValue =
      recentOrders.length > 0
        ? totalRevenue /
          recentOrders.filter((order) => order.status === "DELIVERED").length
        : 0;

    // Get user growth data (users created in the period)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get order status distribution
    const orderStatusStats = await prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        status: true,
      },
    });

    // Get top customers by spending
    const topCustomers = await prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      include: {
        customerOrders: {
          where: {
            status: "DELIVERED",
            createdAt: {
              gte: startDate,
            },
          },
          select: { totalAmount: true },
        },
      },
      take: 10,
    });

    const topCustomersWithSpending = topCustomers
      .map((user) => ({
        userId: user.id,
        username: user.username,
        email: user.email,
        totalSpent: user.customerOrders.reduce(
          (sum, order) => sum + Number(order.totalAmount),
          0
        ),
      }))
      .filter((customer) => customer.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      success: true,
      data: {
        period,
        userAnalytics: userAnalyticsResult.success
          ? userAnalyticsResult.data
          : null,
        productAnalytics: {
          topViewedProducts: topProducts.map((product) => ({
            id: product.id,
            name: product.name,
            viewCount: product.viewCount,
            categoryName: product.category?.name || "Uncategorized",
          })),
        },
        revenueAnalytics: {
          totalRevenue,
          averageOrderValue,
          totalOrders: recentOrders.length,
          deliveredOrders: recentOrders.filter(
            (order) => order.status === "DELIVERED"
          ).length,
        },
        growthMetrics: {
          newUsers,
          newOrders: recentOrders.length,
        },
        orderStatusDistribution: orderStatusStats.map((stat) => ({
          status: stat.status,
          count: stat._count.status,
        })),
        topCustomers: topCustomersWithSpending,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    });
  } catch (error) {
    console.error("Error getting analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
