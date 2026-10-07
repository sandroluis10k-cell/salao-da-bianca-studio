/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#050505',
          blackSecondary: '#141414',
          pink: '#E88AA2',
          pinkLight: '#F4C2CD',
          roseGold: '#B76E79',
          white: '#FFFFFF',
          grayLight: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'tightest': '-0.03em',
        'tighter': '-0.02em',
        'wide-sm': '0.08em',
        'wide-md': '0.14em',
      },
      lineHeight: {
        'display': '1.1',
        'heading': '1.2',
        'relaxed-plus': '1.75',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, #E88AA2 0%, #B76E79 100%)',
        'gradient-rose-soft': 'linear-gradient(135deg, rgba(232,138,162,0.14) 0%, rgba(183,110,121,0.14) 100%)',
        'gradient-dark': 'linear-gradient(180deg, #050505 0%, #141414 100%)',
        'gradient-hero-bottom': 'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.45) 55%, rgba(5,5,5,0.92) 100%)',
      },
      boxShadow: {
        'rose': '0 10px 40px -10px rgba(232, 138, 162, 0.5)',
        'gold': '0 10px 40px -10px rgba(183, 110, 121, 0.5)',
        'soft-rose': '0 20px 60px -15px rgba(232, 138, 162, 0.35)',
        'soft-card': '0 8px 32px -18px rgba(0, 0, 0, 0.6)',
        'inner-rose': 'inset 0 1px 0 0 rgba(244, 194, 205, 0.1)',
        'glow-rose': '0 0 0 1px rgba(232, 138, 162, 0.15), 0 20px 60px -20px rgba(232, 138, 162, 0.55)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out both',
        'fade-in-up': 'fadeInUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-up-slow': 'fadeInUp 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
        'fade-in-down': 'fadeInDown 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow': 'pulseGlow 2.6s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
        'bounce-soft': 'bounceSoft 2.4s ease-in-out infinite',
        'reveal-up': 'revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 28px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translate3d(0, -20px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(244, 194, 205, 0.35)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 0 12px rgba(244, 194, 205, 0)',
            transform: 'scale(1.03)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, 10px, 0)' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 40px, 0) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
