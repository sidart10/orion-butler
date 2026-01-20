# Claude Agent SDK Research & Architecture Alignment

**Date:** 2026-01-20
**Purpose:** Clarify Claude Agent SDK vs Claude API, document all SDK features, identify corrections needed in planning artifacts.

---

## Executive Summary

The current architecture documentation mixes **Claude Agent SDK** concepts with **direct Claude API** usage. These are fundamentally different approaches:

| Aspect | Claude API (Direct) | Claude Agent SDK |
|--------|---------------------|------------------|
| Package | `@anthropic-ai/sdk` | `@anthropic-ai/claude-agent-sdk` |
| Core Function | `client.messages.create()` | `query()` |
| Tool Loop | You implement manually | SDK handles autonomously |
| Built-in Tools | None | Read, Write, Edit, Bash, Glob, Grep, WebSearch, etc. |
| Subagents | Not available | Full support via Task tool |
| Hooks | Not available | PreToolUse, PostToolUse, Stop, etc. |
| Sessions | You manage | Built-in resume/fork |
| MCP Integration | Manual | Native configuration |

**Key Finding:** The architecture documents describe both approaches interchangeably. We need to decide which to use and update accordingly.

---

## Part 1: Claude Agent SDK Complete Feature Reference

### 1.1 Core API - `query()` Function

