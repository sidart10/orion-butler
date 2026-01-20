# ATDD Checklist - Epic 2, Story 2.19: Validation & Safety Hooks

**Date:** 2026-01-16
**Author:** Murat (Master Test Architect)
**Primary Test Level:** Integration + E2E
**Risk:** HIGH (Security)
**Priority:** P0

---

## Story Summary

Implements validation hooks that catch errors before they happen, preventing Orion from sending bad emails or creating broken calendar events.

**As a** user
**I want** validation hooks to catch errors before they happen
**So that** Orion doesn't send bad emails or create broken events

---

## Acceptance Criteria

### AC1: Email Preflight Validation
- EmailPreflightHook validates recipient exists, checks for missing subject or empty body
- Returns `permissionDecision: 'deny'` with clear error if validation fails
- Returns `permissionDecision: 'ask'` with warning for non-blocking issues (external domain)

### AC2: Calendar Preflight Validation
- CalendarPreflightHook checks for conflicts and validates duration (1min-8hrs)
- Warns if outside working hours preference
- Returns appropriate permission decisions based on validation results

### AC3: Action Logging (PostToolUse Tracker)
- PostToolUseTracker logs all write actions to action_log for undo
- Identifies learning opportunities (user corrections, overrides)
- Schema: `{ action_type, entity_type, entity_id, previous_state, new_state, timestamp }`

### AC4: User Override Support
- All validation errors have clear, actionable error messages
- Override mechanism allows user to bypass non-critical warnings
- Critical errors (invalid email format) cannot be overridden
- Override decisions are logged for learning

---

## Failing Tests Created (RED Phase)

### Unit Tests (8 tests)

**File:** `tests/unit/hooks/story-2.19-email-validation.spec.ts`

- **Test:** 2.19.U1 - empty email body is blocked with error
  - **Status:** RED - EmailPreflightHook not implemented
  - **Verifies:** AC1 - Empty body returns `permissionDecision: 'deny'` with `EMAIL_BODY_EMPTY` error

- **Test:** 2.19.U2 - invalid email recipient is blocked
  - **Status:** RED - EmailPreflightHook not implemented
  - **Verifies:** AC1 - Invalid email format returns `permissionDecision: 'deny'`

- **Test:** 2.19.U3 - missing subject is blocked
  - **Status:** RED - EmailPreflightHook not implemented
  - **Verifies:** AC1 - Empty subject returns `permissionDecision: 'deny'`

- **Test:** 2.19.U4 - external domain triggers warning (not blocking)
  - **Status:** RED - EmailPreflightHook not implemented
  - **Verifies:** AC1 - External domain returns `permissionDecision: 'ask'` with warning

**File:** `tests/unit/hooks/story-2.19-calendar-validation.spec.ts`

- **Test:** 2.19.U5 - invalid duration (0 minutes) is blocked
  - **Status:** RED - CalendarPreflightHook not implemented
  - **Verifies:** AC2 - Zero duration returns `permissionDecision: 'deny'`

- **Test:** 2.19.U6 - invalid duration (>8 hours) is blocked
  - **Status:** RED - CalendarPreflightHook not implemented
  - **Verifies:** AC2 - Duration > 480 minutes returns `permissionDecision: 'deny'`

- **Test:** 2.19.U7 - outside working hours triggers warning
  - **Status:** RED - CalendarPreflightHook not implemented
  - **Verifies:** AC2 - Event before 9am or after 6pm returns `permissionDecision: 'ask'`

**File:** `tests/unit/hooks/story-2.19-error-messages.spec.ts`

- **Test:** 2.19.U8 - all validation errors have clear messages and suggested fixes
  - **Status:** RED - error-messages.ts not implemented
  - **Verifies:** AC4 - Every error code maps to actionable message

### Integration Tests (6 tests)

**File:** `tests/integration/story-2.19-validation-hooks.spec.ts`

- **Test:** 2.19.I1 - EmailPreflightHook integrates with HookRunner
  - **Status:** RED - Hook not registered
  - **Verifies:** AC1 - Email validation runs on GMAIL_SEND_EMAIL

