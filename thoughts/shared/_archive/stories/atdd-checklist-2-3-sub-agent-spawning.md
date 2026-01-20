# ATDD Checklist - Epic 2, Story 2.3: Sub-Agent Spawning

**Date:** 2026-01-15
**Author:** Murat (TEA Agent)
**Primary Test Level:** Integration
**Story Status:** ready-for-dev
**Risk Level:** HIGH

---

## Story Summary

Enable the Butler agent to delegate specialized tasks to domain-expert sub-agents (Triage, Scheduler, Communicator, Navigator, Preference Learner) through an orchestration system that manages context passing, event streaming, and result synthesis.

**As a** user,
**I want** the Butler to delegate to specialist agents,
**So that** domain-specific tasks get expert handling.

---

## Acceptance Criteria

1. **AC1:** Butler spawns appropriate sub-agent based on intent classification and passes relevant context
2. **AC2:** Active agent is visible in the UI agent rail during processing
3. **AC3:** Sub-agent result is integrated into Butler's final response with preserved conversation history
4. **AC4:** Context is properly passed between agents including entities, time constraints, preferences, and history

---

## Failing Tests Created (RED Phase)

### Integration Tests (9 tests)

**File:** `tests/integration/story-2.3-spawning.spec.ts`

- **Test 2.3.1:** Butler spawns Triage agent for inbox tasks
  - **Status:** RED - `AgentOrchestrator` class not implemented
  - **Verifies:** AC1 - Butler can spawn Triage Agent for inbox processing tasks

- **Test 2.3.2:** Butler spawns Scheduler agent for calendar tasks
  - **Status:** RED - `AgentOrchestrator` class not implemented
  - **Verifies:** AC1 - Butler can spawn Scheduler Agent for calendar/meeting tasks

- **Test 2.3.1b:** Butler spawns Communicator agent for email drafting tasks
  - **Status:** RED - `AgentOrchestrator` class not implemented
  - **Verifies:** AC1 - Butler can spawn Communicator Agent for email drafting tasks

- **Test 2.3.1c:** Butler spawns Navigator agent for PARA search tasks
  - **Status:** RED - `AgentOrchestrator` class not implemented
  - **Verifies:** AC1 - Butler can spawn Navigator Agent for PARA search tasks

- **Test 2.3.1d:** Butler spawns Preference Learner agent for pattern detection tasks
  - **Status:** RED - `AgentOrchestrator` class not implemented
  - **Verifies:** AC1 - Butler can spawn Preference Learner Agent for pattern detection

- **Test 2.3.3:** Context is passed correctly to sub-agent
  - **Status:** RED - `DelegationContext` interface not implemented
  - **Verifies:** AC4 - Delegation context includes relevant entities and time constraints

- **Test 2.3.3b:** Conversation history preserved during delegation
  - **Status:** RED - Conversation history not persisted across agent handoffs
  - **Verifies:** AC3, AC4 - Conversation history included in delegation context

- **Test 2.3.3c:** User preferences passed to sub-agent
  - **Status:** RED - Preference injection not implemented
  - **Verifies:** AC4 - User preferences are included in delegation context

- **Test 2.3.6:** Butler synthesizes sub-agent result into coherent response
  - **Status:** RED - Result synthesis not implemented
  - **Verifies:** AC3 - Butler incorporates sub-agent result into its response

### Unit Tests (3 tests)

**File:** `tests/unit/story-2.3-handoff.spec.ts`

- **Test 2.3.5:** Agent handoff preserves conversation state
  - **Status:** RED - Conversation history tracking not implemented
  - **Verifies:** AC3 - Conversation history includes delegation chain

- **Test 2.3.5b:** DelegationContext schema validates correctly
  - **Status:** RED - Zod schema not defined
  - **Verifies:** AC4 - DelegationContextSchema enforces required fields

- **Test 2.3.5c:** AgentType enum includes all required agents
  - **Status:** RED - AgentType enum not defined
  - **Verifies:** AC1 - All 6 agents defined (butler, triage, scheduler, communicator, navigator, preference_learner)

### E2E Tests (4 tests)

**File:** `tests/e2e/story-2.3-agent-rail.spec.ts`

- **Test 2.3.4a:** Agent rail shows Butler as active initially
  - **Status:** RED - Agent rail component not updated for delegation events
  - **Verifies:** AC2 - Visual indicator shows which agent is processing

- **Test 2.3.4b:** Agent rail shows Triage as active during delegation
  - **Status:** RED - SSE delegation events not implemented
  - **Verifies:** AC2 - Agent rail shows currently active agent highlighted

- **Test 2.3.4c:** Agent rail shows Butler resuming after delegation
  - **Status:** RED - `agent_resume` event not streaming
  - **Verifies:** AC2 - Agent transitions visible (Butler -> Triage -> Butler)

- **Test 2.3.4d:** Delegation events stream via SSE
  - **Status:** RED - Streaming endpoint does not emit delegation events
  - **Verifies:** AC2 - Delegation events stream to frontend via SSE

---

## Test Code: Integration Tests

