# Story 2.19: Validation & Safety Hooks

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-19-validation-safety-hooks
**Priority:** P0 (Security)
**Risk:** HIGH

---

## Story

As a user,
I want validation hooks to catch errors before they happen,
So that Orion doesn't send bad emails or create broken events.

---

## Acceptance Criteria

### AC1: Email Preflight Validation

**Given** an agent is about to send an email
**When** PreToolUse fires for GMAIL_SEND_EMAIL
**Then** `email-preflight` validates recipient exists
**And** checks for missing subject or empty body
**And** warns if sending to external domain (optional)

- [ ] EmailPreflightHook class implemented in `src/hooks/validation/email-preflight.ts`
- [ ] Recipient validation: email format check, optionally verify in contacts
- [ ] Subject validation: must be present and non-empty
- [ ] Body validation: must be present and non-empty
- [ ] External domain warning: configurable list of internal domains
- [ ] Returns `permissionDecision: 'deny'` with clear error if validation fails
- [ ] Returns `permissionDecision: 'ask'` with warning for non-blocking issues (external domain)

### AC2: Calendar Preflight Validation

**Given** an agent is about to create a calendar event
**When** PreToolUse fires for GOOGLECALENDAR_CREATE_EVENT
**Then** `calendar-preflight` checks for conflicts
**And** validates duration is reasonable (not 0 or >8 hours)
**And** warns if outside working hours preference

- [ ] CalendarPreflightHook class implemented in `src/hooks/validation/calendar-preflight.ts`
- [ ] Conflict detection: query existing events at proposed time
- [ ] Duration validation: must be > 0 minutes and <= 8 hours (480 minutes)
- [ ] Working hours validation: configurable working hours (default 9am-6pm)
- [ ] Returns `permissionDecision: 'ask'` with conflicts array if conflicts detected
- [ ] Returns `permissionDecision: 'deny'` if duration invalid
- [ ] Returns `permissionDecision: 'ask'` with warning if outside working hours

### AC3: Action Logging (PostToolUse Tracker)

**Given** an agent completes an action
**When** PostToolUse fires
**Then** `post-tool-use-tracker` logs the action
**And** action is recorded in action_log for undo
**And** learning opportunities are identified

- [ ] ActionLogger service implemented in `src/services/action-log.ts`
- [ ] PostToolUseTracker hook implemented in `src/hooks/validation/post-tool-tracker.ts`
- [ ] Logs action to action_log table with before/after state (PM-001)
- [ ] Schema: `{ action_type, entity_type, entity_id, previous_state, new_state, timestamp }`
- [ ] Identifies learning opportunities (user corrections, overrides)
- [ ] Integrates with undo system (UX-007: 5-second undo window)

### AC4: User Override Support

**Given** a validation fails
**When** the hook blocks the action
**Then** user sees clear error message
**And** suggested fix is provided
**And** user can override with confirmation

- [ ] All validation errors have clear, actionable error messages
- [ ] Error codes map to user-friendly messages and suggested fixes
- [ ] Override mechanism allows user to bypass non-critical warnings
- [ ] Override decisions are logged for learning
- [ ] Critical errors (invalid email format) cannot be overridden

---

## Tasks / Subtasks

### Task 1: Create Email Preflight Hook (AC: #1)

- [ ] 1.1 Create `src/hooks/validation/email-preflight.ts` - EmailPreflightHook class
- [ ] 1.2 Implement `execute(input: ToolInput): Promise<HookResult>`:
```typescript
interface EmailValidation {
  recipient: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
}

function validateEmail(params: EmailValidation): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Recipient validation
  if (!params.recipient || !isValidEmail(params.recipient)) {
    errors.push({ code: 'EMAIL_RECIPIENT_INVALID', message: 'Recipient email is invalid' });
  }

  // Subject validation
  if (!params.subject || params.subject.trim().length === 0) {
    errors.push({ code: 'EMAIL_SUBJECT_EMPTY', message: 'Email subject cannot be empty' });
  }

  // Body validation
  if (!params.body || params.body.trim().length === 0) {
    errors.push({ code: 'EMAIL_BODY_EMPTY', message: 'Email body cannot be empty' });
  }

  // External domain warning
  if (isExternalDomain(params.recipient)) {
    warnings.push({ code: 'EMAIL_EXTERNAL_DOMAIN', message: 'Sending to external domain' });
  }

  return { errors, warnings };
}
```
- [ ] 1.3 Implement email format validation using regex or validator library
- [ ] 1.4 Create external domain detection with configurable internal domains
- [ ] 1.5 Create error message mapping

