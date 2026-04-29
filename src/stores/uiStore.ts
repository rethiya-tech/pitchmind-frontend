import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UiState {
  sidebarOpen: boolean
  modals: Record<string, boolean>
  toasts: Toast[]
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  openModal: (id: string) => void
  closeModal: (id: string) => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  modals: {},
  toasts: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: true } })),
  closeModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: false } })),
  addToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
