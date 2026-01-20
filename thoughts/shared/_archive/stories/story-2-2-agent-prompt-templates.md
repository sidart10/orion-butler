# Story 2.2: Agent Prompt Templates

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-2-agent-prompt-templates
**Priority:** P0 (Infrastructure)
**Risk:** LOW

---

## Story

As a developer,
I want standardized prompt templates for each agent type,
So that agent behavior is consistent and maintainable.

---

## Acceptance Criteria

### AC1: Template Loading Infrastructure

**Given** an agent is initialized
**When** it loads its configuration
**Then** it uses the prompt template from the templates directory
**And** templates support variable interpolation (user name, context, etc.)
**And** templates include system instructions, persona, and constraints

- [ ] Each agent can load its template via `loadAgentTemplate(agentName)`
- [ ] Templates are stored as `.md` files in `.claude/agents/`
- [ ] Variable interpolation supports `{{user_name}}`, `{{current_date}}`, `{{timezone}}`, `{{context}}`
- [ ] Template loading errors are handled gracefully with clear error messages

### AC2: Template Structure and Validation

**Given** 31 agents are available (6 Orion-specific + 25 reusable/adapted)
**When** templates are validated
**Then** each has: name, description, system prompt, tools list
**And** the 6 core Orion agents have detailed prompts (> 1000 chars)

**Agent Inventory (31 total):**

**Orion-Specific Agents (6) - Core butler system:**
| Agent | Purpose | Model | Status |
|-------|---------|-------|--------|
| butler | Main orchestrator for Orion | opus | ✓ Exists (needs frontmatter) |
| triage | Inbox processing & priority scoring | sonnet | ✓ Exists (needs frontmatter) |
| scheduler | Calendar management | opus | NEW |
| communicator | Email/message drafting | sonnet | NEW |
| navigator | PARA search (adapt from scout) | sonnet | NEW |
| preference_learner | Pattern detection & learning | sonnet | NEW |

**Reusable Agents (6) - Use as-is from CC v3:**
| Agent | Orion Purpose | Model |
|-------|---------------|-------|
| oracle | Web research for contacts, topics, decisions | opus |
| maestro | Multi-agent coordination | opus |
| scribe | Handoffs, state preservation | sonnet |
| memory-extractor | Learn from user interactions | sonnet |
| chronicler | Session analysis, precedent lookup | opus |
| context-query-agent | RAG queries against PARA data | sonnet |

**Adaptable Agents (14) - Keep with prompt modifications:**
| Agent | Orion Adaptation | Model |
|-------|------------------|-------|
| scout → navigator source | Search PARA instead of codebase | sonnet |
| architect → planner | Plan personal workflows | opus |
| sleuth → troubleshooter | "Why didn't my reminder fire?" | opus |
| spark → quick-fixer | Small adjustments, preferences | sonnet |
| critic → reviewer | Review draft emails, plans | sonnet |
| herald → reporter | Weekly summaries, reports | sonnet |
| profiler → efficiency-analyzer | "Where does my time go?" | opus |
| plan-agent | Create task/workflow plans | opus |
| review-agent | Compare plan vs actual | opus |
| validate-agent | Validate approaches | sonnet |
| debug-agent | Investigate workflow issues | opus |
| onboard | Analyze new data sources | sonnet |
| pathfinder | Research external services | sonnet |
| phoenix | Workflow refactoring | opus |

**Optional Agents (5) - Available but not core:**
| Agent | Use Case | Model |
|-------|----------|-------|
| aegis | Security/privacy review | opus |
| arbiter | Validate automation rules | opus |
| atlas | E2E testing of integrations | opus |
| kraken | Complex multi-step implementations | opus |
| liaison | API integration review | sonnet |

**NOT IN SCOPE (removed from Orion):**
- BMAD agents (analyst, dev, pm, sm, tea, tech-writer, ux-designer, quick-flow-solo-dev) - different workflow methodology
- Code-only agents (braintrust-analyst, research-codebase, session-analyst, surveyor, judge) - CC-specific

