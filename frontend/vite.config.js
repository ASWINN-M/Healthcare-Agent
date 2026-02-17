import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/signup': 'http://localhost:8000',
      '/login': 'http://localhost:8000',
      '/profile': 'http://localhost:8000',
      '/analyze': 'http://localhost:8000',
      '/doctors': 'http://localhost:8000',
      '/chat': 'http://localhost:8000',
    },
  },
})
