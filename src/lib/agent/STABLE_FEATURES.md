# Claude Agent SDK - Stable Features Reference

**SDK Version:** @anthropic-ai/claude-agent-sdk v0.1.77
**Last Updated:** 2026-01-26

## Architecture Overview

Orion Butler uses the **sidecar pattern** for SDK integration:

```
Frontend (React) → Rust IPC → Node.js Sidecar → Claude Agent SDK → Claude
```

The SDK runs in a separate Node.js process (`sdk-runner.mjs`), NOT in the frontend TypeScript.
This means:
- Frontend types are our own definitions that mirror the JSON output
- SDK types are not directly imported into the frontend
- Communication is via JSON-line protocol over stdout

## Stable Features (Approved for Use)

### 1. Query Function

The primary SDK entry point. Returns an `AsyncGenerator<SDKMessage>`.

```javascript
import { query } from '@anthropic-ai/claude-agent-sdk';

const q = query({
  prompt: 'Hello',
  options: {
    model: 'claude-sonnet-4-5-20250929',
    includePartialMessages: true,  // Enable streaming
    resume: 'session-id',          // Session continuity
    maxTurns: 10,
    maxBudgetUsd: 1.0,
  }
});

for await (const message of q) {
  // Handle SDKMessage
}
```

### 2. Session Management

| Feature | Option | Description |
|---------|--------|-------------|
| Resume | `resume: sessionId` | Continue existing conversation |
| Fork | `forkSession: true` | Branch from existing session |
| Continue | `continue: true` | Continue most recent session |
| Persist | `persistSession: false` | Disable disk persistence |

**Recommendation:** Use `resume` for all session types. Avoid `continue` (global state).

### 3. Built-in Tools

All tools from Claude Code are available:

| Tool | Purpose |
|------|---------|
| Read | Read files |
| Write | Write files |
| Edit | Edit files |
| Bash | Execute commands |
| Glob | Find files by pattern |
| Grep | Search file contents |
| Task | Spawn sub-agents |
| Skill | Invoke skills |
| WebFetch | Fetch URLs |
| WebSearch | Web search |
| NotebookEdit | Edit Jupyter notebooks |
| TodoWrite | Task tracking |

### 4. Permission Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `'default'` | Standard prompting | Production |
| `'plan'` | Planning only, no execution | Preview |
| `'acceptEdits'` | Auto-accept file edits | Trusted automation |
| `'dontAsk'` | Deny if not pre-approved | Strict mode |
| `'bypassPermissions'` | Skip all checks (DANGEROUS) | Testing only |

**WARNING:** Never expose `bypassPermissions` to the UI. Only use in development with explicit env flag.

### 5. Prompt Caching (Automatic)

The SDK handles prompt caching internally. Optimizations:
- Place static content (system prompts, tools) at message start
- Cache hits require identical content up to breakpoint
- Default TTL: 5 minutes

### 6. MCP Integration

```javascript
options: {
  mcpServers: {
    'my-server': {
      command: 'node',
      args: ['./my-mcp-server.js']
    }
  }
}
```

### 7. Hooks System

Available hook events:
- PreToolUse, PostToolUse, PostToolUseFailure
- Notification, UserPromptSubmit
- SessionStart, SessionEnd, Stop
- SubagentStart, SubagentStop
- PreCompact, PermissionRequest

**Note:** Skills and agents support hot-reload (NFR-6.2). Hooks do NOT.

## Beta Features (DO NOT USE)

| Feature | ID | Reason |
|---------|-----|--------|
| 1M Context | `context-1m-2025-08-07` | Beta, may change |

## SDK Message Types

The SDK emits `SDKMessage` which is a discriminated union by `type`:

| Type | Interface | Description |
|------|-----------|-------------|
| `'assistant'` | `SDKAssistantMessage` | Model response (has `message.content`) |
| `'user'` | `SDKUserMessage` | User input |
| `'result'` | `SDKResultMessage` | Final result (success or error) |
| `'system'` | `SDKSystemMessage` | Init info, status, hooks |
| `'stream_event'` | `SDKPartialAssistantMessage` | Streaming chunks |
| `'tool_progress'` | `SDKToolProgressMessage` | Tool execution progress |
| `'auth_status'` | `SDKAuthStatusMessage` | Auth status |

### Content Blocks (in SDKAssistantMessage.message.content)

```typescript
type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'thinking'; thinking: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; content: unknown }
```

### Result Subtypes

```typescript
type ResultSubtype =
  | 'success'                          // Has result, usage
  | 'error_during_execution'           // Has errors array
  | 'error_max_turns'                  // Exceeded turns
  | 'error_max_budget_usd'             // Exceeded budget
  | 'error_max_structured_output_retries' // Structured output failed
```

## Usage Tracking

Available in `SDKResultMessage`:

```typescript
{
  total_cost_usd: number;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
  modelUsage: {
    [modelName: string]: {
      inputTokens: number;
      outputTokens: number;
      costUSD: number;
      contextWindow: number;
    }
  }
}
```

## Error Detection

Errors are NOT exceptions. Detect via message type/subtype:

```javascript
if (message.type === 'result' && message.subtype !== 'success') {
  // Error occurred
  if (message.subtype === 'error_max_budget_usd') {
    // Budget exceeded
  }
}

if (message.type === 'assistant' && message.error) {
  // API error (rate limit, auth, etc.)
}
```

## Session ID Format (Orion Convention)

Per architecture.md:

| Type | Pattern | Example |
|------|---------|---------|
| daily | `orion-daily-YYYY-MM-DD` | `orion-daily-2026-01-26` |
| project | `orion-project-{slug}` | `orion-project-inbox-redesign` |
| inbox | `orion-inbox-YYYY-MM-DD` | `orion-inbox-2026-01-26` |
| adhoc | `orion-adhoc-{uuid}` | `orion-adhoc-550e8400-...` |

## References

- SDK Docs: https://platform.claude.com/docs/en/agent-sdk/typescript
- Session Management: https://platform.claude.com/docs/en/agent-sdk/sessions
- Architecture: /thoughts/planning-artifacts/architecture.md
- PRD v2: /thoughts/planning-artifacts/prd-v2.md
