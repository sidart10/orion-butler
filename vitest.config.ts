import { defineConfig, defineProject } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

/**
 * Vitest Configuration for Orion Butler
 *
 * This configuration defines multiple test projects:
 * - unit: Standard unit tests
 * - integration: Integration tests
 * - xstate-tests: XState state machine model-based tests
 *
 * Run specific projects:
 * - npx vitest run --project=unit
 * - npx vitest run --project=xstate-tests
 *
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Global test settings
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/tests/**',
        '**/*.d.ts',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/*.config.*',
        '**/src-tauri/**',
      ],
    },

    // Project-specific configurations
    projects: [
      // Unit tests project
      {
        extends: true,
        test: {
          name: 'unit',
          root: '.',
          include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['tests/unit/**/*.xstate-test.ts'],
          environment: 'jsdom',
          setupFiles: ['./tests/setup.tsx'],
        },
      },

      // Integration tests project
      {
        extends: true,
        test: {
          name: 'integration',
          root: '.',
          include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['./tests/setup.tsx'],
        },
      },

      // XState model-based tests project
      {
        extends: true,
        test: {
          name: 'xstate-tests',
          root: '.',
          include: ['tests/**/*.xstate-test.ts'],
          environment: 'jsdom',
          setupFiles: ['./tests/setup.tsx'],
          testTimeout: 30000, // XState tests may need more time for path exploration
          hookTimeout: 10000,
        },
      },
    ],
  },
});
