# Epic 2a Implementation Plan: Core Agent Infrastructure

**Created:** 2026-01-16
**Epic:** 2a - Core Agent Infrastructure
**Status:** READY TO IMPLEMENT
**Total Stories:** 8
**Dependencies:** Epic 1 (Complete)

---

## Executive Summary

Epic 2a establishes the foundational agent infrastructure for Orion. All 8 stories have been reviewed and are ready for development. The existing infrastructure from Claude Code v3 (52 hooks, 115 skills) provides significant reusable components.

### Key Findings from Review

| Finding | Impact | Recommendation |
|---------|--------|----------------|
| **Story files ready** | Stories 2a-1 through 2a-16 have comprehensive detail | Proceed immediately |
| **CC v3 infrastructure exists** | 52 hooks, hook_launcher.py, memory system | Migrate, don't rewrite |
| **~~Missing ATDD checklist~~** | ~~story-2a-2 lacks ATDD checklist~~ | ✅ **RESOLVED** - Created 2026-01-16 |
| **Duplicate files exist** | Both `story-2-X` and `story-2a-X` naming | Administrative cleanup needed |
| **PostgreSQL dependency** | Story 2a.16 needs sessions table | Start Epic 10 story 10-1 in parallel |

### Discrepancies Identified and Resolved

| Discrepancy | In epics.md | In sprint-status.yaml | Resolution |
|-------------|-------------|----------------------|------------|
| Agent count | 31 agents | 26 agents | **Use 26** - BMAD agents excluded from Orion |
| Hook count | 34 hooks | 20 hooks | **Use 20** - infrastructure files miscounted |
| Story numbering | 2a.X format | 2a-X format in files | **Both valid** - stories exist with correct content |

---

## Implementation Order

### Phase 1: Foundation (Days 1-5)

Execute these in parallel tracks:

**Track A: Agent Templates & Butler**
```
Day 1-2: Story 2a.2 (Agent Prompt Templates)
         → Creates prompt infrastructure all agents need

Day 3-5: Story 2a.1 (Butler Agent Core)
         → Main orchestrator using templates from 2a.2
```

**Track B: Hook Infrastructure**
```
Day 1-3: Story 2a.15 (Hook Infrastructure Foundation)
         → HookRunner class, event lifecycle, error handling

Day 4-5: Story 2a.2b (CC v3 Hooks Integration)
         → Migrate existing hooks to Orion structure
```

### Phase 2: Integration (Days 6-10)

```
Day 6-7: Story 2a.3 (Sub-Agent Spawning)
         → Depends on: 2a.1 (Butler), 2a.2 (Templates)

Day 6-8: Story 2a.4 (Tool Permission System)
         → Can parallel with 2a.3, depends on: 2a.1

Day 8-9: Story 2a.10 (Prompt Caching Setup)
         → Depends on: 2a.1, 2a.2 (needs prompts to cache)
```

### Phase 3: Session Lifecycle (Days 9-12)

```
Day 9-12: Story 2a.16 (Session Lifecycle Hooks)
          → Depends on: 2a.15 (Hook Infrastructure)
          → Soft dependency on Epic 10 story 10-1 (PostgreSQL)
```

---

## Dependency Graph

```
Epic 1 (Complete)
    │
    ├─────────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
┌─────────────────┐                 ┌─────────────────────────┐
│ 2a.2: Prompt    │                 │ 2a.15: Hook             │
│ Templates       │                 │ Infrastructure          │
└────────┬────────┘                 └───────────┬─────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────┐                 ┌─────────────────────────┐
│ 2a.1: Butler    │                 │ 2a.2b: CC v3 Hooks      │
│ Agent Core      │                 │ Integration             │
└────────┬────────┘                 └───────────┬─────────────┘
         │                                      │
    ┌────┴──────────────┐                       │
    │                   │                       │
    ▼                   ▼                       ▼
┌─────────────┐  ┌─────────────┐      ┌─────────────────────────┐
│ 2a.3: Sub-  │  │ 2a.4: Tool  │      │ 2a.16: Session          │
│ Agent       │  │ Permission  │      │ Lifecycle Hooks         │
│ Spawning    │  │ System      │      │                         │
└─────────────┘  └─────────────┘      └─────────────────────────┘
         │                │
         └────────┬───────┘
                  ▼
         ┌─────────────────┐
         │ 2a.10: Prompt   │
         │ Caching Setup   │
         └─────────────────┘
```

