# ATDD Checklist: 2-9-preference-learner-agent-definition

**Story:** 2.9 - Preference Learner Agent Definition
**Epic:** 2 - Agent & Automation Infrastructure
**Generated:** 2026-01-15
**Author:** TEA (Test Architect Agent)

---

## Test Strategy Summary

| Metric | Value |
|--------|-------|
| Acceptance Criteria | 5 |
| Total Test Cases | 27 |
| Unit Tests | 15 |
| Integration Tests | 10 |
| E2E Tests | 2 |
| Risk Level | MEDIUM |

**Key Testing Concerns:**
- Claude API non-determinism (C-001) - Mock all Claude responses
- Confidence scoring algorithm accuracy
- Evidence pruning and audit trail preservation
- Cross-agent preference injection

---

## AC1: Preference Learner Agent Prompt with Pattern Detection

**Given** the Preference Learner Agent observes my behavior (ARCH-016)
**When** it detects a pattern
**Then** it records the preference with source (observed vs explicit)
**And** it stores confidence level based on repetition

### Happy Path

- [ ] **Test 2.9.1.1** - Prompt template loads and parses correctly
  - **Given:** `.claude/agents/preference-learner.md` exists
  - **When:** `loadAgentTemplate('preference-learner')` is called
  - **Then:** Returns valid template object with name, description, systemPrompt
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.1.2** - Prompt includes pattern detection instructions
  - **Given:** Preference Learner template is loaded
  - **When:** Inspecting systemPrompt content
  - **Then:** Contains keywords: `pattern`, `behavior`, `habit`, `observe`, `detect`, `learn`
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.1.3** - Prompt includes confidence scoring guidelines
  - **Given:** Preference Learner template is loaded
  - **When:** Inspecting systemPrompt content
  - **Then:** Contains confidence progression rules (0.3 -> 0.5 -> 0.65+)
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.1.4** - Prompt includes all preference categories
  - **Given:** Preference Learner template is loaded
  - **When:** Inspecting systemPrompt content
  - **Then:** Contains all categories: `scheduling_preference`, `communication_preference`, `organization_preference`, `notification_preference`
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.1.5** - Prompt length exceeds 1000 characters
  - **Given:** Preference Learner template is loaded
  - **When:** Checking systemPrompt.length
  - **Then:** Length > 1000 characters (core agent requirement from Story 2.2)
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

### Edge Cases

- [ ] **Test 2.9.1.6** - Prompt distinguishes observed vs explicit preferences
  - **Given:** Template contains source classification instructions
  - **When:** Inspecting systemPrompt
  - **Then:** Contains clear definitions for `explicit`, `observed`, `default` sources
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

### Error Handling

- [ ] **Test 2.9.1.7** - Missing template file returns helpful error
  - **Given:** No preference-learner.md exists
  - **When:** `loadAgentTemplate('preference-learner')` is called
  - **Then:** Throws error with clear message about missing file path
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

---

## AC2: Confidence-Based Learning from Repeated Behavior

**Given** repeated user actions are observed
**When** the Preference Learner detects a pattern
**Then** confidence increases with each supporting observation
**And** confidence decreases if contradicting behavior is observed

### Happy Path

- [ ] **Test 2.9.2.1** - LearnedPreferenceSchema includes all required fields
  - **Given:** Valid preference data matching mock
  - **When:** `LearnedPreferenceSchema.parse(data)` is called
  - **Then:** Parses successfully with id, category, preference, confidence, source, observationCount, evidence, lastUpdated
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.2.2** - Confidence is bounded 0.0-1.0
  - **Given:** Various mock preferences
  - **When:** Checking confidence field
  - **Then:** All confidence values satisfy: `0.0 <= confidence <= 1.0`
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.2.3** - First observed preference starts at 0.3 confidence
  - **Given:** First observation of a pattern (observationCount === 1)
  - **When:** Preference is stored
  - **Then:** confidence === 0.3 (for observed preferences)
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.2.4** - Confidence increases with repeated observations
  - **Given:** Existing preference with observationCount=1, confidence=0.3
  - **When:** Second supporting observation recorded
  - **Then:** Confidence increases to ~0.5, observationCount=2
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

- [ ] **Test 2.9.2.5** - Confidence caps at 0.95 for observed preferences
  - **Given:** Preference with many observations (10+)
  - **When:** Additional supporting observation recorded
  - **Then:** Confidence does not exceed 0.95
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

- [ ] **Test 2.9.2.6** - Contradicting behavior decreases confidence
  - **Given:** Preference with confidence=0.85
  - **When:** Contradicting observation recorded
  - **Then:** Confidence decreases by ~0.2, action='contradiction'
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

