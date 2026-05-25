import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useEditorStore } from '@/stores/editorStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { PageLoader } from '@/components/ui/PageLoader'
import { SlideList } from '@/components/editor/SlideList'
import { SlideDetailPanel } from '@/components/editor/SlideDetailPanel'
import { KeyboardShortcutsModal } from '@/components/editor/KeyboardShortcutsModal'
import { CommandPalette } from '@/components/editor/CommandPalette'
import { SlidePreview, type TextEditTarget } from '@/components/editor/SlidePreview'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import api from '@/services/api'
import { conversionSlideImageUrl } from '@/utils/slideImage'
import type { Conversion, SlideTextStyle } from '@/types'
import { THEMES } from '@/types'

const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Verdana',
]

const FONT_WEIGHTS = [
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semi Bold', value: 600 },
  { label: 'Bold', value: 700 },
  { label: 'Extra Bold', value: 800 },
]

const COLOR_SWATCHES = ['#FFFFFF', '#111827', '#0F6E56', '#2563EB', '#7C3AED', '#F59E0B', '#EF4444']

type TextEditState = {
  field: 'title' | 'bullet'
  bulletIndex?: number
  fullText: string
  selectedText: string
  selectedStart?: number
  value: string
  style: SlideTextStyle
  top: number
  left: number
}

// ── Panel header shared by left and right sidebars ────────────────────────────
function PanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 h-11 border-b border-pm-border flex-shrink-0 bg-pm-surface">
      <span className="text-xs font-semibold uppercase tracking-wider text-pm-muted">{title}</span>
      {action}
    </div>
  )
}

// ── Share modal ────────────────────────────────────────────────────────────────
function ShareModal({
  conversionId, shareToken, isShared, onClose, onShared, onUnshared,
}: {
  conversionId: string
  shareToken: string | null
  isShared: boolean
  onClose: () => void
  onShared: (token: string) => void
  onUnshared: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : null

  const handleEnable = async () => {
    setLoading(true)
    try {
      const { data } = await api.post(`/conversions/${conversionId}/share`)
      onShared(data.share_token)
      toast.success('Sharing enabled')
    } catch {
      toast.error('Failed to enable sharing')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      await api.delete(`/conversions/${conversionId}/share`)
      onUnshared()
      toast.success('Sharing disabled')
    } catch {
      toast.error('Failed to disable sharing')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' as const }}
        className="bg-pm-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pm-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pm-teal-light flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                <circle cx="11" cy="2.5" r="1.5" stroke="#0F6E56" strokeWidth="1.3" />
                <circle cx="11" cy="11.5" r="1.5" stroke="#0F6E56" strokeWidth="1.3" />
                <circle cx="2.5" cy="7" r="1.5" stroke="#0F6E56" strokeWidth="1.3" />
                <path d="M9.5 3.3L4 6.2M4 7.8l5.5 2.9" stroke="#0F6E56" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-pm-primary">Share Presentation</h2>
          </div>
          <button onClick={onClose} className="text-pm-muted hover:text-pm-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Toggle row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-pm-primary">Public link</p>
              <p className="text-xs text-pm-muted mt-0.5">Anyone with the link can view this presentation</p>
            </div>
            <button
              onClick={isShared ? handleDisable : handleEnable}
              disabled={loading}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-60',
                isShared ? 'bg-pm-teal' : 'bg-pm-surface-3'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-pm-surface shadow transition-all duration-200',
                isShared ? 'left-5' : 'left-0.5'
              )} />
            </button>
          </div>

          {/* URL box */}
          {isShared && shareUrl && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl border border-pm-border/60 bg-pm-surface-2"
            >
              <span className="flex-1 text-xs text-pm-primary font-mono truncate">{shareUrl}</span>
              <button
                onClick={handleCopy}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0',
                  copied
                    ? 'bg-pm-teal text-white'
                    : 'bg-pm-surface border border-pm-border text-pm-primary hover:bg-pm-surface-2'
                )}
              >
                {copied ? (
                  <><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied!</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M4 4V3A1.5 1.5 0 012.5 1.5h0A1.5 1.5 0 011 3v7A1.5 1.5 0 002.5 11.5H4" stroke="currentColor" strokeWidth="1.3" /></svg> Copy</>
                )}
              </button>
            </motion.div>
          )}

          {isShared && shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-pm-teal font-semibold hover:underline"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M6 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h8A1.5 1.5 0 0012 11.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M8 1h5v5M13 1L7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Open in new tab
            </a>
          )}
        </div>

        <div className="px-6 py-3 border-t border-pm-border bg-pm-surface-2 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-pm-muted hover:text-pm-primary transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Editor toolbar ─────────────────────────────────────────────────────────────
