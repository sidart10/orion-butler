# Story 2.10: Prompt Caching Setup

**Status:** ready-for-dev
**Epic:** 2 - Agent & Automation Infrastructure
**Story Key:** 2-10-prompt-caching-setup
**Priority:** P2
**Risk:** LOW

---

## Story

As a system,
I want to cache common prompt prefixes,
So that API costs are reduced by 50-80% (ARCH-020).

---

## Acceptance Criteria

### AC1: Cache Control Markers Applied Correctly

**Given** an agent sends a request to Claude
**When** the system prompt is cacheable
**Then** cache_control markers are applied correctly
**And** subsequent requests reuse cached tokens

- [ ] `buildCachedPrompt(systemPrompt)` function returns object with `cache_control: { type: 'ephemeral' }`
- [ ] System prompts >= 1024 tokens (Sonnet) are marked cacheable
- [ ] PARA context is marked with custom TTL: `cache_control: { type: 'ephemeral', ttl: 3600 }` (1 hour)
- [ ] Dynamic content (user messages, timestamps) is NOT marked for caching
- [ ] Function exported from `agent-server/src/agents/caching.ts`

### AC2: Cache Hit Tracking in Logs

**Given** caching is active
**When** monitoring API usage
**Then** cache hit rate is visible in logs
**And** cost savings are trackable

- [ ] `CachingMetrics` class tracks hits, misses, and hit rate
- [ ] `metrics.getHits()` returns number of cache hits
- [ ] `metrics.getMisses()` returns number of cache misses
- [ ] `metrics.getCacheHitRate()` returns ratio (0.0-1.0)
- [ ] `metrics.getReport()` returns object with: `totalRequests`, `cacheHits`, `cacheMisses`, `hitRate`, `estimatedSavings`
- [ ] Metrics service exported from `agent-server/src/services/metrics.ts`

### AC3: Cache Markers in Correct Positions

**Given** a prompt template with static and dynamic parts
**When** building the cached prompt
**Then** only static parts are marked for caching
**And** markers are at valid positions (after 1024+ tokens for Sonnet)

- [ ] `getCacheControlMarkers(template)` analyzes template for cacheable sections
- [ ] Returns `{ cachedSections: string[], uncachedSections: string[] }`
- [ ] Static system prompt text is in `cachedSections`
- [ ] Dynamic content (user name, date, session-specific data) is in `uncachedSections`
- [ ] Minimum token threshold enforced: 1024 (Sonnet), 4096 (Opus/Haiku)

### AC4: Agent Integration with Caching

**Given** Butler, Triage, or other agents make API calls
**When** the call includes system prompts
**Then** caching utilities are applied consistently

- [ ] `ButlerAgent` uses `buildCachedPrompt()` for system prompt
- [ ] Caching applied to all core agents (Butler, Triage, Scheduler, Communicator, Navigator, Preference Learner)
- [ ] Optional metrics injection via constructor: `new ButlerAgent({ metrics })`
- [ ] Cache control markers are in the correct format for Anthropic API

### AC5: Cost Savings Estimation

**Given** multiple agent calls occur in a session
**When** the metrics report is generated
**Then** estimated cost savings are calculated

- [ ] `estimatedSavings` calculated based on: cache hits * (normal token cost - cached token cost)
- [ ] Cache read discount: 90% (from Anthropic pricing)
- [ ] Cache write premium: 25% on first use
- [ ] Savings estimate uses actual token counts when available

---

## Tasks / Subtasks

### Task 1: Create Prompt Caching Utility (AC: #1, #3)

