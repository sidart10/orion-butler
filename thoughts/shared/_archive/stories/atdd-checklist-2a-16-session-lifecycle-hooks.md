# ATDD Checklist - Epic 2a, Story 2a.16: Session Lifecycle Hooks

**Date:** 2026-01-16
**Author:** Murat (TEA)
**Primary Test Level:** Integration (hooks are infrastructure, require database)
**Status:** RED Phase - Tests Written, Awaiting Implementation

---

## Story Summary

Implement session lifecycle hooks that maintain continuity across conversations. Hooks fire on SessionStart and Stop events to register sessions in PostgreSQL, load previous context, detect open threads, and persist session outcomes.

**As a** user
**I want** session hooks to maintain continuity across conversations
**So that** Orion remembers context from previous sessions

---

## Acceptance Criteria

1. **AC1: Session Registration on Start** - SessionStart fires `session-register` to register in PostgreSQL, `session-start-continuity` loads previous context, active projects and recent contacts injected
2. **AC2: Session End and Cleanup** - Stop event fires `session-end-cleanup` to save session summary, flush learnings, mark session complete
3. **AC3: Session Continuity and Open Threads** - Continuity hook detects open threads from abandoned sessions, offers to resume previous work
4. **AC4: Session Symbol Index** - `session-symbol-index` hook runs asynchronously to index project state for code navigation
5. **AC5: Session Outcome Recording** - `session-outcome` hook records session result (completed/abandoned/error/handoff)

---

## Failing Tests Created (RED Phase)

**File Naming Convention:**
- Unit tests: `.test.ts` (e.g., `story-2.16-session-hooks.test.ts`)
- Integration tests: `.test.ts` (e.g., `story-2.16-session-lifecycle.test.ts`)
- E2E tests: `.spec.ts` (e.g., `story-2.16-session-continuity.spec.ts`)

This follows project conventions where `.test.ts` is used for Vitest unit/integration tests and `.spec.ts` is used for Playwright E2E tests.

### Unit Tests (8 tests)

**File:** `tests/unit/story-2.16-session-hooks.test.ts` (~250 lines)

- **Test:** 2.16.U1 - Session cleanup runs without errors
  - **Status:** RED - SessionEndHook not implemented
  - **Verifies:** Hook executes and returns valid response format

- **Test:** 2.16.U2 - Outcome enum validation
  - **Status:** RED - validateOutcome function not implemented
  - **Verifies:** Only valid outcomes (completed, abandoned, error, handoff) accepted

- **Test:** 2.16.U3 - Session ID generation format
  - **Status:** RED - generateSessionId not implemented
  - **Verifies:** Session IDs follow expected format (UUID v4)

- **Test:** 2.16.U4 - Context truncation respects token limits
  - **Status:** RED - truncateContext not implemented
  - **Verifies:** Context is truncated to ~2000 tokens when too large

- **Test:** 2.16.U5 - Graceful degradation on database failure
  - **Status:** RED - Error handling not implemented
  - **Verifies:** Hook returns allow with warning when PostgreSQL unavailable

- **Test:** 2.16.U6 - Symbol index runs asynchronously (non-blocking)
  - **Status:** RED - session-symbol-index.sh not implemented
  - **Verifies:** Index hook returns immediately, runs in background

- **Test:** 2.16.U7 - Active projects query builder returns correct SQL
  - **Status:** RED - buildActiveProjectsQuery not implemented
  - **Verifies:** Query includes active status filter, ORDER BY updated_at DESC, LIMIT 5
  - **Coverage:** AC1 project query logic in isolation before integration test

- **Test:** 2.16.U8 - Recent contacts query builder returns correct SQL
  - **Status:** RED - buildRecentContactsQuery not implemented
  - **Verifies:** Query includes 7-day recency filter, ORDER BY last_interaction_at DESC, LIMIT 10
  - **Coverage:** AC1 contact query logic in isolation before integration test

