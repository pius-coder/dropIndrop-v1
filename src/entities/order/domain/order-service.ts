import { PrismaClient } from "@prisma/client";
import {
  paymentService,
  createPaymentService,
} from "../../../lib/services/payment-service";
import { ConfigurationRepository } from "../../configuration/domain/configuration-repository";

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
  createdById?: string;
}

export interface OrderResult {
  success: boolean;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentIntentId?: string;
  };
  error?: string;
}

export interface PaymentProcessingResult {
  success: boolean;
  paymentIntent?: {
    id: string;
    clientSecret: string;
    redirectUrl?: string;
  };
  error?: string;
}

export class OrderService {
  constructor(
    private prisma: PrismaClient,
    private configurationRepository?: ConfigurationRepository
  ) {}

  /**
   * Create a new order with payment processing
   */
  async createOrder(request: CreateOrderRequest): Promise<OrderResult> {
    try {
      // Calculate total amount
      const totalAmount = request.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Create order in database
      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          customerId: request.customerId,
          totalAmount,
          status: "PENDING",
          createdById: request.createdById,
          items: {
            create: request.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              username: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      });

      return {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: Number(order.totalAmount),
          status: order.status,
        },
      };
    } catch (error) {
      console.error("Failed to create order:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create order",
      };
    }
  }

  /**
   * Process payment for an existing order
   */
  async processPayment(orderId: string): Promise<PaymentProcessingResult> {
    try {
      // Get order details
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: {
              username: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      });

      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }

      if (order.status !== "PENDING") {
        return {
          success: false,
          error: `Order is already ${order.status.toLowerCase()}`,
        };
      }

      // Get configuration for shop name and payment settings
      let shopName = "DropInDrop"; // Default fallback
      if (this.configurationRepository) {
        try {
          const configuration = await this.configurationRepository.findById(
            "main"
          );
          if (configuration?.general?.siteName) {
            shopName = configuration.general.siteName;
          }
        } catch (error) {
          console.warn("Failed to fetch configuration for shop name:", error);
        }
      }

      // Create payment intent with shop name from configuration
      const paymentResult = await paymentService.createPaymentIntent(
        Number(order.totalAmount),
        order.id,
        {
          name: order.customer.username,
          email: order.customer.email || undefined,
          phone: order.customer.phoneNumber,
        },
        shopName
      );

      if (!paymentResult.success || !paymentResult.paymentIntent) {
        return {
          success: false,
          error: paymentResult.error || "Failed to create payment intent",
        };
      }

      // Update order with payment intent ID
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentIntentId: paymentResult.paymentIntent.id,
        },
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentResult.paymentIntent.id,
          clientSecret: paymentResult.paymentIntent.client_secret,
          redirectUrl: paymentResult.redirectUrl,
        },
      };
    } catch (error) {
      console.error("Failed to process payment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process payment",
      };
    }
  }

  /**
   * Check payment status and update order accordingly
   */
  async checkPaymentStatus(
    orderId: string
  ): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }

      if (!order.paymentIntentId) {
        return {
          success: false,
          error: "No payment intent found for this order",
        };
      }

      // Verify payment status
      const verification = await paymentService.verifyPaymentIntent(
        order.paymentIntentId
      );

      if (!verification) {
        return {
          success: false,
          error: "Failed to verify payment status",
        };
      }

      // Update order status based on payment status
      let newStatus: string;
      let paidAt: Date | null = null;

      switch (verification.status) {
        case "succeeded":
          newStatus = "PAID";
          paidAt = new Date();
          break;
        case "failed":
        case "cancelled":
          newStatus = "CANCELLED";
          break;
        case "expired":
          newStatus = "CANCELLED";
          break;
        default:
          newStatus = "PENDING";
      }

      // Update order
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as any,
          paidAt,
        },
      });

      return {
        success: true,
        status: newStatus,
      };
    } catch (error) {
      console.error("Failed to check payment status:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check payment status",
      };
    }
  }

  /**
   * Generate a unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `ORD${timestamp}${random}`;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        ticket: true,
      },
    });
  }

  /**
   * Get orders by customer ID
   */
  async getOrdersByCustomer(customerId: string) {
    return await this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        ticket: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Admin: Get all orders with advanced filtering and pagination
   */
  async getAllOrders(
    filters: {
      status?: string;
      customerId?: string;
      productId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const {
      status,
      customerId,
      productId,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { username: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Handle product filtering through order items
    if (productId) {
      where.items = {
        some: {
          productId: productId,
        },
      };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              username: true,
              email: true,
              phoneNumber: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          ticket: {
            select: {
              id: true,
              uniqueCode: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Update order status with validation
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    notes?: string,
    deliveredBy?: string
  ) {
    try {
      // Get current order
      const currentOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!currentOrder) {
        return {
          success: false,
          error: "Order not found",
        };
      }

      // Validate status transition
      const validTransitions = this.getValidStatusTransitions(
        currentOrder.status
      );
      if (!validTransitions.includes(newStatus as any)) {
        return {
          success: false,
          error: `Cannot transition from ${currentOrder.status} to ${newStatus}`,
        };
      }

      // Prepare update data
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date(),
      };

      if (notes) {
        updateData.notes = notes;
      }

      // Set timestamps based on status
      if (newStatus === "PAID" && currentOrder.status === "PENDING") {
        updateData.paidAt = new Date();
      }

      if (newStatus === "DELIVERED") {
        updateData.deliveredAt = new Date();
        if (deliveredBy) {
          updateData.deliveredBy = deliveredBy;
        }
      }

      // Update order
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              username: true,
              email: true,
              phoneNumber: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        order: updatedOrder,
      };
    } catch (error) {
      console.error("Failed to update order status:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
      };
    }
  }

  /**
   * Admin: Get order statistics
   */
  async getOrderStats() {
    try {
      const stats = await this.prisma.order.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      });

      const totalOrders = await this.prisma.order.count();
      const recentOrders = await this.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      return {
        success: true,
        stats: {
          total: totalOrders,
          recent: recentOrders,
          byStatus: stats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.id;
            return acc;
          }, {} as Record<string, number>),
        },
      };
    } catch (error) {
      console.error("Failed to get order stats:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get order stats",
      };
    }
  }

  /**
   * Get valid status transitions for a given status
   */
  private getValidStatusTransitions(currentStatus: string): string[] {
    switch (currentStatus) {
      case "PENDING":
        return ["PAID", "CANCELLED"];
      case "PAID":
        return ["DELIVERED"];
      case "DELIVERED":
      case "CANCELLED":
        return []; // Terminal states
      default:
        return [];
    }
  }
}