- [ ] 1.1 Create `agent-server/src/agents/caching.ts`:
```typescript
import type { MessageParam, ContentBlockParam } from '@anthropic-ai/sdk';

// Cache control type from Anthropic API
export interface CacheControl {
  type: 'ephemeral';
  ttl?: number;  // Optional TTL in seconds (default: 5 min)
}

// Content block with optional cache control
export interface CacheableContentBlock {
  type: 'text';
  text: string;
  cache_control?: CacheControl;
}

// Minimum cacheable tokens by model
export const MIN_CACHEABLE_TOKENS: Record<string, number> = {
  'claude-sonnet-4-5': 1024,
  'claude-opus-4-5': 4096,
  'claude-haiku-4-5': 4096,
};

/**
 * Build a cacheable system prompt structure
 *
 * @param systemPrompt - The static system prompt text
 * @param options.ttl - Optional TTL in seconds (default: 300 = 5 min)
 * @returns Content block with cache_control marker
 */
export function buildCachedPrompt(
  systemPrompt: string,
  options: { ttl?: number } = {}
): CacheableContentBlock {
  return {
    type: 'text',
    text: systemPrompt,
    cache_control: {
      type: 'ephemeral',
      ...(options.ttl && { ttl: options.ttl }),
    },
  };
}

/**
 * Build system prompt array with caching for multi-part prompts
 *
 * @param parts - Array of prompt parts with caching options
 * @returns Array of content blocks for Anthropic API
 */
export function buildCachedSystemPrompt(
  parts: Array<{
    text: string;
    cache?: boolean;
    ttl?: number;
  }>
): CacheableContentBlock[] {
  return parts.map(part => ({
    type: 'text' as const,
    text: part.text,
    ...(part.cache && {
      cache_control: {
        type: 'ephemeral' as const,
        ...(part.ttl && { ttl: part.ttl }),
      },
    }),
  }));
}

/**
 * Template analysis for cache marker placement
 */
export interface PromptTemplate {
  staticPart: string;
  dynamicPart: string;
}

export interface CacheMarkerAnalysis {
  cachedSections: string[];
  uncachedSections: string[];
}

/**
 * Analyze a template to determine which sections should be cached
 *
 * @param template - Template with static and dynamic parts
 * @returns Analysis of cacheable vs uncacheable sections
 */
export function getCacheControlMarkers(template: PromptTemplate): CacheMarkerAnalysis {
  const cachedSections: string[] = [];
  const uncachedSections: string[] = [];

  // Static parts are cacheable
  if (template.staticPart) {
    cachedSections.push('staticPart');
  }

  // Dynamic parts (with {{variables}}) are not cacheable
  if (template.dynamicPart) {
    uncachedSections.push('dynamicPart');
  }

  return { cachedSections, uncachedSections };
}

/**
 * Estimate token count for caching threshold checks
 * Simple heuristic: ~4 chars per token for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if text meets minimum cacheable threshold
 */
export function isCacheable(text: string, model: string = 'claude-sonnet-4-5'): boolean {
  const minTokens = MIN_CACHEABLE_TOKENS[model] ?? 1024;
  return estimateTokens(text) >= minTokens;
}
```

- [ ] 1.2 Export from `agent-server/src/agents/index.ts`

### Task 2: Create Caching Metrics Service (AC: #2, #5)

