# ATDD Checklist - Epic 2, Story 2.14: Research & Discovery Skills

**Date:** 2026-01-16
**Author:** Murat (TEA Agent)
**Primary Test Level:** Integration (Unit for schemas, Integration for skill execution)

---

## Story Summary

This story implements five research and discovery skills that enable users to explore their data across all PARA categories, research topics using internal and external sources, get comprehensive contact context, view project timelines chronologically, and discover entity connections.

**As a** user,
**I want** research skills to explore my data and external sources,
**So that** I can find information efficiently.

---

## Acceptance Criteria

1. **AC1: Explore Skill (`/explore`)** - Multi-category search across PARA (projects, areas, resources, archive), contacts, tasks, inbox with relevance ranking
2. **AC2: Research Skill (`/research`)** - Search external sources (web) and internal memory, synthesize findings, offer to save key facts
3. **AC3: Context Skill (`/context`)** - Retrieve contact details, recent interactions, relevant memories, and preferences
4. **AC4: Timeline Skill (`/timeline`)** - Show project history chronologically with tasks, events, milestones, and decisions
5. **AC5: Connections Skill (`/connections`)** - Find entity relationships, direct and inferred links, visualize relationship graph

---

## Failing Tests Created (RED Phase)

### Unit Tests (9 tests)

**File:** `tests/unit/story-2.14-research-schemas.spec.ts` (~120 lines)

- **Test:** `2.14.4 - PARA categories are validated correctly`
  - **Status:** RED - Schema not implemented
  - **Verifies:** ParaCategoryEnum validates all 7 categories and rejects invalid

- **Test:** `explore input validation`
  - **Status:** RED - ExploreInputSchema not implemented
  - **Verifies:** Query required, limit bounds (1-50), categories optional

- **Test:** `research input validation`
  - **Status:** RED - ResearchInputSchema not implemented
  - **Verifies:** Topic minimum length (3 chars), optional flags

- **Test:** `context input validation`
  - **Status:** RED - ContextInputSchema not implemented
  - **Verifies:** Contact name required, interaction limit bounds

- **Test:** `timeline input validation`
  - **Status:** RED - TimelineInputSchema not implemented
  - **Verifies:** Project name required, date range optional

- **Test:** `connections input validation`
  - **Status:** RED - ConnectionsInputSchema not implemented
  - **Verifies:** Entity name required, depth bounds (1-3)

### Integration Tests (6 tests)

**File:** `tests/integration/story-2.14-research-skills.spec.ts` (~200 lines)

- **Test:** `2.14.1 - /explore queries all PARA categories`
  - **Status:** RED - ExploreSkill not implemented
  - **Verifies:** SearchService.searchMultiple called with all PARA categories, results validated against schema

- **Test:** `2.14.2 - /context returns contact with interactions`
  - **Status:** RED - ContextSkill not implemented
  - **Verifies:** Contact found by name, interactions fetched, memories retrieved, result has contact + history

- **Test:** `2.14.3 - /timeline shows chronological history`
  - **Status:** RED - TimelineSkill not implemented
  - **Verifies:** Project found, tasks fetched, events chronologically ordered

- **Test:** `2.14.4 - search results include relevance scores`
  - **Status:** RED - Relevance scoring not implemented
  - **Verifies:** All results have relevanceScore between 0.0 and 1.0

- **Test:** `2.14.5 - /research gracefully degrades without external sources`
  - **Status:** RED - ResearchSkill not implemented
  - **Verifies:** Internal results returned with explanation when external unavailable, externalSearchUsed=false

- **Test:** `2.14.6 - /connections discovers related items`
  - **Status:** RED - ConnectionsSkill not implemented
  - **Verifies:** Entity links fetched, graph data has nodes and edges

---

## Data Factories Created

### Search Result Factory

**File:** `tests/mocks/research/index.ts`

**Exports:**

- `SEARCH_RESULT_MOCKS` - Pre-built search result mocks for project, contact, task
- `MOCK_EXPLORE_RESULT` - Complete ExploreResult mock
- `MOCK_RESEARCH_RESULT` - Complete ResearchResult mock with sources
- `MOCK_CONTEXT_RESULT` - Complete ContextResult mock with interactions
- `MOCK_TIMELINE_RESULT` - Complete TimelineResult mock with events
- `MOCK_CONNECTIONS_RESULT` - Complete ConnectionsResult mock with graph

**Example Usage:**

```typescript
import { SEARCH_RESULT_MOCKS, createMockSearchService } from '../mocks/research';

const mockSearchService = createMockSearchService();
// Returns pre-configured vi.fn() mocks for all SearchService methods
```

