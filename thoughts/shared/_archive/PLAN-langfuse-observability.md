# Implementation Plan: Langfuse Observability Integration

Generated: 2026-01-15
Plan Agent Output

## Goal

Add Langfuse as a complementary observability layer alongside (not replacing) the existing Braintrust tracing system. Langfuse provides:
1. Open-source LLM observability with self-hosting option
2. Prompt management and versioning
3. Evaluation framework (LLM-as-a-Judge)
4. Human annotation queues
5. OpenTelemetry-native tracing

---

## Compatibility Analysis: Braintrust + Langfuse

### ✅ THEY DO NOT CONFLICT

**Why they can coexist:**

| Aspect | Braintrust | Langfuse | Conflict Risk |
|--------|------------|----------|---------------|
| **Architecture** | Custom API spans | OpenTelemetry-native | None - different protocols |
| **Hook System** | Python hooks writing to BT API | Python/TS decorators + OTel | Independent code paths |
| **State Storage** | `~/.claude/state/braintrust_sessions/` | OTel context + Langfuse API | Separate namespaces |
| **Data Flow** | Direct API calls via httpx | OTel export pipeline | No shared buffers |
| **Session ID** | Uses Claude's `session_id` | Uses W3C trace_id (32-hex) | Different ID schemes |

**Key insight:** Braintrust hooks (`braintrust_hooks.py`) use a custom span insertion API. Langfuse uses OpenTelemetry context propagation. They operate at different abstraction layers and don't share mutable state.

### Recommended Architecture

```
Claude Code Session
        |
        v
+------------------+     +------------------+
| Braintrust Hooks |     | Langfuse SDK     |
| (existing)       |     | (new)            |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
  Braintrust API           Langfuse Cloud/
  (analysis,               Self-hosted
   learning extraction)    (prompt mgmt,
                           evaluation,
                           annotations)
```

**Use cases:**
- **Braintrust:** Agent run analysis, learning extraction, session replay (existing)
- **Langfuse:** Prompt management, A/B testing, human evaluation queues, production monitoring (new)

---

## Current State Analysis

### Existing Braintrust Setup

**Files:**
- `.claude/hooks/braintrust_hooks.py` - Python hook handler (5 hooks: session_start, session_end, user_prompt_submit, post_tool_use, stop)
- `.claude/skills/braintrust-tracing/SKILL.md` - Documentation skill
- `.claude/skills/braintrust-analyze/SKILL.md` - Analysis skill
- `opc/scripts/braintrust_analyze.py` - Analysis script

**Environment Variables (existing):**
```
TRACE_TO_BRAINTRUST=true
BRAINTRUST_API_KEY=...
BRAINTRUST_CC_PROJECT=claude-code
```

### What Langfuse Integration Would Add

1. **SDK Integration** - `@observe()` decorator or context manager for Python code
2. **OpenAI Wrapper** - Auto-trace LLM calls (if using OpenAI SDK)
3. **Prompt Management** - Version-controlled prompts in Langfuse UI
4. **Evaluation** - Score traces via SDK or LLM-as-a-Judge
5. **MCP Server** - Documentation search via existing Langfuse MCP

---

## Technical Choices

| Choice | Decision | Rationale |
|--------|----------|-----------|
| **SDK Version** | Langfuse Python v3+ | OTel-native, context managers, `@observe()` decorator |
| **Tracing Scope** | Agent execution paths, NOT Claude hooks | Hooks already traced by Braintrust |
| **Prompt Management** | Use for Orion agent prompts | Keep Claude Code prompts in files (existing pattern) |
| **Self-host vs Cloud** | Start with cloud, option for self-host | Faster MVP, self-host for production |
| **Environment Split** | Separate `LANGFUSE_*` env vars | No collision with Braintrust vars |

---

## Tasks

### Task 1: Install Langfuse SDK

**Files to modify:**
- `opc/pyproject.toml` - Add `langfuse>=3.0.0` dependency
- `.env.example` - Document Langfuse env vars

**Steps:**
- [ ] Add `langfuse>=3.0.0` to `[project.dependencies]`
- [ ] Add env var documentation:
  ```
  # Langfuse (optional - LLM observability)
  LANGFUSE_PUBLIC_KEY=pk-lf-...
  LANGFUSE_SECRET_KEY=sk-lf-...
  LANGFUSE_HOST=https://cloud.langfuse.com  # or self-hosted URL
  ```
- [ ] Run `uv sync` to install

