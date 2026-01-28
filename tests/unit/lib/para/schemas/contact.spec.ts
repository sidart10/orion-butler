/**
 * Tests for Contact Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';

// Import schemas - will fail until implemented
import {
  ContactCardSchema,
  ContactIndexSchema,
  type ContactCard,
  type ContactIndex,
} from '@/lib/para/schemas/contact';

describe('ContactCardSchema (Story 4.1c)', () => {
  const validContact = {
    id: 'cont_abc123456789',
    name: 'John Doe',
    type: 'person',
    created_at: '2026-01-27T00:00:00Z',
    updated_at: '2026-01-27T00:00:00Z',
  };

  describe('id validation', () => {
    it('should accept id starting with cont_', () => {
      const result = ContactCardSchema.safeParse(validContact);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('cont_abc123456789');
      }
    });

    it('should reject id not starting with cont_', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        id: 'proj_abc123456789',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        id: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('name validation', () => {
    it('should accept non-empty name', () => {
      const result = ContactCardSchema.safeParse(validContact);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should reject empty name', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const { name, ...withoutName } = validContact;
      const result = ContactCardSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });
  });

  describe('type validation', () => {
    it('should accept "person" type', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        type: 'person',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "organization" type', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        type: 'organization',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type like "company"', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        type: 'company',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid type like "group"', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        type: 'group',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept optional email', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should accept optional phone', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        phone: '+1-555-123-4567',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBe('+1-555-123-4567');
      }
    });

    it('should accept optional company', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        company: 'Acme Corp',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company).toBe('Acme Corp');
      }
    });

    it('should accept optional role', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        role: 'Software Engineer',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('Software Engineer');
      }
    });

    it('should accept optional relationship', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        relationship: 'colleague',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relationship).toBe('colleague');
      }
    });

    it('should accept optional notes', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        notes: 'Met at conference 2025',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe('Met at conference 2025');
      }
    });

    it('should accept optional tags array', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        tags: ['work', 'engineering'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(['work', 'engineering']);
      }
    });

    it('should accept optional projects array (references)', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        projects: ['proj_abc123456789', 'proj_xyz987654321'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.projects).toHaveLength(2);
      }
    });
  });

  describe('timestamp validation', () => {
    it('should accept valid ISO datetime for created_at', () => {
      const result = ContactCardSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it('should accept datetime with timezone offset', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        created_at: '2026-01-27T12:00:00+05:30',
        updated_at: '2026-01-27T12:00:00+05:30',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format', () => {
      const result = ContactCardSchema.safeParse({
        ...validContact,
        created_at: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing created_at', () => {
      const { created_at, ...withoutCreatedAt } = validContact;
      const result = ContactCardSchema.safeParse(withoutCreatedAt);
      expect(result.success).toBe(false);
    });

    it('should reject missing updated_at', () => {
      const { updated_at, ...withoutUpdatedAt } = validContact;
      const result = ContactCardSchema.safeParse(withoutUpdatedAt);
      expect(result.success).toBe(false);
    });
  });

  describe('full contact validation', () => {
    it('should accept complete valid contact', () => {
      const fullContact = {
        id: 'cont_abc123456789',
        name: 'John Doe',
        type: 'person',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        company: 'Acme Corp',
        role: 'Engineering Manager',
        relationship: 'mentor',
        notes: 'Great for advice on career growth',
        created_at: '2026-01-27T00:00:00Z',
        updated_at: '2026-01-27T00:00:00Z',
        tags: ['work', 'mentor'],
        projects: ['proj_abc123'],
      };
      const result = ContactCardSchema.safeParse(fullContact);
      expect(result.success).toBe(true);
    });

    it('should accept organization contact', () => {
      const orgContact = {
        id: 'cont_org123456789',
        name: 'Acme Corporation',
        type: 'organization',
        email: 'info@acme.com',
        phone: '+1-555-000-0000',
        notes: 'Primary vendor for supplies',
        created_at: '2026-01-27T00:00:00Z',
        updated_at: '2026-01-27T00:00:00Z',
      };
      const result = ContactCardSchema.safeParse(orgContact);
      expect(result.success).toBe(true);
    });
  });
});

describe('ContactIndexSchema (Story 4.1c)', () => {
  it('should accept valid contact index with contacts array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      contacts: [
        {
          id: 'cont_abc123456789',
          name: 'John Doe',
          type: 'person',
          created_at: '2026-01-27T00:00:00Z',
          updated_at: '2026-01-27T00:00:00Z',
        },
      ],
    };
    const result = ContactIndexSchema.safeParse(index);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contacts).toHaveLength(1);
    }
  });

  it('should accept empty contacts array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      contacts: [],
    };
    const result = ContactIndexSchema.safeParse(index);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contacts).toHaveLength(0);
    }
  });

  it('should reject missing version', () => {
    const index = {
      updated_at: '2026-01-27T00:00:00Z',
      contacts: [],
    };
    const result = ContactIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });

  it('should reject missing updated_at', () => {
    const index = {
      version: 1,
      contacts: [],
    };
    const result = ContactIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });

  it('should reject invalid contact in array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      contacts: [{ invalid: 'contact' }],
    };
    const result = ContactIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });
});

describe('Type exports (Story 4.1c)', () => {
  it('should export ContactCard type', () => {
    const contact: ContactCard = {
      id: 'cont_test123456',
      name: 'Test Contact',
      type: 'person',
      created_at: '2026-01-27T00:00:00Z',
      updated_at: '2026-01-27T00:00:00Z',
    };
    expect(contact.type).toBe('person');
  });

  it('should export ContactIndex type', () => {
    const index: ContactIndex = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      contacts: [],
    };
    expect(index.version).toBe(1);
  });
});
