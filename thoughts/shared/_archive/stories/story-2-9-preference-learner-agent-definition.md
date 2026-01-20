# Story 2.9: Preference Learner Agent Definition

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-9-preference-learner-agent-definition
**Priority:** P2
**Risk:** MEDIUM

---

## Story

As a user,
I want Orion to learn my preferences over time,
So that it gets better at anticipating my needs.

---

## Acceptance Criteria

### AC1: Preference Learner Agent Prompt with Pattern Detection

**Given** the Preference Learner Agent observes my behavior (ARCH-016)
**When** it detects a pattern
**Then** it records the preference with source (observed vs explicit)
**And** it stores confidence level based on repetition

- [ ] Preference Learner agent prompt (`.claude/agents/preference-learner.md`) includes pattern detection logic
- [ ] Prompt includes sections for: persona, observation strategy, pattern recognition, confidence scoring
- [ ] Prompt references preference categories (scheduling, communication, organization, notifications)
- [ ] Prompt includes instructions for distinguishing observed vs explicit preferences
- [ ] Prompt length > 1000 characters (core agent requirement from Story 2.2)

### AC2: Confidence-Based Learning from Repeated Behavior

**Given** repeated user actions are observed
**When** the Preference Learner detects a pattern
**Then** confidence increases with each supporting observation
**And** confidence decreases if contradicting behavior is observed

- [ ] LearnedPreferenceSchema includes `confidence: number` field (0.0-1.0)
- [ ] LearnedPreferenceSchema includes `observationCount: number` field
- [ ] LearnedPreferenceSchema includes `source: 'observed' | 'explicit' | 'default'`
- [ ] Confidence starts low (0.3) for first **observed** preference (explicit preferences always start at 1.0)
- [ ] Confidence increases with repeated observations (up to 0.95 max for observed)
- [ ] Contradicting behavior can decrease confidence

### AC3: Evidence Tracking for Learned Preferences

**Given** a preference is learned from observed behavior
**When** stored in the database
**Then** the triggering observations are linked to the preference
**And** the evidence chain is available for transparency

- [ ] LearnedPreferenceSchema includes `evidence: EvidenceItem[]` array
- [ ] Each EvidenceItem includes: action, timestamp, context
- [ ] Evidence is pruned to keep only last N observations (configurable)
- [ ] User can see why Orion learned a preference (transparency)

### AC4: Preference Injection into Agent Context

**Given** preferences are stored with high confidence (> 0.7)
**When** other agents (Butler, Scheduler, Communicator) make decisions
**Then** relevant preferences are injected into their context
**And** agent decisions align with learned preferences

- [ ] PreferenceService exposes `getRelevantPreferences(category, minConfidence)` method
- [ ] Butler agent context includes user preferences (from `initializeAgentContext()`)
- [ ] Scheduler respects scheduling preferences (morning meetings, focus time)
- [ ] Communicator respects communication preferences (tone, formality)
- [ ] Only high-confidence preferences (> 0.7) are injected by default

### AC5: LearnedPreference Schema Validation

**Given** the Preference Learner Agent produces output
**When** output is returned to store a preference
**Then** it is type-safe JSON validated by the LearnedPreferenceSchema

- [ ] LearnedPreferenceSchema (Zod) validates all required fields
- [ ] Schema includes: `id`, `category`, `preference`, `confidence`, `source`, `evidence`, `lastUpdated`
- [ ] Invalid confidence values (outside 0-1) throw validation errors
- [ ] Invalid source values throw validation errors
- [ ] Schema exports types for TypeScript consumption

---

## Tasks / Subtasks

### Task 1: Create/Update Preference Learner Agent Prompt (AC: #1)

- [ ] 1.1 Create `.claude/agents/preference-learner.md` (pure markdown format, no frontmatter)
- [ ] 1.2 Include pattern detection strategy instructions:
  - Observe user actions across interactions
  - Detect recurring patterns (timing, choices, corrections)
  - Distinguish preferences from one-time decisions
  - Handle conflicting signals gracefully
- [ ] 1.3 Include preference categories:
  - `scheduling_preference` - meeting times, focus blocks, availability
  - `communication_preference` - tone, formality, channel choice
  - `organization_preference` - filing habits, naming conventions
  - `notification_preference` - urgency thresholds, quiet hours
- [ ] 1.4 Include confidence scoring guidelines:
  - First observation: 0.3 confidence
  - Second observation: 0.5 confidence
  - Third+ observation: 0.7+ confidence (diminishing returns)
  - Contradicting evidence: reduce by 0.2
- [ ] 1.5 Include evidence tracking instructions:
  - Record action type, timestamp, context for each observation
  - Keep last 10 observations per preference
  - Include "why" explanation for user transparency
- [ ] 1.6 Include source classification:
  - `explicit`: User directly stated preference
  - `observed`: Inferred from behavior patterns
  - `default`: System default (lowest priority)
- [ ] 1.7 Verify prompt length > 1000 characters

### Task 2: Create Preference Learner Schema Definitions (AC: #2, #3, #5)

