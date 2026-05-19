import { useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { THEMES } from '@/types'
import api from '@/services/api'
import type { Conversion } from '@/types'

interface ExportCardProps {
  conversion: Conversion
}

type ExportFormat = 'pptx' | 'pdf' | 'docx'

const FORMAT_CONFIG: Record<ExportFormat, { label: string; mime: string; ext: string; icon: React.ReactNode }> = {
  pptx: {
    label: 'Download PPTX',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ext: 'pptx',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
      </svg>
    ),
  },
  pdf: {
    label: 'Download PDF',
    mime: 'application/pdf',
    ext: 'pdf',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  docx: {
    label: 'Download Word',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ext: 'docx',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
}

export function ExportCard({ conversion }: ExportCardProps) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null)
  const theme = THEMES.find((t) => t.id === conversion.theme) ?? THEMES[0]
  const slideCount = conversion.slides?.filter((s) => !s.is_deleted).length ?? conversion.slide_count ?? 0
  const usesOriginalDesign = !!conversion.source_pptx_key || conversion.upload_id != null
  const baseName = (conversion.original_filename || conversion.name || 'presentation').replace(/\.[^.]+$/, '')

  const handleDownload = async (format: ExportFormat) => {
    flushSync(() => setLoadingFormat(format))
    try {
      const { data } = await api.post<{ download_url: string }>(
        `/conversions/${conversion.id}/export?format=${format}`
      )
      const url = data.download_url
      const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
      const stripScheme = (u: string) => u.replace(/^https?:\/\//, '').replace(/^(127\.0\.0\.1|0\.0\.0\.0)(?=:)/, 'localhost')
      const isLocalUrl = apiBase && stripScheme(url).startsWith(stripScheme(apiBase))

      if (isLocalUrl) {
        const path = url.replace(/^https?:\/\/[^/]+\/api\/v1/, '')
        const res = await api.get(path, { responseType: 'blob' })
        const blob = new Blob([res.data], { type: FORMAT_CONFIG[format].mime })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${baseName}.${FORMAT_CONFIG[format].ext}`
        a.click()
        URL.revokeObjectURL(blobUrl)
      } else {
        window.open(url, '_blank')
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setLoadingFormat(null)
    }
  }

  return (
    <div className="bg-pm-surface rounded-2xl border border-pm-border p-8 space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-pm-primary">Ready to Download</h2>
        <p className="text-sm text-pm-muted">
          {slideCount} slide{slideCount !== 1 ? 's' : ''}
        </p>
      </div>

      {usesOriginalDesign ? (
        <div className="w-full h-24 rounded-xl flex items-center justify-center bg-gradient-to-r from-slate-700 to-slate-900">
          <div className="text-center">
            <div className="text-white font-bold text-lg opacity-90">Original Design</div>
            <div className="text-xs text-slate-300 opacity-80 mt-1">Your uploaded template design will be preserved</div>
          </div>
        </div>
      ) : (
        <div
          className="w-full h-24 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="text-center">
            <div className="text-white font-bold text-lg opacity-90">{theme.name}</div>
            <div className="text-xs opacity-60 mt-1" style={{ color: theme.accent }}>
              PitchMind
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(['pptx', 'pdf', 'docx'] as ExportFormat[]).map((fmt) => {
          const cfg = FORMAT_CONFIG[fmt]
          const isLoading = loadingFormat === fmt
          const isDisabled = loadingFormat !== null
          return (
            <Button
              key={fmt}
              className="w-full"
              size="lg"
              variant={fmt === 'pptx' ? 'primary' : 'secondary'}
              loading={isLoading}
              disabled={isDisabled}
              onClick={() => handleDownload(fmt)}
            >
              {!isLoading && <span className="mr-2 inline-flex">{cfg.icon}</span>}
              {isLoading ? `Preparing ${cfg.ext.toUpperCase()}…` : cfg.label}
            </Button>
          )
        })}
      </div>

      <div className="text-center">
        <Link
          to={`/editor/${conversion.id}`}
          replace
          className="text-sm text-pm-teal hover:text-pm-teal-hover transition-colors"
        >
          ← Back to Editor
        </Link>
      </div>
    </div>
  )
}
