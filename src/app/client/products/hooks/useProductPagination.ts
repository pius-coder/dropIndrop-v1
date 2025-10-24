import { useState, useCallback } from "react";
import { PRODUCTS_QUERY_CONFIG } from "../constants";

/**
 * Custom hook for managing product pagination functionality
 * Single responsibility: Pagination state management
 */
export interface UseProductPaginationReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  resetPage: () => void;
  handlePageChange: (page: number) => void;
}

/**
 * Hook for managing pagination state
 * Follows clean code principles: single responsibility, meaningful naming
 */
export const useProductPagination = (): UseProductPaginationReturn => {
  const [currentPage, setCurrentPage] = useState<number>(
    PRODUCTS_QUERY_CONFIG.DEFAULT_PAGE
  );

  // Reset page to default (used when search changes)
  const resetPage = useCallback(() => {
    setCurrentPage(PRODUCTS_QUERY_CONFIG.DEFAULT_PAGE);
  }, []);

  // Handle page change (called by pagination component)
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    resetPage,
    handlePageChange,
  };
};
