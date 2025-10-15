/**
 * Ticket Utilities
 * 
 * Ticket generation, QR code creation, validation
 */

import { addDays } from "@/shared/lib";
import type { Order, TicketData } from "../model/types";

/**
 * Generate unique ticket code
 * Format: TKT-YYYYMMDD-XXXX
 */
export function generateTicketCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  return `TKT-${year}${month}${day}-${random}`;
}

/**
 * Generate ticket expiry date
 * Default: 7 days from now
 */
export function generateTicketExpiry(days = 7): Date {
  return addDays(new Date(), days);
}

/**
 * Check if ticket is expired
 */
export function isTicketExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now();
}

/**
 * Get days until expiry
 */
export function getDaysUntilExpiry(expiresAt: Date): number {
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Check if ticket is expiring soon (within 2 days)
 */
export function isTicketExpiringSoon(expiresAt: Date): boolean {
  const daysLeft = getDaysUntilExpiry(expiresAt);
  return daysLeft > 0 && daysLeft <= 2;
}

/**
 * Generate QR code data URL
 * 
 * Note: Actual QR code generation should be done server-side
 * This is a placeholder that returns the data structure
 */
export function prepareTicketDataForQR(ticketData: TicketData): string {
  // In real implementation, use 'qrcode' library on server
  // For now, return JSON string that will be encoded
  return JSON.stringify({
    code: ticketData.ticketCode,
    order: ticketData.orderId,
    phone: ticketData.customerPhone,
    exp: ticketData.expiresAt.getTime(),
  });
}

/**
 * Parse QR code data back to ticket info
 */
export function parseTicketQRData(qrData: string): {
  ticketCode: string;
  orderId: string;
  customerPhone: string;
  expiresAt: Date;
} | null {
  try {
    const parsed = JSON.parse(qrData);
    return {
      ticketCode: parsed.code,
      orderId: parsed.order,
      customerPhone: parsed.phone,
      expiresAt: new Date(parsed.exp),
    };
  } catch {
    return null;
  }
}

/**
 * Generate QR code as base64 data URL (server-side)
 * 
 * This function signature shows what will be implemented
 * when qrcode library is added
 */
export async function generateQRCode(data: string): Promise<string> {
  // TODO: Implement with qrcode library
  // const QRCode = require('qrcode');
  // return await QRCode.toDataURL(data, { errorCorrectionLevel: 'M' });
  
  // Placeholder: return base64 placeholder
  return `data:image/png;base64,placeholder_for_${data.substring(0, 10)}`;
}

/**
 * Validate ticket code format
 */
export function isValidTicketCodeFormat(code: string): boolean {
  return /^TKT-\d{8}-\d{4}$/.test(code);
}

/**
 * Get ticket status text
 */
export function getTicketStatusText(order: Pick<Order, "paymentStatus" | "pickupStatus" | "ticketExpiresAt">): string {
  if (order.pickupStatus === "PICKED_UP") {
    return "Récupéré";
  }
  
  if (order.pickupStatus === "CANCELLED") {
    return "Annulé";
  }
  
  if (order.paymentStatus !== "PAID") {
    return "Paiement en attente";
  }
  
  if (isTicketExpired(order.ticketExpiresAt)) {
    return "Expiré";
  }
  
  if (isTicketExpiringSoon(order.ticketExpiresAt)) {
    return "Expire bientôt";
  }
  
  return "Valide";
}

/**
 * Get ticket status color (Tailwind)
 */
export function getTicketStatusColor(order: Pick<Order, "paymentStatus" | "pickupStatus" | "ticketExpiresAt">): string {
  if (order.pickupStatus === "PICKED_UP") {
    return "bg-green-500";
  }
  
  if (order.pickupStatus === "CANCELLED" || isTicketExpired(order.ticketExpiresAt)) {
    return "bg-red-500";
  }
  
  if (order.paymentStatus !== "PAID") {
    return "bg-yellow-500";
  }
  
  if (isTicketExpiringSoon(order.ticketExpiresAt)) {
    return "bg-orange-500";
  }
  
  return "bg-blue-500";
}
