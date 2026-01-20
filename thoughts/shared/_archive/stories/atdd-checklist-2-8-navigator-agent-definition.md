# ATDD Checklist: 2-8-navigator-agent-definition

**Story:** Navigator Agent Definition
**Epic:** 2 - Agent & Automation Infrastructure
**Status:** Ready for Testing
**Risk:** MEDIUM
**Priority:** P1

---

## Summary

This checklist validates the Navigator Agent implementation, which is responsible for searching the PARA (Projects, Areas, Resources, Archives) system. The agent uses semantic search with BGE-M3 embeddings (1024 dimensions) to find information across all PARA categories, ranking results by relevance. The agent supports hybrid search (combining semantic vector similarity with FTS5 keyword matching), scoped category searches, and natural language queries like "that design doc from last month". Navigator is adapted from the Continuous Claude `scout` agent for Orion's PARA structure.

---

## AC1: Navigator Agent Prompt with PARA Search Logic

**Given** the Navigator Agent is invoked (ARCH-015)
**When** I search for something
**Then** it queries across projects, areas, resources, and archive
**And** it uses semantic search with embeddings
**And** results are ranked by relevance

### Happy Path Tests

- [ ] **Test 2.8.1.1: Navigator prompt file exists and is substantial**
  - Given: The `.claude/agents/navigator.md` file exists
  - When: The file is loaded by `loadAgentTemplate('navigator')`
  - Then: The file loads successfully
  - And: The prompt content length is > 1000 characters

- [ ] **Test 2.8.1.2: Prompt includes all four PARA categories**
  - Given: The navigator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions Projects (regex: `/project/i`)
  - And: It mentions Areas (regex: `/area/i`)
  - And: It mentions Resources (regex: `/resource/i`)
  - And: It mentions Archives (regex: `/archive/i`)

- [ ] **Test 2.8.1.3: Prompt includes semantic search instructions**
  - Given: The navigator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions semantic search (regex: `/semantic.*search|embedding/i`)
  - And: It describes using vector similarity for natural language queries
  - And: It mentions BGE-M3 embeddings (1024 dimensions)

- [ ] **Test 2.8.1.4: Prompt includes relevance ranking criteria**
  - Given: The navigator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions relevance ranking (regex: `/relevance|rank/i`)
  - And: It documents scoring factors (recency, exact match, frequency)
  - And: It specifies that results should be sorted highest first

- [ ] **Test 2.8.1.5: Prompt includes search strategy per category**
  - Given: The navigator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It documents Projects contain active work with deadlines
  - And: It documents Areas contain ongoing responsibilities
  - And: It documents Resources contain contacts, templates, reference material
  - And: It documents Archives contain inactive/completed items

- [ ] **Test 2.8.1.6: Prompt includes result formatting guidelines**
  - Given: The navigator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It specifies always including category label (P/A/R/Archive)
  - And: It specifies showing relevance score for transparency
  - And: It specifies providing descriptive snippet for context

- [ ] **Test 2.8.1.7: Prompt includes navigation context**
  - Given: The navigator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It mentions returning itemId for direct navigation
  - And: It mentions including itemType for proper routing
  - And: It mentions handling archived items differently (restore option)

### Edge Cases

- [ ] **Test 2.8.1.8: Template variable interpolation works**
  - Given: The navigator agent template with placeholders ({{user_name}}, {{current_date}})
  - When: `interpolateTemplate()` is called with context variables
  - Then: All placeholders are replaced with actual values
  - And: No raw `{{variable}}` patterns remain in output

- [ ] **Test 2.8.1.9: Prompt handles empty search results gracefully**
  - Given: The navigator agent prompt is loaded
  - When: The prompt content is analyzed
  - Then: It includes instructions for no results scenario
  - And: It specifies returning helpful suggestions for query refinement

### Error Handling

- [ ] **Test 2.8.1.10: Missing prompt file throws clear error**
  - Given: The navigator agent prompt file is missing
  - When: The agent attempts to initialize
  - Then: An error is thrown with message indicating file not found
  - And: The error includes the expected file path

---

## AC2: Cross-Category Search Capability

**Given** a search query is submitted
**When** the Navigator processes the query
**Then** it searches all four PARA categories unless explicitly scoped
**And** results include the category (P/A/R/Archive) for each item

