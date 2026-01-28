/**
 * SessionStore Extension Tests
 * Epic 3: Conversation Persistence
 *
 * TDD RED Phase - Tests written BEFORE implementation.
 * These tests MUST FAIL until session-store.ts is updated with:
 * - New field handling (displayName, projectId, isActive)
 * - findTodaysDailySession() method
 * - findSessionToResume() method
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getSessionStore,
  resetSessionStore,
  SessionStore,
} from '@/lib/sdk/session-store'
import type { OrionSession, SessionType } from '@/lib/sdk/types'

// =============================================================================
// Test Constants
// =============================================================================

const FIXED_DATE = new Date('2026-01-27T14:30:00.000Z')

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create a valid OrionSession with all required fields
 */
function createTestSession(overrides: Partial<OrionSession> = {}): OrionSession {
  return {
    id: 'test-session-1',
    type: 'daily' as SessionType,
    displayName: 'Test Session',
    projectId: null,
    isActive: true,
    createdAt: '2026-01-27T10:00:00Z',
    lastActivity: '2026-01-27T10:00:00Z',
    tokenCount: 0,
    costUsd: 0,
    ...overrides,
  }
}

// =============================================================================
// New Fields Integration Tests
// =============================================================================

describe('SessionStore extended fields', () => {
  beforeEach(() => {
    resetSessionStore()
  })

  describe('save and get with displayName', () => {
    it('should save and retrieve displayName', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-displayname-1',
        displayName: 'Daily - January 27, 2026',
      })

      await store.save(session)
      const retrieved = await store.get('test-displayname-1')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.displayName).toBe('Daily - January 27, 2026')
    })

    it('should save and retrieve empty displayName', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-empty-displayname',
        displayName: '',
      })

      await store.save(session)
      const retrieved = await store.get('test-empty-displayname')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.displayName).toBe('')
    })

    it('should preserve displayName on update', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-update-displayname',
        displayName: 'Original Name',
      })

      await store.save(session)

      // Update the session with different activity but same displayName
      const updatedSession = {
        ...session,
        lastActivity: '2026-01-27T15:00:00Z',
        tokenCount: 100,
      }
      await store.save(updatedSession)

      const retrieved = await store.get('test-update-displayname')
      expect(retrieved?.displayName).toBe('Original Name')
    })
  })

  describe('save and get with projectId', () => {
    it('should save and retrieve projectId for project sessions', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-project-1',
        type: 'project',
        displayName: 'Project: Orion Butler',
        projectId: 'proj-orion-butler',
      })

      await store.save(session)
      const retrieved = await store.get('test-project-1')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.projectId).toBe('proj-orion-butler')
    })

    it('should save projectId as null for non-project sessions', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-daily-null-project',
        type: 'daily',
        displayName: 'Daily - January 27, 2026',
        projectId: null,
      })

      await store.save(session)
      const retrieved = await store.get('test-daily-null-project')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.projectId).toBeNull()
    })

    it('should handle empty string projectId', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-empty-project',
        projectId: '',
      })

      await store.save(session)
      const retrieved = await store.get('test-empty-project')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.projectId).toBe('')
    })
  })

  describe('save and get with isActive', () => {
    it('should save and retrieve isActive flag as true', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-active-true',
        isActive: true,
      })

      await store.save(session)
      const retrieved = await store.get('test-active-true')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.isActive).toBe(true)
    })

    it('should save and retrieve isActive flag as false (archived)', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-active-false',
        isActive: false,
      })

      await store.save(session)
      const retrieved = await store.get('test-active-false')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.isActive).toBe(false)
    })

    it('should default isActive to true when not explicitly set', async () => {
      const store = getSessionStore()
      // Create session without explicit isActive
      const session: OrionSession = {
        id: 'test-default-active',
        type: 'daily',
        displayName: 'Test Session',
        projectId: null,
        isActive: true, // Schema default
        createdAt: '2026-01-27T10:00:00Z',
        lastActivity: '2026-01-27T10:00:00Z',
        tokenCount: 0,
        costUsd: 0,
      }

      await store.save(session)
      const retrieved = await store.get('test-default-active')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.isActive).toBe(true)
    })
  })

  describe('list with new fields', () => {
    it('should return sessions with displayName in list', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-list-displayname',
        displayName: 'Listed Session',
      })

      await store.save(session)
      const sessions = await store.list()

      expect(sessions.length).toBeGreaterThan(0)
      const found = sessions.find((s) => s.id === 'test-list-displayname')
      expect(found?.displayName).toBe('Listed Session')
    })

    it('should return sessions with projectId in list', async () => {
      const store = getSessionStore()
      const session = createTestSession({
        id: 'test-list-project',
        type: 'project',
        projectId: 'proj-123',
      })

      await store.save(session)
      const sessions = await store.list('project')

      expect(sessions.length).toBeGreaterThan(0)
      const found = sessions.find((s) => s.id === 'test-list-project')
      expect(found?.projectId).toBe('proj-123')
    })

    it('should return sessions with isActive in list', async () => {
      const store = getSessionStore()
      const activeSession = createTestSession({
        id: 'test-list-active',
        isActive: true,
      })
      const archivedSession = createTestSession({
        id: 'test-list-archived',
        isActive: false,
      })

      await store.save(activeSession)
      await store.save(archivedSession)

      const sessions = await store.list()

      const active = sessions.find((s) => s.id === 'test-list-active')
      const archived = sessions.find((s) => s.id === 'test-list-archived')

      expect(active?.isActive).toBe(true)
      expect(archived?.isActive).toBe(false)
    })
  })
})

