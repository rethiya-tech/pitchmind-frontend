import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function VideoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <iframe src="https://www.youtube.com/embed/LB9lnb3oC2Y?autoplay=1" className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
        <button onClick={onClose} className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors">×</button>
      </div>
    </div>
  )
}

/* ── Realistic app mockup ── */
function AppMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(15,110,86,0.18),0_8px_32px_rgba(0,0,0,0.10)] border border-white/60" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Window chrome */}
      <div className="bg-[#1a1a1a] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 mx-3 bg-[#2d2d2d] rounded-md px-3 py-1 text-[10px] text-gray-400 truncate">pitchmind.app/editor/q4-deck</div>
        <div className="w-4 h-4 opacity-40">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.2"/><path d="M5.5 8h5M8 5.5v5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
      </div>

      {/* App shell */}
      <div className="flex bg-[#F4FCF8]" style={{ height: 340 }}>
        {/* Sidebar */}
        <div className="w-14 bg-white border-r border-gray-100 flex flex-col items-center py-3 gap-3 flex-shrink-0">
          {/* Logo */}
          <div className="w-7 h-7 rounded-lg bg-[#0F6E56] flex items-center justify-center mb-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L8.5 5.5L12 6L9.5 8.5L10 12L7 10.5L4 12L4.5 8.5L2 6L5.5 5.5L7 2Z" fill="white"/></svg>
          </div>
          {[
            <path key="d" d="M2 4a1 1 0 011-1h3l1 1.5H11a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>,
            <><rect key="r1" x="3" y="3" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><path key="r2" d="M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
            <path key="s" d="M2 4.5h10M2 7.5h7M2 10.5h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>,
            <><circle key="c" cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path key="p" d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
          ].map((icon, i) => (
            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${i === 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'text-gray-400 hover:bg-gray-100'}`}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">{icon}</svg>
            </div>
          ))}
        </div>

        {/* Slide panel */}
        <div className="w-28 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="px-2.5 py-2 border-b border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Slides · 8</p>
          </div>
          <div className="flex-1 overflow-hidden py-1.5 px-2 space-y-1.5">
            {[
              { title: 'Executive Summary', active: false, color: '#0F6E56' },
              { title: 'Q4 Revenue', active: true, color: '#0F6E56' },
              { title: 'Market Growth', active: false, color: '#0F6E56' },
              { title: 'Team & Ops', active: false, color: '#0F6E56' },
              { title: 'Financials', active: false, color: '#C9930A' },
            ].map((s, i) => (
              <div key={i} className={`rounded-md overflow-hidden cursor-pointer border ${s.active ? 'border-[#0F6E56] shadow-sm' : 'border-gray-100'}`}>
                <div className="aspect-video relative" style={{ background: `linear-gradient(135deg, ${s.color}22 0%, ${s.color}08 100%)` }}>
                  <div className="absolute inset-0 p-1.5 flex flex-col gap-0.5">
                    <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: s.color, opacity: 0.7 }} />
                    <div className="h-0.5 rounded-full w-full bg-gray-300 opacity-60" />
                    <div className="h-0.5 rounded-full w-4/5 bg-gray-300 opacity-40" />
                    <div className="h-0.5 rounded-full w-3/5 bg-gray-300 opacity-40" />
                  </div>
                  {s.active && <div className="absolute left-0 inset-y-0 w-0.5 bg-[#0F6E56]" />}
                </div>
                <div className="px-1 py-0.5">
                  <p className={`text-[7px] font-semibold truncate ${s.active ? 'text-[#0F6E56]' : 'text-gray-400'}`}>{s.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main slide canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-100 px-3 py-1.5 flex items-center gap-2">
            <div className="flex gap-0.5">
              {['B', 'I', 'U'].map(t => (
                <div key={t} className="w-5 h-5 rounded text-[8px] font-bold text-gray-400 flex items-center justify-center hover:bg-gray-100 cursor-pointer">{t}</div>
              ))}
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex gap-1">
              {['#0F6E56', '#C9930A', '#1a1a1a'].map(c => (
                <div key={c} className="w-3 h-3 rounded-full cursor-pointer" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="text-[8px] font-semibold text-[#059669] flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />Saved
              </div>
              <div className="bg-[#0F6E56] text-white text-[8px] font-bold px-2 py-0.5 rounded-full cursor-pointer">Export</div>
            </div>
          </div>

          {/* Slide */}
          <div className="flex-1 flex items-center justify-center p-4 bg-[#F4FCF8]">
            <div className="w-full max-w-sm rounded-xl shadow-lg overflow-hidden border border-gray-200" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 100%)' }}>
              {/* Slide header bar */}
              <div className="flex flex-col h-full px-5 py-4">
                <div className="w-6 h-1 rounded-full bg-white/40 mb-2" />
                <div className="text-white font-extrabold text-xs leading-tight mb-1">Q4 Revenue Overview</div>
                <div className="text-white/60 text-[7px] mb-3">October – December 2025</div>
                {/* Mini bar chart */}
                <div className="flex-1 flex items-end gap-1.5">
                  {[42, 65, 55, 80, 70, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(201,147,10,0.8)' }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => (
                    <span key={m} className="text-[6px] text-white/40">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - AI notes */}
        <div className="w-40 bg-white border-l border-gray-100 flex flex-col flex-shrink-0">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">AI Notes</p>
          </div>
          <div className="p-2.5 space-y-2.5">
            <div className="bg-[#E1F5EE] rounded-lg p-2">
              <p className="text-[8px] font-bold text-[#0F6E56] mb-1">Speaker prompt</p>
              <p className="text-[7px] text-gray-600 leading-relaxed">Highlight the 38% YoY growth — emphasise the Nov spike driven by the enterprise deal close.</p>
            </div>
            <div className="bg-[#FFF8E3] rounded-lg p-2">
              <p className="text-[8px] font-bold text-[#C9930A] mb-1">Audience tip</p>
              <p className="text-[7px] text-gray-600 leading-relaxed">Investors want forward guidance here — bridge to Q1 targets.</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#0F6E56]" style={{ width: '91%' }} />
                </div>
                <span className="text-[9px] font-extrabold text-[#0F6E56]">91</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-[#0F6E56] px-4 py-1 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[8px] text-white/80 font-semibold">AI generation complete</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[8px] text-white/60">8 slides · 94/100 pitch score</span>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <section className="relative overflow-hidden pt-16" style={{ minHeight: '94vh' }}>
        {/* Background — subtle, off-white with restrained accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4f8f5] via-[#fafbfa] to-white" />
        <div className="absolute top-[-200px] left-1/3 w-[820px] h-[820px] rounded-full bg-[#5DCAA5]/10 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-160px] right-[10%] w-[420px] h-[420px] rounded-full bg-[#f5c080]/10 blur-[140px] pointer-events-none" />
        {/* Faint grid overlay for premium texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0F2E22 1px, transparent 1px), linear-gradient(90deg, #0F2E22 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center" style={{ minHeight: 'calc(94vh - 64px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full py-16">

            {/* Left — copy */}
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2.5 bg-white/70 backdrop-blur border border-pm-border/80 text-pm-primary text-[12px] font-semibold px-3.5 py-1.5 rounded-full mb-8"
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-pm-teal opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pm-teal" />
                </span>
                <span className="text-pm-muted">New</span>
                <span className="w-px h-3 bg-pm-border" />
                Phase 3 · Talking AI Assistant
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-[44px] md:text-[64px] font-extrabold leading-[1.02] tracking-[-0.025em] mb-6"
              >
                <span className="text-pm-primary">Create. Present.</span>
                <br />
                <span className="text-pm-teal">Win with AI.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-pm-muted text-[17px] leading-[1.65] mb-9 max-w-[480px]"
              >
                PitchMind turns any document into a polished deck in seconds —
                answers audience questions live, narrates with AI voice, and
                improves with every pitch.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 mb-5"
              >
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-[15px] shadow-[0_8px_24px_-8px_rgba(15,46,34,0.5)] hover:shadow-[0_12px_32px_-8px_rgba(15,46,34,0.6)]"
                >
                  Try PitchMind Free
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M3 7h8m0 0L8 4m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur hover:bg-white border border-pm-border text-pm-primary font-semibold px-6 py-3.5 rounded-xl transition-colors text-[15px]"
                >
                  <span className="w-5 h-5 rounded-full bg-pm-teal/10 flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M2 1.5v5l4-2.5-4-2.5z" fill="#0F6E56" />
                    </svg>
                  </span>
                  Watch 90s demo
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex items-center gap-4 text-[13px] text-pm-muted"
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#0F6E56" strokeWidth="1.2" />
                    <path d="M4 7l2 2 4-4" stroke="#0F6E56" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  No credit card
                </span>
                <span className="w-1 h-1 rounded-full bg-pm-border" />
                <span>1 free pitch on us</span>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="flex items-center gap-10 mt-12 pt-8 border-t border-pm-border/70 w-full max-w-md"
              >
                {[
                  { val: '10k+', label: 'Decks created' },
                  { val: '94%', label: 'Avg pitch score' },
                  { val: '<60s', label: 'Generation time' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-pm-primary leading-none tracking-tight tabular-nums">{s.val}</p>
                    <p className="text-[11px] text-pm-muted mt-1.5 font-medium tracking-wide uppercase">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — app mockup */}
            <motion.div
              initial={{ opacity: 0, x: 32, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative hidden lg:block"
            >
              {/* Glow behind mockup */}
              <div className="absolute -inset-8 bg-[#5DCAA5]/10 blur-[60px] rounded-3xl pointer-events-none" />

              {/* Floating badges — refined, less SaaS-y */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.45 }}
                className="absolute -top-5 -left-6 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_12px_40px_-8px_rgba(15,46,34,0.18)] border border-pm-border/70 px-3.5 py-2.5 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-pm-teal/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-pm-teal animate-pulse" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-pm-muted leading-none mb-1">Generating</p>
                  <p className="text-[12px] font-bold text-pm-primary leading-none tracking-tight">Q4 Investor Deck</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.45 }}
                className="absolute -bottom-5 -right-6 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_12px_40px_-8px_rgba(15,46,34,0.18)] border border-pm-border/70 px-3.5 py-2.5 flex items-center gap-3"
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#0F6E56" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset="5.65" strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-pm-primary tabular-nums">94</span>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-pm-muted leading-none mb-1">Pitch Score</p>
                  <p className="text-[12px] font-bold text-pm-primary leading-none tracking-tight">Top 3% of decks</p>
                </div>
              </motion.div>

              <AppMockup />
            </motion.div>

          </div>
        </div>
      </section>

      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  )
}
