# ATDD Checklist: Story 1.7 - Claude Integration

**Story ID:** 1-7-claude-integration
**Epic:** 1 - MVP Foundation
**Generated:** 2026-01-15
**Status:** ready-for-dev

---

## Overview

This ATDD checklist defines comprehensive test scenarios for the Claude API integration in Orion. Tests cover the full message round-trip, conversation context, error handling, API key validation, and token tracking.

---

## AC1: Basic Message Round-Trip

### Unit Tests

- [ ] **AC1-U01**: ClaudeClient.sendMessage() builds correct API request structure
  - **Given**: A ClaudeClient instance with valid API key
  - **When**: sendMessage("Hello") is called
  - **Then**: Request contains model, max_tokens, and messages array with user message

- [ ] **AC1-U02**: ClaudeClient extracts text content from ContentBlock array
  - **Given**: API response with multiple text blocks
  - **When**: extractTextContent() processes the response
  - **Then**: All text blocks are concatenated with newlines

- [ ] **AC1-U03**: Token counts are extracted from API response
  - **Given**: API response with usage.input_tokens and usage.output_tokens
  - **When**: sendMessage() returns ClaudeResponse
  - **Then**: inputTokens and outputTokens match response values

- [ ] **AC1-U04**: chatService.sendMessage() constructs correct request body
  - **Given**: Valid conversation ID, content, and history
  - **When**: sendMessage() is called
  - **Then**: Request body contains message, conversationId, and history

### Integration Tests

- [ ] **AC1-I01**: Full message round-trip via Agent Server
  - **Given**: Agent Server running with valid ANTHROPIC_API_KEY
  - **When**: POST /api/chat/message with { message: "What is 2+2?" }
  - **Then**: Response contains content with "4" mentioned
  - **And**: inputTokens > 0 and outputTokens > 0

- [ ] **AC1-I02**: User and assistant messages persisted to database
  - **Given**: Active conversation and valid API key
  - **When**: Message sent and response received
  - **Then**: Database contains user message with role='user'
  - **And**: Database contains assistant message with role='assistant'
  - **And**: Both messages have same conversation_id

- [ ] **AC1-I03**: Conversation stats updated after exchange
  - **Given**: Conversation with message_count=5
  - **When**: Message round-trip completes
  - **Then**: Conversation.message_count=7 (user + assistant)
  - **And**: Conversation.last_message_at is updated

### E2E Tests

- [ ] **AC1-E01**: User can send message and see response in UI
  - **Given**: App loaded with API key configured
  - **When**: User types "Hello Orion" in chat input and clicks Send
  - **Then**: User message appears in chat with role indicator
  - **And**: Loading indicator shows while waiting
  - **And**: Assistant response appears within 30 seconds
  - **And**: Response contains relevant content

- [ ] **AC1-E02**: Messages persist after page reload
  - **Given**: Conversation with sent messages
  - **When**: Page is reloaded
  - **Then**: Previous messages are displayed
  - **And**: User and assistant messages maintain correct order

---

## AC2: Conversation Context Maintained

### Unit Tests

- [ ] **AC2-U01**: Message history formatted correctly for API
  - **Given**: Array of ConversationMessage objects
  - **When**: sendMessage() builds API request
  - **Then**: history array maps to { role, content } format
  - **And**: Excludes system messages from history

- [ ] **AC2-U02**: History limited to last 20 messages
  - **Given**: Conversation with 50 messages
  - **When**: chatStore.sendMessage() builds history
  - **Then**: Only last 20 messages included in API call

- [ ] **AC2-U03**: System prompt included in API request
  - **Given**: ClaudeClient with system prompt
  - **When**: sendMessage() called
  - **Then**: API request includes system parameter

### Integration Tests

- [ ] **AC2-I01**: Claude responds with context awareness
  - **Given**: History with "My name is Alice"
  - **When**: "What is my name?" sent to /api/chat/message
  - **Then**: Response contains "Alice"

- [ ] **AC2-I02**: Multi-turn conversation maintains coherence
  - **Given**: Sequence of related messages
  - **When**: Follow-up question references previous context
  - **Then**: Claude's response demonstrates memory of earlier turns

### E2E Tests

- [ ] **AC2-E01**: Claude remembers context from earlier in conversation
  - **Given**: User sent "I'm planning a trip to Paris"
  - **When**: User asks "What should I pack?"
  - **Then**: Response references Paris/France appropriately

---

## AC3: Invalid API Key Handling

### Unit Tests

