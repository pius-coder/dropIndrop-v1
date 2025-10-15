/**
 * Article Stock - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { StockAdjustment } from "../model/types";
import type { Article } from "@/entities/article";

/**
 * Adjust article stock
 */
export async function adjustStock(
  articleId: string,
  adjustment: StockAdjustment
): Promise<Article> {
  return apiClient.patch<Article>(
    `/api/articles/${articleId}/stock`,
    adjustment
  );
}
