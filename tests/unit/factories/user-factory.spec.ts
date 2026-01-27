/**
 * Unit tests for UserFactory
 *
 * Tests AC#1: Given I import the factory, When I call UserFactory.create({ name: 'Test User' }),
 * Then a valid User entity is created with default values for missing fields
 */
import { describe, it, expect } from 'vitest';
import { UserFactory } from '../../fixtures/factories/user';
import type { User } from '../../fixtures/factories/types';

describe('UserFactory', () => {
  describe('create()', () => {
    it('should create a valid User entity with default values', () => {
      const user = UserFactory.create();

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.email).toBeDefined();
      expect(user.displayName).toBeDefined();
      expect(user.preferences).toEqual({});
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a User with custom name override (AC#1)', () => {
      const user = UserFactory.create({ displayName: 'Test User' });

      expect(user.displayName).toBe('Test User');
      // Other fields should have defaults
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
    });

    it('should create a User with all custom overrides', () => {
      const customDate = new Date('2026-01-01');
      const user = UserFactory.create({
        id: 'custom-id',
        email: 'custom@example.com',
        displayName: 'Custom User',
        preferences: { theme: 'dark' },
        createdAt: customDate,
        updatedAt: customDate,
      });

      expect(user.id).toBe('custom-id');
      expect(user.email).toBe('custom@example.com');
      expect(user.displayName).toBe('Custom User');
      expect(user.preferences).toEqual({ theme: 'dark' });
      expect(user.createdAt).toEqual(customDate);
      expect(user.updatedAt).toEqual(customDate);
    });

    it('should generate unique IDs for each user', () => {
      const user1 = UserFactory.create();
      const user2 = UserFactory.create();

      expect(user1.id).not.toBe(user2.id);
    });

    it('should generate valid UUID format for ID', () => {
      const user = UserFactory.create();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(user.id).toMatch(uuidRegex);
    });

    it('should generate valid email format', () => {
      const user = UserFactory.create();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(user.email).toMatch(emailRegex);
    });
  });

  describe('createMany()', () => {
    it('should create multiple users with default values', () => {
      const users = UserFactory.createMany(3);

      expect(users).toHaveLength(3);
      users.forEach((user) => {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.displayName).toBeDefined();
      });
    });

    it('should create users with shared overrides', () => {
      const users = UserFactory.createMany(3, { preferences: { theme: 'light' } });

      users.forEach((user) => {
        expect(user.preferences).toEqual({ theme: 'light' });
      });
    });

    it('should generate unique IDs for all users', () => {
      const users = UserFactory.createMany(5);
      const ids = users.map((u) => u.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });

    it('should return empty array when count is 0', () => {
      const users = UserFactory.createMany(0);

      expect(users).toHaveLength(0);
    });
  });
});
