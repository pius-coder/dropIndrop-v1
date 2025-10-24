# Image Management Database Relationships

This document outlines the database relationships and schema design for the image management system.

## Entity Relationship Diagram

```
User (1) ──── (N) Image
  │            │
  │            ├── (1) ImageCategory
  │            │
  │            ├── (N) ProductImage (N) ──── (1) Product
  │            │
  │            └── (N) DropImage (N) ──── (1) Drop
```

## Detailed Schema Definitions

### Image Table

**Primary Purpose**: Store comprehensive image metadata and manage file relationships

**Fields**:

- `id`: Primary key (CUID format)
- `title`: Optional user-provided title/description (VARCHAR 255)
- `altText`: Accessibility alt text (VARCHAR 255)
- `url`: Primary image URL from ImgBB (VARCHAR 500)
- `thumbUrl`: Thumbnail URL from ImgBB (VARCHAR 500)
- `deleteUrl`: ImgBB deletion URL (VARCHAR 500)
- `filename`: Original filename (VARCHAR 255)
- `originalName`: Display name (VARCHAR 255)
- `size`: File size in bytes (INTEGER)
- `mimeType`: MIME type (VARCHAR 100)
- `width`: Image width in pixels (INTEGER, nullable)
- `height`: Image height in pixels (INTEGER, nullable)
- `uploadedBy`: Foreign key to User (VARCHAR, indexed)
- `categoryId`: Foreign key to ImageCategory (VARCHAR, nullable, indexed)
- `tags`: JSON array of tags (JSON)
- `isPublic`: Visibility flag (BOOLEAN, default true)
- `isActive`: Active status (BOOLEAN, default true)
- `createdAt`: Creation timestamp (TIMESTAMP)
- `updatedAt`: Update timestamp (TIMESTAMP)

**Indexes**:

- Primary key on `id`
- Foreign key index on `uploadedBy`
- Foreign key index on `categoryId`
- Composite index on `isActive`
- Composite index on `createdAt`
- Composite index on `mimeType`
- Composite index on `isPublic, isActive`

**Constraints**:

- File size limit: 10MB maximum
- URL length: 500 characters maximum
- Valid MIME types: image/jpeg, image/png, image/webp, image/gif

### ImageCategory Table

**Primary Purpose**: Organize images into logical categories

**Fields**:

- `id`: Primary key (CUID format)
- `name`: Category name (VARCHAR 100, unique)
- `description`: Optional description (TEXT, nullable)
- `sortOrder`: Display sort order (INTEGER, default 0)
- `isActive`: Active status (BOOLEAN, default true)
- `createdAt`: Creation timestamp (TIMESTAMP)
- `updatedAt`: Update timestamp (TIMESTAMP)

**Indexes**:

- Primary key on `id`
- Unique index on `name`
- Index on `sortOrder`
- Index on `isActive`

### ProductImage Junction Table

**Primary Purpose**: Many-to-many relationship between Products and Images

**Fields**:

- `productId`: Foreign key to Product (composite primary key)
- `imageId`: Foreign key to Image (composite primary key)
- `sortOrder`: Display order for product images (INTEGER, default 0)
- `isPrimary`: Primary product image flag (BOOLEAN, default false)

**Indexes**:

- Composite primary key on `productId, imageId`
- Index on `productId`
- Index on `imageId`
- Index on `sortOrder`
- Index on `isPrimary`

**Constraints**:

- Only one primary image per product (business rule enforced in application)

### DropImage Junction Table

**Primary Purpose**: Many-to-many relationship between Drops and Images

**Fields**:

- `dropId`: Foreign key to Drop (composite primary key)
- `imageId`: Foreign key to Image (composite primary key)
- `sortOrder`: Display order for drop images (INTEGER, default 0)
- `caption`: Optional caption for drop context (VARCHAR 500, nullable)

**Indexes**:

- Composite primary key on `dropId, imageId`
- Index on `dropId`
- Index on `imageId`
- Index on `sortOrder`

## Foreign Key Relationships

### User -> Image (One-to-Many)

```prisma
model User {
  // ... existing fields ...
  uploadedImages Image[] @relation("UploadedImages")
}

model Image {
  uploader User @relation("UploadedImages", fields: [uploadedBy], references: [id])
  uploadedBy String
}
```

**Cascade Behavior**: None (SET NULL would break referential integrity)
**Delete Policy**: Prevent deletion of users with uploaded images

### ImageCategory -> Image (One-to-Many, Optional)

```prisma
model ImageCategory {
  images Image[]
}

model Image {
  category ImageCategory? @relation(fields: [categoryId], references: [id])
  categoryId String?
}
```

