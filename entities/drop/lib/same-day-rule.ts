/**
 * Same-Day Rule Implementation
 * 
 * CRITICAL BUSINESS RULE:
 * An article CANNOT be sent to the same WhatsApp group more than once per day,
 * even if it's in different drops.
 * 
 * This prevents spam and ensures good user experience.
 */

import { startOfDay, endOfDay } from "@/shared/lib";
import type { SameDayValidation } from "../model/types";

/**
 * Database interface for drop history queries
 * (To be implemented with Prisma on server)
 */
export interface DropHistoryQuery {
  findMany: (params: {
    where: {
      articleId?: string;
      whatsappGroupId?: string;
      sentAt?: {
        gte?: Date;
        lte?: Date;
      };
    };
  }) => Promise<Array<{
    id: string;
    articleId: string;
    whatsappGroupId: string;
    sentAt: Date;
  }>>;
}

/**
 * Check if an article was sent to a group on a specific date
 * 
 * @param db Database client with drop history access
 * @param articleId Article ID to check
 * @param groupId WhatsApp group ID
 * @param date Date to check (defaults to today)
 * @returns true if article was already sent today
 */
export async function wasArticleSentToGroupToday(
  db: DropHistoryQuery,
  articleId: string,
  groupId: string,
  date: Date = new Date(),
): Promise<boolean> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existingSends = await db.findMany({
    where: {
      articleId,
      whatsappGroupId: groupId,
      sentAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  return existingSends.length > 0;
}

/**
 * Get articles that were already sent to a group today
 * 
 * @param db Database client
 * @param articleIds Array of article IDs to check
 * @param groupId WhatsApp group ID
 * @param date Date to check (defaults to today)
 * @returns Array of article IDs that were already sent
 */
export async function getArticlesSentToGroupToday(
  db: DropHistoryQuery,
  articleIds: string[],
  groupId: string,
  date: Date = new Date(),
): Promise<string[]> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existingSends = await db.findMany({
    where: {
      whatsappGroupId: groupId,
      sentAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  // Filter to only articleIds we're checking
  const sentArticleIds = existingSends
    .map((send) => send.articleId)
    .filter((id) => articleIds.includes(id));

  // Return unique IDs
  return [...new Set(sentArticleIds)];
}

/**
 * Filter articles that can be sent to each group today
 * 
 * Returns a map of groupId → allowed article IDs
 * 
 * @param db Database client
 * @param articleIds Array of article IDs to check
 * @param groupIds Array of WhatsApp group IDs
 * @param date Date to check (defaults to today)
 * @returns Map of groupId to allowed article IDs
 */
export async function filterArticlesForToday(
  db: DropHistoryQuery,
  articleIds: string[],
  groupIds: string[],
  date: Date = new Date(),
): Promise<Map<string, string[]>> {
  const allowedArticlesMap = new Map<string, string[]>();

  for (const groupId of groupIds) {
    const blockedArticles = await getArticlesSentToGroupToday(
      db,
      articleIds,
      groupId,
      date,
    );

    const allowedArticles = articleIds.filter(
      (id) => !blockedArticles.includes(id),
    );

    allowedArticlesMap.set(groupId, allowedArticles);
  }

  return allowedArticlesMap;
}

/**
 * Validate drop against same-day rule
 * 
 * Checks all articles against all groups for today
 * Returns detailed validation result with warnings
 * 
 * @param db Database client
 * @param articleIds Array of article IDs in drop
 * @param groups Array of groups with their details
 * @param date Date to check (defaults to today)
 * @returns Validation result with per-group details
 */
export async function validateDropSameDayRule(
  db: DropHistoryQuery,
  articleIds: string[],
  groups: Array<{ id: string; name: string }>,
  date: Date = new Date(),
): Promise<SameDayValidation[]> {
  const validations: SameDayValidation[] = [];

  for (const group of groups) {
    const blockedArticles = await getArticlesSentToGroupToday(
      db,
      articleIds,
      group.id,
      date,
    );

    const allowedArticles = articleIds.filter(
      (id) => !blockedArticles.includes(id),
    );

    const warnings: string[] = [];

    if (blockedArticles.length > 0) {
      warnings.push(
        `⚠️ ${blockedArticles.length} article(s) déjà envoyé(s) à "${group.name}" aujourd'hui`,
      );
    }

    if (allowedArticles.length === 0) {
      warnings.push(
        `🚫 BLOQUÉ: Tous les articles ont déjà été envoyés à "${group.name}" aujourd'hui`,
      );
    }

    validations.push({
      groupId: group.id,
      groupName: group.name,
      allowedArticleIds: allowedArticles,
      blockedArticleIds: blockedArticles,
      warnings,
    });
  }

  return validations;
}

/**
 * Check if a drop can be sent today
 * 
 * A drop can be sent if at least one group has at least one allowed article
 * 
 * @param validations Array of per-group validations
 * @returns true if drop can be sent
 */
export function canSendDropWithSameDayRule(
  validations: SameDayValidation[],
): boolean {
  return validations.some(
    (validation) => validation.allowedArticleIds.length > 0,
  );
}

/**
 * Get all warnings from validations
 */
export function getAllWarnings(validations: SameDayValidation[]): string[] {
  return validations.flatMap((v) => v.warnings);
}

/**
 * Get summary of validation results
 */
export function getValidationSummary(validations: SameDayValidation[]): {
  totalGroups: number;
  blockedGroups: number;
  partiallyBlockedGroups: number;
  clearGroups: number;
  totalWarnings: number;
} {
  const totalGroups = validations.length;
  const blockedGroups = validations.filter(
    (v) => v.allowedArticleIds.length === 0,
  ).length;
  const partiallyBlockedGroups = validations.filter(
    (v) =>
      v.allowedArticleIds.length > 0 && v.blockedArticleIds.length > 0,
  ).length;
  const clearGroups = validations.filter(
    (v) => v.blockedArticleIds.length === 0,
  ).length;
  const totalWarnings = validations.reduce(
    (sum, v) => sum + v.warnings.length,
    0,
  );

  return {
    totalGroups,
    blockedGroups,
    partiallyBlockedGroups,
    clearGroups,
    totalWarnings,
  };
}
