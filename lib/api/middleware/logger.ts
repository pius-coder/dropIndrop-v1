/**
 * Enhanced Logger Middleware
 * 
 * Comprehensive request/response logging with:
 * - Request ID for tracing
 * - Method, path, query params
 * - User info (if authenticated)
 * - Duration, status, response size
 * - Error details
 * - Color-coded output
 */

import { createMiddleware } from "hono/factory";
import type { AuthContext } from "./auth";

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format file size in human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Get status emoji
 */
function getStatusEmoji(status: number): string {
  if (status >= 500) return "🔴"; // Server error
  if (status >= 400) return "🟡"; // Client error
  if (status >= 300) return "🔵"; // Redirect
  if (status >= 200) return "🟢"; // Success
  return "⚪"; // Other
}

/**
 * Get method emoji
 */
function getMethodEmoji(method: string): string {
  switch (method) {
    case "GET":
      return "📖";
    case "POST":
      return "➕";
    case "PUT":
      return "✏️";
    case "PATCH":
      return "🔧";
    case "DELETE":
      return "🗑️";
    default:
      return "📡";
  }
}

/**
 * Sanitize sensitive data from logs
 */
function sanitize(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = { ...obj };
  const sensitiveKeys = ["password", "token", "secret", "authorization", "apiKey"];

  for (const key in sanitized) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = "***REDACTED***";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Enhanced logger middleware
 */
export const logger = createMiddleware<AuthContext>(async (c, next) => {
  const requestId = generateRequestId();
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const methodEmoji = getMethodEmoji(method);

  // Get query params
  const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
  const hasQuery = Object.keys(queryParams).length > 0;

  // Log incoming request
  console.log("\n" + "=".repeat(80));
  console.log(`${methodEmoji} ${method} ${path}`);
  console.log(`📝 Request ID: ${requestId}`);
  console.log(`🕐 Time: ${new Date().toISOString()}`);

  if (hasQuery) {
    console.log(`🔍 Query:`, sanitize(queryParams));
  }

  // Note: Body logging removed as it would consume the request
  // For body logging, use it in route handlers instead

  // Get user info if authenticated
  try {
    const admin = c.var?.admin;
    if (admin) {
      console.log(`👤 User: ${admin.name} (${admin.email}) - ${admin.role}`);
    }
  } catch {
    // Not authenticated, continue
  }

  // Execute route handler
  await next();

  // Log response
  const duration = Date.now() - start;
  const status = c.res.status;
  const statusEmoji = getStatusEmoji(status);

  // Get response size if available
  const contentLength = c.res.headers.get("Content-Length");
  const sizeInfo = contentLength ? ` - ${formatBytes(parseInt(contentLength))}` : "";

  // Format duration with color
  let durationColor = "";
  if (duration < 100) durationColor = "⚡"; // Fast
  else if (duration < 500) durationColor = "⏱️"; // Normal
  else if (duration < 1000) durationColor = "🐌"; // Slow
  else durationColor = "🔥"; // Very slow

  console.log(
    `${statusEmoji} Response: ${status} ${durationColor} ${duration}ms${sizeInfo}`,
  );

  // Log errors
  if (status >= 400) {
    try {
      const responseText = await c.res.clone().text();
      const responseData = JSON.parse(responseText);
      console.log(`❌ Error:`, {
        error: responseData.error,
        message: responseData.message,
        details: responseData.details,
      });
    } catch {
      // Response not JSON or already consumed
    }
  }

  console.log("=".repeat(80));
});
