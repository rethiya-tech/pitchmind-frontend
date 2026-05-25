import { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { PageLoader } from '@/components/ui/PageLoader'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import api from '@/services/api'
import { THEMES } from '@/types'
import type { ConversionListResponse } from '@/types'

type ExportFormat = 'pptx' | 'pdf' | 'docx'

const MIME: Record<ExportFormat, string> = {
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

async function downloadFile(conversionId: string, name: string, format: ExportFormat) {
  const { data } = await api.post<{ download_url: string }>(`/conversions/${conversionId}/export?format=${format}`)
  const url = data.download_url
  let isLocal = false
  try {
    const { hostname } = new URL(url)
    isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
  } catch { /* invalid url — treat as remote */ }
  if (isLocal) {
    const path = url.replace(/^https?:\/\/[^/]+\/api\/v1/, '')
    const res = await api.get(path, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: MIME[format] })
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `${name}.${format}`
    a.click()
    URL.revokeObjectURL(blobUrl)
  } else {
    window.open(url, '_blank')
  }
}

function ExportButton({ conversionId, name }: { conversionId: string; name: string }) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handle = async (fmt: ExportFormat) => {
    setOpen(false)
    setLoadingFormat(fmt)
    try {
      await downloadFile(conversionId, name, fmt)
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setLoadingFormat(null)
    }
  }

  const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
  const SpinIcon = () => (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
    </svg>
  )

  return (
    <div ref={wrapperRef} className="relative flex">
      <button
        onClick={() => handle('pptx')}
        disabled={loadingFormat !== null}
        title="Export PPTX"
        className="w-8 h-8 rounded-l-lg flex items-center justify-center bg-pm-teal hover:bg-pm-teal-hover text-white transition-colors disabled:opacity-60 border-r border-r-white/20"
      >
        {loadingFormat === 'pptx' ? <SpinIcon /> : <DownloadIcon />}
      </button>

      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loadingFormat !== null}
        title="More export formats"
        className="h-8 px-1 rounded-r-lg flex items-center justify-center bg-pm-teal hover:bg-pm-teal-hover text-white transition-colors disabled:opacity-60 border-l border-l-white/20"
      >
        {loadingFormat && loadingFormat !== 'pptx' ? (
          <SpinIcon />
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-pm-surface border border-pm-border rounded-lg shadow-lg py-1 min-w-[128px]">
          {(['pptx', 'pdf', 'docx'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              className="w-full text-left px-3 py-1.5 text-sm text-pm-primary hover:bg-pm-surface-2 transition-colors whitespace-nowrap"
              onClick={() => handle(fmt)}
            >
              Download {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
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
      await queryClient.invalidateQueries({ queryKey: ['conversions'] })
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
        message="Delete this project? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(false)}
      />
      <button
        onClick={() => setConfirm(true)}
        disabled={loading}
        title="Delete project"
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-danger/30 bg-pm-danger/10 hover:bg-pm-danger/15 text-pm-danger transition-colors disabled:opacity-60"
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

const PAGE_SIZE = 10

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    done:       { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
    generating: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
    failed:     { bg: 'bg-pm-danger/10',    text: 'text-pm-danger',    dot: 'bg-pm-danger' },
    pending:    { bg: 'bg-pm-surface-3',  text: 'text-pm-muted',   dot: 'bg-gray-400' },
    cancelled:  { bg: 'bg-pm-surface-3',  text: 'text-pm-muted',   dot: 'bg-gray-300' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function MiniSlideThumb({ theme }: { theme: string | undefined }) {
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  return (
    <div
      className="w-8 h-5 flex-shrink-0 rounded-sm overflow-hidden flex flex-col justify-between p-0.5"
      style={{ backgroundColor: t.bg }}
    >
      <div className="h-0.5 rounded-full w-4" style={{ backgroundColor: t.accent }} />
      <div className="h-0.5 rounded-full w-3 opacity-60" style={{ backgroundColor: t.text }} />
      <div className="h-0.5 rounded-full w-3.5 opacity-60" style={{ backgroundColor: t.text }} />
    </div>
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
            className={`w-8 h-8 rounded-lg text-sm font-medium border transition-all duration-150 ${
              isActive
                ? 'text-white border-transparent'
                : 'bg-pm-surface/80 text-pm-primary border-pm-border/60 hover:bg-pm-teal-light hover:-translate-y-px'
            }`}
            style={isActive ? { background: 'linear-gradient(135deg, #0F6E56, #0A9B6E)' } : {}}
          >
            {p}
          </button>
        )
      })}
    </>
  )
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
  exit:  { opacity: 0, transition: { duration: 0.1 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
}

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'done', label: 'Done' },
  { id: 'generating', label: 'Generating' },
  { id: 'failed', label: 'Failed' },
] as const

type StatusTab = typeof STATUS_TABS[number]['id']

export function ProjectsPage() {
  const [searchParams] = useSearchParams()
  const initialStatus = (searchParams.get('status') ?? 'all') as StatusTab
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<StatusTab>(
    STATUS_TABS.some(t => t.id === initialStatus) ? initialStatus : 'all'
  )

  const { data, isLoading } = useQuery<ConversionListResponse>({
    queryKey: ['conversions'],
    queryFn: async () => {
      const res = await api.get('/conversions')
      return res.data
    },
  })
  const showSpinner = useDelayedLoading(isLoading)

  const rawItems = data?.items ?? []

  const allItems = rawItems.filter((c) => {
    const name = (c.name ?? c.original_filename ?? '').toLowerCase()
    const matchesSearch = search.trim() === '' || name.includes(search.trim().toLowerCase())
    const matchesStatus = statusTab === 'all' || c.status === statusTab
    return matchesSearch && matchesStatus
  })

  const total = allItems.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, total)
  const pageItems = allItems.slice(startIdx, endIdx)

  function handlePage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages))
  }

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  function handleTab(tab: StatusTab) {
    setStatusTab(tab)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-heading">Projects</h1>
          <p className="text-sm text-pm-muted mt-0.5">All your AI-generated presentations</p>
        </div>
        <Link
          to="/upload"
          replace
          className="flex items-center gap-2 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)', boxShadow: '0 4px 16px rgba(15,110,86,0.25)' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Presentation
        </Link>
      </div>

      {/* Search + filter bar */}
      {!isLoading && rawItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-muted pointer-events-none"
              width="15" height="15" viewBox="0 0 15 15" fill="none"
            >
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-pm-border/60 rounded-xl text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal focus:border-transparent transition-colors"
              style={{ background: 'var(--pm-glass-bg-soft)', backdropFilter: 'blur(8px)' }}
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-muted hover:text-pm-primary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-pm-border/50" style={{ background: 'var(--pm-glass-bg-soft)', backdropFilter: 'blur(8px)' }}>
            {STATUS_TABS.map((tab) => {
              const count = tab.id === 'all'
                ? rawItems.length
                : rawItems.filter((c) => c.status === tab.id).length
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    statusTab === tab.id
                      ? 'bg-pm-surface text-pm-teal shadow-sm border border-pm-teal/20'
                      : 'text-pm-muted hover:text-pm-primary'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold leading-none ${
                      statusTab === tab.id ? 'bg-pm-surface-3 text-pm-muted' : 'bg-white/0 text-pm-muted'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <PageLoader show={showSpinner} />
      ) : rawItems.length === 0 ? (
        /* Empty state — no projects at all */
        <div className="bg-pm-surface rounded-2xl border border-pm-border py-20 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-pm-teal-light flex items-center justify-center">
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
            replace
            className="inline-flex items-center gap-2 bg-pm-teal hover:bg-pm-teal-hover text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Create your first presentation
          </Link>
        </div>
      ) : allItems.length === 0 ? (
        /* No results matching current search/filter */
        <div className="bg-pm-surface rounded-2xl border border-pm-border py-16 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-pm-surface-3 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="9.5" cy="9.5" r="7" stroke="#6B7280" strokeWidth="1.6" />
              <path d="M15.5 15.5l4 4" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-pm-primary font-semibold">No projects found</p>
          <p className="text-pm-muted text-sm">
            {search ? `No results for "${search}"` : `No ${statusTab} projects`}
          </p>
          <button
            onClick={() => { handleSearch(''); handleTab('all') }}
            className="text-pm-teal text-sm font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Table */
        <div className="rounded-2xl shadow-card border border-pm-border/60" style={{ background: 'var(--pm-glass-bg)', backdropFilter: 'blur(12px)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pm-surface/60">
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
                  Tokens
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={`${statusTab}-${safePage}`}
                variants={listVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
              {pageItems.map((c) => {
                const filename = c.name ?? c.original_filename ?? 'Untitled'
                return (
                  <motion.tr
                    key={c.id}
                    variants={rowVariants}
                    className="border-t border-pm-border/60 transition-colors duration-150 hover:shadow-[inset_3px_0_0_#0F6E56]"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(238,248,242,0.55)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <MiniSlideThumb theme={c.theme} />
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

                    {/* Tokens */}
                    <td className="px-5 py-3.5 text-pm-muted text-xs">
                      {c.tokens_used ? (
                        <span className="inline-flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-pm-teal flex-shrink-0">
                            <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M5.5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                          {c.tokens_used.toLocaleString()}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      {c.status === 'done' && (
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/editor/${c.id}`}
                            state={{ from: 'projects' }}
                            replace
                            title="Edit presentation"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-pm-surface hover:bg-pm-surface-3 text-pm-primary transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Link>
                          <Link
                            to={`/editor/${c.id}`}
                            state={{ from: 'projects', autoPresent: true }}
                            replace
                            title="Present"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-pm-surface hover:bg-pm-teal-light hover:border-pm-teal/40 hover:text-pm-teal text-pm-primary transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <polygon points="3,1.5 12.5,7 3,12.5" fill="currentColor" />
                            </svg>
                          </Link>
                          <ExportButton conversionId={c.id} name={(c.name ?? c.original_filename ?? 'presentation').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 40).trimEnd()} />
                          <DeleteButton conversionId={c.id} />
                        </div>
                      )}
                      {c.status === 'generating' && c.id && (
                        <Link
                          to={`/generating/${c.id}`}
                          replace
                          title="View generation progress"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      )}
                      {(c.status === 'failed' || c.status === 'pending' || c.status === 'cancelled') && (
                        <DeleteButton conversionId={c.id} />
                      )}
                    </td>
                  </motion.tr>
                )
              })}
              </motion.tbody>
            </AnimatePresence>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-pm-border/60 bg-pm-surface/60">
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
                  className="flex items-center gap-1 px-3 h-8 rounded-lg border border-pm-border bg-pm-surface text-sm font-medium text-pm-primary hover:bg-pm-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-1 px-3 h-8 rounded-lg border border-pm-border bg-pm-surface text-sm font-medium text-pm-primary hover:bg-pm-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
            <div className="px-5 py-3 border-t border-pm-border/60 bg-pm-surface/60">
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
