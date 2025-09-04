import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Output built landing into ../home so FastAPI serves /ui/home/
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/ui/home/',
  build: {
    outDir: resolve(__dirname, '../home'),
    emptyOutDir: true
  }
})

