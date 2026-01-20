# Story 2.17: Context Injection Hooks

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-17-context-injection-hooks
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a user,
I want context automatically injected into my prompts,
So that agents have relevant information without me asking.

---

## Acceptance Criteria

### AC1: Contact Name Triggers Memory Lookup

**Given** I submit a prompt mentioning a contact name
**When** UserPromptSubmit fires
**Then** `memory-awareness` searches for relevant memories
**And** contact details and recent interactions are injected
**And** agent receives enriched context

- [ ] UserPromptSubmit event triggers `memory-awareness.sh` hook
- [ ] Contact name detection via regex and NER-style pattern matching (capitalized names, email addresses, "@mentions")
- [ ] When contact name detected, query PostgreSQL `archival_memory` table for relevant memories:
  ```sql
  SELECT content, context, confidence
  FROM archival_memory
  WHERE content ILIKE '%[contact_name]%'
    OR context ILIKE '%[contact_name]%'
  ORDER BY created_at DESC
  LIMIT 5
  ```
- [ ] Query SQLite `contacts` table for contact details:
  ```sql
  SELECT id, name, email, relationship, preferred_channel, last_interaction_at
  FROM contacts
  WHERE name LIKE '%[contact_name]%'
  LIMIT 3
  ```
- [ ] Format context as `additionalContext` response:
  ```
  ## Contact Context: John Smith
  - Email: john@example.com
  - Relationship: client
  - Preferred: email
  - Last Interaction: 2 days ago

  ## Relevant Memories
  - John prefers morning meetings (confidence: 0.9)
  - Discussed Q4 budget on 2026-01-10
  ```
- [ ] Context injection respects token limits (max 1000 tokens for contact context)

### AC2: Project Name Triggers Project Context

**Given** I submit a prompt about a project
**When** UserPromptSubmit fires
**Then** project details (tasks, stakeholders, deadline) are injected
**And** related emails and meetings are surfaced
**And** agent can reference project context

- [ ] Project name detection via pattern matching against known project names from SQLite
- [ ] On project match, query SQLite for project details:
  ```sql
  SELECT id, name, description, status, deadline, stakeholders
  FROM projects
  WHERE name LIKE '%[project_name]%' OR id = '[project_id]'
  LIMIT 1
  ```
- [ ] Query related tasks:
  ```sql
  SELECT id, title, status, priority, due_date
  FROM tasks
  WHERE project_id = '[project_id]'
  ORDER BY priority DESC, due_date ASC
  LIMIT 10
  ```
- [ ] Query related inbox items (emails, meetings):
  ```sql
  SELECT id, source_tool, subject, sender, received_at
  FROM inbox_items
  WHERE metadata LIKE '%[project_name]%'
    OR metadata LIKE '%[project_id]%'
  ORDER BY received_at DESC
  LIMIT 5
  ```
- [ ] Format as `additionalContext`:
  ```
  ## Project Context: Q4 Planning
  - Status: active
  - Deadline: 2026-12-31
  - Stakeholders: John, Alice

  ## Tasks (3 active)
  - [ ] Review budget (P0, due: Jan 20)
  - [ ] Draft proposal (P1, due: Jan 25)
  - [ ] Schedule kickoff (P2)

  ## Recent Related Items
  - Email from John: "Q4 Planning Update" (2 days ago)
  - Meeting: "Q4 Kickoff" (tomorrow, 10am)
  ```
- [ ] Include stakeholder contact information if available

### AC3: Skill Suggestions for Relevant Prompts

**Given** I submit any prompt
**When** UserPromptSubmit fires
**Then** `skill-activation-prompt` suggests relevant skills
**And** user preferences for this context are injected
**And** agent operates with full context awareness

