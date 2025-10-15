/**
 * Order Utilities
 * 
 * Order status management and validation
 */

import { isTicketExpired } from "./ticket-utils";
import { isPaymentCompleted } from "./payment-utils";
import type { Order, PaymentStatus, PickupStatus } from "../model/types";

/**
 * Check if order can be picked up
 */
export function canPickup(order: Pick<Order, "paymentStatus" | "pickupStatus" | "ticketExpiresAt">): {
  allowed: boolean;
  reason?: string;
} {
  // Must be paid
  if (!isPaymentCompleted(order.paymentStatus)) {
    return {
      allowed: false,
      reason: "Le paiement n'est pas confirmé",
    };
  }
  
  // Must not be already picked up
  if (order.pickupStatus === "PICKED_UP") {
    return {
      allowed: false,
      reason: "Commande déjà récupérée",
    };
  }
  
  // Must not be cancelled
  if (order.pickupStatus === "CANCELLED") {
    return {
      allowed: false,
      reason: "Commande annulée",
    };
  }
  
  // Must not be expired
  if (isTicketExpired(order.ticketExpiresAt)) {
    return {
      allowed: false,
      reason: "Ticket expiré",
    };
  }
  
  return { allowed: true };
}

/**
 * Check if order is pending payment
 */
export function isPendingPayment(order: Pick<Order, "paymentStatus" | "pickupStatus">): boolean {
  return order.paymentStatus === "PENDING" && order.pickupStatus === "PENDING";
}

/**
 * Check if order is ready for pickup
 */
export function isReadyForPickup(order: Pick<Order, "paymentStatus" | "pickupStatus" | "ticketExpiresAt">): boolean {
  const result = canPickup(order);
  return result.allowed;
}

/**
 * Check if order is completed
 */
export function isOrderCompleted(order: Pick<Order, "pickupStatus">): boolean {
  return order.pickupStatus === "PICKED_UP";
}

/**
 * Check if order is cancelled
 */
export function isOrderCancelled(order: Pick<Order, "pickupStatus">): boolean {
  return order.pickupStatus === "CANCELLED";
}

/**
 * Get combined order status text
 */
export function getOrderStatusText(order: Pick<Order, "paymentStatus" | "pickupStatus" | "ticketExpiresAt">): string {
  if (order.pickupStatus === "PICKED_UP") {
    return "Récupéré";
  }
  
  if (order.pickupStatus === "CANCELLED") {
    return "Annulé";
  }
  
  if (order.paymentStatus === "FAILED") {
    return "Paiement échoué";
  }
  
  if (order.paymentStatus === "REFUNDED") {
    return "Remboursé";
  }
  
  if (order.paymentStatus === "PENDING") {
    return "En attente de paiement";
  }
  
  if (isTicketExpired(order.ticketExpiresAt)) {
    return "Ticket expiré";
  }
  
  return "Prêt à récupérer";
}

/**
 * Get order status color (Tailwind)
 */
export function getOrderStatusColor(order: Pick<Order, "paymentStatus" | "pickupStatus" | "ticketExpiresAt">): string {
  if (order.pickupStatus === "PICKED_UP") {
    return "bg-green-500";
  }
  
  if (order.pickupStatus === "CANCELLED" || order.paymentStatus === "FAILED") {
    return "bg-red-500";
  }
  
  if (order.paymentStatus === "REFUNDED") {
    return "bg-gray-500";
  }
  
  if (order.paymentStatus === "PENDING") {
    return "bg-yellow-500";
  }
  
  if (isTicketExpired(order.ticketExpiresAt)) {
    return "bg-red-500";
  }
  
  return "bg-blue-500";
}

/**
 * Get pickup status display text
 */
export function getPickupStatusText(status: PickupStatus): string {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "PICKED_UP":
      return "Récupéré";
    case "CANCELLED":
      return "Annulé";
  }
}

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Validate order before pickup
 */
export function validateOrderForPickup(order: Pick<Order, "paymentStatus" | "pickupStatus" | "ticketExpiresAt">): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const pickupCheck = canPickup(order);
  if (!pickupCheck.allowed) {
    errors.push(pickupCheck.reason!);
  }
  
  // Check if expiring soon (within 1 day)
  const now = new Date();
  const diffTime = order.ticketExpiresAt.getTime() - now.getTime();
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  
  if (diffHours > 0 && diffHours <= 24) {
    warnings.push(`Ticket expire dans ${diffHours}h`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
