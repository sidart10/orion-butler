# Story 2.6: Scheduler Agent Definition

**Status:** drafted
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-6-scheduler-agent-definition
**Priority:** P0 (Core Feature)
**Risk:** HIGH

---

## Story

As a user,
I want a specialist agent for calendar management,
So that scheduling is handled with awareness of my availability.

---

## Acceptance Criteria

### AC1: Scheduler Agent Prompt with Availability Logic

**Given** the Scheduler Agent is invoked (ARCH-013)
**When** it handles a scheduling request
**Then** it provides time proposals with conflict detection and alternative suggestions

- [ ] Scheduler agent prompt (.claude/agents/scheduler.md) includes availability checking instructions
- [ ] Prompt includes conflict detection logic
- [ ] Prompt includes consideration factors: existing events, preferences, travel time, focus blocks
- [ ] Prompt length > 1000 characters (core agent requirement from Story 2.2)

### AC2: Extended Thinking Integration

**Given** a scheduling request is complex (multiple attendees, long date range, constraints)
**When** the Scheduler analyzes options
**Then** it activates Claude's extended thinking (ARCH-019)
**And** thinking budget scales from 1,024 (simple) to 15,000 (complex) tokens

- [ ] Extended thinking enabled via `thinking: { type: 'enabled', budget_tokens: N }` parameter
- [ ] `calculateThinkingBudget(request)` function scales with: attendee count, date range, constraint count
- [ ] Extended thinking is skipped ONLY when ALL conditions are met: single attendee AND single day AND no constraints (saves tokens)
- [ ] Medium requests (2-4 attendees, 1 week): 2,000-8,000 tokens
- [ ] Complex requests (5+ attendees, 2+ weeks, constraints): 8,000-15,000 tokens

### AC3: Conflict Detection and Alternative Proposals

**Given** a scheduling conflict exists
**When** the Scheduler analyzes options
**Then** it considers: existing events, preferences, travel time, focus blocks
**And** it proposes alternatives ranked by suitability

- [ ] SchedulerResponseSchema includes: `conflicts: ConflictInfo[]`, `proposal: MeetingProposal`, `thinkingNotes: string`
- [ ] ConflictInfo schema: `{ eventId: string, title: string, overlap: { start: datetime, end: datetime } }` (aligned with test-infra-agent-schemas.md)
- [ ] MeetingProposal schema: `{ id, title, duration, attendees[], proposedSlots: { slot: TimeSlot, score: number (0.0-1.0), reasoning: string }[], conferenceType?, notes? }`
- [ ] TimeSlot schema: `{ start: datetime, end: datetime, available: boolean, conflictReason?: string }`
- [ ] Proposals sorted by score (highest first)

### AC4: SchedulerResult Schema Validation

**Given** the Scheduler Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the SchedulerResponseSchema
**And** Claude's extended thinking output is captured for transparency

- [ ] SchedulerResponseSchema (Zod) validates all agent output fields
- [ ] Schema includes: `action: 'propose_times' | 'create_event' | 'reschedule' | 'cancel' | 'find_availability' | 'block_focus_time' | 'clarify'` (aligned with test-infra-agent-schemas.md)
- [ ] Schema includes: `thinkingNotes` (extracted from extended thinking for user display)
- [ ] Invalid scores (< 0.0 or > 1.0) throw validation errors

---

## Tasks / Subtasks

### Task 1: Create/Update Scheduler Agent Prompt (AC: #1)

- [ ] 1.1 Create `.claude/agents/scheduler.md` if not exists (pure markdown format, no frontmatter)
- [ ] 1.2 Include availability checking instructions:
  - Check user's calendar for free/busy status
  - Consider buffer time between meetings
  - Respect focus time blocks
  - Account for timezone differences
- [ ] 1.3 Include conflict detection logic:
  - Direct overlaps (event during requested time)
  - Too close (back-to-back with no buffer)
  - Focus time violations (interrupting deep work blocks)
- [ ] 1.4 Include consideration factors:
  - Travel time / commute (if locations differ)
  - User preferences (morning person, avoid Fridays, etc.)
  - Attendee availability across timezones
  - Meeting fatigue (avoid too many meetings in a day)
