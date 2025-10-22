import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../../../entities/product/domain/product-service";
import { ProductRepository } from "../../../../../entities/product/domain/product-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const productRepository = new ProductRepository(prisma);
const productService = new ProductService({
  productRepository,
  categoryRepository: null, // Will be added when CategoryService is implemented
  prisma,
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/products/[id]
 * Get product by ID
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
    const result = await productService.getById(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Product not found" },
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
    console.error("Error getting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products/[id]
 * Update product by ID
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
    const {
      name,
      description,
      price,
      sku,
      categoryId,
      images,
      isActive,
      stockQuantity,
    } = body;

    const { id } = await params;
    const result = await productService.update(id, {
      name: name?.trim(),
      description: description?.trim(),
      price: price !== undefined ? Number(price) : undefined,
      sku: sku?.trim(),
      categoryId: categoryId?.trim(),
      images,
      isActive,
      stockQuantity:
        stockQuantity !== undefined ? Number(stockQuantity) : undefined,
    });

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Product not found" },
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
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete product by ID
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
    const result = await productService.delete(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Product not found" },
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
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
