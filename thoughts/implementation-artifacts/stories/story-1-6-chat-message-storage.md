# Story 1.6: Chat Message Storage

Status: ready-for-dev

---

## Story

As a user,
I want my conversations saved locally,
So that I can continue where I left off and search past chats.

---

## Acceptance Criteria

1. **AC1: Message Persistence on Send**
   - **Given** I send a message to Orion
   - **When** the message is submitted
   - **Then** it is persisted to the `messages` table with:
     - `id` (msg_xxx format)
     - `conversation_id` (references active conversation)
     - `role` (user | assistant | system)
     - `content` (the message text)
     - `created_at` (timestamp)
   - **And** the message belongs to a conversation record
   - **And** the conversation's `message_count` is incremented
   - **And** the conversation's `last_message_at` is updated

2. **AC2: Conversation History Restoration**
   - **Given** I have past conversations
   - **When** I relaunch the app
   - **Then** my conversation history is restored from SQLite
   - **And** messages appear in correct chronological order (oldest first)
   - **And** the most recent conversation is displayed by default

3. **AC3: Conversation Title Generation**
   - **Given** a new conversation is created
   - **When** the first user message is sent
   - **Then** the conversation auto-generates a title from the first message
   - **And** the title is truncated to 50 characters if longer
   - **And** users can manually override the title later

4. **AC4: Conversation Timestamps**
   - **Given** a conversation exists
   - **When** I view it
   - **Then** I can see when it was started (`started_at`)
   - **And** I can see when it was last updated (`last_message_at`)
   - **And** timestamps are displayed in relative format ("2 hours ago")

5. **AC5: Message Role Validation**
   - **Given** a message is created
   - **When** the role is set
   - **Then** only valid roles are accepted: `user`, `assistant`, `system`
   - **And** invalid roles are rejected with a validation error

6. **AC6: Performance - Message Loading**
   - **Given** a conversation exists with 100+ messages
   - **When** I open the conversation
   - **Then** all messages load in under 500ms (NFR-P001)
   - **And** the UI remains responsive during loading

7. **AC7: Tool Call Storage**
   - **Given** the assistant uses tools during a response
   - **When** the message is saved
   - **Then** `tool_calls` field stores the tool invocations as JSON array
   - **And** `tool_results` field stores the tool outputs as JSON array

8. **AC8: Conversation List View**
   - **Given** I have multiple conversations
   - **When** I view the conversation list
   - **Then** active conversations are listed first (is_active = 1)
   - **And** conversations are sorted by `last_message_at` descending
   - **And** archived conversations are hidden from the main list

---

## Tasks / Subtasks

- [ ] **Task 1: Message Service Layer** (AC: 1, 5, 7)
  - [ ] 1.1 Create `src/lib/db/services/messageService.ts`:
    ```typescript
    // src/lib/db/services/messageService.ts
    import { getDatabase } from '../index';
    import { generateMessageId, generateConversationId } from '../ids';
    import type { Message, Conversation, MessageRole } from '../types';

    const VALID_ROLES: MessageRole[] = ['user', 'assistant', 'system'];

    export function validateRole(role: string): role is MessageRole {
      return VALID_ROLES.includes(role as MessageRole);
    }

    export function createMessage(data: {
      conversation_id: string;
      role: MessageRole;
      content: string;
      tool_calls?: unknown[];
      tool_results?: unknown[];
      input_tokens?: number;
      output_tokens?: number;
    }): Message {
      if (!validateRole(data.role)) {
        throw new Error(`Invalid role: ${data.role}. Must be one of: ${VALID_ROLES.join(', ')}`);
      }

      const db = getDatabase();
      const id = generateMessageId();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO messages (
          id, conversation_id, role, content,
          tool_calls, tool_results, input_tokens, output_tokens, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.conversation_id,
        data.role,
        data.content,
        data.tool_calls ? JSON.stringify(data.tool_calls) : null,
        data.tool_results ? JSON.stringify(data.tool_results) : null,
        data.input_tokens ?? null,
        data.output_tokens ?? null,
        now
      );

      // Update conversation stats
      updateConversationStats(data.conversation_id, now);

      return getMessage(id)!;
    }
    ```
  - [ ] 1.2 Implement role validation with CHECK constraint in database
  - [ ] 1.3 Add JSON serialization/deserialization for `tool_calls` and `tool_results`
  - [ ] 1.4 Update conversation stats on message creation