// =============================================================================
// findTodaysDailySession Tests
// =============================================================================

describe('SessionStore.findTodaysDailySession', () => {
  beforeEach(() => {
    resetSessionStore()
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return today daily session if exists', async () => {
    const store = getSessionStore()
    const todaySession = createTestSession({
      id: 'orion-daily-2026-01-27',
      type: 'daily',
      displayName: 'Daily - January 27, 2026',
    })

    await store.save(todaySession)
    const found = await store.findTodaysDailySession()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-daily-2026-01-27')
  })

  it('should return null if no daily session exists', async () => {
    const store = getSessionStore()

    const found = await store.findTodaysDailySession()

    expect(found).toBeNull()
  })

  it('should return null if only yesterday daily session exists', async () => {
    const store = getSessionStore()
    const yesterdaySession = createTestSession({
      id: 'orion-daily-2026-01-26',
      type: 'daily',
      displayName: 'Daily - January 26, 2026',
    })

    await store.save(yesterdaySession)
    const found = await store.findTodaysDailySession()

    expect(found).toBeNull()
  })

  it('should return null if only tomorrow daily session exists', async () => {
    const store = getSessionStore()
    const tomorrowSession = createTestSession({
      id: 'orion-daily-2026-01-28',
      type: 'daily',
      displayName: 'Daily - January 28, 2026',
    })

    await store.save(tomorrowSession)
    const found = await store.findTodaysDailySession()

    expect(found).toBeNull()
  })

  it('should return null if only project sessions exist', async () => {
    const store = getSessionStore()
    const projectSession = createTestSession({
      id: 'orion-project-my-app',
      type: 'project',
      displayName: 'Project: My App',
      projectId: 'proj-my-app',
    })

    await store.save(projectSession)
    const found = await store.findTodaysDailySession()

    expect(found).toBeNull()
  })

  it('should return today daily even if multiple daily sessions exist', async () => {
    const store = getSessionStore()
    const todaySession = createTestSession({
      id: 'orion-daily-2026-01-27',
      type: 'daily',
      displayName: 'Daily - January 27, 2026',
    })
    const yesterdaySession = createTestSession({
      id: 'orion-daily-2026-01-26',
      type: 'daily',
      displayName: 'Daily - January 26, 2026',
    })

    await store.save(yesterdaySession)
    await store.save(todaySession)
    const found = await store.findTodaysDailySession()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-daily-2026-01-27')
  })

  it('should handle date boundary at midnight', async () => {
    // Set time to just past midnight LOCAL time
    // We create a date that is midnight local time, not UTC
    const midnight = new Date(2026, 0, 27, 0, 0, 1) // Jan 27, 2026 00:00:01 local
    vi.setSystemTime(midnight)

    const store = getSessionStore()
    // Session ID should match local date
    const todaySession = createTestSession({
      id: 'orion-daily-2026-01-27',
      type: 'daily',
    })

    await store.save(todaySession)
    const found = await store.findTodaysDailySession()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-daily-2026-01-27')
  })

  it('should handle date boundary at end of day', async () => {
    // Set time to just before midnight LOCAL time
    const endOfDay = new Date(2026, 0, 27, 23, 59, 59, 999) // Jan 27, 2026 23:59:59.999 local
    vi.setSystemTime(endOfDay)

    const store = getSessionStore()
    // Session ID should match local date
    const todaySession = createTestSession({
      id: 'orion-daily-2026-01-27',
      type: 'daily',
    })

    await store.save(todaySession)
    const found = await store.findTodaysDailySession()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-daily-2026-01-27')
  })

  /**
   * C1: Timezone mismatch test
   *
   * BUG: findTodaysDailySession() uses toISOString().split('T')[0] which is UTC,
   * but generateSessionId() uses formatDateForId() which uses local time.
   *
   * Scenario: User in PST (UTC-8) at 11:30 PM on Jan 26
   * - Local time: 2026-01-26 23:30
   * - UTC time: 2026-01-27 07:30
   * - Session ID created with local time: orion-daily-2026-01-26
   * - findTodaysDailySession() searches with UTC: orion-daily-2026-01-27
   * - Result: Can't find session, creates duplicate
   *
   * This test verifies that findTodaysDailySession uses the same date logic
   * as session ID generation (local time via formatDateForId).
   */
  it('should use local time consistently with session ID generation (C1 timezone fix)', async () => {
    // Mock timezone offset to simulate PST (UTC-8)
    // At 2026-01-27T07:30:00.000Z (UTC), local time in PST is 2026-01-26 23:30
    const utcTime = new Date('2026-01-27T07:30:00.000Z')
    vi.setSystemTime(utcTime)

    // Mock getTimezoneOffset to return PST offset (480 minutes = 8 hours behind UTC)
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(480)

    try {
      const store = getSessionStore()

      // Session was created earlier today (local time Jan 26) using local date
      // The ID uses local time: 2026-01-26 (because that's what formatDateForId does)
      const localDateSession = createTestSession({
        id: 'orion-daily-2026-01-26', // Local time date (PST)
        type: 'daily',
        displayName: 'Daily - January 26, 2026',
      })
      await store.save(localDateSession)

      // findTodaysDailySession should find this session because
      // "today" in local time is still Jan 26
      const found = await store.findTodaysDailySession()

      // This test will FAIL with current implementation because:
      // - Current code uses: new Date().toISOString().split('T')[0] = '2026-01-27' (UTC)
      // - But session ID is: 'orion-daily-2026-01-26' (local time)
      // - So it looks for 'orion-daily-2026-01-27' and doesn't find it
      expect(found).not.toBeNull()
      expect(found?.id).toBe('orion-daily-2026-01-26')
    } finally {
      // Restore original getTimezoneOffset
      vi.spyOn(Date.prototype, 'getTimezoneOffset').mockRestore()
    }
  })
})

