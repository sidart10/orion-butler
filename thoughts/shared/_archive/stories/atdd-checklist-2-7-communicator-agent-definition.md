# ATDD Checklist: 2-7-communicator-agent-definition

**Story:** Communicator Agent Definition
**Epic:** 2 - Agent & Automation Infrastructure
**Status:** Ready for Testing
**Risk:** MEDIUM
**Priority:** P1

---

## Summary

This checklist validates the Communicator Agent implementation, which is responsible for drafting messages with tone and style matching. The agent analyzes past communications and recipient relationships to produce drafts with appropriate formality levels. CRITICAL SAFETY: The agent NEVER auto-sends - all communications require explicit user approval. User edits are captured for preference learning (storage in Epic 10, mocked here).

---

## AC1: Communicator Agent Prompt with Tone-Matching Instructions

**Given** the Communicator Agent is invoked (ARCH-014)
**When** it drafts a message
**Then** it references my past communications for tone
**And** it considers the recipient relationship
**And** it produces a draft with appropriate formality

### Happy Path Tests

- [ ] **Test 2.7.1.1: Communicator prompt file exists and is substantial**
  - Given: The `.claude/agents/communicator.md` file exists
  - When: The file is loaded by `loadAgentTemplate('communicator')`
  - Then: The file loads successfully
  - And: The prompt content length is > 1000 characters

- [ ] **Test 2.7.1.2: Prompt includes tone-matching instructions**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It contains instructions for tone matching (regex: `/tone/i`)
  - And: It mentions analyzing user's past communication style
  - And: It mentions matching user's typical phrasing and vocabulary

- [ ] **Test 2.7.1.3: Prompt includes formality level guidance**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions formality levels (regex: `/formal|casual|professional|friendly/i`)
  - And: It documents when to use each level

- [ ] **Test 2.7.1.4: Prompt includes relationship-based adjustment logic**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions recipient relationship (regex: `/relationship|recipient/i`)
  - And: It documents client relationship (formal)
  - And: It documents colleague relationship (professional)
  - And: It documents friend relationship (casual)
  - And: It documents family relationship (friendly)

- [ ] **Test 2.7.1.5: Prompt includes past communication analysis**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions past communications (regex: `/past.*communication|history|previous/i`)
  - And: It instructs to preserve user's characteristic sign-offs
  - And: It mentions considering time of day and urgency

- [ ] **Test 2.7.1.6: Prompt includes template usage instructions**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions templates (regex: `/template/i`)
  - And: It documents when to suggest pre-saved templates
  - And: It mentions template categories (follow-up, introduction, thank-you, meeting-request)

- [ ] **Test 2.7.1.7: Prompt includes CRITICAL safety constraint**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It explicitly states NEVER auto-send (regex: `/never.*auto.*send|do not.*send.*automatically/i`)
  - And: It states user review is required (regex: `/user.*review|approval.*required/i`)
  - And: It states user must explicitly approve and click send

- [ ] **Test 2.7.1.8: Prompt includes learning instructions**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions tracking when user edits drafts significantly
  - And: It mentions noting tone preferences per recipient
  - And: It mentions adjusting future drafts based on corrections

### Edge Cases

- [ ] **Test 2.7.1.9: Prompt handles unknown relationship gracefully**
  - Given: The communicator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It documents handling of 'unknown' relationship type
  - And: It defaults to professional tone for unknown relationships

- [ ] **Test 2.7.1.10: Template variable interpolation works**
  - Given: The communicator agent template with placeholders ({{user_name}}, {{current_date}})
  - When: `interpolateTemplate()` is called with context variables
  - Then: All placeholders are replaced with actual values
  - And: No raw `{{variable}}` patterns remain in output

### Error Handling

- [ ] **Test 2.7.1.11: Missing prompt file throws clear error**
  - Given: The communicator agent prompt file is missing
  - When: The agent attempts to initialize
  - Then: An error is thrown with message indicating file not found
  - And: The error includes the expected file path

