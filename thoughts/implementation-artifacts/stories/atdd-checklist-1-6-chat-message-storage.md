# ATDD Checklist: Story 1.6 - Chat Message Storage

Story: 1-6-chat-message-storage
Epic: 1
Generated: 2026-01-15
Priority: P0 (data integrity, core user journey)

---

## Test Summary

| Level | Count | Priority Coverage |
|-------|-------|-------------------|
| Unit | 18 | P0: 12, P1: 6 |
| Integration | 10 | P0: 6, P1: 4 |
| E2E | 8 | P0: 4, P1: 4 |
| **Total** | **36** | |

---

## AC1: Message Persistence on Send

**Priority: P0** - Data integrity, core functionality

### Unit Tests

- [ ] **1.6-UNIT-001** `test_createMessage_generates_valid_msg_id` @p0
  - Given: Valid message data with conversation_id, role, content
  - When: createMessage() is called
  - Then: Returns message with id matching pattern `msg_[a-zA-Z0-9_-]+`
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-002** `test_createMessage_stores_all_required_fields` @p0
  - Given: Message data with conversation_id="conv_abc", role="user", content="Hello"
  - When: createMessage() is called
  - Then: Returned message contains all fields: id, conversation_id, role, content, created_at
  - And: created_at is valid ISO8601 timestamp
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-003** `test_createMessage_increments_conversation_message_count` @p0
  - Given: Conversation with message_count=0
  - When: createMessage() is called twice for that conversation
  - Then: Conversation message_count equals 2
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-004** `test_createMessage_updates_conversation_last_message_at` @p0
  - Given: Conversation with last_message_at="2026-01-01T00:00:00Z"
  - When: createMessage() is called at "2026-01-15T10:30:00Z"
  - Then: Conversation last_message_at equals "2026-01-15T10:30:00Z"
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

### Integration Tests

- [ ] **1.6-INT-001** `test_message_foreign_key_constraint` @p0
  - Given: Non-existent conversation_id="conv_nonexistent"
  - When: createMessage() is called with that conversation_id
  - Then: Throws foreign key constraint error
  - Level: Integration | File: `tests/integration/chat/persistence.test.ts`

- [ ] **1.6-INT-002** `test_message_persists_to_database` @p0
  - Given: Valid message data
  - When: createMessage() is called
  - Then: Raw SQL query `SELECT * FROM messages WHERE id=?` returns the message
  - Level: Integration | File: `tests/integration/chat/persistence.test.ts`

---

## AC2: Conversation History Restoration

**Priority: P0** - Core user experience, data persistence

### Unit Tests

- [ ] **1.6-UNIT-005** `test_getMessagesByConversation_returns_messages_in_chronological_order` @p0
  - Given: Conversation with messages created at T1, T2, T3
  - When: getMessagesByConversation() is called
  - Then: Messages returned in order [T1, T2, T3] (oldest first)
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-006** `test_getMessagesByConversation_returns_empty_for_no_messages` @p1
  - Given: Conversation with no messages
  - When: getMessagesByConversation() is called
  - Then: Returns empty array []
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-007** `test_listActiveConversations_returns_most_recent_first` @p0
  - Given: Conversations A (last_message_at: T1), B (T2), C (T3) where T3 > T2 > T1
  - When: listActiveConversations() is called
  - Then: Returns conversations in order [C, B, A]
  - Level: Unit | File: `tests/unit/services/conversationService.test.ts`

### Integration Tests

- [ ] **1.6-INT-003** `test_messages_persist_across_database_restart` @p0
  - Given: Database with conversation and messages
  - When: Database connection closed and reopened
  - Then: Messages are still retrievable with correct content
  - Level: Integration | File: `tests/integration/chat/persistence.test.ts`

- [ ] **1.6-INT-004** `test_conversation_list_excludes_archived` @p1
  - Given: 2 active conversations, 1 archived (is_active=0)
  - When: listActiveConversations() is called
  - Then: Returns only 2 active conversations
  - Level: Integration | File: `tests/integration/chat/persistence.test.ts`

### E2E Tests

- [ ] **1.6-E2E-001** `test_conversation_history_restored_on_app_launch` @p0
  - Given: App previously had conversations with messages
  - When: App is relaunched
  - Then: Conversation list displays previous conversations
  - And: Selecting a conversation shows its messages
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

- [ ] **1.6-E2E-002** `test_messages_display_in_chronological_order` @p0
  - Given: Conversation with messages sent at different times
  - When: Conversation is selected
  - Then: Messages appear from oldest at top to newest at bottom
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

---

## AC3: Conversation Title Generation

**Priority: P1** - User experience enhancement

### Unit Tests

- [ ] **1.6-UNIT-008** `test_generateTitle_extracts_first_sentence` @p1
  - Given: Message "Hello there. How are you?"
  - When: generateTitle() is called
  - Then: Returns "Hello there"
  - Level: Unit | File: `tests/unit/utils/titleGenerator.test.ts`

