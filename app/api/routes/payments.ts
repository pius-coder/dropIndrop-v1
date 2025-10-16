/**
 * Payment API Route
 * Handles payment initiation and processing
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";

const initiatePaymentSchema = z.object({
  articleId: z.string(),
  paymentMethod: z.enum(["MTN_MOMO", "ORANGE_MONEY"]),
  customerId: z.string(),
});

const app = new Hono();

/**
 * Initiate payment for an article
 */
app.post("/initiate", zValidator("json", initiatePaymentSchema), async (c) => {
  try {
    const { articleId, paymentMethod, customerId } = c.req.valid("json");

    // Verify authentication
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    ) as any;

    if (payload.type !== "customer" || payload.customerId !== customerId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get article
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.status !== "AVAILABLE" || article.stock <= 0) {
      return c.json({ error: "Article not available" }, 404);
    }

    // Generate order number
    const orderNumber = `DID${Date.now()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        articleId,
        amount: article.price,
        paymentMethod,
        paymentStatus: "PENDING",
        ticketCode: generateTicketCode(),
        ticketQRCode: generateQRCode(),
        ticketExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // For demo purposes, we'll simulate payment success
    // In production, this would integrate with PawaPay
    const paymentSuccess = await simulatePayment(paymentMethod, Number(article.price));

    if (paymentSuccess) {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          paymentTransactionId: `demo-${order.id}`,
          paidAt: new Date(),
        },
      });

      return c.json({
        success: true,
        orderId: order.id,
        message: "Paiement réussi",
        // In production, this would be the PawaPay payment URL
        paymentUrl: `/buy/success?orderId=${order.id}`,
      });
    } else {
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return c.json({
        error: "Payment failed",
        message: "Le paiement a échoué. Veuillez réessayer.",
      }, 400);
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Generate a unique ticket code
 */
function generateTicketCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Generate QR code data (in production, this would be a proper QR code)
 */
function generateQRCode(): string {
  return `TICKET-${Date.now()}`;
}

/**
 * Simulate payment processing (demo only)
 */
async function simulatePayment(method: string, amount: number): Promise<boolean> {
  // Simulate payment success (90% success rate for demo)
  return Math.random() > 0.1;
}

export default app;
