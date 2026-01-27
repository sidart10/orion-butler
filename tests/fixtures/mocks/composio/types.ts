/**
 * Composio Mock Types and Constants
 *
 * Shared TypeScript interfaces and constants for Composio MCP mock handlers.
 * Ensures type safety and consistency across all mock handlers.
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Base URL for Composio API.
 * All mock handlers should use this constant instead of hardcoding.
 */
export const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v2';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Gmail GET_EMAILS request body
 */
export interface GmailGetEmailsRequest {
  maxResults?: number;
  labelIds?: string[];
  query?: string;
}

/**
 * Gmail SEND_EMAIL request body
 */
export interface GmailSendEmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Gmail SEARCH request body
 */
export interface GmailSearchRequest {
  query: string;
  maxResults?: number;
}

/**
 * Calendar LIST_EVENTS request body
 */
export interface CalendarListEventsRequest {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}

/**
 * Calendar CREATE_EVENT request body
 */
export interface CalendarCreateEventRequest {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string }>;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Standard Composio API response wrapper
 */
export interface ComposioResponse<T> {
  successful: boolean;
  data: {
    response_data: T;
  } | null;
  error: ComposioError | null;
}

/**
 * Composio API error structure
 */
export interface ComposioError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Email object structure
 */
export interface MockEmail {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  date: string;
  labels: string[];
}

/**
 * Calendar event structure
 */
export interface MockCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus?: string;
  }>;
  organizer?: {
    email: string;
    self?: boolean;
  };
  status: string;
}

/**
 * Sent email response
 */
export interface SentEmailResponse {
  id: string;
  threadId: string;
  labelIds: string[];
  status: string;
  to?: string | string[];
  subject?: string;
}

/**
 * Created event response
 */
export interface CreatedEventResponse {
  id: string;
  status: string;
  htmlLink: string;
  summary?: string;
  start?: { dateTime: string };
  end?: { dateTime: string };
  attendees?: Array<{ email: string }>;
}

// ============================================================================
// Error Response Helpers
// ============================================================================

/**
 * Create a rate limit error response
 */
export function createRateLimitError(): ComposioResponse<null> {
  return {
    successful: false,
    data: null,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please retry after some time.',
      details: { retryAfter: 60 },
    },
  };
}

/**
 * Create an authentication error response
 */
export function createAuthError(): ComposioResponse<null> {
  return {
    successful: false,
    data: null,
    error: {
      code: 'AUTHENTICATION_FAILED',
      message: 'Invalid or expired API key.',
    },
  };
}

/**
 * Create a not found error response
 */
export function createNotFoundError(resource: string): ComposioResponse<null> {
  return {
    successful: false,
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `${resource} not found.`,
    },
  };
}

/**
 * Create a generic API error response
 */
export function createApiError(message: string, code = 'API_ERROR'): ComposioResponse<null> {
  return {
    successful: false,
    data: null,
    error: {
      code,
      message,
    },
  };
}
