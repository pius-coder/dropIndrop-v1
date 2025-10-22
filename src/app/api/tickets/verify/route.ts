import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { TicketService } from "../../../../entities/ticket/domain/ticket-service";
import { authMiddleware } from "../../../../lib/middleware/auth-middleware";

const prisma = new PrismaClient();
const ticketService = new TicketService(prisma);

export async function POST(request: NextRequest) {
  try {
    // Authenticate user and check for delivery manager role
    const { user, response } = await authMiddleware(request, {
      requireAuth: true,
      allowedRoles: [UserRole.DELIVERY_MANAGER],
    });

    if (response) {
      return response;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { uniqueCode, qrCodeData, action } = body;

    // Validate input
    if (!uniqueCode && !qrCodeData) {
      return NextResponse.json(
        {
          success: false,
          error: "Either uniqueCode or qrCodeData is required",
        },
        { status: 400 }
      );
    }

    if (action === "verify") {
      // Verify ticket
      const result = await ticketService.verifyTicket(
        { uniqueCode, qrCodeData },
        user.id
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        ticket: result.ticket,
        order: result.order,
      });
    } else if (action === "use") {
      // Use ticket (mark as used and update order status)
      if (!uniqueCode && !qrCodeData) {
        return NextResponse.json(
          {
            success: false,
            error: "Ticket identifier is required to use ticket",
          },
          { status: 400 }
        );
      }

      // First verify the ticket
      const verifyResult = await ticketService.verifyTicket(
        { uniqueCode, qrCodeData },
        user.id
      );

      if (!verifyResult.success) {
        return NextResponse.json(
          { success: false, error: verifyResult.error },
          { status: 400 }
        );
      }

      // Use the ticket
      const useResult = await ticketService.useTicket(
        verifyResult.ticket!.id,
        user.id
      );

      if (!useResult.success) {
        return NextResponse.json(
          { success: false, error: useResult.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Ticket verified and order marked as delivered",
        ticket: verifyResult.ticket,
        order: verifyResult.order,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'verify' or 'use'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Ticket verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for ticket lookup (optional, for debugging)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user and check for delivery manager role
    const { user, response } = await authMiddleware(request, {
      requireAuth: true,
      allowedRoles: [UserRole.DELIVERY_MANAGER, UserRole.ADMIN],
    });

    if (response) {
      return response;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const uniqueCode = searchParams.get("uniqueCode");
    const ticketId = searchParams.get("ticketId");

    if (uniqueCode) {
      const ticket = await ticketService.getTicketByUniqueCode(uniqueCode);

      if (!ticket) {
        return NextResponse.json(
          { success: false, error: "Ticket not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ticket: {
          id: ticket.id,
          uniqueCode: ticket.uniqueCode,
          isUsed: ticket.isUsed,
          usedAt: ticket.usedAt,
          expiresAt: ticket.expiresAt,
          order: ticket.order
            ? {
                id: ticket.order.id,
                orderNumber: ticket.order.orderNumber,
                status: ticket.order.status,
                totalAmount: Number(ticket.order.totalAmount),
              }
            : null,
        },
      });
    } else if (ticketId) {
      const ticket = await ticketService.getTicket(ticketId);

      if (!ticket) {
        return NextResponse.json(
          { success: false, error: "Ticket not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ticket: {
          id: ticket.id,
          uniqueCode: ticket.uniqueCode,
          isUsed: ticket.isUsed,
          usedAt: ticket.usedAt,
          expiresAt: ticket.expiresAt,
          order: ticket.order
            ? {
                id: ticket.order.id,
                orderNumber: ticket.order.orderNumber,
                status: ticket.order.status,
                totalAmount: Number(ticket.order.totalAmount),
              }
            : null,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "uniqueCode or ticketId parameter is required",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Ticket lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
