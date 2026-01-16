# Orion Documentation Index

**Last Updated:** 2026-01-14

---

## Quick Links

| Topic | Document |
|-------|----------|
| **⭐ PRD** | [Product Requirements Document](../docs/PRD-orion-personal-butler.md) |
| **⭐ Tech Spec** | [Technical Specification](../docs/TECH-SPEC-orion-personal-butler.md) |
| **⭐ MVP Tracker** | [TRACKER.md](TRACKER.md) |
| **Architecture Overview** | [Orion Design Consolidated](research/ORION-DESIGN-CONSOLIDATED.md) |
| **Database Design** | [Database Schema](research/database-schema-design.md) |

---

## Formal Documentation (`docs/`)

| Document | Lines | Purpose |
|----------|-------|---------|
| [PRD-orion-personal-butler.md](../docs/PRD-orion-personal-butler.md) | 1,237 | Product requirements, user stories, features, metrics |
| [TECH-SPEC-orion-personal-butler.md](../docs/TECH-SPEC-orion-personal-butler.md) | 3,499 | Technical architecture, schemas, APIs, implementation details |

---

## Research Documents (`thoughts/research/`)

### Continuous Claude v3 Analysis

| Document | Purpose |
|----------|---------|
| [CONTINUOUS-CLAUDE-V3-RESEARCH-SUMMARY.md](research/CONTINUOUS-CLAUDE-V3-RESEARCH-SUMMARY.md) | **Master summary** of CC v3 architecture, hooks, memory, and backend decisions |
| [hooks-analysis.md](research/hooks-analysis.md) | Deep dive into 30 hooks |
| [agents-analysis.md](research/agents-analysis.md) | Analysis of 32 agents |
| [skills-analysis.md](research/skills-analysis.md) | Analysis of 109 skills |
| [claude-agent-sdk-deep-dive.md](research/claude-agent-sdk-deep-dive.md) | Claude SDK architecture |

### Orion Design

| Document | Purpose |
|----------|---------|
| [ORION-MASTER-RESEARCH.md](research/ORION-MASTER-RESEARCH.md) | Original Orion research |
| [ORION-DESIGN-CONSOLIDATED.md](research/ORION-DESIGN-CONSOLIDATED.md) | Consolidated design decisions |
| [orion-ui-design.md](research/orion-ui-design.md) | UI/UX design |
| [orion-ux-deep-dive.md](research/orion-ux-deep-dive.md) | UX deep dive |

### Architecture

| Document | Purpose |
|----------|---------|
| [database-schema-design.md](research/database-schema-design.md) | Database schema |
| [api-layer-architecture.md](research/api-layer-architecture.md) | API design |
| [streaming-architecture.md](research/streaming-architecture.md) | Streaming/realtime |
| [background-jobs-architecture.md](research/background-jobs-architecture.md) | Background tasks |
| [observability-architecture.md](research/observability-architecture.md) | Logging/monitoring |

### Integrations

| Document | Purpose |
|----------|---------|
| [composio-deep-dive.md](research/composio-deep-dive.md) | Composio integration |
| [composio-claude-sdk-architecture.md](research/composio-claude-sdk-architecture.md) | SDK architecture |
| [tool-integration-inventory.md](research/tool-integration-inventory.md) | Available tools |

### UI & Canvas

| Document | Purpose |
|----------|---------|
| [A2UI-deep-dive.md](research/A2UI-deep-dive.md) | **A2UI Protocol** - Agent-to-UI for inline chat components |
| [canvas-architecture.md](research/canvas-architecture.md) | Canvas panel system (TipTap, Polotno) |
| [orion-visual-design-system.md](research/orion-visual-design-system.md) | Visual design system |

### Other

| Document | Purpose |
|----------|---------|
| [PARA-DEEP-DIVE-SYNTHESIS.md](research/PARA-DEEP-DIVE-SYNTHESIS.md) | PARA methodology |
| [para-system-design.md](research/para-system-design.md) | PARA system design |
| [credentials-and-accounts-design.md](research/credentials-and-accounts-design.md) | Auth design |

---

## Plans (`thoughts/shared/plans/`)

### Active Plans

