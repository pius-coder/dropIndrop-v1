import { PrismaClient, Category as PrismaCategory } from "@prisma/client";
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters,
  CategoryListResult,
  CategoryTreeNode,
} from "./category";
import {
  Result,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../lib/domain";

export class CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new category
   */
  async create(data: CreateCategoryData): Promise<Result<Category>> {
    try {
      console.log("CategoryRepository: Creating category in database:", data);

      const prismaCategory = await this.prisma.category.create({
        data: {
          name: data.name,
          description: data.description,
          parentId: data.parentId,
          sortOrder: data.sortOrder || 0,
        },
      });

      console.log(
        "CategoryRepository: Category created in database:",
        prismaCategory
      );
      const category = this.mapToDomain(prismaCategory);
      return { success: true, data: category };
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: new ConflictError("Category with this name already exists"),
        };
      }
      if (error.code === "P2003") {
        return {
          success: false,
          error: new ValidationError("Invalid parent category ID"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to create category: ${error.message}`),
      };
    }
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<Result<Category>> {
    try {
      const prismaCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!prismaCategory) {
        return {
          success: false,
          error: new NotFoundError("Category not found"),
        };
      }

      const category = this.mapToDomain(prismaCategory);
      return { success: true, data: category };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to find category: ${error.message}`),
      };
    }
  }

  /**
   * Update category
   */
  async update(
    id: string,
    data: UpdateCategoryData
  ): Promise<Result<Category>> {
    try {
      const prismaCategory = await this.prisma.category.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.parentId !== undefined && { parentId: data.parentId }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      const category = this.mapToDomain(prismaCategory);
      return { success: true, data: category };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Category not found"),
        };
      }
      if (error.code === "P2002") {
        return {
          success: false,
          error: new ConflictError("Category with this name already exists"),
        };
      }
      if (error.code === "P2003") {
        return {
          success: false,
          error: new ValidationError("Invalid parent category ID"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to update category: ${error.message}`),
      };
    }
  }

  /**
   * Delete category
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      // Check if category has children
      const childrenCount = await this.prisma.category.count({
        where: { parentId: id },
      });

      if (childrenCount > 0) {
        return {
          success: false,
          error: new ConflictError(
            "Cannot delete category with child categories"
          ),
        };
      }

      // Check if category has products
      const productsCount = await this.prisma.product.count({
        where: { categoryId: id },
      });

      if (productsCount > 0) {
        return {
          success: false,
          error: new ConflictError(
            "Cannot delete category with associated products"
          ),
        };
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return { success: true, data: undefined };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Category not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to delete category: ${error.message}`),
      };
    }
  }

  /**
   * List categories with filtering and pagination
   */
  async list(
    filters: CategoryFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<CategoryListResult>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.parentId !== undefined) {
        where.parentId = filters.parentId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
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
      const total = await this.prisma.category.count({ where });

      // Get categories
      const prismaCategories = await this.prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip,
        take: limit,
      });

      const categories = prismaCategories.map(this.mapToDomain);
      const totalPages = Math.ceil(total / limit);

      const result: CategoryListResult = {
        categories,
        total,
        page,
        limit,
        totalPages,
      };

      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to list categories: ${error.message}`),
      };
    }
  }

  /**
   * Get category tree structure
   */
  async getTree(): Promise<Result<CategoryTreeNode[]>> {
    try {
      const prismaCategories = await this.prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });

      const categories = prismaCategories.map(this.mapToDomain);
      const tree = this.buildTree(categories);

      return { success: true, data: tree };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get category tree: ${error.message}`),
      };
    }
  }

  /**
   * Get all descendants of a category
   */
  async getDescendants(categoryId: string): Promise<Result<Category[]>> {
    try {
      // First, get the category to ensure it exists
      const categoryResult = await this.findById(categoryId);
      if (!categoryResult.success) {
        return categoryResult;
      }

      // Get all descendants using a recursive approach
      const descendants = await this.getAllDescendants(categoryId);
      return { success: true, data: descendants };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get descendants: ${error.message}`),
      };
    }
  }

  /**
   * Get path from root to category
   */
  async getPathToRoot(categoryId: string): Promise<Result<Category[]>> {
    try {
      const path: Category[] = [];
      let currentId: string | undefined = categoryId;

      while (currentId) {
        const categoryResult = await this.findById(currentId);
        if (!categoryResult.success) {
          return categoryResult;
        }

        path.unshift(categoryResult.data);
        currentId = categoryResult.data.parentId;
      }

      return { success: true, data: path };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get path to root: ${error.message}`),
      };
    }
  }

  /**
   * Check if category exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.category.count({
        where: { id },
      });
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if category can be deleted (no children, no products)
   */
  async canDelete(id: string): Promise<Result<boolean>> {
    try {
      // Check if category has children
      const childrenCount = await this.prisma.category.count({
        where: { parentId: id },
      });

      // Check if category has products
      const productsCount = await this.prisma.product.count({
        where: { categoryId: id },
      });

      const canDelete = childrenCount === 0 && productsCount === 0;

      return { success: true, data: canDelete };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(
          `Failed to check if category can be deleted: ${error.message}`
        ),
      };
    }
  }

  /**
   * Move category to new parent
   */
  async moveToParent(
    id: string,
    newParentId?: string
  ): Promise<Result<Category>> {
    try {
      // Prevent circular references
      if (newParentId) {
        const isDescendant = await this.isDescendantOf(id, newParentId);
        if (isDescendant) {
          return {
            success: false,
            error: new ValidationError(
              "Cannot move category to its own descendant"
            ),
          };
        }
      }

      const prismaCategory = await this.prisma.category.update({
        where: { id },
        data: { parentId: newParentId },
      });

      const category = this.mapToDomain(prismaCategory);
      return { success: true, data: category };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Category not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to move category: ${error.message}`),
      };
    }
  }

  /**
   * Helper method to check if a category is a descendant of another
   */
  private async isDescendantOf(
    categoryId: string,
    potentialAncestorId: string
  ): Promise<boolean> {
    let currentId: string | undefined = categoryId;

    while (currentId) {
      if (currentId === potentialAncestorId) {
        return true;
      }

      const parentData: { parentId: string | null } | null =
        await this.prisma.category.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });

      currentId = parentData?.parentId || undefined;
    }

    return false;
  }

  /**
   * Helper method to get all descendants recursively
   */
  private async getAllDescendants(categoryId: string): Promise<Category[]> {
    const descendants: Category[] = [];

    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    for (const child of children) {
      descendants.push(this.mapToDomain(child));
      const childDescendants = await this.getAllDescendants(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  /**
   * Helper method to build tree structure
   */
  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
    const childrenMap = new Map<string, Category[]>();

    // Group children by parent
    categories.forEach((category) => {
      const parentId = category.parentId || "__root__";
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(category);
    });

    // Sort children
    childrenMap.forEach((children) => {
      children.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
      );
    });

    const buildNode = (category: Category, depth: number): CategoryTreeNode => {
      const children = childrenMap.get(category.id) || [];
      return {
        category,
        children: children.map((child) => buildNode(child, depth + 1)),
        depth,
      };
    };

    const rootCategories = childrenMap.get("__root__") || [];
    return rootCategories.map((cat) => buildNode(cat, 0));
  }

  /**
   * Map Prisma category to domain category
   */
  private mapToDomain(prismaCategory: PrismaCategory): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.name,
      prismaCategory.description || undefined,
      prismaCategory.parentId || undefined,
      prismaCategory.sortOrder,
      prismaCategory.isActive,
      prismaCategory.createdAt,
      prismaCategory.updatedAt
    );
  }
}
