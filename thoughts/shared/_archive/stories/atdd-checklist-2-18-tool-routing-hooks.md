# ATDD Checklist: 2-18-tool-routing-hooks

**Story:** Tool Routing Hooks
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-18-tool-routing-hooks
**Status:** ready-for-dev
**Risk Level:** MEDIUM
**Generated:** 2026-01-16
**Author:** TEA (Murat - Test Architect Agent)
**Version:** 2.0 (Comprehensive Update)

---

## Summary

This checklist covers comprehensive test scenarios for Story 2.18: Tool Routing Hooks. The story implements intelligent tool routing through 4 PreToolUse hooks that:
1. Route searches to optimal data sources (contacts, PARA, memory, etc.)
2. Track file access and inject PARA document context
3. Check Composio tool connections and enforce rate limits
4. Enforce path conventions and protect system directories

**Hooks Under Test:**

| Hook | File | Purpose | Timeout |
|------|------|---------|---------|
| smart-search-router.sh | `.claude/hooks/` | Route searches to optimal targets | 3000ms |
| file-claims.sh | `.claude/hooks/` | Track file access, inject PARA context | 2000ms |
| composio_connection_checker.py | `.claude/hooks/` | Check connections, enforce rate limits | 5000ms |
| path-rules.sh | `.claude/hooks/` | Enforce path conventions | 1000ms |
| signature-helper.sh | `.claude/hooks/` | Add function signatures for code files | 3000ms |

---

## AC1: Smart Search Routing

**Given** an agent wants to search
**When** PreToolUse fires for a search tool
**Then** `smart-search-router` determines optimal search target
**And** routes to PARA search, contact search, or memory search
**And** combines results from multiple sources if appropriate

### Happy Path

- [ ] **Test 2.18.1.H1:** Contact name query routes to contacts
  - Given: Query "Find John Smith email address"
  - When: PreToolUse fires for Search tool
  - Then: Result contains `targets: ['contacts', 'memory']`
  - And: Primary route is 'contacts'

- [ ] **Test 2.18.1.H2:** Project name query routes to PARA
  - Given: Query "Project Phoenix timeline"
  - When: PreToolUse fires for Search tool
  - Then: Result contains `targets: ['para_projects', 'para_tasks']`
  - And: additionalContext includes routing decision

- [ ] **Test 2.18.1.H3:** Email query routes to Gmail
  - Given: Query "Find emails from last week"
  - When: PreToolUse fires for Search/Grep tool
  - Then: Result contains `targets: ['gmail', 'inbox_items']`

- [ ] **Test 2.18.1.H4:** Memory query routes to memory_recall
  - Given: Query "What did I decide about the Q4 budget?"
  - When: PreToolUse fires for Search tool
  - Then: Result contains `targets: ['memory_recall', 'action_log']`

- [ ] **Test 2.18.1.H5:** Calendar query routes to google_calendar
  - Given: Query "What meetings do I have tomorrow?"
  - When: PreToolUse fires for Search tool
  - Then: Result contains `targets: ['google_calendar', 'tasks']`

- [ ] **Test 2.18.1.H6:** Generic query routes to para_all
  - Given: Query "quarterly report" (no specific pattern)
  - When: PreToolUse fires for Search tool
  - Then: Result contains `targets: ['para_all', 'memory']`

### Edge Cases

- [ ] **Test 2.18.1.E1:** Multiple patterns detected routes to multiple sources
  - Given: Query "Find John Smith and Q4 Planning project"
  - When: PreToolUse fires for Search tool
  - Then: Result contains both 'contacts' and 'para_projects' in targets
  - And: Results are combined with source attribution

- [ ] **Test 2.18.1.E2:** Email address pattern detected
  - Given: Query "john.smith@company.com"
  - When: PreToolUse fires for Search tool
  - Then: Result contains 'contacts' in targets

- [ ] **Test 2.18.1.E3:** Quoted text treated as project pattern
  - Given: Query containing `"Q4 Campaign"`
  - When: PreToolUse fires for Search tool
  - Then: Result routes to 'para_projects'

