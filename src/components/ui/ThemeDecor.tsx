import type { Theme } from '@/types'

const DECOR_BY_CAT: Record<string, string[]> = {
  professional: ['rings', 'diagonal', 'arch', 'orbs', 'grid', 'corner', 'rings', 'diagonal', 'arch', 'orbs'],
  creative:     ['orbs', 'wave', 'diagonal', 'arch', 'rings', 'wave', 'orbs', 'grid', 'diagonal', 'arch'],
  minimal:      ['corner', 'arch', 'grid', 'rings', 'corner', 'arch', 'grid', 'rings', 'corner', 'arch'],
}

function resolveDecor(theme: Theme): string {
  if (theme.decor) return theme.decor
  const h = theme.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pool = DECOR_BY_CAT[theme.category] ?? DECOR_BY_CAT.professional
  return pool[h % pool.length]
}

export function ThemeDecorSVG({ theme, opacity = 1 }: { theme: Theme; opacity?: number }) {
  const decor = resolveDecor(theme)
  const a = theme.accent
  const o = (v: number) => String(+(v * opacity).toFixed(3))
  const pid = `td-${theme.id}`
  const cls = 'absolute inset-0 w-full h-full pointer-events-none select-none'

  switch (decor) {
    case 'rings':
      return (
        <svg viewBox="0 0 100 56" className={cls} preserveAspectRatio="none">
          <circle cx="92" cy="-4" r="26" fill="none" stroke={a} strokeWidth="0.6"  strokeOpacity={o(0.38)}/>
          <circle cx="92" cy="-4" r="40" fill="none" stroke={a} strokeWidth="0.45" strokeOpacity={o(0.24)}/>
          <circle cx="92" cy="-4" r="55" fill="none" stroke={a} strokeWidth="0.3"  strokeOpacity={o(0.14)}/>
          <circle cx="-6"  cy="60" r="20" fill="none" stroke={a} strokeWidth="0.4"  strokeOpacity={o(0.18)}/>
        </svg>
      )
    case 'diagonal':
      return (
        <svg viewBox="0 0 100 56" className={cls} preserveAspectRatio="none">
          <polygon points="70,0 100,0 100,56 87,56" fill={a} fillOpacity={o(0.17)}/>
          <polygon points="77,0 83,0 100,42 100,36" fill={a} fillOpacity={o(0.1)}/>
        </svg>
      )
    case 'orbs':
      return (
        <svg viewBox="0 0 100 56" className={cls} preserveAspectRatio="none">
          <circle cx="90" cy="-7" r="34" fill={a} fillOpacity={o(0.13)}/>
          <circle cx="-7" cy="63" r="27" fill={a} fillOpacity={o(0.09)}/>
        </svg>
      )
    case 'arch':
      return (
        <svg viewBox="0 0 100 56" className={cls} preserveAspectRatio="none">
          <path d="M100,56 Q50,-20 0,28"  fill="none" stroke={a} strokeWidth="0.75" strokeOpacity={o(0.33)}/>
          <path d="M100,56 Q58,-12 0,38"  fill="none" stroke={a} strokeWidth="0.52" strokeOpacity={o(0.21)}/>
          <path d="M100,56 Q42,-28 0,18"  fill="none" stroke={a} strokeWidth="0.38" strokeOpacity={o(0.14)}/>
        </svg>
      )
    case 'wave':
      return (
        <svg viewBox="0 0 100 56" className={cls} preserveAspectRatio="none">
          <path d="M0,42 C22,36 40,48 56,40 C72,32 86,44 100,37 L100,56 L0,56Z" fill={a} fillOpacity={o(0.15)}/>
          <path d="M0,47 C18,42 38,52 57,45 C76,38 88,49 100,43 L100,56 L0,56Z" fill={a} fillOpacity={o(0.10)}/>
        </svg>
      )
    case 'corner':
      return (
        <svg viewBox="0 0 100 56" className={cls} preserveAspectRatio="none">
          <polyline points="2,13 2,2 13,2"   fill="none" stroke={a} strokeWidth="0.9" strokeOpacity={o(0.58)} strokeLinecap="round"/>
          <polyline points="87,54 98,54 98,43" fill="none" stroke={a} strokeWidth="0.9" strokeOpacity={o(0.58)} strokeLinecap="round"/>
        </svg>
      )
    case 'grid':
      return (
        <svg viewBox="0 0 100 56" className={cls} preserveAspectRatio="none">
          <defs>
            <pattern id={pid} x="0" y="0" width="9" height="7" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="0.65" fill={a} fillOpacity={o(0.26)}/>
            </pattern>
          </defs>
          <rect width="100" height="56" fill={`url(#${pid})`}/>
        </svg>
      )
    default:
      return null
  }
}
