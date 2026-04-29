import { create } from 'zustand'
import type { Slide } from '@/types'

interface EditorState {
  slides: Slide[]
  activeSlideId: string | null
  isDirty: boolean
  conversionId: string | null
  setSlides: (slides: Slide[]) => void
  updateSlide: (id: string, updates: Partial<Slide>) => void
  setActiveSlide: (id: string | null) => void
  markSaved: () => void
  reorderSlides: (orderedIds: string[]) => void
  removeSlide: (id: string) => void
  setConversionId: (id: string) => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  slides: [],
  activeSlideId: null,
  isDirty: false,
  conversionId: null,

  setSlides: (slides) => set({ slides, isDirty: false }),

  updateSlide: (id, updates) =>
    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      isDirty: true,
    })),

  setActiveSlide: (id) => set({ activeSlideId: id }),

  markSaved: () => set({ isDirty: false }),

  reorderSlides: (orderedIds) =>
    set((state) => {
      const slideMap = new Map(state.slides.map((s) => [s.id, s]))
      const reordered = orderedIds
        .map((id, index) => {
          const slide = slideMap.get(id)
          return slide ? { ...slide, position: index } : null
        })
        .filter(Boolean) as Slide[]
      return { slides: reordered }
    }),

  removeSlide: (id) =>
    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, is_deleted: true } : s)),
    })),

  setConversionId: (id) => set({ conversionId: id }),
}))
