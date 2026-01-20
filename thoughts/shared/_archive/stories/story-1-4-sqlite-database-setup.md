# Story 1.4: SQLite Database Setup

Status: done

---

## Story

As a user,
I want my data stored locally on my device,
So that my information stays private and under my control.

---

## Acceptance Criteria

1. **AC1: Database File Creation**
   - **Given** the app launches for the first time
   - **When** initialization completes
   - **Then** SQLite database is created at `~/Library/Application Support/Orion/orion.db` (ARCH-007)
   - **And** the parent directory is created if it doesn't exist
   - **And** the database file has appropriate permissions (user read/write only)

2. **AC2: WAL Mode Enabled**
   - **Given** the database is initialized
   - **When** any database operation occurs
   - **Then** WAL (Write-Ahead Logging) mode is enabled for concurrent reads (ARCH-008)
   - **And** `PRAGMA journal_mode` returns `wal`
   - **And** cache size is set to 64MB for performance (`PRAGMA cache_size=-64000`)

3. **AC3: Core Schema - Conversations Table**
   - **Given** the database is initialized
   - **When** I query the schema
   - **Then** the `conversations` table exists with columns:
     - `id` (TEXT PRIMARY KEY) - format: `conv_xxx`
     - `sdk_session_id` (TEXT) - Claude SDK session ID
     - `title` (TEXT)
     - `summary` (TEXT)
     - `project_id` (TEXT, FK to projects)
     - `area_id` (TEXT, FK to areas)
     - `message_count` (INTEGER DEFAULT 0)
     - `tool_call_count` (INTEGER DEFAULT 0)
     - `is_active` (INTEGER DEFAULT 1)
     - `is_pinned` (INTEGER DEFAULT 0)
     - `tags` (TEXT) - JSON array
     - `metadata` (TEXT) - JSON
     - `started_at` (TEXT DEFAULT datetime('now'))
     - `last_message_at` (TEXT)
     - `archived_at` (TEXT)

4. **AC4: Core Schema - Messages Table**
   - **Given** the database is initialized
   - **When** I query the schema
   - **Then** the `messages` table exists with columns:
     - `id` (TEXT PRIMARY KEY) - format: `msg_xxx`
     - `conversation_id` (TEXT NOT NULL, FK to conversations ON DELETE CASCADE)
     - `role` (TEXT NOT NULL) - user | assistant | system
     - `content` (TEXT NOT NULL)
     - `tool_calls` (TEXT) - JSON array
     - `tool_results` (TEXT) - JSON array
     - `input_tokens` (INTEGER)
     - `output_tokens` (INTEGER)
     - `feedback` (TEXT) - thumbs_up | thumbs_down
     - `feedback_note` (TEXT)
     - `metadata` (TEXT) - JSON
     - `created_at` (TEXT DEFAULT datetime('now'))
   - **And** indexes exist on `conversation_id` and `created_at`

5. **AC5: Data Persistence**
   - **Given** the database exists with data
   - **When** the app launches again
   - **Then** existing data is preserved
   - **And** no data is lost or corrupted

6. **AC6: Schema Migrations**
   - **Given** the database exists
   - **When** the app launches with a newer schema version
   - **Then** migrations run automatically and idempotently
   - **And** existing data is preserved during migrations
   - **And** migration version is tracked in a `schema_version` metadata

7. **AC7: Foreign Keys Enforced**
   - **Given** the database is initialized
   - **When** any database operation occurs
   - **Then** `PRAGMA foreign_keys` returns `1` (enabled)
   - **And** invalid foreign key references are rejected

---

## Tasks / Subtasks

- [x] **Task 1: Database Path & Directory Setup** (AC: 1)
  - [x] 1.1 Create utility function to determine database path:
    ```typescript
    // src/lib/db/path.ts
    export function getDatabasePath(): string {
      // On macOS: ~/Library/Application Support/Orion/orion.db
      const appSupport = process.env.HOME
        ? path.join(process.env.HOME, 'Library', 'Application Support', 'Orion')
        : './data';
      return path.join(appSupport, 'orion.db');
    }
    ```
  - [x] 1.2 Create directory if it doesn't exist with `fs.mkdirSync(dir, { recursive: true })`
  - [x] 1.3 Verify correct permissions (0o700 for directory, 0o600 for db file)
  - [x] 1.4 Handle cross-platform fallback for non-macOS development (./data folder)

