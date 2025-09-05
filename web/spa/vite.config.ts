import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Build the new SPA to web/site and serve at '/'
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/',
  server: {
    proxy: {
      '/convert': 'http://localhost:8000',
      '/organize': 'http://localhost:8000',
      '/ocr': 'http://localhost:8000',
      '/format': 'http://localhost:8000',
      '/files': 'http://localhost:8000',
      '/metadata': 'http://localhost:8000',
      '/forms': 'http://localhost:8000',
      '/redact': 'http://localhost:8000',
      '/compliance': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/healthz': 'http://localhost:8000',
    }
  },
  build: {
    outDir: resolve(__dirname, '../site'),
    emptyOutDir: true
  }
})
