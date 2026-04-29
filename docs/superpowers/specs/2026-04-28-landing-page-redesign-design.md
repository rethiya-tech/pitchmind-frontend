# Landing Page Redesign — Design Spec
**Date:** 2026-04-28  
**Status:** Approved

## Goal
Replace the current minimal 3-section landing page with a premium, animated landing page matching the reference design at https://pitchmind-landing.lovable.app/.

## Tech choices
- **Framer Motion** for scroll-triggered entrance animations (fade-up on viewport entry)
- One component file per section, assembled in `LandingPage.tsx`
- All existing Tailwind `pm-*` tokens used throughout — no new colors introduced
- `framer-motion` added to `package.json` dependencies

---

## Architecture

### File structure
```
src/
  pages/
    LandingPage.tsx          ← assembler only, imports all sections
  components/
    landing/
      LandNav.tsx            ← sticky transparent→white nav
      HeroSection.tsx        ← dark gradient hero
      SocialProofBar.tsx     ← company logos strip
      FeaturesSection.tsx    ← 4 alternating feature rows
      ShowcaseSection.tsx    ← dark deck gallery
      PhasesSection.tsx      ← 4-phase workflow grid
      PaletteSection.tsx     ← colour swatch showcase
      FaqSection.tsx         ← accordion FAQ
      CtaBanner.tsx          ← dark closing CTA
      LandFooter.tsx         ← newsletter + links
```

### Animation pattern (shared)
All sections use the same `useInView` + `motion.div` pattern:
```tsx
const ref = useRef(null)
const inView = useInView(ref, { once: true, margin: '-80px' })
<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 32 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.55, ease: 'easeOut' }}
>
```
Staggered children use `transition={{ delay: index * 0.1 }}`.

---

## Sections

### 1. LandNav
- Sticky top, `z-50`
- Starts transparent over hero; transitions to `bg-white/90 backdrop-blur` on scroll (use `useScroll` from framer-motion or a scroll listener)
- Left: "PitchMind" logo (text, `text-pm-teal` when transparent, `text-pm-teal` always)
- Center: anchor links — Features, How it works, FAQ
- Right: "Sign in" (ghost) + "Sign Up" (filled teal)
- Mobile: hamburger collapses center links (simple `useState` toggle)

### 2. HeroSection
- Full-width, `min-h-[90vh]`, dark gradient background: `from-[#0a1a14] via-[#0F2E22] to-[#0a1612]`
- Subtle radial green glow top-right via `::before` pseudo or `div` overlay
- Left column (text):
  - Eyebrow: "✦ AI-Powered Presentations" in `text-pm-teal-light` (`#5DCAA5`)
  - H1: `"Create. Present."` (white) + `"Win with AI."` (`text-[#5DCAA5]`)
  - Subtext: "PitchMind turns any document into a stunning, audience-ready presentation — in seconds."
  - CTAs:
    - Primary: "Try PitchMind →" → `/register`, filled teal
    - Secondary: "▶ Watch Demo" → opens a lightbox modal with an embedded YouTube iframe (`https://www.youtube.com/embed/LB9lnb3oC2Y`); clicking outside or pressing Escape closes it
- Right column: 2×2 grid of slide thumbnail cards with gradient backgrounds (decorative, no real data)
- Animation: text fades up on load (no scroll trigger needed, runs on mount), mockup slides in from right

### 3. SocialProofBar
- Light `bg-[#f8f9f7]` strip, `border-y border-pm-border`
- "Trusted by teams at" label centered above
- Six company names displayed as styled text logos (no real SVG logos needed): **Stripe · Notion · Figma · Linear · Vercel · Loom**
- Continuous CSS `@keyframes marquee` scroll (duplicated list for seamless loop, `overflow: hidden`)
- Animation: fade in on scroll

