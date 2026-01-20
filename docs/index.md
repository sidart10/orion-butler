# Project Documentation Index

**Project:** Orion Personal Butler + Continuous Claude v3
**Generated:** 2026-01-14
**Scan Level:** Exhaustive

---

## Overview

This repository is a **monorepo** containing two integrated systems:

1. **Continuous Claude v3** - A persistent, multi-agent development environment built on Claude Code
2. **Orion Personal Butler** - An AI-powered macOS desktop assistant (in development)

The goal is to transform Continuous Claude's agent infrastructure into an "agentic butler suite" for personal productivity.

---

## Repository Structure

```
2026-01-orion-personal-butler/
├── .claude/                    # Claude Code Infrastructure
│   ├── agents/                 # 34 AI agent definitions
│   ├── skills/                 # 169 reusable workflows
│   ├── hooks/                  # 120 event handlers (TypeScript/Python/Shell)
│   ├── rules/                  # 12 behavior rules
│   ├── runtime/                # MCP client, schema utils
│   ├── servers/                # MCP server configurations
│   └── mcp_config.json         # MCP server registry
│
├── opc/                        # OPC Backend (Python)
│   ├── scripts/                # Memory, math, MCP, agents (60+ scripts)
│   ├── src/runtime/            # Core execution runtime
│   ├── docker-compose.yml      # PostgreSQL + PgBouncer + Redis
│   └── init-db.sql             # Database schema (209 lines)
│
├── docs/                       # Formal Documentation
│   ├── PRD-orion-personal-butler.md       # Product Requirements (1,237 lines)
│   ├── TECH-SPEC-orion-personal-butler.md # Technical Spec (3,499 lines)
│   ├── ARCHITECTURE.md         # System architecture
│   └── tools/, agents/, skills/, hooks/   # Reference docs
│
├── thoughts/                   # Planning & Research
│   ├── INDEX.md                # Navigation index
│   ├── TRACKER.md              # MVP progress tracker
│   ├── research/               # 25 research documents
│   └── shared/plans/           # 11 implementation plans
│
├── design-system/              # UI Design Tokens
│   └── tokens/                 # colors, typography, spacing, etc.
│
├── pages/                      # UI Mockups (29 HTML files)
│
├── orion/                      # PARA Data Structure
│   ├── inbox/                  # Incoming items
│   ├── projects/               # Active work with deadlines
│   ├── areas/                  # Ongoing responsibilities
│   ├── resources/              # Reference material (contacts, templates)
│   └── archive/                # Completed/inactive items
│
├── proofs/                     # Lean 4 Formal Proofs
│
└── _bmad/                      # BMAD Workflow System
```

---

## Source Statistics

| Category | Count |
|----------|-------|
| **Total Source Files** | 1,037 |
| **Python Files** | 183 |
| **TypeScript Files** | 90 |
| **Markdown Files** | 597 |
| **Agents** | 34 |
| **Skills** | 169 |
| **Hooks** | 120 |
| **Research Docs** | 25 |
| **Implementation Plans** | 11 |
| **UI Mockups** | 29 |

---

## Technology Stack

### Backend (OPC)

| Component | Technology |
|-----------|------------|
| Runtime | Python 3.12+ |
| Database | PostgreSQL 16 + pgvector |
| Connection Pool | PgBouncer |
| Cache | Redis 7 |
| API | FastAPI + Uvicorn |
| Embeddings | BGE-M3 (1024-dim, 8192 token context) |
| Observability | Braintrust + Langfuse (dual-system) |

### Claude Code Infrastructure

| Component | Technology |
|-----------|------------|
| Hooks | TypeScript → ESBuild → ESM |
| Local Cache | better-sqlite3 |
| Testing | Vitest |
| MCP Servers | uvx, npx, pipx (9 servers) |

### Planned (Orion MVP)

| Component | Technology |
|-----------|------------|
| Desktop | Tauri 2.0 + Next.js |
| UI | shadcn/ui |
| State | Zustand |
| Auth | Supabase Auth |
| Payments | Stripe (USD + USDC) |

---

## Key Documentation

### Product & Technical

| Document | Path | Purpose |
|----------|------|---------|
| **PRD** | `docs/PRD-orion-personal-butler.md` | Product requirements, user stories |
| **Tech Spec** | `docs/TECH-SPEC-orion-personal-butler.md` | Architecture, schemas, APIs |
| **MVP Plan** | `thoughts/shared/plans/PLAN-orion-mvp.md` | 12-phase implementation timeline |
| **Tracker** | `thoughts/TRACKER.md` | Current progress |

