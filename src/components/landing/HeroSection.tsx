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
        <button onClick={onClose} className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors" aria-label="Close video">×</button>
      </div>
    </div>
  )
}

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-16">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f5f0] via-white to-[#fff4e8]" />
        {/* Soft radial glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#5DCAA5]/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#f5c080]/25 blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center w-full">
          {/* Announcement badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 bg-white/80 border border-pm-border text-pm-primary text-xs font-semibold px-4 py-2 rounded-full shadow-sm mb-8"
          >
            <span className="text-pm-teal">✦</span>
            New · Phase 3 — Talking AI Assistant is here
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6"
          >
            <span className="text-pm-primary">Create. Present.</span>
            <br />
            <span className="text-pm-teal">Win with AI.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-pm-muted text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            PitchMind turns any document into a polished deck in seconds —
            answers audience questions live, narrates with AI voice, and
            improves with every pitch.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-5"
          >
            <Link
              to="/register"
              className="bg-pm-teal hover:bg-pm-teal-hover text-white font-bold px-8 py-3.5 rounded-full transition-colors text-base shadow-md"
            >
              Try PitchMind Free →
            </Link>
            <button
              onClick={() => setVideoOpen(true)}
              className="flex items-center gap-2.5 bg-white hover:bg-gray-50 border border-pm-border text-pm-primary font-bold px-8 py-3.5 rounded-full transition-colors text-base shadow-sm"
            >
              <span className="w-5 h-5 rounded-full bg-pm-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] ml-0.5">▶</span>
              </span>
              Watch demo
            </button>
          </motion.div>

          {/* Social proof note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-pm-muted text-sm"
          >
            No credit card · 1 free pitch on us
          </motion.p>
        </div>
      </section>

      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  )
}