- [ ] All 6 Orion-specific agent templates created/verified with prompts > 1000 characters
- [ ] butler.md and triage.md have proper YAML frontmatter (name, model fields)
- [ ] 25 reusable/adaptable agents load correctly from `.claude/agents/`
- [ ] Zod schema validation confirms template structure at runtime
- [ ] Each template includes: persona section, constraints section, tool usage instructions

---

## Tasks / Subtasks

### Task 1: Create Template Loading Infrastructure (AC: #1)

- [ ] 1.1 Create `agent-server/src/agents/templates/index.ts` - template loading utilities
- [ ] 1.2 Create `agent-server/src/agents/templates/types.ts` - TypeScript interfaces
- [ ] 1.3 Implement `loadAgentTemplate(agentName: string): Promise<AgentTemplate>`
- [ ] 1.4 Implement `interpolateTemplate(template: string, vars: Record<string, string>): string`
- [ ] 1.5 Add error handling with descriptive messages for missing templates

### Task 2: Create Zod Schema for Template Validation (AC: #2)

- [ ] 2.1 Create `src/agents/schemas/template.ts` with `AgentTemplateSchema`:
```typescript
const AgentTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string().min(100),
  tools: z.array(z.string()),
  persona: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  model: z.enum(['opus', 'sonnet']).optional(),  // Note: haiku not used in Orion
});
```
- [ ] 2.2 Add validation in `loadAgentTemplate()` using `AgentTemplateSchema.safeParse()`
- [ ] 2.3 Export TypeScript types: `AgentTemplate`, `AgentTemplateParsed`

### Task 3: Create/Verify 6 Orion-Specific Agent Templates (AC: #2)

- [ ] 3.1 Fix `.claude/agents/butler.md` frontmatter (EXISTS - 213 lines):
  - Add YAML frontmatter: `name: butler`, `model: opus`
  - Verify: Intent classification, delegation logic, tool catalog (already present)

- [ ] 3.2 Fix `.claude/agents/triage.md` frontmatter (EXISTS - 197 lines):
  - Add YAML frontmatter: `name: triage`, `model: sonnet`
  - Verify: Priority scoring, action extraction, filing logic (already present)

- [ ] 3.3 Create `.claude/agents/scheduler.md` - Scheduler agent template (NEW):
  - Availability checking instructions
  - Conflict detection logic
  - User preference consideration
  - Extended thinking activation criteria
  - Time slot scoring algorithm

- [ ] 3.4 Create `.claude/agents/communicator.md` - Communicator agent template (NEW):
  - Tone matching instructions
  - Relationship-based formality
  - **CRITICAL: NEVER auto-send constraint**
  - Draft review requirement
  - Learning from user edits

- [ ] 3.5 Create `.claude/agents/navigator.md` - PARA search agent (NEW):
  - Adapt from scout.md patterns
  - PARA system awareness (Projects, Areas, Resources, Archive)
  - Semantic search instructions
  - Context relevance scoring

- [ ] 3.6 Create `.claude/agents/preference_learner.md` - Pattern detection agent (NEW):
  - Pattern recognition instructions
  - Learning from corrections
  - Confidence thresholds for suggestions

### Task 4: Create Agent Constants (AC: #2)

