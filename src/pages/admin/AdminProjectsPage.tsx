import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { THEMES } from '@/types'
import type { AdminConversionListResponse } from '@/types'

const PAGE_SIZE = 20

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  done:       { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  failed:     { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'   },
  generating: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500'  },
  pending:    { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400'},
  cancelled:  { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-300'  },
}

function MiniThumb({ theme }: { theme: string | null }) {
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  return (
    <div className="w-8 h-5 flex-shrink-0 rounded-sm overflow-hidden flex flex-col justify-between p-0.5" style={{ backgroundColor: t.bg }}>
      <div className="h-0.5 rounded-full w-4" style={{ backgroundColor: t.accent }} />
      <div className="h-0.5 rounded-full w-3 opacity-60" style={{ backgroundColor: t.text }} />
      <div className="h-0.5 rounded-full w-3.5 opacity-60" style={{ backgroundColor: t.text }} />
    </div>
  )
}

async function downloadPptx(conversionId: string, name: string) {
  const { data } = await api.post<{ download_url: string }>(`/conversions/${conversionId}/export`)
  const url = data.download_url
  const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  const stripScheme = (u: string) => u.replace(/^https?:\/\//, '')
  const isLocalUrl = apiBase && stripScheme(url).startsWith(stripScheme(apiBase))
  if (isLocalUrl) {
    const path = url.replace(/^https?:\/\/[^/]+\/api\/v1/, '')
    const res = await api.get(path, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `${name}.pptx`
    a.click()
    URL.revokeObjectURL(blobUrl)
  } else {
    window.open(url, '_blank')
  }
}

function ExportButton({ conversionId, name }: { conversionId: string; name: string }) {
  const [loading, setLoading] = useState(false)
  const handleClick = async () => {
    setLoading(true)
    try {
      await downloadPptx(conversionId, name)
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Export PPTX"
      className="w-8 h-8 rounded-lg flex items-center justify-center bg-pm-teal hover:bg-pm-teal-hover text-white transition-colors disabled:opacity-60"
    >
      {loading ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}

function DeleteButton({ conversionId }: { conversionId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const queryClient = useQueryClient()

  const handleConfirm = useCallback(async () => {
    setConfirm(false)
    setLoading(true)
    try {
      await api.delete(`/conversions/${conversionId}`)
      await queryClient.invalidateQueries({ queryKey: ['admin-conversions'] })
      toast.success('Project deleted.')
    } catch {
      toast.error('Failed to delete project.')
    } finally {
      setLoading(false)
    }
  }, [conversionId, queryClient])

  return (
    <>
      <ConfirmDialog
        open={confirm}
        title="Delete Project"
        message="Delete this project permanently? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(false)}
      />
      <button
        onClick={() => setConfirm(true)}
        disabled={loading}
        title="Delete project"
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M6 7v3M8 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 4l.7 7.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </>
  )
}

export function AdminProjectsPage() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

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
        <div>
          <h1 className="text-2xl font-extrabold text-pm-primary tracking-tight">All Projects</h1>
          <p className="text-sm text-pm-muted mt-0.5">All user presentations across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-sm text-pm-muted">{data.total} total</span>
          )}
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Presentation
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-pm-teal" />
        </div>
      ) : (
        <div className="bg-pm-surface rounded-2xl border border-pm-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Slides</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Theme</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Created</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pm-border">
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-pm-muted">
                    No projects found.
                  </td>
                </tr>
              )}
              {data?.items.map((c) => {
                const filename = c.original_filename ?? 'Untitled'
                const s = STATUS_STYLES[c.status] ?? STATUS_STYLES.cancelled
                return (
                  <tr key={c.id} className="border-t border-pm-border hover:bg-[#FAFAFA] transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <MiniThumb theme={c.theme} />
                        <span className="font-medium text-pm-primary truncate max-w-[180px]" title={filename}>
                          {filename}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="text-pm-primary truncate max-w-[160px]">{c.user_email ?? '—'}</div>
                      {c.user_name && <div className="text-xs text-pm-muted truncate">{c.user_name}</div>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>

                    {/* Slides */}
                    <td className="px-5 py-3.5 text-pm-primary">{c.slide_count ?? '—'}</td>

                    {/* Theme */}
                    <td className="px-5 py-3.5 text-pm-muted capitalize">{c.theme?.replace(/_/g, ' ') ?? '—'}</td>

                    {/* Created */}
                    <td className="px-5 py-3.5 text-pm-muted whitespace-nowrap">
                      {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(c.created_at))}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      {c.status === 'done' && (
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/editor/${c.id}`}
                            title="Edit presentation"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-primary transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Link>
                          <ExportButton
                            conversionId={c.id}
                            name={filename.replace(/\.[^.]+$/, '')}
                          />
                          <DeleteButton conversionId={c.id} />
                        </div>
                      )}
                      {c.status !== 'done' && (
                        <div className="flex items-center gap-1.5">
                          <DeleteButton conversionId={c.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-5 py-3 border-t border-pm-border bg-[#F9FAFB] flex items-center justify-between">
            <p className="text-xs text-pm-muted">
              Showing <span className="font-semibold text-pm-primary">{data?.items.length ?? 0}</span> of{' '}
              <span className="font-semibold text-pm-primary">{data?.total ?? 0}</span> projects
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
