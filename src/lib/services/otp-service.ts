import { randomInt } from "crypto";
import { wahaClient } from "../../entities/whatsapp/infrastructure/waha-client";
import { User } from "../../entities/user/domain/user";
import { UserRole } from "@prisma/client";
import { OTPRepository } from "./otp-repository";
import { prisma } from "../db";

// Types for OTP service
export interface OTPSendResult {
  success: boolean;
  otpCode?: string;
  error?: string;
}

export interface OTPVerifyResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface OTPServiceConfig {
  otpLength: number;
  otpExpiryMinutes: number;
  maxAttempts: number;
  whatsappMessageTemplate: string;
}

/**
 * Service for handling OTP operations via WhatsApp
 * Manages OTP generation, sending, and verification
 */
export class OTPService {
  private config: OTPServiceConfig;
  private otpRepository: OTPRepository;

  constructor(config?: Partial<OTPServiceConfig>) {
    this.config = {
      otpLength: 6,
      otpExpiryMinutes: 5,
      maxAttempts: 3,
      whatsappMessageTemplate:
        "Your verification code is: {otp}. Valid for {minutes} minutes.",
      ...config,
    };
    this.otpRepository = new OTPRepository(prisma);
  }

  /**
   * Generate a random OTP code
   */
  private generateOTP(): string {
    const min = Math.pow(10, this.config.otpLength - 1);
    const max = Math.pow(10, this.config.otpLength) - 1;
    return randomInt(min, max + 1).toString();
  }

  /**
   * Format WhatsApp message with OTP details
   */
  private formatWhatsAppMessage(otpCode: string): string {
    return this.config.whatsappMessageTemplate
      .replace("{otp}", otpCode)
      .replace("{minutes}", this.config.otpExpiryMinutes.toString());
  }

