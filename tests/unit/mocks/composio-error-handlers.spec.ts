/**
 * Composio Error Handler Tests - Epic 0 Story 0.1
 *
 * Tests that verify error mock handlers work correctly
 * for testing error scenarios.
 *
 * Test IDs: EH-001 through EH-006
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import {
  composioHandlers,
  gmailErrorHandlers,
  calendarErrorHandlers,
  COMPOSIO_API_BASE,
} from '../../fixtures/mocks/composio';

describe('Composio Error Handlers', () => {
  const server = setupServer(...composioHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Gmail Error Handlers', () => {
    it('EH-001: gmailErrorHandlers.rateLimitError returns 429', async () => {
      // Override with rate limit handler
      server.use(gmailErrorHandlers.rateLimitError);

      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.successful).toBe(false);
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('EH-002: gmailErrorHandlers.authError returns 401', async () => {
      // Override with auth error handler
      server.use(gmailErrorHandlers.authError);

      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.successful).toBe(false);
      expect(data.error.code).toBe('AUTHENTICATION_FAILED');
    });

    it('EH-003: gmailErrorHandlers.networkError simulates network failure', async () => {
      // Override with network error handler
      server.use(gmailErrorHandlers.networkError);

      await expect(
        fetch(`${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      ).rejects.toThrow();
    });
  });

  describe('Calendar Error Handlers', () => {
    it('EH-004: calendarErrorHandlers.rateLimitError returns 429', async () => {
      // Override with rate limit handler
      server.use(calendarErrorHandlers.rateLimitError);

      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.successful).toBe(false);
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('EH-005: calendarErrorHandlers.authError returns 401', async () => {
      // Override with auth error handler
      server.use(calendarErrorHandlers.authError);

      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.successful).toBe(false);
      expect(data.error.code).toBe('AUTHENTICATION_FAILED');
    });

    it('EH-006: calendarErrorHandlers.networkError simulates network failure', async () => {
      // Override with network error handler
      server.use(calendarErrorHandlers.networkError);

      await expect(
        fetch(`${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      ).rejects.toThrow();
    });
  });

  describe('Handler Reset', () => {
    it('EH-007: handlers reset to success after afterEach', async () => {
      // First, override with error
      server.use(gmailErrorHandlers.authError);

      const errorResponse = await fetch(
        `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      expect(errorResponse.status).toBe(401);

      // Reset handlers (simulating afterEach)
      server.resetHandlers();

      // Now should get success response
      const successResponse = await fetch(
        `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      expect(successResponse.status).toBe(200);
      const data = await successResponse.json();
      expect(data.successful).toBe(true);
    });
  });
});
