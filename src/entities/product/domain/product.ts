import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
} from "../../../lib/domain";

// Domain types for Product entity
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images?: string[];
  sku?: string;
  stockQuantity?: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  images?: string[];
  sku?: string;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Product domain entity
export class Product extends BaseEntity {
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;
  public readonly categoryId: string;
  public readonly category?: {
    id: string;
    name: string;
  };
  public readonly images: string[];
  public readonly sku?: string;
  public readonly stockQuantity: number;
  public readonly isActive: boolean;
  public readonly viewCount: number;

  constructor(
    id: string,
    name: string,
    description: string,
    price: number,
    categoryId: string,
    images: string[] = [],
    sku?: string,
    stockQuantity: number = 0,
    isActive: boolean = true,
    viewCount: number = 0,
    category?: { id: string; name: string },
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.description = description;
    this.price = price;
    this.categoryId = categoryId;
    this.category = category;
    this.images = images;
    this.sku = sku;
    this.stockQuantity = stockQuantity;
    this.isActive = isActive;
    this.viewCount = viewCount;
  }

  // Business logic methods
  public isAvailable(): boolean {
    return this.isActive && this.stockQuantity > 0;
  }

  public isInStock(): boolean {
    return this.stockQuantity > 0;
  }

  public hasImages(): boolean {
    return this.images.length > 0;
  }

  public getPrimaryImage(): string | null {
    return this.images.length > 0 ? this.images[0] : null;
  }

  public canBeOrdered(quantity: number = 1): boolean {
    return this.isAvailable() && this.stockQuantity >= quantity;
  }

