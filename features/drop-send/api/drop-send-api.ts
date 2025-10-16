/**
 * Drop Send - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { SendDropResponse, SendProgress } from "../model/types";

/**
 * Send drop to WhatsApp groups
 */
export async function sendDrop(
  dropId: string,
  force: boolean = false
): Promise<SendDropResponse> {
  return apiClient.post<SendDropResponse>(`/drops/${dropId}/send`, {
    force,
  });
}

/**
 * Get sending progress (for real-time updates)
 */
export async function getSendProgress(dropId: string): Promise<SendProgress> {
  return apiClient.get<SendProgress>(`/drops/${dropId}/progress`);
}

/**
 * Cancel ongoing send
 */
export async function cancelSend(
  dropId: string
): Promise<{ success: boolean }> {
  return apiClient.post<{ success: boolean }>(`/drops/${dropId}/cancel`, {});
}
