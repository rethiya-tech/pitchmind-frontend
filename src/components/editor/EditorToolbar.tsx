import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useEditorStore } from '@/stores/editorStore'
import api from '@/services/api'
import { cn } from '@/utils/cn'

interface EditorToolbarProps {
  conversionId: string
  isSaving?: boolean
  hasError?: boolean
}

export function EditorToolbar({ conversionId, isSaving, hasError }: EditorToolbarProps) {
  const isDirty = useEditorStore((s) => s.isDirty)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { data } = await api.post<{ download_url: string }>(`/conversions/${conversionId}/export`)
      const url = data.download_url
      const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
      const isLocalUrl = apiBase && url.startsWith(apiBase)

      if (isLocalUrl) {
        const path = url.slice(`${apiBase}/api/v1`.length)
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
      setIsExporting(false)
    }
  }

  return (
    <header className="h-14 bg-pm-surface border-b border-pm-border flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-pm-muted hover:text-pm-primary text-sm transition-colors">
          ← Dashboard
        </Link>
        <span className="text-pm-border">|</span>
        <span className="text-sm font-medium text-pm-primary">Slide Editor</span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            'text-xs transition-colors',
            (isSaving || isDirty) ? 'text-pm-muted' : hasError ? 'text-pm-danger' : 'text-pm-teal'
          )}
        >
          {hasError ? (
            'Save failed'
          ) : (isSaving || isDirty) ? (
            <span className="flex items-center gap-1">
              <Spinner size="sm" />
              Saving...
            </span>
          ) : (
            'Saved'
          )}
        </span>
        <Button size="sm" loading={isExporting} onClick={handleExport}>
          Export / Download
        </Button>
      </div>
    </header>
  )
}
