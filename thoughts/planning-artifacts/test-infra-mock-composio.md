# Test Infrastructure: Mock Composio Server

**Concern ID:** C-002
**Risk Score:** 9 (CRITICAL)
**Priority:** Must complete BEFORE Epic 3

---

## 1. Purpose

A local HTTP server that mimics Composio's OAuth and tool execution APIs. All integration and E2E tests use this mock instead of hitting real Composio endpoints.

**Why Critical:**
- Real OAuth requires user interaction (browser redirect)
- Real tokens expire, causing test flakiness
- Real API has rate limits (tests will throttle)
- Real calls are slow (network latency)

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Test Environment                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────┐         ┌──────────────────────┐     │
│   │ Agent Server│ ──────► │ Mock Composio Server │     │
│   │ (localhost: │         │ (localhost:4001)     │     │
│   │  3001)      │         │                      │     │
│   └─────────────┘         │ - /oauth/token       │     │
│         │                 │ - /oauth/refresh     │     │
│         │                 │ - /gmail/messages    │     │
│         ▼                 │ - /gmail/send        │     │
│   ┌─────────────┐         │ - /calendar/events   │     │
│   │   SQLite    │         │ - /calendar/create   │     │
│   │   (test)    │         │ - /slack/messages    │     │
│   └─────────────┘         └──────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. API Endpoints

### 3.1 OAuth Endpoints

#### POST /oauth/token
Exchange authorization code for access token.

**Request:**
```json
{
  "grant_type": "authorization_code",
  "code": "mock_auth_code",
  "redirect_uri": "http://localhost:3000/callback",
  "client_id": "test_client"
}
```

**Response:**
```json
{
  "access_token": "mock_access_token_abc123",
  "refresh_token": "mock_refresh_token_xyz789",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "gmail.read gmail.send calendar.read calendar.write"
}
```

#### POST /oauth/refresh
Refresh expired access token.

