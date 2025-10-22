import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

// Product schema for API responses
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stockQuantity: z.number(),
  images: z.array(z.string()),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Category schema for API responses
const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

// API response schemas - handle both direct array and paginated response
const ProductsResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([
    z.array(ProductSchema), // Direct array response
    z.object({ // Paginated response
      products: z.array(ProductSchema),
      total: z.number(),
      totalPages: z.number(),
    })
  ]),
});

const CategoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CategorySchema),
});

// Export types
export type Product = z.infer<typeof ProductSchema>;
export type Category = z.infer<typeof CategorySchema>;

/**
 * Hook for product management operations
 * Separates data fetching and business logic from UI components
 */
export function useProductManagement() {
  const queryClient = useQueryClient();

  // Fetch products
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch("/api/admin/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      const validated = ProductsResponseSchema.parse(data);
      // The API returns paginated data, so we need to extract the products array
      return Array.isArray(validated.data)
        ? validated.data
        : validated.data.products || [];
    },
  });

  // Fetch categories for filtering
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const validated = CategoriesResponseSchema.parse(data);
      return validated.data;
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    // Data
    products: productsQuery.data || [],
    categories: categoriesQuery.data || [],
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    error: productsQuery.error || categoriesQuery.error,

    // Mutations
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,

    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
}
