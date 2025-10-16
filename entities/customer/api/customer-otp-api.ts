/**
 * Customer OTP API Mutations
 * React Query mutations for customer OTP operations
 */

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { SendOtpInput, VerifyOtpInput } from "@/entities/customer/model/otp-types";

/**
 * Send OTP mutation
 */
export function useSendOTPMutation() {
  return useMutation({
    mutationFn: async (data: SendOtpInput) => {
      return apiClient.post("/customers/send-otp", data);
    },
  });
}

/**
 * Verify OTP mutation
 */
export function useVerifyOTPMutation() {
  return useMutation({
    mutationFn: async (data: VerifyOtpInput) => {
      return apiClient.post("/customers/verify-otp", data);
    },
  });
}

/**
 * Resend OTP mutation
 */
export function useResendOTPMutation() {
  return useMutation({
    mutationFn: async (data: { phone: string; name: string; password: string }) => {
      return apiClient.post("/customers/send-otp", data);
    },
  });
}
