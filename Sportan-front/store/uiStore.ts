import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface UIState {
  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string | null;
  
  // Modal states
  activeModal: string | null;
  modalData: Record<string, unknown>;
  
  // Toast notifications
  toasts: Toast[];
  
  // Bottom sheet
  isBottomSheetOpen: boolean;
  bottomSheetContent: string | null;
  
  // Actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  openBottomSheet: (content: string) => void;
  closeBottomSheet: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isGlobalLoading: false,
  loadingMessage: null,
  activeModal: null,
  modalData: {},
  toasts: [],
  isBottomSheetOpen: false,
  bottomSheetContent: null,

  // Actions
  setGlobalLoading: (loading, message) => set({
    isGlobalLoading: loading,
    loadingMessage: message || null,
  }),

  openModal: (modalId, data = {}) => set({
    activeModal: modalId,
    modalData: data,
  }),

  closeModal: () => set({
    activeModal: null,
    modalData: {},
  }),

  showToast: (toast) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 4000,
      ...toast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearToasts: () => set({ toasts: [] }),

  openBottomSheet: (content) => set({
    isBottomSheetOpen: true,
    bottomSheetContent: content,
  }),

  closeBottomSheet: () => set({
    isBottomSheetOpen: false,
    bottomSheetContent: null,
  }),
}));

export default useUIStore;

