# Story 2.14: Research & Discovery Skills

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-14-research-discovery-skills
**Priority:** P2
**Risk:** LOW

---

## Story

As a user,
I want research skills to explore my data and external sources,
So that I can find information efficiently.

---

## Acceptance Criteria

### AC1: Explore Skill (`/explore`)

**Given** I invoke `/explore [query]`
**When** the Explore skill executes
**Then** it searches across all PARA categories
**And** includes contacts, tasks, and archived items
**And** returns results ranked by relevance

- [ ] Create `.claude/skills/research/explore/SKILL.md` with multi-category search prompt
- [ ] Implement `ExploreSkill` class in `agent-server/src/skills/research/explore.ts`
- [ ] Search across SQLite tables: projects, areas, tasks, contacts, archive
- [ ] Combine with PostgreSQL semantic memory search
- [ ] Return structured `ExploreResult` with: results[], totalFound, query, categories searched
- [ ] Support filters: `categories` (project, area, resource, archive), `limit`
- [ ] Results include relevance score (0.0-1.0) from either FTS5 or vector search

### AC2: Research Skill (`/research`)

**Given** I invoke `/research [topic]`
**When** the Research skill executes
**Then** it searches external sources (web, if connected)
**And** summarizes findings relevant to the topic
**And** offers to save key facts to memory

- [ ] Create `.claude/skills/research/research/SKILL.md` with external research prompt
- [ ] Implement `ResearchSkill` class in `agent-server/src/skills/research/research.ts`
- [ ] Check for connected external search tools (Exa, Firecrawl via Composio)
- [ ] If external search available: query and summarize results
- [ ] If no external search: search internal memory only with explanation
- [ ] Use LLM to synthesize findings into actionable summary
- [ ] Return `ResearchResult` with: summary, sources[], suggestedMemories[], externalSearchUsed
- [ ] Offer to store key findings via `/remember` integration

### AC3: Context Skill (`/context`)

**Given** I invoke `/context [contact-name]`
**When** the Context skill executes
**Then** it retrieves contact details
**And** shows recent interactions (emails, meetings)
**And** surfaces relevant memories and preferences

- [ ] Create `.claude/skills/research/context/SKILL.md` with contact deep-dive prompt
- [ ] Implement `ContextSkill` class in `agent-server/src/skills/research/context.ts`
- [ ] Query SQLite contacts table for contact by name (fuzzy match)
- [ ] Fetch recent interactions from `inbox_items` (type: email, meeting)
- [ ] Query PostgreSQL archival_memory with contact name context
- [ ] Return `ContextResult` with: contact, recentInteractions[], relevantMemories[], preferences[]
- [ ] Format display with contact card, interaction timeline, and memory highlights

### AC4: Timeline Skill (`/timeline`)

**Given** I invoke `/timeline [project]`
**When** the Timeline skill executes
**Then** it shows project history chronologically
**And** includes tasks, emails, meetings related to project
**And** highlights key milestones and decisions

- [ ] Create `.claude/skills/research/timeline/SKILL.md` with project history prompt
- [ ] Implement `TimelineSkill` class in `agent-server/src/skills/research/timeline.ts`
- [ ] Query SQLite projects table for project by name (fuzzy match)
- [ ] Fetch tasks from `tasks` table linked to project
- [ ] Fetch related inbox_items by project_id or project name in content
- [ ] Query PostgreSQL for decisions tagged with project name
- [ ] Return `TimelineResult` with: project, events[] (chronologically sorted), milestones[], decisions[]
- [ ] Events include: type, date, description, relevance

### AC5: Connections Skill (`/connections`)

**Given** I invoke `/connections [entity-name]`
**When** the Connections skill executes
**Then** it finds items related to the entity
**And** shows cross-references (contacts linked to projects, tasks linked to emails)
**And** visualizes relationship graph

- [ ] Create `.claude/skills/research/connections/SKILL.md` with relationship discovery prompt
- [ ] Implement `ConnectionsSkill` class in `agent-server/src/skills/research/connections.ts`
- [ ] Query `entity_links` table for direct relationships
- [ ] Use semantic search to find indirectly related items
- [ ] Aggregate relationships: contact-project, project-task, task-email, etc.
- [ ] Return `ConnectionsResult` with: entity, directLinks[], inferredLinks[], graphData
- [ ] Graph data suitable for visualization (nodes, edges)
- [ ] graphData must include `nodes: GraphNode[]` with id/label/type/size and `edges: GraphEdge[]` with source/target/relationship/weight for frontend relationship graph rendering

---

## Tasks / Subtasks

### Task 1: Create Research Schemas (AC: #1, #2, #3, #4, #5)

- [ ] 1.1 Create `agent-server/src/skills/research/schemas.ts`:

```typescript
import { z } from 'zod';

/**
 * PARA categories for search
 */
export const ParaCategoryEnum = z.enum([
  'project',
  'area',
  'resource',
  'archive',
  'contact',
  'task',
  'inbox',
]);

export type ParaCategory = z.infer<typeof ParaCategoryEnum>;

/**
 * Search result item from any source
 */
export const SearchResultItemSchema = z.object({
  // Use z.union for better type inference and compatibility with both SQLite (number) and string IDs
  id: z.union([z.string(), z.number()]),
  type: ParaCategoryEnum,
  title: z.string(),
  snippet: z.string(),
  relevanceScore: z.number().min(0).max(1),
  source: z.enum(['sqlite', 'postgres', 'external']),
  createdAt: z.date().or(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

/**
 * Explore skill input
 */
export const ExploreInputSchema = z.object({
  query: z.string().min(1),
  categories: z.array(ParaCategoryEnum).optional(),
  limit: z.number().min(1).max(50).default(10),
  includeArchive: z.boolean().default(false),
});

export type ExploreInput = z.infer<typeof ExploreInputSchema>;

/**
 * Explore skill result
 */
export const ExploreResultSchema = z.object({
  results: z.array(SearchResultItemSchema),
  totalFound: z.number(),
  query: z.string(),
  categoriesSearched: z.array(ParaCategoryEnum),
});

export type ExploreResult = z.infer<typeof ExploreResultSchema>;

/**
 * External source for research
 */
export const ResearchSourceSchema = z.object({
  url: z.string().optional(),
  title: z.string(),
  snippet: z.string(),
  source: z.enum(['exa', 'firecrawl', 'memory', 'internal']),
  relevance: z.number().min(0).max(1).optional(),
});

export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

/**
 * Suggested memory from research
 */
export const SuggestedMemorySchema = z.object({
  content: z.string(),
  type: z.enum(['decision', 'working_solution', 'contact_info', 'project_context']),
  tags: z.array(z.string()),
  confidence: z.enum(['high', 'medium', 'low']),
});

export type SuggestedMemory = z.infer<typeof SuggestedMemorySchema>;

/**
 * Research skill input
 */
export const ResearchInputSchema = z.object({
  topic: z.string().min(3),
  includeExternal: z.boolean().default(true),
  maxSources: z.number().min(1).max(20).default(5),
});

export type ResearchInput = z.infer<typeof ResearchInputSchema>;

/**
 * Research skill result
 */
export const ResearchResultSchema = z.object({
  summary: z.string(),
  sources: z.array(ResearchSourceSchema),
  suggestedMemories: z.array(SuggestedMemorySchema),
  externalSearchUsed: z.boolean(),
  searchServices: z.array(z.string()),
});

export type ResearchResult = z.infer<typeof ResearchResultSchema>;

/**
 * Interaction record for context
 */
export const InteractionSchema = z.object({
  id: z.string().or(z.number()),
  type: z.enum(['email', 'meeting', 'task', 'note']),
  title: z.string(),
  date: z.date().or(z.string()),
  snippet: z.string().optional(),
  direction: z.enum(['inbound', 'outbound', 'internal']).optional(),
});

export type Interaction = z.infer<typeof InteractionSchema>;

/**
 * Contact for context skill
 */
export const ContactDetailSchema = z.object({
  id: z.string().or(z.number()),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  relationship: z.string().optional(),
  timezone: z.string().optional(),
  preferredChannel: z.enum(['email', 'phone', 'slack', 'meeting']).optional(),
});

export type ContactDetail = z.infer<typeof ContactDetailSchema>;

/**
 * Context skill input
 */
export const ContextInputSchema = z.object({
  contactName: z.string().min(1),
  interactionLimit: z.number().min(1).max(50).default(10),
  includeMemories: z.boolean().default(true),
});

export type ContextInput = z.infer<typeof ContextInputSchema>;

/**
 * Context skill result
 */
export const ContextResultSchema = z.object({
  contact: ContactDetailSchema,
  recentInteractions: z.array(InteractionSchema),
  relevantMemories: z.array(z.object({
    id: z.number(),
    content: z.string(),
    type: z.string(),
    createdAt: z.string().or(z.date()),
  })),
  preferences: z.array(z.object({
    key: z.string(),
    value: z.string(),
    source: z.enum(['explicit', 'observed', 'inferred']),
  })),
});

export type ContextResult = z.infer<typeof ContextResultSchema>;

/**
 * Timeline event
 */
export const TimelineEventSchema = z.object({
  id: z.string().or(z.number()),
  type: z.enum(['task_created', 'task_completed', 'email_received', 'email_sent', 'meeting', 'decision', 'milestone']),
  date: z.date().or(z.string()),
  title: z.string(),
  description: z.string().optional(),
  relevance: z.number().min(0).max(1).optional(),
  entityId: z.string().or(z.number()).optional(),
  entityType: z.string().optional(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

/**
 * Decision record from memory
 */
export const DecisionSchema = z.object({
  id: z.number(),
  content: z.string(),
  context: z.string().optional(),
  date: z.date().or(z.string()),
  confidence: z.enum(['high', 'medium', 'low']),
});

export type Decision = z.infer<typeof DecisionSchema>;

/**
 * Milestone marker
 */
export const MilestoneSchema = z.object({
  title: z.string(),
  date: z.date().or(z.string()),
  type: z.enum(['start', 'complete', 'review', 'launch', 'custom']),
  description: z.string().optional(),
});

export type Milestone = z.infer<typeof MilestoneSchema>;

/**
 * Timeline skill input
 */
export const TimelineInputSchema = z.object({
  projectName: z.string().min(1),
  dateRange: z.object({
    start: z.date().or(z.string()).optional(),
    end: z.date().or(z.string()).optional(),
  }).optional(),
  eventLimit: z.number().min(1).max(100).default(50),
});

export type TimelineInput = z.infer<typeof TimelineInputSchema>;

/**
 * Timeline skill result
 */
export const TimelineResultSchema = z.object({
  project: z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    status: z.string(),
    deadline: z.date().or(z.string()).optional(),
  }),
  events: z.array(TimelineEventSchema),
  milestones: z.array(MilestoneSchema),
  decisions: z.array(DecisionSchema),
});

export type TimelineResult = z.infer<typeof TimelineResultSchema>;

/**
 * Connection/link between entities
 */
export const EntityLinkSchema = z.object({
  sourceType: z.string(),
  sourceId: z.string().or(z.number()),
  sourceName: z.string(),
  targetType: z.string(),
  targetId: z.string().or(z.number()),
  targetName: z.string(),
  relationship: z.enum(['owner', 'collaborator', 'related', 'mentioned', 'linked']),
  strength: z.number().min(0).max(1).optional(),
});

export type EntityLink = z.infer<typeof EntityLinkSchema>;

/**
 * Graph node for visualization
 */
export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  size: z.number().optional(),
});

export type GraphNode = z.infer<typeof GraphNodeSchema>;

/**
 * Graph edge for visualization
 */
export const GraphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  relationship: z.string(),
  weight: z.number().optional(),
});

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

/**
 * Connections skill input
 */
export const ConnectionsInputSchema = z.object({
  entityName: z.string().min(1),
  entityType: z.enum(['contact', 'project', 'area', 'task']).optional(),
  depth: z.number().min(1).max(3).default(2),
});

export type ConnectionsInput = z.infer<typeof ConnectionsInputSchema>;

/**
 * Connections skill result
 */
export const ConnectionsResultSchema = z.object({
  entity: z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    type: z.string(),
  }),
  directLinks: z.array(EntityLinkSchema),
  inferredLinks: z.array(EntityLinkSchema),
  graphData: z.object({
    nodes: z.array(GraphNodeSchema),
    edges: z.array(GraphEdgeSchema),
  }),
});

export type ConnectionsResult = z.infer<typeof ConnectionsResultSchema>;
```

