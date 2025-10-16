/**
 * Order Validate - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type {
  ValidateTicketInput,
  ValidateTicketResponse,
  MarkPickedUpResponse,
} from "../model/types";

/**
 * Validate ticket code
 */
export async function validateTicket(
  data: ValidateTicketInput
): Promise<ValidateTicketResponse> {
  return apiClient.post<ValidateTicketResponse>(
    "/api/orders/validate-ticket",
    data
  );
}

/**
 * Mark order as picked up
 */
export async function markOrderPickedUp(
  orderId: string
): Promise<MarkPickedUpResponse> {
  return apiClient.post<MarkPickedUpResponse>(`/orders/${orderId}/pickup`, {});
}
