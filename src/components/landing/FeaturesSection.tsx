import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ── Feature 01: Upload → slide output ── */
function UploadMockup() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100 space-y-4 h-full">
      {/* Drop zone */}
      <div className="border-2 border-dashed border-[#0F6E56]/30 bg-[#F4FCF8] rounded-xl p-5 flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 13V7m-3 3l3-3 3 3" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 14v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-xs font-semibold text-pm-primary text-center">Drop your PDF, DOCX, or TXT</p>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full bg-[#0F6E56]" />
          <span className="text-[9px] text-pm-muted">78%</span>
        </div>
        <p className="text-[9px] text-pm-muted">Q4 Growth Report.pdf · Uploading…</p>
      </div>
      {/* Options row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Audience', val: 'Investors', color: '#0F6E56' },
          { label: 'Tone', val: 'Formal', color: '#C9930A' },
          { label: 'Slides', val: '8', color: '#6366F1' },
        ].map(o => (
          <div key={o.label} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <p className="text-[8px] text-pm-muted">{o.label}</p>
            <p className="text-[10px] font-bold" style={{ color: o.color }}>{o.val}</p>
          </div>
        ))}
      </div>
      {/* Generated output preview */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F6E56, #1D9E75)', aspectRatio: '16/7' }}>
        <div className="w-full h-full p-3 flex flex-col justify-between">
          <div>
            <div className="w-8 h-1 rounded-full bg-white/40 mb-1.5" />
            <p className="text-white text-[10px] font-bold">Executive Summary</p>
            <p className="text-white/50 text-[8px]">Q4 Growth Report · Slide 1 of 8</p>
          </div>
          <div className="space-y-1">
            {['38% revenue growth YoY', '$4.2M enterprise pipeline', 'Expanding to 3 new markets'].map(b => (
              <div key={b} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-[#C9930A]" />
                <div className="h-0.5 rounded-full bg-white/30" style={{ width: '65%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className={`w-4 h-2.5 rounded-sm ${i === 0 ? 'bg-[#0F6E56]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <span className="text-[9px] font-semibold text-[#0F6E56]">8 slides ready →</span>
      </div>
    </div>
  )
}

/* ── Feature 02: Audience config panel ── */
function AudienceMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 h-full flex flex-col">
      <div className="bg-[#0F2E22] px-5 py-3 flex items-center justify-between">
        <p className="text-white text-xs font-bold">Configure presentation</p>
        <div className="flex gap-1">
          {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{backgroundColor:c}}/>)}
        </div>
      </div>
      <div className="p-5 flex-1 space-y-4">
        {/* Audience selector */}
        <div>
          <p className="text-[9px] font-bold text-pm-muted uppercase tracking-wider mb-2">Audience type</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { l: 'Investors', icon: '💼', sel: true },
              { l: 'Executives', icon: '🏢', sel: false },
              { l: 'Technical', icon: '⚙️', sel: false },
              { l: 'General', icon: '👥', sel: false },
            ].map(a => (
              <div key={a.l} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer text-[10px] font-semibold ${a.sel ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]' : 'border-gray-100 text-pm-muted'}`}>
                <span>{a.icon}</span>{a.l}
                {a.sel && <div className="ml-auto w-3 h-3 rounded-full bg-[#0F6E56] flex items-center justify-center"><svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Tone slider */}
        <div>
          <p className="text-[9px] font-bold text-pm-muted uppercase tracking-wider mb-2">Tone</p>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-pm-muted">Casual</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full relative">
              <div className="absolute inset-y-0 left-0 rounded-full bg-[#0F6E56]" style={{ width: '75%' }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#0F6E56] shadow-sm" style={{ left: 'calc(75% - 6px)' }} />
            </div>
            <span className="text-[9px] text-pm-muted">Formal</span>
          </div>
        </div>

        {/* AI preview */}
        <div className="bg-[#F4FCF8] rounded-xl p-3 border border-[#0F6E56]/10">
          <p className="text-[9px] font-bold text-[#0F6E56] mb-1.5">AI language preview</p>
          <p className="text-[9px] text-gray-600 leading-relaxed italic">"Our Q4 results demonstrate compelling unit economics, with CAC payback improving to 14 months and LTV:CAC reaching 4.2x across the enterprise segment…"</p>
        </div>

        {/* Theme picker mini */}
        <div>
          <p className="text-[9px] font-bold text-pm-muted uppercase tracking-wider mb-2">Theme</p>
          <div className="flex gap-1.5">
            {[
              'linear-gradient(135deg,#0F6E56,#1D9E75)',
              'linear-gradient(135deg,#1a2a4a,#2a4a8a)',
              'linear-gradient(135deg,#111,#2d2d2d)',
              'linear-gradient(135deg,#3a2800,#6a4800)',
            ].map((g, i) => (
              <div key={i} className={`w-8 h-5 rounded-md cursor-pointer ${i === 0 ? 'ring-2 ring-[#0F6E56] ring-offset-1' : ''}`} style={{ background: g }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Feature 03: Speaker notes + AI voice ── */
function SpeakerMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 h-full flex flex-col">
      {/* Slide mini preview */}
      <div className="rounded-t-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1a2a4a,#2a4a8a)', aspectRatio:'16/6' }}>
        <div className="w-full h-full p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-1 rounded-full bg-white/30 mb-2" />
            <p className="text-white text-xs font-bold">Market Opportunity</p>
            <p className="text-white/50 text-[8px]">$8.4B addressable market · Slide 3</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 rounded-lg bg-white/10" />
            <div className="flex-1 h-8 rounded-lg bg-white/15" />
            <div className="flex-1 h-8 rounded-lg bg-[#60A5FA]/40" />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-3">
        {/* AI Notes section */}
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold text-pm-muted uppercase tracking-wider">AI Speaker Notes</p>
          <div className="flex items-center gap-1.5 bg-[#E1F5EE] px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56] animate-pulse" />
            <span className="text-[8px] font-bold text-[#0F6E56]">Narrating</span>
          </div>
        </div>

        <div className="bg-[#F4FCF8] rounded-xl p-3 border border-[#0F6E56]/10">
          <p className="text-[9px] text-gray-700 leading-relaxed">"The $8.4 billion addressable market breaks down across three segments. Lead with enterprise — that's where our competitive moat is strongest. Pause after the SAM figure to let it land before moving to the competitive landscape."</p>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-1 h-6">
          {[3,5,8,6,4,9,7,5,8,4,6,9,5,7,3,8,6,4,7,5].map((h, i) => (
            <div key={i} className="flex-1 rounded-full" style={{ height: `${h * 10}%`, backgroundColor: i < 12 ? '#0F6E56' : '#E5E7EB' }} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8 5L3 2v6l5-3z" fill="#6B7280"/></svg>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#0F6E56] flex items-center justify-center cursor-pointer">
              <div className="flex gap-0.5"><div className="w-0.5 h-2.5 bg-white rounded-full"/><div className="w-0.5 h-2.5 bg-white rounded-full"/></div>
            </div>
          </div>
          <span className="text-[9px] text-pm-muted font-medium">0:24 / 1:10</span>
        </div>
      </div>
    </div>
  )
}

/* ── Feature 04: Drag-and-drop editor ── */
function EditorMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-0.5">
          {['B','I','U'].map(t => <div key={t} className="w-5 h-5 rounded text-[8px] font-bold text-gray-400 flex items-center justify-center bg-gray-50">{t}</div>)}
        </div>
        <div className="w-px h-3 bg-gray-200 mx-1" />
        <div className="flex gap-1">
          {['#0F6E56','#C9930A','#1a1a1a'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{backgroundColor:c}}/>)}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[8px] text-[#059669] font-semibold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]"/>Saved</span>
          <div className="bg-[#0F6E56] text-white text-[8px] font-bold px-3 py-1 rounded-full cursor-pointer">Export PPTX</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Slide list — draggable */}
        <div className="w-24 border-r border-gray-100 py-2 px-1.5 space-y-1.5 overflow-hidden">
          {[
            { t: 'Title', g: 'linear-gradient(135deg,#0F6E56,#1D9E75)', active: false },
            { t: 'Revenue', g: 'linear-gradient(135deg,#0F6E56,#1D9E75)', active: true },
            { t: 'Market', g: 'linear-gradient(135deg,#1a2a4a,#2a4a8a)', active: false },
            { t: 'Team', g: 'linear-gradient(135deg,#111,#2d2d2d)', active: false },
          ].map((s, i) => (
            <div key={i} className={`rounded-lg overflow-hidden cursor-grab border ${s.active ? 'border-[#0F6E56] shadow-sm' : 'border-gray-100'} relative`}>
              <div style={{ background: s.g, aspectRatio: '16/9' }} className="flex items-end p-1">
                <span className="text-white text-[6px] font-semibold">{s.t}</span>
              </div>
              {/* Drag handle */}
              <div className="absolute top-1 right-1 opacity-40">
                <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
                  <circle cx="1.5" cy="1.5" r="1" fill="white"/><circle cx="4.5" cy="1.5" r="1" fill="white"/>
                  <circle cx="1.5" cy="4" r="1" fill="white"/><circle cx="4.5" cy="4" r="1" fill="white"/>
                  <circle cx="1.5" cy="6.5" r="1" fill="white"/><circle cx="4.5" cy="6.5" r="1" fill="white"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Main canvas */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-3">
          <div className="w-full rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg,#0F6E56,#1D9E75)' }}>
            <div className="w-full h-full p-4 flex flex-col justify-between">
              <div>
                <div className="w-8 h-1 rounded-full bg-white/40 mb-2" />
                {/* Editable heading — shows cursor */}
                <div className="flex items-center gap-0.5">
                  <p className="text-white font-extrabold text-xs">Q4 Revenue Overview</p>
                  <div className="w-0.5 h-3 bg-white/80 animate-pulse" />
                </div>
                <p className="text-white/50 text-[8px] mt-0.5">October – December 2025</p>
              </div>
              <div className="flex items-end gap-1.5 h-12">
                {[55,72,48,88,62,95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm" style={{ height:`${h}%`, backgroundColor: i%2===0 ? 'rgba(255,255,255,0.5)' : 'rgba(201,147,10,0.8)' }}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    tag: 'Feature 01',
    title: 'Stunning slides in seconds',
    desc: "Upload any document — PDF, DOCX, TXT, or Markdown. PitchMind's AI reads your content, structures your story, and designs every slide automatically.",
    bullets: ['Auto-structured narrative', 'Smart slide layouts', 'Content-aware design'],
    Mockup: UploadMockup,
  },
  {
    tag: 'Feature 02',
    title: 'Know your audience. Win more.',
    desc: 'Set your audience type, tone, and theme before generating. PitchMind tailors language and emphasis to match exactly who\'s in the room.',
    bullets: ['Audience-aware language', 'Tone presets (formal, casual, bold)', 'Six professional themes'],
    Mockup: AudienceMockup,
  },
  {
    tag: 'Feature 03',
    title: 'A talking AI presenter',
    desc: 'Every slide gets AI-written speaker notes. Practise your pitch with full context — so you never stumble in the room.',
    bullets: ['Per-slide speaker notes', 'Context-aware talking points', 'Export notes with PPTX'],
    Mockup: SpeakerMockup,
  },
  {
    tag: 'Feature 04',
    title: 'Edit together, in real time',
    desc: 'Refine slides in the built-in drag-and-drop editor. Reorder, rewrite, restyle — then export a pixel-perfect PPTX in one click.',
    bullets: ['Drag-and-drop reorder', 'Inline text editing', 'One-click PPTX export'],
    Mockup: EditorMockup,
  },
]

function FeatureRow({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isEven = index % 2 === 1
  const { Mockup } = feature

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 md:gap-20 items-center py-16 md:py-20 border-b border-pm-border/70 last:border-0`}
    >
      {/* Mockup side */}
      <div className="w-full md:w-1/2" style={{ minHeight: 280 }}>
        <Mockup />
      </div>

      {/* Copy side */}
      <div className="w-full md:w-1/2 space-y-5">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-pm-muted">
          <span className="w-6 h-px bg-pm-teal/60" />
          {feature.tag}
        </div>
        <h3 className="text-[26px] md:text-[34px] font-extrabold text-pm-primary leading-[1.12] tracking-tight">{feature.title}</h3>
        <p className="text-pm-muted text-[16px] leading-[1.65] max-w-lg">{feature.desc}</p>
        <ul className="space-y-2.5 pt-3">
          {feature.bullets.map(b => (
            <li key={b} className="flex items-center gap-3 text-[14px] text-pm-primary">
              <span className="w-5 h-5 rounded-full bg-pm-teal/10 text-pm-teal flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="bg-white py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 md:mb-24 max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-pm-muted mb-5">What you get</p>
          <h2 className="text-[34px] md:text-[52px] font-extrabold text-pm-primary mb-5 leading-[1.05] tracking-[-0.025em]">
            Everything you need to<br />
            <span className="text-pm-teal">win the room.</span>
          </h2>
          <p className="text-pm-muted text-[17px] leading-relaxed">Four intelligent features — designed to impress, inform, and close.</p>
        </motion.div>
        {FEATURES.map((f, i) => <FeatureRow key={f.tag} feature={f} index={i} />)}
      </div>
    </section>
  )
}
