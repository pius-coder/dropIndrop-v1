import { NextRequest, NextResponse } from "next/server";
import { ConfigurationService } from "../../../../entities/configuration/domain/configuration-service";
import { ConfigurationRepository } from "../../../../entities/configuration/domain/configuration-repository";
import { Configuration } from "../../../../entities/configuration/domain/configuration";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const configurationRepository = new ConfigurationRepository(prisma);
const configurationService = new ConfigurationService(configurationRepository);

/**
 * GET /api/admin/configuration
 * Get current platform configuration
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

    console.log("Getting configuration...");
    const result = await configurationService.getConfiguration();

    if (!result.success) {
      console.log("Configuration not found, error:", result.error.message);
      // If configuration not found, return 404 to show configuration form
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }
    console.log(
      "[Configuration][Response] Data :" + JSON.stringify(result.data)
    );
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error getting configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/configuration
 * Create new platform configuration
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

    // Validate required fields
    const { general, whatsapp, payments, notifications } = body;

    if (!general || !whatsapp || !payments || !notifications) {
      return NextResponse.json(
        { error: "Missing required configuration sections" },
        { status: 400 }
      );
    }

    const result = await configurationService.createConfiguration({
      general,
      whatsapp,
      payments,
      notifications,
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
    console.error("Error creating configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/configuration
 * Update existing platform configuration
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

    // User is authenticated and has required role
    const user = authResult.user;

    const body = await request.json();
    const { general, whatsapp, payments, notifications } = body;

    console.log("Received configuration update data:");
    console.log("General:", general);
    console.log("WhatsApp:", whatsapp);
    console.log("Payments:", payments);
    console.log("Notifications:", notifications);

    // Use main configuration ID
    const configId = "main";

    const result = await configurationService.updateConfiguration(configId, {
      general,
      whatsapp,
      payments,
      notifications,
    });

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
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
