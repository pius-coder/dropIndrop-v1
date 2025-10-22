import { PrismaClient } from "@prisma/client";
import {
  Cart,
  CreateCartData,
  UpdateCartData,
  CartFilters,
  CartItem,
} from "./cart";
import { CartRepository } from "./cart-repository";
import {
  Result,
  ValidationError,
  NotFoundError,
} from "../../lib/domain";

export interface CartServiceDependencies {
  cartRepository: CartRepository;
  productRepository: any; // Reference to ProductRepository
  prisma: PrismaClient;
}

export class CartService {
  constructor(private readonly deps: CartServiceDependencies) {}

  async getCartByUserId(userId: string): Promise<Result<Cart>> {
    const cartResult = await this.deps.cartRepository.findByUserId(userId);
    if (!cartResult.isSuccess) {
      return Result.failure(cartResult.error);
    }

    return Result.success(cartResult.value);
  }

  async createCart(data: CreateCartData): Promise<Result<Cart>> {
    const cart = Cart.create(data);
    if (!cart.isSuccess) {
      return Result.failure(cart.error);
    }

    const saveResult = await this.deps.cartRepository.save(cart.value);
    if (!saveResult.isSuccess) {
      return Result.failure(saveResult.error);
    }

    return Result.success(cart.value);
  }

  async addItemToCart(userId: string, productId: string, quantity: number): Promise<Result<Cart>> {
    let cart = await this.getCartByUserId(userId);
    if (!cart.isSuccess) {
      // Create new cart if not exists
      const createResult = await this.createCart({ userId });
      if (!createResult.isSuccess) {
        return Result.failure(createResult.error);
      }
      cart = Result.success(createResult.value);
    }

    const addResult = cart.value.addItem(productId, quantity);
    if (!addResult.isSuccess) {
      return Result.failure(addResult.error);
    }

    const saveResult = await this.deps.cartRepository.save(cart.value);
    if (!saveResult.isSuccess) {
      return Result.failure(saveResult.error);
    }

    return Result.success(cart.value);
  }

  async removeItemFromCart(userId: string, productId: string): Promise<Result<Cart>> {
    const cart = await this.getCartByUserId(userId);
    if (!cart.isSuccess) {
      return Result.failure(cart.error);
    }

    const removeResult = cart.value.removeItem(productId);
    if (!removeResult.isSuccess) {
      return Result.failure(removeResult.error);
    }

    const saveResult = await this.deps.cartRepository.save(cart.value);
    if (!saveResult.isSuccess) {
      return Result.failure(saveResult.error);
    }

    return Result.success(cart.value);
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Result<Cart>> {
    const cart = await this.getCartByUserId(userId);
    if (!cart.isSuccess) {
      return Result.failure(cart.error);
    }

    const updateResult = cart.value.updateItemQuantity(productId, quantity);
    if (!updateResult.isSuccess) {
      return Result.failure(updateResult.error);
    }

    const saveResult = await this.deps.cartRepository.save(cart.value);
    if (!saveResult.isSuccess) {
      return Result.failure(saveResult.error);
    }

    return Result.success(cart.value);
  }

  async clearCart(userId: string): Promise<Result<Cart>> {
    const cart = await this.getCartByUserId(userId);
    if (!cart.isSuccess) {
      return Result.failure(cart.error);
    }

    cart.value.clear();

    const saveResult = await this.deps.cartRepository.save(cart.value);
    if (!saveResult.isSuccess) {
      return Result.failure(saveResult.error);
    }

    return Result.success(cart.value);
  }
}
