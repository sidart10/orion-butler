---
stepsCompleted:
  - executive-summary
  - product-overview
  - user-journeys
  - harness-architecture
  - extension-points
  - reference-implementation
  - technical-requirements
  - ux-ui-requirements
  - success-metrics
  - implementation-phases
  - risks-mitigations
inputDocuments: []
classification:
  domain: productivity
  projectType: desktop-app
  framework: tauri-nextjs
workflowType: prd
---

# Product Requirements Document: Orion Harness

**Version:** 2.0.2-draft
**Status:** Draft (Validated)
**Date:** 2026-01-20
**Author:** Product Team

### Document History

| Version | Date | Changes |
|---------|------|---------|
| 2.0-draft | 2026-01-20 | **Major pivot**: Reframed from "Butler Product" to "Claude Agent SDK Harness". New architecture emphasizes SDK-first design with extensions (skills, agents, hooks, MCP, tools) as the core product. |
| 2.0.1-draft | 2026-01-20 | **Composio correction**: Fixed Composio integration from MCP to SDK-direct. Slimmed §6 Butler Plugin to reference existing research files. |
| 2.0.2-draft | 2026-01-20 | **Validation fixes**: Resolved all Composio MCP→SDK terminology inconsistencies (10 occurrences). Fixed implementation leakage in FR-4.2, FR-1.7, NFR-2.9, NFR-6.1. Improved NFR measurability (NFR-2.5, 2.6, 3.1, 3.6, 5.6, 6.10). |
| 1.4 | 2026-01-20 | Added §5.4 Claude Agent SDK Harness (CC v3 Infrastructure) |
| 1.3 | 2026-01-15 | Expanded §6.5 with Claude Agent SDK capabilities |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary) ✅
2. [Product Overview](#2-product-overview) ✅
3. [User Journeys](#3-user-journeys) ✅
4. [Harness Architecture](#4-harness-architecture) ✅
5. [Extension Points](#5-extension-points) ✅
6. [Reference Implementation: Butler Plugin](#6-reference-implementation-butler-plugin) ✅
7. [Technical Requirements](#7-technical-requirements) ✅
8. [UX/UI Requirements](#8-uxui-requirements) ✅
9. [Success Metrics](#9-success-metrics) ✅
10. [Implementation Phases](#10-implementation-phases) ✅
11. [Risks & Mitigations](#11-risks--mitigations) ✅
12. [Functional Requirements](#12-functional-requirements) → See [functional-requirements-extracted.md](functional-requirements-extracted.md)
13. [Non-Functional Requirements](#13-non-functional-requirements) → See [nfr-extracted-from-prd-v2.md](nfr-extracted-from-prd-v2.md)

---

## 1. Executive Summary

### 1.1 Product Vision

Orion is a **Claude Agent SDK harness** that brings the power of Claude Code to knowledge workers. Just as Claude Code transformed software development with autonomous coding assistance, Orion transforms personal productivity with autonomous life/work management.

**Core Insight:** Claude Code proved that Claude + Skills + Hooks + Subagents + MCP = transformative productivity. Orion packages this same architecture for everyone, not just developers.

### 1.2 What is a Harness?

A harness is infrastructure that maximizes an SDK's capabilities while remaining extensible:

| Claude Code | Orion |
|-------------|-------|
| Harness for **developers** | Harness for **knowledge workers** |
| Codebase as agent context | PARA filesystem as agent context |
| Terminal/IDE interface | GTD-style desktop interface |
| Coding skills & agents | Life/work skills & agents |
| Native tools (bash, filesystem) | Native + Composio (500+ web apps) |

### 1.3 Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    ORION HARNESS                           │
│                                                            │
│  Claude Agent SDK (all features)                           │
│  ├── Skills (standalone or bundled in plugins)             │
│  ├── Agents (standalone or bundled in plugins)             │
│  ├── Hooks (standalone or bundled in plugins)              │
│  ├── MCP Servers (Composio + native)                       │
│  ├── Tools (SDK native + custom)                           │
│  └── Plugin System (marketplace distribution)              │
│                                                            │
│  PARA Filesystem (agent context & organization)            │
│  GTD UI Layer (Tauri desktop)                              │
└────────────────────────────────────────────────────────────┘
```

### 1.4 Key Differentiators

1. **SDK-First Architecture**: Every Claude Agent SDK feature is exposed and usable
2. **Extension Points**: Skills, agents, hooks, MCP, tools - all pluggable
3. **Plugin Distribution**: Bundle extensions for sharing via marketplace
4. **PARA for Agents**: Structured filesystem gives agents organized context
5. **GTD for Users**: Clean interface without needing to understand PARA
6. **Composio Integration**: 500+ web apps as MCP tools
7. **Desktop Native**: Full macOS integration via Tauri

### 1.5 Target User

Primary: Knowledge workers who want an autonomous AI assistant with the power of Claude Code but for life/work management, not coding.

Secondary: Developers who want to build custom plugins/skills for the Orion platform.

---

## 2. Product Overview

### 2.1 What is Orion?

Orion is a **macOS desktop application** that wraps the Claude Agent SDK into a complete harness for knowledge workers. It provides:

1. **Full SDK Access**: Every Claude Agent SDK feature (skills, hooks, agents, MCP, tools, sessions)
2. **Extension Architecture**: Add capabilities via standalone files or plugin bundles
3. **PARA Filesystem**: Organized context for agents (Projects, Areas, Resources, Archive)
4. **GTD Interface**: Clean user experience (Inbox, Next Actions, Projects, Waiting, Someday)
5. **Composio SDK**: 500+ web app integrations (Gmail, Calendar, Slack, Notion, etc.)
6. **Native Desktop Tools**: Filesystem, bash, and app control via SDK

### 2.2 Harness vs Application

| Layer | What It Is | Examples |
|-------|------------|----------|
| **Harness** (Orion core) | Infrastructure that maximizes SDK | SDK wrapper, extension points, plugin system, PARA, GTD UI |
| **Extensions** (standalone) | Individual capabilities | A skill file, an agent definition, a hook |
| **Plugins** (bundled) | Packaged extensions for distribution | `orion-butler-plugin` with 5 skills + 3 agents + 4 hooks |

**Key Insight**: Extensions can exist standalone OR be bundled into plugins. Plugins are just the marketplace/distribution mechanism.

### 2.3 Extension Points

Orion exposes these Claude Agent SDK extension points:

| Extension | Location | Standalone | Via Plugin |
|-----------|----------|------------|------------|
| **Skills** | `/.claude/skills/*.md` | ✅ | ✅ |
| **Agents** | `/.claude/agents/*.md` | ✅ | ✅ |
| **Hooks** | `/.claude/hooks/hooks.json` | ✅ | ✅ |
| **MCP Servers** | `/.mcp.json` | ✅ | ✅ |
| **Tools** | SDK native or custom | Built-in | ✅ |
| **Commands** | `/.claude/commands/*.md` | ✅ | ✅ |

### 2.4 PARA: Agent Context Layer

PARA is the filesystem structure that gives agents organized context:

```
~/Orion/
├── projects/      # Active work with deadlines (agent writes here)
├── areas/         # Ongoing responsibilities (agent organizes here)
├── resources/     # Reference material (agent stores here)
├── archive/       # Completed/inactive (agent moves here)
└── inbox/         # Unprocessed items (agent triages from here)
```

**Important**: PARA is for the AGENTS, not the user. Users see GTD.

### 2.5 GTD: User Interface Layer

Users interact through a GTD-style interface:

| GTD View | Maps To | User Action |
|----------|---------|-------------|
| **Inbox** | `~/Orion/inbox/` | Capture, clarify |
| **Next Actions** | Tasks with `status: next` | Do now |
| **Projects** | `~/Orion/projects/` | Multi-step outcomes |
| **Waiting For** | Tasks with `status: waiting` | Delegated/blocked |
| **Someday/Maybe** | `~/Orion/areas/someday/` | Future ideas |
| **Calendar** | Google Calendar via Composio | Time-bound |
| **Chat** | Agent conversation | Natural language |

### 2.6 What's NOT in Scope (MVP)

| Out of Scope | Rationale | Future |
|--------------|-----------|--------|
| Plugin marketplace UI | Focus on harness first | v1.1 |
| Multi-user/team | Single-user MVP | v2.0 |
| Mobile app | Desktop-first | Post-MVP |
| Windows/Linux | macOS quality first | v1.5 |
| Custom model training | Too complex | v2.0 |

### 2.7 What IS the MVP

| Must Have | Description |
|-----------|-------------|
| **SDK Wrapper** | All Claude Agent SDK features accessible |
| **Extension Points** | Skills, agents, hooks, MCP, tools all work |
| **PARA Filesystem** | Agent context organized |
| **GTD UI** | Basic inbox, projects, chat views |
| **Composio SDK** | Gmail, Calendar working |
| **One Reference Plugin** | Butler skills/agents to prove architecture |

---

## 3. User Journeys

This section defines user journeys for both primary users (knowledge workers) and secondary users (developers/extenders). The journeys demonstrate patterns that are replicable across any domain.

### 3.1 User Types

| User Type | Description | Primary Goal |
|-----------|-------------|--------------|
| **Knowledge Worker** | Non-technical user seeking AI-assisted productivity | Get things done without learning technical systems |
| **Power User** | Technical user who customizes their setup | Optimize workflows with custom skills/agents |
| **Developer** | Builder creating extensions for Orion | Build and distribute new capabilities |

### 3.2 Knowledge Worker Journeys (MVP)

These journeys are delivered via the Butler plugin. They demonstrate meta-skill patterns replicable for any domain.

---

#### UJ-1: Morning Briefing

**Trigger:** User opens Orion at start of day, or says "start my day"

**Flow:**
1. Agent activates `morning-briefing` skill
2. Spawns `triage` subagent → fetches calendar, scores emails
3. Spawns `scheduler` subagent → identifies time blocks
4. Synthesizes into briefing with top 3 priorities
5. Presents in GTD-organized format

**Success State:** User knows what to focus on today without manually checking calendar, email, and tasks.

**Meta-Pattern:** `[trigger] → [spawn specialists] → [synthesize] → [present]`

---

#### UJ-2: Inbox Triage

**Trigger:** User says "check inbox", "what's urgent", or `/inbox` command

**Flow:**
1. Agent activates `inbox-triage` skill
2. Fetches unread emails via Composio (Gmail)
3. Spawns `triage` subagent with read-only mode
4. Scores each item (0.0-1.0) based on sender, urgency, action required
5. Suggests filing location (PARA path, invisible to user)
6. Presents sorted list with recommended actions
7. User approves/modifies; agent executes

**Success State:** Inbox processed, urgent items surfaced, actions queued.

**Meta-Pattern:** `[fetch] → [score/prioritize] → [suggest actions] → [user approval] → [execute]`

---

#### UJ-3: Schedule Meeting

**Trigger:** User says "schedule lunch with Omar" or `/schedule`

**Flow:**
1. Agent activates `calendar-manage` skill
2. Spawns `scheduler` subagent
3. Checks user's calendar availability
4. Checks attendee availability (if accessible)
5. Applies user preferences (no mornings, focus time blocks)
6. Spawns inline **Calendar Canvas** with time options
7. User selects time
8. Agent creates event via Composio (Google Calendar)

**Success State:** Meeting scheduled with minimal user effort.

**Meta-Pattern:** `[interpret intent] → [check constraints] → [present options via canvas] → [execute on approval]`

---

#### UJ-4: Draft Communication

**Trigger:** User says "email Omar about the project" or `/email`

**Flow:**
1. Agent activates `email-compose` skill
2. Loads contact context and prior communication history
3. Spawns `communicator` subagent (Opus for quality)
4. Analyzes user's writing style from past emails
5. Generates draft matching tone
6. Spawns inline **Email Canvas** with draft
7. User reviews/edits
8. User approves send; agent sends via Composio

**Success State:** Email sent that sounds like the user wrote it.

**Meta-Pattern:** `[load context] → [generate draft] → [canvas for review] → [send on approval]`

---

#### UJ-5: Capture & Organize

**Trigger:** User types anything into "New Inbox" (quick capture)

**Flow:**
1. User captures thought: "Call dentist tomorrow"
2. Agent parses intent using routing skill
3. Determines: actionable? multi-step? waiting on someone?
4. Routes to appropriate GTD category:
   - Single action → Next Actions
   - Multi-step → Creates Project
   - Waiting → Waiting For
   - Future/maybe → Someday
5. Writes to PARA filesystem (invisible to user)
6. Updates GTD sidebar

**Success State:** Captured item appears in correct GTD bucket without user categorization.

**Meta-Pattern:** `[capture] → [parse intent] → [classify] → [route to PARA] → [reflect in GTD UI]`

---

#### UJ-6: Weekly Review

**Trigger:** User says "weekly review" or `/review`, typically Sunday

**Flow:**
1. Agent activates `weekly-review` skill
2. Guides user through GTD review steps:
   - Review completed items (celebrate wins)
   - Process remaining inbox items
   - Review all projects for stuck items
   - Review Waiting For items for follow-ups
   - Review Someday/Maybe for promotion
3. Spawns subagents for each review phase
4. Generates review summary
5. Suggests next week's priorities

**Success State:** All GTD buckets reviewed, stuck items identified, next week planned.

**Meta-Pattern:** `[structured workflow] → [step-by-step guidance] → [subagent per phase] → [summary]`

---

### 3.3 Developer Journeys

These journeys enable the extensibility that makes Orion a platform, not just an app.

---

#### UJ-7: Create Custom Skill

**Trigger:** Developer wants to add a capability (e.g., "Summarize Slack channel")

**Flow:**
1. Create `.claude/skills/slack-summary/SKILL.md`
2. Define activation (keywords, commands)
3. Specify tools needed (`mcp__composio__slack_*`)
4. Write skill instructions
5. Test with `/slack-summary` command
6. Skill automatically loads on next session

**Success State:** New skill works, activates on keywords/commands.

**Extensibility Pattern:** File-based, no code compilation, hot-reload.

---

#### UJ-8: Create Custom Agent

**Trigger:** Developer needs a specialist subagent (e.g., "Legal document reviewer")

**Flow:**
1. Create `.claude/agents/legal-reviewer.md`
2. Define persona, model, allowed tools
3. Define output schema (structured response)
4. Test by having main agent spawn via Task tool
5. Agent available for skills to use

**Success State:** Specialist agent spawns correctly, returns structured output.

**Extensibility Pattern:** Declarative agent definition, structured outputs.

---

#### UJ-9: Build Meta-Skill (Compose Skills)

**Trigger:** Developer combines multiple skills into workflow (e.g., "CRM Update" = fetch email + update Salesforce + notify Slack)

**Flow:**
1. Create orchestrating skill that references other skills
2. Define trigger and workflow steps
3. Each step can spawn different subagents
4. Define hand-off points and error handling
5. Test end-to-end

**Success State:** Multi-step workflow executes as single user action.

**Extensibility Pattern:** Skills can invoke skills; agents can spawn agents.

---

#### UJ-10: Package & Distribute Plugin

**Trigger:** Developer wants to share their skills/agents with others

**Flow:**
1. Bundle skills, agents, hooks into plugin structure
2. Create `.claude-plugin/plugin.json` manifest
3. Declare dependencies (Composio connections, etc.)
4. Publish to repository (GitHub, future marketplace)
5. Others install via `/plugin install`

**Success State:** Plugin installable by others, works on their Orion instance.

**Extensibility Pattern:** Git-based distribution, declarative dependencies.

---

### 3.4 Meta-Skill Architecture Pattern

All knowledge worker journeys follow a composable pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                        META-SKILL                               │
│                                                                 │
│   [Trigger] → [Skill Activation] → [Subagent Orchestration]    │
│                                          │                      │
│                    ┌─────────────────────┼─────────────────┐   │
│                    ▼                     ▼                 ▼   │
│               [Specialist]         [Specialist]      [Specialist]│
│                    │                     │                 │   │
│                    └─────────────────────┴─────────────────┘   │
│                                          │                      │
│                                    [Synthesize]                 │
│                                          │                      │
│                    [Canvas/UI] ←─────────┘                     │
│                         │                                       │
│                   [User Approval]                               │
│                         │                                       │
│                    [Execute]                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Any domain (Salesforce, healthcare, legal) can follow this pattern:
1. Define domain-specific skills
2. Define specialist subagents
3. Compose into meta-skills
4. Eventually, the agent learns to compose new meta-skills autonomously

---

### 3.5 Journey-to-Requirement Traceability

| Journey | Maps to FRs |
|---------|-------------|
| UJ-1 Morning Briefing | FR-1.x (briefing generation) |
| UJ-2 Inbox Triage | FR-2.x (email processing) |
| UJ-3 Schedule Meeting | FR-3.x (calendar management) |
| UJ-4 Draft Communication | FR-4.x (email composition) |
| UJ-5 Capture & Organize | FR-5.x (GTD routing) |
| UJ-6 Weekly Review | FR-6.x (review workflow) |
| UJ-7-10 Developer Journeys | FR-7.x (extensibility) |

---

## 4. Harness Architecture

The Orion Harness wraps the Claude Agent SDK to expose all its capabilities while adding knowledge-worker-specific infrastructure.

### 4.1 Claude Agent SDK Wrapper

Orion wraps the SDK to provide:

| SDK Feature | Orion Exposure | Implementation |
|-------------|----------------|----------------|
| **Sessions** | Full access | Named sessions (daily, project, inbox) with resume |
| **Streaming** | Full access | Real-time responses in GTD UI |
| **Tools** | Full access | SDK native + MCP servers |
| **Subagents** | Full access | Via Task tool, directory-based handoff |
| **Hooks** | Full access | All hook events exposed |
| **Skills** | Full access | Skill files loaded from `.claude/skills/` |
| **Plugins** | Full access | Plugin install/manage via CLI or UI |
| **MCP** | Full access | Composio + custom servers |
| **Structured Outputs** | Full access | Type-safe agent responses |
| **Extended Thinking** | Full access | Complex reasoning when needed |
| **Prompt Caching** | Full access | Cost optimization |
| **Context Compaction** | Enhanced | PARA-preserving summaries |

**Philosophy**: If the SDK supports it, Orion exposes it. No features hidden.

### 4.2 Session Management

Sessions enable conversation continuity and context isolation.

**Session Types:**

| Type | Naming | Use Case | Behavior |
|------|--------|----------|----------|
| **Daily** | `orion-daily-2026-01-20` | General work | Auto-resume same day |
| **Project** | `orion-project-{slug}` | Focused project work | Persist across days |
| **Inbox** | `orion-inbox-2026-01-20` | Triage context | Fresh each day |
| **Ad-hoc** | `orion-adhoc-{uuid}` | One-off queries | No resume |

**Session Capabilities:**

```typescript
// Resume an existing session
const session = await orion.getOrCreateSession({
  type: 'daily',
  resume: true  // Continue if exists
});

// Fork for "what-if" scenarios
const fork = await session.fork();

// Export for audit/handoff
const transcript = await session.export('jsonl');
```

**Storage:**
```
~/.orion/sessions/
├── orion-daily-2026-01-20.jsonl
├── orion-project-q4-expansion.jsonl
└── sessions-index.json  # Metadata for search
```

### 4.3 Permission System

Orion uses SDK permission modes with knowledge-worker defaults.

**Permission Modes by Context:**

| Context | Mode | Behavior |
|---------|------|----------|
| **Chat (default)** | `default` | Reads auto, writes prompt |
| **Triage skill** | `plan` | Read-only analysis |
| **Calendar skill** | `default` → `acceptEdits` | Prompt time, then auto-create |
| **Email skill** | `default` | Drafts auto, sends prompt |
| **Research skill** | `plan` | Search only |

**Auto-Approve Rules (via hooks):**

| Rule | Tools | Action |
|------|-------|--------|
| Read operations | `gmail_get_*`, `calendar_list_*` | Auto-allow |
| PARA filesystem | Read/Write in `~/Orion/` | Auto-allow |
| Write operations | `gmail_send_*`, `calendar_create_*` | Prompt user |
| Sensitive files | `.env`, `*secret*`, `*credential*` | Block |
| Dangerous bash | `rm -rf`, `sudo`, `chmod 777` | Block |

### 4.4 Context Compaction

Long sessions (50+ email triage) hit context limits. Orion enhances SDK compaction to preserve PARA structure.

**Compaction Strategy:**

| Preserve | Discard | Rationale |
|----------|---------|-----------|
| Active projects list | Old email threads | Projects = current focus |
| User preferences | Completed inbox items | Preferences persist |
| PARA structure summary | Raw tool outputs | Structure aids reasoning |
| Current session goals | Superseded decisions | Goals guide actions |

**Custom Summary Format:**

```xml
<orion_context_summary>
  <para_state>
    <projects count="3">Q4 Expansion, Website Redesign, Hiring</projects>
    <inbox_pending>7 items</inbox_pending>
  </para_state>
  <user_preferences>
    <pref key="email_tone">professional but warm</pref>
    <pref key="meeting_times">prefer afternoons</pref>
  </user_preferences>
  <session_progress>
    <processed>42 items</processed>
    <pending_actions>3</pending_actions>
  </session_progress>
</orion_context_summary>
```

### 4.5 PARA Filesystem Integration

PARA gives agents organized, persistent context.

**Directory Structure:**

```
~/Orion/
├── projects/
│   ├── q4-expansion/
│   │   ├── _meta.yaml        # Project metadata
│   │   ├── notes.md          # Agent notes
│   │   ├── tasks.yaml        # Task list
│   │   └── artifacts/        # Related files
│   └── website-redesign/
├── areas/
│   ├── career/
│   ├── health/
│   ├── finance/
│   └── someday/              # GTD "Someday/Maybe"
├── resources/
│   ├── contacts/             # Contact cards
│   ├── templates/            # Reusable templates
│   └── references/           # General reference
├── archive/
│   └── 2026-01/              # Archived by month
└── inbox/
    ├── email/                # Unprocessed emails
    ├── tasks/                # Captured tasks
    └── notes/                # Quick captures
```

**Agent Access Pattern:**

```typescript
// Agents read/write to PARA via SDK tools
const projectContext = await read('~/Orion/projects/q4-expansion/_meta.yaml');
const tasks = await read('~/Orion/projects/q4-expansion/tasks.yaml');

// After processing
await write('~/Orion/projects/q4-expansion/notes.md', agentNotes);
```

### 4.6 GTD UI Shell

The UI is a thin GTD layer over PARA + agent chat.

**Core Views:**

| View | Source | Primary Action |
|------|--------|----------------|
| **Inbox** | `~/Orion/inbox/*` + Composio sync | Process items |
| **Next Actions** | Tasks with `status: next` | Do/delegate |
| **Projects** | `~/Orion/projects/` | Review progress |
| **Waiting** | Tasks with `status: waiting` | Follow up |
| **Someday** | `~/Orion/areas/someday/` | Review monthly |
| **Calendar** | Google Calendar via Composio | Schedule |
| **Chat** | Agent session | Natural language |

**UI Responsibilities:**
- Render PARA data in GTD format
- Provide chat interface to agent
- Show agent activity (collapsible)
- Handle permissions prompts
- Display tool call results

**UI Does NOT:**
- Contain business logic
- Make decisions
- Process data (that's the agent's job)

### 4.7 Composio SDK Integration

Composio is a **platform + SDK** that provides 850+ toolkits and 11,000+ tools across 500+ apps. It is NOT just an MCP server—it's a unified tool infrastructure with OAuth management, multi-tenant support, and native SDK bindings.

**Integration Pattern (SDK-Direct):**

```typescript
// Direct SDK integration - recommended for Orion
import { ComposioToolSet } from 'composio-anthropic';

const toolset = new ComposioToolSet();

// Get tools in Claude format, scoped to user
const butlerTools = await toolset.getTools({
  toolkits: ['GMAIL', 'GOOGLECALENDAR', 'SLACK'],
  userId: currentUserId  // Multi-tenant isolation
});

// Pass directly to Claude SDK - no MCP intermediary
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  tools: butlerTools,
  messages: [{ role: 'user', content: prompt }]
});

// Handle tool calls
for (const block of response.content) {
  if (block.type === 'tool_use') {
    const result = await toolset.handleToolCall(block);
  }
}
```

**Why SDK-Direct over MCP:**

| SDK-Direct | MCP Wrapper |
|------------|-------------|
| Native Anthropic SDK integration | Extra hop through MCP protocol |
| Dynamic tool loading by user | Static tool registration |
| Per-user OAuth isolation via `userId` | Single connection context |
| Direct tool execution | JSON-RPC intermediary |
| Framework-native patterns | Protocol translation overhead |

**Tool Router (Dynamic Discovery):**

Composio's Tool Router enables natural language tool discovery:

```typescript
// Dynamic search for tools
const tools = await composio.tools.get({
  userId: currentUserId,
  search: 'send email or schedule meeting'  // Natural language
});
```

**Authentication Management:**

Composio handles all OAuth complexity:
- Token storage and encryption
- Automatic token refresh
- Multi-account per service (work Gmail + personal Gmail)
- Scope management

```bash
# CLI authentication setup
composio login
composio add gmail -e "default"
composio add googlecalendar -e "default"
```

**Core Integrations (MVP):**

| Integration | Priority | Key Tools |
|-------------|----------|-----------|
| Gmail | P0 | `GMAIL_FETCH_EMAILS`, `GMAIL_SEND_EMAIL`, `GMAIL_SEARCH` |
| Google Calendar | P0 | `GOOGLECALENDAR_EVENTS_LIST`, `GOOGLECALENDAR_CREATE_EVENT` |
| Slack | P1 | `SLACK_SEND_MESSAGE`, `SLACK_SEARCH_MESSAGES` |

**Details:** See [composio-deep-dive.md](../research/composio-deep-dive.md) and [composio-claude-sdk-architecture.md](../research/composio-claude-sdk-architecture.md)

---

## 5. Extension Points

Orion exposes all Claude Agent SDK extension mechanisms. Extensions can be **standalone** (single files) or **bundled** (plugins for distribution).

### 5.1 Skills

Skills are modular knowledge units that activate based on context.

**Skill File Structure:**

```
.claude/skills/
├── morning-briefing/
│   └── SKILL.md
├── inbox-triage/
│   └── SKILL.md
└── calendar-manage/
    └── SKILL.md
```

**SKILL.md Format:**

```markdown
---
name: inbox-triage
description: Process and prioritize inbox items
activation:
  keywords: ["inbox", "triage", "email priority", "what's urgent"]
  commands: ["/inbox", "/triage"]
tools: [mcp__composio__gmail_*, Read, Write]
---

# Inbox Triage Skill

You are processing the user's inbox...

## Steps
1. Fetch unread emails via Composio
2. Score priority based on sender, urgency, action required
3. Present sorted list with recommended actions
...
```

**Activation Methods:**

| Method | Example | Behavior |
|--------|---------|----------|
| **Command** | `/inbox` | Explicit invocation |
| **Keyword** | "triage my inbox" | Auto-suggest or auto-activate |
| **Hook** | SessionStart | Inject skill context |
| **Agent** | Subagent prompt includes skill | Delegated activation |

### 5.2 Agents (Subagents)

Agents are specialized personas that can be spawned via the Task tool.

**Agent File Structure:**

```
.claude/agents/
├── triage.md
├── scheduler.md
├── communicator.md
└── researcher.md
```

**Agent Definition Format:**

```markdown
---
name: triage
description: Inbox processing and priority scoring
model: sonnet  # or opus, haiku
tools: [mcp__composio__gmail_*, Read, Grep, Glob]
---

# Triage Agent

You are a specialist in processing inboxes...

## Output Format

Return structured triage results:

```yaml
items:
  - id: email_123
    priority: 0.85
    urgency: high
    action: respond_today
    suggested_response: "Acknowledge receipt..."
```

## Constraints
- Read-only mode (no sending)
- Score all items before returning
- Explain priority reasoning
```

**Spawning Agents:**

```typescript
// Main agent spawns triage agent
await task({
  subagent_type: "triage",
  prompt: "Process these 10 inbox items: ...",
  // Results written to .claude/cache/agents/triage/output/
});
```

**Directory-Based Handoff:**

Subagents write to files instead of returning large outputs:

```
.claude/cache/agents/
├── triage/
│   └── output/
│       ├── summary.md      # 2KB for main context
│       └── full-results.json  # 70KB if needed
├── scheduler/
│   └── output/
└── communicator/
    └── output/
```

### 5.3 Hooks

Hooks intercept SDK events for validation, context injection, and logging.

**Hook Events:**

| Event | When | Use Cases |
|-------|------|-----------|
| **SessionStart** | Session begins | Load user context, preferences |
| **SessionEnd** | Session ends | Save learnings, cleanup |
| **PreToolUse** | Before tool executes | Permissions, input modification |
| **PostToolUse** | After tool executes | Logging, result processing |
| **SubagentStart** | Before subagent spawns | Inject context, set budgets |
| **SubagentStop** | After subagent completes | Aggregate results |
| **PreCompact** | Before context compaction | Preserve important context |
| **PermissionRequest** | Tool needs approval | Custom approval flows |

**Hook Registration (hooks.json):**

```json
{
  "hooks": {
    "SessionStart": [{
      "type": "command",
      "command": "node .claude/hooks/dist/load-context.mjs"
    }],
    "PreToolUse": [{
      "matcher": "mcp__composio__gmail_send*",
      "type": "command",
      "command": "node .claude/hooks/dist/permission-check.mjs"
    }],
    "PostToolUse": [{
      "matcher": "mcp__composio__*",
      "type": "command",
      "command": "node .claude/hooks/dist/audit-log.mjs"
    }]
  }
}
```

**Hook Input/Output:**

```typescript
// Hook receives JSON on stdin
interface HookInput {
  event: string;
  tool?: string;
  input?: object;
  session?: { id: string; history: Message[] };
}

// Hook outputs JSON on stdout
interface HookOutput {
  decision?: "allow" | "block";
  reason?: string;
  systemMessage?: string;  // Inject into Claude context
  updatedInput?: object;   // Modify tool input
}
```

### 5.4 MCP Servers

MCP servers provide additional tools beyond SDK natives and Composio.

**Note:** Composio uses SDK-direct integration (§4.7), not MCP. MCP servers are for other tool sources.

**Configuration (.mcp.json):**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem", "~/Orion"]
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-sqlite", "~/.orion/orion.db"]
    },
    "custom-server": {
      "command": "node",
      "args": [".claude/mcp/my-server.mjs"]
    }
  }
}
```

**Server Types:**

| Type | Protocol | Example |
|------|----------|---------|
| **stdio** | JSON-RPC over stdin/stdout | Filesystem, SQLite |
| **HTTP** | REST/SSE | Custom web servers |
| **Custom** | Your implementation | Project-specific tools |

### 5.5 Tools

Tools are the atomic operations agents can perform.

**Tool Sources:**

| Source | Examples | Configuration |
|--------|----------|---------------|
| **SDK Native** | Bash, Read, Write, Edit, Glob, Grep | Built-in |
| **Composio SDK** | Gmail, Calendar, Slack, Notion | `composio-anthropic` package |
| **MCP Servers** | Filesystem, SQLite | `.mcp.json` |
| **Custom** | Project-specific tools | MCP server or SDK extension |

**SDK Native Tools (always available):**

| Tool | Purpose |
|------|---------|
| `Bash` | Shell commands |
| `Read` | Read files |
| `Write` | Write files |
| `Edit` | Edit files |
| `Glob` | Find files by pattern |
| `Grep` | Search file contents |
| `Task` | Spawn subagents |
| `AskUserQuestion` | Get user input |
| `TodoWrite` | Track tasks |

### 5.6 Commands

Commands are slash-invoked shortcuts.

**Command File Structure:**

```
.claude/commands/
├── briefing.md
├── inbox.md
└── weekly-review.md
```

**Command Format:**

```markdown
---
name: briefing
description: Generate morning briefing
---

Generate a morning briefing that includes:
1. Today's calendar events
2. Urgent inbox items
3. Tasks due today
4. Weather summary

Use the morning-briefing skill for detailed instructions.
```

**Invocation:**

```
User: /briefing
→ Command expands to full prompt
→ May activate associated skill
```

### 5.7 Plugin System

Plugins bundle multiple extensions for distribution.

**Plugin Structure:**

```
my-butler-plugin/
├── .claude-plugin/
│   └── plugin.json         # Manifest (required)
├── commands/
│   ├── briefing.md
│   └── triage.md
├── agents/
│   ├── triage.md
│   └── scheduler.md
├── skills/
│   ├── inbox-triage/
│   │   └── SKILL.md
│   └── calendar-manage/
│       └── SKILL.md
├── hooks/
│   └── hooks.json
├── .mcp.json               # MCP servers
└── README.md
```

**Plugin Manifest (plugin.json):**

```json
{
  "name": "orion-butler",
  "version": "1.0.0",
  "description": "Personal butler for knowledge workers",
  "author": "Sid",
  "requires": {
    "orion": ">=1.0.0",
    "composio": ["gmail", "google-calendar"]
  }
}
```

**Plugin Operations:**

| Operation | Command | Effect |
|-----------|---------|--------|
| **Install** | `/plugin install owner/repo` | Clone and activate |
| **List** | `/plugin list` | Show installed plugins |
| **Remove** | `/plugin remove name` | Uninstall |
| **Update** | `/plugin update name` | Pull latest |

**Plugin Scopes:**

| Scope | Location | Visibility |
|-------|----------|------------|
| **User** | `~/.claude/plugins/` | All projects |
| **Project** | `.claude/plugins/` | This project (shared via git) |
| **Local** | `.claude/plugins-local/` | This project (gitignored) |

### 5.8 Extension Standalone vs Bundled

**Key Insight**: You don't need a plugin to add capabilities.

| Want To | Standalone | Plugin |
|---------|------------|--------|
| Add one skill | Create `.claude/skills/my-skill/SKILL.md` | Overkill |
| Add one agent | Create `.claude/agents/my-agent.md` | Overkill |
| Add one hook | Edit `.claude/hooks/hooks.json` | Overkill |
| Share 5 skills + 3 agents + hooks | Create a plugin | ✅ Right choice |
| Distribute to marketplace | Must be a plugin | ✅ Required |

**Plugins are for distribution, not required for extension.**

---

## 6. Reference Implementation: Butler Plugin

The Butler Plugin demonstrates how to build a complete assistant on the Orion Harness. It's the "knowledge worker" personality - but it's **just a plugin**, not core product.

### 6.1 Overview

**Name:** `orion-butler`
**Purpose:** Personal assistant for knowledge workers

| Type | Summary |
|------|---------|
| **Skills** | 5 core skills: morning briefing, inbox triage, calendar, email compose, weekly review |
| **Agents** | 4 specialist agents: Triage, Scheduler, Communicator, Researcher |
| **Hooks** | 4 hooks: context loader, permission checker, audit logger, preference sync |
| **Commands** | 6 slash commands: /briefing, /inbox, /schedule, /email, /review, /preferences |

### 6.2 Agents

**Repurposed from Claude Code (16 agents):**
- `oracle` - External research (reuse as-is)
- `maestro` - Multi-agent coordination (reuse as-is)
- `scribe` - Documentation/handoffs (reuse as-is)
- `architect` → `planner` - Workflow planning (adapt prompts)
- `scout` → `navigator` - Personal data navigation (adapt prompts)
- And 11 more...

**New domain-specific agents (10 needed):**
- `calendar-coordinator` - Schedule conflicts, time blocking
- `email-triager` - Priority scoring, action extraction
- `task-breaker` - Goal decomposition
- `reminder-agent` - Context-aware reminders
- And 6 more...

**Details:** See [agents-analysis.md](../research/agents-analysis.md)

### 6.3 Skills

**Reusable from Claude Code (70%):**
- `workflow-router` - Goal-based orchestration (100% reusable)
- `recall` / `remember` - Semantic memory (100% reusable)
- `research`, `plan-agent`, `discovery-interview` - Planning/research (90% reusable)
- Infrastructure skills like handoffs, ledgers, context isolation

**New skill domains needed:**
- Calendar & Scheduling
- Email Management
- Task Prioritization
- GTD Routing

**Details:** See [skills-analysis.md](../research/skills-analysis.md)

### 6.4 Hooks

Butler hooks use standard Claude Agent SDK hook patterns:

| Hook | Event | Purpose |
|------|-------|---------|
| Context Loader | `SessionStart` | Inject user preferences, projects, calendar |
| Permission Checker | `PreToolUse` | Auto-allow reads, prompt for writes |
| Audit Logger | `PostToolUse` | Log external tool calls |
| Preference Sync | `SessionEnd` | Save learned preferences |

**Implementation:** Built using `/hook-developer` skill when harness is ready.

### 6.5 Commands

| Command | Purpose |
|---------|---------|
| `/briefing` | Daily overview with priorities |
| `/inbox` | Process and prioritize inbox |
| `/schedule` | Schedule meetings |
| `/email` | Draft emails matching user tone |
| `/review` | GTD weekly review |
| `/preferences` | View/edit user preferences |

### 6.6 Why Butler is a Plugin, Not Core

| If Butler were core... | As a plugin... |
|------------------------|----------------|
| Every user gets Butler whether they want it or not | Users install what they need |
| Butler logic couples with harness | Clean separation |
| Can't swap Butler for different assistant | Swap in `sales-assistant` or `developer-butler` |
| Hard to customize | Fork and modify freely |
| Updates require harness update | Update plugin independently |

**The harness is the platform. Butler is one application on that platform.**

### 6.7 Implementation Approach

Butler agents, skills, and hooks will be built using:
- `/skill-developer` - For creating skill files
- `/hook-developer` - For creating hook implementations
- `/sub-agents` - For defining agent personas

These tools ensure consistent structure and avoid manual template duplication.

**Research References:**
- [agents-analysis.md](../research/agents-analysis.md) - Full analysis of 27 agents, reuse strategy
- [skills-analysis.md](../research/skills-analysis.md) - Full analysis of skills, adaptation plan
- [composio-deep-dive.md](../research/composio-deep-dive.md) - Composio SDK integration patterns

---

## 7. Technical Requirements

Technical requirements focused on harness infrastructure, not application features.

### 7.1 Platform

**Target:** macOS Desktop (Tauri 2.0)

| Requirement | Specification |
|-------------|---------------|
| **Framework** | Tauri 2.0 + Next.js 15 + React 19 |
| **OS** | macOS 12 (Monterey) or later |
| **RAM** | 4GB minimum, 8GB recommended |
| **Disk** | 200MB for application |
| **Network** | Required for Claude API and Composio |

**Why Tauri:**
- Native performance (Rust backend)
- Small bundle (~15MB vs Electron ~150MB)
- Security model (capability-based permissions)
- Future mobile support

### 7.2 Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION                           │
│  Tauri Window → Next.js → React Components                  │
│  GTD views, chat interface, settings                        │
├─────────────────────────────────────────────────────────────┤
│                      HARNESS CORE                           │
│  Claude Agent SDK Wrapper                                   │
│  ├── Session Manager                                        │
│  ├── Extension Loader (skills, agents, hooks, MCP)          │
│  ├── Permission Engine                                      │
│  └── PARA Filesystem Bridge                                 │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                             │
│  SQLite (local app data) + PARA filesystem                  │
│  PostgreSQL (semantic memory - optional)                    │
├─────────────────────────────────────────────────────────────┤
│                      EXTERNAL                               │
│  Claude API | Composio SDK | Native Tools                   │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Claude Agent SDK Integration

**Model:** Claude Opus 4 (claude-opus-4-20250514) or Sonnet 4

**SDK Features Used:**

| Feature | Use | Configuration |
|---------|-----|---------------|
| **Sessions** | Conversation continuity | Named sessions with resume |
| **Streaming** | Real-time responses | Default enabled |
| **Tools** | All actions | SDK native + MCP |
| **Subagents** | Delegation | Task tool with agents |
| **Hooks** | Events | All hook types |
| **Skills** | Knowledge | `.claude/skills/` |
| **Plugins** | Distribution | `.claude/plugins/` |
| **MCP** | External tools | Composio + custom |
| **Structured Outputs** | Type safety | Zod schemas |
| **Extended Thinking** | Complex reasoning | Budget-based |
| **Prompt Caching** | Cost savings | TTL-based |

### 7.4 Data Storage

#### 7.4.1 SQLite (Local Application)

**Location:** `~/.orion/orion.db`

**Tables (simplified):**

```sql
-- Session metadata
sessions (id, type, name, last_active, context_summary)

-- User preferences
preferences (key, value, source, confidence, updated_at)

-- Action audit log
action_log (id, tool, input_hash, output_summary, session_id, created_at)

-- Plugin registry
plugins (name, version, scope, installed_at, enabled)
```

#### 7.4.2 PARA Filesystem

**Location:** `~/Orion/`

**Purpose:** Agent context and organization (see §3.5)

#### 7.4.3 PostgreSQL (Optional - Semantic Memory)

**Purpose:** Embeddings for semantic search

**When needed:** If using memory/recall features

**Tables:**
```sql
-- Learnings with embeddings
archival_memory (id, content, context, embedding vector(1024), created_at)
```

### 7.5 Tool Integration Configuration

**Tool Sources:**

| Source | Type | Purpose |
|--------|------|---------|
| **Composio SDK** | Direct SDK | Gmail, Calendar, Slack (500+ apps) - see §4.7 |
| **Filesystem MCP** | stdio | Extended file operations |
| **SQLite MCP** | stdio | Local database queries |

**Composio SDK Configuration:**

```typescript
// lib/composio/client.ts
import { ComposioToolSet } from 'composio-anthropic';

const toolset = new ComposioToolSet({
  apiKey: process.env.COMPOSIO_API_KEY
});

// Get tools for current user
const tools = await toolset.getTools({
  toolkits: ['GMAIL', 'GOOGLECALENDAR'],
  userId: currentUserId
});
```

**MCP Servers (for non-Composio tools):**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem", "~/Orion"]
    }
  }
}
```

### 7.6 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| **API Keys** | Stored in macOS Keychain, never in files |
| **Permissions** | SDK permission modes + custom hooks |
| **Sensitive Files** | Blocked by PreToolUse hook |
| **Audit Trail** | All external tool calls logged |
| **Data Location** | Local-first, user controls cloud sync |

### 7.7 Performance Targets

| Metric | Target |
|--------|--------|
| **App Launch** | < 3 seconds to interactive |
| **First Token** | < 500ms after send (p95) |
| **Tool Call** | < 2s for Composio operations |
| **Session Resume** | < 1s to restore context |
| **Memory Usage** | < 500MB typical |

### 7.8 Dependencies

**Core:**

| Package | Purpose |
|---------|---------|
| `@anthropic-ai/claude-code` | Agent SDK |
| `@tauri-apps/api` | Desktop integration |
| `next` | React framework |
| `better-sqlite3` | Local database |
| `zod` | Schema validation |

**UI:**

| Package | Purpose |
|---------|---------|
| `tailwindcss` | Styling |
| `shadcn/ui` | Component library |
| `@tiptap/*` | Rich text editing |

### 7.9 Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...      # Claude API
COMPOSIO_API_KEY=...               # Composio SDK

# Optional
ORION_DATA_DIR=~/Orion             # PARA location (default: ~/Orion)
ORION_LOG_LEVEL=info               # Logging verbosity

# Development
ORION_DEV_MODE=true                # Enable dev features
```

---

## 8. UX/UI Requirements

The Orion UI is **conversation-first**. Every interaction is an "inbox" (conversation) that the agent processes, organizes, and routes. The UI is a thin shell that renders conversations and spawns contextual canvas when needed.

### 8.1 Core Philosophy

**Inbox-First, Agent-Organized**

| Principle | Meaning |
|-----------|---------|
| **Everything is a conversation** | New task, note, question, project—all start as an "inbox" |
| **Agent routes and organizes** | Butler decides: task? project? note? waiting? |
| **GTD is the view, not the input** | User captures freely; agent categorizes into GTD |
| **Canvas spawns contextually** | Rich UI appears inline when the conversation needs it |
| **Start minimal, expand later** | No dedicated pages until proven necessary |

**Anti-patterns we're avoiding:**

| Don't | Why |
|-------|-----|
| Separate "Chat" page | Chat IS the product, not a feature |
| Manual GTD categorization | Agent should handle this |
| Feature-rich GTD app | Notion/Things already exist |
| Forcing users to learn PARA | PARA is for agents, GTD is for users |

### 8.2 Shell Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [≡]  ORION                                          [⌘K] [⚙️]    │
├──────────────────────┬─────────────────────────────────────────────┤
│                      │                                             │
│  + New Inbox         │         CONVERSATION + CANVAS               │
│  ════════════════    │                                             │
│                      │  [Current inbox/conversation displayed      │
│  📥 INBOX (3)    [▼] │   here with inline canvas when needed]      │
│     └─ Quick thought │                                             │
│     └─ Voice memo    │                                             │
│     └─ Screenshot    │                                             │
│                      │                                             │
│  ⚡ NEXT (5)     [▼] │                                             │
│     └─ Reply Omar    │                                             │
│     └─ Book dentist  │                                             │
│                      │                                             │
│  📁 PROJECTS     [▼] │                                             │
│     └─ Q4 Expansion  │                                             │
│     └─ Website redo  │                                             │
│                      │                                             │
│  ⏳ WAITING (2)  [▼] │                                             │
│     └─ Contractor    │                                             │
│                      │                                             │
│  💭 SOMEDAY      [▼] │                                             │
│     └─ Learn piano   │                                             │
│                      │                                             │
│  [◀ Collapse]        │                                             │
└──────────────────────┴─────────────────────────────────────────────┘
```

**Key elements:**

| Element | Behavior |
|---------|----------|
| **+ New Inbox** | Creates new conversation (capture anything) |
| **GTD Sections** | Collapsible, show agent-organized conversations |
| **Conversation list** | Each item is a conversation thread |
| **Main area** | Selected conversation + inline canvas |
| **Collapse toggle** | Sidebar collapses for focus mode |

**Layout Variables (CSS):**

```css
--orion-sidebar-width: 280px;
--orion-sidebar-collapsed: 0px;  /* Full collapse */
--orion-content-max-width: 850px;
```

### 8.3 The Inbox Model

Every interaction starts as a new "inbox"—a conversation that gets processed and organized.

**Inbox Lifecycle:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CAPTURE    │ ──▶ │   PROCESS   │ ──▶ │  ORGANIZE   │
│             │     │             │     │             │
│ User creates│     │ Agent asks  │     │ Agent moves │
│ new inbox   │     │ clarifying  │     │ to GTD slot │
│             │     │ questions   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
              ⚡ NEXT                    📁 PROJECTS                 💭 SOMEDAY
           (actionable)              (multi-step)               (future)
```

**What can be captured:**

| Input Type | Example | Agent Routes To |
|------------|---------|-----------------|
| Task | "Call dentist tomorrow" | Next Actions |
| Project idea | "Plan Q4 expansion" | Projects |
| Quick note | "Remember: Omar's birthday 3/15" | Resources (notes) |
| Question | "What's on my calendar?" | Processes inline, no filing |
| Delegation | "Waiting for contractor quote" | Waiting For |
| Someday | "Maybe learn piano" | Someday/Maybe |

**Inbox doesn't mean email.** It's the GTD concept: anything captured that needs processing.

### 8.4 Conversation Interface

The main area displays the selected conversation.

**Anatomy:**

```
┌────────────────────────────────────────────────────────────────┐
│  📁 Q4 Expansion                              [Archive] [···]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  You: Plan the Q4 expansion project                            │
│                                                                │
│  ┌─ 🤖 Butler ─────────────────────────────────────────────┐   │
│  │ This looks like a project. Let me help you structure it.│   │
│  │                                                         │   │
│  │ I've created a project workspace. Here are the key      │   │
│  │ questions to answer:                                    │   │
│  │                                                         │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ 📋 PROJECT CANVAS                                   │ │   │
│  │ │                                                     │ │   │
│  │ │ **Goal:** ____________________                      │ │   │
│  │ │ **Timeline:** ____________________                  │ │   │
│  │ │ **Key milestones:**                                 │ │   │
│  │ │   □ ____________________                            │ │   │
│  │ │   □ ____________________                            │ │   │
│  │ │                                                     │ │   │
│  │ │ [+ Add milestone]                                   │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │ What's the main goal for this expansion?                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Type a message...                              [Send]   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Purpose |
|-----------|---------|
| **Header** | Conversation title, GTD status, actions |
| **Message thread** | User + agent messages, chronological |
| **Inline canvas** | Rich UI spawned by agent when needed |
| **Input bar** | Text input, `/command` support |

### 8.5 Canvas System

Canvas is rich UI that spawns **inline within a conversation** when the context requires it.

**Canvas Types:**

| Canvas | Triggered When | What It Shows |
|--------|----------------|---------------|
| **Calendar Picker** | Scheduling request | Available time slots, conflict warnings |
| **Email Composer** | Drafting email | To/Subject/Body with tone controls |
| **Project Board** | Project planning | Goals, milestones, tasks |
| **Task List** | Multiple action items | Checkable task list |
| **File Preview** | Discussing a document | Document viewer/editor |
| **Contact Card** | Person mentioned | Contact details, recent interactions |
| **Approval Card** | Permission needed | Action details + Allow/Deny/Edit |

**Canvas Behavior:**

| Behavior | Description |
|----------|-------------|
| **Spawns inline** | Appears within message thread, not separate page |
| **Agent-triggered** | Agent decides when canvas is needed |
| **Interactive** | User can interact (pick time, edit draft, check tasks) |
| **Persists in thread** | Canvas state saved with conversation |
| **Collapsible** | Can minimize if conversation continues |

**Example: Scheduling Canvas**

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 SCHEDULE: Lunch with Omar                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Available slots (next 7 days):                             │
│                                                             │
│  ○ Tue 1/21  12:00 PM - 1:00 PM  ✓ Omar free               │
│  ○ Wed 1/22  12:30 PM - 1:30 PM  ✓ Omar free               │
│  ● Thu 1/23  1:00 PM - 2:00 PM   ✓ Omar free  ← selected   │
│                                                             │
│  Duration: [1 hour ▼]   Location: [Suggest ▼]              │
│                                                             │
│  [Cancel]                              [Create Event]       │
└─────────────────────────────────────────────────────────────┘
```

### 8.6 GTD Sidebar Organization

The sidebar shows conversations organized by GTD status. **Agent does the categorization, not the user.**

**GTD Categories:**

| Category | Icon | Contains | Auto-moves When |
|----------|------|----------|-----------------|
| **Inbox** | 📥 | Unprocessed conversations | New capture |
| **Next** | ⚡ | Actionable items | Agent identifies clear next action |
| **Projects** | 📁 | Multi-step outcomes | Agent identifies project scope |
| **Waiting** | ⏳ | Delegated/blocked | Agent detects dependency on others |
| **Someday** | 💭 | Future/maybe items | User or agent marks "not now" |

**Sidebar Interactions:**

| Action | Behavior |
|--------|----------|
| **Click item** | Opens conversation in main area |
| **Collapse section** | Hides items, shows count badge |
| **Collapse sidebar** | Full focus mode, main area expands |
| **Drag item** | Manual override of GTD category (rare) |

**Section Behavior:**

```
📁 PROJECTS (3)     [▼ expanded]
   └─ Q4 Expansion        ● active conversation
   └─ Website Redesign
   └─ Hiring Plan

📁 PROJECTS (3)     [▶ collapsed]
```

### 8.7 Agent Activity Display

Users can see what the agent is doing, but it's not intrusive.

**Progressive Disclosure:**

| Level | What's Shown | Toggle |
|-------|--------------|--------|
| **Hidden** | Nothing (just agent response) | Default for simple responses |
| **Summary** | "Checking calendar... ✓" | Auto-shown during processing |
| **Expanded** | Tool inputs/outputs | Click to expand |

**Activity Indicator (during processing):**

```
┌─ 🤖 Butler ─────────────────────────────────────────────────┐
│                                                             │
│  ⏳ Working on it...                                        │
│                                                             │
│  ├─ ✓ Checking your calendar                               │
│  ├─ ✓ Looking up Omar's availability                       │
│  └─ ⏳ Finding optimal times...                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.8 Permission Flow

When agent needs approval for sensitive actions:

**Inline Approval Card:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📤 PERMISSION REQUIRED                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Send email to omar@samba.tv?                               │
│                                                             │
│  Subject: Lunch Thursday?                                   │
│  Preview: "Hey Omar, want to grab lunch Thursday at 1pm?    │
│            I found a good spot near the office..."          │
│                                                             │
│  [View Full]                                                │
│                                                             │
│         [Deny]        [Edit Draft]        [Send]            │
└─────────────────────────────────────────────────────────────┘
```

**Permission States:**

| State | Visual | Next |
|-------|--------|------|
| **Pending** | Yellow border, buttons active | User decides |
| **Approved** | Green checkmark, "Sent ✓" | Action executed |
| **Denied** | Red X, "Cancelled" | Agent acknowledges |
| **Edited** | Opens editor canvas | User modifies, then approves |

### 8.9 Design Language

**Editorial Luxury** - Premium feel without productivity app clutter.

| Element | Specification |
|---------|---------------|
| **Typography** | Playfair Display (headings), Inter (body) |
| **Colors** | Cream background, charcoal text, gold accents |
| **Spacing** | Generous whitespace, content breathes |
| **Borders** | Sharp geometry, 0px border-radius |
| **Motion** | Subtle, luxury easing |

**Reference:** Full design system at `design-system/README.md`

### 8.10 Responsive Behavior

| Breakpoint | Sidebar | Conversation |
|------------|---------|--------------|
| **Desktop** (≥1280px) | Fixed 280px | Centered, max 850px |
| **Laptop** (1024-1279px) | Collapsible | Full width |
| **Tablet/Mobile** (< 1024px) | Hidden (swipe to reveal) | Full width |

### 8.11 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ N` | New inbox |
| `⌘ K` | Command palette |
| `⌘ [` | Collapse sidebar |
| `⌘ ↑/↓` | Navigate conversations |
| `⌘ Enter` | Send message |
| `Esc` | Close canvas / collapse activity |

### 8.12 Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard navigation** | Full tab order, visible focus rings |
| **Screen reader** | ARIA labels, semantic HTML, live regions for agent activity |
| **Color contrast** | WCAG AA minimum (4.5:1) |
| **Reduced motion** | Respect `prefers-reduced-motion` |
| **Font scaling** | Relative units, 200% zoom support |

### 8.13 UI Responsibilities

**The UI DOES:**
- Render conversations in GTD-organized sidebar
- Display conversation thread with inline canvas
- Show agent activity (progressive disclosure)
- Handle permission prompts inline
- Route `/commands` to skills
- Provide capture input ("New Inbox")

**The UI does NOT:**
- Decide GTD categorization (agent does)
- Contain business logic
- Make routing decisions
- Process or transform data
- Directly call external APIs

**Principle:** The UI is a viewport into agent-organized conversations, not a productivity application.

### 8.14 Future Expansion

Start minimal. Add pages only when conversation + canvas model proves insufficient.

| Potential Future Page | Add When |
|-----------------------|----------|
| **Calendar view** | Users need week-at-a-glance beyond conversation |
| **Project dashboard** | Projects need birds-eye progress view |
| **Settings** | Preferences outgrow inline configuration |
| **Connections** | OAuth management needs dedicated flow |

**Rule:** If it can be a canvas, don't make it a page.

---

## 9. Success Metrics

Success for a harness is measured in layers: platform health, extension usage, and ecosystem growth. These metrics focus on **harness capabilities**, not application features.

### 9.1 Success Framework

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: ECOSYSTEM (Month 3+)                                  │
│  Plugins shared, community extensions, marketplace activity     │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: ORCHESTRATION (Month 1)                               │
│  PARA working invisibly, agents routing correctly, canvas live  │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: HARNESS HEALTH (Week 1)                               │
│  SDK working, MCP connected, skills/hooks/tools operational     │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Week 1: Harness Foundation

**Goal:** Core harness operational with all SDK features accessible.

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **SDK Connection** | Claude API responding | Successful API call |
| **Composio SDK** | Gmail + Calendar connected | OAuth complete, tools visible |
| **Skills Loading** | 100% of skills load without error | Startup log clean |
| **Hooks Firing** | All registered hooks execute | Hook execution log |
| **Session Persistence** | Resume conversation next day | Session restore works |
| **Basic Chat** | User can converse with agent | Round-trip message success |
| **Command Invocation** | `/command` activates skill | Command → skill mapping |

**Week 1 Success Statement:**
> "I can open Orion, start a conversation, use `/commands`, and the agent can read my Gmail and Calendar via Composio. Sessions persist across restarts."

### 9.3 Month 1: Invisible Orchestration

**Goal:** PARA filesystem working automatically—user captures, agent organizes.

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Inbox Processing** | Agent correctly categorizes 80%+ of inputs | Manual review of 20 captures |
| **Project Detection** | Multi-step items → Projects folder | Check `~/Orion/projects/` |
| **Resource Filing** | Notes/references → Resources | Check `~/Orion/resources/` |
| **Task Extraction** | Action items → Next Actions | GTD sidebar accuracy |
| **Waiting Detection** | Delegated items → Waiting | Agent identifies dependencies |
| **Subagent Spawning** | Butler spawns triage/scheduler correctly | Agent handoff logs |
| **Hook Orchestration** | Context loader, permission checker working | Hook execution traces |
| **User Unawareness** | User doesn't need to know PARA exists | No manual filing required |

**Month 1 Success Statement:**
> "I capture anything—task, note, project idea—and the agent routes it to the right place. I see GTD categories in the sidebar, but I never manually organize into PARA. It just works."

### 9.4 Month 3: Full Experience

**Goal:** Canvas system live, polish complete, ready for others.

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Canvas Spawning** | Calendar/Email/Project canvas appear when needed | Context-appropriate UI |
| **Canvas Interaction** | User can pick times, edit drafts, check tasks | Interactive canvas works |
| **Permission Flow** | Approval cards work smoothly | Allow/Deny/Edit flow complete |
| **Daily Usage** | Using Orion instead of raw Claude Code for personal tasks | Self-reported |
| **Custom Skills** | Created 3+ custom skills for personal workflow | Skill files exist |
| **Plugin Structure** | Butler plugin properly packaged | Plugin manifest valid |
| **Shareable** | Someone else could install and run | Install instructions work |

**Month 3 Success Statement:**
> "Orion is my daily driver for personal productivity. Canvas appears when I schedule or draft emails. I've built custom skills. The Butler plugin is packaged and someone else could install it."

### 9.5 Technical Health Metrics

Ongoing metrics for harness reliability:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **API Latency (p95)** | < 500ms first token | > 1s |
| **Session Resume** | < 1s to restore | > 3s |
| **MCP Connection** | 99% uptime | Any disconnect |
| **Skill Load Time** | < 100ms per skill | > 500ms |
| **Hook Execution** | < 50ms per hook | > 200ms |
| **Error Rate** | < 1% of interactions | > 5% |
| **Memory Usage** | < 500MB typical | > 1GB |

### 9.6 Extension Health Metrics

Metrics for the extension system:

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Skills Loaded** | All registered skills load | Startup validation |
| **Agents Available** | All agent definitions valid | Schema validation |
| **Hooks Registered** | All hooks in hooks.json fire | Event coverage |
| **MCP Servers** | All configured servers connect | Connection status |
| **Plugin Integrity** | Installed plugins pass validation | Manifest + dependency check |

### 9.7 User Experience Metrics

Qualitative metrics for the human experience:

| Metric | Target | How to Assess |
|--------|--------|---------------|
| **Capture Friction** | < 2 seconds to start new inbox | Time from ⌘N to typing |
| **Agent Understanding** | Agent interprets intent correctly 90%+ | Review misunderstandings |
| **Organization Accuracy** | Items land in correct GTD category 80%+ | Spot-check sidebar |
| **Permission Clarity** | User understands what they're approving | No confused approvals |
| **Canvas Usefulness** | Canvas helps vs. hinders | Would user prefer plain text? |

### 9.8 What We're NOT Measuring (MVP)

These are Butler plugin metrics, not harness metrics:

| NOT Measuring | Why |
|---------------|-----|
| Emails triaged per day | Butler feature, not harness |
| Meetings scheduled | Butler feature |
| Tasks completed | Application outcome |
| Time saved | Hard to measure, subjective |
| NPS score | No users yet |

**Focus:** Is the harness working? Is the orchestration invisible? Can it be extended?

### 9.9 Success Milestones Summary

| Milestone | Date | Gate |
|-----------|------|------|
| **Week 1** | +7 days | SDK + Composio + Skills/Hooks working |
| **Month 1** | +30 days | PARA orchestration invisible to user |
| **Month 3** | +90 days | Canvas + polish + shareable plugin |

---

## 10. Implementation Phases

Implementation follows a harness-first approach: build the platform, then the Butler plugin. Each phase has clear gates before proceeding.

### 10.1 Tech Stack

**Core:**

| Layer | Technology | Why |
|-------|------------|-----|
| **Agent Runtime** | [Claude Agent SDK (TypeScript Stable)](https://platform.claude.com/docs/en/agent-sdk/typescript) | Production-ready, full SDK features: sessions, tools, hooks, skills, subagents, MCP, plugins |
| **Desktop Shell** | Tauri 2.0 | Native macOS, small bundle (~15MB), Rust backend, future mobile |
| **Frontend** | Next.js 15 + React 19 | App Router, Server Components, streaming |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| **Local Database** | SQLite (better-sqlite3) | Sessions, preferences, audit log |
| **External Tools** | Composio SDK | Gmail, Calendar, Slack (500+ apps via `composio-anthropic`) |

**Important:** We use the **Claude Agent SDK (stable v1)**, not the Anthropic API directly or the unstable v2 preview.

**SDK Documentation:**
- [TypeScript SDK Reference (Stable)](https://platform.claude.com/docs/en/agent-sdk/typescript) - Production-ready, complete API

**Why Stable v1 over V2 Preview:**
- V2 is marked "unstable preview - APIs may change"
- V1 has all features we need (sessions, subagents, hooks, MCP, plugins)
- V1 includes session forking for "what-if" scenarios
- Lower risk of breaking changes during development

**Key SDK Features We Use:**

| Feature | SDK API | Our Use |
|---------|---------|---------|
| **Query** | `query({ prompt, options })` | Main interaction loop (async generator) |
| **Sessions** | `options.resume` | Persist conversations across restarts |
| **Session Forking** | `options.forkSession` | "What-if" scenarios (v1 only) |
| **Agents** | `options.agents` + `AgentDefinition` | Triage, Scheduler, Communicator subagents |
| **Hooks** | `options.hooks` + `HookEvent` types | Context loading, permissions, audit |
| **MCP** | `options.mcpServers` | Composio (Gmail, Calendar) via SSE |
| **Permissions** | `options.permissionMode` + `canUseTool` | User approval flow |
| **Tools** | `options.tools` (preset or array) | Claude Code tools + MCP |
| **System Prompt** | `options.systemPrompt` (preset + append) | Butler personality |
| **Settings** | `options.settingSources: ['project']` | Load CLAUDE.md, skills |
| **Plugins** | `options.plugins` | Butler plugin loading |
| **Streaming** | `AsyncGenerator<SDKMessage>` | Real-time UI updates |
| **Structured Output** | `options.outputFormat` | Type-safe agent responses |
| **Extended Thinking** | `options.maxThinkingTokens` | Complex reasoning |
| **Budget Control** | `options.maxBudgetUsd` | API cost limits per query |

**Hook Events Available (all 12):**
- `SessionStart` / `SessionEnd` - Session lifecycle
- `PreToolUse` / `PostToolUse` / `PostToolUseFailure` - Tool interception
- `SubagentStart` / `SubagentStop` - Subagent lifecycle
- `PermissionRequest` - Custom permission handling
- `UserPromptSubmit` - Input preprocessing
- `PreCompact` - Context compaction control
- `Notification` / `Stop` - System events

### 10.2 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 0          PHASE 1           PHASE 2              PHASE 3           │
│  Foundation       Harness           Orchestration        Canvas            │
│  (Week 0)         (Week 1)          (Month 1)            (Month 3)         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tauri shell      Agent SDK         PARA filesystem      Canvas system     │
│  Next.js app      Composio SDK      GTD sidebar          Interactive UI    │
│  Basic chat       Skills/hooks      Agent routing        Permission cards  │
│  Message UI       Sessions          Subagents            Polish            │
│                   /commands         Invisible org        Plugin package    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Phase 0: Foundation (Week 0)

**Goal:** Desktop shell with basic chat UI working.

**Deliverables:**

| Component | Description |
|-----------|-------------|
| **Tauri App** | macOS app shell, window management, menu bar |
| **Next.js Frontend** | App Router setup, basic routing |
| **Chat UI** | Message thread, input bar, send button |
| **Layout** | Sidebar + main area structure |
| **Dev Environment** | Hot reload, Tauri dev server |

**Tech Setup:**
```bash
# Tauri 2.0 with Next.js
npx create-tauri-app orion --template next

# Directory structure
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── chat/           # Chat UI
│   └── layout/         # Shell layout
└── lib/                # Utilities
src-tauri/              # Rust backend
```

**Gate:** App launches, can type messages (no agent yet).

---

### 10.4 Phase 1: Harness Core (Week 1)

**Goal:** Claude Agent SDK integrated with all extension points working.

**Deliverables:**

| Component | Description |
|-----------|-------------|
| **SDK Integration** | Claude Agent SDK TypeScript Stable (v1) |
| **Session Manager** | Create, resume, fork sessions |
| **Composio SDK** | Gmail + Calendar via `composio-anthropic` SDK-Direct (not MCP) |
| **Skills Loader** | Load `.claude/skills/*.md` |
| **Hooks System** | Register and fire hooks from `hooks.json` |
| **Commands** | `/command` invokes skills |
| **Streaming** | Real-time agent responses in UI |

**SDK Integration (v1 async generator pattern with Composio SDK-Direct):**

```typescript
// lib/agent/client.ts
import { query } from '@anthropic-ai/claude-agent-sdk';
import { ComposioToolSet } from 'composio-anthropic';

// Initialize Composio SDK (SDK-Direct pattern per §4.7)
const composioToolset = new ComposioToolSet();

// Create a query with full SDK options
export async function* orionQuery(prompt: string, sessionId?: string, userId?: string) {
  // Get Composio tools in Claude format (SDK-Direct, not MCP)
  const composioTools = await composioToolset.getTools({
    toolkits: ['GMAIL', 'GOOGLECALENDAR'],
    userId: userId  // Multi-tenant isolation
  });

  const result = query({
    prompt,
    options: {
      // Model selection
      model: 'claude-sonnet-4-20250514',

      // Session persistence
      resume: sessionId,  // Resume existing session if provided

      // Tools: SDK native + Composio SDK-Direct (NO MCP for Composio)
      tools: [
        { type: 'preset', preset: 'claude_code' },
        ...composioTools  // Composio tools injected directly
      ],

      // Subagent definitions
      agents: {
        triage: {
          description: 'Process and prioritize inbox items',
          prompt: 'You are the Triage agent...',
          model: 'sonnet',
          tools: ['Read', 'Grep', 'GMAIL_FETCH_EMAILS', 'GMAIL_GET_PROFILE'],
        },
        scheduler: {
          description: 'Calendar and time management',
          prompt: 'You are the Scheduler agent...',
          model: 'sonnet',
          tools: ['GOOGLECALENDAR_EVENTS_LIST', 'GOOGLECALENDAR_FREE_BUSY_QUERY'],
        },
      },

      // Hooks (programmatic)
      hooks: {
        SessionStart: [{
          hooks: [loadContextHook],
        }],
        PreToolUse: [{
          matcher: 'GMAIL_SEND_EMAIL',  // Composio SDK tool name (not mcp__ prefix)
          hooks: [permissionCheckHook],
        }],
      },

      // Permissions
      permissionMode: 'default',

      // Load project settings (for CLAUDE.md, skills, etc.)
      settingSources: ['project'],

      // Use Claude Code's system prompt
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: 'You are Orion Butler, a personal assistant...',
      },
    },
  });

  // Handle tool calls (including Composio)
  for await (const message of result) {
    // Composio tool calls are handled via composioToolset.handleToolCall()
    yield message;
  }
}
```

**Hook Registration:**

```json
// .claude/hooks/hooks.json
{
  "hooks": {
    "SessionStart": [{
      "type": "command",
      "command": "node .claude/hooks/dist/load-context.mjs"
    }],
    "PreToolUse": [{
      "matcher": "GMAIL_SEND_EMAIL",
      "type": "command",
      "command": "node .claude/hooks/dist/permission-check.mjs"
    }]
  }
}
```

**Note:** Composio tools use uppercase names like `GMAIL_SEND_EMAIL`, not `mcp__composio__` prefixes, because we use SDK-Direct integration (§4.7).

**Gate:** Can converse with agent, use `/commands`, agent reads Gmail/Calendar, sessions persist.

---

### 10.5 Phase 2: Orchestration (Month 1)

**Goal:** PARA filesystem working invisibly—user captures, agent organizes.

**Deliverables:**

| Component | Description |
|-----------|-------------|
| **PARA Filesystem** | `~/Orion/` with projects/areas/resources/archive/inbox |
| **GTD Sidebar** | Inbox, Next, Projects, Waiting, Someday sections |
| **Agent Routing** | Butler determines where to file captures |
| **Subagent Spawning** | Triage, Scheduler, Communicator agents |
| **Context Loader Hook** | Inject user context at session start |
| **Invisible Organization** | User doesn't know PARA exists |

**PARA Setup:**

```
~/Orion/
├── projects/           # Active multi-step work
│   └── {project-slug}/
│       ├── _meta.yaml  # Project metadata
│       ├── notes.md    # Agent notes
│       └── tasks.yaml  # Task list
├── areas/              # Ongoing responsibilities
│   └── someday/        # GTD Someday/Maybe
├── resources/          # Reference material
│   ├── contacts/       # Contact cards
│   ├── notes/          # Quick notes
│   └── templates/      # Reusable templates
├── archive/            # Completed work
│   └── 2026-01/        # By month
└── inbox/              # Unprocessed captures
```

**Routing Logic (Butler Skill):**

```markdown
# Butler Routing Skill

When user captures something, determine:

1. **Is it actionable?**
   - No → Resource (note) or Someday
   - Yes → Continue

2. **Is it multi-step?**
   - Yes → Create Project in ~/Orion/projects/
   - No → Single task

3. **Can I do it now?**
   - Yes → Next Actions
   - No, waiting on someone → Waiting For
   - No, future → Someday

4. **Does it belong to existing project?**
   - Yes → File under that project
   - No → Standalone or new project

Route silently. User sees GTD categories, not PARA paths.
```

**Subagent Spawning:**

The SDK `agents` option defines available subagents. Claude spawns them via the `Task` tool:

```typescript
// Define agents in SDK options (see Phase 1)
agents: {
  triage: {
    description: 'Process and prioritize inbox items',
    prompt: 'You are the Triage agent. Score each item 0.0-1.0...',
    model: 'sonnet',
    tools: ['Read', 'Grep', 'GMAIL_FETCH_EMAILS', 'GMAIL_GET_PROFILE'],  // Composio SDK tools
  },
}

// Claude will spawn triage agent when needed via Task tool:
// Task({ subagent_type: 'triage', prompt: '...', description: '...' })
```

**AgentDefinition type:**
```typescript
type AgentDefinition = {
  description: string;   // When to use this agent
  prompt: string;        // Agent's system prompt
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
  tools?: string[];      // Allowed tools (inherits all if omitted)
}
```

**Gate:** Capture anything, agent routes correctly 80%+, user never manually organizes.

---

### 10.6 Phase 3: Canvas & Polish (Month 3)

**Goal:** Rich inline UI, permission flow, shareable plugin.

**Deliverables:**

| Component | Description |
|-----------|-------------|
| **Canvas System** | Rich UI spawns inline in conversations |
| **Calendar Canvas** | Time picker with availability |
| **Email Canvas** | Composer with tone controls |
| **Project Canvas** | Goals, milestones, tasks |
| **Permission Cards** | Inline Allow/Deny/Edit flow |
| **Plugin Packaging** | Butler plugin with manifest |
| **Documentation** | Install & extend guide |

**Canvas Implementation:**

```typescript
// Agent can request canvas via structured output
interface CanvasRequest {
  type: 'calendar' | 'email' | 'project' | 'task-list' | 'approval';
  data: CalendarCanvasData | EmailCanvasData | ...;
}

// UI renders canvas inline in message thread
function MessageThread({ messages }) {
  return messages.map(msg => {
    if (msg.canvas) {
      return <InlineCanvas type={msg.canvas.type} data={msg.canvas.data} />;
    }
    return <Message {...msg} />;
  });
}
```

**Permission Card:**

```tsx
// components/canvas/ApprovalCard.tsx
function ApprovalCard({ action, onAllow, onDeny, onEdit }) {
  return (
    <Card className="border-warning">
      <CardHeader>📤 Permission Required</CardHeader>
      <CardContent>
        <p>Send email to {action.recipient}?</p>
        <Preview>{action.body}</Preview>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" onClick={onDeny}>Deny</Button>
        <Button variant="outline" onClick={onEdit}>Edit</Button>
        <Button variant="primary" onClick={onAllow}>Send</Button>
      </CardFooter>
    </Card>
  );
}
```

**Plugin Packaging:**

```json
// .claude-plugin/plugin.json
{
  "name": "orion-butler",
  "version": "1.0.0",
  "description": "Personal assistant for knowledge workers",
  "requires": {
    "orion": ">=1.0.0",
    "composio": ["gmail", "google-calendar"]
  },
  "provides": {
    "skills": 5,
    "agents": 4,
    "hooks": 4,
    "commands": 6
  }
}
```

**Gate:** Canvas spawns contextually, permissions work, plugin installable by others.

---

### 10.7 Dependency Chain

```
Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──▶ Phase 3
  │            │            │            │
  │            │            │            └── Canvas needs routing context
  │            │            └── Routing needs SDK + skills
  │            └── SDK needs shell to run in
  └── Foundation
```

**Parallel Opportunities:**

| Can Parallel | With |
|--------------|------|
| Canvas component stubs | Phase 2 orchestration |
| Design system polish | Any phase |
| Documentation | Any phase |

**Cannot Parallel:**

| Sequential | Why |
|------------|-----|
| SDK integration | Must have shell first |
| PARA routing | Must have SDK + skills first |
| Canvas spawning | Must have routing to know when to spawn |

### 10.8 Phase Gates

| Phase | Gate Criteria | Blocker If |
|-------|---------------|------------|
| **0 → 1** | Tauri app launches, chat UI renders | Can't integrate SDK |
| **1 → 2** | Agent responds, Composio works, skills load | Can't build routing |
| **2 → 3** | Routing works 80%+, GTD sidebar accurate | Canvas has no context |
| **3 → Done** | Canvas works, plugin valid | Not shareable |

### 10.9 Timeline Summary

| Phase | Target | Key Deliverable |
|-------|--------|-----------------|
| **Phase 0** | Week 0 | Tauri + Next.js shell with chat UI |
| **Phase 1** | Week 1 | Claude Agent SDK + Composio + Skills/Hooks |
| **Phase 2** | Month 1 | PARA orchestration, invisible routing |
| **Phase 3** | Month 3 | Canvas system, polish, shareable plugin |

---

## 11. Risks & Mitigations

This section covers risks across technical, business, user experience, security, and scope dimensions. Risks are rated **High/Medium/Low** based on likelihood × impact.

### 11.1 Risk Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RISK CATEGORIES                              │
├─────────────────────────────────────────────────────────────────────┤
│  TECHNICAL          BUSINESS           UX              SECURITY     │
│  SDK stability      API proxy costs    Misrouting      Key storage  │
│  Composio uptime    Abuse prevention   PARA confusion  Permissions  │
│  Tauri maturity     Revenue tracking   Permission UX   Multi-tenant │
├─────────────────────────────────────────────────────────────────────┤
│  SCOPE              DEPENDENCIES       ECOSYSTEM                     │
│  Feature creep      SDK changes        Competition                   │
│  Timeline slip      OAuth changes      Adoption                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 11.2 Technical Risks

#### T1: Claude Agent SDK Changes
**Risk:** MEDIUM | **Likelihood:** Low | **Impact:** Medium

Using stable v1 SDK (not v2 preview) significantly reduces this risk. Breaking changes are rare in stable releases.

| Concern | Mitigation |
|---------|------------|
| API signature changes | Abstract SDK calls behind `lib/agent/client.ts` wrapper |
| Feature deprecation | Use only documented, stable features |
| Behavior changes | Pin SDK version, test before upgrading |

**Monitoring:** Subscribe to Anthropic developer updates, test SDK upgrades in staging.

---

#### T2: Composio SDK Reliability
**Risk:** MEDIUM | **Likelihood:** Medium | **Impact:** Medium

Composio is external infrastructure (via SDK-Direct, not MCP). Downtime = no Gmail/Calendar.

| Concern | Mitigation |
|---------|------------|
| Service outages | Graceful degradation: show "Composio unavailable" in UI |
| Rate limits | Implement backoff, cache recent results |
| OAuth token expiry | Proactive refresh via Composio SDK, clear error messaging |
| Pricing changes | Budget for cost increases, evaluate alternatives (direct OAuth) |

**Fallback:** Users can still chat with agent; external tool calls queue for retry.

---

#### T3: Tauri 2.0 Maturity
**Risk:** LOW | **Likelihood:** Low | **Impact:** Medium

Tauri 2.0 is stable but newer than Electron. Edge cases may emerge.

| Concern | Mitigation |
|---------|------------|
| macOS integration gaps | Test on macOS 12, 13, 14, 15 |
| Window management bugs | Use standard window patterns, avoid exotic features |
| IPC performance | Batch IPC calls, minimize Rust↔JS boundary crossings |
| Update mechanism | Implement Tauri's built-in updater early |

**Backup:** Architecture allows pivoting to Electron if critical Tauri blockers emerge (unlikely).

---

#### T4: Session Persistence Failures
**Risk:** MEDIUM | **Likelihood:** Low | **Impact:** High

Lost sessions = lost conversation context = frustrated users.

| Concern | Mitigation |
|---------|------------|
| Corrupt session files | Write-ahead logging, atomic writes |
| Disk full | Monitor disk space, warn at 90% |
| Crash during save | Auto-save every message, not just on close |
| Context too large | Implement compaction with PARA-preserving summaries (§3.4) |

**Recovery:** Session index allows listing all sessions; corrupt session isolated, not cascade.

---

#### T5: Hook Execution Failures
**Risk:** LOW | **Likelihood:** Low | **Impact:** Medium

Hooks are critical for permissions and context loading.

| Concern | Mitigation |
|---------|------------|
| Hook crashes | Try-catch wrapper, continue without hook if non-critical |
| Hook timeout | 5s timeout per hook, skip if exceeded |
| Hook returns invalid JSON | Schema validation, use defaults on parse failure |
| Missing hook file | Startup validation, warn in logs |

**Design:** Hooks fail open for read operations, fail closed for write operations.

---

### 11.3 Business & API Proxy Risks

#### B1: API Cost Overruns
**Risk:** HIGH | **Likelihood:** High | **Impact:** High

You're proxying Claude API calls. Users could run up massive bills on your account.

| Concern | Mitigation |
|---------|------------|
| Runaway conversations | Per-user daily token limits (e.g., 100K tokens/day free tier) |
| Long sessions | Session token budget with warning at 80% |
| Subagent spawning | Count subagent tokens against user quota |
| Extended thinking abuse | Budget-based extended thinking, cap at 10K tokens |

**Implementation:**
```typescript
// Per-user usage tracking
interface UserUsage {
  user_id: string;
  tokens_today: number;
  tokens_month: number;
  tier: 'free' | 'pro' | 'byok';  // Bring Your Own Key
  daily_limit: number;
  monthly_limit: number;
}

// Check before each API call
if (usage.tokens_today >= usage.daily_limit && usage.tier !== 'byok') {
  throw new QuotaExceededError('Daily limit reached. Upgrade or add your own API key.');
}
```

**Tiers (suggested):**

| Tier | Daily Limit | Monthly Limit | Price |
|------|-------------|---------------|-------|
| Free | 50K tokens | 500K tokens | $0 |
| Pro | 500K tokens | 5M tokens | $20/mo |
| BYOK | Unlimited | Unlimited | $0 (user pays Anthropic) |

---

#### B2: Abuse Prevention
**Risk:** MEDIUM | **Likelihood:** Medium | **Impact:** High

Bad actors could exploit your API proxy for spam, prompt injection attacks, or resource exhaustion.

| Concern | Mitigation |
|---------|------------|
| Account farming | Email verification, rate limit new accounts |
| Prompt injection | Input sanitization, monitor for patterns |
| API key scraping | Never expose your master key client-side |
| Bot signups | CAPTCHA on registration, detect automation |

**Monitoring:** Log all API calls, alert on anomalies (>10x normal usage).

---

#### B3: Revenue Attribution
**Risk:** LOW | **Likelihood:** Low | **Impact:** Medium

Need to track usage accurately for billing.

| Concern | Mitigation |
|---------|------------|
| Token counting accuracy | Use Anthropic's response.usage, don't estimate |
| Failed calls billing | Only count successful completions |
| Dispute resolution | Detailed usage logs with timestamps |

**Storage:** Usage events in append-only log, reconcile monthly.

---

#### B4: BYOK Key Security
**Risk:** MEDIUM | **Likelihood:** Medium | **Impact:** High

Users adding their own API keys = security responsibility.

| Concern | Mitigation |
|---------|------------|
| Key storage | macOS Keychain only, never in files or SQLite |
| Key transmission | HTTPS only, never log keys |
| Key validation | Verify key works before saving |
| Key rotation | Allow easy key update in settings |

**UX:** Clear messaging that BYOK keys are stored locally, never sent to your servers.

---

### 11.4 User Experience Risks

#### U1: Agent Misrouting
**Risk:** MEDIUM | **Likelihood:** Medium | **Impact:** Medium

Agent puts items in wrong GTD category (e.g., project filed as task).

| Concern | Mitigation |
|---------|------------|
| Incorrect categorization | Allow manual override (drag in sidebar) |
| Learning from corrections | Hook captures corrections, adjusts routing skill |
| Ambiguous inputs | Agent asks clarifying question before routing |
| No feedback loop | "Wrong category?" affordance on each item |

**Target:** 80% correct routing. User corrections improve over time.

---

#### U2: Invisible PARA Confusion
**Risk:** LOW | **Likelihood:** Low | **Impact:** Low

Users curious about filesystem structure, confused by `~/Orion/`.

| Concern | Mitigation |
|---------|------------|
| "Where are my files?" | Settings → Data Location shows path |
| Manual file editing | Document that manual edits are supported |
| Backup questions | Clear docs on backup location |

**Philosophy:** Power users can explore; most users never need to know.

---

#### U3: Permission Fatigue
**Risk:** MEDIUM | **Likelihood:** Medium | **Impact:** Medium

Too many permission prompts = users auto-approve without reading.

| Concern | Mitigation |
|---------|------------|
| Frequent prompts | Auto-approve read operations (§3.3) |
| Repetitive prompts | "Always allow for this session" option |
| Unclear prompts | Show exactly what will happen, preview content |
| Slow flow | Batch similar permissions where possible |

**Balance:** Security vs. friction. Err toward friction for writes, freedom for reads.

---

#### U4: Canvas Not Spawning
**Risk:** LOW | **Likelihood:** Low | **Impact:** Medium

Agent should spawn calendar picker but returns plain text instead.

| Concern | Mitigation |
|---------|------------|
| Agent doesn't recognize context | Stronger skill activation patterns |
| Canvas rendering fails | Fallback to text representation |
| User prefers text | "Prefer text mode" setting |

**Detection:** Log canvas-appropriate contexts where text was returned, improve skills.

---

### 11.5 Security Risks

#### S1: API Key Exposure
**Risk:** HIGH | **Likelihood:** Low | **Impact:** Critical

Your master Anthropic API key leaked = financial disaster.

| Concern | Mitigation |
|---------|------------|
| Key in source code | Environment variables only, .env in .gitignore |
| Key in logs | Redact keys in all logging |
| Key in error messages | Sanitize error responses |
| Client-side exposure | Proxy all API calls through your backend |

**Architecture:**
```
Client (Tauri) → Your Backend (auth + rate limit) → Anthropic API
              ↑
              Never sees master key
```

---

#### S2: Multi-Tenant Data Isolation
**Risk:** MEDIUM | **Likelihood:** Low | **Impact:** Critical

If using shared backend, User A must never see User B's data.

| Concern | Mitigation |
|---------|------------|
| Session leakage | Session IDs include user_id, validate on every request |
| Database queries | Always filter by user_id, parameterized queries |
| Cache poisoning | User-scoped cache keys |
| Log exposure | Separate log streams per user or redact PII |

**MVP Simplification:** Local-first architecture means no shared backend initially. Add isolation when/if cloud features added.

---

#### S3: OAuth Token Security
**Risk:** MEDIUM | **Likelihood:** Low | **Impact:** High

Composio OAuth tokens grant access to user's Gmail/Calendar.

| Concern | Mitigation |
|---------|------------|
| Token storage | Encrypted in Keychain, not SQLite |
| Token in transit | HTTPS only to Composio |
| Token refresh | Composio handles refresh, monitor for failures |
| Scope creep | Request minimum OAuth scopes |

---

#### S4: Sensitive File Access
**Risk:** LOW | **Likelihood:** Low | **Impact:** High

Agent could accidentally read `.env` or credential files.

| Concern | Mitigation |
|---------|------------|
| Reading secrets | PreToolUse hook blocks `*secret*`, `*credential*`, `.env` |
| Writing to sensitive paths | Block writes outside `~/Orion/` and project dirs |
| Bash command injection | Block `sudo`, `rm -rf /`, dangerous patterns |

**Implementation:** (Already in §3.3 Auto-Approve Rules)

---

### 11.6 Scope & Timeline Risks

#### P1: Feature Creep
**Risk:** HIGH | **Likelihood:** High | **Impact:** Medium

Temptation to add "one more feature" delays MVP.

| Concern | Mitigation |
|---------|------------|
| Nice-to-have features | Strict MVP scope (§2.6) |
| User requests | Log for v1.1, don't implement now |
| Perfect vs. good | Ship when gates pass, iterate |

**Rule:** If it's not in §2.7 "What IS the MVP", it's not MVP.

---

#### P2: Phase Gate Enforcement
**Risk:** MEDIUM | **Likelihood:** Medium | **Impact:** Medium

Skipping gates leads to unstable foundation.

| Concern | Mitigation |
|---------|------------|
| Rushing to Phase 2 | Document gate criteria (§9.8), enforce |
| Incomplete Phase 1 | Can't build routing without working SDK |
| Parallel work chaos | Clear dependency chain (§9.7) |

**Process:** Gate review before proceeding. Demo to yourself.

---

#### P3: Canvas Complexity Explosion
**Risk:** MEDIUM | **Likelihood:** Medium | **Impact:** Medium

Canvas system could become mini-app framework.

| Concern | Mitigation |
|---------|------------|
| Too many canvas types | MVP: Calendar, Email, Approval only |
| Complex interactions | Canvas should be simple, not full apps |
| State management | Canvas state lives in conversation, not separate |

**Rule:** "If it needs its own page, it's not a canvas."

---

### 11.7 Dependency Risks

#### D1: Anthropic SDK Updates
**Risk:** LOW | **Likelihood:** Low | **Impact:** Medium

Stable v1 SDK has low risk of breaking changes.

| Concern | Mitigation |
|---------|------------|
| API changes | Abstraction layer (§T1) |
| Feature removal | Use stable features only |
| Pricing changes | Monitor, budget for increases |

---

#### D2: Composio Changes
**Risk:** LOW | **Likelihood:** Low | **Impact:** Medium

Composio could change pricing, rate limits, or shut down.

| Concern | Mitigation |
|---------|------------|
| Price increase | Budget 2x current cost |
| Rate limit reduction | Implement caching, batch requests |
| Service sunset | Architecture allows swapping to direct OAuth or alternative SDK |

**Long-term:** Consider direct OAuth as alternative for core integrations.

---

#### D3: Google OAuth Policy Changes
**Risk:** LOW | **Likelihood:** Low | **Impact:** High

Google could restrict OAuth for "unverified" apps.

| Concern | Mitigation |
|---------|------------|
| Verification required | Plan for Google OAuth verification process |
| Scope restrictions | Use minimum required scopes |
| User cap (100) | Verify app before public launch |

---

### 11.8 Risk Summary Matrix

| ID | Risk | Rating | Phase Impacted | Mitigation Owner |
|----|------|--------|----------------|------------------|
| **B1** | API Cost Overruns | HIGH | Phase 1+ | Backend |
| **S1** | API Key Exposure | HIGH | Phase 1+ | Security |
| **P1** | Feature Creep | HIGH | All | PM (you) |
| **T1** | SDK Changes | MEDIUM | All | Architect |
| **T2** | Composio SDK Reliability | MEDIUM | Phase 1+ | Architect |
| **B2** | Abuse Prevention | MEDIUM | Phase 1+ | Backend |
| **U1** | Agent Misrouting | MEDIUM | Phase 2+ | Skills |
| **U3** | Permission Fatigue | MEDIUM | Phase 2+ | UX |
| **S2** | Multi-Tenant Isolation | MEDIUM | Future | Security |
| **P2** | Phase Gate Enforcement | MEDIUM | All | PM |
| **P3** | Canvas Complexity | MEDIUM | Phase 3 | Architect |
| **T3** | Tauri Maturity | LOW | Phase 0 | Architect |
| **T4** | Session Persistence | MEDIUM | Phase 1+ | Architect |
| **T5** | Hook Failures | LOW | Phase 1+ | Architect |
| **B3** | Revenue Attribution | LOW | Future | Backend |
| **B4** | BYOK Security | MEDIUM | Phase 1 | Security |
| **U2** | PARA Confusion | LOW | Phase 2+ | Docs |
| **U4** | Canvas Not Spawning | LOW | Phase 3 | Skills |
| **S3** | OAuth Token Security | MEDIUM | Phase 1+ | Security |
| **S4** | Sensitive File Access | LOW | Phase 1+ | Security |
| **D1** | Anthropic SDK Updates | LOW | All | Architect |
| **D2** | Composio Changes | LOW | Phase 1+ | Architect |
| **D3** | Google OAuth Changes | LOW | Phase 1+ | Security |

---

### 11.9 Risk Monitoring

**Weekly Review:**
- API costs vs. budget
- Error rates from logs
- User feedback themes
- SDK/dependency updates

**Monthly Review:**
- Full risk matrix reassessment
- New risks from user feedback
- Mitigation effectiveness

**Alerts (Automated):**
- API cost > 150% of budget
- Error rate > 5%
- Composio connection failures
- Unusual usage patterns (abuse detection)

---

## 12. Functional Requirements

**Full Requirements Document:** [functional-requirements-extracted.md](functional-requirements-extracted.md)

The Orion Harness has **94 Functional Requirements** extracted and formalized across 10 domains:

| Domain | Count | Key Capabilities |
|--------|-------|------------------|
| FR-1: Harness Core | 8 | SDK wrapper, streaming, context compaction |
| FR-2: Session Management | 7 | Named sessions, persistence, forking |
| FR-3: Extension System | 14 | Skills, agents, hooks, plugins |
| FR-4: MCP Integration | 8 | Composio, Gmail, Calendar |
| FR-5: PARA Filesystem | 8 | Directory structure, auto-routing |
| FR-6: GTD Interface | 10 | Inbox, Next Actions, Projects views |
| FR-7: Permission System | 9 | Approval flows, auto-rules |
| FR-8: Canvas System | 10 | Inline rich UI, pickers |
| FR-9: Butler Plugin | 14 | Reference implementation |
| FR-10: Infrastructure | 12 | Tauri, security, performance |

### Traceability Summary

All User Journeys (UJ-1 through UJ-10) map to FRs:

| Journey | Primary FRs |
|---------|------------|
| UJ-1: Morning Briefing | FR-9.1, FR-9.6, FR-9.7, FR-6.1-6.5 |
| UJ-2: Inbox Triage | FR-9.2, FR-9.6, FR-4.3, FR-5.4, FR-7.2 |
| UJ-3: Schedule Meeting | FR-9.3, FR-9.7, FR-4.4, FR-8.2, FR-7.3 |
| UJ-4: Draft Communication | FR-9.4, FR-9.8, FR-4.3, FR-8.3, FR-7.3 |
| UJ-5: Capture & Organize | FR-6.6, FR-6.7, FR-5.4, FR-5.8, FR-6.10 |
| UJ-6: Weekly Review | FR-9.5, FR-6.1-6.5, FR-5.5 |
| UJ-7-10: Developer Journeys | FR-3.1-3.14 |

---

## 13. Non-Functional Requirements

**Full Requirements Document:** [nfr-extracted-from-prd-v2.md](nfr-extracted-from-prd-v2.md)

The Orion Harness has **63 Non-Functional Requirements** across 9 categories:

| Category | Count | Key Metrics |
|----------|-------|-------------|
| NFR-1: Performance | 7 | < 500ms first token, < 3s app launch |
| NFR-2: Reliability | 10 | 99% MCP uptime, < 1% error rate |
| NFR-3: Scalability | 6 | 100K tokens/day, session compaction |
| NFR-4: Security | 13 | Keychain storage, zero logs of keys |
| NFR-5: Usability | 8 | WCAG AA, keyboard navigation |
| NFR-6: Maintainability | 13 | SDK abstraction, hot-reload skills |
| NFR-7: Operational | 11 | p95 tracking, cost alerts |
| NFR-8: Compatibility | 4 | macOS 12-15 support |
| NFR-9: Data Integrity | 5 | Atomic writes, audit logs |

### Critical Targets

| NFR | Metric | Target |
|-----|--------|--------|
| NFR-1.1 | First token latency | < 500ms (p95) |
| NFR-1.2 | App launch | < 3 seconds |
| NFR-2.1 | MCP uptime | 99% |
| NFR-2.2 | Error rate | < 1% |
| NFR-4.1 | API key storage | Keychain only |
| NFR-5.1 | Contrast ratio | WCAG AA (4.5:1) |

---

## Appendix A: Migration from PRD v1.4

### What Changed

| PRD v1.4 | PRD v2.0 |
|----------|----------|
| Butler is the product | Harness is the product |
| SDK is implementation detail | SDK is the core |
| 5.4 buried as one section | Sections 3-4 are SDK/extensions |
| 2,184 lines | ~800 lines target |
| PARA/GTD as features | PARA/GTD as infrastructure layers |
| Agents hardcoded | Agents as extensions |

### What Stays

- Tauri + Next.js stack
- Composio SDK integration
- SQLite + PostgreSQL data layer
- Design system (editorial luxury)
- Core user stories (inbox, calendar, email)

### What Moves to Butler Plugin

- Triage agent
- Scheduler agent
- Communicator agent
- Morning briefing skill
- Inbox processing skill
- All domain-specific logic

---

*PRD v2.0 complete. All 10 sections finalized. Ready for Architecture review and Epics/Stories generation.*
