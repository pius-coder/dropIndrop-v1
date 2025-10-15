/**
 * Order Validate - Types
 */

import { validateTicketSchema, type ValidateTicketInput } from "@/entities/order";

// Re-export from entity layer
export { validateTicketSchema };
export type { ValidateTicketInput };

/**
 * Ticket validation response
 */
export interface ValidateTicketResponse {
  valid: boolean;
  order?: {
    id: string;
    orderNumber: string;
    ticketCode: string;
    article: {
      id: string;
      name: string;
      price: number;
      images: string[];
    };
    customer: {
      name: string;
      phone: string;
    };
    paymentStatus: string;
    pickupStatus: string;
    totalPrice: number;
    createdAt: Date;
  };
  message: string;
  canPickup: boolean;
}

/**
 * Mark as picked up response
 */
export interface MarkPickedUpResponse {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    pickupStatus: string;
    pickedUpAt: Date;
  };
}
