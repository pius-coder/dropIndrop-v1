/**
 * Drop API - Client-side methods
 * 
 * Type-safe API calls for Drop entity
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type {
  Drop,
  DropWithRelations,
  CreateDropInput,
  UpdateDropInput,
  DropFilter,
  DropValidation,
} from "../model/types";

/**
 * Get list of drops with optional filters
 */
export async function getDrops(filters?: DropFilter): Promise<DropWithRelations[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.status) params.append("status", filters.status);
    if (filters.createdBy) params.append("createdBy", filters.createdBy);
    if (filters.scheduledAfter)
      params.append("scheduledAfter", filters.scheduledAfter.toISOString());
    if (filters.scheduledBefore)
      params.append("scheduledBefore", filters.scheduledBefore.toISOString());
    if (filters.search) params.append("search", filters.search);
  }

  const url = `/api/drops${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<DropWithRelations[]>(url);
}

/**
 * Get single drop by ID
 */
export async function getDrop(id: string): Promise<DropWithRelations> {
  return apiClient.get<DropWithRelations>(`/api/drops/${id}`);
}

/**
 * Create new drop
 */
export async function createDrop(data: CreateDropInput): Promise<Drop> {
  return apiClient.post<Drop>("/api/drops", data);
}

/**
 * Update drop
 */
export async function updateDrop(id: string, data: UpdateDropInput): Promise<Drop> {
  return apiClient.put<Drop>(`/api/drops/${id}`, data);
}

/**
 * Delete drop (only if DRAFT)
 */
export async function deleteDrop(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/drops/${id}`);
}

/**
 * Validate drop before sending
 * Checks same-day rule and other validations
 */
export async function validateDrop(id: string): Promise<DropValidation> {
  return apiClient.get<DropValidation>(`/api/drops/${id}/validate`);
}

/**
 * Send drop immediately
 * Performs validation then sends to all groups
 */
export async function sendDrop(id: string): Promise<Drop> {
  return apiClient.post<Drop>(`/api/drops/${id}/send`, {});
}

/**
 * Schedule drop for later
 */
export async function scheduleDrop(id: string, scheduledFor: Date): Promise<Drop> {
  return apiClient.post<Drop>(`/api/drops/${id}/schedule`, { scheduledFor });
}

/**
 * Cancel scheduled drop
 */
export async function cancelDrop(id: string): Promise<Drop> {
  return apiClient.post<Drop>(`/api/drops/${id}/cancel`, {});
}

/**
 * Retry failed drop
 */
export async function retryDrop(id: string): Promise<Drop> {
  return apiClient.post<Drop>(`/api/drops/${id}/retry`, {});
}

/**
 * Get drop statistics
 */
export async function getDropStats(id: string): Promise<{
  totalSent: number;
  successRate: number;
  groupStats: Array<{
    groupId: string;
    groupName: string;
    articlesSent: number;
    messagesSent: number;
  }>;
}> {
  return apiClient.get(`/api/drops/${id}/stats`);
}

/**
 * Get drop history
 */
export async function getDropHistory(id: string): Promise<
  Array<{
    id: string;
    whatsappGroupId: string;
    articleId: string;
    messagesSent: number;
    status: string;
    sentAt: Date;
  }>
> {
  return apiClient.get(`/api/drops/${id}/history`);
}

/**
 * Duplicate drop (create new draft from existing)
 */
export async function duplicateDrop(id: string): Promise<Drop> {
  return apiClient.post<Drop>(`/api/drops/${id}/duplicate`, {});
}
