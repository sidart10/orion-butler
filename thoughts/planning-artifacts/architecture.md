# Technical Specification: Orion Personal Butler

> **Document Status:** Target Architecture Specification
> **Implementation Status:** Epic 1 Complete (Desktop Shell), Epic 2+ Not Started
> **Last Verified:** 2026-01-20
>
> This document describes the planned architecture for Orion. The `src/`, `src-tauri/`, and `agent-server/` directories were removed during a restructure. Refer to sprint-status.yaml for current implementation status.

**Version:** 1.7
**Status:** Draft
**Date:** 2026-01-13
**Last Updated:** 2026-01-20
**Author:** Engineering Team

### Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.7 | 2026-01-20 | **Pre-mortem fixes:** Fixed section 6.6.2/6.6.3 numbering, added SDK implementation notes, documented missing dependencies (Zod, TipTap), updated model IDs |
| 1.6 | 2026-01-20 | **Research-Driven Updates:** Added §6.14 (Dynamic Context Discovery from Cursor research), §8.5 (Shadow Workspace validation pattern), §10.4 (Claude Agent SDK Memory Tool integration) |
| 1.5 | 2026-01-20 | **Skills System:** Added §6.13 covering Skills architecture - progressive disclosure, SKILL.md format, skill catalog (8 core skills), skill+subagent integration, skill+hooks integration, and development guidelines |
| 1.4 | 2026-01-20 | **SDK Feature Expansion:** Added §3.3.5-3.3.11 covering Context Compaction, Permission Modes, Max Turns, Session Management, Stream Message Types, Tool Search, and Production Configuration with complete code examples |
| 1.3 | 2026-01-20 | **Major SDK Clarification:** Corrected Claude Agent SDK vs Direct API usage throughout. Updated §3.3 (SDK features), §6.3 (MCP tools with `tool()` + Zod), §6.5 (Direct API use cases), §6.7 (MCP config), added §6.11 (Hooks), §6.12 (Subagents) |
| 1.2 | 2026-01-14 | Added Orion Design System (§3.4) with full documentation: fonts, colors, typography, layout, animations, component classes, shadcn/ui integration |
| 1.1 | 2026-01-14 | Replaced A2UI with json-render (§7.3), updated architecture diagrams |
| 1.0 | 2026-01-13 | Initial technical specification |

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [Agent Architecture](#6-agent-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Tauri Integration](#8-tauri-integration)
9. [Composio Integration](#9-composio-integration)
10. [Memory System](#10-memory-system)
11. [Observability & Tracing](#11-observability--tracing)
12. [Streaming Architecture](#12-streaming-architecture)
13. [Security](#13-security)
14. [Testing Strategy](#14-testing-strategy)
15. [Build & Deploy](#15-build--deploy)
16. [File Structure](#16-file-structure)

---

## 1. Overview

### 1.1 Purpose

Orion is a macOS desktop application that serves as an AI-powered personal butler. It combines conversational AI (Claude), a dynamic canvas UI (json-render), tool integrations (Composio), and semantic memory to help knowledge workers manage email, calendar, tasks, and relationships through the PARA organizational framework.

### 1.2 Technical Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| Desktop Shell | Tauri 2.0 | Native macOS app wrapper |
| Frontend | Next.js 14 + React | Web-based UI in WebView |
| Agent Backend | TypeScript + Claude Agent SDK | AI agent orchestration |
| Local Database | SQLite + sqlite-vec | App data + vector search |
| Shared Memory | PostgreSQL + pgvector | Cross-session learnings |
| Tool Integration | Composio MCP | Gmail, Calendar, Slack |
| Rich Text | TipTap | Document editing |
| UI Components | shadcn/ui + Tailwind | Component library |

### 1.3 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Desktop Framework | Tauri 2.0 | Smaller bundle (~10MB), better security model, Rust backend |
| Agent Runtime | Separate local server | Avoid blocking Tauri main process |
| Streaming Protocol | IPC events (Tauri) | Native, efficient, no network overhead |
| Database Split | SQLite (local) + PostgreSQL (shared) | Fast local queries + persistent memory |
| UI Protocol | json-render | Agent-generated dynamic interfaces (Vercel Labs, React-native) |

> **Note:** json-render replaces the originally planned A2UI integration. A2UI was not available for React at time of implementation (2026-01-14). See `PLAN-json-render-integration.md` for details.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
+-------------------------------------------------------------------------+
|                           ORION DESKTOP APP                              |
+-------------------------------------------------------------------------+
|                                                                         |
|   +-------------------+   +-------------------+   +-------------------+  |
|   |   TAURI SHELL     |   |   NEXT.JS UI      |   |   AGENT SERVER    |  |
|   |   (Rust)          |   |   (WebView)       |   |   (Node.js)       |  |
|   |                   |   |                   |   |                   |  |
|   | - Window mgmt     |   | - Chat panel      |   | - Claude SDK      |  |
|   | - File system     |   | - Canvas (json-   |   | - Tool execution  |  |
|   | - System tray     |   |   render/TipTap)  |   | - Session mgmt    |  |
|   | - IPC bridge      |   | - PARA views      |   | - Streaming       |  |
|   +--------+----------+   +--------+----------+   +--------+----------+  |
|            |                       |                       |             |
|            +----------+------------+                       |             |
|                       |                                    |             |
|              Tauri IPC (invoke/events)          HTTP/SSE localhost:3001  |
|                       |                                    |             |
+-------------------------------------------------------------------------+
                        |                                    |
          +-------------+-------------+        +-------------+-------------+
          |                           |        |                           |
    +-----v-----+             +-------v------+ |   +-------v---------+     |
    |  SQLite   |             |  PostgreSQL  | |   |    COMPOSIO     |     |
    |  (local)  |             |   (shared)   | |   |    (cloud)      |     |
    |           |             |              | |   |                 |     |
    | - Contacts|             | - Learnings  | |   | - Gmail         |     |
    | - Tasks   |             | - Embeddings | |   | - Calendar      |     |
    | - Inbox   |             | - Sessions   | |   | - Slack         |     |
    | - Prefs   |             | - Handoffs   | |   | - 500+ tools    |     |
    +-----------+             +--------------+ |   +-----------------+     |
                                               |                           |
                                               +---------------------------+
```

### 2.2 Process Architecture

```
[Tauri Main Process (Rust)]
    |
    +-- [WebView (Next.js/React)]
    |       |
    |       +-- Chat Component
    |       +-- Canvas Component (json-render + TipTap + Polotno)
    |       +-- PARA Views
    |
    +-- [Agent Server (Node.js) - Child Process]
            |
            +-- Claude Agent SDK
            +-- Composio Client
            +-- Tool Execution
```

### 2.3 Data Flow

```
User Input -> WebView -> Tauri IPC -> Agent Server -> Claude API
                                          |
                                          v
                                    Tool Execution
                                    (Composio/Local)
                                          |
                                          v
                                    Stream Response
                                          |
                                          v
                         Agent Server -> Tauri IPC -> WebView -> UI Update
```

---

## 3. Tech Stack

### 3.1 Core Technologies

> **[PLANNED]** - Versions match package.json as of 2026-01-20

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Desktop | Tauri | 2.9.x | Native wrapper, IPC, system access |
| Frontend | Next.js | 16.x | App Router, React Server Components |
| React | React | 19.x | UI framework |
| UI Library | shadcn/ui | latest | Accessible components |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Design System | Orion Design System | 1.0 | Editorial luxury tokens, typography |
| State | Zustand | 5.x | Client state management |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Rich Text | TipTap | 2.x | Document editor |
| Agent SDK | @anthropic-ai/claude-agent-sdk | 1.x | Claude integration |
| Tool Platform | Composio | 0.10.x | External integrations |
| Local DB | better-sqlite3 | 12.x | SQLite bindings |
| Vector DB | sqlite-vec | 0.1.x | Local embeddings |
| Shared DB | PostgreSQL | 16.x | Cross-session memory |

**Dependencies to add during implementation:**
- `zod` - Schema validation for agent tools and structured outputs
- `@tiptap/react`, `@tiptap/starter-kit` - Rich text editor (when implementing canvas)

### 3.2 Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package management |
| TypeScript | Type safety |
| ESLint | Linting |
| Prettier | Formatting |
| Vitest | Unit testing |
| Vercel Browser Agent | E2E testing |
| Turbo | Build system |

### 3.3 Claude Agent SDK Features

Orion uses the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`), NOT the direct Claude API. The SDK provides an autonomous agent runtime with built-in tools.

> **Important:** The Claude Agent SDK is different from the Anthropic SDK (`@anthropic-ai/sdk`). The Agent SDK wraps Claude Code's capabilities as a library, handling tool execution, sessions, and the agent loop automatically.

> **Implementation Note:** The `@anthropic-ai/claude-agent-sdk` described here represents the **target SDK architecture** based on Claude Code's internal patterns. For initial implementation, use `@anthropic-ai/sdk` directly with a custom tool execution loop until an official Agent SDK is available. See [Claude API docs](https://docs.anthropic.com/en/api) for current SDK capabilities.

#### 3.3.1 SDK vs Direct API

| Aspect | Claude Agent SDK | Direct Claude API |
|--------|------------------|-------------------|
| Package | `@anthropic-ai/claude-agent-sdk` | `@anthropic-ai/sdk` |
| Core Function | `query()` async generator | `client.messages.create()` |
| Tool Loop | **SDK handles automatically** | Manual implementation |
| Built-in Tools | Read, Write, Edit, Bash, Glob, Grep, etc. | None |
| Subagents | Native via `Task` tool | Not available |
| Hooks | PreToolUse, PostToolUse, Stop, etc. | Not available |
| Sessions | Built-in resume/fork | Manual management |
| **Use When** | Interactive agents, multi-step tasks | Batch processing, simple completions |

#### 3.3.2 Built-in Tools (No Configuration Needed)

| Tool | Purpose |
|------|---------|
| **Read** | Read files (text, images, PDFs, notebooks) |
| **Write** | Create/overwrite files |
| **Edit** | String replacement editing |
| **Bash** | Shell command execution |
| **Glob** | File pattern matching |
| **Grep** | Regex content search |
| **WebSearch** | Web search |
| **WebFetch** | Fetch URL content |
| **Task** | Spawn subagents |
| **AskUserQuestion** | Interactive prompts with options |
| **TodoWrite** | Task list management |

#### 3.3.3 SDK Configuration Options

| Option | Type | Purpose |
|--------|------|---------|
| `allowedTools` | `string[]` | Whitelist specific tools |
| `permissionMode` | `'default' \| 'acceptEdits' \| 'bypassPermissions'` | Control approval prompts |
| `mcpServers` | `Record<string, McpServerConfig>` | MCP server connections |
| `agents` | `Record<string, AgentDefinition>` | Define subagents |
| `hooks` | `Record<HookEvent, HookMatcher[]>` | Lifecycle hooks |
| `resume` | `string` | Resume session by ID |
| `outputFormat` | `{ type: 'json_schema', schema }` | Structured outputs |
| `maxThinkingTokens` | `number` | Extended thinking budget |
| `betas` | `string[]` | Beta features (e.g., `['context-1m-2025-08-07']`) |

#### 3.3.4 When to Use Direct API

Use `@anthropic-ai/sdk` directly (NOT the Agent SDK) for:

| Use Case | Rationale |
|----------|-----------|
| Batch triage | Process many items with structured outputs, no interactivity |
| Simple completions | Single-shot text generation without tools |
| Embedding generation | If using Claude for embeddings |
| Maximum control | When you need fine-grained API control |

#### 3.3.5 Context Compaction

The SDK automatically summarizes conversation history when approaching context limits, preventing context window exhaustion.

**How It Works:**
1. SDK monitors token usage after each model response
2. When tokens exceed `contextTokenThreshold` (~92% of limit), compaction triggers
3. Claude produces a structured summary in `<summary></summary>` tags
4. Full message history is replaced with the summary

**Summary Structure:**
| Section | Contents |
|---------|----------|
| Task Overview | Core request, success criteria, constraints |
| Current State | Completed work, modified files, artifacts |
| Important Discoveries | Technical constraints, decisions, errors resolved |
| Next Steps | Specific actions, blockers, priority order |
| Context to Preserve | User preferences, domain details, commitments |

**Configuration:**
```typescript
options: {
  enableCompaction: true,
  contextTokenThreshold: 50000  // Trigger at 50k tokens (earlier = safer)
}
```

**Why Orion Needs This:** Butler conversations can span hours of inbox triage, calendar scheduling, and task management. Without compaction, users would hit context limits mid-session.

#### 3.3.6 Permission Modes

Control how the SDK handles tool execution approval.

| Mode | Behavior | Use Case |
|------|----------|----------|
| `default` | Prompt user for all tool executions | **Production** - human oversight |
| `acceptEdits` | Auto-approve file operations, prompt for others | Development environments |
| `plan` | Analysis only, no tool execution | Planning, code review |
| `bypassPermissions` | Full auto-approve, no prompts | Controlled test environments only |

**Configuration:**
```typescript
options: {
  permissionMode: 'default'  // Always use 'default' in production
}
```

**Orion Implementation:**
- Production: `permissionMode: 'default'` with custom `canUseTool` callback
- The `canUseTool` callback handles Orion-specific approval logic (see §6.4)

#### 3.3.7 Max Turns (Safety Guardrail)

Prevent runaway agent loops by limiting iteration count.

```typescript
options: {
  maxTurns: 100  // Stop after 100 tool-use cycles
}
```

**Recommended Values:**
| Scenario | Max Turns | Rationale |
|----------|-----------|-----------|
| Simple queries | 10-25 | Quick responses |
| Inbox triage | 50-100 | Multiple emails to process |
| Complex workflows | 100-250 | Multi-step tasks with many tools |

**Why This Matters:** Without limits, an agent could theoretically loop forever if tool results don't satisfy completion criteria.

#### 3.3.8 Session Management

The SDK provides built-in session persistence for conversation continuity.

**Session Storage:** `~/.claude/projects/<project>/<session-id>.jsonl`

**Capturing Session ID:**
```typescript
let sessionId: string;

for await (const message of query({ prompt: "Help me organize my inbox" })) {
  if (message.type === "system" && message.sessionId) {
    sessionId = message.sessionId;  // Capture for later resume
  }
  // Handle other message types...
}

// Store sessionId in Orion's database for this conversation
await db.conversations.update(conversationId, { agentSessionId: sessionId });
```

**Resuming a Session:**
```typescript
// User returns to a previous conversation
const conversation = await db.conversations.get(conversationId);

for await (const message of query({
  prompt: "Continue where we left off",
  options: {
    resume: conversation.agentSessionId  // Full context restored
  }
})) {
  // Conversation continues with previous context
}
```

**Orion Use Cases:**
- User closes app mid-conversation → Resume next day
- Context compaction occurred → Session still resumable
- Multi-day inbox processing → Continuous context

#### 3.3.9 Stream Message Types

The SDK emits typed messages that Orion maps to UI states.

| SDK Message Type | `message.type` | `message.subtype` | UI Action |
|------------------|----------------|-------------------|-----------|
| Text response | `assistant` | — | Stream to chat bubble |
| Tool invocation | `tool_use` | — | Show tool card (pending) |
| Tool result | `tool_result` | — | Update tool card (complete) |
| Conversation end | `result` | `end_turn` | Mark message complete |
| Max turns hit | `result` | `max_turns` | Show "paused" indicator |
| Error | `result` | `error` | Display error state |
| Session info | `system` | — | Capture `sessionId` |

**Stream Handler Pattern:**
```typescript
for await (const message of query({ prompt, options })) {
  switch (message.type) {
    case 'assistant':
      // Stream text chunks to UI
      for (const block of message.message.content) {
        if ('text' in block) {
          onTextChunk(block.text);
        }
      }
      break;

    case 'tool_use':
      // Show tool card
      onToolStart({
        toolName: message.toolName,
        toolInput: message.input,
        status: 'running'
      });
      break;

    case 'tool_result':
      // Update tool card with result
      onToolComplete({
        toolName: message.toolName,
        output: message.output,
        status: message.error ? 'error' : 'success'
      });
      break;

    case 'result':
      if (message.subtype === 'end_turn') {
        onComplete();
      } else if (message.subtype === 'error') {
        onError(message.error);
      }
      break;

    case 'system':
      if (message.sessionId) {
        captureSessionId(message.sessionId);
      }
      break;
  }
}
```

#### 3.3.10 Tool Search (Large Tool Sets)

For MCP servers with many tools (like Composio's 500+), enable dynamic tool loading.

**Without Tool Search:** All tool schemas loaded into context upfront → bloated context
**With Tool Search:** Tools loaded on-demand as Claude needs them → efficient context

**Configuration:**
```typescript
options: {
  enableToolSearch: true  // Requires Sonnet 4+ or Opus 4+
}
```

**When to Enable:**
- Composio integration (500+ tools)
- Multiple MCP servers combined
- Total tools > 50

**Orion Configuration:** Always enabled (Composio integration requires it)

#### 3.3.11 Production Configuration (Recommended)

Complete SDK configuration for Orion production deployment:

```typescript
import { query, ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';

const ORION_SDK_OPTIONS: Partial<ClaudeAgentOptions> = {
  // Model
  model: 'claude-opus-4-5-20251101',

  // Safety & Control
  permissionMode: 'default',
  maxTurns: 100,

  // Context Management
  enableCompaction: true,
  contextTokenThreshold: 50000,

  // Tool Configuration
  enableToolSearch: true,
  allowedTools: [
    // Built-in tools
    'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
    'WebSearch', 'WebFetch', 'AskUserQuestion', 'TodoWrite', 'Task',
    // MCP tools (Composio)
    'mcp__composio__*',
    // Custom Orion tools
    'mcp__orion__*'
  ],

  // MCP Servers
  mcpServers: {
    composio: {
      command: 'npx',
      args: ['composio-mcp'],
      env: { COMPOSIO_API_KEY: process.env.COMPOSIO_API_KEY }
    },
    orion: {
      // In-process MCP server for Orion-specific tools
      // See §6.3 for tool definitions
    }
  },

  // Extended Thinking (for complex reasoning)
  maxThinkingTokens: 10000,

  // Beta Features
  betas: ['context-1m-2025-08-07']  // Extended context window
};

// Usage in agent server
export async function* handleUserMessage(
  conversationId: string,
  prompt: string,
  resumeSessionId?: string
) {
  const options: ClaudeAgentOptions = {
    ...ORION_SDK_OPTIONS,
    ...(resumeSessionId && { resume: resumeSessionId })
  };

  for await (const message of query({ prompt, options })) {
    yield message;
  }
}
```

### 3.4 Orion Design System

> **[IMPLEMENTED]** - Design tokens and styles in `/design-system/` directory

Orion uses a custom design system with an **editorial luxury aesthetic** - inspired by high-end magazines and luxury brand catalogs.

**Source:** `design-system/` directory

#### 3.4.1 Design Philosophy

| Principle | Implementation |
|-----------|----------------|
| Zero border radius | Sharp, architectural edges throughout |
| Generous whitespace | Breathing room, minimal density |
| Black & Gold | Monochrome with strategic gold highlights |
| Serif headlines | Playfair Display italics for elegance |
| Micro typography | 9-11px uppercase tracking for labels |
| Grayscale imagery | Images start B&W, reveal color on hover |

#### 3.4.2 Required Fonts

**Add to `<head>` in layout:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
```

| Font | Usage | Weights |
|------|-------|---------|
| **Playfair Display** | Headlines, quotes, emphasis | 400-900, italic |
| **Inter** | Body text, labels, UI | 100-900 |

#### 3.4.3 Color Palette

| Token | Hex Value | CSS Variable | Usage |
|-------|-----------|--------------|-------|
| Primary (Gold) | `#D4AF37` | `--orion-primary` | CTAs, highlights, accent |
| Background (Cream) | `#F9F8F6` | `--orion-bg` | Page background |
| Foreground (Black) | `#1A1A1A` | `--orion-fg` | Text, borders |

**Extended palette (Tailwind classes):**

```css
/* Primary variations */
orion-primary-DEFAULT   /* #D4AF37 */
orion-primary-hover     /* #C9A431 */
orion-primary-muted     /* rgba(212, 175, 55, 0.12) */
orion-primary-light     /* rgba(212, 175, 55, 0.05) */

/* Foreground opacity levels */
orion-fg-DEFAULT        /* #1A1A1A */
orion-fg-muted          /* 60% opacity */
orion-fg-subtle         /* 40% opacity */
orion-fg-faint          /* 20% opacity */

/* Border opacity levels */
orion-border-DEFAULT    /* #1A1A1A solid */
orion-border-muted      /* 15% opacity */
orion-border-subtle     /* 10% opacity */
orion-border-faint      /* 5% opacity */
```

#### 3.4.4 Typography Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-2xs` | 9px | Micro labels |
| `text-xs` | 10px | Section labels, timestamps |
| `h1` | 96px | Hero headlines |
| `h2` | 72px | Page titles |
| `h3` | 48px | Section headers |
| `h4` | 36px | Card titles |
| `h5` | 24px | Subsections |
| `h6` | 20px | Small headers |

**Letter spacing (editorial tracking):**

| Class | Value | Usage |
|-------|-------|-------|
| `tracking-editorial` | 0.25em | Standard label tracking |
| `tracking-luxury` | 0.30em | Emphasis tracking |
| `tracking-ultra` | 0.40em | Maximum tracking |

#### 3.4.5 Layout Dimensions

```
┌─────────────────────────────────────────────────────────┐
│ 80px HEADER (logo, search, notifications, avatar)       │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│  280px   │      MAIN CONTENT            │  64px         │
│  SIDEBAR │      (Chat / Dashboard)      │  AGENT RAIL   │
│  (PARA)  │      max-width: 850px        │  (sparkle)    │
│          │                              │               │
│          ├──────────────────────────────┤               │
│          │  INPUT BAR                   │               │
└──────────┴──────────────────────────────┴───────────────┘
```

| CSS Variable | Value | Purpose |
|--------------|-------|---------|
| `--orion-header-height` | 80px | Top header |
| `--orion-sidebar-width` | 280px | PARA sidebar |
| `--orion-sidebar-collapsed` | 72px | Collapsed sidebar |
| `--orion-rail-width` | 64px | Right agent rail |
| `--orion-content-max-width` | 850px | Main content area |
| `--orion-chat-width` | 480px | Chat panel width |

#### 3.4.6 Animation & Easing

| CSS Variable | Value | Usage |
|--------------|-------|-------|
| `--orion-easing` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Primary easing (luxury) |
| `--orion-easing-elegant` | `cubic-bezier(0.19, 1, 0.22, 1)` | Elegant out-expo |
| `--orion-duration-medium` | 500ms | Standard transitions |
| `--orion-duration-slow` | 700ms | Reveal animations |
| `--orion-duration-slowest` | 1200ms | Full reveals |

**Staggered reveal pattern:**

```html
<div class="animate-reveal">First item</div>
<div class="animate-reveal delay-1">Second (0.2s delay)</div>
<div class="animate-reveal delay-2">Third (0.4s delay)</div>
<div class="animate-reveal delay-3">Fourth (0.6s delay)</div>
```

#### 3.4.7 Component Classes

| Class | Description |
|-------|-------------|
| `.btn-gold-slide` | Primary CTA with gold slide-in hover effect |
| `.luxury-card` | Card with top border, grayscale-to-color images |
| `.input-editorial` | Underline-only input with serif italic placeholder |
| `.grid-bg` | 40px grid pattern at 3% opacity |
| `.dots-bg` | 24px dot pattern background |
| `.chat-user` | User message (black bg, cream text) |
| `.chat-agent` | Agent message (gold left border) |
| `.serif` | Apply Playfair Display font |

#### 3.4.8 Integration with shadcn/ui

Override shadcn CSS variables to use Orion tokens:

```css
:root {
  --background: 38 33% 97%;     /* Orion cream #F9F8F6 */
  --foreground: 0 0% 10%;       /* Orion black #1A1A1A */
  --primary: 43 65% 52%;        /* Orion gold #D4AF37 */
  --primary-foreground: 0 0% 100%;
  --radius: 0rem;               /* Sharp corners */
}
```

#### 3.4.9 Setup Instructions

1. **Import global styles** in `app/globals.css`:
   ```css
   @import '../design-system/styles/globals.css';
   ```

2. **Configure Tailwind** in `tailwind.config.ts`:
   ```typescript
   import { orionTailwindPreset } from './design-system/tailwind.config'

   export default {
     presets: [orionTailwindPreset],
     content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
   }
   ```

3. **Use typed tokens** in components:
   ```typescript
   import { colors, typography, spacing } from '@/design-system'

   const gold = colors.primary.DEFAULT // '#D4AF37'
   const serif = typography.fontFamily.serif // ['Playfair Display', ...]
   ```

#### 3.4.10 File Structure

```
design-system/
├── tokens/
│   ├── colors.ts          # Color palette
│   ├── typography.ts      # Fonts, sizes, spacing
│   ├── spacing.ts         # Layout dimensions
│   ├── animations.ts      # Easing, keyframes, durations
│   ├── effects.ts         # Shadows, filters, patterns
│   └── index.ts           # Token exports
├── styles/
│   └── globals.css        # Global CSS with all styles
├── tailwind.config.ts     # Tailwind preset
├── index.ts               # Main entry point
└── README.md              # Full documentation
```

---

## 4. Database Design

### 4.1 SQLite Schema (Local Data)

**Location:** `~/Library/Application Support/Orion/orion.db`

```sql
-- ============================================================================
-- ORION SQLITE SCHEMA
-- ============================================================================

-- Enable optimizations
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA cache_size=-64000;  -- 64MB cache

-- ============================================================================
-- CONTACTS
-- ============================================================================

CREATE TABLE contacts (
    id TEXT PRIMARY KEY,                    -- cont_xxx format
    name TEXT NOT NULL,
    nickname TEXT,
    type TEXT DEFAULT 'person',             -- person | organization
    relationship TEXT,                       -- friend | family | colleague | vendor
    organization_id TEXT REFERENCES organizations(id),
    job_title TEXT,
    department TEXT,
    notes TEXT,
    
    -- Communication preferences
    preferred_channel TEXT,                  -- email | phone | slack
    timezone TEXT,
    typical_response_time TEXT,
    best_contact_times TEXT,                 -- JSON array
    
    -- Metadata
    tags TEXT,                               -- JSON array
    metadata TEXT,                           -- JSON
    
    -- Tracking
    last_interaction_at TEXT,
    interaction_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    -- Vector embedding (1024 dims, BGE-M3)
    embedding BLOB
);

CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_relationship ON contacts(relationship);

-- Full-text search
CREATE VIRTUAL TABLE contacts_fts USING fts5(
    name, nickname, notes, tags,
    content='contacts',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

-- FTS sync triggers
CREATE TRIGGER contacts_ai AFTER INSERT ON contacts BEGIN
    INSERT INTO contacts_fts(rowid, name, nickname, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.nickname, NEW.notes, NEW.tags);
END;

CREATE TRIGGER contacts_ad AFTER DELETE ON contacts BEGIN
    INSERT INTO contacts_fts(contacts_fts, rowid, name, nickname, notes, tags)
    VALUES('delete', OLD.rowid, OLD.name, OLD.nickname, OLD.notes, OLD.tags);
END;

CREATE TRIGGER contacts_au AFTER UPDATE ON contacts BEGIN
    INSERT INTO contacts_fts(contacts_fts, rowid, name, nickname, notes, tags)
    VALUES('delete', OLD.rowid, OLD.name, OLD.nickname, OLD.notes, OLD.tags);
    INSERT INTO contacts_fts(rowid, name, nickname, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.nickname, NEW.notes, NEW.tags);
END;

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE organizations (
    id TEXT PRIMARY KEY,                     -- org_xxx format
    name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    size TEXT,                               -- startup | small | medium | large | enterprise
    notes TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_organizations_domain ON organizations(domain);

-- ============================================================================
-- CONTACT METHODS
-- ============================================================================

CREATE TABLE contact_methods (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type TEXT NOT NULL,                      -- email | phone | linkedin | twitter | slack
    value TEXT NOT NULL,
    label TEXT,                              -- work | personal | mobile
    is_primary INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_contact_methods_contact ON contact_methods(contact_id);
CREATE INDEX idx_contact_methods_value ON contact_methods(value);

-- ============================================================================
-- PROJECTS (PARA)
-- ============================================================================

CREATE TABLE projects (
    id TEXT PRIMARY KEY,                     -- proj_xxx format
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',            -- active | paused | completed | cancelled
    priority TEXT DEFAULT 'medium',          -- high | medium | low
    area_id TEXT REFERENCES areas(id),
    deadline TEXT,                           -- ISO date
    
    -- JSON fields
    stakeholders TEXT,                       -- [{contact_id, role}]
    linked_tools TEXT,                       -- [{tool, id}]
    success_criteria TEXT,                   -- [strings]
    tags TEXT,
    metadata TEXT,
    embedding BLOB,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_area ON projects(area_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);

-- ============================================================================
-- AREAS (PARA)
-- ============================================================================

CREATE TABLE areas (
    id TEXT PRIMARY KEY,                     -- area_xxx format
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',            -- active | dormant
    responsibilities TEXT,                   -- JSON array
    goals TEXT,                              -- [{metric, target}]
    review_cadence TEXT,                     -- daily | weekly | monthly
    tags TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- TASKS
-- ============================================================================

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,                     -- task_xxx format
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',           -- pending | in_progress | completed | cancelled
    priority TEXT DEFAULT 'medium',          -- high | medium | low
    
    -- Relationships
    project_id TEXT REFERENCES projects(id),
    area_id TEXT REFERENCES areas(id),
    assigned_to TEXT REFERENCES contacts(id),
    delegated_to TEXT REFERENCES contacts(id),
    
    -- Scheduling
    due_date TEXT,
    due_time TEXT,
    start_date TEXT,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    recurrence TEXT,                         -- JSON: {frequency, interval, until}
    
    -- Dependencies
    depends_on TEXT,                         -- JSON array of task_ids
    blocked_by TEXT,
    
    -- Source tracking
    source_tool TEXT,                        -- gmail | linear | manual
    source_id TEXT,
    
    tags TEXT,
    metadata TEXT,
    embedding BLOB,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_source ON tasks(source_tool, source_id);

-- ============================================================================
-- INBOX ITEMS
-- ============================================================================

CREATE TABLE inbox_items (
    id TEXT PRIMARY KEY,                     -- inbox_xxx format
    
    -- Source
    source_tool TEXT NOT NULL,               -- gmail | slack | calendar | manual
    source_id TEXT,
    source_account TEXT,                     -- work | personal
    
    -- Content
    type TEXT NOT NULL,                      -- email | message | event | task | file
    title TEXT NOT NULL,
    preview TEXT,
    full_content TEXT,
    
    -- Sender
    from_name TEXT,
    from_email TEXT,
    from_contact_id TEXT REFERENCES contacts(id),
    
    -- AI Analysis
    priority_score REAL,                     -- 0.0 to 1.0
    needs_response INTEGER DEFAULT 0,
    suggested_response_by TEXT,
    detected_actions TEXT,                   -- JSON array
    related_project_id TEXT REFERENCES projects(id),
    sentiment TEXT,                          -- positive | neutral | negative
    urgency TEXT,                            -- urgent | normal | low
    category TEXT,                           -- meeting | request | fyi | personal
    
    -- Processing
    processed INTEGER DEFAULT 0,
    processed_at TEXT,
    action_taken TEXT,                       -- replied | filed | delegated | archived
    filed_to TEXT,
    deferred_until TEXT,
    snoozed_until TEXT,
    
    tags TEXT,
    metadata TEXT,
    embedding BLOB,
    
    received_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_inbox_processed ON inbox_items(processed);
CREATE INDEX idx_inbox_source ON inbox_items(source_tool, source_id);
CREATE INDEX idx_inbox_priority ON inbox_items(priority_score DESC);
CREATE INDEX idx_inbox_received ON inbox_items(received_at DESC);

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

CREATE TABLE conversations (
    id TEXT PRIMARY KEY,                     -- conv_xxx format
    sdk_session_id TEXT,                     -- Claude SDK session ID
    title TEXT,
    summary TEXT,
    
    -- Context
    project_id TEXT REFERENCES projects(id),
    area_id TEXT REFERENCES areas(id),
    
    -- Stats
    message_count INTEGER DEFAULT 0,
    tool_call_count INTEGER DEFAULT 0,
    
    -- State
    is_active INTEGER DEFAULT 1,
    is_pinned INTEGER DEFAULT 0,
    
    tags TEXT,
    metadata TEXT,
    
    started_at TEXT DEFAULT (datetime('now')),
    last_message_at TEXT,
    archived_at TEXT
);

CREATE INDEX idx_conversations_active ON conversations(is_active, last_message_at DESC);

-- ============================================================================
-- MESSAGES
-- ============================================================================

CREATE TABLE messages (
    id TEXT PRIMARY KEY,                     -- msg_xxx format
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,                      -- user | assistant | system
    content TEXT NOT NULL,
    
    -- Tool use
    tool_calls TEXT,                         -- JSON array
    tool_results TEXT,                       -- JSON array
    
    -- Tokens
    input_tokens INTEGER,
    output_tokens INTEGER,
    
    -- Feedback
    feedback TEXT,                           -- thumbs_up | thumbs_down
    feedback_note TEXT,
    
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================================
-- TOOL CONNECTIONS
-- ============================================================================

CREATE TABLE tool_connections (
    id TEXT PRIMARY KEY,
    tool_name TEXT NOT NULL,                 -- gmail | slack | calendar
    account_alias TEXT NOT NULL,             -- work | personal | default
    connection_type TEXT NOT NULL,           -- composio | api_key | oauth_direct
    
    -- Composio
    composio_connection_id TEXT,
    composio_entity_id TEXT,
    
    -- State
    status TEXT DEFAULT 'active',            -- active | expired | revoked | error
    last_error TEXT,
    capabilities TEXT,                       -- JSON array
    
    -- Expiry
    expires_at TEXT,
    last_refreshed_at TEXT,
    last_used_at TEXT,
    
    -- Account
    account_email TEXT,
    account_name TEXT,
    
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    UNIQUE(tool_name, account_alias)
);

CREATE INDEX idx_tool_connections_status ON tool_connections(status);

-- ============================================================================
-- PREFERENCES
-- ============================================================================

CREATE TABLE preferences (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,                  -- communication | calendar | notifications
    key TEXT NOT NULL,                       -- email_signature | meeting_length
    value TEXT NOT NULL,                     -- JSON value
    
    -- Learning
    source TEXT DEFAULT 'user',              -- user | learned | default
    confidence REAL DEFAULT 1.0,             -- 0-1 for learned
    observation_count INTEGER DEFAULT 1,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    UNIQUE(category, key)
);

-- ============================================================================
-- INTERACTION LOG (For learning)
-- ============================================================================

CREATE TABLE interaction_log (
    id TEXT PRIMARY KEY,
    interaction_type TEXT NOT NULL,          -- email_draft | meeting_time | task_priority
    suggestion TEXT NOT NULL,                -- JSON
    accepted INTEGER,                        -- 1 = yes, 0 = no, NULL = no response
    user_modification TEXT,                  -- What user changed
    context TEXT,                            -- JSON
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_interaction_type ON interaction_log(interaction_type);

-- ============================================================================
-- RESOURCES (PARA)
-- ============================================================================

CREATE TABLE resources (
    id TEXT PRIMARY KEY,                     -- res_xxx format
    name TEXT NOT NULL,
    type TEXT NOT NULL,                      -- template | document | link | note
    content TEXT,
    file_path TEXT,
    url TEXT,
    tags TEXT,
    metadata TEXT,
    embedding BLOB,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- ENTITY LINKS (Cross-references)
-- ============================================================================

CREATE TABLE entity_links (
    id TEXT PRIMARY KEY,
    source_type TEXT NOT NULL,               -- project | task | contact | inbox_item
    source_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relationship TEXT,                       -- stakeholder | related | mentions | blocks
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    
    UNIQUE(source_type, source_id, target_type, target_id)
);

CREATE INDEX idx_entity_links_source ON entity_links(source_type, source_id);
CREATE INDEX idx_entity_links_target ON entity_links(target_type, target_id);
```

### 4.2 TypeScript Types for Database Entities

```typescript
// src/types/database.ts

// ID generation
export type EntityPrefix = 'cont' | 'org' | 'proj' | 'area' | 'task' | 'inbox' | 'conv' | 'msg' | 'res';
export type EntityId<P extends EntityPrefix> = `${P}_${string}`;

// Contact
export interface Contact {
  id: EntityId<'cont'>;
  name: string;
  nickname?: string;
  type: 'person' | 'organization';
  relationship?: 'friend' | 'family' | 'colleague' | 'vendor' | 'client';
  organization_id?: EntityId<'org'>;
  job_title?: string;
  department?: string;
  notes?: string;
  preferred_channel?: 'email' | 'phone' | 'slack';
  timezone?: string;
  typical_response_time?: string;
  best_contact_times?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  last_interaction_at?: string;
  interaction_count: number;
  created_at: string;
  updated_at: string;
  embedding?: Float32Array;
}

// Project
export interface Project {
  id: EntityId<'proj'>;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  area_id?: EntityId<'area'>;
  deadline?: string;
  stakeholders?: Array<{ contact_id: EntityId<'cont'>; role: string }>;
  linked_tools?: Array<{ tool: string; id: string }>;
  success_criteria?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Task
export interface Task {
  id: EntityId<'task'>;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  project_id?: EntityId<'proj'>;
  area_id?: EntityId<'area'>;
  assigned_to?: EntityId<'cont'>;
  delegated_to?: EntityId<'cont'>;
  due_date?: string;
  due_time?: string;
  start_date?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  recurrence?: { frequency: string; interval: number; until?: string };
  depends_on?: EntityId<'task'>[];
  blocked_by?: EntityId<'task'>[];
  source_tool?: 'gmail' | 'linear' | 'manual';
  source_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Inbox Item
export interface InboxItem {
  id: EntityId<'inbox'>;
  source_tool: 'gmail' | 'slack' | 'calendar' | 'manual';
  source_id?: string;
  source_account?: string;
  type: 'email' | 'message' | 'event' | 'task' | 'file';
  title: string;
  preview?: string;
  full_content?: string;
  from_name?: string;
  from_email?: string;
  from_contact_id?: EntityId<'cont'>;
  priority_score?: number;
  needs_response: boolean;
  suggested_response_by?: string;
  detected_actions?: DetectedAction[];
  related_project_id?: EntityId<'proj'>;
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'urgent' | 'normal' | 'low';
  category?: 'meeting' | 'request' | 'fyi' | 'personal';
  processed: boolean;
  processed_at?: string;
  action_taken?: 'replied' | 'filed' | 'delegated' | 'archived';
  filed_to?: string;
  snoozed_until?: string;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface DetectedAction {
  action: string;
  type: 'task' | 'reply' | 'calendar' | 'delegate';
  suggested_due?: string;
  suggested_project?: EntityId<'proj'>;
  confidence: number;
}

// Conversation
export interface Conversation {
  id: EntityId<'conv'>;
  sdk_session_id?: string;
  title?: string;
  summary?: string;
  project_id?: EntityId<'proj'>;
  area_id?: EntityId<'area'>;
  message_count: number;
  tool_call_count: number;
  is_active: boolean;
  is_pinned: boolean;
  started_at: string;
  last_message_at?: string;
  archived_at?: string;
}

// Message
export interface Message {
  id: EntityId<'msg'>;
  conversation_id: EntityId<'conv'>;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  input_tokens?: number;
  output_tokens?: number;
  feedback?: 'thumbs_up' | 'thumbs_down';
  feedback_note?: string;
  created_at: string;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  tool_use_id: string;
  content: string | Record<string, unknown>;
  is_error?: boolean;
}

// Tool Connection
export interface ToolConnection {
  id: string;
  tool_name: string;
  account_alias: string;
  connection_type: 'composio' | 'api_key' | 'oauth_direct';
  composio_connection_id?: string;
  composio_entity_id?: string;
  status: 'active' | 'expired' | 'revoked' | 'error';
  last_error?: string;
  capabilities?: string[];
  expires_at?: string;
  last_used_at?: string;
  account_email?: string;
  account_name?: string;
}

// Preference
export interface Preference {
  id: string;
  category: string;
  key: string;
  value: unknown;
  source: 'user' | 'learned' | 'default';
  confidence: number;
  observation_count: number;
}
```

### 4.3 PostgreSQL Schema (Shared Memory)

Uses existing `opc/` infrastructure:

```sql
-- archival_memory table (existing)
CREATE TABLE archival_memory (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    memory_type TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    tags TEXT[],
    confidence TEXT DEFAULT 'medium',
    embedding vector(1024),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Vector similarity index
CREATE INDEX idx_archival_memory_embedding ON archival_memory 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

---

## 5. API Design

### 5.1 Tauri Commands

Tauri commands are the bridge between the WebView frontend and the Rust backend.

```rust
// src-tauri/src/commands.rs

use tauri::command;
use serde::{Deserialize, Serialize};

// ============================================================================
// Database Commands
// ============================================================================

#[derive(Serialize, Deserialize)]
pub struct Contact {
    pub id: String,
    pub name: String,
    // ... other fields
}

#[command]
pub async fn get_contacts(
    app: tauri::AppHandle,
    search: Option<String>,
    limit: Option<i32>,
) -> Result<Vec<Contact>, String> {
    // Query SQLite
}

#[command]
pub async fn create_contact(
    app: tauri::AppHandle,
    contact: Contact,
) -> Result<Contact, String> {
    // Insert into SQLite
}

#[command]
pub async fn get_inbox_items(
    app: tauri::AppHandle,
    processed: Option<bool>,
    priority_min: Option<f64>,
) -> Result<Vec<InboxItem>, String> {
    // Query inbox
}

// ============================================================================
// Agent Commands
// ============================================================================

#[command]
pub async fn start_agent_query(
    app: tauri::AppHandle,
    prompt: String,
    session_id: Option<String>,
) -> Result<String, String> {
    // Returns stream_id
    // Spawns agent server request
    // Streams responses via events
}

#[command]
pub async fn abort_agent_query(
    app: tauri::AppHandle,
    stream_id: String,
) -> Result<(), String> {
    // Cancel ongoing query
}

// ============================================================================
// Tool Connection Commands
// ============================================================================

#[command]
pub async fn get_tool_connections(
    app: tauri::AppHandle,
) -> Result<Vec<ToolConnection>, String> {
    // List connected tools
}

#[command]
pub async fn initiate_tool_connection(
    app: tauri::AppHandle,
    tool_name: String,
    account_alias: String,
) -> Result<String, String> {
    // Returns OAuth URL
}

#[command]
pub async fn disconnect_tool(
    app: tauri::AppHandle,
    connection_id: String,
) -> Result<(), String> {
    // Revoke connection
}
```

### 5.2 TypeScript Bindings (Frontend)

```typescript
// src/lib/tauri.ts

import { invoke } from '@tauri-apps/api/core';
import { listen, emit } from '@tauri-apps/api/event';
import type { Contact, InboxItem, ToolConnection } from '@/types/database';

// ============================================================================
// Database API
// ============================================================================

export const db = {
  contacts: {
    list: (params?: { search?: string; limit?: number }) =>
      invoke<Contact[]>('get_contacts', params),
    
    get: (id: string) =>
      invoke<Contact>('get_contact', { id }),
    
    create: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) =>
      invoke<Contact>('create_contact', { contact }),
    
    update: (id: string, updates: Partial<Contact>) =>
      invoke<Contact>('update_contact', { id, updates }),
    
    delete: (id: string) =>
      invoke<void>('delete_contact', { id }),
    
    search: (query: string) =>
      invoke<Contact[]>('search_contacts_semantic', { query }),
  },
  
  inbox: {
    list: (params?: { processed?: boolean; priorityMin?: number }) =>
      invoke<InboxItem[]>('get_inbox_items', params),
    
    process: (id: string, action: string) =>
      invoke<void>('process_inbox_item', { id, action }),
    
    sync: () =>
      invoke<{ synced: number }>('sync_inbox'),
  },
  
  projects: {
    list: (params?: { status?: string; areaId?: string }) =>
      invoke<Project[]>('get_projects', params),
    // ... similar CRUD operations
  },
  
  tasks: {
    list: (params?: { projectId?: string; status?: string }) =>
      invoke<Task[]>('get_tasks', params),
    // ... similar CRUD operations
  },
};

// ============================================================================
// Agent API
// ============================================================================

export interface StreamMessage {
  type: 'thinking' | 'text' | 'tool_start' | 'tool_complete' | 'complete' | 'error';
  content?: string;
  toolName?: string;
  toolId?: string;
  isError?: boolean;
  error?: string;
}

export const agent = {
  query: async (
    prompt: string,
    sessionId?: string,
    onStream?: (message: StreamMessage) => void,
  ): Promise<{ streamId: string; cleanup: () => void }> => {
    const streamId = await invoke<string>('start_agent_query', { prompt, sessionId });
    
    const unlisten = await listen<StreamMessage>(`agent:stream:${streamId}`, (event) => {
      onStream?.(event.payload);
    });
    
    return {
      streamId,
      cleanup: () => {
        unlisten();
        invoke('abort_agent_query', { streamId }).catch(() => {});
      },
    };
  },
  
  abort: (streamId: string) =>
    invoke<void>('abort_agent_query', { streamId }),
  
  getSessions: () =>
    invoke<Conversation[]>('get_conversations'),
  
  resumeSession: (sessionId: string) =>
    invoke<void>('resume_session', { sessionId }),
};

// ============================================================================
// Tool Connection API
// ============================================================================

export const tools = {
  list: () =>
    invoke<ToolConnection[]>('get_tool_connections'),
  
  connect: async (toolName: string, accountAlias: string = 'default') => {
    const authUrl = await invoke<string>('initiate_tool_connection', {
      toolName,
      accountAlias,
    });
    // Open OAuth URL in browser
    return authUrl;
  },
  
  disconnect: (connectionId: string) =>
    invoke<void>('disconnect_tool', { connectionId }),
  
  getStatus: (toolName: string) =>
    invoke<{ status: string; capabilities: string[] }>('get_tool_status', { toolName }),
};
```

### 5.3 Agent Server API (Local HTTP)

The agent server runs on `localhost:3001` and handles Claude SDK operations.

```typescript
// agent-server/src/routes.ts

import express from 'express';
import { query as claudeQuery, ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';

const app = express();

// ============================================================================
// Streaming Endpoint (SSE)
// ============================================================================

app.get('/api/stream/:streamId', async (req, res) => {
  const { streamId } = req.params;
  const { prompt, sessionId } = req.query as { prompt: string; sessionId?: string };
  
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  
  const options: ClaudeAgentOptions = {
    model: 'claude-sonnet-4-5',
    ...(sessionId && { resume: sessionId }),
  };
  
  try {
    for await (const message of claudeQuery({ prompt, options })) {
      // Send event based on message type
      if (message.type === 'assistant') {
        for (const block of message.content) {
          if (block.type === 'text') {
            res.write(`event: text\ndata: ${JSON.stringify({ content: block.text })}\n\n`);
          } else if (block.type === 'tool_use') {
            res.write(`event: tool_start\ndata: ${JSON.stringify({ 
              toolName: block.name, 
              toolId: block.id 
            })}\n\n`);
          }
        }
      } else if (message.type === 'result') {
        res.write(`event: result\ndata: ${JSON.stringify({
          sessionId: message.session_id,
          cost: message.total_cost_usd,
        })}\n\n`);
      }
    }
    
    res.write(`event: complete\ndata: {}\n\n`);
  } catch (error) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: String(error) })}\n\n`);
  } finally {
    res.end();
  }
});

// ============================================================================
// Tool Execution Endpoint
// ============================================================================

app.post('/api/tools/execute', async (req, res) => {
  const { tool, action, params, accountAlias } = req.body;
  
  // Route through Composio
  const result = await composio.tools.execute({
    userId: 'default',
    slug: `${tool.toUpperCase()}_${action.toUpperCase()}`,
    arguments: params,
  });
  
  res.json(result);
});

// ============================================================================
// Session Management
// ============================================================================

app.get('/api/sessions', async (req, res) => {
  // List Claude SDK sessions
  const sessions = await listSessions();
  res.json({ sessions });
});

app.post('/api/sessions/:sessionId/fork', async (req, res) => {
  const { sessionId } = req.params;
  // Fork session for branching
  const newSessionId = await forkSession(sessionId);
  res.json({ sessionId: newSessionId });
});
```

---

## 6. Agent Architecture

> **[NOT STARTED]** - `agent-server/` directory was removed during restructure. Implementation planned for Epic 2.

### 6.1 Agent Hierarchy

```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (Inbox processing)
    |
    +-- Scheduler Agent (Calendar management)
    |
    +-- Communicator Agent (Email/message drafting)
    |
    +-- Navigator Agent (PARA search)
    |
    +-- Preference Learner Agent (Pattern detection)
```

### 6.2 Agent Lifecycle

```typescript
// src/agents/lifecycle.ts

export enum AgentState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING_CONTEXT = 'loading_context',
  PROCESSING = 'processing',
  WAITING_FOR_TOOL = 'waiting_for_tool',
  WAITING_FOR_USER = 'waiting_for_user',
  DELEGATING = 'delegating',
  COMPLETING = 'completing',
  ERROR = 'error',
}

export interface AgentContext {
  sessionId: string;
  userId: string;
  activeProject?: Project;
  relevantContacts?: Contact[];
  userPreferences?: Preference[];
  recentContext?: Message[];
  currentState: AgentState;
}

export async function initializeAgentContext(
  sessionId: string,
  prompt: string,
): Promise<AgentContext> {
  // 1. Extract entities from prompt
  const entities = await extractEntities(prompt);
  
  // 2. Load relevant projects
  const projects = await db.projects.list({ status: 'active' });
  const activeProject = matchProject(entities, projects);
  
  // 3. Load relevant contacts
  const contacts = await db.contacts.search(prompt);
  
  // 4. Load user preferences
  const preferences = await db.preferences.list();
  
  // 5. Load recent context
  const recentMessages = await db.messages.list({
    conversationId: sessionId,
    limit: 20,
  });
  
  return {
    sessionId,
    userId: 'default',
    activeProject,
    relevantContacts: contacts,
    userPreferences: preferences,
    recentContext: recentMessages,
    currentState: AgentState.IDLE,
  };
}
```

### 6.3 Custom Tools via MCP Server

The Claude Agent SDK uses MCP (Model Context Protocol) servers for custom tools. Orion defines its tools as an **in-process SDK MCP server** using the `tool()` function with Zod schemas.

> **Note:** The SDK has built-in tools (Read, Write, Edit, Bash, Glob, Grep, etc.) that require no configuration. This section covers Orion-specific custom tools.

#### 6.3.1 MCP Tool Naming Convention

MCP tools follow the pattern: `mcp__<server-name>__<tool-name>`

Example: `mcp__orion__para_search`, `mcp__composio__gmail_send_email`

#### 6.3.2 Orion Custom Tools Definition

```typescript
// agent-server/src/tools/orion-tools.ts

import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { db } from '@/lib/db';

// ============================================================================
// PARA Search Tool
// ============================================================================

const paraSearch = tool(
  'para_search',
  'Search across Projects, Areas, Resources, and Archives using semantic or keyword search',
  {
    query: z.string().describe('Search query (natural language or keywords)'),
    categories: z.array(z.enum(['projects', 'areas', 'resources', 'archives']))
      .optional()
      .describe('Which PARA categories to search (defaults to all)'),
    limit: z.number().optional().default(10).describe('Maximum results to return'),
  },
  async ({ query, categories, limit }) => {
    const results = await db.search.para(query, { categories, limit });
    return {
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }]
    };
  }
);

// ============================================================================
// Contact Operations
// ============================================================================

const contactLookup = tool(
  'contact_lookup',
  'Find contacts by name, company, relationship, or semantic query',
  {
    query: z.string().describe('Search query'),
    relationship: z.enum(['friend', 'family', 'colleague', 'vendor', 'client']).optional(),
    organization: z.string().optional().describe('Filter by company name'),
  },
  async ({ query, relationship, organization }) => {
    const contacts = await db.contacts.search(query, { relationship, organization });
    return {
      content: [{ type: 'text', text: JSON.stringify(contacts, null, 2) }]
    };
  }
);

const contactCreate = tool(
  'contact_create',
  'Create a new contact in the local database',
  {
    name: z.string().describe('Contact full name'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    organization: z.string().optional(),
    job_title: z.string().optional(),
    relationship: z.enum(['friend', 'family', 'colleague', 'vendor', 'client']).optional(),
    notes: z.string().optional(),
  },
  async (data) => {
    const contact = await db.contacts.create(data);
    return {
      content: [{ type: 'text', text: `Created contact: ${contact.id} - ${contact.name}` }]
    };
  }
);

// ============================================================================
// Task Operations
// ============================================================================

const taskCreate = tool(
  'task_create',
  'Create a new task, optionally linked to a project or area',
  {
    title: z.string().describe('Task title'),
    description: z.string().optional(),
    project_id: z.string().optional().describe('Link to project (proj_xxx format)'),
    area_id: z.string().optional().describe('Link to area (area_xxx format)'),
    due_date: z.string().optional().describe('ISO date string'),
    priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
    assigned_to: z.string().optional().describe('Contact ID to assign'),
  },
  async (data) => {
    const task = await db.tasks.create(data);
    return {
      content: [{ type: 'text', text: `Created task: ${task.id} - ${task.title}` }]
    };
  }
);

// ============================================================================
// Preference Learning
// ============================================================================

const preferenceLearn = tool(
  'preference_learn',
  'Store a learned user preference or pattern for future reference',
  {
    category: z.string().describe('Preference category (e.g., communication, calendar)'),
    key: z.string().describe('Preference key (e.g., email_signature, meeting_length)'),
    value: z.string().describe('Preference value'),
    context: z.string().optional().describe('When this preference applies'),
    confidence: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  },
  async (data) => {
    const pref = await db.preferences.upsert(data);
    return {
      content: [{ type: 'text', text: `Learned preference: ${data.category}.${data.key}` }]
    };
  }
);

// ============================================================================
// Memory Operations (PostgreSQL shared memory)
// ============================================================================

const memoryRecall = tool(
  'memory_recall',
  'Search semantic memory for relevant past learnings across sessions',
  {
    query: z.string().describe('Search query'),
    limit: z.number().optional().default(5),
    types: z.array(z.string()).optional().describe('Filter by memory types'),
  },
  async ({ query, limit, types }) => {
    const memories = await recallLearnings(query, { k: limit, types });
    return {
      content: [{ type: 'text', text: JSON.stringify(memories, null, 2) }]
    };
  }
);

const memoryStore = tool(
  'memory_store',
  'Store a new learning in semantic memory for future sessions',
  {
    content: z.string().describe('What was learned'),
    type: z.enum(['CONTACT_INFO', 'USER_PREFERENCE', 'DECISION_RECORD', 'WORKING_SOLUTION']),
    context: z.string().optional().describe('Context for this learning'),
    tags: z.array(z.string()).optional(),
  },
  async (data) => {
    const id = await storeLearning(data);
    return {
      content: [{ type: 'text', text: `Stored learning: ${id}` }]
    };
  }
);

// ============================================================================
// Export as MCP Server
// ============================================================================

export const orionMcpServer = createSdkMcpServer({
  name: 'orion',
  tools: [
    paraSearch,
    contactLookup,
    contactCreate,
    taskCreate,
    preferenceLearn,
    memoryRecall,
    memoryStore,
  ],
});
```

#### 6.3.3 Tool Access Patterns

| Tool Category | Access Pattern | Notes |
|---------------|----------------|-------|
| Built-in tools | `allowedTools: ['Read', 'Edit', 'Bash']` | No prefix needed |
| Orion tools | `allowedTools: ['mcp__orion__*']` | Wildcard for all |
| Composio tools | `allowedTools: ['mcp__composio__gmail_*']` | Per-service wildcards |
| Specific MCP tool | `allowedTools: ['mcp__orion__para_search']` | Exact tool name |

### 6.4 Structured Output Schemas

```typescript
// src/agents/schemas.ts

import { z } from 'zod';

// ============================================================================
// Triage Result Schema
// ============================================================================

export const TriageResultSchema = z.object({
  item_id: z.string(),
  priority_score: z.number().min(0).max(1),
  priority_band: z.enum(['high', 'medium', 'low', 'minimal']),
  priority_reasoning: z.string(),
  
  // Entity links
  from_contact_id: z.string().optional(),
  from_contact_confidence: z.enum(['high', 'medium', 'low']),
  related_project_id: z.string().optional(),
  related_project_confidence: z.enum(['high', 'medium', 'low']),
  related_area: z.string().optional(),
  
  // Actions
  detected_actions: z.array(z.object({
    action: z.string(),
    type: z.enum(['task', 'reply', 'calendar', 'delegate']),
    suggested_due: z.string().optional(),
    suggested_project: z.string().optional(),
    confidence: z.number(),
  })),
  
  // Filing
  suggested_filing: z.object({
    location: z.string(),
    reasoning: z.string(),
  }),
  
  // Response
  needs_response: z.boolean(),
  response_urgency: z.enum(['immediate', 'today', 'this_week', 'whenever']).optional(),
  suggested_response_type: z.enum(['reply', 'forward', 'delegate', 'schedule_call']).optional(),
  suggested_response_outline: z.string().optional(),
  
  // Metadata
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  urgency_signals: z.array(z.string()),
  category: z.string(),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

// ============================================================================
// Schedule Request Schema
// ============================================================================

export const ScheduleRequestSchema = z.object({
  title: z.string(),
  participants: z.array(z.object({
    contact_id: z.string(),
    email: z.string(),
    role: z.enum(['required', 'optional']),
  })),
  duration_minutes: z.number(),
  preferred_times: z.array(z.object({
    start: z.string(),
    end: z.string(),
    preference_score: z.number(),
  })),
  location_type: z.enum(['video', 'phone', 'in_person']),
  video_link: z.string().optional(),
  related_project: z.string().optional(),
  notes: z.string().optional(),
});

export type ScheduleRequest = z.infer<typeof ScheduleRequestSchema>;

// ============================================================================
// Email Draft Schema
// ============================================================================

export const EmailDraftSchema = z.object({
  to: z.array(z.string()),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  subject: z.string(),
  body: z.string(),
  reply_to_id: z.string().optional(),
  tone: z.enum(['formal', 'professional', 'casual', 'friendly']),
  intent: z.enum(['request', 'response', 'follow_up', 'introduction', 'thank_you']),
  attachments: z.array(z.object({
    name: z.string(),
    path: z.string(),
  })).optional(),
});

export type EmailDraft = z.infer<typeof EmailDraftSchema>;

// ============================================================================
// Contact Extraction Schema
// ============================================================================

export const ExtractedContactSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  job_title: z.string().optional(),
  relationship: z.enum(['friend', 'family', 'colleague', 'vendor', 'client']).optional(),
  source: z.string(),
  confidence: z.number(),
});

export type ExtractedContact = z.infer<typeof ExtractedContactSchema>;
```

### 6.5 Structured Outputs - When to Use Direct API

> **Important:** This section uses the **Direct Claude API** (`@anthropic-ai/sdk`), NOT the Agent SDK. Use this pattern for batch processing where you don't need the agent's tool loop.

**When to use Direct API with Structured Outputs:**

| Use Case | Why Direct API |
|----------|---------------|
| Batch triage (many items) | No tool calls needed, just structured analysis |
| Simple classification | Single-shot, no multi-turn conversation |
| Data extraction | Schema-validated output, no agent autonomy needed |

```typescript
// src/agents/batch-triage.ts
// NOTE: This uses Direct API for batch processing, NOT the Agent SDK

import Anthropic from '@anthropic-ai/sdk';
import { TriageResultSchema, type TriageResult } from './schemas';

const client = new Anthropic();

/**
 * Batch triage using Direct Claude API
 * Use for processing multiple inbox items without interactive tools
 */
export async function triageInboxItem(
  item: InboxItem,
  context: AgentContext,
): Promise<TriageResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20251101',  // Update to latest available model ID
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Analyze this inbox item and provide triage results.

ITEM:
Source: ${item.source_tool}
From: ${item.from_name} <${item.from_email}>
Subject: ${item.title}
Content: ${item.full_content}

CONTEXT:
Active Projects: ${context.activeProject?.name || 'None'}
Known Contacts: ${context.relevantContacts?.map(c => c.name).join(', ') || 'None'}

Return a structured triage result.`,
      },
    ],
    // Use structured outputs (no beta header needed in 2026)
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'triage_result',
        schema: TriageResultSchema,
        strict: true,
      },
    },
    // Extended thinking (no beta header needed in 2026)
    thinking: {
      type: 'enabled',
      budget_tokens: 5000,
    },
  });

  // Parse validated response
  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return JSON.parse(textBlock.text) as TriageResult;
}

/**
 * For interactive triage with tool use, use the Agent SDK instead:
 *
 * for await (const msg of query({
 *   prompt: "Triage this email and suggest actions",
 *   options: {
 *     allowedTools: ['mcp__orion__para_search', 'mcp__orion__contact_lookup'],
 *     outputFormat: { type: 'json_schema', schema: TriageResultSchema }
 *   }
 * })) { ... }
 */
```

### 6.6 Claude Agent SDK Built-in Tools

The Claude Agent SDK provides powerful built-in tools that Orion leverages for desktop automation.

#### 6.6.1 Bash Tool

Execute shell commands in a persistent bash session:

```typescript
// agent-server/src/config.ts

import { ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';

export const agentConfig: ClaudeAgentOptions = {
  model: 'claude-sonnet-4-5',
  tools: [
    // Built-in Bash tool (schema-less)
    { type: 'bash_20250124', name: 'bash' },
  ],
};
```

**Capabilities:**
- Persistent session state between commands
- Full macOS terminal access (with user permissions)
- Script execution, package management, git operations

#### 6.6.2 Text Editor Tool

File operations for reading, creating, and editing files:

```typescript
export const agentConfig: ClaudeAgentOptions = {
  model: 'claude-sonnet-4-5',
  tools: [
    { type: 'bash_20250124', name: 'bash' },
    {
      type: 'text_editor_20250728',
      name: 'str_replace_based_edit_tool',
      max_characters: 50000,  // Truncation limit for large files
    },
  ],
};
```

**Available Commands:**
- `view` - View file contents
- `create` - Create new files
- `str_replace` - Replace text in files
- `insert` - Insert text into files
- `undo_edit` - Undo previous edits

#### 6.6.3 Computer Use Tool (Future)

For autonomous desktop interaction (currently in beta):

```typescript
// Future: Computer Use for GUI automation
export const computerUseConfig = {
  type: 'computer_20251124',
  name: 'computer',
  display_width_px: 1920,
  display_height_px: 1080,
};

// Requires beta header
// "anthropic-beta": "computer-use-2025-11-24"
```

**Actions:** `screenshot`, `left_click`, `type`, `key`, `mouse_move`, `scroll`, `double_click`, `wait`

**Note:** Computer Use is marked for post-MVP consideration due to beta status.

### 6.7 MCP Server Configuration

Orion uses three types of MCP servers:

1. **SDK MCP Server (in-process)** - Orion's custom tools (Section 6.3)
2. **HTTP/SSE Servers (remote)** - Composio for external integrations
3. **stdio Servers (local process)** - Optional additional tools

#### 6.7.1 Complete Agent Configuration

```typescript
// agent-server/src/config.ts

import { query, ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import { orionMcpServer } from './tools/orion-tools';

// MCP server configurations
const mcpServers = {
  // Orion custom tools (in-process SDK server)
  orion: orionMcpServer,

  // Composio for Gmail, Calendar, Slack (HTTP)
  composio: {
    type: 'http' as const,
    url: process.env.COMPOSIO_MCP_URL!,
    headers: {
      'X-API-Key': process.env.COMPOSIO_API_KEY!,
    },
  },

  // Optional: Local filesystem (stdio - only if needed beyond built-in Read/Write)
  // filesystem: {
  //   type: 'stdio' as const,
  //   command: 'npx',
  //   args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users'],
  // },
};

// Tool permission configuration
const allowedTools = [
  // Built-in SDK tools
  'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
  'Task',  // Required for subagents
  'AskUserQuestion',
  'TodoWrite',

  // Orion custom tools (all)
  'mcp__orion__*',

  // Composio tools (granular control)
  'mcp__composio__gmail_list_emails',
  'mcp__composio__gmail_send_email',
  'mcp__composio__gmail_create_draft',
  'mcp__composio__googlecalendar_list_events',
  'mcp__composio__googlecalendar_create_event',
  'mcp__composio__slack_send_message',
  'mcp__composio__slack_list_channels',
];

// Main agent options
export const butlerAgentOptions: Partial<ClaudeAgentOptions> = {
  model: 'claude-sonnet-4-5',
  mcpServers,
  allowedTools,
  permissionMode: 'default',  // Prompt for destructive operations
  maxThinkingTokens: 8000,    // Extended thinking for complex tasks
};

// Usage
export async function queryButler(prompt: string, sessionId?: string) {
  const options: ClaudeAgentOptions = {
    ...butlerAgentOptions,
    ...(sessionId && { resume: sessionId }),
  };

  for await (const message of query({ prompt, options })) {
    // Handle streaming messages
    yield message;
  }
}
```

#### 6.7.2 MCP Transport Types

| Type | Use Case | Configuration |
|------|----------|---------------|
| **SDK** | In-process custom tools | `createSdkMcpServer({ tools: [...] })` |
| **HTTP/SSE** | Cloud services (Composio) | `{ type: 'http', url: '...', headers: {...} }` |
| **stdio** | Local CLI tools | `{ type: 'stdio', command: 'npx', args: [...] }` |

#### 6.7.3 .mcp.json File Configuration

MCP servers can also be configured via file (auto-loaded by SDK):

```json
{
  "mcpServers": {
    "composio": {
      "type": "http",
      "url": "${COMPOSIO_MCP_URL}",
      "headers": {
        "X-API-Key": "${COMPOSIO_API_KEY}"
      }
    }
  }
}
```

### 6.9 Prompt Caching (Cost Optimization)

Use prompt caching to reduce costs for repeated context (system prompts, PARA data):

```typescript
// src/agents/butler.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function queryButler(userMessage: string, context: AgentContext) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: BUTLER_SYSTEM_PROMPT,  // ~2000 tokens
        cache_control: { type: 'ephemeral' },  // Cache for 5 min
      },
      {
        type: 'text',
        text: formatPARAContext(context),  // User's PARA data
        cache_control: { type: 'ephemeral', ttl: 3600 },  // Cache for 1 hour
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  return response;
}
```

**Caching Strategy:**

| Content | TTL | Rationale |
|---------|-----|-----------|
| System prompt | 5 min (default) | Rarely changes, frequently used |
| PARA context | 1 hour | Changes infrequently during session |
| User preferences | 1 hour | Stable within session |
| Recent messages | No cache | Changes every turn |

**Minimum Token Requirements:**

| Model | Min Cacheable Tokens |
|-------|---------------------|
| Claude Sonnet 4.5 | 1,024 |
| Claude Opus 4.5 | 4,096 |
| Claude Haiku 4.5 | 4,096 |

**Cost Impact:**
- Cache writes: 25% premium on first use
- Cache reads: 90% discount on subsequent uses
- Net savings: 50-80% for typical butler conversations

### 6.10 Extended Thinking

For complex reasoning tasks, enable extended thinking to improve Claude's problem-solving capabilities.

#### 6.8.1 When to Use Extended Thinking

| Use Extended Thinking | Skip Extended Thinking |
|-----------------------|-----------------------|
| Complex scheduling conflicts | Simple "what's next?" queries |
| Multi-step task planning | Quick lookups |
| Analyzing email threads for priorities | Single email summaries |
| Financial/budget reasoning | Basic PARA searches |
| Debugging/troubleshooting workflows | Status updates |

#### 6.8.2 Basic Implementation

```typescript
// src/agents/butler-thinking.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function queryWithThinking(
  userMessage: string,
  context: AgentContext,
  thinkingBudget: number = 5000,  // Tokens for reasoning
): Promise<{ thinking: string; response: string }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: thinkingBudget,  // Min: 1,024 tokens
    },
    system: BUTLER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  // Parse thinking and text blocks from response
  let thinking = '';
  let text = '';

  for (const block of response.content) {
    if (block.type === 'thinking') {
      thinking = block.thinking;
    } else if (block.type === 'text') {
      text = block.text;
    }
  }

  return { thinking, response: text };
}
```

#### 6.8.3 Streaming Extended Thinking

For real-time UI feedback during complex reasoning:

```typescript
// src/agents/butler-thinking-stream.ts