- [ ] UserPromptSubmit event triggers `skill-activation-prompt.sh` hook
- [ ] Intent classification to determine applicable skills:
  | Intent Pattern | Suggested Skill |
  |----------------|-----------------|
  | "triage", "inbox", "urgent emails" | `/triage` |
  | "schedule", "meeting", "calendar" | `/schedule` |
  | "email", "reply", "draft" | `/draft` |
  | "find", "search", "where is" | `/explore` |
  | "remember", "note that", "keep in mind" | `/remember` |
  | "what do you know about", "recall" | `/recall` |
  | "organize", "file", "move to" | `/organize` |
- [ ] Skill suggestions returned in `additionalContext`:
  ```
  ## Suggested Skills
  Based on your request, you might want to use:
  - `/triage` - Process and prioritize inbox items
  - `/schedule` - Find optimal meeting times
  ```
- [ ] User preferences queried from SQLite `preferences` table and injected:
  ```sql
  SELECT category, key, value, confidence
  FROM preferences
  WHERE category IN ('communication', 'scheduling', 'triage')
    AND (source = 'explicit' OR confidence > 0.7)
  ORDER BY confidence DESC
  ```
- [ ] Preference context format:
  ```
  ## User Preferences
  - Prefers morning meetings (9am-11am)
  - Communication tone: professional
  - Auto-archive newsletters: enabled
  ```

### AC4: Token Limit Enforcement

**Given** context injection produces content
**When** the context is being assembled
**Then** total injected context doesn't exceed token limits
**And** content is prioritized and truncated if needed

- [ ] Maximum context injection budget: 2000 tokens total
- [ ] Priority order for context sections:
  1. Contact details (500 tokens max)
  2. Project context (500 tokens max)
  3. Skill suggestions (200 tokens max)
  4. Preferences (300 tokens max)
  5. Memory recall (500 tokens max)
- [ ] Token counting using simple word-based estimation (words * 1.3)
- [ ] Truncation strategy: most recent/relevant items kept, older/lower-confidence items dropped
- [ ] Return `truncated: true` in response if content was trimmed
- [ ] Log truncation decisions for debugging

---

## Technical Notes

### Context Injection Hooks (4 total)

| Hook | Event | Purpose | Timeout |
|------|-------|---------|---------|
| `memory-awareness.sh` | UserPromptSubmit | Inject relevant memories and contact context | 5000ms |
| `skill-activation-prompt.sh` | UserPromptSubmit | Suggest applicable skills and inject preferences | 3000ms |
| `arch-context-inject.sh` | PreToolUse | Inject architectural context for code tools | 3000ms |
| `edit-context-inject.sh` | PreToolUse | Inject edit context for file modifications | 3000ms |

### Context Injection Strategy Flow

```
User Prompt: "Schedule meeting with John about Q4 planning"
                    |
                    v
+-------------------+-------------------+
|                   |                   |
v                   v                   v
memory-awareness   skill-activation    (async hooks)
|                   |
v                   v
Contact lookup:    Skill match:
- John Smith       - /schedule
- Memories         |
|                   v
v                   Preference lookup:
Project lookup:    - Morning preferred
- Q4 Planning      - 30min default
- Tasks/Meetings
|
+-------------------+-------------------+
                    |
                    v
            Merge & Prioritize
                    |
                    v
            Token Budget Check
                    |
                    v
            additionalContext
                    |
                    v
            Enriched Prompt to Agent
```

### memory-awareness.sh Implementation