- [ ] 2.1 Create `agent-server/src/agents/schemas/preference-learner.ts`:
```typescript
import { z } from 'zod';

// Preference source enum
export const PreferenceSource = z.enum(['explicit', 'observed', 'default']);

// Preference category enum
export const PreferenceCategory = z.enum([
  'scheduling_preference',
  'communication_preference',
  'organization_preference',
  'notification_preference',
]);

// Evidence item for tracking why a preference was learned
export const EvidenceItemSchema = z.object({
  action: z.string(),                    // e.g., 'scheduled_meeting', 'edited_draft'
  timestamp: z.string().datetime(),
  context: z.string().optional(),        // Additional context about the observation
  contributionType: z.enum(['supporting', 'contradicting']).default('supporting'),
});

// Core learned preference schema
export const LearnedPreferenceSchema = z.object({
  id: z.string(),                        // pref_xxx format
  category: PreferenceCategory,
  key: z.string(),                       // e.g., 'morning_meetings', 'formal_tone'
  preference: z.string(),                // Human-readable description
  value: z.unknown().optional(),         // Structured value (JSON)

  // Learning metadata
  confidence: z.number().min(0).max(1),
  source: PreferenceSource,
  observationCount: z.number().int().min(1),
  evidence: z.array(EvidenceItemSchema).max(10),  // Keep last 10 observations

  // Timestamps
  firstObserved: z.string().datetime(),
  lastUpdated: z.string().datetime(),
});

// Observation input schema (what Preference Learner receives)
export const ObservationInputSchema = z.object({
  action: z.string(),                    // Action type being observed
  context: z.record(z.unknown()),        // Contextual data about the action
  timestamp: z.string().datetime().optional(), // Defaults to now
  sessionId: z.string().optional(),
});

// Preference Learner response actions
export const PreferenceLearnerAction = z.enum([
  'learned_new',      // New preference detected
  'updated_existing', // Existing preference updated (confidence change)
  'no_pattern',       // No pattern detected from observation
  'contradiction',    // Observed behavior contradicts existing preference
]);

// Main response schema
export const PreferenceLearnerResponseSchema = z.object({
  action: PreferenceLearnerAction,
  preference: LearnedPreferenceSchema.optional(),
  analysis: z.object({
    patternDetected: z.boolean(),
    relatedPreferences: z.array(z.string()).optional(), // IDs of related prefs
    confidenceChange: z.number().optional(),           // Delta in confidence
    explanation: z.string().optional(),                // Why this pattern was detected
  }).optional(),
});

// Query for retrieving preferences
export const PreferenceQuerySchema = z.object({
  category: PreferenceCategory.optional(),
  minConfidence: z.number().min(0).max(1).default(0.7),
  source: PreferenceSource.optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

// Type exports
export type LearnedPreference = z.infer<typeof LearnedPreferenceSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type ObservationInput = z.infer<typeof ObservationInputSchema>;
export type PreferenceLearnerResponse = z.infer<typeof PreferenceLearnerResponseSchema>;
export type PreferenceQuery = z.infer<typeof PreferenceQuerySchema>;
```
- [ ] 2.2 Export schema from `agent-server/src/agents/schemas/index.ts`

### Task 3: Implement Preference Learner Agent Class (AC: #1, #2, #3, #4, #5)

- [ ] 3.1 Create `agent-server/src/agents/preference-learner/index.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { loadAgentTemplate, interpolateTemplate } from '../templates';
import {
  PreferenceLearnerResponseSchema,
  LearnedPreferenceSchema,
  ObservationInputSchema,
  type PreferenceLearnerResponse,
  type LearnedPreference,
  type ObservationInput,
  type PreferenceCategory,
} from '../schemas/preference-learner';
import type { AgentContext } from '../../types';
import type { IPreferenceStore } from '../../services/preferences';

/**
 * PreferenceLearnerAgent - User preference pattern detection and learning
 *
 * This agent observes user behavior and detects recurring patterns to learn
 * user preferences over time. It works passively in the background,
 * receiving observations from other agents and the system.
 *
 * Key behaviors:
 * - Detect patterns from repeated actions
 * - Track confidence based on observation count
 * - Distinguish explicit vs observed preferences
 * - Provide evidence chain for transparency
 */
export class PreferenceLearnerAgent {
  private client: Anthropic;
  private template: string;
  private preferenceStore: IPreferenceStore;

  /**
   * Constructor requires IPreferenceStore dependency for proper dependency injection.
   * For production: Inject PreferenceStore from agent-server/src/services/preferences.ts
   * For testing: Inject MockPreferenceStore from tests/mocks/services/preferences.ts
   *
   * @param options.preferenceStore - IPreferenceStore interface for persistence
   * @param options.client - Optional Anthropic client (defaults to new instance, useful for testing)
   */
  constructor(options: { preferenceStore: IPreferenceStore; client?: Anthropic }) {
    this.preferenceStore = options.preferenceStore;
    this.client = options.client ?? new Anthropic();
  }

  /**
   * Factory method for production use with default PreferenceStore.
   */
  static async create(): Promise<PreferenceLearnerAgent> {
    const { getPreferenceStore } = await import('../../services');
    const preferenceStore = getPreferenceStore();
    const agent = new PreferenceLearnerAgent({ preferenceStore });
    await agent.initialize();
    return agent;
  }

  async initialize(): Promise<void> {
    const loaded = await loadAgentTemplate('preference-learner');
    this.template = loaded.systemPrompt;
  }

  /**
   * Main entry point - observe an action and detect patterns
   */
  async observeAction(
    observation: ObservationInput,
    context: AgentContext
  ): Promise<PreferenceLearnerResponse> {
    // 1. Validate observation with ObservationInputSchema
    // 2. Retrieve existing preferences in related category
    // 3. Build system prompt via interpolateTemplate()
    // 4. Call Claude to analyze pattern
    // 5. Update preference store if pattern detected
    // 6. Return validated response
  }

  /**
   * Get preferences for injection into other agent contexts
   */
  async getRelevantPreferences(
    category?: PreferenceCategory,
    minConfidence: number = 0.7
  ): Promise<LearnedPreference[]> {
    return this.preferenceStore.query({
      category,
      minConfidence,
      source: undefined, // All sources
    });
  }

  /**
   * Record an explicit preference stated by the user
   */
  async recordExplicitPreference(
    category: PreferenceCategory,
    key: string,
    preference: string,
    value?: unknown
  ): Promise<LearnedPreference> {
    // Explicit preferences get 1.0 confidence immediately
    const pref: LearnedPreference = {
      id: `pref_${Date.now()}`,
      category,
      key,
      preference,
      value,
      confidence: 1.0,
      source: 'explicit',
      observationCount: 1,
      evidence: [{
        action: 'user_stated_preference',
        timestamp: new Date().toISOString(),
        context: 'Explicitly told by user',
        contributionType: 'supporting',
      }],
      firstObserved: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await this.preferenceStore.set(pref);
    return pref;
  }

  /**
   * Update confidence for existing preference based on new observation
   */
  private updateConfidence(
    existing: LearnedPreference,
    isSupporting: boolean
  ): number {
    const delta = isSupporting ? 0.15 : -0.2;
    const newConfidence = Math.max(0, Math.min(0.95, existing.confidence + delta));
    return newConfidence;
  }

  /**
   * Calculate initial confidence based on observation count
   */
  private calculateInitialConfidence(observationCount: number): number {
    // First observation: 0.3
    // Second: 0.5
    // Third: 0.65
    // Fourth+: diminishing returns up to 0.95
    if (observationCount === 1) return 0.3;
    if (observationCount === 2) return 0.5;
    if (observationCount === 3) return 0.65;
    return Math.min(0.95, 0.65 + (observationCount - 3) * 0.05);
  }

  /**
   * Record user edit/correction to learn from modifications
   */
  async recordUserEdit(params: {
    originalValue: string;
    editedValue: string;
    category: PreferenceCategory;
    context?: string;
  }): Promise<PreferenceLearnerResponse> {
    // Edits are strong signals - analyze what changed
    // and extract preference from the modification
  }
}
```
- [ ] 3.2 Export from `agent-server/src/agents/index.ts`

