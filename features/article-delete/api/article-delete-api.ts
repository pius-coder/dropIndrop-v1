/**
 * Article Delete - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";

/**
 * Delete article by ID
 */
export async function deleteArticle(id: string): Promise<void> {
  return apiClient.delete(`/articles/${id}`);
}
