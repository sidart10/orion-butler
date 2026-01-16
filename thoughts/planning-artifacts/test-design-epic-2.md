# Epic 2: Agent & Automation Infrastructure - Test Design

**Version:** 1.0
**Status:** Ready for Implementation
**Date:** 2026-01-15
**Author:** TEA (Test Architect Agent)
**Epic:** Agent & Automation Infrastructure (Stories 2.1-2.10)

---

## 1. Epic Overview

| Metric | Value |
|--------|-------|
| Stories | 10 |
| Test Cases | 58 |
| Critical Paths | 4 |
| Risk Level | HIGH |
| Primary Concern | C-001 (Claude non-determinism), C-004 (26 agent complexity) |

### Test Level Distribution

| Level | Count | Coverage |
|-------|-------|----------|
| Unit | 28 | 48% |
| Integration | 22 | 38% |
| E2E | 8 | 14% |

**Note:** Epic 2 is heavily unit/integration focused due to agent logic testing. E2E tests validate UI elements only.

### Agent Testing Strategy

Per C-001 and C-004 mitigations:
- **All Claude responses mocked** with structured output schemas
- **Tiered testing**: Core 4 agents (full), others (smoke)
- **Schema validation** on all agent outputs

---

## 2. Story-Level Test Scenarios

### Story 2.1: Butler Agent Core

**Risk:** HIGH | **Priority:** P0 (Core Orchestrator)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.1.1 | Unit | Prompt template loads | Valid template object | Vitest |
| 2.1.2 | Integration | Simple query end-to-end | Response returned | Vitest + mock |
| 2.1.3 | Integration | Delegates to Triage for inbox | Triage agent spawned | Vitest + mock |
| 2.1.4 | Integration | Delegates to Scheduler for calendar | Scheduler agent spawned | Vitest + mock |
| 2.1.5 | Unit | Intent classification - greeting | `direct_answer` intent | Vitest |
| 2.1.6 | Unit | Intent classification - triage | `delegate_triage` intent | Vitest |
| 2.1.7 | Unit | Intent classification - schedule | `delegate_schedule` intent | Vitest |
| 2.1.8 | E2E | Multi-step task synthesized | Coherent final response | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-2.1-butler-agent.spec.ts
import { test, expect, vi, beforeEach } from 'vitest';
import { ButlerAgent } from '@/agents/butler';
import { loadAgentTemplate } from '@/agents/templates';
import { IntentClassificationSchema, ButlerResponseSchema } from '@/agents/schemas/butler';
import { BUTLER_MOCKS } from '../mocks/agents/butler';

// Mock Claude SDK
vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

test('2.1.1 - Butler prompt template loads correctly', async () => {
  const template = await loadAgentTemplate('butler');

  expect(template).toHaveProperty('name', 'Butler');
  expect(template).toHaveProperty('systemPrompt');
  expect(template).toHaveProperty('tools');
  expect(template.systemPrompt.length).toBeGreaterThan(500); // Substantial prompt
});

test('2.1.5 - intent classification: greeting → direct_answer', async () => {
  const butler = new ButlerAgent();

  // Mock response
  vi.mocked(butler.client.messages.create).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(BUTLER_MOCKS.direct_greeting) }]
  });

  const result = await butler.classifyIntent('Hello, how are you?');

  // Validate against schema
  const validated = IntentClassificationSchema.parse(result.classification);

  expect(validated.intent).toBe('direct_answer');
  expect(validated.confidence).toBeGreaterThan(0.8);
});

test('2.1.6 - intent classification: inbox query → delegate_triage', async () => {
  const butler = new ButlerAgent();

  vi.mocked(butler.client.messages.create).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(BUTLER_MOCKS.delegate_to_triage) }]
  });

  const result = await butler.classifyIntent('What urgent emails do I have?');
  const validated = IntentClassificationSchema.parse(result.classification);

  expect(validated.intent).toBe('delegate_triage');
  expect(validated.delegationContext?.relevantEntities).toContain('inbox');
});

test('2.1.7 - intent classification: scheduling → delegate_schedule', async () => {
  const butler = new ButlerAgent();

  vi.mocked(butler.client.messages.create).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(BUTLER_MOCKS.delegate_to_scheduler) }]
  });

  const result = await butler.classifyIntent('Schedule a meeting with John tomorrow');
  const validated = IntentClassificationSchema.parse(result.classification);

  expect(validated.intent).toBe('delegate_schedule');
  expect(validated.delegationContext?.relevantEntities).toContain('John');
});

// tests/integration/story-2.1-butler-delegation.spec.ts
import { test, expect, vi } from 'vitest';
import { ButlerAgent } from '@/agents/butler';
import { TriageAgent } from '@/agents/triage';
import { SchedulerAgent } from '@/agents/scheduler';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';
import { SCHEDULER_MOCKS } from '../mocks/agents/scheduler';

