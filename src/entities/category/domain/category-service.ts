import { PrismaClient } from "@prisma/client";
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters,
  CategoryListResult,
  CategoryTreeNode,
  CategoryHierarchy,
} from "./category";
import { CategoryRepository } from "./category-repository";
import {
  Result,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../../lib/domain";

// Additional service interfaces
export interface CategoryAnalytics {
  totalCategories: number;
  activeCategories: number;
  rootCategories: number;
  maxDepth: number;
  categoriesWithProducts: number;
  emptyCategories: number;
}

export interface CategoryMoveData {
  categoryId: string;
  newParentId?: string;
  newSortOrder?: number;
}

export interface BulkCategoryOperation {
  type: "move" | "activate" | "deactivate" | "delete";
  categoryIds: string[];
  data?: any;
}

export interface CategoryServiceDependencies {
  categoryRepository: CategoryRepository;
  productRepository: any; // Will be imported when ProductService is created
  prisma: PrismaClient;
}

export class CategoryService {
  constructor(private readonly deps: CategoryServiceDependencies) {}

  /**
   * Create a new category with business rule validation
   */
  async create(data: CreateCategoryData): Promise<Result<Category>> {
    try {
      console.log("CategoryService: Creating category with data:", data);

      // Validate business rules
      const validation = await this.validateCreateData(data);
      if (!validation.isValid) {
        console.error("CategoryService: Validation failed:", validation.errors);
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Check parent exists if specified
      if (data.parentId) {
        const parentExists = await this.deps.categoryRepository.exists(
          data.parentId
        );
        if (!parentExists) {
          return {
            success: false,
            error: new ValidationError("Parent category does not exist"),
          };
        }

        // Prevent deep nesting (max depth 5)
        const parentDepth = await this.getCategoryDepth(data.parentId);
        if (parentDepth >= 4) {
          return {
            success: false,
            error: new ValidationError(
              "Maximum category depth exceeded (max 5 levels)"
            ),
          };
        }
      }

      // Check name uniqueness within parent
      const nameExists = await this.categoryNameExists(
        data.name,
        data.parentId
      );
      if (nameExists) {
        return {
          success: false,
          error: new ConflictError(
            "Category name already exists at this level"
          ),
        };
      }

      // Create category
      const result = await this.deps.categoryRepository.create(data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to create category: ${error.message}`),
      };
    }
  }

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<Result<Category>> {
    try {
      return await this.deps.categoryRepository.findById(id);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get category: ${error.message}`),
      };
    }
  }

  /**
   * Update category with business rule validation
   */
  async update(
    id: string,
    data: UpdateCategoryData
  ): Promise<Result<Category>> {
    try {
      // Check if category exists
      const existingResult = await this.deps.categoryRepository.findById(id);
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

      // Check parent exists if being updated
      if (data.parentId !== undefined) {
        if (data.parentId) {
          const parentExists = await this.deps.categoryRepository.exists(
            data.parentId
          );
          if (!parentExists) {
            return {
              success: false,
              error: new ValidationError("Parent category does not exist"),
            };
          }

          // Prevent circular references
          const isDescendant = await this.isDescendantOf(id, data.parentId);
          if (isDescendant) {
            return {
              success: false,
              error: new ValidationError(
                "Cannot move category to its own descendant"
              ),
            };
          }

          // Prevent deep nesting
          const parentDepth = await this.getCategoryDepth(data.parentId);
          if (parentDepth >= 4) {
            return {
              success: false,
              error: new ValidationError(
                "Maximum category depth exceeded (max 5 levels)"
              ),
            };
          }
        }
      }

      // Check name uniqueness if being updated
      if (data.name) {
        const currentCategory = existingResult.data;
        const nameExists = await this.categoryNameExists(
          data.name,
          data.parentId !== undefined
            ? data.parentId
            : currentCategory.parentId,
          id
        );
        if (nameExists) {
          return {
            success: false,
            error: new ConflictError(
              "Category name already exists at this level"
            ),
          };
        }
      }

      // Update category
      const result = await this.deps.categoryRepository.update(id, data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to update category: ${error.message}`),
      };
    }
  }

  /**
   * Delete category with business rule validation
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      // Check if category can be deleted
      const canDeleteResult = await this.deps.categoryRepository.canDelete(id);
      if (!canDeleteResult.success) {
        return canDeleteResult;
      }

      if (!canDeleteResult.data) {
        return {
          success: false,
          error: new ValidationError(
            "Cannot delete category with child categories or associated products"
          ),
        };
      }

      // Delete category
      return await this.deps.categoryRepository.delete(id);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to delete category: ${error.message}`),
      };
    }
  }

  /**
   * List categories with enhanced filtering
   */
  async list(
    filters: CategoryFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<CategoryListResult>> {
    try {
      return await this.deps.categoryRepository.list(filters, page, limit);
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
      return await this.deps.categoryRepository.getTree();
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get category tree: ${error.message}`),
      };
    }
  }

  /**
   * Get category path from root to category
   */
  async getPathToRoot(categoryId: string): Promise<Result<Category[]>> {
    try {
      return await this.deps.categoryRepository.getPathToRoot(categoryId);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get path to root: ${error.message}`),
      };
    }
  }

  /**
   * Get all descendants of a category
   */
  async getDescendants(categoryId: string): Promise<Result<Category[]>> {
    try {
      return await this.deps.categoryRepository.getDescendants(categoryId);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get descendants: ${error.message}`),
      };
    }
  }

  /**
   * Move category to new parent
   */
  async moveCategory(
    categoryId: string,
    newParentId?: string,
    newSortOrder?: number
  ): Promise<Result<Category>> {
    try {
      // Validate move operation
      const validation = await this.validateMoveOperation(
        categoryId,
        newParentId
      );
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Move category
      const result = await this.deps.categoryRepository.moveToParent(
        categoryId,
        newParentId
      );
      if (!result.success) {
        return result;
      }

      // Update sort order if provided
      if (newSortOrder !== undefined) {
        const updateData: UpdateCategoryData = { sortOrder: newSortOrder };
        return await this.deps.categoryRepository.update(
          categoryId,
          updateData
        );
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to move category: ${error.message}`),
      };
    }
  }

  /**
   * Bulk move categories
   */
  async bulkMoveCategories(
    moves: CategoryMoveData[]
  ): Promise<Result<Category[]>> {
    try {
      const results: Category[] = [];
      const errors: string[] = [];

      // Use transaction for atomicity
      await this.deps.prisma.$transaction(async (tx) => {
        for (const move of moves) {
          const result = await this.moveCategory(
            move.categoryId,
            move.newParentId,
            move.newSortOrder
          );

          if (result.success) {
            results.push(result.data);
          } else {
            errors.push(`Category ${move.categoryId}: ${result.error.message}`);
          }
        }
      });

      if (errors.length > 0) {
        return {
          success: false,
          error: new ValidationError(`Bulk move failed: ${errors.join("; ")}`),
        };
      }

      return { success: true, data: results };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to bulk move categories: ${error.message}`),
      };
    }
  }

  /**
   * Reorder categories within parent
   */
  async reorderCategories(
    parentId: string | undefined,
    categoryIds: string[]
  ): Promise<Result<Category[]>> {
    try {
      const results: Category[] = [];
      const errors: string[] = [];

      // Validate all categories exist and belong to the parent
      for (const categoryId of categoryIds) {
        const categoryResult = await this.deps.categoryRepository.findById(
          categoryId
        );
        if (!categoryResult.success) {
          errors.push(`Category ${categoryId} not found`);
          continue;
        }

        const category = categoryResult.data;
        if (category.parentId !== parentId) {
          errors.push(
            `Category ${categoryId} does not belong to the specified parent`
          );
          continue;
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: new ValidationError(
            `Reorder validation failed: ${errors.join("; ")}`
          ),
        };
      }

      // Update sort orders
      await this.deps.prisma.$transaction(async (tx) => {
        for (let i = 0; i < categoryIds.length; i++) {
          const updateData: UpdateCategoryData = { sortOrder: i };
          const result = await this.deps.categoryRepository.update(
            categoryIds[i],
            updateData
          );

          if (result.success) {
            results.push(result.data);
          } else {
            errors.push(
              `Failed to update ${categoryIds[i]}: ${result.error.message}`
            );
          }
        }
      });

      if (errors.length > 0) {
        return {
          success: false,
          error: new ValidationError(`Reorder failed: ${errors.join("; ")}`),
        };
      }

      return { success: true, data: results };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to reorder categories: ${error.message}`),
      };
    }
  }

  /**
   * Get category analytics
   */
  async getAnalytics(): Promise<Result<CategoryAnalytics>> {
    try {
      // Get all categories
      const allCategoriesResult = await this.deps.categoryRepository.list(
        {},
        1,
        10000
      );
      if (!allCategoriesResult.success) {
        return {
          success: false,
          error: allCategoriesResult.error,
        };
      }

      const categories = allCategoriesResult.data.categories;

      // Calculate analytics
      const totalCategories = categories.length;
      const activeCategories = categories.filter((c) => c.isActive).length;
      const rootCategories = categories.filter((c) => !c.parentId).length;

      // Calculate max depth
      let maxDepth = 0;
      for (const category of categories) {
        const depth = await this.getCategoryDepth(category.id);
        maxDepth = Math.max(maxDepth, depth);
      }

      // Count categories with/without products
      let categoriesWithProducts = 0;
      let emptyCategories = 0;

      for (const category of categories) {
        const productCount = await this.deps.productRepository.count({
          categoryId: category.id,
        });
        if (productCount.success && productCount.data > 0) {
          categoriesWithProducts++;
        } else {
          emptyCategories++;
        }
      }

      const analytics: CategoryAnalytics = {
        totalCategories,
        activeCategories,
        rootCategories,
        maxDepth,
        categoriesWithProducts,
        emptyCategories,
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
   * Get categories with no products
   */
  async getEmptyCategories(): Promise<Result<Category[]>> {
    try {
      const allCategoriesResult = await this.deps.categoryRepository.list(
        {},
        1,
        10000
      );
      if (!allCategoriesResult.success) {
        return allCategoriesResult;
      }

      const emptyCategories: Category[] = [];

      for (const category of allCategoriesResult.data.categories) {
        const productCount = await this.deps.productRepository.count({
          categoryId: category.id,
        });
        if (productCount.success && productCount.data === 0) {
          emptyCategories.push(category);
        }
      }

      return { success: true, data: emptyCategories };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get empty categories: ${error.message}`),
      };
    }
  }

  /**
   * Deactivate category
   */
  async deactivate(id: string): Promise<Result<Category>> {
    try {
      const updateData: UpdateCategoryData = { isActive: false };
      return await this.deps.categoryRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to deactivate category: ${error.message}`),
      };
    }
  }

  /**
   * Activate category
   */
  async activate(id: string): Promise<Result<Category>> {
    try {
      const updateData: UpdateCategoryData = { isActive: true };
      return await this.deps.categoryRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to activate category: ${error.message}`),
      };
    }
  }

  /**
   * Get category depth in hierarchy
   */
  private async getCategoryDepth(categoryId: string): Promise<number> {
    try {
      const pathResult = await this.deps.categoryRepository.getPathToRoot(
        categoryId
      );
      return pathResult.success ? pathResult.data.length - 1 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Check if category name exists within a parent
   */
  private async categoryNameExists(
    name: string,
    parentId?: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const filters: CategoryFilters = {
        parentId: parentId,
        search: name,
      };

      const result = await this.deps.categoryRepository.list(filters, 1, 1000);
      if (!result.success) {
        return false;
      }

      const categories = result.data.categories.filter(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );

      if (excludeId) {
        return categories.some((c) => c.id !== excludeId);
      }

      return categories.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if a category is a descendant of another
   */
  private async isDescendantOf(
    categoryId: string,
    potentialAncestorId: string
  ): Promise<boolean> {
    try {
      const descendantsResult =
        await this.deps.categoryRepository.getDescendants(potentialAncestorId);
      return (
        descendantsResult.success &&
        descendantsResult.data.some((c) => c.id === categoryId)
      );
    } catch {
      return false;
    }
  }

  /**
   * Validate create data with business rules
   */
  private async validateCreateData(
    data: CreateCategoryData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    const basicValidation = Category.validateCreateData(data);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    // Business rules
    if (data.name.length < 2) {
      errors.push("Category name must be at least 2 characters");
    }

    if (data.name.length > 100) {
      errors.push("Category name must be 100 characters or less");
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
    categoryId: string,
    data: UpdateCategoryData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get current category for context
    const currentResult = await this.deps.categoryRepository.findById(
      categoryId
    );
    if (!currentResult.success) {
      errors.push("Category not found");
      return { isValid: false, errors };
    }

    // Business rules
    if (data.name !== undefined) {
      if (data.name.length < 2) {
        errors.push("Category name must be at least 2 characters");
      }
      if (data.name.length > 100) {
        errors.push("Category name must be 100 characters or less");
      }
    }

    if (data.description !== undefined && data.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      errors.push("Sort order cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate move operation
   */
  private async validateMoveOperation(
    categoryId: string,
    newParentId?: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if category exists
    const categoryExists = await this.deps.categoryRepository.exists(
      categoryId
    );
    if (!categoryExists) {
      errors.push("Category to move does not exist");
      return { isValid: false, errors };
    }

    // Check if new parent exists (if specified)
    if (newParentId) {
      const parentExists = await this.deps.categoryRepository.exists(
        newParentId
      );
      if (!parentExists) {
        errors.push("New parent category does not exist");
        return { isValid: false, errors };
      }

      // Prevent moving to self
      if (newParentId === categoryId) {
        errors.push("Cannot move category to itself");
        return { isValid: false, errors };
      }

      // Prevent circular references
      const isDescendant = await this.isDescendantOf(categoryId, newParentId);
      if (isDescendant) {
        errors.push("Cannot move category to its own descendant");
        return { isValid: false, errors };
      }

      // Check depth limit
      const parentDepth = await this.getCategoryDepth(newParentId);
      if (parentDepth >= 4) {
        errors.push("Maximum category depth exceeded (max 5 levels)");
        return { isValid: false, errors };
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
