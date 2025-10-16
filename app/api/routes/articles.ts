/**
 * Articles Routes
 * 
 * Following Hono best practices: inline handlers for type inference
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { createArticleSchema, updateArticleSchema } from "@/entities/article/model/types";
import { articleListQuerySchema } from "@/features/article-list/model/types";
import { stockAdjustmentSchema } from "@/features/article-stock/model/types";
import { generateArticleCode, generateArticleSlug } from "@/entities/article/lib/article-utils";

const app = new Hono();

app.get("/", zValidator("query", articleListQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const {
    search,
    categoryId,
    status,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const skip = (page - 1) * limit;
  const where: Prisma.ArticleWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status as Prisma.ArticleWhereInput["status"];
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { category: true, subcategory: true },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return c.json({
    articles,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  });
});

app.post("/", zValidator("json", createArticleSchema), async (c) => {
  const data = c.req.valid("json");
  const code = generateArticleCode();
  const uniqueSlug = generateArticleSlug(data.name);

  const article = await prisma.article.create({
    data: {
      ...data,
      code,
      uniqueSlug,
      status: data.stock > 0 ? "AVAILABLE" : "OUT_OF_STOCK",
    },
    include: { category: true, subcategory: true },
  });

  return c.json(article, 201);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const article = await prisma.article.findUnique({
    where: { id },
    include: { category: true, subcategory: true },
  });

  if (!article) {
    return c.json({ error: "Not Found", message: "Article introuvable" }, 404);
  }

  return c.json(article);
});

app.put("/:id", zValidator("json", updateArticleSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const existing = await prisma.article.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: "Not Found", message: "Article introuvable" }, 404);
  }

  const updateFields: Prisma.ArticleUpdateInput = { ...data };
  
  if (data.name && data.name !== existing.name) {
    updateFields.uniqueSlug = generateArticleSlug(data.name);
  }
  if (data.stock !== undefined) {
    updateFields.status = data.stock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
  }

  const article = await prisma.article.update({
    where: { id },
    data: updateFields,
    include: { category: true, subcategory: true },
  });

  return c.json(article);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    return c.json({ error: "Not Found", message: "Article introuvable" }, 404);
  }

  await prisma.article.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return c.json({ success: true, message: "Article archivé" });
});

app.patch("/:id/stock", zValidator("json", stockAdjustmentSchema), async (c) => {
  const id = c.req.param("id");
  const { type, quantity } = c.req.valid("json");

  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    return c.json({ error: "Not Found", message: "Article introuvable" }, 404);
  }

  let newStock: number;
  switch (type) {
    case "ADD":
      newStock = article.stock + quantity;
      break;
    case "REMOVE":
      newStock = Math.max(0, article.stock - quantity);
      break;
    case "SET":
      newStock = quantity;
      break;
    default:
      return c.json({ error: "Invalid Operation", message: "Opération invalide" }, 400);
  }

  const status = newStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";

  const updated = await prisma.article.update({
    where: { id },
    data: { stock: newStock, status },
    include: { category: true, subcategory: true },
  });

  return c.json(updated);
});

export default app;
