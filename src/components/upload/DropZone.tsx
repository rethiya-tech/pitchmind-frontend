import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
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
    onDropRejected: () => toast.error('Unsupported file type. Please upload PDF, DOCX, PPTX, TXT, or MD.'),
  })

  return (
    <div
      {...getRootProps()}
      data-testid="dropzone"
      className={cn(
        'relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-pm-teal bg-pm-teal-light'
          : 'border-pm-border hover:border-pm-teal hover:bg-gray-50',
        { 'opacity-50 cursor-not-allowed': disabled }
      )}
    >
      <input {...getInputProps()} />

      {/* Breathing glow ring when dragging */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.012, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ boxShadow: '0 0 0 3px rgba(15,110,86,0.35), inset 0 0 20px rgba(15,110,86,0.08)' }}
          />
        )}
      </AnimatePresence>

      {file ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-1"
        >
          <div className="text-2xl">📄</div>
          <p className="font-medium text-pm-primary">{file.name}</p>
          <p className="text-sm text-pm-muted">{(file.size / 1024).toFixed(1)} KB</p>
          <p className="text-xs text-pm-teal">Click or drag to replace</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <motion.div
            className="text-3xl"
            animate={isDragActive ? { y: [-3, 3, -3], scale: [1, 1.15, 1] } : { y: 0, scale: 1 }}
            transition={{ duration: 0.9, repeat: isDragActive ? Infinity : 0, ease: 'easeInOut' as const }}
          >
            ☁️
          </motion.div>
          <p className="font-medium text-pm-primary">
            {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-sm text-pm-muted">PDF, DOCX, PPTX, TXT, or MD — up to 10MB</p>
        </div>
      )}
    </div>
  )
}
