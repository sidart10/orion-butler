import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, initTestDatabase } from './test-setup';
import { generateId } from '@/db/schema';
import type { IDatabase } from '@/db';

describe('Database Tables', () => {
  let db: IDatabase;

  beforeEach(async () => {
    db = createTestDatabase();
    await initTestDatabase(db);
  });

  describe('conversations table', () => {
    it('creates a conversation', async () => {
      const id = generateId('conversation');
      const now = new Date().toISOString();

      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [id, 'daily', now]
      );

      const rows = await db.select<{ id: string; type: string }>(
        'SELECT id, type FROM conversations WHERE id = ?',
        [id]
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe(id);
      expect(rows[0].type).toBe('daily');
    });

    it('allows null optional fields', async () => {
      const id = generateId('conversation');
      const now = new Date().toISOString();

      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [id, 'adhoc', now]
      );

      const rows = await db.select<{ title: string | null }>(
        'SELECT title FROM conversations WHERE id = ?',
        [id]
      );

      expect(rows[0].title).toBeNull();
    });

    it('enforces NOT NULL on required fields', async () => {
      const id = generateId('conversation');

      await expect(
        db.execute(`INSERT INTO conversations (id, started_at) VALUES (?, ?)`, [
          id,
          new Date().toISOString(),
        ])
      ).rejects.toThrow(); // type is NOT NULL
    });
  });

  describe('messages table', () => {
    it('creates a message with FK to conversation', async () => {
      const convId = generateId('conversation');
      const msgId = generateId('message');
      const now = new Date().toISOString();

      // Create parent conversation first
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId, 'adhoc', now]
      );

      // Create message
      await db.execute(
        `INSERT INTO messages (id, conversation_id, role, content, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [msgId, convId, 'user', 'Hello world', now]
      );

      const rows = await db.select<{ id: string; role: string }>(
        'SELECT id, role FROM messages WHERE conversation_id = ?',
        [convId]
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].role).toBe('user');
    });

    it('enforces FK constraint - rejects orphan messages', async () => {
      const msgId = generateId('message');
      const fakeConvId = generateId('conversation');

      await expect(
        db.execute(
          `INSERT INTO messages (id, conversation_id, role, content, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [msgId, fakeConvId, 'user', 'Hello', new Date().toISOString()]
        )
      ).rejects.toThrow(/FOREIGN KEY/);
    });

    it('cascades delete from conversations to messages', async () => {
      const convId = generateId('conversation');
      const msgId = generateId('message');
      const now = new Date().toISOString();

      // Create conversation and message
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId, 'adhoc', now]
      );
      await db.execute(
        `INSERT INTO messages (id, conversation_id, role, content, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [msgId, convId, 'user', 'Hello', now]
      );

      // Verify message exists
      let rows = await db.select<{ id: string }>(
        'SELECT id FROM messages WHERE id = ?',
        [msgId]
      );
      expect(rows).toHaveLength(1);

      // Delete conversation
      await db.execute('DELETE FROM conversations WHERE id = ?', [convId]);

      // Verify message was cascade deleted
      rows = await db.select<{ id: string }>(
        'SELECT id FROM messages WHERE id = ?',
        [msgId]
      );
      expect(rows).toHaveLength(0);
    });
  });

  describe('session_index table', () => {
    it('creates a session index entry', async () => {
      const convId = generateId('conversation');
      const sessId = generateId('session');
      const now = new Date().toISOString();

      // Create conversation first
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId, 'daily', now]
      );

      // Create session index
      await db.execute(
        `INSERT INTO session_index (id, conversation_id, type, display_name, last_active)
         VALUES (?, ?, ?, ?, ?)`,
        [sessId, convId, 'daily', 'Daily Session', now]
      );

      const rows = await db.select<{ display_name: string; is_active: number }>(
        'SELECT display_name, is_active FROM session_index WHERE id = ?',
        [sessId]
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].display_name).toBe('Daily Session');
      expect(rows[0].is_active).toBe(1); // Default value
    });

    it('queries by last_active DESC for recency', async () => {
      const convId1 = generateId('conversation');
      const convId2 = generateId('conversation');
      const sessId1 = generateId('session');
      const sessId2 = generateId('session');
      const now = new Date();
      const earlier = new Date(now.getTime() - 60000);

      // Create conversations
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId1, 'daily', earlier.toISOString()]
      );
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId2, 'daily', now.toISOString()]
      );

      // Create session indexes with different last_active times
      await db.execute(
        `INSERT INTO session_index (id, conversation_id, type, display_name, last_active)
         VALUES (?, ?, ?, ?, ?)`,
        [sessId1, convId1, 'daily', 'Older Session', earlier.toISOString()]
      );
      await db.execute(
        `INSERT INTO session_index (id, conversation_id, type, display_name, last_active)
         VALUES (?, ?, ?, ?, ?)`,
        [sessId2, convId2, 'daily', 'Newer Session', now.toISOString()]
      );

      // Query by recency
      const rows = await db.select<{ display_name: string }>(
        'SELECT display_name FROM session_index ORDER BY last_active DESC'
      );

      expect(rows).toHaveLength(2);
      expect(rows[0].display_name).toBe('Newer Session');
      expect(rows[1].display_name).toBe('Older Session');
    });

    it('cascades delete from conversations to session_index', async () => {
      const convId = generateId('conversation');
      const sessId = generateId('session');
      const now = new Date().toISOString();

      // Create conversation and session index
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId, 'daily', now]
      );
      await db.execute(
        `INSERT INTO session_index (id, conversation_id, type, display_name, last_active)
         VALUES (?, ?, ?, ?, ?)`,
        [sessId, convId, 'daily', 'Test Session', now]
      );

      // Delete conversation
      await db.execute('DELETE FROM conversations WHERE id = ?', [convId]);

      // Verify session index was cascade deleted
      const rows = await db.select<{ id: string }>(
        'SELECT id FROM session_index WHERE id = ?',
        [sessId]
      );
      expect(rows).toHaveLength(0);
    });

    it('filters by type', async () => {
      const convId1 = generateId('conversation');
      const convId2 = generateId('conversation');
      const sessId1 = generateId('session');
      const sessId2 = generateId('session');
      const now = new Date().toISOString();

      // Create conversations
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId1, 'daily', now]
      );
      await db.execute(
        `INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)`,
        [convId2, 'project', now]
      );

      // Create session indexes with different types
      await db.execute(
        `INSERT INTO session_index (id, conversation_id, type, display_name, last_active)
         VALUES (?, ?, ?, ?, ?)`,
        [sessId1, convId1, 'daily', 'Daily', now]
      );
      await db.execute(
        `INSERT INTO session_index (id, conversation_id, type, display_name, last_active)
         VALUES (?, ?, ?, ?, ?)`,
        [sessId2, convId2, 'project', 'Project', now]
      );

      // Filter by type
      const dailyRows = await db.select<{ display_name: string }>(
        "SELECT display_name FROM session_index WHERE type = 'daily'"
      );
      expect(dailyRows).toHaveLength(1);
      expect(dailyRows[0].display_name).toBe('Daily');

      const projectRows = await db.select<{ display_name: string }>(
        "SELECT display_name FROM session_index WHERE type = 'project'"
      );
      expect(projectRows).toHaveLength(1);
      expect(projectRows[0].display_name).toBe('Project');
    });
  });
});