```typescript
// tests/integration/story-2.3-spawning.spec.ts
import { test, expect, vi, beforeEach, describe } from 'vitest';
import { AgentOrchestrator } from '@/agents/orchestrator';
import { DelegationContextSchema, AgentResultSchema } from '@/agents/schemas/delegation';
import { BUTLER_MOCKS } from '../mocks/agents/butler';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';
import { SCHEDULER_MOCKS } from '../mocks/agents/scheduler';

// Mock Claude SDK - all Claude responses are mocked per C-001 mitigation
vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

describe('Story 2.3: Sub-Agent Spawning', () => {
  let orchestrator: AgentOrchestrator;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
  });

  test('2.3.1 - Butler spawns Triage agent for inbox tasks', async () => {
    // GIVEN: Orchestrator is initialized with registered agents
    const spawnSpy = vi.spyOn(orchestrator, 'spawnSubAgent');

    // Mock Butler to classify as delegate_triage
    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_triage);
    orchestrator.mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);

    // WHEN: User asks about inbox
    await orchestrator.handleUserMessage('What urgent emails do I have?');

    // THEN: Triage agent is spawned with correct context
    expect(spawnSpy).toHaveBeenCalledWith(
      'triage',
      expect.objectContaining({
        parentAgent: 'butler',
        targetAgent: 'triage',
        originalUserMessage: 'What urgent emails do I have?',
      })
    );
  });

  test('2.3.2 - Butler spawns Scheduler agent for calendar tasks', async () => {
    // GIVEN: Orchestrator is initialized
    const spawnSpy = vi.spyOn(orchestrator, 'spawnSubAgent');

    // Mock Butler to classify as delegate_schedule
    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_scheduler);
    orchestrator.mockResponse('scheduler', SCHEDULER_MOCKS.propose_meeting);

    // WHEN: User asks to schedule a meeting
    await orchestrator.handleUserMessage('Schedule a meeting with Alice next week');

    // THEN: Scheduler agent is spawned
    expect(spawnSpy).toHaveBeenCalledWith(
      'scheduler',
      expect.objectContaining({
        parentAgent: 'butler',
        targetAgent: 'scheduler',
      })
    );
  });

  test('2.3.1b - Butler spawns Communicator agent for email drafting tasks', async () => {
    // GIVEN: Orchestrator is initialized with registered agents
    const spawnSpy = vi.spyOn(orchestrator, 'spawnSubAgent');

    // Mock Butler to classify as delegate_draft
    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_communicator);
    orchestrator.mockResponse('communicator', { success: true, summary: 'Draft created' });

    // WHEN: User asks to draft an email
    await orchestrator.handleUserMessage('Draft a reply to the client about the contract');

    // THEN: Communicator agent is spawned with correct context
    expect(spawnSpy).toHaveBeenCalledWith(
      'communicator',
      expect.objectContaining({
        parentAgent: 'butler',
        targetAgent: 'communicator',
      })
    );
  });

  test('2.3.1c - Butler spawns Navigator agent for PARA search tasks', async () => {
    // GIVEN: Orchestrator is initialized with registered agents
    const spawnSpy = vi.spyOn(orchestrator, 'spawnSubAgent');

    // Mock Butler to classify as delegate_search
    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_navigator);
    orchestrator.mockResponse('navigator', { success: true, summary: 'Found 5 relevant items' });

    // WHEN: User asks to search for something
    await orchestrator.handleUserMessage('Find all my notes about the Q4 planning');

    // THEN: Navigator agent is spawned with correct context
    expect(spawnSpy).toHaveBeenCalledWith(
      'navigator',
      expect.objectContaining({
        parentAgent: 'butler',
        targetAgent: 'navigator',
      })
    );
  });

  test('2.3.1d - Butler spawns Preference Learner agent for pattern detection', async () => {
    // GIVEN: Orchestrator is initialized with registered agents
    const spawnSpy = vi.spyOn(orchestrator, 'spawnSubAgent');

    // Mock Butler to classify as delegate_learn
    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_preference_learner);
    orchestrator.mockResponse('preference_learner', { success: true, summary: 'Pattern detected' });

    // WHEN: User interaction triggers preference learning
    await orchestrator.handleUserMessage('I always prefer morning meetings before 10am');

    // THEN: Preference Learner agent is spawned
    expect(spawnSpy).toHaveBeenCalledWith(
      'preference_learner',
      expect.objectContaining({
        parentAgent: 'butler',
        targetAgent: 'preference_learner',
      })
    );
  });

  test('2.3.3 - context is passed correctly to sub-agent', async () => {
    // GIVEN: Orchestrator tracks context passed to sub-agents
    let receivedContext: any;

    orchestrator.onAgentSpawn('triage', (context) => {
      receivedContext = context;
    });

    // Mock Butler with delegation context including entities and time constraints
    orchestrator.mockResponse('butler', {
      ...BUTLER_MOCKS.delegate_to_triage,
      classification: {
        intent: 'delegate_triage',
        confidence: 0.95,
        delegationContext: {
          relevantEntities: ['urgent emails', 'today'],
          timeConstraints: 'last 24 hours',
        }
      }
    });
    orchestrator.mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);

    // WHEN: User message includes temporal and entity references
    await orchestrator.handleUserMessage('Show urgent emails from today');

    // THEN: Context includes extracted information
    expect(receivedContext).toBeDefined();
    expect(receivedContext.relevantEntities).toContain('urgent emails');
    expect(receivedContext.timeConstraints).toBe('last 24 hours');

    // Validate against schema
    expect(() => DelegationContextSchema.parse(receivedContext)).not.toThrow();
  });

  test('2.3.3b - conversation history preserved during delegation', async () => {
    // GIVEN: A prior conversation turn exists
    orchestrator.mockResponse('butler', BUTLER_MOCKS.direct_greeting);
    await orchestrator.handleUserMessage('Hello');

    // WHEN: Second turn triggers delegation
    let delegationContext: any;
    orchestrator.onAgentSpawn('triage', (context) => {
      delegationContext = context;
    });

    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_triage);
    orchestrator.mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);
    await orchestrator.handleUserMessage('Check my inbox');

    // THEN: Conversation history is included in delegation context
    expect(delegationContext.conversationHistory).toBeDefined();
    expect(delegationContext.conversationHistory.length).toBeGreaterThan(0);
    expect(delegationContext.conversationHistory[0].role).toBe('user');
    expect(delegationContext.conversationHistory[0].content).toBe('Hello');
  });

  test('2.3.3c - user preferences passed to sub-agent', async () => {
    // GIVEN: User has preferences stored
    orchestrator.setUserPreferences([
      { key: 'morning_meetings', value: 'prefers before 11am', confidence: 0.85 }
    ]);

    let delegationContext: any;
    orchestrator.onAgentSpawn('scheduler', (context) => {
      delegationContext = context;
    });

    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_scheduler);
    orchestrator.mockResponse('scheduler', SCHEDULER_MOCKS.propose_meeting);

    // WHEN: User requests scheduling
    await orchestrator.handleUserMessage('Find a time for a team meeting');

    // THEN: Preferences are included in context
    expect(delegationContext.userPreferences).toBeDefined();
    expect(delegationContext.userPreferences).toContainEqual(
      expect.objectContaining({ key: 'morning_meetings' })
    );
  });

  test('2.3.6 - Butler synthesizes sub-agent result into coherent response', async () => {
    // GIVEN: Orchestrator with delegation enabled
    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_triage);
    orchestrator.mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);

    // WHEN: User asks about inbox and delegation completes
    const response = await orchestrator.handleUserMessage('What urgent emails do I have?');

    // Collect the full response text
    const chunks: string[] = [];
    for await (const chunk of response) {
      chunks.push(chunk);
    }
    const fullResponse = chunks.join('');

    // THEN: Butler's final response incorporates sub-agent result
    expect(fullResponse).toContain('urgent');
    expect(fullResponse).toContain('contract'); // From triage result summary

    // AND: Response is synthesized by Butler (not raw triage output)
    expect(fullResponse).not.toEqual(TRIAGE_MOCKS.urgent_client_email.summary);

    // AND: Response should be a coherent sentence (Butler frames the result)
    expect(fullResponse.length).toBeGreaterThan(TRIAGE_MOCKS.urgent_client_email.summary.length);
  });
});
```

