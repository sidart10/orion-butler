# Story 2.18: Tool Routing Hooks

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-18-tool-routing-hooks
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a user,
I want intelligent tool routing,
So that searches and actions go to the right place automatically.

---

## Acceptance Criteria

### AC1: Smart Search Routing

**Given** an agent wants to search
**When** PreToolUse fires for a search tool
**Then** `smart-search-router` determines optimal search target
**And** routes to PARA search, contact search, or memory search
**And** combines results from multiple sources if appropriate

- [ ] PreToolUse event triggers `smart-search-router.sh` hook when tool is `Search`, `Grep`, or similar search tools
- [ ] Query analysis extracts search intent:
  ```
  Query Pattern Analysis:
  - Contact patterns: proper nouns, email addresses, "@mentions"
  - Project patterns: quoted text, "Project X", known project names
  - Email patterns: "email", "inbox", "from [name]"
  - Memory patterns: "what did I", "remember", "recall"
  - Calendar patterns: "meeting", "event", date references
  ```
- [ ] Routing decision matrix implemented:
  | Query Pattern | Primary Route | Secondary Routes |
  |---------------|---------------|------------------|
  | Contact name | `contacts` | `memory`, `inbox` |
  | Project name | `para_projects` | `para_tasks`, `inbox` |
  | "Find email..." | `gmail` via Composio | `inbox_items` |
  | "What did I..." | `memory_recall` | `action_log` |
  | Date reference | `google_calendar` | `tasks` |
  | Generic text | `para_all` | `memory` |
- [ ] Multi-source routing returns combined results with source attribution:
  ```json
  {
    "results": [
      {"source": "contacts", "item": {...}, "relevance": 0.95},
      {"source": "memory", "item": {...}, "relevance": 0.82}
    ],
    "routedTo": ["contacts", "memory"],
    "query": "John Smith"
  }
  ```
- [ ] Return routing decision in `additionalContext` for agent awareness

### AC2: File Access Routing

**Given** an agent wants to read a file
**When** PreToolUse fires for Read tool
**Then** router checks if it's a PARA document, email, or system file
**And** routes to appropriate handler
**And** injects relevant context for that file type

- [ ] PreToolUse event triggers `file-claims.sh` hook when tool is `Read` or `Write`
- [ ] File path classification:
  | Path Pattern | Classification | Handler |
  |--------------|----------------|---------|
  | `~/Library/Application Support/Orion/para/projects/*` | PARA Project | Project context injected |
  | `~/Library/Application Support/Orion/para/areas/*` | PARA Area | Area context injected |
  | `~/Library/Application Support/Orion/para/resources/*` | PARA Resource | Resource metadata |
  | `~/Library/Application Support/Orion/para/archive/*` | PARA Archive | Archive reason shown |
  | `*.eml` or email attachment paths | Email | Email thread context |
  | System paths (`.claude/`, `src/`, etc.) | System | Standard handling |
- [ ] For PARA documents, inject context:
  ```
  ## Document Context
  - Type: Project Document
  - Project: Q4 Planning
  - Last Modified: 2026-01-15
  - Related Tasks: 3 active
  ```
- [ ] Track file access in `file_claims` table for cross-session awareness:
  ```sql
  INSERT INTO file_claims (file_path, session_id, claimed_at, access_type)
  VALUES (?, ?, NOW(), 'read')
  ON CONFLICT (file_path, session_id) DO UPDATE SET claimed_at = NOW()
  ```
- [ ] `signature-helper.sh` adds function signatures for code files:
  ```
  ## Code Context
  File: src/lib/agent.ts
  Exports: AgentRunner, createAgent(), runAgent()
  Dependencies: @anthropic-ai/sdk, ./types
  ```

### AC3: Composio Tool Connection Checking

**Given** an agent wants to execute a Composio tool
**When** PreToolUse fires for composio_execute
**Then** router checks connection status for that tool
**And** prompts for connection if not authenticated
**And** applies rate limiting if approaching limits

- [ ] PreToolUse event triggers connection checker when tool is `composio_execute` or Composio-related
- [ ] Extract toolkit from tool input:
  ```typescript
  const toolkit = extractToolkit(input.action); // GMAIL_SEND_EMAIL → gmail
  ```
- [ ] Query Composio connection status:
  ```typescript
  const status = await composio.getConnectionStatus(toolkit);
  // Returns: { connected: boolean, lastRefresh: Date, expiresAt?: Date }
  ```
- [ ] If disconnected, return deny with connection prompt:
  ```json
  {
    "permissionDecision": "deny",
    "message": "Gmail is not connected. Please connect to continue.",
    "action": "prompt_oauth",
    "toolkit": "gmail",
    "oauthUrl": "https://composio.dev/oauth/gmail?..."
  }
  ```
- [ ] Rate limiting implementation:
  ```typescript
  const rateLimits = {
    gmail: { perMinute: 10, perHour: 100 },
    google_calendar: { perMinute: 20, perHour: 200 },
    slack: { perMinute: 30, perHour: 500 }
  };

  const usage = await getToolUsage(toolkit, sessionId);
  if (usage.lastMinute >= rateLimits[toolkit].perMinute) {
    return {
      permissionDecision: "deny",
      message: `Rate limit reached for ${toolkit}. Try again in 1 minute.`,
      retryAfter: 60
    };
  }
  ```
- [ ] Track tool usage in SQLite:
  ```sql
  INSERT INTO tool_usage (toolkit, session_id, timestamp, action)
  VALUES (?, ?, datetime('now'), ?)
  ```
- [ ] Log approaching rate limits as warnings in `additionalContext`:
  ```
  ## Rate Limit Warning
  Gmail: 8/10 calls this minute (80% of limit)
  Consider batching operations.
  ```

### AC4: Path Convention Enforcement

**Given** an agent attempts to write to a file
**When** PreToolUse fires for Write or Edit tool
**Then** `path-rules.sh` enforces path conventions
**And** suggests correct path if violation detected
**And** prevents writes to protected paths

- [ ] PreToolUse event triggers `path-rules.sh` for Write/Edit tools
- [ ] Path convention rules:
  | Rule | Pattern | Action |
  |------|---------|--------|
  | PARA structure | `/para/[category]/` | Enforce category exists |
  | No root writes | `/` or `~` direct | Deny with suggestion |
  | Protected paths | `.claude/`, `node_modules/`, `.git/` | Deny unless explicit |
  | Extension match | Content type → extension | Warn on mismatch |