- [ ] 2.1 Create `agent-server/src/services/metrics.ts`:
```typescript
/**
 * CachingMetrics - Track prompt caching performance
 *
 * Tracks cache hits/misses and estimates cost savings.
 * Cost model (Anthropic pricing):
 * - Cache writes: 25% premium
 * - Cache reads: 90% discount
 * - Net savings: 50-80% for typical conversations
 */
export class CachingMetrics {
  private hits: number = 0;
  private misses: number = 0;
  private cachedTokensRead: number = 0;
  private tokensWrittenToCache: number = 0;

  // Anthropic pricing per million tokens (approximate)
  private static readonly SONNET_INPUT_COST = 3.00;  // $3/1M tokens
  private static readonly CACHE_READ_DISCOUNT = 0.90;  // 90% off
  private static readonly CACHE_WRITE_PREMIUM = 0.25;  // 25% extra

  /**
   * Record a cache hit
   */
  recordHit(cachedTokens: number = 0): void {
    this.hits++;
    this.cachedTokensRead += cachedTokens;
  }

  /**
   * Record a cache miss (first request or cache expired)
   */
  recordMiss(tokensWritten: number = 0): void {
    this.misses++;
    this.tokensWrittenToCache += tokensWritten;
  }

  /**
   * Get total cache hits
   */
  getHits(): number {
    return this.hits;
  }

  /**
   * Get total cache misses
   */
  getMisses(): number {
    return this.misses;
  }

  /**
   * Get cache hit rate (0.0-1.0)
   */
  getCacheHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return this.hits / total;
  }

  /**
   * Get comprehensive metrics report
   */
  getReport(): CachingReport {
    const totalRequests = this.hits + this.misses;
    const hitRate = this.getCacheHitRate();

    // Estimate savings: cached reads cost 10% of normal
    // Normal cost = tokens * rate
    // Cached cost = tokens * rate * 0.10
    // Savings = tokens * rate * 0.90
    const savedTokens = this.cachedTokensRead;
    const estimatedSavings = (savedTokens / 1_000_000) *
      CachingMetrics.SONNET_INPUT_COST *
      CachingMetrics.CACHE_READ_DISCOUNT;

    return {
      totalRequests,
      cacheHits: this.hits,
      cacheMisses: this.misses,
      hitRate,
      cachedTokensRead: this.cachedTokensRead,
      tokensWrittenToCache: this.tokensWrittenToCache,
      estimatedSavings: Math.round(estimatedSavings * 100) / 100,  // Round to cents
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.cachedTokensRead = 0;
    this.tokensWrittenToCache = 0;
  }
}

export interface CachingReport {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  cachedTokensRead: number;
  tokensWrittenToCache: number;
  estimatedSavings: number;  // In dollars
}

// Singleton for global metrics
let globalMetrics: CachingMetrics | null = null;

export function getCachingMetrics(): CachingMetrics {
  if (!globalMetrics) {
    globalMetrics = new CachingMetrics();
  }
  return globalMetrics;
}

export function resetCachingMetrics(): void {
  globalMetrics = new CachingMetrics();
}
```

- [ ] 2.2 Export from `agent-server/src/services/index.ts`

### Task 3: Integrate Caching into Butler Agent (AC: #4)

- [ ] 3.1 Update `agent-server/src/agents/butler/index.ts` to use caching:
```typescript
// Add to imports
import { buildCachedSystemPrompt, isCacheable } from '../caching';
import { CachingMetrics, getCachingMetrics } from '../../services/metrics';

// In ButlerAgent class:
export class ButlerAgent {
  private metrics: CachingMetrics;

  constructor(options: { metrics?: CachingMetrics } = {}) {
    this.metrics = options.metrics ?? getCachingMetrics();
    // ... existing constructor code
  }

  async handleMessage(userMessage: string, context: AgentContext) {
    const systemPromptParts = buildCachedSystemPrompt([
      {
        text: this.template,  // Static system prompt (~2000 tokens)
        cache: isCacheable(this.template),
        // Default TTL: 5 min
      },
      {
        text: this.formatPARAContext(context),  // User's PARA data
        cache: true,
        ttl: 3600,  // Cache for 1 hour (PARA changes infrequently)
      },
    ]);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPromptParts,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Track caching metrics from response usage
    if (response.usage?.cache_read_input_tokens) {
      this.metrics.recordHit(response.usage.cache_read_input_tokens);
    } else if (response.usage?.cache_creation_input_tokens) {
      this.metrics.recordMiss(response.usage.cache_creation_input_tokens);
    }

    return response;
  }
}
```

- [ ] 3.2 Apply same pattern to other core agents:
  - TriageAgent
  - SchedulerAgent
  - CommunicatorAgent
  - NavigatorAgent
  - PreferenceLearnerAgent

### Task 4: Create Test Mocks (AC: #1, #2, #3)

