import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Сайт раздаётся из корня кастомного домена data-slice.ru → base '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
