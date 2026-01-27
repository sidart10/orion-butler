/**
 * Gmail Mock Handlers for Composio MCP
 *
 * MSW handlers that intercept Composio API calls for Gmail operations.
 * These handlers return mock data without making actual network calls.
 *
 * Supported tools:
 * - GMAIL_GET_EMAILS
 * - GMAIL_SEND_EMAIL
 * - GMAIL_SEARCH
 *
 * Error handlers (for testing error scenarios):
 * - GMAIL_GET_EMAILS (rate limit)
 * - GMAIL_GET_EMAILS (auth error)
 */
import { http, HttpResponse } from 'msw';
import {
  COMPOSIO_API_BASE,
  type GmailSendEmailRequest,
  type GmailSearchRequest,
  type MockEmail,
  type SentEmailResponse,
  createRateLimitError,
  createAuthError,
} from './types';

/**
 * Mock email data for testing
 */
export const mockEmails: { inbox: MockEmail[] } = {
  inbox: [
    {
      id: 'email-001',
      threadId: 'thread-001',
      from: 'alice@example.com',
      to: ['user@example.com'],
      subject: 'Project Update',
      body: 'Here is the latest project update...',
      date: '2026-01-24T09:00:00Z',
      labels: ['INBOX', 'UNREAD'],
    },
    {
      id: 'email-002',
      threadId: 'thread-002',
      from: 'bob@example.com',
      to: ['user@example.com'],
      subject: 'Meeting Tomorrow',
      body: 'Can we meet tomorrow at 2pm?',
      date: '2026-01-24T08:30:00Z',
      labels: ['INBOX', 'UNREAD'],
    },
    {
      id: 'email-003',
      threadId: 'thread-003',
      from: 'carol@example.com',
      to: ['user@example.com'],
      subject: 'Invoice #1234',
      body: 'Please find attached invoice...',
      date: '2026-01-23T15:00:00Z',
      labels: ['INBOX'],
    },
  ],
};

/**
 * Mock sent email response
 */
export const mockSentEmailResponse: SentEmailResponse = {
  id: 'email-sent-001',
  threadId: 'thread-new-001',
  labelIds: ['SENT'],
  status: 'sent',
};

/**
 * Gmail mock handlers for Composio API (success scenarios)
 */
export const gmailHandlers = [
  /**
   * GMAIL_GET_EMAILS - Fetch emails from inbox
   */
  http.post(`${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`, async () => {
    return HttpResponse.json({
      successful: true,
      data: {
        response_data: {
          emails: mockEmails.inbox,
          resultSizeEstimate: mockEmails.inbox.length,
        },
      },
      error: null,
    });
  }),

  /**
   * GMAIL_SEND_EMAIL - Send an email
   */
  http.post(`${COMPOSIO_API_BASE}/actions/GMAIL_SEND_EMAIL/execute`, async ({ request }) => {
    const body = (await request.json()) as GmailSendEmailRequest;

    return HttpResponse.json({
      successful: true,
      data: {
        response_data: {
          ...mockSentEmailResponse,
          to: body.to,
          subject: body.subject,
        },
      },
      error: null,
    });
  }),

  /**
   * GMAIL_SEARCH - Search emails
   */
  http.post(`${COMPOSIO_API_BASE}/actions/GMAIL_SEARCH/execute`, async ({ request }) => {
    const body = (await request.json()) as GmailSearchRequest;
    const query = body.query?.toLowerCase() || '';

    // Filter mock emails by query
    const filteredEmails = mockEmails.inbox.filter(
      (email) =>
        email.subject.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query)
    );

    return HttpResponse.json({
      successful: true,
      data: {
        response_data: {
          emails: filteredEmails,
          resultSizeEstimate: filteredEmails.length,
        },
      },
      error: null,
    });
  }),
];

/**
 * Gmail error handlers for testing error scenarios.
 * Use these by adding them with server.use() in specific tests.
 */
export const gmailErrorHandlers = {
  /**
   * Returns a rate limit error (429)
   */
  rateLimitError: http.post(
    `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
    () => {
      return HttpResponse.json(createRateLimitError(), { status: 429 });
    }
  ),

  /**
   * Returns an authentication error (401)
   */
  authError: http.post(
    `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
    () => {
      return HttpResponse.json(createAuthError(), { status: 401 });
    }
  ),

  /**
   * Simulates a network timeout
   */
  networkError: http.post(
    `${COMPOSIO_API_BASE}/actions/GMAIL_GET_EMAILS/execute`,
    () => {
      return HttpResponse.error();
    }
  ),
};
