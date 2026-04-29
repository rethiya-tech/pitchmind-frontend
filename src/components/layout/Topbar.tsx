import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

const STEPS = [
  { label: 'Upload' },
  { label: 'Theme' },
  { label: 'Settings' },
  { label: 'Generate' },
  { label: 'Export' },
]

function getActiveStep(pathname: string) {
  if (pathname.startsWith('/generating')) return 3
  if (pathname.startsWith('/export')) return 4
  if (pathname.startsWith('/editor')) return 2
  if (pathname.startsWith('/upload')) return 0
  return -1
}

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
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

interface TopbarProps {
  onToggleSidebar?: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeStep = getActiveStep(pathname)
  const inFlow = activeStep >= 0

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
      {/* Left: hamburger + step nav */}
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-pm-muted hover:text-pm-primary transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>

        {inFlow && (
          <nav className="flex items-center gap-1">
            {STEPS.map((step, i) => {
              const done = i < activeStep
              const active = i === activeStep
              return (
                <div key={step.label} className="flex items-center gap-1">
                  <span
                    className={[
                      'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'text-pm-primary border-b-2 border-pm-teal pb-[13px]'
                        : done
                        ? 'text-pm-teal'
                        : 'text-pm-muted',
                    ].join(' ')}
                  >
                    {done && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill="#1D9E75" />
                        <path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {step.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="text-white/20 text-xs select-none px-0.5">—</span>
                  )}
                </div>
              )
            })}
          </nav>
        )}
      </div>

      {/* Right: icons + avatar */}
      <div className="flex items-center gap-1">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-pm-muted hover:text-pm-primary transition-colors">
          <BellIcon />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-pm-muted hover:text-pm-primary transition-colors"
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
