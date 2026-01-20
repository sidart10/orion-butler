# Story 2a.16: Session Lifecycle Hooks

**Status:** ready-for-dev
**Epic:** 2a - Core Agent Infrastructure
**Story Key:** 2a-16-session-lifecycle-hooks
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a user,
I want session hooks to maintain continuity across conversations,
So that Orion remembers context from previous sessions.

---

## Acceptance Criteria

### AC1: Session Registration on Start

**Given** I start a new Orion session
**When** SessionStart fires
**Then** `session-register` registers in PostgreSQL sessions table
**And** `session-start-continuity` loads relevant previous context
**And** active projects and recent contacts are injected

- [ ] SessionStart event triggers `session-register.sh` hook
- [ ] Session row created in PostgreSQL `sessions` table with: id, project, working_on, last_heartbeat
- [ ] `session-start-continuity` hook loads context from previous session in same project
- [ ] Active projects queried from SQLite: `SELECT id, name, status FROM projects WHERE status = 'active' ORDER BY updated_at DESC LIMIT 5`
- [ ] Recent contacts queried from SQLite: `SELECT id, name, email FROM contacts WHERE last_interaction_at > datetime('now', '-7 days') ORDER BY last_interaction_at DESC LIMIT 10`
- [ ] Active projects and recent contacts formatted and included in `additionalContext` response:
  ```
  ## Active Projects
  - [Project Name] (id: xxx)

  ## Recent Contacts
  - [Contact Name] <email> (last: 2 days ago)
  ```
- [ ] Context injection uses `additionalContext` return value

### AC2: Session End and Cleanup

**Given** I end an Orion session
**When** Stop event fires
**Then** `session-end-cleanup` saves session summary
**And** unsaved learnings are persisted
**And** session is marked complete in database

- [ ] Stop event triggers `session-end-cleanup.sh` hook
- [ ] Session summary (working_on field) is persisted to PostgreSQL
- [ ] Any in-memory learnings are flushed to `archival_memory` table
- [ ] Session `outcome` field is set (completed, abandoned, or error)
- [ ] Session `last_heartbeat` is updated to mark end time
- [ ] Cleanup runs within configured timeout (default: 5000ms)

### AC3: Session Continuity and Open Threads

**Given** I had an incomplete task in previous session
**When** new session starts
**Then** continuity hook detects open threads
**And** offers to resume previous work
**And** context is restored for seamless continuation

- [ ] Continuity hook queries PostgreSQL for recent sessions in same project
- [ ] Sessions with `outcome = 'abandoned'` or no outcome are flagged as open threads
- [ ] Open thread information is included in `additionalContext`
- [ ] Context includes: previous session's `working_on`, timestamp, and relevant learnings
- [ ] User is notified of available continuity context via injected system message

### AC4: Session Symbol Index

**Given** a new session starts
**When** SessionStart fires
**Then** `session-symbol-index` indexes current project state

- [ ] Symbol index hook runs after session registration
- [ ] Creates or updates symbol index for code navigation using `tldr structure` command
- [ ] Index stored locally in `.claude/cache/symbol-index.json` for fast lookup during session
- [ ] Runs asynchronously (non-blocking for session start) via background process

**Implementation Pattern:**
```bash
#!/usr/bin/env bash
# session-symbol-index.sh - Index project symbols asynchronously

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CACHE_DIR="$PROJECT_DIR/.claude/cache"
INDEX_FILE="$CACHE_DIR/symbol-index.json"

# Create cache directory if needed
mkdir -p "$CACHE_DIR"

# Run indexing in background (non-blocking)
(
  # Use tldr for symbol extraction if available
  if command -v tldr &> /dev/null; then
    tldr structure "$PROJECT_DIR" --lang typescript > "$INDEX_FILE.tmp" 2>/dev/null && \
      mv "$INDEX_FILE.tmp" "$INDEX_FILE"
  else
    # Fallback: basic file list
    find "$PROJECT_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" \) \
      -not -path "*/node_modules/*" -not -path "*/.next/*" \
      | head -100 > "$INDEX_FILE.tmp" && mv "$INDEX_FILE.tmp" "$INDEX_FILE"
  fi
) &

# Return immediately (non-blocking)
echo '{"permissionDecision": "allow", "message": "Symbol indexing started in background"}'
```

