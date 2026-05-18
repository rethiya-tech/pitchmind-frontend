import { NavLink, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ProjectsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M2 5.5A1.5 1.5 0 013.5 4h3.586a1 1 0 01.707.293L9.5 6H16.5A1.5 1.5 0 0118 7.5v7A1.5 1.5 0 0116.5 16h-13A1.5 1.5 0 012 14.5v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M8.325 2.317a1.75 1.75 0 013.35 0l.14.493a1.25 1.25 0 001.756.74l.458-.228a1.75 1.75 0 012.372 2.372l-.228.458a1.25 1.25 0 00.74 1.756l.493.14a1.75 1.75 0 010 3.35l-.493.14a1.25 1.25 0 00-.74 1.756l.228.458a1.75 1.75 0 01-2.372 2.372l-.458-.228a1.25 1.25 0 00-1.756.74l-.14.493a1.75 1.75 0 01-3.35 0l-.14-.493a1.25 1.25 0 00-1.756-.74l-.458.228a1.75 1.75 0 01-2.372-2.372l.228-.458a1.25 1.25 0 00-.74-1.756l-.493-.14a1.75 1.75 0 010-3.35l.493-.14a1.25 1.25 0 00.74-1.756l-.228-.458a1.75 1.75 0 012.372-2.372l.458.228a1.25 1.25 0 001.756-.74l.14-.493z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M2 14l4-5 3 3 4-6 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="7.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 17c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 3.5a3 3 0 010 5M15.5 17c0-2.2-1.012-4.15-2.5-5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AllProjectsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6V4.5A1.5 1.5 0 017.5 3h5A1.5 1.5 0 0114 4.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 10h16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="13" r="1" fill="currentColor" />
    </svg>
  )
}

function AuditLogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TemplatesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 8h3M6 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
  { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/projects',  label: 'Projects',  Icon: ProjectsIcon  },
  { to: '/templates', label: 'Templates', Icon: TemplatesIcon },
  { to: '/settings',  label: 'Settings',  Icon: SettingsIcon  },
]

const ADMIN_NAV = [
  { to: '/admin',             label: 'Overview',     Icon: OverviewIcon    },
  { to: '/admin/users',       label: 'Users',        Icon: UsersIcon       },
  { to: '/admin/projects',    label: 'All Projects', Icon: AllProjectsIcon },
  { to: '/admin/templates',   label: 'Templates',    Icon: TemplatesIcon   },
  { to: '/admin/audit-log',   label: 'Audit Log',    Icon: AuditLogIcon    },
]

interface SidebarProps {
  open?: boolean
}

export function Sidebar({ open = true }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  const { data: pending } = useQuery<{ total: number }>({
    queryKey: ['admin-pending-count'],
    queryFn: async () =>
      (await api.get('/admin/users', { params: { status: 'pending', page_size: 1 } })).data,
    enabled: isAdmin,
    refetchInterval: 30_000,
  })
  const pendingCount = pending?.total ?? 0

  const renderLink = ({ to, label, Icon }: { to: string; label: string; Icon: () => JSX.Element }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/admin' || to === '/dashboard'}
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
          <span className="flex-1">{label}</span>
          {to === '/admin/users' && pendingCount > 0 && (
            <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5 leading-none">
              {pendingCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  )

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-pm-muted uppercase tracking-widest">
      {children}
    </div>
  )

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
        {isAdmin ? (
          <>
            <SectionHeading>Admin</SectionHeading>
            {ADMIN_NAV.map(renderLink)}

            <SectionHeading>User</SectionHeading>
            {NAV.map(renderLink)}
          </>
        ) : (
          NAV.map(renderLink)
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3 border-t border-pm-border">
        <Link
          to="/upload"
          className="flex items-center justify-center gap-2 w-full bg-pm-teal hover:bg-pm-teal-hover text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Create Presentation
        </Link>
      </div>
    </aside>
  )
}
