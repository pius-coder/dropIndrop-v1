import { NextRequest, NextResponse } from "next/server";
import { DashboardService } from "../../../../lib/services/dashboard-service";
import { ProductRepository } from "../../../../entities/product/domain/product-repository";
import { CategoryRepository } from "../../../../entities/category/domain/category-repository";
import { OrderRepository } from "../../../../entities/order/domain/order-repository";
import { UserRepository } from "../../../../entities/user/domain/user-repository";
import { WhatsAppGroupRepository } from "../../../../entities/whatsapp/domain/whatsapp-group-repository";
import { ConfigurationRepository } from "../../../../entities/configuration/domain/configuration-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const productRepository = new ProductRepository(prisma);
const categoryRepository = new CategoryRepository(prisma);
const orderRepository = new OrderRepository(prisma);
const userRepository = new UserRepository(prisma);
const whatsappGroupRepository = new WhatsAppGroupRepository(prisma);
const configurationRepository = new ConfigurationRepository(prisma);

// Initialize dashboard service
const dashboardService = new DashboardService(
  prisma,
  productRepository,
  categoryRepository,
  orderRepository,
  userRepository,
  whatsappGroupRepository,
  configurationRepository
);

/**
 * GET /api/admin/dashboard
 * Get comprehensive dashboard data
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

    console.log("Fetching dashboard data...");

    // Get dashboard data from service
    const dashboardData = await dashboardService.getDashboardData();

    console.log("Dashboard data fetched successfully:", {
      totalProducts: dashboardData.stats.totalProducts,
      totalOrders: dashboardData.stats.totalOrders,
      totalUsers: dashboardData.stats.totalUsers,
      totalGroups: dashboardData.stats.totalGroups,
      recentOrders: dashboardData.recentOrders.length,
      setupProgress: dashboardData.stats.setupProgress,
      isSetupComplete: dashboardData.isSetupComplete,
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
