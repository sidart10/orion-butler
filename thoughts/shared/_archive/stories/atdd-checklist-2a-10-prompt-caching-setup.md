# ATDD Checklist: Story 2a.10 - Prompt Caching Setup

**Story:** 2a-10-prompt-caching-setup
**Epic:** 2a - Core Agent Infrastructure
**Status:** Ready for Development
**Risk Level:** LOW
**Created:** 2026-01-15
**Author:** TEA (Test Architect Agent)

---

## Summary

This ATDD checklist covers the implementation of prompt caching to reduce Claude API costs by 50-80%. The story introduces cache control markers, metrics tracking, and integration across all core agents.

---

## AC1: Cache Control Markers Applied Correctly

**Given** an agent sends a request to Claude
**When** the system prompt is cacheable
**Then** cache_control markers are applied correctly
**And** subsequent requests reuse cached tokens

### Happy Path Tests

- [ ] **Test 2.10.1.1**: `buildCachedPrompt()` returns object with `cache_control: { type: 'ephemeral' }`
  - **Given**: A valid system prompt string
  - **When**: `buildCachedPrompt(systemPrompt)` is called
  - **Then**: Returns `{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.1.2**: Custom TTL is applied when specified (supports PARA context TTL requirement)
  - **Given**: A system prompt and TTL of 3600 seconds
  - **When**: `buildCachedPrompt(systemPrompt, { ttl: 3600 })` is called
  - **Then**: Returns object with `cache_control.ttl === 3600`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`
  - **Note**: This test validates the TTL option mechanism used by PARA context (Test 2.10.1.4)

- [ ] **Test 2.10.1.3**: System prompts >= 1024 tokens (Sonnet) are marked cacheable
  - **Given**: A prompt with 4200+ characters (~1050 tokens)
  - **When**: `isCacheable(prompt, 'claude-sonnet-4-5')` is called
  - **Then**: Returns `true`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.1.4**: PARA context uses custom TTL of 3600 seconds (1 hour)
  - **Given**: A multi-part system prompt with PARA context
  - **When**: `buildCachedSystemPrompt()` is called with PARA part having `ttl: 3600`
  - **Then**: PARA context block has `cache_control.ttl === 3600`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`
  - **Note**: `buildCachedSystemPrompt()` is the multi-part variant of `buildCachedPrompt()` per Task 1.1 in story spec

- [ ] **Test 2.10.1.5**: Function is exported from `agent-server/src/agents/caching.ts`
  - **Given**: The caching module exists
  - **When**: Importing `buildCachedPrompt` from `@/agents/caching`
  - **Then**: Import succeeds without error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.1.6**: Dynamic content (user messages, timestamps) is NOT marked for caching
  - **Given**: A multi-part prompt with dynamic content: `{ text: 'User: {{user_name}}, Time: {{timestamp}}', cache: false }`
  - **When**: `buildCachedSystemPrompt()` is called with this dynamic part
  - **Then**: Dynamic part has no `cache_control` field attached
  - **And**: Only static parts (with `cache: true`) have `cache_control`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

### Edge Cases

- [ ] **Test 2.10.1.7**: Empty string system prompt is handled gracefully
  - **Given**: An empty string `""`
  - **When**: `buildCachedPrompt("")` is called
  - **Then**: Returns valid structure (may not be cacheable but doesn't throw)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.1.8**: Very long system prompts (50,000+ chars) are handled
  - **Given**: A system prompt of 50,000 characters
  - **When**: `buildCachedPrompt(longPrompt)` is called
  - **Then**: Returns valid structure without truncation
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.1.9**: TTL of 0 is handled (no TTL set)
  - **Given**: TTL option of 0
  - **When**: `buildCachedPrompt(prompt, { ttl: 0 })` is called
  - **Then**: Returns object without `ttl` field (falsy values excluded)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

### Error Handling

- [ ] **Test 2.10.1.10**: Negative TTL values are rejected or normalized
  - **Given**: A negative TTL value (-100)
  - **When**: `buildCachedPrompt(prompt, { ttl: -100 })` is called
  - **Then**: Either throws error OR ignores invalid TTL
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

---

## AC2: Cache Hit Tracking in Logs

**Given** caching is active
**When** monitoring API usage
**Then** cache hit rate is visible in logs
**And** cost savings are trackable

### Happy Path Tests

- [ ] **Test 2.10.2.1**: `CachingMetrics` class tracks hits correctly
  - **Given**: A new `CachingMetrics` instance
  - **When**: `recordHit(2000)` is called 5 times
  - **Then**: `getHits()` returns 5
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.2.2**: `CachingMetrics` class tracks misses correctly
  - **Given**: A new `CachingMetrics` instance
  - **When**: `recordMiss(1500)` is called 3 times
  - **Then**: `getMisses()` returns 3
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.2.3**: `getCacheHitRate()` returns correct ratio (0.0-1.0)
  - **Given**: 2 misses and 8 hits recorded
  - **When**: `getCacheHitRate()` is called
  - **Then**: Returns 0.8 (8/10)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.2.4**: `getReport()` returns complete metrics object
  - **Given**: Various hits and misses recorded
  - **When**: `getReport()` is called
  - **Then**: Returns object with `totalRequests`, `cacheHits`, `cacheMisses`, `hitRate`, `estimatedSavings`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.2.5**: Metrics service exported from `agent-server/src/services/metrics.ts`
  - **Given**: The metrics module exists
  - **When**: Importing `CachingMetrics` from `@/services/metrics`
  - **Then**: Import succeeds without error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

### Edge Cases

- [ ] **Test 2.10.2.6**: `getCacheHitRate()` returns 0 when no requests recorded
  - **Given**: A fresh `CachingMetrics` instance with no activity
  - **When**: `getCacheHitRate()` is called
  - **Then**: Returns 0 (not NaN or error)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.2.7**: `getCacheHitRate()` returns 1.0 when all hits (no misses)
  - **Given**: 10 hits and 0 misses
  - **When**: `getCacheHitRate()` is called
  - **Then**: Returns 1.0
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.2.8**: `getCacheHitRate()` returns 0.0 when all misses (no hits)
  - **Given**: 0 hits and 10 misses
  - **When**: `getCacheHitRate()` is called
  - **Then**: Returns 0.0
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.2.9**: Metrics `reset()` clears all counters
  - **Given**: Metrics with recorded activity
  - **When**: `reset()` is called
  - **Then**: `getHits()`, `getMisses()`, `getCacheHitRate()` all return 0
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

### Boundary Conditions

- [ ] **Test 2.10.2.10**: Large token counts don't overflow (test with 10,000,000 tokens)
  - **Given**: Recording hits with very large token counts (10,000,000 tokens specifically)
  - **When**: `getReport()` is called
  - **Then**: `cachedTokensRead === 10000000` and `estimatedSavings` is calculated correctly without overflow
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

### Logging Verification

- [ ] **Test 2.10.2.11**: Cache hit rate is visible in logs when logging enabled
  - **Given**: Logger configured with `DEBUG` level, and `CachingMetrics` instance with recorded activity
  - **When**: `logCacheMetrics(metrics)` helper is called (or agent completes API call with cache hit)
  - **Then**: Log output contains "cache_hit_rate" and "cache_hits" fields
  - **And**: Log message includes human-readable hit rate percentage
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-cache-logging.spec.ts`

