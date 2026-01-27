/**
 * IPC Event Types with Zod Validation
 * Story 2.4: Tauri IPC Integration
 *
 * Defines all event payloads for Tauri IPC communication.
 * Uses Zod for runtime validation of incoming events.
 */

import { z } from 'zod';

// =============================================================================
// Base Event Wrapper
// =============================================================================

/**
 * Create a schema for wrapped Orion stream events
 */
export const OrionStreamEventSchema = <T extends z.ZodType>(payloadSchema: T) =>
  z.object({
    requestId: z.string(),
    sessionId: z.string(),
    timestamp: z.string(),
    payload: payloadSchema,
  });

/**
 * Generic Orion stream event type
 */
export type OrionStreamEvent<T> = {
  requestId: string;
  sessionId: string;
  timestamp: string;
  payload: T;
};

// =============================================================================
// Message Events
// =============================================================================

/**
 * Message start event - emitted when streaming begins
 */
export const MessageStartPayloadSchema = z.object({
  requestId: z.string(),
  messageId: z.string(),
});
export type MessageStartPayload = z.infer<typeof MessageStartPayloadSchema>;

/**
 * Message chunk event - text or thinking content
 */
export const MessageChunkPayloadSchema = z.object({
  requestId: z.string(),
  type: z.enum(['text', 'thinking']),
  content: z.string(),
  isPartial: z.boolean(),
});
export type MessageChunkPayload = z.infer<typeof MessageChunkPayloadSchema>;

// =============================================================================
// Tool Events
// =============================================================================

/**
 * Tool start event - tool execution begins
 */
export const ToolStartPayloadSchema = z.object({
  requestId: z.string(),
  toolId: z.string(),
  name: z.string(),
  input: z.unknown(),
});
export type ToolStartPayload = z.infer<typeof ToolStartPayloadSchema>;

/**
 * Tool complete event - tool execution finished
 */
export const ToolCompletePayloadSchema = z.object({
  requestId: z.string(),
  toolId: z.string(),
  result: z.unknown(),
  durationMs: z.number(),
});
export type ToolCompletePayload = z.infer<typeof ToolCompletePayloadSchema>;

// =============================================================================
// Session Events
// =============================================================================

/**
 * Session complete event - query finished successfully
 */
export const SessionCompletePayloadSchema = z.object({
  requestId: z.string(),
  sessionId: z.string(),
  costUsd: z.number(),
  tokenCount: z.number(),
  durationMs: z.number(),
});
export type SessionCompletePayload = z.infer<typeof SessionCompletePayloadSchema>;

/**
 * Session error event - query failed
 */
export const SessionErrorPayloadSchema = z.object({
  requestId: z.string(),
  code: z.string(),
  message: z.string(),
  recoverable: z.boolean(),
  retryAfterMs: z.number().optional(),
});
export type SessionErrorPayload = z.infer<typeof SessionErrorPayloadSchema>;

// =============================================================================
// Budget Events
// =============================================================================

/**
 * Budget warning event - approaching budget limit (NFR-5.7)
 */
export const BudgetWarningPayloadSchema = z.object({
  requestId: z.string(),
  currentCostUsd: z.number(),
  maxBudgetUsd: z.number(),
  percentage: z.number(),
});
export type BudgetWarningPayload = z.infer<typeof BudgetWarningPayloadSchema>;

// =============================================================================
// Latency Metrics Events (NFR-1.1, NFR-7.1)
// =============================================================================

/**
 * Latency metrics event - timing information
 */
export const LatencyMetricsPayloadSchema = z.object({
  requestId: z.string(),
  firstTokenMs: z.number(),
  totalDurationMs: z.number().optional(),
});
export type LatencyMetricsPayload = z.infer<typeof LatencyMetricsPayloadSchema>;

// =============================================================================
// Audit Events (NFR-4.6)
// =============================================================================

/**
 * Audit tool event - for logging tool usage
 */
export const AuditToolPayloadSchema = z.object({
  requestId: z.string(),
  sessionId: z.string(),
  toolName: z.string(),
  toolId: z.string(),
  inputSanitized: z.unknown(),
  outputSanitized: z.unknown().optional(),
  durationMs: z.number().optional(),
  timestamp: z.string(),
  status: z.enum(['started', 'completed', 'failed']),
});
export type AuditToolPayload = z.infer<typeof AuditToolPayloadSchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate a payload against a Zod schema
 * Returns validated data or null if invalid
 */
export function validatePayload<T>(
  schema: z.ZodType<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('[IPC] Payload validation failed:', result.error.issues);
  return null;
}

/**
 * Validate a payload and throw if invalid
 */
export function validatePayloadStrict<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Safe parse with error details
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// =============================================================================
// Event Name Constants
// =============================================================================

/**
 * Orion event names (orion:// namespace per architecture.md)
 */
export const OrionEvents = {
  // Message events
  MESSAGE_START: 'orion://message/start',
  MESSAGE_CHUNK: 'orion://message/chunk',

  // Tool events
  TOOL_START: 'orion://tool/start',
  TOOL_COMPLETE: 'orion://tool/complete',

  // Session events
  SESSION_COMPLETE: 'orion://session/complete',
  SESSION_ERROR: 'orion://session/error',

  // Metrics events
  METRICS_LATENCY: 'orion://metrics/latency',

  // Budget events
  BUDGET_WARNING: 'orion://budget/warning',

  // Audit events
  AUDIT_TOOL: 'orion://audit/tool',
} as const;

export type OrionEventName = (typeof OrionEvents)[keyof typeof OrionEvents];
