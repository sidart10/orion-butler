# Batch D Adversarial Review: Hooks Infrastructure

## Executive Summary

**Reviewer:** Critic Agent (Adversarial Mode)
**Date:** 2026-01-16
**Stories Reviewed:** 2.15, 2.16, 2.17, 2.18, 2.19
**Total Issues Found:** 3 critical, 10 major, 5 minor

### Critical Finding: Hook Count Mismatch

| Metric | Value |
|--------|-------|
| Epic Claims | "34 hooks total" |
| Actual Count | 20 hooks |
| Gap | -14 hooks (41% short) |

---

## Hook Count Audit

| Story | Hooks Claimed | Hooks Defined |
|-------|---------------|---------------|
| 2.15 | Infrastructure | 0 (infrastructure files only) |
| 2.16 | 5 hooks | 5 ✓ |
| 2.17 | 4 hooks | 4 ✓ |
| 2.18 | 4 hooks | **5** (epic wrong - includes composio_connection_checker.py) |
| 2.19 | 6 hooks | 6 ✓ |
| **Total** | **34** | **20** |

---

## Story 2.15: Hook Infrastructure Foundation

### Issues Found
- **[CRITICAL]** No hooks actually defined - pure infrastructure story
- **[MAJOR]** No formal hook interface contract - stories return different HookResult shapes
- **[MAJOR]** Hook timeout defaults inconsistent across stories
- **[MINOR]** "From CC v3" claim not validated

### Verdict: **NEEDS_FIX**

---

## Story 2.16: Session Lifecycle Hooks

### Issues Found
- **[CRITICAL]** Duplicate hook names with incompatible implementations (PostgreSQL vs file-based)
- **[MAJOR]** Assumes PostgreSQL schema exists but doesn't verify/migrate
- **[MAJOR]** Uses psycopg2 without declaring dependency
- **[MINOR]** session-register.sh uses uuidgen without fallback

### Verdict: **NEEDS_FIX**

---

## Story 2.17: Context Injection Hooks

### Issues Found
- **[MAJOR]** Token budget not enforced - shell script can inject unlimited context
- **[MAJOR]** Entity extraction regex produces false positives
- **[MINOR]** Skill suggestion patterns hardcoded

### Verdict: **NEEDS_FIX**

---

## Story 2.18: Tool Routing Hooks

### Issues Found
- **[CRITICAL]** Epic says 4 hooks, story defines 5
- **[MAJOR]** composio_connection_checker.py reads non-existent cache files
- **[MAJOR]** Rate limiting SQLite datetime queries broken
- **[MINOR]** path-rules.sh uses bash-specific arrays

### Verdict: **NEEDS_FIX**

---

## Story 2.19: Validation & Safety Hooks

### Issues Found
- **[MAJOR]** Email validation has hardcoded internal domains
- **[MAJOR]** Calendar conflict detection has race condition
- **[MINOR]** action_log previous_state never populated

### Verdict: **NEEDS_FIX**

---

## Cross-Story Issues

### CI-1: Hook Result Schema Inconsistency (CRITICAL)
Each story defines different HookResult interface - no common schema validation

### CI-2: Database Schema Dependencies Untracked (CRITICAL)
7 tables assumed to exist but not verified or migrated

### CI-3: Python Dependency Conflicts (MAJOR)
psycopg2 used without version coordination

### CI-4: Hook Execution Order Not Documented (MAJOR)
Multiple hooks fire on same event but order unspecified

---

## Recommendations

### Priority 1 (Must Fix)
1. Fix hook count in Epic (34 → 20)
2. Define comprehensive HookResult schema in Story 2.15
3. Add database migration step to Story 2.15
4. Resolve duplicate session-start-continuity hook names
5. Fix composio_connection_checker cache

### Priority 2 (Should Fix)
6. Add Python dependency management
7. Document hook execution order
8. Fix token budget enforcement
9. Fix rate limiting timestamp comparison
10. Add previous_state population

---

## Summary

| Story | Critical | Major | Minor | Verdict |
|-------|----------|-------|-------|---------|
| 2.15 | 1 | 2 | 1 | NEEDS_FIX |
| 2.16 | 1 | 2 | 1 | NEEDS_FIX |
| 2.17 | 0 | 2 | 1 | NEEDS_FIX |
| 2.18 | 1 | 2 | 1 | NEEDS_FIX |
| 2.19 | 0 | 2 | 1 | NEEDS_FIX |
| **Total** | **3** | **10** | **5** | |

**Verdict:** NOT READY FOR IMPLEMENTATION without critical fixes
