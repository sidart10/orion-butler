# Epic 2 Adversarial Spec Review - Final Report

**Review Date:** 2026-01-16
**Reviewer:** Automated adversarial review via critic agents
**Stories Reviewed:** 20 (Stories 2.1 through 2.19, including 2.2b)
**ATDD Checklists Reviewed:** 19

---

## Executive Summary

### Overall Assessment: ❌ NOT READY FOR IMPLEMENTATION

Epic 2 stories have **significant structural issues** that must be resolved before development begins. The adversarial review found systematic problems across all four batches.

### Issue Totals

| Batch | Stories | Critical | Major | Minor | Total |
|-------|---------|----------|-------|-------|-------|
| A (Core Infrastructure) | 2.1-2.4, 2.2b | 4 | 9 | 9 | 22 |
| B (Agent Definitions) | 2.5-2.9 | 5 | 9 | 4 | 18 |
| C (Skills Infrastructure) | 2.10-2.14 | 6 | 5 | 2 | 13 |
| D (Hooks) | 2.15-2.19 | 3 | 10 | 5 | 18 |
| **Total** | **20** | **18** | **33** | **20** | **71** |

### Top 5 Critical Issues (Implementation Blockers)

1. **Epic promises don't match reality**
   - "31 agents" vs "26 agents" in tests (Story 2.2)
   - "40+ skills" vs 27 skills defined (Stories 2.11-2.14)
   - "34 hooks" vs 20 hooks defined (Stories 2.15-2.19)

2. **Circular dependencies between batches**
   - Skills (Epic 2) depend on Memory system (Epic 10)
   - Skills (Epic 2) depend on Composio (Epic 3)
   - Hooks (Epic 2) depend on database tables not created

3. **Type/constant location inconsistency**
   - AgentName defined in agent-server, needed in frontend
   - Tool names differ between PRD and TOOL_CATALOG
   - HookResult schema varies across stories

4. **Missing database migrations**
   - 7+ tables assumed to exist but not created
   - PostgreSQL vs SQLite confusion
   - FTS5 tables not created in Story 1.4

5. **Incomplete TOOL_CATALOG**
   - Only 16 tools defined, agents need many more
   - create_draft, update_event, send_slack_message missing
   - Tool naming inconsistent (Composio vs internal)

---

## Issues by Category

### A. Epic Promise Mismatches

| Claim | Epic Source | Reality | Gap |
|-------|-------------|---------|-----|
| 31 agents | epics.md:919 | test expects 26 | -5 |
| 40+ skills | epics.md:1150 | 27 defined | -13 |
| 34 hooks | epics.md:968 | 20 defined | -14 |

**Root Cause:** Epic was written with aspirational numbers before stories were detailed.

**Recommendation:** Update epic to match actual story scope.

### B. Dependency Chain Violations

```
Epic 2 (Agent Infrastructure)
  ├── Story 2.8 (Navigator) → Epic 1 SearchService
  ├── Story 2.12 (Workflows) → Epic 3, 4, 5, 6 (stubs)
  ├── Story 2.13 (Memory) → Epic 10 PostgreSQL
  └── Stories 2.16-2.19 (Hooks) → DB tables not created
```

**Root Cause:** Epic 2 was planned to be self-contained but has forward dependencies.

**Recommendation:** Either:
1. Move dependencies to Epic 1 (Foundation), or
2. Make Epic 2 features work with mock data until later epics

### C. Schema/Type Inconsistencies

| Type | Defined In | Used In | Conflict |
|------|------------|---------|----------|
| AgentName | Story 2.2 (agent-server) | Story 2.3 (frontend) | Cross-boundary import |
| HookResult | Story 2.15 | Stories 2.16-2.19 | 4 different shapes |
| ToolCategory | Story 2.4 | Stories 2.6-2.7 | Naming mismatch |

**Root Cause:** No shared types package between frontend and agent-server.

**Recommendation:** Create `src/shared/types/` with all cross-boundary types.

### D. Missing Infrastructure

| Missing | Needed By | Impact |
|---------|-----------|--------|
| FTS5 tables | Story 2.14 | Search falls back to LIKE |
| sessions table | Story 2.16 | Hooks crash |
| archival_memory table | Story 2.13, 2.16 | Memory skills fail |
| file_claims table | Story 2.18 | Routing fails |
| action_log table | Story 2.19 | Undo fails |
| tool_usage table | Story 2.18 | Rate limiting fails |
| AGENT_MODELS.preference_learner | Story 2.9 | Agent won't load |

**Root Cause:** Database schema assumed from CC v3 but not migrated.

**Recommendation:** Add schema migration task to Story 2.15 or create dedicated migration story.

---

## Recommendations by Priority

### P0: MUST FIX BEFORE ANY DEV (Blocks all stories)

1. **Resolve agent count: 31 vs 26**
   - Count actual agent files in `.claude/agents/`
   - Update epics.md AND test-design-epic-2.md to match
   - Assign to: PM/Architect

2. **Create shared types package**
   - Move constants to `src/shared/agents/constants.ts`
   - Both frontend and agent-server import from shared
   - Assign to: Story 2.2 developer

