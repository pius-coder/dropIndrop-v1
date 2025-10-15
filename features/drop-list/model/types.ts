/**
 * Drop List - Types
 */

import { z } from "zod";
import type { Drop } from "@/entities/drop";

/**
 * Drop list filters
 */
export const dropListFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "FAILED"]).optional(),
  sortBy: z.enum(["createdAt", "scheduledFor", "sentAt", "name"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type DropListFilters = z.infer<typeof dropListFiltersSchema>;

/**
 * Drop list response
 */
export interface DropListResponse {
  drops: Drop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
