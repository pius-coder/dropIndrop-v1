/**
 * Article Update - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { UpdateArticleInput } from "../model/types";
import type { Article } from "@/entities/article";

/**
 * Update existing article
 */
export async function updateArticle(
  id: string,
  data: UpdateArticleInput
): Promise<Article> {
  return apiClient.put<Article>(`/api/articles/${id}`, data);
}

/**
 * Get article by ID for editing
 */
export async function getArticleById(id: string): Promise<Article> {
  return apiClient.get<Article>(`/api/articles/${id}`);
}
