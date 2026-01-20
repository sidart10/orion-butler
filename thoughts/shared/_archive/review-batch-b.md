# Batch B Adversarial Review: Agent Definitions

## Executive Summary

**Reviewer:** Critic Agent (Adversarial Mode)
**Date:** 2026-01-16
**Stories Reviewed:** 2.5, 2.6, 2.7, 2.8, 2.9
**Total Issues Found:** 5 critical, 9 major, 4 minor

### Critical Findings

1. **CRITICAL**: Missing ARCH IDs in architecture.md - Stories reference ARCH-012 through ARCH-016 but these don't exist
2. **CRITICAL**: Tool name mismatch - Stories use Composio names (GOOGLECALENDAR_LIST_EVENTS), Story 2.4 uses internal names (get_calendar_events)
3. **CRITICAL**: Missing tools in TOOL_CATALOG - create_draft, update_event, send_slack_message not defined
4. **CRITICAL**: Story 2.8 depends on SearchService from Epic 1 which may not exist yet

---

## Story 2.5: Triage Agent Definition

### Issues Found
- **[CRITICAL]** Missing ARCH-012 Definition in architecture.md
- **[MAJOR]** Unclear Tool Access Pattern - does Triage call Gmail or receive data from Butler?
- **[MINOR]** Schema Field Naming Inconsistency (priority_score vs priority)

### Verdict: **PASS** (with ARCH-012 fix)

---

## Story 2.6: Scheduler Agent Definition

### Issues Found
- **[CRITICAL]** Tool Name Mismatch - story uses GOOGLECALENDAR_LIST_EVENTS, TOOL_CATALOG has get_calendar_events
- **[CRITICAL]** Missing Tool - update_event not in TOOL_CATALOG
- **[MAJOR]** Missing ARCH-013 and ARCH-019 Definitions
- **[MINOR]** Extended Thinking AC wording confusing (double negative)

### Verdict: **NEEDS_FIX** (critical tool issues)

---

## Story 2.7: Communicator Agent Definition

### Issues Found
- **[CRITICAL]** Missing Tools in TOOL_CATALOG - create_draft, send_slack_message not defined
- **[MAJOR]** Missing ARCH-014 Definition
- **[MAJOR]** Safety Constraint Not Enforced at Runtime - schema blocks 'send' but no runtime check

### Verdict: **NEEDS_FIX** (critical missing tools)

---

## Story 2.8: Navigator Agent Definition

### Issues Found
- **[CRITICAL]** SearchService Dependency Unclear - depends on Epic 1 which may not be complete
- **[MAJOR]** Missing ARCH-015 Definition
- **[MAJOR]** Embedding Model Confusion - BGE-M3 vs BGE-large-en-v1.5
- **[MINOR]** Relevance Scoring Weights Not Schema-Enforced

### Verdict: **PASS** (with dependency clarification)

---

## Story 2.9: Preference Learner Agent Definition

### Issues Found
- **[MAJOR]** Missing ARCH-016 Definition
- **[MAJOR]** Database Schema Field Name Mismatch (camelCase vs snake_case)
- **[MAJOR]** AGENT_MODELS Constant May Not Include preference_learner
- **[MINOR]** Confidence Progression Formula Not Testable

### Verdict: **PASS** (with field mapping fixes)

---

## Cross-Agent Issues

### X-1: Missing ARCH IDs in Architecture Document (CRITICAL)
All stories reference ARCH-012 through ARCH-016 but grep returns no matches in architecture.md

### X-2: Tool Naming Inconsistency (CRITICAL)
- PRD uses Composio naming: `GOOGLECALENDAR_LIST_EVENTS`
- Story 2.4 uses generic names: `get_calendar_events`
- Impact: Agents won't find tools in TOOL_CATALOG

### X-3: Incomplete TOOL_CATALOG in Story 2.4 (MAJOR)
Missing tools: create_draft, update_event, send_slack_message

### X-4: Dependency on Story 2.2 Unclear (MAJOR)
Every story lists 2.2 as dependency but what exports does it provide?

### X-5: Agent Hierarchy Not Clearly Documented (MINOR)
Is Butler→Agent relationship delegation or spawning?

---

## Recommendations

### Immediate (Blocks Dev)
1. Add ARCH-012 through ARCH-021 to architecture.md
2. Standardize tool names (choose Composio OR internal, not both)
3. Complete TOOL_CATALOG with all agent-required tools
4. Clarify SearchService dependency for Story 2.8
5. Verify Story 2.2 provides expected exports

### Medium Priority
6. Add field mapping tests (Story 2.9)
7. Add safety runtime check (Story 2.7)
8. Add AGENT_MODELS subtask (Story 2.9)

---

## Summary

| Story | Critical | Major | Minor | Verdict |
|-------|----------|-------|-------|---------|
| 2.5 | 1 | 1 | 1 | PASS* |
| 2.6 | 2 | 1 | 1 | NEEDS_FIX |
| 2.7 | 1 | 2 | 0 | NEEDS_FIX |
| 2.8 | 1 | 2 | 1 | PASS* |
| 2.9 | 0 | 3 | 1 | PASS* |
| **Total** | **5** | **9** | **4** | |

*PASS contingent on cross-story fixes
