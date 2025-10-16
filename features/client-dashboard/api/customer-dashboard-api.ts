/**
 * Customer Dashboard API
 * Fetches dashboard data for authenticated customers
 */

import jwt from "jsonwebtoken";

/**
 * Get customer dashboard data
 */
export async function getCustomerDashboard(): Promise<{
  stats: {
    totalOrders: number;
    totalSpent: number;
    activeTickets: number;
    memberSince: string;
  };
  recentOrders: any[];
  activeTickets: any[];
}> {
  const token = localStorage.getItem("customerToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch("/api/customers/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required");
    }
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}