**Request:**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "mock_refresh_token_xyz789"
}
```

**Response:**
```json
{
  "access_token": "mock_access_token_renewed_456",
  "refresh_token": "mock_refresh_token_xyz789",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### GET /oauth/status
Check connection status for a tool.

**Response:**
```json
{
  "gmail": { "connected": true, "email": "test@example.com" },
  "calendar": { "connected": true, "email": "test@example.com" },
  "slack": { "connected": false }
}
```

---

### 3.2 Gmail Tool Endpoints

#### GET /gmail/messages
List emails from inbox.

**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)
- `query` (optional: search filter)

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_001",
      "threadId": "thread_001",
      "from": { "email": "sender@example.com", "name": "John Doe" },
      "to": [{ "email": "test@example.com", "name": "Test User" }],
      "subject": "Q1 Planning Meeting",
      "snippet": "Hi, let's schedule a meeting to discuss...",
      "body": "<html><body>Hi, let's schedule a meeting...</body></html>",
      "date": "2026-01-15T09:30:00Z",
      "labels": ["INBOX", "IMPORTANT"],
      "isRead": false,
      "hasAttachments": false
    }
  ],
  "nextPageToken": "token_page_2",
  "resultSizeEstimate": 150
}
```

#### GET /gmail/messages/:id
Get single email by ID.

**Response:** Single message object (same schema as above)

#### POST /gmail/send
Send an email.

**Request:**
```json
{
  "to": ["recipient@example.com"],
  "cc": [],
  "bcc": [],
  "subject": "Re: Q1 Planning Meeting",
  "body": "<html><body>Thanks for reaching out...</body></html>",
  "replyToMessageId": "msg_001"
}
```

**Response:**
```json
{
  "id": "msg_002",
  "threadId": "thread_001",
  "status": "sent",
  "sentAt": "2026-01-15T10:45:00Z"
}
```

#### POST /gmail/draft
Save email as draft.

**Request:** Same as /gmail/send

**Response:**
```json
{
  "id": "draft_001",
  "status": "draft",
  "createdAt": "2026-01-15T10:45:00Z"
}
```

---

### 3.3 Calendar Tool Endpoints

#### GET /calendar/events
List calendar events.

**Query Params:**
- `timeMin` (ISO8601)
- `timeMax` (ISO8601)
- `calendarId` (default: "primary")

**Response:**
```json
{
  "events": [
    {
      "id": "evt_001",
      "summary": "Team Standup",
      "description": "Daily sync",
      "start": { "dateTime": "2026-01-16T09:00:00Z", "timeZone": "America/Los_Angeles" },
      "end": { "dateTime": "2026-01-16T09:30:00Z", "timeZone": "America/Los_Angeles" },
      "attendees": [
        { "email": "alice@example.com", "responseStatus": "accepted" },
        { "email": "bob@example.com", "responseStatus": "tentative" }
      ],
      "location": "Zoom",
      "conferenceData": { "entryPoints": [{ "uri": "https://zoom.us/j/123" }] },
      "status": "confirmed"
    }
  ]
}
```

#### POST /calendar/events
Create calendar event.

**Request:**
```json
{
  "summary": "Project Review",
  "description": "Review Q1 deliverables",
  "start": { "dateTime": "2026-01-17T14:00:00Z", "timeZone": "America/Los_Angeles" },
  "end": { "dateTime": "2026-01-17T15:00:00Z", "timeZone": "America/Los_Angeles" },
  "attendees": [{ "email": "client@example.com" }],
  "conferenceData": { "createRequest": { "requestId": "meet_123" } }
}
```

**Response:**
```json
{
  "id": "evt_002",
  "status": "confirmed",
  "htmlLink": "https://calendar.google.com/event?eid=evt_002",
  "hangoutLink": "https://meet.google.com/abc-defg-hij"
}
```

#### GET /calendar/freebusy
Check availability.

**Request:**
```json
{
  "timeMin": "2026-01-17T08:00:00Z",
  "timeMax": "2026-01-17T18:00:00Z",
  "items": [{ "id": "primary" }]
}
```

**Response:**
```json
{
  "calendars": {
    "primary": {
      "busy": [
        { "start": "2026-01-17T09:00:00Z", "end": "2026-01-17T09:30:00Z" },
        { "start": "2026-01-17T14:00:00Z", "end": "2026-01-17T15:00:00Z" }
      ]
    }
  }
}
```

---

### 3.4 Slack Tool Endpoints (Future)

#### GET /slack/messages
List messages from channel.

#### POST /slack/send
Send message to channel.

---

## 4. Test Fixture Data

### 4.1 Email Fixtures

```typescript
// tests/fixtures/emails.ts
export const EMAIL_FIXTURES = {
  urgent_client: {
    id: 'msg_urgent_001',
    from: { email: 'vip@client.com', name: 'Important Client' },
    subject: 'URGENT: Contract Review Needed',
    body: 'Please review the attached contract by EOD...',
    date: '2026-01-15T08:00:00Z',
    labels: ['INBOX', 'IMPORTANT'],
    isRead: false,
    // Expected triage result
    _expectedPriority: 0.95,
    _expectedCategory: 'urgent',
    _expectedActions: ['reply', 'extract_task']
  },

  newsletter: {
    id: 'msg_newsletter_001',
    from: { email: 'newsletter@techblog.com', name: 'Tech Weekly' },
    subject: 'This Week in AI',
    body: 'Top stories from the world of AI...',
    date: '2026-01-14T06:00:00Z',
    labels: ['INBOX', 'PROMOTIONS'],
    isRead: true,
    _expectedPriority: 0.15,
    _expectedCategory: 'newsletter',
    _expectedActions: ['archive']
  },

  meeting_request: {
    id: 'msg_meeting_001',
    from: { email: 'colleague@company.com', name: 'Alice Johnson' },
    subject: 'Can we sync this week?',
    body: 'Hey, would love to catch up on the project...',
    date: '2026-01-15T11:30:00Z',
    labels: ['INBOX'],
    isRead: false,
    _expectedPriority: 0.65,
    _expectedCategory: 'meeting_request',
    _expectedActions: ['schedule']
  }
};
```

### 4.2 Calendar Fixtures

```typescript
// tests/fixtures/calendar.ts
export const CALENDAR_FIXTURES = {
  busy_day: {
    date: '2026-01-17',
    events: [
      { id: 'evt_1', summary: 'Team Standup', start: '09:00', end: '09:30' },
      { id: 'evt_2', summary: 'Client Call', start: '10:00', end: '11:00' },
      { id: 'evt_3', summary: 'Lunch', start: '12:00', end: '13:00' },
      { id: 'evt_4', summary: 'Project Review', start: '14:00', end: '15:30' },
      { id: 'evt_5', summary: '1:1 with Manager', start: '16:00', end: '16:30' },
    ],
    // Expected free slots
    _expectedFreeSlots: ['08:00-09:00', '09:30-10:00', '11:00-12:00', '13:00-14:00', '15:30-16:00', '16:30-18:00']
  },

  empty_day: {
    date: '2026-01-18',
    events: [],
    _expectedFreeSlots: ['08:00-18:00']
  }
};
```

---

## 5. Implementation

### 5.1 Server Code

```typescript
// tests/mocks/composio-server.ts
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { EMAIL_FIXTURES } from '../fixtures/emails';
import { CALENDAR_FIXTURES } from '../fixtures/calendar';

