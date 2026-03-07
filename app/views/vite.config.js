import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',   // relative to root (views/), so output → views/dist
  },
  server: {
    proxy: {
      '/api/': 'http://localhost:3000',
    },
  },
})
