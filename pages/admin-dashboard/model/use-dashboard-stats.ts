/**
 * Admin Dashboard - Stats Hook
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  articles: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  drops: {
    total: number;
    draft: number;
    scheduled: number;
    sent: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    pickedUp: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * Hook to fetch dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      return apiClient.get<DashboardStats>("/api/dashboard/stats");
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
