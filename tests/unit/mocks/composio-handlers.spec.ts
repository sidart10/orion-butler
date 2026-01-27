/**
 * Composio Mock Handler Tests - Epic 0 Story 0.1
 *
 * Tests that verify Composio mock handlers work correctly
 * and intercept requests as expected.
 *
 * Test IDs: CH-001 through CH-008
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import {
  composioHandlers,
  gmailHandlers,
  calendarHandlers,
  mockEmails,
  mockCalendarEvents,
} from '../../fixtures/mocks/composio';

const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v2';

describe('Composio Mock Handlers', () => {
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

  describe('Gmail Handlers', () => {
    it('CH-001: GMAIL_GET_EMAILS returns mock emails', async () => {
      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.successful).toBe(true);
      expect(data.data.response_data.emails).toHaveLength(mockEmails.inbox.length);
      expect(data.data.response_data.emails[0].id).toBe('email-001');
    });

    it('CH-002: GMAIL_SEND_EMAIL returns sent confirmation', async () => {
      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/GMAIL_SEND_EMAIL/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'recipient@example.com',
            subject: 'Test Email',
            body: 'Hello from tests',
          }),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.successful).toBe(true);
      expect(data.data.response_data.status).toBe('sent');
      expect(data.data.response_data.to).toBe('recipient@example.com');
    });

    it('CH-003: GMAIL_SEARCH filters emails by query', async () => {
      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/GMAIL_SEARCH/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'meeting' }),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.successful).toBe(true);
      // Should find the email with "Meeting Tomorrow" subject
      expect(data.data.response_data.emails.length).toBeGreaterThan(0);
      expect(
        data.data.response_data.emails.some((e: { subject: string }) =>
          e.subject.toLowerCase().includes('meeting')
        )
      ).toBe(true);
    });
  });

  describe('Calendar Handlers', () => {
    it('CH-004: CALENDAR_LIST_EVENTS returns mock events', async () => {
      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.successful).toBe(true);
      expect(data.data.response_data.items).toHaveLength(
        mockCalendarEvents.upcoming.length
      );
      expect(data.data.response_data.items[0].summary).toBe('Team Standup');
    });

    it('CH-005: CALENDAR_CREATE_EVENT returns created event', async () => {
      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/CALENDAR_CREATE_EVENT/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: 'New Meeting',
            start: { dateTime: '2026-01-25T10:00:00Z' },
            end: { dateTime: '2026-01-25T11:00:00Z' },
            attendees: [{ email: 'guest@example.com' }],
          }),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.successful).toBe(true);
      expect(data.data.response_data.summary).toBe('New Meeting');
      expect(data.data.response_data.status).toBe('confirmed');
    });

    it('CH-006: CALENDAR_LIST_EVENTS filters by time range', async () => {
      // Request events after a specific time
      const timeMin = '2026-01-24T11:00:00Z';

      const response = await fetch(
        `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeMin }),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.successful).toBe(true);
      // Should only return events after 11:00 (Lunch and Product Review)
      expect(data.data.response_data.items.length).toBe(2);
    });
  });

  describe('Handler Configuration', () => {
    it('CH-007: gmailHandlers array contains 3 handlers', () => {
      expect(gmailHandlers).toHaveLength(3);
    });

    it('CH-008: calendarHandlers array contains 2 handlers', () => {
      expect(calendarHandlers).toHaveLength(2);
    });
  });
});
