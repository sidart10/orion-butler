# Orion MVP - Master Tracker

**Created:** 2026-01-14
**Purpose:** Single source of truth for what's in MVP, what phase, and where it's documented

---

## Architecture Decisions (CANONICAL)

| Decision | Choice | Source Document |
|----------|--------|-----------------|
| **Desktop Shell** | Tauri 2.0 + Next.js | `ORION-DESIGN-CONSOLIDATED.md` |
| **Local Database** | SQLite (embedded, zero-config) | `database-schema-design.md` |
| **Cloud Database** | Supabase PostgreSQL (sync + backup) | User decision 2026-01-14 |
| **Auth** | Supabase Auth (OAuth) | User decision 2026-01-14 |
| **Data Strategy** | Local-first + cloud sync | User decision 2026-01-14 |
| **Payments** | Stripe (USD + USDC) - IN MVP | User decision 2026-01-14 |
| **Canvas Approach** | A2UI for inline chat + Canvas for editing | `A2UI-deep-dive.md`, `canvas-architecture.md` |
| **Rich Text Editor** | TipTap | `ORION-DESIGN-CONSOLIDATED.md` |
| **Visual Editor** | Polotno - IN MVP (Phase 12) | `PLAN-polotno-claude-agent-integration.md` |
| **Tool Integration** | Composio MCP | `composio-deep-dive.md` |
| **Embeddings** | BGE (bge-large-en-v1.5, 1024-dim) | `ORION-DESIGN-CONSOLIDATED.md` |
| **Streaming** | IPC event streaming + XState | `streaming-architecture.md` |
| **Agent Framework** | Claude Agent SDK | `claude-agent-sdk-deep-dive.md` |
| **API Key Strategy** | Proxy through backend (you control access) | User decision 2026-01-14 |

### Data Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│              User's Mac (Tauri App)                 │
│  ┌──────────────┐    ┌────────────────────────────┐ │
│  │   SQLite     │    │   Tauri Frontend (Next.js) │ │
│  │  (primary)   │    │   • Chat UI                │ │
│  │              │    │   • Canvas views           │ │
│  │ • contacts   │    │   • Settings               │ │
│  │ • tasks      │    └─────────────┬──────────────┘ │
│  │ • inbox      │                  │                │
│  │ • projects   │                  │ HTTP/WebSocket │
│  │ • messages   │                  ▼                │
│  │ • embeddings │    ┌────────────────────────────┐ │
│  └──────┬───────┘    │   Tauri Backend (Rust)     │ │
│         │            │   • SQLite access          │ │
│         │            │   • IPC handlers           │ │
│         │            └─────────────┬──────────────┘ │
│         │                          │                │
│         │ background sync          │ API calls      │
└─────────┼──────────────────────────┼────────────────┘
          │                          │
          ▼                          ▼
