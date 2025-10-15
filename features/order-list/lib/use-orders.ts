/**
 * Order List - React Query Hook
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/order-list-api";
import type { OrderListFilters } from "../model/types";

/**
 * Hook to fetch orders
 */
export function useOrders(filters: Partial<OrderListFilters> = {}) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
    staleTime: 30 * 1000, // 30 seconds (orders change frequently)
  });
}
