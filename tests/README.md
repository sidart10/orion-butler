# Orion Butler Test Suite

Production-ready test infrastructure using **Playwright** with **playwright-utils** patterns.

## Quick Start

```bash
# Install dependencies
npm install

# Install playwright-utils
npm install -D @seontechnologies/playwright-utils

# Copy environment config
cp .env.example .env

# Run all tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:headed
```

## Directory Structure

```
tests/
├── e2e/                          # Browser-based UI tests
│   └── homepage.spec.ts          # Homepage and sidebar tests
├── api/                          # Pure API tests (no browser)
│   └── session.spec.ts           # Session management API tests
├── unit/                         # Unit tests (Vitest)
│   └── mocks/                    # Mock-related unit tests
├── integration/                  # Integration tests (Vitest)
├── fixtures/                     # Shared fixtures for Vitest
│   ├── database/                 # SQLite test database fixtures
│   │   └── setup.ts              # TestDatabaseFixture, withTestTransaction
│   ├── factories/                # Core entity factories
│   │   ├── index.ts              # Combined exports
│   │   ├── types.ts              # Entity type definitions
│   │   ├── user.ts               # UserFactory
│   │   ├── session.ts            # SessionFactory with createWithMessages
│   │   ├── message.ts            # MessageFactory (roles, content types)
│   │   ├── skill.ts              # SkillFactory (5 Butler skills)
│   │   └── hook.ts               # HookFactory (12 SDK event types)
│   ├── helpers/                  # Test helper utilities
│   │   └── tauri-ipc.ts          # Tauri IPC streaming helpers
│   └── mocks/                    # MSW mock handlers
│       ├── setup.ts              # MSW server setup
│       └── composio/             # Composio MCP mock handlers
│           ├── index.ts          # Combined handlers export
│           ├── gmail-handlers.ts # Gmail mock handlers
│           └── calendar-handlers.ts # Calendar mock handlers
├── support/                      # Playwright test infrastructure
│   ├── fixtures/                 # Playwright fixtures
│   │   ├── index.ts              # Merged fixtures (import from here)
│   │   ├── custom-fixtures.ts    # Project-specific fixtures
│   │   └── factories/            # Data factories
│   │       ├── session-factory.ts
│   │       └── task-factory.ts
│   ├── helpers/                  # Utility functions
│   └── page-objects/             # Page object models (optional)
└── README.md                     # This file
```

## Test Types

### E2E Tests (Browser)

Full user journey tests for the Next.js UI:

```typescript
import { test, expect } from '../support/fixtures';

test('should display chat interface', async ({ page, log }) => {
  await log.step('Navigate to homepage');
  await page.goto('/');

  await expect(page.getByTestId('chat-input')).toBeVisible();
});
```

### API Tests (No Browser)

Pure API/SDK testing without browser overhead:

```typescript
import { test, expect } from '../support/fixtures';

test('should list sessions', async ({ apiRequest, testEnv }) => {
  const { status, body } = await apiRequest({
    method: 'GET',
    path: '/api/sessions',
    baseUrl: testEnv.apiUrl,
  });

  expect(status).toBe(200);
});
```

## Fixtures Available

All tests have access to these fixtures via `import { test } from '../support/fixtures'`:

| Fixture          | Source            | Description                          |
| ---------------- | ----------------- | ------------------------------------ |
| `apiRequest`     | playwright-utils  | Typed HTTP client with retry         |
| `recurse`        | playwright-utils  | Polling for async operations         |
| `log`            | playwright-utils  | Report-integrated logging            |
| `sessionFactory` | custom            | Create/cleanup test sessions         |
| `taskFactory`    | custom            | Create/cleanup test tasks            |
| `testEnv`        | custom            | Environment configuration            |

## Data Factories

Factories create test data with sensible defaults for seeding test databases
with consistent, valid test data.

### Playwright Fixtures (tests/support/fixtures/factories/)

For E2E tests with Playwright, factories with auto-cleanup are available:

```typescript
test('create and cleanup session', async ({ sessionFactory }) => {
  // Factory creates session
  const session = await sessionFactory.createDailySession();

  // Use session in test...

  // Cleanup happens automatically after test
});
```

Available Playwright factories:

