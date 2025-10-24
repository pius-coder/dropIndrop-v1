import { NextRequest, NextResponse } from "next/server";
import { DropService } from "../../../../../entities/drop/domain/drop-service";
import { DropRepository } from "../../../../../entities/drop/domain/drop-repository";
import { ProductRepository } from "../../../../../entities/product/domain/product-repository";
import { WhatsAppGroupRepository } from "../../../../../entities/whatsapp/domain/whatsapp-group-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const dropRepository = new DropRepository(prisma);
const productRepository = new ProductRepository(prisma);
const whatsappGroupRepository = new WhatsAppGroupRepository(prisma);

// Initialize service
const dropService = new DropService({
  dropRepository,
  productRepository,
  whatsappGroupRepository,
  prisma,
});

/**
 * GET /api/admin/drops/analytics
 * Get drop analytics
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const result = await dropService.getAnalytics();

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
    console.error("Error getting drop analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
