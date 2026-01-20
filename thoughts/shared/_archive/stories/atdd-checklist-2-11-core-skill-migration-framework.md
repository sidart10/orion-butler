# ATDD Checklist: Story 2.11 - Core Skill Migration Framework

**Story:** 2-11-core-skill-migration-framework
**Epic:** 2 - Agent & Automation Infrastructure
**Status:** Ready for Development
**Generated:** 2026-01-15
**Author:** TEA (Test Architect Agent)

---

## Summary

This ATDD checklist defines comprehensive test scenarios for the Core Skill Migration Framework - the infrastructure that loads, catalogs, and executes skills from `.claude/skills/` directory, adapted from Continuous Claude v3 for Orion.

**Test Distribution:**
| Level | Count | Coverage |
|-------|-------|----------|
| Unit | 28 | 61% |
| Integration | 15 | 33% |
| E2E | 3 | 6% |

*Note: Counts based on test type annotations (2.11.1-2.11.46). Unit tests cover loader, catalog, schemas, and fuzzy match. Integration tests cover skill invocation and context injection.*

**Test Files:**
- `tests/unit/story-2.11-skill-loader.spec.ts` - Loader, scanning, error handling, fuzzy match
- `tests/unit/story-2.11-skill-catalog.spec.ts` - Catalog listing, categorization, help formatting
- `tests/unit/story-2.11-skill-schemas.spec.ts` - Zod schema validation
- `tests/unit/story-2.11-skill-runner.spec.ts` - Prompt building, context formatting, caching integration
- `tests/integration/story-2.11-skill-invocation.spec.ts` - Full invocation flow, context injection, streaming
- `tests/e2e/story-2.11-skill-workflow.spec.ts` - User-facing skill invocation via chat

---

## AC1: Skill Loading from Directory

**Given** Orion starts up
**When** the skill system initializes
**Then** skills are loaded from `.claude/skills/` directory
**And** each skill's SKILL.md is parsed for metadata
**And** skills are registered in the runtime skill catalog

### Happy Path

- [ ] **Test 2.11.1**: SkillLoader scans `.claude/skills/` and finds SKILL.md files
  - **Given**: `.claude/skills/` directory exists with multiple skill subdirectories
  - **When**: `loader.loadAll()` is called
  - **Then**: Loader discovers all SKILL.md files in subdirectories
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.2**: parseSkillFrontmatter extracts YAML metadata correctly
  - **Given**: A SKILL.md file with valid YAML frontmatter
  - **When**: `parseSkillFrontmatter(path)` is called
  - **Then**: Returns object with name, description, trigger, category, version fields
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.3**: Skills are registered in SkillCatalog Map with name as key
  - **Given**: Loader has scanned skills directory
  - **When**: `loader.getCatalog()` is called
  - **Then**: Returns Map with skill names as keys (lowercase normalized)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-catalog.spec.ts`

- [ ] **Test 2.11.4**: Skill count matches SKILL.md file count in directory
  - **Given**: Directory with N valid SKILL.md files
  - **When**: Loader completes initialization
  - **Then**: `catalog.size` equals N
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

### Edge Cases

- [ ] **Test 2.11.5**: Loader handles missing optional frontmatter fields
  - **Given**: SKILL.md with only required fields (description)
  - **When**: Frontmatter is parsed
  - **Then**: Optional fields default (version: '1.0.0', tags: [], tools: [])
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-schemas.spec.ts`

- [ ] **Test 2.11.6**: Loader derives skill name from directory when frontmatter lacks name
  - **Given**: SKILL.md at `.claude/skills/commit/SKILL.md` without name field
  - **When**: Skill is loaded
  - **Then**: Skill registered with name 'commit' (from parent directory)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.7**: Loader excludes archive, _sandbox, and math directories
  - **Given**: Skills exist in `.claude/skills/archive/`, `_sandbox/`, `math/`
  - **When**: Loader scans directory
  - **Then**: Skills in excluded directories are NOT loaded
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.8**: Loader handles empty `.claude/skills/` directory gracefully
  - **Given**: Empty skills directory
  - **When**: `loader.loadAll()` is called
  - **Then**: Catalog is empty, no errors thrown, warning logged
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

