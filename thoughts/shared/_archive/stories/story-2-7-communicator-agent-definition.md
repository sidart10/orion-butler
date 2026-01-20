# Story 2.7: Communicator Agent Definition

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-7-communicator-agent-definition
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a user,
I want a specialist agent for drafting messages,
So that my communications match my tone and style.

---

## Acceptance Criteria

### AC1: Communicator Agent Prompt with Tone-Matching Instructions

**Given** the Communicator Agent is invoked (ARCH-014)
**When** it drafts a message
**Then** it references my past communications for tone
**And** it considers the recipient relationship
**And** it produces a draft with appropriate formality

- [ ] Communicator agent prompt (.claude/agents/communicator.md) includes tone-matching instructions
- [ ] Prompt includes relationship-based formality adjustment logic
- [ ] Prompt includes sections for: persona, tone analysis, formality levels, template usage
- [ ] Prompt references past communication patterns for the recipient
- [ ] Prompt length > 1000 characters (core agent requirement from Story 2.2)

### AC2: Recipient Relationship-Based Drafting

**Given** a recipient with a known relationship type (client, colleague, friend, family, vendor)
**When** the Communicator drafts a message
**Then** the tone and formality adjust based on relationship
**And** appropriate salutations and sign-offs are used

- [ ] CommunicatorResponseSchema includes `draft.tone: 'formal' | 'casual' | 'professional' | 'friendly'`
- [ ] Formality levels: formal (Dear/Sincerely), professional (Hi/Best regards), casual (Hey/Thanks), friendly (name only/cheers)
- [ ] Recipient relationship informs default tone selection
- [ ] User can override suggested tone via clarification

### AC3: Draft-Review-Send Workflow (Never Auto-Send)

**Given** the agent generates a draft
**When** I review it
**Then** I can edit before sending (never auto-send)
**And** edits inform future drafts (learning)

- [ ] CommunicatorResponseSchema `action` enum NEVER includes 'send' (explicit constraint)
- [ ] Valid actions: `'draft_reply' | 'draft_new' | 'suggest_template' | 'refine_draft' | 'clarify'`
- [ ] Draft appears in canvas for user editing (via TipTap)
- [ ] User edits are captured and stored for preference learning
- [ ] `recordUserEdit()` method stores original draft, edited draft, and recipient for learning

### AC4: CommunicatorResult Schema Validation

**Given** the Communicator Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the CommunicatorResponseSchema

- [ ] CommunicatorResponseSchema (Zod) validates all agent output fields
- [ ] Schema includes: `action`, `draft`, `suggestedTemplate`, `clarificationQuestion`
- [ ] DraftSchema includes: `subject`, `body`, `to`, `cc`, `tone`, `formality`
- [ ] Invalid tone values throw validation errors
- [ ] Schema exports types for TypeScript consumption

---

## Tasks / Subtasks

### Task 1: Create/Update Communicator Agent Prompt (AC: #1, #2)

- [ ] 1.1 Create `.claude/agents/communicator.md` if not exists (pure markdown format, no frontmatter)
- [ ] 1.2 Include tone-matching instructions:
  - Analyze user's past communication style
  - Match user's typical phrasing and vocabulary
  - Preserve user's characteristic sign-offs
  - Consider time of day and urgency in tone
- [ ] 1.3 Include relationship-based formality adjustment:
  - `client`: Formal - "Dear [Name]", "Sincerely", professional language
  - `colleague`: Professional - "Hi [Name]", "Best regards", clear and efficient
  - `vendor`: Professional - "Hello [Name]", "Thank you", transactional
  - `friend`: Casual - "Hey [Name]", "Thanks!", conversational
  - `family`: Friendly - First name only, informal, warm
- [ ] 1.4 Include template usage instructions:
  - When to suggest pre-saved templates
  - How to interpolate template variables
  - Template categories: follow-up, introduction, thank-you, meeting-request
- [ ] 1.5 Include CRITICAL safety constraint:
  - "NEVER auto-send messages"
  - "ALWAYS produce drafts for user review"
  - "User MUST explicitly approve and click send"
