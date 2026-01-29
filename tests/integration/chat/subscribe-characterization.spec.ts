/**
 * Characterization Tests for subscribeToChatEvents
 *
 * CRITICAL: These tests document the CURRENT behavior.
 * If these tests fail after changes, it indicates a breaking behavior change.
 *
 * Purpose: Document singleton subscription pattern with event buffering.
 *
 * Current behavior (as of 2026-01-28, post-singleton refactor):
 * - Always registers all 6 listeners regardless of handlers provided (singleton)
 * - Singleton pattern ensures single subscription to Tauri events
 * - Returns a cleanup function that calls all 6 unlisten functions
 * - Event names follow orion:// namespace
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We need to use vi.doMock for dynamic module mocking
// This allows us to reset the mock between tests

describe('subscribeToChatEvents - CURRENT behavior (characterization)', () => {
  let mockListen: ReturnType<typeof vi.fn>
  let mockUnlisten: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset modules before each test to ensure clean state
    vi.resetModules()

    // Create fresh mocks
    mockUnlisten = vi.fn()
    mockListen = vi.fn().mockResolvedValue(mockUnlisten)

    // Mock Tauri event module
    vi.doMock('@tauri-apps/api/event', () => ({
      listen: mockListen,
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should register 6 event listeners when all handlers provided', async () => {
    // Import after mock is set up
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    await subscribeToChatEvents({
      onMessageStart: vi.fn(),
      onMessageChunk: vi.fn(),
      onToolStart: vi.fn(),
      onToolComplete: vi.fn(),
      onSessionComplete: vi.fn(),
      onError: vi.fn(),
    })

    // CURRENT behavior: 6 listeners for 6 handlers
    expect(mockListen).toHaveBeenCalledTimes(6)

    // Verify exact event names (orion:// namespace)
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

  it('should return cleanup function that unregisters all listeners', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const cleanup = await subscribeToChatEvents({
      onMessageStart: vi.fn(),
      onMessageChunk: vi.fn(),
      onToolStart: vi.fn(),
      onToolComplete: vi.fn(),
      onSessionComplete: vi.fn(),
      onError: vi.fn(),
    })

    // Cleanup not called yet
    expect(mockUnlisten).not.toHaveBeenCalled()

    // Call cleanup
    cleanup()

    // CURRENT behavior: cleanup calls all 6 unlisten functions
    expect(mockUnlisten).toHaveBeenCalledTimes(6)
  })

  it('should register all 6 listeners even when partial handlers provided (singleton pattern)', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    await subscribeToChatEvents({
      onMessageStart: vi.fn(),
      onMessageChunk: vi.fn(),
      // Omit other handlers - but singleton always registers all
    })

    // CURRENT behavior (post-singleton): always registers all 6 listeners
    // This ensures the singleton can dispatch to any handler when added later
    expect(mockListen).toHaveBeenCalledTimes(6)
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
  })

  it('should cleanup all 6 listeners when partial handlers provided (singleton pattern)', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const cleanup = await subscribeToChatEvents({
      onMessageStart: vi.fn(),
      onMessageChunk: vi.fn(),
    })

    cleanup()

    // CURRENT behavior (post-singleton): cleans up all 6 listeners
    // Singleton manages all listeners regardless of which handlers were provided
    expect(mockUnlisten).toHaveBeenCalledTimes(6)
  })

  it('should register all listeners even when empty handlers object provided (singleton pattern)', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const cleanup = await subscribeToChatEvents({})

    // CURRENT behavior (post-singleton): always registers all 6 listeners
    // Singleton sets up infrastructure regardless of initial handlers
    expect(mockListen).toHaveBeenCalledTimes(6)

    // Cleanup unregisters all
    cleanup()
    expect(mockUnlisten).toHaveBeenCalledTimes(6)
  })

  it('should pass event payload to handler (not raw event)', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const onMessageStart = vi.fn()
    let capturedCallback: ((event: unknown) => void) | undefined

    // Capture the callback passed to listen
    mockListen.mockImplementation(
      async (
        eventName: string,
        callback: (event: unknown) => void
      ) => {
        if (eventName === 'orion://message/start') {
          capturedCallback = callback
        }
        return mockUnlisten
      }
    )

    await subscribeToChatEvents({ onMessageStart })

    // Simulate Tauri event (raw event has payload wrapper)
    const rawEvent = {
      event: 'orion://message/start',
      windowLabel: 'main',
      payload: {
        requestId: 'req_123',
        messageId: 'msg_456',
      },
    }

    capturedCallback?.(rawEvent)

    // CURRENT behavior: handler receives payload, not raw event
    expect(onMessageStart).toHaveBeenCalledWith({
      requestId: 'req_123',
      messageId: 'msg_456',
    })
  })

  it('should handle MessageChunk events with correct payload structure', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const onMessageChunk = vi.fn()
    let capturedCallback: ((event: unknown) => void) | undefined

    mockListen.mockImplementation(
      async (
        eventName: string,
        callback: (event: unknown) => void
      ) => {
        if (eventName === 'orion://message/chunk') {
          capturedCallback = callback
        }
        return mockUnlisten
      }
    )

    await subscribeToChatEvents({ onMessageChunk })

    const rawEvent = {
      event: 'orion://message/chunk',
      payload: {
        requestId: 'req_123',
        type: 'text',
        content: 'Hello world',
        isPartial: true,
      },
    }

    capturedCallback?.(rawEvent)

    expect(onMessageChunk).toHaveBeenCalledWith({
      requestId: 'req_123',
      type: 'text',
      content: 'Hello world',
      isPartial: true,
    })
  })

  it('should handle ToolStart events with correct payload structure', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const onToolStart = vi.fn()
    let capturedCallback: ((event: unknown) => void) | undefined

    mockListen.mockImplementation(
      async (
        eventName: string,
        callback: (event: unknown) => void
      ) => {
        if (eventName === 'orion://tool/start') {
          capturedCallback = callback
        }
        return mockUnlisten
      }
    )

    await subscribeToChatEvents({ onToolStart })

    const rawEvent = {
      event: 'orion://tool/start',
      payload: {
        requestId: 'req_123',
        toolId: 'tool_789',
        name: 'Bash',
        input: { command: 'ls -la' },
      },
    }

    capturedCallback?.(rawEvent)

    expect(onToolStart).toHaveBeenCalledWith({
      requestId: 'req_123',
      toolId: 'tool_789',
      name: 'Bash',
      input: { command: 'ls -la' },
    })
  })

  it('should handle ToolComplete events with isError field', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const onToolComplete = vi.fn()
    let capturedCallback: ((event: unknown) => void) | undefined

    mockListen.mockImplementation(
      async (
        eventName: string,
        callback: (event: unknown) => void
      ) => {
        if (eventName === 'orion://tool/complete') {
          capturedCallback = callback
        }
        return mockUnlisten
      }
    )

    await subscribeToChatEvents({ onToolComplete })

    const rawEvent = {
      event: 'orion://tool/complete',
      payload: {
        requestId: 'req_123',
        toolId: 'tool_789',
        result: { output: 'file.txt' },
        isError: false,
      },
    }

    capturedCallback?.(rawEvent)

    expect(onToolComplete).toHaveBeenCalledWith({
      requestId: 'req_123',
      toolId: 'tool_789',
      result: { output: 'file.txt' },
      isError: false,
    })
  })

  it('should handle SessionComplete events with metrics', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const onSessionComplete = vi.fn()
    let capturedCallback: ((event: unknown) => void) | undefined

    mockListen.mockImplementation(
      async (
        eventName: string,
        callback: (event: unknown) => void
      ) => {
        if (eventName === 'orion://session/complete') {
          capturedCallback = callback
        }
        return mockUnlisten
      }
    )

    await subscribeToChatEvents({ onSessionComplete })

    const rawEvent = {
      event: 'orion://session/complete',
      payload: {
        requestId: 'req_123',
        sessionId: 'sess_456',
        costUsd: 0.0025,
        tokenCount: 1500,
        durationMs: 3200,
      },
    }

    capturedCallback?.(rawEvent)

    expect(onSessionComplete).toHaveBeenCalledWith({
      requestId: 'req_123',
      sessionId: 'sess_456',
      costUsd: 0.0025,
      tokenCount: 1500,
      durationMs: 3200,
    })
  })

  it('should handle SessionError events with recoverable flag', async () => {
    const { subscribeToChatEvents } = await import('@/lib/ipc/chat')

    const onError = vi.fn()
    let capturedCallback: ((event: unknown) => void) | undefined

    mockListen.mockImplementation(
      async (
        eventName: string,
        callback: (event: unknown) => void
      ) => {
        if (eventName === 'orion://session/error') {
          capturedCallback = callback
        }
        return mockUnlisten
      }
    )

    await subscribeToChatEvents({ onError })

    const rawEvent = {
      event: 'orion://session/error',
      payload: {
        requestId: 'req_123',
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        recoverable: true,
        retryAfterMs: 5000,
      },
    }

    capturedCallback?.(rawEvent)

    expect(onError).toHaveBeenCalledWith({
      requestId: 'req_123',
      code: 'RATE_LIMITED',
      message: 'Too many requests',
      recoverable: true,
      retryAfterMs: 5000,
    })
  })
})
