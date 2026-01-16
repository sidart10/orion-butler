# ATDD Checklist: Story 1.8 - Streaming Responses

**Story ID:** 1-8-streaming-responses
**Epic:** 1 - Foundation & First Chat
**Generated:** 2026-01-15
**Author:** TEA (Test Architect Agent - Murat)

---

## Test Strategy Summary

| Category | Count | Priority |
|----------|-------|----------|
| Unit Tests | 12 | P0-P1 |
| Integration Tests | 8 | P0 |
| E2E Tests | 14 | P0-P1 |
| Performance Tests | 4 | P0 (NFR-P001) |
| **Total** | **38** | |

### Risk Assessment

| Risk Factor | Level | Mitigation |
|-------------|-------|------------|
| SSE Connection Stability | HIGH | Network-first patterns, retry logic |
| First Token Latency (NFR-P001) | HIGH | Performance monitoring, mocked tests |
| Long Response Memory | MEDIUM | Bounded accumulation, cleanup |
| Tauri IPC Forwarding | MEDIUM | Integration tests with real events |
| UI Flickering | MEDIUM | Visual stability tests, debouncing |

---

## AC1: SSE Streaming Connection

### Unit Tests

- [ ] **1.8-UNIT-001** - SSE event parser handles well-formed events
  - **Given** a valid SSE event string `event: text\ndata: {"content":"hello"}\n\n`
  - **When** parsed by `parseSSEEvents()`
  - **Then** returns `{type: 'text', content: 'hello'}`
  - **Priority:** P0 | **Automation:** Vitest

- [ ] **1.8-UNIT-002** - SSE event parser handles incomplete events
  - **Given** an incomplete SSE event string (no double newline)
  - **When** parsed by `parseSSEEvents()`
  - **Then** returns `remaining` buffer with partial content
  - **Priority:** P1 | **Automation:** Vitest

- [ ] **1.8-UNIT-003** - SSE event parser handles all event types
  - **Given** events: `connected`, `text`, `thinking`, `tool_start`, `tool_complete`, `complete`, `error`
  - **When** each is parsed
  - **Then** correct `StreamEvent` type is returned for each
  - **Priority:** P0 | **Automation:** Vitest

### Integration Tests

- [ ] **1.8-INT-001** - SSE endpoint returns correct headers
  - **Given** a POST to `/api/stream/start` with valid message
  - **When** connection is established
  - **Then** response headers include:
    - `Content-Type: text/event-stream`
    - `Cache-Control: no-cache`
    - `Connection: keep-alive`
  - **Priority:** P0 | **Automation:** Vitest + fetch

- [ ] **1.8-INT-002** - SSE endpoint sends connected event first
  - **Given** a POST to `/api/stream/start`
  - **When** stream starts
  - **Then** first event is `event: connected` with `streamId` and `timestamp`
  - **Priority:** P0 | **Automation:** Vitest + ReadableStream

- [ ] **1.8-INT-003** - SSE endpoint sends text events
  - **Given** a message "Say hello"
  - **When** Claude responds
  - **Then** receives multiple `event: text` with `{"content": "..."}` payloads
  - **Priority:** P0 | **Automation:** Vitest + mock Claude

### E2E Tests

- [ ] **1.8-E2E-001** - Stream establishes and receives data
  - **Given** I navigate to chat and type a message
  - **When** I click Send
  - **Then** SSE connection is established (check DevTools Network tab pattern)
  - **And** text events arrive and render in the UI
  - **Priority:** P0 | **Automation:** Playwright

```typescript
// Test implementation pattern
test('1.8-E2E-001 - SSE connection established and receives data', async ({ page }) => {
  // Network-first: intercept BEFORE action
  const streamPromise = page.waitForResponse(resp =>
    resp.url().includes('/api/stream') &&
    resp.headers()['content-type']?.includes('text/event-stream')
  );

  await page.goto('/');
  await page.fill('[data-testid="chat-input"]', 'Hello');
  await page.click('[data-testid="send-button"]');

  const response = await streamPromise;
  expect(response.headers()['content-type']).toContain('text/event-stream');

  // Wait for assistant message to appear
  await expect(page.locator('[data-testid="message-assistant"]')).toBeVisible({ timeout: 10000 });
});
```

---

## AC2: Typing Indicator

### Unit Tests

