import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ── Realistic slide preview cards ── */
function SlideCard({ gradient, accent, title, subtitle, type, delay = 0, inView }: {
  gradient: string; accent: string; title: string; subtitle: string
  type: 'chart' | 'bullets' | 'split' | 'title' | 'data'
  delay?: number; inView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}
      className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-white/10 flex-shrink-0 cursor-pointer"
      style={{ background: gradient, aspectRatio: '16/9', width: '100%' }}
    >
      <div className="w-full h-full p-4 flex flex-col justify-between">
        {/* Top bar */}
        <div className="flex items-start justify-between">
          <div>
            <div className="h-1.5 rounded-full mb-1.5" style={{ width: 48, backgroundColor: accent, opacity: 0.9 }} />
            <p className="text-white font-bold text-xs leading-tight">{title}</p>
            <p className="text-white/50 text-[9px] mt-0.5">{subtitle}</p>
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}33` }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
          </div>
        </div>

        {/* Content area by type */}
        {type === 'chart' && (
          <div className="flex items-end gap-1 h-14">
            {[55, 72, 48, 88, 62, 95, 70, 82].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i % 2 === 0 ? `${accent}cc` : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        )}
        {type === 'bullets' && (
          <div className="space-y-1.5">
            {['Increased ARR by 38% YoY', 'Enterprise pipeline: $4.2M', 'Churn reduced to 2.1%', 'NPS score: 74'].map((_b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                <div className="h-1 rounded-full flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)', maxWidth: `${[85, 70, 65, 55][i]}%` }} />
              </div>
            ))}
          </div>
        )}
        {type === 'split' && (
          <div className="flex gap-2 h-14">
            <div className="flex-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <div className="p-2 h-full flex flex-col justify-center gap-1">
                <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: accent, opacity: 0.8 }} />
                <div className="h-0.5 rounded-full w-full bg-white/20" />
                <div className="h-0.5 rounded-full w-4/5 bg-white/15" />
              </div>
            </div>
            <div className="flex-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <div className="p-2 h-full flex flex-col justify-end gap-0.5">
                {[80, 60, 90].map((h, i) => (
                  <div key={i} className="h-1.5 rounded-full" style={{ width: `${h}%`, backgroundColor: `${accent}aa` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        {type === 'title' && (
          <div className="space-y-1">
            <div className="h-0.5 rounded-full bg-white/15 w-full" />
            <div className="h-0.5 rounded-full bg-white/10 w-4/5" />
            <div className="h-0.5 rounded-full bg-white/10 w-3/5" />
          </div>
        )}
        {type === 'data' && (
          <div className="flex gap-2">
            {[{ v: '38%', l: 'Growth' }, { v: '$4.2M', l: 'Pipeline' }, { v: '94', l: 'Score' }].map(d => (
              <div key={d.l} className="flex-1 rounded-lg p-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-white font-extrabold text-xs leading-none">{d.v}</p>
                <p className="text-white/40 text-[7px] mt-0.5">{d.l}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Upload → Generate flow mockup ── */
function FlowMockup({ inView }: { inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      {/* App topbar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-[#0F6E56] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.5L7.2 4.5L10.5 5L8 7.5L8.8 10.5L6 9L3.2 10.5L4 7.5L1.5 5L4.8 4.5L6 1.5Z" fill="white"/></svg>
        </div>
        <p className="text-xs font-bold text-pm-primary">PitchMind</p>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-[10px] font-semibold text-[#059669] flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            AI generating
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {['Upload', 'Configure', 'Generate', 'Export'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${i < 3 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-gray-100 text-gray-400'}`}>
                {i < 2 ? (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : i === 2 ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56] animate-pulse" />
                ) : null}
                {step}
              </div>
              {i < 3 && <div className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Main area: progress + slide preview */}
        <div className="flex gap-4">
          {/* Left: progress */}
          <div className="w-48 space-y-3">
            <div className="bg-[#F4FCF8] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-pm-primary">Q4 Growth Report.pdf</p>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5l2.5 2.5 5.5-5" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#0F6E56] rounded-full" style={{ width: '78%' }} />
              </div>
              <p className="text-[9px] text-pm-muted">6 of 8 slides complete</p>
            </div>

            <div className="space-y-1.5">
              {[
                { label: 'Executive Summary', done: true },
                { label: 'Revenue Overview', done: true },
                { label: 'Market Analysis', done: true },
                { label: 'Growth Metrics', done: true },
                { label: 'Team & Operations', done: true },
                { label: 'Financials', done: true },
                { label: 'Roadmap 2026', done: false, active: true },
                { label: 'Call to Action', done: false },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded-lg ${s.active ? 'bg-[#E1F5EE]' : ''}`}>
                  {s.done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4.5" fill="#0F6E56"/><path d="M3 5l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  ) : s.active ? (
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-[#0F6E56] border-t-transparent animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-[9px] font-medium truncate ${s.done ? 'text-pm-primary' : s.active ? 'text-[#0F6E56] font-bold' : 'text-gray-400'}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live slide preview */}
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-pm-muted uppercase tracking-wider">Live preview</p>
            <div className="rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0F6E56 0%, #1a9470 60%, #0a4a38 100%)' }}>
              <div className="w-full h-full p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-1 rounded-full bg-white/40 mb-2" />
                  <p className="text-white font-extrabold text-sm leading-tight">Roadmap 2026</p>
                  <p className="text-white/50 text-[9px] mt-0.5">Strategic initiatives & milestones</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { q: 'Q1', label: 'Product launch', color: 'rgba(255,255,255,0.15)' },
                    { q: 'Q2', label: 'Series B close', color: 'rgba(201,147,10,0.4)' },
                    { q: 'Q3–Q4', label: 'Global expansion', color: 'rgba(255,255,255,0.1)' },
                  ].map(item => (
                    <div key={item.q} className="rounded-lg p-1.5" style={{ backgroundColor: item.color }}>
                      <p className="text-white font-bold text-[8px]">{item.q}</p>
                      <p className="text-white/60 text-[7px] mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* AI note */}
            <div className="bg-[#FFF8E3] rounded-xl p-2.5 flex gap-2">
              <div className="w-4 h-4 rounded-full bg-[#C9930A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1L5 3.5L7.5 4L5.5 6L6 8.5L4 7.2L2 8.5L2.5 6L0.5 4L3 3.5L4 1Z" fill="#C9930A"/></svg>
              </div>
              <p className="text-[9px] text-gray-600 leading-relaxed"><span className="font-bold text-[#C9930A]">AI tip:</span> Use the Q2 milestone to anchor your Series B ask — investors connect timeline to capital deployment.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function HeroDashboard() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const slides = [
    { gradient: 'linear-gradient(135deg, #0F2E22 0%, #1D6E50 100%)', accent: '#5DCAA5', title: 'Executive Summary', subtitle: 'Q4 Growth Report · 2025', type: 'bullets' as const, delay: 0.05 },
    { gradient: 'linear-gradient(135deg, #0F6E56 0%, #1a9470 100%)', accent: '#C9930A', title: 'Q4 Revenue Overview', subtitle: 'October – December 2025', type: 'chart' as const, delay: 0.12 },
    { gradient: 'linear-gradient(135deg, #1a2a4a 0%, #2a4a8a 100%)', accent: '#60A5FA', title: 'Market Opportunity', subtitle: '$8.4B addressable market', type: 'split' as const, delay: 0.19 },
    { gradient: 'linear-gradient(135deg, #2a1800 0%, #6a4800 100%)', accent: '#F59E0B', title: 'Growth Metrics', subtitle: 'Key performance indicators', type: 'data' as const, delay: 0.26 },
    { gradient: 'linear-gradient(135deg, #111111 0%, #2d2d2d 100%)', accent: '#A78BFA', title: 'Team & Operations', subtitle: '42 team members across 3 hubs', type: 'bullets' as const, delay: 0.33 },
  ]

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-[#f7faf8] to-white dark:from-[#0B0F0D] dark:to-[#08120D]">
      {/* Subtle top divider gradient */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#e8f5f0]/60 dark:from-[#2DD4A0]/8 to-transparent pointer-events-none" />

      <motion.div
        ref={ref}
        className="max-w-7xl mx-auto px-6 space-y-12"
      >
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-pm-muted dark:text-white/55 mb-5">See it in action</p>
          <h2 className="text-[32px] md:text-[46px] font-extrabold text-pm-primary dark:text-white leading-[1.08] tracking-[-0.025em]">
            From document to deck<br className="hidden sm:block" /> in <span className="text-pm-teal dark:text-[#5DE5B8]">under 60 seconds.</span>
          </h2>
          <p className="text-pm-muted dark:text-white/65 text-[17px] mt-5 leading-relaxed">Upload any file. Watch PitchMind structure your story slide by slide, live.</p>
        </motion.div>

        {/* Generation flow mockup */}
        <FlowMockup inView={inView} />

        {/* Output — slide previews */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-pm-muted dark:text-white/55 mb-4"
          >
            Generated slides output
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {slides.map(s => (
              <SlideCard key={s.title} {...s} inView={inView} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