- **SessionFactory**: `createSession()`, `createDailySession()`, `createProjectSession()`
- **TaskFactory**: `createTask()`, `createInboxItem()`, `createNextAction()`, `createWaitingFor()`, `createInboxBatch()`

### Core Entity Factories (tests/fixtures/factories/)

For unit and integration tests with Vitest, use the core entity factories:

```typescript
import {
  UserFactory,
  SessionFactory,
  MessageFactory,
  SkillFactory,
  HookFactory,
} from '../fixtures/factories';

// Create entities with defaults
const user = UserFactory.create({ displayName: 'Test User' });
const session = SessionFactory.create({ type: 'Daily' });
const message = MessageFactory.create({ role: 'assistant' });

// Use relationship helper (AC#2)
const { session, messages } = SessionFactory.createWithMessages(5);
expect(messages[0].sessionId).toBe(session.id);

// Create multiple entities
const skills = SkillFactory.createMany(3);
const hooks = HookFactory.createMany(2, { isActive: false });
```

### Available Core Factories

| Factory | Methods | Purpose |
| ------- | ------- | ------- |
| `UserFactory` | `create()`, `createMany()` | User entities with email, displayName, preferences |
| `SessionFactory` | `create()`, `createMany()`, `createWithMessages()`, `createDaily()`, `createProject()`, `createInbox()`, `createAdhoc()` | Session entities with all 4 types (Daily, Project, Inbox, Ad-hoc) |
| `MessageFactory` | `create()`, `createMany()`, `createUserMessage()`, `createAssistantMessage()`, `createToolUseMessage()`, `createToolResultMessage()` | Message entities with role and content type support |
| `SkillFactory` | `create()`, `createMany()`, `createMorningBriefing()`, `createInboxTriage()`, `createCalendarManagement()`, `createEmailComposition()`, `createWeeklyReview()` | Skill entities with valid manifest structure |
| `HookFactory` | `create()`, `createMany()`, `createSessionStartHook()`, `createPreToolUseHook()`, `createPostToolUseHook()`, `createPermissionGuardHook()`, `createAuditLoggerHook()`, `createLifecycleHooks()`, `createToolPipelineHooks()` | Hook entities with all 12 SDK event types |

### Entity Types

All factories produce entities matching the interim shapes from `architecture.md#Database Layer`:

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // user@example.com
  displayName: string;           // "Test User"
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  id: string;
  userId: string;
  type: 'Daily' | 'Project' | 'Inbox' | 'Ad-hoc';
  name: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastAccessedAt: Date;
}

interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string | ContentBlock[];  // Text or tool_use/tool_result blocks
  createdAt: Date;
}

interface Skill {
  id: string;
  name: string;
  trigger: string;              // "/briefing" or keyword
  promptTemplate: string;
  isActive: boolean;
}

interface Hook {
  id: string;
  event: HookEventType;         // 12 SDK event types
  handler: string;              // Path to handler script
  timeout: number;              // ms
  isActive: boolean;
}
```

### Hook Event Types

All 12 SDK hook event types are supported:

- `SessionStart`, `SessionEnd` - Session lifecycle
- `PreToolUse`, `PostToolUse` - Tool execution pipeline
- `PreMessage`, `PostMessage` - Message processing
- `PreSubagent`, `PostSubagent` - Subagent orchestration
- `PreMcp`, `PostMcp` - MCP server calls
- `OnError` - Error handling
- `OnContextCompaction` - Context management

### Relationship Helpers

Use `createWithMessages()` to create properly linked entities:

```typescript
// Creates session + 5 messages with matching sessionId
const { session, messages } = SessionFactory.createWithMessages(5);

expect(messages).toHaveLength(5);
expect(messages[0].sessionId).toBe(session.id);
expect(messages[4].sessionId).toBe(session.id);
```

### Test Isolation

Reset counters between tests if needed:

```typescript
beforeEach(() => {
  UserFactory.resetCounter();
  SessionFactory.resetCounter();
  MessageFactory.resetCounter();
  SkillFactory.resetCounter();
  HookFactory.resetCounter();
});
```

## SQLite Database Fixtures

Database fixtures provide test isolation through transaction-based cleanup.
Uses in-memory SQLite for unit tests (fast) and file-based SQLite for integration tests (realistic).

### Quick Setup

```typescript
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import {
  TestDatabaseFixture,
  withTestTransaction,
  setupTestDatabase,
  teardownTestDatabase
} from '../fixtures/database/setup';

