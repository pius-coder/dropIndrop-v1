import { PrismaClient, Order, OrderStatus } from "@prisma/client";

export interface OrderFilters {
  customerId?: string;
  status?: OrderStatus;
  createdById?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new order
   */
  async create(data: {
    orderNumber: string;
    customerId: string;
    totalAmount: number;
    status?: OrderStatus;
    paymentIntentId?: string;
    createdById?: string;
  }): Promise<Order> {
    return await this.prisma.order.create({
      data,
    });
  }

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<Order | null> {
    return await this.prisma.order.findUnique({
      where: { id },
    });
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.prisma.order.findUnique({
      where: { orderNumber },
    });
  }

  /**
   * Find orders with filters and pagination
   */
  async findMany(
    filters: OrderFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<OrderListResult> {
    const where: any = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
    };
  }

  /**
   * Update order
   */
  async update(id: string, data: Partial<Order>): Promise<Order> {
    return await this.prisma.order.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete order
   */
  async delete(id: string): Promise<Order> {
    return await this.prisma.order.delete({
      where: { id },
    });
  }

  /**
   * Get orders by customer
   */
  async findByCustomer(customerId: string): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get pending orders (for payment processing)
   */
  async findPendingOrders(): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Get paid orders ready for ticket generation
   */
  async findPaidOrdersWithoutTickets(): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: {
        status: "PAID",
        ticket: null, // No ticket generated yet
      },
      include: {
        items: true,
      },
      orderBy: { paidAt: "asc" },
    });
  }
}