- [ ] **AC3-U01**: 401 error mapped to AUTH_ERROR code
  - **Given**: Anthropic API returns 401 status
  - **When**: handleClaudeError() processes error
  - **Then**: Response has code='AUTH_ERROR', retryable=false

- [ ] **AC3-U02**: Error message is user-friendly
  - **Given**: 401 authentication error
  - **When**: Error response constructed
  - **Then**: error message is "Invalid or missing API key..."
  - **And**: Does not expose technical details

- [ ] **AC3-U03**: ChatErrorDisplay renders correctly for auth error
  - **Given**: Error with code='AUTH_ERROR'
  - **When**: Component rendered
  - **Then**: Shows key icon and "Configure API Key" button
  - **And**: Button navigates to settings page

### Integration Tests

- [ ] **AC3-I01**: Invalid API key returns 401 with correct error structure
  - **Given**: Agent Server configured with invalid API key
  - **When**: POST /api/chat/message
  - **Then**: Response status=401
  - **And**: Body contains { error, code: 'AUTH_ERROR', retryable: false }

- [ ] **AC3-I02**: Missing API key handled gracefully
  - **Given**: No ANTHROPIC_API_KEY environment variable
  - **When**: Claude client initialization attempted
  - **Then**: Error message indicates missing key
  - **And**: Server continues running for health checks

### E2E Tests

- [ ] **AC3-E01**: Clear error displayed when API key invalid
  - **Given**: App configured with invalid API key
  - **When**: User sends a message
  - **Then**: Error banner appears with authentication error message
  - **And**: "Configure API Key" button visible

- [ ] **AC3-E02**: App recoverable without restart
  - **Given**: Auth error occurred
  - **When**: User configures valid API key
  - **Then**: Subsequent messages work correctly
  - **And**: No app restart required

---

## AC4: API Key Validation

### Unit Tests

- [ ] **AC4-U01**: Empty API key rejected
  - **Given**: Empty string or null API key
  - **When**: validateApiKeyFormat() called
  - **Then**: Returns { valid: false, error: "API key is required" }

- [ ] **AC4-U02**: Wrong prefix rejected
  - **Given**: API key "sk-proj-xxxxx"
  - **When**: validateApiKeyFormat() called
  - **Then**: Returns { valid: false, error: contains "sk-ant-" }

- [ ] **AC4-U03**: Valid format accepted
  - **Given**: API key "sk-ant-api03-" + 40+ alphanumeric chars
  - **When**: validateApiKeyFormat() called
  - **Then**: Returns { valid: true }

- [ ] **AC4-U04**: Too short key rejected
  - **Given**: API key "sk-ant-abc"
  - **When**: validateApiKeyFormat() called
  - **Then**: Returns { valid: false }

