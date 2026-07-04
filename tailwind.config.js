/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Golos Text"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        ink: '#f3ebdd',
        panel: '#ffffff',
        accent: '#2ab8eb',
        cyanink: '#0a6c97', // тёмный акцент для текста/кнопок: ≥4.5:1 на бежевом (WCAG AA)
        brand: '#29abe2',
      },
    },
  },
  plugins: [],
}
