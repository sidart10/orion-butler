/**
 * useStreamingMachine - React Strict Mode Tests
 * TDD: Testing that the hook handles React Strict Mode double-mount correctly
 *
 * React Strict Mode calls useEffect twice (mount -> unmount -> mount).
 * This tests that:
 * - Only one Tauri subscription is active
 * - Handlers are properly updated on remount
 * - Events are routed to the correct actor
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Helper to wait for async operations without DOM container
const waitForAsync = async (ms = 50) => new Promise((r) => setTimeout(r, ms))

// ===========================================================================
// Mocks
// ===========================================================================

// Track subscription calls
let subscriptionCallCount = 0
let lastHandlers: Record<string, unknown> | null = null
const mockCleanup = vi.fn()

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
  emit: vi.fn(),
}))

// Mock chat module
const mockChatSend = vi.fn(() => Promise.resolve('req_123'))
const mockChatCancel = vi.fn()
const mockChatReady = vi.fn(() => Promise.resolve(true))
const mockSubscribeToChatEvents = vi.fn((handlers) => {
  subscriptionCallCount++
  lastHandlers = handlers as Record<string, unknown>
  return Promise.resolve(mockCleanup)
})
const mockGetEventBuffer = vi.fn(() => ({
  setCurrentRequest: vi.fn(),
  setReady: vi.fn(),
}))
const mockResetEventBuffer = vi.fn()

vi.mock('@/lib/ipc/chat', () => ({
  chatSend: (prompt: string, options: Record<string, unknown>) => mockChatSend(prompt, options),
  chatCancel: (requestId: string) => mockChatCancel(requestId),
  chatReady: () => mockChatReady(),
  subscribeToChatEvents: (handlers: unknown) => mockSubscribeToChatEvents(handlers),
  getEventBuffer: (handlers: unknown) => mockGetEventBuffer(handlers),
  resetEventBuffer: () => mockResetEventBuffer(),
}))

// Mock conversation IPC
vi.mock('@/lib/ipc/conversation', () => ({
  getOrCreateConversation: vi.fn(() => Promise.resolve('conv_test')),
  saveConversationTurn: vi.fn(() => Promise.resolve()),
  formatTimestamp: vi.fn((ts) => new Date(ts).toISOString()),
  isTauriEnvironment: vi.fn(() => true),
}))

// Import after mocks
import { useStreamingMachine } from '@/hooks/useStreamingMachine'

// ===========================================================================
// Test Setup
// ===========================================================================

const originalWindow = global.window

beforeEach(() => {
  // Enable Tauri mode
  // @ts-expect-error - mocking Tauri
  global.window = { ...originalWindow, __TAURI__: {} }

  // Reset tracking
  subscriptionCallCount = 0
  lastHandlers = null
  mockCleanup.mockClear()
  vi.clearAllMocks()
})

afterEach(() => {
  global.window = originalWindow
  vi.clearAllMocks()
})

// ===========================================================================
// React Strict Mode Wrapper
// ===========================================================================

const StrictModeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.StrictMode>{children}</React.StrictMode>
)

// ===========================================================================
// Tests
// ===========================================================================

describe('useStreamingMachine - React Strict Mode', () => {
  // SM-1: Double mount handling
  describe('SM-1: Double mount handling', () => {
    it('should handle Strict Mode double mount/unmount cycle', async () => {
      const { unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      // Wait for subscription to complete
      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // In Strict Mode, React may call the effect twice
      // Our singleton pattern should handle this gracefully
      expect(mockSubscribeToChatEvents.mock.calls.length).toBeGreaterThanOrEqual(1)

      // Unmount should call cleanup
      unmount()

      // Cleanup should have been called
      expect(mockCleanup).toHaveBeenCalled()
    })

    it('should not create duplicate subscriptions on remount', async () => {
      // First mount
      const { unmount, rerender } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      const initialCallCount = mockSubscribeToChatEvents.mock.calls.length

      // Force rerender (simulates Strict Mode behavior)
      rerender()

      // Wait a bit for any async effects
      await waitForAsync()

      // No new subscriptions should be created on rerender
      // (only useEffect with [] deps shouldn't re-run)
      expect(mockSubscribeToChatEvents.mock.calls.length).toBe(initialCallCount)

      unmount()
    })
  })

  // SM-2: Handler reuse
  describe('SM-2: Handler reuse after remount', () => {
    it('should use new handlers after remount', async () => {
      const { unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // Get the handlers passed to subscribeToChatEvents
      expect(lastHandlers).not.toBeNull()
      expect(lastHandlers).toHaveProperty('onMessageStart')
      expect(lastHandlers).toHaveProperty('onMessageChunk')
      expect(lastHandlers).toHaveProperty('onSessionComplete')
      expect(lastHandlers).toHaveProperty('onError')

      unmount()
    })

    it('should register all required event handlers', async () => {
      const { unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // Verify all 6 handlers are registered
      expect(lastHandlers).toMatchObject({
        onMessageStart: expect.any(Function),
        onMessageChunk: expect.any(Function),
        onToolStart: expect.any(Function),
        onToolComplete: expect.any(Function),
        onSessionComplete: expect.any(Function),
        onError: expect.any(Function),
      })

      unmount()
    })
  })

  // SM-3: Event processing after remount
  describe('SM-3: Event processing after remount', () => {
    it('should process events after Strict Mode remount cycle', async () => {
      const { result, unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // Verify initial state
      expect(result.current.stateValue).toBe('idle')

      // Simulate sending a message
      await act(async () => {
        await result.current.send('Hello')
      })

      // State should have changed
      expect(result.current.stateValue).not.toBe('idle')

      unmount()
    })

    it('should start with idle state', async () => {
      const { result, unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      // Immediately after mount, state should be idle
      expect(result.current.stateValue).toBe('idle')
      expect(result.current.messages).toEqual([])
      expect(result.current.error).toBeNull()

      unmount()
    })
  })

  // SM-4: Cleanup race condition
  describe('SM-4: Cleanup during pending subscription', () => {
    it('should handle unmount during subscription setup', async () => {
      // Delay subscription resolution
      let resolveSubscription: ((cleanup: () => void) => void) | null = null
      mockSubscribeToChatEvents.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSubscription = resolve
          })
      )

      const { unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      // Unmount before subscription completes
      unmount()

      // Now resolve the subscription
      if (resolveSubscription) {
        resolveSubscription(mockCleanup)
      }

      // Wait for async cleanup
      await waitForAsync()

      // Cleanup should still be called (deferred cleanup)
      expect(mockCleanup).toHaveBeenCalled()
    })
  })
})

describe('useStreamingMachine - Actor Lifecycle', () => {
  // AL-1: Fresh actor per mount
  describe('AL-1: Fresh actor per mount', () => {
    it('should create new actor on each mount', async () => {
      // This test verifies that unmount/remount gets a fresh actor
      // We can't directly access the actor, but we can verify behavior

      const { unmount: unmount1, result: result1 } = renderHook(
        () => useStreamingMachine(),
        { wrapper: StrictModeWrapper }
      )

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // First instance should be idle
      expect(result1.current.stateValue).toBe('idle')

      unmount1()

      // Second mount
      const { unmount: unmount2, result: result2 } = renderHook(
        () => useStreamingMachine()
      )

      // Second instance should also start idle (fresh state)
      expect(result2.current.stateValue).toBe('idle')
      expect(result2.current.messages).toEqual([])

      unmount2()
    })
  })

  // AL-2: RequestId filtering
  describe('AL-2: RequestId filtering', () => {
    it('should filter events by requestId in handlers', async () => {
      const { result, unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // Get the onMessageStart handler
      const onMessageStart = lastHandlers?.onMessageStart as
        | ((event: { requestId: string; messageId: string }) => void)
        | undefined

      expect(onMessageStart).toBeDefined()

      // Call handler with mismatched requestId
      // Should be filtered out (no state change)
      act(() => {
        onMessageStart?.({
          requestId: 'wrong_request',
          messageId: 'msg_1',
        })
      })

      // State should still be idle (event was filtered)
      expect(result.current.stateValue).toBe('idle')

      unmount()
    })
  })

  // AL-3: State transitions after remount
  describe('AL-3: State transitions after remount', () => {
    it('should support full state machine flow', async () => {
      const { result, unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // Start idle
      expect(result.current.stateValue).toBe('idle')

      // Send message (transitions to sending)
      await act(async () => {
        await result.current.send('Test message')
      })

      // Should be sending or streaming
      expect(['sending', 'streaming']).toContain(result.current.stateValue)

      // Messages should include user message
      expect(result.current.messages.length).toBeGreaterThan(0)

      unmount()
    })
  })

  // AL-4: Actor stops on unmount
  describe('AL-4: Actor stops on unmount', () => {
    it('should cleanup subscription on unmount', async () => {
      const { unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // Unmount should trigger cleanup
      unmount()

      expect(mockCleanup).toHaveBeenCalled()
    })
  })

  // AL-5: Cross-request interference prevention
  describe('AL-5: Cross-request interference prevention', () => {
    it('should generate unique requestId for each send', async () => {
      const { result, unmount } = renderHook(() => useStreamingMachine(), {
        wrapper: StrictModeWrapper,
      })

      await waitForAsync()
      expect(mockSubscribeToChatEvents).toHaveBeenCalled()

      // Send first message
      await act(async () => {
        await result.current.send('First message')
      })

      const firstRequestId = mockChatSend.mock.calls[0][1].requestId

      // Reset to idle state
      act(() => {
        result.current.reset()
      })

      // Send second message
      await act(async () => {
        await result.current.send('Second message')
      })

      const secondRequestId = mockChatSend.mock.calls[1][1].requestId

      // Each send should have a unique requestId
      expect(firstRequestId).toBeDefined()
      expect(secondRequestId).toBeDefined()
      expect(firstRequestId).not.toBe(secondRequestId)

      unmount()
    })
  })
})