```bash
#!/usr/bin/env bash
# memory-awareness.sh - Inject relevant memories and contact context on UserPromptSubmit

set -euo pipefail

# Read input payload
INPUT=$(cat)
USER_MESSAGE=$(echo "$INPUT" | jq -r '.userMessage // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.sessionId // empty')

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DATABASE_URL="${DATABASE_URL:-postgresql://claude:claude_dev@localhost:5432/continuous_claude}"
SQLITE_DB="$HOME/Library/Application Support/Orion/orion.db"

# Extract potential contact names (capitalized words, email patterns)
CONTACT_PATTERNS=$(echo "$USER_MESSAGE" | grep -oE '\b[A-Z][a-z]+(\s[A-Z][a-z]+)?|\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' | head -3 || true)

CONTEXT_PARTS=""

# Process each potential contact
for CONTACT in $CONTACT_PATTERNS; do
    # Query SQLite for contact details
    if [ -f "$SQLITE_DB" ]; then
        CONTACT_INFO=$(sqlite3 "$SQLITE_DB" "
            SELECT name, email, relationship, preferred_channel,
                   datetime(last_interaction_at, 'localtime') as last_interaction
            FROM contacts
            WHERE name LIKE '%$CONTACT%'
            LIMIT 1
        " 2>/dev/null || echo "")

        if [ -n "$CONTACT_INFO" ]; then
            NAME=$(echo "$CONTACT_INFO" | cut -d'|' -f1)
            EMAIL=$(echo "$CONTACT_INFO" | cut -d'|' -f2)
            RELATIONSHIP=$(echo "$CONTACT_INFO" | cut -d'|' -f3)
            CHANNEL=$(echo "$CONTACT_INFO" | cut -d'|' -f4)
            LAST_INT=$(echo "$CONTACT_INFO" | cut -d'|' -f5)

            CONTEXT_PARTS="$CONTEXT_PARTS
## Contact Context: $NAME
- Email: $EMAIL
- Relationship: ${RELATIONSHIP:-unknown}
- Preferred Channel: ${CHANNEL:-email}
- Last Interaction: ${LAST_INT:-never}
"
        fi
    fi

    # Query PostgreSQL for memories about this contact
    MEMORIES=$(psql "$DATABASE_URL" -t -c "
        SELECT content
        FROM archival_memory
        WHERE content ILIKE '%$CONTACT%'
          OR context ILIKE '%$CONTACT%'
        ORDER BY created_at DESC
        LIMIT 3
    " 2>/dev/null || echo "")

    if [ -n "$MEMORIES" ]; then
        CONTEXT_PARTS="$CONTEXT_PARTS
## Relevant Memories for $CONTACT
$(echo "$MEMORIES" | sed 's/^/- /')
"
    fi
done

# Output result
if [ -n "$CONTEXT_PARTS" ]; then
    jq -n \
        --arg ctx "$CONTEXT_PARTS" \
        '{
            "permissionDecision": "allow",
            "additionalContext": $ctx,
            "message": "Context injected for contacts"
        }'
else
    echo '{"permissionDecision": "allow", "message": "No context to inject"}'
fi
```

### skill-activation-prompt.sh Implementation

