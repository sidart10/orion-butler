/**
 * useStreamingMachineWrapper - Backward Compatible Wrapper
 * Phase 1: Concurrent Sessions - Task 1.5
 *
 * This hook provides backward compatibility with existing components
 * while delegating to SessionManager for session lifecycle management.
 *
 * Key Features:
 * - Maintains same API as existing useStreamingMachine
 * - Delegates to SessionManager.getOrCreateStreamingSession()
 * - REACT BP: Properly cleans up subscriptions on unmount
 * - REACT BP: Re-subscribes when activeSessionId changes
 *
 * Pre-Mortem Mitigations:
 * - TIGER-D: Cleanup subscriptions on unmount (useEffect return function)
 * - TIGER-G: Handle sessionId changes (re-subscribe with cleanup)
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { SessionManager } from '@/lib/sdk/session-manager'
import { StreamingSession } from '@/lib/sdk/streaming-session'
import { useSessionStore } from '@/stores/sessionStore'
import { getOrCreateConversation, updateSdkSessionId } from '@/lib/ipc/conversation'
import type { ChatMessage, ToolUse, SessionInfo } from '@/machines/streamingMachine'
import type { ChatQueryOptions } from '@/lib/ipc/chat'

// =============================================================================
// SessionManager Factory
// =============================================================================

/**
 * Create a SessionManager instance
 * Called fresh each time to support test mocking
 * In production, this creates a real SessionManager with minimal store
 */
function createSessionManager(): SessionManager {
  // SessionManager requires a SessionStore, but for the wrapper
  // we only need the streaming session methods, not persistence
  // Use a mock/minimal store since we're only using streaming session methods
  return new SessionManager({
    // Minimal implementation - streaming sessions don't need these methods
    initialize: async () => {},
    save: async () => {},
    get: async () => null,
    list: async () => [],
    listActive: async () => [],
    findTodaysDailySession: async () => null,
    findSessionToResume: async () => null,
    findByProjectId: async () => null,
    updateActivity: async () => {},
    setActive: async () => {},
  } as unknown as import('@/lib/sdk/session-store').SessionStore)
}

// =============================================================================
// Return Type (backward compatible with useStreamingMachine)
// =============================================================================

interface UseStreamingMachineReturn {
  /** Current state value (idle, sending, streaming, complete, error) */
  stateValue: string
  /** All messages in the conversation */
  messages: ChatMessage[]
  /** Whether the machine is currently streaming */
  isStreaming: boolean
  /** Whether the machine is sending a message */
  isSending: boolean
  /** Current error, if any */
  error: Error | null
  /** Active tool uses */
  toolUses: ToolUse[]
  /** Session info (after complete) */
  session: SessionInfo | null
  /** Save error, if conversation persistence failed */
  saveError: string | null
  /** Clear the save error state */
  clearSaveError: () => void
  /** Whether budget warning has been triggered */
  budgetWarning: boolean
  /** Current thinking content */
  currentThinking: string
  /** Current retry attempt (0-based) */
  retryAttempt: number
  /** Send a new message */
  send: (prompt: string, options?: ChatQueryOptions) => Promise<void>
  /** Cancel the current request */
  cancel: () => Promise<void>
  /** Retry after an error */
  retry: () => void
  /** Reset the conversation */
  reset: () => void
  /** Load messages from a session (for session switching) */
  loadMessages: (messages: ChatMessage[]) => void
}

// =============================================================================
// Default State
// =============================================================================

const DEFAULT_STATE = {
  value: 'idle',
  context: {
    messages: [] as ChatMessage[],
    error: null as Error | null,
    toolUses: [] as ToolUse[],
    session: null as SessionInfo | null,
    budgetWarning: false,
    currentThinking: '',
    retryAttempt: 0,
    pendingUserMessage: null,
    sdkSessionId: null,
  },
}

// =============================================================================
// Environment Detection
// =============================================================================

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Backward-compatible wrapper for useStreamingMachine
 * Delegates to SessionManager for session lifecycle management
 */