describe('Database Tests', () => {
  const { setup, cleanup } = withTestTransaction();

  beforeEach(setup);
  afterEach(cleanup);

  it('should isolate test data (AC#1)', async () => {
    // Data created here exists only during this test
    // Automatically rolled back after test completes
  });
});
```

### Configuration Options

```typescript
// In-memory database (default, fastest)
const fixture = new TestDatabaseFixture({ mode: 'memory' });

// File-based database (for integration tests)
const fixture = new TestDatabaseFixture({
  mode: 'file',
  filePath: './test-integration.db',
  walMode: true,  // Enable WAL for non-blocking reads
});

// Using factory functions
import { getUnitTestDatabase, createIntegrationTestDatabase } from '../fixtures/database/setup';

const unitDb = getUnitTestDatabase();  // Singleton in-memory
const integrationDb = createIntegrationTestDatabase('./test.db');  // New file-based
```

### Transaction-Based Test Isolation

All test data is automatically cleaned up via transaction rollback:

```typescript
it('AC#1: records exist only during test execution', () => {
  const db = fixture.getDb();

  // Insert test data
  db.prepare("INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)")
    .run('test-id', 'test@example.com', 'Test User');

  // Data exists during test
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get('test-id');
  expect(user).toBeDefined();

  // After test: automatically rolled back by afterEach(cleanup)
});

it('AC#2: cleanup runs on test completion', () => {
  // Previous test's data is gone
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get('test-id');
  expect(user).toBeUndefined();  // Rolled back automatically
});
```

### Manual Transaction Control

For advanced scenarios, use transactions directly:

```typescript
it('should support nested transactions', () => {
  const db = fixture.getDb();

  // Outer transaction
  const tx1 = fixture.beginTransaction();
  db.prepare("INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)")
    .run('outer-id', 'outer@example.com', 'Outer User');

  // Inner transaction
  const tx2 = fixture.beginTransaction();
  db.prepare("INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)")
    .run('inner-id', 'inner@example.com', 'Inner User');

  // Rollback inner only
  tx2.rollback();

  // Or commit to persist
  tx1.commit();
});
```

### Database Schema

The test schema matches entity types from `tests/fixtures/factories/types.ts`:

| Table | Description | Key Columns |
| ----- | ----------- | ----------- |
| `users` | User accounts | id, email, display_name, preferences |
| `sessions` | Conversation sessions | id, user_id, type (Daily/Project/Inbox/Ad-hoc), name |
| `messages` | Chat messages | id, session_id, role (user/assistant), content |
| `skills` | Butler skills | id, name, trigger, prompt_template |
| `hooks` | SDK lifecycle hooks | id, event (12 types), handler, timeout |
| `canvas_state` | Canvas UI state | id, conversation_id, mode, component |
| `preferences` | User preferences | id, user_id, category, key, value |

### WAL Mode for Parallel Tests

File-based databases use WAL mode for non-blocking reads:

```typescript
// WAL mode is enabled by default for file-based databases
const fixture = createIntegrationTestDatabase('./test.db');
await fixture.setup();

// Multiple readers don't block each other
const results = await Promise.all([
  Promise.resolve(db.prepare('SELECT * FROM users').all()),
  Promise.resolve(db.prepare('SELECT * FROM users').all()),
]);
```

### Cleanup Utilities

```typescript
// Clean all data but preserve schema
fixture.cleanupTestData();

// Reset counters and clean data
fixture.reset();

// Full teardown (close connection)
await fixture.teardown();
```

### Best Practices

1. **Use `withTestTransaction()` for automatic cleanup** - Ensures test isolation
2. **Use in-memory databases for unit tests** - Fastest execution
3. **Use file-based databases for integration tests** - Realistic behavior
4. **Prefer transaction rollback over DELETE** - More efficient, atomic
5. **Reset factory counters in beforeEach** - Consistent test data IDs

### Files

- `tests/fixtures/database/setup.ts` - Database fixture implementation
- `tests/unit/database/setup.spec.ts` - Unit tests (37 tests)
- `tests/unit/database/wal-mode.spec.ts` - WAL mode tests (11 tests)

## Selector Strategy

Use `data-testid` attributes for reliable selectors:

```typescript
// Good
await page.getByTestId('chat-input').fill('Hello');