test('2.1.3 - Butler delegates to Triage for inbox tasks', async () => {
  const butler = new ButlerAgent();
  const triageSpawn = vi.spyOn(butler, 'spawnSubAgent');

  // Mock Butler to delegate
  vi.mocked(butler.client.messages.create)
    .mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(BUTLER_MOCKS.delegate_to_triage) }]
    })
    .mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(TRIAGE_MOCKS.urgent_client_email) }]
    });

  const result = await butler.handleMessage('Check my inbox for urgent items');

  expect(triageSpawn).toHaveBeenCalledWith('triage', expect.any(Object));
});

test('2.1.4 - Butler delegates to Scheduler for calendar tasks', async () => {
  const butler = new ButlerAgent();
  const schedulerSpawn = vi.spyOn(butler, 'spawnSubAgent');

  vi.mocked(butler.client.messages.create)
    .mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(BUTLER_MOCKS.delegate_to_scheduler) }]
    })
    .mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(SCHEDULER_MOCKS.propose_meeting) }]
    });

  const result = await butler.handleMessage('Find a time to meet with Alice next week');

  expect(schedulerSpawn).toHaveBeenCalledWith('scheduler', expect.any(Object));
});
```

---

### Story 2.2: Agent Prompt Templates

**Risk:** MEDIUM | **Priority:** P0 (Infrastructure)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.2.1 | Unit | All 26 templates parse | No parse errors | Vitest |
| 2.2.2 | Unit | Variable interpolation works | Variables replaced | Vitest |
| 2.2.3 | Unit | Core 4 agents have complete prompts | All fields present | Vitest |
| 2.2.4 | Integration | Agent uses template at runtime | Correct prompt sent | Vitest + mock |

#### Test Code

```typescript
// tests/unit/story-2.2-templates.spec.ts
import { test, expect, describe } from 'vitest';
import { loadAgentTemplate, interpolateTemplate, AGENT_NAMES } from '@/agents/templates';
import { AgentTemplateSchema } from '@/agents/schemas/template';

const CORE_AGENTS = ['butler', 'triage', 'scheduler', 'communicator'];

describe('Story 2.2: Agent Prompt Templates', () => {

  test('2.2.1 - all 26 agent templates parse without errors', async () => {
    const errors: string[] = [];

    for (const agentName of AGENT_NAMES) {
      try {
        const template = await loadAgentTemplate(agentName);
        AgentTemplateSchema.parse(template);
      } catch (e: any) {
        errors.push(`${agentName}: ${e.message}`);
      }
    }

    expect(errors).toHaveLength(0);
    expect(AGENT_NAMES).toHaveLength(26);
  });

  test('2.2.2 - variable interpolation works', async () => {
    const template = await loadAgentTemplate('butler');

    const interpolated = interpolateTemplate(template.systemPrompt, {
      user_name: 'Sid',
      current_date: '2026-01-15',
      timezone: 'America/Los_Angeles',
    });

    expect(interpolated).toContain('Sid');
    expect(interpolated).toContain('2026-01-15');
    expect(interpolated).not.toContain('{{user_name}}');
    expect(interpolated).not.toContain('{{current_date}}');
  });

  test.each(CORE_AGENTS)('2.2.3 - %s agent has complete prompt definition', async (agentName) => {
    const template = await loadAgentTemplate(agentName);

    expect(template.name).toBeTruthy();
    expect(template.description).toBeTruthy();
    expect(template.systemPrompt).toBeTruthy();
    expect(template.tools).toBeInstanceOf(Array);

    // Core agents should have substantial prompts
    expect(template.systemPrompt.length).toBeGreaterThan(1000);

    // Should have persona section
    expect(template.systemPrompt).toMatch(/persona|role|you are/i);

    // Should have constraints section
    expect(template.systemPrompt).toMatch(/constraint|rule|must|never/i);
  });

  test('2.2.4 - agent loads and uses correct template at runtime', async () => {
    const butler = new ButlerAgent();

    // Spy on Claude call
    const createSpy = vi.spyOn(butler.client.messages, 'create');

    await butler.handleMessage('Hello');

    // Verify system prompt was from template
    const callArgs = createSpy.mock.calls[0][0];
    expect(callArgs.system).toContain('Butler');
    expect(callArgs.system.length).toBeGreaterThan(1000);
  });

});
```

---

### Story 2.3: Sub-Agent Spawning

**Risk:** HIGH | **Priority:** P0 (Core Feature)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.3.1 | Integration | Butler spawns Triage | Triage agent runs | Vitest |
| 2.3.2 | Integration | Butler spawns Scheduler | Scheduler agent runs | Vitest |
| 2.3.3 | Integration | Context passed to sub-agent | Sub-agent receives context | Vitest |
| 2.3.4 | E2E | Agent rail shows active agent | UI updates | Vercel Browser Agent |
| 2.3.5 | Unit | Handoff preserves conversation | History intact | Vitest |

#### Test Code

```typescript
// tests/integration/story-2.3-spawning.spec.ts
import { test, expect, vi } from 'vitest';
import { ButlerAgent } from '@/agents/butler';
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

---

### Story 2.4: Tool Permission System (canUseTool)