### Integration Tests (8 tests)

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts` (~350 lines)

- **Test:** 2.16.I1 - Session registers in PostgreSQL on start
  - **Status:** RED - SessionStartHook not implemented
  - **Verifies:** Session row created with id, project, last_heartbeat

- **Test:** 2.16.I2 - Previous session context is loaded
  - **Status:** RED - session_start_continuity.py not implemented
  - **Verifies:** Previous session's working_on field retrieved and returned as context

- **Test:** 2.16.I3 - Session outcome is recorded
  - **Status:** RED - session-outcome.sh not implemented
  - **Verifies:** Outcome field updated in sessions table

- **Test:** 2.16.I4 - Open threads are detected from abandoned sessions
  - **Status:** RED - Open thread detection not implemented
  - **Verifies:** Sessions with outcome=NULL or outcome='abandoned' flagged as open threads

- **Test:** 2.16.I5 - Recent learnings are included in context
  - **Status:** RED - Learnings query not implemented
  - **Verifies:** archival_memory entries from last 7 days included in additionalContext

- **Test:** 2.16.I6 - Active projects and contacts injected
  - **Status:** RED - SQLite queries not implemented
  - **Verifies:** Active projects (limit 5) and recent contacts (limit 10) in context

- **Test:** 2.16.I7 - Session end flushes in-memory learnings
  - **Status:** RED - Flush logic not implemented
  - **Verifies:** Pending learnings written to archival_memory on Stop

- **Test:** 2.16.I8 - Multiple SessionStart hooks execute in registration order
  - **Status:** RED - Hook orchestration not tested
  - **Verifies:** Hooks execute in settings.json array order: session-register (index 0) > session_start_continuity (index 1) > session-symbol-index (index 2). Order is determined by registration sequence in settings.json hooks array, NOT by timeout values.

### E2E Tests (4 tests)

**File:** `tests/e2e/story-2.16-session-continuity.spec.ts` (~180 lines)

- **Test:** 2.16.E1 - Open thread from yesterday surfaces on start
  - **Status:** RED - Full flow not implemented
  - **Verifies:** System message indicates previous incomplete work

- **Test:** 2.16.E2 - Context persists across session restart
  - **Status:** RED - Full flow not implemented
  - **Verifies:** Working context from session 1 appears in session 2

- **Test:** 2.16.E3 - Symbol index creates cache file
  - **Status:** RED - Index flow not implemented
  - **Verifies:** .claude/cache/symbol-index.json created after session start

- **Test:** 2.16.E4 - Symbol index fallback when tldr unavailable
  - **Status:** RED - Fallback not implemented
  - **Verifies:** When tldr CLI is not available, hook falls back to basic file list (per AC4 implementation pattern in story)
  - **Setup:** Mock tldr as unavailable via PATH manipulation
  - **Expected:** `.claude/cache/symbol-index.json` contains file list instead of structured symbols

---

## Data Factories Created

### Session Factory

**File:** `tests/support/factories/session.factory.ts`

**Exports:**

- `createSession(overrides?)` - Create single session with optional overrides
- `createSessions(count)` - Create array of sessions
- `createAbandonedSession(overrides?)` - Create session with outcome='abandoned' (open thread)
- `createCompletedSession(overrides?)` - Create session with outcome='completed'
- `createErrorSession(overrides?)` - Create session with outcome='error'
- `createHandoffSession(overrides?)` - Create session with outcome='handoff'

**All Outcome Enum Values Covered:**

| Factory Method | Outcome Value |
|----------------|---------------|
| `createCompletedSession` | `'completed'` |
| `createAbandonedSession` | `'abandoned'` |
| `createErrorSession` | `'error'` |
| `createHandoffSession` | `'handoff'` |

**Example Usage:**

```typescript
import {
  createSession,
  createAbandonedSession,
  createErrorSession,
  createHandoffSession
} from '@/tests/support/factories/session.factory';

const session = createSession({ project: '/test/orion', workingOn: 'Implementing triage' });
const openThread = createAbandonedSession({ project: '/test/orion' });
const errorSession = createErrorSession({ project: '/test/orion', summary: 'Hook timeout' });
const handoffSession = createHandoffSession({ project: '/test/orion', workingOn: 'Paused for user' });
```

### Learning Factory

**File:** `tests/support/factories/learning.factory.ts`

**Exports:**

- `createLearning(overrides?)` - Create single archival_memory entry
- `createLearnings(count)` - Create array of learnings
- `createRecentLearning(overrides?)` - Create learning from within 7 days

**Example Usage:**

```typescript
import { createLearning } from '@/tests/support/factories/learning.factory';

