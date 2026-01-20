# Story 2.5: Triage Agent Definition

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-5-triage-agent-definition
**Priority:** P0 (Core Feature)
**Risk:** HIGH

---

## Story

As a user,
I want a specialist agent for inbox processing,
So that my emails are analyzed and prioritized intelligently.

---

## Acceptance Criteria

### AC1: Triage Agent Prompt with Scoring Criteria

**Given** the Triage Agent is invoked (ARCH-012)
**When** it processes inbox items
**Then** it uses structured outputs for type-safe results (ARCH-018)
**And** it calculates priority scores (0.0-1.0)
**And** it extracts action items with confidence scores

- [ ] Triage agent prompt (.claude/agents/triage.md) includes explicit scoring criteria
- [ ] Priority calculation factors documented: sender importance, urgency signals, action required, staleness
- [ ] Action extraction instructions include confidence score requirements
- [ ] Prompt length > 1000 characters (core agent requirement from Story 2.2)

### AC2: TriageResult Schema Validation

**Given** the Triage Agent analyzes an email
**When** analysis completes
**Then** results include: priority, category, suggested actions, extracted tasks
**And** results are validated against the TriageResult schema

- [ ] TriageResultSchema (Zod) validates all agent output fields
- [ ] Schema includes: `item_id`, `priority_score` (0.0-1.0), `priority_band: 'high' | 'medium' | 'low' | 'minimal'`, `priority_reasoning`
- [ ] Schema includes: `from_contact_id`, `related_project_id`, `related_area` (optional entity links)
- [ ] Schema includes: `suggested_actions`, `extracted_tasks`, `category`
- [ ] Invalid priority scores (< 0.0 or > 1.0) throw validation errors

### AC3: Structured Output Integration

**Given** the Triage Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the schema
**And** Claude's structured output feature is used with `json_schema` response format

- [ ] Agent uses Claude's `response_format: { type: 'json_schema', json_schema: { name: 'triage_result', schema: <JSON_SCHEMA>, strict: true } }`
- [ ] Zod schema is converted to JSON Schema format using `zodToJsonSchema(TriageResultSchema)` before passing to Claude API
- [ ] Beta header `anthropic-beta: structured-outputs-2025-11-13` is included in requests
- [ ] Output parsing uses `JSON.parse()` with type assertion to `TriageResult`

### AC4: Extracted Tasks with Confidence

**Given** the Triage Agent extracts action items from an email
**When** tasks are returned
**Then** each task includes a confidence score (0.0-1.0)
**And** tasks are structured with: description, due_date (optional), priority, confidence

- [ ] ExtractedTask schema: `{ description: string, due_date?: string, priority: 'high' | 'medium' | 'low', confidence: number }`
- [ ] Confidence reflects certainty of action extraction (0.0 = uncertain, 1.0 = explicit request)
- [ ] Multiple tasks can be extracted from a single email

---

## Tasks / Subtasks

### Task 1: Verify/Update Triage Agent Prompt (AC: #1)

- [ ] 1.1 Verify `.claude/agents/triage.md` exists (note: uses pure markdown format, no frontmatter required)
- [ ] 1.2 Ensure prompt includes priority scoring criteria section:
  - Sender importance (VIP contacts, known relationships)
  - Urgency signals (deadlines, escalation language, keywords)
  - Action required (questions, requests, approvals needed)
  - Staleness factor (time since received)
- [ ] 1.3 Ensure prompt includes action extraction instructions with confidence scoring
- [ ] 1.4 Ensure prompt includes category classification logic (urgent, important, fyi, newsletter)
- [ ] 1.5 Verify prompt length > 1000 characters

### Task 2: Create/Update TriageResult Schema (AC: #2)

