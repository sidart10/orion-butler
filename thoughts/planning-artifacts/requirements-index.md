# Requirements Documentation Index

**Project:** Orion Personal Butler  
**Date:** 2026-01-20  
**Status:** Requirements extracted from PRD v2-draft

---

## Document Structure

```
planning-artifacts/
├── prd-v2-draft.md                          # Source PRD (3,034 lines)
├── functional-requirements-extracted.md      # 94 FRs across 10 domains (363 lines)
├── nfr-extracted-from-prd-v2.md             # Non-functional requirements
├── fr-extraction-summary.md                  # Extraction stats & methodology (8KB)
├── fr-quick-reference.md                     # Quick lookup table (6KB)
└── requirements-index.md                     # This file
```

---

## Quick Navigation

### For Product Managers
- **PRD Source:** [prd-v2-draft.md](prd-v2-draft.md) - Complete product vision
- **User Journeys:** PRD §3 (UJ-1 through UJ-10)
- **Success Metrics:** PRD §9
- **Traceability:** [fr-extraction-summary.md](fr-extraction-summary.md)

### For Developers
- **All Functional Requirements:** [functional-requirements-extracted.md](functional-requirements-extracted.md)
- **Quick FR Lookup:** [fr-quick-reference.md](fr-quick-reference.md)
- **Implementation Phases:** PRD §10 + FR Quick Reference priority sections
- **Technical Stack:** PRD §7.3, §9.1

### For QA/Test Engineers
- **Test Criteria:** Each FR in [functional-requirements-extracted.md](functional-requirements-extracted.md)
- **Performance Targets:** FR Quick Reference performance table
- **Gate Criteria:** FR Quick Reference testability checklist
- **Non-Functional Requirements:** [nfr-extracted-from-prd-v2.md](nfr-extracted-from-prd-v2.md)

### For Designers
- **UX Requirements:** PRD §8 (UX/UI Requirements)
- **UI Capabilities:** FR-6 (GTD Interface), FR-8 (Canvas System)
- **User Flows:** PRD §3 (User Journeys)
- **Design Language:** PRD §8.9

---

## Requirements Summary

| Category | Count | Document |
|----------|-------|----------|
| **Functional Requirements** | 94 | [functional-requirements-extracted.md](functional-requirements-extracted.md) |
| **Non-Functional Requirements** | TBD | [nfr-extracted-from-prd-v2.md](nfr-extracted-from-prd-v2.md) |
| **User Journeys** | 10 | PRD §3 |
| **PRD Sections** | 10 | [prd-v2-draft.md](prd-v2-draft.md) |
| **Implementation Phases** | 4 | PRD §9 |

---

## FR Domains (10)

| Domain | FRs | Key Capabilities | Priority |
|--------|-----|------------------|----------|
| **FR-1: Harness Core** | 8 | SDK wrapper, streaming, tools | P0 |
| **FR-2: Session Management** | 7 | Sessions, resumption, forking | P0 |
| **FR-3: Extension System** | 14 | Skills, agents, hooks, plugins | P0 + P1 |
| **FR-4: MCP Integration** | 8 | Composio, Gmail, Calendar | P0 |
| **FR-5: PARA Filesystem** | 8 | Auto-organization, structure | P1 |
| **FR-6: GTD Interface** | 10 | Inbox, Next, Projects, Waiting | P1 |
| **FR-7: Permission System** | 9 | Modes, rules, audit | P1 + P2 |
| **FR-8: Canvas System** | 10 | Inline rich UI, contextual | P2 |
| **FR-9: Butler Plugin** | 14 | Reference implementation | P1 + P2 |
| **FR-10: Infrastructure** | 12 | Desktop, performance, security | P0 + P2 |

---

## Implementation Timeline

### Phase 0: Foundation (Week 0)
**Goal:** Desktop shell with basic chat UI  
**FRs:** None yet (pre-agent work)  
**Deliverables:** Tauri app, Next.js, basic layout

