# ATDD Checklist: Story 2a.2 - Agent Prompt Templates

**Story:** 2a-2-agent-prompt-templates
**Epic:** 2a - Core Agent Infrastructure
**Status:** Ready for Development
**Risk Level:** LOW
**Created:** 2026-01-16
**Author:** TEA (Test Architect Agent)

---

## Summary

This ATDD checklist covers the implementation of standardized prompt templates for all 26 Orion agents (per adversarial review). The story establishes template loading infrastructure, variable interpolation, schema validation, and creation of 6 core Orion-specific agent templates.

**Test Counts:**
| Level | Count | Coverage |
|-------|-------|----------|
| Unit | 24 | Template loading, validation, interpolation |
| Integration | 6 | Runtime template usage, agent initialization |
| **Total** | **30** | All acceptance criteria covered |

---

## AC1: Template Loading Infrastructure

**Given** an agent is initialized
**When** it loads its configuration
**Then** it uses the prompt template from the templates directory
**And** templates support variable interpolation (user name, context, etc.)
**And** templates include system instructions, persona, and constraints

### Happy Path Tests

- [ ] **Test 2.2.1.1**: `loadAgentTemplate('butler')` returns valid template object
  - **Given**: butler.md exists in `.claude/agents/`
  - **When**: `loadAgentTemplate('butler')` is called
  - **Then**: Returns object with `name`, `description`, `systemPrompt`, `tools`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.2**: All 26 agent templates load without errors
  - **Given**: All agent template files exist in `.claude/agents/`
  - **When**: `loadAgentTemplate(name)` is called for each agent in `ALL_AGENTS`
  - **Then**: All 26 templates load successfully without throwing
  - **And**: `ALL_AGENTS.length === 26`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.3**: Variable interpolation replaces `{{user_name}}`
  - **Given**: A template with `{{user_name}}` placeholder
  - **When**: `interpolateTemplate(template, { user_name: 'Sid' })` is called
  - **Then**: Output contains 'Sid' and does not contain '{{user_name}}'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.4**: Variable interpolation replaces `{{current_date}}`
  - **Given**: A template with `{{current_date}}` placeholder
  - **When**: `interpolateTemplate(template, { current_date: '2026-01-16' })` is called
  - **Then**: Output contains '2026-01-16' and does not contain '{{current_date}}'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.5**: Variable interpolation replaces `{{timezone}}`
  - **Given**: A template with `{{timezone}}` placeholder
  - **When**: `interpolateTemplate(template, { timezone: 'America/Los_Angeles' })` is called
  - **Then**: Output contains 'America/Los_Angeles'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.6**: Variable interpolation replaces `{{context}}`
  - **Given**: A template with `{{context}}` placeholder
  - **When**: `interpolateTemplate(template, { context: 'User is scheduling a meeting' })` is called
  - **Then**: Output contains 'User is scheduling a meeting'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.7**: Multiple variables interpolated in single pass
  - **Given**: A template with `{{user_name}}`, `{{current_date}}`, and `{{timezone}}`
  - **When**: `interpolateTemplate(template, { user_name: 'Sid', current_date: '2026-01-16', timezone: 'PST' })` is called
  - **Then**: All three variables are replaced correctly
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.8**: `loadAgentTemplate` and `interpolateTemplate` exported from index
  - **Given**: Template module exists
  - **When**: Importing from `agent-server/src/agents/templates`
  - **Then**: Both functions are importable without error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

### Edge Cases

