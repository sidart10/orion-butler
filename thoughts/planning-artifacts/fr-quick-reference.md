# FR Quick Reference

**Purpose:** Fast lookup table for Orion functional requirements  
**Total FRs:** 94 across 10 domains

---

## By Priority

### P0 (Week 1: Harness Foundation) - 30 FRs

| FR | Capability | Status |
|----|------------|--------|
| FR-1.1 | SDK wrapper exposes all features | 🔴 Not Started |
| FR-1.2 | Conversation continuity across sessions | 🔴 Not Started |
| FR-1.3 | Streaming responses <500ms first token | 🔴 Not Started |
| FR-1.4 | All SDK-native tools available | 🔴 Not Started |
| FR-1.5 | Extended thinking support | 🔴 Not Started |
| FR-1.6 | Prompt caching | 🔴 Not Started |
| FR-1.7 | Structured outputs with Zod | 🔴 Not Started |
| FR-1.8 | Context compaction preserves PARA | 🔴 Not Started |
| FR-2.1-2.7 | Session management (7 FRs) | 🔴 Not Started |
| FR-3.1-3.3 | Skill loading & activation (3 FRs) | 🔴 Not Started |
| FR-3.7-3.10 | Hook registration & MCP connection (4 FRs) | 🔴 Not Started |
| FR-4.1-4.6 | Composio SDK integration (6 FRs) | 🔴 Not Started |
| FR-10.1 | macOS desktop app (Tauri) | 🔴 Not Started |
| FR-10.5 | Secure API key storage (Keychain) | 🔴 Not Started |

**Gate:** SDK + Composio + Skills/Hooks working

---

### P1 (Month 1: Invisible Orchestration) - 32 FRs

| FR | Capability | Status |
|----|------------|--------|
| FR-5.1-5.8 | PARA filesystem (8 FRs) | 🔴 Not Started |
| FR-6.1-6.10 | GTD interface (10 FRs) | 🔴 Not Started |
| FR-3.4-3.6 | Agent definitions & subagent spawning (3 FRs) | 🔴 Not Started |
| FR-3.11-3.14 | Plugin system (4 FRs) | 🔴 Not Started |
| FR-7.1-7.5 | Permission modes & rules (5 FRs) | 🔴 Not Started |
| FR-9.1-9.2 | Butler briefing & triage skills (2 FRs) | 🔴 Not Started |

**Gate:** PARA orchestration invisible to user

---

### P2 (Month 3: Rich Experience) - 32 FRs

| FR | Capability | Status |
|----|------------|--------|
| FR-8.1-8.10 | Canvas system (10 FRs) | 🔴 Not Started |
| FR-7.6-7.9 | Permission cards & audit (4 FRs) | 🔴 Not Started |
| FR-9.3-9.14 | Butler remaining features (12 FRs) | 🔴 Not Started |
| FR-10.2-10.4, 10.6-10.12 | Infrastructure polish (6 FRs) | 🔴 Not Started |

**Gate:** Canvas + polish + shareable plugin

---

## By Domain

### FR-1: Harness Core (8 FRs)
SDK wrapper, streaming, tools, extended thinking, caching

### FR-2: Session Management (7 FRs)
Named sessions, resumption, forking, export, persistence

### FR-3: Extension System (14 FRs)
Skills, agents, hooks, plugins, MCP servers, commands

### FR-4: MCP Integration (8 FRs)
Composio, Gmail, Calendar, tool search mode, OAuth

### FR-5: PARA Filesystem (8 FRs)
Directory structure, metadata, auto-organization, archiving

### FR-6: GTD Interface (10 FRs)
Inbox, Next, Projects, Waiting, Someday views, auto-categorization

### FR-7: Permission System (9 FRs)
Permission modes, auto-rules, prompting, audit trail

### FR-8: Canvas System (10 FRs)
Inline rendering, calendar/email/project/task/approval canvas

### FR-9: Butler Plugin (14 FRs)
Skills (briefing, triage, schedule, email, review), subagents, hooks

### FR-10: Infrastructure (12 FRs)
Desktop app, performance, storage, security, accessibility

---

## By User Journey