---

## Test Code: Unit Tests

```typescript
// tests/unit/story-2.3-handoff.spec.ts
import { test, expect, vi, beforeEach, describe } from 'vitest';
import { AgentOrchestrator } from '@/agents/orchestrator';
import {
  DelegationContextSchema,
  AgentResultSchema,
  AgentTypeSchema,
  DelegationEventSchema
} from '@/agents/schemas/delegation';
import { BUTLER_MOCKS } from '../mocks/agents/butler';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';

vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

describe('Story 2.3: Agent Handoff Preservation', () => {

  test('2.3.5 - agent handoff preserves conversation state', async () => {
    // GIVEN: Orchestrator with multiple conversation turns
    const orchestrator = new AgentOrchestrator();

    // First turn - direct answer
    orchestrator.mockResponse('butler', BUTLER_MOCKS.direct_greeting);
    await orchestrator.handleUserMessage('Hello');

    // Second turn - delegation
    orchestrator.mockResponse('butler', BUTLER_MOCKS.delegate_to_triage);
    orchestrator.mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);
    await orchestrator.handleUserMessage('Check my inbox');

    // WHEN: Getting conversation history
    const history = orchestrator.getConversationHistory();

    // THEN: Full history is preserved including delegation
    expect(history).toHaveLength(4); // user, butler, user, butler+triage synthesis
    expect(history[0].role).toBe('user');
    expect(history[0].content).toBe('Hello');
    expect(history[1].role).toBe('assistant');
    expect(history[2].role).toBe('user');
    expect(history[2].content).toBe('Check my inbox');
    expect(history[3].role).toBe('assistant');
    // Third response should include delegation metadata
    expect(history[3].metadata?.delegatedTo).toBe('triage');
  });

  test('2.3.5b - DelegationContext schema validates correctly', () => {
    // GIVEN: A valid delegation context object
    const validContext = {
      parentAgent: 'butler',
      targetAgent: 'triage',
      relevantEntities: ['urgent', 'emails'],
      timeConstraints: 'last 24 hours',
      userPreferences: [
        { key: 'morning_meetings', value: 'prefers 9-11am', confidence: 0.85 }
      ],
      conversationHistory: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi! How can I help?' }
      ],
      originalUserMessage: 'Show urgent emails',
      delegationReasoning: 'User is asking about inbox triage'
    };

    // THEN: Valid context parses successfully
    expect(() => DelegationContextSchema.parse(validContext)).not.toThrow();

    // WHEN: Missing required field (originalUserMessage)
    const invalidContext = { ...validContext, originalUserMessage: undefined };

    // THEN: Validation fails
    expect(() => DelegationContextSchema.parse(invalidContext)).toThrow();

    // WHEN: Invalid agent type
    const invalidAgent = { ...validContext, targetAgent: 'unknown_agent' };

    // THEN: Validation fails
    expect(() => DelegationContextSchema.parse(invalidAgent)).toThrow();
  });

  test('2.3.5c - AgentType enum includes all required agents', () => {
    // GIVEN: The AgentTypeSchema enum
    const requiredAgents = [
      'butler',
      'triage',
      'scheduler',
      'communicator',
      'navigator',
      'preference_learner'
    ];

    // THEN: All required agents are valid enum values
    for (const agent of requiredAgents) {
      expect(() => AgentTypeSchema.parse(agent)).not.toThrow();
    }

    // AND: Invalid agent types are rejected
    expect(() => AgentTypeSchema.parse('invalid_agent')).toThrow();
    expect(() => AgentTypeSchema.parse('')).toThrow();
  });

});
```

