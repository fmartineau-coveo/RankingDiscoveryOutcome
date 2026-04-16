import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0B1A',
          900: '#11132A',
          800: '#1C1F3D',
          700: '#2A2E55',
          600: '#4B5079',
          500: '#6B7099',
          400: '#9096B8',
          300: '#BAC0DA',
          200: '#DDE1EF',
          100: '#EEF0F8',
          50: '#F7F8FC',
        },
        blue: {
          50: '#EEF3FF',
          100: '#DCE6FF',
          200: '#B8CEFF',
          300: '#8BAEFF',
          400: '#5E8AFF',
          500: '#3B68F4',
          600: '#2A4FD8',
          700: '#213CAA',
          800: '#182C80',
          900: '#101E5A',
        },
        purple: {
          50: '#F5EEFF',
          100: '#EADBFF',
          200: '#D6B8FF',
          300: '#BB8EFF',
          400: '#9E63F5',
          500: '#7D3EE0',
          600: '#6328C0',
          700: '#4D1C99',
          800: '#371470',
          900: '#230B4A',
        },
        rose: {
          500: '#E64778',
          400: '#F06A95',
        },
        amber: {
          500: '#E8A73C',
          400: '#F2BE5C',
        },
        teal: {
          500: '#14B8A6',
          400: '#2DD4BF',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17, 19, 42, 0.04), 0 2px 8px rgba(17, 19, 42, 0.04)',
        card: '0 4px 14px rgba(17, 19, 42, 0.06), 0 1px 2px rgba(17, 19, 42, 0.04)',
        lift: '0 20px 40px -12px rgba(24, 44, 128, 0.18), 0 8px 16px -8px rgba(24, 44, 128, 0.12)',
        glow: '0 0 0 1px rgba(125, 62, 224, 0.2), 0 10px 40px -10px rgba(125, 62, 224, 0.35)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(ellipse at top, rgba(125, 62, 224, 0.08), transparent 60%), radial-gradient(ellipse at bottom left, rgba(59, 104, 244, 0.08), transparent 55%)',
        'hero':
          'linear-gradient(135deg, #F5EEFF 0%, #EEF3FF 45%, #F7F8FC 100%)',
        'mesh':
          'radial-gradient(1000px 600px at 0% 0%, rgba(125,62,224,0.12), transparent 60%), radial-gradient(1000px 600px at 100% 0%, rgba(59,104,244,0.12), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(125,62,224,0.08), transparent 60%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s infinite linear',
        'float-in': 'float-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
