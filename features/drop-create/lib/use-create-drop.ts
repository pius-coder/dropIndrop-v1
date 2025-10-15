/**
 * Drop Create - React Query Mutation Hook
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDrop } from "../api/drop-create-api";

/**
 * Hook to create drop
 */
export function useCreateDrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDrop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
    },
  });
}