### Task 4: Implement Preference Store Service (AC: #4)

- [ ] 4.1 Create `agent-server/src/services/preferences.ts`:
```typescript
import Database from 'better-sqlite3';
import {
  LearnedPreferenceSchema,
  PreferenceQuerySchema,
  type LearnedPreference,
  type PreferenceQuery,
} from '../agents/schemas/preference-learner';

/**
 * IPreferenceStore - Interface for preference persistence
 * Used for dependency injection in PreferenceLearnerAgent constructor.
 * Enables easy mocking in tests.
 */
export interface IPreferenceStore {
  get(id: string): Promise<LearnedPreference | null>;
  getByKey(category: string, key: string): Promise<LearnedPreference | null>;
  set(pref: LearnedPreference): Promise<void>;
  query(params: PreferenceQuery): Promise<LearnedPreference[]>;
}

/**
 * PreferenceStore - Persistence layer for learned preferences
 *
 * Maps to SQLite `preferences` table (architecture.md section 4.1)
 */
export class PreferenceStore implements IPreferenceStore {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async get(id: string): Promise<LearnedPreference | null> {
    const row = this.db.prepare(`
      SELECT * FROM preferences WHERE id = ?
    `).get(id);

    if (!row) return null;
    return this.rowToPreference(row);
  }

  async getByKey(category: string, key: string): Promise<LearnedPreference | null> {
    const row = this.db.prepare(`
      SELECT * FROM preferences WHERE category = ? AND key = ?
    `).get(category, key);

    if (!row) return null;
    return this.rowToPreference(row);
  }

  async set(pref: LearnedPreference): Promise<void> {
    // Validate before storing
    LearnedPreferenceSchema.parse(pref);

    this.db.prepare(`
      INSERT OR REPLACE INTO preferences
      (id, category, key, value, source, confidence, observation_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pref.id,
      pref.category,
      pref.key,
      JSON.stringify({ preference: pref.preference, value: pref.value, evidence: pref.evidence }),
      pref.source,
      pref.confidence,
      pref.observationCount,
      pref.firstObserved,
      pref.lastUpdated
    );
  }

  async query(params: PreferenceQuery): Promise<LearnedPreference[]> {
    const validated = PreferenceQuerySchema.parse(params);

    let sql = 'SELECT * FROM preferences WHERE confidence >= ?';
    const sqlParams: unknown[] = [validated.minConfidence];

    if (validated.category) {
      sql += ' AND category = ?';
      sqlParams.push(validated.category);
    }

    if (validated.source) {
      sql += ' AND source = ?';
      sqlParams.push(validated.source);
    }

    sql += ' ORDER BY confidence DESC LIMIT ?';
    sqlParams.push(validated.limit);

    const rows = this.db.prepare(sql).all(...sqlParams);
    return rows.map(row => this.rowToPreference(row));
  }

  private rowToPreference(row: any): LearnedPreference {
    const valueData = JSON.parse(row.value);
    return {
      id: row.id,
      category: row.category,
      key: row.key,
      preference: valueData.preference,
      value: valueData.value,
      confidence: row.confidence,
      source: row.source,
      observationCount: row.observation_count,
      evidence: valueData.evidence || [],
      firstObserved: row.created_at,
      lastUpdated: row.updated_at,
    };
  }
}

// Singleton accessor
let preferenceStore: PreferenceStore | null = null;

