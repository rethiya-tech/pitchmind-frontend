# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal 3-section landing page with a premium 10-section animated landing page matching the Lovable reference design.

**Architecture:** Each page section lives in its own component under `src/components/landing/`. `LandingPage.tsx` becomes a thin assembler. All animations use Framer Motion `useInView` + `motion.div` with `once: true`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (pm-* tokens), Framer Motion, React Router 6, react-hot-toast

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `src/index.css` | Add `scroll-behavior: smooth` |
| Create | `src/components/landing/LandNav.tsx` | Sticky nav, transparent→white on scroll |
| Create | `src/components/landing/HeroSection.tsx` | Dark hero + video modal |
| Create | `src/components/landing/SocialProofBar.tsx` | Marquee logo strip |
| Create | `src/components/landing/FeaturesSection.tsx` | 4 alternating feature rows |
| Create | `src/components/landing/ShowcaseSection.tsx` | Dark deck gallery |
| Create | `src/components/landing/PhasesSection.tsx` | 4-phase workflow grid |
| Create | `src/components/landing/PaletteSection.tsx` | Colour swatch showcase |
| Create | `src/components/landing/FaqSection.tsx` | Accordion FAQ |
| Create | `src/components/landing/CtaBanner.tsx` | Dark closing CTA |
| Create | `src/components/landing/LandFooter.tsx` | Newsletter + links |
| Modify | `src/pages/LandingPage.tsx` | Assemble all sections |

---

## Task 1: Install Framer Motion + smooth scroll

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Install framer-motion**

```bash
cd pitchmind-frontend && npm install framer-motion
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Add smooth scroll to index.css**

Open `src/index.css` and add `scroll-behavior: smooth` inside the existing `html` rule:

```css
@layer base {
  html {
    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    scroll-behavior: smooth;
  }

  body {
    background-color: #F7F8F6;
    color: #1A1A1A;
  }
}
```

- [ ] **Step 3: Verify dev server still compiles**

```bash
npm run dev
```

Expected: Vite compiles with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.css package.json package-lock.json
git commit -m "feat: add framer-motion, enable smooth scroll"
```

---

## Task 2: LandNav — sticky transparent-to-white nav

