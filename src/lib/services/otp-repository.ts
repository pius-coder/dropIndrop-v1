import { PrismaClient } from "@prisma/client";

export interface CreateOTPData {
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
}

export interface OTPRecord {
  id: string;
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OTPRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new OTP record
   */
  async create(data: CreateOTPData): Promise<OTPRecord> {
    return this.prisma.oTP.create({
      data: {
        phoneNumber: data.phoneNumber,
        otpCode: data.otpCode,
        expiresAt: data.expiresAt,
        attempts: 0,
        isUsed: false,
      },
    });
  }

  /**
   * Find OTP record by phone number (most recent)
   */
  async findByPhoneNumber(phoneNumber: string): Promise<OTPRecord | null> {
    return this.prisma.oTP.findFirst({
      where: { phoneNumber },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find valid OTP record by phone number and code
   */
  async findValidOTP(
    phoneNumber: string,
    otpCode: string
  ): Promise<OTPRecord | null> {
    return this.prisma.oTP.findFirst({
      where: {
        phoneNumber,
        otpCode,
        isUsed: false,
      },
    });
  }

  /**
   * Increment attempt count for phone number
   */
  async incrementAttempts(phoneNumber: string): Promise<OTPRecord | null> {
    // First find the current record
    const currentRecord = await this.prisma.oTP.findFirst({
      where: { phoneNumber },
      orderBy: { createdAt: "desc" },
    });

    if (!currentRecord) return null;

    return this.prisma.oTP.update({
      where: { id: currentRecord.id },
      data: {
        attempts: currentRecord.attempts + 1,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Mark OTP as used
   */
  async markAsUsed(id: string): Promise<OTPRecord | null> {
    return this.prisma.oTP.update({
      where: { id },
      data: {
        isUsed: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Clean up expired OTP records
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.oTP.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
      },
    });
    return result.count;
  }

  /**
   * Get attempt count for phone number
   */
  async getAttemptCount(phoneNumber: string): Promise<number> {
    const record = await this.prisma.oTP.findFirst({
      where: { phoneNumber },
      orderBy: { createdAt: "desc" },
    });

    return record?.attempts || 0;
  }

  /**
   * Check if phone number has exceeded maximum attempts
   */
  async hasExceededAttempts(
    phoneNumber: string,
    maxAttempts: number = 3
  ): Promise<boolean> {
    const record = await this.prisma.oTP.findFirst({
      where: { phoneNumber },
      orderBy: { createdAt: "desc" },
    });

    return (record?.attempts || 0) >= maxAttempts;
  }

  /**
   * Delete OTP records for phone number
   */
  async deleteByPhoneNumber(phoneNumber: string): Promise<number> {
    const result = await this.prisma.oTP.deleteMany({
      where: { phoneNumber },
    });
    return result.count;
  }
}
