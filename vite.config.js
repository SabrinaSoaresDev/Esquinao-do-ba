// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    port: 3000,
  },
   build: {
    minify: false, // Desabilita minificação para debug
    // ou
    cssMinify: false // Só desabilita minificação de CSS
  }
})