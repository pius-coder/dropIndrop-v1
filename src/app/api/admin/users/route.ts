import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";
import { UserService } from "../../../../entities/user/domain/user-service";
import { UserRepository } from "../../../../entities/user/domain/user-repository";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const userRepository = new UserRepository(prisma);
const userService = new UserService({
  userRepository,
  prisma,
});

/**
 * GET /api/admin/users
 * Get users with optional filtering and pagination for admin
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
    const role = searchParams.get("role") as UserRole;
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const filters = {
      role: role || undefined,
      isActive: isActive !== null ? isActive === "true" : undefined,
      search: search || undefined,
    };

    const result = await userService.listUsers(filters, page, limit);

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
    console.error("Error getting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create new user (admin only)
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
    const { username, email, phoneNumber, password, role } = body;

    // Validate required fields
    if (!username || !phoneNumber || !password) {
      return NextResponse.json(
        {
          error: "Missing required fields: username, phoneNumber, password",
        },
        { status: 400 }
      );
    }

    const result = await userService.createUser({
      username: username.trim(),
      email: email?.trim(),
      phoneNumber: phoneNumber.trim(),
      password: password,
      role: role || UserRole.CLIENT,
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
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