---

## AC2: Recipient Relationship-Based Drafting

**Given** a recipient with a known relationship type (client, colleague, friend, family, vendor)
**When** the Communicator drafts a message
**Then** the tone and formality adjust based on relationship
**And** appropriate salutations and sign-offs are used

### Happy Path Tests

- [ ] **Test 2.7.2.1: ToneSchema validates correctly**
  - Given: The ToneSchema definition
  - When: Valid tone values are parsed
  - Then: 'formal', 'casual', 'professional', 'friendly' all parse successfully

- [ ] **Test 2.7.2.2: FormalityLevelSchema validates correctly**
  - Given: The FormalityLevelSchema definition
  - When: Valid formality values are parsed
  - Then: 'formal', 'professional', 'casual', 'friendly' all parse successfully

- [ ] **Test 2.7.2.3: RelationshipTypeSchema validates all types**
  - Given: The RelationshipTypeSchema definition
  - When: All relationship types are parsed
  - Then: 'client', 'colleague', 'vendor', 'friend', 'family', 'unknown' all parse successfully

- [ ] **Test 2.7.2.4: DraftSchema validates complete draft object**
  - Given: A valid Draft object with all fields
  - When: `DraftSchema.parse(draft)` is called
  - Then: Parsing succeeds
  - And: Object has `subject` (optional string)
  - And: Object has `body` (required string)
  - And: Object has `to` (optional valid email)
  - And: Object has `cc` (optional array of emails)
  - And: Object has `tone` (ToneSchema)
  - And: Object has `formality` (FormalityLevelSchema)
  - And: Object has `suggestedGreeting` (optional string)
  - And: Object has `suggestedSignoff` (optional string)

- [ ] **Test 2.7.2.5: Client relationship produces formal tone**
  - Given: COMMUNICATOR_MOCKS.formal_reply mock data with client relationship
  - When: Draft tone is inspected
  - Then: `draft.tone` equals 'formal'
  - And: `draft.formality` equals 'formal'
  - And: `draft.body` contains formal greeting (regex: `/dear/i`)
  - And: `draft.body` contains formal sign-off (regex: `/sincerely/i`)

- [ ] **Test 2.7.2.6: Colleague relationship produces casual tone**
  - Given: COMMUNICATOR_MOCKS.casual_reply mock data with colleague relationship
  - When: Draft tone is inspected
  - Then: `draft.tone` equals 'casual'
  - And: `draft.formality` equals 'casual'
  - And: `draft.body` contains casual greeting (regex: `/hey/i`)
  - And: `draft.body` contains casual sign-off (regex: `/thanks/i`)

- [ ] **Test 2.7.2.7: Vendor relationship produces professional tone**
  - Given: COMMUNICATOR_MOCKS.professional_new mock data with vendor relationship
  - When: Draft tone is inspected
  - Then: `draft.tone` equals 'professional'
  - And: `draft.formality` equals 'professional'
  - And: `draft.body` contains professional greeting (regex: `/hi|hello/i`)
  - And: `draft.body` contains professional sign-off (regex: `/best regards|thank you/i`)

- [ ] **Test 2.7.2.8: determineDefaultTone returns correct mapping**
  - Given: CommunicatorAgent class
  - When: `determineDefaultTone(relationship)` is called for each type
  - Then: 'client' returns { tone: 'formal', formality: 'formal' }
  - And: 'colleague' returns { tone: 'professional', formality: 'professional' }
  - And: 'vendor' returns { tone: 'professional', formality: 'professional' }
  - And: 'friend' returns { tone: 'casual', formality: 'casual' }
  - And: 'family' returns { tone: 'friendly', formality: 'friendly' }
  - And: 'unknown' returns { tone: 'professional', formality: 'professional' }

- [ ] **Test 2.7.2.9: recipientContext includes relationship and lastInteraction**
  - Given: COMMUNICATOR_MOCKS.formal_reply mock data
  - When: Response is inspected
  - Then: `recipientContext` is defined
  - And: `recipientContext.relationship` equals 'client'
  - And: `recipientContext.lastInteraction` is a valid datetime string