- [ ] Path suggestion for violations:
  ```json
  {
    "permissionDecision": "deny",
    "message": "Cannot write to root directory. Suggested path: ~/Library/Application Support/Orion/para/projects/q4-planning/notes.md",
    "suggestedPath": "~/Library/Application Support/Orion/para/projects/q4-planning/notes.md",
    "reason": "PARA_STRUCTURE"
  }
  ```
- [ ] Protected path detection with override capability:
  ```json
  {
    "permissionDecision": "ask",
    "message": "Writing to .claude/ directory requires confirmation. This is a protected system directory.",
    "requiresExplicitApproval": true
  }
  ```
- [ ] Configurable rules via `.orion/path-rules.yaml`:
  ```yaml
  rules:
    - pattern: "*.secret"
      action: deny
      message: "Cannot write to secret files"
    - pattern: "/para/archive/*"
      action: warn
      message: "Writing to archive - did you mean a project?"
  ```

---

## Tasks / Subtasks

### Task 1: Create Smart Search Router (AC: #1)

- [ ] 1.1 Create `src/hooks/routing/smart-search.ts` - SmartSearchRouter class
- [ ] 1.2 Implement `route(input: SearchInput): Promise<RouteResult>` method
- [ ] 1.3 Implement `determineTargets(query: string): string[]` for pattern matching
- [ ] 1.4 Create routing decision matrix:
  - Contact patterns: names, email addresses, "who", "contact"
  - Project patterns: project names, "project", "task", "deadline"
  - Email patterns: "email", "message from", "thread"
  - Calendar patterns: dates, "meeting", "schedule", "event"
  - Memory patterns: "what did I", "remember", "previously"
- [ ] 1.5 Implement result merging with relevance scoring

### Task 2: Create File Type Router (AC: #2)

- [ ] 2.1 Create `src/hooks/routing/file-router.ts` - FileRouter class
- [ ] 2.2 Implement path pattern matching for PARA structure
- [ ] 2.3 Create file type detection:
  - PARA documents: `~/Orion/(projects|areas|resources|archive)/*`
  - Email exports: `*.eml`, `.email-cache/*`
  - System configs: `.claude/*`, `*.config.*`
- [ ] 2.4 Implement context injection per file type
- [ ] 2.5 Add permission checks for system files

### Task 3: Create Composio Connection Checker (AC: #3)

- [ ] 3.1 Create `src/hooks/routing/composio-checker.ts` - ComposioConnectionChecker class
- [ ] 3.2 Implement `checkConnection(toolkit: string): Promise<ConnectionStatus>`
- [ ] 3.3 Implement `execute(input: ToolInput): Promise<HookResult>`:
  - Check connection status
  - Return deny + OAuth prompt if disconnected
  - Apply rate limiting if connected
- [ ] 3.4 Create rate limiter per toolkit:
  - Gmail: 60 requests/minute, burst 10
  - Calendar: 100 requests/minute, burst 20
  - Slack: 50 requests/minute, burst 10
  - Drive: 100 requests/minute, burst 20
- [ ] 3.5 Implement graceful degradation messages

### Task 4: Create Hook Registration (AC: #1, #2, #3)

- [ ] 4.1 Create `src/hooks/routing/index.ts` - export all routers
- [ ] 4.2 Create shell scripts for hook execution:
  - `.claude/hooks/smart-search-router.sh`
  - `.claude/hooks/file-claims.sh`
  - `.claude/hooks/path-rules.sh`
  - `.claude/hooks/signature-helper.sh`
- [ ] 4.3 Register hooks in `.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      { "command": "hooks/smart-search-router.sh", "timeout": 5000 },
      { "command": "hooks/file-claims.sh", "timeout": 3000 },
      { "command": "hooks/path-rules.sh", "timeout": 2000 }
    ]
  }
}
```
- [ ] 4.4 Ensure hooks are executable (`chmod +x`)

### Task 5: Create Routing Configuration (AC: #4)

- [ ] 5.1 Create `.claude/config/routing-rules.json`:
```json
{
  "search": {
    "contact": {
      "patterns": ["email address", "phone", "contact", "who is"],
      "targets": ["contacts", "memory"]
    },
    "project": {
      "patterns": ["project", "task", "deadline", "progress"],
      "targets": ["para_projects", "para_tasks"]
    },
    "email": {
      "patterns": ["email", "message from", "thread", "inbox"],
      "targets": ["gmail"]
    },
    "calendar": {
      "patterns": ["meeting", "schedule", "event", "available"],
      "targets": ["google_calendar", "para_tasks"]
    },
    "memory": {
      "patterns": ["remember", "what did I", "previously", "last time"],
      "targets": ["memory", "sessions"]
    }
  },
  "rateLimits": {
    "gmail": { "requestsPerMinute": 60, "burstLimit": 10 },
    "google_calendar": { "requestsPerMinute": 100, "burstLimit": 20 },
    "slack": { "requestsPerMinute": 50, "burstLimit": 10 },
    "google_drive": { "requestsPerMinute": 100, "burstLimit": 20 }
  }
}
```
- [ ] 5.2 Create `src/hooks/routing/config.ts` - configuration loader
- [ ] 5.3 Implement config hot-reload for development
- [ ] 5.4 Add validation for configuration schema

### Task 6: Write Tests (AC: #1, #2, #3, #4)

- [ ] 6.1 Unit test: Contact query routes to contact search
- [ ] 6.2 Unit test: Project query routes to PARA search
- [ ] 6.3 Unit test: Routing rules are configurable
- [ ] 6.4 Integration test: Combined search returns from multiple sources
- [ ] 6.5 Integration test: Disconnected tool prompts for connection
- [ ] 6.6 E2E test: Rate limiting prevents 429 errors

---

## Technical Notes

### Tool Routing Hooks (4 total)

| Hook | Event | Purpose | Timeout |
|------|-------|---------|---------|
| `smart-search-router.sh` | PreToolUse | Route searches to optimal targets | 3000ms |
| `file-claims.sh` | PreToolUse | Track file access, inject PARA context | 2000ms |
| `signature-helper.sh` | PreToolUse | Add function signatures for code files | 3000ms |
| `path-rules.sh` | PreToolUse | Enforce path conventions | 1000ms |

