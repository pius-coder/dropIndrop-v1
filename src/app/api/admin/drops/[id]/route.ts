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
 * GET /api/admin/drops/[id]
 * Get a single drop by ID
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

    const dropId = params.id;

    const result = await dropService.getById(dropId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error getting drop:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/drops/[id]
 * Update a drop
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

    // User is authenticated and has required role
    const user = authResult.user;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const dropId = params.id;
    const body = await request.json();
    const { name, scheduledDate, productIds, groupIds, status } = body;

    // Validate required fields (only if being updated)
    if (scheduledDate !== undefined && !scheduledDate) {
      return NextResponse.json(
        { error: "scheduledDate cannot be empty if provided" },
        { status: 400 }
      );
    }

    // Validate arrays if provided
    if (productIds !== undefined && !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "productIds must be an array if provided" },
        { status: 400 }
      );
    }

    if (groupIds !== undefined && !Array.isArray(groupIds)) {
      return NextResponse.json(
        { error: "groupIds must be an array if provided" },
        { status: 400 }
      );
    }

    if (productIds !== undefined && productIds.length === 0) {
      return NextResponse.json(
        { error: "At least one product must be selected" },
        { status: 400 }
      );
    }

    if (groupIds !== undefined && groupIds.length === 0) {
      return NextResponse.json(
        { error: "At least one group must be selected" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name?.trim();
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (productIds)
      updateData.productIds = productIds.map((id: string) => id.trim());
    if (groupIds) updateData.groupIds = groupIds.map((id: string) => id.trim());
    if (status) updateData.status = status;

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update data provided" },
        { status: 400 }
      );
    }

    const result = await dropService.update(dropId, updateData);

    if (!result.success) {
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
    console.error("Error updating drop:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/drops/[id]
 * Delete a drop
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

    // User is authenticated and has required role
    const user = authResult.user;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const dropId = params.id;

    const result = await dropService.delete(dropId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Drop deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting drop:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
