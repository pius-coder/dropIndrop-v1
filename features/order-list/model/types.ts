/**
 * Order List - Types
 */

import { z } from "zod";
import type { Order } from "@/entities/order";

/**
 * Order list filters
 */
export const orderListFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "READY", "COMPLETED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  sortBy: z.enum(["createdAt", "ticketNumber", "totalPrice"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type OrderListFilters = z.infer<typeof orderListFiltersSchema>;

/**
 * Order list response
 */
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
