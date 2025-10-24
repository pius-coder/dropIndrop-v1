/**
 * Currency formatting utilities
 * Following clean code principles: single responsibility, meaningful names
 */

/**
 * Format currency amount to CFA Franc format
 * @param amount - The amount in the smallest currency unit
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
  }).format(amount);
};
