import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for managing product search functionality with true debouncing
 * Single responsibility: Search state, debouncing, and form handling
 */
export interface UseProductSearchReturn {
  searchQuery: string;
  debouncedSearchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  clearSearch: () => void;
}

/** Debounce delay in milliseconds for search input */
const DEBOUNCE_DELAY = 300;

/**
 * Hook for managing search state with automatic debouncing
 * Follows clean code principles: single responsibility, meaningful naming
 * Implements proper debouncing to improve user experience
 */
export const useProductSearch = (): UseProductSearchReturn => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounce search query - automatically update after delay
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current !== undefined) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, DEBOUNCE_DELAY) as NodeJS.Timeout;

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current !== undefined) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = undefined;
      }
    };
  }, [searchQuery]);

  // Handle form submission - immediate search execution
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // On form submit, immediately execute search (no debouncing)
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setDebouncedSearchQuery(searchQuery.trim());
    },
    [searchQuery]
  );

  // Clear search functionality
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  return {
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery,
    handleSearch,
    clearSearch,
  };
};