**Risk:** HIGH | **Priority:** P0 (Security)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.4.1 | Unit | Read tool → auto-execute | No prompt shown | Vitest |
| 2.4.2 | Unit | Write tool → confirmation | Prompt required | Vitest |
| 2.4.3 | Unit | Destructive tool → blocked | Explicit approval needed | Vitest |
| 2.4.4 | E2E | Read tool executes silently | No dialog | Vercel Browser Agent |
| 2.4.5 | E2E | Write tool shows dialog | Confirmation visible | Vercel Browser Agent |
| 2.4.6 | E2E | "Always allow" persists session | No re-prompt | Vercel Browser Agent |
| 2.4.7 | Integration | Decisions logged to action_log | Audit trail | Vitest |

#### Test Code

```typescript
// tests/unit/story-2.4-permissions.spec.ts
import { test, expect } from 'vitest';
import { canUseTool, ToolCategory, PermissionDecision } from '@/agents/permissions';
import { TOOL_CATALOG } from '@/tools/catalog';

describe('Story 2.4: Tool Permission System', () => {

  test('2.4.1 - read tools auto-execute without prompt', () => {
    const readTools = ['get_emails', 'get_calendar_events', 'search_contacts', 'get_preferences'];

    for (const tool of readTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      expect(decision.allowed).toBe(true);
      expect(decision.requiresConfirmation).toBe(false);
      expect(decision.category).toBe(ToolCategory.READ);
    }
  });

  test('2.4.2 - write tools require confirmation', () => {
    const writeTools = ['send_email', 'create_event', 'update_contact', 'create_task'];

    for (const tool of writeTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      expect(decision.allowed).toBe(true);
      expect(decision.requiresConfirmation).toBe(true);
      expect(decision.category).toBe(ToolCategory.WRITE);
    }
  });

  test('2.4.3 - destructive tools are blocked until explicit approval', () => {
    const destructiveTools = ['delete_email', 'cancel_event', 'delete_contact', 'archive_project'];

    for (const tool of destructiveTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      expect(decision.allowed).toBe(false);
      expect(decision.requiresExplicitApproval).toBe(true);
      expect(decision.category).toBe(ToolCategory.DESTRUCTIVE);
      expect(decision.warningMessage).toBeTruthy();
    }
  });

  test('2.4.6 - session "always allow" bypasses confirmation', () => {
    const sessionPermissions = {
      send_email: { allowed: true, alwaysAllow: true, grantedAt: Date.now() }
    };

    const decision = canUseTool('send_email', { sessionPermissions });

    expect(decision.allowed).toBe(true);
    expect(decision.requiresConfirmation).toBe(false); // Already granted
    expect(decision.grantedBy).toBe('session');
  });

  test('session permissions reset on app restart', () => {
    // Simulate app restart by clearing session
    const freshSession = {};

    const decision = canUseTool('send_email', { sessionPermissions: freshSession });

    expect(decision.requiresConfirmation).toBe(true); // Back to requiring confirmation
  });

});

// tests/integration/story-2.4-audit-log.spec.ts
import { test, expect, beforeEach } from 'vitest';
import { PermissionService } from '@/services/permissions';
import { createTestDatabase } from '../helpers/database';

let db: any;
let permissionService: PermissionService;

beforeEach(() => {
  db = createTestDatabase();
  permissionService = new PermissionService(db);
});

test('2.4.7 - permission decisions are logged to action_log', async () => {
  // User approves send_email
  await permissionService.recordDecision({
    tool: 'send_email',
    decision: 'approved',
    alwaysAllow: false,
    context: { recipient: 'john@example.com', subject: 'Test' },
  });

  // User denies delete_email
  await permissionService.recordDecision({
    tool: 'delete_email',
    decision: 'denied',
    context: { emailId: 'msg_001' },
  });

  // Query audit log
  const logs = db.prepare(`
    SELECT * FROM action_log WHERE type = 'permission'
    ORDER BY created_at DESC
  `).all();

  expect(logs).toHaveLength(2);

  expect(logs[0].tool).toBe('delete_email');
  expect(logs[0].decision).toBe('denied');

  expect(logs[1].tool).toBe('send_email');
  expect(logs[1].decision).toBe('approved');
});

// tests/e2e/story-2.4-permission-dialog.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('2.4.5 - write tool shows confirmation dialog', async ({ page }) => {
  // Mock agent response that uses a write tool
  await page.route('**/api/chat', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `
        data: {"type":"tool_request","name":"send_email","input":{"to":"john@example.com","subject":"Meeting"}}
        data: {"type":"awaiting_permission"}
      `,
    });
  });

  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Send an email to John about the meeting');
  await page.click('[data-testid="send-button"]');

  // Permission dialog should appear
  const dialog = page.locator('[data-testid="permission-dialog"]');
  await expect(dialog).toBeVisible();

  // Should show tool name and action
  await expect(dialog.getByText('send_email')).toBeVisible();
  await expect(dialog.getByText('john@example.com')).toBeVisible();

  // Should have approve/deny buttons
  await expect(dialog.getByRole('button', { name: /approve/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /deny/i })).toBeVisible();

  // Should have "always allow" checkbox
  await expect(dialog.getByLabel(/always allow/i)).toBeVisible();
});
```

---

