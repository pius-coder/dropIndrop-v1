/**
 * API Response Utilities
 * 
 * Standardized response formats
 */

import type { Context } from "hono";

/**
 * Success response (200)
 */
export function success<T>(c: Context, data: T, message?: string) {
  return c.json({
    success: true,
    message: message || "Succès",
    data,
  });
}

/**
 * Created response (201)
 */
export function created<T>(c: Context, data: T, message?: string) {
  return c.json(
    {
      success: true,
      message: message || "Créé avec succès",
      data,
    },
    201,
  );
}

/**
 * No content response (204)
 */
export function noContent(c: Context) {
  return c.body(null, 204);
}

/**
 * Bad request response (400)
 */
export function badRequest(c: Context, message: string, details?: unknown) {
  return c.json(
    {
      success: false,
      error: "Bad Request",
      message,
      details,
    },
    400,
  );
}

/**
 * Unauthorized response (401)
 */
export function unauthorized(c: Context, message = "Non autorisé") {
  return c.json(
    {
      success: false,
      error: "Unauthorized",
      message,
    },
    401,
  );
}

/**
 * Forbidden response (403)
 */
export function forbidden(c: Context, message = "Accès refusé") {
  return c.json(
    {
      success: false,
      error: "Forbidden",
      message,
    },
    403,
  );
}

/**
 * Not found response (404)
 */
export function notFound(c: Context, message = "Ressource introuvable") {
  return c.json(
    {
      success: false,
      error: "Not Found",
      message,
    },
    404,
  );
}

/**
 * Conflict response (409)
 */
export function conflict(c: Context, message: string) {
  return c.json(
    {
      success: false,
      error: "Conflict",
      message,
    },
    409,
  );
}

/**
 * Server error response (500)
 */
export function serverError(c: Context, message = "Erreur serveur") {
  return c.json(
    {
      success: false,
      error: "Internal Server Error",
      message,
    },
    500,
  );
}
