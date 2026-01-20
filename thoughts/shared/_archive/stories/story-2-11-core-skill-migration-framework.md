# Story 2.11: Core Skill Migration Framework

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-11-core-skill-migration-framework
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a developer,
I want a skill infrastructure adapted from Continuous Claude v3,
So that Orion can execute autonomous workflows through slash commands.

---

## Acceptance Criteria

### AC1: Skill Loading from Directory

**Given** Orion starts up
**When** the skill system initializes
**Then** skills are loaded from `.claude/skills/` directory
**And** each skill's SKILL.md is parsed for metadata
**And** skills are registered in the runtime skill catalog

- [ ] `SkillLoader` class scans `.claude/skills/` recursively for `SKILL.md` files
- [ ] `parseSkillFrontmatter(path)` extracts YAML frontmatter from SKILL.md
- [ ] Frontmatter includes: `name`, `description`, `trigger`, `category`, `version`
- [ ] Skills are registered in a `SkillCatalog` Map with name as key
- [ ] Invalid SKILL.md files are logged but don't crash initialization
- [ ] Loader exported from `agent-server/src/skills/loader.ts`

### AC2: Help Command Lists Available Skills

**Given** a user types `/help`
**When** the skill catalog is queried
**Then** all available Orion skills are listed with descriptions
**And** skills are categorized (workflow, memory, research, meta)

- [ ] `/help` invokes `SkillCatalog.listAll()` method
- [ ] Skills grouped by category: `workflow`, `memory`, `research`, `meta`
- [ ] Each skill shows: name, description, trigger syntax
- [ ] Response formatted as markdown table or list
- [ ] Categories defined in `SkillMetadataSchema.category` enum

### AC3: Skill Invocation Loads Correct Prompt

**Given** a user invokes a skill (e.g., `/triage`)
**When** the skill executes
**Then** the skill's prompt is loaded and sent to the agent
**And** the skill runs with access to Orion context (PARA, contacts, preferences)
**And** results are streamed back to the user

- [ ] `SkillRunner.invoke(skillName, context)` executes a skill
- [ ] Skill prompt is loaded from SKILL.md body (after frontmatter)
- [ ] Orion context (PARA items, contacts, preferences) is injected
- [ ] Streaming response returned via existing agent streaming infrastructure
- [ ] Skill execution errors are caught and return helpful error messages

### AC4: Invalid Skill Handling

**Given** a user invokes a non-existent skill
**When** the skill lookup fails
**Then** a helpful error message is returned
**And** similar skill names are suggested (fuzzy match)

- [ ] `SkillCatalog.getSkill(name)` returns `{ found: boolean, skill?: Skill, suggestions?: string[] }`
- [ ] When not found, `errorMessage` includes "did you mean" suggestions
- [ ] Suggestions use Levenshtein distance or simple prefix matching
- [ ] Max 3 suggestions shown

---

## Tasks / Subtasks

### Task 1: Create Skill Metadata Schema (AC: #1, #2)

- [ ] 1.1 Create `agent-server/src/skills/schemas.ts`:
```typescript
import { z } from 'zod';

/**
 * Skill categories for organization
 */
export const SkillCategoryEnum = z.enum([
  'workflow',   // Multi-step task execution (triage, schedule, draft)
  'memory',     // Memory operations (recall, remember)
  'research',   // Search and discovery (explore, context)
  'meta',       // System skills (help, mot)
]);

export type SkillCategory = z.infer<typeof SkillCategoryEnum>;

/**
 * Skill metadata from SKILL.md frontmatter
 */
export const SkillMetadataSchema = z.object({
  name: z.string().min(1).optional(),  // Optional - some skills use filename as name
  description: z.string().min(10),
  trigger: z.string().regex(/^\/[a-z-]+$/).optional(),  // e.g., /triage (optional for non-invocable skills)
  category: SkillCategoryEnum.optional(),  // Optional - many existing skills lack this
  version: z.string().optional().default('1.0.0'),
  author: z.string().optional(),
  // CC v3 legacy fields (backwards compatibility with existing skills)
  'allowed-tools': z.array(z.string()).optional().default([]),  // Legacy: which tools skill can use
  'user-invocable': z.boolean().optional().default(true),       // Legacy: can user invoke directly
  // New Orion fields
  tags: z.array(z.string()).optional().default([]),
  tools: z.array(z.string()).optional().default([]),  // Required MCP tools (alias for allowed-tools)
  dependencies: z.array(z.string()).optional().default([]),  // Other skills
});

export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

/**
 * Full skill definition (metadata + prompt content)
 */
export interface Skill {
  metadata: SkillMetadata;
  prompt: string;  // Body of SKILL.md after frontmatter
  path: string;    // File path for debugging
}

/**
 * Skill lookup result
 */
export interface SkillLookupResult {
  found: boolean;
  skill?: Skill;
  suggestions?: string[];
  errorMessage?: string;
}

/**
 * Skill catalog entry for listing
 */
export interface SkillCatalogEntry {
  name: string;
  description: string;
  trigger: string;
  category: SkillCategory;
}
```