export async function* streamWithThinking(
  userMessage: string,
  thinkingBudget: number = 5000,
): AsyncGenerator<ThinkingStreamEvent> {
  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: thinkingBudget,
    },
    messages: [{ role: 'user', content: userMessage }],
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      if (event.delta.type === 'thinking_delta') {
        // Stream thinking to UI (show "Claude is reasoning...")
        yield {
          type: 'thinking',
          content: event.delta.thinking,
        };
      } else if (event.delta.type === 'text_delta') {
        // Stream final response
        yield {
          type: 'response',
          content: event.delta.text,
        };
      }
    }
  }
}

// Type definitions
interface ThinkingStreamEvent {
  type: 'thinking' | 'response';
  content: string;
}
```

#### 6.8.4 Adaptive Thinking Budget

Dynamically adjust thinking budget based on task complexity:

```typescript
// src/agents/thinking-budget.ts

export function calculateThinkingBudget(
  taskType: TaskType,
  messageLength: number,
): number {
  const baseBudgets: Record<TaskType, number> = {
    simple_query: 0,           // No extended thinking
    inbox_triage: 2000,        // Light reasoning
    scheduling: 5000,          // Medium reasoning
    multi_step_planning: 10000, // Heavy reasoning
    complex_analysis: 15000,   // Maximum reasoning
  };

  const base = baseBudgets[taskType] || 2000;

  // Scale up for longer messages (more context to reason about)
  const lengthMultiplier = Math.min(1 + (messageLength / 1000) * 0.1, 1.5);

  return Math.max(1024, Math.floor(base * lengthMultiplier));
}

