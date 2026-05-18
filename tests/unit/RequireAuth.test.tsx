import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN</div>} />
        <Route
          path="/change-password"
          element={<RequireAuth><div>CHANGE_PW</div></RequireAuth>}
        />
        <Route
          path="/dashboard"
          element={<RequireAuth><div>DASHBOARD</div></RequireAuth>}
        />
      </Routes>
    </MemoryRouter>
  )
}

const baseUser: User = { id: 'u1', email: 'a@a.com', name: 'A', role: 'user' }

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ isBootstrapping: false, isAuthenticated: false, user: null, token: null })
  })

  it('redirects unauthenticated users to /login', () => {
    renderAt('/dashboard')
    expect(screen.getByText('LOGIN')).toBeInTheDocument()
  })

  it('renders children for an active authenticated user', () => {
    useAuthStore.setState({ isAuthenticated: true, user: { ...baseUser, status: 'active' } })
    renderAt('/dashboard')
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument()
  })

  it('forces a must_change_password user to /change-password', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { ...baseUser, status: 'active', must_change_password: true },
    })
    renderAt('/dashboard')
    expect(screen.getByText('CHANGE_PW')).toBeInTheDocument()
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument()
  })

  it('does not loop-redirect on the change-password route itself', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { ...baseUser, status: 'active', must_change_password: true },
    })
    renderAt('/change-password-guarded')
    expect(screen.getByText('CHANGE_PW')).toBeInTheDocument()
  })
})
