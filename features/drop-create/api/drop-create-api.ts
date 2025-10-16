/**
 * Drop Create - API Methods
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type { CreateDropInput } from "../model/types";
import type { Drop } from "@/entities/drop";

/**
 * Create new drop
 */
export async function createDrop(data: CreateDropInput): Promise<Drop> {
  console.log("🚀 createDrop API called with:", data);
  try {
    const result = await apiClient.post<Drop>("/drops", data);
    console.log("✅ createDrop API success:", result);
    return result;
  } catch (error) {
    console.error("❌ createDrop API error:", error);
    throw error;
  }
}