### Error Handling

- [ ] **Test 2.11.9**: Invalid SKILL.md (missing required description) logged but doesn't crash
  - **Given**: Directory with one invalid SKILL.md (missing required description field)
  - **When**: `loader.loadAll()` is called
  - **Then**: Error logged for invalid file, other skills still loaded
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.9b**: Malformed YAML that gray-matter cannot parse handled gracefully
  - **Given**: SKILL.md with invalid YAML syntax (e.g., `name: [unclosed bracket`)
  - **When**: `loader.loadAll()` is called
  - **Then**: gray-matter parse error caught, logged with file path, other skills loaded
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.9c**: File encoding issues (non-UTF8) handled gracefully
  - **Given**: SKILL.md file with binary/corrupted content (non-UTF8 encoding)
  - **When**: `loader.loadAll()` is called
  - **Then**: Encoding error caught, logged with file path, other skills loaded
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.9d**: Permission denied on SKILL.md file handled gracefully
  - **Given**: SKILL.md file exists but lacks read permission (fs mock returns EACCES)
  - **When**: `loader.loadAll()` is called
  - **Then**: Permission error caught, logged with file path, other skills loaded
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.10**: Malformed YAML frontmatter produces clear error message
  - **Given**: SKILL.md with invalid YAML syntax (indentation error, invalid characters)
  - **When**: Frontmatter parsing is attempted
  - **Then**: Error includes file path and YAML parse error details (line number if available)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.11**: Missing skills directory creates empty catalog without crash
  - **Given**: `.claude/skills/` directory does not exist
  - **When**: `loader.loadAll()` is called
  - **Then**: Empty catalog returned, warning logged
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

### Boundary Conditions

- [ ] **Test 2.11.12**: Loader handles deeply nested skill directories
  - **Given**: SKILL.md at `.claude/skills/orion/triage/v2/SKILL.md`
  - **When**: Recursive scan runs
  - **Then**: Skill is discovered and loaded correctly
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.13**: Duplicate skill names (different paths) last-one-wins
  - **Given**: Two SKILL.md files both with name 'triage'
  - **When**: Both are loaded
  - **Then**: Second one overwrites first, warning logged
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

---

## AC2: Help Command Lists Available Skills

**Given** a user types `/help`
**When** the skill catalog is queried
**Then** all available Orion skills are listed with descriptions
**And** skills are categorized (workflow, memory, research, meta)

### Happy Path

- [ ] **Test 2.11.14**: /help command triggers SkillCatalog.listAll() lookup
  - **Given**: CommandRouter registered with /help -> HelpCommandHandler
  - **And**: HelpCommandHandler has injected SkillCatalog dependency
  - **When**: User sends message "/help" through chat input
  - **Then**: CommandRouter routes to HelpCommandHandler.execute()
  - **And**: Handler calls `catalog.listAll()` internally
  - **And**: Returns formatted output to user
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

- [ ] **Test 2.11.14b**: SkillCatalog.listAll() returns SkillCatalogEntry array
  - **Given**: Catalog initialized with 4+ skills across categories
  - **When**: `catalog.listAll()` is called directly
  - **Then**: Returns array of SkillCatalogEntry objects with name, description, trigger, category
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-catalog.spec.ts`

- [ ] **Test 2.11.15**: Skills grouped by category in help output
  - **Given**: Catalog with skills in workflow, memory, research, meta categories
  - **When**: `catalog.formatHelpOutput()` is called
  - **Then**: Output contains section headers for each category
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-catalog.spec.ts`

- [ ] **Test 2.11.16**: Each skill shows name, description, trigger syntax
  - **Given**: Skill with name='triage', description='Process inbox', trigger='/triage'
  - **When**: Help output is formatted
  - **Then**: Entry contains all three fields in readable format
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-catalog.spec.ts`

- [ ] **Test 2.11.17**: Response formatted as markdown table
  - **Given**: Multiple skills in catalog
  - **When**: `formatHelpOutput()` is called
  - **Then**: Output is valid markdown with table syntax (| Command | Description |)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-catalog.spec.ts`

