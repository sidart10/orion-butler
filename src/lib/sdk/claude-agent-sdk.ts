/**
 * Claude Agent SDK Wrapper
 * Story 2.2/2.3: SDK Integration
 *
 * Wrapper around the Claude Agent SDK that:
 * - Provides a clean interface for the frontend
 * - Uses neverthrow Result types for error handling
 * - Manages sessions with proper ID generation
 * - Tracks budget and emits warnings
 *
 * NOTE: This is the frontend-side wrapper. The actual SDK calls
 * happen in the Rust sidecar (sdk-runner.mjs). This class
 * communicates with the Rust backend via Tauri IPC.
 */

import { ok, err, Result } from 'neverthrow';
import type {
  IAgentSDK,
  QueryOptions,
  StreamMessage,
  OrionSession,
  SessionType,
} from './types';
import { OrionError, ErrorCodeMap } from './types';
import { BudgetTracker } from './budget-tracker';
import { wrapSdkError, shouldRetry, getRetryDelay } from './errors';

// =============================================================================
// Session ID Generation
// =============================================================================

/**
 * Generate a session ID based on type
 * Per architecture.md naming conventions
 */
export function generateSessionId(type: SessionType, slug?: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

  switch (type) {
    case 'daily':
      return `orion-daily-${dateStr}`;
    case 'project':
      if (!slug) throw new Error('Project sessions require a slug');
      return `orion-project-${slug}`;
    case 'inbox':
      return `orion-inbox-${dateStr}`;
    case 'adhoc':
      return `orion-adhoc-${crypto.randomUUID()}`;
    default:
      return `orion-adhoc-${crypto.randomUUID()}`;
  }
}

// =============================================================================
// Main SDK Wrapper Class
// =============================================================================

/**
 * Frontend SDK wrapper that communicates with Rust backend
 *
 * NOTE: The actual SDK calls are made by the Rust sidecar.
 * This class provides the interface and manages state.
 *
 * @deprecated For streaming chat, use useStreamingMachine hook which uses Tauri IPC directly.
 * The actual SDK runs in the Node.js sidecar (sdk-runner.mjs).
 * This class is retained for potential non-streaming use cases.
 */
export class ClaudeAgentSDK implements IAgentSDK {
  private sessions: Map<string, OrionSession> = new Map();