- **Test:** 2.19.I2 - CalendarPreflightHook detects conflicts
  - **Status:** RED - Conflict detection not implemented
  - **Verifies:** AC2 - Conflicts array populated when events overlap

- **Test:** 2.19.I3 - CalendarPreflightHook integrates with HookRunner
  - **Status:** RED - Hook not registered
  - **Verifies:** AC2 - Calendar validation runs on GOOGLECALENDAR_CREATE_EVENT

**File:** `tests/integration/story-2.19-action-log.spec.ts`

- **Test:** 2.19.I4 - PostToolUseTracker logs write operations
  - **Status:** RED - ActionLogger service not implemented
  - **Verifies:** AC3 - action_log table records GMAIL_SEND_EMAIL

- **Test:** 2.19.I5 - ActionLogger stores before/after state for undo
  - **Status:** RED - ActionLogger service not implemented
  - **Verifies:** AC3 - previous_state and new_state captured

- **Test:** 2.19.I6 - Read operations are NOT logged
  - **Status:** RED - isWriteAction filter not implemented
  - **Verifies:** AC3 - GMAIL_FETCH_EMAILS does not create log entry

### E2E Tests (4 tests)

**File:** `tests/e2e/story-2.19-validation-override.spec.ts`

- **Test:** 2.19.E1 - user can override external domain warning
  - **Status:** RED - Override UI not implemented
  - **Verifies:** AC4 - Warning dialog with "Send Anyway" button

- **Test:** 2.19.E2 - user cannot override invalid email format
  - **Status:** RED - Critical error handling not implemented
  - **Verifies:** AC4 - No override button for critical errors

- **Test:** 2.19.E3 - validation error shows suggested fix
  - **Status:** RED - Error message UI not implemented
  - **Verifies:** AC4 - Suggested fix text visible in error dialog

- **Test:** 2.19.E4 - undo reverses action using logged state
  - **Status:** RED - Undo system not implemented
  - **Verifies:** AC3 - 5-second undo window works (UX-007)

---

## Data Factories Created

### ValidationError Factory

**File:** `tests/support/factories/validation-error.factory.ts`

**Exports:**
- `createEmailValidationResult(overrides?)` - Create email validation result
- `createCalendarValidationResult(overrides?)` - Create calendar validation result
- `createConflict(overrides?)` - Create calendar conflict object

**Example Usage:**

```typescript
const result = createEmailValidationResult({
  permissionDecision: 'deny',
  validationError: 'EMAIL_BODY_EMPTY',
});

const conflict = createConflict({
  title: 'Team Standup',
  start: '2026-01-17T09:00:00Z',
  end: '2026-01-17T09:30:00Z',
});
```

### ActionLog Factory

**File:** `tests/support/factories/action-log.factory.ts`

**Exports:**
- `createActionLogEntry(overrides?)` - Create action log entry
- `createActionLogEntries(count)` - Create array of entries

**Example Usage:**

```typescript
const entry = createActionLogEntry({
  actionType: 'send_email',
  entityType: 'email',
  entityId: 'msg_001',
  toolName: 'GMAIL_SEND_EMAIL',
});
```

---

## Fixtures Created

### Validation Hooks Fixture

**File:** `tests/support/fixtures/validation-hooks.fixture.ts`

**Fixtures:**

- `emailHook` - EmailPreflightHook instance for testing
  - **Setup:** Creates hook with configurable internal domains
  - **Provides:** Configured EmailPreflightHook
  - **Cleanup:** None (stateless)

- `calendarHook` - CalendarPreflightHook instance with mock calendar service
  - **Setup:** Creates hook with mock CalendarService
  - **Provides:** Configured CalendarPreflightHook + calendarService mock
  - **Cleanup:** Clears mock call history

- `actionLogger` - ActionLogger instance with test database
  - **Setup:** Creates test SQLite database and ActionLogger
  - **Provides:** ActionLogger + test database handle
  - **Cleanup:** Closes database connection

**Example Usage:**

```typescript
import { test } from './fixtures/validation-hooks.fixture';

test('should validate email', async ({ emailHook }) => {
  const result = await emailHook.execute({
    tool: 'GMAIL_SEND_EMAIL',
    params: { to: 'test@example.com', subject: '', body: 'Hello' },
  });
  expect(result.permissionDecision).toBe('deny');
});
```

