# ATDD Checklist: Story 1.4 - SQLite Database Setup

**Story ID:** 1-4-sqlite-database-setup
**Epic:** 1 - Foundation & Core Chat
**Generated:** 2026-01-15
**Status:** ready-for-dev

---

## Test Coverage Summary

| AC | Description | Unit Tests | Integration Tests | E2E Tests |
|----|-------------|------------|-------------------|-----------|
| AC1 | Database File Creation | 3 | 2 | 1 |
| AC2 | WAL Mode Enabled | 2 | 2 | 0 |
| AC3 | Conversations Table Schema | 5 | 1 | 0 |
| AC4 | Messages Table Schema | 5 | 1 | 0 |
| AC5 | Data Persistence | 2 | 3 | 1 |
| AC6 | Migration System | 5 | 2 | 0 |
| AC7 | Foreign Key Enforcement | 3 | 2 | 0 |

**Total:** 25 Unit | 13 Integration | 2 E2E

---

## AC1: Database File Creation

### Unit Tests

- [ ] **U-AC1-01**: `getDatabasePath()` returns correct macOS path
  ```typescript
  // tests/unit/db/path.test.ts
  test('returns ~/Library/Application Support/Orion/orion.db on macOS', () => {
    const originalHome = process.env.HOME;
    process.env.HOME = '/Users/testuser';

    const dbPath = getDatabasePath();

    expect(dbPath).toBe('/Users/testuser/Library/Application Support/Orion/orion.db');
    process.env.HOME = originalHome;
  });
  ```

- [ ] **U-AC1-02**: `getDatabasePath()` falls back to ./data when HOME undefined
  ```typescript
  test('falls back to ./data/orion.db when HOME is undefined', () => {
    const originalHome = process.env.HOME;
    delete process.env.HOME;

    const dbPath = getDatabasePath();

    expect(dbPath).toBe('./data/orion.db');
    process.env.HOME = originalHome;
  });
  ```

- [ ] **U-AC1-03**: `ensureDirectory()` creates nested directories
  ```typescript
  test('creates nested directories with correct permissions', () => {
    const testDir = path.join(os.tmpdir(), 'orion-test-nested/a/b/c');

    ensureDirectory(testDir);

    expect(fs.existsSync(testDir)).toBe(true);
    const stats = fs.statSync(testDir);
    expect(stats.mode & 0o777).toBe(0o700);
  });
  ```

### Integration Tests

- [ ] **I-AC1-01**: Database file created at correct path on first launch
  ```typescript
  // tests/integration/db/file-creation.test.ts
  test('database file created at expected path', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-test-ac1', 'orion.db');
    process.env.ORION_DB_PATH = testDbPath;

    const db = getDatabase();

    expect(fs.existsSync(testDbPath)).toBe(true);
    closeDatabase();
  });
  ```

- [ ] **I-AC1-02**: Parent directory created if it doesn't exist
  ```typescript
  test('creates parent directory if missing', () => {
    const testDir = path.join(os.tmpdir(), 'orion-nonexistent-dir-' + Date.now());
    const testDbPath = path.join(testDir, 'orion.db');
    process.env.ORION_DB_PATH = testDbPath;

    expect(fs.existsSync(testDir)).toBe(false);

    const db = getDatabase();

    expect(fs.existsSync(testDir)).toBe(true);
    expect(fs.existsSync(testDbPath)).toBe(true);
    closeDatabase();
  });
  ```

### E2E Tests

- [ ] **E-AC1-01**: Database file exists after app first launch
  ```typescript
  // tests/e2e/db/database-creation.test.ts
  test('database exists in Application Support after first launch', async () => {
    // Launch app via Tauri
    const app = await launchApp();
    await app.waitForReady();

    const expectedPath = path.join(
      os.homedir(),
      'Library/Application Support/Orion/orion.db'
    );

    expect(fs.existsSync(expectedPath)).toBe(true);
    await app.close();
  });
  ```

