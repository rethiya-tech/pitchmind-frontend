import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ChangePasswordPage } from '@/pages/ChangePasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UploadPage } from '@/pages/UploadPage'
import { GeneratingPage } from '@/pages/GeneratingPage'
import { EditorPage } from '@/pages/EditorPage'
import { ExportPage } from '@/pages/ExportPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { GenerateTemplatePage } from '@/pages/GenerateTemplatePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAuditLogPage } from '@/pages/admin/AdminAuditLogPage'
import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage'
import { AdminTemplatesPage } from '@/pages/admin/AdminTemplatesPage'
import { ShareViewPage } from '@/pages/ShareViewPage'

import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { RequireAdmin } from '@/components/layout/RequireAdmin'
import api from '@/services/api'
import type { TokenResponse } from '@/types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setBootstrapping = useAuthStore((s) => s.setBootstrapping)

  useEffect(() => {
    if (isAuthenticated) { setBootstrapping(false); return }
    api.post<TokenResponse>('/auth/refresh')
      .then(({ data }) => setAuth(data.access_token, data.user))
      .catch(() => {})
      .finally(() => setBootstrapping(false))
  }, [])

  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/change-password" element={
              <RequireAuth><ChangePasswordPage /></RequireAuth>
            } />

            <Route path="/share/:token" element={<ShareViewPage />} />
            <Route path="/generating/:id" element={<GeneratingPage />} />
            <Route path="/editor/:id" element={
              <RequireAuth><EditorPage /></RequireAuth>
            } />
            <Route path="/export/:id" element={
              <RequireAuth><ExportPage /></RequireAuth>
            } />

            <Route element={<RequireAuth><AppShell /></RequireAuth>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/generate-template" element={<GenerateTemplatePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
              <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
              <Route path="/admin/audit-log" element={<RequireAdmin><AdminAuditLogPage /></RequireAdmin>} />
              <Route path="/admin/projects" element={<RequireAdmin><AdminProjectsPage /></RequireAdmin>} />
              <Route path="/admin/templates" element={<RequireAdmin><AdminTemplatesPage /></RequireAdmin>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthBootstrap>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  )
}