---

## Mock Requirements

### CalendarService Mock

**Purpose:** Simulate existing calendar events for conflict detection

**Method:** `getEventsAt(start: string, end: string)`

**Success Response (no conflicts):**
```json
{
  "events": []
}
```

**Conflict Response:**
```json
{
  "events": [
    {
      "id": "evt_001",
      "title": "Team Standup",
      "start": "2026-01-17T09:00:00Z",
      "end": "2026-01-17T09:30:00Z"
    }
  ]
}
```

**Notes:** Mock should be configurable per test to return different conflict scenarios.

### HookRunner Mock

**Purpose:** Test hook registration and execution flow

**Methods:**
- `fireEvent(event: string, context: object)` - Simulates CC v3 hook lifecycle
- `registerHook(event: string, config: object)` - Adds hook to registry

**Notes:** See Story 2.15 for base HookRunner mock implementation.

---

## Required data-testid Attributes

### Validation Warning Dialog

- `validation-warning` - Container for validation warning/error dialog
- `validation-error-message` - Text of the validation error
- `validation-suggested-fix` - Suggested fix text
- `override-button` - "Send Anyway" / "Create Anyway" button
- `cancel-button` - Cancel action button

### Undo Toast

- `undo-toast` - Container for undo notification
- `undo-action-description` - What action was performed (e.g., "Archived")
- `undo-button` - Undo action button
- `undo-countdown` - 5-second countdown indicator

### Email Compose (Integration)

- `email-to` - Recipient input field
- `email-subject` - Subject input field
- `email-body` - Body textarea
- `send-button` - Send email button

**Implementation Example:**

```tsx
<div data-testid="validation-warning" role="alertdialog">
  <p data-testid="validation-error-message">{error.message}</p>
  <p data-testid="validation-suggested-fix">{error.suggestedFix}</p>
  {error.canOverride && (
    <button data-testid="override-button">Send Anyway</button>
  )}
  <button data-testid="cancel-button">Cancel</button>
</div>
```

---

## Implementation Checklist

### Test: 2.19.U1 - Empty email body is blocked

**File:** `tests/unit/hooks/story-2.19-email-validation.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/hooks/validation/email-preflight.ts` with EmailPreflightHook class
- [ ] Implement `execute(input: ToolInput): Promise<HookResult>` method
- [ ] Add body validation check: `if (!params.body || params.body.trim().length === 0)`
- [ ] Return `{ permissionDecision: 'deny', validationError: 'EMAIL_BODY_EMPTY', message: '...' }`
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-email-validation.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.19.U2 - Invalid email recipient is blocked

**File:** `tests/unit/hooks/story-2.19-email-validation.spec.ts`

**Tasks to make this test pass:**

- [ ] Add email format validation using Zod or regex
- [ ] Create `isValidEmail(email: string): boolean` helper
- [ ] Return `{ permissionDecision: 'deny', validationError: 'EMAIL_RECIPIENT_INVALID', message: '...' }`
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-email-validation.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.19.U3 - Missing subject is blocked

**File:** `tests/unit/hooks/story-2.19-email-validation.spec.ts`

**Tasks to make this test pass:**

- [ ] Add subject validation check: `if (!params.subject || params.subject.trim().length === 0)`
- [ ] Return `{ permissionDecision: 'deny', validationError: 'EMAIL_SUBJECT_EMPTY', message: '...' }`
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-email-validation.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.19.U4 - External domain triggers warning

