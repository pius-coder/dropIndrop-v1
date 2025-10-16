/**
 * Article Entity - Types & Schema
 * 
 * Single source of truth for Article validation and types
 */

import { z } from "zod";
import type { Article as PrismaArticle } from "@prisma/client";

/**
 * Article Status Enum
 */
export const ArticleStatusEnum = z.enum(["AVAILABLE", "OUT_OF_STOCK", "ARCHIVED"]);
export type ArticleStatus = z.infer<typeof ArticleStatusEnum>;

/**
 * Create Article Input Schema
 * 
 * Validation for creating new articles
 */
export const createArticleSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .transform((val) => val.trim()),

  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères"),

  price: z
    .number()
    .positive("Le prix doit être positif")
    .refine((val) => val >= 100, {
      message: "Le prix minimum est 100 FCFA",
    }),

  stock: z
    .number()
    .int("Le stock doit être un nombre entier")
    .nonnegative("Le stock ne peut pas être négatif"),

  minStock: z
    .number()
    .int()
    .nonnegative()
    .default(5),

  categoryId: z.string().uuid("ID de catégorie invalide"),

  subcategoryId: z.string().uuid("ID de sous-catégorie invalide").optional(),

  images: z
    .array(z.string().url("Format d'URL d'image invalide"))
    .min(1, "Au moins une image est requise")
    .max(5, "Maximum 5 images autorisées"),

  videos: z
    .array(z.string().url("Format d'URL de vidéo invalide"))
    .max(1, "Maximum 1 vidéo autorisée")
    .default([]),

  status: ArticleStatusEnum.default("AVAILABLE"),
});

/**
 * Update Article Input Schema
 * 
 * All fields optional for partial updates
 */
export const updateArticleSchema = createArticleSchema.partial();

/**
 * Article Filter Schema
 */
export const articleFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  status: ArticleStatusEnum.optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  search: z.string().optional(),
});

/**
 * TypeScript Types
 */
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleFilter = z.infer<typeof articleFilterSchema>;

/**
 * Article type from Prisma
 * Re-export for convenience
 */
export type Article = PrismaArticle;

/**
 * Article with relations
 */
export type ArticleWithRelations = Article & {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};