- [ ] 1.2 Export from `agent-server/src/skills/research/index.ts`

### Task 2: Implement Search Service for Multi-Source Queries (AC: #1, #3, #4)

- [ ] 2.1 Create `agent-server/src/services/search-service.ts`:

```typescript
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import type { SearchResultItem, ParaCategory } from '../skills/research/schemas';

/**
 * SearchService - Multi-source search across SQLite and PostgreSQL
 */
export class SearchService {
  private sqlite: Database.Database;
  private pgPool: Pool;

  constructor(options: {
    sqlite?: Database.Database;
    pgPool?: Pool;
    sqlitePath?: string;
  }) {
    this.sqlite = options.sqlite ?? new Database(
      options.sqlitePath ?? process.env.SQLITE_PATH ?? 'orion.db'
    );
    this.pgPool = options.pgPool ?? new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  /**
   * Search across multiple PARA categories
   */
  async searchMultiple(options: {
    query: string;
    categories: ParaCategory[];
    limit: number;
  }): Promise<SearchResultItem[]> {
    const { query, categories, limit } = options;
    const results: SearchResultItem[] = [];

    // Search each category
    for (const category of categories) {
      const categoryResults = await this.searchCategory(query, category, Math.ceil(limit / categories.length));
      results.push(...categoryResults);
    }

    // Sort by relevance and limit
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Search a single category
   */
  async searchCategory(
    query: string,
    category: ParaCategory,
    limit: number
  ): Promise<SearchResultItem[]> {
    const tableMappings: Record<ParaCategory, { table: string; titleCol: string; snippetCol: string }> = {
      project: { table: 'projects', titleCol: 'name', snippetCol: 'description' },
      area: { table: 'areas', titleCol: 'name', snippetCol: 'description' },
      resource: { table: 'resources', titleCol: 'title', snippetCol: 'content' },
      archive: { table: 'archive', titleCol: 'original_name', snippetCol: 'archive_reason' },
      contact: { table: 'contacts', titleCol: 'name', snippetCol: 'notes' },
      task: { table: 'tasks', titleCol: 'title', snippetCol: 'description' },
      inbox: { table: 'inbox_items', titleCol: 'title', snippetCol: 'preview' },
    };

    const mapping = tableMappings[category];
    if (!mapping) return [];

    // Use FTS5 if available, otherwise LIKE search
    try {
      // Try FTS5 search first
      const fts = this.sqlite.prepare(`
        SELECT
          id,
          ${mapping.titleCol} as title,
          ${mapping.snippetCol} as snippet,
          bm25(${mapping.table}_fts) as score
        FROM ${mapping.table}_fts
        WHERE ${mapping.table}_fts MATCH ?
        ORDER BY score
        LIMIT ?
      `);

      const rows = fts.all(query, limit);
      return rows.map((row: any) => ({
        id: row.id,
        type: category,
        title: row.title || '',
        snippet: row.snippet || '',
        relevanceScore: Math.min(1, Math.abs(row.score) / 10), // Normalize BM25
        source: 'sqlite' as const,
      }));
    } catch {
      // Fallback to LIKE search
      const stmt = this.sqlite.prepare(`
        SELECT id, ${mapping.titleCol} as title, ${mapping.snippetCol} as snippet
        FROM ${mapping.table}
        WHERE ${mapping.titleCol} LIKE ? OR ${mapping.snippetCol} LIKE ?
        LIMIT ?
      `);

      const pattern = `%${query}%`;
      const rows = stmt.all(pattern, pattern, limit);
      return rows.map((row: any) => ({
        id: row.id,
        type: category,
        title: row.title || '',
        snippet: row.snippet || '',
        relevanceScore: 0.5, // Default relevance for LIKE matches
        source: 'sqlite' as const,
      }));
    }
  }

  /**
   * Search contacts by name with fuzzy matching
   */
  searchContactByName(name: string): any | null {
    const stmt = this.sqlite.prepare(`
      SELECT * FROM contacts
      WHERE name LIKE ?
      ORDER BY
        CASE
          WHEN LOWER(name) = LOWER(?) THEN 1
          WHEN LOWER(name) LIKE LOWER(?) || '%' THEN 2
          ELSE 3
        END
      LIMIT 1
    `);

    return stmt.get(`%${name}%`, name, name) ?? null;
  }

  /**
   * Search projects by name with fuzzy matching
   */
  searchProjectByName(name: string): any | null {
    const stmt = this.sqlite.prepare(`
      SELECT * FROM projects
      WHERE name LIKE ?
      ORDER BY
        CASE
          WHEN LOWER(name) = LOWER(?) THEN 1
          WHEN LOWER(name) LIKE LOWER(?) || '%' THEN 2
          ELSE 3
        END
      LIMIT 1
    `);

    return stmt.get(`%${name}%`, name, name) ?? null;
  }

  /**
   * Get interactions for a contact
   */
  getContactInteractions(contactId: string | number, limit: number = 10): any[] {
    const stmt = this.sqlite.prepare(`
      SELECT
        id,
        source_tool as type,
        title,
        received_at as date,
        preview as snippet
      FROM inbox_items
      WHERE (from_email = (SELECT email FROM contacts WHERE id = ?) OR
             to_email = (SELECT email FROM contacts WHERE id = ?))
      ORDER BY received_at DESC
      LIMIT ?
    `);

    return stmt.all(contactId, contactId, limit);
  }

  /**
   * Get tasks for a project
   */
  getProjectTasks(projectId: string | number): any[] {
    const stmt = this.sqlite.prepare(`
      SELECT *
      FROM tasks
      WHERE project_id = ?
      ORDER BY created_at DESC
    `);

    return stmt.all(projectId);
  }

  /**
   * Get entity links
   */
  getEntityLinks(entityType: string, entityId: string | number): any[] {
    const stmt = this.sqlite.prepare(`
      SELECT *
      FROM entity_links
      WHERE (source_type = ? AND source_id = ?)
         OR (target_type = ? AND target_id = ?)
    `);

    return stmt.all(entityType, entityId, entityType, entityId);
  }

  /**
   * Search semantic memory (PostgreSQL)
   */
  async searchMemory(
    queryEmbedding: number[],
    options: { limit?: number; types?: string[] } = {}
  ): Promise<any[]> {
    const { limit = 5, types } = options;

    let sql = `
      SELECT
        id,
        memory_type as type,
        content,
        context,
        created_at,
        1 - (embedding <=> $1::vector) as score
      FROM archival_memory
      WHERE embedding IS NOT NULL
        AND deleted_at IS NULL
    `;

    const params: any[] = [`[${queryEmbedding.join(',')}]`];

    if (types?.length) {
      params.push(types);
      sql += ` AND memory_type = ANY($${params.length})`;
    }

    params.push(limit);
    sql += ` ORDER BY score DESC LIMIT $${params.length}`;

    const result = await this.pgPool.query(sql, params);
    return result.rows;
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    this.sqlite.close();
    await this.pgPool.end();
  }
}
```

