import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../../lib/domain";

// Domain types for Image entity
export interface CreateImageData {
  title?: string;
  altText?: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  url: string;
  thumbUrl?: string;
  deleteUrl?: string;
  uploadedBy: string;
  categoryId?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateImageData {
  title?: string;
  altText?: string;
  categoryId?: string;
  tags?: string[];
  isPublic?: boolean;
  isActive?: boolean;
}

export interface ImageFilters {
  uploadedBy?: string;
  categoryId?: string;
  tags?: string[];
  isPublic?: boolean;
  isActive?: boolean;
  mimeType?: string;
  minSize?: number;
  maxSize?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

export interface ImageListResult {
  images: Image[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface UploadMetadata {
  categoryId?: string;
  tags?: string[];
  isPublic?: boolean;
}

// Image domain entity
export class Image extends BaseEntity {
  public readonly title?: string;
  public readonly altText?: string;
  public readonly url: string;
  public readonly thumbUrl?: string;
  public readonly deleteUrl?: string;

  public readonly filename: string;
  public readonly originalName: string;
  public readonly size: number;
  public readonly mimeType: string;
  public readonly width?: number;
  public readonly height?: number;

  public readonly uploadedBy: string;
  public readonly category?: {
    id: string;
    name: string;
  };
  public readonly tags: string[];
  public readonly isPublic: boolean;
  public readonly isActive: boolean;

  constructor(
    id: string,
    title: string | undefined,
    altText: string | undefined,
    url: string,
    thumbUrl: string | undefined,
    deleteUrl: string | undefined,
    filename: string,
    originalName: string,
    size: number,
    mimeType: string,
    width: number | undefined,
    height: number | undefined,
    uploadedBy: string,
    category: { id: string; name: string } | undefined,
    tags: string[],
    isPublic: boolean,
    isActive: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.altText = altText;
    this.url = url;
    this.thumbUrl = thumbUrl;
    this.deleteUrl = deleteUrl;
    this.filename = filename;
    this.originalName = originalName;
    this.size = size;
    this.mimeType = mimeType;
    this.width = width;
    this.height = height;
    this.uploadedBy = uploadedBy;
    this.category = category;
    this.tags = tags;
    this.isPublic = isPublic;
    this.isActive = isActive;
  }

  // Business logic methods
  public isValidImageType(): boolean {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    return validTypes.includes(this.mimeType);
  }

  public getFileSizeMB(): number {
    return Math.round((this.size / (1024 * 1024)) * 100) / 100;
  }

  public getDimensions(): { width: number; height: number } | null {
    if (this.width && this.height) {
      return { width: this.width, height: this.height };
    }
    return null;
  }

  public canBeAccessedBy(userId: string): boolean {
    if (this.isPublic) return true;
    return this.uploadedBy === userId;
  }

  public getDisplayUrl(): string {
    return this.thumbUrl || this.url;
  }

  public hasTag(tag: string): boolean {
    return this.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
  }

  public getAspectRatio(): number | null {
    if (this.width && this.height) {
      return this.width / this.height;
    }
    return null;
  }

  public isLandscape(): boolean {
    const ratio = this.getAspectRatio();
    return ratio ? ratio > 1 : false;
  }

  public isPortrait(): boolean {
    const ratio = this.getAspectRatio();
    return ratio ? ratio < 1 : false;
  }

  public isSquare(): boolean {
    const ratio = this.getAspectRatio();
    return ratio ? ratio === 1 : false;
  }

  public updateDetails(updates: UpdateImageData): Result<Image> {
    const validation = this.validateUpdates(updates);
    if (!validation.isValid) {
      return {
        success: false,
        error: new ValidationError(validation.errors.join(", ")),
      };
    }

    const updatedImage = new Image(
      this.id,
      updates.title !== undefined ? updates.title : this.title,
      updates.altText !== undefined ? updates.altText : this.altText,
      this.url,
      this.thumbUrl,
      this.deleteUrl,
      this.filename,
      this.originalName,
      this.size,
      this.mimeType,
      this.width,
      this.height,
      this.uploadedBy,
      this.category,
      updates.tags !== undefined ? updates.tags : this.tags,
      updates.isPublic !== undefined ? updates.isPublic : this.isPublic,
      updates.isActive !== undefined ? updates.isActive : this.isActive,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedImage,
    };
  }

  public deactivate(): Image {
    return new Image(
      this.id,
      this.title,
      this.altText,
      this.url,
      this.thumbUrl,
      this.deleteUrl,
      this.filename,
      this.originalName,
      this.size,
      this.mimeType,
      this.width,
      this.height,
      this.uploadedBy,
      this.category,
      this.tags,
      this.isPublic,
      false,
      this.createdAt,
      new Date()
    );
  }

  public activate(): Image {
    return new Image(
      this.id,
      this.title,
      this.altText,
      this.url,
      this.thumbUrl,
      this.deleteUrl,
      this.filename,
      this.originalName,
      this.size,
      this.mimeType,
      this.width,
      this.height,
      this.uploadedBy,
      this.category,
      this.tags,
      this.isPublic,
      true,
      this.createdAt,
      new Date()
    );
  }

  // Validation methods
  private validateUpdates(updates: UpdateImageData): ValidationResult {
    const errors: string[] = [];

    if (updates.title !== undefined) {
      if (updates.title && updates.title.length > 255) {
        errors.push("Title must be 255 characters or less");
      }
    }

    if (updates.altText !== undefined) {
      if (updates.altText && updates.altText.length > 255) {
        errors.push("Alt text must be 255 characters or less");
      }
    }

    if (updates.tags !== undefined) {
      if (updates.tags.some((tag) => tag.length > 50)) {
        errors.push("Each tag must be 50 characters or less");
      }
      if (updates.tags.length > 20) {
        errors.push("Maximum 20 tags allowed");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(data: CreateImageData): ValidationResult {
    const errors: string[] = [];

    if (!data.filename || !data.filename.trim()) {
      errors.push("Filename is required");
    } else if (data.filename.length > 255) {
      errors.push("Filename must be 255 characters or less");
    }

    if (!data.originalName || !data.originalName.trim()) {
      errors.push("Original name is required");
    } else if (data.originalName.length > 255) {
      errors.push("Original name must be 255 characters or less");
    }

    if (!data.url || !data.url.trim()) {
      errors.push("URL is required");
    }

    if (data.size === undefined || data.size < 0) {
      errors.push("Valid file size is required");
    } else if (data.size > 10 * 1024 * 1024) {
      // 10MB limit
      errors.push("File size cannot exceed 10MB");
    }

    if (!data.mimeType || !data.mimeType.trim()) {
      errors.push("MIME type is required");
    } else {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(data.mimeType)) {
        errors.push(
          "Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed"
        );
      }
    }

    if (!data.uploadedBy || !data.uploadedBy.trim()) {
      errors.push("Uploader information is required");
    }

    if (data.title && data.title.length > 255) {
      errors.push("Title must be 255 characters or less");
    }

    if (data.altText && data.altText.length > 255) {
      errors.push("Alt text must be 255 characters or less");
    }

    if (data.tags) {
      if (data.tags.some((tag) => tag.length > 50)) {
        errors.push("Each tag must be 50 characters or less");
      }
      if (data.tags.length > 20) {
        errors.push("Maximum 20 tags allowed");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