### Edge Cases

- [ ] **Test 2.9.2.7** - Confidence does not go below 0.0
  - **Given:** Preference with confidence=0.15
  - **When:** Contradicting observation recorded
  - **Then:** Confidence is max(0, 0.15 - 0.2) = 0.0, not negative
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.2.8** - Invalid confidence value throws validation error
  - **Given:** Preference data with confidence=1.5
  - **When:** `LearnedPreferenceSchema.parse(data)` is called
  - **Then:** Throws Zod validation error
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

### Error Handling

- [ ] **Test 2.9.2.9** - Invalid source value throws validation error
  - **Given:** Preference data with source='unknown'
  - **When:** `LearnedPreferenceSchema.parse(data)` is called
  - **Then:** Throws Zod validation error with enum values listed
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

---

## AC3: Evidence Tracking for Learned Preferences

**Given** a preference is learned from observed behavior
**When** stored in the database
**Then** the triggering observations are linked to the preference
**And** the evidence chain is available for transparency

### Happy Path

- [ ] **Test 2.9.3.1** - Evidence includes action, timestamp, context
  - **Given:** Valid evidence item
  - **When:** `EvidenceItemSchema.parse(data)` is called
  - **Then:** Parses with action (string), timestamp (datetime), context (optional string)
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.3.2** - Evidence includes contributionType
  - **Given:** Evidence item with contributionType
  - **When:** Checking the field
  - **Then:** Value is either 'supporting' or 'contradicting'
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.3.3** - Evidence array stores observations chronologically
  - **Given:** Preference with multiple observations
  - **When:** Examining evidence array
  - **Then:** Most recent evidence is last in array
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

### Edge Cases

- [ ] **Test 2.9.3.4** - Evidence is pruned to last 10 observations
  - **Given:** Preference data with 15 evidence items
  - **When:** `LearnedPreferenceSchema.parse(data)` is called
  - **Then:** Throws validation error (max 10 items)
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.3.5** - Evidence pruning preserves most recent
  - **Given:** 12 new observations occur
  - **When:** Evidence is stored
  - **Then:** Only last 10 kept, oldest 2 discarded
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

### Error Handling

- [ ] **Test 2.9.3.6** - Missing timestamp throws validation error
  - **Given:** Evidence item without timestamp
  - **When:** `EvidenceItemSchema.parse(data)` is called
  - **Then:** Throws Zod validation error
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

---

## AC4: Preference Injection into Agent Context

**Given** preferences are stored with high confidence (> 0.7)
**When** other agents (Butler, Triage, Scheduler, Communicator) make decisions
**Then** relevant preferences are injected into their context
**And** agent decisions align with learned preferences

### Happy Path

- [ ] **Test 2.9.4.1** - getRelevantPreferences filters by minConfidence
  - **Given:** Preferences with varying confidence (0.3, 0.6, 0.9)
  - **When:** `getRelevantPreferences(undefined, 0.7)` is called
  - **Then:** Only returns preferences with confidence >= 0.7
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

- [ ] **Test 2.9.4.2** - getRelevantPreferences filters by category
  - **Given:** Preferences in multiple categories
  - **When:** `getRelevantPreferences('scheduling_preference', 0.5)` is called
  - **Then:** Only returns scheduling preferences
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

- [ ] **Test 2.9.4.3** - Butler agent context includes user preferences
  - **Given:** High-confidence scheduling preference exists
  - **When:** Butler handles scheduling message
  - **Then:** Preference appears in agent context via `initializeAgentContext()`
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

### Edge Cases

- [ ] **Test 2.9.4.4** - Low confidence preferences not injected by default
  - **Given:** Preference with confidence=0.5
  - **When:** Butler builds context (default minConfidence=0.7)
  - **Then:** Low-confidence preference is NOT in context
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

### Error Handling

- [ ] **Test 2.9.4.5** - PreferenceStore not initialized throws clear error
  - **Given:** `getPreferenceStore()` called before `initPreferenceStore()`
  - **When:** Attempting to access store
  - **Then:** Throws error: "PreferenceStore not initialized"
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

---

## AC5: LearnedPreference Schema Validation

**Given** the Preference Learner Agent produces output
**When** output is returned to store a preference
**Then** it is type-safe JSON validated by the LearnedPreferenceSchema

### Happy Path