- [ ] 2.2 Export from `agent-server/src/services/index.ts`

### Task 3: Implement Explore Skill (AC: #1)

- [ ] 3.1 Create `agent-server/src/skills/research/explore.ts`:

```typescript
import { SearchService } from '../../services/search-service';
// EmbeddingService is defined in Story 2.13 (agent-server/src/services/embedding-service.ts)
// It wraps the opc/ embedding infrastructure (OPC_EMBEDDING_URL) for TypeScript consumption
import { EmbeddingService } from '../../services/embedding-service';
import type { ExploreInput, ExploreResult, SearchResultItem } from './schemas';
import { ExploreInputSchema, ExploreResultSchema, ParaCategoryEnum } from './schemas';

/**
 * ExploreSkill - Search across all PARA categories
 */
export class ExploreSkill {
  searchService: SearchService;
  private embeddingService: EmbeddingService;

  constructor(options: {
    searchService?: SearchService;
    embeddingService?: EmbeddingService;
  } = {}) {
    this.searchService = options.searchService ?? new SearchService({});
    this.embeddingService = options.embeddingService ?? new EmbeddingService();
  }

  /**
   * Execute explore skill
   */
  async execute(input: ExploreInput): Promise<ExploreResult> {
    // Validate input
    const validatedInput = ExploreInputSchema.parse(input);
    const { query, categories, limit, includeArchive } = validatedInput;

    // Determine categories to search
    let searchCategories = categories ?? ['project', 'area', 'contact', 'task', 'inbox'];
    if (includeArchive && !searchCategories.includes('archive')) {
      searchCategories = [...searchCategories, 'archive'];
    }

    // Search SQLite categories
    const sqliteResults = await this.searchService.searchMultiple({
      query,
      categories: searchCategories as any[],
      limit: Math.ceil(limit * 0.7), // 70% from SQLite
    });

    // Also search semantic memory for broader context
    let memoryResults: SearchResultItem[] = [];
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      const memories = await this.searchService.searchMemory(queryEmbedding, {
        limit: Math.ceil(limit * 0.3), // 30% from memory
      });

      memoryResults = memories.map(m => ({
        id: m.id,
        type: 'resource' as const, // Memory treated as resource
        title: m.type,
        snippet: m.content.substring(0, 200),
        relevanceScore: m.score,
        source: 'postgres' as const,
        createdAt: m.created_at,
        metadata: { memoryType: m.type, context: m.context },
      }));
    } catch (error) {
      console.warn('[ExploreSkill] Memory search failed:', error);
    }

    // Combine and sort results
    const allResults = [...sqliteResults, ...memoryResults]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Build result
    const result: ExploreResult = {
      results: allResults,
      totalFound: allResults.length,
      query,
      categoriesSearched: searchCategories as any[],
    };

    return ExploreResultSchema.parse(result);
  }

  /**
   * Format results for display
   */
  formatForDisplay(result: ExploreResult): string {
    if (result.results.length === 0) {
      return `No results found for "${result.query}" in ${result.categoriesSearched.join(', ')}.`;
    }

    const lines = [
      `# Explore Results for "${result.query}"`,
      '',
      `Found ${result.totalFound} results across ${result.categoriesSearched.join(', ')}:`,
      '',
    ];

    // Group by type
    const byType = result.results.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, SearchResultItem[]>);

    for (const [type, items] of Object.entries(byType)) {
      lines.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)}s`, '');
      for (const item of items) {
        const score = (item.relevanceScore * 100).toFixed(0);
        lines.push(`- **${item.title}** (${score}% match)`);
        if (item.snippet) {
          lines.push(`  ${item.snippet.substring(0, 100)}...`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
```

- [ ] 3.2 Export from `agent-server/src/skills/research/index.ts`

### Task 4: Implement Research Skill (AC: #2)

- [ ] 4.1 Create `agent-server/src/skills/research/research.ts`:

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { SearchService } from '../../services/search-service';
import { EmbeddingService } from '../../services/embedding-service';
import type { ResearchInput, ResearchResult, ResearchSource, SuggestedMemory } from './schemas';
import { ResearchInputSchema, ResearchResultSchema } from './schemas';

/**
 * ResearchSkill - Search external and internal sources for topic research
 */
export class ResearchSkill {
  private client: Anthropic;
  private searchService: SearchService;
  private embeddingService: EmbeddingService;

  constructor(options: {
    client?: Anthropic;
    searchService?: SearchService;
    embeddingService?: EmbeddingService;
  } = {}) {
    this.client = options.client ?? new Anthropic();
    this.searchService = options.searchService ?? new SearchService({});
    this.embeddingService = options.embeddingService ?? new EmbeddingService();
  }

  /**
   * Execute research skill
   */
  async execute(input: ResearchInput): Promise<ResearchResult> {
    // Validate input
    const validatedInput = ResearchInputSchema.parse(input);
    const { topic, includeExternal, maxSources } = validatedInput;

    const sources: ResearchSource[] = [];
    const searchServices: string[] = [];
    let externalSearchUsed = false;

    // 1. Search internal memory first
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(topic);
      const memories = await this.searchService.searchMemory(queryEmbedding, {
        limit: Math.ceil(maxSources / 2),
      });

      for (const m of memories) {
        sources.push({
          title: `Memory: ${m.type}`,
          snippet: m.content,
          source: 'memory',
          relevance: m.score,
        });
      }
      searchServices.push('internal-memory');
    } catch (error) {
      console.warn('[ResearchSkill] Memory search failed:', error);
    }

    // 2. Search internal PARA data
    try {
      const paraResults = await this.searchService.searchMultiple({
        query: topic,
        categories: ['project', 'area', 'resource'],
        limit: Math.ceil(maxSources / 2),
      });

      for (const r of paraResults) {
        sources.push({
          title: `${r.type}: ${r.title}`,
          snippet: r.snippet,
          source: 'internal',
          relevance: r.relevanceScore,
        });
      }
      searchServices.push('internal-para');
    } catch (error) {
      console.warn('[ResearchSkill] PARA search failed:', error);
    }

    // 3. External search if available and requested
    if (includeExternal) {
      // Check for Composio Exa/Firecrawl tools
      // For now, log that external search would be attempted
      // This will be fully implemented when Epic 3 (tool connections) is complete
      console.log('[ResearchSkill] External search requested - requires Epic 3 tool connections');
      // TODO: Integrate with Composio Exa/Firecrawl when available
    }

    // 4. Synthesize findings with LLM
    const summary = await this.synthesizeFindings(topic, sources);

    // 5. Suggest memories to store
    const suggestedMemories = await this.suggestMemories(topic, summary, sources);

    // Build result
    const result: ResearchResult = {
      summary,
      sources,
      suggestedMemories,
      externalSearchUsed,
      searchServices,
    };

    return ResearchResultSchema.parse(result);
  }

  /**
   * Synthesize findings into a summary using LLM
   */
  private async synthesizeFindings(topic: string, sources: ResearchSource[]): Promise<string> {
    if (sources.length === 0) {
      return `No relevant information found for "${topic}". Consider connecting external search tools (Exa, Firecrawl) for broader research.`;
    }

    const sourceText = sources
      .map((s, i) => `[${i + 1}] ${s.title}: ${s.snippet}`)
      .join('\n\n');

    // Model selection: Using claude-sonnet-4-5 for synthesis tasks.
    // For different model requirements, make this configurable via constructor options
    // or follow architecture.md guidelines for model selection based on task complexity.
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: 'You are a research assistant. Synthesize the provided sources into a clear, actionable summary about the topic.',
      messages: [{
        role: 'user',
        content: `Topic: ${topic}\n\nSources:\n${sourceText}\n\nProvide a concise summary of key findings.`,
      }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : 'Unable to synthesize findings.';
  }

  /**
   * Suggest memories to store from research
   */
  private async suggestMemories(
    topic: string,
    summary: string,
    sources: ResearchSource[]
  ): Promise<SuggestedMemory[]> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: `You are a memory assistant. Based on research findings, suggest key facts that should be stored for future recall. Return JSON array:
[{"content": "fact to remember", "type": "decision|working_solution|contact_info|project_context", "tags": ["tag1"], "confidence": "high|medium|low"}]`,
      messages: [{
        role: 'user',
        content: `Topic: ${topic}\nSummary: ${summary}\n\nSuggest 1-3 key facts to remember.`,
      }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '[]';

    try {
      return JSON.parse(responseText);
    } catch {
      return [];
    }
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: ResearchResult): string {
    const lines = [
      '# Research Results',
      '',
      '## Summary',
      result.summary,
      '',
    ];

    if (result.sources.length > 0) {
      lines.push('## Sources', '');
      for (const source of result.sources) {
        const relevance = source.relevance ? ` (${(source.relevance * 100).toFixed(0)}% relevant)` : '';
        lines.push(`- **${source.title}**${relevance} [${source.source}]`);
        lines.push(`  ${source.snippet.substring(0, 150)}...`);
        lines.push('');
      }
    }

    if (result.suggestedMemories.length > 0) {
      lines.push('## Suggested Memories to Store', '');
      lines.push('Use `/remember` to save these findings:', '');
      for (const mem of result.suggestedMemories) {
        lines.push(`- **${mem.type}**: ${mem.content}`);
        lines.push(`  Tags: ${mem.tags.join(', ')}`);
        lines.push('');
      }
    }

    lines.push(`_Searched: ${result.searchServices.join(', ')}_`);
    if (!result.externalSearchUsed) {
      lines.push('_Note: External search not used. Connect Exa/Firecrawl for broader research._');
    }

    return lines.join('\n');
  }
}
```

- [ ] 4.2 Export from `agent-server/src/skills/research/index.ts`

### Task 5: Implement Context Skill (AC: #3)

- [ ] 5.1 Create `agent-server/src/skills/research/context.ts`:

```typescript
import { SearchService } from '../../services/search-service';
import { EmbeddingService } from '../../services/embedding-service';
import type { ContextInput, ContextResult } from './schemas';
import { ContextInputSchema, ContextResultSchema } from './schemas';

