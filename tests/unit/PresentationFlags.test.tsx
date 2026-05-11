import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UploadForm } from '@/components/upload/UploadForm'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { upload_url: '/uploads/1/local', upload_id: 'abc123', gcs_key: 'k' } }),
    put: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }))

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <UploadForm />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Presentation Format chips', () => {
  it('renders PRESENTATION FORMAT section in file mode', () => {
    renderForm()
    expect(screen.getByText('PRESENTATION FORMAT')).toBeInTheDocument()
  })

  it('renders all three chips', () => {
    renderForm()
    expect(screen.getByTitle('Clean slides, max 3 bullets per slide')).toBeInTheDocument()
    expect(screen.getByTitle('Includes a timeline/phases slide')).toBeInTheDocument()
    expect(screen.getByTitle('Prioritizes stats and metrics slides')).toBeInTheDocument()
  })

  it('toggles a chip on click', () => {
    renderForm()
    const minimal = screen.getByTitle('Clean slides, max 3 bullets per slide')
    fireEvent.click(minimal)
    expect(minimal).toHaveClass('bg-pm-teal')
  })

  it('deselects a chip on second click', () => {
    renderForm()
    const minimal = screen.getByTitle('Clean slides, max 3 bullets per slide')
    fireEvent.click(minimal)
    fireEvent.click(minimal)
    expect(minimal).not.toHaveClass('bg-pm-teal')
  })

  it('hides PRESENTATION FORMAT section in prompt mode', () => {
    renderForm()
    const promptTab = screen.getByText('AI Prompt')
    fireEvent.click(promptTab)
    expect(screen.queryByText('PRESENTATION FORMAT')).not.toBeInTheDocument()
  })
})
