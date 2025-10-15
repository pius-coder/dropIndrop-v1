/**
 * Order List - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { OrderListFilters, OrderListResponse } from "../model/types";

/**
 * Get orders with filters
 */
export async function getOrders(
  filters: Partial<OrderListFilters> = {}
): Promise<OrderListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  return apiClient.get<OrderListResponse>(`/api/orders?${params.toString()}`);
}
