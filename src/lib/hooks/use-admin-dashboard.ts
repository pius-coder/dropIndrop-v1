import { useQuery } from "@tanstack/react-query";
import {
  DashboardStatsSchema,
  ConfigurationSchema,
  DashboardDataSchema,
  type DashboardStats,
  type Configuration,
  type DashboardData,
} from "@/lib/schemas/configuration-schema";

/**
 * Hook for fetching admin dashboard data with type safety
 */
export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("Fetching dashboard data from API...");

      // Fetch dashboard data from API
      const response = await fetch("/api/admin/dashboard");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch dashboard data");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch dashboard data");
      }

      console.log("Dashboard data received:", data.data);

      // Validate the response data
      const dashboardData = DashboardDataSchema.parse(data.data);

      return dashboardData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching configuration data specifically
 */
export function useConfiguration() {
  return useQuery({
    queryKey: ["configuration"],
    queryFn: async (): Promise<Configuration | null> => {
      const response = await fetch("/api/admin/configuration");
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data ? ConfigurationSchema.parse(data.data) : null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for checking setup status
 */
export function useSetupStatus() {
  return useQuery({
    queryKey: ["setup-status"],
    queryFn: async (): Promise<{
      isSetupComplete: boolean;
      configuration: Configuration | null;
    }> => {
      const response = await fetch("/api/admin/configuration");
      if (!response.ok) {
        return { isSetupComplete: false, configuration: null };
      }

      const data = await response.json();
      const configuration = data.data
        ? ConfigurationSchema.parse(data.data)
        : null;
      const isSetupComplete = configuration?.isComplete || false;

      return { isSetupComplete, configuration };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
}
