# Batch A Adversarial Review: Core Infrastructure

## Executive Summary

**Reviewer:** Critic Agent (Adversarial Mode)
**Date:** 2026-01-16
**Stories Reviewed:** 2.1, 2.2, 2.2b, 2.3, 2.4
**Total Issues Found:** 4 critical, 9 major, 9 minor

### Critical Findings

1. **CRITICAL**: Story 2.2 claims "31 agents" but test-design expects "26 agents" - mismatch
2. **CRITICAL**: Story 2.3 delegation schemas import from wrong location (circular dependency risk)
3. **CRITICAL**: Story 2.3 AgentName type duplicated across stories
4. **CRITICAL**: Story 2.4 TOOL_CATALOG incomplete - only 16 tools defined

---

## Story 2.1: Butler Agent Core

### Source Comparison

| Epic AC (epics.md:883-895) | Present in Story? | Notes |
|---------|-------------------|-------|
| "analyzes intent and determines if it can handle directly or needs to delegate" | ✓ YES | AC1 line 25-27 |
| "maintains conversation context across turns" | ✓ YES | AC1 line 26 |
| "has access to the full tool catalog" | ✓ YES | AC1 line 27 |
| "breaks down the task into sub-tasks" | ✓ YES | AC2 line 39 |
| "coordinates execution in logical order" | ✓ YES | AC2 line 40 |
| "synthesizes results into a coherent response" | ✓ YES | AC2 line 41 |

### Issues Found

- **[MAJOR]** AC1 - Tool Catalog Access Not Verified: AC1 checklist does not include verification that Butler "has access to the full tool catalog"
- **[MINOR]** Inconsistent Intent Enum Values: Story defines 8 intent values, but tests only test 3
- **[MINOR]** AgentContext Interface Location Ambiguity: Dev Notes define `AgentContext` but don't specify shared location

### Verdict: **NEEDS_FIX** (1 major, 2 minor)

---

## Story 2.2: Agent Prompt Templates

### Source Comparison

| Epic AC (epics.md:912-922) | Present in Story? | Notes |
|---------|-------------------|-------|
| "31 agents are available" | ✗ **CRITICAL CONTRADICTION** | Test expects 26 |
| "each has: name, description, system prompt, tools list" | ✓ YES | |
| "6 Orion-specific agents have detailed prompts" | ✓ YES | |

### Issues Found

- **[CRITICAL]** Agent Count Mismatch: epics.md says "31 agents", test-design-epic-2.md expects "26 agents"
- **[MAJOR]** Phantom AC: "butler.md and triage.md have valid YAML frontmatter" - not in epic
- **[MAJOR]** BMAD Agents Removal Not in Epic: Story excludes BMAD agents but epic doesn't mention this
- **[MINOR]** Constants.ts Exports DELEGATABLE_AGENTS but Story 2.1 Doesn't Use It
- **[MINOR]** Model Field Optional in Schema but Required in AC

### Verdict: **NEEDS_FIX** (1 critical, 2 major, 2 minor)

---

## Story 2.2b: CC v3 Hooks Integration

### Issues Found

- **[MAJOR]** Hook Count Discrepancy: Epic says "34 hooks", story lists only 23
- **[MINOR]** Phantom Hook Categories: Missing "subagent" category
- **[MINOR]** TLDR "95% token savings" Claim Unverified

### Verdict: **NEEDS_FIX** (1 major, 2 minor)

---

## Story 2.3: Sub-Agent Spawning

### Issues Found

- **[CRITICAL]** Delegation Schemas Import from Wrong Location: Frontend schema importing from agent-server creates circular dependency
- **[CRITICAL]** AgentName Type Duplicated Across Stories: Defined in agent-server but needed in frontend
- **[MAJOR]** OrionCoreAgentSchema vs DelegatableAgentSchema distinction confusing
- **[MAJOR]** Agent Rail Component Uses Wrong Agent List (only shows 6, not all active)
- **[MINOR]** Handoff Preservation Test Counts Wrong

### Verdict: **NEEDS_FIX** (2 critical, 2 major, 1 minor)

---

## Story 2.4: Tool Permission System

### Issues Found

- **[CRITICAL]** TOOL_CATALOG Incomplete: Only 16 tools defined, Epic implies full catalog
- **[MAJOR]** "Modify the Action" Promise Not Implemented: AC promises feature not in code
- **[MAJOR]** Destructive Tool Two-Step Confirmation Incomplete
- **[MAJOR]** Session Store Cleared on App Restart - But How?
- **[MINOR]** PermissionAudit Schema Missing Fields
- **[MINOR]** Warning Message logic for non-DESTRUCTIVE tools

### Verdict: **NEEDS_FIX** (1 critical, 3 major, 2 minor)

---

## Cross-Story Issues

### Issue 1: Type/Constant Location Inconsistency
Agent type constants defined inconsistently - Story 2.2 in agent-server, Story 2.3 tries to import in frontend.

### Issue 2: Agent Count Propagation Error
31 vs 26 agents cascades through stories.

### Issue 3: Schema Location and Sharing Strategy Unclear
Frontend defines schemas but agent-server needs them too.

### Issue 4: Tool Catalog Completeness
16 tools vs "full catalog" unclear scope.

### Issue 5: Test ID Naming Inconsistency
Stories don't use consistent test ID format.

---

## Priority Fixes

### Priority 1: Critical (Block Implementation)
1. Resolve agent count: 31 vs 26
2. Fix type import locations - move to shared `src/agents/constants.ts`
3. Complete TOOL_CATALOG or document scope
4. Resolve circular dependency in delegation schemas

### Priority 2: Major (Fix During Implementation)
5. Add tool catalog verification to Story 2.1 AC
6. Implement "Modify action" or remove from AC
7. Fix destructive tool confirmation logic
8. Verify hook count: 34 vs actual
9. Clarify OrionCoreAgent vs DelegatableAgent distinction

### Priority 3: Minor (Polish)
10-15. Various schema, test, and documentation fixes

---

## Summary

| Story | Critical | Major | Minor | Verdict |
|-------|----------|-------|-------|---------|
| 2.1 | 0 | 1 | 2 | NEEDS_FIX |
| 2.2 | 1 | 2 | 2 | NEEDS_FIX |
| 2.2b | 0 | 1 | 2 | NEEDS_FIX |
| 2.3 | 2 | 2 | 1 | NEEDS_FIX |
| 2.4 | 1 | 3 | 2 | NEEDS_FIX |
| **Total** | **4** | **9** | **9** | **ALL NEED FIXES** |

**Recommendation:** Do NOT proceed with implementation until Priority 1 (Critical) issues are resolved.