// Avoid
await page.locator('.input-class').fill('Hello');
```

Required test IDs in the application:

- `chat-input` - Main conversation input
- `sidebar` - Navigation sidebar
- `quick-capture-input` - Quick capture modal input
- `gtd-inbox`, `gtd-next-actions`, `gtd-projects`, `gtd-waiting-for`, `gtd-someday-maybe` - GTD categories

## Running Tests

```bash
# All tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e:headed

# Specific project
npx playwright test --project=api
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# UI mode (interactive)
npx playwright test --ui
```

## CI Integration

Tests run in GitHub Actions with:

- Parallel execution across browsers
- Retry on flaky tests (2 retries in CI)
- Artifact capture on failure (traces, screenshots, videos)
- JUnit XML for test reporting

## Best Practices

1. **Use fixtures for all test data** - Auto-cleanup prevents test pollution
2. **Use `log.step()` for debugging** - Steps appear in Playwright report
3. **Use `data-testid` selectors** - Resilient to UI changes
4. **API tests are first-class** - No browser overhead for pure API testing
5. **Polling with `recurse`** - For async operations like agent responses

## Troubleshooting

### Tests fail with "page not found"

Ensure the dev server is running or let Playwright start it:

```bash
npm run dev
```

### API tests fail with connection errors

Check `.env` has correct `API_URL`:

```bash
API_URL=http://localhost:3000/api
```

### Fixtures not found

Ensure `@seontechnologies/playwright-utils` is installed:

```bash
npm install -D @seontechnologies/playwright-utils
```

## Composio MCP Mocking (MSW)

MSW (Mock Service Worker) is configured to intercept Composio MCP protocol calls,
enabling integration tests without requiring live Composio connections.

### Quick Setup

For Vitest unit/integration tests, use the convenience setup function:

```typescript
import { describe, it, expect } from 'vitest';
import { setupMswServer } from '../fixtures/mocks/setup';

// This sets up beforeAll, afterEach, and afterAll hooks
setupMswServer();

describe('My Integration Test', () => {
  it('should call Gmail API', async () => {
    const response = await fetch(
      'https://backend.composio.dev/api/v2/actions/GMAIL_GET_EMAILS/execute',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.successful).toBe(true);
    expect(data.data.response_data.emails).toBeDefined();
  });
});
```

### Available Mock Handlers

| Handler | Tool | Description |
| ------- | ---- | ----------- |
| `GMAIL_GET_EMAILS` | Gmail | Returns mock inbox emails |
| `GMAIL_SEND_EMAIL` | Gmail | Returns sent confirmation |
| `GMAIL_SEARCH` | Gmail | Filters mock emails by query |
| `CALENDAR_LIST_EVENTS` | Calendar | Returns mock calendar events |
| `CALENDAR_CREATE_EVENT` | Calendar | Returns created event confirmation |

### Using Mock Data

Access mock data directly for assertions:

```typescript
import {
  mockEmails,
  mockCalendarEvents,
} from '../fixtures/mocks/composio';

it('should return expected emails', async () => {
  // ... fetch emails ...
  expect(data.data.response_data.emails).toHaveLength(mockEmails.inbox.length);
});
```

### Adding Custom Handlers

Add runtime handlers for specific test cases:

```typescript
import { addHandlers } from '../fixtures/mocks/setup';
import { http, HttpResponse } from 'msw';

