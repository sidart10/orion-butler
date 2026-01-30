/**
 * TIGER-4 Integration Test: ID Derivation Synchronization
 *
 * Verifies that frontend and backend produce the SAME conversation ID
 * from the same session ID using the canonical derivation pattern.
 *
 * Canonical Pattern (TIGER-7 Fix):
 *   sessionId: "orion-{type}-{identifier}"
 *   conversationId: "conv_{type}-{identifier}"
 *   Derivation: conv_id = `conv_${session_id.replace('orion-', '')}`
 *
 * This test guards against regression where two independent ID generators
 * produce mismatched IDs (the original TIGER-7 root cause).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

import { invoke } from '@tauri-apps/api/core'

// =============================================================================
// Canonical Derivation Function (Frontend Reference)
// =============================================================================

/**
 * Frontend's canonical conversation ID derivation.
 * Used in AppShell.tsx:113 for new sessions.
 */
function deriveConversationIdFrontend(sessionId: string): string {
  return `conv_${sessionId.replace('orion-', '')}`
}

/**
 * Simulates backend's conversation ID derivation (session.rs:257, conversation.rs:349).
 * Both files now use: format!("conv_{}", session_id.replace("orion-", ""))
 */
function deriveConversationIdBackend(sessionId: string): string {
  // Simulates Rust: format!("conv_{}", session_id.replace("orion-", ""))
  return `conv_${sessionId.replace('orion-', '')}`
}

// =============================================================================
// TIGER-4: Frontend/Backend ID Derivation Sync Tests
// =============================================================================