  /**
   * Send OTP to phone number via WhatsApp
   */
  async sendOTP(phoneNumber: string): Promise<OTPSendResult> {
    try {
      // Generate OTP code
      const otpCode = this.generateOTP();

      // Format WhatsApp message
      const message = this.formatWhatsAppMessage(otpCode);

      // Send via WhatsApp
      const result = await wahaClient.sendText({
        chatId: `${phoneNumber.replace(/^\+/, "")}@c.us`, // Remove any leading + and use phone number as WhatsApp chat ID
        text: message,
      });

      if (result.success) {
        // Clean up any existing OTP records for this phone number
        await this.otpRepository.deleteByPhoneNumber(phoneNumber);

        // Create new OTP record in database
        const expiresAt = this.getOTPExpiryTime();
        await this.otpRepository.create({
          phoneNumber,
          otpCode,
          expiresAt,
        });

        return {
          success: true,
          otpCode,
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to send WhatsApp message",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify OTP code for a phone number
   * Production implementation with database operations
   */
  async verifyOTP(
    phoneNumber: string,
    otpCode: string
  ): Promise<OTPVerifyResult> {
    try {
      console.log(`[OTPService] Starting OTP verification for phone: ${phoneNumber}`);

      // Check if OTP is valid format
      if (!/^\d{6}$/.test(otpCode)) {
        console.log(`[OTPService] Invalid OTP format for phone: ${phoneNumber}`);
        return {
          success: false,
          error: "Invalid OTP format",
        };
      }

      // Check if phone number has exceeded maximum attempts
      if (
        await this.otpRepository.hasExceededAttempts(
          phoneNumber,
          this.config.maxAttempts
        )
      ) {
        console.log(`[OTPService] Too many failed attempts for phone: ${phoneNumber}`);
        return {
          success: false,
          error: `Too many failed attempts. Please request a new OTP.`,
        };
      }

      // Find valid OTP record in database
      console.log(`[OTPService] Looking for valid OTP record for phone: ${phoneNumber}`);
      const otpRecord = await this.otpRepository.findValidOTP(
        phoneNumber,
        otpCode
      );

      if (!otpRecord) {
        // Record failed attempt
        console.log(`[OTPService] Invalid or expired OTP for phone: ${phoneNumber}, recording failed attempt`);
        await this.otpRepository.incrementAttempts(phoneNumber);

        return {
          success: false,
          error: "Invalid or expired OTP",
        };
      }

      console.log(`[OTPService] Valid OTP found for phone: ${phoneNumber}, proceeding with user check`);

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        console.log(`[OTPService] User not found, creating new user for phone: ${phoneNumber}`);
        // Create new user
        user = await prisma.user.create({
          data: {
            username: `user_${phoneNumber.replace(/[^0-9]/g, "")}`,
            phoneNumber,
            passwordHash: "hashed_password", // In production, hash the password
            role: UserRole.CLIENT,
            isActive: true,
          },
        });
        console.log(`[OTPService] New user created with ID: ${user.id}`);
      } else {
        console.log(`[OTPService] Existing user found, updating last login for user ID: ${user.id}`);
        // Update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Clear OTP data after successful verification
      console.log(`[OTPService] Clearing OTP data for phone: ${phoneNumber}`);
      await this.clearOTPData(phoneNumber);

      // Convert Prisma user to Domain User
      const domainUser = new User(
        user.id,
        user.username,
        user.phoneNumber,
        user.passwordHash,
        user.role,
        user.isActive,
        user.email || undefined,
        user.lastLoginAt || undefined,
        undefined, // otpCode (cleared after verification)
        undefined, // otpExpiresAt
        0, // otpAttempts
        user.createdAt,
        user.updatedAt
      );

      console.log(`[OTPService] OTP verification successful for phone: ${phoneNumber}, user ID: ${user.id}`);

      // Send welcome message via WhatsApp
      try {
        const welcomeMessage = `Welcome ${user.username}! You have successfully logged in to DropInDrop.`;
        await wahaClient.sendText({
          chatId: `${phoneNumber.replace(/^\+/, "")}@c.us`,
          text: welcomeMessage,
        });
        console.log(`[OTPService] Welcome message sent to phone: ${phoneNumber}`);
      } catch (error) {
        console.error(`[OTPService] Failed to send welcome message to phone: ${phoneNumber}`, error);
        // Don't fail the login if welcome message fails
      }

      return {
        success: true,
        user: domainUser,
      };
    } catch (error) {
      console.error(`[OTPService] Error during OTP verification for phone: ${phoneNumber}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify OTP code for registration completion
   * Activates user account and completes registration process
   */
  async verifyOTPForRegistration(
    phoneNumber: string,
    otpCode: string
  ): Promise<OTPVerifyResult> {
    try {
      console.log(`[OTPService] Starting registration OTP verification for phone: ${phoneNumber}`);

      // Check if OTP is valid format
      if (!/^\d{6}$/.test(otpCode)) {
        console.log(`[OTPService] Invalid OTP format for phone: ${phoneNumber}`);
        return {
          success: false,
          error: "Format de code OTP invalide",
        };
      }

      // Check if phone number has exceeded maximum attempts
      if (
        await this.otpRepository.hasExceededAttempts(
          phoneNumber,
          this.config.maxAttempts
        )
      ) {
        console.log(`[OTPService] Too many failed attempts for phone: ${phoneNumber}`);
        return {
          success: false,
          error: `Trop de tentatives échouées. Veuillez redemander un nouveau code.`,
        };
      }

      // Find valid OTP record in database
      console.log(`[OTPService] Looking for valid OTP record for phone: ${phoneNumber}`);
      const otpRecord = await this.otpRepository.findValidOTP(
        phoneNumber,
        otpCode
      );

      if (!otpRecord) {
        // Record failed attempt
        console.log(`[OTPService] Invalid or expired OTP for phone: ${phoneNumber}, recording failed attempt`);
        await this.otpRepository.incrementAttempts(phoneNumber);

        return {
          success: false,
          error: "Code OTP invalide ou expiré",
        };
      }

      console.log(`[OTPService] Valid OTP found for phone: ${phoneNumber}, proceeding with user activation`);

      // Find the user by phone number
      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        console.log(`[OTPService] User not found for phone: ${phoneNumber}`);
        return {
          success: false,
          error: "Utilisateur non trouvé. Veuillez vous réinscrire.",
        };
      }

      // Activate user account and update last login
      console.log(`[OTPService] Activating user account for user ID: ${user.id}`);
      const activatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Clear OTP data after successful verification
      console.log(`[OTPService] Clearing OTP data for phone: ${phoneNumber}`);
      await this.clearOTPData(phoneNumber);

      // Convert Prisma user to Domain User
      const domainUser = new User(
        activatedUser.id,
        activatedUser.username,
        activatedUser.phoneNumber,
        activatedUser.passwordHash,
        activatedUser.role,
        activatedUser.isActive,
        activatedUser.email || undefined,
        activatedUser.lastLoginAt || undefined,
        undefined, // otpCode (cleared after verification)
        undefined, // otpExpiresAt
        0, // otpAttempts
        activatedUser.createdAt,
        activatedUser.updatedAt
      );

      console.log(`[OTPService] Registration OTP verification successful for phone: ${phoneNumber}, user ID: ${user.id}`);

      return {
        success: true,
        user: domainUser,
      };
    } catch (error) {
      console.error(`[OTPService] Error during registration OTP verification for phone: ${phoneNumber}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  /**
   * Check if phone number has exceeded maximum OTP attempts
   */
  async hasExceededAttempts(phoneNumber: string): Promise<boolean> {
    return this.otpRepository.hasExceededAttempts(
      phoneNumber,
      this.config.maxAttempts
    );
  }

  /**
   * Record failed OTP attempt
   */
  async recordFailedAttempt(phoneNumber: string): Promise<void> {
    await this.otpRepository.incrementAttempts(phoneNumber);
  }

  /**
   * Clear OTP data for phone number (after successful verification)
   */
  async clearOTPData(phoneNumber: string): Promise<void> {
    await this.otpRepository.deleteByPhoneNumber(phoneNumber);
  }

  /**
   * Get OTP expiry time
   */
  getOTPExpiryTime(): Date {
    const expiryTime = new Date();
    expiryTime.setMinutes(
      expiryTime.getMinutes() + this.config.otpExpiryMinutes
    );
    return expiryTime;
  }

  /**
   * Validate phone number format (Cameroon format)
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Cameroon phone number validation: +237 followed by 9 digits
    return /^\+237[0-9]{9}$/.test(phoneNumber);
  }

  /**
   * Clean up expired OTP records
   */
  async cleanupExpiredOTPs(): Promise<number> {
    return this.otpRepository.cleanupExpired();
  }
}

// Export singleton instance
export const otpService = new OTPService();
