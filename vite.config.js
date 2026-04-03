import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ Base path (important for render)
  base: "/",

  // ✅ Dev server only (works locally)
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://newchatapp-ca5m.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://newchatapp-ca5m.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  // ✅ Production build
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})