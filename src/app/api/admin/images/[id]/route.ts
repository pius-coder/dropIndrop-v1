import { NextRequest, NextResponse } from "next/server";
import { imageService } from "../../../../../entities/image/domain/image-service-factory";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";
import { UserRole } from "@prisma/client";
import { UpdateImageDataSchema } from "../../../../../lib/schemas/image-schema";

/**
 * GET /api/admin/images/[id]
 * Get individual image by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const authResult = await authMiddleware(request, {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    });

    // If middleware returned an error response, return it
    if (authResult.response) {
      return authResult.response;
    }

    const imageId = params.id;

    if (!imageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Image ID is required",
        },
        { status: 400 }
      );
    }

    const result = await imageService.getById(imageId);

    if (!result.success) {
      console.error("Error fetching image:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: result.error.message.includes("not found") ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error getting image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/images/[id]
 * Update individual image
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const authResult = await authMiddleware(request, {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    });

    // If middleware returned an error response, return it
    if (authResult.response) {
      return authResult.response;
    }

    const imageId = params.id;

    if (!imageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Image ID is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, altText, categoryId, tags, isPublic, isActive } = body;

    // Validate input data
    const validationResult = UpdateImageDataSchema.safeParse({
      title: title?.trim(),
      altText: altText?.trim(),
      categoryId: categoryId?.trim(),
      tags,
      isPublic,
      isActive,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await imageService.update(imageId, validationResult.data);

    if (!result.success) {
      console.error("Error updating image:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: result.error.message.includes("not found") ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/images/[id]
 * Delete individual image (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const imageId = params.id;

    if (!imageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Image ID is required",
        },
        { status: 400 }
      );
    }

    // Use deleteImage method with ownership validation
    const result = await imageService.deleteImage(imageId, user!.id);

    if (!result.success) {
      console.error("Error deleting image:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: result.error.message.includes("not found") ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
