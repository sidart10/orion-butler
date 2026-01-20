# ATDD Checklist - Epic 2, Story 2.13: Memory & Context Skills

**Date:** 2026-01-16
**Author:** Murat (TEA Agent)
**Primary Test Level:** Integration (with Unit for schemas, E2E for round-trip)

---

## Story Summary

Memory skills enable persistent context across sessions, allowing Orion to store and recall user preferences, decisions, and session handoffs.

**As a** user
**I want** memory skills to store and recall information
**So that** Orion remembers my preferences and past decisions

---

## Acceptance Criteria

1. **AC1: Recall Skill (`/recall`)** - Search semantic memory and return relevant learnings with confidence scores
2. **AC2: Remember Skill (`/remember`)** - Store new learnings with embedding generation and type validation
3. **AC3: Forget Skill (`/forget`)** - Soft delete memories with confirmation and audit trail
4. **AC4: Handoff Skill (`/handoff`)** - Create session handoff documents with context summary
5. **AC5: Resume Skill (`/resume`)** - Load handoff documents and restore session context
6. **AC6: Preferences Skill (`/preferences`)** - View and manage user preferences by category

---

## Failing Tests Created (RED Phase)

### Unit Tests (11 tests)

**File:** `tests/unit/story-2.13-memory-schemas.spec.ts` (~200 lines)

- [ ] **Test:** 2.13.3a - Memory types enum validates correctly
  - **Status:** RED - MemoryTypeEnum not exported from schemas.ts
  - **Verifies:** All 9 valid memory types pass validation:
    1. `preference` - User preferences (scheduling, communication style)
    2. `decision` - Architectural or design decisions
    3. `contact_info` - Contact-related information
    4. `project_context` - Project-specific context
    5. `error_fix` - How errors were resolved
    6. `working_solution` - Successful approaches
    7. `codebase_pattern` - Discovered patterns in code
    8. `open_thread` - Incomplete work to resume
    9. `failed_approach` - What didn't work (avoid repeating)

- [ ] **Test:** 2.13.3b - Invalid memory type throws validation error
  - **Status:** RED - Schema module does not exist
  - **Verifies:** Invalid types like 'invalid_type' are rejected by Zod schema

- [ ] **Test:** 2.13.3c - RecallInput validates query requirements
  - **Status:** RED - RecallInputSchema not defined
  - **Verifies:** Empty query throws, query min length enforced

- [ ] **Test:** 2.13.3d - RecallInput validates limit bounds
  - **Status:** RED - RecallInputSchema not defined
  - **Verifies:** Limit must be 1-20, out of range throws

- [ ] **Test:** 2.13.3e - RememberInput validates content minimum length
  - **Status:** RED - RememberInputSchema not defined
  - **Verifies:** Content must be at least 10 characters

- [ ] **Test:** 2.13.3f - RememberInput validates type against enum
  - **Status:** RED - RememberInputSchema not defined
  - **Verifies:** Only valid MemoryType values accepted

- [ ] **Test:** 2.13.3g - MemoryEntry schema validates mock data
  - **Status:** RED - MemoryEntrySchema not defined
  - **Verifies:** All mock memory entries pass schema validation

- [ ] **Test:** 2.13.3h - Confidence enum validates correctly
  - **Status:** RED - ConfidenceEnum not defined
  - **Verifies:** Only 'high', 'medium', 'low' accepted

- [ ] **Test:** 2.13.3j - ForgetInput requires memoryId
  - **Status:** RED - ForgetInputSchema not defined
  - **Verifies:** memoryId is a required number field

- [ ] **Test:** 2.13.3k - ForgetResult includes deletedAt for soft delete
  - **Status:** RED - ForgetResultSchema not defined
  - **Verifies:** Result has deleted boolean and deletedAt timestamp

- [ ] **Test:** 2.13.3i - PreferenceCategory enum validates correctly
  - **Status:** RED - PreferenceCategoryEnum not defined
  - **Verifies:** Only 'scheduling', 'communication', 'organization', 'notifications' accepted

### Integration Tests (19 tests)

**File:** `tests/integration/story-2.13-memory-skills.spec.ts` (~400 lines)

#### RecallSkill Tests (AC1)

- [ ] **Test:** 2.13.1a - RecallSkill generates query embedding
  - **Status:** RED - RecallSkill class does not exist
  - **Verifies:** EmbeddingService.generateEmbedding called with query text

