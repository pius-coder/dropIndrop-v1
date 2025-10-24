"use client";

import React from "react";
import { useEffect } from "react";
import {
  ProductsHeader,
  ProductsGrid,
  ProductsGridSkeleton,
  EmptyProductsState,
  ErrorProductsState,
} from "./_components";
import { useProductsQuery } from "./hooks/useProducts";
import { useProductSearch } from "./hooks/useProductSearch";
import { useProductPagination } from "./hooks/useProductPagination";
import { useProductSelection } from "./hooks/useProductSelection";

/**
 * Client products browsing page
 * Public page where clients can view available products before authentication
 *
 * Follows Single Responsibility Principle with focused custom hooks:
 * - useProductSearch: Search state and debouncing
 * - useProductPagination: Pagination state management
 * - useProductSelection: Product click handling and navigation
 */
export default function ClientProductsPage() {
  // Separate concerns using focused custom hooks
  const { searchQuery, debouncedSearchQuery, setSearchQuery, handleSearch } =
    useProductSearch();

  const { currentPage, handlePageChange, resetPage } = useProductPagination();

  const { handleProductClick } = useProductSelection();

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useProductsQuery({
    page: currentPage,
    limit: 12,
    search: debouncedSearchQuery,
  });

  const products = data?.products ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // Reset page when search changes (to show results from first page)
  useEffect(() => {
    if (debouncedSearchQuery) {
      resetPage();
    }
  }, [debouncedSearchQuery, resetPage]);

  // Show error state if there's an error and not loading
  if (queryError && !isLoading) {
    return (
      <ErrorProductsState
        error="Erreur lors du chargement des produits"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ProductsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
      />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <ProductsGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyProductsState searchQuery={debouncedSearchQuery} />
        ) : (
          <ProductsGrid
            products={products}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onProductClick={handleProductClick}
          />
        )}
      </div>
    </div>
  );
}
