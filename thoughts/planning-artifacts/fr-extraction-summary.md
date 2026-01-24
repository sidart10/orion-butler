# FR Extraction Summary

**Date:** 2026-01-20  
**Source:** PRD v2-draft (3,034 lines)  
**Output:** functional-requirements-extracted.md (363 lines, 94 FRs)

---

## Extraction Statistics

| Metric | Count |
|--------|-------|
| **Total FRs Extracted** | 94 |
| **FR Domains** | 10 |
| **User Journeys Mapped** | 10 |
| **PRD Sections Analyzed** | 8 |
| **Lines in FR Document** | 363 |

---

## FR Distribution by Domain

| Domain | FR Count | Key Capabilities |
|--------|----------|------------------|
| **FR-1: Harness Core** | 8 | SDK wrapper, streaming, tools, extended thinking, prompt caching |
| **FR-2: Session Management** | 7 | Named sessions, resumption, forking, export, persistence |
| **FR-3: Extension System** | 14 | Skills, agents, hooks, plugins, MCP servers, commands |
| **FR-4: MCP Integration** | 8 | Composio, Gmail, Calendar, tool search mode, OAuth |
| **FR-5: PARA Filesystem** | 8 | Directory structure, metadata, auto-organization, archiving |
| **FR-6: GTD Interface** | 10 | Inbox, Next, Projects, Waiting, Someday views, auto-categorization |
| **FR-7: Permission System** | 9 | Permission modes, auto-rules, prompting, audit trail |
| **FR-8: Canvas System** | 10 | Inline rendering, calendar/email/project/task/approval canvas |
| **FR-9: Butler Plugin** | 14 | Skills (briefing, triage, schedule, email, review), subagents, hooks |
| **FR-10: Infrastructure** | 12 | Desktop app, performance, storage, security, accessibility |

---

## Implementation Priority Distribution

### P0 (Week 1: Harness Foundation) - 30 FRs
- FR-1: Harness Core (8)
- FR-2: Session Management (7)
- FR-3: Extension System (partial - 7)
- FR-4: MCP Integration (6)
- FR-10: Infrastructure (partial - 2)

**Gate:** SDK + Composio + Skills/Hooks working

### P1 (Month 1: Invisible Orchestration) - 32 FRs
- FR-5: PARA Filesystem (8)
- FR-6: GTD Interface (10)
- FR-3: Extension System (remaining - 7)
- FR-7: Permission System (5)
- FR-9: Butler Plugin (partial - 2)

**Gate:** PARA orchestration invisible to user

### P2 (Month 3: Rich Experience) - 32 FRs
- FR-8: Canvas System (10)
- FR-7: Permission System (remaining - 4)
- FR-9: Butler Plugin (remaining - 12)
- FR-10: Infrastructure (remaining - 6)

**Gate:** Canvas + polish + shareable plugin

---

## Traceability Coverage

### User Journeys (10) → FRs

| Journey | FR Coverage | Status |
|---------|-------------|--------|
| UJ-1: Morning Briefing | FR-9.1, FR-9.6, FR-9.7, FR-6.x | ✅ Complete |
| UJ-2: Inbox Triage | FR-9.2, FR-9.6, FR-4.3, FR-5.4, FR-7.2 | ✅ Complete |
| UJ-3: Schedule Meeting | FR-9.3, FR-9.7, FR-4.4, FR-8.2, FR-7.3 | ✅ Complete |
| UJ-4: Draft Communication | FR-9.4, FR-9.8, FR-4.3, FR-8.3, FR-7.3 | ✅ Complete |
| UJ-5: Capture & Organize | FR-6.6, FR-6.7, FR-5.4, FR-5.8, FR-6.10 | ✅ Complete |
| UJ-6: Weekly Review | FR-9.5, FR-6.1-6.5, FR-5.5 | ✅ Complete |
| UJ-7: Create Custom Skill | FR-3.1, FR-3.2, FR-3.3 | ✅ Complete |
| UJ-8: Create Custom Agent | FR-3.4, FR-3.5, FR-3.6 | ✅ Complete |
| UJ-9: Build Meta-Skill | FR-3.1, FR-3.5, FR-9.1-9.5 | ✅ Complete |
| UJ-10: Package Plugin | FR-3.11, FR-3.12, FR-3.13, FR-9.14 | ✅ Complete |

### PRD Sections (8) → FRs

| PRD Section | FRs Extracted | Status |
|-------------|---------------|--------|
| §3 User Journeys | Mapped to all domains | ✅ Complete |
| §4 Harness Architecture | FR-1, FR-2, FR-4, FR-5 | ✅ Complete |
| §5 Extension Points | FR-3, FR-9 | ✅ Complete |
| §6 Butler Plugin | FR-9 | ✅ Complete |
| §7 Technical Requirements | FR-1, FR-4, FR-7, FR-10 | ✅ Complete |
| §8 UX/UI Requirements | FR-6, FR-8, FR-10 | ✅ Complete |
| §9 Success Metrics | Mapped to test criteria | ✅ Complete |
| §10 Implementation Phases | Mapped to priorities | ✅ Complete |

