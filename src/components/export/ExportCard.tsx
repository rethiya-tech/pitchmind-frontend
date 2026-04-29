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

export function ExportCard({ conversion }: ExportCardProps) {
  const [loadingText, setLoadingText] = useState<string | null>(null)
  const theme = THEMES.find((t) => t.id === conversion.theme) ?? THEMES[0]
  const slideCount = conversion.slides?.filter((s) => !s.is_deleted).length ?? conversion.slide_count ?? 0

  const handleDownload = async () => {
    flushSync(() => setLoadingText('Preparing download...'))
    try {
      const { data } = await api.post<{ download_url: string }>(`/conversions/${conversion.id}/export`)
      const url = data.download_url

      // If the download URL points to our own backend, fetch with auth and trigger blob download
      const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
      const apiV1Prefix = `${apiBase}/api/v1`
      const isLocalUrl = apiBase && url.startsWith(apiBase)

      if (isLocalUrl) {
        const path = url.startsWith(apiV1Prefix) ? url.slice(apiV1Prefix.length) : url.slice(apiBase.length)
        const res = await api.get(path, { responseType: 'blob' })
        const blob = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'presentation.pptx'
        a.click()
        URL.revokeObjectURL(blobUrl)
      } else {
        window.open(url, '_blank')
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setLoadingText(null)
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

      <div
        className="w-full h-24 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="text-center">
          <div className="text-white font-bold text-lg opacity-90">{theme.name}</div>
          <div className="text-xs opacity-60 mt-1" style={{ color: theme.accent }}>
            PitchMind
          </div>
        </div>
      </div>

      {loadingText && (
        <p className="text-sm text-center text-pm-teal font-medium">{loadingText}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        loading={!!loadingText}
        disabled={!!loadingText}
        onClick={handleDownload}
      >
        Download PPTX
      </Button>

      <div className="text-center">
        <Link
          to={`/editor/${conversion.id}`}
          className="text-sm text-pm-teal hover:text-pm-teal-hover transition-colors"
        >
          ← Back to Editor
        </Link>
      </div>
    </div>
  )
}
