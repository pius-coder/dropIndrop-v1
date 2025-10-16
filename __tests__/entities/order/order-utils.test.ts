/**
 * Order Utils Tests
 */

import { describe, it, expect } from "vitest";
import {
  generateTicketCode,
  isValidTicketFormat,
  canPickup,
} from "@/entities/order/lib/order-utils";

describe("Order Utils", () => {
  describe("generateTicketCode", () => {
    it("should generate ticket code in correct format", () => {
      const code = generateTicketCode();

      // Format: TKT-YYYYMMDD-XXXX
      expect(code).toMatch(/^TKT-\d{8}-\d{4}$/);
    });

    it("should generate unique codes", () => {
      const code1 = generateTicketCode();
      const code2 = generateTicketCode();

      // Should be different (very high probability)
      expect(code1).not.toBe(code2);
    });

    it("should include today's date", () => {
      const code = generateTicketCode();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateStr = `${year}${month}${day}`;

      expect(code).toContain(dateStr);
    });
  });

  describe("isValidTicketFormat", () => {
    it("should accept valid ticket format", () => {
      expect(isValidTicketFormat("TKT-20251015-0001")).toBe(true);
      expect(isValidTicketFormat("TKT-20251231-9999")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(isValidTicketFormat("TKT-2025101-0001")).toBe(false); // Wrong date length
      expect(isValidTicketFormat("TKT-20251015-001")).toBe(false); // Wrong number length
      expect(isValidTicketFormat("TICKET-20251015-0001")).toBe(false); // Wrong prefix
      expect(isValidTicketFormat("20251015-0001")).toBe(false); // Missing prefix
      expect(isValidTicketFormat("")).toBe(false); // Empty
    });
  });

  describe("canPickup", () => {
    it("should allow pickup when paid and pending", () => {
      const result = canPickup({
        paymentStatus: "PAID",
        pickupStatus: "PENDING",
      });
      expect(result).toBe(true);
    });

    it("should block pickup when payment is pending", () => {
      const result = canPickup({
        paymentStatus: "PENDING",
        pickupStatus: "PENDING",
      });
      expect(result).toBe(false);
    });

    it("should block pickup when already picked up", () => {
      const result = canPickup({
        paymentStatus: "PAID",
        pickupStatus: "PICKED_UP",
      });
      expect(result).toBe(false);
    });

    it("should block pickup when payment failed", () => {
      const result = canPickup({
        paymentStatus: "FAILED",
        pickupStatus: "PENDING",
      });
      expect(result).toBe(false);
    });

    it("should block pickup when cancelled", () => {
      const result = canPickup({
        paymentStatus: "PAID",
        pickupStatus: "CANCELLED",
      });
      expect(result).toBe(false);
    });
  });
});
