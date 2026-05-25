import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { cn } from '@/utils/cn'
import { useThemeStore } from '@/stores/themeStore'

// ── Labelled input ────────────────────────────────────────────────────────────
function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-pm-muted uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full border border-pm-border rounded-xl px-4 py-2.5 text-sm text-pm-primary bg-pm-surface placeholder:text-pm-subtle focus:outline-none focus:ring-2 focus:ring-pm-teal transition"
      />
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function Card({
  title,
  subtitle,
  icon,
  children,
  barGradient = 'linear-gradient(180deg, #0F6E56 0%, #0A9B6E 100%)',
}: {
  title: string
  subtitle?: string
  icon: React.ReactNode
  children: React.ReactNode
  barGradient?: string
}) {
  return (
    <motion.div
      className="relative bg-pm-surface/85 backdrop-blur-sm rounded-2xl border border-pm-border/70 overflow-hidden shadow-card"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="absolute left-0 inset-y-0 w-[3px]" style={{ background: barGradient }} />
      <div className="flex items-center gap-3 px-6 py-4 border-b border-pm-border/60">
        <div className="w-8 h-8 rounded-lg bg-pm-teal-light flex items-center justify-center text-pm-teal flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-pm-primary">{title}</p>
          {subtitle && <p className="text-xs text-pm-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  )
}

// ── Theme toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const theme = useThemeStore(s => s.theme)
  const setTheme = useThemeStore(s => s.setTheme)

  const options: Array<{ value: 'light' | 'dark'; label: string; icon: React.ReactNode }> = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M16 11.5A7 7 0 018.5 4a7 7 0 105.5 11.5 5.5 5.5 0 002 -4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm font-semibold text-pm-primary">Theme</p>
        <p className="text-xs text-pm-muted mt-0.5">Choose how PitchMind looks to you</p>
      </div>
      <div
        className="relative inline-flex p-1 rounded-full bg-pm-surface-2 border border-pm-border"
        role="radiogroup"
        aria-label="Theme"
      >
        {options.map(opt => {
          const active = theme === opt.value
          const isDark = opt.value === 'dark'
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300',
                active
                  ? isDark
                    // Dark-active: champagne gold pill — premium luxury cue
                    ? 'bg-gradient-to-r from-[#E5B650] to-[#F2C870] text-[#08120D] shadow-[0_4px_16px_-4px_rgba(229,182,80,0.5)]'
                    // Light-active: teal pill
                    : 'bg-gradient-to-r from-pm-teal to-pm-teal-gradient-end text-white shadow-[0_4px_16px_-4px_rgba(15,110,86,0.5)]'
                  : 'text-pm-muted hover:text-pm-primary'
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [pwError, setPwError] = useState('')

  const changePwMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
    },
    onSuccess: () => {
      toast.success('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNew('')
      setPwError('')
    },
    onError: () => {
      setPwError('Incorrect current password. Please try again.')
    },
  })

  const handleChangePw = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) { setPwError('All fields are required.'); return }
    if (newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (newPassword !== confirmNew) { setPwError('New passwords do not match.'); return }
    setPwError('')
    changePwMutation.mutate()
  }

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight gradient-heading">Settings</h1>
        <p className="text-sm text-pm-muted mt-0.5">Manage your account and preferences</p>
      </div>

      {/* ── Appearance + Security + Danger ── */}
      <div className="space-y-6 max-w-3xl">

      {/* ── Appearance ── */}
      <Card
        title="Appearance"
        subtitle="Customize how PitchMind looks"
        icon={
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 2.5v15M2.5 10h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        }
      >
        <ThemeToggle />
      </Card>

      {/* ── Security ── */}
      <Card
        title="Security"
        subtitle="Update your password"
        icon={
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        }
      >
        <form onSubmit={handleChangePw} className="space-y-4">
          <Field
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <Field
              label="Confirm New Password"
              type="password"
              value={confirmNew}
              onChange={setConfirmNew}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>

          {pwError && (
            <div className="flex items-center gap-2 bg-pm-danger/10 border border-pm-danger/30 rounded-xl px-4 py-2.5">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-pm-danger flex-shrink-0">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-pm-danger font-medium">{pwError}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              loading={changePwMutation.isPending}
              disabled={!currentPassword || !newPassword || !confirmNew}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Danger zone ── */}
      <Card
        title="Danger Zone"
        subtitle="Irreversible account actions"
        barGradient="linear-gradient(180deg, #DC2626 0%, #EF4444 100%)"
        icon={
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-pm-danger">
            <path d="M10 3L2 17h16L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 8v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-pm-primary">Delete Account</p>
            <p className="text-xs text-pm-muted mt-0.5">Permanently remove your account and all data. This cannot be undone.</p>
          </div>
          <button
            type="button"
            className={cn(
              'flex-shrink-0 ml-6 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
              'text-pm-danger border-pm-danger/30 bg-pm-surface hover:bg-pm-danger/10'
            )}
            onClick={() => toast.error('Please contact support to delete your account.')}
          >
            Delete Account
          </button>
        </div>
      </Card>

      </div>{/* end Security + Danger */}

    </div>
  )
}
