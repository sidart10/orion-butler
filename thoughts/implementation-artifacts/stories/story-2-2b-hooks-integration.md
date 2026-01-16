# Story 2.2b: CC v3 Hooks Integration

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-2b-hooks-integration
**Priority:** P0 (Infrastructure)
**Risk:** MEDIUM

---

## Story

As a developer,
I want Claude Code hooks integrated into Orion,
So that automatic behaviors (search routing, validation, coordination) work.

---

## Acceptance Criteria

### AC1: Hook Registration Infrastructure

**Given** Orion starts up
**When** the hook system initializes
**Then** hooks are registered in `.claude/settings.json`
**And** hooks receive correct lifecycle events
**And** hooks can inject context, block tools, or modify behavior

- [ ] `.claude/settings.json` contains hook registrations for all lifecycle events
- [ ] Hook scripts exist in `.claude/hooks/` directory
- [ ] Hook timeout configuration is appropriate (5-60 seconds per hook type)
- [ ] Matchers correctly filter which tools trigger hooks

### AC2: Session Lifecycle Hooks

**Given** a user starts an Orion session
**When** SessionStart fires
**Then** session is registered in PostgreSQL coordination database
**And** relevant learnings from past sessions are recalled
**And** peer sessions on same project are displayed

**Given** a session ends
**When** SessionEnd fires
**Then** session state is cleaned up
**And** learnings are extracted to archival memory (background)

- [ ] `session-register` hook registers session in PostgreSQL
- [ ] `session-start-recall` hook queries semantic memory for relevant context
- [ ] `session-end-cleanup` hook cleans up and triggers learning extraction
- [ ] Hooks display peer sessions working on same project

### AC3: Tool Interception Hooks (PreToolUse)

**Given** an agent wants to read a code file
**When** Read tool is invoked
**Then** `tldr-read-enforcer` hook intercepts
**And** returns structured TLDR context instead (95% token savings)

**Given** an agent wants to search code
**When** Grep tool is invoked
**Then** `smart-search-router` hook classifies query type
**And** routes to optimal search (AST-grep, TLDR, or Grep)

**Given** an agent wants to edit a file
**When** Edit tool is invoked
**Then** `file-claims` hook checks for conflicts with other sessions
**And** warns if another session is editing the same file

- [ ] `tldr-read-enforcer` blocks Read, returns TLDR context
- [ ] `smart-search-router` classifies and routes search queries
- [ ] `file-claims` prevents concurrent edit conflicts
- [ ] `signature-helper` injects function signatures for edits

### AC4: Validation Hooks (PostToolUse)

**Given** an agent edits a TypeScript file
**When** Edit completes
**Then** `typescript-preflight` runs tsc + linting
**And** type errors are returned immediately for fixing

**Given** an agent writes any code file
**When** Write completes
**Then** `compiler-in-the-loop` validates the code compiles
**And** errors are injected into context

- [ ] `typescript-preflight` runs after TypeScript edits
- [ ] `import-validator` checks import statements
- [ ] `compiler-in-the-loop` validates code changes compile
- [ ] Errors are shown to Claude for immediate fixing

### AC5: User Prompt Hooks

**Given** a user submits a prompt
**When** UserPromptSubmit fires
**Then** `skill-activation-prompt` suggests relevant skills
**And** `memory-awareness` injects relevant past learnings
**And** context warnings are shown (context percentage, limits)

- [ ] `skill-activation-prompt` matches against skill-rules.json
- [ ] `memory-awareness` does fast text search of archival memory
- [ ] Suggestions don't block but inform Claude's response

### AC6: Subagent Coordination Hooks

**Given** Butler spawns a sub-agent
**When** SubagentStart fires
**Then** `subagent-start` hook registers the agent
**And** pattern-specific context is injected (swarm, pipeline, jury)

**Given** a sub-agent completes
**When** SubagentStop fires
**Then** `subagent-stop` marks agent as completed
**And** `subagent-learning` extracts learnings (background)

- [ ] Subagent hooks coordinate multi-agent patterns
- [ ] Agent state is tracked in PostgreSQL
- [ ] Learnings are extracted from subagent transcripts

