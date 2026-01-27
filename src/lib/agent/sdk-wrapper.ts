/**
 * Claude Agent SDK Wrapper
 * Story 2.2: SDK Integration
 *
 * Abstracts SDK calls behind a wrapper for maintainability (NFR-6.1).
 * Provides retry logic, timeout handling, and typed events.
 */

// Types for SDK events
export type StreamEventType =
  | 'text_delta'
  | 'thinking_delta'
  | 'tool_use'
  | 'tool_result'
  | 'message_start'
  | 'message_end'
  | 'error'

export interface TextDeltaEvent {
  type: 'text_delta'
  text: string
}

export interface ThinkingDeltaEvent {
  type: 'thinking_delta'
  text: string
}

export interface ToolUseEvent {
  type: 'tool_use'
  toolUseId: string
  toolName: string
  input: Record<string, unknown>
}

export interface ToolResultEvent {
  type: 'tool_result'
  toolUseId: string
  result: unknown
}

export interface MessageStartEvent {
  type: 'message_start'
  messageId: string
}

export interface MessageEndEvent {
  type: 'message_end'
  messageId: string
  stopReason: string
}

export interface ErrorEvent {
  type: 'error'
  error: Error
}

export type StreamEvent =
  | TextDeltaEvent
  | ThinkingDeltaEvent
  | ToolUseEvent
  | ToolResultEvent
  | MessageStartEvent
  | MessageEndEvent
  | ErrorEvent

/**
 * SDK Configuration
 */
export interface SDKConfig {
  /** Request timeout in milliseconds (default: 60000) */
  timeout: number
  /** Maximum retry attempts (default: 3) */
  maxRetries: number
  /** Base delay between retries in ms (default: 1000, uses exponential backoff) */
  retryDelay: number
}

export const DEFAULT_SDK_CONFIG: SDKConfig = {
  timeout: 60000,
  maxRetries: 3,
  retryDelay: 1000,
}

/**
 * Query options for sendQuery
 */
export interface QueryOptions {
  /** System prompt */
  system?: string
  /** Conversation history */
  history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  /** SDK config overrides */
  config?: Partial<SDKConfig>
}

/**
 * Stream handler callbacks
 */
export interface StreamHandlers {
  onEvent: (event: StreamEvent) => void
  onComplete: () => void
  onError: (error: Error) => void
}

/**
 * Send a query to Claude Agent SDK
 *
 * NOTE: This is a placeholder implementation.
 * The actual SDK integration requires the Tauri backend
 * to handle the API calls securely with the API key.
 *
 * @param prompt - The user's message
 * @param options - Query options
 * @param handlers - Stream event handlers
 */
export async function sendQuery(
  prompt: string,
  _options: QueryOptions = {},
  handlers: StreamHandlers
): Promise<void> {
  // TODO: Use _options.config when Tauri backend is connected
  // const config = { ...DEFAULT_SDK_CONFIG, ..._options.config }

  // For now, simulate a response since we need Tauri backend
  // In production, this would call invoke('chat_send', { prompt, options })

  // Emit message start
  handlers.onEvent({
    type: 'message_start',
    messageId: `msg_${Date.now()}`,
  })

  // Simulate thinking
  handlers.onEvent({
    type: 'thinking_delta',
    text: 'Processing your request...',
  })

  // Simulate text response
  await new Promise((resolve) => setTimeout(resolve, 500))
  handlers.onEvent({
    type: 'text_delta',
    text: `I received your message: "${prompt}". `,
  })

  await new Promise((resolve) => setTimeout(resolve, 300))
  handlers.onEvent({
    type: 'text_delta',
    text: 'This is a placeholder response from the SDK wrapper. ',
  })

  await new Promise((resolve) => setTimeout(resolve, 300))
  handlers.onEvent({
    type: 'text_delta',
    text: 'Once Tauri IPC is connected, this will use the real Claude API.',
  })

  // Emit message end
  handlers.onEvent({
    type: 'message_end',
    messageId: `msg_${Date.now()}`,
    stopReason: 'end_turn',
  })

  handlers.onComplete()
}

/**
 * Calculate retry delay with exponential backoff
 */
export function getRetryDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt)
}