### Edge Cases

- [ ] **Test 2.11.18**: Category enum validates workflow, memory, research, meta only
  - **Given**: Skill with category='invalid'
  - **When**: Schema validation runs
  - **Then**: Zod throws enum validation error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-schemas.spec.ts`

- [ ] **Test 2.11.19**: listByCategory returns filtered results
  - **Given**: Catalog with 2 workflow, 1 memory, 1 meta skills
  - **When**: `catalog.listByCategory('workflow')` is called
  - **Then**: Returns only the 2 workflow skills
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-catalog.spec.ts`

- [ ] **Test 2.11.20**: Empty category returns empty array (not error)
  - **Given**: No skills in 'research' category
  - **When**: `catalog.listByCategory('research')` is called
  - **Then**: Returns empty array
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-catalog.spec.ts`

- [ ] **Test 2.11.21**: Skills without category field handled gracefully
  - **Given**: Existing CC v3 skill without category in frontmatter
  - **When**: Skill is loaded and help is formatted
  - **Then**: Skill appears in output (uncategorized or default category)
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

---

## AC3: Skill Invocation Loads Correct Prompt

**Given** a user invokes a skill (e.g., `/triage`)
**When** the skill executes
**Then** the skill's prompt is loaded and sent to the agent
**And** the skill runs with access to Orion context (PARA, contacts, preferences)
**And** results are streamed back to the user

### Happy Path

- [ ] **Test 2.11.22**: SkillRunner.invoke(skillName, context) executes a skill
  - **Given**: Valid skill 'triage' in catalog
  - **When**: `runner.invoke('triage', context)` is called
  - **Then**: Returns SkillExecutionResult with success=true
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

- [ ] **Test 2.11.23**: Skill prompt loaded from SKILL.md body (after frontmatter)
  - **Given**: SKILL.md with frontmatter + prompt content
  - **When**: Skill is executed
  - **Then**: `buildPrompt()` returns prompt content without YAML frontmatter
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

- [ ] **Test 2.11.24**: Orion context (PARA items) injected into skill prompt
  - **Given**: Context with projects: [{ name: 'Q1 Launch' }]
  - **When**: `runner.buildPrompt(skill, context)` is called
  - **Then**: Prompt contains "Active Projects" section with "Q1 Launch"
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

- [ ] **Test 2.11.25**: Orion context (contacts) injected into skill prompt
  - **Given**: Context with contacts: [{ name: 'John', organization: 'Acme' }]
  - **When**: Prompt is built
  - **Then**: Prompt contains "Recent Contacts" section with "John (Acme)"
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

- [ ] **Test 2.11.26**: Orion context (preferences) injected into skill prompt
  - **Given**: Context with preferences: [{ preference: 'Morning meetings', confidence: 0.9 }]
  - **When**: Prompt is built
  - **Then**: Prompt contains "User Preferences" section
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

- [ ] **Test 2.11.26b**: SkillRunner fetches live context from ContextProvider before prompt building
  - **Given**: SkillRunner configured with ContextProvider dependency (not static mock)
  - **And**: ContextProvider.getCurrentContext() returns live PARA/contacts/preferences from Orion state
  - **When**: `runner.invoke('triage', { sessionId: 'test' })` is called without pre-populated context
  - **Then**: Runner calls `contextProvider.getCurrentContext()` to fetch live context
  - **And**: Fetched context is merged into prompt via `buildPrompt(skill, fetchedContext)`
  - **And**: ContextProvider mock is verified to have been called
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`
  - **Note**: Validates runtime population from Orion state, not just static mock assertions