| Plan | Status | Purpose |
|------|--------|---------|
| [PLAN-orion-mvp.md](shared/plans/PLAN-orion-mvp.md) | ✅ **Active** | Master MVP timeline (12 phases) |
| [CHECKLIST-phase-0-kickoff.md](shared/plans/CHECKLIST-phase-0-kickoff.md) | ✅ **Active** | Phase 0 checklist |
| [PLAN-orion-database-schema.md](shared/plans/PLAN-orion-database-schema.md) | ✅ **Active** | Database implementation plan |

### Feature Plans

| Plan | Status | Purpose |
|------|--------|---------|
| [PLAN-orion-mvp-harness.md](shared/plans/PLAN-orion-mvp-harness.md) | 📋 Planned | MVP test harness |
| [PLAN-orion-ui-implementation.md](shared/plans/PLAN-orion-ui-implementation.md) | 📋 Planned | UI implementation (Tauri + Next.js) |
| [PLAN-tiptap-claude-agent-integration.md](shared/plans/PLAN-tiptap-claude-agent-integration.md) | 📋 Planned | TipTap rich text editor |
| [PLAN-composio-integration-deep-research.md](shared/plans/PLAN-composio-integration-deep-research.md) | 📋 Planned | Composio integration |

### Archived Plans

| Plan | Reason |
|------|--------|
| [electron-mac-app-plan.md](archive/electron-mac-app-plan.md) | Superseded by Tauri |

---

## Key Decisions Log

| Date | Decision | Rationale | Document |
|------|----------|-----------|----------|
| 2026-01-14 | SQLite + Supabase | Local-first with cloud sync | [TRACKER.md](TRACKER.md) |
| 2026-01-14 | Supabase Auth | OAuth via Google/Apple | [TRACKER.md](TRACKER.md) |
| 2026-01-14 | Stripe payments in MVP | USD + USDC support | [TRACKER.md](TRACKER.md) |
| 2026-01-14 | Claude API proxied through backend | User doesn't need API key | [TRACKER.md](TRACKER.md) |
| 2026-01-13 | PRD & Tech Spec finalized | Comprehensive docs for implementation | [PRD](../docs/PRD-orion-personal-butler.md) |
| 2026-01-13 | Tauri 2.0 over Electron | Smaller bundle, better security, Rust backend | [TRACKER.md](TRACKER.md) |
| 2026-01-14 | A2UI for inline interactions | Agent-generated UI for forms, pickers, confirmations in chat | [A2UI-deep-dive.md](research/A2UI-deep-dive.md) |
| 2026-01-13 | Canvas for immersive editing | TipTap/Polotno for docs/designs requiring focus | [canvas-architecture.md](research/canvas-architecture.md) |

---

## Next Steps

See [TRACKER.md](TRACKER.md) for detailed phase tracking.

### Completed
- [x] Create PRD document
- [x] Create Technical Specification
- [x] Run `/premortem` on PRD and Tech Spec
- [x] Architecture decisions finalized (Tauri, SQLite+Supabase, Stripe)
- [x] Archive deprecated plans (Electron, GCP)

### Up Next (Phase 0)
- [ ] Create Supabase project
- [ ] Set up Stripe account
- [ ] Tauri + Next.js scaffold
- [ ] Shell permissions setup

---

## File Locations

```
2026-01-orion-personal-butler/
├── docs/                              # ⭐ Formal documentation
│   ├── PRD-orion-personal-butler.md   # Product requirements
│   └── TECH-SPEC-orion-personal-butler.md  # Technical specification
│
├── thoughts/
│   ├── INDEX.md                       # This file
│   ├── TRACKER.md                     # ⭐ MVP master tracker
│   ├── research/                      # Research & analysis
│   │   ├── ORION-DESIGN-CONSOLIDATED.md  # Canonical design decisions
│   │   ├── database-schema-design.md     # SQLite + Supabase schema
│   │   ├── orion-ux-deep-dive.md         # UX patterns
│   │   └── ... (20+ research docs)
│   ├── shared/plans/                  # Implementation plans
│   │   ├── PLAN-orion-mvp.md          # Master MVP timeline
│   │   ├── CHECKLIST-phase-0-kickoff.md
│   │   └── ... (10+ plans)
│   ├── handoffs/                      # Session handoffs
│   │   ├── orion-mvp/
│   │   └── polotno-integration/
│   └── archive/                       # Deprecated docs
│       └── electron-mac-app-plan.md
│
└── orion/                             # PARA file structure (future)
    ├── projects/
    ├── areas/
    ├── resources/
    ├── archive/
    └── inbox/
```