- [ ] 1.5 Include proposal ranking criteria:
  - All attendees available: +0.3
  - Preferred time slot: +0.2
  - No focus time conflict: +0.2
  - Adequate buffer: +0.15
  - No travel conflict: +0.15
- [ ] 1.6 Verify prompt length > 1000 characters

### Task 2: Create Scheduler Schema Definitions (AC: #3, #4)

- [ ] 2.1 Create `agent-server/src/agents/schemas/scheduler.ts`:
```typescript
import { z } from 'zod';

// TimeSlot schema - represents a calendar time slot
export const TimeSlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  available: z.boolean(),
  conflictReason: z.string().optional(),
});

// Attendee for meeting proposals
export const AttendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  required: z.boolean().default(true),
});

// Meeting proposal with nested proposedSlots (aligned with test-infra-agent-schemas.md)
export const MeetingProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(), // minutes
  attendees: z.array(AttendeeSchema),
  proposedSlots: z.array(z.object({
    slot: TimeSlotSchema,
    score: z.number().min(0).max(1),
    reasoning: z.string(),
  })),
  location: z.string().optional(),
  conferenceType: z.enum(['google_meet', 'zoom', 'in_person', 'phone']).optional(),
  notes: z.string().optional(),
});

// Conflict info using overlap object (aligned with test-infra-agent-schemas.md)
export const ConflictInfoSchema = z.object({
  eventId: z.string(),
  title: z.string(),
  overlap: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});

// Main scheduler response schema (aligned with test-infra-agent-schemas.md)
export const SchedulerResponseSchema = z.object({
  action: z.enum([
    'propose_times',
    'create_event',
    'reschedule',
    'cancel',
    'find_availability',
    'block_focus_time',
    'clarify',
  ]),
  proposal: MeetingProposalSchema.optional(),
  availableSlots: z.array(TimeSlotSchema).optional(),
  createdEvent: z.object({
    id: z.string(),
    htmlLink: z.string().url(),
    hangoutLink: z.string().url().optional(),
  }).optional(),
  thinkingNotes: z.string().optional(), // Extended thinking output
  conflicts: z.array(ConflictInfoSchema).optional(),
});

export type SchedulerResponse = z.infer<typeof SchedulerResponseSchema>;
export type MeetingProposal = z.infer<typeof MeetingProposalSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type ConflictInfo = z.infer<typeof ConflictInfoSchema>;
export type Attendee = z.infer<typeof AttendeeSchema>;
```
- [ ] 2.2 Export schema from `agent-server/src/agents/schemas/index.ts`

### Task 3: Implement Thinking Budget Calculator (AC: #2)

- [ ] 3.1 Create `agent-server/src/agents/scheduler/thinking.ts`:
```typescript
export interface SchedulingRequest {
  attendees: string[];
  dateRange: { days: number };
  constraints: string[];
  duration?: number;
  preferredTimes?: string[];
}

/**
 * Calculate extended thinking budget based on request complexity.
 * Returns token budget in range [1024, 15000].
 *
 * Complexity factors:
 * - Attendee count: +500 per attendee after first
 * - Date range: +200 per day after first
 * - Constraints: +1000 per constraint
 * - Duration > 2 hours: +500
 * - Preferred times specified: +300
 */
export function calculateThinkingBudget(request: SchedulingRequest): number {
  const BASE_BUDGET = 1024;
  const MAX_BUDGET = 15000;

  let budget = BASE_BUDGET;

  // Attendee complexity
  const attendeeCount = request.attendees.length;
  if (attendeeCount > 1) {
    budget += (attendeeCount - 1) * 500;
  }

  // Date range complexity
  const days = request.dateRange.days;
  if (days > 1) {
    budget += (days - 1) * 200;
  }

  // Constraint complexity
  budget += request.constraints.length * 1000;

  // Duration complexity
  if (request.duration && request.duration > 120) {
    budget += 500;
  }

  // Preferred times add complexity
  if (request.preferredTimes && request.preferredTimes.length > 0) {
    budget += 300;
  }

  return Math.min(budget, MAX_BUDGET);
}

/**
 * Determine if request is complex enough to warrant extended thinking.
 * Simple requests (1 attendee, 1 day, no constraints) skip extended thinking.
 */
export function shouldUseExtendedThinking(request: SchedulingRequest): boolean {
  return (
    request.attendees.length > 1 ||
    request.dateRange.days > 1 ||
    request.constraints.length > 0
  );
}
```

