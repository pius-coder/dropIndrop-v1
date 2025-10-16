/**
 * Auth Store - User authentication state
 * 
 * Features:
 * - Persisted to localStorage
 * - Type-safe with TypeScript
 * - Auto-hydrates on app start
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "DELIVERY_MANAGER" | "SUPPORT";
}

interface AuthState {
  user: Admin | null;
  token: string | null;

  // Actions
  login: (user: Admin, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: Admin["role"]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: (user, token) => set({ user, token }),
      
      logout: async () => {
        // Call logout API to clear cookie
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
          console.error("Logout error:", error);
        }
        // Clear client state
        set({ user: null, token: null });
      },
      
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },

      hasRole: (role) => {
        const state = get();
        if (!state.user) return false;
        return state.user.role === role || state.user.role === "SUPER_ADMIN";
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