---

## Fixtures Created

### Mock Services Fixtures

**File:** `tests/mocks/research/index.ts`

**Fixtures:**

- `createMockSearchService()` - Mock SearchService with vi.fn() for all methods
  - **Setup:** Creates mock with pre-configured return values
  - **Provides:** Mock SearchService instance
  - **Cleanup:** N/A (stateless mock)

- `createMockEmbeddingService()` - Mock EmbeddingService
  - **Setup:** Returns 1024-dimension zero vector
  - **Provides:** Mock EmbeddingService instance
  - **Cleanup:** N/A (stateless mock)

**Example Usage:**

```typescript
import { createMockSearchService, createMockEmbeddingService } from '../mocks/research';

const mockSearchService = createMockSearchService();
const mockEmbeddingService = createMockEmbeddingService();

const skill = new ExploreSkill({
  searchService: mockSearchService as any,
  embeddingService: mockEmbeddingService as any,
});
```

---

## Mock Requirements

### SearchService Mock

**Methods to Mock:**

- `searchMultiple({ query, categories, limit })` - Returns SearchResultItem[]
- `searchCategory(query, category, limit)` - Returns SearchResultItem[]
- `searchContactByName(name)` - Returns contact row or null
- `searchProjectByName(name)` - Returns project row or null
- `getContactInteractions(contactId, limit)` - Returns interaction rows
- `getProjectTasks(projectId)` - Returns task rows
- `getEntityLinks(entityType, entityId)` - Returns entity link rows
- `searchMemory(embedding, options)` - Returns memory rows

**Success Response Example:**

```json
{
  "results": [
    { "id": "proj-001", "type": "project", "title": "Q4 Launch", "relevanceScore": 0.92 }
  ],
  "totalFound": 1
}
```

### EmbeddingService Mock

**Methods to Mock:**

- `generateEmbedding(text)` - Returns number[] (1024 dimensions)

**Success Response:**

```typescript
new Array(1024).fill(0.1) // Returns fixed embedding for deterministic tests
```

---

## Required data-testid Attributes

This story is primarily API/service-level with no UI components. No data-testid attributes required.

**Note:** If UI components are added later for displaying research results, the following would be needed:

### Research Results Display (Future)

- `explore-results-list` - Container for explore results
- `explore-result-item` - Individual result item
- `relevance-score` - Relevance percentage display
- `search-input` - Search query input field

---

## Implementation Checklist

### Test: Schema Validation Tests (6 tests)

