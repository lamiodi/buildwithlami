import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// In dev, the Vite proxy defaults to the in-memory mock server on :4001 so the
// admin pages can be explored without a real Postgres. Set VITE_API_PROXY to
// override (e.g. 'http://localhost:4000' to hit the real backend).
const API_TARGET = process.env.VITE_API_PROXY || 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
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
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router') || (id.includes('/react/') && !id.includes('@radix-ui') && !id.includes('lucide-react'))) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('matter-js')) {
              return 'vendor-physics';
            }
            if (id.includes('@radix-ui') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('sonner') || id.includes('dompurify') || id.includes('class-variance-authority')) {
              return 'vendor-ui';
            }
            return 'vendor-misc';
          }
        }
      }
    }
  }
})
