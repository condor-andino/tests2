import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' → rutas relativas: funciona en GitHub Pages (proyecto o usuario)
// y en cualquier host estático sin configuración extra.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 6000,
  },
})
