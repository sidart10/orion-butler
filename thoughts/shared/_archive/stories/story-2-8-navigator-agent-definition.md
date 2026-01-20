# Story 2.8: Navigator Agent Definition

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-8-navigator-agent-definition
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a user,
I want a specialist agent for searching my PARA system,
So that I can find information across projects, areas, and archives.

---

## Acceptance Criteria

### AC1: Navigator Agent Prompt with PARA Search Logic

**Given** the Navigator Agent is invoked (ARCH-015)
**When** I search for something
**Then** it queries across projects, areas, resources, and archive
**And** it uses semantic search with embeddings
**And** results are ranked by relevance

- [ ] Navigator agent prompt (`.claude/agents/navigator.md`) includes PARA search logic
- [ ] Prompt includes sections for: persona, search strategy, relevance ranking, result formatting
- [ ] Prompt references all four PARA categories (Projects, Areas, Resources, Archives)
- [ ] Prompt includes semantic search instructions (embedding-based queries)
- [ ] Prompt length > 1000 characters (core agent requirement from Story 2.2)

### AC2: Cross-Category Search Capability

**Given** a search query is submitted
**When** the Navigator processes the query
**Then** it searches all four PARA categories unless explicitly scoped
**And** results include the category (P/A/R/Archive) for each item

- [ ] NavigatorResponseSchema includes search across all PARA categories
- [ ] Each result includes `category: 'project' | 'area' | 'resource' | 'archive'`
- [ ] Search can be scoped to specific categories via `categories` parameter
- [ ] Default behavior searches all categories if not specified

### AC3: Semantic Search with Embeddings

**Given** a natural language search query
**When** the Navigator processes it
**Then** it uses vector similarity search (BGE-M3 embeddings)
**And** results are ranked by relevance score

- [ ] Navigator uses embedding-based search for semantic matching
- [ ] Works with natural language queries (e.g., "that design doc from last month")
- [ ] Relevance scores are between 0.0 and 1.0
- [ ] Results are sorted by relevance score (highest first)
- [ ] Supports both exact match and semantic similarity via hybrid search:
  - Semantic: `performSemanticSearch()` uses BGE-M3 vector similarity
  - Keyword: `performKeywordSearch()` uses FTS5 full-text exact match
  - SearchRequestSchema includes `searchMode: 'hybrid' | 'semantic' | 'keyword'` with 'hybrid' as default

### AC4: Search Results Display and Navigation

**Given** search results are found
**When** displayed to user
**Then** each result shows: title, category (P/A/R/Archive), relevance score
**And** I can navigate directly to the item

- [ ] NavigatorResultSchema includes `title`, `category`, `relevanceScore`, `itemId`
- [ ] Results include `description` or `snippet` field for context
- [ ] Results include `itemType` for specific entity (project, task, contact, etc.)
- [ ] Each result has a navigable reference (itemId + itemType)

### AC5: NavigatorResponse Schema Validation

**Given** the Navigator Agent produces output
**When** output is returned to Butler or calling agent
**Then** it is type-safe JSON validated by the NavigatorResponseSchema

- [ ] NavigatorResponseSchema (Zod) validates all agent output fields
- [ ] Schema includes: `action`, `results`, `searchMetadata`, `clarificationQuestion`
- [ ] SearchResultSchema validates individual result items
- [ ] Invalid relevance scores (outside 0-1) throw validation errors
- [ ] Schema exports types for TypeScript consumption

---

## Tasks / Subtasks

### Task 1: Create/Update Navigator Agent Prompt (AC: #1, #2, #3)

- [ ] 1.1 Create `.claude/agents/navigator.md` if not exists (pure markdown format, no frontmatter)
- [ ] 1.2 Include PARA search strategy instructions:
  - Search all four PARA categories by default
  - Understand category-specific content types
  - Apply appropriate search strategies per category
  - Handle cross-category relationships
- [ ] 1.3 Include semantic search instructions:
  - Use BGE-M3 embeddings (1024 dimensions, 8192 token context)
  - Interpret natural language queries semantically
  - Handle synonyms and related concepts
  - Balance exact match vs. semantic similarity
- [ ] 1.4 Include relevance ranking criteria:
  - Recency factor (recent items score higher)
  - Exact match boost for keywords
  - Category relevance to query intent
  - Interaction frequency (frequently accessed items)
- [ ] 1.5 Include result formatting guidelines:
  - Always include category label (P/A/R/Archive)
  - Show relevance score for transparency
  - Provide descriptive snippet for context
  - Group related results when appropriate
- [ ] 1.6 Include navigation context:
  - Return itemId for direct navigation
  - Include itemType for proper routing
  - Handle archived items differently (restore option)
