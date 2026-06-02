// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 1000
    // Remova manualChunks ou use função
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'swiper']
  }
})