function EditorBar({ conversionId, conversionName, isSaving, hasError, backTo, showWatermark, onToggleWatermark, onPresent, onShare, isShared }: {
  conversionId: string
  conversionName?: string
  isSaving?: boolean
  hasError?: boolean
  backTo?: { path: string; label: string }
  showWatermark?: boolean
  onToggleWatermark?: () => void
  onPresent?: () => void
  onShare?: () => void
  isShared?: boolean
}) {
  const isDirty = useEditorStore((s) => s.isDirty)
  const name = (conversionName?.replace(/\.[^.]+$/, '') ?? 'Untitled Presentation')
    .replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 40).trimEnd()
  const [exportingFormat, setExportingFormat] = useState<'pptx' | 'pdf' | 'docx' | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleExport = async (format: 'pptx' | 'pdf' | 'docx') => {
    setDropdownOpen(false)
    setExportingFormat(format)
    const mimeMap = {
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    try {
      const { data } = await api.post<{ download_url: string }>(`/conversions/${conversionId}/export?format=${format}`)
      const url = data.download_url
      const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
      const stripScheme = (u: string) => u.replace(/^https?:\/\//, '').replace(/^(127\.0\.0\.1|0\.0\.0\.0)(?=:)/, 'localhost')
      const isLocalUrl = apiBase && stripScheme(url).startsWith(stripScheme(apiBase))
      if (isLocalUrl) {
        const path = url.replace(/^https?:\/\/[^/]+\/api\/v1/, '')
        const res = await api.get(path, { responseType: 'blob' })
        const blob = new Blob([res.data], { type: mimeMap[format] })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${name}.${format}`
        a.click()
        URL.revokeObjectURL(blobUrl)
      } else {
        window.open(url, '_blank')
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <header className="flex-shrink-0 bg-pm-surface border-b border-pm-border flex items-center justify-between px-5" style={{ minHeight: '52px' }}>
      {/* Left: nav */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={backTo?.path ?? '/projects'}
          replace
          className="flex items-center gap-1.5 text-pm-muted hover:text-pm-primary text-sm transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backTo?.label ?? 'Projects'}
        </Link>
        <div className="w-px h-4 bg-pm-border flex-shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-pm-teal flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="10" height="13" rx="1.5" fill="white" fillOpacity="0.3" />
              <rect x="0" y="2" width="11" height="13" rx="1.5" fill="white" />
              <rect x="2" y="5" width="7" height="1" rx="0.5" fill="#0F6E56" />
              <rect x="2" y="7.5" width="5" height="1" rx="0.5" fill="#0F6E56" fillOpacity="0.5" />
              <rect x="2" y="10" width="6" height="1" rx="0.5" fill="#0F6E56" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-pm-primary truncate max-w-xs">{name}</span>
        </div>
      </div>

      {/* Right: status + export */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className={cn('text-xs flex items-center gap-1.5 transition-colors',
          hasError ? 'text-pm-danger' : (isSaving || isDirty) ? 'text-pm-muted' : 'text-pm-teal'
        )}>
          {hasError ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-pm-danger inline-block" />Save failed</>
          ) : (isSaving || isDirty) ? (
            <><Spinner size="sm" />Saving…</>
          ) : (
            <>
              <motion.svg
                key="saved-check"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' as const }}
                />
              </motion.svg>
              Saved
            </>
          )}
        </span>

        {/* Watermark toggle */}
        <button
          onClick={onToggleWatermark}
          title={showWatermark ? 'Hide watermark' : 'Show watermark'}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors',
            showWatermark
              ? 'border-pm-border text-pm-muted hover:text-pm-primary hover:border-pm-border-strong'
              : 'border-transparent text-pm-muted/50 hover:text-pm-muted'
          )}
        >
          {showWatermark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
          WAC
        </button>

        {/* Share button */}
        <button
          onClick={onShare}
          title="Share presentation"
          className={cn(
            'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
            isShared
              ? 'border-pm-teal/40 bg-pm-teal-light text-pm-teal hover:bg-pm-teal/15'
              : 'border-pm-border text-pm-muted hover:text-pm-primary hover:border-pm-border-strong'
          )}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="11" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="11" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="2.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 3.3L4 6.2M4 7.8l5.5 2.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {isShared ? 'Shared' : 'Share'}
        </button>

        {/* Present button */}
        <button
          onClick={onPresent}
          title="Presentation mode (P)"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-pm-border text-pm-muted hover:text-pm-primary hover:border-pm-border-strong transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          Present
        </button>

        {/* Split export button with dropdown */}
        <div className="relative flex">
          <Button
            size="sm"
            loading={exportingFormat === 'pptx'}
            disabled={exportingFormat !== null}
            className="rounded-r-none border-r border-r-white/20"
            onClick={() => handleExport('pptx')}
          >
            <svg className="w-3.5 h-3.5 mr-1.5 inline-block -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exportingFormat ? `Exporting ${exportingFormat.toUpperCase()}…` : 'Export & Download'}
          </Button>
          <button
            disabled={exportingFormat !== null}
            className="flex items-center px-2 bg-pm-teal hover:bg-pm-teal-hover text-white rounded-r-md border-l border-l-white/20 transition-colors disabled:opacity-50"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="More export formats"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-pm-surface border border-pm-border rounded-lg shadow-lg py-1 min-w-[160px]">
                {([
                  { fmt: 'pptx', label: 'Download PPTX' },
                  { fmt: 'pdf',  label: 'Download PDF' },
                  { fmt: 'docx', label: 'Download Word' },
                ] as { fmt: 'pptx' | 'pdf' | 'docx'; label: string }[]).map(({ fmt, label }) => (
                  <button
                    key={fmt}
                    className="w-full text-left px-4 py-2 text-sm text-pm-primary hover:bg-pm-surface-2 transition-colors"
                    onClick={() => handleExport(fmt)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const fromState = (location.state as { from?: string } | null)?.from
  const backTo =
    fromState === 'dashboard'       ? { path: '/dashboard',         label: 'Dashboard'        } :
    fromState === 'templates'       ? { path: '/templates',         label: 'Templates'        } :
    fromState === 'admin'           ? { path: '/admin/projects',    label: 'Admin Projects'   } :
    fromState === 'admin-templates' ? { path: '/admin/templates',   label: 'Admin Templates'  } :
                                      { path: '/projects',          label: 'Projects'         }
  const queryClient = useQueryClient()
  useEffect(() => {
    if (fromState === 'admin') {
      return () => { void queryClient.invalidateQueries({ queryKey: ['admin-conversions'] }) }
    }
  }, [fromState, queryClient])

  const { setSlides, setConversionId, setActiveSlide, slides, activeSlideId, updateSlide, markSaved } = useEditorStore()
  const [showWatermark, setShowWatermark] = useState(true)
  const [showOriginal, setShowOriginal] = useState(false)
  const [origError, setOrigError] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [isShared, setIsShared] = useState(false)
  const autoPresented = useRef(false)

  const enterPresentationMode = useCallback(() => {
    setPresentationMode(true)
    document.documentElement.requestFullscreen().catch(() => {})
  }, [])

  const exitPresentationMode = useCallback(() => {
    setPresentationMode(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])

  // Sync state when browser native fullscreen exits (e.g. pressing Esc)
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setPresentationMode(false)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])
  const initialActiveSet = useRef(false)
  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const { data: conversion, isLoading, isFetching, isError, error } = useQuery<Conversion>({
    queryKey: ['conversion', id],
    queryFn: async () => {
      const res = await api.get(`/conversions/${id}`)
      return res.data
    },
    enabled: !!id,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  })
  const showSpinner = useDelayedLoading(isLoading)

  useEffect(() => {
    if (conversion) {
      setShareToken(conversion.share_token ?? null)
      setIsShared(conversion.is_shared ?? false)
    }
  }, [conversion?.share_token, conversion?.is_shared])

  useEffect(() => {
    if (!conversion) return
    setConversionId(conversion.id)
    if (conversion.slides && !initialActiveSet.current && !isFetching) {
      initialActiveSet.current = true
      setSlides(conversion.slides)
      const first = conversion.slides.find((s) => !s.is_deleted)
      if (first) setActiveSlide(first.id)
    }
  }, [conversion, isFetching, setSlides, setConversionId, setActiveSlide])

  useEffect(() => {
    if (conversion?.status === 'generating' && id) {
      navigate(`/generating/${id}`, { replace: true })
    }
  }, [conversion?.status, id, navigate])

  const visibleSlides = slides.filter((s) => !s.is_deleted)
  const activeSlide = visibleSlides.find((s) => s.id === activeSlideId)
  const activeIndex = visibleSlides.findIndex((s) => s.id === activeSlideId)
  const theme = THEMES.find((t) => t.id === conversion?.theme) ?? THEMES[THEMES.length - 1]

  const [textEditor, setTextEditor] = useState<TextEditState | null>(null)
  const [typoFocus, setTypoFocus] = useState<string>('title')

  // Reset typo focus to title whenever the active slide changes
  useEffect(() => { setTypoFocus('title') }, [activeSlideId])

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable
    if (isInput) return

    if (e.key === '?') { e.preventDefault(); setShowShortcuts((v) => !v) }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette((v) => !v) }
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); enterPresentationMode() }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (activeIndex < visibleSlides.length - 1) setActiveSlide(visibleSlides[activeIndex + 1].id)
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (activeIndex > 0) setActiveSlide(visibleSlides[activeIndex - 1].id)
    }
  }, [activeIndex, visibleSlides, setActiveSlide])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Auto-present when navigated from the Projects "Present" button
  const autoPresent = (location.state as { autoPresent?: boolean } | null)?.autoPresent
  useEffect(() => {
    if (autoPresent && !autoPresented.current && visibleSlides.length > 0 && !isLoading) {
      autoPresented.current = true
      enterPresentationMode()
    }
  }, [autoPresent, visibleSlides.length, isLoading, enterPresentationMode])

  useEffect(() => {
    if (!textEditor) return
    requestAnimationFrame(() => {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    })
  }, [textEditor])

  const openTextEditor = (target: TextEditTarget) => {
    const savedStyle = target.field === 'title'
      ? activeSlide?.text_styles?.title
      : target.bulletIndex !== undefined
        ? activeSlide?.text_styles?.bullets?.[String(target.bulletIndex)]
        : undefined
    setTextEditor({
      field: target.field,
      bulletIndex: target.bulletIndex,
      fullText: target.fullText,
      selectedText: target.selectedText,
      selectedStart: target.selectedStart,
      value: target.selectedText,
      style: {
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: target.field === 'title' ? 800 : 400,
        fontSize: target.field === 'title' ? 42 : 18,
        color: theme.text,
        italic: false,
        ...savedStyle,
      },
      top: Math.max(72, target.rect.top - 10),
      left: target.rect.left + target.rect.width / 2,
    })
  }

  const closeTextEditor = () => {
    window.getSelection()?.removeAllRanges()
    setTextEditor(null)
  }

  const saveTextEditor = () => {
    if (!activeSlide || !textEditor) return
    const replacement = textEditor.value.trim()
    if (!replacement) return

    const selectedIndex = textEditor.selectedStart ?? textEditor.fullText.indexOf(textEditor.selectedText)
    const nextText =
      textEditor.selectedText !== textEditor.fullText && selectedIndex >= 0
        ? `${textEditor.fullText.slice(0, selectedIndex)}${replacement}${textEditor.fullText.slice(selectedIndex + textEditor.selectedText.length)}`
        : replacement

    if (textEditor.field === 'title') {
      updateSlide(activeSlide.id, {
        title: nextText,
        text_styles: {
          ...(activeSlide.text_styles ?? {}),
          title: textEditor.style,
        },
      })
    } else if (textEditor.bulletIndex !== undefined) {
      const bullets = [...activeSlide.bullets]
      bullets[textEditor.bulletIndex] = nextText
      updateSlide(activeSlide.id, {
        bullets,
        text_styles: {
          ...(activeSlide.text_styles ?? {}),
          bullets: {
            ...(activeSlide.text_styles?.bullets ?? {}),
            [String(textEditor.bulletIndex)]: textEditor.style,
          },
        },
      })
    }

    closeTextEditor()
  }

  const { isSaving, hasError } = useAutoSave({
    slideId: activeSlide?.id ?? '',
    content: activeSlide
      ? JSON.stringify({ title: activeSlide.title, bullets: activeSlide.bullets, text_styles: activeSlide.text_styles, speaker_notes: activeSlide.speaker_notes, layout: activeSlide.layout, color_scheme: activeSlide.color_scheme, shape_style: activeSlide.shape_style })
      : '',
    onSave: async () => {
      if (!activeSlide) return
      await api.patch(`/slides/${activeSlide.id}`, {
        title: activeSlide.title,
        bullets: activeSlide.bullets,
        text_styles: activeSlide.text_styles ?? {},
        speaker_notes: activeSlide.speaker_notes,
        layout: activeSlide.layout,
        color_scheme: activeSlide.color_scheme,
        shape_style: activeSlide.shape_style,
      })
      markSaved()
    },
  })

  if (isLoading) {
    return <PageLoader show={showSpinner} fullScreen />
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-pm-muted">
        <p className="font-medium text-pm-primary">
          {status === 404 ? 'Presentation not found.' : 'Failed to load presentation.'}
        </p>
        <p className="text-sm">
          {status === 404
            ? 'It may have been deleted or you may not have access.'
            : 'Something went wrong. Please try again.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-pm-app overflow-hidden">
      {/* Top toolbar */}
      <EditorBar
        conversionId={id ?? ''}
        conversionName={conversion?.name ?? conversion?.original_filename}
        isSaving={isSaving}
        hasError={hasError}
        backTo={backTo}
        showWatermark={showWatermark}
        onToggleWatermark={() => setShowWatermark((v) => !v)}
        onPresent={enterPresentationMode}
        onShare={() => setShowShareModal(true)}
        isShared={isShared}
      />

      {/* Three-panel body */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel 1: Slides ── */}
        <aside className="w-64 flex flex-col bg-pm-surface/90 backdrop-blur-sm border-r border-pm-border flex-shrink-0">
          <PanelHeader
            title="Slides"
            action={
              <span className="text-xs text-pm-muted tabular-nums">
                {visibleSlides.length} {visibleSlides.length === 1 ? 'slide' : 'slides'}
              </span>
            }
          />
          <div className="flex-1 overflow-y-auto p-3">
            <SlideList conversionId={id ?? ''} theme={theme} />
          </div>
        </aside>

        {/* ── Panel 2: Canvas ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-pm-surface-3">
          {/* Canvas header bar */}
          <div className="h-11 border-b border-pm-border-strong bg-pm-surface flex items-center justify-between px-5 flex-shrink-0">
            {/* Slide name */}
            <span className="text-sm font-medium text-pm-primary truncate max-w-xs">
              {activeSlide ? activeSlide.title || 'Untitled Slide' : 'No slide selected'}
            </span>
            {/* Navigation */}
            {activeSlide && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setOrigError(false); setShowOriginal((v) => !v) }}
                  title="Toggle the original uploaded design (template decks)"
                  className={cn(
                    'px-2.5 h-7 rounded-lg border text-xs font-medium transition-colors mr-1',
                    showOriginal
                      ? 'border-pm-teal bg-pm-teal-light text-pm-teal'
                      : 'border-pm-border text-pm-muted hover:text-pm-primary'
                  )}
                >
                  {showOriginal ? 'Editing view' : 'Original design'}
                </button>
                <button
                  onClick={() => activeIndex > 0 && setActiveSlide(visibleSlides[activeIndex - 1].id)}
                  disabled={activeIndex === 0}
                  className="w-7 h-7 rounded-lg border border-pm-border flex items-center justify-center text-pm-muted hover:text-pm-primary hover:border-pm-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs text-pm-muted tabular-nums font-medium">
                  {activeIndex + 1} <span className="text-pm-subtle">/</span> {visibleSlides.length}
                </span>
                <button
                  onClick={() => activeIndex < visibleSlides.length - 1 && setActiveSlide(visibleSlides[activeIndex + 1].id)}
                  disabled={activeIndex === visibleSlides.length - 1}
                  className="w-7 h-7 rounded-lg border border-pm-border flex items-center justify-center text-pm-muted hover:text-pm-primary hover:border-pm-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-pm-border mx-1" />
                <button
                  onClick={() => setShowNotes(v => !v)}
                  title="Toggle speaker notes"
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 h-7 rounded-lg border text-xs font-medium transition-colors',
                    showNotes
                      ? 'border-pm-teal bg-pm-teal-light text-pm-teal'
                      : 'border-pm-border text-pm-muted hover:text-pm-primary'
                  )}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M4 5h6M4 7.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  Notes
                </button>
              </div>
            )}
          </div>

          {/* Slide canvas + notes */}
          <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto flex items-center justify-center p-10 min-h-0">
            {activeSlide ? (
              showOriginal ? (
                <div className="w-full max-w-4xl drop-shadow-2xl">
                  {origError ? (
                    <div className="bg-pm-surface rounded-xl border border-pm-border p-10 text-center text-sm text-pm-muted">
                      This deck has no original uploaded design (it wasn't created from an
                      uploaded template). Use “Editing view”.
                    </div>
                  ) : (
                    <img
                      src={conversionSlideImageUrl(id ?? '', activeIndex)}
                      alt={`Original slide ${activeIndex + 1}`}
                      onError={() => setOrigError(true)}
                      className="w-full rounded-xl border border-pm-border bg-pm-surface"
                    />
                  )}
                  <p className="text-center text-xs text-pm-muted mt-2">
                    Original uploaded design (read-only). Text edits apply on export.
                  </p>
                </div>
              ) : (
              <div className="w-full max-w-4xl drop-shadow-2xl">
                <SlidePreview
                  slide={activeSlide}
                  theme={theme}
                  showWatermark={showWatermark}
                  logoUrl={conversion?.client_logo_url}
                  onTextEdit={openTextEditor}
                  onTypoFocus={(field, bulletIndex) =>
                    setTypoFocus(field === 'title' ? 'title' : `bullet_${bulletIndex ?? 0}`)
                  }
                  onUpdateText={(field, value, bulletIndex) => {
                    if (field === 'title') {
                      updateSlide(activeSlide.id, { title: value })
                    } else if (bulletIndex !== undefined) {
                      const bullets = [...activeSlide.bullets]
                      bullets[bulletIndex] = value
                      updateSlide(activeSlide.id, { bullets })
                    }
                  }}
                />
              </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-3 text-pm-subtle">
                <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <p className="text-sm">Select a slide to preview</p>
              </div>
            )}
          </div>

          {/* Speaker notes panel */}
          <AnimatePresence initial={false}>
            {showNotes && (
              <motion.div
                key="notes-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' as const }}
                className="flex-shrink-0 border-t border-pm-border-strong bg-pm-surface overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-2 border-b border-pm-border">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-pm-muted flex-shrink-0">
                    <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M4 5h6M4 7.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span className="text-[11px] font-semibold text-pm-muted uppercase tracking-wider">Speaker Notes</span>
                  {activeSlide && (
                    <span className="ml-auto text-[10px] text-pm-muted tabular-nums">
                      {activeSlide.speaker_notes?.length ?? 0} chars
                    </span>
                  )}
                </div>
                <textarea
                  className="w-full px-5 py-3 text-sm text-pm-primary placeholder:text-pm-muted resize-none focus:outline-none bg-transparent leading-relaxed"
                  rows={4}
                  value={activeSlide?.speaker_notes ?? ''}
                  placeholder={activeSlide ? 'Add speaker notes for this slide…' : 'Select a slide to add notes'}
                  disabled={!activeSlide}
                  onChange={e => activeSlide && updateSlide(activeSlide.id, { speaker_notes: e.target.value })}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </main>

        {/* ── Panel 3: Properties ── */}
        <aside className="w-80 flex flex-col bg-pm-surface/90 backdrop-blur-sm border-l border-pm-border flex-shrink-0">
          <PanelHeader title="Properties" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSlideId ?? 'none'}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' as const }}
              className="flex-1 overflow-y-auto"
            >
              <SlideDetailPanel
                typoFocus={typoFocus}
              />
            </motion.div>
          </AnimatePresence>
        </aside>

      </div>

      {/* Share modal */}
      {showShareModal && id && (
        <ShareModal
          conversionId={id}
          shareToken={shareToken}
          isShared={isShared}
          onClose={() => setShowShareModal(false)}
          onShared={(token) => { setShareToken(token); setIsShared(true) }}
          onUnshared={() => setIsShared(false)}
        />
      )}

      {/* 5.1 Keyboard shortcuts modal */}
      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* 5.2 Command palette */}
      <CommandPalette open={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      {/* 5.3 Presentation mode */}
      <AnimatePresence>
        {presentationMode && activeSlide && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') exitPresentationMode()
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                if (activeIndex < visibleSlides.length - 1) setActiveSlide(visibleSlides[activeIndex + 1].id)
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (activeIndex > 0) setActiveSlide(visibleSlides[activeIndex - 1].id)
              }
            }}
            tabIndex={-1}
          >
            {/* Main slide area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden px-16 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  className="w-full max-w-[90vw]"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.28, ease: 'easeOut' as const }}
                >
                  <SlidePreview
                    slide={activeSlide}
                    theme={theme}
                    showWatermark={showWatermark}
                    logoUrl={conversion?.client_logo_url}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Left arrow — edge */}
              <button
                onClick={() => activeIndex > 0 && setActiveSlide(visibleSlides[activeIndex - 1].id)}
                disabled={activeIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right arrow — edge */}
              <button
                onClick={() => activeIndex < visibleSlides.length - 1 && setActiveSlide(visibleSlides[activeIndex + 1].id)}
                disabled={activeIndex === visibleSlides.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Close — top right */}
              <button
                onClick={exitPresentationMode}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                title="Exit fullscreen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            </div>

            {/* Slide count */}
            <div className="flex-shrink-0 flex items-center justify-center py-3">
              <span className="text-white/40 text-sm tabular-nums font-medium tracking-widest select-none">
                {activeIndex + 1} <span className="text-white/20 mx-1">/</span> {visibleSlides.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {textEditor && (
        <div
          className="fixed z-50 w-[380px] -translate-x-1/2 -translate-y-full rounded-xl border border-pm-border bg-pm-surface p-3 shadow-2xl"
          style={{ top: textEditor.top, left: textEditor.left }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">
              Text Editor
            </p>
            <button
              type="button"
              onClick={closeTextEditor}
              className="h-6 w-6 rounded-md text-pm-muted hover:bg-pm-surface-3 hover:text-pm-primary"
              aria-label="Close text editor"
            >
              ×
            </button>
          </div>
          <textarea
            ref={editInputRef}
            rows={2}
            value={textEditor.value}
            onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                closeTextEditor()
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                saveTextEditor()
              }
            }}
            className="w-full resize-none rounded-lg border border-pm-border bg-pm-surface px-3 py-2 text-sm text-pm-primary outline-none transition focus:ring-2 focus:ring-pm-teal"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Font</span>
              <select
                value={textEditor.style.fontFamily ?? 'Plus Jakarta Sans'}
                onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, fontFamily: e.target.value } })}
                className="h-9 w-full rounded-lg border border-pm-border bg-pm-surface px-2 text-xs text-pm-primary outline-none focus:ring-2 focus:ring-pm-teal"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Weight</span>
              <select
                value={textEditor.style.fontWeight ?? 400}
                onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, fontWeight: Number(e.target.value) } })}
                className="h-9 w-full rounded-lg border border-pm-border bg-pm-surface px-2 text-xs text-pm-primary outline-none focus:ring-2 focus:ring-pm-teal"
              >
                {FONT_WEIGHTS.map((weight) => (
                  <option key={weight.value} value={weight.value}>{weight.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Size</span>
              <input
                type="number"
                min={6}
                max={96}
                value={textEditor.style.fontSize ?? 18}
                onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, fontSize: Number(e.target.value) } })}
                className="h-9 w-full rounded-lg border border-pm-border bg-pm-surface px-2 text-xs text-pm-primary outline-none focus:ring-2 focus:ring-pm-teal"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Color</span>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-pm-border px-2">
                <input
                  type="color"
                  value={textEditor.style.color ?? theme.text}
                  onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, color: e.target.value } })}
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-xs text-pm-primary">{textEditor.style.color ?? theme.text}</span>
              </div>
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setTextEditor({ ...textEditor, style: { ...textEditor.style, color } })}
                  className="h-6 w-6 rounded-full border border-pm-border ring-offset-2 transition hover:ring-2 hover:ring-pm-teal"
                  style={{ backgroundColor: color }}
                  aria-label={`Set color ${color}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTextEditor({ ...textEditor, style: { ...textEditor.style, italic: !textEditor.style.italic } })}
              className={cn(
                'h-8 rounded-lg border px-3 text-xs font-semibold italic transition',
                textEditor.style.italic
                  ? 'border-pm-teal bg-pm-teal-light text-pm-teal'
                  : 'border-pm-border text-pm-muted hover:text-pm-primary'
              )}
            >
              I
            </button>
          </div>

          <div
            className="mt-3 rounded-lg border border-pm-border bg-pm-surface-2 px-3 py-2 text-sm"
            style={{
              fontFamily: `"${textEditor.style.fontFamily ?? 'Plus Jakarta Sans'}", sans-serif`,
              fontWeight: textEditor.style.fontWeight ?? 400,
              fontSize: `${Math.min(32, textEditor.style.fontSize ?? 18)}px`,
              color: textEditor.style.color ?? theme.text,
              fontStyle: textEditor.style.italic ? 'italic' : 'normal',
            }}
          >
            {textEditor.value || 'Preview'}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-pm-border pt-3">
            <button
              type="button"
              onClick={closeTextEditor}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-pm-muted hover:bg-pm-surface-3 hover:text-pm-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveTextEditor}
              disabled={!textEditor.value.trim()}
              className="rounded-lg bg-pm-teal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pm-teal-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
