import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = [
  { tag: 'Feature 01', title: 'Stunning slides in seconds', desc: "Upload any document — PDF, DOCX, TXT, or Markdown. PitchMind's AI reads your content, structures your story, and designs every slide automatically.", icon: '⚡', bg: 'from-[#0F2E22] to-[#1D9E75]', bullets: ['Auto-structured narrative', 'Smart slide layouts', 'Content-aware design'] },
  { tag: 'Feature 02', title: 'Know your audience. Win more.', desc: "Set your audience type, tone, and theme before generating. PitchMind tailors language and emphasis to match exactly who's in the room.", icon: '🎯', bg: 'from-[#1a2a4a] to-[#2a4a8a]', bullets: ['Audience-aware language', 'Tone presets (formal, casual, bold)', 'Six professional themes'] },
  { tag: 'Feature 03', title: 'A talking AI presenter', desc: "Every slide gets AI-written speaker notes. Practise your pitch with full context — so you never stumble in the room.", icon: '🎙️', bg: 'from-[#2a1800] to-[#6a3a00]', bullets: ['Per-slide speaker notes', 'Context-aware talking points', 'Export notes with PPTX'] },
  { tag: 'Feature 04', title: 'Edit together, in real time', desc: 'Refine slides in the built-in drag-and-drop editor. Reorder, rewrite, restyle — then export a pixel-perfect PPTX in one click.', icon: '✏️', bg: 'from-[#1a1a1a] to-[#2d2d2d]', bullets: ['Drag-and-drop reorder', 'Inline text editing', 'One-click PPTX export'] },
]

function FeatureRow({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isEven = index % 2 === 1

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center py-12 border-b border-pm-border last:border-0`}>
      <div className={`w-full md:w-1/2 bg-gradient-to-br ${feature.bg} rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden border border-white/10 shadow-xl`}>
        <span className="text-6xl">{feature.icon}</span>
        <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
          <div className="h-1.5 bg-white/20 rounded-full w-3/4" />
          <div className="h-1.5 bg-white/10 rounded-full w-1/2" />
          <div className="h-1.5 bg-white/10 rounded-full w-2/3" />
        </div>
      </div>
      <div className="w-full md:w-1/2 space-y-4">
        <p className="text-xs font-bold tracking-widest uppercase text-pm-teal">{feature.tag}</p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-pm-primary leading-tight">{feature.title}</h3>
        <p className="text-pm-muted leading-relaxed">{feature.desc}</p>
        <ul className="space-y-2 pt-2">
          {feature.bullets.map(b => (
            <li key={b} className="flex items-center gap-2 text-sm text-pm-primary">
              <span className="w-4 h-4 rounded-full bg-pm-teal/10 text-pm-teal flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }} className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">What you get</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-pm-primary mb-4 leading-tight">Everything you need to<br />win the room</h2>
          <p className="text-pm-muted text-lg max-w-xl mx-auto">Four intelligent features — designed to impress, inform, and close.</p>
        </motion.div>
        {FEATURES.map((f, i) => <FeatureRow key={f.tag} feature={f} index={i} />)}
      </div>
    </section>
  )
}