export type TaskType =
  | 'simple_query'
  | 'inbox_triage'
  | 'scheduling'
  | 'multi_step_planning'
  | 'complex_analysis';
```

#### 6.8.5 UI Integration

Show thinking status in the chat interface:

```typescript
// src/components/chat/ThinkingIndicator.tsx

interface ThinkingIndicatorProps {
  isThinking: boolean;
  thinkingContent?: string;
  showDetails?: boolean;
}

export function ThinkingIndicator({
  isThinking,
  thinkingContent,
  showDetails = false,
}: ThinkingIndicatorProps) {
  if (!isThinking) return null;

  return (
    <div className="thinking-indicator">
      <div className="thinking-pulse" />
      <span className="thinking-label">Reasoning...</span>
      {showDetails && thinkingContent && (
        <details className="thinking-details">
          <summary>View reasoning</summary>
          <pre>{thinkingContent}</pre>
        </details>
      )}
    </div>
  );
}
```

**Important Guidelines:**
- **Minimum budget:** 1,024 tokens (API requirement)
- **Don't feed thinking back:** Never include `thinking` output in subsequent prompts
- **Use high-level instructions:** Let Claude determine its reasoning approach
- **Cost awareness:** Extended thinking tokens are billed; budget accordingly

### 6.11 Hooks System

The Claude Agent SDK provides hooks to intercept and modify agent behavior at key execution points.

#### 6.11.1 Available Hook Events

| Hook Event | When Triggered | Common Uses |
|------------|----------------|-------------|
| **PreToolUse** | Before any tool executes | Block dangerous ops, validate inputs, modify args |
| **PostToolUse** | After tool completes | Logging, audit trails, result transformation |
| **PostToolUseFailure** | Tool execution fails | Error handling, retry logic |
| **UserPromptSubmit** | User submits prompt | Inject context, validate input |
| **Stop** | Agent stops | Save state, cleanup resources |
| **SubagentStart** | Subagent spawns | Track delegation, resource limits |
| **SubagentStop** | Subagent completes | Aggregate results |
| **PermissionRequest** | Permission needed | Custom approval flow |
| **SessionStart** | Session begins | Initialize logging, load preferences |
| **SessionEnd** | Session ends | Cleanup, save learnings |
| **Notification** | Status updates | External alerts (Slack, etc.) |

#### 6.11.2 Hook Configuration

```typescript
// agent-server/src/hooks/index.ts

