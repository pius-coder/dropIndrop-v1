/**
 * Payment Utilities
 * 
 * Payment validation, formatting, and helper functions
 */

import type { PaymentMethod, PaymentStatus } from "../model/types";

/**
 * Format phone number for payment gateway
 * Ensures +237 country code
 */
export function formatPhoneForPayment(phone: string): string {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, "");
  
  // Add +237 if not present
  if (!cleaned.startsWith("+237")) {
    cleaned = cleaned.startsWith("237") ? `+${cleaned}` : `+237${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Validate payment method is supported
 */
export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return method === "MTN_MOMO" || method === "ORANGE_MONEY";
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(method: PaymentMethod): string {
  switch (method) {
    case "MTN_MOMO":
      return "MTN Mobile Money";
    case "ORANGE_MONEY":
      return "Orange Money";
  }
}

/**
 * Get payment method color (Tailwind)
 */
export function getPaymentMethodColor(method: PaymentMethod): string {
  switch (method) {
    case "MTN_MOMO":
      return "bg-yellow-500"; // MTN yellow
    case "ORANGE_MONEY":
      return "bg-orange-500"; // Orange color
  }
}

/**
 * Get payment status display text
 */
export function getPaymentStatusText(status: PaymentStatus): string {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "PAID":
      return "Payé";
    case "FAILED":
      return "Échoué";
    case "REFUNDED":
      return "Remboursé";
  }
}

/**
 * Get payment status color (Tailwind)
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500";
    case "PAID":
      return "bg-green-500";
    case "FAILED":
      return "bg-red-500";
    case "REFUNDED":
      return "bg-gray-500";
  }
}

/**
 * Check if payment is completed
 */
export function isPaymentCompleted(status: PaymentStatus): boolean {
  return status === "PAID";
}

/**
 * Check if payment is pending
 */
export function isPaymentPending(status: PaymentStatus): boolean {
  return status === "PENDING";
}

/**
 * Check if payment failed
 */
export function isPaymentFailed(status: PaymentStatus): boolean {
  return status === "FAILED";
}

/**
 * Calculate total amount with potential fees
 * 
 * For now, no fees. Can be extended later.
 */
export function calculateTotalAmount(articlePrice: number): {
  subtotal: number;
  fees: number;
  total: number;
} {
  const subtotal = articlePrice;
  const fees = 0; // No fees for now
  const total = subtotal + fees;
  
  return { subtotal, fees, total };
}

/**
 * Validate phone number for payment
 * Cameroon mobile numbers only
 */
export function isValidPaymentPhone(phone: string): boolean {
  const formatted = formatPhoneForPayment(phone);
  return /^\+237[6][0-9]{8}$/.test(formatted);
}

/**
 * Get payment provider from phone number
 * MTN: starts with 67, 650-656, 68
 * Orange: starts with 69, 655, 657-659
 */
export function detectPaymentProvider(phone: string): PaymentMethod | null {
  const cleaned = phone.replace(/[\s\-+]/g, "");
  const lastDigits = cleaned.slice(-9); // Get last 9 digits (6XXXXXXXX)
  
  if (!lastDigits.startsWith("6")) return null;
  
  const prefix = lastDigits.substring(0, 3);
  
  // MTN prefixes
  if (prefix.startsWith("67") || prefix.startsWith("68")) {
    return "MTN_MOMO";
  }
  
  if (["650", "651", "652", "653", "654", "656"].includes(prefix)) {
    return "MTN_MOMO";
  }
  
  // Orange prefixes
  if (prefix.startsWith("69")) {
    return "ORANGE_MONEY";
  }
  
  if (["655", "657", "658", "659"].includes(prefix)) {
    return "ORANGE_MONEY";
  }
  
  return null;
}
