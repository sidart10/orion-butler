# ATDD Checklist: 2-5-triage-agent-definition

**Story:** Triage Agent Definition
**Epic:** 2 - Agent & Automation Infrastructure
**Status:** Ready for Testing
**Risk:** HIGH
**Priority:** P0 (Core Feature)

---

## Summary

This checklist validates the Triage Agent implementation, which is responsible for inbox processing and priority scoring. The agent must use Claude's structured outputs for type-safe results, calculate priority scores (0.0-1.0), and extract action items with confidence scores.

---

## AC1: Triage Agent Prompt with Scoring Criteria

**Given** the Triage Agent is invoked (ARCH-012)
**When** it processes inbox items
**Then** it uses structured outputs for type-safe results (ARCH-018)
**And** it calculates priority scores (0.0-1.0)
**And** it extracts action items with confidence scores

### Happy Path Tests

- [ ] **Test 2.5.1.1: Triage prompt file exists and is substantial**
  - Given: The `.claude/agents/triage.md` file exists
  - When: The file is loaded by `loadAgentTemplate('triage')`
  - Then: The file loads successfully
  - And: The prompt content length is > 1000 characters

- [ ] **Test 2.5.1.2: Prompt includes priority scoring instructions**
  - Given: The triage agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It contains instructions for priority scoring (regex: `/priority.*score/i`)
  - And: It specifies the 0.0-1.0 range (regex: `/0\.0.*1\.0|0-1/i`)

- [ ] **Test 2.5.1.3: Prompt includes category classification logic**
  - Given: The triage agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions category types (`urgent`, `important`, `fyi`, `newsletter`)
  - And: It provides classification criteria for each category

- [ ] **Test 2.5.1.4: Prompt includes action extraction instructions**
  - Given: The triage agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It contains instructions for extracting actions (regex: `/extract.*action|action.*item/i`)
  - And: It requires confidence scores for extracted tasks

- [ ] **Test 2.5.1.5: Prompt documents all priority factors**
  - Given: The triage agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It documents sender importance factor
  - And: It documents urgency signals factor
  - And: It documents action required factor
  - And: It documents staleness factor

### Edge Cases

- [ ] **Test 2.5.1.6: Prompt handles empty template gracefully**
  - Given: An attempt to load a non-existent agent template
  - When: `loadAgentTemplate('nonexistent')` is called
  - Then: A descriptive error is thrown
  - And: The error includes the template name attempted

- [ ] **Test 2.5.1.7: Template variable interpolation works**
  - Given: The triage agent template with placeholders ({{user_name}}, {{current_date}}, {{timezone}})
  - When: `interpolateTemplate()` is called with context variables
  - Then: All placeholders are replaced with actual values
  - And: No raw `{{variable}}` patterns remain in output

### Error Handling

- [ ] **Test 2.5.1.8: Missing prompt file throws clear error**
  - Given: The triage agent prompt file is missing
  - When: The agent attempts to initialize
  - Then: An error is thrown with message indicating file not found
  - And: The error includes the expected file path

---

## AC2: TriageResult Schema Validation

**Given** the Triage Agent analyzes an email
**When** analysis completes
**Then** results include: priority, category, suggested actions, extracted tasks
**And** results are validated against the TriageResult schema

### Happy Path Tests

- [ ] **Test 2.5.2.1: Valid TriageResult parses successfully**
  - Given: A well-formed TriageResult object with all required fields
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Parsing succeeds without errors
  - And: All fields are correctly typed

- [ ] **Test 2.5.2.2: Schema includes all required fields**
  - Given: The TriageResultSchema definition
  - When: Schema structure is inspected
  - Then: It includes `item_id` (string)
  - And: It includes `priority_score` (number, 0.0-1.0)
  - And: It includes `priority_band` (enum: 'high' | 'medium' | 'low' | 'minimal')
  - And: It includes `priority_reasoning` (string)
  - And: It includes `suggested_actions` (array)
  - And: It includes `extracted_tasks` (array of ExtractedTask)
  - And: It includes `category` (string)

- [ ] **Test 2.5.2.3: Schema includes optional entity link fields**
  - Given: The TriageResultSchema definition
  - When: Schema structure is inspected
  - Then: It includes optional `from_contact_id` (string)
  - And: It includes `from_contact_confidence` (enum: 'high' | 'medium' | 'low')
  - And: It includes optional `related_project_id` (string)
  - And: It includes `related_project_confidence` (enum: 'high' | 'medium' | 'low')
  - And: It includes optional `related_area` (string)

