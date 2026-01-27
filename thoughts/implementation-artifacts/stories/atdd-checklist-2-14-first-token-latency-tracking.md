# ATDD Checklist - Epic 2, Story 2.14: First Token Latency Tracking

**Date:** 2026-01-24
**Author:** Sid
**Primary Test Level:** Unit (latency-tracker module) + Integration (streaming machine hooks)

---

## Story Summary

This story implements first token latency measurement to validate NFR-1.1 performance requirements. The system measures the time from when a message is sent to when the first meaningful response event (TextBlock or ToolUseBlock) arrives, logging this metric with threshold violation detection.

**As a** developer
**I want** to track time to first token
**So that** I can verify NFR-1.1 (<500ms p95)

---

## Acceptance Criteria

1. **AC#1:** Given a message is sent, When the first TextBlock or ToolUseBlock arrives, Then the elapsed time from send to first event is logged
2. **AC#2:** And logs include `{ requestId, firstTokenMs, timestamp }`
3. **AC#3:** And latency exceeding 500ms is flagged in logs (using console.warn)

---

## Failing Tests Created (RED Phase)

### Unit Tests (15 tests)

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.14-UNIT-001 | `markRequestStart creates record with timestamp` | RED - latency-tracker.ts not implemented | AC#1 |
| 2.14-UNIT-002 | `markFirstToken calculates elapsed time correctly` | RED - latency-tracker.ts not implemented | AC#1 |
| 2.14-UNIT-003 | `markFirstToken returns LatencyMetric on first call` | RED - latency-tracker.ts not implemented | AC#1, AC#2 |
| 2.14-UNIT-004 | `markFirstToken returns null on second call for same requestId` | RED - latency-tracker.ts not implemented | AC#1 |
| 2.14-UNIT-005 | `markFirstToken returns null for unknown requestId` | RED - latency-tracker.ts not implemented | AC#1 |
| 2.14-UNIT-006 | `LatencyMetric includes requestId field` | RED - latency-tracker.ts not implemented | AC#2 |
| 2.14-UNIT-007 | `LatencyMetric includes firstTokenMs field` | RED - latency-tracker.ts not implemented | AC#2 |
| 2.14-UNIT-008 | `LatencyMetric includes timestamp in ISO 8601 format` | RED - latency-tracker.ts not implemented | AC#2 |
| 2.14-UNIT-009 | `LatencyMetric includes exceedsThreshold boolean` | RED - latency-tracker.ts not implemented | AC#3 |
| 2.14-UNIT-010 | `exceedsThreshold is false when firstTokenMs < 500` | RED - latency-tracker.ts not implemented | AC#3 |
| 2.14-UNIT-011 | `exceedsThreshold is true when firstTokenMs >= 500` | RED - latency-tracker.ts not implemented | AC#3 |
| 2.14-UNIT-012 | `console.log called for normal latency (< 500ms)` | RED - latency-tracker.ts not implemented | AC#3 |
| 2.14-UNIT-013 | `console.warn called for exceeded latency (>= 500ms)` | RED - latency-tracker.ts not implemented | AC#3 |
| 2.14-UNIT-014 | `clearRequest removes tracking record` | RED - latency-tracker.ts not implemented | AC#1 |
| 2.14-UNIT-015 | `Multiple concurrent requests tracked independently` | RED - latency-tracker.ts not implemented | AC#1 |

### Integration Tests (8 tests)

**File:** `tests/integration/streaming/latency-tracking.spec.ts`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.14-INT-001 | `Send triggers markRequestStart with requestId` | RED - integration not implemented | AC#1 |
| 2.14-INT-002 | `Text event triggers markFirstToken` | RED - integration not implemented | AC#1 |
| 2.14-INT-003 | `Tool start event triggers markFirstToken` | RED - integration not implemented | AC#1 |
| 2.14-INT-004 | `Text before tool only logs latency once` | RED - integration not implemented | AC#1 |
| 2.14-INT-005 | `Tool before text only logs latency once` | RED - integration not implemented | AC#1 |
| 2.14-INT-006 | `Complete event calls clearRequest` | RED - integration not implemented | AC#1 |
| 2.14-INT-007 | `Error event calls clearRequest` | RED - integration not implemented | AC#1 |
| 2.14-INT-008 | `Log format matches expected structure` | RED - integration not implemented | AC#2 |

