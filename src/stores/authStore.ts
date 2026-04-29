import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  setBootstrapping: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isBootstrapping: true,
  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
  clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
  setBootstrapping: (v) => set({ isBootstrapping: v }),
}))
