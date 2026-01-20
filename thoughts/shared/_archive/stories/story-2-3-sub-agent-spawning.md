# Story 2.3: Sub-Agent Spawning

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-3-sub-agent-spawning
**Priority:** P0 (Core Feature)
**Risk:** HIGH

---

## Story

As a user,
I want the Butler to delegate to specialist agents,
So that domain-specific tasks get expert handling.

---

## Acceptance Criteria

### AC1: Butler Spawns Appropriate Sub-Agent

**Given** the Butler identifies a specialized task (e.g., scheduling)
**When** it decides to delegate
**Then** it spawns the appropriate sub-agent (e.g., Scheduler Agent)
**And** passes relevant context to the sub-agent
**And** receives the sub-agent's result

- [ ] Butler can spawn Triage Agent for inbox processing tasks
- [ ] Butler can spawn Scheduler Agent for calendar/meeting tasks
- [ ] Butler can spawn Communicator Agent for email drafting tasks
- [ ] Butler can spawn Navigator Agent for PARA search tasks
- [ ] Butler can spawn Preference Learner Agent for pattern detection
- [ ] Delegation decision is based on intent classification from Story 2.1

### AC2: Active Agent Visibility in UI

**Given** a sub-agent is working
**When** I view the chat
**Then** I can see which agent is currently active
**And** the agent rail shows the active agent highlighted

- [ ] Agent rail component updates to show currently active agent
- [ ] Delegation events stream to frontend via SSE
- [ ] Visual indicator (highlight/animation) shows which agent is processing
- [ ] Agent transitions are visible (Butler -> Triage -> Butler)

### AC3: Sub-Agent Result Integration

**Given** a sub-agent completes
**When** control returns to Butler
**Then** the Butler incorporates the result into its response
**And** conversation history includes the delegation

- [ ] Butler receives structured result from sub-agent
- [ ] Butler synthesizes sub-agent result into coherent user response
- [ ] Conversation history records delegation chain
- [ ] Agent handoff preserves full context (not truncated)

### AC4: Context Passing Between Agents

**Given** Butler delegates to a sub-agent
**When** the sub-agent receives the delegation
**Then** it has access to:
  - Relevant entities extracted from user message
  - Time constraints (if applicable)
  - User preferences (if relevant)
  - Conversation history for context

- [ ] `DelegationContext` interface is implemented
- [ ] Entity extraction from user message works correctly
- [ ] Sub-agent prompt includes delegation context
- [ ] No context loss during handoff

---

## Tasks / Subtasks

### Task 1: Create AgentOrchestrator Class (AC: #1, #3)

- [ ] 1.1 Create `agent-server/src/agents/orchestrator.ts` - main orchestration class
- [ ] 1.2 Implement agent registry (map of agent names to agent classes)
- [ ] 1.3 Implement `spawnSubAgent(agentType: DelegatableAgent, context: DelegationContext)` method
- [ ] 1.4 Implement `handleDelegation(decision: IntentClassification)` method
- [ ] 1.5 Add result aggregation logic for multi-agent workflows

### Task 2: Define Delegation Types and Interfaces (AC: #4)

- [ ] 2.1 Create `src/agents/schemas/delegation.ts` with Zod schemas:
  - `DelegatableAgentSchema` (imports from Story 2.2 constants)
  - `DelegationContextSchema`
  - `AgentResultSchema`
  - `DelegationEventSchema`
- [ ] 2.2 Create `agent-server/src/agents/types.ts` for TypeScript interfaces
- [ ] 2.3 Import `AgentName`, `DelegatableAgent` from `constants.ts` (Story 2.2) - DO NOT redefine

### Task 3: Implement Agent Event Streaming (AC: #2)

- [ ] 3.1 Create `DelegationEventSchema` for SSE events
- [ ] 3.2 Implement event emission in orchestrator for:
  - `agent_start` - when an agent begins processing
  - `agent_delegate` - when delegation occurs
  - `agent_complete` - when an agent finishes
  - `agent_resume` - when parent agent resumes
- [ ] 3.3 Update streaming endpoint to include delegation events
- [ ] 3.4 Add agent type to streaming event payload