- [ ] **Test 2.2.1.9**: Missing variable left as placeholder (no crash)
  - **Given**: A template with `{{unknown_var}}`
  - **When**: `interpolateTemplate(template, {})` is called
  - **Then**: Output contains `{{unknown_var}}` unchanged (lazy interpolation)
  - **And**: Does not throw error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.10**: Empty variables object handled gracefully
  - **Given**: A template with multiple placeholders
  - **When**: `interpolateTemplate(template, {})` is called
  - **Then**: Returns template with placeholders intact
  - **And**: Does not throw error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.11**: Template with no variables passes through unchanged
  - **Given**: A template with no `{{...}}` placeholders
  - **When**: `interpolateTemplate(template, { user_name: 'Sid' })` is called
  - **Then**: Returns original template unchanged
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.12**: Variable values with special characters handled
  - **Given**: Variable value contains `$`, `\`, or regex special chars
  - **When**: `interpolateTemplate(template, { user_name: '$pecial\\User' })` is called
  - **Then**: Value inserted correctly without regex issues
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

### Error Handling

- [ ] **Test 2.2.1.13**: Missing template file returns descriptive error
  - **Given**: Agent name 'nonexistent_agent' has no template file
  - **When**: `loadAgentTemplate('nonexistent_agent')` is called
  - **Then**: Throws error with message containing 'nonexistent_agent' and 'not found'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.14**: Malformed markdown template returns parse error
  - **Given**: A template file with invalid YAML frontmatter
  - **When**: `loadAgentTemplate('malformed_agent')` is called
  - **Then**: Throws error with message indicating parse failure
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.1.15**: Template loading timeout handled gracefully
  - **Given**: File system is extremely slow (mocked)
  - **When**: `loadAgentTemplate('slow_agent')` times out
  - **Then**: Throws timeout error (not hang indefinitely)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

---

## AC2: Template Structure and Validation

**Given** 26 agents are available (6 Orion-specific + 20 reusable/adapted)
**When** templates are validated
**Then** each has: name, description, system prompt, tools list
**And** the 6 core Orion agents have detailed prompts (> 1000 chars)

### Happy Path Tests

- [ ] **Test 2.2.2.1**: Butler template has prompt > 1000 characters
  - **Given**: butler.md template exists
  - **When**: `loadAgentTemplate('butler')` is called
  - **Then**: `template.systemPrompt.length > 1000`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.2.2**: Triage template has prompt > 1000 characters
  - **Given**: triage.md template exists
  - **When**: `loadAgentTemplate('triage')` is called
  - **Then**: `template.systemPrompt.length > 1000`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.2.3**: Scheduler template has prompt > 1000 characters
  - **Given**: scheduler.md template exists
  - **When**: `loadAgentTemplate('scheduler')` is called
  - **Then**: `template.systemPrompt.length > 1000`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.2.4**: Communicator template has prompt > 1000 characters
  - **Given**: communicator.md template exists
  - **When**: `loadAgentTemplate('communicator')` is called
  - **Then**: `template.systemPrompt.length > 1000`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.2.5**: Navigator template has prompt > 1000 characters
  - **Given**: navigator.md template exists
  - **When**: `loadAgentTemplate('navigator')` is called
  - **Then**: `template.systemPrompt.length > 1000`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.2.6**: Preference_learner template has prompt > 1000 characters
  - **Given**: preference_learner.md template exists
  - **When**: `loadAgentTemplate('preference_learner')` is called
  - **Then**: `template.systemPrompt.length > 1000`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.2.7**: Butler template has valid YAML frontmatter with name and model
  - **Given**: butler.md template exists with frontmatter
  - **When**: `loadAgentTemplate('butler')` is called
  - **Then**: `template.name === 'butler'` and `template.model === 'opus'`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

- [ ] **Test 2.2.2.8**: Triage template has valid YAML frontmatter with name and model
  - **Given**: triage.md template exists with frontmatter
  - **When**: `loadAgentTemplate('triage')` is called
  - **Then**: `template.name === 'triage'` and `template.model === 'sonnet'`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-templates.spec.ts`

### Schema Validation Tests

- [ ] **Test 2.2.2.9**: `AgentTemplateSchema` validates complete template
  - **Given**: A well-formed template object with all fields
  - **When**: `AgentTemplateSchema.parse(template)` is called
  - **Then**: Returns parsed object without errors
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-schema.spec.ts`

- [ ] **Test 2.2.2.10**: `AgentTemplateSchema` rejects missing `name` field
  - **Given**: A template object without `name`
  - **When**: `AgentTemplateSchema.safeParse(template)` is called
  - **Then**: Returns `{ success: false }` with error mentioning 'name'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-schema.spec.ts`

