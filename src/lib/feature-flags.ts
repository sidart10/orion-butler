/**
 * Feature Flags - Gradual Rollout Control
 * Phase 2: Concurrent Sessions
 *
 * Controls feature availability for staged rollout:
 * - Internal testing (dev only)
 * - Beta users (opt-in)
 * - General availability (all users)
 *
 * Set via environment variables in `.env.local`:
 * ```
 * NEXT_PUBLIC_ENABLE_DYNAMIC_LIMITS=true
 * NEXT_PUBLIC_ENABLE_TIERED_STORAGE=true
 * ```
 */

/** Feature flag definitions */
export interface FeatureFlags {
  /**
   * Phase 1: Basic concurrent sessions (always enabled)
   * Allows up to 2 concurrent streaming sessions
   */
  CONCURRENT_SESSIONS_V1: boolean

  /**
   * Phase 2: Dynamic session limits based on RAM
   * Calculates max sessions from system resources
   * Requires: CONCURRENT_SESSIONS_V1
   */
  DYNAMIC_SESSION_LIMITS: boolean

  /**
   * Phase 2: Tiered session storage (Hot/Warm/Cold)
   * Enables session serialization and tier promotion/demotion
   * Requires: DYNAMIC_SESSION_LIMITS
   */
  TIERED_SESSION_STORAGE: boolean

  /**
   * Phase 2: Memory pressure watchdog
   * Background monitoring with automatic demotion
   * Requires: TIERED_SESSION_STORAGE
   */
  MEMORY_WATCHDOG: boolean
}

/**
 * Get environment variable with Next.js public prefix
 */
function getEnvFlag(name: string, defaultValue: boolean = false): boolean {
  // Check both formats for flexibility
  const envKey = `NEXT_PUBLIC_${name}`

  // In browser, use window.env or process.env
  if (typeof window !== 'undefined') {
    // Check window.__ENV__ if set by runtime config
    const windowEnv = (window as unknown as { __ENV__?: Record<string, string> }).__ENV__
    if (windowEnv?.[envKey] !== undefined) {
      return windowEnv[envKey] === 'true'
    }
  }

  // Check process.env (works in Node and Next.js)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[envKey]
    if (value !== undefined) {
      return value === 'true'
    }
  }

  return defaultValue
}

/**
 * Feature flags singleton
 *
 * Phase 2 features are disabled by default for gradual rollout.
 * Enable via environment variables for testing.
 *
 * @example
 * ```typescript
 * import { FEATURES } from '@/lib/feature-flags'
 *
 * if (FEATURES.DYNAMIC_SESSION_LIMITS) {
 *   // Use dynamic limits
 * } else {
 *   // Fallback to Phase 1 hard limit
 * }
 * ```
 */
export const FEATURES: FeatureFlags = {
  // Phase 1: Always enabled (baseline functionality)
  CONCURRENT_SESSIONS_V1: true,

  // Phase 2: Behind flags for staged rollout
  // Default to TRUE for production since Phase 2 is complete
  DYNAMIC_SESSION_LIMITS: getEnvFlag('ENABLE_DYNAMIC_LIMITS', true),
  TIERED_SESSION_STORAGE: getEnvFlag('ENABLE_TIERED_STORAGE', true),
  MEMORY_WATCHDOG: getEnvFlag('ENABLE_MEMORY_WATCHDOG', true),
}

/**
 * Check if all Phase 2 features are enabled
 */
export function isPhase2Enabled(): boolean {
  return (
    FEATURES.DYNAMIC_SESSION_LIMITS &&
    FEATURES.TIERED_SESSION_STORAGE &&
    FEATURES.MEMORY_WATCHDOG
  )
}

/**
 * Get feature status for debugging/UI
 */
export function getFeatureStatus(): Record<keyof FeatureFlags, boolean> {
  return { ...FEATURES }
}

/**
 * Override feature flags for testing
 * Only available in test environment
 */
export function setFeatureFlag(
  flag: keyof FeatureFlags,
  value: boolean
): void {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[FeatureFlags] setFeatureFlag() only allowed in test environment')
    return
  }

  ;(FEATURES as Record<string, boolean>)[flag] = value
}

/**
 * Reset all feature flags to defaults
 * Only available in test environment
 */
export function resetFeatureFlags(): void {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[FeatureFlags] resetFeatureFlags() only allowed in test environment')
    return
  }

  FEATURES.CONCURRENT_SESSIONS_V1 = true
  FEATURES.DYNAMIC_SESSION_LIMITS = getEnvFlag('ENABLE_DYNAMIC_LIMITS', true)
  FEATURES.TIERED_SESSION_STORAGE = getEnvFlag('ENABLE_TIERED_STORAGE', true)
  FEATURES.MEMORY_WATCHDOG = getEnvFlag('ENABLE_MEMORY_WATCHDOG', true)
}
