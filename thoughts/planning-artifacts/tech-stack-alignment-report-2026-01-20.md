# Tech Stack Alignment Report: Claude Agent SDK

**Date:** 2026-01-20
**Auditor:** Claude Opus 4.5 (Main) + Oracle + Scout Agents
**Scope:** Planning artifacts alignment with Claude Agent SDK

---

## Executive Summary

### Verdict: MOSTLY COHERENT (94.5%) ✅

The architecture documentation (v1.3) correctly distinguishes between:
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) - Primary integration
- **Direct Claude API** (`@anthropic-ai/sdk`) - Secondary, for batch processing

**One critical issue needs fixing:** Test design documents mock the wrong package.

---

## 1. SDK vs API: What's the Difference?

### Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`)

This is **Claude Code exposed as a library**. It provides:

| Feature | Description |
|---------|-------------|
| **Agent Loop** | Automatic tool orchestration (gather → act → verify → repeat) |
| **Built-in Tools** | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch, Task, AskUserQuestion, TodoWrite |
| **Subagents** | Spawn specialized agents via `Task` tool |
| **Hooks** | PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop, PreCompact |
| **Sessions** | Built-in resume/fork with context preservation |
| **Context Compaction** | Automatic summarization at ~92% context usage |
| **MCP Integration** | Native support for MCP servers via stdio/HTTP |

**Code Pattern:**
```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: "Help me organize my inbox",
  options: {
    allowedTools: ["Read", "Write", "mcp__composio__gmail_list"],
    permissionMode: "acceptEdits",
    mcpServers: { composio: { command: "npx", args: ["composio-mcp"] } }
  }
})) {
  // Handle streaming messages
}
```

### Direct Claude API (`@anthropic-ai/sdk`)

This is the **raw Anthropic API client**. You must build everything yourself.

| Feature | Description |
|---------|-------------|
| **Messages** | Single-shot completions with `client.messages.create()` |
| **No Tools** | Manual implementation of tool calling |
| **No Sessions** | Manual context management |
| **Full Control** | Direct access to all API parameters |

**Code Pattern:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const response = await client.messages.create({
  model: "claude-opus-4-5-20251101",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Triage this email" }]
});
```

### When to Use Each

| Use Case | Use This |
|----------|----------|
| Interactive agents (Butler, Triage, etc.) | **Agent SDK** |
| Multi-step workflows with tools | **Agent SDK** |
| Streaming responses to UI | **Agent SDK** |
| Batch processing 100+ items | Direct API |
| Simple single-shot completions | Direct API |
| Maximum API control | Direct API |

---

## 2. Architecture Analysis

### ✅ What's CORRECT in architecture.md v1.3

**Section 3.3 (Lines 183-242)** - Explicit SDK vs API clarification:

> "Orion uses the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`), NOT the direct Claude API. The SDK provides an autonomous agent runtime with built-in tools."

> "**Important:** The Claude Agent SDK is different from the Anthropic SDK (`@anthropic-ai/sdk`). The Agent SDK wraps Claude Code's capabilities as a library, handling tool execution, sessions, and the agent loop automatically."

**Comparison table is accurate:**

| Aspect | Claude Agent SDK | Direct Claude API |
|--------|------------------|-------------------|
| Package | `@anthropic-ai/claude-agent-sdk` | `@anthropic-ai/sdk` |
| Core Function | `query()` async generator | `client.messages.create()` |
| Tool Loop | SDK handles automatically | Manual implementation |
| Built-in Tools | Read, Write, Edit, Bash, etc. | None |
| Subagents | Native via `Task` tool | Not available |
| Hooks | PreToolUse, PostToolUse, etc. | Not available |
| Sessions | Built-in resume/fork | Manual management |

**Code examples are correct:**

- `architecture.md:1339` - Agent server uses `import { query } from '@anthropic-ai/claude-agent-sdk'`
- `architecture.md:1526` - MCP tools use `import { tool } from '@anthropic-ai/claude-agent-sdk'`
- `architecture.md:1835` - Batch processing correctly uses `import Anthropic from '@anthropic-ai/sdk'`

---

## 3. Issues Found

### ❌ CRITICAL: Test Mocks Use Wrong Package

**Location:** `test-design-epic-1.md` (Line 634), `test-design-epic-2.md` (Line 70)

**Current (WRONG):**
```typescript
// Mock Claude SDK
vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));
```

**Comment says "Mock Claude SDK" but imports Direct API package!**

**Should be:**
```typescript
// Mock Claude Agent SDK
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn(async function* () {
    yield { type: 'assistant', message: { content: [{ text: 'Mocked response' }] } };
    yield { type: 'result', subtype: 'end_turn' };
  }),
  ClaudeAgentOptions: {},
  tool: vi.fn((def) => def),
}));
```

**Impact:**
- Tests won't accurately mock production behavior
- Agent loop behavior won't be tested correctly
- Tool execution flow untested

**Files needing fixes:**
1. `test-design-epic-1.md` - Line 634
2. `test-design-epic-2.md` - Line 70

**Note:** `test-infra-agent-schemas.md` (Line 723) already uses correct package ✅

---

## 4. SDK Features Coverage Analysis

### ✅ Documented in Architecture