- [ ] **Test 2.18.1.E4:** Empty query handled gracefully
  - Given: Query is empty string
  - When: PreToolUse fires for Search tool
  - Then: Result returns `permissionDecision: 'allow'` without routing

- [ ] **Test 2.18.1.E5:** Non-search tool passes through
  - Given: Tool is 'Edit' (not Search/Grep)
  - When: PreToolUse fires
  - Then: Result returns `permissionDecision: 'allow'` immediately

- [ ] **Test 2.18.1.E6:** Case insensitivity for pattern matching
  - Given: Query "MEETING with JOHN tomorrow"
  - When: PreToolUse fires for Search tool
  - Then: Both 'calendar' and 'contacts' patterns detected

### Error Handling

- [ ] **Test 2.18.1.ERR1:** SQLite database not available
  - Given: SQLite database file doesn't exist
  - When: smart-search-router.sh executes
  - Then: Returns `permissionDecision: 'allow'` without contact enrichment
  - And: No crash or error message

- [ ] **Test 2.18.1.ERR2:** Malformed JSON input handled
  - Given: Invalid JSON passed to hook stdin
  - When: smart-search-router.sh executes
  - Then: Returns `permissionDecision: 'allow'` as fallback
  - And: Error is logged

- [ ] **Test 2.18.1.ERR3:** jq not available
  - Given: jq command not found in PATH
  - When: smart-search-router.sh executes
  - Then: Script fails gracefully with exit code 0
  - And: Returns allow decision

---

## AC2: File Access Routing

**Given** an agent wants to read a file
**When** PreToolUse fires for Read tool
**Then** router checks if it's a PARA document, email, or system file
**And** routes to appropriate handler
**And** injects relevant context for that file type

### Happy Path

- [ ] **Test 2.18.2.H1:** PARA project document gets context injection
  - Given: file_path is `~/Library/Application Support/Orion/para/projects/q4-planning/notes.md`
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Type: Project Document"
  - And: additionalContext contains project name "q4-planning"

- [ ] **Test 2.18.2.H2:** PARA area document gets context injection
  - Given: file_path is `~/Library/Application Support/Orion/para/areas/finance/budget.md`
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Type: Area Document"
  - And: additionalContext contains area name "finance"

- [ ] **Test 2.18.2.H3:** PARA resource document gets context injection
  - Given: file_path is `~/Library/Application Support/Orion/para/resources/templates/contract.md`
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Type: Resource Document"

- [ ] **Test 2.18.2.H4:** PARA archive document shows archive note
  - Given: file_path is `~/Library/Application Support/Orion/para/archive/old-project/notes.md`
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Type: Archived Document"
  - And: additionalContext contains note about checking relevance

- [ ] **Test 2.18.2.H5:** Email file gets email context
  - Given: file_path ends with `.eml`
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Type: Email Message"

- [ ] **Test 2.18.2.H6:** File claim recorded in database
  - Given: Any file path for Read operation
  - When: PreToolUse fires for Read tool
  - Then: INSERT OR REPLACE into file_claims table succeeds
  - And: session_id and timestamp recorded

### Edge Cases

- [ ] **Test 2.18.2.E1:** Path with tilde expansion
  - Given: file_path starts with `~`
  - When: PreToolUse fires for Read tool
  - Then: Path is expanded correctly to full home directory

- [ ] **Test 2.18.2.E2:** System file (non-PARA) returns no context
  - Given: file_path is `src/components/Button.tsx`
  - When: PreToolUse fires for Read tool
  - Then: permissionDecision is 'allow'
  - And: No additionalContext about PARA

- [ ] **Test 2.18.2.E3:** Empty file_path handled
  - Given: input.file_path is empty or undefined
  - When: PreToolUse fires for Read tool
  - Then: Returns `permissionDecision: 'allow'` immediately

- [ ] **Test 2.18.2.E4:** Write tool also records file claim
  - Given: Tool is 'Write' with valid file_path
  - When: PreToolUse fires
  - Then: File claim recorded with access_type 'Write'

- [ ] **Test 2.18.2.E5:** Edit tool also records file claim
  - Given: Tool is 'Edit' with valid file_path
  - When: PreToolUse fires
  - Then: File claim recorded with access_type 'Edit'