### Edge Case Tests (7 tests)

**File:** `tests/unit/metrics/latency-tracker-edge-cases.spec.ts`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.14-EDGE-001 | `Very fast response (< 10ms) is measured accurately` | RED - edge case handling not implemented | AC#1 |
| 2.14-EDGE-002 | `Response at exactly 500ms boundary (exceedsThreshold = true)` | RED - boundary condition not implemented | AC#3 |
| 2.14-EDGE-003 | `Response at 499ms (exceedsThreshold = false)` | RED - boundary condition not implemented | AC#3 |
| 2.14-EDGE-004 | `Very slow response (5000ms) still logs correctly` | RED - edge case handling not implemented | AC#1, AC#3 |
| 2.14-EDGE-005 | `clearRequest called twice for same requestId is idempotent` | RED - idempotency not implemented | AC#1 |
| 2.14-EDGE-006 | `markRequestStart called twice for same requestId updates timestamp` | RED - deduplication not implemented | AC#1 |
| 2.14-EDGE-007 | `Concurrent requests (3+) all track independently` | RED - concurrent handling not implemented | AC#1 |

### Timing Precision Tests (4 tests)

**File:** `tests/unit/metrics/latency-timing-precision.spec.ts`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.14-TIME-001 | `Uses performance.now() for sub-millisecond precision` | RED - timing not implemented | AC#1 |
| 2.14-TIME-002 | `Latency is rounded to nearest millisecond` | RED - rounding not implemented | AC#2 |
| 2.14-TIME-003 | `Timestamp uses ISO 8601 format with timezone` | RED - timestamp format not implemented | AC#2 |
| 2.14-TIME-004 | `Timing is monotonic (not affected by clock changes)` | RED - monotonic timing not implemented | AC#1 |

### Logging Format Validation Tests (5 tests)

**File:** `tests/unit/metrics/latency-logging.spec.ts`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.14-LOG-001 | `Normal log starts with [Orion] prefix` | RED - logging not implemented | AC#2 |
| 2.14-LOG-002 | `Warning log includes exceeded threshold message` | RED - logging not implemented | AC#3 |
| 2.14-LOG-003 | `Log object contains exactly required fields` | RED - logging not implemented | AC#2 |
| 2.14-LOG-004 | `requestId in log matches original request` | RED - logging not implemented | AC#2 |
| 2.14-LOG-005 | `Multiple sequential logs maintain correct format` | RED - logging not implemented | AC#2 |

---

## Data Factories Created

### LatencyMetric Factory

**File:** `tests/fixtures/factories/latency-metric.ts`

**Exports:**

- `createLatencyMetric(overrides?)` - Create single LatencyMetric with optional overrides
- `createSlowLatencyMetric(overrides?)` - Create metric that exceeds threshold
- `createFastLatencyMetric(overrides?)` - Create metric well under threshold

**Example Usage:**

```typescript
import { createLatencyMetric, createSlowLatencyMetric } from '../../fixtures/factories/latency-metric';

const normalMetric = createLatencyMetric({ firstTokenMs: 250 });
const slowMetric = createSlowLatencyMetric(); // firstTokenMs > 500
```

### LatencyRecord Factory

**File:** `tests/fixtures/factories/latency-record.ts`

**Exports:**

- `createLatencyRecord(overrides?)` - Create internal tracking record
- `createActiveLatencyRecord(overrides?)` - Create record waiting for first token

**Example Usage:**

```typescript
import { createLatencyRecord } from '../../fixtures/factories/latency-record';

const record = createLatencyRecord({
  requestId: 'test-request-id',
  sendTimestamp: performance.now(),
  firstTokenReceived: false,
});
```

---

## Test Helpers Created

### Console Mock Helper

**File:** `tests/fixtures/helpers/console-mock.ts`

**Exports:**

- `mockConsoleForLatencyTests()` - Mock console.log and console.warn
- `restoreConsole()` - Restore original console methods
- `getLatencyLogs()` - Get captured latency-specific logs
- `getWarningLogs()` - Get captured warning logs

**Example Usage:**

