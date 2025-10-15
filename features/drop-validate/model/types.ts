/**
 * Drop Validate - Types
 */

import type { SameDayValidation } from "@/entities/drop";

/**
 * Drop validation response
 */
export interface DropValidationResponse {
  canSend: boolean;
  validations: SameDayValidation[];
  summary: {
    totalGroups: number;
    blockedGroups: number;
    partiallyBlockedGroups: number;
    clearGroups: number;
    totalWarnings: number;
  };
  drop: {
    id: string;
    name: string;
    articleCount: number;
    groupCount: number;
  };
}
