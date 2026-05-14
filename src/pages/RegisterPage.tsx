import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const [registeredOk, setRegisteredOk] = useState(false)

  const registerMutation = useMutation({
    mutationFn: async () => {
      const regRes = await api.post('/auth/register', { name, email, password })
      if (regRes.status === 201) setRegisteredOk(true)
      const loginForm = new URLSearchParams()
      loginForm.append('username', email)
      loginForm.append('password', password)
      const loginRes = await api.post<TokenResponse>('/auth/login', loginForm, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      return loginRes.data
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      navigate('/dashboard', { replace: true })
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: unknown } }; request?: unknown }
      // No response at all = network/timeout error (e.g. server cold start)
      if (!axiosErr.response) {
        if (registeredOk) {
          setServerError('Account created! The server is warming up — please sign in.')
          setTimeout(() => navigate('/login'), 2500)
        } else {
          setServerError('Cannot reach the server. Please wait a moment and try again.')
        }
        return
      }
      const detail = axiosErr.response.data?.detail
      const code = (detail as { code?: string })?.code
      const msg = typeof detail === 'string' ? detail : (detail as { message?: string })?.message
      if (code === 'EMAIL_EXISTS') {
        setServerError('This email is already registered. Please sign in instead.')
      } else {
        setServerError(msg ?? 'Registration failed. Please try again.')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Name is required.'
    if (!email) newErrors.email = 'Email is required.'
    if (!password) newErrors.password = 'Password is required.'
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }
    setErrors(newErrors)
    setServerError('')
    if (Object.keys(newErrors).length > 0) return
    registerMutation.mutate()
  }

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: {
      type?: string
      placeholder?: string
      autoComplete?: string
      error?: string
      showToggle?: boolean
      show?: boolean
      onToggle?: () => void
    } = {}
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-pm-primary">{label}</label>
      <div className="relative">
        <input
          type={opts.showToggle ? (opts.show ? 'text' : 'password') : (opts.type ?? 'text')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={opts.placeholder}
          autoComplete={opts.autoComplete}
          className="w-full border border-pm-border rounded-lg px-4 py-3 text-sm text-pm-primary bg-white placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal focus:border-transparent transition-colors pr-11"
        />
        {opts.showToggle && (
          <button
            type="button"
            onClick={opts.onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-muted hover:text-pm-primary transition-colors"
            tabIndex={-1}
          >
            <EyeIcon open={!!opts.show} />
          </button>
        )}
      </div>
      {opts.error && <p className="text-xs text-pm-danger">{opts.error}</p>}
    </div>
  )

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left: Form ── */}
      <div className="flex flex-col justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm mx-auto space-y-7">
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
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-pm-muted">Get started free</p>
            <h1 className="text-3xl font-extrabold text-pm-primary leading-tight">
              Join{' '}
              <span className="text-pm-teal">PitchMind</span>
            </h1>
            <p className="text-sm text-pm-muted">Turn your first document into a polished deck today.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {field('Full name', name, setName, {
              placeholder: 'Your name',
              autoComplete: 'name',
              error: errors.name,
            })}
            {field('Work email', email, setEmail, {
              type: 'email',
              placeholder: 'founder@pitchmind.ai',
              autoComplete: 'email',
              error: errors.email,
            })}
            {field('Password', password, setPassword, {
              placeholder: '••••••••',
              autoComplete: 'new-password',
              error: errors.password,
              showToggle: true,
              show: showPassword,
              onToggle: () => setShowPassword(v => !v),
            })}
            {field('Confirm password', confirmPassword, setConfirmPassword, {
              placeholder: '••••••••',
              autoComplete: 'new-password',
              error: errors.confirmPassword,
              showToggle: true,
              show: showConfirm,
              onToggle: () => setShowConfirm(v => !v),
            })}

            {serverError && <p className="text-sm text-pm-danger">{serverError}</p>}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-pm-teal hover:bg-pm-teal-hover disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {registerMutation.isPending ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <>Create account →</>
              )}
            </button>
          </form>

          <p className="text-sm text-pm-muted text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-pm-teal font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Marketing panel ── */}
      <AuthPanel />
    </div>
  )
}
