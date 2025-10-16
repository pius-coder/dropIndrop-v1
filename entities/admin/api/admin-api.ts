/**
 * Admin API - Client-side methods
 *
 * Type-safe API calls for Admin entity
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type {
  AdminPublic,
  CreateAdminInput,
  UpdateAdminInput,
  LoginInput,
  AdminFilter,
} from "../model/types";

/**
 * Login admin
 */
export async function login(data: LoginInput): Promise<{
  admin: AdminPublic;
  token: string;
}> {
  return apiClient.post("/api/auth/login", data);
}

/**
 * Logout admin
 */
export async function logout(): Promise<void> {
  return apiClient.post<void>("/api/auth/logout", {});
}

/**
 * Get current admin profile
 */
export async function getMe(): Promise<AdminPublic> {
  return apiClient.get<AdminPublic>("/api/auth/me");
}

/**
 * Update current admin profile
 */
export async function updateMe(
  data: Pick<UpdateAdminInput, "name" | "email">
): Promise<AdminPublic> {
  return apiClient.put<AdminPublic>("/api/auth/me", data);
}

/**
 * Change password
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return apiClient.post<void>("/api/auth/change-password", data);
}

/**
 * Get list of admins (SUPER_ADMIN only)
 */
export async function getAdmins(filters?: AdminFilter): Promise<AdminPublic[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.role) params.append("role", filters.role);
    if (filters.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters.search) params.append("search", filters.search);
  }

  const url = `/admins${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<AdminPublic[]>(url);
}

/**
 * Get single admin by ID (SUPER_ADMIN only)
 */
export async function getAdmin(id: string): Promise<AdminPublic> {
  return apiClient.get<AdminPublic>(`/admins/${id}`);
}

/**
 * Create admin (SUPER_ADMIN only)
 */
export async function createAdmin(
  data: CreateAdminInput
): Promise<AdminPublic> {
  return apiClient.post<AdminPublic>("/api/admins", data);
}

/**
 * Update admin (SUPER_ADMIN only)
 */
export async function updateAdmin(
  id: string,
  data: UpdateAdminInput
): Promise<AdminPublic> {
  return apiClient.put<AdminPublic>(`/admins/${id}`, data);
}

/**
 * Delete admin (SUPER_ADMIN only)
 */
export async function deleteAdmin(id: string): Promise<void> {
  return apiClient.delete<void>(`/admins/${id}`);
}

/**
 * Activate/deactivate admin (SUPER_ADMIN only)
 */
export async function toggleAdminStatus(id: string): Promise<AdminPublic> {
  return apiClient.post<AdminPublic>(`/admins/${id}/toggle-status`, {});
}
