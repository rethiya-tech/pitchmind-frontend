import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ─── Reusable chart elements ─── */

function PieChartLarge() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <path d="M60 60 L60 10 A50 50 0 0 1 107 85 Z" fill="#0F6E56" opacity="0.9" />
      <path d="M60 60 L107 85 A50 50 0 0 1 20 90 Z" fill="#C8850A" opacity="0.85" />
      <path d="M60 60 L20 90 A50 50 0 0 1 60 10 Z" fill="#5DCAA5" opacity="0.75" />
      <circle cx="60" cy="60" r="22" fill="white" />
      <circle cx="88" cy="30" r="5" fill="#0F6E56" opacity="0.6" />
      <circle cx="95" cy="48" r="4" fill="#C8850A" opacity="0.6" />
      <circle cx="90" cy="68" r="4" fill="#5DCAA5" opacity="0.6" />
    </svg>
  )
}

function BarChartMain() {
  const bars = [
    { h: 62, c: '#5DCAA5' }, { h: 80, c: '#C8850A' }, { h: 48, c: '#5DCAA5' },
    { h: 95, c: '#C8850A' }, { h: 55, c: '#5DCAA5' }, { h: 72, c: '#C8850A' },
    { h: 85, c: '#5DCAA5' }, { h: 40, c: '#C8850A' },
  ]
  return (
    <svg viewBox="0 0 160 100" className="w-full h-full">
      {bars.map((b, i) => (
        <rect key={i} x={i * 20 + 4} y={100 - b.h} width="14" height={b.h} rx="3" fill={b.c} opacity="0.9" />
      ))}
      <line x1="0" y1="100" x2="160" y2="100" stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  )
}

function BarChartSmall() {
  const bars = [
    { h: 55, c: '#0F6E56' }, { h: 80, c: '#C8850A' }, { h: 40, c: '#0F6E56' },
    { h: 70, c: '#C8850A' }, { h: 60, c: '#0F6E56' }, { h: 90, c: '#C8850A' },
  ]
  return (
    <svg viewBox="0 0 110 80" className="w-full h-full">
      {bars.map((b, i) => (
        <rect key={i} x={i * 18 + 4} y={80 - b.h} width="12" height={b.h} rx="2.5" fill={b.c} opacity="0.88" />
      ))}
    </svg>
  )
}

function DonutSmall() {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <circle cx="40" cy="40" r="28" fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle cx="40" cy="40" r="28" fill="none" stroke="#0F6E56" strokeWidth="12"
        strokeDasharray="105 71" strokeDashoffset="21" strokeLinecap="round" />
      <circle cx="40" cy="40" r="28" fill="none" stroke="#C8850A" strokeWidth="12"
        strokeDasharray="50 126" strokeDashoffset="-84" strokeLinecap="round" />
      <circle cx="40" cy="40" r="14" fill="white" />
    </svg>
  )
}

function DonutTop() {
  return (
    <svg viewBox="0 0 100 60" className="w-full h-full">
      <circle cx="30" cy="30" r="22" fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle cx="30" cy="30" r="22" fill="none" stroke="#0F6E56" strokeWidth="10"
        strokeDasharray="90 48" strokeDashoffset="23" strokeLinecap="round" />
      <circle cx="30" cy="30" r="22" fill="none" stroke="#C8850A" strokeWidth="10"
        strokeDasharray="48 90" strokeDashoffset="-67" strokeLinecap="round" />
      <circle cx="30" cy="30" r="10" fill="white" />
      <rect x="65" y="10" width="30" height="6" rx="3" fill="#e5e7eb" />
      <rect x="65" y="22" width="22" height="5" rx="2.5" fill="#e5e7eb" />
      <rect x="65" y="33" width="26" height="5" rx="2.5" fill="#e5e7eb" />
      <rect x="65" y="44" width="18" height="5" rx="2.5" fill="#e5e7eb" />
    </svg>
  )
}

function PhotoGrid() {
  const blocks = [
    '#0F6E56', '#1D9E75', '#2a4a3a',
    '#5DCAA5', '#0a2a20', '#3a5a4a',
    '#C8850A', '#8a5a0a', '#4a3a1a',
  ]
  return (
    <div className="grid grid-cols-3 gap-0.5 w-full h-full rounded overflow-hidden">
      {blocks.map((c, i) => (
        <div key={i} style={{ backgroundColor: c }} className="opacity-90" />
      ))}
    </div>
  )
}

function TextLines({ count = 3, widths }: { count?: number; widths?: string[] }) {
  const defaults = ['70%', '90%', '55%', '80%']
  return (
    <div className="space-y-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-1.5 rounded-full bg-gray-200" style={{ width: widths?.[i] ?? defaults[i % 4] }} />
      ))}
    </div>
  )
}

