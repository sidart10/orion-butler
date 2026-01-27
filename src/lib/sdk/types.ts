/**
 * SDK Wrapper Types
 * Story 2.2: SDK Integration
 *
 * Core types for the Orion SDK wrapper layer.
 * Uses Zod for validation and neverthrow for Result types.
 */

import { z } from 'zod';
import type { Result } from 'neverthrow';

// =============================================================================
// Session Types
// =============================================================================

export const SessionTypeSchema = z.enum(['daily', 'project', 'inbox', 'adhoc']);
export type SessionType = z.infer<typeof SessionTypeSchema>;

export const OrionSessionSchema = z.object({
  id: z.string(),
  type: SessionTypeSchema,
  createdAt: z.string().datetime(),
  lastActivity: z.string().datetime(),
  context: z.record(z.unknown()).optional(),
  tokenCount: z.number().default(0),
  costUsd: z.number().default(0),
});
export type OrionSession = z.infer<typeof OrionSessionSchema>;

// =============================================================================
// Query Options
// =============================================================================

/**
 * User-facing query options (safe for UI)
 */
export interface QueryOptions {
  /** Session ID for resuming conversation */
  sessionId?: string;
  /** Model to use (defaults to claude-sonnet-4-5-20250929) */
  model?: string;
  /** System prompt override */
  systemPrompt?: string;
  /** Maximum conversation turns */
  maxTurns?: number;
  /** Maximum budget in USD (NFR budget control) */
  maxBudgetUsd?: number;
  /** Maximum thinking tokens for extended reasoning */
  maxThinkingTokens?: number;
  /** Fork from existing session instead of continuing */
  forkSession?: boolean;
  /** Permission mode: default, plan, or acceptEdits */
  permissionMode?: 'default' | 'plan' | 'acceptEdits';
}

/**
 * Internal options - NOT exposed to UI (dev/testing only)
 */
export interface InternalQueryOptions extends QueryOptions {
  /**
   * DANGEROUS: Bypass all permission checks.
   * Only available via ORION_DEV_BYPASS_PERMISSIONS env flag.
   * NEVER expose to UI components.
   */
  _dangerouslyBypassPermissions?: boolean;
}

// =============================================================================
// Stream Message Types (Discriminated Union)
// =============================================================================

export const TextMessageSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
  isPartial: z.boolean(),
});

export const ThinkingMessageSchema = z.object({
  type: z.literal('thinking'),
  content: z.string(),
  isPartial: z.boolean(),
});

export const ToolStartMessageSchema = z.object({
  type: z.literal('tool_start'),
  toolId: z.string(),
  name: z.string(),
  input: z.unknown(),
});

export const ToolCompleteMessageSchema = z.object({
  type: z.literal('tool_complete'),
  toolId: z.string(),
  result: z.unknown(),
  durationMs: z.number(),
});

export const CompleteMessageSchema = z.object({
  type: z.literal('complete'),
  sessionId: z.string(),
  costUsd: z.number(),
  tokenCount: z.number(),
  durationMs: z.number(),
});

export const ErrorMessageSchema = z.object({
  type: z.literal('error'),
  code: z.string(),
  message: z.string(),
  recoverable: z.boolean(),
  retryAfterMs: z.number().optional(),
});

export const BudgetWarningMessageSchema = z.object({
  type: z.literal('budget_warning'),
  currentCostUsd: z.number(),
  maxBudgetUsd: z.number(),
  percentage: z.number(),
});

export const StreamMessageSchema = z.discriminatedUnion('type', [
  TextMessageSchema,
  ThinkingMessageSchema,
  ToolStartMessageSchema,
  ToolCompleteMessageSchema,
  CompleteMessageSchema,
  ErrorMessageSchema,
  BudgetWarningMessageSchema,
]);

export type StreamMessage = z.infer<typeof StreamMessageSchema>;

export type TextMessage = z.infer<typeof TextMessageSchema>;
export type ThinkingMessage = z.infer<typeof ThinkingMessageSchema>;
export type ToolStartMessage = z.infer<typeof ToolStartMessageSchema>;
export type ToolCompleteMessage = z.infer<typeof ToolCompleteMessageSchema>;
export type CompleteMessage = z.infer<typeof CompleteMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type BudgetWarningMessage = z.infer<typeof BudgetWarningMessageSchema>;

// =============================================================================
// Error Types
// =============================================================================

export const ErrorCodeSchema = z.enum([
  // Recoverable (1xxx)
  '1001', // SDK_ERROR
  '1002', // NETWORK_ERROR
  '1003', // TIMEOUT_ERROR
  // Auth Required (2xxx)
  '2001', // AUTH_REQUIRED
  '2002', // API_KEY_MISSING
  // Rate Limited (3xxx)
  '3001', // RATE_LIMITED
  '3002', // QUOTA_EXCEEDED
  '3003', // BUDGET_EXCEEDED
  // Fatal (9xxx)
  '9001', // FATAL_ERROR
  '9002', // CLI_NOT_FOUND
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorCodeMap = {
  SDK_ERROR: '1001',
  NETWORK_ERROR: '1002',
  TIMEOUT_ERROR: '1003',
  AUTH_REQUIRED: '2001',
  API_KEY_MISSING: '2002',
  RATE_LIMITED: '3001',
  QUOTA_EXCEEDED: '3002',
  BUDGET_EXCEEDED: '3003',
  FATAL_ERROR: '9001',
  CLI_NOT_FOUND: '9002',
} as const;

/**
 * Orion-specific error class with structured error codes
 */
export class OrionError extends Error {
  readonly code: ErrorCode;
  readonly recoverable: boolean;
  readonly originalError?: Error;
  readonly retryAfterMs?: number;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      recoverable?: boolean;
      originalError?: Error;
      retryAfterMs?: number;
    }
  ) {
    super(message);
    this.name = 'OrionError';
    this.code = code;
    // 1xxx and 3xxx errors are recoverable by default
    this.recoverable =
      options?.recoverable ??
      (code.startsWith('1') || code.startsWith('3'));
    this.originalError = options?.originalError;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

// =============================================================================
// SDK Interface
// =============================================================================

/**
 * Main SDK interface using neverthrow Result types
 */
export interface IAgentSDK {
  /**
   * Send a query to Claude and stream responses
   * @param prompt - User message
   * @param options - Query options
   * @yields Result<StreamMessage, OrionError>
   */
  query(
    prompt: string,
    options?: QueryOptions
  ): AsyncGenerator<Result<StreamMessage, OrionError>, void>;

  /**
   * Get a session by ID
   * @param sessionId - Session ID to retrieve
   */
  getSession(
    sessionId: string
  ): Promise<Result<OrionSession | null, OrionError>>;

  /**
   * End and cleanup a session
   * @param sessionId - Session ID to end
   */
  endSession(sessionId: string): Promise<Result<void, OrionError>>;

  /**
   * Check if SDK is ready (CLI available, authenticated)
   */
  isReady(): Promise<boolean>;

  /**
   * List sessions by type
   * @param type - Optional session type filter
   */
  listSessions(
    type?: SessionType
  ): Promise<Result<OrionSession[], OrionError>>;
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate an unknown value against a Zod schema
 * Returns null if validation fails (logs warning)
 */
export function validatePayload<T>(
  schema: z.ZodType<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('Payload validation failed:', result.error.issues);
  return null;
}

/**
 * Type guard for StreamMessage types
 */
export function isStreamMessage(value: unknown): value is StreamMessage {
  return StreamMessageSchema.safeParse(value).success;
}
