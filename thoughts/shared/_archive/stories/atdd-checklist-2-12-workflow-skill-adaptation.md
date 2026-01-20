# ATDD Checklist: 2-12-workflow-skill-adaptation

**Story:** Story 2.12: Workflow Skill Adaptation
**Status:** ready-for-testing
**Generated:** 2026-01-15
**Author:** TEA (Test Architect Agent)

---

## Summary

This checklist covers test scenarios for adapting workflow skills for personal productivity, enabling users to execute complex multi-step tasks with single commands. The story implements 8 workflow skills (triage, organize, weekly-review, draft, schedule, followup, delegate, archive) with structured outputs.

---

## AC1: Triage Workflow Skill

**Acceptance Criterion:** Given I invoke `/triage`, when the Triage workflow executes, then it fetches unprocessed inbox items, scores them by priority (0.0-1.0), suggests filing and response actions, and presents results in the canvas.

### Happy Path

- [ ] **Test 2.12.1.1: Triage returns prioritized inbox items**
  - Given: User invokes `/triage` command
  - When: The TriageWorkflow.execute() is called with inbox items
  - Then: Returns BatchTriageResult with items sorted by priority score
  - Automation: Vitest integration test

- [ ] **Test 2.12.1.2: Priority scores are correctly bounded**
  - Given: Mock Claude response with triage results
  - When: Results are validated against TriageResultSchema
  - Then: All priority scores are between 0.0 and 1.0 inclusive
  - Automation: Vitest unit test

- [ ] **Test 2.12.1.3: Triage extracts action items with confidence**
  - Given: Email containing actionable content
  - When: Triage analyzes the email
  - Then: extractedTasks array populated with tasks containing title, confidence, and source
  - Automation: Vitest integration test

- [ ] **Test 2.12.1.4: Filing recommendations generated**
  - Given: Analyzed inbox items
  - When: Triage completes processing
  - Then: Each result includes filingRecommendation with type, targetId, and confidence
  - Automation: Vitest integration test

### Edge Cases

- [ ] **Test 2.12.1.5: Empty inbox returns empty results**
  - Given: User has no unprocessed inbox items
  - When: `/triage` is invoked
  - Then: Returns BatchTriageResult with items: [], totalProcessed: 0, urgentCount: 0, actionItemCount: 0
  - Automation: Vitest unit test

- [ ] **Test 2.12.1.6: Handles malformed email content gracefully**
  - Given: Email with missing subject or body
  - When: Triage processes the email
  - Then: Assigns default priority (0.5, "normal") and logs warning
  - Automation: Vitest integration test

- [ ] **Test 2.12.1.7: Truncates excessively long email bodies**
  - Given: Email body exceeds 2000 characters
  - When: Building user prompt for Claude
  - Then: Body is truncated with "...(truncated)" suffix
  - Automation: Vitest unit test

- [ ] **Test 2.12.1.8: Handles batch of 50+ emails**
  - Given: Large inbox with 50+ unprocessed items
  - When: Triage executes
  - Then: Processes all items without timeout, returns complete results
  - Automation: Vitest integration test

### Error Handling

- [ ] **Test 2.12.1.9: Invalid Claude response triggers parse error**
  - Given: Claude returns non-JSON response
  - When: Response parsing is attempted
  - Then: Throws Error with message "Failed to parse triage results"
  - Automation: Vitest unit test

- [ ] **Test 2.12.1.10: Schema validation rejects out-of-bounds priority**
  - Given: TriageResult with priority > 1.0
  - When: TriageResultSchema.parse() is called
  - Then: Throws ZodError with priority constraint message
  - Automation: Vitest unit test

- [ ] **Test 2.12.1.11: Invalid category enum rejected**
  - Given: TriageResult with category: "invalid"
  - When: TriageCategoryEnum validation runs
  - Then: Throws ZodError - category must be urgent|important|normal|low|fyi
  - Automation: Vitest unit test

---

## AC2: Organize Workflow Skill

**Acceptance Criterion:** Given I invoke `/organize [item]`, when the Organize workflow executes, then it analyzes the item content, suggests PARA category (Project/Area/Resource/Archive), and offers to file with one click.

### Happy Path

- [ ] **Test 2.12.2.1: Organize suggests correct PARA category**
  - Given: Item with content referencing active project work
  - When: OrganizeWorkflow.execute() is called
  - Then: Returns OrganizeResult with suggestedCategory: "project" and confidence > 0.5
  - Automation: Vitest integration test

