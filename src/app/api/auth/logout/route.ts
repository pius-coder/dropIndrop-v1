import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logout user by clearing session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the session cookie
    response.cookies.set("dropindrop-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
