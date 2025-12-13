import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { serveAssetsPlugin } from './vite-plugin-serve-assets'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serveAssetsPlugin()],
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp'],
  server: {
    fs: {
      strict: false,
    },
    middlewareMode: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets'),
    },
  },
  optimizeDeps: {
    exclude: [],
  },
})