### Happy Path Tests

- [ ] **Test 2.8.2.1: PARACategory enum validates all four categories**
  - Given: The PARACategory enum definition
  - When: All category values are parsed
  - Then: 'project', 'area', 'resource', 'archive' all parse successfully

- [ ] **Test 2.8.2.2: Default search queries all four categories**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: searchMetadata.categoriesSearched is inspected
  - Then: Array contains 'project'
  - And: Array contains 'area'
  - And: Array contains 'resource'
  - And: Array contains 'archive'
  - And: Array length is exactly 4

- [ ] **Test 2.8.2.3: Scoped search respects category filter**
  - Given: NAVIGATOR_MOCKS.scoped_search mock data with categories: ['area']
  - When: searchMetadata.categoriesSearched is inspected
  - Then: Array length is 1
  - And: Array contains only 'area'

- [ ] **Test 2.8.2.4: Results include category for each item**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: Results array is inspected
  - Then: Each result has `category` field
  - And: Each category value is one of 'project', 'area', 'resource', 'archive'

- [ ] **Test 2.8.2.5: SearchRequestSchema validates categories parameter**
  - Given: A valid SearchRequest with `categories: ['project', 'resource']`
  - When: `SearchRequestSchema.parse(request)` is called
  - Then: Parsing succeeds
  - And: categories array contains exactly 2 items

- [ ] **Test 2.8.2.6: SearchRequestSchema defaults categories to undefined (all)**
  - Given: A SearchRequest without explicit categories
  - When: `SearchRequestSchema.parse(request)` is called
  - Then: Parsing succeeds
  - And: categories is undefined (meaning search all)

- [ ] **Test 2.8.2.7: Results from multiple categories are merged correctly**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: Results array is inspected
  - Then: Results contain items from 'project' category
  - And: Results contain items from 'resource' category
  - And: Results are sorted by relevanceScore (highest first)

### Edge Cases

- [ ] **Test 2.8.2.8: Single category scope returns only that category**
  - Given: NAVIGATOR_MOCKS.scoped_search mock data
  - When: Results array is inspected
  - Then: All results have `category === 'area'`
  - And: No results have other category values

- [ ] **Test 2.8.2.9: Empty categories array behaves as search all**
  - Given: A SearchRequest with `categories: []`
  - When: Navigator processes the query
  - Then: All four categories are searched

- [ ] **Test 2.8.2.10: includeArchived=false excludes archive category**
  - Given: A SearchRequest with `includeArchived: false`
  - When: `SearchRequestSchema.parse(request)` is called
  - Then: Parsing succeeds
  - And: includeArchived is false

### Error Handling

