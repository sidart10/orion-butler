# Plan: Orion MVP - Agentic Personal Butler Harness

## Goal

Transform the Continuous Claude coding assistant infrastructure into **Orion** - an agentic personal butler/executive assistant. The MVP focuses on building the **harness/infrastructure** that makes creating personal assistant workflows as easy as creating coding skills in CC.

**Not building:** Individual email/calendar skills (those come after the harness is solid)
**Building:** The foundation that makes building those skills trivial

## Vision

```
Continuous Claude (coding)        →  Orion (personal assistant)
├── Skills for code workflows     →  Skills for life workflows
├── Agents for coding tasks       →  Agents for assistant tasks
├── Memory for code learnings     →  Memory for preferences, contacts, decisions
├── File org for code (src/)      →  File org for life (PAR system)
├── Hooks for dev lifecycle       →  Hooks for assistant lifecycle
└── Composio (not used)           →  Composio (central tool hub)
```

## Technical Choices

- **File Organization**: PARA system (Projects/Areas/Resources/Archive) - proven for knowledge management
- **Tool Integration**: Composio as primary tool connector (already have MCP available)
- **Context Storage**: Extend existing PostgreSQL schema with new tables for contacts, tasks, preferences
- **UI**: CLI-first (leverage existing Claude Code patterns), web UI later
- **Agent Model**: Same spawning pattern but with assistant-focused prompts
- **Memory**: Same BGE embeddings + hybrid search but with new entity types

## Current State Analysis

### What We Have (from CC):

| Component | Files | Reusable? |
|-----------|-------|-----------|
| Skills framework | `.claude/skills/*/SKILL.md` | ✅ Yes - just write new skills |
| Agent spawning | `.claude/agents/*.md` | ✅ Yes - create new agent types |
| Hooks system | `.claude/hooks/*.ts` | ✅ Yes - add assistant-specific hooks |
| Memory system | `opc/scripts/core/recall_learnings.py` | ⚠️ Extend for new entity types |
| Database | `opc/init-db.sql` | ⚠️ Extend schema |
| Context passing | Handoffs, blackboard | ✅ Yes - same pattern works |

### What We Need to Build:

| Component | Purpose | Priority |
|-----------|---------|----------|
| PARA file structure | Organize life data | P0 |
| Composio integration | Tool routing | P0 |
| Contact/entity memory | Remember people/orgs | P0 |
| Task management schema | Track todos across tools | P1 |
| Preference learning | Learn user patterns | P1 |
| Inbox abstraction | Unified action queue | P2 |
| A2UI protocol | Dynamic UI generation | P3 |

## Tasks

### Task 1: Define PARA File Structure

Create the file organization system for personal data.

- [ ] Create PARA directory structure
- [ ] Document naming conventions
- [ ] Create README for each section

**Files to create:**
- `orion/projects/README.md`
- `orion/areas/README.md`
- `orion/resources/README.md`
- `orion/archive/README.md`
- `orion/inbox/README.md`

**Structure:**
```
orion/
├── projects/           # Active projects with deadlines
│   └── README.md
├── areas/              # Ongoing responsibilities (health, finance, relationships)
│   └── README.md
├── resources/          # Reference material (contacts, templates, procedures)
│   └── README.md
├── archive/            # Completed/inactive items
│   └── README.md
└── inbox/              # Incoming items to process
    └── README.md
```

### Task 2: Extend Database Schema for Orion

Add tables for personal assistant data.

- [ ] Create contacts table (people, organizations)
- [ ] Create tasks table (todos with tool source tracking)
- [ ] Create preferences table (user patterns, learned behaviors)
- [ ] Create inbox_items table (unified action queue)
- [ ] Create tool_connections table (track Composio connections)

**Files to modify:**
- `opc/init-db.sql` (add new tables)
- OR create `opc/orion-schema.sql` (separate file, cleaner)

