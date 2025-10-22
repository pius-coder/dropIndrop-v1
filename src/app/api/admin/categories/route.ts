import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "../../../../entities/category/domain/category-service";
import { CategoryRepository } from "../../../../entities/category/domain/category-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const categoryRepository = new CategoryRepository(prisma);
const categoryService = new CategoryService({
  categoryRepository,
  productRepository: null, // Will be added when ProductService is implemented
  prisma,
});

/**
 * GET /api/admin/categories
 * Get categories with optional filtering
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
    const includeHierarchy = searchParams.get("hierarchy") === "true";
    const includeProductCounts = searchParams.get("productCounts") === "true";

    let result;

    // Use the list method with appropriate filters
    const filters = {};
    result = await categoryService.list(filters, 1, 1000);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    // Return just the categories array for the frontend hook
    return NextResponse.json({
      success: true,
      data: result.data.categories,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create new category
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

    const body = await request.json();
    const { name, description, parentId, sortOrder } = body;

    console.log("Creating category with data:", {
      name,
      description,
      parentId,
      sortOrder,
    });

    // Validate required fields
    if (!name || !name.trim()) {
      console.error("Category creation failed: Name is required");
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const result = await categoryService.create({
      name: name.trim(),
      description: description?.trim(),
      parentId: parentId?.trim() || undefined, // Convert empty string to undefined
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
    });

    if (!result.success) {
      console.error("Category creation failed:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    console.log("Category created successfully:", result.data);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ status: 500 });
  }
}