---

## AC3: Cache Markers in Correct Positions

**Given** a prompt template with static and dynamic parts
**When** building the cached prompt
**Then** only static parts are marked for caching
**And** markers are at valid positions (after 1024+ tokens for Sonnet)

### Happy Path Tests

- [ ] **Test 2.10.3.1**: `getCacheControlMarkers()` returns correct structure with both properties
  - **Given**: A template with `staticPart` and `dynamicPart`
  - **When**: `getCacheControlMarkers(template)` is called
  - **Then**: Returns object with exactly two properties: `cachedSections` (string[]) and `uncachedSections` (string[])
  - **And**: `cachedSections` contains `'staticPart'`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.2**: `getCacheControlMarkers()` excludes dynamic content
  - **Given**: A template with dynamic content containing `{{variables}}`
  - **When**: `getCacheControlMarkers(template)` is called
  - **Then**: `uncachedSections` contains `'dynamicPart'`
  - **And**: `cachedSections` does NOT contain `'dynamicPart'`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.3**: Multi-part system prompt builds correctly with mixed caching
  - **Given**: Array of parts with `cache: true` and `cache: false`
  - **When**: `buildCachedSystemPrompt(parts)` is called
  - **Then**: Only parts with `cache: true` have `cache_control` field
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.4**: `MIN_CACHEABLE_TOKENS` constants are correct
  - **Given**: The caching module constants
  - **When**: Accessing `MIN_CACHEABLE_TOKENS`
  - **Then**: `claude-sonnet-4-5` = 1024, `claude-opus-4-5` = 4096, `claude-haiku-4-5` = 4096
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.5**: Token estimation function provides reasonable estimates
  - **Given**: Text of various lengths: "hello" (5 chars), 4096 chars, 16384 chars
  - **When**: `estimateTokens(text)` is called
  - **Then**: Returns reasonable estimates within industry-standard range (0.2-0.3 tokens per character for English)
  - **And**: Estimate for 4096 chars is in range [800, 1500] (reasonable token count)
  - **And**: Estimate for 16384 chars is in range [3200, 6000] (reasonable token count)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`
  - **Note**: Tests behavior (reasonable estimate) not implementation formula - allows formula changes

### Edge Cases

- [ ] **Test 2.10.3.6**: Template with only static part
  - **Given**: Template with empty `dynamicPart`
  - **When**: `getCacheControlMarkers(template)` is called
  - **Then**: `cachedSections = ['staticPart']`, `uncachedSections = []`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.7**: Template with only dynamic part
  - **Given**: Template with empty `staticPart`
  - **When**: `getCacheControlMarkers(template)` is called
  - **Then**: `cachedSections = []`, `uncachedSections = ['dynamicPart']`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.8**: `isCacheable()` returns false for short prompts (Sonnet)
  - **Given**: A short prompt (< 1024 tokens)
  - **When**: `isCacheable(shortPrompt, 'claude-sonnet-4-5')` is called
  - **Then**: Returns `false`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.9**: `isCacheable()` uses correct threshold for Opus (4096 tokens)
  - **Given**: A prompt that's 1050 tokens (above Sonnet threshold, below Opus)
  - **When**: `isCacheable(prompt, 'claude-opus-4-5')` is called
  - **Then**: Returns `false`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

- [ ] **Test 2.10.3.10**: `isCacheable()` defaults to 1024 for unknown models
  - **Given**: An unknown model name
  - **When**: `isCacheable(longPrompt, 'unknown-model')` is called
  - **Then**: Uses 1024 token threshold (Sonnet default)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-caching.spec.ts`