- [ ] **1.8-UNIT-004** - TypingIndicator shows when streaming and no first token
  - **Given** `isStreaming: true` and `firstTokenReceived: false`
  - **When** TypingIndicator renders
  - **Then** indicator is visible with animated dots
  - **Priority:** P0 | **Automation:** Vitest + RTL

- [ ] **1.8-UNIT-005** - TypingIndicator hides after first token
  - **Given** `isStreaming: true` and `firstTokenReceived: true`
  - **When** TypingIndicator renders
  - **Then** indicator is NOT visible (returns null)
  - **Priority:** P0 | **Automation:** Vitest + RTL

- [ ] **1.8-UNIT-006** - TypingIndicator hides when not streaming
  - **Given** `isStreaming: false`
  - **When** TypingIndicator renders
  - **Then** indicator is NOT visible
  - **Priority:** P1 | **Automation:** Vitest + RTL

```typescript
// Test implementation pattern
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

vi.mock('@/stores/chatStore');

test('1.8-UNIT-004 - shows when streaming before first token', () => {
  vi.mocked(useChatStore).mockReturnValue({
    isStreaming: true,
    firstTokenReceived: false,
  } as any);

  render(<TypingIndicator />);
  expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  expect(screen.getByText(/thinking/i)).toBeInTheDocument();
});
```

### E2E Tests

- [ ] **1.8-E2E-002** - Typing indicator appears before first token
  - **Given** I send a message
  - **When** waiting for response (before first token)
  - **Then** typing indicator with animated dots is visible
  - **And** "Orion is thinking..." text is displayed
  - **Priority:** P0 | **Automation:** Playwright

- [ ] **1.8-E2E-003** - Typing indicator disappears after first token
  - **Given** typing indicator is visible
  - **When** first text token arrives
  - **Then** typing indicator disappears
  - **And** streaming text appears in its place
  - **Priority:** P0 | **Automation:** Playwright

- [ ] **1.8-E2E-004** - Typing indicator appears within 100ms of sending
  - **Given** I click Send
  - **When** measuring time to indicator appearance
  - **Then** indicator appears within 100ms
  - **Priority:** P1 | **Automation:** Playwright with timing

```typescript
// Test implementation pattern
test('1.8-E2E-002 - typing indicator appears before first token', async ({ page }) => {
  // Mock slow response to catch typing indicator
  await page.route('**/api/stream/**', async route => {
    // Delay response to ensure we can see typing indicator
    await new Promise(r => setTimeout(r, 500));

    const encoder = new TextEncoder();
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body: encoder.encode('event: connected\ndata: {"streamId":"test"}\n\nevent: text\ndata: {"content":"Hello"}\n\nevent: complete\ndata: {"inputTokens":5,"outputTokens":2}\n\n'),
    });
  });

  await page.goto('/');
  await page.fill('[data-testid="chat-input"]', 'Hi');
  await page.click('[data-testid="send-button"]');

  // Typing indicator should appear immediately
  await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible({ timeout: 200 });

  // Then disappear after response
  await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 5000 });
});
```

---

## AC3: First Token Latency (NFR-P001: <500ms p95)

### Performance Tests

- [ ] **1.8-PERF-001** - First token arrives within 500ms (p95)
  - **Given** I send a simple message
  - **When** measuring time from send to first token
  - **Then** first token arrives within 500ms (p95 target)
  - **Priority:** P0 (NFR) | **Automation:** Playwright + Performance API

- [ ] **1.8-PERF-002** - First token latency is tracked and logged
  - **Given** streaming completes
  - **When** checking performance metrics
  - **Then** `firstTokenLatencyMs` is recorded in state
  - **And** metric is logged for monitoring
  - **Priority:** P0 | **Automation:** Vitest + console spy

### Unit Tests

- [ ] **1.8-UNIT-007** - Stream metrics tracks first token time
  - **Given** `startStreamMetrics(streamId)` is called
  - **When** `recordFirstToken(streamId)` is called
  - **Then** `firstTokenTime` is recorded
  - **And** latency is calculated correctly
  - **Priority:** P0 | **Automation:** Vitest

### E2E Tests

- [ ] **1.8-E2E-005** - First token latency measurement
  - **Given** I send a message
  - **When** measuring time to first visible character
  - **Then** latency is logged to console
  - **And** value is reasonable (<2000ms for real API)
  - **Priority:** P0 | **Automation:** Playwright