- [ ] 2.1 Create/update `agent-server/src/agents/schemas/triage.ts`:
```typescript
import { z } from 'zod';

export const ExtractedTaskSchema = z.object({
  description: z.string(),
  due_date: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  confidence: z.number().min(0).max(1),
});

export const TriageResultSchema = z.object({
  item_id: z.string(),
  priority_score: z.number().min(0).max(1),
  priority_band: z.enum(['high', 'medium', 'low', 'minimal']),
  priority_reasoning: z.string(),

  // Entity links
  from_contact_id: z.string().optional(),
  from_contact_confidence: z.enum(['high', 'medium', 'low']),
  related_project_id: z.string().optional(),
  related_project_confidence: z.enum(['high', 'medium', 'low']),
  related_area: z.string().optional(),

  // Actions and tasks
  suggested_actions: z.array(z.enum([
    'reply_urgent',
    'reply_normal',
    'schedule_meeting',
    'create_task',
    'file_to_project',
    'archive',
    'delegate',
    'follow_up',
  ])),
  extracted_tasks: z.array(ExtractedTaskSchema),

  // Classification
  needs_response: z.boolean(),
  response_deadline: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  category: z.string(),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;
export type ExtractedTask = z.infer<typeof ExtractedTaskSchema>;
```
- [ ] 2.2 Export schema from `agent-server/src/agents/schemas/index.ts`

### Task 3: Implement Triage Agent Class (AC: #3, #4)

- [ ] 3.1 Create `agent-server/src/agents/triage/index.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { loadAgentTemplate, interpolateTemplate } from '../templates';
import { TriageResultSchema, type TriageResult } from '../schemas/triage';
import type { InboxItem, AgentContext } from '../../types';

export class TriageAgent {
  private client: Anthropic;
  private template: string;

  constructor() {
    this.client = new Anthropic();
  }

  async initialize(): Promise<void> {
    const loaded = await loadAgentTemplate('triage');
    this.template = loaded.systemPrompt;
  }

  async analyzeEmail(
    item: InboxItem,
    context: AgentContext,
  ): Promise<TriageResult> {
    const systemPrompt = interpolateTemplate(this.template, {
      user_name: context.userName,
      current_date: new Date().toISOString().split('T')[0],
      timezone: context.timezone,
    });

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: this.buildAnalysisPrompt(item, context),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'triage_result',
          schema: zodToJsonSchema(TriageResultSchema, 'TriageResult'),
          strict: true,
        },
      },
    }, {
      headers: {
        'anthropic-beta': 'structured-outputs-2025-11-13',
      },
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    return TriageResultSchema.parse(JSON.parse(textBlock.text));
  }

  private buildAnalysisPrompt(item: InboxItem, context: AgentContext): string {
    return `Analyze this inbox item and provide triage results.

ITEM:
ID: ${item.id}
Source: ${item.source_tool}
From: ${item.from_name} <${item.from_email}>
Subject: ${item.title}
Received: ${item.received_at}
Content:
${item.full_content}

CONTEXT:
Active Projects: ${context.activeProjects?.map(p => p.name).join(', ') || 'None'}
Known Contacts: ${context.knownContacts?.map(c => c.name).join(', ') || 'None'}
VIP Contacts: ${context.vipContacts?.map(c => c.email).join(', ') || 'None'}

Return a structured triage result.`;
  }
}
```
- [ ] 3.2 Export from `agent-server/src/agents/index.ts`

### Task 4: Create Test Mocks (AC: #2, #4)

- [ ] 4.1 Create `tests/mocks/agents/triage.ts`:
```typescript
import type { TriageResult } from '@/agents/schemas/triage';

export const TRIAGE_MOCKS = {
  urgent_client_email: {
    item_id: 'msg_urgent_001',
    priority_score: 0.95,
    priority_band: 'high',
    priority_reasoning: 'VIP client contact with explicit deadline request',
    from_contact_id: 'cont_vip_001',
    from_contact_confidence: 'high',
    related_project_id: 'proj_client_001',
    related_project_confidence: 'medium',
    suggested_actions: ['reply_urgent', 'create_task'],
    extracted_tasks: [
      {
        description: 'Review and respond to contract proposal',
        due_date: new Date().toISOString(),
        priority: 'high',
        confidence: 0.92,
      },
    ],
    needs_response: true,
    response_deadline: new Date().toISOString(),
    sentiment: 'neutral',
    category: 'urgent',
  } satisfies TriageResult,

  newsletter_email: {
    item_id: 'msg_newsletter_001',
    priority_score: 0.15,
    priority_band: 'minimal',
    priority_reasoning: 'Automated newsletter, no action required',
    from_contact_confidence: 'low',
    suggested_actions: ['archive'],
    extracted_tasks: [],
    needs_response: false,
    sentiment: 'neutral',
    category: 'newsletter',
  } satisfies TriageResult,

  colleague_request: {
    item_id: 'msg_colleague_001',
    priority_score: 0.65,
    priority_band: 'medium',
    priority_reasoning: 'Known colleague with reasonable request',
    from_contact_id: 'cont_colleague_001',
    from_contact_confidence: 'high',
    suggested_actions: ['reply_normal', 'schedule_meeting'],
    extracted_tasks: [
      {
        description: 'Schedule sync meeting about project status',
        priority: 'medium',
        confidence: 0.78,
      },
    ],
    needs_response: true,
    sentiment: 'positive',
    category: 'request',
  } satisfies TriageResult,
};
```
- [ ] 4.2 Export from `tests/mocks/agents/index.ts`