### Task 2: Create Calendar Preflight Hook (AC: #2)

- [ ] 2.1 Create `src/hooks/validation/calendar-preflight.ts` - CalendarPreflightHook class
- [ ] 2.2 Implement conflict detection:
```typescript
async function checkConflicts(event: ProposedEvent): Promise<ConflictResult> {
  const existingEvents = await calendarService.getEventsAt(event.start, event.end);

  if (existingEvents.length > 0) {
    return {
      hasConflicts: true,
      conflicts: existingEvents.map(e => ({
        title: e.title,
        start: e.start,
        end: e.end,
      })),
    };
  }

  return { hasConflicts: false, conflicts: [] };
}
```
- [ ] 2.3 Implement duration validation:
  - Minimum: 1 minute (or configurable)
  - Maximum: 480 minutes (8 hours, configurable)
- [ ] 2.4 Implement working hours validation:
  - Default: 9am-6pm user local time
  - Configurable via user preferences
  - Warning (not blocking) if outside hours
- [ ] 2.5 Create `CalendarService.getEventsAt(start, end)` mock interface (real impl in Epic 3)

### Task 3: Create Action Logger Service (AC: #3)

- [ ] 3.1 Create `src/services/action-log.ts` - ActionLogger class
- [ ] 3.2 Implement action_log table schema (if not exists from Epic 1):
```sql
CREATE TABLE IF NOT EXISTS action_log (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,        -- 'send_email', 'create_event', 'file_email', etc.
    entity_type TEXT NOT NULL,        -- 'email', 'calendar_event', 'inbox_item', 'task'
    entity_id TEXT NOT NULL,          -- ID of affected entity
    previous_state TEXT,              -- JSON of state before action (for undo)
    new_state TEXT,                   -- JSON of state after action
    tool_name TEXT NOT NULL,          -- Composio tool name
    agent_name TEXT,                  -- Which agent performed action
    session_id TEXT,                  -- Session reference
    undone INTEGER DEFAULT 0,         -- Whether action was undone
    undone_at TEXT,                   -- When action was undone
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_action_log_type ON action_log(action_type);
CREATE INDEX idx_action_log_entity ON action_log(entity_type, entity_id);
CREATE INDEX idx_action_log_session ON action_log(session_id);
```
- [ ] 3.3 Implement `log(action: ActionLogEntry): Promise<string>` method
- [ ] 3.4 Implement `getRecentActions(sessionId: string, limit: number): Promise<ActionLogEntry[]>`
- [ ] 3.5 Implement `markUndone(actionId: string): Promise<void>`

### Task 4: Create PostToolUse Tracker Hook (AC: #3)