---

## Story Details

### Story 2a.2: Agent Prompt Templates (START HERE)

**Status:** ready-for-dev
**Priority:** P0
**Risk:** LOW
**Estimated Effort:** 2 days

**What to Build:**
- Prompt template loader from `.claude/agents/` directory
- Variable interpolation system (`{{user_name}}`, `{{context}}`, etc.)
- Template validation schema (Zod)
- 26 agent template files (6 Orion core + 20 reusable/adapted)

**Files to Create:**
```
agent-server/src/agents/templates/
  loader.ts           # Template loading and interpolation
  types.ts            # TypeScript interfaces
  validation.ts       # Zod schemas for template validation

.claude/agents/
  butler.md           # Main orchestrator (detailed, >1000 chars)
  triage.md           # Inbox processing
  scheduler.md        # Calendar management
  communicator.md     # Message drafting
  navigator.md        # PARA search
  preference_learner.md # Pattern detection
  [+ 20 reusable templates from CC v3]
```

**Tests Required:**
- Unit: All 26 templates parse without errors
- Unit: Variable interpolation works
- Unit: Template validation catches malformed templates
- Integration: Agent loads and uses correct template at runtime

**ATDD Checklist:** ✅ Created - `atdd-checklist-2a-2-agent-prompt-templates.md`

---

### Story 2a.1: Butler Agent Core

**Status:** ready-for-dev
**Priority:** P0
**Risk:** HIGH
**Estimated Effort:** 3 days

**What to Build:**
- Butler agent class with intent classification
- Claude API integration with structured outputs
- Conversation history tracking
- Tool catalog access
- Multi-step task coordination

**Key Design Decisions:**
- Use `claude-sonnet-4-5` model (from architecture.md)
- 8 intent types: direct_answer, delegate_triage, delegate_schedule, delegate_draft, delegate_search, delegate_learn, clarify, cannot_help
- Confidence scores 0.0-1.0 on all classifications

**Files to Create:**
```
agent-server/src/agents/
  butler/
    index.ts          # Main Butler agent class
    types.ts          # TypeScript interfaces
    prompts.ts        # Prompt template loading
  orchestrator.ts     # Agent spawning/coordination
  lifecycle.ts        # AgentState enum, AgentContext interface
  tools/
    catalog.ts        # Tool registry

src/agents/schemas/
  butler.ts           # Zod schemas (IntentClassificationSchema, ButlerResponseSchema)
  index.ts            # Schema exports
```

**Tests (22 total in ATDD checklist):**
- Unit: 12 tests (prompt loading, schema validation, intent classification)
- Integration: 8 tests (delegation, context passing)
- E2E: 2 tests (multi-step synthesis)

---

### Story 2a.15: Hook Infrastructure Foundation

**Status:** ready-for-dev
**Priority:** P0
**Risk:** HIGH
**Estimated Effort:** 3 days

**What to Build:**
- HookRunner class in agent-server
- Support for 5 lifecycle events (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop)
- Python hook execution via `hook_launcher.py`
- Shell hook execution with permission checking
- Graceful degradation on hook failures

**Existing Infrastructure to Reuse:**
- `hook_launcher.py` (383 lines) - already exists in .claude/hooks/
- Shell hooks in `.claude/hooks/*.sh`
- TypeScript hooks compiled in `.claude/hooks/dist/`

**Files to Create:**
```
agent-server/src/hooks/
  runner.ts           # HookRunner class
  types.ts            # HookConfig, HookResult interfaces
  executor.ts         # Command execution with timeout
```

**Tests:**
- Unit: Hook registration validation
- Unit: Environment variables passed correctly
- Integration: SessionStart hooks fire on initialization
- Integration: Hook failures don't crash app
- E2E: Full lifecycle fires correctly

