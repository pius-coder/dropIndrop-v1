/**
 * Public Article API
 * Fetches article data for public viewing
 */

import type { ArticleWithRelations } from "@/entities/article";

/**
 * Get public article by unique slug
 */
export async function getPublicArticle(uniqueSlug: string): Promise<ArticleWithRelations> {
  const response = await fetch(`/api/articles/public/${uniqueSlug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Article not found");
    }
    throw new Error("Failed to fetch article");
  }

  return response.json();
}
