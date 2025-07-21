import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Ensures files in public/ are copied to dist/
  build: {
    rollupOptions: {
      // Ensure _redirects file is copied to dist
      external: [],
    }
  }
})
