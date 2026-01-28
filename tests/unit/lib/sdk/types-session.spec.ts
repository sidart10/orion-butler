/**
 * OrionSessionSchema Extension Tests
 * Epic 3: Conversation Persistence
 *
 * TDD RED Phase - Tests written BEFORE implementation.
 * These tests MUST FAIL until types.ts is updated with new fields.
 *
 * New fields to add:
 * - displayName: z.string() - Required for UI display
 * - projectId: z.string().nullable() - Optional project link
 * - isActive: z.boolean().default(true) - For soft-archive functionality
 */

import { describe, it, expect } from 'vitest'
import { OrionSessionSchema } from '@/lib/sdk/types'

// =============================================================================
// Test Fixtures
// =============================================================================

const validBaseSession = {
  id: 'orion-daily-2026-01-27',
  type: 'daily' as const,
  createdAt: '2026-01-27T10:00:00Z',
  lastActivity: '2026-01-27T14:30:00Z',
}

const fullValidSession = {
  ...validBaseSession,
  displayName: 'Daily - January 27, 2026',
  projectId: null,
  isActive: true,
  context: { theme: 'dark' },
  tokenCount: 1500,
  costUsd: 0.05,
}

// =============================================================================
// displayName Field Tests
// =============================================================================

describe('OrionSessionSchema - displayName field', () => {
  it('should require displayName (fail without it)', () => {
    const sessionWithoutDisplayName = {
      ...validBaseSession,
      projectId: null,
      // missing displayName
    }

    const result = OrionSessionSchema.safeParse(sessionWithoutDisplayName)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('displayName')
    }
  })

  it('should accept string values for displayName', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Daily - January 27, 2026',
      projectId: null,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.displayName).toBe('Daily - January 27, 2026')
    }
  })

  it('should accept empty string for displayName', () => {
    const session = {
      ...validBaseSession,
      displayName: '',
      projectId: null,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.displayName).toBe('')
    }
  })

  it('should reject non-string values for displayName', () => {
    const invalidSessions = [
      { ...validBaseSession, displayName: 123, projectId: null },
      { ...validBaseSession, displayName: true, projectId: null },
      { ...validBaseSession, displayName: null, projectId: null },
      { ...validBaseSession, displayName: ['array'], projectId: null },
      { ...validBaseSession, displayName: { obj: 'value' }, projectId: null },
    ]

    invalidSessions.forEach((session) => {
      const result = OrionSessionSchema.safeParse(session)
      expect(result.success).toBe(false)
    })
  })
})

// =============================================================================
// projectId Field Tests
// =============================================================================

describe('OrionSessionSchema - projectId field', () => {
  it('should accept null for projectId (non-project sessions)', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Daily - January 27, 2026',
      projectId: null,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectId).toBeNull()
    }
  })

  it('should accept string for projectId (project sessions)', () => {
    const session = {
      ...validBaseSession,
      type: 'project' as const,
      displayName: 'Project: Orion Butler',
      projectId: 'proj-orion-butler',
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectId).toBe('proj-orion-butler')
    }
  })

  it('should accept empty string for projectId', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Daily - January 27, 2026',
      projectId: '',
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectId).toBe('')
    }
  })

  it('should reject non-string non-null values for projectId', () => {
    const invalidSessions = [
      { ...validBaseSession, displayName: 'test', projectId: 123 },
      { ...validBaseSession, displayName: 'test', projectId: true },
      { ...validBaseSession, displayName: 'test', projectId: ['array'] },
      { ...validBaseSession, displayName: 'test', projectId: { obj: 'value' } },
      { ...validBaseSession, displayName: 'test', projectId: undefined },
    ]

    invalidSessions.forEach((session) => {
      const result = OrionSessionSchema.safeParse(session)
      expect(result.success).toBe(false)
    })
  })

  it('should require projectId field (not optional)', () => {
    const sessionWithoutProjectId = {
      ...validBaseSession,
      displayName: 'Daily - January 27, 2026',
      // missing projectId
    }

    const result = OrionSessionSchema.safeParse(sessionWithoutProjectId)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('projectId')
    }
  })
})

