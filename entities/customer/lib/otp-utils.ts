/**
 * Customer OTP Utilities
 * Handles OTP generation, validation, and WhatsApp messaging
 */

import { prisma } from "@/lib/db";
import { wahaChatService } from "@/lib/waha/chat-service";
import bcrypt from "bcryptjs";
import type { CustomerRegistration } from "../model/otp-types";

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP for storage (simple hash for demo)
 */
export function hashOTP(otp: string): string {
  return Buffer.from(otp).toString("base64");
}

/**
 * Verify OTP hash
 */
export function verifyOTP(otp: string, hashedOtp: string): boolean {
  return hashOTP(otp) === hashedOtp;
}

/**
 * Format phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Phone is already in 9-digit format (after +237)
  return `237${phone}@c.us`;
}

/**
 * Send OTP via WhatsApp
 */
export async function sendOTPWhatsApp(phone: string, otp: string): Promise<boolean> {
  try {
    const chatId = formatPhoneForWhatsApp(phone);

    const message = `🔐 Drop-In-Drop

Votre code de vérification:
*${otp}*

Ce code expire dans 5 minutes.

Ne partagez ce code avec personne.`;

    const result = await wahaChatService.sendText({
      chatId,
      text: message,
    });

    return result.success;
  } catch (error) {
    console.error("Failed to send OTP via WhatsApp:", error);
    return false;
  }
}

/**
 * Create customer registration record (temporary storage during OTP flow)
 */
export async function createCustomerRegistration(data: CustomerRegistration): Promise<void> {
  // Store registration data temporarily (will be used when OTP is verified)
  await prisma.customerRegistration.upsert({
    where: { phone: data.phone },
    update: data,
    create: {
      phone: data.phone,
      name: data.name,
      password: data.password ? await bcrypt.hash(data.password, 12) : null,
    },
  });
}

/**
 * Create or update customer OTP record
 */
export async function createCustomerOTP(phone: string, otp: string): Promise<void> {
  const hashedOtp = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.customerOTP.upsert({
    where: { phone },
    update: {
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
    },
    create: {
      phone,
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
    },
  });
}

/**
 * Verify customer OTP and complete registration
 */
export async function verifyCustomerOTP(phone: string, otp: string): Promise<{
  success: boolean;
  customer?: any;
  error?: string;
}> {
  try {
    const otpRecord = await prisma.customerOTP.findUnique({
      where: { phone },
    });

    if (!otpRecord) {
      return { success: false, error: "Aucun code OTP trouvé pour ce numéro" };
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      return { success: false, error: "Code OTP expiré" };
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return { success: false, error: "Trop de tentatives. Demandez un nouveau code" };
    }

    // Verify OTP
    if (!verifyOTP(otp, otpRecord.otp)) {
      // Increment attempts
      await prisma.customerOTP.update({
        where: { phone },
        data: { attempts: { increment: 1 } },
      });
      return { success: false, error: "Code OTP invalide" };
    }

    // Get registration data
    const registration = await prisma.customerRegistration.findUnique({
      where: { phone },
    });

    if (!registration) {
      return { success: false, error: "Données d'inscription manquantes" };
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    });

    let customer;
    if (existingCustomer) {
      // Update existing customer
      customer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: registration.name,
          password: registration.password,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          name: registration.name,
          phone,
          password: registration.password,
        },
      });
    }

    // Delete temporary records
    await Promise.all([
      prisma.customerOTP.delete({ where: { phone } }),
      prisma.customerRegistration.delete({ where: { phone } }),
    ]);

    return { success: true, customer };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, error: "Erreur lors de la vérification" };
  }
}

/**
 * Clean up expired OTP records
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  await prisma.customerOTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
