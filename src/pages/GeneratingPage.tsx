import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useSlideStream } from '@/hooks/useSlideStream'
import { ProgressBar } from '@/components/generation/ProgressBar'
import { SlidePills } from '@/components/generation/SlidePills'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import type { Conversion } from '@/types'

function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return displayed
}

function SparkleParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-pm-teal"
          style={{ top: '50%', left: '50%' }}
          animate={{
            x: [0, Math.cos((i / 4) * Math.PI * 2) * 28, Math.cos((i / 4) * Math.PI * 2) * 14, 0],
            y: [0, Math.sin((i / 4) * Math.PI * 2) * 14, Math.sin((i / 4) * Math.PI * 2) * 28, 0],
            opacity: [0, 0.9, 0.5, 0],
            scale: [0, 1, 0.6, 0],
          }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.55, ease: 'easeInOut' as const }}
        />
      ))}
    </div>
  )
}

const CONFETTI_PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2
  const distance = 90 + (i % 5) * 28
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    color: ['#0F6E56', '#0A9B6E', '#10B981', '#34D399', '#6EE7B7'][i % 5],
    delay: i * 0.02,
    rotate: i % 2 === 0 ? 360 : -360,
  }
})

function ConfettiBurst() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-1/2 left-1/2">
        {CONFETTI_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-sm"
            style={{ backgroundColor: p.color, top: 0, left: 0 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0, rotate: p.rotate }}
            transition={{ duration: 1.0, ease: 'easeOut' as const, delay: p.delay }}
          />
        ))}
      </div>
    </div>
  )
}

export function GeneratingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Guard: if ID is missing or literally "undefined", redirect to upload
  const validId = id && id !== 'undefined' ? id : null
  useEffect(() => {
    if (!validId) navigate('/upload', { replace: true })
  }, [validId, navigate])

  const { slides, progress, total, isDone, error } = useSlideStream(validId)

  // Fallback: poll conversion status when stream fails — auto-redirect if already done
  const { data: conversion } = useQuery<Conversion>({
    queryKey: ['conversion-status', validId],
    queryFn: async () => {
      const res = await api.get(`/conversions/${validId}`)
      return res.data
    },
    enabled: !!validId && !!error,
    refetchInterval: 3000,
    retry: 2,
  })

  useEffect(() => {
    if (isDone && validId) {
      const timer = setTimeout(() => {
        navigate(`/editor/${validId}`, { replace: true })
      }, 1400)
      return () => clearTimeout(timer)
    }
  }, [isDone, validId, navigate])

  // When stream errors but conversion is actually done, go straight to editor
  useEffect(() => {
    if (error && conversion?.status === 'done' && validId) {
      navigate(`/editor/${validId}`, { replace: true })
    }
  }, [error, conversion?.status, validId, navigate])

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/conversions/${validId}/cancel`)
    },
    onSuccess: () => {
      toast.success('Generation cancelled.')
      navigate('/dashboard', { replace: true })
    },
    onError: () => {
      toast.error('Failed to cancel.')
    },
  })

  const descText = total > 0
    ? `Slide ${progress} of ${total} done...`
    : 'Hang tight — building your slides...'
  const typedDesc = useTypewriter(descText)

  return (
    <div className="min-h-screen bg-pm-app flex items-center justify-center px-4">
      <AnimatePresence>{isDone && <ConfettiBurst />}</AnimatePresence>

      <motion.div
        className="w-full max-w-lg space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        <div className="text-center space-y-2">
          <motion.h1
            className="text-2xl font-bold text-pm-primary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Generating your presentation
          </motion.h1>
          <p className="text-pm-muted text-sm min-h-[1.25rem]">
            {typedDesc}
            {typedDesc.length < descText.length && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-px h-3.5 bg-pm-muted ml-0.5 align-middle"
              />
            )}
          </p>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemax={total || 100}
          aria-label="Generation progress"
          className="relative"
        >
          {!isDone && <SparkleParticles />}
          <ProgressBar
            value={isDone ? (total || 100) : progress}
            max={total || 100}
            label={total > 0 ? `${isDone ? total : progress} / ${total} slides` : undefined}
            active={!isDone}
          />
        </div>

        {error && !conversion && (
          <div className="bg-pm-danger/10 border border-pm-danger/30 rounded-xl p-4 text-center space-y-2">
            <p className="text-pm-danger font-medium">{error}</p>
            <p className="text-xs text-pm-muted">The AI service may be starting up — checking status automatically…</p>
            <Link to="/upload" replace className="text-sm text-pm-teal hover:underline block">
              Start over
            </Link>
          </div>
        )}
        {error && conversion && conversion.status !== 'done' && conversion.status !== 'generating' && (
          <div className="bg-pm-danger/10 border border-pm-danger/30 rounded-xl p-4 text-center space-y-2">
            <p className="text-pm-danger font-medium">Generation failed</p>
            <p className="text-xs text-pm-muted">{conversion.status === 'failed' ? 'Something went wrong with the AI service.' : 'Presentation was cancelled.'}</p>
            <Link to="/upload" replace className="text-sm text-pm-teal hover:underline block">
              Try again
            </Link>
          </div>
        )}

        {slides.length > 0 && (
          <SlidePills slides={slides} />
        )}

        <div className="text-center">
          <Button
            variant="secondary"
            size="sm"
            loading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
