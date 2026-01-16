# ATDD Checklist: 2-1-butler-agent-core

**Story:** Butler Agent Core
**Epic:** 2 - Agent & Automation Infrastructure
**Status:** Ready for Testing
**Priority:** P0 (Core Orchestrator)
**Risk:** HIGH
**Date:** 2026-01-15

---

## Test Summary

| Level | Count | Coverage |
|-------|-------|----------|
| Unit | 12 | Core logic, schema validation, prompt loading |
| Integration | 8 | Agent delegation, context passing, result aggregation |
| E2E | 2 | Multi-step synthesis, conversation flow |
| **Total** | **22** | All acceptance criteria covered |

---

## AC1: Intent Analysis and Delegation Decision

> **Given** I send a message to Orion
> **When** the Butler Agent receives it
> **Then** it analyzes intent and determines if it can handle directly or needs to delegate
> **And** it maintains conversation context across turns
> **And** it has access to the full tool catalog

### Happy Path

- [ ] **Test 2.1.1 - Prompt template loads correctly**
  - **Type:** Unit
  - **Given:** Butler agent initializes
  - **When:** `loadAgentTemplate('butler')` is called
  - **Then:** Returns valid template object with:
    - `name` equals 'Butler'
    - `systemPrompt` is present and >500 characters
    - `tools` array is defined
  - **File:** `tests/unit/story-2.1-butler-agent.spec.ts`

- [ ] **Test 2.1.2 - Simple query end-to-end returns response**
  - **Type:** Integration
  - **Given:** Butler agent is initialized with mocked Claude client
  - **When:** User sends "Hello, how are you?"
  - **Then:** Butler returns a direct response without delegation
  - **And:** Response contains greeting text
  - **File:** `tests/integration/story-2.1-butler-delegation.spec.ts`

- [ ] **Test 2.1.5 - Intent classification: greeting returns direct_answer**
  - **Type:** Unit
  - **Given:** Butler agent receives a simple greeting
  - **When:** `classifyIntent("Hello, how are you?")` is called
  - **Then:** Classification returns:
    - `intent` equals 'direct_answer'
    - `confidence` > 0.8
  - **And:** Response validates against `IntentClassificationSchema`
  - **File:** `tests/unit/story-2.1-butler-agent.spec.ts`

- [ ] **Test 2.1.6 - Intent classification: inbox query returns delegate_triage**
  - **Type:** Unit
  - **Given:** Butler agent receives inbox-related question
  - **When:** `classifyIntent("What urgent emails do I have?")` is called
  - **Then:** Classification returns:
    - `intent` equals 'delegate_triage'
    - `delegationContext.relevantEntities` contains 'inbox'
  - **File:** `tests/unit/story-2.1-butler-agent.spec.ts`

- [ ] **Test 2.1.7 - Intent classification: scheduling returns delegate_schedule**
  - **Type:** Unit
  - **Given:** Butler agent receives scheduling request
  - **When:** `classifyIntent("Schedule a meeting with John tomorrow")` is called
  - **Then:** Classification returns:
    - `intent` equals 'delegate_schedule'
    - `delegationContext.relevantEntities` contains 'John'
    - `delegationContext.timeConstraints` is defined
  - **File:** `tests/unit/story-2.1-butler-agent.spec.ts`

### Edge Cases

- [ ] **Test 2.1.EC1 - Ambiguous intent requests clarification**
  - **Type:** Unit
  - **Given:** Butler receives ambiguous message "Can you help me?"
  - **When:** `classifyIntent()` is called
  - **Then:** Returns `intent: 'clarify'` with followUpQuestions array
  - **And:** Confidence score < 0.5

- [ ] **Test 2.1.EC2 - Out-of-scope request returns cannot_help**
  - **Type:** Unit
  - **Given:** Butler receives request outside capabilities ("Write me Python code")
  - **When:** `classifyIntent()` is called
  - **Then:** Returns `intent: 'cannot_help'`
  - **And:** Response includes explanation of limitations

- [ ] **Test 2.1.EC3 - Empty message handled gracefully**
  - **Type:** Unit
  - **Given:** Butler receives empty string ""
  - **When:** `handleMessage("")` is called
  - **Then:** Returns clarification request
  - **And:** Does not throw error