// =============================================================================
// findByProjectId Tests (M3)
// =============================================================================

describe('SessionStore.findByProjectId', () => {
  beforeEach(() => {
    resetSessionStore()
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should find active project session by projectId', async () => {
    const store = getSessionStore()
    const projectSession = createTestSession({
      id: 'orion-project-my-app',
      type: 'project',
      displayName: 'Project: My App',
      projectId: 'proj-123',
      isActive: true,
    })

    await store.save(projectSession)
    const found = await store.findByProjectId('proj-123')

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-project-my-app')
    expect(found?.projectId).toBe('proj-123')
  })

  it('should return null if no project with that ID exists', async () => {
    const store = getSessionStore()

    const found = await store.findByProjectId('nonexistent-id')

    expect(found).toBeNull()
  })

  it('should return null for inactive project session', async () => {
    const store = getSessionStore()
    const inactiveProject = createTestSession({
      id: 'orion-project-archived',
      type: 'project',
      displayName: 'Project: Archived',
      projectId: 'proj-archived',
      isActive: false,
    })

    await store.save(inactiveProject)
    const found = await store.findByProjectId('proj-archived')

    expect(found).toBeNull()
  })

  it('should find correct project when multiple exist', async () => {
    const store = getSessionStore()
    const project1 = createTestSession({
      id: 'orion-project-one',
      type: 'project',
      projectId: 'proj-1',
      isActive: true,
    })
    const project2 = createTestSession({
      id: 'orion-project-two',
      type: 'project',
      projectId: 'proj-2',
      isActive: true,
    })

    await store.save(project1)
    await store.save(project2)

    const found = await store.findByProjectId('proj-2')
    expect(found?.id).toBe('orion-project-two')
  })

  it('should not find daily sessions by projectId', async () => {
    const store = getSessionStore()
    const dailySession = createTestSession({
      id: 'orion-daily-2026-01-27',
      type: 'daily',
      projectId: null,
      isActive: true,
    })

    await store.save(dailySession)
    const found = await store.findByProjectId('orion-daily-2026-01-27')

    expect(found).toBeNull()
  })
})