**Cascade Behavior**: None
**Delete Policy**: Allow deletion of categories (sets categoryId to NULL)

### Product -> ProductImage (One-to-Many)

```prisma
model Product {
  images ProductImage[]
}

model ProductImage {
  product Product @relation(fields: [productId], references: [id])
  productId String
}
```

**Cascade Behavior**: Cascade delete
**Delete Policy**: Delete product images when product is deleted

### Image -> ProductImage (One-to-Many)

```prisma
model Image {
  products ProductImage[]
}

model ProductImage {
  image Image @relation(fields: [imageId], references: [id])
  imageId String
}
```

**Cascade Behavior**: Cascade delete
**Delete Policy**: Delete product associations when image is deleted

### Drop -> DropImage (One-to-Many)

```prisma
model Drop {
  images DropImage[]
}

model DropImage {
  drop Drop @relation(fields: [dropId], references: [id])
  dropId String
}
```

**Cascade Behavior**: Cascade delete
**Delete Policy**: Delete drop images when drop is deleted

### Image -> DropImage (One-to-Many)

```prisma
model Image {
  drops DropImage[]
}

model DropImage {
  image Image @relation(fields: [imageId], references: [id])
  imageId String
}
```

**Cascade Behavior**: Cascade delete
**Delete Policy**: Delete drop associations when image is deleted

## Migration Strategy

### Phase 1: Schema Creation

1. Create new tables in dependency order:

   - ImageCategory
   - Image
   - ProductImage
   - DropImage

2. Add uploadedImages relation to User table

3. Create optimized indexes for performance

### Phase 2: Data Migration

1. Create migration script to convert existing Product.images arrays
2. For each product with images:

   - Fetch image metadata from ImgBB API (if available)
   - Create Image records with comprehensive metadata
   - Create ProductImage junction records
   - Update Product records to remove images field

3. Handle cases where ImgBB metadata is unavailable:
   - Use filename as title and originalName
   - Set default dimensions (800x600)
   - Mark as needing metadata update

### Phase 3: Cleanup

1. Remove images field from Product table
2. Update existing queries and APIs
3. Add database constraints and triggers

## Performance Optimizations

### Query Patterns

**Get Product Images**:

```sql
SELECT i.*, pi.sortOrder, pi.isPrimary
FROM images i
JOIN product_images pi ON i.id = pi.imageId
WHERE pi.productId = ? AND i.isActive = true
ORDER BY pi.isPrimary DESC, pi.sortOrder ASC
```

**Get User Uploads**:

```sql
SELECT * FROM images
WHERE uploadedBy = ? AND isActive = true
ORDER BY createdAt DESC
LIMIT ? OFFSET ?
```

**Search Images by Tags**:

```sql
SELECT * FROM images
WHERE tags ?& array['tag1', 'tag2']
AND isActive = true
ORDER BY createdAt DESC
```

### Indexing Strategy

**High-Frequency Queries**:

- User uploaded images (uploadedBy + isActive + createdAt)
- Product images (productId + sortOrder)
- Public active images (isPublic + isActive + createdAt)
- Category images (categoryId + isActive + createdAt)

**Search Queries**:

- Full-text search on title, altText, filename
- Tag-based filtering (GIN index on tags array)
- Date range queries (createdAt ranges)

## Security Considerations

### Access Control

- Users can only access images they uploaded (unless public)
- Role-based permissions for image management
- API authentication required for all operations
- File upload validation and virus scanning

### Data Integrity

- Foreign key constraints prevent orphaned records
- Check constraints on file sizes and types
- Audit logging for all image operations
- Soft deletes (isActive flag) for data preservation

## Backup and Recovery

### Backup Strategy

- Regular database backups include all image metadata
- ImgBB URLs serve as external backup for actual files
- Archive deleted images for compliance
- Export image metadata for disaster recovery

### Recovery Procedures

- Restore image metadata from backups
- Re-link images with products/drops using junction tables
- Handle ImgBB URL changes or deletions
- Validate image accessibility after recovery

## Monitoring and Maintenance

### Key Metrics

- Total images per user/category
- Storage usage trends
- Upload/delete patterns
- Query performance (slow queries)
- Failed upload rates
- Image accessibility (broken URLs)

### Maintenance Tasks

- Regular cleanup of orphaned records
- Update ImgBB metadata periodically
- Monitor storage costs and usage
- Archive old images to cheaper storage
- Validate image URL accessibility

This comprehensive relationship design ensures data integrity, performance, and scalability while maintaining compatibility with the existing ImgBB infrastructure.
