# Story 2.2b: CC v3 Hooks Integration

Status: ready-for-dev

## Story

As a developer,
I want Claude Code hooks integrated into Orion,
so that automatic behaviors (search routing, validation, coordination) work.

## Acceptance Criteria

### AC1: Hook System Initialization
**Given** Orion starts up
**When** the hook system initializes
**Then** hooks are registered in `.claude/settings.json`
**And** hooks receive correct lifecycle events
**And** hooks can inject context, block tools, or modify behavior

### AC2: Read Tool TLDR Interception
**Given** an agent wants to read a code file
**When** Read tool is invoked
**Then** `tldr-read-enforcer` hook intercepts and returns TLDR context (95% token savings)

### AC3: TypeScript Validation on Edit
**Given** an agent edits a TypeScript file
**When** Edit completes
**Then** `typescript-preflight` runs type checking and returns errors immediately

### AC4: User Prompt Context Enhancement
**Given** a user submits a prompt
**When** UserPromptSubmit fires
**Then** `skill-activation-prompt` suggests relevant skills
**And** `memory-awareness` injects relevant past learnings

## Tasks / Subtasks

- [ ] Task 1: Verify Hook Registration (AC: #1)
  - [ ] 1.1: Validate `.claude/settings.json` has all required hook categories
  - [ ] 1.2: Ensure hook scripts are executable (chmod +x)
  - [ ] 1.3: Verify lifecycle events flow correctly (SessionStart, PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionEnd)
  - [ ] 1.4: Test hooks can inject `additionalContext` into responses
  - [ ] 1.5: Test hooks can return `permissionDecision: deny` to block tools

- [ ] Task 2: Implement/Verify PreToolUse Read Hook (AC: #2)
  - [ ] 2.1: Verify `tldr-read-enforcer.mjs` exists and runs correctly
  - [ ] 2.2: Test TLDR context injection for TypeScript/JavaScript files
  - [ ] 2.3: Validate 95% token savings metric via comparison
  - [ ] 2.4: Ensure fallback to full Read when TLDR unavailable

- [ ] Task 3: Implement/Verify PostToolUse TypeScript Validation (AC: #3)
  - [ ] 3.1: Verify `typescript-preflight.mjs` runs after Edit/Write
  - [ ] 3.2: Test type error detection and immediate feedback
  - [ ] 3.3: Verify `compiler-in-the-loop.mjs` integration
  - [ ] 3.4: Test error formatting for LLM comprehension

- [ ] Task 4: Implement/Verify UserPromptSubmit Hooks (AC: #4)
  - [ ] 4.1: Verify `skill-activation-prompt.mjs` suggests relevant skills
  - [ ] 4.2: Verify `memory-awareness.mjs` queries PostgreSQL for relevant learnings
  - [ ] 4.3: Test context injection into system prompt
  - [ ] 4.4: Ensure graceful degradation if PostgreSQL unavailable

- [ ] Task 5: Integration Testing (AC: All)
  - [ ] 5.1: Full session lifecycle test (start -> prompt -> tool -> end)
  - [ ] 5.2: Test hook timeout handling (configured per hook)
  - [ ] 5.3: Test hook failure isolation (one failure doesn't block others)
  - [ ] 5.4: Verify hook execution logging for debugging

## Dev Notes

### Hook Categories (34 hooks total from CC v3)

| Category | Hooks | Purpose |
|----------|-------|---------|
| **Session Lifecycle (4)** | session-register, session-start-recall, session-end-cleanup, session-outcome | Manage session state in PostgreSQL |
| **User Prompt (3)** | skill-activation-prompt, memory-awareness, premortem-suggest | Enhance prompts with context |
| **Tool Interception (4)** | tldr-read-enforcer, smart-search-router, file-claims, signature-helper | Optimize tool usage |
| **Validation (3)** | typescript-preflight, compiler-in-the-loop, import-validator | Ensure code quality |
| **Subagent (3)** | subagent-start, subagent-stop, subagent-learning | Track agent spawning |

### Current Hook Infrastructure Status

**VERIFIED: `.claude/settings.json` already contains comprehensive hook configuration:**

- **PreToolUse hooks:**
  - `pre-tool-use-broadcast.mjs` - General broadcast
  - `path-rules.mjs` (matcher: Read|Edit|Write) - Path validation
  - `tldr-read-enforcer.mjs` (matcher: Read) - Token optimization
  - `smart-search-router.mjs` (matcher: Grep) - Search routing
  - `tldr-context-inject.mjs` (matcher: Task) - Context for sub-agents
  - `file-claims.mjs` (matcher: Edit) - File locking
  - `signature-helper.mjs` (matcher: Edit) - Function signatures

- **PostToolUse hooks:**
  - `typescript-preflight.mjs` (matcher: Edit|Write) - Type checking
  - `compiler-in-the-loop.mjs` (matcher: Edit|Write) - Compilation errors
  - `import-validator.mjs` (matcher: Edit|Write) - Import validation
  - `import-error-detector.mjs` (matcher: Bash) - Import error detection

- **SessionStart hooks:**
  - `persist-project-dir.sh` - Project directory persistence
  - `session-register.mjs` - PostgreSQL session registration
  - `session-start-continuity.mjs` (matcher: resume|compact|clear) - Context continuity
  - `session-start-tldr-cache.mjs` - TLDR cache warmup

- **UserPromptSubmit hooks:**
  - `skill-activation-prompt.mjs` - Skill suggestions
  - `memory-awareness.mjs` - Memory context injection
  - `premortem-suggest` (Python) - Risk assessment
  - `impact-refactor.mjs` - Refactoring impact analysis

- **SessionEnd hooks:**
  - `session-end-cleanup.mjs` - Cleanup operations
  - `session-outcome.mjs` - Outcome logging

- **Stop hooks:**
  - `auto-handoff-stop` (Python) - Auto-generate handoffs
  - `compiler-in-the-loop-stop.mjs` - Final compilation check

### Architecture Compliance

[Source: thoughts/planning-artifacts/architecture.md]

**ARCH-XXX References:**
- Hooks are CLI-based, spawning via Node.js or Python scripts
- Use `$HOME/.claude/hooks/dist/` for compiled JS hooks
- Use `uv run $HOME/.claude/hooks/hook_launcher.py` for Python hooks
- Timeout handling: Each hook has configurable timeout (5-120 seconds)

### File Structure Requirements

```
.claude/
├── hooks/
│   ├── dist/                    # Compiled JS hooks (mjs)
│   │   ├── tldr-read-enforcer.mjs
│   │   ├── typescript-preflight.mjs
│   │   ├── memory-awareness.mjs
│   │   ├── skill-activation-prompt.mjs
│   │   ├── session-register.mjs
│   │   ├── session-end-cleanup.mjs
│   │   └── shared/              # Shared utilities
│   ├── src/                     # TypeScript source
│   ├── hook_launcher.py         # Python hook wrapper
│   ├── tsconfig.json
│   └── package.json
├── settings.json                # Hook registration
└── settings.local.json          # Local overrides
```

### Library/Framework Requirements

| Library | Version | Purpose |
|---------|---------|---------|
| Node.js | 18+ | Hook runtime |
| TypeScript | 5.x | Hook source |
| uv | 0.5+ | Python hook runner |
| pg (postgres) | 8.x | PostgreSQL client in hooks |
| better-sqlite3 | 11.x | Local SQLite fallback |

### Testing Requirements

[Source: thoughts/planning-artifacts/test-design-epic-2.md]

**Test IDs: 2.2b.1 - 2.2b.6**

| Test ID | Type | Scenario | Expected Result |
|---------|------|----------|-----------------|
| 2.2b.1 | Unit | Hook registration JSON is valid | No parse errors |
| 2.2b.2 | Unit | All hook scripts are executable | chmod +x verified |
| 2.2b.3 | Integration | SessionStart hooks register session | PostgreSQL insert |
| 2.2b.4 | Integration | PreToolUse Read hook returns TLDR | TLDR context injected |
| 2.2b.5 | Integration | PostToolUse runs type checking | TypeScript errors returned |
| 2.2b.6 | E2E | Full session lifecycle fires | Start -> prompt -> tool -> end |

**Test Code Location:** `tests/unit/story-2.2b-hooks-registration.spec.ts`, `tests/integration/story-2.2b-hooks-lifecycle.spec.ts`

### Critical Implementation Notes

1. **Hook Timeout Handling:**
   - Each hook has a timeout configured in settings.json
   - Timeouts range from 5s (simple) to 120s (post-tool-use-tracker)
   - On timeout, hook fails silently - does NOT block main flow

2. **Graceful Degradation (C-005 Mitigation):**
   - Hook failures are logged but don't crash app
   - If PostgreSQL unavailable, memory hooks return empty context
   - TLDR hook falls back to full Read if TLDR unavailable

3. **Hook Response Format:**
   ```json
   {
     "additionalContext": "string to inject",
     "permissionDecision": "allow" | "ask" | "deny",
     "message": "Optional message to user",
     "validationError": "ERROR_CODE"
   }
   ```

4. **Environment Variables Required:**
   - `CLAUDE_PROJECT_DIR` - Current project directory
   - `DATABASE_URL` - PostgreSQL connection string
   - `HOME` - User home directory for hook paths

### Project Structure Notes

- Hook infrastructure already exists in `.claude/hooks/`
- Settings already configured in `.claude/settings.json`
- Build process: `cd .claude/hooks && npm run build`
- TypeScript source in `.claude/hooks/src/`, compiled to `.claude/hooks/dist/`

### Dependencies

- **Prerequisite Stories:** 2.2 (Agent Prompt Templates) - agents need to exist for hooks to enhance
- **Blocking Stories:** 2.15 (Hook Infrastructure Foundation), 2.16-2.19 (specialized hook stories)
- **External:** PostgreSQL must be running for session/memory hooks

### References

- [Source: thoughts/planning-artifacts/epics.md#Story-2.2b]
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#Story-2.2b]
- [Source: .claude/settings.json - Current hook configuration]
- [Source: thoughts/planning-artifacts/architecture.md#11.2-Braintrust-Integration]

## Dev Agent Record

### Agent Model Used

(To be filled during implementation)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation)