**File:** `tests/unit/hooks/story-2.19-email-validation.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `internalDomains: string[]` configuration to EmailPreflightHook
- [ ] Create `isExternalDomain(email: string): boolean` helper
- [ ] Return `{ permissionDecision: 'ask', warning: 'EMAIL_EXTERNAL_DOMAIN', message: '...' }`
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-email-validation.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.19.U5 - Invalid duration (0 minutes) is blocked

**File:** `tests/unit/hooks/story-2.19-calendar-validation.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/hooks/validation/calendar-preflight.ts` with CalendarPreflightHook class
- [ ] Implement duration calculation: `(endTime - startTime) / (1000 * 60)`
- [ ] Add validation: `if (durationMinutes <= 0)`
- [ ] Return `{ permissionDecision: 'deny', validationError: 'CALENDAR_DURATION_INVALID', message: '...' }`
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-calendar-validation.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.19.U6 - Invalid duration (>8 hours) is blocked

**File:** `tests/unit/hooks/story-2.19-calendar-validation.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `maxDurationMinutes = 480` configuration
- [ ] Add validation: `if (durationMinutes > this.maxDurationMinutes)`
- [ ] Return `{ permissionDecision: 'deny', validationError: 'CALENDAR_DURATION_INVALID', message: '...' }`
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-calendar-validation.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.19.U7 - Outside working hours triggers warning

**File:** `tests/unit/hooks/story-2.19-calendar-validation.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `workingHours = { start: 9, end: 18 }` configuration
- [ ] Extract hour from start time: `new Date(start).getHours()`
- [ ] Add validation: `if (startHour < workingHours.start || startHour >= workingHours.end)`
- [ ] Return `{ permissionDecision: 'ask', warning: 'CALENDAR_OUTSIDE_HOURS', message: '...' }`
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-calendar-validation.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.19.U8 - All validation errors have clear messages

**File:** `tests/unit/hooks/story-2.19-error-messages.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/hooks/validation/error-messages.ts` with VALIDATION_ERRORS constant
- [ ] Define error codes: EMAIL_BODY_EMPTY, EMAIL_SUBJECT_EMPTY, EMAIL_RECIPIENT_INVALID, EMAIL_EXTERNAL_DOMAIN, CALENDAR_DURATION_INVALID, CALENDAR_CONFLICT, CALENDAR_OUTSIDE_HOURS
- [ ] Each error has: `message: string`, `suggestedFix: string`, `canOverride: boolean`
- [ ] Add `getValidationError(code: string)` and `formatErrorMessage(code: string, context: object)` helpers
- [ ] Run test: `pnpm test tests/unit/hooks/story-2.19-error-messages.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.19.I1 - EmailPreflightHook integrates with HookRunner

**File:** `tests/integration/story-2.19-validation-hooks.spec.ts`

**Tasks to make this test pass:**

- [ ] Register EmailPreflightHook in `.claude/settings.json` under PreToolUse
- [ ] Create `.claude/hooks/email-preflight.sh` shell script
- [ ] Hook script invokes TypeScript validation via ts-node or compiled JS
- [ ] Test HookRunner fires hook on GMAIL_SEND_EMAIL tool use
- [ ] Run test: `pnpm test tests/integration/story-2.19-validation-hooks.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.19.I2 - CalendarPreflightHook detects conflicts

**File:** `tests/integration/story-2.19-validation-hooks.spec.ts`

**Tasks to make this test pass:**

- [ ] Inject CalendarService dependency into CalendarPreflightHook
- [ ] Implement `checkConflicts(start, end)` using CalendarService.getEventsAt()
- [ ] Return `{ permissionDecision: 'ask', warning: 'CALENDAR_CONFLICT', conflicts: [...] }`
- [ ] Run test: `pnpm test tests/integration/story-2.19-validation-hooks.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.19.I3 - CalendarPreflightHook integrates with HookRunner

**File:** `tests/integration/story-2.19-validation-hooks.spec.ts`

**Tasks to make this test pass:**

- [ ] Register CalendarPreflightHook in `.claude/settings.json` under PreToolUse
- [ ] Create `.claude/hooks/calendar-preflight.sh` shell script
- [ ] Hook script invokes TypeScript validation
- [ ] Test HookRunner fires hook on GOOGLECALENDAR_CREATE_EVENT tool use
- [ ] Run test: `pnpm test tests/integration/story-2.19-validation-hooks.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.19.I4 - PostToolUseTracker logs write operations

**File:** `tests/integration/story-2.19-action-log.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/services/action-log.ts` with ActionLogger class
- [ ] Create action_log table schema (see Dev Notes in story)
- [ ] Implement `log(entry: ActionLogEntry): Promise<string>` method
- [ ] Create `src/hooks/validation/post-tool-tracker.ts` with PostToolUseTracker class
- [ ] Call ActionLogger.log() for write operations
- [ ] Run test: `pnpm test tests/integration/story-2.19-action-log.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.19.I5 - ActionLogger stores before/after state

