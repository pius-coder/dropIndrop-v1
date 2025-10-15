/**
 * Article List - React Query Hook
 * 
 * Custom hook for fetching articles with filters
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getArticles } from "../api/article-list-api";
import type { ArticleListQuery } from "../model/types";

/**
 * Hook to fetch articles with filters
 */
export function useArticles(query: Partial<ArticleListQuery> = {}) {
  return useQuery({
    queryKey: ["articles", query],
    queryFn: () => getArticles(query),
    staleTime: 60 * 1000, // 1 minute
    // Keep previous data while fetching new
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to search articles
 */
export function useArticleSearch(search: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["articles", "search", search],
    queryFn: () => getArticles({ search, limit: 10 }),
    enabled: enabled && search.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get articles by category
 */
export function useArticlesByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["articles", "category", categoryId],
    queryFn: () => getArticles({ categoryId }),
    enabled: !!categoryId,
    staleTime: 60 * 1000,
  });
}
