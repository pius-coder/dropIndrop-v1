import { PrismaClient, Product as PrismaProduct } from "@prisma/client";
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  ProductListResult,
} from "./product";
import {
  Result,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../lib/domain";

export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new product
   */
  async create(data: CreateProductData): Promise<Result<Product>> {
    try {
      const prismaProduct = await this.prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
          images: data.images || [],
          sku: data.sku,
          stockQuantity: data.stockQuantity || 0,
        },
      });

      const product = this.mapToDomain(prismaProduct);
      return { success: true, data: product };
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: new ConflictError("Product with this SKU already exists"),
        };
      }
      if (error.code === "P2003") {
        return {
          success: false,
          error: new ValidationError("Invalid category ID"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to create product: ${error.message}`),
      };
    }
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Result<Product>> {
    try {
      const prismaProduct = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!prismaProduct) {
        return {
          success: false,
          error: new NotFoundError("Product not found"),
        };
      }

      const product = this.mapToDomain(prismaProduct);
      return { success: true, data: product };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to find product: ${error.message}`),
      };
    }
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<Result<Product>> {
    try {
      const prismaProduct = await this.prisma.product.findUnique({
        where: { sku },
        include: {
          category: true,
        },
      });

      if (!prismaProduct) {
        return {
          success: false,
          error: new NotFoundError("Product not found"),
        };
      }

      const product = this.mapToDomain(prismaProduct);
      return { success: true, data: product };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to find product by SKU: ${error.message}`),
      };
    }
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductData): Promise<Result<Product>> {
    try {
      const prismaProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.images && { images: data.images }),
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.stockQuantity !== undefined && {
            stockQuantity: data.stockQuantity,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          category: true,
        },
      });

      const product = this.mapToDomain(prismaProduct);
      return { success: true, data: product };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Product not found"),
        };
      }
      if (error.code === "P2002") {
        return {
          success: false,
          error: new ConflictError("Product with this SKU already exists"),
        };
      }
      if (error.code === "P2003") {
        return {
          success: false,
          error: new ValidationError("Invalid category ID"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to update product: ${error.message}`),
      };
    }
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });

      return { success: true, data: undefined };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Product not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to delete product: ${error.message}`),
      };
    }
  }

  /**
   * List products with filtering and pagination
   */
  async list(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<ProductListResult>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { sku: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
          where.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          where.createdAt.lte = filters.createdBefore;
        }
      }

      // Get total count
      const total = await this.prisma.product.count({ where });

      // Get products
      const prismaProducts = await this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          category: true,
        },
      });

      const products = prismaProducts.map(this.mapToDomain);
      const totalPages = Math.ceil(total / limit);

      const result: ProductListResult = {
        products,
        total,
        page,
        limit,
        totalPages,
      };

      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to list products: ${error.message}`),
      };
    }
  }

  /**
   * Count products matching filters
   */
  async count(filters: ProductFilters = {}): Promise<Result<number>> {
    try {
      const where: any = {};

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { sku: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const count = await this.prisma.product.count({ where });

      return { success: true, data: count };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to count products: ${error.message}`),
      };
    }
  }

  /**
   * Increment view count for product
   */
  async incrementViewCount(id: string): Promise<Result<Product>> {
    try {
      const prismaProduct = await this.prisma.product.update({
        where: { id },
        data: {
          viewCount: { increment: 1 },
        },
        include: {
          category: true,
        },
      });

      const product = this.mapToDomain(prismaProduct);
      return { success: true, data: product };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Product not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to increment view count: ${error.message}`),
      };
    }
  }

  /**
   * Check if product exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.product.count({
        where: { id },
      });
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if SKU is available
   */
  async isSkuAvailable(sku: string, excludeId?: string): Promise<boolean> {
    try {
      const where: any = { sku };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await this.prisma.product.count({ where });
      return count === 0;
    } catch {
      return false;
    }
  }

  /**
   * Map Prisma product to domain product
   */
  private mapToDomain(prismaProduct: PrismaProduct & { category?: { id: string; name: string } | null }): Product {
    return new Product(
      prismaProduct.id,
      prismaProduct.name,
      prismaProduct.description,
      Number(prismaProduct.price),
      prismaProduct.categoryId,
      prismaProduct.images,
      prismaProduct.sku || undefined,
      prismaProduct.stockQuantity,
      prismaProduct.isActive,
      prismaProduct.viewCount,
      prismaProduct.category ? {
        id: prismaProduct.category.id,
        name: prismaProduct.category.name,
      } : undefined,
      prismaProduct.createdAt,
      prismaProduct.updatedAt
    );
  }
}
