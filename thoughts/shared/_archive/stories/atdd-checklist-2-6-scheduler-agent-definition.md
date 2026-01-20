# ATDD Checklist: 2-6-scheduler-agent-definition

**Story:** Scheduler Agent Definition
**Epic:** 2 - Agent & Automation Infrastructure
**Status:** Ready for Testing
**Risk:** HIGH
**Priority:** P0 (Core Feature)

---

## Summary

This checklist validates the Scheduler Agent implementation, which is responsible for calendar management with availability-aware scheduling. The agent must use Claude's extended thinking for complex scheduling requests, detect conflicts, and propose time slots ranked by suitability score (0.0-1.0). The agent handles scheduling requests by considering existing events, user preferences, travel time, and focus time blocks.

---

## AC1: Scheduler Agent Prompt with Availability Logic

**Given** the Scheduler Agent is invoked (ARCH-013)
**When** it handles a scheduling request
**Then** it provides time proposals with conflict detection and alternative suggestions

### Happy Path Tests

- [ ] **Test 2.6.1.1: Scheduler prompt file exists and is substantial**
  - Given: The `.claude/agents/scheduler.md` file exists
  - When: The file is loaded by `loadAgentTemplate('scheduler')`
  - Then: The file loads successfully
  - And: The prompt content length is > 1000 characters

- [ ] **Test 2.6.1.2: Prompt includes availability checking instructions**
  - Given: The scheduler agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It contains instructions for availability checking (regex: `/availability|free.*busy|calendar.*check/i`)

- [ ] **Test 2.6.1.3: Prompt includes conflict detection logic**
  - Given: The scheduler agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It contains conflict detection instructions (regex: `/conflict/i`)
  - And: It mentions direct overlaps
  - And: It mentions back-to-back meetings (buffer time)
  - And: It mentions focus time violations

- [ ] **Test 2.6.1.4: Prompt includes consideration factors**
  - Given: The scheduler agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions travel time/commute (regex: `/travel.*time|commute|buffer/i`)
  - And: It mentions focus time/deep work (regex: `/focus.*time|deep.*work/i`)
  - And: It mentions user preferences (regex: `/preference/i`)
  - And: It mentions attendee availability

- [ ] **Test 2.6.1.5: Prompt includes proposal ranking criteria**
  - Given: The scheduler agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It documents scoring criteria for proposals
  - And: It mentions all attendees available factor
  - And: It mentions preferred time slot factor
  - And: It mentions no focus time conflict factor
  - And: It mentions adequate buffer factor

### Edge Cases

- [ ] **Test 2.6.1.6: Prompt handles empty template gracefully**
  - Given: An attempt to load a non-existent agent template
  - When: `loadAgentTemplate('nonexistent')` is called
  - Then: A descriptive error is thrown
  - And: The error includes the template name attempted

- [ ] **Test 2.6.1.7: Template variable interpolation works**
  - Given: The scheduler agent template with placeholders ({{user_name}}, {{current_date}}, {{timezone}})
  - When: `interpolateTemplate()` is called with context variables
  - Then: All placeholders are replaced with actual values
  - And: No raw `{{variable}}` patterns remain in output

### Error Handling

- [ ] **Test 2.6.1.8: Missing prompt file throws clear error**
  - Given: The scheduler agent prompt file is missing
  - When: The agent attempts to initialize
  - Then: An error is thrown with message indicating file not found
  - And: The error includes the expected file path

---

## AC2: Extended Thinking Integration

**Given** a scheduling request is complex (multiple attendees, long date range, constraints)
**When** the Scheduler analyzes options
**Then** it activates Claude's extended thinking (ARCH-019)
**And** thinking budget scales from 1,024 (simple) to 15,000 (complex) tokens

### Happy Path Tests

- [ ] **Test 2.6.2.1: Simple request returns base thinking budget**
  - Given: A simple scheduling request (1 attendee, 1 day, 0 constraints)
  - When: `calculateThinkingBudget(request)` is called
  - Then: Budget returned is less than 2,000 tokens
  - And: Budget is at least 1,024 (minimum)

- [ ] **Test 2.6.2.2: Medium request returns medium thinking budget**
  - Given: A medium scheduling request (3 attendees, 7 days, 1 constraint)
  - When: `calculateThinkingBudget(request)` is called
  - Then: Budget returned is greater than 2,000 tokens
  - And: Budget returned is less than 8,000 tokens

