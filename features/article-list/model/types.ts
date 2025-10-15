/**
 * Article List - Types & Schemas
 * 
 * Type definitions for article listing feature
 */

import { z } from "zod";
import type { Article } from "@/entities/article";

/**
 * Article list filters
 */
export const articleListFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.enum(["name", "price", "createdAt", "stock"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type ArticleListFilters = z.infer<typeof articleListFiltersSchema>;

/**
 * Pagination params
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Article list query params (filters + pagination)
 */
export const articleListQuerySchema = articleListFiltersSchema.merge(paginationSchema);

export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;

/**
 * Article list response
 */
export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Article list view mode
 */
export type ArticleViewMode = "grid" | "list";