export function getPreferenceStore(): PreferenceStore {
  if (!preferenceStore) {
    throw new Error('PreferenceStore not initialized. Call initPreferenceStore() first.');
  }
  return preferenceStore;
}

export function initPreferenceStore(db: Database.Database): void {
  preferenceStore = new PreferenceStore(db);
}
```
- [ ] 4.2 Export from `agent-server/src/services/index.ts`

### Task 5: Create Test Mocks (AC: #2, #3, #4, #5)

- [ ] 5.1 Create `tests/mocks/agents/preference-learner.ts`:
```typescript
import type {
  PreferenceLearnerResponse,
  LearnedPreference,
} from '@/agents/schemas/preference-learner';

export const PREFERENCE_LEARNER_MOCKS = {
  // Scenario: New scheduling preference detected
  learned_morning_meetings: {
    action: 'learned_new',
    preference: {
      id: 'pref_morning_001',
      category: 'scheduling_preference',
      key: 'morning_meetings',
      preference: 'Prefers morning meetings (9-11am)',
      value: { preferredTimeRange: { start: '09:00', end: '11:00' } },
      confidence: 0.3,
      source: 'observed',
      observationCount: 1,
      evidence: [
        {
          action: 'scheduled_meeting',
          timestamp: '2026-01-15T09:00:00Z',
          context: 'Chose 9am slot for client call',
          contributionType: 'supporting',
        },
      ],
      firstObserved: '2026-01-15T09:00:00Z',
      lastUpdated: '2026-01-15T09:00:00Z',
    },
    analysis: {
      patternDetected: true,
      explanation: 'User scheduled a meeting for 9am, which falls within morning hours',
    },
  } satisfies PreferenceLearnerResponse,

  // Scenario: Existing preference updated with higher confidence
  updated_morning_meetings_high_confidence: {
    action: 'updated_existing',
    preference: {
      id: 'pref_morning_001',
      category: 'scheduling_preference',
      key: 'morning_meetings',
      preference: 'Prefers morning meetings (9-11am)',
      value: { preferredTimeRange: { start: '09:00', end: '11:00' } },
      confidence: 0.85,
      source: 'observed',
      observationCount: 5,
      evidence: [
        {
          action: 'scheduled_meeting',
          timestamp: '2026-01-15T09:00:00Z',
          context: 'Chose 9am slot for client call',
          contributionType: 'supporting',
        },
        {
          action: 'scheduled_meeting',
          timestamp: '2026-01-14T10:00:00Z',
          context: 'Chose 10am slot for team standup',
          contributionType: 'supporting',
        },
        {
          action: 'scheduled_meeting',
          timestamp: '2026-01-13T09:30:00Z',
          context: 'Chose 9:30am slot for 1:1',
          contributionType: 'supporting',
        },
      ],
      firstObserved: '2026-01-10T09:00:00Z',
      lastUpdated: '2026-01-15T09:00:00Z',
    },
    analysis: {
      patternDetected: true,
      confidenceChange: 0.15,
      explanation: 'Fifth observation of morning meeting preference',
    },
  } satisfies PreferenceLearnerResponse,

  // Scenario: Explicit preference from user statement
  explicit_formal_tone: {
    action: 'learned_new',
    preference: {
      id: 'pref_formal_001',
      category: 'communication_preference',
      key: 'formal_tone_clients',
      preference: 'Use formal tone with external clients',
      value: { tone: 'formal', context: 'external_clients' },
      confidence: 1.0,
      source: 'explicit',
      observationCount: 1,
      evidence: [
        {
          action: 'user_stated_preference',
          timestamp: '2026-01-15T14:30:00Z',
          context: 'User said: "Always use formal language with clients"',
          contributionType: 'supporting',
        },
      ],
      firstObserved: '2026-01-15T14:30:00Z',
      lastUpdated: '2026-01-15T14:30:00Z',
    },
    analysis: {
      patternDetected: true,
      explanation: 'User explicitly stated this preference',
    },
  } satisfies PreferenceLearnerResponse,

  // Scenario: No pattern detected yet
  no_pattern_single_observation: {
    action: 'no_pattern',
    analysis: {
      patternDetected: false,
      explanation: 'Single observation - need more data points to establish pattern',
    },
  } satisfies PreferenceLearnerResponse,

  // Scenario: Contradicting behavior detected
  contradiction_detected: {
    action: 'contradiction',
    preference: {
      id: 'pref_morning_001',
      category: 'scheduling_preference',
      key: 'morning_meetings',
      preference: 'Prefers morning meetings (9-11am)',
      value: { preferredTimeRange: { start: '09:00', end: '11:00' } },
      confidence: 0.65, // Reduced from 0.85
      source: 'observed',
      observationCount: 6,
      evidence: [
        {
          action: 'scheduled_meeting',
          timestamp: '2026-01-16T15:00:00Z',
          context: 'Chose 3pm slot for meeting (contradicts morning preference)',
          contributionType: 'contradicting',
        },
        // Previous supporting evidence...
      ],
      firstObserved: '2026-01-10T09:00:00Z',
      lastUpdated: '2026-01-16T15:00:00Z',
    },
    analysis: {
      patternDetected: true,
      confidenceChange: -0.2,
      explanation: 'User scheduled afternoon meeting, which contradicts morning preference',
    },
  } satisfies PreferenceLearnerResponse,

  // Scenario: Communication preference learned from draft edits
  learned_casual_colleague_tone: {
    action: 'learned_new',
    preference: {
      id: 'pref_casual_001',
      category: 'communication_preference',
      key: 'casual_tone_colleagues',
      preference: 'Uses casual tone with internal colleagues',
      value: { tone: 'casual', context: 'internal_colleagues' },
      confidence: 0.5,
      source: 'observed',
      observationCount: 2,
      evidence: [
        {
          action: 'edited_draft',
          timestamp: '2026-01-15T11:00:00Z',
          context: 'Changed "Dear" to "Hey" in email to colleague',
          contributionType: 'supporting',
        },
        {
          action: 'edited_draft',
          timestamp: '2026-01-14T16:00:00Z',
          context: 'Removed formal closing, added casual "Thanks!"',
          contributionType: 'supporting',
        },
      ],
      firstObserved: '2026-01-14T16:00:00Z',
      lastUpdated: '2026-01-15T11:00:00Z',
    },
    analysis: {
      patternDetected: true,
      explanation: 'User consistently edits drafts to be more casual with colleagues',
    },
  } satisfies PreferenceLearnerResponse,
};

