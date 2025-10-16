/**
 * Customer Dashboard Hook
 * Fetches customer dashboard data (orders, tickets, stats)
 */

import { useQuery } from "@tanstack/react-query";
import { getCustomerDashboard } from "../api/customer-dashboard-api";

export function useCustomerDashboard() {
  return useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: getCustomerDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
