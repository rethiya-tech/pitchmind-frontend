import { useState } from 'react'
import { flushSync } from 'react-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useEditorStore } from '@/stores/editorStore'
import { SlideCard, SlideCardInner } from './SlideCard'
import api from '@/services/api'
import toast from 'react-hot-toast'
import type { Slide, Theme } from '@/types'

interface SlideListProps {
  conversionId: string
  theme: Theme
  onSlideSaved?: () => void
}

const BLANK_SLIDE: Omit<Slide, 'id' | 'conversion_id' | 'created_at' | 'updated_at'> = {
  position: 0,
  layout: 'bullets',
  title: 'New Slide',
  bullets: ['Key point', 'Key point', 'Key point'],
  speaker_notes: '',
  is_deleted: false,
  color_scheme: 'default',
  shape_style: 'square',
}

export function SlideList({ conversionId, theme, onSlideSaved }: SlideListProps) {
  const { slides, activeSlideId, setActiveSlide, updateSlide, removeSlide, setSlides } = useEditorStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const visibleSlides = slides.filter((s) => !s.is_deleted)
  const lastIdx = visibleSlides.length - 1
  const activeSlide = activeId ? visibleSlides.find((s) => s.id === activeId) : null
  const activeIndex = activeId ? visibleSlides.findIndex((s) => s.id === activeId) : -1

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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
    const insertAt = Math.max(0, visibleSlides.length - 1)
    const tempId = `temp-${Date.now()}`
    const tempSlide: Slide = { id: tempId, conversion_id: conversionId, ...BLANK_SLIDE, position: insertAt }
    flushSync(() => {
      const updated = [...slides]
      updated.splice(insertAt, 0, tempSlide)
      setSlides(updated)
      setActiveSlide(tempId)
    })
    try {
      const { data } = await api.post(`/conversions/${conversionId}/slides`, {
        ...BLANK_SLIDE,
        position: insertAt,
      })
      const real = data as Slide
      setSlides([...useEditorStore.getState().slides.filter((s) => s.id !== tempId), real])
      setActiveSlide(real.id)
    } catch {
      setSlides(useEditorStore.getState().slides.filter((s) => s.id !== tempId))
      toast.error('Failed to add slide.')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = visibleSlides.findIndex((s) => s.id === active.id)
    const newIdx = visibleSlides.findIndex((s) => s.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    // Clamp: prevent moving into first or last position
    const clampedNew = Math.max(1, Math.min(newIdx, lastIdx - 1))
    const clampedOld = Math.max(1, Math.min(oldIdx, lastIdx - 1))
    if (clampedNew === clampedOld) return

    const reordered = arrayMove(visibleSlides, oldIdx, clampedNew)
    setSlides(reordered.map((s, i) => ({ ...s, position: i })))

    try {
      await api.post(`/conversions/${conversionId}/slides/reorder`, {
        slide_ids: reordered.map((s) => s.id),
      })
    } catch {
      toast.error('Failed to save slide order.')
    }
  }

  const handleDragCancel = () => setActiveId(null)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={visibleSlides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {visibleSlides.map((slide, i) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              index={i}
              isActive={slide.id === activeSlideId}
              theme={theme}
              locked={i === 0 || i === lastIdx}
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
      </SortableContext>

      <DragOverlay>
        {activeSlide && (
          <SlideCardInner
            slide={activeSlide}
            index={activeIndex}
            isActive={false}
            theme={theme}
            locked={false}
            isDragOverlay
            onSelect={() => {}}
            onDelete={() => {}}
            onTitleChange={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
