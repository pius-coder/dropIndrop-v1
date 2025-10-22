import { PrismaClient, UserRole, User } from "@prisma/client";
import {
  User as DomainUser,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserListResult,
} from "./user";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<DomainUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.toDomainEntity(user);
  }

  async findByUsername(username: string): Promise<DomainUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) return null;

    return this.toDomainEntity(user);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<DomainUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) return null;

    return this.toDomainEntity(user);
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) return null;

    return this.toDomainEntity(user);
  }

  async findAll(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<UserListResult> {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phoneNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.createdAfter) {
      where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
    }

    if (filters.createdBefore) {
      where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    const domainUsers = users.map((user) => this.toDomainEntity(user));
    const totalPages = Math.ceil(total / limit);

    return {
      users: domainUsers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(data: CreateUserData): Promise<DomainUser> {
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: data.password,
        role: data.role || UserRole.CLIENT,
      },
    });

    return this.toDomainEntity(user);
  }

  async update(id: string, data: UpdateUserData): Promise<DomainUser | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.username && { username: data.username }),
          ...(data.email && { email: data.email }),
          ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
          ...(data.role && { role: data.role }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          updatedAt: new Date(),
        },
      });

      return this.toDomainEntity(user);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateLastLogin(id: string): Promise<DomainUser | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return this.toDomainEntity(user);
    } catch (error) {
      return null;
    }
  }

  async getUserAnalytics(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerOrders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        _count: {
          select: {
            customerOrders: true,
          },
        },
      },
    });

    if (!user) return null;

    const totalSpent = user.customerOrders
      .filter((order) => order.status === "DELIVERED")
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);

    const orderCount = user.customerOrders.length;
    const deliveredOrders = user.customerOrders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    return {
      userId,
      totalOrders: orderCount,
      deliveredOrders,
      totalSpent,
      averageOrderValue: orderCount > 0 ? totalSpent / deliveredOrders : 0,
      lastOrderDate:
        user.customerOrders.length > 0
          ? user.customerOrders.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0].createdAt
          : null,
    };
  }

  async getAllUsersAnalytics(): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      include: {
        customerOrders: {
          where: { status: "DELIVERED" },
          select: { totalAmount: true, createdAt: true },
        },
      },
    });

    const totalUsers = users.length;
    const activeUsers = users.filter((user) =>
      user.customerOrders.some((order) => this.isRecentOrder(order.createdAt))
    ).length;

    const totalRevenue = users.reduce(
      (sum, user) =>
        sum +
        user.customerOrders.reduce(
          (orderSum, order) => orderSum + Number(order.totalAmount),
          0
        ),
      0
    );

    const averageOrderValue =
      totalRevenue /
        users.reduce((sum, user) => sum + user.customerOrders.length, 0) || 0;

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      averageOrderValue,
      conversionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
    };
  }

  private isRecentOrder(orderDate: Date): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  }

  private toDomainEntity(prismaUser: User): DomainUser {
    return new DomainUser(
      prismaUser.id,
      prismaUser.username,
      prismaUser.phoneNumber,
      prismaUser.passwordHash,
      prismaUser.role,
      prismaUser.isActive,
      prismaUser.email || undefined,
      prismaUser.lastLoginAt || undefined,
      undefined, // otpCode
      undefined, // otpExpiresAt
      0, // otpAttempts
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }
}
