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
    <div className="border-b border-pm-border last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="font-semibold text-pm-primary group-hover:text-pm-teal transition-colors pr-4">{faq.q}</span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-pm-teal text-2xl font-light flex-shrink-0">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <p className="text-pm-muted pb-5 leading-relaxed">{faq.a}</p>
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
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }} className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">Got questions?</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-pm-primary">Frequently considered.</h2>
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