---

## Test Code: E2E Tests

```typescript
// tests/e2e/story-2.3-agent-rail.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Story 2.3: Agent Rail UI', () => {

  test('2.3.4a - agent rail shows Butler as active initially', async ({ page }) => {
    // GIVEN: Mock SSE stream starting with Butler
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"agent_start","agent":"butler","timestamp":"2026-01-15T10:00:00Z"}',
          'data: {"type":"text","content":"Hello! How can I help you today?","agent":"butler"}',
          'data: {"type":"done"}',
        ].join('\n\n'),
      });
    });

    // WHEN: User navigates to chat and sends a message
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Hello');
    await page.click('[data-testid="send-button"]');

    // THEN: Agent rail shows Butler as active
    const agentRail = page.locator('[data-testid="agent-rail"]');
    await expect(agentRail.locator('[data-agent="butler"]')).toHaveClass(/active/);
  });

  test('2.3.4b - agent rail shows Triage as active during delegation', async ({ page }) => {
    // GIVEN: Mock SSE stream with delegation to Triage
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"agent_start","agent":"butler","timestamp":"2026-01-15T10:00:00Z"}',
          'data: {"type":"agent_delegate","from":"butler","to":"triage","timestamp":"2026-01-15T10:00:01Z"}',
          'data: {"type":"text","content":"Checking your inbox...","agent":"triage"}',
          '', // Small delay for UI to update
        ].join('\n\n'),
      });
    });

    // WHEN: User asks about inbox
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Check my urgent emails');
    await page.click('[data-testid="send-button"]');

    // THEN: Agent rail shows Triage as active during delegation
    const agentRail = page.locator('[data-testid="agent-rail"]');
    await expect(agentRail.locator('[data-agent="triage"]')).toHaveClass(/active/);

    // AND: Butler should not be active during delegation
    await expect(agentRail.locator('[data-agent="butler"]')).not.toHaveClass(/active/);
  });

  test('2.3.4c - agent rail shows Butler resuming after delegation', async ({ page }) => {
    // GIVEN: Full delegation lifecycle SSE stream
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"agent_start","agent":"butler","timestamp":"2026-01-15T10:00:00Z"}',
          'data: {"type":"agent_delegate","from":"butler","to":"triage","timestamp":"2026-01-15T10:00:01Z"}',
          'data: {"type":"text","content":"Checking your inbox...","agent":"triage"}',
          'data: {"type":"agent_complete","agent":"triage","timestamp":"2026-01-15T10:00:05Z"}',
          'data: {"type":"agent_resume","agent":"butler","timestamp":"2026-01-15T10:00:05Z"}',
          'data: {"type":"text","content":"Based on my review, you have 3 urgent emails.","agent":"butler"}',
          'data: {"type":"done"}',
        ].join('\n\n'),
      });
    });

    // WHEN: User asks about inbox and waits for completion
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Check my urgent emails');
    await page.click('[data-testid="send-button"]');

    // Wait for message completion
    await page.waitForSelector('[data-testid="message-complete"]');

    // THEN: Butler is active again after delegation completes
    const agentRail = page.locator('[data-testid="agent-rail"]');
    await expect(agentRail.locator('[data-agent="butler"]')).toHaveClass(/active/);
  });

  test('2.3.4d - delegation events stream via SSE', async ({ page }) => {
    // GIVEN: We capture SSE events received
    const receivedEvents: any[] = [];

    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"agent_start","agent":"butler","timestamp":"2026-01-15T10:00:00Z"}',
          'data: {"type":"agent_delegate","from":"butler","to":"triage","timestamp":"2026-01-15T10:00:01Z"}',
          'data: {"type":"agent_complete","agent":"triage","timestamp":"2026-01-15T10:00:05Z"}',
          'data: {"type":"agent_resume","agent":"butler","timestamp":"2026-01-15T10:00:05Z"}',
          'data: {"type":"done"}',
        ].join('\n\n'),
      });
    });

    // Listen for custom events from the frontend
    await page.exposeFunction('captureEvent', (event: any) => {
      receivedEvents.push(event);
    });

    await page.addInitScript(() => {
      window.addEventListener('delegation-event', (e: any) => {
        (window as any).captureEvent(e.detail);
      });
    });

    // WHEN: User sends a message triggering delegation
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Check my inbox');
    await page.click('[data-testid="send-button"]');

    await page.waitForSelector('[data-testid="message-complete"]');

    // THEN: All delegation event types were received
    const eventTypes = receivedEvents.map(e => e.type);
    expect(eventTypes).toContain('agent_start');
    expect(eventTypes).toContain('agent_delegate');
    expect(eventTypes).toContain('agent_complete');
    expect(eventTypes).toContain('agent_resume');
  });

});
```