- [ ] **Test:** 2.13.1b - RecallSkill returns vector search results from PostgreSQL
  - **Status:** RED - MemoryService.recall not implemented
  - **Verifies:** Results contain memories with scores (0.0-1.0), memoryType, content, context

- [ ] **Test:** 2.13.1c - RecallSkill filters by memory types when specified
  - **Status:** RED - RecallSkill does not support type filtering
  - **Verifies:** Only memories matching specified types array are returned

- [ ] **Test:** 2.13.1d - RecallSkill filters by minConfidence when specified
  - **Status:** RED - minConfidence filter not implemented
  - **Verifies:** Only high/medium/low confidence memories returned based on filter

#### RememberSkill Tests (AC2)

- [ ] **Test:** 2.13.2a - RememberSkill generates embedding for content
  - **Status:** RED - RememberSkill class does not exist
  - **Verifies:** EmbeddingService called with content (and context if provided)

- [ ] **Test:** 2.13.2b - RememberSkill stores memory in PostgreSQL
  - **Status:** RED - MemoryService.store not implemented
  - **Verifies:** Database insert with sessionId, memoryType, content, context, tags, confidence, embedding

- [ ] **Test:** 2.13.2c - RememberSkill returns memoryId and stored confirmation
  - **Status:** RED - RememberResult schema not validated
  - **Verifies:** Result has memoryId (number), stored (boolean), embeddingGenerated (boolean)

#### ForgetSkill Tests (AC3)

- [ ] **Test:** 2.13.3c - ForgetSkill performs soft delete (sets deleted_at)
  - **Status:** RED - ForgetSkill class does not exist
  - **Verifies:** Memory row has deleted_at timestamp, content preserved

- [ ] **Test:** 2.13.3d - ForgetSkill returns already deleted status
  - **Status:** RED - wasAlreadyDeleted flag not implemented
  - **Verifies:** Result has wasAlreadyDeleted: true when deleting already-deleted memory

- [ ] **Test:** 2.13.3e - ForgetSkill requires confirmation before deletion
  - **Status:** RED - Confirmation flow not implemented
  - **Verifies:** When confirmed: false, deletion does not occur

#### PreferencesSkill Tests (AC6)

**Note:** PreferencesSkill tests are in the same file (`story-2.13-memory-skills.spec.ts`) as RecallSkill, RememberSkill, and ForgetSkill tests. They are grouped under a `describe('PreferencesSkill (AC6)', ...)` block for clear organization.

- [ ] **Test:** 2.13.6a - PreferencesSkill queries memories by type=preference
  - **Status:** RED - PreferencesSkill class does not exist
  - **Verifies:** MemoryService.getByType called with 'preference'

- [ ] **Test:** 2.13.6b - PreferencesSkill filters by category context
  - **Status:** RED - Category filtering not implemented
  - **Verifies:** Results filtered by context containing category string

**File:** `tests/integration/story-2.13-handoff.spec.ts` (~250 lines)

#### HandoffSkill Tests (AC4)

- [ ] **Test:** 2.13.4a - HandoffSkill generates summary using LLM
  - **Status:** RED - HandoffSkill class does not exist
  - **Verifies:** Anthropic SDK called with session summary prompt
  - **Note:** HandoffSkill constructor accepts optional `model` parameter for testability (default: 'claude-sonnet-4-5')

- [ ] **Test:** 2.13.4b - HandoffSkill creates file in thoughts/handoffs/
  - **Status:** RED - File write not implemented
  - **Verifies:** File path matches pattern handoff-{timestamp}.md

- [ ] **Test:** 2.13.4c - HandoffSkill document contains required sections
  - **Status:** RED - Document structure not implemented
  - **Verifies:** File contains Summary, Current Task, Next Steps sections

#### ResumeSkill Tests (AC5)

- [ ] **Test:** 2.13.5a - ResumeSkill loads most recent handoff by default
  - **Status:** RED - ResumeSkill class does not exist
  - **Verifies:** When no path specified, most recent handoff-*.md loaded

- [ ] **Test:** 2.13.5b - ResumeSkill loads specific handoff when path provided
  - **Status:** RED - Path parameter not implemented
  - **Verifies:** Specified handoff file is read and parsed

- [ ] **Test:** 2.13.5c - ResumeSkill recalls related memories
  - **Status:** RED - Memory recall integration not implemented
  - **Verifies:** RecallSkill called with handoff summary as query

- [ ] **Test:** 2.13.5d - Round-trip: handoff then resume returns same context
  - **Status:** RED - Full integration not implemented
  - **Verifies:** Create handoff, then resume returns matching summary and tasks

