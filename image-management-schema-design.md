# Image Management System Schema Design

## Overview

This document outlines the design for a comprehensive image management system that replaces the current simple string array approach with a dedicated Images entity. The new system provides metadata tracking, upload history, access control, and better scalability.

## Current State Analysis

### Current Approach (Issues)

- Products use `images: String[]` field storing only URLs
- No metadata tracking (file size, dimensions, mime type)
- No upload history or user attribution
- No access control or organization
- Limited querying capabilities
- No support for multiple image variants
- No deletion tracking or cleanup

### Current Infrastructure

- **Storage**: ImgBB cloud service (already configured)
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: Domain-driven design with clean separation
- **Patterns**: BaseEntity inheritance, Result pattern for services

## Requirements Analysis

### Functional Requirements

1. **Comprehensive Metadata**: Track file details (size, dimensions, mime type, filename)
2. **Upload Attribution**: Link images to users who uploaded them
3. **Multi-Entity Support**: Support images for products, drops, and general media
4. **Organization**: Categorize and tag images for better management
5. **Access Control**: Role-based permissions for image operations
6. **Audit Trail**: Track creation, updates, and access history

### Non-Functional Requirements

1. **Performance**: Efficient queries for image retrieval
2. **Scalability**: Support for high volume of image uploads
3. **Security**: Prevent unauthorized access and uploads
4. **Storage**: Cloud-based storage with fallback options
5. **Migration**: Seamless transition from current approach

## Proposed Schema Design

### Core Image Entity

```prisma
model Image {
  id          String   @id @default(cuid())
  title       String?  @db.VarChar(255) // User-provided title/description
  altText     String?  @db.VarChar(255) // Accessibility alt text
  url         String   @db.VarChar(500) // Primary image URL
  thumbUrl    String?  @db.VarChar(500) // Thumbnail URL
  deleteUrl   String?  @db.VarChar(500) // ImgBB deletion URL

  // File metadata
  filename    String   @db.VarChar(255) // Original filename
  originalName String  @db.VarChar(255) // Display name
  size        Int      // File size in bytes
  mimeType    String   @db.VarChar(100) // MIME type
  width       Int?     // Image width in pixels
  height      Int?     // Image height in pixels

  // Upload tracking
  uploadedBy  String   // User ID who uploaded
  uploader    User     @relation("UploadedImages", fields: [uploadedBy], references: [id])

  // Organization
  category    ImageCategory? // Optional categorization
  tags        String[]       // JSON array of tags
  isPublic    Boolean  @default(true) // Public visibility

  // Status and metadata
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now()) @db.Timestamp(6)
  updatedAt   DateTime @updatedAt @db.Timestamp(6)

  // Relations to other entities
  products    ProductImage[]
  drops       DropImage[]

  @@map("images")
}
```

### Supporting Entities

```prisma
// Image categories for organization
model ImageCategory {
  id          String   @id @default(cuid())
  name        String   @unique @db.VarChar(100)
  description String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now()) @db.Timestamp(6)
  updatedAt   DateTime @updatedAt @db.Timestamp(6)

  // Relations
  images      Image[]

  @@map("image_categories")
}

// Many-to-many: Images and Products
model ProductImage {
  productId String
  imageId   String
  sortOrder Int    @default(0) // Display order
  isPrimary Boolean @default(false) // Primary product image

  // Relations
  product Product @relation(fields: [productId], references: [id])
  image   Image   @relation(fields: [imageId], references: [id])

  @@id([productId, imageId])
  @@map("product_images")
}

// Many-to-many: Images and Drops
model DropImage {
  dropId    String
  imageId   String
  sortOrder Int    @default(0) // Display order
  caption   String? @db.VarChar(500) // Optional caption for drop context

  // Relations
  drop  Drop  @relation(fields: [dropId], references: [id])
  image Image @relation(fields: [imageId], references: [id])

  @@id([dropId, imageId])
  @@map("drop_images")
}
```

### Enhanced User Model

Add relation to uploaded images:

