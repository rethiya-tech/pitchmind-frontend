import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import type { AdminUserListResponse } from '@/types'

const PAGE_SIZE = 20

export function AdminUsersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<AdminUserListResponse>({
    queryKey: ['admin-users', page],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { page, per_page: PAGE_SIZE } })
      return res.data
    },
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-pm-primary">Users</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-pm-teal" />
        </div>
      ) : (
        <div className="bg-pm-surface rounded-2xl border border-pm-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-pm-border">
              <tr>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Email</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Name</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Role</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Conversions</th>
                <th className="text-left px-4 py-3 text-pm-muted font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pm-border">
              {data?.items.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-pm-primary">{u.email}</td>
                  <td className="px-4 py-3 text-pm-muted">{u.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-pm-teal-light text-pm-teal' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-pm-muted">{u.conversion_count}</td>
                  <td className="px-4 py-3 text-pm-muted">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(u.created_at))}
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
            Page {page} of {totalPages} · {data?.total ?? 0} users
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