### AC5: Session Outcome Recording

**Given** a session ends
**When** Stop event fires
**Then** `session-outcome` records the session result

- [ ] Session outcome is determined from session state (completed tasks, errors, etc.)
- [ ] Outcome enum values: `completed`, `abandoned`, `error`, `handoff`
- [ ] Summary of session accomplishments is stored
- [ ] Outcome is queryable for analytics and continuity

---

## Technical Notes

### Session Lifecycle Hooks (5 total)

**Naming Note:** The epics document refers to "session-start-recall" while this story uses "session-start-continuity". These are the same conceptual hook (continuity = recall previous context). The existing CC v3 implementation uses `session-start-continuity.mjs`. Additionally, there is a separate `session-start-recall.mjs` in CC v3 for memory-specific recall - Orion combines these capabilities in `session-start-continuity`.

| Hook | Event | Purpose | Timeout |
|------|-------|---------|---------|
| `session-register.sh` | SessionStart | Register session in PostgreSQL database | 5000ms |
| `session_start_continuity.py` | SessionStart | Load previous context, detect open threads, inject active projects/contacts | 10000ms |
| `session-symbol-index.sh` | SessionStart | Index current project state for navigation | 15000ms |
| `session-end-cleanup.sh` | Stop | Clean up resources, persist state | 5000ms |
| `session-outcome.sh` | Stop | Record session outcome (completed/abandoned) | 3000ms |

### Hook Execution Flow

```
App Launch
    |
    v
SessionStart Event Fires
    |
    +---> session-register.sh (sync)
    |         |
    |         v
    |     PostgreSQL INSERT into sessions
    |
    +---> session_start_continuity.py (sync)
    |         |
    |         v
    |     Query previous session context
    |     Detect open threads
    |     Query active projects and recent contacts
    |     Return additionalContext
    |
    +---> session-symbol-index.sh (async, non-blocking)
              |
              v
          Index project symbols

    ... Session Active ...

Stop Event Fires
    |
    +---> session-end-cleanup.sh (sync)
    |         |
    |         v
    |     Flush learnings to PostgreSQL
    |     Update session record
    |
    +---> session-outcome.sh (sync)
              |
              v
          Record outcome (completed/abandoned/error)
```

### PostgreSQL Sessions Table Schema

```sql
-- This table should already exist from CC v3 migration
-- Verify schema matches these requirements:

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    working_on TEXT,
    last_heartbeat TIMESTAMP DEFAULT NOW(),
    outcome TEXT,                           -- completed | abandoned | error | handoff
    summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_project ON sessions(project);
CREATE INDEX idx_sessions_heartbeat ON sessions(last_heartbeat DESC);
```

### session-register.sh Implementation

```bash
#!/usr/bin/env bash
# session-register.sh - Register session in PostgreSQL

set -euo pipefail

# Read environment
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SESSION_ID="${SESSION_ID:-$(uuidgen)}"

# Database connection (from environment or .env)
DATABASE_URL="${DATABASE_URL:-postgresql://claude:claude_dev@localhost:5432/continuous_claude}"

# Insert session record
psql "$DATABASE_URL" <<-EOF
    INSERT INTO sessions (id, project, last_heartbeat)
    VALUES ('$SESSION_ID', '$PROJECT_DIR', NOW())
    ON CONFLICT (id) DO UPDATE SET
        last_heartbeat = NOW(),
        updated_at = NOW();
EOF

# Return success
echo '{"permissionDecision": "allow", "message": "Session registered"}'
```

### session-start-continuity.py Implementation Pattern

**Note:** This PostgreSQL-based approach is a **deliberate architectural change** from the existing file-based handoff system in `.claude/hooks/dist/session-start-continuity.mjs`. The PostgreSQL approach enables cross-device continuity, richer analytics, and Orion memory integration. Developers may extend existing TypeScript hooks to add PostgreSQL alongside file-based handoffs.

