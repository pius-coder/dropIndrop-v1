import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ImageFilters,
  PaginationOptions,
  CreateImageData,
  UpdateImageData,
  ImageStats,
  ImageListResult,
} from "@/lib/schemas/image-schema";

/**
 * Hook for fetching images with filtering and pagination
 */
export function useImages(
  filters?: ImageFilters,
  pagination?: PaginationOptions
) {
  return useQuery({
    queryKey: ["images", filters, pagination],
    queryFn: async (): Promise<ImageListResult> => {
      const params = new URLSearchParams();

      if (pagination) {
        params.append("page", pagination.page.toString());
        params.append("limit", pagination.limit.toString());
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`/api/admin/images?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch images");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch images");
      }

      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching a single image by ID
 */
export function useImage(imageId: string) {
  return useQuery({
    queryKey: ["image", imageId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/images/${imageId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch image");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch image");
      }

      return data.data;
    },
    enabled: !!imageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for searching images
 */
export function useImageSearch(
  query: string,
  filters?: ImageFilters,
  pagination?: PaginationOptions
) {
  return useQuery({
    queryKey: ["image-search", query, filters, pagination],
    queryFn: async (): Promise<ImageListResult> => {
      const params = new URLSearchParams();
      params.append("search", query);

      if (pagination) {
        params.append("page", pagination.page.toString());
        params.append("limit", pagination.limit.toString());
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`/api/admin/images?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search images");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to search images");
      }

      return data.data;
    },
    enabled: !!query.trim(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching image statistics
 */
export function useImageStats() {
  return useQuery({
    queryKey: ["image-stats"],
    queryFn: async (): Promise<ImageStats> => {
      const response = await fetch("/api/admin/images/stats");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch image statistics");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch image statistics");
      }

      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for uploading images
 */
export function useImageUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      metadata,
    }: {
      files: File[];
      metadata?: {
        categoryId?: string;
        tags?: string[];
        isPublic?: boolean;
      };
    }) => {
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      if (metadata) {
        if (metadata.categoryId) {
          formData.append("categoryId", metadata.categoryId);
        }
        if (metadata.tags) {
          formData.append("tags", metadata.tags.join(","));
        }
        if (metadata.isPublic !== undefined) {
          formData.append("isPublic", metadata.isPublic.toString());
        }
      }

      const response = await fetch("/api/admin/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload images");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to upload images");
      }

      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch image-related queries
      queryClient.invalidateQueries({ queryKey: ["images"] });
      queryClient.invalidateQueries({ queryKey: ["image-stats"] });
      queryClient.invalidateQueries({ queryKey: ["image-search"] });
    },
  });
}

/**
 * Hook for updating an image
 */
export function useImageUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageId,
      data,
    }: {
      imageId: string;
      data: UpdateImageData;
    }) => {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update image");
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Failed to update image");
      }

      return responseData.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific image in cache
      queryClient.setQueryData(["image", variables.imageId], data);
      // Invalidate image lists
      queryClient.invalidateQueries({ queryKey: ["images"] });
      queryClient.invalidateQueries({ queryKey: ["image-stats"] });
      queryClient.invalidateQueries({ queryKey: ["image-search"] });
    },
  });
}

/**
 * Hook for deleting an image
 */
export function useImageDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete image");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete image");
      }

      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch image-related queries
      queryClient.invalidateQueries({ queryKey: ["images"] });
      queryClient.invalidateQueries({ queryKey: ["image-stats"] });
      queryClient.invalidateQueries({ queryKey: ["image-search"] });
    },
  });
}

/**
 * Hook for batch operations on images
 */
export function useImageBatchOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageIds,
      operation,
    }: {
      imageIds: string[];
      operation:
        | "delete"
        | "activate"
        | "deactivate"
        | "makePublic"
        | "makePrivate";
    }) => {
      const response = await fetch("/api/admin/images/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageIds,
          operation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to perform batch operation");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to perform batch operation");
      }

      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch image-related queries
      queryClient.invalidateQueries({ queryKey: ["images"] });
      queryClient.invalidateQueries({ queryKey: ["image-stats"] });
      queryClient.invalidateQueries({ queryKey: ["image-search"] });
    },
  });
}

/**
 * Hook for fetching image categories
 */
export function useImageCategories() {
  return useQuery({
    queryKey: ["image-categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/images/categories");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch image categories");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch image categories");
      }

      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
