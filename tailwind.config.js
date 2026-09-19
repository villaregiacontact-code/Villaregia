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
        ink: {
          DEFAULT: '#1A1615',
          soft: '#443E3B',
        },
        paper: {
          DEFAULT: '#FAF8F3',
        },
        sand: {
          DEFAULT: '#EFE8D8',
          deep: '#E1D6BC',
        },
        clay: {
          DEFAULT: '#B15A3C',
        },
        olive: {
          DEFAULT: '#6E7A52',
        },
        brass: {
          DEFAULT: '#B8912E',
        },
        line: 'rgba(26, 22, 21, 0.14)',
        brand: {
          navy: {
            DEFAULT: '#1A1615',
            dark: '#120F0E',
            light: '#443E3B',
            muted: '#443E3B',
          },
          gold: {
            DEFAULT: '#B8912E',
            light: '#E6C575',
            dark: '#A37F39',
            champagne: '#EFE8D8',
            glow: 'rgba(184, 145, 46, 0.25)',
          },
          travertine: {
            DEFAULT: '#FAF8F3',
            soft: '#EFE8D8',
            dark: '#E1D6BC',
          },
          sand: '#EFE8D8',
          charcoal: '#1A1615',
          clay: '#B15A3C',
          olive: '#6E7A52',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'IBM Plex Sans', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        'arch': '400px 400px 12px 12px',
        'xs': '2px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E6C575 0%, #B8912E 50%, #A37F39 100%)',
        'navy-gradient': 'linear-gradient(180deg, #132339 0%, #0B1523 100%)',
        'radial-glow': 'radial-gradient(circle at center, rgba(184, 145, 46, 0.15) 0%, transparent 70%)',
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