- [ ] **Test 2.11.27**: Streaming response returned via agent infrastructure
  - **Given**: Skill invocation triggers Claude API call with streaming enabled
  - **When**: Response chunks arrive incrementally via SSE/stream
  - **Then**: Each chunk is emitted via event emitter/callback (not batched)
  - **And**: Chunks arrive with timestamps showing incremental delivery (<100ms apart)
  - **And**: Final aggregated text matches complete response
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`
  - **Note**: Test must verify actual streaming behavior via `client.messages.stream()` or equivalent, not just final text extraction from batch response

### Edge Cases

- [ ] **Test 2.11.28**: Empty context produces minimal but valid prompt
  - **Given**: Context with no PARA, no contacts, no preferences (empty object or undefined values)
  - **When**: `runner.buildPrompt(skill, emptyContext)` is called
  - **Then**: Prompt contains "*No context available*" placeholder
  - **And**: Prompt is still valid markdown with skill instructions
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-runner.spec.ts`
  - **Note**: Tests SkillRunner.buildPrompt() behavior, not catalog

- [ ] **Test 2.11.29**: Skill invokable with or without leading slash (normalized)
  - **Given**: Skill registered with name 'triage' in catalog
  - **When**: `loader.getSkill('triage')` and `loader.getSkill('/triage')` called
  - **Then**: Both lookups succeed and return same skill (slash stripped during normalization)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

### Error Handling

- [ ] **Test 2.11.30**: Skill execution errors caught and return helpful message
  - **Given**: Claude API call fails with rate limit error
  - **When**: `runner.invoke()` is called
  - **Then**: Returns { success: false, error: 'Skill execution failed: ...' }
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

- [ ] **Test 2.11.31**: Result includes executionTime for performance monitoring
  - **Given**: Any skill invocation
  - **When**: Execution completes (success or failure)
  - **Then**: `result.executionTime` is positive number in milliseconds
  - **Type**: Integration
  - **File**: `tests/integration/story-2.11-skill-invocation.spec.ts`

---

## AC4: Invalid Skill Handling

**Given** a user invokes a non-existent skill
**When** the skill lookup fails
**Then** a helpful error message is returned
**And** similar skill names are suggested (fuzzy match)

### Happy Path

- [ ] **Test 2.11.32**: Non-existent skill returns found=false with suggestions
  - **Given**: Catalog with 'triage', 'schedule', 'recall'
  - **When**: `catalog.getSkill('triag')` is called (typo)
  - **Then**: Returns { found: false, suggestions: ['triage', ...] }
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.33**: Error message includes "did you mean" phrasing
  - **Given**: Non-existent skill with close matches
  - **When**: Lookup fails
  - **Then**: `errorMessage` contains 'did you mean' with suggested skills
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.34**: Suggestions use Levenshtein distance for typos
  - **Given**: Catalog with 'triage', 'trigger', 'schedule'
  - **When**: `getSkill('triag')` called
  - **Then**: 'triage' appears first (distance 1), 'trigger' may appear (distance 3)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.35**: Max 3 suggestions shown in error message
  - **Given**: Catalog with 10 skills, all somewhat similar to query
  - **When**: Lookup fails
  - **Then**: `suggestions.length` <= 3
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

### Edge Cases

- [ ] **Test 2.11.36**: Prefix match prioritized (e.g., 'tri' matches 'triage')
  - **Given**: Catalog with 'triage', 'trigger', 'schedule'
  - **When**: `getSkill('tri')` called
  - **Then**: 'triage' and 'trigger' suggested before 'schedule'
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.37**: Substring match works as enhancement beyond AC requirements
  - **Given**: Catalog with 'triage'
  - **When**: `getSkill('age')` called
  - **Then**: 'triage' appears in suggestions (substring match)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`
  - **Note**: AC4 requires "Levenshtein distance or simple prefix matching". Substring matching is an intentional enhancement for better UX - it helps users who remember partial skill names. Levenshtein distance 1-2 matches are prioritized over substring matches in scoring.

- [ ] **Test 2.11.38**: No suggestions when query is completely unrelated
  - **Given**: Catalog with 'triage', 'schedule', 'recall'
  - **When**: `getSkill('xyzzy')` called
  - **Then**: Returns error with no suggestions, suggests running /help
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

- [ ] **Test 2.11.39**: Case-insensitive matching ('TRIAGE' matches 'triage')
  - **Given**: Skill registered as 'triage'
  - **When**: `getSkill('TRIAGE')` and `getSkill('Triage')` called
  - **Then**: Both return { found: true, skill: ... }
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-loader.spec.ts`

