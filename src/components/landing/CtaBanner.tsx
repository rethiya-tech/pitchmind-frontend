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
      <section className="bg-gradient-to-br from-[#0a1a14] via-[#0F2E22] to-[#0a1612] py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#1D9E75]/15 blur-[100px] pointer-events-none" />
        <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Your next pitch deserves <span className="text-[#5DCAA5]">PitchMind.</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">Join thousands of professionals who never start from a blank slide again.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-pm-teal hover:bg-pm-teal-hover text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base">Get started free</Link>
            <button onClick={() => setVideoOpen(true)} className="border border-white/25 hover:border-white/50 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base">Watch Demo</button>
          </div>
        </motion.div>
      </section>
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  )
}
