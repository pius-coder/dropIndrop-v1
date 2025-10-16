/**
 * Auth Routes
 * 
 * Authentication endpoints (login, logout, refresh)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/db";
import { loginRequestSchema } from "@/features/auth-login/model/types";
import { generateToken } from "@/lib/api/utils/jwt";
import { authMiddleware, type AuthContext } from "@/lib/api/middleware/auth";

const app = new Hono<AuthContext>();

app.post("/login", zValidator("json", loginRequestSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Email ou mot de passe incorrect",
      },
      401
    );
  }

  if (!admin.isActive) {
    return c.json(
      {
        error: "Forbidden",
        message: "Compte désactivé. Contactez un administrateur.",
      },
      403
    );
  }

  if (admin.password !== password) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Email ou mot de passe incorrect",
      },
      401
    );
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await generateToken(admin);

  const { password: _, ...adminWithoutPassword } = admin;

  const cookieOptions = [
    `auth-token=${token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${7 * 24 * 60 * 60}`,
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  c.header("Set-Cookie", cookieOptions);

  return c.json({
    token, // Also return in response for client-side storage
    admin: adminWithoutPassword,
  });
});

app.get("/me", authMiddleware, async (c) => {
  const adminId = c.get("adminId");
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin || !admin.isActive) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Utilisateur introuvable ou inactif",
      },
      401
    );
  }

  const { password: _, ...adminWithoutPassword } = admin;

  return c.json({ admin: adminWithoutPassword });
});

export default app;