| Feature | Section | Status |
|---------|---------|--------|
| Built-in Tools | §3.3.2 | ✅ Complete list |
| SDK Options | §3.3.3 | ✅ All major options |
| When to use Direct API | §3.3.4 | ✅ Clear guidance |
| MCP Tool Definition | §6.3 | ✅ Uses `tool()` + Zod |
| Hooks | §6.11 | ✅ All hook types |
| Subagents | §6.12 | ✅ Definition patterns |
| Session Management | Implied | ⚠️ Mentioned but not detailed |

### ⚠️ SDK Features Not Explicitly Documented

These SDK features should be considered for architecture inclusion:

| Feature | Description | Priority |
|---------|-------------|----------|
| **Context Compaction** | Auto-summarization at ~92% usage | Medium |
| **Session Resume/Fork** | `options.resume: sessionId` | Medium |
| **Permission Modes** | `default`, `acceptEdits`, `plan`, `bypassPermissions` | High |
| **Max Turns** | `options.maxTurns: 250` to prevent runaway | Medium |
| **Tool Search** | Dynamic tool loading for large tool sets | Low |

### Recommended Architecture Addition

Add to §3.3:

```markdown
#### 3.3.5 Production Configuration

| Option | Recommended Value | Rationale |
|--------|-------------------|-----------|
| `permissionMode` | `'default'` | Human oversight in production |
| `maxTurns` | `100` | Prevent runaway agents |
| `enableCompaction` | `true` | Long conversation support |
| `contextTokenThreshold` | `50000` | Trigger compaction earlier |
```

---

## 5. Tauri + Agent SDK Integration

### Current Architecture (Correct)

```
[Tauri Main Process (Rust)]
    |
    +-- [WebView (Next.js/React)]
    |
    +-- [Agent Server (Node.js) - Child Process]
            |
            +-- Claude Agent SDK ← Correct!
            +-- SSE streaming endpoint
```

### Validation Against SDK Best Practices

| Practice | Current Status | Notes |
|----------|---------------|-------|
| Separate process for SDK | ✅ Agent Server | Avoids blocking Tauri main |
| SSE streaming | ✅ Planned | SDK streams async generator |
| Session storage | ⚠️ Not detailed | SDK stores in `~/.claude/projects/` |
| API key security | ✅ Keychain | Tauri supports platform keyrings |

### Recommended Clarification

Add to §12 (Streaming Architecture):

```markdown
### 12.4 SDK Stream Handling

The Agent SDK returns an async generator. Map message types to UI:

| SDK Message Type | UI Action |
|------------------|-----------|
| `assistant` | Display text chunk |
| `tool_use` | Show "Using tool: X" |
| `tool_result` | Display tool output |
| `result` (subtype: `end_turn`) | Mark complete |
| `result` (subtype: `error`) | Show error state |
```

---

## 6. MCP Integration Validation

### Current Architecture

```typescript
// architecture.md §6.3
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const getContactsTool = tool({
  name: 'get_contacts',
  description: 'Search contacts database',
  schema: z.object({ query: z.string() }),
  execute: async (input) => { /* ... */ },
});
```

### Validation Against SDK Docs

✅ **Correct pattern** - Uses SDK's `tool()` function with Zod schemas

✅ **MCP naming convention** - `mcp__<server>__<tool>` format

✅ **Composio as external MCP** - Not confused with SDK built-in tools

---

## 7. Action Items

### MUST FIX (Before Implementation)

1. **Update test mocks in test-design-epic-1.md**
   - Line 634: Change `@anthropic-ai/sdk` → `@anthropic-ai/claude-agent-sdk`
   - Update mock pattern to async generator

2. **Update test mocks in test-design-epic-2.md**
   - Line 70: Change `@anthropic-ai/sdk` → `@anthropic-ai/claude-agent-sdk`
   - Update mock pattern to match SDK interface

### RECOMMENDED (Optional Improvements)

3. **Add SDK production config section to architecture.md**
   - Permission modes explanation
   - Context compaction settings
   - Max turns recommendation

4. **Add stream message type mapping to §12**
   - SDK message types → UI actions

5. **Add glossary entry to PRD**
   - "Claude Agent SDK vs Direct API" disambiguation

---

## 8. Verification Commands

### Check Package References
```bash
grep -r "anthropic-ai/sdk\|claude-agent-sdk" thoughts/planning-artifacts/ --include="*.md"
```

### Validate After Fixes
After updating test docs, all agent test files should only have:
- `@anthropic-ai/claude-agent-sdk` for agent tests
- `@anthropic-ai/sdk` ONLY in batch processing tests (if any)

---

## 9. Conclusion

**The architecture team did excellent work in v1.3** proactively clarifying SDK vs API usage. The core technical documentation is accurate and coherent.

**One propagation issue remains:** Test design documents still reference the wrong package, likely written before the v1.3 clarification.

**Risk Level:** 🟡 LOW (easily fixed, 1-2 hour effort)

**Recommendation:** Fix test mocks before starting Epic 2 implementation to ensure tests accurately reflect production architecture.

---

## Sources

### SDK Documentation
- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Hooks Documentation](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [Subagents Documentation](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [MCP Integration](https://platform.claude.com/docs/en/agent-sdk/mcp)

### NPM Package
- [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)

### Engineering Blog
- [Building Agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---

_Report generated by Claude Opus 4.5 with Oracle and Scout agent research_
