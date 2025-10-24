import { z } from "zod";

// Image MIME types validation
export const ImageMimeTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// File size validation (max 10MB)
export const ImageFileSizeSchema = z
  .number()
  .int()
  .min(1, "File size must be greater than 0")
  .max(10 * 1024 * 1024, "File size cannot exceed 10MB");

// Image dimensions validation
export const ImageDimensionsSchema = z
  .object({
    width: z.number().int().min(1).max(10000).optional(),
    height: z.number().int().min(1).max(10000).optional(),
  })
  .optional();

// Tags validation
export const ImageTagsSchema = z
  .array(
    z
      .string()
      .min(1, "Tag cannot be empty")
      .max(50, "Tag must be 50 characters or less")
      .regex(
        /^[a-zA-Z0-9\s-]+$/,
        "Tags can only contain letters, numbers, spaces, and hyphens"
      )
  )
  .max(20, "Maximum 20 tags allowed")
  .optional();

// Create Image Data Schema
export const CreateImageDataSchema = z.object({
  title: z.string().max(255, "Title must be 255 characters or less").optional(),
  altText: z
    .string()
    .max(255, "Alt text must be 255 characters or less")
    .optional(),
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be 255 characters or less")
    .regex(/^[a-zA-Z0-9._-]+$/, "Filename contains invalid characters"),
  originalName: z
    .string()
    .min(1, "Original name is required")
    .max(255, "Original name must be 255 characters or less"),
  size: ImageFileSizeSchema,
  mimeType: ImageMimeTypeSchema,
  width: z.number().int().min(1).max(10000).optional(),
  height: z.number().int().min(1).max(10000).optional(),
  url: z
    .string()
    .url("Invalid URL format")
    .max(500, "URL must be 500 characters or less"),
  thumbUrl: z
    .string()
    .url("Invalid thumbnail URL format")
    .max(500, "Thumbnail URL must be 500 characters or less")
    .optional(),
  deleteUrl: z
    .string()
    .url("Invalid delete URL format")
    .max(500, "Delete URL must be 500 characters or less")
    .optional(),
  uploadedBy: z
    .string()
    .cuid("Invalid user ID format")
    .min(1, "Uploader information is required"),
  categoryId: z.string().cuid("Invalid category ID format").optional(),
  tags: ImageTagsSchema,
  isPublic: z.boolean().default(true),
});

// Update Image Data Schema
export const UpdateImageDataSchema = z.object({
  title: z.string().max(255, "Title must be 255 characters or less").optional(),
  altText: z
    .string()
    .max(255, "Alt text must be 255 characters or less")
    .optional(),
  categoryId: z.string().cuid("Invalid category ID format").optional(),
  tags: ImageTagsSchema,
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Image Filters Schema
export const ImageFiltersSchema = z.object({
  uploadedBy: z.string().cuid("Invalid user ID format").optional(),
  categoryId: z.string().cuid("Invalid category ID format").optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags for filtering").optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
  mimeType: ImageMimeTypeSchema.optional(),
  minSize: z
    .number()
    .int()
    .min(0, "Minimum size must be non-negative")
    .optional(),
  maxSize: z
    .number()
    .int()
    .min(1, "Maximum size must be greater than 0")
    .optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  search: z
    .string()
    .min(1, "Search term cannot be empty")
    .max(100, "Search term too long")
    .optional(),
});

// Pagination Options Schema
export const PaginationOptionsSchema = z.object({
  page: z.number().int().min(1, "Page must be greater than 0").default(1),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be greater than 0")
    .max(100, "Limit cannot exceed 100")
    .default(20),
  orderBy: z.string().max(50, "Order by field too long").default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
});

// Upload Metadata Schema
export const UploadMetadataSchema = z.object({
  title: z.string().max(255, "Title must be 255 characters or less").optional(),
  altText: z
    .string()
    .max(255, "Alt text must be 255 characters or less")
    .optional(),
  categoryId: z.string().cuid("Invalid category ID format").optional(),
  tags: ImageTagsSchema,
  isPublic: z.boolean().default(true),
});

// Product Image Association Schema
export const CreateProductImageDataSchema = z.object({
  productId: z
    .string()
    .cuid("Invalid product ID format")
    .min(1, "Product ID is required"),
  imageId: z
    .string()
    .cuid("Invalid image ID format")
    .min(1, "Image ID is required"),
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be non-negative")
    .default(0),
  isPrimary: z.boolean().default(false),
});

// Drop Image Association Schema
export const CreateDropImageDataSchema = z.object({
  dropId: z
    .string()
    .cuid("Invalid drop ID format")
    .min(1, "Drop ID is required"),
  imageId: z
    .string()
    .cuid("Invalid image ID format")
    .min(1, "Image ID is required"),
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be non-negative")
    .default(0),
  caption: z
    .string()
    .max(500, "Caption must be 500 characters or less")
    .optional(),
});

// Image Search Schema
export const ImageSearchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query too long"),
  filters: ImageFiltersSchema.optional(),
  pagination: PaginationOptionsSchema.optional(),
});

// Image List Result Schema
export const ImageListResultSchema = z.object({
  images: z.array(z.any()), // Using any for Image entity - would be more specific in real implementation
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

// File Upload Schema (for API endpoints)
export const FileUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1),
    size: ImageFileSizeSchema,
    type: ImageMimeTypeSchema,
    lastModified: z.number().optional(),
  }),
  metadata: UploadMetadataSchema.optional(),
});

// Batch Operations Schema
export const BatchImageOperationSchema = z.object({
  imageIds: z
    .array(z.string().cuid())
    .min(1, "At least one image ID required")
    .max(50, "Maximum 50 images per batch operation"),
  operation: z.enum([
    "delete",
    "activate",
    "deactivate",
    "makePublic",
    "makePrivate",
  ]),
});

// Image Statistics Schema
export const ImageStatsSchema = z.object({
  totalImages: z.number().int().min(0),
  totalSize: z.number().int().min(0),
  imagesByCategory: z.record(z.string(), z.number().int().min(0)),
  imagesByType: z.record(z.string(), z.number().int().min(0)),
  publicImages: z.number().int().min(0),
  privateImages: z.number().int().min(0),
});

// Type exports
export type CreateImageData = z.infer<typeof CreateImageDataSchema>;
export type UpdateImageData = z.infer<typeof UpdateImageDataSchema>;
export type ImageFilters = z.infer<typeof ImageFiltersSchema>;
export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;
export type UploadMetadata = z.infer<typeof UploadMetadataSchema>;
export type CreateProductImageData = z.infer<
  typeof CreateProductImageDataSchema
>;
export type CreateDropImageData = z.infer<typeof CreateDropImageDataSchema>;
export type ImageSearch = z.infer<typeof ImageSearchSchema>;
export type ImageListResult = z.infer<typeof ImageListResultSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type BatchImageOperation = z.infer<typeof BatchImageOperationSchema>;
export type ImageStats = z.infer<typeof ImageStatsSchema>;
