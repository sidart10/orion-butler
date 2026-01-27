# Story 0.4: k6 Baseline Script with SLO Thresholds

Status: done

## Story

As a **developer**,
I want k6 load test baseline scripts with SLO thresholds defined,
So that I can validate NFR-1.1 (first token latency) before Epic 1 completion.

## Acceptance Criteria

1. **Given** k6 is installed and configured
   **When** I run `k6 run tests/performance/baseline.k6.js`
   **Then** the test validates p95 first_token_latency < 500ms

2. **Given** load test runs
   **When** any SLO threshold is exceeded
   **Then** the test fails with clear threshold violation message

## Tasks / Subtasks

- [x] Install and configure k6 (AC: #1)
  - [x] Document k6 installation (brew install k6)
  - [x] Create `tests/performance/` directory
- [x] Create baseline load test script (AC: #1, #2)
  - [x] Create `tests/performance/baseline.k6.js`
  - [x] Implement first_token_latency metric
  - [x] Implement tool_invocation metric
  - [x] Implement error_rate metric
- [x] Define SLO thresholds (AC: #2)
  - [x] `first_token_latency`: p95 < 500ms
  - [x] `tool_invocation`: p95 < 2000ms
  - [x] `errors`: rate < 0.01
- [x] Create mock server target (AC: #1)
  - [x] Create `tests/performance/mock-server.ts`
  - [x] Reuse MSW handlers from Story 0.1 where applicable
  - [x] Expose endpoint: `POST /v1/messages` (Claude API compatible)
  - [x] Simulate streaming: 50 tokens at 20ms intervals (≈1000ms total)
  - [x] First token at 100ms (well under 500ms SLO)
  - [x] Tool call responses: 500ms latency (under 2000ms SLO)
  - [x] Error injection: 0.5% random failures (under 1% SLO)
- [x] Create k6 test scenarios (AC: #1, #2)
  - [x] `simple_query`: Text-only response (measures first_token_latency)
  - [x] `tool_call`: Response with tool use (measures tool_invocation)
  - [x] `error_injection`: Invalid requests (measures error_rate)
- [x] Document usage (AC: #1, #2)
  - [x] Create `tests/performance/README.md`
  - [x] Document mock server startup
  - [x] Document scenario selection

**Dependency:** Story 0.1 (MSW) should complete first for handler reuse

## Dev Notes

### Technical Requirements
- Install k6 (via brew or download)
- Create `tests/performance/baseline.k6.js`
- Define thresholds: `first_token_latency p95<500`, `tool_invocation p95<2000`, `errors rate<0.01`
- Create mock server target for baseline testing
- Document in `tests/performance/README.md`

### k6 Threshold Configuration
```javascript
export const options = {
  scenarios: {
    simple_query: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      tags: { scenario: 'simple_query' },
    },
    tool_call: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '30s',
      tags: { scenario: 'tool_call' },
    },
  },
  thresholds: {
    'first_token_latency': ['p(95)<500'],
    'first_token_latency{scenario:simple_query}': ['p(95)<500'],
    'tool_invocation': ['p(95)<2000'],
    'tool_invocation{scenario:tool_call}': ['p(95)<2000'],
    'errors': ['rate<0.01'],
  },
};
```

### Mock Server Specification

Create `tests/performance/mock-server.ts`:

```typescript
import { createServer } from 'http';

const FIRST_TOKEN_DELAY = 100;  // ms - well under 500ms SLO
const TOKEN_INTERVAL = 20;      // ms between tokens
const TOKENS_PER_RESPONSE = 50; // ~1000ms total response
const TOOL_CALL_DELAY = 500;    // ms - under 2000ms SLO
const ERROR_RATE = 0.005;       // 0.5% - under 1% SLO

export function startMockServer(port = 3456) {
  return createServer(async (req, res) => {
    // Random error injection
    if (Math.random() < ERROR_RATE) {
      res.writeHead(500);
      return res.end(JSON.stringify({ error: 'Simulated failure' }));
    }

    // Simulate streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    });

    // First token delay
    await sleep(FIRST_TOKEN_DELAY);
    res.write(`data: {"type":"content_block_start"}\n\n`);

    // Stream tokens
    for (let i = 0; i < TOKENS_PER_RESPONSE; i++) {
      await sleep(TOKEN_INTERVAL);
      res.write(`data: {"type":"content_block_delta","delta":{"text":"token "}}\n\n`);
    }

    res.end();
  }).listen(port);
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
```

### NFRs Validated
- NFR-1.1: First token latency p95 < 500ms
- NFR-1.3: Composio tool call < 2s
- NFR-2.4: Error rate < 1%

### Project Structure Notes
- k6 scripts in `tests/performance/`
- Mock server can reuse MSW from Story 0.1

### References
- [Source: thoughts/planning-artifacts/test-design-system.md#4.1]
- [Source: thoughts/planning-artifacts/nfr-extracted-from-prd-v2.md#NFR-1.1]
- [k6 Documentation: https://k6.io/docs/]

## Dev Agent Record

### Agent Model Used
claude-opus-4-5-20250514

### Completion Notes List

1. **Mock Server Implementation (tests/performance/mock-server.ts)**
   - Created Claude API-compatible mock server with SSE streaming
   - Implements configurable timing: FIRST_TOKEN_DELAY=100ms, TOOL_CALL_DELAY=500ms
   - Error injection at 0.5% rate (under 1% SLO)
   - Supports `simple_query` and `tool_call` scenarios
   - Exports `createMockServer()` for programmatic use and `mockServerConfig` for testing
   - Full SSE event format matching Claude API (message_start, content_block_start/delta/stop, message_stop)

2. **k6 Baseline Script (tests/performance/baseline.k6.js)**
   - Implements three test scenarios: simple_query, tool_call, error_injection
   - Custom metrics: first_token_latency, tool_invocation, errors (rate)
   - SLO thresholds configured per NFR requirements
   - Setup/teardown functions for mock server connectivity verification
   - SSE response parsing for metric extraction

3. **Documentation (tests/performance/README.md)**
   - k6 installation instructions for macOS, Linux, Windows
   - Quick start guide with mock server and test commands
   - Scenario documentation with timing characteristics
   - CI/CD integration example with GitHub Actions
   - Troubleshooting section

4. **Unit Tests (tests/unit/performance/mock-server.spec.ts)**
   - 16 tests covering configuration, HTTP endpoints, streaming format, scenarios, error injection, timing
   - All tests passing

5. **npm Scripts Added**
   - `test:perf:server`: Start mock server
   - `test:perf`: Run k6 load tests

### File List

**New Files:**
- tests/performance/mock-server.ts
- tests/performance/baseline.k6.js
- tests/performance/README.md
- tests/unit/performance/mock-server.spec.ts

**Modified Files:**
- package.json (added test:perf:server and test:perf scripts)

### Change Log
- 2026-01-24: Story 0.4 implementation complete - k6 baseline SLO thresholds
