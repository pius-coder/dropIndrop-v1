import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";
import { UserService } from "../../../../../entities/user/domain/user-service";
import { UserRepository } from "../../../../../entities/user/domain/user-repository";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const userRepository = new UserRepository(prisma);
const userService = new UserService({
  userRepository,
  prisma,
});

/**
 * GET /api/admin/users/[id]
 * Get specific user by ID with analytics and purchase history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const userId = (await params).id;

    // Get user basic information
    const userResult = await userService.getUserById(userId);
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error.message },
        { status: 404 }
      );
    }

    // Get user analytics
    const analyticsResult = await userService.getUserAnalytics(userId);

    // Get user purchase history
    const purchaseHistoryResult = await userService.getUserPurchaseHistory(
      userId
    );

    return NextResponse.json({
      success: true,
      data: {
        user: userResult.data,
        analytics: analyticsResult.success ? analyticsResult.data : null,
        purchaseHistory: purchaseHistoryResult.success
          ? purchaseHistoryResult.data
          : null,
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update specific user
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

    const userId = params.id;
    const body = await request.json();
    const { username, email, phoneNumber, role, isActive } = body;

    const updateData: any = {};
    if (username !== undefined) updateData.username = username.trim();
    if (email !== undefined) updateData.email = email?.trim();
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await userService.updateUser(userId, updateData);

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
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete specific user
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

    const userId = params.id;

    const result = await userService.deleteUser(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
