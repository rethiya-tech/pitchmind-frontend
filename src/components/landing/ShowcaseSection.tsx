import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const DECKS = [
  { label: 'Q4 Growth', sub: 'Executive Modern', gradient: 'from-[#0F6E56] via-[#1D9E75] to-[#0a4a38]' },
  { label: 'Aurora AI', sub: 'Digital Frontier', gradient: 'from-[#1a2a4a] via-[#2a3a6a] to-[#0a1628]' },
  { label: 'Annual Report 2025', sub: 'Corporate Zenith', gradient: 'from-[#111111] via-[#222222] to-[#0a0a0a]' },
  { label: 'Future of Work', sub: 'Executive Gold', gradient: 'from-[#3a2800] via-[#6a4800] to-[#2a1800]' },
  { label: 'Pitch Deck', sub: 'Nordic Flow', gradient: 'from-[#1a3040] via-[#2a4a60] to-[#0a1828]' },
]

export function ShowcaseSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-gradient-to-br from-[#0a1a14] to-[#111a16] py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }} className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-[#5DCAA5] mb-3">Real output</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Decks crafted in minutes, <span className="text-[#5DCAA5]">not weeks</span>
          </h2>
          <p className="text-white/50 text-lg mt-3">Real output from real documents — six professional themes.</p>
        </motion.div>
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
          {DECKS.map((deck, i) => (
            <motion.div key={deck.label} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ scale: 1.04, y: -4 }}
              className={`flex-shrink-0 w-52 md:w-64 aspect-[4/3] bg-gradient-to-br ${deck.gradient} rounded-2xl border border-white/10 shadow-2xl snap-start relative overflow-hidden cursor-pointer`}>
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-white/25 rounded-full w-1/2" />
                  <div className="h-1 bg-white/10 rounded-full w-3/4" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-base leading-tight">{deck.label}</p>
                  <p className="text-white/50 text-xs mt-0.5">{deck.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
