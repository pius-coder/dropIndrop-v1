import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
} from "../../../lib/domain";

export interface CreateImageCategoryData {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateImageCategoryData {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export class ImageCategory extends BaseEntity {
  public readonly name: string;
  public readonly description?: string;
  public readonly sortOrder: number;
  public readonly isActive: boolean;

  constructor(
    id: string,
    name: string,
    description: string | undefined,
    sortOrder: number,
    isActive: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.description = description;
    this.sortOrder = sortOrder;
    this.isActive = isActive;
  }

  public static validateCreateData(
    data: CreateImageCategoryData
  ): ValidationResult {
    const errors: string[] = [];

    if (!data.name || !data.name.trim()) {
      errors.push("Category name is required");
    } else if (data.name.length < 2 || data.name.length > 100) {
      errors.push("Category name must be between 2 and 100 characters");
    }

    if (data.description && data.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateUpdateData(
    data: UpdateImageCategoryData
  ): ValidationResult {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name || !data.name.trim()) {
        errors.push("Category name is required");
      } else if (data.name.length < 2 || data.name.length > 100) {
        errors.push("Category name must be between 2 and 100 characters");
      }
    }

    if (
      data.description !== undefined &&
      data.description &&
      data.description.length > 500
    ) {
      errors.push("Description must be 500 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