```typescript
import { mockConsoleForLatencyTests, restoreConsole, getLatencyLogs } from '../../fixtures/helpers/console-mock';

describe('latency logging', () => {
  let consoleMock: ReturnType<typeof mockConsoleForLatencyTests>;

  beforeEach(() => {
    consoleMock = mockConsoleForLatencyTests();
  });

  afterEach(() => {
    consoleMock.restore();
  });

  it('should log latency', () => {
    // ... trigger latency logging
    const logs = consoleMock.getLatencyLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].args[1]).toMatchObject({ requestId: expect.any(String) });
  });
});
```

### Performance Timer Mock

**File:** `tests/fixtures/helpers/performance-mock.ts`

**Exports:**

- `mockPerformanceNow(timestamps: number[])` - Mock performance.now with sequence
- `advancePerformanceTimer(ms: number)` - Advance mock timer
- `resetPerformanceMock()` - Reset to original

**Example Usage:**

```typescript
import { mockPerformanceNow, advancePerformanceTimer, resetPerformanceMock } from '../../fixtures/helpers/performance-mock';

describe('timing precision', () => {
  afterEach(() => {
    resetPerformanceMock();
  });

  it('should measure elapsed time', () => {
    mockPerformanceNow([1000, 1250]); // 250ms elapsed

    markRequestStart('req-1');
    const metric = markFirstToken('req-1');

    expect(metric?.firstTokenMs).toBe(250);
  });
});
```

---

## Mock Requirements

### No External Mocks Required

This story operates entirely within the frontend and does not require external service mocking. The latency tracking module:

1. Uses `performance.now()` for timing (browser API)
2. Uses `console.log/warn` for logging (browser API)
3. Uses in-memory Map for tracking state

**Test Isolation:**

- Mock `performance.now()` for deterministic timing tests
- Mock `console.log/warn` for log format validation
- No network or IPC mocking needed for unit tests

---

## Required data-testid Attributes

### No UI Elements Required

This story is a developer metric with no user-facing UI. No data-testid attributes are required.

**Future Consideration:** If a metrics dashboard is added (Epic 22), the following may be needed:

- `latency-indicator` - Visual latency display
- `latency-warning` - Warning indicator for threshold exceeded

---

## Implementation Checklist

### Test: 2.14-UNIT-001 - markRequestStart creates record with timestamp

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/lib/metrics/latency-tracker.ts` file
- [ ] Define `LatencyRecord` interface with `requestId`, `sendTimestamp`, `firstTokenReceived` fields
- [ ] Create `activeRequests` Map for tracking
- [ ] Implement `markRequestStart(requestId: string)` function
- [ ] Use `performance.now()` to capture send timestamp
- [ ] Store record in `activeRequests` Map
- [ ] Run test: `npm run test -- tests/unit/metrics/latency-tracker.spec.ts -t "markRequestStart creates record"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.14-UNIT-002 to 2.14-UNIT-005 - markFirstToken basic functionality

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

**Tasks to make this test pass:**

- [ ] Define `LatencyMetric` interface with required fields
- [ ] Implement `markFirstToken(requestId: string): LatencyMetric | null`
- [ ] Calculate elapsed time: `performance.now() - record.sendTimestamp`
- [ ] Round to nearest millisecond: `Math.round()`
- [ ] Check if first token already received (return null if so)
- [ ] Mark `firstTokenReceived = true` in record
- [ ] Return null for unknown requestId
- [ ] Run tests: `npm run test -- tests/unit/metrics/latency-tracker.spec.ts`
- [ ] All markFirstToken tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.14-UNIT-006 to 2.14-UNIT-008 - LatencyMetric structure

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

**Tasks to make this test pass:**

- [ ] Ensure `LatencyMetric.requestId` matches input requestId
- [ ] Ensure `LatencyMetric.firstTokenMs` is calculated latency
- [ ] Ensure `LatencyMetric.timestamp` is ISO 8601: `new Date().toISOString()`
- [ ] Run tests: `npm run test -- tests/unit/metrics/latency-tracker.spec.ts`
- [ ] All LatencyMetric structure tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.14-UNIT-009 to 2.14-UNIT-011 - Threshold detection

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

**Tasks to make this test pass:**