- [ ] **Test 2.2.2.11**: `AgentTemplateSchema` rejects systemPrompt < 100 chars
  - **Given**: A template with `systemPrompt` of only 50 characters
  - **When**: `AgentTemplateSchema.safeParse(template)` is called
  - **Then**: Returns `{ success: false }` with minimum length error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-schema.spec.ts`

- [ ] **Test 2.2.2.12**: `AgentTemplateSchema` accepts optional `persona` field
  - **Given**: A template without `persona` field
  - **When**: `AgentTemplateSchema.safeParse(template)` is called
  - **Then**: Returns `{ success: true }` (field is optional)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-schema.spec.ts`

- [ ] **Test 2.2.2.13**: `AgentTemplateSchema` validates `model` enum
  - **Given**: A template with `model: 'invalid_model'`
  - **When**: `AgentTemplateSchema.safeParse(template)` is called
  - **Then**: Returns `{ success: false }` with enum error
  - **And**: Valid values are 'opus' and 'sonnet'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-schema.spec.ts`

- [ ] **Test 2.2.2.14**: `AgentTemplateSchema` exported from schemas module
  - **Given**: Schema module exists
  - **When**: Importing `AgentTemplateSchema` from `src/agents/schemas/template`
  - **Then**: Import succeeds without error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-schema.spec.ts`

### Agent Constants Tests

- [ ] **Test 2.2.2.15**: `ALL_AGENTS` constant contains exactly 26 agents
  - **Given**: Constants module is loaded
  - **When**: Checking `ALL_AGENTS.length`
  - **Then**: Returns 26
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-constants.spec.ts`

- [ ] **Test 2.2.2.16**: `ORION_CORE_AGENTS` contains 6 core agents
  - **Given**: Constants module is loaded
  - **When**: Checking `ORION_CORE_AGENTS`
  - **Then**: Contains: butler, triage, scheduler, communicator, navigator, preference_learner
  - **And**: Length is 6
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-constants.spec.ts`

- [ ] **Test 2.2.2.17**: `DELEGATABLE_AGENTS` excludes butler
  - **Given**: Constants module is loaded
  - **When**: Checking `DELEGATABLE_AGENTS`
  - **Then**: Contains 5 agents (all ORION_CORE except butler)
  - **And**: Does NOT contain 'butler'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-constants.spec.ts`

- [ ] **Test 2.2.2.18**: `AGENT_MODELS` maps all agents to opus or sonnet
  - **Given**: `AGENT_MODELS` record is loaded
  - **When**: Iterating over `ALL_AGENTS`
  - **Then**: Each agent has a mapping in `AGENT_MODELS`
  - **And**: Values are either 'opus' or 'sonnet'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-constants.spec.ts`

- [ ] **Test 2.2.2.19**: Constants exported from `agent-server/src/agents/constants.ts`
  - **Given**: Constants module exists
  - **When**: Importing `ALL_AGENTS`, `ORION_CORE_AGENTS`, `AGENT_MODELS`
  - **Then**: All imports succeed without error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.2-constants.spec.ts`

---

## Integration Tests

### Runtime Template Usage

- [ ] **Test 2.2.I1**: Butler agent loads and uses correct template at runtime
  - **Given**: Butler agent is initialized
  - **When**: Agent builds its Claude API request
  - **Then**: System prompt matches butler.md template content
  - **And**: Variables are interpolated with runtime values
  - **Type**: Integration
  - **File**: `tests/integration/story-2.2-template-loading.spec.ts`

- [ ] **Test 2.2.I2**: All 26 agents load templates successfully
  - **Given**: All 26 agents are initialized in sequence
  - **When**: Each loads its template
  - **Then**: All templates load without errors
  - **And**: Each has systemPrompt > 100 chars (6 core > 1000 chars)
  - **Type**: Integration
  - **File**: `tests/integration/story-2.2-template-loading.spec.ts`

- [ ] **Test 2.2.I3**: Template validation runs during agent initialization
  - **Given**: An agent with invalid template (mocked)
  - **When**: Agent initializes
  - **Then**: Initialization fails with schema validation error
  - **And**: Error is logged for debugging
  - **Type**: Integration
  - **File**: `tests/integration/story-2.2-template-loading.spec.ts`

- [ ] **Test 2.2.I4**: Template loading is cached for performance
  - **Given**: Multiple agents load same template
  - **When**: `loadAgentTemplate('butler')` called twice
  - **Then**: File is read only once (cached)
  - **Type**: Integration
  - **File**: `tests/integration/story-2.2-template-loading.spec.ts`

- [ ] **Test 2.2.I5**: Reusable agents (oracle, maestro, etc.) load from CC v3 templates
  - **Given**: Oracle agent is initialized
  - **When**: Template is loaded
  - **Then**: Uses existing `.claude/agents/oracle.md`
  - **And**: Template is valid per schema
  - **Type**: Integration
  - **File**: `tests/integration/story-2.2-template-loading.spec.ts`

- [ ] **Test 2.2.I6**: Template changes picked up on agent restart (dev mode)
  - **Given**: Development mode is active
  - **When**: Template file is modified and agent restarted
  - **Then**: New template content is used
  - **And**: Cache is invalidated
  - **Type**: Integration
  - **File**: `tests/integration/story-2.2-template-loading.spec.ts`

---

## File Structure Requirements

```
.claude/agents/
  # Orion Core (6) - must exist after story completion
  butler.md              # EXISTS - frontmatter fixed
  triage.md              # EXISTS - frontmatter fixed
  scheduler.md           # NEW - created
  communicator.md        # NEW - created
  navigator.md           # NEW - created
  preference_learner.md  # NEW - created

