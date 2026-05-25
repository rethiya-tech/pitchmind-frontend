import { UploadForm } from '@/components/upload/UploadForm'

export function UploadPage() {
  return (
    <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0">
        <h1 className="text-lg font-bold text-pm-primary">New Presentation</h1>
        <p className="text-sm text-pm-muted mt-0.5">
          Upload a document, configure your options, and generate a polished slide deck.
        </p>
      </div>

      {/* Three-panel grid — fills remaining height via flex passthrough */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <UploadForm />
      </div>
    </div>
  )
}
