/**
 * Article Create - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { CreateArticleInput } from "../model/types";
import type { Article } from "@/entities/article";

/**
 * Create new article
 */
export async function createArticle(
  data: CreateArticleInput
): Promise<Article> {
  return apiClient.post<Article>("/api/articles", data);
}
