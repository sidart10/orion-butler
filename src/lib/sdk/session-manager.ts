/**
 * Session Manager - High-level Session Management
 * Stories 3.6, 3.11, 3.12
 *
 * Provides business logic for session creation, auto-resume, and archival.
 * Uses SessionStore for persistence and session-naming.ts for ID/display generation.
 */

import { SessionStore } from './session-store';
import {
  generateSessionId,
  generateDisplayName,
  isToday,
} from './session-naming';
import type { OrionSession, SessionType } from './types';

/** M7: Default number of days to keep daily sessions before auto-archiving */
export const DEFAULT_ARCHIVE_DAYS = 30;

/**
 * High-level session management for Orion Butler.
 *
 * Provides business logic for:
 * - Session creation with proper ID/display name generation
 * - Auto-resume on app launch (Story 3.11)
 * - Project session persistence (Story 3.12)
 * - Daily session archival after configurable retention period
 *
 * Uses three-layer architecture:
 * - SessionManager (this) - business logic and orchestration
 * - SessionStore - persistence layer (SQLite/in-memory)
 * - session-naming.ts - ID and display name generation
 *
 * @example
 * ```typescript
 * const store = new SessionStore();
 * await store.initialize();
 * const manager = new SessionManager(store);
 *
 * // Auto-resume or create daily session on app launch
 * const session = await manager.resumeOrCreate();
 *
 * // Get or create project-specific session
 * const projectSession = await manager.getOrCreateProjectSession(
 *   'proj-123',
 *   'My Project'
 * );
 * ```
 */
export class SessionManager {
  private store: SessionStore;
  private dailySessionLock: Promise<OrionSession> | null = null;
  private projectSessionLocks: Map<string, Promise<OrionSession>> = new Map();

  constructor(store: SessionStore) {
    this.store = store;
  }

  /**
   * Get or create session for app launch
   * Story 3.11: Daily Session Auto-Resume
   *
   * Uses a lock to prevent race conditions when multiple concurrent
   * calls attempt to create the daily session.
   */
  async getOrCreateDailySession(): Promise<OrionSession> {
    // If there's an in-flight creation, wait for it
    if (this.dailySessionLock) {
      return this.dailySessionLock;
    }

    // Check for existing today's active daily session
    const existing = await this.store.findTodaysDailySession();
    if (existing && existing.isActive) {
      return existing;
    }

    // Acquire lock and create new daily session
    this.dailySessionLock = this.createSession('daily');
    try {
      const session = await this.dailySessionLock;
      return session;
    } finally {
      this.dailySessionLock = null;
    }
  }

  /**
   * Create a new session of given type
   */
  async createSession(
    type: SessionType,
    options?: {
      projectId?: string;
      projectName?: string;
      customName?: string;
    }
  ): Promise<OrionSession> {
    // For project sessions, determine slug source (name preferred, fallback to ID)
    let projectSlugSource = options?.projectName ?? options?.projectId;
    if (type === 'project' && (!projectSlugSource || projectSlugSource.trim() === '')) {
      projectSlugSource = 'untitled';
    }

    const id = generateSessionId(type, projectSlugSource);
    const displayName = generateDisplayName(type, {
      projectName: options?.projectName,
      customName: options?.customName,
    });

    const now = new Date().toISOString();
    const session: OrionSession = {
      id,
      type,
      displayName,
      projectId: options?.projectId ?? null,
      isActive: true,
      createdAt: now,
      lastActivity: now,
      tokenCount: 0,
      costUsd: 0,
    };

    await this.store.save(session);
    return session;
  }