- [ ] **Test 2.12.2.2: Organize provides rationale for suggestion**
  - Given: Any item to organize
  - When: Organization completes
  - Then: Result includes non-empty rationale string explaining the categorization
  - Automation: Vitest unit test

- [ ] **Test 2.12.2.3: Organize includes alternative categories**
  - Given: Item with ambiguous categorization
  - When: Organization completes
  - Then: alternativeCategories array contains other options with confidence and reason
  - Automation: Vitest integration test

- [ ] **Test 2.12.2.4: Organize handles all item types**
  - Given: Items of type email, task, document, note
  - When: Each is processed by OrganizeWorkflow
  - Then: All return valid OrganizeResult
  - Automation: Vitest parameterized test

### Edge Cases

- [ ] **Test 2.12.2.5: Handles item with minimal content**
  - Given: Item with only title, no body
  - When: Organize analyzes the item
  - Then: Returns result based on title alone, confidence < 0.5
  - Automation: Vitest unit test

- [ ] **Test 2.12.2.6: Handles very long content**
  - Given: Document content exceeds 3000 characters
  - When: Building user prompt
  - Then: Content truncated with suffix, analysis still completes
  - Automation: Vitest unit test

- [ ] **Test 2.12.2.7: Utilizes existing PARA structure context**
  - Given: SkillContext contains existing projects and areas
  - When: Organize runs
  - Then: Suggestions reference existing entities by ID when appropriate
  - Automation: Vitest integration test

### Error Handling

- [ ] **Test 2.12.2.8: Invalid item type rejected**
  - Given: ItemToOrganize with type not in enum
  - When: Validation occurs
  - Then: TypeScript compilation error (static check)
  - Automation: tsc type check

- [ ] **Test 2.12.2.9: Schema validates confidence bounds**
  - Given: OrganizeResult with confidence: 1.5
  - When: OrganizeResultSchema.parse() called
  - Then: Throws ZodError - confidence must be 0-1
  - Automation: Vitest unit test

---

## AC3: Weekly Review Workflow Skill

**Acceptance Criterion:** Given I invoke `/weekly-review`, when the Weekly Review workflow executes, then it summarizes completed tasks, identifies overdue items, and suggests priorities for the coming week.

### Happy Path

- [ ] **Test 2.12.3.1: Weekly review returns task counts**
  - Given: User has task history for the week
  - When: WeeklyReviewWorkflow.execute() is called
  - Then: Returns WeeklyReviewResult with tasksCompleted, tasksOverdue, tasksInProgress
  - Automation: Vitest integration test

- [ ] **Test 2.12.3.2: Upcoming deadlines populated**
  - Given: Tasks with due dates in next 7 days
  - When: Weekly review runs
  - Then: upcomingDeadlines array contains tasks with taskId, title, dueDate
  - Automation: Vitest integration test

- [ ] **Test 2.12.3.3: Suggested priorities are actionable**
  - Given: Weekly review completes
  - When: Result is returned
  - Then: suggestedPriorities contains 3-5 specific, actionable items
  - Automation: Vitest unit test

- [ ] **Test 2.12.3.4: Week summary is coherent narrative**
  - Given: Task data for the week
  - When: Weekly review generates summary
  - Then: weekSummary is non-empty string with > 50 characters
  - Automation: Vitest unit test

### Edge Cases

- [ ] **Test 2.12.3.5: No tasks returns template structure**
  - Given: No task data available in context
  - When: Weekly review runs
  - Then: Returns result with counts = 0 and helpful placeholder summary
  - Automation: Vitest unit test

- [ ] **Test 2.12.3.6: Handles week boundary calculation correctly**
  - Given: Current date is mid-week
  - When: Week date range is calculated
  - Then: weekStartDate is previous Sunday, weekEndDate is upcoming Saturday
  - Automation: Vitest unit test

- [ ] **Test 2.12.3.7: Achievements and blockers are optional**
  - Given: No notable achievements or blockers
  - When: Result is returned
  - Then: achievements and blockers can be undefined or empty arrays
  - Automation: Vitest schema test

### Error Handling

- [ ] **Test 2.12.3.8: Validates date format in result**
  - Given: WeeklyReviewResult with malformed date
  - When: Schema validation runs
  - Then: Accepts ISO date strings (YYYY-MM-DD)
  - Automation: Vitest unit test

---

## AC4: All 8 Workflow Skills Have Valid SKILL.md

**Acceptance Criterion:** Given Orion skill system initializes, when workflow skills are loaded, then each workflow skill has valid SKILL.md with proper frontmatter, and schema validates against SkillMetadataSchema from Story 2.11.

### Happy Path

