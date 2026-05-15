/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#58CC02', dark: '#46a302' },
        blue:  { DEFAULT: '#1CB0F6', dark: '#0d8fc4' },
        navy:  { DEFAULT: '#1f4068' },
        gold:  { DEFAULT: '#FFD700' },
      },
    },
  },
  plugins: [],
}
