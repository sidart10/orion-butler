import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],

    // Environment
    environment: 'node',

    // Globals (describe, it, expect without imports)
    globals: true,

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-results/coverage',
      include: ['src/**/*.ts', 'orion/**/*.ts'],
      exclude: ['**/*.d.ts', '**/*.test.ts', '**/node_modules/**'],
    },

    // Reporter
    reporters: ['verbose'],

    // Setup files
    setupFiles: ['./tests/support/fixtures/setup.ts'],

    // Type checking
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@orion': path.resolve(__dirname, './orion'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
