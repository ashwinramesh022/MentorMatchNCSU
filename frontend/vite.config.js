import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Use 127.0.0.1 instead of localhost to avoid macOS AirPlay
        // hijacking port 5000 and returning 403 responses.
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  }
})


