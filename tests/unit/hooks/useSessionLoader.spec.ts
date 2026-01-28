/**
 * useSessionLoader Hook Unit Tests
 *
 * Story 3.9: Load Conversation on App Launch
 *
 * Test ID Convention: 3.9-HOOK-{SEQ}
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSessionLoader } from '@/hooks/useSessionLoader'
import { useSessionStore } from '@/stores/sessionStore'

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

import { invoke } from '@tauri-apps/api/core'

// Reset store state before each test
beforeEach(() => {
  vi.clearAllMocks()
  useSessionStore.setState({
    activeSession: null,
    isLoadingSession: false,
    sessionError: null,
    recentSessions: [],
    isLoadingRecent: false,
  })
})

// =============================================================================
// Loading Behavior Tests
// =============================================================================

describe('useSessionLoader Hook', () => {
  const mockRecentSessions = [
    {
      id: 'sess_1',
      displayName: 'Daily - January 27, 2026',
      type: 'daily' as const,
      lastActive: '2026-01-27T10:00:00Z',
      messageCount: 5,
    },
    {
      id: 'sess_2',
      displayName: 'Project: Website',
      type: 'project' as const,
      lastActive: '2026-01-26T15:00:00Z',
      messageCount: 12,
    },
  ]

  const mockSession = {
    id: 'sess_1',
    displayName: 'Daily - January 27, 2026',
    type: 'daily' as const,
    lastActive: '2026-01-27T10:00:00Z',
    messageCount: 5,
    messages: [],
  }

  // 3.9-HOOK-001: Should call get_recent_sessions on mount
  it('3.9-HOOK-001: calls get_recent_sessions on mount', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(mockRecentSessions)
    vi.mocked(invoke).mockResolvedValueOnce(mockSession)

    renderHook(() => useSessionLoader())

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_recent_sessions', { limit: 10 })
    })
  })

  // 3.9-HOOK-002: Should load most recent session
  it('3.9-HOOK-002: loads most recent session when available', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(mockRecentSessions)
    vi.mocked(invoke).mockResolvedValueOnce(mockSession)

    renderHook(() => useSessionLoader())

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('load_session', {
        sessionId: 'sess_1',
      })
    })

    await waitFor(() => {
      const state = useSessionStore.getState()
      expect(state.activeSession).toEqual(mockSession)
    })
  })

  // 3.9-HOOK-003: Should update recentSessions in store
  it('3.9-HOOK-003: updates recentSessions in store', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(mockRecentSessions)
    vi.mocked(invoke).mockResolvedValueOnce(mockSession)

    renderHook(() => useSessionLoader())

    await waitFor(() => {
      const state = useSessionStore.getState()
      expect(state.recentSessions).toEqual(mockRecentSessions)
    })
  })

  // 3.9-HOOK-004: Should handle empty sessions list
  it('3.9-HOOK-004: handles empty sessions list gracefully', async () => {
    vi.mocked(invoke).mockResolvedValueOnce([])

    renderHook(() => useSessionLoader())

    await waitFor(() => {
      const state = useSessionStore.getState()
      expect(state.recentSessions).toEqual([])
      expect(state.activeSession).toBeNull()
      expect(state.isLoadingSession).toBe(false)
    })
  })

  // 3.9-HOOK-005: Should skip corrupted sessions
  it('3.9-HOOK-005: skips corrupted sessions', async () => {
    const corruptedSessions = [
      {
        ...mockRecentSessions[0],
        isCorrupted: true,
      },
    ]
    vi.mocked(invoke).mockResolvedValueOnce(corruptedSessions)

    renderHook(() => useSessionLoader())

    await waitFor(() => {
      const state = useSessionStore.getState()
      expect(state.sessionError).toBe('Previous session could not be restored')
      expect(state.isLoadingSession).toBe(false)
    })

    // Should not call load_session for corrupted session
    expect(invoke).not.toHaveBeenCalledWith('load_session', expect.anything())
  })

  // 3.9-HOOK-006: Should handle load error after retries
  it('3.9-HOOK-006: handles load error gracefully after retries exhausted', async () => {
    // Mock all 3 retry attempts to fail
    vi.mocked(invoke)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))

    renderHook(() => useSessionLoader())

    await waitFor(
      () => {
        const state = useSessionStore.getState()
        expect(state.sessionError).toBe('Network error')
        expect(state.isLoadingSession).toBe(false)
      },
      { timeout: 5000 } // Allow time for retries
    )

    // Should have attempted 3 times
    expect(invoke).toHaveBeenCalledTimes(3)
  })

  // 3.9-HOOK-007: Should set loading states correctly
  it('3.9-HOOK-007: sets loading states during load', async () => {
    let resolveRecent: (value: unknown) => void
    const recentPromise = new Promise((resolve) => {
      resolveRecent = resolve
    })
    vi.mocked(invoke).mockReturnValueOnce(recentPromise as Promise<unknown>)

    renderHook(() => useSessionLoader())

    // Check loading state is true initially
    expect(useSessionStore.getState().isLoadingSession).toBe(true)
    expect(useSessionStore.getState().isLoadingRecent).toBe(true)

    // Resolve and check loading completes
    resolveRecent!([])

    await waitFor(() => {
      expect(useSessionStore.getState().isLoadingSession).toBe(false)
      expect(useSessionStore.getState().isLoadingRecent).toBe(false)
    })
  })

  // 3.9-HOOK-008: Should retry on transient failure and succeed
  it('3.9-HOOK-008: retries on transient failure and succeeds', async () => {
    // First attempt fails, second succeeds
    vi.mocked(invoke)
      .mockRejectedValueOnce(new Error('Transient error'))
      .mockResolvedValueOnce(mockRecentSessions)
      .mockResolvedValueOnce(mockSession)

    renderHook(() => useSessionLoader())

    await waitFor(
      () => {
        const state = useSessionStore.getState()
        expect(state.activeSession).toEqual(mockSession)
        expect(state.sessionError).toBeNull()
      },
      { timeout: 5000 }
    )

    // Should have retried (2 calls: 1 failed + 1 success for recent, then 1 for session)
    expect(invoke).toHaveBeenCalledTimes(3)
  })

  // 3.9-HOOK-009: Should export RECENT_SESSIONS_LIMIT constant
  it('3.9-HOOK-009: uses exported RECENT_SESSIONS_LIMIT constant', async () => {
    // Import the constant to verify it's exported
    const { RECENT_SESSIONS_LIMIT } = await import('@/hooks/useSessionLoader')
    expect(RECENT_SESSIONS_LIMIT).toBe(10)
  })
})
