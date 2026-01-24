---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics']
inputDocuments:
  - thoughts/planning-artifacts/prd-v2.md
  - thoughts/planning-artifacts/nfr-extracted-from-prd-v2.md
  - thoughts/planning-artifacts/architecture.md
  - thoughts/planning-artifacts/ux-design-specification.md
  - thoughts/research/CLAUDE-AGENT-SDK-RESEARCH.md
  - thoughts/research/CONTINUOUS-CLAUDE-V3-RESEARCH-SUMMARY.md
  - thoughts/research/PARA-DEEP-DIVE-SYNTHESIS.md
  - thoughts/research/agents-analysis.md
  - thoughts/research/claude-agent-sdk-deep-dive.md
  - thoughts/research/composio-claude-sdk-architecture.md
  - thoughts/research/composio-deep-dive.md
  - thoughts/research/credentials-and-accounts-design.md
  - thoughts/research/database-schema-design.md
  - thoughts/research/hooks-analysis.md
  - thoughts/research/observability-architecture.md
  - thoughts/research/para-system-design.md
  - thoughts/research/skills-analysis.md
  - thoughts/research/streaming-architecture.md
  - thoughts/research/tool-integration-inventory.md
---

# Orion Butler - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Orion Butler, decomposing the requirements from the PRD, UX Design, Architecture, and Research documents into implementable stories with a focus on **small, granular stories** and **comprehensive epic coverage**.

## Requirements Inventory

### Functional Requirements

**FR-1: Harness Core (8 requirements)**
- FR-1.1: Wrap Claude Agent SDK (TypeScript Stable v1) exposing all SDK features (sessions, streaming, tools, subagents, hooks, skills, plugins, MCP, structured outputs, extended thinking, prompt caching, context compaction)
- FR-1.2: Maintain conversation continuity across sessions - user can resume previous sessions with full context preserved
- FR-1.3: Support streaming responses in real-time with <500ms first token latency (p95)
- FR-1.4: Support all SDK-native tools (Bash, Read, Write, Edit, Glob, Grep, Task, AskUserQuestion, TodoWrite)
- FR-1.5: Support extended thinking for complex reasoning controlled by maxThinkingTokens budget
- FR-1.6: Support prompt caching for cost optimization with configurable TTL
- FR-1.7: Support structured outputs with type-safe responses validated against schemas
- FR-1.8: Maintain context compaction with PARA preservation

**FR-2: Session Management (7 requirements)**
- FR-2.1: Support named session types (Daily, Project, Inbox, Ad-hoc) with distinct naming patterns
- FR-2.2: Support automatic session resumption - Daily sessions auto-resume if accessed same day; Project sessions persist across days
- FR-2.3: Support session forking to create "what-if" scenarios
- FR-2.4: Export session transcripts to JSONL format
- FR-2.5: Persist session data locally in `~/.orion/sessions/` with metadata index
- FR-2.6: Restore session context in <1 second
- FR-2.7: Maintain session metadata (type, name, last_active timestamp, context_summary)

**FR-3: Extension System (14 requirements)**
- FR-3.1: Load skills from `.claude/skills/` directory at startup
- FR-3.2: Support skill activation via keywords
- FR-3.3: Support skill activation via `/command` syntax
- FR-3.4: Load agent definitions from `.claude/agents/` directory
- FR-3.5: Support subagent spawning via Task tool with proper context handoff
- FR-3.6: Support directory-based subagent output to `.claude/cache/agents/{name}/output/`
- FR-3.7: Register hooks from `.claude/hooks/hooks.json`
- FR-3.8: Support all 12 SDK hook events
- FR-3.9: Execute hooks with <50ms latency per hook
- FR-3.10: Connect to configured MCP servers from `.mcp.json`
- FR-3.11: Support plugin installation via `/plugin install owner/repo`
- FR-3.12: Validate plugin manifests including required dependencies
- FR-3.13: Support plugin scopes at user, project, or local scope
- FR-3.14: Load extensions standalone or bundled

**FR-4: MCP Integration (8 requirements)**
- FR-4.1: Support Composio SDK integration for configured app integrations
- FR-4.2: Support dynamic tool discovery based on context
- FR-4.3: Connect Gmail via Composio (GMAIL_GET_EMAILS, GMAIL_SEND_EMAIL, GMAIL_SEARCH)
- FR-4.4: Connect Google Calendar via Composio (CALENDAR_LIST_EVENTS, CALENDAR_CREATE_EVENT)
- FR-4.5: Support OAuth for Composio connections with secure credential storage
- FR-4.6: Complete MCP tool calls in <2 seconds (p95)
- FR-4.7: Support stdio MCP servers via JSON-RPC
- FR-4.8: Support HTTP MCP servers via REST/SSE

**FR-5: PARA Filesystem (8 requirements)**
- FR-5.1: Maintain PARA directory structure in `~/Orion/` (projects/, areas/, resources/, archive/, inbox/)
- FR-5.2: Store project metadata with `_meta.yaml`, `notes.md`, `tasks.yaml`
- FR-5.3: Provide agent read/write access to PARA hierarchy
- FR-5.4: Organize captures into PARA automatically
- FR-5.5: Archive completed items by month to `archive/YYYY-MM/`
- FR-5.6: Maintain contact cards in `~/Orion/resources/contacts/`
- FR-5.7: Maintain templates in `~/Orion/resources/templates/`
- FR-5.8: Route inbox captures to correct PARA location with 80%+ accuracy

