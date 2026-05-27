import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#how-it-works', label: 'Roadmap' },
  { href: '#faq', label: 'FAQ' },
]

function LogoIcon() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-pm-teal flex-shrink-0">
      <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function LandNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0B0F0D]/80 backdrop-blur-md border-b border-pm-border/60 dark:border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <LogoIcon />
          <span className="text-lg font-extrabold text-pm-teal dark:text-[#5DE5B8] tracking-tight">PitchMind</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-pm-primary dark:text-white/75 hover:text-pm-teal dark:hover:text-[#5DE5B8] transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-pm-primary dark:text-white/85 hover:text-pm-teal dark:hover:text-[#5DE5B8] transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#0B0F0D] dark:hover:bg-white/90 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8m0 0L8 4m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 mb-1 bg-pm-primary dark:bg-white" />
          <span className="block w-5 h-0.5 mb-1 bg-pm-primary dark:bg-white" />
          <span className="block w-5 h-0.5 bg-pm-primary dark:bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B0F0D] border-b border-pm-border dark:border-white/[0.08] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="text-sm font-medium text-pm-primary dark:text-white/80" onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <Link to="/login" className="text-sm font-medium text-pm-primary dark:text-white/80" onClick={() => setMenuOpen(false)}>Sign in</Link>
          <Link to="/register" className="bg-pm-teal text-white text-sm font-bold px-4 py-2.5 rounded-full text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
      )}
    </header>
  )
}