**File:** `tests/unit/story-2.14-research-schemas.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `agent-server/src/skills/research/schemas.ts` with all Zod schemas
- [ ] Implement `ParaCategoryEnum` with 7 categories
- [ ] Implement `SearchResultItemSchema` with id union type
- [ ] Implement `ExploreInputSchema` with query, categories, limit, includeArchive
- [ ] Implement `ExploreResultSchema` with results, totalFound, categoriesSearched
- [ ] Implement `ResearchInputSchema` with topic, includeExternal, maxSources
- [ ] Implement `ResearchResultSchema` with summary, sources, suggestedMemories
- [ ] Implement `ContextInputSchema` with contactName, interactionLimit
- [ ] Implement `ContextResultSchema` with contact, interactions, memories, preferences
- [ ] Implement `TimelineInputSchema` with projectName, dateRange, eventLimit
- [ ] Implement `TimelineResultSchema` with project, events, milestones, decisions
- [ ] Implement `ConnectionsInputSchema` with entityName, entityType, depth
- [ ] Implement `ConnectionsResultSchema` with entity, directLinks, inferredLinks, graphData
- [ ] Run tests: `pnpm test:unit -- story-2.14-research-schemas`
- [ ] All 6 schema tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.14.1 - /explore queries all PARA categories

**File:** `tests/integration/story-2.14-research-skills.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/skills/research/explore.ts`
- [ ] Implement `ExploreSkill` class with constructor accepting SearchService and EmbeddingService
- [ ] Implement `execute(input: ExploreInput): Promise<ExploreResult>` method
- [ ] Call `searchService.searchMultiple()` with all default categories
- [ ] Include archive if `includeArchive: true`
- [ ] Search PostgreSQL memory via `searchService.searchMemory()`
- [ ] Combine and sort results by relevance
- [ ] Validate output with `ExploreResultSchema.parse()`
- [ ] Run test: `pnpm test:integration -- 2.14.1`
- [ ] Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.14.2 - /context returns contact with interactions

**File:** `tests/integration/story-2.14-research-skills.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/skills/research/context.ts`
- [ ] Implement `ContextSkill` class with constructor
- [ ] Implement `execute(input: ContextInput): Promise<ContextResult>` method
- [ ] Call `searchService.searchContactByName()` with fuzzy matching
- [ ] Throw error if contact not found
- [ ] Call `searchService.getContactInteractions()` for recent interactions
- [ ] Call `searchService.searchMemory()` for relevant memories
- [ ] Extract preferences from memories and contact fields
- [ ] Validate output with `ContextResultSchema.parse()`
- [ ] Run test: `pnpm test:integration -- 2.14.2`
- [ ] Test passes (green phase)

**Estimated Effort:** 2.5 hours

---

### Test: 2.14.3 - /timeline shows chronological history

**File:** `tests/integration/story-2.14-research-skills.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/skills/research/timeline.ts`
- [ ] Implement `TimelineSkill` class with constructor
- [ ] Implement `execute(input: TimelineInput): Promise<TimelineResult>` method
- [ ] Call `searchService.searchProjectByName()` with fuzzy matching
- [ ] Throw error if project not found
- [ ] Call `searchService.getProjectTasks()` for project tasks
- [ ] Generate task_created and task_completed events
- [ ] Call `searchService.searchMemory()` for project decisions
- [ ] Filter events by dateRange if specified
- [ ] Sort events chronologically
- [ ] Generate milestones (start, deadline)
- [ ] Validate output with `TimelineResultSchema.parse()`
- [ ] Run test: `pnpm test:integration -- 2.14.3`
- [ ] Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.14.4 - search results include relevance scores

**File:** `tests/integration/story-2.14-research-skills.spec.ts`

**Tasks to make this test pass:**

- [ ] Ensure `SearchResultItemSchema` has `relevanceScore: z.number().min(0).max(1)`
- [ ] In SearchService FTS5 fallback, normalize BM25 scores to 0-1
- [ ] In LIKE fallback, assign default 0.5 relevance
- [ ] In memory search, use cosine similarity (already 0-1)
- [ ] Verify all results have valid scores in tests
- [ ] Run test: `pnpm test:integration -- 2.14.4`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.14.5 - /research gracefully degrades without external sources

**File:** `tests/integration/story-2.14-research-skills.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/skills/research/research.ts`
- [ ] Implement `ResearchSkill` class with Anthropic client
- [ ] Implement `execute(input: ResearchInput): Promise<ResearchResult>` method
- [ ] Search internal memory first
- [ ] Search PARA data second
- [ ] Check for Composio external tools (log TODO for Epic 3)
- [ ] Set `externalSearchUsed: false` when no external tools
- [ ] Use LLM to synthesize findings into summary
- [ ] Use LLM to suggest memories to store
- [ ] Validate output with `ResearchResultSchema.parse()`
- [ ] Run test: `pnpm test:integration -- 2.14.5`
- [ ] Test passes (green phase)

**Estimated Effort:** 3.5 hours

---

### Test: 2.14.6 - /connections discovers related items

**File:** `tests/integration/story-2.14-research-skills.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `agent-server/src/skills/research/connections.ts`
- [ ] Implement `ConnectionsSkill` class with constructor
- [ ] Implement `execute(input: ConnectionsInput): Promise<ConnectionsResult>` method
- [ ] Find entity by name (try contact first, then project)
- [ ] Throw error if entity not found
- [ ] Call `searchService.getEntityLinks()` for direct relationships
- [ ] Call `searchService.searchMultiple()` for inferred relationships
- [ ] Build graph data with nodes and edges
- [ ] Add central entity as larger node (size: 3)
- [ ] Add direct links as medium nodes (size: 2)
- [ ] Add inferred links as small nodes (size: 1) if depth > 1
- [ ] Validate output with `ConnectionsResultSchema.parse()`
- [ ] Run test: `pnpm test:integration -- 2.14.6`
- [ ] Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Additional Infrastructure Tasks

**SearchService Implementation:**

- [ ] Create `agent-server/src/services/search-service.ts`
- [ ] Implement multi-source search (SQLite + PostgreSQL)
- [ ] Implement FTS5 search with BM25 scoring
- [ ] Implement LIKE fallback for tables without FTS
- [ ] Implement fuzzy name matching for contacts/projects
- [ ] Implement vector similarity search for memory
- [ ] Export from `agent-server/src/services/index.ts`

**Estimated Effort:** 4 hours

**SKILL.md Files:**

