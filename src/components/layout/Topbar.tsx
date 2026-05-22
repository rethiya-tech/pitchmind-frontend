import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import type { ConversionListResponse } from '@/types'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 16.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M8.325 2.317a1.75 1.75 0 013.35 0l.14.493a1.25 1.25 0 001.756.74l.458-.228a1.75 1.75 0 012.372 2.372l-.228.458a1.25 1.25 0 00.74 1.756l.493.14a1.75 1.75 0 010 3.35l-.493.14a1.25 1.25 0 00-.74 1.756l.228.458a1.75 1.75 0 01-2.372 2.372l-.458-.228a1.25 1.25 0 00-1.756.74l-.14.493a1.75 1.75 0 01-3.35 0l-.14-.493a1.25 1.25 0 00-1.756-.74l-.458.228a1.75 1.75 0 01-2.372-2.372l.228-.458a1.25 1.25 0 00-.74-1.756l-.493-.14a1.75 1.75 0 010-3.35l.493-.14a1.25 1.25 0 00.74-1.756l-.228-.458a1.75 1.75 0 012.372-2.372l.458.228a1.25 1.25 0 001.756-.74l.14-.493z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function statusDot(status: string) {
  const map: Record<string, string> = {
    done: 'bg-green-500',
    generating: 'bg-blue-500',
    failed: 'bg-red-500',
    pending: 'bg-gray-400',
    cancelled: 'bg-gray-300',
  }
  return map[status] ?? 'bg-gray-400'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    done: 'Ready',
    generating: 'Generating…',
    failed: 'Failed',
    pending: 'Pending',
    cancelled: 'Cancelled',
  }
  return map[status] ?? status
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data } = useQuery<ConversionListResponse>({
    queryKey: ['conversions'],
    queryFn: async () => (await api.get('/conversions')).data,
    staleTime: 30_000,
  })

  const items = (data?.items ?? []).slice(0, 8)

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-pm-border shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-pm-border">
        <span className="text-sm font-bold text-pm-primary">Notifications</span>
        {items.length > 0 && (
          <span className="text-xs font-semibold text-pm-teal bg-[#E1F5EE] px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-pm-border">
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-pm-muted">No activity yet</div>
        ) : (
          items.map((c) => (
            <Link
              key={c.id}
              to={c.status === 'done' && c.id ? `/editor/${c.id}` : c.status === 'generating' && c.id ? `/generating/${c.id}` : '/projects'}
              onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${statusDot(c.status)}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-pm-primary truncate">
                  {c.original_filename ?? 'Untitled'}
                </p>
                <p className="text-xs text-pm-muted mt-0.5">{statusLabel(c.status)}</p>
              </div>
              <span className="text-xs text-pm-muted flex-shrink-0 mt-0.5">
                {c.created_at ? formatTimeAgo(c.created_at) : ''}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-pm-border bg-[#F9FAFB]">
        <Link
          to="/projects"
          onClick={onClose}
          className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover transition-colors"
        >
          View all projects →
        </Link>
      </div>
    </div>
  )
}

function AdminPendingPanel({ onClose }: { onClose: () => void }) {
  const { data } = useQuery<{ items: { id: string; email: string; name: string | null }[]; total: number }>({
    queryKey: ['admin-pending-list'],
    queryFn: async () =>
      (await api.get('/admin/users', { params: { status: 'pending', page_size: 8 } })).data,
    staleTime: 15_000,
  })
  const items = data?.items ?? []

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-pm-border shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-pm-border">
        <span className="text-sm font-bold text-pm-primary">Pending approvals</span>
        {items.length > 0 && (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {data?.total}
          </span>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-pm-border">
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-pm-muted">No sign-ups awaiting review</div>
        ) : (
          items.map((u) => (
            <Link
              key={u.id}
              to="/admin/users"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
            >
              <span className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 bg-amber-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-pm-primary truncate">{u.name ?? u.email}</p>
                <p className="text-xs text-pm-muted truncate">{u.email}</p>
              </div>
            </Link>
          ))
        )}
      </div>
      <div className="px-4 py-2.5 border-t border-pm-border bg-[#F9FAFB]">
        <Link to="/admin/users" onClick={onClose} className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover transition-colors">
          Review all users →
        </Link>
      </div>
    </div>
  )
}

interface TopbarProps {
  onToggleSidebar?: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setAccountOpen(false)
    try { await api.post('/auth/logout') } catch { /* ignore */ }
    clearAuth()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-pm-border/60 flex items-center justify-between px-5 flex-shrink-0 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-pm-muted hover:text-pm-primary transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Right: icons + avatar */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-pm-muted hover:text-pm-primary transition-colors"
          >
            <BellIcon />
          </button>
          {notifOpen && (
            user?.role === 'admin'
              ? <AdminPendingPanel onClose={() => setNotifOpen(false)} />
              : <NotificationPanel onClose={() => setNotifOpen(false)} />
          )}
        </div>

        <button
          onClick={() => navigate('/settings', { replace: true })}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-pm-muted hover:text-pm-primary transition-colors"
          title="Settings"
        >
          <GearIcon />
        </button>
        <div className="relative ml-1" ref={accountRef}>
          <button
            onClick={() => setAccountOpen((o) => !o)}
            title="Account"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            className="w-9 h-9 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center hover:bg-[#0F6E56] transition-colors"
          >
            {initials}
          </button>
          {accountOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-pm-border shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-pm-border">
                <p className="text-sm font-bold text-pm-primary truncate">{user?.name ?? 'Account'}</p>
                <p className="text-xs text-pm-muted truncate">{user?.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={() => { setAccountOpen(false); navigate('/profile', { replace: true }) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-pm-primary hover:bg-[#FAFAFA] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Profile
              </button>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-pm-border"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M8 5V3.5A1.5 1.5 0 019.5 2h6A1.5 1.5 0 0117 3.5v13a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 018 16.5V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M11 10H2m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
