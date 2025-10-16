/**
 * Purchase API Route
 * Handles purchase-related operations for customers
 */

import { Hono } from "hono";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const app = new Hono();

/**
 * Get article data for purchase confirmation (requires authentication)
 */
app.get("/article/:articleId", async (c) => {
  try {
    const { articleId } = c.req.param();

    // Verify authentication
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    ) as any;

    if (payload.type !== "customer") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: payload.customerId },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // Get article
    const article = await prisma.article.findUnique({
      where: { id: articleId },
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

    // Check if article has stock
    if (article.stock <= 0) {
      return c.json({ error: "Article out of stock" }, 404);
    }

    return c.json({
      article,
      customer,
    });
  } catch (error) {
    console.error("Error fetching article for purchase:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