### Edge Cases

- [ ] **Test 2.7.2.10: Unknown relationship defaults to professional**
  - Given: A draft request with `recipientRelationship: 'unknown'`
  - When: Default tone is determined
  - Then: Tone defaults to 'professional'
  - And: Formality defaults to 'professional'

- [ ] **Test 2.7.2.11: Draft without subject is valid for non-email messages**
  - Given: A Draft object without `subject` field
  - When: `DraftSchema.parse(draft)` is called
  - Then: Parsing succeeds (subject is optional)

- [ ] **Test 2.7.2.12: Draft without to field is valid for draft-only**
  - Given: A Draft object without `to` field
  - When: `DraftSchema.parse(draft)` is called
  - Then: Parsing succeeds (to is optional for drafts)

### Error Handling

- [ ] **Test 2.7.2.13: Invalid tone value throws validation error**
  - Given: A Draft object with `tone: 'aggressive'` (invalid)
  - When: `DraftSchema.parse(draft)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid tone values

- [ ] **Test 2.7.2.14: Invalid formality value throws validation error**
  - Given: A Draft object with `formality: 'very_formal'` (invalid)
  - When: `DraftSchema.parse(draft)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid formality values

- [ ] **Test 2.7.2.15: Invalid relationship type throws validation error**
  - Given: A RelationshipType value of 'invalid'
  - When: `RelationshipTypeSchema.parse('invalid')` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid relationship types

- [ ] **Test 2.7.2.16: Invalid email in to field throws error**
  - Given: A Draft object with `to: 'not-an-email'`
  - When: `DraftSchema.parse(draft)` is called
  - Then: Zod validation error is thrown
  - And: Error indicates invalid email format

- [ ] **Test 2.7.2.17: Invalid email in cc array throws error**
  - Given: A Draft object with `cc: ['valid@email.com', 'not-an-email']`
  - When: `DraftSchema.parse(draft)` is called
  - Then: Zod validation error is thrown
  - And: Error indicates invalid email format in cc

---

## AC3: Draft-Review-Send Workflow (Never Auto-Send)

**Given** the agent generates a draft
**When** I review it
**Then** I can edit before sending (never auto-send)
**And** edits inform future drafts (learning)

### Happy Path Tests

- [ ] **Test 2.7.3.1: CommunicatorResponseSchema action enum excludes 'send'**
  - Given: The CommunicatorResponseSchema definition
  - When: The action enum values are inspected
  - Then: 'send' is NOT in the enum (explicit constraint)
  - And: Valid values are: 'draft_reply', 'draft_new', 'suggest_template', 'refine_draft', 'clarify'

