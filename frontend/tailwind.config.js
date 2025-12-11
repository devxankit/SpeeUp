/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFC94A',
          dark: '#FFB020',
        },
        cream: '#FFF7E0',
      },
    },
  },
  plugins: [],
}

