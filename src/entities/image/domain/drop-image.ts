import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
} from "../../../lib/domain";

export interface CreateDropImageData {
  dropId: string;
  imageId: string;
  sortOrder?: number;
  caption?: string;
}

export class DropImage extends BaseEntity {
  public readonly dropId: string;
  public readonly imageId: string;
  public readonly sortOrder: number;
  public readonly caption?: string;

  constructor(
    id: string,
    dropId: string,
    imageId: string,
    sortOrder: number,
    caption: string | undefined,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.dropId = dropId;
    this.imageId = imageId;
    this.sortOrder = sortOrder;
    this.caption = caption;
  }

  public static validateCreateData(
    data: CreateDropImageData
  ): ValidationResult {
    const errors: string[] = [];

    if (!data.dropId || !data.dropId.trim()) {
      errors.push("Drop ID is required");
    }

    if (!data.imageId || !data.imageId.trim()) {
      errors.push("Image ID is required");
    }

    if (data.caption && data.caption.length > 500) {
      errors.push("Caption must be 500 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