**Files:**
- Create: `src/components/landing/LandNav.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/LandNav.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function LandNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-pm-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold text-pm-teal tracking-tight">
          PitchMind
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className={`text-sm font-medium transition-colors hover:text-pm-teal ${
              scrolled ? 'text-pm-primary' : 'text-white/80'
            }`}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className={`text-sm font-medium transition-colors hover:text-pm-teal ${
              scrolled ? 'text-pm-primary' : 'text-white/80'
            }`}
          >
            How it works
          </a>
          <a
            href="#faq"
            className={`text-sm font-medium transition-colors hover:text-pm-teal ${
              scrolled ? 'text-pm-primary' : 'text-white/80'
            }`}
          >
            FAQ
          </a>
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`text-sm font-semibold transition-colors hover:text-pm-teal ${
              scrolled ? 'text-pm-primary' : 'text-white/80'
            }`}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 mb-1 transition-colors ${scrolled ? 'bg-pm-primary' : 'bg-white'}`} />
          <span className={`block w-5 h-0.5 mb-1 transition-colors ${scrolled ? 'bg-pm-primary' : 'bg-white'}`} />
          <span className={`block w-5 h-0.5 transition-colors ${scrolled ? 'bg-pm-primary' : 'bg-white'}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-pm-border px-6 py-4 flex flex-col gap-4">
          <a href="#features" className="text-sm font-medium text-pm-primary" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-pm-primary" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#faq" className="text-sm font-medium text-pm-primary" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/login" className="text-sm font-medium text-pm-primary" onClick={() => setMenuOpen(false)}>Sign in</Link>
          <Link to="/register" className="bg-pm-teal text-white text-sm font-semibold px-4 py-2 rounded-lg text-center" onClick={() => setMenuOpen(false)}>Sign Up</Link>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/LandNav.tsx
git commit -m "feat: add LandNav sticky transparent-to-white nav"
```

---

## Task 3: HeroSection — dark gradient hero with video modal

**Files:**
- Create: `src/components/landing/HeroSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/HeroSection.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const SLIDE_GRADIENTS = [
  'from-[#0F2E22] to-[#1D9E75]',
  'from-[#1a2a4a] to-[#2a4a8a]',
  'from-[#2a1a00] to-[#5a3a00]',
  'from-[#1a1a1a] to-[#333333]',
]

function VideoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src="https://www.youtube.com/embed/LB9lnb3oC2Y?autoplay=1"
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors"
          aria-label="Close video"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#0a1a14] via-[#0F2E22] to-[#0a1612] overflow-hidden">
        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#1D9E75]/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#0F6E56]/15 blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Text column */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[#5DCAA5] text-sm font-bold tracking-widest uppercase mb-4"
            >
              ✦ AI-Powered Presentations
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6"
            >
              Create. Present.<br />
              <span className="text-[#5DCAA5]">Win with AI.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-white/60 text-lg leading-relaxed mb-8 max-w-md"
            >
              PitchMind turns any document into a stunning, audience-ready
              presentation — in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/register"
                className="bg-pm-teal hover:bg-pm-teal-hover text-white font-bold px-7 py-3 rounded-xl transition-colors text-base"
              >
                Try PitchMind →
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="flex items-center gap-2 border border-white/25 hover:border-white/50 text-white font-bold px-7 py-3 rounded-xl transition-colors text-base"
              >
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[#0F6E56] text-xs ml-0.5">▶</span>
                </span>
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Mockup column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="grid grid-cols-2 gap-3"
          >
            {SLIDE_GRADIENTS.map((gradient, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${gradient} rounded-xl h-28 md:h-36 border border-white/10 relative overflow-hidden`}
              >
                <div className="absolute bottom-3 left-3 right-3 h-1.5 bg-white/20 rounded-full" />
                <div className="absolute bottom-6 left-3 w-1/2 h-1 bg-white/10 rounded-full" />
                <div className="absolute top-3 left-3 w-8 h-1 bg-white/20 rounded-full" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/HeroSection.tsx
git commit -m "feat: add HeroSection with dark gradient and video modal"
```

---

## Task 4: SocialProofBar — marquee logo strip

**Files:**
- Create: `src/components/landing/SocialProofBar.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/SocialProofBar.tsx`:

```tsx
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const COMPANIES = ['Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Loom']

