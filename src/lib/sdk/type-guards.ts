/**
 * SDK Type Guards
 * Story 2.3: Type-safe message handling
 *
 * Type guards for SDK message types and content blocks.
 * Used for safe runtime type checking of streaming data.
 */

import type {
  StreamMessage,
  TextMessage,
  ThinkingMessage,
  ToolStartMessage,
  ToolCompleteMessage,
  CompleteMessage,
  ErrorMessage,
  BudgetWarningMessage,
} from './types';

// =============================================================================
// StreamMessage Type Guards
// =============================================================================

/**
 * Check if message is a text message
 */
export function isTextMessage(msg: StreamMessage): msg is TextMessage {
  return msg.type === 'text';
}

/**
 * Check if message is a thinking message
 */
export function isThinkingMessage(msg: StreamMessage): msg is ThinkingMessage {
  return msg.type === 'thinking';
}

/**
 * Check if message is a tool start message
 */
export function isToolStartMessage(msg: StreamMessage): msg is ToolStartMessage {
  return msg.type === 'tool_start';
}

/**
 * Check if message is a tool complete message
 */
export function isToolCompleteMessage(msg: StreamMessage): msg is ToolCompleteMessage {
  return msg.type === 'tool_complete';
}

/**
 * Check if message is a complete message
 */
export function isCompleteMessage(msg: StreamMessage): msg is CompleteMessage {
  return msg.type === 'complete';
}

/**
 * Check if message is an error message
 */
export function isErrorMessage(msg: StreamMessage): msg is ErrorMessage {
  return msg.type === 'error';
}

/**
 * Check if message is a budget warning message
 */
export function isBudgetWarningMessage(msg: StreamMessage): msg is BudgetWarningMessage {
  return msg.type === 'budget_warning';
}

// =============================================================================
// Content Block Type Guards (for SDK message.content arrays)
// =============================================================================

/**
 * Text content block from SDK
 */
export interface TextBlock {
  type: 'text';
  text: string;
}

/**
 * Thinking content block from SDK
 */
export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

/**
 * Tool use content block from SDK
 */
export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

/**
 * Tool result content block from SDK
 */
export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: unknown;
}

/**
 * Union of all content block types
 */
export type ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock;

/**
 * Check if block is a text block
 */
export function isTextBlock(block: unknown): block is TextBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as Record<string, unknown>).type === 'text' &&
    typeof (block as Record<string, unknown>).text === 'string'
  );
}

/**
 * Check if block is a thinking block
 */
export function isThinkingBlock(block: unknown): block is ThinkingBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as Record<string, unknown>).type === 'thinking' &&
    typeof (block as Record<string, unknown>).thinking === 'string'
  );
}

/**
 * Check if block is a tool use block
 */
export function isToolUseBlock(block: unknown): block is ToolUseBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as Record<string, unknown>).type === 'tool_use' &&
    typeof (block as Record<string, unknown>).id === 'string' &&
    typeof (block as Record<string, unknown>).name === 'string'
  );
}

/**
 * Check if block is a tool result block
 */
export function isToolResultBlock(block: unknown): block is ToolResultBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as Record<string, unknown>).type === 'tool_result' &&
    typeof (block as Record<string, unknown>).tool_use_id === 'string'
  );
}

// =============================================================================
// SDK Message Type Guards (for raw SDK responses)
// =============================================================================

/**
 * SDK message base shape
 */
export interface SDKMessageBase {
  type: string;
  subtype?: string;
}

/**
 * Check if SDK message is an assistant message
 */
export function isSDKAssistantMessage(msg: SDKMessageBase): boolean {
  return msg.type === 'assistant';
}

/**
 * Check if SDK message is a result message
 */
export function isSDKResultMessage(msg: SDKMessageBase): boolean {
  return msg.type === 'result';
}

/**
 * Check if SDK message is a system message
 */
export function isSDKSystemMessage(msg: SDKMessageBase): boolean {
  return msg.type === 'system';
}

/**
 * Check if SDK message is a stream event (partial)
 */
export function isSDKStreamEvent(msg: SDKMessageBase): boolean {
  return msg.type === 'stream_event';
}

/**
 * Check if SDK message indicates an error
 * Errors are detected via subtype, not exceptions
 */
export function isSDKErrorMessage(msg: SDKMessageBase): boolean {
  return (
    typeof msg.subtype === 'string' &&
    (msg.subtype.startsWith('error') || msg.subtype === 'error_during_execution')
  );
}

/**
 * Check if SDK result is successful
 */
export function isSDKSuccessResult(msg: SDKMessageBase): boolean {
  return msg.type === 'result' && msg.subtype === 'success';
}

// =============================================================================
// Error Code Type Guards
// =============================================================================

/**
 * Check if error code is recoverable (1xxx or 3xxx)
 */
export function isRecoverableErrorCode(code: string): boolean {
  return code.startsWith('1') || code.startsWith('3');
}

/**
 * Check if error code requires authentication (2xxx)
 */
export function isAuthErrorCode(code: string): boolean {
  return code.startsWith('2');
}

/**
 * Check if error code is fatal (9xxx)
 */
export function isFatalErrorCode(code: string): boolean {
  return code.startsWith('9');
}

/**
 * Check if error code is rate limited (3xxx)
 */
export function isRateLimitErrorCode(code: string): boolean {
  return code.startsWith('3');
}
