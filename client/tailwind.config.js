/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      // 1. Mobile First: Base styles (< 480px) are default without prefix
      // 2. Large Mobile:
      'xs': '480px',
      'mobile-lg': '480px',

      // 3. Small Tablet / Phablet:
      'sm': '640px',

      // 4. Tablet:
      'md': '768px',
      'tablet': '768px',

      // 5. Laptop:
      'lg': '1024px',
      'laptop': '1024px',

      // 6. Computer / Standard Desktop:
      'xl': '1280px',
      'desktop': '1280px',

      // 7. Larger Device / Ultra-wide:
      '2xl': '1536px',
      'large-screen': '1536px',
    },
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a3b8fc',
          400: '#718efa',
          500: '#4f6bf5',
          600: '#384ee6',
          700: '#2b3bc9',
          800: '#2632a2',
          900: '#242e80',
          950: '#151a4f',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
