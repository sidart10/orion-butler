# Story 2.15: Hook Infrastructure Foundation

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-15-hook-infrastructure-foundation
**Priority:** P0 (Infrastructure)
**Risk:** HIGH

---

## Story

As a developer,
I want the hook system from Continuous Claude v3 migrated,
So that Orion can intercept and enhance agent behavior automatically.

---

## Acceptance Criteria

### AC1: Hook Registration and Configuration

**Given** Orion starts up
**When** the hook system initializes
**Then** hooks are registered from `.claude/settings.json`
**And** `hook_launcher.py` is available for Python hooks
**And** shell hooks are executable

**Given** shell hooks exist in `.claude/hooks/`
**When** the system validates hook executability
**Then** all `.sh` files have executable permissions (chmod +x)
**And** permission errors are reported during initialization
**And** non-executable hooks are logged as warnings

- [ ] `.claude/settings.json` contains valid hook registration JSON
- [ ] Hook registration JSON parses without errors
- [ ] Each hook entry has `command`, `timeout` (optional), and event binding
- [ ] Shell hooks (`.sh`) have executable permissions (`chmod +x`)
- [ ] Python hooks use `hook_launcher.py` wrapper for execution
- [ ] Hook paths are relative to `.claude/hooks/` directory

### AC2: Hook Lifecycle Events

**Given** a hook is registered for an event
**When** that event fires (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop)
**Then** the hook receives the event payload
**And** the hook can modify behavior (inject context, block, allow)
**And** hook execution is logged for debugging

**Hook Lifecycle Events:**
| Event | When It Fires | Available Actions |
|-------|---------------|-------------------|
| **SessionStart** | App launch, session init | Inject context, register session, load preferences |
| **UserPromptSubmit** | User sends message | Inject memories, suggest skills, trace to observability |
| **PreToolUse** | Before tool executes | Check permissions (allow/deny/ask), route to specialist, inject context |
| **PostToolUse** | After tool completes | Validate output, extract learnings, update history |
| **Stop** | Session end, app close | Cleanup, persist state, create handoffs |

- [ ] All 5 lifecycle events are supported
- [ ] Event payloads include appropriate context (sessionId, projectDir, toolName, etc.)
- [ ] Hooks can return `permissionDecision` (allow, deny, ask) for PreToolUse
- [ ] Hooks can return `additionalContext` string for context injection
- [ ] Multiple hooks per event execute in registration order
- [ ] Hook execution time is logged with timestamps

### AC3: Graceful Degradation and Error Handling

**Given** a hook fails
**When** the error occurs
**Then** the system logs the error with hook name
**And** continues execution (graceful degradation)
**And** user is not blocked by hook failures

- [ ] Hook failures are caught and do not crash the application
- [ ] Error log includes: hook name, event type, error message, stack trace
- [ ] Failed hooks do not block other hooks in the same event
- [ ] Failed hooks do not prevent main flow from continuing
- [ ] Timeout protection prevents hooks from hanging indefinitely (default: 30 seconds)
- [ ] Optional `continueOnError: true` flag (default behavior)

### AC4: Environment and Context Passing

**Given** a hook executes
**When** it receives the event payload
**Then** it has access to standard environment variables
**And** can access project and session context

**Required Environment Variables:**
| Variable | Description |
|----------|-------------|
| `CLAUDE_PROJECT_DIR` | Absolute path to project root |
| `HOOK_EVENT` | Event type (SessionStart, PreToolUse, etc.) |
| `SESSION_ID` | Current session identifier |
| `HOOK_PAYLOAD` | JSON stringified event payload (stdin for Python) |
| `HOOK_TIMEOUT` | Hook timeout in milliseconds (from config, default: 30000) |

