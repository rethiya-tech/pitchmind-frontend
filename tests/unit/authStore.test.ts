import { describe, it, expect, beforeEach, vi } from 'vitest'


describe('authStore', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('initial state is unauthenticated', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })

  it('setAuth stores token and user and sets isAuthenticated true', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    useAuthStore.getState().setAuth(
      'mock.jwt.token',
      { id: 'u1', email: 'a@a.com', name: 'Alice', role: 'user' }
    )
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('mock.jwt.token')
    expect(state.user?.email).toBe('a@a.com')
  })

  it('clearAuth resets to unauthenticated state', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    useAuthStore.getState().setAuth(
      'mock.jwt.token',
      { id: 'u1', email: 'a@a.com', name: 'Alice', role: 'user' }
    )
    useAuthStore.getState().clearAuth()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })

  it('user role is stored correctly for admin', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    useAuthStore.getState().setAuth(
      'admin.token',
      { id: 'a1', email: 'admin@a.com', name: 'Admin', role: 'admin' }
    )
    expect(useAuthStore.getState().user?.role).toBe('admin')
  })

  it('token is never persisted to localStorage', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    useAuthStore.getState().setAuth(
      'secret.token',
      { id: 'u1', email: 'a@a.com', name: 'Alice', role: 'user' }
    )
    expect(localStorage.getItem('token')).toBeNull()
  })
})