### Routing Decision Flow

```
Agent wants to execute tool
            |
            v
     PreToolUse fires
            |
            v
+-------------------------+
|   Identify Tool Type    |
+-------------------------+
     |           |          |
     v           v          v
Search       Read/Write   Composio
  |              |           |
  v              v           v
smart-search   file-claims  composio-checker
     |              |           |
     v              v           v
Route to        Classify      Check connection
data sources    file type     & rate limits
     |              |           |
     v              v           v
Combine         Inject        Allow/Deny
results         context       with message
     |              |           |
     +-------+------+           |
             |                  |
             v                  v
      additionalContext    permissionDecision
```

### smart-search-router.sh Implementation

```bash
#!/usr/bin/env bash
# smart-search-router.sh - Route searches to optimal data sources

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.input // empty')

# Only handle search-related tools
case "$TOOL" in
    Search|Grep|Read) ;;
    *) echo '{"permissionDecision": "allow"}'; exit 0 ;;
esac

# Extract query from input
QUERY=$(echo "$TOOL_INPUT" | jq -r '.query // .pattern // .file_path // empty')
QUERY_LOWER=$(echo "$QUERY" | tr '[:upper:]' '[:lower:]')

# Configuration
SQLITE_DB="$HOME/Library/Application Support/Orion/orion.db"
DATABASE_URL="${DATABASE_URL:-postgresql://claude:claude_dev@localhost:5432/continuous_claude}"

ROUTES=""
CONTEXT_PARTS=""

# Detect contact patterns (capitalized names, emails)
if echo "$QUERY" | grep -qE '\b[A-Z][a-z]+(\s[A-Z][a-z]+)?\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+'; then
    ROUTES="$ROUTES,contacts"

    # Extract potential contact name
    CONTACT_NAME=$(echo "$QUERY" | grep -oE '\b[A-Z][a-z]+(\s[A-Z][a-z]+)?' | head -1 || true)

    if [ -n "$CONTACT_NAME" ] && [ -f "$SQLITE_DB" ]; then
        CONTACT_INFO=$(sqlite3 "$SQLITE_DB" "
            SELECT name, email, relationship
            FROM contacts
            WHERE name LIKE '%$CONTACT_NAME%'
            LIMIT 1
        " 2>/dev/null || echo "")

        if [ -n "$CONTACT_INFO" ]; then
            CONTEXT_PARTS="$CONTEXT_PARTS
## Contact Found
$(echo "$CONTACT_INFO" | awk -F'|' '{print "- Name: " $1 "\n- Email: " $2 "\n- Relationship: " $3}')"
        fi
    fi
fi

# Detect project patterns (quoted text, "Project X")
if echo "$QUERY" | grep -qEi 'project|"[^"]+"'; then
    ROUTES="$ROUTES,para_projects,para_tasks"
fi

# Detect email patterns
if echo "$QUERY_LOWER" | grep -qE 'email|inbox|from |sent to|gmail'; then
    ROUTES="$ROUTES,gmail,inbox_items"
fi

# Detect memory/recall patterns
if echo "$QUERY_LOWER" | grep -qE 'what did i|remember|recall|history|past'; then
    ROUTES="$ROUTES,memory_recall,action_log"
fi

# Detect calendar patterns
if echo "$QUERY_LOWER" | grep -qE 'meeting|calendar|event|schedule|appointment|tomorrow|next week|monday|tuesday|wednesday|thursday|friday'; then
    ROUTES="$ROUTES,google_calendar,tasks"
fi

# Default routing for generic queries
if [ -z "$ROUTES" ]; then
    ROUTES="para_all,memory"
fi

# Clean up routes (remove leading comma)
ROUTES=$(echo "$ROUTES" | sed 's/^,//')

# Build context
if [ -n "$CONTEXT_PARTS" ]; then
    CONTEXT="## Search Routing Decision
- Query: $QUERY
- Routes: $ROUTES
$CONTEXT_PARTS"
else
    CONTEXT="## Search Routing Decision
- Query: $QUERY
- Routes: $ROUTES"
fi

# Output result
jq -n \
    --arg ctx "$CONTEXT" \
    --arg routes "$ROUTES" \
    '{
        "permissionDecision": "allow",
        "additionalContext": $ctx,
        "routing": {
            "routes": ($routes | split(",")),
            "query": "'"$QUERY"'"
        }
    }'
```

### file-claims.sh Implementation

