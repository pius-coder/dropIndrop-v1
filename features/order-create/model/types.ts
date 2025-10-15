/**
 * Order Create - Types
 */

import { createOrderSchema, type CreateOrderInput, type Order } from "@/entities/order";

// Re-export from entity layer
export { createOrderSchema };
export type { CreateOrderInput };

/**
 * Order creation response
 */
export interface CreateOrderResponse {
  order: Order;
  ticket: {
    code: string;
    qrCode: string; // Data URL or URL to QR code image
  };
  paymentInstructions: {
    method: string;
    instructions: string;
    amount: number;
  };
}
