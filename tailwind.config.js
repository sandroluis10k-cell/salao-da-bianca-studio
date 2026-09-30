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
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, #E88AA2 0%, #B76E79 100%)',
        'gradient-dark': 'linear-gradient(180deg, #050505 0%, #141414 100%)',
      },
      boxShadow: {
        'rose': '0 10px 40px -10px rgba(232, 138, 162, 0.5)',
        'gold': '0 10px 40px -10px rgba(183, 110, 121, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
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
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
