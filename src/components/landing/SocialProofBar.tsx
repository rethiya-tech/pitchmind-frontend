import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const COMPANIES = ['Northwind', 'Aether Labs', 'Helix', 'Velora', 'Quantica']

export function SocialProofBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="relative bg-white py-10 overflow-hidden"
    >
      {/* Subtle green radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[200px] rounded-full bg-[#5DCAA5]/15 blur-[60px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#9ba8b4] whitespace-nowrap">
          Trusted by teams at
        </span>
        {COMPANIES.map((name) => (
          <span key={name} className="text-base font-bold text-[#1e2d3d] tracking-tight whitespace-nowrap">
            {name}
          </span>
        ))}
      </div>
    </motion.section>
  )
}