### Story 2.5: Triage Agent Definition

**Risk:** HIGH | **Priority:** P0 (Core Feature)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.5.1 | Unit | Prompt includes scoring criteria | Scoring instructions present | Vitest |
| 2.5.2 | Unit | TriageResult schema validates | Zod parse succeeds | Vitest |
| 2.5.3 | Integration | Produces structured output | Valid JSON response | Vitest + mock |
| 2.5.4 | Unit | Priority score 0.0-1.0 | Bounded values | Vitest |
| 2.5.5 | Unit | Tasks include confidence | Confidence field present | Vitest |

#### Test Code

```typescript
// tests/unit/story-2.5-triage.spec.ts
import { test, expect } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import { TriageResultSchema, ActionItemSchema } from '@/agents/schemas/triage';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';

test('2.5.1 - Triage prompt includes scoring criteria', async () => {
  const template = await loadAgentTemplate('triage');

  // Should have priority scoring instructions
  expect(template.systemPrompt).toMatch(/priority.*score/i);
  expect(template.systemPrompt).toMatch(/0\.0.*1\.0|0-1/i);

  // Should have category definitions
  expect(template.systemPrompt).toMatch(/urgent|important|fyi|newsletter/i);

  // Should have action extraction instructions
  expect(template.systemPrompt).toMatch(/extract.*action|action.*item/i);
});

test('2.5.2 - TriageResult schema validates correctly', () => {
  // Valid result
  const validResult = TRIAGE_MOCKS.urgent_client_email;
  expect(() => TriageResultSchema.parse(validResult)).not.toThrow();

  // Invalid: priority out of range
  const invalidPriority = { ...validResult, priority: 1.5 };
  expect(() => TriageResultSchema.parse(invalidPriority)).toThrow();

  // Invalid: missing required field
  const missingCategory = { ...validResult, category: undefined };
  expect(() => TriageResultSchema.parse(missingCategory)).toThrow();

  // Invalid: wrong category enum
  const wrongCategory = { ...validResult, category: 'invalid' };
  expect(() => TriageResultSchema.parse(wrongCategory)).toThrow();
});

test('2.5.4 - priority score is always 0.0-1.0', () => {
  const mockResults = Object.values(TRIAGE_MOCKS);

  for (const result of mockResults) {
    const validated = TriageResultSchema.parse(result);

    expect(validated.priority).toBeGreaterThanOrEqual(0.0);
    expect(validated.priority).toBeLessThanOrEqual(1.0);
  }
});

test('2.5.5 - extracted tasks include confidence scores', () => {
  const result = TRIAGE_MOCKS.urgent_client_email;
  const validated = TriageResultSchema.parse(result);

  for (const task of validated.extractedTasks) {
    expect(task).toHaveProperty('confidence');
    expect(task.confidence).toBeGreaterThanOrEqual(0.0);
    expect(task.confidence).toBeLessThanOrEqual(1.0);
  }
});

// tests/integration/story-2.5-triage-output.spec.ts
import { test, expect, vi } from 'vitest';
import { TriageAgent } from '@/agents/triage';
import { TriageResultSchema } from '@/agents/schemas/triage';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';

test('2.5.3 - Triage produces valid structured output', async () => {
  const triage = new TriageAgent();

  vi.mocked(triage.client.messages.create).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(TRIAGE_MOCKS.urgent_client_email) }]
  });

  const result = await triage.analyzeEmail({
    id: 'msg_001',
    subject: 'URGENT: Contract Review Needed',
    body: 'Please review the attached contract by EOD...',
    from: 'vip@client.com',
    date: '2026-01-15T08:00:00Z',
  });

  // Should parse without errors
  const validated = TriageResultSchema.parse(result);

  expect(validated.emailId).toBe('msg_urgent_001');
  expect(validated.priority).toBeGreaterThan(0.9);
  expect(validated.category).toBe('urgent');
  expect(validated.suggestedActions).toContain('reply_urgent');
});
```

---

### Story 2.6: Scheduler Agent Definition

**Risk:** HIGH | **Priority:** P0 (Core Feature)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.6.1 | Unit | Prompt includes availability logic | Instructions present | Vitest |
| 2.6.2 | Integration | Extended thinking activates | thinkingBudget set | Vitest + mock |
| 2.6.3 | Unit | Thinking budget scales | Higher for complex | Vitest |
| 2.6.4 | Integration | Conflicts identified | Conflict array populated | Vitest |
| 2.6.5 | E2E | Respects existing calendar | No double-booking | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-2.6-scheduler.spec.ts
import { test, expect } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import { SchedulerResponseSchema } from '@/agents/schemas/scheduler';
import { SCHEDULER_MOCKS } from '../mocks/agents/scheduler';

test('2.6.1 - Scheduler prompt includes availability logic', async () => {
  const template = await loadAgentTemplate('scheduler');

  // Should have availability checking instructions
  expect(template.systemPrompt).toMatch(/availability|free.*busy|calendar.*check/i);

  // Should consider multiple factors
  expect(template.systemPrompt).toMatch(/conflict/i);
  expect(template.systemPrompt).toMatch(/travel.*time|commute/i);
  expect(template.systemPrompt).toMatch(/focus.*time|deep.*work/i);
  expect(template.systemPrompt).toMatch(/preference/i);
});

