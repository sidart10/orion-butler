# Story 2.1: Butler Agent Core

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-1-butler-agent-core
**Priority:** P0 (Core Orchestrator)
**Risk:** HIGH

---

## Story

As a user,
I want a main orchestrator agent that understands my requests,
So that complex tasks are handled intelligently without manual coordination.

---

## Acceptance Criteria

### AC1: Intent Analysis and Delegation Decision

**Given** I send a message to Orion
**When** the Butler Agent receives it
**Then** it analyzes intent and determines if it can handle directly or needs to delegate
**And** it maintains conversation context across turns
**And** it has access to the full tool catalog

- [ ] Butler loads and uses system prompt from template
- [ ] Intent classification returns one of: `direct_answer`, `delegate_triage`, `delegate_schedule`, `delegate_draft`, `delegate_search`, `delegate_learn`, `clarify`, `cannot_help`
- [ ] Confidence score (0.0-1.0) accompanies each classification
- [ ] Conversation history is preserved across turns

### AC2: Multi-Step Task Coordination

**Given** a task requires multiple steps
**When** the Butler Agent processes it
**Then** it breaks down the task into sub-tasks
**And** it coordinates execution in logical order
**And** it synthesizes results into a coherent response

- [ ] Butler can spawn sub-agents (Triage, Scheduler, Communicator, Navigator, Preference Learner)
- [ ] Context is passed to sub-agents correctly
- [ ] Results from sub-agents are aggregated into final response
- [ ] User sees coherent, synthesized output

---

## Tasks / Subtasks

### Task 1: Create Butler Agent Class Structure (AC: #1)

- [ ] 1.1 Create `agent-server/src/agents/butler/index.ts` - main agent class
- [ ] 1.2 Create `agent-server/src/agents/butler/types.ts` - TypeScript interfaces
- [ ] 1.3 Implement `classifyIntent()` method with Claude API call
- [ ] 1.4 Implement `handleMessage()` main entry point
- [ ] 1.5 Add conversation history tracking (in-memory for session)

### Task 2: Implement Intent Classification Schema (AC: #1)

- [ ] 2.1 Create `src/agents/schemas/butler.ts` with Zod schemas:
  - `IntentClassificationSchema`
  - `ButlerResponseSchema`
- [ ] 2.2 Add schema validation to `classifyIntent()` response
- [ ] 2.3 Handle schema validation errors gracefully

### Task 3: Create Butler Prompt Template (AC: #1)

- [ ] 3.1 Create `.claude/agents/butler.md` prompt template
- [ ] 3.2 Include persona, constraints, intent classification instructions
- [ ] 3.3 Add tool catalog reference section
- [ ] 3.4 Implement variable interpolation (`{{user_name}}`, `{{current_date}}`, etc.)

### Task 4: Implement Sub-Agent Spawning (AC: #2)

- [ ] 4.1 Create `agent-server/src/agents/orchestrator.ts` for agent management
- [ ] 4.2 Implement `spawnSubAgent(agentType, context)` method
- [ ] 4.3 Add delegation context builder (`relevantEntities`, `timeConstraints`, etc.)
- [ ] 4.4 Implement result aggregation from sub-agents

### Task 5: Implement Tool Catalog Access (AC: #1)

- [ ] 5.1 Create `agent-server/src/agents/tools/catalog.ts` - tool registry
- [ ] 5.2 Define tool interfaces for all available tools
- [ ] 5.3 Wire Butler to tool catalog for capability awareness

### Task 6: Write Tests (AC: #1, #2)

- [ ] 6.1 Unit test: Prompt template loads correctly (test 2.1.1)
- [ ] 6.2 Integration test: Simple query end-to-end (test 2.1.2)
- [ ] 6.3 Integration test: Delegates to Triage for inbox (test 2.1.3)
- [ ] 6.4 Integration test: Delegates to Scheduler for calendar (test 2.1.4)
- [ ] 6.5 Unit test: Intent classification - greeting (test 2.1.5)
- [ ] 6.6 Unit test: Intent classification - triage (test 2.1.6)
- [ ] 6.7 Unit test: Intent classification - schedule (test 2.1.7)
- [ ] 6.8 E2E test: Multi-step task synthesized (test 2.1.8)

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

From architecture.md sections 6.1-6.4:

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

**Agent Lifecycle States (src/agents/lifecycle.ts):**
```typescript
export enum AgentState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING_CONTEXT = 'loading_context',
  PROCESSING = 'processing',
  WAITING_FOR_TOOL = 'waiting_for_tool',
  WAITING_FOR_USER = 'waiting_for_user',
  DELEGATING = 'delegating',
  COMPLETING = 'completing',
  ERROR = 'error',
}
```

**AgentContext Interface (REQUIRED):**
```typescript
export interface AgentContext {
  sessionId: string;
  userId: string;
  activeProject?: Project;
  relevantContacts?: Contact[];
  userPreferences?: Preference[];
  recentContext?: Message[];
  currentState: AgentState;
}
```

### File Structure Requirements

Create files in these locations:

```
agent-server/
  src/
    agents/
      butler/
        index.ts           # Main Butler agent class
        types.ts           # TypeScript interfaces
        prompts.ts         # Prompt template loading
      orchestrator.ts      # Agent spawning/coordination
      lifecycle.ts         # AgentState enum, AgentContext
      tools/
        catalog.ts         # Tool registry
src/
  agents/
    schemas/
      butler.ts            # Zod schemas (IntentClassificationSchema, ButlerResponseSchema)
      index.ts             # Schema exports
.claude/
  agents/
    butler.md              # Butler prompt template
tests/
  unit/
    story-2.1-butler-agent.spec.ts
  integration/
    story-2.1-butler-delegation.spec.ts
  mocks/
    agents/
      butler.ts            # Mock responses
```

### Claude API Integration

**Use Claude Agent SDK pattern:**
```typescript
import { ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';

export const agentConfig: ClaudeAgentOptions = {
  model: 'claude-sonnet-4-5',
  // ... tools
};
```

**Prompt Caching (IMPORTANT for cost):**
From architecture.md section 6.7:
```typescript
system: [
  {
    type: 'text',
    text: BUTLER_SYSTEM_PROMPT,  // ~2000 tokens
    cache_control: { type: 'ephemeral' },  // Cache for 5 min
  },
]
```
- Minimum cacheable: 1,024 tokens
- Static prompts should have `cache_control` marker
- DO NOT cache dynamic content (user context, recent messages)

### Zod Schema Implementation

**IntentClassificationSchema (from test-infra-agent-schemas.md):**
```typescript
import { z } from 'zod';

export const IntentClassificationSchema = z.object({
  intent: z.enum([
    'direct_answer',
    'delegate_triage',
    'delegate_schedule',
    'delegate_draft',
    'delegate_search',
    'delegate_learn',
    'clarify',
    'cannot_help'
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
  response: z.string().optional(),
  delegatedAgent: z.string().optional(),
  followUpQuestions: z.array(z.string()).optional()
});
```

### Test Mock Structure

**Required mock scenarios (from test-design-epic-2.md):**
```typescript
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

### API Endpoints

Butler agent is accessed via:
- Agent Server: `localhost:3001`
- Streaming endpoint: `GET /api/stream/:streamId?prompt=...&sessionId=...`
- Response format: Server-Sent Events (SSE)

### Critical Design Constraints

1. **No auto-execution of write/destructive tools** - Butler must delegate to permission system (Story 2.4)
2. **Maintain conversation history** - Required for multi-turn interactions
3. **Schema validation on all outputs** - Use Zod `.safeParse()` to handle malformed responses
4. **Graceful degradation** - If Claude fails, return error state, don't crash

---

## Project Structure Notes

**Alignment with unified project structure:**
- Agent code lives in `agent-server/src/agents/`
- Schemas shared between frontend and agent-server in `src/agents/schemas/`
- Prompt templates in `.claude/agents/`
- Tests follow naming convention `story-X.X-*.spec.ts`

**No conflicts detected with existing structure.**

---

## Test Considerations

### Test Strategy (from test-design-epic-2.md)

| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.1.1 | Unit | Prompt template loads | Valid template object |
| 2.1.2 | Integration | Simple query end-to-end | Response returned |
| 2.1.3 | Integration | Delegates to Triage for inbox | Triage agent spawned |
| 2.1.4 | Integration | Delegates to Scheduler for calendar | Scheduler agent spawned |
| 2.1.5 | Unit | Intent classification - greeting | `direct_answer` intent |
| 2.1.6 | Unit | Intent classification - triage | `delegate_triage` intent |
| 2.1.7 | Unit | Intent classification - schedule | `delegate_schedule` intent |
| 2.1.8 | E2E | Multi-step task synthesized | Coherent final response |

### Mock Strategy (C-001 Mitigation)

- **All Claude responses MOCKED** in unit/integration tests
- Use `BUTLER_MOCKS` from `tests/mocks/agents/butler.ts`
- Real Claude calls only in smoke tests (skipped by default)
- Schema validation ensures mock fidelity

### Test File Locations

```
tests/
  unit/
    story-2.1-butler-agent.spec.ts      # Tests 2.1.1, 2.1.5, 2.1.6, 2.1.7
  integration/
    story-2.1-butler-delegation.spec.ts # Tests 2.1.2, 2.1.3, 2.1.4
  e2e/
    story-2.1-multi-step.spec.ts        # Test 2.1.8
  mocks/
    agents/
      butler.ts                          # BUTLER_MOCKS
```

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 1-5 (Agent Server Process)** - Provides the Node.js server where Butler runs
- **Story 1-7 (Claude Integration)** - Provides Claude API client setup
- **Test Infrastructure (C-001)** - Agent schemas must exist before tests can be written

### Downstream Dependencies (blocked by this story)

- **Story 2.2 (Agent Prompt Templates)** - Will use Butler template as reference
- **Story 2.3 (Sub-Agent Spawning)** - Depends on Butler's delegation mechanism
- **Story 2.5-2.9 (Specialist Agents)** - All spawned by Butler

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#6-agent-architecture] - Agent hierarchy, lifecycle, context
- [Source: thoughts/planning-artifacts/architecture.md#6.7-prompt-caching] - Cost optimization patterns
- [Source: thoughts/planning-artifacts/test-infra-agent-schemas.md#2.1-butler-agent] - Zod schemas and mock structure
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.1] - Test scenarios and code examples
- [Source: thoughts/planning-artifacts/epics.md#story-2.1] - User story and acceptance criteria

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
