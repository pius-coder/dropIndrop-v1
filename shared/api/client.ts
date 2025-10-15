/**
 * API Client - Type-safe HTTP wrapper with auth
 * 
 * Features:
 * - Auto-attach auth token from Zustand store
 * - Centralized error handling
 * - Type-safe requests/responses
 */

import { useAuthStore } from "@/shared/store/auth-store";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_APP_URL || "";
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return useAuthStore.getState().token;
  }

  async request<T>(
    method: string,
    url: string,
    data?: unknown,
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        response.statusText,
        errorData.message || `API Error: ${response.statusText}`,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>("GET", url);
  }

  post<T>(url: string, data: unknown): Promise<T> {
    return this.request<T>("POST", url, data);
  }

  put<T>(url: string, data: unknown): Promise<T> {
    return this.request<T>("PUT", url, data);
  }

  patch<T>(url: string, data: unknown): Promise<T> {
    return this.request<T>("PATCH", url, data);
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>("DELETE", url);
  }
}

export const apiClient = new ApiClient();
