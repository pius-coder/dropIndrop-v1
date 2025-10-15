/**
 * Drop List - React Query Hooks
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getDrops, getDrop } from "../api/drop-list-api";
import type { DropListFilters } from "../model/types";

/**
 * Hook to fetch drops
 */
export function useDrops(filters: Partial<DropListFilters> = {}) {
  return useQuery({
    queryKey: ["drops", filters],
    queryFn: () => getDrops(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch single drop
 */
export function useDrop(dropId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["drop", dropId],
    queryFn: () => getDrop(dropId),
    enabled: enabled && !!dropId,
  });
}
