import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
} from "../../../lib/domain";

// Domain types for Category entity
export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryFilters {
  parentId?: string;
  isActive?: boolean;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface CategoryTreeNode {
  category: Category;
  children: CategoryTreeNode[];
  depth: number;
}

export interface CategoryListResult {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Category domain entity
export class Category extends BaseEntity {
  public readonly name: string;
  public readonly description?: string;
  public readonly parentId?: string;
  public readonly sortOrder: number;
  public readonly isActive: boolean;

  constructor(
    id: string,
    name: string,
    description?: string,
    parentId?: string,
    sortOrder: number = 0,
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.description = description;
    this.parentId = parentId;
    this.sortOrder = sortOrder;
    this.isActive = isActive;
  }

  // Business logic methods
  public isRoot(): boolean {
    return !this.parentId;
  }

  public isChild(): boolean {
    return !!this.parentId;
  }

  public hasDescription(): boolean {
    return !!this.description && this.description.trim().length > 0;
  }

  public canHaveChildren(): boolean {
    return true; // All categories can have children in this model
  }

  public updateDetails(updates: UpdateCategoryData): Result<Category> {
    // Validate updates
    const validation = this.validateUpdates(updates);
    if (!validation.isValid) {
      return {
        success: false,
        error: new ValidationError(validation.errors.join(", ")),
      };
    }

    // Create updated category
    const updatedCategory = new Category(
      this.id,
      updates.name || this.name,
      updates.description !== undefined
        ? updates.description
        : this.description,
      updates.parentId !== undefined ? updates.parentId : this.parentId,
      updates.sortOrder ?? this.sortOrder,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedCategory,
    };
  }

  public moveToParent(newParentId?: string): Result<Category> {
    // Prevent circular references (would need repository to validate)
    // For now, just ensure parentId is different from current id
    if (newParentId === this.id) {
      return {
        success: false,
        error: new ValidationError("Category cannot be its own parent"),
      };
    }

    const updatedCategory = new Category(
      this.id,
      this.name,
      this.description,
      newParentId,
      this.sortOrder,
      this.isActive,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedCategory,
    };
  }

  public updateSortOrder(newSortOrder: number): Category {
    return new Category(
      this.id,
      this.name,
      this.description,
      this.parentId,
      newSortOrder,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): Category {
    return new Category(
      this.id,
      this.name,
      this.description,
      this.parentId,
      this.sortOrder,
      false,
      this.createdAt,
      new Date()
    );
  }

  public activate(): Category {
    return new Category(
      this.id,
      this.name,
      this.description,
      this.parentId,
      this.sortOrder,
      true,
      this.createdAt,
      new Date()
    );
  }

  // Validation methods
  private validateUpdates(updates: UpdateCategoryData): ValidationResult {
    const errors: string[] = [];

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        errors.push("Category name is required");
      } else if (updates.name.length < 2 || updates.name.length > 100) {
        errors.push("Category name must be between 2 and 100 characters");
      }
    }

    if (updates.description !== undefined && updates.description) {
      if (updates.description.length > 500) {
        errors.push("Description must be 500 characters or less");
      }
    }

    if (updates.sortOrder !== undefined && updates.sortOrder < 0) {
      errors.push("Sort order cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(data: CreateCategoryData): ValidationResult {
    const errors: string[] = [];

    if (!data.name || !data.name.trim()) {
      errors.push("Category name is required");
    } else if (data.name.length < 2 || data.name.length > 100) {
      errors.push("Category name must be between 2 and 100 characters");
    }

    if (data.description && data.description.length > 500) {
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
}

// Value objects for Category domain
export class CategoryName {
  constructor(public readonly value: string) {
    if (!value || value.trim().length < 2 || value.length > 100) {
      throw new ValidationError(
        "Category name must be between 2 and 100 characters"
      );
    }
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: CategoryName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}

export class CategoryPath {
  constructor(public readonly segments: string[]) {
    if (segments.length === 0) {
      throw new ValidationError("Category path cannot be empty");
    }
    if (segments.some((segment) => !segment || segment.trim().length === 0)) {
      throw new ValidationError("Category path segments cannot be empty");
    }
  }

  public toString(separator: string = " > "): string {
    return this.segments.join(separator);
  }

  public getDepth(): number {
    return this.segments.length;
  }

  public getRoot(): string {
    return this.segments[0];
  }

  public getLeaf(): string {
    return this.segments[this.segments.length - 1];
  }

  public addSegment(segment: string): CategoryPath {
    if (!segment || segment.trim().length === 0) {
      throw new ValidationError("Cannot add empty segment to path");
    }
    return new CategoryPath([...this.segments, segment]);
  }

  public removeLastSegment(): CategoryPath {
    if (this.segments.length <= 1) {
      throw new ValidationError(
        "Cannot remove last segment from single-segment path"
      );
    }
    return new CategoryPath(this.segments.slice(0, -1));
  }
}

export class CategoryHierarchy {
  private categories: Map<string, Category> = new Map();
  private childrenMap: Map<string, string[]> = new Map();

  public addCategory(category: Category): void {
    this.categories.set(category.id, category);

    if (category.parentId) {
      const siblings = this.childrenMap.get(category.parentId) || [];
      siblings.push(category.id);
      this.childrenMap.set(category.parentId, siblings);
    } else {
      // Root category
      const rootChildren = this.childrenMap.get("__root__") || [];
      rootChildren.push(category.id);
      this.childrenMap.set("__root__", rootChildren);
    }
  }

  public getCategory(id: string): Category | undefined {
    return this.categories.get(id);
  }

  public getChildren(parentId?: string): Category[] {
    const childIds = this.childrenMap.get(parentId || "__root__") || [];
    return childIds
      .map((id) => this.categories.get(id))
      .filter((cat): cat is Category => cat !== undefined)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getPathToRoot(categoryId: string): Category[] {
    const path: Category[] = [];
    let currentId: string | undefined = categoryId;

    while (currentId) {
      const category = this.categories.get(currentId);
      if (!category) break;

      path.unshift(category);
      currentId = category.parentId;
    }

    return path;
  }

  public getAllDescendants(categoryId: string): Category[] {
    const descendants: Category[] = [];
    const children = this.getChildren(categoryId);

    for (const child of children) {
      descendants.push(child);
      descendants.push(...this.getAllDescendants(child.id));
    }

    return descendants;
  }

  public buildTree(rootId?: string): CategoryTreeNode[] {
    const rootIds = rootId ? [rootId] : this.childrenMap.get("__root__") || [];

    return rootIds
      .map((id) => this.buildTreeNode(id, 0))
      .filter((node): node is CategoryTreeNode => node !== null)
      .sort((a, b) => a.category.sortOrder - b.category.sortOrder);
  }

  private buildTreeNode(
    categoryId: string,
    depth: number
  ): CategoryTreeNode | null {
    const category = this.categories.get(categoryId);
    if (!category) return null;

    const children = this.getChildren(categoryId)
      .map((child) => this.buildTreeNode(child.id, depth + 1))
      .filter((node): node is CategoryTreeNode => node !== null)
      .sort((a, b) => a.category.sortOrder - b.category.sortOrder);

    return {
      category,
      children,
      depth,
    };
  }
}
