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
          primary: '#0f7b6c',
          secondary: '#16a37b',
          light: '#e6f7f3',
        },
        surface: {
          dark: '#0f1117',
          card: '#ffffff',
          page: '#f4f6f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