- [ ] 4.1 Create `agent-server/src/agents/constants.ts`:
```typescript
// Orion Agent System - 31 agents total
// 6 Orion-specific + 6 reusable + 14 adaptable + 5 optional

// Orion-specific agents (6) - Core butler system
export const ORION_CORE_AGENTS = [
  'butler',              // Main orchestrator
  'triage',              // Inbox processing
  'scheduler',           // Calendar management
  'communicator',        // Email/message drafting
  'navigator',           // PARA search (adapted from scout)
  'preference_learner',  // Pattern detection
] as const;

// Reusable agents (6) - Use as-is from CC v3
export const REUSABLE_AGENTS = [
  'oracle',              // Web research
  'maestro',             // Multi-agent coordination
  'scribe',              // Handoffs, state preservation
  'memory-extractor',    // Learn from interactions
  'chronicler',          // Session analysis
  'context-query-agent', // RAG queries
] as const;

// Adaptable agents (14) - Keep with Orion-specific prompt modifications
export const ADAPTABLE_AGENTS = [
  'scout',               // Source for navigator
  'architect',           // → planner for workflows
  'sleuth',              // → troubleshooter
  'spark',               // → quick-fixer
  'critic',              // → reviewer for emails/plans
  'herald',              // → reporter for summaries
  'profiler',            // → efficiency-analyzer
  'plan-agent',          // Task/workflow plans
  'review-agent',        // Plan vs actual
  'validate-agent',      // Validate approaches
  'debug-agent',         // Workflow issues
  'onboard',             // Analyze new data sources
  'pathfinder',          // Research external services
  'phoenix',             // Workflow refactoring
] as const;

// Optional agents (5) - Available but not core
export const OPTIONAL_AGENTS = [
  'aegis',               // Security/privacy review
  'arbiter',             // Validate automation rules
  'atlas',               // E2E testing
  'kraken',              // Complex implementations
  'liaison',             // API integration review
] as const;

// All available agents for Orion
export const ALL_AGENTS = [
  ...ORION_CORE_AGENTS,
  ...REUSABLE_AGENTS,
  ...ADAPTABLE_AGENTS,
  ...OPTIONAL_AGENTS,
] as const;
export type AgentName = typeof ALL_AGENTS[number];

// Agents that Butler can delegate TO (subset of ORION_CORE_AGENTS, excludes butler itself)
// Used by Story 2.3 for delegation schemas
export const DELEGATABLE_AGENTS = [
  'triage',
  'scheduler',
  'communicator',
  'navigator',
  'preference_learner',
] as const;
export type DelegatableAgent = typeof DELEGATABLE_AGENTS[number];

// Agent model preferences
export const AGENT_MODELS: Record<AgentName, 'opus' | 'sonnet'> = {
  // Opus agents (complex reasoning)
  butler: 'opus',
  scheduler: 'opus',
  maestro: 'opus',
  architect: 'opus',
  phoenix: 'opus',
  sleuth: 'opus',
  profiler: 'opus',
  'plan-agent': 'opus',
  'review-agent': 'opus',
  'debug-agent': 'opus',
  chronicler: 'opus',
  oracle: 'opus',
  aegis: 'opus',
  arbiter: 'opus',
  atlas: 'opus',
  kraken: 'opus',
  // Sonnet agents (fast, accurate)
  triage: 'sonnet',
  communicator: 'sonnet',
  navigator: 'sonnet',
  preference_learner: 'sonnet',
  scout: 'sonnet',
  spark: 'sonnet',
  critic: 'sonnet',
  herald: 'sonnet',
  scribe: 'sonnet',
  'memory-extractor': 'sonnet',
  'context-query-agent': 'sonnet',
  'validate-agent': 'sonnet',
  onboard: 'sonnet',
  pathfinder: 'sonnet',
  liaison: 'sonnet',
};
```
- [ ] 4.2 Verify `ALL_AGENTS.length === 31`

### Task 5: Write Tests (AC: #1, #2)

- [ ] 5.1 Unit test: Template loading works for all 31 agents
- [ ] 5.2 Unit test: Variable interpolation works
- [ ] 5.3 Unit test: 6 Orion core agents have prompts > 1000 chars
- [ ] 5.4 Unit test: Schema validation catches malformed templates
- [ ] 5.5 Integration test: Agent loads and uses correct template at runtime

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Orion Agent System (31 agents total):**

