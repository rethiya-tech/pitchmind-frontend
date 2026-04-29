import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import type { AuditLogListResponse } from '@/types'

const PAGE_SIZE = 25

export function AdminAuditLogPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<AuditLogListResponse>({
    queryKey: ['admin-audit-log', page],
    queryFn: async () => {
      const res = await api.get('/admin/audit-log', { params: { page, per_page: PAGE_SIZE } })
      return res.data
    },
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-pm-primary">Audit Log</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-pm-teal" />
        </div>
      ) : (
        <div className="bg-pm-surface rounded-2xl border border-pm-border divide-y divide-pm-border">
          {data?.items.length === 0 && (
            <p className="px-4 py-8 text-center text-pm-muted text-sm">No audit log entries.</p>
          )}
          {data?.items.map((entry) => (
            <div key={entry.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {entry.action}
                  </span>
                  {entry.target_type && (
                    <span className="text-xs text-pm-muted">
                      {entry.target_type}:{entry.target_id?.slice(0, 8)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-pm-muted truncate">
                  {entry.actor_email ?? 'system'}
                </p>
              </div>
              <time className="text-xs text-pm-muted flex-shrink-0">
                {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
                  new Date(entry.created_at)
                )}
              </time>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between">
          <p className="text-sm text-pm-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}