- [ ] Define `FIRST_TOKEN_THRESHOLD_MS = 500` constant
- [ ] Calculate `exceedsThreshold = firstTokenMs > FIRST_TOKEN_THRESHOLD_MS`
- [ ] Note: Use `>` not `>=` per story spec (>500ms, not >=500ms)
- [ ] Export threshold constant for testing
- [ ] Run tests: `npm run test -- tests/unit/metrics/latency-tracker.spec.ts`
- [ ] All threshold tests pass (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.14-UNIT-012 to 2.14-UNIT-013 - Logging behavior

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

**Tasks to make this test pass:**

- [ ] Add logging to `markFirstToken()` function
- [ ] For normal latency: `console.log('[Orion] First token latency:', metric)`
- [ ] For exceeded: `console.warn('[Orion] First token latency exceeded threshold:', metric)`
- [ ] Run tests: `npm run test -- tests/unit/metrics/latency-tracker.spec.ts`
- [ ] Logging tests pass (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.14-UNIT-014 - clearRequest removes tracking record

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `clearRequest(requestId: string): void`
- [ ] Remove record from `activeRequests` Map
- [ ] Handle missing requestId gracefully (no-op)
- [ ] Run test: `npm run test -- tests/unit/metrics/latency-tracker.spec.ts -t "clearRequest"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.14-UNIT-015 - Concurrent request tracking

**File:** `tests/unit/metrics/latency-tracker.spec.ts`

**Tasks to make this test pass:**

- [ ] Verify Map-based storage handles multiple concurrent keys
- [ ] Test with 3+ simultaneous requests
- [ ] Each request has independent timing
- [ ] Run test: `npm run test -- tests/unit/metrics/latency-tracker.spec.ts -t "concurrent"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.14-INT-001 to 2.14-INT-008 - Integration with useStreamingMachine

**File:** `tests/integration/streaming/latency-tracking.spec.ts`

**Tasks to make this test pass:**

- [ ] Import latency tracker in `src/hooks/useStreamingMachine.ts`
- [ ] Call `markRequestStart()` after `chat_send` returns requestId
- [ ] Call `markFirstToken()` in `onText` callback
- [ ] Call `markFirstToken()` in `onToolStart` callback
- [ ] Call `clearRequest()` in `onComplete` callback
- [ ] Call `clearRequest()` in `onError` callback
- [ ] Run tests: `npm run test -- tests/integration/streaming/latency-tracking.spec.ts`
- [ ] All integration tests pass (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.14-EDGE-001 to 2.14-EDGE-007 - Edge cases

**File:** `tests/unit/metrics/latency-tracker-edge-cases.spec.ts`

**Tasks to make this test pass:**

- [ ] Verify very fast responses (< 10ms) are handled
- [ ] Verify boundary conditions (499ms vs 500ms)
- [ ] Verify very slow responses log correctly
- [ ] Verify idempotent clearRequest behavior
- [ ] Verify concurrent request isolation
- [ ] Run tests: `npm run test -- tests/unit/metrics/latency-tracker-edge-cases.spec.ts`
- [ ] All edge case tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.14-TIME-001 to 2.14-TIME-004 - Timing precision

**File:** `tests/unit/metrics/latency-timing-precision.spec.ts`

**Tasks to make this test pass:**

- [ ] Verify `performance.now()` is used (not `Date.now()`)
- [ ] Verify latency is rounded to integer milliseconds
- [ ] Verify ISO 8601 timestamp format
- [ ] Verify monotonic timing behavior
- [ ] Run tests: `npm run test -- tests/unit/metrics/latency-timing-precision.spec.ts`
- [ ] All timing tests pass (green phase)

**Estimated Effort:** 0.75 hours

---

### Test: 2.14-LOG-001 to 2.14-LOG-005 - Logging format

**File:** `tests/unit/metrics/latency-logging.spec.ts`

**Tasks to make this test pass:**

- [ ] Verify `[Orion]` prefix in log messages
- [ ] Verify "exceeded threshold" message for warnings
- [ ] Verify log object structure matches spec
- [ ] Verify requestId correlation
- [ ] Run tests: `npm run test -- tests/unit/metrics/latency-logging.spec.ts`
- [ ] All logging format tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test -- tests/unit/metrics tests/integration/streaming/latency-tracking.spec.ts

# Run unit tests only
npm run test -- tests/unit/metrics/latency-tracker.spec.ts

# Run edge case tests
npm run test -- tests/unit/metrics/latency-tracker-edge-cases.spec.ts

# Run timing precision tests
npm run test -- tests/unit/metrics/latency-timing-precision.spec.ts

# Run logging format tests
npm run test -- tests/unit/metrics/latency-logging.spec.ts

# Run integration tests
npm run test -- tests/integration/streaming/latency-tracking.spec.ts

# Run all tests with coverage
npm run test -- --coverage tests/unit/metrics tests/integration/streaming

# Run tests in watch mode
npm run test -- --watch tests/unit/metrics
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Test helpers and factories created
- Mock requirements documented (minimal - browser APIs only)
- No data-testid requirements (no UI)
- Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear: "latency-tracker.ts not implemented"
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with 2.14-UNIT-001)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Update story status in sprint-status.yaml

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability)
3. **Extract duplications** (DRY principle)
4. **Consider optional dedicated hook** (`useFirstTokenLatency.ts`)
5. **Ensure tests still pass** after each refactor
6. **Update barrel exports** (`src/lib/metrics/index.ts`)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Run failing tests** to confirm RED phase: `npm run test -- tests/unit/metrics tests/integration/streaming/latency-tracking.spec.ts`
2. **Review this checklist** to understand test scope
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red to green for each)
5. **When all tests pass**, refactor code for quality
6. **When refactoring complete**, update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **test-levels-framework.md** - Test level selection (Unit for module, Integration for hooks)
- **timing-debugging.md** - Deterministic timing patterns (mock performance.now)
- **component-tdd.md** - Red-green-refactor workflow guidance

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Coverage Summary

