/**
 * JWT Utilities
 * 
 * Token generation and verification
 */

import { sign } from "hono/jwt";
import type { Admin } from "@/entities/admin";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "7d"; // 7 days

/**
 * Generate JWT token for admin
 */
export async function generateToken(admin: Admin): Promise<string> {
  const payload = {
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  return await sign(payload, JWT_SECRET);
}

/**
 * Get JWT secret
 */
export function getJWTSecret(): string {
  return JWT_SECRET;
}
