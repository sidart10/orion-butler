/**
 * SessionListItem Component Unit Tests
 *
 * Story 3.10: Session Selector UI
 * Story 3.15: Session Metadata Display
 *
 * Test ID Convention: 3.10-ITEM-{SEQ}
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionListItem } from '@/components/session/SessionListItem'
import type { SessionMetadata } from '@/stores/sessionStore'

// Use fake timers for consistent time display
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-27T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

const mockSession: SessionMetadata = {
  id: 'sess_123',
  displayName: 'Daily - January 27, 2026',
  type: 'daily',
  lastActive: '2026-01-27T10:00:00Z', // 2 hours ago
  messageCount: 5,
}

// =============================================================================
// Rendering Tests
// =============================================================================

describe('SessionListItem Rendering', () => {
  // 3.10-ITEM-001: Renders session display name
  it('3.10-ITEM-001: renders session display name', () => {
    render(<SessionListItem session={mockSession} />)
    expect(screen.getByText('Daily - January 27, 2026')).toBeInTheDocument()
  })

  // 3.10-ITEM-002: Renders type badge
  it('3.10-ITEM-002: renders type badge', () => {
    render(<SessionListItem session={mockSession} />)
    expect(screen.getByText('Daily')).toBeInTheDocument()
  })

  // 3.10-ITEM-003: Renders relative time
  it('3.10-ITEM-003: renders relative time', () => {
    render(<SessionListItem session={mockSession} />)
    expect(screen.getByText('2h ago')).toBeInTheDocument()
  })

  // 3.10-ITEM-004: Renders message count when > 0
  it('3.10-ITEM-004: renders message count when greater than 0', () => {
    render(<SessionListItem session={mockSession} />)
    expect(screen.getByText('5 msgs')).toBeInTheDocument()
  })

  // 3.10-ITEM-005: Does not render message count when 0
  it('3.10-ITEM-005: does not render message count when 0', () => {
    const sessionNoMessages = { ...mockSession, messageCount: 0 }
    render(<SessionListItem session={sessionNoMessages} />)
    expect(screen.queryByText(/\d+ msg/)).not.toBeInTheDocument()
  })

  // 3.10-ITEM-006: Renders singular 'msg' for count of 1
  it('3.10-ITEM-006: renders singular msg for count of 1', () => {
    const sessionOneMessage = { ...mockSession, messageCount: 1 }
    render(<SessionListItem session={sessionOneMessage} />)
    expect(screen.getByText('1 msg')).toBeInTheDocument()
  })

  // 3.10-ITEM-007: Renders project name when provided
  it('3.10-ITEM-007: renders project name when provided', () => {
    const projectSession: SessionMetadata = {
      ...mockSession,
      type: 'project',
      projectName: 'Website Redesign',
    }
    render(<SessionListItem session={projectSession} />)
    expect(screen.getByText('Website Redesign')).toBeInTheDocument()
  })

  // 3.10-ITEM-008: Renders corrupted warning
  it('3.10-ITEM-008: renders corrupted warning when session is corrupted', () => {
    const corruptedSession = { ...mockSession, isCorrupted: true }
    render(<SessionListItem session={corruptedSession} />)
    expect(screen.getByText('Session corrupted')).toBeInTheDocument()
  })
})

// =============================================================================
// Active State Tests
// =============================================================================

describe('SessionListItem Active State', () => {
  // 3.10-ITEM-009: Shows gold border when active
  it('3.10-ITEM-009: shows gold border when active', () => {
    render(<SessionListItem session={mockSession} isActive />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-orion-gold')
  })

  // 3.10-ITEM-010: Sets aria-current when active
  it('3.10-ITEM-010: sets aria-current when active', () => {
    render(<SessionListItem session={mockSession} isActive />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-current', 'true')
  })

  // 3.10-ITEM-011: No aria-current when not active
  it('3.10-ITEM-011: no aria-current when not active', () => {
    render(<SessionListItem session={mockSession} isActive={false} />)
    const button = screen.getByRole('button')
    expect(button).not.toHaveAttribute('aria-current')
  })
})

// =============================================================================
// Collapsed Mode Tests
// =============================================================================

describe('SessionListItem Collapsed Mode', () => {
  // 3.10-ITEM-012: Shows only icon in collapsed mode
  it('3.10-ITEM-012: shows only icon in collapsed mode', () => {
    render(<SessionListItem session={mockSession} isCollapsed />)
    // Should not show full display name
    expect(screen.queryByText('Daily - January 27, 2026')).not.toBeInTheDocument()
    // But should have a button with title attribute
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Daily - January 27, 2026')
  })
})

// =============================================================================
// Interaction Tests
// =============================================================================

describe('SessionListItem Interaction', () => {
  // 3.10-ITEM-013: Calls onClick when clicked
  it('3.10-ITEM-013: calls onClick when clicked', async () => {
    // Restore real timers for userEvent
    vi.useRealTimers()
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<SessionListItem session={mockSession} onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
    // Restore fake timers for other tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-27T12:00:00Z'))
  })

  // 3.10-ITEM-014: Uses data-testid based on session id
  it('3.10-ITEM-014: uses data-testid based on session id', () => {
    render(<SessionListItem session={mockSession} />)
    expect(screen.getByTestId('session-item-sess_123')).toBeInTheDocument()
  })
})

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('SessionListItem Accessibility', () => {
  // 3.10-ITEM-015: Button has consistent 36px height (h-9)
  it('3.10-ITEM-015: button has consistent 36px height (h-9)', () => {
    render(<SessionListItem session={mockSession} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9')
    expect(button).not.toHaveClass('min-h-[44px]')
  })

  // 3.10-ITEM-016: Has focus-visible outline
  it('3.10-ITEM-016: has focus-visible outline', () => {
    render(<SessionListItem session={mockSession} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('focus-visible:outline')
  })
})
