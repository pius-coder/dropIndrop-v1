import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../../entities/product/domain/product-service";
import { ProductRepository } from "../../../../entities/product/domain/product-repository";
import { CategoryRepository } from "../../../../entities/category/domain/category-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const productRepository = new ProductRepository(prisma);
const categoryRepository = new CategoryRepository(prisma);
const productService = new ProductService({
  productRepository,
  categoryRepository,
  prisma,
});

/**
 * GET /api/admin/products
 * Get products with optional filtering and pagination
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const categoryId = searchParams.get("categoryId");
    const searchQuery = searchParams.get("search");

    const filters = {
      categoryId: categoryId || undefined,
      search: searchQuery || undefined,
    };
    const result = await productService.list(filters, page, limit);

    if (!result.success) {
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
    console.error("Error getting products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create new product
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
    const { name, description, price, sku, categoryId, images, stockQuantity } =
      body;

    // Validate required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !categoryId ||
      !images ||
      images.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, price, categoryId, images",
        },
        { status: 400 }
      );
    }

    const result = await productService.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      sku: sku?.trim(),
      categoryId: categoryId.trim(),
      images,
      stockQuantity:
        stockQuantity !== undefined ? Number(stockQuantity) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
