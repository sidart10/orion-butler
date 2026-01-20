# Test Infrastructure: Agent Structured Output Schemas

**Concern ID:** C-001
**Risk Score:** 6 (HIGH)
**Priority:** Must complete BEFORE Epic 2

---

## 1. Purpose

Define JSON schemas for each agent's structured output. Tests mock these schemas instead of relying on non-deterministic Claude responses.

**Why Critical:**
- Claude responses vary with temperature, context, model updates
- Tests asserting on exact Claude output will flake
- Structured outputs enable type-safe testing
- Mocks return schema-compliant responses deterministically

---

## 2. Core Agent Schemas

### 2.1 Butler Agent

The orchestrator that routes to specialist agents.

```typescript
// src/agents/schemas/butler.ts
import { z } from 'zod';

export const IntentClassificationSchema = z.object({
  intent: z.enum([
    'direct_answer',      // Butler handles directly
    'delegate_triage',    // Route to Triage Agent
    'delegate_schedule',  // Route to Scheduler Agent
    'delegate_draft',     // Route to Communicator Agent
    'delegate_search',    // Route to Navigator Agent
    'delegate_learn',     // Route to Preference Learner
    'clarify',           // Need more info from user
    'cannot_help'        // Outside capabilities
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  delegationContext: z.object({
    relevantEntities: z.array(z.string()).optional(),
    timeConstraints: z.string().optional(),
    userPreferences: z.array(z.string()).optional()
  }).optional()
});

export const ButlerResponseSchema = z.object({
  classification: IntentClassificationSchema,
  response: z.string().optional(),          // If direct_answer
  delegatedAgent: z.string().optional(),    // If delegate_*
  followUpQuestions: z.array(z.string()).optional()
});

export type IntentClassification = z.infer<typeof IntentClassificationSchema>;
export type ButlerResponse = z.infer<typeof ButlerResponseSchema>;
```

**Test Mock:**
```typescript
// tests/mocks/agents/butler.ts
export const BUTLER_MOCKS = {
  direct_greeting: {
    classification: {
      intent: 'direct_answer',
      confidence: 0.95,
      reasoning: 'Simple greeting, no delegation needed'
    },
    response: 'Hello! How can I help you today?'
  },

  delegate_to_triage: {
    classification: {
      intent: 'delegate_triage',
      confidence: 0.88,
      reasoning: 'User asking about inbox prioritization',
      delegationContext: {
        relevantEntities: ['inbox', 'emails'],
        timeConstraints: 'today'
      }
    },
    delegatedAgent: 'triage'
  },

  delegate_to_scheduler: {
    classification: {
      intent: 'delegate_schedule',
      confidence: 0.92,
      reasoning: 'User wants to schedule a meeting',
      delegationContext: {
        relevantEntities: ['John Smith', 'project review'],
        timeConstraints: 'this week'
      }
    },
    delegatedAgent: 'scheduler'
  }
};
```

---

### 2.2 Triage Agent

Inbox processing and priority scoring.

```typescript
// src/agents/schemas/triage.ts
import { z } from 'zod';

export const ActionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  confidence: z.number().min(0).max(1),
  sourceText: z.string(),  // Original text that triggered extraction
  suggestedProject: z.string().optional()
});

export const TriageResultSchema = z.object({
  emailId: z.string(),
  priority: z.number().min(0).max(1),
  priorityReasoning: z.string(),
  category: z.enum([
    'urgent',
    'important',
    'meeting_request',
    'action_required',
    'fyi',
    'newsletter',
    'promotional',
    'spam'
  ]),
  suggestedActions: z.array(z.enum([
    'reply',
    'reply_urgent',
    'forward',
    'schedule',
    'extract_task',
    'archive',
    'snooze',
    'delete',
    'unsubscribe'
  ])),
  extractedTasks: z.array(ActionItemSchema),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'urgent']),
  keyEntities: z.array(z.object({
    type: z.enum(['person', 'organization', 'date', 'deadline', 'amount']),
    value: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  suggestedFilingLocation: z.object({
    type: z.enum(['project', 'area', 'archive']),
    id: z.string().optional(),
    name: z.string(),
    confidence: z.number().min(0).max(1)
  }).optional()
});

export const BulkTriageResultSchema = z.object({
  results: z.array(TriageResultSchema),
  summary: z.object({
    totalProcessed: z.number(),
    urgentCount: z.number(),
    actionRequiredCount: z.number(),
    tasksExtracted: z.number()
  })
});

export type ActionItem = z.infer<typeof ActionItemSchema>;
export type TriageResult = z.infer<typeof TriageResultSchema>;
export type BulkTriageResult = z.infer<typeof BulkTriageResultSchema>;
```