- [ ] **Test 2.8.2.11: Invalid category value throws validation error**
  - Given: A SearchRequest with `categories: ['invalid_category']`
  - When: `SearchRequestSchema.parse(request)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid category values

- [ ] **Test 2.8.2.12: PARACategory rejects invalid values**
  - Given: An attempt to parse `PARACategory.parse('invalid')`
  - When: Parsing is attempted
  - Then: Zod validation error is thrown

---

## AC3: Semantic Search with Embeddings

**Given** a natural language search query
**When** the Navigator processes it
**Then** it uses vector similarity search (BGE-M3 embeddings)
**And** results are ranked by relevance score

### Happy Path Tests

- [ ] **Test 2.8.3.1: SearchMode enum validates all modes**
  - Given: The SearchMode enum definition
  - When: All mode values are parsed
  - Then: 'hybrid', 'semantic', 'keyword' all parse successfully

- [ ] **Test 2.8.3.2: Default searchMode is 'hybrid'**
  - Given: A SearchRequest without explicit searchMode
  - When: `SearchRequestSchema.parse(request)` is called
  - Then: searchMode defaults to 'hybrid'

- [ ] **Test 2.8.3.3: Semantic search uses embeddings**
  - Given: NAVIGATOR_MOCKS.semantic_search mock data
  - When: searchMetadata.embeddingUsed is inspected
  - Then: embeddingUsed is `true`

- [ ] **Test 2.8.3.4: Natural language query produces results**
  - Given: NAVIGATOR_MOCKS.semantic_search mock data with query "the designer from TechConf"
  - When: Results are inspected
  - Then: At least one result is returned
  - And: searchMetadata.query equals "the designer from TechConf"

- [ ] **Test 2.8.3.5: Relevance scores are bounded 0.0-1.0**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: All results are inspected
  - Then: Every result.relevanceScore >= 0.0
  - And: Every result.relevanceScore <= 1.0

- [ ] **Test 2.8.3.6: Results are sorted by relevance (highest first)**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: Results array is inspected in order
  - Then: For each consecutive pair (i, i+1), results[i].relevanceScore >= results[i+1].relevanceScore

- [ ] **Test 2.8.3.7: SearchResultSchema validates relevance score bounds**
  - Given: A SearchResult with `relevanceScore: 1.5` (out of range)
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error indicates score must be <= 1

- [ ] **Test 2.8.3.8: SearchResultSchema rejects negative relevance score**
  - Given: A SearchResult with `relevanceScore: -0.1`
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error indicates score must be >= 0

- [ ] **Test 2.8.3.9: rankResults() sorts unsorted data correctly**
  - Given: An array of unsorted SearchResults: [low: 0.3, high: 0.95, mid: 0.6]
  - When: NavigatorAgent.rankResults(unsortedResults) is called
  - Then: Result order is: high (0.95), mid (0.6), low (0.3)

- [ ] **Test 2.8.3.10: Hybrid search metadata indicates combined approach**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data with searchMode: 'hybrid'
  - When: searchMetadata.embeddingUsed is inspected
  - Then: embeddingUsed is `true` (hybrid uses embeddings)

### Edge Cases

- [ ] **Test 2.8.3.11: Keyword-only search uses FTS5**
  - Given: A SearchRequest with `searchMode: 'keyword'`
  - When: Navigator processes the query
  - Then: keywordSearch method is called (via mock spy)

- [ ] **Test 2.8.3.12: Semantic-only search uses vectorSearch**
  - Given: A SearchRequest with `searchMode: 'semantic'`
  - When: Navigator processes the query
  - Then: vectorSearch method is called with useEmbeddings: true

- [ ] **Test 2.8.3.13: Results with identical scores maintain stable order**
  - Given: Multiple results with relevanceScore: 0.8
  - When: rankResults() is called
  - Then: Order is deterministic (no random shuffling)

### Error Handling

- [ ] **Test 2.8.3.14: Invalid searchMode throws validation error**
  - Given: A SearchRequest with `searchMode: 'invalid'`
  - When: `SearchRequestSchema.parse(request)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid searchMode values

---

## AC4: Search Results Display and Navigation

**Given** search results are found
**When** displayed to user
**Then** each result shows: title, category (P/A/R/Archive), relevance score
**And** I can navigate directly to the item

### Happy Path Tests

- [ ] **Test 2.8.4.1: SearchResultSchema includes all required fields**
  - Given: A valid SearchResult object
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Parsing succeeds
  - And: Object has `itemId` (string)
  - And: Object has `itemType` (ItemType enum)
  - And: Object has `title` (string)
  - And: Object has `category` (PARACategory enum)
  - And: Object has `relevanceScore` (number 0-1)

- [ ] **Test 2.8.4.2: SearchResultSchema includes optional snippet field**
  - Given: A SearchResult with `snippet: 'matching text excerpt...'`
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Parsing succeeds
  - And: snippet field is preserved

- [ ] **Test 2.8.4.3: SearchResultSchema includes optional matchedField**
  - Given: A SearchResult with `matchedField: 'description'`
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Parsing succeeds
  - And: matchedField indicates which field matched

- [ ] **Test 2.8.4.4: ItemType enum includes all expected types**
  - Given: The ItemType enum definition
  - When: All item types are parsed
  - Then: 'project', 'task', 'area', 'contact', 'organization', 'resource', 'template' all parse successfully
  - And: Archived variants parse: 'archived_project', 'archived_task', 'archived_area', 'archived_contact', 'archived_resource'

- [ ] **Test 2.8.4.5: Results have navigable reference (itemId + itemType)**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: First result is inspected
  - Then: result.itemId is defined and non-empty
  - And: result.itemType is a valid ItemType