```bash
#!/usr/bin/env bash
# file-claims.sh - Track file access and inject PARA context

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.input.file_path // .input.path // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.sessionId // "unknown"')

# Only handle Read/Write tools
case "$TOOL" in
    Read|Write|Edit) ;;
    *) echo '{"permissionDecision": "allow"}'; exit 0 ;;
esac

if [ -z "$FILE_PATH" ]; then
    echo '{"permissionDecision": "allow"}'
    exit 0
fi

# Expand path
FILE_PATH=$(eval echo "$FILE_PATH")
SQLITE_DB="$HOME/Library/Application Support/Orion/orion.db"
PARA_ROOT="$HOME/Library/Application Support/Orion/para"
CONTEXT_PARTS=""

# Classify file type and inject context
case "$FILE_PATH" in
    "$PARA_ROOT/projects/"*)
        PROJECT_NAME=$(echo "$FILE_PATH" | sed "s|$PARA_ROOT/projects/||" | cut -d'/' -f1)
        CONTEXT_PARTS="## PARA Document Context
- Type: Project Document
- Project: $PROJECT_NAME"

        # Get project details from SQLite if available
        if [ -f "$SQLITE_DB" ]; then
            PROJECT_INFO=$(sqlite3 "$SQLITE_DB" "
                SELECT status, deadline, stakeholders
                FROM projects
                WHERE name LIKE '%$PROJECT_NAME%'
                LIMIT 1
            " 2>/dev/null || echo "")

            if [ -n "$PROJECT_INFO" ]; then
                STATUS=$(echo "$PROJECT_INFO" | cut -d'|' -f1)
                DEADLINE=$(echo "$PROJECT_INFO" | cut -d'|' -f2)
                CONTEXT_PARTS="$CONTEXT_PARTS
- Status: ${STATUS:-active}
- Deadline: ${DEADLINE:-not set}"
            fi
        fi
        ;;

    "$PARA_ROOT/areas/"*)
        AREA_NAME=$(echo "$FILE_PATH" | sed "s|$PARA_ROOT/areas/||" | cut -d'/' -f1)
        CONTEXT_PARTS="## PARA Document Context
- Type: Area Document
- Area: $AREA_NAME"
        ;;

    "$PARA_ROOT/resources/"*)
        RESOURCE_NAME=$(echo "$FILE_PATH" | sed "s|$PARA_ROOT/resources/||" | cut -d'/' -f1)
        CONTEXT_PARTS="## PARA Document Context
- Type: Resource Document
- Resource: $RESOURCE_NAME"
        ;;

    "$PARA_ROOT/archive/"*)
        ARCHIVE_NAME=$(echo "$FILE_PATH" | sed "s|$PARA_ROOT/archive/||" | cut -d'/' -f1)
        CONTEXT_PARTS="## PARA Document Context
- Type: Archived Document
- Archive: $ARCHIVE_NAME
- Note: This is archived content. Check if it's still relevant."
        ;;

    *.eml)
        CONTEXT_PARTS="## Email Document
- Type: Email Message
- File: $(basename "$FILE_PATH")"
        ;;
esac

# Record file claim for cross-session awareness
if [ -f "$SQLITE_DB" ]; then
    sqlite3 "$SQLITE_DB" "
        INSERT OR REPLACE INTO file_claims (file_path, session_id, claimed_at, access_type)
        VALUES ('$FILE_PATH', '$SESSION_ID', datetime('now'), '$TOOL')
    " 2>/dev/null || true
fi

# Output result
if [ -n "$CONTEXT_PARTS" ]; then
    jq -n \
        --arg ctx "$CONTEXT_PARTS" \
        '{
            "permissionDecision": "allow",
            "additionalContext": $ctx,
            "message": "File context injected"
        }'
else
    echo '{"permissionDecision": "allow"}'
fi
```

### composio_connection_checker.py Implementation

```python
#!/usr/bin/env python3
"""
composio_connection_checker.py - Check Composio tool connections and rate limits.

Validates that external service connections are active before tool execution.
"""
import json
import sys
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Optional


# Toolkit mapping from action names
TOOLKIT_MAP = {
    'GMAIL_': 'gmail',
    'GOOGLECALENDAR_': 'google_calendar',
    'SLACK_': 'slack',
    'LINEAR_': 'linear',
    'NOTION_': 'notion',
    'GITHUB_': 'github',
}

# Rate limits per toolkit
RATE_LIMITS = {
    'gmail': {'per_minute': 10, 'per_hour': 100},
    'google_calendar': {'per_minute': 20, 'per_hour': 200},
    'slack': {'per_minute': 30, 'per_hour': 500},
    'linear': {'per_minute': 50, 'per_hour': 1000},
    'notion': {'per_minute': 30, 'per_hour': 300},
    'github': {'per_minute': 30, 'per_hour': 500},
}


def extract_toolkit(action: str) -> Optional[str]:
    """Extract toolkit name from action string."""
    for prefix, toolkit in TOOLKIT_MAP.items():
        if action.startswith(prefix):
            return toolkit
    return None


def check_connection_status(toolkit: str) -> dict:
    """Check if toolkit is connected via Composio."""
    # In real implementation, this would query Composio API
    # For now, check local connection cache
    cache_dir = os.path.expanduser('~/.orion/composio')
    cache_file = os.path.join(cache_dir, f'{toolkit}_connection.json')

    if not os.path.exists(cache_file):
        return {'connected': False, 'reason': 'no_connection_found'}

    try:
        with open(cache_file) as f:
            data = json.load(f)

        # Check if token is expired
        expires_at = data.get('expires_at')
        if expires_at:
            expires = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            if expires < datetime.now(expires.tzinfo):
                return {'connected': False, 'reason': 'token_expired'}

        return {
            'connected': True,
            'last_refresh': data.get('last_refresh'),
            'expires_at': expires_at
        }
    except Exception:
        return {'connected': False, 'reason': 'connection_check_failed'}


def get_usage_counts(toolkit: str, session_id: str, db_path: str) -> dict:
    """Get tool usage counts for rate limiting."""
    counts = {'last_minute': 0, 'last_hour': 0}

    if not os.path.exists(db_path):
        return counts

    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        # Ensure table exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tool_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                toolkit TEXT NOT NULL,
                session_id TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                action TEXT
            )
        """)

        # Count last minute
        cur.execute("""
            SELECT COUNT(*) FROM tool_usage
            WHERE toolkit = ?
              AND timestamp > datetime('now', '-1 minute')
        """, (toolkit,))
        counts['last_minute'] = cur.fetchone()[0]

        # Count last hour
        cur.execute("""
            SELECT COUNT(*) FROM tool_usage
            WHERE toolkit = ?
              AND timestamp > datetime('now', '-1 hour')
        """, (toolkit,))
        counts['last_hour'] = cur.fetchone()[0]

        conn.close()
    except Exception:
        pass

    return counts


def record_usage(toolkit: str, session_id: str, action: str, db_path: str):
    """Record tool usage for rate limiting."""
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO tool_usage (toolkit, session_id, action)
            VALUES (?, ?, ?)
        """, (toolkit, session_id, action))

        conn.commit()
        conn.close()
    except Exception:
        pass


def run(payload: dict) -> dict:
    """Main hook execution."""
    tool = payload.get('tool', '')
    tool_input = payload.get('input', {})
    session_id = payload.get('sessionId', 'unknown')

    # Only handle Composio tools
    if tool != 'composio_execute' and not tool.startswith('COMPOSIO_'):
        return {"permissionDecision": "allow"}

    # Extract action and toolkit
    action = tool_input.get('action', '')
    toolkit = extract_toolkit(action)

    if not toolkit:
        return {"permissionDecision": "allow"}

    # Configuration
    db_path = os.path.expanduser('~/Library/Application Support/Orion/orion.db')

    # Check connection status
    status = check_connection_status(toolkit)

    if not status['connected']:
        oauth_url = f"https://composio.dev/oauth/{toolkit}"
        return {
            "permissionDecision": "deny",
            "message": f"{toolkit.replace('_', ' ').title()} is not connected. Please connect to continue.",
            "action": "prompt_oauth",
            "toolkit": toolkit,
            "oauthUrl": oauth_url,
            "reason": status.get('reason', 'not_connected')
        }

    # Check rate limits
    limits = RATE_LIMITS.get(toolkit, {'per_minute': 30, 'per_hour': 300})
    usage = get_usage_counts(toolkit, session_id, db_path)

    if usage['last_minute'] >= limits['per_minute']:
        return {
            "permissionDecision": "deny",
            "message": f"Rate limit reached for {toolkit}. Try again in 1 minute.",
            "retryAfter": 60,
            "usage": usage,
            "limits": limits
        }

    if usage['last_hour'] >= limits['per_hour']:
        return {
            "permissionDecision": "deny",
            "message": f"Hourly rate limit reached for {toolkit}. Try again later.",
            "retryAfter": 3600,
            "usage": usage,
            "limits": limits
        }

    # Record this usage
    record_usage(toolkit, session_id, action, db_path)

    # Build context with warnings if approaching limits
    context = ""
    minute_pct = (usage['last_minute'] + 1) / limits['per_minute'] * 100
    hour_pct = (usage['last_hour'] + 1) / limits['per_hour'] * 100

    if minute_pct >= 70 or hour_pct >= 80:
        context = f"""## Rate Limit Warning
- {toolkit}: {usage['last_minute'] + 1}/{limits['per_minute']} calls this minute ({minute_pct:.0f}%)
- Hourly: {usage['last_hour'] + 1}/{limits['per_hour']} calls ({hour_pct:.0f}%)
Consider batching operations."""

    result = {
        "permissionDecision": "allow",
        "message": f"Connection verified for {toolkit}"
    }

    if context:
        result["additionalContext"] = context

    return result


if __name__ == "__main__":
    payload = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}
    result = run(payload)
    print(json.dumps(result))
```