**Test Mock:**
```typescript
// tests/mocks/agents/triage.ts
export const TRIAGE_MOCKS = {
  urgent_client_email: {
    emailId: 'msg_urgent_001',
    priority: 0.95,
    priorityReasoning: 'VIP client, urgent keyword, deadline mentioned',
    category: 'urgent',
    suggestedActions: ['reply_urgent', 'extract_task'],
    extractedTasks: [{
      id: 'task_001',
      title: 'Review contract by EOD',
      description: 'Client requested contract review',
      dueDate: '2026-01-15T17:00:00Z',
      priority: 'high',
      confidence: 0.92,
      sourceText: 'Please review the attached contract by EOD',
      suggestedProject: 'Q1 Client Deliverables'
    }],
    sentiment: 'urgent',
    keyEntities: [
      { type: 'person', value: 'Important Client', confidence: 0.95 },
      { type: 'deadline', value: 'EOD today', confidence: 0.88 }
    ],
    suggestedFilingLocation: {
      type: 'project',
      id: 'proj_q1_clients',
      name: 'Q1 Client Deliverables',
      confidence: 0.85
    }
  },

  newsletter_email: {
    emailId: 'msg_newsletter_001',
    priority: 0.15,
    priorityReasoning: 'Promotional newsletter, no action required',
    category: 'newsletter',
    suggestedActions: ['archive'],
    extractedTasks: [],
    sentiment: 'neutral',
    keyEntities: [],
    suggestedFilingLocation: {
      type: 'archive',
      name: 'Newsletters',
      confidence: 0.90
    }
  },

  meeting_request: {
    emailId: 'msg_meeting_001',
    priority: 0.65,
    priorityReasoning: 'Colleague requesting meeting, moderate priority',
    category: 'meeting_request',
    suggestedActions: ['schedule', 'reply'],
    extractedTasks: [{
      id: 'task_002',
      title: 'Schedule sync with Alice',
      description: 'Colleague wants to catch up on project',
      priority: 'medium',
      confidence: 0.85,
      sourceText: 'would love to catch up on the project'
    }],
    sentiment: 'positive',
    keyEntities: [
      { type: 'person', value: 'Alice Johnson', confidence: 0.98 }
    ]
  }
};
```

---

### 2.3 Scheduler Agent

Calendar management and availability.

```typescript
// src/agents/schemas/scheduler.ts
import { z } from 'zod';

export const TimeSlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  available: z.boolean(),
  conflictReason: z.string().optional()
});

export const MeetingProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),  // minutes
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    required: z.boolean().default(true)
  })),
  proposedSlots: z.array(z.object({
    slot: TimeSlotSchema,
    score: z.number().min(0).max(1),
    reasoning: z.string()
  })),
  location: z.string().optional(),
  conferenceType: z.enum(['google_meet', 'zoom', 'in_person', 'phone']).optional(),
  notes: z.string().optional()
});

export const SchedulerResponseSchema = z.object({
  action: z.enum([
    'propose_times',
    'create_event',
    'reschedule',
    'cancel',
    'find_availability',
    'block_focus_time',
    'clarify'
  ]),
  proposal: MeetingProposalSchema.optional(),
  availableSlots: z.array(TimeSlotSchema).optional(),
  createdEvent: z.object({
    id: z.string(),
    htmlLink: z.string().url(),
    hangoutLink: z.string().url().optional()
  }).optional(),
  thinkingNotes: z.string().optional(),  // Extended thinking output
  conflicts: z.array(z.object({
    eventId: z.string(),
    title: z.string(),
    overlap: z.object({
      start: z.string().datetime(),
      end: z.string().datetime()
    })
  })).optional()
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type MeetingProposal = z.infer<typeof MeetingProposalSchema>;
export type SchedulerResponse = z.infer<typeof SchedulerResponseSchema>;
```

