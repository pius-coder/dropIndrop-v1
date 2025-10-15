/**
 * Article API - Client-side methods
 * 
 * Type-safe API calls for Article entity
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type {
  Article,
  ArticleWithRelations,
  CreateArticleInput,
  UpdateArticleInput,
  ArticleFilter,
} from "../model/types";

/**
 * Get list of articles with optional filters
 */
export async function getArticles(
  filters?: ArticleFilter,
): Promise<ArticleWithRelations[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.subcategoryId) params.append("subcategoryId", filters.subcategoryId);
    if (filters.status) params.append("status", filters.status);
    if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
    if (filters.inStock !== undefined) params.append("inStock", filters.inStock.toString());
    if (filters.search) params.append("search", filters.search);
  }

  const url = `/api/articles${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<ArticleWithRelations[]>(url);
}

/**
 * Get single article by ID
 */
export async function getArticle(id: string): Promise<ArticleWithRelations> {
  return apiClient.get<ArticleWithRelations>(`/api/articles/${id}`);
}

/**
 * Get article by slug (public view)
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations> {
  return apiClient.get<ArticleWithRelations>(`/api/articles/slug/${slug}`);
}

/**
 * Create new article
 */
export async function createArticle(data: CreateArticleInput): Promise<Article> {
  return apiClient.post<Article>("/api/articles", data);
}

/**
 * Update article
 */
export async function updateArticle(
  id: string,
  data: UpdateArticleInput,
): Promise<Article> {
  return apiClient.put<Article>(`/api/articles/${id}`, data);
}

/**
 * Delete article
 */
export async function deleteArticle(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/articles/${id}`);
}

/**
 * Update article stock
 */
export async function updateArticleStock(
  id: string,
  change: number,
): Promise<Article> {
  return apiClient.patch<Article>(`/api/articles/${id}/stock`, { change });
}

/**
 * Increment article views
 */
export async function incrementArticleViews(id: string): Promise<void> {
  return apiClient.post<void>(`/api/articles/${id}/views`, {});
}

/**
 * Increment article buy clicks
 */
export async function incrementClicksToBuy(id: string): Promise<void> {
  return apiClient.post<void>(`/api/articles/${id}/clicks`, {});
}

/**
 * Archive article
 */
export async function archiveArticle(id: string): Promise<Article> {
  return apiClient.patch<Article>(`/api/articles/${id}/archive`, {});
}

/**
 * Restore archived article
 */
export async function restoreArticle(id: string): Promise<Article> {
  return apiClient.patch<Article>(`/api/articles/${id}/restore`, {});
}
