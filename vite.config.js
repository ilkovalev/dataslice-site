import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base — подпапка проекта на GitHub Pages (https://<user>.github.io/dataslice-site/).
// В dev-режиме base игнорируется, сайт всё равно открывается на localhost:5173/.
export default defineConfig({
  base: '/dataslice-site/',
  plugins: [react()],
})
