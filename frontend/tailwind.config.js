/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#161616',
        accent: '#F44A22',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Advent Pro"', 'sans-serif'],
        handwritten: ['"Caveat"', 'cursive'],
      },
    },
  },
  plugins: [],
}