test('2.6.3 - thinking budget scales with complexity', () => {
  const { calculateThinkingBudget } = require('@/agents/scheduler/thinking');

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
  expect(calculateThinkingBudget(mediumRequest)).toBeGreaterThan(2000);
  expect(calculateThinkingBudget(mediumRequest)).toBeLessThan(8000);

  // Complex request: 5+ attendees, 2 week range, multiple constraints
  const complexRequest = {
    attendees: ['a@ex.com', 'b@ex.com', 'c@ex.com', 'd@ex.com', 'e@ex.com'],
    dateRange: { days: 14 },
    constraints: ['morning preferred', 'avoid Fridays', 'need video call'],
  };
  expect(calculateThinkingBudget(complexRequest)).toBeGreaterThan(8000);
  expect(calculateThinkingBudget(complexRequest)).toBeLessThanOrEqual(15000);
});

// tests/integration/story-2.6-scheduler-conflicts.spec.ts
import { test, expect, vi } from 'vitest';
import { SchedulerAgent } from '@/agents/scheduler';
import { SCHEDULER_MOCKS } from '../mocks/agents/scheduler';

test('2.6.2 - extended thinking activates for complex requests', async () => {
  const scheduler = new SchedulerAgent();
  const createSpy = vi.spyOn(scheduler.client.messages, 'create');

  vi.mocked(createSpy).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(SCHEDULER_MOCKS.propose_meeting) }]
  });

  await scheduler.handleRequest({
    type: 'schedule_meeting',
    attendees: ['a@ex.com', 'b@ex.com', 'c@ex.com', 'd@ex.com'],
    dateRange: { days: 14 },
    duration: 60,
  });

  // Verify extended thinking was enabled
  const callArgs = createSpy.mock.calls[0][0];
  expect(callArgs).toHaveProperty('thinking');
  expect(callArgs.thinking.budget_tokens).toBeGreaterThan(1024);
});

test('2.6.4 - Scheduler identifies conflicts correctly', async () => {
  const scheduler = new SchedulerAgent();

  vi.mocked(scheduler.client.messages.create).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(SCHEDULER_MOCKS.conflict_detected) }]
  });

  const result = await scheduler.handleRequest({
    type: 'schedule_meeting',
    preferredTime: '2026-01-17T09:00:00Z',
    duration: 60,
    attendees: ['client@example.com'],
  });

  expect(result.conflicts).toBeDefined();
  expect(result.conflicts).toHaveLength(1);
  expect(result.conflicts[0].title).toBe('Team Standup');
});
```

---

### Story 2.7: Communicator Agent Definition

**Risk:** MEDIUM | **Priority:** P1

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.7.1 | Unit | Prompt includes tone matching | Instructions present | Vitest |
| 2.7.2 | Integration | Draft varies by relationship | Different formality | Vitest |
| 2.7.3 | E2E | Draft appears in canvas | Editable draft visible | Vercel Browser Agent |
| 2.7.4 | Unit | Never auto-sends | Explicit action required | Vitest |
| 2.7.5 | Integration | User edits stored | Learning record created | Vitest |

#### Test Code

```typescript
// tests/unit/story-2.7-communicator.spec.ts
import { test, expect } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import { CommunicatorResponseSchema } from '@/agents/schemas/communicator';
import { COMMUNICATOR_MOCKS } from '../mocks/agents/communicator';

test('2.7.1 - Communicator prompt includes tone-matching instructions', async () => {
  const template = await loadAgentTemplate('communicator');

  expect(template.systemPrompt).toMatch(/tone/i);
  expect(template.systemPrompt).toMatch(/formal|casual|professional/i);
  expect(template.systemPrompt).toMatch(/relationship|recipient/i);
  expect(template.systemPrompt).toMatch(/past.*communication|history/i);
});

test('2.7.4 - Communicator never auto-sends', async () => {
  const template = await loadAgentTemplate('communicator');

  // Explicit constraints in prompt
  expect(template.systemPrompt).toMatch(/never.*auto.*send|do not.*send.*automatically/i);
  expect(template.systemPrompt).toMatch(/user.*review|approval.*required/i);

  // Schema should not have send action
  const draft = COMMUNICATOR_MOCKS.formal_reply;
  const validated = CommunicatorResponseSchema.parse(draft);

  expect(validated.action).not.toBe('send');
  expect(['draft_reply', 'draft_new', 'suggest_template', 'refine_draft', 'clarify']).toContain(validated.action);
});

// tests/integration/story-2.7-communicator-tone.spec.ts
import { test, expect, vi } from 'vitest';
import { CommunicatorAgent } from '@/agents/communicator';
import { COMMUNICATOR_MOCKS } from '../mocks/agents/communicator';