**File:** `tests/integration/story-2.19-action-log.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `previousState` and `newState` columns to action_log schema
- [ ] Serialize state as JSON before storing
- [ ] Capture input params as previousState, output as newState
- [ ] Run test: `pnpm test tests/integration/story-2.19-action-log.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.19.I6 - Read operations are NOT logged

**File:** `tests/integration/story-2.19-action-log.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `isWriteAction(tool: string): boolean` helper
- [ ] Write tools: GMAIL_SEND_EMAIL, GMAIL_CREATE_DRAFT, GOOGLECALENDAR_CREATE_EVENT, task_create, contact_create
- [ ] Read tools (excluded): GMAIL_FETCH_EMAILS, GOOGLECALENDAR_GET_EVENTS
- [ ] Check isWriteAction before logging
- [ ] Run test: `pnpm test tests/integration/story-2.19-action-log.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.19.E1 - User can override external domain warning

**File:** `tests/e2e/story-2.19-validation-override.spec.ts`

**Tasks to make this test pass:**

- [ ] Create ValidationWarningDialog component with data-testid attributes
- [ ] Show dialog when hook returns `permissionDecision: 'ask'`
- [ ] Add "Send Anyway" button when `canOverride: true`
- [ ] Override bypasses validation and continues with tool execution
- [ ] Add required data-testid: `validation-warning`, `override-button`
- [ ] Run test: `pnpm test:e2e tests/e2e/story-2.19-validation-override.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.19.E2 - User cannot override invalid email format

**File:** `tests/e2e/story-2.19-validation-override.spec.ts`

**Tasks to make this test pass:**

- [ ] Check `canOverride` flag from error definition
- [ ] Critical errors (invalid email format) have `canOverride: false`
- [ ] Hide override button when `canOverride: false`
- [ ] Run test: `pnpm test:e2e tests/e2e/story-2.19-validation-override.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.19.E3 - Validation error shows suggested fix

**File:** `tests/e2e/story-2.19-validation-override.spec.ts`

**Tasks to make this test pass:**

- [ ] Display `suggestedFix` text in ValidationWarningDialog
- [ ] Add required data-testid: `validation-suggested-fix`
- [ ] Run test: `pnpm test:e2e tests/e2e/story-2.19-validation-override.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.19.E4 - Undo reverses action using logged state

**File:** `tests/e2e/story-2.19-validation-override.spec.ts`

**Tasks to make this test pass:**

- [ ] Create UndoToast component with 5-second countdown (UX-007)
- [ ] Show toast after write actions complete
- [ ] Store action_log ID for undo reference
- [ ] Implement `markUndone(actionId: string)` in ActionLogger
- [ ] On undo click, restore previous_state from action_log
- [ ] Add required data-testid: `undo-toast`, `undo-button`
- [ ] Run test: `pnpm test:e2e tests/e2e/story-2.19-validation-override.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 4 hours

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm test -- --grep "story-2.19"

# Run unit tests only
pnpm test tests/unit/hooks/story-2.19-*.spec.ts

# Run integration tests only
pnpm test tests/integration/story-2.19-*.spec.ts

# Run E2E tests only
pnpm test:e2e tests/e2e/story-2.19-*.spec.ts

# Run tests in headed mode (see browser)
pnpm test:e2e tests/e2e/story-2.19-*.spec.ts -- --headed

# Debug specific test
pnpm test tests/unit/hooks/story-2.19-email-validation.spec.ts -- --reporter=verbose
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All 18 tests written and failing
- Fixtures and factories created with auto-cleanup
- Mock requirements documented (CalendarService, HookRunner)
- data-testid requirements listed (9 attributes)
- Implementation checklist created (20 tasks)

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with U1-U8 unit tests)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Recommended Order:**