import { HookCallback, HookJSONOutput } from '@anthropic-ai/claude-agent-sdk';

// Protect sensitive files from modification
const protectSensitiveFiles: HookCallback = async (input, toolUseId) => {
  const filePath = input.file_path || input.path;
  const sensitivePatterns = ['.env', 'credentials', 'secrets', '.pem', '.key'];

  if (filePath && sensitivePatterns.some(p => filePath.includes(p))) {
    return {
      continue: false,
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Cannot modify sensitive file: ${filePath}`,
      },
    };
  }

  return { continue: true };
};

// Audit all tool calls
const auditLogger: HookCallback = async (input, toolUseId) => {
  console.log(`[AUDIT] Tool: ${input.tool_name}, ID: ${toolUseId}`, input);
  await db.auditLog.create({
    tool_name: input.tool_name,
    tool_use_id: toolUseId,
    input: JSON.stringify(input),
    timestamp: new Date().toISOString(),
  });
  return { continue: true };
};

// Inject user context on session start
const loadUserContext: HookCallback = async (input, toolUseId) => {
  const preferences = await db.preferences.list();
  const recentProjects = await db.projects.list({ status: 'active', limit: 5 });

  return {
    continue: true,
    systemMessage: `
User Preferences:
${preferences.map(p => `- ${p.category}.${p.key}: ${p.value}`).join('\n')}

Active Projects:
${recentProjects.map(p => `- ${p.name} (${p.status})`).join('\n')}
    `.trim(),
  };
};

// Export hook configuration
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
  PostToolUse: [
    {
      matcher: 'mcp__composio__*',
      hooks: [trackExternalToolUsage],
    },
  ],
};
```

#### 6.11.3 Hook Output Structure

```typescript
interface HookJSONOutput {
  continue?: boolean;                    // Keep running (default: true)
  stopReason?: string;                   // Reason if stopping
  suppressOutput?: boolean;              // Hide from transcript
  systemMessage?: string;                // Inject into conversation

  hookSpecificOutput?: {
    hookEventName: string;
    permissionDecision?: 'allow' | 'deny' | 'ask';
    permissionDecisionReason?: string;
    updatedInput?: Record<string, unknown>;  // Modify tool input
    additionalContext?: string;
  };
}
```

### 6.12 Subagents Architecture

Subagents are specialized agents that the main Butler agent can delegate tasks to. They provide context isolation, parallel execution, and focused expertise.

#### 6.12.1 Orion Subagent Definitions

```typescript
// agent-server/src/agents/subagents.ts

import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

export const orionSubagents: Record<string, AgentDefinition> = {
  // Triage Agent - Inbox processing
  'triage': {
    description: 'Analyze inbox items for priority, extract actions, and suggest filing. Use for email/message triage tasks.',
    prompt: `You are a triage specialist for a busy knowledge worker.

Your job is to analyze inbox items and provide:
1. Priority score (0-1) with reasoning
2. Detected action items (tasks, replies needed, calendar events)
3. Entity linking (related contacts, projects, areas)
4. Filing suggestions (which PARA category)

Be thorough but concise. Focus on actionable insights.`,
    tools: ['Read', 'mcp__orion__para_search', 'mcp__orion__contact_lookup'],
    model: 'sonnet',  // Fast for high-volume triage
  },

  // Scheduler Agent - Calendar management
  'scheduler': {
    description: 'Manage calendar, find meeting times, resolve conflicts. Use for scheduling tasks.',
    prompt: `You are a calendar management specialist.

Your job is to:
1. Find optimal meeting times considering all participants
2. Resolve scheduling conflicts
3. Suggest meeting durations based on context
4. Handle timezone conversions

Always check existing calendar before proposing times.
Respect user preferences for meeting times and buffer periods.`,
    tools: [
      'mcp__composio__googlecalendar_list_events',
      'mcp__composio__googlecalendar_create_event',
      'mcp__composio__googlecalendar_find_free_slots',
      'mcp__orion__contact_lookup',
      'mcp__orion__preference_learn',
    ],
  },

  // Communicator Agent - Email/message drafting
  'communicator': {
    description: 'Draft emails and messages matching user tone and context. Use for communication tasks.',
    prompt: `You are a communication specialist who drafts emails and messages.

Your job is to:
1. Draft messages matching the user's tone and style
2. Consider relationship context (formal for new contacts, casual for friends)
3. Include relevant context from PARA system
4. Suggest appropriate sign-offs and follow-up timing

Review past communications to match style. Ask for clarification if tone is unclear.`,
    tools: [
      'mcp__composio__gmail_create_draft',
      'mcp__composio__gmail_list_emails',
      'mcp__composio__slack_send_message',
      'mcp__orion__contact_lookup',
      'mcp__orion__para_search',
      'mcp__orion__memory_recall',
    ],
  },

  // Navigator Agent - PARA search and organization
  'navigator': {
    description: 'Search and organize across Projects, Areas, Resources, Archives. Use for finding information.',
    prompt: `You are a PARA system navigator and organizer.

Your job is to:
1. Search across all PARA categories effectively
2. Find connections between entities (contacts → projects → tasks)
3. Suggest organization improvements
4. Help maintain the PARA structure

Use semantic search for fuzzy queries, exact search for specific items.`,
    tools: [
      'Read', 'Glob', 'Grep',
      'mcp__orion__para_search',
      'mcp__orion__contact_lookup',
      'mcp__orion__memory_recall',
    ],
  },

  // Preference Learner - Pattern detection
  'preference-learner': {
    description: 'Detect user patterns and learn preferences from interactions. Use for improving personalization.',
    prompt: `You are a pattern detection specialist.

Your job is to:
1. Observe user choices and corrections
2. Identify recurring patterns (preferred meeting times, communication styles)
3. Store learned preferences with appropriate confidence levels
4. Suggest preference-based improvements

Only store preferences with clear evidence. Mark confidence appropriately.`,
    tools: [
      'mcp__orion__preference_learn',
      'mcp__orion__memory_store',
      'mcp__orion__memory_recall',
    ],
    model: 'haiku',  // Lightweight for background learning
  },
};
```

#### 6.12.2 Subagent Invocation Patterns

| Invocation | Pattern | When Used |
|------------|---------|-----------|
| **Automatic** | Claude decides based on `description` | Default behavior |
| **Explicit** | "Use the scheduler agent to find a time" | Guaranteed delegation |
| **Parallel** | Multiple Task tool calls in one turn | Independent tasks |

#### 6.12.3 Using Subagents in Butler

```typescript
// agent-server/src/butler.ts

import { query, ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import { orionSubagents } from './agents/subagents';
import { orionMcpServer } from './tools/orion-tools';
import { orionHooks } from './hooks';

export const butlerOptions: ClaudeAgentOptions = {
  model: 'claude-sonnet-4-5',
  systemPrompt: BUTLER_SYSTEM_PROMPT,

  // MCP servers
  mcpServers: {
    orion: orionMcpServer,
    composio: composioConfig,
  },

  // Subagents (Task tool required in allowedTools)
  agents: orionSubagents,

  // Tools available to main Butler agent
  allowedTools: [
    'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
    'Task',  // Required for subagent delegation
    'AskUserQuestion',
    'TodoWrite',
    'mcp__orion__*',
    'mcp__composio__gmail_*',
    'mcp__composio__googlecalendar_*',
    'mcp__composio__slack_*',
  ],

  // Hooks
  hooks: orionHooks,

  // Permissions
  permissionMode: 'default',
};

// Stream Butler responses
export async function* queryButler(prompt: string, sessionId?: string) {
  const options = {
    ...butlerOptions,
    ...(sessionId && { resume: sessionId }),
  };

  for await (const message of query({ prompt, options })) {
    // Track subagent invocations
    if (message.type === 'assistant') {
      for (const block of message.content || []) {
        if (block.type === 'tool_use' && block.name === 'Task') {
          console.log(`Delegating to subagent: ${block.input.subagent_type}`);
        }
      }
    }

    yield message;
  }
}
```

#### 6.12.4 Subagent Constraints

| Constraint | Reason |
|------------|--------|
| Cannot spawn sub-subagents | Prevent infinite delegation |
| Tool access is restricted | Each subagent only gets listed tools |
| Separate context window | Isolation from main conversation |
| Results return to parent | Main agent synthesizes |

### 6.13 Skills System

> **[NOT STARTED]** - The `.claude/skills/` directory currently contains inherited skills from the parent project (development/workflow skills), not the 8 Orion-specific skills described below. Orion skills (briefing, inbox-process, etc.) will be implemented in Epic 2.

Skills are the backbone of Orion's domain-specific capabilities. They provide **organized folders of instructions, scripts, and resources** that the Butler agent loads dynamically to perform specialized tasks.

#### 6.13.1 Skills vs Other Concepts

| Feature | Skills | Tools | Hooks | Subagents |
|---------|--------|-------|-------|-----------|
| **Purpose** | Domain knowledge & workflows | Capabilities (actions) | Event interception | Isolated contexts |
| **Invocation** | Slash commands or auto-match | API calls | Event-driven | Task tool delegation |
| **State** | Stateless (prompt injection) | Stateless | Stateless | Own context window |
| **Token Cost** | Progressive disclosure | Per-call overhead | Minimal | Full context |
| **Examples** | `/briefing`, `/inbox-process` | Read, Write, Bash | PreToolUse | triage, scheduler |

#### 6.13.2 Progressive Disclosure Architecture

Skills use a three-level architecture to minimize token usage:

| Level | Content | Token Budget | When Loaded |
|-------|---------|--------------|-------------|
| **1. Metadata** | Name + description | ~100 tokens | Always scanned for matching |
| **2. Instructions** | Full SKILL.md content | <5,000 tokens | When skill triggers |
| **3. Resources** | `references/`, `scripts/` | Variable | On-demand during execution |

#### 6.13.3 SKILL.md File Structure

```yaml
---
# === Required Fields ===
name: briefing                          # Max 64 chars, kebab-case
description: |                          # Max 1024 chars - triggers auto-match
  Generate morning briefing with email summary, calendar overview,
  and priority tasks. Triggered by "morning briefing", "daily summary",
  or "what's on my plate".

# === Optional Fields ===
version: 1.0.0                          # Semantic versioning
model: claude-opus-4-5-20251101         # Override default model
allowed-tools: "Read, Glob, mcp__composio__gmail_*"  # Restrict tools
mode: true                              # Create /briefing mode command
disable-model-invocation: true          # Require explicit /skill
show-in-menu: true                      # Show in slash command menu
---

# Morning Briefing Skill

You are generating a comprehensive morning briefing for the user.

## Process

1. **Email Summary**
   - Fetch unread emails from last 24 hours
   - Categorize by urgency (urgent, action-needed, FYI)
   - Extract key action items

2. **Calendar Overview**
   - List today's meetings with attendees and context
   - Highlight any conflicts or back-to-back meetings
   - Note preparation needed for important meetings

3. **Priority Tasks**
   - Pull from active projects
   - Identify deadlines within 48 hours
   - Suggest focus order based on urgency and importance

## Output Format

Deliver as a conversational briefing, not a list. Start with the most
important item that needs attention. Use the user's preferred tone
(learn from preferences).

## Available Context

- User preferences via `mcp__orion__preferences_get`
- Recent meeting notes via `mcp__orion__memory_recall`
- Contact relationships via `mcp__orion__contact_lookup`
```

#### 6.13.4 Skill Directory Structure

```
.claude/skills/
├── briefing/
│   ├── SKILL.md              # Required - core instructions
│   ├── scripts/              # Optional - executables
│   │   └── fetch-calendar.sh # Only OUTPUT enters context (not code)
│   ├── references/           # Optional - on-demand docs
│   │   ├── email-templates.md
│   │   └── priority-framework.md
│   └── assets/               # Optional - templates, fonts
│       └── briefing-template.html
│
├── inbox-process/
│   ├── SKILL.md
│   └── references/
│       └── triage-rules.md
│
├── meeting-prep/
│   ├── SKILL.md
│   └── scripts/
│       └── fetch-attendee-context.py
│
├── draft-email/
│   └── SKILL.md
│
└── project-status/
    ├── SKILL.md
    └── references/
        └── status-format.md
```

#### 6.13.5 Skill Invocation Methods

| Method | Syntax | Description |
|--------|--------|-------------|
| **Slash command** | `/briefing` | Explicit user trigger |
| **Model-invoked** | (automatic) | Claude matches description to user intent |
| **Mode command** | `/briefing` then chat | Persistent skill context for multi-turn |
| **Programmatic** | `Skill` tool | From code or other agents |

**Model-Invoked Example:**

```
User: "What's on my plate today?"
         ↓
Claude scans skill descriptions
         ↓
Matches "briefing" skill: "...what's on my plate..."
         ↓
Loads SKILL.md instructions
         ↓
Executes with full skill context
```

#### 6.13.6 Orion Skill Catalog

| Skill | Purpose | Trigger Patterns | Key Tools |
|-------|---------|------------------|-----------|
| **briefing** | Morning summary | "morning briefing", "daily summary", "what's on my plate" | gmail, calendar, para_search |
| **inbox-process** | Triage inbox | "process inbox", "triage emails", "clear inbox" | gmail, triage subagent |
| **meeting-prep** | Pre-meeting context | "prep for [meeting]", "meeting context" | calendar, contact_lookup, memory |
| **draft-email** | Compose messages | "draft email to", "write response" | gmail, contact_lookup, memory |
| **project-status** | Project overview | "project status", "how's [project] going" | para_search, memory |
| **weekly-review** | GTD weekly review | "weekly review", "review week" | para_search, calendar, memory |
| **contact-brief** | Person context | "who is [name]", "tell me about [name]" | contact_lookup, memory, gmail |
| **schedule-meeting** | Find meeting times | "schedule meeting with", "find time" | calendar, scheduler subagent |

#### 6.13.7 Skill + Subagent Integration

Skills can delegate to subagents for specialized tasks:

```yaml
---
name: inbox-process
description: Process and triage inbox items using AI analysis
---

# Inbox Processing Skill

## Workflow

1. Fetch unread emails using `mcp__composio__gmail_list_emails`
2. **Delegate to triage subagent** for each batch:
   - Use the Task tool with `subagent_type: triage`
   - Pass email batch for priority scoring
3. Aggregate triage results
4. Present summary with recommended actions
5. Wait for user decisions before archiving/acting

## Subagent Delegation

When processing more than 10 emails, delegate in batches:

"Use the triage agent to analyze these 10 emails and return
priority scores, action items, and filing suggestions."
```

#### 6.13.8 Skill + Hooks Integration

Skills can have associated hooks for validation:

```typescript
// agent-server/src/hooks/skill-hooks.ts

export const skillHooks = {
  PreToolUse: [
    {
      // Validate draft-email skill doesn't send without confirmation
      matcher: 'mcp__composio__gmail_send_email',
      hooks: [async (input) => {
        // Check if in draft-email skill context
        if (currentSkill === 'draft-email' && !input.confirmed) {
          return {
            continue: false,
            hookSpecificOutput: {
              hookEventName: 'PreToolUse',
              permissionDecision: 'ask',
              permissionDecisionReason: 'Confirm before sending email',
            },
          };
        }
        return { continue: true };
      }],
    },
  ],
};
```

#### 6.13.9 Skill Development Guidelines

**Token Budget:**
- SKILL.md body: <5,000 tokens (loaded on activation)
- References: Load only what's needed via explicit file reads
- Scripts: Only stdout enters context, not source code

**Description Quality:**
```yaml
# GOOD - Specific trigger patterns
description: |
  Generate morning briefing with email summary, calendar overview,
  and priority tasks. Triggered by "morning briefing", "daily summary",
  "what's on my plate", or "start my day".

# BAD - Too generic
description: Help with morning tasks
```

**Tool Restrictions:**
```yaml
# Restrict to only needed tools (security + focus)
allowed-tools: "Read, mcp__composio__gmail_*, mcp__orion__preferences_get"
```

**Model Selection:**
```yaml
# Use appropriate model for task complexity
model: claude-sonnet-4-5           # Fast for simple skills
model: claude-opus-4-5-20251101    # Complex reasoning skills
```

#### 6.13.10 File Structure Update

```
agent-server/
├── src/
│   ├── skills/               # Skill loader and registry
│   │   ├── index.ts          # Skill discovery and loading
│   │   ├── loader.ts         # SKILL.md parser
│   │   └── registry.ts       # Active skill tracking
│   └── ...
│
.claude/
├── skills/                   # Skill definitions
│   ├── briefing/
│   ├── inbox-process/
│   ├── meeting-prep/
│   ├── draft-email/
│   └── project-status/
└── ...
```

### 6.14 Dynamic Context Discovery

> **Source:** Research into Cursor IDE architecture (2026-01-20)

Rather than loading all context upfront (inbox, calendar, files), let the agent pull what it needs on demand. This is Cursor's key architectural pattern and dramatically improves token efficiency.

#### 6.14.1 Why Dynamic Discovery

| Approach | Token Cost | Problem |
|----------|------------|---------|
| **Static injection** | High | Load full inbox/calendar into every context |
| **Dynamic discovery** | Low | Agent requests only what's relevant |

Static injection wastes tokens on context the agent never uses. A morning briefing might need calendar data but not the full inbox. Let the agent decide.

#### 6.14.2 Implementation Pattern

```typescript
// WRONG: Static context injection
const systemPrompt = `
You are Orion Butler.

Here is the user's inbox:
${await fetchAllEmails()}  // 10,000+ tokens wasted if not needed

Here is their calendar:
${await fetchAllEvents()}  // More tokens wasted
`;

// RIGHT: Dynamic context discovery
const systemPrompt = `
You are Orion Butler.

You have access to tools for fetching email and calendar data.
Use mcp__composio__gmail_list_emails when you need inbox data.
Use mcp__composio__googlecalendar_list_events when you need calendar data.

Do NOT load everything upfront. Fetch only what's needed for the current task.
`;
```

#### 6.14.3 Partial File Reading

When the agent does fetch context, it should read partially:

| Resource | Default Limit | Use Case |
|----------|---------------|----------|
| Email body | First 500 chars | Quick triage, preview |
| Calendar events | Next 7 days | Scheduling context |
| File content | 250 lines | Code review, understanding |
| Search results | 100 lines | Finding relevant sections |

```typescript
// In SessionStart hook - inject pointers, not data
const injectContextPointers: HookCallback = async () => ({
  continue: true,
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: `
Available context (fetch on demand):
- Inbox: Use mcp__composio__gmail_list_emails (limit to 10-20 for triage)
- Calendar: Use mcp__composio__googlecalendar_list_events (default: next 7 days)
- Contacts: Use mcp__orion__contact_lookup (search by name/email)
- Projects: Use mcp__orion__para_search (search PARA system)

Fetch incrementally. Start with summaries, drill down only if needed.
`,
  },
});
```

#### 6.14.4 Benefits for Orion

| Benefit | Impact |
|---------|--------|
| Lower cost per query | Only fetch what's used |
| Faster initial response | No upfront data loading |
| Better context utilization | More room for actual conversation |
| Reduced compaction frequency | Less context to summarize |

---

## 7. Frontend Architecture

> **[NOT STARTED]** - `src/` directory was removed during restructure. Design mockups complete (32 pages in `/design-mockups/`).

### 7.1 Component Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home redirect
│   ├── (app)/                    # Main app routes
│   │   ├── layout.tsx            # App layout (sidebar + main)
│   │   ├── chat/
│   │   │   └── page.tsx          # Chat + Canvas view
│   │   ├── inbox/
│   │   │   └── page.tsx          # Inbox view
│   │   ├── calendar/
│   │   │   └── page.tsx          # Calendar view
│   │   ├── projects/
│   │   │   ├── page.tsx          # Projects list
│   │   │   └── [id]/page.tsx     # Project detail
│   │   ├── contacts/
│   │   │   └── page.tsx          # Contacts view
│   │   └── settings/
│   │       └── page.tsx          # Settings
│   └── (auth)/                   # Auth routes
│       ├── onboarding/
│       │   └── page.tsx          # Onboarding flow
│       └── login/
│           └── page.tsx          # Login (future)
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── chat/                     # Chat components
│   │   ├── ChatPanel.tsx         # Main chat panel
│   │   ├── MessageList.tsx       # Message history
│   │   ├── MessageBubble.tsx     # Individual message
│   │   ├── ChatInput.tsx         # Input with commands
│   │   ├── ToolCallCard.tsx      # Tool execution display
│   │   ├── ThinkingIndicator.tsx # Loading state
│   │   └── StreamingText.tsx     # Typewriter effect
│   │
│   ├── canvas/                   # Canvas components
│   │   ├── Canvas.tsx            # Main canvas panel
│   │   ├── JsonRenderCanvas.tsx  # json-render protocol renderer
│   │   ├── EmailComposer.tsx     # Email editing (TipTap for body)
│   │   ├── CalendarView.tsx      # Calendar display
│   │   ├── MeetingScheduler.tsx  # Time slot picker
│   │   ├── ContactCard.tsx       # Contact details
│   │   └── TaskList.tsx          # Task management
│   │
│   ├── inbox/                    # Inbox components
│   │   ├── InboxList.tsx         # Item list
│   │   ├── InboxItem.tsx         # Single item
│   │   ├── PriorityBadge.tsx     # Priority indicator
│   │   ├── ActionBar.tsx         # Bulk actions
│   │   └── FilterBar.tsx         # Filters
│   │
│   ├── projects/                 # Project components
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── TaskBoard.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── Header.tsx            # Top header
│   │   ├── SplitPane.tsx         # Resizable panels
│   │   └── StatusBar.tsx         # Bottom status
│   │
│   └── shared/                   # Shared components
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
│
├── hooks/                        # React hooks
│   ├── useAgent.ts               # Agent interaction
│   ├── useChat.ts                # Chat state
│   ├── useInbox.ts               # Inbox data
│   ├── useProjects.ts            # Projects data
│   ├── useContacts.ts            # Contacts data
│   ├── useToolConnections.ts     # Tool status
│   └── usePreferences.ts         # User preferences
│
├── lib/                          # Utilities
│   ├── tauri.ts                  # Tauri API bindings
│   ├── db.ts                     # Database helpers
│   ├── composio.ts               # Composio client
│   ├── json-render/              # json-render integration
│   │   ├── catalog.ts            # Component catalog (Zod schemas)
│   │   ├── registry.tsx          # Component registry (shadcn/ui mapping)
│   │   ├── actions.ts            # Action handlers (Composio integration)
│   │   ├── stream.ts             # useUIStream hook wrapper
│   │   └── parser.ts             # JSON tree extraction
│   └── utils.ts                  # General utilities
│
├── stores/                       # Zustand stores
│   ├── chatStore.ts              # Chat state
│   ├── canvasStore.ts            # Canvas state
│   ├── inboxStore.ts             # Inbox state
│   └── appStore.ts               # Global app state
│
└── types/                        # TypeScript types
    ├── database.ts               # DB entity types
    ├── agent.ts                  # Agent types
    ├── json-render.ts            # json-render types (re-export from @json-render/core)
    └── api.ts                    # API types
```

### 7.2 State Management

```typescript
// src/stores/chatStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ToolStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: unknown;
}

interface ChatState {
  // State
  messages: Message[];
  isStreaming: boolean;
  currentStreamId: string | null;
  activeTools: ToolStatus[];
  error: string | null;
  sessionId: string | null;
  
  // Actions
  addMessage: (message: Message) => void;
  appendToLastMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamId: (id: string | null) => void;
  addTool: (tool: ToolStatus) => void;
  updateTool: (id: string, updates: Partial<ToolStatus>) => void;
  setError: (error: string | null) => void;
  setSessionId: (id: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  immer((set) => ({
    // Initial state
    messages: [],
    isStreaming: false,
    currentStreamId: null,
    activeTools: [],
    error: null,
    sessionId: null,
    
    // Actions
    addMessage: (message) =>
      set((state) => {
        state.messages.push(message);
      }),
    
    appendToLastMessage: (content) =>
      set((state) => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += content;
        }
      }),
    
    setStreaming: (streaming) =>
      set((state) => {
        state.isStreaming = streaming;
      }),
    
    setStreamId: (id) =>
      set((state) => {
        state.currentStreamId = id;
      }),
    
    addTool: (tool) =>
      set((state) => {
        state.activeTools.push(tool);
      }),
    
    updateTool: (id, updates) =>
      set((state) => {
        const tool = state.activeTools.find((t) => t.id === id);
        if (tool) {
          Object.assign(tool, updates);
        }
      }),
    
    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
    
    setSessionId: (id) =>
      set((state) => {
        state.sessionId = id;
      }),
    
    reset: () =>
      set((state) => {
        state.messages = [];
        state.isStreaming = false;
        state.currentStreamId = null;
        state.activeTools = [];
        state.error = null;
      }),
  })),
);
```

### 7.3 json-render Integration

> **Note:** This section was updated 2026-01-14 to use json-render instead of A2UI. json-render provides first-class React support with streaming, while A2UI lacks an official React renderer.

#### 7.3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           json-render Integration                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Canvas Panel Modes                             │   │
│  │                                                                       │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │   │ json-render │  │   TipTap    │  │   Polotno   │  │  Calendar   │ │   │
│  │   │ (AI UI)     │  │ (Rich Text) │  │  (Design)   │  │   (View)    │ │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        json-render Layer                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Catalog   │  │  Registry   │  │   Actions   │  │   Stream    │  │   │
│  │  │ (Zod schemas)│  │ (shadcn/ui)│  │ (handlers)  │  │ (useUIStream)│  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└───────────────────────────────────────────────���─────────────────────────────┘
```

#### 7.3.2 JsonRenderCanvas Component

```typescript
// src/components/canvas/JsonRenderCanvas.tsx

import React from 'react';
import { DataProvider, ActionProvider, Renderer } from '@json-render/react';
import { componentRegistry } from '@/lib/json-render/registry';
import { actionHandlers } from '@/lib/json-render/actions';
import { useCanvasStore } from '@/stores/canvasStore';

export function JsonRenderCanvas() {
  const { jsonRenderTree } = useCanvasStore();

  if (!jsonRenderTree) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Waiting for agent...
      </div>
    );
  }

  return (
    <DataProvider initialData={{}}>
      <ActionProvider actions={actionHandlers}>
        <div className="p-4 overflow-auto h-full">
          <Renderer tree={jsonRenderTree} components={componentRegistry} />
        </div>
      </ActionProvider>
    </DataProvider>
  );
}
```

#### 7.3.3 Component Catalog (Zod Schemas)

```typescript
// src/lib/json-render/catalog.ts

import { createCatalog } from '@json-render/core';
import { z } from 'zod';

export const orionCatalog = createCatalog({
  components: {
    // Layout Components
    Card: {
      props: z.object({
        title: z.string().optional(),
        variant: z.enum(['default', 'outlined', 'elevated']).default('default'),
      }),
      hasChildren: true,
    },
    Row: {
      props: z.object({
        gap: z.enum(['sm', 'md', 'lg']).default('md'),
        align: z.enum(['start', 'center', 'end', 'stretch']).default('start'),
      }),
      hasChildren: true,
    },

    // Interactive Components
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['default', 'primary', 'secondary', 'ghost', 'destructive']).default('default'),
        disabled: z.boolean().default(false),
      }),
    },
    TextField: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().optional(),
        valuePath: z.string(), // Data binding path
        type: z.enum(['text', 'email', 'password', 'textarea']).default('text'),
      }),
    },

    // Orion-Specific Components
    EmailComposer: {
      props: z.object({
        toPath: z.string(),
        subjectPath: z.string(),
        bodyPath: z.string(),
        replyToId: z.string().optional(),
      }),
    },
    CalendarSlotPicker: {
      props: z.object({
        valuePath: z.string(),
        slots: z.array(z.object({
          id: z.string(),
          start: z.string(),
          end: z.string(),
          available: z.boolean(),
          recommended: z.boolean().optional(),
        })),
      }),
    },
    InboxItem: {
      props: z.object({
        itemId: z.string(),
        source: z.enum(['gmail', 'slack', 'calendar', 'task']),
        title: z.string(),
        preview: z.string(),
        priority: z.number().min(0).max(1),
      }),
    },
    // ... 27 total components (see PLAN-json-render-integration.md)
  },

  actions: {
    send_email: { description: 'Send the composed email' },
    save_draft: { description: 'Save email as draft' },
    schedule_meeting: { description: 'Create calendar event' },
    file_to_project: { description: 'File inbox item to project' },
    archive_item: { description: 'Archive the inbox item' },
    // ... more actions
  },
});

// Export for agent system prompt
export const catalogPrompt = `
You can render UI using the following component catalog. Output valid JSON conforming to this schema:

${JSON.stringify(orionCatalog.toJSON(), null, 2)}

Rules:
1. Only use components defined in this catalog
2. All props must match the schema exactly
3. Use valuePath for data binding (e.g., "/form/email")
4. Use actions from the actions list only
`;
```

#### 7.3.4 Component Registry (shadcn/ui Mapping)

```typescript
// src/lib/json-render/registry.tsx

import React from 'react';
import { useDataValue, useDataSetter, useAction } from '@json-render/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TipTapEditor } from '@/components/editors/TipTapEditor';

// Component wrapper type
interface ComponentProps {
  element: {
    type: string;
    props: Record<string, unknown>;
    action?: { name: string; payload?: Record<string, unknown> };
  };
  children?: React.ReactNode;
}

// Layout Components
const CardComponent: React.FC<ComponentProps> = ({ element, children }) => {
  const { title, variant } = element.props;
  return (
    <Card className={variant === 'elevated' ? 'shadow-lg' : ''}>
      {title && <CardHeader><h3 className="font-semibold">{title as string}</h3></CardHeader>}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Interactive Components with Data Binding
const TextFieldComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, placeholder, valuePath, type } = element.props;
  const value = useDataValue(valuePath as string) || '';
  const setValue = useDataSetter(valuePath as string);

  return (
    <div className="space-y-2">
      <Label>{label as string}</Label>
      <Input
        type={type as string}
        placeholder={placeholder as string}
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

// Orion-Specific: EmailComposer with TipTap
const EmailComposerComponent: React.FC<ComponentProps> = ({ element }) => {
  const { toPath, subjectPath, bodyPath, replyToId } = element.props;

  const to = useDataValue(toPath as string) || '';
  const setTo = useDataSetter(toPath as string);
  const subject = useDataValue(subjectPath as string) || '';
  const setSubject = useDataSetter(subjectPath as string);
  const body = useDataValue(bodyPath as string) || '';
  const setBody = useDataSetter(bodyPath as string);

  const sendEmail = useAction('send_email');
  const saveDraft = useAction('save_draft');

  return (
    <Card>
      <CardHeader><h3>{replyToId ? 'Reply' : 'Compose Email'}</h3></CardHeader>
      <CardContent className="space-y-4">
        <Input value={to as string} onChange={(e) => setTo(e.target.value)} placeholder="To" />
        <Input value={subject as string} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        <TipTapEditor content={body as string} onChange={setBody} />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => saveDraft({})}>Save Draft</Button>
          <Button onClick={() => sendEmail({ to, subject, body })}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Export Registry
export const componentRegistry: Record<string, React.FC<ComponentProps>> = {
  Card: CardComponent,
  TextField: TextFieldComponent,
  EmailComposer: EmailComposerComponent,
  // ... map all 27 components
};
```

#### 7.3.5 Action Handlers (Composio Integration)

```typescript
// src/lib/json-render/actions.ts

import { composioClient } from '@/lib/composio';

export const actionHandlers: Record<string, (payload: unknown) => Promise<void>> = {
  send_email: async ({ to, subject, body, replyToId }) => {
    await composioClient.execute('GMAIL_SEND_EMAIL', {
      to,
      subject,
      body,
      threadId: replyToId,
    });
  },

  schedule_meeting: async ({ title, attendees, start, end, location }) => {
    await composioClient.execute('GOOGLECALENDAR_CREATE_EVENT', {
      summary: title,
      attendees: attendees.map((email: string) => ({ email })),
      start: { dateTime: start },
      end: { dateTime: end },
      location,
    });
  },

  file_to_project: async ({ itemId, projectId }) => {
    await db.inboxItems.update({
      where: { id: itemId },
      data: { projectId, processed: true },
    });
  },

  // ... more action handlers
};
```

**Reference:** See `thoughts/shared/plans/PLAN-json-render-integration.md` for complete implementation details including all 27 components, streaming setup, and canvas integration.

### 7.4 Chat Panel with Streaming

```typescript
// src/components/chat/ChatPanel.tsx

'use client';

import React, { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { agent } from '@/lib/tauri';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ToolStatusBar } from './ToolStatusBar';

export function ChatPanel() {
  const {
    messages,
    isStreaming,
    activeTools,
    error,
    sessionId,
    addMessage,
    appendToLastMessage,
    setStreaming,
    addTool,
    updateTool,
    setSessionId,
    setError,
  } = useChatStore();
  
  const cleanupRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);
  
  const handleSubmit = async (prompt: string) => {
    // Add user message
    addMessage({
      id: `msg_${Date.now()}`,
      conversation_id: sessionId || '',
      role: 'user',
      content: prompt,
      created_at: new Date().toISOString(),
    });
    
    setStreaming(true);
    setError(null);
    
    // Add placeholder assistant message
    addMessage({
      id: `msg_${Date.now() + 1}`,
      conversation_id: sessionId || '',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    });
    
    try {
      const { cleanup } = await agent.query(prompt, sessionId || undefined, (message) => {
        switch (message.type) {
          case 'text':
            appendToLastMessage(message.content || '');
            break;
          
          case 'tool_start':
            addTool({
              id: message.toolId!,
              name: message.toolName!,
              status: 'running',
            });
            break;
          
          case 'tool_complete':
            updateTool(message.toolId!, {
              status: message.isError ? 'error' : 'complete',
            });
            break;
          
          case 'complete':
            setStreaming(false);
            if (message.sessionId) {
              setSessionId(message.sessionId);
            }
            break;
          
          case 'error':
            setError(message.error || 'Unknown error');
            setStreaming(false);
            break;
        }
      });
      
      cleanupRef.current = cleanup;
    } catch (err) {
      setError(String(err));
      setStreaming(false);
    }
  };
  
  const handleCancel = () => {
    cleanupRef.current?.();
    setStreaming(false);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} />
        
        {isStreaming && (
          <ThinkingIndicator />
        )}
        
        {activeTools.length > 0 && (
          <ToolStatusBar tools={activeTools} />
        )}
        
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t p-4">
        <ChatInput
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          disabled={isStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
```

---

## 8. Tauri Integration

> **[NOT STARTED]** - `src-tauri/` directory was removed during restructure. Implementation planned for Epic 1 rebuild.

### 8.1 Tauri Configuration

```json
// src-tauri/tauri.conf.json
{
  "$schema": "https://tauri.app/v2/tauri.conf.json",
  "productName": "Orion",
  "identifier": "com.orion.butler",
  "version": "0.1.0",
  "build": {
    "beforeBuildCommand": "pnpm build",
    "beforeDevCommand": "pnpm dev",
    "frontendDist": "../out",
    "devUrl": "http://localhost:3000"
  },
  "bundle": {
    "active": true,
    "targets": ["dmg", "app"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns"
    ],
    "macOS": {
      "minimumSystemVersion": "12.0",
      "signingIdentity": "-",
      "providerShortName": null,
      "entitlements": "Entitlements.plist"
    }
  },
  "app": {
    "windows": [
      {
        "title": "Orion",
        "width": 1400,
        "height": 900,
        "minWidth": 1000,
        "minHeight": 700,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "transparent": false,
        "titleBarStyle": "Overlay"
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    },
    "trayIcon": {
      "iconPath": "icons/tray.png",
      "iconAsTemplate": true
    }
  },
  "plugins": {
    "fs": {
      "scope": ["$APPDATA/**", "$HOME/Library/Application Support/Orion/**"]
    },
    "shell": {
      "open": true,
      "scope": []
    },
    "process": {},
    "notification": {},
    "dialog": {}
  }
}
```

### 8.2 Rust Main Process

```rust
// src-tauri/src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod agent_server;

use tauri::Manager;
use std::process::{Command, Child};
use std::sync::Mutex;

struct AgentServerState(Mutex<Option<Child>>);

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            database::init(&app_data_dir)?;
            
            // Start agent server
            let server_path = app.path().resource_dir()
                .expect("Failed to get resource dir")
                .join("agent-server");
            
            let child = Command::new("node")
                .args(["dist/index.js"])
                .current_dir(&server_path)
                .env("PORT", "3001")
                .spawn()
                .expect("Failed to start agent server");
            
            app.manage(AgentServerState(Mutex::new(Some(child))));
            
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Cleanup agent server
                let state = window.state::<AgentServerState>();
                if let Ok(mut guard) = state.0.lock() {
                    if let Some(mut child) = guard.take() {
                        let _ = child.kill();
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Database commands
            commands::get_contacts,
            commands::create_contact,
            commands::update_contact,
            commands::delete_contact,
            commands::search_contacts_semantic,
            
            commands::get_projects,
            commands::create_project,
            commands::update_project,
            
            commands::get_tasks,
            commands::create_task,
            commands::update_task,
            
            commands::get_inbox_items,
            commands::process_inbox_item,
            commands::sync_inbox,
            
            commands::get_conversations,
            commands::get_messages,
            
            // Agent commands
            commands::start_agent_query,
            commands::abort_agent_query,
            
            // Tool commands
            commands::get_tool_connections,
            commands::initiate_tool_connection,
            commands::disconnect_tool,
            
            // Preferences
            commands::get_preferences,
            commands::set_preference,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 8.3 IPC Event Streaming

```rust
// src-tauri/src/agent_server.rs

use tauri::{AppHandle, Emitter};
use reqwest::Client;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct StreamMessage {
    pub r#type: String,
    pub content: Option<String>,
    pub tool_name: Option<String>,
    pub tool_id: Option<String>,
    pub is_error: Option<bool>,
    pub error: Option<String>,
    pub session_id: Option<String>,
}

pub async fn stream_agent_response(
    app: AppHandle,
    stream_id: String,
    prompt: String,
    session_id: Option<String>,
) -> Result<(), String> {
    let client = Client::new();
    
    let mut url = format!("http://localhost:3001/api/stream/{}", stream_id);
    url.push_str(&format!("?prompt={}", urlencoding::encode(&prompt)));
    if let Some(sid) = session_id {
        url.push_str(&format!("&sessionId={}", urlencoding::encode(&sid)));
    }
    
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let mut stream = response.bytes_stream();
    let mut buffer = String::new();
    
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        buffer.push_str(&String::from_utf8_lossy(&chunk));
        
        // Parse SSE events
        while let Some(pos) = buffer.find("\n\n") {
            let event_str = buffer[..pos].to_string();
            buffer = buffer[pos + 2..].to_string();
            
            if let Some(message) = parse_sse_event(&event_str) {
                app.emit(&format!("agent:stream:{}", stream_id), message)
                    .map_err(|e| e.to_string())?;
            }
        }
    }
    
    Ok(())
}

