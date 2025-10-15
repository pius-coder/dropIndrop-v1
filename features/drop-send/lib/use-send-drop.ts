/**
 * Drop Send - React Query Hooks
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendDrop, getSendProgress, cancelSend } from "../api/drop-send-api";
import { useValidateDrop } from "@/features/drop-validate";

/**
 * Hook to send drop
 */
export function useSendDrop(dropId: string) {
  const queryClient = useQueryClient();
  const { data: validation } = useValidateDrop(dropId, false);

  const sendMutation = useMutation({
    mutationFn: (force: boolean = false) => sendDrop(dropId, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      queryClient.invalidateQueries({ queryKey: ["drop", dropId] });
    },
  });

  return {
    send: sendMutation.mutate,
    isLoading: sendMutation.isPending,
    error: sendMutation.error,
    data: sendMutation.data,
    canSend: validation?.canSend ?? false,
    validation,
  };
}

/**
 * Hook to get send progress (for real-time updates)
 */
export function useSendProgress(dropId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ["drop-progress", dropId],
    queryFn: () => getSendProgress(dropId),
    enabled: enabled && !!dropId,
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

/**
 * Hook to cancel send
 */
export function useCancelSend(dropId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelSend(dropId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      queryClient.invalidateQueries({ queryKey: ["drop-progress", dropId] });
    },
  });
}
