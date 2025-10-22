import { PrismaClient } from "@prisma/client";
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  ProductListResult,
  ProductPrice,
  ProductStock,
} from "./product";
import { ProductRepository } from "./product-repository";
import {
  Result,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../../lib/domain";

// Additional service interfaces
export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalValue: number;
  averagePrice: number;
  topViewedProducts: Product[];
  recentlyAddedProducts: Product[];
}

export interface StockUpdateData {
  productId: string;
  newQuantity: number;
  reason?: string;
}

export interface BulkStockUpdateData {
  updates: StockUpdateData[];
}

export interface ProductServiceDependencies {
  productRepository: ProductRepository;
  categoryRepository: any; // Will be imported when CategoryService is created
  prisma: PrismaClient;
}

export class ProductService {
  constructor(private readonly deps: ProductServiceDependencies) {}

  /**
   * Create a new product with business rule validation
   */
  async create(data: CreateProductData): Promise<Result<Product>> {
    try {
      // Validate business rules
      const validation = await this.validateCreateData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Check if category exists and is active
      if (data.categoryId) {
        const categoryExists = await this.deps.categoryRepository.exists(
          data.categoryId
        );
        if (!categoryExists) {
          return {
            success: false,
            error: new ValidationError("Category does not exist"),
          };
        }
      }

      // Check SKU uniqueness if provided
      if (data.sku) {
        const skuAvailable = await this.deps.productRepository.isSkuAvailable(
          data.sku
        );
        if (!skuAvailable) {
          return {
            success: false,
            error: new ConflictError("SKU already exists"),
          };
        }
      }

      // Create product
      const result = await this.deps.productRepository.create(data);
      if (!result.success) {
        return result;
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to create product: ${error.message}`),
      };
    }
  }

  /**
   * Get product by ID with view count increment
   */
  async getById(
    id: string,
    incrementView: boolean = false
  ): Promise<Result<Product>> {
    try {
      const result = await this.deps.productRepository.findById(id);
      if (!result.success) {
        return result;
      }

      let product = result.data;

      // Increment view count if requested
      if (incrementView) {
        const viewResult = await this.deps.productRepository.incrementViewCount(
          id
        );
        if (viewResult.success) {
          product = viewResult.data;
        }
      }

      return { success: true, data: product };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get product: ${error.message}`),
      };
    }
  }

  /**
   * Update product with business rule validation
   */
  async update(id: string, data: UpdateProductData): Promise<Result<Product>> {
    try {
      // Check if product exists
      const existingResult = await this.deps.productRepository.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      // Validate business rules
      const validation = await this.validateUpdateData(id, data);
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Check category exists if being updated
      if (data.categoryId) {
        const categoryExists = await this.deps.categoryRepository.exists(
          data.categoryId
        );
        if (!categoryExists) {
          return {
            success: false,
            error: new ValidationError("Category does not exist"),
          };
        }
      }

      // Check SKU uniqueness if being updated
      if (data.sku) {
        const skuAvailable = await this.deps.productRepository.isSkuAvailable(
          data.sku,
          id
        );
        if (!skuAvailable) {
          return {
            success: false,
            error: new ConflictError("SKU already exists"),
          };
        }
      }

      // Update product
      const result = await this.deps.productRepository.update(id, data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to update product: ${error.message}`),
      };
    }
  }

  /**
   * Delete product with business rule validation
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      // Check if product exists
      const existingResult = await this.deps.productRepository.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      // Business rule: prevent deletion of products with stock
      if (existingResult.data.stockQuantity > 0) {
        return {
          success: false,
          error: new ValidationError(
            "Cannot delete product with remaining stock. Set stock to 0 first."
          ),
        };
      }

      // Delete product
      return await this.deps.productRepository.delete(id);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to delete product: ${error.message}`),
      };
    }
  }

  /**
   * List products with enhanced filtering
   */
  async list(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<ProductListResult>> {
    try {
      return await this.deps.productRepository.list(filters, page, limit);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to list products: ${error.message}`),
      };
    }
  }

  /**
   * Update product stock with business rules
   */
  async updateStock(
    productId: string,
    newQuantity: number,
    reason?: string
  ): Promise<Result<Product>> {
    try {
      // Get current product
      const productResult = await this.deps.productRepository.findById(
        productId
      );
      if (!productResult.success) {
        return productResult;
      }

      const product = productResult.data;

      // Validate stock update
      if (newQuantity < 0) {
        return {
          success: false,
          error: new ValidationError("Stock quantity cannot be negative"),
        };
      }

      // Business rule: warn about significant stock changes
      const change = newQuantity - product.stockQuantity;
      if (Math.abs(change) > 1000) {
        // Could emit an event or log warning here
        console.warn(
          `Large stock change for product ${product.name}: ${change} units`
        );
      }

      // Update stock
      const updateData: UpdateProductData = {
        stockQuantity: newQuantity,
      };

      const result = await this.deps.productRepository.update(
        productId,
        updateData
      );
      if (result.success && reason) {
        // Could log stock change reason here
        console.log(`Stock updated for ${product.name}: ${reason}`);
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to update stock: ${error.message}`),
      };
    }
  }

  /**
   * Bulk update stock for multiple products
   */
  async bulkUpdateStock(
    updates: StockUpdateData[]
  ): Promise<Result<Product[]>> {
    try {
      const results: Product[] = [];
      const errors: string[] = [];

      // Use transaction for atomicity
      await this.deps.prisma.$transaction(async (tx) => {
        for (const update of updates) {
          const result = await this.updateStock(
            update.productId,
            update.newQuantity,
            update.reason
          );

          if (result.success) {
            results.push(result.data);
          } else {
            errors.push(`Product ${update.productId}: ${result.error.message}`);
          }
        }
      });

      if (errors.length > 0) {
        return {
          success: false,
          error: new ValidationError(
            `Bulk update failed: ${errors.join("; ")}`
          ),
        };
      }

      return { success: true, data: results };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to bulk update stock: ${error.message}`),
      };
    }
  }

  /**
   * Adjust stock (add/subtract quantity)
   */
  async adjustStock(
    productId: string,
    adjustment: number,
    reason?: string
  ): Promise<Result<Product>> {
    try {
      // Get current product
      const productResult = await this.deps.productRepository.findById(
        productId
      );
      if (!productResult.success) {
        return productResult;
      }

      const newQuantity = productResult.data.stockQuantity + adjustment;

      return await this.updateStock(productId, newQuantity, reason);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to adjust stock: ${error.message}`),
      };
    }
  }

  /**
   * Reserve stock for an order
   */
  async reserveStock(
    productId: string,
    quantity: number,
    reservationId: string
  ): Promise<Result<Product>> {
    try {
      // Get current product
      const productResult = await this.deps.productRepository.findById(
        productId
      );
      if (!productResult.success) {
        return productResult;
      }

      const product = productResult.data;

      // Check if enough stock is available
      if (product.stockQuantity < quantity) {
        return {
          success: false,
          error: new ValidationError("Insufficient stock for reservation"),
        };
      }

      // For now, we'll just reduce the available stock
      // In a real system, you'd track reservations separately
      const newQuantity = product.stockQuantity - quantity;

      return await this.updateStock(
        productId,
        newQuantity,
        `Reserved ${quantity} units for reservation ${reservationId}`
      );
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to reserve stock: ${error.message}`),
      };
    }
  }

  /**
   * Release reserved stock
   */
  async releaseStock(
    productId: string,
    quantity: number,
    reservationId: string
  ): Promise<Result<Product>> {
    try {
      return await this.adjustStock(
        productId,
        quantity,
        `Released ${quantity} units from reservation ${reservationId}`
      );
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to release stock: ${error.message}`),
      };
    }
  }

  /**
   * Get product analytics
   */
  async getAnalytics(): Promise<Result<ProductAnalytics>> {
    try {
      // Get all products
      const allProductsResult = await this.deps.productRepository.list(
        {},
        1,
        10000
      );
      if (!allProductsResult.success) {
        return {
          success: false,
          error: allProductsResult.error,
        };
      }

      const products = allProductsResult.data.products;

      // Calculate analytics
      const totalProducts = products.length;
      const activeProducts = products.filter((p) => p.isActive).length;
      const outOfStockProducts = products.filter(
        (p) => p.stockQuantity === 0
      ).length;
      const lowStockProducts = products.filter(
        (p) => p.stockQuantity > 0 && p.stockQuantity <= 10
      ).length;

      const totalValue = products.reduce(
        (sum, p) => sum + p.price * p.stockQuantity,
        0
      );
      const averagePrice =
        products.length > 0
          ? products.reduce((sum, p) => sum + p.price, 0) / products.length
          : 0;

      // Top viewed products
      const topViewedProducts = [...products]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10);

      // Recently added products
      const recentlyAddedProducts = [...products]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);

      const analytics: ProductAnalytics = {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
        totalValue,
        averagePrice,
        topViewedProducts,
        recentlyAddedProducts,
      };

      return { success: true, data: analytics };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get analytics: ${error.message}`),
      };
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(
    threshold: number = 10
  ): Promise<Result<Product[]>> {
    try {
      const filters: ProductFilters = {
        isActive: true,
      };

      const result = await this.deps.productRepository.list(filters, 1, 10000);
      if (!result.success) {
        return result;
      }

      const lowStockProducts = result.data.products.filter(
        (p) => p.stockQuantity <= threshold && p.stockQuantity > 0
      );

      return { success: true, data: lowStockProducts };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get low stock products: ${error.message}`),
      };
    }
  }

  /**
   * Get out of stock products
   */
  async getOutOfStockProducts(): Promise<Result<Product[]>> {
    try {
      const filters: ProductFilters = {
        isActive: true,
      };

      const result = await this.deps.productRepository.list(filters, 1, 10000);
      if (!result.success) {
        return result;
      }

      const outOfStockProducts = result.data.products.filter(
        (p) => p.stockQuantity === 0
      );

      return { success: true, data: outOfStockProducts };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(
          `Failed to get out of stock products: ${error.message}`
        ),
      };
    }
  }

  /**
   * Search products by SKU
   */
  async findBySku(sku: string): Promise<Result<Product>> {
    try {
      return await this.deps.productRepository.findBySku(sku);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to find product by SKU: ${error.message}`),
      };
    }
  }

  /**
   * Deactivate product
   */
  async deactivate(id: string): Promise<Result<Product>> {
    try {
      const updateData: UpdateProductData = { isActive: false };
      return await this.deps.productRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to deactivate product: ${error.message}`),
      };
    }
  }

  /**
   * Activate product
   */
  async activate(id: string): Promise<Result<Product>> {
    try {
      const updateData: UpdateProductData = { isActive: true };
      return await this.deps.productRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to activate product: ${error.message}`),
      };
    }
  }

  /**
   * Validate create data with business rules
   */
  private async validateCreateData(
    data: CreateProductData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    const basicValidation = Product.validateCreateData(data);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    // Business rules
    if (data.price < 0.01) {
      errors.push("Product price must be at least 0.01");
    }

    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      errors.push("Initial stock quantity cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update data with business rules
   */
  private async validateUpdateData(
    productId: string,
    data: UpdateProductData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get current product for validation context
    const currentResult = await this.deps.productRepository.findById(productId);
    if (!currentResult.success) {
      errors.push("Product not found");
      return { isValid: false, errors };
    }

    const currentProduct = currentResult.data;

    // Business rules
    if (data.price !== undefined && data.price < 0.01) {
      errors.push("Product price must be at least 0.01");
    }

    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      errors.push("Stock quantity cannot be negative");
    }

    // Prevent deactivation of products with reserved stock (if implemented)
    if (data.isActive === false && currentProduct.stockQuantity > 0) {
      errors.push("Cannot deactivate product with remaining stock");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
