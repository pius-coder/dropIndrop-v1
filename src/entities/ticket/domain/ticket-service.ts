import { PrismaClient } from "@prisma/client";
import {
  Ticket,
  CreateTicketData,
  UpdateTicketData,
  VerifyTicketData,
  TicketValidationError,
} from "./ticket";

export interface TicketVerificationResult {
  success: boolean;
  ticket?: {
    id: string;
    orderId: string;
    uniqueCode: string;
    isUsed: boolean;
    expiresAt: Date;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    customer: {
      id: string;
      username: string;
      phoneNumber: string;
    };
  };
  error?: string;
}

export interface TicketCreationResult {
  success: boolean;
  ticket?: {
    id: string;
    uniqueCode: string;
    qrCodeData: string;
    expiresAt: Date;
  };
  error?: string;
}

export class TicketService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new ticket for an order
   */
  async createTicket(
    orderId: string,
    expirationHours: number = 24
  ): Promise<TicketCreationResult> {
    try {
      // Check if order exists
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { ticket: true },
      });

      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }

      // Check if ticket already exists for this order
      if (order.ticket) {
        return {
          success: false,
          error: "Ticket already exists for this order",
        };
      }

      // Generate unique code
      const uniqueCode = this.generateUniqueCode();

      // Generate QR code data (encrypted order info)
      const qrCodeData = this.generateQRCodeData(orderId, uniqueCode);

      // Set expiration date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      // Create ticket data
      const ticketData: CreateTicketData = {
        orderId,
        qrCodeData,
        uniqueCode,
        expiresAt,
      };

      // Create ticket using domain entity validation
      const ticket = Ticket.create(ticketData);

      // Save to database
      const createdTicket = await this.prisma.ticket.create({
        data: {
          orderId: ticket.orderId,
          qrCodeData: ticket.qrCodeData,
          uniqueCode: ticket.uniqueCode,
          expiresAt: ticket.expiresAt,
        },
      });

      return {
        success: true,
        ticket: {
          id: createdTicket.id,
          uniqueCode: createdTicket.uniqueCode,
          qrCodeData: createdTicket.qrCodeData,
          expiresAt: createdTicket.expiresAt,
        },
      };
    } catch (error) {
      console.error("Failed to create ticket:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create ticket",
      };
    }
  }

  /**
   * Verify ticket by unique code or QR code data
   */
  async verifyTicket(
    verifyData: VerifyTicketData,
    deliveryManagerId: string
  ): Promise<TicketVerificationResult> {
    try {
      // Find ticket by unique code or QR code data
      let ticket;
      if (verifyData.uniqueCode) {
        ticket = await this.prisma.ticket.findUnique({
          where: { uniqueCode: verifyData.uniqueCode },
          include: {
            order: {
              include: {
                customer: {
                  select: {
                    id: true,
                    username: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
        });
      } else if (verifyData.qrCodeData) {
        ticket = await this.prisma.ticket.findFirst({
          where: { qrCodeData: verifyData.qrCodeData },
          include: {
            order: {
              include: {
                customer: {
                  select: {
                    id: true,
                    username: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
        });
      } else {
        return {
          success: false,
          error: "Either unique code or QR code data is required",
        };
      }

      if (!ticket) {
        return {
          success: false,
          error: "Ticket not found",
        };
      }

      // Validate ticket using domain entity
      const ticketEntity = Ticket.fromPrisma(ticket);

      if (!ticketEntity.canBeUsed()) {
        if (ticketEntity.isExpired()) {
          return {
            success: false,
            error: "Ticket has expired",
          };
        }
        if (ticketEntity.isUsed) {
          return {
            success: false,
            error: "Ticket has already been used",
          };
        }
      }

      // Check if order can be delivered
      if (ticket.order.status !== "PAID") {
        return {
          success: false,
          error: `Order status is ${ticket.order.status}. Only paid orders can be delivered.`,
        };
      }

      return {
        success: true,
        ticket: {
          id: ticket.id,
          orderId: ticket.orderId,
          uniqueCode: ticket.uniqueCode,
          isUsed: ticket.isUsed,
          expiresAt: ticket.expiresAt,
        },
        order: {
          id: ticket.order.id,
          orderNumber: ticket.order.orderNumber,
          status: ticket.order.status,
          totalAmount: Number(ticket.order.totalAmount),
          customer: ticket.order.customer,
        },
      };
    } catch (error) {
      console.error("Failed to verify ticket:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to verify ticket",
      };
    }
  }

  /**
   * Mark ticket as used and update order status to delivered
   */
  async useTicket(
    ticketId: string,
    deliveryManagerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Get ticket with order
        const ticket = await tx.ticket.findUnique({
          where: { id: ticketId },
          include: { order: true },
        });

        if (!ticket) {
          throw new Error("Ticket not found");
        }

        // Validate ticket can be used
        const ticketEntity = Ticket.fromPrisma(ticket);
        if (!ticketEntity.canBeUsed()) {
          if (ticketEntity.isExpired()) {
            throw new Error("Ticket has expired");
          }
          if (ticketEntity.isUsed) {
            throw new Error("Ticket has already been used");
          }
        }

        // Update ticket as used
        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            isUsed: true,
            usedAt: new Date(),
            usedBy: deliveryManagerId,
          },
        });

        // Update order status to delivered
        await tx.order.update({
          where: { id: ticket.orderId },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
            deliveredBy: deliveryManagerId,
          },
        });

        return { success: true };
      });

      return result;
    } catch (error) {
      console.error("Failed to use ticket:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to use ticket",
      };
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string) {
    return await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                username: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get ticket by unique code
   */
  async getTicketByUniqueCode(uniqueCode: string) {
    return await this.prisma.ticket.findUnique({
      where: { uniqueCode },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                username: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Generate a unique code for tickets (format: ABCD-1234)
   */
  private generateUniqueCode(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let code = "";
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    code += "-";
    for (let i = 0; i < 4; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return code;
  }

  /**
   * Generate QR code data (encrypted order verification data)
   */
  private generateQRCodeData(orderId: string, uniqueCode: string): string {
    // In a real implementation, this would be properly encrypted
    // For now, we'll use a simple encoded format
    const data = {
      orderId,
      uniqueCode,
      timestamp: Date.now(),
    };

    return Buffer.from(JSON.stringify(data)).toString("base64");
  }

  /**
   * Decode QR code data
   */
  static decodeQRCodeData(
    qrCodeData: string
  ): { orderId: string; uniqueCode: string; timestamp: number } | null {
    try {
      const decoded = Buffer.from(qrCodeData, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
}
