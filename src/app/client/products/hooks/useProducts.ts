import { useQuery } from "@tanstack/react-query";
import { PRODUCTS_QUERY_CONFIG } from "../constants";

// Types for public product data
export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  sku?: string;
  isAvailable: boolean;
  stockQuantity: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: PublicProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Custom hook for fetching products using React Query
 * Single responsibility: Data fetching only, no presentation logic
 */
export const useProductsQuery = (params: ProductsQueryParams) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: (params.page ?? PRODUCTS_QUERY_CONFIG.DEFAULT_PAGE).toString(),
        limit: (params.limit ?? PRODUCTS_QUERY_CONFIG.DEFAULT_LIMIT).toString(),
        ...(params.search && { search: params.search }),
      });

      const response = await fetch(`/api/public/products?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data: ProductsResponse = await response.json();

      if (!data.success) {
        throw new Error("Invalid response format");
      }

      return data.data;
    },
    staleTime: PRODUCTS_QUERY_CONFIG.STALE_TIME, // Using named constant
    retry: PRODUCTS_QUERY_CONFIG.RETRY_COUNT,
  });
};
