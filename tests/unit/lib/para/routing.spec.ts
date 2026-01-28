/**
 * Tests for Inbox Item Auto-Routing
 * Epic 4 Plan 4, Story 4.16: Inbox Item Auto-Routing
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Tests routing logic that determines where inbox items should be moved:
 * - project: time-bound, actionable items with deadlines
 * - area: ongoing responsibilities and recurring items
 * - resource: reference materials and bookmarks
 * - someday: future possibilities and ideas
 */

import { describe, it, expect } from 'vitest';

// Import the routing function - will fail until implemented
import { routeInboxItem } from '@/lib/para/routing';
import type { RoutingDecision } from '@/lib/para/routing';

// Import test fixtures (using relative paths)
import {
  createInboxItem,
  createInboxItemWithProject,
  createInboxItemWithArea,
  createUrgentInboxItem,
} from '../../../fixtures/para';
import {
  routingTestDataset,
  DATASET_SIZE,
  REQUIRED_DATASET_SIZE,
  ACCURACY_THRESHOLD,
} from '../../../fixtures/inbox-test-dataset';

describe('Story 4.16: Inbox Item Auto-Routing', () => {
  // ===========================================================================
  // Schema Field Priority Tests
  // ===========================================================================
  describe('routeInboxItem schema field priority', () => {
    it('should route to project when target_project is set', () => {
      const item = createInboxItemWithProject('proj_abc123456789', {
        type: 'task',
        title: 'Task for specific project',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('high');
      expect(result.suggested_target).toBe('proj_abc123456789');
    });

    it('should route to area when target_area is set', () => {
      const item = createInboxItemWithArea('area_xyz987654321', {
        type: 'note',
        title: 'Note for specific area',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('area');
      expect(result.confidence).toBe('high');
      expect(result.suggested_target).toBe('area_xyz987654321');
    });

    it('should route to project for high priority with due_date', () => {
      const item = createInboxItem({
        priority_score: 80,
        due_date: '2026-02-01T00:00:00Z',
        type: 'task',
        title: 'High priority task with deadline',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('high');
    });

    it('should route to someday for low priority without due_date', () => {
      const item = createInboxItem({
        priority_score: 20,
        type: 'idea',
        title: 'Low priority idea',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('someday');
      expect(result.confidence).toBe('medium');
    });

    it('should route to resource for type=reference', () => {
      const item = createInboxItem({
        type: 'reference',
        title: 'API Documentation link',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('resource');
      expect(result.confidence).toBe('high');
    });

    it('should prioritize target_project over content analysis', () => {
      const item = createInboxItemWithProject('proj_abc123', {
        content: 'someday maybe I will look at this',
        title: 'Mixed signals item',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
    });

    it('should prioritize target_area over type inference', () => {
      const item = createInboxItemWithArea('area_xyz789', {
        type: 'reference', // Would normally route to resource
        title: 'Reference for area',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('area');
    });
  });

  // ===========================================================================
  // Content Analysis Fallback Tests
  // ===========================================================================
  describe('routeInboxItem content analysis', () => {
    it('should detect deadline keywords and route to project', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Report submission',
        content: 'Need to finish by Friday deadline',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('medium');
    });

    it('should detect "due by" and route to project', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Monthly report',
        content: 'Report due by end of month',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('medium');
    });

    it('should detect "due tomorrow" in title and route to project', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Report due tomorrow',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('medium');
    });

    it('should detect reference keywords and route to resource', () => {
      const item = createInboxItem({
        type: 'note',
        title: 'TypeScript patterns',
        content: 'Article for future reference about TypeScript',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('resource');
      expect(result.confidence).toBe('medium');
    });

    it('should detect "bookmark" and route to resource', () => {
      const item = createInboxItem({
        type: 'capture',
        title: 'Useful link',
        content: 'Bookmark this link for later',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('resource');
      expect(result.confidence).toBe('medium');
    });

    it('should detect ongoing keywords and route to area', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Home maintenance',
        content: 'Ongoing maintenance of home office',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('area');
      expect(result.confidence).toBe('medium');
    });

    it('should detect "recurring" and route to area', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Weekly review',
        content: 'Recurring weekly review meeting notes',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('area');
      expect(result.confidence).toBe('medium');
    });

    it('should detect someday keywords and route to someday', () => {
      const item = createInboxItem({
        type: 'idea',
        title: 'Learn piano',
        content: 'Maybe someday learn piano',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('someday');
      expect(result.confidence).toBe('medium');
    });

    it('should detect "might" and route to someday', () => {
      const item = createInboxItem({
        type: 'capture',
        title: 'New framework',
        content: 'I might want to explore this later',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('someday');
      expect(result.confidence).toBe('low');
    });

    it('should detect "one day" and route to someday', () => {
      const item = createInboxItem({
        type: 'idea',
        title: 'Travel goals',
        content: 'One day I want to visit Tokyo',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('someday');
      expect(result.confidence).toBe('medium');
    });
  });

  // ===========================================================================
  // Default Routing Tests
  // ===========================================================================
  describe('routeInboxItem default behavior', () => {
    it('should default to project for ambiguous tasks', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Do something',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('low');
    });

    it('should default to resource for notes without keywords', () => {
      const item = createInboxItem({
        type: 'note',
        title: 'Random thoughts',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('resource');
      expect(result.confidence).toBe('low');
    });

    it('should default to someday for ideas', () => {
      const item = createInboxItem({
        type: 'idea',
        title: 'Cool concept',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('someday');
      expect(result.confidence).toBe('medium');
    });

    it('should default to project for capture without context', () => {
      const item = createInboxItem({
        type: 'capture',
        title: 'Quick note',
      });

      const result = routeInboxItem(item);

      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('low');
    });
  });

  // ===========================================================================
  // Confidence Scoring Tests
  // ===========================================================================
  describe('routeInboxItem confidence scoring', () => {
    it('should return high confidence for explicit target', () => {
      const item = createInboxItemWithProject('proj_test123');

      const result = routeInboxItem(item);

      expect(result.confidence).toBe('high');
    });

    it('should return high confidence for priority >= 70', () => {
      const item = createInboxItem({
        priority_score: 85,
        type: 'task',
        title: 'High priority task',
      });

      const result = routeInboxItem(item);

      expect(result.confidence).toBe('high');
    });

    it('should return medium confidence for keyword match', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Project work',
        content: 'Need to finish by the deadline',
      });

      const result = routeInboxItem(item);

      expect(result.confidence).toBe('medium');
    });

    it('should return low confidence for no signals', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Generic task',
      });

      const result = routeInboxItem(item);

      expect(result.confidence).toBe('low');
    });

    it('should return medium confidence for type inference only', () => {
      const item = createInboxItem({
        type: 'idea',
        title: 'Some idea',
      });

      const result = routeInboxItem(item);

      expect(result.confidence).toBe('medium');
    });
  });

  // ===========================================================================
  // Reasoning Generation Tests
  // ===========================================================================
  describe('routeInboxItem reasoning', () => {
    it('should explain target_project routing', () => {
      const item = createInboxItemWithProject('proj_abc123');

      const result = routeInboxItem(item);

      expect(result.reasoning).toContain('target');
      expect(result.reasoning.toLowerCase()).toMatch(/explicit|project/);
    });

    it('should explain deadline detection', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Urgent work',
        content: 'Must complete by deadline tomorrow',
      });

      const result = routeInboxItem(item);

      expect(result.reasoning.toLowerCase()).toMatch(/deadline|time/);
    });

    it('should explain type-based routing', () => {
      const item = createInboxItem({
        type: 'reference',
        title: 'Documentation link',
      });

      const result = routeInboxItem(item);

      expect(result.reasoning.toLowerCase()).toMatch(/reference|type/);
    });

    it('should explain priority-based routing', () => {
      const urgentItem = createUrgentInboxItem({
        title: 'Urgent task',
      });

      const result = routeInboxItem(urgentItem);

      expect(result.reasoning.toLowerCase()).toMatch(/priority|urgent/);
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================
  describe('routeInboxItem edge cases', () => {
    it('should handle empty content', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Task without content',
        content: '',
      });

      const result = routeInboxItem(item);

      expect(result).toBeDefined();
      expect(result.destination).toBeDefined();
    });

    it('should handle undefined content', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Task without content field',
      });
      // Explicitly remove content
      delete (item as Record<string, unknown>).content;

      const result = routeInboxItem(item);

      expect(result).toBeDefined();
      expect(result.destination).toBeDefined();
    });

    it('should handle very long content without timeout', () => {
      const longContent = 'word '.repeat(10000); // 50k+ characters
      const item = createInboxItem({
        type: 'task',
        title: 'Task with long content',
        content: longContent,
      });

      const start = Date.now();
      const result = routeInboxItem(item);
      const elapsed = Date.now() - start;

      expect(result).toBeDefined();
      expect(elapsed).toBeLessThan(100); // Should be fast
    });

    it('should handle unicode content', () => {
      const item = createInboxItem({
        type: 'task',
        title: 'Task with unicode',
        content: 'Need to finish by deadline',
      });

      const result = routeInboxItem(item);

      expect(result).toBeDefined();
      expect(result.destination).toBe('project');
    });

    it('should handle content with mixed signals - priority wins', () => {
      const item = createInboxItem({
        type: 'note', // Would default to resource
        title: 'Mixed signals',
        content: 'someday maybe reference deadline ongoing', // All keywords!
        priority_score: 90, // High priority should win
      });

      const result = routeInboxItem(item);

      // Priority > keywords, so should be project
      expect(result.destination).toBe('project');
      expect(result.confidence).toBe('high');
    });
  });

  // ===========================================================================
  // Accuracy Benchmark Tests (20+ item dataset)
  // ===========================================================================
  describe('routeInboxItem accuracy benchmark', () => {
    it('should have at least 20 test cases in the dataset', () => {
      expect(DATASET_SIZE).toBeGreaterThanOrEqual(REQUIRED_DATASET_SIZE);
    });

    it('should achieve >= 80% accuracy on test dataset', () => {
      let correct = 0;

      for (const testCase of routingTestDataset) {
        const result = routeInboxItem(testCase.item);

        if (result.destination === testCase.expected) {
          correct++;
        } else if (testCase.allowFallback) {
          // Accept any routing for ambiguous cases
          correct++;
        }
      }

      const accuracy = correct / DATASET_SIZE;
      expect(accuracy).toBeGreaterThanOrEqual(ACCURACY_THRESHOLD);
    });

    it('should have 100% accuracy on explicit target cases', () => {
      const explicitTargetCases = routingTestDataset.filter(
        (tc) =>
          tc.item.target_project !== undefined ||
          tc.item.target_area !== undefined
      );

      let correct = 0;
      for (const testCase of explicitTargetCases) {
        const result = routeInboxItem(testCase.item);
        if (result.destination === testCase.expected) {
          correct++;
        }
      }

      expect(correct).toBe(explicitTargetCases.length);
    });

    // Individual test cases from the dataset for debugging failures
    routingTestDataset.slice(0, 10).forEach((testCase) => {
      it(`should route correctly: ${testCase.description}`, () => {
        const result = routeInboxItem(testCase.item);

        if (testCase.allowFallback) {
          // For ambiguous cases, just verify we get a valid result
          expect(['project', 'area', 'resource', 'someday']).toContain(
            result.destination
          );
        } else {
          expect(result.destination).toBe(testCase.expected);
        }

        if (testCase.expectedConfidence) {
          expect(result.confidence).toBe(testCase.expectedConfidence);
        }
      });
    });
  });
});