interface MockServerOptions {
  port?: number;
  latency?: number; // Simulate network delay
  failureRate?: number; // 0-1, simulate random failures
}

export function createMockComposioServer(options: MockServerOptions = {}) {
  const { port = 4001, latency = 0, failureRate = 0 } = options;

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Simulate latency
    if (latency > 0) {
      await new Promise(resolve => setTimeout(resolve, latency));
    }

    // Simulate random failures
    if (Math.random() < failureRate) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Service temporarily unavailable' }));
      return;
    }

    const url = new URL(req.url!, `http://localhost:${port}`);
    const path = url.pathname;
    const method = req.method;

    // CORS headers for browser requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Route handling
    try {
      const response = await handleRoute(method!, path, req, url);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error: any) {
      res.writeHead(error.status || 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });

  return {
    start: () => new Promise<void>((resolve) => {
      server.listen(port, () => {
        console.log(`Mock Composio server running on http://localhost:${port}`);
        resolve();
      });
    }),
    stop: () => new Promise<void>((resolve) => {
      server.close(() => resolve());
    }),
    // Test helpers
    setFixtures: (fixtures: any) => { /* update in-memory fixtures */ },
    getCallLog: () => { /* return recorded API calls */ },
    reset: () => { /* reset state between tests */ }
  };
}

async function handleRoute(method: string, path: string, req: IncomingMessage, url: URL) {
  // OAuth routes
  if (path === '/oauth/token' && method === 'POST') {
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'gmail.read gmail.send calendar.read calendar.write'
    };
  }

  if (path === '/oauth/refresh' && method === 'POST') {
    return {
      access_token: 'mock_access_token_refreshed_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  if (path === '/oauth/status' && method === 'GET') {
    return {
      gmail: { connected: true, email: 'test@example.com' },
      calendar: { connected: true, email: 'test@example.com' },
      slack: { connected: false }
    };
  }

  // Gmail routes
  if (path === '/gmail/messages' && method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const messages = Object.values(EMAIL_FIXTURES).slice(0, limit);
    return { messages, resultSizeEstimate: messages.length };
  }

  if (path.match(/^\/gmail\/messages\/(.+)$/) && method === 'GET') {
    const id = path.split('/').pop();
    const message = Object.values(EMAIL_FIXTURES).find(m => m.id === id);
    if (!message) throw { status: 404, message: 'Message not found' };
    return message;
  }

  if (path === '/gmail/send' && method === 'POST') {
    return {
      id: 'msg_sent_' + Date.now(),
      threadId: 'thread_' + Date.now(),
      status: 'sent',
      sentAt: new Date().toISOString()
    };
  }

  // Calendar routes
  if (path === '/calendar/events' && method === 'GET') {
    const date = url.searchParams.get('date') || '2026-01-17';
    const fixture = Object.values(CALENDAR_FIXTURES).find(f => f.date === date);
    return { events: fixture?.events || [] };
  }

  if (path === '/calendar/events' && method === 'POST') {
    return {
      id: 'evt_created_' + Date.now(),
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=mock',
      hangoutLink: 'https://meet.google.com/mock-meeting'
    };
  }

  if (path === '/calendar/freebusy' && method === 'POST') {
    return {
      calendars: {
        primary: {
          busy: [
            { start: '2026-01-17T09:00:00Z', end: '2026-01-17T09:30:00Z' },
            { start: '2026-01-17T14:00:00Z', end: '2026-01-17T15:00:00Z' }
          ]
        }
      }
    };
  }

  throw { status: 404, message: `Unknown route: ${method} ${path}` };
}
```

### 5.2 Test Setup

```typescript
// tests/setup/composio.ts
import { createMockComposioServer } from '../mocks/composio-server';

