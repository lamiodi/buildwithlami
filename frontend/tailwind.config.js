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
        // fontFamily is ordered webfont-first so the browser uses
        // the Google Font as soon as it loads. The "Fallback" entry
        // (declared in index.css) controls metrics so the layout
        // doesn't shift when the webfont arrives.
        heading: ['"Space Grotesk"', '"Space Grotesk Fallback"', 'system-ui', 'sans-serif'],
        body: ['"Advent Pro"', '"Advent Pro Fallback"', 'system-ui', 'sans-serif'],
        handwritten: ['"Caveat"', 'cursive'],
      },
    },
  },
  plugins: [],
}
