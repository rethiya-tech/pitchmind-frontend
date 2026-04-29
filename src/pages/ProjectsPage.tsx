import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Spinner'
import api from '@/services/api'
import type { ConversionListResponse } from '@/types'

async function downloadPptx(conversionId: string, name: string) {
  const { data } = await api.post<{ download_url: string }>(`/conversions/${conversionId}/export`)
  const url = data.download_url
  const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  const isLocalUrl = apiBase && url.startsWith(apiBase)
  if (isLocalUrl) {
    const path = url.slice(`${apiBase}/api/v1`.length)
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
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-pm-teal hover:bg-pm-teal-hover text-white transition-colors disabled:opacity-60"
    >
      {loading ? 'Exporting…' : 'Export'}
    </button>
  )
}

const PAGE_SIZE = 10

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    done:       { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
    generating: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
    failed:     { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
    pending:    { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
    cancelled:  { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-300' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function MiniSlideThumb({ title }: { title: string }) {
  const hue = (title.charCodeAt(0) * 37) % 360
  return (
    <div
      className="w-8 h-5 rounded flex-shrink-0 rounded-sm"
      style={{ background: `linear-gradient(135deg, hsl(${hue},40%,20%) 0%, hsl(${hue},50%,35%) 100%)` }}
    />
  )
}

function formatTheme(theme: string | undefined): string {
  if (!theme) return '—'
  return theme
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(dateStr))
  } catch {
    return '—'
  }
}

function PaginationChips({
  currentPage,
  totalPages,
  onPage,
}: {
  currentPage: number
  totalPages: number
  onPage: (page: number) => void
}) {
  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis-start')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('ellipsis-end')
    pages.push(totalPages)
  }

  return (
    <>
      {pages.map((p, idx) => {
        if (p === 'ellipsis-start' || p === 'ellipsis-end') {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 text-pm-muted text-sm select-none">
              …
            </span>
          )
        }
        const isActive = p === currentPage
        return (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
              isActive
                ? 'bg-pm-teal text-white border-pm-teal'
                : 'bg-white text-pm-primary border-pm-border hover:bg-[#F3F4F6]'
            }`}
          >
            {p}
          </button>
        )
      })}
    </>
  )
}

export function ProjectsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<ConversionListResponse>({
    queryKey: ['conversions'],
    queryFn: async () => {
      const res = await api.get('/conversions')
      return res.data
    },
  })

  const allItems = data?.items ?? []
  const total = allItems.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, total)
  const pageItems = allItems.slice(startIdx, endIdx)

  function handlePage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages))
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-pm-primary tracking-tight">Projects</h1>
          <p className="text-sm text-pm-muted mt-0.5">All your AI-generated presentations</p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 bg-pm-teal hover:bg-pm-teal-hover text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Presentation
        </Link>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-pm-teal" />
        </div>
      ) : !allItems.length ? (
        /* Empty state */
        <div className="bg-pm-surface rounded-2xl border border-pm-border py-20 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E1F5EE] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="4" width="20" height="20" rx="3" stroke="#0F6E56" strokeWidth="1.8" />
              <path d="M9 14h10M14 9v10" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-pm-primary font-bold text-lg">No projects yet</p>
            <p className="text-pm-muted text-sm mt-1">Upload a document to get started</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-pm-teal hover:bg-pm-teal-hover text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Create your first presentation
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="bg-pm-surface border border-pm-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">
                  Slides
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">
                  Theme
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">
                  Created
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => {
                const filename = c.original_filename ?? 'Untitled'
                return (
                  <tr
                    key={c.id}
                    className="border-t border-pm-border hover:bg-[#FAFAFA] transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <MiniSlideThumb title={filename} />
                        <span
                          className="font-medium text-pm-primary truncate max-w-[200px]"
                          title={filename}
                        >
                          {filename}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {statusBadge(c.status)}
                    </td>

                    {/* Slides */}
                    <td className="px-5 py-3.5 text-pm-primary">
                      {c.slide_count != null ? c.slide_count : '—'}
                    </td>

                    {/* Theme */}
                    <td className="px-5 py-3.5 text-pm-primary">
                      {formatTheme(c.theme)}
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3.5 text-pm-muted">
                      {formatDate(c.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      {c.status === 'done' && (
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/editor/${c.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-primary transition-colors"
                          >
                            Edit
                          </Link>
                          <ExportButton conversionId={c.id} name={c.original_filename?.replace(/\.[^.]+$/, '') ?? 'presentation'} />
                        </div>
                      )}
                      {c.status === 'generating' && (
                        <Link
                          to={`/generating/${c.id}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        >
                          View
                        </Link>
                      )}
                      {(c.status === 'failed' || c.status === 'pending' || c.status === 'cancelled') && (
                        <span className="text-pm-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-pm-border bg-[#F9FAFB]">
              <p className="text-xs text-pm-muted">
                Showing{' '}
                <span className="font-semibold text-pm-primary">{startIdx + 1}–{endIdx}</span>
                {' '}of{' '}
                <span className="font-semibold text-pm-primary">{total}</span>
                {' '}projects
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePage(safePage - 1)}
                  disabled={safePage === 1}
                  className="flex items-center gap-1 px-3 h-8 rounded-lg border border-pm-border bg-white text-sm font-medium text-pm-primary hover:bg-[#F3F4F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Prev
                </button>

                <div className="flex items-center gap-1 mx-1">
                  <PaginationChips
                    currentPage={safePage}
                    totalPages={totalPages}
                    onPage={handlePage}
                  />
                </div>

                <button
                  onClick={() => handlePage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1 px-3 h-8 rounded-lg border border-pm-border bg-white text-sm font-medium text-pm-primary hover:bg-[#F3F4F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Showing info when only one page */}
          {totalPages === 1 && total > 0 && (
            <div className="px-5 py-3 border-t border-pm-border bg-[#F9FAFB]">
              <p className="text-xs text-pm-muted">
                Showing{' '}
                <span className="font-semibold text-pm-primary">{total}</span>
                {' '}project{total !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
