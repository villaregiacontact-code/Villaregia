/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            DEFAULT: '#0A1120',
            dark: '#050912',
            light: '#131E35',
            muted: '#1E2D4A',
          },
          gold: {
            DEFAULT: '#C5A059',
            light: '#E6C575',
            dark: '#A37F39',
            champagne: '#F4E8C1',
            glow: 'rgba(197, 160, 89, 0.25)',
          },
          travertine: {
            DEFAULT: '#FAF8F5',
            soft: '#F3EFE9',
            dark: '#E4DDD2',
          },
          sand: '#EBE5D9',
          charcoal: '#1A212D',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Cinzel', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Manrope', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E6C575 0%, #C5A059 50%, #A37F39 100%)',
        'navy-gradient': 'linear-gradient(180deg, #0A1120 0%, #050912 100%)',
        'radial-glow': 'radial-gradient(circle at center, rgba(197, 160, 89, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slow-zoom': 'slowZoom 20s ease infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
}
