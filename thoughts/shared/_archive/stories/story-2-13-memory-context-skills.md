# Story 2.13: Memory & Context Skills

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-13-memory-context-skills
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a user,
I want memory skills to store and recall information,
So that Orion remembers my preferences and past decisions.

---

## Acceptance Criteria

### AC1: Recall Skill (`/recall`)

**Given** I invoke `/recall [query]`
**When** the Recall skill executes
**Then** it searches semantic memory (PostgreSQL + pgvector)
**And** returns relevant learnings with confidence scores
**And** displays context and source for each result

- [ ] Create `.claude/skills/memory/recall/SKILL.md` with semantic search prompt
- [ ] Implement `RecallSkill` class in `agent-server/src/skills/memory/recall.ts`
- [ ] Connect to PostgreSQL via `DATABASE_URL` environment variable
- [ ] Execute vector similarity search on `archival_memory` table
- [ ] Return structured `RecallResult` with: memoryId, content, context, confidence, score, createdAt
- [ ] Support filters: `types` (memory_type), `minConfidence`, `limit`
- [ ] Scores should be 0.0-1.0 (1 - cosine distance)

### AC2: Remember Skill (`/remember`)

**Given** I invoke `/remember [content]`
**When** the Remember skill executes
**Then** it prompts for memory type (preference, decision, contact_info)
**And** generates embedding and stores in archival_memory
**And** confirms storage with memory ID

- [ ] Create `.claude/skills/memory/remember/SKILL.md` with storage prompt
- [ ] Implement `RememberSkill` class in `agent-server/src/skills/memory/remember.ts`
- [ ] Validate memory type against enum: `preference`, `decision`, `contact_info`, `project_context`, `error_fix`, `working_solution`, `codebase_pattern`
- [ ] Generate 1024-dim embedding using BGE model (via existing `opc/` infrastructure)
- [ ] Insert into PostgreSQL `archival_memory` table
- [ ] Return `RememberResult` with: memoryId, stored (boolean), embeddingGenerated (boolean)
- [ ] Support optional fields: context, tags, confidence (high/medium/low)

### AC3: Forget Skill (`/forget`)

**Given** I invoke `/forget [memory-id]`
**When** the Forget skill executes
**Then** it confirms the memory to delete
**And** removes from database (soft delete with audit)
**And** confirms deletion

- [ ] Create `.claude/skills/memory/forget/SKILL.md` with deletion prompt
- [ ] Implement `ForgetSkill` class in `agent-server/src/skills/memory/forget.ts`
- [ ] Implement soft delete: SET deleted_at = NOW() (do NOT hard delete)
- [ ] Preserve content for audit trail
- [ ] Return `ForgetResult` with: memoryId, deleted (boolean), deletedAt
- [ ] Require confirmation before deletion (skill prompts user)

### AC4: Handoff Skill (`/handoff`)

**Given** I invoke `/handoff`
**When** the Handoff skill executes
**Then** it summarizes current session state
**And** creates handoff document with context
**And** stores in thoughts/handoffs/ directory

- [ ] Create `.claude/skills/memory/handoff/SKILL.md` with session summary prompt
- [ ] Implement `HandoffSkill` class in `agent-server/src/skills/memory/handoff.ts`
- [ ] Generate session summary using LLM with conversation history
- [ ] Include: current task, progress, blockers, next steps, relevant files
- [ ] Write handoff file to `thoughts/handoffs/handoff-{timestamp}.md`
- [ ] Return `HandoffResult` with: filePath, summary, createdAt

### AC5: Resume Skill (`/resume`)

**Given** I invoke `/resume [handoff-file]` or just `/resume`
**When** the Resume skill executes
**Then** it loads the most recent handoff (or specified file)
**And** displays context and continuation suggestions
**And** offers to restore session state

- [ ] Create `.claude/skills/memory/resume/SKILL.md` with resume prompt
- [ ] Implement `ResumeSkill` class in `agent-server/src/skills/memory/resume.ts`
- [ ] Default to most recent handoff in `thoughts/handoffs/`
- [ ] Parse handoff markdown and extract structured data
- [ ] Return `ResumeResult` with: handoffPath, summary, suggestedNextSteps, relatedMemories

### AC6: Preferences Skill (`/preferences`)

**Given** I invoke `/preferences` or `/preferences [category]`
**When** the Preferences skill executes
**Then** it displays current user preferences
**And** allows viewing/editing by category
**And** stores changes with confidence=explicit

- [ ] Create `.claude/skills/memory/preferences/SKILL.md` with preferences prompt
- [ ] Implement `PreferencesSkill` class in `agent-server/src/skills/memory/preferences.ts`
- [ ] Query `archival_memory` WHERE memory_type = 'preference'
- [ ] Support categories: scheduling, communication, organization, notifications
- [ ] Allow editing: update existing or create new preference entries
- [ ] Return `PreferencesResult` with: preferences[], categoryFilter, canEdit

---

## Tasks / Subtasks

### Task 1: Create Memory Schemas (AC: #1, #2, #3, #4, #5, #6)

- [ ] 1.1 Create `agent-server/src/skills/memory/schemas.ts`:

```typescript
import { z } from 'zod';

/**
 * Memory types enum - matches archival_memory.memory_type
 */
export const MemoryTypeEnum = z.enum([
  'preference',        // User preferences (scheduling, communication style)
  'decision',          // Architectural or design decisions
  'contact_info',      // Contact-related information
  'project_context',   // Project-specific context
  'error_fix',         // How errors were resolved
  'working_solution',  // Successful approaches
  'codebase_pattern',  // Discovered patterns in code
  'open_thread',       // Incomplete work to resume
  'failed_approach',   // What didn't work (avoid repeating)
]);

export type MemoryType = z.infer<typeof MemoryTypeEnum>;

/**
 * Confidence levels for memories
 */
export const ConfidenceEnum = z.enum(['high', 'medium', 'low']);
export type Confidence = z.infer<typeof ConfidenceEnum>;

/**
 * Memory source enum
 */
export const MemorySourceEnum = z.enum(['explicit', 'observed', 'inferred']);
export type MemorySource = z.infer<typeof MemorySourceEnum>;

/**
 * Single memory entry from database
 */
export const MemoryEntrySchema = z.object({
  id: z.number(),
  sessionId: z.string(),
  memoryType: MemoryTypeEnum,
  content: z.string(),
  context: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  confidence: ConfidenceEnum,
  createdAt: z.date().or(z.string()),
  deletedAt: z.date().or(z.string()).nullable().optional(),
  score: z.number().min(0).max(1).optional(),
});

export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

/**
 * Recall skill input
 */
export const RecallInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(20).default(5),
  types: z.array(MemoryTypeEnum).optional(),
  minConfidence: ConfidenceEnum.optional(),
});

export type RecallInput = z.infer<typeof RecallInputSchema>;

/**
 * Recall skill result
 */
export const RecallResultSchema = z.object({
  memories: z.array(MemoryEntrySchema),
  totalFound: z.number(),
  query: z.string(),
  searchMode: z.enum(['vector', 'hybrid', 'text']),
});

export type RecallResult = z.infer<typeof RecallResultSchema>;

/**
 * Remember skill input
 */
export const RememberInputSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: MemoryTypeEnum,
  context: z.string().optional(),
  tags: z.array(z.string()).optional(),
  confidence: ConfidenceEnum.default('medium'),
  sessionId: z.string().optional(),
});

export type RememberInput = z.infer<typeof RememberInputSchema>;

/**
 * Remember skill result
 */
export const RememberResultSchema = z.object({
  memoryId: z.number(),
  stored: z.boolean(),
  embeddingGenerated: z.boolean(),
  memoryType: MemoryTypeEnum,
});

export type RememberResult = z.infer<typeof RememberResultSchema>;

/**
 * Forget skill input
 */
export const ForgetInputSchema = z.object({
  memoryId: z.number(),
  confirmed: z.boolean().default(false),
});

export type ForgetInput = z.infer<typeof ForgetInputSchema>;

/**
 * Forget skill result
 */
export const ForgetResultSchema = z.object({
  memoryId: z.number(),
  deleted: z.boolean(),
  deletedAt: z.string().optional(),
  wasAlreadyDeleted: z.boolean().optional(),
});

export type ForgetResult = z.infer<typeof ForgetResultSchema>;

/**
 * Handoff skill input
 */
export const HandoffInputSchema = z.object({
  currentTask: z.string().optional(),
  includeConversation: z.boolean().default(true),
  includeMemories: z.boolean().default(true),
});

export type HandoffInput = z.infer<typeof HandoffInputSchema>;

/**
 * Handoff skill result
 */
export const HandoffResultSchema = z.object({
  filePath: z.string(),
  summary: z.string(),
  createdAt: z.string(),
  currentTask: z.string().optional(),
  progress: z.string().optional(),
  blockers: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  relatedFiles: z.array(z.string()).optional(),
});

export type HandoffResult = z.infer<typeof HandoffResultSchema>;

/**
 * Resume skill input
 */
export const ResumeInputSchema = z.object({
  handoffPath: z.string().optional(), // If not provided, use most recent
});

export type ResumeInput = z.infer<typeof ResumeInputSchema>;

/**
 * Resume skill result
 */
export const ResumeResultSchema = z.object({
  handoffPath: z.string(),
  summary: z.string(),
  currentTask: z.string().optional(),
  progress: z.string().optional(),
  blockers: z.array(z.string()).optional(),
  suggestedNextSteps: z.array(z.string()).optional(),
  relatedMemories: z.array(MemoryEntrySchema).optional(),
  createdAt: z.string(),
});

export type ResumeResult = z.infer<typeof ResumeResultSchema>;

/**
 * Preference categories
 */
export const PreferenceCategoryEnum = z.enum([
  'scheduling',      // Meeting times, focus blocks
  'communication',   // Email tone, notification preferences
  'organization',    // PARA defaults, filing preferences
  'notifications',   // Alert frequency, digest preferences
]);

export type PreferenceCategory = z.infer<typeof PreferenceCategoryEnum>;

/**
 * Preferences skill input
 */
export const PreferencesInputSchema = z.object({
  category: PreferenceCategoryEnum.optional(),
  action: z.enum(['view', 'edit', 'add']).default('view'),
  preferenceId: z.number().optional(), // For edit
  newValue: z.string().optional(), // For edit or add
});

export type PreferencesInput = z.infer<typeof PreferencesInputSchema>;

/**
 * Preferences skill result
 */
export const PreferencesResultSchema = z.object({
  preferences: z.array(MemoryEntrySchema),
  categoryFilter: PreferenceCategoryEnum.optional(),
  canEdit: z.boolean(),
  totalPreferences: z.number(),
});

export type PreferencesResult = z.infer<typeof PreferencesResultSchema>;
```

- [ ] 1.2 Export from `agent-server/src/skills/memory/index.ts`

### Task 2: Implement PostgreSQL Memory Service (AC: #1, #2, #3)

- [ ] 2.1 Create `agent-server/src/services/memory-service.ts`:

```typescript
import { Pool } from 'pg';
import type { MemoryEntry, MemoryType, Confidence } from '../skills/memory/schemas';

/**
 * MemoryService - PostgreSQL-backed semantic memory
 */
export class MemoryService {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool ?? new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  /**
   * Search memories using vector similarity
   */
  async recall(
    queryEmbedding: number[],
    options: {
      limit?: number;
      types?: MemoryType[];
      minConfidence?: Confidence;
    } = {}
  ): Promise<MemoryEntry[]> {
    const { limit = 5, types, minConfidence } = options;

    const params: unknown[] = [
      `[${queryEmbedding.join(',')}]`,
    ];

    let sql = `
      SELECT
        id,
        session_id as "sessionId",
        memory_type as "memoryType",
        content,
        context,
        tags,
        confidence,
        created_at as "createdAt",
        deleted_at as "deletedAt",
        1 - (embedding <=> $1::vector) as score
      FROM archival_memory
      WHERE embedding IS NOT NULL
        AND deleted_at IS NULL
    `;

    if (types && types.length > 0) {
      params.push(types);
      sql += ` AND memory_type = ANY($${params.length})`;
    }

    if (minConfidence) {
      params.push(minConfidence);
      sql += ` AND confidence = $${params.length}`;
    }

    params.push(limit);
    sql += ` ORDER BY score DESC LIMIT $${params.length}`;

    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  /**
   * Store a new memory with embedding
   */
  async store(
    memory: {
      sessionId: string;
      memoryType: MemoryType;
      content: string;
      context?: string;
      tags?: string[];
      confidence: Confidence;
    },
    embedding: number[]
  ): Promise<number> {
    const result = await this.pool.query(
      `INSERT INTO archival_memory
        (session_id, memory_type, content, context, tags, confidence, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
       RETURNING id`,
      [
        memory.sessionId,
        memory.memoryType,
        memory.content,
        memory.context ?? null,
        memory.tags ?? null,
        memory.confidence,
        `[${embedding.join(',')}]`,
      ]
    );

    return result.rows[0].id;
  }

  /**
   * Soft delete a memory (set deleted_at)
   */
  async softDelete(memoryId: number): Promise<{ deleted: boolean; deletedAt?: string }> {
    const result = await this.pool.query(
      `UPDATE archival_memory
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING deleted_at`,
      [memoryId]
    );

    if (result.rows.length === 0) {
      return { deleted: false };
    }

    return {
      deleted: true,
      deletedAt: result.rows[0].deleted_at.toISOString(),
    };
  }

  /**
   * Get memories by type (for preferences)
   */
  async getByType(
    type: MemoryType,
    options: { limit?: number } = {}
  ): Promise<MemoryEntry[]> {
    const { limit = 50 } = options;

    const result = await this.pool.query(
      `SELECT
        id,
        session_id as "sessionId",
        memory_type as "memoryType",
        content,
        context,
        tags,
        confidence,
        created_at as "createdAt",
        deleted_at as "deletedAt"
       FROM archival_memory
       WHERE memory_type = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $2`,
      [type, limit]
    );

    return result.rows;
  }

  /**
   * Get a single memory by ID
   */
  async getById(memoryId: number): Promise<MemoryEntry | null> {
    const result = await this.pool.query(
      `SELECT
        id,
        session_id as "sessionId",
        memory_type as "memoryType",
        content,
        context,
        tags,
        confidence,
        created_at as "createdAt",
        deleted_at as "deletedAt"
       FROM archival_memory
       WHERE id = $1`,
      [memoryId]
    );

    return result.rows[0] ?? null;
  }

  /**
   * Close pool connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

- [ ] 2.2 Export from `agent-server/src/services/index.ts`

### Task 3: Implement Embedding Service (AC: #1, #2)

- [ ] 3.1 Create `agent-server/src/services/embedding-service.ts`:

```typescript
/**
 * EmbeddingService - Generate embeddings for semantic search
 *
 * Uses the existing opc/ infrastructure with BGE-M3 model (1024 dimensions)
 */
export class EmbeddingService {
  private model: string;
  private dimensions: number;

  constructor(options: { model?: string; dimensions?: number } = {}) {
    this.model = options.model ?? 'bge-m3';
    this.dimensions = options.dimensions ?? 1024;
  }

  /**
   * Generate embedding for text
   *
   * In production, this calls the opc embedding service.
   * For local dev, we use a mock or direct model call.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Option 1: Use opc embedding service via HTTP (preferred)
    const opcUrl = process.env.OPC_EMBEDDING_URL ?? 'http://localhost:8001/embed';

    try {
      const response = await fetch(opcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.embedding;
      }
    } catch (error) {
      console.warn('[EmbeddingService] OPC service unavailable, using fallback');
    }

    // Option 2: Generate locally using transformers.js or similar
    // This is a fallback for development without opc running
    return this.generateLocalEmbedding(text);
  }

  /**
   * Local embedding generation fallback
   * Uses a simple approach for development
   */
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // For now, return zeros - in production, use transformers.js or similar
    // TODO: Integrate @xenova/transformers for local embedding
    console.warn('[EmbeddingService] Using zero embedding - implement local model');
    return new Array(this.dimensions).fill(0);
  }

  /**
   * Get model info
   */
  getModelInfo(): { model: string; dimensions: number } {
    return {
      model: this.model,
      dimensions: this.dimensions,
    };
  }
}
```

- [ ] 3.2 Export from `agent-server/src/services/index.ts`

### Task 4: Implement Recall Skill (AC: #1)

- [ ] 4.1 Create `agent-server/src/skills/memory/recall.ts`:

```typescript
import { MemoryService } from '../../services/memory-service';
import { EmbeddingService } from '../../services/embedding-service';
import type { RecallInput, RecallResult, MemoryEntry } from './schemas';
import { RecallInputSchema, RecallResultSchema } from './schemas';

