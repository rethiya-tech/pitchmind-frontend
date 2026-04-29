import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import type { ConversionListResponse } from '@/types'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-pm-border px-6 py-5 flex items-start justify-between">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-pm-muted uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold text-pm-primary leading-none">{value}</p>
        {sub && <p className="text-xs text-pm-muted">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
    </div>
  )
}

// ── Quick action card ─────────────────────────────────────────────────────────
function ActionCard({
  to,
  title,
  desc,
  icon,
  cta,
}: {
  to: string
  title: string
  desc: string
  icon: React.ReactNode
  cta: string
}) {
  return (
    <Link
      to={to}
      className="group relative bg-white rounded-2xl border border-pm-border px-6 py-5 flex flex-col gap-3 hover:border-pm-teal hover:shadow-md transition-all overflow-hidden"
    >
      <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-pm-teal">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-pm-primary group-hover:text-pm-teal transition-colors">{title}</p>
        <p className="text-xs text-pm-muted mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-semibold text-pm-teal mt-auto">
        {cta}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="translate-x-0 group-hover:translate-x-1 transition-transform">
          <path d="M2.5 6h7m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {/* Subtle top-left accent line */}
      <div className="absolute top-0 left-0 w-0 h-0.5 bg-pm-teal group-hover:w-full transition-all duration-300" />
    </Link>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    done:       { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Done' },
    generating: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Generating' },
    failed:     { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Failed' },
    pending:    { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Pending' },
    cancelled:  { bg: 'bg-gray-100',  text: 'text-gray-400',   dot: 'bg-gray-300',   label: 'Cancelled' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery<ConversionListResponse>({
    queryKey: ['conversions'],
    queryFn: async () => {
      const res = await api.get('/conversions')
      return res.data
    },
  })

  const items = data?.items ?? []
  const doneCount = items.filter(c => c.status === 'done').length
  const generatingCount = items.filter(c => c.status === 'generating').length
  const totalSlides = items.reduce((s, c) => s + (c.slide_count ?? 0), 0)
  const successRate = items.length ? Math.round((doneCount / items.length) * 100) : 0
  const recent = items.slice(0, 5)

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-pm-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-pm-muted font-medium">{greeting}, {firstName}</p>
          <h1 className="text-2xl font-extrabold text-pm-primary tracking-tight mt-0.5">Dashboard</h1>
        </div>
        <p className="text-xs text-pm-muted hidden sm:block">
          {new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={items.length}
          sub={items.length === 1 ? '1 presentation' : `${items.length} presentations`}
          accent="bg-[#E1F5EE] text-pm-teal"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5.5A1.5 1.5 0 014.5 4h4l1.5 2H15.5A1.5 1.5 0 0117 7.5v8A1.5 1.5 0 0115.5 17h-11A1.5 1.5 0 013 15.5v-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={doneCount}
          sub={`${successRate}% success rate`}
          accent="bg-green-50 text-green-600"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          label="In Progress"
          value={generatingCount}
          sub={generatingCount ? 'Generating now' : 'Nothing running'}
          accent="bg-blue-50 text-blue-500"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v2m0 10v2M3 10h2m10 0h2M5.05 5.05l1.41 1.41m7.08 7.08 1.41 1.41M5.05 14.95l1.41-1.41m7.08-7.08 1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Total Slides"
          value={totalSlides}
          sub="Across all projects"
          accent="bg-amber-50 text-amber-600"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 17h6M10 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 8.5h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      {/* ── Quick actions + Recent activity ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Quick actions (left column) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-pm-primary">Quick Actions</h2>
          <ActionCard
            to="/upload"
            title="New Presentation"
            desc="Upload a document and let AI build your deck"
            cta="Get started"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
          <ActionCard
            to="/projects"
            title="My Projects"
            desc="Browse and manage all your presentations"
            cta="View all"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 5A1.5 1.5 0 013.5 3.5h3.5l1.5 2H14.5A1.5 1.5 0 0116 7v7A1.5 1.5 0 0114.5 15.5h-11A1.5 1.5 0 012 14V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>

        {/* Recent activity (2-col span) */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-pm-primary">Recent Activity</h2>
            <Link to="/projects" className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover transition-colors">
              View all →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex-1 bg-white rounded-2xl border border-pm-border flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E1F5EE] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="3.5" y="3.5" width="19" height="19" rx="2.5" stroke="#0F6E56" strokeWidth="1.6" />
                  <path d="M8.5 13h9M13 8.5v9" stroke="#0F6E56" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-pm-primary">No projects yet</p>
                <p className="text-xs text-pm-muted mt-1">Create your first presentation to get started</p>
              </div>
              <Link
                to="/upload"
                className="text-xs font-semibold text-pm-teal border border-pm-teal rounded-lg px-4 py-2 hover:bg-[#E1F5EE] transition-colors"
              >
                Create presentation
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-pm-border overflow-hidden">
              {/* Table head */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-[#F9FAFB] border-b border-pm-border">
                {['Name', 'Status', 'Slides', 'Action'].map(h => (
                  <span key={h} className="text-xs font-semibold uppercase tracking-wider text-pm-muted">{h}</span>
                ))}
              </div>
              {/* Rows */}
              {recent.map((c, i) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors ${i < recent.length - 1 ? 'border-b border-pm-border' : ''}`}
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-6 rounded flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(${((c.original_filename ?? 'U').charCodeAt(0) * 37) % 360},40%,35%) 0%, hsl(${((c.original_filename ?? 'U').charCodeAt(0) * 37) % 360},50%,50%) 100%)` }}
                    />
                    <span className="text-sm text-pm-primary font-medium truncate">
                      {c.original_filename ?? 'Untitled'}
                    </span>
                  </div>
                  {/* Status */}
                  <StatusPill status={c.status} />
                  {/* Slides */}
                  <span className="text-sm text-pm-muted tabular-nums text-center w-12">{c.slide_count ?? '—'}</span>
                  {/* Action */}
                  <div className="flex items-center justify-end">
                    {c.status === 'done' ? (
                      <Link
                        to={`/editor/${c.id}`}
                        className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover transition-colors"
                      >
                        Edit →
                      </Link>
                    ) : c.status === 'generating' ? (
                      <Link
                        to={`/generating/${c.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Progress →
                      </Link>
                    ) : (
                      <span className="text-xs text-pm-muted">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
