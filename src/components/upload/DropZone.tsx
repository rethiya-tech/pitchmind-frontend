import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
}

interface DropZoneProps {
  onFile: (file: File) => void
  file?: File | null
  disabled?: boolean
}

export function DropZone({ onFile, file, disabled }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0])
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled,
    onDropRejected: () => toast.error('Unsupported file type. Please upload PDF, DOCX, TXT, or MD.'),
  })

  return (
    <div
      {...getRootProps()}
      data-testid="dropzone"
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-pm-teal bg-pm-teal-light'
          : 'border-pm-border hover:border-pm-teal hover:bg-gray-50',
        { 'opacity-50 cursor-not-allowed': disabled }
      )}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="space-y-1">
          <div className="text-2xl">📄</div>
          <p className="font-medium text-pm-primary">{file.name}</p>
          <p className="text-sm text-pm-muted">{(file.size / 1024).toFixed(1)} KB</p>
          <p className="text-xs text-pm-teal">Click or drag to replace</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-3xl">☁️</div>
          <p className="font-medium text-pm-primary">
            {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-sm text-pm-muted">PDF, DOCX, TXT, or MD — up to 10MB</p>
        </div>
      )}
    </div>
  )
}