/**
 * ContextSkill - Deep dive into contact context
 */
export class ContextSkill {
  private searchService: SearchService;
  private embeddingService: EmbeddingService;

  constructor(options: {
    searchService?: SearchService;
    embeddingService?: EmbeddingService;
  } = {}) {
    this.searchService = options.searchService ?? new SearchService({});
    this.embeddingService = options.embeddingService ?? new EmbeddingService();
  }

  /**
   * Execute context skill
   */
  async execute(input: ContextInput): Promise<ContextResult> {
    // Validate input
    const validatedInput = ContextInputSchema.parse(input);
    const { contactName, interactionLimit, includeMemories } = validatedInput;

    // 1. Find contact by name
    const contactRow = this.searchService.searchContactByName(contactName);

    if (!contactRow) {
      throw new Error(`Contact "${contactName}" not found. Try a different name or partial match.`);
    }

    // 2. Build contact detail
    const contact = {
      id: contactRow.id,
      name: contactRow.name,
      email: contactRow.email ?? undefined,
      phone: contactRow.phone ?? undefined,
      company: contactRow.company ?? undefined,
      title: contactRow.title ?? undefined,
      relationship: contactRow.relationship ?? undefined,
      timezone: contactRow.timezone ?? undefined,
      preferredChannel: contactRow.preferred_channel ?? undefined,
    };

    // 3. Get recent interactions
    const interactionRows = this.searchService.getContactInteractions(
      contact.id,
      interactionLimit
    );

    const recentInteractions = interactionRows.map(row => ({
      id: row.id,
      type: row.type === 'gmail' ? 'email' as const : row.type,
      title: row.title,
      date: row.date,
      snippet: row.snippet,
      direction: row.direction ?? undefined,
    }));

    // 4. Get relevant memories
    let relevantMemories: ContextResult['relevantMemories'] = [];
    if (includeMemories) {
      try {
        const queryEmbedding = await this.embeddingService.generateEmbedding(
          `${contact.name} ${contact.company ?? ''}`
        );
        const memories = await this.searchService.searchMemory(queryEmbedding, {
          limit: 5,
          types: ['contact_info', 'preference', 'decision'],
        });

        relevantMemories = memories.map(m => ({
          id: m.id,
          content: m.content,
          type: m.type,
          createdAt: m.created_at,
        }));
      } catch (error) {
        console.warn('[ContextSkill] Memory search failed:', error);
      }
    }

    // 5. Extract preferences from memories
    const preferences = relevantMemories
      .filter(m => m.type === 'preference')
      .map(m => ({
        key: 'preference',
        value: m.content,
        source: 'observed' as const,
      }));

    // Add known contact preferences
    if (contact.preferredChannel) {
      preferences.push({
        key: 'communication_channel',
        value: contact.preferredChannel,
        source: 'explicit' as const,
      });
    }
    if (contact.timezone) {
      preferences.push({
        key: 'timezone',
        value: contact.timezone,
        source: 'explicit' as const,
      });
    }

    // Build result
    const result: ContextResult = {
      contact,
      recentInteractions,
      relevantMemories,
      preferences,
    };

    return ContextResultSchema.parse(result);
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: ContextResult): string {
    const { contact, recentInteractions, relevantMemories, preferences } = result;

    const lines = [
      `# ${contact.name}`,
      '',
      '## Contact Details',
    ];

    if (contact.email) lines.push(`- **Email:** ${contact.email}`);
    if (contact.phone) lines.push(`- **Phone:** ${contact.phone}`);
    if (contact.company) lines.push(`- **Company:** ${contact.company}`);
    if (contact.title) lines.push(`- **Title:** ${contact.title}`);
    if (contact.relationship) lines.push(`- **Relationship:** ${contact.relationship}`);
    lines.push('');

    if (recentInteractions.length > 0) {
      lines.push('## Recent Interactions', '');
      for (const interaction of recentInteractions.slice(0, 5)) {
        const date = new Date(interaction.date).toLocaleDateString();
        lines.push(`- **${interaction.type}** (${date}): ${interaction.title}`);
        if (interaction.snippet) {
          lines.push(`  _${interaction.snippet.substring(0, 100)}..._`);
        }
      }
      lines.push('');
    }

    if (preferences.length > 0) {
      lines.push('## Known Preferences', '');
      for (const pref of preferences) {
        lines.push(`- **${pref.key}:** ${pref.value} _(${pref.source})_`);
      }
      lines.push('');
    }

    if (relevantMemories.length > 0) {
      lines.push('## Relevant Memories', '');
      for (const mem of relevantMemories) {
        lines.push(`- **${mem.type}:** ${mem.content.substring(0, 100)}...`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
```

- [ ] 5.2 Export from `agent-server/src/skills/research/index.ts`

### Task 6: Implement Timeline Skill (AC: #4)

- [ ] 6.1 Create `agent-server/src/skills/research/timeline.ts`:

```typescript
import { SearchService } from '../../services/search-service';
import { EmbeddingService } from '../../services/embedding-service';
import type { TimelineInput, TimelineResult, TimelineEvent, Milestone, Decision } from './schemas';
import { TimelineInputSchema, TimelineResultSchema } from './schemas';

/**
 * TimelineSkill - Show project history chronologically
 */
export class TimelineSkill {
  private searchService: SearchService;
  private embeddingService: EmbeddingService;

  constructor(options: {
    searchService?: SearchService;
    embeddingService?: EmbeddingService;
  } = {}) {
    this.searchService = options.searchService ?? new SearchService({});
    this.embeddingService = options.embeddingService ?? new EmbeddingService();
  }

  /**
   * Execute timeline skill
   */
  async execute(input: TimelineInput): Promise<TimelineResult> {
    // Validate input
    const validatedInput = TimelineInputSchema.parse(input);
    const { projectName, dateRange, eventLimit } = validatedInput;

    // 1. Find project by name
    const projectRow = this.searchService.searchProjectByName(projectName);

    if (!projectRow) {
      throw new Error(`Project "${projectName}" not found. Try a different name.`);
    }

    const project = {
      id: projectRow.id,
      name: projectRow.name,
      status: projectRow.status,
      deadline: projectRow.deadline ?? undefined,
    };

    // 2. Get project tasks
    const taskRows = this.searchService.getProjectTasks(project.id);
    const taskEvents: TimelineEvent[] = [];

    for (const task of taskRows) {
      // Task created event
      taskEvents.push({
        id: `task-${task.id}-created`,
        type: 'task_created',
        date: task.created_at,
        title: `Task created: ${task.title}`,
        description: task.description,
        entityId: task.id,
        entityType: 'task',
      });

      // Task completed event
      if (task.status === 'completed' && task.completed_at) {
        taskEvents.push({
          id: `task-${task.id}-completed`,
          type: 'task_completed',
          date: task.completed_at,
          title: `Task completed: ${task.title}`,
          entityId: task.id,
          entityType: 'task',
        });
      }
    }

    // 3. Get decisions from memory
    let decisions: Decision[] = [];
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(
        `decision ${project.name}`
      );
      const memoryDecisions = await this.searchService.searchMemory(queryEmbedding, {
        limit: 10,
        types: ['decision'],
      });

      decisions = memoryDecisions.map(m => ({
        id: m.id,
        content: m.content,
        context: m.context,
        date: m.created_at,
        confidence: m.confidence ?? 'medium',
      }));

      // Add decisions as timeline events
      for (const decision of decisions) {
        taskEvents.push({
          id: `decision-${decision.id}`,
          type: 'decision',
          date: decision.date,
          title: 'Decision made',
          description: decision.content,
          entityId: decision.id,
          entityType: 'decision',
        });
      }
    } catch (error) {
      console.warn('[TimelineSkill] Memory search failed:', error);
    }

    // 4. Filter by date range if specified
    let events = taskEvents;
    if (dateRange?.start || dateRange?.end) {
      events = events.filter(e => {
        const eventDate = new Date(e.date);
        if (dateRange.start && eventDate < new Date(dateRange.start)) return false;
        if (dateRange.end && eventDate > new Date(dateRange.end)) return false;
        return true;
      });
    }

    // 5. Sort chronologically and limit
    events = events
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, eventLimit);

    // 6. Generate milestones
    const milestones: Milestone[] = [];

    // Project start
    if (project.id) {
      milestones.push({
        title: 'Project Started',
        date: events[0]?.date ?? new Date().toISOString(),
        type: 'start',
      });
    }

    // Deadline as milestone
    if (project.deadline) {
      milestones.push({
        title: 'Deadline',
        date: project.deadline,
        type: 'complete',
      });
    }

    // Build result
    const result: TimelineResult = {
      project,
      events,
      milestones,
      decisions,
    };

    return TimelineResultSchema.parse(result);
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: TimelineResult): string {
    const { project, events, milestones, decisions } = result;

    const lines = [
      `# Timeline: ${project.name}`,
      '',
      `**Status:** ${project.status}`,
    ];

    if (project.deadline) {
      lines.push(`**Deadline:** ${new Date(project.deadline).toLocaleDateString()}`);
    }
    lines.push('');

    if (milestones.length > 0) {
      lines.push('## Milestones', '');
      for (const milestone of milestones) {
        const date = new Date(milestone.date).toLocaleDateString();
        lines.push(`- **${milestone.title}** (${date})`);
      }
      lines.push('');
    }

    if (events.length > 0) {
      lines.push('## Timeline', '');
      for (const event of events) {
        const date = new Date(event.date).toLocaleDateString();
        const icon = this.getEventIcon(event.type);
        lines.push(`${icon} **${date}** - ${event.title}`);
        if (event.description) {
          lines.push(`  _${event.description.substring(0, 100)}..._`);
        }
      }
      lines.push('');
    }

    if (decisions.length > 0) {
      lines.push('## Key Decisions', '');
      for (const decision of decisions) {
        const date = new Date(decision.date).toLocaleDateString();
        lines.push(`- (${date}) ${decision.content}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  private getEventIcon(type: TimelineEvent['type']): string {
    const icons: Record<TimelineEvent['type'], string> = {
      task_created: '[+]',
      task_completed: '[x]',
      email_received: '[<]',
      email_sent: '[>]',
      meeting: '[o]',
      decision: '[*]',
      milestone: '[!]',
    };
    return icons[type] ?? '[-]';
  }
}
```

- [ ] 6.2 Export from `agent-server/src/skills/research/index.ts`

### Task 7: Implement Connections Skill (AC: #5)

- [ ] 7.1 Create `agent-server/src/skills/research/connections.ts`:

```typescript
import { SearchService } from '../../services/search-service';
import { EmbeddingService } from '../../services/embedding-service';
import type { ConnectionsInput, ConnectionsResult, EntityLink, GraphNode, GraphEdge } from './schemas';
import { ConnectionsInputSchema, ConnectionsResultSchema } from './schemas';

/**
 * ConnectionsSkill - Find related items and visualize relationships
 */
export class ConnectionsSkill {
  private searchService: SearchService;
  private embeddingService: EmbeddingService;

  constructor(options: {
    searchService?: SearchService;
    embeddingService?: EmbeddingService;
  } = {}) {
    this.searchService = options.searchService ?? new SearchService({});
    this.embeddingService = options.embeddingService ?? new EmbeddingService();
  }

  /**
   * Execute connections skill
   */
  async execute(input: ConnectionsInput): Promise<ConnectionsResult> {
    // Validate input
    const validatedInput = ConnectionsInputSchema.parse(input);
    const { entityName, entityType, depth } = validatedInput;

    // 1. Find the entity
    let entity: { id: string | number; name: string; type: string } | null = null;

    if (entityType === 'contact' || !entityType) {
      const contact = this.searchService.searchContactByName(entityName);
      if (contact) {
        entity = { id: contact.id, name: contact.name, type: 'contact' };
      }
    }

    if (!entity && (entityType === 'project' || !entityType)) {
      const project = this.searchService.searchProjectByName(entityName);
      if (project) {
        entity = { id: project.id, name: project.name, type: 'project' };
      }
    }

    if (!entity) {
      throw new Error(`Entity "${entityName}" not found. Specify entityType for better matching.`);
    }

    // 2. Get direct links from entity_links table
    const linkRows = this.searchService.getEntityLinks(entity.type, entity.id);
    const directLinks: EntityLink[] = linkRows.map(row => ({
      sourceType: row.source_type,
      sourceId: row.source_id,
      sourceName: row.source_name ?? `${row.source_type} ${row.source_id}`,
      targetType: row.target_type,
      targetId: row.target_id,
      targetName: row.target_name ?? `${row.target_type} ${row.target_id}`,
      relationship: row.relationship ?? 'related',
      strength: row.strength ?? 0.5,
    }));

    // 3. Find inferred links via semantic search
    const inferredLinks: EntityLink[] = [];
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(entity.name);

      // Search for related items in different categories
      const results = await this.searchService.searchMultiple({
        query: entity.name,
        categories: ['project', 'contact', 'task'],
        limit: 10,
      });

      for (const result of results) {
        // Don't link to self
        if (result.type === entity.type && String(result.id) === String(entity.id)) continue;

        inferredLinks.push({
          sourceType: entity.type,
          sourceId: entity.id,
          sourceName: entity.name,
          targetType: result.type,
          targetId: result.id,
          targetName: result.title,
          relationship: 'mentioned',
          strength: result.relevanceScore,
        });
      }
    } catch (error) {
      console.warn('[ConnectionsSkill] Inference search failed:', error);
    }

    // 4. Build graph data for visualization
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    // Add central entity
    const centralId = `${entity.type}-${entity.id}`;
    nodes.push({
      id: centralId,
      label: entity.name,
      type: entity.type,
      size: 3, // Larger for central node
    });
    nodeIds.add(centralId);

    // Add direct links
    for (const link of directLinks) {
      const targetId = `${link.targetType}-${link.targetId}`;
      if (!nodeIds.has(targetId)) {
        nodes.push({
          id: targetId,
          label: link.targetName,
          type: link.targetType,
          size: 2,
        });
        nodeIds.add(targetId);
      }

      edges.push({
        source: centralId,
        target: targetId,
        relationship: link.relationship,
        weight: link.strength,
      });
    }

    // Add inferred links (if depth > 1)
    if (depth > 1) {
      for (const link of inferredLinks.slice(0, 5)) { // Limit to top 5
        const targetId = `${link.targetType}-${link.targetId}`;
        if (!nodeIds.has(targetId)) {
          nodes.push({
            id: targetId,
            label: link.targetName,
            type: link.targetType,
            size: 1,
          });
          nodeIds.add(targetId);
        }

        edges.push({
          source: centralId,
          target: targetId,
          relationship: link.relationship,
          weight: link.strength,
        });
      }
    }

    // Build result
    const result: ConnectionsResult = {
      entity,
      directLinks,
      inferredLinks,
      graphData: { nodes, edges },
    };

    return ConnectionsResultSchema.parse(result);
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: ConnectionsResult): string {
    const { entity, directLinks, inferredLinks, graphData } = result;

    const lines = [
      `# Connections: ${entity.name} (${entity.type})`,
      '',
    ];

    if (directLinks.length > 0) {
      lines.push('## Direct Connections', '');
      for (const link of directLinks) {
        const strength = link.strength ? ` (${(link.strength * 100).toFixed(0)}%)` : '';
        lines.push(`- **${link.targetName}** (${link.targetType}) - ${link.relationship}${strength}`);
      }
      lines.push('');
    }

    if (inferredLinks.length > 0) {
      lines.push('## Inferred Connections', '');
      for (const link of inferredLinks.slice(0, 10)) {
        const strength = link.strength ? ` (${(link.strength * 100).toFixed(0)}% confidence)` : '';
        lines.push(`- **${link.targetName}** (${link.targetType})${strength}`);
      }
      lines.push('');
    }

    lines.push('## Graph Summary', '');
    lines.push(`- **Nodes:** ${graphData.nodes.length}`);
    lines.push(`- **Connections:** ${graphData.edges.length}`);
    lines.push('');

    // Group by type
    const byType = graphData.nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = 0;
      acc[node.type]++;
      return acc;
    }, {} as Record<string, number>);

    lines.push('**By Type:**');
    for (const [type, count] of Object.entries(byType)) {
      lines.push(`- ${type}: ${count}`);
    }

    return lines.join('\n');
  }
}
```

- [ ] 7.2 Export from `agent-server/src/skills/research/index.ts`

### Task 8: Create SKILL.md Files for All 5 Research Skills (AC: #1-5)

- [ ] 8.1 Create `.claude/skills/research/explore/SKILL.md`:

```markdown
---
name: explore
description: Search across all PARA categories (projects, areas, resources, archive, contacts, tasks)
trigger: /explore
category: research
version: 1.0.0
author: Orion Team
tags:
  - search
  - para
  - discovery
tools: []
dependencies: []
---

# Explore Skill

Search across your entire Orion system - projects, areas, resources, contacts, tasks, and archived items.

## What Gets Searched

| Category | Source | Examples |
|----------|--------|----------|
| Projects | SQLite | Active projects by name/description |
| Areas | SQLite | Life areas and responsibilities |
| Resources | SQLite | Reference materials |
| Contacts | SQLite | People and organizations |
| Tasks | SQLite | Todo items |
| Archive | SQLite | Completed/inactive items |
| Memory | PostgreSQL | Past learnings and decisions |

## Usage

```
/explore [query]
/explore "quarterly planning"
/explore "John Smith project"
```

## Options

- **categories**: Filter to specific categories (project, area, contact, etc.)
- **limit**: Maximum results (default: 10, max: 50)
- **includeArchive**: Search archived items (default: false)

## Output

Returns results ranked by relevance (0-100%), grouped by category. Each result includes:
- Title
- Snippet/preview
- Relevance score
- Source (sqlite or postgres)
```

- [ ] 8.2 Create `.claude/skills/research/research/SKILL.md`:

```markdown
---
name: research
description: Research a topic using internal and external sources
trigger: /research
category: research
version: 1.0.0
author: Orion Team
tags:
  - research
  - external
  - synthesis
tools:
  - exa (optional)
  - firecrawl (optional)
dependencies: []
---

# Research Skill

Research a topic by searching internal memory and (optionally) external sources.

## How It Works

1. Searches your semantic memory for relevant past learnings
2. Searches PARA data (projects, areas, resources)
3. If connected, searches external sources (Exa, Firecrawl)
4. Synthesizes findings into an actionable summary
5. Suggests key facts to store for future recall

## Usage

```
/research [topic]
/research "best practices for email management"
/research "React performance optimization"
```

## Options

- **includeExternal**: Search external sources if available (default: true)
- **maxSources**: Maximum sources to gather (default: 5, max: 20)

## Output

- **Summary**: AI-synthesized summary of findings
- **Sources**: List of sources with relevance scores
- **Suggested Memories**: Key facts to store via `/remember`

## External Sources (Requires Epic 3)

| Service | Capability |
|---------|------------|
| Exa | Semantic web search |
| Firecrawl | Web page scraping |

If no external sources are connected, the skill searches internal data only.
```

- [ ] 8.3 Create `.claude/skills/research/context/SKILL.md`:

```markdown
---
name: context
description: Get comprehensive context about a contact including interactions and memories
trigger: /context
category: research
version: 1.0.0
author: Orion Team
tags:
  - contact
  - context
  - history
tools: []
dependencies: []
---

# Context Skill

Deep dive into a contact's context - details, recent interactions, memories, and preferences.

## What Gets Retrieved

| Data | Source | Description |
|------|--------|-------------|
| Contact Details | SQLite | Name, email, company, role |
| Recent Interactions | SQLite | Emails, meetings, tasks |
| Relevant Memories | PostgreSQL | Stored facts about the contact |
| Preferences | Both | Known communication preferences |

## Usage

```
/context [contact-name]
/context "John Smith"
/context "Sarah from Acme"
```

## Options

- **interactionLimit**: Max recent interactions (default: 10, max: 50)
- **includeMemories**: Search semantic memory (default: true)

## Output

Returns a contact card with:
- **Contact Details**: Email, phone, company, title, relationship
- **Recent Interactions**: Last N emails/meetings with snippets
- **Known Preferences**: Communication channel, timezone, style
- **Relevant Memories**: Past learnings about this contact

## Use Cases

- Preparing for a meeting with someone
- Remembering communication history
- Checking preferred communication style
- Finding related projects/tasks
```

- [ ] 8.4 Create `.claude/skills/research/timeline/SKILL.md`:

```markdown
---
name: timeline
description: Show chronological project history with tasks, events, and decisions
trigger: /timeline
category: research
version: 1.0.0
author: Orion Team
tags:
  - project
  - history
  - timeline
tools: []
dependencies: []
---

# Timeline Skill

View a project's history chronologically - tasks, events, decisions, and milestones.

## What Gets Included

| Event Type | Source | Description |
|------------|--------|-------------|
| Task Created | SQLite | When tasks were added |
| Task Completed | SQLite | When tasks were finished |
| Decisions | PostgreSQL | Key decisions from memory |
| Milestones | Computed | Start, deadline, reviews |

## Usage

```
/timeline [project-name]
/timeline "Q4 Launch"
/timeline "Website Redesign"
```

## Options

- **dateRange**: Filter to specific period (start/end dates)
- **eventLimit**: Maximum events (default: 50, max: 100)

## Output

Returns:
- **Project Info**: Name, status, deadline
- **Milestones**: Key dates (start, deadline, reviews)
- **Timeline**: Chronological list of events with icons
- **Decisions**: Key decisions made during the project

## Event Icons

| Icon | Meaning |
|------|---------|
| [+] | Task created |
| [x] | Task completed |
| [<] | Email received |
| [>] | Email sent |
| [o] | Meeting |
| [*] | Decision |
| [!] | Milestone |
```

- [ ] 8.5 Create `.claude/skills/research/connections/SKILL.md`:

```markdown
---
name: connections
description: Find related items and visualize relationship networks
trigger: /connections
category: research
version: 1.0.0
author: Orion Team
tags:
  - relationships
  - graph
  - discovery
tools: []
dependencies: []
---

# Connections Skill

Discover how entities are connected - contacts to projects, tasks to emails, and more.

## How It Works

1. **Direct Links**: Explicit relationships in entity_links table
2. **Inferred Links**: Semantic similarity from search
3. **Graph Generation**: Nodes and edges for visualization

## Usage

```
/connections [entity-name]
/connections "John Smith"
/connections "Q4 Launch" entityType:project
```

## Options

- **entityType**: Specify type (contact, project, area, task)
- **depth**: How many levels deep to search (default: 2, max: 3)

## Output

Returns:
- **Entity**: The central entity found
- **Direct Connections**: Explicit links with relationship type
- **Inferred Connections**: Semantically similar items
- **Graph Data**: Nodes and edges for visualization

## Relationship Types

| Type | Meaning |
|------|---------|
| owner | Primary responsible party |
| collaborator | Working together |
| related | General association |
| mentioned | Referenced in content |
| linked | Explicit cross-reference |

## Graph Data Structure

```json
{
  "nodes": [{"id": "contact-1", "label": "John", "type": "contact"}],
  "edges": [{"source": "contact-1", "target": "project-5", "relationship": "owner"}]
}
```
```

### Task 9: Create Research Module Index

- [ ] 9.1 Create `agent-server/src/skills/research/index.ts`:

```typescript
// Schemas
export * from './schemas';

// Skills
export { ExploreSkill } from './explore';
export { ResearchSkill } from './research';
export { ContextSkill } from './context';
export { TimelineSkill } from './timeline';
export { ConnectionsSkill } from './connections';
```

### Task 10: Create Test Mocks and Unit Tests (AC: All)

- [ ] 10.1 Create `tests/mocks/research/index.ts`:

```typescript
import type {
  ExploreResult,
  ResearchResult,
  ContextResult,
  TimelineResult,
  ConnectionsResult,
} from '@/skills/research/schemas';
import { vi } from 'vitest';

/**
 * Mock search results
 */
export const SEARCH_RESULT_MOCKS = {
  project: {
    id: 'proj-001',
    type: 'project' as const,
    title: 'Q4 Launch Campaign',
    snippet: 'Marketing campaign for Q4 product launch',
    relevanceScore: 0.92,
    source: 'sqlite' as const,
  },
  contact: {
    id: 'contact-001',
    type: 'contact' as const,
    title: 'John Smith',
    snippet: 'Product Manager at Acme Corp',
    relevanceScore: 0.88,
    source: 'sqlite' as const,
  },
  task: {
    id: 'task-001',
    type: 'task' as const,
    title: 'Review Q4 budget',
    snippet: 'Review and approve Q4 marketing budget',
    relevanceScore: 0.75,
    source: 'sqlite' as const,
  },
};

export const MOCK_EXPLORE_RESULT: ExploreResult = {
  results: [SEARCH_RESULT_MOCKS.project, SEARCH_RESULT_MOCKS.contact],
  totalFound: 2,
  query: 'Q4 marketing',
  categoriesSearched: ['project', 'contact', 'task'],
};

export const MOCK_RESEARCH_RESULT: ResearchResult = {
  summary: 'Q4 marketing campaigns typically focus on holiday seasons and year-end promotions.',
  sources: [
    {
      title: 'Memory: decision',
      snippet: 'Q4 budget allocated to digital marketing',
      source: 'memory',
      relevance: 0.85,
    },
  ],
  suggestedMemories: [
    {
      content: 'Q4 campaigns should start in October for maximum impact',
      type: 'working_solution',
      tags: ['marketing', 'q4', 'timing'],
      confidence: 'medium',
    },
  ],
  externalSearchUsed: false,
  searchServices: ['internal-memory', 'internal-para'],
};

export const MOCK_CONTEXT_RESULT: ContextResult = {
  contact: {
    id: 'contact-001',
    name: 'John Smith',
    email: 'john@acme.com',
    company: 'Acme Corp',
    title: 'Product Manager',
    relationship: 'client',
    preferredChannel: 'email',
  },
  recentInteractions: [
    {
      id: 'inbox-001',
      type: 'email',
      title: 'Re: Q4 Planning',
      date: '2026-01-10T10:00:00Z',
      snippet: 'Thanks for the proposal...',
      direction: 'inbound',
    },
  ],
  relevantMemories: [
    {
      id: 1,
      content: 'John prefers detailed written proposals',
      type: 'preference',
      createdAt: '2026-01-05T10:00:00Z',
    },
  ],
  preferences: [
    {
      key: 'communication_channel',
      value: 'email',
      source: 'explicit',
    },
  ],
};

export const MOCK_TIMELINE_RESULT: TimelineResult = {
  project: {
    id: 'proj-001',
    name: 'Q4 Launch Campaign',
    status: 'active',
    deadline: '2026-03-31T00:00:00Z',
  },
  events: [
    {
      id: 'task-001-created',
      type: 'task_created',
      date: '2026-01-05T10:00:00Z',
      title: 'Task created: Define campaign goals',
      entityId: 'task-001',
      entityType: 'task',
    },
    {
      id: 'decision-001',
      type: 'decision',
      date: '2026-01-08T14:00:00Z',
      title: 'Decision made',
      description: 'Focus on digital channels for Q4',
      entityId: 1,
      entityType: 'decision',
    },
  ],
  milestones: [
    {
      title: 'Project Started',
      date: '2026-01-05T10:00:00Z',
      type: 'start',
    },
    {
      title: 'Deadline',
      date: '2026-03-31T00:00:00Z',
      type: 'complete',
    },
  ],
  decisions: [
    {
      id: 1,
      content: 'Focus on digital channels for Q4',
      context: 'marketing strategy',
      date: '2026-01-08T14:00:00Z',
      confidence: 'high',
    },
  ],
};

export const MOCK_CONNECTIONS_RESULT: ConnectionsResult = {
  entity: {
    id: 'contact-001',
    name: 'John Smith',
    type: 'contact',
  },
  directLinks: [
    {
      sourceType: 'contact',
      sourceId: 'contact-001',
      sourceName: 'John Smith',
      targetType: 'project',
      targetId: 'proj-001',
      targetName: 'Q4 Launch Campaign',
      relationship: 'collaborator',
      strength: 0.9,
    },
  ],
  inferredLinks: [
    {
      sourceType: 'contact',
      sourceId: 'contact-001',
      sourceName: 'John Smith',
      targetType: 'task',
      targetId: 'task-001',
      targetName: 'Review Q4 budget',
      relationship: 'mentioned',
      strength: 0.65,
    },
  ],
  graphData: {
    nodes: [
      { id: 'contact-contact-001', label: 'John Smith', type: 'contact', size: 3 },
      { id: 'project-proj-001', label: 'Q4 Launch Campaign', type: 'project', size: 2 },
    ],
    edges: [
      { source: 'contact-contact-001', target: 'project-proj-001', relationship: 'collaborator', weight: 0.9 },
    ],
  },
};

/**
 * Create mock SearchService
 */
export const createMockSearchService = () => ({
  searchMultiple: vi.fn().mockResolvedValue([SEARCH_RESULT_MOCKS.project, SEARCH_RESULT_MOCKS.contact]),
  searchCategory: vi.fn().mockResolvedValue([SEARCH_RESULT_MOCKS.project]),
  searchContactByName: vi.fn().mockReturnValue({
    id: 'contact-001',
    name: 'John Smith',
    email: 'john@acme.com',
    company: 'Acme Corp',
    title: 'Product Manager',
    relationship: 'client',
    preferred_channel: 'email',
  }),
  searchProjectByName: vi.fn().mockReturnValue({
    id: 'proj-001',
    name: 'Q4 Launch Campaign',
    status: 'active',
    deadline: '2026-03-31T00:00:00Z',
  }),
  getContactInteractions: vi.fn().mockReturnValue([
    { id: 'inbox-001', type: 'email', title: 'Re: Q4 Planning', date: '2026-01-10T10:00:00Z' },
  ]),
  getProjectTasks: vi.fn().mockReturnValue([
    { id: 'task-001', title: 'Define campaign goals', status: 'completed', created_at: '2026-01-05', completed_at: '2026-01-10' },
  ]),
  getEntityLinks: vi.fn().mockReturnValue([
    { source_type: 'contact', source_id: 'contact-001', target_type: 'project', target_id: 'proj-001', relationship: 'collaborator' },
  ]),
  searchMemory: vi.fn().mockResolvedValue([
    { id: 1, type: 'preference', content: 'John prefers email', score: 0.85, created_at: '2026-01-05' },
  ]),
  close: vi.fn(),
});
```

- [ ] 10.2 Create `tests/unit/story-2.14-research-schemas.spec.ts`:

**Note:** Tests use `@/` path alias. Ensure agent-server tsconfig.json has paths configured:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

```typescript
import { test, expect, describe } from 'vitest';
import {
  ParaCategoryEnum,
  ExploreInputSchema,
  ResearchInputSchema,
  ContextInputSchema,
  TimelineInputSchema,
  ConnectionsInputSchema,
} from '@/skills/research/schemas';

describe('Story 2.14: Research Schemas', () => {

  test('2.14.4 - PARA categories are validated correctly', () => {
    const validCategories = ['project', 'area', 'resource', 'archive', 'contact', 'task', 'inbox'];

    for (const category of validCategories) {
      expect(() => ParaCategoryEnum.parse(category)).not.toThrow();
    }

    // Invalid category should throw
    expect(() => ParaCategoryEnum.parse('invalid_category')).toThrow();
  });

  test('explore input validation', () => {
    // Valid input
    expect(() => ExploreInputSchema.parse({
      query: 'quarterly report',
      limit: 10,
    })).not.toThrow();

    // Invalid: empty query
    expect(() => ExploreInputSchema.parse({
      query: '',
    })).toThrow();

    // Invalid: limit out of range
    expect(() => ExploreInputSchema.parse({
      query: 'test',
      limit: 100,
    })).toThrow();
  });

  test('research input validation', () => {
    // Valid input
    expect(() => ResearchInputSchema.parse({
      topic: 'marketing strategies',
    })).not.toThrow();

    // Invalid: topic too short
    expect(() => ResearchInputSchema.parse({
      topic: 'ab',
    })).toThrow();
  });

  test('context input validation', () => {
    // Valid input
    expect(() => ContextInputSchema.parse({
      contactName: 'John Smith',
    })).not.toThrow();

    // Invalid: empty name
    expect(() => ContextInputSchema.parse({
      contactName: '',
    })).toThrow();
  });

  test('timeline input validation', () => {
    // Valid input
    expect(() => TimelineInputSchema.parse({
      projectName: 'Q4 Launch',
    })).not.toThrow();

    // With date range
    expect(() => TimelineInputSchema.parse({
      projectName: 'Q4 Launch',
      dateRange: { start: '2026-01-01', end: '2026-03-31' },
    })).not.toThrow();
  });

  test('connections input validation', () => {
    // Valid input
    expect(() => ConnectionsInputSchema.parse({
      entityName: 'John Smith',
    })).not.toThrow();

    // With entity type
    expect(() => ConnectionsInputSchema.parse({
      entityName: 'Q4 Launch',
      entityType: 'project',
      depth: 3,
    })).not.toThrow();

    // Invalid: depth out of range
    expect(() => ConnectionsInputSchema.parse({
      entityName: 'Test',
      depth: 5,
    })).toThrow();
  });

});
```

- [ ] 10.3 Create `tests/integration/story-2.14-research-skills.spec.ts`:

```typescript
import { test, expect, vi, describe } from 'vitest';
import { ExploreSkill } from '@/skills/research/explore';
import { ContextSkill } from '@/skills/research/context';
import { TimelineSkill } from '@/skills/research/timeline';
import { ConnectionsSkill } from '@/skills/research/connections';
import { ExploreResultSchema, ContextResultSchema, TimelineResultSchema, ConnectionsResultSchema } from '@/skills/research/schemas';
import { createMockSearchService, MOCK_EXPLORE_RESULT } from '../mocks/research';

// Mock embedding service
const createMockEmbeddingService = () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
  getModelInfo: vi.fn().mockReturnValue({ model: 'bge-m3', dimensions: 1024 }),
});

describe('Story 2.14: Research Skills Integration', () => {

  test('2.14.1 - /explore queries all PARA categories', async () => {
    const mockSearchService = createMockSearchService();
    const mockEmbeddingService = createMockEmbeddingService();

    const skill = new ExploreSkill({
      searchService: mockSearchService as any,
      embeddingService: mockEmbeddingService as any,
    });

    const result = await skill.execute({ query: 'quarterly report' });

    // Verify multiple categories were searched
    expect(mockSearchService.searchMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining(['project', 'area', 'contact', 'task', 'inbox']),
      })
    );

    // Validate result schema
    expect(() => ExploreResultSchema.parse(result)).not.toThrow();
    expect(result.categoriesSearched.length).toBeGreaterThan(0);
  });