### Error Handling

- [ ] **Test 2.18.2.ERR1:** Project metadata query fails gracefully
  - Given: SQLite query for project info fails
  - When: file-claims.sh executes
  - Then: Basic context still injected (type and name)
  - And: No crash

- [ ] **Test 2.18.2.ERR2:** File claims insert fails gracefully
  - Given: file_claims table doesn't exist
  - When: file-claims.sh executes
  - Then: Returns `permissionDecision: 'allow'`
  - And: No crash

---

## AC3: Composio Tool Connection Checking

**Given** an agent wants to execute a Composio tool
**When** PreToolUse fires for composio_execute
**Then** router checks connection status for that tool
**And** prompts for connection if not authenticated
**And** applies rate limiting if approaching limits

### Happy Path

- [ ] **Test 2.18.3.H1:** Connected tool allows execution
  - Given: Gmail toolkit has active connection
  - When: PreToolUse fires for composio_execute with GMAIL_SEND_EMAIL
  - Then: Returns `permissionDecision: 'allow'`
  - And: Message says "Connection verified for gmail"

- [ ] **Test 2.18.3.H2:** Disconnected tool returns OAuth prompt
  - Given: Gmail toolkit has no active connection
  - When: PreToolUse fires for composio_execute with GMAIL_SEND_EMAIL
  - Then: Returns `permissionDecision: 'deny'`
  - And: message contains "not connected"
  - And: action is 'prompt_oauth'
  - And: oauthUrl is provided

- [ ] **Test 2.18.3.H3:** Rate limit reached returns deny
  - Given: Gmail usage is 10/10 calls in last minute
  - When: PreToolUse fires for composio_execute with GMAIL_SEND_EMAIL
  - Then: Returns `permissionDecision: 'deny'`
  - And: message contains "Rate limit reached"
  - And: retryAfter is 60

- [ ] **Test 2.18.3.H4:** Approaching rate limit shows warning
  - Given: Gmail usage is 8/10 calls in last minute (80%)
  - When: PreToolUse fires for composio_execute with GMAIL_SEND_EMAIL
  - Then: Returns `permissionDecision: 'allow'`
  - And: additionalContext contains "Rate Limit Warning"
  - And: Shows percentage usage

- [ ] **Test 2.18.3.H5:** Usage recorded for rate limiting
  - Given: Tool execution allowed
  - When: PreToolUse fires and returns allow
  - Then: INSERT into tool_usage table succeeds
  - And: Records toolkit, session_id, timestamp, action

- [ ] **Test 2.18.3.H6:** Hourly rate limit enforced
  - Given: Gmail usage is 100/100 calls in last hour
  - When: PreToolUse fires for composio_execute
  - Then: Returns `permissionDecision: 'deny'`
  - And: retryAfter is 3600

### Edge Cases

- [ ] **Test 2.18.3.E1:** Unknown toolkit passes through
  - Given: Action prefix not in TOOLKIT_MAP
  - When: PreToolUse fires for composio_execute
  - Then: Returns `permissionDecision: 'allow'`

- [ ] **Test 2.18.3.E2:** Expired token detected
  - Given: Connection cache shows expires_at in the past
  - When: PreToolUse fires for composio_execute
  - Then: Returns `permissionDecision: 'deny'`
  - And: reason is 'token_expired'

- [ ] **Test 2.18.3.E3:** Different toolkits have different rate limits
  - Given: Gmail limit is 10/min, Calendar is 20/min
  - When: Gmail at 10, Calendar at 15
  - Then: Gmail denied, Calendar allowed

- [ ] **Test 2.18.3.E4:** Non-composio tool passes through
  - Given: Tool is 'Read' (not composio_execute)
  - When: PreToolUse fires
  - Then: Returns `permissionDecision: 'allow'` immediately

- [ ] **Test 2.18.3.E5:** Toolkit extraction from various action formats
  - Given: Actions like GMAIL_SEND_EMAIL, GOOGLECALENDAR_CREATE_EVENT
  - When: extract_toolkit function called
  - Then: Returns 'gmail', 'google_calendar' respectively