fn parse_sse_event(event_str: &str) -> Option<StreamMessage> {
    let mut event_type = String::new();
    let mut data = String::new();
    
    for line in event_str.lines() {
        if line.starts_with("event:") {
            event_type = line[6..].trim().to_string();
        } else if line.starts_with("data:") {
            data = line[5..].trim().to_string();
        }
    }
    
    if !data.is_empty() {
        serde_json::from_str::<StreamMessage>(&data).ok().map(|mut msg| {
            if msg.r#type.is_empty() {
                msg.r#type = event_type;
            }
            msg
        })
    } else {
        None
    }
}
```

### 8.4 Security Capabilities

```xml
<!-- src-tauri/Entitlements.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Allow network access -->
    <key>com.apple.security.network.client</key>
    <true/>
    
    <!-- Allow file access -->
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    
    <!-- Allow app data access -->
    <key>com.apple.security.files.bookmarks.app-scope</key>
    <true/>
</dict>
</plist>
```

### 8.5 Shadow Workspace (Validation Before Display)

> **Source:** Research into Cursor IDE architecture (2026-01-20)

For file operations, validate changes before showing them to the user. This prevents displaying invalid, broken, or syntactically incorrect changes.

#### 8.5.1 Why Shadow Workspace

| Without Shadow | With Shadow |
|----------------|-------------|
| Agent proposes broken code → User sees error | Agent proposes code → Validation catches error → User never sees it |
| "Here's my change" → Syntax error → User frustrated | "Here's my change" → Clean, validated → User happy |

#### 8.5.2 Implementation Architecture

```
Agent proposes file change
         ↓
