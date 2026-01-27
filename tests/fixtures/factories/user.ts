/**
 * User Factory for Orion Butler Tests
 *
 * Creates test User entities with sensible defaults and auto-generated IDs.
 *
 * @see AC#1: UserFactory.create({ name: 'Test User' }) creates valid User with defaults
 * @see thoughts/planning-artifacts/architecture.md#Database Layer
 */
import type { User } from './types';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Counter for generating unique email addresses
 */
let userCounter = 0;

/**
 * Factory for creating User entities
 */
export const UserFactory = {
  /**
   * Create a single User entity with defaults
   *
   * @param overrides - Partial User to override defaults
   * @returns A valid User entity
   *
   * @example
   * ```typescript
   * const user = UserFactory.create({ displayName: 'Test User' });
   * expect(user.displayName).toBe('Test User');
   * expect(user.id).toBeDefined(); // Auto-generated UUID
   * ```
   */
  create(overrides: Partial<User> = {}): User {
    userCounter++;
    const now = new Date();

    return {
      id: generateUUID(),
      email: `user${userCounter}@example.com`,
      displayName: `Test User ${userCounter}`,
      preferences: {},
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  },

  /**
   * Create multiple User entities
   *
   * @param count - Number of users to create
   * @param overrides - Partial User to apply to all created users
   * @returns Array of User entities
   *
   * @example
   * ```typescript
   * const users = UserFactory.createMany(3, { preferences: { theme: 'dark' } });
   * expect(users).toHaveLength(3);
   * users.forEach(u => expect(u.preferences.theme).toBe('dark'));
   * ```
   */
  createMany(count: number, overrides: Partial<User> = {}): User[] {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(this.create(overrides));
    }
    return users;
  },

  /**
   * Reset the counter (useful for test isolation)
   */
  resetCounter(): void {
    userCounter = 0;
  },
};
