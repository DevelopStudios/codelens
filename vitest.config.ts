import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // Aliases must live at the top level so Vitest's module resolver picks them
  // up. They are ignored when nested under `test.resolve`.
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/': resolve(__dirname, 'src/')
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'clover']
    },
    setupFiles: ['src/__tests__/setup.ts'],
    globals: true
  }
})