- [ ] **1.6-UNIT-009** `test_generateTitle_truncates_at_50_chars` @p1
  - Given: Message with first sentence > 50 characters
  - When: generateTitle() is called
  - Then: Returns title truncated to 47 chars + "..."
  - Level: Unit | File: `tests/unit/utils/titleGenerator.test.ts`

- [ ] **1.6-UNIT-010** `test_generateTitle_handles_empty_message` @p1
  - Given: Empty string ""
  - When: generateTitle() is called
  - Then: Returns "New Conversation"
  - Level: Unit | File: `tests/unit/utils/titleGenerator.test.ts`

- [ ] **1.6-UNIT-011** `test_generateTitle_removes_filler_phrases` @p1
  - Given: Message "Hi, can you help me with cooking?"
  - When: generateTitle() is called
  - Then: Returns "Help me with cooking" (removes "Hi, can you")
  - Level: Unit | File: `tests/unit/utils/titleGenerator.test.ts`

### Integration Tests

- [ ] **1.6-INT-005** `test_title_autogenerated_on_first_user_message` @p1
  - Given: New conversation with no title
  - When: First user message "What is the weather today?" is created
  - Then: Conversation title is auto-set to "What is the weather today"
  - Level: Integration | File: `tests/integration/chat/title-generation.test.ts`

- [ ] **1.6-INT-006** `test_title_not_overwritten_on_subsequent_messages` @p1
  - Given: Conversation with existing title "Weather question"
  - When: Second message is created
  - Then: Title remains "Weather question"
  - Level: Integration | File: `tests/integration/chat/title-generation.test.ts`

### E2E Tests

- [ ] **1.6-E2E-003** `test_conversation_title_appears_in_list_after_first_message` @p1
  - Given: New conversation created
  - When: First message "Book a flight to Tokyo" is sent
  - Then: Conversation list shows title derived from message
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

- [ ] **1.6-E2E-004** `test_user_can_manually_override_title` @p1
  - Given: Conversation with auto-generated title
  - When: User edits title to "My Trip Planning"
  - Then: Title updates to "My Trip Planning"
  - And: Title persists after page reload
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

---

## AC4: Conversation Timestamps

**Priority: P1** - User experience, information display

### Unit Tests

- [ ] **1.6-UNIT-012** `test_formatRelativeTime_just_now` @p1
  - Given: Timestamp from 30 seconds ago
  - When: formatRelativeTime() is called
  - Then: Returns "Just now"
  - Level: Unit | File: `tests/unit/utils/date.test.ts`

- [ ] **1.6-UNIT-013** `test_formatRelativeTime_minutes` @p1
  - Given: Timestamp from 15 minutes ago
  - When: formatRelativeTime() is called
  - Then: Returns "15 minutes ago"
  - Level: Unit | File: `tests/unit/utils/date.test.ts`

- [ ] **1.6-UNIT-014** `test_formatRelativeTime_hours` @p1
  - Given: Timestamp from 3 hours ago
  - When: formatRelativeTime() is called
  - Then: Returns "3 hours ago"
  - Level: Unit | File: `tests/unit/utils/date.test.ts`

- [ ] **1.6-UNIT-015** `test_formatRelativeTime_days` @p1
  - Given: Timestamp from 5 days ago
  - When: formatRelativeTime() is called
  - Then: Returns "5 days ago"
  - Level: Unit | File: `tests/unit/utils/date.test.ts`

### E2E Tests

- [ ] **1.6-E2E-005** `test_conversation_list_shows_relative_timestamps` @p1
  - Given: Conversations with various last_message_at times
  - When: Viewing conversation list
  - Then: Each conversation shows relative time (e.g., "2 hours ago")
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

---

## AC5: Message Role Validation

**Priority: P0** - Data integrity, security

### Unit Tests

- [ ] **1.6-UNIT-016** `test_validateRole_accepts_valid_roles` @p0
  - Given: Roles ["user", "assistant", "system"]
  - When: validateRole() is called for each
  - Then: Returns true for all
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-017** `test_validateRole_rejects_invalid_roles` @p0
  - Given: Invalid roles ["admin", "USER", "", "moderator"]
  - When: validateRole() is called for each
  - Then: Returns false for all
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-018** `test_createMessage_throws_on_invalid_role` @p0
  - Given: Message data with role="invalid"
  - When: createMessage() is called
  - Then: Throws Error containing "Invalid role"
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

### Integration Tests

- [ ] **1.6-INT-007** `test_database_check_constraint_rejects_invalid_role` @p0
  - Given: Raw SQL INSERT with role="hacker"
  - When: SQL is executed
  - Then: Database returns CHECK constraint violation
  - Level: Integration | File: `tests/integration/chat/persistence.test.ts`

---

## AC6: Performance - Message Loading

**Priority: P0** - NFR-P001, user experience

### Integration Tests

- [ ] **1.6-INT-008** `test_100_messages_load_under_500ms` @p0
  - Given: Conversation with exactly 100 messages
  - When: getMessagesByConversation() is called
  - Then: Returns all 100 messages in < 500ms
  - Level: Integration | File: `tests/integration/chat/performance.test.ts`

