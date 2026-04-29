import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/Spinner'
import api from '@/services/api'
import type { AdminMetrics } from '@/types'

interface MetricCardProps {
  label: string
  value: string | number
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="bg-pm-surface rounded-2xl border border-pm-border p-6 space-y-1">
      <p className="text-sm text-pm-muted">{label}</p>
      <p className="text-3xl font-bold text-pm-primary">{value}</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery<AdminMetrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const res = await api.get('/admin/metrics')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-pm-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-pm-primary">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Users" value={data?.total_users ?? 0} />
        <MetricCard label="Slide Conversions" value={data?.total_conversions ?? 0} />
        <MetricCard label="Conversions Today" value={data?.conversions_today ?? 0} />
        <MetricCard label="Failed Today" value={data?.failed_today ?? 0} />
      </div>
      <div className="bg-pm-surface rounded-2xl border border-pm-border p-6">
        <p className="text-sm text-pm-muted">AI Cost Today</p>
        <p className="text-2xl font-bold text-pm-primary">
          ${data?.ai_cost_today_usd?.toFixed(4) ?? '0.0000'}
        </p>
      </div>
    </div>
  )
}