agent-server/src/agents/
  templates/
    index.ts             # loadAgentTemplate(), interpolateTemplate()
    types.ts             # AgentTemplate interface
  constants.ts           # ALL_AGENTS, ORION_CORE_AGENTS, AGENT_MODELS

src/agents/schemas/
  template.ts            # AgentTemplateSchema (Zod)
  index.ts               # Re-export

tests/
  unit/
    story-2.2-templates.spec.ts   # Tests 2.2.1.x
    story-2.2-schema.spec.ts      # Tests 2.2.2.9-14
    story-2.2-constants.spec.ts   # Tests 2.2.2.15-19
  integration/
    story-2.2-template-loading.spec.ts  # Tests 2.2.I1-I6
```

---

## Mock Requirements

```typescript
// tests/mocks/templates/malformed.md
// Invalid YAML frontmatter for error handling tests
---
name: malformed
model: [invalid yaml
---

// tests/mocks/templates/valid-minimal.md
// Minimal valid template for schema tests
---
name: test-agent
model: sonnet
---
# Test Agent

## Description
A minimal test agent.

## System Prompt
You are a test agent for unit testing. This prompt has over one hundred characters to pass the minimum length validation requirement for the AgentTemplateSchema.

## Tools
- test_tool
```

---

## Quality Gate Criteria

Before story can be marked complete:

- [ ] All 30 tests passing (24 unit + 6 integration)
- [ ] All 6 Orion core agent templates exist and validate
- [ ] Schema validation catches all malformed templates
- [ ] Variable interpolation handles all documented variables
- [ ] Constants correctly enumerate all 26 agents
- [ ] butler.md and triage.md have proper YAML frontmatter
- [ ] Unit test coverage >= 80%
- [ ] Integration tests pass in CI pipeline
- [ ] No P0/P1 bugs open

---

## Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| `.claude/agents/` directory | Must exist | All template loading tests |
| Existing CC v3 agent templates | Must exist | Reusable agent tests |
| Zod library | Installed | Schema validation tests |
| Vitest | Installed | All tests |

---

## Cross-References

- **Story File**: `thoughts/implementation-artifacts/stories/story-2a-2-agent-prompt-templates.md`
- **Epic Definition**: `thoughts/planning-artifacts/epics.md#story-2a.2`
- **Architecture**: `thoughts/planning-artifacts/architecture.md#6.1-agent-hierarchy`
- **Blocked By**: None (can start immediately)
- **Blocks**: Story 2a.1 (Butler Agent Core), Story 2a.3 (Sub-Agent Spawning)

---

**Document Status:** Ready for TDD Implementation
**Next Step:** Create test files, then implement template loading to make tests pass

_Generated by TEA (Test Architect Agent) - 2026-01-16_