```python
#!/usr/bin/env python3
"""
session-start-continuity.py - Load previous session context

ARCHITECTURE NOTE: Uses psycopg2 for PostgreSQL queries (sessions, learnings)
and sqlite3 for local Orion data (active projects, recent contacts).
This hybrid approach enables cross-device session continuity via PostgreSQL
while preserving fast local queries for user data.
"""
import json
import sys
import os
import psycopg2
from datetime import datetime, timedelta

def run(payload: dict) -> dict:
    """Load context from previous sessions in the same project."""
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', payload.get('projectDir', ''))
    session_id = os.environ.get('SESSION_ID', payload.get('sessionId', ''))

    # Connect to PostgreSQL
    db_url = os.environ.get('DATABASE_URL', 'postgresql://claude:claude_dev@localhost:5432/continuous_claude')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # Query recent sessions for this project
    cur.execute("""
        SELECT id, working_on, outcome, last_heartbeat
        FROM sessions
        WHERE project = %s AND id != %s
        ORDER BY last_heartbeat DESC
        LIMIT 5
    """, (project_dir, session_id))

    previous_sessions = cur.fetchall()

    # Check for open threads (abandoned or no outcome)
    open_threads = []
    for sess in previous_sessions:
        sess_id, working_on, outcome, heartbeat = sess
        if outcome in (None, 'abandoned') and working_on:
            open_threads.append({
                'sessionId': sess_id,
                'workingOn': working_on,
                'timestamp': heartbeat.isoformat() if heartbeat else None
            })

    # Build context injection
    context_parts = []

    if open_threads:
        context_parts.append("## Previous Session Context")
        context_parts.append("You had incomplete work from a previous session:")
        for thread in open_threads[:3]:  # Limit to 3 most recent
            context_parts.append(f"- **{thread['workingOn']}** (from {thread['timestamp']})")
        context_parts.append("\nConsider asking if the user wants to continue this work.")

    # Query relevant learnings
    cur.execute("""
        SELECT content, context
        FROM archival_memory
        WHERE project_path = %s
        AND created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
    """, (project_dir,))

    recent_learnings = cur.fetchall()
    if recent_learnings:
        context_parts.append("\n## Recent Learnings")
        for content, ctx in recent_learnings:
            context_parts.append(f"- {content[:200]}...")  # Truncate long content

    conn.close()

    return {
        "permissionDecision": "allow",
        "additionalContext": "\n".join(context_parts) if context_parts else None,
        "message": f"Loaded {len(open_threads)} open threads, {len(recent_learnings)} learnings"
    }

if __name__ == "__main__":
    payload = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}
    result = run(payload)
    print(json.dumps(result))
```

### session-end-cleanup.sh Implementation

```bash
#!/usr/bin/env bash
# session-end-cleanup.sh - Cleanup and persist session state

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SESSION_ID="${SESSION_ID:-}"
DATABASE_URL="${DATABASE_URL:-postgresql://claude:claude_dev@localhost:5432/continuous_claude}"

# Read payload from stdin (contains working_on, learnings, etc.)
PAYLOAD=$(cat)
WORKING_ON=$(echo "$PAYLOAD" | jq -r '.workingOn // empty')
SUMMARY=$(echo "$PAYLOAD" | jq -r '.summary // empty')

# Update session record
psql "$DATABASE_URL" <<-EOF
    UPDATE sessions
    SET working_on = '$(echo "$WORKING_ON" | sed "s/'/''/g")',
        summary = '$(echo "$SUMMARY" | sed "s/'/''/g")',
        last_heartbeat = NOW(),
        updated_at = NOW()
    WHERE id = '$SESSION_ID';
EOF

echo '{"permissionDecision": "allow", "message": "Session cleaned up"}'
```

### session-outcome.sh Implementation