```
ORION CORE (6)                    REUSABLE AS-IS (6)
+------------------+              +------------------+
| butler (opus)    |              | oracle (opus)    |
| ├── triage       |              | maestro (opus)   |
| ├── scheduler    |              | scribe (sonnet)  |
| ├── communicator |              | memory-extractor |
| ├── navigator    |              | chronicler       |
| └── pref_learner |              | context-query    |
+------------------+              +------------------+

ADAPTABLE (14)                    OPTIONAL (5)
+------------------+              +------------------+
| scout → navigator|              | aegis (security) |
| architect → plan |              | arbiter (rules)  |
| sleuth → trouble |              | atlas (E2E)      |
| spark → quickfix |              | kraken (complex) |
| critic → review  |              | liaison (API)    |
| herald → report  |              +------------------+
| profiler → effic |
| plan-agent       |
| review-agent     |
| validate-agent   |
| debug-agent      |
| onboard          |
| pathfinder       |
| phoenix          |
+------------------+
```

**NOT IN SCOPE (removed):**
- BMAD agents (analyst, dev, pm, sm, tea, tech-writer, ux-designer, quick-flow-solo-dev)
- Code-only agents (braintrust-analyst, research-codebase, session-analyst, surveyor, judge)

**Orion-Specific Agents (6 core):**
```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (Inbox processing)
    +-- Scheduler Agent (Calendar management)
    +-- Communicator Agent (Email/message drafting)
    +-- Navigator Agent (PARA search)
    +-- Preference Learner Agent (Pattern detection)
```

### Template File Location

Templates are markdown files stored in `.claude/agents/`. Each agent loads its template by name.

### Template Structure (Required Sections)

```markdown
# Agent Name

## Description
Brief description of the agent's purpose.

## System Prompt
You are [Agent Name], a specialized AI assistant for [domain]...

### Persona
[Who the agent is, voice, style]

### Constraints
- [What the agent must/must not do]

### Instructions
[How the agent should approach tasks]

## Tools
- tool_name_1
- tool_name_2

## Model
opus | sonnet | haiku
```

### File Structure Requirements

```
.claude/
  agents/
    # Orion Core (6) - fix frontmatter or create
    butler.md              # EXISTS - add frontmatter
    triage.md              # EXISTS - add frontmatter
    scheduler.md           # NEW - detailed template
    communicator.md        # NEW - detailed template
    navigator.md           # NEW - detailed template (adapt from scout.md)
    preference_learner.md  # NEW - detailed template

    # Reusable (6) - already exist, use as-is
    oracle.md, maestro.md, scribe.md, memory-extractor.md,
    chronicler.md, context-query-agent.md

    # Adaptable (14) - already exist, may need Orion prompts later
    scout.md, architect.md, sleuth.md, spark.md, critic.md,
    herald.md, profiler.md, plan-agent.md, review-agent.md,
    validate-agent.md, debug-agent.md, onboard.md, pathfinder.md, phoenix.md

    # Optional (5) - already exist
    aegis.md, arbiter.md, atlas.md, kraken.md, liaison.md

agent-server/
  src/
    agents/
      templates/
        index.ts           # loadAgentTemplate(), interpolateTemplate()
        types.ts           # TypeScript interfaces
      constants.ts         # ORION_CORE_AGENTS, REUSABLE_AGENTS, etc.

src/
  agents/
    schemas/
      template.ts          # AgentTemplateSchema (Zod)
      index.ts             # Re-export

tests/
  unit/
    story-2.2-templates.spec.ts
  integration/
    story-2.2-template-loading.spec.ts
```

### Variable Interpolation

Templates support these variables:
- `{{user_name}}` - Current user's name (from config)
- `{{current_date}}` - Today's date (ISO format)
- `{{timezone}}` - User's timezone
- `{{context}}` - Recent conversation context

### Prompt Caching

From architecture.md section 6.7:
```typescript
system: [
  {
    type: 'text',
    text: AGENT_SYSTEM_PROMPT,  // ~2000 tokens
    cache_control: { type: 'ephemeral' },  // Cache for 5 min
  },
]
```
- Minimum cacheable: 1,024 tokens
- Static prompts should have `cache_control` marker
- DO NOT cache dynamic content (user context, recent messages)

### Critical Design Constraints