- [ ] 4.1 Create `tests/mocks/services/metrics.ts`:
```typescript
import type { CachingMetrics, CachingReport } from '@/services/metrics';

export const createMockCachingMetrics = (): CachingMetrics => ({
  recordHit: vi.fn(),
  recordMiss: vi.fn(),
  getHits: vi.fn().mockReturnValue(5),
  getMisses: vi.fn().mockReturnValue(2),
  getCacheHitRate: vi.fn().mockReturnValue(0.714),
  getReport: vi.fn().mockReturnValue({
    totalRequests: 7,
    cacheHits: 5,
    cacheMisses: 2,
    hitRate: 0.714,
    cachedTokensRead: 10000,
    tokensWrittenToCache: 4000,
    estimatedSavings: 0.03,
  } satisfies CachingReport),
  reset: vi.fn(),
});
```

- [ ] 4.2 Export from `tests/mocks/services/index.ts`

### Task 5: Write Unit Tests (AC: #1, #3)

- [ ] 5.1 Create `tests/unit/story-2.10-caching.spec.ts`:
```typescript
import { test, expect, describe } from 'vitest';
import {
  buildCachedPrompt,
  buildCachedSystemPrompt,
  getCacheControlMarkers,
  estimateTokens,
  isCacheable,
  MIN_CACHEABLE_TOKENS,
} from '@/agents/caching';

describe('Story 2.10: Prompt Caching Setup', () => {

  test('2.10.1 - cache control markers are set correctly', () => {
    const systemPrompt = 'You are Butler, an AI assistant...';
    const cachedPrompt = buildCachedPrompt(systemPrompt);

    expect(cachedPrompt).toHaveProperty('cache_control');
    expect(cachedPrompt.cache_control!.type).toBe('ephemeral');
    expect(cachedPrompt.type).toBe('text');
    expect(cachedPrompt.text).toBe(systemPrompt);
  });

  test('2.10.1b - custom TTL is applied when specified', () => {
    const cachedPrompt = buildCachedPrompt('Long prompt...', { ttl: 3600 });

    expect(cachedPrompt.cache_control!.ttl).toBe(3600);
  });

  test('2.10.3 - cache markers are in correct positions', () => {
    const template = {
      staticPart: 'You are Butler, an AI assistant for Orion...',
      dynamicPart: 'Current user: {{user_name}}, Date: {{date}}',
    };

    const markers = getCacheControlMarkers(template);

    // Static part should be marked for caching
    expect(markers.cachedSections).toContain('staticPart');

    // Dynamic part should NOT be cached
    expect(markers.uncachedSections).toContain('dynamicPart');
    expect(markers.cachedSections).not.toContain('dynamicPart');
  });

  test('2.10.3b - multi-part system prompt builds correctly', () => {
    const parts = buildCachedSystemPrompt([
      { text: 'System prompt', cache: true },
      { text: 'PARA context', cache: true, ttl: 3600 },
      { text: 'Session data', cache: false },
    ]);

    expect(parts).toHaveLength(3);
    expect(parts[0].cache_control).toBeDefined();
    expect(parts[1].cache_control?.ttl).toBe(3600);
    expect(parts[2].cache_control).toBeUndefined();
  });

  test('2.10.3c - token estimation works correctly', () => {
    const shortText = 'Hello';  // 5 chars ~ 2 tokens
    const longText = 'a'.repeat(4096);  // ~1024 tokens

    expect(estimateTokens(shortText)).toBeLessThan(10);
    expect(estimateTokens(longText)).toBeGreaterThanOrEqual(1024);
  });

  test('2.10.3d - isCacheable respects model thresholds', () => {
    const shortPrompt = 'Short prompt';
    const longPrompt = 'a'.repeat(4200);  // ~1050 tokens

    expect(isCacheable(shortPrompt, 'claude-sonnet-4-5')).toBe(false);
    expect(isCacheable(longPrompt, 'claude-sonnet-4-5')).toBe(true);
    expect(isCacheable(longPrompt, 'claude-opus-4-5')).toBe(false);  // Opus needs 4096
  });

  test('2.10.3e - MIN_CACHEABLE_TOKENS has correct values', () => {
    expect(MIN_CACHEABLE_TOKENS['claude-sonnet-4-5']).toBe(1024);
    expect(MIN_CACHEABLE_TOKENS['claude-opus-4-5']).toBe(4096);
    expect(MIN_CACHEABLE_TOKENS['claude-haiku-4-5']).toBe(4096);
  });

});
```

