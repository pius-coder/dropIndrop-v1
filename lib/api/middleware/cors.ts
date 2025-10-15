/**
 * CORS Middleware
 * 
 * Handles Cross-Origin Resource Sharing
 */

import { cors as honoCors } from "hono/cors";

/**
 * CORS middleware configuration
 */
export const cors = honoCors({
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
});