  test('2.14.2 - /context returns contact with interactions', async () => {
    const mockSearchService = createMockSearchService();
    const mockEmbeddingService = createMockEmbeddingService();

    const skill = new ContextSkill({
      searchService: mockSearchService as any,
      embeddingService: mockEmbeddingService as any,
    });

    const result = await skill.execute({ contactName: 'John Smith' });

    // Verify contact was found
    expect(mockSearchService.searchContactByName).toHaveBeenCalledWith('John Smith');

    // Verify interactions were fetched
    expect(mockSearchService.getContactInteractions).toHaveBeenCalled();

    // Validate result schema
    expect(() => ContextResultSchema.parse(result)).not.toThrow();
    expect(result.contact).toBeDefined();
    expect(result.contact.name).toBe('John Smith');
    expect(result.recentInteractions).toBeDefined();
    expect(result.recentInteractions).toBeInstanceOf(Array);
    expect(result.relevantMemories).toBeDefined();
  });

  test('2.14.3 - /timeline shows chronological history', async () => {
    const mockSearchService = createMockSearchService();
    const mockEmbeddingService = createMockEmbeddingService();

    const skill = new TimelineSkill({
      searchService: mockSearchService as any,
      embeddingService: mockEmbeddingService as any,
    });

    const result = await skill.execute({ projectName: 'Q4 Launch Campaign' });

    // Verify project was found
    expect(mockSearchService.searchProjectByName).toHaveBeenCalledWith('Q4 Launch Campaign');

    // Verify tasks were fetched
    expect(mockSearchService.getProjectTasks).toHaveBeenCalled();

    // Validate result schema
    expect(() => TimelineResultSchema.parse(result)).not.toThrow();
    expect(result.project).toBeDefined();
    expect(result.events).toBeInstanceOf(Array);

    // Verify events are chronologically ordered
    const dates = result.events.map(e => new Date(e.date).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
    }
  });

