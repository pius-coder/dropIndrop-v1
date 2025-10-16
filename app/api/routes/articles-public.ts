/**
 * Public Articles API Route
 * Provides public access to article data
 */

import { Hono } from "hono";
import { prisma } from "@/lib/db";

const app = new Hono();

/**
 * Get public article by unique slug
 */
app.get("/public/:uniqueSlug", async (c) => {
  try {
    const { uniqueSlug } = c.req.param();

    const article = await prisma.article.findUnique({
      where: { uniqueSlug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!article) {
      return c.json({ error: "Article not found" }, 404);
    }

    // Check if article is available
    if (article.status !== "AVAILABLE") {
      return c.json({ error: "Article not available" }, 404);
    }

    // Track analytics (view)
    await prisma.articleAnalytics.create({
      data: {
        articleId: article.id,
        viewSource: "public_page",
      },
    });

    return c.json(article);
  } catch (error) {
    console.error("Error fetching public article:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