- [ ] 1.7 Verify prompt length > 1000 characters

### Task 2: Create Navigator Schema Definitions (AC: #4, #5)

- [ ] 2.1 Create `agent-server/src/agents/schemas/navigator.ts`:
```typescript
import { z } from 'zod';

// PARA category enum
export const PARACategory = z.enum(['project', 'area', 'resource', 'archive']);

// Item types within PARA (all categories can be archived per PARA methodology)
export const ItemType = z.enum([
  'project',
  'task',
  'area',
  'contact',
  'organization',
  'resource',
  'template',
  'archived_project',
  'archived_task',
  'archived_area',
  'archived_contact',
  'archived_resource',
]);

// Individual search result schema
export const SearchResultSchema = z.object({
  itemId: z.string(),
  itemType: ItemType,
  title: z.string(),
  category: PARACategory,
  relevanceScore: z.number().min(0).max(1),
  snippet: z.string().optional(), // Text excerpt showing match context
  matchedField: z.string().optional(), // Which field matched (name, description, etc.)
  metadata: z.object({
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    parentId: z.string().optional(), // For hierarchical items (task -> project)
    status: z.string().optional(),
  }).optional(),
});

// Search metadata schema
export const SearchMetadataSchema = z.object({
  query: z.string(),
  categoriesSearched: z.array(PARACategory),
  totalResults: z.number().int().min(0),
  searchDurationMs: z.number().optional(),
  embeddingUsed: z.boolean(),
  filters: z.record(z.string()).optional(),
});

// Clarification question schema (reused pattern)
export const NavigatorClarificationSchema = z.object({
  question: z.string(),
  context: z.string().optional(),
  suggestedScopes: z.array(PARACategory).optional(),
});

// Main navigator response schema
export const NavigatorResponseSchema = z.object({
  action: z.enum([
    'search_results',   // Returning search results
    'no_results',       // No matches found
    'clarify',          // Need more information
    'navigate',         // Direct navigation to single item
  ]),
  results: z.array(SearchResultSchema).optional(),
  searchMetadata: SearchMetadataSchema.optional(),
  clarificationQuestion: NavigatorClarificationSchema.optional(),
  navigationTarget: z.object({
    itemId: z.string(),
    itemType: ItemType,
    category: PARACategory,
  }).optional(), // For direct navigation to known item
  suggestions: z.array(z.string()).optional(), // Query refinement suggestions
});

// Search mode for hybrid, semantic-only, or keyword-only search
export const SearchMode = z.enum(['hybrid', 'semantic', 'keyword']);

// Search request schema (input)
export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  categories: z.array(PARACategory).optional(), // Scope to specific categories
  searchMode: SearchMode.default('hybrid'), // hybrid=combined, semantic=vector only, keyword=FTS5 only
  limit: z.number().int().min(1).max(50).default(10),
  offset: z.number().int().min(0).default(0),
  filters: z.object({
    dateRange: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    }).optional(),
    status: z.string().optional(),
    parentId: z.string().optional(),
  }).optional(),
  includeArchived: z.boolean().default(true),
});

export type NavigatorResponse = z.infer<typeof NavigatorResponseSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchMetadata = z.infer<typeof SearchMetadataSchema>;
export type NavigatorClarification = z.infer<typeof NavigatorClarificationSchema>;
```
- [ ] 2.2 Export schema from `agent-server/src/agents/schemas/index.ts`

### Task 3: Implement Navigator Agent Class (AC: #1, #2, #3, #4, #5)