  /**
   * Query Claude via Tauri IPC
   *
   * This is a placeholder implementation. The actual implementation
   * will invoke Tauri commands and listen to events.
   *
   * @param prompt - User message
   * @param options - Query options
   */
  async *query(
    prompt: string,
    options?: QueryOptions
  ): AsyncGenerator<Result<StreamMessage, OrionError>, void> {
    const budgetTracker = new BudgetTracker(options?.maxBudgetUsd);
    const startTime = performance.now();
    let attemptNumber = 0;

    // Generate or use provided session ID
    const sessionId = options?.sessionId ?? generateSessionId('adhoc');

    // Track session
    if (!this.sessions.has(sessionId)) {
      const sessionType = this.inferSessionType(sessionId);
      const now = new Date().toISOString();
      this.sessions.set(sessionId, {
        id: sessionId,
        type: sessionType,
        displayName: this.generateDisplayName(sessionType, sessionId),
        projectId: sessionType === 'project' ? this.extractProjectSlug(sessionId) : null,
        isActive: true,
        createdAt: now,
        lastActivity: now,
        tokenCount: 0,
        costUsd: 0,
      });
    }

    while (true) {
      try {
        // TODO: In Phase 4, this will invoke Tauri IPC
        // For now, yield a placeholder response

        // Simulate streaming response
        yield ok({
          type: 'text',
          content: `Processing: "${prompt}" (session: ${sessionId})`,
          isPartial: true,
        } as StreamMessage);

        await new Promise((resolve) => setTimeout(resolve, 100));

        yield ok({
          type: 'text',
          content: ' [SDK wrapper ready - waiting for Tauri IPC integration]',
          isPartial: false,
        } as StreamMessage);

        // Simulate completion
        const durationMs = Math.round(performance.now() - startTime);
        const costUsd = 0.001; // Placeholder
        const tokenCount = 50; // Placeholder

        // Check budget
        const budgetStatus = budgetTracker.addCost(costUsd, tokenCount);

        if (budgetStatus.warningThreshold && !budgetStatus.exceedsBudget) {
          yield ok({
            type: 'budget_warning',
            currentCostUsd: budgetStatus.currentCostUsd,
            maxBudgetUsd: options?.maxBudgetUsd ?? 0,
            percentage: 80,
          } as StreamMessage);
        }

        if (budgetStatus.exceedsBudget) {
          yield err(
            new OrionError(
              ErrorCodeMap.BUDGET_EXCEEDED,
              `Budget exceeded: ${budgetStatus.currentCostUsd} >= ${options?.maxBudgetUsd}`
            )
          );
          return;
        }

        // Update session
        const session = this.sessions.get(sessionId);
        if (session) {
          session.lastActivity = new Date().toISOString();
          session.tokenCount += tokenCount;
          session.costUsd += costUsd;
        }

        yield ok({
          type: 'complete',
          sessionId,
          costUsd,
          tokenCount,
          durationMs,
        } as StreamMessage);

        // Success - exit retry loop
        return;
      } catch (error) {
        const orionError = wrapSdkError(error, attemptNumber);

        // If recoverable and has retry delay, wait and retry
        if (shouldRetry(orionError, attemptNumber)) {
          const delay = getRetryDelay(attemptNumber);
          if (delay) {
            attemptNumber++;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // Not recoverable or exhausted retries
        yield err(orionError);
        return;
      }
    }
  }

  /**
   * Get a session by ID
   */
  async getSession(
    sessionId: string
  ): Promise<Result<OrionSession | null, OrionError>> {
    try {
      const session = this.sessions.get(sessionId) ?? null;
      return ok(session);
    } catch (error) {
      return err(wrapSdkError(error));
    }
  }

  /**
   * List sessions by type
   */
  async listSessions(
    type?: SessionType
  ): Promise<Result<OrionSession[], OrionError>> {
    try {
      const sessions = Array.from(this.sessions.values());
      if (type) {
        return ok(sessions.filter((s) => s.type === type));
      }
      return ok(sessions);
    } catch (error) {
      return err(wrapSdkError(error));
    }
  }

  /**
   * End and cleanup a session
   */
  async endSession(sessionId: string): Promise<Result<void, OrionError>> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date().toISOString();
        // Keep in map for history, but could remove for cleanup
      }
      return ok(undefined);
    } catch (error) {
      return err(wrapSdkError(error));
    }
  }

  /**
   * Check if SDK is ready
   */
  async isReady(): Promise<boolean> {
    // TODO: Check if Claude CLI is available and authenticated
    // This will be implemented in Phase 4 with Tauri integration
    return true;
  }

  /**
   * Infer session type from ID pattern
   */
  private inferSessionType(sessionId: string): SessionType {
    if (sessionId.startsWith('orion-daily-')) return 'daily';
    if (sessionId.startsWith('orion-project-')) return 'project';
    if (sessionId.startsWith('orion-inbox-')) return 'inbox';
    return 'adhoc';
  }

  /**
   * Generate a display name based on session type
   */
  private generateDisplayName(type: SessionType, sessionId: string): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    switch (type) {
      case 'daily':
        return `Daily - ${dateStr}`;
      case 'project': {
        const slug = this.extractProjectSlug(sessionId);
        return `Project: ${slug || 'Untitled'}`;
      }
      case 'inbox':
        return 'Inbox Processing';
      case 'adhoc': {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `Session at ${hours}:${minutes}`;
      }
      default:
        return 'Session';
    }
  }

  /**
   * Extract project slug from session ID
   */
  private extractProjectSlug(sessionId: string): string | null {
    if (!sessionId.startsWith('orion-project-')) return null;
    return sessionId.replace('orion-project-', '');
  }
}
