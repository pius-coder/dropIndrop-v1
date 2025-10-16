/**
 * Category API - Client-side methods
 *
 * Type-safe API calls for Category entity
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type {
  Category,
  Subcategory,
  CategoryWithSubcategories,
  SubcategoryWithCategory,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
  CategoryTreeNode,
} from "../model/types";

/**
 * Get all categories with subcategories
 */
export async function getCategories(): Promise<CategoryWithSubcategories[]> {
  return apiClient.get<CategoryWithSubcategories[]>("/categories");
}

/**
 * Get category tree (hierarchical structure)
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  return apiClient.get<CategoryTreeNode[]>("/categories/tree");
}

/**
 * Get single category by ID
 */
export async function getCategory(
  id: string
): Promise<CategoryWithSubcategories> {
  return apiClient.get<CategoryWithSubcategories>(`/categories/${id}`);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<CategoryWithSubcategories> {
  return apiClient.get<CategoryWithSubcategories>(`/categories/slug/${slug}`);
}

/**
 * Create category
 */
export async function createCategory(
  data: CreateCategoryInput
): Promise<Category> {
  return apiClient.post<Category>("/categories", data);
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryInput
): Promise<Category> {
  return apiClient.put<Category>(`/categories/${id}`, data);
}

/**
 * Delete category
 */
export async function deleteCategory(id: string): Promise<void> {
  return apiClient.delete<void>(`/categories/${id}`);
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  orders: Array<{ id: string; order: number }>
): Promise<void> {
  return apiClient.post<void>("/categories/reorder", { orders });
}

/**
 * Get all subcategories
 */
export async function getSubcategories(): Promise<SubcategoryWithCategory[]> {
  return apiClient.get<SubcategoryWithCategory[]>("/subcategories");
}

/**
 * Get single subcategory by ID
 */
export async function getSubcategory(
  id: string
): Promise<SubcategoryWithCategory> {
  return apiClient.get<SubcategoryWithCategory>(`/subcategories/${id}`);
}

/**
 * Create subcategory
 */
export async function createSubcategory(
  data: CreateSubcategoryInput
): Promise<Subcategory> {
  return apiClient.post<Subcategory>("/subcategories", data);
}

/**
 * Update subcategory
 */
export async function updateSubcategory(
  id: string,
  data: UpdateSubcategoryInput
): Promise<Subcategory> {
  return apiClient.put<Subcategory>(`/subcategories/${id}`, data);
}

/**
 * Delete subcategory
 */
export async function deleteSubcategory(id: string): Promise<void> {
  return apiClient.delete<void>(`/subcategories/${id}`);
}