const learning = createLearning({
  content: 'User prefers morning meetings',
  projectPath: '/test/orion',
});
```

---

## Fixtures Created

### PostgreSQL Test Pool Fixture

**File:** `tests/support/fixtures/postgres.fixture.ts`

**Fixtures:**

- `testPgPool` - Provides isolated PostgreSQL connection pool for tests
  - **Setup:** Creates test database, runs schema setup SQL (see below)
  - **Provides:** pg Pool instance
  - **Cleanup:** Truncates tables, closes connection

**Schema Setup SQL (inline in fixture or from migration):**

```sql
-- Required tables for Story 2.16 tests
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    working_on TEXT,
    last_heartbeat TIMESTAMP DEFAULT NOW(),
    outcome TEXT,  -- completed | abandoned | error | handoff
    summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS archival_memory (
    id SERIAL PRIMARY KEY,
    session_id TEXT,
    project_path TEXT,
    content TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project);
CREATE INDEX IF NOT EXISTS idx_sessions_heartbeat ON sessions(last_heartbeat DESC);
CREATE INDEX IF NOT EXISTS idx_archival_memory_project ON archival_memory(project_path);
```

**Example Usage:**

```typescript
import { test } from '@/tests/support/fixtures/postgres.fixture';

test('should register session', async ({ testPgPool }) => {
  // testPgPool is ready with clean database and schema applied
});
```

### Session Hooks Fixture

**File:** `tests/support/fixtures/session-hooks.fixture.ts`

**Fixtures:**

- `sessionStartHook` - Pre-configured SessionStartHook with test pool
  - **Setup:** Instantiates hook with mocked dependencies
  - **Provides:** SessionStartHook instance
  - **Cleanup:** Clears session data

- `sessionEndHook` - Pre-configured SessionEndHook with test pool
  - **Setup:** Instantiates hook with mocked dependencies
  - **Provides:** SessionEndHook instance
  - **Cleanup:** None required

**Example Usage:**

```typescript
import { test } from '@/tests/support/fixtures/session-hooks.fixture';

test('should load context', async ({ sessionStartHook, testPgPool }) => {
  const result = await sessionStartHook.execute({ sessionId: 'test-001' });
  expect(result.additionalContext).toBeDefined();
});
```

---

## Mock Requirements

### PostgreSQL Mock (for unit tests without real DB)

**Approach:** Use pg-mock or vi.mock for unit tests

**Mock Responses:**

```typescript
// Session query mock
vi.mock('pg', () => ({
  Pool: vi.fn(() => ({
    query: vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 'prev-session', working_on: 'Triage', outcome: null }] })
      .mockResolvedValueOnce({ rows: [] }), // No learnings
  })),
}));
```

### SQLite Mock (for active projects/contacts)

**Mock Responses:**

```typescript
import { subDays, formatISO } from 'date-fns';

// Active projects mock
const projectsMock = [
  { id: 'proj_001', name: 'Q4 Campaign', status: 'active' },
  { id: 'proj_002', name: 'Product Launch', status: 'active' },
];

// Recent contacts mock - use dynamic relative dates to prevent staleness
const recentDate = formatISO(subDays(new Date(), 2), { representation: 'date' });
const contactsMock = [
  { id: 'cont_001', name: 'Alice Chen', email: 'alice@example.com', last_interaction_at: recentDate },
];
```

**Note:** Use relative dates (e.g., `subDays(new Date(), 2)`) instead of hardcoded dates like '2026-01-15' to prevent test data from becoming stale.

### TLDR CLI Mock (for symbol index)

**Mock Behavior:**

```bash
# Mock tldr structure output
echo '{"functions": [], "classes": []}'
```

---

## Required data-testid Attributes

### Chat Interface (for E2E tests)

- `system-context` - System message container showing injected context
- `chat-ready` - Indicator that session hooks have completed
- `chat-input` - Message input field
- `send-button` - Send message button
- `message-complete` - Indicator message streaming finished

### Implementation Example:

```tsx
<div data-testid="system-context" className="system-message">
  {sessionContext && (
    <pre>{sessionContext}</pre>
  )}
