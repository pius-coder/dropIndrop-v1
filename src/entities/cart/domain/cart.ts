import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
} from "../../lib/domain";

// Domain types for Cart entity
export interface CreateCartData {
  userId: string;
}

export interface UpdateCartData {
  items?: CartItem[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartFilters {
  userId?: string;
}

// Cart domain entity
export class Cart extends BaseEntity {
  private _userId: string;
  private _items: CartItem[] = [];

  constructor(userId: string, items: CartItem[] = []) {
    super();
    this._userId = userId;
    this._items = items;
  }

  get userId(): string {
    return this._userId;
  }

  get items(): CartItem[] {
    return [...this._items];
  }

  addItem(productId: string, quantity: number): Result<void> {
    if (quantity <= 0) {
      return Result.failure(new ValidationError("Quantity must be greater than 0"));
    }

    const existingItem = this._items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this._items.push({ productId, quantity });
    }

    return Result.success();
  }

  removeItem(productId: string): Result<void> {
    const index = this._items.findIndex(item => item.productId === productId);
    if (index === -1) {
      return Result.failure(new NotFoundError("Item not found in cart"));
    }

    this._items.splice(index, 1);
    return Result.success();
  }

  updateItemQuantity(productId: string, quantity: number): Result<void> {
    if (quantity <= 0) {
      return Result.failure(new ValidationError("Quantity must be greater than 0"));
    }

    const item = this._items.find(item => item.productId === productId);
    if (!item) {
      return Result.failure(new NotFoundError("Item not found in cart"));
    }

    item.quantity = quantity;
    return Result.success();
  }

  clear(): void {
    this._items = [];
  }

  get totalItems(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  static create(data: CreateCartData): Result<Cart> {
    if (!data.userId) {
      return Result.failure(new ValidationError("User ID is required"));
    }

    return Result.success(new Cart(data.userId));
  }

  update(data: UpdateCartData): Result<void> {
    if (data.items !== undefined) {
      this._items = data.items;
    }

    return Result.success();
  }
}