```bash
#!/usr/bin/env bash
# skill-activation-prompt.sh - Suggest relevant skills based on prompt intent

set -euo pipefail

INPUT=$(cat)
USER_MESSAGE=$(echo "$INPUT" | jq -r '.userMessage // empty')
USER_MESSAGE_LOWER=$(echo "$USER_MESSAGE" | tr '[:upper:]' '[:lower:]')

SQLITE_DB="$HOME/Library/Application Support/Orion/orion.db"
CONTEXT_PARTS=""
SUGGESTED_SKILLS=""

# Intent-to-skill mapping
if echo "$USER_MESSAGE_LOWER" | grep -qE 'triage|inbox|urgent|email.*check|what.*email'; then
    SUGGESTED_SKILLS="$SUGGESTED_SKILLS
- \`/triage\` - Process and prioritize inbox items"
fi

if echo "$USER_MESSAGE_LOWER" | grep -qE 'schedule|meeting|calendar|book.*time|find.*time'; then
    SUGGESTED_SKILLS="$SUGGESTED_SKILLS
- \`/schedule\` - Find optimal meeting times and create events"
fi

if echo "$USER_MESSAGE_LOWER" | grep -qE 'email|reply|draft|write.*to|send.*message'; then
    SUGGESTED_SKILLS="$SUGGESTED_SKILLS
- \`/draft\` - Compose emails matching your tone"
fi

if echo "$USER_MESSAGE_LOWER" | grep -qE 'find|search|where.*is|locate|look.*for'; then
    SUGGESTED_SKILLS="$SUGGESTED_SKILLS
- \`/explore\` - Search across projects, contacts, and archives"
fi

if echo "$USER_MESSAGE_LOWER" | grep -qE 'remember|note.*that|keep.*mind|save.*that'; then
    SUGGESTED_SKILLS="$SUGGESTED_SKILLS
- \`/remember\` - Store this information for future recall"
fi

if echo "$USER_MESSAGE_LOWER" | grep -qE 'recall|what.*know|remember.*about|history'; then
    SUGGESTED_SKILLS="$SUGGESTED_SKILLS
- \`/recall\` - Search your memory for relevant information"
fi

if echo "$USER_MESSAGE_LOWER" | grep -qE 'organize|file|move.*to|archive|categorize'; then
    SUGGESTED_SKILLS="$SUGGESTED_SKILLS
- \`/organize\` - File items into the right PARA category"
fi

if [ -n "$SUGGESTED_SKILLS" ]; then
    CONTEXT_PARTS="## Suggested Skills
Based on your request, these skills may help:
$SUGGESTED_SKILLS
"
fi

# Query user preferences from SQLite
if [ -f "$SQLITE_DB" ]; then
    PREFS=$(sqlite3 "$SQLITE_DB" "
        SELECT category, key, value
        FROM preferences
        WHERE (source = 'explicit' OR confidence > 0.7)
        ORDER BY category, confidence DESC
        LIMIT 10
    " 2>/dev/null || echo "")

    if [ -n "$PREFS" ]; then
        CONTEXT_PARTS="$CONTEXT_PARTS
## Your Preferences
$(echo "$PREFS" | awk -F'|' '{print "- " $1 "/" $2 ": " $3}')
"
    fi
fi

# Output result
if [ -n "$CONTEXT_PARTS" ]; then
    jq -n \
        --arg ctx "$CONTEXT_PARTS" \
        '{
            "permissionDecision": "allow",
            "additionalContext": $ctx,
            "message": "Skill suggestions and preferences injected"
        }'
else
    echo '{"permissionDecision": "allow", "message": "No skill suggestions"}'
fi
```

### memory_awareness.py Implementation (Alternative)