- [x] **Task 2: Database Initialization Module** (AC: 1, 2, 7)
  - [x] 2.1 Install better-sqlite3: `pnpm add better-sqlite3 @types/better-sqlite3`
  - [x] 2.2 Create database initialization module:
    ```typescript
    // src/lib/db/index.ts
    import Database from 'better-sqlite3';
    import { getDatabasePath } from './path';
    import { runMigrations } from './migrations';

    let db: Database.Database | null = null;

    export function getDatabase(): Database.Database {
      if (!db) {
        db = initializeDatabase();
      }
      return db;
    }

    function initializeDatabase(): Database.Database {
      const dbPath = getDatabasePath();
      ensureDirectory(path.dirname(dbPath));

      const database = new Database(dbPath);

      // Enable WAL mode (ARCH-008)
      database.pragma('journal_mode = WAL');

      // Enable foreign keys
      database.pragma('foreign_keys = ON');

      // Set cache size to 64MB
      database.pragma('cache_size = -64000');

      // Run migrations
      runMigrations(database);

      return database;
    }
    ```
  - [x] 2.3 Add database close function for graceful shutdown
  - [x] 2.4 Export typed database instance

- [x] **Task 3: Schema Version Tracking** (AC: 6)
  - [x] 3.1 Create schema_version table:
    ```sql
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now')),
      description TEXT
    );
    ```
  - [x] 3.2 Create function to get current schema version
  - [x] 3.3 Create function to set schema version after migration

- [x] **Task 4: Migration Framework** (AC: 6)
  - [x] 4.1 Create migrations directory: `src/lib/db/migrations/`
  - [x] 4.2 Create migration runner:
    ```typescript
    // src/lib/db/migrations/index.ts
    import type Database from 'better-sqlite3';
    import { migration_001_initial } from './001_initial';

    export interface Migration {
      version: number;
      description: string;
      up: (db: Database.Database) => void;
    }

    const migrations: Migration[] = [
      migration_001_initial,
    ];

    export function runMigrations(db: Database.Database): void {
      const currentVersion = getCurrentVersion(db);

      for (const migration of migrations) {
        if (migration.version > currentVersion) {
          console.log(`Running migration ${migration.version}: ${migration.description}`);

          db.transaction(() => {
            migration.up(db);
            setVersion(db, migration.version, migration.description);
          })();
        }
      }
    }
    ```
  - [x] 4.3 Ensure migrations run within transactions
  - [x] 4.4 Add logging for migration progress

- [x] **Task 5: Initial Migration - Conversations & Messages** (AC: 3, 4)
  - [x] 5.1 Create first migration file:
    ```typescript
    // src/lib/db/migrations/001_initial.ts
    import type Database from 'better-sqlite3';
    import type { Migration } from './index';

    export const migration_001_initial: Migration = {
      version: 1,
      description: 'Create conversations and messages tables',
      up: (db: Database.Database) => {
        // Conversations table
        db.exec(`
          CREATE TABLE conversations (
            id TEXT PRIMARY KEY,
            sdk_session_id TEXT,
            title TEXT,
            summary TEXT,
            project_id TEXT,
            area_id TEXT,
            message_count INTEGER DEFAULT 0,
            tool_call_count INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            is_pinned INTEGER DEFAULT 0,
            tags TEXT,
            metadata TEXT,
            started_at TEXT DEFAULT (datetime('now')),
            last_message_at TEXT,
            archived_at TEXT
          );

          CREATE INDEX idx_conversations_active
            ON conversations(is_active, last_message_at DESC);
        `);

        // Messages table
        db.exec(`
          CREATE TABLE messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
            content TEXT NOT NULL,
            tool_calls TEXT,
            tool_results TEXT,
            input_tokens INTEGER,
            output_tokens INTEGER,
            feedback TEXT CHECK (feedback IN ('thumbs_up', 'thumbs_down') OR feedback IS NULL),
            feedback_note TEXT,
            metadata TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
          );

          CREATE INDEX idx_messages_conversation
            ON messages(conversation_id, created_at);
        `);
      },
    };
    ```
  - [x] 5.2 Verify all column types match architecture spec
  - [x] 5.3 Add CHECK constraints for enum-like fields (role, feedback)