---

## AC4: Agent Integration with Caching

**Given** Butler, Triage, or other agents make API calls
**When** the call includes system prompts
**Then** caching utilities are applied consistently

### Happy Path Tests

- [ ] **Test 2.10.4.1**: ButlerAgent uses `buildCachedPrompt()` for system prompt
  - **Given**: A ButlerAgent instance with mocked Claude SDK
  - **When**: `handleMessage()` is called
  - **Then**: Claude API call includes `system` array with `cache_control` on static parts
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-butler-caching.spec.ts`

- [ ] **Test 2.10.4.2**: Metrics are tracked from API response `cache_read_input_tokens`
  - **Given**: ButlerAgent with injected CachingMetrics
  - **When**: API response contains `usage.cache_read_input_tokens: 2000`
  - **Then**: `metrics.recordHit(2000)` is called
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-butler-caching.spec.ts`

- [ ] **Test 2.10.4.3**: Metrics are tracked from API response `cache_creation_input_tokens`
  - **Given**: ButlerAgent with injected CachingMetrics
  - **When**: API response contains `usage.cache_creation_input_tokens: 2000`
  - **Then**: `metrics.recordMiss(2000)` is called
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-butler-caching.spec.ts`

- [ ] **Test 2.10.4.4**: Optional metrics injection via constructor
  - **Given**: Custom CachingMetrics instance
  - **When**: `new ButlerAgent({ metrics: customMetrics })` is created
  - **Then**: Agent uses the provided metrics instance
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-agent-injection.spec.ts`

- [ ] **Test 2.10.4.5**: Cache control markers in correct Anthropic API format
  - **Given**: ButlerAgent making API call
  - **When**: Inspecting the request payload
  - **Then**: System prompt structure matches `[{ type: 'text', text: '...', cache_control: { type: 'ephemeral' } }]`
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-butler-caching.spec.ts`
  - **Reference**: Anthropic API docs - https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

### Coverage for All Core Agents (6 agents per AC4)

**Note:** All 6 core agents (Butler, Triage, Scheduler, Communicator, Navigator, Preference Learner) are tested in the same file for consistency. Butler is tested in both `story-2.10-butler-caching.spec.ts` (detailed) and `story-2.10-agent-caching.spec.ts` (consistency check).

- [ ] **Test 2.10.4.6**: ButlerAgent integrates caching utilities (consistency check)
  - **Given**: ButlerAgent instance with mocked Claude SDK
  - **When**: Making API call
  - **Then**: Uses `buildCachedPrompt()` for system prompt
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-agent-caching.spec.ts`