export function useStreamingMachineWrapper(): UseStreamingMachineReturn {
  // Get activeSessionId from store
  const activeSessionId = useSessionStore((state) => state.activeSession?.id ?? null)

  // TIGER-1: Get conversationId from activeSession (when available)
  const activeSessionConversationId = useSessionStore(
    (state) => state.activeSession?.conversationId ?? null
  )

  // Track conversation ID
  const conversationIdRef = useRef<string | null>(null)
  const conversationIdPromiseRef = useRef<Promise<string> | null>(null)

  // Track current session for methods
  const sessionRef = useRef<StreamingSession | null>(null)

  // TIGER-6: Track previous session ID for cleanup on switch
  // This prevents MAX_SESSIONS_PHASE1 limit errors
  const previousSessionIdRef = useRef<string | null>(null)

  // State from streaming session snapshot
  const [snapshot, setSnapshot] = useState<typeof DEFAULT_STATE>(DEFAULT_STATE)

  // Initialization error (for session creation failures)
  const [initError, setInitError] = useState<Error | null>(null)

  // Save error tracking
  const [saveError, setSaveError] = useState<string | null>(null)

  // Track if component is mounted (for handling async operations after unmount)
  const mountedRef = useRef(true)

  // Initialize conversation ID
  useEffect(() => {
    if (isTauri() && !conversationIdRef.current && !conversationIdPromiseRef.current) {
      conversationIdPromiseRef.current = getOrCreateConversation('adhoc')
        .then((id) => {
          if (mountedRef.current) {
            conversationIdRef.current = id
          }
          conversationIdPromiseRef.current = null
          return id
        })
        .catch((err) => {
          conversationIdPromiseRef.current = null
          console.warn('[useStreamingMachineWrapper] Failed to init conversation:', err)
          throw err
        })
    }
  }, [])

  // Main effect: Get/create streaming session and subscribe
  useEffect(() => {
    // Guard: Need activeSessionId to proceed
    if (!activeSessionId) {
      return
    }

    // REACT BP: Store cleanup function for proper cleanup on unmount
    let unsubscribe: (() => void) | null = null
    let cancelled = false // Track if effect was cleaned up before async completed

    // Get conversation ID (use existing or generate)
    // TIGER-1: Prioritize activeSession.conversationId from backend
    const getConversationId = async (): Promise<string> => {
      // TIGER-1 FIX: Use conversationId from activeSession if available
      // This is the primary source of truth (loaded from backend via load_session)
      if (activeSessionConversationId) {
        conversationIdRef.current = activeSessionConversationId
        return activeSessionConversationId
      }

      // Fallback: Use existing ref if already set
      if (conversationIdRef.current) {
        return conversationIdRef.current
      }

      // Wait for in-flight creation
      if (conversationIdPromiseRef.current) {
        return conversationIdPromiseRef.current
      }

      // Create new conversation (only for new sessions without conversationId)
      if (isTauri()) {
        conversationIdPromiseRef.current = getOrCreateConversation('adhoc')
        const id = await conversationIdPromiseRef.current
        conversationIdRef.current = id
        conversationIdPromiseRef.current = null
        return id
      }

      // Fallback for non-Tauri (testing)
      return `conv_${activeSessionId}_${Date.now()}`
    }

    // Async setup function
    const setup = async () => {
      try {
        // TIGER-6 FIX: Destroy previous session FIRST (properly awaited)
        // This prevents MAX_SESSIONS_PHASE1 limit errors during rapid switching
        const oldSessionId = previousSessionIdRef.current
        if (oldSessionId && oldSessionId !== activeSessionId) {
          const sessionManager = createSessionManager()
          const oldSession = sessionManager.getStreamingSession(oldSessionId)

          // Cancel in-flight request if any (prevents orphaned responses)
          if (oldSession?.hasActiveRequest()) {
            if (process.env.NODE_ENV !== 'production') {
              console.log(
                `[useStreamingMachineWrapper] TIGER-6: Cancelling in-flight request for ${oldSessionId}`
              )
            }
            await oldSession.cancel()
          }

          // Await destroy to ensure it completes before creating new session
          await sessionManager.destroyStreamingSession(oldSessionId, { force: true })

          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[useStreamingMachineWrapper] TIGER-6: Destroyed old session ${oldSessionId}`
            )
          }
        }

        // Check cancelled after destroy await
        if (cancelled) {
          return
        }

        const conversationId = await getConversationId()

        // FIX: Check if cancelled after EVERY async operation
        if (cancelled) {
          return
        }

        // Get or create streaming session via SessionManager
        // Create fresh instance to support test mocking
        const sessionManager = createSessionManager()
        const streamingSession = await sessionManager.getOrCreateStreamingSession(
          activeSessionId,
          conversationId
        )

        // FIX: Check if cancelled after async - if so, don't subscribe
        if (cancelled) {
          // Setup completed but component unmounted/session changed - don't subscribe
          return
        }

        // Store session reference for methods
        sessionRef.current = streamingSession

        // FIX: Check cancelled BEFORE subscribing to prevent subscription after cleanup started
        if (cancelled) {
          sessionRef.current = null
          return
        }

        // TIGER-5: Track if we've already persisted sdkSessionId to avoid duplicate calls
        let sdkSessionIdPersisted = false
        const activeSessionSdkId = useSessionStore.getState().activeSession?.sdkSessionId

        // REACT BP: Subscribe to state changes and store unsubscribe function
        unsubscribe = streamingSession.subscribe((state) => {
          // FIX: Check mountedRef AND cancelled flag to prevent state updates after cleanup
          if (!mountedRef.current || cancelled) {
            return
          }

          // Update local state from session snapshot
          const typedState = state as typeof DEFAULT_STATE
          setSnapshot(typedState)

          // TIGER-5 FIX: Persist sdkSessionId when it first appears
          // This enables Claude to resume the session with memory intact on subsequent messages
          const snapshotSdkId = typedState.context?.sdkSessionId
          if (
            snapshotSdkId &&                          // SDK returned a sessionId
            !sdkSessionIdPersisted &&                 // Haven't persisted yet in this session
            snapshotSdkId !== activeSessionSdkId      // Different from what was loaded from DB
          ) {
            sdkSessionIdPersisted = true
            const activeSession = useSessionStore.getState().activeSession
            const convId = activeSession?.conversationId

            if (convId) {
              updateSdkSessionId(convId, snapshotSdkId)
                .then(() => {
                  if (process.env.NODE_ENV !== 'production') {
                    console.log(
                      `[useStreamingMachineWrapper] TIGER-5: Persisted sdkSessionId ${snapshotSdkId} for conversation ${convId}`
                    )
                  }
                })
                .catch((err) => {
                  console.error('[useStreamingMachineWrapper] Failed to persist sdkSessionId:', err)
                })
            }
          }
        })

        // TIGER-2 FIX: Load messages from activeSession into the XState machine
        // This ensures switched sessions show their historical messages immediately
        const activeSession = useSessionStore.getState().activeSession
        if (activeSession?.messages && activeSession.messages.length > 0 && !cancelled) {
          // Convert stored messages to ChatMessage format expected by the machine
          const chatMessages = activeSession.messages.map((msg) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
          }))

          streamingSession.loadMessages(chatMessages)

          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[useStreamingMachineWrapper] TIGER-2: Loaded ${chatMessages.length} messages for session ${activeSessionId}`
            )
          }
        }

        // Clear any init error on success
        if (mountedRef.current && !cancelled) {
          setInitError(null)
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('[useStreamingMachineWrapper] Session created/resumed:', activeSessionId)
        }

        // TIGER-6: Update previousSessionIdRef after successful session creation
        // This is used to know which session to destroy on next switch
        previousSessionIdRef.current = activeSessionId
      } catch (err) {
        // Handle session creation failure
        if (!cancelled && mountedRef.current) {
          console.error('[useStreamingMachineWrapper] Failed to create session:', err)
          setInitError(err instanceof Error ? err : new Error(String(err)))
        }
      }
    }

    // Start async setup (TIGER-6 destroy is now inside setup() for proper sequencing)
    setup()

    // REACT BP: Cleanup subscription on unmount or dependency change
    return () => {
      cancelled = true
      // FIX: Clear sessionRef.current in cleanup to prevent stale references
      sessionRef.current = null
      if (unsubscribe) {
        unsubscribe()
        // TASK-13: Log cleanup completion (non-production only)
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[useStreamingMachineWrapper] Cleanup complete: sessionId=${activeSessionId}`
          )
        }
      }
    }
  }, [activeSessionId, activeSessionConversationId]) // Re-run when session or conversationId changes (TIGER-G, TIGER-1)

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Extract state values from snapshot
  const context = snapshot.context
  const stateValue = typeof snapshot.value === 'string' ? snapshot.value : 'idle'

  // Derive boolean states from stateValue
  const isStreaming = stateValue === 'streaming'
  const isSending = stateValue === 'sending'

  // Combine init error with context error
  const error = initError || context.error

  // ==========================================================================
  // Action Methods
  // ==========================================================================

  const send = useCallback(async (prompt: string, _options?: ChatQueryOptions) => {
    const session = sessionRef.current
    if (!session) {
      throw new Error('Session not initialized')
    }
    await session.send(prompt)
  }, [])

  const cancel = useCallback(async () => {
    const session = sessionRef.current
    if (!session) return
    await session.cancel()
  }, [])

  const retry = useCallback(() => {
    const session = sessionRef.current
    if (!session) return
    session.retry()
  }, [])

  const reset = useCallback(() => {
    const session = sessionRef.current
    if (!session) return
    session.reset()
  }, [])

  const clearSaveError = useCallback(() => {
    setSaveError(null)
  }, [])

  const loadMessages = useCallback((messages: ChatMessage[]) => {
    const session = sessionRef.current
    if (!session) return
    session.loadMessages(messages)
  }, [])

  // ==========================================================================
  // Return backward-compatible API
  // ==========================================================================

  return {
    stateValue,
    messages: context.messages,
    isStreaming,
    isSending,
    error,
    toolUses: context.toolUses,
    session: context.session,
    budgetWarning: context.budgetWarning,
    currentThinking: context.currentThinking,
    retryAttempt: context.retryAttempt,
    saveError,
    send,
    cancel,
    retry,
    reset,
    clearSaveError,
    loadMessages,
  }
}
