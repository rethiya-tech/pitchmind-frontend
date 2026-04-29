import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import type { Slide } from '@/types'

interface StreamState {
  slides: Slide[]
  progress: number
  total: number
  isDone: boolean
  error: string | null
}

export function useSlideStream(conversionId: string | null) {
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)
  const esRef = useRef<EventSource | null>(null)
  const [state, setState] = useState<StreamState>({
    slides: [],
    progress: 0,
    total: 0,
    isDone: false,
    error: null,
  })

  useEffect(() => {
    if (!conversionId) return

    const base = import.meta.env.VITE_API_URL ?? ''
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
    const url = `${base}/api/v1/conversions/${conversionId}/stream${tokenParam}`
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('slide_done', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as { slide: Slide }
      setState((prev) => ({ ...prev, slides: [...prev.slides, data.slide] }))
    })

    es.addEventListener('progress', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as { completed: number; total: number }
      setState((prev) => ({ ...prev, progress: data.completed, total: data.total }))
    })

    es.addEventListener('done', () => {
      setState((prev) => ({ ...prev, isDone: true }))
      void queryClient.invalidateQueries({ queryKey: ['conversion', conversionId] })
      es.close()
    })

    es.addEventListener('error', (e: MessageEvent) => {
      const data = e.data ? (JSON.parse(e.data) as { message: string }) : null
      setState((prev) => ({ ...prev, error: data?.message ?? 'Stream error' }))
      es.close()
    })

    es.onerror = () => {
      setState((prev) => ({ ...prev, error: prev.error ?? 'Stream failed — connection lost' }))
      es.close()
    }

    return () => {
      es.close()
      esRef.current = null
    }
  // token intentionally omitted — stream reconnects only if conversionId changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversionId, queryClient])

  return state
}
