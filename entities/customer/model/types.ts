/**
 * Customer Entity - Types & Schema
 * 
 * Customer data management with loyalty tracking
 */

import { z } from "zod";
import type { Customer as PrismaCustomer } from "@prisma/client";

/**
 * Create/Update Customer Schema
 */
export const customerSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  phone: z
    .string()
    .regex(/^(\+237)?[6][0-9]{8}$/, "Numéro de téléphone invalide (format: 6XXXXXXXX)"),

  email: z
    .string()
    .email("Email invalide")
    .optional(),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .optional(),
});

/**
 * Customer Filter Schema
 */
export const customerFilterSchema = z.object({
  search: z.string().optional(), // Search by name, phone, email
  minOrders: z.number().int().nonnegative().optional(),
  minSpent: z.number().nonnegative().optional(),
  isLoyal: z.boolean().optional(), // Has password/account
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
});

/**
 * TypeScript Types
 */
export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerFilter = z.infer<typeof customerFilterSchema>;

/**
 * Customer type from Prisma
 */
export type Customer = PrismaCustomer;

/**
 * Customer with statistics
 */
export type CustomerWithStats = Customer & {
  _count?: {
    orders: number;
  };
  orders?: Array<{
    id: string;
    orderNumber: string;
    amount: number;
    paymentStatus: string;
    createdAt: Date;
  }>;
};

/**
 * Customer Statistics
 */
export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  accountAge: number; // Days since registration
  isLoyal: boolean;
  loyaltyTier: "new" | "regular" | "loyal" | "vip";
}
