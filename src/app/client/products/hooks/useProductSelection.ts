import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Custom hook for managing product selection and navigation
 * Single responsibility: Product click handling and routing
 */
export interface UseProductSelectionReturn {
  handleProductClick: (productId: string) => void;
}

/**
 * Hook for managing product selection and navigation
 * Follows clean code principles: single responsibility, meaningful naming
 */
export const useProductSelection = (): UseProductSelectionReturn => {
  const router = useRouter();

  // Handle product click - navigate to product detail page
  const handleProductClick = useCallback(
    (productId: string) => {
      // Navigate to product detail page (authentication will be handled there)
      router.push(`/products/${productId}`);
    },
    [router]
  );

  return {
    handleProductClick,
  };
};