### Task 6: Write Integration Tests (AC: #2, #4)

- [ ] 6.1 Create `tests/integration/story-2.10-cache-hits.spec.ts`:
```typescript
import { test, expect, describe, vi, beforeEach } from 'vitest';
import { CachingMetrics } from '@/services/metrics';
import { ButlerAgent } from '@/agents/butler';

describe('Story 2.10: Cache Hits Integration', () => {
  let metrics: CachingMetrics;

  beforeEach(() => {
    metrics = new CachingMetrics();
  });

  test('2.10.2 - cache hits occur on repeated agent calls', async () => {
    const butler = new ButlerAgent({ metrics });

    // Mock Claude SDK response with cache info
    vi.spyOn(butler['client'].messages, 'create')
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Hello!' }],
        usage: { cache_creation_input_tokens: 2000 },  // Miss - first call
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'I am fine!' }],
        usage: { cache_read_input_tokens: 2000 },  // Hit
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'I can help!' }],
        usage: { cache_read_input_tokens: 2000 },  // Hit
      });

    await butler.handleMessage('Hello', { sessionId: 'test' });
    await butler.handleMessage('How are you?', { sessionId: 'test' });
    await butler.handleMessage('What can you do?', { sessionId: 'test' });

    expect(metrics.getCacheHitRate()).toBeGreaterThan(0.5);
    expect(metrics.getHits()).toBe(2);
    expect(metrics.getMisses()).toBe(1);
  });

  test('2.10.4 - logs show cache hit/miss ratio', async () => {
    metrics.recordMiss(2000);  // First call
    metrics.recordHit(2000);   // Second call
    metrics.recordHit(2000);   // Third call

    const report = metrics.getReport();

    expect(report).toHaveProperty('totalRequests', 3);
    expect(report).toHaveProperty('cacheHits', 2);
    expect(report).toHaveProperty('cacheMisses', 1);
    expect(report).toHaveProperty('hitRate');
    expect(report.hitRate).toBeCloseTo(0.667, 2);
    expect(report).toHaveProperty('estimatedSavings');
    expect(report.estimatedSavings).toBeGreaterThanOrEqual(0);
  });

  test('2.10.5 - cost savings estimation is calculated', () => {
    // Simulate 10 cache hits of 2000 tokens each
    for (let i = 0; i < 10; i++) {
      metrics.recordHit(2000);
    }

    const report = metrics.getReport();

    // 20,000 tokens * $3/1M * 90% discount = ~$0.054
    expect(report.estimatedSavings).toBeGreaterThan(0);
    expect(report.cachedTokensRead).toBe(20000);
  });

});
```

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Prompt Caching Strategy (ARCH-020):**

| Content | TTL | Rationale |
|---------|-----|-----------|
| System prompt | 5 min (default) | Rarely changes, frequently used |
| PARA context | 1 hour | Changes infrequently during session |
| User preferences | 1 hour | Stable within session |
| Recent messages | No cache | Changes every turn |

**Minimum Token Requirements:**

| Model | Min Cacheable Tokens |
|-------|---------------------|
| Claude Sonnet 4.5 | 1,024 |
| Claude Opus 4.5 | 4,096 |
| Claude Haiku 4.5 | 4,096 |

**Cost Impact:**
- Cache writes: 25% premium on first use
- Cache reads: 90% discount on subsequent uses
- Net savings: 50-80% for typical butler conversations