- [ ] **Test 2.10.4.7**: TriageAgent integrates caching utilities
  - **Given**: TriageAgent instance
  - **When**: Making API call
  - **Then**: Uses `buildCachedPrompt()` for system prompt
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-agent-caching.spec.ts`

- [ ] **Test 2.10.4.8**: SchedulerAgent integrates caching utilities
  - **Given**: SchedulerAgent instance
  - **When**: Making API call
  - **Then**: Uses `buildCachedPrompt()` for system prompt
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-agent-caching.spec.ts`

- [ ] **Test 2.10.4.9**: CommunicatorAgent integrates caching utilities
  - **Given**: CommunicatorAgent instance
  - **When**: Making API call
  - **Then**: Uses `buildCachedPrompt()` for system prompt
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-agent-caching.spec.ts`

- [ ] **Test 2.10.4.10**: NavigatorAgent integrates caching utilities
  - **Given**: NavigatorAgent instance
  - **When**: Making API call
  - **Then**: Uses `buildCachedPrompt()` for system prompt
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-agent-caching.spec.ts`

- [ ] **Test 2.10.4.11**: PreferenceLearnerAgent integrates caching utilities
  - **Given**: PreferenceLearnerAgent instance
  - **When**: Making API call
  - **Then**: Uses `buildCachedPrompt()` for system prompt
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-agent-caching.spec.ts`

### Edge Cases

- [ ] **Test 2.10.4.12**: Agent works without metrics injection (uses global singleton)
  - **Given**: `new ButlerAgent()` with no metrics option
  - **When**: Making API calls
  - **Then**: Uses `getCachingMetrics()` singleton without error
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-agent-injection.spec.ts`

---

## AC5: Cost Savings Estimation

**Given** multiple agent calls occur in a session
**When** the metrics report is generated
**Then** estimated cost savings are calculated

### Happy Path Tests

