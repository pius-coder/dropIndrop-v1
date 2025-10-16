/**
 * Auth Login - React Hook
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "../api/auth-login-api";
import { useAuthStore } from "@/shared/store/auth-store";
import type { LoginRequest } from "../model/types";

export function useLogin() {
  const router = useRouter();
  const { login: setAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.admin, data.token);
      
      toast.success("Connexion réussie", {
        description: `Bienvenue ${data.admin.name}`,
      });

      router.push("/admin");
    },
    onError: (error: Error) => {
      toast.error("Erreur de connexion", {
        description: error.message || "Email ou mot de passe incorrect",
      });
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
