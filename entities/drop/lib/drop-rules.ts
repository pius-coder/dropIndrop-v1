/**
 * Drop Business Rules
 * 
 * Domain-specific validation beyond same-day rule
 */

import type { CreateDropInput } from "../model/types";

/**
 * Validate drop input data
 */
export function validateDropInput(input: CreateDropInput): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check article count
  if (input.articleIds.length > 10) {
    warnings.push(
      `${input.articleIds.length} articles - drop complexe, envisager de diviser`,
    );
  }

  // Check group count
  if (input.whatsappGroupIds.length > 5) {
    warnings.push(
      `${input.whatsappGroupIds.length} groupes - temps d'envoi prolongé`,
    );
  }

  // Check scheduled date
  if (input.scheduledFor) {
    const now = new Date();
    const hoursUntil =
      (input.scheduledFor.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 1) {
      warnings.push("Programmé dans moins d'1 heure");
    }

    if (hoursUntil > 24 * 7) {
      warnings.push("Programmé dans plus de 7 jours");
    }
  }

  // Check for duplicate article IDs
  const uniqueArticles = new Set(input.articleIds);
  if (uniqueArticles.size !== input.articleIds.length) {
    errors.push("Articles en double détectés");
  }

  // Check for duplicate group IDs
  const uniqueGroups = new Set(input.whatsappGroupIds);
  if (uniqueGroups.size !== input.whatsappGroupIds.length) {
    errors.push("Groupes en double détectés");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Estimate drop sending time
 * 
 * @param articleCount Number of articles
 * @param groupCount Number of groups
 * @returns Estimated time in minutes
 */
export function estimateSendingTime(
  articleCount: number,
  groupCount: number,
): number {
  // Assume 2 seconds per message + 1 second buffer between messages
  const secondsPerMessage = 3;
  const totalMessages = articleCount * groupCount;
  const totalSeconds = totalMessages * secondsPerMessage;

  return Math.ceil(totalSeconds / 60); // Return minutes
}

/**
 * Get best time to send drops
 * 
 * Recommends optimal sending times based on user engagement patterns
 */
export function getBestSendingTimes(): Array<{
  time: string;
  label: string;
  engagement: "high" | "medium" | "low";
}> {
  return [
    { time: "09:00", label: "Matin (9h)", engagement: "high" },
    { time: "12:00", label: "Midi (12h)", engagement: "high" },
    { time: "18:00", label: "Soir (18h)", engagement: "high" },
    { time: "20:00", label: "Soirée (20h)", engagement: "medium" },
    { time: "14:00", label: "Après-midi (14h)", engagement: "medium" },
    { time: "07:00", label: "Tôt matin (7h)", engagement: "low" },
    { time: "22:00", label: "Tard soir (22h)", engagement: "low" },
  ];
}

/**
 * Suggest optimal drop composition
 * 
 * Based on best practices for WhatsApp marketing
 */
export function getDropCompositionAdvice(
  articleCount: number,
  groupCount: number,
): string[] {
  const advice: string[] = [];

  if (articleCount < 3) {
    advice.push("👍 Petit drop - envoi rapide");
  } else if (articleCount <= 10) {
    advice.push("✅ Nombre d'articles optimal");
  } else if (articleCount <= 15) {
    advice.push("⚠️ Drop volumineux - peut sembler spam");
  } else {
    advice.push("❌ Trop d'articles - diviser en plusieurs drops");
  }

  if (groupCount <= 3) {
    advice.push("👍 Nombre de groupes gérable");
  } else if (groupCount <= 7) {
    advice.push("✅ Bonne diffusion");
  } else {
    advice.push("⚠️ Beaucoup de groupes - vérifier les filtres");
  }

  const estimatedTime = estimateSendingTime(articleCount, groupCount);
  if (estimatedTime < 2) {
    advice.push(`⏱️ Envoi rapide (~${estimatedTime}min)`);
  } else if (estimatedTime < 5) {
    advice.push(`⏱️ Temps d'envoi: ~${estimatedTime}min`);
  } else {
    advice.push(`⏱️ Envoi long: ~${estimatedTime}min - envisager réduction`);
  }

  return advice;
}
