import { NavLink, Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/authStore'

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M2 5.5A1.5 1.5 0 013.5 4h3.586a1 1 0 01.707.293L9.5 6H16.5A1.5 1.5 0 0118 7.5v7A1.5 1.5 0 0116.5 16h-13A1.5 1.5 0 012 14.5v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 4h3v12H4zM9 4h3v12H9zM14 4l3 1v10l-3 1V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 13v-1a3 3 0 001.5-5.598A3 3 0 007 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="15" r="0.75" fill="currentColor" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7v8a2 2 0 002 2h10a2 2 0 002-2V7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LogoMark() {
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

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: GridIcon },
  { to: '/projects', label: 'Projects', Icon: FolderIcon },
  { to: '/settings', label: 'Settings', Icon: LibraryIcon },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', Icon: GridIcon },
  { to: '/admin/users', label: 'Users', Icon: FolderIcon },
  { to: '/admin/audit-log', label: 'Audit Log', Icon: LibraryIcon },
]

interface SidebarProps {
  open?: boolean
}

export function Sidebar({ open = true }: SidebarProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <aside
      className={cn(
        'h-full flex flex-col transition-all duration-200 flex-shrink-0',
        'bg-white border-r border-pm-border',
        open ? 'w-56' : 'w-0 overflow-hidden'
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-pm-border">
        <LogoMark />
        <div>
          <span className="text-[15px] font-extrabold text-pm-teal tracking-tight leading-none">PitchMind</span>
          <p className="text-[9px] font-semibold text-pm-muted tracking-[0.15em] uppercase mt-0.5 leading-none">
            {user?.role === 'admin' ? 'Admin Suite' : 'Executive Suite'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3 space-y-0.5">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#E1F5EE] text-pm-teal'
                  : 'text-pm-muted hover:bg-gray-100 hover:text-pm-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-pm-teal' : 'text-pm-muted'}>
                  <Icon />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-pm-muted uppercase tracking-widest">
              Admin
            </div>
            {ADMIN_NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#E1F5EE] text-pm-teal'
                      : 'text-pm-muted hover:bg-gray-100 hover:text-pm-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-pm-teal' : 'text-pm-muted'}>
                      <Icon />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3 border-t border-pm-border space-y-1">
        <Link
          to="/upload"
          className="flex items-center justify-center gap-2 w-full bg-pm-teal hover:bg-pm-teal-hover text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mb-2"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Create Presentation
        </Link>

        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-pm-muted hover:bg-gray-100 hover:text-pm-primary transition-colors"
        >
          <SupportIcon />
          Support
        </NavLink>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-pm-muted hover:bg-gray-100 hover:text-pm-primary transition-colors w-full text-left">
          <ArchiveIcon />
          Archive
        </button>
      </div>
    </aside>
  )
}