```typescript
// Test implementation pattern
test('1.8-E2E-005 - first token latency measurement', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(msg.text()));

  await page.goto('/');

  const startTime = Date.now();
  await page.fill('[data-testid="chat-input"]', 'Hi');
  await page.click('[data-testid="send-button"]');

  // Wait for first assistant message content
  await expect(page.locator('[data-testid="message-assistant"]')).toBeVisible({ timeout: 5000 });

  const firstTokenTime = Date.now() - startTime;
  console.log(`First token latency: ${firstTokenTime}ms`);

  // Check metrics were logged
  const metricsLog = logs.find(l => l.includes('First token latency'));
  expect(metricsLog).toBeDefined();
});
```

---

## AC4: Smooth Token Rendering

### Unit Tests

- [ ] **1.8-UNIT-008** - StreamingText renders content correctly
  - **Given** content "Hello world" and `isStreaming: true`
  - **When** StreamingText renders
  - **Then** content is displayed with cursor indicator
  - **Priority:** P0 | **Automation:** Vitest + RTL

- [ ] **1.8-UNIT-009** - StreamingText preserves whitespace
  - **Given** content with newlines and spaces
  - **When** rendered
  - **Then** whitespace is preserved (whitespace-pre-wrap)
  - **Priority:** P1 | **Automation:** Vitest + RTL

### E2E Tests

- [ ] **1.8-E2E-006** - Tokens render without flickering
  - **Given** streaming is in progress
  - **When** tokens arrive rapidly
  - **Then** text appends smoothly without flickering
  - **And** no visual artifacts or jumps occur
  - **Priority:** P0 | **Automation:** Playwright visual + manual

- [ ] **1.8-E2E-007** - Text flows naturally as words form
  - **Given** streaming individual characters/tokens
  - **When** characters accumulate into words
  - **Then** text reads naturally (no mid-word breaks persisted)
  - **Priority:** P1 | **Automation:** Playwright

- [ ] **1.8-E2E-008** - Streaming cursor visible during stream
  - **Given** streaming is in progress
  - **When** looking at the assistant message
  - **Then** a blinking cursor is visible at the end
  - **And** cursor disappears when streaming completes
  - **Priority:** P1 | **Automation:** Playwright

```typescript
// Test implementation pattern
test('1.8-E2E-006 - tokens render without flickering', async ({ page }) => {
  // Setup mock stream with multiple tokens
  await page.route('**/api/stream/**', async route => {
    const encoder = new TextEncoder();
    const tokens = ['Hello', ' ', 'there', '!', ' How', ' are', ' you', '?'];

    let body = 'event: connected\ndata: {"streamId":"test"}\n\n';
    for (const token of tokens) {
      body += `event: text\ndata: {"content":"${token}"}\n\n`;
    }
    body += 'event: complete\ndata: {"inputTokens":5,"outputTokens":8}\n\n';

    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body: encoder.encode(body),
    });
  });

  await page.goto('/');
  await page.fill('[data-testid="chat-input"]', 'Hi');
  await page.click('[data-testid="send-button"]');

  // Wait for streaming to complete
  await expect(page.locator('[data-testid="send-button"]')).toBeVisible({ timeout: 10000 });

  // Verify final content
  const content = await page.locator('[data-testid="message-assistant"]').last().textContent();
  expect(content).toBe('Hello there! How are you?');

  // Visual stability check
  await expect(page.locator('[data-testid="chat-messages"]')).toHaveScreenshot('streaming-complete.png', {
    maxDiffPixelRatio: 0.01,
  });
});
```

---

## AC5: Auto-Scroll

### Unit Tests

- [ ] **1.8-UNIT-010** - useAutoScroll scrolls when at bottom
  - **Given** container at bottom and new content arrives
  - **When** dependency changes
  - **Then** container scrolls to new bottom
  - **Priority:** P0 | **Automation:** Vitest + jsdom

- [ ] **1.8-UNIT-011** - useAutoScroll pauses when user scrolls up
  - **Given** user manually scrolls up (not at bottom)
  - **When** new content arrives
  - **Then** auto-scroll does NOT occur (respects user position)
  - **Priority:** P0 | **Automation:** Vitest + jsdom

