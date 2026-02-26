import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@gitdash/api': path.resolve(__dirname, '../../packages/api/src'),
      '@gitdash/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@gitdash/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
  },
})