// =============================================================================
// isActive Field Tests
// =============================================================================

describe('OrionSessionSchema - isActive field', () => {
  it('should default to true when not provided', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Daily - January 27, 2026',
      projectId: null,
      // isActive not provided - should default to true
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(true)
    }
  })

  it('should accept true for isActive', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Daily - January 27, 2026',
      projectId: null,
      isActive: true,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(true)
    }
  })

  it('should accept false for isActive (archived sessions)', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Daily - January 27, 2026',
      projectId: null,
      isActive: false,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(false)
    }
  })

  it('should reject non-boolean values for isActive', () => {
    const invalidSessions = [
      { ...validBaseSession, displayName: 'test', projectId: null, isActive: 'true' },
      { ...validBaseSession, displayName: 'test', projectId: null, isActive: 1 },
      { ...validBaseSession, displayName: 'test', projectId: null, isActive: 0 },
      { ...validBaseSession, displayName: 'test', projectId: null, isActive: null },
      { ...validBaseSession, displayName: 'test', projectId: null, isActive: [] },
    ]

    invalidSessions.forEach((session) => {
      const result = OrionSessionSchema.safeParse(session)
      expect(result.success).toBe(false)
    })
  })
})

// =============================================================================
// Full Schema Validation Tests
// =============================================================================

describe('OrionSessionSchema - Full schema validation', () => {
  it('should validate a complete session with all new fields', () => {
    const result = OrionSessionSchema.safeParse(fullValidSession)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('orion-daily-2026-01-27')
      expect(result.data.type).toBe('daily')
      expect(result.data.displayName).toBe('Daily - January 27, 2026')
      expect(result.data.projectId).toBeNull()
      expect(result.data.isActive).toBe(true)
      expect(result.data.tokenCount).toBe(1500)
      expect(result.data.costUsd).toBe(0.05)
    }
  })

  // M11: Non-negative validation for tokenCount and costUsd
  it('should reject negative tokenCount', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Test',
      projectId: null,
      tokenCount: -100,
    }

    const result = OrionSessionSchema.safeParse(session)
    expect(result.success).toBe(false)
  })

  it('should reject negative costUsd', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Test',
      projectId: null,
      costUsd: -0.05,
    }

    const result = OrionSessionSchema.safeParse(session)
    expect(result.success).toBe(false)
  })

  it('should validate session with minimal required fields (displayName, projectId)', () => {
    const minimalSession = {
      id: 'orion-adhoc-550e8400-e29b-41d4-a716-446655440000',
      type: 'adhoc' as const,
      createdAt: '2026-01-27T10:00:00Z',
      lastActivity: '2026-01-27T10:00:00Z',
      displayName: 'Quick Chat',
      projectId: null,
      // isActive defaults to true
      // tokenCount defaults to 0
      // costUsd defaults to 0
    }

    const result = OrionSessionSchema.safeParse(minimalSession)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.displayName).toBe('Quick Chat')
      expect(result.data.projectId).toBeNull()
      expect(result.data.isActive).toBe(true)
      expect(result.data.tokenCount).toBe(0)
      expect(result.data.costUsd).toBe(0)
    }
  })

  it('should validate project session with projectId', () => {
    const projectSession = {
      id: 'orion-project-my-app',
      type: 'project' as const,
      createdAt: '2026-01-27T10:00:00Z',
      lastActivity: '2026-01-27T14:30:00Z',
      displayName: 'Project: My App',
      projectId: 'proj-my-app-123',
      isActive: true,
    }

    const result = OrionSessionSchema.safeParse(projectSession)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('project')
      expect(result.data.displayName).toBe('Project: My App')
      expect(result.data.projectId).toBe('proj-my-app-123')
    }
  })

  it('should validate archived session (isActive: false)', () => {
    const archivedSession = {
      id: 'orion-daily-2026-01-20',
      type: 'daily' as const,
      createdAt: '2026-01-20T10:00:00Z',
      lastActivity: '2026-01-20T18:00:00Z',
      displayName: 'Daily - January 20, 2026',
      projectId: null,
      isActive: false,
      tokenCount: 5000,
      costUsd: 0.15,
    }

    const result = OrionSessionSchema.safeParse(archivedSession)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(false)
    }
  })

  it('should validate inbox session', () => {
    const inboxSession = {
      id: 'orion-inbox-2026-01-27',
      type: 'inbox' as const,
      createdAt: '2026-01-27T08:00:00Z',
      lastActivity: '2026-01-27T09:30:00Z',
      displayName: 'Inbox Processing',
      projectId: null,
    }

    const result = OrionSessionSchema.safeParse(inboxSession)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('inbox')
      expect(result.data.displayName).toBe('Inbox Processing')
      expect(result.data.projectId).toBeNull()
      expect(result.data.isActive).toBe(true)
    }
  })
})

