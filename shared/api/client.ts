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
    // For Next.js API routes, prefix all calls with /api
    this.baseURL = "/api";
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return useAuthStore.getState().token;
  }

  async request<T>(method: string, url: string, data?: unknown): Promise<T> {
    const token = this.getToken();

    console.log(`📡 API Request: ${method} ${this.baseURL}${url}`);
    console.log("🔑 Token available:", !!token);
    console.log("📦 Request data:", data);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found in Zustand store!");
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      // Parse response body for both success and error cases
      let responseData: any;
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else if (response.status === 204) {
        // No content
        return undefined as T;
      } else {
        responseData = { message: await response.text() };
      }

      // Only throw for server errors (5xx) or network errors
      if (response.status >= 500) {
        console.error("❌ Server error 5xx:", responseData);
        throw new ApiError(
          response.status,
          response.statusText,
          responseData.message || `Server Error: ${response.statusText}`
        );
      }

      // For client errors (4xx), throw to trigger onError callback
      if (!response.ok) {
        console.error("❌ Client error 4xx:", responseData);
        throw new ApiError(
          response.status,
          response.statusText,
          responseData.message || responseData.error || response.statusText
        );
      }

      // Success response
      console.log("✅ API Success:", responseData);
      return responseData as T;
    } catch (error) {
      // Network errors or other fetch failures
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, "Network Error", "Unable to connect to server");
    }
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