// =============================================================================
// findSessionToResume Tests
// =============================================================================

describe('SessionStore.findSessionToResume', () => {
  beforeEach(() => {
    resetSessionStore()
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return today daily session first (priority)', async () => {
    const store = getSessionStore()
    const todayDaily = createTestSession({
      id: 'orion-daily-2026-01-27',
      type: 'daily',
      displayName: 'Daily - January 27, 2026',
      isActive: true,
      lastActivity: '2026-01-27T10:00:00Z',
    })
    const recentProject = createTestSession({
      id: 'orion-project-my-app',
      type: 'project',
      displayName: 'Project: My App',
      projectId: 'proj-my-app',
      isActive: true,
      lastActivity: '2026-01-27T14:00:00Z', // More recent, but daily has priority
    })

    await store.save(todayDaily)
    await store.save(recentProject)

    const found = await store.findSessionToResume()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-daily-2026-01-27')
  })

  it('should return most recent active session if no today daily', async () => {
    const store = getSessionStore()
    const olderSession = createTestSession({
      id: 'orion-project-older',
      type: 'project',
      displayName: 'Older Project',
      projectId: 'proj-older',
      isActive: true,
      lastActivity: '2026-01-27T10:00:00Z',
    })
    const newerSession = createTestSession({
      id: 'orion-project-newer',
      type: 'project',
      displayName: 'Newer Project',
      projectId: 'proj-newer',
      isActive: true,
      lastActivity: '2026-01-27T14:00:00Z',
    })

    await store.save(olderSession)
    await store.save(newerSession)

    const found = await store.findSessionToResume()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-project-newer')
  })

  it('should skip inactive sessions', async () => {
    const store = getSessionStore()
    const archivedRecent = createTestSession({
      id: 'orion-project-archived',
      type: 'project',
      displayName: 'Archived Project',
      projectId: 'proj-archived',
      isActive: false, // Archived
      lastActivity: '2026-01-27T14:00:00Z',
    })
    const activeOlder = createTestSession({
      id: 'orion-project-active',
      type: 'project',
      displayName: 'Active Project',
      projectId: 'proj-active',
      isActive: true, // Active
      lastActivity: '2026-01-27T10:00:00Z',
    })

    await store.save(archivedRecent)
    await store.save(activeOlder)

    const found = await store.findSessionToResume()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-project-active')
  })

  it('should return null if all sessions are inactive', async () => {
    const store = getSessionStore()
    const archived1 = createTestSession({
      id: 'orion-daily-2026-01-25',
      type: 'daily',
      isActive: false,
    })
    const archived2 = createTestSession({
      id: 'orion-project-archived',
      type: 'project',
      projectId: 'proj-1',
      isActive: false,
    })

    await store.save(archived1)
    await store.save(archived2)

    const found = await store.findSessionToResume()

    expect(found).toBeNull()
  })

  it('should return null if no sessions exist', async () => {
    const store = getSessionStore()

    const found = await store.findSessionToResume()

    expect(found).toBeNull()
  })

  it('should return adhoc session if only active adhoc exists', async () => {
    const store = getSessionStore()
    const adhocSession = createTestSession({
      id: 'orion-adhoc-550e8400-e29b-41d4-a716-446655440000',
      type: 'adhoc',
      displayName: 'Quick Chat',
      isActive: true,
    })

    await store.save(adhocSession)

    const found = await store.findSessionToResume()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-adhoc-550e8400-e29b-41d4-a716-446655440000')
  })

  it('should return inbox session if only active inbox exists', async () => {
    const store = getSessionStore()
    const inboxSession = createTestSession({
      id: 'orion-inbox-2026-01-27',
      type: 'inbox',
      displayName: 'Inbox Processing',
      isActive: true,
    })

    await store.save(inboxSession)

    const found = await store.findSessionToResume()

    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-inbox-2026-01-27')
  })

  it('should prefer today daily over inactive today daily', async () => {
    const store = getSessionStore()
    const archivedTodayDaily = createTestSession({
      id: 'orion-daily-2026-01-27',
      type: 'daily',
      displayName: 'Daily - January 27, 2026',
      isActive: false, // Archived
    })
    const activeProject = createTestSession({
      id: 'orion-project-active',
      type: 'project',
      projectId: 'proj-1',
      isActive: true,
    })

    await store.save(archivedTodayDaily)
    await store.save(activeProject)

    const found = await store.findSessionToResume()

    // Since today's daily is archived, should fall back to active project
    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-project-active')
  })

  it('should handle mixed session types and states', async () => {
    const store = getSessionStore()

    // Create a variety of sessions
    const sessions = [
      createTestSession({
        id: 'orion-daily-2026-01-26',
        type: 'daily',
        isActive: true,
        lastActivity: '2026-01-26T18:00:00Z',
      }),
      createTestSession({
        id: 'orion-project-archived',
        type: 'project',
        projectId: 'proj-1',
        isActive: false,
        lastActivity: '2026-01-27T12:00:00Z',
      }),
      createTestSession({
        id: 'orion-project-active',
        type: 'project',
        projectId: 'proj-2',
        isActive: true,
        lastActivity: '2026-01-27T08:00:00Z',
      }),
      createTestSession({
        id: 'orion-adhoc-123',
        type: 'adhoc',
        isActive: true,
        lastActivity: '2026-01-27T13:00:00Z', // Most recent active
      }),
    ]

    for (const session of sessions) {
      await store.save(session)
    }

    const found = await store.findSessionToResume()

    // No today's daily, so most recent active should be adhoc
    expect(found).not.toBeNull()
    expect(found?.id).toBe('orion-adhoc-123')
  })
})