- [ ] **Test 2.12.4.1: All 8 SKILL.md files exist**
  - Given: Skill directory structure
  - When: Checking for SKILL.md files
  - Then: Files exist at: triage, organize, weekly-review, draft, schedule, followup, delegate, archive
  - Automation: Vitest file existence test

- [ ] **Test 2.12.4.2: Each SKILL.md has valid YAML frontmatter**
  - Given: Each workflow skill SKILL.md file
  - When: parseSkillFrontmatter() is called
  - Then: Returns valid metadata object without parse errors
  - Automation: Vitest parameterized test (8 skills)

- [ ] **Test 2.12.4.3: All frontmatter validates against SkillMetadataSchema**
  - Given: Parsed frontmatter from each skill
  - When: SkillMetadataSchema.parse() is called
  - Then: All 8 skills pass without ZodError
  - Automation: Vitest parameterized test

- [ ] **Test 2.12.4.4: Required fields present in all skills**
  - Given: Each skill's metadata
  - When: Checking for required fields
  - Then: All have: name, description, trigger, category, version, tags, tools
  - Automation: Vitest unit test

- [ ] **Test 2.12.4.5: All workflow skills have category: workflow**
  - Given: All 8 workflow skill metadata
  - When: Checking category field
  - Then: All return category === 'workflow'
  - Automation: Vitest unit test

### Edge Cases

- [ ] **Test 2.12.4.6: Handles SKILL.md with extra fields gracefully**
  - Given: SKILL.md with additional non-standard frontmatter fields
  - When: Parsing and validation occur
  - Then: Extra fields ignored, core fields validated
  - Automation: Vitest unit test

- [ ] **Test 2.12.4.7: Description length validation**
  - Given: Each skill's description
  - When: Checking length
  - Then: All descriptions are >= 10 characters per schema requirement
  - Automation: Vitest unit test

### Error Handling

- [ ] **Test 2.12.4.8: Invalid frontmatter format produces helpful error**
  - Given: SKILL.md with malformed YAML
  - When: parseSkillFrontmatter() is called
  - Then: Throws error with line number and field name
  - Automation: Vitest unit test

---

## AC5: Workflow Results Render in Canvas

**Acceptance Criterion:** Given a workflow skill completes execution, when results are returned, then they are formatted for canvas rendering, and the UI can display structured output.

### Happy Path

- [ ] **Test 2.12.5.1: Triage returns canvasOutput field**
  - Given: TriageWorkflow execution completes
  - When: Result is returned
  - Then: Includes canvasOutput with type: 'triage_results'
  - Automation: Vitest integration test

- [ ] **Test 2.12.5.2: Organize returns canvas-ready output**
  - Given: OrganizeWorkflow execution completes
  - When: Result is returned
  - Then: Includes canvasOutput with type: 'organize_suggestion'
  - Automation: Vitest integration test

- [ ] **Test 2.12.5.3: Weekly review formats for canvas**
  - Given: WeeklyReviewWorkflow execution completes
  - When: Result is returned
  - Then: Includes canvasOutput with type: 'weekly_summary'
  - Automation: Vitest integration test

- [ ] **Test 2.12.5.4: Results serialize to JSON correctly**
  - Given: Any workflow result
  - When: JSON.stringify() is called
  - Then: Produces valid JSON without circular references
  - Automation: Vitest unit test

### Edge Cases

- [ ] **Test 2.12.5.5: Canvas output type is from enum**
  - Given: Any workflow result canvasOutput
  - When: Checking type field
  - Then: Type is one of: triage_results, organize_suggestion, weekly_summary, email_draft, schedule_slots, followup_list, delegate_confirmation, archive_confirmation
  - Automation: Vitest schema test

- [ ] **Test 2.12.5.6: Empty results still have valid canvas structure**
  - Given: Workflow with no data to display
  - When: Canvas output is generated
  - Then: Returns valid structure with empty data arrays
  - Automation: Vitest unit test

### Error Handling

- [ ] **Test 2.12.5.7: Invalid canvas type rejected by schema**
  - Given: CanvasOutput with invalid type
  - When: CanvasOutputTypeEnum validation runs
  - Then: Throws ZodError with valid type options listed
  - Automation: Vitest unit test

---

## Integration Tests

### Cross-Workflow Tests

- [ ] **Test 2.12.INT.1: Triage result feeds into Organize**
  - Given: TriageResult with filing recommendation
  - When: User accepts filing suggestion
  - Then: OrganizeWorkflow receives item and processes correctly
  - Automation: Vitest integration test

- [ ] **Test 2.12.INT.2: Weekly review references triage data**
  - Given: Triaged items from the week
  - When: Weekly review runs
  - Then: Summary includes statistics from triaged emails
  - Automation: Vitest integration test