- [ ] **Test 2.1.EC4 - Very long message (10K+ chars) processed**
  - **Type:** Unit
  - **Given:** Butler receives message with 10,000+ characters
  - **When:** `classifyIntent()` is called
  - **Then:** Successfully classifies intent
  - **And:** Does not timeout or truncate incorrectly

- [ ] **Test 2.1.EC5 - Conversation history maintained across 10+ turns**
  - **Type:** Integration
  - **Given:** Butler agent with active session
  - **When:** 10+ messages are exchanged sequentially
  - **Then:** All messages are preserved in conversation history
  - **And:** Context from earlier messages influences later responses

### Error Handling

- [ ] **Test 2.1.EH1 - Claude API failure returns graceful error state**
  - **Type:** Unit
  - **Given:** Claude client mock throws error
  - **When:** `handleMessage()` is called
  - **Then:** Agent returns error state (not crash)
  - **And:** Error message is user-friendly
  - **And:** Agent remains usable for next request

- [ ] **Test 2.1.EH2 - Schema validation failure handled**
  - **Type:** Unit
  - **Given:** Claude returns malformed JSON
  - **When:** Response is parsed with `IntentClassificationSchema.safeParse()`
  - **Then:** Returns validation error
  - **And:** Does not throw unhandled exception
  - **And:** Logs error for debugging

- [ ] **Test 2.1.EH3 - Missing required fields in response**
  - **Type:** Unit
  - **Given:** Claude response missing `intent` field
  - **When:** Schema validation occurs
  - **Then:** `safeParse()` returns `success: false`
  - **And:** Error details path to missing field

- [ ] **Test 2.1.EH4 - Invalid confidence value (out of 0-1 range)**
  - **Type:** Unit
  - **Given:** Response with `confidence: 1.5`
  - **When:** Validated against `IntentClassificationSchema`
  - **Then:** Validation fails
  - **And:** Error message indicates value out of range

### Boundary Conditions

- [ ] **Test 2.1.BC1 - Confidence score exactly 0.0**
  - **Type:** Unit
  - **Given:** Mock returns confidence of exactly 0.0
  - **When:** Validated against schema
  - **Then:** Passes validation (0.0 is valid minimum)

- [ ] **Test 2.1.BC2 - Confidence score exactly 1.0**
  - **Type:** Unit
  - **Given:** Mock returns confidence of exactly 1.0
  - **When:** Validated against schema
  - **Then:** Passes validation (1.0 is valid maximum)

- [ ] **Test 2.1.BC3 - All 8 intent types recognized**
  - **Type:** Unit
  - **Given:** Test messages designed for each intent type
  - **When:** Each is classified
  - **Then:** All 8 intents are correctly identified:
    - `direct_answer`
    - `delegate_triage`
    - `delegate_schedule`
    - `delegate_draft`
    - `delegate_search`
    - `delegate_learn`
    - `clarify`
    - `cannot_help`

---

## AC2: Multi-Step Task Coordination

> **Given** a task requires multiple steps
> **When** the Butler Agent processes it
> **Then** it breaks down the task into sub-tasks
> **And** it coordinates execution in logical order
> **And** it synthesizes results into a coherent response

### Happy Path

- [ ] **Test 2.1.3 - Butler delegates to Triage for inbox tasks**
  - **Type:** Integration
  - **Given:** Butler with mocked Triage agent
  - **When:** User asks "Check my inbox for urgent items"
  - **Then:** `spawnSubAgent('triage', context)` is called
  - **And:** Triage context includes `relevantEntities: ['inbox', 'urgent']`
  - **File:** `tests/integration/story-2.1-butler-delegation.spec.ts`

- [ ] **Test 2.1.4 - Butler delegates to Scheduler for calendar tasks**
  - **Type:** Integration
  - **Given:** Butler with mocked Scheduler agent
  - **When:** User asks "Find a time to meet with Alice next week"
  - **Then:** `spawnSubAgent('scheduler', context)` is called
  - **And:** Scheduler context includes attendee and time information
  - **File:** `tests/integration/story-2.1-butler-delegation.spec.ts`

