import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ProductRepository } from "../../../../../entities/product/domain/product-repository";

const prisma = new PrismaClient();
const productRepository = new ProductRepository(prisma);

/**
 * GET /api/public/products/[id]
 * Public endpoint for clients to view product details
 * No authentication required - this is how clients access products from WhatsApp links
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get product details
    const result = await productRepository.findById(productId);

    if (!result.success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = result.data;

    // Check if product is active
    if (!product.isActive) {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 404 }
      );
    }

    // Increment view count
    await productRepository.incrementViewCount(productId);

    // Return product data for public consumption
    const publicProductData = {
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
      viewCount: product.viewCount + 1, // Include the incremented count
    };

    return NextResponse.json({
      success: true,
      data: publicProductData,
    });
  } catch (error) {
    console.error("Error fetching public product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
