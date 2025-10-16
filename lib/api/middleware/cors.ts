/**
 * CORS Middleware
 * 
 * Handles Cross-Origin Resource Sharing
 */

import { cors as honoCors } from "hono/cors";

/**
 * CORS middleware configuration
 * 
 * For Next.js same-origin requests, allow all origins
 * In production, restrict to your domain
 */
export const cors = honoCors({
  origin: "*", // Allow all origins (same-origin for Next.js)
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
});
