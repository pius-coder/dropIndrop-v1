import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // For demo purposes, accept any valid-looking credentials
    // In production, this would validate against your user database
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Simulate user authentication
    // In production, you'd query your database here
    const mockUser = {
      id: "demo-user-id",
      username: username,
      email: `${username}@dropindrop.com`,
      phoneNumber: "+237600000000",
      role: username === "admin" ? UserRole.ADMIN : UserRole.CLIENT,
      isActive: true,
    };

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret";
    const token = jwt.sign(
      {
        userId: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      },
    });

    response.cookies.set("dropindrop-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