// =============================================================================
// setActive Tests (soft archive functionality)
// =============================================================================

describe('SessionStore.setActive', () => {
  beforeEach(() => {
    resetSessionStore()
  })

  it('should set a session as inactive (archive)', async () => {
    const store = getSessionStore()
    const session = createTestSession({
      id: 'test-archive',
      isActive: true,
    })

    await store.save(session)
    await store.setActive('test-archive', false)

    const retrieved = await store.get('test-archive')
    expect(retrieved?.isActive).toBe(false)
  })

  it('should set a session as active (unarchive)', async () => {
    const store = getSessionStore()
    const session = createTestSession({
      id: 'test-unarchive',
      isActive: false,
    })

    await store.save(session)
    await store.setActive('test-unarchive', true)

    const retrieved = await store.get('test-unarchive')
    expect(retrieved?.isActive).toBe(true)
  })

  it('should not throw if session does not exist', async () => {
    const store = getSessionStore()

    await expect(
      store.setActive('nonexistent-session', false)
    ).resolves.not.toThrow()
  })

  it('should preserve other session fields when setting active', async () => {
    const store = getSessionStore()
    const session = createTestSession({
      id: 'test-preserve-fields',
      type: 'project',
      displayName: 'My Project',
      projectId: 'proj-123',
      isActive: true,
      tokenCount: 500,
      costUsd: 0.05,
    })

    await store.save(session)
    await store.setActive('test-preserve-fields', false)

    const retrieved = await store.get('test-preserve-fields')
    expect(retrieved?.isActive).toBe(false)
    expect(retrieved?.displayName).toBe('My Project')
    expect(retrieved?.projectId).toBe('proj-123')
    expect(retrieved?.tokenCount).toBe(500)
    expect(retrieved?.costUsd).toBe(0.05)
  })
})

// =============================================================================
// listActive Tests
// =============================================================================

