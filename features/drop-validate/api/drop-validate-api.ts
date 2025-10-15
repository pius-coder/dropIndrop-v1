/**
 * Drop Validate - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { DropValidationResponse } from "../model/types";

/**
 * Validate drop against same-day rule
 * 
 * Checks if articles can be sent to groups today
 */
export async function validateDrop(dropId: string): Promise<DropValidationResponse> {
  return apiClient.get<DropValidationResponse>(`/api/drops/${dropId}/validate`);
}