### Error Handling

- [ ] **Test 2.18.3.ERR1:** Connection cache file missing
  - Given: ~/.orion/composio/{toolkit}_connection.json doesn't exist
  - When: check_connection_status called
  - Then: Returns {connected: false, reason: 'no_connection_found'}

- [ ] **Test 2.18.3.ERR2:** Connection cache file corrupted
  - Given: Cache file contains invalid JSON
  - When: check_connection_status called
  - Then: Returns {connected: false, reason: 'connection_check_failed'}

- [ ] **Test 2.18.3.ERR3:** tool_usage table doesn't exist
  - Given: Database missing tool_usage table
  - When: record_usage called
  - Then: Function creates table if not exists
  - And: No crash

- [ ] **Test 2.18.3.ERR4:** Database connection fails
  - Given: SQLite database file locked or missing
  - When: get_usage_counts called
  - Then: Returns {last_minute: 0, last_hour: 0} as safe default

---

## AC4: Path Convention Enforcement

**Given** an agent attempts to write to a file
**When** PreToolUse fires for Write or Edit tool
**Then** `path-rules.sh` enforces path conventions
**And** suggests correct path if violation detected
**And** prevents writes to protected paths

### Happy Path

- [ ] **Test 2.18.4.H1:** Valid PARA path allows write
  - Given: file_path is `~/Library/Application Support/Orion/para/projects/new-project/notes.md`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'allow'`

- [ ] **Test 2.18.4.H2:** Protected .claude/ path requires confirmation
  - Given: file_path is `.claude/settings.json`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'ask'`
  - And: requiresExplicitApproval is true
  - And: message mentions "protected system directory"

- [ ] **Test 2.18.4.H3:** node_modules/ path requires confirmation
  - Given: file_path contains `node_modules/`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'ask'`
  - And: reason is 'PROTECTED_PATH'

- [ ] **Test 2.18.4.H4:** Invalid PARA path suggests correction
  - Given: file_path is `~/Library/Application Support/Orion/para/notes.md` (no category)
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'deny'`
  - And: suggestedPath includes `/resources/`
  - And: reason is 'PARA_STRUCTURE'

- [ ] **Test 2.18.4.H5:** Root directory write denied
  - Given: file_path is `/` or `~`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'deny'`
  - And: reason is 'ROOT_WRITE'

- [ ] **Test 2.18.4.H6:** Secret file extension denied
  - Given: file_path ends with `.secret` or `.key` or `.pem`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'deny'`
  - And: reason is 'SENSITIVE_FILE'

### Edge Cases

- [ ] **Test 2.18.4.E1:** Archive write shows warning
  - Given: file_path is in `para/archive/`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'ask'`
  - And: message asks if user meant to write to a project

- [ ] **Test 2.18.4.E2:** .git/ directory protected
  - Given: file_path contains `.git/`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'ask'`
  - And: requiresExplicitApproval is true

- [ ] **Test 2.18.4.E3:** build/ and dist/ directories protected
  - Given: file_path in `dist/` or `build/`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'ask'`

- [ ] **Test 2.18.4.E4:** Read tool passes through
  - Given: Tool is 'Read' (not Write/Edit)
  - When: PreToolUse fires
  - Then: Returns `permissionDecision: 'allow'` immediately

- [ ] **Test 2.18.4.E5:** .env.local treated as sensitive
  - Given: file_path ends with `.env.local`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'deny'`
  - And: reason is 'SENSITIVE_FILE'

