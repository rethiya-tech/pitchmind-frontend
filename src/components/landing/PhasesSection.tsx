import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
function ConfigureIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function GenerateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.39 5.55L20 8.45l-4 4.06L17.18 19 12 16.27 6.82 19 8 12.51l-4-4.06 5.61-.9L12 2z" />
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

const PHASES = [
  { num: '01', title: 'Upload', desc: 'Drop in any PDF, DOCX, TXT, or Markdown. PitchMind reads and understands your content instantly.', Icon: UploadIcon },
  { num: '02', title: 'Configure', desc: 'Choose your audience type, tone of voice, and one of six professional themes.', Icon: ConfigureIcon },
  { num: '03', title: 'Generate', desc: 'Claude AI structures your narrative, writes content, and adds speaker notes — under 30 seconds.', Icon: GenerateIcon },
  { num: '04', title: 'Download', desc: 'Review, edit in the slide editor, then export a polished PPTX with one click.', Icon: DownloadIcon },
]

export function PhasesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="bg-white py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16 md:mb-20">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-pm-muted mb-4">The process</p>
          <h2 className="text-3xl md:text-[44px] font-extrabold text-pm-primary mb-4 leading-[1.08] tracking-tight">Four phases. One vision.</h2>
          <p className="text-pm-muted text-[17px] max-w-xl mx-auto leading-relaxed">From raw document to polished download — fully automated.</p>
        </motion.div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-pm-border rounded-3xl overflow-hidden border border-pm-border">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="bg-white p-8 md:p-10 group hover:bg-[#fafbfa] transition-colors"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-11 h-11 rounded-xl bg-[#F4FCF8] text-pm-teal flex items-center justify-center group-hover:bg-pm-teal group-hover:text-white transition-colors">
                  <phase.Icon />
                </div>
                <span className="text-[11px] font-semibold tracking-[0.18em] text-pm-muted/60 tabular-nums">{phase.num}</span>
              </div>
              <h3 className="text-xl font-extrabold text-pm-primary mb-2 tracking-tight">{phase.title}</h3>
              <p className="text-[14px] text-pm-muted leading-relaxed">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
