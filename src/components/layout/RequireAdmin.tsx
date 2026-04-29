import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface RequireAdminProps {
  children: React.ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