- [ ] **Test 2.1.8 - Multi-step task produces coherent synthesized response**
  - **Type:** E2E
  - **Given:** Butler orchestrating multi-agent task
  - **When:** User asks "Check my urgent emails and schedule follow-ups"
  - **Then:** Butler coordinates Triage then Scheduler
  - **And:** Final response synthesizes both agents' outputs
  - **And:** User sees single coherent message
  - **File:** `tests/e2e/story-2.1-multi-step.spec.ts`

### Edge Cases

- [ ] **Test 2.1.MS.EC1 - Single-step task not over-delegated**
  - **Type:** Integration
  - **Given:** Simple direct-answer query
  - **When:** `handleMessage("What time is it?")` is called
  - **Then:** No sub-agent is spawned
  - **And:** Butler responds directly

- [ ] **Test 2.1.MS.EC2 - Sub-agent returns empty result**
  - **Type:** Integration
  - **Given:** Triage agent returns no urgent emails
  - **When:** Butler synthesizes results
  - **Then:** Response acknowledges empty result gracefully
  - **And:** Does not fail or return undefined

- [ ] **Test 2.1.MS.EC3 - Multiple sub-agents with partial failures**
  - **Type:** Integration
  - **Given:** Multi-step task requiring Triage + Scheduler
  - **When:** Triage succeeds but Scheduler fails
  - **Then:** Butler reports partial success
  - **And:** Includes Triage results
  - **And:** Indicates Scheduler issue to user

### Error Handling

- [ ] **Test 2.1.MS.EH1 - Sub-agent spawn failure handled**
  - **Type:** Integration
  - **Given:** `spawnSubAgent()` throws error
  - **When:** Butler attempts delegation
  - **Then:** Butler catches error
  - **And:** Returns helpful error message
  - **And:** Suggests alternative action

- [ ] **Test 2.1.MS.EH2 - Sub-agent timeout handled**
  - **Type:** Integration
  - **Given:** Sub-agent takes >30 seconds
  - **When:** Timeout occurs
  - **Then:** Butler cancels pending request
  - **And:** Returns timeout message to user
  - **And:** System remains responsive

- [ ] **Test 2.1.MS.EH3 - Context serialization failure**
  - **Type:** Unit
  - **Given:** AgentContext with circular reference
  - **When:** Context is serialized for sub-agent
  - **Then:** Serialization handles gracefully
  - **And:** Sub-agent receives valid context

### Boundary Conditions

- [ ] **Test 2.1.MS.BC1 - Maximum delegation depth (3 levels)**
  - **Type:** Integration
  - **Given:** Task requiring nested delegation
  - **When:** Delegation depth exceeds 3
  - **Then:** Butler stops delegating
  - **And:** Completes with available results

- [ ] **Test 2.1.MS.BC2 - Parallel sub-agent execution**
  - **Type:** Integration
  - **Given:** Independent sub-tasks
  - **When:** Butler coordinates execution
  - **Then:** Sub-agents run in parallel where possible
  - **And:** Results are aggregated correctly

---

## Schema Validation Tests

Based on `test-infra-agent-schemas.md`, these tests ensure mock fidelity:

### IntentClassificationSchema Validation

- [ ] **Test 2.1.SV1 - Valid IntentClassification parses**
  - **Type:** Unit
  - **Given:** Well-formed intent classification object
  - **When:** `IntentClassificationSchema.parse()` is called
  - **Then:** Returns parsed object without errors

- [ ] **Test 2.1.SV2 - Invalid intent enum rejected**
  - **Type:** Unit
  - **Given:** Classification with `intent: 'invalid_type'`
  - **When:** Schema validation runs
  - **Then:** Throws ZodError with enum validation message

- [ ] **Test 2.1.SV3 - Optional delegationContext accepted**
  - **Type:** Unit
  - **Given:** Classification without delegationContext
  - **When:** Schema validation runs
  - **Then:** Passes (field is optional)

### ButlerResponseSchema Validation

- [ ] **Test 2.1.SV4 - Complete ButlerResponse validates**
  - **Type:** Unit
  - **Given:** Response with all fields populated
  - **When:** `ButlerResponseSchema.parse()` is called
  - **Then:** All fields accessible on parsed object

