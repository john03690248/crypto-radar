/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a10',
          900: '#0c1017',
          850: '#111722',
          800: '#172030',
          750: '#1f2b3f',
          700: '#27354d',
        },
        cmc: {
          green: '#16c784',
          red: '#ea3943',
          blue: '#3861fb',
          gold: '#f5ac37',
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
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
};