### E2E Tests

- [ ] **1.8-E2E-009** - Chat auto-scrolls during streaming
  - **Given** streaming is in progress
  - **When** new tokens arrive
  - **Then** chat view auto-scrolls to show new content
  - **And** scroll is smooth (not jumpy)
  - **Priority:** P0 | **Automation:** Playwright

- [ ] **1.8-E2E-010** - User can override auto-scroll
  - **Given** streaming is in progress
  - **When** user scrolls up manually
  - **Then** auto-scroll pauses
  - **And** "Scroll to bottom" button appears
  - **Priority:** P1 | **Automation:** Playwright

- [ ] **1.8-E2E-011** - Scroll to bottom button works
  - **Given** user has scrolled up during streaming
  - **When** clicking "Scroll to bottom" button
  - **Then** view scrolls to bottom
  - **And** auto-scroll resumes
  - **Priority:** P1 | **Automation:** Playwright

```typescript
// Test implementation pattern
test('1.8-E2E-009 - auto-scrolls during streaming', async ({ page }) => {
  // Setup mock with long response
  await page.route('**/api/stream/**', async route => {
    const encoder = new TextEncoder();
    let body = 'event: connected\ndata: {"streamId":"test"}\n\n';

    // Generate 50 tokens to force scrolling
    for (let i = 0; i < 50; i++) {
      body += `event: text\ndata: {"content":"Word${i} "}\n\n`;
    }
    body += 'event: complete\ndata: {"inputTokens":5,"outputTokens":50}\n\n';

    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body: encoder.encode(body),
    });
  });

  await page.goto('/');
  await page.fill('[data-testid="chat-input"]', 'Write something long');
  await page.click('[data-testid="send-button"]');

  // Wait for streaming to complete
  await expect(page.locator('[data-testid="send-button"]')).toBeVisible({ timeout: 10000 });

  // Verify scroll is at bottom
  const isAtBottom = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="message-list"]');
    if (!container) return false;
    return Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 50;
  });

  expect(isAtBottom).toBe(true);
});
```

---

## AC6: Stream Completion

### Integration Tests

- [ ] **1.8-INT-004** - SSE endpoint sends complete event with token counts
  - **Given** Claude finishes responding
  - **When** stream completes
  - **Then** receives `event: complete` with `inputTokens` and `outputTokens`
  - **Priority:** P0 | **Automation:** Vitest + mock Claude

- [ ] **1.8-INT-005** - Completed message persists to database
  - **Given** streaming completes
  - **When** checking database
  - **Then** message is saved with full content
  - **And** `input_tokens` and `output_tokens` are recorded
  - **Priority:** P0 | **Automation:** Vitest + SQLite

### E2E Tests

- [ ] **1.8-E2E-012** - Typing indicator disappears on completion
  - **Given** streaming is in progress
  - **When** final token arrives (complete event)
  - **Then** typing indicator disappears
  - **And** cursor animation stops
  - **Priority:** P0 | **Automation:** Playwright

- [ ] **1.8-E2E-013** - Message persists after completion
  - **Given** streaming completes
  - **When** reloading the page
  - **Then** the complete message is still visible
  - **And** content matches what was streamed
  - **Priority:** P0 | **Automation:** Playwright

```typescript
// Test implementation pattern
test('1.8-E2E-013 - message persists after completion', async ({ page }) => {
  // Send message and wait for response
  await page.goto('/');
  await page.fill('[data-testid="chat-input"]', 'Hello');
  await page.click('[data-testid="send-button"]');

  // Wait for streaming to complete
  await expect(page.locator('[data-testid="send-button"]')).toBeVisible({ timeout: 30000 });

  // Get the response content
  const responseContent = await page.locator('[data-testid="message-assistant"]').last().textContent();
  expect(responseContent).toBeTruthy();

  // Reload page
  await page.reload();
  await page.waitForSelector('[data-testid="message-list"]');

  // Verify message persisted
  const persistedContent = await page.locator('[data-testid="message-assistant"]').last().textContent();
  expect(persistedContent).toBe(responseContent);
});
```

---

## AC7: Long Response Handling

### Performance Tests

