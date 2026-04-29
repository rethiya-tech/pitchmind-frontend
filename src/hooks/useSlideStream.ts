import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import type { Slide } from '@/types'

interface StreamState {
  slides: Slide[]
  progress: number
  total: number
  isDone: boolean
  error: string | null
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await api.post<{ access_token: string }>('/auth/refresh')
    const newToken = res.data.access_token
    useAuthStore.getState().setAuth(newToken, useAuthStore.getState().user!)
    return newToken
  } catch {
    return null
  }
}

export function useSlideStream(conversionId: string | null) {
  const queryClient = useQueryClient()
  const tokenRef = useRef<string | null>(useAuthStore.getState().token)
  const esRef = useRef<EventSource | null>(null)
  const retriedRef = useRef(false)
  const [state, setState] = useState<StreamState>({
    slides: [],
    progress: 0,
    total: 0,
    isDone: false,
    error: null,
  })

  // Keep tokenRef in sync with store so reconnect always uses latest token
  useEffect(() => {
    return useAuthStore.subscribe((s) => {
      tokenRef.current = s.token
    })
  }, [])

  useEffect(() => {
    if (!conversionId) return
    retriedRef.current = false

    function openStream(token: string | null) {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }

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

      // Named SSE error event (server-sent `event: error\ndata: {...}`)
      es.addEventListener('error', (e: MessageEvent) => {
        if (e.data) {
          const data = JSON.parse(e.data) as { message: string }
          setState((prev) => ({ ...prev, error: data.message ?? 'Generation failed' }))
        }
        es.close()
      })

      // Connection-level error (HTTP 401, network drop, etc.)
      es.onerror = () => {
        es.close()
        esRef.current = null

        // Retry once with a refreshed token
        if (!retriedRef.current) {
          retriedRef.current = true
          void refreshAccessToken().then((newToken) => {
            if (newToken) {
              openStream(newToken)
            } else {
              setState((prev) => ({
                ...prev,
                error: prev.error ?? 'Connection failed — please try again',
              }))
            }
          })
        } else {
          setState((prev) => ({
            ...prev,
            error: prev.error ?? 'Connection failed — please try again',
          }))
        }
      }
    }

    openStream(tokenRef.current)

    return () => {
      esRef.current?.close()
      esRef.current = null
    }
  }, [conversionId, queryClient])

  return state
}