**Test Mock:**
```typescript
// tests/mocks/agents/scheduler.ts
export const SCHEDULER_MOCKS = {
  propose_meeting: {
    action: 'propose_times',
    proposal: {
      id: 'proposal_001',
      title: 'Sync with John',
      duration: 30,
      attendees: [
        { email: 'john@example.com', name: 'John Smith', required: true }
      ],
      proposedSlots: [
        {
          slot: {
            start: '2026-01-17T10:00:00Z',
            end: '2026-01-17T10:30:00Z',
            available: true
          },
          score: 0.95,
          reasoning: 'Both calendars free, preferred morning slot'
        },
        {
          slot: {
            start: '2026-01-17T14:00:00Z',
            end: '2026-01-17T14:30:00Z',
            available: true
          },
          score: 0.75,
          reasoning: 'Available but after lunch'
        }
      ],
      conferenceType: 'google_meet'
    },
    thinkingNotes: 'Analyzed 3 days of availability. User prefers mornings based on past patterns.'
  },

  conflict_detected: {
    action: 'propose_times',
    proposal: {
      id: 'proposal_002',
      title: 'Project Review',
      duration: 60,
      attendees: [
        { email: 'client@example.com', name: 'Client', required: true }
      ],
      proposedSlots: [
        {
          slot: {
            start: '2026-01-17T11:00:00Z',
            end: '2026-01-17T12:00:00Z',
            available: true
          },
          score: 0.80,
          reasoning: 'Rescheduled from original time due to conflict'
        }
      ]
    },
    conflicts: [{
      eventId: 'evt_001',
      title: 'Team Standup',
      overlap: {
        start: '2026-01-17T09:00:00Z',
        end: '2026-01-17T09:30:00Z'
      }
    }]
  },

  focus_time_blocked: {
    action: 'block_focus_time',
    createdEvent: {
      id: 'evt_focus_001',
      htmlLink: 'https://calendar.google.com/event?eid=focus001'
    },
    thinkingNotes: 'Blocked 2 hours for deep work based on user preference for afternoon focus time.'
  }
};
```

---

### 2.4 Communicator Agent

Email and message drafting.

```typescript
// src/agents/schemas/communicator.ts
import { z } from 'zod';

export const DraftSchema = z.object({
  id: z.string(),
  subject: z.string(),
  body: z.string(),
  bodyHtml: z.string(),
  tone: z.enum(['formal', 'professional', 'casual', 'friendly', 'urgent']),
  toneReasoning: z.string(),
  suggestedEdits: z.array(z.object({
    location: z.object({
      start: z.number(),
      end: z.number()
    }),
    original: z.string(),
    suggestion: z.string(),
    reason: z.string()
  })).optional(),
  recipientContext: z.object({
    relationship: z.enum(['colleague', 'manager', 'client', 'vendor', 'friend', 'unknown']),
    previousInteractions: z.number(),
    lastContactDate: z.string().datetime().optional()
  }).optional()
});

export const CommunicatorResponseSchema = z.object({
  action: z.enum([
    'draft_reply',
    'draft_new',
    'suggest_template',
    'refine_draft',
    'clarify'
  ]),
  draft: DraftSchema.optional(),
  templateSuggestions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    preview: z.string(),
    matchScore: z.number().min(0).max(1)
  })).optional(),
  warnings: z.array(z.object({
    type: z.enum(['sensitive_content', 'tone_mismatch', 'missing_info', 'potential_issue']),
    message: z.string()
  })).optional()
});

export type Draft = z.infer<typeof DraftSchema>;
export type CommunicatorResponse = z.infer<typeof CommunicatorResponseSchema>;
```