### path-rules.sh Implementation

```bash
#!/usr/bin/env bash
# path-rules.sh - Enforce path conventions and protect system directories

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.input.file_path // .input.path // empty')

# Only handle Write/Edit tools
case "$TOOL" in
    Write|Edit) ;;
    *) echo '{"permissionDecision": "allow"}'; exit 0 ;;
esac

if [ -z "$FILE_PATH" ]; then
    echo '{"permissionDecision": "allow"}'
    exit 0
fi

# Expand path
FILE_PATH=$(eval echo "$FILE_PATH")
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
PARA_ROOT="$HOME/Library/Application Support/Orion/para"

# Protected paths - deny without explicit approval
PROTECTED_PATHS=(
    ".claude/"
    "node_modules/"
    ".git/"
    "dist/"
    "build/"
    ".next/"
    "src-tauri/target/"
)

# Check protected paths
for protected in "${PROTECTED_PATHS[@]}"; do
    if echo "$FILE_PATH" | grep -qE "^($PROJECT_DIR/)?$protected"; then
        jq -n \
            --arg path "$FILE_PATH" \
            --arg protected "$protected" \
            '{
                "permissionDecision": "ask",
                "message": ("Writing to " + $protected + " directory requires confirmation. This is a protected system directory."),
                "requiresExplicitApproval": true,
                "reason": "PROTECTED_PATH"
            }'
        exit 0
    fi
done

# Deny direct root writes
if echo "$FILE_PATH" | grep -qE '^(/|~/)$'; then
    jq -n \
        --arg path "$FILE_PATH" \
        '{
            "permissionDecision": "deny",
            "message": "Cannot write directly to root or home directory.",
            "reason": "ROOT_WRITE"
        }'
    exit 0
fi

# Check PARA structure for para/ paths
if echo "$FILE_PATH" | grep -qE "$PARA_ROOT"; then
    # Validate PARA category
    VALID_CATEGORIES=("projects" "areas" "resources" "archive")
    PARA_VALID=false

    for category in "${VALID_CATEGORIES[@]}"; do
        if echo "$FILE_PATH" | grep -qE "$PARA_ROOT/$category/"; then
            PARA_VALID=true
            break
        fi
    done

    if [ "$PARA_VALID" = false ]; then
        SUGGESTED_PATH="$PARA_ROOT/resources/$(basename "$FILE_PATH")"
        jq -n \
            --arg path "$FILE_PATH" \
            --arg suggested "$SUGGESTED_PATH" \
            '{
                "permissionDecision": "deny",
                "message": "PARA path must include a valid category (projects, areas, resources, archive).",
                "suggestedPath": $suggested,
                "reason": "PARA_STRUCTURE"
            }'
        exit 0
    fi
fi

# Check for secret files
if echo "$FILE_PATH" | grep -qiE '\.(secret|key|pem|env\.local)$'; then
    jq -n \
        --arg path "$FILE_PATH" \
        '{
            "permissionDecision": "deny",
            "message": "Cannot write to secret/sensitive files. Use secure storage instead.",
            "reason": "SENSITIVE_FILE"
        }'
    exit 0
fi

# Archive write warning
if echo "$FILE_PATH" | grep -qE "$PARA_ROOT/archive/"; then
    jq -n \
        --arg path "$FILE_PATH" \
        '{
            "permissionDecision": "ask",
            "message": "Writing to archive directory. Did you mean to write to a project instead?",
            "reason": "ARCHIVE_WRITE"
        }'
    exit 0
fi

# All checks passed
echo '{"permissionDecision": "allow"}'
```

### signature-helper.sh Implementation

