import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../../../lib/middleware/auth-middleware";
import { UserRole } from "@prisma/client";
import { prisma } from "../../../../../../lib/db";
import { z } from "zod";

// Validation schemas for image categories
const UpdateImageCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/images/categories/[id]
 * Get individual image category by ID
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

    const categoryId = params.id;

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 }
      );
    }

    const category = await prisma.imageCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        imageCount: category._count.images,
        _count: undefined, // Remove _count from response
      },
    });
  } catch (error) {
    console.error("Error getting image category:", error);
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
 * PUT /api/admin/images/categories/[id]
 * Update individual image category
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

    const categoryId = params.id;

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.imageCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = UpdateImageCategorySchema.safeParse(body);

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

    const validData = validationResult.data;

    // If updating name, check for duplicates
    if (validData.name) {
      const duplicateCategory = await prisma.imageCategory.findFirst({
        where: {
          name: {
            equals: validData.name.trim(),
            mode: "insensitive",
          },
          id: {
            not: categoryId,
          },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          {
            success: false,
            error: "Category name already exists",
          },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (validData.name !== undefined) updateData.name = validData.name.trim();
    if (validData.description !== undefined)
      updateData.description = validData.description?.trim();
    if (validData.sortOrder !== undefined)
      updateData.sortOrder = validData.sortOrder;
    if (validData.isActive !== undefined)
      updateData.isActive = validData.isActive;

    const category = await prisma.imageCategory.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error updating image category:", error);
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
 * DELETE /api/admin/images/categories/[id]
 * Delete individual image category
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

    const categoryId = params.id;

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.imageCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    // Check if category has associated images
    const imageCount = await prisma.image.count({
      where: { categoryId },
    });

    if (imageCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${imageCount} associated images. Move or delete images first.`,
        },
        { status: 409 }
      );
    }

    // Soft delete by deactivating
    await prisma.imageCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: true,
    });
  } catch (error) {
    console.error("Error deleting image category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
