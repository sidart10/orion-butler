# ATDD Checklist - Epic 2, Story 2.15: Hook Infrastructure Foundation

**Date:** 2026-01-16
**Author:** Murat (TEA)
**Primary Test Level:** Integration
**Story Key:** 2-15-hook-infrastructure-foundation
**Risk Level:** HIGH (Infrastructure)

---

## Story Summary

Migrate the hook system from Continuous Claude v3 to Orion, enabling the application to intercept and enhance agent behavior automatically through lifecycle events.

**As a** developer
**I want** the hook system from Continuous Claude v3 migrated
**So that** Orion can intercept and enhance agent behavior automatically

---

## Acceptance Criteria

1. **AC1: Hook Registration and Configuration** - Hooks are registered from `.claude/settings.json`, `hook_launcher.py` is available for Python hooks, shell hooks are executable
2. **AC2: Hook Lifecycle Events** - All 5 lifecycle events (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop) are supported with proper payloads and return values
3. **AC3: Graceful Degradation and Error Handling** - Hook failures are logged and don't crash the application, execution continues gracefully
4. **AC4: Environment and Context Passing** - Hooks receive correct environment variables and can access project/session context

---

## Failing Tests Created (RED Phase)

### Unit Tests (6 tests)

**File:** `tests/unit/story-2.15-hook-infrastructure.spec.ts` (~180 lines)

- [ ] **Test 2.15.U1:** Hook registration JSON is valid
  - **Status:** RED - HookRunner class not implemented
  - **Verifies:** AC1 - JSON parse succeeds, all hook entries have required fields

- [ ] **Test 2.15.U2:** All hook scripts are executable
  - **Status:** RED - No shell hooks exist yet
  - **Verifies:** AC1 - Shell scripts have chmod +x, Python scripts use launcher

- [ ] **Test 2.15.U3:** Environment variables passed correctly
  - **Status:** RED - HookRunner.executeCommand not implemented
  - **Verifies:** AC4 - CLAUDE_PROJECT_DIR, HOOK_EVENT, SESSION_ID set

- [ ] **Test 2.15.U4:** Hook timeout protection works
  - **Status:** RED - Timeout logic not implemented
  - **Verifies:** AC3 - Hooks that hang are terminated after timeout

- [ ] **Test 2.15.U5:** Hook result schema validation
  - **Status:** RED - HookResult interface not defined
  - **Verifies:** AC2 - permissionDecision, additionalContext fields parsed

- [ ] **Test 2.15.U6:** Multiple hooks per event execute in order
  - **Status:** RED - Hook ordering not implemented
  - **Verifies:** AC2 - Hooks fire sequentially in registration order

### Integration Tests (5 tests)

**File:** `tests/integration/story-2.15-hook-lifecycle.spec.ts` (~200 lines)

- [ ] **Test 2.15.I1:** SessionStart hooks fire on initialization
  - **Status:** RED - HookRunner.initialize not implemented
  - **Verifies:** AC2 - SessionStart event fires at app launch

- [ ] **Test 2.15.I2:** Hook failures are logged and don't crash app
  - **Status:** RED - Error handling not implemented
  - **Verifies:** AC3 - Failed hooks logged, execution continues

- [ ] **Test 2.15.I3:** PreToolUse hooks can modify tool execution
  - **Status:** RED - Tool routing not wired to hooks
  - **Verifies:** AC2 - permissionDecision (allow/deny/ask) respected

- [ ] **Test 2.15.I4:** PostToolUse hooks receive tool output
  - **Status:** RED - PostToolUse event not implemented
  - **Verifies:** AC2 - Hooks receive tool name and output

- [ ] **Test 2.15.I5:** hook_launcher.py passes payload via stdin
  - **Status:** RED - Python hook execution not integrated
  - **Verifies:** AC4 - JSON payload readable from stdin, result from stdout

### E2E Tests (2 tests)

**File:** `tests/e2e/story-2.15-hook-lifecycle.spec.ts` (~100 lines)

- [ ] **Test 2.15.E1:** Full lifecycle fires correctly
  - **Status:** RED - Hook system not wired to app lifecycle
  - **Verifies:** AC2 - SessionStart -> UserPromptSubmit -> PreToolUse -> PostToolUse -> Stop sequence

- [ ] **Test 2.15.E2:** Development mode exposes __hooksFired array
  - **Status:** RED - Debug exposure not implemented
  - **Verifies:** AC2 (testability) - window.__hooksFired tracks fired events

---

## Data Factories Created

