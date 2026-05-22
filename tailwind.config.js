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
          app: '#F7F8F6',
          surface: '#FFFFFF',
          teal: '#0F6E56',
          'teal-hover': '#0A5A45',
          'teal-light': '#E6F2EF',
          'teal-gradient-end': '#0A9B6E',
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
        'pm-danger': '#DC2626',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(15,110,86,0.12), 0 2px 8px rgba(0,0,0,0.05)',
        'glow-sm': '0 0 0 3px rgba(15,110,86,0.15)',
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
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
      },
    },
  },
  plugins: [],
}
