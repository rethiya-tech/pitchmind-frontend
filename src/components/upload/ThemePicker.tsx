import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { THEMES } from '@/types'
import type { Theme, Template } from '@/types'
import { templateSlideImageUrl } from '@/utils/slideImage'
import { ThemeDecorSVG } from '@/components/ui/ThemeDecor'

function ThemeSwatch({ theme }: { theme: Theme }) {
  const [imgError, setImgError] = useState(false)
  const dark = theme.text === '#FFFFFF' || theme.text.startsWith('#F9') || theme.text.startsWith('#F0')
  return (
    <div
      className="w-full rounded-lg overflow-hidden flex-shrink-0 relative"
      style={{ aspectRatio: '16/9', background: theme.gradient }}
    >
      {!imgError && (
        <img
          src={`/themes/${theme.id}.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      <ThemeDecorSVG theme={theme} />
      {/* readability scrim at bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.5)'} 0%, transparent 55%)` }}
      />
      {/* font preview */}
      <div className="absolute inset-0 flex flex-col justify-between px-[9%] py-[8%] pointer-events-none">
        <div>
          <div className="rounded-full mb-[5%]" style={{ width: '22%', height: '5%', backgroundColor: theme.accent, opacity: 0.9 }} />
          <div
            className="font-bold leading-none truncate"
            style={{ fontFamily: `"${theme.headingFont}", serif`, fontSize: 'clamp(6px, 1.5vw, 11px)', color: theme.text }}
          >
            Aa Headline
          </div>
          <div
            className="mt-[6%] space-y-[3%]"
            style={{ fontFamily: `"${theme.bodyFont}", sans-serif`, fontSize: 'clamp(4px, 0.9vw, 7px)', color: theme.text, opacity: 0.65 }}
          >
            <div>Body text style</div>
            <div style={{ opacity: 0.75 }}>— {theme.headingFont}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateThumb({ templateId, name, theme, previewCount }: { templateId: string; name: string; theme: string | null; previewCount: number }) {
  const [errored, setErrored] = useState(false)
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  const showImage = previewCount > 0 && !errored

  return (
    <div className="w-full rounded-lg overflow-hidden flex-shrink-0 relative" style={{ aspectRatio: '16/9', background: t.gradient }}>
      {showImage ? (
        <img
          src={templateSlideImageUrl(templateId, 0)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col px-2 py-2">
          <div className="h-1.5 rounded-full w-8 mb-1.5" style={{ backgroundColor: t.accent, opacity: 0.8 }} />
          <div className="space-y-1">
            <div className="h-[3px] rounded-full w-full" style={{ backgroundColor: t.text, opacity: 0.2 }} />
            <div className="h-[3px] rounded-full w-4/5" style={{ backgroundColor: t.text, opacity: 0.15 }} />
            <div className="h-[3px] rounded-full w-3/5" style={{ backgroundColor: t.text, opacity: 0.15 }} />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full opacity-10" style={{ backgroundColor: t.accent, transform: 'translate(30%, 30%)' }} />
        </div>
      )}
    </div>
  )
}

type Category = 'professional' | 'creative' | 'minimal' | 'my_templates'

const BUILT_IN_CATEGORIES: { id: Category; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'creative',     label: 'Creative' },
  { id: 'minimal',      label: 'Minimal' },
]

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
  exit:  { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit:   { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.1 } },
}

interface ThemePickerProps {
  value: string
  onChange: (themeId: string) => void
  disabled?: boolean
  userTemplates?: Template[]
  selectedTemplateId?: string | null
  onTemplateSelect?: (templateId: string | null) => void
}

export function ThemePicker({ value, onChange, disabled, userTemplates, selectedTemplateId, onTemplateSelect }: ThemePickerProps) {
  const hasUserTemplates = (userTemplates?.length ?? 0) > 0

  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    if (selectedTemplateId) return 'my_templates'
    const theme = THEMES.find(t => t.id === value)
    return theme?.category ?? 'professional'
  })

  const categories = hasUserTemplates
    ? [...BUILT_IN_CATEGORIES, { id: 'my_templates' as Category, label: 'Templates' }]
    : BUILT_IN_CATEGORIES

  const visibleThemes = THEMES.filter(t => t.category === activeCategory)

  const handleThemeClick = (themeId: string) => {
    onChange(themeId)
    onTemplateSelect?.(null)
  }

  const handleTemplateClick = (template: Template) => {
    onChange(template.theme ?? 'clean_slate')
    onTemplateSelect?.(template.id)
  }

  return (
    <div className={cn('flex flex-col gap-3', { 'opacity-50 pointer-events-none': disabled })}>

      {/* Category tabs — gliding pill indicator — sticky within Section scroll */}
      <div className="sticky top-0 z-20 flex gap-1 bg-pm-surface rounded-lg p-1 border border-pm-border shadow-[0_4px_8px_-4px_rgba(0,0,0,0.06)]">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className="relative flex-1 py-1.5 text-xs font-semibold rounded-md z-10"
            style={{ color: activeCategory === cat.id ? '#0F6E56' : '#6B7280' }}
          >
            {activeCategory === cat.id && (
              <motion.div
                layoutId="theme-tab-pill"
                className="absolute inset-0 bg-pm-surface rounded-md shadow-sm border border-pm-border"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeCategory !== 'my_templates' ? (
          <motion.div
            key={activeCategory}
            variants={gridVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="grid grid-cols-3 gap-3 p-1"
          >
            {visibleThemes.map(theme => {
              const isSelected = value === theme.id && !selectedTemplateId
              return (
                <motion.button
                  key={theme.id}
                  variants={itemVariants}
                  type="button"
                  data-testid="theme-swatch"
                  onClick={() => handleThemeClick(theme.id)}
                  whileHover={{ scale: 1.04 }}
                  animate={{ scale: isSelected ? 1.03 : 1 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-colors',
                    isSelected
                      ? 'border-pm-teal ring-2 ring-pm-teal ring-inset'
                      : 'border-pm-border hover:border-pm-border-strong'
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pm-teal flex items-center justify-center z-10 shadow-sm"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <ThemeSwatch theme={theme} />
                  <span className="text-xs font-medium text-pm-primary text-center leading-tight">
                    {theme.name}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="my_templates"
            variants={gridVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="grid grid-cols-3 gap-3 p-1"
          >
            {userTemplates?.map(template => {
              const isSelected = selectedTemplateId === template.id
              return (
                <motion.button
                  key={template.id}
                  variants={itemVariants}
                  type="button"
                  onClick={() => handleTemplateClick(template)}
                  whileHover={{ scale: 1.04 }}
                  animate={{ scale: isSelected ? 1.03 : 1 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-colors',
                    isSelected
                      ? 'border-pm-teal ring-2 ring-pm-teal ring-inset'
                      : 'border-pm-border hover:border-pm-border-strong'
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pm-teal flex items-center justify-center z-10 shadow-sm"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <TemplateThumb templateId={template.id} name={template.name} theme={template.theme} previewCount={template.preview_count ?? 0} />
                  <span className="text-xs font-medium text-pm-primary text-center leading-tight line-clamp-1">
                    {template.name}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