### Task 4: Implement Scheduler Agent Class (AC: #1, #2, #3, #4)

**Note:** Mock calendar data for Story 2.6; real calendar integration in Epic 6.

- [ ] 4.1 Create `agent-server/src/agents/scheduler/index.ts`:
```typescript
// Key interfaces and class structure - full implementation follows Story 2.5 pattern
import Anthropic from '@anthropic-ai/sdk';
import { loadAgentTemplate, interpolateTemplate } from '../templates';
import { SchedulerResponseSchema, type SchedulerResponse } from '../schemas/scheduler';
import { calculateThinkingBudget, shouldUseExtendedThinking } from './thinking';
import type { AgentContext, CalendarEvent, SchedulingRequest } from '../../types';

export class SchedulerAgent {
  private client: Anthropic;
  private template: string;

  async initialize(): Promise<void> {
    const loaded = await loadAgentTemplate('scheduler');
    this.template = loaded.systemPrompt;
  }

  async handleRequest(
    request: SchedulingRequest,
    context: AgentContext,
    existingEvents: CalendarEvent[],
  ): Promise<SchedulerResponse> {
    // 1. Build system prompt via interpolateTemplate()
    // 2. Check shouldUseExtendedThinking(request)
    // 3. If complex: add thinking config + beta header 'interleaved-thinking-2025-05-14'
    // 4. Call Claude API with apiParams
    // 5. Extract thinking summary from thinking block if present
    // 6. Parse and validate response with SchedulerResponseSchema
    // See architecture.md#6.8 for extended thinking implementation details
  }

  private buildSchedulingPrompt(request: SchedulingRequest, events: CalendarEvent[], context: AgentContext): string {
    // Format attendees, date range, constraints, existing events, user preferences
    // Return formatted prompt string for Claude
  }

  private summarizeThinking(thinking: string): string {
    // Extract key considerations (conflict, available, prefer keywords)
    // Return condensed summary for user display
  }
}
```
- [ ] 4.2 Export from `agent-server/src/agents/index.ts`

### Task 5: Create Test Mocks (AC: #3, #4)

- [ ] 5.1 Create `tests/mocks/agents/scheduler.ts`:
```typescript
// Full mock data aligned with test-infra-agent-schemas.md section 2.3
import type { SchedulerResponse } from '@/agents/schemas/scheduler';

export const SCHEDULER_MOCKS = {
  // Scenario: successful meeting proposal with no conflicts
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
  } satisfies SchedulerResponse,

  // Scenario: conflict detected with alternative proposals
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
  } satisfies SchedulerResponse,

  // Scenario: focus time blocked
  focus_time_blocked: {
    action: 'block_focus_time',
    createdEvent: {
      id: 'evt_focus_001',
      htmlLink: 'https://calendar.google.com/event?eid=focus001'
    },
    thinkingNotes: 'Blocked 2 hours for deep work based on user preference for afternoon focus time.'
  } satisfies SchedulerResponse,
};
```
- [ ] 5.2 Export from `tests/mocks/agents/index.ts`

### Task 6: Write Tests (AC: #1, #2, #3, #4)