export function SocialProofBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  // Duplicate for seamless loop — animate translateX(0) → translateX(-50%)
  const doubled = [...COMPANIES, ...COMPANIES]

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-[#f8f9f7] border-y border-pm-border py-6 overflow-hidden"
    >
      <p className="text-center text-xs font-bold tracking-widest uppercase text-pm-muted mb-4">
        Trusted by teams at
      </p>
      <div className="overflow-hidden">
        <div className="flex animate-marquee gap-16 items-center whitespace-nowrap w-max">
          {doubled.map((name, i) => (
            <span key={i} className="text-lg font-extrabold text-[#C0C4BD] tracking-tight select-none">
              {name}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 2: Add marquee keyframes to tailwind.config.js**

Open `tailwind.config.js` and add the animation inside `theme.extend`:

```js
extend: {
  // ... existing extend content ...
  animation: {
    marquee: 'marquee 24s linear infinite',
  },
  keyframes: {
    marquee: {
      '0%': { transform: 'translateX(0%)' },
      '100%': { transform: 'translateX(-50%)' },
    },
  },
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/SocialProofBar.tsx tailwind.config.js
git commit -m "feat: add SocialProofBar with CSS marquee animation"
```

---

## Task 5: FeaturesSection — 4 alternating feature rows

**Files:**
- Create: `src/components/landing/FeaturesSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/FeaturesSection.tsx`:

```tsx
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = [
  {
    tag: 'Feature 01',
    title: 'Stunning slides in seconds',
    desc: 'Upload any document — PDF, DOCX, TXT, or Markdown. PitchMind\'s AI reads your content, structures your story, and designs every slide automatically.',
    icon: '⚡',
    bg: 'from-[#0F2E22] to-[#1D9E75]',
    bullets: ['Auto-structured narrative', 'Smart slide layouts', 'Content-aware design'],
  },
  {
    tag: 'Feature 02',
    title: 'Know your audience. Win more.',
    desc: 'Set your audience type, tone, and theme before generating. PitchMind tailors language and emphasis to match exactly who\'s in the room.',
    icon: '🎯',
    bg: 'from-[#1a2a4a] to-[#2a4a8a]',
    bullets: ['Audience-aware language', 'Tone presets (formal, casual, bold)', 'Six professional themes'],
  },
  {
    tag: 'Feature 03',
    title: 'A talking AI presenter',
    desc: 'Every slide gets AI-written speaker notes. Practise your pitch with full context — so you never stumble in the room.',
    icon: '🎙️',
    bg: 'from-[#2a1800] to-[#6a3a00]',
    bullets: ['Per-slide speaker notes', 'Context-aware talking points', 'Export notes with PPTX'],
  },
  {
    tag: 'Feature 04',
    title: 'Edit together, in real time',
    desc: 'Refine slides in the built-in drag-and-drop editor. Reorder, rewrite, restyle — then export a pixel-perfect PPTX in one click.',
    icon: '✏️',
    bg: 'from-[#1a1a1a] to-[#2d2d2d]',
    bullets: ['Drag-and-drop reorder', 'Inline text editing', 'One-click PPTX export'],
  },
]

function FeatureRow({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isEven = index % 2 === 1

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center py-12 border-b border-pm-border last:border-0`}
    >
      {/* Mockup card */}
      <div className={`w-full md:w-1/2 bg-gradient-to-br ${feature.bg} rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden border border-white/10 shadow-xl`}>
        <span className="text-6xl">{feature.icon}</span>
        <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
          <div className="h-1.5 bg-white/20 rounded-full w-3/4" />
          <div className="h-1.5 bg-white/10 rounded-full w-1/2" />
          <div className="h-1.5 bg-white/10 rounded-full w-2/3" />
        </div>
      </div>

      {/* Text */}
      <div className="w-full md:w-1/2 space-y-4">
        <p className="text-xs font-bold tracking-widest uppercase text-pm-teal">{feature.tag}</p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-pm-primary leading-tight">{feature.title}</h3>
        <p className="text-pm-muted leading-relaxed">{feature.desc}</p>
        <ul className="space-y-2 pt-2">
          {feature.bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-pm-primary">
              <span className="w-4 h-4 rounded-full bg-pm-teal/10 text-pm-teal flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
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
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">What you get</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-pm-primary mb-4 leading-tight">
            Everything you need to<br />win the room
          </h2>
          <p className="text-pm-muted text-lg max-w-xl mx-auto">
            Four intelligent features — designed to impress, inform, and close.
          </p>
        </motion.div>

        {FEATURES.map((f, i) => (
          <FeatureRow key={f.tag} feature={f} index={i} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/FeaturesSection.tsx
git commit -m "feat: add FeaturesSection with 4 alternating animated rows"
```

---

## Task 6: ShowcaseSection — dark deck gallery

**Files:**
- Create: `src/components/landing/ShowcaseSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/ShowcaseSection.tsx`:

```tsx
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
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-[#5DCAA5] mb-3">Real output</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Decks crafted in minutes,{' '}
            <span className="text-[#5DCAA5]">not weeks</span>
          </h2>
          <p className="text-white/50 text-lg mt-3">Real output from real documents — six professional themes.</p>
        </motion.div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
          {DECKS.map((deck, i) => (
            <motion.div
              key={deck.label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className={`flex-shrink-0 w-52 md:w-64 aspect-[4/3] bg-gradient-to-br ${deck.gradient} rounded-2xl border border-white/10 shadow-2xl snap-start relative overflow-hidden cursor-pointer`}
            >
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/ShowcaseSection.tsx
git commit -m "feat: add ShowcaseSection dark deck gallery"
```

---

## Task 7: PhasesSection — 4-phase workflow grid

**Files:**
- Create: `src/components/landing/PhasesSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/PhasesSection.tsx`:

```tsx
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PHASES = [
  {
    num: '01',
    title: 'Upload',
    desc: 'Drop in any PDF, DOCX, TXT, or Markdown file. PitchMind reads and understands your content instantly.',
    icon: '📄',
  },
  {
    num: '02',
    title: 'Configure',
    desc: 'Choose your audience type, tone of voice, and one of six professional themes.',
    icon: '🎨',
  },
  {
    num: '03',
    title: 'AI Generate',
    desc: 'Claude AI structures your narrative, writes slide content, and adds speaker notes — all in under 30 seconds.',
    icon: '🤖',
  },
  {
    num: '04',
    title: 'Download',
    desc: 'Review, edit in the slide editor, then export a polished PPTX with one click.',
    icon: '⬇️',
  },
]

export function PhasesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">The process</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-pm-primary mb-4">
            Four phases. One vision.
          </h2>
          <p className="text-pm-muted text-lg max-w-xl mx-auto">
            From raw document to polished download — fully automated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.num}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bg-[#f8f9f7] rounded-2xl p-6 border border-pm-border hover:border-pm-teal/30 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4">{phase.icon}</div>
              <p className="text-xs font-extrabold tracking-widest uppercase text-pm-teal mb-2">
                Phase {phase.num}
              </p>
              <h3 className="text-lg font-extrabold text-pm-primary mb-2">{phase.title}</h3>
              <p className="text-sm text-pm-muted leading-relaxed">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/PhasesSection.tsx
git commit -m "feat: add PhasesSection 4-phase workflow grid"
```

---

## Task 8: PaletteSection — colour swatch showcase

**Files:**
- Create: `src/components/landing/PaletteSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/PaletteSection.tsx`:

```tsx
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SWATCHES = [
  { color: '#0F6E56', name: 'Executive Modern' },
  { color: '#1D9E75', name: 'Accent Teal' },
  { color: '#5DCAA5', name: 'Teal Light' },
  { color: '#E1F5EE', name: 'Teal Wash' },
  { color: '#1a2a4a', name: 'Corporate Zenith' },
  { color: '#111111', name: 'Midnight Insight' },
  { color: '#C8850A', name: 'Executive Gold' },
  { color: '#F7F8F6', name: 'Nordic Flow' },
]

export function PaletteSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-[#f8f9f7] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">Design system</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-pm-primary mb-4 leading-tight">
              A palette built to command attention.
            </h2>
            <p className="text-pm-muted text-lg leading-relaxed">
              Six professional themes, each crafted for a different audience — from boardroom to startup pitch.
            </p>
          </motion.div>

          {/* Swatches */}
          <div className="grid grid-cols-4 gap-3">
            {SWATCHES.map((swatch, i) => (
              <motion.div
                key={swatch.color}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group"
              >
                <div
                  className="w-full aspect-square rounded-xl border border-black/10 shadow-sm group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: swatch.color }}
                />
                <p className="text-[10px] text-pm-muted mt-1.5 text-center leading-tight font-medium">
                  {swatch.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/PaletteSection.tsx
git commit -m "feat: add PaletteSection colour swatch showcase"
```

---

## Task 9: FaqSection — animated accordion FAQ

**Files:**
- Create: `src/components/landing/FaqSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/FaqSection.tsx`:

```tsx
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'What file formats do you support?',
    a: 'PitchMind supports PDF, DOCX (Word), plain text (.txt), and Markdown (.md) files.',
  },
  {
    q: 'How long does generation take?',
    a: 'Under 30 seconds for most documents. Longer documents with 50+ pages may take up to a minute.',
  },
  {
    q: 'Can I edit the slides after generation?',
    a: 'Yes. Use the built-in slide editor to reorder, rewrite, or restyle any slide before downloading.',
  },
  {
    q: "What's a PitchMind theme?",
    a: 'A theme is a pre-designed visual style — fonts, colours, and layouts — applied automatically to every slide in your deck.',
  },
  {
    q: 'Do you offer team plans?',
    a: 'Team collaboration features are coming soon. Sign up now to be first in line when they launch.',
  },
]

function FaqItem({ faq, isOpen, onToggle }: { faq: typeof FAQS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-pm-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-semibold text-pm-primary group-hover:text-pm-teal transition-colors pr-4">
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-pm-teal text-2xl font-light flex-shrink-0"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
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
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-pm-teal mb-3">Got questions?</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-pm-primary">
            Frequently considered.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="divide-y divide-pm-border border-y border-pm-border"
        >
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/FaqSection.tsx
git commit -m "feat: add FaqSection animated accordion"
```

---

## Task 10: CtaBanner — dark closing CTA

**Files:**
- Create: `src/components/landing/CtaBanner.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/CtaBanner.tsx`:

```tsx
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src="https://www.youtube.com/embed/LB9lnb3oC2Y?autoplay=1"
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
        >
          ×
        </button>
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

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Your next pitch deserves{' '}
            <span className="text-[#5DCAA5]">PitchMind.</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of professionals who never start from a blank slide again.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="bg-pm-teal hover:bg-pm-teal-hover text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Get started free
            </Link>
            <button
              onClick={() => setVideoOpen(true)}
              className="border border-white/25 hover:border-white/50 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/CtaBanner.tsx
git commit -m "feat: add CtaBanner dark closing CTA section"
```

---

## Task 11: LandFooter — newsletter + links

**Files:**
- Create: `src/components/landing/LandFooter.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/landing/LandFooter.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function LandFooter() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success("You're subscribed! We'll be in touch.")
    setEmail('')
  }

  return (
    <footer className="bg-[#0a100d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-10 border-b border-white/10">
          <div className="max-w-xs">
            <Link to="/" className="text-xl font-extrabold text-[#5DCAA5] tracking-tight">
              PitchMind
            </Link>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              Pitch craft, in your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex gap-2 items-start">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#5DCAA5] transition-colors w-56"
            />
            <button
              type="submit"
              className="bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Middle links */}
        <div className="flex flex-wrap gap-6 py-8 border-b border-white/10">
          <a href="#features" className="text-sm text-white/40 hover:text-white/80 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-white/40 hover:text-white/80 transition-colors">How it works</a>
          <a href="#faq" className="text-sm text-white/40 hover:text-white/80 transition-colors">FAQ</a>
          <Link to="/login" className="text-sm text-white/40 hover:text-white/80 transition-colors">Sign in</Link>
          <Link to="/register" className="text-sm text-white/40 hover:text-white/80 transition-colors">Sign Up</Link>
        </div>

        {/* Bottom */}
        <p className="text-white/25 text-xs pt-6">
          © 2025 PitchMind. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/LandFooter.tsx
git commit -m "feat: add LandFooter with newsletter subscribe"
```

---

## Task 12: Assemble LandingPage.tsx

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Replace LandingPage.tsx**

Replace the entire contents of `src/pages/LandingPage.tsx` with:

```tsx
import { LandNav } from '@/components/landing/LandNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { SocialProofBar } from '@/components/landing/SocialProofBar'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ShowcaseSection } from '@/components/landing/ShowcaseSection'
import { PhasesSection } from '@/components/landing/PhasesSection'
import { PaletteSection } from '@/components/landing/PaletteSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { CtaBanner } from '@/components/landing/CtaBanner'
import { LandFooter } from '@/components/landing/LandFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandNav />
      <HeroSection />
      <SocialProofBar />
      <FeaturesSection />
      <ShowcaseSection />
      <PhasesSection />
      <PaletteSection />
      <FaqSection />
      <CtaBanner />
      <LandFooter />
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Open browser and verify visually**

Navigate to `http://localhost:5173` and confirm:
- Hero has dark gradient, two CTA buttons
- Nav is transparent over hero, turns white on scroll
- "Watch Demo" opens YouTube modal
- Smooth scroll on anchor links
- All 10 sections render top to bottom

- [ ] **Step 4: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat: assemble new landing page from section components"
```
