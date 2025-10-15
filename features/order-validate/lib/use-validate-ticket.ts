/**
 * Order Validate - React Query Hooks
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { validateTicket, markOrderPickedUp } from "../api/order-validate-api";

/**
 * Hook to validate ticket
 */
export function useValidateTicket() {
  return useMutation({
    mutationFn: validateTicket,
  });
}

/**
 * Hook to mark order as picked up
 */
export function useMarkPickedUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markOrderPickedUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