  /**
   * Resume or create session on app launch
   * Story 3.11: Daily Session Auto-Resume
   *
   * Returns the most appropriate session to load into chat.
   *
   * Priority order:
   * 1. Today's active daily session (if exists)
   * 2. Most recent active session (project/inbox/adhoc)
   * 3. New daily session (created as fallback)
   *
   * Edge cases:
   * - Yesterday's daily: Creates new daily instead of resuming stale session
   * - Inactive sessions: Skipped entirely (archived/soft-deleted)
   * - No sessions exist: Creates new daily session
   *
   * @returns Promise<OrionSession> - Always returns a valid session (never null)
   */
  async resumeOrCreate(): Promise<OrionSession> {
    const toResume = await this.store.findSessionToResume();

    if (toResume) {
      // Check if daily session is from today
      if (toResume.type === 'daily') {
        const createdDate = new Date(toResume.createdAt);
        if (!isToday(createdDate)) {
          // Yesterday's daily - create new one
          return this.createSession('daily');
        }
      }
      return toResume;
    }

    // No session to resume - create new daily
    return this.createSession('daily');
  }

  /**
   * Get or resume a project session
   * Story 3.12: Project sessions persist indefinitely
   *
   * Uses a per-projectId lock to prevent race conditions when multiple
   * concurrent calls attempt to create the same project session.
   *
   * Searches by projectId first, then falls back to ID lookup by name.
   */
  async getOrCreateProjectSession(
    projectId: string,
    projectName: string
  ): Promise<OrionSession> {
    // Check if there's an in-flight creation for this projectId
    const existingLock = this.projectSessionLocks.get(projectId);
    if (existingLock) {
      return existingLock;
    }

    // Acquire lock and delegate to implementation
    const lockPromise = this._getOrCreateProjectSessionLocked(projectId, projectName);
    this.projectSessionLocks.set(projectId, lockPromise);

    try {
      return await lockPromise;
    } finally {
      this.projectSessionLocks.delete(projectId);
    }
  }

  /**
   * Internal implementation of getOrCreateProjectSession
   * Called under lock to prevent concurrent creation.
   */
  private async _getOrCreateProjectSessionLocked(
    projectId: string,
    projectName: string
  ): Promise<OrionSession> {
    // First, try to find by projectId using efficient indexed lookup (M3)
    const existingByProjectId = await this.store.findByProjectId(projectId);

    if (existingByProjectId) {
      // Update last activity
      await this.store.updateActivity(existingByProjectId.id, 0, 0);
      // Return updated session (guaranteed to exist since we just updated it)
      const updated = await this.store.get(existingByProjectId.id);
      if (!updated) {
        throw new Error(`Session ${existingByProjectId.id} unexpectedly deleted during update`);
      }
      return updated;
    }

    // Fallback: try to find by generated ID (from projectName)
    const expectedId = generateSessionId('project', projectName);
    const existingById = await this.store.get(expectedId);
    if (existingById && existingById.isActive) {
      // Update last activity
      await this.store.updateActivity(existingById.id, 0, 0);
      // Return updated session (guaranteed to exist since we just updated it)
      const updated = await this.store.get(existingById.id);
      if (!updated) {
        throw new Error(`Session ${existingById.id} unexpectedly deleted during update`);
      }
      return updated;
    }

    // No existing active session - create new one
    return this.createSession('project', { projectId, projectName });
  }

  /**
   * List all active project sessions (never auto-archived)
   * Sorted by lastActivity descending
   */
  async listProjectSessions(): Promise<OrionSession[]> {
    const all = await this.store.listActive('project');
    // Already sorted by lastActivity DESC from store
    return all;
  }

  /**
   * Archive old daily sessions (but not project sessions)
   * Called periodically or on app launch
   *
   * Only archives 'daily' type sessions. Project, inbox, and adhoc
   * sessions are not auto-archived.
   */
  async archiveOldDailySessions(
    daysToKeep: number = DEFAULT_ARCHIVE_DAYS
  ): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    const dailySessions = await this.store.list('daily');
    let archived = 0;

    for (const session of dailySessions) {
      const lastActive = new Date(session.lastActivity);
      if (lastActive < cutoff && session.isActive) {
        // Mark as inactive (soft archive)
        await this.store.setActive(session.id, false);
        archived++;
      }
    }

    return archived;
  }
}