- [ ] **Test 2.6.2.3: Complex request returns high thinking budget**
  - Given: A complex scheduling request (5+ attendees, 14 days, 3 constraints)
  - When: `calculateThinkingBudget(request)` is called
  - Then: Budget returned is greater than 8,000 tokens
  - And: Budget returned is less than or equal to 15,000 tokens

- [ ] **Test 2.6.2.4: shouldUseExtendedThinking returns false for simple requests**
  - Given: A simple request (1 attendee AND 1 day AND 0 constraints)
  - When: `shouldUseExtendedThinking(request)` is called
  - Then: Returns `false` (all conditions for skipping are met)

- [ ] **Test 2.6.2.5: shouldUseExtendedThinking returns true for multiple attendees**
  - Given: A request with 2+ attendees (1 day, 0 constraints)
  - When: `shouldUseExtendedThinking(request)` is called
  - Then: Returns `true` (multiple attendees trigger thinking)

- [ ] **Test 2.6.2.6: shouldUseExtendedThinking returns true for multi-day range**
  - Given: A request with 1 attendee, 7 days, 0 constraints
  - When: `shouldUseExtendedThinking(request)` is called
  - Then: Returns `true` (multi-day range triggers thinking)

- [ ] **Test 2.6.2.7: shouldUseExtendedThinking returns true for constraints**
  - Given: A request with 1 attendee, 1 day, 1+ constraints
  - When: `shouldUseExtendedThinking(request)` is called
  - Then: Returns `true` (constraints trigger thinking)

- [ ] **Test 2.6.2.8: Extended thinking config is passed to Claude API**
  - Given: A complex scheduling request that requires extended thinking
  - When: SchedulerAgent makes Claude API call
  - Then: API params include `thinking: { type: 'enabled', budget_tokens: N }` where N > 1024

- [ ] **Test 2.6.2.9: Beta header for extended thinking is included**
  - Given: SchedulerAgent makes a Claude API call with extended thinking
  - When: The request headers are inspected
  - Then: Headers include `anthropic-beta: interleaved-thinking-2025-05-14`

### Edge Cases

- [ ] **Test 2.6.2.10: Thinking budget never exceeds 15,000**
  - Given: An extremely complex request (20 attendees, 30 days, 10 constraints)
  - When: `calculateThinkingBudget(request)` is called
  - Then: Budget returned is exactly 15,000 (capped at maximum)

- [ ] **Test 2.6.2.11: Thinking budget never falls below 1,024**
  - Given: A minimally simple request
  - When: `calculateThinkingBudget(request)` is called
  - Then: Budget returned is at least 1,024 (minimum)

- [ ] **Test 2.6.2.12: Duration > 2 hours adds to thinking budget**
  - Given: A request with duration > 120 minutes
  - When: `calculateThinkingBudget(request)` is called
  - Then: Budget includes +500 for duration complexity

- [ ] **Test 2.6.2.13: Preferred times specified adds to thinking budget**
  - Given: A request with preferredTimes array populated
  - When: `calculateThinkingBudget(request)` is called
  - Then: Budget includes +300 for preferred times complexity

### Error Handling

- [ ] **Test 2.6.2.14: Handles empty attendees array gracefully**
  - Given: A request with `attendees: []`
  - When: `calculateThinkingBudget(request)` is called
  - Then: No error is thrown
  - And: Base budget is returned

- [ ] **Test 2.6.2.15: Handles undefined optional fields gracefully**
  - Given: A request with only required fields (no duration, no preferredTimes)
  - When: `calculateThinkingBudget(request)` is called
  - Then: No error is thrown
  - And: Budget is calculated without optional factors

---

## AC3: Conflict Detection and Alternative Proposals

**Given** a scheduling conflict exists
**When** the Scheduler analyzes options
**Then** it considers: existing events, preferences, travel time, focus blocks
**And** it proposes alternatives ranked by suitability

### Happy Path Tests

- [ ] **Test 2.6.3.1: ConflictInfo schema validates correctly**
  - Given: A valid ConflictInfo object with eventId, title, and overlap
  - When: `ConflictInfoSchema.parse(conflict)` is called
  - Then: Parsing succeeds without errors
  - And: Object has `eventId` (string)
  - And: Object has `title` (string)
  - And: Object has `overlap` with `start` and `end` datetime strings