it('should handle error case', () => {
  // Override handler for this test only
  addHandlers(
    http.post(
      'https://backend.composio.dev/api/v2/actions/GMAIL_GET_EMAILS/execute',
      () => {
        return HttpResponse.json({ successful: false, error: 'Rate limited' });
      }
    )
  );

  // Test error handling...
});
```

### CI Network Isolation

In CI environments (`CI=true`), unhandled requests throw errors to ensure
no network leakage. This catches missing mock handlers during development.

Local development uses warnings instead to allow debugging.

### Handler Files

- `tests/fixtures/mocks/composio/gmail-handlers.ts` - Gmail tool handlers
- `tests/fixtures/mocks/composio/calendar-handlers.ts` - Calendar tool handlers
- `tests/fixtures/mocks/composio/index.ts` - Combined exports
- `tests/fixtures/mocks/setup.ts` - MSW server configuration

## Tauri IPC Streaming Helpers

Deterministic helpers for testing Tauri IPC streaming events. These helpers eliminate
timing-based waits (`waitForTimeout`) by intercepting streaming events directly.

### Quick Setup

```typescript
import { test, expect } from '@playwright/test';
import {
  createTauriIPCHelper,
  StreamEventType,
} from '../fixtures/helpers/tauri-ipc';

test('streaming UI test', async ({ page }) => {
  const tauriHelper = createTauriIPCHelper(page);

  // Install hooks before triggering streaming
  await tauriHelper.installStreamingHooks();

  // Navigate and trigger streaming action...
  await page.goto('/');
  await page.getByTestId('chat-input').fill('Hello');
  await page.getByTestId('send-button').click();

  // Wait deterministically for event (no waitForTimeout!)
  const event = await tauriHelper.waitForStreamEvent(StreamEventType.TEXT_BLOCK);
  expect(event.content).toBeDefined();
});
```

### Available Event Types

| Event Type | Description |
| ---------- | ----------- |
| `TEXT_BLOCK` | Text content block from Claude response |
| `THINKING_BLOCK` | Extended thinking block |
| `TOOL_USE_BLOCK` | Tool use request block |
| `TOOL_RESULT_BLOCK` | Tool execution result block |
| `STREAM_START` | Stream session started |
| `STREAM_END` | Stream session ended |
| `FIRST_TOKEN` | First token received (for latency measurement) |
| `STREAM_ERROR` | Error occurred during streaming |
| `CONTENT_DELTA` | Delta content update |

### Latency Measurement (NFR-1.1)

Measure first-token latency for performance validation:

```typescript
test('first token latency meets SLO', async ({ page }) => {
  const tauriHelper = createTauriIPCHelper(page);
  await tauriHelper.installStreamingHooks();

  // Trigger streaming...
  await page.getByTestId('send-button').click();

  // Wait for first text block
  await tauriHelper.waitForStreamEvent(StreamEventType.TEXT_BLOCK);

  // Measure latency
  const latency = await tauriHelper.measureFirstTokenLatency();
  expect(latency).toBeLessThan(500); // NFR-1.1: <500ms p95

  // Or use the SLO validator
  const result = await tauriHelper.validateLatencySLO(500);
  expect(result.passed).toBe(true);
  console.log(`Latency: ${result.latencyMs}ms`);
});
```

### Collecting All Stream Events

For debugging or comprehensive validation:

```typescript
test('collect all streaming events', async ({ page }) => {
  const tauriHelper = createTauriIPCHelper(page);
  await tauriHelper.installStreamingHooks();

  // Trigger and wait for streaming to complete...
  await tauriHelper.waitForStreamEvent(StreamEventType.STREAM_END);

  // Collect all events
  const events = await tauriHelper.collectStreamEvents();
  console.log(`Captured ${events.length} events`);

  // Verify event sequence
  expect(events[0].type).toBe('stream_start');
  expect(events[events.length - 1].type).toBe('stream_end');
});
```

### Key Principles

1. **No timing-based waits** - Replace `waitForTimeout()` with `waitForStreamEvent()`
2. **Deterministic testing** - Tests wait for specific events, not arbitrary timeouts
3. **Accurate latency measurement** - Hook-based timing captures real performance
4. **Event sequence validation** - Verify streaming behavior, not just final state

### Helper Files

- `tests/fixtures/helpers/tauri-ipc.ts` - Main helper implementation
- `tests/unit/tauri-ipc-helper.spec.ts` - Unit tests for the helper

## Knowledge Base References

TEA patterns applied:

- `overview.md` - Playwright utils installation and design principles
- `fixtures-composition.md` - mergeTests composition pattern
- `api-request.md` - Typed HTTP client with schema validation
- `data-factories.md` - Factory pattern with auto-cleanup
- `test-quality.md` - Test design principles