- [ ] `hook_launcher.py` passes payload via stdin as JSON
- [ ] Shell hooks receive payload via environment variables
- [ ] `CLAUDE_PROJECT_DIR` is always set to absolute path
- [ ] `HOOK_EVENT` matches the triggering event name
- [ ] Hooks can read from stdin (Python) or env vars (shell)
- [ ] Hook output is captured from stdout as JSON

---

## Technical Notes

### Architecture Overview

```
Hook System Architecture
========================

+---------------------+      +----------------------+
|   Orion App         |      |  .claude/settings.json|
|   (Agent Server)    | ---> |  hooks configuration  |
+---------------------+      +----------------------+
         |
         v
+----------------------+
|   HookRunner         |
|   - registerHooks()  |
|   - fireEvent()      |
|   - executeCommand() |
+----------------------+
         |
         +----> SessionStart hooks
         +----> UserPromptSubmit hooks
         +----> PreToolUse hooks
         +----> PostToolUse hooks
         +----> Stop hooks

         |
         v
+----------------------+     +----------------------+
|  Shell Hooks (.sh)   |     |  Python Hooks (.py)  |
|  Direct execution    |     |  via hook_launcher   |
+----------------------+     +----------------------+
```

### Hook Registration Format (settings.json)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "session-register.sh",
        "timeout": 5000
      },
      {
        // NOTE: "uv run python" ensures consistent Python environment
        // with project dependencies (per pyproject.toml). Using plain
        // "python" may pick up system Python without required packages.
        "command": "uv run python hook_launcher.py session_start_continuity.py",
        "timeout": 10000
      }
    ],
    "UserPromptSubmit": [
      {
        "command": "memory-awareness.sh",
        "timeout": 5000
      }
    ],
    "PreToolUse": [
      {
        "command": "uv run python hook_launcher.py pre_tool_permission.py",
        "timeout": 3000
      }
    ],
    "PostToolUse": [
      {
        "command": "post-tool-learning.sh",
        "timeout": 5000
      }
    ],
    "Stop": [
      {
        "command": "session-cleanup.sh",
        "timeout": 5000
      }
    ]
  }
}
```

### Core Infrastructure Files to Migrate

| File | Purpose | Size (CC v3) |
|------|---------|--------------|
| `hook_launcher.py` | Python hook execution wrapper, handles stdin/stdout JSON | ~11KB |
| `braintrust_hooks.py` | Observability integration for tracing | ~23KB |
| `session_start_continuity.py` | Session state restoration, loads previous context | ~29KB |
| `pre_compact_continuity.py` | Context preservation before compaction | ~15KB |

### HookRunner Implementation

```typescript
// agent-server/src/hooks/runner.ts

interface HookConfig {
  command: string;
  timeout?: number;
  continueOnError?: boolean;
}

interface HookResult {
  permissionDecision?: 'allow' | 'deny' | 'ask';
  additionalContext?: string;
  message?: string;
  error?: string;
}

class HookRunner {
  private hooks: Map<string, HookConfig[]>;
  private logger: Logger;

  async registerHooks(settingsPath: string): Promise<void> {
    // NOTE: Intentional synchronous read during startup initialization.
    // This is acceptable because:
    // 1. Registration only happens once at app start
    // 2. settings.json is small (<1KB typically)
    // 3. Simplifies initialization sequencing (hooks must be ready before first event)
    // For runtime config reloading, use async fs/promises.readFile instead.
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    for (const [event, configs] of Object.entries(settings.hooks)) {
      this.hooks.set(event, configs as HookConfig[]);
    }
  }

  async fireEvent(event: string, payload: object): Promise<HookResult[]> {
    const configs = this.hooks.get(event) || [];
    const results: HookResult[] = [];

    for (const config of configs) {
      try {
        const result = await this.executeHook(config, event, payload);
        results.push(result);
      } catch (error) {
        this.logger.error(`Hook failed: ${config.command}`, { event, error });
        if (!config.continueOnError) {
          // By default, continue on error
        }
      }
    }

    return results;
  }

