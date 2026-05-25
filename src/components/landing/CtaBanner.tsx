import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <iframe src="https://www.youtube.com/embed/LB9lnb3oC2Y?autoplay=1" className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
        <button onClick={onClose} className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">×</button>
      </div>
    </div>
  )
}

export function CtaBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <section className="relative bg-[#08130E] py-28 md:py-36 overflow-hidden">
        {/* Layered atmospheric glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[#1D9E75]/20 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#5DCAA5]/10 blur-[120px] pointer-events-none" />

        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }} className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#5DCAA5]/80 mb-6">Ready when you are</p>
          <h2 className="text-[36px] md:text-[60px] font-extrabold text-white mb-6 leading-[1.04] tracking-[-0.025em]">
            Your next pitch deserves<br />
            <span className="bg-gradient-to-r from-[#5DCAA5] via-[#7dd8b8] to-[#5DCAA5] bg-clip-text text-transparent">PitchMind.</span>
          </h2>
          <p className="text-white/55 text-[17px] mb-12 max-w-xl mx-auto leading-relaxed">Join thousands of professionals who never start from a blank slide again.</p>

          <div className="flex flex-wrap gap-3 justify-center items-center">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-white hover:bg-white text-pm-primary font-semibold px-7 py-3.5 rounded-xl transition-all text-[15px] shadow-[0_8px_32px_-8px_rgba(93,202,165,0.5)] hover:shadow-[0_12px_40px_-8px_rgba(93,202,165,0.7)]"
            >
              Get started free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 7h8m0 0L8 4m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2.5 border border-white/15 hover:border-white/35 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-[15px] backdrop-blur"
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M2 1.5v5l4-2.5-4-2.5z" fill="white" />
                </svg>
              </span>
              Watch demo
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-5 text-[12px] text-white/35">
            <span className="inline-flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              No credit card
            </span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>1 free pitch</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </section>
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  )
}
