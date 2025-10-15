/**
 * Validation Middleware
 * 
 * Validates request data with Zod schemas
 */

import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";

/**
 * Validate JSON body
 */
export const validateBody = <T extends ZodSchema>(schema: T) => {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Validation Error",
          message: "Données invalides",
          details: result.error.issues,
        },
        400,
      );
    }
  });
};

/**
 * Validate query parameters
 */
export const validateQuery = <T extends ZodSchema>(schema: T) => {
  return zValidator("query", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Validation Error",
          message: "Paramètres invalides",
          details: result.error.issues,
        },
        400,
      );
    }
  });
};

/**
 * Validate route parameters
 */
export const validateParam = <T extends ZodSchema>(schema: T) => {
  return zValidator("param", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Validation Error",
          message: "Paramètre invalide",
          details: result.error.issues,
        },
        400,
      );
    }
  });
};