- [ ] **Test 2.18.4.E6:** Case insensitive secret detection
  - Given: file_path ends with `.SECRET` or `.Key`
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'deny'`

### Error Handling

- [ ] **Test 2.18.4.ERR1:** Empty file_path handled
  - Given: input.file_path is empty
  - When: PreToolUse fires for Write tool
  - Then: Returns `permissionDecision: 'allow'`

- [ ] **Test 2.18.4.ERR2:** Path expansion fails gracefully
  - Given: file_path contains invalid shell expansion
  - When: path-rules.sh executes
  - Then: Returns `permissionDecision: 'allow'` as fallback

---

## AC5: Signature Helper (Code Context)

**Note:** This AC is implicit from the Technical Notes - signature-helper.sh adds function signatures for code files.

### Happy Path

- [ ] **Test 2.18.5.H1:** TypeScript file gets exports injected
  - Given: file_path is `src/lib/agent.ts` with exports
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Exports:"
  - And: Lists exported functions/classes

- [ ] **Test 2.18.5.H2:** Python file gets definitions injected
  - Given: file_path is `scripts/process.py` with def/class statements
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Definitions:"
  - And: Lists function and class names

- [ ] **Test 2.18.5.H3:** Rust file gets public items injected
  - Given: file_path ends with `.rs` with pub items
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Public Items:"

- [ ] **Test 2.18.5.H4:** Go file gets definitions injected
  - Given: file_path ends with `.go` with func/type statements
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Definitions:"

- [ ] **Test 2.18.5.H5:** Dependencies listed for JS/TS files
  - Given: file_path is TypeScript with import statements
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Dependencies:"

- [ ] **Test 2.18.5.H6:** Line count included in context
  - Given: Any code file
  - When: PreToolUse fires for Read tool
  - Then: additionalContext contains "Lines: [number]"

### Edge Cases

- [ ] **Test 2.18.5.E1:** Non-code file returns no signatures
  - Given: file_path is `README.md` or `.json` file
  - When: PreToolUse fires for Read tool
  - Then: Returns `permissionDecision: 'allow'` without signature context

- [ ] **Test 2.18.5.E2:** File doesn't exist
  - Given: file_path points to non-existent file
  - When: PreToolUse fires for Read tool
  - Then: Returns `permissionDecision: 'allow'` without context

- [ ] **Test 2.18.5.E3:** File with no exports/definitions
  - Given: Empty TypeScript file
  - When: PreToolUse fires for Read tool
  - Then: Only "Lines:" included in context

- [ ] **Test 2.18.5.E4:** Only first 10 exports shown
  - Given: File with 20+ exports
  - When: PreToolUse fires for Read tool
  - Then: Only first 10 listed (using head -10)

---

## Integration Tests

### Search Routing Integration

- [ ] **Test 2.18.I1:** Contact query end-to-end routing
  - Given: SQLite database with contact "John Smith" (email: john@example.com)
  - When: Search query "Find John Smith" processed
  - Then: Contact info injected into additionalContext
  - And: Routes include 'contacts'

- [ ] **Test 2.18.I2:** Project query end-to-end routing
  - Given: Query mentions known project name
  - When: Search query processed by smart-search-router.sh
  - Then: Project routes (para_projects, para_tasks) selected
  - And: additionalContext shows routing decision

- [ ] **Test 2.18.I3:** Multi-source combined search
  - Given: Query "John Smith Q4 Planning"
  - When: SmartSearchRouter.route() called
  - Then: Results combined from contacts AND para_projects
  - And: Source attribution present on each result

- [ ] **Test 2.18.I4:** Router loads config from routing-rules.json
  - Given: Valid routing-rules.json exists
  - When: SmartSearchRouter initializes
  - Then: Config loaded and parsed correctly

- [ ] **Test 2.18.I5:** Custom rules override default routing
  - Given: Custom rule for "support" -> "zendesk"
  - When: Query "customer support issue" processed
  - Then: Custom target "zendesk" used instead of default

### File Routing Integration

- [ ] **Test 2.18.I6:** PARA document context enrichment
  - Given: Real PARA project file exists
  - When: Read tool used on that file
  - Then: Project metadata from SQLite injected
  - And: File claim recorded in file_claims table

### Composio Integration

- [ ] **Test 2.18.I7:** Connection status round-trip
  - Given: Real connection cache file exists
  - When: ComposioConnectionChecker.execute() called
  - Then: Correctly reads connection status
  - And: Returns appropriate allow/deny decision

- [ ] **Test 2.18.I8:** Rate limiting with real database
  - Given: tool_usage table with prior entries
  - When: Multiple composio_execute calls made
  - Then: Rate limits correctly enforced
  - And: Warning shown at 70%+ usage

### Hook Registration Integration

- [ ] **Test 2.18.I9:** smart-search-router hook registered
  - Given: .claude/settings.json exists
  - When: Hook configuration read
  - Then: smart-search-router.sh in PreToolUse array

- [ ] **Test 2.18.I10:** Routing hooks have correct timeout
  - Given: Hook configuration
  - When: Timeout values checked
  - Then: All routing hooks have appropriate timeouts (1000-5000ms)

---

## E2E Tests

### Combined Search E2E

- [ ] **Test 2.18.E1:** Search returns merged results in UI
  - Given: User logged in with seeded contacts and projects
  - When: User enters search query "Find John and Q4 Planning"
  - Then: UI shows results from multiple sources
  - And: Source attribution visible on each result
  - And: Routing context shown somewhere in UI

### Rate Limiting E2E

- [ ] **Test 2.18.E2:** Rate limit warning appears in chat
  - Given: User makes 7-8 Gmail tool calls in quick succession
  - When: Next Gmail tool call made
  - Then: Warning about approaching rate limit visible
  - And: Shows percentage of limit used

- [ ] **Test 2.18.E3:** Rate limit denial shows retry time
  - Given: User exceeds 10 Gmail calls in 1 minute
  - When: Next Gmail tool call attempted
  - Then: Denial message shows "Rate limit reached"
  - And: Retry time of 60 seconds shown
  - And: No 429 error from Composio API

### OAuth Prompt E2E

- [ ] **Test 2.18.E4:** Disconnected tool shows OAuth link
  - Given: Gmail not connected
  - When: User asks agent to check email
  - Then: Response includes "Gmail is not connected"
  - And: OAuth link/button provided for connection

---

## Unit Test Code Examples

### Query Pattern Detection

```typescript
// tests/unit/story-2.18-query-patterns.spec.ts
import { describe, test, expect } from 'vitest';
import { detectQueryPatterns, determineRoutes } from '@/hooks/routing/smart-search';

