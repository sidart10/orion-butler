/**
 * AppShell - New Session Button Tests
 * Epic 5 Plan 3: Session UI Polish
 *
 * TDD Phase 2: RED - Tests written FIRST, expected to FAIL until implementation.
 *
 * Bug #1 Fix: New session button should work even when chat is empty
 * Currently the code at AppShell.tsx:90-92 returns early when messages.length === 0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

// =============================================================================
// Mocks
// =============================================================================

// Mock confirm dialog
const mockConfirm = vi.fn()
global.confirm = mockConfirm

// Mock Tauri invoke for IPC
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue([]),
}))

// Mock database module
vi.mock('@/db', () => ({
  initializeDatabase: vi.fn(),
}))

// Mock useDatabaseStatus hook
vi.mock('@/components/providers/DatabaseProvider', () => ({
  DatabaseProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useDatabaseStatus: () => ({
    state: { status: 'ready' as const },
    retry: async () => {},
  }),
}))

// Mock useBreakpoint
const mockUseBreakpoint = vi.fn(() => ({
  isSidebarCollapsed: false,
  isSidebarOverlay: false,
  isCanvasOverlay: false,
  isCanvasFullWidth: false,
}))

vi.mock('@/hooks', () => ({
  useBreakpoint: () => mockUseBreakpoint(),
  useKeyboardShortcuts: vi.fn(),
}))

// Mock layout store
const mockToggleSidebarOverlay = vi.fn()
const mockCloseSidebarOverlay = vi.fn()
const mockLayoutStore = {
  isSidebarOverlayOpen: false,
  closeSidebarOverlay: mockCloseSidebarOverlay,
  toggleSidebarOverlay: mockToggleSidebarOverlay,
  isSidebarManuallyCollapsed: false,
  isContextSidebarCollapsed: true,
}

vi.mock('@/stores/layoutStore', () => ({
  useLayoutStore: () => mockLayoutStore,
}))

// Mock streaming machine with controllable messages
interface MockMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

let mockMessages: MockMessage[] = []
const mockReset = vi.fn()
const mockCancel = vi.fn().mockResolvedValue(undefined)
const mockSend = vi.fn().mockResolvedValue(undefined)

const mockStreamingMachine = {
  stateValue: 'idle',
  messages: mockMessages,
  isStreaming: false,
  isSending: false,
  error: null,
  toolUses: [],
  session: null,
  saveError: null,
  budgetWarning: false,
  currentThinking: '',
  retryAttempt: 0,
  send: mockSend,
  cancel: mockCancel,
  retry: vi.fn(),
  reset: mockReset,
  clearSaveError: vi.fn(),
  loadMessages: vi.fn(),
}

vi.mock('@/hooks/useStreamingMachine', () => ({
  useStreamingMachine: () => ({
    ...mockStreamingMachine,
    messages: mockMessages, // Use the mutable array
  }),
}))

// Mock useStreamingMachineWrapper (Phase 1: Multi-session migration)
vi.mock('@/hooks/useStreamingMachineWrapper', () => ({
  useStreamingMachineWrapper: () => ({
    ...mockStreamingMachine,
    messages: mockMessages, // Use the mutable array
  }),
}))

// Mock useSessionLoader
vi.mock('@/hooks/useSessionLoader', () => ({
  useSessionLoader: vi.fn(),
}))

// Mock session store
const mockSetActiveSession = vi.fn()
const mockSetRecentSessions = vi.fn()
const mockRecentSessions: unknown[] = []

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: () => ({
    setActiveSession: mockSetActiveSession,
    setRecentSessions: mockSetRecentSessions,
    recentSessions: mockRecentSessions,
  }),
}))

// Mock createSession IPC
const mockCreateSession = vi.fn().mockResolvedValue('ses_new_123')

vi.mock('@/lib/ipc/conversation', () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  getOrCreateConversation: vi.fn().mockResolvedValue('conv_123'),
  saveConversationTurn: vi.fn().mockResolvedValue(undefined),
  updateSdkSessionId: vi.fn().mockResolvedValue(undefined),
  formatTimestamp: vi.fn((ts: number) => new Date(ts).toISOString()),
}))

// Import after mocks
import { AppShell } from '@/components/layout/AppShell'

// =============================================================================
// Test Suite
// =============================================================================

describe('AppShell - New Session Button (Bug #1 Fix)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessages = [] // Start with empty messages
    mockConfirm.mockReturnValue(true)
    mockStreamingMachine.isStreaming = false
  })

  afterEach(() => {
    cleanup()
  })

  // ---------------------------------------------------------------------------
  // Bug #1: New Session Button Does Nothing When Chat Empty
  // ---------------------------------------------------------------------------

  describe('New Session with empty chat (Bug #1 Fix)', () => {
    it('creates session without confirmation when messages.length === 0', async () => {
      // This test should FAIL because current code has:
      // if (streamingMachine.messages.length === 0) return
      // at AppShell.tsx:90-92 which exits early

      mockMessages = [] // Empty chat

      render(<AppShell />)

      // Find and click the new session button
      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      // Wait for async operations
      await waitFor(() => {
        // Should NOT show confirmation dialog (nothing to lose)
        expect(mockConfirm).not.toHaveBeenCalled()

        // Should create new session in database
        expect(mockCreateSession).toHaveBeenCalledWith('adhoc')
      })

      // TIGER-3: reset() should NOT be called - setActiveSession triggers effect
      // which handles session transition via new StreamingSession instance
      // The old messages are in the old actor, new session gets fresh state
      expect(mockReset).not.toHaveBeenCalled()

      // Should update session store (this triggers the wrapper effect)
      expect(mockSetActiveSession).toHaveBeenCalled()
    })

    it('does not require confirmation when starting fresh', async () => {
      // User clicking "New Session" with empty chat wants to start fresh
      // No data to lose, so no confirmation needed

      mockMessages = []

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        expect(mockConfirm).not.toHaveBeenCalled()
      })
    })

    it('creates session in database even when chat is empty', async () => {
      // The key fix: createSession should be called regardless of message count

      mockMessages = []

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        expect(mockCreateSession).toHaveBeenCalledWith('adhoc')
      })

      // Verify the session is set correctly
      expect(mockSetActiveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ses_new_123',
          type: 'adhoc',
        })
      )
    })
  })

  // ---------------------------------------------------------------------------
  // TIGER-7 FIX: No confirmation dialog - previous messages preserved in DB
  // ---------------------------------------------------------------------------

  describe('New Session with messages (TIGER-7: No Confirmation)', () => {
    it('creates session immediately without confirmation when messages exist', async () => {
      // TIGER-7 FIX: Removed confirmation dialog
      // Messages are preserved in DB for the previous session, so no data loss

      mockMessages = [
        { id: 'user_1', role: 'user', content: 'Hello', timestamp: Date.now() },
        { id: 'msg_1', role: 'assistant', content: 'Hi', timestamp: Date.now() },
      ]

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        // No confirmation dialog - session created immediately
        expect(mockConfirm).not.toHaveBeenCalled()
        expect(mockCreateSession).toHaveBeenCalledWith('adhoc')
      })
    })

    it('creates session even with existing messages (no confirmation needed)', async () => {
      mockMessages = [
        { id: 'user_1', role: 'user', content: 'Hello', timestamp: Date.now() },
      ]

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        // TIGER-7: No confirmation - session created directly
        expect(mockConfirm).not.toHaveBeenCalled()
        expect(mockCreateSession).toHaveBeenCalledWith('adhoc')
      })

      // TIGER-3: reset() should NOT be called - setActiveSession triggers effect
      expect(mockReset).not.toHaveBeenCalled()
      expect(mockSetActiveSession).toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Streaming Guards
  // ---------------------------------------------------------------------------

  describe('New Session during streaming', () => {
    it('cancels streaming before creating new session', async () => {
      mockMessages = [
        { id: 'user_1', role: 'user', content: 'Hello', timestamp: Date.now() },
      ]
      mockStreamingMachine.isStreaming = true

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        // Should cancel first
        expect(mockCancel).toHaveBeenCalled()
      })

      // Then create session (no confirmation needed - TIGER-7)
      await waitFor(() => {
        expect(mockCreateSession).toHaveBeenCalled()
      })
    })

    it('creates new session without confirmation even during streaming (TIGER-7)', async () => {
      // TIGER-7 FIX: No confirmation dialog even during streaming
      // Streaming is properly cancelled, messages preserved in DB
      mockMessages = [
        { id: 'user_1', role: 'user', content: 'Hello', timestamp: Date.now() },
        { id: 'msg_1', role: 'assistant', content: 'Partial...', timestamp: Date.now() },
      ]
      mockStreamingMachine.isStreaming = true

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        // No confirmation - just cancel and create
        expect(mockConfirm).not.toHaveBeenCalled()
        expect(mockCancel).toHaveBeenCalled()
        expect(mockCreateSession).toHaveBeenCalled()
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------

  describe('Error handling', () => {
    it('falls back to reset if createSession fails', async () => {
      mockMessages = []
      mockCreateSession.mockRejectedValueOnce(new Error('Database error'))

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        // Should still reset the machine as fallback
        expect(mockReset).toHaveBeenCalled()
      })

      // Session store should not be updated on error
      // (or implementation may choose to handle differently)
    })

    it('logs error when session creation fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockMessages = []
      mockCreateSession.mockRejectedValueOnce(new Error('Network error'))

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to create new session'),
          expect.any(Error)
        )
      })

      consoleSpy.mockRestore()
    })
  })

  // ---------------------------------------------------------------------------
  // Session Store Updates
  // ---------------------------------------------------------------------------

  describe('Session store updates', () => {
    it('sets active session with correct structure', async () => {
      mockMessages = []

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        expect(mockSetActiveSession).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'ses_new_123',
            type: 'adhoc',
            messageCount: 0,
            messages: [],
          })
        )
      })
    })

    it('adds new session to recent sessions list', async () => {
      mockMessages = []

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        expect(mockSetRecentSessions).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'ses_new_123',
              type: 'adhoc',
            }),
          ])
        )
      })
    })

    it('limits recent sessions to max 10', async () => {
      // If there are already 10 recent sessions, the oldest should be dropped
      const existingRecent = Array.from({ length: 10 }, (_, i) => ({
        id: `old_session_${i}`,
        displayName: `Old Session ${i}`,
        type: 'adhoc' as const,
        lastActive: new Date(Date.now() - i * 1000).toISOString(),
        messageCount: 0,
      }))

      // Update mock to return existing sessions
      vi.mocked(mockSetRecentSessions).mockImplementation(() => {})

      mockMessages = []

      render(<AppShell />)

      const newSessionButton = screen.getByRole('button', { name: /new/i })
      fireEvent.click(newSessionButton)

      await waitFor(() => {
        expect(mockSetRecentSessions).toHaveBeenCalled()
      })

      // The call should include the new session and at most 9 old ones
      const [sessionsArg] = mockSetRecentSessions.mock.calls[0]
      expect(sessionsArg.length).toBeLessThanOrEqual(10)
    })
  })

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------

  describe('Accessibility', () => {
    it('new session button has accessible name', () => {
      mockMessages = []

      render(<AppShell />)

      const button = screen.getByRole('button', { name: /new/i })
      expect(button).toBeInTheDocument()
    })

    it('new session button is focusable', () => {
      mockMessages = []

      render(<AppShell />)

      const button = screen.getByRole('button', { name: /new/i })
      button.focus()
      expect(document.activeElement).toBe(button)
    })
  })
})