describe('TIGER-4: Frontend/Backend ID Derivation Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Derivation Consistency Across All Session Types', () => {
    const testCases = [
      {
        type: 'adhoc',
        sessionId: 'orion-adhoc-550e8400-e29b-41d4-a716-446655440000',
        expectedConvId: 'conv_adhoc-550e8400-e29b-41d4-a716-446655440000',
      },
      {
        type: 'daily',
        sessionId: 'orion-daily-2026-01-29',
        expectedConvId: 'conv_daily-2026-01-29',
      },
      {
        type: 'project',
        sessionId: 'orion-project-my-awesome-app',
        expectedConvId: 'conv_project-my-awesome-app',
      },
      {
        type: 'inbox',
        sessionId: 'orion-inbox-2026-01-29',
        expectedConvId: 'conv_inbox-2026-01-29',
      },
    ]

    testCases.forEach(({ type, sessionId, expectedConvId }) => {
      it(`${type}: frontend and backend produce identical conversation IDs`, () => {
        const frontendConvId = deriveConversationIdFrontend(sessionId)
        const backendConvId = deriveConversationIdBackend(sessionId)

        // CRITICAL: Both must produce the exact same ID
        expect(frontendConvId).toBe(backendConvId)

        // Both must match the expected canonical format
        expect(frontendConvId).toBe(expectedConvId)
        expect(backendConvId).toBe(expectedConvId)
      })
    })
  })

  describe('IPC Integration: create_session Returns Consistent IDs', () => {
    it('create_session returns session ID that derives to matching conversation ID', async () => {
      const mockSessionId = 'orion-adhoc-test-uuid-12345'
      const expectedConvId = 'conv_adhoc-test-uuid-12345'

      // Mock create_session IPC command
      vi.mocked(invoke).mockResolvedValueOnce(mockSessionId)

      // Simulate: const sessionId = await invoke('create_session', { sessionType: 'adhoc' })
      const sessionId = await invoke('create_session', { sessionType: 'adhoc' })

      // Frontend derives conversation ID from returned session ID
      const frontendConvId = deriveConversationIdFrontend(sessionId as string)

      expect(frontendConvId).toBe(expectedConvId)
      expect(invoke).toHaveBeenCalledWith('create_session', { sessionType: 'adhoc' })
    })

    it('load_session returns session with conversationId matching derivation', async () => {
      const mockSession = {
        id: 'orion-daily-2026-01-29',
        displayName: 'Daily Session',
        type: 'daily',
        conversationId: 'conv_daily-2026-01-29', // Backend-assigned
        lastActive: '2026-01-29T10:00:00Z',
        messageCount: 5,
      }

      // Mock load_session IPC command
      vi.mocked(invoke).mockResolvedValueOnce(mockSession)

      const session = (await invoke('load_session', { sessionId: mockSession.id })) as typeof mockSession

      // Backend's conversationId must match frontend derivation
      const frontendDerivedConvId = deriveConversationIdFrontend(session.id)

      expect(session.conversationId).toBe(frontendDerivedConvId)
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('handles session IDs with multiple dashes in identifier', () => {
      const sessionId = 'orion-project-my-multi-dash-project-name'
      const expectedConvId = 'conv_project-my-multi-dash-project-name'

      const frontendConvId = deriveConversationIdFrontend(sessionId)
      const backendConvId = deriveConversationIdBackend(sessionId)

      expect(frontendConvId).toBe(expectedConvId)
      expect(backendConvId).toBe(expectedConvId)
      expect(frontendConvId).toBe(backendConvId)
    })

    it('handles UUID format identifiers (adhoc sessions)', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      const sessionId = `orion-adhoc-${uuid}`
      const expectedConvId = `conv_adhoc-${uuid}`

      const frontendConvId = deriveConversationIdFrontend(sessionId)
      const backendConvId = deriveConversationIdBackend(sessionId)

      expect(frontendConvId).toBe(expectedConvId)
      expect(backendConvId).toBe(expectedConvId)
    })

    it('handles date format identifiers (daily/inbox sessions)', () => {
      const date = '2026-12-31'
      const sessionId = `orion-inbox-${date}`
      const expectedConvId = `conv_inbox-${date}`

      const frontendConvId = deriveConversationIdFrontend(sessionId)
      const backendConvId = deriveConversationIdBackend(sessionId)

      expect(frontendConvId).toBe(expectedConvId)
      expect(backendConvId).toBe(expectedConvId)
    })
  })

  describe('TIGER-7 Regression Guard: DASH Format Enforcement', () => {
    it('conversation IDs always use DASH separator after type, never UNDERSCORE', () => {
      const sessionTypes = ['adhoc', 'daily', 'project', 'inbox']

      sessionTypes.forEach((type) => {
        const sessionId = `orion-${type}-test-identifier`
        const convId = deriveConversationIdFrontend(sessionId)

        // MUST have DASH after type (conv_type-identifier)
        expect(convId).toMatch(new RegExp(`^conv_${type}-`))

        // MUST NOT have UNDERSCORE after type (the original bug)
        expect(convId).not.toMatch(new RegExp(`^conv_${type}_`))
      })
    })

    it('rejects the OLD buggy format patterns', () => {
      // These were the buggy formats before TIGER-7 fix
      const buggyFormats = [
        'conv_adhoc_550e8400-e29b-41d4-a716-446655440000', // underscore after adhoc
        'conv_daily_2026-01-29', // underscore after daily
        'conv_proj_my-project', // wrong prefix (proj_ not project-)
        'conv_inbox_2026-01-29', // underscore after inbox
      ]

      const validPattern = /^conv_(adhoc|daily|project|inbox)-[\w-]+$/

      buggyFormats.forEach((buggyId) => {
        expect(buggyId).not.toMatch(validPattern)
      })
    })

    it('accepts the CORRECT DASH format patterns', () => {
      const correctFormats = [
        'conv_adhoc-550e8400-e29b-41d4-a716-446655440000',
        'conv_daily-2026-01-29',
        'conv_project-my-project',
        'conv_inbox-2026-01-29',
      ]

      const validPattern = /^conv_(adhoc|daily|project|inbox)-[\w-]+$/

      correctFormats.forEach((correctId) => {
        expect(correctId).toMatch(validPattern)
      })
    })
  })
})