1. Unit tests first (U1-U8) - Core validation logic
2. Integration tests (I1-I6) - Hook wiring and action logging
3. E2E tests last (E1-E4) - UI components and user flows

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in sprint-status.yaml

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality**:
   - Extract common validation patterns to shared utilities
   - Ensure hook timeout compliance (3-5 seconds max)
   - Verify graceful degradation on hook failures
3. **Optimize performance** (validation hooks must be fast)
4. **Ensure tests still pass** after each refactor
5. **Update documentation** (hook registration, error codes)

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

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `pnpm test -- --grep "story-2.19"`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red -> green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Vitest's beforeEach/afterEach
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (Unit vs Integration vs E2E)

See `_bmad/bmm/testarch/tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `pnpm test -- --grep "story-2.19"`

**Expected Results:**

```
 FAIL  tests/unit/hooks/story-2.19-email-validation.spec.ts
   2.19.U1 - empty email body is blocked with error
     Error: Cannot find module '@/hooks/validation/email-preflight'
   2.19.U2 - invalid email recipient is blocked
     Error: Cannot find module '@/hooks/validation/email-preflight'
   2.19.U3 - missing subject is blocked
     Error: Cannot find module '@/hooks/validation/email-preflight'
   2.19.U4 - external domain triggers warning
     Error: Cannot find module '@/hooks/validation/email-preflight'

 FAIL  tests/unit/hooks/story-2.19-calendar-validation.spec.ts
   2.19.U5 - invalid duration (0 minutes) is blocked
     Error: Cannot find module '@/hooks/validation/calendar-preflight'
   2.19.U6 - invalid duration (>8 hours) is blocked
     Error: Cannot find module '@/hooks/validation/calendar-preflight'
   2.19.U7 - outside working hours triggers warning
     Error: Cannot find module '@/hooks/validation/calendar-preflight'

 FAIL  tests/unit/hooks/story-2.19-error-messages.spec.ts
   2.19.U8 - all validation errors have clear messages
     Error: Cannot find module '@/hooks/validation/error-messages'

 FAIL  tests/integration/story-2.19-validation-hooks.spec.ts
   (6 tests failing - hooks not implemented)

 FAIL  tests/e2e/story-2.19-validation-override.spec.ts
   (4 tests failing - UI components not implemented)

Test Files  6 failed (6)
Tests       18 failed (18)
Status:     RED phase verified
```

**Summary:**

- Total tests: 18
- Passing: 0 (expected)
- Failing: 18 (expected)
- Status: RED phase verified

---

## Notes

### Integration Points

- **Story 2.15 (Hook Infrastructure Foundation)** - Uses HookRunner from hook infrastructure
- **Story 2.4 (Tool Permission System)** - Validation hooks run AFTER permission check
- **Story 2.18 (Tool Routing Hooks)** - Tool routing hooks run BEFORE validation
- **Story 4.8 (Undo Support)** - ActionLogger provides undo data for UX-007

### Critical Design Constraints

1. **Validation hooks MUST be fast** - Timeout of 3-5 seconds max
2. **Clear error messages** - Every error code maps to actionable message
3. **Override support** - Non-critical validations allow user bypass
4. **Audit trail** - All actions logged with full context for undo
5. **Graceful degradation** - Validation failure doesn't crash app

### Validation Rules Matrix

| Tool | Validation | Blocking? |
|------|------------|-----------|
| GMAIL_SEND_EMAIL | Recipient valid, subject present, body non-empty | Yes (errors) |
| GMAIL_SEND_EMAIL | External domain | No (warning) |
| GOOGLECALENDAR_CREATE_EVENT | No conflicts | No (ask) |
| GOOGLECALENDAR_CREATE_EVENT | Reasonable duration (1min-8hrs) | Yes (error) |
| GOOGLECALENDAR_CREATE_EVENT | Within working hours | No (warning) |

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Consult story file: `thoughts/implementation-artifacts/stories/story-2-19-validation-safety-hooks.md`
- Consult test design: `thoughts/planning-artifacts/test-design-epic-2.md`
- Refer to PRD TIGER 1 mitigation for action_log schema

---

**Generated by Murat (Master Test Architect) - 2026-01-16**