### 4. FeaturesSection
- White background, `id="features"`
- Section header (centered): "Everything you need to win the room" + subtitle
- Four feature rows, **alternating layout** (odd = image-left, even = image-right):
  1. **"Stunning slides in seconds"** — Upload doc → AI designs every slide (icon: ⚡)
  2. **"Know your audience. Win more."** — Set tone, audience, theme before generating (icon: 🎯)
  3. **"A talking AI presenter"** — Speaker notes + AI voiceover per slide (icon: 🎙️)
  4. **"Edit together, in real time"** — Built-in slide editor, export to PPTX (icon: ✏️)
- Each row: feature tag ("Feature 01"), h3, body text, + a styled mockup card (coloured bg with decorative elements)
- Each row animates in independently on scroll

### 5. ShowcaseSection
- Dark background: `from-[#0a1a14] to-[#111a16]`
- Header: "Decks crafted in minutes," + `"not weeks"` in `#5DCAA5`
- Subtitle: "Real output from real documents — six professional themes."
- Horizontal scrollable row of 5 deck thumbnail cards, each with a different gradient + label
- Cards have subtle hover scale (`whileHover={{ scale: 1.04 }}`)
- Section fades in on scroll

### 6. PhasesSection
- White background, `id="how-it-works"`
- Header: "Four phases. One vision." + subtitle
- 2×2 responsive grid of phase cards:
  1. **Phase 01 — Upload** — PDF, DOCX, TXT or Markdown
  2. **Phase 02 — Configure** — Audience, tone, theme
  3. **Phase 03 — AI Generate** — Claude structures and writes every slide
  4. **Phase 04 — Download** — Export polished PPTX in one click
- Each card: phase number (teal), bold title, description, subtle `bg-[#f8f9f7]` background
- Staggered fade-up on scroll (delay = index × 0.1s)

### 7. PaletteSection
- `bg-[#f8f9f7]`
- Left column: "A palette built to command attention." + subtitle "Six professional themes, each crafted for a different audience."
- Right column: 2×4 grid of colour swatches (the 8 brand colours)
- Staggered swatch reveal on scroll

### 8. FaqSection
- White background, `id="faq"`
- Header: "Frequently considered."
- 5 accordion items (one opens at a time, `useState`):
  1. "What file formats do you support?" — PDF, DOCX, TXT, and Markdown.
  2. "How long does generation take?" — Under 30 seconds for most documents.
  3. "Can I edit the slides after generation?" — Yes, use the built-in slide editor before downloading.
  4. "What's a PitchMind theme?" — A pre-designed visual style applied to every slide — fonts, colours, layouts.
  5. "Do you offer team plans?" — Team features are coming soon. Sign up to be notified.
- Accordion open/close animated with Framer Motion `AnimatePresence`

### 9. CtaBanner
- Dark gradient, same as hero
- Centered text: "Your next pitch deserves" + `"PitchMind."` in teal
- Subtext: "Join thousands of professionals who never start from a blank slide again."
- Two buttons: "Get started free" (filled teal) + "Watch Demo" (ghost, same YouTube link)
- Fade-up animation on scroll

### 10. LandFooter
- `bg-[#0a100d]`
- Top row: brand + tagline left, newsletter form right ("Pitch craft, in your inbox." + email input + Subscribe button)
- Middle row: nav links (Features, How it works, FAQ, Privacy, Terms)
- Bottom: "© 2025 PitchMind. All rights reserved."
- Newsletter submit: no backend needed for now — `preventDefault` + show a "Thanks!" toast

---

## Routing & nav links
- "Features" → `#features` (smooth scroll)
- "How it works" → `#how-it-works` (smooth scroll)
- "FAQ" → `#faq` (smooth scroll)
- `html { scroll-behavior: smooth }` in `index.css`

## Removed from old page
- Old `ThemePicker` component (replaced by PaletteSection)
- Old 3-step "How it works" cards (replaced by PhasesSection)
- Old simple hero (replaced by HeroSection)

## Dependencies to add
- `framer-motion` — scroll animations (`npm install framer-motion`)

## What is NOT changing
- `NavBar.tsx` (used on auth/app pages) — untouched
- All auth pages, dashboard, editor — untouched
- Tailwind config — untouched
- Design tokens — untouched
