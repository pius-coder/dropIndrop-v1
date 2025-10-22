import { z } from "zod";

// Get ImgBB API key from environment
const IMG_BB_API_KEY = process.env.IMG_BB_API_KEY;
const IMG_BB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export interface UploadedImageData {
  url: string;
  displayUrl: string;
  thumbUrl: string;
  deleteUrl: string;
  size: number;
  width: number;
  height: number;
  mime: string;
  name: string;
  originalName: string;
}

export interface ImageUploadResult {
  success: boolean;
  data?: UploadedImageData;
  error?: string;
}

export interface MultipleImageUploadResult {
  uploaded: UploadedImageData[];
  failed: Array<{ file: string; error: string }>;
  totalUploaded: number;
  totalFailed: number;
}

// Legacy compatibility - keep existing types
export const ImageUploadConfigSchema = z.object({
  maxFileSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z
    .array(z.string())
    .default(["image/jpeg", "image/png", "image/webp"]),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
  quality: z.number().min(0).max(1).default(0.8),
});

export type ImageUploadConfig = z.infer<typeof ImageUploadConfigSchema>;

// Upload result schema
export const UploadResultSchema = z.object({
  success: z.boolean(),
  url: z.string().optional(),
  error: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  dimensions: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

export type UploadResult = z.infer<typeof UploadResultSchema>;

// Image processing options
export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
  };
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

/**
 * Upload a single image to ImgBB
 */
export async function uploadImage(imageFile: File): Promise<ImageUploadResult> {
  try {
    if (!IMG_BB_API_KEY) {
      console.error("IMG_BB_API_KEY not configured");
      return {
        success: false,
        error: "Image upload service not configured",
      };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: "Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed.",
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (imageFile.size > maxSize) {
      return {
        success: false,
        error: "Image file too large. Maximum size is 5MB.",
      };
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Prepare form data for ImgBB API
    const imgbbFormData = new FormData();
    imgbbFormData.append("key", IMG_BB_API_KEY);
    imgbbFormData.append("image", base64);

    // Upload to ImgBB
    const response = await fetch(IMG_BB_UPLOAD_URL, {
      method: "POST",
      body: imgbbFormData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("ImgBB upload failed:", result);
      return {
        success: false,
        error: "Failed to upload image",
      };
    }

    // Return the hosted image data
    return {
      success: true,
      data: {
        url: result.data.url,
        displayUrl: result.data.display_url,
        thumbUrl: result.data.thumb?.url || result.data.url,
        deleteUrl: result.data.delete_url,
        size: result.data.size,
        width: result.data.width,
        height: result.data.height,
        mime: result.data.image?.mime || imageFile.type,
        name: result.data.image?.name || imageFile.name,
        originalName: imageFile.name,
      },
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: "Internal server error during image upload",
    };
  }
}

/**
 * Upload multiple images to ImgBB
 */
export async function uploadMultipleImages(
  imageFiles: File[]
): Promise<MultipleImageUploadResult> {
  const maxFiles = 10; // Maximum 10 images at once

  if (imageFiles.length > maxFiles) {
    return {
      uploaded: [],
      failed: imageFiles.map((file) => ({
        file: file.name,
        error: `Too many images. Maximum ${maxFiles} images allowed.`,
      })),
      totalUploaded: 0,
      totalFailed: imageFiles.length,
    };
  }

  // Upload all images
  const uploadPromises = imageFiles.map(async (imageFile) => {
    const result = await uploadImage(imageFile);
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.error || "Unknown upload error");
    }
  });

  const results = await Promise.allSettled(uploadPromises);

  const successful: UploadedImageData[] = [];
  const failed: Array<{ file: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successful.push(result.value);
    } else {
      failed.push({
        file: imageFiles[index].name,
        error: result.reason.message,
      });
    }
  });

  return {
    uploaded: successful,
    failed: failed,
    totalUploaded: successful.length,
    totalFailed: failed.length,
  };
}

/**
 * Check if image service is configured
 */
export function isImageServiceConfigured(): boolean {
  return !!IMG_BB_API_KEY;
}

/**
 * Get image service status
 */
export function getImageServiceStatus() {
  const isConfigured = isImageServiceConfigured();

  if (!isConfigured) {
    return {
      status: "not_configured",
      message: "ImgBB API key not configured",
    };
  }

  return {
    status: "configured",
    message: "Image upload service is configured and ready",
    provider: "ImgBB",
    maxFileSize: "5MB",
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  };
}

/**
 * Image Upload Service (Legacy compatibility)
 * Handles image upload, validation, and processing for products
 */
export class ImageUploadService {
  private config: ImageUploadConfig;