- [ ] 1.2 Export from `agent-server/src/skills/index.ts`

### Task 2: Create Skill Loader (AC: #1, #4)

- [ ] 2.1 Create `agent-server/src/skills/loader.ts`:
```typescript
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import matter from 'gray-matter';
import { SkillMetadataSchema, Skill, SkillMetadata, SkillLookupResult } from './schemas';

/**
 * SkillLoader - Load and parse skills from .claude/skills/ directory
 */
export class SkillLoader {
  private skillsDir: string;
  private catalog: Map<string, Skill> = new Map();
  private loaded: boolean = false;

  constructor(skillsDir: string = '.claude/skills') {
    this.skillsDir = skillsDir;
  }

  /**
   * Load all skills from the skills directory
   */
  async loadAll(): Promise<void> {
    this.catalog.clear();
    const errors: string[] = [];

    try {
      await this.scanDirectory(this.skillsDir, errors);
    } catch (error) {
      console.warn(`[SkillLoader] Failed to scan skills directory: ${error}`);
    }

    if (errors.length > 0) {
      console.warn(`[SkillLoader] ${errors.length} skills failed to load:`, errors);
    }

    console.info(`[SkillLoader] Loaded ${this.catalog.size} skills`);
    this.loaded = true;
  }

  /**
   * Directories to exclude from skill scanning.
   * - archive/: Archived skills not for production use
   * - _sandbox/: Development sandbox
   * - math/: 30+ specialized math skills not relevant to Orion core
   * Hidden directories (starting with .) are also excluded.
   */
  private static readonly EXCLUDED_DIRS = ['archive', '_sandbox', 'math'];

  /**
   * Recursively scan directory for SKILL.md files
   */
  private async scanDirectory(dir: string, errors: string[]): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories and hidden directories
        if (entry.name.startsWith('.') || SkillLoader.EXCLUDED_DIRS.includes(entry.name)) {
          continue;
        }
        await this.scanDirectory(fullPath, errors);
      } else if (entry.name === 'SKILL.md') {
        try {
          const skill = await this.loadSkillFile(fullPath);
          // Use filename-derived name if frontmatter lacks name field
          const skillName = skill.metadata.name || this.deriveNameFromPath(fullPath);
          this.catalog.set(skillName.toLowerCase(), skill);
        } catch (error: any) {
          errors.push(`${fullPath}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Derive skill name from file path when frontmatter lacks name field
   */
  private deriveNameFromPath(path: string): string {
    // Extract parent directory name as skill name
    // e.g., '.claude/skills/commit/SKILL.md' -> 'commit'
    const parts = path.split('/');
    return parts[parts.length - 2] || 'unknown';
  }

  /**
   * Load and parse a single SKILL.md file
   */
  private async loadSkillFile(path: string): Promise<Skill> {
    const content = await readFile(path, 'utf-8');
    const { data: frontmatter, content: prompt } = matter(content);

    // Validate frontmatter against schema
    const metadata = SkillMetadataSchema.parse(frontmatter);

    return {
      metadata,
      prompt: prompt.trim(),
      path,
    };
  }

  /**
   * Get the skill catalog
   */
  getCatalog(): Map<string, Skill> {
    return this.catalog;
  }

  /**
   * Get a skill by name with fuzzy matching for suggestions
   */
  getSkill(name: string): SkillLookupResult {
    const normalizedName = name.toLowerCase().replace(/^\//, '');

    // Direct lookup
    if (this.catalog.has(normalizedName)) {
      return {
        found: true,
        skill: this.catalog.get(normalizedName)!,
      };
    }

    // Fuzzy match for suggestions
    const suggestions = this.findSimilarSkills(normalizedName, 3);

    return {
      found: false,
      suggestions,
      errorMessage: suggestions.length > 0
        ? `Skill "${name}" not found. Did you mean: ${suggestions.map(s => `/${s}`).join(', ')}?`
        : `Skill "${name}" not found. Run /help to see available skills.`,
    };
  }

  /**
   * Find similar skill names using combined prefix/substring/Levenshtein matching.
   *
   * Scoring strategy prioritizes typo correction (Levenshtein) for short queries
   * while still rewarding exact prefix/substring matches:
   * - Distance 1 typo (e.g., "triag" -> "triage"): score 4 (highest)
   * - Exact prefix match: score 3
   * - Distance 2 typo: score 2.5
   * - Substring match: score 2
   * - Distance 3 typo (partial match): score 1
   *
   * This ensures "triag" suggests "triage" over "trigonometry".
   */
  private findSimilarSkills(query: string, limit: number): string[] {
    const matches: Array<{ name: string; score: number }> = [];

    for (const [name] of this.catalog) {
      let score = 0;
      const distance = this.levenshteinDistance(name, query);

      // Very close Levenshtein match (1 edit) - likely a typo
      // e.g., "triag" -> "triage" (distance 1)
      if (distance === 1) {
        score = 4;  // Highest priority for typos
      }
      // Exact prefix match
      else if (name.startsWith(query)) {
        score = 3;
      }
      // Close Levenshtein match (2 edits)
      else if (distance === 2) {
        score = 2.5;
      }
      // Substring match
      else if (name.includes(query) || query.includes(name)) {
        score = 2;
      }
      // Partial Levenshtein match (3 edits) - still useful for suggestions
      else if (distance <= 3) {
        score = 1;
      }

      if (score > 0) {
        matches.push({ name, score });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(m => m.name);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}

/**
 * Parse SKILL.md frontmatter from a file path
 */
export async function parseSkillFrontmatter(path: string): Promise<SkillMetadata> {
  const content = await readFile(path, 'utf-8');
  const { data: frontmatter } = matter(content);
  return SkillMetadataSchema.parse(frontmatter);
}

/**
 * Get list of all skill names for quick reference
 */
export const SKILL_NAMES: string[] = [];  // Populated at runtime
```

- [ ] 2.2 Export from `agent-server/src/skills/index.ts`

### Task 3: Create Skill Catalog Service (AC: #2)

- [ ] 3.1 Create `agent-server/src/skills/catalog.ts`:
```typescript
import { Skill, SkillCategory, SkillCatalogEntry, SkillLookupResult } from './schemas';
import { SkillLoader } from './loader';

/**
 * SkillCatalog - Manage and query loaded skills
 */
export class SkillCatalog {
  private loader: SkillLoader;
  private initialized: boolean = false;

  constructor(skillsDir: string = '.claude/skills') {
    this.loader = new SkillLoader(skillsDir);
  }

  /**
   * Initialize the catalog by loading all skills
   */
  async initialize(): Promise<void> {
    await this.loader.loadAll();
    this.initialized = true;
  }

  /**
   * Ensure catalog is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('SkillCatalog not initialized. Call initialize() first.');
    }
  }

  /**
   * Get a skill by name or trigger
   */
  getSkill(nameOrTrigger: string): SkillLookupResult {
    this.ensureInitialized();
    return this.loader.getSkill(nameOrTrigger);
  }

  /**
   * List all skills in the catalog
   */
  listAll(): SkillCatalogEntry[] {
    this.ensureInitialized();
    const entries: SkillCatalogEntry[] = [];

    for (const [_, skill] of this.loader.getCatalog()) {
      entries.push({
        name: skill.metadata.name,
        description: skill.metadata.description,
        trigger: skill.metadata.trigger,
        category: skill.metadata.category,
      });
    }

    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * List skills by category
   */
  listByCategory(category: SkillCategory): SkillCatalogEntry[] {
    return this.listAll().filter(skill => skill.category === category);
  }

  /**
   * Get count of skills by category
   */
  getCountsByCategory(): Record<SkillCategory, number> {
    this.ensureInitialized();
    const counts: Record<SkillCategory, number> = {
      workflow: 0,
      memory: 0,
      research: 0,
      meta: 0,
    };

    for (const skill of this.listAll()) {
      counts[skill.category]++;
    }

    return counts;
  }

  /**
   * Format skills for /help command output
   */
  formatHelpOutput(): string {
    const skills = this.listAll();
    const byCategory = new Map<SkillCategory, SkillCatalogEntry[]>();

    // Group by category
    for (const skill of skills) {
      const list = byCategory.get(skill.category) || [];
      list.push(skill);
      byCategory.set(skill.category, list);
    }

    // Format output
    const lines: string[] = ['## Available Skills\n'];
    const categoryOrder: SkillCategory[] = ['workflow', 'memory', 'research', 'meta'];
    const categoryLabels: Record<SkillCategory, string> = {
      workflow: 'Workflow Skills',
      memory: 'Memory & Context',
      research: 'Research & Discovery',
      meta: 'System',
    };

    for (const category of categoryOrder) {
      const categorySkills = byCategory.get(category);
      if (!categorySkills || categorySkills.length === 0) continue;

      lines.push(`### ${categoryLabels[category]}\n`);
      lines.push('| Command | Description |');
      lines.push('|---------|-------------|');

      for (const skill of categorySkills) {
        lines.push(`| \`${skill.trigger}\` | ${skill.description} |`);
      }
      lines.push('');
    }

    lines.push(`\n*${skills.length} skills available*`);
    return lines.join('\n');
  }

  /**
   * Get total count of loaded skills
   */
  get size(): number {
    return this.loader.getCatalog().size;
  }
}

// Singleton instance for app-wide use
let globalCatalog: SkillCatalog | null = null;

export function getSkillCatalog(): SkillCatalog {
  if (!globalCatalog) {
    globalCatalog = new SkillCatalog();
  }
  return globalCatalog;
}

export function resetSkillCatalog(): void {
  globalCatalog = null;
}
```

- [ ] 3.2 Export from `agent-server/src/skills/index.ts`

### Task 4: Create Skill Runner (AC: #3)

**Prerequisite:** Story 2.10 (Prompt Caching) MUST be implemented first for `buildCachedPrompt()` to exist. If Story 2.10 is incomplete, provide a stub implementation:

```typescript
// Fallback if Story 2.10 not complete - add to runner.ts
function buildCachedPromptFallback(prompt: string) {
  return { type: 'text' as const, text: prompt };
}
```

- [ ] 4.1 Create `agent-server/src/skills/runner.ts`:
```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { SkillCatalog, getSkillCatalog } from './catalog';
import { Skill, SkillLookupResult } from './schemas';
// NOTE: buildCachedPrompt comes from Story 2.10 - use fallback if not available
import { buildCachedPrompt } from '../agents/caching';

/**
 * Context passed to skills for execution
 */
export interface SkillContext {
  sessionId: string;
  userId?: string;
  para?: {
    projects: any[];
    areas: any[];
    resources: any[];
  };
  contacts?: any[];
  preferences?: any[];
  conversationHistory?: any[];
}

/**
 * Result of skill execution
 */
export interface SkillExecutionResult {
  success: boolean;
  response?: string;
  error?: string;
  skillName: string;
  executionTime: number;
}

/**
 * SkillRunner - Execute skills with Claude
 */
export class SkillRunner {
  private catalog: SkillCatalog;
  private client: Anthropic;

  constructor(options: { catalog?: SkillCatalog; client?: Anthropic } = {}) {
    this.catalog = options.catalog ?? getSkillCatalog();
    this.client = options.client ?? new Anthropic();
  }

  /**
   * Invoke a skill by name or trigger
   */
  async invoke(
    skillNameOrTrigger: string,
    context: SkillContext,
    userInput?: string
  ): Promise<SkillExecutionResult> {
    const startTime = Date.now();
    const normalizedName = skillNameOrTrigger.toLowerCase().replace(/^\//, '');

    // Look up skill
    const lookup = this.catalog.getSkill(normalizedName);

    if (!lookup.found) {
      return {
        success: false,
        error: lookup.errorMessage,
        skillName: normalizedName,
        executionTime: Date.now() - startTime,
      };
    }

    const skill = lookup.skill!;

    try {
      // Build prompt with skill content and context
      const systemPrompt = this.buildPrompt(skill, context);

      // Execute with Claude
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: [buildCachedPrompt(systemPrompt)],
        messages: [
          {
            role: 'user',
            content: userInput || `Execute the ${skill.metadata.name} skill.`,
          },
        ],
      });

      // Extract text response
      const textContent = response.content.find(c => c.type === 'text');
      const responseText = textContent?.type === 'text' ? textContent.text : '';

      return {
        success: true,
        response: responseText,
        skillName: skill.metadata.name,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Skill execution failed: ${error.message}`,
        skillName: skill.metadata.name,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Build the full prompt for skill execution
   */
  buildPrompt(skill: Skill, context: SkillContext): string {
    const contextSection = this.formatContext(context);

    return `# Skill: ${skill.metadata.name}

## Skill Instructions

${skill.prompt}

## Available Context

${contextSection}

## Execution Guidelines

- Follow the skill instructions precisely
- Use the provided context to inform your response
- If you need clarification, ask the user
- Return structured output when appropriate
`;
  }

  /**
   * Format context for prompt injection
   */
  private formatContext(context: SkillContext): string {
    const sections: string[] = [];

    if (context.para) {
      if (context.para.projects?.length) {
        sections.push(`### Active Projects (${context.para.projects.length})`);
        sections.push(context.para.projects.map(p => `- ${p.name}`).join('\n'));
      }
      if (context.para.areas?.length) {
        sections.push(`### Areas (${context.para.areas.length})`);
        sections.push(context.para.areas.map(a => `- ${a.name}`).join('\n'));
      }
    }

    if (context.contacts?.length) {
      sections.push(`### Recent Contacts (${Math.min(context.contacts.length, 10)})`);
      sections.push(
        context.contacts
          .slice(0, 10)
          .map(c => `- ${c.name}${c.organization ? ` (${c.organization})` : ''}`)
          .join('\n')
      );
    }

    if (context.preferences?.length) {
      sections.push(`### User Preferences`);
      sections.push(
        context.preferences.map(p => `- ${p.preference} (confidence: ${p.confidence})`).join('\n')
      );
    }

    return sections.length > 0 ? sections.join('\n\n') : '*No context available*';
  }
}
```

- [ ] 4.2 Export from `agent-server/src/skills/index.ts`

### Task 5: Add gray-matter Dependency

- [ ] 5.1 Add gray-matter to agent-server dependencies:
```bash
cd agent-server && pnpm add gray-matter
```

- [ ] 5.2 Add types if needed:
```bash
cd agent-server && pnpm add -D @types/gray-matter
```

- [ ] 5.3 **IMPORTANT - ES Module Interop:** gray-matter is a CommonJS package. Verify `agent-server/tsconfig.json` has `"esModuleInterop": true` for the default import to work:
```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    // ... other options
  }
}
```

If esModuleInterop is false, use namespace import instead:
```typescript
import * as matter from 'gray-matter';
// then: matter.default(content) or matter(content) depending on setup
```

### Task 6: Create Test Mocks (AC: #1, #2, #3, #4)

- [ ] 6.1 Create `tests/mocks/skills/index.ts`:
```typescript
import type { Skill, SkillMetadata, SkillLookupResult, SkillCatalogEntry } from '@/skills/schemas';
import { vi } from 'vitest';

/**
 * Mock skill metadata
 */
export const MOCK_SKILL_METADATA: SkillMetadata = {
  name: 'triage',
  description: 'Process inbox items with AI-powered prioritization',
  trigger: '/triage',
  category: 'workflow',
  version: '1.0.0',
  tags: ['inbox', 'email', 'priority'],
  tools: ['composio_execute'],
  dependencies: [],
};

/**
 * Mock skills for testing
 */
export const MOCK_SKILLS: Record<string, Skill> = {
  triage: {
    metadata: MOCK_SKILL_METADATA,
    prompt: `You are the Triage Agent. Analyze inbox items and score by priority.

## Priority Scoring
- 0.9-1.0: Urgent - requires immediate attention
- 0.7-0.8: High - important, respond today
- 0.5-0.6: Normal - standard priority
- 0.3-0.4: Low - can wait
- 0.0-0.2: FYI - informational only`,
    path: '.claude/skills/orion/triage/SKILL.md',
  },
  schedule: {
    metadata: {
      name: 'schedule',
      description: 'Find optimal meeting times and create calendar events',
      trigger: '/schedule',
      category: 'workflow',
      version: '1.0.0',
      tags: ['calendar', 'meetings'],
      tools: ['composio_execute'],
      dependencies: [],
    },
    prompt: 'You are the Scheduler Agent...',
    path: '.claude/skills/orion/schedule/SKILL.md',
  },
  recall: {
    metadata: {
      name: 'recall',
      description: 'Search semantic memory for relevant context',
      trigger: '/recall',
      category: 'memory',
      version: '1.0.0',
      tags: ['memory', 'search'],
      tools: [],
      dependencies: [],
    },
    prompt: 'You help users recall information from memory...',
    path: '.claude/skills/memory/recall/SKILL.md',
  },
  help: {
    metadata: {
      name: 'help',
      description: 'List available skills and their descriptions',
      trigger: '/help',
      category: 'meta',
      version: '1.0.0',
      tags: ['system', 'help'],
      tools: [],
      dependencies: [],
    },
    prompt: 'Display the skill catalog...',
    path: '.claude/skills/meta/help/SKILL.md',
  },
};

/**
 * Create mock SkillLoader
 */
export const createMockSkillLoader = () => ({
  loadAll: vi.fn().mockResolvedValue(undefined),
  getCatalog: vi.fn().mockReturnValue(new Map(Object.entries(MOCK_SKILLS))),
  getSkill: vi.fn().mockImplementation((name: string): SkillLookupResult => {
    const normalizedName = name.toLowerCase().replace(/^\//, '');
    const skill = MOCK_SKILLS[normalizedName];

    if (skill) {
      return { found: true, skill };
    }

    return {
      found: false,
      suggestions: ['triage', 'schedule'],
      errorMessage: `Skill "${name}" not found. Did you mean: /triage, /schedule?`,
    };
  }),
});

/**
 * Create mock SkillCatalog
 */
export const createMockSkillCatalog = () => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  getSkill: createMockSkillLoader().getSkill,
  listAll: vi.fn().mockReturnValue(
    Object.values(MOCK_SKILLS).map(s => ({
      name: s.metadata.name,
      description: s.metadata.description,
      trigger: s.metadata.trigger,
      category: s.metadata.category,
    })) as SkillCatalogEntry[]
  ),
  listByCategory: vi.fn().mockImplementation((category: string) =>
    Object.values(MOCK_SKILLS)
      .filter(s => s.metadata.category === category)
      .map(s => ({
        name: s.metadata.name,
        description: s.metadata.description,
        trigger: s.metadata.trigger,
        category: s.metadata.category,
      }))
  ),
  formatHelpOutput: vi.fn().mockReturnValue(`## Available Skills

### Workflow Skills

| Command | Description |
|---------|-------------|
| \`/triage\` | Process inbox items with AI-powered prioritization |
| \`/schedule\` | Find optimal meeting times and create calendar events |

### Memory & Context

| Command | Description |
|---------|-------------|
| \`/recall\` | Search semantic memory for relevant context |

*4 skills available*`),
  size: 4,
});

