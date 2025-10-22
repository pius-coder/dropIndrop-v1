import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";
import { PrismaClient, UserRole } from "@prisma/client";

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, { requireAuth: false });

    // If no user is authenticated, return null
    if (!authResult.user) {
      return NextResponse.json({ user: null });
    }

    // Return user information (without sensitive data)
    return NextResponse.json({
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
        phoneNumber: authResult.user.phoneNumber,
        role: authResult.user.role,
        isActive: authResult.user.isActive,
      },
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
