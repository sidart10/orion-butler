# Story 2.12: Workflow Skill Adaptation

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-12-workflow-skill-adaptation
**Priority:** P1
**Risk:** MEDIUM

---

## Story

As a user,
I want workflow skills adapted for personal productivity,
So that I can execute complex multi-step tasks with a single command.

---

## Acceptance Criteria

### AC1: Triage Workflow Skill

**Given** I invoke `/triage`
**When** the Triage workflow executes
**Then** it fetches unprocessed inbox items
**And** scores them by priority (0.0-1.0)
**And** suggests filing and response actions
**And** presents results in the canvas

- [ ] Create `.claude/skills/orion/triage/SKILL.md` with full workflow prompt
- [ ] Implement `TriageWorkflow` class in `agent-server/src/workflows/triage.ts`
- [ ] Workflow fetches inbox items via SkillContext or mock data
- [ ] Returns structured `TriageResult[]` with priority scores
- [ ] Results include: emailId, priority, category, extractedTasks, suggestedActions, filingRecommendation
- [ ] Priority scores are bounded 0.0-1.0 (validated by Zod schema)
- [ ] Categories are enum: `urgent`, `important`, `normal`, `low`, `fyi`

### AC2: Organize Workflow Skill

**Given** I invoke `/organize [item]`
**When** the Organize workflow executes
**Then** it analyzes the item content
**And** suggests PARA category (Project/Area/Resource/Archive)
**And** offers to file with one click

- [ ] Create `.claude/skills/orion/organize/SKILL.md` with workflow prompt
- [ ] Implement `OrganizeWorkflow` class in `agent-server/src/workflows/organize.ts`
- [ ] Accepts item (email, task, document) as input
- [ ] Returns `OrganizeResult` with: suggestedCategory, confidence, rationale, targetId
- [ ] Categories are: `project`, `area`, `resource`, `archive`
- [ ] Confidence scores 0.0-1.0

### AC3: Weekly Review Workflow Skill

**Given** I invoke `/weekly-review`
**When** the Weekly Review workflow executes
**Then** it summarizes completed tasks
**And** identifies overdue items
**And** suggests priorities for the coming week

- [ ] Create `.claude/skills/orion/weekly-review/SKILL.md` with workflow prompt
- [ ] Implement `WeeklyReviewWorkflow` class in `agent-server/src/workflows/weekly-review.ts`
- [ ] Returns `WeeklyReviewResult` with:
  - tasksCompleted: number
  - tasksOverdue: number
  - upcomingDeadlines: Task[]
  - suggestedPriorities: string[]
  - weekSummary: string

### AC4: All 8 Workflow Skills Have Valid SKILL.md

**Given** Orion skill system initializes
**When** workflow skills are loaded
**Then** each workflow skill has valid SKILL.md with proper frontmatter
**And** schema validates against SkillMetadataSchema from Story 2.11

- [ ] Create all 8 workflow skill SKILL.md files:
  - `/triage` - Process inbox items
  - `/organize` - File items to PARA
  - `/weekly-review` - Summarize week, plan next
  - `/draft` - Compose email with context
  - `/schedule` - Find time and create event
  - `/followup` - Track pending responses
  - `/delegate` - Assign and track delegated items
  - `/archive` - Move completed work to archive
- [ ] All frontmatter includes: name, description, trigger, category, version, tags, tools
- [ ] All pass SkillMetadataSchema.parse() without errors

### AC5: Workflow Results Render in Canvas

**Given** a workflow skill completes execution
**When** results are returned
**Then** they are formatted for canvas rendering
**And** the UI can display structured output

- [ ] Each workflow returns a `canvasOutput` field with structured data
- [ ] Canvas output includes type: `triage_results`, `organize_suggestion`, `weekly_summary`
- [ ] Results can be serialized to JSON for json-render components

---

## Tasks / Subtasks

### Task 1: Create Workflow Schemas (AC: #1, #2, #3)

- [ ] 1.1 Create `agent-server/src/workflows/schemas.ts`:

```typescript
import { z } from 'zod';

/**
 * Triage categories for inbox items
 */
export const TriageCategoryEnum = z.enum([
  'urgent',    // 0.9-1.0: Deadline today, escalation, VIP sender
  'important', // 0.7-0.8: Key project, action required this week
  'normal',    // 0.5-0.6: Standard priority, no urgency
  'low',       // 0.3-0.4: Can wait, informational with minor action
  'fyi',       // 0.0-0.2: Newsletter, notification, no action needed
]);

export type TriageCategory = z.infer<typeof TriageCategoryEnum>;

/**
 * Extracted task from triage analysis
 */
export const ExtractedTaskSchema = z.object({
  title: z.string(),
  confidence: z.number().min(0).max(1),
  dueDate: z.string().optional(),
  source: z.string(), // email ID or item ID
});

export type ExtractedTask = z.infer<typeof ExtractedTaskSchema>;

/**
 * Triage result for a single inbox item
 */
export const TriageResultSchema = z.object({
  emailId: z.string(),
  priority: z.number().min(0).max(1),
  category: TriageCategoryEnum,
  summary: z.string(),
  extractedTasks: z.array(ExtractedTaskSchema).default([]),
  suggestedActions: z.array(z.string()).default([]),
  filingRecommendation: z.object({
    type: z.enum(['project', 'area', 'resource', 'archive', 'none']),
    targetId: z.string().optional(),
    targetName: z.string().optional(),
    confidence: z.number().min(0).max(1),
  }).optional(),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

/**
 * Batch triage result
 */
export const BatchTriageResultSchema = z.object({
  items: z.array(TriageResultSchema),
  totalProcessed: z.number(),
  urgentCount: z.number(),
  actionItemCount: z.number(),
});

export type BatchTriageResult = z.infer<typeof BatchTriageResultSchema>;

/**
 * PARA categories for organizing
 */
export const ParaCategoryEnum = z.enum(['project', 'area', 'resource', 'archive']);

export type ParaCategory = z.infer<typeof ParaCategoryEnum>;

/**
 * Organize result
 */
export const OrganizeResultSchema = z.object({
  suggestedCategory: ParaCategoryEnum,
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  targetId: z.string().optional(),
  targetName: z.string().optional(),
  alternativeCategories: z.array(z.object({
    category: ParaCategoryEnum,
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  })).optional(),
});

export type OrganizeResult = z.infer<typeof OrganizeResultSchema>;

/**
 * Weekly review result
 */
export const WeeklyReviewResultSchema = z.object({
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  tasksCompleted: z.number(),
  tasksOverdue: z.number(),
  tasksInProgress: z.number(),
  upcomingDeadlines: z.array(z.object({
    taskId: z.string(),
    title: z.string(),
    dueDate: z.string(),
    projectName: z.string().optional(),
  })),
  suggestedPriorities: z.array(z.string()),
  weekSummary: z.string(),
  achievements: z.array(z.string()).optional(),
  blockers: z.array(z.string()).optional(),
});

export type WeeklyReviewResult = z.infer<typeof WeeklyReviewResultSchema>;

/**
 * Draft result for email composition
 */
export const DraftResultSchema = z.object({
  subject: z.string(),
  body: z.string(),
  tone: z.enum(['formal', 'casual', 'professional', 'friendly']),
  recipientContext: z.string().optional(),
  suggestedEdits: z.array(z.string()).optional(),
});

export type DraftResult = z.infer<typeof DraftResultSchema>;

/**
 * Schedule result for calendar management
 */
export const ScheduleResultSchema = z.object({
  suggestedSlots: z.array(z.object({
    start: z.string(),
    end: z.string(),
    score: z.number().min(0).max(1),
    reason: z.string(),
  })),
  conflicts: z.array(z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
  })).optional(),
  eventDetails: z.object({
    title: z.string(),
    duration: z.number(),
    attendees: z.array(z.string()),
  }).optional(),
});

export type ScheduleResult = z.infer<typeof ScheduleResultSchema>;

/**
 * Followup tracking result
 */
export const FollowupResultSchema = z.object({
  pendingFollowups: z.array(z.object({
    id: z.string(),
    contactName: z.string(),
    subject: z.string(),
    sentDate: z.string(),
    daysPending: z.number(),
    urgency: z.enum(['high', 'medium', 'low']),
  })),
  suggestedActions: z.array(z.string()),
  totalPending: z.number(),
});

export type FollowupResult = z.infer<typeof FollowupResultSchema>;

/**
 * Delegate result
 */
export const DelegateResultSchema = z.object({
  delegatedTo: z.string(),
  taskTitle: z.string(),
  dueDate: z.string().optional(),
  trackingId: z.string(),
  status: z.enum(['sent', 'acknowledged', 'in_progress', 'completed']),
});

export type DelegateResult = z.infer<typeof DelegateResultSchema>;

/**
 * Archive result
 */
export const ArchiveResultSchema = z.object({
  archivedItems: z.array(z.object({
    id: z.string(),
    type: z.enum(['project', 'task', 'email', 'document']),
    title: z.string(),
    reason: z.string(),
  })),
  totalArchived: z.number(),
});

export type ArchiveResult = z.infer<typeof ArchiveResultSchema>;

/**
 * Canvas output types for rendering
 */
export const CanvasOutputTypeEnum = z.enum([
  'triage_results',
  'organize_suggestion',
  'weekly_summary',
  'email_draft',
  'schedule_slots',
  'followup_list',
  'delegate_confirmation',
  'archive_confirmation',
]);

export type CanvasOutputType = z.infer<typeof CanvasOutputTypeEnum>;
```

- [ ] 1.2 Export from `agent-server/src/workflows/index.ts`

### Task 2: Create Triage Workflow (AC: #1)

- [ ] 2.1 Create `agent-server/src/workflows/triage.ts`:

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { TriageResult, BatchTriageResult, TriageResultSchema, BatchTriageResultSchema } from './schemas';
import { SkillContext } from '../skills/runner';
import { buildCachedPrompt } from '../agents/caching';

/**
 * Inbox item for triage processing
 */
export interface InboxItem {
  id: string;
  subject: string;
  body: string;
  from: string;
  date: string;
  threadId?: string;
  labels?: string[];
}

/**
 * TriageWorkflow - Process inbox items with AI-powered prioritization
 */
