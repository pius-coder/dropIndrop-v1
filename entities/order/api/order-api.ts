/**
 * Order API - Client-side methods
 *
 * Type-safe API calls for Order entity
 */

"use client";

import { apiClient } from "@/shared/api/client";
import type {
  Order,
  OrderWithRelations,
  CreateOrderInput,
  ValidateTicketInput,
  OrderFilter,
} from "../model/types";

/**
 * Get list of orders with optional filters
 */
export async function getOrders(
  filters?: OrderFilter
): Promise<OrderWithRelations[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.customerId) params.append("customerId", filters.customerId);
    if (filters.articleId) params.append("articleId", filters.articleId);
    if (filters.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);
    if (filters.pickupStatus)
      params.append("pickupStatus", filters.pickupStatus);
    if (filters.paymentMethod)
      params.append("paymentMethod", filters.paymentMethod);
    if (filters.search) params.append("search", filters.search);
    if (filters.createdAfter)
      params.append("createdAfter", filters.createdAfter.toISOString());
    if (filters.createdBefore)
      params.append("createdBefore", filters.createdBefore.toISOString());
  }

  const url = `/orders${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<OrderWithRelations[]>(url);
}

/**
 * Get single order by ID
 */
export async function getOrder(id: string): Promise<OrderWithRelations> {
  return apiClient.get<OrderWithRelations>(`/orders/${id}`);
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderWithRelations> {
  return apiClient.get<OrderWithRelations>(`/orders/number/${orderNumber}`);
}

/**
 * Get order by ticket code
 */
export async function getOrderByTicket(
  ticketCode: string
): Promise<OrderWithRelations> {
  return apiClient.get<OrderWithRelations>(`/orders/ticket/${ticketCode}`);
}

/**
 * Create new order (initiate payment)
 */
export async function createOrder(data: CreateOrderInput): Promise<{
  order: Order;
  paymentUrl?: string;
}> {
  return apiClient.post("/orders", data);
}

/**
 * Validate ticket for pickup
 */
export async function validateTicket(data: ValidateTicketInput): Promise<{
  valid: boolean;
  order?: OrderWithRelations;
  errors?: string[];
  warnings?: string[];
}> {
  return apiClient.post("/orders/validate-ticket", data);
}

/**
 * Confirm pickup (mark order as picked up)
 */
export async function confirmPickup(orderId: string): Promise<Order> {
  return apiClient.post<Order>(`/orders/${orderId}/pickup`, {});
}

/**
 * Cancel order (before pickup)
 */
export async function cancelOrder(orderId: string): Promise<Order> {
  return apiClient.post<Order>(`/orders/${orderId}/cancel`, {});
}

/**
 * Retry payment for failed order
 */
export async function retryPayment(orderId: string): Promise<{
  order: Order;
  paymentUrl?: string;
}> {
  return apiClient.post(`/orders/${orderId}/retry-payment`, {});
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<{
  total: number;
  pending: number;
  paid: number;
  pickedUp: number;
  cancelled: number;
  revenue: number;
}> {
  return apiClient.get("/orders/stats");
}

/**
 * Send ticket to customer via WhatsApp
 */
export async function sendTicket(orderId: string): Promise<void> {
  return apiClient.post<void>(`/orders/${orderId}/send-ticket`, {});
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(
  phone: string
): Promise<OrderWithRelations[]> {
  return apiClient.get<OrderWithRelations[]>(`/orders/customer/${phone}`);
}