- [ ] 6.1 Create `tests/unit/story-2.6-scheduler.spec.ts`:
```typescript
import { test, expect, describe, vi } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import {
  SchedulerResponseSchema,
  MeetingProposalSchema,
  ConflictInfoSchema,
  TimeSlotSchema
} from '@/agents/schemas/scheduler';
import {
  calculateThinkingBudget,
  shouldUseExtendedThinking
} from '@/agents/scheduler/thinking';
import { SCHEDULER_MOCKS } from '../mocks/agents/scheduler';

describe('Story 2.6: Scheduler Agent Definition', () => {

  test('2.6.1 - Scheduler prompt includes availability logic', async () => {
    const template = await loadAgentTemplate('scheduler');

    // Should have availability checking instructions
    expect(template.systemPrompt).toMatch(/availability|free.*busy|calendar.*check/i);

    // Should consider multiple factors
    expect(template.systemPrompt).toMatch(/conflict/i);
    expect(template.systemPrompt).toMatch(/travel.*time|commute|buffer/i);
    expect(template.systemPrompt).toMatch(/focus.*time|deep.*work/i);
    expect(template.systemPrompt).toMatch(/preference/i);

    // Should be substantial (> 1000 chars)
    expect(template.systemPrompt.length).toBeGreaterThan(1000);
  });

  test('2.6.3 - thinking budget scales with complexity', () => {
    // Simple request: 1 attendee, 1 day range
    const simpleRequest = {
      attendees: ['alice@example.com'],
      dateRange: { days: 1 },
      constraints: [],
    };
    expect(calculateThinkingBudget(simpleRequest)).toBeLessThan(2000);

    // Medium request: 3 attendees, 1 week range
    const mediumRequest = {
      attendees: ['alice@example.com', 'bob@example.com', 'carol@example.com'],
      dateRange: { days: 7 },
      constraints: ['morning preferred'],
    };
    const mediumBudget = calculateThinkingBudget(mediumRequest);
    expect(mediumBudget).toBeGreaterThan(2000);
    expect(mediumBudget).toBeLessThan(8000);

    // Complex request: 5+ attendees, 2 week range, multiple constraints
    const complexRequest = {
      attendees: ['a@ex.com', 'b@ex.com', 'c@ex.com', 'd@ex.com', 'e@ex.com'],
      dateRange: { days: 14 },
      constraints: ['morning preferred', 'avoid Fridays', 'need video call'],
    };
    const complexBudget = calculateThinkingBudget(complexRequest);
    expect(complexBudget).toBeGreaterThan(8000);
    expect(complexBudget).toBeLessThanOrEqual(15000);
  });

  test('2.6.3b - shouldUseExtendedThinking returns correct boolean', () => {
    // Simple: no extended thinking needed (ALL conditions met: 1 attendee AND 1 day AND no constraints)
    expect(shouldUseExtendedThinking({
      attendees: ['one@example.com'],
      dateRange: { days: 1 },
      constraints: [],
    })).toBe(false);

    // Multiple attendees: needs thinking (ANY condition triggers)
    expect(shouldUseExtendedThinking({
      attendees: ['one@example.com', 'two@example.com'],
      dateRange: { days: 1 },
      constraints: [],
    })).toBe(true);

    // Multi-day: needs thinking (ANY condition triggers)
    expect(shouldUseExtendedThinking({
      attendees: ['one@example.com'],
      dateRange: { days: 7 },
      constraints: [],
    })).toBe(true);

    // Constraints: needs thinking (ANY condition triggers)
    expect(shouldUseExtendedThinking({
      attendees: ['one@example.com'],
      dateRange: { days: 1 },
      constraints: ['morning only'],
    })).toBe(true);
  });

  test('2.6.4a - SchedulerResponse schema validates correctly', () => {
    // Valid response
    const validResult = SCHEDULER_MOCKS.propose_meeting;
    expect(() => SchedulerResponseSchema.parse(validResult)).not.toThrow();

    // Valid with conflicts
    const conflictResult = SCHEDULER_MOCKS.conflict_detected;
    expect(() => SchedulerResponseSchema.parse(conflictResult)).not.toThrow();
  });

  test('2.6.4b - proposal slot scores must be 0.0-1.0', () => {
    // Access proposedSlots from the MeetingProposal structure
    const validProposedSlot = SCHEDULER_MOCKS.propose_meeting.proposal!.proposedSlots[0];

    // Valid score range
    expect(validProposedSlot.score).toBeGreaterThanOrEqual(0);
    expect(validProposedSlot.score).toBeLessThanOrEqual(1);

    // Test MeetingProposal schema with invalid score
    const invalidProposal = {
      ...SCHEDULER_MOCKS.propose_meeting.proposal,
      proposedSlots: [{
        ...validProposedSlot,
        score: 1.5 // Invalid: > 1.0
      }]
    };
    expect(() => MeetingProposalSchema.parse(invalidProposal)).toThrow();

    // Invalid: score < 0.0
    const invalidLowProposal = {
      ...SCHEDULER_MOCKS.propose_meeting.proposal,
      proposedSlots: [{
        ...validProposedSlot,
        score: -0.1
      }]
    };
    expect(() => MeetingProposalSchema.parse(invalidLowProposal)).toThrow();
  });

  test('2.6.4c - conflict overlap structure is validated', () => {
    const validConflict = SCHEDULER_MOCKS.conflict_detected.conflicts![0];
    expect(() => ConflictInfoSchema.parse(validConflict)).not.toThrow();

    // Validate overlap has start/end datetime fields
    expect(validConflict.overlap).toHaveProperty('start');
    expect(validConflict.overlap).toHaveProperty('end');

    // Invalid: missing overlap
    const invalidNoOverlap = { eventId: 'evt_001', title: 'Test' };
    expect(() => ConflictInfoSchema.parse(invalidNoOverlap)).toThrow();
  });

  test('2.6.5 - proposedSlots are sorted by score (highest first)', () => {
    const result = SCHEDULER_MOCKS.propose_meeting;
    const scores = result.proposal!.proposedSlots.map(ps => ps.score);

    // Verify descending order
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

});
```
- [ ] 6.2 Create `tests/integration/story-2.6-scheduler-extended-thinking.spec.ts` for integration tests with mocked Claude