---

## Tasks / Subtasks

### Task 1: Hook Registration Setup (AC: #1)

- [ ] 1.1 Create `.claude/hooks/` directory structure
- [ ] 1.2 Update `.claude/settings.json` with hook registrations:
```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-register.sh", "timeout": 10 }] },
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start-recall.sh", "timeout": 15 }] }
    ],
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh", "timeout": 10 }] },
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/memory-awareness.sh", "timeout": 10 }] }
    ],
    "PreToolUse": [
      { "matcher": "Read", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/tldr-read-enforcer.sh", "timeout": 20 }] },
      { "matcher": "Grep", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/smart-search-router.sh", "timeout": 15 }] },
      { "matcher": "Edit", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/file-claims.sh", "timeout": 10 }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/typescript-preflight.sh", "timeout": 30 }] },
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/import-validator.sh", "timeout": 15 }] }
    ],
    "SubagentStart": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/subagent-start.sh", "timeout": 10 }] }
    ],
    "SubagentStop": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/subagent-stop.sh", "timeout": 10 }] },
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/subagent-learning.sh", "timeout": 5 }] }
    ],
    "SessionEnd": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-end-cleanup.sh", "timeout": 15 }] }
    ]
  }
}
```
- [ ] 1.3 Create hook launcher script (`.claude/hooks/hook-launcher.sh`)

### Task 2: Session Lifecycle Hooks (AC: #2)

- [ ] 2.1 Create `session-register.sh` - registers session in PostgreSQL:
  - Insert into `sessions` table
  - Query for peer sessions on same project
  - Return JSON with peer session info

- [ ] 2.2 Create `session-start-recall.sh` - recalls relevant learnings:
  - Extract intent from session context
  - Query `archival_memory` with semantic search
  - Return top 3 relevant learnings

- [ ] 2.3 Create `session-end-cleanup.sh` - cleanup and learning extraction:
  - Update continuity ledger timestamps
  - Clean up old agent cache files (7-day retention)
  - Spawn background learning extraction

### Task 3: Tool Interception Hooks (AC: #3)

- [ ] 3.1 Create `tldr-read-enforcer.sh` - TLDR context injection:
  - Check if file is code file (.ts, .py, .go, .rs, etc.)
  - If code: block Read, return TLDR structured context
  - If config/test: allow Read to pass through
  - Return `permissionDecision: deny` with TLDR context in reason

- [ ] 3.2 Create `smart-search-router.sh` - search routing:
  - Classify query as: structural, semantic, or literal
  - Route structural → AST-grep
  - Route semantic → TLDR search
  - Route literal → allow Grep
  - Store search context for downstream hooks

- [ ] 3.3 Create `file-claims.sh` - conflict detection:
  - Query PostgreSQL for file claims
  - If file claimed by another session: warn
  - If unclaimed: claim for current session
  - Return warning in `additionalContext` if conflict

- [ ] 3.4 Create `signature-helper.sh` - signature injection:
  - Extract function calls from edit content
  - Look up signatures from symbol index
  - Inject signatures as additional context

### Task 4: Validation Hooks (AC: #4)

- [ ] 4.1 Create `typescript-preflight.sh` - type checking:
  - Run `tsc --noEmit` on edited file
  - Run `qlty check` for linting
  - If errors: exit 2 with stderr message
  - Claude sees errors immediately

- [ ] 4.2 Create `import-validator.sh` - import validation:
  - Parse import statements
  - Check imports exist
  - Suggest corrections if missing

- [ ] 4.3 Create `compiler-in-the-loop.sh` - multi-language validation:
  - Detect file language
  - Run appropriate compiler/linter
  - Return errors in context

### Task 5: User Prompt Hooks (AC: #5)

- [ ] 5.1 Create `skill-activation-prompt.sh` - skill suggestions:
  - Load skill-rules.json
  - Match user prompt against patterns
  - Return skill suggestions by priority
  - Include context warnings (context %, limits)

