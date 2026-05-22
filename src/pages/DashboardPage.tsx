import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, type Variants } from 'framer-motion'
import { SkeletonStatCard, SkeletonRow } from '@/components/ui/SkeletonCard'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import { THEMES } from '@/types'
import type { ConversionListResponse } from '@/types'
import { TemplatePicker } from '@/components/templates/TemplatePicker'

const MotionLink = motion(Link)

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

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
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(15,110,86,0.10)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="bg-white rounded-2xl border border-pm-border shadow-card px-6 py-5 flex items-start justify-between cursor-default"
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold text-pm-muted uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold text-pm-primary leading-none">{value}</p>
        {sub && <p className="text-xs text-pm-muted">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
    </motion.div>
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
    <MotionLink
      to={to}
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(15,110,86,0.10)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative bg-white rounded-2xl border border-pm-border px-6 py-5 flex flex-col gap-3 hover:border-pm-teal transition-colors overflow-hidden"
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
      <div className="absolute top-0 left-0 w-0 h-0.5 bg-pm-teal group-hover:w-full transition-all duration-300" />
    </MotionLink>
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

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments, onSegmentClick }: { segments: { value: number; color: string; label: string }[]; onSegmentClick?: (label: string) => void }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="44" fill="none" stroke="#E5E7EB" strokeWidth="16" />
        </svg>
        <p className="text-xs text-pm-muted">No data</p>
      </div>
    )
  }
  const r = 44
  const cx = 60
  const cy = 60
  const circ = 2 * Math.PI * r

  let offset = 0
  const arcs = segments
    .filter(s => s.value > 0)
    .map(seg => {
      const pct = seg.value / total
      const dash = pct * circ
      const gap = circ - dash
      const arc = { ...seg, dash, gap, offset }
      offset += dash
      return arc
    })

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="16" />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth="16"
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="butt"
              onClick={() => onSegmentClick?.(arc.label)}
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-pm-primary leading-none">{total}</span>
          <span className="text-[10px] text-pm-muted font-medium mt-0.5">total</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {segments.filter(s => s.value > 0).map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5"
            onClick={() => onSegmentClick?.(s.label)}
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-pm-muted">{s.label}</span>
            <span className="text-xs font-bold text-pm-primary">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Horizontal bar chart ───────────────────────────────────────────────────────
function BarChart({ bars }: { bars: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...bars.map(b => b.value), 1)
  return (
    <div className="flex flex-col gap-3 w-full">
      {bars.map((bar, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-pm-muted truncate w-28 text-right flex-shrink-0">{bar.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(bar.value / max) * 100}%`, backgroundColor: bar.color }}
            />
          </div>
          <span className="text-xs font-bold text-pm-primary w-6 text-right flex-shrink-0">{bar.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Sparkline (7-day project activity) ────────────────────────────────────────
function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points, 1)
  const w = 200
  const h = 50
  const step = w / (points.length - 1)

  const pts = points.map((v, i) => ({ x: i * step, y: h - (v / max) * (h - 4) }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${pts[pts.length - 1].x} ${h} L 0 ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 50 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F6E56" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0F6E56" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-grad)" />
      <path d={path} fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => points[i] > 0 && (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#0F6E56" />
      ))}
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  const { data, isLoading } = useQuery<ConversionListResponse>({
    queryKey: ['conversions'],
    queryFn: async () => {
      const res = await api.get('/conversions')
      return res.data
    },
  })
  const showSpinner = useDelayedLoading(isLoading)

  const items = data?.items ?? []
  const doneCount = items.filter(c => c.status === 'done').length
  const generatingCount = items.filter(c => c.status === 'generating').length
  const totalSlides = items.reduce((s, c) => s + (c.slide_count ?? 0), 0)
  const successRate = items.length ? Math.round((doneCount / items.length) * 100) : 0
  const recent = items.slice(0, 5)

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const failedCount = items.filter(c => c.status === 'failed').length
  const pendingCount = items.filter(c => c.status === 'pending' || c.status === 'cancelled').length

  const donutSegments = [
    { label: 'Done',       value: doneCount,       color: '#10B981' },
    { label: 'Generating', value: generatingCount,  color: '#3B82F6' },
    { label: 'Failed',     value: failedCount,      color: '#EF4444' },
    { label: 'Pending',    value: pendingCount,      color: '#9CA3AF' },
  ]

  const barData = items
    .filter(c => c.slide_count != null && c.slide_count > 0)
    .slice(0, 6)
    .map(c => ({
      label: (c.name ?? c.original_filename ?? 'Untitled').replace(/\.[^.]+$/, '').slice(0, 18),
      value: c.slide_count ?? 0,
      color: '#0F6E56',
    }))

  // 7-day sparkline — count projects created each day
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d.toDateString()
  })
  const spark7 = last7.map(day =>
    items.filter(c => c.created_at && new Date(c.created_at).toDateString() === day).length
  )

  if (isLoading && showSpinner) {
    return (
      <div className="space-y-7">
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <div className="skeleton-shimmer h-3 w-28 rounded-full" />
            <div className="skeleton-shimmer h-7 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-pm-border overflow-hidden shadow-card">
            <div className="px-5 py-3 bg-[#F9FAFB] border-b border-pm-border">
              <div className="skeleton-shimmer h-3 w-32 rounded-full" />
            </div>
            {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    )
  }
  if (isLoading) return null

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-pm-muted font-medium">{greeting}, {firstName}</p>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5 gradient-heading">Dashboard</h1>
        </div>
        <p className="text-xs text-pm-muted hidden sm:block">
          {new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
        </p>
      </div>

      {/* ── Stats ── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
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
      </motion.div>

      {/* ── Charts ── */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Status donut */}
          <div className="bg-white rounded-2xl border border-pm-border p-5 flex flex-col gap-3">
            <p className="text-sm font-bold text-pm-primary">Project Status</p>
            <div className="flex-1 flex items-center justify-center py-2">
              <DonutChart
                segments={donutSegments}
                onSegmentClick={(label) => navigate(`/projects?status=${label.toLowerCase()}`, { replace: true })}
              />
            </div>
          </div>

          {/* Slides per project */}
          <div className="bg-white rounded-2xl border border-pm-border p-5 flex flex-col gap-4">
            <p className="text-sm font-bold text-pm-primary">Slides per Project</p>
            {barData.length > 0 ? (
              <div className="flex-1 flex items-center">
                <BarChart bars={barData} />
              </div>
            ) : (
              <p className="text-xs text-pm-muted text-center py-8">No slide data yet</p>
            )}
          </div>

          {/* 7-day activity sparkline */}
          <div className="bg-white rounded-2xl border border-pm-border p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-bold text-pm-primary">Activity (7 days)</p>
              <span className="text-xs text-pm-muted">{spark7.reduce((a, b) => a + b, 0)} projects</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2">
              <Sparkline points={spark7} />
              <div className="flex justify-between">
                {['6d', '5d', '4d', '3d', '2d', '1d', 'Today'].map(d => (
                  <span key={d} className="text-[10px] text-pm-muted">{d}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Template picker modal */}
      {showTemplatePicker && <TemplatePicker onClose={() => setShowTemplatePicker(false)} />}

      {/* ── Quick actions + Recent activity ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Quick actions (left column) */}
        <motion.div
          className="flex flex-col gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
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
          {/* Use Template button — triggers picker modal */}
          <motion.button
            onClick={() => setShowTemplatePicker(true)}
            variants={cardVariants}
            whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(15,110,86,0.10)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="group relative bg-white rounded-2xl border border-pm-border px-6 py-5 flex flex-col gap-3 hover:border-pm-teal transition-colors overflow-hidden text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-pm-teal">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6 16h6M9 13v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M5 7h4M5 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-pm-primary group-hover:text-pm-teal transition-colors">Use a Template</p>
              <p className="text-xs text-pm-muted mt-0.5 leading-relaxed">Start from a pre-built slide template</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-pm-teal mt-auto">
              Browse templates
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="translate-x-0 group-hover:translate-x-1 transition-transform">
                <path d="M2.5 6h7m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="absolute top-0 left-0 w-0 h-0.5 bg-pm-teal group-hover:w-full transition-all duration-300" />
          </motion.button>
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
        </motion.div>

        {/* Recent activity (2-col span) */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-pm-primary">Recent Activity</h2>
            <Link to="/projects" replace className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover transition-colors">
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
                replace
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
                    {(() => {
                      const t = THEMES.find(th => th.id === c.theme) ?? THEMES[0]
                      return (
                        <div
                          className="w-9 h-6 flex-shrink-0 rounded-sm overflow-hidden flex flex-col justify-between p-0.5"
                          style={{ backgroundColor: t.bg }}
                        >
                          <div className="h-0.5 rounded-full w-5" style={{ backgroundColor: t.accent }} />
                          <div className="h-0.5 rounded-full w-4 opacity-60" style={{ backgroundColor: t.text }} />
                          <div className="h-0.5 rounded-full w-4 opacity-60" style={{ backgroundColor: t.text }} />
                        </div>
                      )
                    })()}
                    <span className="text-sm text-pm-primary font-medium truncate">
                      {c.name ?? c.original_filename ?? 'Untitled'}
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
                        state={{ from: 'dashboard' }}
                        replace
                        className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover transition-colors"
                      >
                        Edit →
                      </Link>
                    ) : c.status === 'generating' && c.id ? (
                      <Link
                        to={`/generating/${c.id}`}
                        replace
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
