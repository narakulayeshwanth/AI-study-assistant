/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c10',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        brand: {
          cyan:   '#06b6d4',
          pink:   '#ec4899',
          amber:  '#f59e0b',
          emerald:'#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':        'float 6s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'flip':         'flip 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:      { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        flip:         { '0%': { transform: 'rotateY(0)' }, '100%': { transform: 'rotateY(180deg)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(249,115,22,0.4)',
        'glow-accent':  '0 0 30px rgba(245,158,11,0.35)',
        'glass':        '0 8px 32px rgba(0,0,0,0.3)',
        'card':         '0 4px 24px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