  test('2.14.4 - search results include relevance scores', async () => {
    const mockSearchService = createMockSearchService();
    const mockEmbeddingService = createMockEmbeddingService();

    const skill = new ExploreSkill({
      searchService: mockSearchService as any,
      embeddingService: mockEmbeddingService as any,
    });

    const result = await skill.execute({ query: 'marketing campaign' });

    for (const item of result.results) {
      expect(item).toHaveProperty('relevanceScore');
      expect(item.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(item.relevanceScore).toBeLessThanOrEqual(1);
    }
  });

  test('2.14.6 - /connections discovers related items', async () => {
    const mockSearchService = createMockSearchService();
    const mockEmbeddingService = createMockEmbeddingService();

    const skill = new ConnectionsSkill({
      searchService: mockSearchService as any,
      embeddingService: mockEmbeddingService as any,
    });

    const result = await skill.execute({ entityName: 'John Smith', entityType: 'contact' });

    // Verify entity links were fetched
    expect(mockSearchService.getEntityLinks).toHaveBeenCalledWith('contact', expect.anything());

    // Validate result schema
    expect(() => ConnectionsResultSchema.parse(result)).not.toThrow();
    expect(result.entity).toBeDefined();
    expect(result.directLinks).toBeInstanceOf(Array);
    expect(result.inferredLinks).toBeInstanceOf(Array);
    expect(result.graphData).toBeDefined();
    expect(result.graphData.nodes).toBeInstanceOf(Array);
    expect(result.graphData.edges).toBeInstanceOf(Array);
  });

});
```

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Search Service Architecture:**

- Multi-source search: SQLite (PARA data) + PostgreSQL (semantic memory)
- FTS5 for full-text search in SQLite with BM25 scoring
- Vector similarity search in PostgreSQL via pgvector
- Relevance scores normalized to 0.0-1.0 range

**Skill Pattern Requirements (from Story 2.11, 2.12, 2.13):**

- Each skill has SKILL.md with frontmatter: name, description, trigger, category, version
- Skills implement a typed `execute()` method returning validated results
- Results validated with Zod schemas
- Formatted output methods for display
- Constructor accepts optional dependency injection for testing

**Database Tables Used:**

```sql
-- SQLite (local PARA data)
projects (id, name, description, status, deadline, area_id)
areas (id, name, description, responsibilities, goals)
contacts (id, name, email, phone, company, title, relationship, timezone, preferred_channel)
tasks (id, title, description, status, priority, due_date, project_id, created_at, completed_at)
inbox_items (id, source_tool, title, preview, from_email, to_email, received_at, priority_score)
archive (id, original_type, original_id, original_name, archive_reason, archived_at)