- [ ] **Test 2.5.2.4: Valid mock data passes schema validation**
  - Given: TRIAGE_MOCKS.urgent_client_email mock data
  - When: `TriageResultSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.5.2.5: Newsletter mock data passes schema validation**
  - Given: TRIAGE_MOCKS.newsletter_email mock data
  - When: `TriageResultSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.5.2.6: Colleague request mock data passes schema validation**
  - Given: TRIAGE_MOCKS.colleague_request mock data
  - When: `TriageResultSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

### Edge Cases

- [ ] **Test 2.5.2.7: Priority score at boundary 0.0 is valid**
  - Given: A TriageResult with `priority_score: 0.0`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Parsing succeeds (0.0 is valid minimum)

- [ ] **Test 2.5.2.8: Priority score at boundary 1.0 is valid**
  - Given: A TriageResult with `priority_score: 1.0`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Parsing succeeds (1.0 is valid maximum)

- [ ] **Test 2.5.2.9: Empty suggested_actions array is valid**
  - Given: A TriageResult with `suggested_actions: []`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Parsing succeeds (empty array is valid)

- [ ] **Test 2.5.2.10: Empty extracted_tasks array is valid**
  - Given: A TriageResult with `extracted_tasks: []`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Parsing succeeds (newsletters may have no tasks)

- [ ] **Test 2.5.2.11: Result with all optional fields omitted is valid**
  - Given: A TriageResult with only required fields (no from_contact_id, related_project_id, etc.)
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Parsing succeeds

### Error Handling

- [ ] **Test 2.5.2.12: Priority score above 1.0 throws validation error**
  - Given: A TriageResult with `priority_score: 1.5`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error message indicates value exceeds maximum

- [ ] **Test 2.5.2.13: Priority score below 0.0 throws validation error**
  - Given: A TriageResult with `priority_score: -0.1`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error message indicates value below minimum

- [ ] **Test 2.5.2.14: Invalid priority_band value throws error**
  - Given: A TriageResult with `priority_band: 'critical'` (not in enum)
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid enum values

- [ ] **Test 2.5.2.15: Invalid suggested_actions value throws error**
  - Given: A TriageResult with `suggested_actions: ['invalid_action']`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown

- [ ] **Test 2.5.2.16: Missing required field throws error**
  - Given: A TriageResult missing `item_id`
  - When: `TriageResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error identifies the missing field

---

## AC3: Structured Output Integration

**Given** the Triage Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the schema
**And** Claude's structured output feature is used with `json_schema` response format

### Happy Path Tests

- [ ] **Test 2.5.3.1: Agent uses correct response_format in Claude API call**
  - Given: The TriageAgent is initialized
  - When: `analyzeEmail()` is called
  - Then: The Claude API call includes `response_format.type === 'json_schema'`
  - And: The `json_schema.name === 'triage_result'`
  - And: The `json_schema.strict === true`

- [ ] **Test 2.5.3.2: Zod schema is converted to JSON Schema**
  - Given: The TriageResultSchema Zod definition
  - When: `zodToJsonSchema(TriageResultSchema)` is called
  - Then: A valid JSON Schema object is returned
  - And: The JSON Schema can be passed to Claude's API

- [ ] **Test 2.5.3.3: Beta header is included in API requests**
  - Given: The TriageAgent makes a Claude API call
  - When: The request is sent
  - Then: Headers include `anthropic-beta: structured-outputs-2025-11-13`

- [ ] **Test 2.5.3.4: Response is parsed with JSON.parse and validated**
  - Given: Claude returns a structured output response
  - When: The response is processed by TriageAgent
  - Then: `JSON.parse()` is called on the text content
  - And: The parsed object is validated with `TriageResultSchema.parse()`
  - And: The validated result is returned with correct TypeScript type

- [ ] **Test 2.5.3.5: Integration test - mocked Claude returns valid structured output**
  - Given: Claude SDK is mocked to return TRIAGE_MOCKS.urgent_client_email
  - When: TriageAgent.analyzeEmail() is called with a test email
  - Then: The result matches the mock data
  - And: The result passes schema validation

### Edge Cases

- [ ] **Test 2.5.3.6: Agent handles missing text block in response**
  - Given: Claude returns a response with no text block (only tool_use blocks)
  - When: The response is processed
  - Then: An error is thrown with message "No text response from Claude"

- [ ] **Test 2.5.3.7: Agent handles empty response content array**
  - Given: Claude returns a response with empty content array
  - When: The response is processed
  - Then: An error is thrown with descriptive message

### Error Handling

