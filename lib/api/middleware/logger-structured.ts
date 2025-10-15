/**
 * Structured Logger (for Production)
 * 
 * JSON-formatted logs for log aggregation systems
 * (Datadog, CloudWatch, Logtail, etc.)
 */

import { createMiddleware } from "hono/factory";
import type { AuthContext } from "./auth";

interface LogEntry {
  timestamp: string;
  requestId: string;
  level: "info" | "warn" | "error";
  method: string;
  path: string;
  query?: Record<string, string>;
  status: number;
  duration: number;
  userId?: string;
  userRole?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Structured logger for production
 */
export const structuredLogger = createMiddleware<AuthContext>(async (c, next) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  // Get query params
  const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);

  // Execute route
  let error: Error | undefined;
  try {
    await next();
  } catch (e) {
    error = e as Error;
    throw e;
  } finally {
    const duration = Date.now() - start;
    const status = c.res.status;

    // Get user info
    const admin = c.var?.admin;

    // Build log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
      method,
      path,
      query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      status,
      duration,
      userId: admin?.id,
      userRole: admin?.role,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
          }
        : undefined,
    };

    // Output as JSON
    console.log(JSON.stringify(logEntry));
  }
});

/**
 * Use structured logger in production, regular logger in development
 */
export const smartLogger = process.env.NODE_ENV === "production"
  ? structuredLogger
  : async (c: any, next: any) => {
      // Import regular logger dynamically
      const { logger } = await import("./logger");
      return logger(c, next);
    };