// Mock for preference store
export const MOCK_STORED_PREFERENCES: LearnedPreference[] = [
  {
    id: 'pref_morning_001',
    category: 'scheduling_preference',
    key: 'morning_meetings',
    preference: 'Prefers morning meetings (9-11am)',
    value: { preferredTimeRange: { start: '09:00', end: '11:00' } },
    confidence: 0.9,
    source: 'observed',
    observationCount: 5,
    evidence: [],
    firstObserved: '2026-01-10T09:00:00Z',
    lastUpdated: '2026-01-15T09:00:00Z',
  },
  {
    id: 'pref_formal_001',
    category: 'communication_preference',
    key: 'formal_tone_clients',
    preference: 'Use formal tone with external clients',
    confidence: 1.0,
    source: 'explicit',
    observationCount: 1,
    evidence: [],
    firstObserved: '2026-01-15T14:30:00Z',
    lastUpdated: '2026-01-15T14:30:00Z',
  },
];
```
- [ ] 5.2 Export from `tests/mocks/agents/index.ts`

### Task 6: Write Tests (AC: #1, #2, #3, #4, #5)

- [ ] 6.1 Create `tests/unit/story-2.9-preference-learner.spec.ts`:
```typescript
import { test, expect, describe, vi } from 'vitest';
import { loadAgentTemplate } from '@/agents/templates';
import {
  LearnedPreferenceSchema,
  EvidenceItemSchema,
  PreferenceLearnerResponseSchema,
  PreferenceCategory,
  PreferenceSource,
  ObservationInputSchema,
} from '@/agents/schemas/preference-learner';
import { PREFERENCE_LEARNER_MOCKS, MOCK_STORED_PREFERENCES } from '../mocks/agents/preference-learner';