- [ ] **AC4-U05**: Key with invalid characters rejected
  - **Given**: API key with special characters (!, @, #)
  - **When**: validateApiKeyFormat() called
  - **Then**: Returns { valid: false }

### Integration Tests

- [ ] **AC4-I01**: Format validation endpoint returns correct response
  - **Given**: POST /api/chat/validate-key
  - **When**: apiKey="sk-ant-valid-format-key-here-with-enough-length-xyz"
  - **Then**: Response { valid: true } or { valid: false, error }

- [ ] **AC4-I02**: API validation makes test call (when enabled)
  - **Given**: Valid format API key
  - **When**: validateApiKeyWithApi() called
  - **Then**: Minimal API call made to verify key works
  - **And**: Response indicates success or auth failure

### E2E Tests

- [ ] **AC4-E01**: Format validation feedback immediate
  - **Given**: User on API key settings page
  - **When**: User types "sk-proj-xxx"
  - **Then**: Error shown: "must start with sk-ant-"

- [ ] **AC4-E02**: Validation completes within 3 seconds
  - **Given**: Valid format API key entered
  - **When**: "Validate" button clicked
  - **Then**: Result displayed within 3 seconds

- [ ] **AC4-E03**: Success state shown for valid key
  - **Given**: Valid API key entered and validated
  - **When**: Validation succeeds
  - **Then**: Green checkmark and "API key is valid" shown

---

## AC5: Network Error Handling

### Unit Tests

- [ ] **AC5-U01**: ECONNREFUSED mapped to NETWORK_ERROR
  - **Given**: Error with code='ECONNREFUSED'
  - **When**: handleClaudeError() processes
  - **Then**: Returns code='NETWORK_ERROR', retryable=true

- [ ] **AC5-U02**: ETIMEDOUT mapped to NETWORK_ERROR
  - **Given**: Error with code='ETIMEDOUT'
  - **When**: handleClaudeError() processes
  - **Then**: Returns code='NETWORK_ERROR', retryable=true

- [ ] **AC5-U03**: 5xx errors mapped to API_ERROR
  - **Given**: Error with status >= 500
  - **When**: handleClaudeError() processes
  - **Then**: Returns code='API_ERROR', retryable=true

- [ ] **AC5-U04**: Failed message stored for retry
  - **Given**: Network error during sendMessage
  - **When**: Error occurs
  - **Then**: chatStore.retryMessage contains original message

### Integration Tests

- [ ] **AC5-I01**: Network timeout returns correct error structure
  - **Given**: Agent Server with unreachable Anthropic API
  - **When**: POST /api/chat/message
  - **Then**: Response status=503
  - **And**: Body has code='NETWORK_ERROR', retryable=true

- [ ] **AC5-I02**: Partial response preserved on timeout
  - **Given**: Response started but connection dropped
  - **When**: Error handled
  - **Then**: Any received content preserved if applicable

### E2E Tests

- [ ] **AC5-E01**: Network error shows user-friendly message
  - **Given**: Network disconnected
  - **When**: User sends message
  - **Then**: Error shows "Unable to reach Claude. Check your connection."
  - **And**: Network icon displayed

- [ ] **AC5-E02**: Retry button visible and functional
  - **Given**: Network error displayed
  - **When**: Network restored and Retry clicked
  - **Then**: Original message resent without retyping
  - **And**: Response received successfully

---

## AC6: Rate Limit Handling

### Unit Tests

- [ ] **AC6-U01**: 429 status mapped to RATE_LIMITED code
  - **Given**: Error with status=429
  - **When**: handleClaudeError() processes
  - **Then**: Returns code='RATE_LIMITED', retryable=true

- [ ] **AC6-U02**: retry-after header parsed correctly
  - **Given**: 429 error with headers['retry-after']='60'
  - **When**: Error processed
  - **Then**: retryAfter=60 in response

- [ ] **AC6-U03**: ChatErrorDisplay countdown timer works
  - **Given**: Error with retryAfter=5
  - **When**: Component mounted
  - **Then**: Timer counts down from 5 to 0
  - **And**: Retry button disabled during countdown

- [ ] **AC6-U04**: Retry button enables after countdown
  - **Given**: Countdown completed (countdown=0)
  - **When**: State updates
  - **Then**: Retry button becomes enabled

### Integration Tests

- [ ] **AC6-I01**: Rate limit response includes timing info
  - **Given**: 429 error from Anthropic
  - **When**: Response constructed
  - **Then**: retryAfter value present in response

### E2E Tests

- [ ] **AC6-E01**: Rate limit shows countdown timer
  - **Given**: Rate limit error occurred
  - **When**: Error displayed
  - **Then**: Message shows "Rate limited. Please wait..."
  - **And**: Countdown timer visible: "Retry in Xs"

- [ ] **AC6-E02**: Auto-retry after countdown
  - **Given**: Rate limit countdown at 0
  - **When**: Timer expires
  - **Then**: Retry automatically triggered OR button enabled

---

## AC7: Model Configuration

### Unit Tests

- [ ] **AC7-U01**: Default model is claude-sonnet-4-5-20250514
  - **Given**: No CLAUDE_MODEL environment variable
  - **When**: ClaudeClient instantiated
  - **Then**: this.model equals 'claude-sonnet-4-5-20250514'

- [ ] **AC7-U02**: Model overridable via environment variable
  - **Given**: CLAUDE_MODEL='claude-opus-4-5'
  - **When**: ClaudeClient instantiated
  - **Then**: this.model equals 'claude-opus-4-5'

- [ ] **AC7-U03**: Beta headers included in API calls
  - **Given**: ClaudeClient making API call
  - **When**: sendMessage() executes
  - **Then**: Headers include 'anthropic-beta': 'structured-outputs-2025-11-13'

- [ ] **AC7-U04**: Model info returned in response
  - **Given**: Successful API call
  - **When**: Response processed
  - **Then**: ClaudeResponse.model contains actual model used

### Integration Tests

- [ ] **AC7-I01**: Health endpoint returns model configuration
  - **Given**: Agent Server running
  - **When**: GET /api/chat/health
  - **Then**: Response includes model field with configured model

- [ ] **AC7-I02**: API calls use configured model
  - **Given**: Custom model configured
  - **When**: Message sent
  - **Then**: Response.model matches configuration

---

## AC8: Token Usage Tracking

### Unit Tests

- [ ] **AC8-U01**: Token counts extracted from response.usage
  - **Given**: API response with usage: { input_tokens: 50, output_tokens: 100 }
  - **When**: Response processed
  - **Then**: ClaudeResponse has inputTokens=50, outputTokens=100

- [ ] **AC8-U02**: save_assistant_message stores token counts
  - **Given**: SaveAssistantMessageInput with input_tokens=50, output_tokens=100
  - **When**: Tauri command executed
  - **Then**: Message record has correct token values in database

- [ ] **AC8-U03**: Token fields nullable for backward compatibility
  - **Given**: Message saved without token counts
  - **When**: Message retrieved
  - **Then**: input_tokens and output_tokens are null, not 0

### Integration Tests

- [ ] **AC8-I01**: Tokens returned in chat response
  - **Given**: POST /api/chat/message with valid request
  - **When**: Response received
  - **Then**: inputTokens > 0 and outputTokens > 0

- [ ] **AC8-I02**: Tokens persisted with message record
  - **Given**: Message exchange completed
  - **When**: Message retrieved from database
  - **Then**: input_tokens and output_tokens stored

### E2E Tests

- [ ] **AC8-E01**: Token count accessible for display
  - **Given**: Conversation with messages
  - **When**: Token stats queried
  - **Then**: Total input_tokens and output_tokens calculable

---

## Cross-Cutting Test Scenarios

### Error Recovery

- [ ] **XC-01**: App handles Agent Server unavailable
  - **Given**: Agent Server not running
  - **When**: User sends message
  - **Then**: "Failed to connect to agent server" error shown
  - **And**: Retry possible when server starts

- [ ] **XC-02**: Multiple rapid sends handled gracefully
  - **Given**: User clicks send multiple times quickly
  - **When**: Requests processed
  - **Then**: Duplicate sends prevented
  - **And**: isSending state correctly managed

### State Management

- [ ] **XC-03**: Chat store state consistent after errors
  - **Given**: Error occurred during sendMessage
  - **When**: Error cleared
  - **Then**: isSending=false, messages intact

- [ ] **XC-04**: Conversation auto-created if none active
  - **Given**: No active conversation
  - **When**: User sends first message
  - **Then**: New conversation created
  - **And**: Message sent to new conversation

### Performance

- [ ] **XC-05**: First token within 500ms target (when API responsive)
  - **Given**: Healthy API connection
  - **When**: Message sent
  - **Then**: First visible response within 500ms (streaming context)
  - **Note**: Non-streaming responses may take longer

---

## Test Infrastructure Requirements

### Environment Setup

```bash
# Required for integration/E2E tests
ANTHROPIC_API_KEY=sk-ant-...  # Valid test API key
CLAUDE_MODEL=claude-sonnet-4-5-20250514

# Agent Server must be running
# Database must be initialized with schema
```

### Mock Strategies

| Component | Mock Strategy |
|-----------|---------------|
| Anthropic SDK | vitest.mock('@anthropic-ai/sdk') |
| Agent Server | msw (Mock Service Worker) |
| Tauri IPC | Mock invoke() function |
| Network errors | Simulate with msw handlers |

### Test Data

```typescript
// Valid test API key format (not real)
const testApiKey = 'sk-ant-api03-test1234567890123456789012345678901234567890';

// Test conversation history
const testHistory = [
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi there!' },
];
```

---

## Validation Summary

| AC | Unit Tests | Integration Tests | E2E Tests | Total |
|----|------------|-------------------|-----------|-------|
| AC1 | 4 | 3 | 2 | 9 |
| AC2 | 3 | 2 | 1 | 6 |
| AC3 | 3 | 2 | 2 | 7 |
| AC4 | 5 | 2 | 3 | 10 |
| AC5 | 4 | 2 | 2 | 8 |
| AC6 | 4 | 1 | 2 | 7 |
| AC7 | 4 | 2 | 0 | 6 |
| AC8 | 3 | 2 | 1 | 6 |
| XC  | 0 | 0 | 5 | 5 |
| **Total** | **30** | **16** | **18** | **64** |

---

## Test Execution Order

1. **Unit Tests First** - Run in CI without API access
2. **Integration Tests** - Requires ANTHROPIC_API_KEY (may incur costs)
3. **E2E Tests** - Requires full app stack running

---

## References

- [Story 1.7: Claude Integration](/thoughts/implementation-artifacts/stories/story-1-7-claude-integration.md)
- [Architecture: Claude API Features](/thoughts/planning-artifacts/architecture.md#3.3)
- [Test Design Document](/thoughts/planning-artifacts/test-design.md) (if exists)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Initial ATDD checklist created | TEA Agent (Murat) |