- [ ] **Test 2.5.3.8: Malformed JSON in response throws parse error**
  - Given: Claude returns invalid JSON in text block
  - When: `JSON.parse()` is called
  - Then: A JSON parse error is thrown
  - And: The error is caught and re-thrown with context

- [ ] **Test 2.5.3.9: Valid JSON but invalid schema throws validation error**
  - Given: Claude returns valid JSON that doesn't match TriageResultSchema
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error includes details about which fields failed

---

## AC4: Extracted Tasks with Confidence

**Given** the Triage Agent extracts action items from an email
**When** tasks are returned
**Then** each task includes a confidence score (0.0-1.0)
**And** tasks are structured with: description, due_date (optional), priority, confidence

### Happy Path Tests

- [ ] **Test 2.5.4.1: ExtractedTask schema validates correctly**
  - Given: A valid ExtractedTask object
  - When: `ExtractedTaskSchema.parse(task)` is called
  - Then: Parsing succeeds
  - And: Object has `description` (string)
  - And: Object has `priority` (enum: 'high' | 'medium' | 'low')
  - And: Object has `confidence` (number, 0.0-1.0)

- [ ] **Test 2.5.4.2: ExtractedTask with due_date validates**
  - Given: An ExtractedTask with optional `due_date` field set
  - When: `ExtractedTaskSchema.parse(task)` is called
  - Then: Parsing succeeds
  - And: `due_date` is a valid string

- [ ] **Test 2.5.4.3: ExtractedTask without due_date validates**
  - Given: An ExtractedTask without the `due_date` field
  - When: `ExtractedTaskSchema.parse(task)` is called
  - Then: Parsing succeeds (due_date is optional)

- [ ] **Test 2.5.4.4: High confidence task (0.92) validates**
  - Given: An ExtractedTask with `confidence: 0.92`
  - When: Schema validation is performed
  - Then: Validation succeeds
  - And: Confidence value is preserved

- [ ] **Test 2.5.4.5: Low confidence task (0.15) validates**
  - Given: An ExtractedTask with `confidence: 0.15`
  - When: Schema validation is performed
  - Then: Validation succeeds

- [ ] **Test 2.5.4.6: Multiple tasks can be extracted from single email**
  - Given: TRIAGE_MOCKS with multiple extracted_tasks
  - When: TriageResultSchema.parse() is called
  - Then: All tasks in the array are validated
  - And: Each task has required fields

- [ ] **Test 2.5.4.7: Urgent email mock has high-confidence task**
  - Given: TRIAGE_MOCKS.urgent_client_email
  - When: extracted_tasks are inspected
  - Then: At least one task exists
  - And: Task confidence is >= 0.9 (explicit request in email)

### Edge Cases

- [ ] **Test 2.5.4.8: Confidence at boundary 0.0 is valid**
  - Given: An ExtractedTask with `confidence: 0.0`
  - When: Schema validation is performed
  - Then: Validation succeeds (uncertain extraction is valid)

- [ ] **Test 2.5.4.9: Confidence at boundary 1.0 is valid**
  - Given: An ExtractedTask with `confidence: 1.0`
  - When: Schema validation is performed
  - Then: Validation succeeds (explicit request)

- [ ] **Test 2.5.4.10: Newsletter email has empty extracted_tasks**
  - Given: TRIAGE_MOCKS.newsletter_email
  - When: extracted_tasks are inspected
  - Then: Array is empty (no actions to extract from newsletter)

### Error Handling

- [ ] **Test 2.5.4.11: Task confidence above 1.0 throws error**
  - Given: An ExtractedTask with `confidence: 1.5`
  - When: Schema validation is performed
  - Then: Validation error is thrown

- [ ] **Test 2.5.4.12: Task confidence below 0.0 throws error**
  - Given: An ExtractedTask with `confidence: -0.1`
  - When: Schema validation is performed
  - Then: Validation error is thrown

- [ ] **Test 2.5.4.13: Task with invalid priority enum throws error**
  - Given: An ExtractedTask with `priority: 'critical'` (not in enum)
  - When: Schema validation is performed
  - Then: Validation error is thrown
  - And: Error lists valid priorities: 'high', 'medium', 'low'

- [ ] **Test 2.5.4.14: Task missing description throws error**
  - Given: An ExtractedTask without `description` field
  - When: Schema validation is performed
  - Then: Validation error is thrown
  - And: Error identifies missing required field

---

## Integration Test Scenarios

### Triage Agent End-to-End Flow