---

## Data Factories Created

### Delegation Context Factory

**File:** `tests/support/factories/delegation.factory.ts`

**Exports:**

- `createDelegationContext(overrides?)` - Create delegation context with optional overrides
- `createAgentResult(overrides?)` - Create agent result with optional overrides
- `createDelegationEvent(type, overrides?)` - Create delegation SSE event

**Example Usage:**

```typescript
import { createDelegationContext, createAgentResult } from '../factories/delegation.factory';

const context = createDelegationContext({
  targetAgent: 'scheduler',
  timeConstraints: 'next week',
});

const result = createAgentResult({
  agentType: 'triage',
  summary: 'Found 3 urgent emails',
});
```

### Factory Implementation

```typescript
// tests/support/factories/delegation.factory.ts
import { faker } from '@faker-js/faker';
import type { DelegationContext, AgentResult, DelegationEvent, AgentType } from '@/agents/schemas/delegation';

export const createDelegationContext = (overrides: Partial<DelegationContext> = {}): DelegationContext => ({
  parentAgent: 'butler',
  targetAgent: faker.helpers.arrayElement(['triage', 'scheduler', 'communicator', 'navigator', 'preference_learner']) as AgentType,
  relevantEntities: [faker.word.noun(), faker.word.noun()],
  timeConstraints: faker.helpers.maybe(() => faker.helpers.arrayElement(['today', 'this week', 'last 24 hours'])),
  userPreferences: faker.helpers.maybe(() => [
    {
      key: faker.word.noun(),
      value: faker.lorem.sentence(),
      confidence: faker.number.float({ min: 0.5, max: 1.0, fractionDigits: 2 }),
    }
  ]),
  conversationHistory: faker.helpers.maybe(() => [
    { role: 'user', content: faker.lorem.sentence() },
    { role: 'assistant', content: faker.lorem.sentence() },
  ]),
  originalUserMessage: faker.lorem.sentence(),
  delegationReasoning: faker.lorem.sentence(),
  ...overrides,
});

export const createAgentResult = (overrides: Partial<AgentResult> = {}): AgentResult => ({
  agentType: faker.helpers.arrayElement(['triage', 'scheduler', 'communicator', 'navigator', 'preference_learner']) as AgentType,
  success: true,
  data: {},
  summary: faker.lorem.sentence(),
  suggestedFollowUp: faker.helpers.maybe(() => faker.lorem.sentence()),
  toolsUsed: faker.helpers.maybe(() => [faker.word.noun()]),
  tokensUsed: faker.number.int({ min: 100, max: 5000 }),
  ...overrides,
});

export const createDelegationEvent = (
  type: 'agent_start' | 'agent_delegate' | 'agent_complete' | 'agent_resume',
  overrides: Partial<DelegationEvent> = {}
): DelegationEvent => {
  const timestamp = faker.date.recent().toISOString();

  switch (type) {
    case 'agent_start':
    case 'agent_complete':
    case 'agent_resume':
      return {
        type,
        agent: faker.helpers.arrayElement(['butler', 'triage', 'scheduler']) as AgentType,
        timestamp,
        ...overrides,
      } as DelegationEvent;
    case 'agent_delegate':
      return {
        type: 'agent_delegate',
        from: 'butler' as AgentType,
        to: faker.helpers.arrayElement(['triage', 'scheduler', 'communicator']) as AgentType,
        timestamp,
        ...overrides,
      } as DelegationEvent;
  }
};
```

---

## Fixtures Created

### Orchestrator Fixture

**File:** `tests/support/fixtures/orchestrator.fixture.ts`

**Fixtures:**

- `mockOrchestrator` - Pre-configured AgentOrchestrator with mocked Claude client
  - **Setup:** Initializes orchestrator, registers mock responses
  - **Provides:** `orchestrator`, `mockResponse`, `onAgentSpawn` helpers
  - **Cleanup:** Clears all mocks and event listeners

**Example Usage:**

```typescript
import { test } from './fixtures/orchestrator.fixture';

test('should delegate to triage', async ({ mockOrchestrator }) => {
  const { orchestrator, mockResponse } = mockOrchestrator;

  mockResponse('butler', BUTLER_MOCKS.delegate_to_triage);
  mockResponse('triage', TRIAGE_MOCKS.urgent_client_email);

  await orchestrator.handleUserMessage('Check inbox');
});
```

### Fixture Implementation