**Test Mock:**
```typescript
// tests/mocks/agents/communicator.ts
export const COMMUNICATOR_MOCKS = {
  formal_reply: {
    action: 'draft_reply',
    draft: {
      id: 'draft_001',
      subject: 'Re: Q1 Planning Meeting',
      body: 'Dear John,\n\nThank you for reaching out. I would be happy to discuss the Q1 planning...',
      bodyHtml: '<p>Dear John,</p><p>Thank you for reaching out...</p>',
      tone: 'formal',
      toneReasoning: 'Client relationship, formal history based on past emails',
      recipientContext: {
        relationship: 'client',
        previousInteractions: 15,
        lastContactDate: '2026-01-10T14:30:00Z'
      }
    }
  },

  casual_reply: {
    action: 'draft_reply',
    draft: {
      id: 'draft_002',
      subject: 'Re: Can we sync this week?',
      body: 'Hey Alice!\n\nYeah, let\'s definitely catch up. How about...',
      bodyHtml: '<p>Hey Alice!</p><p>Yeah, let\'s definitely catch up...</p>',
      tone: 'casual',
      toneReasoning: 'Colleague, informal communication history',
      recipientContext: {
        relationship: 'colleague',
        previousInteractions: 42,
        lastContactDate: '2026-01-14T09:00:00Z'
      }
    }
  },

  with_warning: {
    action: 'draft_reply',
    draft: {
      id: 'draft_003',
      subject: 'Re: Contract Terms',
      body: 'Thank you for the contract...',
      bodyHtml: '<p>Thank you for the contract...</p>',
      tone: 'professional',
      toneReasoning: 'Legal/contract context requires professional tone'
    },
    warnings: [{
      type: 'sensitive_content',
      message: 'This email discusses contract terms. Consider legal review before sending.'
    }]
  }
};
```

---

### 2.5 Navigator Agent

PARA search and navigation.

```typescript
// src/agents/schemas/navigator.ts
import { z } from 'zod';

export const SearchResultSchema = z.object({
  id: z.string(),
  type: z.enum(['project', 'area', 'resource', 'archive']),
  title: z.string(),
  snippet: z.string(),
  relevanceScore: z.number().min(0).max(1),
  matchReason: z.string(),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    status: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

export const NavigatorResponseSchema = z.object({
  action: z.enum([
    'search_results',
    'navigate_to',
    'suggest_location',
    'clarify'
  ]),
  results: z.array(SearchResultSchema).optional(),
  targetLocation: z.object({
    type: z.enum(['project', 'area', 'resource', 'archive', 'contact']),
    id: z.string(),
    path: z.string()
  }).optional(),
  suggestions: z.array(z.object({
    type: z.enum(['project', 'area']),
    id: z.string(),
    name: z.string(),
    reason: z.string()
  })).optional()
});

export type SearchResult = z.infer<typeof SearchResultSchema>;
export type NavigatorResponse = z.infer<typeof NavigatorResponseSchema>;
```

---

### 2.6 Preference Learner Agent

Pattern detection and preference storage.

```typescript
// src/agents/schemas/preference-learner.ts
import { z } from 'zod';

export const LearnedPreferenceSchema = z.object({
  id: z.string(),
  category: z.enum([
    'communication_tone',
    'scheduling_preference',
    'work_hours',
    'notification_preference',
    'filing_preference',
    'response_style',
    'priority_weighting'
  ]),
  preference: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.enum(['explicit', 'observed', 'inferred']),
  evidence: z.array(z.object({
    action: z.string(),
    timestamp: z.string().datetime(),
    context: z.string()
  })),
  lastUpdated: z.string().datetime()
});

export const PreferenceLearnerResponseSchema = z.object({
  action: z.enum([
    'store_preference',
    'update_preference',
    'suggest_preference',
    'no_pattern_detected'
  ]),
  preference: LearnedPreferenceSchema.optional(),
  patternDetected: z.object({
    description: z.string(),
    occurrences: z.number(),
    suggestedPreference: z.string()
  }).optional()
});

export type LearnedPreference = z.infer<typeof LearnedPreferenceSchema>;
export type PreferenceLearnerResponse = z.infer<typeof PreferenceLearnerResponseSchema>;
```