- [ ] **Test 2.1.SV5 - Response with only classification validates**
  - **Type:** Unit
  - **Given:** Response with classification but no response text
  - **When:** Schema validation runs
  - **Then:** Passes (response field is optional)

---

## Tool Catalog Tests

### Catalog Access

- [ ] **Test 2.1.TC1 - Butler has access to full tool catalog**
  - **Type:** Unit
  - **Given:** Butler agent initializes
  - **When:** `getAvailableTools()` is called
  - **Then:** Returns complete tool list
  - **And:** Includes tools from all categories (read, write, destructive)

- [ ] **Test 2.1.TC2 - Tool descriptions available for prompt context**
  - **Type:** Unit
  - **Given:** Tool catalog loaded
  - **When:** Butler builds system prompt
  - **Then:** Tool descriptions are interpolated into prompt
  - **And:** Butler can reference tool capabilities

---

## Prompt Caching Tests

Per architecture.md section 6.7:

- [ ] **Test 2.1.PC1 - Cache control marker present on system prompt**
  - **Type:** Unit
  - **Given:** Butler builds Claude API request
  - **When:** System prompt is constructed
  - **Then:** Contains `cache_control: { type: 'ephemeral' }` marker
  - **And:** System prompt exceeds 1,024 tokens (minimum cacheable)

- [ ] **Test 2.1.PC2 - Dynamic content not cached**
  - **Type:** Unit
  - **Given:** User context and recent messages
  - **When:** Request is built
  - **Then:** Dynamic sections do NOT have cache_control marker

---

## Mock Scenarios Required

From `BUTLER_MOCKS` in test infrastructure:

| Scenario Key | Intent | Confidence | Use Case |
|--------------|--------|------------|----------|
| `direct_greeting` | direct_answer | 0.95 | Simple greeting |
| `delegate_to_triage` | delegate_triage | 0.88 | Inbox prioritization |
| `delegate_to_scheduler` | delegate_schedule | 0.92 | Meeting scheduling |
| `delegate_to_draft` | delegate_draft | 0.85 | Email composition |
| `needs_clarification` | clarify | 0.40 | Ambiguous request |
| `out_of_scope` | cannot_help | 0.90 | Outside capabilities |

---

## Test File Locations

```
tests/
  unit/
    story-2.1-butler-agent.spec.ts        # Tests: 2.1.1, 2.1.5, 2.1.6, 2.1.7, EC, EH, BC, SV
  integration/
    story-2.1-butler-delegation.spec.ts   # Tests: 2.1.2, 2.1.3, 2.1.4, MS.EC, MS.EH
  e2e/
    story-2.1-multi-step.spec.ts          # Tests: 2.1.8
  mocks/
    agents/
      butler.ts                            # BUTLER_MOCKS
```

---

## Coverage Requirements

| Acceptance Criterion | Test IDs | Coverage |
|---------------------|----------|----------|
| AC1: Intent Analysis | 2.1.1, 2.1.2, 2.1.5-2.1.7, EC1-EC5, EH1-EH4, BC1-BC3, SV1-SV5 | 100% |
| AC2: Multi-Step Coordination | 2.1.3, 2.1.4, 2.1.8, MS.EC1-EC3, MS.EH1-EH3, MS.BC1-BC2 | 100% |

---

## Quality Gate Criteria

Before story can be marked complete:

- [ ] All 22 tests passing
- [ ] Schema validation 100% coverage
- [ ] Mock scenarios match production schema
- [ ] Unit test coverage >= 80%
- [ ] Integration tests use mocks (no real Claude calls)
- [ ] E2E test passes in CI pipeline
- [ ] No P0/P1 bugs open

---

## Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Agent schemas (C-001) | Must exist | All schema validation tests |
| BUTLER_MOCKS | Must exist | All tests using mocks |
| Claude SDK mock | Must exist | All unit/integration tests |
| Triage agent mock | Must exist | Delegation tests |
| Scheduler agent mock | Must exist | Delegation tests |

---

**Document Status:** Ready for TDD Implementation
**Next Step:** Create test files, then implement Butler Agent to make tests pass

_Generated by TEA (Test Architect Agent) - 2026-01-15_