- [ ] **Test 2.5.INT.1: Triage agent processes urgent client email**
  - Given: Mocked Claude SDK returning urgent_client_email response
  - When: TriageAgent.analyzeEmail() is called with urgent email data
  - Then: Result has priority_score > 0.9
  - And: Result has priority_band === 'high'
  - And: Result has category === 'urgent'
  - And: Result has suggested_actions containing 'reply_urgent'
  - And: Result has at least one extracted task with high confidence

- [ ] **Test 2.5.INT.2: Triage agent processes newsletter email**
  - Given: Mocked Claude SDK returning newsletter_email response
  - When: TriageAgent.analyzeEmail() is called with newsletter data
  - Then: Result has priority_score < 0.2
  - And: Result has priority_band === 'minimal'
  - And: Result has category === 'newsletter'
  - And: Result has suggested_actions containing 'archive'
  - And: Result has empty extracted_tasks array

- [ ] **Test 2.5.INT.3: Triage agent processes colleague request**
  - Given: Mocked Claude SDK returning colleague_request response
  - When: TriageAgent.analyzeEmail() is called with colleague email
  - Then: Result has priority_score between 0.5 and 0.8
  - And: Result has priority_band === 'medium'
  - And: Result has needs_response === true
  - And: Result has extracted task for scheduling

- [ ] **Test 2.5.INT.4: TriageAgent.initialize() loads template successfully**
  - Given: Valid triage.md template file exists
  - When: TriageAgent.initialize() is called
  - Then: No errors are thrown
  - And: Agent is ready to process emails

- [ ] **Test 2.5.INT.5: TriageAgent builds correct analysis prompt**
  - Given: An InboxItem with all fields populated
  - And: An AgentContext with projects, contacts, and VIP contacts
  - When: buildAnalysisPrompt() is called
  - Then: Prompt includes item ID
  - And: Prompt includes sender information
  - And: Prompt includes email content
  - And: Prompt includes context (active projects, known contacts, VIP contacts)

---

## Test File Mapping

| Test ID | File Location | Test Type |
|---------|--------------|-----------|
| 2.5.1.* | `tests/unit/story-2.5-triage.spec.ts` | Unit |
| 2.5.2.* | `tests/unit/story-2.5-triage.spec.ts` | Unit |
| 2.5.3.* | `tests/integration/story-2.5-triage-output.spec.ts` | Integration |
| 2.5.4.* | `tests/unit/story-2.5-triage.spec.ts` | Unit |
| 2.5.INT.* | `tests/integration/story-2.5-triage-output.spec.ts` | Integration |

---

## Mock Data Requirements

### Required Mock Files

- [ ] `tests/mocks/agents/triage.ts` - TRIAGE_MOCKS export
  - `urgent_client_email` - High priority, VIP sender, extracted tasks
  - `newsletter_email` - Low priority, no actions, archive suggestion
  - `colleague_request` - Medium priority, meeting suggestion, extracted task

### Mock Schema Alignment

All mocks MUST use `priority_score` (not `priority`) to match TriageResultSchema definition per Story Dev Notes.

---

## Coverage Requirements

| Acceptance Criteria | Happy Path | Edge Cases | Error Handling | Total |
|---------------------|------------|------------|----------------|-------|
| AC1: Prompt Criteria | 5 | 2 | 1 | 8 |
| AC2: Schema Validation | 6 | 5 | 5 | 16 |
| AC3: Structured Output | 5 | 2 | 2 | 9 |
| AC4: Task Confidence | 7 | 3 | 4 | 14 |
| **Total** | **23** | **12** | **12** | **47** |

---

## Dependencies

### Upstream (must be done first)

- Story 2.2 (Agent Prompt Templates) - `loadAgentTemplate()` function must be implemented
- `.claude/agents/triage.md` - Agent prompt file must exist (197 lines, pure markdown)

### Test Infrastructure

- `zod` package for schema validation
- `zod-to-json-schema` package for Claude API integration
- Vitest for test execution
- Mock infrastructure from `tests/mocks/agents/`

---

## Gate Criteria

Story 2.5 is complete when:

- [ ] All 47 test scenarios pass
- [ ] Code coverage >= 80% on `agent-server/src/agents/triage/`
- [ ] Code coverage >= 80% on `agent-server/src/agents/schemas/triage.ts`
- [ ] Integration tests run with mocked Claude (no flakiness)
- [ ] Schema exports are available from `agent-server/src/agents/schemas/index.ts`
- [ ] Mock data exports are available from `tests/mocks/agents/index.ts`

---

**Document Generated:** 2026-01-15
**Generated By:** TEA (Test Architect Agent) - ATDD Workflow Step 3
**Source Story:** `thoughts/implementation-artifacts/stories/story-2-5-triage-agent-definition.md`
**Test Design Reference:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.5 section)