- [ ] **Test 2.9.5.1** - PreferenceLearnerResponse validates all action types
  - **Given:** Responses for learned_new, updated_existing, no_pattern, contradiction
  - **When:** `PreferenceLearnerResponseSchema.parse(data)` is called for each
  - **Then:** All parse successfully
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.5.2** - PreferenceCategory enum includes all categories
  - **Given:** Categories: scheduling_preference, communication_preference, organization_preference, notification_preference
  - **When:** `PreferenceCategory.parse(category)` is called
  - **Then:** All parse successfully
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.5.3** - ObservationInput schema validates correctly
  - **Given:** Valid observation with action, context, timestamp
  - **When:** `ObservationInputSchema.parse(data)` is called
  - **Then:** Parses successfully
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

- [ ] **Test 2.9.5.4** - Explicit preference recorded with 1.0 confidence
  - **Given:** User explicitly states preference
  - **When:** `recordExplicitPreference()` is called
  - **Then:** confidence=1.0, source='explicit'
  - **Type:** Integration
  - **File:** `tests/integration/story-2.9-preference-learning.spec.ts`

### Edge Cases

- [ ] **Test 2.9.5.5** - PreferenceSource validates exact enum values
  - **Given:** Valid sources: 'explicit', 'observed', 'default'
  - **When:** `PreferenceSource.parse(source)` is called
  - **Then:** All parse successfully, 'unknown' throws
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

### Error Handling

- [ ] **Test 2.9.5.6** - Missing required action field throws error
  - **Given:** ObservationInput without action field
  - **When:** `ObservationInputSchema.parse(data)` is called
  - **Then:** Throws Zod validation error
  - **Type:** Unit
  - **File:** `tests/unit/story-2.9-preference-learner.spec.ts`

---

## E2E Tests

- [ ] **Test 2.9.E2E.1** - Agent reflects learned preference in response
  - **Given:** Stored preference "prefers morning meetings" with confidence=0.9
  - **When:** User asks to schedule a meeting
  - **Then:** Agent response prioritizes morning times
  - **Type:** E2E
  - **File:** `tests/e2e/story-2.9-preference-reflection.spec.ts`

- [ ] **Test 2.9.E2E.2** - User can see why Orion learned a preference (transparency)
  - **Given:** Learned preference with evidence chain
  - **When:** User views preference in Memory Viewer (Epic 10 integration point)
  - **Then:** Evidence items with actions and timestamps are displayed
  - **Type:** E2E
  - **File:** `tests/e2e/story-2.9-preference-transparency.spec.ts`

---

## Mock Data Requirements

Reference mocks in `tests/mocks/agents/preference-learner.ts`:

| Mock Key | Scenario | Use Cases |
|----------|----------|-----------|
| `learned_morning_meetings` | New scheduling preference detected | AC1, AC2, AC3 |
| `updated_morning_meetings_high_confidence` | Existing preference updated | AC2, AC4 |
| `explicit_formal_tone` | Explicit user preference | AC2, AC5 |
| `no_pattern_single_observation` | No pattern detected yet | AC5 |
| `contradiction_detected` | Contradicting behavior | AC2, AC3 |
| `learned_casual_colleague_tone` | Communication preference from edits | AC3 |

---

## Test File Structure

```
tests/
  mocks/
    agents/
      preference-learner.ts        # PREFERENCE_LEARNER_MOCKS, MOCK_STORED_PREFERENCES
      index.ts                     # Export all agent mocks
    services/
      preferences.ts               # MockPreferenceStore (IPreferenceStore implementation)
  unit/
    story-2.9-preference-learner.spec.ts    # 15 unit tests
  integration/
    story-2.9-preference-learning.spec.ts   # 10 integration tests
  e2e/
    story-2.9-preference-reflection.spec.ts # 2 E2E tests
```

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 2.2 (Agent Prompt Templates) | Required | `loadAgentTemplate()` function |
| Story 2.1 (Butler Agent Core) | Required | Context injection integration |
| Epic 1 (Foundation) | Required | SQLite preferences table |
| Vitest | Required | Test runner |
| Zod | Required | Schema validation |

---

## Quality Gate Criteria

- [ ] All 15 unit tests passing
- [ ] All 10 integration tests passing
- [ ] All 2 E2E tests passing
- [ ] Code coverage >= 80%
- [ ] No P0/P1 bugs open
- [ ] Schema validation covers all edge cases
- [ ] Preference injection tested with Butler agent
- [ ] Evidence pruning behavior verified

---

**Document Status:** Ready for Implementation
**Next Step:** Implement preference-learner agent prompt, then tests alongside implementation

_Generated by TEA (Test Architect Agent) - 2026-01-15_