-- entity_links table DDL (cross-references between PARA entities)
-- Reference: thoughts/planning-artifacts/prd.md Section 12.4
CREATE TABLE entity_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL,       -- e.g., 'contact', 'project', 'task'
  source_id TEXT NOT NULL,         -- ID in the source table
  source_name TEXT,                -- Display name for quick lookup
  target_type TEXT NOT NULL,       -- e.g., 'project', 'task', 'email'
  target_id TEXT NOT NULL,         -- ID in the target table
  target_name TEXT,                -- Display name for quick lookup
  relationship TEXT NOT NULL DEFAULT 'related', -- 'owner', 'collaborator', 'related', 'mentioned', 'linked'
  strength REAL DEFAULT 0.5,       -- 0.0-1.0 strength of relationship
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(source_type, source_id, target_type, target_id)
);
CREATE INDEX idx_entity_links_source ON entity_links(source_type, source_id);
CREATE INDEX idx_entity_links_target ON entity_links(target_type, target_id);

-- PostgreSQL (semantic memory)
archival_memory (id, session_id, memory_type, content, context, tags, confidence, embedding, created_at)
```

### Previous Story Intelligence

From Story 2.13 (Memory & Context Skills):
- Memory service patterns for PostgreSQL queries
- Embedding service for semantic search
- SKILL.md format with proper frontmatter
- Zod schema validation patterns
- Test mock patterns with vi.fn()

From Story 2.8 (Navigator Agent):
- SearchService may share patterns with Navigator agent's PARA search logic
- Consider extracting common search utilities into shared `search-utils.ts` if patterns overlap
- Navigator uses `performSemanticSearch()` and `performKeywordSearch()` - evaluate for reuse

From Story 2.12 (Workflow Skill Adaptation):
- Skill infrastructure: SkillLoader, SkillCatalog
- Skills can invoke Claude via Anthropic SDK

### Integration Points

**Search Service:**
- SQLite via `better-sqlite3` (sync API)
- PostgreSQL via `pg` Pool (async API)
- Environment variables: `SQLITE_PATH`, `DATABASE_URL`

**Embedding Service (from Story 2.13):**
- Reuses `EmbeddingService` from memory skills
- BGE-M3 model (1024 dimensions)
- HTTP endpoint at `OPC_EMBEDDING_URL`

**External Search (Epic 3 - Future):**
- Exa semantic web search via Composio
- Firecrawl web scraping via Composio
- Research skill gracefully degrades without external tools

### Project Structure Notes

```
agent-server/
  src/
    skills/
      research/
        schemas.ts          # Zod schemas for all research types (CREATE)
        explore.ts          # ExploreSkill implementation (CREATE)
        research.ts         # ResearchSkill implementation (CREATE)
        context.ts          # ContextSkill implementation (CREATE)
        timeline.ts         # TimelineSkill implementation (CREATE)
        connections.ts      # ConnectionsSkill implementation (CREATE)
        index.ts            # Re-exports (CREATE)
    services/
      search-service.ts     # Multi-source search service (CREATE)

