/**
 * Customer Utilities
 * 
 * Customer statistics, loyalty checks, formatting
 */

import { daysBetween } from "@/shared/lib";
import type { Customer, CustomerStats } from "../model/types";

/**
 * Check if customer has account (registered with password)
 */
export function hasAccount(customer: Pick<Customer, "password">): boolean {
  return !!customer.password;
}

/**
 * Check if customer is loyal (has made multiple orders)
 */
export function isLoyalCustomer(customer: Pick<Customer, "totalOrders">): boolean {
  return customer.totalOrders >= 3;
}

/**
 * Get loyalty tier based on orders and spending
 */
export function getLoyaltyTier(
  customer: Pick<Customer, "totalOrders" | "totalSpent">,
): "new" | "regular" | "loyal" | "vip" {
  const orders = customer.totalOrders;
  const spent = Number(customer.totalSpent);

  if (orders === 0) return "new";
  if (orders >= 20 || spent >= 500000) return "vip"; // 20+ orders or 500k+ FCFA
  if (orders >= 10 || spent >= 200000) return "loyal"; // 10+ orders or 200k+ FCFA
  if (orders >= 3 || spent >= 50000) return "regular"; // 3+ orders or 50k+ FCFA
  return "new";
}

/**
 * Get loyalty tier display name
 */
export function getLoyaltyTierName(tier: "new" | "regular" | "loyal" | "vip"): string {
  switch (tier) {
    case "new":
      return "Nouveau";
    case "regular":
      return "Régulier";
    case "loyal":
      return "Fidèle";
    case "vip":
      return "VIP";
  }
}

/**
 * Get loyalty tier color (Tailwind)
 */
export function getLoyaltyTierColor(tier: "new" | "regular" | "loyal" | "vip"): string {
  switch (tier) {
    case "new":
      return "bg-gray-500";
    case "regular":
      return "bg-blue-500";
    case "loyal":
      return "bg-purple-500";
    case "vip":
      return "bg-amber-500";
  }
}

/**
 * Calculate customer statistics
 */
export function calculateCustomerStats(
  customer: Customer,
  lastOrderDate?: Date | null,
): CustomerStats {
  const totalOrders = customer.totalOrders;
  const totalSpent = Number(customer.totalSpent);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const accountAge = daysBetween(customer.createdAt, new Date());
  const isLoyal = hasAccount(customer);
  const loyaltyTier = getLoyaltyTier(customer);

  return {
    totalOrders,
    totalSpent,
    averageOrderValue,
    lastOrderDate: lastOrderDate || null,
    accountAge,
    isLoyal,
    loyaltyTier,
  };
}

/**
 * Format customer phone for display
 * +237 6XX XXX XXX
 */
export function formatCustomerPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");
  
  // Extract last 9 digits (6XXXXXXXX)
  const lastNine = cleaned.slice(-9);
  
  if (lastNine.length !== 9) return phone; // Invalid, return as-is
  
  // Format: +237 6XX XXX XXX
  return `+237 ${lastNine.slice(0, 3)} ${lastNine.slice(3, 6)} ${lastNine.slice(6)}`;
}

/**
 * Get customer display name
 * Shows name or phone if no name
 */
export function getCustomerDisplayName(customer: Pick<Customer, "name" | "phone">): string {
  return customer.name || formatCustomerPhone(customer.phone);
}

/**
 * Check if customer should receive loyalty discount
 */
export function qualifiesForDiscount(customer: Pick<Customer, "totalOrders" | "totalSpent">): {
  qualifies: boolean;
  discountPercent: number;
  reason?: string;
} {
  const tier = getLoyaltyTier(customer);
  
  switch (tier) {
    case "vip":
      return {
        qualifies: true,
        discountPercent: 10,
        reason: "Client VIP - 10% de réduction",
      };
    case "loyal":
      return {
        qualifies: true,
        discountPercent: 5,
        reason: "Client fidèle - 5% de réduction",
      };
    default:
      return {
        qualifies: false,
        discountPercent: 0,
      };
  }
}

/**
 * Get customer welcome message
 */
export function getWelcomeMessage(customer: Pick<Customer, "name" | "totalOrders">): string {
  if (customer.totalOrders === 0) {
    return `Bienvenue ${customer.name} ! 🎉`;
  }
  
  if (customer.totalOrders === 1) {
    return `Content de vous revoir ${customer.name} ! 👋`;
  }
  
  return `Bonjour ${customer.name} ! Merci pour votre fidélité 💙`;
}