**API Response Usage Fields:**
```typescript
// From Anthropic API response.usage:
interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;  // Tokens written to cache (miss)
  cache_read_input_tokens?: number;      // Tokens read from cache (hit)
}
```

### Anthropic SDK Cache Control Format

**Single block:**
```typescript
system: [
  {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },
  }
]
```

**Multiple blocks (PARA context with longer TTL):**
```typescript
system: [
  {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },  // 5 min default
  },
  {
    type: 'text',
    text: formatPARAContext(context),
    cache_control: { type: 'ephemeral', ttl: 3600 },  // 1 hour
  }
]
```

### Previous Story Intelligence

From Story 2.9 (Preference Learner Agent):
- Agents follow constructor pattern with optional dependency injection
- `CachingMetrics` should be injectable similar to `IPreferenceStore`
- Export utilities from both `agents/` and `services/` directories
- Follow `index.ts` re-export pattern

### Integration Points

**All Core Agents Must Use Caching:**
1. Butler Agent (Story 2.1)
2. Triage Agent (Story 2.5)
3. Scheduler Agent (Story 2.6)
4. Communicator Agent (Story 2.7)
5. Navigator Agent (Story 2.8)
6. Preference Learner Agent (Story 2.9)

**Observability Integration (Future - Epic 14):**
- Caching metrics should integrate with Braintrust tracing
- Cache hit/miss should be visible in Langfuse prompt management

### Project Structure Notes

```
agent-server/
  src/
    agents/
      caching.ts           # buildCachedPrompt, getCacheControlMarkers (CREATE)
      index.ts             # Re-export caching utilities
      butler/
        index.ts           # UPDATE - integrate caching
      triage/
        index.ts           # UPDATE - integrate caching
      scheduler/
        index.ts           # UPDATE - integrate caching
      communicator/
        index.ts           # UPDATE - integrate caching
      navigator/
        index.ts           # UPDATE - integrate caching
      preference-learner/
        index.ts           # UPDATE - integrate caching
    services/
      metrics.ts           # CachingMetrics class (CREATE)
      index.ts             # Re-export

tests/
  mocks/
    services/
      metrics.ts           # Mock CachingMetrics
      index.ts             # Re-export
  unit/
    story-2.10-caching.spec.ts
  integration/
    story-2.10-cache-hits.spec.ts
```

### Testing Standards

From test-design-epic-2.md Story 2.10 section:

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 2.10.1 | Unit | Cache control markers set | Headers present | Vitest |
| 2.10.2 | Integration | Cache hits on repeat calls | Hit logged | Vitest |
| 2.10.3 | Unit | Markers in correct positions | Prefix cached | Vitest |
| 2.10.4 | Integration | Logs show hit/miss ratio | Metrics available | Vitest |
| 2.10.5 | E2E | Measurable cost reduction | API billing reduced | Manual |

**E2E Test (2.10.5) - Manual Verification:**
This requires actual API calls and billing verification. Validate by:
1. Run multiple agent conversations
2. Check Anthropic usage dashboard for cache_read_input_tokens
3. Compare billing with/without caching enabled

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.1 (Butler Agent Core)** - Butler agent class to integrate caching
- **Story 2.2 (Agent Prompt Templates)** - Template loading infrastructure
- **Story 2.5-2.9** - Other agent definitions to integrate caching

### Downstream Dependencies (blocked by this story)

- **Epic 14 (Observability)** - Caching metrics feed into observability system
- **Story 14.1 (Braintrust Tracing)** - Cache performance tracking

---

## References

- [Source: thoughts/planning-artifacts/epics.md#story-2.10] - Story definition
- [Source: thoughts/planning-artifacts/architecture.md#6.7] - Prompt Caching section
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.10] - Test scenarios
- [Source: thoughts/implementation-artifacts/stories/story-2-9-preference-learner-agent-definition.md] - Previous story patterns
- [Anthropic Docs: Prompt Caching] - https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

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