┌─────────────────────────────────┐
│     SHADOW WORKSPACE            │
│  (Temporary copy of project)    │
├─────────────────────────────────┤
│  1. Apply proposed change       │
│  2. Run validation:             │
│     - Syntax check (parser)     │
│     - Type check (if TS/typed)  │
│     - Lint (ESLint/Ruff)        │
│     - Build (optional)          │
│  3. If passes → show to user    │
│     If fails → retry or report  │
└─────────────────────────────────┘
         ↓
User sees validated diff
```

#### 8.5.3 Tauri Implementation

```rust
// src-tauri/src/shadow_workspace.rs

use std::path::PathBuf;
use tempfile::TempDir;

pub struct ShadowWorkspace {
    temp_dir: TempDir,
    project_root: PathBuf,
}

impl ShadowWorkspace {
    pub fn new(project_root: PathBuf) -> Result<Self, std::io::Error> {
        let temp_dir = TempDir::new()?;
        // Copy relevant files to shadow workspace
        Ok(Self { temp_dir, project_root })
    }

    pub fn apply_change(&self, file_path: &str, content: &str) -> Result<(), std::io::Error> {
        let shadow_path = self.temp_dir.path().join(file_path);
        std::fs::write(shadow_path, content)
    }

    pub fn validate(&self) -> ValidationResult {
        // Run syntax check
        let syntax_ok = self.check_syntax();

        // Run type check (if TypeScript)
        let types_ok = self.check_types();

        // Run linter
        let lint_ok = self.run_linter();

        ValidationResult {
            syntax_ok,
            types_ok,
            lint_ok,
            errors: self.collect_errors(),
        }
    }
}
```

#### 8.5.4 PreToolUse Hook for Validation

```typescript
// agent-server/src/hooks/shadow-validation.ts

const validateFileChanges: HookCallback = async (input, toolUseId) => {
  // Only validate Write and Edit tools
  if (!['Write', 'Edit'].includes(input.tool_name)) {
    return { continue: true };
  }

  const filePath = input.file_path;
  const newContent = input.content || input.new_string;

  // Skip validation for non-code files
  if (!isCodeFile(filePath)) {
    return { continue: true };
  }

  // Apply change to shadow workspace
  const shadow = await createShadowWorkspace();
  await shadow.applyChange(filePath, newContent);

  // Validate
  const result = await shadow.validate();

  if (!result.allPassed) {
    return {
      continue: true,  // Let the tool run, but inject context
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: `
⚠️ Validation warning for ${filePath}:
${result.errors.map(e => `- ${e}`).join('\n')}

Consider fixing these issues before proceeding.
`,
      },
    };
  }

  return { continue: true };
};
```

#### 8.5.5 When to Use Shadow Validation

| File Type | Validation | Reason |
|-----------|------------|--------|
| `.ts`, `.tsx` | Syntax + Types + Lint | Full TypeScript validation |
| `.js`, `.jsx` | Syntax + Lint | No type checking |
| `.py` | Syntax + Lint (Ruff) | Python validation |
| `.json` | JSON parse | Catch malformed JSON |
| `.md`, `.txt` | Skip | No code validation needed |

#### 8.5.6 Performance Considerations

| Validation Level | Speed | When to Use |
|------------------|-------|-------------|
| **Syntax only** | <100ms | Every file change |
| **Syntax + Lint** | 200-500ms | Code files |
| **Full (+ types)** | 1-3s | Before showing final diff |
| **Build** | 5-30s | Only on explicit request |

Default to **Syntax + Lint** for good balance of speed and safety.

---

## 9. Composio Integration

### 9.1 Multi-Account Authentication Flow

```typescript
// src/lib/composio.ts

import { Composio } from '@composio/core';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
});

// ============================================================================
// Connection Management
// ============================================================================

export async function initiateConnection(
  toolName: string,
  accountAlias: string,
  redirectUrl: string,
): Promise<{ authUrl: string; connectionId: string }> {
  const connection = await composio.connected_accounts.initiate({
    user_id: 'orion-user', // Single user for MVP
    toolkit: toolName.toUpperCase(),
    redirect_url: redirectUrl,
    // For multi-account, include alias in metadata
    metadata: { account_alias: accountAlias },
  });
  
  return {
    authUrl: connection.redirect_url,
    connectionId: connection.id,
  };
}

export async function checkConnectionStatus(
  connectionId: string,
): Promise<{ status: 'initiated' | 'active' | 'expired' | 'failed'; error?: string }> {
  const connection = await composio.connected_accounts.get(connectionId);
  
  return {
    status: connection.status.toLowerCase() as any,
    error: connection.error_message,
  };
}

