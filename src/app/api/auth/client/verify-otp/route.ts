import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { otpService } from "../../../../../lib/services/otp-service";
import { UserRole } from "@prisma/client";

// Types for API request/response
interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
}

interface VerifyOTPResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    phoneNumber: string;
    role: UserRole;
    isActive: boolean;
  };
  error?: string;
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * API route for verifying OTP and creating client session
 * POST /api/auth/client/verify-otp
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: VerifyOTPRequest = await request.json();
    const { phoneNumber, otpCode } = body;

    // Validate input
    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number and OTP code are required",
        } as VerifyOTPResponse,
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!otpService.validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format",
        } as VerifyOTPResponse,
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OTP format",
        } as VerifyOTPResponse,
        { status: 400 }
      );
    }

    // Verify OTP for registration completion
    const verifyResult = await otpService.verifyOTPForRegistration(
      phoneNumber,
      otpCode
    );

    if (!verifyResult.success) {
      // Record failed attempt
      await otpService.recordFailedAttempt(phoneNumber);

      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || "Invalid OTP",
        } as VerifyOTPResponse,
        { status: 401 }
      );
    }

    // OTP verification successful
    const user = verifyResult.user!;
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User creation failed",
        } as VerifyOTPResponse,
        { status: 500 }
      );
    }

    // Clear OTP data after successful verification
    await otpService.clearOTPData(phoneNumber);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // Set HTTP-only cookie for security
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isActive: user.isActive,
        },
      } as VerifyOTPResponse,
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set("dropindrop-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in verify-otp API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as VerifyOTPResponse,
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use POST to verify OTP.",
    } as VerifyOTPResponse,
    { status: 405 }
  );
}
