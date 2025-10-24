import { NextRequest, NextResponse } from "next/server";
import { DropService } from "../../../../../../entities/drop/domain/drop-service";
import { DropRepository } from "../../../../../../entities/drop/domain/drop-repository";
import { ProductRepository } from "../../../../../../entities/product/domain/product-repository";
import { WhatsAppGroupRepository } from "../../../../../../entities/whatsapp/domain/whatsapp-group-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../../../lib/middleware/auth-middleware";

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
 * POST /api/admin/drops/[id]/send
 * Send a drop immediately (mark as sent)
 */
export async function POST(
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

    // TODO: In a real implementation, this would trigger the actual WhatsApp sending logic
    // For now, we'll just mark the drop as sent
    const result = await dropService.markAsSent(dropId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Drop has been sent successfully",
    });
  } catch (error) {
    console.error("Error sending drop:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