- [ ] **Test 2.10.5.1**: `estimatedSavings` calculated based on cache hits
  - **Given**: 10 cache hits of 2000 tokens each (20,000 total)
  - **When**: `getReport()` is called
  - **Then**: `estimatedSavings = (20000 / 1_000_000) * $3.00 * 0.90 = ~$0.054`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.5.2**: Cache read discount of 90% is applied
  - **Given**: Known token counts for cache reads
  - **When**: Calculating savings
  - **Then**: Uses 90% discount factor (CACHE_READ_DISCOUNT = 0.90)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.5.3**: Report includes both `cachedTokensRead` and `tokensWrittenToCache`
  - **Given**: Mix of hits and misses with token counts
  - **When**: `getReport()` is called
  - **Then**: Both fields are populated correctly
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.5.4**: Estimated savings rounded to cents (2 decimal places, including edge case)
  - **Given**: Savings calculation produces $0.05423 AND edge case with $0.005 (banker's rounding test)
  - **When**: `getReport()` is called
  - **Then**: `estimatedSavings` is rounded to 2 decimal places (e.g., 0.05)
  - **And**: Edge case $0.005 rounds consistently (document which rounding method is used)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.5.5**: Cache write premium (25%) is factored into cost awareness (informational)
  - **Given**: 1000 tokens written to cache (first use / cache miss)
  - **When**: Understanding total cost impact
  - **Then**: Report includes `tokensWrittenToCache` field for visibility
  - **And**: Documentation notes that cache writes cost 125% of normal (25% premium per AC5)
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`
  - **Note**: The `estimatedSavings` calculation focuses on read savings; write premium is tracked separately via `tokensWrittenToCache` for transparency

### Boundary Conditions

- [ ] **Test 2.10.5.6**: Zero cache hits results in $0 estimated savings
  - **Given**: Only cache misses (no hits)
  - **When**: `getReport()` is called
  - **Then**: `estimatedSavings === 0`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

- [ ] **Test 2.10.5.7**: Large session with many hits calculates correctly
  - **Given**: 1000 cache hits of 5000 tokens each (5,000,000 tokens)
  - **When**: `getReport()` is called
  - **Then**: `estimatedSavings` is calculated without overflow: `5 * $3.00 * 0.90 = $13.50`
  - **Type**: Unit
  - **File**: `tests/unit/story-2.10-metrics.spec.ts`

### Integration Test

- [ ] **Test 2.10.5.8**: End-to-end cache hit sequence produces valid metrics report
  - **Given**: ButlerAgent with mocked responses simulating 1 miss + 2 hits
  - **When**: Three `handleMessage()` calls are made
  - **Then**: `metrics.getReport()` shows `totalRequests: 3`, `cacheHits: 2`, `cacheMisses: 1`, `hitRate > 0.5`
  - **Type**: Integration
  - **File**: `tests/integration/story-2.10-cache-hits.spec.ts`

---

## Manual Verification (E2E Test 2.10.5 from test-design-epic-2.md)

**Note:** This test requires actual API calls and billing verification.

- [ ] **Test 2.10.M1**: Measurable cost reduction in production
  - **Given**: Caching enabled in production environment
  - **When**: Running multiple agent conversations over 24 hours
  - **Then**: Anthropic usage dashboard shows `cache_read_input_tokens` > 0
  - **Type**: Manual / Production Verification
  - **Verification Steps**:
    1. Run 50+ agent conversations with repeated system prompts
    2. Check Anthropic usage dashboard for `cache_read_input_tokens`
    3. Compare billing with baseline (caching disabled period)
    4. Verify 50-80% cost reduction for system prompt tokens

---

## Test File Structure

```
tests/
  unit/
    story-2.10-caching.spec.ts       # AC1, AC3 unit tests
    story-2.10-metrics.spec.ts       # AC2, AC5 unit tests
    story-2.10-agent-injection.spec.ts  # AC4 dependency injection tests
  integration/
    story-2.10-butler-caching.spec.ts   # AC4 Butler integration
    story-2.10-agent-caching.spec.ts    # AC4 all agents integration (6 agents)
    story-2.10-cache-hits.spec.ts       # AC2, AC5 full sequence test
    story-2.10-cache-logging.spec.ts    # AC2 logging verification
  mocks/
    services/
      metrics.ts                     # Mock CachingMetrics for dependency injection tests
                                     # (Optional - used by other story tests, not gated)
```

---

## Test Coverage Summary

| AC | Unit Tests | Integration Tests | E2E Tests | Total |
|----|------------|-------------------|-----------|-------|
| AC1 | 10 | 0 | 0 | 10 |
| AC2 | 10 | 1 | 0 | 11 |
| AC3 | 10 | 0 | 0 | 10 |
| AC4 | 2 | 10 | 0 | 12 |
| AC5 | 7 | 1 | 1 (manual) | 9 |
| **Total** | **39** | **12** | **1** | **52** |

**Breakdown:**
- AC1: 6 happy path (2.10.1.1-2.10.1.6) + 3 edge cases (2.10.1.7-2.10.1.9) + 1 error handling (2.10.1.10) = 10 unit tests
- AC2: 10 unit tests (2.10.2.1-2.10.2.10) + 1 logging integration (2.10.2.11) = 11 tests
- AC3: 5 happy path (2.10.3.1-2.10.3.5) + 5 edge cases (2.10.3.6-2.10.3.10) = 10 unit tests
- AC4: 2 unit tests (2.10.4.4, 2.10.4.12) + 4 Butler integration (2.10.4.1-2.10.4.3, 2.10.4.5) + 6 agent caching (2.10.4.6-2.10.4.11) = 12 tests
- AC5: 5 happy path (2.10.5.1-2.10.5.5) + 2 boundary (2.10.5.6-2.10.5.7) + 1 integration (2.10.5.8) = 8 automated + 1 manual = 9

---

## Gate Criteria for Story Completion

- [ ] All 51 automated tests passing (39 unit + 12 integration)
- [ ] Code coverage >= 80% for new modules (`caching.ts`, `metrics.ts`)
- [ ] Manual verification of cache hits in API dashboard (production)
- [ ] No P0/P1 bugs related to caching
- [ ] Integration confirmed for all 6 core agents (Butler, Triage, Scheduler, Communicator, Navigator, Preference Learner)

---

## Dependencies

**Upstream - Hard Blockers (must be complete before this story):**
- Story 2.1 (Butler Agent Core) - ButlerAgent class must exist for caching integration
- Story 2.2 (Agent Prompt Templates) - Template loading infrastructure required

**Upstream - Soft Dependencies (for full agent coverage tests):**
- Stories 2.5-2.9 (Other Agent Definitions) - Required ONLY for integration tests 2.10.4.7-2.10.4.11
  - If these agents don't exist yet, those specific tests can be marked as `skip` or `pending`
  - The core caching functionality (AC1-AC3, AC5) can be fully tested with ButlerAgent alone
  - Integration tests for other agents should be enabled as those stories complete

**Downstream (blocked by this story):**
- Epic 14 (Observability) - Caching metrics feed into observability
- Story 14.1 (Braintrust Tracing) - Cache performance tracking

---

**Document Status:** Ready for Development
**Generated by:** TEA (Test Architect Agent)
**Date:** 2026-01-15