// =============================================================================
// Type Inference Tests
// =============================================================================

describe('OrionSessionSchema - Type inference', () => {
  it('should infer correct types for new fields', () => {
    const session = OrionSessionSchema.parse({
      id: 'test-1',
      type: 'daily',
      createdAt: '2026-01-27T10:00:00Z',
      lastActivity: '2026-01-27T10:00:00Z',
      displayName: 'Test Session',
      projectId: null,
      isActive: true,
    })

    // TypeScript compile-time checks (these will fail to compile if types are wrong)
    const displayName: string = session.displayName
    const projectId: string | null = session.projectId
    const isActive: boolean = session.isActive

    expect(typeof displayName).toBe('string')
    expect(projectId).toBeNull()
    expect(typeof isActive).toBe('boolean')
  })
})

// =============================================================================
// Edge Cases
// =============================================================================

describe('OrionSessionSchema - Edge cases', () => {
  it('should handle unicode characters in displayName', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Projet Francais - 27 janvier 2026',
      projectId: null,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.displayName).toBe('Projet Francais - 27 janvier 2026')
    }
  })

  it('should handle emoji in displayName', () => {
    const session = {
      ...validBaseSession,
      displayName: 'Project: Orion Butler 🚀',
      projectId: 'proj-orion',
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.displayName).toBe('Project: Orion Butler 🚀')
    }
  })

  it('should handle very long displayName', () => {
    const longName = 'A'.repeat(500)
    const session = {
      ...validBaseSession,
      displayName: longName,
      projectId: null,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.displayName).toBe(longName)
    }
  })

  it('should handle special characters in projectId', () => {
    const session = {
      ...validBaseSession,
      type: 'project' as const,
      displayName: 'Project: Test',
      projectId: 'proj_123-abc',
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectId).toBe('proj_123-abc')
    }
  })

  // M2: Stricter projectId validation tests
  it('should reject projectId longer than 100 characters', () => {
    const longId = 'a'.repeat(101)
    const session = {
      ...validBaseSession,
      type: 'project' as const,
      displayName: 'Project: Test',
      projectId: longId,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(false)
  })

  it('should accept projectId with exactly 100 characters', () => {
    const maxLengthId = 'a'.repeat(100)
    const session = {
      ...validBaseSession,
      type: 'project' as const,
      displayName: 'Project: Test',
      projectId: maxLengthId,
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
  })

  it('should reject projectId with invalid characters (spaces)', () => {
    const session = {
      ...validBaseSession,
      type: 'project' as const,
      displayName: 'Project: Test',
      projectId: 'proj with spaces',
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(false)
  })

  it('should reject projectId with invalid characters (special chars)', () => {
    const session = {
      ...validBaseSession,
      type: 'project' as const,
      displayName: 'Project: Test',
      projectId: 'proj@#$%',
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(false)
  })

  it('should accept projectId with alphanumeric, dash, and underscore', () => {
    const session = {
      ...validBaseSession,
      type: 'project' as const,
      displayName: 'Project: Test',
      projectId: 'my_project-123',
    }

    const result = OrionSessionSchema.safeParse(session)

    expect(result.success).toBe(true)
  })
})
