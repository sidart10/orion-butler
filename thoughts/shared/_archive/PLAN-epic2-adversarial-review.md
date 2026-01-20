# Plan: Epic 2 Adversarial Spec Review

## Goal

Conduct a thorough adversarial review of all 20 Epic 2 story files to verify they are:
1. **Complete** - All ACs from the epic definition are captured
2. **Consistent** - No contradictions between stories or with planning artifacts
3. **Aligned** - Stories match PRD, architecture, and test design specifications
4. **Implementable** - No gaps, ambiguities, or missing dependencies that would block development

This is an **adversarial** review - we actively try to find problems, inconsistencies, and gaps.

## Scope

| Category | Count | Files |
|----------|-------|-------|
| Story files | 20 | story-2-1 through story-2-19 (including 2-2b) |
| ATDD checklists | 19 | atdd-checklist-2-* (missing one for 2-2) |
| Planning artifacts | 4 | epics.md, architecture.md, prd.md, test-design-epic-2.md |

## Review Framework

### 1. Source Document Traceability
For each story, verify:
- [ ] All ACs from epics.md are present in the story
- [ ] No phantom ACs invented that aren't in the source
- [ ] Technical notes align with architecture.md
- [ ] Test scenarios align with test-design-epic-2.md

### 2. Cross-Story Consistency Checks
- [ ] Shared types/constants are defined consistently (AgentName, DelegatableAgent, etc.)
- [ ] Dependencies form a valid DAG (no circular dependencies)
- [ ] Interface contracts between stories match (e.g., hook signatures)
- [ ] Naming conventions are consistent across all stories

### 3. Dependency Chain Validation
- [ ] Each story's dependencies are realistic (not depending on later stories)
- [ ] Critical paths are identified correctly
- [ ] No missing infrastructure stories that block implementation

### 4. Technical Feasibility
- [ ] Proposed implementations are technically sound
- [ ] No impossible requirements (e.g., accessing unavailable APIs)
- [ ] Performance assumptions are reasonable
- [ ] Security considerations are addressed

### 5. Test Coverage Gaps
- [ ] All ACs have corresponding ATDD tests
- [ ] Edge cases are identified
- [ ] Error handling scenarios exist
- [ ] Integration points are tested

## Tasks

### Task 1: Batch Stories into Review Groups
Group the 20 stories into logical batches for efficient review:

**Batch A: Core Agent Infrastructure (5 stories)**
- 2-1 (Butler Agent Core)
- 2-2 (Agent Prompt Templates)
- 2-2b (CC v3 Hooks Integration)
- 2-3 (Sub-Agent Spawning)
- 2-4 (Tool Permission System)

**Batch B: Specialized Agent Definitions (5 stories)**
- 2-5 (Triage Agent)
- 2-6 (Scheduler Agent)
- 2-7 (Communicator Agent)
- 2-8 (Navigator Agent)
- 2-9 (Preference Learner Agent)

**Batch C: Infrastructure & Skills (6 stories)**
- 2-10 (Prompt Caching)
- 2-11 (Core Skill Migration)
- 2-12 (Workflow Skill Adaptation)
- 2-13 (Memory & Context Skills)
- 2-14 (Research & Discovery Skills)

**Batch D: Hooks (4 stories)**
- 2-15 (Hook Infrastructure Foundation)
- 2-16 (Session Lifecycle Hooks)
- 2-17 (Context Injection Hooks)
- 2-18 (Tool Routing Hooks)
- 2-19 (Validation & Safety Hooks)

### Task 2: Review Batch A - Core Agent Infrastructure
**Agent:** `critic` or `plan-reviewer`

For each story in Batch A:
- [ ] Compare story ACs against epics.md definition (line-by-line)
- [ ] Verify technical implementation aligns with architecture.md
- [ ] Check ATDD checklist covers all story ACs
- [ ] Identify any cross-story type/interface conflicts

**Specific checks for Batch A:**
- Story 2-2 defines AgentName enum - verify it matches the "31 agents" mentioned in epic
- Story 2-3 imports from 2-2 - verify the import contract is correct
- Story 2-4 defines canUseTool - verify it covers all tools mentioned in architecture

**Output:** `thoughts/shared/plans/review-batch-a.md`

### Task 3: Review Batch B - Agent Definitions
**Agent:** `critic` or `plan-reviewer`

For each story in Batch B:
- [ ] Verify agent responsibilities match PRD requirements
- [ ] Check each agent has required hooks/skills dependencies
- [ ] Verify agents don't overlap in responsibility
- [ ] Check prompt templates exist for each agent

**Specific checks for Batch B:**
- All 5 agents should reference Story 2-2 (templates) as dependency
- Triage Agent (2-5) should align with Epic 4 (Inbox) requirements
- Scheduler Agent (2-6) should align with Epic 6 (Calendar) requirements
- Communicator Agent (2-7) should align with Epic 5 (Email) requirements

**Output:** `thoughts/shared/plans/review-batch-b.md`

### Task 4: Review Batch C - Skills Infrastructure
**Agent:** `critic` or `plan-reviewer`

For each story in Batch C:
- [ ] Verify skill categories match Continuous Claude v3 inventory
- [ ] Check migration framework covers all required skill types
- [ ] Verify dependencies on hook infrastructure (from Batch D)
- [ ] Check for circular dependencies between skills

