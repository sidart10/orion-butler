# Claude Agent SDK - Complete Reference Guide

**Generated:** 2026-01-20
**Purpose:** Comprehensive guide for Orion Butler implementation
**Sources:** Official Anthropic docs, SDK GitHub, community resources

---

## Table of Contents

1. [Overview](#1-overview)
2. [Skills System](#2-skills-system)
3. [Programmatic Tool Calling](#3-programmatic-tool-calling)
4. [Hooks System](#4-hooks-system)
5. [Subagents](#5-subagents)
6. [Configuration Options](#6-configuration-options)
7. [Session Management](#7-session-management)
8. [MCP Integration](#8-mcp-integration)
9. [Production Patterns](#9-production-patterns)
10. [Orion Implementation Guide](#10-orion-implementation-guide)

---

## 1. Overview

The Claude Agent SDK provides a framework for building AI agents with the same capabilities as Claude Code. It abstracts away the agent loop complexity while providing fine-grained control through:

- **Skills** - Domain knowledge loaded dynamically
- **Tools** - Capabilities (built-in + custom via MCP)
- **Hooks** - Event interception and modification
- **Subagents** - Isolated contexts for delegation

### SDK vs Direct API

| Capability | Claude Agent SDK | Direct Anthropic API |
|------------|-----------------|---------------------|
| Agent Loop | SDK handles automatically | Manual implementation |
| Built-in Tools | Read, Write, Edit, Bash, Glob, Grep, etc. | None |
| Subagents | Native via `Task` tool | Not available |
| Hooks | PreToolUse, PostToolUse, Stop, etc. | Not available |
| Sessions | Built-in resume/fork | Manual management |
| **Use When** | Interactive agents, multi-step tasks | Batch processing, simple completions |

---

## 2. Skills System

Skills are **organized folders of instructions, scripts, and resources** that agents load dynamically to perform specialized tasks.

### 2.1 Progressive Disclosure Architecture

| Level | Content | Token Budget | When Loaded |
|-------|---------|--------------|-------------|
| 1 | Metadata (name/description) | ~100 tokens | Always scanned |
| 2 | Full instructions | <5k tokens | When skill triggers |
| 3 | Bundled resources | Variable | On-demand |

### 2.2 SKILL.md Structure

```yaml
---
name: my-skill-name                    # Required, max 64 chars
description: What it does and triggers # Required, max 1024 chars
version: 1.0.0                         # Optional
allowed-tools: "Bash, Read"            # Optional (CLI only)
model: claude-opus-4-20250514          # Optional
mode: true                             # Optional, for mode commands
disable-model-invocation: true         # Optional, require explicit /skill
show-in-menu: false                    # Optional, hide from menu
---

# Skill Instructions

Your markdown content here...
```

### 2.3 Directory Structure

```
my-skill/
├── SKILL.md          # Required - core prompt
├── scripts/          # Optional - executables (only OUTPUT enters context)
├── references/       # Optional - docs loaded on-demand
└── assets/           # Optional - templates, fonts
```

### 2.4 Skill Invocation

| Method | Example | Description |
|--------|---------|-------------|
| Slash command | `/my-skill` | Explicit user trigger |
| Model-invoked | Automatic | Claude matches description |
| Programmatic | `Skill` tool | From code |

### 2.5 Skills vs Other Concepts

| Feature | Skills | Tools | Hooks | Subagents |
|---------|--------|-------|-------|-----------|
| Purpose | Domain knowledge | Capabilities | Event control | Isolated contexts |
| Invocation | Auto/slash command | API calls | Event-driven | Explicit spawn |
| State | Stateless | Stateless | Stateless | Own context |

### 2.6 Skill + Subagent Integration

```yaml
# .claude/agents/my-agent.md
---
skills:
  - database-queries
  - chart-generation
---

Agent system prompt here...
```

### 2.7 Built-in Skills

**API/Claude.ai:** `pptx`, `xlsx`, `docx`, `pdf`

**Claude Code:** Custom skills only - built-in agents (Explore, Plan) cannot access custom skills.

---

## 3. Programmatic Tool Calling

### 3.1 Tool Definition with Zod

```typescript
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const myServer = createSdkMcpServer({
  name: 'my-tools',
  tools: [
    tool(
      'my_action',
      'Description of what this tool does',
      {
        param1: z.string().describe('Parameter description'),
        param2: z.number().optional(),
      },
      async (args) => {
        // Execute tool logic
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }]
        };
      }
    )
  ]
});
```

### 3.2 Built-in Tools (Complete List)

| Category | Tools |
|----------|-------|
| **File Operations** | Read, Write, Edit, MultiEdit, NotebookRead, NotebookEdit |
| **Search** | Glob, Grep, LS |
| **Execution** | Bash, BashOutput, KillBash |
| **Web** | WebSearch, WebFetch |
| **Agents** | Task, Skill |
| **Utilities** | TodoRead, TodoWrite, AskUserQuestion, ExitPlanMode |
| **MCP** | ListMcpResources, ReadMcpResource |

### 3.3 Tool Execution Flow

```
User Prompt
    ↓
Claude API Response
    ↓
┌─────────────────────────────────────┐
│  Has tool_use blocks?               │
│  YES → Execute tools                │
│  NO  → Return final text            │
└─────────────────────────────────────┘
    ↓
Execute each tool_use
    ↓
Return tool_result blocks
    ↓
Loop back to Claude API
```

### 3.4 Parallel Tool Calls

Claude can issue multiple `tool_use` blocks in one response. Execute them concurrently when independent:

```typescript
for (const block of message.content) {
  if (block.type === 'tool_use') {
    toolCalls.push(executeTool(block));
  }
}

const results = await Promise.all(toolCalls);
```

### 3.5 Tool Naming (MCP)

```
mcp__<server-name>__<tool-name>

Examples:
- mcp__github__list_issues
- mcp__filesystem__read_file
- mcp__calendar__create_event
```

### 3.6 Tool Cost

| Tool | Overhead |
|------|----------|
| Bash | 245 tokens/use |
| Read | ~50 tokens + content |
| Write | ~50 tokens |

---

## 4. Hooks System

Hooks intercept and modify agent behavior at key execution points.

### 4.1 Available Hook Events

| Hook Event | When Triggered | Common Uses |
|------------|----------------|-------------|
| **PreToolUse** | Before any tool executes | Block dangerous ops, validate inputs, modify args |
| **PostToolUse** | After tool completes | Log results, transform output, inject context |
| **PostToolUseFailure** | After tool fails | Custom error handling |
| **UserPromptSubmit** | User submits prompt | Inject context, validate input |
| **PermissionRequest** | Permission dialog shown | Custom approval flow |
| **Stop** | Agent stops | Save state, cleanup resources |
| **SubagentStart** | Subagent spawns | Track delegation, resource limits |
| **SubagentStop** | Subagent completes | Aggregate results |
| **SessionStart** | Session begins | Initialize logging, load preferences |
| **SessionEnd** | Session ends | Record metrics |
| **PreCompact** | Before compaction | Custom summary logic |
| **Notification** | Status updates | External alerts (Slack, etc.) |

### 4.2 Hook Callback Signature

```typescript
type HookCallback = (
  input: HookInput,
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;

interface HookJSONOutput {
  continue?: boolean;                    // Keep running (default: true)
  stopReason?: string;                   // Reason if stopping
  additionalContext?: string;            // Add to conversation
  systemMessage?: string;                // Inject into conversation

  hookSpecificOutput?: {
    hookEventName: string;
    permissionDecision?: 'allow' | 'deny' | 'ask';
    permissionDecisionReason?: string;
    updatedInput?: Record<string, unknown>;  // Modify tool input
  };
}
```

### 4.3 Hook Configuration

```typescript
// agent-server/src/hooks/index.ts

import { HookCallback, HookJSONOutput } from '@anthropic-ai/claude-agent-sdk';

// Protect sensitive files
const protectSensitiveFiles: HookCallback = async (input, toolUseId) => {
  const filePath = input.file_path || input.path;
  const sensitivePatterns = ['.env', 'credentials', 'secrets', '.pem', '.key'];

  if (sensitivePatterns.some(p => filePath?.includes(p))) {
    return {
      continue: false,
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Cannot modify sensitive file: ${filePath}`,
      }
    };
  }
  return { continue: true };
};

// Audit all tool calls
const auditLogger: HookCallback = async (input, toolUseId) => {
  console.log(`[AUDIT] Tool: ${input.tool_name}, ID: ${toolUseId}`, input);
  await db.auditLog.create({
    tool: input.tool_name,
    input: JSON.stringify(input),
    timestamp: new Date()
  });
  return { continue: true };
};

// Export configuration
export const orionHooks = {
  PreToolUse: [
    {
      matcher: 'Write|Edit|Bash',  // Regex for tool names
      hooks: [protectSensitiveFiles],
      timeout: 30,
    },
    {
      hooks: [auditLogger],  // No matcher = all tools
    },
  ],
  SessionStart: [
    {
      hooks: [loadUserContext],
    },
  ],
};
```

### 4.4 Key Hook Capabilities

| Capability | Hook Event | Output Field |
|------------|------------|--------------|
| Block tool execution | PreToolUse | `permissionDecision: 'deny'` |
| Modify tool input | PreToolUse | `updatedInput` (requires `allow`) |
| Inject context | SessionStart, UserPromptSubmit, PostToolUse | `additionalContext` |
| Keep agent running | Stop | `decision: 'block'` |
| Custom approval | PermissionRequest | `permissionDecision` |

---

## 5. Subagents

Subagents are specialized agents for task delegation with context isolation.

### 5.1 AgentDefinition Interface

```typescript
interface AgentDefinition {
  name: string;              // Unique identifier
  description: string;       // Tells Claude when to use this agent
  prompt: string;            // System prompt for the subagent

  // Optional
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
  allowedTools?: string[];
  disallowedTools?: string[];
  maxTurns?: number;
}
```

### 5.2 Programmatic Definition

```typescript
const orionSubagents: Record<string, AgentDefinition> = {
  triage: {
    name: 'triage',
    description: 'Processes inbox items, categorizes emails, identifies action items',
    prompt: `You are an inbox triage specialist...`,
    model: 'sonnet',
    allowedTools: ['Read', 'Glob', 'Grep', 'mcp__gmail__*'],
    maxTurns: 10,
  },

  scheduler: {
    name: 'scheduler',
    description: 'Manages calendar, finds meeting times, handles scheduling conflicts',
    prompt: `You are a scheduling assistant...`,
    model: 'sonnet',
    allowedTools: ['Read', 'mcp__calendar__*'],
  },

  communicator: {
    name: 'communicator',
    description: 'Drafts emails, messages, and other communications',
    prompt: `You are a communication specialist...`,
    model: 'opus',
    allowedTools: ['Read', 'Write', 'mcp__gmail__*', 'mcp__slack__*'],
  },
};
```

### 5.3 File-Based Definition

```markdown
<!-- .claude/agents/triage.md -->
---
name: triage
description: Processes inbox items, categorizes emails, identifies action items
model: sonnet
allowedTools:
  - Read
  - Glob
  - Grep
  - mcp__gmail__*
maxTurns: 10
---

You are an inbox triage specialist. Your job is to:

1. Scan incoming emails and messages
2. Categorize by urgency (urgent, high, medium, low)
3. Extract action items
4. Flag items needing user attention

## Guidelines

- Never archive without explicit permission
- Always preserve original message content
- Flag ambiguous items for user review
```

### 5.4 Invocation Patterns

| Pattern | Description | When Used |
|---------|-------------|-----------|
| **Automatic** | Claude decides based on `description` | Default behavior |
| **Explicit** | "Use the scheduler agent to find a time" | Guaranteed delegation |
| **Parallel** | Multiple Task tool calls in one turn | Independent tasks |

### 5.5 Critical Constraints

| Constraint | Reason |
|------------|--------|
| Cannot spawn sub-subagents | Prevent infinite delegation |
| Tool access is restricted | Each subagent only gets listed tools |
| Separate context window | Isolation from main conversation |
| Results return to parent | Main agent synthesizes |
| Permissions don't auto-inherit | Use PreToolUse hooks |

### 5.6 Using Subagents in Butler

```typescript
const butlerOptions: ClaudeAgentOptions = {
  model: 'claude-opus-4-5-20251101',
  systemPrompt: butlerSystemPrompt,

  // Subagents (Task tool required in allowedTools)
  agents: orionSubagents,

  // Tools available to main Butler agent
  allowedTools: [
    'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
    'Task',  // Required for subagent delegation
    'AskUserQuestion',
    'TodoWrite',
    'mcp__composio__*',
  ],

  hooks: orionHooks,
};
```

---

## 6. Configuration Options

### 6.1 ClaudeAgentOptions Interface

```typescript
export interface ClaudeAgentOptions {
  // === Core ===
  model?: string;                    // 'sonnet' | 'opus' | 'haiku' | model ID
  maxTurns?: number;                 // Default: 250
  maxThinkingTokens?: number | null; // For extended thinking
  maxOutputTokens?: number;

  // === Permissions ===
  permissionMode?: PermissionMode;
  allowedTools?: string[];
  disallowedTools?: string[];
  canUseTool?: (name: string, input: unknown) => boolean | Promise<boolean>;

  // === Sessions ===
  resume?: string;                   // Session ID to resume
  forkSession?: boolean;             // Fork instead of continue
  persistSession?: boolean;          // Save to disk (default: true)

  // === System Prompt ===
  systemPrompt?: SystemPromptConfig;
  appendSystemPrompt?: string;

  // === Context Management ===
  enableCompaction?: boolean;        // Default: true
  contextTokenThreshold?: number;    // Default: 100000

  // === MCP ===
  mcpServers?: Record<string, MCPServerConfig>;

  // === Hooks & Agents ===
  hooks?: HooksConfig;
  agents?: AgentDefinition[];

  // === Environment ===
  cwd?: string;
  env?: Record<string, string>;

  // === Output ===
  outputFormat?: 'text' | 'json' | 'stream-json';
}
```

### 6.2 Permission Modes

| Mode | File Read | File Write | Bash | MCP Tools | Risk |
|------|-----------|------------|------|-----------|------|
| `default` | Auto | Prompt | Prompt | Prompt | Low |
| `acceptEdits` | Auto | Auto | Prompt | Prompt | Medium |
| `plan` | Auto | Blocked | Blocked | Blocked | None |
| `bypassPermissions` | Auto | Auto | Auto | Auto | **Critical** |

```typescript
// CRITICAL: bypassPermissions requires safety flag
{
  permissionMode: 'bypassPermissions',
  allowDangerouslySkipPermissions: true  // REQUIRED
}
```

> **Warning:** When using `bypassPermissions`, ALL subagents inherit this mode and it CANNOT be overridden.

### 6.3 System Prompt Configuration

```typescript
// Option 1: Custom string
systemPrompt: "You are Orion, a personal butler..."

// Option 2: Use full Claude Code prompt
systemPrompt: { preset: 'claude_code' }

// Option 3: Minimal prompt (default)
systemPrompt: { preset: 'minimal' }

// Option 4: Append to default
appendSystemPrompt: "Additional context..."
```

---

## 7. Session Management

### 7.1 Session ID Capture

```typescript
let sessionId: string | undefined;

for await (const message of query({ prompt: "Hello" })) {
  if (message.type === 'system' && message.subtype === 'init') {
    sessionId = message.session_id;
  }
}
```

### 7.2 Session Resume

```typescript
const resumed = query({
  prompt: "Continue where we left off",
  options: {
    resume: sessionId
  }
});
```

### 7.3 Session Fork

```typescript
const forked = query({
  prompt: "Let's try a different approach",
  options: {
    resume: sessionId,
    forkSession: true  // Creates new ID, copies history
  }
});
```

### 7.4 Storage Location

```
~/.claude/projects/<project-hash>/<session-id>.jsonl
```

### 7.5 Session State Contents

- Full message history
- File snapshots for rewind
- Token usage statistics
- MCP server state

---

## 8. MCP Integration

### 8.1 Server Configuration

```typescript
interface MCPServerConfig {
  // Stdio transport (local)
  command?: string;
  args?: string[];
  env?: Record<string, string>;

  // HTTP/SSE transport (remote)
  url?: string;
  headers?: Record<string, string>;

  // Settings
  timeout?: number;        // Default: 60s
  instructions?: string;   // Help Claude understand usage
}
```

### 8.2 Configuration Example

```typescript
const options: ClaudeAgentOptions = {
  mcpServers: {
    github: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN },
      instructions: "Use for GitHub operations"
    },
    calendar: {
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-server-google-calendar"],
      env: { /* credentials */ }
    }
  },
  allowedTools: [
    "Read", "Glob",
    "mcp__github__*",      // All tools from github server
    "mcp__calendar__list"  // Specific tool only
  ]
};
```

### 8.3 Tool Search (Dynamic Loading)

For servers with many tools, SDK auto-loads only needed tools:

```typescript
{
  toolSearchMode: 'auto'  // 'auto' | 'always' | 'never'
}
```

---

## 9. Production Patterns

### 9.1 Security Hooks

```typescript
const securityHooks: HooksConfig = {
  PreToolUse: [
    {
      matcher: { toolName: 'Bash' },
      callback: async (event) => {
        const cmd = event.input.command;
        const dangerous = ['rm -rf /', 'mkfs', 'dd if='];

        if (dangerous.some(d => cmd.includes(d))) {
          return {
            decision: 'deny',
            reason: 'Command blocked by security policy'
          };
        }

        if (cmd.includes('sudo')) {
          return {
            decision: 'ask',
            reason: 'Sudo requires confirmation'
          };
        }

        return { decision: 'allow' };
      }
    }
  ]
};
```

### 9.2 Cost Tracking

```typescript
interface CostBudget {
  maxCostPerQuery: number;
  maxCostPerSession: number;
  maxTokensPerQuery: number;
}

for await (const msg of query({ prompt })) {
  if (msg.type === 'result') {
    if (msg.total_cost_usd > budget.maxCostPerQuery) {
      await q.interrupt();
    }
  }
}
```

### 9.3 Context Compaction

```typescript
{
  enableCompaction: true,
  contextTokenThreshold: 75000,  // 50-75% of context window
}
```

**Summary Structure Generated:**

```xml
<summary>
  <task_overview>
    <core_request>What the user originally asked</core_request>
    <success_criteria>How completion will be measured</success_criteria>
  </task_overview>
  <current_state>
    <completed_work>What has been done</completed_work>
    <modified_files>Files changed</modified_files>
  </current_state>
  <next_steps>
    <specific_actions>What to do next</specific_actions>
  </next_steps>
</summary>
```

### 9.4 Observability

```typescript
// OpenTelemetry integration
const tracer = trace.getTracer('claude-agent');

async function instrumentedQuery(prompt: string) {
  return tracer.startActiveSpan('agent.query', async (span) => {
    for await (const msg of query({ prompt })) {
      if (msg.type === 'result') {
        span.setAttribute('total_tokens',
          msg.total_input_tokens + msg.total_output_tokens);
        span.setAttribute('cost_usd', msg.total_cost_usd);
      }
    }
    span.end();
  });
}
```

---

## 10. Orion Implementation Guide

### 10.1 Recommended Architecture

```
Tauri App
    ↓
Rust Backend (Tauri commands)
    ↓ SSE
Agent Server (Node.js + Claude Agent SDK)
    ↓
Claude API
    ↓
MCP Servers (Composio, Calendar, etc.)
```

### 10.2 Implementation Priority

| Phase | Components |
|-------|------------|
| 1 | Basic query/streaming, session management |
| 2 | Permission mode configuration |
| 3 | Hook-based validation (security) |
| 4 | MCP server integration (Composio) |
| 5 | Subagent orchestration |
| 6 | Skills system |
| 7 | Cost/observability |

### 10.3 Orion Subagent Architecture

| Agent | Purpose | Model | Key Tools |
|-------|---------|-------|-----------|
| **triage** | Inbox processing | Sonnet | Read, Glob, mcp__gmail__* |
| **scheduler** | Calendar management | Sonnet | mcp__calendar__* |
| **communicator** | Draft messages | Opus | Write, mcp__gmail__*, mcp__slack__* |
| **navigator** | Project management | Sonnet | Read, Glob, Grep |
| **preference-learner** | Learn user patterns | Haiku | Read, Write |

### 10.4 Orion Skills (To Build)

| Skill | Purpose | Trigger |
|-------|---------|---------|
| `/briefing` | Morning briefing generation | User or scheduled |
| `/inbox-process` | Triage inbox items | User command |
| `/meeting-prep` | Prepare for meetings | Calendar event |
| `/draft-email` | Compose emails | User request |
| `/project-status` | Project overview | User query |

### 10.5 Orion Hooks

```typescript
export const orionHooks = {
  PreToolUse: [
    { matcher: 'Write|Edit', hooks: [validateWritePath] },
    { matcher: 'Bash', hooks: [blockDangerousCommands] },
    { matcher: 'mcp__*', hooks: [auditExternalCalls] },
  ],
  SessionStart: [
    { hooks: [loadUserPreferences, injectUserContext] },
  ],
  PostToolUse: [
    { matcher: 'mcp__gmail__*', hooks: [trackEmailActions] },
    { matcher: '*', hooks: [auditLogger] },
  ],
  Stop: [
    { hooks: [saveSessionMetrics, updateLearnings] },
  ],
};
```

---

## Sources

1. [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
2. [Agent Skills in SDK](https://platform.claude.com/docs/en/agent-sdk/skills)
3. [Agent SDK TypeScript Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
4. [Tool Use Implementation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)
5. [Hooks Reference](https://platform.claude.com/docs/en/agent-sdk/hooks)
6. [Subagents Reference](https://platform.claude.com/docs/en/agent-sdk/subagents)
7. [MCP Integration](https://platform.claude.com/docs/en/agent-sdk/mcp)
8. [Session Management](https://platform.claude.com/docs/en/agent-sdk/sessions)
9. [GitHub - claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript)
10. [Building Agents - Anthropic Engineering](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
11. [Claude Code Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
12. [awesome-claude-skills Repository](https://github.com/travisvn/awesome-claude-skills)