```python
#!/usr/bin/env python3
"""
memory_awareness.py - Context injection for contacts, projects, and memories.

More robust Python implementation with proper entity extraction and token management.
"""
import json
import sys
import os
import re
import sqlite3
from typing import Optional

# Try PostgreSQL, graceful fallback
try:
    import psycopg2
    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False


def estimate_tokens(text: str) -> int:
    """Estimate token count (words * 1.3)."""
    return int(len(text.split()) * 1.3)


def extract_entities(message: str) -> dict:
    """Extract contact names, project names, and other entities."""
    entities = {
        'contacts': [],
        'projects': [],
        'emails': []
    }

    # Email addresses
    entities['emails'] = re.findall(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', message)

    # Capitalized names (2-3 words)
    entities['contacts'] = re.findall(r'\b[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}\b', message)

    # Project-like patterns (quoted text, "Project X", etc.)
    quoted = re.findall(r'"([^"]+)"', message)
    project_pattern = re.findall(r'\b(?:project|Project)\s+([A-Za-z0-9 ]+)', message)
    entities['projects'] = quoted + project_pattern

    return entities


def query_sqlite_contacts(names: list, db_path: str) -> list:
    """Query SQLite for contact information."""
    if not os.path.exists(db_path):
        return []

    results = []
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        for name in names[:3]:  # Limit to 3 contacts
            cur.execute("""
                SELECT id, name, email, relationship, preferred_channel, last_interaction_at
                FROM contacts
                WHERE name LIKE ?
                LIMIT 1
            """, (f'%{name}%',))

            row = cur.fetchone()
            if row:
                results.append({
                    'id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'relationship': row[3],
                    'preferred_channel': row[4],
                    'last_interaction': row[5]
                })

        conn.close()
    except Exception:
        pass

    return results


def query_sqlite_projects(project_names: list, db_path: str) -> list:
    """Query SQLite for project information."""
    if not os.path.exists(db_path):
        return []

    results = []
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        for name in project_names[:2]:  # Limit to 2 projects
            cur.execute("""
                SELECT id, name, description, status, deadline, stakeholders
                FROM projects
                WHERE name LIKE ?
                LIMIT 1
            """, (f'%{name}%',))

            row = cur.fetchone()
            if row:
                results.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'status': row[3],
                    'deadline': row[4],
                    'stakeholders': row[5]
                })

        conn.close()
    except Exception:
        pass

    return results


def query_postgres_memories(search_terms: list, db_url: str) -> list:
    """Query PostgreSQL for relevant memories."""
    if not HAS_POSTGRES or not search_terms:
        return []

    results = []
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        for term in search_terms[:3]:
            cur.execute("""
                SELECT content, confidence, created_at
                FROM archival_memory
                WHERE content ILIKE %s
                   OR context ILIKE %s
                ORDER BY created_at DESC
                LIMIT 3
            """, (f'%{term}%', f'%{term}%'))

            for row in cur.fetchall():
                results.append({
                    'content': row[0][:200],  # Truncate to 200 chars
                    'confidence': row[1],
                    'created_at': str(row[2]) if row[2] else None
                })

        conn.close()
    except Exception:
        pass

    return results


def build_context(contacts: list, projects: list, memories: list, max_tokens: int = 2000) -> tuple:
    """Build context string with token budget management."""
    sections = []
    total_tokens = 0
    truncated = False

    # Contact context (500 token budget)
    if contacts:
        contact_section = "## Contact Context\n"
        for c in contacts:
            entry = f"- **{c['name']}**: {c.get('email', 'N/A')}"
            if c.get('relationship'):
                entry += f" ({c['relationship']})"
            if c.get('last_interaction'):
                entry += f" - Last contact: {c['last_interaction']}"
            contact_section += entry + "\n"

        section_tokens = estimate_tokens(contact_section)
        if total_tokens + section_tokens <= max_tokens:
            sections.append(contact_section)
            total_tokens += section_tokens
        else:
            truncated = True

    # Project context (500 token budget)
    if projects:
        project_section = "## Project Context\n"
        for p in projects:
            project_section += f"- **{p['name']}** ({p.get('status', 'active')})\n"
            if p.get('deadline'):
                project_section += f"  - Deadline: {p['deadline']}\n"
            if p.get('stakeholders'):
                project_section += f"  - Stakeholders: {p['stakeholders']}\n"

        section_tokens = estimate_tokens(project_section)
        if total_tokens + section_tokens <= max_tokens:
            sections.append(project_section)
            total_tokens += section_tokens
        else:
            truncated = True

    # Memory context (500 token budget)
    if memories:
        memory_section = "## Relevant Memories\n"
        for m in memories[:5]:  # Limit to 5 memories
            confidence = m.get('confidence', 0)
            memory_section += f"- {m['content']}"
            if confidence:
                memory_section += f" (confidence: {confidence:.1f})"
            memory_section += "\n"

        section_tokens = estimate_tokens(memory_section)
        if total_tokens + section_tokens <= max_tokens:
            sections.append(memory_section)
            total_tokens += section_tokens
        else:
            truncated = True

    return "\n".join(sections), truncated


def run(payload: dict) -> dict:
    """Main hook execution."""
    user_message = payload.get('userMessage', '')
    session_id = payload.get('sessionId', '')

    # Configuration
    db_url = os.environ.get('DATABASE_URL', 'postgresql://claude:claude_dev@localhost:5432/continuous_claude')
    sqlite_db = os.path.expanduser('~/Library/Application Support/Orion/orion.db')

    # Extract entities from message
    entities = extract_entities(user_message)

    # Query data sources
    contacts = query_sqlite_contacts(entities['contacts'], sqlite_db)
    projects = query_sqlite_projects(entities['projects'], sqlite_db)

    # Combine search terms for memory query
    search_terms = entities['contacts'] + entities['projects']
    memories = query_postgres_memories(search_terms, db_url)

    # Build context with token budget
    context, truncated = build_context(contacts, projects, memories)

    if context:
        return {
            "permissionDecision": "allow",
            "additionalContext": context,
            "truncated": truncated,
            "message": f"Injected context: {len(contacts)} contacts, {len(projects)} projects, {len(memories)} memories"
        }
    else:
        return {
            "permissionDecision": "allow",
            "message": "No context to inject"
        }


if __name__ == "__main__":
    payload = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}
    result = run(payload)
    print(json.dumps(result))
```

