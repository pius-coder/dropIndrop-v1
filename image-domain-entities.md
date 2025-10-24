# Image Management Domain Entities

This document defines the domain entities for the image management system, following the project's established architecture patterns.

## Core Domain Types

### Image Entity

```typescript
// src/entities/image/domain/image.ts
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
```

### ImageCategory Entity

```typescript
// src/entities/image/domain/image-category.ts
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
}
```

### ProductImage Junction Entity

```typescript
// src/entities/image/domain/product-image.ts
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
```

### DropImage Junction Entity

```typescript
// src/entities/image/domain/drop-image.ts
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
```

## Service Layer Interfaces

### Image Service

```typescript
// src/entities/image/domain/image-service.ts
import { Result } from "../../../lib/domain";
import {
  Image,
  CreateImageData,
  UpdateImageData,
  ImageFilters,
  ImageListResult,
} from "./image";

export interface IImageService
  extends IService<Image, CreateImageData, UpdateImageData> {
  uploadImage(
    file: File,
    uploaderId: string,
    metadata?: UploadMetadata
  ): Promise<Result<Image>>;
  deleteImage(id: string, userId: string): Promise<Result<boolean>>;
  getImagesByUploader(
    uploaderId: string,
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<Result<ImageListResult>>;
  getPublicImages(
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<Result<ImageListResult>>;
  associateWithProduct(
    imageId: string,
    productId: string,
    isPrimary?: boolean
  ): Promise<Result<ProductImage>>;
  removeFromProduct(
    imageId: string,
    productId: string
  ): Promise<Result<boolean>>;
  associateWithDrop(
    imageId: string,
    dropId: string,
    caption?: string
  ): Promise<Result<DropImage>>;
  removeFromDrop(imageId: string, dropId: string): Promise<Result<boolean>>;
  getProductImages(productId: string): Promise<Result<Image[]>>;
  getDropImages(dropId: string): Promise<Result<Image[]>>;
}
```

### Image Category Service

```typescript
// src/entities/image/domain/image-category-service.ts
import { Result } from "../../../lib/domain";
import {
  ImageCategory,
  CreateImageCategoryData,
  UpdateImageCategoryData,
} from "./image-category";

export interface IImageCategoryService
  extends IService<
    ImageCategory,
    CreateImageCategoryData,
    UpdateImageCategoryData
  > {
  getActiveCategories(): Promise<Result<ImageCategory[]>>;
  getCategoriesWithImageCount(): Promise<
    Result<Array<ImageCategory & { imageCount: number }>>
  >;
}
```

## Repository Interfaces

### Image Repository

```typescript
// src/entities/image/domain/image-repository.ts
import { IRepository } from "../../../lib/domain";
import { Image, ImageFilters } from "./image";

export interface IImageRepository extends IRepository<Image> {
  findByUploader(
    uploaderId: string,
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  findPublic(
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  findByIds(ids: string[]): Promise<Image[]>;
  findByCategory(
    categoryId: string,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  findByTags(
    tags: string[],
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  search(
    query: string,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
}
```

### Product Image Repository

```typescript
// src/entities/image/domain/product-image-repository.ts
import { IRepository } from "../../../lib/domain";
import { ProductImage } from "./product-image";

export interface IProductImageRepository extends IRepository<ProductImage> {
  findByProduct(productId: string): Promise<ProductImage[]>;
  findByImage(imageId: string): Promise<ProductImage[]>;
  findPrimaryImage(productId: string): Promise<ProductImage | null>;
  updateSortOrder(
    productId: string,
    imageOrders: Array<{ imageId: string; sortOrder: number }>
  ): Promise<boolean>;
}
```

## Value Objects

### ImageMetadata

```typescript
// src/entities/image/domain/image-metadata.ts
export class ImageMetadata {
  constructor(
    public readonly width?: number,
    public readonly height?: number,
    public readonly colorSpace?: string,
    public readonly hasAlpha?: boolean,
    public readonly compression?: string
  ) {}

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
}
```

### ImageTag

```typescript
// src/entities/image/domain/image-tag.ts
export class ImageTag {
  constructor(public readonly value: string) {
    if (!value || value.length > 50) {
      throw new ValidationError("Tag must be between 1 and 50 characters");
    }
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ImageTag): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
```

## Domain Events

### ImageUploadedEvent

```typescript
// src/entities/image/domain/events/image-uploaded-event.ts
import { DomainEvent } from "../../../lib/domain";

export class ImageUploadedEvent implements DomainEvent {
  public readonly id: string;
  public readonly type: string = "ImageUploaded";
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly data: {
    imageId: string;
    uploaderId: string;
    filename: string;
    size: number;
    mimeType: string;
  };

  constructor(
    imageId: string,
    uploaderId: string,
    filename: string,
    size: number,
    mimeType: string
  ) {
    this.id = `image-uploaded-${imageId}-${Date.now()}`;
    this.aggregateId = imageId;
    this.timestamp = new Date();
    this.data = {
      imageId,
      uploaderId,
      filename,
      size,
      mimeType,
    };
  }
}
```

### ImageDeletedEvent

```typescript
// src/entities/image/domain/events/image-deleted-event.ts
import { DomainEvent } from "../../../lib/domain";

export class ImageDeletedEvent implements DomainEvent {
  public readonly id: string;
  public readonly type: string = "ImageDeleted";
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly data: {
    imageId: string;
    deletedBy: string;
    reason?: string;
  };

  constructor(imageId: string, deletedBy: string, reason?: string) {
    this.id = `image-deleted-${imageId}-${Date.now()}`;
    this.aggregateId = imageId;
    this.timestamp = new Date();
    this.data = {
      imageId,
      deletedBy,
      reason,
    };
  }
}
```

## Implementation Notes

1. **Entity Inheritance**: All entities extend `BaseEntity` following project conventions
2. **Result Pattern**: All service methods return `Result<T>` or `Result<T[]>`
3. **Validation**: Comprehensive validation with detailed error messages
4. **Business Logic**: Rich domain logic encapsulated in entity methods
5. **Events**: Domain events for significant business operations
6. **Type Safety**: Strong typing throughout the domain layer

This domain design provides a solid foundation for the image management system while maintaining consistency with the existing project architecture.
