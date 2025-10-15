/**
 * Article Delete - React Query Mutation Hook
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteArticle } from "../api/article-delete-api";

/**
 * Hook to delete article
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