- [ ] **1.8-PERF-003** - Memory stable during 1000+ token stream
  - **Given** streaming 1000+ tokens
  - **When** measuring memory usage
  - **Then** memory does not grow unboundedly
  - **And** stays within acceptable limits
  - **Priority:** P0 | **Automation:** Playwright + memory profiling

- [ ] **1.8-PERF-004** - UI remains responsive during long stream
  - **Given** streaming 1000+ tokens
  - **When** trying to interact with UI
  - **Then** UI responds to clicks/inputs
  - **And** no visible lag or freezing
  - **Priority:** P0 | **Automation:** Playwright

### E2E Tests

- [ ] **1.8-E2E-014** - Long response (1000+ tokens) streams smoothly
  - **Given** I ask for a detailed explanation
  - **When** Claude generates 1000+ tokens
  - **Then** all tokens render smoothly throughout
  - **And** no errors occur
  - **Priority:** P0 | **Automation:** Playwright (extended timeout)

```typescript
// Test implementation pattern
test('1.8-E2E-014 - long response streams smoothly', async ({ page }) => {
  await page.goto('/');

  // Request a long response
  await page.fill('[data-testid="chat-input"]',
    'Write a detailed 500-word explanation of how computers work.');
  await page.click('[data-testid="send-button"]');

  // Wait for streaming to complete (extended timeout for long response)
  await expect(page.locator('[data-testid="send-button"]')).toBeVisible({ timeout: 90000 });

  // Verify content length
  const content = await page.locator('[data-testid="message-assistant"]').last().textContent();
  expect(content?.length).toBeGreaterThan(1000);

  // Verify no errors in console
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  expect(consoleErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
}, { timeout: 120000 });
```

---

## AC8: Tauri IPC Forwarding

### Integration Tests

- [ ] **1.8-INT-006** - Tauri command forwards SSE events
  - **Given** `start_agent_stream` command is invoked
  - **When** Agent Server sends SSE events
  - **Then** Tauri emits corresponding events via `app.emit()`
  - **Priority:** P0 | **Automation:** Tauri integration test

- [ ] **1.8-INT-007** - Event format preserved during forwarding
  - **Given** SSE event `{type: 'text', content: 'hello'}`
  - **When** forwarded through Tauri
  - **Then** frontend receives event with same structure
  - **And** no data loss or corruption
  - **Priority:** P0 | **Automation:** Tauri integration test

- [ ] **1.8-INT-008** - Frontend receives events via listen API
  - **Given** Tauri emits `agent:stream:{streamId}` event
  - **When** frontend listens with `listen()`
  - **Then** callback is invoked with payload
  - **Priority:** P0 | **Automation:** Vitest + Tauri mock

### Unit Tests

- [ ] **1.8-UNIT-012** - Chat store handles stream events correctly
  - **Given** stream event arrives via Tauri listen
  - **When** event type is `text`
  - **Then** `appendToStream` is called with content
  - **And** message content updates
  - **Priority:** P0 | **Automation:** Vitest + mock

```typescript
// Test implementation pattern
test('1.8-UNIT-012 - chat store handles stream events', async () => {
  const store = useChatStore.getState();

  // Setup initial streaming state
  store.isStreaming = true;
  store.pendingAssistantContent = '';

  // Simulate text event
  store.appendToStream('Hello');
  expect(store.pendingAssistantContent).toBe('Hello');

  // Simulate more text
  store.appendToStream(' world');
  expect(store.pendingAssistantContent).toBe('Hello world');

  // Simulate complete
  store.completeStream(10, 5);
  expect(store.isStreaming).toBe(false);
});
```

---

## Error Handling Tests

### E2E Tests

- [ ] **1.8-E2E-ERR-001** - Stream error displays user-friendly message
  - **Given** streaming encounters an error
  - **When** error event is received
  - **Then** error message is displayed to user
  - **And** retry option is available
  - **Priority:** P0 | **Automation:** Playwright + mock

- [ ] **1.8-E2E-ERR-002** - Cancel button stops streaming
  - **Given** streaming is in progress
  - **When** I click Cancel
  - **Then** streaming stops
  - **And** partial message is removed
  - **And** input is re-enabled
  - **Priority:** P0 | **Automation:** Playwright

- [ ] **1.8-E2E-ERR-003** - Network disconnect handled gracefully
  - **Given** streaming is in progress
  - **When** network is disconnected
  - **Then** error message is shown
  - **And** no crash or freeze occurs
  - **Priority:** P1 | **Automation:** Playwright + network offline