- [ ] 1.6 Include learning instructions:
  - Track when user edits drafts significantly
  - Note tone preferences per recipient
  - Adjust future drafts based on corrections
- [ ] 1.7 Verify prompt length > 1000 characters

### Task 2: Create Communicator Schema Definitions (AC: #3, #4)

- [ ] 2.1 Create `agent-server/src/agents/schemas/communicator.ts`:
```typescript
import { z } from 'zod';

// Tone levels for communication
export const ToneSchema = z.enum(['formal', 'casual', 'professional', 'friendly']);

// Formality levels with associated greetings/sign-offs
export const FormalityLevelSchema = z.enum([
  'formal',      // Dear/Sincerely
  'professional', // Hi/Best regards
  'casual',      // Hey/Thanks
  'friendly',    // Name only/Cheers
]);

// Recipient relationship types
export const RelationshipTypeSchema = z.enum([
  'client',
  'colleague',
  'vendor',
  'friend',
  'family',
  'unknown',
]);

// Draft content schema
export const DraftSchema = z.object({
  subject: z.string().optional(), // For email drafts
  body: z.string(),
  to: z.string().email().optional(), // Primary recipient
  cc: z.array(z.string().email()).optional(),
  tone: ToneSchema,
  formality: FormalityLevelSchema,
  suggestedGreeting: z.string().optional(),
  suggestedSignoff: z.string().optional(),
});

// Template suggestion schema
export const TemplateSuggestionSchema = z.object({
  templateId: z.string(),
  templateName: z.string(),
  category: z.enum(['follow_up', 'introduction', 'thank_you', 'meeting_request', 'custom']),
  matchReason: z.string(),
  preview: z.string(), // First 100 chars
});

// Clarification question schema
export const ClarificationSchema = z.object({
  question: z.string(),
  context: z.string().optional(),
  options: z.array(z.string()).optional(), // Suggested answers
});

// Main communicator response schema (aligned with test-infra-agent-schemas.md)
export const CommunicatorResponseSchema = z.object({
  action: z.enum([
    'draft_reply',      // Replying to an email/message
    'draft_new',        // New message composition
    'suggest_template', // Suggesting a saved template
    'refine_draft',     // Improving an existing draft
    'clarify',          // Need more information
  ]), // NOTE: 'send' is INTENTIONALLY excluded - never auto-send
  draft: DraftSchema.optional(),
  suggestedTemplate: TemplateSuggestionSchema.optional(),
  clarificationQuestion: ClarificationSchema.optional(),
  recipientContext: z.object({
    relationship: RelationshipTypeSchema,
    lastInteraction: z.string().datetime().optional(),
    communicationPreference: z.string().optional(),
  }).optional(),
  toneReasoning: z.string().optional(), // Why this tone was chosen
});

// User edit record for learning
export const UserEditRecordSchema = z.object({
  originalDraft: z.string(),
  editedDraft: z.string(),
  recipient: z.string().email(),
  recipientRelationship: RelationshipTypeSchema.optional(),
  editTimestamp: z.string().datetime(),
  significantChange: z.boolean(), // If edit changed tone/structure substantially
});

export type CommunicatorResponse = z.infer<typeof CommunicatorResponseSchema>;
export type Draft = z.infer<typeof DraftSchema>;
export type Tone = z.infer<typeof ToneSchema>;
export type FormalityLevel = z.infer<typeof FormalityLevelSchema>;
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;
export type TemplateSuggestion = z.infer<typeof TemplateSuggestionSchema>;
export type UserEditRecord = z.infer<typeof UserEditRecordSchema>;
```
- [ ] 2.2 Export schema from `agent-server/src/agents/schemas/index.ts`

### Task 3: Implement Communicator Agent Class (AC: #1, #2, #3, #4)

**Note:** Preference learning storage in Epic 10; this story mocks the storage interface.