---

## Dev Notes

### Pattern from Story 2.5 (Triage Agent)

Story 2.5 established the canonical pattern for agent definition stories. Follow these patterns:

| Component | Pattern | Reference |
|-----------|---------|-----------|
| Zod Schema Structure | `z.object({...}).min().max()` with enums | `agents/schemas/triage.ts` |
| Agent Class Pattern | `initialize()` + `handleRequest()` + private helpers | `agents/triage/index.ts` |
| Test File Naming | `story-2.X-<agent>.spec.ts` | `tests/unit/story-2.5-triage.spec.ts` |
| Mock Structure | `AGENT_MOCKS` object with scenario keys | `tests/mocks/agents/triage.ts` |

### Architecture Patterns (MUST FOLLOW)

**Scheduler Agent in Orion Hierarchy:**
```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (Story 2.5)
    +-- Scheduler Agent (THIS STORY) <-- Calendar management
    +-- Communicator Agent (Story 2.7)
    +-- Navigator Agent (Story 2.8)
    +-- Preference Learner Agent (Story 2.9)
```

**Agent Model:** Sonnet (from Story 2.2 constants - `AGENT_MODELS.scheduler === 'sonnet'`)

### Extended Thinking Pattern (ARCH-019)

From architecture.md section 6.8:
```typescript
// Enable extended thinking for complex scheduling
{
  thinking: {
    type: 'enabled',
    budget_tokens: calculateThinkingBudget(request), // 1024-15000
  },
}
```

**Required Beta Header:** `anthropic-beta: interleaved-thinking-2025-05-14`

**Note:** Both beta headers can be combined if structured outputs are also needed: `anthropic-beta: structured-outputs-2025-11-13,interleaved-thinking-2025-05-14` (see architecture.md section 6.8)

**Thinking Budget Guidelines:**
| Complexity | Budget Range | Triggers |
|------------|--------------|----------|
| Simple | < 2,000 | 1 attendee, 1 day, no constraints |
| Medium | 2,000 - 8,000 | 2-4 attendees, up to 1 week |
| Complex | 8,000 - 15,000 | 5+ attendees, 2+ weeks, multiple constraints |

### Calendar Integration (Epic 3 Dependency)

The Scheduler Agent will use Composio's Google Calendar tools (connected in Epic 3):
- `GOOGLECALENDAR_LIST_EVENTS` - Get existing events
- `GOOGLECALENDAR_CREATE_EVENT` - Create new meeting (via Butler approval)
- `GOOGLECALENDAR_QUICK_ADD` - Quick event creation