- [ ] **Test 2.12.INT.3: All workflows use buildCachedPrompt**
  - Given: Any workflow execution
  - When: Claude API is called
  - Then: System prompt is wrapped with cache_control
  - Automation: Vitest spy test

### Mock Tests

- [ ] **Test 2.12.MOCK.1: Mock Triage workflow returns expected structure**
  - Given: createMockTriageWorkflow() factory
  - When: execute() is called
  - Then: Returns MOCK_BATCH_TRIAGE matching BatchTriageResultSchema
  - Automation: Vitest unit test

- [ ] **Test 2.12.MOCK.2: Mock Organize workflow returns expected structure**
  - Given: createMockOrganizeWorkflow() factory
  - When: execute() is called
  - Then: Returns MOCK_ORGANIZE_RESULT matching OrganizeResultSchema
  - Automation: Vitest unit test

- [ ] **Test 2.12.MOCK.3: Mock Weekly Review returns expected structure**
  - Given: createMockWeeklyReviewWorkflow() factory
  - When: execute() is called
  - Then: Returns MOCK_WEEKLY_REVIEW matching WeeklyReviewResultSchema
  - Automation: Vitest unit test

---

## E2E Tests (Vercel Browser Agent)

- [ ] **Test 2.12.E2E.1: User completes triage workflow**
  - Given: User at chat interface
  - When: User types `/triage` and sends
  - Then: Triage results appear in canvas with priority-sorted items
  - Automation: Vercel Browser Agent

- [ ] **Test 2.12.E2E.2: User invokes organize on triaged item**
  - Given: Triage results displayed in canvas
  - When: User clicks organize action on an item
  - Then: Organize modal shows PARA category suggestion
  - Automation: Vercel Browser Agent

- [ ] **Test 2.12.E2E.3: Weekly review renders in canvas**
  - Given: User invokes `/weekly-review`
  - When: Workflow completes
  - Then: Canvas shows summary with task counts, deadlines, and priorities
  - Automation: Vercel Browser Agent

---

## Boundary Conditions

### Schema Boundary Tests

- [ ] **Test 2.12.BOUND.1: Priority exactly 0.0 is valid**
  - Given: TriageResult with priority: 0.0
  - When: Schema validation runs
  - Then: Passes validation (FYI category boundary)
  - Automation: Vitest unit test

- [ ] **Test 2.12.BOUND.2: Priority exactly 1.0 is valid**
  - Given: TriageResult with priority: 1.0
  - When: Schema validation runs
  - Then: Passes validation (urgent category boundary)
  - Automation: Vitest unit test

- [ ] **Test 2.12.BOUND.3: Confidence exactly 0.0 is valid**
  - Given: OrganizeResult with confidence: 0.0
  - When: Schema validation runs
  - Then: Passes validation (minimum confidence)
  - Automation: Vitest unit test

- [ ] **Test 2.12.BOUND.4: Confidence exactly 1.0 is valid**
  - Given: OrganizeResult with confidence: 1.0
  - When: Schema validation runs
  - Then: Passes validation (maximum confidence)
  - Automation: Vitest unit test

---

## Test Coverage Summary

| AC | Happy Path | Edge Cases | Error Handling | Total |
|----|------------|------------|----------------|-------|
| AC1 | 4 | 4 | 3 | 11 |
| AC2 | 4 | 3 | 2 | 9 |
| AC3 | 4 | 3 | 1 | 8 |
| AC4 | 5 | 2 | 1 | 8 |
| AC5 | 4 | 2 | 1 | 7 |
| Integration | - | - | - | 6 |
| E2E | - | - | - | 3 |
| Boundary | - | - | - | 4 |
| **Total** | **21** | **14** | **8** | **56** |

---

## Dependencies

- **Story 2.10:** buildCachedPrompt() utility must be available
- **Story 2.11:** SkillLoader, SkillCatalog, SkillRunner infrastructure must exist
- **test-design-epic-2.md:** Test patterns and mock structures from Section 2.12

---

## Risk Notes

**Medium Risk Items:**
1. Claude response parsing - non-deterministic outputs may require robust error handling
2. Canvas rendering integration - depends on Epic 11 UI components
3. Composio integration stubs - full functionality deferred to Epic 3

**Mitigation:**
- All Claude responses validated against Zod schemas
- Canvas output uses type-safe enums
- Stubs throw clear "Not Implemented" errors pointing to correct epic

---

_Generated by TEA (Test Architect Agent) - 2026-01-15_