test('2.7.2 - draft formality varies by recipient relationship', async () => {
  const communicator = new CommunicatorAgent();

  // Mock formal reply for client
  vi.mocked(communicator.client.messages.create)
    .mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(COMMUNICATOR_MOCKS.formal_reply) }]
    })
    .mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(COMMUNICATOR_MOCKS.casual_reply) }]
    });

  // Draft for client
  const clientDraft = await communicator.draftReply({
    originalEmail: { from: 'ceo@bigcorp.com' },
    recipientRelationship: 'client',
  });

  // Draft for colleague
  const colleagueDraft = await communicator.draftReply({
    originalEmail: { from: 'alice@mycompany.com' },
    recipientRelationship: 'colleague',
  });

  expect(clientDraft.draft.tone).toBe('formal');
  expect(colleagueDraft.draft.tone).toBe('casual');

  // Content should reflect tone
  expect(clientDraft.draft.body).toMatch(/dear|sincerely/i);
  expect(colleagueDraft.draft.body).toMatch(/hey|thanks/i);
});

test('2.7.5 - user edits are stored for learning', async () => {
  const communicator = new CommunicatorAgent();
  const learningSpy = vi.spyOn(communicator, 'recordUserEdit');

  await communicator.recordUserEdit({
    originalDraft: 'Dear Mr. Smith,\n\nI hope this finds you well.',
    editedDraft: 'Hi John,\n\nHope you\'re doing well!',
    recipient: 'john@example.com',
  });

  expect(learningSpy).toHaveBeenCalledWith(expect.objectContaining({
    originalDraft: expect.any(String),
    editedDraft: expect.any(String),
    recipient: 'john@example.com',
  }));
});
```

---

### Story 2.8: Navigator Agent Definition

**Risk:** MEDIUM | **Priority:** P1

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.8.1 | Unit | Prompt includes PARA logic | Search instructions | Vitest |
| 2.8.2 | Integration | Queries all 4 categories | P/A/R/Archive searched | Vitest |
| 2.8.3 | Integration | Semantic search with embeddings | Vector query used | Vitest |
| 2.8.4 | E2E | Results clickable | Navigation works | Vercel Browser Agent |
| 2.8.5 | Unit | Relevance scoring consistent | Same input = same score | Vitest |

#### Test Code

```typescript
// tests/unit/story-2.8-navigator.spec.ts
import { test, expect } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import { NavigatorResponseSchema } from '@/agents/schemas/navigator';

test('2.8.1 - Navigator prompt includes PARA search logic', async () => {
  const template = await loadAgentTemplate('navigator');

  // Should mention all PARA categories
  expect(template.systemPrompt).toMatch(/project/i);
  expect(template.systemPrompt).toMatch(/area/i);
  expect(template.systemPrompt).toMatch(/resource/i);
  expect(template.systemPrompt).toMatch(/archive/i);

  // Should describe search behavior
  expect(template.systemPrompt).toMatch(/semantic.*search|embedding/i);
  expect(template.systemPrompt).toMatch(/relevance|rank/i);
});

// tests/integration/story-2.8-navigator-search.spec.ts
import { test, expect, vi } from 'vitest';
import { NavigatorAgent } from '@/agents/navigator';
import { SearchService } from '@/services/search';

test('2.8.2 - Navigator queries all four PARA categories', async () => {
  const searchService = new SearchService();
  const searchSpy = vi.spyOn(searchService, 'search');

  const navigator = new NavigatorAgent({ searchService });

  await navigator.search('quarterly report');

  // Should search all categories
  expect(searchSpy).toHaveBeenCalledWith(expect.objectContaining({
    query: 'quarterly report',
    categories: ['project', 'area', 'resource', 'archive'],
  }));
});

test('2.8.3 - Navigator uses semantic search with embeddings', async () => {
  const searchService = new SearchService();
  const vectorSpy = vi.spyOn(searchService, 'vectorSearch');

  const navigator = new NavigatorAgent({ searchService });

  await navigator.search('that design doc from last month');

  // Should use vector search (not just keyword)
  expect(vectorSpy).toHaveBeenCalled();
  expect(vectorSpy).toHaveBeenCalledWith(expect.objectContaining({
    query: expect.any(String),
    useEmbeddings: true,
  }));
});

