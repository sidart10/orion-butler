/**
 * Completion Event Factory for Orion Butler Tests
 *
 * Creates test data for ResultMessage completion events and streaming contexts.
 * Used by Story 2.11 ATDD tests for verifying completion flow.
 *
 * @see Story 2.11: Display ResultMessage Completion
 * @see thoughts/planning-artifacts/architecture.md#Session Complete Payload
 */

/**
 * Session complete payload matching architecture.md specification
 */
export interface SessionCompletePayload {
  type: 'session_complete';
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}

/**
 * Streaming context at point of completion
 */
export interface CompletionStreamingContext {
  text: string;
  thinking: string[];
  tools: Map<string, ToolStatus>;
  costUsd: number;
  durationMs: number;
  totalTokens: number;
}

/**
 * Tool status for completion context
 */
export interface ToolStatus {
  name: string;
  status: 'running' | 'complete' | 'error';
  input?: unknown;
  result?: string;
  errorMessage?: string;
  durationMs?: number;
}

/**
 * Create a completion payload with defaults
 *
 * @param overrides - Partial payload to override defaults
 * @returns A valid SessionCompletePayload
 *
 * @example
 * ```typescript
 * const payload = createCompletionPayload({ costUsd: 0.01 });
 * expect(payload.costUsd).toBe(0.01);
 * expect(payload.totalTokens).toBeGreaterThan(0);
 * ```
 */
export function createCompletionPayload(
  overrides: Partial<Omit<SessionCompletePayload, 'type'>> = {}
): SessionCompletePayload {
  return {
    type: 'session_complete',
    totalTokens: 150 + Math.floor(Math.random() * 100),
    costUsd: 0.003 + Math.random() * 0.007,
    durationMs: 1500 + Math.floor(Math.random() * 2000),
    ...overrides,
  };
}

/**
 * Create a streaming context at point of completion
 *
 * @param overrides - Partial context to override defaults
 * @returns A valid CompletionStreamingContext
 *
 * @example
 * ```typescript
 * const context = createStreamingContext({
 *   text: 'Custom response text...',
 *   costUsd: 0.005,
 * });
 * ```
 */
export function createStreamingContext(
  overrides: Partial<CompletionStreamingContext> = {}
): CompletionStreamingContext {
  const payload = createCompletionPayload();

  return {
    text: 'Hello! I am Claude, an AI assistant created by Anthropic. How can I help you today?',
    thinking: [],
    tools: new Map(),
    costUsd: payload.costUsd,
    durationMs: payload.durationMs,
    totalTokens: payload.totalTokens,
    ...overrides,
  };
}

/**
 * Create a streaming context with tool activity
 *
 * @param toolCount - Number of tools to include
 * @returns Context with populated tools map
 */
export function createStreamingContextWithTools(
  toolCount: number = 2
): CompletionStreamingContext {
  const tools = new Map<string, ToolStatus>();

  const toolNames = ['web_search', 'read_file', 'write_file', 'execute_code', 'list_files'];

  for (let i = 0; i < toolCount; i++) {
    const toolId = `tool-${i + 1}-${Date.now()}`;
    tools.set(toolId, {
      name: toolNames[i % toolNames.length],
      status: 'complete',
      input: { query: `test-input-${i}` },
      result: `Tool result ${i + 1}`,
      durationMs: 100 + Math.floor(Math.random() * 500),
    });
  }

  return createStreamingContext({ tools });
}

/**
 * Create a full completion event sequence for integration testing
 *
 * @returns Array of events: START, TOKENs, COMPLETE
 */
export function createCompletionSequence(): Array<{
  type: string;
  data?: string;
  totalTokens?: number;
  costUsd?: number;
  durationMs?: number;
}> {
  const tokens = [
    'Hello',
    '!',
    ' I',
    ' am',
    ' Claude',
    ',',
    ' an',
    ' AI',
    ' assistant',
    '.',
  ];

  const payload = createCompletionPayload();

  return [
    { type: 'START' },
    ...tokens.map((token) => ({ type: 'TOKEN', data: token })),
    {
      type: 'COMPLETE',
      totalTokens: payload.totalTokens,
      costUsd: payload.costUsd,
      durationMs: payload.durationMs,
    },
  ];
}

/**
 * Create a completion sequence with thinking phase
 */
export function createCompletionSequenceWithThinking(): Array<{
  type: string;
  data?: string;
  thinking?: string;
  totalTokens?: number;
  costUsd?: number;
  durationMs?: number;
}> {
  const thinkingTokens = [
    'Let me think about this...',
    'I should consider the context...',
    'The user is asking about...',
  ];

  const tokens = ['Based', ' on', ' my', ' analysis', ',', ' here', ' is', ' the', ' answer', '.'];

  const payload = createCompletionPayload();

  return [
    { type: 'START' },
    ...thinkingTokens.map((thought) => ({ type: 'THINKING', thinking: thought })),
    ...tokens.map((token) => ({ type: 'TOKEN', data: token })),
    {
      type: 'COMPLETE',
      totalTokens: payload.totalTokens,
      costUsd: payload.costUsd,
      durationMs: payload.durationMs,
    },
  ];
}

/**
 * Create an error completion payload
 */
export function createErrorPayload(message: string = 'An error occurred'): {
  type: 'ERROR';
  message: string;
} {
  return {
    type: 'ERROR',
    message,
  };
}

/**
 * Create a completion payload with zero values (edge case)
 */
export function createZeroCompletionPayload(): SessionCompletePayload {
  return {
    type: 'session_complete',
    totalTokens: 0,
    costUsd: 0,
    durationMs: 0,
  };
}

/**
 * Create a rapid completion sequence (immediate completion after first token)
 */
export function createRapidCompletionSequence(): Array<{
  type: string;
  data?: string;
  totalTokens?: number;
  costUsd?: number;
  durationMs?: number;
}> {
  const payload = createCompletionPayload({ durationMs: 50 });

  return [
    { type: 'START' },
    { type: 'TOKEN', data: 'Quick' },
    {
      type: 'COMPLETE',
      totalTokens: payload.totalTokens,
      costUsd: payload.costUsd,
      durationMs: payload.durationMs,
    },
  ];
}
