import { describe, it, expect, beforeEach, vi } from 'vitest'


describe('editorStore', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('initial state has empty slides and no active slide', async () => {
    const { useEditorStore } = await import('@/stores/editorStore')
    const state = useEditorStore.getState()
    expect(state.slides).toEqual([])
    expect(state.activeSlideId).toBeNull()
    expect(state.isDirty).toBe(false)
  })

  it('setSlides populates slides list', async () => {
    const { useEditorStore } = await import('@/stores/editorStore')
    const slides = [
      { id: 's1', title: 'Slide 1', bullets: ['a', 'b', 'c'],
        speaker_notes: 'notes', layout: 'bullets', position: 0, is_deleted: false },
    ]
    useEditorStore.getState().setSlides(slides)
    expect(useEditorStore.getState().slides).toHaveLength(1)
  })

  it('updateSlide modifies the correct slide', async () => {
    const { useEditorStore } = await import('@/stores/editorStore')
    const slides = [
      { id: 's1', title: 'Old Title', bullets: ['a'], speaker_notes: '', layout: 'bullets', position: 0, is_deleted: false },
      { id: 's2', title: 'Slide 2', bullets: ['b'], speaker_notes: '', layout: 'bullets', position: 1, is_deleted: false },
    ]
    useEditorStore.getState().setSlides(slides)
    useEditorStore.getState().updateSlide('s1', { title: 'New Title' })
    const updated = useEditorStore.getState().slides.find(s => s.id === 's1')
    expect(updated?.title).toBe('New Title')
  })

  it('updateSlide sets isDirty to true', async () => {
    const { useEditorStore } = await import('@/stores/editorStore')
    useEditorStore.getState().setSlides([
      { id: 's1', title: 'T', bullets: ['a'], speaker_notes: '', layout: 'bullets', position: 0, is_deleted: false },
    ])
    useEditorStore.getState().updateSlide('s1', { title: 'Changed' })
    expect(useEditorStore.getState().isDirty).toBe(true)
  })

  it('markSaved sets isDirty to false', async () => {
    const { useEditorStore } = await import('@/stores/editorStore')
    useEditorStore.getState().setSlides([
      { id: 's1', title: 'T', bullets: ['a'], speaker_notes: '', layout: 'bullets', position: 0, is_deleted: false },
    ])
    useEditorStore.getState().updateSlide('s1', { title: 'Changed' })
    useEditorStore.getState().markSaved()
    expect(useEditorStore.getState().isDirty).toBe(false)
  })

  it('setActiveSlide updates activeSlideId', async () => {
    const { useEditorStore } = await import('@/stores/editorStore')
    useEditorStore.getState().setActiveSlide('s2')
    expect(useEditorStore.getState().activeSlideId).toBe('s2')
  })

  it('reorderSlides changes slide positions', async () => {
    const { useEditorStore } = await import('@/stores/editorStore')
    const slides = [
      { id: 's1', title: 'A', bullets: [], speaker_notes: '', layout: 'bullets', position: 0, is_deleted: false },
      { id: 's2', title: 'B', bullets: [], speaker_notes: '', layout: 'bullets', position: 1, is_deleted: false },
    ]
    useEditorStore.getState().setSlides(slides)
    useEditorStore.getState().reorderSlides(['s2', 's1'])
    const reordered = useEditorStore.getState().slides
    expect(reordered[0].id).toBe('s2')
    expect(reordered[1].id).toBe('s1')
  })
})
