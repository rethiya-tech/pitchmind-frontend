import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import api from '@/services/api'
import type { AuditLogListResponse } from '@/types'

const PAGE_SIZE = 25

export function AdminAuditLogPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [actor, setActor] = useState('')
  const [actionInput, setActionInput] = useState('')
  const [actorInput, setActorInput] = useState('')

  const { data, isLoading } = useQuery<AuditLogListResponse>({
    queryKey: ['admin-audit-log', page, action, actor],
    queryFn: async () => {
      const res = await api.get('/admin/audit-log', {
        params: { page, page_size: PAGE_SIZE, action, actor },
      })
      return res.data
    },
  })
  const showSpinner = useDelayedLoading(isLoading)

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setAction(actionInput.trim())
    setActor(actorInput.trim())
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-heading">Audit Log</h1>

      <form onSubmit={applyFilters} className="flex flex-wrap gap-2">
        <input
          value={actionInput}
          onChange={(e) => setActionInput(e.target.value)}
          placeholder="Filter by action (e.g. admin.user)…"
          className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-pm-border/60 text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
          style={{ background: 'var(--pm-glass-bg-soft)', backdropFilter: 'blur(8px)' }}
        />
        <input
          value={actorInput}
          onChange={(e) => setActorInput(e.target.value)}
          placeholder="Filter by actor email…"
          className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-pm-border/60 text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
          style={{ background: 'var(--pm-glass-bg-soft)', backdropFilter: 'blur(8px)' }}
        />
        <Button type="submit" variant="secondary" size="sm">Filter</Button>
        {(action || actor) && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => { setActionInput(''); setActorInput(''); setAction(''); setActor(''); setPage(1) }}
          >
            Clear
          </Button>
        )}
      </form>

      {isLoading ? (
        <PageLoader show={showSpinner} />
      ) : (
        <div className="rounded-2xl border border-pm-border/60 divide-y divide-pm-border/50 shadow-card" style={{ background: 'var(--pm-glass-bg)', backdropFilter: 'blur(12px)' }}>
          {data?.items.length === 0 && (
            <p className="px-4 py-8 text-center text-pm-muted text-sm">No audit log entries.</p>
          )}
          {data?.items.map((entry) => (
            <div key={entry.id} className="px-4 py-3 flex items-start justify-between gap-4 transition-all duration-150 hover:bg-pm-teal-light">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pm-surface-3 text-pm-primary">
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
