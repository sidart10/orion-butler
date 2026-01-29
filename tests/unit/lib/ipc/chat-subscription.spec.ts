/**
 * Chat Subscription Singleton Tests
 * TDD: Testing the singleton subscription pattern for React Strict Mode
 *
 * The subscribeToChatEvents function uses a singleton pattern to prevent
 * duplicate Tauri event listeners when React Strict Mode double-mounts.
 *
 * Key behaviors:
 * - Ref counting: increment on subscribe, decrement on cleanup
 * - Double cleanup protection: no negative refCount
 * - Handler updates: updateHandlers routes events to new handlers
 * - First subscription: only first call registers Tauri listeners
 * - Full reset: module state resets when refCount hits 0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// These tests need module isolation to test singleton state correctly
// We'll use vi.resetModules() to get fresh module state for each test

describe('subscribeToChatEvents - Singleton', () => {
  // Mock Tauri event API
  const mockListen = vi.fn()
  const mockUnlisten = vi.fn()

  // Track how many times listen was called (proxy for Tauri listener registration)
  let listenCallCount = 0

  beforeEach(async () => {
    vi.resetModules()
    listenCallCount = 0

    // Mock @tauri-apps/api/event
    vi.doMock('@tauri-apps/api/event', () => ({
      listen: vi.fn().mockImplementation(async (eventName, handler) => {
        listenCallCount++
        mockListen(eventName, handler)
        return mockUnlisten
      }),
    }))

    // Mock @tauri-apps/api/core
    vi.doMock('@tauri-apps/api/core', () => ({
      invoke: vi.fn().mockResolvedValue('mocked'),
    }))

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  // ===========================================================================
  // SS-1: Ref count increment
  // ===========================================================================

  describe('SS-1: Ref count increment', () => {
    it('should increment refCount on each subscription call', async () => {
      const { subscribeToChatEvents, getSubscriptionRefCount } = await import(
        '@/lib/ipc/chat'
      )

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // First subscription
      await subscribeToChatEvents(handlers)
      expect(getSubscriptionRefCount()).toBe(1)

      // Second subscription
      await subscribeToChatEvents(handlers)
      expect(getSubscriptionRefCount()).toBe(2)

      // Third subscription
      await subscribeToChatEvents(handlers)
      expect(getSubscriptionRefCount()).toBe(3)
    })
  })

  // ===========================================================================
  // SS-2: Ref count decrement
  // ===========================================================================

  describe('SS-2: Ref count decrement', () => {
    it('should only unsubscribe from Tauri when refCount hits 0', async () => {
      const { subscribeToChatEvents, getSubscriptionRefCount } = await import(
        '@/lib/ipc/chat'
      )

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // Two subscriptions
      const cleanup1 = await subscribeToChatEvents(handlers)
      const cleanup2 = await subscribeToChatEvents(handlers)

      expect(getSubscriptionRefCount()).toBe(2)

      // First cleanup - should NOT call unlisten yet
      cleanup1()
      expect(getSubscriptionRefCount()).toBe(1)
      expect(mockUnlisten).not.toHaveBeenCalled()

      // Second cleanup - NOW should call unlisten
      cleanup2()
      expect(getSubscriptionRefCount()).toBe(0)
      // Each event type should be unlistened (6 events)
      expect(mockUnlisten).toHaveBeenCalledTimes(6)
    })
  })

  // ===========================================================================
  // SS-3: Double cleanup protection
  // ===========================================================================

  describe('SS-3: Double cleanup protection', () => {
    it('should not go negative when cleanup called twice', async () => {
      const { subscribeToChatEvents, getSubscriptionRefCount } = await import(
        '@/lib/ipc/chat'
      )

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      const cleanup = await subscribeToChatEvents(handlers)
      expect(getSubscriptionRefCount()).toBe(1)

      // First cleanup - normal
      cleanup()
      expect(getSubscriptionRefCount()).toBe(0)

      // Second cleanup - should be no-op, not go negative
      cleanup()
      expect(getSubscriptionRefCount()).toBe(0)
    })
  })

  // ===========================================================================
  // SS-4: Handler update
  // ===========================================================================

  describe('SS-4: Handler update', () => {
    it('should update handlers via buffer.updateHandlers on second subscription', async () => {
      const { subscribeToChatEvents, getEventBuffer } = await import(
        '@/lib/ipc/chat'
      )

      const handlers1 = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      const handlers2 = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // First subscription
      await subscribeToChatEvents(handlers1)

      // Get the buffer and spy on updateHandlers
      const buffer = getEventBuffer(handlers1)
      const updateHandlersSpy = vi.spyOn(buffer, 'updateHandlers')

      // Second subscription with different handlers
      await subscribeToChatEvents(handlers2)

      // updateHandlers should have been called with handlers2
      expect(updateHandlersSpy).toHaveBeenCalledWith(handlers2)
    })
  })

  // ===========================================================================
  // SS-5: First subscription registers listeners
  // ===========================================================================

  describe('SS-5: First subscription registers listeners', () => {
    it('should only register Tauri listeners once', async () => {
      const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // First subscription - should register 6 listeners
      await subscribeToChatEvents(handlers)
      expect(listenCallCount).toBe(6)

      // Second subscription - should NOT register more listeners
      await subscribeToChatEvents(handlers)
      expect(listenCallCount).toBe(6) // Still 6, not 12
    })

    it('should register all 6 event types', async () => {
      const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      await subscribeToChatEvents(handlers)

      expect(mockListen).toHaveBeenCalledWith(
        'orion://message/start',
        expect.any(Function)
      )
      expect(mockListen).toHaveBeenCalledWith(
        'orion://message/chunk',
        expect.any(Function)
      )
      expect(mockListen).toHaveBeenCalledWith(
        'orion://tool/start',
        expect.any(Function)
      )
      expect(mockListen).toHaveBeenCalledWith(
        'orion://tool/complete',
        expect.any(Function)
      )
      expect(mockListen).toHaveBeenCalledWith(
        'orion://session/complete',
        expect.any(Function)
      )
      expect(mockListen).toHaveBeenCalledWith(
        'orion://session/error',
        expect.any(Function)
      )
    })
  })

  // ===========================================================================
  // SS-6: Full reset
  // ===========================================================================

  describe('SS-6: Full reset', () => {
    it('should reset all module state when refCount hits 0', async () => {
      const { subscribeToChatEvents, getSubscriptionRefCount } = await import(
        '@/lib/ipc/chat'
      )

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // Subscribe and cleanup
      const cleanup = await subscribeToChatEvents(handlers)
      cleanup()

      expect(getSubscriptionRefCount()).toBe(0)

      // Clear mock call counts
      mockListen.mockClear()

      // New subscription should register listeners again (fresh start)
      await subscribeToChatEvents(handlers)

      // Should register 6 new listeners (not reuse old ones)
      expect(mockListen).toHaveBeenCalledTimes(6)
    })

    it('should reset event buffer when refCount hits 0', async () => {
      const { subscribeToChatEvents, getEventBuffer } = await import(
        '@/lib/ipc/chat'
      )

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // Subscribe
      await subscribeToChatEvents(handlers)

      // Get buffer and add some state
      const buffer1 = getEventBuffer(handlers)
      buffer1.setCurrentRequest('req_old')

      // Cleanup (should reset buffer)
      const cleanup = await subscribeToChatEvents(handlers)
      cleanup()
      cleanup() // Trigger actual cleanup

      // New subscription should have fresh buffer
      await subscribeToChatEvents(handlers)
      const buffer2 = getEventBuffer(handlers)

      // Old request ID should be cleared
      expect(buffer2.getCurrentRequestId()).toBeNull()
    })
  })

  // ===========================================================================
  // React Strict Mode Simulation
  // ===========================================================================

  describe('React Strict Mode simulation', () => {
    it('should handle mount-unmount-mount cycle correctly', async () => {
      const { subscribeToChatEvents, getSubscriptionRefCount } = await import(
        '@/lib/ipc/chat'
      )

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // First mount
      const cleanup1 = await subscribeToChatEvents(handlers)
      expect(getSubscriptionRefCount()).toBe(1)
      expect(listenCallCount).toBe(6)

      // First unmount (React Strict Mode)
      cleanup1()
      expect(getSubscriptionRefCount()).toBe(0)

      // Second mount (React Strict Mode remount)
      const cleanup2 = await subscribeToChatEvents(handlers)
      expect(getSubscriptionRefCount()).toBe(1)
      // Listeners should be re-registered after full cleanup
      expect(listenCallCount).toBe(12) // 6 from first mount + 6 from remount

      // Final cleanup
      cleanup2()
      expect(getSubscriptionRefCount()).toBe(0)
    })

    it('should handle rapid mount-unmount without full cleanup', async () => {
      const { subscribeToChatEvents, getSubscriptionRefCount } = await import(
        '@/lib/ipc/chat'
      )

      const handlers = {
        onMessageStart: vi.fn(),
        onMessageChunk: vi.fn(),
        onToolStart: vi.fn(),
        onToolComplete: vi.fn(),
        onSessionComplete: vi.fn(),
        onError: vi.fn(),
      }

      // Simulate: mount -> mount -> unmount -> unmount
      // (rapid remount before first cleanup completes)
      const cleanup1 = await subscribeToChatEvents(handlers)
      const cleanup2 = await subscribeToChatEvents(handlers)

      expect(getSubscriptionRefCount()).toBe(2)
      expect(listenCallCount).toBe(6) // Still only 6 - singleton!

      cleanup1()
      expect(getSubscriptionRefCount()).toBe(1)
      expect(mockUnlisten).not.toHaveBeenCalled() // Not 0 yet

      cleanup2()
      expect(getSubscriptionRefCount()).toBe(0)
      expect(mockUnlisten).toHaveBeenCalledTimes(6) // Now cleanup
    })
  })
})
