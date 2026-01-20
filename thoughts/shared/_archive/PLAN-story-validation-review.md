# Plan: Story Validation Review

## Goal

Systematically review and validate all implementation stories in `thoughts/implementation-artifacts/stories/` against the planning artifacts (`prd.md`, `architecture.md`, `epics.md`, `ux-design-specification.md`, `test-design-epic-*.md`) to identify inconsistencies, errors, missing requirements, and gaps in UX/test coverage.

## Technical Choices

- **Validation Approach**: Structured checklist-based validation with cross-reference verification
- **Output Format**: Validation report per story + summary report with findings categorized by severity
- **Scope**: All 14 story files currently in `ready-for-dev` status

## Current State Analysis

### Source Documents (Planning Artifacts)

| Document | Purpose | Key Validations |
|----------|---------|-----------------|
| `prd.md` | Requirements, FRs, NFRs | Verify stories implement stated requirements |
| `architecture.md` | Technical specs, design system | Verify tech choices match architecture |
| `epics.md` | Epic/Story definitions, ACs | Verify ACs are properly translated |
| `ux-design-specification.md` | UX flows, interactions, patterns | Verify UX requirements covered |
| `test-design-epic-*.md` | Test scenarios, coverage | Verify tests match test design |

### Stories to Validate

**Epic 1 (11 stories):**
- story-1-1-tauri-desktop-shell.md
- story-1-2-nextjs-frontend-integration.md
- story-1-3-design-system-foundation.md
- story-1-4-sqlite-database-setup.md
- story-1-5-agent-server-process.md
- story-1-6-chat-message-storage.md
- story-1-7-claude-integration.md
- story-1-8-streaming-responses.md
- story-1-9-split-screen-layout.md
- story-1-10-tool-call-visualization.md
- story-1-11-quick-actions-keyboard-shortcuts.md

**Epic 2 (3 stories ready):**
- story-2-1-butler-agent-core.md
- story-2-2-agent-prompt-templates.md
- story-2-2b-hooks-integration.md

## Tasks

### Task 1: Create Validation Checklist Template
[Prerequisites: None]

- [ ] 1.1 Create `validation-checklist-template.md` with structured validation criteria:
  - Requirements traceability (PRD refs valid)
  - Architecture compliance (tech choices match architecture.md)
  - AC completeness (all ACs from epics.md included)
  - UX specification alignment (flows, interactions, animations)
  - Test design coverage (test scenarios match test-design-epic)
  - Cross-story consistency (dependencies accurate)
  - Dev Notes accuracy (code samples, schemas correct)

**Files to create:**
- `thoughts/implementation-artifacts/validation/validation-checklist-template.md`

### Task 2: Validate PRD Requirement Traceability
[Depends on: Task 1]

For each story, verify:
- [ ] 2.1 All FRs (Functional Requirements) referenced are valid
- [ ] 2.2 All NFRs (Non-Functional Requirements) referenced exist
- [ ] 2.3 Story maps back to at least one PRD requirement
- [ ] 2.4 PRD requirement numbers format correctly (FR-XXnnn, NFR-Xnnn)
- [ ] 2.5 No orphan stories without PRD backing

**Validation approach:**
```
For each FR/NFR reference in story:
  - Extract reference ID
  - Look up in prd.md
  - Verify requirement exists
  - Verify story fulfills requirement intent
```

**Files to modify:**
- Create `thoughts/implementation-artifacts/validation/prd-traceability-report.md`

### Task 3: Validate Architecture Compliance
[Depends on: Task 1]

For each story, verify:
- [ ] 3.1 Tech stack choices match architecture.md section 3
- [ ] 3.2 File paths match architecture.md section 16 (File Structure)
- [ ] 3.3 API patterns match architecture.md section 5
- [ ] 3.4 Database schemas match architecture.md section 4
- [ ] 3.5 Agent patterns match architecture.md section 6
- [ ] 3.6 Design system tokens match architecture.md section 3.4
- [ ] 3.7 Tauri configuration matches architecture.md section 8

**Key Architecture Constraints to Verify:**

| Constraint | Source | Validation |
|------------|--------|------------|
| Tauri 2.0 config schema | arch#8.1 | Check tauri.conf.json structure |
| Design System colors | arch#3.4.3 | Gold #D4AF37, Cream #F9F8F6, Black #1A1A1A |
| Layout dimensions | arch#3.4.5 | Header 80px, Sidebar 280px, Rail 64px |
| Claude model | arch#3.3 | claude-sonnet-4-5 or claude-opus-4-5 |
| Database location | arch#4.1 | ~/Library/Application Support/Orion/ |

**Files to modify:**
- Create `thoughts/implementation-artifacts/validation/architecture-compliance-report.md`

### Task 4: Validate Acceptance Criteria Completeness
[Depends on: Task 1]

For each story, cross-reference with `epics.md`:
- [ ] 4.1 Every AC from epics.md is in the story
- [ ] 4.2 AC wording is consistent (Given/When/Then format)
- [ ] 4.3 AC numbering aligns between epics and story
- [ ] 4.4 No AC additions without epics.md backing
- [ ] 4.5 Tasks map to ACs (Tasks tagged with AC refs)

**Files to modify:**
- Create `thoughts/implementation-artifacts/validation/ac-completeness-report.md`

### Task 5: Validate UX Specification Alignment
[Depends on: Task 1]

For each story, verify against `ux-design-specification.md`:
- [ ] 5.1 Interaction patterns match UX spec flows
- [ ] 5.2 Animation timings match (600ms cubic-bezier for canvas)
- [ ] 5.3 Keyboard shortcuts match UX spec patterns
- [ ] 5.4 Visual hierarchy matches design philosophy
- [ ] 5.5 Emotional design principles reflected in error states
- [ ] 5.6 Multi-chat architecture correctly implemented
- [ ] 5.7 Trust progression patterns in approval flows

