/**
 * UI Store - Temporary UI state
 * 
 * Features:
 * - Not persisted (temporary state)
 * - Modal management
 * - Toast notifications
 * - Loading states
 */

import { create } from "zustand";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  isOpen: boolean;
  data?: unknown;
}

interface UIState {
  // Toasts
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;

  // Modals
  modals: Record<string, Modal>;
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;

  // Global loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Toasts
  toasts: [],

  addToast: (type, message, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, message, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  // Modals
  modals: {},

  openModal: (id, data) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { id, isOpen: true, data },
      },
    }));
  },

  closeModal: (id) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { ...state.modals[id], isOpen: false },
      },
    }));
  },

  isModalOpen: (id) => {
    const modals = get().modals;
    return modals[id]?.isOpen || false;
  },

  // Global loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
