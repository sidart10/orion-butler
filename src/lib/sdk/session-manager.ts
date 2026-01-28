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

export class SessionManager {
  private store: SessionStore;
  private dailySessionLock: Promise<OrionSession> | null = null;

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
    // For project sessions, handle empty/whitespace names
    let idContext = options?.projectName ?? options?.projectId;
    if (type === 'project' && (!idContext || idContext.trim() === '')) {
      idContext = 'untitled';
    }

    const id = generateSessionId(type, idContext);
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
   * Returns session to load into chat
   *
   * Priority:
   * 1. Today's active daily session
   * 2. Most recent active session (if not yesterday's daily)
   * 3. Create new daily as fallback
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
   * Searches by projectId first, then falls back to ID lookup by name.
   */
  async getOrCreateProjectSession(
    projectId: string,
    projectName: string
  ): Promise<OrionSession> {
    // First, try to find by projectId (more reliable than name-based ID)
    const allProjects = await this.store.list('project');
    const existingByProjectId = allProjects.find(
      (s) => s.projectId === projectId && s.isActive
    );

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
  async archiveOldDailySessions(daysToKeep: number = 30): Promise<number> {
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
