/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      all: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/App.tsx',
        'src/pages/Analytics.tsx',
        'src/pages/Index.tsx',
        'src/features/analytics/components/**/*.tsx',
        'src/features/analytics/hooks/**/*.ts',
        'src/features/analytics/selectors/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.*',
        '**/*.d.ts',
        '**/*.config.*',
        'dev-dist/',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