/**
 * Create mock SkillRunner
 */
export const createMockSkillRunner = () => ({
  invoke: vi.fn().mockResolvedValue({
    success: true,
    response: 'Skill executed successfully.',
    skillName: 'triage',
    executionTime: 1500,
  }),
  buildPrompt: vi.fn().mockReturnValue('Mock skill prompt...'),
});
```

- [ ] 6.2 Export from `tests/mocks/index.ts`

### Task 7: Write Unit Tests (AC: #1, #2, #4)

- [ ] 7.1 Create `tests/unit/story-2.11-skill-loader.spec.ts`:
```typescript
import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest';
import { SkillLoader, parseSkillFrontmatter } from '@/skills/loader';
import { SkillMetadataSchema } from '@/skills/schemas';
import { readFile } from 'fs/promises';
import { glob } from 'glob';

// Mock file system
vi.mock('fs/promises');

describe('Story 2.11: Skill Loader', () => {

  // IMPORTANT: Clean up mocks between tests for isolation
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('2.11.1 - skill loader parses SKILL.md frontmatter correctly', async () => {
    const mockContent = `---
name: triage
description: Process inbox items with AI-powered prioritization
trigger: /triage
category: workflow
version: 1.0.0
tags:
  - inbox
  - email
---

# Triage Skill

You are the Triage Agent...`;

    vi.mocked(readFile).mockResolvedValue(mockContent);

    const metadata = await parseSkillFrontmatter('.claude/skills/orion/triage/SKILL.md');

    expect(metadata).toHaveProperty('name', 'triage');
    expect(metadata).toHaveProperty('description');
    expect(metadata).toHaveProperty('trigger', '/triage');
    expect(metadata).toHaveProperty('category', 'workflow');

    // Validate against schema
    expect(() => SkillMetadataSchema.parse(metadata)).not.toThrow();
  });

  test('2.11.2 - skill catalog contains all registered skills', async () => {
    const loader = new SkillLoader();

    // Mock directory scan
    vi.spyOn(loader as any, 'scanDirectory').mockImplementation(async function(dir: string) {
      const skills = [
        { name: 'triage', category: 'workflow' },
        { name: 'schedule', category: 'workflow' },
        { name: 'recall', category: 'memory' },
        { name: 'help', category: 'meta' },
      ];

      for (const skill of skills) {
        (this as any).catalog.set(skill.name, {
          metadata: { ...skill, description: 'Test', trigger: `/${skill.name}` },
          prompt: 'Test prompt',
          path: `.claude/skills/${skill.name}/SKILL.md`,
        });
      }
    });

    await loader.loadAll();
    const catalog = loader.getCatalog();

    expect(catalog.size).toBe(4);
    expect(catalog.has('triage')).toBe(true);
    expect(catalog.has('schedule')).toBe(true);
    expect(catalog.has('recall')).toBe(true);
    expect(catalog.has('help')).toBe(true);
  });

  test('2.11.6 - invalid skill name returns helpful error with suggestions', async () => {
    const loader = new SkillLoader();

    // Add some skills
    (loader as any).catalog.set('triage', { metadata: { name: 'triage' } });
    (loader as any).catalog.set('trigger', { metadata: { name: 'trigger' } });
    (loader as any).catalog.set('schedule', { metadata: { name: 'schedule' } });

    const result = loader.getSkill('triag');  // Typo

    expect(result.found).toBe(false);
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions!.length).toBeGreaterThan(0);
    expect(result.suggestions).toContain('triage');
    expect(result.errorMessage).toMatch(/did you mean/i);
  });

  test('2.11.6b - getSkill handles trigger format (with slash)', () => {
    const loader = new SkillLoader();
    (loader as any).catalog.set('triage', { metadata: { name: 'triage' } });

    const result = loader.getSkill('/triage');

    expect(result.found).toBe(true);
    expect(result.skill).toBeDefined();
  });

});
```

### Task 8: Write Integration Tests (AC: #3)

- [ ] 8.1 Create `tests/integration/story-2.11-skill-invocation.spec.ts`:
```typescript
import { test, expect, describe, vi, beforeEach } from 'vitest';
import { SkillRunner } from '@/skills/runner';
import { SkillCatalog } from '@/skills/catalog';
import { MOCK_SKILLS, createMockSkillCatalog } from '../mocks/skills';