export class TriageWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  /**
   * Execute triage on inbox items
   */
  async execute(
    items?: InboxItem[],
    context?: SkillContext
  ): Promise<BatchTriageResult> {
    // Use provided items or fetch from context
    const inboxItems = items ?? await this.fetchInbox(context);

    if (inboxItems.length === 0) {
      return {
        items: [],
        totalProcessed: 0,
        urgentCount: 0,
        actionItemCount: 0,
      };
    }

    // Build prompt with inbox items
    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildUserPrompt(inboxItems);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: [buildCachedPrompt(systemPrompt)],
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Parse structured response
    const textContent = response.content.find(c => c.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '[]';

    try {
      const results = JSON.parse(responseText);
      const validatedResults = results.map((r: any) => TriageResultSchema.parse(r));

      return BatchTriageResultSchema.parse({
        items: validatedResults,
        totalProcessed: validatedResults.length,
        urgentCount: validatedResults.filter((r: TriageResult) => r.category === 'urgent').length,
        actionItemCount: validatedResults.reduce((sum: number, r: TriageResult) => sum + r.extractedTasks.length, 0),
      });
    } catch (error) {
      console.error('[TriageWorkflow] Failed to parse response:', error);
      throw new Error('Failed to parse triage results');
    }
  }

  /**
   * Fetch inbox items from context or mock
   */
  async fetchInbox(context?: SkillContext): Promise<InboxItem[]> {
    // In real implementation, this would call Composio Gmail tools
    // For now, return empty array (will be connected in Epic 3)
    console.info('[TriageWorkflow] fetchInbox called - returning empty (Epic 3 integration needed)');
    return [];
  }

  /**
   * Build system prompt for triage
   */
  private buildSystemPrompt(context?: SkillContext): string {
    const preferencesSection = context?.preferences?.length
      ? `## User Preferences\n${context.preferences.map(p => `- ${p.preference}`).join('\n')}`
      : '';

    return `You are the Triage Agent for Orion Personal Butler. Analyze inbox items and provide structured prioritization.

## Scoring Criteria

| Score Range | Category | Description |
|-------------|----------|-------------|
| 0.9-1.0 | urgent | Deadline today, escalation, VIP sender, blocking others |
| 0.7-0.8 | important | Key project, action required this week, client request |
| 0.5-0.6 | normal | Standard priority, no urgency, routine correspondence |
| 0.3-0.4 | low | Can wait, informational with minor action, low stakes |
| 0.0-0.2 | fyi | Newsletter, notification, no action needed, marketing |

## Output Format

Return a JSON array of TriageResult objects:
\`\`\`json
[
  {
    "emailId": "msg_001",
    "priority": 0.95,
    "category": "urgent",
    "summary": "Client needs contract review by EOD",
    "extractedTasks": [
      {
        "title": "Review contract from Acme Corp",
        "confidence": 0.9,
        "dueDate": "2026-01-15",
        "source": "msg_001"
      }
    ],
    "suggestedActions": ["reply_urgent", "add_task"],
    "filingRecommendation": {
      "type": "project",
      "targetName": "Acme Partnership",
      "confidence": 0.85
    }
  }
]
\`\`\`

${preferencesSection}

## Guidelines

- Extract ALL actionable items from emails
- Consider sender importance (VIP contacts score higher)
- Consider time sensitivity (deadlines, meetings)
- Consider impact (revenue, relationships, blockers)
- Suggest filing to appropriate PARA category
- Be conservative with "urgent" - reserve for truly time-critical items
`;
  }

  /**
   * Build user prompt with inbox items
   */
  private buildUserPrompt(items: InboxItem[]): string {
    const itemsList = items.map((item, i) => `
### Email ${i + 1}
- **ID:** ${item.id}
- **From:** ${item.from}
- **Subject:** ${item.subject}
- **Date:** ${item.date}
- **Labels:** ${item.labels?.join(', ') || 'none'}

**Body:**
${item.body.substring(0, 2000)}${item.body.length > 2000 ? '...(truncated)' : ''}
`).join('\n---\n');

    return `Analyze the following ${items.length} inbox items and return prioritized results as JSON:

${itemsList}

Return ONLY the JSON array, no additional text.`;
  }
}
```

- [ ] 2.2 Export from `agent-server/src/workflows/index.ts`

### Task 3: Create Organize Workflow (AC: #2)

- [ ] 3.1 Create `agent-server/src/workflows/organize.ts`:

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { OrganizeResult, OrganizeResultSchema, ParaCategory } from './schemas';
import { SkillContext } from '../skills/runner';
import { buildCachedPrompt } from '../agents/caching';

/**
 * Item to organize
 */
export interface ItemToOrganize {
  type: 'email' | 'task' | 'document' | 'note';
  id: string;
  title: string;
  content: string;
  source?: string;
  tags?: string[];
}

/**
 * OrganizeWorkflow - File items to PARA categories
 */
export class OrganizeWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  /**
   * Execute organize workflow
   */
  async execute(
    item: ItemToOrganize,
    context?: SkillContext
  ): Promise<OrganizeResult> {
    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildUserPrompt(item);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: [buildCachedPrompt(systemPrompt)],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '{}';

    try {
      const result = JSON.parse(responseText);
      return OrganizeResultSchema.parse(result);
    } catch (error) {
      console.error('[OrganizeWorkflow] Failed to parse response:', error);
      throw new Error('Failed to parse organize result');
    }
  }

  /**
   * Build system prompt for organizing
   */
  private buildSystemPrompt(context?: SkillContext): string {
    const paraContext = this.buildParaContext(context);

    return `You are the Organize Agent for Orion Personal Butler. Analyze items and suggest the best PARA category for filing.

## PARA Framework

| Category | Purpose | Examples |
|----------|---------|----------|
| **Project** | Active work with a deadline | Q1 Launch, Client Onboarding, Website Redesign |
| **Area** | Ongoing responsibility | Health, Finance, Career, Relationships |
| **Resource** | Reference material | Templates, Documentation, Contact Info |
| **Archive** | Completed or inactive | Past projects, Old reference material |

${paraContext}

## Output Format

