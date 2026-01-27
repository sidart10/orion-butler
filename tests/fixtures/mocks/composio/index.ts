/**
 * Composio Mock Handlers Index
 *
 * Central export for all Composio MCP mock handlers.
 * Use these handlers with MSW to test Composio integrations
 * without making actual network calls.
 *
 * Usage:
 * ```typescript
 * import { composioHandlers } from 'tests/fixtures/mocks/composio';
 * import { setupServer } from 'msw/node';
 *
 * const server = setupServer(...composioHandlers);
 * ```
 *
 * For error testing:
 * ```typescript
 * import { gmailErrorHandlers } from 'tests/fixtures/mocks/composio';
 *
 * it('handles rate limit', () => {
 *   server.use(gmailErrorHandlers.rateLimitError);
 *   // Test error handling...
 * });
 * ```
 */

// Types and constants
export {
  COMPOSIO_API_BASE,
  type ComposioResponse,
  type ComposioError,
  type MockEmail,
  type MockCalendarEvent,
  createRateLimitError,
  createAuthError,
  createNotFoundError,
  createApiError,
} from './types';

// Gmail handlers
export {
  gmailHandlers,
  gmailErrorHandlers,
  mockEmails,
  mockSentEmailResponse,
} from './gmail-handlers';

// Calendar handlers
export {
  calendarHandlers,
  calendarErrorHandlers,
  mockCalendarEvents,
  mockCreatedEventResponse,
} from './calendar-handlers';

// Combined handlers for convenience
import { gmailHandlers } from './gmail-handlers';
import { calendarHandlers } from './calendar-handlers';

/**
 * All Composio mock handlers combined (success scenarios only).
 * Use this when you need to mock all Composio tools.
 */
export const composioHandlers = [...gmailHandlers, ...calendarHandlers];