- [ ] **Test 2.6.3.2: TimeSlot schema validates correctly**
  - Given: A valid TimeSlot object
  - When: `TimeSlotSchema.parse(slot)` is called
  - Then: Parsing succeeds
  - And: Object has `start` (datetime string)
  - And: Object has `end` (datetime string)
  - And: Object has `available` (boolean)
  - And: Object has optional `conflictReason` (string)

- [ ] **Test 2.6.3.3: MeetingProposal schema validates correctly**
  - Given: A valid MeetingProposal object
  - When: `MeetingProposalSchema.parse(proposal)` is called
  - Then: Parsing succeeds
  - And: Object has `id`, `title`, `duration`, `attendees`, `proposedSlots`
  - And: `proposedSlots` is an array of {slot, score, reasoning} objects

- [ ] **Test 2.6.3.4: ProposedSlot score is bounded 0.0-1.0**
  - Given: A MeetingProposal with proposedSlots
  - When: Schema validation is performed
  - Then: Each slot's score is >= 0.0 and <= 1.0

- [ ] **Test 2.6.3.5: Proposals are sorted by score (highest first)**
  - Given: SCHEDULER_MOCKS.propose_meeting mock data
  - When: proposedSlots scores are inspected
  - Then: Scores are in descending order (highest first)

- [ ] **Test 2.6.3.6: Conflict detected mock contains valid conflicts array**
  - Given: SCHEDULER_MOCKS.conflict_detected mock data
  - When: `SchedulerResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds
  - And: `conflicts` array is populated
  - And: Each conflict has overlap with start/end

- [ ] **Test 2.6.3.7: Attendee schema validates correctly**
  - Given: A valid Attendee object with email
  - When: `AttendeeSchema.parse(attendee)` is called
  - Then: Parsing succeeds
  - And: Object has `email` (valid email format)
  - And: Object has optional `name` (string)
  - And: Object has `required` (boolean, default true)

### Edge Cases

- [ ] **Test 2.6.3.8: Score at boundary 0.0 is valid**
  - Given: A proposedSlot with `score: 0.0`
  - When: Schema validation is performed
  - Then: Validation succeeds (worst possible slot is valid)

- [ ] **Test 2.6.3.9: Score at boundary 1.0 is valid**
  - Given: A proposedSlot with `score: 1.0`
  - When: Schema validation is performed
  - Then: Validation succeeds (perfect slot is valid)

- [ ] **Test 2.6.3.10: Empty conflicts array is valid**
  - Given: A SchedulerResponse with `conflicts: []`
  - When: Schema validation is performed
  - Then: Validation succeeds (no conflicts is valid)

- [ ] **Test 2.6.3.11: Optional conferenceType is validated**
  - Given: A MeetingProposal with `conferenceType: 'google_meet'`
  - When: Schema validation is performed
  - Then: Validation succeeds
  - And: Valid values are: 'google_meet', 'zoom', 'in_person', 'phone'

- [ ] **Test 2.6.3.12: MeetingProposal without optional fields validates**
  - Given: A MeetingProposal without location, conferenceType, notes
  - When: Schema validation is performed
  - Then: Validation succeeds (optional fields are optional)

### Error Handling

- [ ] **Test 2.6.3.13: Score above 1.0 throws validation error**
  - Given: A proposedSlot with `score: 1.5`
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error indicates value exceeds maximum

- [ ] **Test 2.6.3.14: Score below 0.0 throws validation error**
  - Given: A proposedSlot with `score: -0.1`
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error indicates value below minimum

- [ ] **Test 2.6.3.15: Invalid conferenceType throws validation error**
  - Given: A MeetingProposal with `conferenceType: 'teams'` (not in enum)
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error lists valid enum values

- [ ] **Test 2.6.3.16: ConflictInfo missing overlap throws error**
  - Given: A ConflictInfo with only eventId and title (no overlap)
  - When: `ConflictInfoSchema.parse(conflict)` is called
  - Then: Validation error is thrown
  - And: Error identifies missing required field

- [ ] **Test 2.6.3.17: Invalid attendee email throws error**
  - Given: An Attendee with `email: 'not-an-email'`
  - When: `AttendeeSchema.parse(attendee)` is called
  - Then: Validation error is thrown
  - And: Error indicates invalid email format

---

## AC4: SchedulerResult Schema Validation

**Given** the Scheduler Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the SchedulerResponseSchema
**And** Claude's extended thinking output is captured for transparency

### Happy Path Tests

- [ ] **Test 2.6.4.1: Valid SchedulerResponse parses successfully**
  - Given: A well-formed SchedulerResponse object with all required fields
  - When: `SchedulerResponseSchema.parse(response)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.6.4.2: Schema includes all action types**
  - Given: The SchedulerResponseSchema definition
  - When: Schema structure is inspected
  - Then: `action` enum includes: 'propose_times', 'create_event', 'reschedule', 'cancel', 'find_availability', 'block_focus_time', 'clarify'

