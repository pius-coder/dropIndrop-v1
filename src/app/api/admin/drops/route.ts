import { NextRequest, NextResponse } from "next/server";
import { DropService } from "../../../../entities/drop/domain/drop-service";
import { DropRepository } from "../../../../entities/drop/domain/drop-repository";
import { ProductRepository } from "../../../../entities/product/domain/product-repository";
import { WhatsAppGroupRepository } from "../../../../entities/whatsapp/domain/whatsapp-group-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";

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
 * GET /api/admin/drops
 * Get drops with optional filtering and pagination
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const searchQuery = searchParams.get("search");

    const filters = {
      status: (status as any) || undefined,
      search: searchQuery || undefined,
      createdBy: user.id, // Only show drops created by the current user
    };

    const result = await dropService.list(filters, page, limit);

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
    console.error("Error getting drops:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/drops
 * Create new drop
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await request.json();
    const { name, scheduledDate, productIds, groupIds } = body;

    // Validate required fields
    if (!scheduledDate || !productIds || !groupIds) {
      return NextResponse.json(
        {
          error: "Missing required fields: scheduledDate, productIds, groupIds",
        },
        { status: 400 }
      );
    }

    // Validate arrays
    if (!Array.isArray(productIds) || !Array.isArray(groupIds)) {
      return NextResponse.json(
        {
          error: "productIds and groupIds must be arrays",
        },
        { status: 400 }
      );
    }

    if (productIds.length === 0 || groupIds.length === 0) {
      return NextResponse.json(
        {
          error: "At least one product and one group must be selected",
        },
        { status: 400 }
      );
    }

    const result = await dropService.create(
      {
        name: name?.trim(),
        scheduledDate: new Date(scheduledDate),
        productIds: productIds.map((id: string) => id.trim()),
        groupIds: groupIds.map((id: string) => id.trim()),
      },
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating drop:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
