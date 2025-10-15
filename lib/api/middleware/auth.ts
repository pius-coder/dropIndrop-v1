/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches admin to context
 */

import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { Admin } from "@/entities/admin";

// Extend Hono context with admin
export type AuthContext = {
  Variables: {
    admin: Admin;
    adminId: string;
  };
};

/**
 * Auth middleware - Requires valid JWT token
 * 
 * Attaches admin to context.var.admin
 */
export const authMiddleware = createMiddleware<AuthContext>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Token manquant ou invalide",
      },
      401,
    );
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    // Verify JWT
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const payload = await verify(token, secret);

    // Attach admin to context
    c.set("adminId", payload.sub as string);
    c.set("admin", payload as Admin);

    await next();
  } catch (error) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Token invalide ou expiré",
      },
      401,
    );
  }
});

/**
 * Optional auth middleware
 * 
 * Attaches admin if token present, but doesn't require it
 */
export const optionalAuthMiddleware = createMiddleware<AuthContext>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
        const payload = await verify(token, secret);

        c.set("adminId", payload.sub as string);
        c.set("admin", payload as Admin);
      } catch {
        // Invalid token, but that's okay for optional auth
      }
    }

    await next();
  },
);
