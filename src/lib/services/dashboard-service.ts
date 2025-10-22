import { PrismaClient } from "@prisma/client";
import { ProductRepository } from "../../entities/product/domain/product-repository";
import { CategoryRepository } from "../../entities/category/domain/category-repository";
import { OrderRepository } from "../../entities/order/domain/order-repository";
import { UserRepository } from "../../entities/user/domain/user-repository";
import { WhatsAppGroupRepository } from "../../entities/whatsapp/domain/whatsapp-group-repository";
import { ConfigurationRepository } from "../../entities/configuration/domain/configuration-repository";

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalGroups: number;
  recentOrders: number;
  setupProgress: number;
  activeProducts: number;
  pendingOrders: number;
  activeUsers: number;
  activeGroups: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

export interface SystemHealth {
  whatsappConnection: "connected" | "disconnected" | "error";
  paymentGateway: "active" | "inactive" | "error";
  database: "healthy" | "unhealthy" | "error";
  apiStatus: "operational" | "degraded" | "error";
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  systemHealth: SystemHealth;
  isSetupComplete: boolean;
}

/**
 * Dashboard service for aggregating data from all repositories
 */
export class DashboardService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly whatsappGroupRepository: WhatsAppGroupRepository,
    private readonly configurationRepository: ConfigurationRepository
  ) {}

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get counts from all entities using Prisma directly
      const [
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalUsers,
        activeUsers,
        totalGroups,
        activeGroups,
        configurationResult,
      ] = await Promise.all([
        this.prisma.product.count({}),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.order.count({}),
        this.prisma.order.count({ where: { status: "PENDING" } }),
        this.prisma.user.count({}),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.whatsAppGroup.count({}),
        this.prisma.whatsAppGroup.count({ where: { isActive: true } }),
        this.configurationRepository.findById("main"),
      ]);

      // Calculate setup progress
      let setupProgress = 0;
      if (configurationResult) {
        let completedFields = 0;
        const totalFields = 8;

        if (configurationResult.general.siteName) completedFields++;
        if (configurationResult.general.contactEmail) completedFields++;
        if (configurationResult.whatsapp.apiUrl) completedFields++;
        if (configurationResult.whatsapp.businessNumber) completedFields++;
        if (configurationResult.payments.provider) completedFields++;
        if (configurationResult.payments.enabled) completedFields++;
        if (configurationResult.notifications.emailNotifications !== undefined)
          completedFields++;
        if (configurationResult.isSetupComplete()) completedFields++;

        setupProgress = (completedFields / totalFields) * 100;
      }

      return {
        totalProducts,
        totalOrders,
        totalUsers,
        totalGroups,
        recentOrders: 0, // Will be calculated separately
        setupProgress,
        activeProducts,
        pendingOrders,
        activeUsers,
        activeGroups,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get recent orders for dashboard display
   */
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
      const orders = await this.prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              username: true,
              email: true,
            },
          },
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });

      return orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName:
          order.customer?.username || order.customer?.email || "Unknown",
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        itemCount:
          order.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          ) || 0,
      }));
    } catch (error) {
      console.error("Error getting recent orders:", error);
      return [];
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Check WhatsApp connection (mock for now - would need actual WAHA API check)
      const whatsappConnection: SystemHealth["whatsappConnection"] =
        "connected";

      // Check payment gateway based on configuration
      const paymentGateway = await this.getPaymentGatewayHealth();

      // Check database health
      let database: SystemHealth["database"] = "healthy";
      try {
        await this.prisma.$queryRaw`SELECT 1`;
      } catch {
        database = "error";
      }

      // API status is operational if we got this far
      const apiStatus: SystemHealth["apiStatus"] = "operational";

      return {
        whatsappConnection,
        paymentGateway,
        database,
        apiStatus,
      };
    } catch (error) {
      console.error("Error getting system health:", error);
      return {
        whatsappConnection: "error",
        paymentGateway: "error",
        database: "error",
        apiStatus: "error",
      };
    }
  }

  /**
   * Check payment gateway health based on configuration
   */
  private async getPaymentGatewayHealth(): Promise<
    SystemHealth["paymentGateway"]
  > {
    try {
      const configuration = await this.configurationRepository.findById("main");
      if (!configuration) {
        return "inactive";
      }

      if (!configuration.payments.enabled) {
        return "inactive";
      }

      // Check if provider is configured with necessary credentials
      switch (configuration.payments.provider) {
        case "lygos":
          if (!configuration.payments.lygosApiKey) {
            return "inactive";
          }
          // Could add actual API connectivity test here
          return "active";

        case "stripe":
          // Would check for Stripe keys
          return "active";

        case "mtn_momo":
        case "orange_money":
          // Would check for mobile money configuration
          return "active";

        case "mock":
        default:
          return "active";
      }
    } catch (error) {
      console.error("Error checking payment gateway health:", error);
      return "error";
    }
  }

  /**
   * Get complete dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const [stats, recentOrders, systemHealth] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentOrders(),
        this.getSystemHealth(),
      ]);

      // Update recent orders count in stats
      const updatedStats = {
        ...stats,
        recentOrders: recentOrders.length,
      };

      // Check if setup is complete (simplified check)
      const isSetupComplete = stats.setupProgress >= 80; // Consider 80%+ as complete

      return {
        stats: updatedStats,
        recentOrders,
        systemHealth,
        isSetupComplete,
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      throw error;
    }
  }
}
