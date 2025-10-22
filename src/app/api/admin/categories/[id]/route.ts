import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "../../../../../entities/category/domain/category-service";
import { CategoryRepository } from "../../../../../entities/category/domain/category-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const categoryRepository = new CategoryRepository(prisma);
const categoryService = new CategoryService({
  categoryRepository,
  productRepository: null, // Will be added when ProductService is implemented
  prisma,
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/categories/[id]
 * Get category by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const result = await categoryService.getById(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error getting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categories/[id]
 * Update category by ID
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { name, description, parentId, sortOrder, isActive } = body;

    const { id } = await params;
    const result = await categoryService.update(id, {
      name: name?.trim(),
      description: description?.trim(),
      parentId: parentId?.trim(),
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      isActive,
    });

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete category by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const result = await categoryService.delete(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
