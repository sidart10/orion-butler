/**
 * Calendar Mock Handlers for Composio MCP
 *
 * MSW handlers that intercept Composio API calls for Google Calendar operations.
 * These handlers return mock data without making actual network calls.
 *
 * Supported tools:
 * - CALENDAR_LIST_EVENTS
 * - CALENDAR_CREATE_EVENT
 *
 * Error handlers (for testing error scenarios):
 * - CALENDAR_LIST_EVENTS (rate limit)
 * - CALENDAR_LIST_EVENTS (auth error)
 */
import { http, HttpResponse } from 'msw';
import {
  COMPOSIO_API_BASE,
  type CalendarListEventsRequest,
  type CalendarCreateEventRequest,
  type MockCalendarEvent,
  type CreatedEventResponse,
  createRateLimitError,
  createAuthError,
} from './types';

/**
 * Mock calendar events for testing
 */
export const mockCalendarEvents: { upcoming: MockCalendarEvent[] } = {
  upcoming: [
    {
      id: 'event-001',
      summary: 'Team Standup',
      description: 'Daily standup meeting',
      start: {
        dateTime: '2026-01-24T09:00:00Z',
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: '2026-01-24T09:15:00Z',
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: 'alice@example.com', responseStatus: 'accepted' },
        { email: 'bob@example.com', responseStatus: 'tentative' },
      ],
      organizer: { email: 'user@example.com', self: true },
      status: 'confirmed',
    },
    {
      id: 'event-002',
      summary: 'Lunch with Omar',
      description: 'Discuss project timeline',
      start: {
        dateTime: '2026-01-24T12:00:00Z',
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: '2026-01-24T13:00:00Z',
        timeZone: 'America/Los_Angeles',
      },
      attendees: [{ email: 'omar@example.com', responseStatus: 'accepted' }],
      organizer: { email: 'user@example.com', self: true },
      status: 'confirmed',
    },
    {
      id: 'event-003',
      summary: 'Product Review',
      description: 'Weekly product review session',
      start: {
        dateTime: '2026-01-24T14:00:00Z',
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: '2026-01-24T15:00:00Z',
        timeZone: 'America/Los_Angeles',
      },
      attendees: [{ email: 'team@example.com', responseStatus: 'needsAction' }],
      organizer: { email: 'manager@example.com' },
      status: 'confirmed',
    },
  ],
};

/**
 * Mock created event response
 */
export const mockCreatedEventResponse: CreatedEventResponse = {
  id: 'event-new-001',
  status: 'confirmed',
  htmlLink: 'https://calendar.google.com/event?eid=xxx',
};

/**
 * Calendar mock handlers for Composio API (success scenarios)
 */
export const calendarHandlers = [
  /**
   * CALENDAR_LIST_EVENTS - List calendar events
   */
  http.post(
    `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
    async ({ request }) => {
      const body = (await request.json()) as CalendarListEventsRequest;
      const timeMin = body.timeMin;
      const timeMax = body.timeMax;

      let events = [...mockCalendarEvents.upcoming];

      // Filter by time range if provided
      if (timeMin) {
        const minDate = new Date(timeMin);
        events = events.filter((e) => new Date(e.start.dateTime) >= minDate);
      }
      if (timeMax) {
        const maxDate = new Date(timeMax);
        events = events.filter((e) => new Date(e.start.dateTime) <= maxDate);
      }

      return HttpResponse.json({
        successful: true,
        data: {
          response_data: {
            items: events,
            summary: 'Primary Calendar',
            timeZone: 'America/Los_Angeles',
          },
        },
        error: null,
      });
    }
  ),

  /**
   * CALENDAR_CREATE_EVENT - Create a new calendar event
   */
  http.post(
    `${COMPOSIO_API_BASE}/actions/CALENDAR_CREATE_EVENT/execute`,
    async ({ request }) => {
      const body = (await request.json()) as CalendarCreateEventRequest;

      return HttpResponse.json({
        successful: true,
        data: {
          response_data: {
            ...mockCreatedEventResponse,
            summary: body.summary,
            start: body.start,
            end: body.end,
            attendees: body.attendees || [],
          },
        },
        error: null,
      });
    }
  ),
];

/**
 * Calendar error handlers for testing error scenarios.
 * Use these by adding them with server.use() in specific tests.
 */
export const calendarErrorHandlers = {
  /**
   * Returns a rate limit error (429)
   */
  rateLimitError: http.post(
    `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
    () => {
      return HttpResponse.json(createRateLimitError(), { status: 429 });
    }
  ),

  /**
   * Returns an authentication error (401)
   */
  authError: http.post(
    `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
    () => {
      return HttpResponse.json(createAuthError(), { status: 401 });
    }
  ),

  /**
   * Simulates a network timeout
   */
  networkError: http.post(
    `${COMPOSIO_API_BASE}/actions/CALENDAR_LIST_EVENTS/execute`,
    () => {
      return HttpResponse.error();
    }
  ),
};
