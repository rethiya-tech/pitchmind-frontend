import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { DropZone } from './DropZone'
import { ThemePicker } from './ThemePicker'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { cn } from '@/utils/cn'
import { THEMES } from '@/types'
import type { TemplateListResponse } from '@/types'
import { useAuthStore } from '@/stores/authStore'

type Step = 'form' | 'questionnaire'

const SLIDE_COUNTS = [5, 8, 10, 12, 15]
const PROMPT_MIN = 20
const PROMPT_MAX = 3000
const FALLBACK_QUESTION_OPTIONS = ['Keep it concise', 'Make it practical', 'Use examples', 'Emphasize outcomes']

type InputMode = 'file' | 'prompt'

function getQuestionOptions(question: string) {
  // Extract chips directly from (e.g., ...) examples in the question text
  const egMatch = question.match(/\(e\.g\.,?\s*([^)]+)\)/)
  if (egMatch) {
    const items = egMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    if (items.length >= 2) return items.slice(0, 4)
  }

  const q = question.toLowerCase()

  // Check objective/goal before audience so "outcome for the audience" matches correctly
  if (q.includes('objective') || q.includes('goal') || q.includes('desired')) {
    return ['Inform the audience', 'Persuade decision-makers', 'Teach practical steps', 'Inspire action']
  }
  // Only match audience when the question is specifically asking who the audience is
  if ((q.includes('who') && q.includes('audience')) || q.includes('primary audience') || q.includes('target audience')) {
    return ['Executives', 'Team leaders', 'Technical teams', 'General audience']
  }
  if (q.includes('how long') || q.includes('length') || q.includes('duration') || q.includes('how many slide') || q.includes('expected to be')) {
    return ['5–7 slides (concise)', '10–12 slides (standard)', '15–20 slides (detailed)', '20+ slides (comprehensive)']
  }
  if (q.includes('tone') || q.includes('feeling') || q.includes('style')) {
    return ['Motivational', 'Practical', 'Executive', 'Urgent']
  }
  if (q.includes('message') || q.includes('take away') || q.includes('takeaway') || q.includes('remember') || q.includes('most important')) {
    return ['Clear main takeaway', 'Why it matters now', 'Practical next steps', 'Measurable impact']
  }
  if (q.includes('focus') || q.includes('aspect') || q.includes('angle') || q.includes('specific area')) {
    return ['Broad overview', 'Deep dive on one area', 'Practical applications', 'Current challenges']
  }
  if (q.includes('region') || q.includes('location') || q.includes('geography') || q.includes('emphasize') || q.includes('exclude')) {
    return ['Global perspective', 'Regional focus', 'No exclusions', 'Specific examples only']
  }
  if (q.includes('data') || q.includes('statistics') || q.includes('research')) {
    return ['Industry statistics', 'Internal metrics', 'Research findings', 'No data needed']
  }
  if (q.includes('stories') || q.includes('examples') || q.includes('case studies')) {
    return ['Personal stories', 'Business examples', 'Case studies', 'Skip stories']
  }
  if (q.includes('action') || q.includes('next step')) {
    return ['Adopt the recommendations', 'Start a pilot', 'Book a follow-up', 'Share with the team']
  }
  if (q.includes('challenge') || q.includes('struggle') || q.includes('problem')) {
    return ['Time pressure', 'Competing priorities', 'Low engagement', 'Lack of clarity']
  }
  if (q.includes('strategy') || q.includes('tool') || q.includes('tip')) {
    return ['Simple habits', 'Team processes', 'Decision frameworks', 'Measurement tips']
  }
  if (q.includes('misconception') || q.includes('myth') || q.includes('debunk') || q.includes('address or debunk') || q.includes('stereotype')) {
    return ['Balance means 50/50 split', 'Success requires sacrifice', 'It\'s only about time off', 'Balance is one-size-fits-all']
  }
  if (q.includes('individual') || q.includes('organizational') || q.includes('team') || q.includes('responsibility') || q.includes('responsibilities')) {
    return ['Individual level', 'Team level', 'Organizational level', 'Blend of all levels']
  }
  if (q.includes('avoid') || q.includes('constraint') || q.includes('requirement')) {
    return ['Avoid jargon', 'Keep it brief', 'Follow brand rules', 'No constraints']
  }
  if (q.includes('call to action') || q.includes('cta') || q.includes('after the presentation') || q.includes('take after')) {
    return ['Adopt the recommendations', 'Start a pilot', 'Book a follow-up', 'Share with the team']
  }
  if (q.includes('background') || q.includes('context') || q.includes('current situation')) {
    return ['Provide full context', 'Brief background only', 'Focus on present state', 'Skip background']
  }
  if (q.includes('programming') || q.includes('developer') || q.includes('coding') || q.includes('mobile development') || q.includes('software')) {
    return ['No coding experience', 'Basic programming knowledge', 'Familiar with mobile concepts', 'Experienced developers']
  }
  if (q.includes('level') || q.includes('knowledge') || q.includes('expertise') || q.includes('experience') || q.includes('familiarity') || q.includes('technical')) {
    return ['Beginner level', 'Basic knowledge assumed', 'Familiar with concepts', 'Experienced practitioners']
  }

  return FALLBACK_QUESTION_OPTIONS
}

