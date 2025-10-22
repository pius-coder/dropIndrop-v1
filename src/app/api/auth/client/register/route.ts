import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { otpService } from "../../../../../lib/services/otp-service";
import { prisma } from "../../../../../lib/db";
import { UserRole } from "@prisma/client";

// Types for API request/response
interface RegisterRequest {
  username: string;
  password: string;
  phoneNumber: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * API route for client registration
 * POST /api/auth/client/register
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: RegisterRequest = await request.json();
    const { username, password, phoneNumber } = body;

    // Validate input
    if (!username || !password || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nom d'utilisateur, mot de passe et numéro de téléphone sont requis",
        } as RegisterResponse,
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        } as RegisterResponse,
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Le mot de passe doit contenir au moins 6 caractères",
        } as RegisterResponse,
        { status: 400 }
      );
    }

    // Validate phone number format (Cameroon)
    const phoneRegex = /^\+237[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Le numéro de téléphone doit être au format +237XXXXXXXXX",
        } as RegisterResponse,
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Ce nom d'utilisateur est déjà pris",
        } as RegisterResponse,
        { status: 409 }
      );
    }

    // Check if phone number already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Ce numéro de téléphone est déjà enregistré",
        } as RegisterResponse,
        { status: 409 }
      );
    }

    // Check if phone number has exceeded OTP attempts
    const hasExceededAttempts = await otpService.hasExceededAttempts(
      phoneNumber
    );
    if (hasExceededAttempts) {
      return NextResponse.json(
        {
          success: false,
          error: "Trop de tentatives. Veuillez réessayer plus tard.",
        } as RegisterResponse,
        { status: 429 }
      );
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (inactive until OTP verification)
    const user = await prisma.user.create({
      data: {
        username,
        phoneNumber,
        passwordHash,
        role: UserRole.CLIENT,
        isActive: false, // Will be activated after OTP verification
      },
    });

    // Send OTP via WhatsApp
    const otpResult = await otpService.sendOTP(phoneNumber);

    if (!otpResult.success) {
      // Clean up created user if OTP sending fails
      await prisma.user.delete({
        where: { id: user.id },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi du code de vérification",
        } as RegisterResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Inscription réussie. Code de vérification envoyé via WhatsApp.",
      } as RegisterResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in client registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne du serveur",
      } as RegisterResponse,
      { status: 500 }
    );
  }
}
