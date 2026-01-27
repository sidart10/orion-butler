# Orion Butler - Project Context

> **Last Updated:** 2026-01-23
> **Version:** 2.0 (synthesized from PRD v2, Architecture v1, UX Spec v1)
> **Status:** Ready for Implementation

---

## Executive Summary

**Orion** is a Claude Agent SDK harness that brings Claude Code's transformative productivity to knowledge workers. It's a macOS desktop app that acts as an autonomous personal butler—managing email, calendar, tasks, and projects through natural conversation.

**Core Insight:** Claude Code proved that `Claude + Skills + Hooks + Subagents + MCP = transformative productivity`. Orion packages this architecture for everyone, not just developers.

**What Makes It Different:**
- **Conversation IS the interface** - No feature navigation, just natural language
- **Invisible orchestration** - PARA filesystem organizes everything; users see GTD views
- **Canvas system** - Rich UI (calendars, email composers) spawns inline within chat
- **Autonomous by default** - Agent executes without constant permission requests

---

## Table of Contents

1. [Vision & Goals](#vision--goals)
2. [Target Users](#target-users)
3. [Core Features (Epics)](#core-features-epics)
4. [Technology Stack](#technology-stack)
5. [Architecture Overview](#architecture-overview)
6. [Key User Journeys](#key-user-journeys)
7. [Design System](#design-system)
8. [Functional Requirements](#functional-requirements)
9. [Non-Functional Requirements](#non-functional-requirements)
10. [Success Metrics](#success-metrics)
11. [Constraints & Assumptions](#constraints--assumptions)

---

## Vision & Goals

### Vision Statement

Orion is a **Claude Agent SDK harness** that brings the power of Claude Code to knowledge workers. Just as Claude Code transformed software development with autonomous coding assistance, Orion transforms personal productivity with autonomous life/work management.

### What is a Harness?

A harness is infrastructure that maximizes an SDK's capabilities while remaining extensible:
- **Full SDK feature exposure** - All capabilities accessible
- **Extensible architecture** - Skills, agents, hooks, MCP, tools
- **Plugin distribution system** - Marketplace-ready
- **Domain-specific organization** - PARA filesystem for agents
- **User-friendly interface** - GTD for end users

### Primary Goals

| Milestone | Success Statement |
|-----------|-------------------|
| **Week 1** | "I can open Orion, start a conversation, use `/commands`, and the agent can read my Gmail and Calendar via Composio. Sessions persist across restarts." |
| **Month 1** | "I capture anything—task, note, project idea—and the agent routes it to the right place. I see GTD categories in the sidebar, but I never manually organize into PARA. It just works." |
| **Month 3** | "Orion is my daily driver for personal productivity. Canvas appears when I schedule or draft emails. I've built custom skills. The Butler plugin is packaged and installable." |

---

## Target Users

### Primary: Knowledge Worker
- **Profile:** Non-technical professionals seeking AI-assisted productivity
- **Goal:** Get things done without learning technical systems
- **Pain Points:** Manual email triage, calendar management, task organization
- **Success Metric:** Using Orion as daily driver for personal productivity

### Secondary: Power User
- **Profile:** Technical users who customize workflows (GTD practitioners)
- **Goal:** Optimize productivity with custom skills/agents
- **Success Metric:** Created 3+ custom skills, packaged personal plugin

### Tertiary: Developer/Extender
- **Profile:** Builders creating extensions for Orion platform
- **Goal:** Build and distribute new capabilities
- **Success Metric:** Published plugin installable by others

---

## Core Features (Epics)

### Epic 1: Harness Foundation (P0 - Week 1)
- SDK wrapper exposing all features (sessions, streaming, tools, subagents, hooks, skills, plugins, MCP)
- Named sessions (Daily, Project, Inbox, Ad-hoc) with persistence and resumption
- Extension system loading skills, agents, hooks from filesystem

### Epic 2: MCP Integration (P0 - Week 1)
- Composio SDK integration (500+ web apps: Gmail, Calendar, Slack, Notion)
- Dynamic tool discovery (load only relevant tools based on context)
- OAuth management in macOS Keychain

### Epic 3: PARA Filesystem (P1 - Month 1)
- Structured agent context: Projects, Areas, Resources, Archive, Inbox
- Metadata system: `_meta.yaml`, notes, task lists
- Auto-organization: Agent routes to correct location (80%+ accuracy target)

### Epic 4: GTD Interface (P1 - Month 1)
- User-facing views: Inbox, Next Actions, Projects, Waiting For, Someday/Maybe
- Invisible PARA mapping (users interact with GTD; PARA remains hidden)
- Quick capture (<2s via ⌘N)
- Auto-categorization: Agent processes captures and routes automatically

### Epic 5: Permission System (P1 - Month 1)
- Permission modes: default, plan, acceptEdits
- Smart auto-approval (reads allowed, writes prompt, sensitive blocked)
- Inline permission cards in conversation
- Audit trail for all external tool calls

### Epic 6: Canvas System (P2 - Month 3)
- Inline rich UI: Calendar picker, Email composer, Project board, Task list, Approval cards
- Context-aware spawning (agent determines when canvas needed)
- Interactive state persists in conversation

### Epic 7: Butler Plugin (P2 - Month 3)
- Core skills: Morning briefing, Inbox triage, Calendar management, Email composition, Weekly review
- Specialist subagents: Triage, Scheduler, Communicator, Researcher
- Lifecycle hooks: SessionStart, PreToolUse, PostToolUse, SessionEnd

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15 (SSG)** | React framework, static export for Tauri |
| **TypeScript** | Type safety (strict mode) |
| **Tailwind CSS** | Utility-first styling with Orion preset |
| **shadcn/ui** | Component library (Radix primitives) |
| **Zustand** | Simple state (UI preferences, session cache) |
| **XState** | Complex state machines (streaming, permissions, canvas) |
| **TipTap 2.1** | Rich text editing (EmailEditor, NoteEditor) |
| **json-render** | AI-generated UI components |
| **Drizzle ORM** | Type-safe database queries |
| **Zod** | Schema validation |

### Backend

| Technology | Purpose |
|------------|---------|
| **Tauri 2.0** | Desktop app framework (Rust) |
| **SQLite + sqlite-vec** | Local-first database with vector embeddings |
| **macOS Keychain** | Secure credential storage |

### AI/LLM

| Technology | Purpose |
|------------|---------|
| **Claude Agent SDK** | TypeScript Stable v1 - Agent orchestration |
| **Claude Opus 4.5** | Main LLM model |
| **Prompt Caching** | 50-80% cost savings |
| **Extended Thinking** | 1K-15K token budget for complex reasoning |

### External Services

| Service | Purpose |
|---------|---------|
| **Composio SDK 0.6+** | Gmail, Calendar, Slack (per-user OAuth) |
| **Supabase** | Auth, billing, multi-device sync |
| **Braintrust** | Session tracing, learning extraction |
| **Langfuse** | Prompt management, A/B testing |
| **Stripe** | Payments (USD + USDC) |

---

## Architecture Overview

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (SSG)                    │
│  • Chat Panel (streaming UI)                                 │
│  • Canvas System (json-render + TipTap)                      │
│  • GTD Sidebar Views (PARA interface)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ Tauri IPC
┌────────────────────▼────────────────────────────────────────┐
│                  Tauri Backend (Rust)                        │
│  • IPC Command Handlers                                      │
│  • SQLite + sqlite-vec Access                                │
│  • macOS Keychain Integration                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Claude Agent SDK Orchestration                  │
│  • Butler Agent (main orchestrator)                          │
│  • Specialist Agents (triage, scheduler, communicator)       │
│  • Hooks (permission, audit, context injection)              │
│  • Skills (task patterns)                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   External Services        Local Storage
   • Anthropic API          • SQLite (primary)
   • Composio (tools)       • PostgreSQL (sync)
   • Supabase (auth)        • Keychain (secrets)
```

### 12 Major Subsystems

1. **Harness Core** - Claude Agent SDK wrapper
2. **Session Management** - Named sessions, persistence, resume
3. **Extension System** - File-based skills/agents/hooks, hot-reload
4. **Tool Integration** - Composio SDK-Direct, MCP servers
5. **PARA Filesystem** - Structured agent context
6. **GTD Interface** - User-facing abstraction
7. **Permission System** - Three modes, audit trail
8. **Canvas System** - json-render + TipTap dual-mode
9. **Butler Plugin** - Reference implementation
10. **Database Layer** - SQLite + sqlite-vec
11. **Sync Layer** - PARA ↔ GTD real-time sync
12. **Observability** - Braintrust + Langfuse

### Key Architectural Patterns

**Extension System:** File-based extensions from `.claude/` with hot-reload
- Skills: YAML frontmatter + Markdown
- Agents: YAML frontmatter + Markdown
- Hooks: TypeScript (requires restart)

**State Management:** Dual-system approach
- Zustand: UI preferences, session cache
- XState: Streaming flow, permission dialogs, canvas interactions

**Canvas Dual-Mode:**
- Display mode: json-render (AI-generated UI)
- Edit mode: TipTap (user editing)

**Permission Two-Scope:**
- Session-scoped (memory) - Ephemeral
- User-scoped (SQLite) - Persistent

### Agent Hierarchy (26 Total)

**Core Agents (4):** butler, triage, scheduler, communicator

**Adapted from Claude Code (10):** navigator, planner, troubleshooter, executor, quick-action, reorganizer, reviewer, analyzer, investigator, notifier

**Reused As-Is (6):** oracle, maestro, scribe, memory-extractor, chronicler, context-query-agent

**New Specialized (6):** researcher-personal, reviewer-daily, contact-manager, task-manager, preference-learner, tool-connector

---

## Key User Journeys

### UJ-1: Morning Briefing
**Trigger:** "start my day" or app open
**Flow:** Agent → Subagents → Synthesize → Present top 3 priorities
**Success:** User knows focus areas without manual checks

### UJ-2: Inbox Triage
**Trigger:** "check inbox" or `/inbox`
**Flow:** Fetch emails → Score urgency → Present sorted → Execute approved actions
**Success:** Inbox processed, urgent surfaced, actions queued

### UJ-3: Schedule Meeting
**Trigger:** "schedule lunch with Omar"
**Flow:** Check availability → Apply preferences → **Spawn Calendar Canvas** → Create event
**Success:** Meeting scheduled with minimal effort

### UJ-4: Draft Communication
**Trigger:** "email Omar about the project"
**Flow:** Load context → Analyze tone → Generate draft → **Spawn Email Canvas** → Send
**Success:** Email matches user's natural voice

### UJ-5: Capture & Organize (Invisible Magic)
**Trigger:** Anything typed into "New Inbox"
**Flow:** Parse intent → Route to GTD category → Write to PARA → Update sidebar
**Success:** Item in correct bucket without user categorization

### UJ-6: Weekly Review
**Trigger:** "weekly review" or `/review`
**Flow:** Guide through GTD steps → **Spawn Review Canvas** → Generate summary
**Success:** All buckets reviewed, week planned

---

## Design System

### Design Philosophy

**Core Paradigm:** Conversation-First Personal Butler
- Conversation IS the interface - no feature navigation
- Autonomous by default - agents execute without constant permission
- Progressive revelation - simple surface, depth on demand
- Invisible orchestration - PARA hidden, GTD visible

**Editorial Luxury Aesthetic:**
- Premium, calm, confident
- Timeless over trendy
- Every pixel earns its place
- Trust through transparency

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Gold | #D4AF37 | Primary accent, success, active |
| Gold Muted | #C4A052 | Backgrounds, borders |
| Cream | #FAF8F5 | Main background |
| Black | #1A1A1A | Primary text |
| Gray | #6B6B6B | Secondary text |
| Waiting Blue | #3B82F6 | Blocked states |
| Error Red | #9B2C2C | Error text only |

### Typography

| Level | Font | Size |
|-------|------|------|
| Display | Playfair Display | 32px |
| H1 | Playfair Display | 24px |
| H2 | Inter Semibold | 20px |
| Body | Inter Regular | 16px |
| Small | Inter Regular | 14px |

### Key Visual Rules

- **Sharp corners (0px radius)** - Editorial brand signature
- **No emojis** - Typography-first
- **Gold for positive, Blue for waiting, Red text only for errors**
- **44x44px minimum touch targets**
- **WCAG AA compliance** (4.5:1 contrast minimum)

### Canvas Types

| Canvas | Purpose |
|--------|---------|
| Calendar Picker | Time slot selection |
| Email Composer | Draft composition |
| Approval Card | Permission requests |
| Task List | Task management |
| Weekly Review | GTD review flow |
| File Preview | Document viewing |
| Project Board | Project planning |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘⌥O | Invoke Orion (global) |
| ⌘K | Command palette |
| ⌘N | Quick capture |
| ⌘[ | Toggle sidebar |
| ⌘Enter | Send / Approve |
| Esc | Dismiss / Cancel |

---

## Functional Requirements

### Summary by Domain

| Domain | Count | Key Requirements |
|--------|-------|------------------|
| **FR-1: Harness Core** | 8 | SDK wrapper, streaming <500ms, extended thinking |
| **FR-2: Session Management** | 7 | Named sessions, resume <1s, forking |
| **FR-3: Extension System** | 14 | Skills/agents/hooks loading, validation |
| **FR-4: MCP Integration** | 8 | Composio SDK, OAuth, <2s tool calls |
| **FR-5: PARA Filesystem** | 8 | Directory structure, 80%+ routing |
| **FR-6: GTD Interface** | 10 | Five views, <2s capture |
| **FR-7: Permission System** | 9 | Three modes, audit trail |
| **FR-8: Canvas System** | 10 | Inline rendering, 5 canvas types |
| **FR-9: Butler Plugin** | 14 | 5 skills, 4 subagents, 4 hooks |
| **FR-10: Infrastructure** | 12 | Tauri, <3s launch, Keychain |

**Total: 94 Functional Requirements**

---

## Non-Functional Requirements

### Performance (NFR-1)

| Metric | Target |
|--------|--------|
| First token latency | <500ms (p95) |
| Cold start | <3 seconds |
| MCP tool calls | <2 seconds |
| Session restore | <1 second |
| Hook execution | <50ms per hook |
| Memory usage | <500MB typical |

### Reliability (NFR-2)

| Metric | Target |
|--------|--------|
| MCP uptime | 99% |
| Error rate | <1% |
| Session restore success | 99% |
| Skill load success | 100% |

### Security (NFR-4)

- **100% API keys in Keychain** (never in files)
- **100% audit logging** for external tool calls
- **Sensitive file blocking** via PreToolUse hook
- **Minimum OAuth scopes**

### Accessibility (NFR-5)

- 100% keyboard navigation
- macOS VoiceOver compatibility
- WCAG AA contrast ratios
- Dynamic font scaling

---

## Success Metrics

### Technical Health (Ongoing)

| Metric | Target | Alert |
|--------|--------|-------|
| API Latency (p95) | <500ms | >1s |
| Session Resume | <1s | >3s |
| MCP Connection | 99% | Any disconnect |
| Skill Load Time | <100ms | >500ms |
| Memory Usage | <500MB | >1GB |
| Error Rate | <1% | >5% |

### User Journey Success

| Journey | Success Criteria |
|---------|------------------|
| Morning Briefing | Top 3 priorities without manual check |
| Inbox Triage | Inbox processed, urgent surfaced |
| Schedule Meeting | Minimal effort scheduling |
| Draft Email | Matches user's tone |
| Capture & Organize | Correct GTD bucket automatically |
| Weekly Review | All buckets reviewed, week planned |

---

## Constraints & Assumptions

### Technical Constraints

- **Platform:** macOS 12+ only (MVP)
- **SDK:** Claude Agent SDK TypeScript Stable v1
- **Framework:** Tauri 2.0 + Next.js 15 App Router
- **Storage:** SQLite local, macOS Keychain for credentials

### Scope Boundaries

**In Scope:**
- Single-user desktop app
- Gmail/Calendar via Composio
- PARA/GTD system
- Canvas inline UI
- Extension system

**Out of Scope (Post-MVP):**
- Plugin marketplace UI (v1.1)
- Multi-user/team features (v2.0)
- Mobile apps (post-MVP)
- Windows/Linux support (v1.5)
- Offline mode (requires network)

### Key Assumptions

- SDK v1 APIs stable during development
- Users willing to grant PARA read/write access
- 80%+ PARA routing accuracy acceptable for MVP
- File-based extensions sufficient for power users
- Git-based plugin install acceptable pre-marketplace

---

## Quick Reference

### Slash Commands

| Command | Action |
|---------|--------|
| `/inbox` | Inbox triage |
| `/schedule` | Calendar management |
| `/email` | Email composition |
| `/review` | Weekly review |
| `/briefing` | Morning briefing |

### File Locations

| Purpose | Path |
|---------|------|
| Planning Artifacts | `thoughts/planning-artifacts/` |
| Design System | `thoughts/shared/design-system/` |
| Sessions | `~/.orion/sessions/` |
| Extensions | `.claude/skills/`, `.claude/agents/`, `.claude/hooks/` |

### Key Documents

| Document | Purpose |
|----------|---------|
| `prd-v2.md` | Full product requirements |
| `architecture.md` | Technical architecture |
| `ux-design-specification.md` | Complete UX spec |
| `functional-requirements-extracted.md` | All 94 FRs |
| `nfr-extracted-from-prd-v2.md` | All NFRs |

---

## Implementation Starting Point

```bash
npx create-tauri-ui@latest orion --template next
```

**First Sprint Focus:**
1. Tauri + Next.js scaffold
2. SDK wrapper with streaming
3. Session persistence (SQLite)
4. Basic extension loading
5. Composio connection (Gmail read-only)

---

*This document synthesizes PRD v2, Architecture v1, and UX Specification v1. Treat it as the single source of truth for project context.*
