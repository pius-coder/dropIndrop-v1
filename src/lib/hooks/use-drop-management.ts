import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { DropStatus } from "../../entities/drop/domain/drop";

// Drop schema for API responses
const DropSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  scheduledDate: z.string(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENT", "CANCELLED"]),
  sentAt: z.string().optional(),
  messageId: z.string().optional(),
  createdBy: z.string(),
  products: z.array(
    z.object({
      productId: z.string(),
      sortOrder: z.number(),
    })
  ),
  groups: z.array(
    z.object({
      groupId: z.string(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Product schema for drop forms (minimal info needed for selection)
const ProductForDropSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
});

// WhatsApp Group schema for drop forms
const WhatsAppGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});

// API response schemas
const DropsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    drops: z.array(DropSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

const ProductsResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([
    z.array(ProductForDropSchema), // Direct array response
    z.object({
      // Paginated response
      products: z.array(ProductForDropSchema),
      total: z.number(),
      totalPages: z.number(),
    }),
  ]),
});

const WhatsAppGroupsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    groups: z.array(WhatsAppGroupSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

// Export types
export type Drop = z.infer<typeof DropSchema>;
export type ProductForDrop = z.infer<typeof ProductForDropSchema>;
export type WhatsAppGroup = z.infer<typeof WhatsAppGroupSchema>;
export type DropListResult = {
  drops: Drop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Create drop data type
export type CreateDropData = {
  name?: string;
  scheduledDate: string;
  productIds: string[];
  groupIds: string[];
};

// Update drop data type
export type UpdateDropData = {
  name?: string;
  scheduledDate?: string;
  productIds?: string[];
  groupIds?: string[];
  status?: DropStatus;
};

/**
 * Hook for drop management operations
 * Separates data fetching and business logic from UI components
 */
export function useDropManagement() {
  const queryClient = useQueryClient();

  // Fetch drops
  const dropsQuery = useQuery({
    queryKey: ["drops"],
    queryFn: async () => {
      console.log("🔄 [HOOK] Starting drops fetch...");
      const response = await fetch("/api/admin/drops");
      if (!response.ok) throw new Error("Failed to fetch drops");
      const data = await response.json();
      console.log("📦 [HOOK] Raw API response:", {
        success: data?.success,
        hasData: !!data?.data,
        dataType: typeof data?.data,
        dataKeys: data?.data ? Object.keys(data.data) : "no data",
      });
      const validated = DropsResponseSchema.parse(data);
      console.log("✅ [HOOK] Zod validation passed, returning data");
      return validated.data as DropListResult;
    },
  });

  // Fetch available products for drop creation
  const productsQuery = useQuery({
    queryKey: ["products-for-drop"],
    queryFn: async () => {
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

  // Fetch available WhatsApp groups for drop creation
  const whatsappGroupsQuery = useQuery({
    queryKey: ["whatsapp-groups"],
    queryFn: async (): Promise<WhatsAppGroup[]> => {
      const response = await fetch("/api/admin/whatsapp-groups");
      if (!response.ok) throw new Error("Failed to fetch WhatsApp groups");
      const data = await response.json();
      console.log("📦 [HOOK] WhatsApp groups API response:", {
        success: data?.success,
        hasData: !!data?.data,
        dataType: typeof data?.data,
        dataKeys: data?.data ? Object.keys(data.data) : "no data",
      });

      const validated = WhatsAppGroupsResponseSchema.parse(data);
      // Extract groups array from paginated response
      return validated.data.groups || [];
    },
  });

  // Create drop mutation
  const createDropMutation = useMutation({
    mutationFn: async (dropData: CreateDropData) => {
      const response = await fetch("/api/admin/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dropData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create drop");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
    },
  });

  // Update drop mutation
  const updateDropMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDropData }) => {
      const response = await fetch(`/api/admin/drops/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update drop");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      queryClient.invalidateQueries({ queryKey: ["drop", "analytics"] });
    },
  });

  // Delete drop mutation
  const deleteDropMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/drops/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete drop");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      queryClient.invalidateQueries({ queryKey: ["drop", "analytics"] });
    },
  });

  // Send drop mutation (mark as sent)
  const sendDropMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/drops/${id}/send`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send drop");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      queryClient.invalidateQueries({ queryKey: ["drop", "analytics"] });
    },
  });

  // Get drop analytics
  const analyticsQuery = useQuery({
    queryKey: ["drop-analytics"],
    queryFn: async (): Promise<any> => {
      const response = await fetch("/api/admin/drops/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  return {
    // Data
    drops: dropsQuery.data?.drops || [],
    dropListResult: dropsQuery.data,
    availableProducts: productsQuery.data || [],
    availableGroups: whatsappGroupsQuery.data || [],
    analytics: analyticsQuery.data,
    isLoading:
      dropsQuery.isLoading ||
      productsQuery.isLoading ||
      whatsappGroupsQuery.isLoading,
    isLoadingAnalytics: analyticsQuery.isLoading,
    error: dropsQuery.error || productsQuery.error || whatsappGroupsQuery.error,

    // Mutations
    createDrop: createDropMutation.mutateAsync,
    updateDrop: updateDropMutation.mutateAsync,
    deleteDrop: deleteDropMutation.mutateAsync,
    sendDrop: sendDropMutation.mutateAsync,

    // Mutation states
    isCreating: createDropMutation.isPending,
    isUpdating: updateDropMutation.isPending,
    isDeleting: deleteDropMutation.isPending,
    isSending: sendDropMutation.isPending,
  };
}

/**
 * Hook for individual drop operations (by ID)
 */
export function useDrop(id: string) {
  return useQuery({
    queryKey: ["drop", id],
    queryFn: async (): Promise<Drop> => {
      const response = await fetch(`/api/admin/drops/${id}`);
      if (!response.ok) throw new Error("Failed to fetch drop");
      const data = await response.json();
      return DropSchema.parse(data.data) as Drop;
    },
    enabled: !!id,
  });
}
