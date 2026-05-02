import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        marian: {
          bg:     '#050B1A',
          deep:   '#0D1A3A',
          navy:   '#1E3A8A',
          sky:    '#38BDF8',
          teal:   '#2DD4BF',
          purple: '#A78BFA',
          violet: '#7C3AED',
          pink:   '#FB7185',
          gold:   '#F59E0B',
          silver: '#94A3B8',
          ivory:  '#E2F0FF',
          glow:   '#38BDF8',
        },
      },
      fontFamily: {
        rounded:  ['var(--font-rounded)', 'system-ui', 'sans-serif'],
        anek:     ['var(--font-anek)', 'sans-serif'],
        cinzel:   ['var(--font-cinzel)', 'serif'],
        display:  ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
