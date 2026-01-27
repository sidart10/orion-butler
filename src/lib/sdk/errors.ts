/**
 * SDK Error Handling
 * Story 2.3: Error wrapping and retry logic
 *
 * Per NFR-2.5: Retry intervals 30s → 60s → 120s
 */

import { OrionError, ErrorCodeMap, type ErrorCode } from './types';

// =============================================================================
// Retry Configuration (NFR-2.5)
// =============================================================================

/** Retry intervals in milliseconds: 30s, 60s, 120s */
export const RETRY_INTERVALS = [30_000, 60_000, 120_000] as const;

/**
 * Get retry delay for a given attempt number
 * @param attemptNumber - Zero-indexed attempt number
 * @returns Delay in ms, or null if retries exhausted
 */
export function getRetryDelay(attemptNumber: number): number | null {
  return attemptNumber < RETRY_INTERVALS.length
    ? RETRY_INTERVALS[attemptNumber]
    : null;
}

// =============================================================================
// Error Detection Patterns
// =============================================================================

interface ErrorPattern {
  pattern: RegExp | string[];
  code: ErrorCode;
  recoverable: boolean;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // Rate limiting (recoverable with retry)
  {
    pattern: ['rate limit', '429', 'too many requests'],
    code: ErrorCodeMap.RATE_LIMITED,
    recoverable: true,
  },
  // Authentication errors (not recoverable without re-auth)
  {
    pattern: ['authentication', 'unauthorized', '401', 'API key'],
    code: ErrorCodeMap.AUTH_REQUIRED,
    recoverable: false,
  },
  // Budget exceeded
  {
    pattern: ['budget', 'cost limit', 'spending limit'],
    code: ErrorCodeMap.BUDGET_EXCEEDED,
    recoverable: false,
  },
  // Network errors (recoverable)
  {
    pattern: ['network', 'ECONNREFUSED', 'ETIMEDOUT', 'fetch failed'],
    code: ErrorCodeMap.NETWORK_ERROR,
    recoverable: true,
  },
  // Timeout (recoverable)
  {
    pattern: ['timeout', 'timed out', 'TIMEOUT'],
    code: ErrorCodeMap.TIMEOUT_ERROR,
    recoverable: true,
  },
  // CLI not found (fatal)
  {
    pattern: ['claude', 'not found', 'ENOENT', 'command not found'],
    code: ErrorCodeMap.CLI_NOT_FOUND,
    recoverable: false,
  },
];

/**
 * Detect error code from error message
 */
function detectErrorCode(message: string): ErrorPattern | null {
  const lowerMessage = message.toLowerCase();

  for (const pattern of ERROR_PATTERNS) {
    const matches =
      pattern.pattern instanceof RegExp
        ? pattern.pattern.test(lowerMessage)
        : pattern.pattern.some((p) => lowerMessage.includes(p.toLowerCase()));

    if (matches) {
      return pattern;
    }
  }

  return null;
}

// =============================================================================
// Error Wrapping
// =============================================================================

/**
 * Wrap any error into an OrionError with appropriate code and retry info
 * @param error - The original error
 * @param attemptNumber - Current retry attempt (for calculating retry delay)
 */
export function wrapSdkError(
  error: unknown,
  attemptNumber: number = 0
): OrionError {
  const retryAfterMs = getRetryDelay(attemptNumber);

  // Handle OrionError passthrough
  if (error instanceof OrionError) {
    return error;
  }

  // Handle Error instances
  if (error instanceof Error) {
    const detected = detectErrorCode(error.message);

    if (detected) {
      return new OrionError(detected.code, error.message, {
        originalError: error,
        recoverable: detected.recoverable,
        retryAfterMs: detected.recoverable ? retryAfterMs ?? undefined : undefined,
      });
    }

    // Default: SDK error (recoverable)
    return new OrionError(ErrorCodeMap.SDK_ERROR, error.message, {
      originalError: error,
      retryAfterMs: retryAfterMs ?? undefined,
    });
  }

  // Handle non-Error values
  return new OrionError(
    ErrorCodeMap.FATAL_ERROR,
    typeof error === 'string' ? error : String(error)
  );
}

/**
 * Create an OrionError from error code and message
 */
export function createError(
  code: keyof typeof ErrorCodeMap,
  message: string,
  options?: {
    originalError?: Error;
    retryAfterMs?: number;
  }
): OrionError {
  return new OrionError(ErrorCodeMap[code], message, options);
}

/**
 * Check if an error is recoverable (1xxx or 3xxx codes)
 */
export function isRecoverableError(error: OrionError): boolean {
  return error.recoverable;
}

/**
 * Check if we should retry based on error and attempt count
 */
export function shouldRetry(error: OrionError, attemptNumber: number): boolean {
  if (!error.recoverable) {
    return false;
  }
  return getRetryDelay(attemptNumber) !== null;
}
