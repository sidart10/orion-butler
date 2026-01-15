/**
 * Vitest Global Setup
 *
 * Runs before all tests - configure global test environment
 */

import { beforeAll, afterAll, afterEach } from 'vitest';

// Environment defaults
process.env.TEST_ENV = process.env.TEST_ENV || 'test';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  // Global setup (e.g., database connections, mock servers)
  console.log('[Test Setup] Initializing test environment');
});

afterAll(async () => {
  // Global teardown
  console.log('[Test Setup] Cleaning up test environment');
});

afterEach(() => {
  // Reset mocks between tests
  // vi.clearAllMocks(); // Uncomment when using mocks
});
