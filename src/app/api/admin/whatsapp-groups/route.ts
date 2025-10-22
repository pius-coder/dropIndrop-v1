import { NextRequest, NextResponse } from "next/server";
import { WhatsAppService } from "../../../../entities/whatsapp/domain/whatsapp-service";
import { WhatsAppGroupRepository } from "../../../../entities/whatsapp/domain/whatsapp-group-repository";
import { DropRepository } from "../../../../entities/drop/domain/drop-repository";
import { WahaClient } from "../../../../entities/whatsapp/infrastructure/waha-client";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories and services
const whatsappGroupRepository = new WhatsAppGroupRepository(prisma);
const dropRepository = new DropRepository(prisma);
const wahaClient = new WahaClient();

const whatsappService = new WhatsAppService({
  whatsappGroupRepository,
  dropRepository,
  wahaClient,
  prisma,
});

/**
 * GET /api/admin/whatsapp-groups
 * Get WhatsApp groups with optional filtering and pagination
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isActive = searchParams.get("isActive");
    const searchQuery = searchParams.get("search");

    const filters = {
      isActive: isActive !== null ? isActive === "true" : undefined,
      search: searchQuery || undefined,
    };

    const result = await whatsappService.listGroups(filters, page, limit);

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
    console.error("Error getting WhatsApp groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/whatsapp-groups
 * Create new WhatsApp group
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

    const body = await request.json();
    const { name, chatId, description, memberCount } = body;

    // Validate required fields
    if (!name || !chatId) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, chatId",
        },
        { status: 400 }
      );
    }

    const result = await whatsappService.createGroup({
      name: name.trim(),
      chatId: chatId.trim(),
      description: description?.trim(),
      memberCount: memberCount ? Number(memberCount) : undefined,
    });

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
    console.error("Error creating WhatsApp group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/whatsapp-groups/sync
 * Sync groups from WhatsApp
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await authMiddleware(request, {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    });

    // If middleware returned an error response, return it
    if (authResult.response) {
      return authResult.response;
    }

    const result = await whatsappService.syncGroupsFromWhatsApp();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Successfully synced ${result.data.length} groups from WhatsApp`,
    });
  } catch (error) {
    console.error("Error syncing WhatsApp groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
