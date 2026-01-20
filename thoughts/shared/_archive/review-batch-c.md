# Batch C Adversarial Review: Skills Infrastructure

## Executive Summary

**Reviewer:** Critic Agent (Adversarial Mode)
**Date:** 2026-01-16
**Stories Reviewed:** 2.10, 2.11, 2.12, 2.13, 2.14
**Total Issues Found:** 6 critical, 5 major, 2 minor

### Critical Finding: Skill Count Mismatch

| Metric | Value |
|--------|-------|
| Epic Claims | "40+ adapted skills" |
| Actual Count | 27 skills |
| Gap | -13 skills (32.5% short) |

---

## Skill Count Audit

| Story | Skills Claimed | Skills Listed |
|-------|----------------|---------------|
| 2.10 | N/A (infrastructure) | 0 |
| 2.11 | Framework | 10 directory placeholders |
| 2.12 | 8 workflow skills | 8 (but 5 are stubs) |
| 2.13 | 6 memory skills | 6 |
| 2.14 | 5 research skills | 5 |
| **Total** | **40+** | **27** |

---

## Story 2.10: Prompt Caching Setup

### Issues Found
- **[MAJOR]** No Claude SDK Cache Control Types - CacheControl must be defined locally, comment implies imported
- **[MAJOR]** Missing TTL Documentation - code defaults differ from documented values

### Verdict: **NEEDS_FIX**

---

## Story 2.11: Core Skill Migration Framework

### Issues Found
- **[CRITICAL]** Circular Dependency on Story 2.13 - defines memory skill directories but skills are in later story
- **[CRITICAL]** Math Skills Excluded Without Count Update - excludes 30+ math skills but epic still claims "40+"

### Verdict: **NEEDS_FIX**

---

## Story 2.12: Workflow Skill Adaptation

### Issues Found
- **[CRITICAL]** Stub Workflows Marked as Functional - 5 of 8 skills throw errors pointing to future epics
- **[MAJOR]** Triage Workflow Has No Data Source - returns empty array, needs Epic 3

### Verdict: **NEEDS_FIX**

---

## Story 2.13: Memory & Context Skills

### Issues Found
- **[CRITICAL]** PostgreSQL Dependency Not in Epic 2 - requires archival_memory table from Epic 10
- **[MAJOR]** Embedding Service Returns Zero Vectors - fallback produces garbage search results

### Verdict: **NEEDS_FIX**

---

## Story 2.14: Research & Discovery Skills

### Issues Found
- **[MAJOR]** FTS5 Tables Assumed to Exist - code assumes FTS5 from Story 1.4 but not created there
- **[MINOR]** SearchService Property Access Inconsistency
- **[MINOR]** Redundant AC that restates schema

### Verdict: **NEEDS_FIX**

---

## Cross-Story Issues

### Issue 1: Inconsistent Error Handling
- 2.12 throws errors for stubs
- 2.13 returns zero embeddings
- 2.14 silently falls back to LIKE search

### Issue 2: Test Coverage Assumes Mocks
All tests pass with mocks but fail with real execution

### Issue 3: Circular Dependencies with Future Epics

```
Epic 2 Stories
  └─> Epic 3 (Composio/Gmail)
  └─> Epic 4 (Unified Inbox)
  └─> Epic 5 (Email)
  └─> Epic 6 (Calendar)
  └─> Epic 10 (PostgreSQL)
```

---

## Recommendations

### Priority 1: Fix Skill Count
Update epic to say "27 Orion skills + 30+ math skills available"

### Priority 2: Resolve Circular Dependencies
Move PostgreSQL setup from Epic 10 to Epic 1 (Foundation)

### Priority 3: Clarify Functional vs Stub Skills
Update Story 2.12 to distinguish 3 functional from 5 stub skills

### Priority 4: Add FTS5 Table Creation
Update Story 1.4 to create FTS5 virtual tables

### Priority 5: Implement Proper Embedding Fallback
Story 2.13 should integrate @xenova/transformers, not return zeros

---

## Summary

| Story | Critical | Major | Minor | Verdict |
|-------|----------|-------|-------|---------|
| 2.10 | 0 | 2 | 0 | NEEDS_FIX |
| 2.11 | 2 | 0 | 0 | NEEDS_FIX |
| 2.12 | 1 | 1 | 0 | NEEDS_FIX |
| 2.13 | 1 | 1 | 0 | NEEDS_FIX |
| 2.14 | 0 | 1 | 2 | NEEDS_FIX |
| **Total** | **6** | **5** | **2** | |
