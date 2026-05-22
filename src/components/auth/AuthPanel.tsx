function LogoIcon() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 flex-shrink-0">
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

const STEPS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'Upload',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2 5.5 6 .8-4.5 4.2 1.2 6L10 15.5l-4.7 3 1.2-6L2 8.3l6-.8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
    label: 'Outline',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 13l6 4 6-4M4 9l6 4 6-4M4 5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Export',
  },
]

export function AuthPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0C1421 0%, #0F2D22 40%, #0C3520 100%)' }}
    >
      {/* Background decorative orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,110,86,0.25) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,147,10,0.15) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <LogoIcon />
        <div>
          <span className="text-lg font-extrabold tracking-tight leading-none">PitchMind</span>
          <p className="text-[10px] font-medium text-white/50 leading-none mt-0.5 tracking-widest uppercase">AI · Phase 1</p>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ color: '#E8B84A' }}>
            Phase 1 · Document → Deck
          </p>
          <h2 className="text-3xl font-extrabold leading-[1.15] tracking-tight">
            From a single doc to a<br />polished pitch —<br />in minutes.
          </h2>
          <p className="text-sm text-white/65 leading-relaxed max-w-xs">
            Upload, structure with AI, edit visually, export to .pptx or PDF.
            The full Phase 1 workflow lives inside your dashboard.
          </p>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-3 gap-3">
          {STEPS.map((step) => (
            <div
              key={step.label}
              className="relative rounded-xl px-3 py-4 flex flex-col items-center gap-2 text-white/85 hover:text-white transition-colors overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(201,147,10,0.4), transparent)' }} />
              {step.icon}
              <span className="text-xs font-semibold">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {['#5DCAA5', '#C8850A', '#1D9E75'].map((c, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-[#0F6E56] flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: c }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <p className="text-xs text-white/60">
          Trusted by <span className="text-white font-semibold">4,200+</span> founders &amp; sales teams
        </p>
      </div>
    </div>
  )
}