```bash
#!/usr/bin/env bash
# signature-helper.sh - Add function signatures and code context for Read operations

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.input.file_path // empty')

# Only handle Read tool for code files
if [ "$TOOL" != "Read" ]; then
    echo '{"permissionDecision": "allow"}'
    exit 0
fi

if [ -z "$FILE_PATH" ]; then
    echo '{"permissionDecision": "allow"}'
    exit 0
fi

# Expand path
FILE_PATH=$(eval echo "$FILE_PATH")

# Only process code files
case "${FILE_PATH##*.}" in
    ts|tsx|js|jsx|py|rs|go) ;;
    *) echo '{"permissionDecision": "allow"}'; exit 0 ;;
esac

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo '{"permissionDecision": "allow"}'
    exit 0
fi

CONTEXT_PARTS="## Code Context
File: $FILE_PATH"

# Extract exports/functions based on language
case "${FILE_PATH##*.}" in
    ts|tsx|js|jsx)
        # TypeScript/JavaScript exports
        EXPORTS=$(grep -E '^export\s+(const|function|class|interface|type|async function)' "$FILE_PATH" 2>/dev/null | head -10 | sed 's/export\s*//' | sed 's/{.*//' | sed 's/=.*//' | tr '\n' ', ' || true)
        if [ -n "$EXPORTS" ]; then
            CONTEXT_PARTS="$CONTEXT_PARTS
Exports: ${EXPORTS%, }"
        fi

        # Dependencies
        DEPS=$(grep -E "^import.*from\s+['\"]" "$FILE_PATH" 2>/dev/null | sed "s/.*from\s*['\"]//;s/['\"].*//" | sort -u | head -5 | tr '\n' ', ' || true)
        if [ -n "$DEPS" ]; then
            CONTEXT_PARTS="$CONTEXT_PARTS
Dependencies: ${DEPS%, }"
        fi
        ;;

    py)
        # Python functions and classes
        DEFS=$(grep -E '^(def|class|async def)\s+\w+' "$FILE_PATH" 2>/dev/null | head -10 | sed 's/(.*/:/' | tr '\n' ', ' || true)
        if [ -n "$DEFS" ]; then
            CONTEXT_PARTS="$CONTEXT_PARTS
Definitions: ${DEFS%, }"
        fi

        # Imports
        IMPORTS=$(grep -E '^(import|from)\s+' "$FILE_PATH" 2>/dev/null | head -5 | tr '\n' '; ' || true)
        if [ -n "$IMPORTS" ]; then
            CONTEXT_PARTS="$CONTEXT_PARTS
Imports: ${IMPORTS%; }"
        fi
        ;;

    rs)
        # Rust functions and structs
        DEFS=$(grep -E '^pub\s+(fn|struct|enum|trait|impl)\s+\w+' "$FILE_PATH" 2>/dev/null | head -10 | sed 's/{.*//' | tr '\n' ', ' || true)
        if [ -n "$DEFS" ]; then
            CONTEXT_PARTS="$CONTEXT_PARTS
Public Items: ${DEFS%, }"
        fi
        ;;

    go)
        # Go functions and types
        DEFS=$(grep -E '^func\s+\w+|^type\s+\w+' "$FILE_PATH" 2>/dev/null | head -10 | sed 's/{.*//' | tr '\n' ', ' || true)
        if [ -n "$DEFS" ]; then
            CONTEXT_PARTS="$CONTEXT_PARTS
Definitions: ${DEFS%, }"
        fi
        ;;
esac

# Get file size and line count
LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')
CONTEXT_PARTS="$CONTEXT_PARTS
Lines: $LINE_COUNT"

# Output result
jq -n \
    --arg ctx "$CONTEXT_PARTS" \
    '{
        "permissionDecision": "allow",
        "additionalContext": $ctx,
        "message": "Code signatures added"
    }'
```

### settings.json Hook Registration

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "command": "smart-search-router.sh",
        "timeout": 3000,
        "matcher": {
          "tool": ["Search", "Grep"]
        }
      },
      {
        "command": "file-claims.sh",
        "timeout": 2000,
        "matcher": {
          "tool": ["Read", "Write", "Edit"]
        }
      },
      {
        "command": "signature-helper.sh",
        "timeout": 3000,
        "matcher": {
          "tool": "Read"
        }
      },
      {
        "command": "path-rules.sh",
        "timeout": 1000,
        "matcher": {
          "tool": ["Write", "Edit"]
        }
      },
      {
        "command": "uv run python hook_launcher.py composio_connection_checker.py",
        "timeout": 5000,
        "matcher": {
          "tool": "composio_execute"
        }
      }
    ]
  }
}
```

### Hook Result Schema

```typescript
interface HookResult {
  // Permission decision
  permissionDecision?: 'allow' | 'deny' | 'ask';

  // For denied requests
  reason?: string;
  action?: 'prompt_oauth' | 'rate_limited' | 'blocked';

  // For routed requests
  routedTargets?: string[];
  primaryTarget?: string;

  // Context injection
  additionalContext?: string;

  // Rate limiting info
  rateLimitInfo?: {
    remaining: number;
    resetAt: string;
  };
}
```

### File Structure Requirements

```
agent-server/
  src/
    hooks/
      routing/
        index.ts                 # Export all routers
        smart-search.ts          # SmartSearchRouter class
        file-router.ts           # FileRouter class
        composio-checker.ts      # ComposioConnectionChecker class
        rate-limiter.ts          # RateLimiter class
        config.ts                # Configuration loader
        types.ts                 # TypeScript interfaces

.claude/
  hooks/
    smart-search-router.sh     # Shell wrapper for routing hook
    file-claims.sh             # File access tracking hook
    path-rules.sh              # Path convention enforcement
    signature-helper.sh        # Function signature injection
    composio_connection_checker.py  # Python connection checker
  config/
    routing-rules.json         # Configurable routing rules

tests/
  unit/
    story-2.18-*.spec.ts
  integration/
    story-2.18-*.spec.ts
  e2e/
    story-2.18-*.spec.ts
```

### Integration Points

**With Story 2.15 (Hook Infrastructure Foundation):**
- Uses `HookRunner` from hook infrastructure
- Follows hook lifecycle events (PreToolUse)
- Honors hook timeout settings

**With Story 2.17 (Context Injection Hooks):**
- Routing hooks fire BEFORE context injection
- Routing determines targets, context injection enriches

**With Epic 3 (Tool Connections):**
- ComposioConnectionChecker uses connection status from Epic 3
- Rate limits apply to Composio tools

### Critical Design Constraints

1. **Routing hooks MUST be fast** - Timeout of 5 seconds max
2. **Rate limiting is per-toolkit** - Different limits for Gmail vs Calendar
3. **Graceful degradation** - Never block user completely, show recovery options
4. **Configurable rules** - No hardcoded patterns in TypeScript
5. **Combined search** - Default to merging results, not exclusive routing
6. **OAuth prompt** - Disconnected tools return structured OAuth action

---

## Test Considerations

### Unit Tests (tests/unit/story-2.18-*.spec.ts)

**2.18.U1 - Query Pattern Detection**
```typescript
import { detectQueryPatterns, determineRoutes } from '@/hooks/routing/search-router';

