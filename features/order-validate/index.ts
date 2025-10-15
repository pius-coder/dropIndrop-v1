/**
 * Order Validate Feature - Public API
 */

export { TicketValidator } from "./ui/ticket-validator";
export { QRScanner } from "./ui/qr-scanner";
export { useValidateTicket, useMarkPickedUp } from "./lib/use-validate-ticket";
export { validateTicket, markOrderPickedUp } from "./api/order-validate-api";
export { validateTicketSchema } from "./model/types";
export type {
  ValidateTicketInput,
  ValidateTicketResponse,
  MarkPickedUpResponse,
} from "./model/types";
