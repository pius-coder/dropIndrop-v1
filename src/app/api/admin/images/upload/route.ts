import { NextRequest, NextResponse } from "next/server";
import { imageService } from "../../../../../entities/image/domain/image-service-factory";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";
import { UserRole } from "@prisma/client";
import { UploadMetadataSchema } from "../../../../../lib/schemas/image-schema";
import { uploadImage } from "../../../../../lib/services/image-upload-service";

/**
 * POST /api/admin/images/upload
 * Upload images with metadata and create database records
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await authMiddleware(request, {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    });

    // If middleware returned an error response, return it
    if (authResult.response) {
      return authResult.response;
    }

    // User is authenticated and has required role
    const user = authResult.user;

    // Parse form data
    const formData = await request.formData();
    const file: File | null = formData.get("file") as unknown as File;
    const metadataRaw = formData.get("metadata") as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    // Parse and validate metadata
    let metadata;
    try {
      metadata = metadataRaw ? JSON.parse(metadataRaw) : {};
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid metadata format",
        },
        { status: 400 }
      );
    }

    // Validate metadata schema
    const metadataValidation = UploadMetadataSchema.safeParse(metadata);
    if (!metadataValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid metadata",
          details: metadataValidation.error.issues,
        },
        { status: 400 }
      );
    }

    // First upload file to ImgBB
    const uploadResult = await uploadImage(file);

    if (!uploadResult.success || !uploadResult.data) {
      console.error("ImgBB upload failed:", uploadResult.error);
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error || "Failed to upload file",
        },
        { status: 400 }
      );
    }

    const uploadedData = uploadResult.data;

    // Create image record in database using the domain service
    const createResult = await imageService.create({
      title: metadataValidation.data.title || file.name,
      altText: metadataValidation.data.altText,
      filename: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      width: uploadedData.width,
      height: uploadedData.height,
      url: uploadedData.url,
      thumbUrl: uploadedData.thumbUrl,
      deleteUrl: uploadedData.deleteUrl,
      uploadedBy: user!.id,
      categoryId: metadataValidation.data.categoryId,
      tags: metadataValidation.data.tags || [],
      isPublic: metadataValidation.data.isPublic ?? true,
    });

    if (!createResult.success) {
      console.error("Database creation failed:", createResult.error);
      return NextResponse.json(
        {
          success: false,
          error: createResult.error.message,
        },
        { status: 400 }
      );
    }

    // Log successful upload
    console.log(
      `Image uploaded successfully: ${createResult.data.filename} by user ${
        user!.username
      }`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          ...createResult.data,
          uploadUrl: uploadedData.url,
          displayUrl: uploadedData.displayUrl,
          deleteUrl: uploadedData.deleteUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