### settings.json Hook Registration

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "uv run python hook_launcher.py memory_awareness.py",
        "timeout": 5000
      },
      {
        "command": "skill-activation-prompt.sh",
        "timeout": 3000
      }
    ],
    "PreToolUse": [
      {
        "command": "arch-context-inject.sh",
        "timeout": 3000,
        "matcher": {
          "tool": "Read"
        }
      },
      {
        "command": "edit-context-inject.sh",
        "timeout": 3000,
        "matcher": {
          "tool": "Edit"
        }
      }
    ]
  }
}
```

---

## Dependencies

### Internal Dependencies

| Story | Dependency |
|-------|------------|
| **2.16** | Session Lifecycle Hooks - provides session context and continuity that context injection builds upon |
| **2.15** | Hook Infrastructure Foundation - provides HookRunner, event firing, additionalContext mechanism |
| **2.2b** | CC v3 Hooks Integration - provides hook registration patterns and settings.json structure |
| 1.4 | SQLite Database Setup - provides contacts, projects, preferences tables |
| 1.5 | Agent Server Process - hosts hook execution |

### External Dependencies

- **PostgreSQL** - Memory storage (archival_memory table)
- **psycopg2** - Python PostgreSQL driver
- **sqlite3** - Python SQLite (stdlib)
- **jq** - JSON parsing in shell scripts
- **uv** - Python package runner

### These Stories Depend On 2.17

| Story | Why |
|-------|-----|
| 2.18 | Tool routing hooks use similar context detection patterns |
| 3.x | Integration stories benefit from automatic context injection |
| 4.x | PARA features rely on project context injection |

---

## Test Considerations

### Unit Tests (tests/unit/story-2.17-*.spec.ts)

**2.17.U1 - Entity Extraction**
```typescript
import { extractEntities } from '@/hooks/context/entity-extractor';

test('extracts contact names from message', () => {
  const message = 'Schedule a meeting with John Smith about the Q4 project';
  const entities = extractEntities(message);

  expect(entities.contacts).toContain('John Smith');
});

test('extracts email addresses', () => {
  const message = 'Send the report to alice@example.com';
  const entities = extractEntities(message);

  expect(entities.emails).toContain('alice@example.com');
});

test('extracts project names from quoted text', () => {
  const message = 'What\'s the status of "Project Phoenix"?';
  const entities = extractEntities(message);

  expect(entities.projects).toContain('Project Phoenix');
});
```

**2.17.U2 - Token Limit Enforcement**
```typescript
import { buildContext, estimateTokens } from '@/hooks/context/builder';

test('context respects token limit', () => {
  const contacts = Array(10).fill({
    name: 'Contact Name',
    email: 'email@example.com',
    relationship: 'colleague'
  });

  const { context, truncated } = buildContext(contacts, [], [], 500);

  expect(estimateTokens(context)).toBeLessThanOrEqual(500);
  expect(truncated).toBe(true);
});

test('prioritizes sections correctly', () => {
  const { context } = buildContext(
    [{ name: 'John', email: 'j@ex.com' }],
    [{ name: 'Project A', status: 'active' }],
    [{ content: 'Memory 1' }],
    2000
  );

  // Contact section should appear before project section
  const contactIndex = context.indexOf('## Contact Context');
  const projectIndex = context.indexOf('## Project Context');

  expect(contactIndex).toBeLessThan(projectIndex);
});
```

**2.17.U3 - Skill Suggestion Matching**
```typescript
import { matchSkills } from '@/hooks/context/skill-matcher';