---

### Story 2a.2b: CC v3 Hooks Integration

**Status:** ready-for-dev
**Priority:** P0
**Risk:** MEDIUM
**Estimated Effort:** 2 days

**What to Build:**
- Migrate and adapt 20 hooks from CC v3
- Update paths for Orion's directory structure
- Register hooks in `.claude/settings.json`
- Test each hook category (session, prompt, tool, validation)

**Hook Categories to Migrate:**
| Category | Count | Examples |
|----------|-------|----------|
| Session Lifecycle | 5 | session-register, session-start-continuity |
| User Prompt | 3 | skill-activation-prompt, memory-awareness |
| Tool Interception | 4 | smart-search-router, file-claims |
| Validation | 3 | typescript-preflight, import-validator |
| Post-Tool | 5 | post-tool-use-tracker, learning-capture |

---

### Story 2a.3: Sub-Agent Spawning

**Status:** ready-for-dev
**Priority:** P0
**Risk:** MEDIUM
**Estimated Effort:** 2 days

**What to Build:**
- `spawnSubAgent(agentType, context)` method in orchestrator
- Context passing between Butler and sub-agents
- Result aggregation from sub-agents
- Agent rail UI integration (show active agent)

**Sub-Agents to Support:**
- triage (inbox processing)
- scheduler (calendar)
- communicator (email drafts)
- navigator (PARA search)
- preference_learner (pattern detection)

---

### Story 2a.4: Tool Permission System (canUseTool)

**Status:** ready-for-dev
**Priority:** P0
**Risk:** MEDIUM
**Estimated Effort:** 3 days

**What to Build:**
- canUseTool callback implementation
- 3-tier permission system (READ/WRITE/DESTRUCTIVE)
- Confirmation dialog UI
- Session permission store
- Permission audit logging to action_log table

**Tool Categories:**
| Category | Auto-Execute | Examples |
|----------|--------------|----------|
| READ | Yes | get_*, search_*, list_* |
| WRITE | Confirm | send_*, create_*, update_* |
| DESTRUCTIVE | Block + Confirm | delete_*, cancel_* |

**Baseline Tools (16):**
```
READ (auto): search_contacts, list_emails, get_calendar_events, search_para, get_preferences
WRITE (confirm): send_email, create_event, update_task, file_to_project
DESTRUCTIVE (block): delete_contact, delete_project, archive_area
```

---

### Story 2a.10: Prompt Caching Setup

**Status:** ready-for-dev
**Priority:** P1
**Risk:** LOW
**Estimated Effort:** 2 days

**What to Build:**
- Add `cache_control: { type: 'ephemeral' }` markers to system prompts
- Ensure prompts exceed 1,024 tokens (minimum cacheable)
- Log cache hit/miss ratio
- Track cost savings

**Caching Rules (from architecture.md 6.7):**
- System prompts: Cache for 5 minutes (90% discount)
- PARA context: Cache for 1 hour
- Dynamic content (user messages, recent context): Never cache
- Minimum tokens: 1,024 (Sonnet), 4,096 (Opus/Haiku)

---

### Story 2a.16: Session Lifecycle Hooks

**Status:** ready-for-dev
**Priority:** P1
**Risk:** LOW
**Estimated Effort:** 3 days

**What to Build:**
- session-register hook (PostgreSQL sessions table)
- session-start-continuity hook (load previous context)
- session-end-cleanup hook (persist state)
- session-outcome hook (record completion status)
- Open thread detection and resume capability

**PostgreSQL Dependency:**
- Needs `sessions` table from Epic 10 story 10-1
- **Recommendation:** Start Epic 10 story 10-1 in parallel with Track B

---

## Pre-Implementation Checklist

### Before Starting Story 2a.2:
- [x] Create ATDD checklist: `atdd-checklist-2a-2-agent-prompt-templates.md` ✅ Done
- [ ] Verify `.claude/agents/` directory exists
- [ ] Review existing CC v3 agent templates for reuse

