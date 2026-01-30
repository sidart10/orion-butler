/**
 * Session Memory Profiling Tests
 * Phase 2: Task 2.0b - Validate 50MB/session assumption
 *
 * Measures actual memory footprint of StreamingSession instances
 * to validate the SESSION_SIZE_MB constant in session-limits.ts.
 *
 * NOTE: These tests measure baseline session memory (XState actor + subscriptions).
 * Message memory is measured separately using raw object allocation.
 *
 * For accurate end-to-end measurements, use Chrome DevTools memory profiler
 * with the running Tauri app.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ChatMessage } from '@/machines/streamingMachine'

// Mock Tauri APIs before importing StreamingSession
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({}),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
  emit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/ipc/chat', () => ({
  sendMessage: vi.fn().mockResolvedValue('req_123'),
  chatCancel: vi.fn().mockResolvedValue(undefined),
  subscribeToChatEvents: vi.fn().mockResolvedValue(() => {}),
}))

vi.mock('@/lib/ipc/conversation', () => ({
  saveConversationTurn: vi.fn().mockResolvedValue(undefined),
  formatTimestamp: vi.fn().mockReturnValue('2026-01-29T12:00:00Z'),
}))

vi.mock('@/lib/ipc/request-registry', () => ({
  requestRegistry: {
    register: vi.fn(),
    lookup: vi.fn(),
    complete: vi.fn(),
    hasPending: vi.fn().mockReturnValue(false),
    getPendingBySession: vi.fn().mockReturnValue([]),
    clear: vi.fn(),
  },
}))

vi.mock('@/lib/ipc/event-buffer', () => ({
  chatEventBuffer: {
    consume: vi.fn().mockReturnValue([]),
    reset: vi.fn(),
    registerSession: vi.fn(),
    unregisterSession: vi.fn(),
    setCurrentRequest: vi.fn(),
  },
}))

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: {
    getState: vi.fn().mockReturnValue({
      activeSessionId: null,
      setActiveSessionId: vi.fn(),
    }),
  },
}))

// Import after mocking
import { StreamingSession } from '@/lib/sdk/streaming-session'

/**
 * Generate realistic test messages
 * Average message is ~500 bytes (content + metadata)
 */
function generateTestMessages(count: number): ChatMessage[] {
  const messages: ChatMessage[] = []

  for (let i = 0; i < count; i++) {
    const isUser = i % 2 === 0
    const contentLength = isUser ? 100 : 500 // User messages shorter

    messages.push({
      id: `msg_${String(i).padStart(6, '0')}`,
      role: isUser ? 'user' : 'assistant',
      content: 'x'.repeat(contentLength),
      timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
    })
  }

  return messages
}

/**
 * Force garbage collection if available
 * Run with --expose-gc flag: node --expose-gc
 */
function forceGC(): void {
  if (global.gc) {
    global.gc()
  }
}

/**
 * Get current heap usage in MB
 */
function getHeapUsedMB(): number {
  return process.memoryUsage().heapUsed / (1024 * 1024)
}