test('triage intent suggests /triage skill', () => {
  const skills = matchSkills('Check my urgent emails');

  expect(skills).toContain('/triage');
});

test('scheduling intent suggests /schedule skill', () => {
  const skills = matchSkills('Find a time to meet with Alice');

  expect(skills).toContain('/schedule');
});

test('multiple intents suggest multiple skills', () => {
  const skills = matchSkills('Schedule a meeting and draft an email');

  expect(skills).toContain('/schedule');
  expect(skills).toContain('/draft');
});
```

### Integration Tests (tests/integration/story-2.17-*.spec.ts)

**2.17.I1 - Contact Name Triggers Memory Lookup**
```typescript
import { MemoryAwarenessHook } from '@/hooks/context/memory-awareness';

test('contact name triggers memory lookup', async () => {
  const hook = new MemoryAwarenessHook();
  const searchSpy = vi.spyOn(hook.memoryService, 'search');

  await hook.execute({
    userMessage: 'Schedule a meeting with John Smith tomorrow',
    sessionId: 'test-ctx-001',
  });

  expect(searchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.stringContaining('John Smith'),
    })
  );
});
```

**2.17.I2 - Project Name Triggers Project Context**
```typescript
test('project name triggers project context', async () => {
  const hook = new MemoryAwarenessHook();

  const result = await hook.execute({
    userMessage: 'What\'s the status of Project Phoenix?',
    sessionId: 'test-ctx-002',
  });

  expect(result.additionalContext).toBeDefined();
  expect(result.additionalContext).toContain('Project');
});
```

**2.17.I3 - Skill Suggestions Appear**
```typescript
test('skill suggestions appear for relevant prompts', async () => {
  const hook = new SkillActivationHook();

  const result = await hook.execute({
    userMessage: 'Check my inbox for urgent emails',
    sessionId: 'test-ctx-003',
  });

  expect(result.suggestedSkills).toBeDefined();
  expect(result.suggestedSkills).toContain('/triage');
});
```

**2.17.I4 - Context Respects Token Limits**
```typescript
test('context injection respects token limits', async () => {
  const hook = new MemoryAwarenessHook({ maxContextTokens: 1000 });

  // Mock large memory results
  vi.spyOn(hook.memoryService, 'search').mockResolvedValue({
    memories: Array(100).fill({ content: 'A'.repeat(500) }),
  });

  const result = await hook.execute({
    userMessage: 'Test query',
    sessionId: 'test-ctx-004',
  });

  const contextTokens = result.additionalContext.split(' ').length * 1.3;
  expect(contextTokens).toBeLessThan(1000);
  expect(result.truncated).toBe(true);
});
```

### E2E Tests (tests/e2e/story-2.17-*.spec.ts)

**2.17.E1 - Agent References Injected Context**
```typescript
test('agent references injected context in response', async ({ page }) => {
  // Pre-seed database with contact
  // ... (setup via test fixtures)

  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Schedule a meeting with John');
  await page.click('[data-testid="send-button"]');

  // Wait for response
  await page.waitForSelector('[data-testid="message-complete"]');

  // Agent should reference contact context
  const response = page.locator('[data-testid="agent-message"]').last();
  await expect(response).toContainText(/John|meeting|schedule/i);
});
```

**2.17.E2 - User Sees Acknowledgment**
```typescript
test('user sees "Orion remembers..." acknowledgment', async ({ page }) => {
  // Pre-seed with memory about the contact
  // ... (setup via test fixtures)

  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Draft an email to Alice');
  await page.click('[data-testid="send-button"]');

  // Wait for context injection indicator
  const contextIndicator = page.locator('[data-testid="context-injected"]');
  await expect(contextIndicator).toBeVisible();
  await expect(contextIndicator).toContainText(/remembered|context/i);
});
```

---

## Implementation Checklist

### Phase 1: Memory Awareness Hook
- [ ] Create `memory_awareness.py` in `.claude/hooks/`
- [ ] Implement entity extraction (contacts, emails, projects)
- [ ] Implement SQLite contact query
- [ ] Implement PostgreSQL memory query
- [ ] Implement token budget management
- [ ] Test with hook_launcher.py
- [ ] Register in settings.json

### Phase 2: Skill Activation Hook
- [ ] Create `skill-activation-prompt.sh` in `.claude/hooks/`
- [ ] Implement intent-to-skill mapping
- [ ] Implement preference query from SQLite
- [ ] Test skill suggestion accuracy
- [ ] Register in settings.json

### Phase 3: Context Assembly
- [ ] Implement context builder with priority ordering
- [ ] Implement token counting and truncation
- [ ] Add truncation logging for debugging
- [ ] Test with various input sizes

### Phase 4: PreToolUse Hooks
- [ ] Create `arch-context-inject.sh` for Read tool
- [ ] Create `edit-context-inject.sh` for Edit tool
- [ ] Implement tool-specific context injection
- [ ] Register with matcher in settings.json

### Phase 5: Integration and Testing
- [ ] Wire hooks into agent server
- [ ] Write unit tests for entity extraction
- [ ] Write integration tests with test database
- [ ] Write E2E tests for context visibility
- [ ] Test graceful degradation on database failure
- [ ] Test token limit enforcement

---

## Dev Notes

### Building on Story 2.16

This story extends session lifecycle hooks from Story 2.16 with prompt-time context injection. Key integration points:

1. **Session Context** - Session lifecycle hooks provide session state that context injection can reference
2. **HookRunner** - Use the same HookRunner for UserPromptSubmit events
3. **additionalContext** - Context hooks return via the same `additionalContext` mechanism
4. **Graceful Degradation** - Hooks must not block if databases are unavailable

### Entity Extraction Strategy

For MVP, use simple pattern matching:
- **Contact names**: Capitalized word sequences (2-3 words)
- **Email addresses**: Standard email regex
- **Project names**: Quoted strings, "Project X" patterns

Future enhancement: Use Claude to extract entities (more accurate but slower).

### Token Management

Token budget allocation:
- 500 tokens: Contact context (prioritized)
- 500 tokens: Project context
- 200 tokens: Skill suggestions
- 300 tokens: User preferences
- 500 tokens: Memory recall

Total budget: 2000 tokens (approximately 1500 words)

### Error Handling Pattern

```python
try:
    contacts = query_sqlite_contacts(entities, db_path)