```bash
#!/usr/bin/env bash
# session-outcome.sh - Record session outcome

set -euo pipefail

SESSION_ID="${SESSION_ID:-}"
DATABASE_URL="${DATABASE_URL:-postgresql://claude:claude_dev@localhost:5432/continuous_claude}"

# Read outcome from payload
PAYLOAD=$(cat)
OUTCOME=$(echo "$PAYLOAD" | jq -r '.outcome // "completed"')

# Valid outcomes: completed, abandoned, error, handoff
case "$OUTCOME" in
    completed|abandoned|error|handoff) ;;
    *) OUTCOME="completed" ;;
esac

psql "$DATABASE_URL" <<-EOF
    UPDATE sessions
    SET outcome = '$OUTCOME',
        updated_at = NOW()
    WHERE id = '$SESSION_ID';
EOF

echo "{\"permissionDecision\": \"allow\", \"message\": \"Outcome recorded: $OUTCOME\"}"
```

### settings.json Hook Registration

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "session-register.sh",
        "timeout": 5000
      },
      {
        "command": "uv run python hook_launcher.py session_start_continuity.py",
        "timeout": 10000
      },
      {
        "command": "session-symbol-index.sh",
        "timeout": 15000
      }
    ],
    "Stop": [
      {
        "command": "session-end-cleanup.sh",
        "timeout": 5000
      },
      {
        "command": "session-outcome.sh",
        "timeout": 3000
      }
    ]
  }
}
```

---

## Dependencies

### Internal Dependencies

| Story | Dependency |
|-------|------------|
| **2.15** | Hook Infrastructure Foundation - provides HookRunner, event firing, graceful degradation |
| **2.2b** | CC v3 Hooks Integration - provides hook registration patterns, settings.json structure, and existing session hook implementations that this story extends |
| 1.4 | SQLite Database Setup - local database for caching and Orion user data (projects, contacts) |
| 1.5 | Agent Server Process - hosts hook execution |

### External Dependencies

- **PostgreSQL** - Cross-session state storage
- **psycopg2** - Python PostgreSQL driver
- **uv** - Python package runner
- **jq** - JSON parsing in shell scripts

### These Stories Depend On 2.16

| Story | Why |
|-------|-----|
| 2.17 | Context injection hooks build on session context |
| 2.10 | Prompt caching may use session state |
| 2.13 | Memory skills use session continuity |

---

## Test Considerations

### Unit Tests (tests/unit/story-2.16-*.spec.ts)

**Import Path Notes:** Test imports use `@/hooks/session/*` aliases which map to:
- TypeScript source: `agent-server/src/hooks/session/*.ts` (if creating new TS implementations)
- Shell scripts: `.claude/hooks/*.sh` (executed via child_process)
- Python scripts: `.claude/hooks/*.py` (executed via uv run)

The alias is configured in `tsconfig.json` and `vitest.config.ts`.

**2.16.U1 - Session Cleanup Runs Without Errors**
```typescript
// Tests can import TypeScript wrappers or test shell scripts directly
import { executeHookScript } from '@/lib/hooks/executor';

test('session cleanup runs without errors', async () => {
  const result = await executeHookScript('session-end-cleanup.sh', {
    sessionId: 'test-session-001',
    workingOn: 'Testing hook implementation',
    summary: 'Completed AC1 and AC2',
  });

  expect(result.permissionDecision).toBe('allow');
});
```

**2.16.U2 - Outcome Enum Validation**
```typescript
test('outcome is validated to enum values', () => {
  const validOutcomes = ['completed', 'abandoned', 'error', 'handoff'];
  const invalidOutcome = 'unknown';

  for (const outcome of validOutcomes) {
    expect(() => validateOutcome(outcome)).not.toThrow();
  }

  expect(() => validateOutcome(invalidOutcome)).toThrow();
});
```

### Integration Tests (tests/integration/story-2.16-*.spec.ts)

**2.16.I1 - Session Registers in PostgreSQL on Start**
```typescript
test('session registers in PostgreSQL on start', async () => {
  const hook = new SessionStartHook({ pool });

  await hook.execute({
    sessionId: 'test-session-lifecycle-001',
    projectDir: '/test/orion',
    timestamp: new Date().toISOString(),
  });

  const result = await pool.query(
    'SELECT * FROM sessions WHERE id = $1',
    ['test-session-lifecycle-001']
  );

  expect(result.rows).toHaveLength(1);
  expect(result.rows[0].project).toBe('/test/orion');
  expect(result.rows[0].last_heartbeat).toBeTruthy();
});
```

**2.16.I2 - Previous Session Context is Loaded**
```typescript
test('previous session context is loaded', async () => {
  // Insert previous session with open thread
  await pool.query(`
    INSERT INTO sessions (id, project, working_on, last_heartbeat)
    VALUES ($1, $2, $3, NOW() - INTERVAL '1 hour')
  `, ['prev-session', '/test/orion', 'Implementing triage workflow']);

  const hook = new SessionStartHook({ pool });
  const result = await hook.execute({
    sessionId: 'new-session',
    projectDir: '/test/orion',
  });

  expect(result.previousContext).toBeDefined();
  expect(result.previousContext.workingOn).toBe('Implementing triage workflow');
  expect(result.continuationSuggested).toBe(true);
});
```

**2.16.I3 - Session Outcome is Recorded**
```typescript
test('session outcome is recorded', async () => {
  // Create session first
  await pool.query(`
    INSERT INTO sessions (id, project, last_heartbeat)
    VALUES ($1, $2, NOW())
  `, ['outcome-test-session', '/test/orion']);

  const hook = new SessionEndHook({ pool });

  await hook.execute({
    sessionId: 'outcome-test-session',
    outcome: 'completed',
    summary: 'Finished triage workflow implementation',
  });

  const result = await pool.query(
    'SELECT outcome, summary FROM sessions WHERE id = $1',
    ['outcome-test-session']
  );

  expect(result.rows[0].outcome).toBe('completed');
  expect(result.rows[0].summary).toBe('Finished triage workflow implementation');
});
```

### E2E Tests (tests/e2e/story-2.16-*.spec.ts)

**2.16.E1 - Open Thread from Yesterday Surfaces on Start**
```typescript
test('open thread from yesterday surfaces on start', async ({ page }) => {
  // Pre-seed database with abandoned session
  // ... (setup via test fixtures)

  await page.goto('/chat');

  // Wait for session start hooks to complete
  await page.waitForSelector('[data-testid="chat-ready"]');

  // Check for continuity message
  const contextMessage = page.locator('[data-testid="system-context"]');
  await expect(contextMessage).toContainText('previous session');
});
```

**2.16.E2 - Context Persists Across Session Restart**
```typescript
test('context persists across session restart', async ({ page }) => {
  // Start first session
  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Working on feature X');
  await page.click('[data-testid="send-button"]');

  // Wait for response
  await page.waitForSelector('[data-testid="message-complete"]');

  // Close and restart (simulate)
  await page.evaluate(() => window.__triggerStop?.());
  await page.reload();

  // Check context was preserved
  await page.waitForSelector('[data-testid="chat-ready"]');
  const contextMessage = page.locator('[data-testid="system-context"]');
  await expect(contextMessage).toContainText('feature X');
});
```

---

## Implementation Checklist

### Phase 1: Session Registration Hook
- [ ] Create `session-register.sh` in `.claude/hooks/`
- [ ] Verify PostgreSQL `sessions` table schema
- [ ] Test session INSERT/UPSERT logic
- [ ] Set executable permissions (`chmod +x`)
- [ ] Register in settings.json

### Phase 2: Session Continuity Hook
- [ ] Create `session_start_continuity.py` in `.claude/hooks/`
- [ ] Implement previous session query
- [ ] Implement open thread detection
- [ ] Implement learnings query
- [ ] Build `additionalContext` response
- [ ] Test with hook_launcher.py

### Phase 3: Session Symbol Index Hook
- [ ] Create `session-symbol-index.sh`
- [ ] Integrate with tldr or custom symbol indexer
- [ ] Make async/non-blocking
- [ ] Register in settings.json

### Phase 4: Session End Hooks
- [ ] Create `session-end-cleanup.sh`
- [ ] Implement state persistence
- [ ] Create `session-outcome.sh`
- [ ] Implement outcome recording
- [ ] Test with manual Stop event

### Phase 5: Integration and Testing
- [ ] Wire hooks into agent server lifecycle
- [ ] Write unit tests
- [ ] Write integration tests with test database
- [ ] Write E2E tests for continuity flow
- [ ] Test graceful degradation on PostgreSQL failure

---

## Dev Notes

### Building on Story 2.15

This story extends the hook infrastructure from Story 2.15. Key integration points:

1. **HookRunner** - Use the HookRunner class to fire events
2. **Event Payloads** - Follow the payload format defined in 2.15
3. **Graceful Degradation** - Hooks must not block if PostgreSQL is unavailable
4. **Timeout Protection** - All hooks have configurable timeouts

### Existing Hook Infrastructure

The codebase already has hook infrastructure from Continuous Claude v3:
- `.claude/hooks/dist/session-start-continuity.mjs` - Existing ES module (file-based handoff system)
- `.claude/hooks/dist/session-register.mjs` - Existing session registration
- `.claude/hooks/dist/session-end-cleanup.mjs` - Existing cleanup logic
- `.claude/hooks/dist/session-outcome.mjs` - Existing outcome recording

**DECISION: Adapt existing TypeScript implementations from `.claude/hooks/dist/*.mjs` rather than creating new shell scripts.** The TypeScript versions are more robust and already handle edge cases. Specifically:

1. The existing `session-start-continuity.mjs` uses a **file-based handoff system** (not PostgreSQL queries) that integrates with `thoughts/shared/handoffs/` directories
2. This story's PostgreSQL-based approach is a **deliberate architectural change** for Orion to enable:
   - Cross-device session continuity (PostgreSQL vs local files)
   - Richer session analytics and querying
   - Integration with Orion's memory system
3. Shell scripts provided in this story are **reference implementations** - developers may choose to extend the existing TypeScript hooks instead, adding PostgreSQL queries alongside the file-based handoff system

### PostgreSQL Connection

Use the same connection pattern as other hooks:
- Environment variable: `DATABASE_URL`
- Default: `postgresql://claude:claude_dev@localhost:5432/continuous_claude`
- Connection pooling handled at application level

### Context Size Management

When building `additionalContext`:
- Limit total context to ~2000 tokens
- Prioritize most recent/relevant information
- Truncate long learnings to 200 characters
- Include timestamps for context freshness

### Error Handling

```python
# Pattern for graceful degradation
try:
    conn = psycopg2.connect(db_url)
    # ... database operations ...
except psycopg2.Error as e:
    # Log error but don't fail the hook
    return {
        "permissionDecision": "allow",
        "message": f"Database unavailable: {str(e)}",
        "additionalContext": None  # Skip context injection
    }
```

---

## References

- **Previous Story:** `thoughts/implementation-artifacts/stories/story-2-15-hook-infrastructure-foundation.md`
- **Test Design:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.16 section)
- **Architecture:** `thoughts/planning-artifacts/architecture.md` (Section 10 - Memory System)
- **Epics:** `thoughts/planning-artifacts/epics.md` (Story 2.16 definition)
- **Existing Hooks:** `.claude/hooks/dist/session-*.js` (Reference implementations)

---

## Dev Agent Record

### Agent Model Used

_To be filled by Dev Agent_

### Debug Log References

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

_Files created/modified during implementation:_
- `.claude/hooks/session-register.sh`
- `.claude/hooks/session_start_continuity.py`
- `.claude/hooks/session-symbol-index.sh`
- `.claude/hooks/session-end-cleanup.sh`
- `.claude/hooks/session-outcome.sh`
- `.claude/settings.json` (hook registration)
- `agent-server/src/hooks/session/` (TypeScript implementations if needed)
- `tests/unit/story-2.16-*.spec.ts`
- `tests/integration/story-2.16-*.spec.ts`
- `tests/e2e/story-2.16-*.spec.ts`

---

_Story created: 2026-01-16_
_Author: SM (Scrum Master Agent) - Bob_
_Ultimate context engine analysis completed - comprehensive developer guide created_