</div>
<div data-testid="chat-ready" data-loaded={hooksComplete} />
```

---

## Implementation Checklist

### Test: 2.16.U1 - Session cleanup runs without errors

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Create `.claude/hooks/session-end-cleanup.sh` script
- [ ] Implement payload parsing (stdin JSON)
- [ ] Implement working_on and summary persistence
- [ ] Return valid JSON response `{"permissionDecision": "allow"}`
- [ ] Set executable permissions `chmod +x`
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.16.U2 - Outcome enum validation

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/hooks/session/outcome-validator.ts`
- [ ] Implement `validateOutcome(outcome: string): boolean`
- [ ] Define valid enum: `completed`, `abandoned`, `error`, `handoff`
- [ ] Throw error for invalid outcomes
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.16.U3 - Session ID generation format

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/hooks/session/session-id.ts`
- [ ] Implement `generateSessionId(): string` using UUID v4
- [ ] Validate format in tests
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.16.U4 - Context truncation respects token limits

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/hooks/session/context-builder.ts`
- [ ] Implement `truncateContext(context: string, maxTokens?: number): string`
- [ ] Default max tokens to ~2000 (approximately 8000 chars)
- [ ] Prioritize most recent content when truncating
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.16.U5 - Graceful degradation on database failure

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Add try/catch in session hooks around database operations
- [ ] Return `{"permissionDecision": "allow", "message": "Database unavailable"}` on error
- [ ] Log error for debugging but don't block session start
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.16.U6 - Symbol index runs asynchronously

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Create `.claude/hooks/session-symbol-index.sh`
- [ ] Run indexing logic in background subshell `(...) &`
- [ ] Return immediately with `{"permissionDecision": "allow"}`
- [ ] Set executable permissions
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.16.U7 - Active projects query builder

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/hooks/session/query-builders.ts`
- [ ] Implement `buildActiveProjectsQuery(): string`
- [ ] Query must include: `status = 'active'`, `ORDER BY updated_at DESC`, `LIMIT 5`
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.16.U8 - Recent contacts query builder

**File:** `tests/unit/story-2.16-session-hooks.test.ts`

**Tasks to make this test pass:**

- [ ] Add to `agent-server/src/hooks/session/query-builders.ts`
- [ ] Implement `buildRecentContactsQuery(): string`
- [ ] Query must include: `last_interaction_at > datetime('now', '-7 days')`, `ORDER BY last_interaction_at DESC`, `LIMIT 10`
- [ ] Run test: `pnpm test:unit -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.16.I1 - Session registers in PostgreSQL on start

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Create `.claude/hooks/session-register.sh`
- [ ] Implement PostgreSQL INSERT with UPSERT logic
- [ ] Set CLAUDE_PROJECT_DIR and SESSION_ID from environment
- [ ] Read DATABASE_URL from environment (fallback to default)
- [ ] Register hook in `.claude/settings.json` under SessionStart
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.16.I2 - Previous session context is loaded

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Create `.claude/hooks/session_start_continuity.py`
- [ ] Query PostgreSQL for recent sessions in same project
- [ ] Build additionalContext with previous working_on
- [ ] Include timestamp for context freshness
- [ ] Return response with additionalContext field
- [ ] Register hook in `.claude/settings.json`
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.16.I3 - Session outcome is recorded

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Create `.claude/hooks/session-outcome.sh`
- [ ] Read outcome from stdin payload
- [ ] Validate outcome against enum
- [ ] Execute PostgreSQL UPDATE
- [ ] Register hook in `.claude/settings.json` under Stop
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.16.I4 - Open threads are detected

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Add open thread detection logic to `session_start_continuity.py`
- [ ] Query sessions with `outcome IS NULL OR outcome = 'abandoned'`
- [ ] Filter to same project, order by last_heartbeat DESC
- [ ] Include open thread info in additionalContext
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.16.I5 - Recent learnings included in context

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Add archival_memory query to `session_start_continuity.py`
- [ ] Filter learnings from last 7 days for same project
- [ ] Limit to 5 most recent, truncate content to 200 chars
- [ ] Include in additionalContext under "## Recent Learnings"
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.16.I6 - Active projects and contacts injected

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Add SQLite queries to `session_start_continuity.py`
- [ ] Query: `SELECT id, name, status FROM projects WHERE status = 'active' ORDER BY updated_at DESC LIMIT 5`
- [ ] Query: `SELECT id, name, email FROM contacts WHERE last_interaction_at > datetime('now', '-7 days') LIMIT 10`
- [ ] Format and include in additionalContext
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.16.I7 - Session end flushes learnings

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Add learning flush logic to `session-end-cleanup.sh` or create Python script
- [ ] Check for pending learnings in temp storage
- [ ] Insert to archival_memory with session_id reference
- [ ] Clear temp storage after flush
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.16.I8 - Hooks execute in registration order

