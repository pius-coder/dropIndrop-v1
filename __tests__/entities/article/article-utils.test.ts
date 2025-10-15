/**
 * Article Utils Tests
 */

import { describe, it, expect } from "vitest";
import {
  isLowStock,
  isOutOfStock,
  formatPrice,
  calculateStockStatus,
} from "@/entities/article/lib/article-utils";

describe("Article Utils", () => {
  describe("isLowStock", () => {
    it("should return true when stock is at or below minStock", () => {
      expect(isLowStock({ stock: 2, minStock: 5 })).toBe(true);
      expect(isLowStock({ stock: 5, minStock: 5 })).toBe(true);
    });

    it("should return false when stock is above minStock", () => {
      expect(isLowStock({ stock: 10, minStock: 5 })).toBe(false);
    });

    it("should return true when stock is 0", () => {
      expect(isLowStock({ stock: 0, minStock: 5 })).toBe(true);
    });
  });

  describe("isOutOfStock", () => {
    it("should return true when stock is 0", () => {
      expect(isOutOfStock({ stock: 0 })).toBe(true);
    });

    it("should return false when stock is greater than 0", () => {
      expect(isOutOfStock({ stock: 1 })).toBe(false);
      expect(isOutOfStock({ stock: 100 })).toBe(false);
    });
  });

  describe("formatPrice", () => {
    it("should format price in French format", () => {
      expect(formatPrice(1000000)).toBe("1 000 000");
      expect(formatPrice(850000)).toBe("850 000");
      expect(formatPrice(15000)).toBe("15 000");
    });

    it("should handle small prices", () => {
      expect(formatPrice(500)).toBe("500");
      expect(formatPrice(99)).toBe("99");
    });

    it("should handle zero", () => {
      expect(formatPrice(0)).toBe("0");
    });
  });

  describe("calculateStockStatus", () => {
    it("should return 'out' when stock is 0", () => {
      const status = calculateStockStatus({ stock: 0, minStock: 5 });
      expect(status).toBe("out");
    });

    it("should return 'low' when stock is at or below minStock", () => {
      const status1 = calculateStockStatus({ stock: 2, minStock: 5 });
      expect(status1).toBe("low");

      const status2 = calculateStockStatus({ stock: 5, minStock: 5 });
      expect(status2).toBe("low");
    });

    it("should return 'ok' when stock is above minStock", () => {
      const status = calculateStockStatus({ stock: 10, minStock: 5 });
      expect(status).toBe("ok");
    });
  });
});