  public recordView(): Product {
    return new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      this.categoryId,
      this.images,
      this.sku,
      this.stockQuantity,
      this.isActive,
      this.viewCount + 1,
      this.category,
      this.createdAt,
      new Date()
    );
  }

  public updateStock(newQuantity: number): Result<Product> {
    if (newQuantity < 0) {
      return {
        success: false,
        error: new ValidationError("Stock quantity cannot be negative"),
      };
    }

    const updatedProduct = new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      this.categoryId,
      this.images,
      this.sku,
      newQuantity,
      this.isActive,
      this.viewCount,
      this.category,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedProduct,
    };
  }

  public updatePrice(newPrice: number): Result<Product> {
    if (newPrice < 0) {
      return {
        success: false,
        error: new ValidationError("Price cannot be negative"),
      };
    }

    const updatedProduct = new Product(
      this.id,
      this.name,
      this.description,
      newPrice,
      this.categoryId,
      this.images,
      this.sku,
      this.stockQuantity,
      this.isActive,
      this.viewCount,
      this.category,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedProduct,
    };
  }

  public updateDetails(updates: UpdateProductData): Result<Product> {
    // Validate updates
    const validation = this.validateUpdates(updates);
    if (!validation.isValid) {
      return {
        success: false,
        error: new ValidationError(validation.errors.join(", ")),
      };
    }

    // Create updated product
    const updatedProduct = new Product(
      this.id,
      updates.name || this.name,
      updates.description || this.description,
      updates.price ?? this.price,
      updates.categoryId || this.categoryId,
      updates.images || this.images,
      updates.sku || this.sku,
      updates.stockQuantity ?? this.stockQuantity,
      updates.isActive ?? this.isActive,
      this.viewCount,
      this.category,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedProduct,
    };
  }

  public deactivate(): Product {
    return new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      this.categoryId,
      this.images,
      this.sku,
      this.stockQuantity,
      false,
      this.viewCount,
      this.category,
      this.createdAt,
      new Date()
    );
  }

  public activate(): Product {
    return new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      this.categoryId,
      this.images,
      this.sku,
      this.stockQuantity,
      true,
      this.viewCount,
      this.category,
      this.createdAt,
      new Date()
    );
  }

  // Validation methods
  private validateUpdates(updates: UpdateProductData): ValidationResult {
    const errors: string[] = [];

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        errors.push("Product name is required");
      } else if (updates.name.length < 2 || updates.name.length > 200) {
        errors.push("Product name must be between 2 and 200 characters");
      }
    }

    if (updates.description !== undefined) {
      if (!updates.description.trim()) {
        errors.push("Product description is required");
      } else if (updates.description.length < 10) {
        errors.push("Product description must be at least 10 characters");
      }
    }

    if (updates.price !== undefined && updates.price < 0) {
      errors.push("Price cannot be negative");
    }

    if (updates.categoryId !== undefined && !updates.categoryId.trim()) {
      errors.push("Category is required");
    }

    if (updates.sku !== undefined && updates.sku) {
      if (updates.sku.length > 50) {
        errors.push("SKU must be 50 characters or less");
      }
    }

    if (updates.stockQuantity !== undefined && updates.stockQuantity < 0) {
      errors.push("Stock quantity cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(data: CreateProductData): ValidationResult {
    const errors: string[] = [];

    if (!data.name || !data.name.trim()) {
      errors.push("Product name is required");
    } else if (data.name.length < 2 || data.name.length > 200) {
      errors.push("Product name must be between 2 and 200 characters");
    }

    if (!data.description || !data.description.trim()) {
      errors.push("Product description is required");
    } else if (data.description.length < 10) {
      errors.push("Product description must be at least 10 characters");
    }

    if (data.price === undefined || data.price < 0) {
      errors.push("Valid price is required and cannot be negative");
    }

    if (!data.categoryId || !data.categoryId.trim()) {
      errors.push("Category is required");
    }

    if (data.sku && data.sku.length > 50) {
      errors.push("SKU must be 50 characters or less");
    }

    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      errors.push("Stock quantity cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Value objects for Product domain
export class ProductPrice {
  constructor(
    public readonly amount: number,
    public readonly currency: string = "XAF"
  ) {
    if (amount < 0) {
      throw new ValidationError("Price cannot be negative");
    }
  }

  public format(): string {
    return `${this.amount.toLocaleString()} ${this.currency}`;
  }

  public isGreaterThan(other: ProductPrice): boolean {
    return this.amount > other.amount;
  }

  public add(other: ProductPrice): ProductPrice {
    if (this.currency !== other.currency) {
      throw new ValidationError("Cannot add prices with different currencies");
    }
    return new ProductPrice(this.amount + other.amount, this.currency);
  }
}

export class ProductSKU {
  constructor(public readonly value: string) {
    if (!value || value.length > 50) {
      throw new ValidationError("SKU must be between 1 and 50 characters");
    }
  }

  public toString(): string {
    return this.value;
  }

  public isEmpty(): boolean {
    return !this.value.trim();
  }
}

export class ProductStock {
  constructor(
    public readonly quantity: number,
    public readonly reserved: number = 0
  ) {
    if (quantity < 0) {
      throw new ValidationError("Stock quantity cannot be negative");
    }
    if (reserved < 0) {
      throw new ValidationError("Reserved quantity cannot be negative");
    }
    if (reserved > quantity) {
      throw new ValidationError("Reserved quantity cannot exceed total stock");
    }
  }

  public getAvailable(): number {
    return this.quantity - this.reserved;
  }

  public isAvailable(): boolean {
    return this.getAvailable() > 0;
  }

  public canFulfill(quantity: number): boolean {
    return this.getAvailable() >= quantity;
  }

  public reserve(additionalReserved: number): ProductStock {
    const newReserved = this.reserved + additionalReserved;
    if (newReserved > this.quantity) {
      throw new ValidationError("Cannot reserve more than available stock");
    }
    return new ProductStock(this.quantity, newReserved);
  }

  public release(reservedToRelease: number): ProductStock {
    const newReserved = Math.max(0, this.reserved - reservedToRelease);
    return new ProductStock(this.quantity, newReserved);
  }
}