- [ ] **Test 2.7.3.2: Attempting to use 'send' action fails validation**
  - Given: A CommunicatorResponse object with `action: 'send'`
  - When: `CommunicatorResponseSchema.parse(response)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid action enum values (not including 'send')

- [ ] **Test 2.7.3.3: draft_reply action validates correctly**
  - Given: COMMUNICATOR_MOCKS.formal_reply mock data with `action: 'draft_reply'`
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.3.4: draft_new action validates correctly**
  - Given: COMMUNICATOR_MOCKS.professional_new mock data with `action: 'draft_new'`
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.3.5: suggest_template action validates correctly**
  - Given: COMMUNICATOR_MOCKS.suggest_template mock data with `action: 'suggest_template'`
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.3.6: refine_draft action validates correctly**
  - Given: COMMUNICATOR_MOCKS.refine_draft mock data with `action: 'refine_draft'`
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.3.7: clarify action validates correctly**
  - Given: COMMUNICATOR_MOCKS.clarify mock data with `action: 'clarify'`
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.3.8: UserEditRecordSchema validates correctly**
  - Given: A valid UserEditRecord object with all required fields
  - When: `UserEditRecordSchema.parse(editRecord)` is called
  - Then: Parsing succeeds
  - And: Object has `originalDraft` (string)
  - And: Object has `editedDraft` (string)
  - And: Object has `recipient` (valid email)
  - And: Object has `recipientRelationship` (optional RelationshipType)
  - And: Object has `editTimestamp` (datetime string)
  - And: Object has `significantChange` (boolean)

- [ ] **Test 2.7.3.9: recordUserEdit method captures edit details**
  - Given: CommunicatorAgent instance
  - When: `recordUserEdit(editData)` is called with original and edited drafts
  - Then: Method executes without error
  - And: Edit is validated against UserEditRecordSchema

- [ ] **Test 2.7.3.10: Significant change detection works**
  - Given: An edit that changes tone (formal to casual)
  - When: significantChange is determined
  - Then: `significantChange` is `true` (tone change is significant)

### Edge Cases

- [ ] **Test 2.7.3.11: Empty edit (no changes) is valid**
  - Given: A UserEditRecord where `originalDraft === editedDraft`
  - When: `UserEditRecordSchema.parse(editRecord)` is called
  - Then: Parsing succeeds (no change is valid scenario)
  - And: `significantChange` should be `false`

- [ ] **Test 2.7.3.12: recipientRelationship is optional in UserEditRecord**
  - Given: A UserEditRecord without `recipientRelationship` field
  - When: `UserEditRecordSchema.parse(editRecord)` is called
  - Then: Parsing succeeds (field is optional)

- [ ] **Test 2.7.3.13: TemplateSuggestionSchema validates correctly**
  - Given: A valid TemplateSuggestion object
  - When: `TemplateSuggestionSchema.parse(suggestion)` is called
  - Then: Parsing succeeds
  - And: Object has `templateId` (string)
  - And: Object has `templateName` (string)
  - And: Object has `category` (enum)
  - And: Object has `matchReason` (string)
  - And: Object has `preview` (string)

- [ ] **Test 2.7.3.14: Template category enum validates**
  - Given: The TemplateSuggestionSchema category field
  - When: Valid categories are parsed
  - Then: 'follow_up', 'introduction', 'thank_you', 'meeting_request', 'custom' all parse successfully

### Error Handling

- [ ] **Test 2.7.3.15: UserEditRecord missing recipient throws error**
  - Given: A UserEditRecord without `recipient` field
  - When: `UserEditRecordSchema.parse(editRecord)` is called
  - Then: Zod validation error is thrown
  - And: Error identifies missing required field

- [ ] **Test 2.7.3.16: UserEditRecord with invalid recipient email throws error**
  - Given: A UserEditRecord with `recipient: 'not-an-email'`
  - When: `UserEditRecordSchema.parse(editRecord)` is called
  - Then: Zod validation error is thrown
  - And: Error indicates invalid email format

- [ ] **Test 2.7.3.17: Invalid editTimestamp format throws error**
  - Given: A UserEditRecord with `editTimestamp: 'not-a-datetime'`
  - When: `UserEditRecordSchema.parse(editRecord)` is called
  - Then: Zod validation error is thrown
  - And: Error indicates invalid datetime format

- [ ] **Test 2.7.3.18: Invalid template category throws error**
  - Given: A TemplateSuggestion with `category: 'invalid_category'`
  - When: `TemplateSuggestionSchema.parse(suggestion)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid category values

---

## AC4: CommunicatorResult Schema Validation

**Given** the Communicator Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the CommunicatorResponseSchema

### Happy Path Tests

