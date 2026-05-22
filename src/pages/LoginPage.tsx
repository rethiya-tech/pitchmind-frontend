import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import type { TokenResponse } from '@/types'
import { AuthPanel } from '@/components/auth/AuthPanel'

function LogoIcon() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-pm-teal flex-shrink-0">
      <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
        <rect x="2" y="1" width="10" height="13" rx="1.5" fill="white" fillOpacity="0.25" />
        <rect x="1" y="2" width="10" height="13" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="0" y="3" width="12" height="14" rx="2" fill="white" />
        <rect x="2.5" y="6" width="7" height="1.2" rx="0.6" fill="#0F6E56" />
        <rect x="2.5" y="8.5" width="5" height="1.2" rx="0.6" fill="#0F6E56" fillOpacity="0.5" />
        <rect x="2.5" y="11" width="6" height="1.2" rx="0.6" fill="#0F6E56" fillOpacity="0.5" />
      </svg>
    </span>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 3l14 14M8.5 8.6A2.5 2.5 0 0011.4 11.5M6.5 6.6C4.3 7.8 2.5 10 2.5 10s3 6 7.5 6c1.7 0 3.2-.6 4.5-1.5M10 4c4.5 0 7.5 6 7.5 6a13 13 0 01-2 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [serverError, setServerError] = useState('')

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const loginMutation = useMutation({
    mutationFn: async () => {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)
      const { data } = await api.post<TokenResponse>('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      return data
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      if (data.user.must_change_password) {
        navigate('/change-password', { replace: true })
        return
      }
      // Admins (the SaaS provider) land on the Admin console, not the
      // end-user dashboard — unless they followed a specific deep link.
      if (data.user.role === 'admin' && (!from || from === '/dashboard')) {
        navigate('/admin', { replace: true })
        return
      }
      navigate(from, { replace: true })
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      const code = (detail as { code?: string })?.code
      const msg = typeof detail === 'string' ? detail : (detail as { message?: string })?.message
      const byCode: Record<string, string> = {
        ACCOUNT_PENDING: 'Your account is awaiting admin approval. Please check back later.',
        ACCOUNT_REJECTED: 'Your account request was declined. Contact support for help.',
        ACCOUNT_SUSPENDED: 'Your account has been suspended. Contact support for help.',
      }
      setServerError(
        (code && byCode[code]) || msg || 'Invalid email or password. Please try again.'
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')
    setServerError('')

    let hasError = false
    if (!email) { setEmailError('Enter your email address.'); hasError = true }
    if (!password) { setPasswordError('Enter your password.'); hasError = true }
    if (hasError) return

    loginMutation.mutate()
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left: Form ── */}
      <div className="flex flex-col justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm mx-auto space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <LogoIcon />
            <div>
              <span className="text-lg font-extrabold text-pm-teal tracking-tight leading-none">PitchMind</span>
              <p className="text-[10px] font-medium text-pm-muted leading-none mt-0.5 tracking-widest uppercase">AI · Phase 1</p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-pm-muted">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-pm-primary leading-tight">
              Sign in to{' '}
              <span className="text-pm-teal">PitchMind</span>
            </h1>
            <p className="text-sm text-pm-muted">Continue turning documents into beautiful decks.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-pm-primary">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@pitchmind.ai"
                autoComplete="email"
                className="w-full border border-pm-border rounded-lg px-4 py-3 text-sm text-pm-primary bg-white placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal focus:border-transparent transition-colors"
              />
              {emailError && <p className="text-xs text-pm-danger">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-pm-primary">Password</label>
                <span className="text-xs font-medium text-pm-teal cursor-pointer hover:underline">Forgot?</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-pm-border rounded-lg px-4 py-3 pr-11 text-sm text-pm-primary bg-white placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-muted hover:text-pm-primary transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {passwordError && <p className="text-xs text-pm-danger">{passwordError}</p>}
            </div>

            {serverError && <p className="text-sm text-pm-danger">{serverError}</p>}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full disabled:opacity-60 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)', boxShadow: '0 4px 16px rgba(15,110,86,0.28)' }}
            >
              {loginMutation.isPending ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <>Sign in →</>
              )}
            </button>
          </form>

          <p className="text-sm text-pm-muted text-center">
            New to PitchMind?{' '}
            <Link to="/register" className="text-pm-teal font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Marketing panel ── */}
      <AuthPanel />
    </div>
  )
}
