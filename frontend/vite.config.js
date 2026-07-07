import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend-api': {
        target: 'http://168.144.137.25:5000/api',
        // target: 'http://localhost:5001/api',  // ← đổi sang local
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend-api/, '')
      }
    }
  }
})