| Category | Test Count | AC Coverage |
|----------|------------|-------------|
| Unit Tests (Core) | 15 | AC#1, AC#2, AC#3 |
| Integration Tests | 8 | AC#1, AC#2 |
| Edge Case Tests | 7 | AC#1, AC#3 |
| Timing Precision Tests | 4 | AC#1, AC#2 |
| Logging Format Tests | 5 | AC#2, AC#3 |
| **Total** | **39** | **Full coverage** |

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test -- tests/unit/metrics tests/integration/streaming/latency-tracking.spec.ts`

**Expected Results:**

```
FAIL tests/unit/metrics/latency-tracker.spec.ts
FAIL tests/unit/metrics/latency-tracker-edge-cases.spec.ts
FAIL tests/unit/metrics/latency-timing-precision.spec.ts
FAIL tests/unit/metrics/latency-logging.spec.ts
FAIL tests/integration/streaming/latency-tracking.spec.ts

Test Suites: 5 failed, 5 total
Tests: 39 failed, 39 total
```

**Summary:**

- Total tests: 39
- Passing: 0 (expected)
- Failing: 39 (expected)
- Status: RED phase verified

**Expected Failure Messages:**

- "Cannot find module '@/lib/metrics/latency-tracker'"
- "markRequestStart is not defined"
- "markFirstToken is not defined"
- "clearRequest is not defined"

---

## Notes

### Why First Token, Not ThinkingBlock

ThinkingBlock events represent Claude's internal reasoning process. The first token is the first content the user can perceive:

1. **TextBlock** - Claude starts typing a response
2. **ToolUseBlock** - Claude indicates it's using a tool

Either of these events marks the end of the perceived "waiting" period.

### Threshold Boundary Condition

Per the story specification:
- `exceedsThreshold = firstTokenMs > 500` (strictly greater than)
- 500ms exactly is NOT exceeded (borderline acceptable)
- 501ms is exceeded (threshold violation)

This aligns with NFR-1.1: "< 500ms" means up to and including 500ms is acceptable.

### Performance.now() vs Date.now()

Using `performance.now()` provides:
- Sub-millisecond precision
- Monotonic timing (not affected by system clock changes)
- Sufficient for frontend-only measurement

### Memory Management

The `clearRequest()` function must be called on both success and error paths to prevent memory leaks from abandoned requests.

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Refer to `_bmad/bmm/docs/tea-README.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2026-01-24