---

## 3. Mock Implementation Pattern

### 3.1 Agent Mock Factory

```typescript
// tests/mocks/agents/index.ts
import { vi } from 'vitest';
import { BUTLER_MOCKS } from './butler';
import { TRIAGE_MOCKS } from './triage';
import { SCHEDULER_MOCKS } from './scheduler';
import { COMMUNICATOR_MOCKS } from './communicator';

type AgentType = 'butler' | 'triage' | 'scheduler' | 'communicator' | 'navigator' | 'preference_learner';

const MOCK_REGISTRY = {
  butler: BUTLER_MOCKS,
  triage: TRIAGE_MOCKS,
  scheduler: SCHEDULER_MOCKS,
  communicator: COMMUNICATOR_MOCKS,
  // ... other agents
};

export function createMockAgent(type: AgentType, scenarioKey?: string) {
  const mocks = MOCK_REGISTRY[type];

  return {
    run: vi.fn().mockImplementation(async (input: any) => {
      // If specific scenario requested, return that mock
      if (scenarioKey && mocks[scenarioKey]) {
        return mocks[scenarioKey];
      }

      // Otherwise, return first mock as default
      return Object.values(mocks)[0];
    }),

    // Helper to set specific response for next call
    setNextResponse: (response: any) => {
      return vi.fn().mockResolvedValueOnce(response);
    }
  };
}

// Usage in tests
export function mockAllAgents() {
  vi.mock('@/agents/butler', () => ({
    createButlerAgent: () => createMockAgent('butler')
  }));

  vi.mock('@/agents/triage', () => ({
    createTriageAgent: () => createMockAgent('triage')
  }));

  // ... other agents
}
```

### 3.2 Schema Validation in Tests

```typescript
// tests/helpers/schema-validator.ts
import { z } from 'zod';
import { TriageResultSchema } from '@/agents/schemas/triage';
import { SchedulerResponseSchema } from '@/agents/schemas/scheduler';

export function validateAgentResponse<T extends z.ZodSchema>(
  schema: T,
  response: unknown
): z.infer<T> {
  const result = schema.safeParse(response);

  if (!result.success) {
    throw new Error(
      `Invalid agent response:\n${result.error.errors.map(e =>
        `  - ${e.path.join('.')}: ${e.message}`
      ).join('\n')}`
    );
  }

  return result.data;
}

// Usage in tests
test('triage agent returns valid schema', async () => {
  const agent = createTriageAgent();
  const response = await agent.run({ emailId: 'msg_001' });

  // This will throw if response doesn't match schema
  const validated = validateAgentResponse(TriageResultSchema, response);

  expect(validated.priority).toBeGreaterThanOrEqual(0);
  expect(validated.priority).toBeLessThanOrEqual(1);
  expect(validated.category).toBeDefined();
});
```

### 3.3 Integration Test Pattern