export async function listConnections(
  toolName?: string,
): Promise<ToolConnection[]> {
  const connections = await composio.connected_accounts.list({
    user_id: 'orion-user',
    toolkit: toolName?.toUpperCase(),
  });
  
  return connections.map((conn) => ({
    id: conn.id,
    tool_name: conn.toolkit.toLowerCase(),
    account_alias: conn.metadata?.account_alias || 'default',
    connection_type: 'composio',
    composio_connection_id: conn.id,
    status: conn.status.toLowerCase() as any,
    account_email: conn.account_email,
    account_name: conn.account_name,
    expires_at: conn.expires_at,
    last_used_at: conn.last_used_at,
  }));
}

// ============================================================================
// Tool Execution
// ============================================================================

export async function executeToolAction(
  toolName: string,
  action: string,
  params: Record<string, unknown>,
  accountAlias?: string,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    // Get connection for specific account
    const connections = await listConnections(toolName);
    const connection = accountAlias
      ? connections.find((c) => c.account_alias === accountAlias)
      : connections[0];
    
    if (!connection || connection.status !== 'active') {
      return {
        success: false,
        error: `No active connection for ${toolName}${accountAlias ? ` (${accountAlias})` : ''}`,
      };
    }
    
    const result = await composio.tools.execute({
      userId: 'orion-user',
      slug: `${toolName.toUpperCase()}_${action.toUpperCase()}`,
      arguments: params,
      connected_account_id: connection.composio_connection_id,
    });
    
    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

// ============================================================================
// Tool-Specific Helpers
// ============================================================================

export const gmail = {
  sendEmail: (params: { to: string; subject: string; body: string }, account?: string) =>
    executeToolAction('gmail', 'send_email', params, account),
  
  getEmails: (params: { query?: string; maxResults?: number }, account?: string) =>
    executeToolAction('gmail', 'get_emails', params, account),
  
  createDraft: (params: { to: string; subject: string; body: string }, account?: string) =>
    executeToolAction('gmail', 'create_draft', params, account),
  
  getThread: (params: { threadId: string }, account?: string) =>
    executeToolAction('gmail', 'get_thread', params, account),
};

export const calendar = {
  listEvents: (params: { timeMin: string; timeMax: string }, account?: string) =>
    executeToolAction('googlecalendar', 'list_events', params, account),
  
  createEvent: (params: {
    summary: string;
    start: string;
    end: string;
    attendees?: string[];
    location?: string;
    description?: string;
  }, account?: string) =>
    executeToolAction('googlecalendar', 'create_event', params, account),
  
  getFreeBusy: (params: { timeMin: string; timeMax: string; items: string[] }, account?: string) =>
    executeToolAction('googlecalendar', 'get_free_busy', params, account),
};

export const slack = {
  sendMessage: (params: { channel: string; text: string }, account?: string) =>
    executeToolAction('slack', 'send_message', params, account),
  
  listChannels: (account?: string) =>
    executeToolAction('slack', 'list_channels', {}, account),
};
```

### 9.2 Error Handling

```typescript
// src/lib/composio-error-handler.ts

export enum ComposioErrorCode {
  AUTH_EXPIRED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  RATE_LIMITED = 429,
  INVALID_PARAMS = 603,
  SERVER_ERROR = 500,
}

export interface ComposioError {
  code: ComposioErrorCode;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

export function handleComposioError(error: unknown): ComposioError {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const e = error as { code: number; message?: string };
    
    switch (e.code) {
      case 401:
        return {
          code: ComposioErrorCode.AUTH_EXPIRED,
          message: 'Authentication expired. Please reconnect.',
          retryable: false,
        };
      
      case 429:
        return {
          code: ComposioErrorCode.RATE_LIMITED,
          message: 'Rate limited. Please try again later.',
          retryable: true,
          retryAfter: 60000, // 1 minute
        };
      
      case 603:
        return {
          code: ComposioErrorCode.INVALID_PARAMS,
          message: e.message || 'Invalid parameters',
          retryable: false,
        };
      
      default:
        return {
          code: ComposioErrorCode.SERVER_ERROR,
          message: e.message || 'Unknown error',
          retryable: true,
          retryAfter: 5000,
        };
    }
  }
  
  return {
    code: ComposioErrorCode.SERVER_ERROR,
    message: String(error),
    retryable: true,
    retryAfter: 5000,
  };
}

// Retry wrapper
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: ComposioError | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = handleComposioError(error);
      
      if (!lastError.retryable || attempt === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = lastError.retryAfter || baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

---

## 10. Memory System

### 10.1 Embedding Generation

```typescript
// src/lib/embeddings.ts

import { pipeline, env } from '@xenova/transformers';

// Use local model
env.allowLocalModels = true;
env.useBrowserCache = true;

let embeddingPipeline: any = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/bge-m3',  // BGE-M3: 1024 dims, 8192 token context, 100+ languages
      { quantized: true },
    );
  }
  return embeddingPipeline;
}

export async function generateEmbedding(text: string): Promise<Float32Array> {
  const pipe = await getEmbeddingPipeline();
  
  const output = await pipe(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  return new Float32Array(output.data);
}

export async function generateEmbeddings(texts: string[]): Promise<Float32Array[]> {
  const pipe = await getEmbeddingPipeline();
  
  const results: Float32Array[] = [];
  
  // Batch process for efficiency
  for (const text of texts) {
    const output = await pipe(text, {
      pooling: 'mean',
      normalize: true,
    });
    results.push(new Float32Array(output.data));
  }
  
  return results;
}
```

### 10.2 Vector Search

```typescript
// src/lib/vector-search.ts

import Database from 'better-sqlite3';

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export async function semanticSearch(
  db: Database.Database,
  table: string,
  query: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // Perform vector similarity search
  // Note: Using manual cosine similarity until sqlite-vec is stable
  const rows = db.prepare(`
    SELECT id, content, metadata, embedding
    FROM ${table}
    WHERE embedding IS NOT NULL
  `).all() as Array<{
    id: string;
    content: string;
    metadata: string;
    embedding: Buffer;
  }>;
  
  // Calculate similarities
  const results = rows.map((row) => {
    const rowEmbedding = new Float32Array(row.embedding.buffer);
    const similarity = cosineSimilarity(queryEmbedding, rowEmbedding);
    
    return {
      id: row.id,
      content: row.content,
      score: similarity,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  });
  
  // Sort by similarity and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### 10.3 Memory Recall

```typescript
// src/lib/memory.ts

import { Client } from 'pg';

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

export interface Memory {
  id: number;
  session_id: string;
  memory_type: string;
  content: string;
  context?: string;
  tags?: string[];
  confidence: string;
  created_at: Date;
  score?: number;
}

export async function recallMemories(
  query: string,
  options: {
    limit?: number;
    types?: string[];
    minConfidence?: string;
  } = {},
): Promise<Memory[]> {
  const { limit = 5, types, minConfidence } = options;
  
  // Generate query embedding
  const embedding = await generateEmbedding(query);
  
  // Build query
  let sql = `
    SELECT 
      id, session_id, memory_type, content, context, tags, confidence, created_at,
      1 - (embedding <=> $1::vector) as score
    FROM archival_memory
    WHERE embedding IS NOT NULL
  `;
  
  const params: unknown[] = [`[${Array.from(embedding).join(',')}]`];
  
  if (types && types.length > 0) {
    sql += ` AND memory_type = ANY($${params.length + 1})`;
    params.push(types);
  }
  
  if (minConfidence) {
    sql += ` AND confidence = $${params.length + 1}`;
    params.push(minConfidence);
  }
  
  sql += ` ORDER BY score DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  
  const result = await pgClient.query(sql, params);
  
  return result.rows;
}

export async function storeMemory(
  memory: Omit<Memory, 'id' | 'created_at' | 'score'>,
): Promise<number> {
  // Generate embedding for content
  const embedding = await generateEmbedding(
    `${memory.content} ${memory.context || ''}`,
  );
  
  const result = await pgClient.query(
    `INSERT INTO archival_memory 
      (session_id, memory_type, content, context, tags, confidence, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
     RETURNING id`,
    [
      memory.session_id,
      memory.memory_type,
      memory.content,
      memory.context,
      memory.tags,
      memory.confidence,
      `[${Array.from(embedding).join(',')}]`,
    ],
  );
  
  return result.rows[0].id;
}
```

### 10.4 Claude Agent SDK Memory Tool

> **Source:** Claude Agent SDK 2026 research (2026-01-20)

The Claude Agent SDK provides a built-in Memory tool for cross-session learning, reducing the need for manual PostgreSQL memory operations in many cases.

#### 10.4.1 Memory Tool Capabilities

| Operation | Description | When to Use |
|-----------|-------------|-------------|
| `memory.store` | Persist a learning or fact | After discovering user preferences, decisions |
| `memory.recall` | Semantic search over stored memories | Before making assumptions, check what's known |
| `memory.forget` | Remove outdated or incorrect info | When user corrects a mistake |
| `memory.list` | Browse stored memories | Debugging, user transparency |

#### 10.4.2 Integration with Orion Memory System

Orion uses a **dual-memory architecture**:

| Layer | Technology | Purpose | Retention |
|-------|------------|---------|-----------|
| **SDK Memory Tool** | Built-in | Session-level learnings | Auto-managed |
| **PostgreSQL + pgvector** | Custom | Cross-session, cross-project | Permanent |

```typescript
// The SDK Memory tool is available automatically when enabled
options: {
  allowedTools: [
    // ... other tools
    'Memory',  // Enable built-in memory tool
  ],
}
```

#### 10.4.3 When to Use Each

| Use Case | SDK Memory | PostgreSQL |
|----------|------------|------------|
| "Remember I prefer morning meetings" | ✅ | Also sync |
| "What did we discuss last week?" | ✅ | Fallback |
| Cross-session preference learning | ❌ | ✅ |
| Embedding-based semantic search | Limited | ✅ Full control |
| Memory shared across Orion instances | ❌ | ✅ |

#### 10.4.4 Syncing Memories to PostgreSQL

For important learnings, sync from SDK memory to PostgreSQL:

```typescript
// PostToolUse hook to sync Memory tool calls to PostgreSQL
const syncMemoryToPostgres: HookCallback = async (input, toolUseId) => {
  if (input.tool_name === 'Memory' && input.operation === 'store') {
    await storeMemory({
      session_id: input.sessionId,
      memory_type: 'USER_PREFERENCE',
      content: input.content,
      context: 'Synced from SDK Memory tool',
      tags: ['sdk-memory', 'auto-synced'],
      confidence: 'high',
    });
  }
  return { continue: true };
};
```

#### 10.4.5 Memory Tool Prompt Guidance

Add to Butler system prompt:

```markdown
## Memory Usage

You have a Memory tool for storing and recalling information.

**Store memories when you learn:**
- User preferences ("prefers email over Slack")
- Recurring patterns ("always schedules gym at 6am")
- Important facts ("reports to Sarah Chen")
- Corrections ("actually it's spelled 'Dani' not 'Danny'")

**Recall memories before:**
- Making assumptions about preferences
- Drafting communications (check tone preferences)
- Scheduling (check time preferences)
- Any repeated task (check if there's a pattern)

**Do NOT store:**
- Temporary task state (use TodoWrite instead)
- Sensitive credentials or passwords
- Information already in PARA system
```

---

## 11. Observability & Tracing

Orion uses a dual-system observability architecture with **Braintrust** and **Langfuse** operating complementarily.

### 11.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORION APPLICATION                             │
├─────────────────────────────────────────────────────────────────┤
│  Agent Execution                                                 │
│  ├── Butler Agent                                               │
│  ├── Triage Agent                                               │
│  └── Tool Calls (Composio)                                      │
└──────────────┬───────────────────────────┬─────────────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│      BRAINTRUST          │  │       LANGFUSE           │
│  (Development Focus)     │  │  (Production Focus)      │
├──────────────────────────┤  ├──────────────────────────┤
│ • Session tracing        │  │ • Prompt management      │
│ • Learning extraction    │  │ • A/B testing            │
│ • Agent run datasets     │  │ • LLM-as-a-Judge eval    │
│ • Sub-agent correlation  │  │ • Human annotation       │
│ • Post-hoc analysis      │  │ • Cost tracking          │
└──────────────────────────┘  └──────────────────────────┘
```

**Why two systems?**
- **Braintrust**: Already integrated in Continuous Claude for session analysis and learning extraction
- **Langfuse**: Open-source, self-hostable, with prompt management and evaluation features

### 11.2 Braintrust Integration (Existing)

Already configured via `.claude/hooks/braintrust_hooks.py`:

```typescript
// Environment variables
TRACE_TO_BRAINTRUST=true
BRAINTRUST_API_KEY=...
BRAINTRUST_CC_PROJECT=claude-code
```

**Hooks:**
- `session_start` - Creates trace span
- `session_end` - Closes trace, records metrics
- `user_prompt_submit` - Logs user messages
- `post_tool_use` - Records tool execution
- `stop` - Final cleanup

### 11.3 Langfuse Integration (New)

```typescript
// src/lib/langfuse.ts

import { Langfuse } from 'langfuse';

// Singleton client with graceful degradation
let langfuseClient: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  if (!process.env.LANGFUSE_PUBLIC_KEY) {
    return null; // Not configured, gracefully skip
  }

  if (!langfuseClient) {
    langfuseClient = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
    });
  }

  return langfuseClient;
}

export function langfuseEnabled(): boolean {
  return !!process.env.LANGFUSE_PUBLIC_KEY;
}
```

**Environment variables:**
```bash
# Langfuse (optional)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # or self-hosted URL
```

### 11.4 Agent Tracing with Langfuse

```typescript
// src/lib/agent-tracing.ts

import { getLangfuse } from './langfuse';

export async function traceAgentExecution<T>(
  agentName: string,
  input: Record<string, unknown>,
  fn: () => Promise<T>,
): Promise<T> {
  const langfuse = getLangfuse();

  if (!langfuse) {
    // Langfuse not configured, execute without tracing
    return fn();
  }

  const trace = langfuse.trace({
    name: `orion-${agentName}`,
    input,
    metadata: {
      agent: agentName,
      timestamp: new Date().toISOString(),
    },
  });

  try {
    const result = await fn();

    trace.update({
      output: result,
    });

    return result;
  } catch (error) {
    trace.update({
      output: { error: String(error) },
      level: 'ERROR',
    });
    throw error;
  } finally {
    await langfuse.flushAsync();
  }
}

// Usage in butler agent
export async function executeButlerAgent(userMessage: string) {
  return traceAgentExecution('butler', { userMessage }, async () => {
    // Agent execution logic
    const response = await runAgent('butler', userMessage);
    return response;
  });
}
```

### 11.5 Prompt Management with Langfuse

```typescript
// src/lib/prompts.ts

import { getLangfuse } from './langfuse';

interface PromptConfig {
  name: string;
  version?: number;
  fallback: string;
}

export async function getPrompt(config: PromptConfig): Promise<string> {
  const langfuse = getLangfuse();

  if (!langfuse) {
    return config.fallback;
  }

  try {
    const prompt = await langfuse.getPrompt(config.name, config.version);
    return prompt.prompt;
  } catch {
    // Fallback to local prompt if Langfuse unavailable
    return config.fallback;
  }
}

// Usage
const triagePrompt = await getPrompt({
  name: 'orion-triage-v1',
  fallback: TRIAGE_PROMPT_LOCAL,
});
```

### 11.6 LLM-as-a-Judge Evaluation

```typescript
// src/lib/evaluation.ts

import { getLangfuse } from './langfuse';

export async function scoreResponse(
  traceId: string,
  scoreName: string,
  value: number,
  comment?: string,
): Promise<void> {
  const langfuse = getLangfuse();
  if (!langfuse) return;

  await langfuse.score({
    traceId,
    name: scoreName,
    value,
    comment,
  });
}

// Auto-evaluate triage quality
export async function evaluateTriageQuality(
  traceId: string,
  triageResult: TriageResult,
): Promise<void> {
  // Score relevance (0-1)
  await scoreResponse(
    traceId,
    'triage_relevance',
    triageResult.confidence,
    `Priority: ${triageResult.priority}`,
  );

  // Score action extraction (0-1)
  const actionScore = triageResult.extractedActions.length > 0 ? 1 : 0;
  await scoreResponse(
    traceId,
    'action_extraction',
    actionScore,
    `Actions: ${triageResult.extractedActions.length}`,
  );
}
```

### 11.7 Sampling Configuration

For high-volume production deployments, configure sampling to control trace volume and costs.

```typescript
// src/lib/langfuse.ts - Enhanced with sampling

import { Langfuse } from 'langfuse';

interface LangfuseConfig {
  sampleRate?: number;  // 0.0 to 1.0 (default: 1.0 = 100%)
  debug?: boolean;
}

let langfuseClient: Langfuse | null = null;

export function getLangfuse(config: LangfuseConfig = {}): Langfuse | null {
  if (!process.env.LANGFUSE_PUBLIC_KEY) {
    return null;
  }

  if (!langfuseClient) {
    langfuseClient = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
      // Sampling: 0.2 = 20% of traces sent to Langfuse
      sampleRate: config.sampleRate ?? parseFloat(process.env.LANGFUSE_SAMPLE_RATE || '1.0'),
    });
  }

  return langfuseClient;
}
```

**Environment variables:**
```bash
# Sampling configuration
LANGFUSE_SAMPLE_RATE=0.2          # 20% of traces (production)
LANGFUSE_SAMPLE_RATE=1.0          # 100% of traces (development)

# Performance tuning
LANGFUSE_FLUSH_INTERVAL=5000      # Flush every 5 seconds (default: 500ms)
LANGFUSE_MAX_BATCH_SIZE=100       # Batch size before flush

# Debugging
LANGFUSE_DEBUG=true               # Enable debug logging
```

**Recommended sampling rates by environment:**

| Environment | Sample Rate | Rationale |
|-------------|-------------|-----------|
| Development | `1.0` (100%) | Full visibility for debugging |
| Staging | `0.5` (50%) | Balance visibility and cost |
| Production | `0.1-0.2` (10-20%) | Cost-efficient, statistically significant |
| High-volume (>10k/day) | `0.05` (5%) | Minimize costs, still captures patterns |

**Important notes:**
- Sampling is decided at the trace level (all spans within a trace are included or excluded together)
- Always call `langfuse.flushAsync()` before process exit in serverless/short-lived contexts
- For sensitive operations (errors, edge cases), consider logging at 100% regardless of sampling

### 11.8 Use Case Decision Guide

| Scenario | Use Braintrust | Use Langfuse |
|----------|---------------|--------------|
| Debug a specific session | ✅ | |
| Extract learnings from sessions | ✅ | |
| A/B test different prompts | | ✅ |
| Manage prompt versions | | ✅ |
| Human annotation of responses | | ✅ |
| Track costs in production | | ✅ |
| Analyze agent sub-spans | ✅ | |
| Create evaluation datasets | | ✅ |

---

## 12. Streaming Architecture

### 12.1 Message Protocol

```typescript
// src/types/streaming.ts

export type StreamEventType =
  | 'thinking'
  | 'text'
  | 'tool_start'
  | 'tool_input'
  | 'tool_complete'
  | 'tool_error'
  | 'session'
  | 'result'
  | 'complete'
  | 'error';

export interface StreamEvent {
  type: StreamEventType;
  timestamp: number;
  
  // Text content
  content?: string;
  
  // Tool events
  toolId?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: unknown;
  toolError?: string;
  
  // Session info
  sessionId?: string;
  
  // Result info
  durationMs?: number;
  totalCost?: number;
  inputTokens?: number;
  outputTokens?: number;
  
