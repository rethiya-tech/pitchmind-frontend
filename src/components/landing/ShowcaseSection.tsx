import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const DECKS = [
  {
    label: 'Q4 Investor Deck',
    sub: 'Series B · Growth report',
    gradient: 'linear-gradient(135deg, #0F2E22 0%, #1D6E50 60%, #0a4a38 100%)',
    accent: '#5DCAA5',
    slides: [
      { title: 'Executive Summary', type: 'bullets' },
      { title: 'Revenue Q4', type: 'chart' },
      { title: 'Market Size', type: 'data' },
    ],
  },
  {
    label: 'Aurora AI — Product',
    sub: 'Digital Frontier theme',
    gradient: 'linear-gradient(135deg, #0d1b3e 0%, #1a2e6b 60%, #0a1228 100%)',
    accent: '#60A5FA',
    slides: [
      { title: 'Product Vision', type: 'title' },
      { title: 'Feature Matrix', type: 'bullets' },
      { title: 'Traction', type: 'chart' },
    ],
  },
  {
    label: 'Annual Report 2025',
    sub: 'Corporate Zenith theme',
    gradient: 'linear-gradient(135deg, #111111 0%, #252525 60%, #0a0a0a 100%)',
    accent: '#A78BFA',
    slides: [
      { title: 'Year in Review', type: 'title' },
      { title: 'Financial Highlights', type: 'data' },
      { title: 'Board Message', type: 'bullets' },
    ],
  },
  {
    label: 'Future of Work',
    sub: 'Executive Gold theme',
    gradient: 'linear-gradient(135deg, #3a2000 0%, #7a4a00 60%, #2a1600 100%)',
    accent: '#F59E0B',
    slides: [
      { title: 'The Shift', type: 'title' },
      { title: 'Research Data', type: 'chart' },
      { title: 'Our Solution', type: 'bullets' },
    ],
  },
  {
    label: 'SaaS Pitch Deck',
    sub: 'Nordic Flow theme',
    gradient: 'linear-gradient(135deg, #162030 0%, #2a4060 60%, #0a1525 100%)',
    accent: '#34D399',
    slides: [
      { title: 'Problem', type: 'bullets' },
      { title: 'Metrics', type: 'data' },
      { title: 'Ask', type: 'title' },
    ],
  },
]

function SlidePreviewCard({ deck }: { deck: typeof DECKS[0] }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer group"
      style={{ background: deck.gradient }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="w-8 h-1 rounded-full mb-2" style={{ backgroundColor: deck.accent, opacity: 0.8 }} />
        <p className="text-white font-extrabold text-sm leading-tight">{deck.label}</p>
        <p className="mt-0.5" style={{ color: `${deck.accent}99`, fontSize: 10 }}>{deck.sub}</p>
      </div>

      {/* Slide stack */}
      <div className="px-3 pb-4 space-y-1.5">
        {deck.slides.map((slide, i) => (
          <div
            key={i}
            className="rounded-lg overflow-hidden border border-white/5"
            style={{ background: 'rgba(255,255,255,0.05)', aspectRatio: '16/5' }}
          >
            <div className="w-full h-full px-3 py-2 flex items-center justify-between">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="h-1 rounded-full" style={{ width: '55%', backgroundColor: deck.accent, opacity: 0.7 }} />
                {slide.type === 'bullets' && (
                  <div className="space-y-0.5">
                    {[70, 85, 60].map((w, j) => (
                      <div key={j} className="h-0.5 rounded-full bg-white/20" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                )}
                {slide.type === 'chart' && (
                  <div className="flex items-end gap-0.5 h-3">
                    {[5, 7, 4, 9, 6, 8].map((h, j) => (
                      <div key={j} className="flex-1 rounded-t-sm" style={{ height: `${h * 10}%`, backgroundColor: j%2===0 ? `${deck.accent}cc` : 'rgba(255,255,255,0.2)' }} />
                    ))}
                  </div>
                )}
                {slide.type === 'data' && (
                  <div className="flex gap-1">
                    {['38%','$4M','94'].map(v => (
                      <div key={v} className="flex-1 rounded bg-white/10 flex items-center justify-center">
                        <span className="text-white font-bold" style={{ fontSize: 6 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {slide.type === 'title' && (
                  <div className="h-0.5 rounded-full bg-white/10 w-4/5" />
                )}
              </div>
              <div className="ml-2 flex-shrink-0">
                <span className="text-white/30 font-bold" style={{ fontSize: 8 }}>{i + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex gap-1">
          {deck.slides.map((_, i) => (
            <div key={i} className="h-1 rounded-full transition-all" style={{ width: i === 0 ? 16 : 6, backgroundColor: i === 0 ? deck.accent : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold transition-all opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5" style={{ color: deck.accent }}>
          Open
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8m0 0L8 4m3 3l-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export function ShowcaseSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="showcase" className="relative bg-[#08130E] py-24 md:py-32 overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute top-[-30%] right-[10%] w-[700px] h-[500px] rounded-full bg-[#1D9E75]/12 blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <div className="relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-14 max-w-2xl"
          >
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#5DCAA5]/80 mb-5">Real output</p>
            <h2 className="text-[34px] md:text-[52px] font-extrabold text-white leading-[1.05] tracking-[-0.025em]">
              Decks crafted in minutes,<br />
              <span className="text-[#5DCAA5]">not weeks.</span>
            </h2>
            <p className="text-white/50 text-[17px] mt-5 leading-relaxed">Real output from real documents — five professional themes.</p>
          </motion.div>
        </div>

        {/* Grid — all 5 visible, no scroll */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {DECKS.map((deck, i) => (
              <motion.div
                key={deck.label}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                whileHover={{ scale: 1.05, y: -8, zIndex: 30, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
              >
                <SlidePreviewCard deck={deck} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