```typescript
// tests/integration/triage-flow.spec.ts
import { test, expect } from 'vitest';
import { createTriageAgent } from '@/agents/triage';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';
import { validateAgentResponse } from '../helpers/schema-validator';
import { TriageResultSchema } from '@/agents/schemas/triage';

// Mock Claude SDK at module level
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  createAgent: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockResolvedValue(TRIAGE_MOCKS.urgent_client_email)
  }))
}));

test('triage agent processes urgent email correctly', async () => {
  const agent = createTriageAgent();
  const result = await agent.run({
    email: {
      id: 'msg_urgent_001',
      subject: 'URGENT: Contract Review Needed',
      body: 'Please review the attached contract by EOD...',
      from: 'vip@client.com'
    }
  });

  // Validate against schema
  const validated = validateAgentResponse(TriageResultSchema, result);

  // Assert on expected values
  expect(validated.priority).toBeGreaterThan(0.9);
  expect(validated.category).toBe('urgent');
  expect(validated.suggestedActions).toContain('reply_urgent');
  expect(validated.extractedTasks).toHaveLength(1);
  expect(validated.extractedTasks[0].title).toContain('contract');
});

test('triage agent handles newsletter as low priority', async () => {
  vi.mocked(createAgent).mockReturnValueOnce({
    run: vi.fn().mockResolvedValue(TRIAGE_MOCKS.newsletter_email)
  });

  const agent = createTriageAgent();
  const result = await agent.run({
    email: {
      id: 'msg_newsletter_001',
      subject: 'This Week in AI',
      body: 'Top stories from the world of AI...',
      from: 'newsletter@techblog.com'
    }
  });

  const validated = validateAgentResponse(TriageResultSchema, result);

  expect(validated.priority).toBeLessThan(0.3);
  expect(validated.category).toBe('newsletter');
  expect(validated.suggestedActions).toContain('archive');
  expect(validated.extractedTasks).toHaveLength(0);
});
```

---

## 4. Smoke Tests (Real Claude)

For confidence that real Claude returns schema-compliant responses.

```typescript
// tests/smoke/agents.smoke.spec.ts
import { test, expect } from 'vitest';
import { createTriageAgent } from '@/agents/triage';
import { TriageResultSchema } from '@/agents/schemas/triage';

// These tests hit real Claude - run sparingly
test.skip.runIf(process.env.RUN_SMOKE_TESTS)(
  'real Claude returns valid triage schema',
  async () => {
    const agent = createTriageAgent({ mock: false });

    const result = await agent.run({
      email: {
        id: 'test_001',
        subject: 'Meeting Tomorrow',
        body: 'Hi, can we meet tomorrow at 2pm?',
        from: 'colleague@example.com'
      }
    });

    // Should parse without errors
    const parsed = TriageResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.priority).toBeGreaterThanOrEqual(0);
      expect(parsed.data.priority).toBeLessThanOrEqual(1);
    }
  },
  { timeout: 30000 } // Allow 30s for API call
);
```

---

## 5. Files to Create

| File | Purpose |
|------|---------|
| `src/agents/schemas/butler.ts` | Butler agent schema |
| `src/agents/schemas/triage.ts` | Triage agent schema |
| `src/agents/schemas/scheduler.ts` | Scheduler agent schema |
| `src/agents/schemas/communicator.ts` | Communicator agent schema |
| `src/agents/schemas/navigator.ts` | Navigator agent schema |
| `src/agents/schemas/preference-learner.ts` | Preference Learner schema |
| `src/agents/schemas/index.ts` | Schema exports |
| `tests/mocks/agents/butler.ts` | Butler mock responses |
| `tests/mocks/agents/triage.ts` | Triage mock responses |
| `tests/mocks/agents/scheduler.ts` | Scheduler mock responses |
| `tests/mocks/agents/communicator.ts` | Communicator mock responses |
| `tests/mocks/agents/index.ts` | Mock factory |
| `tests/helpers/schema-validator.ts` | Validation helpers |

---

## 6. Checklist

- [ ] Create Zod schemas for all 6 core agents
- [ ] Create mock response fixtures (3-5 scenarios per agent)
- [ ] Implement mock factory with scenario selection
- [ ] Add schema validation helper
- [ ] Write integration tests using mocks
- [ ] Add smoke tests (skipped by default) for real Claude
- [ ] Document schema versioning strategy

---

**Status:** Ready for Implementation
**Owner:** TBD
**Deadline:** Before Epic 2 starts

_Generated by TEA - 2026-01-15_