describe('Story 2.9: Preference Learner Agent Definition', () => {

  test('2.9.1 - Preference Learner prompt includes pattern detection', async () => {
    const template = await loadAgentTemplate('preference-learner');

    // Should have pattern detection instructions
    expect(template.systemPrompt).toMatch(/pattern|behavior|habit/i);
    expect(template.systemPrompt).toMatch(/observe|detect|learn/i);
    expect(template.systemPrompt).toMatch(/confidence|certainty/i);

    // Should be substantial (> 1000 chars)
    expect(template.systemPrompt.length).toBeGreaterThan(1000);
  });

  test('2.9.2a - LearnedPreference schema includes required fields', () => {
    const validPref = PREFERENCE_LEARNER_MOCKS.learned_morning_meetings.preference;

    expect(() => LearnedPreferenceSchema.parse(validPref)).not.toThrow();

    // Check all required fields present
    expect(validPref).toHaveProperty('id');
    expect(validPref).toHaveProperty('category');
    expect(validPref).toHaveProperty('preference');
    expect(validPref).toHaveProperty('confidence');
    expect(validPref).toHaveProperty('source');
    expect(validPref).toHaveProperty('observationCount');
    expect(validPref).toHaveProperty('evidence');
    expect(validPref).toHaveProperty('lastUpdated');
  });

  test('2.9.2b - confidence is bounded 0.0-1.0', () => {
    const prefs = [
      PREFERENCE_LEARNER_MOCKS.learned_morning_meetings.preference,
      PREFERENCE_LEARNER_MOCKS.updated_morning_meetings_high_confidence.preference,
      PREFERENCE_LEARNER_MOCKS.explicit_formal_tone.preference,
    ];

    for (const pref of prefs) {
      expect(pref!.confidence).toBeGreaterThanOrEqual(0.0);
      expect(pref!.confidence).toBeLessThanOrEqual(1.0);
    }

    // Invalid confidence should throw
    const invalidPref = { ...prefs[0]!, confidence: 1.5 };
    expect(() => LearnedPreferenceSchema.parse(invalidPref)).toThrow();
  });

  test('2.9.2c - first observation starts at 0.3 confidence', () => {
    const firstObs = PREFERENCE_LEARNER_MOCKS.learned_morning_meetings.preference;
    expect(firstObs!.observationCount).toBe(1);
    expect(firstObs!.confidence).toBeCloseTo(0.3, 1);
  });

  test('2.9.2d - confidence increases with repeated observations', () => {
    const firstObs = PREFERENCE_LEARNER_MOCKS.learned_morning_meetings.preference!;
    const highConf = PREFERENCE_LEARNER_MOCKS.updated_morning_meetings_high_confidence.preference!;

    expect(highConf.observationCount).toBeGreaterThan(firstObs.observationCount);
    expect(highConf.confidence).toBeGreaterThan(firstObs.confidence);
  });

  test('2.9.2e - contradicting behavior decreases confidence', () => {
    const highConf = PREFERENCE_LEARNER_MOCKS.updated_morning_meetings_high_confidence.preference!;
    const contradiction = PREFERENCE_LEARNER_MOCKS.contradiction_detected.preference!;

    expect(contradiction.confidence).toBeLessThan(highConf.confidence);
    expect(contradiction.analysis?.confidenceChange).toBeLessThan(0);
  });

  test('2.9.3a - evidence tracking includes action details', () => {
    const pref = PREFERENCE_LEARNER_MOCKS.learned_morning_meetings.preference!;

    expect(pref.evidence).toBeInstanceOf(Array);
    expect(pref.evidence.length).toBeGreaterThan(0);

    const evidence = pref.evidence[0];
    expect(evidence).toHaveProperty('action');
    expect(evidence).toHaveProperty('timestamp');
    expect(evidence).toHaveProperty('contributionType');
  });

  test('2.9.3b - evidence items validate correctly', () => {
    const validEvidence = {
      action: 'scheduled_meeting',
      timestamp: '2026-01-15T09:00:00Z',
      context: 'Chose 9am slot',
      contributionType: 'supporting',
    };

    expect(() => EvidenceItemSchema.parse(validEvidence)).not.toThrow();

    // Missing timestamp should fail
    const invalidEvidence = { action: 'test' };
    expect(() => EvidenceItemSchema.parse(invalidEvidence)).toThrow();
  });

  test('2.9.3c - evidence is capped at 10 items', () => {
    // Evidence array max is 10
    const tooManyEvidence = Array(15).fill({
      action: 'test',
      timestamp: '2026-01-15T09:00:00Z',
      contributionType: 'supporting',
    });

    const prefWithTooMany = {
      ...PREFERENCE_LEARNER_MOCKS.learned_morning_meetings.preference!,
      evidence: tooManyEvidence,
    };

    expect(() => LearnedPreferenceSchema.parse(prefWithTooMany)).toThrow();
  });

  test('2.9.4a - source enum validates correctly', () => {
    const validSources = ['explicit', 'observed', 'default'];

    for (const source of validSources) {
      expect(() => PreferenceSource.parse(source)).not.toThrow();
    }

    expect(() => PreferenceSource.parse('unknown')).toThrow();
  });

  test('2.9.4b - explicit preferences have 1.0 confidence', () => {
    const explicit = PREFERENCE_LEARNER_MOCKS.explicit_formal_tone.preference!;

    expect(explicit.source).toBe('explicit');
    expect(explicit.confidence).toBe(1.0);
  });

  test('2.9.5a - PreferenceLearnerResponse schema validates all action types', () => {
    expect(() => PreferenceLearnerResponseSchema.parse(
      PREFERENCE_LEARNER_MOCKS.learned_morning_meetings
    )).not.toThrow();

    expect(() => PreferenceLearnerResponseSchema.parse(
      PREFERENCE_LEARNER_MOCKS.updated_morning_meetings_high_confidence
    )).not.toThrow();

    expect(() => PreferenceLearnerResponseSchema.parse(
      PREFERENCE_LEARNER_MOCKS.no_pattern_single_observation
    )).not.toThrow();

    expect(() => PreferenceLearnerResponseSchema.parse(
      PREFERENCE_LEARNER_MOCKS.contradiction_detected
    )).not.toThrow();
  });

  test('2.9.5b - PreferenceCategory enum includes all categories', () => {
    const categories = [
      'scheduling_preference',
      'communication_preference',
      'organization_preference',
      'notification_preference',
    ];

    for (const cat of categories) {
      expect(() => PreferenceCategory.parse(cat)).not.toThrow();
    }
  });

  test('2.9.5c - ObservationInput schema validates correctly', () => {
    const validObs = {
      action: 'scheduled_meeting',
      context: { meetingTime: '09:00', attendee: 'john@example.com' },
      timestamp: '2026-01-15T09:00:00Z',
    };

    expect(() => ObservationInputSchema.parse(validObs)).not.toThrow();

    // Missing action should fail
    const invalidObs = { context: {} };
    expect(() => ObservationInputSchema.parse(invalidObs)).toThrow();
  });

});
```

- [ ] 6.2 Create `tests/integration/story-2.9-preference-learning.spec.ts`:
```typescript
import { test, expect, describe, vi, beforeEach } from 'vitest';
import { PreferenceLearnerAgent } from '@/agents/preference-learner';
import { PreferenceStore } from '@/services/preferences';
import { PREFERENCE_LEARNER_MOCKS, MOCK_STORED_PREFERENCES } from '../mocks/agents/preference-learner';

// Mock PreferenceStore
const createMockPreferenceStore = (): PreferenceStore => ({
  get: vi.fn(),
  getByKey: vi.fn(),
  set: vi.fn(),
  query: vi.fn().mockResolvedValue(MOCK_STORED_PREFERENCES),
});