let mockServer: ReturnType<typeof createMockComposioServer>;

export async function setupMockComposio() {
  mockServer = createMockComposioServer({ port: 4001 });
  await mockServer.start();

  // Point Agent Server to mock
  process.env.COMPOSIO_API_URL = 'http://localhost:4001';
}

export async function teardownMockComposio() {
  await mockServer?.stop();
}

export function resetMockComposio() {
  mockServer?.reset();
}

// E2E global setup
// vitest.config.ts or e2e-runner.ts
export default defineConfig({
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),
});

// tests/setup/global-setup.ts
import { setupMockComposio } from './composio';

export default async function globalSetup() {
  await setupMockComposio();
}
```

### 5.3 Usage in Tests

```typescript
// tests/integration/gmail-sync.spec.ts
import { test, expect } from '@/tests/support/fixtures';
import { resetMockComposio } from '../setup/composio';

test.beforeEach(async () => {
  resetMockComposio(); // Fresh state each test
});

test('inbox syncs emails from Gmail', async ({ page }) => {
  await page.goto('/inbox');

  // Wait for sync to complete
  await page.waitForSelector('[data-testid="inbox-loaded"]');

  // Should show fixture emails
  await expect(page.getByText('URGENT: Contract Review Needed')).toBeVisible();
  await expect(page.getByText('This Week in AI')).toBeVisible();
  await expect(page.getByText('Can we sync this week?')).toBeVisible();
});

test('can send email via Gmail', async ({ page }) => {
  await page.goto('/compose');

  await page.fill('[data-testid="to"]', 'recipient@example.com');
  await page.fill('[data-testid="subject"]', 'Test Email');
  await page.fill('[data-testid="body"]', 'Hello, this is a test.');

  await page.click('[data-testid="send"]');

  // Should show success
  await expect(page.getByText('Email sent')).toBeVisible();
});
```

---

## 6. Rate Limiting Simulation

```typescript
// For testing graceful degradation
const rateLimitedServer = createMockComposioServer({
  port: 4001,
  // Return 429 after 10 requests
  rateLimit: { maxRequests: 10, windowMs: 60000 }
});

test('handles rate limiting gracefully', async ({ page }) => {
  // Make 15 rapid requests
  for (let i = 0; i < 15; i++) {
    await page.click('[data-testid="refresh-inbox"]');
  }

  // Should show rate limit message
  await expect(page.getByText('Syncing paused')).toBeVisible();
  await expect(page.getByText('Too many requests')).toBeVisible();
});
```

---

## 7. Checklist

- [ ] Create `tests/mocks/composio-server.ts`
- [ ] Create `tests/fixtures/emails.ts` with 20+ email fixtures
- [ ] Create `tests/fixtures/calendar.ts` with calendar scenarios
- [ ] Add global setup/teardown in Vercel Browser Agent config
- [ ] Update Agent Server config to use `COMPOSIO_API_URL` env var
- [ ] Document how to add new endpoints for future tools (Slack, etc.)

---

**Status:** Ready for Implementation
**Owner:** TBD
**Deadline:** Before Epic 3 starts

_Generated by TEA - 2026-01-15_
