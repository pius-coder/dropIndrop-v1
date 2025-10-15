/**
 * Article Stock - React Query Mutation Hook
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustStock } from "../api/article-stock-api";
import type { StockAdjustment } from "../model/types";

/**
 * Hook to adjust article stock
 */
export function useAdjustStock(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adjustment: StockAdjustment) =>
      adjustStock(articleId, adjustment),
    onSuccess: (article) => {
      // Update article cache
      queryClient.setQueryData(["articles", articleId], article);
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
