import { NextRequest, NextResponse } from "next/server";

// Get ImgBB API key from environment
const IMG_BB_API_KEY = process.env.IMG_BB_API_KEY;
const IMG_BB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

interface UploadedImageData {
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

interface ImageUploadResult {
  success: boolean;
  data?: UploadedImageData;
  error?: string;
}

/**
 * POST /api/upload
 * Upload files (images) for products using ImgBB
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image file too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    if (!IMG_BB_API_KEY) {
      console.error("IMG_BB_API_KEY not configured");
      return NextResponse.json(
        { error: "Image upload service not configured" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
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
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 400 }
      );
    }

    // Return the uploaded image data
    return NextResponse.json({
      success: true,
      url: result.data.url,
      fileName: result.data.image?.name || file.name,
      fileSize: result.data.size,
      dimensions: {
        width: result.data.width,
        height: result.data.height,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