describe('Story 2.11: Skill Invocation', () => {

  test('2.11.3 - /help returns formatted skill list', async () => {
    const catalog = createMockSkillCatalog();
    const helpOutput = catalog.formatHelpOutput();

    expect(helpOutput).toContain('## Available Skills');
    expect(helpOutput).toContain('Workflow Skills');
    expect(helpOutput).toContain('/triage');
    expect(helpOutput).toContain('/schedule');
    expect(helpOutput).toContain('/recall');
    expect(helpOutput).toMatch(/\d+ skills available/);
  });

  test('2.11.4 - skill invocation loads correct prompt', async () => {
    const mockCatalog = createMockSkillCatalog();
    const runner = new SkillRunner({ catalog: mockCatalog as any });
    const promptSpy = vi.spyOn(runner, 'buildPrompt');

    // Mock Claude response
    vi.spyOn(runner['client'].messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: 'Triage results...' }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    await runner.invoke('/triage', { sessionId: 'test-session' });

    expect(promptSpy).toHaveBeenCalled();
    const prompt = promptSpy.mock.results[0]?.value as string;

    expect(prompt).toContain('triage');
    expect(prompt).toContain('Skill Instructions');
    expect(prompt.length).toBeGreaterThan(100);
  });

  test('2.11.5 - user invokes skill and receives streaming response', async () => {
    const mockCatalog = createMockSkillCatalog();
    const runner = new SkillRunner({ catalog: mockCatalog as any });

    vi.spyOn(runner['client'].messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: 'Here are your prioritized inbox items:\n\n1. **Urgent**: Client contract review\n2. **High**: Team standup notes' }],
      usage: { input_tokens: 200, output_tokens: 100 },
    });

    const result = await runner.invoke('/triage', {
      sessionId: 'test-session',
      para: {
        projects: [{ name: 'Q1 Launch' }],
        areas: [{ name: 'Engineering' }],
        resources: [],
      },
    });

    expect(result.success).toBe(true);
    expect(result.response).toContain('prioritized');
    expect(result.skillName).toBe('triage');
    expect(result.executionTime).toBeGreaterThan(0);
  });

  test('2.11.5b - skill execution handles errors gracefully', async () => {
    const mockCatalog = createMockSkillCatalog();
    const runner = new SkillRunner({ catalog: mockCatalog as any });

    vi.spyOn(runner['client'].messages, 'create').mockRejectedValue(
      new Error('API rate limit exceeded')
    );

    const result = await runner.invoke('/triage', { sessionId: 'test-session' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('rate limit');
    expect(result.skillName).toBe('triage');
  });

});
```

### Task 9: Create Orion-Specific Skills Directory Structure

- [ ] 9.1 Create directory structure:
```bash
mkdir -p .claude/skills/orion/{triage,schedule,draft,organize}
mkdir -p .claude/skills/workflow/{build,fix}
mkdir -p .claude/skills/memory/{recall,remember}
mkdir -p .claude/skills/meta/{help,mot}
```

- [ ] 9.2 Create placeholder SKILL.md files for Orion skills (to be expanded in Story 2.12).

**NOTE:** New Orion skills use the FULL schema with both legacy and new fields for maximum compatibility:

```markdown
# .claude/skills/orion/triage/SKILL.md
---
name: triage
description: Process inbox items with AI-powered prioritization and action extraction
trigger: /triage
category: workflow
version: 1.0.0
# Legacy CC v3 fields (for backwards compatibility)
allowed-tools: [composio_execute]
user-invocable: true
# New Orion fields
tags:
  - inbox
  - email
  - priority