The primary entry point. Creates an async generator that streams messages.

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and fix the bug in auth.py",
  options: {
    allowedTools: ["Read", "Edit", "Bash"],
    permissionMode: "acceptEdits"
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

### 1.2 Built-in Tools (Available Without Configuration)

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| **Read** | Read files (text, images, PDFs, notebooks) | `file_path`, `offset`, `limit` |
| **Write** | Create/overwrite files | `file_path`, `content` |
| **Edit** | String replacement editing | `file_path`, `old_string`, `new_string`, `replace_all` |
| **Bash** | Shell command execution | `command`, `timeout`, `run_in_background` |
| **Glob** | File pattern matching | `pattern`, `path` |
| **Grep** | Regex content search | `pattern`, `path`, `output_mode` |
| **WebSearch** | Web search | `query`, `allowed_domains`, `blocked_domains` |
| **WebFetch** | Fetch URL content | `url`, `prompt` |
| **AskUserQuestion** | Interactive prompts | `questions[]` with options |
| **Task** | Spawn subagents | `prompt`, `subagent_type`, `description` |
| **TodoWrite** | Task list management | `todos[]` with status |
| **NotebookEdit** | Jupyter notebook editing | `notebook_path`, `cell_id`, `new_source` |
| **ListMcpResources** | List MCP resources | `server` |
| **ReadMcpResource** | Read MCP resource | `server`, `uri` |

### 1.3 Options Reference

```typescript
interface Options {
  // Tool control
  allowedTools?: string[];           // Whitelist tools
  disallowedTools?: string[];        // Blacklist tools
  tools?: string[] | { type: 'preset'; preset: 'claude_code' };

  // Permission modes
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  canUseTool?: CanUseTool;           // Custom permission function

  // Model configuration
  model?: string;                    // e.g., 'claude-sonnet-4-5'
  fallbackModel?: string;
  maxThinkingTokens?: number;
  maxTurns?: number;
  maxBudgetUsd?: number;

  // Session management
  resume?: string;                   // Session ID to resume
  forkSession?: boolean;             // Fork instead of continue
  continue?: boolean;                // Continue most recent

  // MCP servers
  mcpServers?: Record<string, McpServerConfig>;

  // Subagents
  agents?: Record<string, AgentDefinition>;

  // Hooks
  hooks?: Partial<Record<HookEvent, HookCallbackMatcher[]>>;

  // Settings sources
  settingSources?: ('user' | 'project' | 'local')[];

  // System prompt
  systemPrompt?: string | { type: 'preset'; preset: 'claude_code'; append?: string };

  // Structured outputs
  outputFormat?: { type: 'json_schema'; schema: JSONSchema };

  // File system
  cwd?: string;
  additionalDirectories?: string[];

  // Sandbox
  sandbox?: SandboxSettings;

  // Streaming
  includePartialMessages?: boolean;

  // Beta features
  betas?: SdkBeta[];                 // e.g., ['context-1m-2025-08-07']
}
```

### 1.4 Hooks System

Hooks intercept agent execution at key points:

| Hook Event | When Triggered | Common Uses |
|------------|----------------|-------------|
| **PreToolUse** | Before tool executes | Block dangerous ops, validate inputs |
| **PostToolUse** | After tool completes | Logging, audit trails |
| **PostToolUseFailure** | Tool execution fails | Error handling |
| **UserPromptSubmit** | User submits prompt | Inject context |
| **Stop** | Agent stops | Save state, cleanup |
| **SubagentStart** | Subagent spawns | Track delegation |
| **SubagentStop** | Subagent completes | Aggregate results |
| **PreCompact** | Before context compaction | Archive transcript |
| **PermissionRequest** | Permission needed | Custom approval |
| **SessionStart** | Session begins | Init logging |
| **SessionEnd** | Session ends | Cleanup resources |
| **Notification** | Status updates | Slack/PagerDuty alerts |

**Hook Configuration Example:**

```typescript
const options = {
  hooks: {
    PreToolUse: [{
      matcher: 'Write|Edit',          // Regex for tool names
      hooks: [protectEnvFiles],       // Callback functions
      timeout: 60                     // Seconds
    }],
    PostToolUse: [{
      hooks: [auditLogger]            // No matcher = all tools
    }]
  }
};
```

**Hook Callback Signature:**

```typescript
type HookCallback = (
  input: HookInput,
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;
```

**Hook Output Options:**

```typescript
interface HookJSONOutput {
  continue?: boolean;                 // Keep running
  stopReason?: string;                // If stopping
  suppressOutput?: boolean;           // Hide from transcript
  systemMessage?: string;             // Inject into conversation

  hookSpecificOutput?: {
    hookEventName: string;
    permissionDecision?: 'allow' | 'deny' | 'ask';
    permissionDecisionReason?: string;
    updatedInput?: Record<string, unknown>;  // Modified tool input
    additionalContext?: string;
  };
}
```

### 1.5 Subagents (via `agents` option)

Define specialized agents that the main agent can delegate to:

```typescript
const options = {
  allowedTools: ['Read', 'Grep', 'Task'],  // Task required for subagents
  agents: {
    'code-reviewer': {
      description: 'Expert code reviewer for security and quality',
      prompt: 'You are a code review specialist...',
      tools: ['Read', 'Grep', 'Glob'],     // Restricted tools
      model: 'sonnet'                       // Optional model override
    },
    'test-runner': {
      description: 'Runs and analyzes test suites',
      prompt: 'Execute tests and analyze results...',
      tools: ['Bash', 'Read']
    }
  }
};
```

**Key Points:**

- Subagents are invoked via the `Task` tool
- Claude decides when to delegate based on `description`
- Explicit invocation: "Use the code-reviewer agent to..."
- Subagents CANNOT spawn their own subagents
- Messages from subagents include `parent_tool_use_id`
- Sessions can be resumed with full context

### 1.6 MCP Server Configuration

```typescript
// stdio (local process)
{
  type: 'stdio',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-github'],
  env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
}

// HTTP/SSE (remote)
{
  type: 'http',  // or 'sse'
  url: 'https://api.example.com/mcp',
  headers: { Authorization: `Bearer ${token}` }
}

// SDK (in-process)
{
  type: 'sdk',
  name: 'custom-tools',
  instance: createSdkMcpServer({
    name: 'custom-tools',
    tools: [myCustomTool]
  })
}
```

**MCP Tool Naming:** `mcp__<server-name>__<tool-name>`

Example: `mcp__github__list_issues`

### 1.7 Custom Tools via `tool()` Function

Create type-safe MCP tools that run in-process:

```typescript
import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const paraSearch = tool(
  'para_search',
  'Search across Projects, Areas, Resources, Archives',
  {
    query: z.string().describe('Search query'),
    categories: z.array(z.enum(['projects', 'areas', 'resources', 'archives']))
  },
  async (args) => {
    const results = await searchPARA(args.query, args.categories);
    return { content: [{ type: 'text', text: JSON.stringify(results) }] };
  }
);

const myServer = createSdkMcpServer({
  name: 'orion-tools',
  tools: [paraSearch]
});
```

### 1.8 Session Management

```typescript
// Capture session ID
let sessionId: string;
for await (const message of query({ prompt: "..." })) {
  if (message.type === 'system' && message.subtype === 'init') {
    sessionId = message.session_id;
  }
}

// Resume later
for await (const message of query({
  prompt: "Continue where we left off",
  options: { resume: sessionId }
})) { ... }

// Fork session (branch conversation)
for await (const message of query({
  prompt: "Try alternative approach",
  options: { resume: sessionId, forkSession: true }
})) { ... }
```

### 1.9 Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Standard permission prompts |
| `acceptEdits` | Auto-accept file edits, prompt for others |
| `bypassPermissions` | Skip ALL prompts (use with caution) |
| `plan` | Planning mode - no execution |

### 1.10 Structured Outputs

```typescript
const options = {
  outputFormat: {
    type: 'json_schema',
    schema: {
      type: 'object',
      properties: {
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        summary: { type: 'string' }
      },
      required: ['priority', 'summary']
    }
  }
};
```

### 1.11 Beta Features

```typescript
const options = {
  betas: ['context-1m-2025-08-07']  // 1M token context window
};
```

---

## Part 2: Issues Found in Current Architecture Documents

### Issue 1: Mixed API Patterns

**Location:** `architecture.md` Section 6.5

**Problem:** The document shows both Claude Agent SDK usage AND direct `Anthropic` SDK usage:

```typescript
// Section 6.3 - Uses Tool[] from SDK
export const orionTools: Tool[] = [...]

// Section 6.5 - Uses direct Anthropic client
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();
const response = await client.messages.create({...})
```

**Confusion:** When using Claude Agent SDK, you don't manually define tools this way. The SDK has built-in tools and uses MCP servers for custom tools.

**Correct Approach:**

```typescript
// EITHER use Claude Agent SDK (recommended for agents):
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";

// Define custom tools via MCP
const orionServer = createSdkMcpServer({
  name: 'orion',
  tools: [paraSearchTool, contactLookupTool, ...]
});

// Query with SDK
for await (const msg of query({
  prompt: "...",
  options: {
    mcpServers: { orion: orionServer },
    allowedTools: ['Read', 'mcp__orion__*']
  }
})) { ... }

// OR use direct API (for specific structured outputs):
import Anthropic from '@anthropic-ai/sdk';
// Good for: triage with structured outputs, simple completions
// Bad for: complex agent workflows
```

### Issue 2: Tool Definition Format

**Location:** `architecture.md` Section 6.3

**Problem:** Shows tools defined as JSON Schema objects:

```typescript
{
  name: 'para_search',
  description: '...',
  parameters: {
    type: 'object',
    properties: { ... }
  }
}
```

**Reality:** Claude Agent SDK uses the `tool()` function with Zod schemas for custom tools, not JSON Schema objects. Built-in tools (Read, Write, Bash, etc.) don't need definitions.

### Issue 3: Beta Headers vs SDK Options

**Location:** `architecture.md` Section 3.3

**Problem:** Lists beta headers for Claude API features:

```
| Feature | Beta Header |
| Structured Outputs | structured-outputs-2025-11-13 |
| Extended Thinking | interleaved-thinking-2025-05-14 |
```

**Reality:** The Claude Agent SDK handles this differently:

- **Structured Outputs:** Use `outputFormat` option in SDK
- **Extended Thinking:** Use `maxThinkingTokens` option
- **Beta Headers:** Use `betas` array for things like context window

### Issue 4: Composio Integration Architecture

**Location:** `architecture.md` Section 6.7 shows manual Composio HTTP config

**Better Approach:** Use Composio's official MCP server:

```typescript
mcpServers: {
  composio: {
    type: 'http',
    url: 'https://mcp.composio.dev/composio/...',
    headers: { 'X-API-Key': process.env.COMPOSIO_API_KEY }
  }
}
```

Or use Rube MCP (already available in your setup).

### Issue 5: Agent Server Architecture

**Location:** `architecture.md` Section 5.3

**Problem:** Shows a separate Express server forwarding to Claude SDK:

```typescript
app.get('/api/stream/:streamId', async (req, res) => {
  for await (const message of claudeQuery({...})) { ... }
});
```

**Question:** Is this necessary? The Claude Agent SDK can run directly in the Tauri sidecar or even in the frontend (with proper auth). The extra HTTP layer adds complexity.

**Options:**

1. **Direct SDK in Tauri sidecar** (simpler, recommended)
2. **Keep agent server** (if you need process isolation or multiple clients)

### Issue 6: Triage Implementation

**Location:** `architecture.md` Section 6.5

**Problem:** Uses direct API for triage:

```typescript
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250514',
  response_format: { type: 'json_schema', ... },
  thinking: { type: 'enabled', budget_tokens: 5000 }
});
```

**Better:** This is actually a valid use case for direct API! Triage with structured outputs doesn't need the full agent loop. But the document should clarify when to use each:

- **Direct API:** Simple structured outputs, batch processing, specific API features
- **Agent SDK:** Complex multi-step tasks, tool orchestration, conversation management

---

## Part 3: Recommended Architecture Decisions

### Decision 1: Primary Integration - Claude Agent SDK

**Recommendation:** Use Claude Agent SDK for all interactive agent features.

**Rationale:**

- Built-in tool execution (no manual loop)
- Native MCP support for Composio integration
- Subagent support for delegation (triage, scheduler, etc.)
- Hooks for validation, logging, security
- Session management for conversation persistence

### Decision 2: When to Use Direct API

Use `@anthropic-ai/sdk` directly for:

1. **Batch Triage:** Process many inbox items with structured outputs
2. **Embedding Generation:** If using Claude for embeddings
3. **Simple Completions:** Single-shot generations without tools

### Decision 3: Custom Tools via MCP

**Pattern:**

```typescript
// Define all Orion tools as an in-process MCP server
const orionServer = createSdkMcpServer({
  name: 'orion',
  tools: [
    tool('para_search', 'Search PARA...', schema, handler),
    tool('contact_lookup', 'Find contacts...', schema, handler),
    tool('task_create', 'Create task...', schema, handler),
    // ... all custom tools
  ]
});
```

### Decision 4: Subagent Architecture

Map current agent hierarchy to SDK subagents:

```typescript
agents: {
  'triage': {
    description: 'Analyze inbox items for priority and actions',
    prompt: TRIAGE_PROMPT,
    tools: ['Read', 'mcp__orion__para_search', 'mcp__orion__contact_lookup']
  },
  'scheduler': {
    description: 'Manage calendar and schedule meetings',
    prompt: SCHEDULER_PROMPT,
    tools: ['mcp__composio__googlecalendar_*', 'mcp__orion__contact_lookup']
  },
  'communicator': {
    description: 'Draft emails and messages',
    prompt: COMMUNICATOR_PROMPT,
    tools: ['mcp__composio__gmail_*', 'mcp__orion__contact_lookup']
  }
}
```

### Decision 5: Hooks Usage

Implement hooks for:

```typescript
hooks: {
  PreToolUse: [
    // Block destructive operations
    { matcher: 'mcp__composio__gmail_delete', hooks: [requireApproval] },
    // Audit all tool calls
    { hooks: [auditLogger] }
  ],
  SessionStart: [
    // Load user preferences
    { hooks: [loadPreferences] }
  ],
  PostToolUse: [
    // Learn from tool results
    { matcher: 'mcp__composio__*', hooks: [trackToolUsage] }
  ]
}
```

---

## Part 4: Files That Need Updates

| File | Section | Issue | Action |
|------|---------|-------|--------|
| `architecture.md` | 3.3 | Beta headers | Update to show SDK options |
| `architecture.md` | 6.3 | Tool definitions | Replace with `tool()` and MCP pattern |
| `architecture.md` | 6.5 | Mixed API patterns | Clarify when to use each |
| `architecture.md` | 6.6 | MCP config | Update syntax to current SDK |
| `test-design-epic-1.md` | Section 17 | Mocks direct API | Update to mock SDK |
| `test-design-epic-2.md` | - | Agent tests | Align with SDK patterns |

---

## Part 5: Quick Reference Card

### Claude Agent SDK - Essential Patterns

**Basic Query:**
```typescript
for await (const msg of query({ prompt: "...", options: {...} })) {
  if (msg.type === 'result') console.log(msg.result);
}
```

**With Subagents:**
```typescript
options: {
  allowedTools: ['Read', 'Task'],
  agents: { 'analyzer': { description: '...', prompt: '...', tools: [...] } }
}
```

**With MCP Tools:**
```typescript
const myTools = createSdkMcpServer({ name: 'my-tools', tools: [...] });
options: { mcpServers: { 'my-tools': myTools } }
```

**With Hooks:**
```typescript
options: {
  hooks: { PreToolUse: [{ matcher: 'Write', hooks: [myValidator] }] }
}
```

**Session Resume:**
```typescript
options: { resume: previousSessionId }
```

---

## Sources

- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Hooks Guide](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [MCP Integration](https://platform.claude.com/docs/en/agent-sdk/mcp)
- [Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [NPM Package](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
- [GitHub Repository](https://github.com/anthropics/claude-agent-sdk-typescript)
