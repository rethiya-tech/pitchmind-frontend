import { UploadForm } from '@/components/upload/UploadForm'

export function UploadPage() {
  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-bold text-pm-primary">New Presentation</h1>
        <p className="text-sm text-pm-muted mt-0.5">
          Upload a document, configure your options, and generate a polished slide deck.
        </p>
      </div>

      {/* Three-panel grid — fills remaining height */}
      <div className="flex-1 min-h-0">
        <UploadForm />
      </div>
    </div>
  )
}