tools:
  - composio_execute
---

# Triage Skill

You are the Triage Agent for Orion. Your role is to analyze inbox items and provide:

1. **Priority Score** (0.0-1.0)
2. **Category** (urgent, important, normal, low, fyi)
3. **Extracted Actions** (tasks, follow-ups, decisions)
4. **Filing Suggestions** (which project/area)

## Scoring Criteria

- **0.9-1.0 (Urgent)**: Deadline today, escalation, VIP sender
- **0.7-0.8 (Important)**: Key project, action required this week
- **0.5-0.6 (Normal)**: Standard priority, no urgency
- **0.3-0.4 (Low)**: Can wait, informational with minor action
- **0.0-0.2 (FYI)**: Newsletter, notification, no action needed

## Output Format

Return structured JSON for each item analyzed.
```

- [ ] 9.3 Create meta/help/SKILL.md:
```markdown
# .claude/skills/meta/help/SKILL.md
---
name: help
description: List available Orion skills and their descriptions
trigger: /help
category: meta
version: 1.0.0
tags:
  - system
  - help
---

# Help Skill

Display all available skills organized by category. Format as a markdown table with command, description, and category.
```

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Skill Directory Structure (from epics.md):**

```
.claude/skills/
├── orion/                    # Orion-specific skills
│   ├── triage/SKILL.md       # /triage - inbox processing
│   ├── schedule/SKILL.md     # /schedule - calendar management
│   ├── draft/SKILL.md        # /draft - email composition
│   └── organize/SKILL.md     # /organize - PARA filing
├── workflow/                 # Adapted workflow skills
│   ├── build/SKILL.md        # /build - multi-step task execution
│   └── fix/SKILL.md          # /fix - problem resolution
├── memory/                   # Memory & context skills
│   ├── recall/SKILL.md       # /recall - search memory
│   └── remember/SKILL.md     # /remember - store learning
└── meta/                     # System skills
    ├── help/SKILL.md         # /help - list skills
    └── mot/SKILL.md          # /mot - system health check
