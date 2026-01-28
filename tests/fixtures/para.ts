/**
 * Shared Test Fixtures for PARA System
 * Epic 4 Plan 4: Routing & Archival Logic
 *
 * Factory functions for creating test entities with sensible defaults.
 */

import type { InboxItem } from '@/lib/para/schemas/inbox';
import type { ProjectMeta } from '@/lib/para/schemas/project';
import type { AreaMeta } from '@/lib/para/schemas/area';
import type { ArchivedItem, ArchiveIndex } from '@/lib/para/schemas/archive';

// =============================================================================
// Inbox Item Factory
// =============================================================================

/**
 * Creates a valid InboxItem with optional overrides
 */
export function createInboxItem(overrides: Partial<InboxItem> = {}): InboxItem {
  const now = new Date().toISOString();
  return {
    id: `inbox_${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    title: 'Test Inbox Item',
    type: 'task',
    processed: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * Creates an inbox item with explicit target project
 */
export function createInboxItemWithProject(
  projectId: string,
  overrides: Partial<InboxItem> = {}
): InboxItem {
  return createInboxItem({
    target_project: projectId,
    ...overrides,
  });
}

/**
 * Creates an inbox item with explicit target area
 */
export function createInboxItemWithArea(
  areaId: string,
  overrides: Partial<InboxItem> = {}
): InboxItem {
  return createInboxItem({
    target_area: areaId,
    ...overrides,
  });
}

/**
 * Creates a high-priority inbox item with due date
 */
export function createUrgentInboxItem(overrides: Partial<InboxItem> = {}): InboxItem {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return createInboxItem({
    priority_score: 90,
    due_date: tomorrow.toISOString(),
    type: 'task',
    ...overrides,
  });
}

// =============================================================================
// Project Factory
// =============================================================================

/**
 * Creates a valid ProjectMeta with optional overrides
 */
export function createProject(overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  const now = new Date().toISOString();
  return {
    id: `proj_${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    name: 'Test Project',
    status: 'active',
    priority: 'medium',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * Creates a completed project ready for archival
 */
export function createCompletedProject(overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  return createProject({
    status: 'completed',
    ...overrides,
  });
}

/**
 * Creates an active project (not ready for archival)
 */
export function createActiveProject(overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  return createProject({
    status: 'active',
    ...overrides,
  });
}

/**
 * Creates a paused project (not ready for archival)
 */
export function createPausedProject(overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  return createProject({
    status: 'paused',
    ...overrides,
  });
}

/**
 * Creates a cancelled project (not ready for archival)
 */
export function createCancelledProject(overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  return createProject({
    status: 'cancelled',
    ...overrides,
  });
}

// =============================================================================
// Area Factory
// =============================================================================

/**
 * Creates a valid AreaMeta with optional overrides
 */
export function createArea(overrides: Partial<AreaMeta> = {}): AreaMeta {
  const now = new Date().toISOString();
  return {
    id: `area_${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    name: 'Test Area',
    status: 'active',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * Creates a dormant area ready for archival
 */
export function createDormantArea(overrides: Partial<AreaMeta> = {}): AreaMeta {
  return createArea({
    status: 'dormant',
    ...overrides,
  });
}

/**
 * Creates an active area (not ready for archival)
 */
export function createActiveArea(overrides: Partial<AreaMeta> = {}): AreaMeta {
  return createArea({
    status: 'active',
    ...overrides,
  });
}

// =============================================================================
// Archive Factory
// =============================================================================

/**
 * Creates a valid ArchivedItem with optional overrides
 */
export function createArchivedItem(overrides: Partial<ArchivedItem> = {}): ArchivedItem {
  const now = new Date().toISOString();
  return {
    id: `proj_${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    type: 'project',
    original_path: 'Projects/test-project',
    archived_to: 'Orion/Archive/projects/2026-01/test-project',
    archived_at: now,
    reason: 'completed',
    ...overrides,
  };
}

/**
 * Creates a valid ArchiveIndex with optional overrides
 */
export function createArchiveIndex(
  overrides: Partial<ArchiveIndex> = {}
): ArchiveIndex {
  const now = new Date().toISOString();
  return {
    version: 1,
    generated_at: now,
    archived_items: [],
    stats: {
      total: 0,
      projects: 0,
      areas: 0,
    },
    ...overrides,
  };
}

// =============================================================================
// Test Data Constants
// =============================================================================

/**
 * Standard test project ID
 */
export const TEST_PROJECT_ID = 'proj_test123456789';

/**
 * Standard test area ID
 */
export const TEST_AREA_ID = 'area_test987654321';

/**
 * Standard test inbox ID
 */
export const TEST_INBOX_ID = 'inbox_test123456789';

/**
 * Standard test timestamps
 */
export const TEST_TIMESTAMPS = {
  january: '2026-01-15T12:00:00Z',
  february: '2026-02-10T08:00:00Z',
  march: '2026-03-20T16:30:00Z',
  december2025: '2025-12-31T23:59:59Z',
  oldDate: '2020-01-01T00:00:00Z',
};
