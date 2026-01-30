/**
 * Session Limits - Dynamic Limit Calculation
 * Phase 2: Concurrent Sessions - Task 2.2
 *
 * Calculates dynamic session limits based on system resources.
 * Uses tauri-plugin-system-info for RAM/CPU detection.
 *
 * Formula (from plan):
 * - Reserve 2GB for OS
 * - Reserve 512MB for app base
 * - Use 60% of remaining RAM for sessions
 * - Each session ~50MB
 * - Min 5, Max 200 sessions
 *
 * Memory pressure thresholds:
 * - low: <60% used
 * - medium: 60-75% used
 * - high: 75-90% used
 * - critical: >90% used
 */

/** System resource information */
export interface SystemResources {
  totalRAM: number      // bytes
  availableRAM: number  // bytes
  cpuCores: number
}

/** Memory pressure levels */
export type MemoryPressure = 'low' | 'medium' | 'high' | 'critical'

/** Session tier limits */
export interface SessionLimitsResult {
  hot: number
  warm: number
  total: number  // Infinity for cold tier (unlimited)
}

// Constants for limit calculation
const RESERVED_OS_MB = 2048           // 2GB for OS
const RESERVED_APP_MB = 512           // 512MB for app base
const SESSION_SIZE_MB = 50            // ~50MB per session
const UTILIZATION_FACTOR = 0.6        // Use 60% of available
const MIN_SESSIONS = 5                // Always allow at least 5
const MAX_SESSIONS = 200              // Cap at 200 (diminishing returns)
const WARM_MULTIPLIER = 5             // Warm tier is hot * 5

// Cache TTL
const CACHE_TTL_MS = 60_000           // Recalculate every minute

/**
 * Default fallback resources (8GB machine)
 */
const FALLBACK_RESOURCES: SystemResources = {
  totalRAM: 8 * 1024 * 1024 * 1024,     // 8GB
  availableRAM: 4 * 1024 * 1024 * 1024, // 4GB available
  cpuCores: 4,
}

/**
 * Get system resources (with fallback for plugin failures)
 * Exported for testing purposes
 *
 * Uses tauri-plugin-system-info for accurate RAM/CPU detection.
 * Falls back to conservative 8GB defaults if plugin unavailable.
 */
export async function getSystemResources(): Promise<SystemResources> {
  // Check if we're in a Tauri environment
  if (typeof window === 'undefined' || !('__TAURI__' in window)) {
    // Not in Tauri (SSR, tests, etc.) - use fallback
    return FALLBACK_RESOURCES
  }

  try {
    // Import the plugin API
    // Dynamic import to avoid SSR/test issues and allow graceful fallback
    const { memoryInfo, cpuInfo } = await import('tauri-plugin-system-info-api')

    const memory = await memoryInfo()
    const cpu = await cpuInfo()

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[ResourceMonitor] Detected: ${(memory.total / (1024 ** 3)).toFixed(1)}GB RAM, ` +
        `${(memory.available / (1024 ** 3)).toFixed(1)}GB available, ${cpu.cpu_count} cores`
      )
    }

    return {
      totalRAM: memory.total,
      availableRAM: memory.available,
      cpuCores: cpu.cpu_count,
    }
  } catch (err) {
    console.warn('[ResourceMonitor] System info plugin failed, using 8GB defaults:', err)
    return FALLBACK_RESOURCES
  }
}

/**
 * Calculate maximum hot sessions based on available resources
 *
 * Formula:
 * maxSessions = floor((totalMB - RESERVED_OS - RESERVED_APP) * UTILIZATION / SESSION_SIZE)
 * Clamped to [MIN_SESSIONS, MAX_SESSIONS]
 */
export function calculateMaxHotSessions(resources: SystemResources): number {
  const totalMB = resources.totalRAM / (1024 * 1024)

  // Handle edge cases
  if (totalMB <= 0) {
    return MIN_SESSIONS
  }

  const usableForSessions = (totalMB - RESERVED_OS_MB - RESERVED_APP_MB) * UTILIZATION_FACTOR

  // If usable space is negative or very small, return minimum
  if (usableForSessions < SESSION_SIZE_MB) {
    return MIN_SESSIONS
  }

  const maxSessions = Math.floor(usableForSessions / SESSION_SIZE_MB)

  // Clamp to reasonable bounds
  return Math.min(MAX_SESSIONS, Math.max(MIN_SESSIONS, maxSessions))
}

/**
 * Session limits manager with caching
 */
export class SessionLimits {
  private resources: SystemResources | null = null
  private cachedLimits: { hot: number; warm: number } | null = null
  private lastCalculation = 0

  /**
   * Get current session tier limits
   * Caches results for CACHE_TTL_MS to avoid excessive system calls
   */
  async getLimits(): Promise<SessionLimitsResult> {
    const now = Date.now()

    // Use cached value if fresh
    if (this.cachedLimits && (now - this.lastCalculation) < CACHE_TTL_MS) {
      return { ...this.cachedLimits, total: Infinity }
    }

    // Fetch fresh resources
    this.resources = await getSystemResources()
    const hot = calculateMaxHotSessions(this.resources)
    const warm = hot * WARM_MULTIPLIER

    this.cachedLimits = { hot, warm }
    this.lastCalculation = now

    return { hot, warm, total: Infinity }
  }

  /**
   * Get current memory pressure level
   */
  async getMemoryPressure(): Promise<MemoryPressure> {
    const resources = await getSystemResources()

    // Handle edge case
    if (resources.totalRAM === 0) {
      return 'critical'
    }

    const usedPercent = 1 - (resources.availableRAM / resources.totalRAM)

    if (usedPercent < 0.6) return 'low'
    if (usedPercent < 0.75) return 'medium'
    if (usedPercent < 0.9) return 'high'
    return 'critical'
  }

  /**
   * Force cache refresh on next getLimits() call
   */
  invalidateCache(): void {
    this.cachedLimits = null
    this.lastCalculation = 0
  }
}

/** Singleton instance for global usage */
export const sessionLimits = new SessionLimits()
