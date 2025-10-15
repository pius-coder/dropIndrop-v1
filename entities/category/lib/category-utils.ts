/**
 * Category Utilities
 * 
 * Category tree navigation and helpers
 */

import { slugify } from "@/shared/lib";
import type { Category, Subcategory, CategoryTreeNode, CategoryWithSubcategories } from "../model/types";

/**
 * Generate category slug from name
 */
export function generateCategorySlug(name: string): string {
  return slugify(name);
}

/**
 * Build category tree from flat data
 */
export function buildCategoryTree(
  categories: CategoryWithSubcategories[],
): CategoryTreeNode[] {
  return categories
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      order: category.order,
      articleCount: category._count?.articles || 0,
      subcategories: category.subcategories
        .sort((a, b) => a.order - b.order)
        .map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          order: sub.order,
          articleCount: 0, // Will be populated from DB if needed
        })),
    }));
}

/**
 * Find category by slug
 */
export function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

/**
 * Find subcategory by slug
 */
export function findSubcategoryBySlug(
  subcategories: Subcategory[],
  slug: string,
): Subcategory | undefined {
  return subcategories.find((sub) => sub.slug === slug);
}

/**
 * Get all subcategories for a category
 */
export function getSubcategoriesForCategory(
  category: CategoryWithSubcategories,
): Subcategory[] {
  return category.subcategories.sort((a, b) => a.order - b.order);
}

/**
 * Count total articles in category (including subcategories)
 */
export function getTotalArticleCount(category: CategoryWithSubcategories): number {
  return category._count?.articles || 0;
}

/**
 * Check if category has subcategories
 */
export function hasSubcategories(category: CategoryWithSubcategories): boolean {
  return category.subcategories.length > 0;
}

/**
 * Get category breadcrumb
 */
export function getCategoryBreadcrumb(
  category: Category,
  subcategory?: Subcategory,
): Array<{ name: string; slug: string }> {
  const breadcrumb: Array<{ name: string; slug: string }> = [
    { name: category.name, slug: category.slug },
  ];

  if (subcategory) {
    breadcrumb.push({ name: subcategory.name, slug: subcategory.slug });
  }

  return breadcrumb;
}

/**
 * Validate category order
 * Ensures no duplicate orders
 */
export function validateCategoryOrder(
  categories: Category[],
  newOrder: number,
  excludeId?: string,
): { valid: boolean; error?: string } {
  const filtered = excludeId
    ? categories.filter((c) => c.id !== excludeId)
    : categories;

  const hasDuplicate = filtered.some((c) => c.order === newOrder);

  if (hasDuplicate) {
    return {
      valid: false,
      error: "Un autre catégorie utilise déjà cet ordre",
    };
  }

  return { valid: true };
}

/**
 * Suggest next order number
 */
export function suggestNextOrder(categories: Category[]): number {
  if (categories.length === 0) return 0;
  
  const maxOrder = Math.max(...categories.map((c) => c.order));
  return maxOrder + 1;
}

/**
 * Reorder categories
 * Updates order of all categories to be sequential
 */
export function reorderCategories(
  categories: Category[],
): Array<{ id: string; order: number }> {
  return categories
    .sort((a, b) => a.order - b.order)
    .map((category, index) => ({
      id: category.id,
      order: index,
    }));
}