- [ ] **Test 2.8.4.6: Results include metadata for context**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: First result with metadata is inspected
  - Then: metadata.createdAt is a valid datetime (optional)
  - And: metadata.updatedAt is a valid datetime (optional)
  - And: metadata.status is present (optional)

- [ ] **Test 2.8.4.7: Direct navigation response includes target**
  - Given: NAVIGATOR_MOCKS.direct_navigate mock data
  - When: Response is inspected
  - Then: action equals 'navigate'
  - And: navigationTarget.itemId is defined
  - And: navigationTarget.itemType is valid ItemType
  - And: navigationTarget.category is valid PARACategory

### Edge Cases

- [ ] **Test 2.8.4.8: Result without snippet is valid**
  - Given: A SearchResult without `snippet` field
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Parsing succeeds (snippet is optional)

- [ ] **Test 2.8.4.9: Result without metadata is valid**
  - Given: A SearchResult without `metadata` field
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Parsing succeeds (metadata is optional)

- [ ] **Test 2.8.4.10: Result without matchedField is valid**
  - Given: A SearchResult without `matchedField` field
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Parsing succeeds (matchedField is optional)

- [ ] **Test 2.8.4.11: Archived item type is correctly identified**
  - Given: NAVIGATOR_MOCKS.archived_result mock data
  - When: Result is inspected
  - Then: result.category equals 'archive'
  - And: result.itemType equals 'archived_project'
  - And: result.metadata.status equals 'archived' (if present)

### Error Handling

- [ ] **Test 2.8.4.12: Missing itemId throws validation error**
  - Given: A SearchResult without `itemId` field
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error identifies missing required field

- [ ] **Test 2.8.4.13: Missing title throws validation error**
  - Given: A SearchResult without `title` field
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown

- [ ] **Test 2.8.4.14: Invalid itemType throws validation error**
  - Given: A SearchResult with `itemType: 'invalid_type'`
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown
  - And: Error lists valid ItemType values

- [ ] **Test 2.8.4.15: Invalid category throws validation error**
  - Given: A SearchResult with `category: 'invalid'`
  - When: `SearchResultSchema.parse(result)` is called
  - Then: Zod validation error is thrown

---

## AC5: NavigatorResponse Schema Validation

**Given** the Navigator Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the NavigatorResponseSchema

### Happy Path Tests

- [ ] **Test 2.8.5.1: NavigatorResponseSchema includes all action types**
  - Given: The NavigatorResponseSchema definition
  - When: Action enum values are inspected
  - Then: 'search_results', 'no_results', 'clarify', 'navigate' are all valid

