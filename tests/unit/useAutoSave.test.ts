import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'


describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
  })

  it('does not save immediately when content changes', async () => {
    const { useAutoSave } = await import('@/hooks/useAutoSave')
    const mockSave = vi.fn().mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ content }) => useAutoSave({ slideId: 's1', content, onSave: mockSave }),
      { initialProps: { content: 'initial' } }
    )
    rerender({ content: 'changed' })
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('saves after 500ms debounce', async () => {
    const { useAutoSave } = await import('@/hooks/useAutoSave')
    const mockSave = vi.fn().mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ content }) => useAutoSave({ slideId: 's1', content, onSave: mockSave }),
      { initialProps: { content: 'initial' } }
    )
    rerender({ content: 'changed' })
    await act(async () => { vi.advanceTimersByTime(500) })
    expect(mockSave).toHaveBeenCalledOnce()
  })

  it('resets debounce timer on rapid changes', async () => {
    const { useAutoSave } = await import('@/hooks/useAutoSave')
    const mockSave = vi.fn().mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ content }) => useAutoSave({ slideId: 's1', content, onSave: mockSave }),
      { initialProps: { content: 'initial' } }
    )
    rerender({ content: 'change 1' })
    await act(async () => { vi.advanceTimersByTime(200) })
    rerender({ content: 'change 2' })
    await act(async () => { vi.advanceTimersByTime(200) })
    expect(mockSave).not.toHaveBeenCalled()
    await act(async () => { vi.advanceTimersByTime(300) })
    expect(mockSave).toHaveBeenCalledOnce()
  })

  it('returns saving=true while save is in progress', async () => {
    const { useAutoSave } = await import('@/hooks/useAutoSave')
    let resolvePromise: () => void
    const slowSave = vi.fn().mockReturnValue(
      new Promise<void>(r => { resolvePromise = r })
    )
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave({ slideId: 's1', content, onSave: slowSave }),
      { initialProps: { content: 'initial' } }
    )
    rerender({ content: 'changed' })
    await act(async () => { vi.advanceTimersByTime(500) })
    expect(result.current.isSaving).toBe(true)
    await act(async () => { resolvePromise!() })
    expect(result.current.isSaving).toBe(false)
  })

  it('sets error state on save failure', async () => {
    const { useAutoSave } = await import('@/hooks/useAutoSave')
    const failSave = vi.fn().mockRejectedValue(new Error('Network error'))
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave({ slideId: 's1', content, onSave: failSave }),
      { initialProps: { content: 'initial' } }
    )
    rerender({ content: 'changed' })
    await act(async () => { vi.advanceTimersByTime(500) })
    await act(async () => { vi.runAllTimersAsync() })
    expect(result.current.hasError).toBe(true)
  })
})