/**
 * RecallSkill - Search semantic memory for relevant past learnings
 */
export class RecallSkill {
  private memoryService: MemoryService;
  private embeddingService: EmbeddingService;

  constructor(options: {
    memoryService?: MemoryService;
    embeddingService?: EmbeddingService;
  } = {}) {
    this.memoryService = options.memoryService ?? new MemoryService();
    this.embeddingService = options.embeddingService ?? new EmbeddingService();
  }

  /**
   * Execute recall skill
   */
  async execute(input: RecallInput): Promise<RecallResult> {
    // Validate input
    const validatedInput = RecallInputSchema.parse(input);
    const { query, limit, types, minConfidence } = validatedInput;

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // Search memories
    const memories = await this.memoryService.recall(queryEmbedding, {
      limit,
      types,
      minConfidence,
    });

    // Build result
    const result: RecallResult = {
      memories,
      totalFound: memories.length,
      query,
      searchMode: 'vector',
    };

    return RecallResultSchema.parse(result);
  }

  /**
   * Format memories for display
   */
  formatForDisplay(memories: MemoryEntry[]): string {
    if (memories.length === 0) {
      return 'No relevant memories found.';
    }

    const lines = memories.map((m, i) => {
      const score = m.score ? ` (relevance: ${(m.score * 100).toFixed(1)}%)` : '';
      const tags = m.tags?.length ? ` [${m.tags.join(', ')}]` : '';
      return `${i + 1}. **${m.memoryType}**${score}${tags}\n   ${m.content}\n   _Context: ${m.context || 'None'}_`;
    });

    return `Found ${memories.length} relevant memories:\n\n${lines.join('\n\n')}`;
  }
}
```

- [ ] 4.2 Export from `agent-server/src/skills/memory/index.ts`

### Task 5: Implement Remember Skill (AC: #2)

- [ ] 5.1 Create `agent-server/src/skills/memory/remember.ts`:

```typescript
import { MemoryService } from '../../services/memory-service';
import { EmbeddingService } from '../../services/embedding-service';
import type { RememberInput, RememberResult } from './schemas';
import { RememberInputSchema, RememberResultSchema } from './schemas';

/**
 * RememberSkill - Store new learnings in semantic memory
 */
export class RememberSkill {
  private memoryService: MemoryService;
  private embeddingService: EmbeddingService;

  constructor(options: {
    memoryService?: MemoryService;
    embeddingService?: EmbeddingService;
  } = {}) {
    this.memoryService = options.memoryService ?? new MemoryService();
    this.embeddingService = options.embeddingService ?? new EmbeddingService();
  }

  /**
   * Execute remember skill
   */
  async execute(input: RememberInput): Promise<RememberResult> {
    // Validate input
    const validatedInput = RememberInputSchema.parse(input);
    const { content, type, context, tags, confidence, sessionId } = validatedInput;

    // Generate embedding for content + context
    const textForEmbedding = context
      ? `${content} ${context}`
      : content;

    const embedding = await this.embeddingService.generateEmbedding(textForEmbedding);
    const embeddingGenerated = embedding.some(v => v !== 0);

    // Store in database
    const memoryId = await this.memoryService.store(
      {
        sessionId: sessionId ?? `orion-${Date.now()}`,
        memoryType: type,
        content,
        context,
        tags,
        confidence,
      },
      embedding
    );

    // Build result
    const result: RememberResult = {
      memoryId,
      stored: true,
      embeddingGenerated,
      memoryType: type,
    };

    return RememberResultSchema.parse(result);
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: RememberResult): string {
    if (!result.stored) {
      return 'Failed to store memory.';
    }

    const embeddingNote = result.embeddingGenerated
      ? 'with semantic embedding'
      : 'without embedding (will not appear in semantic search)';

    return `Memory stored successfully ${embeddingNote}.\n\n**Memory ID:** ${result.memoryId}\n**Type:** ${result.memoryType}`;
  }
}
```

- [ ] 5.2 Export from `agent-server/src/skills/memory/index.ts`

### Task 6: Implement Forget Skill (AC: #3)

- [ ] 6.1 Create `agent-server/src/skills/memory/forget.ts`:

```typescript
import { MemoryService } from '../../services/memory-service';
import type { ForgetInput, ForgetResult } from './schemas';
import { ForgetInputSchema, ForgetResultSchema } from './schemas';

/**
 * ForgetSkill - Soft delete memories (preserves audit trail)
 */
export class ForgetSkill {
  private memoryService: MemoryService;

  constructor(options: { memoryService?: MemoryService } = {}) {
    this.memoryService = options.memoryService ?? new MemoryService();
  }