// ── Section card shell ────────────────────────────────────────────────────────
function Section({
  step,
  title,
  subtitle,
  done,
  children,
  footer,
  scrollable = false,
}: {
  step: number
  title: string
  subtitle: string
  done?: boolean
  children: React.ReactNode
  footer?: React.ReactNode
  scrollable?: boolean
}) {
  return (
    <div className="flex flex-col bg-pm-surface rounded-2xl border border-pm-border overflow-hidden h-full min-h-0">
      <div className="flex items-start gap-3 px-5 py-4 border-b border-pm-border flex-shrink-0">
        <motion.span
          animate={{
            scale: done ? [1, 1.25, 1] : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' as const }}
          className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${done ? 'bg-pm-teal text-white' : 'bg-pm-teal-light text-pm-teal'}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.svg
                key="check"
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                />
              </motion.svg>
            ) : (
              <motion.span key="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {step}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
        <div>
          <p className="text-sm font-semibold text-pm-primary leading-tight">{title}</p>
          <p className="text-xs text-pm-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
      {/* Content area. In scrollable mode, the top padding is kept OUTSIDE
          the scroll container as a fixed white spacer so scrolling tiles
          never appear in the gap between the section header and a sticky child. */}
      {scrollable ? (
        <div className="flex-1 min-h-0 flex flex-col bg-pm-surface">
          <div className="flex-shrink-0 h-5" aria-hidden />
          <div className="flex-1 min-h-0 px-5 pb-5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-pm-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {children}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 p-5 overflow-hidden">
          {children}
        </div>
      )}
      {/* Pinned footer — always visible, outside the scroll area */}
      {footer && (
        <div className="flex-shrink-0 px-5 pb-4 pt-4 border-t border-pm-border bg-pm-surface">
          {footer}
        </div>
      )}
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children, boldLabel = true }: { label: string; children: React.ReactNode; boldLabel?: boolean }) {
  return (
    <div>
      <label className={`block text-xs text-pm-muted uppercase tracking-wide mb-1.5 ${boldLabel ? 'font-semibold' : 'font-normal'}`}>
        {label}
      </label>
      {children}
    </div>
  )
}

const selectCls =
  'w-full border border-pm-border rounded-lg px-3 py-2.5 text-sm text-pm-primary bg-pm-surface focus:outline-none focus:ring-2 focus:ring-pm-teal transition'

// ── Main form ─────────────────────────────────────────────────────────────────
export function UploadForm() {
  const navigate = useNavigate()
  const currentUser = useAuthStore(s => s.user)

  // Wizard step
  const [step, setStep] = useState<Step>('form')

  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>('file')

  // File mode state
  const [file, setFile] = useState<File | null>(null)
  const [uploadId, setUploadId] = useState<string | null>(null)

  // Prompt mode state
  const [promptText, setPromptText] = useState('')
  const [enhancing, setEnhancing] = useState(false)

  // Questionnaire state
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [chipSelections, setChipSelections] = useState<string[][]>([])
  const [skippedQuestions, setSkippedQuestions] = useState<boolean[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [progressOverride, setProgressOverride] = useState<number | null>(null)

  // Client logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  // Shared settings
  const [theme, setTheme] = useState('clean_slate')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [slideCount, setSlideCount] = useState(8)
  const [customCount, setCustomCount] = useState('')
  const [customError, setCustomError] = useState('')
  const [slideCountSelected, setSlideCountSelected] = useState(true)
  const [styles, setStyles] = useState<Set<string>>(new Set(['professional']))
  const [audienceLevel, setAudienceLevel] = useState('general')
  const [presentationFlags, setPresentationFlags] = useState<Set<string>>(new Set())

  const toggleStyle = (s: string) => {
    setStyles(prev => {
      const next = new Set(prev)
      if (next.has(s)) {
        if (next.size === 1) return prev // keep at least one selected
        next.delete(s)
      } else {
        next.add(s)
      }
      return next
    })
  }

  const toggleFlag = (flag: string) => {
    setPresentationFlags(prev => {
      const next = new Set(prev)
      if (next.has(flag)) next.delete(flag)
      else next.add(flag)
      return next
    })
  }

  const { data: templatesData } = useQuery<TemplateListResponse>({
    queryKey: ['templates'],
    queryFn: async () => (await api.get('/templates')).data,
  })
  // Show public (admin-uploaded) templates and the user's own private templates
  const userTemplates = (templatesData?.items ?? []).filter(
    t => t.is_public || t.created_by === currentUser?.id
  )

  const handleLogoFile = async (f: File) => {
    setLogoPreview(URL.createObjectURL(f))
    setLogoUploading(true)
    try {
      const form = new FormData()
      form.append('file', f)
      const { data } = await api.post<{ logo_url: string }>('/uploads/logo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setLogoUrl(data.logo_url)
    } catch {
      toast.error('Logo upload failed. Please try again.')
      setLogoPreview(null)
    } finally {
      setLogoUploading(false)
    }
  }

  const presignMutation = useMutation({
    mutationFn: async (f: File) => {
      const { data } = await api.post('/uploads/presign', {
        filename: f.name,
        content_type: f.type || 'application/octet-stream',
        size_bytes: f.size,
      })
      return data as { upload_url: string; upload_id: string; gcs_key: string }
    },
  })

  const handleFile = async (f: File) => {
    setFile(f)
    setUploadId(null)
    try {
      const { upload_url, upload_id } = await presignMutation.mutateAsync(f)
      // upload_url is always a backend URL now (server proxies to GCS if needed).
      // Strip origin + /api/v1 prefix so the path is relative to the api baseURL.
      const uploadPath = upload_url.replace(/^.*\/api\/v1/, '')
      await api.put(uploadPath, f, { headers: { 'Content-Type': f.type || 'application/octet-stream' } })
      setUploadId(upload_id)
    } catch {
      toast.error('Upload failed. Please try again.')
    }
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        theme,
        style: Array.from(styles).join(','),
        audience_level: audienceLevel,
        slide_count: slideCount,
        speaker_notes: true,
        presentation_flags: Array.from(presentationFlags),
        ...(logoUrl ? { client_logo_url: logoUrl } : {}),
        ...(selectedTemplateId ? { template_id: selectedTemplateId } : {}),
      }
      if (inputMode === 'prompt') {
        payload.prompt_text = promptText
      } else {
        if (!uploadId) throw new Error('No upload ID')
        payload.upload_id = uploadId
      }
      if (questions.length > 0) {
        payload.questionnaire_answers = questions.map((q, i) => ({
          question: q,
          answer: answers[i] ?? '',
        }))
      }
      const { data } = await api.post('/conversions', payload)
      return data as { id: string }
    },
    onSuccess: (data) => navigate(`/generating/${data.id}`, { replace: true }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string | { message?: string } } } })
        ?.response?.data?.detail
      const detail = typeof msg === 'string' ? msg : msg?.message
      toast.error(detail || 'Failed to start generation. Please try again.')
    },
  })

  const handleGenerateClick = async () => {
    if (inputMode === 'prompt' && promptReady) {
      setLoadingQuestions(true)
      try {
        const { data } = await api.post<{ questions: string[] }>('/ai/generate-questions', { prompt: promptText })
        setQuestions(data.questions)
        setAnswers(new Array(data.questions.length).fill(''))
        setChipSelections(Array.from({ length: data.questions.length }, () => []))
        setSkippedQuestions(new Array(data.questions.length).fill(false))
        setProgressOverride(null)
        setStep('questionnaire')
      } catch {
        createMutation.mutate()
      } finally {
        setLoadingQuestions(false)
      }
    } else {
      createMutation.mutate()
    }
  }

  const fileReady = inputMode === 'file' && !!file && !!uploadId && !presignMutation.isPending
  const promptReady = inputMode === 'prompt' && promptText.trim().length >= PROMPT_MIN
  const inputReady = fileReady || promptReady
  const canGenerate = inputReady && !createMutation.isPending

  const switchMode = (mode: InputMode) => {
    setInputMode(mode)
    // Reset the inactive mode's state
    if (mode === 'file') {
      setPromptText('')
    } else {
      setFile(null)
      setUploadId(null)
    }
  }

  const setQuestionAnswer = (index: number, answer: string) => {
    const nextAnswers = [...answers]
    nextAnswers[index] = answer
    setAnswers(nextAnswers)
    const nextSkipped = [...skippedQuestions]
    nextSkipped[index] = false
    setSkippedQuestions(nextSkipped)
  }

  const toggleChip = (qi: number, option: string) => {
    const current = chipSelections[qi] ?? []
    const next = current.includes(option) ? current.filter(c => c !== option) : [...current, option]
    const nextChips = [...chipSelections]
    nextChips[qi] = next
    setChipSelections(nextChips)
    setQuestionAnswer(qi, next.join(', '))
  }

  const setTextAnswer = (qi: number, text: string) => {
    // Typing clears chip selections for that question
    const nextChips = [...chipSelections]
    nextChips[qi] = []
    setChipSelections(nextChips)
    setQuestionAnswer(qi, text)
  }

  const advanceQuestion = (skip: boolean) => {
    if (skip) {
      const nextAnswers = [...answers]
      nextAnswers[currentQuestionIndex] = ''
      setAnswers(nextAnswers)
      const nextSkipped = [...skippedQuestions]
      nextSkipped[currentQuestionIndex] = true
      setSkippedQuestions(nextSkipped)
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Animate progress to 100% then start generation
      setProgressOverride(100)
      setTimeout(() => createMutation.mutate(), 450)
    }
  }

  if (step === 'questionnaire') {
    const qi = currentQuestionIndex
    const q = questions[qi] ?? ''
    const options = getQuestionOptions(q)
    const currentAnswer = answers[qi] ?? ''
    const currentChips = chipSelections[qi] ?? []
    const isLast = qi === questions.length - 1
    const naturalProgress = (qi / questions.length) * 100
    const progress = progressOverride !== null ? progressOverride : naturalProgress

    return (
      <div className="flex flex-col bg-pm-surface rounded-2xl border border-pm-border overflow-hidden h-full">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-pm-border flex-shrink-0">
          <button
            onClick={() => {
              if (qi > 0) setCurrentQuestionIndex(qi - 1)
              else setStep('form')
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-pm-muted hover:text-pm-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="w-px h-4 bg-pm-border" />
          <div>
            <p className="text-sm font-semibold text-pm-primary leading-tight">Clarifying Questions</p>
            <p className="text-xs text-pm-muted mt-0.5">All fields are optional — skip anything that doesn't apply</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-pm-teal-light text-pm-teal rounded-full px-3 py-1 text-xs font-semibold">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
            </svg>
            AI-generated
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-pm-border flex-shrink-0">
          <div
            className="h-full bg-pm-teal transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question body */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-xl flex flex-col gap-6">

            {/* Step counter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pm-teal text-white text-xs font-bold flex-shrink-0">
                {qi + 1}
              </span>
              <span className="text-xs text-pm-muted font-medium">of {questions.length}</span>
            </div>

            {/* Question text */}
            <p className="text-base font-semibold text-pm-primary leading-snug">{q}</p>

            {/* Option chips — multi-select */}
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const selected = currentChips.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleChip(qi, option)}
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                      selected
                        ? 'bg-pm-teal text-white border-pm-teal shadow-sm'
                        : 'bg-pm-surface-2 text-pm-primary border-pm-border hover:border-pm-teal hover:text-pm-teal'
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {/* Free-text input — clears chip selections when typed */}
            <textarea
              rows={3}
              value={currentChips.length > 0 ? '' : currentAnswer}
              onChange={(e) => setTextAnswer(qi, e.target.value)}
              placeholder={currentChips.length > 0 ? `Selected: ${currentChips.join(', ')}` : 'Or type your own answer…'}
              className="w-full border border-pm-border rounded-xl px-4 py-3 text-sm text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal transition placeholder:text-pm-subtle resize-none bg-pm-surface-2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pm-border flex-shrink-0 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => advanceQuestion(true)}
            className="text-sm font-medium text-pm-muted hover:text-pm-primary transition-colors"
          >
            Skip
          </button>
          <Button
            size="lg"
            loading={createMutation.isPending}
            onClick={() => advanceQuestion(false)}
          >
            {isLast ? 'Generate Presentation' : 'Next →'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-3 gap-5 h-full overflow-hidden"
      style={{ minHeight: 0, gridTemplateRows: 'minmax(0, 1fr)' }}
    >

      {/* ── Panel 1: Input ── */}
      <Section
        step={1}
        title="Add Your Content"
        subtitle="Upload a document or describe your topic"
        done={inputReady}
      >
        <div className="flex flex-col gap-4 h-full">

          {/* Mode toggle */}
          <div className="flex gap-1 bg-pm-app rounded-xl p-1 border border-pm-border flex-shrink-0">
            <button
              type="button"
              onClick={() => switchMode('file')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all',
                inputMode === 'file'
                  ? 'bg-pm-surface text-pm-teal shadow-sm border border-pm-border'
                  : 'text-pm-muted hover:text-pm-primary'
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Upload File
            </button>
            <button
              type="button"
              onClick={() => switchMode('prompt')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all',
                inputMode === 'prompt'
                  ? 'bg-pm-surface text-pm-teal shadow-sm border border-pm-border'
                  : 'text-pm-muted hover:text-pm-primary'
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Prompt
            </button>
          </div>

          {/* File mode */}
          {inputMode === 'file' && (
            <>
              <DropZone onFile={handleFile} file={file} disabled={presignMutation.isPending} />
              {presignMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-pm-muted">
                  <svg className="w-4 h-4 animate-spin text-pm-teal" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading…
                </div>
              )}
              {!file && (
                <div className="mt-auto pt-2">
                  <p className="text-xs text-pm-muted leading-relaxed">
                    Your document is analysed by AI to extract key points and structure your slides automatically.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Prompt mode */}
          {inputMode === 'prompt' && (
            <div className="flex flex-col gap-2 flex-1">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value.slice(0, PROMPT_MAX))}
                placeholder={`Describe your presentation topic or paste an outline…\n\nExamples:\n• "A 10-slide pitch deck for a SaaS startup targeting HR teams"\n• "Quarterly business review for Q3 2024 with financial highlights"\n• Paste your raw notes or bullet points directly`}
                className={cn(
                  'flex-1 w-full resize-none border rounded-xl px-4 py-3 text-sm text-pm-primary bg-pm-surface',
                  'focus:outline-none focus:ring-2 focus:ring-pm-teal transition leading-relaxed',
                  'placeholder:text-pm-muted/60',
                  promptText.length > 0 && promptText.trim().length < PROMPT_MIN
                    ? 'border-amber-300 focus:ring-amber-200'
                    : promptReady
                    ? 'border-pm-teal'
                    : 'border-pm-border'
                )}
                style={{ minHeight: '220px' }}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {promptText.trim().length > 0 && promptText.trim().length < PROMPT_MIN ? (
                    <span className="text-xs text-amber-600">
                      {PROMPT_MIN - promptText.trim().length} more characters needed
                    </span>
                  ) : promptReady ? (
                    <span className="text-xs text-pm-teal font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ready to generate
                    </span>
                  ) : (
                    <span className="text-xs text-pm-muted">Min {PROMPT_MIN} characters</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {promptReady && (
                    <button
                      type="button"
                      disabled={enhancing}
                      onClick={async () => {
                        setEnhancing(true)
                        try {
                          const { data } = await api.post<{ enhanced_prompt: string }>('/ai/enhance-prompt', { prompt: promptText.trim() })
                          setPromptText(data.enhanced_prompt)
                        } catch {
                          // silently fail — user keeps their original prompt
                        } finally {
                          setEnhancing(false)
                        }
                      }}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all',
                        enhancing
                          ? 'border-pm-border text-pm-muted bg-pm-surface-2 cursor-not-allowed'
                          : 'border-pm-teal/60 text-pm-teal bg-pm-teal-light hover:bg-pm-teal hover:text-white hover:border-pm-teal'
                      )}
                    >
                      {enhancing ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
                        </svg>
                      )}
                      {enhancing ? 'Enhancing…' : 'Enhance with AI'}
                    </button>
                  )}
                  <span className={cn(
                    'text-xs',
                    promptText.length > PROMPT_MAX * 0.9 ? 'text-amber-500' : 'text-pm-muted'
                  )}>
                    {promptText.length}/{PROMPT_MAX}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </Section>

      {/* ── Panel 2: Configure ── */}
      <Section
        step={2}
        title="Configure Settings"
        subtitle="Adjust how your presentation is built"
        done={inputReady}
      >
        <div className="flex flex-col gap-5">
          <Field label="Slide Count">
            <div className="flex items-center gap-1.5 flex-wrap">
              {SLIDE_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setSlideCount(n); setCustomCount(''); setCustomError(''); setSlideCountSelected(true) }}
                  className={cn(
                    'w-10 h-9 rounded-lg text-sm font-medium border transition-all flex-shrink-0',
                    slideCount === n && !customCount
                      ? 'bg-pm-teal text-white border-pm-teal shadow-sm'
                      : 'bg-pm-surface text-pm-primary border-pm-border hover:border-pm-teal hover:text-pm-teal'
                  )}
                >
                  {n}
                </button>
              ))}
              <div className="w-px h-6 bg-pm-border mx-0.5 flex-shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Custom"
                value={customCount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  const n = parseInt(val)
                  if (val === '') { setCustomCount(''); setCustomError(''); setSlideCountSelected(false); return }
                  if (SLIDE_COUNTS.includes(n)) {
                    setSlideCount(n); setCustomCount(''); setCustomError(''); setSlideCountSelected(true); return
                  }
                  setCustomCount(val)
                  if (n <= 3) { setCustomError('Must be greater than 3') }
                  else if (n > 50) { setCustomError('Maximum is 50') }
                  else { setCustomError(''); setSlideCount(n); setSlideCountSelected(true) }
                }}
                className={cn(
                  'flex-1 min-w-[90px] h-9 border rounded-lg px-3 text-sm text-pm-primary bg-pm-surface focus:outline-none focus:ring-2 focus:ring-pm-teal transition',
                  customError ? 'border-pm-danger focus:ring-pm-danger/40' :
                  customCount && !customError ? 'border-pm-teal bg-pm-teal-light' : 'border-pm-border'
                )}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              {slideCountSelected && !customError && (
                <p className="text-xs text-pm-muted">
                  <span className="font-semibold text-pm-primary">{slideCount}</span> slides will be generated
                </p>
              )}
              {(!slideCountSelected || customError) && <span />}
              {customError && (
                <span className="text-xs text-pm-danger flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {customError}
                </span>
              )}
            </div>
          </Field>

          <Field label="Target Audience">
            <select value={audienceLevel} onChange={(e) => setAudienceLevel(e.target.value)} className={selectCls}>
              <option value="general">General</option>
              <option value="executive">Executive</option>
              <option value="c-suite">C-Suite</option>
              <option value="technical">Technical</option>
            </select>
          </Field>

          <Field label="Presentation Style" boldLabel={false}>
            <p className="text-xs text-pm-muted mb-2">Controls the tone and layout of your slides. Select one or combine multiple.</p>
            <div className="flex gap-2 flex-wrap">
              {(['professional', 'creative', 'minimal', 'bold'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStyle(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all capitalize',
                    styles.has(s)
                      ? 'bg-pm-teal text-white border-pm-teal'
                      : 'bg-pm-surface text-pm-primary border-pm-border hover:border-pm-teal hover:text-pm-teal'
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Field>

          {/* Client Logo */}
          <Field label="Client Logo (Optional)">
            <p className="text-xs text-pm-muted mb-2">Appears as a watermark on every slide. PNG, JPG, SVG, or WebP — max 5 MB.</p>
            <label className="cursor-pointer flex items-center gap-3">
              <div className={cn(
                'w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center flex-shrink-0 overflow-hidden transition-colors',
                logoPreview ? 'border-pm-teal bg-pm-teal-light' : 'border-pm-border bg-pm-surface-2 hover:border-pm-teal'
              )}>
                {logoUploading ? (
                  <svg className="animate-spin w-5 h-5 text-pm-teal" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="16 30" />
                  </svg>
                ) : logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <svg className="w-5 h-5 text-pm-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {logoUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-pm-teal font-medium">Logo uploaded</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setLogoUrl(null); setLogoPreview(null) }}
                      className="text-xs text-pm-muted hover:text-pm-danger transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-pm-muted">{logoUploading ? 'Uploading…' : 'Click to upload logo'}</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }}
              />
            </label>
          </Field>

          {inputMode === 'file' && (
            <Field label="PRESENTATION FORMAT">
              <p className="text-xs text-pm-muted mb-2">Especially useful for large or complex documents.</p>
              <div className="flex gap-2 flex-wrap">
                {([
                  { flag: 'minimal',    label: '⬛ Minimal',    tip: 'Clean slides, max 3 bullets per slide' },
                  { flag: 'roadmap',    label: '📍 Roadmap',    tip: 'Includes a timeline/phases slide' },
                  { flag: 'data_focus', label: '📊 Data Focus', tip: 'Prioritizes stats and metrics slides' },
                ] as const).map(({ flag, label, tip }) => (
                  <button
                    key={flag}
                    type="button"
                    title={tip}
                    onClick={() => toggleFlag(flag)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                      presentationFlags.has(flag)
                        ? 'bg-pm-teal text-white border-pm-teal'
                        : 'bg-pm-surface text-pm-primary border-pm-border hover:border-pm-teal hover:text-pm-teal'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          )}
        </div>
      </Section>

      {/* ── Panel 3: Theme & Generate ── */}
      <Section
        step={3}
        title="Choose Theme"
        subtitle="Select a visual style for your slides"
        done={false}
        scrollable
        scrollable
        footer={
          <div className="space-y-2">
            {inputMode === 'file' ? (
              <StatusRow done={fileReady} label={fileReady ? `${file?.name} uploaded` : 'No document uploaded'} />
            ) : (
              <StatusRow
                done={promptReady}
                label={promptReady ? `Prompt ready (${promptText.trim().length} chars)` : 'No prompt entered'}
              />
            )}
            <StatusRow done label={`${slideCount} slides · ${Array.from(styles).join(', ')}`} />
            <StatusRow
              done={!!theme}
              label={
                selectedTemplateId
                  ? `Template: ${userTemplates.find(t => t.id === selectedTemplateId)?.name ?? 'Custom'}`
                  : theme ? `Theme: ${THEMES.find(t => t.id === theme)?.name ?? theme}` : 'Theme selected'
              }
            />
            <Button
              className="w-full mt-1"
              size="lg"
              loading={createMutation.isPending || presignMutation.isPending || loadingQuestions}
              disabled={!canGenerate || loadingQuestions}
              onClick={handleGenerateClick}
            >
              {loadingQuestions ? 'Generating questions…' : inputMode === 'prompt' ? 'Continue →' : 'Create Presentation'}
            </Button>
          </div>
        }
      >
        <ThemePicker
          value={theme}
          onChange={(id) => {
            setTheme(id)
            const category = THEMES.find(t => t.id === id)?.category
            if (category) setStyles(new Set([category]))
          }}
          userTemplates={userTemplates}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={setSelectedTemplateId}
        />
      </Section>

    </div>
  )
}

function StatusRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
          done ? 'bg-pm-teal' : 'bg-pm-surface-3'
        )}
      >
        {done ? (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        )}
      </span>
      <span className={done ? 'text-pm-primary' : 'text-pm-muted'}>{label}</span>
    </div>
  )
}
