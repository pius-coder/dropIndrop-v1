/**
 * Article Business Rules
 * 
 * Domain-specific validation and business logic
 */

import type { Article } from "../model/types";
import { isOutOfStock } from "./article-utils";

/**
 * Check if article can be added to a drop
 */
export function canAddToDrop(
  article: Pick<Article, "stock" | "status">,
): { allowed: boolean; reason?: string } {
  // Must be available
  if (article.status !== "AVAILABLE") {
    return {
      allowed: false,
      reason: "L'article n'est pas disponible",
    };
  }

  // Must have stock
  if (isOutOfStock(article)) {
    return {
      allowed: false,
      reason: "L'article est en rupture de stock",
    };
  }

  return { allowed: true };
}

/**
 * Check if article can be ordered
 */
export function canBeOrdered(
  article: Pick<Article, "stock" | "status">,
  quantity = 1,
): { allowed: boolean; reason?: string } {
  // Must be available
  if (article.status !== "AVAILABLE") {
    return {
      allowed: false,
      reason: "L'article n'est pas disponible",
    };
  }

  // Must have enough stock
  if (article.stock < quantity) {
    return {
      allowed: false,
      reason: `Stock insuffisant (disponible: ${article.stock})`,
    };
  }

  return { allowed: true };
}

/**
 * Validate price change
 */
export function validatePriceChange(
  oldPrice: number,
  newPrice: number,
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Price decreased by more than 50%
  const decreasePercent = ((oldPrice - newPrice) / oldPrice) * 100;
  if (decreasePercent > 50) {
    warnings.push(`Prix réduit de ${decreasePercent.toFixed(0)}% - vérifier si correct`);
  }

  // Price increased by more than 100%
  const increasePercent = ((newPrice - oldPrice) / oldPrice) * 100;
  if (increasePercent > 100) {
    warnings.push(`Prix augmenté de ${increasePercent.toFixed(0)}% - vérifier si correct`);
  }

  return {
    valid: true,
    warnings,
  };
}

/**
 * Check if article should be archived
 */
export function shouldArchive(article: Article): { should: boolean; reason?: string } {
  // Out of stock for too long (no views in 30 days)
  const daysSinceUpdate = Math.floor(
    (Date.now() - article.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (article.status === "OUT_OF_STOCK" && daysSinceUpdate > 30) {
    return {
      should: true,
      reason: "En rupture de stock depuis plus de 30 jours",
    };
  }

  // No views in 60 days
  if (article.views === 0 && daysSinceUpdate > 60) {
    return {
      should: true,
      reason: "Aucune vue depuis 60 jours",
    };
  }

  return { should: false };
}