**Critical UX Requirements to Verify:**

| UX Spec Reference | Requirement | Stories Affected |
|-------------------|-------------|------------------|
| UX-002 | Zero border radius | 1-3, 1-9 |
| UX-003 | Color palette (Gold, Cream, Black) | 1-3 |
| UX-004 | Font preloading (Playfair, Inter) | 1-3 |
| UX-005 | Layout dimensions | 1-3, 1-9 |
| UX-008 | Canvas animation (600ms cubic-bezier) | 1-9 |
| Flow 1 | Inbox Triage UX | 1-6, 1-10 |
| Flow 2 | Email Response (Canvas slide-in) | 1-9 |

**Files to modify:**
- Create `thoughts/implementation-artifacts/validation/ux-alignment-report.md`

### Task 6: Validate Test Design Coverage
[Depends on: Task 1]

For each story, verify against `test-design-epic-*.md`:
- [ ] 6.1 All test scenarios from test design are in story
- [ ] 6.2 Test code samples match test design examples
- [ ] 6.3 Test file locations correct
- [ ] 6.4 Test types (Unit/Integration/E2E/Visual) balanced
- [ ] 6.5 NFR tests included (performance, accessibility)
- [ ] 6.6 Mock structure matches test-infra-agent-schemas.md

**Files to modify:**
- Create `thoughts/implementation-artifacts/validation/test-coverage-report.md`

### Task 7: Validate Cross-Story Consistency
[Depends on: Tasks 2-6]

- [ ] 7.1 Dependency declarations accurate (upstream/downstream)
- [ ] 7.2 File structure consistent across stories
- [ ] 7.3 Shared schemas referenced correctly
- [ ] 7.4 No conflicting task assignments (same file in multiple stories)
- [ ] 7.5 Sprint status alignment with story status

**Files to modify:**
- Create `thoughts/implementation-artifacts/validation/cross-story-report.md`

### Task 8: Validate Dev Notes Accuracy
[Depends on: Tasks 2-6]

For each story, verify Dev Notes section:
- [ ] 8.1 Code samples syntactically correct
- [ ] 8.2 Package versions match package.json/architecture
- [ ] 8.3 Zod schemas match expected shapes
- [ ] 8.4 File structure comments accurate
- [ ] 8.5 References section links valid (can be resolved)

**Files to modify:**
- Create `thoughts/implementation-artifacts/validation/dev-notes-accuracy-report.md`

### Task 9: Generate Summary Report
[Depends on: Tasks 2-8]

- [ ] 9.1 Aggregate all findings by severity (Critical/High/Medium/Low)
- [ ] 9.2 Group findings by story
- [ ] 9.3 Identify systemic patterns (repeated errors)
- [ ] 9.4 Provide remediation recommendations
- [ ] 9.5 Calculate validation score per story

**Severity Definitions:**

| Severity | Definition | Example |
|----------|------------|---------|
| Critical | Story cannot be implemented as written | Missing AC, wrong tech stack |
| High | Significant rework required | Major UX flow mismatch |
| Medium | Minor corrections needed | Typo in reference, outdated version |
| Low | Cosmetic/formatting | Inconsistent naming |

**Files to create:**
- `thoughts/implementation-artifacts/validation/VALIDATION-SUMMARY.md`

### Task 10: Update Stories with Findings
[Depends on: Task 9]

- [ ] 10.1 For each Critical/High finding, create issue ticket format in story
- [ ] 10.2 Add "Validation Notes" section to each story
- [ ] 10.3 Update story status if blocked by critical issues
- [ ] 10.4 Cross-reference validation report in story References

## Success Criteria

### Automated Verification:
- [ ] All validation reports generated in `thoughts/implementation-artifacts/validation/`
- [ ] Summary report includes counts by severity
- [ ] Each story has validation status documented

### Manual Verification:
- [ ] Sample 3 stories and verify findings are accurate
- [ ] Confirm no false positives in critical findings
- [ ] Verify remediation recommendations are actionable

## Out of Scope

- Actually fixing the identified issues (this plan is for validation only)
- Validating stories in `backlog` status (only `ready-for-dev` stories)
- Validating ATDD checklist files (focus on story files)
- Validating context XML files

## Risks (Pre-Mortem)

### Tigers:
- **Planning artifacts themselves may be inconsistent** (HIGH)
  - Mitigation: Cross-reference multiple sources, flag when sources conflict

- **Stories reference outdated architecture** (MEDIUM)
  - Mitigation: Use latest versions of all planning docs

### Elephants:
- **Validation may take longer than implementation fixes** (MEDIUM)
  - Note: Thoroughness is more valuable than speed here

---

## Appendix: Known Issues to Look For

Based on initial exploration, watch for these potential issues:

1. **Template placeholders not filled:** `{{agent_model_name_version}}` still present
2. **Version inconsistencies:** Different Tauri/Next.js versions mentioned
3. **UX spec references:** Stories may use UX-XXX codes inconsistently
4. **Test file paths:** May not match actual project structure
5. **Design system tokens:** May reference old names (pre-extraction)
6. **Cross-story dependencies:** May be circular or missing
7. **PRD requirement IDs:** May not exist in PRD (fabricated)
8. **Canvas animation timing:** Should be 600ms everywhere
9. **Color hex values:** Must match exactly (#D4AF37, #F9F8F6, #1A1A1A)
10. **Layout dimensions:** Must match (80px header, 280px sidebar, 64px rail)
