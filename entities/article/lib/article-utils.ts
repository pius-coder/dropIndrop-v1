/**
 * Article Utilities - Pure Functions
 * 
 * Business logic without side effects (easy to test)
 */

import { slugify } from "@/shared/lib";
import type { Article } from "../model/types";

/**
 * Generate unique article code
 * Format: ART-YYYYMMDD-XXXX
 */
export function generateArticleCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  return `ART-${year}${month}${day}-${random}`;
}

/**
 * Generate URL-friendly slug from article name
 */
export function generateArticleSlug(name: string): string {
  const baseSlug = slugify(name);
  const timestamp = Date.now().toString(36); // Base36 for shorter string
  return `${baseSlug}-${timestamp}`;
}

/**
 * Check if article is low on stock
 */
export function isLowStock(article: Pick<Article, "stock" | "minStock">): boolean {
  return article.stock < article.minStock;
}

/**
 * Check if article is out of stock
 */
export function isOutOfStock(article: Pick<Article, "stock">): boolean {
  return article.stock === 0;
}

/**
 * Calculate stock percentage
 * Returns percentage of current stock vs minStock
 */
export function getStockPercentage(
  article: Pick<Article, "stock" | "minStock">,
): number {
  if (article.minStock === 0) return 100;
  return Math.min(100, (article.stock / article.minStock) * 100);
}

/**
 * Get stock status label
 */
export function getStockStatus(
  article: Pick<Article, "stock" | "minStock">,
): "out_of_stock" | "low_stock" | "in_stock" {
  if (isOutOfStock(article)) return "out_of_stock";
  if (isLowStock(article)) return "low_stock";
  return "in_stock";
}

/**
 * Get stock status display text
 */
export function getStockStatusText(
  article: Pick<Article, "stock" | "minStock">,
): string {
  const status = getStockStatus(article);
  switch (status) {
    case "out_of_stock":
      return "Rupture de stock";
    case "low_stock":
      return "Stock faible";
    case "in_stock":
      return "En stock";
  }
}

/**
 * Validate stock change
 * Returns true if the change is valid
 */
export function canUpdateStock(
  currentStock: number,
  change: number,
): { valid: boolean; error?: string } {
  const newStock = currentStock + change;

  if (newStock < 0) {
    return {
      valid: false,
      error: "Le stock ne peut pas être négatif",
    };
  }

  return { valid: true };
}

/**
 * Get primary image URL
 */
export function getPrimaryImage(article: Pick<Article, "images">): string | null {
  return article.images[0] || null;
}

/**
 * Check if article has video
 */
export function hasVideo(article: Pick<Article, "videos">): boolean {
  return article.videos.length > 0;
}

/**
 * Get video URL if exists
 */
export function getVideoUrl(article: Pick<Article, "videos">): string | null {
  return article.videos[0] || null;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  originalPrice: number,
  discountedPrice: number,
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
