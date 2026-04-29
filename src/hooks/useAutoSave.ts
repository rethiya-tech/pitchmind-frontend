import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

interface AutoSaveOptions {
  slideId: string
  content: string
  onSave: () => Promise<void>
}

interface AutoSaveResult {
  isSaving: boolean
  hasError: boolean
}

export function useAutoSave({ slideId, content, onSave }: AutoSaveOptions): AutoSaveResult {
  const [isSaving, setIsSaving] = useState(false)
  const [hasError, setHasError] = useState(false)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(async () => {
      flushSync(() => {
        setIsSaving(true)
        setHasError(false)
      })
      try {
        await onSaveRef.current()
      } catch {
        setHasError(true)
      } finally {
        setIsSaving(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [content, slideId])

  return { isSaving, hasError }
}