- [ ] **Test 2.6.4.3: Schema includes thinkingNotes field**
  - Given: The SchedulerResponseSchema definition
  - When: Schema structure is inspected
  - Then: It includes optional `thinkingNotes` (string)

- [ ] **Test 2.6.4.4: Propose meeting mock passes validation**
  - Given: SCHEDULER_MOCKS.propose_meeting mock data
  - When: `SchedulerResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.6.4.5: Conflict detected mock passes validation**
  - Given: SCHEDULER_MOCKS.conflict_detected mock data
  - When: `SchedulerResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.6.4.6: Focus time blocked mock passes validation**
  - Given: SCHEDULER_MOCKS.focus_time_blocked mock data
  - When: `SchedulerResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.6.4.7: CreatedEvent structure validates correctly**
  - Given: A SchedulerResponse with `createdEvent` populated
  - When: Schema validation is performed
  - Then: `createdEvent.id` is required string
  - And: `createdEvent.htmlLink` is required URL string
  - And: `createdEvent.hangoutLink` is optional URL string

- [ ] **Test 2.6.4.8: thinkingNotes captured from extended thinking**
  - Given: SCHEDULER_MOCKS.propose_meeting mock with thinkingNotes
  - When: Response is inspected
  - Then: `thinkingNotes` contains summary of reasoning

### Edge Cases

- [ ] **Test 2.6.4.9: Response with only required fields validates**
  - Given: A minimal SchedulerResponse with only `action` field
  - When: Schema validation is performed
  - Then: Validation succeeds (proposal, conflicts, etc. are optional)

- [ ] **Test 2.6.4.10: Clarify action with no proposal validates**
  - Given: A SchedulerResponse with `action: 'clarify'` and no proposal
  - When: Schema validation is performed
  - Then: Validation succeeds (clarify doesn't need proposal)

- [ ] **Test 2.6.4.11: AvailableSlots array can be empty**
  - Given: A SchedulerResponse with `availableSlots: []`
  - When: Schema validation is performed
  - Then: Validation succeeds (no available slots is valid response)

### Error Handling

- [ ] **Test 2.6.4.12: Invalid action value throws error**
  - Given: A SchedulerResponse with `action: 'invalid_action'`
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error lists valid action enum values

- [ ] **Test 2.6.4.13: Invalid htmlLink format throws error**
  - Given: A SchedulerResponse with `createdEvent.htmlLink: 'not-a-url'`
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error indicates invalid URL format

- [ ] **Test 2.6.4.14: Missing action field throws error**
  - Given: A SchedulerResponse without `action` field
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error identifies missing required field

---

## Integration Test Scenarios

### Scheduler Agent End-to-End Flow

- [ ] **Test 2.6.INT.1: Scheduler agent proposes meeting times**
  - Given: Mocked Claude SDK returning propose_meeting response
  - When: SchedulerAgent.handleRequest() is called with a scheduling request
  - Then: Result has `action === 'propose_times'`
  - And: Result has `proposal` with proposedSlots
  - And: Slots are sorted by score (highest first)
  - And: Each slot has reasoning explaining the score

- [ ] **Test 2.6.INT.2: Scheduler agent detects conflicts**
  - Given: Mocked Claude SDK returning conflict_detected response
  - When: SchedulerAgent.handleRequest() is called with conflicting time
  - Then: Result has `conflicts` array populated
  - And: Each conflict includes eventId, title, and overlap
  - And: Alternative times are proposed

- [ ] **Test 2.6.INT.3: Scheduler agent blocks focus time**
  - Given: Mocked Claude SDK returning focus_time_blocked response
  - When: SchedulerAgent.handleRequest() is called for focus time
  - Then: Result has `action === 'block_focus_time'`
  - And: Result has `createdEvent` with id and htmlLink
  - And: Result has `thinkingNotes` explaining the decision

- [ ] **Test 2.6.INT.4: SchedulerAgent.initialize() loads template successfully**
  - Given: Valid scheduler.md template file exists
  - When: SchedulerAgent.initialize() is called
  - Then: No errors are thrown
  - And: Agent is ready to handle requests

- [ ] **Test 2.6.INT.5: Extended thinking activates for complex request**
  - Given: A complex request (5 attendees, 14 days, multiple constraints)
  - When: SchedulerAgent makes Claude API call
  - Then: API params include `thinking` configuration
  - And: `thinking.budget_tokens` is > 8,000

- [ ] **Test 2.6.INT.6: Extended thinking skipped for simple request**
  - Given: A simple request (1 attendee, 1 day, no constraints)
  - When: SchedulerAgent makes Claude API call
  - Then: API params do NOT include `thinking` configuration (saves tokens)

- [ ] **Test 2.6.INT.7: Scheduler builds correct prompt with context**
  - Given: A SchedulingRequest with attendees, date range, constraints
  - And: Existing calendar events provided
  - And: User preferences from context
  - When: buildSchedulingPrompt() is called
  - Then: Prompt includes attendee information
  - And: Prompt includes date range
  - And: Prompt includes existing events for conflict detection
  - And: Prompt includes user preferences

---

## Test File Mapping

| Test ID | File Location | Test Type |
|---------|--------------|-----------|
| 2.6.1.* | `tests/unit/story-2.6-scheduler.spec.ts` | Unit |
| 2.6.2.* | `tests/unit/story-2.6-scheduler.spec.ts` | Unit |
| 2.6.3.* | `tests/unit/story-2.6-scheduler.spec.ts` | Unit |
| 2.6.4.* | `tests/unit/story-2.6-scheduler.spec.ts` | Unit |
| 2.6.INT.* | `tests/integration/story-2.6-scheduler-extended-thinking.spec.ts` | Integration |

---

## Mock Data Requirements

### Required Mock Files

- [ ] `tests/mocks/agents/scheduler.ts` - SCHEDULER_MOCKS export
  - `propose_meeting` - Successful proposal with no conflicts, multiple ranked slots
  - `conflict_detected` - Conflict found with alternative proposals
  - `focus_time_blocked` - Focus time creation with thinkingNotes

### Mock Schema Alignment

All mocks MUST align with SchedulerResponseSchema using:
- `proposedSlots: { slot: TimeSlot, score: number, reasoning: string }[]` structure
- `conflicts: { eventId, title, overlap: { start, end } }[]` structure (overlap object, not individual fields)
- Scores in 0.0-1.0 range, sorted descending

---

## Coverage Requirements

| Acceptance Criteria | Happy Path | Edge Cases | Error Handling | Total |
|---------------------|------------|------------|----------------|-------|
| AC1: Prompt Logic | 5 | 2 | 1 | 8 |
| AC2: Extended Thinking | 9 | 4 | 2 | 15 |
| AC3: Conflict Detection | 7 | 5 | 5 | 17 |
| AC4: Schema Validation | 8 | 3 | 3 | 14 |
| **Total** | **29** | **14** | **11** | **54** |

**Integration Tests:** 7 additional tests

---

## Dependencies

### Upstream (must be done first)

- Story 2.2 (Agent Prompt Templates) - `loadAgentTemplate()` function must be implemented
- Story 2.5 (Triage Agent Definition) - Pattern reference for agent class structure
- `.claude/agents/scheduler.md` - Agent prompt file must exist (pure markdown, > 1000 chars)

### Test Infrastructure

- `zod` package for schema validation
- `zod-to-json-schema` package for Claude API integration
- Vitest for test execution
- Mock infrastructure from `tests/mocks/agents/`

---

## Implementation Checklist for DEV

### Task 1: Create Scheduler Agent Prompt (AC1)

- [ ] Create `.claude/agents/scheduler.md` (pure markdown, no frontmatter)
- [ ] Include availability checking instructions
- [ ] Include conflict detection logic (overlaps, buffer time, focus blocks)
- [ ] Include consideration factors (travel time, preferences, attendees)
- [ ] Include proposal ranking criteria with scoring factors
- [ ] Verify prompt length > 1000 characters
- [ ] Run tests: `npm run test -- tests/unit/story-2.6-scheduler.spec.ts --grep "AC1"`

### Task 2: Create Scheduler Schema Definitions (AC3, AC4)

- [ ] Create `agent-server/src/agents/schemas/scheduler.ts`
- [ ] Define TimeSlotSchema
- [ ] Define AttendeeSchema
- [ ] Define MeetingProposalSchema with nested proposedSlots
- [ ] Define ConflictInfoSchema with overlap object
- [ ] Define SchedulerResponseSchema with all action types
- [ ] Export types from `agent-server/src/agents/schemas/index.ts`
- [ ] Run tests: `npm run test -- tests/unit/story-2.6-scheduler.spec.ts --grep "AC3|AC4"`

### Task 3: Implement Thinking Budget Calculator (AC2)

- [ ] Create `agent-server/src/agents/scheduler/thinking.ts`
- [ ] Implement `calculateThinkingBudget(request)` function
- [ ] Implement `shouldUseExtendedThinking(request)` function
- [ ] Budget scaling: base 1024, max 15000
- [ ] Factors: attendees (+500 each), days (+200 each), constraints (+1000 each)
- [ ] Run tests: `npm run test -- tests/unit/story-2.6-scheduler.spec.ts --grep "AC2"`

### Task 4: Implement Scheduler Agent Class (AC1-4)

- [ ] Create `agent-server/src/agents/scheduler/index.ts`
- [ ] Implement `initialize()` to load template
- [ ] Implement `handleRequest()` with extended thinking integration
- [ ] Implement `buildSchedulingPrompt()` helper
- [ ] Implement `summarizeThinking()` helper
- [ ] Export from `agent-server/src/agents/index.ts`
- [ ] Run integration tests: `npm run test -- tests/integration/story-2.6-scheduler-extended-thinking.spec.ts`

### Task 5: Create Test Mocks

- [ ] Create `tests/mocks/agents/scheduler.ts`
- [ ] Implement SCHEDULER_MOCKS.propose_meeting
- [ ] Implement SCHEDULER_MOCKS.conflict_detected
- [ ] Implement SCHEDULER_MOCKS.focus_time_blocked
- [ ] Export from `tests/mocks/agents/index.ts`

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test -- tests/unit/story-2.6-scheduler.spec.ts tests/integration/story-2.6-scheduler-extended-thinking.spec.ts

# Run specific AC tests
npm run test -- tests/unit/story-2.6-scheduler.spec.ts --grep "AC1"
npm run test -- tests/unit/story-2.6-scheduler.spec.ts --grep "AC2"
npm run test -- tests/unit/story-2.6-scheduler.spec.ts --grep "AC3"
npm run test -- tests/unit/story-2.6-scheduler.spec.ts --grep "AC4"

# Run integration tests only
npm run test -- tests/integration/story-2.6-scheduler-extended-thinking.spec.ts

# Run tests with coverage
npm run test -- --coverage --coverage.include="agent-server/src/agents/scheduler/**"

# Debug specific test
npm run test -- tests/unit/story-2.6-scheduler.spec.ts --debug --grep "2.6.1.1"
```