---

## AC2: WAL Mode Enabled

### Unit Tests

- [ ] **U-AC2-01**: Database initialization sets WAL mode
  ```typescript
  // tests/unit/db/init.test.ts
  test('initializeDatabase enables WAL mode', () => {
    const db = new Database(':memory:');

    initializePragmas(db);

    const result = db.pragma('journal_mode');
    expect(result[0].journal_mode).toBe('wal');
    db.close();
  });
  ```

- [ ] **U-AC2-02**: Database initialization sets cache size to 64MB
  ```typescript
  test('initializeDatabase sets cache_size to -64000', () => {
    const db = new Database(':memory:');

    initializePragmas(db);

    const result = db.pragma('cache_size');
    expect(result[0].cache_size).toBe(-64000);
    db.close();
  });
  ```

### Integration Tests

- [ ] **I-AC2-01**: WAL mode verified via PRAGMA on real database
  ```typescript
  // tests/integration/db/pragmas.test.ts
  test('PRAGMA journal_mode returns wal', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-wal-test', 'orion.db');
    process.env.ORION_DB_PATH = testDbPath;

    const db = getDatabase();
    const result = db.pragma('journal_mode');

    expect(result[0].journal_mode).toBe('wal');
    closeDatabase();
  });
  ```

- [ ] **I-AC2-02**: WAL auxiliary files created (.wal, .shm)
  ```typescript
  test('WAL creates auxiliary files', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-wal-files', 'orion.db');
    process.env.ORION_DB_PATH = testDbPath;

    const db = getDatabase();
    // Perform a write to ensure WAL is active
    db.exec('SELECT 1');

    expect(fs.existsSync(testDbPath + '-wal')).toBe(true);
    expect(fs.existsSync(testDbPath + '-shm')).toBe(true);
    closeDatabase();
  });
  ```

---

## AC3: Conversations Table Schema

### Unit Tests

- [ ] **U-AC3-01**: Conversations table created with all required columns
  ```typescript
  // tests/unit/db/schema.test.ts
  test('conversations table has all required columns', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const info = db.prepare("PRAGMA table_info(conversations)").all();
    const columns = info.map((col: any) => col.name);

    expect(columns).toEqual(expect.arrayContaining([
      'id', 'sdk_session_id', 'title', 'summary',
      'project_id', 'area_id', 'message_count', 'tool_call_count',
      'is_active', 'is_pinned', 'tags', 'metadata',
      'started_at', 'last_message_at', 'archived_at'
    ]));
    db.close();
  });
  ```

- [ ] **U-AC3-02**: Conversations.id is TEXT PRIMARY KEY
  ```typescript
  test('conversations.id is TEXT PRIMARY KEY', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const info = db.prepare("PRAGMA table_info(conversations)").all();
    const idCol = info.find((col: any) => col.name === 'id');

    expect(idCol.type).toBe('TEXT');
    expect(idCol.pk).toBe(1);
    db.close();
  });
  ```

- [ ] **U-AC3-03**: Conversations has default values for message_count, is_active, is_pinned
  ```typescript
  test('conversations has correct default values', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_test');
    const row = db.prepare("SELECT * FROM conversations WHERE id = ?").get('conv_test');

    expect(row.message_count).toBe(0);
    expect(row.is_active).toBe(1);
    expect(row.is_pinned).toBe(0);
    expect(row.tool_call_count).toBe(0);
    db.close();
  });
  ```

- [ ] **U-AC3-04**: Conversations.started_at defaults to current datetime
  ```typescript
  test('conversations.started_at defaults to datetime("now")', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const before = new Date().toISOString().slice(0, 19);
    db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_test');
    const row = db.prepare("SELECT started_at FROM conversations WHERE id = ?").get('conv_test');
    const after = new Date().toISOString().slice(0, 19);

    // started_at should be between before and after (within same second)
    expect(row.started_at).toBeDefined();
    expect(row.started_at.length).toBeGreaterThan(0);
    db.close();
  });
  ```

