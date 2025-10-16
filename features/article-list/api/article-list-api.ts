/**
 * Article List - API Methods
 *
 * API calls for article listing
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { ArticleListQuery, ArticleListResponse } from "../model/types";

/**
 * Get articles with filters and pagination
 */
export async function getArticles(
  query: Partial<ArticleListQuery> = {}
): Promise<ArticleListResponse> {
  const params = new URLSearchParams();

  // Add filters
  if (query.search) params.append("search", query.search);
  if (query.categoryId) params.append("categoryId", query.categoryId);
  if (query.status) params.append("status", query.status);
  if (query.minPrice) params.append("minPrice", query.minPrice.toString());
  if (query.maxPrice) params.append("maxPrice", query.maxPrice.toString());
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.sortOrder) params.append("sortOrder", query.sortOrder);

  // Add pagination
  params.append("page", (query.page || 1).toString());
  params.append("limit", (query.limit || 20).toString());

  return apiClient.get<ArticleListResponse>(`/articles?${params.toString()}`);
}

/**
 * Search articles by name
 */
export async function searchArticles(
  search: string,
  limit: number = 10
): Promise<ArticleListResponse> {
  return getArticles({ search, limit, page: 1 });
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  categoryId: string,
  page: number = 1
): Promise<ArticleListResponse> {
  return getArticles({ categoryId, page });
}