- [ ] 3.1 Create `agent-server/src/agents/communicator/index.ts`:
```typescript
// Key interfaces and class structure - follows Story 2.5/2.6 pattern
import Anthropic from '@anthropic-ai/sdk';
import { loadAgentTemplate, interpolateTemplate } from '../templates';
import {
  CommunicatorResponseSchema,
  UserEditRecordSchema,
  type CommunicatorResponse,
  type Draft,
  type RelationshipType,
  type UserEditRecord,
} from '../schemas/communicator';
import type { AgentContext, Contact, CommunicationHistory } from '../../types';

export interface DraftRequest {
  type: 'reply' | 'new';
  originalEmail?: {
    from: string;
    subject?: string;
    body?: string;
  };
  recipientEmail?: string;
  recipientRelationship?: RelationshipType;
  intent?: string; // What the user wants to communicate
  context?: string; // Additional context
}

export class CommunicatorAgent {
  private client: Anthropic;
  private template: string;

  async initialize(): Promise<void> {
    const loaded = await loadAgentTemplate('communicator');
    this.template = loaded.systemPrompt;
  }

  async draftReply(request: DraftRequest, context: AgentContext): Promise<CommunicatorResponse> {
    // 1. Build system prompt via interpolateTemplate()
    // 2. Fetch recipient contact info and communication history
    // 3. Determine appropriate tone based on relationship
    // 4. Call Claude API with structured output (CommunicatorResponseSchema)
    // 5. Parse and validate response
    // See architecture.md#6.2 for agent lifecycle implementation details
  }

  async draftNew(request: DraftRequest, context: AgentContext): Promise<CommunicatorResponse> {
    // Same pattern as draftReply but for new messages
  }

  async refineDraft(
    currentDraft: string,
    feedback: string,
    context: AgentContext,
  ): Promise<CommunicatorResponse> {
    // Refine existing draft based on user feedback
  }

  async recordUserEdit(edit: Omit<UserEditRecord, 'editTimestamp'>): Promise<void> {
    // 1. Validate with UserEditRecordSchema
    // 2. Determine if edit was significant (tone change, structure change)
    // 3. Store for preference learning (mocked in Story 2.7, real in Epic 10)
    // 4. Update recipient-specific preferences if significant
  }

  private determineDefaultTone(relationship: RelationshipType): { tone: string; formality: string } {
    const toneMap: Record<RelationshipType, { tone: string; formality: string }> = {
      client: { tone: 'formal', formality: 'formal' },
      colleague: { tone: 'professional', formality: 'professional' },
      vendor: { tone: 'professional', formality: 'professional' },
      friend: { tone: 'casual', formality: 'casual' },
      family: { tone: 'friendly', formality: 'friendly' },
      unknown: { tone: 'professional', formality: 'professional' },
    };
    return toneMap[relationship];
  }

  private buildDraftPrompt(
    request: DraftRequest,
    contact: Contact | null,
    history: CommunicationHistory[],
    context: AgentContext,
  ): string {
    // Format recipient info, communication history, user intent
    // Return formatted prompt string for Claude
  }
}
```
- [ ] 3.2 Export from `agent-server/src/agents/index.ts`

### Task 4: Create Test Mocks (AC: #2, #3, #4)

- [ ] 4.1 Create `tests/mocks/agents/communicator.ts`:
```typescript
// Full mock data aligned with test-infra-agent-schemas.md section 2.4 (Story 2.7)
import type { CommunicatorResponse } from '@/agents/schemas/communicator';

export const COMMUNICATOR_MOCKS = {
  // Scenario: Formal reply to a client
  formal_reply: {
    action: 'draft_reply',
    draft: {
      subject: 'Re: Contract Review Request',
      body: `Dear Mr. Thompson,

Thank you for reaching out regarding the contract review. I have carefully reviewed the proposed terms and would like to schedule a call to discuss a few clarifications.

Please let me know your availability this week for a 30-minute discussion.

Sincerely,
[User Name]`,
      to: 'thompson@bigcorp.com',
      tone: 'formal',
      formality: 'formal',
      suggestedGreeting: 'Dear Mr. Thompson,',
      suggestedSignoff: 'Sincerely,',
    },
    recipientContext: {
      relationship: 'client',
      lastInteraction: '2026-01-10T14:30:00Z',
      communicationPreference: 'email',
    },
    toneReasoning: 'Client relationship requires formal tone. Past communications have been formal.',
  } satisfies CommunicatorResponse,

  // Scenario: Casual reply to a colleague
  casual_reply: {
    action: 'draft_reply',
    draft: {
      subject: 'Re: Quick question about the API',
      body: `Hey Alice,