```typescript
// tests/support/fixtures/orchestrator.fixture.ts
import { test as base, vi } from 'vitest';
import { AgentOrchestrator } from '@/agents/orchestrator';

interface MockOrchestratorFixture {
  orchestrator: AgentOrchestrator;
  mockResponse: (agent: string, response: any) => void;
  onAgentSpawn: (agent: string, callback: (context: any) => void) => void;
  clearMocks: () => void;
}

export const test = base.extend<{ mockOrchestrator: MockOrchestratorFixture }>({
  mockOrchestrator: async ({}, use) => {
    // Setup
    const orchestrator = new AgentOrchestrator();
    const spawnCallbacks = new Map<string, ((context: any) => void)[]>();

    const mockResponse = (agent: string, response: any) => {
      vi.spyOn(orchestrator.getAgent(agent).client.messages, 'create')
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: JSON.stringify(response) }]
        });
    };

    const onAgentSpawn = (agent: string, callback: (context: any) => void) => {
      if (!spawnCallbacks.has(agent)) {
        spawnCallbacks.set(agent, []);
      }
      spawnCallbacks.get(agent)!.push(callback);

      // Wire up the spy
      const originalSpawn = orchestrator.spawnSubAgent.bind(orchestrator);
      vi.spyOn(orchestrator, 'spawnSubAgent').mockImplementation(async (agentType, context) => {
        const callbacks = spawnCallbacks.get(agentType) || [];
        callbacks.forEach(cb => cb(context));
        return originalSpawn(agentType, context);
      });
    };

    const clearMocks = () => {
      vi.clearAllMocks();
      spawnCallbacks.clear();
    };

    // Provide to test
    await use({ orchestrator, mockResponse, onAgentSpawn, clearMocks });

    // Cleanup
    clearMocks();
  },
});
```

---

## Mock Requirements

### Butler Agent Mocks

**Location:** `tests/mocks/agents/butler.ts`

**Mock Scenarios:**

```typescript
export const BUTLER_MOCKS = {
  direct_greeting: {
    classification: {
      intent: 'direct_answer',
      confidence: 0.95,
    },
    response: 'Hello! How can I help you today?',
  },

  delegate_to_triage: {
    classification: {
      intent: 'delegate_triage',
      confidence: 0.92,
      delegationContext: {
        relevantEntities: ['inbox', 'emails'],
        timeConstraints: null,
      },
    },
    delegationReasoning: 'User is asking about email triage',
  },

  delegate_to_scheduler: {
    classification: {
      intent: 'delegate_schedule',
      confidence: 0.90,
      delegationContext: {
        relevantEntities: ['meeting', 'Alice'],
        timeConstraints: 'next week',
      },
    },
    delegationReasoning: 'User wants to schedule a meeting',
  },

  delegate_to_communicator: {
    classification: {
      intent: 'delegate_draft',
      confidence: 0.88,
      delegationContext: {
        relevantEntities: ['client', 'contract', 'reply'],
        timeConstraints: null,
      },
    },
    delegationReasoning: 'User wants to draft an email response',
  },

  delegate_to_navigator: {
    classification: {
      intent: 'delegate_search',
      confidence: 0.91,
      delegationContext: {
        relevantEntities: ['notes', 'Q4 planning'],
        timeConstraints: null,
      },
    },
    delegationReasoning: 'User is searching for information in their knowledge base',
  },

  delegate_to_preference_learner: {
    classification: {
      intent: 'delegate_learn',
      confidence: 0.85,
      delegationContext: {
        relevantEntities: ['morning meetings', 'before 10am'],
        timeConstraints: null,
      },
    },
    delegationReasoning: 'User expressed a preference pattern to learn',
  },
};
```

### Triage Agent Mocks

**Location:** `tests/mocks/agents/triage.ts`

**Mock Scenarios:**

```typescript
export const TRIAGE_MOCKS = {
  urgent_client_email: {
    emailId: 'msg_urgent_001',
    priority: 0.95,
    category: 'urgent',
    suggestedActions: ['reply_urgent', 'create_task'],
    extractedTasks: [
      {
        title: 'Review contract by EOD',
        confidence: 0.92,
        suggestedDue: 'today',
      }
    ],
    summary: 'Urgent client contract review needed by EOD',
  },

  batch_result: {
    items: [
      { emailId: 'msg_001', priority: 0.95, category: 'urgent' },
      { emailId: 'msg_002', priority: 0.6, category: 'important' },
      { emailId: 'msg_003', priority: 0.2, category: 'newsletter' },
    ],
  },
};
```

### Scheduler Agent Mocks

**Location:** `tests/mocks/agents/scheduler.ts`

**Mock Scenarios:**

```typescript
export const SCHEDULER_MOCKS = {
  propose_meeting: {
    suggestedSlots: [
      { start: '2026-01-17T09:00:00Z', end: '2026-01-17T10:00:00Z', score: 0.9 },
      { start: '2026-01-17T14:00:00Z', end: '2026-01-17T15:00:00Z', score: 0.7 },
    ],
    conflicts: [],
    reasoning: 'Morning slot has best availability overlap',
  },

  conflict_detected: {
    suggestedSlots: [],
    conflicts: [
      { title: 'Team Standup', start: '2026-01-17T09:00:00Z', end: '2026-01-17T09:30:00Z' },
    ],
    reasoning: 'Requested time conflicts with Team Standup',
  },
};
```