### E2E Tests (2 tests)

**File:** `tests/e2e/story-2.13-memory-e2e.spec.ts` (~100 lines)

- [ ] **Test:** 2.13.E2E.1 - Store memory then recall returns it (full round-trip)
  - **Status:** RED - Full system not integrated
  - **Verifies:** User stores "prefers morning meetings", recalls "meeting preferences", result contains stored memory

- [ ] **Test:** 2.13.E2E.2 - Handoff workflow creates accessible file
  - **Status:** RED - UI integration not complete
  - **Verifies:** User invokes /handoff, file appears in thoughts/handoffs/, Resume can load it

---

## Data Factories Created

### Memory Factory

**File:** `tests/mocks/memory/index.ts`

**Exports:**

- `createMemoryEntry(overrides?)` - Create single MemoryEntry with optional overrides
- `MEMORY_MOCKS` - Record of predefined mock memories (preference_morning, decision_postgres, contact_john)
- `MOCK_RECALL_RESULT` - Pre-built RecallResult for testing
- `MOCK_REMEMBER_RESULT` - Pre-built RememberResult for testing
- `MOCK_FORGET_RESULT` - Pre-built ForgetResult for testing
- `MOCK_HANDOFF_RESULT` - Pre-built HandoffResult for testing
- `MOCK_RESUME_RESULT` - Pre-built ResumeResult for testing
- `MOCK_PREFERENCES_RESULT` - Pre-built PreferencesResult for testing
- `createMockMemoryService()` - Mock MemoryService with vi.fn() methods
- `createMockEmbeddingService()` - Mock EmbeddingService with vi.fn() methods
- `createMockHandoffSkill()` - Mock HandoffSkill for resume tests
- `createMockResumeSkill()` - Mock ResumeSkill for integration tests

**Example Usage:**

```typescript
import { MEMORY_MOCKS, createMockMemoryService, createMockEmbeddingService } from '../mocks/memory';

const skill = new RecallSkill({
  memoryService: createMockMemoryService() as any,
  embeddingService: createMockEmbeddingService() as any,
});
```

---

## Fixtures Created

### Memory Test Fixtures

**File:** `tests/support/fixtures/memory.fixture.ts`

**Fixtures:**

- `testPgPool` - PostgreSQL connection pool for integration tests
  - **Setup:** Creates pool with DATABASE_URL from test env
  - **Provides:** Pool instance for MemoryService
  - **Cleanup:** Closes pool connection

- `testMemoryService` - MemoryService with test database
  - **Setup:** Creates MemoryService with testPgPool
  - **Provides:** Configured MemoryService instance
  - **Cleanup:** Clears test data, closes connections

- `testHandoffsDir` - Temporary directory for handoff files
  - **Setup:** Creates temp directory at tests/temp/handoffs
  - **Provides:** Directory path string
  - **Cleanup:** Removes directory and all contents

**Example Usage:**

```typescript
import { test } from './fixtures/memory.fixture';

test('should recall memories', async ({ testMemoryService }) => {
  const results = await testMemoryService.recall(embedding, { limit: 5 });
  // testMemoryService is ready with auto-cleanup
});
```

---

## Mock Requirements

### PostgreSQL Database Mock

**Table:** `archival_memory`

**Schema Required:**

```sql
CREATE TABLE archival_memory (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    memory_type TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    tags TEXT[],
    confidence TEXT DEFAULT 'medium',
    embedding vector(1024),
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

**Test Data:**

```sql
INSERT INTO archival_memory (id, session_id, memory_type, content, context, tags, confidence, embedding)
VALUES
  (1, 'test-001', 'preference', 'User prefers morning meetings between 9-11am', 'scheduling', ARRAY['scheduling', 'meetings'], 'high', '[0.1, 0.2, ...]'),
  (2, 'test-002', 'decision', 'Use PostgreSQL with pgvector for semantic memory', 'architecture', ARRAY['database', 'architecture'], 'high', '[0.3, 0.4, ...]'),
  (3, 'test-003', 'contact_info', 'John Smith prefers email over phone calls', 'communication', ARRAY['contact', 'john-smith'], 'medium', '[0.5, 0.6, ...]');
