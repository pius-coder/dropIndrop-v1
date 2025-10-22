/**
 * Image upload service for article images
 * Uses ImgBB API for image hosting
 */

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