### Task 5: Write Tests (AC: #1, #2, #3, #4)

- [ ] 5.1 Create `tests/unit/story-2.5-triage.spec.ts`:
```typescript
import { test, expect, describe, vi } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import { TriageResultSchema, ExtractedTaskSchema } from '@/agents/schemas/triage';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';

describe('Story 2.5: Triage Agent Definition', () => {

  test('2.5.1 - Triage prompt includes scoring criteria', async () => {
    const template = await loadAgentTemplate('triage');

    // Should have priority scoring instructions
    expect(template.systemPrompt).toMatch(/priority.*score/i);
    expect(template.systemPrompt).toMatch(/0\.0.*1\.0|0-1/i);

    // Should have category definitions
    expect(template.systemPrompt).toMatch(/urgent|important|fyi|newsletter/i);

    // Should have action extraction instructions
    expect(template.systemPrompt).toMatch(/extract.*action|action.*item/i);

    // Should be substantial (> 1000 chars)
    expect(template.systemPrompt.length).toBeGreaterThan(1000);
  });

  test('2.5.2 - TriageResult schema validates correctly', () => {
    // Valid result
    const validResult = TRIAGE_MOCKS.urgent_client_email;
    expect(() => TriageResultSchema.parse(validResult)).not.toThrow();

    // Invalid: priority out of range
    const invalidPriority = { ...validResult, priority_score: 1.5 };
    expect(() => TriageResultSchema.parse(invalidPriority)).toThrow();

    // Invalid: priority below 0
    const negativePriority = { ...validResult, priority_score: -0.1 };
    expect(() => TriageResultSchema.parse(negativePriority)).toThrow();

    // Invalid: wrong category enum for suggested_actions
    const wrongAction = { ...validResult, suggested_actions: ['invalid_action'] };
    expect(() => TriageResultSchema.parse(wrongAction)).toThrow();
  });

  // Note: Test 2.5.3 is in tests/integration/story-2.5-triage-output.spec.ts
  // See Task 5.2 for integration test: "Triage produces structured output"

  test('2.5.4 - priority score is always 0.0-1.0', () => {
    const mockResults = Object.values(TRIAGE_MOCKS);

    for (const result of mockResults) {
      const validated = TriageResultSchema.parse(result);

      expect(validated.priority_score).toBeGreaterThanOrEqual(0.0);
      expect(validated.priority_score).toBeLessThanOrEqual(1.0);
    }
  });

  test('2.5.5 - extracted tasks include confidence scores', () => {
    const result = TRIAGE_MOCKS.urgent_client_email;
    const validated = TriageResultSchema.parse(result);

    for (const task of validated.extracted_tasks) {
      expect(task).toHaveProperty('confidence');
      expect(task.confidence).toBeGreaterThanOrEqual(0.0);
      expect(task.confidence).toBeLessThanOrEqual(1.0);
    }
  });

});
```
- [ ] 5.2 Create `tests/integration/story-2.5-triage-output.spec.ts` for integration tests with mocked Claude

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Triage Agent in Orion Hierarchy:**
```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (THIS STORY) <-- Inbox processing
    +-- Scheduler Agent (Story 2.6)
    +-- Communicator Agent (Story 2.7)
    +-- Navigator Agent (Story 2.8)
    +-- Preference Learner Agent (Story 2.9)
```