Good question! The endpoint you're looking for is /api/v2/users. Let me know if you need any help with the integration.

Thanks!`,
      to: 'alice@mycompany.com',
      tone: 'casual',
      formality: 'casual',
      suggestedGreeting: 'Hey Alice,',
      suggestedSignoff: 'Thanks!',
    },
    recipientContext: {
      relationship: 'colleague',
      lastInteraction: '2026-01-14T09:00:00Z',
    },
    toneReasoning: 'Colleague relationship allows casual tone. Past interactions have been informal.',
  } satisfies CommunicatorResponse,

  // Scenario: Professional new message to vendor
  professional_new: {
    action: 'draft_new',
    draft: {
      subject: 'Renewal Quote Request',
      body: `Hi Sarah,

I hope this message finds you well. We're approaching our annual renewal and I'd like to request an updated quote for our current subscription tier.

Could you please send over the renewal pricing at your earliest convenience?

Best regards,
[User Name]`,
      to: 'sarah@vendor.com',
      tone: 'professional',
      formality: 'professional',
      suggestedGreeting: 'Hi Sarah,',
      suggestedSignoff: 'Best regards,',
    },
    recipientContext: {
      relationship: 'vendor',
    },
    toneReasoning: 'Vendor relationship uses professional but friendly tone for ongoing business relationship.',
  } satisfies CommunicatorResponse,

  // Scenario: Template suggestion
  suggest_template: {
    action: 'suggest_template',
    suggestedTemplate: {
      templateId: 'tmpl_follow_up_001',
      templateName: 'Meeting Follow-up',
      category: 'follow_up',
      matchReason: 'User mentioned following up on yesterday\'s meeting',
      preview: 'Hi [Name], Thank you for meeting with me yesterday. I wanted to follow up on...',
    },
  } satisfies CommunicatorResponse,

  // Scenario: Clarification needed
  clarify: {
    action: 'clarify',
    clarificationQuestion: {
      question: 'Who would you like to send this message to?',
      context: 'I found multiple contacts named John. Please specify:',
      options: [
        'John Smith (client at TechCorp)',
        'John Davis (colleague)',
        'John Miller (vendor)',
      ],
    },
  } satisfies CommunicatorResponse,

  // Scenario: Draft refinement
  refine_draft: {
    action: 'refine_draft',
    draft: {
      subject: 'Re: Project Update',
      body: `Hi team,

I've incorporated your feedback. Here's the revised update with more specific timeline details:

- Phase 1: Complete by Jan 20
- Phase 2: Complete by Feb 5
- Final review: Feb 10

Let me know if this works for everyone.

Best,
[User Name]`,
      to: 'team@mycompany.com',
      tone: 'professional',
      formality: 'professional',
    },
    toneReasoning: 'Refined draft to be more specific while maintaining professional team tone.',
  } satisfies CommunicatorResponse,
};
```
- [ ] 4.2 Export from `tests/mocks/agents/index.ts`

### Task 5: Write Tests (AC: #1, #2, #3, #4)