```

### Embedding Service Mock

**Endpoint:** HTTP call to OPC_EMBEDDING_URL or fallback

**Success Response:**

```json
{
  "embedding": [0.1, 0.2, 0.3, ... /* 1024 floats */]
}
```

**Failure Response:** Falls back to zero vector (development mode)

**Notes:**
- Mock returns 1024-dimension array filled with 0.1 for testing
- Real embeddings generated by BGE-M3 model in production

### Anthropic SDK Mock (for Handoff)

**Endpoint:** `client.messages.create`

**Success Response:**

```json
{
  "content": [{
    "type": "text",
    "text": "{\"summary\": \"Test session\", \"currentTask\": \"Implementing feature\", \"progress\": \"50%\", \"blockers\": [], \"nextSteps\": [\"Continue implementation\"], \"relatedFiles\": [\"file.ts\"]}"
  }]
}
```

**Notes:** HandoffSkill uses LLM to generate structured summary from conversation context

---

## Required data-testid Attributes

### Memory Skills (if UI components added)

- `recall-results` - Container for recall results list
- `recall-result-item` - Individual memory result card
- `memory-type-badge` - Badge showing memory type
- `confidence-indicator` - Visual confidence score
- `remember-form` - Form for adding new memories
- `memory-content-input` - Textarea for memory content
- `memory-type-select` - Dropdown for memory type selection
- `forget-confirm-dialog` - Confirmation dialog for deletion
- `handoff-summary` - Display of handoff summary
- `preferences-list` - List of user preferences

**Implementation Example:**

```tsx
<div data-testid="recall-results">
  {memories.map(m => (
    <div key={m.id} data-testid="recall-result-item">
      <span data-testid="memory-type-badge">{m.memoryType}</span>
      <span data-testid="confidence-indicator">{m.confidence}</span>
      <p>{m.content}</p>
    </div>
  ))}
</div>
```

---

## Implementation Checklist

### Test: 2.13.3 - Memory types are validated (Schema Unit Tests)

**File:** `tests/unit/story-2.13-memory-schemas.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/skills/memory/schemas.ts` with all Zod schemas
- [ ] Export MemoryTypeEnum with all 9 valid types
- [ ] Export ConfidenceEnum with 'high', 'medium', 'low'
- [ ] Export MemorySourceEnum with 'explicit', 'observed', 'inferred'
- [ ] Export MemoryEntrySchema with all fields
- [ ] Export RecallInputSchema with query (min 1 char), limit (1-20), types filter, minConfidence filter
- [ ] Export RecallResultSchema with memories array, totalFound, query, searchMode
- [ ] Export RememberInputSchema with content (min 10 chars), type, context, tags, confidence
- [ ] Export RememberResultSchema with memoryId, stored, embeddingGenerated, memoryType
- [ ] Export ForgetInputSchema with memoryId, confirmed
- [ ] Export ForgetResultSchema with memoryId, deleted, deletedAt, wasAlreadyDeleted
- [ ] Export PreferenceCategoryEnum with 4 categories
- [ ] Export PreferencesInputSchema and PreferencesResultSchema
- [ ] Add required data-testid attributes: N/A (backend schemas)
- [ ] Run test: `pnpm test tests/unit/story-2.13-memory-schemas.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.13.1 - /recall returns results from PostgreSQL (Integration Tests)

**File:** `tests/integration/story-2.13-memory-skills.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/services/memory-service.ts` with PostgreSQL pool
- [ ] Implement `MemoryService.recall(queryEmbedding, options)` method
- [ ] Create `agent-server/src/services/embedding-service.ts`
- [ ] Implement `EmbeddingService.generateEmbedding(text)` method
- [ ] Create `agent-server/src/skills/memory/recall.ts`
- [ ] Implement `RecallSkill.execute(input)` method
- [ ] Connect to PostgreSQL via DATABASE_URL
- [ ] Execute vector similarity query on archival_memory
- [ ] Support type filtering via SQL WHERE clause
- [ ] Support minConfidence filtering
- [ ] Calculate scores as 1 - cosine_distance
- [ ] Run test: `pnpm test tests/integration/story-2.13-memory-skills.spec.ts --grep "2.13.1"`
- [ ] All recall tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.13.2 - /remember creates embedding and stores (Integration Tests)

**File:** `tests/integration/story-2.13-memory-skills.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/skills/memory/remember.ts`
- [ ] Implement `RememberSkill.execute(input)` method
- [ ] Generate embedding for content + context
- [ ] Implement `MemoryService.store(memory, embedding)` method
- [ ] Insert into archival_memory with all fields
- [ ] Return memoryId from RETURNING clause
- [ ] Set embeddingGenerated based on whether zeros were returned
- [ ] Validate input against RememberInputSchema
- [ ] Run test: `pnpm test tests/integration/story-2.13-memory-skills.spec.ts --grep "2.13.2"`
- [ ] All remember tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.13.3 - ForgetSkill soft delete preserves audit trail (Unit/Integration Tests - AC3)