  /**
   * Execute forget skill
   */
  async execute(input: ForgetInput): Promise<ForgetResult> {
    // Validate input
    const validatedInput = ForgetInputSchema.parse(input);
    const { memoryId, confirmed } = validatedInput;

    // Check if memory exists
    const memory = await this.memoryService.getById(memoryId);

    if (!memory) {
      return ForgetResultSchema.parse({
        memoryId,
        deleted: false,
        wasAlreadyDeleted: false,
      });
    }

    if (memory.deletedAt) {
      return ForgetResultSchema.parse({
        memoryId,
        deleted: false,
        wasAlreadyDeleted: true,
      });
    }

    // If not confirmed, return with the memory for user review
    if (!confirmed) {
      // This will be handled by the skill prompt to ask for confirmation
      return ForgetResultSchema.parse({
        memoryId,
        deleted: false,
      });
    }

    // Soft delete
    const result = await this.memoryService.softDelete(memoryId);

    return ForgetResultSchema.parse({
      memoryId,
      deleted: result.deleted,
      deletedAt: result.deletedAt,
    });
  }

  /**
   * Get memory for confirmation
   */
  async getMemoryForConfirmation(memoryId: number): Promise<string | null> {
    const memory = await this.memoryService.getById(memoryId);

    if (!memory) {
      return null;
    }

    return `Are you sure you want to forget this memory?\n\n**Type:** ${memory.memoryType}\n**Content:** ${memory.content}\n**Created:** ${memory.createdAt}\n\nThis action is reversible (soft delete), but the memory will no longer appear in searches.`;
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: ForgetResult): string {
    if (result.wasAlreadyDeleted) {
      return `Memory #${result.memoryId} was already deleted.`;
    }

    if (!result.deleted) {
      return `Memory #${result.memoryId} was not deleted. Confirmation required.`;
    }

    return `Memory #${result.memoryId} has been removed (soft delete).\n\n**Deleted at:** ${result.deletedAt}`;
  }
}
```

- [ ] 6.2 Export from `agent-server/src/skills/memory/index.ts`

### Task 7: Implement Handoff Skill (AC: #4)

- [ ] 7.1 Create `agent-server/src/skills/memory/handoff.ts`:

```typescript
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { Anthropic } from '@anthropic-ai/sdk';
import type { HandoffInput, HandoffResult } from './schemas';
import { HandoffInputSchema, HandoffResultSchema } from './schemas';

/**
 * HandoffSkill - Create session handoff documents
 */
export class HandoffSkill {
  private client: Anthropic;
  private handoffsDir: string;

  constructor(options: {
    client?: Anthropic;
    handoffsDir?: string;
  } = {}) {
    this.client = options.client ?? new Anthropic();
    this.handoffsDir = options.handoffsDir ?? 'thoughts/handoffs';
  }

  /**
   * Execute handoff skill
   */
  async execute(
    input: HandoffInput,
    conversationContext?: { messages: Array<{ role: string; content: string }> }
  ): Promise<HandoffResult> {
    // Validate input
    const validatedInput = HandoffInputSchema.parse(input);

    // Generate handoff summary using LLM
    const summary = await this.generateSummary(validatedInput, conversationContext);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `handoff-${timestamp}.md`;
    const filePath = join(this.handoffsDir, filename);

    // Create handoff document
    const document = this.buildHandoffDocument(summary);

    // Ensure directory exists and write file
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, document, 'utf-8');

    // Build result
    const result: HandoffResult = {
      filePath,
      summary: summary.summary,
      createdAt: new Date().toISOString(),
      currentTask: summary.currentTask,
      progress: summary.progress,
      blockers: summary.blockers,
      nextSteps: summary.nextSteps,
      relatedFiles: summary.relatedFiles,
    };

    return HandoffResultSchema.parse(result);
  }

  /**
   * Generate summary using LLM
   */
  private async generateSummary(
    input: HandoffInput,
    conversationContext?: { messages: Array<{ role: string; content: string }> }
  ): Promise<{
    summary: string;
    currentTask?: string;
    progress?: string;
    blockers: string[];
    nextSteps: string[];
    relatedFiles: string[];
  }> {
    const systemPrompt = `You are creating a handoff document for a session transition.
Analyze the conversation and extract:
1. Current task being worked on
2. Progress made (percentage or description)
3. Any blockers or issues
4. Suggested next steps
5. Files mentioned or modified

Return JSON:
{
  "summary": "2-3 sentence summary",
  "currentTask": "Current task description",
  "progress": "Progress description",
  "blockers": ["blocker1", "blocker2"],
  "nextSteps": ["step1", "step2"],
  "relatedFiles": ["file1.ts", "file2.ts"]
}`;

    const userPrompt = input.currentTask
      ? `Create handoff for task: ${input.currentTask}`
      : `Create handoff based on the session context.`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '{}';

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        summary: 'Session handoff created.',
        blockers: [],
        nextSteps: [],
        relatedFiles: [],
      };
    }
  }

  /**
   * Build handoff markdown document
   */
  private buildHandoffDocument(summary: {
    summary: string;
    currentTask?: string;
    progress?: string;
    blockers: string[];
    nextSteps: string[];
    relatedFiles: string[];
  }): string {
    const lines = [
      '# Session Handoff',
      '',
      `**Created:** ${new Date().toISOString()}`,
      '',
      '## Summary',
      '',
      summary.summary,
      '',
    ];

    if (summary.currentTask) {
      lines.push('## Current Task', '', summary.currentTask, '');
    }

    if (summary.progress) {
      lines.push('## Progress', '', summary.progress, '');
    }

    if (summary.blockers.length > 0) {
      lines.push('## Blockers', '');
      summary.blockers.forEach(b => lines.push(`- ${b}`));
      lines.push('');
    }

    if (summary.nextSteps.length > 0) {
      lines.push('## Next Steps', '');
      summary.nextSteps.forEach(s => lines.push(`- [ ] ${s}`));
      lines.push('');
    }

    if (summary.relatedFiles.length > 0) {
      lines.push('## Related Files', '');
      summary.relatedFiles.forEach(f => lines.push(`- \`${f}\``));
      lines.push('');
    }

    return lines.join('\n');
  }
}
```

- [ ] 7.2 Export from `agent-server/src/skills/memory/index.ts`

### Task 8: Implement Resume Skill (AC: #5)

- [ ] 8.1 Create `agent-server/src/skills/memory/resume.ts`:

```typescript
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { RecallSkill } from './recall';
import type { ResumeInput, ResumeResult } from './schemas';
import { ResumeInputSchema, ResumeResultSchema } from './schemas';

/**
 * ResumeSkill - Load and resume from handoff documents
 */
export class ResumeSkill {
  private handoffsDir: string;
  private recallSkill: RecallSkill;

  constructor(options: {
    handoffsDir?: string;
    recallSkill?: RecallSkill;
  } = {}) {
    this.handoffsDir = options.handoffsDir ?? 'thoughts/handoffs';
    this.recallSkill = options.recallSkill ?? new RecallSkill();
  }

  /**
   * Execute resume skill
   */
  async execute(input: ResumeInput): Promise<ResumeResult> {
    // Validate input
    const validatedInput = ResumeInputSchema.parse(input);

    // Determine which handoff to load
    const handoffPath = validatedInput.handoffPath ?? await this.getMostRecentHandoff();

    if (!handoffPath) {
      throw new Error('No handoff documents found in ' + this.handoffsDir);
    }

    // Read and parse handoff document
    const content = await readFile(handoffPath, 'utf-8');
    const parsed = this.parseHandoffDocument(content);

    // Get related memories if we have a summary
    let relatedMemories = undefined;
    if (parsed.summary) {
      try {
        const recallResult = await this.recallSkill.execute({
          query: parsed.summary,
          limit: 3,
        });
        relatedMemories = recallResult.memories;
      } catch {
        // Ignore recall errors
      }
    }

    // Build result
    const result: ResumeResult = {
      handoffPath,
      summary: parsed.summary,
      currentTask: parsed.currentTask,
      progress: parsed.progress,
      blockers: parsed.blockers,
      suggestedNextSteps: parsed.nextSteps,
      relatedMemories,
      createdAt: parsed.createdAt,
    };

    return ResumeResultSchema.parse(result);
  }

