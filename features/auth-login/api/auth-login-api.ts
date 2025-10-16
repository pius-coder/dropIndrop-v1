/**
 * Auth Login - Client API
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { LoginRequest, LoginResponse } from "../model/types";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", credentials);
}