- [ ] **Test 2.8.5.2: search_results action validates correctly**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data with `action: 'search_results'`
  - When: `NavigatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.8.5.3: no_results action validates correctly**
  - Given: NAVIGATOR_MOCKS.no_results mock data with `action: 'no_results'`
  - When: `NavigatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.8.5.4: clarify action validates correctly**
  - Given: NAVIGATOR_MOCKS.clarify mock data with `action: 'clarify'`
  - When: `NavigatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.8.5.5: navigate action validates correctly**
  - Given: NAVIGATOR_MOCKS.direct_navigate mock data with `action: 'navigate'`
  - When: `NavigatorResponseSchema.parse(mock)` is called
  - Then: Parsing succeeds without errors

- [ ] **Test 2.8.5.6: SearchMetadataSchema validates correctly**
  - Given: A valid SearchMetadata object
  - When: `SearchMetadataSchema.parse(metadata)` is called
  - Then: Parsing succeeds
  - And: Object has `query` (string)
  - And: Object has `categoriesSearched` (array of PARACategory)
  - And: Object has `totalResults` (non-negative integer)
  - And: Object has `embeddingUsed` (boolean)
  - And: Object has optional `searchDurationMs` (number)
  - And: Object has optional `filters` (record)

- [ ] **Test 2.8.5.7: NavigatorClarificationSchema validates correctly**
  - Given: A valid NavigatorClarification object
  - When: `NavigatorClarificationSchema.parse(clarification)` is called
  - Then: Parsing succeeds
  - And: Object has `question` (required string)
  - And: Object has optional `context` (string)
  - And: Object has optional `suggestedScopes` (array of PARACategory)

- [ ] **Test 2.8.5.8: Response includes suggestions for no results**
  - Given: NAVIGATOR_MOCKS.no_results mock data
  - When: Response is inspected
  - Then: suggestions array is defined
  - And: suggestions array length > 0

- [ ] **Test 2.8.5.9: Response includes searchMetadata with timing**
  - Given: NAVIGATOR_MOCKS.multi_category_results mock data
  - When: searchMetadata is inspected
  - Then: searchDurationMs is defined
  - And: searchDurationMs > 0

- [ ] **Test 2.8.5.10: Schema exports correct TypeScript types**
  - Given: The navigator schema module exports
  - When: Type exports are inspected
  - Then: `NavigatorResponse` type is exported
  - And: `SearchResult` type is exported
  - And: `SearchRequest` type is exported
  - And: `SearchMetadata` type is exported
  - And: `NavigatorClarification` type is exported
  - And: `PARACategory` type is exported
  - And: `ItemType` type is exported
  - And: `SearchMode` type is exported

### Edge Cases

- [ ] **Test 2.8.5.11: Response with only action field validates**
  - Given: A minimal NavigatorResponse with only `action: 'no_results'`
  - When: Schema validation is performed
  - Then: Validation succeeds (all other fields are optional)

- [ ] **Test 2.8.5.12: Empty results array is valid for no_results**
  - Given: A NavigatorResponse with `action: 'no_results'` and `results: []`
  - When: Schema validation is performed
  - Then: Validation succeeds

- [ ] **Test 2.8.5.13: Clarify action without results validates**
  - Given: A NavigatorResponse with `action: 'clarify'` and no results
  - When: Schema validation is performed
  - Then: Validation succeeds (clarify doesn't require results)

- [ ] **Test 2.8.5.14: Navigate action includes navigationTarget**
  - Given: NAVIGATOR_MOCKS.direct_navigate mock data
  - When: Schema validation is performed
  - Then: navigationTarget is defined
  - And: navigationTarget.itemId is present
  - And: navigationTarget.itemType is valid
  - And: navigationTarget.category is valid

### Error Handling

- [ ] **Test 2.8.5.15: Invalid action value throws error**
  - Given: A NavigatorResponse with `action: 'invalid_action'`
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error lists valid action enum values

- [ ] **Test 2.8.5.16: Missing action field throws error**
  - Given: A NavigatorResponse without `action` field
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error identifies missing required field

- [ ] **Test 2.8.5.17: Invalid nested result throws error**
  - Given: A NavigatorResponse with invalid result (missing itemId)
  - When: Schema validation is performed
  - Then: Zod validation error is thrown
  - And: Error identifies the nested validation failure

- [ ] **Test 2.8.5.18: Negative totalResults throws error**
  - Given: A SearchMetadata with `totalResults: -1`
  - When: `SearchMetadataSchema.parse(metadata)` is called
  - Then: Zod validation error is thrown
  - And: Error indicates totalResults must be >= 0

---

## Integration Test Scenarios

### Navigator Agent End-to-End Flow

- [ ] **Test 2.8.INT.1: NavigatorAgent.initialize() loads template successfully**
  - Given: Valid navigator.md template file exists
  - When: NavigatorAgent.initialize() is called
  - Then: No errors are thrown
  - And: Agent is ready to handle requests

- [ ] **Test 2.8.INT.2: Navigator searches all categories by default**
  - Given: Mocked SearchService returning multi_category_results
  - And: A search request without explicit categories
  - When: NavigatorAgent.search({ query: 'quarterly report' }) is called
  - Then: SearchService.searchMultiple is called with all 4 categories
  - And: Result action equals 'search_results'

- [ ] **Test 2.8.INT.3: Navigator respects category scope**
  - Given: Mocked SearchService
  - And: A search request with `categories: ['project', 'resource']`
  - When: NavigatorAgent.search(request) is called
  - Then: SearchService.searchMultiple is called with categories: ['project', 'resource']

- [ ] **Test 2.8.INT.4: Hybrid search calls searchMultiple with embeddings**
  - Given: Mocked SearchService
  - And: A search request with `searchMode: 'hybrid'`
  - When: NavigatorAgent.search(request) is called
  - Then: SearchService.searchMultiple is called with useEmbeddings: true

- [ ] **Test 2.8.INT.5: Keyword-only search calls keywordSearch**
  - Given: Mocked SearchService
  - And: A search request with `searchMode: 'keyword'`
  - When: NavigatorAgent.search(request) is called
  - Then: SearchService.keywordSearch is called

- [ ] **Test 2.8.INT.6: Semantic-only search calls vectorSearch**
  - Given: Mocked SearchService
  - And: A search request with `searchMode: 'semantic'`
  - When: NavigatorAgent.search(request) is called
  - Then: SearchService.vectorSearch is called with useEmbeddings: true

- [ ] **Test 2.8.INT.7: Empty results return no_results action**
  - Given: Mocked SearchService returning empty array
  - When: NavigatorAgent.search({ query: 'nonexistent xyz' }) is called
  - Then: Result action equals 'no_results'
  - And: Result.results is empty array
  - And: Result.suggestions is defined

- [ ] **Test 2.8.INT.8: Results are ranked by relevance score**
  - Given: Mocked SearchService returning unsorted results
  - When: NavigatorAgent.search(request) is called
  - Then: Returned results are sorted by relevanceScore descending

- [ ] **Test 2.8.INT.9: Navigator handles natural language queries**
  - Given: Mocked SearchService returning semantic_search results
  - And: Query "the designer from TechConf"
  - When: NavigatorAgent.search(request) is called
  - Then: searchMetadata.embeddingUsed is true
  - And: At least one result is returned

- [ ] **Test 2.8.INT.10: Navigator passes context to search service**
  - Given: Mocked SearchService
  - And: AgentContext with sessionId
  - When: NavigatorAgent.search(request, context) is called
  - Then: SearchService receives the context

- [ ] **Test 2.8.INT.11: Dependency injection pattern works correctly**
  - Given: A mock SearchService instance
  - When: new NavigatorAgent({ searchService: mockService })
  - Then: Agent uses the injected service
  - And: Agent does not call default service locator

- [ ] **Test 2.8.INT.12: Factory method creates agent with default service**
  - Given: NavigatorAgent.create() is called
  - When: Agent is returned
  - Then: Agent is properly initialized
  - And: Agent uses service from getSearchService()

---

## Test File Mapping

| Test ID | File Location | Test Type |
|---------|--------------|-----------|
| 2.8.1.* | `tests/unit/story-2.8-navigator.spec.ts` | Unit |
| 2.8.2.* | `tests/unit/story-2.8-navigator.spec.ts` | Unit |
| 2.8.3.* | `tests/unit/story-2.8-navigator.spec.ts` | Unit |
| 2.8.4.* | `tests/unit/story-2.8-navigator.spec.ts` | Unit |
| 2.8.5.* | `tests/unit/story-2.8-navigator.spec.ts` | Unit |
| 2.8.INT.* | `tests/integration/story-2.8-navigator-search.spec.ts` | Integration |

---

## Mock Data Requirements

### Required Mock Files

- [ ] `tests/mocks/agents/navigator.ts` - NAVIGATOR_MOCKS export
  - `multi_category_results` - Search returning results from multiple PARA categories
  - `no_results` - Empty results with suggestions
  - `semantic_search` - Natural language query match (e.g., "the designer from TechConf")
  - `direct_navigate` - Direct navigation to known item
  - `clarify` - Clarification needed with suggested scopes
  - `archived_result` - Result from archive category
  - `scoped_search` - Search scoped to single category (areas only)

### Mock Schema Alignment

All mocks MUST align with NavigatorResponseSchema using:
- `results: [{ itemId, itemType, title, category, relevanceScore, snippet?, matchedField?, metadata? }]` structure
- `searchMetadata: { query, categoriesSearched, totalResults, searchDurationMs?, embeddingUsed, filters? }` structure
- `clarificationQuestion: { question, context?, suggestedScopes? }` structure
- `navigationTarget: { itemId, itemType, category }` structure
- `suggestions: string[]` for query refinement

---

## Coverage Requirements

| Acceptance Criteria | Happy Path | Edge Cases | Error Handling | Total |
|---------------------|------------|------------|----------------|-------|
| AC1: Prompt Logic | 7 | 2 | 1 | 10 |
| AC2: Cross-Category Search | 7 | 3 | 2 | 12 |
| AC3: Semantic Search | 10 | 3 | 1 | 14 |
| AC4: Results Display | 7 | 4 | 4 | 15 |
| AC5: Schema Validation | 10 | 4 | 4 | 18 |
| **Total** | **41** | **16** | **12** | **69** |

**Integration Tests:** 12 additional tests

---

## Dependencies

### Upstream (must be done first)

- Story 2.2 (Agent Prompt Templates) - `loadAgentTemplate()` and `interpolateTemplate()` functions
- Story 2.1 (Butler Agent Core) - Butler delegates to Navigator for search requests
- Story 2.3 (Sub-Agent Spawning) - Agent spawning mechanism
- Epic 1 (Foundation) - SQLite database with FTS5 and sqlite-vec for search
- `.claude/agents/navigator.md` - Agent prompt file must exist (pure markdown, > 1000 chars)

### Downstream (blocked by this story)

- Story 7.3 (Semantic Contact Search) - Uses Navigator Agent for contact search
- Epic 9 (Areas & Archive) - Navigator enables archive search/restore
- Story 2.14 (Research & Discovery Skills) - `/explore` skill uses Navigator

### Test Infrastructure

- `zod` package for schema validation
- `zod-to-json-schema` package for Claude API integration
- Vitest for test execution
- Mock infrastructure from `tests/mocks/agents/`
- Mock SearchService from `tests/mocks/services/search.ts`

---

## Implementation Checklist for DEV

### Task 1: Create Navigator Agent Prompt (AC1)

- [ ] Create `.claude/agents/navigator.md` (pure markdown, no frontmatter)
- [ ] Include all four PARA categories with search strategy per category
- [ ] Include semantic search instructions (BGE-M3, 1024 dims)
- [ ] Include relevance ranking criteria (recency, exact match, frequency)
- [ ] Include result formatting guidelines (category label, score, snippet)
- [ ] Include navigation context (itemId, itemType, archive handling)
- [ ] Verify prompt length > 1000 characters
- [ ] Run tests: `npm run test -- tests/unit/story-2.8-navigator.spec.ts --grep "AC1"`

### Task 2: Create Navigator Schema Definitions (AC2, AC3, AC4, AC5)

- [ ] Create `agent-server/src/agents/schemas/navigator.ts`
- [ ] Define PARACategory enum ('project', 'area', 'resource', 'archive')
- [ ] Define ItemType enum (all entity types including archived variants)
- [ ] Define SearchMode enum ('hybrid', 'semantic', 'keyword')
- [ ] Define SearchResultSchema with relevanceScore bounds (0-1)
- [ ] Define SearchMetadataSchema
- [ ] Define NavigatorClarificationSchema
- [ ] Define NavigatorResponseSchema with action enum
- [ ] Define SearchRequestSchema with defaults
- [ ] Export all types
- [ ] Export from `agent-server/src/agents/schemas/index.ts`
- [ ] Run tests: `npm run test -- tests/unit/story-2.8-navigator.spec.ts --grep "AC2|AC3|AC4|AC5"`

### Task 3: Implement Navigator Agent Class (AC1-5)

- [ ] Create `agent-server/src/agents/navigator/index.ts`
- [ ] Implement constructor with SearchService dependency injection
- [ ] Implement static `create()` factory method
- [ ] Implement `initialize()` to load template
- [ ] Implement `search(request, context)` method
- [ ] Implement `searchAllCategories(query, limit)` method
- [ ] Implement `searchCategory(query, category, limit)` method
- [ ] Implement `navigateToItem(itemId, itemType)` method
- [ ] Implement `performSemanticSearch()` private method
- [ ] Implement `performKeywordSearch()` private method
- [ ] Implement `rankResults()` private method
- [ ] Implement `formatSnippet()` private method
- [ ] Export from `agent-server/src/agents/index.ts`
- [ ] Run integration tests: `npm run test -- tests/integration/story-2.8-navigator-search.spec.ts`

### Task 4: Create Test Mocks

- [ ] Create `tests/mocks/agents/navigator.ts`
- [ ] Implement NAVIGATOR_MOCKS.multi_category_results
- [ ] Implement NAVIGATOR_MOCKS.no_results
- [ ] Implement NAVIGATOR_MOCKS.semantic_search
- [ ] Implement NAVIGATOR_MOCKS.direct_navigate
- [ ] Implement NAVIGATOR_MOCKS.clarify
- [ ] Implement NAVIGATOR_MOCKS.archived_result
- [ ] Implement NAVIGATOR_MOCKS.scoped_search
- [ ] Export from `tests/mocks/agents/index.ts`

### Task 5: Create Mock SearchService (if Epic 1 not complete)

- [ ] Create `tests/mocks/services/search.ts`
- [ ] Implement MockSearchService with all required methods
- [ ] Support searchMultiple, vectorSearch, keywordSearch methods
- [ ] Export for use in integration tests

---

## Running Tests

```bash
# Run all tests for this story
npm run test -- tests/unit/story-2.8-navigator.spec.ts tests/integration/story-2.8-navigator-search.spec.ts

