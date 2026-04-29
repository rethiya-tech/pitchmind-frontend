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
          border: '#E5E7EB',
          danger: '#DC2626',
          warning: '#D97706',
          success: '#059669',
        },
      },
      textColor: {
        'pm-primary': '#1A1A1A',
        'pm-muted': '#6B7280',
        'pm-teal': '#0F6E56',
        'pm-danger': '#DC2626',
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