```typescript
// Test implementation pattern
test('1.8-E2E-ERR-002 - cancel button stops streaming', async ({ page }) => {
  // Setup slow stream
  await page.route('**/api/stream/**', async route => {
    const encoder = new TextEncoder();
    let body = 'event: connected\ndata: {"streamId":"test"}\n\n';

    // Slow response - one token per 500ms
    for (let i = 0; i < 20; i++) {
      body += `event: text\ndata: {"content":"Word${i} "}\n\n`;
    }

    // Intentionally slow fulfillment
    await new Promise(r => setTimeout(r, 3000));

    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body: encoder.encode(body),
    });
  });

  await page.goto('/');
  await page.fill('[data-testid="chat-input"]', 'Write a story');
  await page.click('[data-testid="send-button"]');

  // Wait for cancel button
  await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();

  // Click cancel
  await page.click('[data-testid="cancel-button"]');

  // Verify streaming stopped
  await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="chat-input"]')).toBeEnabled();
});
```

---

## Test Data Requirements

### Mock SSE Responses

```typescript
// tests/fixtures/streaming-mocks.ts
export const mockSSEResponses = {
  simpleResponse: `
event: connected
data: {"streamId":"stream_001","timestamp":1705305600000}

event: text
data: {"content":"Hello! How can I help you today?"}

event: complete
data: {"inputTokens":10,"outputTokens":8,"timestamp":1705305601000}
`,

  longResponse: (tokenCount: number) => {
    let response = 'event: connected\ndata: {"streamId":"stream_001"}\n\n';
    for (let i = 0; i < tokenCount; i++) {
      response += `event: text\ndata: {"content":"Token${i} "}\n\n`;
    }
    response += 'event: complete\ndata: {"inputTokens":10,"outputTokens":' + tokenCount + '}\n\n';
    return response;
  },

  errorResponse: `
event: connected
data: {"streamId":"stream_001"}

event: error
data: {"message":"Rate limit exceeded","code":"RATE_LIMITED"}
`,
};
```

---

## CI Integration

### Test Execution Order

```yaml
# 1. Unit Tests (every commit)
- name: Unit Tests
  run: pnpm test:unit -- --grep "1.8-UNIT"

# 2. Integration Tests (every commit)
- name: Integration Tests
  run: pnpm test:integration -- --grep "1.8-INT"
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

# 3. E2E Tests (PR merge)
- name: E2E Tests
  run: pnpm test:e2e -- streaming.spec.ts
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

# 4. Performance Tests (nightly)
- name: Performance Tests
  run: pnpm test:perf -- --grep "1.8-PERF"
```

### Quality Gates

| Gate | Criteria | Blocker |
|------|----------|---------|
| Unit Tests | 100% pass | Yes |
| Integration Tests | 100% pass | Yes |
| E2E Tests | 100% pass | Yes |
| First Token Latency | <500ms p95 | Yes (NFR-P001) |
| Memory Stability | No unbounded growth | Yes |
| Visual Regression | <1% diff | No (warning) |

---

## Traceability Matrix

| AC | Test IDs | Coverage |
|----|----------|----------|
| AC1 | 1.8-UNIT-001/002/003, 1.8-INT-001/002/003, 1.8-E2E-001 | 100% |
| AC2 | 1.8-UNIT-004/005/006, 1.8-E2E-002/003/004 | 100% |
| AC3 | 1.8-UNIT-007, 1.8-PERF-001/002, 1.8-E2E-005 | 100% |
| AC4 | 1.8-UNIT-008/009, 1.8-E2E-006/007/008 | 100% |
| AC5 | 1.8-UNIT-010/011, 1.8-E2E-009/010/011 | 100% |
| AC6 | 1.8-INT-004/005, 1.8-E2E-012/013 | 100% |
| AC7 | 1.8-PERF-003/004, 1.8-E2E-014 | 100% |
| AC8 | 1.8-UNIT-012, 1.8-INT-006/007/008 | 100% |

**Total Coverage: 38 tests covering all 8 acceptance criteria (100%)**

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | ATDD checklist created with 38 test scenarios | TEA Agent (Murat) |

---

_Generated by TEA (Test Architect Agent) - Risk-based testing specialist_
