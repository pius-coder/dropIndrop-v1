/**
 * Drop Validate - React Query Hook
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { validateDrop } from "../api/drop-validate-api";

/**
 * Hook to validate drop before sending
 * 
 * Automatically validates and provides real-time feedback
 */
export function useValidateDrop(dropId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["drop-validation", dropId],
    queryFn: () => validateDrop(dropId),
    enabled: enabled && !!dropId,
    staleTime: 60 * 1000, // 1 minute (validation can change as drops are sent)
    refetchOnMount: true,
  });
}
