import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ProductRepository } from "../../../../entities/product/domain/product-repository";

const prisma = new PrismaClient();
const productRepository = new ProductRepository(prisma);

/**
 * GET /api/public/products
 * Public endpoint for clients to browse available products
 * No authentication required - this is how clients discover products from WhatsApp links
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const categoryId = searchParams.get("categoryId");
    const searchQuery = searchParams.get("search");

    // Build filters for active products only
    const filters = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(searchQuery && { search: searchQuery }),
    };

    const result = await productRepository.list(filters, page, limit);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const { products, total, page: currentPage, totalPages } = result.data;

    // Format products for public consumption
    const publicProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      images: product.images,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
      } : {
        id: product.categoryId,
        name: "Product Category",
      },
      sku: product.sku,
      isAvailable: product.isAvailable(),
      stockQuantity: product.stockQuantity,
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: publicProducts,
        pagination: {
          page: currentPage,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
