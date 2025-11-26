/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: 'rgb(255, 165, 0)',
          50: 'rgba(255, 165, 0, 0.05)',
          100: 'rgba(255, 165, 0, 0.1)',
          500: 'rgb(255, 165, 0)',
          600: 'rgb(230, 148, 0)',
          700: 'rgb(204, 131, 0)',
        },
        purple: {
          DEFAULT: 'rgb(79, 6, 167)',
          50: 'rgba(79, 6, 167, 0.05)',
          100: 'rgba(79, 6, 167, 0.1)',
          500: 'rgb(79, 6, 167)',
          600: 'rgb(65, 5, 137)',
          700: 'rgb(51, 4, 107)',
        },
      },
      fontFamily: {
        host: ['Host Grotesk', 'sans-serif'],
        georgian: ['Noto Sans Georgian Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
