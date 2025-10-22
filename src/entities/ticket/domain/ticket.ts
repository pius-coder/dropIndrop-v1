import { Prisma } from "@prisma/client";

export interface TicketEntity {
  id: string;
  orderId: string;
  qrCodeData: string;
  uniqueCode: string;
  isUsed: boolean;
  usedAt?: Date;
  usedBy?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketData {
  orderId: string;
  qrCodeData: string;
  uniqueCode: string;
  expiresAt: Date;
}

export interface UpdateTicketData {
  isUsed?: boolean;
  usedAt?: Date;
  usedBy?: string;
}

export interface VerifyTicketData {
  uniqueCode?: string;
  qrCodeData?: string;
}

export class TicketValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TicketValidationError";
  }
}

export class Ticket {
  constructor(private data: TicketEntity) {}

  static fromPrisma(data: any): Ticket {
    const ticketData: TicketEntity = {
      id: data.id,
      orderId: data.orderId,
      qrCodeData: data.qrCodeData,
      uniqueCode: data.uniqueCode,
      isUsed: data.isUsed,
      usedAt: data.usedAt,
      usedBy: data.usedBy,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return new Ticket(ticketData);
  }

  static create(data: CreateTicketData): Ticket {
    this.validateCreateData(data);

    const ticketData: TicketEntity = {
      id: "", // Will be set by database
      orderId: data.orderId,
      qrCodeData: data.qrCodeData,
      uniqueCode: data.uniqueCode,
      isUsed: false,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Ticket(ticketData);
  }

  static validateCreateData(data: CreateTicketData): void {
    const errors: string[] = [];

    if (!data.orderId || data.orderId.trim().length === 0) {
      errors.push("Order ID is required");
    }

    if (!data.qrCodeData || data.qrCodeData.trim().length === 0) {
      errors.push("QR code data is required");
    }

    if (!data.uniqueCode || data.uniqueCode.trim().length === 0) {
      errors.push("Unique code is required");
    }

    if (!data.expiresAt) {
      errors.push("Expiration date is required");
    }

    if (data.expiresAt && data.expiresAt <= new Date()) {
      errors.push("Expiration date must be in the future");
    }

    if (errors.length > 0) {
      throw new TicketValidationError(
        `Ticket validation failed: ${errors.join("; ")}`
      );
    }
  }

  update(data: UpdateTicketData): void {
    this.validateUpdateData(data);

    if (data.isUsed !== undefined) {
      this.data.isUsed = data.isUsed;
    }

    if (data.usedAt !== undefined) {
      this.data.usedAt = data.usedAt;
    }

    if (data.usedBy !== undefined) {
      this.data.usedBy = data.usedBy;
    }

    this.data.updatedAt = new Date();
  }

  validateUpdateData(data: UpdateTicketData): void {
    const errors: string[] = [];

    if (data.usedAt && data.usedAt > new Date()) {
      errors.push("Used date cannot be in the future");
    }

    if (errors.length > 0) {
      throw new TicketValidationError(
        `Ticket update validation failed: ${errors.join("; ")}`
      );
    }
  }

  // Getters
  get id(): string {
    return this.data.id;
  }
  get orderId(): string {
    return this.data.orderId;
  }
  get qrCodeData(): string {
    return this.data.qrCodeData;
  }
  get uniqueCode(): string {
    return this.data.uniqueCode;
  }
  get isUsed(): boolean {
    return this.data.isUsed;
  }
  get usedAt(): Date | undefined {
    return this.data.usedAt;
  }
  get usedBy(): string | undefined {
    return this.data.usedBy;
  }
  get expiresAt(): Date {
    return this.data.expiresAt;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  // Business logic methods
  isExpired(): boolean {
    return this.data.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.data.isUsed && !this.isExpired();
  }

  canBeUsed(): boolean {
    return this.isValid();
  }

  markAsUsed(usedBy: string): void {
    if (!this.canBeUsed()) {
      throw new TicketValidationError("Ticket cannot be used");
    }

    this.update({
      isUsed: true,
      usedAt: new Date(),
      usedBy,
    });
  }

  toJSON(): TicketEntity {
    return { ...this.data };
  }
}