### Architecture

| Document | Path | Purpose |
|----------|------|---------|
| **Architecture** | `docs/ARCHITECTURE.md` | System overview |
| **Database Design** | `thoughts/research/database-schema-design.md` | SQLite + Supabase schema |
| **API Layer** | `thoughts/research/api-layer-architecture.md` | API design |
| **Streaming** | `thoughts/research/streaming-architecture.md` | Real-time architecture |

### Research

| Document | Path | Purpose |
|----------|------|---------|
| **CC v3 Summary** | `thoughts/research/CONTINUOUS-CLAUDE-V3-RESEARCH-SUMMARY.md` | Framework analysis |
| **Orion Design** | `thoughts/research/ORION-DESIGN-CONSOLIDATED.md` | Canonical design decisions |
| **A2UI Protocol** | `thoughts/research/A2UI-deep-dive.md` | Agent-to-UI protocol |
| **Canvas** | `thoughts/research/canvas-architecture.md` | TipTap + Polotno |

---

## Agents

### Orion-Specific

| Agent | Purpose |
|-------|---------|
| `butler` | Primary orchestrator - PARA-based life management |
| `triage` | Inbox processor - scoring, actions, filing |

### Development

| Agent | Purpose |
|-------|---------|
| `kraken` | TDD implementation |
| `spark` | Quick fixes |
| `architect` | Feature planning |
| `phoenix` | Refactoring |

### Research

| Agent | Purpose |
|-------|---------|
| `scout` | Codebase exploration |
| `oracle` | External research |
| `pathfinder` | External repo analysis |

### Quality

| Agent | Purpose |
|-------|---------|
| `arbiter` | Unit/integration tests |
| `atlas` | E2E tests |
| `validate-agent` | Plan validation |
| `aegis` | Security analysis |

---

## Skills (Key Categories)

| Category | Examples |
|----------|----------|
| **Workflows** | build, fix, refactor, test, commit |
| **Research** | explore, research, recall |
| **Memory** | remember, recall, recall-reasoning |
| **Documentation** | create_handoff, continuity_ledger |
| **Orion** | inbox-process |
| **Tools** | tldr-code, ast-grep-find, github-search |

---

## Hooks (Key Categories)

| Category | Examples |
|----------|----------|
| **Session** | session-start-continuity, session-register |
| **Tool Use** | pre-tool-use-broadcast, path-rules |
| **Edit** | post-edit-diagnostics, compiler-in-the-loop |
| **Memory** | memory-awareness, pre-compact-continuity |
| **Skills** | skill-activation-prompt |

---

## Database Schema

### OPC Tables (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `agents` | Agent tracking, status, observability |
| `blackboard` | Inter-agent messaging |
| `sandbox_computations` | Shared state |
| `spawn_queue` | Agent spawn queue (DAG) |
| `archival_memory` | Long-term memory with embeddings |

### Orion Tables (Planned - SQLite + Supabase)

| Table | Purpose |
|-------|---------|
| `inbox_items` | Unified inbox |
| `tasks` | Extracted tasks |
| `projects` | PARA projects |
| `areas` | PARA areas |
| `contacts` | People database |
| `preferences` | User preferences |

---

## Quick Start

### For Continuous Claude

```bash
# Start infrastructure
cd opc && docker compose up -d

# Run Claude
claude
```

### For Orion Development

See `thoughts/shared/plans/PLAN-orion-mvp.md` for the 12-phase implementation plan.

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-14 | SQLite + Supabase | Local-first with cloud sync |
| 2026-01-14 | Stripe payments in MVP | USD + USDC support |
| 2026-01-13 | Tauri 2.0 over Electron | Smaller bundle, Rust backend |
| 2026-01-14 | A2UI for inline interactions | Agent-generated UI in chat |

---

## Navigation

- **Product Vision**: `docs/PRD-orion-personal-butler.md`
- **Technical Details**: `docs/TECH-SPEC-orion-personal-butler.md`
- **Current Progress**: `thoughts/TRACKER.md`
- **Research Index**: `thoughts/INDEX.md`
- **Plans**: `thoughts/shared/plans/`

---

*Generated by BMAD Document Project Workflow*
