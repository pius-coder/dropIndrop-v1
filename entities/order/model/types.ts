/**
 * Order Entity - Types & Schema
 * 
 * Handles payment flow, ticket generation, and pickup validation
 */

import { z } from "zod";
import type { Order as PrismaOrder } from "@prisma/client";

/**
 * Payment Status Enum
 */
export const PaymentStatusEnum = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

/**
 * Payment Method Enum
 */
export const PaymentMethodEnum = z.enum(["MTN_MOMO", "ORANGE_MONEY"]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

/**
 * Pickup Status Enum
 */
export const PickupStatusEnum = z.enum(["PENDING", "PICKED_UP", "CANCELLED"]);
export type PickupStatus = z.infer<typeof PickupStatusEnum>;

/**
 * Create Order Input Schema
 * 
 * Customer creates order
 */
export const createOrderSchema = z.object({
  articleId: z.string().uuid("ID d'article invalide"),

  // Customer info
  customerName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  customerPhone: z
    .string()
    .regex(/^(\+237)?[6][0-9]{8}$/, "Numéro de téléphone invalide (format: 6XXXXXXXX)"),

  customerEmail: z
    .string()
    .email("Email invalide")
    .optional(),

  paymentMethod: PaymentMethodEnum,
});

/**
 * Validate Ticket Schema
 */
export const validateTicketSchema = z.object({
  ticketCode: z
    .string()
    .regex(/^TKT-\d{8}-\d{4}$/, "Code ticket invalide (format: TKT-YYYYMMDD-XXXX)"),
});

/**
 * Order Filter Schema
 */
export const orderFilterSchema = z.object({
  customerId: z.string().uuid().optional(),
  articleId: z.string().uuid().optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  pickupStatus: PickupStatusEnum.optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  search: z.string().optional(), // Search by order number, customer name, ticket code
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
});

/**
 * TypeScript Types
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
export type OrderFilter = z.infer<typeof orderFilterSchema>;

/**
 * Order type from Prisma
 */
export type Order = PrismaOrder;

/**
 * Order with relations
 */
export type OrderWithRelations = Order & {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  article: {
    id: string;
    code: string;
    name: string;
    price: number;
    images: string[];
  };
  validator?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

/**
 * Ticket Data for QR Code
 */
export interface TicketData {
  ticketCode: string;
  orderId: string;
  orderNumber: string;
  customerPhone: string;
  articleName: string;
  amount: number;
  expiresAt: Date;
}