**File:** `tests/integration/story-2.16-session-lifecycle.test.ts`

**Tasks to make this test pass:**

- [ ] Verify `.claude/settings.json` hook order under SessionStart array
- [ ] Order is determined by array position (index 0, 1, 2), NOT by timeout values:
  - Index 0: session-register.sh
  - Index 1: session_start_continuity.py
  - Index 2: session-symbol-index.sh
- [ ] Test HookRunner fires hooks sequentially in array order
- [ ] Verify by checking execution timestamps or mock call order
- [ ] Note: Timeout values (5000ms, 10000ms, 15000ms) are MAX timeouts, not execution order
- [ ] Run test: `pnpm test:integration -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.16.E1 - Open thread from yesterday surfaces

**File:** `tests/e2e/story-2.16-session-continuity.spec.ts`

**Tasks to make this test pass:**

- [ ] All unit and integration tests passing first
- [ ] Wire hooks into agent server lifecycle
- [ ] System context rendered in chat UI
- [ ] Add data-testid="system-context" to UI
- [ ] Run test: `pnpm test:e2e -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.16.E2 - Context persists across session restart

**File:** `tests/e2e/story-2.16-session-continuity.spec.ts`

**Tasks to make this test pass:**

- [ ] All unit and integration tests passing first
- [ ] Full session lifecycle working
- [ ] Stop event properly fires on page close
- [ ] New session loads previous context
- [ ] Run test: `pnpm test:e2e -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.16.E3 - Symbol index creates cache file

**File:** `tests/e2e/story-2.16-session-continuity.spec.ts`

**Tasks to make this test pass:**

- [ ] session-symbol-index.sh deployed and registered
- [ ] tldr CLI available or fallback implemented
- [ ] Cache directory created: `.claude/cache/`
- [ ] Index file written: `.claude/cache/symbol-index.json`
- [ ] Run test: `pnpm test:e2e -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.16.E4 - Symbol index fallback when tldr unavailable

**File:** `tests/e2e/story-2.16-session-continuity.spec.ts`

**Tasks to make this test pass:**

- [ ] session-symbol-index.sh includes fallback logic (per AC4 pattern in story)
- [ ] Fallback triggers when `command -v tldr` fails
- [ ] Fallback uses find command for basic file list
- [ ] Test mocks tldr unavailability via PATH manipulation
- [ ] Index file still created but contains file paths instead of symbols
- [ ] Run test: `pnpm test:e2e -- story-2.16`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Total Estimated Effort Summary

| Test Level | Count | Estimated Hours |
|------------|-------|-----------------|
| Unit Tests (U1-U8) | 8 | 5.5 hours |
| Integration Tests (I1-I8) | 8 | 13.5 hours |
| E2E Tests (E1-E4) | 4 | 6 hours |
| **TOTAL** | **20** | **25 hours** |

**Note:** Estimates are approximate and may vary based on developer familiarity with the codebase and test infrastructure.

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm test -- story-2.16

# Run unit tests only
pnpm test:unit -- story-2.16