describe('Session Memory Profiling', () => {
  beforeEach(() => {
    forceGC()
    vi.clearAllMocks()
  })

  afterEach(() => {
    forceGC()
  })

  it('measures baseline session memory (empty)', () => {
    const beforeMB = getHeapUsedMB()

    // Create empty session
    const session = new StreamingSession('session_empty', 'conv_empty')

    const afterMB = getHeapUsedMB()
    const sessionMB = afterMB - beforeMB

    console.log(`\n📊 Empty Session: ${sessionMB.toFixed(2)} MB`)

    // Baseline should be small (XState actor + subscriptions)
    // Expected: <5MB for empty session
    expect(sessionMB).toBeLessThan(5)

    // Cleanup
    session.destroy()
  })

  it('measures 5 concurrent empty sessions', () => {
    const beforeMB = getHeapUsedMB()

    const sessions: StreamingSession[] = []

    // Create 5 empty sessions
    for (let i = 0; i < 5; i++) {
      const session = new StreamingSession(`session_${i}`, `conv_${i}`)
      sessions.push(session)
    }

    const afterMB = getHeapUsedMB()
    const totalMB = afterMB - beforeMB
    const perSessionMB = totalMB / 5

    console.log(`\n📊 5 Concurrent Empty Sessions:`)
    console.log(`   Total: ${totalMB.toFixed(2)} MB`)
    console.log(`   Per session (avg): ${perSessionMB.toFixed(2)} MB`)

    // 5 empty sessions should be small
    // Expected: <25MB total (<5MB per session)
    expect(totalMB).toBeLessThan(25)
    expect(perSessionMB).toBeLessThan(5)

    // Cleanup
    for (const session of sessions) {
      session.destroy()
    }
  })

  it('measures message array memory separately', () => {
    // This test measures raw message memory without XState overhead
    // to validate our per-session memory budget

    const messageCounts = [50, 100, 200, 500]

    console.log(`\n📊 Message Array Memory (raw, no XState):`)

    for (const count of messageCounts) {
      forceGC()
      const beforeMB = getHeapUsedMB()

      const messages = generateTestMessages(count)

      const afterMB = getHeapUsedMB()
      const messagesMB = afterMB - beforeMB
      const jsonKB = JSON.stringify(messages).length / 1024

      console.log(`   ${count} messages: ${messagesMB.toFixed(2)} MB (JSON: ${jsonKB.toFixed(1)} KB)`)
    }

    // 500 messages should be under 5MB
    const largeMessages = generateTestMessages(500)
    const largeMessagesKB = JSON.stringify(largeMessages).length / 1024
    expect(largeMessagesKB).toBeLessThan(500) // JSON representation under 500KB
  })

  it('validates 50MB assumption with worst-case message payload', () => {
    /**
     * The session-limits.ts uses SESSION_SIZE_MB = 50
     * This test validates that assumption:
     *
     * Session memory = XState actor (~1-2MB) + Messages + Event subscriptions
     *
     * With 500 messages (worst case):
     * - XState overhead: ~2MB
     * - Messages (500 @ avg 1KB): ~0.5MB
     * - Duplication factor (XState context + React): ~2x
     * Total estimate: ~5-10MB per session
     *
     * Our 50MB assumption is VERY conservative to account for:
     * - Memory fragmentation
     * - Browser/Tauri runtime overhead
     * - Temporary allocations during streaming
     */

    // Measure XState session base overhead
    forceGC()
    const sessionBefore = getHeapUsedMB()
    const session = new StreamingSession('session_validate', 'conv_validate')
    const sessionAfter = getHeapUsedMB()
    const xstateOverhead = sessionAfter - sessionBefore

    // Measure worst-case messages
    forceGC()
    const messagesBefore = getHeapUsedMB()
    const messages: ChatMessage[] = []
    for (let i = 0; i < 500; i++) {
      const isUser = i % 3 === 0
      const hasToolCall = !isUser && i % 5 === 0
      let content: string
      if (hasToolCall) {
        content = JSON.stringify({
          tool: 'read_file',
          input: { path: '/src/lib/sdk/session-manager.ts' },
          output: 'x'.repeat(2000),
        })
      } else {
        content = 'x'.repeat(isUser ? 150 : 800)
      }
      messages.push({
        id: `msg_${String(i).padStart(6, '0')}`,
        role: isUser ? 'user' : 'assistant',
        content,
        timestamp: new Date().toISOString(),
      })
    }
    const messagesAfter = getHeapUsedMB()
    const messagesOverhead = messagesAfter - messagesBefore

    // Total with duplication factor
    const estimatedTotal = xstateOverhead + (messagesOverhead * 2)

    console.log(`\n📊 50MB Assumption Validation:`)
    console.log(`   XState actor overhead: ${xstateOverhead.toFixed(2)} MB`)
    console.log(`   Messages (500 worst-case): ${messagesOverhead.toFixed(2)} MB`)
    console.log(`   Estimated total (with 2x dup): ${estimatedTotal.toFixed(2)} MB`)
    console.log(`   Current constant: 50 MB`)
    console.log(`   Headroom: ${(50 - estimatedTotal).toFixed(2)} MB`)

    // Verify we're well under 50MB
    expect(estimatedTotal).toBeLessThan(50)

    // Also verify we're not wasting too much headroom
    // (if estimate < 10MB, we could potentially lower SESSION_SIZE_MB)
    if (estimatedTotal < 10) {
      console.log(`\n   ℹ️  Note: Estimate is low. Could reduce SESSION_SIZE_MB for more sessions.`)
    }

    session.destroy()
  })

  it('measures serialization time', () => {
    const session = new StreamingSession('session_serialize', 'conv_serialize')

    // Measure serialization
    const startSerialize = performance.now()
    const serialized = session.serialize()
    const serializeTime = performance.now() - startSerialize

    const serializedKB = JSON.stringify(serialized).length / 1024

    console.log(`\n📊 Serialization (empty session):`)
    console.log(`   Time: ${serializeTime.toFixed(2)} ms`)
    console.log(`   Size: ${serializedKB.toFixed(1)} KB`)

    // Serialization should be fast (<100ms) for empty session
    expect(serializeTime).toBeLessThan(100)
    // Empty session should be tiny (<10KB)
    expect(serializedKB).toBeLessThan(10)

    session.destroy()
  })
})

describe('Session Limit Recommendations', () => {
  it('prints SESSION_SIZE_MB recommendation based on measurements', () => {
    const sessions: StreamingSession[] = []
    const measurements: number[] = []

    // Create sessions and measure
    for (let i = 0; i < 3; i++) {
      forceGC()
      const beforeMB = getHeapUsedMB()

      const session = new StreamingSession(`session_${i}`, `conv_${i}`)

      const afterMB = getHeapUsedMB()
      measurements.push(afterMB - beforeMB)
      sessions.push(session)
    }

    // Calculate session base overhead
    const avgBaseMB = measurements.reduce((a, b) => a + b, 0) / measurements.length

    // Estimate with message load (100 messages avg)
    const messagesPerSession = 100
    const avgMessageKB = 0.5 // 500 bytes avg
    const messagesMB = (messagesPerSession * avgMessageKB) / 1024

    // Total with duplication factor
    const estimatedPerSession = avgBaseMB + (messagesMB * 2)
    const recommendedMB = Math.ceil(estimatedPerSession * 3) // 3x safety buffer

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📊 SESSION_SIZE_MB Recommendation`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`   Base session overhead: ${avgBaseMB.toFixed(2)} MB`)
    console.log(`   Est. message load (100 msgs): ${messagesMB.toFixed(2)} MB`)
    console.log(`   Est. per session (with dup): ${estimatedPerSession.toFixed(2)} MB`)
    console.log(`   Recommended (3x buffer): ${recommendedMB} MB`)
    console.log(`   Current constant: 50 MB`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    if (recommendedMB > 50) {
      console.log(`\n⚠️  ACTION REQUIRED: Update SESSION_SIZE_MB to ${recommendedMB}`)
    } else {
      console.log(`\n✅ Current SESSION_SIZE_MB (50) is sufficient`)
    }

    // Cleanup
    for (const session of sessions) {
      session.destroy()
    }

    // Sanity check - recommended should be reasonable
    expect(recommendedMB).toBeLessThan(100)
  })
})
