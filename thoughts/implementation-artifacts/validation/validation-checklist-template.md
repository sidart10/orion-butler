# Story Validation Checklist Template

Use this checklist for each story to ensure comprehensive validation against planning artifacts.

---

## Story: [Story ID] - [Story Title]

**Validator:** [name]
**Date:** [date]
**Status:** [ ] Pass | [ ] Pass with Notes | [ ] Fail

---

## 1. PRD Requirement Traceability

| Check | Result | Notes |
|-------|--------|-------|
| [ ] All FR references exist in prd.md | | |
| [ ] All NFR references exist in prd.md | | |
| [ ] Story maps to at least one requirement | | |
| [ ] Reference format correct (FR-XXnnn, NFR-Xnnn) | | |
| [ ] Requirements intent matches story implementation | | |

**Findings:**
-

---

## 2. Architecture Compliance

| Check | Result | Notes |
|-------|--------|-------|
| [ ] Tech stack matches architecture.md §3 | | |
| [ ] File paths match architecture.md §16 | | |
| [ ] API patterns match architecture.md §5 | | |
| [ ] Database schemas match architecture.md §4 | | |
| [ ] Agent patterns match architecture.md §6 | | |
| [ ] Design system tokens match architecture.md §3.4 | | |
| [ ] Tauri config matches architecture.md §8 | | |

**Key Constraints Verified:**

| Constraint | Expected | Actual | Match |
|------------|----------|--------|-------|
| Tauri version | 2.0 | | [ ] |
| Claude model | claude-sonnet-4-5 or claude-opus-4-5 | | [ ] |
| Design colors | Gold #D4AF37, Cream #F9F8F6, Black #1A1A1A | | [ ] |
| Header height | 80px | | [ ] |
| Sidebar width | 280px | | [ ] |
| Rail width | 64px | | [ ] |
| DB location | ~/Library/Application Support/Orion/ | | [ ] |

**Findings:**
-

---

## 3. Acceptance Criteria Completeness

| Check | Result | Notes |
|-------|--------|-------|
| [ ] All ACs from epics.md present | | |
| [ ] AC wording consistent (Given/When/Then) | | |
| [ ] AC numbering aligns with epics | | |
| [ ] No unauthorized AC additions | | |
| [ ] Tasks tagged with AC references | | |

**AC Cross-Reference:**

| Epic AC ID | Present in Story | Wording Match | Notes |
|------------|------------------|---------------|-------|
| | [ ] | [ ] | |
| | [ ] | [ ] | |

**Findings:**
-

---

## 4. UX Specification Alignment

| Check | Result | Notes |
|-------|--------|-------|
| [ ] Interaction patterns match UX spec | | |
| [ ] Animation timings correct (600ms cubic-bezier) | | |
| [ ] Keyboard shortcuts match UX spec | | |
| [ ] Visual hierarchy per design philosophy | | |
| [ ] Emotional design in error states | | |
| [ ] Multi-chat architecture correctly applied | | |
| [ ] Trust progression in approval flows | | |

**UX Requirements Verified:**

| UX Ref | Requirement | Story Implements | Match |
|--------|-------------|------------------|-------|
| UX-002 | Zero border radius | | [ ] |
| UX-003 | Color palette | | [ ] |
| UX-004 | Font preloading | | [ ] |
| UX-005 | Layout dimensions | | [ ] |
| UX-008 | Canvas animation 600ms | | [ ] |

**Findings:**
-

---

## 5. Test Design Coverage

| Check | Result | Notes |
|-------|--------|-------|
| [ ] All test scenarios from test design present | | |
| [ ] Test code samples match test design | | |
| [ ] Test file locations correct | | |
| [ ] Test type balance (Unit/Integration/E2E/Visual) | | |
| [ ] NFR tests included (perf, a11y) | | |
| [ ] Mock structure per test-infra-agent-schemas.md | | |

**Test Scenarios Cross-Reference:**

| Test Design ID | Present | Code Sample | File Location | Notes |
|----------------|---------|-------------|---------------|-------|
| | [ ] | [ ] | [ ] | |
| | [ ] | [ ] | [ ] | |

**Findings:**
-

---

## 6. Cross-Story Consistency

| Check | Result | Notes |
|-------|--------|-------|
| [ ] Upstream dependencies accurate | | |
| [ ] Downstream dependencies accurate | | |
| [ ] File structure consistent | | |
| [ ] Shared schemas referenced correctly | | |
| [ ] No conflicting file assignments | | |
| [ ] Sprint status alignment | | |

**Dependencies Verified:**

| Dependency Type | Story ID | Valid | Notes |
|-----------------|----------|-------|-------|
| Upstream | | [ ] | |
| Downstream | | [ ] | |

**Findings:**
-

---

## 7. Dev Notes Accuracy

| Check | Result | Notes |
|-------|--------|-------|
| [ ] Code samples syntactically correct | | |
| [ ] Package versions match architecture | | |
| [ ] Zod schemas match expected shapes | | |
| [ ] File structure comments accurate | | |
| [ ] Reference links resolvable | | |

**Code Sample Verification:**

| Sample Location | Syntax OK | Logic OK | Notes |
|-----------------|-----------|----------|-------|
| | [ ] | [ ] | |
| | [ ] | [ ] | |

**Findings:**
-

---

## Summary

**Validation Score:** ___ / 100

| Category | Score | Weight |
|----------|-------|--------|
| PRD Traceability | /15 | 15% |
| Architecture | /20 | 20% |
| AC Completeness | /20 | 20% |
| UX Alignment | /15 | 15% |
| Test Coverage | /15 | 15% |
| Cross-Story | /10 | 10% |
| Dev Notes | /5 | 5% |

**Overall Result:** [ ] PASS | [ ] CONDITIONAL PASS | [ ] FAIL

**Critical Issues (Must Fix Before Dev):**
1.

**High Issues (Should Fix):**
1.

**Medium Issues (Can Fix During Dev):**
1.

**Low Issues (Nice to Have):**
1.

---

## Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | Story cannot be implemented as written | Missing AC, wrong tech stack |
| **High** | Significant rework required | Major UX flow mismatch |
| **Medium** | Minor corrections needed | Typo in reference, outdated version |
| **Low** | Cosmetic/formatting | Inconsistent naming |