- [ ] 4.1 Create `src/hooks/validation/post-tool-tracker.ts` - PostToolUseTracker class
- [ ] 4.2 Implement hook execution:
```typescript
async execute(context: PostToolUseContext): Promise<HookResult> {
  const { tool, input, output, sessionId } = context;

  // Only log write actions (not reads)
  if (!isWriteAction(tool)) {
    return { logged: false, reason: 'read-only' };
  }

  // Extract entity info from tool output
  const entityInfo = extractEntityInfo(tool, output);

  // Log to action_log
  await this.actionLogger.log({
    actionType: tool,
    entityType: entityInfo.type,
    entityId: entityInfo.id,
    previousState: input.previousState,
    newState: output,
    toolName: tool,
    sessionId,
  });

  // Identify learning opportunities
  const learnings = await this.identifyLearnings(context);

  return { logged: true, actionId: actionLogId, learnings };
}
```
- [ ] 4.3 Implement `isWriteAction(tool: string): boolean`:
  - Write actions: GMAIL_SEND_EMAIL, GMAIL_CREATE_DRAFT, GOOGLECALENDAR_CREATE_EVENT, task_create, contact_create
  - Read actions: GMAIL_FETCH_EMAILS, GOOGLECALENDAR_GET_EVENTS (don't log)
- [ ] 4.4 Implement `extractEntityInfo(tool, output)` for each write tool
- [ ] 4.5 Create learning opportunity detection (corrections, overrides)

### Task 5: Create Validation Error Messages (AC: #4)

- [ ] 5.1 Create `src/hooks/validation/error-messages.ts`:
```typescript
const VALIDATION_ERRORS = {
  // Email errors
  EMAIL_RECIPIENT_INVALID: {
    message: 'The recipient email address is invalid',
    suggestedFix: 'Please provide a valid email address (e.g., name@domain.com)',
    canOverride: false,
  },
  EMAIL_SUBJECT_EMPTY: {
    message: 'The email subject is empty',
    suggestedFix: 'Add a subject line to describe your email',
    canOverride: true,
  },
  EMAIL_BODY_EMPTY: {
    message: 'The email body is empty',
    suggestedFix: 'Add content to your email body',
    canOverride: false,
  },
  EMAIL_EXTERNAL_DOMAIN: {
    message: 'You are sending to an external domain',
    suggestedFix: 'Confirm you want to send to {domain}',
    canOverride: true,
  },

  // Calendar errors
  CALENDAR_CONFLICT: {
    message: 'This event conflicts with existing events',
    suggestedFix: 'Choose a different time or confirm double-booking',
    canOverride: true,
  },
  CALENDAR_DURATION_INVALID: {
    message: 'Event duration must be between 1 minute and 8 hours',
    suggestedFix: 'Adjust the event end time',
    canOverride: false,
  },
  CALENDAR_OUTSIDE_HOURS: {
    message: 'This event is outside your working hours',
    suggestedFix: 'Confirm scheduling outside {workingHours}',
    canOverride: true,
  },

  // Task errors
  TASK_TITLE_EMPTY: {
    message: 'Task title cannot be empty',
    suggestedFix: 'Provide a descriptive task title',
    canOverride: false,
  },
  TASK_DUE_DATE_PAST: {
    message: 'The due date is in the past',
    suggestedFix: 'Set a future due date or remove the due date',
    canOverride: true,
  },

  // Contact errors
  CONTACT_NAME_EMPTY: {
    message: 'Contact name cannot be empty',
    suggestedFix: 'Provide a name for the contact',
    canOverride: false,
  },
  CONTACT_EMAIL_INVALID: {
    message: 'Contact email format is invalid',
    suggestedFix: 'Provide a valid email address',
    canOverride: false,
  },
};
```
- [ ] 5.2 Implement `getValidationError(code: string): ValidationErrorInfo`
- [ ] 5.3 Implement `formatErrorMessage(code: string, context: Record<string, string>): string`

### Task 6: Create Hook Registration (AC: #1, #2, #3, #4)

- [ ] 6.1 Create `src/hooks/validation/index.ts` - export all validators
- [ ] 6.2 Create shell scripts for hook execution:
  - `.claude/hooks/email-preflight.sh`
  - `.claude/hooks/calendar-preflight.sh`
  - `.claude/hooks/post-tool-use-tracker.py`
  - `.claude/hooks/post-edit-diagnostics.sh` (for TypeScript edits)
  - `.claude/hooks/import-validator.sh`
  - `.claude/hooks/compiler-in-the-loop.sh`
- [ ] 6.3 Register hooks in `.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      { "command": "hooks/email-preflight.sh", "timeout": 3000 },
      { "command": "hooks/calendar-preflight.sh", "timeout": 5000 },
      { "command": "hooks/import-validator.sh", "timeout": 2000 }
    ],
    "PostToolUse": [
      { "command": "hooks/post-tool-use-tracker.py", "timeout": 3000 },
      { "command": "hooks/post-edit-diagnostics.sh", "timeout": 5000 },
      { "command": "hooks/compiler-in-the-loop.sh", "timeout": 5000 }
    ]
  }
}
```
- [ ] 6.4 Ensure all hooks are executable (`chmod +x`)

### Task 7: Write Tests (AC: #1, #2, #3, #4)

- [ ] 7.1 Unit test: Empty email body is blocked
- [ ] 7.2 Unit test: Invalid email recipient is blocked
- [ ] 7.3 Unit test: Calendar conflict is detected and warned
- [ ] 7.4 Unit test: Invalid duration is blocked
- [ ] 7.5 Unit test: All validation errors have clear messages
- [ ] 7.6 Integration test: Action log records all write operations
- [ ] 7.7 E2E test: User can override validation with confirmation
- [ ] 7.8 E2E test: Undo reverses action using logged state

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Validation Hooks (6 total from Epic definition):**

| Hook | Event | Purpose |
|------|-------|---------|
| `email-preflight.sh` | PreToolUse | Validate emails before send |
| `calendar-preflight.sh` | PreToolUse | Validate events before create |
| `import-validator.sh` | PreToolUse | Check imports/dependencies |
| `compiler-in-the-loop.sh` | PostToolUse | Type checking |
| `post-tool-use-tracker.py` | PostToolUse | Action logging |
| `post-edit-diagnostics.sh` | PostToolUse | Validate edits |

**Validation Rules Matrix:**

| Tool | Validation | Blocking? |
|------|------------|-----------|
| GMAIL_SEND_EMAIL | Recipient valid, subject present, body non-empty | Yes (errors) |
| GMAIL_SEND_EMAIL | External domain | No (warning) |
| GMAIL_CREATE_DRAFT | Same as send, plus draft saved notification | Yes (errors) |
| GOOGLECALENDAR_CREATE_EVENT | No conflicts | No (ask) |
| GOOGLECALENDAR_CREATE_EVENT | Reasonable duration (1min-8hrs) | Yes (error) |
| GOOGLECALENDAR_CREATE_EVENT | Within working hours | No (warning) |
| task_create | Title present | Yes (error) |
| task_create | Due date in future if set | No (warning) |
| contact_create | Name present | Yes (error) |
| contact_create | Email format valid if provided | Yes (error) |

### Hook Result Schema

```typescript
interface PreToolUseResult {
  // Permission decision
  permissionDecision: 'allow' | 'deny' | 'ask';

  // For denied requests
  validationError?: string;      // Error code (e.g., 'EMAIL_BODY_EMPTY')
  message?: string;              // User-facing message
  suggestedFix?: string;         // Actionable fix suggestion
  canOverride?: boolean;         // Whether user can bypass

  // For warnings (ask)
  warning?: string;              // Warning code (e.g., 'CALENDAR_CONFLICT')
  conflicts?: ConflictInfo[];    // For calendar conflicts

  // Validation metadata
  validationRan?: boolean;
  validationDuration?: number;   // ms
}

interface PostToolUseResult {
  // Logging status
  logged: boolean;
  actionId?: string;

  // Learning opportunities
  learnings?: LearningOpportunity[];

  // Validation (for edits)
  validationRan?: boolean;
  typeErrors?: TypeCheckError[];
  lintErrors?: LintError[];
}
```

### Action Log Schema (PM-001)

From PRD TIGER 1 mitigation:

```sql
CREATE TABLE action_log (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,        -- 'file_email', 'create_event', 'send_email'
    entity_type TEXT NOT NULL,        -- 'inbox_item', 'calendar_event', 'task'
    entity_id TEXT NOT NULL,
    previous_state TEXT,              -- JSON for undo
    new_state TEXT,                   -- JSON of result
    tool_name TEXT NOT NULL,          -- Composio tool name
    agent_name TEXT,                  -- Which agent performed action
    session_id TEXT,
    user_approved INTEGER DEFAULT 0,  -- User confirmed the action
    undone INTEGER DEFAULT 0,
    undone_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

### File Structure Requirements

```
src/
  hooks/
    validation/
      index.ts                    # Export all validators
      email-preflight.ts          # EmailPreflightHook class
      calendar-preflight.ts       # CalendarPreflightHook class
      post-tool-tracker.ts        # PostToolUseTracker class
      error-messages.ts           # Validation error definitions
      types.ts                    # TypeScript interfaces

  services/
    action-log.ts                 # ActionLogger service

.claude/
  hooks/
    email-preflight.sh            # Email validation hook
    calendar-preflight.sh         # Calendar validation hook
    post-tool-use-tracker.py      # Action logging hook
    post-edit-diagnostics.sh      # Edit validation hook
    import-validator.sh           # Import checking hook
    compiler-in-the-loop.sh       # Type checking hook

tests/
  unit/
    story-2.19-validation.spec.ts
  integration/
    story-2.19-action-log.spec.ts
    story-2.19-validation-hooks.spec.ts
  e2e/
    story-2.19-override.spec.ts
```

### Integration Points

**With Story 2.4 (Tool Permission System):**
- Validation hooks run AFTER permission check
- If permission denied, validation doesn't run
- If permission allowed, validation runs as additional gate

**With Story 2.15 (Hook Infrastructure Foundation):**
- Uses `HookRunner` from hook infrastructure
- Follows hook lifecycle events (PreToolUse, PostToolUse)
- Honors hook timeout settings (3-5 seconds)

**With Story 2.18 (Tool Routing Hooks):**
- Tool routing hooks run BEFORE validation hooks
- Routing determines targets, validation validates parameters

**With Story 4.8 (Undo Support):**
- ActionLogger provides undo data for UX-007 (5-second undo)
- `markUndone()` method supports undo functionality
- Previous state stored for rollback

### Critical Design Constraints

1. **Validation hooks MUST be fast** - Timeout of 3-5 seconds max
2. **Clear error messages** - Every error code maps to actionable message
3. **Override support** - Non-critical validations allow user bypass
4. **Audit trail** - All actions logged with full context for undo
5. **Graceful degradation** - Validation failure doesn't crash app
6. **User trust** - Build trust through transparency (UX-013: "See what I did")

### Email Validation Implementation

```typescript
// src/hooks/validation/email-preflight.ts

import { z } from 'zod';

const EmailParamsSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export class EmailPreflightHook {
  private internalDomains: string[] = ['mycompany.com', 'orion.app'];

  async execute(input: ToolInput): Promise<HookResult> {
    if (input.tool !== 'GMAIL_SEND_EMAIL' && input.tool !== 'GMAIL_CREATE_DRAFT') {
      return { permissionDecision: 'allow' };
    }

    const params = input.params;
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate with Zod
    const result = EmailParamsSchema.safeParse(params);
    if (!result.success) {
      for (const error of result.error.errors) {
        errors.push({
          code: this.mapZodError(error.path[0] as string),
          field: error.path[0] as string,
          message: error.message,
        });
      }
    }

    // External domain check
    if (params.to && !this.isInternalDomain(params.to)) {
      warnings.push({
        code: 'EMAIL_EXTERNAL_DOMAIN',
        message: `Sending to external domain: ${this.extractDomain(params.to)}`,
      });
    }

    // Return result
    if (errors.length > 0) {
      return {
        permissionDecision: 'deny',
        validationError: errors[0].code,
        message: errors[0].message,
        suggestedFix: VALIDATION_ERRORS[errors[0].code].suggestedFix,
      };
    }

    if (warnings.length > 0) {
      return {
        permissionDecision: 'ask',
        warning: warnings[0].code,
        message: warnings[0].message,
      };
    }

    return { permissionDecision: 'allow' };
  }
}
```

### Calendar Validation Implementation

```typescript
// src/hooks/validation/calendar-preflight.ts

export class CalendarPreflightHook {
  private workingHours = { start: 9, end: 18 }; // 9am-6pm
  private maxDurationMinutes = 480; // 8 hours

  constructor(private calendarService: CalendarService) {}

  async execute(input: ToolInput): Promise<HookResult> {
    if (input.tool !== 'GOOGLECALENDAR_CREATE_EVENT') {
      return { permissionDecision: 'allow' };
    }

    const { title, start, end } = input.params;
    const startTime = new Date(start);
    const endTime = new Date(end);

    // Duration validation
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationMinutes <= 0 || durationMinutes > this.maxDurationMinutes) {
      return {
        permissionDecision: 'deny',
        validationError: 'CALENDAR_DURATION_INVALID',
        message: 'Event duration must be between 1 minute and 8 hours',
        suggestedFix: 'Adjust the event end time',
      };
    }

    // Conflict detection
    const conflicts = await this.calendarService.getEventsAt(start, end);
    if (conflicts.length > 0) {
      return {
        permissionDecision: 'ask',
        warning: 'CALENDAR_CONFLICT',
        message: `Conflicts with: ${conflicts.map(c => c.title).join(', ')}`,
        conflicts: conflicts,
      };
    }

    // Working hours check
    const startHour = startTime.getHours();
    if (startHour < this.workingHours.start || startHour >= this.workingHours.end) {
      return {
        permissionDecision: 'ask',
        warning: 'CALENDAR_OUTSIDE_HOURS',
        message: `Event starts outside working hours (${this.workingHours.start}:00-${this.workingHours.end}:00)`,
      };
    }

    return { permissionDecision: 'allow' };
  }
}
```

---

## Test Considerations

### Test Strategy

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.19.1 | Integration | Empty email body is blocked | Error returned | Vitest |
| 2.19.2 | Integration | Invalid email recipient is blocked | Error returned | Vitest |
| 2.19.3 | Integration | Calendar conflict is detected | Warning shown | Vitest |
| 2.19.4 | Unit | Invalid duration is blocked | Error returned | Vitest |
| 2.19.5 | Unit | All validations have clear error messages | Messages defined | Vitest |
| 2.19.6 | Integration | Action log records all write operations | Audit trail exists | Vitest |
| 2.19.7 | E2E | User can override validation | Bypass works | Vercel Browser Agent |
| 2.19.8 | E2E | Undo reverses action using logged state | Rollback works | Vercel Browser Agent |

### Test Code Examples

```typescript
// tests/integration/story-2.19-validation-hooks.spec.ts
import { test, expect, vi, beforeEach, afterEach, describe } from 'vitest';
import { EmailPreflightHook } from '@/hooks/validation/email-preflight';
import { CalendarPreflightHook } from '@/hooks/validation/calendar-preflight';
import { ActionLogger } from '@/services/action-log';
import { createTestDatabase } from '../helpers/database';