For Story 2.6, we mock calendar data. Real integration happens in Epic 6.

### Scheduling Consideration Factors

From PRD section 5.2.3 and architecture.md:
1. **Existing Events** - Direct conflicts (overlap)
2. **Buffer Time** - Meetings too close together (< 15 min buffer)
3. **Focus Time** - Interrupting deep work blocks
4. **Travel Time** - If locations differ significantly
5. **User Preferences** - Preferred times, avoid days
6. **Attendee Availability** - Multi-party coordination
7. **Meeting Fatigue** - Too many meetings in one day

### Database Schema Alignment

From architecture.md section 4, relevant tables for calendar:
```sql
calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT,
    attendees TEXT, -- JSON array
    is_focus_time BOOLEAN DEFAULT FALSE,
);
```

### Project Structure Notes

```
.claude/
  agents/
    scheduler.md          # Agent prompt template (CREATE - no frontmatter, pure markdown)

agent-server/
  src/
    agents/
      schemas/
        scheduler.ts      # SchedulerResponseSchema, TimeProposalSchema, etc.
        index.ts          # Re-export
      scheduler/
        index.ts          # SchedulerAgent class
        thinking.ts       # calculateThinkingBudget, shouldUseExtendedThinking
      index.ts            # Re-export all agents

tests/
  mocks/
    agents/
      scheduler.ts        # SCHEDULER_MOCKS
      index.ts            # Re-export
  unit/
    story-2.6-scheduler.spec.ts
  integration/
    story-2.6-scheduler-extended-thinking.spec.ts
```

### Critical Design Constraints

1. **Extended thinking is CONDITIONAL** - Only for complex requests (saves tokens)
2. **Thinking budget MUST be 1,024-15,000** - Claude API constraints
3. **Proposal scores MUST be 0.0-1.0** - Strict bounds enforced by Zod
4. **Proposals MUST be sorted by score** - Highest first for UX
5. **Model is Sonnet** - Good balance of speed/quality for scheduling
6. **Depends on Story 2.2** - Template loading infrastructure
7. **Zod to JSON Schema conversion** - If using structured outputs with scheduler, use `zodToJsonSchema()` from `zod-to-json-schema` package (same pattern as Story 2.5 Triage Agent)

### Testing Standards

From test-design-epic-2.md Story 2.6 section:
| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.6.1 | Unit | Prompt includes availability logic | Instructions present |
| 2.6.2 | Integration | Extended thinking activates | thinkingBudget set |
| 2.6.3 | Unit | Thinking budget scales | Higher for complex |
| 2.6.4 | Integration | Conflicts identified | Conflict array populated |
| 2.6.5 | E2E | Respects existing calendar | No double-booking |

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.2 (Agent Prompt Templates)** - Template loading infrastructure, `loadAgentTemplate()` from `agent-server/src/agents/templates`
- **Story 2.1 (Butler Agent Core)** - Butler delegates to Scheduler
- **Story 2.3 (Sub-Agent Spawning)** - Agent spawning mechanism for delegation
- **Story 2.5 (Triage Agent Definition)** - Pattern reference for agent class structure, schema design, and test organization

### Downstream Dependencies (blocked by this story)

- **Story 2.12 (Workflow Skill Adaptation)** - `/schedule` workflow uses Scheduler Agent
- **Epic 6 (Calendar Management)** - All calendar features depend on this agent
- **Story 6.2 (Chat Scheduling)** - Natural language scheduling via chat

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.6] - Story definition
- [Source: thoughts/planning-artifacts/architecture.md#6.8] - Extended thinking with Claude
- [Source: thoughts/planning-artifacts/architecture.md#ARCH-013] - Scheduler Agent requirement
- [Source: thoughts/planning-artifacts/architecture.md#ARCH-019] - Extended thinking budget
- [Source: thoughts/planning-artifacts/prd.md#5.2.3] - Calendar management requirements
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.6] - Test scenarios

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