- [ ] 3.1 Create `agent-server/src/agents/navigator/index.ts`:
```typescript
// Key interfaces and class structure - follows Story 2.5/2.6/2.7 pattern
import Anthropic from '@anthropic-ai/sdk';
import { loadAgentTemplate, interpolateTemplate } from '../templates';
import {
  NavigatorResponseSchema,
  SearchRequestSchema,
  type NavigatorResponse,
  type SearchResult,
  type SearchRequest,
  type PARACategory,
} from '../schemas/navigator';
import type { AgentContext, SearchService } from '../../types';

/**
 * NavigatorAgent - PARA system search specialist
 *
 * Dependency Injection Pattern:
 * Unlike Triage/Scheduler/Communicator agents which are self-contained,
 * Navigator requires external SearchService for database queries.
 *
 * Instantiation options:
 * 1. Direct injection: new NavigatorAgent({ searchService: mySearchService })
 * 2. Factory pattern: NavigatorAgent.create() uses default service locator
 * 3. Testing: Inject mock SearchService from tests/mocks/services/search.ts
 */
export class NavigatorAgent {
  private client: Anthropic;
  private template: string;
  private searchService: SearchService;

  /**
   * Constructor requires SearchService dependency.
   * For production: Inject the SearchService from agent-server/src/services/search.ts
   * For testing: Inject MockSearchService from tests/mocks/services/search.ts
   */
  constructor(options: { searchService: SearchService }) {
    this.searchService = options.searchService;
    this.client = new Anthropic();
  }

  /**
   * Factory method for production use with default SearchService.
   * Uses service locator pattern to get SearchService from app context.
   */
  static async create(): Promise<NavigatorAgent> {
    // Import dynamically to avoid circular dependencies
    const { getSearchService } = await import('../../services');
    const searchService = getSearchService();
    const agent = new NavigatorAgent({ searchService });
    await agent.initialize();
    return agent;
  }

  async initialize(): Promise<void> {
    const loaded = await loadAgentTemplate('navigator');
    this.template = loaded.systemPrompt;
  }

  async search(request: SearchRequest, context: AgentContext): Promise<NavigatorResponse> {
    // 1. Validate request with SearchRequestSchema
    // 2. Build system prompt via interpolateTemplate()
    // 3. Determine search strategy (semantic vs keyword)
    // 4. Execute search across PARA categories via searchService
    // 5. Rank and filter results
    // 6. Format response with NavigatorResponseSchema
    // See architecture.md#6.2 for agent lifecycle implementation details
  }

  async searchAllCategories(query: string, limit: number = 10): Promise<SearchResult[]> {
    // Search all four PARA categories and merge results
  }

  async searchCategory(
    query: string,
    category: PARACategory,
    limit: number = 10
  ): Promise<SearchResult[]> {
    // Search single category
  }

  async navigateToItem(itemId: string, itemType: string): Promise<NavigatorResponse> {
    // Direct navigation to known item
  }

  private async performSemanticSearch(
    query: string,
    categories: PARACategory[],
    limit: number
  ): Promise<SearchResult[]> {
    // 1. Generate embedding for query (BGE-M3)
    // 2. Query vector store for each category
    // 3. Merge and rank results by relevance score
    return this.searchService.searchMultiple({
      query,
      categories,
      limit,
      useEmbeddings: true,
    });
  }

  private async performKeywordSearch(
    query: string,
    categories: PARACategory[],
    limit: number
  ): Promise<SearchResult[]> {
    // FTS5 full-text search across categories
    return this.searchService.searchMultiple({
      query,
      categories,
      limit,
      useEmbeddings: false,
    });
  }

  private rankResults(results: SearchResult[]): SearchResult[] {
    // Apply ranking factors:
    // - Relevance score (primary)
    // - Recency boost
    // - Exact match boost
    // Sort by composite score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private formatSnippet(content: string, query: string, maxLength: number = 150): string {
    // Extract relevant snippet around matched terms
  }
}
```
- [ ] 3.2 Export from `agent-server/src/agents/index.ts`

### Task 4: Create Test Mocks (AC: #2, #3, #4, #5)