describe('2.18 Query Pattern Detection', () => {

  test('2.18.1.H1 - contact pattern detected', () => {
    const patterns = detectQueryPatterns('Find John Smith email address');

    expect(patterns.contact).toBe(true);
    expect(patterns.contactName).toBe('John Smith');
  });

  test('2.18.1.H3 - email query pattern', () => {
    const patterns = detectQueryPatterns('Find emails from last week');

    expect(patterns.email).toBe(true);
  });

  test('2.18.1.H4 - memory/recall pattern', () => {
    const patterns = detectQueryPatterns('What did I decide about the budget?');

    expect(patterns.memory).toBe(true);
  });

  test('2.18.1.H5 - calendar pattern', () => {
    const patterns = detectQueryPatterns('What meetings do I have tomorrow?');

    expect(patterns.calendar).toBe(true);
  });

  test('2.18.1.E1 - multiple patterns detected', () => {
    const patterns = detectQueryPatterns('Find John Smith and Q4 Planning project');

    expect(patterns.contact).toBe(true);
    expect(patterns.project).toBe(true);
  });

  test('2.18.1.E6 - case insensitive matching', () => {
    const patterns = detectQueryPatterns('MEETING with JOHN tomorrow');

    expect(patterns.calendar).toBe(true);
    expect(patterns.contact).toBe(true);
  });

});
```

### File Classification

```typescript
// tests/unit/story-2.18-file-classification.spec.ts
import { describe, test, expect } from 'vitest';
import { classifyFilePath, injectFileContext } from '@/hooks/routing/file-claims';

describe('2.18 File Classification', () => {

  test('2.18.2.H1 - PARA project path classification', () => {
    const result = classifyFilePath(
      '~/Library/Application Support/Orion/para/projects/q4-planning/notes.md'
    );

    expect(result.type).toBe('para_project');
    expect(result.projectName).toBe('q4-planning');
  });

  test('2.18.2.H5 - email file classification', () => {
    const result = classifyFilePath('/tmp/email-12345.eml');

    expect(result.type).toBe('email');
  });

  test('2.18.2.E2 - system file classification', () => {
    const result = classifyFilePath('src/components/Button.tsx');

    expect(result.type).toBe('system');
    expect(result.protected).toBe(false);
  });

});
```

### Path Rule Validation

```typescript
// tests/unit/story-2.18-path-rules.spec.ts
import { describe, test, expect } from 'vitest';
import { validatePath, checkProtectedPath } from '@/hooks/routing/path-rules';