# Run specific AC tests
npm run test -- tests/unit/story-2.8-navigator.spec.ts --grep "AC1"
npm run test -- tests/unit/story-2.8-navigator.spec.ts --grep "AC2"
npm run test -- tests/unit/story-2.8-navigator.spec.ts --grep "AC3"
npm run test -- tests/unit/story-2.8-navigator.spec.ts --grep "AC4"
npm run test -- tests/unit/story-2.8-navigator.spec.ts --grep "AC5"

# Run integration tests only
npm run test -- tests/integration/story-2.8-navigator-search.spec.ts

# Run tests with coverage
npm run test -- --coverage --coverage.include="agent-server/src/agents/navigator/**"

# Debug specific test
npm run test -- tests/unit/story-2.8-navigator.spec.ts --debug --grep "2.8.1.1"
```

---

## Gate Criteria

Story 2.8 is complete when:

- [ ] All 81 test scenarios pass (69 unit + 12 integration)
- [ ] Code coverage >= 80% on `agent-server/src/agents/navigator/`
- [ ] Code coverage >= 80% on `agent-server/src/agents/schemas/navigator.ts`
- [ ] Navigator searches all 4 PARA categories by default
- [ ] Relevance scores are always between 0.0 and 1.0
- [ ] Results include category label (P/A/R/Archive)
- [ ] Semantic search with BGE-M3 embeddings works
- [ ] Natural language queries like "the designer from TechConf" work
- [ ] All mock data exports available from `tests/mocks/agents/index.ts`
- [ ] Schema exports available from `agent-server/src/agents/schemas/index.ts`
- [ ] Integration tests run with mocked SearchService (no flakiness)

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown
- **data-factories.md** - Factory patterns using `@faker-js/faker`
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test)
- **test-levels-framework.md** - Test level selection (unit vs integration)
- **component-tdd.md** - Red-green-refactor cycle

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Notes

- **Agent Model**: Navigator uses Sonnet (per Story 2.2 AGENT_MODELS.navigator constant) for good balance of quality and speed.
- **Embedding Model**: BGE-M3 with 1024 dimensions and 8192 token context per architecture.md (ARCH-009). Note: .claude/rules references BGE-large-en-v1.5 which is for Continuous Claude, not Orion.
- **Extended Thinking**: Navigator does NOT use extended thinking per PRD 6.5 ("Basic PARA searches" skip thinking).
- **Dependency Injection**: NavigatorAgent requires SearchService injected via constructor. Use factory method for production, inject mock for testing.
- **Pattern Reference**: Follow the same structure as Story 2.5 (Triage), Story 2.6 (Scheduler), and Story 2.7 (Communicator) for agent class implementation.
- **PARA Methodology**: Projects (active with deadlines) > Areas (ongoing responsibilities) > Resources (reference material) > Archives (inactive). Navigator must understand this hierarchy.
- **Hybrid Search**: Default mode combines semantic (vector) and keyword (FTS5) search using RRF (Reciprocal Rank Fusion) for better results.

---

**Document Generated:** 2026-01-15
**Generated By:** TEA (Test Architect Agent) - ATDD Workflow
**Source Story:** `thoughts/implementation-artifacts/stories/story-2-8-navigator-agent-definition.md`
**Test Design Reference:** `thoughts/planning-artifacts/test-design-epic-2.md` (Story 2.8 section)