  /**
   * Get most recent handoff file
   */
  private async getMostRecentHandoff(): Promise<string | null> {
    try {
      const files = await readdir(this.handoffsDir);
      const handoffs = files
        .filter(f => f.startsWith('handoff-') && f.endsWith('.md'))
        .sort()
        .reverse();

      if (handoffs.length === 0) {
        return null;
      }

      return join(this.handoffsDir, handoffs[0]);
    } catch {
      return null;
    }
  }

  /**
   * Parse handoff markdown document
   */
  private parseHandoffDocument(content: string): {
    summary: string;
    currentTask?: string;
    progress?: string;
    blockers: string[];
    nextSteps: string[];
    createdAt: string;
  } {
    const lines = content.split('\n');
    const result: ReturnType<typeof this.parseHandoffDocument> = {
      summary: '',
      blockers: [],
      nextSteps: [],
      createdAt: new Date().toISOString(),
    };

    let currentSection = '';

    for (const line of lines) {
      if (line.startsWith('**Created:**')) {
        result.createdAt = line.replace('**Created:**', '').trim();
      } else if (line.startsWith('## Summary')) {
        currentSection = 'summary';
      } else if (line.startsWith('## Current Task')) {
        currentSection = 'currentTask';
      } else if (line.startsWith('## Progress')) {
        currentSection = 'progress';
      } else if (line.startsWith('## Blockers')) {
        currentSection = 'blockers';
      } else if (line.startsWith('## Next Steps')) {
        currentSection = 'nextSteps';
      } else if (line.startsWith('##')) {
        currentSection = '';
      } else if (line.trim() && currentSection) {
        const text = line.replace(/^- \[[ x]\] /, '').replace(/^- /, '').trim();
        if (text) {
          if (currentSection === 'summary') {
            result.summary += (result.summary ? ' ' : '') + text;
          } else if (currentSection === 'currentTask') {
            result.currentTask = (result.currentTask || '') + text;
          } else if (currentSection === 'progress') {
            result.progress = (result.progress || '') + text;
          } else if (currentSection === 'blockers') {
            result.blockers.push(text);
          } else if (currentSection === 'nextSteps') {
            result.nextSteps.push(text);
          }
        }
      }
    }

    return result;
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: ResumeResult): string {
    const lines = [
      `# Resuming from ${result.handoffPath}`,
      '',
      `**Created:** ${result.createdAt}`,
      '',
      '## Summary',
      result.summary,
      '',
    ];

    if (result.currentTask) {
      lines.push('## Current Task', result.currentTask, '');
    }

    if (result.progress) {
      lines.push('## Progress', result.progress, '');
    }

    if (result.blockers?.length) {
      lines.push('## Blockers');
      result.blockers.forEach(b => lines.push(`- ${b}`));
      lines.push('');
    }

    if (result.suggestedNextSteps?.length) {
      lines.push('## Suggested Next Steps');
      result.suggestedNextSteps.forEach(s => lines.push(`- [ ] ${s}`));
      lines.push('');
    }

    if (result.relatedMemories?.length) {
      lines.push('## Related Memories');
      result.relatedMemories.forEach(m => {
        lines.push(`- **${m.memoryType}**: ${m.content.substring(0, 100)}...`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }
}
```

- [ ] 8.2 Export from `agent-server/src/skills/memory/index.ts`

### Task 9: Implement Preferences Skill (AC: #6)

- [ ] 9.1 Create `agent-server/src/skills/memory/preferences.ts`:

```typescript
import { MemoryService } from '../../services/memory-service';
import type { PreferencesInput, PreferencesResult } from './schemas';
import { PreferencesInputSchema, PreferencesResultSchema } from './schemas';

/**
 * PreferencesSkill - View and manage user preferences
 */
export class PreferencesSkill {
  private memoryService: MemoryService;

  constructor(options: { memoryService?: MemoryService } = {}) {
    this.memoryService = options.memoryService ?? new MemoryService();
  }

  /**
   * Execute preferences skill
   */
  async execute(input: PreferencesInput): Promise<PreferencesResult> {
    // Validate input
    const validatedInput = PreferencesInputSchema.parse(input);
    const { category, action } = validatedInput;

    // Get preferences
    const preferences = await this.memoryService.getByType('preference');

    // Filter by category if specified
    const filtered = category
      ? preferences.filter(p => p.context?.includes(category))
      : preferences;

    // Build result
    const result: PreferencesResult = {
      preferences: filtered,
      categoryFilter: category,
      canEdit: true,
      totalPreferences: preferences.length,
    };

    return PreferencesResultSchema.parse(result);
  }

  /**
   * Format result for display
   */
  formatForDisplay(result: PreferencesResult): string {
    if (result.preferences.length === 0) {
      const categoryNote = result.categoryFilter
        ? ` in category '${result.categoryFilter}'`
        : '';
      return `No preferences found${categoryNote}. Use /remember to add preferences.`;
    }

    const lines = [
      `# User Preferences (${result.totalPreferences} total)`,
      '',
    ];

    if (result.categoryFilter) {
      lines.push(`**Category:** ${result.categoryFilter}`, '');
    }

    result.preferences.forEach((p, i) => {
      lines.push(`${i + 1}. **${p.content}**`);
      if (p.context) {
        lines.push(`   _Context: ${p.context}_`);
      }
      lines.push(`   _Confidence: ${p.confidence}_`);
      lines.push('');
    });

    return lines.join('\n');
  }
}
```

- [ ] 9.2 Export from `agent-server/src/skills/memory/index.ts`

### Task 10: Create SKILL.md Files for All 6 Memory Skills (AC: #1-6)

- [ ] 10.1 Create `.claude/skills/memory/recall/SKILL.md`:

```markdown
---
name: recall
description: Search semantic memory for relevant past learnings, decisions, and preferences
trigger: /recall
category: memory
version: 1.0.0
author: Orion Team
tags:
  - memory
  - search
  - learning
  - context
tools: []
dependencies: []
---

# Recall Skill

Search your semantic memory for relevant past learnings, decisions, and preferences.

## What Gets Searched

- User preferences (scheduling, communication style)
- Architectural decisions
- Contact information and history
- Project context
- Error fixes and working solutions
- Codebase patterns

## Usage

```
/recall [query]
/recall "meeting preferences"
/recall "how did we fix the auth bug"
```

## Options

- **limit**: Maximum results (default: 5, max: 20)
- **types**: Filter by memory type (preference, decision, contact_info, etc.)
- **minConfidence**: Filter by confidence (high, medium, low)

## Output

Returns memories ranked by semantic similarity (0-100% relevance), including:
- Memory type
- Content
- Context
- Confidence
- When it was stored
```

- [ ] 10.2 Create `.claude/skills/memory/remember/SKILL.md`:

```markdown
---
name: remember
description: Store new learnings, preferences, and decisions in semantic memory
trigger: /remember
category: memory
version: 1.0.0
author: Orion Team
tags:
  - memory
  - learning
  - storage
tools: []
dependencies: []
---

# Remember Skill

Store new learnings, preferences, and decisions for future recall.

## Memory Types

| Type | Purpose |
|------|---------|
| preference | User preferences (scheduling, communication) |
| decision | Architectural or design decisions |
| contact_info | Contact-related information |
| project_context | Project-specific context |
| error_fix | How errors were resolved |
| working_solution | Successful approaches |
| codebase_pattern | Discovered patterns |

## Usage

```
/remember "I prefer morning meetings" type:preference
/remember "Use PostgreSQL for persistence" type:decision context:"architecture choice"
```

## Options

- **type**: Memory type (required)
- **context**: Additional context (optional)
- **tags**: Comma-separated tags (optional)
- **confidence**: high, medium, low (default: medium)

## Notes

- Content must be at least 10 characters
- Embedding is generated automatically for semantic search
- Memories are stored in PostgreSQL with pgvector
```

- [ ] 10.3 Create `.claude/skills/memory/forget/SKILL.md`:

```markdown
---
name: forget
description: Remove memories from the system (soft delete with audit trail)
trigger: /forget
category: memory
version: 1.0.0
author: Orion Team
tags:
  - memory
  - delete
  - cleanup
tools: []
dependencies: []
---

# Forget Skill

Remove memories from the system with soft delete (preserves audit trail).

## Usage

```
/forget [memory-id]
/forget 42
```

## Process

1. Display the memory for confirmation
2. Ask user to confirm deletion
3. Soft delete (set deleted_at timestamp)
4. Memory no longer appears in searches

## Notes

- This is a **soft delete** - data is preserved for audit
- Memory can potentially be restored by an admin
- Will not appear in future /recall searches
```

- [ ] 10.4 Create `.claude/skills/memory/handoff/SKILL.md`:

```markdown
---
name: handoff
description: Create a session handoff document for context transfer
trigger: /handoff
category: memory
version: 1.0.0
author: Orion Team
tags:
  - session
  - handoff
  - context
tools: []
dependencies: []
---

# Handoff Skill

Create a handoff document to transfer session context to a future session.

## What Gets Captured

- Current task being worked on
- Progress made
- Blockers and issues
- Suggested next steps
- Related files modified

## Usage

```
/handoff
/handoff "Working on authentication flow"
```

## Output

Creates a markdown file in `thoughts/handoffs/` with:
- Timestamped filename (handoff-2026-01-15T10-30-00.md)
- Structured summary
- Action items for continuation

## Related

- Use `/resume` to load a handoff and continue work
```

- [ ] 10.5 Create `.claude/skills/memory/resume/SKILL.md`:

```markdown
---
name: resume
description: Load and resume from a handoff document
trigger: /resume
category: memory
version: 1.0.0
author: Orion Team
tags:
  - session
  - handoff
  - context
tools: []
dependencies: []
---

# Resume Skill

Load a handoff document and resume work with full context.

## Usage

```
/resume                           # Load most recent handoff
/resume handoff-2026-01-15.md    # Load specific handoff
```

## What Gets Loaded

- Session summary
- Current task and progress
- Blockers to address
- Suggested next steps
- Related memories from semantic search

## Process

1. Locate handoff file (most recent or specified)
2. Parse structured content
3. Search for related memories
4. Present context and suggestions

## Related

- Use `/handoff` to create a new handoff document
```

- [ ] 10.6 Create `.claude/skills/memory/preferences/SKILL.md`:

```markdown
---
name: preferences
description: View and manage user preferences stored in memory
trigger: /preferences
category: memory
version: 1.0.0
author: Orion Team
tags:
  - memory
  - preferences
  - settings
tools: []
dependencies: []
---

# Preferences Skill

View and manage your preferences stored in semantic memory.

## Categories

| Category | Examples |
|----------|----------|
| scheduling | Morning meetings, focus time blocks |
| communication | Email tone, notification preferences |
| organization | PARA defaults, filing preferences |
| notifications | Alert frequency, digest preferences |

## Usage

```
/preferences                    # View all preferences
/preferences scheduling         # View scheduling preferences
/preferences communication      # View communication preferences
```

## Managing Preferences

- **View**: Lists all preferences with context and confidence
- **Add**: Use `/remember type:preference` to add new ones
- **Edit**: Currently view-only (editing coming soon)

## Notes

- Preferences with confidence=explicit are user-specified
- Preferences with confidence=observed are learned from behavior
- Preferences with confidence=inferred are AI-suggested
```

### Task 11: Create Memory Module Index

- [ ] 11.1 Create `agent-server/src/skills/memory/index.ts`:

```typescript
// Schemas
export * from './schemas';

// Skills
export { RecallSkill } from './recall';
export { RememberSkill } from './remember';
export { ForgetSkill } from './forget';
export { HandoffSkill } from './handoff';
export { ResumeSkill } from './resume';
export { PreferencesSkill } from './preferences';
```

### Task 12: Create Test Mocks and Unit Tests (AC: All)

- [ ] 12.1 Create `tests/mocks/memory/index.ts`:

```typescript
import type { MemoryEntry, RecallResult, RememberResult, ForgetResult, HandoffResult, ResumeResult, PreferencesResult } from '@/skills/memory/schemas';
import { vi } from 'vitest';

/**
 * Mock memory entries
 */
export const MEMORY_MOCKS: Record<string, MemoryEntry> = {
  preference_morning: {
    id: 1,
    sessionId: 'test-session-001',
    memoryType: 'preference',
    content: 'User prefers morning meetings between 9-11am',
    context: 'scheduling',
    tags: ['scheduling', 'meetings'],
    confidence: 'high',
    createdAt: new Date('2026-01-10'),
    score: 0.92,
  },
  decision_postgres: {
    id: 2,
    sessionId: 'test-session-002',
    memoryType: 'decision',
    content: 'Use PostgreSQL with pgvector for semantic memory storage',
    context: 'architecture',
    tags: ['database', 'architecture'],
    confidence: 'high',
    createdAt: new Date('2026-01-08'),
    score: 0.85,
  },
  contact_john: {
    id: 3,
    sessionId: 'test-session-003',
    memoryType: 'contact_info',
    content: 'John Smith prefers email over phone calls',
    context: 'communication preferences',
    tags: ['contact', 'john-smith'],
    confidence: 'medium',
    createdAt: new Date('2026-01-12'),
    score: 0.78,
  },
};

export const MOCK_RECALL_RESULT: RecallResult = {
  memories: [MEMORY_MOCKS.preference_morning, MEMORY_MOCKS.decision_postgres],
  totalFound: 2,
  query: 'meeting preferences',
  searchMode: 'vector',
};

export const MOCK_REMEMBER_RESULT: RememberResult = {
  memoryId: 42,
  stored: true,
  embeddingGenerated: true,
  memoryType: 'preference',
};

export const MOCK_FORGET_RESULT: ForgetResult = {
  memoryId: 1,
  deleted: true,
  deletedAt: '2026-01-15T10:30:00.000Z',
};

export const MOCK_HANDOFF_RESULT: HandoffResult = {
  filePath: 'thoughts/handoffs/handoff-2026-01-15T10-30-00.md',
  summary: 'Working on memory skills implementation for Story 2.13',
  createdAt: '2026-01-15T10:30:00.000Z',
  currentTask: 'Implementing RecallSkill',
  progress: '60% complete',
  blockers: ['Need to test embedding service'],
  nextSteps: ['Implement ForgetSkill', 'Create unit tests'],
  relatedFiles: ['agent-server/src/skills/memory/recall.ts'],
};

export const MOCK_RESUME_RESULT: ResumeResult = {
  handoffPath: 'thoughts/handoffs/handoff-2026-01-15T10-30-00.md',
  summary: 'Working on memory skills implementation for Story 2.13',
  currentTask: 'Implementing RecallSkill',
  progress: '60% complete',
  blockers: ['Need to test embedding service'],
  suggestedNextSteps: ['Implement ForgetSkill', 'Create unit tests'],
  relatedMemories: [MEMORY_MOCKS.decision_postgres],
  createdAt: '2026-01-15T10:30:00.000Z',
};

export const MOCK_PREFERENCES_RESULT: PreferencesResult = {
  preferences: [MEMORY_MOCKS.preference_morning],
  categoryFilter: 'scheduling',
  canEdit: true,
  totalPreferences: 5,
};

/**
 * Create mock MemoryService
 */
export const createMockMemoryService = () => ({
  recall: vi.fn().mockResolvedValue([MEMORY_MOCKS.preference_morning]),
  store: vi.fn().mockResolvedValue(42),
  softDelete: vi.fn().mockResolvedValue({ deleted: true, deletedAt: '2026-01-15T10:30:00.000Z' }),
  getByType: vi.fn().mockResolvedValue([MEMORY_MOCKS.preference_morning]),
  getById: vi.fn().mockResolvedValue(MEMORY_MOCKS.preference_morning),
  close: vi.fn(),
});

/**
 * Create mock EmbeddingService
 */
export const createMockEmbeddingService = () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
  getModelInfo: vi.fn().mockReturnValue({ model: 'bge-m3', dimensions: 1024 }),
});
```

- [ ] 12.2 Create `tests/unit/story-2.13-memory-schemas.spec.ts`:

```typescript
import { test, expect, describe } from 'vitest';
import {
  MemoryTypeEnum,
  RecallInputSchema,
  RememberInputSchema,
  ForgetInputSchema,
  MemoryEntrySchema,
} from '@/skills/memory/schemas';
import { MEMORY_MOCKS } from '../mocks/memory';

describe('Story 2.13: Memory Schemas', () => {

  test('2.13.3 - memory types are validated correctly', () => {
    const validTypes = [
      'preference',
      'decision',
      'contact_info',
      'project_context',
      'error_fix',
      'working_solution',
      'codebase_pattern',
    ];

    for (const type of validTypes) {
      expect(() => MemoryTypeEnum.parse(type)).not.toThrow();
    }

    // Invalid type should throw
    expect(() => MemoryTypeEnum.parse('invalid_type')).toThrow();
  });

  test('recall input validation', () => {
    // Valid input
    expect(() => RecallInputSchema.parse({
      query: 'meeting preferences',
      limit: 5,
    })).not.toThrow();

    // Invalid: empty query
    expect(() => RecallInputSchema.parse({
      query: '',
    })).toThrow();

    // Invalid: limit out of range
    expect(() => RecallInputSchema.parse({
      query: 'test',
      limit: 100,
    })).toThrow();
  });

  test('remember input validation', () => {
    // Valid input
    expect(() => RememberInputSchema.parse({
      content: 'User prefers morning meetings',
      type: 'preference',
    })).not.toThrow();

    // Invalid: content too short
    expect(() => RememberInputSchema.parse({
      content: 'short',
      type: 'preference',
    })).toThrow();

    // Invalid: wrong type
    expect(() => RememberInputSchema.parse({
      content: 'Valid content length here',
      type: 'invalid_type',
    })).toThrow();
  });

  test('memory entry schema validates mock data', () => {
    for (const mock of Object.values(MEMORY_MOCKS)) {
      expect(() => MemoryEntrySchema.parse(mock)).not.toThrow();
    }
  });

});
```

- [ ] 12.3 Create `tests/integration/story-2.13-memory-skills.spec.ts`:

```typescript
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { RecallSkill } from '@/skills/memory/recall';
import { RememberSkill } from '@/skills/memory/remember';
import { ForgetSkill } from '@/skills/memory/forget';
import { RecallResultSchema, RememberResultSchema, ForgetResultSchema } from '@/skills/memory/schemas';
import { createMockMemoryService, createMockEmbeddingService, MEMORY_MOCKS, MOCK_RECALL_RESULT } from '../mocks/memory';

describe('Story 2.13: Memory Skills Integration', () => {

  test('2.13.1 - /recall returns results from PostgreSQL', async () => {
    const mockMemoryService = createMockMemoryService();
    const mockEmbeddingService = createMockEmbeddingService();

    const skill = new RecallSkill({
      memoryService: mockMemoryService as any,
      embeddingService: mockEmbeddingService as any,
    });

    const result = await skill.execute({
      query: 'meeting preferences',
      limit: 5,
    });

    // Verify embedding was generated
    expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledWith('meeting preferences');

    // Verify memory search was called
    expect(mockMemoryService.recall).toHaveBeenCalled();

    // Validate result schema
    expect(() => RecallResultSchema.parse(result)).not.toThrow();
    expect(result.memories.length).toBeGreaterThan(0);
    expect(result.searchMode).toBe('vector');
  });

  test('2.13.2 - /remember creates embedding and stores', async () => {
    const mockMemoryService = createMockMemoryService();
    const mockEmbeddingService = createMockEmbeddingService();

    const skill = new RememberSkill({
      memoryService: mockMemoryService as any,
      embeddingService: mockEmbeddingService as any,
    });

    const result = await skill.execute({
      content: 'John prefers email over phone calls',
      type: 'preference',
      context: 'contact communication',
    });

    // Verify embedding was generated
    expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledWith(
      'John prefers email over phone calls contact communication'
    );

    // Verify storage was called
    expect(mockMemoryService.store).toHaveBeenCalled();

    // Validate result schema
    expect(() => RememberResultSchema.parse(result)).not.toThrow();
    expect(result.stored).toBe(true);
    expect(result.embeddingGenerated).toBe(true);
  });

  test('2.13.6 - soft delete preserves audit trail', async () => {
    const mockMemoryService = createMockMemoryService();

    const skill = new ForgetSkill({
      memoryService: mockMemoryService as any,
    });

    const result = await skill.execute({
      memoryId: 1,
      confirmed: true,
    });

    // Verify soft delete was called
    expect(mockMemoryService.softDelete).toHaveBeenCalledWith(1);

    // Validate result schema
    expect(() => ForgetResultSchema.parse(result)).not.toThrow();
    expect(result.deleted).toBe(true);
    expect(result.deletedAt).toBeTruthy();
  });

});
```

- [ ] 12.4 Create `tests/integration/story-2.13-handoff.spec.ts`:

```typescript
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { HandoffSkill } from '@/skills/memory/handoff';
import { ResumeSkill } from '@/skills/memory/resume';
import { HandoffResultSchema, ResumeResultSchema } from '@/skills/memory/schemas';
import { mkdir, rm, readFile } from 'fs/promises';
import { join } from 'path';

const TEST_HANDOFFS_DIR = 'tests/temp/handoffs';

describe('Story 2.13: Handoff Skills', () => {

  beforeEach(async () => {
    await mkdir(TEST_HANDOFFS_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_HANDOFFS_DIR, { recursive: true, force: true });
  });

  test('2.13.5 - /handoff creates file in correct location', async () => {
    const skill = new HandoffSkill({
      handoffsDir: TEST_HANDOFFS_DIR,
      client: {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{
              type: 'text',
              text: JSON.stringify({
                summary: 'Test session summary',
                currentTask: 'Testing handoff skill',
                progress: '50%',
                blockers: [],
                nextSteps: ['Complete tests'],
                relatedFiles: ['test.ts'],
              }),
            }],
          }),
        },
      } as any,
    });

    const result = await skill.execute({
      currentTask: 'Testing handoff skill',
    });

    // Validate result schema
    expect(() => HandoffResultSchema.parse(result)).not.toThrow();

    // Verify file was created
    expect(result.filePath).toContain(TEST_HANDOFFS_DIR);
    expect(result.filePath).toContain('handoff-');
    expect(result.filePath).toEndWith('.md');

    // Verify file contents
    const content = await readFile(result.filePath, 'utf-8');
    expect(content).toContain('# Session Handoff');
    expect(content).toContain('Test session summary');
  });

  test('2.13.4 - store then recall returns the stored memory (round-trip)', async () => {
    // Create a handoff
    const handoffSkill = new HandoffSkill({
      handoffsDir: TEST_HANDOFFS_DIR,
      client: {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{
              type: 'text',
              text: JSON.stringify({
                summary: 'Round-trip test',
                currentTask: 'Testing round-trip',
                progress: '100%',
                blockers: [],
                nextSteps: ['Verify resume'],
                relatedFiles: [],
              }),
            }],
          }),
        },
      } as any,
    });

    const handoffResult = await handoffSkill.execute({});

    // Resume from the handoff
    const resumeSkill = new ResumeSkill({
      handoffsDir: TEST_HANDOFFS_DIR,
    });

    const resumeResult = await resumeSkill.execute({
      handoffPath: handoffResult.filePath,
    });

    // Validate resume loaded the handoff
    expect(() => ResumeResultSchema.parse(resumeResult)).not.toThrow();
    expect(resumeResult.summary).toContain('Round-trip test');
    expect(resumeResult.currentTask).toBe('Testing round-trip');
  });

});
```

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Memory System Architecture (from architecture.md Section 10):**

- PostgreSQL with pgvector extension for semantic search
- `archival_memory` table with 1024-dim BGE embeddings
- Vector similarity via `1 - (embedding <=> query::vector)` for cosine distance
- Soft delete pattern: `deleted_at` timestamp, NOT hard delete
- Connection via `DATABASE_URL` environment variable

**Database Schema (archival_memory):**

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
    deleted_at TIMESTAMP  -- Soft delete
);

CREATE INDEX idx_archival_memory_embedding ON archival_memory
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

**Skill Pattern Requirements (from Story 2.11, 2.12):**

- Each skill has SKILL.md with frontmatter: name, description, trigger, category, version
- Skills implement a typed `execute()` method returning validated results
- Results validated with Zod schemas
- Formatted output methods for display

### Previous Story Intelligence

From Story 2.12 (Workflow Skill Adaptation):
- Skill infrastructure established: SkillLoader, SkillCatalog, SkillRunner
- SKILL.md format with frontmatter parsing
- Zod schema validation patterns
- Workflow classes with constructor dependency injection

From Story 2.11 (Core Skill Migration):
- Skills loaded from `.claude/skills/` directories
- `parseSkillFrontmatter()` utility available
- Skills can invoke Claude via Anthropic SDK

### Integration Points

**OPC Embedding Service:**
- Existing infrastructure in `opc/scripts/core/db/embedding_service.py`
- BGE-M3 model (1024 dimensions)
- HTTP endpoint at `OPC_EMBEDDING_URL` or direct Python call

**PostgreSQL Connection:**
- Uses `DATABASE_URL` from environment
- Same database as Continuous Claude memory system
- Tables already exist in `opc/` infrastructure

**Handoff Directory:**
- Files stored in `thoughts/handoffs/`
- Timestamped filenames for chronological ordering
- Markdown format with structured sections

### Project Structure Notes

```
agent-server/
  src/
    skills/
      memory/
        schemas.ts          # Zod schemas for all memory types (CREATE)
        recall.ts           # RecallSkill implementation (CREATE)
        remember.ts         # RememberSkill implementation (CREATE)
        forget.ts           # ForgetSkill implementation (CREATE)
        handoff.ts          # HandoffSkill implementation (CREATE)
        resume.ts           # ResumeSkill implementation (CREATE)
        preferences.ts      # PreferencesSkill implementation (CREATE)
        index.ts            # Re-exports (CREATE)
    services/
      memory-service.ts     # PostgreSQL memory operations (CREATE)
      embedding-service.ts  # Embedding generation (CREATE)