---

## Gate Criteria

Story 2.6 is complete when:

- [ ] All 61 test scenarios pass (54 unit + 7 integration)
- [ ] Code coverage >= 80% on `agent-server/src/agents/scheduler/`
- [ ] Code coverage >= 80% on `agent-server/src/agents/schemas/scheduler.ts`
- [ ] Extended thinking correctly activates only for complex requests
- [ ] All mock data exports available from `tests/mocks/agents/index.ts`
- [ ] Schema exports available from `agent-server/src/agents/schemas/index.ts`
- [ ] Integration tests run with mocked Claude (no flakiness)

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown
- **data-factories.md** - Factory patterns using `@faker-js/faker`
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test)
- **test-levels-framework.md** - Test level selection (unit vs integration)
- **component-tdd.md** - Red-green-refactor cycle

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Notes

- **Extended Thinking Pattern**: The Scheduler Agent is the first agent to use Claude's extended thinking feature. Follow the pattern in architecture.md section 6.8 for the beta header and thinking configuration.
- **Calendar Integration**: Real calendar integration happens in Epic 6. For Story 2.6, mock calendar data is used.
- **Agent Model**: Scheduler uses Sonnet (per Story 2.2 AGENT_MODELS constant) for good balance of speed and quality.
- **Combined Beta Headers**: If using structured outputs AND extended thinking, combine headers: `anthropic-beta: structured-outputs-2025-11-13,interleaved-thinking-2025-05-14`

---

**Document Generated:** 2026-01-15
**Generated By:** TEA (Test Architect Agent) - ATDD Workflow
**Source Story:** `thoughts/implementation-artifacts/stories/story-2-6-scheduler-agent-definition.md`
**Test Design Reference:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.6 section)
