import { PrismaClient, UserRole } from "@prisma/client";
import {
  User as DomainUser,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserListResult,
} from "./user";
import { UserRepository } from "./user-repository";
import { Result, ValidationError, NotFoundError } from "../../../lib/domain";

export interface UserAnalytics {
  userId: string;
  totalOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
}

export interface AdminUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface UserServiceDependencies {
  userRepository: UserRepository;
  prisma: PrismaClient;
}

export class UserService {
  constructor(private dependencies: UserServiceDependencies) {}

  async createUser(data: CreateUserData): Promise<Result<DomainUser>> {
    try {
      // Validate input data
      const validation = DomainUser.validateCreateData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Check if username already exists
      const existingUser =
        await this.dependencies.userRepository.findByUsername(data.username);
      if (existingUser) {
        return {
          success: false,
          error: new ValidationError("Username already exists"),
        };
      }

      // Check if phone number already exists
      const existingPhone =
        await this.dependencies.userRepository.findByPhoneNumber(
          data.phoneNumber
        );
      if (existingPhone) {
        return {
          success: false,
          error: new ValidationError("Phone number already exists"),
        };
      }

      // Check if email already exists (if provided)
      if (data.email) {
        const existingEmail =
          await this.dependencies.userRepository.findByEmail(data.email);
        if (existingEmail) {
          return {
            success: false,
            error: new ValidationError("Email already exists"),
          };
        }
      }

      const user = await this.dependencies.userRepository.create(data);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to create user"),
      };
    }
  }

  async updateUser(
    id: string,
    data: UpdateUserData
  ): Promise<Result<DomainUser>> {
    try {
      const existingUser = await this.dependencies.userRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: new NotFoundError("User not found"),
        };
      }

      // Check if username already exists (if updating username)
      if (data.username && data.username !== existingUser.username) {
        const existingUsername =
          await this.dependencies.userRepository.findByUsername(data.username);
        if (existingUsername) {
          return {
            success: false,
            error: new ValidationError("Username already exists"),
          };
        }
      }

      // Check if phone number already exists (if updating phone number)
      if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
        const existingPhone =
          await this.dependencies.userRepository.findByPhoneNumber(
            data.phoneNumber
          );
        if (existingPhone) {
          return {
            success: false,
            error: new ValidationError("Phone number already exists"),
          };
        }
      }

      // Check if email already exists (if updating email)
      if (data.email && data.email !== existingUser.email) {
        const existingEmail =
          await this.dependencies.userRepository.findByEmail(data.email);
        if (existingEmail) {
          return {
            success: false,
            error: new ValidationError("Email already exists"),
          };
        }
      }

      const updatedUser = await this.dependencies.userRepository.update(
        id,
        data
      );
      if (!updatedUser) {
        return {
          success: false,
          error: new ValidationError("Failed to update user"),
        };
      }

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to update user"),
      };
    }
  }

  async getUserById(id: string): Promise<Result<DomainUser>> {
    try {
      const user = await this.dependencies.userRepository.findById(id);
      if (!user) {
        return {
          success: false,
          error: new NotFoundError("User not found"),
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to get user"),
      };
    }
  }

  async listUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<Result<UserListResult>> {
    try {
      const result = await this.dependencies.userRepository.findAll(
        filters,
        page,
        limit
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to list users"),
      };
    }
  }

  async deleteUser(id: string): Promise<Result<boolean>> {
    try {
      const existingUser = await this.dependencies.userRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: new NotFoundError("User not found"),
        };
      }

      // Prevent deletion of super admin users
      if (existingUser.isSuperAdmin()) {
        return {
          success: false,
          error: new ValidationError("Cannot delete super admin users"),
        };
      }

      const deleted = await this.dependencies.userRepository.delete(id);
      return {
        success: true,
        data: deleted,
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to delete user"),
      };
    }
  }

  async getUserAnalytics(userId: string): Promise<Result<UserAnalytics>> {
    try {
      const analytics = await this.dependencies.userRepository.getUserAnalytics(
        userId
      );
      if (!analytics) {
        return {
          success: false,
          error: new NotFoundError("User not found"),
        };
      }

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to get user analytics"),
      };
    }
  }

  async getAllUsersAnalytics(): Promise<Result<AdminUserAnalytics>> {
    try {
      const analytics =
        await this.dependencies.userRepository.getAllUsersAnalytics();

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to get users analytics"),
      };
    }
  }

  async getUserPurchaseHistory(userId: string): Promise<Result<any>> {
    try {
      const user = await this.dependencies.prisma.user.findUnique({
        where: { id: userId },
        include: {
          customerOrders: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                      images: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          error: new NotFoundError("User not found"),
        };
      }

      const purchaseHistory = user.customerOrders.map((order) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage:
            item.product.images.length > 0 ? item.product.images[0] : null,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      }));

      return {
        success: true,
        data: {
          userId,
          username: user.username,
          purchaseHistory,
          totalOrders: purchaseHistory.length,
          totalSpent: purchaseHistory
            .filter((order) => order.status === "DELIVERED")
            .reduce((sum, order) => sum + order.totalAmount, 0),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to get purchase history"),
      };
    }
  }

  async activateUser(id: string): Promise<Result<DomainUser>> {
    return this.updateUser(id, { isActive: true });
  }

  async deactivateUser(id: string): Promise<Result<DomainUser>> {
    try {
      const existingUser = await this.dependencies.userRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: new NotFoundError("User not found"),
        };
      }

      // Prevent deactivation of super admin users
      if (existingUser.isSuperAdmin()) {
        return {
          success: false,
          error: new ValidationError("Cannot deactivate super admin users"),
        };
      }

      return this.updateUser(id, { isActive: false });
    } catch (error) {
      return {
        success: false,
        error: new ValidationError("Failed to deactivate user"),
      };
    }
  }
}
