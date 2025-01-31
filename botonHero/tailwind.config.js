/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azulMove: '#010873',
        naranjaMove: '#F28705	',
      },
      borderWidth: {
        '1': '1px',
      },
    },
  },
  plugins: [],
}
