/**
 * SessionManager Tests
 * Epic 3: Conversation Persistence
 * Story 3.11: Daily Session Auto-Resume
 * Story 3.12: Project Session Management
 *
 * TDD RED Phase - Tests written BEFORE implementation.
 * These tests MUST FAIL until session-manager.ts is implemented.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '@/lib/sdk/session-manager';
import {
  SessionStore,
  getSessionStore,
  resetSessionStore,
} from '@/lib/sdk/session-store';
import type { OrionSession, SessionType } from '@/lib/sdk/types';

// =============================================================================
// Test Constants
// =============================================================================

const FIXED_DATE = new Date('2026-01-27T10:00:00.000Z');
const YESTERDAY = new Date('2026-01-26T10:00:00.000Z');
const THIRTY_DAYS_AGO = new Date('2025-12-28T10:00:00.000Z');
const THIRTY_ONE_DAYS_AGO = new Date('2025-12-27T10:00:00.000Z');

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
  };
}

/**
 * Create a daily session for a specific date
 */
function createDailySessionForDate(date: Date): OrionSession {
  const dateStr = date.toISOString().split('T')[0];
  return createTestSession({
    id: `orion-daily-${dateStr}`,
    type: 'daily',
    displayName: `Daily - ${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })}`,
    createdAt: date.toISOString(),
    lastActivity: date.toISOString(),
  });
}

/**
 * Create a project session
 */
function createProjectSession(projectId: string, projectName: string): OrionSession {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return createTestSession({
    id: `orion-project-${slug}`,
    type: 'project',
    displayName: `Project: ${projectName}`,
    projectId,
    createdAt: FIXED_DATE.toISOString(),
    lastActivity: FIXED_DATE.toISOString(),
  });
}

// =============================================================================
// SessionManager Tests
// =============================================================================