test('detects contact pattern in query', () => {
  const patterns = detectQueryPatterns('Find John Smith email address');

  expect(patterns.contact).toBe(true);
  expect(patterns.contactName).toBe('John Smith');
});

test('detects email query pattern', () => {
  const patterns = detectQueryPatterns('Find emails from last week');

  expect(patterns.email).toBe(true);
});

test('detects calendar pattern', () => {
  const patterns = detectQueryPatterns('What meetings do I have tomorrow');

  expect(patterns.calendar).toBe(true);
});

test('determines correct routes for contact query', () => {
  const routes = determineRoutes({ contact: true, contactName: 'John' });

  expect(routes).toContain('contacts');
  expect(routes).toContain('memory');
});
```

**2.18.U2 - File Classification**
```typescript
import { classifyFilePath, injectFileContext } from '@/hooks/routing/file-claims';

test('classifies PARA project path', () => {
  const classification = classifyFilePath(
    '~/Library/Application Support/Orion/para/projects/q4-planning/notes.md'
  );

  expect(classification.type).toBe('para_project');
  expect(classification.projectName).toBe('q4-planning');
});

test('classifies email file', () => {
  const classification = classifyFilePath('/tmp/email-12345.eml');

  expect(classification.type).toBe('email');
});

test('classifies system file', () => {
  const classification = classifyFilePath('.claude/settings.json');

  expect(classification.type).toBe('system');
  expect(classification.protected).toBe(true);
});
```

**2.18.U3 - Path Rule Validation**
```typescript
import { validatePath, checkProtectedPath } from '@/hooks/routing/path-rules';

test('rejects root directory write', () => {
  const result = validatePath('/', 'Write');

  expect(result.allowed).toBe(false);
  expect(result.reason).toBe('ROOT_WRITE');
});

test('asks for confirmation on protected path', () => {
  const result = validatePath('.claude/settings.json', 'Write');

  expect(result.decision).toBe('ask');
  expect(result.requiresExplicitApproval).toBe(true);
});

test('suggests correct PARA path', () => {
  const result = validatePath(
    '~/Library/Application Support/Orion/para/notes.md',
    'Write'
  );

  expect(result.allowed).toBe(false);
  expect(result.suggestedPath).toContain('/resources/');
});
```

**2.18.U4 - Routing Rules Configurability**
```typescript
import { SmartSearchRouter } from '@/hooks/routing/smart-search';

test('uses custom routing rules', () => {
  const router = new SmartSearchRouter({
    rules: {
      'email': ['gmail', 'contacts'],
      'calendar': ['google_calendar', 'para_tasks'],
    },
  });

  const result = router.determineTargets('Find recent email from client');

  expect(result).toContain('gmail');
  expect(result).toContain('contacts');
});
```

### Integration Tests (tests/integration/story-2.18-*.spec.ts)

**2.18.I1 - Contact Query Routes to Contact Search**
```typescript
import { SmartSearchRouter } from '@/hooks/routing/smart-search';

test('contact query routes to contact search', async () => {
  const router = new SmartSearchRouter();

  const result = await router.route({
    tool: 'Search',
    input: { query: 'Find John Smith email address' },
  });

  expect(result.targets).toContain('contacts');
  expect(result.primary).toBe('contacts');
});
```

**2.18.I2 - Project Query Routes to PARA Search**
```typescript
test('project query routes to PARA search', async () => {
  const router = new SmartSearchRouter();

  const result = await router.route({
    tool: 'Search',
    input: { query: 'Project Phoenix timeline' },
  });

  expect(result.targets).toContain('para_projects');
  expect(result.targets).toContain('para_tasks');
});
```

**2.18.I3 - Disconnected Tool Prompts for Connection**
```typescript
import { ComposioConnectionChecker } from '@/hooks/routing/composio-checker';