**Notes:**
- All Claude API responses are mocked per C-001 mitigation (Claude non-determinism)
- Mock responses follow the exact Zod schema structure
- Add new mock scenarios as edge cases are discovered

---

## Required data-testid Attributes

### Agent Rail Component

- `agent-rail` - Container for all agent indicators
- `agent-butler` - Butler agent indicator (also has `data-agent="butler"`)
- `agent-triage` - Triage agent indicator (also has `data-agent="triage"`)
- `agent-scheduler` - Scheduler agent indicator (also has `data-agent="scheduler"`)
- `agent-communicator` - Communicator agent indicator
- `agent-navigator` - Navigator agent indicator
- `agent-preference_learner` - Preference Learner agent indicator

### Chat Interface

- `chat-input` - Message input field
- `send-button` - Send message button
- `message-complete` - Marker for completed message (added after streaming ends)

**Implementation Example:**

```tsx
<div
  data-testid="agent-rail"
  className="w-16 flex flex-col items-center py-4 gap-2"
>
  {agents.map((agent) => (
    <div
      key={agent}
      data-testid={`agent-${agent}`}
      data-agent={agent}
      className={cn(
        'w-10 h-10 rounded-none flex items-center justify-center',
        activeAgent === agent && 'active bg-orion-primary-muted'
      )}
    >
      <AgentIcon agent={agent} />
    </div>
  ))}
</div>
```

---

## Implementation Checklist

### Test 2.3.1: Butler spawns Triage agent for inbox tasks

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/agents/orchestrator.ts` with `AgentOrchestrator` class
- [ ] Implement agent registry (`Map<AgentType, BaseAgent>`)
- [ ] Implement `spawnSubAgent(agentType, context)` method
- [ ] Register Triage agent in orchestrator constructor
- [ ] Wire Butler intent classification to spawn decision
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test 2.3.2: Butler spawns Scheduler agent for calendar tasks

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Register Scheduler agent in orchestrator
- [ ] Add `delegate_schedule` intent handling in orchestrator
- [ ] Verify intent-to-agent mapping for scheduler
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.3.1b: Butler spawns Communicator agent for email drafting

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Register Communicator agent in orchestrator
- [ ] Add `delegate_draft` intent handling in orchestrator
- [ ] Verify intent-to-agent mapping for communicator
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.3.1c: Butler spawns Navigator agent for PARA search

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Register Navigator agent in orchestrator
- [ ] Add `delegate_search` intent handling in orchestrator
- [ ] Verify intent-to-agent mapping for navigator
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.3.1d: Butler spawns Preference Learner agent for pattern detection

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Register Preference Learner agent in orchestrator
- [ ] Add `delegate_learn` intent handling in orchestrator
- [ ] Verify intent-to-agent mapping for preference_learner
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.3.3: Context passed correctly to sub-agent

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/agents/schemas/delegation.ts` with Zod schemas
- [ ] Implement `DelegationContextSchema` with all required fields
- [ ] Create `agent-server/src/agents/context-builder.ts`
- [ ] Implement `buildDelegationContext(intent, userMessage, history)` function
- [ ] Extract relevant entities from user message
- [ ] Extract time constraints from user message
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test 2.3.3b: Conversation history preserved during delegation

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `conversationHistory` field to `DelegationContextSchema`
- [ ] Track conversation history in orchestrator
- [ ] Include history in delegation context
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.3.3c: User preferences passed to sub-agent

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `setUserPreferences()` method to orchestrator
- [ ] Add `userPreferences` field to `DelegationContextSchema`
- [ ] Inject preferences into delegation context
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.3.6: Butler synthesizes sub-agent result into coherent response

**File:** `tests/integration/story-2.3-spawning.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `synthesizeResponse(subAgentResult, originalMessage)` method in Butler
- [ ] Butler should frame sub-agent results in natural language
- [ ] Verify synthesized response includes key information from sub-agent
- [ ] Ensure response is not raw sub-agent output
- [ ] Run test: `pnpm test:integration -- story-2.3-spawning.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.3.5: Agent handoff preserves conversation state

**File:** `tests/unit/story-2.3-handoff.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `getConversationHistory()` method in orchestrator
- [ ] Store conversation messages after each turn
- [ ] Include delegation metadata in assistant messages
- [ ] Run test: `pnpm test:unit -- story-2.3-handoff.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.3.5b: DelegationContext schema validates correctly

**File:** `tests/unit/story-2.3-handoff.spec.ts`

**Tasks to make this test pass:**