3. **Complete TOOL_CATALOG**
   - Add all tools agents reference
   - Standardize naming (use internal names everywhere)
   - Assign to: Story 2.4 developer

4. **Add database migration to Story 2.15**
   - Create all 7+ tables hooks depend on
   - Include FTS5 tables for search
   - Assign to: Story 2.15 developer

### P1: FIX DURING IMPLEMENTATION (Can work around)

5. Update skill count in epic (40+ → 27)
6. Update hook count in epic (34 → 20)
7. Define comprehensive HookResult schema
8. Fix composio_connection_checker cache logic
9. Add runtime safety check in Communicator Agent
10. Fix SQLite rate limiting timestamp queries

### P2: POLISH (Nice to have)

11. Add tests for all intent types (Story 2.1)
12. Clarify extended thinking AC wording (Story 2.6)
13. Add weighted scoring test (Story 2.8)
14. Make entity extraction configurable (Story 2.17)
15. Document hook execution order (Story 2.15)

---

## Story-Level Verdicts

| Story | Verdict | Blocker? | Key Issues |
|-------|---------|----------|------------|
| 2.1 Butler Agent Core | NEEDS_FIX | No | Tool catalog verification |
| 2.2 Agent Prompt Templates | NEEDS_FIX | **YES** | Agent count, shared types |
| 2.2b CC v3 Hooks Integration | NEEDS_FIX | No | Hook count discrepancy |
| 2.3 Sub-Agent Spawning | NEEDS_FIX | **YES** | Circular imports |
| 2.4 Tool Permission System | NEEDS_FIX | **YES** | Incomplete TOOL_CATALOG |
| 2.5 Triage Agent | PASS* | No | ARCH-012 missing |
| 2.6 Scheduler Agent | NEEDS_FIX | **YES** | Tool name mismatch |
| 2.7 Communicator Agent | NEEDS_FIX | **YES** | Missing tools |
| 2.8 Navigator Agent | PASS* | No | SearchService dependency |
| 2.9 Preference Learner | PASS* | No | AGENT_MODELS update |
| 2.10 Prompt Caching | NEEDS_FIX | No | TTL documentation |
| 2.11 Skill Migration | NEEDS_FIX | No | Skill count, structure |
| 2.12 Workflow Skills | NEEDS_FIX | No | Stub vs functional clarity |
| 2.13 Memory Skills | NEEDS_FIX | **YES** | PostgreSQL dependency |
| 2.14 Research Skills | NEEDS_FIX | No | FTS5 missing |
| 2.15 Hook Infrastructure | NEEDS_FIX | **YES** | Schema, migrations |
| 2.16 Session Hooks | NEEDS_FIX | **YES** | Duplicate names |
| 2.17 Context Injection | NEEDS_FIX | No | Token budget |
| 2.18 Tool Routing | NEEDS_FIX | No | Cache files |
| 2.19 Validation Hooks | NEEDS_FIX | No | Race conditions |

*PASS contingent on cross-story fixes

---

## Implementation Order Recommendation

Given dependencies and blockers, implement in this order:

**Phase 1: Foundation Fixes (Before any story dev)**
1. Fix epic numbers (agents, skills, hooks)
2. Create shared types package
3. Complete TOOL_CATALOG
4. Add database migrations to 2.15

**Phase 2: Core Infrastructure (Stories 2.1-2.4)**
- Story 2.2 first (defines types others use)
- Story 2.4 second (defines tools others use)
- Story 2.3 third (uses types from 2.2)
- Story 2.1 fourth (uses all above)
- Story 2.2b last (hooks use everything)

**Phase 3: Agents (Stories 2.5-2.9)**
- Can be implemented in parallel after Phase 2
- All depend on 2.2 (templates)

**Phase 4: Skills (Stories 2.10-2.14)**
- Story 2.11 first (framework)
- Others can be parallel after framework

**Phase 5: Hooks (Stories 2.15-2.19)**
- Story 2.15 first (infrastructure + migrations)
- Others depend on 2.15

---

## Questions for Project Architect

1. **Agent Count:** Is 31 or 26 the correct number? Which 5 are excluded?

2. **Shared Types:** Should we create a monorepo workspace package for shared types?

3. **Database:** Should PostgreSQL tables be created in Epic 1 (Foundation) or Epic 2?

4. **Tool Naming:** Should we use Composio names (GOOGLECALENDAR_*) or internal names (get_calendar_events)?

5. **Stub Skills:** Is it acceptable for 5 of 8 workflow skills to throw errors until later epics?

6. **Epic Scope:** Should Epic 2 be split to remove forward dependencies on Epics 3-10?

---

## Appendix: Review Files

All detailed review documents:
- `thoughts/shared/plans/review-batch-a.md` - Core Infrastructure
- `thoughts/shared/plans/review-batch-b.md` - Agent Definitions
- `thoughts/shared/plans/review-batch-c.md` - Skills Infrastructure
- `thoughts/shared/plans/review-batch-d.md` - Hooks

Original plan:
- `thoughts/shared/plans/PLAN-epic2-adversarial-review.md`

---

**Review completed by:** Claude Code adversarial review workflow
**Total agent turns:** ~50
**Files analyzed:** 40+ (20 stories, 19 ATDD checklists, source docs)
