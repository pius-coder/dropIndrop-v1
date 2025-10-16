/**
 * Public Article Hook
 * Fetches article data for public viewing
 */

import { useQuery } from "@tanstack/react-query";
import { getPublicArticle } from "../api/article-public-api";

export function usePublicArticle(uniqueSlug: string) {
  return useQuery({
    queryKey: ["public-article", uniqueSlug],
    queryFn: () => getPublicArticle(uniqueSlug),
    enabled: !!uniqueSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
