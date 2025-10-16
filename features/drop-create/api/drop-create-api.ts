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
  return apiClient.post<Drop>("/drops", data);
}
