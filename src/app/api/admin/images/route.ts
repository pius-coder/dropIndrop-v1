import { NextRequest, NextResponse } from "next/server";
import { imageService } from "../../../../entities/image/domain/image-service-factory";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";
import { UserRole } from "@prisma/client";
import {
  ImageFiltersSchema,
  PaginationOptionsSchema,
} from "../../../../lib/schemas/image-schema";

/**
 * GET /api/admin/images
 * Get images with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const uploadedBy = searchParams.get("uploadedBy");
    const categoryId = searchParams.get("categoryId");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const isPublic = searchParams.get("isPublic");
    const isActive = searchParams.get("isActive");
    const mimeType = searchParams.get("mimeType");
    const minSize = searchParams.get("minSize")
      ? parseInt(searchParams.get("minSize")!)
      : undefined;
    const maxSize = searchParams.get("maxSize")
      ? parseInt(searchParams.get("maxSize")!)
      : undefined;

    // Validate pagination parameters
    const paginationValidation = PaginationOptionsSchema.safeParse({
      page,
      limit,
    });

    if (!paginationValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pagination parameters",
          details: paginationValidation.error.issues,
        },
        { status: 400 }
      );
    }

    // Validate filter parameters
    const filtersValidation = ImageFiltersSchema.safeParse({
      uploadedBy: uploadedBy || undefined,
      categoryId: categoryId || undefined,
      tags: tags || undefined,
      isPublic: isPublic ? isPublic === "true" : undefined,
      isActive: isActive !== null ? isActive === "true" : undefined,
      mimeType: mimeType || undefined,
      minSize,
      maxSize,
    });

    if (!filtersValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid filter parameters",
          details: filtersValidation.error.issues,
        },
        { status: 400 }
      );
    }

    const validFilters = filtersValidation.data;

    let result;

    // If search query is provided, use search functionality
    if (search && search.trim()) {
      result = await imageService.searchImages(
        search.trim(),
        validFilters,
        paginationValidation.data
      );
    } else {
      // Otherwise, get images by uploader (admin can see all images)
      result = await imageService.getImagesByUploader(
        user!.id,
        validFilters,
        paginationValidation.data
      );
    }

    if (!result.success) {
      console.error("Error fetching images:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error getting images:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