### HookConfig Factory

**File:** `tests/support/factories/hook.factory.ts`

**Exports:**

- `createHookConfig(overrides?)` - Create single hook configuration
- `createHookConfigs(count)` - Create array of hook configs
- `createHookResult(overrides?)` - Create hook execution result

**Example Usage:**

```typescript
import { createHookConfig, createHookResult } from './hook.factory';

const shellHook = createHookConfig({ command: 'session-register.sh', timeout: 5000 });
const pythonHook = createHookConfig({
  command: 'uv run python hook_launcher.py my_hook.py',
  timeout: 10000
});

const allowResult = createHookResult({ permissionDecision: 'allow' });
const denyResult = createHookResult({
  permissionDecision: 'deny',
  message: 'Operation blocked by policy'
});
```

---

## Fixtures Created

### Hook Runner Fixtures

**File:** `tests/support/fixtures/hook.fixture.ts`

**Fixtures:**

- `hookRunner` - Configured HookRunner instance with test hooks
  - **Setup:** Create HookRunner, register test hooks from fixture JSON
  - **Provides:** Initialized runner ready to fire events
  - **Cleanup:** Clear all registered hooks

- `mockCommandExecutor` - Controlled command execution
  - **Setup:** Mock child_process.spawn with controlled responses
  - **Provides:** Spy for verifying command arguments
  - **Cleanup:** Restore original spawn

**Example Usage:**

```typescript
import { test } from './fixtures/hook.fixture';

test('should fire SessionStart hooks', async ({ hookRunner }) => {
  const results = await hookRunner.fireEvent('SessionStart', { sessionId: 'test-001' });
  expect(results).toHaveLength(2);
});
```

---

## Mock Requirements

### Shell Command Mock

**Tool:** child_process mock via vi.mock

**Success Response:**

```json
{
  "stdout": "{\"permissionDecision\":\"allow\",\"additionalContext\":\"Context injected\"}",
  "stderr": "",
  "exitCode": 0
}
```

**Failure Response:**

```json
{
  "stdout": "",
  "stderr": "Error: Hook script failed",
  "exitCode": 1
}
```

**Notes:** Mock child_process.spawn for shell hooks, execSync for permission checks

### Python Hook Mock

**Tool:** Mocked subprocess execution

**Input:** JSON payload via stdin

```json
{
  "event": "PreToolUse",
  "toolName": "Read",
  "input": { "file_path": "/test/file.ts" },
  "sessionId": "sess-001"
}
```

**Output:** JSON result via stdout

```json
{
  "permissionDecision": "allow",
  "additionalContext": "TLDR: File contains 3 functions..."
}
```

---

## Required data-testid Attributes

### Hook Debug Panel (Development Only)

- `hook-debug-panel` - Container for hook debugging info
- `hook-event-log` - List of fired hook events
- `hook-event-item` - Individual event entry

**Implementation Example:**

```tsx
{process.env.NODE_ENV === 'development' && (
  <div data-testid="hook-debug-panel">
    <ul data-testid="hook-event-log">
      {hookEvents.map((event, i) => (
        <li key={i} data-testid="hook-event-item">{event}</li>
      ))}
    </ul>
  </div>
)}
```

---

## Implementation Checklist

### Test 2.15.U1: Hook registration JSON is valid

**File:** `tests/unit/story-2.15-hook-infrastructure.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/hooks/runner.ts` with HookRunner class
- [ ] Implement `registerHooks(settingsPath: string)` method
- [ ] Add HookConfig interface with command, timeout, continueOnError fields
- [ ] Parse `.claude/settings.json` hooks section
- [ ] Run test: `pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts -t "2.15.U1"`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.15.U2: All hook scripts are executable

**File:** `tests/unit/story-2.15-hook-infrastructure.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement permission check in HookRunner for .sh files
- [ ] Add validation during hook registration
- [ ] Log warning for non-executable shell scripts
- [ ] Python scripts bypass permission check (use launcher)
- [ ] Run test: `pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts -t "2.15.U2"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.15.U3: Environment variables passed correctly

**File:** `tests/unit/story-2.15-hook-infrastructure.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `executeHook(config, event, payload)` private method
- [ ] Set CLAUDE_PROJECT_DIR to absolute project path
- [ ] Set HOOK_EVENT to event name string
- [ ] Set SESSION_ID from payload
- [ ] Set HOOK_TIMEOUT from config (default 30000)
- [ ] Run test: `pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts -t "2.15.U3"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test 2.15.U4: Hook timeout protection works