Return a JSON object:
\`\`\`json
{
  "suggestedCategory": "project",
  "confidence": 0.85,
  "rationale": "This email discusses the Q1 launch timeline with action items",
  "targetName": "Q1 Product Launch",
  "targetId": "proj_001",
  "alternativeCategories": [
    {
      "category": "area",
      "confidence": 0.4,
      "reason": "Could be filed under Engineering if general reference"
    }
  ]
}
\`\`\`

## Guidelines

- Consider the item's actionability (projects have actions, resources are reference)
- Consider time-boundedness (projects have deadlines, areas are ongoing)
- Consider current context (what projects/areas exist)
- Provide alternatives when the categorization is ambiguous
- Confidence should reflect certainty (0.9+ for clear cases, 0.5-0.7 for ambiguous)
`;
  }

  /**
   * Build PARA context from user's existing structure
   */
  private buildParaContext(context?: SkillContext): string {
    if (!context?.para) {
      return '## Current PARA Structure\n*No existing structure available*';
    }

    const sections: string[] = ['## Current PARA Structure'];

    if (context.para.projects?.length) {
      sections.push('### Active Projects');
      sections.push(context.para.projects.map(p => `- ${p.name} (ID: ${p.id})`).join('\n'));
    }

    if (context.para.areas?.length) {
      sections.push('### Areas');
      sections.push(context.para.areas.map(a => `- ${a.name} (ID: ${a.id})`).join('\n'));
    }

    return sections.join('\n\n');
  }

  /**
   * Build user prompt with item details
   */
  private buildUserPrompt(item: ItemToOrganize): string {
    return `Analyze this ${item.type} and suggest the best PARA category:

**Type:** ${item.type}
**Title:** ${item.title}
${item.source ? `**Source:** ${item.source}` : ''}
${item.tags?.length ? `**Tags:** ${item.tags.join(', ')}` : ''}

**Content:**
${item.content.substring(0, 3000)}${item.content.length > 3000 ? '...(truncated)' : ''}

Return ONLY the JSON object, no additional text.`;
  }
}
```

- [ ] 3.2 Export from `agent-server/src/workflows/index.ts`

### Task 4: Create Weekly Review Workflow (AC: #3)

- [ ] 4.1 Create `agent-server/src/workflows/weekly-review.ts`:

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { WeeklyReviewResult, WeeklyReviewResultSchema } from './schemas';
import { SkillContext } from '../skills/runner';
import { buildCachedPrompt } from '../agents/caching';

/**
 * WeeklyReviewWorkflow - Generate weekly summary and priorities
 */
export class WeeklyReviewWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  /**
   * Execute weekly review workflow
   */
  async execute(context?: SkillContext): Promise<WeeklyReviewResult> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = await this.buildUserPrompt(context);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: [buildCachedPrompt(systemPrompt)],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '{}';

    try {
      const result = JSON.parse(responseText);
      return WeeklyReviewResultSchema.parse(result);
    } catch (error) {
      console.error('[WeeklyReviewWorkflow] Failed to parse response:', error);
      throw new Error('Failed to parse weekly review result');
    }
  }

  /**
   * Build system prompt for weekly review
   */
  private buildSystemPrompt(): string {
    return `You are the Weekly Review Agent for Orion Personal Butler. Generate a comprehensive weekly summary following GTD principles.

## Weekly Review Components

1. **Completed Tasks** - What got done this week
2. **Overdue Items** - What slipped and needs attention
3. **Upcoming Deadlines** - What's due in the next 7 days
4. **Suggested Priorities** - Top 3-5 items to focus on next week
5. **Achievements** - Wins worth celebrating
6. **Blockers** - Obstacles that need resolution

## Output Format

Return a JSON object:
\`\`\`json
{
  "weekStartDate": "2026-01-13",
  "weekEndDate": "2026-01-19",
  "tasksCompleted": 12,
  "tasksOverdue": 3,
  "tasksInProgress": 8,
  "upcomingDeadlines": [
    {
      "taskId": "task_001",
      "title": "Submit quarterly report",
      "dueDate": "2026-01-20",
      "projectName": "Q1 Reporting"
    }
  ],
  "suggestedPriorities": [
    "Clear overdue client responses",
    "Prepare for Thursday presentation",
    "Review Q1 budget draft"
  ],
  "weekSummary": "Productive week with 12 tasks completed...",
  "achievements": [
    "Closed Acme partnership deal",
    "Finished product roadmap draft"
  ],
  "blockers": [
    "Waiting on legal review for contract"
  ]
}
\`\`\`

## Guidelines

- Be encouraging but realistic
- Prioritize by impact, not just urgency
- Highlight wins to maintain motivation
- Identify patterns in blockers
- Keep suggestions actionable and specific
`;
  }

  /**
   * Build user prompt with task data
   */
  private async buildUserPrompt(context?: SkillContext): Promise<string> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // In real implementation, this would query tasks from SQLite
    // For now, provide template prompt
    const tasksSection = context?.para?.projects?.length
      ? `## Active Projects\n${context.para.projects.map(p => `- ${p.name}`).join('\n')}`
      : '*No task data available - connect to task database*';

    return `Generate a weekly review for the period:
- **Week Start:** ${weekStart.toISOString().split('T')[0]}
- **Week End:** ${weekEnd.toISOString().split('T')[0]}

${tasksSection}

Analyze the available data and generate the weekly review. If data is limited, provide a template structure that the user can fill in.

Return ONLY the JSON object, no additional text.`;
  }
}
```

- [ ] 4.2 Export from `agent-server/src/workflows/index.ts`

### Task 5: Create Additional Workflow Stubs (AC: #4)

- [ ] 5.1 Create `agent-server/src/workflows/draft.ts` (stub for `/draft`):

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { DraftResult, DraftResultSchema } from './schemas';
import { SkillContext } from '../skills/runner';
import { buildCachedPrompt } from '../agents/caching';

/**
 * DraftWorkflow - Compose emails with AI assistance
 */
export class DraftWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  async execute(
    request: {
      to: string;
      subject?: string;
      context?: string;
      replyTo?: string;
      tone?: 'formal' | 'casual' | 'professional' | 'friendly';
    },
    context?: SkillContext
  ): Promise<DraftResult> {
    // Implementation in Epic 5 (Email Communication)
    throw new Error('DraftWorkflow: Full implementation in Epic 5');
  }
}
```

- [ ] 5.2 Create `agent-server/src/workflows/schedule.ts` (stub for `/schedule`):

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { ScheduleResult, ScheduleResultSchema } from './schemas';
import { SkillContext } from '../skills/runner';

/**
 * ScheduleWorkflow - Find meeting times and create events
 */
export class ScheduleWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  async execute(
    request: {
      attendees: string[];
      duration: number;
      title: string;
      dateRange?: { start: string; end: string };
    },
    context?: SkillContext
  ): Promise<ScheduleResult> {
    // Implementation in Epic 6 (Calendar Management)
    throw new Error('ScheduleWorkflow: Full implementation in Epic 6');
  }
}
```

- [ ] 5.3 Create `agent-server/src/workflows/followup.ts` (stub for `/followup`):

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { FollowupResult, FollowupResultSchema } from './schemas';
import { SkillContext } from '../skills/runner';

/**
 * FollowupWorkflow - Track pending responses
 */
export class FollowupWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  async execute(context?: SkillContext): Promise<FollowupResult> {
    // Implementation in Epic 4 (Unified Inbox)
    throw new Error('FollowupWorkflow: Full implementation in Epic 4');
  }
}
```

