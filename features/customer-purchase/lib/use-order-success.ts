/**
 * Order Success Hook
 * Fetches order details for success page
 */

import { useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "../api/customer-purchase-api";

export function useOrderSuccess(orderId: string) {
  return useQuery({
    queryKey: ["order-success", orderId],
    queryFn: () => getOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 60 * 1000, // 1 minute
  });
}
