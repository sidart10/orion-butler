/**
 * SDK Module - Barrel Export
 * Story 2.2: SDK Integration
 *
 * Re-exports all SDK types and provides singleton factory.
 * All SDK access should go through this module.
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  // Session types
  SessionType,
  OrionSession,

  // Query options
  QueryOptions,
  InternalQueryOptions,

  // Stream messages
  StreamMessage,
  TextMessage,
  ThinkingMessage,
  ToolStartMessage,
  ToolCompleteMessage,
  CompleteMessage,
  ErrorMessage,
  BudgetWarningMessage,

  // Error types
  ErrorCode,

  // SDK interface
  IAgentSDK,
} from './types';

// =============================================================================
// Schema Exports (for validation)
// =============================================================================

export {
  SessionTypeSchema,
  OrionSessionSchema,
  StreamMessageSchema,
  TextMessageSchema,
  ThinkingMessageSchema,
  ToolStartMessageSchema,
  ToolCompleteMessageSchema,
  CompleteMessageSchema,
  ErrorMessageSchema,
  BudgetWarningMessageSchema,
  ErrorCodeSchema,
  ErrorCodeMap,
  OrionError,
  validatePayload,
  isStreamMessage,
} from './types';

// =============================================================================
// Error Utilities
// =============================================================================

export {
  RETRY_INTERVALS,
  getRetryDelay,
  wrapSdkError,
  createError,
  isRecoverableError,
  shouldRetry,
} from './errors';

// =============================================================================
// Budget Tracking
// =============================================================================

export { BudgetTracker, type BudgetStatus } from './budget-tracker';

// =============================================================================
// SDK Implementation
// =============================================================================

export { ClaudeAgentSDK, generateSessionId } from './claude-agent-sdk';

// =============================================================================
// Type Guards
// =============================================================================

export {
  // StreamMessage type guards
  isTextMessage,
  isThinkingMessage,
  isToolStartMessage,
  isToolCompleteMessage,
  isCompleteMessage,
  isErrorMessage,
  isBudgetWarningMessage,
  // Content block type guards
  isTextBlock,
  isThinkingBlock,
  isToolUseBlock,
  isToolResultBlock,
  // SDK message type guards
  isSDKAssistantMessage,
  isSDKResultMessage,
  isSDKSystemMessage,
  isSDKStreamEvent,
  isSDKErrorMessage,
  isSDKSuccessResult,
  // Error code type guards
  isRecoverableErrorCode,
  isAuthErrorCode,
  isFatalErrorCode,
  isRateLimitErrorCode,
  // Content block types
  type TextBlock,
  type ThinkingBlock,
  type ToolUseBlock,
  type ToolResultBlock,
  type ContentBlock,
  type SDKMessageBase,
} from './type-guards';

// =============================================================================
// Session Store
// =============================================================================

export {
  SessionStore,
  getSessionStore,
  resetSessionStore,
} from './session-store';

// =============================================================================
// Singleton Factory
// =============================================================================

import type { IAgentSDK } from './types';
import { ClaudeAgentSDK } from './claude-agent-sdk';

let instance: IAgentSDK | null = null;

/**
 * Get the singleton SDK instance
 * Use this for production code
 */
export function getAgentSDK(): IAgentSDK {
  if (!instance) {
    instance = new ClaudeAgentSDK();
  }
  return instance;
}

/**
 * Set a custom SDK instance (for testing/mocking)
 * @param sdk - Custom SDK implementation
 */
export function setAgentSDK(sdk: IAgentSDK): void {
  instance = sdk;
}

/**
 * Reset the SDK singleton (for testing)
 */
export function resetAgentSDK(): void {
  instance = null;
}