let db: any;
let actionLogger: ActionLogger;

beforeEach(() => {
  db = createTestDatabase();
  actionLogger = new ActionLogger({ db });
});

afterEach(() => {
  db.close();
});

describe('Story 2.19: Validation & Safety Hooks', () => {

  test('2.19.1 - empty email body is blocked with error', async () => {
    const hook = new EmailPreflightHook();

    const result = await hook.execute({
      tool: 'GMAIL_SEND_EMAIL',
      params: {
        to: 'recipient@example.com',
        subject: 'Test',
        body: '', // Empty body
      },
    });

    expect(result.permissionDecision).toBe('deny');
    expect(result.validationError).toBe('EMAIL_BODY_EMPTY');
    expect(result.message).toContain('body cannot be empty');
  });

  test('2.19.2 - invalid email recipient is blocked', async () => {
    const hook = new EmailPreflightHook();

    const result = await hook.execute({
      tool: 'GMAIL_SEND_EMAIL',
      params: {
        to: 'not-an-email',
        subject: 'Test',
        body: 'Hello',
      },
    });

    expect(result.permissionDecision).toBe('deny');
    expect(result.validationError).toBe('EMAIL_RECIPIENT_INVALID');
  });

  test('2.19.3 - calendar conflict is detected and warned', async () => {
    const calendarService = {
      getEventsAt: vi.fn().mockResolvedValue([
        { title: 'Team Standup', start: '2026-01-17T09:00:00Z', end: '2026-01-17T09:30:00Z' },
      ]),
    };

    const hook = new CalendarPreflightHook(calendarService);

    const result = await hook.execute({
      tool: 'GOOGLECALENDAR_CREATE_EVENT',
      params: {
        title: 'New Meeting',
        start: '2026-01-17T09:00:00Z',
        end: '2026-01-17T10:00:00Z',
      },
    });

    expect(result.permissionDecision).toBe('ask');
    expect(result.warning).toBe('CALENDAR_CONFLICT');
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].title).toBe('Team Standup');
  });

  test('2.19.4 - invalid duration is blocked', async () => {
    const hook = new CalendarPreflightHook({ getEventsAt: vi.fn().mockResolvedValue([]) });

    const result = await hook.execute({
      tool: 'GOOGLECALENDAR_CREATE_EVENT',
      params: {
        title: 'Long Meeting',
        start: '2026-01-17T09:00:00Z',
        end: '2026-01-17T18:00:00Z', // 9 hours - too long
      },
    });

    expect(result.permissionDecision).toBe('deny');
    expect(result.validationError).toBe('CALENDAR_DURATION_INVALID');
  });

  test('2.19.5 - all validations have clear error messages', () => {
    const emailHook = new EmailPreflightHook();
    const calendarHook = new CalendarPreflightHook({ getEventsAt: vi.fn() });

    const emailErrors = emailHook.getValidationErrors();
    const calendarErrors = calendarHook.getValidationErrors();

    // All error types should have messages
    for (const [code, info] of Object.entries(emailErrors)) {
      expect(info.message).toBeTruthy();
      expect(info.message.length).toBeGreaterThan(10);
      expect(info).toHaveProperty('suggestedFix');
    }

    for (const [code, info] of Object.entries(calendarErrors)) {
      expect(info.message).toBeTruthy();
      expect(info.message.length).toBeGreaterThan(10);
    }
  });

  test('2.19.6 - action log records all write operations', async () => {
    // Simulate a write action
    await actionLogger.log({
      actionType: 'send_email',
      entityType: 'email',
      entityId: 'msg_001',
      toolName: 'GMAIL_SEND_EMAIL',
      previousState: null,
      newState: { to: 'test@example.com', subject: 'Test', body: 'Hello' },
      sessionId: 'test-session',
    });

    const logs = db.prepare(`
      SELECT * FROM action_log WHERE tool_name = ?
    `).all('GMAIL_SEND_EMAIL');

    expect(logs).toHaveLength(1);
    expect(logs[0].action_type).toBe('send_email');
    expect(JSON.parse(logs[0].new_state).to).toBe('test@example.com');
  });

});

