/**
 * Session Factory for Orion Butler Tests
 *
 * Creates test sessions (Daily, Project, Inbox, Ad-hoc) with auto-cleanup.
 *
 * @see TEA knowledge: data-factories.md
 */

export type SessionType = 'daily' | 'project' | 'inbox' | 'adhoc';

export interface TestSession {
  id: string;
  type: SessionType;
  name: string;
  createdAt: Date;
}

export class SessionFactory {
  private createdSessions: string[] = [];
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3000/api';
  }

  /**
   * Create a test session
   */
  async createSession(overrides: Partial<TestSession> = {}): Promise<TestSession> {
    const session: TestSession = {
      id: `test-session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'adhoc',
      name: `Test Session ${Date.now()}`,
      createdAt: new Date(),
      ...overrides,
    };

    // In production, this would call the API
    // For now, track for cleanup
    this.createdSessions.push(session.id);

    return session;
  }

  /**
   * Create a daily briefing session
   */
  async createDailySession(): Promise<TestSession> {
    return this.createSession({
      type: 'daily',
      name: `Daily Briefing ${new Date().toISOString().split('T')[0]}`,
    });
  }

  /**
   * Create a project session
   */
  async createProjectSession(projectName: string): Promise<TestSession> {
    return this.createSession({
      type: 'project',
      name: `Project: ${projectName}`,
    });
  }

  /**
   * Cleanup all created sessions
   */
  async cleanup(): Promise<void> {
    for (const sessionId of this.createdSessions) {
      try {
        // In production: await fetch(`${this.apiUrl}/sessions/${sessionId}`, { method: 'DELETE' });
        console.log(`[SessionFactory] Cleaned up session: ${sessionId}`);
      } catch (error) {
        console.warn(`[SessionFactory] Failed to cleanup session ${sessionId}:`, error);
      }
    }
    this.createdSessions = [];
  }
}