- [ ] 5.1 Create `tests/unit/story-2.7-communicator.spec.ts`:
```typescript
import { test, expect, describe, vi } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import {
  CommunicatorResponseSchema,
  DraftSchema,
  ToneSchema,
  FormalityLevelSchema,
  RelationshipTypeSchema,
  UserEditRecordSchema,
} from '@/agents/schemas/communicator';
import { COMMUNICATOR_MOCKS } from '../mocks/agents/communicator';

describe('Story 2.7: Communicator Agent Definition', () => {

  test('2.7.1 - Communicator prompt includes tone-matching instructions', async () => {
    const template = await loadAgentTemplate('communicator');

    expect(template.systemPrompt).toMatch(/tone/i);
    expect(template.systemPrompt).toMatch(/formal|casual|professional/i);
    expect(template.systemPrompt).toMatch(/relationship|recipient/i);
    expect(template.systemPrompt).toMatch(/past.*communication|history/i);

    // Should be substantial (> 1000 chars)
    expect(template.systemPrompt.length).toBeGreaterThan(1000);
  });

  test('2.7.2a - draft formality varies by recipient relationship', () => {
    // Formal client reply
    const clientDraft = COMMUNICATOR_MOCKS.formal_reply;
    expect(clientDraft.draft!.tone).toBe('formal');
    expect(clientDraft.draft!.formality).toBe('formal');
    expect(clientDraft.draft!.body).toMatch(/dear|sincerely/i);

    // Casual colleague reply
    const colleagueDraft = COMMUNICATOR_MOCKS.casual_reply;
    expect(colleagueDraft.draft!.tone).toBe('casual');
    expect(colleagueDraft.draft!.formality).toBe('casual');
    expect(colleagueDraft.draft!.body).toMatch(/hey|thanks/i);
  });

  test('2.7.2b - relationship types are validated correctly', () => {
    const validRelationships = ['client', 'colleague', 'vendor', 'friend', 'family', 'unknown'];

    for (const relationship of validRelationships) {
      expect(() => RelationshipTypeSchema.parse(relationship)).not.toThrow();
    }

    // Invalid relationship
    expect(() => RelationshipTypeSchema.parse('invalid')).toThrow();
  });

  test('2.7.4a - Communicator NEVER has send action (explicit safety constraint)', async () => {
    const template = await loadAgentTemplate('communicator');

    // Explicit constraints in prompt
    expect(template.systemPrompt).toMatch(/never.*auto.*send|do not.*send.*automatically/i);
    expect(template.systemPrompt).toMatch(/user.*review|approval.*required/i);

    // Schema should not have send action
    const validActions = ['draft_reply', 'draft_new', 'suggest_template', 'refine_draft', 'clarify'];

    // 'send' should NOT be a valid action
    expect(() => CommunicatorResponseSchema.parse({
      action: 'send',
      draft: COMMUNICATOR_MOCKS.formal_reply.draft
    })).toThrow();

    // All valid actions should pass
    for (const action of validActions) {
      expect(() => CommunicatorResponseSchema.parse({ action })).not.toThrow();
    }
  });

  test('2.7.4b - CommunicatorResponse schema validates correctly', () => {
    // Valid formal reply
    expect(() => CommunicatorResponseSchema.parse(COMMUNICATOR_MOCKS.formal_reply)).not.toThrow();

    // Valid casual reply
    expect(() => CommunicatorResponseSchema.parse(COMMUNICATOR_MOCKS.casual_reply)).not.toThrow();

    // Valid template suggestion
    expect(() => CommunicatorResponseSchema.parse(COMMUNICATOR_MOCKS.suggest_template)).not.toThrow();

    // Valid clarification
    expect(() => CommunicatorResponseSchema.parse(COMMUNICATOR_MOCKS.clarify)).not.toThrow();
  });

  test('2.7.4c - Draft schema validates tone and formality', () => {
    const validDraft = COMMUNICATOR_MOCKS.formal_reply.draft;
    expect(() => DraftSchema.parse(validDraft)).not.toThrow();

    // Invalid tone
    const invalidTone = { ...validDraft, tone: 'aggressive' };
    expect(() => DraftSchema.parse(invalidTone)).toThrow();

    // Invalid formality
    const invalidFormality = { ...validDraft, formality: 'very_formal' };
    expect(() => DraftSchema.parse(invalidFormality)).toThrow();
  });

  test('2.7.5 - UserEditRecord schema for learning', () => {
    const validEdit = {
      originalDraft: 'Dear Mr. Smith,\n\nI hope this finds you well.',
      editedDraft: 'Hi John,\n\nHope you\'re doing well!',
      recipient: 'john@example.com',
      recipientRelationship: 'colleague',
      editTimestamp: '2026-01-15T10:30:00Z',
      significantChange: true,
    };

    expect(() => UserEditRecordSchema.parse(validEdit)).not.toThrow();

    // Invalid: missing required fields
    const missingRecipient = { ...validEdit, recipient: undefined };
    expect(() => UserEditRecordSchema.parse(missingRecipient)).toThrow();

    // Invalid: bad email format
    const badEmail = { ...validEdit, recipient: 'not-an-email' };
    expect(() => UserEditRecordSchema.parse(badEmail)).toThrow();
  });

  test('2.7.6 - recipientContext includes relationship and last interaction', () => {
    const response = COMMUNICATOR_MOCKS.formal_reply;

    expect(response.recipientContext).toBeDefined();
    expect(response.recipientContext!.relationship).toBe('client');
    expect(response.recipientContext!.lastInteraction).toBeTruthy();
  });

  test('2.7.7 - toneReasoning explains tone selection', () => {
    const formalResponse = COMMUNICATOR_MOCKS.formal_reply;
    expect(formalResponse.toneReasoning).toBeDefined();
    expect(formalResponse.toneReasoning).toMatch(/client|formal/i);

    const casualResponse = COMMUNICATOR_MOCKS.casual_reply;
    expect(casualResponse.toneReasoning).toBeDefined();
    expect(casualResponse.toneReasoning).toMatch(/colleague|casual|informal/i);
  });

});
```
- [ ] 5.2 Create `tests/integration/story-2.7-communicator-tone.spec.ts` for integration tests with mocked Claude