  private async executeHook(
    config: HookConfig,
    event: string,
    payload: object
  ): Promise<HookResult> {
    const env = {
      ...process.env,
      CLAUDE_PROJECT_DIR: this.projectDir,
      HOOK_EVENT: event,
      SESSION_ID: payload.sessionId || '',
    };

    const timeout = config.timeout || 30000;
    const startTime = Date.now();

    // Execute command and capture output
    const { stdout, stderr } = await execWithTimeout(
      config.command,
      { env, cwd: join(this.projectDir, '.claude/hooks') },
      timeout
    );

    const elapsed = Date.now() - startTime;
    this.logger.debug(`Hook completed: ${config.command}`, { elapsed, event });

    return JSON.parse(stdout) as HookResult;
  }
}
```

### hook_launcher.py Pattern

```python
#!/usr/bin/env python3
"""
Hook launcher for Python hooks.
Reads JSON payload from stdin, executes the specified hook module,
and writes JSON result to stdout.
"""
import sys
import json
import importlib.util
from pathlib import Path

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No hook module specified"}))
        sys.exit(1)

    hook_module_name = sys.argv[1]
    hook_path = Path(__file__).parent / hook_module_name

    # Read payload from stdin
    payload = json.loads(sys.stdin.read())

    # Load and execute hook module
    spec = importlib.util.spec_from_file_location("hook", hook_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    # Call the hook's main function
    result = module.run(payload)

    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

---

## Dependencies

### Internal Dependencies
- **Story 1.5: Agent Server Process** - HookRunner runs within agent server
- **Story 1.4: SQLite Database Setup** - Hooks may query local database
- **Epic 1 infrastructure** - Basic app structure must exist

### External Dependencies
- `uv` (Python package runner) - For Python hook execution
- `better-sqlite3` - For database access in hooks
- PostgreSQL connection - For session registration (cross-session state)

### Depends On These Stories
| Story | Dependency |
|-------|------------|
| 1.4 | SQLite database for local queries |
| 1.5 | Agent server process hosts HookRunner |
| 2.2b | CC v3 Hooks Integration - defines hook registration, lifecycle events, and hook categories that this infrastructure supports |

### These Stories Depend On 2.15
| Story | Why |
|-------|-----|
| 2.16 | Session lifecycle hooks extend this infrastructure |
| 2.17 | Context injection hooks build on hook system |
| 2.18 | Tool routing hooks use PreToolUse events |
| 2.19 | Validation hooks use PreToolUse/PostToolUse |
| 2.2b | CC v3 hooks integration assumes infrastructure exists |

---

## Test Considerations

### Unit Tests (tests/unit/story-2.15-*.spec.ts)

**2.15.U1 - Hook Registration JSON Validation**
```typescript
test('hook registration JSON is valid', () => {
  const config = JSON.parse(readFileSync('.claude/settings.json', 'utf-8'));
  const result = validateHookConfig(config.hooks);
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

**2.15.U2 - All Hook Scripts Executable**
```typescript
test('all hook scripts are executable', () => {
  const settings = JSON.parse(readFileSync(join(CLAUDE_DIR, 'settings.json'), 'utf-8'));
  const errors: string[] = [];

  for (const event of Object.keys(settings.hooks)) {
    for (const hook of settings.hooks[event]) {
      const scriptPath = hook.command.split(' ')[0];
      if (!scriptPath.endsWith('.py')) {
        try {
          accessSync(join(CLAUDE_DIR, 'hooks', scriptPath), constants.X_OK);
        } catch {
          errors.push(`${scriptPath} is not executable`);
        }
      }
    }
  }

  expect(errors).toHaveLength(0);
});
```

**2.15.U3 - Environment Variables Passed Correctly**
```typescript
test('hook_launcher.py passes correct environment', async () => {
  const runner = new HookRunner();
  let capturedEnv: any;

  vi.spyOn(runner, 'executeCommand').mockImplementation(async (cmd, env) => {
    capturedEnv = env;
    return { stdout: '{}', stderr: '' };
  });

  await runner.fireEvent('UserPromptSubmit', {
    userMessage: 'Hello',
    sessionId: 'sess-001',
  });

  expect(capturedEnv.CLAUDE_PROJECT_DIR).toBeTruthy();
  expect(capturedEnv.HOOK_EVENT).toBe('UserPromptSubmit');
});
```

### Integration Tests (tests/integration/story-2.15-*.spec.ts)

**2.15.I1 - SessionStart Hooks Fire on App Launch**
```typescript
test('SessionStart hooks fire on initialization', async () => {
  const runner = new HookRunner();
  const fireSpy = vi.spyOn(runner, 'fireEvent');

  await runner.initialize();

  expect(fireSpy).toHaveBeenCalledWith('SessionStart', expect.any(Object));
});
```

**2.15.I2 - Hook Failures Logged and Don't Crash App**
```typescript
test('hook failures are logged and don\'t crash app', async () => {
  const runner = new HookRunner();
  const logSpy = vi.spyOn(runner.logger, 'error');

  runner.registerHook('SessionStart', {
    command: 'exit 1', // Simulates failure
    timeout: 1000,
  });

  await expect(runner.fireEvent('SessionStart', {})).resolves.not.toThrow();

  expect(logSpy).toHaveBeenCalledWith(
    expect.stringContaining('Hook failed'),
    expect.any(Object)
  );
});
```

### E2E Tests (tests/e2e/story-2.15-*.spec.ts)

**2.15.E1 - Full Lifecycle Fires Correctly**
```typescript
test('full hook lifecycle fires correctly', async ({ page }) => {
  // This test validates the complete flow:
  // SessionStart -> UserPromptSubmit -> PreToolUse -> PostToolUse -> Stop

  await page.goto('/chat');

  // Wait for SessionStart hooks
  await page.waitForFunction(() => window.__hooksFired?.includes('SessionStart'));

  // Submit a message (triggers UserPromptSubmit)
  await page.fill('[data-testid="chat-input"]', 'Search for John');
  await page.click('[data-testid="send-button"]');

  // Should fire PreToolUse and PostToolUse
  await page.waitForFunction(() =>
    window.__hooksFired?.includes('PreToolUse') &&
    window.__hooksFired?.includes('PostToolUse')
  );

  // Close app (triggers Stop)
  // Note: E2E framework must support app lifecycle testing
});
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create `agent-server/src/hooks/runner.ts` with HookRunner class
- [ ] Implement hook registration from settings.json
- [ ] Implement `fireEvent()` with proper error handling
- [ ] Add timeout protection for hook execution
- [ ] Create logging infrastructure for hook debugging

### Phase 2: Python Hook Support
- [ ] Migrate `hook_launcher.py` from CC v3
- [ ] Set up `uv` integration for Python hook execution
- [ ] Test stdin/stdout JSON passing
- [ ] Verify environment variable passing

### Phase 3: Shell Hook Support
- [ ] Implement shell hook execution via child_process
- [ ] Set up executable permission checking
- [ ] Test environment variable injection
- [ ] Verify stdout capture for results

### Phase 4: Integration
- [ ] Wire HookRunner into agent server lifecycle:
  - [ ] Import HookRunner into `agent-server/src/index.ts`
  - [ ] Initialize HookRunner in server bootstrap sequence
  - [ ] Call `runner.fireEvent('SessionStart', {...})` in app startup handler
  - [ ] Call `runner.fireEvent('UserPromptSubmit', {...})` when chat message received
  - [ ] Call `runner.fireEvent('PreToolUse', {...})` before tool execution in tool handler
  - [ ] Call `runner.fireEvent('PostToolUse', {...})` after tool execution completes
  - [ ] Call `runner.fireEvent('Stop', {...})` in shutdown handler / window close
- [ ] Fire SessionStart on app initialization
- [ ] Wire UserPromptSubmit to chat flow
- [ ] Wire PreToolUse/PostToolUse to tool execution
- [ ] Fire Stop on session end

### Phase 5: Testing & Documentation
- [ ] Write unit tests for hook validation
- [ ] Write integration tests for lifecycle events
- [ ] Write E2E test for full lifecycle
- [ ] Document hook development guide

---

## Dev Notes

### Migration from CC v3

The hook infrastructure in Continuous Claude v3 is well-established and should be migrated with minimal changes. Key considerations:

1. **hook_launcher.py** - Works as-is, already exists at `.claude/hooks/hook_launcher.py`
2. **Shell hooks** - May need path adjustments for Orion's structure
3. **Environment variables** - Ensure `CLAUDE_PROJECT_DIR` points to Orion project root
4. **Python dependencies** - Use `uv` for consistent Python environment

**Source Files in This Codebase:**
- Hook launcher: `.claude/hooks/hook_launcher.py` (already present)
- Shell hooks: `.claude/hooks/*.sh` (existing implementations)
- TypeScript hooks (compiled): `.claude/hooks/dist/*.js` and `.claude/hooks/dist/*.mjs`
- Reference Python hooks: See existing `.claude/hooks/post_tool_use_tracker.py`

### Performance Considerations

- Hooks execute synchronously in registration order
- Consider parallelizing independent hooks in future optimization
- Timeout defaults to 30 seconds; adjust based on hook complexity
- Log execution times for performance monitoring

### Security Considerations

- Hooks execute with same permissions as the agent server
- Review hook scripts for security before deployment
- Avoid passing sensitive data in environment variables where possible
- Consider hook sandboxing for untrusted hooks (future enhancement)

### Debugging Tips

1. Check `.claude/hooks/` for hook scripts
2. Verify permissions: `ls -la .claude/hooks/`
3. Test hooks manually: `cd .claude/hooks && ./my-hook.sh`
4. Check agent server logs for hook execution traces
5. Use `HOOK_DEBUG=1` environment variable for verbose logging

### E2E Testing Support

For E2E tests to verify hook execution, hooks must expose fired events via a global array in development mode:

```typescript
// In agent-server, when NODE_ENV === 'development':
// After each hook fires, push the event name to window.__hooksFired
declare global {
  interface Window {
    __hooksFired?: string[];
  }
}

// HookRunner should call this after firing each event:
if (process.env.NODE_ENV === 'development') {
  // Expose to Playwright via IPC or window global
  window.__hooksFired = window.__hooksFired || [];
  window.__hooksFired.push(eventName);
}
```

This allows E2E tests to wait for specific hooks: `await page.waitForFunction(() => window.__hooksFired?.includes('SessionStart'))`

---

## Resolved Design Decisions

1. **Q:** Should hooks be able to modify the user's message before it reaches the agent?
   **A:** Yes, via `UserPromptSubmit` with `additionalContext` return value. (RESOLVED)

2. **Q:** How do we handle hooks that need async operations (API calls, database queries)?
   **A:** Python hooks support async; shell hooks should complete quickly or use background jobs. (RESOLVED)

3. **Q:** Should we support TypeScript hooks in addition to Python/shell?
   **A:** Not in MVP. Consider for v2 if there's demand. (RESOLVED - TypeScript hooks already exist in .claude/hooks/dist/ as compiled JS)

---

## References

- **CC v3 Hook Documentation:** `opc/.claude/hooks/README.md`
- **Test Design:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.15 section)
- **Architecture:** `thoughts/planning-artifacts/architecture-diagrams.md` (Hook Lifecycle diagram)
- **Epics:** `thoughts/planning-artifacts/epics.md` (Story 2.15-2.19 definitions)

---

_Story created: 2026-01-16_
_Author: SM (Scrum Master Agent)_
