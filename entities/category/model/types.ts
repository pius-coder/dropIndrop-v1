/**
 * Category Entity - Types & Schema
 * 
 * Catalog organization with categories and subcategories
 */

import { z } from "zod";
import type { Category as PrismaCategory, Subcategory as PrismaSubcategory } from "@prisma/client";

/**
 * Create Category Schema
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),

  icon: z
    .string()
    .optional(),

  order: z
    .number()
    .int()
    .nonnegative()
    .default(0),
});

/**
 * Update Category Schema
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Create Subcategory Schema
 */
export const createSubcategorySchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),

  categoryId: z
    .string()
    .uuid("ID de catégorie invalide"),

  order: z
    .number()
    .int()
    .nonnegative()
    .default(0),
});

/**
 * Update Subcategory Schema
 */
export const updateSubcategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  categoryId: z.string().uuid().optional(),
  order: z.number().int().nonnegative().optional(),
});

/**
 * TypeScript Types
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;

/**
 * Category type from Prisma
 */
export type Category = PrismaCategory;
export type Subcategory = PrismaSubcategory;

/**
 * Category with subcategories
 */
export type CategoryWithSubcategories = Category & {
  subcategories: Subcategory[];
  _count?: {
    articles: number;
    subcategories: number;
  };
};

/**
 * Subcategory with parent category
 */
export type SubcategoryWithCategory = Subcategory & {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    articles: number;
  };
};

/**
 * Category tree node (for hierarchical display)
 */
export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  articleCount: number;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    order: number;
    articleCount: number;
  }>;
}
