import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (isBootstrapping) return null
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  // Admin-onboarded users must set their own password before using the app.
  if (user?.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  return <>{children}</>
}