- [ ] **Test 2.7.4.1: Valid CommunicatorResponse parses successfully**
  - Given: A well-formed CommunicatorResponse object with all required fields
  - When: `CommunicatorResponseSchema.parse(response)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.4.2: Schema includes all action types**
  - Given: The CommunicatorResponseSchema definition
  - When: Schema structure is inspected
  - Then: `action` enum includes exactly: 'draft_reply', 'draft_new', 'suggest_template', 'refine_draft', 'clarify'
  - And: `action` enum does NOT include 'send'

- [ ] **Test 2.7.4.3: Schema includes all optional fields**
  - Given: The CommunicatorResponseSchema definition
  - When: Schema structure is inspected
  - Then: It includes optional `draft` (DraftSchema)
  - And: It includes optional `suggestedTemplate` (TemplateSuggestionSchema)
  - And: It includes optional `clarificationQuestion` (ClarificationSchema)
  - And: It includes optional `recipientContext` (object)
  - And: It includes optional `toneReasoning` (string)

- [ ] **Test 2.7.4.4: ClarificationSchema validates correctly**
  - Given: A valid Clarification object
  - When: `ClarificationSchema.parse(clarification)` is called
  - Then: Parsing succeeds
  - And: Object has `question` (required string)
  - And: Object has `context` (optional string)
  - And: Object has `options` (optional array of strings)

- [ ] **Test 2.7.4.5: Formal reply mock passes validation**
  - Given: COMMUNICATOR_MOCKS.formal_reply mock data
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.4.6: Casual reply mock passes validation**
  - Given: COMMUNICATOR_MOCKS.casual_reply mock data
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.4.7: Professional new mock passes validation**
  - Given: COMMUNICATOR_MOCKS.professional_new mock data
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.4.8: Suggest template mock passes validation**
  - Given: COMMUNICATOR_MOCKS.suggest_template mock data
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.4.9: Clarify mock passes validation**
  - Given: COMMUNICATOR_MOCKS.clarify mock data
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.4.10: Refine draft mock passes validation**
  - Given: COMMUNICATOR_MOCKS.refine_draft mock data
  - When: `CommunicatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.7.4.11: toneReasoning explains tone selection**
  - Given: COMMUNICATOR_MOCKS.formal_reply mock data
  - When: Response is inspected
  - Then: `toneReasoning` is defined
  - And: `toneReasoning` contains reference to relationship or past interactions

- [ ] **Test 2.7.4.12: Schema exports correct TypeScript types**
  - Given: The communicator schema module exports
  - When: Type exports are inspected
  - Then: `CommunicatorResponse` type is exported
  - And: `Draft` type is exported
  - And: `Tone` type is exported
  - And: `FormalityLevel` type is exported
  - And: `RelationshipType` type is exported
  - And: `TemplateSuggestion` type is exported
  - And: `UserEditRecord` type is exported

### Edge Cases

- [ ] **Test 2.7.4.13: Response with only action field validates**
  - Given: A minimal CommunicatorResponse with only `action` field
  - When: Schema validation is performed
  - Then: Validation succeeds (all other fields are optional)

