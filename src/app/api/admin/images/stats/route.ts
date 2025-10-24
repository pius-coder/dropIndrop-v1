import { NextRequest, NextResponse } from "next/server";
import { imageService } from "../../../../../entities/image/domain/image-service-factory";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/images/stats
 * Get image statistics
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

    const result = await imageService.getImageStats();

    if (!result.success) {
      console.error("Error fetching image statistics:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error getting image statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
