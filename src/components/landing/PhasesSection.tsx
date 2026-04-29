import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PHASES = [
  { num: '01', title: 'Upload', desc: 'Drop in any PDF, DOCX, TXT, or Markdown file. PitchMind reads and understands your content instantly.', icon: '📄' },
  { num: '02', title: 'Configure', desc: 'Choose your audience type, tone of voice, and one of six professional themes.', icon: '🎨' },
  { num: '03', title: 'AI Generate', desc: 'Claude AI structures your narrative, writes slide content, and adds speaker notes — all in under 30 seconds.', icon: '🤖' },
  { num: '04', title: 'Download', desc: 'Review, edit in the slide editor, then export a polished PPTX with one click.', icon: '⬇️' },
]

export function PhasesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }} className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">The process</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-pm-primary mb-4">Four phases. One vision.</h2>
          <p className="text-pm-muted text-lg max-w-xl mx-auto">From raw document to polished download — fully automated.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHASES.map((phase, i) => (
            <motion.div key={phase.num} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bg-[#f8f9f7] rounded-2xl p-6 border border-pm-border hover:border-pm-teal/30 hover:shadow-md transition-all">
              <div className="text-3xl mb-4">{phase.icon}</div>
              <p className="text-xs font-extrabold tracking-widest uppercase text-pm-teal mb-2">Phase {phase.num}</p>
              <h3 className="text-lg font-extrabold text-pm-primary mb-2">{phase.title}</h3>
              <p className="text-sm text-pm-muted leading-relaxed">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
