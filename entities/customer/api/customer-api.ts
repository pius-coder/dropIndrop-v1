/**
 * Customer API - Client-side methods
 *
 * Type-safe API calls for Customer entity
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type {
  Customer,
  CustomerWithStats,
  CustomerInput,
  CustomerFilter,
  CustomerStats,
} from "../model/types";

/**
 * Get list of customers with optional filters
 */
export async function getCustomers(
  filters?: CustomerFilter
): Promise<CustomerWithStats[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.search) params.append("search", filters.search);
    if (filters.minOrders)
      params.append("minOrders", filters.minOrders.toString());
    if (filters.minSpent)
      params.append("minSpent", filters.minSpent.toString());
    if (filters.isLoyal !== undefined)
      params.append("isLoyal", filters.isLoyal.toString());
    if (filters.createdAfter)
      params.append("createdAfter", filters.createdAfter.toISOString());
    if (filters.createdBefore)
      params.append("createdBefore", filters.createdBefore.toISOString());
  }

  const url = `/customers${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<CustomerWithStats[]>(url);
}

/**
 * Get single customer by ID
 */
export async function getCustomer(id: string): Promise<CustomerWithStats> {
  return apiClient.get<CustomerWithStats>(`/customers/${id}`);
}

/**
 * Get customer by phone number
 */
export async function getCustomerByPhone(
  phone: string
): Promise<CustomerWithStats> {
  return apiClient.get<CustomerWithStats>(`/customers/phone/${phone}`);
}

/**
 * Create or get customer (upsert by phone)
 */
export async function createOrGetCustomer(
  data: CustomerInput
): Promise<Customer> {
  return apiClient.post<Customer>("/api/customers", data);
}

/**
 * Update customer
 */
export async function updateCustomer(
  id: string,
  data: Partial<CustomerInput>
): Promise<Customer> {
  return apiClient.put<Customer>(`/customers/${id}`, data);
}

/**
 * Delete customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  return apiClient.delete<void>(`/customers/${id}`);
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(id: string): Promise<CustomerStats> {
  return apiClient.get<CustomerStats>(`/customers/${id}/stats`);
}

/**
 * Get customer order history
 */
export async function getCustomerOrders(id: string): Promise<
  Array<{
    id: string;
    orderNumber: string;
    amount: number;
    paymentStatus: string;
    pickupStatus: string;
    createdAt: Date;
  }>
> {
  return apiClient.get(`/customers/${id}/orders`);
}

/**
 * Get top customers (by spending or orders)
 */
export async function getTopCustomers(
  limit = 10,
  sortBy: "spending" | "orders" = "spending"
): Promise<CustomerWithStats[]> {
  return apiClient.get<CustomerWithStats[]>(
    `/customers/top?limit=${limit}&sortBy=${sortBy}`
  );
}