---

### Task 2: Create Langfuse Client Module

**Files to create:**
- `opc/scripts/observability/langfuse_client.py`

**Implementation:**
```python
#!/usr/bin/env python3
"""Langfuse client singleton with graceful degradation."""

import os
from functools import lru_cache
from typing import Optional

# Lazy import - only import langfuse if credentials are set
_langfuse_client = None

def get_langfuse_client():
    """Get or create Langfuse client. Returns None if not configured."""
    global _langfuse_client

    if not os.environ.get("LANGFUSE_PUBLIC_KEY"):
        return None

    if _langfuse_client is None:
        from langfuse import get_client
        _langfuse_client = get_client()

    return _langfuse_client

def langfuse_enabled() -> bool:
    """Check if Langfuse is configured."""
    return bool(os.environ.get("LANGFUSE_PUBLIC_KEY"))
```

---

### Task 3: Instrument Agent Execution (Optional Integration Points)

**Recommended integration points for Orion agents:**

**Files to modify:**
- `opc/src/runtime/` (if agent execution runtime exists)
- Future: `orion-app/src/lib/agent-client.ts`

**Pattern using decorator:**
```python
from langfuse import observe

@observe(name="butler-agent")
def execute_butler_agent(prompt: str, context: dict):
    """Execute butler agent with Langfuse tracing."""
    # Agent execution...
    return response
```

**Pattern using context manager:**
```python
from langfuse import get_client

langfuse = get_client()

with langfuse.start_as_current_observation(
    as_type="span",
    name="orion-butler-pipeline",
    input={"user_query": user_input}
) as trace:
    # Agent pipeline steps...
    trace.update(output=response)
```

---

### Task 4: Create Langfuse Tracing Skill (Documentation)

**Files to create:**
- `.claude/skills/langfuse-observability/SKILL.md`

**Content:**
- Setup instructions
- Environment variables
- Integration patterns
- Differences from Braintrust
- When to use which (use case guide)

---

### Task 5: Update Documentation

**Files to modify:**

| Document | Change | Scope |
|----------|--------|-------|
| `docs/ARCHITECTURE.md` | Add Langfuse to Infrastructure Layer diagram | Small - add 1 section |
| `docs/index.md` | Add Langfuse to Technology Stack table | Small - add 1 row |
| `.env.example` | Add Langfuse env vars | Small - add 4 lines |
| `docs/QUICKSTART.md` | Optional: add Langfuse setup | Medium - add section |

**Total doc update estimate:** ~50 lines across 4 files

---

### Task 6: Update MVP Plan (Optional)

**File to potentially modify:**
- `thoughts/shared/plans/PLAN-orion-mvp.md`

**Decision:** Langfuse is **optional** for MVP. Can be added in Phase 8 (Analytics/Monitoring) or as a separate post-MVP enhancement.

---

## Documentation Update Scope Summary

| Category | Files | Lines | Effort |
|----------|-------|-------|--------|
| **Core Docs** | 4 | ~50 | Low |
| **Skills** | 1 new | ~150 | Medium |
| **Code** | 1 new module | ~50 | Low |
| **Config** | 2 (env, pyproject) | ~15 | Low |
| **Planning Artifacts** | 0-1 | ~10 | Optional |

**Total effort:** Low-Medium (can be done in 1-2 sessions)

---

## Success Criteria

### Automated Verification:
- [ ] `uv run python -c "from langfuse import get_client"` - SDK imports
- [ ] Environment variables documented in `.env.example`
- [ ] No import errors when Langfuse not configured (graceful degradation)

### Manual Verification:
- [ ] Can create a trace in Langfuse cloud (if credentials provided)
- [ ] Braintrust tracing still works independently
- [ ] Documentation accurately describes both systems

---

## Out of Scope

- Replacing Braintrust (keep both systems)
- Prompt management migration (keep prompts in files for now)
- Self-hosted Langfuse deployment (cloud first)
- Deep integration into every script (start with agent execution only)

---

## Risks (Pre-Mortem)

### Tigers:
- **Env var collision** (LOW) - Using separate `LANGFUSE_*` prefix
  - Mitigation: Clear naming, documentation

### Elephants:
- **"Which tool for what?"** (MEDIUM) - Two observability systems may confuse users
  - Mitigation: Clear documentation in skill and README about use cases
  - Braintrust = session analysis, learning extraction
  - Langfuse = prompt management, evaluation, production monitoring