- [x] **Task 6: ID Generation Utilities** (AC: 3, 4)
  - [x] 6.1 Create ID generation module:
    ```typescript
    // src/lib/db/ids.ts
    import { randomBytes } from 'crypto';

    export function generateId(prefix: string): string {
      const random = randomBytes(8).toString('base64url').slice(0, 11);
      return `${prefix}_${random}`;
    }

    export const generateConversationId = () => generateId('conv');
    export const generateMessageId = () => generateId('msg');
    ```
  - [x] 6.2 Ensure IDs are URL-safe and unique

- [x] **Task 7: Type Definitions** (AC: 3, 4)
  - [x] 7.1 Create TypeScript types for database entities:
    ```typescript
    // src/lib/db/types.ts
    export interface Conversation {
      id: string;
      sdk_session_id: string | null;
      title: string | null;
      summary: string | null;
      project_id: string | null;
      area_id: string | null;
      message_count: number;
      tool_call_count: number;
      is_active: boolean;
      is_pinned: boolean;
      tags: string[] | null;
      metadata: Record<string, unknown> | null;
      started_at: string;
      last_message_at: string | null;
      archived_at: string | null;
    }

    export type MessageRole = 'user' | 'assistant' | 'system';
    export type MessageFeedback = 'thumbs_up' | 'thumbs_down';

    export interface Message {
      id: string;
      conversation_id: string;
      role: MessageRole;
      content: string;
      tool_calls: unknown[] | null;
      tool_results: unknown[] | null;
      input_tokens: number | null;
      output_tokens: number | null;
      feedback: MessageFeedback | null;
      feedback_note: string | null;
      metadata: Record<string, unknown> | null;
      created_at: string;
    }
    ```
  - [x] 7.2 Add type guards for JSON fields

- [x] **Task 8: Basic CRUD Operations** (AC: 3, 4, 5)
  - [x] 8.1 Create conversation repository:
    ```typescript
    // src/lib/db/repositories/conversations.ts
    export function createConversation(data: Partial<Conversation>): Conversation;
    export function getConversation(id: string): Conversation | null;
    export function updateConversation(id: string, data: Partial<Conversation>): void;
    export function listConversations(options: { active?: boolean }): Conversation[];
    ```
  - [x] 8.2 Create message repository:
    ```typescript
    // src/lib/db/repositories/messages.ts
    export function createMessage(data: Omit<Message, 'id' | 'created_at'>): Message;
    export function getMessages(conversationId: string): Message[];
    export function getMessage(id: string): Message | null;
    ```
  - [x] 8.3 Use prepared statements for performance

- [x] **Task 9: Integration with Tauri** (AC: 1, 5)
  - [x] 9.1 Create Tauri command for database initialization:
    ```typescript
    // src-tauri/src/commands/db.rs (if using Rust)
    // OR src/lib/tauri/commands.ts (if using JS)
    ```
  - [x] 9.2 Initialize database on app startup (before frontend loads)
  - [x] 9.3 Ensure database is closed on app quit

- [x] **Task 10: Unit Tests** (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] 10.1 Create test setup with in-memory database option:
    ```typescript
    // tests/db/setup.ts
    export function createTestDatabase(): Database.Database {
      const db = new Database(':memory:');
      db.pragma('foreign_keys = ON');
      runMigrations(db);
      return db;
    }
    ```
  - [x] 10.2 Test database path resolution
  - [x] 10.3 Test WAL mode activation
  - [x] 10.4 Test foreign key enforcement
  - [x] 10.5 Test conversation CRUD operations
  - [x] 10.6 Test message CRUD operations
  - [x] 10.7 Test cascade delete (messages deleted when conversation deleted)
  - [x] 10.8 Test schema migration idempotency