- [ ] 5.2 Create `memory-awareness.sh` - memory injection:
  - Extract intent from prompt
  - Fast text search against archival_memory
  - Return MEMORY MATCH context if found

### Task 6: Subagent Hooks (AC: #6)

- [ ] 6.1 Create `subagent-start.sh` - agent registration:
  - Insert into agent tracking table
  - Detect pattern type (swarm, jury, pipeline)
  - Inject pattern-specific context

- [ ] 6.2 Create `subagent-stop.sh` - completion tracking:
  - Mark agent as completed
  - Handle pattern-specific aggregation

- [ ] 6.3 Create `subagent-learning.sh` - learning extraction:
  - Spawn background process
  - Extract learnings from transcript
  - Store in archival_memory

### Task 7: Write Tests (AC: #1-#6)

- [ ] 7.1 Unit test: Hook registration JSON is valid
- [ ] 7.2 Unit test: Each hook script is executable
- [ ] 7.3 Integration test: SessionStart hooks fire and register
- [ ] 7.4 Integration test: PreToolUse Read hook returns TLDR
- [ ] 7.5 Integration test: PostToolUse runs type checking
- [ ] 7.6 E2E test: Full session lifecycle (start → prompt → tool → end)

---

## Dev Notes

### Hook System Architecture

From CC v3 docs/hooks/README.md:

**Lifecycle Events:**
```
+-----------------------------------------------------------------------------------+
|                               HOOK LAYER                                           |
|                                                                                    |
|  +-------------+    +---------------+    +--------------+    +----------------+   |
|  | SessionStart|    | UserPrompt    |    | PreToolUse   |    | PostToolUse    |   |
|  | - Register  |    | - Skill inject|    | - Search rtr |    | - Compiler     |   |
|  | - Recall    |    | - Memory      |    | - TLDR inject|    | - Handoff idx  |   |
|  +-------------+    +---------------+    +--------------+    +----------------+   |
|                                                                                    |
|  +-------------+    +---------------+    +--------------+    +----------------+   |
|  | SubagentSt  |    | SubagentStop  |    | Stop         |    | SessionEnd     |   |
|  | - Register  |    | - Learning    |    | - Coordinator|    | - Cleanup      |   |
|  +-------------+    +---------------+    +--------------+    +----------------+   |
+-----------------------------------------------------------------------------------+
```

### Hook Input/Output Protocol

**Input (via stdin):**
```typescript
interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name?: string;       // PreToolUse, PostToolUse
  tool_input?: object;      // PreToolUse, PostToolUse
  tool_response?: object;   // PostToolUse
  prompt?: string;          // UserPromptSubmit
  cwd: string;
}
```

**Output (via stdout):**
```typescript
interface HookOutput {
  result?: 'continue' | 'block';
  message?: string;  // Injected into Claude's context
  hookSpecificOutput?: {
    hookEventName: string;
    permissionDecision?: 'allow' | 'deny' | 'ask';
    permissionDecisionReason?: string;
    additionalContext?: string;
    updatedInput?: object;  // Modify tool input
  };
}
```

### Exit Code Behavior

| Exit Code | Behavior |
|-----------|----------|
| 0 | Success - JSON processed |
| 2 | Blocking error - stderr shown to Claude |
| Other | Non-blocking error - logged only |

### Hook Categories

**Priority Order:**

1. **Session Lifecycle** - Start/end infrastructure
2. **Tool Interception (PreToolUse)** - Can block/redirect
3. **Validation (PostToolUse)** - Can't block but can error
4. **User Prompt** - Suggest but don't block
5. **Subagent** - Coordinate multi-agent

### File Structure

```
.claude/
  hooks/
    # Session Lifecycle
    session-register.sh
    session-start-recall.sh
    session-end-cleanup.sh

    # Tool Interception
    tldr-read-enforcer.sh
    smart-search-router.sh
    file-claims.sh
    signature-helper.sh

    # Validation
    typescript-preflight.sh
    import-validator.sh
    compiler-in-the-loop.sh

    # User Prompt
    skill-activation-prompt.sh
    memory-awareness.sh

    # Subagent
    subagent-start.sh
    subagent-stop.sh
    subagent-learning.sh

    # Shared utilities
    src/
      utils.ts           # Common TypeScript utilities
      db.ts              # PostgreSQL connection
      tldr.ts            # TLDR API wrapper

  settings.json          # Hook registrations

tests/
  unit/
    story-2.2b-hooks.spec.ts
  integration/
    story-2.2b-hook-lifecycle.spec.ts
```