describe('SessionManager', () => {
  let store: SessionStore;
  let manager: SessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
    resetSessionStore();
    store = getSessionStore();
    manager = new SessionManager(store);
  });

  afterEach(() => {
    vi.useRealTimers();
    resetSessionStore();
  });

  // ===========================================================================
  // getOrCreateDailySession Tests
  // ===========================================================================

  describe('getOrCreateDailySession', () => {
    it('should return existing today daily session', async () => {
      // Setup: today's daily session exists
      const todaySession = createDailySessionForDate(FIXED_DATE);
      await store.save(todaySession);

      // Action
      const result = await manager.getOrCreateDailySession();

      // Assert: returns existing session, no new session created
      expect(result.id).toBe('orion-daily-2026-01-27');
      expect(result.type).toBe('daily');

      // Verify no duplicate was created
      const allDaily = await store.list('daily');
      expect(allDaily.length).toBe(1);
    });

    it('should create new daily session if none exists', async () => {
      // Setup: no sessions

      // Action
      const result = await manager.getOrCreateDailySession();

      // Assert: new session with type='daily', correct ID and displayName
      expect(result.id).toBe('orion-daily-2026-01-27');
      expect(result.type).toBe('daily');
      expect(result.displayName).toContain('Daily');
      expect(result.isActive).toBe(true);
      expect(result.projectId).toBeNull();
    });

    it('should create new daily session on new day', async () => {
      // Setup: yesterday's daily exists
      const yesterdaySession = createDailySessionForDate(YESTERDAY);
      await store.save(yesterdaySession);

      // Action: call getOrCreateDailySession (system time is FIXED_DATE = today)
      const result = await manager.getOrCreateDailySession();

      // Assert: new session created with today's date
      expect(result.id).toBe('orion-daily-2026-01-27');
      expect(result.id).not.toBe(yesterdaySession.id);

      // Both sessions should exist
      const allDaily = await store.list('daily');
      expect(allDaily.length).toBe(2);
    });

    it('should not return inactive daily session', async () => {
      // Setup: today's daily exists but is inactive
      const inactiveDaily = createDailySessionForDate(FIXED_DATE);
      inactiveDaily.isActive = false;
      await store.save(inactiveDaily);

      // Action
      const result = await manager.getOrCreateDailySession();

      // Assert: should create a new active session
      // (or reactivate - implementation choice, but should return active)
      expect(result.isActive).toBe(true);
      expect(result.id).toBe('orion-daily-2026-01-27');
    });

    it('should handle concurrent calls without creating duplicates', async () => {
      // Setup: no sessions exist

      // Action: call getOrCreateDailySession concurrently multiple times
      const [result1, result2, result3] = await Promise.all([
        manager.getOrCreateDailySession(),
        manager.getOrCreateDailySession(),
        manager.getOrCreateDailySession(),
      ]);

      // Assert: all return the same session
      expect(result1.id).toBe('orion-daily-2026-01-27');
      expect(result2.id).toBe('orion-daily-2026-01-27');
      expect(result3.id).toBe('orion-daily-2026-01-27');

      // Verify only one session was created (no duplicates)
      const allDaily = await store.list('daily');
      expect(allDaily.length).toBe(1);
    });
  });

  // ===========================================================================
  // createSession Tests
  // ===========================================================================

  describe('createSession', () => {
    it('should create daily session with correct format', async () => {
      const result = await manager.createSession('daily');

      expect(result.id).toBe('orion-daily-2026-01-27');
      expect(result.type).toBe('daily');
      expect(result.displayName).toMatch(/Daily.*January.*27.*2026/);
      expect(result.projectId).toBeNull();
    });

    it('should create project session with correct format', async () => {
      const result = await manager.createSession('project', {
        projectId: 'proj-123',
        projectName: 'My Awesome Project',
      });

      expect(result.id).toBe('orion-project-my-awesome-project');
      expect(result.type).toBe('project');
      expect(result.displayName).toBe('Project: My Awesome Project');
      expect(result.projectId).toBe('proj-123');
    });

    it('should create inbox session with correct format', async () => {
      const result = await manager.createSession('inbox');

      expect(result.id).toBe('orion-inbox-2026-01-27');
      expect(result.type).toBe('inbox');
      expect(result.displayName).toBe('Inbox Processing');
      expect(result.projectId).toBeNull();
    });

    it('should create adhoc session with correct format', async () => {
      const result = await manager.createSession('adhoc');

      expect(result.id).toMatch(/^orion-adhoc-[0-9a-f-]{36}$/);
      expect(result.type).toBe('adhoc');
      expect(result.displayName).toMatch(/Session at \d{2}:\d{2}/);
      expect(result.projectId).toBeNull();
    });

    it('should create adhoc session with custom name', async () => {
      const result = await manager.createSession('adhoc', {
        customName: 'Planning Session',
      });

      expect(result.type).toBe('adhoc');
      expect(result.displayName).toBe('Planning Session');
    });

    it('should set isActive=true for new sessions', async () => {
      const dailyResult = await manager.createSession('daily');
      const projectResult = await manager.createSession('project', {
        projectId: 'p1',
        projectName: 'Test',
      });
      const adhocResult = await manager.createSession('adhoc');

      expect(dailyResult.isActive).toBe(true);
      expect(projectResult.isActive).toBe(true);
      expect(adhocResult.isActive).toBe(true);
    });

    it('should set projectId for project sessions', async () => {
      const result = await manager.createSession('project', {
        projectId: 'unique-proj-id',
        projectName: 'Test Project',
      });

      expect(result.projectId).toBe('unique-proj-id');
    });

    it('should set projectId=null for non-project sessions', async () => {
      const daily = await manager.createSession('daily');
      const inbox = await manager.createSession('inbox');
      const adhoc = await manager.createSession('adhoc');

      expect(daily.projectId).toBeNull();
      expect(inbox.projectId).toBeNull();
      expect(adhoc.projectId).toBeNull();
    });

    it('should persist created session to store', async () => {
      const result = await manager.createSession('daily');

      const retrieved = await store.get(result.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(result.id);
      expect(retrieved?.type).toBe(result.type);
    });

    it('should set createdAt and lastActivity timestamps', async () => {
      const result = await manager.createSession('daily');

      expect(result.createdAt).toBe('2026-01-27T10:00:00.000Z');
      expect(result.lastActivity).toBe('2026-01-27T10:00:00.000Z');
    });

    it('should initialize tokenCount and costUsd to 0', async () => {
      const result = await manager.createSession('adhoc');

      expect(result.tokenCount).toBe(0);
      expect(result.costUsd).toBe(0);
    });
  });

  // ===========================================================================
  // resumeOrCreate Tests
  // ===========================================================================

  describe('resumeOrCreate', () => {
    it('should resume today daily session if exists', async () => {
      // Setup: today's daily + other sessions
      const todayDaily = createDailySessionForDate(FIXED_DATE);
      const projectSession = createProjectSession('p1', 'Project One');
      await store.save(todayDaily);
      await store.save(projectSession);

      // Action
      const result = await manager.resumeOrCreate();

      // Assert: priority is today's daily
      expect(result.id).toBe('orion-daily-2026-01-27');
    });

    it('should resume most recent active session if no today daily', async () => {
      // Setup: no today's daily, but a recent project session
      const projectSession = createProjectSession('p1', 'Project One');
      projectSession.lastActivity = FIXED_DATE.toISOString();
      await store.save(projectSession);

      const olderSession = createTestSession({
        id: 'orion-adhoc-old',
        type: 'adhoc',
        lastActivity: YESTERDAY.toISOString(),
      });
      await store.save(olderSession);

      // Action
      const result = await manager.resumeOrCreate();

      // Assert: resumes most recent active
      expect(result.id).toBe('orion-project-project-one');
    });

    it('should create new daily if no active sessions', async () => {
      // Setup: empty store

      // Action
      const result = await manager.resumeOrCreate();

      // Assert: creates new daily
      expect(result.id).toBe('orion-daily-2026-01-27');
      expect(result.type).toBe('daily');
    });

    it('should create new daily if yesterday daily is only session', async () => {
      // Setup: only yesterday's daily exists
      const yesterdaySession = createDailySessionForDate(YESTERDAY);
      await store.save(yesterdaySession);

      // Action
      const result = await manager.resumeOrCreate();

      // Assert: creates today's daily, not resume yesterday
      expect(result.id).toBe('orion-daily-2026-01-27');
      expect(result.id).not.toBe(yesterdaySession.id);
    });

    it('should not resume inactive sessions', async () => {
      // Setup: all sessions have isActive=false
      const inactiveSession = createTestSession({
        id: 'inactive-1',
        isActive: false,
        lastActivity: FIXED_DATE.toISOString(),
      });
      await store.save(inactiveSession);

      // Action
      const result = await manager.resumeOrCreate();

      // Assert: creates new daily instead of resuming inactive
      expect(result.id).toBe('orion-daily-2026-01-27');
      expect(result.isActive).toBe(true);
    });

    it('should prefer today active daily over more recent project session', async () => {
      // Setup: today's daily and a more recently updated project
      const todayDaily = createDailySessionForDate(FIXED_DATE);
      todayDaily.lastActivity = '2026-01-27T08:00:00Z'; // Earlier today
      await store.save(todayDaily);

      const projectSession = createProjectSession('p1', 'Active Project');
      projectSession.lastActivity = '2026-01-27T09:30:00Z'; // More recent
      await store.save(projectSession);

      // Action
      const result = await manager.resumeOrCreate();

      // Assert: today's daily takes priority
      expect(result.id).toBe('orion-daily-2026-01-27');
    });
  });

  // ===========================================================================
  // getOrCreateProjectSession Tests
  // ===========================================================================

  describe('getOrCreateProjectSession', () => {
    it('should resume existing project session', async () => {
      // Setup: project session exists
      const existingProject = createProjectSession('proj-abc', 'My Project');
      await store.save(existingProject);

      // Action
      const result = await manager.getOrCreateProjectSession('proj-abc', 'My Project');

      // Assert
      expect(result.id).toBe('orion-project-my-project');
      expect(result.projectId).toBe('proj-abc');
    });

    it('should create new project session if none exists', async () => {
      // Setup: no matching project session

      // Action
      const result = await manager.getOrCreateProjectSession('new-proj', 'New Project');

      // Assert
      expect(result.id).toBe('orion-project-new-project');
      expect(result.type).toBe('project');
      expect(result.projectId).toBe('new-proj');
      expect(result.displayName).toBe('Project: New Project');
    });

    it('should update lastActivity when resuming', async () => {
      // Setup: project session with old lastActivity
      const oldSession = createProjectSession('proj-old', 'Old Project');
      oldSession.lastActivity = YESTERDAY.toISOString();
      await store.save(oldSession);

      // Action
      const result = await manager.getOrCreateProjectSession('proj-old', 'Old Project');

      // Assert: lastActivity should be updated
      expect(new Date(result.lastActivity).getTime()).toBeGreaterThan(
        new Date(YESTERDAY).getTime()
      );
    });

    it('should find project by projectId not by name', async () => {
      // Setup: project with specific ID
      const project = createProjectSession('unique-id-123', 'Some Name');
      await store.save(project);

      // Action: search with same ID but different name
      const result = await manager.getOrCreateProjectSession('unique-id-123', 'Different Name');

      // Assert: should find existing by ID
      expect(result.id).toBe(project.id);
    });

    it('should create separate sessions for different project IDs', async () => {
      // Setup: two projects
      await manager.getOrCreateProjectSession('proj-1', 'Project One');
      await manager.getOrCreateProjectSession('proj-2', 'Project Two');

      // Assert
      const sessions = await store.list('project');
      expect(sessions.length).toBe(2);
    });

    it('should not resume inactive project session', async () => {
      // Setup: inactive project session
      const inactiveProject = createProjectSession('proj-inactive', 'Inactive Project');
      inactiveProject.isActive = false;
      await store.save(inactiveProject);

      // Action
      const result = await manager.getOrCreateProjectSession('proj-inactive', 'Inactive Project');

      // Assert: should create new or reactivate, but return active
      expect(result.isActive).toBe(true);
    });
  });

  // ===========================================================================
  // listProjectSessions Tests
  // ===========================================================================

  describe('listProjectSessions', () => {
    it('should return only project sessions', async () => {
      // Setup: mixed session types
      await store.save(createDailySessionForDate(FIXED_DATE));
      await store.save(createProjectSession('p1', 'Project One'));
      await store.save(createProjectSession('p2', 'Project Two'));
      await store.save(createTestSession({ id: 'adhoc-1', type: 'adhoc' }));

      // Action
      const result = await manager.listProjectSessions();

      // Assert
      expect(result.length).toBe(2);
      expect(result.every(s => s.type === 'project')).toBe(true);
    });

    it('should return empty array when no project sessions', async () => {
      // Setup: only non-project sessions
      await store.save(createDailySessionForDate(FIXED_DATE));

      // Action
      const result = await manager.listProjectSessions();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return only active project sessions', async () => {
      // Setup: active and inactive project sessions
      const activeProject = createProjectSession('p1', 'Active');
      const inactiveProject = createProjectSession('p2', 'Inactive');
      inactiveProject.isActive = false;
      await store.save(activeProject);
      await store.save(inactiveProject);

      // Action
      const result = await manager.listProjectSessions();

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].displayName).toBe('Project: Active');
    });

    it('should sort by lastActivity descending', async () => {
      // Setup: projects with different lastActivity
      const oldProject = createProjectSession('p1', 'Old Project');
      oldProject.lastActivity = '2026-01-25T10:00:00Z';

      const newProject = createProjectSession('p2', 'New Project');
      newProject.lastActivity = '2026-01-27T10:00:00Z';

      // Save in wrong order
      await store.save(newProject);
      await store.save(oldProject);

      // Action
      const result = await manager.listProjectSessions();

      // Assert: most recent first
      expect(result[0].displayName).toBe('Project: New Project');
      expect(result[1].displayName).toBe('Project: Old Project');
    });
  });

  // ===========================================================================
  // archiveOldDailySessions Tests
  // ===========================================================================

  describe('archiveOldDailySessions', () => {
    it('should archive daily sessions older than threshold', async () => {
      // Setup: sessions from different times
      const oldSession = createDailySessionForDate(THIRTY_ONE_DAYS_AGO);
      const recentSession = createDailySessionForDate(FIXED_DATE);
      await store.save(oldSession);
      await store.save(recentSession);

      // Action: archive sessions older than 30 days
      const archivedCount = await manager.archiveOldDailySessions(30);

      // Assert
      expect(archivedCount).toBe(1);

      const archived = await store.get(oldSession.id);
      expect(archived?.isActive).toBe(false);

      const stillActive = await store.get(recentSession.id);
      expect(stillActive?.isActive).toBe(true);
    });

    it('should not archive project sessions', async () => {
      // Setup: old project session
      const oldProject = createProjectSession('p1', 'Old Project');
      oldProject.createdAt = THIRTY_ONE_DAYS_AGO.toISOString();
      oldProject.lastActivity = THIRTY_ONE_DAYS_AGO.toISOString();
      await store.save(oldProject);

      // Action
      await manager.archiveOldDailySessions(30);

      // Assert: project should remain active
      const project = await store.get(oldProject.id);
      expect(project?.isActive).toBe(true);
    });

    it('should return count of archived sessions', async () => {
      // Setup: multiple old sessions
      const old1 = createTestSession({
        id: 'orion-daily-2025-12-20',
        type: 'daily',
        createdAt: '2025-12-20T10:00:00Z',
        lastActivity: '2025-12-20T10:00:00Z',
      });
      const old2 = createTestSession({
        id: 'orion-daily-2025-12-21',
        type: 'daily',
        createdAt: '2025-12-21T10:00:00Z',
        lastActivity: '2025-12-21T10:00:00Z',
      });
      await store.save(old1);
      await store.save(old2);

      // Action
      const count = await manager.archiveOldDailySessions(30);

      // Assert
      expect(count).toBe(2);
    });

    it('should default to 30 days', async () => {
      // Setup: session exactly 30 days old and 31 days old
      const thirtyDaysSession = createDailySessionForDate(THIRTY_DAYS_AGO);
      const thirtyOneDaysSession = createDailySessionForDate(THIRTY_ONE_DAYS_AGO);
      await store.save(thirtyDaysSession);
      await store.save(thirtyOneDaysSession);

      // Action: no days parameter
      const count = await manager.archiveOldDailySessions();

      // Assert: 30-day-old should NOT be archived (boundary), 31-day-old should be
      expect(count).toBe(1);

      const thirtyDay = await store.get(thirtyDaysSession.id);
      expect(thirtyDay?.isActive).toBe(true);

      const thirtyOneDay = await store.get(thirtyOneDaysSession.id);
      expect(thirtyOneDay?.isActive).toBe(false);
    });

    it('should not archive inbox sessions', async () => {
      // Setup: old inbox session
      const oldInbox = createTestSession({
        id: 'orion-inbox-2025-12-20',
        type: 'inbox',
        displayName: 'Inbox Processing',
        createdAt: THIRTY_ONE_DAYS_AGO.toISOString(),
        lastActivity: THIRTY_ONE_DAYS_AGO.toISOString(),
      });
      await store.save(oldInbox);

      // Action
      await manager.archiveOldDailySessions(30);

      // Assert: inbox should remain (only daily gets auto-archived)
      const inbox = await store.get(oldInbox.id);
      expect(inbox?.isActive).toBe(true);
    });

    it('should return 0 when no sessions to archive', async () => {
      // Setup: only recent sessions
      await store.save(createDailySessionForDate(FIXED_DATE));

      // Action
      const count = await manager.archiveOldDailySessions(30);

      // Assert
      expect(count).toBe(0);
    });

    it('should not re-archive already archived sessions', async () => {
      // Setup: already archived old session
      const archivedSession = createTestSession({
        id: 'orion-daily-2025-12-20',
        type: 'daily',
        isActive: false,
        createdAt: '2025-12-20T10:00:00Z',
        lastActivity: '2025-12-20T10:00:00Z',
      });
      await store.save(archivedSession);

      // Action
      const count = await manager.archiveOldDailySessions(30);

      // Assert: should not count already archived
      expect(count).toBe(0);
    });
  });

  // ===========================================================================
  // Edge Cases and Error Handling
  // ===========================================================================

  describe('edge cases', () => {
    it('should handle concurrent getOrCreateDailySession calls', async () => {
      // Action: call concurrently
      const [result1, result2] = await Promise.all([
        manager.getOrCreateDailySession(),
        manager.getOrCreateDailySession(),
      ]);

      // Assert: both should return the same session
      expect(result1.id).toBe(result2.id);

      // Only one session should exist
      const dailySessions = await store.list('daily');
      expect(dailySessions.length).toBe(1);
    });

    it('should handle special characters in project names', async () => {
      const result = await manager.createSession('project', {
        projectId: 'proj-special',
        projectName: "Project with 'Special' & <Characters>!",
      });

      // Assert: ID should be properly slugified
      expect(result.id).toMatch(/^orion-project-[a-z0-9-]+$/);
      expect(result.displayName).toBe("Project: Project with 'Special' & <Characters>!");
    });

    it('should handle empty project name', async () => {
      const result = await manager.createSession('project', {
        projectId: 'proj-empty',
        projectName: '',
      });

      expect(result.displayName).toBe('Project: Untitled');
    });

    it('should handle whitespace-only project name', async () => {
      const result = await manager.createSession('project', {
        projectId: 'proj-whitespace',
        projectName: '   ',
      });

      expect(result.displayName).toBe('Project: Untitled');
    });
  });
});
