import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useSlideStream } from '@/hooks/useSlideStream'
import { ProgressBar } from '@/components/generation/ProgressBar'
import { SlidePills } from '@/components/generation/SlidePills'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'

export function GeneratingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { slides, progress, total, isDone, error } = useSlideStream(id ?? null)

  useEffect(() => {
    if (isDone && id) {
      navigate(`/editor/${id}`, { replace: true })
    }
  }, [isDone, id, navigate])

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/conversions/${id}/cancel`)
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

  return (
    <div className="min-h-screen bg-pm-app flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-pm-primary">
            Generating your presentation
          </h1>
          <p className="text-pm-muted text-sm">{descText}</p>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemax={total || 100}
          aria-label="Generation progress"
        >
          <ProgressBar
            value={progress}
            max={total || 100}
            label={total > 0 ? `${progress} / ${total} slides` : undefined}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
            <p className="text-pm-danger font-medium">{error}</p>
            <Link to="/upload" className="text-sm text-pm-teal hover:underline block">
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
      </div>
    </div>
  )
}