### PostgreSQL Tables (from CC v3)

```sql
-- Session coordination
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  project TEXT NOT NULL,
  working_on TEXT,
  last_heartbeat TIMESTAMP DEFAULT NOW()
);

-- File locking
CREATE TABLE file_claims (
  file_path TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  claimed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (file_path, session_id)
);
```

### TLDR Integration

The `tldr-read-enforcer` hook uses TLDR-Code for 95% token savings:

```bash
# Instead of raw file read (5000 tokens)
tldr context <file> --project . --depth 2

# Returns structured context (500 tokens):
# - Function signatures
# - Call graph
# - Key logic paths
```

### Critical Design Constraints

1. **Hooks must be fast** - Timeouts are 5-60 seconds
2. **Exit 2 blocks tools** - Use for validation errors
3. **JSON output required** - Invalid JSON is ignored
4. **stderr for errors** - stdout is parsed as JSON
5. **Background for slow ops** - Learning extraction spawns async

---

## Test Considerations

### Test Strategy

| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.2b.1 | Unit | Hook registration JSON valid | Parses without errors |
| 2.2b.2 | Unit | All hook scripts executable | Exit codes work |
| 2.2b.3 | Integration | SessionStart registers | Session in DB |
| 2.2b.4 | Integration | Read hook returns TLDR | 95% fewer tokens |
| 2.2b.5 | Integration | TypeScript preflight catches errors | Type errors shown |
| 2.2b.6 | E2E | Full session lifecycle | All hooks fire correctly |

### Test Code Examples

```typescript
// tests/integration/story-2.2b-hook-lifecycle.spec.ts
import { test, expect, describe } from 'vitest';
import { execSync } from 'child_process';

describe('Story 2.2b: Hooks Integration', () => {

  test('2.2b.3 - SessionStart registers session', async () => {
    const input = JSON.stringify({
      session_id: 'test-session-123',
      hook_event_name: 'SessionStart',
      source: 'startup',
      cwd: process.cwd(),
    });

    const result = execSync(
      `echo '${input}' | ./.claude/hooks/session-register.sh`,
      { encoding: 'utf-8' }
    );

    const output = JSON.parse(result);
    expect(output.message).toContain('Session registered');
  });

  test('2.2b.4 - Read hook returns TLDR context', async () => {
    const input = JSON.stringify({
      session_id: 'test-session-123',
      hook_event_name: 'PreToolUse',
      tool_name: 'Read',
      tool_input: { file_path: 'src/index.ts' },
      cwd: process.cwd(),
    });

    const result = execSync(
      `echo '${input}' | ./.claude/hooks/tldr-read-enforcer.sh`,
      { encoding: 'utf-8' }
    );

    const output = JSON.parse(result);
    expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    expect(output.hookSpecificOutput.permissionDecisionReason).toContain('TLDR');
  });

});
```

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2-1 (Butler Agent Core)** - Agent infrastructure
- **Story 2-2 (Agent Prompt Templates)** - Template loading

### Downstream Dependencies (blocked by this story)

- **Story 2.3 (Sub-Agent Spawning)** - Uses subagent hooks
- **Story 2.5-2.9 (Specialist Agents)** - All benefit from validation hooks

### External Dependencies

- **PostgreSQL** - Session coordination tables
- **TLDR-Code** - Installed via `uv tool install llm-tldr`
- **qlty** - TypeScript linting

---

## References

- [Source: docs/hooks/README.md] - Complete hook system documentation
- [Source: docs/Cont.-claude-ARCHITECTURE.md#2-hook-layer] - Hook layer architecture
- [Source: docs/Cont.-claude-ARCHITECTURE.md#6-data-flow-diagrams] - Hook flow diagrams

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