- [ ] **1.6-INT-009** `test_pagination_maintains_performance` @p1
  - Given: Conversation with 1000 messages
  - When: getMessagesByConversation() called with limit=100, offset=500
  - Then: Returns 100 messages in < 200ms
  - Level: Integration | File: `tests/integration/chat/performance.test.ts`

### E2E Tests

- [ ] **1.6-E2E-006** `test_large_conversation_loads_responsively` @p0
  - Given: Conversation with 100+ messages (seeded via test fixture)
  - When: Conversation is selected
  - Then: Messages appear within 500ms
  - And: UI remains responsive (no freeze)
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

---

## AC7: Tool Call Storage

**Priority: P1** - Feature completeness, AI integration

### Unit Tests

- [ ] **1.6-UNIT-019** `test_createMessage_stores_tool_calls_as_json` @p0
  - Given: Message with tool_calls=[{name: "search", args: {query: "test"}}]
  - When: createMessage() is called
  - Then: Message tool_calls field deserializes to original array
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-020** `test_createMessage_stores_tool_results_as_json` @p0
  - Given: Message with tool_results=[{result: "success", data: {...}}]
  - When: createMessage() is called
  - Then: Message tool_results field deserializes to original array
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

- [ ] **1.6-UNIT-021** `test_createMessage_handles_null_tool_fields` @p1
  - Given: Message without tool_calls or tool_results
  - When: createMessage() is called
  - Then: Message tool_calls and tool_results are null
  - Level: Unit | File: `tests/unit/services/messageService.test.ts`

### Integration Tests

- [ ] **1.6-INT-010** `test_tool_calls_json_roundtrip` @p1
  - Given: Complex nested tool_calls JSON structure
  - When: Saved and retrieved from database
  - Then: JSON structure is identical after deserialization
  - Level: Integration | File: `tests/integration/chat/persistence.test.ts`

---

## AC8: Conversation List Display

**Priority: P1** - User experience, navigation

### E2E Tests

- [ ] **1.6-E2E-007** `test_conversation_list_sorted_by_last_message` @p1
  - Given: Multiple conversations with different last_message_at
  - When: Viewing conversation list
  - Then: Most recently active conversation appears first
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

- [ ] **1.6-E2E-008** `test_conversation_list_shows_metadata` @p1
  - Given: Conversation with title, messages, and last activity
  - When: Viewing conversation list
  - Then: Each item shows title, message count indicator, and relative time
  - Level: E2E | File: `tests/e2e/chat-storage.spec.ts`

---

## Test Execution Plan

### Smoke (CI - Every Commit)
```bash
# P0 tests only - ~2-5 min
npm run test:unit -- --grep @p0
npm run test:integration -- --grep @p0
```

### Full Regression (CI - PR/Merge)
```bash
# All priority levels - ~10-15 min
npm run test:unit
npm run test:integration
npx playwright test tests/e2e/chat-storage.spec.ts
```

### Performance Validation
```bash
# Performance-specific tests
npm run test:integration -- --grep "performance"
```

---

## Test Data Requirements

### Fixtures Needed

1. **Test Database** - In-memory SQLite for unit/integration
2. **Seeded Conversations** - For E2E tests:
   - Empty conversation
   - Conversation with 5 messages
   - Conversation with 100+ messages (performance)
   - Archived conversation

### Factory Functions

```typescript
// tests/fixtures/factories.ts
export const createTestConversation = (overrides?: Partial<Conversation>) => ({
  id: generateConversationId(),
  title: 'Test Conversation',
  message_count: 0,
  is_active: 1,
  started_at: new Date().toISOString(),
  last_message_at: new Date().toISOString(),
  ...overrides,
});

export const createTestMessage = (overrides?: Partial<Message>) => ({
  id: generateMessageId(),
  role: 'user' as const,
  content: 'Test message',
  created_at: new Date().toISOString(),
  ...overrides,
});
```

---

## Dependencies

### Story Dependencies
- **Story 1.4** (SQLite Database Setup) - MUST be complete (provides schema)
- **Story 1.2** (Next.js Frontend) - MUST be complete (provides React infrastructure)

### Test Infrastructure
- Vitest configured with in-memory SQLite support
- Playwright configured for Tauri app testing
- Test factories and utilities available

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance degradation with many messages | Medium | High | Index verification, pagination tests |
| JSON serialization edge cases | Low | Medium | Roundtrip tests with complex structures |
| Role validation bypass | Low | High | Database CHECK constraint + app validation |
| Timestamp timezone issues | Medium | Low | UTC storage, local display tests |

---

## Notes for Implementer

1. **Run tests first** - This is ATDD. Tests should fail initially.
2. **Unit before integration** - Fix unit test failures before integration.
3. **Performance baseline** - Establish 100-message load time before optimization.
4. **JSON edge cases** - Test with nested objects, arrays, special characters.
5. **Timezone handling** - All storage in UTC, display in local time.

---

## References

- [Story: thoughts/implementation-artifacts/stories/story-1-6-chat-message-storage.md]
- [Architecture: thoughts/planning-artifacts/architecture.md#4.1]
- [NFR: thoughts/planning-artifacts/prd.md#NFR-P001]
