/**
 * Inbox Routing Test Dataset
 * Epic 4 Plan 4: Story 4.16 - Inbox Item Auto-Routing
 *
 * 20+ test items for validating routing accuracy benchmark (>= 80% target).
 */

import type { InboxItem } from '@/lib/para/schemas/inbox';
import { createInboxItem } from './para';

/**
 * Routing destination types
 */
export type RoutingDestination = 'project' | 'area' | 'resource' | 'someday';

/**
 * Test case for routing validation
 */
export interface RoutingTestCase {
  /** Human-readable test description */
  description: string;
  /** The inbox item to route */
  item: InboxItem;
  /** Expected routing destination */
  expected: RoutingDestination;
  /** If true, accept any reasonable routing (for ambiguous cases) */
  allowFallback?: boolean;
  /** Expected confidence level (optional, for detailed tests) */
  expectedConfidence?: 'high' | 'medium' | 'low';
}

/**
 * Full test dataset for routing accuracy benchmark
 *
 * Contains 24 test cases covering:
 * - Explicit targets (project/area references)
 * - High priority items
 * - Reference types
 * - Deadline keywords
 * - Ongoing/recurring patterns (areas)
 * - Someday/maybe items
 * - Resource/reference items
 * - Ambiguous edge cases
 */
export const routingTestDataset: RoutingTestCase[] = [
  // ==========================================================================
  // EXPLICIT TARGETS (should all route with 100% accuracy, high confidence)
  // ==========================================================================
  {
    description: 'Explicit target_project should route to project',
    item: createInboxItem({
      id: 'inbox_explicit_proj_1',
      title: 'Task for specific project',
      type: 'task',
      target_project: 'proj_abc123456789',
    }),
    expected: 'project',
    expectedConfidence: 'high',
  },
  {
    description: 'Explicit target_area should route to area',
    item: createInboxItem({
      id: 'inbox_explicit_area_1',
      title: 'Note for specific area',
      type: 'note',
      target_area: 'area_xyz987654321',
    }),
    expected: 'area',
    expectedConfidence: 'high',
  },

  // ==========================================================================
  // HIGH PRIORITY ITEMS (route to project)
  // ==========================================================================
  {
    description: 'High priority (90) with due date should route to project',
    item: createInboxItem({
      id: 'inbox_high_priority_1',
      title: 'Urgent task with deadline',
      type: 'task',
      priority_score: 90,
      due_date: '2026-02-01T00:00:00Z',
    }),
    expected: 'project',
    expectedConfidence: 'high',
  },
  {
    description: 'High priority (85) task should route to project',
    item: createInboxItem({
      id: 'inbox_high_priority_2',
      title: 'Urgent fix needed',
      type: 'task',
      priority_score: 85,
    }),
    expected: 'project',
    expectedConfidence: 'high',
  },
  {
    description: 'Priority 70+ should route to project',
    item: createInboxItem({
      id: 'inbox_high_priority_3',
      title: 'Important follow-up',
      type: 'task',
      priority_score: 72,
    }),
    expected: 'project',
    expectedConfidence: 'high',
  },

  // ==========================================================================
  // REFERENCE TYPES (route to resource)
  // ==========================================================================
  {
    description: 'Type reference should route to resource',
    item: createInboxItem({
      id: 'inbox_reference_1',
      title: 'API Documentation',
      type: 'reference',
    }),
    expected: 'resource',
    expectedConfidence: 'high',
  },
  {
    description: 'Reference with bookmark content should route to resource',
    item: createInboxItem({
      id: 'inbox_reference_2',
      title: 'Useful Article',
      type: 'reference',
      content: 'Bookmark this article about TypeScript patterns',
    }),
    expected: 'resource',
    expectedConfidence: 'high',
  },

  // ==========================================================================
  // DEADLINE KEYWORDS (route to project)
  // ==========================================================================
  {
    description: 'Content with "deadline" keyword should route to project',
    item: createInboxItem({
      id: 'inbox_deadline_1',
      title: 'Report submission',
      type: 'task',
      content: 'Submit by Friday deadline',
    }),
    expected: 'project',
    expectedConfidence: 'medium',
  },
  {
    description: 'Content with "due by" should route to project',
    item: createInboxItem({
      id: 'inbox_deadline_2',
      title: 'Monthly report',
      type: 'task',
      content: 'Report due by end of month',
    }),
    expected: 'project',
    expectedConfidence: 'medium',
  },
  {
    description: 'Title with "due tomorrow" should route to project',
    item: createInboxItem({
      id: 'inbox_deadline_3',
      title: 'Report due tomorrow',
      type: 'task',
    }),
    expected: 'project',
    expectedConfidence: 'medium',
  },
  {
    description: 'Content with "due next week" should route to project',
    item: createInboxItem({
      id: 'inbox_deadline_4',
      title: 'Client deliverable',
      type: 'task',
      content: 'This is due next week',
    }),
    expected: 'project',
    expectedConfidence: 'medium',
  },

  // ==========================================================================
  // ONGOING/RECURRING PATTERNS (route to area)
  // ==========================================================================
  {
    description: 'Content with "ongoing" keyword should route to area',
    item: createInboxItem({
      id: 'inbox_ongoing_1',
      title: 'Home maintenance',
      type: 'task',
      content: 'Ongoing home maintenance tasks',
    }),
    expected: 'area',
    expectedConfidence: 'medium',
  },
  {
    description: 'Content with "recurring" keyword should route to area',
    item: createInboxItem({
      id: 'inbox_recurring_1',
      title: 'Weekly standup notes',
      type: 'note',
      content: 'Recurring weekly standup notes template',
    }),
    expected: 'area',
    expectedConfidence: 'medium',
  },
  {
    description: 'Title with "daily routine" should route to area',
    item: createInboxItem({
      id: 'inbox_routine_1',
      title: 'Daily exercise routine',
      type: 'task',
    }),
    expected: 'area',
    expectedConfidence: 'medium',
  },
  {
    description: 'Content with "maintenance" should route to area',
    item: createInboxItem({
      id: 'inbox_maintenance_1',
      title: 'Garden care',
      type: 'task',
      content: 'Regular maintenance of the garden',
    }),
    expected: 'area',
    expectedConfidence: 'medium',
  },

  // ==========================================================================
  // SOMEDAY/MAYBE ITEMS (route to someday)
  // ==========================================================================
  {
    description: 'Type idea with "someday" in title should route to someday',
    item: createInboxItem({
      id: 'inbox_someday_1',
      title: 'Someday learn Rust',
      type: 'idea',
    }),
    expected: 'someday',
    expectedConfidence: 'medium',
  },
  {
    description: 'Content with "maybe" keyword should route to someday',
    item: createInboxItem({
      id: 'inbox_maybe_1',
      title: 'Podcast idea',
      type: 'idea',
      content: 'Maybe start a podcast about productivity',
    }),
    expected: 'someday',
    expectedConfidence: 'medium',
  },
  {
    description: 'Low priority (15) idea should route to someday',
    item: createInboxItem({
      id: 'inbox_low_priority_1',
      title: 'Future exploration',
      type: 'idea',
      priority_score: 15,
    }),
    expected: 'someday',
    expectedConfidence: 'medium',
  },
  {
    description: 'Content with "might be interesting" should route to someday',
    item: createInboxItem({
      id: 'inbox_might_1',
      title: 'New framework',
      type: 'capture',
      content: 'Might be interesting to explore this new framework',
    }),
    expected: 'someday',
    expectedConfidence: 'low',
  },
  {
    description: 'Content with "one day" should route to someday',
    item: createInboxItem({
      id: 'inbox_oneday_1',
      title: 'Travel plans',
      type: 'idea',
      content: 'One day I want to visit Japan',
    }),
    expected: 'someday',
    expectedConfidence: 'medium',
  },

  // ==========================================================================
  // RESOURCE/REFERENCE CONTENT (route to resource)
  // ==========================================================================
  {
    description: 'Content with "for future reference" should route to resource',
    item: createInboxItem({
      id: 'inbox_resource_1',
      title: 'Design patterns article',
      type: 'note',
      content: 'Save for future reference about design patterns',
    }),
    expected: 'resource',
    expectedConfidence: 'medium',
  },
  {
    description: 'Content with "bookmark" keyword should route to resource',
    item: createInboxItem({
      id: 'inbox_bookmark_1',
      title: 'Interesting article',
      type: 'capture',
      content: 'Interesting article to bookmark for later',
    }),
    expected: 'resource',
    expectedConfidence: 'medium',
  },

  // ==========================================================================
  // AMBIGUOUS/EDGE CASES (accept fallback routing)
  // ==========================================================================
  {
    description: 'Ambiguous task with no signals defaults to project',
    item: createInboxItem({
      id: 'inbox_ambiguous_1',
      title: 'Do thing',
      type: 'task',
    }),
    expected: 'project',
    allowFallback: true,
    expectedConfidence: 'low',
  },
  {
    description: 'Ambiguous note with no signals defaults to resource',
    item: createInboxItem({
      id: 'inbox_ambiguous_2',
      title: 'Random note',
      type: 'note',
    }),
    expected: 'resource',
    allowFallback: true,
    expectedConfidence: 'low',
  },
];

/**
 * Subset of dataset for quick smoke tests (6 items)
 */
export const routingSmokeCases: RoutingTestCase[] = routingTestDataset.filter(
  (tc) =>
    tc.description.includes('Explicit target_project') ||
    tc.description.includes('High priority (90)') ||
    tc.description.includes('Type reference should') ||
    tc.description.includes('"deadline" keyword') ||
    tc.description.includes('"ongoing" keyword') ||
    tc.description.includes('"someday" in title')
);

/**
 * Dataset size validation
 */
export const DATASET_SIZE = routingTestDataset.length;
export const REQUIRED_DATASET_SIZE = 20;
export const ACCURACY_THRESHOLD = 0.8; // 80%