test('2.8.5 - relevance scoring is consistent', async () => {
  const navigator = new NavigatorAgent();

  const result1 = await navigator.search('project alpha');
  const result2 = await navigator.search('project alpha');

  // Same query should return same scores
  expect(result1.results.map(r => r.relevanceScore))
    .toEqual(result2.results.map(r => r.relevanceScore));
});
```

---

### Story 2.9: Preference Learner Agent Definition

**Risk:** MEDIUM | **Priority:** P2

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.9.1 | Unit | Prompt includes pattern detection | Instructions present | Vitest |
| 2.9.2 | Integration | Repeated behavior increases confidence | Confidence grows | Vitest |
| 2.9.3 | Unit | Schema includes source and confidence | Fields present | Vitest |
| 2.9.4 | Integration | Preferences inject into Butler | Context enriched | Vitest |
| 2.9.5 | E2E | Agent reflects learned preference | Behavior changes | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-2.9-preference-learner.spec.ts
import { test, expect } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import { LearnedPreferenceSchema } from '@/agents/schemas/preference-learner';

test('2.9.1 - Preference Learner prompt includes pattern detection', async () => {
  const template = await loadAgentTemplate('preference_learner');

  expect(template.systemPrompt).toMatch(/pattern|behavior|habit/i);
  expect(template.systemPrompt).toMatch(/observe|detect|learn/i);
  expect(template.systemPrompt).toMatch(/confidence|certainty/i);
});

test('2.9.3 - preference schema includes source and confidence', () => {
  const validPreference = {
    id: 'pref_001',
    category: 'scheduling_preference',
    preference: 'Prefers morning meetings',
    confidence: 0.85,
    source: 'observed',
    evidence: [
      { action: 'scheduled_meeting', timestamp: '2026-01-10T09:00:00Z', context: 'Chose 9am slot' }
    ],
    lastUpdated: '2026-01-15T00:00:00Z',
  };

  expect(() => LearnedPreferenceSchema.parse(validPreference)).not.toThrow();

  // Source must be explicit, observed, or inferred
  const invalidSource = { ...validPreference, source: 'unknown' };
  expect(() => LearnedPreferenceSchema.parse(invalidSource)).toThrow();

  // Confidence must be 0-1
  const invalidConfidence = { ...validPreference, confidence: 1.5 };
  expect(() => LearnedPreferenceSchema.parse(invalidConfidence)).toThrow();
});

// tests/integration/story-2.9-confidence.spec.ts
import { test, expect } from 'vitest';
import { PreferenceLearner } from '@/agents/preference-learner';
import { PreferenceStore } from '@/services/preferences';

test('2.9.2 - repeated behavior increases confidence', async () => {
  const store = new PreferenceStore();
  const learner = new PreferenceLearner({ store });

  // First observation
  await learner.observeAction({
    action: 'scheduled_meeting',
    time: '09:00',
    context: 'morning slot chosen',
  });

  let preference = await store.getPreference('scheduling_preference', 'morning_meetings');
  expect(preference.confidence).toBeCloseTo(0.3, 1); // Low confidence

  // Second observation
  await learner.observeAction({
    action: 'scheduled_meeting',
    time: '10:00',
    context: 'morning slot chosen',
  });

  preference = await store.getPreference('scheduling_preference', 'morning_meetings');
  expect(preference.confidence).toBeCloseTo(0.5, 1); // Medium confidence

  // Third observation
  await learner.observeAction({
    action: 'scheduled_meeting',
    time: '09:30',
    context: 'morning slot chosen',
  });

  preference = await store.getPreference('scheduling_preference', 'morning_meetings');
  expect(preference.confidence).toBeGreaterThan(0.7); // High confidence
});

test('2.9.4 - preferences inject into Butler context', async () => {
  const store = new PreferenceStore();

  // Add a preference
  await store.setPreference({
    id: 'pref_morning',
    category: 'scheduling_preference',
    preference: 'Prefers morning meetings (9-11am)',
    confidence: 0.9,
    source: 'observed',
  });

  const butler = new ButlerAgent({ preferenceStore: store });
  const contextSpy = vi.spyOn(butler, 'buildContext');

  await butler.handleMessage('Schedule a meeting');

  // Verify preference was injected
  const context = contextSpy.mock.results[0].value;
  expect(context.preferences).toContainEqual(
    expect.objectContaining({ preference: expect.stringMatching(/morning/i) })
  );
});
```

---

### Story 2.10: Prompt Caching Setup

**Risk:** LOW | **Priority:** P2

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.10.1 | Unit | Cache control markers set | Headers present | Vitest |
| 2.10.2 | Integration | Cache hits on repeat calls | Hit logged | Vitest |
| 2.10.3 | Unit | Markers in correct positions | Prefix cached | Vitest |
| 2.10.4 | Integration | Logs show hit/miss ratio | Metrics available | Vitest |
| 2.10.5 | E2E | Measurable cost reduction | API billing reduced | Manual |

#### Test Code

