import { flushSync } from 'react-dom'
import { useEditorStore } from '@/stores/editorStore'
import { SlideCard } from './SlideCard'
import api from '@/services/api'
import toast from 'react-hot-toast'
import type { Slide } from '@/types'

interface SlideListProps {
  conversionId: string
  onSlideSaved?: () => void
}

const BLANK_SLIDE: Omit<Slide, 'id' | 'conversion_id' | 'created_at' | 'updated_at'> = {
  position: 0,
  layout: 'title_bullets',
  title: 'New Slide',
  bullets: [],
  speaker_notes: '',
  is_deleted: false,
}

export function SlideList({ conversionId, onSlideSaved }: SlideListProps) {
  const { slides, activeSlideId, setActiveSlide, updateSlide, removeSlide, setSlides } = useEditorStore()

  const visibleSlides = slides.filter((s) => !s.is_deleted)

  const handleDelete = (slideId: string) => {
    removeSlide(slideId)
    toast(
      (t) => (
        <span>
          Slide removed.{' '}
          <button
            className="underline font-medium"
            onClick={() => {
              useEditorStore.getState().updateSlide(slideId, { is_deleted: false })
              toast.dismiss(t.id)
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 4000 }
    )
    void api.delete(`/slides/${slideId}`).catch(() => {})
    if (onSlideSaved) onSlideSaved()
  }

  const handleAddSlide = async () => {
    const tempId = `temp-${Date.now()}`
    const tempSlide: Slide = { id: tempId, conversion_id: conversionId, ...BLANK_SLIDE, position: visibleSlides.length }
    flushSync(() => {
      setSlides([...slides, tempSlide])
      setActiveSlide(tempId)
    })
    try {
      const { data } = await api.post(`/conversions/${conversionId}/slides`, {
        ...BLANK_SLIDE,
        position: visibleSlides.length,
      })
      const real = data as Slide
      setSlides([...useEditorStore.getState().slides.filter((s) => s.id !== tempId), real])
      setActiveSlide(real.id)
    } catch {
      setSlides(useEditorStore.getState().slides.filter((s) => s.id !== tempId))
      toast.error('Failed to add slide.')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {visibleSlides.map((slide, i) => (
        <SlideCard
          key={slide.id}
          slide={slide}
          index={i}
          isActive={slide.id === activeSlideId}
          onSelect={() => setActiveSlide(slide.id)}
          onDelete={() => handleDelete(slide.id)}
          onTitleChange={(title) => updateSlide(slide.id, { title })}
        />
      ))}
      <button
        onClick={handleAddSlide}
        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-pm-border text-xs font-semibold text-pm-muted hover:border-pm-teal hover:text-pm-teal hover:bg-[#E1F5EE] transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Slide
      </button>
    </div>
  )
}