  constructor(config: Partial<ImageUploadConfig> = {}) {
    this.config = ImageUploadConfigSchema.parse(config);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!this.config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${
          file.type
        } not allowed. Allowed types: ${this.config.allowedTypes.join(", ")}`,
      };
    }

    // Check file size
    if (file.size > this.config.maxFileSize) {
      const maxSizeMB = Math.round(this.config.maxFileSize / (1024 * 1024));
      return {
        valid: false,
        error: `File size too large. Maximum size: ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Process image before upload (resize, compress, etc.)
   * Note: This method requires DOM APIs and should only be used in browser environments
   */
  async processImage(
    file: File,
    options: ImageProcessingOptions = {}
  ): Promise<File> {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      console.warn('Image processing is not available in server environment. Returning original file.');
      return file;
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate dimensions
          let { width, height } = img;

          if (options.resize) {
            const { resize } = options;
            if (resize.width && resize.height) {
              if (resize.maintainAspectRatio !== false) {
                // Maintain aspect ratio
                const aspectRatio = width / height;
                if (width > height) {
                  width = Math.min(resize.width, width);
                  height = width / aspectRatio;
                } else {
                  height = Math.min(resize.height, height);
                  width = height * aspectRatio;
                }
              } else {
                width = resize.width;
                height = resize.height;
              }
            } else if (resize.width) {
              width = resize.width;
              height = (resize.width / img.width) * img.height;
            } else if (resize.height) {
              height = resize.height;
              width = (resize.height / img.height) * img.width;
            }
          }

          // Apply max dimensions from config
          if (this.config.maxWidth && width > this.config.maxWidth) {
            height = (this.config.maxWidth / width) * height;
            width = this.config.maxWidth;
          }
          if (this.config.maxHeight && height > this.config.maxHeight) {
            width = (this.config.maxHeight / height) * width;
            height = this.config.maxHeight;
          }

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: options.format ? `image/${options.format}` : file.type,
                  lastModified: Date.now(),
                });
                resolve(processedFile);
              } else {
                reject(new Error("Failed to process image"));
              }
            },
            options.format ? `image/${options.format}` : file.type,
            options.quality ?? this.config.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload image to server
   */
  async uploadImage(
    file: File,
    endpoint: string = "/api/upload"
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Process image (resize, compress, etc.)
      const processedFile = await this.processImage(file);

      // Create form data
      const formData = new FormData();
      formData.append("file", processedFile);

      // Upload
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Upload failed" }));
        return {
          success: false,
          error:
            errorData.error || `Upload failed with status ${response.status}`,
        };
      }

      const result = await response.json();

      return UploadResultSchema.parse({
        success: true,
        url: result.url,
        fileName: result.fileName,
        fileSize: processedFile.size,
        dimensions: result.dimensions,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    files: File[],
    endpoint: string = "/api/upload"
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    // Upload in parallel with concurrency limit
    const concurrencyLimit = 3;
    for (let i = 0; i < files.length; i += concurrencyLimit) {
      const batch = files.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map((file) => this.uploadImage(file, endpoint))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get supported image formats
   */
  getSupportedFormats(): string[] {
    return this.config.allowedTypes;
  }

  /**
   * Get maximum file size in MB
   */
  getMaxFileSizeMB(): number {
    return Math.round(this.config.maxFileSize / (1024 * 1024));
  }

  /**
   * Check if file type is supported
   */
  isFileTypeSupported(file: File): boolean {
    return this.config.allowedTypes.includes(file.type);
  }

  /**
   * Check if file size is within limits
   */
  isFileSizeValid(file: File): boolean {
    return file.size <= this.config.maxFileSize;
  }

  /**
   * Get image dimensions
   * Note: This method requires DOM APIs and should only be used in browser environments
   */
  async getImageDimensions(
    file: File
  ): Promise<{ width: number; height: number }> {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      console.warn('Image dimension detection is not available in server environment. Returning default dimensions.');
      return { width: 800, height: 600 };
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Failed to get image dimensions"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Create preview URL for image
   * Note: This method requires DOM APIs and should only be used in browser environments
   */
  createPreviewUrl(file: File): string {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      console.warn('Preview URL creation is not available in server environment.');
      return '';
    }

    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   * Note: This method requires DOM APIs and should only be used in browser environments
   */
  revokePreviewUrl(url: string): void {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      console.warn('Preview URL revocation is not available in server environment.');
      return;
    }

    URL.revokeObjectURL(url);
  }
}

// Default instance
export const imageUploadService = new ImageUploadService();

// Factory function for custom configurations
export function createImageUploadService(
  config: Partial<ImageUploadConfig>
): ImageUploadService {
  return new ImageUploadService(config);
}