- [x] **Task 11: Integration Tests** (AC: 1, 2, 5)
  - [x] 11.1 Test database file created at correct path
  - [x] 11.2 Test WAL mode is active: `PRAGMA journal_mode` returns 'wal'
  - [x] 11.3 Test data persistence across restarts (using temp directory)
  - [x] 11.4 Test directory creation if parent doesn't exist

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Database Location | `~/Library/Application Support/Orion/orion.db` | ARCH-007 |
| Journal Mode | WAL mode enabled | ARCH-008 |
| Local-First | Data stays on device | NFR-S001 |
| Vector Support | sqlite-vec for embeddings (future) | ARCH-002 |
| Full-Text Search | FTS5 enabled (future) | ARCH-002 |

### Schema Reference (from architecture.md)

The full schema is defined in `thoughts/planning-artifacts/architecture.md#4.1`. This story implements only the **core tables for Epic 1**:

- `conversations` - Chat sessions
- `messages` - Individual messages within conversations

Additional tables will be added in later stories:
- Story 1.6 adds message persistence logic
- Epic 7 adds `contacts`, `organizations`, `contact_methods`
- Epic 8 adds `projects`, `areas`, `tasks`
- Epic 4 adds `inbox_items`
- etc.

### SQLite Pragmas Required

```sql
-- From architecture.md#4.1
PRAGMA journal_mode=WAL;      -- Write-Ahead Logging for concurrent reads
PRAGMA foreign_keys=ON;       -- Enforce referential integrity
PRAGMA cache_size=-64000;     -- 64MB cache for performance
```

### ID Format Convention

| Entity | Prefix | Example |
|--------|--------|---------|
| Conversation | `conv_` | `conv_abc123xyz` |
| Message | `msg_` | `msg_def456uvw` |
| Contact | `cont_` | `cont_ghi789rst` |
| Project | `proj_` | `proj_jkl012mno` |
| Task | `task_` | `task_pqr345stu` |

### Directory Structure for This Story

```
src/
├── lib/
│   └── db/
│       ├── index.ts              # Database initialization and singleton
│       ├── path.ts               # Database path utilities
│       ├── ids.ts                # ID generation utilities
│       ├── types.ts              # TypeScript type definitions
│       ├── migrations/
│       │   ├── index.ts          # Migration runner
│       │   └── 001_initial.ts    # Initial schema migration
│       └── repositories/
│           ├── conversations.ts  # Conversation CRUD
│           └── messages.ts       # Message CRUD
tests/
├── unit/
│   └── db/
│       ├── setup.ts              # Test database setup
│       ├── migrations.test.ts    # Migration tests
│       ├── conversations.test.ts # Conversation repository tests
│       └── messages.test.ts      # Message repository tests
└── integration/
    └── db/
        ├── persistence.test.ts   # Data persistence tests
        └── pragmas.test.ts       # SQLite pragma verification
```

### Dependencies

**NPM Packages:**
```json
{
  "dependencies": {
    "better-sqlite3": "^11.0.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0"
  }
}
```

**Why better-sqlite3?**
- Synchronous API (simpler than async sqlite3)
- Better performance for desktop apps
- Native bindings compiled per-platform
- Well-maintained and widely used

### Project Structure Notes

- **Dependency:** Requires Story 1.1 (Tauri Desktop Shell) - needs app support directory
- **Parallel:** Can be developed in parallel with Story 1.3 (Design System)
- **Enables:** Story 1.6 (Chat Message Storage) builds on this database foundation
- **Future:** Story 1.5 (Agent Server) may need database access for session management

### Technical Notes

1. **WAL Mode Benefits**
   - Allows concurrent reads while writing
   - Better crash recovery
   - Faster for most workloads
   - Creates additional files: `orion.db-wal`, `orion.db-shm`

2. **Migration Strategy**
   - Migrations are numbered sequentially (001, 002, etc.)
   - Each migration runs in a transaction
   - Migrations are idempotent - safe to run multiple times
   - Version tracked in `schema_version` table

