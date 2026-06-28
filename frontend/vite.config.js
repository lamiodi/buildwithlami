import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, the Vite proxy defaults to the in-memory mock server on :4001 so the
// admin pages can be explored without a real Postgres. Set VITE_API_PROXY to
// override (e.g. 'http://localhost:4000' to hit the real backend).
const API_TARGET = process.env.VITE_API_PROXY || 'http://localhost:4001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
