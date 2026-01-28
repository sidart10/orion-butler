/**
 * Tests for Inbox Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';

// Import schemas - will fail until implemented
import {
  InboxItemSchema,
  InboxQueueSchema,
  type InboxItem,
  type InboxQueue,
} from '@/lib/para/schemas/inbox';

describe('InboxItemSchema (Story 4.1c)', () => {
  const validInboxItem = {
    id: 'inbox_abc12345678',
    title: 'Review PR #123',
    type: 'task',
    created_at: '2026-01-27T00:00:00Z',
    updated_at: '2026-01-27T00:00:00Z',
  };

  describe('id validation', () => {
    it('should accept id starting with inbox_', () => {
      const result = InboxItemSchema.safeParse(validInboxItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('inbox_abc12345678');
      }
    });

    it('should reject id not starting with inbox_', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        id: 'proj_abc123456789',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        id: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('title validation', () => {
    it('should accept non-empty title', () => {
      const result = InboxItemSchema.safeParse(validInboxItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Review PR #123');
      }
    });

    it('should reject empty title', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing title', () => {
      const { title, ...withoutTitle } = validInboxItem;
      const result = InboxItemSchema.safeParse(withoutTitle);
      expect(result.success).toBe(false);
    });
  });

  describe('type validation', () => {
    it('should accept "task" type', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        type: 'task',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "note" type', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        type: 'note',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "idea" type', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        type: 'idea',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "reference" type', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        type: 'reference',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "capture" type', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        type: 'capture',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        type: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept optional content', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        content: 'This is the detailed content of the item.',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(
          'This is the detailed content of the item.'
        );
      }
    });

    it('should accept optional source', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        source: 'email',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe('email');
      }
    });

    it('should accept optional priority_score', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        priority_score: 75,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority_score).toBe(75);
      }
    });

    it('should accept optional processed flag (default false)', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        processed: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.processed).toBe(true);
      }
    });

    it('should default processed to false when not provided', () => {
      const result = InboxItemSchema.safeParse(validInboxItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.processed).toBe(false);
      }
    });

    it('should accept optional target_project reference', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        target_project: 'proj_abc123456789',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.target_project).toBe('proj_abc123456789');
      }
    });

    it('should accept optional target_area reference', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        target_area: 'area_abc123456789',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.target_area).toBe('area_abc123456789');
      }
    });

    it('should accept optional due_date', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        due_date: '2026-02-01T00:00:00Z',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.due_date).toBe('2026-02-01T00:00:00Z');
      }
    });

    it('should accept optional tags array', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        tags: ['urgent', 'work'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(['urgent', 'work']);
      }
    });
  });

  describe('timestamp validation', () => {
    it('should accept valid ISO datetime for created_at', () => {
      const result = InboxItemSchema.safeParse(validInboxItem);
      expect(result.success).toBe(true);
    });

    it('should accept datetime with timezone offset', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        created_at: '2026-01-27T12:00:00+05:30',
        updated_at: '2026-01-27T12:00:00+05:30',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format', () => {
      const result = InboxItemSchema.safeParse({
        ...validInboxItem,
        created_at: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing created_at', () => {
      const { created_at, ...withoutCreatedAt } = validInboxItem;
      const result = InboxItemSchema.safeParse(withoutCreatedAt);
      expect(result.success).toBe(false);
    });

    it('should reject missing updated_at', () => {
      const { updated_at, ...withoutUpdatedAt } = validInboxItem;
      const result = InboxItemSchema.safeParse(withoutUpdatedAt);
      expect(result.success).toBe(false);
    });
  });

  describe('full inbox item validation', () => {
    it('should accept complete valid inbox item', () => {
      const fullItem = {
        id: 'inbox_abc12345678',
        title: 'Complete Task',
        type: 'task',
        content: 'Detailed description of the task',
        source: 'slack',
        priority_score: 80,
        processed: false,
        target_project: 'proj_abc123',
        due_date: '2026-02-15T00:00:00Z',
        created_at: '2026-01-27T00:00:00Z',
        updated_at: '2026-01-27T00:00:00Z',
        tags: ['urgent', 'work'],
      };
      const result = InboxItemSchema.safeParse(fullItem);
      expect(result.success).toBe(true);
    });
  });
});

describe('InboxQueueSchema (Story 4.1c)', () => {
  it('should accept valid inbox queue with items array', () => {
    const queue = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      items: [
        {
          id: 'inbox_abc12345678',
          title: 'Task 1',
          type: 'task',
          created_at: '2026-01-27T00:00:00Z',
          updated_at: '2026-01-27T00:00:00Z',
        },
      ],
      stats: {
        total: 1,
        unprocessed: 1,
        by_type: {
          task: 1,
          note: 0,
          idea: 0,
          reference: 0,
          capture: 0,
        },
      },
    };
    const result = InboxQueueSchema.safeParse(queue);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.stats.total).toBe(1);
    }
  });

  it('should accept empty items array', () => {
    const queue = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      items: [],
      stats: {
        total: 0,
        unprocessed: 0,
        by_type: {
          task: 0,
          note: 0,
          idea: 0,
          reference: 0,
          capture: 0,
        },
      },
    };
    const result = InboxQueueSchema.safeParse(queue);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(0);
    }
  });

  it('should reject missing version', () => {
    const queue = {
      updated_at: '2026-01-27T00:00:00Z',
      items: [],
      stats: {
        total: 0,
        unprocessed: 0,
        by_type: {},
      },
    };
    const result = InboxQueueSchema.safeParse(queue);
    expect(result.success).toBe(false);
  });

  it('should reject missing updated_at', () => {
    const queue = {
      version: 1,
      items: [],
      stats: {
        total: 0,
        unprocessed: 0,
        by_type: {},
      },
    };
    const result = InboxQueueSchema.safeParse(queue);
    expect(result.success).toBe(false);
  });

  it('should reject missing stats', () => {
    const queue = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      items: [],
    };
    const result = InboxQueueSchema.safeParse(queue);
    expect(result.success).toBe(false);
  });

  it('should reject invalid inbox item in array', () => {
    const queue = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      items: [{ invalid: 'item' }],
      stats: {
        total: 1,
        unprocessed: 1,
        by_type: {},
      },
    };
    const result = InboxQueueSchema.safeParse(queue);
    expect(result.success).toBe(false);
  });

  describe('stats validation', () => {
    it('should require total count', () => {
      const queue = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        items: [],
        stats: {
          unprocessed: 0,
          by_type: {},
        },
      };
      const result = InboxQueueSchema.safeParse(queue);
      expect(result.success).toBe(false);
    });

    it('should require unprocessed count', () => {
      const queue = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        items: [],
        stats: {
          total: 0,
          by_type: {},
        },
      };
      const result = InboxQueueSchema.safeParse(queue);
      expect(result.success).toBe(false);
    });

    it('should require by_type breakdown', () => {
      const queue = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        items: [],
        stats: {
          total: 0,
          unprocessed: 0,
        },
      };
      const result = InboxQueueSchema.safeParse(queue);
      expect(result.success).toBe(false);
    });
  });
});

describe('Type exports (Story 4.1c)', () => {
  it('should export InboxItem type', () => {
    const item: InboxItem = {
      id: 'inbox_test12345',
      title: 'Test Item',
      type: 'task',
      created_at: '2026-01-27T00:00:00Z',
      updated_at: '2026-01-27T00:00:00Z',
      processed: false,
    };
    expect(item.type).toBe('task');
  });

  it('should export InboxQueue type', () => {
    const queue: InboxQueue = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      items: [],
      stats: {
        total: 0,
        unprocessed: 0,
        by_type: {
          task: 0,
          note: 0,
          idea: 0,
          reference: 0,
          capture: 0,
        },
      },
    };
    expect(queue.version).toBe(1);
  });
});