```prisma
model User {
  // ... existing fields ...

  // Relations
  uploadedImages Image[] @relation("UploadedImages")

  // ... rest of existing relations ...
}
```

### Enhanced Product Model

Replace `images: String[]` with relation:

```prisma
model Product {
  // ... existing fields except images ...

  // Relations
  images ProductImage[]

  // ... rest of existing relations ...
}
```

## Domain Architecture

### Image Entity Domain

```typescript
// src/entities/image/domain/image.ts
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
  public readonly category?: ImageCategory;
  public readonly tags: string[];
  public readonly isPublic: boolean;
  public readonly isActive: boolean;

  // Business methods
  public isValidImageType(): boolean;
  public getFileSizeMB(): number;
  public getDimensions(): { width: number; height: number } | null;
  public canBeAccessedBy(user: User): boolean;
  public getDisplayUrl(): string;
}
```

### Service Layer

```typescript
// src/entities/image/domain/image-service.ts
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
    filters?: ImageFilters
  ): Promise<Result<Image[]>>;
  associateWithProduct(
    imageId: string,
    productId: string,
    isPrimary?: boolean
  ): Promise<Result<ProductImage>>;
  associateWithDrop(
    imageId: string,
    dropId: string,
    caption?: string
  ): Promise<Result<DropImage>>;
}
```

## Migration Strategy

### Phase 1: Schema Migration

1. Create new Image, ImageCategory, ProductImage, DropImage tables
2. Add uploadedImages relation to User table
3. Create indexes for performance

### Phase 2: Data Migration

1. Create migration script to convert existing Product.images arrays
2. For each product with images:
   - Create Image records with metadata from ImgBB API
   - Link images to products via ProductImage junction table
   - Update Product records to remove images field

### Phase 3: API Updates

1. Update upload API to create Image records
2. Update product APIs to work with new relations
3. Add new image management endpoints

## Performance Considerations

### Indexes

```prisma
// Performance-critical indexes
@@index([uploadedBy])         // Images by uploader
@@index([categoryId])         // Images by category
@@index([isActive])           // Active images
@@index([createdAt])          // Recent images
@@index([mimeType])           // Images by type
@@index([isPublic, isActive]) // Public active images
```

### Query Optimization

- Use select fields to avoid over-fetching
- Implement pagination for large image lists
- Cache frequently accessed images
- Lazy load related entities

## Security Considerations

### Access Control

- Users can only manage images they uploaded
- Role-based permissions for admin operations
- Public/private image visibility
- API authentication and authorization

### File Upload Security

- File type validation (existing service covers this)
- File size limits (existing service covers this)
- Virus scanning integration (future enhancement)
- Rate limiting for uploads

## API Design

### Upload Endpoints

```
POST /api/images/upload
- Body: FormData with file and metadata
- Returns: Image record with URLs

GET /api/images
- Query: filters, pagination
- Returns: List of images

GET /api/images/:id
- Returns: Single image with metadata

DELETE /api/images/:id
- Requires ownership verification
- Returns: Success confirmation
```

### Association Endpoints

```
POST /api/products/:id/images
- Body: { imageId, isPrimary, sortOrder }
- Links image to product

POST /api/drops/:id/images
- Body: { imageId, caption, sortOrder }
- Links image to drop
```

## Benefits of New Design

1. **Better Metadata Management**: Track comprehensive file information
2. **Upload Attribution**: Know who uploaded each image
3. **Flexible Relationships**: Images can be used across multiple entities
4. **Better Organization**: Categories and tags for management
5. **Access Control**: Proper permissions and visibility settings
6. **Audit Trail**: Complete history of image operations
7. **Performance**: Optimized queries and indexing
8. **Scalability**: Support for future requirements
9. **Migration Path**: Clear transition from current approach

## Implementation Plan

1. **Week 1**: Schema design and migration scripts
2. **Week 2**: Domain entities and service layer
3. **Week 3**: API endpoints and integration
4. **Week 4**: Testing and data migration
5. **Week 5**: Documentation and deployment

This design provides a robust foundation for image management while maintaining compatibility with the existing ImgBB infrastructure and following the project's established architectural patterns.