**Schema additions:**
```sql
-- Contacts: people and organizations
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization')),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    metadata JSONB DEFAULT '{}', -- flexible fields
    embedding vector(1024), -- BGE for semantic search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks: unified todo tracking
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'deferred')),
    priority TEXT DEFAULT 'normal',
    source_tool TEXT, -- 'gmail', 'slack', 'manual'
    source_id TEXT,   -- external ID from source
    due_date TIMESTAMPTZ,
    project_id TEXT,  -- link to PARA project
    area TEXT,        -- link to PARA area
    assignee_contact_id UUID REFERENCES contacts(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inbox: unified action queue
CREATE TABLE inbox_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type TEXT NOT NULL, -- 'email', 'slack_message', 'calendar_invite', 'task'
    source_tool TEXT NOT NULL,
    source_id TEXT,
    title TEXT NOT NULL,
    preview TEXT,
    priority_score FLOAT DEFAULT 0.5, -- AI-computed
    needs_response BOOLEAN DEFAULT false,
    processed BOOLEAN DEFAULT false,
    action_taken TEXT,
    metadata JSONB DEFAULT '{}',
    received_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ
);

-- Tool connections: track Composio integrations
CREATE TABLE tool_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name TEXT NOT NULL UNIQUE,
    connection_status TEXT DEFAULT 'disconnected',
    last_sync TIMESTAMPTZ,
    capabilities JSONB DEFAULT '[]', -- what actions this tool supports
    metadata JSONB DEFAULT '{}'
);
```

### Task 3: Create Composio Integration Layer

Build the abstraction for connecting to external tools via Composio.

- [ ] Create composio router skill
- [ ] Create tool discovery hook
- [ ] Document tool connection flow
- [ ] Create connection management script

**Files to create:**
- `.claude/skills/composio-router/SKILL.md` - routes requests to appropriate Composio tools
- `.claude/hooks/src/tool-router.ts` - intercepts tool requests, routes through Composio
- `opc/scripts/core/composio_connect.py` - manage tool connections

**Composio Router Skill pattern:**
```yaml
name: composio-router
description: Route tool requests through Composio MCP
keywords: [composio, tools, integration, router]
```

The skill will:
1. Receive a tool request (e.g., "send email to X")
2. Check tool_connections table for active connection
3. If not connected, guide user through OAuth
4. Route to appropriate Composio action
5. Handle response, update inbox/tasks as needed

### Task 4: Create Base Assistant Agents

Define the core agent types for personal assistant workflows.

- [ ] Create `butler` agent (main orchestrator)
- [ ] Create `triage` agent (inbox processing)
- [ ] Create `researcher` agent (information gathering)
- [ ] Create `communicator` agent (draft messages)
- [ ] Create `scheduler` agent (calendar management)

**Files to create:**
- `.claude/agents/butler.md` - main orchestrator
- `.claude/agents/triage.md` - inbox processor
- `.claude/agents/communicator.md` - message drafting
- `.claude/agents/scheduler.md` - calendar ops
- `.claude/agents/researcher-personal.md` - personal research (distinct from code research)

**Butler agent responsibilities:**
- Route incoming requests to appropriate sub-agents
- Maintain context across tools
- Learn user preferences
- Escalate when uncertain

### Task 5: Create Core Assistant Skills

Build the foundational skills that assistant workflows depend on.

- [ ] Create `inbox-process` skill (triage inbox items)
- [ ] Create `contact-lookup` skill (find people/orgs)
- [ ] Create `task-create` skill (add todos)
- [ ] Create `preference-learn` skill (record user patterns)
- [ ] Create `action-log` skill (audit trail of actions)

**Files to create:**
- `.claude/skills/inbox-process/SKILL.md`
- `.claude/skills/contact-lookup/SKILL.md`
- `.claude/skills/task-create/SKILL.md`
- `.claude/skills/preference-learn/SKILL.md`
- `.claude/skills/action-log/SKILL.md`

These are **building block** skills that more complex workflows will use.

### Task 6: Create Assistant-Specific Hooks

Add hooks for personal assistant lifecycle events.

- [ ] Create `inbox-arrival` hook (trigger on new inbox items)
- [ ] Create `preference-detector` hook (detect patterns in user actions)
- [ ] Create `deadline-watcher` hook (alert on approaching deadlines)
- [ ] Create `context-enricher` hook (add relevant context to prompts)

**Files to create:**
- `.claude/hooks/src/inbox-arrival.ts`
- `.claude/hooks/src/preference-detector.ts`
- `.claude/hooks/src/deadline-watcher.ts`
- `.claude/hooks/src/context-enricher.ts`

### Task 7: Extend Memory System for Entities

Adapt the learning storage for personal assistant entities.

- [ ] Add entity types to archival_memory (contact, preference, decision)
- [ ] Create entity-aware recall script
- [ ] Add contact embedding generation
- [ ] Create preference extraction pattern

**Files to modify:**
- `opc/scripts/core/store_learning.py` - add new types
- `opc/scripts/core/recall_learnings.py` - entity-aware search