  // Error
  error?: string;
}
```

### 12.2 Inbox Sync

```typescript
// src/lib/inbox-sync.ts

import { gmail } from './composio';
import { db } from './tauri';

const SYNC_INTERVAL = 30000; // 30 seconds
let syncInterval: NodeJS.Timeout | null = null;

export function startInboxSync() {
  if (syncInterval) return;
  
  syncInterval = setInterval(syncInbox, SYNC_INTERVAL);
  syncInbox(); // Initial sync
}

export function stopInboxSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

async function syncInbox() {
  try {
    // Get emails from Gmail
    const result = await gmail.getEmails({
      query: 'is:unread',
      maxResults: 50,
    });
    
    if (!result.success || !result.data) return;
    
    const emails = result.data as Array<{
      id: string;
      threadId: string;
      snippet: string;
      payload: {
        headers: Array<{ name: string; value: string }>;
      };
      internalDate: string;
    }>;
    
    // Check for new emails
    for (const email of emails) {
      const exists = await checkEmailExists(email.id);
      if (exists) continue;
      
      // Extract email data
      const headers = email.payload.headers;
      const from = headers.find((h) => h.name === 'From')?.value || '';
      const subject = headers.find((h) => h.name === 'Subject')?.value || '';
      
      // Create inbox item
      await db.inbox.create({
        source_tool: 'gmail',
        source_id: email.id,
        type: 'email',
        title: subject,
        preview: email.snippet,
        from_name: extractName(from),
        from_email: extractEmail(from),
        received_at: new Date(parseInt(email.internalDate)).toISOString(),
      });
    }
  } catch (error) {
    console.error('Inbox sync error:', error);
  }
}

function extractName(from: string): string {
  const match = from.match(/^([^<]+)</);
  return match ? match[1].trim() : from;
}

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

async function checkEmailExists(sourceId: string): Promise<boolean> {
  const items = await db.inbox.list();
  return items.some((item) => item.source_id === sourceId);
}
```

---

## 13. Security

### 13.1 API Key Storage

```typescript
// src/lib/secrets.ts

import { invoke } from '@tauri-apps/api/core';

// Keys stored in macOS Keychain via Tauri
export const secrets = {
  set: async (key: string, value: string) => {
    await invoke('set_secret', { key, value });
  },
  
  get: async (key: string): Promise<string | null> => {
    return invoke<string | null>('get_secret', { key });
  },
  
  delete: async (key: string) => {
    await invoke('delete_secret', { key });
  },
};

// Key names
export const SECRET_KEYS = {
  ANTHROPIC_API_KEY: 'orion.anthropic_api_key',
  COMPOSIO_API_KEY: 'orion.composio_api_key',
} as const;
```

### 13.2 OAuth Token Management

Composio handles OAuth token storage and refresh automatically. Orion stores:
- Connection IDs (not tokens)
- Account metadata (email, name)
- Connection status

```typescript
// Token refresh is automatic via Composio
// We only need to handle expired connections

export async function refreshConnectionIfNeeded(
  connectionId: string,
): Promise<boolean> {
  const status = await checkConnectionStatus(connectionId);
  
  if (status.status === 'expired') {
    // Re-initiate OAuth flow
    // User will need to re-authenticate
    return false;
  }
  
  return status.status === 'active';
}
```

### 13.3 Data Encryption

For sensitive local data, use SQLCipher (optional):

```typescript
// src/lib/encrypted-db.ts

import Database from 'better-sqlite3';
import { secrets, SECRET_KEYS } from './secrets';

export async function openEncryptedDatabase(path: string): Promise<Database.Database> {
  const db = new Database(path);
  
  // Get or generate encryption key
  let key = await secrets.get('orion.db_encryption_key');
  if (!key) {
    key = generateRandomKey();
    await secrets.set('orion.db_encryption_key', key);
  }
  
  // Enable encryption (requires SQLCipher build)
  db.pragma(`key='${key}'`);
  
  return db;
}

function generateRandomKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

```typescript
// tests/unit/triage.test.ts

import { describe, it, expect } from 'vitest';
import { calculatePriority, extractActions } from '@/lib/triage';

describe('Triage', () => {
  describe('calculatePriority', () => {
    it('should score VIP contacts higher', () => {
      const item = {
        from_contact_id: 'cont_vip',
        full_content: 'Hello',
        received_at: new Date().toISOString(),
      };
      
      const context = {
        vipContacts: ['cont_vip'],
      };
      
      const score = calculatePriority(item, context);
      expect(score).toBeGreaterThan(0.5);
    });
    
    it('should detect urgency signals', () => {
      const item = {
        full_content: 'URGENT: Please respond ASAP',
        received_at: new Date().toISOString(),
      };
      
      const score = calculatePriority(item, {});
      expect(score).toBeGreaterThan(0.7);
    });
  });
  
  describe('extractActions', () => {
    it('should extract task from request', () => {
      const content = 'Can you review the attached proposal?';
      const actions = extractActions(content);
      
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('task');
      expect(actions[0].action).toContain('review');
    });
  });
});
```

### 14.2 Integration Tests

```typescript
// tests/integration/composio.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { gmail, calendar } from '@/lib/composio';

describe('Composio Integration', () => {
  beforeAll(async () => {
    // Check for active connections
    const connections = await listConnections();
    if (!connections.some(c => c.tool_name === 'gmail' && c.status === 'active')) {
      throw new Error('Gmail connection required for integration tests');
    }
  });
  
  describe('Gmail', () => {
    it('should fetch emails', async () => {
      const result = await gmail.getEmails({ maxResults: 5 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
    
    it('should create draft', async () => {
      const result = await gmail.createDraft({
        to: 'test@example.com',
        subject: '[TEST] Integration Test',
        body: 'This is a test draft.',
      });
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('Calendar', () => {
    it('should list events', async () => {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const result = await calendar.listEvents({
        timeMin: now.toISOString(),
        timeMax: nextWeek.toISOString(),
      });
      
      expect(result.success).toBe(true);
    });
  });
});
```

### 14.3 E2E Tests

```typescript
// tests/e2e/onboarding.spec.ts

import { test, expect } from '@/tests/support/fixtures';

test.describe('Onboarding', () => {
  test('should complete onboarding flow', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Step 1: Welcome
    await expect(page.getByText('Welcome to Orion')).toBeVisible();
    await page.click('text=Get Started');
    
    // Step 2: API Key
    await expect(page.getByText('Enter your API key')).toBeVisible();
    await page.fill('[name="apiKey"]', process.env.TEST_ANTHROPIC_KEY!);
    await page.click('text=Continue');
    
    // Step 3: Connect Services
    await expect(page.getByText('Connect Your Services')).toBeVisible();
    await page.click('text=Skip for now');
    
    // Step 4: Areas
    await expect(page.getByText('Select Your Areas')).toBeVisible();
    await page.click('text=Career');
    await page.click('text=Continue');
    
    // Step 5: Complete
    await expect(page.getByText('Ready to Go')).toBeVisible();
    await page.click('text=Start Using Orion');
    
    // Should redirect to main app
    await expect(page).toHaveURL('/chat');
  });
});
```

---

## 15. Build & Deploy

### 15.1 Development Setup

```bash
# Prerequisites
- Node.js 20+
- Rust (latest stable)
- pnpm 8+
- Docker (for PostgreSQL)

# Clone and setup
git clone https://github.com/your-org/orion.git
cd orion
pnpm install

# Start PostgreSQL
docker-compose up -d postgres

# Setup environment
cp .env.example .env
# Fill in API keys

# Run database migrations
pnpm db:migrate

# Start development
pnpm tauri dev
```

### 15.2 Build Configuration

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && next export",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "agent-server:dev": "cd agent-server && npm run dev",
    "agent-server:build": "cd agent-server && npm run build",
    "db:migrate": "node scripts/migrate.js",
    "test": "vitest",
    "test:e2e": "tsx tests/support/browser-agent/e2e-runner.ts",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

### 15.3 Code Signing (macOS)

```bash
# Development (ad-hoc signing)
tauri build

# Production (requires Apple Developer account)
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
export APPLE_ID="your@email.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"

tauri build --bundles dmg
```

### 15.4 Auto-Update

```typescript
// src-tauri/src/updater.rs

use tauri::updater::UpdateBuilder;

pub async fn check_for_updates(app: &tauri::AppHandle) -> Result<bool, String> {
    let update = UpdateBuilder::new()
        .current_version(&app.package_info().version)
        .build()
        .await
        .map_err(|e| e.to_string())?;
    
    if let Some(update) = update {
        // Notify user of available update
        app.emit("update-available", update.version())
            .map_err(|e| e.to_string())?;
        return Ok(true);
    }
    
    Ok(false)
}
```

---

## 16. File Structure

```
orion/
├── .claude/                      # Claude configuration
│   ├── agents/                   # Agent prompts
│   │   ├── butler.md
│   │   ├── triage.md
│   │   ├── scheduler.md
│   │   └── communicator.md
│   └── settings.json
│
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   ├── components/               # React components
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities
│   ├── stores/                   # Zustand stores
│   └── types/                    # TypeScript types
│
├── src-tauri/                    # Tauri backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── commands.rs          # IPC commands
│   │   ├── database.rs          # SQLite operations
│   │   └── agent_server.rs      # Server management
│   ├── tauri.conf.json          # Tauri config
│   ├── Cargo.toml
│   └── Entitlements.plist       # macOS entitlements
│
├── agent-server/                 # Agent backend
│   ├── src/
│   │   ├── index.ts             # Entry point
│   │   ├── routes.ts            # HTTP/SSE endpoints
│   │   ├── agents/              # Agent implementations
│   │   └── tools/               # Tool handlers
│   └── package.json
│
├── orion/                        # PARA file structure
│   ├── projects/
│   ├── areas/
│   ├── resources/
│   │   ├── contacts/
│   │   ├── preferences/
│   │   └── templates/
│   ├── archive/
│   ├── inbox/
│   └── .orion/
│       └── config.yaml
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── migrate.js               # Database migrations
│   └── seed.js                  # Test data seeding
│
├── docs/
│   ├── PRD-orion-personal-butler.md
│   └── TECH-SPEC-orion-personal-butler.md
│
├── thoughts/
│   └── research/                # Research documents
│
├── public/
│   └── icons/
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Appendix A: Migration Scripts

```typescript
// scripts/migrate.js

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(
  process.env.HOME,
  'Library/Application Support/Orion/orion.db'
);

// Ensure directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

// Run migrations
const SCHEMA = fs.readFileSync(
  path.join(__dirname, '../schema.sql'),
  'utf-8'
);

db.exec(SCHEMA);

console.log('Database migrated successfully');
db.close();
```

---

## Appendix B: Environment Variables

```bash
# .env.example

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
COMPOSIO_API_KEY=...

# Database
DATABASE_URL=postgresql://claude:claude_dev@localhost:5432/continuous_claude

# Development
NODE_ENV=development
PORT=3000
AGENT_SERVER_PORT=3001

# Optional: Encryption
# ORION_ENCRYPTION_KEY=  # Auto-generated if not set
```

---

## Appendix C: Pre-Mortem Mitigations

Added 2026-01-13 based on pre-mortem analysis of PRD and Tech Spec.

### C.1 Action Log & Undo System

**Risk Addressed:** No rollback/undo strategy for agent actions.

#### Schema

```sql
-- Add to SQLite schema (Section 4.1)

CREATE TABLE action_log (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,          -- 'file_email', 'create_event', 'send_email', 'update_contact'
    entity_type TEXT NOT NULL,          -- 'inbox_item', 'calendar_event', 'task', 'contact'
    entity_id TEXT NOT NULL,
    agent_id TEXT,                       -- Which agent performed action
    previous_state TEXT,                 -- JSON snapshot before action
    new_state TEXT,                      -- JSON snapshot after action
    reversible INTEGER DEFAULT 1,        -- 0 for sent emails, deleted items
    reversed_at TEXT,                    -- Timestamp if undone
    expires_at TEXT,                     -- When undo expires (e.g., 24 hours)
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_action_log_entity ON action_log(entity_type, entity_id);
CREATE INDEX idx_action_log_created ON action_log(created_at DESC);
CREATE INDEX idx_action_log_reversible ON action_log(reversible, reversed_at);
```

#### Implementation

```typescript
// src/lib/action-log.ts

import { db } from './tauri';
import { nanoid } from 'nanoid';

export interface ActionLogEntry {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  agent_id?: string;
  previous_state: unknown;
  new_state: unknown;
  reversible: boolean;
  created_at: string;
}

export async function logAction(
  action_type: string,
  entity_type: string,
  entity_id: string,
  previous_state: unknown,
  new_state: unknown,
  options: { agent_id?: string; reversible?: boolean } = {},
): Promise<string> {
  const id = `act_${nanoid(12)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  await db.actionLog.create({
    id,
    action_type,
    entity_type,
    entity_id,
    agent_id: options.agent_id,
    previous_state: JSON.stringify(previous_state),
    new_state: JSON.stringify(new_state),
    reversible: options.reversible !== false ? 1 : 0,
    expires_at: expiresAt,
  });

  return id;
}

export async function undoAction(actionId: string): Promise<boolean> {
  const action = await db.actionLog.get(actionId);

  if (!action || !action.reversible || action.reversed_at) {
    return false;
  }

  // Check expiration
  if (new Date(action.expires_at) < new Date()) {
    return false;
  }

  // Restore previous state based on entity type
  const previousState = JSON.parse(action.previous_state);

  switch (action.entity_type) {
    case 'inbox_item':
      await db.inbox.update(action.entity_id, previousState);
      break;
    case 'task':
      await db.tasks.update(action.entity_id, previousState);
      break;
    case 'calendar_event':
      // For external events, need to call Composio
      await calendar.updateEvent(action.entity_id, previousState);
      break;
    default:
      console.warn(`Unknown entity type for undo: ${action.entity_type}`);
      return false;
  }

  // Mark as reversed
  await db.actionLog.update(actionId, { reversed_at: new Date().toISOString() });

  return true;
}

export async function getLastUndoableAction(): Promise<ActionLogEntry | null> {
  const actions = await db.actionLog.list({
    reversible: true,
    reversed_at: null,
    limit: 1,
    orderBy: 'created_at DESC',
  });

  return actions[0] || null;
}
```

#### Keyboard Shortcut

```typescript
// src/hooks/useKeyboardShortcuts.ts

useEffect(() => {
  const handleKeyDown = async (e: KeyboardEvent) => {
    // Cmd+Z for undo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      const lastAction = await getLastUndoableAction();
      if (lastAction) {
        const success = await undoAction(lastAction.id);
        if (success) {
          toast.success(`Undone: ${formatActionType(lastAction.action_type)}`);
        }
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### C.2 Rate Limiter for Composio

**Risk Addressed:** Composio rate limits unknown, UX degrades when limited.

#### Schema

```sql
-- Add to SQLite schema (Section 4.1)

CREATE TABLE tool_rate_limits (
    tool_name TEXT PRIMARY KEY,
    requests_per_minute INTEGER DEFAULT 60,
    burst_limit INTEGER DEFAULT 10,
    current_count INTEGER DEFAULT 0,
    window_start TEXT,
    last_limited_at TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);
```

#### Implementation

```typescript
// src/lib/rate-limiter.ts

interface RateLimitConfig {
  requestsPerMinute: number;
  burstLimit: number;
}

interface RateLimitState {
  currentCount: number;
  windowStart: number;
  lastLimitedAt?: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  gmail: { requestsPerMinute: 60, burstLimit: 10 },
  googlecalendar: { requestsPerMinute: 100, burstLimit: 20 },
  slack: { requestsPerMinute: 50, burstLimit: 10 },
};

class RateLimiter {
  private state: Map<string, RateLimitState> = new Map();
  private queue: Map<string, Array<() => Promise<void>>> = new Map();

  constructor(private config: Record<string, RateLimitConfig> = DEFAULT_LIMITS) {}

  canProceed(toolName: string): boolean {
    const config = this.config[toolName] || { requestsPerMinute: 30, burstLimit: 5 };
    const state = this.getState(toolName);
    const now = Date.now();

    // Reset window if minute has passed
    if (now - state.windowStart >= 60000) {
      state.currentCount = 0;
      state.windowStart = now;
    }

    return state.currentCount < config.requestsPerMinute;
  }

  recordRequest(toolName: string): void {
    const state = this.getState(toolName);
    state.currentCount++;
    this.state.set(toolName, state);
  }

  recordLimited(toolName: string): void {
    const state = this.getState(toolName);
    state.lastLimitedAt = Date.now();
    this.state.set(toolName, state);
  }

  getWaitTime(toolName: string): string {
    const state = this.getState(toolName);
    const now = Date.now();
    const windowEnd = state.windowStart + 60000;
    const waitMs = Math.max(0, windowEnd - now);

    if (waitMs < 1000) return 'a moment';
    if (waitMs < 60000) return `${Math.ceil(waitMs / 1000)} seconds`;
    return `${Math.ceil(waitMs / 60000)} minutes`;
  }

  private getState(toolName: string): RateLimitState {
    if (!this.state.has(toolName)) {
      this.state.set(toolName, {
        currentCount: 0,
        windowStart: Date.now(),
      });
    }
    return this.state.get(toolName)!;
  }
}

export const rateLimiter = new RateLimiter();

// Rate-limit aware wrapper
export async function withRateLimit<T>(
  toolName: string,
  fn: () => Promise<T>,
  priority: 'user' | 'background' = 'background',
): Promise<T> {
  // User-initiated actions get priority
  if (priority === 'user' || rateLimiter.canProceed(toolName)) {
    rateLimiter.recordRequest(toolName);
    try {
      return await fn();
    } catch (error: any) {
      if (error?.code === 429) {
        rateLimiter.recordLimited(toolName);
        throw new RateLimitError(toolName, rateLimiter.getWaitTime(toolName));
      }
      throw error;
    }
  } else {
    throw new RateLimitError(toolName, rateLimiter.getWaitTime(toolName));
  }
}

export class RateLimitError extends Error {
  constructor(
    public toolName: string,
    public waitTime: string,
  ) {
    super(`Rate limited for ${toolName}. Try again in ${waitTime}.`);
    this.name = 'RateLimitError';
  }
}
```

#### Updated Inbox Sync

```typescript
// src/lib/inbox-sync.ts (updated)

import { rateLimiter, withRateLimit, RateLimitError } from './rate-limiter';

async function syncInbox() {
  try {
    // Check rate limit before starting
    if (!rateLimiter.canProceed('gmail')) {
      showNotification({
        type: 'info',
        title: 'Sync Paused',
        message: `Gmail sync will resume in ${rateLimiter.getWaitTime('gmail')}`,
        duration: 5000,
      });
      return;
    }

    const result = await withRateLimit('gmail', () =>
      gmail.getEmails({ query: 'is:unread', maxResults: 50 }),
      'background'
    );

    // Process results...

  } catch (error) {
    if (error instanceof RateLimitError) {
      showNotification({
        type: 'warning',
        title: 'Sync Paused',
        message: error.message,
        duration: 10000,
      });
    } else {
      console.error('Inbox sync error:', error);
    }
  }
}
```

### C.3 Phase Updates

These mitigations are added to the implementation phases:

| Phase | Addition |
|-------|----------|
| Phase 1 | Add `action_log` table, implement `logAction()` and `undoAction()`, add Cmd+Z handler |
| Phase 2 | Add `tool_rate_limits` table, implement `RateLimiter`, update inbox sync with rate awareness |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Engineering Team | Initial tech spec created |
| 1.1 | 2026-01-13 | Engineering Team | Added pre-mortem mitigations (Appendix C) |

---

*This technical specification provides the implementation blueprint for Orion Personal Butler. For product requirements, see `PRD-orion-personal-butler.md`. For research details, see documents in `thoughts/research/`.*