---

## Quality Metrics

### Requirement Format Compliance

| Criterion | Status | Notes |
|-----------|--------|-------|
| **Testable** | ✅ | All FRs have test criteria |
| **Capability-focused** | ✅ | WHAT, not HOW |
| **No implementation leakage** | ✅ | Tech choices in §7, not FRs |
| **Traceable** | ✅ | All FRs trace to PRD sections and UJs |
| **Numbered (FR-X.Y)** | ✅ | BMAD format |
| **Grouped by domain** | ✅ | 10 logical domains |

### Test Criteria Quality

| Type | Count | Example |
|------|-------|---------|
| **Observable** | 94 | "Agent responses appear token-by-token" |
| **Measurable** | 47 | "<500ms first token latency" |
| **Verifiable** | 94 | "All SKILL.md files load without errors" |
| **Acceptance criteria** | 94 | All FRs have clear pass/fail conditions |

---

## Coverage Analysis

### What's Covered

✅ **Harness capabilities** - All SDK features exposed  
✅ **Extension system** - Skills, agents, hooks, MCP, plugins  
✅ **User workflows** - All 10 user journeys mapped  
✅ **Technical constraints** - Performance, security, accessibility  
✅ **Reference implementation** - Butler plugin fully specified  

### What's Explicitly Out of Scope (per PRD §2.6)

❌ Plugin marketplace UI (v1.1)  
❌ Multi-user/team features (v2.0)  
❌ Mobile app (Post-MVP)  
❌ Windows/Linux support (v1.5)  
❌ Custom model training (v2.0)  

### Intentional Gaps (Implementation Details, Not FRs)

- Specific UI component libraries (shadcn/ui) - implementation choice
- Database schema details - evolves with implementation
- Hook script languages (TypeScript/Python) - developer choice
- Exact API endpoints - MCP server implementation
- CSS framework (Tailwind) - styling implementation

---

## FR Format Examples

### Good FR (Capability-focused)
```
FR-9.2: The Butler plugin SHALL provide inbox triage skill

Test Criteria: `/inbox` command processes email, scores priority (0.0-1.0), 
extracts actions, suggests PARA filing

Traces To: §6.2.2, UJ-2
```

### Avoided Anti-Pattern (Implementation-focused)
```
❌ BAD: "The system SHALL use Opus model for email drafting"
✅ GOOD: "The Butler plugin SHALL provide email composition skill" (FR-9.4)
```

---

## Next Steps

### For Implementation Teams

1. **Phase 0 Sprint Planning**: Use P0 FRs (30) for Week 1 sprint
2. **Acceptance Test Design**: Convert test criteria to executable tests
3. **Architecture Validation**: Ensure tech stack supports all FR-1 capabilities
4. **API Research**: Validate Composio SDK capabilities against FR-4 requirements

### For Product/Design

1. **UI Mockups**: Use FR-6 (GTD), FR-8 (Canvas) for design specs
2. **User Flow Validation**: Ensure UJ-1 through UJ-6 map to wireframes
3. **Permission UX**: Design approval cards per FR-7.7, FR-8.6
4. **Accessibility Audit**: Validate design against FR-10.8 (WCAG AA)

### For QA/Test

1. **Test Plan**: Create test cases for each of 94 FRs
2. **Performance Tests**: Set up monitoring for FR-10.2, FR-10.3, FR-2.6, FR-4.6
3. **Integration Tests**: Validate FR-4 (MCP), FR-3 (Extensions) end-to-end
4. **Acceptance Tests**: Map each User Journey to executable scenarios

---

## Document Locations

| File | Path | Purpose |
|------|------|---------|
| **PRD Source** | `prd-v2-draft.md` | Source requirements document (3,034 lines) |
| **FR Extraction** | `functional-requirements-extracted.md` | Formal FRs (363 lines, 94 FRs) |
| **This Summary** | `fr-extraction-summary.md` | Extraction metadata and analysis |

---

## Extraction Methodology

**Approach:**
1. Read PRD in sections (500-line chunks due to token limits)
2. Identify implied capabilities from user journeys, architecture, technical sections
3. Convert to testable FR format: "System SHALL [capability]"
4. Group by logical domain (Harness, Sessions, Extensions, etc.)
5. Add test criteria and traceability
6. Validate completeness against success metrics

**Tools Used:**
- Read tool for PRD sections
- Pattern matching for capability statements
- Cross-referencing with §9 Success Metrics for validation

**Quality Checks:**
- All 10 user journeys traced to FRs ✅
- All 8 PRD sections analyzed ✅
- Each FR has test criteria ✅
- No implementation leakage ✅
- BMAD FR numbering format ✅

---

**Extraction completed successfully.**  
**Total FRs: 94 across 10 domains**  
**Ready for implementation sprint planning.**

