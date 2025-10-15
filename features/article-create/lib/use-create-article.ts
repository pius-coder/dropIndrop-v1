/**
 * Article Create - React Query Mutation Hook
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createArticle } from "../api/article-create-api";
import type { CreateArticleInput } from "../model/types";

/**
 * Hook to create article with mutation
 */
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      // Invalidate articles list to refetch
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
