/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f3ebdd',
        panel: '#ffffff',
        accent: '#2ab8eb',
        cyanink: '#0d7fb0',
        brand: '#29abe2',
      },
    },
  },
  plugins: [],
}
