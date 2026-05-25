/** @type {import('tailwindcss').Config} */
// Helper for the RGB-triplet pattern (Tailwind alpha-modifier support)
const rgb = (v) => `rgb(var(${v}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        pm: {
          app: rgb('--pm-app'),
          surface: rgb('--pm-surface'),
          'surface-2': rgb('--pm-surface-2'),
          'surface-3': rgb('--pm-surface-3'),
          teal: rgb('--pm-teal'),
          'teal-hover': rgb('--pm-teal-hover'),
          'teal-light': 'var(--pm-teal-light)',
          'teal-gradient-end': rgb('--pm-teal-gradient-end'),
          gold: rgb('--pm-gold'),
          'gold-hover': rgb('--pm-gold-hover'),
          'gold-light': 'var(--pm-gold-light)',
          'gold-end': rgb('--pm-gold-end'),
          sidebar: rgb('--pm-sidebar'),
          'sidebar-mid': rgb('--pm-sidebar-mid'),
          border: 'var(--pm-border)',
          'border-strong': 'var(--pm-border-strong)',
          danger: rgb('--pm-danger'),
          warning: rgb('--pm-warning'),
          success: rgb('--pm-success'),
          glow: 'var(--pm-glow)',
        },
      },
      textColor: {
        'pm-primary': rgb('--pm-text-primary'),
        'pm-muted': rgb('--pm-text-muted'),
        'pm-subtle': rgb('--pm-text-subtle'),
        'pm-teal': rgb('--pm-teal'),
        'pm-gold': rgb('--pm-gold'),
        'pm-danger': rgb('--pm-danger'),
      },
      backgroundColor: {
        'pm-primary': rgb('--pm-text-primary'),
        'pm-muted': rgb('--pm-text-muted'),
        'pm-subtle': rgb('--pm-text-subtle'),
      },
      borderColor: {
        'pm-primary': rgb('--pm-text-primary'),
        'pm-muted': rgb('--pm-text-muted'),
        'pm-subtle': rgb('--pm-text-subtle'),
      },
      boxShadow: {
        'card': 'var(--pm-shadow-card)',
        'card-hover': 'var(--pm-shadow-card-hover)',
        'gold': '0 4px 20px rgba(201,147,10,0.32), 0 1px 4px rgba(0,0,0,0.10)',
        'gold-glow': '0 0 0 3px rgba(201,147,10,0.22)',
        'glow-sm': '0 0 0 3px rgba(15,110,86,0.15)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.20)',
        'premium': 'var(--pm-shadow-premium)',
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(15,110,86,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(15,110,86,0.22)' },
        },
      },
    },
  },
  plugins: [],
}