- [ ] Create `.claude/skills/research/explore/SKILL.md`
- [ ] Create `.claude/skills/research/research/SKILL.md`
- [ ] Create `.claude/skills/research/context/SKILL.md`
- [ ] Create `.claude/skills/research/timeline/SKILL.md`
- [ ] Create `.claude/skills/research/connections/SKILL.md`

**Estimated Effort:** 1.5 hours

**Module Index:**

- [ ] Create `agent-server/src/skills/research/index.ts` with all exports

**Estimated Effort:** 0.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm test -- story-2.14

# Run unit tests only
pnpm test:unit -- story-2.14-research-schemas

# Run integration tests only
pnpm test:integration -- story-2.14-research-skills

# Run specific test by ID
pnpm test -- -t "2.14.1"

# Run tests with coverage
pnpm test -- story-2.14 --coverage

# Watch mode for TDD
pnpm test -- story-2.14 --watch
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- [x] All tests designed and documented
- [x] Test mocks specified in detail
- [x] Mock requirements documented
- [x] Implementation checklist created with clear tasks
- [x] Test execution commands provided

**Verification:**

- Tests will fail with "module not found" or "class not found" errors
- Failure messages will be clear (missing implementation)
- Tests fail due to missing code, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Start with schemas** - Create `schemas.ts` first (foundation for all skills)
2. **Implement SearchService** - Core dependency for all skills
3. **Pick one skill at a time** - Recommend order: Explore -> Context -> Timeline -> Research -> Connections
4. **Run tests after each skill** to verify green
5. **Check off tasks** in implementation checklist

**Key Principles:**

- One skill at a time (don't try to fix all at once)
- Minimal implementation (follow story code samples)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Mark story as IN PROGRESS in `sprint-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Extract shared patterns** to SearchService if duplicated
3. **Optimize database queries** if needed
4. **Add `formatForDisplay()` methods** to each skill for consistent output
5. **Ensure tests still pass** after each refactor

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- SearchService should be the single source of truth for data access
- Skills should be thin wrappers around SearchService

**Completion:**

- All tests pass
- Code follows patterns from Story 2.13
- No duplications in skill implementations
- Ready for code review

---

## Next Steps

1. **DEV agent creates test files** with the test code from test-design-epic-2.md
2. **Run failing tests** to confirm RED phase: `pnpm test -- story-2.14`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red -> green for each)
5. **When all tests pass**, refactor code for quality
6. **When refactoring complete**, update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **test-design-epic-2.md** - Story 2.14 test scenarios with code examples (6 test IDs)
- **story-2-14-research-discovery-skills.md** - Full story with acceptance criteria, tasks, and code samples
- **test-quality.md** - Test design principles (Given-When-Then, isolation, explicit assertions)
- **data-factories.md** - Factory patterns for mock data generation

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Note:** Tests will fail immediately on first run because:
1. `agent-server/src/skills/research/schemas.ts` does not exist
2. `agent-server/src/skills/research/explore.ts` does not exist
3. `agent-server/src/skills/research/context.ts` does not exist
4. `agent-server/src/skills/research/timeline.ts` does not exist
5. `agent-server/src/skills/research/research.ts` does not exist
6. `agent-server/src/skills/research/connections.ts` does not exist
7. `agent-server/src/services/search-service.ts` does not exist

**Expected Failure Messages:**

- `Cannot find module '@/skills/research/schemas'`
- `Cannot find module '@/skills/research/explore'`
- `Cannot find module '@/skills/research/context'`
- `Cannot find module '@/skills/research/timeline'`
- `Cannot find module '@/skills/research/research'`
- `Cannot find module '@/skills/research/connections'`
- `Cannot find module '../../services/search-service'`

**Summary:**

- Total tests: 15 (9 unit + 6 integration)
- Passing: 0 (expected)
- Failing: 15 (expected - module not found)
- Status: RED phase verified

---

## Notes

- **EmbeddingService dependency**: Skills use `EmbeddingService` from Story 2.13 for vector search
- **Anthropic SDK dependency**: ResearchSkill uses Claude for synthesis (model: `claude-sonnet-4-5`)
- **SQLite table dependency**: Tests assume PARA tables exist from Epic 1
- **PostgreSQL dependency**: Memory search requires `archival_memory` table with pgvector
- **Epic 3 integration**: External search tools (Exa, Firecrawl) are TODO - graceful degradation implemented
- **entity_links table**: Story includes DDL for this new table in Dev Notes section

---

## Contact

**Questions or Issues?**

- Tag @tea-agent in team channel
- Refer to `_bmad/bmm/workflows/testarch/atdd/instructions.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent (Murat)** - 2026-01-16