```

**SKILL.md Format (Frontmatter + Body):**

```yaml
---
name: skill-name
description: Brief description
trigger: /command
category: workflow|memory|research|meta
version: 1.0.0
tags: []
tools: []         # MCP tools required
dependencies: []  # Other skills
---

# Skill Title

Prompt content here...
```

**Existing Skills Reference:**

The project has ~100 SKILL.md files in `.claude/skills/` from Continuous Claude. However, for Orion's skill loader, only a subset are relevant:

| Directory | Skills | Relevance to Orion |
|-----------|--------|-------------------|
| `.claude/skills/meta/` | ~5 | **Directly relevant** - help, mot, system skills |
| `.claude/skills/memory/` | ~5 | **Directly relevant** - recall, remember patterns |
| `.claude/skills/workflow/` | ~10 | **Partially relevant** - commit, test, research |
| `.claude/skills/math/` | 30+ | **Excluded** - Specialized math skills, not Orion-focused |
| `.claude/skills/archive/` | ~10 | **Excluded** - Archived/deprecated skills |

**Important:** The SkillLoader excludes `math/` and `archive/` directories by default to avoid polluting the Orion skill catalog with irrelevant skills.

**Legacy SKILL.md Format Compatibility:**

Existing CC v3 skills use a DIFFERENT frontmatter schema than new Orion skills:

| Legacy Field | New Field | Handling |
|--------------|-----------|----------|
| `allowed-tools` | `tools` | Both supported, merged at load time |
| `user-invocable` | - | Supported for backwards compatibility |
| - | `trigger` | Optional - not all skills are user-invocable |
| - | `category` | Optional - existing skills lack this |

The loader MUST handle both formats. See SkillMetadataSchema above for the unified schema.

For Orion, we are ADAPTING this infrastructure, not replacing it. The Orion-specific skills go in `.claude/skills/orion/`.

### Previous Story Intelligence

From Story 2.10 (Prompt Caching):
- Use `buildCachedPrompt()` from `agent-server/src/agents/caching.ts`
- Skills should cache their system prompts for cost efficiency
- Follow the same pattern of optional dependency injection

From Story 2.9 (Preference Learner):
- Singleton pattern for global catalog: `getSkillCatalog()`
- Constructor injection for testing: `new SkillRunner({ catalog })`

### Integration Points

**Butler Agent Integration (Story 2.1):**
- Butler should be able to delegate to skills via `/command` syntax
- Skills run in the same agent context with access to PARA, contacts, preferences

**Hook Integration (Stories 2.15-2.19):**
- Skills may trigger hooks for validation and context injection
- Skills should log execution to action_log for audit

**UI Integration:**
- `/help` output should render in chat as markdown
- Skill invocation results should stream to user

### Project Structure Notes

```
agent-server/
  src/
    skills/
      schemas.ts           # Zod schemas for skill metadata (CREATE)
      loader.ts            # SkillLoader class (CREATE)
      catalog.ts           # SkillCatalog service (CREATE)
      runner.ts            # SkillRunner execution (CREATE)
      index.ts             # Re-exports (CREATE)
    agents/
      caching.ts           # (EXISTS - from Story 2.10)