/* ─── Slide card wrapper ─── */
function Slide({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/* ─── Main component ─── */
export function HeroDashboard() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section className="relative bg-white overflow-hidden" style={{ minHeight: 680 }}>
      {/* Background gradient — white with green glow left-center */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[55%] h-full bg-gradient-to-r from-[#d4ede5]/60 via-[#e8f7f1]/40 to-transparent" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-[#5DCAA5]/15 blur-[90px]" />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7 }}
        className="relative w-full"
        style={{ height: 680 }}
      >
        {/* ── Isometric card container ── */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -52%) rotateX(52deg) rotateZ(-28deg)',
            transformStyle: 'preserve-3d',
            perspective: '1400px',
            width: 900,
            height: 620,
          }}
        >
          {/* TOP card (center-top) */}
          <div className="absolute" style={{ top: '0%', left: '37%', width: 220 }}>
            <Slide>
              <div className="p-4">
                <TextLines count={1} widths={['60%']} />
                <div className="mt-2 h-16"><DonutTop /></div>
                <div className="mt-2"><TextLines count={2} widths={['80%', '55%']} /></div>
              </div>
            </Slide>
          </div>

          {/* LEFT card (pie chart) */}
          <div className="absolute" style={{ top: '24%', left: '1%', width: 270 }}>
            <Slide>
              <div className="p-4">
                <TextLines count={1} widths={['50%']} />
                <div className="mt-2 h-28"><PieChartLarge /></div>
                <div className="mt-2"><TextLines count={2} widths={['75%', '55%']} /></div>
              </div>
            </Slide>
          </div>

          {/* CENTER card — largest, focal point */}
          <div className="absolute" style={{ top: '28%', left: '30%', width: 340, zIndex: 10 }}>
            <Slide className="shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] px-4 py-2 flex items-center gap-2">
                <div className="h-2 w-20 bg-white/40 rounded-full" />
                <div className="ml-auto h-2 w-8 bg-white/25 rounded-full" />
              </div>
              <div className="p-4">
                <TextLines count={1} widths={['45%']} />
                <div className="mt-3 h-28"><BarChartMain /></div>
                <div className="mt-3 flex gap-3">
                  <div className="h-2 flex-1 bg-gray-200 rounded-full" />
                  <div className="h-2 flex-1 bg-gray-100 rounded-full" />
                  <div className="h-2 w-10 bg-gray-100 rounded-full" />
                </div>
              </div>
            </Slide>
          </div>

          {/* RIGHT card (top-right) */}
          <div className="absolute" style={{ top: '6%', left: '64%', width: 230 }}>
            <Slide>
              <div className="p-4">
                <TextLines count={1} widths={['65%']} />
                <div className="mt-2 h-20">
                  <svg viewBox="0 0 120 60" className="w-full h-full">
                    <circle cx="40" cy="30" r="22" fill="none" stroke="#e5e7eb" strokeWidth="9" />
                    <circle cx="40" cy="30" r="22" fill="none" stroke="#C8850A" strokeWidth="9"
                      strokeDasharray="80 58" strokeDashoffset="21" strokeLinecap="round" />
                    <circle cx="40" cy="30" r="22" fill="none" stroke="#5DCAA5" strokeWidth="9"
                      strokeDasharray="58 80" strokeDashoffset="-59" strokeLinecap="round" />
                    <circle cx="40" cy="30" r="11" fill="white" />
                    <rect x="75" y="8" width="38" height="6" rx="3" fill="#e5e7eb" />
                    <rect x="75" y="20" width="28" height="5" rx="2.5" fill="#e5e7eb" />
                    <rect x="75" y="31" width="33" height="5" rx="2.5" fill="#e5e7eb" />
                    <rect x="75" y="42" width="22" height="5" rx="2.5" fill="#e5e7eb" />
                  </svg>
                </div>
                <TextLines count={2} widths={['70%', '50%']} />
              </div>
            </Slide>
          </div>

          {/* BOTTOM-LEFT card (bar chart) */}
          <div className="absolute" style={{ top: '60%', left: '4%', width: 250 }}>
            <Slide>
              <div className="p-4">
                <TextLines count={1} widths={['55%']} />
                <div className="mt-2 h-20"><BarChartSmall /></div>
                <TextLines count={1} widths={['65%']} />
              </div>
            </Slide>
          </div>

          {/* BOTTOM-CENTER card (donut) */}
          <div className="absolute" style={{ top: '72%', left: '36%', width: 220 }}>
            <Slide>
              <div className="p-4 flex gap-3 items-center">
                <div className="w-16 h-16 flex-shrink-0"><DonutSmall /></div>
                <div className="flex-1"><TextLines count={3} widths={['90%', '65%', '75%']} /></div>
              </div>
            </Slide>
          </div>

          {/* BOTTOM-RIGHT card (photo grid) */}
          <div className="absolute" style={{ top: '54%', left: '63%', width: 250 }}>
            <Slide>
              <div className="p-4">
                <TextLines count={1} widths={['60%']} />
                <div className="mt-2 h-20"><PhotoGrid /></div>
              </div>
            </Slide>
          </div>
        </div>

        {/* ── Floating badge: Generating ── */}
        <motion.div
          initial={{ opacity: 0, x: -16, y: -8 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.5 }}
          className="absolute top-8 left-8 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-3.5 flex items-center gap-3 z-20"
        >
          <span className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center text-pm-teal flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5L18.5 8.3L14 12.5L15.2 18.5L10 15.5L4.8 18.5L6 12.5L1.5 8.3L7.5 7.5L10 2Z" fill="#0F6E56" opacity="0.85" />
            </svg>
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-pm-muted leading-none mb-1">Generating</p>
            <p className="text-sm font-extrabold text-pm-primary leading-none">Q4 Investor Deck</p>
          </div>
        </motion.div>

        {/* ── Floating badge: Pitch Score ── */}
        <motion.div
          initial={{ opacity: 0, x: 16, y: -8 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.65 }}
          className="absolute top-8 right-8 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-3.5 flex items-center gap-3 z-20"
        >
          <span className="w-10 h-10 rounded-xl bg-[#fff4e0] flex items-center justify-center text-xl flex-shrink-0">🏆</span>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-pm-muted leading-none mb-1">Pitch Score</p>
            <p className="text-xl font-extrabold text-pm-primary leading-none">94 / 100</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