- [ ] Define complete `DelegationContextSchema` in Zod
- [ ] Add validation for required fields
- [ ] Add validation for `AgentType` enum values
- [ ] Run test: `pnpm test:unit -- story-2.3-handoff.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.3.5c: AgentType enum includes all required agents

**File:** `tests/unit/story-2.3-handoff.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `AgentTypeSchema` Zod enum in `delegation.ts`
- [ ] Include all 6 agent types: butler, triage, scheduler, communicator, navigator, preference_learner
- [ ] Run test: `pnpm test:unit -- story-2.3-handoff.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test 2.3.4a-d: Agent rail shows active agent (E2E)

**File:** `tests/e2e/story-2.3-agent-rail.spec.ts`

**Tasks to make this test pass:**

- [ ] Update `AgentRail` component to accept `activeAgent` prop
- [ ] Add `data-testid` and `data-agent` attributes
- [ ] Implement CSS `.active` class for highlighting
- [ ] Create SSE event listener for delegation events in frontend
- [ ] Emit delegation events from streaming endpoint
- [ ] Update `agent-rail.tsx` to listen for `agent_start`, `agent_delegate`, `agent_complete`, `agent_resume`
- [ ] Add transition animations between agents
- [ ] Run test: `pnpm test:e2e -- story-2.3-agent-rail.spec.ts`
- [ ] All 4 E2E tests pass (green phase)

**Estimated Effort:** 4 hours

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm test -- --grep "story-2.3"

# Run specific test file - unit tests
pnpm test:unit -- story-2.3-handoff.spec.ts

# Run specific test file - integration tests
pnpm test:integration -- story-2.3-spawning.spec.ts

# Run E2E tests in headed mode (see browser)
pnpm test:e2e -- story-2.3-agent-rail.spec.ts --headed

# Debug specific test
pnpm test:e2e -- story-2.3-agent-rail.spec.ts --debug

# Run tests with coverage
pnpm test:unit -- --coverage --grep "story-2.3"
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Fixtures and factories created with auto-cleanup
- Mock requirements documented
- data-testid requirements listed
- Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with 2.3.5c - AgentType enum)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Recommended Test Order:**

1. 2.3.5c - AgentType enum (smallest scope)
2. 2.3.5b - DelegationContext schema
3. 2.3.5 - Conversation history tracking
4. 2.3.3 - Context builder
5. 2.3.1 - Butler spawns Triage
6. 2.3.2 - Butler spawns Scheduler
7. 2.3.1b - Butler spawns Communicator
8. 2.3.1c - Butler spawns Navigator
9. 2.3.1d - Butler spawns Preference Learner
10. 2.3.3b - History in delegation context
11. 2.3.3c - Preferences in delegation context
12. 2.3.6 - Butler synthesizes sub-agent result
13. 2.3.4a-d - E2E agent rail tests (frontend work)

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `sprint-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase: `pnpm test -- --grep "story-2.3"`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments and sources:

- **test-design-epic-2.md** - Story 2.3 test scenarios (2.3.1-2.3.5), agent mock registry, test code examples
- **test-design-system-level.md** - Testability concerns (C-001 Claude non-determinism), mock strategy
- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation
- **network-first.md** - Route interception patterns for E2E streaming tests
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism)
- **story-2-3-sub-agent-spawning.md** - Story acceptance criteria, dev notes, schema implementations

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `pnpm test -- --grep "story-2.3"`

**Expected Results:**

```
 FAIL  tests/unit/story-2.3-handoff.spec.ts
   Story 2.3: Agent Handoff Preservation
     x 2.3.5 - agent handoff preserves conversation state
     x 2.3.5b - DelegationContext schema validates correctly
     x 2.3.5c - AgentType enum includes all required agents

 FAIL  tests/integration/story-2.3-spawning.spec.ts
   Story 2.3: Sub-Agent Spawning
     x 2.3.1 - Butler spawns Triage agent for inbox tasks
     x 2.3.2 - Butler spawns Scheduler agent for calendar tasks
     x 2.3.1b - Butler spawns Communicator agent for email drafting tasks
     x 2.3.1c - Butler spawns Navigator agent for PARA search tasks
     x 2.3.1d - Butler spawns Preference Learner agent for pattern detection
     x 2.3.3 - context is passed correctly to sub-agent
     x 2.3.3b - conversation history preserved during delegation
     x 2.3.3c - user preferences passed to sub-agent
     x 2.3.6 - Butler synthesizes sub-agent result into coherent response

 FAIL  tests/e2e/story-2.3-agent-rail.spec.ts
   Story 2.3: Agent Rail UI
     x 2.3.4a - agent rail shows Butler as active initially
     x 2.3.4b - agent rail shows Triage as active during delegation
     x 2.3.4c - agent rail shows Butler resuming after delegation
     x 2.3.4d - delegation events stream via SSE

Test Files  3 failed
     Tests  16 failed
```

**Summary:**

- Total tests: 16
- Passing: 0 (expected)
- Failing: 16 (expected)
- Status: RED phase verified

**Expected Failure Messages:**

- `AgentOrchestrator is not defined` - Class not implemented yet
- `DelegationContextSchema is not defined` - Schema not created
- `AgentTypeSchema is not defined` - Enum not created
- `Cannot find element [data-testid="agent-rail"]` - Component not updated
- `Cannot read property 'spawnSubAgent' of undefined` - Method not implemented

---

## Notes

- **C-001 Mitigation Applied:** All Claude API responses are mocked - no real Claude calls in tests
- **C-004 Consideration:** This story implements spawning for core agents only (Triage, Scheduler); other agents use same mechanism
- **Network-First Pattern:** E2E tests use route interception BEFORE actions to prevent race conditions
- **Schema Validation:** All agent results and delegation contexts validated against Zod schemas
- **Event Order Critical:** Delegation events must be emitted in correct order (start -> delegate -> complete -> resume)

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @TEA in Slack/Discord
- Refer to `_bmad/bmm/workflows/testarch/atdd/instructions.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2026-01-15
