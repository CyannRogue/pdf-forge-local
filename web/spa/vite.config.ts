import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Build the new SPA to web/site and serve at '/'
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/',
  build: {
    outDir: resolve(__dirname, '../site'),
    emptyOutDir: true
  }
})