**Agent Model:** Sonnet (from Story 2.2 constants - `AGENT_MODELS.triage === 'sonnet'`)

### Structured Outputs Pattern (ARCH-018)

From architecture.md section 6.5:
```typescript
response_format: {
  type: 'json_schema',
  json_schema: {
    name: 'triage_result',
    schema: TriageResultSchema,
    strict: true,
  },
},
```

**Required Beta Header:** `anthropic-beta: structured-outputs-2025-11-13`

### Priority Scoring Factors

From PRD section 5.1.2:
```
Priority score (0.0-1.0) with weighted factors:
- Sender importance (contact relationship)
- Urgency signals (deadlines, escalation language)
- Action required (questions, requests)
- Staleness (time since received)
```

### Database Schema Alignment

From architecture.md section 4, inbox_items table:
```sql
priority_score REAL,           -- 0.0 to 1.0
category TEXT,                 -- meeting | request | fyi | personal
urgency TEXT,                  -- urgent | normal | low
sentiment TEXT,                -- positive | neutral | negative
detected_actions TEXT,         -- JSON array
```

Ensure TriageResult schema maps to these database fields for storage.

### Project Structure Notes

```
.claude/
  agents/
    triage.md             # Agent prompt template (EXISTS - 197 lines, no frontmatter - pure markdown prompt)

agent-server/
  src/
    agents/
      schemas/
        triage.ts         # TriageResultSchema, ExtractedTaskSchema
        index.ts          # Re-export
      triage/
        index.ts          # TriageAgent class
      index.ts            # Re-export all agents

tests/
  mocks/
    agents/
      triage.ts           # TRIAGE_MOCKS
      index.ts            # Re-export
  unit/
    story-2.5-triage.spec.ts
  integration/
    story-2.5-triage-output.spec.ts
```

### Critical Design Constraints

1. **Structured outputs are MANDATORY** - All output must be schema-validated
2. **Priority score MUST be 0.0-1.0** - Strict bounds enforced by Zod
3. **Confidence scores for all tasks** - No task without confidence
4. **Model is Sonnet** - Fast, accurate for triage (not opus)
5. **Depends on Story 2.2** - Template loading infrastructure
6. **Zod to JSON Schema conversion** - Zod schemas cannot be passed directly to Claude API; use `zodToJsonSchema()` from `zod-to-json-schema` package to convert before API calls

### Schema Field Naming (IMPORTANT)

**Use `priority_score` consistently** across all code and tests. The schema defines `priority_score` (not `priority`). Some test examples in planning docs may use `priority` - ensure all implementations use `priority_score` to match the TriageResultSchema definition.

### Testing Standards

From test-design-epic-2.md Story 2.5 section:
| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.5.1 | Unit | Prompt includes scoring criteria | Scoring instructions present |
| 2.5.2 | Unit | TriageResult schema validates | Zod parse succeeds |
| 2.5.3 | Integration | Produces structured output | Valid JSON response |
| 2.5.4 | Unit | Priority score 0.0-1.0 | Bounded values |
| 2.5.5 | Unit | Tasks include confidence | Confidence field present |

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.2 (Agent Prompt Templates)** - Template loading infrastructure, `loadAgentTemplate()` from `agent-server/src/agents/templates`
- **Story 2.1 (Butler Agent Core)** - Butler delegates to Triage

### Downstream Dependencies (blocked by this story)

- **Story 2.12 (Workflow Skill Adaptation)** - `/triage` workflow uses Triage Agent
- **Story 4.3 (Priority Scoring Engine)** - Uses Triage Agent for scoring
- **Epic 4 (Unified Inbox Experience)** - All inbox triage depends on this agent

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.5] - Story definition
- [Source: thoughts/planning-artifacts/architecture.md#6.5] - Structured outputs with Claude
- [Source: thoughts/planning-artifacts/architecture.md#section-4] - inbox_items database schema
- [Source: thoughts/planning-artifacts/prd.md#5.1.2] - Inbox triage feature requirements
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.5] - Test scenarios

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
