/**
 * SessionSelector Component Unit Tests
 *
 * Story 3.10: Session Selector UI
 *
 * Test ID Convention: 3.10-SEL-{SEQ}
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionSelector } from '@/components/session/SessionSelector'
import { useSessionStore } from '@/stores/sessionStore'
import type { SessionMetadata, Session } from '@/stores/sessionStore'

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

import { invoke } from '@tauri-apps/api/core'

const mockSessions: SessionMetadata[] = [
  {
    id: 'sess_1',
    displayName: 'Daily - January 27, 2026',
    type: 'daily',
    lastActive: '2026-01-27T10:00:00Z',
    messageCount: 5,
  },
  {
    id: 'sess_2',
    displayName: 'Project: Website',
    type: 'project',
    lastActive: '2026-01-26T15:00:00Z',
    messageCount: 12,
    projectName: 'Website Redesign',
  },
]

// Use fake timers for consistent time display
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-27T12:00:00Z'))
  vi.clearAllMocks()

  // Set up initial store state
  useSessionStore.setState({
    activeSession: null,
    recentSessions: mockSessions,
    isLoadingSession: false,
    isLoadingRecent: false,
    sessionError: null,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

// =============================================================================
// Rendering Tests
// =============================================================================

describe('SessionSelector Rendering', () => {
  // 3.10-SEL-001: Renders "Chats" header in expanded mode (Epic 5: renamed from "Recent")
  it('3.10-SEL-001: renders Chats header in expanded mode', () => {
    render(<SessionSelector />)
    expect(screen.getByText('Chats')).toBeInTheDocument()
  })

  // 3.10-SEL-002: Does not render session count badge
  it('3.10-SEL-002: does not render session count badge', () => {
    render(<SessionSelector />)
    // Header should only show "Chats" with no count
    expect(screen.getByText('Chats')).toBeInTheDocument()
    // Should not find a standalone "2" text element (the count badge was removed)
    const countElements = screen.queryAllByText('2')
    // If "2" appears, it should only be in "2h ago" time display, not as standalone badge
    expect(countElements.length).toBeLessThanOrEqual(1)
  })

  // 3.10-SEL-003: Renders all recent sessions
  it('3.10-SEL-003: renders all recent sessions', () => {
    render(<SessionSelector />)
    expect(screen.getByText('Daily - January 27, 2026')).toBeInTheDocument()
    expect(screen.getByText('Project: Website')).toBeInTheDocument()
  })

  // 3.10-SEL-004: Shows loading state
  it('3.10-SEL-004: shows loading state', () => {
    useSessionStore.setState({ isLoadingRecent: true, recentSessions: [] })
    render(<SessionSelector />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  // 3.10-SEL-005: Shows empty state
  it('3.10-SEL-005: shows empty state when no sessions', () => {
    useSessionStore.setState({ recentSessions: [] })
    render(<SessionSelector />)
    expect(screen.getByText('No recent conversations')).toBeInTheDocument()
  })

  // 3.10-SEL-006: Shows all sessions (maxSessions prop ignored)
  it('3.10-SEL-006: shows all sessions regardless of maxSessions prop', () => {
    render(<SessionSelector maxSessions={1} />)
    // Both sessions should be visible even though maxSessions={1}
    expect(screen.getByText('Daily - January 27, 2026')).toBeInTheDocument()
    expect(screen.getByText('Project: Website')).toBeInTheDocument()
  })
})

// =============================================================================
// Collapsed Mode Tests
// =============================================================================

describe('SessionSelector Collapsed Mode', () => {
  // 3.10-SEL-007: Hides header in collapsed mode
  it('3.10-SEL-007: hides header in collapsed mode', () => {
    render(<SessionSelector isCollapsed />)
    expect(screen.queryByText('Chats')).not.toBeInTheDocument() // Epic 5: renamed from 'Recent'
  })

  // 3.10-SEL-008: Renders collapsed session items
  it('3.10-SEL-008: renders collapsed session items', () => {
    render(<SessionSelector isCollapsed />)
    // In collapsed mode, display names are in title attribute
    expect(screen.getByTitle('Daily - January 27, 2026')).toBeInTheDocument()
  })
})

// =============================================================================
// Interaction Tests
// =============================================================================

describe('SessionSelector Interaction', () => {
  // 3.10-SEL-009: Loads session on click
  it('3.10-SEL-009: loads session on click', async () => {
    vi.useRealTimers() // For userEvent
    const user = userEvent.setup()

    const mockSession: Session = {
      ...mockSessions[1],
      messages: [],
    }
    vi.mocked(invoke).mockResolvedValueOnce(mockSession)

    render(<SessionSelector />)

    await user.click(screen.getByTestId('session-item-sess_2'))

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('load_session', { sessionId: 'sess_2' })
    })

    // Restore fake timers
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-27T12:00:00Z'))
  })

  // 3.10-SEL-010: Does not reload active session on click
  it('3.10-SEL-010: does not reload active session on click', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()

    // Set sess_1 as active
    useSessionStore.setState({
      activeSession: {
        ...mockSessions[0],
        messages: [],
      },
    })

    render(<SessionSelector />)

    await user.click(screen.getByTestId('session-item-sess_1'))

    // Should not call invoke since it's already active
    expect(invoke).not.toHaveBeenCalled()

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-27T12:00:00Z'))
  })

  // 3.10-SEL-011: Highlights active session
  it('3.10-SEL-011: highlights active session', () => {
    useSessionStore.setState({
      activeSession: {
        ...mockSessions[0],
        messages: [],
      },
    })

    render(<SessionSelector />)

    const activeButton = screen.getByTestId('session-item-sess_1')
    expect(activeButton).toHaveAttribute('aria-current', 'true')

    const inactiveButton = screen.getByTestId('session-item-sess_2')
    expect(inactiveButton).not.toHaveAttribute('aria-current')
  })
})

// =============================================================================
// Error Handling Tests
// =============================================================================

describe('SessionSelector Error Handling', () => {
  // 3.10-SEL-012: Handles load error
  it('3.10-SEL-012: handles load error gracefully', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()

    vi.mocked(invoke).mockRejectedValueOnce(new Error('Network error'))

    render(<SessionSelector />)

    await user.click(screen.getByTestId('session-item-sess_2'))

    await waitFor(() => {
      const state = useSessionStore.getState()
      expect(state.sessionError).toBe('Network error')
    })

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-27T12:00:00Z'))
  })
})