- [ ] 4.1 Create `tests/mocks/agents/navigator.ts`:
```typescript
// Full mock data aligned with test-infra-agent-schemas.md section 2.8 (Story 2.8)
import type { NavigatorResponse, SearchResult } from '@/agents/schemas/navigator';

export const NAVIGATOR_MOCKS = {
  // Scenario: Search returns results from multiple categories
  multi_category_results: {
    action: 'search_results',
    results: [
      {
        itemId: 'proj_q4_expansion',
        itemType: 'project',
        title: 'Q4 Strategic Expansion',
        category: 'project',
        relevanceScore: 0.95,
        snippet: '...quarterly report for the strategic expansion initiative...',
        matchedField: 'description',
        metadata: {
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-14T10:30:00Z',
          status: 'active',
        },
      },
      {
        itemId: 'task_report_draft',
        itemType: 'task',
        title: 'Draft quarterly report',
        category: 'project',
        relevanceScore: 0.88,
        snippet: '...complete quarterly report draft by Friday...',
        matchedField: 'title',
        metadata: {
          parentId: 'proj_q4_expansion',
          status: 'in_progress',
        },
      },
      {
        itemId: 'res_report_template',
        itemType: 'resource',
        title: 'Quarterly Report Template',
        category: 'resource',
        relevanceScore: 0.72,
        snippet: '...standard template for quarterly reports...',
        matchedField: 'title',
      },
    ],
    searchMetadata: {
      query: 'quarterly report',
      categoriesSearched: ['project', 'area', 'resource', 'archive'],
      totalResults: 3,
      searchDurationMs: 145,
      embeddingUsed: true,
    },
  } satisfies NavigatorResponse,

  // Scenario: No results found
  no_results: {
    action: 'no_results',
    results: [],
    searchMetadata: {
      query: 'nonexistent thing xyz',
      categoriesSearched: ['project', 'area', 'resource', 'archive'],
      totalResults: 0,
      searchDurationMs: 98,
      embeddingUsed: true,
    },
    suggestions: [
      'Try broader search terms',
      'Check if item is archived',
      'Search specific category',
    ],
  } satisfies NavigatorResponse,

  // Scenario: Semantic search for natural language query
  semantic_search: {
    action: 'search_results',
    results: [
      {
        itemId: 'contact_jane_designer',
        itemType: 'contact',
        title: 'Jane Martinez',
        category: 'resource',
        relevanceScore: 0.89,
        snippet: 'UX Designer, met at TechConf 2025, works on design systems',
        matchedField: 'notes',
        metadata: {
          updatedAt: '2025-11-15T14:00:00Z',
        },
      },
    ],
    searchMetadata: {
      query: 'the designer from TechConf',
      categoriesSearched: ['resource'],
      totalResults: 1,
      searchDurationMs: 203,
      embeddingUsed: true,
    },
  } satisfies NavigatorResponse,

  // Scenario: Direct navigation to known item
  direct_navigate: {
    action: 'navigate',
    navigationTarget: {
      itemId: 'proj_phoenix',
      itemType: 'project',
      category: 'project',
    },
  } satisfies NavigatorResponse,

  // Scenario: Clarification needed
  clarify: {
    action: 'clarify',
    clarificationQuestion: {
      question: 'I found multiple items. Would you like to search a specific category?',
      context: 'Your query "report" matches items in Projects, Areas, and Resources.',
      suggestedScopes: ['project', 'resource'],
    },
  } satisfies NavigatorResponse,

  // Scenario: Archived item found
  archived_result: {
    action: 'search_results',
    results: [
      {
        itemId: 'archived_proj_legacy',
        itemType: 'archived_project',
        title: 'Legacy System Migration',
        category: 'archive',
        relevanceScore: 0.78,
        snippet: '...archived project for migrating legacy database...',
        matchedField: 'title',
        metadata: {
          createdAt: '2025-06-01T00:00:00Z',
          updatedAt: '2025-12-01T00:00:00Z',
          status: 'archived',
        },
      },
    ],
    searchMetadata: {
      query: 'legacy migration',
      categoriesSearched: ['project', 'archive'],
      totalResults: 1,
      searchDurationMs: 112,
      embeddingUsed: true,
    },
  } satisfies NavigatorResponse,

  // Scenario: Scoped search (single category)
  scoped_search: {
    action: 'search_results',
    results: [
      {
        itemId: 'area_career',
        itemType: 'area',
        title: 'Career Development',
        category: 'area',
        relevanceScore: 0.92,
        snippet: '...ongoing career development goals and responsibilities...',
        matchedField: 'title',
      },
      {
        itemId: 'area_finance',
        itemType: 'area',
        title: 'Financial Planning',
        category: 'area',
        relevanceScore: 0.65,
        snippet: '...financial goals and budget management...',
        matchedField: 'description',
      },
    ],
    searchMetadata: {
      query: 'development goals',
      categoriesSearched: ['area'], // Only areas searched
      totalResults: 2,
      searchDurationMs: 87,
      embeddingUsed: true,
    },
  } satisfies NavigatorResponse,
};
```
- [ ] 4.2 Export from `tests/mocks/agents/index.ts`

### Task 5: Write Tests (AC: #1, #2, #3, #4, #5)

