import { NextRequest, NextResponse } from "next/server";
import { ConfigurationService } from "../../../../../entities/configuration/domain/configuration-service";
import { ConfigurationRepository } from "../../../../../entities/configuration/domain/configuration-repository";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const configurationRepository = new ConfigurationRepository(prisma);
const configurationService = new ConfigurationService(configurationRepository);

/**
 * POST /api/admin/configuration/complete
 * Mark platform setup as complete
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

    // Use main configuration ID
    const configId = "main";

    const result = await configurationService.completeSetup(configId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Setup completed successfully",
    });
  } catch (error) {
    console.error("Error completing setup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