except Exception as e:
    # Log but don't fail - graceful degradation
    contacts = []
    logging.warning(f"Contact query failed: {e}")
```

### Performance Considerations

- Entity extraction: < 10ms (regex only)
- SQLite queries: < 50ms each (indexed)
- PostgreSQL queries: < 100ms each (indexed, limited)
- Total hook execution: < 500ms target

---

## References

- **Previous Story:** `thoughts/implementation-artifacts/stories/story-2-16-session-lifecycle-hooks.md`
- **Test Design:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.17 section)
- **Architecture:** `thoughts/planning-artifacts/architecture.md` (Section 10 - Memory System)
- **Epics:** `thoughts/planning-artifacts/epics.md` (Story 2.17 definition)
- **PRD:** `thoughts/planning-artifacts/prd.md` (Section 5.1.11 - Memory/Recall System)

---

## Dev Agent Record

### Agent Model Used

_To be filled by Dev Agent_

### Debug Log References

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

_Files created/modified during implementation:_
- `.claude/hooks/memory_awareness.py`
- `.claude/hooks/skill-activation-prompt.sh`
- `.claude/hooks/arch-context-inject.sh`
- `.claude/hooks/edit-context-inject.sh`
- `.claude/settings.json` (hook registration)
- `agent-server/src/hooks/context/` (TypeScript types and utilities)
- `tests/unit/story-2.17-*.spec.ts`
- `tests/integration/story-2.17-*.spec.ts`
- `tests/e2e/story-2.17-*.spec.ts`

---

_Story created: 2026-01-16_
_Author: SM (Scrum Master Agent) - Bob_
_Comprehensive developer guide with context injection strategy and token management_