- [ ] 5.1 Create `tests/unit/story-2.8-navigator.spec.ts`:
```typescript
import { test, expect, describe, vi } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import {
  NavigatorResponseSchema,
  SearchResultSchema,
  SearchRequestSchema,
  SearchMetadataSchema,
  PARACategory,
  ItemType,
} from '@/agents/schemas/navigator';
import { NAVIGATOR_MOCKS } from '../mocks/agents/navigator';

describe('Story 2.8: Navigator Agent Definition', () => {

  test('2.8.1 - Navigator prompt includes PARA search logic', async () => {
    const template = await loadAgentTemplate('navigator');

    // Should mention all PARA categories
    expect(template.systemPrompt).toMatch(/project/i);
    expect(template.systemPrompt).toMatch(/area/i);
    expect(template.systemPrompt).toMatch(/resource/i);
    expect(template.systemPrompt).toMatch(/archive/i);

    // Should describe search behavior
    expect(template.systemPrompt).toMatch(/semantic.*search|embedding/i);
    expect(template.systemPrompt).toMatch(/relevance|rank/i);

    // Should be substantial (> 1000 chars)
    expect(template.systemPrompt.length).toBeGreaterThan(1000);
  });

  test('2.8.2a - search queries all four PARA categories', () => {
    const result = NAVIGATOR_MOCKS.multi_category_results;

    expect(result.searchMetadata!.categoriesSearched).toContain('project');
    expect(result.searchMetadata!.categoriesSearched).toContain('area');
    expect(result.searchMetadata!.categoriesSearched).toContain('resource');
    expect(result.searchMetadata!.categoriesSearched).toContain('archive');
    expect(result.searchMetadata!.categoriesSearched).toHaveLength(4);
  });

  test('2.8.2b - scoped search respects category filter', () => {
    const result = NAVIGATOR_MOCKS.scoped_search;

    expect(result.searchMetadata!.categoriesSearched).toHaveLength(1);
    expect(result.searchMetadata!.categoriesSearched).toContain('area');
  });

  test('2.8.3a - semantic search uses embeddings', () => {
    const result = NAVIGATOR_MOCKS.semantic_search;

    expect(result.searchMetadata!.embeddingUsed).toBe(true);
    expect(result.searchMetadata!.query).toBe('the designer from TechConf');
  });

  test('2.8.3b - relevance scores are bounded 0.0-1.0', () => {
    const results = NAVIGATOR_MOCKS.multi_category_results.results!;

    for (const result of results) {
      expect(result.relevanceScore).toBeGreaterThanOrEqual(0.0);
      expect(result.relevanceScore).toBeLessThanOrEqual(1.0);
    }
  });

  test('2.8.3c - results are sorted by relevance (highest first)', () => {
    const results = NAVIGATOR_MOCKS.multi_category_results.results!;

    // Verify mock data is already sorted correctly
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore);
    }
  });

  test('2.8.3d - rankResults() actually sorts unsorted data', async () => {
    // Create unsorted mock data to verify sorting logic
    const unsortedResults: SearchResult[] = [
      { itemId: 'low', itemType: 'task', title: 'Low Score', category: 'project', relevanceScore: 0.3 },
      { itemId: 'high', itemType: 'project', title: 'High Score', category: 'project', relevanceScore: 0.95 },
      { itemId: 'mid', itemType: 'area', title: 'Mid Score', category: 'area', relevanceScore: 0.6 },
    ];

    // Create navigator with mock search service
    const mockSearchService = {
      searchMultiple: vi.fn().mockResolvedValue(unsortedResults),
    } as unknown as SearchService;

    const navigator = new NavigatorAgent({ searchService: mockSearchService });

    // Call private rankResults via reflection or make it protected for testing
    // Alternative: test via public search() method that calls rankResults internally
    const sorted = (navigator as any).rankResults(unsortedResults);

    // Verify sorted order: high (0.95) > mid (0.6) > low (0.3)
    expect(sorted[0].itemId).toBe('high');
    expect(sorted[1].itemId).toBe('mid');
    expect(sorted[2].itemId).toBe('low');
  });

  test('2.8.4a - search results include required fields', () => {
    const result = NAVIGATOR_MOCKS.multi_category_results.results![0];

    expect(result).toHaveProperty('itemId');
    expect(result).toHaveProperty('itemType');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('relevanceScore');
    expect(result).toHaveProperty('snippet');
  });

  test('2.8.4b - each result shows category (P/A/R/Archive)', () => {
    const results = NAVIGATOR_MOCKS.multi_category_results.results!;

    const validCategories = ['project', 'area', 'resource', 'archive'];
    for (const result of results) {
      expect(validCategories).toContain(result.category);
    }
  });

  test('2.8.5a - NavigatorResponse schema validates correctly', () => {
    // Valid multi-category results
    expect(() => NavigatorResponseSchema.parse(NAVIGATOR_MOCKS.multi_category_results)).not.toThrow();

    // Valid no results
    expect(() => NavigatorResponseSchema.parse(NAVIGATOR_MOCKS.no_results)).not.toThrow();

    // Valid clarification
    expect(() => NavigatorResponseSchema.parse(NAVIGATOR_MOCKS.clarify)).not.toThrow();

    // Valid direct navigation
    expect(() => NavigatorResponseSchema.parse(NAVIGATOR_MOCKS.direct_navigate)).not.toThrow();
  });

  test('2.8.5b - SearchResult schema validates correctly', () => {
    const validResult = NAVIGATOR_MOCKS.multi_category_results.results![0];
    expect(() => SearchResultSchema.parse(validResult)).not.toThrow();

    // Invalid: relevance score out of range
    const invalidScore = { ...validResult, relevanceScore: 1.5 };
    expect(() => SearchResultSchema.parse(invalidScore)).toThrow();

    // Invalid: missing required field
    const missingTitle = { ...validResult, title: undefined };
    expect(() => SearchResultSchema.parse(missingTitle)).toThrow();
  });

  test('2.8.5c - PARACategory enum validates correctly', () => {
    const validCategories = ['project', 'area', 'resource', 'archive'];

    for (const category of validCategories) {
      expect(() => PARACategory.parse(category)).not.toThrow();
    }

    // Invalid category
    expect(() => PARACategory.parse('invalid')).toThrow();
  });

  test('2.8.5d - ItemType enum includes all expected types', () => {
    const expectedTypes = [
      'project', 'task', 'area', 'contact', 'organization',
      'resource', 'template', 'archived_project', 'archived_task', 'archived_area',
      'archived_contact', 'archived_resource', // All PARA categories can be archived
    ];

    for (const type of expectedTypes) {
      expect(() => ItemType.parse(type)).not.toThrow();
    }
  });

  test('2.8.6 - archived results are identified correctly', () => {
    const result = NAVIGATOR_MOCKS.archived_result.results![0];

    expect(result.category).toBe('archive');
    expect(result.itemType).toBe('archived_project');
    expect(result.metadata?.status).toBe('archived');
  });

  test('2.8.7 - no results response includes suggestions', () => {
    const result = NAVIGATOR_MOCKS.no_results;

    expect(result.action).toBe('no_results');
    expect(result.results).toHaveLength(0);
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions!.length).toBeGreaterThan(0);
  });

  test('2.8.8 - search metadata includes timing info', () => {
    const metadata = NAVIGATOR_MOCKS.multi_category_results.searchMetadata!;

    expect(metadata).toHaveProperty('searchDurationMs');
    expect(metadata.searchDurationMs).toBeGreaterThan(0);
    expect(metadata).toHaveProperty('totalResults');
    expect(metadata.totalResults).toBe(3);
  });

});
```
- [ ] 5.2 Create `tests/integration/story-2.8-navigator-search.spec.ts`:
```typescript
import { test, expect, describe, vi, beforeEach } from 'vitest';
import { NavigatorAgent } from '@/agents/navigator';
import type { SearchService, SearchResult } from '@/types';
import { NAVIGATOR_MOCKS } from '../mocks/agents/navigator';

// Mock SearchService for integration testing
const createMockSearchService = (results: SearchResult[] = []): SearchService => ({
  search: vi.fn().mockResolvedValue(results),
  searchMultiple: vi.fn().mockResolvedValue(results),
  vectorSearch: vi.fn().mockResolvedValue(results),
  keywordSearch: vi.fn().mockResolvedValue(results),
});

describe('Story 2.8: Navigator Agent Integration', () => {
  let navigator: NavigatorAgent;
  let mockSearchService: SearchService;

  beforeEach(async () => {
    mockSearchService = createMockSearchService(
      NAVIGATOR_MOCKS.multi_category_results.results!
    );
    navigator = new NavigatorAgent({ searchService: mockSearchService });
    await navigator.initialize();
  });

  test('2.8.int.1 - search calls SearchService with correct parameters', async () => {
    await navigator.search({
      query: 'quarterly report',
      categories: ['project', 'resource'],
      limit: 10,
    }, { sessionId: 'test-session' });

    expect(mockSearchService.searchMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'quarterly report',
        categories: ['project', 'resource'],
        limit: 10,
      })
    );
  });

  test('2.8.int.2 - hybrid search calls both vector and keyword search', async () => {
    await navigator.search({
      query: 'design doc',
      searchMode: 'hybrid',
    }, { sessionId: 'test-session' });

    // Hybrid mode should use searchMultiple with useEmbeddings: true
    expect(mockSearchService.searchMultiple).toHaveBeenCalled();
  });

  test('2.8.int.3 - keyword-only search uses keywordSearch method', async () => {
    await navigator.search({
      query: 'exact phrase',
      searchMode: 'keyword',
    }, { sessionId: 'test-session' });

    expect(mockSearchService.keywordSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'exact phrase',
      })
    );
  });

  test('2.8.int.4 - semantic-only search uses vectorSearch method', async () => {
    await navigator.search({
      query: 'similar to design patterns',
      searchMode: 'semantic',
    }, { sessionId: 'test-session' });

    expect(mockSearchService.vectorSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'similar to design patterns',
        useEmbeddings: true,
      })
    );
  });

  test('2.8.int.5 - empty results return no_results action', async () => {
    const emptySearchService = createMockSearchService([]);
    const emptyNavigator = new NavigatorAgent({ searchService: emptySearchService });
    await emptyNavigator.initialize();

    const response = await emptyNavigator.search({
      query: 'nonexistent xyz',
    }, { sessionId: 'test-session' });

    expect(response.action).toBe('no_results');
    expect(response.results).toHaveLength(0);
    expect(response.suggestions).toBeDefined();
  });
});
```

