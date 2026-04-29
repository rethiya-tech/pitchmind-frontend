import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SWATCHES = [
  { color: '#0F6E56', name: 'Executive Modern' },
  { color: '#1D9E75', name: 'Accent Teal' },
  { color: '#5DCAA5', name: 'Teal Light' },
  { color: '#E1F5EE', name: 'Teal Wash' },
  { color: '#1a2a4a', name: 'Corporate Zenith' },
  { color: '#111111', name: 'Midnight Insight' },
  { color: '#C8850A', name: 'Executive Gold' },
  { color: '#F7F8F6', name: 'Nordic Flow' },
]

export function PaletteSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-[#f8f9f7] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div ref={ref} initial={{ opacity: 0, x: -32 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.55 }}>
            <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">Design system</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-pm-primary mb-4 leading-tight">A palette built to command attention.</h2>
            <p className="text-pm-muted text-lg leading-relaxed">Six professional themes, each crafted for a different audience — from boardroom to startup pitch.</p>
          </motion.div>
          <div className="grid grid-cols-4 gap-3">
            {SWATCHES.map((swatch, i) => (
              <motion.div key={swatch.color} initial={{ opacity: 0, scale: 0.85 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.4, delay: i * 0.06 }} className="group">
                <div className="w-full aspect-square rounded-xl border border-black/10 shadow-sm group-hover:scale-105 transition-transform" style={{ backgroundColor: swatch.color }} />
                <p className="text-[10px] text-pm-muted mt-1.5 text-center leading-tight font-medium">{swatch.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