- [ ] 5.4 Create `agent-server/src/workflows/delegate.ts` (stub for `/delegate`):

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { DelegateResult, DelegateResultSchema } from './schemas';
import { SkillContext } from '../skills/runner';

/**
 * DelegateWorkflow - Assign and track delegated items
 */
export class DelegateWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  async execute(
    request: {
      taskTitle: string;
      delegateTo: string;
      dueDate?: string;
      notes?: string;
    },
    context?: SkillContext
  ): Promise<DelegateResult> {
    // Implementation in Epic 8 (Projects & Tasks)
    throw new Error('DelegateWorkflow: Full implementation in Epic 8');
  }
}
```

- [ ] 5.5 Create `agent-server/src/workflows/archive.ts` (stub for `/archive`):

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { ArchiveResult, ArchiveResultSchema } from './schemas';
import { SkillContext } from '../skills/runner';

/**
 * ArchiveWorkflow - Move completed work to archive
 */
export class ArchiveWorkflow {
  private client: Anthropic;

  constructor(options: { client?: Anthropic } = {}) {
    this.client = options.client ?? new Anthropic();
  }

  async execute(
    itemIds: string[],
    context?: SkillContext
  ): Promise<ArchiveResult> {
    // Implementation in Epic 9 (Areas & Archive)
    throw new Error('ArchiveWorkflow: Full implementation in Epic 9');
  }
}
```

### Task 6: Create SKILL.md Files for All 8 Workflow Skills (AC: #4)

- [ ] 6.1 Create `.claude/skills/orion/triage/SKILL.md`:

```markdown
---
name: triage
description: Process inbox items with AI-powered prioritization and action extraction
trigger: /triage
category: workflow
version: 1.0.0
author: Orion Team
allowed-tools: [composio_execute]
user-invocable: true
tags:
  - inbox
  - email
  - priority
  - actions
tools:
  - composio_execute
dependencies: []
---

# Triage Skill

You are the Triage Agent for Orion Personal Butler. Your role is to analyze inbox items and provide intelligent prioritization.

## What You Do

1. **Fetch unprocessed inbox items** from Gmail via Composio
2. **Score each item by priority** (0.0-1.0 scale)
3. **Extract action items** with confidence scores
4. **Suggest filing locations** in the PARA system
5. **Present results** in a structured format for the canvas

## Priority Scoring

| Score | Category | Criteria |
|-------|----------|----------|
| 0.9-1.0 | Urgent | Deadline today, VIP sender, blocking others |
| 0.7-0.8 | Important | Key project, action required this week |
| 0.5-0.6 | Normal | Standard priority, routine correspondence |
| 0.3-0.4 | Low | Can wait, informational with minor action |
| 0.0-0.2 | FYI | Newsletter, notification, marketing |

## Output

Return structured JSON with:
- `emailId` - unique identifier
- `priority` - score 0.0-1.0
- `category` - urgent/important/normal/low/fyi
- `extractedTasks` - array of actionable items
- `suggestedActions` - what to do next
- `filingRecommendation` - where to file in PARA
```

- [ ] 6.2 Create `.claude/skills/orion/organize/SKILL.md`:

```markdown
---
name: organize
description: Analyze items and suggest PARA category for filing
trigger: /organize
category: workflow
version: 1.0.0
author: Orion Team
tags:
  - para
  - filing
  - organization
tools: []
dependencies: []
---

# Organize Skill

Analyze any item (email, task, document) and suggest the best PARA category.

## PARA Framework

- **Project** - Active work with a deadline
- **Area** - Ongoing responsibility (no deadline)
- **Resource** - Reference material for later
- **Archive** - Completed or inactive items

## How It Works

1. Analyze item content, metadata, and context
2. Match against existing projects and areas
3. Suggest the best category with confidence score
4. Offer one-click filing action

## Usage

```
/organize [item-id]
/organize "paste content here"
```
```

- [ ] 6.3 Create `.claude/skills/orion/weekly-review/SKILL.md`:

```markdown
---
name: weekly-review
description: Generate weekly summary with completed tasks, overdue items, and suggested priorities
trigger: /weekly-review
category: workflow
version: 1.0.0
author: Orion Team
tags:
  - gtd
  - review
  - planning
  - productivity
tools: []
dependencies: []
---

# Weekly Review Skill

Conduct a GTD-style weekly review to gain clarity and control.

## What Gets Reviewed

1. **Completed tasks** this week
2. **Overdue items** that need attention
3. **Upcoming deadlines** in the next 7 days
4. **Blocked items** waiting on others
5. **Project health** across your portfolio

## Output Includes

- Task completion count and trends
- Prioritized list for next week
- Achievements worth celebrating
- Blockers needing resolution
- Calendar preview for the week

## Usage

```
/weekly-review
```
```

- [ ] 6.4 Create `.claude/skills/orion/draft/SKILL.md`:

```markdown
---
name: draft
description: Compose email drafts with AI assistance and tone matching
trigger: /draft
category: workflow
version: 1.0.0
author: Orion Team
tags:
  - email
  - writing
  - communication
tools:
  - composio_execute
dependencies: []
---

# Draft Skill

Compose email drafts with intelligent context and tone matching.

## Features

- Match tone to recipient relationship
- Include relevant context from memory
- Suggest edits and alternatives
- Never auto-send without approval

## Usage

```
/draft to:john@example.com "Follow up on our meeting"
/draft reply:msg_001
```

*Full implementation in Epic 5*
```

- [ ] 6.5 Create `.claude/skills/orion/schedule/SKILL.md`:

```markdown
---
name: schedule
description: Find optimal meeting times and create calendar events
trigger: /schedule
category: workflow
version: 1.0.0
author: Orion Team
tags:
  - calendar
  - meetings
  - scheduling
tools:
  - composio_execute
dependencies: []
---

# Schedule Skill

Find the best time for meetings and create calendar events.

## Features

- Check availability across attendees
- Respect focus time and preferences
- Suggest optimal slots with reasoning
- Create events with one confirmation

## Usage

```
/schedule meeting with John tomorrow 30min
/schedule "Team standup" next week 15min
```

*Full implementation in Epic 6*
```