describe('Story 2.9: Preference Learning Integration', () => {
  let learner: PreferenceLearnerAgent;
  let mockStore: PreferenceStore;

  beforeEach(async () => {
    mockStore = createMockPreferenceStore();
    learner = new PreferenceLearnerAgent({ preferenceStore: mockStore });
    await learner.initialize();
  });

  test('2.9.int.1 - observeAction creates new preference for first observation', async () => {
    vi.mocked(mockStore.getByKey).mockResolvedValue(null); // No existing pref

    vi.spyOn(learner['client'].messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(PREFERENCE_LEARNER_MOCKS.learned_morning_meetings) }],
    });

    const result = await learner.observeAction({
      action: 'scheduled_meeting',
      context: { meetingTime: '09:00' },
    }, { sessionId: 'test-session' });

    expect(result.action).toBe('learned_new');
    expect(mockStore.set).toHaveBeenCalled();
  });

  test('2.9.int.2 - repeated observation updates existing preference', async () => {
    // Return existing preference
    vi.mocked(mockStore.getByKey).mockResolvedValue(MOCK_STORED_PREFERENCES[0]);

    vi.spyOn(learner['client'].messages, 'create').mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(PREFERENCE_LEARNER_MOCKS.updated_morning_meetings_high_confidence) }],
    });

    const result = await learner.observeAction({
      action: 'scheduled_meeting',
      context: { meetingTime: '10:00' },
    }, { sessionId: 'test-session' });

    expect(result.action).toBe('updated_existing');
    expect(result.preference!.observationCount).toBeGreaterThan(1);
  });

  test('2.9.int.3 - explicit preference recorded with 1.0 confidence', async () => {
    const result = await learner.recordExplicitPreference(
      'communication_preference',
      'formal_tone_clients',
      'Use formal tone with external clients',
      { tone: 'formal', context: 'external_clients' }
    );

    expect(result.confidence).toBe(1.0);
    expect(result.source).toBe('explicit');
    expect(mockStore.set).toHaveBeenCalledWith(expect.objectContaining({
      confidence: 1.0,
      source: 'explicit',
    }));
  });

  test('2.9.int.4 - getRelevantPreferences filters by confidence', async () => {
    const highConfPrefs = MOCK_STORED_PREFERENCES.filter(p => p.confidence >= 0.7);
    vi.mocked(mockStore.query).mockResolvedValue(highConfPrefs);

    const result = await learner.getRelevantPreferences(undefined, 0.7);

    expect(mockStore.query).toHaveBeenCalledWith(expect.objectContaining({
      minConfidence: 0.7,
    }));
    expect(result.every(p => p.confidence >= 0.7)).toBe(true);
  });

  test('2.9.int.5 - preferences inject into Butler context', async () => {
    // This tests that Butler can access preferences
    const { ButlerAgent } = await import('@/agents/butler');
    const butler = new ButlerAgent({ preferenceStore: mockStore });

    const contextSpy = vi.spyOn(butler, 'buildContext');
    await butler.handleMessage('Schedule a meeting', { sessionId: 'test' });

    const context = contextSpy.mock.results[0]?.value;
    expect(context?.userPreferences).toBeDefined();
  });

});
```

---

## Dev Notes

### Pattern from Story 2.5, 2.6, 2.7, and 2.8 (Triage/Scheduler/Communicator/Navigator Agents)

Stories 2.5-2.8 established the canonical pattern for agent definition stories. Follow these patterns:

| Component | Pattern | Reference |
|-----------|---------|-----------|
| Zod Schema Structure | `z.object({...}).min().max()` with enums | `agents/schemas/navigator.ts` |
| Agent Class Pattern | `initialize()` + main method + private helpers | `agents/preference-learner/index.ts` |
| Test File Naming | `story-2.X-<agent>.spec.ts` | `tests/unit/story-2.8-navigator.spec.ts` |
| Mock Structure | `AGENT_MOCKS` object with scenario keys | `tests/mocks/agents/navigator.ts` |

### Architecture Patterns (MUST FOLLOW)

**Preference Learner Agent in Orion Hierarchy (ARCH-016):**
```
Butler Agent (Main Orchestrator)
    |
    +-- Triage Agent (Story 2.5)
    +-- Scheduler Agent (Story 2.6)
    +-- Communicator Agent (Story 2.7)
    +-- Navigator Agent (Story 2.8)
    +-- Preference Learner Agent (THIS STORY) <-- Pattern detection & learning
