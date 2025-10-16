/**
 * Auth Login - React Hook
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "../api/auth-login-api";
import { useAuthStore } from "@/shared/store/auth-store";
import { toast } from "sonner";
import { ApiError } from "@/shared/api/client";

export function useLogin(redirectTo: string = "/admin/dashboard") {
  const router = useRouter();
  const { login: setAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data: any) => {
      // Check if response contains an error
      if (data.error) {
        if (data.status === 401) {
          toast.error("Erreur de connexion", {
            description: "Email ou mot de passe incorrect",
          });
        } else if (data.status === 403) {
          toast.error("Compte désactivé", {
            description: data.message || "Votre compte a été désactivé.",
          });
        } else {
          toast.error("Erreur de connexion", {
            description: data.message || "Une erreur est survenue",
          });
        }
        return;
      }

      // Success case - store auth data
      setAuth(data.admin, data.token);

      // Show success message
      toast.success("Connexion réussie!", {
        description: `Bienvenue ${data.admin.name}`,
      });

      // Redirect to intended page or dashboard
      router.push(redirectTo);
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      
      // Only network errors (500+) reach here now
      if (error instanceof ApiError) {
        toast.error("Erreur serveur", {
          description: error.message || "Le serveur ne répond pas correctement.",
        });
      } else {
        toast.error("Erreur de connexion", {
          description: "Impossible de se connecter au serveur. Vérifiez votre connexion.",
        });
      }
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
