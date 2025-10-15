/**
 * Admin Entity - Types & Schema
 * 
 * Admin user management with role-based permissions
 */

import { z } from "zod";
import type { Admin as PrismaAdmin } from "@prisma/client";

/**
 * Admin Role Enum
 */
export const AdminRoleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "DELIVERY_MANAGER",
  "SUPPORT",
]);
export type AdminRole = z.infer<typeof AdminRoleEnum>;

/**
 * Create Admin Schema
 */
export const createAdminSchema = z.object({
  email: z
    .string()
    .email("Email invalide")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),

  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  role: AdminRoleEnum,
});

/**
 * Update Admin Schema
 */
export const updateAdminSchema = z.object({
  email: z.string().email().toLowerCase().optional(),
  name: z.string().min(2).max(100).optional(),
  role: AdminRoleEnum.optional(),
  isActive: z.boolean().optional(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .optional(),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

/**
 * Admin Filter Schema
 */
export const adminFilterSchema = z.object({
  role: AdminRoleEnum.optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(), // Search by name or email
});

/**
 * TypeScript Types
 */
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminFilter = z.infer<typeof adminFilterSchema>;

/**
 * Admin type from Prisma
 */
export type Admin = PrismaAdmin;

/**
 * Admin without password
 */
export type AdminPublic = Omit<Admin, "password">;

/**
 * Permission type
 */
export type Permission =
  | "articles:read"
  | "articles:create"
  | "articles:update"
  | "articles:delete"
  | "drops:read"
  | "drops:create"
  | "drops:send"
  | "orders:read"
  | "orders:validate"
  | "customers:read"
  | "customers:update"
  | "admins:read"
  | "admins:create"
  | "admins:update"
  | "admins:delete"
  | "settings:read"
  | "settings:update";