---

## Dev Notes

### Pattern from Story 2.5, 2.6, and 2.7 (Triage/Scheduler/Communicator Agents)

Stories 2.5-2.7 established the canonical pattern for agent definition stories. Follow these patterns:

| Component | Pattern | Reference |
|-----------|---------|-----------|
| Zod Schema Structure | `z.object({...}).min().max()` with enums | `agents/schemas/triage.ts` |
| Agent Class Pattern | `initialize()` + `search()` + private helpers | `agents/navigator/index.ts` |
| Test File Naming | `story-2.X-<agent>.spec.ts` | `tests/unit/story-2.7-communicator.spec.ts` |
| Mock Structure | `AGENT_MOCKS` object with scenario keys | `tests/mocks/agents/communicator.ts` |

### Architecture Patterns (MUST FOLLOW)

**Navigator Agent in Orion Hierarchy:**
```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (Story 2.5)
    +-- Scheduler Agent (Story 2.6)
    +-- Communicator Agent (Story 2.7)
    +-- Navigator Agent (THIS STORY) <-- PARA search
    +-- Preference Learner Agent (Story 2.9)
```

**Agent Model:** Sonnet (from Story 2.2 constants - `AGENT_MODELS.navigator === 'sonnet'`)

### Navigator Agent Key Behaviors (PRD 5.2.5)