**File:** `tests/unit/story-2.15-hook-infrastructure.spec.ts`

**Tasks to make this test pass:**

- [ ] Add timeout parameter to execWithTimeout utility
- [ ] Create AbortController for command execution
- [ ] Implement timeout abort after config.timeout milliseconds
- [ ] Log timeout errors with hook name and event type
- [ ] Return error result (not throw) on timeout
- [ ] Run test: `pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts -t "2.15.U4"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test 2.15.U5: Hook result schema validation

**File:** `tests/unit/story-2.15-hook-infrastructure.spec.ts`

**Tasks to make this test pass:**

- [ ] Create HookResult interface in `agent-server/src/hooks/types.ts`
- [ ] Define permissionDecision: 'allow' | 'deny' | 'ask'
- [ ] Define optional additionalContext: string
- [ ] Define optional message: string
- [ ] Parse stdout JSON as HookResult
- [ ] Gracefully handle malformed JSON (log error, return empty result)
- [ ] Run test: `pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts -t "2.15.U5"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.15.U6: Multiple hooks per event execute in order

**File:** `tests/unit/story-2.15-hook-infrastructure.spec.ts`

**Tasks to make this test pass:**

- [ ] Store hooks in Map<string, HookConfig[]>
- [ ] Implement sequential execution in fireEvent
- [ ] Collect results array in registration order
- [ ] Each result includes hook command for identification
- [ ] Run test: `pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts -t "2.15.U6"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.15.I1: SessionStart hooks fire on initialization

**File:** `tests/integration/story-2.15-hook-lifecycle.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `initialize()` method to HookRunner
- [ ] Call `fireEvent('SessionStart', {...})` in initialize
- [ ] Collect project directory, timestamp, session ID for payload
- [ ] Wire initialize to agent server bootstrap sequence
- [ ] Run test: `pnpm vitest run tests/integration/story-2.15-hook-lifecycle.spec.ts -t "2.15.I1"`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.15.I2: Hook failures are logged and don't crash app

**File:** `tests/integration/story-2.15-hook-lifecycle.spec.ts`

**Tasks to make this test pass:**