```

**Agent Model:** Sonnet (from Story 2.2 constants - `AGENT_MODELS.preference_learner === 'sonnet'`)

**IMPORTANT:** Verify that `AGENT_MODELS` in `agent-server/src/agents/constants.ts` includes `preference_learner: 'sonnet'`. If missing, add it as part of Task 3.2 when exporting the agent. Story 2.2 defines the AGENT_MODELS constant but may not include preference_learner by default since it was added in Epic 2 planning.

### Database Schema Alignment (architecture.md section 4.1)

The preferences table already exists in the SQLite schema:

```sql
CREATE TABLE preferences (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,                  -- communication | calendar | notifications
    key TEXT NOT NULL,                       -- email_signature | meeting_length
    value TEXT NOT NULL,                     -- JSON value

    -- Learning
    source TEXT DEFAULT 'user',              -- user | learned | default
    confidence REAL DEFAULT 1.0,             -- 0-1 for learned
    observation_count INTEGER DEFAULT 1,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(category, key)
);
```

**Field Name Mapping (Schema to Database):**

The LearnedPreferenceSchema uses JavaScript-friendly camelCase names while the database uses snake_case. The PreferenceStore.rowToPreference() method handles this translation:

| Schema Field | Database Column | Notes |
|--------------|-----------------|-------|
| `firstObserved` | `created_at` | When preference was first detected |
| `lastUpdated` | `updated_at` | When preference was last modified |
| `observationCount` | `observation_count` | Number of supporting observations |
| `preference`, `value`, `evidence` | `value` (JSON) | Stored as JSON blob in single column |

**Interaction Log for Learning (architecture.md):**
```sql
CREATE TABLE interaction_log (
    id TEXT PRIMARY KEY,
    interaction_type TEXT NOT NULL,          -- email_draft | meeting_time | task_priority
    suggestion TEXT NOT NULL,                -- JSON
    accepted INTEGER,                        -- 1 = yes, 0 = no, NULL = no response
    user_modification TEXT,                  -- What user changed
    context TEXT,                            -- JSON
    created_at TEXT DEFAULT (datetime('now'))
);
```

### Preference Learning Strategy

**Sources of Learning Signals:**

| Signal Type | Source | Learning Weight |
|-------------|--------|-----------------|
| Explicit Statement | User says "I prefer X" | 1.0 confidence immediately |
| Draft Edit | User modifies AI draft | High - strong signal |
| Time Selection | User picks meeting time | Medium - may be one-time |
| Acceptance | User accepts suggestion | Medium - positive signal |
| Rejection | User rejects suggestion | High - what NOT to do |

**Confidence Progression:**
- 1 observation: 0.30
- 2 observations: 0.50
- 3 observations: 0.65
- 4 observations: 0.75
- 5 observations: 0.80
- 6+ observations: 0.80 + diminishing increments up to 0.95 max

**Confidence Decay:**
- Contradicting behavior: -0.20 per contradiction
- No observations for 30 days: -0.05
- Minimum confidence before removal: 0.10

### Integration Points

**Butler Agent Context Loading (architecture.md section 6.2):**
```typescript
// From initializeAgentContext()
// 4. Load user preferences
const preferences = await db.preferences.list();
```

**Agent Tool for Preference Learning:**
```typescript
// From architecture.md section 6.3
{
  name: 'preference_learn',
  description: 'Store a learned user preference or pattern',
  parameters: {
    type: 'object',
    properties: {
      category: { type: 'string' },
      key: { type: 'string' },
      value: { type: 'string' },
      context: { type: 'string', description: 'When this preference applies' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    },
    required: ['category', 'key', 'value'],
  },
}
```

### PRD Feature Requirements

From PRD section 5.1.11 (Memory/Recall System):
- M-001: Orion remembers preferences across sessions
- M-002: Orion recalls past decisions for consistency
- R-004: Store learned preferences with source (user/learned)
- R-005: Track observed preferences with provenance

From PRD section 5.2.1 (Butler Agent):
> "Preference learning: Observes corrections and stores patterns"

### Extended Thinking Note

From PRD 6.5, Preference Learner uses **Sonnet without extended thinking** for most operations. Pattern detection is relatively straightforward once data is gathered.

Exception: Complex pattern analysis across many data points may benefit from extended thinking (budget_tokens: 2,000-4,000).

### Testing Standards

From test-design-epic-2.md Story 2.9 section:

| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.9.1 | Unit | Prompt includes pattern detection | Instructions present |
| 2.9.2 | Integration | Repeated behavior increases confidence | Confidence grows |
| 2.9.3 | Unit | Schema includes source and confidence | Fields present |
| 2.9.4 | Integration | Preferences inject into Butler | Context enriched |
| 2.9.5 | E2E | Agent reflects learned preference | Behavior changes |

### Project Structure Notes

```
.claude/
  agents/
    preference-learner.md   # Agent prompt template (CREATE - no frontmatter, hyphen naming to match butler.md, triage.md)

agent-server/
  src/
    agents/
      schemas/
        preference-learner.ts  # LearnedPreferenceSchema, etc.
        index.ts               # Re-export
      preference-learner/
        index.ts               # PreferenceLearnerAgent class
      index.ts                 # Re-export all agents
    services/
      preferences.ts           # PreferenceStore service
      index.ts                 # Re-export

tests/
  mocks/
    agents/
      preference-learner.ts    # PREFERENCE_LEARNER_MOCKS
      index.ts                 # Re-export
    services/
      preferences.ts           # MockPreferenceStore
  unit/
    story-2.9-preference-learner.spec.ts
  integration/
    story-2.9-preference-learning.spec.ts
```

### Critical Design Constraints

1. **Confidence MUST be 0.0-1.0** - Validated by Zod schema
2. **Evidence capped at 10 items** - Prevent unbounded growth
3. **Explicit preferences always 1.0** - User knows best
4. **Default injection threshold is 0.7** - Only high-confidence prefs
5. **Source tracking required** - Transparency for users
6. **Model is Sonnet** - Good balance for pattern detection
7. **Depends on Story 2.2** - Template loading infrastructure
8. **Uses SQLite preferences table** - Schema from architecture.md

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.2 (Agent Prompt Templates)** - Template loading infrastructure, `loadAgentTemplate()` from `agent-server/src/agents/templates`
- **Story 2.1 (Butler Agent Core)** - Butler loads and injects preferences into context
- **Epic 1 (Foundation)** - SQLite database with preferences table

### Downstream Dependencies (blocked by this story)

- **Epic 10 (Memory & Recall)** - Memory system uses preference learner for FR-M001, FR-R004, FR-R005
- **Story 10.3 (Observed Preference Tracking)** - Direct consumer of preference learner
- **Story 10.1 (Preference Storage)** - Uses preference schemas and store

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.9] - Story definition
- [Source: thoughts/planning-artifacts/architecture.md#6.1] - Agent hierarchy (ARCH-016)
- [Source: thoughts/planning-artifacts/architecture.md#4.1] - Preferences table schema
- [Source: thoughts/planning-artifacts/prd.md#5.1.11] - Memory/Recall System (M-001, M-002)
- [Source: thoughts/planning-artifacts/prd.md#5.2.1] - Butler Agent preference learning
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.9] - Test scenarios
- [Source: thoughts/implementation-artifacts/stories/story-2-8-navigator-agent-definition.md] - Pattern reference

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