- [ ] 6.6 Create `.claude/skills/orion/followup/SKILL.md`:

```markdown
---
name: followup
description: Track pending responses and suggest follow-up actions
trigger: /followup
category: workflow
version: 1.0.0
author: Orion Team
tags:
  - email
  - tracking
  - reminders
tools:
  - composio_execute
dependencies: []
---

# Followup Skill

Track emails awaiting responses and suggest when to follow up.

## Features

- Identify emails with no response
- Calculate days pending
- Suggest follow-up timing
- Draft follow-up messages

## Usage

```
/followup
/followup john@example.com
```

*Full implementation in Epic 4*
```

- [ ] 6.7 Create `.claude/skills/orion/delegate/SKILL.md`:

```markdown
---
name: delegate
description: Assign tasks to others and track completion
trigger: /delegate
category: workflow
version: 1.0.0
author: Orion Team
tags:
  - tasks
  - delegation
  - tracking
tools:
  - composio_execute
dependencies: []
---

# Delegate Skill

Assign tasks to team members and track their completion.

## Features

- Create delegated task with deadline
- Send notification to assignee
- Track status (sent, acknowledged, in-progress, completed)
- Remind when overdue

## Usage

```
/delegate "Review PR #123" to:alice due:friday
```

*Full implementation in Epic 8*
```

- [ ] 6.8 Create `.claude/skills/orion/archive/SKILL.md`:

```markdown
---
name: archive
description: Move completed projects and items to archive with context
trigger: /archive
category: workflow
version: 1.0.0
author: Orion Team
tags:
  - para
  - archive
  - organization
tools: []
dependencies: []
---

# Archive Skill

Move completed work to archive while preserving context.

## Features

- Archive projects, tasks, or documents
- Preserve reason for archival
- Maintain searchability
- Support restoration

## Usage

```
/archive project:q1-launch "Successfully completed"
/archive task:task_001
```

*Full implementation in Epic 9*
```

### Task 7: Create Workflow Test Mocks (AC: #1, #2, #3)

- [ ] 7.1 Create `tests/mocks/workflows/index.ts`:

```typescript
import type { BatchTriageResult, OrganizeResult, WeeklyReviewResult, TriageResult } from '@/workflows/schemas';
import { vi } from 'vitest';

/**
 * Mock triage results
 */
export const TRIAGE_MOCKS: Record<string, TriageResult> = {
  urgent_client_email: {
    emailId: 'msg_urgent_001',
    priority: 0.95,
    category: 'urgent',
    summary: 'Client needs contract review by EOD',
    extractedTasks: [
      {
        title: 'Review contract from Acme Corp',
        confidence: 0.9,
        dueDate: '2026-01-15',
        source: 'msg_urgent_001',
      },
    ],
    suggestedActions: ['reply_urgent', 'add_task'],
    filingRecommendation: {
      type: 'project',
      targetName: 'Acme Partnership',
      confidence: 0.85,
    },
  },
  newsletter_fyi: {
    emailId: 'msg_fyi_001',
    priority: 0.1,
    category: 'fyi',
    summary: 'Weekly tech newsletter',
    extractedTasks: [],
    suggestedActions: ['archive'],
    filingRecommendation: {
      type: 'archive',
      confidence: 0.95,
    },
  },
};

export const MOCK_BATCH_TRIAGE: BatchTriageResult = {
  items: [TRIAGE_MOCKS.urgent_client_email, TRIAGE_MOCKS.newsletter_fyi],
  totalProcessed: 2,
  urgentCount: 1,
  actionItemCount: 1,
};

/**
 * Mock organize result
 */
export const MOCK_ORGANIZE_RESULT: OrganizeResult = {
  suggestedCategory: 'project',
  confidence: 0.85,
  rationale: 'This email discusses Q1 launch timeline with action items',
  targetName: 'Q1 Product Launch',
  targetId: 'proj_q1_launch',
  alternativeCategories: [
    {
      category: 'area',
      confidence: 0.4,
      reason: 'Could be filed under Engineering if general reference',
    },
  ],
};

/**
 * Mock weekly review result
 */
export const MOCK_WEEKLY_REVIEW: WeeklyReviewResult = {
  weekStartDate: '2026-01-13',
  weekEndDate: '2026-01-19',
  tasksCompleted: 12,
  tasksOverdue: 3,
  tasksInProgress: 8,
  upcomingDeadlines: [
    {
      taskId: 'task_001',
      title: 'Submit quarterly report',
      dueDate: '2026-01-20',
      projectName: 'Q1 Reporting',
    },
  ],
  suggestedPriorities: [
    'Clear overdue client responses',
    'Prepare for Thursday presentation',
    'Review Q1 budget draft',
  ],
  weekSummary: 'Productive week with 12 tasks completed. Focus on clearing the 3 overdue items.',
  achievements: ['Closed Acme partnership deal', 'Finished product roadmap draft'],
  blockers: ['Waiting on legal review for contract'],
};

/**
 * Create mock TriageWorkflow
 */
export const createMockTriageWorkflow = () => ({
  execute: vi.fn().mockResolvedValue(MOCK_BATCH_TRIAGE),
  fetchInbox: vi.fn().mockResolvedValue([]),
});

/**
 * Create mock OrganizeWorkflow
 */
export const createMockOrganizeWorkflow = () => ({
  execute: vi.fn().mockResolvedValue(MOCK_ORGANIZE_RESULT),
});

/**
 * Create mock WeeklyReviewWorkflow
 */
export const createMockWeeklyReviewWorkflow = () => ({
  execute: vi.fn().mockResolvedValue(MOCK_WEEKLY_REVIEW),
});
```

- [ ] 7.2 Export from `tests/mocks/index.ts`

### Task 8: Write Unit and Integration Tests (AC: #1, #2, #3, #4)

- [ ] 8.1 Create `tests/unit/story-2.12-workflow-skills.spec.ts`:

```typescript
import { test, expect, describe } from 'vitest';
import { parseSkillFrontmatter } from '@/skills/loader';
import { SkillMetadataSchema } from '@/skills/schemas';
import { readFile } from 'fs/promises';

const WORKFLOW_SKILLS = [
  '.claude/skills/orion/triage/SKILL.md',
  '.claude/skills/orion/organize/SKILL.md',
  '.claude/skills/orion/weekly-review/SKILL.md',
  '.claude/skills/orion/draft/SKILL.md',
  '.claude/skills/orion/schedule/SKILL.md',
  '.claude/skills/orion/followup/SKILL.md',
  '.claude/skills/orion/delegate/SKILL.md',
  '.claude/skills/orion/archive/SKILL.md',
];

describe('Story 2.12: Workflow Skill Adaptation', () => {

  test.each(WORKFLOW_SKILLS)('2.12.4 - %s has valid SKILL.md', async (skillPath) => {
    const content = await readFile(skillPath, 'utf-8');
    expect(content).toBeTruthy();

    const metadata = await parseSkillFrontmatter(skillPath);

    // Should have required fields
    expect(metadata.name).toBeTruthy();
    expect(metadata.description).toBeTruthy();

    // Should validate against schema
    expect(() => SkillMetadataSchema.parse(metadata)).not.toThrow();
  });

  test('all 8 workflow skills have category: workflow', async () => {
    for (const skillPath of WORKFLOW_SKILLS) {
      const metadata = await parseSkillFrontmatter(skillPath);
      expect(metadata.category).toBe('workflow');
    }
  });

});
```

- [ ] 8.2 Create `tests/integration/story-2.12-triage-workflow.spec.ts`:

```typescript
import { test, expect, vi, beforeEach } from 'vitest';
import { TriageWorkflow } from '@/workflows/triage';
import { TriageResultSchema, BatchTriageResultSchema } from '@/workflows/schemas';
import { TRIAGE_MOCKS, MOCK_BATCH_TRIAGE } from '../mocks/workflows';

describe('Story 2.12: Triage Workflow', () => {

  test('2.12.1 - /triage fetches and scores inbox items', async () => {
    const workflow = new TriageWorkflow();

    // Mock Claude response
    vi.spyOn(workflow['client'].messages, 'create').mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([TRIAGE_MOCKS.urgent_client_email, TRIAGE_MOCKS.newsletter_fyi]),
      }],
    } as any);

    const result = await workflow.execute([
      { id: 'msg_001', subject: 'URGENT: Contract Review', body: 'Please review...', from: 'vip@client.com', date: '2026-01-15T08:00:00Z' },
      { id: 'msg_002', subject: 'Newsletter', body: 'Weekly update...', from: 'news@example.com', date: '2026-01-15T09:00:00Z' },
    ]);

    expect(result.items).toHaveLength(2);
    expect(result.totalProcessed).toBe(2);
    expect(result.urgentCount).toBe(1);

    // Validate each result
    for (const item of result.items) {
      expect(() => TriageResultSchema.parse(item)).not.toThrow();
      expect(item.priority).toBeGreaterThanOrEqual(0);
      expect(item.priority).toBeLessThanOrEqual(1);
    }
  });

  test('priority scores are bounded 0.0-1.0', () => {
    const validResult = TRIAGE_MOCKS.urgent_client_email;
    expect(validResult.priority).toBeGreaterThanOrEqual(0);
    expect(validResult.priority).toBeLessThanOrEqual(1);

    // Schema should reject out-of-bounds
    const invalidResult = { ...validResult, priority: 1.5 };
    expect(() => TriageResultSchema.parse(invalidResult)).toThrow();
  });

});
```

- [ ] 8.3 Create `tests/integration/story-2.12-organize-workflow.spec.ts`:

```typescript
import { test, expect, vi } from 'vitest';
import { OrganizeWorkflow } from '@/workflows/organize';
import { OrganizeResultSchema } from '@/workflows/schemas';
import { MOCK_ORGANIZE_RESULT } from '../mocks/workflows';

describe('Story 2.12: Organize Workflow', () => {

  test('2.12.2 - /organize suggests correct PARA category', async () => {
    const workflow = new OrganizeWorkflow();

    vi.spyOn(workflow['client'].messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(MOCK_ORGANIZE_RESULT) }],
    } as any);

    const result = await workflow.execute({
      type: 'email',
      id: 'msg_001',
      title: 'Q4 Marketing Campaign Assets',
      content: 'Here are the design files for the campaign...',
    });

    expect(['project', 'area', 'resource', 'archive']).toContain(result.suggestedCategory);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.rationale).toBeTruthy();

    // Validate against schema
    expect(() => OrganizeResultSchema.parse(result)).not.toThrow();
  });

});
```

- [ ] 8.4 Create `tests/integration/story-2.12-weekly-review.spec.ts`:

```typescript
import { test, expect, vi } from 'vitest';
import { WeeklyReviewWorkflow } from '@/workflows/weekly-review';
import { WeeklyReviewResultSchema } from '@/workflows/schemas';
import { MOCK_WEEKLY_REVIEW } from '../mocks/workflows';

describe('Story 2.12: Weekly Review Workflow', () => {

  test('2.12.3 - /weekly-review generates summary with task counts', async () => {
    const workflow = new WeeklyReviewWorkflow();

    vi.spyOn(workflow['client'].messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(MOCK_WEEKLY_REVIEW) }],
    } as any);

    const result = await workflow.execute();

    expect(result.tasksCompleted).toBeGreaterThanOrEqual(0);
    expect(result.tasksOverdue).toBeGreaterThanOrEqual(0);
    expect(result.weekSummary).toBeTruthy();
    expect(result.suggestedPriorities).toBeInstanceOf(Array);
    expect(result.suggestedPriorities.length).toBeGreaterThan(0);

    // Validate against schema
    expect(() => WeeklyReviewResultSchema.parse(result)).not.toThrow();
  });

});
```

### Task 9: Create Workflow Index and Exports

- [ ] 9.1 Create `agent-server/src/workflows/index.ts`:

```typescript
// Schemas
export * from './schemas';

// Workflows
export { TriageWorkflow, type InboxItem } from './triage';
export { OrganizeWorkflow, type ItemToOrganize } from './organize';
export { WeeklyReviewWorkflow } from './weekly-review';
export { DraftWorkflow } from './draft';
export { ScheduleWorkflow } from './schedule';
export { FollowupWorkflow } from './followup';
export { DelegateWorkflow } from './delegate';
export { ArchiveWorkflow } from './archive';
```

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Workflow Architecture (from architecture.md):**

- Workflows are specialized skill implementations with structured outputs
- Each workflow returns a strongly-typed result validated by Zod
- Workflows use Claude Sonnet 4.5 with prompt caching for efficiency
- Results formatted for canvas rendering via json-render

**SKILL.md Format Requirements:**

```yaml
---
name: skill-name
description: Brief description (10+ chars)
trigger: /command
category: workflow  # MUST be 'workflow' for these skills
version: 1.0.0
tags: []
tools: []  # MCP tools required
dependencies: []
---

# Skill prompt content here...
```

**Priority Scoring Criteria (from epics.md):**

| Score Range | Category | Description |
|-------------|----------|-------------|
| 0.9-1.0 | urgent | Deadline today, VIP sender, escalation |
| 0.7-0.8 | important | Key project, action required this week |
| 0.5-0.6 | normal | Standard priority, no urgency |
| 0.3-0.4 | low | Can wait, informational with minor action |
| 0.0-0.2 | fyi | Newsletter, notification, marketing |

### Previous Story Intelligence

From Story 2.11 (Core Skill Migration Framework):
- SkillLoader, SkillCatalog, SkillRunner infrastructure exists
- Skills loaded from `.claude/skills/` with SKILL.md frontmatter
- Use `parseSkillFrontmatter()` for metadata extraction
- Use `buildCachedPrompt()` for cost-efficient prompts

From Story 2.10 (Prompt Caching):
- All workflows should use `buildCachedPrompt()` for system prompts
- Static prompt portions are cached, dynamic portions are not

### Integration Points

**Skill Runner Integration (Story 2.11):**
- Workflow skills are invoked via SkillRunner
- `/triage` triggers TriageWorkflow.execute()
- Results stream back to user via existing infrastructure

**Canvas Rendering (Epic 11):**
- Workflow results include `canvasOutput` for json-render
- UI renders structured output in the canvas panel
- Action buttons for filing, archiving, etc.

**Composio Integration (Epic 3):**
- `/triage` will fetch emails via GMAIL_FETCH_EMAILS
- `/schedule` will create events via GOOGLECALENDAR_CREATE_EVENT
- Current stubs return mock data until Epic 3 integrates Composio

### Project Structure Notes

```
agent-server/
  src/
    workflows/
      schemas.ts          # Zod schemas for all workflow results (CREATE)
      triage.ts           # TriageWorkflow implementation (CREATE)
      organize.ts         # OrganizeWorkflow implementation (CREATE)
      weekly-review.ts    # WeeklyReviewWorkflow implementation (CREATE)
      draft.ts            # DraftWorkflow stub (CREATE)
      schedule.ts         # ScheduleWorkflow stub (CREATE)
      followup.ts         # FollowupWorkflow stub (CREATE)
      delegate.ts         # DelegateWorkflow stub (CREATE)
      archive.ts          # ArchiveWorkflow stub (CREATE)
      index.ts            # Re-exports (CREATE)
    skills/
      loader.ts           # (EXISTS - from Story 2.11)
      catalog.ts          # (EXISTS - from Story 2.11)
      runner.ts           # (EXISTS - from Story 2.11)
    agents/
      caching.ts          # (EXISTS - from Story 2.10)

.claude/skills/
  orion/
    triage/SKILL.md       # (CREATE)
    organize/SKILL.md     # (CREATE)
    weekly-review/SKILL.md # (CREATE)
    draft/SKILL.md        # (CREATE)
    schedule/SKILL.md     # (CREATE)
    followup/SKILL.md     # (CREATE)
    delegate/SKILL.md     # (CREATE)
    archive/SKILL.md      # (CREATE)

tests/
  mocks/
    workflows/
      index.ts            # Mock workflows and results (CREATE)
  unit/
    story-2.12-workflow-skills.spec.ts
  integration/
    story-2.12-triage-workflow.spec.ts
    story-2.12-organize-workflow.spec.ts
    story-2.12-weekly-review.spec.ts
```

### Testing Standards

From test-design-epic-2.md Story 2.12 section:

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.12.1 | Integration | `/triage` fetches and scores inbox items | Priority scores returned | Vitest |
| 2.12.2 | Integration | `/organize` suggests correct PARA category | Valid category suggestion | Vitest |
| 2.12.3 | E2E | `/weekly-review` generates summary | Task counts included | Vercel Browser Agent |
| 2.12.4 | Unit | Each workflow skill has valid SKILL.md | Schema validates | Vitest |
| 2.12.5 | Integration | Workflow results render in canvas | Canvas updated | Vitest |
| 2.12.6 | E2E | User completes triage workflow | End-to-end flow | Vercel Browser Agent |

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.10 (Prompt Caching)** - `buildCachedPrompt()` utility
- **Story 2.11 (Core Skill Migration)** - SkillLoader, SkillCatalog, SkillRunner infrastructure

### Downstream Dependencies (blocked by this story)

- **Story 2.13 (Memory & Context Skills)** - Memory skills build on skill infrastructure
- **Epic 4 (Unified Inbox)** - Triage workflow is core to inbox processing
- **Epic 5 (Email Communication)** - Draft workflow full implementation
- **Epic 6 (Calendar Management)** - Schedule workflow full implementation

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.12] - Story definition and workflow skill table
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.12] - Test scenarios
- [Source: thoughts/implementation-artifacts/stories/story-2-11-core-skill-migration-framework.md] - Previous story patterns
- [Source: thoughts/planning-artifacts/architecture.md#6-agent-architecture] - Agent and workflow patterns

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