┌─────────────────────────────────────────────────────┐
│              Your Backend (Supabase Edge Functions) │
│  ┌─────────────────────────────────────────────────┐│
│  │ Claude Proxy Endpoint                           ││
│  │  • Receives requests from Tauri app            ││
│  │  • Adds your ANTHROPIC_API_KEY                 ││
│  │  • Streams response back to client             ││
│  │  • Rate limiting per user                      ││
│  │  • Usage tracking for billing                  ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Supabase Core                                   ││
│  │  • Auth (Google/Apple OAuth)                   ││
│  │  • PostgreSQL (synced data, user preferences)  ││
│  │  • Stripe webhook receiver                     ││
│  │  • Composio connection storage                 ││
│  └─────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              External Services                      │
│  • Anthropic API (Claude)                          │
│  • Composio (Gmail, Calendar, Slack tools)         │
│  • Stripe (payments)                               │
└─────────────────────────────────────────────────────┘
```

### User Experience (Zero Config)

1. Download `Orion.dmg`
2. Drag to Applications
3. Open → Sign in with Google/Apple (Supabase Auth)
4. Connect Gmail/Calendar (OAuth popup)
5. Use the app

- No Docker
- No database setup
- No API keys for end users (bundled or via your backend)
- SQLite created automatically in `~/Library/Application Support/Orion/`
- Works offline, syncs when online

---

## Documents Status

### CANONICAL (Source of Truth)
| Document | Purpose | Status |
|----------|---------|--------|
| `ORION-DESIGN-CONSOLIDATED.md` | All design decisions | Active |
| `database-schema-design.md` | SQLite + PostgreSQL schema | **NEEDS UPDATE**: Change to Supabase |
| `orion-ux-deep-dive.md` | UX patterns, wireframes | Active |
| `A2UI-deep-dive.md` | A2UI protocol for inline chat components | Active |
| `canvas-architecture.md` | Canvas panel system (TipTap/Polotno) | Active |
| `composio-deep-dive.md` | Tool integration guide | Active |
| `streaming-architecture.md` | Claude SDK streaming | Active |
| `PLAN-orion-mvp.md` | Phase timeline | Active |

### DEPRECATED (Archived 2026-01-14)
| Document | Reason | Status |
|----------|--------|--------|
| `electron-mac-app-plan.md` | Superseded by Tauri | ✓ Moved to `thoughts/archive/` |
| `gcp-production-stack.md` | Post-MVP scope | ✓ Moved to `thoughts/shared/plans/production/` |

### UPDATED (2026-01-14)
| Document | Change Made |
|----------|-------------|
| `PLAN-orion-ui-implementation.md` | Updated tech stack to Tauri desktop |
| `database-schema-design.md` | Added Supabase cloud schema + sync tables |
| `PRD-orion-personal-butler.md` | Added Section 2.5 Monetization (Stripe USD+USDC) |
| `PLAN-orion-mvp.md` | Phase 2: Added Supabase Auth. Phase 9: Added Stripe billing |

---

## Phase → Feature Mapping

### Phase 0: Project Setup (Week 1)
| Feature | Document | Status |
|---------|----------|--------|
| Tauri + Next.js scaffold | `PLAN-orion-mvp.md` | Planned |
| Shell permissions | `CHECKLIST-phase-0-kickoff.md` | Planned |
| shadcn/ui setup | `CHECKLIST-phase-0-kickoff.md` | Planned |
| Basic routing | `CHECKLIST-phase-0-kickoff.md` | Planned |

### Phase 1: Core UI Shell (Week 2-3)
| Feature | Document | Status |
|---------|----------|--------|
| Split-screen layout | `PLAN-orion-mvp.md`, `orion-ux-deep-dive.md` | Planned |
| Chat panel | `orion-ux-deep-dive.md` | Planned |
| Canvas panel (modes) | `orion-ux-deep-dive.md` | Planned |
| Sidebar navigation | `PLAN-orion-ui-implementation.md` | Planned |
| Keyboard shortcuts | `orion-ux-deep-dive.md` | Planned |

### Phase 2: Database & Auth (Week 3-4)
| Feature | Document | Status |
|---------|----------|--------|
| Supabase project setup | **NEW** - needs doc | Planned |
| Supabase Auth | **NEW** - needs doc | Planned |
| Core tables (contacts, tasks, inbox, projects) | `database-schema-design.md` | Planned |
| Embeddings storage (pgvector) | `database-schema-design.md` | Planned |

### Phase 3: Agent Integration (Week 4-5)
| Feature | Document | Status |
|---------|----------|--------|
| Claude CLI spawn via Tauri | `PLAN-orion-mvp.md` | Planned |
| Streaming response display | `streaming-architecture.md` | Planned |
| Tool call visualization | `orion-ux-deep-dive.md` | Planned |
| Context injection | `PLAN-orion-mvp.md` | Planned |

### Phase 4: Composio Tools (Week 5-6)
| Feature | Document | Status |
|---------|----------|--------|
| Gmail integration | `composio-deep-dive.md` | Planned |
| Google Calendar integration | `composio-deep-dive.md` | Planned |
| Slack integration | `composio-deep-dive.md` | Planned |
| OAuth connection UI | `PLAN-orion-mvp.md` | Planned |
| Rate limiting | `PLAN-orion-mvp.md` | Planned |

### Phase 5: Orion Agents (Week 6-7)
| Feature | Document | Status |
|---------|----------|--------|
| Butler agent | `ORION-DESIGN-CONSOLIDATED.md`, `.claude/agents/butler.md` | Draft exists |
| Triage agent | `ORION-DESIGN-CONSOLIDATED.md`, `.claude/agents/triage.md` | Draft exists |
| Scheduler agent | `PLAN-orion-mvp.md` | Planned |
| Communicator agent | `PLAN-orion-mvp.md` | Planned |
| Agent routing | `PLAN-orion-mvp.md` | Planned |

### Phase 6: A2UI & Canvas (Week 7-8)
| Feature | Document | Status |
|---------|----------|--------|
| A2UI types & renderer | `A2UI-deep-dive.md` | Planned |
| A2UI custom components | `A2UI-deep-dive.md` (EmailPreview, MeetingScheduler, ContactCard) | Planned |
| Email composer (TipTap) | `PLAN-tiptap-claude-agent-integration.md`, `canvas-architecture.md` | Planned |
| Calendar view | `canvas-architecture.md` | Planned |
| Meeting scheduler | `A2UI-deep-dive.md` (inline picker) | Planned |
| Task list | `A2UI-deep-dive.md` (inline) | Planned |

### Phase 7: Inbox & Triage (Week 8-9)
| Feature | Document | Status |
|---------|----------|--------|
| Unified inbox | `PLAN-orion-mvp.md` | Planned |
| Priority scoring | `ORION-DESIGN-CONSOLIDATED.md` | Planned |
| Action extraction | `.claude/skills/inbox-process/SKILL.md` | Draft exists |
| Filing suggestions | `ORION-DESIGN-CONSOLIDATED.md` | Planned |

### Phase 8: PARA Structure (Week 9-10)
| Feature | Document | Status |
|---------|----------|--------|
| Projects UI | `PLAN-orion-mvp.md` | Planned |
| Areas UI | `PLAN-orion-mvp.md` | Planned |
| Resources/Contacts | `PLAN-orion-mvp.md` | Planned |
| File browser | `orion-ux-deep-dive.md` | Planned |

### Phase 9: Onboarding & Settings (Week 10-11)
| Feature | Document | Status |
|---------|----------|--------|
| Onboarding wizard | `orion-ux-deep-dive.md` | Planned |
| API key setup | `PLAN-orion-mvp.md` | Planned |
| Tool connections | `PLAN-orion-mvp.md` | Planned |
| Preferences | `PLAN-orion-mvp.md` | Planned |
| **Stripe integration** | **NEW** | Planned |
| **USDC payments** | **NEW** | Planned |

### Phase 10: Memory & Context (Week 11)
| Feature | Document | Status |
|---------|----------|--------|
| BGE embedding generation | `ORION-DESIGN-CONSOLIDATED.md` | Planned |
| Semantic recall | `database-schema-design.md` | Planned |
| Context assembly | `PLAN-orion-mvp.md` | Planned |
| Preference learning | `ORION-DESIGN-CONSOLIDATED.md` | Planned |

### Phase 11: Polish & Testing (Week 12)
| Feature | Document | Status |
|---------|----------|--------|
| Error handling | `PLAN-orion-mvp.md` | Planned |
| E2E tests | `PLAN-orion-e2e-tests.md` | Planned |
| Performance optimization | `PLAN-orion-mvp.md` | Planned |
| DMG packaging | `PLAN-orion-mvp.md` | Planned |

### Phase 12: Polotno Visual Editor (Week 13-14)
| Feature | Document | Status |
|---------|----------|--------|
| Polotno SDK setup | `PLAN-polotno-claude-agent-integration.md` | Planned |
| PolotnoStoreManager bridge | `PLAN-polotno-claude-agent-integration.md` | Planned |
| Design canvas mode | `PLAN-polotno-claude-agent-integration.md` | Planned |
| Agent tools (polotno_*) | `PLAN-polotno-claude-agent-integration.md` | Planned |
| Design-assistant agent | `.claude/agents/design-assistant.md` | Planned |
| Template library | `PLAN-polotno-claude-agent-integration.md` | Planned |
| Cloud Render integration | `PLAN-polotno-claude-agent-integration.md` | Planned |
| Export formats (PNG, PDF, MP4) | `PLAN-polotno-claude-agent-integration.md` | Planned |

---

## MVP Scope Summary

### IN MVP (14 weeks)
- Tauri desktop app (macOS)
- Chat + Canvas split-screen UI
- Gmail, Calendar, Slack via Composio
- Butler, Triage, Scheduler, Communicator agents
- TipTap rich text editor
- **Polotno visual editor** (social posts, graphics, slides)
- PARA organization (Projects, Areas, Resources, Archive)
- Semantic memory with BGE embeddings
- Supabase database + Auth
- Stripe payments (USD + USDC)
- Onboarding flow
- Basic E2E tests

### POST-MVP (v1.1+)
- Voice input
- Mobile app (Tauri mobile)
- Windows/Linux support
- Team/multi-user features
- Custom AI model training

### EXPLICITLY NOT BUILDING
- Web version
- Multi-user/team features (MVP)
- Payment subscription tiers beyond basic (MVP)

---

## Conflicts Resolved

| Conflict | Resolution | Date |
|----------|------------|------|
| Desktop framework (Tauri vs Electron) | **Tauri** | 2026-01-13 |
| Database (SQLite vs Supabase) | **Both** - SQLite local + Supabase sync | 2026-01-14 |
| Auth | **Supabase Auth** (OAuth) | 2026-01-14 |
| Offline support | **Yes** - Local-first architecture | 2026-01-14 |
| Payments (in vs out of MVP) | **IN MVP** (Stripe USD+USDC) | 2026-01-14 |
| Canvas (A2UI vs custom) | **A2UI inline + Canvas editing** | 2026-01-14 |
| Visual editor (Polotno) | **IN MVP** (Phase 12) | 2026-01-14 |
| User setup required | **None** - zero config for end users | 2026-01-14 |
| Claude API key | **Proxy through backend** - you control access/billing | 2026-01-14 |

---

## Document Cross-Reference

| Feature | PRD Section | Tech Spec | Research Doc | Plan |
|---------|-------------|-----------|--------------|------|
| Chat UI | 7.2.1 | - | `orion-ux-deep-dive.md` | `PLAN-orion-mvp.md` Phase 1 |
| Inbox Triage | 4.4, 5.1.4 | - | `ORION-DESIGN-CONSOLIDATED.md` | Phase 7 |
| PARA | 4.1-4.4 | - | `PARA-DEEP-DIVE-SYNTHESIS.md` | Phase 8 |
| Tool Integration | 5.1.7 | - | `composio-deep-dive.md` | Phase 4 |
| Agents | 5.2 | - | `agents-analysis.md` | Phase 5 |
| Database | 6.3 | 4.1 | `database-schema-design.md` | Phase 2 |
| Memory | 5.1.9 | - | `ORION-DESIGN-CONSOLIDATED.md` | Phase 10 |
| TipTap Editor | - | - | `PLAN-tiptap-claude-agent-integration.md` | Phase 6 |
| Polotno Visual | - | - | `PLAN-polotno-claude-agent-integration.md` | Phase 12 |

---

## Action Items

### Immediate (Before Phase 0) ✓ COMPLETED 2026-01-14
- [x] Archive `electron-mac-app-plan.md` to `thoughts/archive/`
- [x] Move `gcp-production-stack.md` to `thoughts/shared/plans/production/`
- [x] Add Supabase sync layer section to `database-schema-design.md`
- [x] Add Supabase Auth section to `PLAN-orion-mvp.md` Phase 2
- [x] Add Stripe/USDC payment section to `PLAN-orion-mvp.md` Phase 9
- [x] Update `PRD-orion-personal-butler.md` Section 2.5 (payments in scope)
- [x] Update `PLAN-orion-ui-implementation.md` to align with Tauri desktop

### During Implementation (Phase 0+)
- [ ] Create Supabase project and document connection details
- [ ] Set up Stripe account and document API keys location
- [ ] Research USDC payment flow (Stripe Crypto On-Ramp)
- [ ] Sync conflict resolution: Using last-write-wins with timestamp comparison

---

## Quick Navigation

| Need | Go To |
|------|-------|
| UX patterns/wireframes | `thoughts/research/orion-ux-deep-dive.md` |
| Database schema | `thoughts/research/database-schema-design.md` |
| Agent design | `thoughts/research/ORION-DESIGN-CONSOLIDATED.md` |
| Tool integration | `thoughts/research/composio-deep-dive.md` |
| Phase checklist | `thoughts/shared/plans/CHECKLIST-phase-0-kickoff.md` |
| Full MVP timeline | `thoughts/shared/plans/PLAN-orion-mvp.md` |