### Task 4: Implement Context Builder (AC: #4)

- [ ] 4.1 Create `agent-server/src/agents/context-builder.ts`
- [ ] 4.2 Implement `buildDelegationContext(intent, userMessage, history)` function
- [ ] 4.3 Extract relevant entities from user message
- [ ] 4.4 Include time constraints extraction (dates, deadlines, etc.)
- [ ] 4.5 Include relevant user preferences from preference store

### Task 5: Wire Butler to Orchestrator (AC: #1, #3)

- [ ] 5.1 Update Butler agent to use AgentOrchestrator for delegation
- [ ] 5.2 Implement `handleDelegateIntent()` method in Butler
- [ ] 5.3 Add result synthesis logic (combine sub-agent response with Butler's framing)
- [ ] 5.4 Update conversation history to include delegation records

### Task 6: Create Frontend Agent Rail Updates (AC: #2)

- [ ] 6.1 Update `AgentRail` component to listen for delegation events
- [ ] 6.2 Add active state styling for each agent in rail
- [ ] 6.3 Implement agent transition animations
- [ ] 6.4 Add data-testid attributes for E2E testing

### Task 7: Write Tests (AC: #1, #2, #3, #4)

- [ ] 7.1 Integration test: Butler spawns Triage (test 2.3.1)
- [ ] 7.2 Integration test: Butler spawns Scheduler (test 2.3.2)
- [ ] 7.3 Integration test: Context passed to sub-agent (test 2.3.3)
- [ ] 7.4 E2E test: Agent rail shows active agent (test 2.3.4)
- [ ] 7.5 Unit test: Handoff preserves conversation (test 2.3.5)

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

From architecture.md section 6.1-6.2:

**Agent Hierarchy:**
```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (Inbox processing)
    +-- Scheduler Agent (Calendar management)
    +-- Communicator Agent (Email/message drafting)
    +-- Navigator Agent (PARA search)
    +-- Preference Learner Agent (Pattern detection)
```

**Agent Lifecycle States (from Story 2.1):**
```typescript
export enum AgentState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING_CONTEXT = 'loading_context',
  PROCESSING = 'processing',
  WAITING_FOR_TOOL = 'waiting_for_tool',
  WAITING_FOR_USER = 'waiting_for_user',
  DELEGATING = 'delegating',     // Key state for this story
  COMPLETING = 'completing',
  ERROR = 'error',
}
```

### File Structure Requirements

Create files in these locations:

```
agent-server/
  src/
    agents/
      orchestrator.ts           # NEW - AgentOrchestrator class
      context-builder.ts        # NEW - DelegationContext builder
      types.ts                  # UPDATE - Re-export types from constants.ts
      butler/
        index.ts                # UPDATE - Wire to orchestrator
src/
  agents/
    schemas/
      delegation.ts             # NEW - Delegation Zod schemas
      index.ts                  # UPDATE - Export new schemas
  components/
    chat/
      agent-rail.tsx            # UPDATE - Active agent styling
tests/
  unit/
    story-2.3-handoff.spec.ts   # NEW - Handoff preservation tests
  integration/
    story-2.3-spawning.spec.ts  # NEW - Agent spawning tests
  e2e/
    story-2.3-agent-rail.spec.ts # NEW - Agent rail E2E tests
  mocks/
    agents/
      triage.ts                 # NEW - Triage agent mocks
      scheduler.ts              # NEW - Scheduler agent mocks
```

### AgentOrchestrator Implementation

**Core class structure:**
```typescript
// agent-server/src/agents/orchestrator.ts

import { AgentState, AgentContext } from './lifecycle';
import { DELEGATABLE_AGENTS, type DelegatableAgent } from './constants';
import { IntentClassification, DelegationContext, AgentResult } from '@/agents/schemas/delegation';

export class AgentOrchestrator {
  private agents: Map<DelegatableAgent, BaseAgent>;
  private eventEmitter: EventEmitter;
  private conversationHistory: Message[];

  constructor(options: OrchestratorOptions) {
    this.agents = new Map();
    // Register only delegatable agents (butler is the orchestrator, not delegated to)
    this.registerAgent('triage', new TriageAgent());
    this.registerAgent('scheduler', new SchedulerAgent());
    this.registerAgent('communicator', new CommunicatorAgent());
    this.registerAgent('navigator', new NavigatorAgent());
    this.registerAgent('preference_learner', new PreferenceLearnerAgent());
  }

  async spawnSubAgent(
    agentType: DelegatableAgent,
    context: DelegationContext
  ): Promise<AgentResult> {
    // 1. Emit agent_start event
    this.emitEvent('agent_start', { agent: agentType });

    // 2. Get agent instance
    const agent = this.agents.get(agentType);
    if (!agent) throw new Error(`Unknown agent type: ${agentType}`);

    // 3. Execute agent with context
    const result = await agent.execute(context);

    // 4. Emit agent_complete event
    this.emitEvent('agent_complete', { agent: agentType });

    // 5. Return structured result
    return result;
  }

  async handleUserMessage(message: string): Promise<StreamingResponse> {
    // Butler first classifies intent (butler is NOT in agents map - it's the orchestrator)
    const classification = await this.butler.classifyIntent(message);

    // Check if delegation needed
    if (classification.intent.startsWith('delegate_')) {
      const agentType = this.getAgentFromIntent(classification.intent);
      const delegationContext = this.buildDelegationContext(classification, message);

      // Emit delegation event
      this.emitEvent('agent_delegate', {
        from: 'butler',
        to: agentType
      });

      // Spawn sub-agent
      const subAgentResult = await this.spawnSubAgent(agentType, delegationContext);

      // Resume Butler for synthesis
      this.emitEvent('agent_resume', { agent: 'butler' });

      // Butler synthesizes final response
      return this.butler.synthesizeResponse(subAgentResult, message);
    }

    // Direct handling by Butler
    return this.butler.handleDirectly(message);
  }

  private getAgentFromIntent(intent: string): DelegatableAgent {
    const mapping: Record<string, DelegatableAgent> = {
      'delegate_triage': 'triage',
      'delegate_schedule': 'scheduler',
      'delegate_draft': 'communicator',
      'delegate_search': 'navigator',
      'delegate_learn': 'preference_learner',
    };
    return mapping[intent];
  }
}
```

### Zod Schema Implementation

**DelegationContextSchema (imports from Story 2.2 constants):**
```typescript
// src/agents/schemas/delegation.ts

import { z } from 'zod';
import { DELEGATABLE_AGENTS, ORION_CORE_AGENTS } from '@agent-server/agents/constants';

// Schema for agents that can be delegated TO (excludes butler - butler delegates, doesn't receive)
export const DelegatableAgentSchema = z.enum(DELEGATABLE_AGENTS);
export type DelegatableAgent = z.infer<typeof DelegatableAgentSchema>;

// Schema for all core agents (includes butler for event tracking)
export const OrionCoreAgentSchema = z.enum(ORION_CORE_AGENTS);
export type OrionCoreAgent = z.infer<typeof OrionCoreAgentSchema>;

export const DelegationContextSchema = z.object({
  parentAgent: z.literal('butler'),  // Only butler delegates in current design
  targetAgent: DelegatableAgentSchema,
  relevantEntities: z.array(z.string()).optional(),
  timeConstraints: z.string().optional(),
  userPreferences: z.array(z.object({
    key: z.string(),
    value: z.string(),
    confidence: z.number()
  })).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional(),
  originalUserMessage: z.string(),
  delegationReasoning: z.string()
});

export type DelegationContext = z.infer<typeof DelegationContextSchema>;

export const AgentResultSchema = z.object({
  agentType: DelegatableAgentSchema,  // Results come from delegated agents
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  summary: z.string(),
  suggestedFollowUp: z.string().optional(),
  toolsUsed: z.array(z.string()).optional(),
  tokensUsed: z.number().optional()
});

export type AgentResult = z.infer<typeof AgentResultSchema>;

export const DelegationEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('agent_start'),
    agent: OrionCoreAgentSchema,  // Any core agent can start (butler or delegated)
    timestamp: z.string()
  }),
  z.object({
    type: z.literal('agent_delegate'),
    from: z.literal('butler'),           // Only butler delegates
    to: DelegatableAgentSchema,          // To one of 5 specialist agents
    timestamp: z.string()
  }),
  z.object({
    type: z.literal('agent_complete'),
    agent: OrionCoreAgentSchema,  // Any core agent can complete
    timestamp: z.string()
  }),
  z.object({
    type: z.literal('agent_resume'),
    agent: z.literal('butler'),  // Only butler resumes after delegation
    timestamp: z.string()
  })
]);

export type DelegationEvent = z.infer<typeof DelegationEventSchema>;
```

### SSE Event Format

**Delegation events in streaming response:**
```typescript
// Event stream format for agent rail updates
data: {"type":"agent_start","agent":"butler","timestamp":"2026-01-15T10:00:00Z"}

data: {"type":"agent_delegate","from":"butler","to":"triage","timestamp":"2026-01-15T10:00:01Z"}

data: {"type":"text","content":"Checking your inbox...","agent":"triage"}

data: {"type":"agent_complete","agent":"triage","timestamp":"2026-01-15T10:00:05Z"}

data: {"type":"agent_resume","agent":"butler","timestamp":"2026-01-15T10:00:05Z"}

data: {"type":"text","content":"Based on Triage's analysis, here are your urgent items...","agent":"butler"}

data: {"type":"done"}
```

### Frontend Agent Rail Component

**Agent rail with active state:**
```tsx
// src/components/chat/agent-rail.tsx
import { ORION_CORE_AGENTS } from '@agent-server/agents/constants';
import type { OrionCoreAgent, DelegationEvent } from '@/agents/schemas/delegation';

interface AgentRailProps {
  activeAgent: OrionCoreAgent | null;
  delegationHistory: DelegationEvent[];
}

export function AgentRail({ activeAgent, delegationHistory }: AgentRailProps) {
  // Display all 6 core Orion agents in the rail
  const agents = ORION_CORE_AGENTS;

  return (
    <div
      className="w-16 flex flex-col items-center py-4 gap-2 border-l border-orion-border-subtle"
      data-testid="agent-rail"
    >
      {agents.map((agent) => (
        <div
          key={agent}
          data-testid={`agent-${agent}`}
          data-agent={agent}
          className={cn(
            'w-10 h-10 rounded-none flex items-center justify-center transition-all',
            'border border-orion-border-muted',
            activeAgent === agent && 'bg-orion-primary-muted border-orion-primary active'
          )}
        >
          <AgentIcon agent={agent} />
        </div>
      ))}
    </div>
  );
}
```

### Test Mock Structure

**Required mock scenarios (from test-design-epic-2.md):**
```typescript
// tests/mocks/agents/triage.ts
export const TRIAGE_MOCKS = {
  urgent_client_email: {
    emailId: 'msg_urgent_001',
    priority: 0.95,
    category: 'urgent',
    suggestedActions: ['reply_urgent', 'create_task'],
    extractedTasks: [
      {
        title: 'Review contract',
        confidence: 0.92,
        suggestedDue: 'today'
      }
    ],
    summary: 'Urgent client contract review needed by EOD'
  },
  batch_result: {
    items: [
      { emailId: 'msg_001', priority: 0.95, category: 'urgent' },
      { emailId: 'msg_002', priority: 0.2, category: 'newsletter' }
    ]
  }
};

// tests/mocks/agents/scheduler.ts
export const SCHEDULER_MOCKS = {
  propose_meeting: {
    suggestedSlots: [
      { start: '2026-01-17T09:00:00Z', end: '2026-01-17T10:00:00Z', score: 0.9 },
      { start: '2026-01-17T14:00:00Z', end: '2026-01-17T15:00:00Z', score: 0.7 }
    ],
    conflicts: [],
    reasoning: 'Morning slot has best availability overlap'
  },
  conflict_detected: {
    suggestedSlots: [],
    conflicts: [
      { title: 'Team Standup', start: '2026-01-17T09:00:00Z', end: '2026-01-17T09:30:00Z' }
    ],
    reasoning: 'Requested time conflicts with Team Standup'
  }
};
```

### Critical Design Constraints

1. **Agent Isolation** - Each sub-agent runs in isolation; no shared mutable state
2. **Context Size Limits** - DelegationContext should be <4000 tokens to fit in sub-agent prompts
3. **Event Ordering** - Delegation events MUST be emitted in correct order (start -> delegate -> complete -> resume)
4. **Error Propagation** - Sub-agent errors must bubble up to Butler for graceful handling
5. **History Preservation** - Full conversation history must be preserved across delegations

### Streaming Integration

**Update to SSE endpoint (from architecture.md section 5.3):**
```typescript
// agent-server/src/routes/stream.ts

app.get('/api/stream/:streamId', async (req, res) => {
  const { prompt, sessionId } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const orchestrator = new AgentOrchestrator();

  // Subscribe to delegation events
  orchestrator.on('agent_start', (event) => {
    res.write(`data: ${JSON.stringify({ type: 'agent_start', ...event })}\n\n`);
  });

  orchestrator.on('agent_delegate', (event) => {
    res.write(`data: ${JSON.stringify({ type: 'agent_delegate', ...event })}\n\n`);
  });

  orchestrator.on('agent_complete', (event) => {
    res.write(`data: ${JSON.stringify({ type: 'agent_complete', ...event })}\n\n`);
  });

  orchestrator.on('agent_resume', (event) => {
    res.write(`data: ${JSON.stringify({ type: 'agent_resume', ...event })}\n\n`);
  });

  // Process message (may trigger delegation)
  const response = await orchestrator.handleUserMessage(prompt as string);

  // Stream text chunks
  for await (const chunk of response) {
    res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
});
```

---

## Project Structure Notes

**Alignment with unified project structure:**
- Agent orchestration lives in `agent-server/src/agents/`
- Schemas shared between frontend and agent-server in `src/agents/schemas/`
- Frontend components in `src/components/chat/`
- Tests follow naming convention `story-X.X-*.spec.ts`

**Dependencies on prior stories:**
- Story 2.1 (Butler Agent Core) must be complete - provides intent classification
- Story 2.2 (Agent Prompt Templates) must be complete - provides template loading

**No conflicts detected with existing structure.**

---

## Test Considerations

### Test Strategy (from test-design-epic-2.md)

| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.3.1 | Integration | Butler spawns Triage | Triage agent runs |
| 2.3.2 | Integration | Butler spawns Scheduler | Scheduler agent runs |
| 2.3.3 | Integration | Context passed to sub-agent | Sub-agent receives context |
| 2.3.4 | E2E | Agent rail shows active agent | UI updates |
| 2.3.5 | Unit | Handoff preserves conversation | History intact |

### Test Code Examples (from test-design-epic-2.md)

```typescript
// tests/integration/story-2.3-spawning.spec.ts
import { test, expect, vi } from 'vitest';
import { AgentOrchestrator } from '@/agents/orchestrator';
import { BUTLER_MOCKS } from '../mocks/agents/butler';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';

test('2.3.1 - Butler spawns Triage agent for inbox tasks', async () => {
  const orchestrator = new AgentOrchestrator();
  const spawnSpy = vi.spyOn(orchestrator, 'spawnAgent');

  // Setup mocks
  orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_triage);
  orchestrator.mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);

  await orchestrator.handleUserMessage('What urgent emails do I have?');

  expect(spawnSpy).toHaveBeenCalledWith(
    'triage',
    expect.objectContaining({
      parentAgent: 'butler',
      context: expect.any(Object),
    })
  );
});

test('2.3.3 - context is passed correctly to sub-agent', async () => {
  const orchestrator = new AgentOrchestrator();
  let receivedContext: any;

  orchestrator.onAgentSpawn('triage', (context) => {
    receivedContext = context;
  });

  orchestrator.mockResponse('butler', {
    ...BUTLER_MOCKS.delegate_to_triage,
    classification: {
      ...BUTLER_MOCKS.delegate_to_triage.classification,
      delegationContext: {
        relevantEntities: ['urgent emails', 'today'],
        timeConstraints: 'last 24 hours',
      }
    }
  });

  await orchestrator.handleUserMessage('Show urgent emails from today');

  expect(receivedContext).toBeDefined();
  expect(receivedContext.relevantEntities).toContain('urgent emails');
  expect(receivedContext.timeConstraints).toBe('last 24 hours');
});

test('2.3.5 - agent handoff preserves conversation state', async () => {
  const orchestrator = new AgentOrchestrator();

  // First turn
  orchestrator.mockResponse('butler', BUTLER_MOCKS.direct_greeting);
  await orchestrator.handleUserMessage('Hello');

  // Second turn with delegation
  orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_triage);
  orchestrator.mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);
  await orchestrator.handleUserMessage('Check my inbox');

  // Verify conversation history preserved
  const history = orchestrator.getConversationHistory();

  expect(history).toHaveLength(4); // user, butler, user, butler+triage
  expect(history[0].role).toBe('user');
  expect(history[0].content).toBe('Hello');
  expect(history[2].content).toBe('Check my inbox');
});
```

### E2E Test Example

```typescript
// tests/e2e/story-2.3-agent-rail.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('2.3.4 - agent rail shows active agent', async ({ page }) => {
  // Mock to trigger delegation
  await page.route('**/api/chat', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `
        data: {"type":"agent_start","agent":"butler"}
        data: {"type":"agent_delegate","from":"butler","to":"triage"}
        data: {"type":"text","content":"Checking your inbox..."}
        data: {"type":"agent_complete","agent":"triage"}
        data: {"type":"agent_resume","agent":"butler"}
        data: {"type":"done"}
      `,
    });
  });

  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Check urgent emails');

  // Click send and watch agent rail
  const agentRail = page.locator('[data-testid="agent-rail"]');

  await page.click('[data-testid="send-button"]');

  // Butler should be active first
  await expect(agentRail.locator('[data-agent="butler"]')).toHaveClass(/active/);

  // Then Triage becomes active
  await expect(agentRail.locator('[data-agent="triage"]')).toHaveClass(/active/);

  // Finally Butler resumes
  await page.waitForSelector('[data-testid="message-complete"]');
  await expect(agentRail.locator('[data-agent="butler"]')).toHaveClass(/active/);
});
```

### Mock Strategy (C-001 Mitigation)

- **All Claude responses MOCKED** in unit/integration tests
- Use `BUTLER_MOCKS`, `TRIAGE_MOCKS`, `SCHEDULER_MOCKS` from `tests/mocks/agents/`
- Real Claude calls only in smoke tests (skipped by default)
- Schema validation ensures mock fidelity

### Test File Locations

```
tests/
  unit/
    story-2.3-handoff.spec.ts        # Test 2.3.5
  integration/
    story-2.3-spawning.spec.ts       # Tests 2.3.1, 2.3.2, 2.3.3
  e2e/
    story-2.3-agent-rail.spec.ts     # Test 2.3.4
  mocks/
    agents/
      triage.ts                       # TRIAGE_MOCKS
      scheduler.ts                    # SCHEDULER_MOCKS
```

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.1 (Butler Agent Core)** - Provides intent classification and delegation decision
- **Story 2.2 (Agent Prompt Templates)** - Provides template loading for sub-agents
- **Story 1-8 (Streaming Responses)** - Provides SSE infrastructure for delegation events

### Downstream Dependencies (blocked by this story)

- **Story 2.4 (Tool Permission System)** - Will use orchestrator for tool approval flow
- **Story 2.5-2.9 (Specialist Agents)** - All depend on spawning mechanism
- **Story 2.15 (Hook Infrastructure)** - May intercept delegation events

### Same-Epic Dependencies (can be worked in parallel)

- **Story 2.2b (CC v3 Hooks Integration)** - Independent infrastructure work

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#6-agent-architecture] - Agent hierarchy, lifecycle states
- [Source: thoughts/planning-artifacts/architecture.md#6.2-agent-lifecycle] - AgentState enum, delegation state
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.3] - Test scenarios and code examples
- [Source: thoughts/planning-artifacts/epics.md#story-2.3] - User story and acceptance criteria
- [Source: thoughts/implementation-artifacts/stories/story-2-1-butler-agent-core.md] - Butler agent structure (upstream)

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
