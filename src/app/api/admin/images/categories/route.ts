import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";
import { UserRole } from "@prisma/client";
import { prisma } from "../../../../../lib/db";
import { z } from "zod";

// Validation schemas for image categories
const CreateImageCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  sortOrder: z.number().int().min(0).default(0),
});

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
 * GET /api/admin/images/categories
 * Get all image categories
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

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    // Build where clause
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const categories = await prisma.imageCategory.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error getting image categories:", error);
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
 * POST /api/admin/images/categories
 * Create new image category
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

    const body = await request.json();
    const validationResult = CreateImageCategorySchema.safeParse(body);

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

    // Check if category name already exists
    const existingCategory = await prisma.imageCategory.findFirst({
      where: {
        name: {
          equals: validData.name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name already exists",
        },
        { status: 409 }
      );
    }

    const category = await prisma.imageCategory.create({
      data: {
        name: validData.name.trim(),
        description: validData.description?.trim(),
        sortOrder: validData.sortOrder,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating image category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
