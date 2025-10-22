import { NextRequest, NextResponse } from "next/server";
import { otpService } from "../../../../../lib/services/otp-service";

// Types for API request/response
interface SendOTPRequest {
  phoneNumber: string;
}

interface SendOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * API route for sending OTP via WhatsApp
 * POST /api/auth/client/send-otp
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: SendOTPRequest = await request.json();
    const { phoneNumber } = body;

    // Validate phone number
    if (!phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required",
        } as SendOTPResponse,
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!otpService.validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid phone number format. Must include country code (e.g., +1234567890)",
        } as SendOTPResponse,
        { status: 400 }
      );
    }

    // Check if phone number has exceeded attempts
    const hasExceededAttempts = await otpService.hasExceededAttempts(
      phoneNumber
    );
    if (hasExceededAttempts) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum OTP attempts exceeded. Please try again later.",
        } as SendOTPResponse,
        { status: 429 }
      );
    }

    // Send OTP via WhatsApp
    const result = await otpService.sendOTP(phoneNumber);

    if (result.success) {
      // In production, you'd store the OTP in database with expiration
      // For demo purposes, we return success without storing

      return NextResponse.json(
        {
          success: true,
          message: "OTP sent successfully via WhatsApp",
        } as SendOTPResponse,
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send OTP",
        } as SendOTPResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-otp API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as SendOTPResponse,
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
      error: "Method not allowed. Use POST to send OTP.",
    } as SendOTPResponse,
    { status: 405 }
  );
}