**Specific checks for Batch C:**
- Story 2-11 should define a clear migration path from CC v3
- Story 2-13 (Memory Skills) should align with Epic 10 (Memory System)
- Story 2-14 (Research Skills) should align with Epic 3 (Tool Connections)

**Output:** `thoughts/shared/plans/review-batch-c.md`

### Task 5: Review Batch D - Hooks
**Agent:** `critic` or `plan-reviewer`

For each story in Batch D:
- [ ] Verify all 34 hooks mentioned in epic are accounted for
- [ ] Check hook signatures are consistent across stories
- [ ] Verify hook execution order is defined
- [ ] Check for hook conflicts or race conditions

**Specific checks for Batch D:**
- Story 2-15 should define HookRunner infrastructure
- Stories 2-16 through 2-19 should all use the same HookRunner
- Hook names should match between stories (no smart-search-router.sh vs search-router.sh)
- Total hooks should sum to 34 as promised in epic

**Output:** `thoughts/shared/plans/review-batch-d.md`

### Task 6: Cross-Story Consistency Analysis
**Agent:** `critic` or analysis in main context

After batch reviews complete:
- [ ] Compile all type definitions across stories - check for conflicts
- [ ] Map all dependencies - verify no cycles
- [ ] Compare all shared constants - verify consistency
- [ ] Identify any "orphan" stories (no dependencies on them)

**Specific checks:**
- AgentName enum: Should appear in 2-2, referenced in 2-3, 2-5-2-9
- HookEvent type: Should appear in 2-15, referenced in 2-16-2-19
- ToolPermission type: Should appear in 2-4, referenced in 2-5-2-9

**Output:** `thoughts/shared/plans/review-cross-story.md`

### Task 7: Compile Final Report
Synthesize all findings into a single report:
- [ ] Summary of critical issues (blocking implementation)
- [ ] Summary of major issues (need fix before dev)
- [ ] Summary of minor issues (fix during implementation)
- [ ] Recommendations for story updates

**Output:** `thoughts/shared/plans/REVIEW-epic2-adversarial-report.md`

## Adversarial Review Checklist (Per Story)

For each story, the reviewer should answer these questions:

### Completeness
1. Are ALL ACs from epics.md present? (quote line numbers)
2. Are there any phantom ACs not in the source?
3. Is the technical notes section complete?
4. Are all dependencies listed?

### Consistency
5. Do types match other stories that reference them?
6. Do hook names match between stories?
7. Are file paths consistent?
8. Are timeout/config values consistent?

### Alignment
9. Does the story align with PRD requirements?
10. Does the story follow architecture patterns?
11. Does the ATDD checklist match test-design-epic-2.md?
12. Are acceptance criteria testable?

### Implementability
13. Can this story be implemented with its listed dependencies?
14. Are there any hidden dependencies not listed?
15. Is the scope realistic for a single story?
16. Are there any ambiguous requirements?

### Red Flags to Look For
- Vague ACs like "appropriate" or "reasonable"
- Missing error handling scenarios
- Dependencies on stories that don't exist
- Contradicting information between sections
- Copy-paste errors from other stories
- Hardcoded values that should be configurable

## Success Criteria

### Review Complete When:
- [ ] All 20 stories reviewed against checklist
- [ ] All 4 batch reports written
- [ ] Cross-story consistency analysis done
- [ ] Final report compiled with issues categorized

### Issue Categories:
| Category | Definition | Action |
|----------|------------|--------|
| **CRITICAL** | Blocks implementation or causes system failure | Must fix before any dev starts |
| **MAJOR** | Significant gap or inconsistency | Fix before story is implemented |
| **MINOR** | Style/wording issues, small gaps | Can fix during implementation |
| **NOTE** | Observations, not issues | Document for awareness |

## Estimated Effort

| Task | Agent | Estimated Turns |
|------|-------|-----------------|
| Task 2 (Batch A) | critic | 10-15 |
| Task 3 (Batch B) | critic | 10-15 |
| Task 4 (Batch C) | critic | 10-15 |
| Task 5 (Batch D) | critic | 10-15 |
| Task 6 (Cross-Story) | critic | 5-10 |
| Task 7 (Final Report) | main | 3-5 |
| **Total** | - | **48-75 turns** |

## Out of Scope

- Actually fixing the stories (that's a separate workflow)
- Reviewing Epic 1 stories (already implemented)
- Reviewing Epic 3+ stories (not created yet)
- Code review (no code exists yet)

## Risks (Pre-Mortem)

### Tigers (Clear Threats):
- **Review fatigue** (MEDIUM) - 20 stories is a lot
  - Mitigation: Batch reviews, use agents, take breaks between batches
- **False positives** (MEDIUM) - Finding "issues" that aren't real problems
  - Mitigation: Always quote source documents, verify against epics.md

### Elephants (Unspoken Concerns):
- **Stories were auto-generated** (MEDIUM) - May have systematic issues if generated from templates
  - Note: Look for copy-paste patterns, duplicate text across stories
- **Scope creep in stories** - Stories may have expanded beyond original epic intent
  - Note: Compare story scope against epic definition strictly