---

## Dev Notes

### Pattern from Story 2.5 and 2.6 (Triage/Scheduler Agents)

Stories 2.5 and 2.6 established the canonical pattern for agent definition stories. Follow these patterns:

| Component | Pattern | Reference |
|-----------|---------|-----------|
| Zod Schema Structure | `z.object({...}).min().max()` with enums | `agents/schemas/triage.ts` |
| Agent Class Pattern | `initialize()` + `handleRequest()` + private helpers | `agents/triage/index.ts` |
| Test File Naming | `story-2.X-<agent>.spec.ts` | `tests/unit/story-2.5-triage.spec.ts` |
| Mock Structure | `AGENT_MOCKS` object with scenario keys | `tests/mocks/agents/triage.ts` |

### Architecture Patterns (MUST FOLLOW)

**Communicator Agent in Orion Hierarchy:**
```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (Story 2.5)
    +-- Scheduler Agent (Story 2.6)
    +-- Communicator Agent (THIS STORY) <-- Email/message drafting
    +-- Navigator Agent (Story 2.8)
    +-- Preference Learner Agent (Story 2.9)
```

**Agent Model:** Sonnet (from Story 2.2 constants - `AGENT_MODELS.communicator === 'sonnet'`)

### Communicator Agent Key Behaviors (PRD 5.2.4)

From PRD section 5.2.4:
1. **Matches user's writing tone** - Analyze past communications
2. **Uses contact-specific preferences** - Adjust formality per relationship
3. **Applies templates where appropriate** - Template matching and interpolation
4. **Draft-review-send workflow** - NEVER auto-sends

### CRITICAL Safety Constraint

**NEVER AUTO-SEND:** The Communicator Agent MUST NEVER have a 'send' action. All communications require explicit user approval. This is a security and trust requirement from PRD and architecture.

```typescript
// CORRECT - action enum excludes 'send'
action: z.enum(['draft_reply', 'draft_new', 'suggest_template', 'refine_draft', 'clarify'])

// WRONG - never include 'send'
action: z.enum(['draft_reply', 'draft_new', 'send']) // PROHIBITED
```

### Tone and Formality Mapping

| Relationship | Default Tone | Formality | Greeting | Sign-off |
|--------------|--------------|-----------|----------|----------|
| client | formal | formal | "Dear [Title] [Name]," | "Sincerely," |
| colleague | professional | professional | "Hi [Name]," | "Best regards," |
| vendor | professional | professional | "Hello [Name]," | "Thank you," |
| friend | casual | casual | "Hey [Name]," | "Thanks!" |
| family | friendly | friendly | "[Name]," | "Love," or "Cheers," |
| unknown | professional | professional | "Hello," | "Best," |

### Learning from User Edits (Epic 10 Dependency)

User edits are stored for preference learning. Significant changes (tone shift, structure change) inform future drafts:

1. **Tone correction** - User changes "Dear" to "Hey" → Learn casual preference for recipient
2. **Content addition** - User adds details → Note information gaps
3. **Trimming** - User removes content → Learn conciseness preference

Storage in Epic 10 (Story 10.7: Learned Preferences Storage). For Story 2.7, mock the storage interface.

### Tools Used by Communicator

The Communicator Agent will use these tools (connected in Epic 3/5):
- `GMAIL_CREATE_DRAFT` - Create email drafts (via Butler approval)
- `GMAIL_SEND_EMAIL` - Send after user approval (ONLY via Butler)
- `SLACK_SEND_MESSAGE` - Post Slack messages (via Butler approval)

For Story 2.7, we mock tool calls. Real integration happens in Epic 5.

### Database Schema Alignment

From architecture.md section 4, relevant tables:
```sql
-- Communication templates (Epic 10)
communication_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- follow_up, introduction, thank_you, meeting_request
    body TEXT NOT NULL,
    variables TEXT, -- JSON array of variable names
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Learned preferences (Epic 10)
preferences (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    source TEXT NOT NULL, -- 'explicit' | 'observed' | 'inferred'
    confidence REAL DEFAULT 0.5,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Project Structure Notes

```
.claude/
  agents/
    communicator.md       # Agent prompt template (CREATE - no frontmatter, pure markdown)

agent-server/
  src/
    agents/
      schemas/
        communicator.ts   # CommunicatorResponseSchema, DraftSchema, etc.
        index.ts          # Re-export
      communicator/
        index.ts          # CommunicatorAgent class
      index.ts            # Re-export all agents

tests/
  mocks/
    agents/
      communicator.ts     # COMMUNICATOR_MOCKS
      index.ts            # Re-export
  unit/
    story-2.7-communicator.spec.ts
  integration/
    story-2.7-communicator-tone.spec.ts
```

### Critical Design Constraints

1. **NEVER include 'send' action** - Security requirement, all sends via Butler
2. **Tone MUST be validated** - Zod enum: formal, casual, professional, friendly
3. **Relationship MUST inform default tone** - But user can override
4. **Model is Sonnet** - Good balance of quality and speed for drafting
5. **Depends on Story 2.2** - Template loading infrastructure
6. **Zod to JSON Schema conversion** - If using structured outputs, use `zodToJsonSchema()` from `zod-to-json-schema` package (same pattern as Story 2.5)

### Testing Standards

From test-design-epic-2.md Story 2.7 section:
| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.7.1 | Unit | Prompt includes tone matching | Instructions present |
| 2.7.2 | Integration | Draft varies by relationship | Different formality |
| 2.7.3 | E2E | Draft appears in canvas | Editable draft visible |
| 2.7.4 | Unit | Never auto-sends | Explicit action required |
| 2.7.5 | Integration | User edits stored | Learning record created |

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.2 (Agent Prompt Templates)** - Template loading infrastructure, `loadAgentTemplate()` from `agent-server/src/agents/templates`
- **Story 2.1 (Butler Agent Core)** - Butler delegates to Communicator
- **Story 2.3 (Sub-Agent Spawning)** - Agent spawning mechanism for delegation

### Downstream Dependencies (blocked by this story)

- **Story 2.12 (Workflow Skill Adaptation)** - `/draft` workflow uses Communicator Agent
- **Epic 5 (Email Communication)** - All email drafting features depend on this agent
- **Story 5.3 (AI Draft Generation)** - Draft generation via chat
- **Epic 10 (Memory & Recall)** - Preference learning storage

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.7] - Story definition
- [Source: thoughts/planning-artifacts/architecture.md#6.1] - Agent hierarchy
- [Source: thoughts/planning-artifacts/architecture.md#ARCH-014] - Communicator Agent requirement
- [Source: thoughts/planning-artifacts/prd.md#5.2.4] - Communicator Agent key behaviors
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.7] - Test scenarios
- [Source: thoughts/implementation-artifacts/stories/story-2-6-scheduler-agent-definition.md] - Pattern reference

---

## Dev Agent Record

### Agent Model Used

(To be filled by DEV agent)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - list all files created/modified)
