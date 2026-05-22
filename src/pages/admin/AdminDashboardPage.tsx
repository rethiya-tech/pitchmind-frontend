import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageLoader } from '@/components/ui/PageLoader'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import api from '@/services/api'
import type { AdminMetrics, AuditLogListResponse, AdminConversionListResponse } from '@/types'
import { TokenUsageTable } from '@/components/admin/TokenUsageTable'

function StatCard({
  label, value, sub, icon, accent = false, barGradient,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  accent?: boolean
  barGradient?: string
}) {
  return (
    <motion.div
      className={`relative rounded-2xl border p-5 flex items-start gap-4 overflow-hidden ${accent ? 'border-pm-teal' : 'border-pm-border/60 shadow-card'}`}
      style={accent ? { background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)' } : { background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)' }}
      whileHover={{ y: -3, boxShadow: accent ? '0 12px 32px rgba(15,110,86,0.35)' : '0 12px 36px rgba(15,110,86,0.12), 0 4px 12px rgba(0,0,0,0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {barGradient && !accent && (
        <div className="absolute left-0 inset-y-0 w-[3px] rounded-l-2xl" style={{ background: barGradient }} />
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/20' : 'bg-[#E1F5EE]'}`}>
        <span className={accent ? 'text-white' : 'text-pm-teal'}>{icon}</span>
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider ${accent ? 'text-white/70' : 'text-pm-muted'}`}>{label}</p>
        <p className={`text-2xl font-extrabold mt-0.5 ${accent ? 'text-white' : 'text-pm-primary'}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${accent ? 'text-white/60' : 'text-pm-muted'}`}>{sub}</p>}
      </div>
    </motion.div>
  )
}

function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M1 17c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 3.5a3 3 0 010 5M15.5 17c0-2.2-1.012-4.15-2.5-5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function SlideIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 17h6M10 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 10.5l2.5 2.5 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function LayersIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L2 6l8 4 8-4-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M2 10l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 14l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function CostIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v1.5M10 12.5V14M7.5 11a2.5 2.5 0 005 0c0-1.38-2.5-2-2.5-2s-2.5-.62-2.5-2a2.5 2.5 0 015 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function ActivityIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2 10h3l2-6 3 12 2-8 2 4 2-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function statusDot(status: string) {
  const map: Record<string, string> = { done: 'bg-green-500', generating: 'bg-blue-500', failed: 'bg-red-500', pending: 'bg-gray-400', cancelled: 'bg-gray-300' }
  return map[status] ?? 'bg-gray-400'
}

function statusText(status: string) {
  const map: Record<string, string> = { done: 'text-green-700 bg-green-50', generating: 'text-blue-700 bg-blue-50', failed: 'text-red-700 bg-red-50', pending: 'text-gray-600 bg-gray-100', cancelled: 'text-gray-500 bg-gray-100' }
  return map[status] ?? 'text-gray-600 bg-gray-100'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    'user.login': 'User logged in',
    'user.logout': 'User logged out',
    'user.register': 'New user registered',
    'user.password_change': 'Password changed',
    'conversion.created': 'Presentation created',
    'conversion.failed': 'Presentation failed',
    'conversion.deleted': 'Presentation deleted',
  }
  return map[action] ?? action
}

function actionColor(action: string) {
  if (action.includes('login') || action.includes('register')) return 'bg-blue-100 text-blue-700'
  if (action.includes('created')) return 'bg-green-100 text-green-700'
  if (action.includes('failed') || action.includes('deleted')) return 'bg-red-100 text-red-700'
  if (action.includes('password')) return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-700'
}

export function AdminDashboardPage() {
  const { data: metrics, isLoading } = useQuery<AdminMetrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => (await api.get('/admin/metrics')).data,
    refetchInterval: 30_000,
  })
  const showSpinner = useDelayedLoading(isLoading)

  const { data: auditData } = useQuery<AuditLogListResponse>({
    queryKey: ['admin-audit-log', 1],
    queryFn: async () => (await api.get('/admin/audit-log', { params: { page: 1, page_size: 8 } })).data,
  })

  const { data: convData } = useQuery<AdminConversionListResponse>({
    queryKey: ['admin-conversions', 1],
    queryFn: async () => (await api.get('/admin/conversions', { params: { page: 1, page_size: 5 } })).data,
  })

  if (isLoading) {
    return <PageLoader show={showSpinner} />
  }

  const m = metrics!

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-heading">Admin Overview</h1>
          <p className="text-sm text-pm-muted mt-0.5">Platform health and activity at a glance</p>
        </div>
        <span className="text-xs text-pm-muted border border-pm-border/50 rounded-lg px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(8px)' }}>
          Auto-refreshes every 30s
        </span>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={m.total_users} sub={`${m.active_users_today} active today`} icon={<UsersIcon />} barGradient="linear-gradient(180deg, #0F6E56, #0A9B6E)" />
        <StatCard label="Total Presentations" value={m.total_conversions} sub={`${m.done_conversions} completed`} icon={<SlideIcon />} barGradient="linear-gradient(180deg, #3B82F6, #60A5FA)" />
        <StatCard label="Success Rate" value={`${m.success_rate}%`} sub={`${m.done_conversions} of ${m.total_conversions}`} icon={<CheckIcon />} accent />
        <StatCard label="Slides Generated" value={m.total_slides.toLocaleString()} sub="all time" icon={<LayersIcon />} barGradient="linear-gradient(180deg, #C9930A, #E8B84A)" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Conversions Today" value={m.conversions_today} icon={<ActivityIcon />} barGradient="linear-gradient(180deg, #0F6E56, #0A9B6E)" />
        <StatCard label="Failed Today" value={m.failed_today} sub={m.failed_today > 0 ? 'needs attention' : 'all good'} icon={<CheckIcon />} barGradient="linear-gradient(180deg, #DC2626, #EF4444)" />
        <StatCard label="AI Cost Today" value={`$${m.ai_cost_today_usd.toFixed(4)}`} sub={`${(m.total_tokens).toLocaleString()} total tokens`} icon={<CostIcon />} barGradient="linear-gradient(180deg, #C9930A, #E8B84A)" />
        <StatCard label="Total AI Spend" value={`$${m.ai_cost_total_usd.toFixed(3)}`} sub="all time" icon={<CostIcon />} barGradient="linear-gradient(180deg, #C9930A, #E8B84A)" />
      </div>

      {/* Token Usage Table */}
      <TokenUsageTable metrics={m} />

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent Presentations */}
        <div className="rounded-2xl overflow-hidden shadow-card border border-pm-border/60" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-pm-border/60">
            <h2 className="text-sm font-bold text-pm-primary">Recent Presentations</h2>
            <Link to="/admin/projects" className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover">View all →</Link>
          </div>
          <div className="divide-y divide-pm-border">
            {!convData?.items.length ? (
              <p className="px-5 py-8 text-sm text-pm-muted text-center">No presentations yet</p>
            ) : convData.items.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 transition-all duration-150 hover:shadow-[inset_3px_0_0_#0F6E56]"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(238,248,242,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(c.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-pm-primary truncate">{c.original_filename ?? 'Untitled'}</p>
                  <p className="text-xs text-pm-muted">{c.user_email ?? c.user_name ?? '—'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusText(c.status)}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                  {c.slide_count != null && (
                    <span className="text-xs text-pm-muted">{c.slide_count} slides</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="rounded-2xl overflow-hidden shadow-card border border-pm-border/60" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-pm-border/60">
            <h2 className="text-sm font-bold text-pm-primary">Recent Activity</h2>
            <Link to="/admin/audit-log" className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover">View all →</Link>
          </div>
          <div className="divide-y divide-pm-border">
            {!auditData?.items.length ? (
              <p className="px-5 py-8 text-sm text-pm-muted text-center">No activity logged yet</p>
            ) : auditData.items.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-5 py-3 transition-all duration-150 hover:shadow-[inset_3px_0_0_#0F6E56]"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(238,248,242,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionColor(entry.action)}`}>
                      {actionLabel(entry.action)}
                    </span>
                  </div>
                  <p className="text-xs text-pm-muted mt-0.5">{entry.actor_email ?? 'system'}</p>
                </div>
                <span className="text-xs text-pm-muted flex-shrink-0 mt-0.5">{timeAgo(entry.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