From PRD section 5.2.5, Navigator is adapted from the `scout` agent in Continuous Claude:

| Original Agent | Orion Version | Adaptation |
|----------------|---------------|------------|
| scout | navigator | Search PARA structure instead of codebase |

**Delegation Matrix (from PRD 5.2.1):**
| Intent Pattern | Delegate To | Context to Pass |
|----------------|-------------|-----------------|
| "Find...", "search for..." | Navigator | Search scope |

### PARA Framework Search Strategy

The Navigator must understand the PARA methodology for proper search:

| Category | Contains | Search Priority |
|----------|----------|-----------------|
| **Projects** | Active work with deadlines, tasks, stakeholders | High - active items |
| **Areas** | Ongoing responsibilities, goals, standards | Medium - reference items |
| **Resources** | Contacts, templates, reference material | Medium - reference items |
| **Archives** | Inactive/completed items from above categories | Low - historical items |

### Semantic Search Implementation (ARCH-009)

From architecture.md:
- **BGE-M3 embeddings** (1024 dimensions, 8192 token context)
- Stored in PostgreSQL with pgvector extension
- Hybrid search: text + vector with RRF (Reciprocal Rank Fusion)
- Search service available at `agent-server/src/services/search.ts` (Epic 1 infrastructure)

### Search Request Handling

1. **Default behavior:** Search all four categories
2. **Scoped search:** Optional `categories` parameter limits scope
3. **Natural language:** Semantic search interprets queries like "the designer from TechConf"
4. **Exact match boost:** Keyword matches score higher than pure semantic similarity

### Relevance Scoring Factors

> **Note:** These weights are reference values for hybrid search ranking.
> They are implemented in `NavigatorAgent.rankResults()` but are not schema-enforced.
> Test 2.8.3d verifies that sorting works correctly; weights can be tuned based on user feedback.

| Factor | Weight | Description |
|--------|--------|-------------|
| Vector Similarity | 0.4 | BGE-M3 embedding cosine similarity |
| Keyword Match | 0.3 | FTS5 full-text search score |
| Recency | 0.2 | More recent items score higher |
| Interaction Frequency | 0.1 | Frequently accessed items boost |

**Implementation Note:** The `rankResults()` method applies these weights when `searchMode: 'hybrid'` is used. For `semantic` or `keyword` only modes, only the respective factor is used (1.0 weight).

### Extended Thinking Note

From PRD 6.5, Navigator uses **Sonnet without extended thinking**:
> "Basic PARA searches" are in the "Skip Extended Thinking" column

This keeps searches fast and responsive.

### Database Schema Alignment

From architecture.md section 4, relevant tables for search:
```sql
-- Projects (PARA - P)
projects (id, name, description, area_id, deadline, status, stakeholders)

-- Tasks (under Projects)
tasks (id, title, description, project_id, status, due_date, priority)

-- Areas (PARA - A)
areas (id, name, description, responsibilities, goals)

-- Resources - Contacts (PARA - R)
contacts (id, name, email, phone, company, title, relationship, notes, embedding)

-- Archive metadata
-- Items have status='archived' and archived_at timestamp
```

### Search Service Interface