**FR-6: GTD Interface (10 requirements)**
- FR-6.1: Provide Inbox view displaying unprocessed conversations
- FR-6.2: Provide Next Actions view displaying tasks with `status: next`
- FR-6.3: Provide Projects view displaying active projects
- FR-6.4: Provide Waiting For view displaying tasks with `status: waiting`
- FR-6.5: Provide Someday/Maybe view
- FR-6.6: Support new inbox capture in <2 seconds via ⌘N shortcut
- FR-6.7: Auto-categorize captures via agent processing
- FR-6.8: Maintain collapsible sidebar sections with count badges
- FR-6.9: Allow sidebar collapse for focus mode (⌘[ shortcut)
- FR-6.10: Map PARA to GTD invisibly - users interact only with GTD categories

**FR-7: Permission System (9 requirements)**
- FR-7.1: Support permission modes (`default`, `plan`, `acceptEdits`)
- FR-7.2: Auto-allow read operations without prompts
- FR-7.3: Prompt for write operations requiring user approval
- FR-7.4: Auto-allow PARA filesystem access
- FR-7.5: Block sensitive file access (`.env`, `*secret*`, `*credential*` files)
- FR-7.6: Block dangerous bash commands (`rm -rf`, `sudo`, `chmod 777`)
- FR-7.7: Display inline permission cards with Allow/Deny/Edit options
- FR-7.8: Support custom permission hooks via PreToolUse
- FR-7.9: Audit all external tool calls

**FR-8: Canvas System (10 requirements)**
- FR-8.1: Support inline canvas rendering within message thread
- FR-8.2: Support calendar picker canvas with conflict detection
- FR-8.3: Support email composer canvas with tone controls
- FR-8.4: Support project board canvas showing goals, milestones, tasks
- FR-8.5: Support task list canvas with checkable items
- FR-8.6: Support approval card canvas with Allow/Deny/Edit
- FR-8.7: Spawn canvas based on agent decision contextually
- FR-8.8: Make canvas interactive
- FR-8.9: Persist canvas state in conversation thread
- FR-8.10: Support canvas collapse/expand

**FR-9: Butler Plugin Reference (14 requirements)**
- FR-9.1: Provide morning briefing skill `/briefing`
- FR-9.2: Provide inbox triage skill `/inbox` with priority scoring
- FR-9.3: Provide calendar management skill `/schedule`
- FR-9.4: Provide email composition skill `/email` matching user tone
- FR-9.5: Provide weekly review skill `/review`
- FR-9.6: Provide triage subagent (Sonnet, read-only)
- FR-9.7: Provide scheduler subagent (Sonnet)
- FR-9.8: Provide communicator subagent (Opus)
- FR-9.9: Provide researcher subagent (Sonnet, read-only)
- FR-9.10: Inject context at session start via SessionStart hook
- FR-9.11: Enforce permission rules via PreToolUse hook
- FR-9.12: Audit tool usage via PostToolUse hook
- FR-9.13: Save learned preferences via SessionEnd hook
- FR-9.14: Validate as installable plugin package

**FR-10: Technical Infrastructure (12 requirements)**
- FR-10.1: Run as macOS desktop application built with Tauri 2.0 (macOS 12+)
- FR-10.2: Launch in <3 seconds to interactive state
- FR-10.3: Use <500MB memory during normal operation
- FR-10.4: Store local data in SQLite at `~/.orion/orion.db`
- FR-10.5: Store API keys securely in macOS Keychain
- FR-10.6: Maintain audit trail for all external tool calls
- FR-10.7: Support keyboard shortcuts for all primary actions
- FR-10.8: Meet WCAG AA accessibility standards
- FR-10.9: Support responsive layout for desktop/laptop/tablet breakpoints
- FR-10.10: Maintain MCP connection uptime at 99%
- FR-10.11: Load skills in <100ms each
- FR-10.12: Maintain error rate <1% of user interactions

### NonFunctional Requirements

**NFR-1: Performance (7 requirements)**
- NFR-1.1: First token latency p95 < 500ms
- NFR-1.2: Cold start to interactive UI < 3 seconds
- NFR-1.3: Composio SDK tool calls < 2 seconds latency
- NFR-1.4: Session context restore < 1 second
- NFR-1.5: Skill load time < 100ms per skill
- NFR-1.6: Hook execution < 50ms per hook
- NFR-1.7: Memory usage < 500MB typical

**NFR-2: Reliability (10 requirements)**
- NFR-2.1: MCP server connection availability 99%
- NFR-2.2: System-wide error rate < 1%
- NFR-2.3: Session resume success rate 99%
- NFR-2.4: Skill load success rate 100%
- NFR-2.5: Graceful degradation when MCP servers unavailable
- NFR-2.6: Backoff and retry for rate-limited APIs
- NFR-2.7: Isolate corrupt session data
- NFR-2.8: Auto-save conversation state after each message
- NFR-2.9: Atomic write guarantees for session persistence
- NFR-2.10: Fail open for read hooks, fail closed for write hooks

**NFR-3: Scalability (6 requirements)**
- NFR-3.1: Support ≥100 concurrent sessions with <5% degradation
- NFR-3.2: Token budgets with configurable daily limits
- NFR-3.3: Track subagent token usage against user quota
- NFR-3.4: Extended thinking token caps at 10K tokens
- NFR-3.5: Disk space warnings at 90% threshold
- NFR-3.6: Context compaction at 80% of limit preserving ≥80% PARA entities

**NFR-4: Security & Privacy (13 requirements)**
- NFR-4.1: 100% API keys in macOS Keychain, 0 in files/DB
- NFR-4.2: Never transmit API keys in logs or error messages
- NFR-4.3: Transmit API keys only over HTTPS
- NFR-4.4: Validate API keys before saving
- NFR-4.5: Block access to sensitive files via PreToolUse
- NFR-4.6: Log 100% of external tool calls to audit trail
- NFR-4.7: Sanitize tool call inputs in audit logs
- NFR-4.8: Store audit logs in structured JSONL format
- NFR-4.9: Encrypt OAuth tokens using Keychain
- NFR-4.10: Request minimum OAuth scopes
- NFR-4.11: User-scoped database queries
- NFR-4.12: Rate limiting for new account signups
- NFR-4.13: Monitor for anomalous API usage patterns

**NFR-5: Usability & Accessibility (8 requirements)**
- NFR-5.1: 100% keyboard navigation for primary actions
- NFR-5.2: VoiceOver screen reader compatibility
- NFR-5.3: WCAG AA contrast ratios
- NFR-5.4: Dynamic font scaling with system settings
- NFR-5.5: Clear MCP server status messaging
- NFR-5.6: Data location path visible in settings
- NFR-5.7: Warn at 80% token budget
- NFR-5.8: Clear quota exceeded error with upgrade/BYOK prompt

**NFR-6: Maintainability & Extensibility (13 requirements)**
- NFR-6.1: Abstract SDK calls behind wrapper interface
- NFR-6.2: Use only stable SDK features
- NFR-6.3: Hot-reload for new skills without restart
- NFR-6.4: Validate 100% of plugin manifests
- NFR-6.5: Validate 100% of agent definitions against schema
- NFR-6.6: Validate hook registration configuration
- NFR-6.7: Startup validation for all hooks
- NFR-6.8: Timeout hook execution exceeding 5s
- NFR-6.9: Validate hook output schemas
- NFR-6.10: Support SDK upgrades in staging environment
- NFR-6.11: Implement Tauri built-in updater
- NFR-6.12: Support plugin distribution via Git repositories
- NFR-6.13: Log all errors with context for debugging

**NFR-7: Operational & Monitoring (11 requirements)**
- NFR-7.1: Track API latency at p95 percentile
- NFR-7.2: Track session resume time
- NFR-7.3: Track skill load time per skill
- NFR-7.4: Track hook execution time per hook
- NFR-7.5: Track memory usage continuously
- NFR-7.6: Alert on API costs exceeding 150% of budget
- NFR-7.7: Alert on error rates exceeding 5%
- NFR-7.8: Log MCP server connection failures
- NFR-7.9: Log unusual usage patterns
- NFR-7.10: Weekly risk review metrics
- NFR-7.11: Subscribe to SDK update notifications

**NFR-8: Compatibility & Portability (4 requirements)**
- NFR-8.1: Run on macOS 12, 13, 14, 15
- NFR-8.2: Support future iOS/Android deployment
- NFR-8.3: Minimize IPC boundary crossings
- NFR-8.4: Standard window management patterns

**NFR-9: Data Integrity & Backup (5 requirements)**
- NFR-9.1: Atomic write operations for session data
- NFR-9.2: Session index integrity separate from session data
- NFR-9.3: Append-only JSONL audit logs
- NFR-9.4: Monthly usage tracking reconciliation
- NFR-9.5: Document backup location for user data

### Additional Requirements

**Starter Template (CRITICAL - Epic 1 Story 1):**
- Initialize project using: `npx create-tauri-ui@latest orion --template next`
- Provides: Tauri 2.0 + Next.js 15 + shadcn/ui + TypeScript

**Architecture Requirements:**
- SQLite with sqlite-vec extension for vector embeddings
- Drizzle ORM for type-safe queries
- tauri-plugin-sql for native Tauri SQLite integration
- tauri-plugin-keychain for macOS Keychain access
- Composio SDK-Direct integration via `composio-anthropic` package (NOT MCP)
- json-render for canvas display mode
- TipTap for canvas edit mode (email/notes)
- XState for complex UI flows (streaming, permissions, canvas)
- Zustand for simple state (preferences, caches)
- neverthrow for Result types
- consola for TypeScript logging
- tauri-plugin-log for Rust logging
- Vitest for unit/integration tests
- Playwright for E2E tests
- chokidar for file watching (extension hot-reload)

**UX Requirements:**
- Three-column layout: GTD Sidebar (280px) + Chat (flex) + Canvas (480px)
- No emojis anywhere (Editorial Luxury aesthetic)
- Gold (#D4AF37) for positive actions, Blue for waiting, Red text for errors
- Playfair Display for display text, Inter for body text
- 0px border radius throughout (sharp corners)
- 44x44px minimum touch targets
- 2px gold focus outline with 2px offset
- Animations: 200ms entrance, 150ms exit, 100ms state change
- Canvas auto-collapse after 2s inactivity
- Dark mode support with system preference detection

**Research-Derived Requirements:**
- Use Claude Agent SDK `query()` as primary entry point
- Implement hooks at 7 lifecycle points
- Per-user OAuth isolation via Composio `userId` parameter
- Dual database: SQLite (offline) + Supabase (auth/sync/billing)
- BGE-M3 embeddings (1024-dim) for semantic search
- Memory types: USER_PREFERENCE, DECISION_CONTEXT, ROUTINE_PATTERN
- IPC streaming via Tauri events (not WebSocket)
- Request ID tracking for multiplexed streams
- Circuit breaker pattern for external services
- Exponential backoff: 500ms → 1s → 2s → 4s (max 30s)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR-1.1 | Epic 2 | SDK wrapper with streaming |
| FR-1.2 | Epic 22 | Conversation continuity |
| FR-1.3 | Epic 2 | Streaming responses |
| FR-1.4 | Epic 2, 8 | SDK-native tools |
| FR-1.5 | Epic 21 | Extended thinking |
| FR-1.6 | Epic 22 | Prompt caching |
| FR-1.7 | Epic 21 | Structured outputs |
| FR-1.8 | Epic 22 | Context compaction with PARA |
| FR-2.1 | Epic 3 | Named session types |
| FR-2.2 | Epic 3 | Auto session resumption |
| FR-2.3 | Epic 21 | Session forking |
| FR-2.4 | Epic 21 | JSONL export |
| FR-2.5 | Epic 3 | Session persistence |
| FR-2.6 | Epic 3 | Fast context restore |
| FR-2.7 | Epic 3 | Session metadata |
| FR-3.1 | Epic 17 | Skill loading |
| FR-3.2 | Epic 17 | Keyword activation |
| FR-3.3 | Epic 17 | Command activation |
| FR-3.4 | Epic 18 | Agent definitions |
| FR-3.5 | Epic 18 | Subagent spawning |
| FR-3.6 | Epic 18 | Subagent output dirs |
| FR-3.7 | Epic 19 | Hook registration |
| FR-3.8 | Epic 19 | 12 hook events |
| FR-3.9 | Epic 19 | Hook latency |
| FR-3.10 | Epic 22 | MCP server connections |
| FR-3.11 | Epic 23 | Plugin installation |
| FR-3.12 | Epic 23 | Plugin validation |
| FR-3.13 | Epic 23 | Plugin scopes |
| FR-3.14 | Epic 23 | Standalone/bundled extensions |
| FR-4.1 | Epic 9 | Composio SDK integration |
| FR-4.2 | Epic 9 | Dynamic tool discovery |
| FR-4.3 | Epic 10 | Gmail integration |
| FR-4.4 | Epic 11 | Calendar integration |
| FR-4.5 | Epic 7 | OAuth credential storage |
| FR-4.6 | Epic 9 | MCP tool latency |
| FR-4.7 | Epic 8 | stdio MCP servers |
| FR-4.8 | Epic 22 | HTTP MCP servers |
| FR-5.1 | Epic 4 | PARA directory structure |
| FR-5.2 | Epic 4 | Project metadata |
| FR-5.3 | Epic 4, 8 | Agent PARA access |
| FR-5.4 | Epic 6 | Auto-organize captures |
| FR-5.5 | Epic 23 | Monthly archiving |
| FR-5.6 | Epic 4 | Contact cards |
| FR-5.7 | Epic 4 | Templates directory |
| FR-5.8 | Epic 6 | Inbox routing accuracy |
| FR-6.1 | Epic 5 | Inbox view |
| FR-6.2 | Epic 5 | Next Actions view |
| FR-6.3 | Epic 5 | Projects view |
| FR-6.4 | Epic 5 | Waiting For view |
| FR-6.5 | Epic 5 | Someday/Maybe view |
| FR-6.6 | Epic 6 | Quick capture shortcut |
| FR-6.7 | Epic 6 | Auto-categorization |
| FR-6.8 | Epic 5 | Collapsible sections |
| FR-6.9 | Epic 5 | Sidebar collapse |
| FR-6.10 | Epic 6 | PARA-GTD mapping |
| FR-7.1 | Epic 12 | Permission modes |
| FR-7.2 | Epic 12 | Auto-allow reads |
| FR-7.3 | Epic 12 | Prompt for writes |
| FR-7.4 | Epic 12 | PARA auto-allow |
| FR-7.5 | Epic 12 | Block sensitive files |
| FR-7.6 | Epic 12 | Block dangerous commands |
| FR-7.7 | Epic 12 | Permission cards |
| FR-7.8 | Epic 19 | Custom permission hooks |
| FR-7.9 | Epic 13 | Audit external calls |
| FR-8.1 | Epic 14 | Inline canvas |
| FR-8.2 | Epic 15 | Calendar picker canvas |
| FR-8.3 | Epic 16 | Email composer canvas |
| FR-8.4 | Epic 16 | Project board canvas |
| FR-8.5 | Epic 16 | Task list canvas |
| FR-8.6 | Epic 15 | Approval card canvas |
| FR-8.7 | Epic 14 | Agent-triggered canvas |
| FR-8.8 | Epic 16 | Interactive canvas |
| FR-8.9 | Epic 14 | Canvas persistence |
| FR-8.10 | Epic 14 | Canvas collapse |
| FR-9.1 | Epic 20 | /briefing skill |
| FR-9.2 | Epic 20 | /inbox skill |
| FR-9.3 | Epic 20 | /schedule skill |
| FR-9.4 | Epic 20 | /email skill |
| FR-9.5 | Epic 20 | /review skill |
| FR-9.6 | Epic 18 | Triage subagent |
| FR-9.7 | Epic 18 | Scheduler subagent |
| FR-9.8 | Epic 18 | Communicator subagent |
| FR-9.9 | Epic 18 | Researcher subagent |
| FR-9.10 | Epic 19 | SessionStart hook |
| FR-9.11 | Epic 19 | PreToolUse hook |
| FR-9.12 | Epic 19 | PostToolUse hook |
| FR-9.13 | Epic 19 | SessionEnd hook |
| FR-9.14 | Epic 20 | Plugin validation |
| FR-10.1 | Epic 1 | Tauri macOS app |
| FR-10.2 | Epic 1 | Fast launch |
| FR-10.3 | Epic 22 | Memory budget |
| FR-10.4 | Epic 3 | SQLite storage |
| FR-10.5 | Epic 7 | Keychain storage |
| FR-10.6 | Epic 13 | Audit trail |
| FR-10.7 | Epic 1 | Keyboard shortcuts |
| FR-10.8 | Epic 1 | WCAG AA accessibility |
| FR-10.9 | Epic 1 | Responsive layout |
| FR-10.10 | Epic 22 | MCP uptime |
| FR-10.11 | Epic 22 | Skill load speed |
| FR-10.12 | Epic 22 | Error rate |

## Epic Dependency Map

The following diagram shows critical dependencies between epics. An arrow from A → B means "A must be substantially complete before B can begin."

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                     FOUNDATION LAYER                         │
                    │                                                              │
                    │   Epic 1 ──────► Epic 2 ──────► Epic 3                      │
                    │   (Shell)        (Chat)         (Persistence)                │
                    │      │              │               │                        │
                    │      │              ▼               ▼                        │
                    │      │         Epic 26 ◄───────────────────────────────┐    │
                    │      │         (Testing)                               │    │
                    │      ▼                                                 │    │
                    │   Epic 7 ─────────────────────────────────────────┐   │    │
                    │   (Credentials)                                    │   │    │
                    └────────────────────────────────────────────────────┼───┼────┘
                                                                         │   │
                    ┌────────────────────────────────────────────────────┼───┼────┐
                    │                     PARA/GTD LAYER                 │   │    │
                    │                                                    │   │    │
                    │   Epic 4 ──────► Epic 5 ──────► Epic 6            │   │    │
                    │   (PARA FS)      (GTD UI)       (Capture)          │   │    │
                    │      │                             │               │   │    │
                    │      └─────────────────────────────┼───────────────┼───┘    │
                    │                                    ▼               │        │
                    │                              Epic 27              │        │
                    │                              (Memory)              │        │
                    └────────────────────────────────────────────────────┼────────┘
                                                                         │
                    ┌────────────────────────────────────────────────────┼────────┐
                    │                   INTEGRATION LAYER                │        │
                    │                                                    │        │
                    │   Epic 7 ──────► Epic 9 ──────► Epic 10           │        │
                    │   (Creds)        (Composio)     (Gmail)            │        │
                    │                      │              │              │        │
                    │                      ▼              ▼              │        │
                    │                  Epic 11       Epic 16             │        │
                    │                  (Calendar)    (Email Canvas)      │        │
                    └────────────────────────────────────────────────────┼────────┘
                                                                         │
                    ┌────────────────────────────────────────────────────┼────────┐
                    │                   PERMISSION LAYER                 │        │
                    │                                                    │        │
                    │   Epic 12 ──────► Epic 13                         │        │
                    │   (Permissions)   (Audit)                          │        │
                    │      │                                             │        │
                    │      └─────────────────────────────────────────────┘        │
                    └─────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────────────────────┐
                    │                     CANVAS LAYER                             │
                    │                                                              │
                    │   Epic 14 ──────► Epic 15 ──────► Epic 16                   │
                    │   (Foundation)    (Calendar)      (Email/Task)               │
                    └─────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────────────────────┐
                    │                   EXTENSION LAYER                            │
                    │                                                              │
                    │   Epic 17 ──────► Epic 18 ──────► Epic 19                   │
                    │   (Skills)        (Agents)        (Hooks)                    │
                    │      │               │               │                       │
                    │      └───────────────┴───────────────┘                       │
                    │                      │                                       │
                    │                      ▼                                       │
                    │                  Epic 20 ──────► Epic 23                    │
                    │                  (Butler)        (Plugins)                   │
                    └─────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────────────────────┐
                    │                   ADVANCED LAYER                             │
                    │                                                              │
                    │   Epic 21 ◄────── Epic 3 (Session base required)            │
                    │   (Advanced)                                                 │
                    │                                                              │
                    │   Epic 22 ◄────── Epic 3, 8, 17 (Context sources)           │
                    │   (Context)                                                  │
                    │      │                                                       │
                    │      ▼                                                       │
                    │   Epic 25 (Vector Search)                                   │
                    │                                                              │
                    │   Epic 24 ◄────── Epic 7 (Credential foundation)            │
                    │   (Auth/Billing)                                             │
                    └─────────────────────────────────────────────────────────────┘
```

### Critical Path

The minimum viable path to first user value:

```
Epic 1 → Epic 2 → Epic 3 → Epic 7 → Epic 4 → Epic 5 → Epic 6
(Shell)  (Chat)   (Save)   (Keys)   (PARA)   (GTD)    (Capture)
```

### Parallel Workstreams

After Epic 7 (Credentials), these can proceed in parallel:
- **Stream A:** Epic 9 → 10 → 11 (Integrations)
- **Stream B:** Epic 12 → 13 (Permissions/Audit)
- **Stream C:** Epic 14 → 15 → 16 (Canvas)
- **Stream D:** Epic 17 → 18 → 19 → 20 (Extensions)

---

## Epic List

### Epic 1: Application Shell & First Launch
Users can install and launch Orion, see the main interface with Editorial Luxury aesthetic, and experience responsive layout with keyboard shortcuts.

**FRs covered:** FR-10.1, FR-10.2, FR-10.7, FR-10.8, FR-10.9
**NFRs addressed:** NFR-1.2, NFR-5.1, NFR-5.3, NFR-8.1, NFR-8.4

---

### Epic 2: First Conversation
Users can have their first conversation with Claude, see streaming responses in real-time, and use SDK-native tools.

**FRs covered:** FR-1.1, FR-1.3, FR-1.4
**NFRs addressed:** NFR-1.1, NFR-6.1, NFR-6.2

---

### Epic 3: Session Persistence
Users can close the app, reopen it, and continue their conversation exactly where they left off with fast context restore.

**FRs covered:** FR-2.1, FR-2.2, FR-2.5, FR-2.6, FR-2.7, FR-10.4
**NFRs addressed:** NFR-1.4, NFR-2.3, NFR-2.7, NFR-2.8, NFR-2.9, NFR-9.1, NFR-9.2

---

### Epic 4: PARA Filesystem Foundation
Users have a structured `~/Orion/` directory with Projects, Areas, Resources, Archive, and Inbox folders that the agent can read and write.

**FRs covered:** FR-5.1, FR-5.2, FR-5.3, FR-5.6, FR-5.7
**NFRs addressed:** NFR-9.5

---

### Epic 5: GTD Sidebar Navigation
Users can navigate between Inbox, Next, Waiting, Projects, and Someday views via a collapsible sidebar with count badges.

**FRs covered:** FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5, FR-6.8, FR-6.9
**NFRs addressed:** NFR-5.1

---

### Epic 6: Quick Capture & Inbox Processing
Users can quickly capture thoughts/tasks via ⌘N and have the agent help organize them into the correct PARA location with 80%+ accuracy.

**FRs covered:** FR-5.4, FR-5.8, FR-6.6, FR-6.7, FR-6.10
**NFRs addressed:** None specific

---

### Epic 7: Credential & API Key Management
Users can safely store their API keys (Claude, Composio) in macOS Keychain via a Settings interface with validation.

**FRs covered:** FR-10.5, FR-4.5
**NFRs addressed:** NFR-4.1, NFR-4.2, NFR-4.3, NFR-4.4, NFR-4.9

---

### Epic 8: Built-in Tool Servers
On first launch, Orion's bundled MCP tool servers are ready - filesystem access, shell commands, and PARA tools work out of the box.

**FRs covered:** FR-1.4, FR-4.7, FR-5.3
**NFRs addressed:** NFR-2.1, NFR-2.5

---

### Epic 9: Composio SDK Foundation
Users can connect their Composio account, and the dynamic tool discovery system loads tools based on conversation context.

**FRs covered:** FR-4.1, FR-4.2, FR-4.6
**NFRs addressed:** NFR-1.3, NFR-2.6

---

### Epic 10: Gmail Integration
Users can connect Gmail via Composio OAuth and ask Orion to read, search, and draft emails.

**FRs covered:** FR-4.3
**NFRs addressed:** NFR-4.10

---

### Epic 11: Calendar Integration
Users can connect Google Calendar via Composio OAuth and ask Orion to check schedule and create events.

**FRs covered:** FR-4.4
**NFRs addressed:** NFR-4.10

---

### Epic 12: Permission System
Users see clear permission prompts for write operations, can approve/deny actions inline, and have sensitive files automatically protected.

**FRs covered:** FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-7.5, FR-7.6, FR-7.7
**NFRs addressed:** NFR-4.5, NFR-2.10

---

### Epic 13: Audit Trail & Transparency
Users can see what external actions Orion has taken via an action log with sanitized inputs.

**FRs covered:** FR-7.9, FR-10.6
**NFRs addressed:** NFR-4.6, NFR-4.7, NFR-4.8, NFR-9.3

---

### Epic 14: Canvas Foundation
Users see inline canvases spawn in the conversation thread for structured interactions, with persistence and collapse/expand.

**FRs covered:** FR-8.1, FR-8.7, FR-8.9, FR-8.10
**NFRs addressed:** None specific

---

### Epic 15: Calendar & Approval Canvases
Users can pick meeting times from a calendar canvas with conflict detection and approve/deny actions via approval cards.

**FRs covered:** FR-8.2, FR-8.6
**NFRs addressed:** None specific

---

### Epic 16: Email & Task Canvases
Users can compose/edit emails with tone controls and manage task lists via interactive canvases.

**FRs covered:** FR-8.3, FR-8.4, FR-8.5, FR-8.8
**NFRs addressed:** None specific

---

### Epic 17: Skill Loading & Activation
Users can trigger skills via `/commands` or keywords, with skills hot-reloading on file changes.

**FRs covered:** FR-3.1, FR-3.2, FR-3.3
**NFRs addressed:** NFR-1.5, NFR-2.4, NFR-6.3

---

### Epic 18: Agent & Subagent System
The main agent can spawn specialized subagents (triage, scheduler, communicator, researcher) for complex tasks with proper context handoff.

**FRs covered:** FR-3.4, FR-3.5, FR-3.6, FR-9.6, FR-9.7, FR-9.8, FR-9.9
**NFRs addressed:** NFR-3.3, NFR-6.5

---

### Epic 19: Hook System
Lifecycle hooks fire at appropriate events (SessionStart, PreToolUse, PostToolUse, SessionEnd) enabling context injection, permission enforcement, and audit.

**FRs covered:** FR-3.7, FR-3.8, FR-3.9, FR-7.8, FR-9.10, FR-9.11, FR-9.12, FR-9.13
**NFRs addressed:** NFR-1.6, NFR-6.6, NFR-6.7, NFR-6.8, NFR-6.9

---

### Epic 20: Butler Plugin Skills
Users have access to the full Butler skill suite: `/briefing`, `/inbox`, `/schedule`, `/email`, `/review` as a validated plugin package.

**FRs covered:** FR-9.1, FR-9.2, FR-9.3, FR-9.4, FR-9.5, FR-9.14
**NFRs addressed:** NFR-6.4

---

### Epic 21: Session Advanced Features
Users can fork sessions for "what-if" scenarios, export transcripts to JSONL, and use extended thinking for complex reasoning.

**FRs covered:** FR-1.5, FR-1.7, FR-2.3, FR-2.4
**NFRs addressed:** NFR-3.4

---

### Epic 22: Context Intelligence
The system maintains context efficiently via prompt caching, PARA-aware compaction, MCP connections, and performance monitoring.

**FRs covered:** FR-1.2, FR-1.6, FR-1.8, FR-3.10, FR-4.8, FR-10.3, FR-10.10, FR-10.11, FR-10.12
**NFRs addressed:** NFR-1.7, NFR-2.1, NFR-3.1, NFR-3.5, NFR-3.6, NFR-5.5, NFR-5.7, NFR-5.8, NFR-7.1-7.11

---

### Epic 23: Plugin Ecosystem & Archive
Users can install community plugins from Git repos with manifest validation, and completed items are auto-archived by month.

**FRs covered:** FR-3.11, FR-3.12, FR-3.13, FR-3.14, FR-5.5
**NFRs addressed:** NFR-6.4, NFR-6.12

---

## Epic 0: Sprint 0 Test Infrastructure

Before Epic 1 begins, the test infrastructure must be established to prevent developer mistakes, ensure NFR compliance, and enable TDD workflows.

**Source:** `thoughts/planning-artifacts/test-design-system.md` (TEA Testability Review)
**NFRs addressed:** NFR-6.5, NFR-6.6, NFR-6.7 (Maintainability), NFR-2.x (Reliability)

### Story 0.1: MSW Mock Server with Composio MCP Patterns

As a **developer**,
I want MSW (Mock Service Worker) configured to intercept Composio MCP protocol calls,
So that I can write integration tests without requiring live Composio connections.

**Acceptance Criteria:**

**Given** MSW is installed and configured
**When** a test makes a Composio tool call (e.g., GMAIL_GET_EMAILS)
**Then** MSW intercepts and returns mock data without network calls

**Given** mock responses are defined for MCP protocol
**When** the test runs in CI
**Then** no external network calls are made to Composio servers

**Technical Requirements:**
- Install `msw@^2.0` as dev dependency
- Create `tests/fixtures/mocks/composio/` with mock handlers
- Support tool call patterns: `GMAIL_*`, `CALENDAR_*`
- Document mock patterns in `tests/README.md`

**Owner:** TBD
**Priority:** Critical (TC-1)
**Mitigates:** Testability Concern TC-1 (Score 6)

---

### Story 0.2: Tauri IPC Streaming Test Helpers

As a **developer**,
I want Playwright helpers to intercept Tauri IPC streaming events,
So that I can test first-token latency and streaming UI behavior deterministically.

**Acceptance Criteria:**

**Given** the Playwright test helper is imported
**When** I call `await tauriHelper.waitForStreamEvent('text_block')`
**Then** the test waits for the specific IPC event without timing-based waits

**Given** streaming is in progress
**When** I measure first-token latency using the helper
**Then** I get accurate timing that matches NFR-1.1 (<500ms p95)

**Technical Requirements:**
- Create `tests/fixtures/helpers/tauri-ipc.ts`
- Support `tauri://` protocol event interception
- Provide `waitForStreamEvent(type)` method
- Provide `measureFirstTokenLatency()` method
- Document usage in `tests/README.md`

**Owner:** TBD
**Priority:** Critical (TC-2)
**Mitigates:** Testability Concern TC-2 (Score 6)

---

### Story 0.3: XState Test Model for Streaming Determinism

As a **developer**,
I want XState test model configuration for streaming state machine,
So that I can achieve deterministic test coverage of all streaming states without race conditions.

**Acceptance Criteria:**

**Given** XState test model is configured
**When** I run `npx vitest run --project=xstate-tests`
**Then** all streaming state paths are tested deterministically

**Given** streaming UI test runs
**When** state transitions occur
**Then** tests use `waitForResponse` instead of `waitForTimeout`

**Technical Requirements:**
- Install `@xstate/test@^0.5` as dev dependency
- Create `tests/unit/state-management/streaming.xstate-test.ts`
- Define test model covering: idle → streaming → complete, idle → streaming → error
- Ensure all state transitions use deterministic waits
- Target: 100% state coverage for streaming machine

**Owner:** TBD
**Priority:** Critical (TC-3)
**Mitigates:** Testability Concern TC-3 (Score 6)

---

### Story 0.4: k6 Baseline Script with SLO Thresholds

As a **developer**,
I want k6 load test baseline scripts with SLO thresholds defined,
So that I can validate NFR-1.1 (first token latency) before Epic 1 completion.

**Acceptance Criteria:**

**Given** k6 is installed and configured
**When** I run `k6 run tests/performance/baseline.k6.js`
**Then** the test validates p95 first_token_latency < 500ms

**Given** load test runs
**When** any SLO threshold is exceeded
**Then** the test fails with clear threshold violation message

**Technical Requirements:**
- Install k6 (via brew or download)
- Create `tests/performance/baseline.k6.js`
- Define thresholds: `first_token_latency p95<500`, `tool_invocation p95<2000`, `errors rate<0.01`
- Create mock server target for baseline testing
- Document in `tests/performance/README.md`

**Owner:** TBD
**Priority:** Medium (TC-6)

---

### Story 0.5: Test Factories for Core Entities

As a **developer**,
I want test factories for User, Session, Skill, and Hook entities,
So that I can seed test databases with consistent, valid test data.

**Acceptance Criteria:**

**Given** I import the factory
**When** I call `UserFactory.create({ name: 'Test User' })`
**Then** a valid User entity is created with default values for missing fields

**Given** I need multiple related entities
**When** I call `SessionFactory.createWithMessages(5)`
**Then** a session with 5 related messages is created

**Technical Requirements:**
- Create `tests/fixtures/factories/` directory
- Implement: `UserFactory`, `SessionFactory`, `SkillFactory`, `HookFactory`
- Support `create()`, `createMany(n)`, and relationship helpers
- Use Drizzle ORM types for type safety
- Document factory patterns in `tests/README.md`

**Owner:** TBD
**Priority:** Medium

---

### Story 0.6: SQLite Test Fixtures with Auto-Cleanup

As a **developer**,
I want SQLite test fixtures with automatic cleanup after each test,
So that tests remain isolated and don't pollute the database.

**Acceptance Criteria:**

**Given** test fixture is applied
**When** test creates database records
**Then** records exist only during that test execution

**Given** test completes (pass or fail)
**When** cleanup runs
**Then** all test-created data is removed automatically

**Technical Requirements:**
- Create `tests/fixtures/database/setup.ts`
- Use in-memory SQLite for unit tests (`:memory:`)
- Use file-based SQLite with transactions for integration tests
- Implement `beforeEach` / `afterEach` hooks for cleanup
- Support WAL mode for non-blocking reads in parallel tests

**Owner:** TBD
**Priority:** Medium

---

### Story 0.7: CI Pipeline with Coverage Gates

As a **developer**,
I want GitHub Actions CI pipeline with coverage thresholds,
So that PRs are blocked if coverage drops below 80% (unit) or 70% (integration).

**Acceptance Criteria:**

**Given** PR is opened
**When** CI runs
**Then** unit tests, integration tests, and E2E tests all execute

**Given** unit test coverage is below 80%
**When** CI completes
**Then** the check fails with coverage threshold message

**Given** all tests pass with adequate coverage
**When** CI completes
**Then** PR is marked as ready to merge

**Technical Requirements:**
- Create `.github/workflows/test.yml`
- Jobs: `unit-tests`, `integration-tests`, `e2e-tests`, `security-audit`
- Coverage thresholds: 80% lines (unit), 70% lines (integration)
- Use `vitest --coverage` with `coverage-summary.json` parsing
- E2E tests run on `macos-latest` (Tauri requirement)
- Include security audit script from test-design-system.md

**Owner:** TBD
**Priority:** Medium

---

## Epic 1: Application Shell & First Launch

Users can install and launch Orion, see the main interface with Editorial Luxury aesthetic, and experience responsive layout with keyboard shortcuts.

**FRs covered:** FR-10.1, FR-10.2, FR-10.7, FR-10.8, FR-10.9
**NFRs addressed:** NFR-1.2, NFR-5.1, NFR-5.2, NFR-5.3, NFR-8.1, NFR-8.4

### Story 1.1: Initialize Tauri Project

As a **developer**,
I want the project scaffolded with Tauri 2.0 + Next.js 15 + shadcn/ui,
So that I have a working foundation that builds and runs on macOS.

**Acceptance Criteria:**

**Given** no project exists
**When** I run `npx create-tauri-ui@latest orion --template next`
**Then** the project structure is created with Tauri 2.0, Next.js 15, shadcn/ui, and TypeScript
**And** `npm run tauri dev` launches a window on macOS 12+
**And** the app cold starts to interactive UI in <3 seconds (NFR-1.2)

### Story 1.2: Install Design System Fonts

As a **user**,
I want the app to display Playfair Display for headings and Inter for body text,
So that the interface has the Editorial Luxury aesthetic.

**Acceptance Criteria:**

**Given** the Tauri app is running
**When** I view any screen
**Then** display headings use Playfair Display font
**And** body text uses Inter font
**And** fonts load without FOUT (flash of unstyled text) via next/font

### Story 1.3: Define CSS Design Tokens

As a **developer**,
I want all design tokens defined as CSS variables,
So that the design system is consistent and maintainable.

**Acceptance Criteria:**

**Given** the design-system.md specification
**When** I inspect the CSS
**Then** color tokens exist: `--gold-accent: #D4AF37`, `--bg-primary`, `--text-primary`, etc.
**And** spacing tokens exist: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
**And** border-radius is 0px throughout
**And** animation tokens exist: 200ms entrance, 150ms exit, 100ms state change

### Story 1.4: Sidebar Column

As a **user**,
I want to see a 280px left sidebar,
So that I can navigate between GTD views.

**Acceptance Criteria:**

**Given** the app is launched
**When** I view the main screen at desktop width
**Then** the left sidebar is exactly 280px wide
**And** it has proper background color from design tokens
**And** it is keyboard navigable (NFR-5.1)

### Story 1.5: Main Chat Column

As a **user**,
I want a flexible center column for chat,
So that conversations have room to display.

**Acceptance Criteria:**

**Given** the app is launched
**When** I view the main screen
**Then** the center column fills remaining space (flex: 1)
**And** it has a scrollable message area
**And** it has a fixed input area at the bottom

### Story 1.6: Canvas Column Placeholder

As a **user**,
I want a hidden third column that can display canvases,
So that structured interactions appear alongside chat.

**Acceptance Criteria:**

**Given** the app is launched
**When** no canvas is active
**Then** the right column is hidden (width: 0)
**And** CSS variables exist for `--canvas-width: 480px`
**And** the column can be shown/hidden via state

### Story 1.7: Button Component Hierarchy

As a **user**,
I want buttons styled according to the design system,
So that actions are visually consistent.

**Acceptance Criteria:**

**Given** the design system specification
**When** I use button components
**Then** Primary buttons have gold background (#D4AF37) with dark text
**And** Secondary buttons have transparent background with gold border
**And** Tertiary buttons have no border, text only
**And** Destructive buttons have red text for dangerous actions
**And** all buttons have 0px border-radius

### Story 1.8: Input Field Component

As a **user**,
I want styled input fields for chat,
So that text entry feels polished.

**Acceptance Criteria:**

**Given** the chat input area
**When** I focus the input
**Then** a 2px gold outline appears with 2px offset
**And** the input has 0px border-radius
**And** placeholder text uses muted color from design tokens

### Story 1.9: Status Indicator Component

As a **user**,
I want to see agent status (Working/Waiting/Idle),
So that I know what Orion is doing.

**Acceptance Criteria:**

**Given** the chat interface
**When** the agent is processing
**Then** a "Working" indicator displays with animation
**When** the agent is waiting for external response
**Then** a "Waiting" indicator displays (blue)
**When** the agent is idle
**Then** an "Idle" indicator displays (subtle/muted)

### Story 1.10: Desktop Breakpoint

As a **user**,
I want the full three-column layout at ≥1280px,
So that I can see sidebar, chat, and canvas together.

**Acceptance Criteria:**

**Given** a viewport width ≥1280px
**When** the app is displayed
**Then** sidebar (280px), chat (flex), and canvas (480px when visible) are all visible
**And** no horizontal scrolling occurs
**And** layout uses CSS Grid or Flexbox

### Story 1.11: Laptop Breakpoint

As a **user**,
I want a compact layout at 1024-1279px,
So that the app works on smaller laptop screens.

**Acceptance Criteria:**

**Given** a viewport width between 1024px and 1279px
**When** the app is displayed
**Then** sidebar collapses to icon-only mode (48px)
**And** chat expands to fill more space
**And** canvas overlays chat when visible (instead of side-by-side)

### Story 1.12: Tablet Breakpoint

As a **user**,
I want overlay navigation at <1024px,
So that the app works on tablet screens.

**Acceptance Criteria:**

**Given** a viewport width <1024px
**When** the app is displayed
**Then** sidebar is hidden by default
**And** sidebar slides in as overlay when triggered
**And** canvas appears as full-width overlay when active
**And** hamburger menu icon is visible to toggle sidebar

### Story 1.13: Dark Mode - System Detection

As a **user**,
I want the app to match my system dark/light preference,
So that it feels native to my macOS settings.

**Acceptance Criteria:**

**Given** macOS is set to dark mode
**When** I launch the app (with no manual override set)
**Then** the app displays in dark mode
**And** design tokens switch to dark variants (`--bg-primary-dark`, etc.)
**When** macOS switches to light mode
**Then** the app switches to light mode automatically

### Story 1.14: Dark Mode - Manual Toggle

As a **user**,
I want to manually override the dark/light mode,
So that I can choose my preference independent of system.

**Acceptance Criteria:**

**Given** the Settings interface
**When** I select "Light", "Dark", or "System" theme option
**Then** the app respects my choice
**And** the preference persists across app restarts
**And** "System" reverts to automatic detection

### Story 1.15: Global Keyboard Shortcuts

As a **user**,
I want keyboard shortcuts for primary actions,
So that I can work efficiently without mouse (FR-10.7).

**Acceptance Criteria:**

**Given** the app is focused
**When** I press ⌘N
**Then** quick capture is triggered (placeholder action)
**When** I press ⌘[
**Then** sidebar collapses/expands (FR-6.9)
**When** I press ⌘K
**Then** command palette opens (placeholder)
**When** I press ⌘Enter in chat input
**Then** message is sent
**And** shortcuts do not conflict with system shortcuts

### Story 1.16: Focus States

As a **user**,
I want visible focus indicators on all interactive elements,
So that I can navigate by keyboard (NFR-5.1).

**Acceptance Criteria:**

**Given** I am navigating with keyboard
**When** I Tab to any interactive element
**Then** a 2px gold (#D4AF37) outline appears with 2px offset
**And** focus is visible against both light and dark backgrounds
**And** focus order follows logical reading order

### Story 1.17: VoiceOver Support

As a **user with visual impairment**,
I want the app to work with VoiceOver,
So that I can use Orion with a screen reader (NFR-5.2).

**Acceptance Criteria:**

**Given** VoiceOver is enabled on macOS
**When** I navigate the app
**Then** all interactive elements have accessible names
**And** landmarks (navigation, main, complementary) are properly labeled
**And** dynamic content changes are announced via ARIA live regions
**And** the sidebar navigation reads correctly

### Story 1.18: Touch Targets & Contrast

As a **user**,
I want adequate touch targets and color contrast,
So that the app meets accessibility standards (FR-10.8).

**Acceptance Criteria:**

**Given** the app interface
**When** I measure interactive elements
**Then** all buttons and controls are at least 44x44px
**And** text contrast meets WCAG AA ratio (4.5:1 for body, 3:1 for large text)
**And** non-text contrast meets 3:1 for UI components

### Story 1.19: Reduced Motion

As a **user with motion sensitivity**,
I want animations to respect my system preference,
So that I'm not disoriented by motion.

**Acceptance Criteria:**

**Given** macOS "Reduce motion" is enabled
**When** the app performs animations
**Then** animations are replaced with instant transitions or subtle fades
**And** no parallax, bounce, or zoom effects occur
**And** essential feedback (like loading) uses opacity changes instead

### Story 1.20: Icon System Setup

As a **developer**,
I want a consistent icon system using Lucide,
So that icons are unified across the app.

**Acceptance Criteria:**

**Given** the Lucide icon library is installed
**When** I use icons in components
**Then** icons use consistent sizing (16px, 20px, 24px variants)
**And** icons inherit text color for theming
**And** icons have accessible labels when not decorative
**And** hover/active states are consistent with button states

---

## Epic 2: First Conversation

Users can have their first conversation with Claude, see streaming responses in real-time, and use SDK-native tools.

**FRs covered:** FR-1.1, FR-1.3, FR-1.4
**NFRs addressed:** NFR-1.1, NFR-2.6, NFR-6.1, NFR-6.2

### Story 2.1: Install Claude Agent SDK

As a **developer**,
I want the Claude Agent SDK installed as a dependency,
So that I can integrate with Claude's agentic capabilities.

**Acceptance Criteria:**

**Given** the Tauri project from Epic 1
**When** I run `npm install @anthropic-ai/claude-agent-sdk`
**Then** the package is added to package.json
**And** TypeScript types are available for SDK classes
**And** the SDK version uses stable v1 features only (NFR-6.2)

### Story 2.2: Create SDK Wrapper Interface

As a **developer**,
I want SDK calls abstracted behind a wrapper interface,
So that SDK upgrades don't require changes throughout the codebase (NFR-6.1).

**Acceptance Criteria:**

**Given** the SDK is installed
**When** I define the wrapper interface
**Then** `IAgentSDK` interface exists with `query()`, `getSession()`, `endSession()` methods
**And** concrete implementation `ClaudeAgentSDK` implements the interface
**And** all application code imports from the wrapper, never directly from SDK

### Story 2.3: Implement query() Wrapper

As a **developer**,
I want a wrapped `query()` function with error handling,
So that streaming responses are properly managed.

**Acceptance Criteria:**

**Given** the SDK wrapper interface
**When** I call `agentSDK.query(prompt, options)`
**Then** it returns an async iterator yielding SDK message types
**And** API errors are caught and wrapped in a consistent error type
**And** the wrapper supports optional `sessionId` for continuity
**And** the wrapper supports optional `model` selection (Opus, Sonnet)

### Story 2.4: Create Tauri IPC Command for Chat

As a **developer**,
I want a Tauri command that invokes the SDK,
So that the frontend can send messages to Claude.

**Acceptance Criteria:**

**Given** the SDK wrapper is implemented
**When** frontend calls `invoke('orion:chat:send', { prompt, sessionId })`
**Then** the Rust backend spawns the SDK query
**And** a unique `requestId` is returned immediately for stream correlation
**And** the command is non-blocking (streaming happens via events)

### Story 2.5: Implement IPC Event Streaming

As a **developer**,
I want SDK messages streamed via Tauri events,
So that the frontend receives real-time updates.

**Acceptance Criteria:**

**Given** a chat query is in progress
**When** the SDK yields a message (TextBlock, ToolUseBlock, etc.)
**Then** a Tauri event `orion:chat:stream` is emitted with `{ requestId, type, payload }`
**When** the query completes
**Then** a final event `orion:chat:complete` is emitted with `{ requestId, cost, duration }`
**And** events include the `requestId` for multiplexed stream handling

### Story 2.6: Create Streaming State Machine

As a **developer**,
I want an XState machine managing chat UI state,
So that streaming, errors, and completion are handled predictably.

**Acceptance Criteria:**

**Given** the chat component
**When** I model the state machine
**Then** states exist: `idle`, `sending`, `streaming`, `complete`, `error`
**And** transitions: `idle → sending` on user submit, `sending → streaming` on first event, `streaming → complete` on final event
**And** `error` state is reachable from `sending` or `streaming`
**And** machine resets to `idle` when starting new message

### Story 2.7: Render TextBlock Messages

As a **user**,
I want to see Claude's text responses stream in real-time,
So that I get immediate feedback.

**Acceptance Criteria:**

**Given** a streaming response is active
**When** a `TextBlock` event arrives
**Then** text appends to the current assistant message bubble
**And** a typewriter effect displays characters smoothly (configurable speed)
**And** text supports markdown rendering (bold, italic, code, links)

### Story 2.8: Render ThinkingBlock Indicator

As a **user**,
I want to see when Claude is thinking deeply,
So that I understand why responses may take longer.

**Acceptance Criteria:**

**Given** extended thinking is enabled for the query
**When** a `ThinkingBlock` event arrives
**Then** a "Thinking..." indicator displays with subtle animation
**And** the indicator persists until text or tool output begins
**And** thinking content is NOT displayed to user (internal reasoning)

### Story 2.9: Render ToolUseBlock Status

As a **user**,
I want to see when Claude invokes a tool,
So that I understand what actions are being taken.

**Acceptance Criteria:**

**Given** a streaming response is active
**When** a `ToolUseBlock` event arrives
**Then** a tool status chip displays with the tool name (e.g., "Reading file...")
**And** the chip shows a loading/spinner state
**And** multiple concurrent tools show multiple chips
**And** tool inputs are summarized (e.g., file path, command)

### Story 2.10: Render ToolResultBlock Status

As a **user**,
I want to see when a tool completes,
So that I know the action succeeded or failed.

**Acceptance Criteria:**

**Given** a tool chip is displayed
**When** a `ToolResultBlock` event arrives matching the tool's `id`
**Then** the chip updates to show success (checkmark) or error (X) icon
**And** if error, the chip shows red styling
**And** tool output is optionally expandable (collapsed by default)

### Story 2.11: Display ResultMessage Completion

As a **user**,
I want to see when a response is fully complete,
So that I know Claude has finished.

**Acceptance Criteria:**

**Given** a streaming response is active
**When** a `ResultMessage` event arrives
**Then** the loading/streaming indicators stop
**And** the message is marked as complete in the UI
**And** token cost is logged for internal tracking (not displayed by default)
**And** the chat input is re-enabled for the next message

### Story 2.12: Chat Input Send Handler

As a **user**,
I want to send messages via keyboard or button,
So that I can communicate with Claude.

**Acceptance Criteria:**

**Given** the chat input has text
**When** I press ⌘Enter or click the Send button
**Then** the message is sent to the backend
**And** the input is cleared
**And** the input is disabled while sending (re-enabled on complete/error)
**When** the input is empty
**Then** the Send action is disabled

### Story 2.13: Message Thread Layout

As a **user**,
I want a scrollable message thread,
So that I can review conversation history.

**Acceptance Criteria:**

**Given** the chat column
**When** messages are displayed
**Then** user messages appear right-aligned with distinct styling
**And** assistant messages appear left-aligned with distinct styling
**And** the thread auto-scrolls to newest message on new content
**And** manual scroll-up pauses auto-scroll (resume on scroll to bottom)

### Story 2.14: First Token Latency Tracking

As a **developer**,
I want to track time to first token,
So that I can verify NFR-1.1 (<500ms p95).

**Acceptance Criteria:**

**Given** a message is sent
**When** the first `TextBlock` or `ToolUseBlock` arrives
**Then** the elapsed time from send to first event is logged
**And** logs include `{ requestId, firstTokenMs, timestamp }`
**And** latency exceeding 500ms is flagged in logs

### Story 2.15: Error State Handling

As a **user**,
I want clear error messages when something fails,
So that I understand what went wrong.

**Acceptance Criteria:**

**Given** a chat query is in progress
**When** a network error occurs
**Then** an error message displays: "Unable to reach Claude. Check your connection."
**When** an API error occurs (401)
**Then** an error message displays: "Invalid API key. Check Settings."
**When** a rate limit error occurs (429)
**Then** an error message displays: "Rate limited. Retrying..."
**And** error messages use red text per design system

### Story 2.16: Retry on Transient Failures

As a **user**,
I want transient failures to retry automatically,
So that temporary issues don't require manual re-sending (NFR-2.6).

**Acceptance Criteria:**

**Given** a 429 or 5xx error occurs
**When** the error is detected
**Then** the system retries with exponential backoff: 500ms → 1s → 2s → 4s (max 30s)
**And** the UI shows "Retrying..." with attempt count
**When** max retries (5) are exhausted
**Then** the error state is shown with a manual "Retry" button
**And** successful retry continues streaming normally

---

## Epic 3: Session Persistence

Users can close the app, reopen it, and continue their conversation exactly where they left off with fast context restore.

**FRs covered:** FR-2.1, FR-2.2, FR-2.5, FR-2.6, FR-2.7, FR-10.4
**NFRs addressed:** NFR-1.4, NFR-2.3, NFR-2.7, NFR-2.8, NFR-9.1, NFR-9.2

### Story 3.1: Initialize SQLite Database

As a **developer**,
I want the SQLite database created on first launch,
So that session data has a persistent store.

**Acceptance Criteria:**

**Given** the app launches for the first time
**When** no database exists at `~/Library/Application Support/Orion/orion.db`
**Then** the database file is created
**And** WAL journal mode is enabled (`PRAGMA journal_mode=WAL`)
**And** foreign keys are enabled (`PRAGMA foreign_keys=ON`)
**And** the app directory is created if it doesn't exist

### Story 3.2: Configure Drizzle ORM

As a **developer**,
I want Drizzle ORM configured for type-safe database queries,
So that database operations are safe and maintainable.

**Acceptance Criteria:**

**Given** the SQLite database is initialized
**When** I configure Drizzle
**Then** schema files exist in `src/db/schema/`
**And** type inference works for all table columns
**And** migrations can be generated via `drizzle-kit`
**And** the ORM connects via tauri-plugin-sql

### Story 3.3: Create Conversations Table

As a **developer**,
I want a conversations table to store session metadata,
So that sessions can be listed and resumed.

**Acceptance Criteria:**

**Given** the database is initialized
**When** the schema is applied
**Then** `conversations` table exists with columns:
  - `id` (TEXT PRIMARY KEY, format: `conv_xxx`)
  - `title` (TEXT)
  - `sdk_session_id` (TEXT, links to Claude SDK session)
  - `type` (TEXT: 'daily', 'project', 'inbox', 'adhoc')
  - `project_id` (TEXT, nullable FK to projects)
  - `started_at` (TEXT, ISO timestamp)
  - `last_message_at` (TEXT, ISO timestamp)
  - `message_count` (INTEGER)
  - `context_summary` (TEXT, for compaction)

### Story 3.4: Create Messages Table

As a **developer**,
I want a messages table to store conversation history,
So that messages persist across app restarts.

**Acceptance Criteria:**

**Given** the conversations table exists
**When** the schema is applied
**Then** `messages` table exists with columns:
  - `id` (TEXT PRIMARY KEY, format: `msg_xxx`)
  - `conversation_id` (TEXT FK to conversations)
  - `role` (TEXT: 'user', 'assistant')
  - `content` (TEXT)
  - `tool_calls` (TEXT, JSON array of tool use)
  - `tool_results` (TEXT, JSON array of results)
  - `created_at` (TEXT, ISO timestamp)
**And** index exists on `conversation_id` for fast lookups

### Story 3.5: Create Session Index Table

As a **developer**,
I want a session index for fast resumption lookups,
So that restore performance meets NFR-1.4 (<1s).

**Acceptance Criteria:**

**Given** the database schema
**When** I query for recent sessions
**Then** `session_index` table exists with:
  - `id` (TEXT PRIMARY KEY)
  - `conversation_id` (TEXT FK)
  - `type` (TEXT)
  - `display_name` (TEXT)
  - `last_active` (TEXT, ISO timestamp)
  - `is_active` (INTEGER, boolean)
**And** index exists on `last_active DESC` for recency queries
**And** index is separate from conversation data for isolation (NFR-9.2)

### Story 3.6: Implement Session Type Naming

As a **user**,
I want sessions named according to their type,
So that I can identify them easily (FR-2.1).

**Acceptance Criteria:**

**Given** a new session is created
**When** the type is "daily"
**Then** the display name is "Daily - January 23, 2026"
**When** the type is "project"
**Then** the display name is "Project: {project_name}"
**When** the type is "inbox"
**Then** the display name is "Inbox Processing"
**When** the type is "adhoc"
**Then** the display name is auto-generated or user-provided
**And** names are stored in session_index

### Story 3.7: Auto-Save Message on Receive

As a **user**,
I want messages saved automatically after each exchange,
So that I never lose conversation progress (NFR-2.8).

**Acceptance Criteria:**

**Given** a streaming response completes
**When** the `ResultMessage` event is received
**Then** the user message is saved to messages table
**And** the assistant message is saved to messages table
**And** conversation `last_message_at` is updated
**And** conversation `message_count` is incremented
**And** saves happen without blocking the UI

### Story 3.8: Atomic Write Transactions

As a **developer**,
I want database writes wrapped in transactions,
So that data integrity is guaranteed (NFR-9.1).

**Acceptance Criteria:**

**Given** a multi-table write operation
**When** saving a message (message + conversation update)
**Then** both operations are in a single transaction
**And** if any operation fails, all are rolled back
**And** partial writes never occur
**And** WAL mode allows concurrent reads during writes

### Story 3.9: Load Conversation on App Launch

As a **user**,
I want my last conversation restored when I open the app,
So that I can continue where I left off.

**Acceptance Criteria:**

**Given** the app launches
**When** a previous session exists
**Then** the most recent active conversation is loaded
**And** all messages are displayed in the chat thread
**And** the SDK session is resumed if still valid
**And** the conversation title is displayed in the header

### Story 3.10: Session Selector UI

As a **user**,
I want to see and switch between recent sessions,
So that I can access previous conversations.

**Acceptance Criteria:**

**Given** the sidebar or header area
**When** I view the session selector
**Then** recent sessions are listed (most recent first)
**And** each entry shows display name and last active time
**And** clicking a session loads it into the chat area
**And** the current session is visually highlighted
**And** a "New Session" option is available

### Story 3.11: Daily Session Auto-Resume

As a **user**,
I want my daily session to auto-resume if I return the same day,
So that my daily context is preserved (FR-2.2).

**Acceptance Criteria:**

**Given** a daily session from today exists
**When** I launch the app
**Then** the daily session is automatically loaded
**And** I see my earlier messages from today
**When** it's a new day
**Then** a new daily session is created instead
**And** yesterday's daily session remains accessible in history

### Story 3.12: Project Session Persistence

As a **user**,
I want project sessions to persist across days,
So that long-running project work is maintained (FR-2.2).

**Acceptance Criteria:**

**Given** a project session exists
**When** I open the app days later
**Then** the project session is still available in session list
**And** loading it restores all previous messages
**And** the SDK session context is resumed
**And** project sessions never auto-archive (unlike daily)

### Story 3.13: Context Restore Performance

As a **developer**,
I want session restore to complete in under 1 second,
So that NFR-1.4 is satisfied.

**Acceptance Criteria:**

**Given** a session with up to 100 messages
**When** the session is loaded
**Then** all messages render in <1 second
**And** performance is measured and logged
**And** if >1s, a warning is logged for investigation
**And** lazy loading is used for very long sessions (>100 messages)

### Story 3.14: Corrupt Session Isolation

As a **user**,
I want corrupted session data to not crash the app,
So that I can still use other sessions (NFR-2.7).

**Acceptance Criteria:**

**Given** a session with corrupted JSON or missing FK
**When** the app attempts to load it
**Then** the error is caught and logged
**And** the session is marked as corrupted in the index
**And** the app falls back to creating a new session
**And** an error message is shown: "Session could not be restored"
**And** other sessions remain accessible

### Story 3.15: Session Metadata Display

As a **user**,
I want to see session type and last active time,
So that I can understand my session history (FR-2.7).

**Acceptance Criteria:**

**Given** the session selector UI
**When** I view a session entry
**Then** the session type is shown (Daily, Project, Inbox, Ad-hoc)
**And** the last active timestamp is shown in relative format ("2 hours ago")
**And** project sessions show the linked project name
**And** message count is optionally shown

---

## Epic 4: PARA Filesystem Foundation

Users have a structured `~/Orion/` directory with Projects, Areas, Resources, Archive, and Inbox folders that the agent can read and write.

**FRs covered:** FR-5.1, FR-5.2, FR-5.3, FR-5.6, FR-5.7
**NFRs addressed:** NFR-9.5

### Story 4.1: Create PARA Root Directory

As a **user**,
I want my PARA structure created on first launch,
So that I have an organized place for my data.

**Acceptance Criteria:**

**Given** the app launches for the first time
**When** no `~/Orion/` directory exists
**Then** the directory is created at `~/Orion/`
**And** a `.orion/` system folder is created inside
**And** a `config.yaml` is created with default settings
**And** the directory has standard user permissions (755)

### Story 4.2: Create Projects Directory

As a **user**,
I want a projects folder for my active work,
So that I can organize deadline-driven work.

**Acceptance Criteria:**

**Given** the PARA root is created
**When** initialization completes
**Then** `~/Orion/projects/` directory exists
**And** `~/Orion/projects/_index.yaml` is created with empty project list
**And** the index file has schema: `{ version: 1, projects: [] }`

### Story 4.3: Create Areas Directory

As a **user**,
I want an areas folder for ongoing responsibilities,
So that I can organize work without deadlines.

**Acceptance Criteria:**

**Given** the PARA root is created
**When** initialization completes
**Then** `~/Orion/areas/` directory exists
**And** `~/Orion/areas/_index.yaml` is created with empty area list
**And** the index file has schema: `{ version: 1, areas: [] }`

### Story 4.4: Create Resources Directory

As a **user**,
I want a resources folder for reference material,
So that I have a place for reusable information.

**Acceptance Criteria:**

**Given** the PARA root is created
**When** initialization completes
**Then** `~/Orion/resources/` directory exists
**And** `~/Orion/resources/_index.yaml` is created
**And** subdirectories are created: `contacts/`, `templates/`, `procedures/`, `preferences/`

### Story 4.5: Create Archive Directory

As a **user**,
I want an archive folder for completed items,
So that old work is preserved but out of the way.

**Acceptance Criteria:**

**Given** the PARA root is created
**When** initialization completes
**Then** `~/Orion/archive/` directory exists
**And** `~/Orion/archive/projects/` subdirectory exists
**And** `~/Orion/archive/areas/` subdirectory exists
**And** archive structure supports monthly organization (`YYYY-MM/`)

### Story 4.6: Create Inbox Directory

As a **user**,
I want an inbox folder for incoming items,
So that I have a capture point for unprocessed items.

**Acceptance Criteria:**

**Given** the PARA root is created
**When** initialization completes
**Then** `~/Orion/inbox/` directory exists
**And** `~/Orion/inbox/_queue.yaml` is created with empty queue
**And** `~/Orion/inbox/items/` subdirectory exists for individual captures
**And** the queue schema is: `{ version: 1, items: [] }`

### Story 4.7: Define Project Meta Schema

As a **developer**,
I want a defined schema for project metadata,
So that projects have consistent structure (FR-5.2).

**Acceptance Criteria:**

**Given** a new project is created
**When** the agent creates `meta.yaml`
**Then** the file includes required fields:
  - `id` (TEXT, format: `proj_xxx`)
  - `name` (TEXT)
  - `status` (ENUM: active, paused, completed, cancelled)
  - `priority` (ENUM: high, medium, low)
  - `deadline` (DATE, optional)
  - `created_at` (ISO timestamp)
  - `updated_at` (ISO timestamp)
**And** optional fields: `description`, `area`, `stakeholders`, `links`
**And** a TypeScript type is defined matching the schema

### Story 4.8: Define Area Meta Schema

As a **developer**,
I want a defined schema for area metadata,
So that areas have consistent structure.

**Acceptance Criteria:**

**Given** a new area is created
**When** the agent creates `meta.yaml`
**Then** the file includes required fields:
  - `id` (TEXT, format: `area_xxx`)
  - `name` (TEXT)
  - `status` (ENUM: active, dormant)
  - `review_cadence` (ENUM: daily, weekly, monthly, quarterly)
  - `created_at` (ISO timestamp)
  - `updated_at` (ISO timestamp)
**And** optional fields: `description`, `goals`, `metrics`
**And** a TypeScript type is defined matching the schema

### Story 4.9: Define Contact Card Schema

As a **developer**,
I want a defined schema for contact cards,
So that contacts are consistently structured (FR-5.6).

**Acceptance Criteria:**

**Given** a new contact is created
**When** the agent creates a contact YAML file
**Then** the file includes required fields:
  - `id` (TEXT, format: `cont_xxx`)
  - `name` (TEXT)
  - `type` (ENUM: person, organization)
  - `created_at` (ISO timestamp)
**And** optional fields:
  - `email`, `phone`, `nickname`
  - `relationship` (friend, family, colleague, vendor)
  - `organization`, `job_title`
  - `notes`, `tags`
  - `preferred_channel`, `timezone`
**And** a TypeScript type is defined matching the schema

### Story 4.10: Create Contacts Subdirectory

As a **user**,
I want a contacts folder with an index,
So that I can maintain a personal address book (FR-5.6).

**Acceptance Criteria:**

**Given** the resources directory exists
**When** initialization completes
**Then** `~/Orion/resources/contacts/` directory exists
**And** `~/Orion/resources/contacts/_index.yaml` is created
**And** the index schema is: `{ version: 1, contacts: [] }`
**And** individual contacts are stored as `{id}.yaml` files

### Story 4.11: Create Templates Subdirectory

As a **user**,
I want a templates folder with starter templates,
So that I have reusable patterns for common tasks (FR-5.7).

**Acceptance Criteria:**

**Given** the resources directory exists
**When** initialization completes
**Then** `~/Orion/resources/templates/` directory exists
**And** `~/Orion/resources/templates/email-templates/` subdirectory exists
**And** `~/Orion/resources/templates/meeting-templates/` subdirectory exists
**And** at least one starter template is included (e.g., `follow-up-email.md`)

### Story 4.12: Agent Read Access to PARA

As a **user**,
I want the agent to read my PARA files,
So that it can understand my projects and context (FR-5.3).

**Acceptance Criteria:**

**Given** the agent is processing a request
**When** it needs context about projects or areas
**Then** SDK Read tool can access any path under `~/Orion/`
**And** YAML files are parsed correctly
**And** file not found errors are handled gracefully
**And** read operations are auto-allowed (no permission prompt per FR-7.4)

### Story 4.13: Agent Write Access to PARA

As a **user**,
I want the agent to write to my PARA files,
So that it can update my data (FR-5.3).

**Acceptance Criteria:**

**Given** the agent needs to create or update PARA data
**When** it uses SDK Write/Edit tools on `~/Orion/` paths
**Then** files are created/updated successfully
**And** YAML formatting is preserved
**And** index files are updated when items are added/removed
**And** write operations to PARA are auto-allowed (FR-7.4)

### Story 4.14: PARA Path Resolver

As a **developer**,
I want a utility to resolve PARA paths,
So that code can reference PARA locations consistently.

**Acceptance Criteria:**

**Given** a PARA reference like `para://projects/q1-launch`
**When** the resolver processes it
**Then** it returns the absolute path: `~/Orion/projects/q1-launch`
**And** `para://inbox` resolves to `~/Orion/inbox/`
**And** `para://contacts/john` resolves to `~/Orion/resources/contacts/john.yaml`
**And** invalid paths return an error result

### Story 4.15: Display PARA Location in Settings

As a **user**,
I want to see where my data is stored,
So that I can find and back it up (NFR-9.5).

**Acceptance Criteria:**

**Given** the Settings interface
**When** I view the Data section
**Then** the PARA location is displayed: `~/Orion/`
**And** the path is selectable/copyable
**And** a "Open in Finder" button is available
**And** the database location is also shown: `~/Library/Application Support/Orion/`

---

## Epic 5: GTD Sidebar Navigation

Users can navigate between Inbox, Next, Waiting, Projects, and Someday views via a collapsible sidebar with count badges.

**FRs covered:** FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5, FR-6.8, FR-6.9
**NFRs addressed:** NFR-5.1

### Story 5.1: Sidebar Container Component

As a **user**,
I want a fixed-width sidebar for navigation,
So that I can access different GTD views.

**Acceptance Criteria:**

**Given** the main application layout
**When** the sidebar is displayed
**Then** it is exactly 280px wide (per design system)
**And** it spans the full viewport height
**And** content is vertically scrollable if it overflows
**And** it has the correct background color from design tokens

### Story 5.2: Inbox Navigation Item

As a **user**,
I want an Inbox item in the sidebar,
So that I can view unprocessed conversations (FR-6.1).

**Acceptance Criteria:**

**Given** the sidebar navigation
**When** I view the navigation items
**Then** "Inbox" appears as a clickable item
**And** clicking it navigates to the Inbox view
**And** it displays a count badge showing unprocessed item count
**And** the item uses the correct typography and spacing

### Story 5.3: Next Actions Navigation Item

As a **user**,
I want a Next Actions item in the sidebar,
So that I can view tasks ready to do (FR-6.2).

**Acceptance Criteria:**

**Given** the sidebar navigation
**When** I view the navigation items
**Then** "Next" appears as a clickable item
**And** clicking it navigates to the Next Actions view
**And** it displays a count badge showing tasks with `status: next`
**And** the item uses the correct typography and spacing

### Story 5.4: Waiting For Navigation Item

As a **user**,
I want a Waiting For item in the sidebar,
So that I can view tasks pending others (FR-6.4).

**Acceptance Criteria:**

**Given** the sidebar navigation
**When** I view the navigation items
**Then** "Waiting" appears as a clickable item
**And** clicking it navigates to the Waiting For view
**And** it displays a count badge showing tasks with `status: waiting`
**And** the badge uses blue styling to indicate waiting state

### Story 5.5: Projects Navigation Item

As a **user**,
I want a Projects item in the sidebar,
So that I can view active projects (FR-6.3).

**Acceptance Criteria:**

**Given** the sidebar navigation
**When** I view the navigation items
**Then** "Projects" appears as a clickable item
**And** clicking it navigates to the Projects view
**And** it displays a count badge showing active project count
**And** the item uses the correct typography and spacing

### Story 5.6: Someday/Maybe Navigation Item

As a **user**,
I want a Someday/Maybe item in the sidebar,
So that I can view deferred ideas (FR-6.5).

**Acceptance Criteria:**

**Given** the sidebar navigation
**When** I view the navigation items
**Then** "Someday" appears as a clickable item
**And** clicking it navigates to the Someday/Maybe view
**And** it displays a count badge showing someday item count
**And** the styling is slightly muted to indicate lower priority

### Story 5.7: Collapsible Section Headers

As a **user**,
I want to collapse sidebar sections,
So that I can focus on relevant navigation (FR-6.8).

**Acceptance Criteria:**

**Given** the sidebar has section groups (e.g., "Actions", "Organize")
**When** I click a section header
**Then** the section collapses, hiding its items
**And** a chevron icon indicates collapsed/expanded state
**And** clicking again expands the section
**And** collapsed state persists across app restarts

### Story 5.8: Count Badge Component

As a **user**,
I want count badges on navigation items,
So that I can see how many items are in each view (FR-6.8).

**Acceptance Criteria:**

**Given** a navigation item with associated data
**When** items exist in that category
**Then** a badge displays the count (e.g., "5")
**And** badge styling matches design system (subtle, right-aligned)
**And** badges update in real-time when counts change
**And** zero counts hide the badge (or show "0" based on design)

### Story 5.9: Active Item Highlight

As a **user**,
I want the current view highlighted in the sidebar,
So that I know where I am.

**Acceptance Criteria:**

**Given** I am viewing a specific GTD view
**When** I look at the sidebar
**Then** the corresponding navigation item has active styling
**And** active styling uses gold accent color
**And** only one item is active at a time
**And** active state updates when navigating

### Story 5.10: Sidebar Collapse Toggle

As a **user**,
I want to collapse the entire sidebar with ⌘[,
So that I have more space for chat (FR-6.9).

**Acceptance Criteria:**

**Given** the sidebar is expanded
**When** I press ⌘[
**Then** the sidebar collapses to icon-only mode
**When** I press ⌘[ again
**Then** the sidebar expands to full 280px width
**And** a toggle button is also available in the sidebar header
**And** collapse state persists across app restarts

### Story 5.11: Collapsed Sidebar State

As a **user**,
I want the collapsed sidebar to show icons only,
So that I can still navigate with minimal space.

**Acceptance Criteria:**

**Given** the sidebar is collapsed
**When** I view the sidebar
**Then** it is exactly 48px wide
**And** only icons are visible (no text labels)
**And** hovering an icon shows a tooltip with the label
**And** clicking an icon still navigates to the view
**And** count badges are hidden in collapsed mode

### Story 5.12: Keyboard Navigation

As a **user**,
I want to navigate the sidebar with keyboard,
So that I can work without a mouse (NFR-5.1).

**Acceptance Criteria:**

**Given** focus is in the sidebar
**When** I press Arrow Down
**Then** focus moves to the next navigation item
**When** I press Arrow Up
**Then** focus moves to the previous navigation item
**When** I press Enter on a focused item
**Then** that view is activated
**And** Tab moves focus into and out of the sidebar
**And** focus indicators are visible (gold outline)

### Story 5.13: Inbox View Placeholder

As a **user**,
I want an Inbox view to display,
So that I can see unprocessed items (FR-6.1).

**Acceptance Criteria:**

**Given** I navigate to the Inbox view
**When** no items exist
**Then** an empty state message displays: "Inbox empty"
**And** a hint suggests: "Press ⌘N to capture something"
**When** items exist
**Then** a placeholder list displays (actual items in Epic 6)
**And** the view title "Inbox" appears in the header

### Story 5.14: Next Actions View Placeholder

As a **user**,
I want a Next Actions view to display,
So that I can see tasks ready to do (FR-6.2).

**Acceptance Criteria:**

**Given** I navigate to the Next Actions view
**When** no tasks with `status: next` exist
**Then** an empty state message displays: "No next actions"
**And** a hint suggests: "Process your inbox to identify next actions"
**When** tasks exist
**Then** a placeholder list displays (actual items in later epic)
**And** the view title "Next Actions" appears in the header

### Story 5.15: Projects View Placeholder

As a **user**,
I want a Projects view to display,
So that I can see active projects (FR-6.3).

**Acceptance Criteria:**

**Given** I navigate to the Projects view
**When** no active projects exist
**Then** an empty state message displays: "No active projects"
**And** a hint suggests: "Create a project to track multi-step outcomes"
**When** projects exist
**Then** a placeholder list displays (actual items from PARA)
**And** the view title "Projects" appears in the header

### Story 5.16: Waiting For View Placeholder

As a **user**,
I want a Waiting For view to display,
So that I can see tasks pending others (FR-6.4).

**Acceptance Criteria:**

**Given** I navigate to the Waiting For view
**When** no tasks with `status: waiting` exist
**Then** an empty state message displays: "Nothing waiting"
**And** a hint suggests: "Delegate tasks to track what you're waiting for"
**When** tasks exist
**Then** a placeholder list displays
**And** the view title "Waiting For" appears in the header

### Story 5.17: Someday View Placeholder

As a **user**,
I want a Someday/Maybe view to display,
So that I can see deferred ideas (FR-6.5).

**Acceptance Criteria:**

**Given** I navigate to the Someday/Maybe view
**When** no someday items exist
**Then** an empty state message displays: "No someday items"
**And** a hint suggests: "Park ideas here that aren't actionable yet"
**When** items exist
**Then** a placeholder list displays
**And** the view title "Someday / Maybe" appears in the header

---

## Epic 6: Quick Capture & Inbox Processing

Users can quickly capture thoughts/tasks via ⌘N and have the agent help organize them into the correct PARA location with 80%+ accuracy.

**FRs covered:** FR-5.4, FR-5.8, FR-6.6, FR-6.7, FR-6.10
**NFRs addressed:** None specific

### Story 6.1: Quick Capture Modal Trigger

As a **user**,
I want to press ⌘N to open a quick capture modal,
So that I can capture thoughts instantly (FR-6.6).

**Acceptance Criteria:**

**Given** the app is focused
**When** I press ⌘N
**Then** a modal dialog appears within 200ms
**And** the text input is auto-focused
**And** pressing Escape closes the modal without saving
**And** the modal works from any view in the app

### Story 6.2: Quick Capture Input Field

As a **user**,
I want a text area for quick capture,
So that I can type my thought or task.

**Acceptance Criteria:**

**Given** the quick capture modal is open
**When** I view the input area
**Then** a multi-line text area is displayed
**And** placeholder text shows: "What's on your mind?"
**And** the text area auto-expands as I type
**And** text area has 0px border-radius per design system

### Story 6.3: Quick Capture Save Action

As a **user**,
I want to save my capture with ⌘Enter,
So that the item is stored quickly.

**Acceptance Criteria:**

**Given** the quick capture modal has text
**When** I press ⌘Enter or click "Capture"
**Then** the item is saved to `~/Orion/inbox/items/` as a YAML file
**And** the modal closes
**And** a toast notification confirms: "Captured to Inbox"
**And** the capture completes in <2 seconds (FR-6.6)

### Story 6.4: Capture Item Schema

As a **developer**,
I want captured items to have a consistent schema,
So that they can be processed uniformly.

**Acceptance Criteria:**

**Given** a capture is saved
**When** the YAML file is created
**Then** it includes:
  - `id` (TEXT, format: `cap_xxx`)
  - `content` (TEXT, the raw capture)
  - `captured_at` (ISO timestamp)
  - `status` (ENUM: unprocessed, processed)
  - `source` (ENUM: manual, email, api)
**And** optional fields: `suggested_category`, `suggested_project`, `urgency`
**And** a TypeScript type is defined matching the schema

### Story 6.5: Inbox Queue Update

As a **developer**,
I want new captures added to the inbox queue,
So that they appear in the Inbox view.

**Acceptance Criteria:**

**Given** a capture is saved
**When** the file is written
**Then** `~/Orion/inbox/_queue.yaml` is updated with the new item reference
**And** the queue maintains order by `captured_at` (newest first)
**And** the sidebar Inbox badge count increases by 1
**And** file watching detects the change for real-time update

### Story 6.6: Inbox Item List Display

As a **user**,
I want to see my inbox items in a list,
So that I can process them (FR-6.1).

**Acceptance Criteria:**

**Given** I navigate to the Inbox view
**When** unprocessed items exist
**Then** items display as a list sorted by capture time (newest first)
**And** each item shows the content preview (first 100 chars)
**And** each item shows the capture timestamp
**And** clicking an item opens it for processing

### Story 6.7: Inbox Item Detail View

As a **user**,
I want to view a full inbox item,
So that I can decide what to do with it.

**Acceptance Criteria:**

**Given** I click an inbox item
**When** the detail view opens
**Then** the full content is displayed
**And** the capture timestamp is shown
**And** suggested categorization is shown (if available)
**And** action buttons are available: "Process with Agent", "Delete", "Edit"

### Story 6.8: Agent-Assisted Inbox Processing

As a **user**,
I want the agent to help categorize my captures,
So that items go to the right place (FR-6.7).

**Acceptance Criteria:**

**Given** I select "Process with Agent" on an inbox item
**When** the agent analyzes the capture
**Then** it suggests a PARA destination (project, area, or someday)
**And** it suggests a GTD status (next, waiting, someday)
**And** suggestions are presented for my approval
**And** I can accept, modify, or reject the suggestion

### Story 6.9: PARA Categorization Suggestions

As a **user**,
I want the agent to suggest specific destinations,
So that I can quickly file items (FR-5.8).

**Acceptance Criteria:**

**Given** the agent processes an inbox item
**When** it determines the category
**Then** it suggests one of:
  - A specific existing project (if relevant)
  - A specific existing area (if relevant)
  - Creating a new project (if multi-step)
  - Someday/Maybe (if not actionable)
  - Trash (if not worth keeping)
**And** the suggestion includes reasoning
**And** accuracy target is 80%+ (FR-5.8)

### Story 6.10: Execute Filing Action

As a **user**,
I want to confirm and execute the filing,
So that the item moves to the right place (FR-5.4).

**Acceptance Criteria:**

**Given** I approve a categorization suggestion
**When** I click "File" or press Enter
**Then** the item is moved to the suggested PARA location
**And** the item is removed from the inbox queue
**And** the relevant index files are updated
**And** a toast confirms: "Filed to {destination}"

### Story 6.11: PARA-GTD Mapping Service

As a **developer**,
I want a service that maps PARA to GTD,
So that users interact only with GTD categories (FR-6.10).

**Acceptance Criteria:**

**Given** a user views GTD categories
**When** the service maps PARA locations
**Then** Projects (with `status: active`) appear under "Projects"
**And** Tasks with `status: next` appear under "Next Actions"
**And** Tasks with `status: waiting` appear under "Waiting For"
**And** Items with `status: someday` appear under "Someday/Maybe"
**And** `~/Orion/inbox/` items appear under "Inbox"
**And** the mapping is invisible to the user

### Story 6.12: Batch Processing Mode

As a **user**,
I want to process multiple inbox items quickly,
So that inbox processing is efficient.

**Acceptance Criteria:**

**Given** multiple items are in the inbox
**When** I enter "Process Mode"
**Then** items are presented one at a time
**And** agent suggestions are pre-loaded for each
**And** I can quickly approve with Enter or modify with Tab
**And** processing automatically advances to the next item
**And** progress indicator shows "3 of 8 processed"

### Story 6.13: Delete Inbox Item

As a **user**,
I want to delete inbox items I don't need,
So that I can clean up captures.

**Acceptance Criteria:**

**Given** an inbox item is displayed
**When** I click "Delete" or press Backspace
**Then** a confirmation prompt appears
**When** I confirm deletion
**Then** the YAML file is deleted from `~/Orion/inbox/items/`
**And** the queue is updated
**And** the Inbox badge count decreases

### Story 6.14: Edit Inbox Item

As a **user**,
I want to edit an inbox item before filing,
So that I can refine the content.

**Acceptance Criteria:**

**Given** an inbox item is displayed
**When** I click "Edit"
**Then** the content becomes editable in the detail view
**When** I save changes
**Then** the YAML file is updated
**And** the `updated_at` field is set

---

## Epic 7: Credential & API Key Management

Users can safely store their API keys (Claude, Composio) in macOS Keychain via a Settings interface with validation.

**FRs covered:** FR-10.5, FR-4.5
**NFRs addressed:** NFR-4.1, NFR-4.2, NFR-4.3, NFR-4.4, NFR-4.9

### Story 7.1: Install Keychain Plugin

As a **developer**,
I want the Tauri Keychain plugin installed,
So that I can securely store credentials.

**Acceptance Criteria:**

**Given** the Tauri project
**When** I add `tauri-plugin-keychain` dependency
**Then** the plugin is available in Rust backend
**And** IPC commands can access Keychain
**And** the plugin works on macOS 12+

### Story 7.2: Settings Navigation Item

As a **user**,
I want to access Settings from the sidebar,
So that I can configure the app.

**Acceptance Criteria:**

**Given** the sidebar navigation
**When** I view the bottom section
**Then** a "Settings" item is visible
**And** clicking it opens the Settings view
**And** a gear icon represents the item
**And** keyboard shortcut ⌘, also opens Settings

### Story 7.3: Settings View Layout

As a **user**,
I want an organized Settings interface,
So that I can find configuration options easily.

**Acceptance Criteria:**

**Given** I open Settings
**When** the view displays
**Then** settings are organized into sections:
  - API Keys
  - Integrations
  - Appearance
  - Data
  - About
**And** sections are navigable via left sub-menu
**And** the layout uses consistent design tokens

### Story 7.4: Claude API Key Input

As a **user**,
I want to enter my Claude API key,
So that Orion can communicate with Claude.

**Acceptance Criteria:**

**Given** I am in the API Keys section
**When** I view the Claude configuration
**Then** an input field labeled "Claude API Key" is displayed
**And** the field shows "••••••••" if a key exists
**And** a "Show/Hide" toggle reveals the key
**And** the input has type="password" by default

### Story 7.5: Validate Claude API Key

As a **user**,
I want my API key validated before saving,
So that I know it works (NFR-4.4).

**Acceptance Criteria:**

**Given** I enter a Claude API key
**When** I click "Validate" or blur the field
**Then** a validation request is sent to Claude API
**When** the key is valid
**Then** a green checkmark appears with "Valid"
**When** the key is invalid
**Then** a red X appears with "Invalid key"
**And** validation happens over HTTPS only (NFR-4.3)

### Story 7.6: Save Claude API Key to Keychain

As a **user**,
I want my API key saved securely,
So that it's protected (FR-10.5).

**Acceptance Criteria:**

**Given** the Claude API key is validated
**When** I click "Save"
**Then** the key is stored in macOS Keychain under `com.orion.claude-api-key`
**And** the key is NOT stored in files or SQLite (NFR-4.1)
**And** a success toast appears: "API key saved securely"
**And** the input shows "••••••••" to indicate a key exists

### Story 7.7: Retrieve API Key from Keychain

As a **developer**,
I want to retrieve the API key at runtime,
So that SDK calls can authenticate.

**Acceptance Criteria:**

**Given** an API key is stored in Keychain
**When** the SDK wrapper needs to authenticate
**Then** the key is retrieved via `tauri-plugin-keychain`
**And** the key is passed to the SDK securely
**And** the key is never logged (NFR-4.2)
**And** the key is never transmitted except to Claude API over HTTPS

### Story 7.8: Composio API Key Input

As a **user**,
I want to enter my Composio API key,
So that integrations can connect.

**Acceptance Criteria:**

**Given** I am in the API Keys section
**When** I view the Composio configuration
**Then** an input field labeled "Composio API Key" is displayed
**And** the field shows "••••••••" if a key exists
**And** a "Show/Hide" toggle reveals the key
**And** validation checks the key against Composio API

### Story 7.9: Save Composio API Key to Keychain

As a **user**,
I want my Composio key saved securely,
So that it's protected (FR-4.5).

**Acceptance Criteria:**

**Given** the Composio API key is validated
**When** I click "Save"
**Then** the key is stored in macOS Keychain under `com.orion.composio-api-key`
**And** the key is NOT stored in files or SQLite (NFR-4.1)
**And** a success toast appears: "API key saved securely"

### Story 7.10: Delete API Key

As a **user**,
I want to remove a stored API key,
So that I can revoke access.

**Acceptance Criteria:**

**Given** an API key is stored
**When** I click "Remove" next to the key
**Then** a confirmation prompt appears
**When** I confirm
**Then** the key is deleted from Keychain
**And** the input field shows empty state
**And** a toast confirms: "API key removed"

### Story 7.11: OAuth Token Storage

As a **developer**,
I want OAuth tokens stored securely,
So that integration tokens are protected (NFR-4.9).

**Acceptance Criteria:**

**Given** a user completes OAuth flow (Gmail, Calendar)
**When** tokens are returned
**Then** access tokens are stored in Keychain under `com.orion.oauth.{service}`
**And** refresh tokens are stored separately
**And** tokens are never stored in files or SQLite
**And** tokens are encrypted via Keychain encryption

### Story 7.12: Missing API Key Error State

As a **user**,
I want a clear error when no API key is configured,
So that I know how to fix it.

**Acceptance Criteria:**

**Given** no Claude API key is stored
**When** I try to start a conversation
**Then** an error message displays: "Claude API key required"
**And** a "Configure in Settings" link is provided
**And** the chat input is disabled until configured

---

## Epic 8: Built-in Tool Servers

On first launch, Orion's bundled MCP tool servers are ready - filesystem access, shell commands, and PARA tools work out of the box.

**FRs covered:** FR-1.4, FR-4.7, FR-5.3
**NFRs addressed:** NFR-2.1, NFR-2.5

### Story 8.1: Bundled Filesystem MCP Server

As a **developer**,
I want a bundled filesystem MCP server,
So that the SDK can read/write files (FR-1.4).

**Acceptance Criteria:**

**Given** the app is installed
**When** it launches
**Then** a filesystem MCP server is started as a child process
**And** the server supports Read, Write, Edit, Glob, Grep tools
**And** the server runs via stdio transport (FR-4.7)
**And** the server is configured in bundled `.mcp.json`

### Story 8.2: Bundled Shell MCP Server

As a **developer**,
I want a bundled shell MCP server,
So that the SDK can execute commands (FR-1.4).

**Acceptance Criteria:**

**Given** the app is installed
**When** it launches
**Then** a shell MCP server is started
**And** the server supports Bash tool for command execution
**And** commands run in the user's default shell environment
**And** the server runs via stdio transport

### Story 8.3: PARA Tools MCP Server

As a **developer**,
I want a PARA-specific MCP server,
So that the agent has specialized PARA tools.

**Acceptance Criteria:**

**Given** the app is installed
**When** it launches
**Then** a PARA MCP server is started
**And** the server provides tools:
  - `para_read_project` - read project metadata
  - `para_list_projects` - list all projects
  - `para_create_project` - create new project
  - `para_read_inbox` - read inbox queue
  - `para_file_item` - move item to PARA location
**And** tools have proper schema definitions

### Story 8.4: MCP Server Process Management

As a **developer**,
I want MCP servers managed as child processes,
So that they start/stop with the app.

**Acceptance Criteria:**

**Given** the app starts
**When** MCP servers are initialized
**Then** each server runs as a separate child process
**And** process IDs are tracked
**When** the app quits
**Then** all MCP server processes are gracefully terminated
**And** zombie processes are cleaned up

### Story 8.5: MCP Connection Health Check

As a **developer**,
I want to verify MCP connections on startup,
So that I know tools are available (NFR-2.1).

**Acceptance Criteria:**

**Given** MCP servers are started
**When** the app completes initialization
**Then** a health check pings each server
**And** successful connections are logged
**And** failed connections trigger retry logic
**And** overall MCP status is tracked (healthy/degraded/failed)

### Story 8.6: MCP Server Restart on Failure

As a **developer**,
I want crashed MCP servers to restart automatically,
So that tools remain available (NFR-2.1).

**Acceptance Criteria:**

**Given** an MCP server process crashes
**When** the crash is detected
**Then** the server is restarted automatically
**And** up to 3 restart attempts are made
**And** if all attempts fail, the server is marked as failed
**And** a warning is logged and shown to the user

### Story 8.7: Graceful Degradation Without MCP

As a **user**,
I want the app to work even if MCP servers fail,
So that core functionality remains (NFR-2.5).

**Acceptance Criteria:**

**Given** an MCP server is unavailable
**When** the agent tries to use that tool
**Then** a graceful error message is shown
**And** the conversation continues without the tool
**And** the agent explains what it couldn't do
**And** a "Retry" option is available

### Story 8.8: MCP Server Status Display

As a **user**,
I want to see MCP server status,
So that I know if tools are working (NFR-5.5).

**Acceptance Criteria:**

**Given** the app is running
**When** I check Settings > Integrations
**Then** MCP server status is displayed:
  - Filesystem: Connected/Disconnected
  - Shell: Connected/Disconnected
  - PARA: Connected/Disconnected
**And** each shows last successful ping time
**And** failed servers show error details

### Story 8.9: Configure Bundled MCP Servers

As a **developer**,
I want bundled servers defined in `.mcp.json`,
So that the SDK knows how to connect.

**Acceptance Criteria:**

**Given** the app bundle
**When** `.mcp.json` is read
**Then** it contains entries for bundled servers:
```json
{
  "mcpServers": {
    "filesystem": { "command": "...", "args": [...] },
    "shell": { "command": "...", "args": [...] },
    "para": { "command": "...", "args": [...] }
  }
}
```
**And** paths resolve relative to the app bundle
**And** environment variables are passed correctly

---

## Epic 9: Composio SDK Foundation

Users can connect their Composio account, and the dynamic tool discovery system loads tools based on conversation context.

**FRs covered:** FR-4.1, FR-4.2, FR-4.6
**NFRs addressed:** NFR-1.3, NFR-2.6

### Story 9.1: Install Composio SDK

As a **developer**,
I want the Composio SDK installed,
So that I can integrate external tools (FR-4.1).

**Acceptance Criteria:**

**Given** the Tauri project
**When** I add `composio-anthropic` package
**Then** the SDK is available in the TypeScript layer
**And** types are available for tool schemas
**And** the SDK version is stable

### Story 9.2: Initialize Composio Client

As a **developer**,
I want to initialize the Composio client,
So that it's ready for tool calls.

**Acceptance Criteria:**

**Given** a Composio API key is stored
**When** the app starts
**Then** the Composio client is initialized with the API key
**And** the client is configured with a unique `userId` for OAuth isolation
**And** initialization errors are caught and logged

### Story 9.3: Per-User OAuth Isolation

As a **developer**,
I want OAuth tokens isolated per user,
So that credentials are secure.

**Acceptance Criteria:**

**Given** the Composio client is initialized
**When** making tool calls
**Then** the `userId` parameter is set to a unique user identifier
**And** OAuth tokens are scoped to this user
**And** different users (if multi-user) have separate token stores

### Story 9.4: Dynamic Tool Discovery

As a **developer**,
I want tools loaded based on conversation context,
So that only relevant tools are available (FR-4.2).

**Acceptance Criteria:**

**Given** a conversation is active
**When** the user mentions email, calendar, or other integrated services
**Then** relevant Composio tools are dynamically loaded
**And** tools are passed to the SDK for the next query
**And** tools not relevant to the context are not loaded
**And** tool discovery latency is <500ms

### Story 9.5: Tool Schema Mapping

As a **developer**,
I want Composio tools mapped to SDK tool format,
So that Claude can use them.

**Acceptance Criteria:**

**Given** Composio tools are discovered
**When** they are passed to the SDK
**Then** schemas are converted to Anthropic tool format
**And** parameter types are correctly mapped
**And** descriptions are preserved
**And** required/optional fields are correctly marked

### Story 9.6: Composio Tool Call Execution

As a **developer**,
I want Composio tools executed when called,
So that external actions happen (FR-4.6).

**Acceptance Criteria:**

**Given** Claude requests a Composio tool
**When** the tool call is received
**Then** the Composio SDK executes the action
**And** the result is returned to Claude
**And** execution completes in <2 seconds p95 (FR-4.6)
**And** errors are caught and formatted for Claude

### Story 9.7: Composio Rate Limit Handling

As a **developer**,
I want rate limits handled with backoff,
So that transient limits don't fail requests (NFR-2.6).

**Acceptance Criteria:**

**Given** Composio returns a 429 rate limit error
**When** the error is detected
**Then** the request is retried with exponential backoff
**And** backoff sequence: 500ms → 1s → 2s → 4s
**And** max retry attempts: 5
**And** after max retries, error is returned to user

### Story 9.8: Composio Connection Status

As a **user**,
I want to see if Composio is connected,
So that I know integrations are available.

**Acceptance Criteria:**

**Given** Settings > Integrations
**When** I view Composio status
**Then** connection status is shown: Connected/Not Configured
**And** available integrations are listed
**And** a "Configure" button opens Composio setup

### Story 9.9: List Available Integrations

As a **user**,
I want to see what integrations are available,
So that I know what I can connect.

**Acceptance Criteria:**

**Given** Composio is connected
**When** I view the Integrations section
**Then** available apps are listed:
  - Gmail (Email)
  - Google Calendar
  - (future: Slack, Notion, etc.)
**And** each shows: connected/not connected status
**And** a "Connect" button initiates OAuth flow

---

## Epic 10: Gmail Integration

Users can connect Gmail via Composio OAuth and ask Orion to read, search, and draft emails.

**FRs covered:** FR-4.3
**NFRs addressed:** NFR-4.10

### Story 10.1: Gmail OAuth Flow Initiation

As a **user**,
I want to connect my Gmail account,
So that Orion can access my email.

**Acceptance Criteria:**

**Given** I am in Settings > Integrations
**When** I click "Connect" next to Gmail
**Then** a system browser window opens with Google OAuth
**And** the OAuth scope requests minimum permissions (NFR-4.10)
**And** scopes: `gmail.readonly`, `gmail.compose`, `gmail.send`

### Story 10.2: Gmail OAuth Callback Handler

As a **developer**,
I want to handle the OAuth callback,
So that tokens are captured and stored.

**Acceptance Criteria:**

**Given** user completes Google OAuth
**When** the callback is received
**Then** the authorization code is exchanged for tokens
**And** access token and refresh token are stored in Keychain
**And** token expiry is tracked
**And** the UI updates to show "Connected"

### Story 10.3: GMAIL_GET_EMAILS Tool

As a **user**,
I want the agent to read my recent emails,
So that I can ask about my inbox (FR-4.3).

**Acceptance Criteria:**

**Given** Gmail is connected
**When** I ask "What emails do I have?"
**Then** the agent calls `GMAIL_GET_EMAILS` tool
**And** recent emails are retrieved (last 20 by default)
**And** results include: sender, subject, snippet, date
**And** the agent summarizes the emails in response

### Story 10.4: GMAIL_SEARCH Tool

As a **user**,
I want the agent to search my emails,
So that I can find specific messages (FR-4.3).

**Acceptance Criteria:**

**Given** Gmail is connected
**When** I ask "Find emails from John about the project"
**Then** the agent calls `GMAIL_SEARCH` with query parameters
**And** search results are returned
**And** the agent presents relevant matches
**And** I can ask follow-up questions about specific emails

### Story 10.5: GMAIL_SEND_EMAIL Tool

As a **user**,
I want the agent to send emails on my behalf,
So that I can communicate efficiently (FR-4.3).

**Acceptance Criteria:**

**Given** Gmail is connected
**When** I ask "Send an email to John about the meeting"
**Then** the agent drafts the email content
**And** a permission prompt asks for approval (per Epic 12)
**When** I approve
**Then** the agent calls `GMAIL_SEND_EMAIL`
**And** confirmation is shown: "Email sent to john@example.com"

### Story 10.6: Email Draft Preview

As a **user**,
I want to preview emails before sending,
So that I can review the content.

**Acceptance Criteria:**

**Given** the agent drafts an email
**When** the draft is ready
**Then** a preview card displays:
  - To: recipients
  - Subject: subject line
  - Body: formatted content
**And** buttons: "Send", "Edit", "Cancel"
**And** "Edit" opens the email composer canvas (Epic 16)

### Story 10.7: Gmail Token Refresh

As a **developer**,
I want OAuth tokens refreshed automatically,
So that connections stay valid.

**Acceptance Criteria:**

**Given** the Gmail access token is expiring
**When** a tool call is made
**Then** the refresh token is used to get a new access token
**And** the new access token is stored in Keychain
**And** the tool call proceeds with the new token
**And** if refresh fails, user is prompted to re-authenticate

### Story 10.8: Gmail Disconnect

As a **user**,
I want to disconnect Gmail,
So that I can revoke access.

**Acceptance Criteria:**

**Given** Gmail is connected
**When** I click "Disconnect" in Settings
**Then** a confirmation prompt appears
**When** I confirm
**Then** OAuth tokens are deleted from Keychain
**And** the Gmail status shows "Not Connected"
**And** Gmail tools are no longer available to the agent

---

## Epic 11: Calendar Integration

Users can connect Google Calendar via Composio OAuth and ask Orion to check schedule and create events.

**FRs covered:** FR-4.4
**NFRs addressed:** NFR-4.10

### Story 11.1: Calendar OAuth Flow Initiation

As a **user**,
I want to connect my Google Calendar,
So that Orion can access my schedule.

**Acceptance Criteria:**

**Given** I am in Settings > Integrations
**When** I click "Connect" next to Google Calendar
**Then** a system browser window opens with Google OAuth
**And** the OAuth scope requests minimum permissions (NFR-4.10)
**And** scopes: `calendar.readonly`, `calendar.events`

### Story 11.2: Calendar OAuth Callback Handler

As a **developer**,
I want to handle the Calendar OAuth callback,
So that tokens are captured and stored.

**Acceptance Criteria:**

**Given** user completes Google Calendar OAuth
**When** the callback is received
**Then** the authorization code is exchanged for tokens
**And** tokens are stored in Keychain under `com.orion.oauth.calendar`
**And** the UI updates to show "Connected"

### Story 11.3: CALENDAR_LIST_EVENTS Tool

As a **user**,
I want the agent to check my calendar,
So that I know my schedule (FR-4.4).

**Acceptance Criteria:**

**Given** Calendar is connected
**When** I ask "What's on my calendar today?"
**Then** the agent calls `CALENDAR_LIST_EVENTS` tool
**And** events for the specified time range are retrieved
**And** results include: title, time, location, attendees
**And** the agent summarizes my schedule

### Story 11.4: CALENDAR_CREATE_EVENT Tool

As a **user**,
I want the agent to create calendar events,
So that I can schedule efficiently (FR-4.4).

**Acceptance Criteria:**

**Given** Calendar is connected
**When** I ask "Schedule a meeting with Sarah tomorrow at 2pm"
**Then** the agent parses the request
**And** a permission prompt shows the event details
**When** I approve
**Then** the agent calls `CALENDAR_CREATE_EVENT`
**And** confirmation is shown: "Event created: Meeting with Sarah"

### Story 11.5: Calendar Conflict Detection

As a **user**,
I want to be warned about scheduling conflicts,
So that I don't double-book.

**Acceptance Criteria:**

**Given** I ask to create an event
**When** the time slot has an existing event
**Then** the agent warns: "You have 'Team Standup' at that time"
**And** suggests alternative times
**And** I can choose to override or pick an alternative

### Story 11.6: Free/Busy Check

As a **user**,
I want the agent to find free time,
So that scheduling is easier.

**Acceptance Criteria:**

**Given** Calendar is connected
**When** I ask "When am I free tomorrow afternoon?"
**Then** the agent checks the calendar
**And** returns available time slots
**And** I can select a slot to schedule

### Story 11.7: Calendar Token Refresh

As a **developer**,
I want Calendar OAuth tokens refreshed automatically,
So that connections stay valid.

**Acceptance Criteria:**

**Given** the Calendar access token is expiring
**When** a tool call is made
**Then** the refresh token is used to get a new access token
**And** the new access token is stored in Keychain
**And** the tool call proceeds with the new token

### Story 11.8: Calendar Disconnect

As a **user**,
I want to disconnect Google Calendar,
So that I can revoke access.

**Acceptance Criteria:**

**Given** Calendar is connected
**When** I click "Disconnect" in Settings
**Then** OAuth tokens are deleted from Keychain
**And** the Calendar status shows "Not Connected"
**And** Calendar tools are no longer available

---

## Epic 12: Permission System

Users see clear permission prompts for write operations, can approve/deny actions inline, and have sensitive files automatically protected.

**FRs covered:** FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-7.5, FR-7.6, FR-7.7
**NFRs addressed:** NFR-4.5, NFR-2.10

### Story 12.1: Permission Mode State

As a **developer**,
I want a permission mode system,
So that behavior varies by context (FR-7.1).

**Acceptance Criteria:**

**Given** a session is active
**When** the permission mode is set
**Then** one of three modes is active:
  - `default`: standard approval rules
  - `plan`: read-only, all writes blocked
  - `acceptEdits`: auto-approve file edits
**And** the mode is stored in session metadata
**And** mode can be changed via user command or agent request

### Story 12.2: Auto-Allow Read Operations

As a **developer**,
I want read operations to proceed without prompts,
So that information gathering is seamless (FR-7.2).

**Acceptance Criteria:**

**Given** permission mode is `default`
**When** a tool performs a read operation (Read, Glob, Grep)
**Then** the operation proceeds without user prompt
**And** the operation is logged for audit
**And** no permission card is displayed

### Story 12.3: Prompt for Write Operations

As a **user**,
I want to approve write operations,
So that I control changes to my system (FR-7.3).

**Acceptance Criteria:**

**Given** permission mode is `default`
**When** a tool performs a write operation (Write, Edit, Bash)
**Then** a permission card is displayed inline
**And** the card shows: operation type, target, preview of changes
**And** buttons: "Allow", "Deny", "Edit"
**And** I must respond before the operation proceeds

### Story 12.4: PARA Auto-Allow Rules

As a **user**,
I want PARA paths to be auto-allowed,
So that the agent can manage my data (FR-7.4).

**Acceptance Criteria:**

**Given** a write operation targets `~/Orion/` or subpaths
**When** the PreToolUse hook evaluates the operation
**Then** the operation is auto-allowed without prompt
**And** the operation is still logged for audit
**And** this applies to: projects, areas, resources, inbox, archive

### Story 12.5: Block Sensitive File Access

As a **user**,
I want sensitive files protected automatically,
So that secrets aren't exposed (FR-7.5).

**Acceptance Criteria:**

**Given** a tool operation targets a sensitive file
**When** the file matches patterns:
  - `.env`, `.env.*`
  - `*secret*`, `*credential*`
  - `*password*`, `*token*`
  - `~/.ssh/*`, `~/.aws/*`
**Then** the operation is blocked
**And** an error is returned to the agent
**And** the agent explains: "Cannot access sensitive file"

### Story 12.6: Block Dangerous Bash Commands

As a **user**,
I want dangerous commands blocked,
So that my system is protected (FR-7.6).

**Acceptance Criteria:**

**Given** a Bash tool call is made
**When** the command matches dangerous patterns:
  - `rm -rf /` or `rm -rf ~`
  - `sudo *`
  - `chmod 777`
  - `dd if=/dev/*`
  - `mkfs.*`
**Then** the operation is blocked
**And** an error is returned to the agent
**And** the agent explains: "Command blocked for safety"

### Story 12.7: Permission Card UI Component

As a **user**,
I want a clear permission prompt UI,
So that I understand what I'm approving (FR-7.7).

**Acceptance Criteria:**

**Given** a permission prompt is needed
**When** the card is displayed
**Then** it shows:
  - Operation type icon (write, execute, send)
  - Target (file path, command, email recipient)
  - Preview of changes (diff for edits, command for bash)
  - "Allow" button (gold, primary)
  - "Deny" button (secondary)
  - "Edit" button (tertiary, opens editor)
**And** card has 0px border-radius per design system

### Story 12.8: Permission Card Allow Action

As a **user**,
I want to approve with a single click,
So that approvals are quick.

**Acceptance Criteria:**

**Given** a permission card is displayed
**When** I click "Allow" or press Enter
**Then** the operation proceeds
**And** the card collapses to show "Allowed"
**And** the conversation continues

### Story 12.9: Permission Card Deny Action

As a **user**,
I want to reject operations,
So that I can stop unwanted actions.

**Acceptance Criteria:**

**Given** a permission card is displayed
**When** I click "Deny" or press Escape
**Then** the operation is cancelled
**And** the card collapses to show "Denied"
**And** the agent receives a denial error
**And** the agent adapts its response

### Story 12.10: Permission Card Edit Action

As a **user**,
I want to modify operations before approving,
So that I can adjust the action.

**Acceptance Criteria:**

**Given** a permission card for a file edit
**When** I click "Edit"
**Then** the proposed changes open in an editable view
**When** I modify and save
**Then** the modified operation is executed
**And** the card shows "Allowed (modified)"

### Story 12.11: Permission State Machine

As a **developer**,
I want permissions managed by a state machine,
So that approval flows are predictable.

**Acceptance Criteria:**

**Given** a permission prompt is triggered
**When** the state machine handles it
**Then** states exist: `pending`, `allowed`, `denied`, `editing`
**And** transitions are: `pending → allowed/denied/editing`
**And** `editing → allowed/denied`
**And** terminal states collapse the card

### Story 12.12: Fail-Closed for Write Hooks

As a **developer**,
I want write hooks to fail closed,
So that errors don't bypass permissions (NFR-2.10).

**Acceptance Criteria:**

**Given** a PreToolUse hook evaluates a write operation
**When** the hook fails or times out
**Then** the operation is blocked by default
**And** an error is shown: "Permission check failed"
**And** the user can retry or dismiss
**And** read operations fail open (proceed on error)

---

## Epic 13: Audit Trail & Transparency

Users can see what external actions Orion has taken via an action log with sanitized inputs.

**FRs covered:** FR-7.9, FR-10.6
**NFRs addressed:** NFR-4.6, NFR-4.7, NFR-4.8, NFR-9.3

### Story 13.1: Audit Log File Creation

As a **developer**,
I want an audit log file created on first launch,
So that actions can be logged.

**Acceptance Criteria:**

**Given** the app launches for the first time
**When** the audit system initializes
**Then** a log file is created at `~/.orion/audit/YYYY-MM.jsonl`
**And** logs rotate monthly (new file each month)
**And** the file format is append-only JSONL (NFR-9.3)

### Story 13.2: Log External Tool Calls

As a **developer**,
I want all external tool calls logged,
So that there's a complete audit trail (FR-10.6, NFR-4.6).

**Acceptance Criteria:**

**Given** an external tool is called (Composio, MCP)
**When** the call completes
**Then** an entry is appended to the audit log:
```json
{
  "timestamp": "2026-01-23T10:30:00Z",
  "type": "tool_call",
  "tool": "GMAIL_SEND_EMAIL",
  "session_id": "sess_xxx",
  "inputs": { ... },
  "outputs": { ... },
  "success": true,
  "duration_ms": 450
}
```
**And** 100% of external calls are logged (NFR-4.6)

### Story 13.3: Sanitize Sensitive Inputs

As a **developer**,
I want sensitive data sanitized in logs,
So that secrets aren't exposed (NFR-4.7).

**Acceptance Criteria:**

**Given** a tool call contains sensitive data
**When** the log entry is created
**Then** the following are redacted:
  - API keys → `"[REDACTED]"`
  - Passwords → `"[REDACTED]"`
  - OAuth tokens → `"[REDACTED]"`
  - Email body content → `"[CONTENT length=1234]"`
**And** recipient emails are preserved (not secrets)
**And** file paths are preserved

### Story 13.4: Action Log Navigation Item

As a **user**,
I want to access the Action Log from the UI,
So that I can review what Orion has done.

**Acceptance Criteria:**

**Given** the sidebar or Settings
**When** I look for the Action Log
**Then** an "Action Log" item is available
**And** clicking it opens the Action Log view
**And** it can also be accessed via Settings > Transparency

### Story 13.5: Action Log List View

As a **user**,
I want to see recent actions in a list,
So that I can review activity.

**Acceptance Criteria:**

**Given** I open the Action Log
**When** the view displays
**Then** actions are listed in reverse chronological order
**And** each entry shows:
  - Timestamp (relative: "2 hours ago")
  - Tool name (e.g., "Gmail: Send Email")
  - Status (success/failure icon)
  - Brief summary (e.g., "To: john@example.com")
**And** pagination or infinite scroll for long lists

### Story 13.6: Action Detail View

As a **user**,
I want to see details of an action,
So that I understand what happened.

**Acceptance Criteria:**

**Given** I click an action in the list
**When** the detail view opens
**Then** full details are shown:
  - Full timestamp
  - Tool name and type
  - Sanitized inputs
  - Sanitized outputs
  - Duration
  - Success/failure status
  - Related conversation link
**And** JSON is formatted for readability

### Story 13.7: Filter Actions by Type

As a **user**,
I want to filter actions by type,
So that I can find specific activities.

**Acceptance Criteria:**

**Given** the Action Log view
**When** I use the filter controls
**Then** I can filter by:
  - Tool type (Email, Calendar, File, Shell)
  - Date range
  - Status (success/failure)
**And** filters update the list in real-time
**And** filter state is preserved during the session

### Story 13.8: Export Audit Log

As a **user**,
I want to export my audit log,
So that I have a record of actions.

**Acceptance Criteria:**

**Given** the Action Log view
**When** I click "Export"
**Then** a file save dialog appears
**And** I can choose date range to export
**And** the export is in JSONL format
**And** sensitive data remains sanitized

---

## Epic 14: Canvas Foundation

Users see inline canvases spawn in the conversation thread for structured interactions, with persistence and collapse/expand.

**FRs covered:** FR-8.1, FR-8.7, FR-8.9, FR-8.10
**NFRs addressed:** None specific

### Story 14.1: Canvas Container Component

As a **developer**,
I want a canvas container for the right column,
So that structured content can display.

**Acceptance Criteria:**

**Given** the three-column layout
**When** a canvas is activated
**Then** the right column expands to 480px (--canvas-width)
**And** the canvas container renders within the column
**And** the container has proper background and borders
**And** 0px border-radius per design system

### Story 14.2: Canvas Show/Hide State

As a **developer**,
I want canvas visibility managed by state,
So that it appears/disappears smoothly.

**Acceptance Criteria:**

**Given** no canvas is active
**When** an agent triggers a canvas
**Then** the right column animates open (200ms entrance)
**When** the canvas is dismissed
**Then** the right column animates closed (150ms exit)
**And** state is managed via Zustand store

### Story 14.3: Inline Canvas in Message Thread

As a **user**,
I want canvases to appear inline in chat,
So that context is preserved (FR-8.1).

**Acceptance Criteria:**

**Given** the agent sends a canvas response
**When** the canvas renders
**Then** it appears inline in the message thread (not just in right column)
**And** a compact preview is shown in the thread
**And** clicking the preview expands the full canvas in the right column
**And** the thread continues below the canvas preview

### Story 14.4: Agent-Triggered Canvas

As a **user**,
I want the agent to spawn canvases contextually,
So that structured interactions happen when needed (FR-8.7).

**Acceptance Criteria:**

**Given** the agent determines a canvas is appropriate
**When** responding to requests like:
  - "Schedule a meeting" → Calendar picker canvas
  - "Draft an email" → Email composer canvas
  - "Show my tasks" → Task list canvas
**Then** the appropriate canvas type spawns
**And** the agent's decision is logged

### Story 14.5: Canvas Type Registry

As a **developer**,
I want a registry of canvas types,
So that the correct canvas renders.

**Acceptance Criteria:**

**Given** canvas types are defined
**When** a canvas is triggered
**Then** the registry maps type to component:
  - `calendar-picker` → CalendarPickerCanvas
  - `email-composer` → EmailComposerCanvas
  - `task-list` → TaskListCanvas
  - `approval-card` → ApprovalCardCanvas
  - `project-board` → ProjectBoardCanvas
**And** unknown types fall back to generic JSON display

### Story 14.6: Canvas State Persistence

As a **user**,
I want canvas state saved in the conversation,
So that I can return to it later (FR-8.9).

**Acceptance Criteria:**

**Given** a canvas is displayed with user modifications
**When** I navigate away and return
**Then** the canvas state is restored
**And** state is stored in the message's `canvas_state` field
**And** state persists across app restarts

### Story 14.7: Canvas Collapse/Expand

As a **user**,
I want to collapse canvases to save space,
So that I can focus on chat (FR-8.10).

**Acceptance Criteria:**

**Given** a canvas is displayed
**When** I click the collapse button or press Escape
**Then** the canvas collapses to a compact bar
**And** the bar shows canvas type and summary
**When** I click the bar or press Enter
**Then** the canvas expands to full size
**And** collapsed state persists in session

### Story 14.8: Auto-Collapse on Inactivity

As a **user**,
I want canvases to auto-collapse after inactivity,
So that space is reclaimed automatically.

**Acceptance Criteria:**

**Given** a canvas is displayed and idle
**When** 2 seconds pass without interaction
**Then** the canvas animates to collapsed state
**And** the collapse is smooth (150ms exit animation)
**And** interacting with the canvas resets the timer
**And** auto-collapse can be disabled in settings

### Story 14.9: Canvas Loading State

As a **developer**,
I want canvases to show loading state,
So that users know data is being fetched.

**Acceptance Criteria:**

**Given** a canvas requires data (e.g., calendar events)
**When** the canvas is initializing
**Then** a skeleton loader displays
**When** data is loaded
**Then** the content renders
**And** loading state uses design system colors

### Story 14.10: Canvas Error State

As a **developer**,
I want canvases to handle errors gracefully,
So that failures are communicated.

**Acceptance Criteria:**

**Given** a canvas fails to load data
**When** the error is caught
**Then** an error message displays in the canvas area
**And** a "Retry" button is available
**And** the agent is informed of the failure

---

## Epic 15: Calendar & Approval Canvases

Users can pick meeting times from a calendar canvas with conflict detection and approve/deny actions via approval cards.

**FRs covered:** FR-8.2, FR-8.6
**NFRs addressed:** None specific

### Story 15.1: Calendar Picker Canvas Component

As a **user**,
I want a calendar picker canvas,
So that I can select meeting times visually (FR-8.2).

**Acceptance Criteria:**

**Given** the agent needs time selection
**When** the calendar picker spawns
**Then** a week view displays with time slots
**And** the current date is highlighted
**And** navigation arrows move between weeks
**And** times are in the user's local timezone

### Story 15.2: Display Existing Events

As a **user**,
I want to see my existing events,
So that I can avoid conflicts.

**Acceptance Criteria:**

**Given** the calendar picker is displayed
**When** events exist for the visible week
**Then** events are shown as blocks on the calendar
**And** event blocks show title and time
**And** conflicting times are visually marked

### Story 15.3: Time Slot Selection

As a **user**,
I want to click a time slot to select it,
So that I can choose when to schedule.

**Acceptance Criteria:**

**Given** the calendar picker is displayed
**When** I click an empty time slot
**Then** the slot is highlighted as selected
**And** the selected time is shown in a summary area
**When** I click a different slot
**Then** the new slot is selected (single selection)
**And** I can drag to select a duration

### Story 15.4: Conflict Detection Visual

As a **user**,
I want conflicts highlighted clearly,
So that I don't double-book (FR-8.2).

**Acceptance Criteria:**

**Given** I select a time slot
**When** the slot overlaps an existing event
**Then** a warning appears: "Conflicts with: Team Standup"
**And** the conflicting event is highlighted in red
**And** I can still proceed (override) if I choose

### Story 15.5: Confirm Selected Time

As a **user**,
I want to confirm my time selection,
So that the agent can proceed.

**Acceptance Criteria:**

**Given** a time slot is selected
**When** I click "Confirm" or press Enter
**Then** the selection is passed back to the agent
**And** the canvas collapses with confirmation
**And** the agent continues with the selected time

### Story 15.6: Approval Card Canvas Component

As a **user**,
I want an approval card for permission requests,
So that I can approve/deny actions (FR-8.6).

**Acceptance Criteria:**

**Given** an action requires approval
**When** the approval card spawns
**Then** it displays:
  - Action type header (e.g., "Send Email")
  - Action details (recipient, subject, etc.)
  - "Allow" button (gold primary)
  - "Deny" button (secondary)
  - "Edit" button (if applicable)
**And** card has 0px border-radius

### Story 15.7: Approval Card Allow Flow

As a **user**,
I want to allow actions with feedback,
So that I know the action proceeded.

**Acceptance Criteria:**

**Given** an approval card is displayed
**When** I click "Allow"
**Then** the button shows "Allowing..." briefly
**And** the card updates to "Allowed" with checkmark
**And** the card collapses after 1 second
**And** the action executes

### Story 15.8: Approval Card Deny Flow

As a **user**,
I want to deny actions with feedback,
So that I know the action was blocked.

**Acceptance Criteria:**

**Given** an approval card is displayed
**When** I click "Deny"
**Then** the card updates to "Denied" with X icon
**And** the card collapses after 1 second
**And** the agent receives denial and adapts

### Story 15.9: Approval Card Timeout

As a **developer**,
I want approval cards to timeout gracefully,
So that the system doesn't hang.

**Acceptance Criteria:**

**Given** an approval card is displayed
**When** 5 minutes pass without response
**Then** the card shows "Timed out"
**And** the action is treated as denied
**And** the agent is informed and can re-request

---

## Epic 16: Email & Task Canvases

Users can compose/edit emails with tone controls and manage task lists via interactive canvases.

**FRs covered:** FR-8.3, FR-8.4, FR-8.5, FR-8.8
**NFRs addressed:** None specific

### Story 16.1: Email Composer Canvas Component

As a **user**,
I want an email composer canvas,
So that I can draft and edit emails (FR-8.3).

**Acceptance Criteria:**

**Given** the agent drafts an email
**When** the email composer canvas spawns
**Then** it displays:
  - To field (editable)
  - Cc/Bcc fields (expandable)
  - Subject field (editable)
  - Body editor (rich text)
  - Tone controls
  - Send/Cancel buttons

### Story 16.2: Email Body Rich Text Editor

As a **user**,
I want a rich text editor for email body,
So that I can format content.

**Acceptance Criteria:**

**Given** the email composer is displayed
**When** I edit the body
**Then** TipTap editor is used
**And** I can: bold, italic, underline, links, lists
**And** formatting toolbar is minimal per design system
**And** content is preserved when saving

### Story 16.3: Email Tone Controls

As a **user**,
I want to adjust email tone,
So that the message matches my intent (FR-8.3).

**Acceptance Criteria:**

**Given** the email composer is displayed
**When** I use tone controls
**Then** options include:
  - Formality: Casual / Professional / Formal
  - Length: Brief / Standard / Detailed
  - Sentiment: Neutral / Positive / Apologetic
**When** I adjust a control
**Then** the agent regenerates the email with the new tone
**And** changes are previewed before applying

### Story 16.4: Email Send Action

As a **user**,
I want to send the email from the canvas,
So that the action is seamless.

**Acceptance Criteria:**

**Given** the email is ready
**When** I click "Send"
**Then** a permission prompt confirms the action
**When** approved
**Then** the email is sent via Gmail API
**And** the canvas shows "Sent" confirmation
**And** the canvas collapses

### Story 16.5: Task List Canvas Component

As a **user**,
I want a task list canvas,
So that I can manage tasks visually (FR-8.5).

**Acceptance Criteria:**

**Given** the agent shows tasks
**When** the task list canvas spawns
**Then** it displays a scrollable list of tasks
**And** each task shows: checkbox, title, due date, priority
**And** tasks are grouped by status or project
**And** styling matches design system

### Story 16.6: Task Checkbox Interaction

As a **user**,
I want to check off tasks in the canvas,
So that I can mark them complete (FR-8.8).

**Acceptance Criteria:**

**Given** the task list canvas is displayed
**When** I click a task checkbox
**Then** the task is marked complete
**And** the checkbox shows a checkmark
**And** the task moves to "Completed" section (or fades)
**And** the underlying PARA data is updated

### Story 16.7: Task Quick Add

As a **user**,
I want to add tasks from the canvas,
So that I can capture new items quickly.

**Acceptance Criteria:**

**Given** the task list canvas is displayed
**When** I click "+ Add Task" or press Enter at end
**Then** a new task input appears
**When** I type and press Enter
**Then** the task is added to the list
**And** the task is saved to the appropriate PARA location

### Story 16.8: Project Board Canvas Component

As a **user**,
I want a project board canvas,
So that I can see project status (FR-8.4).

**Acceptance Criteria:**

**Given** the agent shows a project
**When** the project board canvas spawns
**Then** it displays:
  - Project name and status
  - Goal/outcome summary
  - Key milestones with completion status
  - Next actions list
  - Waiting for items
**And** data is pulled from PARA project metadata

### Story 16.9: Project Milestone Toggle

As a **user**,
I want to mark milestones complete in the canvas,
So that I can track progress.

**Acceptance Criteria:**

**Given** the project board is displayed
**When** I click a milestone checkbox
**Then** the milestone is marked complete
**And** progress percentage updates
**And** the PARA project metadata is updated

### Story 16.10: Canvas Interactivity State

As a **developer**,
I want canvas interactions tracked in state,
So that changes are persisted (FR-8.8).

**Acceptance Criteria:**

**Given** a user interacts with a canvas
**When** they check a task, select a time, edit email
**Then** the interaction is captured in canvas state
**And** state is synced to the conversation thread
**And** state changes trigger side effects (file updates, API calls)

---

## Epic 17: Skill Loading & Activation

Users can trigger skills via `/commands` or keywords, with skills hot-reloading on file changes.

**FRs covered:** FR-3.1, FR-3.2, FR-3.3
**NFRs addressed:** NFR-1.5, NFR-2.4, NFR-6.3

### Story 17.1: Skills Directory Structure

As a **developer**,
I want a defined skills directory structure,
So that skills are organized consistently.

**Acceptance Criteria:**

**Given** the app is installed
**When** the skills directory is inspected
**Then** `~/.orion/skills/` exists for user skills
**And** bundled skills exist in app bundle
**And** each skill is a directory with `skill.yaml` manifest
**And** the manifest schema is documented

### Story 17.2: Skill Manifest Schema

As a **developer**,
I want a defined skill manifest schema,
So that skills are consistently structured.

**Acceptance Criteria:**

**Given** a skill is created
**When** `skill.yaml` is defined
**Then** it includes:
  - `name` (string, unique identifier)
  - `description` (string, user-facing)
  - `version` (semver)
  - `commands` (array of `/command` triggers)
  - `keywords` (array of activation keywords)
  - `prompt` (string, the skill prompt)
**And** optional: `tools`, `model`, `maxTokens`
**And** a TypeScript type is defined

### Story 17.3: Skill Loader Service

As a **developer**,
I want a skill loader that reads skills at startup,
So that skills are available (FR-3.1).

**Acceptance Criteria:**

**Given** the app starts
**When** the skill loader runs
**Then** all skills in `~/.orion/skills/` are discovered
**And** bundled skills are discovered
**And** each skill manifest is parsed and validated
**And** skills are registered in a skill registry
**And** loading completes in <100ms per skill (NFR-1.5)

### Story 17.4: Skill Validation

As a **developer**,
I want skills validated on load,
So that invalid skills don't crash the app (NFR-2.4).

**Acceptance Criteria:**

**Given** a skill is loaded
**When** validation runs
**Then** manifest schema is checked
**And** required fields are verified
**And** command names don't conflict
**And** invalid skills are logged and skipped
**And** valid skills are 100% loaded (NFR-2.4)

### Story 17.5: Keyword Activation Detection

As a **user**,
I want skills activated when I mention keywords,
So that skills trigger naturally (FR-3.2).

**Acceptance Criteria:**

**Given** skills with keywords are registered
**When** my message contains a keyword (e.g., "briefing", "inbox")
**Then** the matching skill is activated
**And** the skill prompt is injected into the conversation
**And** multiple keyword matches prompt user selection

### Story 17.6: Command Activation

As a **user**,
I want to trigger skills with `/command`,
So that I have explicit control (FR-3.3).

**Acceptance Criteria:**

**Given** skills with commands are registered
**When** my message starts with `/briefing`
**Then** the matching skill is activated
**And** the skill prompt is injected
**When** I type `/` only
**Then** an autocomplete shows available commands
**And** command matching is case-insensitive

### Story 17.7: Skill Prompt Injection

As a **developer**,
I want skill prompts injected correctly,
So that the agent follows skill instructions.

**Acceptance Criteria:**

**Given** a skill is activated
**When** the message is sent to Claude
**Then** the skill prompt is prepended to the system context
**And** the user's message is included
**And** skill-specific tools are made available
**And** the skill model/tokens override session defaults if specified

### Story 17.8: Skill Hot-Reload

As a **developer**,
I want skills to hot-reload on file changes,
So that development is fast (NFR-6.3).

**Acceptance Criteria:**

**Given** chokidar is watching `~/.orion/skills/`
**When** a skill file is modified
**Then** the skill is reloaded automatically
**And** the skill registry is updated
**And** no app restart is required
**And** a toast notifies: "Skill 'briefing' reloaded"

### Story 17.9: Command Palette Integration

As a **user**,
I want to browse skills in the command palette,
So that I can discover available skills.

**Acceptance Criteria:**

**Given** I press ⌘K to open command palette
**When** I type or browse
**Then** available skills are listed with descriptions
**And** selecting a skill activates it
**And** skills are searchable by name and keywords

### Story 17.10: Bundled Butler Skills List

As a **developer**,
I want the Butler plugin skills bundled,
So that core skills are available out of the box.

**Acceptance Criteria:**

**Given** the app is installed
**When** bundled skills are loaded
**Then** these skills exist:
  - `/briefing` - Morning briefing
  - `/inbox` - Inbox triage
  - `/schedule` - Calendar management
  - `/email` - Email composition
  - `/review` - Weekly review
**And** each has complete manifests

---

## Epic 18: Agent & Subagent System

The main agent can spawn specialized subagents (triage, scheduler, communicator, researcher) for complex tasks with proper context handoff.

**FRs covered:** FR-3.4, FR-3.5, FR-3.6, FR-9.6, FR-9.7, FR-9.8, FR-9.9
**NFRs addressed:** NFR-3.3, NFR-6.5

### Story 18.1: Agents Directory Structure

As a **developer**,
I want a defined agents directory structure,
So that agents are organized consistently.

**Acceptance Criteria:**

**Given** the app is installed
**When** the agents directory is inspected
**Then** `~/.orion/agents/` exists for user agents
**And** bundled agents exist in app bundle
**And** each agent is defined in a YAML file
**And** agent output directories exist at `~/.orion/cache/agents/`

### Story 18.2: Agent Definition Schema

As a **developer**,
I want a defined agent schema,
So that agents are consistently structured (FR-3.4).

**Acceptance Criteria:**

**Given** an agent is defined
**When** `{name}.agent.yaml` is created
**Then** it includes:
  - `name` (string, identifier)
  - `description` (string, purpose)
  - `model` (enum: opus, sonnet, haiku)
  - `tools` (array of allowed tools)
  - `allowedPaths` (array of path patterns)
  - `systemPrompt` (string, agent instructions)
**And** optional: `maxTokens`, `maxTurns`
**And** validation is performed (NFR-6.5)

### Story 18.3: Agent Loader Service

As a **developer**,
I want an agent loader that reads agents at startup,
So that agents are available (FR-3.4).

**Acceptance Criteria:**

**Given** the app starts
**When** the agent loader runs
**Then** all agents in `~/.orion/agents/` are discovered
**And** bundled agents are discovered
**And** each agent definition is validated
**And** agents are registered in an agent registry

### Story 18.4: Subagent Spawning via Task Tool

As a **developer**,
I want the Task tool to spawn subagents,
So that complex work is delegated (FR-3.5).

**Acceptance Criteria:**

**Given** the main agent wants to delegate work
**When** it calls the Task tool with agent name
**Then** a new SDK session is created for the subagent
**And** the subagent's system prompt is applied
**And** the subagent's tool restrictions are enforced
**And** the subagent runs with its specified model

### Story 18.5: Context Handoff to Subagent

As a **developer**,
I want context passed to subagents,
So that they have relevant information (FR-3.5).

**Acceptance Criteria:**

**Given** a subagent is spawned
**When** the Task tool provides context
**Then** the context is included in the subagent's prompt
**And** relevant conversation history is summarized
**And** PARA context (current project) is passed
**And** context size is limited to prevent bloat

### Story 18.6: Subagent Output Directory

As a **developer**,
I want subagent outputs saved to a directory,
So that results are retrievable (FR-3.6).

**Acceptance Criteria:**

**Given** a subagent completes work
**When** it generates outputs
**Then** outputs are saved to `~/.orion/cache/agents/{name}/output/`
**And** output files include timestamp in filename
**And** the main agent can reference these outputs
**And** old outputs are cleaned up after 7 days

### Story 18.7: Subagent Result Return

As a **developer**,
I want subagent results returned to main agent,
So that the conversation continues.

**Acceptance Criteria:**

**Given** a subagent completes
**When** its final message is generated
**Then** the result is returned to the Task tool
**And** the main agent can summarize or present the result
**And** errors are caught and returned as error results

### Story 18.8: Token Tracking for Subagents

As a **developer**,
I want subagent token usage tracked,
So that it counts against quota (NFR-3.3).

**Acceptance Criteria:**

**Given** a subagent runs
**When** tokens are used
**Then** input and output tokens are tracked
**And** usage is attributed to the parent session
**And** usage counts against the user's quota
**And** usage is logged in the audit trail

### Story 18.9: Triage Subagent Definition

As a **developer**,
I want the Triage subagent bundled,
So that inbox processing has a specialist (FR-9.6).

**Acceptance Criteria:**

**Given** bundled agents
**When** triage.agent.yaml is loaded
**Then** it has:
  - model: sonnet (fast, cost-effective)
  - tools: read-only (Read, Glob, Grep)
  - purpose: categorize inbox items, suggest PARA location
**And** it cannot make write operations

### Story 18.10: Scheduler Subagent Definition

As a **developer**,
I want the Scheduler subagent bundled,
So that calendar work has a specialist (FR-9.7).

**Acceptance Criteria:**

**Given** bundled agents
**When** scheduler.agent.yaml is loaded
**Then** it has:
  - model: sonnet
  - tools: Calendar tools, PARA read
  - purpose: manage calendar, find free times, create events
**And** it can write to calendar via approval

### Story 18.11: Communicator Subagent Definition

As a **developer**,
I want the Communicator subagent bundled,
So that email work has a specialist (FR-9.8).

**Acceptance Criteria:**

**Given** bundled agents
**When** communicator.agent.yaml is loaded
**Then** it has:
  - model: opus (quality for tone matching)
  - tools: Email tools, Contact read
  - purpose: draft emails matching user's tone
**And** it uses contact context for personalization

### Story 18.12: Researcher Subagent Definition

As a **developer**,
I want the Researcher subagent bundled,
So that information gathering has a specialist (FR-9.9).

**Acceptance Criteria:**

**Given** bundled agents
**When** researcher.agent.yaml is loaded
**Then** it has:
  - model: sonnet (fast research)
  - tools: read-only (Read, Glob, Grep, web search)
  - purpose: gather information, summarize findings
**And** it cannot make write operations

---

## Epic 19: Hook System

Lifecycle hooks fire at appropriate events (SessionStart, PreToolUse, PostToolUse, SessionEnd) enabling context injection, permission enforcement, and audit.

**FRs covered:** FR-3.7, FR-3.8, FR-3.9, FR-7.8, FR-9.10, FR-9.11, FR-9.12, FR-9.13
**NFRs addressed:** NFR-1.6, NFR-6.6, NFR-6.7, NFR-6.8, NFR-6.9

### Story 19.1: Hooks Configuration File

As a **developer**,
I want hooks registered via configuration,
So that hooks are discoverable (FR-3.7).

**Acceptance Criteria:**

**Given** the app is installed
**When** hooks are configured
**Then** `~/.orion/hooks/hooks.json` defines registered hooks
**And** the schema includes:
```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "script": "./context-injector.js",
      "timeout": 5000
    }
  ]
}
```
**And** validation is performed on startup (NFR-6.6)

### Story 19.2: Hook Event Types

As a **developer**,
I want all 12 SDK hook events supported,
So that hooks can run at any lifecycle point (FR-3.8).

**Acceptance Criteria:**

**Given** the hook system is initialized
**When** hook events are registered
**Then** these events are supported:
  - SessionStart, SessionEnd
  - PreToolUse, PostToolUse
  - MessageStart, MessageEnd
  - TurnStart, TurnEnd
  - ContextOverflow
  - ErrorOccurred
  - SubagentStart, SubagentEnd
**And** hooks receive appropriate payload for each event

### Story 19.3: Hook Execution Engine

As a **developer**,
I want hooks executed via child processes,
So that they run in isolation.

**Acceptance Criteria:**

**Given** a hook event fires
**When** registered hooks exist for that event
**Then** each hook script is executed as a child process
**And** the event payload is passed via stdin
**And** the hook response is read from stdout
**And** execution is parallel for independent hooks

### Story 19.4: Hook Latency Requirement

As a **developer**,
I want hooks to complete in <50ms,
So that they don't slow down the agent (FR-3.9, NFR-1.6).

**Acceptance Criteria:**

**Given** a hook is executed
**When** execution is timed
**Then** hooks completing in <50ms are normal
**And** hooks exceeding 50ms are logged as warnings
**And** hooks exceeding 5 seconds are killed (NFR-6.8)
**And** latency is tracked in metrics

### Story 19.5: Hook Timeout Handling

As a **developer**,
I want hooks that timeout to be killed,
So that hung hooks don't block the agent (NFR-6.8).

**Acceptance Criteria:**

**Given** a hook is executing
**When** it exceeds the configured timeout (default 5s)
**Then** the process is terminated
**And** an error is logged
**And** the event continues without that hook's result
**And** timeout is configurable per hook

### Story 19.6: Hook Output Schema Validation

As a **developer**,
I want hook outputs validated,
So that malformed responses don't cause errors (NFR-6.9).

**Acceptance Criteria:**

**Given** a hook returns output
**When** the output is received
**Then** it is validated against expected schema
**And** invalid outputs are logged and ignored
**And** valid outputs are processed
**And** each event type has a defined output schema

### Story 19.7: SessionStart Hook Implementation

As a **developer**,
I want the SessionStart hook to inject context,
So that the agent has relevant information (FR-9.10).

**Acceptance Criteria:**

**Given** a session starts
**When** the SessionStart event fires
**Then** the context-injector hook runs
**And** it adds: current date, active project context, user preferences
**And** the injected context appears in the system prompt
**And** execution completes before first message

### Story 19.8: PreToolUse Hook Implementation

As a **developer**,
I want PreToolUse hooks to enforce permissions,
So that dangerous operations are blocked (FR-9.11).

**Acceptance Criteria:**

**Given** a tool call is about to execute
**When** the PreToolUse event fires
**Then** the permission-enforcer hook runs
**And** it can: allow, deny, or require approval
**And** denied operations return an error to the agent
**And** approval triggers the permission card UI

### Story 19.9: PostToolUse Hook Implementation

As a **developer**,
I want PostToolUse hooks to audit tool usage,
So that actions are logged (FR-9.12).

**Acceptance Criteria:**

**Given** a tool call completes
**When** the PostToolUse event fires
**Then** the audit-logger hook runs
**And** it logs the tool call to the audit trail
**And** sensitive data is sanitized
**And** the hook does not block the response

### Story 19.10: SessionEnd Hook Implementation

As a **developer**,
I want SessionEnd hooks to save preferences,
So that learned patterns are persisted (FR-9.13).

**Acceptance Criteria:**

**Given** a session ends
**When** the SessionEnd event fires
**Then** the preference-saver hook runs
**And** it extracts: inferred preferences, decisions made
**And** preferences are saved to `~/Orion/resources/preferences/`
**And** the hook runs before session cleanup

### Story 19.11: Hook Startup Validation

As a **developer**,
I want hooks validated at startup,
So that broken hooks are detected early (NFR-6.7).

**Acceptance Criteria:**

**Given** the app starts
**When** hooks are loaded
**Then** each hook script is validated:
  - File exists and is executable
  - Script runs without error (dry run)
  - Output matches expected schema
**And** invalid hooks are disabled with warning
**And** validation runs in <1 second total

### Story 19.12: Custom Permission Hooks

As a **developer**,
I want users to register custom permission hooks,
So that permissions are extensible (FR-7.8).

**Acceptance Criteria:**

**Given** a user creates a custom PreToolUse hook
**When** they register it in hooks.json
**Then** it runs alongside built-in permission hooks
**And** custom hook decisions are respected
**And** custom hooks can add new blocked patterns

---

## Epic 20: Butler Plugin Skills

Users have access to the full Butler skill suite: `/briefing`, `/inbox`, `/schedule`, `/email`, `/review` as a validated plugin package.

**FRs covered:** FR-9.1, FR-9.2, FR-9.3, FR-9.4, FR-9.5, FR-9.14
**NFRs addressed:** NFR-6.4

### Story 20.1: Morning Briefing Skill

As a **user**,
I want to get a morning briefing,
So that I start my day informed (FR-9.1).

**Acceptance Criteria:**

**Given** I activate `/briefing`
**When** the skill runs
**Then** the agent provides:
  - Today's calendar overview
  - Unread emails summary (priority first)
  - Active project status
  - Waiting-for items due soon
  - Weather (if configured)
**And** the briefing is concise (under 500 words)

### Story 20.2: Inbox Triage Skill

As a **user**,
I want to triage my inbox efficiently,
So that I stay organized (FR-9.2).

**Acceptance Criteria:**

**Given** I activate `/inbox`
**When** the skill runs
**Then** the agent:
  - Lists unprocessed inbox items
  - Suggests priority scores (1-5)
  - Proposes PARA destinations
  - Offers batch processing mode
**And** priority scoring uses urgency + importance

### Story 20.3: Calendar Management Skill

As a **user**,
I want to manage my calendar via conversation,
So that scheduling is easy (FR-9.3).

**Acceptance Criteria:**

**Given** I activate `/schedule`
**When** the skill runs
**Then** the agent can:
  - Show today/this week's schedule
  - Find free time slots
  - Create new events (with approval)
  - Suggest meeting times for recipients
**And** conflicts are detected and warned

### Story 20.4: Email Composition Skill

As a **user**,
I want help composing emails,
So that communication is efficient (FR-9.4).

**Acceptance Criteria:**

**Given** I activate `/email`
**When** the skill runs
**Then** the agent:
  - Drafts emails matching my tone
  - Uses contact context for personalization
  - Opens email composer canvas for editing
  - Sends with approval
**And** tone is learned from my sent emails over time

### Story 20.5: Weekly Review Skill

As a **user**,
I want to conduct weekly reviews,
So that I stay on top of my system (FR-9.5).

**Acceptance Criteria:**

**Given** I activate `/review`
**When** the skill runs
**Then** the agent guides me through:
  - Inbox: process to zero
  - Projects: review status, update next actions
  - Waiting: follow up on stalled items
  - Someday: review for activation
  - Calendar: preview upcoming week
**And** the review is structured with progress tracking

### Story 20.6: Butler Plugin Manifest

As a **developer**,
I want the Butler plugin properly manifested,
So that it validates as installable (FR-9.14).

**Acceptance Criteria:**

**Given** the Butler plugin package
**When** manifest is inspected
**Then** it includes:
  - name: "orion-butler-plugin"
  - version: semver
  - skills: array of 5 skills
  - agents: array of 4 agents
  - hooks: array of 4 hooks
**And** all dependencies are declared
**And** manifest validates against plugin schema (NFR-6.4)

### Story 20.7: Plugin Skill Dependencies

As a **developer**,
I want skills to declare dependencies,
So that required integrations are checked.

**Acceptance Criteria:**

**Given** a skill requires Gmail integration
**When** the skill is loaded
**Then** the dependency is checked
**And** if Gmail is not connected, a warning is shown
**And** the skill can still run with degraded functionality
**And** the warning suggests connecting the integration

### Story 20.8: Skill Tone Matching

As a **developer**,
I want the email skill to match user tone,
So that emails sound like the user (FR-9.4).

**Acceptance Criteria:**

**Given** the user has sent previous emails
**When** the communicator agent drafts an email
**Then** it analyzes sent email patterns for:
  - Formality level
  - Common phrases
  - Signature style
**And** drafts match these patterns
**And** the user can adjust via tone controls

---

## Epic 21: Session Advanced Features

Users can fork sessions for "what-if" scenarios, export transcripts to JSONL, and use extended thinking for complex reasoning.

**FRs covered:** FR-1.5, FR-1.7, FR-2.3, FR-2.4
**NFRs addressed:** NFR-3.4

### Story 21.1: Extended Thinking Toggle

As a **user**,
I want to enable extended thinking for complex questions,
So that I get more thorough reasoning (FR-1.5).

**Acceptance Criteria:**

**Given** I'm having a conversation
**When** I enable extended thinking (via settings or command)
**Then** the agent uses `maxThinkingTokens` budget
**And** a "Thinking..." indicator shows during deep reasoning
**And** thinking content is NOT displayed (internal)
**And** responses are more thorough for complex questions

### Story 21.2: Extended Thinking Token Budget

As a **developer**,
I want extended thinking to have a token cap,
So that costs are controlled (NFR-3.4).

**Acceptance Criteria:**

**Given** extended thinking is enabled
**When** the agent thinks
**Then** thinking is capped at 10K tokens (NFR-3.4)
**And** exceeding the cap truncates thinking
**And** token usage is tracked separately
**And** the cap is configurable in settings

### Story 21.3: Structured Output Responses

As a **developer**,
I want structured outputs for specific requests,
So that responses are type-safe (FR-1.7).

**Acceptance Criteria:**

**Given** the agent needs to return structured data
**When** a schema is specified for the response
**Then** the SDK's structured output mode is used
**And** the response is validated against the schema
**And** TypeScript types are generated from schemas
**And** validation errors are handled gracefully

### Story 21.4: Session Fork UI

As a **user**,
I want to fork a session for "what-if" scenarios,
So that I can explore alternatives (FR-2.3).

**Acceptance Criteria:**

**Given** an active conversation
**When** I click "Fork" or use ⌘D
**Then** a new session is created with the same history
**And** the fork is named "Fork of {original} - {timestamp}"
**And** changes in the fork don't affect the original
**And** the fork appears in the session list

### Story 21.5: Session Fork Implementation

As a **developer**,
I want session forking to copy conversation state,
So that forks are independent (FR-2.3).

**Acceptance Criteria:**

**Given** a session is forked
**When** the fork is created
**Then** all messages are copied to a new conversation
**And** a new SDK session is started with copied context
**And** the original session remains unchanged
**And** fork metadata tracks the parent session ID

### Story 21.6: Export Transcript Command

As a **user**,
I want to export my conversation transcript,
So that I have a permanent record (FR-2.4).

**Acceptance Criteria:**

**Given** an active conversation
**When** I select "Export" from the menu
**Then** a file save dialog appears
**And** I can choose JSONL format
**And** the transcript includes all messages and metadata
**And** tool calls and results are included

### Story 21.7: JSONL Export Format

As a **developer**,
I want transcripts exported in JSONL format,
So that they're machine-readable (FR-2.4).

**Acceptance Criteria:**

**Given** an export is initiated
**When** the JSONL file is generated
**Then** each line is a JSON object representing:
  - Message (role, content, timestamp)
  - Tool call (tool, inputs, outputs)
  - Metadata (session info, model used)
**And** the file is valid JSONL
**And** timestamps are ISO format

### Story 21.8: Export Date Range Selection

As a **user**,
I want to export specific date ranges,
So that I can get partial exports.

**Acceptance Criteria:**

**Given** the export dialog
**When** I select a date range
**Then** only messages within that range are exported
**And** "All" exports the entire conversation
**And** the export includes the range in filename

---

## Epic 22: Context Intelligence

The system maintains context efficiently via prompt caching, PARA-aware compaction, MCP connections, and performance monitoring.

**FRs covered:** FR-1.2, FR-1.6, FR-1.8, FR-3.10, FR-4.8, FR-10.3, FR-10.10, FR-10.11, FR-10.12
**NFRs addressed:** NFR-1.7, NFR-2.1, NFR-3.1, NFR-3.5, NFR-3.6, NFR-5.5, NFR-5.7, NFR-5.8, NFR-7.1-7.11

### Story 22.1: Prompt Caching Configuration

As a **developer**,
I want prompt caching enabled for cost optimization,
So that repeated context is efficient (FR-1.6).

**Acceptance Criteria:**

**Given** the SDK is initialized
**When** prompt caching is configured
**Then** the SDK uses Anthropic's prompt caching feature
**And** system prompts and repeated context are cached
**And** cache TTL is configurable (default: 5 minutes)
**And** cache hits are tracked in metrics

### Story 22.2: Context Compaction Trigger

As a **developer**,
I want context compaction at 80% capacity,
So that conversations can continue (NFR-3.6).

**Acceptance Criteria:**

**Given** a conversation's context is growing
**When** it reaches 80% of model's context limit
**Then** context compaction is triggered
**And** older messages are summarized
**And** PARA entities are preserved (≥80% of references)
**And** the conversation continues seamlessly

### Story 22.3: PARA-Aware Compaction

As a **developer**,
I want compaction to preserve PARA context,
So that project references aren't lost (FR-1.8).

**Acceptance Criteria:**

**Given** context compaction runs
**When** messages reference PARA entities
**Then** those references are preserved in the summary
**And** active project context is kept intact
**And** recent task/action references are preserved
**And** at least 80% of PARA entities survive compaction

### Story 22.4: Conversation Continuity Restoration

As a **user**,
I want seamless conversation continuity,
So that context is preserved across sessions (FR-1.2).

**Acceptance Criteria:**

**Given** I resume a previous session
**When** the context is restored
**Then** the agent remembers our previous discussion
**And** PARA context is re-injected
**And** the conversation flows naturally
**And** no context is noticeably lost

### Story 22.5: MCP HTTP Server Support

As a **developer**,
I want HTTP MCP servers supported,
So that remote tools can connect (FR-4.8).

**Acceptance Criteria:**

**Given** an MCP server uses HTTP transport
**When** configured in `.mcp.json`
**Then** the connection uses REST for requests
**And** SSE is used for streaming responses
**And** authentication headers are supported
**And** connection timeouts are configurable

### Story 22.6: MCP Connection Management

As a **developer**,
I want MCP connections managed centrally,
So that availability is monitored (FR-3.10, NFR-2.1).

**Acceptance Criteria:**

**Given** MCP servers are configured
**When** the app runs
**Then** a connection manager tracks all servers
**And** health checks run every 30 seconds
**And** disconnections trigger reconnection
**And** uptime is tracked (target: 99%)

### Story 22.7: Memory Usage Monitoring

As a **developer**,
I want memory usage tracked,
So that we stay under budget (FR-10.3, NFR-1.7).

**Acceptance Criteria:**

**Given** the app is running
**When** memory is monitored
**Then** current usage is tracked (target: <500MB)
**And** exceeding 400MB triggers a warning
**And** exceeding 500MB triggers garbage collection
**And** memory metrics are logged periodically

### Story 22.8: Skill Load Time Tracking

As a **developer**,
I want skill load times tracked,
So that we meet performance targets (FR-10.11, NFR-1.5).

**Acceptance Criteria:**

**Given** skills are loaded at startup
**When** loading completes
**Then** each skill's load time is recorded
**And** skills exceeding 100ms are logged as warnings
**And** total skill load time is tracked
**And** metrics are available in diagnostics

### Story 22.9: Error Rate Monitoring

As a **developer**,
I want error rates tracked,
So that we meet reliability targets (FR-10.12, NFR-2.2).

**Acceptance Criteria:**

**Given** the app is running
**When** errors occur
**Then** error count is tracked per time window
**And** error rate is calculated (errors / interactions)
**And** rates exceeding 1% trigger alerts
**And** error types are categorized

### Story 22.10: Token Budget Warning

As a **user**,
I want to be warned at 80% token usage,
So that I'm not surprised by quota limits (NFR-5.7).

**Acceptance Criteria:**

**Given** I have a token budget configured
**When** usage reaches 80%
**Then** a warning toast appears
**And** the warning shows: "80% of daily tokens used"
**And** usage percentage is shown in the UI
**And** the warning is dismissible

### Story 22.11: Quota Exceeded Error

As a **user**,
I want a clear message when quota is exceeded,
So that I know how to proceed (NFR-5.8).

**Acceptance Criteria:**

**Given** my token quota is exhausted
**When** I try to send a message
**Then** an error displays: "Daily quota exceeded"
**And** options are shown: "Upgrade" or "Use your own API key"
**And** BYOK option links to Settings > API Keys
**And** the error is clear, not technical

### Story 22.12: Disk Space Warning

As a **developer**,
I want disk space monitored,
So that users are warned before running out (NFR-3.5).

**Acceptance Criteria:**

**Given** the app uses disk for sessions/cache
**When** available space drops below 10% or 1GB
**Then** a warning is logged
**And** a user notification appears
**And** the warning suggests: "Clear old sessions or free disk space"

### Story 22.13: Performance Metrics Dashboard

As a **developer**,
I want a diagnostics view with metrics,
So that performance can be monitored (NFR-7.1-7.11).

**Acceptance Criteria:**

**Given** Settings > Diagnostics
**When** the view displays
**Then** metrics are shown:
  - API latency (p95)
  - Session resume time
  - Skill load times
  - Hook execution times
  - Memory usage
  - Error rate
**And** metrics update in real-time

---

## Epic 23: Plugin Ecosystem & Archive

Users can install community plugins from Git repos with manifest validation, and completed items are auto-archived by month.

**FRs covered:** FR-3.11, FR-3.12, FR-3.13, FR-3.14, FR-5.5
**NFRs addressed:** NFR-6.4, NFR-6.12

### Story 23.1: Plugin Install Command

As a **user**,
I want to install plugins via command,
So that I can extend Orion (FR-3.11).

**Acceptance Criteria:**

**Given** I want to install a plugin
**When** I run `/plugin install owner/repo`
**Then** the GitHub repo is cloned to `~/.orion/plugins/`
**And** the plugin manifest is validated
**And** plugin components are registered
**And** a success message confirms: "Plugin 'name' installed"

### Story 23.2: Plugin Manifest Validation

As a **developer**,
I want plugin manifests validated,
So that invalid plugins are rejected (FR-3.12, NFR-6.4).

**Acceptance Criteria:**

**Given** a plugin is installed
**When** the manifest is validated
**Then** required fields are checked:
  - name, version, description
  - components (skills, agents, hooks)
  - dependencies (other plugins, integrations)
**And** invalid manifests are rejected with clear error
**And** 100% of manifests are validated (NFR-6.4)

### Story 23.3: Plugin Dependency Resolution

As a **developer**,
I want plugin dependencies resolved,
So that required components are available (FR-3.12).

**Acceptance Criteria:**

**Given** a plugin declares dependencies
**When** installation runs
**Then** dependencies are checked
**And** missing dependencies show a warning
**And** circular dependencies are detected
**And** optional dependencies don't block install

### Story 23.4: Plugin Scopes

As a **user**,
I want plugins installed at different scopes,
So that I can control where they apply (FR-3.13).

**Acceptance Criteria:**

**Given** I install a plugin
**When** I specify a scope flag
**Then** plugins install to:
  - `--user`: `~/.orion/plugins/` (default)
  - `--project`: `.orion/plugins/` in current project
  - `--local`: current directory only
**And** scope affects where the plugin is active

### Story 23.5: Plugin Component Loading

As a **developer**,
I want plugin components loaded correctly,
So that they integrate seamlessly (FR-3.14).

**Acceptance Criteria:**

**Given** a plugin is installed and valid
**When** the app starts
**Then** plugin skills are added to skill registry
**And** plugin agents are added to agent registry
**And** plugin hooks are registered
**And** components load in <100ms per plugin

### Story 23.6: Bundled vs Standalone Extensions

As a **developer**,
I want extensions loadable standalone or bundled,
So that distribution is flexible (FR-3.14).

**Acceptance Criteria:**

**Given** an extension (skill, agent, hook)
**When** it exists
**Then** it can be:
  - Bundled in a plugin package
  - Installed standalone in the appropriate directory
**And** standalone extensions don't require a manifest
**And** bundled extensions have richer metadata

### Story 23.7: Plugin List Command

As a **user**,
I want to list installed plugins,
So that I know what's available.

**Acceptance Criteria:**

**Given** plugins are installed
**When** I run `/plugin list`
**Then** installed plugins are shown with:
  - Name and version
  - Scope (user/project/local)
  - Components count (skills, agents, hooks)
**And** the list is formatted for readability

### Story 23.8: Plugin Uninstall Command

As a **user**,
I want to uninstall plugins,
So that I can remove unwanted extensions.

**Acceptance Criteria:**

**Given** a plugin is installed
**When** I run `/plugin uninstall name`
**Then** the plugin directory is removed
**And** components are deregistered
**And** a success message confirms: "Plugin 'name' uninstalled"
**And** dependent plugins are warned

### Story 23.9: Plugin Update Command

As a **user**,
I want to update plugins,
So that I get the latest versions.

**Acceptance Criteria:**

**Given** a plugin was installed from Git
**When** I run `/plugin update name`
**Then** the repo is pulled for updates
**And** the manifest is revalidated
**And** components are reloaded
**And** version change is shown

### Story 23.10: Plugin Distribution via Git

As a **developer**,
I want plugins distributed via Git repos,
So that sharing is easy (NFR-6.12).

**Acceptance Criteria:**

**Given** a plugin author creates a repo
**When** the repo contains:
  - `plugin.yaml` manifest
  - `skills/`, `agents/`, `hooks/` directories
**Then** it is installable via `/plugin install owner/repo`
**And** specific branches/tags can be specified
**And** private repos work with auth

### Story 23.11: Auto-Archive Completed Projects

As a **user**,
I want completed projects auto-archived,
So that old work is organized (FR-5.5).

**Acceptance Criteria:**

**Given** a project has `status: completed`
**When** the monthly archive job runs
**Then** the project is moved to `~/Orion/archive/projects/YYYY-MM/`
**And** the projects index is updated
**And** a log entry records the archive action
**And** the project remains searchable

### Story 23.12: Auto-Archive Completed Areas

As a **user**,
I want dormant areas auto-archived,
So that inactive areas are cleaned up (FR-5.5).

**Acceptance Criteria:**

**Given** an area has `status: dormant` for >90 days
**When** the monthly archive job runs
**Then** the area is moved to `~/Orion/archive/areas/YYYY-MM/`
**And** the areas index is updated
**And** the user is notified of the archive

### Story 23.13: Archive Job Scheduling

As a **developer**,
I want archive jobs to run monthly,
So that archiving is automatic.

**Acceptance Criteria:**

**Given** the app is running
**When** the first of the month arrives
**Then** the archive job runs automatically
**And** completed projects from previous month are archived
**And** dormant areas (>90 days) are archived
**And** job results are logged

### Story 23.14: Restore from Archive

As a **user**,
I want to restore archived items,
So that I can reactivate old work.

**Acceptance Criteria:**

**Given** an item is in the archive
**When** I browse the archive and select "Restore"
**Then** the item is moved back to its original location
**And** the index is updated
**And** the item's status is set to `active`
**And** a toast confirms: "Restored to Projects"

---

## Epic 24: Authentication & Billing

Users can sign up, sign in, and manage their subscription, with usage tracked against quota limits and secure cloud sync.

**FRs covered:** (Extends FR-10.5)
**NFRs addressed:** NFR-4.11, NFR-4.12, NFR-4.13, NFR-5.8

### Story 24.1: Supabase Client Initialization

As a **developer**,
I want the Supabase client initialized on app start,
So that cloud services are available.

**Acceptance Criteria:**

**Given** the app launches
**When** Supabase is configured
**Then** the Supabase client is initialized with project credentials
**And** credentials are stored securely (not in source)
**And** connection status is tracked
**And** offline mode works when Supabase is unreachable

### Story 24.2: Sign Up Flow

As a **new user**,
I want to create an account,
So that I can use Orion's cloud features.

**Acceptance Criteria:**

**Given** I launch Orion for the first time
**When** I choose to sign up
**Then** I can enter email and password
**And** email verification is required
**And** rate limiting prevents abuse (NFR-4.12)
**And** account is created in Supabase Auth

### Story 24.3: Sign In Flow

As a **returning user**,
I want to sign in to my account,
So that I can access my synced data.

**Acceptance Criteria:**

**Given** I have an account
**When** I enter my credentials
**Then** I am authenticated via Supabase
**And** my session is stored securely
**And** failed attempts are rate-limited
**And** "Forgot Password" option is available

### Story 24.4: Sign Out Flow

As a **user**,
I want to sign out of my account,
So that I can secure my session.

**Acceptance Criteria:**

**Given** I am signed in
**When** I click "Sign Out" in Settings
**Then** my session is terminated
**And** local tokens are cleared
**And** I'm returned to the sign-in screen
**And** local data remains (offline capable)

### Story 24.5: Subscription Tier Display

As a **user**,
I want to see my current subscription tier,
So that I know my plan limits.

**Acceptance Criteria:**

**Given** I am signed in
**When** I view Settings > Account
**Then** my current tier is displayed (Free, Pro, Team)
**And** tier limits are shown (daily tokens, integrations)
**And** "Upgrade" button is visible for non-max tiers
**And** billing cycle dates are displayed

### Story 24.6: Token Usage Dashboard

As a **user**,
I want to see my token usage,
So that I can monitor my consumption.

**Acceptance Criteria:**

**Given** I am signed in
**When** I view Settings > Usage
**Then** current period usage is displayed
**And** usage is shown as progress bar against quota
**And** daily breakdown is available
**And** warning at 80% is highlighted (NFR-5.7)

### Story 24.7: Upgrade Flow

As a **user**,
I want to upgrade my subscription,
So that I get more features.

**Acceptance Criteria:**

**Given** I am on a lower tier
**When** I click "Upgrade"
**Then** available tiers are shown with pricing
**And** I can select a tier and proceed to checkout
**And** Stripe checkout is opened in browser
**And** successful upgrade updates my account immediately

### Story 24.8: Quota Exceeded Handling

As a **user**,
I want clear options when I exceed my quota,
So that I can continue using Orion (NFR-5.8).

**Acceptance Criteria:**

**Given** my daily token quota is exhausted
**When** I try to send a message
**Then** a clear error displays: "Daily quota exceeded"
**And** options shown: "Upgrade Plan" or "Use Your Own API Key"
**And** "Use Your Own API Key" links to Settings > API Keys
**And** quota resets at midnight UTC

### Story 24.9: BYOK (Bring Your Own Key) Mode

As a **user**,
I want to use my own API key,
So that I have unlimited usage.

**Acceptance Criteria:**

**Given** I have my own Claude API key
**When** I configure it in Settings > API Keys
**Then** my requests use my key instead of Orion's
**And** no quota limits apply
**And** billing is directly with Anthropic
**And** I can switch back to managed mode

### Story 24.10: Anomalous Usage Detection

As a **developer**,
I want unusual usage patterns flagged,
So that abuse is detected (NFR-4.13).

**Acceptance Criteria:**

**Given** user activity is tracked
**When** usage exceeds 3x normal patterns
**Then** an alert is logged server-side
**And** account may be temporarily rate-limited
**And** user is notified if action is taken
**And** false positives can be appealed

### Story 24.11: User-Scoped Database Queries

As a **developer**,
I want all queries scoped to the current user,
So that data isolation is enforced (NFR-4.11).

**Acceptance Criteria:**

**Given** database queries are executed
**When** Supabase RLS is configured
**Then** every query is filtered by `auth.uid()`
**And** users cannot access other users' data
**And** service role bypasses are audited
**And** RLS policies are tested in CI

### Story 24.12: Session Token Refresh

As a **developer**,
I want auth tokens refreshed automatically,
So that users stay signed in.

**Acceptance Criteria:**

**Given** a user session is active
**When** the access token nears expiry
**Then** the refresh token is used to obtain a new access token
**And** the process is invisible to the user
**And** if refresh fails, user is prompted to re-authenticate
**And** session continuity is maintained

---

## Epic 25: Vector Search & Embeddings

The system generates and stores embeddings for PARA content, enabling semantic search across projects, notes, and conversations.

**FRs covered:** (Extends FR-5.3, FR-1.8)
**NFRs addressed:** NFR-3.6 (context compaction), Architecture Requirements

### Story 25.1: Install sqlite-vec Extension

As a **developer**,
I want the sqlite-vec extension installed,
So that vector operations are available.

**Acceptance Criteria:**

**Given** the SQLite database is initialized
**When** the app starts
**Then** sqlite-vec extension is loaded
**And** vector column types are available
**And** cosine similarity functions work
**And** the extension is bundled with the app

### Story 25.2: Create Embeddings Table

As a **developer**,
I want an embeddings table for vector storage,
So that semantic search is possible.

**Acceptance Criteria:**

**Given** sqlite-vec is installed
**When** the schema is applied
**Then** `embeddings` table exists with columns:
  - `id` (TEXT PRIMARY KEY)
  - `source_type` (TEXT: 'project', 'note', 'message', 'contact')
  - `source_id` (TEXT, reference to source record)
  - `content_hash` (TEXT, for change detection)
  - `embedding` (BLOB, 1024-dim float32)
  - `created_at` (TEXT, ISO timestamp)
**And** index exists on source_type + source_id

### Story 25.3: Configure Embedding Model

As a **developer**,
I want embedding generation configurable,
So that local or API options are supported.

**Acceptance Criteria:**

**Given** the embedding system initializes
**When** configuration is read
**Then** supported providers include:
  - Local: Ollama with BGE-M3 model
  - API: Anthropic embeddings (if available)
  - API: OpenAI embeddings (fallback)
**And** provider is configurable in Settings
**And** fallback order is defined
**And** embedding dimension is 1024 (BGE-M3)

### Story 25.4: Embedding Generation Service

As a **developer**,
I want a service that generates embeddings,
So that content can be vectorized.

**Acceptance Criteria:**

**Given** text content needs embedding
**When** the embedding service is called
**Then** text is chunked if >512 tokens
**And** embeddings are generated via configured provider
**And** results are returned as Float32Array
**And** errors are handled gracefully (fallback to no embedding)

### Story 25.5: Index PARA Content on Change

As a **developer**,
I want PARA content indexed automatically,
So that search stays current.

**Acceptance Criteria:**

**Given** a file in ~/Orion/ is created or modified
**When** the file watcher detects the change
**Then** the file content is extracted
**And** an embedding is generated
**And** the embedding is stored/updated in the embeddings table
**And** the content_hash is updated for change detection
**And** indexing happens asynchronously (non-blocking)

### Story 25.6: Index Conversation Messages

As a **developer**,
I want important messages indexed,
So that conversation history is searchable.

**Acceptance Criteria:**

**Given** a conversation message is saved
**When** the message is significant (>50 chars, not system)
**Then** an embedding is generated for the message
**And** the embedding is stored with source_type='message'
**And** conversation context is included in embedding
**And** batch indexing runs on app idle

### Story 25.7: Semantic Search Function

As a **developer**,
I want a semantic search function,
So that content can be found by meaning.

**Acceptance Criteria:**

**Given** a search query
**When** semantic search is invoked
**Then** the query is embedded
**And** cosine similarity is computed against stored embeddings
**And** top-k results are returned (default k=10)
**And** results include source_type, source_id, similarity score
**And** search completes in <500ms for typical corpus

### Story 25.8: Integrate Search with Agent Context

As a **developer**,
I want the agent to use semantic search,
So that relevant context is automatically retrieved.

**Acceptance Criteria:**

**Given** the agent processes a user message
**When** context retrieval runs
**Then** semantic search finds relevant PARA content
**And** top-3 results are injected into agent context
**And** results are formatted as context snippets
**And** retrieval happens within first-token latency budget

### Story 25.9: Embedding Cache Management

As a **developer**,
I want stale embeddings cleaned up,
So that storage is efficient.

**Acceptance Criteria:**

**Given** embeddings exist for deleted content
**When** the cleanup job runs (daily)
**Then** orphaned embeddings are identified
**And** embeddings for deleted sources are removed
**And** embeddings for unchanged content are preserved
**And** storage metrics are logged

### Story 25.10: Search UI in Command Palette

As a **user**,
I want to search my content semantically,
So that I can find things by meaning.

**Acceptance Criteria:**

**Given** I open the command palette (⌘K)
**When** I type a search query
**Then** results include semantic matches
**And** results show source type icon (project, note, message)
**And** clicking a result navigates to the source
**And** results update as I type (debounced 300ms)

---

## Epic 26: Testing Infrastructure

Developers have a comprehensive testing framework with unit, integration, and E2E tests, enabling confident refactoring and regression prevention.

**FRs covered:** (Cross-cutting quality assurance)
**NFRs addressed:** NFR-2.2, NFR-2.3, NFR-2.4 (reliability targets require testing)

### Story 26.1: Configure Vitest for Unit Tests

As a **developer**,
I want Vitest configured for unit testing,
So that I can test individual functions.

**Acceptance Criteria:**

**Given** the project is set up
**When** I run `npm run test:unit`
**Then** Vitest runs all `*.test.ts` files
**And** TypeScript is supported natively
**And** coverage reporting is available
**And** watch mode works for development

### Story 26.2: Configure Playwright for E2E Tests

As a **developer**,
I want Playwright configured for E2E testing,
So that I can test user flows.

**Acceptance Criteria:**

**Given** the project is set up
**When** I run `npm run test:e2e`
**Then** Playwright launches the Tauri app
**And** tests can interact with the UI
**And** screenshots are captured on failure
**And** tests run in CI/CD pipeline

### Story 26.3: Test Database Fixtures

As a **developer**,
I want test database fixtures,
So that tests have consistent data.

**Acceptance Criteria:**

**Given** a test needs database state
**When** fixtures are loaded
**Then** test database is separate from production
**And** fixtures include: sessions, messages, PARA structure
**And** fixtures reset between test suites
**And** fixture loading is fast (<1s)

### Story 26.4: Mock Claude SDK for Tests

As a **developer**,
I want Claude SDK mocked in tests,
So that tests don't require API calls.

**Acceptance Criteria:**

**Given** a test involves Claude SDK
**When** the mock is enabled
**Then** SDK calls return predefined responses
**And** streaming behavior is simulated
**And** tool calls are captured for assertions
**And** no actual API costs are incurred

### Story 26.5: Mock Composio SDK for Tests

As a **developer**,
I want Composio SDK mocked in tests,
So that integration tests don't require OAuth.

**Acceptance Criteria:**

**Given** a test involves Composio tools
**When** the mock is enabled
**Then** tool calls return predefined responses
**And** OAuth flows are bypassed
**And** Gmail/Calendar responses are simulated
**And** rate limiting can be simulated

### Story 26.6: Unit Test Coverage Targets

As a **developer**,
I want coverage thresholds enforced,
So that critical code is tested.

**Acceptance Criteria:**

**Given** unit tests run
**When** coverage is calculated
**Then** overall coverage target is 70%
**And** critical modules require 90%: SDK wrapper, permissions, session
**And** coverage report is generated
**And** CI fails if coverage drops below threshold

### Story 26.7: E2E Test: First Conversation Flow

As a **developer**,
I want an E2E test for the core chat flow,
So that the primary user journey is protected.

**Acceptance Criteria:**

**Given** the app is launched (with mocked SDK)
**When** the test runs
**Then** it verifies: type message → send → see streaming response → message saved
**And** test uses realistic timing
**And** assertions check UI state at each step
**And** test completes in <30 seconds

### Story 26.8: E2E Test: PARA Navigation

As a **developer**,
I want an E2E test for GTD navigation,
So that sidebar navigation works correctly.

**Acceptance Criteria:**

**Given** the app has test data
**When** the test runs
**Then** it verifies: click Inbox → see items → click Projects → see projects
**And** badge counts are verified
**And** keyboard navigation is tested
**And** collapsed/expanded states work

### Story 26.9: E2E Test: Permission Flow

As a **developer**,
I want an E2E test for permission prompts,
So that write operations require approval.

**Acceptance Criteria:**

**Given** a write operation is triggered
**When** the test runs
**Then** it verifies: permission card appears → click Allow → operation proceeds
**And** Deny flow is also tested
**And** auto-allow for PARA paths is verified
**And** blocked patterns are tested

### Story 26.10: Integration Test: Session Persistence

As a **developer**,
I want integration tests for session save/restore,
So that NFR-2.3 (99% resume success) is verified.

**Acceptance Criteria:**

**Given** a conversation with messages
**When** the app is closed and reopened
**Then** the session is restored correctly
**And** all messages are present
**And** restore time is measured (<1s target)
**And** corrupted session handling is tested

### Story 26.11: CI Pipeline Integration

As a **developer**,
I want tests running in CI,
So that every PR is validated.

**Acceptance Criteria:**

**Given** a PR is opened
**When** CI runs
**Then** unit tests run first (fast feedback)
**And** E2E tests run if unit tests pass
**And** coverage is reported
**And** test failures block merge

### Story 26.12: Performance Regression Tests

As a **developer**,
I want performance benchmarks tracked,
So that regressions are caught.

**Acceptance Criteria:**

**Given** performance-sensitive operations
**When** benchmark tests run
**Then** first-token latency is measured
**And** session restore time is measured
**And** skill load time is measured
**And** results are compared to baseline
**And** >20% regression fails the build

---

## Epic 27: Memory & Learning System

The system learns from user interactions, storing preferences, decisions, and patterns to improve future recommendations.

**FRs covered:** (Extends FR-9.13)
**NFRs addressed:** Architecture Requirements (Memory types)

### Story 27.1: Create Memory Tables

As a **developer**,
I want database tables for memory storage,
So that learnings persist.

**Acceptance Criteria:**

**Given** the database schema
**When** memory tables are created
**Then** `memories` table exists with columns:
  - `id` (TEXT PRIMARY KEY)
  - `type` (TEXT: USER_PREFERENCE, DECISION_CONTEXT, ROUTINE_PATTERN)
  - `category` (TEXT: communication, scheduling, organization, etc.)
  - `content` (TEXT, the learned pattern)
  - `confidence` (REAL, 0.0-1.0)
  - `source_session_id` (TEXT)
  - `created_at` (TEXT)
  - `last_used_at` (TEXT)
  - `use_count` (INTEGER)
**And** index exists on type + category

### Story 27.2: USER_PREFERENCE Memory Type

As a **developer**,
I want user preferences captured,
So that the agent adapts to user style.

**Acceptance Criteria:**

**Given** the agent observes user behavior
**When** a preference is detected
**Then** preferences are stored:
  - Communication tone (formal/casual)
  - Scheduling preferences (morning/afternoon)
  - Email signature style
  - Preferred response length
**And** preferences are extracted by SessionEnd hook
**And** confidence increases with repeated observation

### Story 27.3: DECISION_CONTEXT Memory Type

As a **developer**,
I want decisions remembered,
So that context is preserved.

**Acceptance Criteria:**

**Given** the user makes a decision
**When** the decision is significant
**Then** decision context is stored:
  - What was decided
  - Why (if stated)
  - What alternatives were considered
  - When it was decided
**And** decisions can be recalled in future sessions
**And** related decisions are linked

### Story 27.4: ROUTINE_PATTERN Memory Type

As a **developer**,
I want routines detected,
So that the agent can anticipate needs.

**Acceptance Criteria:**

**Given** user behavior over time
**When** patterns emerge
**Then** routines are identified:
  - Daily check-in times
  - Weekly review habits
  - Common task sequences
  - Recurring queries
**And** patterns require 3+ occurrences to store
**And** patterns decay if not repeated

### Story 27.5: Memory Injection at Session Start

As a **developer**,
I want relevant memories injected into context,
So that the agent has personalized context.

**Acceptance Criteria:**

**Given** a session starts
**When** the SessionStart hook runs
**Then** relevant memories are retrieved
**And** top-5 by relevance/recency are injected
**And** injection is formatted as context summary
**And** memory retrieval completes in <100ms

### Story 27.6: Memory Extraction at Session End

As a **developer**,
I want learnings extracted from sessions,
So that the memory grows.

**Acceptance Criteria:**

**Given** a session ends
**When** the SessionEnd hook runs
**Then** the conversation is analyzed for learnings
**And** new preferences are extracted
**And** decisions are captured
**And** existing memories are reinforced (confidence++)
**And** contradictory learnings are flagged

### Story 27.7: Memory Confidence Decay

As a **developer**,
I want unused memories to decay,
So that stale patterns are forgotten.

**Acceptance Criteria:**

**Given** memories are stored
**When** the daily maintenance job runs
**Then** memories not used in 30 days lose confidence
**And** decay rate is 10% per week of non-use
**And** memories below 0.1 confidence are archived
**And** high-use memories are protected from decay

### Story 27.8: Memory Search for Agent

As a **developer**,
I want the agent to query memories,
So that it can recall past context.

**Acceptance Criteria:**

**Given** the agent needs past context
**When** it queries the memory system
**Then** relevant memories are returned
**And** search supports type and category filters
**And** search supports semantic similarity
**And** results include confidence and recency

### Story 27.9: Inbox Routing Feedback Loop

As a **user**,
I want my routing corrections remembered,
So that accuracy improves (FR-5.8: 80% target).

**Acceptance Criteria:**

**Given** the agent suggests a PARA destination
**When** I correct the suggestion
**Then** the correction is stored as a preference
**And** similar items use the correction in future
**And** accuracy metrics are tracked
**And** the 80% target is measurable

### Story 27.10: Memory Viewer UI

As a **user**,
I want to see what Orion has learned about me,
So that I can review and correct it.

**Acceptance Criteria:**

**Given** Settings > Memory
**When** I view the memory section
**Then** learned preferences are displayed by category
**And** I can edit or delete individual memories
**And** I can export my memory data
**And** "Reset All" option is available with confirmation

### Story 27.11: Memory Privacy Controls

As a **user**,
I want control over memory collection,
So that I maintain privacy.

**Acceptance Criteria:**

**Given** Settings > Privacy
**When** I configure memory options
**Then** I can toggle memory collection on/off
**And** I can select which types to collect
**And** I can set retention period (30/90/365 days)
**And** "Clear History" removes all memories immediately

### Story 27.12: Tone Matching Memory

As a **developer**,
I want email tone learned from sent emails,
So that drafts match user style (FR-9.4).

**Acceptance Criteria:**

**Given** the user has sent emails via Orion
**When** email patterns are analyzed
**Then** tone characteristics are extracted:
  - Greeting style ("Hi" vs "Hello" vs "Dear")
  - Closing style ("Thanks" vs "Best" vs "Regards")
  - Formality level
  - Average paragraph length
**And** future drafts use these patterns
**And** patterns are contact-specific if enough data

---

## Summary

This epic breakdown provides **27 epics** with comprehensive story coverage:

| Epic | Title | Stories | Phase |
|------|-------|---------|-------|
| 1 | Application Shell & First Launch | 20 | Foundation |
| 2 | First Conversation | 16 | Foundation |
| 3 | Session Persistence | 15 | Foundation |
| 4 | PARA Filesystem Foundation | 15 | Foundation |
| 5 | GTD Sidebar Navigation | 17 | Foundation |
| 6 | Quick Capture & Inbox Processing | 14 | Foundation |
| 7 | Credential & API Key Management | 12 | Foundation |
| 8 | Built-in Tool Servers | 9 | Integration |
| 9 | Composio SDK Foundation | 9 | Integration |
| 10 | Gmail Integration | 8 | Integration |
| 11 | Calendar Integration | 8 | Integration |
| 12 | Permission System | 12 | Security |
| 13 | Audit Trail & Transparency | 8 | Security |
| 14 | Canvas Foundation | 10 | UX |
| 15 | Calendar & Approval Canvases | 9 | UX |
| 16 | Email & Task Canvases | 10 | UX |
| 17 | Skill Loading & Activation | 10 | Extension |
| 18 | Agent & Subagent System | 12 | Extension |
| 19 | Hook System | 12 | Extension |
| 20 | Butler Plugin Skills | 8 | Extension |
| 21 | Session Advanced Features | 8 | Advanced |
| 22 | Context Intelligence | 13 | Advanced |
| 23 | Plugin Ecosystem & Archive | 14 | Advanced |
| 24 | Authentication & Billing | 12 | Cloud |
| 25 | Vector Search & Embeddings | 10 | Intelligence |
| 26 | Testing Infrastructure | 12 | Quality |
| 27 | Memory & Learning System | 12 | Intelligence |

**Total: 305 stories across 27 epics**

### Coverage Summary

| Category | Epics | Status |
|----------|-------|--------|
| Functional Requirements (FR-1 to FR-10) | 1-23 | Full coverage |
| Non-Functional Requirements (NFR-1 to NFR-9) | 1-27 | Full coverage |
| Authentication & Billing (NFR-4.11, 4.12, 4.13, 5.8) | 24 | **NEW** |
| Vector Search (Architecture Requirement) | 25 | **NEW** |
| Testing Infrastructure (Quality Assurance) | 26 | **NEW** |
| Memory System (Architecture Requirement) | 27 | **NEW** |

All functional requirements, non-functional requirements, and architecture requirements are now covered with full traceability to the PRD, Architecture, and UX Design specifications.

### Pre-Mortem Gaps Addressed

The following gaps identified during pre-mortem review have been addressed:

| Gap | Resolution |
|-----|------------|
| Missing Auth/Billing | Epic 24 added with 12 stories |
| Missing Vector Search | Epic 25 added with 10 stories |
| Missing Test Strategy | Epic 26 added with 12 stories |
| Missing Memory System | Epic 27 added with 12 stories |
| No Epic Dependencies | Dependency Map added to document |