### Before Starting Story 2a.1:
- [ ] Story 2a.2 must be complete (templates needed)
- [ ] Verify agent-server structure exists (from Epic 1)
- [ ] Create test mocks directory: `tests/mocks/agents/`

### Before Starting Story 2a.15:
- [ ] Verify `hook_launcher.py` exists and is executable
- [ ] Verify `.claude/settings.json` structure
- [ ] Check all shell hooks have execute permissions

### Before Starting Story 2a.16:
- [ ] Story 2a.15 must be complete
- [ ] Decide on PostgreSQL strategy:
  - Option A: Start Epic 10 story 10-1 in parallel
  - Option B: Use SQLite fallback initially, migrate later

---

## Administrative Cleanup Required

### Duplicate File Cleanup

The following duplicate files should be cleaned up (keep `story-2a-X`, remove `story-2-X`):

```bash
# Files to KEEP (correct 2a naming):
story-2a-1-butler-agent-core.md
story-2a-2-agent-prompt-templates.md
story-2a-2b-cc-v3-hooks-integration.md
story-2a-3-sub-agent-spawning.md
story-2a-4-tool-permission-system.md
story-2a-10-prompt-caching-setup.md
story-2a-15-hook-infrastructure-foundation.md
story-2a-16-session-lifecycle-hooks.md

# Files to REMOVE (old 2-X naming):
story-2-1-butler-agent-core.md
story-2-2-agent-prompt-templates.md
story-2-2b-cc-v3-hooks-integration.md
story-2-3-sub-agent-spawning.md
story-2-4-tool-permission-system.md
story-2-10-prompt-caching-setup.md
story-2-15-hook-infrastructure-foundation.md
story-2-16-session-lifecycle-hooks.md
```

**Note:** Also duplicate ATDD checklists with old naming should be cleaned up.

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude API changes | LOW | HIGH | Pin SDK version, have fallback prompts |
| Hook infrastructure complexity | MEDIUM | MEDIUM | Reuse CC v3 code, thorough testing |
| PostgreSQL dependency | MEDIUM | LOW | SQLite fallback for session hooks |
| Prompt caching misconfigured | LOW | MEDIUM | Verify minimum token counts |
| Sub-agent context loss | MEDIUM | MEDIUM | Serialize context with schema validation |

---

## Success Criteria

Epic 2a is complete when:

1. **All 8 stories pass their ATDD checklists**
2. **Butler agent can:**
   - Classify 8 intent types with confidence scores
   - Delegate to 5 sub-agent types
   - Coordinate multi-step tasks
3. **Hook system supports:**
   - 5 lifecycle events
   - Python and shell hooks
   - Graceful degradation on failures
4. **Tool permissions enforce:**
   - READ auto-execute
   - WRITE confirmation
   - DESTRUCTIVE blocking
5. **Prompt caching achieves:**
   - Measurable cache hit rate in logs
   - System prompts marked with cache_control
6. **Test coverage:**
   - 80%+ unit test coverage
   - All integration tests passing
   - E2E tests passing in CI

---

## Timeline Estimate

| Phase | Days | Stories |
|-------|------|---------|
| Phase 1: Foundation | 1-5 | 2a.2, 2a.1, 2a.15, 2a.2b |
| Phase 2: Integration | 6-10 | 2a.3, 2a.4, 2a.10 |
| Phase 3: Session | 9-12 | 2a.16 |
| **Total** | **~12 days** | 8 stories |

**With parallel execution on 2 tracks:** ~8-10 days

---

## Next Steps

1. **Create missing ATDD checklist** for story 2a.2
2. **Clean up duplicate files** (old story-2-X naming)
3. **Start implementation:**
   - Track A: Begin story 2a.2 (Agent Prompt Templates)
   - Track B: Begin story 2a.15 (Hook Infrastructure)
4. **Consider parallel track** for Epic 10 story 10-1 (PostgreSQL setup)

---

_Plan created: 2026-01-16_
_Author: Plan Agent_
_Status: Ready for User Approval_
