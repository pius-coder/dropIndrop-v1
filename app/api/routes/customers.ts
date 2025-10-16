/**
 * Customer OTP API
 * Handles OTP sending and verification for customer authentication
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/db";
import { sendOtpSchema, verifyOtpSchema } from "@/entities/customer/model/otp-types";
import {
  generateOTP,
  sendOTPWhatsApp,
  createCustomerRegistration,
  createCustomerOTP,
  verifyCustomerOTP,
} from "@/entities/customer/lib/otp-utils";
import jwt from "jsonwebtoken";

const app = new Hono();

/**
 * Send OTP to customer phone number (for registration/login)
 */
app.post("/send-otp", zValidator("json", sendOtpSchema), async (c) => {
  try {
    const { phone, name, password } = c.req.valid("json");

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    });

    // Store registration data temporarily
    await createCustomerRegistration({ phone, name, password });

    // Generate and send OTP
    const otp = generateOTP();
    const sent = await sendOTPWhatsApp(phone, otp);

    if (!sent) {
      return c.json({
        error: "Failed",
        message: "Impossible d'envoyer le code OTP"
      }, 500);
    }

    // Store OTP
    await createCustomerOTP(phone, otp);

    return c.json({
      success: true,
      message: "Code OTP envoyé avec succès",
      customerExists: !!existingCustomer,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return c.json({
      error: "Internal Error",
      message: "Erreur lors de l'envoi du code OTP"
    }, 500);
  }
});

/**
 * Verify OTP and create customer session
 */
app.post("/verify-otp", zValidator("json", verifyOtpSchema), async (c) => {
  try {
    const { phone, otp } = c.req.valid("json");

    // Verify OTP and complete registration
    const result = await verifyCustomerOTP(phone, otp);

    if (!result.success) {
      return c.json({
        error: "Invalid OTP",
        message: result.error,
      }, 400);
    }

    const { customer } = result;

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer.id,
        phone: customer.phone,
        type: "customer",
      },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "30d" }
    );

    return c.json({
      success: true,
      message: "Authentification réussie",
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        createdAt: customer.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return c.json({
      error: "Internal Error",
      message: "Erreur lors de la vérification du code OTP"
    }, 500);
  }
});

/**
 * Get current customer profile (requires authentication)
 */
app.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({
        error: "Unauthorized",
        message: "Token manquant ou invalide"
      }, 401);
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key-change-in-production"
      ) as any;

      if (payload.type !== "customer") {
        return c.json({
          error: "Unauthorized",
          message: "Token invalide pour un client"
        }, 401);
      }

      const customer = await prisma.customer.findUnique({
        where: { id: payload.customerId },
      });

      if (!customer) {
        return c.json({
          error: "Not Found",
          message: "Client introuvable"
        }, 404);
      }

      return c.json({
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          createdAt: customer.createdAt,
        },
      });
    } catch (jwtError) {
      return c.json({
        error: "Unauthorized",
        message: "Token invalide ou expiré"
      }, 401);
    }
  } catch (error) {
    console.error("Get customer profile error:", error);
    return c.json({
      error: "Internal Error",
      message: "Erreur lors de la récupération du profil"
    }, 500);
  }
});

export default app;