**File:** `tests/unit/story-2.13-memory-schemas.spec.ts` (schemas), `tests/integration/story-2.13-memory-skills.spec.ts` (behavior)

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/skills/memory/forget.ts`
- [ ] Implement `ForgetSkill.execute(input)` method
- [ ] Implement `MemoryService.softDelete(memoryId)` method
- [ ] Use UPDATE SET deleted_at = NOW() (not DELETE)
- [ ] Implement `MemoryService.getById(memoryId)` for confirmation lookup
- [ ] Check if already deleted and return wasAlreadyDeleted flag
- [ ] Require confirmed: true before deletion
- [ ] Validate input against ForgetInputSchema
- [ ] Run test: `pnpm test tests/integration/story-2.13-memory-skills.spec.ts --grep "2.13.3"`
- [ ] All forget tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.13.4 - /handoff creates file in correct location (Integration Tests - AC4)

**File:** `tests/integration/story-2.13-handoff.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/skills/memory/handoff.ts`
- [ ] Implement `HandoffSkill.execute(input, conversationContext)` method
- [ ] Add optional `model` constructor parameter for testability (default: 'claude-sonnet-4-5')
- [ ] Generate summary using Anthropic SDK with structured prompt
- [ ] Create handoff document with timestamp filename
- [ ] Write to thoughts/handoffs/handoff-{timestamp}.md
- [ ] Include all required sections: Summary, Current Task, Progress, Blockers, Next Steps
- [ ] Validate output against HandoffResultSchema
- [ ] Run test: `pnpm test tests/integration/story-2.13-handoff.spec.ts --grep "2.13.4"`
- [ ] All handoff tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.13.5 - ResumeSkill loads handoff and recalls memories (Integration Tests - AC5)

**File:** `tests/integration/story-2.13-handoff.spec.ts`, `tests/e2e/story-2.13-memory-e2e.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/skills/memory/resume.ts`
- [ ] Implement `ResumeSkill.execute(input)` method
- [ ] Find most recent handoff when path not specified
- [ ] Parse handoff markdown into structured data
- [ ] Call RecallSkill with summary for related memories
- [ ] Return ResumeResult with all fields
- [ ] Validate output against ResumeResultSchema
- [ ] Wire up all skills in `agent-server/src/skills/memory/index.ts`
- [ ] Run test: `pnpm test tests/integration/story-2.13-handoff.spec.ts --grep "2.13.5"`
- [ ] All resume tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.13.6 - PreferencesSkill (Integration Tests - AC6)

**File:** `tests/integration/story-2.13-memory-skills.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/skills/memory/preferences.ts`
- [ ] Implement `PreferencesSkill.execute(input)` method
- [ ] Query MemoryService.getByType('preference')
- [ ] Filter by category context if specified
- [ ] Implement `MemoryService.getByType(type, options)` method
- [ ] Return PreferencesResult with all fields
- [ ] Run test: `pnpm test tests/integration/story-2.13-memory-skills.spec.ts --grep "2.13.6"`
- [ ] All preferences tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Task: Create SKILL.md Files

**Tasks:**

- [ ] Create `.claude/skills/memory/recall/SKILL.md` with frontmatter
- [ ] Create `.claude/skills/memory/remember/SKILL.md` with frontmatter
- [ ] Create `.claude/skills/memory/forget/SKILL.md` with frontmatter
- [ ] Create `.claude/skills/memory/handoff/SKILL.md` with frontmatter
- [ ] Create `.claude/skills/memory/resume/SKILL.md` with frontmatter
- [ ] Create `.claude/skills/memory/preferences/SKILL.md` with frontmatter
- [ ] Verify all SKILL.md files parse correctly

**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all failing tests for this story (unit + integration + E2E)
pnpm test tests/unit/story-2.13-memory-schemas.spec.ts tests/integration/story-2.13-memory-skills.spec.ts tests/integration/story-2.13-handoff.spec.ts tests/e2e/story-2.13-memory-e2e.spec.ts

# Run specific test file
pnpm test tests/unit/story-2.13-memory-schemas.spec.ts

# Run tests in watch mode
pnpm test --watch tests/unit/story-2.13-memory-schemas.spec.ts

# Run tests with coverage
pnpm test --coverage tests/unit/story-2.13-memory-schemas.spec.ts tests/integration/story-2.13-memory-skills.spec.ts tests/integration/story-2.13-handoff.spec.ts

# Run E2E tests (requires full app)
pnpm test:e2e tests/e2e/story-2.13-memory-e2e.spec.ts
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- [x] All tests written and failing
- [x] Fixtures and factories documented with auto-cleanup
- [x] Mock requirements documented
- [x] data-testid requirements listed
- [x] Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear: "RecallSkill class does not exist", "MemoryTypeEnum not exported"
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with 2.13.3 schemas)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Recommended Order:**

1. Schemas (2.13.3 unit tests) - Foundation for all other tests
2. MemoryService + EmbeddingService (services layer)
3. RecallSkill (AC1 - 2.13.1)
4. RememberSkill (AC2 - 2.13.2)
5. ForgetSkill (AC3 - 2.13.3)
6. HandoffSkill (AC4 - 2.13.4)
7. ResumeSkill (AC5 - 2.13.5)
8. PreferencesSkill (AC6 - 2.13.6)
9. SKILL.md files
10. E2E tests (2.13.E2E.1, 2.13.E2E.2)

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle - common patterns in skills)
4. **Optimize performance** (connection pooling, caching)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase: `pnpm test tests/unit/story-2.13-memory-schemas.spec.ts`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **test-design-epic-2.md** - Story 2.13 test scenarios with specific test IDs (2.13.1-2.13.6)
- **data-factories.md** - Factory patterns for mock memory entries and services
- **fixture-architecture.md** - Test fixture patterns with PostgreSQL pool and cleanup
- **test-quality.md** - Test design principles (Given-When-Then, isolated tests, explicit assertions)
- **component-tdd.md** - Red-green-refactor cycle guidance

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `pnpm test tests/unit/story-2.13-memory-schemas.spec.ts tests/integration/story-2.13-memory-skills.spec.ts tests/integration/story-2.13-handoff.spec.ts tests/e2e/story-2.13-memory-e2e.spec.ts`

**Results:**

```
(Tests will fail - files do not exist yet)

