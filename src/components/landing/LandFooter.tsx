import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const PRODUCT_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
]
const COMPANY_LINKS = [
  { href: '#', label: 'About' },
  { href: '#', label: 'Blog' },
  { href: '#', label: 'Careers' },
  { href: '#', label: 'Contact' },
]
const LEGAL_LINKS = [
  { href: '#', label: 'Privacy' },
  { href: '#', label: 'Terms' },
  { href: '#', label: 'Security' },
  { href: '#', label: 'Cookies' },
]

function LogoMark() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#0F6E56] flex-shrink-0">
      <svg width="18" height="20" viewBox="0 0 16 18" fill="none">
        <rect x="2" y="1" width="10" height="13" rx="1.5" fill="white" fillOpacity="0.25" />
        <rect x="1" y="2" width="10" height="13" rx="1.5" fill="white" fillOpacity="0.5" />
        <rect x="0" y="3" width="12" height="14" rx="2" fill="white" />
        <rect x="2.5" y="6" width="7" height="1.2" rx="0.6" fill="#0F6E56" />
        <rect x="2.5" y="8.5" width="5" height="1.2" rx="0.6" fill="#0F6E56" fillOpacity="0.5" />
        <rect x="2.5" y="11" width="6" height="1.2" rx="0.6" fill="#0F6E56" fillOpacity="0.5" />
      </svg>
    </span>
  )
}

export function LandFooter() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success("You're subscribed! We'll be in touch.")
    setEmail('')
  }

  return (
    <footer className="bg-[#06100B] text-white border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Top: brand + newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/[0.06]">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <LogoMark />
              <span className="text-[20px] font-extrabold text-white tracking-tight">PitchMind</span>
            </Link>
            <p className="text-white/45 text-[15px] leading-relaxed max-w-sm">
              The AI presentation studio for teams who can't afford to lose the room.
            </p>
          </div>

          <div className="md:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-3">Pitch craft, in your inbox</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#5DCAA5]/60 focus:bg-white/[0.06] transition-colors"
              />
              <button type="submit" className="bg-white text-pm-primary text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-[12px] text-white/30 mt-3">No spam. Unsubscribe anytime.</p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-14 border-b border-white/[0.06]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">Product</p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-[14px] text-white/65 hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">Company</p>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-[14px] text-white/65 hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">Legal</p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-[14px] text-white/65 hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">Account</p>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-[14px] text-white/65 hover:text-white transition-colors">Sign in</Link></li>
              <li><Link to="/register" className="text-[14px] text-white/65 hover:text-white transition-colors">Sign up</Link></li>
              <li><a href="mailto:hello@pitchmind.app" className="text-[14px] text-white/65 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-10">
          <div className="flex items-center gap-2 text-[12px] text-white/35">
            <span>© 2025 PitchMind</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5] animate-pulse" />
              All systems normal
            </span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: 'X', href: '#', d: 'M13.5 2L8.4 8.2 3 14h2.5l4.4-5.2L13.5 14H17L11.6 7.4 16.6 2H14L10.4 6.4 8.5 2h-5z' },
              { label: 'GitHub', href: '#', d: 'M10 1a9 9 0 0 0-2.8 17.5c.4.1.6-.2.6-.4v-1.6c-2.5.5-3-1.2-3-1.2-.4-1-1-1.3-1-1.3-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2-.2-4.1-1-4.1-4.5 0-1 .4-1.8 1-2.4-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1A9.3 9.3 0 0 1 10 4.8c.9 0 1.7.1 2.5.4 1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.6 1 1.4 1 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.9.6 1.8v2.7c0 .3.2.5.6.4A9 9 0 0 0 10 1z' },
              { label: 'LinkedIn', href: '#', d: 'M4 6.5h2.5V16H4V6.5zM5.2 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8.5 6.5H11v1.3h.05a2.7 2.7 0 0 1 2.4-1.3c2.6 0 3.05 1.7 3.05 3.9V16h-2.5v-4.6c0-1.1 0-2.5-1.5-2.5s-1.75 1.2-1.75 2.4V16H8.5V6.5z' },
            ].map(s => (
              <a key={s.label} href={s.href} aria-label={s.label} className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] hover:border-white/15 flex items-center justify-center transition-colors">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-white/55">
                  <path d={s.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
