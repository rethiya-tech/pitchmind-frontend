/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        pm: {
          app: '#F4FCF8',
          surface: '#FFFFFF',
          teal: '#0F6E56',
          'teal-hover': '#0A5A45',
          'teal-light': '#E6F2EF',
          'teal-gradient-end': '#0A9B6E',
          gold: '#C9930A',
          'gold-hover': '#A87808',
          'gold-light': '#FFF8E3',
          'gold-end': '#E8B84A',
          sidebar: '#0C1421',
          'sidebar-mid': '#0F1B2E',
          border: '#E5E7EB',
          danger: '#DC2626',
          warning: '#D97706',
          success: '#059669',
          glow: 'rgba(15,110,86,0.15)',
        },
      },
      textColor: {
        'pm-primary': '#1A1A1A',
        'pm-muted': '#6B7280',
        'pm-teal': '#0F6E56',
        'pm-gold': '#C9930A',
        'pm-danger': '#DC2626',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 36px rgba(15,110,86,0.14), 0 4px 12px rgba(0,0,0,0.06)',
        'gold': '0 4px 20px rgba(201,147,10,0.32), 0 1px 4px rgba(0,0,0,0.10)',
        'gold-glow': '0 0 0 3px rgba(201,147,10,0.22)',
        'glow-sm': '0 0 0 3px rgba(15,110,86,0.15)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.20)',
        'premium': '0 20px 48px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)',
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
