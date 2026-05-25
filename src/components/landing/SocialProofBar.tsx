import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const COMPANIES = [
  { name: 'Northwind', weight: 800, italic: false, tracking: '-0.02em' },
  { name: 'Aether Labs', weight: 300, italic: true, tracking: '0' },
  { name: 'HELIX', weight: 700, italic: false, tracking: '0.22em' },
  { name: 'Velora', weight: 600, italic: false, tracking: '-0.01em' },
  { name: 'Quantica', weight: 500, italic: true, tracking: '0' },
  { name: 'Lumen', weight: 800, italic: false, tracking: '-0.02em' },
]

export function SocialProofBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="relative bg-white py-16 border-y border-pm-border/60"
    >
      <div className="relative max-w-6xl mx-auto px-6">
        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-pm-muted/70 text-center mb-10">
          Trusted by teams building tomorrow's decks
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-12 md:gap-x-16 gap-y-6">
          {COMPANIES.map(c => (
            <span
              key={c.name}
              className="text-xl text-pm-primary/55 hover:text-pm-primary/85 transition-colors whitespace-nowrap"
              style={{ fontWeight: c.weight, fontStyle: c.italic ? 'italic' : 'normal', letterSpacing: c.tracking }}
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