# Run integration tests only
pnpm test:integration -- story-2.16

# Run E2E tests (requires built app)
pnpm test:e2e -- story-2.16

# Run tests in watch mode during development
pnpm test:unit -- story-2.16 --watch

# Debug specific test
pnpm test:unit -- story-2.16 --reporter=verbose
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- [x] All 20 tests written and failing
- [x] Fixtures and factories documented
- [x] Mock requirements documented
- [x] data-testid requirements listed
- [x] Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with unit tests)
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

**Suggested Order:**

1. Unit tests first (U1-U6) - establishes basic building blocks
2. Integration tests (I1-I8) - combines components with database
3. E2E tests (E1-E3) - validates full user flow

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `sprint-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

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

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase: `pnpm test -- story-2.16`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Playwright's `test.extend()`
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (E2E vs API vs Component vs Unit)
- **test-design-epic-2.md** - Epic-specific test scenarios (2.16.1-2.16.6) with test code patterns

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `pnpm test -- story-2.16`

**Status:** SPECIFICATION DOCUMENT - Test files not yet created

This ATDD checklist is a specification document that defines the tests to be written. The test files listed below do not exist yet and must be created as part of the RED phase:

- `tests/unit/story-2.16-session-hooks.test.ts` - TO BE CREATED
- `tests/integration/story-2.16-session-lifecycle.test.ts` - TO BE CREATED
- `tests/e2e/story-2.16-session-continuity.spec.ts` - TO BE CREATED

**Next Steps:**
1. Create test files from specifications in this checklist
2. Run tests to verify RED phase (all tests fail due to missing implementation)
3. Fill in actual test output below

**Results (to be filled after test file creation):**

```
Expected results after test file creation:
- Total tests: 20 (8 unit + 8 integration + 4 E2E)
- Passing: 0 (expected - no implementation yet)
- Failing: 20 (expected - implementation pending)
- Status: RED phase verified
```

**Expected Failure Messages:**

- 2.16.U1: "Cannot find module '@/hooks/session/end'"
- 2.16.U2: "validateOutcome is not a function"
- 2.16.U3: "generateSessionId is not a function"
- 2.16.U4: "truncateContext is not a function"
- 2.16.U5: "Error handling not implemented" or "graceful degradation not implemented"
- 2.16.U6: "session-symbol-index.sh: No such file"
- 2.16.U7: "buildActiveProjectsQuery is not a function"
- 2.16.U8: "buildRecentContactsQuery is not a function"
- 2.16.I1: "connect ECONNREFUSED" or "SessionStartHook not defined"
- 2.16.I2: "session_start_continuity.py not found"
- 2.16.I3: "session-outcome.sh not found"
- 2.16.I4: "Open thread detection not implemented"
- 2.16.I5: "Learnings query not implemented"
- 2.16.I6: "SQLite queries not implemented"
- 2.16.I7: "Flush logic not implemented"
- 2.16.I8: "Hook orchestration missing"
- 2.16.E1: "Timeout waiting for [data-testid='system-context']"
- 2.16.E2: "Timeout waiting for context persistence"
- 2.16.E3: "symbol-index.json not found"
- 2.16.E4: "Fallback behavior not implemented" or "tldr unavailable fallback missing"

---

## Notes

- **Depends on Story 2.15**: Hook Infrastructure Foundation must be complete first (provides HookRunner, event firing)
- **Depends on Story 2.2b**: CC v3 Hooks Integration provides hook registration patterns
- **PostgreSQL Required**: Integration and E2E tests require PostgreSQL running (Docker compose)
- **Hybrid Database Architecture**: PostgreSQL for cross-session state, SQLite for local Orion data
- **Graceful Degradation**: All hooks must fail gracefully if PostgreSQL unavailable - never block session start
- **Existing Hooks Reference**: Existing CC v3 hooks in `.claude/hooks/dist/*.mjs` can be adapted

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @TEA in Slack/Discord
- Refer to `_bmad/bmm/testarch/README.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge/` for testing best practices

---

**Generated by BMad TEA Agent (Murat)** - 2026-01-16