.claude/skills/
  orion/                   # Orion-specific skills (CREATE structure)
    triage/SKILL.md
    schedule/SKILL.md
    draft/SKILL.md
    organize/SKILL.md
  workflow/                # Adapted workflow skills (CREATE structure)
  memory/                  # Memory skills (CREATE structure)
  meta/                    # System skills (CREATE structure)

tests/
  mocks/
    skills/
      index.ts             # Mock skills, loaders, runners (CREATE)
  unit/
    story-2.11-skill-loader.spec.ts
  integration/
    story-2.11-skill-invocation.spec.ts
```

### Testing Standards

From test-design-epic-2.md Story 2.11 section:

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.11.1 | Unit | Skill loader parses SKILL.md frontmatter | Valid metadata object | Vitest |
| 2.11.2 | Unit | Skill catalog contains all registered skills | Count matches directory | Vitest |
| 2.11.3 | Integration | `/help` returns formatted skill list | All skills listed | Vitest |
| 2.11.4 | Integration | Skill invocation loads correct prompt | Prompt matches SKILL.md | Vitest |
| 2.11.5 | E2E | User invokes skill and receives response | Streaming response | Vercel Browser Agent |
| 2.11.6 | Unit | Invalid skill name returns helpful error | Error includes suggestions | Vitest |

### Dependencies

**NPM Dependencies:**
- `gray-matter` - Parse YAML frontmatter from SKILL.md files
- `zod` - Schema validation (already installed)

**gray-matter Usage:**
```typescript
import matter from 'gray-matter';

const { data: frontmatter, content: body } = matter(fileContent);
// data = parsed YAML object
// content = everything after frontmatter
```

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.1 (Butler Agent Core)** - Agent infrastructure for skill execution
- **Story 2.2 (Agent Prompt Templates)** - Template patterns
- **Story 2.10 (Prompt Caching)** - `buildCachedPrompt()` utility
  - **CRITICAL:** SkillRunner imports `buildCachedPrompt` from `../agents/caching.ts`
  - If Story 2.10 is incomplete, SkillRunner will fail to compile
  - See Task 4 for fallback stub if needed

### Downstream Dependencies (blocked by this story)

- **Story 2.12 (Workflow Skill Adaptation)** - Full skill implementations
- **Story 2.13 (Memory & Context Skills)** - Memory-specific skills
- **Story 2.14 (Research & Discovery Skills)** - Search skills

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.11] - Story definition and skill directory structure
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.11] - Test scenarios
- [Source: thoughts/implementation-artifacts/stories/story-2-10-prompt-caching-setup.md] - Previous story patterns
- [Source: .claude/skills/] - Existing skills infrastructure (100+ skills)

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