describe('2.18 Path Rule Validation', () => {

  test('2.18.4.H2 - protected .claude/ path', () => {
    const result = validatePath('.claude/settings.json', 'Write');

    expect(result.decision).toBe('ask');
    expect(result.requiresExplicitApproval).toBe(true);
  });

  test('2.18.4.H4 - invalid PARA path suggests correction', () => {
    const result = validatePath(
      '~/Library/Application Support/Orion/para/notes.md',
      'Write'
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('PARA_STRUCTURE');
    expect(result.suggestedPath).toContain('/resources/');
  });

  test('2.18.4.H5 - root directory denied', () => {
    const result = validatePath('/', 'Write');

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('ROOT_WRITE');
  });

  test('2.18.4.H6 - sensitive file extension denied', () => {
    const result = validatePath('config.secret', 'Write');

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('SENSITIVE_FILE');
  });

});
```

### Routing Rules Configurability

```typescript
// tests/unit/story-2.18-routing-config.spec.ts
import { describe, test, expect } from 'vitest';
import { SmartSearchRouter } from '@/hooks/routing/smart-search';

describe('2.18 Routing Configuration', () => {

  test('2.18.I5 - custom routing rules respected', () => {
    const router = new SmartSearchRouter({
      rules: {
        email: { patterns: ['email', 'message'], targets: ['gmail', 'contacts'] },
        calendar: { patterns: ['meeting', 'schedule'], targets: ['google_calendar', 'para_tasks'] },
      },
    });

    const emailResult = router.determineTargets('Find recent email from client');
    expect(emailResult).toContain('gmail');
    expect(emailResult).toContain('contacts');

    const calendarResult = router.determineTargets('Schedule a meeting');
    expect(calendarResult).toContain('google_calendar');
    expect(calendarResult).toContain('para_tasks');
  });

});
```

### Composio Connection Checker

```typescript
// tests/unit/story-2.18-composio-checker.spec.ts
import { describe, test, expect, vi } from 'vitest';
import { ComposioConnectionChecker } from '@/hooks/routing/composio-checker';

describe('2.18 Composio Connection Checker', () => {

  test('2.18.3.H2 - disconnected tool prompts for OAuth', async () => {
    const checker = new ComposioConnectionChecker();

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

  test('2.18.3.H3 - rate limit reached returns deny', async () => {
    const checker = new ComposioConnectionChecker();

    vi.spyOn(checker, 'checkConnection').mockResolvedValue({ connected: true });
    vi.spyOn(checker, 'getUsageCounts').mockResolvedValue({
      last_minute: 10,
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

});
```

---

## Test Data Requirements

### SQLite Test Data

```sql
-- contacts table
INSERT INTO contacts (id, name, email, relationship) VALUES
('c1', 'John Smith', 'john@example.com', 'client'),
('c2', 'Alice Johnson', 'alice@company.com', 'colleague');

-- projects table
INSERT INTO projects (id, name, status, deadline) VALUES
('p1', 'q4-planning', 'active', '2026-03-31'),
('p2', 'Project Phoenix', 'active', '2026-06-30');

-- file_claims table (create if not exists)
CREATE TABLE IF NOT EXISTS file_claims (
  file_path TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  access_type TEXT
);

-- tool_usage table (create if not exists)
CREATE TABLE IF NOT EXISTS tool_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  toolkit TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  action TEXT
);
```

### Mock Connection Cache

```json
// ~/.orion/composio/gmail_connection.json (connected)
{
  "connected": true,
  "last_refresh": "2026-01-16T10:00:00Z",
  "expires_at": "2026-01-16T11:00:00Z"
}

// ~/.orion/composio/slack_connection.json (disconnected - for testing)
{
  "connected": false,
  "reason": "no_connection_found"
}
```

### Data Factories

```typescript
// tests/support/factories/search-input.factory.ts
export const createSearchInput = (overrides?: Partial<SearchInput>) => ({
  tool: 'Search',
  input: { query: faker.lorem.sentence() },
  ...overrides,
});

export const createContactQuery = () => createSearchInput({
  input: { query: `Find ${faker.person.fullName()} email address` },
});

export const createProjectQuery = () => createSearchInput({
  input: { query: `Project ${faker.company.buzzPhrase()} timeline` },
});
```

---

## Coverage Summary

| AC | Happy Path | Edge Cases | Error Handling | Total |
|----|------------|------------|----------------|-------|
| AC1 | 6 tests | 6 tests | 3 tests | 15 |
| AC2 | 6 tests | 5 tests | 2 tests | 13 |
| AC3 | 6 tests | 5 tests | 4 tests | 15 |
| AC4 | 6 tests | 6 tests | 2 tests | 14 |
| AC5 | 6 tests | 4 tests | 0 tests | 10 |
| Integration | - | - | - | 10 |
| E2E | - | - | - | 4 |

**Total Tests:** 81

| Test Level | Count | Percentage |
|------------|-------|------------|
| Unit | 67 | 83% |
| Integration | 10 | 12% |
| E2E | 4 | 5% |

---

## Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| Story 2.15 (Hook Infrastructure) | HookRunner, PreToolUse event handling | Required |
| Story 2.17 (Context Injection) | additionalContext mechanism | Required |
| Story 2.2b (CC v3 Hooks) | Hook registration, settings.json structure | Required |
| Story 1.4 (SQLite) | contacts, projects, file_claims, tool_usage tables | Required |
| Epic 3 (Composio) | Connection status API | Partial |

---

## Risk Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hook failures cascade | HIGH | All hooks return 'allow' on error (graceful degradation) |
| Rate limiting bypassed | MEDIUM | Unit tests verify rate limit logic with controlled timestamps |
| Path rules too restrictive | MEDIUM | 'ask' decision allows override with explicit approval |
| Search routing incorrect | MEDIUM | Golden test dataset for pattern matching validation |
| Composio API changes | LOW | Mock connection checker for isolation |

---

## File Structure After Implementation

```
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
    story-2.18-routing.spec.ts
    story-2.18-query-patterns.spec.ts
    story-2.18-file-classification.spec.ts
    story-2.18-path-rules.spec.ts
    story-2.18-composio-checker.spec.ts
  integration/
    story-2.18-tool-routing.spec.ts
  e2e/
    story-2.18-routing.spec.ts
  support/
    factories/
      search-input.factory.ts
      tool-input.factory.ts
      routing-config.factory.ts
    fixtures/
      routing.fixture.ts
```

---

## Running Tests

```bash
# Run all tests for this story
pnpm test tests/unit/story-2.18-*.spec.ts tests/integration/story-2.18-*.spec.ts

# Run specific test file
pnpm test tests/unit/story-2.18-routing.spec.ts

# Run specific test by name
pnpm test tests/unit/story-2.18-routing.spec.ts -t "contact query"

# Run E2E tests (requires app running)
pnpm test:e2e tests/e2e/story-2.18-routing.spec.ts

# Run tests with coverage
pnpm test tests/unit/story-2.18-*.spec.ts --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (TEA Complete)
- [x] All test scenarios documented
- [x] Test code examples provided
- [x] Data factories defined
- [x] Mock requirements documented

### GREEN Phase (DEV - Next Steps)
1. Pick one failing test from checklist
2. Implement minimal code to pass
3. Run test to verify green
4. Move to next test

### REFACTOR Phase (After All Green)
1. Extract common patterns
2. Optimize performance (routing <100ms)
3. Ensure tests still pass

---

**Document Status:** Ready for Implementation
**Test Framework:** Vitest (unit/integration), Vercel Browser Agent (E2E)
**Next Step:** Implement hooks alongside these tests

_Generated by TEA (Murat - Test Architect Agent) - 2026-01-16 (v2.0 Comprehensive Update)_