### Phase 1: Harness Core (Week 1) - 30 FRs
**Goal:** SDK + Composio + Skills/Hooks working  
**FRs:** FR-1 (8), FR-2 (7), FR-3 (partial - 7), FR-4 (6), FR-10 (partial - 2)  
**Gate:** Can converse, use commands, access Gmail/Calendar

### Phase 2: Orchestration (Month 1) - 32 FRs
**Goal:** PARA orchestration invisible to user  
**FRs:** FR-5 (8), FR-6 (10), FR-3 (remaining - 7), FR-7 (5), FR-9 (partial - 2)  
**Gate:** User captures anything, agent routes correctly 80%+

### Phase 3: Canvas & Polish (Month 3) - 32 FRs
**Goal:** Rich inline UI, shareable plugin  
**FRs:** FR-8 (10), FR-7 (remaining - 4), FR-9 (remaining - 12), FR-10 (remaining - 6)  
**Gate:** Canvas spawns contextually, plugin installable

---

## User Journey Coverage

| Journey | FRs | Priority | Status |
|---------|-----|----------|--------|
| UJ-1: Morning Briefing | FR-9.1, FR-9.6, FR-9.7 | P1/P2 | 🔴 Not Started |
| UJ-2: Inbox Triage | FR-9.2, FR-9.6, FR-4.3, FR-5.4 | P1/P2 | 🔴 Not Started |
| UJ-3: Schedule Meeting | FR-9.3, FR-9.7, FR-4.4, FR-8.2 | P2 | 🔴 Not Started |
| UJ-4: Draft Communication | FR-9.4, FR-9.8, FR-8.3 | P2 | 🔴 Not Started |
| UJ-5: Capture & Organize | FR-6.6, FR-6.7, FR-5.4 | P1 | 🔴 Not Started |
| UJ-6: Weekly Review | FR-9.5, FR-6.1-6.5 | P2 | 🔴 Not Started |
| UJ-7: Create Custom Skill | FR-3.1-3.3 | P0 | 🔴 Not Started |
| UJ-8: Create Custom Agent | FR-3.4-3.6 | P1 | 🔴 Not Started |
| UJ-9: Build Meta-Skill | FR-3.1, FR-3.5, FR-9.x | P2 | 🔴 Not Started |
| UJ-10: Package Plugin | FR-3.11-3.14, FR-9.14 | P2 | 🔴 Not Started |

---

## Traceability

### PRD Section → FRs

| PRD Section | Maps To FRs | Coverage |
|-------------|-------------|----------|
| §1 Executive Summary | Vision context | ✅ |
| §2 Product Overview | FR-1, FR-3, FR-5, FR-6 | ✅ |
| §3 User Journeys | All FR domains | ✅ |
| §4 Harness Architecture | FR-1, FR-2, FR-4, FR-5 | ✅ |
| §5 Extension Points | FR-3, FR-9 | ✅ |
| §6 Butler Plugin | FR-9 | ✅ |
| §7 Technical Requirements | FR-1, FR-4, FR-7, FR-10 | ✅ |
| §8 UX/UI Requirements | FR-6, FR-8, FR-10 | ✅ |
| §9 Success Metrics | Test criteria | ✅ |
| §10 Implementation Phases | Priority mapping | ✅ |

### FRs → Test Criteria

All 94 FRs have:
- ✅ Test criteria defined
- ✅ PRD traceability (§ sections)
- ✅ User Journey traceability (UJ-X)
- ✅ Observable/measurable conditions

---

## Performance Targets (Quick Reference)

