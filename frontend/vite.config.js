import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5500,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/clips': { target: 'http://localhost:8000', changeOrigin: true },
      '/frames': { target: 'http://localhost:8000', changeOrigin: true },
      '/source_clips': { target: 'http://localhost:8000', changeOrigin: true }
    }
  }
})