- [ ] **Test 2.7.4.14: Clarify action without draft validates**
  - Given: A CommunicatorResponse with `action: 'clarify'` and no draft
  - When: Schema validation is performed
  - Then: Validation succeeds (clarify doesn't require draft)

- [ ] **Test 2.7.4.15: suggest_template action without draft validates**
  - Given: A CommunicatorResponse with `action: 'suggest_template'` and `suggestedTemplate` but no draft
  - When: Schema validation is performed
  - Then: Validation succeeds (template suggestion doesn't require draft)

- [ ] **Test 2.7.4.16: Empty options array in clarification is valid**
  - Given: A ClarificationSchema with `options: []`
  - When: Schema validation is performed
  - Then: Validation succeeds (empty options array is valid)

### Error Handling

- [ ] **Test 2.7.4.17: Invalid action value throws error**
  - Given: A CommunicatorResponse with `action: 'invalid_action'`
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error lists valid action enum values

- [ ] **Test 2.7.4.18: Missing action field throws error**
  - Given: A CommunicatorResponse without `action` field
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error identifies missing required field

- [ ] **Test 2.7.4.19: Invalid nested draft throws error**
  - Given: A CommunicatorResponse with invalid `draft` object (missing body)
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error identifies the nested validation failure

---

## Integration Test Scenarios

### Communicator Agent End-to-End Flow

- [ ] **Test 2.7.INT.1: CommunicatorAgent.initialize() loads template successfully**
  - Given: Valid communicator.md template file exists
  - When: CommunicatorAgent.initialize() is called
  - Then: No errors are thrown
  - And: Agent is ready to handle requests

- [ ] **Test 2.7.INT.2: Communicator drafts formal reply for client**
  - Given: Mocked Claude SDK returning formal_reply response
  - And: Draft request with `recipientRelationship: 'client'`
  - When: CommunicatorAgent.draftReply() is called
  - Then: Result has `action === 'draft_reply'`
  - And: Result has `draft` with `tone === 'formal'`
  - And: `draft.body` contains "Dear" and "Sincerely"

- [ ] **Test 2.7.INT.3: Communicator drafts casual reply for colleague**
  - Given: Mocked Claude SDK returning casual_reply response
  - And: Draft request with `recipientRelationship: 'colleague'`
  - When: CommunicatorAgent.draftReply() is called
  - Then: Result has `action === 'draft_reply'`
  - And: Result has `draft` with `tone === 'casual'`
  - And: `draft.body` contains "Hey" and "Thanks"

- [ ] **Test 2.7.INT.4: Communicator drafts new message for vendor**
  - Given: Mocked Claude SDK returning professional_new response
  - And: Draft request with `type: 'new'` and `recipientRelationship: 'vendor'`
  - When: CommunicatorAgent.draftNew() is called
  - Then: Result has `action === 'draft_new'`
  - And: Result has `draft` with `tone === 'professional'`

- [ ] **Test 2.7.INT.5: Communicator suggests template when appropriate**
  - Given: Mocked Claude SDK returning suggest_template response
  - And: Draft request indicating follow-up intent
  - When: CommunicatorAgent handles the request
  - Then: Result has `action === 'suggest_template'`
  - And: Result has `suggestedTemplate` with valid fields

- [ ] **Test 2.7.INT.6: Communicator asks clarification when needed**
  - Given: Mocked Claude SDK returning clarify response
  - And: Ambiguous draft request (multiple Johns in contacts)
  - When: CommunicatorAgent handles the request
  - Then: Result has `action === 'clarify'`
  - And: Result has `clarificationQuestion` with options

- [ ] **Test 2.7.INT.7: Communicator refines existing draft**
  - Given: Mocked Claude SDK returning refine_draft response
  - And: Existing draft and user feedback
  - When: CommunicatorAgent.refineDraft() is called
  - Then: Result has `action === 'refine_draft'`
  - And: Result has `draft` with improvements

- [ ] **Test 2.7.INT.8: recordUserEdit stores edit for learning**
  - Given: CommunicatorAgent instance
  - And: An original draft and edited draft
  - When: recordUserEdit() is called
  - Then: No errors are thrown
  - And: Edit record is validated against schema
  - And: significantChange is determined correctly

- [ ] **Test 2.7.INT.9: Communicator builds correct prompt with context**
  - Given: A DraftRequest with recipient info
  - And: Contact information available
  - And: Communication history available
  - When: buildDraftPrompt() is called
  - Then: Prompt includes recipient information
  - And: Prompt includes relationship context
  - And: Prompt includes communication history

- [ ] **Test 2.7.INT.10: toneReasoning is populated in responses**
  - Given: Mocked Claude SDK with response including toneReasoning
  - When: CommunicatorAgent handles any draft request
  - Then: Result has `toneReasoning` field populated
  - And: toneReasoning explains why the tone was chosen

---

## Test File Mapping

| Test ID | File Location | Test Type |
|---------|--------------|-----------|
| 2.7.1.* | `tests/unit/story-2.7-communicator.spec.ts` | Unit |
| 2.7.2.* | `tests/unit/story-2.7-communicator.spec.ts` | Unit |
| 2.7.3.* | `tests/unit/story-2.7-communicator.spec.ts` | Unit |
| 2.7.4.* | `tests/unit/story-2.7-communicator.spec.ts` | Unit |
| 2.7.INT.* | `tests/integration/story-2.7-communicator-tone.spec.ts` | Integration |

---

## Mock Data Requirements

### Required Mock Files

- [ ] `tests/mocks/agents/communicator.ts` - COMMUNICATOR_MOCKS export
  - `formal_reply` - Formal reply to client with "Dear/Sincerely"
  - `casual_reply` - Casual reply to colleague with "Hey/Thanks"
  - `professional_new` - Professional new message to vendor
  - `suggest_template` - Template suggestion for follow-up
  - `clarify` - Clarification question with multiple options
  - `refine_draft` - Refined draft with improvements

### Mock Schema Alignment

All mocks MUST align with CommunicatorResponseSchema using:
- `draft: { subject?, body, to?, cc?, tone, formality, suggestedGreeting?, suggestedSignoff? }` structure
- `suggestedTemplate: { templateId, templateName, category, matchReason, preview }` structure
- `clarificationQuestion: { question, context?, options? }` structure
- `recipientContext: { relationship, lastInteraction?, communicationPreference? }` structure
- `toneReasoning` explaining the tone choice

---

## Coverage Requirements

| Acceptance Criteria | Happy Path | Edge Cases | Error Handling | Total |
|---------------------|------------|------------|----------------|-------|
| AC1: Prompt Logic | 8 | 2 | 1 | 11 |
| AC2: Relationship Drafting | 9 | 3 | 5 | 17 |
| AC3: Never Auto-Send | 10 | 4 | 4 | 18 |
| AC4: Schema Validation | 12 | 4 | 3 | 19 |
| **Total** | **39** | **13** | **13** | **65** |

**Integration Tests:** 10 additional tests

---

## Dependencies

### Upstream (must be done first)

- Story 2.2 (Agent Prompt Templates) - `loadAgentTemplate()` and `interpolateTemplate()` functions
- Story 2.1 (Butler Agent Core) - Butler delegates to Communicator
- Story 2.3 (Sub-Agent Spawning) - Agent spawning mechanism
- `.claude/agents/communicator.md` - Agent prompt file must exist (pure markdown, > 1000 chars)

### Downstream (blocked by this story)

- Story 2.12 (Workflow Skill Adaptation) - `/draft` workflow uses Communicator Agent
- Epic 5 (Email Communication) - All email drafting features
- Story 5.3 (AI Draft Generation) - Draft generation via chat
- Epic 10 (Memory & Recall) - Preference learning storage (mocked in this story)

### Test Infrastructure

- `zod` package for schema validation
- `zod-to-json-schema` package for Claude API integration
- Vitest for test execution
- Mock infrastructure from `tests/mocks/agents/`

---

## Implementation Checklist for DEV

### Task 1: Create Communicator Agent Prompt (AC1)

- [ ] Create `.claude/agents/communicator.md` (pure markdown, no frontmatter)
- [ ] Include tone-matching instructions
- [ ] Include relationship-based formality adjustment
- [ ] Include template usage instructions
- [ ] Include CRITICAL safety constraint (NEVER auto-send)
- [ ] Include learning instructions
- [ ] Verify prompt length > 1000 characters
- [ ] Run tests: `npm run test -- tests/unit/story-2.7-communicator.spec.ts --grep "AC1"`

### Task 2: Create Communicator Schema Definitions (AC2, AC3, AC4)

- [ ] Create `agent-server/src/agents/schemas/communicator.ts`
- [ ] Define ToneSchema enum
- [ ] Define FormalityLevelSchema enum
- [ ] Define RelationshipTypeSchema enum
- [ ] Define DraftSchema with all fields
- [ ] Define TemplateSuggestionSchema
- [ ] Define ClarificationSchema
- [ ] Define CommunicatorResponseSchema (EXCLUDE 'send' from action enum)
- [ ] Define UserEditRecordSchema
- [ ] Export all types
- [ ] Export from `agent-server/src/agents/schemas/index.ts`
- [ ] Run tests: `npm run test -- tests/unit/story-2.7-communicator.spec.ts --grep "AC2|AC3|AC4"`

### Task 3: Implement Communicator Agent Class (AC1-4)

- [ ] Create `agent-server/src/agents/communicator/index.ts`
- [ ] Implement `initialize()` to load template
- [ ] Implement `draftReply(request, context)` method
- [ ] Implement `draftNew(request, context)` method
- [ ] Implement `refineDraft(currentDraft, feedback, context)` method
- [ ] Implement `recordUserEdit(editData)` method (mocked storage)
- [ ] Implement `determineDefaultTone(relationship)` helper
- [ ] Implement `buildDraftPrompt()` helper
- [ ] Export from `agent-server/src/agents/index.ts`
- [ ] Run integration tests: `npm run test -- tests/integration/story-2.7-communicator-tone.spec.ts`

### Task 4: Create Test Mocks

- [ ] Create `tests/mocks/agents/communicator.ts`
- [ ] Implement COMMUNICATOR_MOCKS.formal_reply
- [ ] Implement COMMUNICATOR_MOCKS.casual_reply
- [ ] Implement COMMUNICATOR_MOCKS.professional_new
- [ ] Implement COMMUNICATOR_MOCKS.suggest_template
- [ ] Implement COMMUNICATOR_MOCKS.clarify
- [ ] Implement COMMUNICATOR_MOCKS.refine_draft
- [ ] Export from `tests/mocks/agents/index.ts`

---

## Running Tests

```bash
# Run all tests for this story
npm run test -- tests/unit/story-2.7-communicator.spec.ts tests/integration/story-2.7-communicator-tone.spec.ts

# Run specific AC tests
npm run test -- tests/unit/story-2.7-communicator.spec.ts --grep "AC1"
npm run test -- tests/unit/story-2.7-communicator.spec.ts --grep "AC2"
npm run test -- tests/unit/story-2.7-communicator.spec.ts --grep "AC3"
npm run test -- tests/unit/story-2.7-communicator.spec.ts --grep "AC4"

# Run integration tests only
npm run test -- tests/integration/story-2.7-communicator-tone.spec.ts

# Run tests with coverage
npm run test -- --coverage --coverage.include="agent-server/src/agents/communicator/**"

# Debug specific test
npm run test -- tests/unit/story-2.7-communicator.spec.ts --debug --grep "2.7.1.1"
```

---

## Gate Criteria

Story 2.7 is complete when:

- [ ] All 75 test scenarios pass (65 unit + 10 integration)
- [ ] Code coverage >= 80% on `agent-server/src/agents/communicator/`
- [ ] Code coverage >= 80% on `agent-server/src/agents/schemas/communicator.ts`
- [ ] 'send' action is explicitly EXCLUDED from CommunicatorResponseSchema
- [ ] Prompt includes NEVER auto-send constraint
- [ ] Tone correctly varies by relationship type
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

- **CRITICAL Safety Constraint**: The Communicator Agent MUST NEVER have a 'send' action. All communications require explicit user approval. This is tested in 2.7.3.1 and 2.7.3.2.
- **Agent Model**: Communicator uses Sonnet (per Story 2.2 AGENT_MODELS constant) for good balance of quality and speed.
- **Learning Storage**: User edit learning storage happens in Epic 10. For Story 2.7, the `recordUserEdit()` method mocks the storage interface.
- **Tone/Formality Mapping**: The six relationship types map to specific tone and formality levels as documented in the story's Dev Notes section.
- **Pattern Reference**: Follow the same structure as Story 2.5 (Triage) and Story 2.6 (Scheduler) for agent class implementation.

---

**Document Generated:** 2026-01-15
**Generated By:** TEA (Test Architect Agent) - ATDD Workflow
**Source Story:** `thoughts/implementation-artifacts/stories/story-2-7-communicator-agent-definition.md`
**Test Design Reference:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.7 section)
