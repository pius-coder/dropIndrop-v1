/**
 * Article Stock - Types
 */

import { z } from "zod";

/**
 * Stock adjustment schema
 */
export const stockAdjustmentSchema = z.object({
  quantity: z.number().int("La quantité doit être un nombre entier"),
  type: z.enum(["ADD", "REMOVE", "SET"]),
  reason: z.string().optional(),
});

export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;

/**
 * Stock adjustment types
 */
export type StockAdjustmentType = "ADD" | "REMOVE" | "SET";