---

## Additional Schema Validation Tests

### SkillMetadataSchema

- [ ] **Test 2.11.40**: Required field 'description' must have min 10 characters
  - **Given**: Frontmatter with description='Short'
  - **When**: Schema validation runs
  - **Then**: Zod throws minLength validation error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-schemas.spec.ts`

- [ ] **Test 2.11.41**: Trigger must match regex /^\/[a-z][a-z0-9_-]*$/
  - **Given**: Trigger values to test:
    - Valid: '/triage', '/weekly-review', '/skill_v2', '/recall3'
    - Invalid: 'triage' (no slash), '/Triage' (caps), '/_hidden' (starts with underscore), '/123' (starts with number)
  - **When**: Schema validates each trigger
  - **Then**: Valid triggers pass, invalid triggers fail regex
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-schemas.spec.ts`
  - **Note**: Regex expanded from `/^\/[a-z-]+$/` to `/^\/[a-z][a-z0-9_-]*$/` to support existing CC v3 skills that may use underscores or numbers (e.g., /skill_v2). Verified against actual .claude/skills/ directory contents.

- [ ] **Test 2.11.42**: Legacy 'allowed-tools' field supported for CC v3 compatibility
  - **Given**: Frontmatter with `allowed-tools: [composio_execute]`
  - **When**: Schema validates
  - **Then**: Validation passes, field accessible in metadata
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-schemas.spec.ts`

- [ ] **Test 2.11.43**: Legacy 'user-invocable' boolean field supported
  - **Given**: Frontmatter with `user-invocable: false`
  - **When**: Schema validates
  - **Then**: Validation passes, defaults to true if not present
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-schemas.spec.ts`

---

## E2E Tests

- [ ] **Test 2.11.44 (E2E)**: User invokes skill via chat and response appears incrementally
  - **Given**: Orion app running with skills loaded
  - **When**: User types "/triage" in chat input and submits
  - **Then**: Response appears incrementally in chat message area (not all at once after delay)
  - **And**: Typing indicator or streaming indicator is shown during response generation
  - **And**: Final response contains expected skill execution result structure
  - **Type**: E2E
  - **File**: `tests/e2e/story-2.11-skill-workflow.spec.ts`
  - **Note**: E2E tests verify streamed content appears incrementally in DOM via Vercel Browser Agent page.waitForSelector() with timeout, checking that partial content is visible before full response completes. This validates UX streaming behavior without requiring SSE inspection.

- [ ] **Test 2.11.45 (E2E)**: /help command displays formatted skill list in chat
  - **Given**: Orion app with multiple skills registered
  - **When**: User types "/help"
  - **Then**: Chat displays markdown table with skill categories
  - **Type**: E2E
  - **File**: `tests/e2e/story-2.11-skill-workflow.spec.ts`

- [ ] **Test 2.11.46 (E2E)**: Invalid skill shows error with suggestions in chat
  - **Given**: Orion app running
  - **When**: User types "/triag" (typo)
  - **Then**: Error message displays with "Did you mean /triage?"
  - **Type**: E2E
  - **File**: `tests/e2e/story-2.11-skill-workflow.spec.ts`

---

## Mock Requirements