3. **Type Safety**
   - Use Zod schemas for runtime validation of JSON fields
   - TypeScript types for compile-time safety
   - Prepared statements prevent SQL injection

4. **Performance Considerations**
   - Use prepared statements for repeated queries
   - Index frequently queried columns
   - 64MB cache size for in-memory performance
   - WAL mode for concurrent access

5. **Error Handling**
   - Wrap database operations in try-catch
   - Log errors with context for debugging
   - Graceful degradation if database unavailable

### Testing Standards

| Test Type | Framework | Files |
|-----------|-----------|-------|
| Unit | Vitest | `tests/unit/db/*.test.ts` |
| Integration | Vitest | `tests/integration/db/*.test.ts` |

### Tests to Implement

```typescript
// tests/unit/db/migrations.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '@/lib/db/migrations';

describe('Database Migrations', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
  });

  afterEach(() => {
    db.close();
  });

  test('migrations run successfully on empty database', () => {
    expect(() => runMigrations(db)).not.toThrow();
  });

  test('migrations are idempotent', () => {
    runMigrations(db);
    expect(() => runMigrations(db)).not.toThrow(); // Second run should be no-op
  });

  test('conversations table has correct columns', () => {
    runMigrations(db);
    const info = db.prepare("PRAGMA table_info(conversations)").all();
    const columns = info.map((col: any) => col.name);

    expect(columns).toContain('id');
    expect(columns).toContain('sdk_session_id');
    expect(columns).toContain('title');
    expect(columns).toContain('message_count');
    expect(columns).toContain('is_active');
    expect(columns).toContain('started_at');
    expect(columns).toContain('last_message_at');
  });

  test('messages table has correct columns', () => {
    runMigrations(db);
    const info = db.prepare("PRAGMA table_info(messages)").all();
    const columns = info.map((col: any) => col.name);

    expect(columns).toContain('id');
    expect(columns).toContain('conversation_id');
    expect(columns).toContain('role');
    expect(columns).toContain('content');
    expect(columns).toContain('tool_calls');
    expect(columns).toContain('created_at');
  });

  test('messages.conversation_id foreign key exists', () => {
    runMigrations(db);
    const fks = db.prepare("PRAGMA foreign_key_list(messages)").all();
    const conversationFk = fks.find((fk: any) => fk.table === 'conversations');

    expect(conversationFk).toBeDefined();
    expect(conversationFk?.from).toBe('conversation_id');
    expect(conversationFk?.to).toBe('id');
  });
});

// tests/unit/db/conversations.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '@/lib/db/migrations';
import {
  createConversation,
  getConversation,
  updateConversation,
  listConversations,
} from '@/lib/db/repositories/conversations';

describe('Conversation Repository', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  });

  afterEach(() => {
    db.close();
  });

  test('createConversation generates valid ID', () => {
    const conv = createConversation(db, { title: 'Test' });
    expect(conv.id).toMatch(/^conv_[a-zA-Z0-9_-]+$/);
  });

  test('createConversation sets default values', () => {
    const conv = createConversation(db, {});
    expect(conv.message_count).toBe(0);
    expect(conv.is_active).toBe(true);
    expect(conv.is_pinned).toBe(false);
    expect(conv.started_at).toBeDefined();
  });

  test('getConversation returns null for non-existent ID', () => {
    const result = getConversation(db, 'conv_nonexistent');
    expect(result).toBeNull();
  });

  test('updateConversation modifies existing record', () => {
    const conv = createConversation(db, { title: 'Original' });
    updateConversation(db, conv.id, { title: 'Updated' });
    const updated = getConversation(db, conv.id);
    expect(updated?.title).toBe('Updated');
  });

  test('listConversations returns active conversations', () => {
    createConversation(db, { title: 'Active', is_active: 1 });
    createConversation(db, { title: 'Inactive', is_active: 0 });

    const active = listConversations(db, { active: true });
    expect(active).toHaveLength(1);
    expect(active[0].title).toBe('Active');
  });
});

// tests/unit/db/messages.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '@/lib/db/migrations';
import { createConversation } from '@/lib/db/repositories/conversations';
import {
  createMessage,
  getMessages,
  getMessage,
} from '@/lib/db/repositories/messages';

describe('Message Repository', () => {
  let db: Database.Database;
  let conversationId: string;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    const conv = createConversation(db, { title: 'Test' });
    conversationId = conv.id;
  });

  afterEach(() => {
    db.close();
  });

  test('createMessage generates valid ID', () => {
    const msg = createMessage(db, {
      conversation_id: conversationId,
      role: 'user',
      content: 'Hello',
    });
    expect(msg.id).toMatch(/^msg_[a-zA-Z0-9_-]+$/);
  });

  test('createMessage validates role enum', () => {
    expect(() => createMessage(db, {
      conversation_id: conversationId,
      role: 'invalid' as any,
      content: 'Hello',
    })).toThrow();
  });

  test('createMessage fails with invalid conversation_id', () => {
    expect(() => createMessage(db, {
      conversation_id: 'conv_nonexistent',
      role: 'user',
      content: 'Hello',
    })).toThrow(); // Foreign key constraint
  });

  test('getMessages returns messages in chronological order', () => {
    createMessage(db, { conversation_id: conversationId, role: 'user', content: 'First' });
    createMessage(db, { conversation_id: conversationId, role: 'assistant', content: 'Second' });

    const messages = getMessages(db, conversationId);
    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('First');
    expect(messages[1].content).toBe('Second');
  });

  test('cascade delete removes messages when conversation deleted', () => {
    createMessage(db, { conversation_id: conversationId, role: 'user', content: 'Test' });

    db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationId);

    const messages = getMessages(db, conversationId);
    expect(messages).toHaveLength(0);
  });
});

// tests/integration/db/pragmas.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, closeDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('SQLite Pragmas', () => {
  const testDbPath = path.join(os.tmpdir(), 'orion-test', 'orion.db');

  beforeEach(() => {
    // Clean up before each test
    const dir = path.dirname(testDbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  });

  afterEach(() => {
    closeDatabase();
    // Clean up after each test
    const dir = path.dirname(testDbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  });

  test('WAL mode is enabled', () => {
    process.env.ORION_DB_PATH = testDbPath;
    const db = getDatabase();
    const result = db.pragma('journal_mode');
    expect(result[0].journal_mode).toBe('wal');
  });

  test('foreign keys are enabled', () => {
    process.env.ORION_DB_PATH = testDbPath;
    const db = getDatabase();
    const result = db.pragma('foreign_keys');
    expect(result[0].foreign_keys).toBe(1);
  });

  test('cache size is set to 64MB', () => {
    process.env.ORION_DB_PATH = testDbPath;
    const db = getDatabase();
    const result = db.pragma('cache_size');
    expect(result[0].cache_size).toBe(-64000);
  });
});

// tests/integration/db/persistence.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '@/lib/db/migrations';
import { createConversation } from '@/lib/db/repositories/conversations';
import { createMessage } from '@/lib/db/repositories/messages';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Data Persistence', () => {
  const testDbPath = path.join(os.tmpdir(), 'orion-persistence-test', 'orion.db');

  beforeEach(() => {
    const dir = path.dirname(testDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  afterEach(() => {
    const dir = path.dirname(testDbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  });

  test('data persists across database restarts', () => {
    // First session: create data
    let db1 = new Database(testDbPath);
    db1.pragma('foreign_keys = ON');
    runMigrations(db1);
    const conv = createConversation(db1, { title: 'Persistent' });
    createMessage(db1, {
      conversation_id: conv.id,
      role: 'user',
      content: 'Hello world',
    });
    db1.close();

    // Second session: verify data
    let db2 = new Database(testDbPath);
    db2.pragma('foreign_keys = ON');
    runMigrations(db2);

    const conversations = db2.prepare('SELECT * FROM conversations').all();
    expect(conversations).toHaveLength(1);
    expect((conversations[0] as any).title).toBe('Persistent');

    const messages = db2.prepare('SELECT * FROM messages').all();
    expect(messages).toHaveLength(1);
    expect((messages[0] as any).content).toBe('Hello world');

    db2.close();
  });

  test('database file created at correct path', () => {
    const db = new Database(testDbPath);
    db.pragma('journal_mode = WAL');
    db.close();

    expect(fs.existsSync(testDbPath)).toBe(true);
    // WAL mode creates additional files
    expect(fs.existsSync(testDbPath + '-wal')).toBe(true);
    expect(fs.existsSync(testDbPath + '-shm')).toBe(true);
  });
});
```

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#4.1 SQLite Schema (Local Data)]
- [Source: thoughts/planning-artifacts/architecture.md#1.3 Key Design Decisions]
- [Source: thoughts/planning-artifacts/architecture.md#ARCH-007 Database Location]
- [Source: thoughts/planning-artifacts/architecture.md#ARCH-008 WAL Mode]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.4: SQLite Database Setup]
- [Source: thoughts/planning-artifacts/prd.md#6.3 Database Architecture]
- [Source: thoughts/planning-artifacts/prd.md#NFR-S001 Local-First Architecture]
- [Source: thoughts/implementation-artifacts/stories/story-1-1-tauri-desktop-shell.md] (provides app directory)
- [Source: thoughts/implementation-artifacts/stories/story-1-3-design-system-foundation.md] (parallel story)

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 310 tests pass (21 test files)
- Database unit tests: 5 files (migrations, conversations, messages, ids, setup)
- Database integration tests: 3 files (pragmas, persistence, path)

### Completion Notes List

1. **AC1 (Database File Creation)**: Verified - `getDatabasePath()` returns correct macOS path, `ensureDatabaseDirectory()` creates directories with 0o700 permissions
2. **AC2 (WAL Mode)**: Verified - Integration tests confirm `PRAGMA journal_mode` returns 'wal' and auxiliary files are created
3. **AC3 (Conversations Table)**: Verified - All 15 columns present with correct types, defaults, and indexes
4. **AC4 (Messages Table)**: Verified - All 12 columns present with FK to conversations, CHECK constraints on role/feedback
5. **AC5 (Data Persistence)**: Verified - Integration tests confirm data survives database restarts
6. **AC6 (Schema Migrations)**: Verified - schema_version table tracks migrations, migrations are idempotent
7. **AC7 (Foreign Keys)**: Verified - `PRAGMA foreign_keys` returns 1, FK violations throw errors, CASCADE delete works

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive SQLite setup and migration framework | SM Agent (Bob) |
| 2026-01-15 | Implementation complete - all tasks done, all tests passing | Dev Agent (Amelia) |

### File List

**Source Files (src/lib/db/):**
- `src/lib/db/index.ts` - Database module with singleton, initialization, and exports
- `src/lib/db/path.ts` - Platform-specific database path utilities
- `src/lib/db/ids.ts` - ID generation utilities (conv_, msg_, etc.)
- `src/lib/db/types.ts` - TypeScript type definitions for database entities
- `src/lib/db/service.ts` - Database service lifecycle management
- `src/lib/db/migrations/index.ts` - Migration framework and runner
- `src/lib/db/migrations/001_initial.ts` - Initial schema (conversations, messages)
- `src/lib/db/repositories/index.ts` - Repository exports
- `src/lib/db/repositories/conversations.ts` - Conversation CRUD operations
- `src/lib/db/repositories/messages.ts` - Message CRUD operations

**Test Files:**
- `tests/unit/db/setup.ts` - Test database setup utilities
- `tests/unit/db/migrations.test.ts` - Migration framework tests (AC3, AC4, AC6)
- `tests/unit/db/conversations.test.ts` - Conversation repository tests (AC3, AC5)
- `tests/unit/db/messages.test.ts` - Message repository tests (AC4, AC5, AC7)
- `tests/unit/db/ids.test.ts` - ID generation tests
- `tests/integration/db/pragmas.test.ts` - SQLite pragma verification (AC2, AC7)
- `tests/integration/db/persistence.test.ts` - Data persistence tests (AC5)
- `tests/integration/db/path.test.ts` - Path utility tests (AC1)
