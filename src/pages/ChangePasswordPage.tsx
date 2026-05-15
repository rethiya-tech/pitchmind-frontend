import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import type { User } from '@/types'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      await api.patch('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      const { data } = await api.get<User>('/users/me')
      return data
    },
    onSuccess: (user) => {
      // Token is unchanged; refresh the stored user so the guard clears.
      if (token) setAuth(token, user)
      navigate('/dashboard', { replace: true })
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      const msg = typeof detail === 'string' ? detail : (detail as { message?: string })?.message
      setError(msg ?? 'Could not change password. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    mutation.mutate()
  }

  const inputCls =
    'w-full border border-pm-border rounded-lg px-4 py-3 text-sm text-pm-primary bg-white placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal focus:border-transparent transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center bg-pm-app px-6">
      <div className="w-full max-w-sm bg-pm-surface border border-pm-border rounded-xl p-8 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-pm-primary">Set a new password</h1>
          <p className="text-sm text-pm-muted">
            Your account was created with a temporary password. Choose a new one to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-pm-primary">Temporary password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-pm-primary">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-pm-primary">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={inputCls}
            />
          </div>

          {error && <p className="text-sm text-pm-danger">{error}</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-pm-teal hover:bg-pm-teal-hover disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition-colors"
          >
            {mutation.isPending ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  )
}