| Journey | Primary FRs | Domain |
|---------|-------------|--------|
| UJ-1: Morning Briefing | FR-9.1, FR-9.6, FR-9.7 | Butler |
| UJ-2: Inbox Triage | FR-9.2, FR-9.6, FR-4.3, FR-5.4 | Butler + MCP + PARA |
| UJ-3: Schedule Meeting | FR-9.3, FR-9.7, FR-4.4, FR-8.2 | Butler + Canvas |
| UJ-4: Draft Communication | FR-9.4, FR-9.8, FR-8.3 | Butler + Canvas |
| UJ-5: Capture & Organize | FR-6.6, FR-6.7, FR-5.4 | GTD + PARA |
| UJ-6: Weekly Review | FR-9.5, FR-6.1-6.5 | Butler + GTD |
| UJ-7: Create Custom Skill | FR-3.1-3.3 | Extensions |
| UJ-8: Create Custom Agent | FR-3.4-3.6 | Extensions |
| UJ-9: Build Meta-Skill | FR-3.1, FR-3.5, FR-9.x | Extensions + Butler |
| UJ-10: Package Plugin | FR-3.11-3.14, FR-9.14 | Extensions |

---

## Critical Dependencies

### FR-1 (Harness Core) blocks:
- FR-2 (Sessions need SDK)
- FR-3 (Extensions need SDK)
- FR-4 (MCP via SDK)

### FR-3 (Extensions) + FR-4 (MCP) blocks:
- FR-5 (PARA needs agents)
- FR-9 (Butler needs extensions)

### FR-5 (PARA) + FR-6 (GTD) blocks:
- FR-8 (Canvas needs routing context)

### FR-7 (Permissions) spans:
- FR-4 (MCP tool permissions)
- FR-8 (Canvas approval cards)
- FR-9 (Butler hooks)

---

## Performance Targets

| FR | Metric | Target |
|----|--------|--------|
| FR-1.3 | First token latency | <500ms (p95) |
| FR-2.6 | Session resume | <1s |
| FR-3.9 | Hook execution | <50ms per hook |
| FR-4.6 | MCP tool calls | <2s (p95) |
| FR-6.6 | New inbox capture | <2s (from ⌘N to typing) |
| FR-10.2 | App launch | <3s to interactive |
| FR-10.3 | Memory usage | <500MB typical |
| FR-10.11 | Skill loading | <100ms per skill |
| FR-10.12 | Error rate | <1% interactions |

---

## Testability Checklist

### Week 1 Gate (P0)
- [ ] FR-1.1: All SDK features accessible
- [ ] FR-1.3: Streaming latency measured
- [ ] FR-2.2: Session resumption works
- [ ] FR-3.1: Skills load without errors
- [ ] FR-3.7: Hooks fire on events
- [ ] FR-4.1: Composio connected
- [ ] FR-4.3: Gmail OAuth complete
- [ ] FR-4.4: Calendar OAuth complete

### Month 1 Gate (P1)
- [ ] FR-5.4: Auto-organization works
- [ ] FR-5.8: 80%+ routing accuracy
- [ ] FR-6.7: Auto-categorization works
- [ ] FR-6.10: PARA invisible to user
- [ ] FR-3.5: Subagents spawn correctly
- [ ] FR-7.2: Read operations auto-allowed
- [ ] FR-7.3: Write operations prompt

### Month 3 Gate (P2)
- [ ] FR-8.2: Calendar canvas works
- [ ] FR-8.3: Email canvas works
- [ ] FR-8.7: Canvas spawns contextually
- [ ] FR-7.7: Permission cards inline
- [ ] FR-9.1: Morning briefing skill
- [ ] FR-9.2: Inbox triage skill
- [ ] FR-9.14: Plugin installable

---

## FR Status Legend

| Symbol | Status | Meaning |
|--------|--------|---------|
| 🔴 | Not Started | No work begun |
| 🟡 | In Progress | Actively being implemented |
| 🟢 | Complete | FR implemented and tested |
| ⚠️ | Blocked | Waiting on dependency |
| ❌ | Failed | Does not meet test criteria |

---

**Last Updated:** 2026-01-20  
**Source:** functional-requirements-extracted.md

