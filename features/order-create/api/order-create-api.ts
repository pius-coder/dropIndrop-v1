/**
 * Order Create - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { CreateOrderInput, CreateOrderResponse } from "../model/types";

/**
 * Create new order
 */
export async function createOrder(data: CreateOrderInput): Promise<CreateOrderResponse> {
  return apiClient.post<CreateOrderResponse>("/orders", data);
}
