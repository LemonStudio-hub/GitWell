import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@gitdash/api': path.resolve(__dirname, '../../packages/api/src'),
    },
  },
})