/**
 * Article Update - React Query Hooks
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateArticle, getArticleById } from "../api/article-update-api";
import type { UpdateArticleInput } from "../model/types";

/**
 * Hook to get article for editing
 */
export function useArticle(id: string) {
  return useQuery({
    queryKey: ["articles", id],
    queryFn: () => getArticleById(id),
    enabled: !!id,
  });
}

/**
 * Hook to update article
 */
export function useUpdateArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateArticleInput) => updateArticle(id, data),
    onSuccess: (article) => {
      // Update cache for single article
      queryClient.setQueryData(["articles", id], article);
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