- [ ] **Task 2: Conversation Service Layer** (AC: 2, 3, 4, 8)
  - [ ] 2.1 Create `src/lib/db/services/conversationService.ts`:
    ```typescript
    // src/lib/db/services/conversationService.ts
    import { getDatabase } from '../index';
    import { generateConversationId } from '../ids';
    import type { Conversation } from '../types';

    const TITLE_MAX_LENGTH = 50;

    export function createConversation(data?: {
      title?: string;
      project_id?: string;
      area_id?: string;
    }): Conversation {
      const db = getDatabase();
      const id = generateConversationId();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO conversations (
          id, title, project_id, area_id, started_at, last_message_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data?.title ?? null,
        data?.project_id ?? null,
        data?.area_id ?? null,
        now,
        now
      );

      return getConversation(id)!;
    }

    export function generateTitle(firstMessage: string): string {
      // Take first sentence or truncate
      let title = firstMessage.split(/[.!?]/)[0].trim();
      if (title.length > TITLE_MAX_LENGTH) {
        title = title.substring(0, TITLE_MAX_LENGTH - 3) + '...';
      }
      return title || 'New Conversation';
    }

    export function updateConversationStats(
      conversationId: string,
      lastMessageAt: string
    ): void {
      const db = getDatabase();
      const stmt = db.prepare(`
        UPDATE conversations
        SET message_count = message_count + 1,
            last_message_at = ?
        WHERE id = ?
      `);
      stmt.run(lastMessageAt, conversationId);
    }

    export function listActiveConversations(): Conversation[] {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM conversations
        WHERE is_active = 1
        ORDER BY last_message_at DESC
      `);
      return stmt.all() as Conversation[];
    }
    ```
  - [ ] 2.2 Implement title auto-generation from first user message
  - [ ] 2.3 Create listing function with sorting by `last_message_at`
  - [ ] 2.4 Add helper for relative timestamp formatting

- [ ] **Task 3: Message Retrieval with Performance** (AC: 2, 6)
  - [ ] 3.1 Create optimized message loading query:
    ```typescript
    // In messageService.ts
    export function getMessagesByConversation(
      conversationId: string,
      options?: { limit?: number; offset?: number }
    ): Message[] {
      const db = getDatabase();
      const limit = options?.limit ?? 1000;
      const offset = options?.offset ?? 0;

      const stmt = db.prepare(`
        SELECT * FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(conversationId, limit, offset);
      return rows.map(parseMessageRow);
    }

    function parseMessageRow(row: any): Message {
      return {
        ...row,
        tool_calls: row.tool_calls ? JSON.parse(row.tool_calls) : null,
        tool_results: row.tool_results ? JSON.parse(row.tool_results) : null,
      };
    }
    ```
  - [ ] 3.2 Ensure index exists on `messages(conversation_id, created_at)`
  - [ ] 3.3 Add pagination support for large conversations
  - [ ] 3.4 Measure query performance (target: <500ms for 100 messages)

- [ ] **Task 4: Tauri IPC Commands** (AC: 1, 2, 4)
  - [ ] 4.1 Create Tauri commands for conversation operations:
    ```typescript
    // src/lib/tauri/commands/chat.ts
    import { invoke } from '@tauri-apps/api/core';
    import type { Message, Conversation } from '@/lib/db/types';

    export const chatCommands = {
      // Conversations
      createConversation: (data?: { title?: string }) =>
        invoke<Conversation>('create_conversation', { data }),

      getConversation: (id: string) =>
        invoke<Conversation | null>('get_conversation', { id }),

      listConversations: () =>
        invoke<Conversation[]>('list_conversations'),

      updateConversationTitle: (id: string, title: string) =>
        invoke<void>('update_conversation_title', { id, title }),

      // Messages
      sendMessage: (conversationId: string, content: string) =>
        invoke<Message>('send_message', { conversationId, content }),

      getMessages: (conversationId: string) =>
        invoke<Message[]>('get_messages', { conversationId }),

      saveAssistantMessage: (data: {
        conversationId: string;
        content: string;
        toolCalls?: unknown[];
        toolResults?: unknown[];
        inputTokens?: number;
        outputTokens?: number;
      }) => invoke<Message>('save_assistant_message', data),
    };
    ```
  - [ ] 4.2 Implement corresponding Rust commands in `src-tauri/src/commands/chat.rs`
  - [ ] 4.3 Register commands in Tauri plugin system
  - [ ] 4.4 Add error handling for IPC failures

- [ ] **Task 5: React Chat State Management** (AC: 2, 4, 8)
  - [ ] 5.1 Create chat store using Zustand:
    ```typescript
    // src/stores/chatStore.ts
    import { create } from 'zustand';
    import { immer } from 'zustand/middleware/immer';
    import { chatCommands } from '@/lib/tauri/commands/chat';
    import type { Message, Conversation } from '@/lib/db/types';

    interface ChatState {
      // State
      conversations: Conversation[];
      activeConversationId: string | null;
      messages: Message[];
      isLoading: boolean;
      error: string | null;

      // Actions
      loadConversations: () => Promise<void>;
      selectConversation: (id: string) => Promise<void>;
      createNewConversation: () => Promise<Conversation>;
      sendUserMessage: (content: string) => Promise<Message>;
      appendAssistantMessage: (message: Partial<Message>) => void;
      updateConversationTitle: (id: string, title: string) => Promise<void>;
    }

    export const useChatStore = create<ChatState>()(
      immer((set, get) => ({
        conversations: [],
        activeConversationId: null,
        messages: [],
        isLoading: false,
        error: null,

        loadConversations: async () => {
          try {
            const conversations = await chatCommands.listConversations();
            set((state) => {
              state.conversations = conversations;
              if (conversations.length > 0 && !state.activeConversationId) {
                state.activeConversationId = conversations[0].id;
              }
            });
          } catch (error) {
            set((state) => { state.error = String(error); });
          }
        },

        selectConversation: async (id: string) => {
          set((state) => { state.isLoading = true; });
          try {
            const messages = await chatCommands.getMessages(id);
            set((state) => {
              state.activeConversationId = id;
              state.messages = messages;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = String(error);
              state.isLoading = false;
            });
          }
        },

        // ... additional actions
      }))
    );
    ```
  - [ ] 5.2 Implement conversation list loading on app start
  - [ ] 5.3 Handle conversation switching with message reloading
  - [ ] 5.4 Add optimistic updates for sent messages

- [ ] **Task 6: Conversation List UI Component** (AC: 4, 8)
  - [ ] 6.1 Create `src/components/chat/ConversationList.tsx`:
    ```typescript
    // src/components/chat/ConversationList.tsx
    import { useChatStore } from '@/stores/chatStore';
    import { formatRelativeTime } from '@/lib/utils/date';

    export function ConversationList() {
      const {
        conversations,
        activeConversationId,
        selectConversation,
        createNewConversation
      } = useChatStore();

      return (
        <div className="flex flex-col h-full">
          <button
            onClick={createNewConversation}
            className="btn-gold-slide m-4"
          >
            New Conversation
          </button>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`
                  p-4 cursor-pointer border-b border-orion-fg/10
                  ${conv.id === activeConversationId ? 'bg-orion-primary/10' : ''}
                  hover:bg-orion-fg/5
                `}
              >
                <h3 className="font-medium truncate">
                  {conv.title || 'New Conversation'}
                </h3>
                <p className="text-xs text-orion-fg/50 mt-1">
                  {formatRelativeTime(conv.last_message_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    ```
  - [ ] 6.2 Implement relative time formatting utility
  - [ ] 6.3 Add conversation selection highlighting
  - [ ] 6.4 Style using Orion Design System tokens

- [ ] **Task 7: Message History Component** (AC: 2, 6)
  - [ ] 7.1 Create `src/components/chat/MessageHistory.tsx`:
    ```typescript
    // src/components/chat/MessageHistory.tsx
    import { useEffect, useRef } from 'react';
    import { useChatStore } from '@/stores/chatStore';
    import { MessageBubble } from './MessageBubble';

    export function MessageHistory() {
      const { messages, isLoading } = useChatStore();
      const endRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

      if (isLoading) {
        return <div className="flex-1 flex items-center justify-center">
          <span className="text-orion-fg/50">Loading...</span>
        </div>;
      }

      return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={endRef} />
        </div>
      );
    }
    ```
  - [ ] 7.2 Create `MessageBubble` component with role-based styling
  - [ ] 7.3 Implement auto-scroll to latest message
  - [ ] 7.4 Add loading state handling

- [ ] **Task 8: Title Auto-Generation** (AC: 3)
  - [ ] 8.1 Implement title generation logic:
    ```typescript
    // src/lib/utils/titleGenerator.ts
    const MAX_TITLE_LENGTH = 50;

    export function generateConversationTitle(firstMessage: string): string {
      if (!firstMessage || firstMessage.trim().length === 0) {
        return 'New Conversation';
      }

      // Take first sentence
      let title = firstMessage.split(/[.!?]/)[0].trim();

      // Remove common filler phrases
      const fillerPhrases = [
        /^(hi|hey|hello|can you|please|could you|i want to|i need to)/i,
      ];
      for (const phrase of fillerPhrases) {
        title = title.replace(phrase, '').trim();
      }

      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);

      // Truncate if too long
      if (title.length > MAX_TITLE_LENGTH) {
        title = title.substring(0, MAX_TITLE_LENGTH - 3) + '...';
      }

      return title || 'New Conversation';
    }
    ```
  - [ ] 8.2 Trigger title generation on first user message
  - [ ] 8.3 Allow manual title override
  - [ ] 8.4 Test with various message formats

- [ ] **Task 9: Integration with Existing Database** (AC: 1, 2, 5)
  - [ ] 9.1 Verify database tables from Story 1.4 exist and are correct
  - [ ] 9.2 Add any missing CHECK constraints for role validation:
    ```sql
    -- Ensure role constraint exists (from Story 1.4)
    -- Already in migration: CHECK (role IN ('user', 'assistant', 'system'))
    ```
  - [ ] 9.3 Verify foreign key relationships work correctly
  - [ ] 9.4 Test cascade delete (messages deleted when conversation deleted)

- [ ] **Task 10: Date Formatting Utility** (AC: 4)
  - [ ] 10.1 Create `src/lib/utils/date.ts`:
    ```typescript
    // src/lib/utils/date.ts
    export function formatRelativeTime(dateString: string | null): string {
      if (!dateString) return 'Never';

      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString();
    }

    export function formatTimestamp(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    ```
  - [ ] 10.2 Add unit tests for all time ranges
  - [ ] 10.3 Handle edge cases (invalid dates, future dates)

- [ ] **Task 11: Unit Tests** (AC: 1, 2, 3, 5, 7)
  - [ ] 11.1 Test message creation with valid roles:
    ```typescript
    // tests/unit/services/messageService.test.ts
    import { describe, test, expect, beforeEach, afterEach } from 'vitest';
    import Database from 'better-sqlite3';
    import { runMigrations } from '@/lib/db/migrations';
    import { createMessage, validateRole } from '@/lib/db/services/messageService';
    import { createConversation } from '@/lib/db/services/conversationService';

    describe('Message Service', () => {
      let db: Database.Database;
      let conversationId: string;

      beforeEach(() => {
        db = new Database(':memory:');
        db.pragma('foreign_keys = ON');
        runMigrations(db);
        const conv = createConversation({});
        conversationId = conv.id;
      });

      afterEach(() => {
        db.close();
      });

      test('createMessage generates valid msg_ ID', () => {
        const msg = createMessage({
          conversation_id: conversationId,
          role: 'user',
          content: 'Hello',
        });
        expect(msg.id).toMatch(/^msg_[a-zA-Z0-9_-]+$/);
      });

      test('createMessage increments conversation message_count', () => {
        createMessage({
          conversation_id: conversationId,
          role: 'user',
          content: 'First',
        });
        createMessage({
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Second',
        });

        const conv = getConversation(conversationId);
        expect(conv?.message_count).toBe(2);
      });

      test('validateRole accepts valid roles', () => {
        expect(validateRole('user')).toBe(true);
        expect(validateRole('assistant')).toBe(true);
        expect(validateRole('system')).toBe(true);
      });

      test('validateRole rejects invalid roles', () => {
        expect(validateRole('admin')).toBe(false);
        expect(validateRole('')).toBe(false);
        expect(validateRole('USER')).toBe(false);
      });

      test('createMessage rejects invalid role', () => {
        expect(() => createMessage({
          conversation_id: conversationId,
          role: 'invalid' as any,
          content: 'Hello',
        })).toThrow('Invalid role');
      });

      test('createMessage stores tool_calls as JSON', () => {
        const toolCalls = [{ name: 'search', args: { query: 'test' } }];
        const msg = createMessage({
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Result',
          tool_calls: toolCalls,
        });

        expect(msg.tool_calls).toEqual(toolCalls);
      });
    });
    ```
  - [ ] 11.2 Test conversation title generation
  - [ ] 11.3 Test message retrieval ordering
  - [ ] 11.4 Test conversation stats updates

- [ ] **Task 12: Integration Tests** (AC: 2, 6)
  - [ ] 12.1 Test full message persistence flow:
    ```typescript
    // tests/integration/chat/persistence.test.ts
    import { describe, test, expect, beforeEach, afterEach } from 'vitest';
    import Database from 'better-sqlite3';
    import path from 'path';
    import os from 'os';
    import fs from 'fs';

    describe('Chat Persistence', () => {
      const testDbPath = path.join(os.tmpdir(), 'orion-chat-test', 'orion.db');

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

      test('messages persist across database restarts', () => {
        // First session
        let db1 = new Database(testDbPath);
        db1.pragma('foreign_keys = ON');
        runMigrations(db1);

        const conv = createConversation({});
        createMessage({
          conversation_id: conv.id,
          role: 'user',
          content: 'Test message',
        });
        db1.close();

        // Second session
        let db2 = new Database(testDbPath);
        db2.pragma('foreign_keys = ON');

        const messages = db2.prepare(
          'SELECT * FROM messages'
        ).all();

        expect(messages).toHaveLength(1);
        expect((messages[0] as any).content).toBe('Test message');

        db2.close();
      });

      test('100 messages load in under 500ms', () => {
        const db = new Database(testDbPath);
        db.pragma('foreign_keys = ON');
        runMigrations(db);

        const conv = createConversation({});

        // Create 100 messages
        for (let i = 0; i < 100; i++) {
          createMessage({
            conversation_id: conv.id,
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: `Message ${i}`,
          });
        }

        // Measure load time
        const start = performance.now();
        const messages = getMessagesByConversation(conv.id);
        const elapsed = performance.now() - start;

        expect(messages).toHaveLength(100);
        expect(elapsed).toBeLessThan(500);

        db.close();
      });
    });
    ```
  - [ ] 12.2 Test conversation list ordering
  - [ ] 12.3 Test message chronological ordering

- [ ] **Task 13: E2E Tests** (AC: 2, 6)
  - [ ] 13.1 Create Playwright test for message persistence:
    ```typescript
    // tests/e2e/chat-storage.spec.ts
    import { test, expect } from '@playwright/test';

    test.describe('Chat Message Storage', () => {
      test('message persists after app restart', async ({ page }) => {
        // Send a message
        await page.fill('[data-testid="chat-input"]', 'Hello Orion');
        await page.click('[data-testid="send-button"]');

        // Wait for message to appear
        await expect(page.locator('.chat-user')).toContainText('Hello Orion');

        // Restart app (close and reopen)
        await page.close();
        // ... relaunch app logic

        // Verify message persisted
        await expect(page.locator('.chat-user')).toContainText('Hello Orion');
      });

      test('100 messages load quickly', async ({ page }) => {
        // Navigate to a conversation with many messages
        // (requires test fixture setup)

        const startTime = Date.now();
        await page.waitForSelector('.message-bubble', { state: 'attached' });
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(500);
      });

      test('conversation title auto-generates from first message', async ({ page }) => {
        // Create new conversation
        await page.click('[data-testid="new-conversation"]');

        // Send first message
        await page.fill('[data-testid="chat-input"]', 'What is the weather today?');
        await page.click('[data-testid="send-button"]');

        // Check title was generated
        await expect(page.locator('.conversation-title')).toContainText('Weather today');
      });
    });
    ```
  - [ ] 13.2 Test conversation switching
  - [ ] 13.3 Test title generation edge cases

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Database Location | `~/Library/Application Support/Orion/orion.db` | ARCH-007 |
| Message ID Format | `msg_xxx` | architecture.md#4.2 |
| Conversation ID Format | `conv_xxx` | architecture.md#4.2 |
| Valid Roles | user, assistant, system | architecture.md#4.1 |
| Message Latency | <500ms for 100 messages | NFR-P001 |
| Local-First | All data stays on device | NFR-S001 |

### Schema Reference (from architecture.md)

**Messages Table:**
```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,                     -- msg_xxx format
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,                      -- user | assistant | system
    content TEXT NOT NULL,
    tool_calls TEXT,                         -- JSON array
    tool_results TEXT,                       -- JSON array
    input_tokens INTEGER,
    output_tokens INTEGER,
    feedback TEXT,                           -- thumbs_up | thumbs_down
    feedback_note TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

**Conversations Table:**
```sql
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,                     -- conv_xxx format
    sdk_session_id TEXT,
    title TEXT,
    summary TEXT,
    project_id TEXT REFERENCES projects(id),
    area_id TEXT REFERENCES areas(id),
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

CREATE INDEX idx_conversations_active ON conversations(is_active, last_message_at DESC);
```

### Directory Structure for This Story

```
src/
├── lib/
│   ├── db/
│   │   ├── services/
│   │   │   ├── messageService.ts     # CREATE: Message CRUD operations
│   │   │   └── conversationService.ts # CREATE: Conversation CRUD operations
│   │   └── ...                       # Existing from Story 1.4
│   ├── tauri/
│   │   └── commands/
│   │       └── chat.ts               # CREATE: Tauri IPC commands
│   └── utils/
│       ├── date.ts                   # CREATE: Date formatting utilities
│       └── titleGenerator.ts         # CREATE: Conversation title generator
├── stores/
│   └── chatStore.ts                  # CREATE: Chat state management
└── components/
    └── chat/
        ├── ConversationList.tsx      # CREATE: Conversation sidebar
        ├── MessageHistory.tsx        # CREATE: Message list component
        └── MessageBubble.tsx         # CREATE: Individual message component

src-tauri/src/
└── commands/
    └── chat.rs                       # CREATE: Rust commands for chat

tests/
├── unit/
│   └── services/
│       ├── messageService.test.ts    # CREATE: Message service tests
│       └── conversationService.test.ts # CREATE: Conversation service tests
├── integration/
│   └── chat/
│       └── persistence.test.ts       # CREATE: Persistence tests
└── e2e/
    └── chat-storage.spec.ts          # CREATE: E2E tests
```

### Dependencies

**Already Installed (from Story 1.4):**
- `better-sqlite3` - SQLite bindings
- `@types/better-sqlite3` - TypeScript types

**Already Installed (from Story 1.2/1.3):**
- `zustand` - State management
- `zustand/middleware/immer` - Immutable updates

**No new dependencies required.**

### Project Structure Notes

- **Dependency:** Story 1.4 (SQLite Database Setup) MUST be complete - provides database tables
- **Dependency:** Story 1.2 (Next.js Frontend) MUST be complete - provides React infrastructure
- **Parallel:** Can run alongside Story 1.5 (Agent Server Process)
- **Enables:** Story 1.7 (Claude Integration) - will use message storage for conversation context
- **Enables:** Story 1.8 (Streaming Responses) - will save streamed assistant messages

### Technical Notes

1. **ID Generation**
   - Use `crypto.randomBytes(8).toString('base64url').slice(0, 11)` for IDs
   - Prefix: `msg_` for messages, `conv_` for conversations
   - Ensures URL-safe, unique identifiers

2. **JSON Field Handling**
   - `tool_calls` and `tool_results` stored as JSON strings
   - Parse on read, stringify on write
   - Handle null values gracefully

3. **Conversation Stats Updates**
   - Increment `message_count` atomically on each message insert
   - Update `last_message_at` to current timestamp
   - Use SQLite's built-in datetime function

4. **Performance Considerations**
   - Index on `(conversation_id, created_at)` for chronological queries
   - Index on `(is_active, last_message_at DESC)` for conversation list
   - Prepared statements for repeated queries
   - Pagination support for very long conversations (>1000 messages)

5. **Error Handling**
   - Validate role before insert (throw on invalid)
   - Handle foreign key violations gracefully
   - Log database errors with context

### Learnings from Previous Stories

From Story 1.4 (SQLite Database Setup):
- Schema already includes conversations and messages tables
- WAL mode enabled for concurrent reads
- Foreign key constraints enforced
- ID generation utilities available in `src/lib/db/ids.ts`

From Story 1.5 (Agent Server Process):
- Agent Server will handle Claude API calls
- Messages need to be accessible from both frontend and agent server
- Consider IPC patterns established for communication

### Testing Standards

| Test Type | Framework | Location |
|-----------|-----------|----------|
| Unit | Vitest | `tests/unit/services/*.test.ts` |
| Integration | Vitest | `tests/integration/chat/*.test.ts` |
| E2E | Playwright | `tests/e2e/chat-storage.spec.ts` |

### Performance Benchmarks

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Load 100 messages | <500ms | `performance.now()` |
| Insert message | <50ms | Database timing |
| List conversations | <100ms | Query timing |
| Title generation | <10ms | Sync operation |

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#4.1 SQLite Schema - messages and conversations tables]
- [Source: thoughts/planning-artifacts/architecture.md#4.2 TypeScript Types for Database Entities]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.6: Chat Message Storage]
- [Source: thoughts/planning-artifacts/prd.md#5.1.1 Chat Interface - FR-CH002]
- [Source: thoughts/planning-artifacts/prd.md#6.3 Database Architecture]
- [Source: thoughts/planning-artifacts/prd.md#NFR-P001 Message latency requirements]
- [Source: thoughts/implementation-artifacts/stories/story-1-4-sqlite-database-setup.md] (database foundation)
- [Source: thoughts/implementation-artifacts/stories/story-1-5-agent-server-process.md] (parallel story)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive message storage implementation | SM Agent (Bob) |

### File List

(To be filled during implementation - track all files created/modified)