test('disconnected tool prompts for connection', async () => {
  const checker = new ComposioConnectionChecker();

  // Mock disconnected state
  vi.spyOn(checker, 'checkConnection').mockResolvedValue({
    connected: false,
    reason: 'no_connection_found'
  });

  const result = await checker.execute({
    tool: 'composio_execute',
    input: { action: 'GMAIL_FETCH_EMAILS' },
  });

  expect(result.permissionDecision).toBe('deny');
  expect(result.message).toContain('not connected');
  expect(result.action).toBe('prompt_oauth');
  expect(result.oauthUrl).toBeDefined();
});
```

**2.18.I4 - Rate Limiting Prevents Excessive Calls**
```typescript
test('rate limiting prevents excessive calls', async () => {
  const checker = new ComposioConnectionChecker();

  // Simulate high usage
  vi.spyOn(checker, 'getUsageCounts').mockResolvedValue({
    last_minute: 10,  // At limit
    last_hour: 50
  });

  const result = await checker.execute({
    tool: 'composio_execute',
    input: { action: 'GMAIL_SEND_EMAIL' },
  });

  expect(result.permissionDecision).toBe('deny');
  expect(result.message).toContain('Rate limit');
  expect(result.retryAfter).toBe(60);
});
```

### E2E Tests (tests/e2e/story-2.18-*.spec.ts)

**2.18.E1 - Combined Search Returns Multiple Sources**
```typescript
test('combined search returns results from multiple sources', async ({ page }) => {
  // Pre-seed database with contact and project
  // ... (setup via test fixtures)

  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Find everything about John and Q4 Planning');
  await page.click('[data-testid="send-button"]');

  // Wait for response
  await page.waitForSelector('[data-testid="message-complete"]');

  // Should show routing info
  const routingInfo = page.locator('[data-testid="routing-context"]');
  await expect(routingInfo).toContainText(/contacts|para_projects/);
});
```

**2.18.E2 - Rate Limiting UI Shows Warning**
```typescript
test('rate limiting shows warning when approaching limit', async ({ page }) => {
  // Execute multiple tool calls to approach limit
  for (let i = 0; i < 7; i++) {
    await page.fill('[data-testid="chat-input"]', 'Check my Gmail');
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector('[data-testid="message-complete"]');
  }

  // Next call should show warning
  await page.fill('[data-testid="chat-input"]', 'Check my Gmail again');
  await page.click('[data-testid="send-button"]');

  const warning = page.locator('[data-testid="rate-limit-warning"]');
  await expect(warning).toBeVisible();
  await expect(warning).toContainText(/80%|approaching limit/i);
});
```

---

## Implementation Checklist

### Phase 1: Smart Search Router
- [ ] Create `smart-search-router.sh` in `.claude/hooks/`
- [ ] Implement query pattern detection (contacts, projects, emails, calendar, memory)
- [ ] Implement routing decision matrix
- [ ] Test with various query types
- [ ] Register in settings.json with tool matcher

### Phase 2: File Claims Hook
- [ ] Create `file-claims.sh` in `.claude/hooks/`
- [ ] Implement file path classification (PARA, email, system)
- [ ] Implement context injection for PARA documents
- [ ] Create file_claims table in SQLite
- [ ] Register in settings.json

### Phase 3: Composio Connection Checker
- [ ] Create `composio_connection_checker.py` in `.claude/hooks/`
- [ ] Implement toolkit extraction from action names
- [ ] Implement connection status checking (with cache)
- [ ] Implement rate limiting with SQLite tracking
- [ ] Create tool_usage table in SQLite
- [ ] Test OAuth redirect flow
- [ ] Register in settings.json

### Phase 4: Path Rules Hook
- [ ] Create `path-rules.sh` in `.claude/hooks/`
- [ ] Implement protected path detection
- [ ] Implement PARA structure validation
- [ ] Implement path suggestions
- [ ] Test all rule types
- [ ] Register in settings.json

### Phase 5: Signature Helper
- [ ] Create `signature-helper.sh` in `.claude/hooks/`
- [ ] Implement signature extraction for TypeScript/JavaScript
- [ ] Implement signature extraction for Python
- [ ] Add support for Rust and Go
- [ ] Test with various file types
- [ ] Register in settings.json

### Phase 6: Integration and Testing
- [ ] Wire all hooks into agent server
- [ ] Write unit tests for pattern detection
- [ ] Write unit tests for file classification
- [ ] Write integration tests for routing
- [ ] Write E2E tests for combined search
- [ ] Test graceful degradation on service failures
- [ ] Test rate limiting behavior

---

## Dependencies

### Internal Dependencies

| Story | Dependency |
|-------|------------|
| **2.17** | Context Injection Hooks - provides entity extraction patterns, additionalContext mechanism |
| **2.15** | Hook Infrastructure Foundation - provides HookRunner, PreToolUse event handling, matcher system |
| **2.2b** | CC v3 Hooks Integration - provides hook registration patterns and settings.json structure |
| 1.4 | SQLite Database Setup - provides contacts, projects, file_claims, tool_usage tables |
| 3.x | Composio integration for connection status checking |

### External Dependencies

- **SQLite** - Local data storage (contacts, projects, file_claims, tool_usage)
- **PostgreSQL** - Memory storage for context queries
- **Composio API** - Connection status verification
- **jq** - JSON parsing in shell scripts
- **grep/sed/awk** - Pattern matching utilities

### These Stories Depend On 2.18

| Story | Why |
|-------|-----|
| 2.19 | Validation & Safety Hooks use similar PreToolUse pattern |
| 3.x | Integration stories use intelligent routing for data access |
| 4.x | PARA features rely on file classification and context injection |
| 5.x | Multi-agent orchestration needs tool routing for coordination |

---

## Dev Notes

### Building on Story 2.17

This story extends context injection hooks from Story 2.17 with tool-specific routing. Key integration points:

1. **Pattern Detection** - Reuse entity extraction patterns from memory-awareness hook
2. **additionalContext** - All routing decisions reported via same mechanism
3. **HookRunner** - Use PreToolUse event with tool matchers
4. **Graceful Degradation** - Routing hooks must not block on failures

### Routing Strategy

Multi-source routing works as follows:
1. Analyze query for patterns
2. Determine primary and secondary routes
3. Execute searches in parallel where possible
4. Merge results with source attribution
5. Return to agent with routing context

### Connection Caching

Composio connection status should be cached locally:
- Cache location: `~/.orion/composio/[toolkit]_connection.json`
- Cache TTL: 5 minutes for active connections
- On cache miss: Query Composio API
- On connection failure: Show OAuth redirect

### Rate Limiting Design

Rate limits are implemented at the hook level:
1. Track usage in SQLite `tool_usage` table
2. Check limits before allowing tool execution
3. Return denial with retry time if exceeded
4. Show warning when approaching limits (70%+)

### Protected Path Handling

Protected paths require explicit confirmation:
- `.claude/` - System configuration
- `node_modules/` - Dependencies (should use npm)
- `.git/` - Git internals
- `dist/`, `build/` - Generated files

Use `requiresExplicitApproval: true` to force user confirmation.

---

## References

- **Previous Story:** `thoughts/implementation-artifacts/stories/story-2-17-context-injection-hooks.md`
- **Test Design:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.18 section)
- **Architecture:** `thoughts/planning-artifacts/architecture.md` (Section 10 - Memory System, Section 5 - Tool Integration)
- **Epics:** `thoughts/planning-artifacts/epics.md` (Story 2.18 definition)
- **PRD:** `thoughts/planning-artifacts/prd.md` (Section 5.3 - Tool Integrations)

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
- `.claude/hooks/smart-search-router.sh`
- `.claude/hooks/file-claims.sh`
- `.claude/hooks/composio_connection_checker.py`
- `.claude/hooks/path-rules.sh`
- `.claude/hooks/signature-helper.sh`
- `.claude/settings.json` (hook registration)
- `agent-server/src/hooks/routing/` (TypeScript types and utilities)
- `tests/unit/story-2.18-*.spec.ts`
- `tests/integration/story-2.18-*.spec.ts`
- `tests/e2e/story-2.18-*.spec.ts`

---

_Story created: 2026-01-16_
_Author: SM (Scrum Master Agent) - Bob_
_Comprehensive developer guide with tool routing and rate limiting implementation_