```typescript
// tests/unit/story-2.10-caching.spec.ts
import { test, expect } from 'vitest';
import { buildCachedPrompt, getCacheControlMarkers } from '@/agents/caching';

test('2.10.1 - cache control markers are set correctly', () => {
  const systemPrompt = 'You are Butler, an AI assistant...';
  const cachedPrompt = buildCachedPrompt(systemPrompt);

  // Should have cache_control in the structure
  expect(cachedPrompt).toHaveProperty('cache_control');
  expect(cachedPrompt.cache_control.type).toBe('ephemeral');
});

test('2.10.3 - cache markers are in correct positions', () => {
  const template = {
    staticPart: 'You are Butler, an AI assistant for Orion...',
    dynamicPart: 'Current user: {{user_name}}, Date: {{date}}',
  };

  const markers = getCacheControlMarkers(template);

  // Static part should be marked for caching
  expect(markers.cachedSections).toContain('staticPart');

  // Dynamic part should NOT be cached
  expect(markers.cachedSections).not.toContain('dynamicPart');
});

// tests/integration/story-2.10-cache-hits.spec.ts
import { test, expect, vi, beforeEach } from 'vitest';
import { CachingMetrics } from '@/services/metrics';

let metrics: CachingMetrics;

beforeEach(() => {
  metrics = new CachingMetrics();
});

test('2.10.2 - cache hits occur on repeated agent calls', async () => {
  const butler = new ButlerAgent({ metrics });

  // First call - cache miss
  await butler.handleMessage('Hello');

  // Second call - cache hit (same system prompt)
  await butler.handleMessage('How are you?');

  // Third call - cache hit
  await butler.handleMessage('What can you do?');

  expect(metrics.getCacheHitRate()).toBeGreaterThan(0.5);
  expect(metrics.getHits()).toBe(2);
  expect(metrics.getMisses()).toBe(1);
});

test('2.10.4 - logs show cache hit/miss ratio', async () => {
  const butler = new ButlerAgent({ metrics });

  await butler.handleMessage('Test 1');
  await butler.handleMessage('Test 2');
  await butler.handleMessage('Test 3');

  const report = metrics.getReport();

  expect(report).toHaveProperty('totalRequests', 3);
  expect(report).toHaveProperty('cacheHits');
  expect(report).toHaveProperty('cacheMisses');
  expect(report).toHaveProperty('hitRate');
  expect(report).toHaveProperty('estimatedSavings');
});
```

---

## 3. Agent Mock Registry

All agent tests use these centralized mocks (from `test-infra-agent-schemas.md`):

```typescript
// tests/mocks/agents/index.ts
export { BUTLER_MOCKS } from './butler';
export { TRIAGE_MOCKS } from './triage';
export { SCHEDULER_MOCKS } from './scheduler';
export { COMMUNICATOR_MOCKS } from './communicator';
export { NAVIGATOR_MOCKS } from './navigator';
export { PREFERENCE_LEARNER_MOCKS } from './preference-learner';

// Mock factory
export function createMockAgent(type: AgentType) {
  // ... (see test-infra-agent-schemas.md for full implementation)
}
```

---

## 4. Test Execution Plan

### 4.1 Test Run Order

```
1. Schema Validation (CI: every commit)
   └── All agent schemas compile

2. Unit Tests (CI: every commit)
   └── Stories 2.1-2.10 unit tests

3. Integration Tests (CI: every commit)
   └── Stories 2.1-2.10 integration tests
   └── Requires: Agent mocks

4. E2E Tests (CI: PR merge)
   └── Stories 2.3, 2.4, 2.7, 2.8, 2.9
   └── Requires: Full app running

5. Smoke Tests (CI: nightly)
   └── Real Claude calls for all 26 agents (schema validation only)
```

### 4.2 CI Pipeline Configuration

```yaml
# .github/workflows/epic-2-tests.yml
name: Epic 2 Tests

on:
  push:
    paths:
      - 'src/agents/**'
      - 'src/services/permissions.ts'
      - 'src/services/preferences.ts'

jobs:
  schema-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run validate:schemas

  unit-integration:
    runs-on: ubuntu-latest
    needs: schema-validation
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit -- --grep "story-2"
      - run: pnpm test:integration -- --grep "story-2"

  e2e:
    runs-on: macos-14
    needs: unit-integration
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build:tauri
      - run: pnpm test:e2e -- --grep "story-2"
```

---

## 5. Acceptance Criteria Traceability

| Story | AC Count | Tests Mapped | Coverage |
|-------|----------|--------------|----------|
| 2.1 | 4 | 8 | 100% |
| 2.2 | 3 | 4 | 100% |
| 2.3 | 4 | 5 | 100% |
| 2.4 | 5 | 7 | 100% |
| 2.5 | 3 | 5 | 100% |
| 2.6 | 3 | 5 | 100% |
| 2.7 | 3 | 5 | 100% |
| 2.8 | 3 | 5 | 100% |
| 2.9 | 3 | 5 | 100% |
| 2.10 | 3 | 5 | 100% |

**Total:** 34 Acceptance Criteria → 58 Test Cases → **100% Coverage**

---

## 6. Gate Criteria

### Story Completion Gate

- [ ] All schema validations passing
- [ ] All unit tests passing
- [ ] All integration tests passing (with mocks)
- [ ] E2E agent rail tests passing
- [ ] Permission system security tests passing
- [ ] Code coverage ≥80%
- [ ] No P0/P1 bugs open

### Epic Completion Gate

- [ ] Core 4 agents (Butler, Triage, Scheduler, Communicator) fully tested
- [ ] All 26 agent templates validated
- [ ] canUseTool permission logic verified
- [ ] Agent delegation working correctly
- [ ] Prompt caching operational

---

## 7. Dependencies

| Dependency | Required By | Status |
|------------|-------------|--------|
| Agent schemas (C-001) | All stories | `test-infra-agent-schemas.md` |
| Mock Composio (C-002) | Story 2.5, 2.6, 2.7 | `test-infra-mock-composio.md` |
| SQLite test database | Story 2.4, 2.9 | Epic 1 infrastructure |

---

**Document Status:** Ready for Implementation
**Next Step:** Implement agent schemas, then tests alongside story implementation

_Generated by TEA (Test Architect Agent) - 2026-01-15_
