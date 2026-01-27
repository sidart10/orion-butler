/**
 * MSW Server Setup for Vitest (Node.js)
 *
 * This file configures MSW for use in Vitest unit and integration tests.
 * It provides a preconfigured server with all Composio mock handlers.
 *
 * Usage in tests:
 * ```typescript
 * import { server } from 'tests/fixtures/mocks/setup';
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 *
 * Or use the convenience lifecycle hooks:
 * ```typescript
 * import { setupMswServer } from 'tests/fixtures/mocks/setup';
 * setupMswServer();
 * ```
 */
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { composioHandlers } from './composio';

/**
 * MSW server instance with all Composio handlers pre-configured.
 *
 * The server is configured with `onUnhandledRequest: 'error'` in CI
 * to ensure no network leakage occurs during tests.
 */
export const server = setupServer(...composioHandlers);

/**
 * Determines if we're running in CI environment.
 * Handles various CI systems that set CI=true, CI=1, CI=TRUE, etc.
 */
function isRunningInCI(): boolean {
  const ci = process.env.CI;
  if (!ci) return false;
  return ci === '1' || ci.toLowerCase() === 'true';
}

/**
 * Request handling mode based on environment.
 * - CI: 'error' - Throw on unhandled requests to catch missing mocks
 * - Local: 'warn' - Log warnings to allow debugging
 */
type UnhandledRequestMode = 'error' | 'warn';

/**
 * Default MSW server options.
 * In CI, unhandled requests throw errors to catch missing mocks.
 * In local development, they warn to allow debugging.
 */
export const defaultServerOptions: { onUnhandledRequest: UnhandledRequestMode } = {
  onUnhandledRequest: isRunningInCI() ? 'error' : 'warn',
};

/**
 * Convenience function to setup MSW lifecycle hooks in a test file.
 *
 * Call this at the top level of your test file to automatically:
 * - Start the server before all tests
 * - Reset handlers after each test
 * - Close the server after all tests
 *
 * @example
 * ```typescript
 * import { setupMswServer } from 'tests/fixtures/mocks/setup';
 *
 * setupMswServer();
 *
 * describe('My Tests', () => {
 *   it('should work', () => { ... });
 * });
 * ```
 */
export function setupMswServer() {
  beforeAll(() => {
    server.listen(defaultServerOptions);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}

/**
 * Add additional handlers for a specific test.
 *
 * @example
 * ```typescript
 * import { addHandlers } from 'tests/fixtures/mocks/setup';
 * import { http, HttpResponse } from 'msw';
 *
 * it('should handle custom case', () => {
 *   addHandlers(
 *     http.post('/custom-endpoint', () => HttpResponse.json({ custom: true }))
 *   );
 *   // Test with custom handler...
 * });
 * ```
 */
export function addHandlers(...handlers: Parameters<typeof server.use>) {
  server.use(...handlers);
}

/**
 * Get the list of registered handlers.
 * Useful for debugging which handlers are active.
 */
export function getActiveHandlers() {
  return server.listHandlers();
}

/**
 * Check if currently running in CI environment.
 * Exposed for testing purposes.
 */
export { isRunningInCI };
