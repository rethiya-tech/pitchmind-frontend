import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils/cn'

interface EditorToolbarProps {
  conversionId: string
  isSaving?: boolean
  hasError?: boolean
}

export function EditorToolbar({ conversionId, isSaving, hasError }: EditorToolbarProps) {
  const isDirty = useEditorStore((s) => s.isDirty)

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
        <Link to={`/export/${conversionId}`}>
          <Button size="sm">
            Export / Download
          </Button>
        </Link>
      </div>
    </header>
  )
}