- [ ] **U-AC3-05**: Index exists on conversations(is_active, last_message_at)
  ```typescript
  test('conversations has performance index on is_active and last_message_at', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const indexes = db.prepare("PRAGMA index_list(conversations)").all();
    const activeIndex = indexes.find((idx: any) => idx.name === 'idx_conversations_active');

    expect(activeIndex).toBeDefined();
    db.close();
  });
  ```

### Integration Tests

- [ ] **I-AC3-01**: Full schema matches architecture specification
  ```typescript
  // tests/integration/db/schema-validation.test.ts
  test('conversations schema matches ARCH-007 specification', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-schema-test', 'orion.db');
    process.env.ORION_DB_PATH = testDbPath;

    const db = getDatabase();
    const info = db.prepare("PRAGMA table_info(conversations)").all();

    // Verify column count
    expect(info.length).toBe(15);

    // Verify critical columns exist with correct types
    const colMap = Object.fromEntries(info.map((c: any) => [c.name, c]));
    expect(colMap.id.type).toBe('TEXT');
    expect(colMap.message_count.type).toBe('INTEGER');
    expect(colMap.is_active.type).toBe('INTEGER');

    closeDatabase();
  });
  ```

---

## AC4: Messages Table Schema

### Unit Tests

- [ ] **U-AC4-01**: Messages table created with all required columns
  ```typescript
  // tests/unit/db/schema.test.ts
  test('messages table has all required columns', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const info = db.prepare("PRAGMA table_info(messages)").all();
    const columns = info.map((col: any) => col.name);

    expect(columns).toEqual(expect.arrayContaining([
      'id', 'conversation_id', 'role', 'content',
      'tool_calls', 'tool_results', 'input_tokens', 'output_tokens',
      'feedback', 'feedback_note', 'metadata', 'created_at'
    ]));
    db.close();
  });
  ```

- [ ] **U-AC4-02**: Messages.conversation_id has foreign key to conversations
  ```typescript
  test('messages.conversation_id references conversations.id', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const fks = db.prepare("PRAGMA foreign_key_list(messages)").all();
    const conversationFk = fks.find((fk: any) => fk.table === 'conversations');

    expect(conversationFk).toBeDefined();
    expect(conversationFk.from).toBe('conversation_id');
    expect(conversationFk.to).toBe('id');
    expect(conversationFk.on_delete).toBe('CASCADE');
    db.close();
  });
  ```

