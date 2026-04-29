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
              to={c.status === 'done' ? `/editor/${c.id}` : c.status === 'generating' ? `/generating/${c.id}` : '/projects'}
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

interface TopbarProps {
  onToggleSidebar?: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="h-14 bg-white border-b border-pm-border flex items-center justify-between px-5 flex-shrink-0">
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
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-pm-muted hover:text-pm-primary transition-colors"
          title="Settings"
        >
          <GearIcon />
        </button>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="w-9 h-9 ml-1 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center hover:bg-[#0F6E56] transition-colors"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
