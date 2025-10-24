import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
} from "../../../lib/domain";

export interface CreateProductImageData {
  productId: string;
  imageId: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export class ProductImage extends BaseEntity {
  public readonly productId: string;
  public readonly imageId: string;
  public readonly sortOrder: number;
  public readonly isPrimary: boolean;

  constructor(
    id: string,
    productId: string,
    imageId: string,
    sortOrder: number,
    isPrimary: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.productId = productId;
    this.imageId = imageId;
    this.sortOrder = sortOrder;
    this.isPrimary = isPrimary;
  }

  public static validateCreateData(
    data: CreateProductImageData
  ): ValidationResult {
    const errors: string[] = [];

    if (!data.productId || !data.productId.trim()) {
      errors.push("Product ID is required");
    }

    if (!data.imageId || !data.imageId.trim()) {
      errors.push("Image ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
