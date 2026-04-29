import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import type { AdminConversionListResponse } from '@/types'

const PAGE_SIZE = 20

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  generating: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export function AdminProjectsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<AdminConversionListResponse>({
    queryKey: ['admin-conversions', page],
    queryFn: async () => {
      const res = await api.get('/admin/conversions', { params: { page, page_size: PAGE_SIZE } })
      return res.data
    },
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-pm-primary">All Projects</h1>
        {data && (
          <span className="text-sm text-pm-muted">{data.total} total</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-pm-teal" />
        </div>
      ) : (
        <div className="bg-pm-surface rounded-2xl border border-pm-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-pm-border">
              <tr>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">File</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">User</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Slides</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Theme</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pm-border">
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-pm-muted">
                    No projects found.
                  </td>
                </tr>
              )}
              {data?.items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-pm-primary max-w-[220px] truncate">
                    {c.original_filename ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-pm-primary truncate max-w-[160px]">{c.user_email ?? '—'}</div>
                    {c.user_name && (
                      <div className="text-xs text-pm-muted truncate">{c.user_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-pm-muted">{c.slide_count ?? '—'}</td>
                  <td className="px-4 py-3 text-pm-muted capitalize">{c.theme?.replace(/_/g, ' ') ?? '—'}</td>
                  <td className="px-4 py-3 text-pm-muted whitespace-nowrap">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(c.created_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between">
          <p className="text-sm text-pm-muted">
            Page {page} of {totalPages} · {data?.total ?? 0} projects
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