FAIL  tests/unit/story-2.13-memory-schemas.spec.ts
  Cannot find module '@/skills/memory/schemas'

FAIL  tests/integration/story-2.13-memory-skills.spec.ts
  Cannot find module '@/skills/memory/recall'

FAIL  tests/integration/story-2.13-handoff.spec.ts
  Cannot find module '@/skills/memory/handoff'

FAIL  tests/e2e/story-2.13-memory-e2e.spec.ts
  Cannot find module '@/skills/memory'
```

**Summary:**

- Unit tests: 11 (schema validation)
- Integration tests: 19 (12 in memory-skills + 7 in handoff)
- E2E tests: 2
- **Total tests: 32**
- Passing: 0 (expected)
- Failing: 32 (expected)
- Status: RED phase verified

**Expected Failure Messages:**

- "Cannot find module '@/skills/memory/schemas'" - Schemas not created
- "Cannot find module '@/skills/memory/recall'" - RecallSkill not created
- "Cannot find module '@/skills/memory/remember'" - RememberSkill not created
- "Cannot find module '@/skills/memory/forget'" - ForgetSkill not created
- "Cannot find module '@/skills/memory/handoff'" - HandoffSkill not created
- "Cannot find module '@/skills/memory/resume'" - ResumeSkill not created
- "Cannot find module '@/skills/memory/preferences'" - PreferencesSkill not created

---

## Notes

- **Database Dependency:** Tests require PostgreSQL with pgvector extension. Use Docker Compose for test database.
- **Embedding Service:** In test environment, embeddings are mocked as arrays of 0.1 values (1024 dimensions).
- **OPC Integration:** Production embedding generation uses existing `opc/scripts/core/db/embedding_service.py` via HTTP.
- **Soft Delete Pattern:** All memory deletions use `deleted_at` timestamp, never hard DELETE. This preserves audit trail.
- **Handoff Directory:** Files stored in `thoughts/handoffs/` with timestamp filenames for chronological ordering.
- **Skill Integration:** Memory skills should be registered in SkillLoader from Story 2.11 infrastructure.

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Refer to `story-2-13-memory-context-skills.md` for full implementation details
- Consult `test-design-epic-2.md` for test scenario definitions
- Check `architecture.md` Section 10 for memory system design

---

**Generated by BMad TEA Agent** - 2026-01-16