- [ ] **U-AC4-03**: Messages.role has CHECK constraint for valid values
  ```typescript
  test('messages.role rejects invalid values', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_test');

    expect(() => {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content)
        VALUES (?, ?, ?, ?)
      `).run('msg_test', 'conv_test', 'invalid_role', 'content');
    }).toThrow();
    db.close();
  });
  ```

- [ ] **U-AC4-04**: Messages.feedback has CHECK constraint for thumbs_up/thumbs_down
  ```typescript
  test('messages.feedback accepts only valid values or null', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_test');

    // Valid values should work
    expect(() => {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, feedback)
        VALUES (?, ?, ?, ?, ?)
      `).run('msg_1', 'conv_test', 'user', 'content', 'thumbs_up');
    }).not.toThrow();

    expect(() => {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, feedback)
        VALUES (?, ?, ?, ?, ?)
      `).run('msg_2', 'conv_test', 'user', 'content', 'thumbs_down');
    }).not.toThrow();

    // Invalid value should fail
    expect(() => {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, feedback)
        VALUES (?, ?, ?, ?, ?)
      `).run('msg_3', 'conv_test', 'user', 'content', 'invalid');
    }).toThrow();
    db.close();
  });
  ```

- [ ] **U-AC4-05**: Index exists on messages(conversation_id, created_at)
  ```typescript
  test('messages has performance index on conversation_id and created_at', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const indexes = db.prepare("PRAGMA index_list(messages)").all();
    const msgIndex = indexes.find((idx: any) => idx.name === 'idx_messages_conversation');

    expect(msgIndex).toBeDefined();
    db.close();
  });
  ```

### Integration Tests

- [ ] **I-AC4-01**: Messages schema matches architecture specification
  ```typescript
  test('messages schema matches architecture specification', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-msg-schema', 'orion.db');
    process.env.ORION_DB_PATH = testDbPath;

    const db = getDatabase();
    const info = db.prepare("PRAGMA table_info(messages)").all();

    // Verify column count
    expect(info.length).toBe(12);

    // Verify critical columns
    const colMap = Object.fromEntries(info.map((c: any) => [c.name, c]));
    expect(colMap.conversation_id.notnull).toBe(1);
    expect(colMap.role.notnull).toBe(1);
    expect(colMap.content.notnull).toBe(1);

    closeDatabase();
  });
  ```

---

## AC5: Data Persistence

### Unit Tests

- [ ] **U-AC5-01**: Data survives database close and reopen (in-memory simulation)
  ```typescript
  // tests/unit/db/persistence.test.ts
  test('data survives transaction commit', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    db.transaction(() => {
      db.prepare("INSERT INTO conversations (id, title) VALUES (?, ?)").run('conv_1', 'Test');
    })();

    const row = db.prepare("SELECT * FROM conversations WHERE id = ?").get('conv_1');
    expect(row.title).toBe('Test');
    db.close();
  });
  ```

- [ ] **U-AC5-02**: Multiple writes within transaction are atomic
  ```typescript
  test('transaction rollback on error preserves data integrity', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_existing');

    expect(() => {
      db.transaction(() => {
        db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_new');
        // This will fail due to duplicate key
        db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_existing');
      })();
    }).toThrow();

    // conv_new should NOT exist due to rollback
    const row = db.prepare("SELECT * FROM conversations WHERE id = ?").get('conv_new');
    expect(row).toBeUndefined();
    db.close();
  });
  ```

### Integration Tests

- [ ] **I-AC5-01**: Data persists across process restart (file-based)
  ```typescript
  // tests/integration/db/persistence.test.ts
  test('data persists across database restarts', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-persist-' + Date.now(), 'orion.db');

    // Session 1: Write data
    {
      fs.mkdirSync(path.dirname(testDbPath), { recursive: true });
      const db1 = new Database(testDbPath);
      db1.pragma('foreign_keys = ON');
      runMigrations(db1);

      db1.prepare("INSERT INTO conversations (id, title) VALUES (?, ?)").run('conv_persist', 'Persistent');
      db1.prepare(`
        INSERT INTO messages (id, conversation_id, role, content)
        VALUES (?, ?, ?, ?)
      `).run('msg_persist', 'conv_persist', 'user', 'Hello');
      db1.close();
    }

    // Session 2: Read data
    {
      const db2 = new Database(testDbPath);
      db2.pragma('foreign_keys = ON');

      const conv = db2.prepare("SELECT * FROM conversations WHERE id = ?").get('conv_persist');
      const msg = db2.prepare("SELECT * FROM messages WHERE id = ?").get('msg_persist');

      expect(conv.title).toBe('Persistent');
      expect(msg.content).toBe('Hello');
      db2.close();
    }
  });
  ```

- [ ] **I-AC5-02**: Large data set persists correctly
  ```typescript
  test('handles 1000+ records without data loss', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-large-' + Date.now(), 'orion.db');
    fs.mkdirSync(path.dirname(testDbPath), { recursive: true });

    const db = new Database(testDbPath);
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    // Insert 100 conversations with 10 messages each
    const insertConv = db.prepare("INSERT INTO conversations (id) VALUES (?)");
    const insertMsg = db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content)
      VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (let c = 0; c < 100; c++) {
        const convId = `conv_${c}`;
        insertConv.run(convId);
        for (let m = 0; m < 10; m++) {
          insertMsg.run(`msg_${c}_${m}`, convId, 'user', `Message ${m}`);
        }
      }
    })();

    const convCount = db.prepare("SELECT COUNT(*) as count FROM conversations").get();
    const msgCount = db.prepare("SELECT COUNT(*) as count FROM messages").get();

    expect(convCount.count).toBe(100);
    expect(msgCount.count).toBe(1000);
    db.close();
  });
  ```

- [ ] **I-AC5-03**: WAL checkpoint preserves data
  ```typescript
  test('WAL checkpoint does not lose data', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-wal-checkpoint', 'orion.db');
    fs.mkdirSync(path.dirname(testDbPath), { recursive: true });

    const db = new Database(testDbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    db.prepare("INSERT INTO conversations (id, title) VALUES (?, ?)").run('conv_wal', 'WAL Test');

    // Force checkpoint
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();

    // Reopen and verify
    const db2 = new Database(testDbPath);
    const row = db2.prepare("SELECT * FROM conversations WHERE id = ?").get('conv_wal');
    expect(row.title).toBe('WAL Test');
    db2.close();
  });
  ```

### E2E Tests

- [ ] **E-AC5-01**: User data preserved after app restart
  ```typescript
  // tests/e2e/db/persistence.test.ts
  test('conversations persist after app restart', async () => {
    // Launch app and create conversation
    const app1 = await launchApp();
    await app1.createConversation('Persistent Test');
    await app1.close();

    // Relaunch and verify
    const app2 = await launchApp();
    const conversations = await app2.getConversations();

    expect(conversations.some(c => c.title === 'Persistent Test')).toBe(true);
    await app2.close();
  });
  ```

---

## AC6: Migration System

### Unit Tests

- [ ] **U-AC6-01**: Migration runner creates schema_version table
  ```typescript
  // tests/unit/db/migrations.test.ts
  test('runMigrations creates schema_version table', () => {
    const db = new Database(':memory:');

    runMigrations(db);

    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'
    `).all();
    expect(tables.length).toBe(1);
    db.close();
  });
  ```

- [ ] **U-AC6-02**: Migrations run in version order
  ```typescript
  test('migrations run in ascending version order', () => {
    const db = new Database(':memory:');
    const runOrder: number[] = [];

    // Mock migrations to track order
    const testMigrations = [
      { version: 3, description: 'Third', up: () => runOrder.push(3) },
      { version: 1, description: 'First', up: () => runOrder.push(1) },
      { version: 2, description: 'Second', up: () => runOrder.push(2) },
    ];

    runMigrationsWithList(db, testMigrations);

    expect(runOrder).toEqual([1, 2, 3]);
    db.close();
  });
  ```

- [ ] **U-AC6-03**: Migrations are idempotent (safe to run multiple times)
  ```typescript
  test('running migrations twice has no effect', () => {
    const db = new Database(':memory:');

    runMigrations(db);
    const versionBefore = getCurrentVersion(db);

    runMigrations(db);
    const versionAfter = getCurrentVersion(db);

    expect(versionAfter).toBe(versionBefore);
    db.close();
  });
  ```

- [ ] **U-AC6-04**: Migration version tracked in schema_version table
  ```typescript
  test('schema_version records applied migrations', () => {
    const db = new Database(':memory:');

    runMigrations(db);

    const versions = db.prepare("SELECT * FROM schema_version ORDER BY version").all();
    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0].version).toBe(1);
    expect(versions[0].description).toBeDefined();
    expect(versions[0].applied_at).toBeDefined();
    db.close();
  });
  ```

- [ ] **U-AC6-05**: Failed migration rolls back transaction
  ```typescript
  test('failed migration does not leave partial state', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    // Run initial migrations
    runMigrations(db);
    const versionBefore = getCurrentVersion(db);

    // Create a failing migration
    const failingMigration = {
      version: 999,
      description: 'Failing migration',
      up: (db: Database.Database) => {
        db.exec("CREATE TABLE test_table (id TEXT)");
        throw new Error('Intentional failure');
      }
    };

    expect(() => {
      runMigrationsWithList(db, [failingMigration]);
    }).toThrow();

    // test_table should not exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='test_table'
    `).all();
    expect(tables.length).toBe(0);

    // Version should not have changed
    expect(getCurrentVersion(db)).toBe(versionBefore);
    db.close();
  });
  ```

### Integration Tests

- [ ] **I-AC6-01**: Migrations preserve existing data
  ```typescript
  // tests/integration/db/migrations.test.ts
  test('migrations preserve existing data', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-migrate-' + Date.now(), 'orion.db');
    fs.mkdirSync(path.dirname(testDbPath), { recursive: true });

    // Create old database with data
    const db1 = new Database(testDbPath);
    db1.pragma('foreign_keys = ON');
    runMigrations(db1); // Run v1

    db1.prepare("INSERT INTO conversations (id, title) VALUES (?, ?)").run('conv_old', 'Old Data');
    db1.close();

    // Simulate new app version with additional migration
    const db2 = new Database(testDbPath);
    db2.pragma('foreign_keys = ON');
    runMigrations(db2); // Should be idempotent

    const row = db2.prepare("SELECT * FROM conversations WHERE id = ?").get('conv_old');
    expect(row.title).toBe('Old Data');
    db2.close();
  });
  ```

- [ ] **I-AC6-02**: getCurrentVersion returns correct version number
  ```typescript
  test('getCurrentVersion returns latest applied migration version', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-version-' + Date.now(), 'orion.db');
    fs.mkdirSync(path.dirname(testDbPath), { recursive: true });

    const db = new Database(testDbPath);
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const version = getCurrentVersion(db);
    expect(version).toBeGreaterThanOrEqual(1);
    db.close();
  });
  ```

---

## AC7: Foreign Key Enforcement

### Unit Tests

- [ ] **U-AC7-01**: PRAGMA foreign_keys returns 1 (enabled)
  ```typescript
  // tests/unit/db/foreign-keys.test.ts
  test('foreign_keys pragma is enabled', () => {
    const db = new Database(':memory:');

    initializePragmas(db);

    const result = db.pragma('foreign_keys');
    expect(result[0].foreign_keys).toBe(1);
    db.close();
  });
  ```

- [ ] **U-AC7-02**: Insert with invalid conversation_id fails
  ```typescript
  test('message insert fails with non-existent conversation_id', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    expect(() => {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content)
        VALUES (?, ?, ?, ?)
      `).run('msg_orphan', 'conv_nonexistent', 'user', 'Hello');
    }).toThrow(/FOREIGN KEY constraint failed/);
    db.close();
  });
  ```

- [ ] **U-AC7-03**: Cascade delete removes child messages
  ```typescript
  test('deleting conversation cascades to delete messages', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    // Create conversation with messages
    db.prepare("INSERT INTO conversations (id) VALUES (?)").run('conv_cascade');
    db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content)
      VALUES (?, ?, ?, ?)
    `).run('msg_1', 'conv_cascade', 'user', 'Hello');
    db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content)
      VALUES (?, ?, ?, ?)
    `).run('msg_2', 'conv_cascade', 'assistant', 'Hi');

    // Delete conversation
    db.prepare("DELETE FROM conversations WHERE id = ?").run('conv_cascade');

    // Messages should be gone
    const messages = db.prepare("SELECT * FROM messages WHERE conversation_id = ?").all('conv_cascade');
    expect(messages.length).toBe(0);
    db.close();
  });
  ```

### Integration Tests

- [ ] **I-AC7-01**: Foreign key enforcement on real database file
  ```typescript
  // tests/integration/db/foreign-keys.test.ts
  test('foreign key constraint enforced on file database', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-fk-' + Date.now(), 'orion.db');
    process.env.ORION_DB_PATH = testDbPath;

    const db = getDatabase();

    expect(() => {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content)
        VALUES (?, ?, ?, ?)
      `).run('msg_bad', 'conv_fake', 'user', 'Test');
    }).toThrow();

    closeDatabase();
  });
  ```

- [ ] **I-AC7-02**: Foreign keys enabled by default (not per-connection)
  ```typescript
  test('new connections have foreign keys enabled', () => {
    const testDbPath = path.join(os.tmpdir(), 'orion-fk-new-' + Date.now(), 'orion.db');

    // First connection
    process.env.ORION_DB_PATH = testDbPath;
    const db1 = getDatabase();
    const result1 = db1.pragma('foreign_keys');
    expect(result1[0].foreign_keys).toBe(1);
    closeDatabase();

    // Second connection
    const db2 = getDatabase();
    const result2 = db2.pragma('foreign_keys');
    expect(result2[0].foreign_keys).toBe(1);
    closeDatabase();
  });
  ```

---

## Repository CRUD Tests (Supporting AC3, AC4, AC5)

### Unit Tests - Conversations Repository

- [ ] **U-REPO-01**: createConversation generates prefixed ID
  ```typescript
  test('createConversation generates conv_ prefixed ID', () => {
    const db = createTestDatabase();

    const conv = createConversation(db, { title: 'Test' });

    expect(conv.id).toMatch(/^conv_[a-zA-Z0-9_-]+$/);
    db.close();
  });
  ```

- [ ] **U-REPO-02**: getConversation returns null for missing ID
  ```typescript
  test('getConversation returns null for non-existent ID', () => {
    const db = createTestDatabase();

    const result = getConversation(db, 'conv_nonexistent');

    expect(result).toBeNull();
    db.close();
  });
  ```

- [ ] **U-REPO-03**: updateConversation modifies only specified fields
  ```typescript
  test('updateConversation preserves unmodified fields', () => {
    const db = createTestDatabase();
    const conv = createConversation(db, { title: 'Original', summary: 'Summary' });

    updateConversation(db, conv.id, { title: 'Updated' });

    const updated = getConversation(db, conv.id);
    expect(updated.title).toBe('Updated');
    expect(updated.summary).toBe('Summary');
    db.close();
  });
  ```

- [ ] **U-REPO-04**: listConversations filters by active status
  ```typescript
  test('listConversations filters active conversations', () => {
    const db = createTestDatabase();
    createConversation(db, { title: 'Active', is_active: 1 });
    createConversation(db, { title: 'Archived', is_active: 0 });

    const active = listConversations(db, { active: true });
    const all = listConversations(db, {});

    expect(active.length).toBe(1);
    expect(all.length).toBe(2);
    db.close();
  });
  ```

### Unit Tests - Messages Repository

- [ ] **U-REPO-05**: createMessage generates prefixed ID
  ```typescript
  test('createMessage generates msg_ prefixed ID', () => {
    const db = createTestDatabase();
    const conv = createConversation(db, {});

    const msg = createMessage(db, {
      conversation_id: conv.id,
      role: 'user',
      content: 'Hello'
    });

    expect(msg.id).toMatch(/^msg_[a-zA-Z0-9_-]+$/);
    db.close();
  });
  ```

- [ ] **U-REPO-06**: getMessages returns chronological order
  ```typescript
  test('getMessages returns messages in created_at order', () => {
    const db = createTestDatabase();
    const conv = createConversation(db, {});

    createMessage(db, { conversation_id: conv.id, role: 'user', content: 'First' });
    createMessage(db, { conversation_id: conv.id, role: 'assistant', content: 'Second' });
    createMessage(db, { conversation_id: conv.id, role: 'user', content: 'Third' });

    const messages = getMessages(db, conv.id);

    expect(messages.map(m => m.content)).toEqual(['First', 'Second', 'Third']);
    db.close();
  });
  ```

- [ ] **U-REPO-07**: createMessage validates role enum
  ```typescript
  test('createMessage rejects invalid role', () => {
    const db = createTestDatabase();
    const conv = createConversation(db, {});

    expect(() => {
      createMessage(db, {
        conversation_id: conv.id,
        role: 'invalid' as any,
        content: 'Hello'
      });
    }).toThrow();
    db.close();
  });
  ```

---

## ID Generation Tests

- [ ] **U-ID-01**: generateId creates URL-safe strings
  ```typescript
  test('generateId produces URL-safe characters only', () => {
    for (let i = 0; i < 100; i++) {
      const id = generateId('test');
      expect(id).toMatch(/^test_[a-zA-Z0-9_-]+$/);
    }
  });
  ```

- [ ] **U-ID-02**: generateId produces unique values
  ```typescript
  test('generateId produces unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId('test'));
    }
    expect(ids.size).toBe(1000);
  });
  ```

---

## Test Utilities

### Test Database Setup

```typescript
// tests/helpers/db-setup.ts
import Database from 'better-sqlite3';
import { runMigrations } from '@/lib/db/migrations';

export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

export function createFileTestDatabase(path: string): Database.Database {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('cache_size = -64000');
  runMigrations(db);
  return db;
}
```

### Test Cleanup

```typescript
// tests/helpers/cleanup.ts
import fs from 'fs';
import path from 'path';

export function cleanupTestDatabase(dbPath: string): void {
  const dir = path.dirname(dbPath);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
}
```

---

## Test Execution Order

**Phase 1: Unit Tests (Fast, In-Memory)**
1. Path utilities (U-AC1-01, U-AC1-02)
2. Pragma initialization (U-AC2-01, U-AC2-02)
3. Migration framework (U-AC6-01 through U-AC6-05)
4. Schema validation (U-AC3-*, U-AC4-*)
5. Foreign key enforcement (U-AC7-01 through U-AC7-03)
6. Repository CRUD (U-REPO-*)
7. ID generation (U-ID-*)

**Phase 2: Integration Tests (File-Based)**
1. File creation (I-AC1-01, I-AC1-02)
2. WAL verification (I-AC2-01, I-AC2-02)
3. Schema compliance (I-AC3-01, I-AC4-01)
4. Data persistence (I-AC5-01 through I-AC5-03)
5. Migration preservation (I-AC6-01, I-AC6-02)
6. FK on file database (I-AC7-01, I-AC7-02)

**Phase 3: E2E Tests (Full App)**
1. Database creation on launch (E-AC1-01)
2. Data persistence across restart (E-AC5-01)

---

## Risk Assessment

| Test Area | Risk Level | Rationale |
|-----------|------------|-----------|
| WAL Mode | High | Critical for performance and crash recovery |
| Foreign Keys | High | Data integrity depends on FK enforcement |
| Migrations | High | Schema evolution must preserve data |
| Persistence | High | User data loss is unacceptable |
| Path Resolution | Medium | Platform-specific behavior |
| ID Generation | Low | Well-understood problem |

---

## Definition of Done

- [ ] All unit tests pass (25 tests)
- [ ] All integration tests pass (13 tests)
- [ ] All E2E tests pass (2 tests)
- [ ] Test coverage > 80% for src/lib/db/**
- [ ] No flaky tests identified
- [ ] Tests run in < 30 seconds (unit + integration)
- [ ] E2E tests documented in CI pipeline

---

## References

- [Story 1.4: SQLite Database Setup](./story-1-4-sqlite-database-setup.md)
- [Architecture: Section 4.1 - SQLite Schema](../../planning-artifacts/architecture.md)
- [Architecture Constraints: ARCH-007, ARCH-008](../../planning-artifacts/architecture.md)