### Mock SkillLoader
```typescript
/**
 * Mock SkillLoader with dynamic suggestion generation.
 *
 * Note: This mock intentionally simplifies Levenshtein calculation for unit test
 * isolation. Real implementation uses full Levenshtein distance algorithm.
 * For integration tests, use real SkillLoader with test fixtures.
 */
export const createMockSkillLoader = () => {
  const mockCatalog = new Map(Object.entries(MOCK_SKILLS));

  // Simplified fuzzy match for mocking - real impl uses Levenshtein
  const findSuggestions = (query: string): string[] => {
    const normalized = query.toLowerCase().replace(/^\//, '');
    const suggestions: string[] = [];

    for (const [name] of mockCatalog) {
      // Prefix match
      if (name.startsWith(normalized)) suggestions.push(name);
      // Substring match
      else if (name.includes(normalized) || normalized.includes(name)) suggestions.push(name);
    }

    return suggestions.slice(0, 3);
  };

  return {
    loadAll: vi.fn().mockResolvedValue(undefined),
    getCatalog: vi.fn().mockReturnValue(mockCatalog),
    getSkill: vi.fn().mockImplementation((name: string) => {
      const normalized = name.toLowerCase().replace(/^\//, '');
      const skill = MOCK_SKILLS[normalized];
      if (skill) {
        return { found: true, skill };
      }
      // Dynamic suggestion generation based on catalog contents
      const suggestions = findSuggestions(normalized);
      return {
        found: false,
        suggestions,
        errorMessage: suggestions.length > 0
          ? `Skill "${name}" not found. Did you mean: ${suggestions.map(s => `/${s}`).join(', ')}?`
          : `Skill "${name}" not found. Run /help to see available skills.`,
      };
    }),
  };
};
```

### Mock Claude Response
```typescript
vi.mocked(client.messages.create).mockResolvedValue({
  content: [{ type: 'text', text: 'Skill execution result...' }],
  usage: { input_tokens: 100, output_tokens: 50 },
});
```

---

## Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| gray-matter | Frontmatter parsing | Add to package.json |
| zod | Schema validation | Already installed |
| Story 2.10 | buildCachedPrompt() | Must be complete |
| vitest | Testing | Already installed |

### Dependency Integration Tests

- [ ] **Test 2.11.47**: SkillRunner compiles and runs when buildCachedPrompt is available
  - **Given**: Story 2.10 complete, `buildCachedPrompt` exported from `../agents/caching.ts`
  - **When**: SkillRunner imports and calls `buildCachedPrompt(systemPrompt)`
  - **Then**: Returns cache_control-enabled content block for Claude API
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-runner.spec.ts`

- [ ] **Test 2.11.48**: SkillRunner uses fallback stub when buildCachedPrompt unavailable
  - **Given**: Story 2.10 incomplete or `buildCachedPrompt` import fails
  - **When**: SkillRunner falls back to `buildCachedPromptFallback(prompt)`
  - **Then**: Returns simple `{ type: 'text', text: prompt }` content block
  - **And**: Skill execution succeeds without caching optimization
  - **Type**: Unit
  - **File**: `tests/unit/story-2.11-skill-runner.spec.ts`

---

## Test Execution Order

```
1. Schema Tests (2.11.40-43) - Validate data structures
2. Unit: Loader Tests (2.11.1-13) - Core loading logic
3. Unit: Catalog Tests (2.11.14-21) - Listing and categorization
4. Unit: Fuzzy Match Tests (2.11.32-39) - Suggestion algorithm
5. Integration: Invocation Tests (2.11.22-31) - Full skill execution
6. E2E: Workflow Tests (2.11.44-46) - User-facing flows
```

---

## Quality Gate Criteria

- [ ] All 55 tests passing (2.11.1-2.11.48, including 2.11.9b-d, 2.11.14b, 2.11.26b)
- [ ] Unit test coverage >= 80% for loader.ts, catalog.ts, schemas.ts, runner.ts
- [ ] Integration tests cover happy path + error handling + live context injection
- [ ] E2E tests verify user-facing skill invocation with incremental response
- [ ] No P0/P1 bugs open
- [ ] gray-matter dependency added and working
- [ ] Story 2.10 (buildCachedPrompt) integration verified or fallback working

---

**Document Status:** Ready for Implementation
**Test Framework:** Vitest (unit/integration) + Vercel Browser Agent (E2E)

_Generated by TEA (Test Architect Agent) - 2026-01-15_
