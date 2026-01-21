# Functional Requirements: Orion Harness

**Extracted from:** PRD v2-draft  
**Date:** 2026-01-20  
**Status:** Comprehensive FR Extraction  

This document extracts functional requirements from the Orion PRD v2-draft, organizing them into testable capability statements following BMAD standards.

---

## Table of Contents

1. [FR-1: Harness Core](#fr-1-harness-core)
2. [FR-2: Session Management](#fr-2-session-management)
3. [FR-3: Extension System](#fr-3-extension-system)
4. [FR-4: MCP Integration](#fr-4-mcp-integration)
5. [FR-5: PARA Filesystem](#fr-5-para-filesystem)
6. [FR-6: GTD Interface](#fr-6-gtd-interface)
7. [FR-7: Permission System](#fr-7-permission-system)
8. [FR-8: Canvas System](#fr-8-canvas-system)
9. [FR-9: Butler Plugin (Reference)](#fr-9-butler-plugin-reference)
10. [FR-10: Technical Infrastructure](#fr-10-technical-infrastructure)

---

## FR-1: Harness Core

### Overview
The harness wraps the Claude Agent SDK to expose all capabilities while adding knowledge-worker infrastructure.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-1.1 | The system SHALL wrap the Claude Agent SDK (TypeScript Stable v1) to expose all SDK features | All SDK features (sessions, streaming, tools, subagents, hooks, skills, plugins, MCP, structured outputs, extended thinking, prompt caching, context compaction) are accessible via the harness | §4.1, §7.3 |
| FR-1.2 | The system SHALL maintain conversation continuity across sessions | User can resume a previous session and continue the conversation with full context preserved | UJ-1, §4.2 |
| FR-1.3 | The system SHALL support streaming responses in real-time | Agent responses appear token-by-token in the UI with <500ms first token latency (p95) | §7.7, §8.4 |
| FR-1.4 | The system SHALL support all SDK-native tools | Bash, Read, Write, Edit, Glob, Grep, Task, AskUserQuestion, TodoWrite tools are available | §5.5 |
| FR-1.5 | The system SHALL support extended thinking for complex reasoning | Agent can use extended thinking mode when complex reasoning is required, controlled by maxThinkingTokens budget | §4.1, §7.3 |
| FR-1.6 | The system SHALL support prompt caching for cost optimization | Frequently-used context is cached with configurable TTL to reduce API costs | §4.1, §7.3 |
| FR-1.7 | The system SHALL support structured outputs with type safety | Agents can return type-safe responses validated against type-validated schemas | §4.1, §7.3 |
| FR-1.8 | The system SHALL maintain context compaction with PARA preservation | When context limits are approached, system compacts history while preserving PARA structure summary, user preferences, session goals, and active project list | §4.4 |

---

## FR-2: Session Management

### Overview
Sessions enable conversation continuity and context isolation across different workflows.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-2.1 | The system SHALL support named session types | Daily, Project, Inbox, and Ad-hoc session types can be created with distinct naming patterns | §4.2 |
| FR-2.2 | The system SHALL support automatic session resumption | Daily sessions auto-resume if accessed on the same day; Project sessions persist across days | §4.2 |
| FR-2.3 | The system SHALL support session forking | User can fork a session to create "what-if" scenarios without affecting the original conversation | §4.2 |
| FR-2.4 | The system SHALL export session transcripts | Sessions can be exported to JSONL format for audit or handoff | §4.2 |
| FR-2.5 | The system SHALL persist session data locally | Session transcripts stored in `~/.orion/sessions/` with metadata index for search | §4.2 |
| FR-2.6 | The system SHALL restore session context in <1s | Session resume operation completes in under 1 second | §7.7 |
| FR-2.7 | The system SHALL maintain session metadata | Each session tracks type, name, last_active timestamp, and context_summary | §7.4.1 |

---

## FR-3: Extension System

### Overview
Extension points allow capabilities to be added via standalone files or bundled plugins.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-3.1 | The system SHALL load skills from `.claude/skills/` directory | All SKILL.md files in the skills directory are loaded at startup without errors | §5.1, UJ-7 |
| FR-3.2 | The system SHALL support skill activation via keywords | Skills activate automatically when user input matches defined keywords | §5.1 |
| FR-3.3 | The system SHALL support skill activation via commands | Skills can be explicitly invoked using `/command` syntax | §5.1, §5.6 |
| FR-3.4 | The system SHALL load agent definitions from `.claude/agents/` directory | All agent definition files are loaded and validated at startup | §5.2, UJ-8 |
| FR-3.5 | The system SHALL support subagent spawning via Task tool | Main agent can spawn specialized subagents using the Task tool with proper context handoff | §5.2, UJ-2 |
| FR-3.6 | The system SHALL support directory-based subagent output | Subagents write large outputs to `.claude/cache/agents/{name}/output/` to avoid bloating context | §5.2 |
| FR-3.7 | The system SHALL register hooks from `.claude/hooks/hooks.json` | All hooks defined in hooks.json are registered and fire on appropriate events | §5.3 |
| FR-3.8 | The system SHALL support all SDK hook events | All 12 hook events (SessionStart, SessionEnd, PreToolUse, PostToolUse, PostToolUseFailure, SubagentStart, SubagentStop, PermissionRequest, UserPromptSubmit, PreCompact, Notification, Stop) are supported | §5.3 |
| FR-3.9 | The system SHALL execute hooks with <50ms latency | Hook execution completes in under 50ms per hook | §7.7 |
| FR-3.10 | The system SHALL connect to configured MCP servers | All servers defined in `.mcp.json` connect successfully at startup | §5.4 |
| FR-3.11 | The system SHALL support plugin installation | Plugins can be installed via `/plugin install owner/repo` command | §5.7, UJ-10 |
| FR-3.12 | The system SHALL validate plugin manifests | Plugin installation validates plugin.json manifest including required dependencies | §5.7 |
| FR-3.13 | The system SHALL support plugin scopes | Plugins can be installed at user (`~/.claude/plugins/`), project (`.claude/plugins/`), or local (`.claude/plugins-local/`) scope | §5.7 |
| FR-3.14 | The system SHALL load extensions standalone or bundled | Individual skills/agents/hooks work as standalone files; plugins bundle multiple extensions | §5.8 |

---

## FR-4: MCP Integration

### Overview
MCP servers provide external tool access, with Composio as the primary integration for 500+ web apps.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-4.1 | The system SHALL support Composio SDK integration | Composio SDK connects directly and provides access to configured app integrations | §4.7, §7.5 |
| FR-4.2 | The system SHALL support dynamic tool discovery | System dynamically loads only relevant tools based on context (Gmail for "check inbox", Calendar for "schedule") instead of loading all 500+ tools | §4.7 |
| FR-4.3 | The system SHALL connect Gmail via Composio | Gmail tools (GMAIL_GET_EMAILS, GMAIL_SEND_EMAIL, GMAIL_SEARCH) are available via Composio SDK | §4.7, UJ-2 |
| FR-4.4 | The system SHALL connect Google Calendar via Composio | Calendar tools (CALENDAR_LIST_EVENTS, CALENDAR_CREATE_EVENT) are available via Composio SDK | §4.7, UJ-3 |
| FR-4.5 | The system SHALL support OAuth for Composio connections | Composio connections authenticate via OAuth with credentials stored securely | §4.7 |
| FR-4.6 | The system SHALL complete MCP tool calls in <2s | Composio operations complete in under 2 seconds (p95) | §7.7 |
| FR-4.7 | The system SHALL support stdio MCP servers | Local MCP servers can be configured to communicate via JSON-RPC over stdin/stdout | §5.4 |
| FR-4.8 | The system SHALL support HTTP MCP servers | Remote MCP servers can be configured to communicate via REST/SSE | §5.4 |

---

## FR-5: PARA Filesystem

### Overview
PARA provides structured filesystem context for agents while remaining invisible to users.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-5.1 | The system SHALL maintain PARA directory structure | `~/Orion/` contains projects/, areas/, resources/, archive/, inbox/ directories | §4.5, §2.4 |
| FR-5.2 | The system SHALL store project metadata | Each project in `~/Orion/projects/{slug}/` contains `_meta.yaml`, `notes.md`, `tasks.yaml` | §4.5 |
| FR-5.3 | The system SHALL provide agent read/write access to PARA | Agents can read and write files within `~/Orion/` hierarchy using SDK tools | §4.5 |
| FR-5.4 | The system SHALL organize captures into PARA automatically | Agent determines correct PARA location for captured items without user intervention | UJ-5, §9.3 |
| FR-5.5 | The system SHALL archive completed items by month | Completed projects/items move to `archive/YYYY-MM/` | §4.5 |
| FR-5.6 | The system SHALL maintain contact cards in resources | Contact information stored in `~/Orion/resources/contacts/` | §4.5 |
| FR-5.7 | The system SHALL maintain templates in resources | Reusable templates stored in `~/Orion/resources/templates/` | §4.5 |
| FR-5.8 | The system SHALL route inbox captures correctly | Agent achieves 80%+ accuracy in routing captured items to correct PARA location | §9.3 |

---

## FR-6: GTD Interface

### Overview
GTD provides the user-facing abstraction over PARA, allowing capture and organization without exposing filesystem structure.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-6.1 | The system SHALL provide Inbox view | Inbox view displays unprocessed conversations from `~/Orion/inbox/` | §2.5, §8.3 |
| FR-6.2 | The system SHALL provide Next Actions view | Next Actions view displays tasks with `status: next` | §2.5 |
| FR-6.3 | The system SHALL provide Projects view | Projects view displays active projects from `~/Orion/projects/` | §2.5 |
| FR-6.4 | The system SHALL provide Waiting For view | Waiting For view displays tasks with `status: waiting` | §2.5 |
| FR-6.5 | The system SHALL provide Someday/Maybe view | Someday view displays items from `~/Orion/areas/someday/` | §2.5 |
| FR-6.6 | The system SHALL support new inbox capture | User can create new inbox entry in <2 seconds via ⌘N shortcut | §8.2, §9.7 |
| FR-6.7 | The system SHALL auto-categorize captures | Agent processes inbox items and moves them to appropriate GTD category without manual user categorization | UJ-5, §8.3 |
| FR-6.8 | The system SHALL maintain collapsible sidebar sections | Each GTD section (Inbox, Next, Projects, Waiting, Someday) can collapse to show only count badge | §8.6 |
| FR-6.9 | The system SHALL allow sidebar collapse for focus mode | Sidebar can fully collapse (⌘[ shortcut) to expand conversation area | §8.2, §8.11 |
| FR-6.10 | The system SHALL map PARA to GTD invisibly | Users interact only with GTD categories; PARA filesystem remains invisible | §2.4, §8.1 |

---

## FR-7: Permission System

### Overview
Permission system controls agent tool access with context-appropriate defaults and user approval flows.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-7.1 | The system SHALL support permission modes | System supports `default`, `plan`, and `acceptEdits` permission modes per SDK | §4.3 |
| FR-7.2 | The system SHALL auto-allow read operations | Gmail read (`gmail_get_*`), Calendar read (`calendar_list_*`) auto-allowed without prompts | §4.3 |
| FR-7.3 | The system SHALL prompt for write operations | Gmail send (`gmail_send_*`), Calendar create (`calendar_create_*`) require user approval | §4.3, UJ-4 |
| FR-7.4 | The system SHALL auto-allow PARA filesystem access | Read/write operations within `~/Orion/` auto-allowed | §4.3 |
| FR-7.5 | The system SHALL block sensitive file access | Operations on `.env`, `*secret*`, `*credential*` files are blocked | §4.3 |
| FR-7.6 | The system SHALL block dangerous bash commands | Commands like `rm -rf`, `sudo`, `chmod 777` are blocked | §4.3 |
| FR-7.7 | The system SHALL display inline permission cards | Permission requests appear as inline cards in conversation thread with Allow/Deny/Edit options | §8.8 |
| FR-7.8 | The system SHALL support custom permission hooks | PreToolUse hooks can implement custom permission logic per tool pattern | §5.3, §6.4.2 |
| FR-7.9 | The system SHALL audit all external tool calls | All Composio and external tool executions are logged to audit trail | §4.3, §6.4.3 |

---

## FR-8: Canvas System

### Overview
Canvas provides rich, contextual UI that spawns inline within conversations when needed.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-8.1 | The system SHALL support inline canvas rendering | Canvas UI components render within message thread, not as separate pages | §8.5 |
| FR-8.2 | The system SHALL support calendar picker canvas | When scheduling, calendar canvas shows available time slots with conflict detection | §8.5, UJ-3 |
| FR-8.3 | The system SHALL support email composer canvas | When drafting email, composer canvas shows To/Subject/Body with tone controls | §8.5, UJ-4 |
| FR-8.4 | The system SHALL support project board canvas | When planning project, project canvas shows goals, milestones, tasks | §8.5 |
| FR-8.5 | The system SHALL support task list canvas | For multiple action items, task list canvas shows checkable items | §8.5 |
| FR-8.6 | The system SHALL support approval card canvas | For permission requests, approval card shows action details with Allow/Deny/Edit | §8.5, §8.8 |
| FR-8.7 | The system SHALL spawn canvas based on agent decision | Agent determines when canvas is contextually appropriate, not user | §8.5 |
| FR-8.8 | The system SHALL make canvas interactive | User can interact with canvas (pick times, edit drafts, check tasks) | §8.5 |
| FR-8.9 | The system SHALL persist canvas state in conversation | Canvas state is saved with conversation thread for future reference | §8.5 |
| FR-8.10 | The system SHALL support canvas collapse | Canvas can minimize if conversation continues beyond it | §8.5 |

---

## FR-9: Butler Plugin (Reference)

### Overview
Butler plugin is the reference implementation demonstrating meta-skill patterns for knowledge workers.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-9.1 | The Butler plugin SHALL provide morning briefing skill | `/briefing` command generates daily overview with calendar, urgent emails, tasks due today | §6.2.1, UJ-1 |
| FR-9.2 | The Butler plugin SHALL provide inbox triage skill | `/inbox` command processes email, scores priority (0.0-1.0), extracts actions, suggests PARA filing | §6.2.2, UJ-2 |
| FR-9.3 | The Butler plugin SHALL provide calendar management skill | `/schedule` command checks availability, suggests times, handles conflicts, creates events | §6.2.3, UJ-3 |
| FR-9.4 | The Butler plugin SHALL provide email composition skill | `/email` command loads context, analyzes writing style, generates draft matching user's tone | §6.2.4, UJ-4 |
| FR-9.5 | The Butler plugin SHALL provide weekly review skill | `/review` command guides GTD weekly review: completed items, inbox processing, project review, waiting review, someday review | §6.2.5, UJ-6 |
| FR-9.6 | The Butler plugin SHALL provide triage subagent | Triage agent (Sonnet, read-only) scores inbox items and returns structured TriageResult | §6.3.1 |
| FR-9.7 | The Butler plugin SHALL provide scheduler subagent | Scheduler agent (Sonnet) manages calendar operations and returns structured ScheduleResult | §6.3.2 |
| FR-9.8 | The Butler plugin SHALL provide communicator subagent | Communicator agent (Opus) drafts emails/messages matching user tone and returns structured DraftResult | §6.3.3 |
| FR-9.9 | The Butler plugin SHALL provide researcher subagent | Researcher agent (Sonnet, read-only) finds information and returns structured ResearchResult | §6.3.4 |
| FR-9.10 | The Butler plugin SHALL inject context at session start | SessionStart hook loads user preferences, active projects, recent contacts, today's calendar | §6.4.1 |
| FR-9.11 | The Butler plugin SHALL enforce permission rules | PreToolUse hook auto-allows reads, prompts for writes, blocks sensitive operations | §6.4.2 |
| FR-9.12 | The Butler plugin SHALL audit tool usage | PostToolUse hook logs tool name, sanitized inputs, output summary, timestamp, session ID | §6.4.3 |
| FR-9.13 | The Butler plugin SHALL save learned preferences | SessionEnd hook captures corrections, scheduling preferences, filing patterns to preferences.yaml | §6.4.4 |
| FR-9.14 | The Butler plugin SHALL validate as installable package | Plugin manifest validates, dependencies declared, can be installed by others via `/plugin install` | §6.6, §6.7, UJ-10 |

---

## FR-10: Technical Infrastructure

### Overview
Technical requirements ensuring harness reliability, performance, and extensibility.

| ID | Requirement | Test Criteria | Traces To |
|----|-------------|---------------|-----------|
| FR-10.1 | The system SHALL run as macOS desktop application | Application built with Tauri 2.0 runs on macOS 12 (Monterey) or later | §7.1 |
| FR-10.2 | The system SHALL launch in <3 seconds | Application becomes interactive in under 3 seconds from launch | §7.7 |
| FR-10.3 | The system SHALL use <500MB memory typically | Average memory usage stays under 500MB during normal operation | §7.7 |
| FR-10.4 | The system SHALL store local data in SQLite | Application data (sessions, preferences, audit log, plugins) stored in `~/.orion/orion.db` | §7.4.1 |
| FR-10.5 | The system SHALL store API keys securely | API keys (Anthropic, Composio) stored in macOS Keychain, never in files | §7.6 |
| FR-10.6 | The system SHALL maintain audit trail | All external tool calls logged to action_log table or JSONL file | §7.6, §6.4.3 |
| FR-10.7 | The system SHALL support keyboard shortcuts | All primary actions accessible via keyboard (⌘N new, ⌘K palette, ⌘[ collapse, ⌘↑/↓ navigate, ⌘Enter send) | §8.11 |
| FR-10.8 | The system SHALL meet WCAG AA accessibility | UI meets WCAG AA standards: keyboard navigation, screen reader support, 4.5:1 contrast, reduced motion support | §8.12 |
| FR-10.9 | The system SHALL support responsive layout | UI adapts to desktop (≥1280px), laptop (1024-1279px), tablet/mobile (<1024px) breakpoints | §8.10 |
| FR-10.10 | The system SHALL maintain MCP connection uptime | MCP servers maintain 99% uptime, disconnects trigger alerts | §9.5 |
| FR-10.11 | The system SHALL load skills in <100ms each | Individual skill loading completes in under 100ms | §9.5 |
| FR-10.12 | The system SHALL maintain error rate <1% | Less than 1% of user interactions result in errors | §9.5 |

---

## Traceability Matrix

### User Journeys to FRs

| Journey | Primary FRs |
|---------|------------|
| UJ-1: Morning Briefing | FR-9.1, FR-9.6, FR-9.7, FR-6.1-6.5 |
| UJ-2: Inbox Triage | FR-9.2, FR-9.6, FR-4.3, FR-5.4, FR-7.2 |
| UJ-3: Schedule Meeting | FR-9.3, FR-9.7, FR-4.4, FR-8.2, FR-7.3 |
| UJ-4: Draft Communication | FR-9.4, FR-9.8, FR-4.3, FR-8.3, FR-7.3 |
| UJ-5: Capture & Organize | FR-6.6, FR-6.7, FR-5.4, FR-5.8, FR-6.10 |
| UJ-6: Weekly Review | FR-9.5, FR-6.1-6.5, FR-5.5 |
| UJ-7: Create Custom Skill | FR-3.1, FR-3.2, FR-3.3 |
| UJ-8: Create Custom Agent | FR-3.4, FR-3.5, FR-3.6 |
| UJ-9: Build Meta-Skill | FR-3.1, FR-3.5, FR-9.1-9.5 |
| UJ-10: Package Plugin | FR-3.11, FR-3.12, FR-3.13, FR-9.14 |

### Architecture Components to FRs

| Component | Primary FRs |
|-----------|------------|
| SDK Wrapper | FR-1.1-1.8 |
| Session Manager | FR-2.1-2.7 |
| Extension Loader | FR-3.1-3.14 |
| MCP Integration | FR-4.1-4.8 |
| PARA Filesystem | FR-5.1-5.8 |
| GTD UI | FR-6.1-6.10 |
| Permission Engine | FR-7.1-7.9 |
| Canvas System | FR-8.1-8.10 |
| Butler Plugin | FR-9.1-9.14 |
| Infrastructure | FR-10.1-10.12 |

---

## Implementation Priority

### P0 (Week 1: Harness Foundation)

| FR Group | Critical Capabilities |
|----------|----------------------|
| FR-1 | Core SDK wrapper, streaming, basic tools |
| FR-2 | Named sessions, persistence, resume |
| FR-3 | Skill loading, hook registration, basic commands |
| FR-4 | Composio connection, Gmail/Calendar OAuth |
| FR-10 | Tauri shell, basic UI, secure API key storage |

**Gate:** Can converse with agent, use commands, access Gmail/Calendar, sessions persist.

### P1 (Month 1: Invisible Orchestration)

| FR Group | Critical Capabilities |
|----------|----------------------|
| FR-5 | PARA directory creation, project metadata, agent access |
| FR-6 | GTD sidebar, auto-categorization, inbox capture |
| FR-3 | Subagent spawning, directory handoff |
| FR-7 | Permission modes, auto-rules, prompting |
| FR-9 | Butler core skills (briefing, triage, schedule, email) |

**Gate:** User captures anything, agent routes to correct GTD category, user never manually organizes.

### P2 (Month 3: Rich Experience)

| FR Group | Critical Capabilities |
|----------|----------------------|
| FR-8 | All canvas types, inline rendering, persistence |
| FR-7 | Inline permission cards, approval flow |
| FR-9 | All Butler subagents, hooks, commands |
| FR-3 | Plugin packaging, validation, installation |
| FR-10 | Keyboard shortcuts, accessibility, polish |

**Gate:** Canvas spawns contextually, permissions smooth, plugin shareable.

---

## Success Criteria Summary

### Week 1: Harness Health
- ✅ SDK connected and responding
- ✅ Composio SDK authenticated
- ✅ Skills/hooks load without errors
- ✅ Basic chat round-trip working
- ✅ Sessions persist across restarts

### Month 1: Invisible Orchestration
- ✅ 80%+ inbox routing accuracy
- ✅ Projects correctly detected and filed
- ✅ Subagents spawn and handoff
- ✅ User unaware PARA exists

### Month 3: Full Experience
- ✅ Canvas spawns when contextually needed
- ✅ Permission flow smooth and clear
- ✅ Daily driver for personal productivity
- ✅ Plugin packaged and installable

---

## Notes on Requirement Format

**Capability-Focused:**
- FRs describe WHAT the system does, not HOW it's implemented
- Each FR is independently testable
- Test criteria are observable/measurable

**Avoids Implementation Leakage:**
- "SHALL support email composition skill" (FR-9.4) vs. "SHALL use Opus model for drafting" (implementation detail)
- "SHALL maintain PARA structure" (FR-5.1) vs. "SHALL use YAML for metadata" (implementation detail)

**Traces to Source:**
- Each FR references the PRD section (§) and User Journey (UJ-X) it derives from
- Enables bidirectional traceability: requirement → source and source → requirement

**BMAD FR Numbering:**
- FR-X.Y format where X = domain, Y = sequential
- Groups related capabilities (FR-1 = Harness Core, FR-2 = Sessions, etc.)
- Allows insertion of new requirements (FR-3.15) without renumbering

---

## Appendix: Requirement Extraction Methodology

**Sources Analyzed:**
1. §3 User Journeys (UJ-1 through UJ-10) - extracted user-facing capabilities
2. §4 Harness Architecture - extracted SDK wrapper and infrastructure capabilities
3. §5 Extension Points - extracted skills, agents, hooks, MCP, plugin capabilities
4. §6 Butler Plugin - extracted reference implementation capabilities
5. §7 Technical Requirements - extracted infrastructure and performance capabilities
6. §8 UX/UI Requirements - extracted interface and interaction capabilities

**Extraction Approach:**
1. Identify implied capabilities ("user can...", "system shall...", "agent determines...")
2. Convert to testable FR format
3. Group by domain (Harness Core, Sessions, Extensions, etc.)
4. Trace to source sections
5. Validate completeness against success metrics (§9)

**Total FRs Extracted:** 94 functional requirements across 10 domains

