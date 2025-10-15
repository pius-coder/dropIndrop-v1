/**
 * Error Handling Middleware
 * 
 * Global error handler for API
 */

import { createMiddleware } from "hono/factory";
import type { Context } from "hono";

/**
 * Error handler middleware
 * 
 * Catches all errors and returns formatted JSON response
 */
export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error("API Error:", error);

    // Prisma errors
    if (error instanceof Error && error.name === "PrismaClientKnownRequestError") {
      return handlePrismaError(c, error);
    }

    // Validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return c.json(
        {
          error: "Validation Error",
          message: "Données invalides",
          details: error,
        },
        400,
      );
    }

    // Generic errors
    if (error instanceof Error) {
      return c.json(
        {
          error: error.name,
          message: error.message,
        },
        500,
      );
    }

    // Unknown errors
    return c.json(
      {
        error: "Internal Server Error",
        message: "Une erreur est survenue",
      },
      500,
    );
  }
});

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(c: Context, error: any) {
  const code = error.code;

  // P2002: Unique constraint violation
  if (code === "P2002") {
    return c.json(
      {
        error: "Conflict",
        message: "Cette ressource existe déjà",
        field: error.meta?.target,
      },
      409,
    );
  }

  // P2025: Record not found
  if (code === "P2025") {
    return c.json(
      {
        error: "Not Found",
        message: "Ressource introuvable",
      },
      404,
    );
  }

  // P2003: Foreign key constraint failed
  if (code === "P2003") {
    return c.json(
      {
        error: "Bad Request",
        message: "Relation invalide",
        field: error.meta?.field_name,
      },
      400,
    );
  }

  // Generic Prisma error
  return c.json(
    {
      error: "Database Error",
      message: "Erreur de base de données",
    },
    500,
  );
}
