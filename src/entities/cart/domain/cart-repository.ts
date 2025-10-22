import { PrismaClient, Cart as PrismaCart } from "@prisma/client";
import {
  Cart,
  CreateCartData,
  UpdateCartData,
  CartFilters,
} from "./cart";
import {
  Result,
  NotFoundError,
  ValidationError,
} from "../../lib/domain";

export class CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<Result<Cart>> {
    try {
      const prismaCart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!prismaCart) {
        return Result.failure(new NotFoundError("Cart not found"));
      }

      const cart = this.mapToDomain(prismaCart);
      return Result.success(cart);
    } catch (error: any) {
      return Result.failure(new ValidationError("Error fetching cart"));
    }
  }

  async save(cart: Cart): Promise<Result<Cart>> {
    try {
      // Assuming Prisma schema has Cart and CartItem models
      const prismaCart = await this.prisma.cart.upsert({
        where: { userId: cart.userId },
        update: {
          items: {
            deleteMany: {},
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        create: {
          userId: cart.userId,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      const updatedCart = this.mapToDomain(prismaCart);
      return Result.success(updatedCart);
    } catch (error: any) {
      return Result.failure(new ValidationError("Error saving cart"));
    }
  }

  private mapToDomain(prismaCart: any): Cart {
    return new Cart(prismaCart.userId, prismaCart.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
    })));
  }
}
