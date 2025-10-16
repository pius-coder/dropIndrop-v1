/**
 * Drop List - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { DropListFilters, DropListResponse } from "../model/types";

/**
 * Get drops with filters
 */
export async function getDrops(
  filters: Partial<DropListFilters> = {}
): Promise<DropListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters.dateFrom)
    params.append("dateFrom", filters.dateFrom.toISOString());
  if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());

  return apiClient.get<DropListResponse>(`/drops?${params.toString()}`);
}

/**
 * Get single drop by ID
 */
export async function getDrop(dropId: string) {
  return apiClient.get(`/drops/${dropId}`);
}