| FR | Metric | Target | Priority |
|----|--------|--------|----------|
| FR-1.3 | First token latency | <500ms (p95) | P0 |
| FR-2.6 | Session resume | <1s | P0 |
| FR-3.9 | Hook execution | <50ms per hook | P0 |
| FR-4.6 | MCP tool calls | <2s (p95) | P0 |
| FR-6.6 | New inbox capture | <2s | P1 |
| FR-10.2 | App launch | <3s to interactive | P0 |
| FR-10.3 | Memory usage | <500MB typical | P0 |
| FR-10.11 | Skill loading | <100ms per skill | P0 |
| FR-10.12 | Error rate | <1% interactions | P0 |

---

## Next Actions by Role

### Product Manager
1. Review [prd-v2-draft.md](prd-v2-draft.md) for completeness
2. Validate User Journeys (§3) map to real use cases
3. Confirm success metrics (§9) align with business goals
4. Review [fr-extraction-summary.md](fr-extraction-summary.md) for gaps

### Tech Lead / Architect
1. Review [functional-requirements-extracted.md](functional-requirements-extracted.md) for feasibility
2. Validate technical stack (PRD §7.3, §9.1) supports all FR-1 capabilities
3. Assess Phase 1 (P0) FRs for Week 1 sprint sizing
4. Identify technical risks in FR dependencies

### Developer
1. Start with [fr-quick-reference.md](fr-quick-reference.md) for overview
2. Focus on P0 FRs (30) for initial sprint
3. Use PRD §9.4 (Phase 1) for implementation details
4. Reference [functional-requirements-extracted.md](functional-requirements-extracted.md) for test criteria

### QA / Test Engineer
1. Create test plan from 94 FRs in [functional-requirements-extracted.md](functional-requirements-extracted.md)
2. Set up performance monitoring for targets in FR Quick Reference
3. Design acceptance tests for each User Journey (PRD §3)
4. Use gate criteria from FR Quick Reference testability checklist

### Designer
1. Review PRD §8 (UX/UI Requirements) for design language
2. Focus on FR-6 (GTD Interface), FR-8 (Canvas System) for UI specs
3. Create mockups for User Journeys (PRD §3)
4. Validate accessibility against FR-10.8 (WCAG AA)

---

## Document Maintenance

### When to Update

| Trigger | Update Files | Reason |
|---------|-------------|--------|
| PRD changes | All FR docs | Requirements derive from PRD |
| New user journey | FR extraction, summary | New capabilities to capture |
| Architecture change | FR-1, FR-10, summary | Core capabilities affected |
| Feature cut | FR extraction, quick ref | Remove out-of-scope FRs |
| Implementation learnings | Test criteria in FRs | Real-world validation data |

### Version Control

| File | Owner | Review Cadence |
|------|-------|----------------|
| prd-v2-draft.md | Product | Weekly (during planning) |
| functional-requirements-extracted.md | Tech Lead | After PRD changes |
| fr-extraction-summary.md | Tech Lead | After FR extraction |
| fr-quick-reference.md | Engineering | Sprint planning |
| nfr-extracted-from-prd-v2.md | Tech Lead | Monthly |

---

## Questions & Clarifications

### Open Questions (Track Here)

1. [ ] **FR-1.1:** Which exact SDK version? (Stable v1 vs. v2 preview)
2. [ ] **FR-4.2:** Composio tool search mode - is this GA or beta?
3. [ ] **FR-9.8:** Communicator agent - Opus model cost acceptable?
4. [ ] **FR-10.1:** macOS version support - 12 (Monterey) minimum?

### Assumptions Made

1. Claude Agent SDK TypeScript Stable (v1) is production-ready
2. Composio MCP supports "toolSearchMode: auto"
3. Tauri 2.0 + Next.js 15 stack is stable
4. PARA filesystem structure is acceptable for macOS users

---

## Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **Architecture Diagrams** | TBD | System design |
| **API Documentation** | TBD | SDK integration |
| **Design System** | PRD §8.9 reference | UI components |
| **Test Plan** | TBD | QA strategy |
| **Sprint Plan** | TBD | Implementation schedule |

---

**Last Updated:** 2026-01-20  
**Next Review:** Start of Phase 1 (Week 1)

