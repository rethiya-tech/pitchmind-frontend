import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const FAQS = [
  { q: 'What file formats do you support?', a: 'PitchMind supports PDF, DOCX (Word), plain text (.txt), and Markdown (.md) files.' },
  { q: 'How long does generation take?', a: 'Under 30 seconds for most documents. Longer documents with 50+ pages may take up to a minute.' },
  { q: 'Can I edit the slides after generation?', a: 'Yes. Use the built-in slide editor to reorder, rewrite, or restyle any slide before downloading.' },
  { q: "What's a PitchMind theme?", a: 'A theme is a pre-designed visual style — fonts, colours, and layouts — applied automatically to every slide in your deck.' },
  { q: 'Do you offer team plans?', a: 'Team collaboration features are coming soon. Sign up now to be first in line when they launch.' },
]

function FaqItem({ faq, isOpen, onToggle }: { faq: typeof FAQS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-pm-border/70 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-[16px] font-semibold text-pm-primary group-hover:text-pm-teal transition-colors pr-4 tracking-tight">{faq.q}</span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="flex-shrink-0 w-7 h-7 rounded-full bg-pm-teal/8 group-hover:bg-pm-teal/15 flex items-center justify-center text-pm-teal text-lg font-light leading-none transition-colors">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="overflow-hidden">
            <p className="text-pm-muted text-[15px] pb-6 leading-[1.7] pr-10">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="faq" className="bg-white py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-14">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-pm-muted mb-5">Got questions?</p>
          <h2 className="text-[34px] md:text-[52px] font-extrabold text-pm-primary leading-[1.05] tracking-[-0.025em]">Frequently considered.</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.15 }} className="divide-y divide-pm-border border-y border-pm-border">
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.q} faq={faq} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