- [ ] Wrap executeHook in try/catch
- [ ] Log error with: hook command, event type, error message, stack trace
- [ ] Continue to next hook in array (don't break loop)
- [ ] Return partial results (successful hooks only)
- [ ] Default continueOnError to true
- [ ] Run test: `pnpm vitest run tests/integration/story-2.15-hook-lifecycle.spec.ts -t "2.15.I2"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test 2.15.I3: PreToolUse hooks can modify tool execution

**File:** `tests/integration/story-2.15-hook-lifecycle.spec.ts`

**Tasks to make this test pass:**

- [ ] Fire PreToolUse before tool execution in agent server
- [ ] Pass tool name and input in payload
- [ ] Check permissionDecision in results
- [ ] If any hook returns 'deny', block tool execution
- [ ] If any hook returns 'ask', prompt user
- [ ] Inject additionalContext into agent context
- [ ] Run test: `pnpm vitest run tests/integration/story-2.15-hook-lifecycle.spec.ts -t "2.15.I3"`
- [ ] Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test 2.15.I4: PostToolUse hooks receive tool output

**File:** `tests/integration/story-2.15-hook-lifecycle.spec.ts`

**Tasks to make this test pass:**

- [ ] Fire PostToolUse after tool execution completes
- [ ] Include tool name, input, and output in payload
- [ ] Include execution duration for metrics
- [ ] Process any learning/validation results from hooks
- [ ] Run test: `pnpm vitest run tests/integration/story-2.15-hook-lifecycle.spec.ts -t "2.15.I4"`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.15.I5: hook_launcher.py passes payload via stdin

**File:** `tests/integration/story-2.15-hook-lifecycle.spec.ts`

**Tasks to make this test pass:**

- [ ] Migrate `hook_launcher.py` from CC v3 to `.claude/hooks/`
- [ ] Verify stdin JSON parsing in launcher
- [ ] Verify stdout JSON output capture
- [ ] Test with actual Python subprocess (not mocked)
- [ ] Handle Python errors gracefully
- [ ] Run test: `pnpm vitest run tests/integration/story-2.15-hook-lifecycle.spec.ts -t "2.15.I5"`
- [ ] Test passes (green phase)

**Estimated Effort:** 2.5 hours

---

### Test 2.15.E1: Full lifecycle fires correctly

**File:** `tests/e2e/story-2.15-hook-lifecycle.spec.ts`

**Tasks to make this test pass:**

- [ ] Wire HookRunner into agent-server/src/index.ts
- [ ] Fire SessionStart in server bootstrap
- [ ] Fire UserPromptSubmit when chat message received
- [ ] Fire PreToolUse before tool handler
- [ ] Fire PostToolUse after tool handler
- [ ] Fire Stop in shutdown handler
- [ ] Run test: `pnpm playwright test tests/e2e/story-2.15-hook-lifecycle.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test 2.15.E2: Development mode exposes __hooksFired array

**File:** `tests/e2e/story-2.15-hook-lifecycle.spec.ts`

**Tasks to make this test pass:**

- [ ] Check NODE_ENV === 'development' in HookRunner
- [ ] After each fireEvent, push event name to global array
- [ ] Expose via Tauri IPC or window global
- [ ] E2E tests can wait for specific events
- [ ] Run test: `pnpm playwright test tests/e2e/story-2.15-hook-lifecycle.spec.ts -t "2.15.E2"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm vitest run tests/unit/story-2.15-*.spec.ts
pnpm vitest run tests/integration/story-2.15-*.spec.ts
pnpm playwright test tests/e2e/story-2.15-*.spec.ts

# Run specific test file
pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts

# Run tests in watch mode
pnpm vitest watch tests/unit/story-2.15-*.spec.ts

# Debug specific test
pnpm vitest run tests/unit/story-2.15-hook-infrastructure.spec.ts --reporter=verbose

# Run E2E tests with browser visible
pnpm playwright test tests/e2e/story-2.15-*.spec.ts --headed

# Run tests with coverage
pnpm vitest run tests/unit/story-2.15-*.spec.ts --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- [x] All tests written and failing
- [x] Fixtures and factories created with auto-cleanup
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

1. **Pick one failing test** from implementation checklist (start with 2.15.U1)
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

**Recommended Order:**

1. 2.15.U1 (registration) - establishes HookRunner class
2. 2.15.U5 (result schema) - defines HookResult type
3. 2.15.U3 (env vars) - implements executeHook core
4. 2.15.U4 (timeout) - adds reliability
5. 2.15.U6 (ordering) - completes fireEvent
6. 2.15.U2 (executable check) - adds validation
7. 2.15.I1-I5 (integration) - wires to system
8. 2.15.E1-E2 (E2E) - validates full lifecycle

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in sprint-status.yaml

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
3. **Run failing tests** to confirm RED phase: `pnpm vitest run tests/unit/story-2.15-*.spec.ts`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **test-design-epic-2.md** - Epic-specific test scenarios for Story 2.15 (hooks infrastructure)
- **test-design-system-level.md** - System-level testability concerns (C-001 to C-005)
- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Vitest
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `pnpm vitest run tests/unit/story-2.15-*.spec.ts`

**Results:**

```
TESTS NOT YET CREATED - Files listed above need to be created

Expected failures after test creation:
- 2.15.U1: Cannot find module 'agent-server/src/hooks/runner'
- 2.15.U2: ENOENT: .claude/hooks/*.sh not found
- 2.15.U3: HookRunner.executeCommand is not a function
- 2.15.U4: Timeout not implemented
- 2.15.U5: HookResult type not defined
- 2.15.U6: fireEvent returns undefined
```

**Summary:**

- Total tests: 13
- Passing: 0 (expected)
- Failing: 13 (expected)
- Status: RED phase - tests need to be created first

**Expected Failure Messages:**

1. `Cannot find module '@/hooks/runner'` - HookRunner class not created
2. `expect(result.valid).toBe(true)` fails - validation not implemented
3. `ENOENT: no such file or directory` - hook scripts not created
4. `Hook execution timed out` - timeout protection not implemented
5. `Cannot read properties of undefined` - HookResult not defined

---

## Notes

- **Migration Source:** CC v3 hook infrastructure at `.claude/hooks/hook_launcher.py` already exists in this codebase
- **Python Environment:** Use `uv run python` for consistent environment (per story technical notes)
- **Security:** Hooks execute with same permissions as agent server - review scripts before deployment
- **Debugging:** Set `HOOK_DEBUG=1` environment variable for verbose logging
- **E2E Support:** Development mode exposes `window.__hooksFired` for test verification

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @tea-agent in Slack/Discord
- Refer to `_bmad/bmm/testarch/README.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge/` for testing best practices

---

**Generated by BMad TEA Agent (Murat)** - 2026-01-16