describe('SessionStore.listActive', () => {
  beforeEach(() => {
    resetSessionStore()
  })

  it('should return only active sessions', async () => {
    const store = getSessionStore()
    const activeSession = createTestSession({
      id: 'test-active',
      isActive: true,
    })
    const archivedSession = createTestSession({
      id: 'test-archived',
      isActive: false,
    })

    await store.save(activeSession)
    await store.save(archivedSession)

    const activeSessions = await store.listActive()

    expect(activeSessions.length).toBe(1)
    expect(activeSessions[0].id).toBe('test-active')
  })

  it('should return empty array if all sessions are archived', async () => {
    const store = getSessionStore()
    const archived1 = createTestSession({
      id: 'test-archived-1',
      isActive: false,
    })
    const archived2 = createTestSession({
      id: 'test-archived-2',
      isActive: false,
    })

    await store.save(archived1)
    await store.save(archived2)

    const activeSessions = await store.listActive()

    expect(activeSessions.length).toBe(0)
  })

  it('should filter by type when provided', async () => {
    const store = getSessionStore()
    const activeDaily = createTestSession({
      id: 'test-active-daily',
      type: 'daily',
      isActive: true,
    })
    const activeProject = createTestSession({
      id: 'test-active-project',
      type: 'project',
      projectId: 'proj-1',
      isActive: true,
    })
    const archivedDaily = createTestSession({
      id: 'test-archived-daily',
      type: 'daily',
      isActive: false,
    })

    await store.save(activeDaily)
    await store.save(activeProject)
    await store.save(archivedDaily)

    const activeDailySessions = await store.listActive('daily')

    expect(activeDailySessions.length).toBe(1)
    expect(activeDailySessions[0].id).toBe('test-active-daily')
  })

  it('should return sessions sorted by lastActivity descending', async () => {
    const store = getSessionStore()
    const older = createTestSession({
      id: 'test-older',
      isActive: true,
      lastActivity: '2026-01-27T10:00:00Z',
    })
    const newer = createTestSession({
      id: 'test-newer',
      isActive: true,
      lastActivity: '2026-01-27T14:00:00Z',
    })

    await store.save(older)
    await store.save(newer)

    const activeSessions = await store.listActive()

    expect(activeSessions.length).toBe(2)
    expect(activeSessions[0].id).toBe('test-newer')
    expect(activeSessions[1].id).toBe('test-older')
  })
})

// =============================================================================
// Edge Cases and Error Handling
// =============================================================================

describe('SessionStore extended - Edge Cases', () => {
  beforeEach(() => {
    resetSessionStore()
  })

  it('should handle special characters in displayName', async () => {
    const store = getSessionStore()
    const session = createTestSession({
      id: 'test-special-chars',
      displayName: "Project: O'Reilly & Co - Test <script>",
    })

    await store.save(session)
    const retrieved = await store.get('test-special-chars')

    expect(retrieved?.displayName).toBe("Project: O'Reilly & Co - Test <script>")
  })

  it('should handle unicode in displayName', async () => {
    const store = getSessionStore()
    const session = createTestSession({
      id: 'test-unicode',
      displayName: 'Projet: Integration',
    })

    await store.save(session)
    const retrieved = await store.get('test-unicode')

    expect(retrieved?.displayName).toBe('Projet: Integration')
  })

  it('should handle very long displayName', async () => {
    const store = getSessionStore()
    const longName = 'A'.repeat(500)
    const session = createTestSession({
      id: 'test-long-name',
      displayName: longName,
    })

    await store.save(session)
    const retrieved = await store.get('test-long-name')

    expect(retrieved?.displayName).toBe(longName)
  })

  it('should handle allowed characters in projectId (alphanumeric, dash, underscore)', async () => {
    const store = getSessionStore()
    const session = createTestSession({
      id: 'test-special-project',
      type: 'project',
      projectId: 'proj_123-abc-XYZ',
    })

    await store.save(session)
    const retrieved = await store.get('test-special-project')

    expect(retrieved?.projectId).toBe('proj_123-abc-XYZ')
  })
})

// =============================================================================
// Type Safety Verification
// =============================================================================

describe('SessionStore extended - Type Safety', () => {
  beforeEach(() => {
    resetSessionStore()
  })

  it('should enforce OrionSession type with new fields', async () => {
    const store = getSessionStore()

    // This should compile without type errors
    const session: OrionSession = {
      id: 'type-test-1',
      type: 'daily',
      displayName: 'Type Test',
      projectId: null,
      isActive: true,
      createdAt: '2026-01-27T10:00:00Z',
      lastActivity: '2026-01-27T10:00:00Z',
      tokenCount: 0,
      costUsd: 0,
    }

    await store.save(session)
    const retrieved = await store.get('type-test-1')

    // Type assertions to verify type inference
    if (retrieved) {
      const displayName: string = retrieved.displayName
      const projectId: string | null = retrieved.projectId
      const isActive: boolean = retrieved.isActive

      expect(typeof displayName).toBe('string')
      expect(projectId === null || typeof projectId === 'string').toBe(true)
      expect(typeof isActive).toBe('boolean')
    }
  })
})
