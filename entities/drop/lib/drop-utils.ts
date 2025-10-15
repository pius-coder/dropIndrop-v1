/**
 * Drop Utilities - Pure Functions
 */

import type { Drop, DropStatus } from "../model/types";

/**
 * Check if drop is editable
 * Only DRAFT and SCHEDULED drops can be edited
 */
export function isDropEditable(drop: Pick<Drop, "status">): boolean {
  return drop.status === "DRAFT" || drop.status === "SCHEDULED";
}

/**
 * Check if drop can be sent
 */
export function canSendDrop(drop: Pick<Drop, "status">): boolean {
  return drop.status === "DRAFT" || drop.status === "SCHEDULED";
}

/**
 * Check if drop is in progress
 */
export function isDropInProgress(drop: Pick<Drop, "status">): boolean {
  return drop.status === "SENDING";
}

/**
 * Check if drop is completed
 */
export function isDropCompleted(drop: Pick<Drop, "status">): boolean {
  return drop.status === "SENT";
}

/**
 * Check if drop has failed
 */
export function hasDropFailed(drop: Pick<Drop, "status">): boolean {
  return drop.status === "FAILED";
}

/**
 * Get drop status display text
 */
export function getDropStatusText(status: DropStatus): string {
  switch (status) {
    case "DRAFT":
      return "Brouillon";
    case "SCHEDULED":
      return "Programmé";
    case "SENDING":
      return "En cours d'envoi";
    case "SENT":
      return "Envoyé";
    case "FAILED":
      return "Échoué";
  }
}

/**
 * Get drop status color class (Tailwind)
 */
export function getDropStatusColor(status: DropStatus): string {
  switch (status) {
    case "DRAFT":
      return "bg-gray-500";
    case "SCHEDULED":
      return "bg-blue-500";
    case "SENDING":
      return "bg-yellow-500";
    case "SENT":
      return "bg-green-500";
    case "FAILED":
      return "bg-red-500";
  }
}

/**
 * Check if drop is scheduled for future
 */
export function isScheduledForFuture(drop: {
  scheduledFor?: Date | null;
}): boolean {
  if (!drop.scheduledFor) return false;
  return drop.scheduledFor.getTime() > Date.now();
}

/**
 * Check if drop is overdue
 * (scheduled for past but not sent)
 */
export function isDropOverdue(drop: {
  scheduledFor?: Date | null;
  status: DropStatus;
}): boolean {
  if (!drop.scheduledFor) return false;
  if (drop.status === "SENT") return false;
  return drop.scheduledFor.getTime() < Date.now();
}

/**
 * Calculate drop statistics
 */
export function calculateDropStats(drop: Pick<Drop, "totalArticlesSent" | "totalGroupsSent">): {
  articlesPerGroup: number;
  totalSends: number;
} {
  const totalSends = drop.totalArticlesSent * drop.totalGroupsSent;
  const articlesPerGroup =
    drop.totalGroupsSent > 0
      ? drop.totalArticlesSent / drop.totalGroupsSent
      : 0;

  return {
    articlesPerGroup: Math.round(articlesPerGroup * 10) / 10,
    totalSends,
  };
}

/**
 * Validate drop before sending
 */
export function validateDropBeforeSend(drop: {
  status: DropStatus;
  scheduledFor?: Date | null;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!canSendDrop(drop)) {
    errors.push(`Le drop ne peut pas être envoyé (statut: ${drop.status})`);
  }

  if (drop.scheduledFor && isScheduledForFuture(drop)) {
    errors.push("Le drop est programmé pour le futur");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