```typescript
// Expected SearchService interface (from Epic 1)
// NOTE: If Epic 1 search service is not yet implemented, create a mock implementation
// in tests/mocks/services/search.ts that satisfies this interface for Story 2.8 testing.
interface SearchService {
  search(options: {
    query: string;
    categories?: string[];
    limit?: number;
    useEmbeddings?: boolean;
    searchMode?: 'hybrid' | 'semantic' | 'keyword';
  }): Promise<SearchResult[]>;

  searchMultiple(options: {
    query: string;
    categories: string[];
    limit: number;
    useEmbeddings: boolean;
    searchMode?: 'hybrid' | 'semantic' | 'keyword';
  }): Promise<SearchResult[]>;

  vectorSearch(options: {
    query: string;
    useEmbeddings: true;
  }): Promise<SearchResult[]>;

  keywordSearch(options: {
    query: string;
    categories?: string[];
    limit?: number;
  }): Promise<SearchResult[]>;
}
```

**Epic 1 Dependency Note:** The SearchService is expected from `agent-server/src/services/search.ts` (Epic 1 Stories 1.4/1.6). If Epic 1 is not complete:
1. Create a mock SearchService at `tests/mocks/services/search.ts` for unit testing
2. NavigatorAgent constructor accepts SearchService via dependency injection
3. Integration tests can use the mock until Epic 1 is ready

### Project Structure Notes

```
.claude/
  agents/
    navigator.md          # Agent prompt template (CREATE - no frontmatter, pure markdown)

agent-server/
  src/
    agents/
      schemas/
        navigator.ts      # NavigatorResponseSchema, SearchResultSchema, etc.
        index.ts          # Re-export
      navigator/
        index.ts          # NavigatorAgent class
      index.ts            # Re-export all agents

tests/
  mocks/
    agents/
      navigator.ts        # NAVIGATOR_MOCKS
      index.ts            # Re-export
  unit/
    story-2.8-navigator.spec.ts
  integration/
    story-2.8-navigator-search.spec.ts
```

### Critical Design Constraints

1. **Search ALL categories by default** - User expects comprehensive results
2. **Relevance score MUST be 0.0-1.0** - Validated by Zod schema
3. **Include category label** - User needs to know where result came from
4. **Support semantic queries** - "that design doc from last month" should work
5. **Model is Sonnet** - Good balance of quality and speed for search
6. **Depends on Story 2.2** - Template loading infrastructure
7. **Uses Search Service from Epic 1** - Database search infrastructure

### Testing Standards

From test-design-epic-2.md Story 2.8 section:
| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.8.1 | Unit | Prompt includes PARA logic | Search instructions present |
| 2.8.2 | Integration | Queries all 4 categories | P/A/R/Archive searched |
| 2.8.3 | Integration | Semantic search with embeddings | Vector query used |
| 2.8.4 | E2E | Results clickable | Navigation works |
| 2.8.5 | Unit | Relevance scoring consistent | Same input = same score |

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.2 (Agent Prompt Templates)** - Template loading infrastructure, `loadAgentTemplate()` from `agent-server/src/agents/templates`
- **Story 2.1 (Butler Agent Core)** - Butler delegates to Navigator for search requests
- **Story 2.3 (Sub-Agent Spawning)** - Agent spawning mechanism for delegation
- **Epic 1 (Foundation)** - SQLite database with FTS5 and sqlite-vec for search

### Downstream Dependencies (blocked by this story)

- **Story 7.3 (Semantic Contact Search)** - Uses Navigator Agent for contact search
- **Epic 9 (Areas & Archive)** - Navigator enables archive search/restore
- **Story 2.14 (Research & Discovery Skills)** - `/explore` skill uses Navigator

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.8] - Story definition
- [Source: thoughts/planning-artifacts/architecture.md#6.1] - Agent hierarchy (ARCH-015)
- [Source: thoughts/planning-artifacts/prd.md#5.2.5] - Adapted agents (scout -> navigator)
- [Source: thoughts/planning-artifacts/prd.md#5.2.1] - Butler delegation matrix
- [Source: thoughts/planning-artifacts/architecture.md#ARCH-009] - BGE-M3 embeddings (1024 dims, 8192 token context)
  - **Note:** The canonical embedding model for Orion is **BGE-M3** per architecture.md. The `.claude/rules/dynamic-recall.md` references BGE-large-en-v1.5 which is for the Continuous Claude project (different codebase). For Orion, always use BGE-M3 with 1024 dimensions.
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.8] - Test scenarios
- [Source: thoughts/implementation-artifacts/stories/story-2-7-communicator-agent-definition.md] - Pattern reference

---

## Dev Agent Record

### Agent Model Used

(To be filled by DEV agent)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - list all files created/modified)