1. **Templates are markdown files** - Human-readable, version-controlled
2. **6 Orion core agents need detailed prompts** - > 1000 characters each
3. **butler.md and triage.md exist but need frontmatter** - Add `name:` and `model:` fields
4. **25 additional agents are inherited** - 6 reusable + 14 adaptable + 5 optional
5. **BMAD agents NOT in scope** - Different workflow methodology
6. **Schema validation is mandatory** - Catch malformed templates early
7. **Variable interpolation is lazy** - Missing variables stay as placeholders

---

## Test Considerations

### Test Strategy

| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.2.1 | Unit | All 31 agent templates parse | No parse errors |
| 2.2.2 | Unit | Variable interpolation works | Variables replaced |
| 2.2.3 | Unit | 6 Orion core agents have complete prompts | All fields present, prompts > 1000 chars |
| 2.2.4 | Unit | butler.md and triage.md have valid frontmatter | name and model fields present |
| 2.2.5 | Integration | Agent uses template at runtime | Correct prompt sent to Claude |

### Test Code Examples

```typescript
// tests/unit/story-2.2-templates.spec.ts
import { test, expect, describe } from 'vitest';
import { loadAgentTemplate, interpolateTemplate } from '@/agents/templates';
import { ALL_AGENTS, ORION_CORE_AGENTS } from '@/agents/constants';
import { AgentTemplateSchema } from '@/agents/schemas/template';

describe('Story 2.2: Agent Prompt Templates', () => {

  test('2.2.1 - all 31 agent templates load without errors', async () => {
    const errors: string[] = [];

    for (const agentName of ALL_AGENTS) {
      try {
        const template = await loadAgentTemplate(agentName);
        AgentTemplateSchema.parse(template);
      } catch (e: any) {
        errors.push(`${agentName}: ${e.message}`);
      }
    }

    expect(errors).toHaveLength(0);
    expect(ALL_AGENTS.length).toBe(31);
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
  });

  test.each([...ORION_CORE_AGENTS])('2.2.3 - %s has complete prompt (>1000 chars)', async (agentName) => {
    const template = await loadAgentTemplate(agentName);

    expect(template.name).toBeTruthy();
    expect(template.description).toBeTruthy();
    expect(template.systemPrompt).toBeTruthy();
    expect(template.systemPrompt.length).toBeGreaterThan(1000);
  });

  test('2.2.4 - butler and triage have valid frontmatter', async () => {
    const butler = await loadAgentTemplate('butler');
    const triage = await loadAgentTemplate('triage');

    expect(butler.name).toBe('butler');
    expect(butler.model).toBe('opus');
    expect(triage.name).toBe('triage');
    expect(triage.model).toBe('sonnet');
  });

});
```

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2-1 (Butler Agent Core)** - Provides `.claude/agents/butler.md` template as reference

### Downstream Dependencies (blocked by this story)

- **Story 2.2b (CC v3 Hooks Integration)** - Uses template loading infrastructure
- **Story 2.3 (Sub-Agent Spawning)** - Needs templates for all agents to spawn
- **Story 2.5-2.9 (Specialist Agents)** - Each uses their respective template

---

## References

- [Source: thoughts/research/agents-analysis.md] - Agent inventory analysis (6 reuse, 14 adapt, 5 optional)
- [Source: thoughts/planning-artifacts/architecture.md#6.1-agent-hierarchy] - Orion agent hierarchy
- [Source: thoughts/planning-artifacts/architecture.md#6.7-prompt-caching] - Cache control patterns
- [Source: thoughts/planning-artifacts/epics.md#story-2.2] - User story definition

## Agent Adaptation Reference

When adapting agents for Orion, use these patterns:

| CC v3 Agent | Orion Name | Key Changes |
|-------------|------------|-------------|
| scout | navigator | "codebase" → "PARA files, emails, contacts" |
| architect | planner | Remove code refs, add calendar/email planning |
| sleuth | troubleshooter | Git/logs → workflow logs |
| profiler | efficiency-analyzer | CPU/memory → time/activity patterns |
| herald | reporter | Release notes → weekly summaries |
| critic | reviewer | Code review → email/plan review |

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