.claude/skills/
  memory/
    recall/SKILL.md         # (CREATE)
    remember/SKILL.md       # (CREATE)
    forget/SKILL.md         # (CREATE)
    handoff/SKILL.md        # (CREATE)
    resume/SKILL.md         # (CREATE)
    preferences/SKILL.md    # (CREATE)

tests/
  mocks/
    memory/
      index.ts              # Mock services and data (CREATE)
  unit/
    story-2.13-memory-schemas.spec.ts
  integration/
    story-2.13-memory-skills.spec.ts
    story-2.13-handoff.spec.ts
```

### Testing Standards

From test-design-epic-2.md Story 2.13 section:

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.13.1 | Integration | `/recall` returns results from PostgreSQL | Vector search results | Vitest |
| 2.13.2 | Integration | `/remember` creates embedding and stores | Database insert | Vitest |
| 2.13.3 | Unit | Memory types are validated | Schema enforcement | Vitest |
| 2.13.4 | E2E | Store then recall returns the stored memory | Round-trip works | Vercel Browser Agent |
| 2.13.5 | Integration | `/handoff` creates file in correct location | File written | Vitest |
| 2.13.6 | Unit | Soft delete preserves audit trail | deleted_at set | Vitest |

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.11 (Core Skill Migration)** - SkillLoader, SkillCatalog infrastructure
- **Story 2.12 (Workflow Skill Adaptation)** - Skill patterns and schema conventions
- **Epic 1 (Foundation)** - SQLite local database for session state
- **OPC Infrastructure** - PostgreSQL with pgvector, embedding service

### Downstream Dependencies (blocked by this story)

- **Story 2.14 (Research & Discovery Skills)** - Uses memory recall for context
- **Story 2.17 (Context Injection Hooks)** - Injects memory into prompts
- **Epic 10 (Memory & Recall System)** - Full memory system builds on these primitives

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.13] - Story definition and skill table
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.13] - Test scenarios
- [Source: thoughts/planning-artifacts/architecture.md#section-10] - Memory system architecture
- [Source: thoughts/implementation-artifacts/stories/story-2-12-workflow-skill-adaptation.md] - Previous story patterns

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
