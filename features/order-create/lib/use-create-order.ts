/**
 * Order Create - React Query Hook
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../api/order-create-api";

/**
 * Hook to create order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