.claude/skills/
  research/
    explore/SKILL.md        # (CREATE)
    research/SKILL.md       # (CREATE)
    context/SKILL.md        # (CREATE)
    timeline/SKILL.md       # (CREATE)
    connections/SKILL.md    # (CREATE)

tests/
  mocks/
    research/
      index.ts              # Mock services and data (CREATE)
  unit/
    story-2.14-research-schemas.spec.ts
  integration/
    story-2.14-research-skills.spec.ts
```

### Testing Standards

From test-design-epic-2.md Story 2.14 section:

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.14.1 | Integration | `/explore` queries all PARA categories | Results from all categories | Vitest |
| 2.14.2 | Integration | `/context` returns contact with interactions | Contact + history | Vitest |
| 2.14.3 | E2E | `/timeline` shows chronological history | Events ordered | Vercel Browser Agent |
| 2.14.4 | Unit | Search results include relevance scores | Scores present | Vitest |
| 2.14.5 | Integration | `/research` gracefully degrades when external sources unavailable | Internal results + explanation returned, externalSearchUsed=false | Vitest |
| 2.14.6 | E2E | User discovers connection | Related items surfaced | Vercel Browser Agent |

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.11 (Core Skill Migration)** - SkillLoader, SkillCatalog infrastructure
- **Story 2.12 (Workflow Skill Adaptation)** - Skill patterns and schema conventions
- **Story 2.13 (Memory & Context Skills)** - MemoryService, EmbeddingService, memory schemas
- **Epic 1 (Foundation)** - SQLite database with PARA tables

### Downstream Dependencies (blocked by this story)

- **Story 2.17 (Context Injection Hooks)** - Uses research skills to gather context
- **Epic 3 (Connect Your Tools)** - `/research` skill integrates with Exa/Firecrawl
- **Epic 4 (Unified Inbox)** - Uses `/explore` for search
- **Epic 7 (Contact Management)** - Uses `/context` for contact deep-dives
- **Epic 8 (Projects & Tasks)** - Uses `/timeline` for project history

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.14] - Story definition and skill table
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.14] - Test scenarios
- [Source: thoughts/planning-artifacts/architecture.md#section-4] - Database schema
- [Source: thoughts/implementation-artifacts/stories/story-2-13-memory-context-skills.md] - Previous story patterns

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