// tests/e2e/story-2.19-override.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('2.19.7 - user can override external domain warning', async ({ page }) => {
  // Mock validation warning response
  await page.route('**/api/validate/email', route => {
    route.fulfill({
      status: 200,
      json: {
        permissionDecision: 'ask',
        warning: 'EMAIL_EXTERNAL_DOMAIN',
        message: 'Sending to external domain: partner.com',
        canOverride: true,
      },
    });
  });

  await page.goto('/compose');
  await page.fill('[data-testid="email-to"]', 'partner@external.com');
  await page.fill('[data-testid="email-subject"]', 'Test');
  await page.fill('[data-testid="email-body"]', 'Hello');
  await page.click('[data-testid="send-button"]');

  // Warning dialog should appear
  const dialog = page.locator('[data-testid="validation-warning"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('external domain')).toBeVisible();

  // Override button should be present
  const overrideButton = dialog.getByRole('button', { name: /send anyway/i });
  await expect(overrideButton).toBeVisible();
});

test('2.19.8 - undo reverses action using logged state', async ({ page }) => {
  await page.goto('/inbox');

  // Perform an action (archive email)
  const email = page.locator('[data-testid="inbox-item"]').first();
  await email.click();
  await page.click('[data-testid="archive-button"]');

  // Undo toast should appear
  const toast = page.locator('[data-testid="undo-toast"]');
  await expect(toast).toBeVisible();
  await expect(toast.getByText('Archived')).toBeVisible();

  // Click undo
  await toast.getByRole('button', { name: /undo/i }).click();

  // Email should return to inbox
  await expect(email).toBeVisible();
});
```

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.15 (Hook Infrastructure Foundation)** - Provides HookRunner, hook registration, hook_launcher.py
- **Story 2.2b (CC v3 Hooks Integration)** - Migrates shell hook infrastructure from CC v3
- **Story 2.4 (Tool Permission System)** - Permission checks run before validation
- **Story 2.18 (Tool Routing Hooks)** - Routing hooks run before validation

### Downstream Dependencies (blocked by this story)

- **Story 4.8 (Undo Support for Actions)** - Uses action_log for undo data
- **Story 5.4 (Draft Review Before Send)** - Uses email-preflight validation
- **Story 6.2 (Create Events via Chat)** - Uses calendar-preflight validation

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.19] - User story definition
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.19] - Test scenarios
- [Source: thoughts/planning-artifacts/prd.md#10.4-tiger-1] - action_log undo strategy
- [Source: thoughts/planning-artifacts/architecture.md] - Hook infrastructure patterns
- [Related: UX-007] - 5-second undo window requirement
- [Related: UX-012] - Never auto-send without permission
- [Related: PM-001] - action_log table for undo/rollback
- [Related: Story 2.15] - Hook Infrastructure Foundation
- [Related: Story 2.18] - Tool Routing Hooks
- [Related: Story 4.8] - Undo Support for Actions

---

## Dev Agent Record

### Agent Model Used

(To be filled by DEV agent)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - list all files created/modified)