**New entity types:**
```python
ENTITY_TYPES = [
    "CONTACT_INFO",      # Information about a person/org
    "USER_PREFERENCE",   # Learned pattern (e.g., "user prefers email for urgent")
    "DECISION_RECORD",   # Why user made a choice
    "TASK_PATTERN",      # Recurring task patterns
    "COMMUNICATION_STYLE" # How user talks to specific contacts
]
```

### Task 8: Create Skill Creation Template

Standardize how new assistant skills are created.

- [ ] Create skill template with assistant-specific sections
- [ ] Create skill generator script
- [ ] Document skill creation process
- [ ] Add skill testing pattern

**Files to create:**
- `.claude/skills/_templates/assistant-skill-template.md`
- `opc/scripts/setup/create_assistant_skill.py`
- `docs/creating-orion-skills.md`

**Template includes:**
- Tool dependencies (which Composio tools needed)
- Context requirements (what memory/entities needed)
- Action patterns (what the skill actually does)
- Learning hooks (what preferences to extract)

### Task 9: Create Initial Workflow Skill

Build one end-to-end workflow skill to validate the harness.

- [ ] Create `daily-briefing` skill
- [ ] Integrate inbox triage
- [ ] Pull calendar events
- [ ] Summarize priorities
- [ ] Test full flow

**Files to create:**
- `.claude/skills/daily-briefing/SKILL.md`

This skill demonstrates:
1. Tool integration (calendar, email via Composio)
2. Memory lookup (preferences, contacts)
3. Agent spawning (triage sub-agent)
4. Context passing (handoff pattern)

### Task 10: Documentation and Migration Guide

Document how to extend Orion and add new capabilities.

- [ ] Write architecture overview
- [ ] Document skill creation guide
- [ ] Document tool integration guide
- [ ] Create example workflows
- [ ] Migration notes (CC → Orion)

**Files to create:**
- `docs/orion-architecture.md`
- `docs/creating-skills.md`
- `docs/adding-tools.md`
- `docs/example-workflows.md`

## Success Criteria

### Automated Verification:
- [ ] Database migrations run: `docker-compose up -d && psql -f opc/orion-schema.sql`
- [ ] Hooks compile: `cd .claude/hooks && npm run build`
- [ ] Skill validation: `ls .claude/skills/*/SKILL.md | wc -l` (count increased)

### Manual Verification:
- [ ] Can create a new assistant skill using template in <5 min
- [ ] Can connect a Composio tool via skill/script
- [ ] Butler agent can route a simple request
- [ ] Memory stores and recalls contact information
- [ ] Daily briefing skill executes end-to-end

### Harness Completeness:
- [ ] PARA structure exists with READMEs
- [ ] All 5 base agents have prompts
- [ ] All 5 core skills exist
- [ ] Composio router works
- [ ] Memory extended for entities
- [ ] One workflow (daily-briefing) demonstrates full pattern

## Out of Scope (Future)

- **Web UI** - CLI first, UI is a future layer
- **A2UI protocol** - Dynamic interfaces come after core works
- **Auth/payment** - Productization after personal use validated
- **Specific integrations** - Gmail, Slack skills come after harness
- **Multi-user** - Single-user focus for MVP
- **Mobile** - Desktop/CLI only for now

## Risks (Pre-Mortem)

### Tigers:
- **Composio connection reliability** (MEDIUM)
  - Mitigation: Graceful degradation, cache tool capabilities, offline fallback

- **Schema migration conflicts** (LOW)
  - Mitigation: Create separate orion-schema.sql, don't modify CC tables

### Elephants:
- **Scope creep to actual features** (HIGH)
  - Note: Must resist building email/calendar skills before harness is solid

- **Over-engineering the abstractions** (MEDIUM)
  - Note: Build minimal harness, let real skills drive evolution

## Dependencies

- Continuous Claude already works in this repo
- PostgreSQL running via docker-compose
- Composio MCP available (check `.claude/mcp_config.json`)
- Node.js for hook compilation

## Sequence

```
Task 1 (PARA structure)
    ↓
Task 2 (DB schema) ─────┬───→ Task 7 (Memory extension)
    ↓                   │
Task 3 (Composio) ←─────┘
    ↓
Task 4 (Agents) + Task 5 (Skills) + Task 6 (Hooks)  [parallel]
    ↓
Task 8 (Skill template)
    ↓
Task 9 (Daily briefing - validation)
    ↓
Task 10 (Documentation)
```
