# ATDD Checklist: Story 2.3 - Implement query() Wrapper

**Story:** 2-3-implement-query-wrapper
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Acceptance Criteria Summary

| AC# | Criterion |
|-----|-----------|
| AC1 | `agentSDK.query(prompt, options)` returns async iterator yielding SDK message types |
| AC2 | API errors are caught and wrapped in a consistent error type |
| AC3 | Wrapper supports optional `sessionId` for continuity |
| AC4 | Wrapper supports optional `model` selection (Opus, Sonnet) |

---

## Test Scenarios

### AC1: Async Iterator Yielding SDK Message Types

#### 2.3-UNIT-001: Transform TextBlock to text StreamMessage
- **Level:** Unit
- **Description:** Verify `transformSdkMessage()` converts SDK `TextBlock` to `{ type: "text", content: string }`
- **Preconditions:** Mock SDK message with `TextBlock` in content array
- **Steps:**
  1. Create mock AssistantMessage with TextBlock `{ type: "text", text: "Hello world" }`
  2. Call `transformSdkMessage(mockMessage, "test-session")`
  3. Collect yielded values
- **Expected:** Yields `{ type: "text", content: "Hello world" }`
- **Priority:** P1 (Critical path)

#### 2.3-UNIT-002: Transform ThinkingBlock to thinking StreamMessage
- **Level:** Unit
- **Description:** Verify `transformSdkMessage()` converts SDK `ThinkingBlock` to `{ type: "thinking", content: string }`
- **Preconditions:** Mock SDK message with `ThinkingBlock`
- **Steps:**
  1. Create mock AssistantMessage with ThinkingBlock `{ type: "thinking", thinking: "Considering options..." }`
  2. Call `transformSdkMessage(mockMessage, "test-session")`
  3. Collect yielded values
- **Expected:** Yields `{ type: "thinking", content: "Considering options..." }`
- **Priority:** P2 (Extended thinking support)

#### 2.3-UNIT-003: Transform ToolUseBlock to tool_start StreamMessage
- **Level:** Unit
- **Description:** Verify `transformSdkMessage()` converts SDK `ToolUseBlock` to tool_start message
- **Preconditions:** Mock SDK message with `ToolUseBlock`
- **Steps:**
  1. Create mock AssistantMessage with ToolUseBlock:
     ```
     { type: "tool_use", id: "tool_123", name: "read_file", input: { path: "/test.txt" } }
     ```
  2. Call `transformSdkMessage(mockMessage, "test-session")`
  3. Collect yielded values
- **Expected:** Yields:
  ```typescript
  {
    type: "tool_start",
    toolId: "tool_123",
    toolName: "read_file",
    input: { path: "/test.txt" }
  }
  ```
- **Priority:** P1 (Critical for tool execution display)

#### 2.3-UNIT-004: Transform ToolResultBlock to tool_complete StreamMessage
- **Level:** Unit
- **Description:** Verify `transformSdkMessage()` converts SDK `ToolResultBlock` to tool_complete message
- **Preconditions:** Mock SDK message with `ToolResultBlock`
- **Steps:**
  1. Create mock AssistantMessage with ToolResultBlock:
     ```
     { type: "tool_result", tool_use_id: "tool_123", content: "file contents", is_error: false }
     ```
  2. Call `transformSdkMessage(mockMessage, "test-session")`
  3. Collect yielded values
- **Expected:** Yields:
  ```typescript
  {
    type: "tool_complete",
    toolId: "tool_123",
    result: "file contents",
    isError: false
  }
  ```
- **Priority:** P1

#### 2.3-UNIT-005: Transform ResultMessage to complete StreamMessage
- **Level:** Unit
- **Description:** Verify `transformSdkMessage()` converts SDK `ResultMessage` to complete message
- **Preconditions:** Mock SDK ResultMessage
- **Steps:**
  1. Create mock ResultMessage:
     ```
     { subtype: "result", session_id: "session_abc", duration_ms: 1500, total_cost_usd: 0.05 }
     ```
  2. Call `transformSdkMessage(mockMessage, "test-session")`
  3. Collect yielded values
- **Expected:** Yields:
  ```typescript
  {
    type: "complete",
    sessionId: "session_abc",
    durationMs: 1500,
    costUsd: 0.05
  }
  ```
- **Priority:** P1 (Required for conversation completion)

#### 2.3-UNIT-006: Handle ToolResultBlock with is_error true
- **Level:** Unit
- **Description:** Verify tool error flag propagates correctly
- **Preconditions:** Mock ToolResultBlock with error
- **Steps:**
  1. Create mock ToolResultBlock with `is_error: true`
  2. Call `transformSdkMessage(mockMessage, "test-session")`
- **Expected:** Yields `{ type: "tool_complete", ..., isError: true }`
- **Priority:** P2 (Error path)

#### 2.3-UNIT-007: Handle ToolResultBlock with null is_error
- **Level:** Unit
- **Description:** Verify default `is_error` handling when undefined
- **Preconditions:** Mock ToolResultBlock without is_error field
- **Steps:**
  1. Create mock ToolResultBlock without `is_error` field
  2. Call `transformSdkMessage(mockMessage, "test-session")`
- **Expected:** Yields `{ type: "tool_complete", ..., isError: false }` (default)
- **Priority:** P2 (Edge case)

#### 2.3-UNIT-008: Transform multiple content blocks in sequence
- **Level:** Unit
- **Description:** Verify multiple blocks in single AssistantMessage yield in order
- **Preconditions:** Mock AssistantMessage with multiple content blocks
- **Steps:**
  1. Create mock with: TextBlock, ToolUseBlock, TextBlock
  2. Call `transformSdkMessage(mockMessage, "test-session")`
  3. Collect all yielded values
- **Expected:** Yields 3 StreamMessages in original order
- **Priority:** P1 (Real-world message structure)

#### 2.3-UNIT-009: Handle ResultMessage with null cost
- **Level:** Unit
- **Description:** Verify `costUsd: null` when SDK returns no cost
- **Preconditions:** Mock ResultMessage with `total_cost_usd: null`
- **Steps:**
  1. Create mock ResultMessage without cost
  2. Call `transformSdkMessage(mockMessage, "test-session")`
- **Expected:** Yields `{ type: "complete", ..., costUsd: null }`
- **Priority:** P2 (Edge case)

#### 2.3-UNIT-010: Handle unknown message type gracefully
- **Level:** Unit
- **Description:** Verify unknown SDK message types are skipped without error
- **Preconditions:** Mock message with unrecognized type
- **Steps:**
  1. Create mock message `{ type: "unknown_future_type", data: {} }`
  2. Call `transformSdkMessage(mockMessage, "test-session")`
- **Expected:** Yields nothing (skips unknown type without throwing)
- **Priority:** P2 (Forward compatibility)

#### 2.3-UNIT-013: Type guards correctly identify SDK message types
- **Level:** Unit
- **Description:** Verify all type guard functions return correct boolean
- **Preconditions:** Mock objects for each message type
- **Steps:**
  1. Test `isAssistantMessage()` with valid/invalid inputs
  2. Test `isResultMessage()` with valid/invalid inputs
  3. Test `isTextBlock()` with valid/invalid inputs
  4. Test `isThinkingBlock()` with valid/invalid inputs
  5. Test `isToolUseBlock()` with valid/invalid inputs
  6. Test `isToolResultBlock()` with valid/invalid inputs
- **Expected:** Each returns `true` for matching type, `false` otherwise
- **Priority:** P1 (Foundation for transformation)

---

### AC2: API Errors Wrapped in Consistent Error Type

#### 2.3-UNIT-014: wrapSdkError wraps network errors correctly
- **Level:** Unit
- **Description:** Verify network-related errors mapped to `ErrorCode.NETWORK_ERROR`
- **Preconditions:** N/A
- **Steps:**
  1. Call `wrapSdkError(new Error("network connection failed"))`
  2. Inspect returned OrionError
- **Expected:**
  - `code`: `ErrorCode.NETWORK_ERROR` (1002)
  - `recoverable`: `true`
  - `message`: Contains "Network error"
- **Priority:** P1

#### 2.3-UNIT-015: wrapSdkError wraps ECONNREFUSED errors
- **Level:** Unit
- **Description:** Verify connection refused errors mapped correctly
- **Preconditions:** N/A
- **Steps:**
  1. Call `wrapSdkError(new Error("ECONNREFUSED"))`
- **Expected:** `code`: `ErrorCode.NETWORK_ERROR`, `recoverable`: `true`
- **Priority:** P2 (Specific error variant)

#### 2.3-UNIT-016: wrapSdkError wraps auth errors correctly
- **Level:** Unit
- **Description:** Verify 401/unauthorized errors mapped to `ErrorCode.AUTH_REQUIRED`
- **Preconditions:** N/A
- **Steps:**
  1. Call `wrapSdkError(new Error("401 unauthorized"))`
  2. Call `wrapSdkError(new Error("API key invalid"))`
- **Expected:**
  - `code`: `ErrorCode.AUTH_REQUIRED` (2001)
  - `recoverable`: `false`
- **Priority:** P1

#### 2.3-UNIT-017: wrapSdkError wraps rate limit errors correctly
- **Level:** Unit
- **Description:** Verify 429/rate limit errors mapped to `ErrorCode.RATE_LIMITED`
- **Preconditions:** N/A
- **Steps:**
  1. Call `wrapSdkError(new Error("rate limit exceeded"))`
  2. Call `wrapSdkError(new Error("429 Too Many Requests"))`
- **Expected:**
  - `code`: `ErrorCode.RATE_LIMITED` (3001)
  - `recoverable`: `true`
  - `retryAfterMs`: 60000 (or extracted from header)
- **Priority:** P1

#### 2.3-UNIT-018: wrapSdkError wraps CLI not found error
- **Level:** Unit
- **Description:** Verify CLI installation errors mapped to fatal
- **Preconditions:** N/A
- **Steps:**
  1. Call `wrapSdkError(new Error("CLI not found"))`
  2. Call `wrapSdkError(new Error("claude not installed"))`
- **Expected:**
  - `code`: `ErrorCode.CLI_NOT_FOUND` (9002)
  - `recoverable`: `false`
- **Priority:** P1 (Critical setup error)

#### 2.3-UNIT-019: wrapSdkError defaults unknown errors to SDK_ERROR
- **Level:** Unit
- **Description:** Verify unrecognized errors get generic recoverable code
- **Preconditions:** N/A
- **Steps:**
  1. Call `wrapSdkError(new Error("something unexpected"))`
- **Expected:**
  - `code`: `ErrorCode.SDK_ERROR` (1001)
  - `recoverable`: `true`
  - `message`: "something unexpected"
- **Priority:** P1

#### 2.3-UNIT-020: wrapSdkError preserves original error
- **Level:** Unit
- **Description:** Verify `originalError` property captures source
- **Preconditions:** N/A
- **Steps:**
  1. Create original error: `const orig = new Error("original")`
  2. Call `wrapSdkError(orig)`
- **Expected:** `result.originalError === orig`
- **Priority:** P2 (Debugging support)

#### 2.3-UNIT-021: wrapSdkError handles non-Error inputs
- **Level:** Unit
- **Description:** Verify string/object inputs wrapped correctly
- **Preconditions:** N/A
- **Steps:**
  1. Call `wrapSdkError("string error")`
  2. Call `wrapSdkError({ weird: "object" })`
- **Expected:** Returns OrionError with stringified message
- **Priority:** P2 (Robustness)

#### 2.3-UNIT-022: wrapSdkError is idempotent
- **Level:** Unit
- **Description:** Verify wrapping OrionError returns same error
- **Preconditions:** N/A
- **Steps:**
  1. Create OrionError: `const err = new OrionError("test", ErrorCode.SDK_ERROR)`
  2. Call `wrapSdkError(err)`
- **Expected:** Returns original `err` unchanged
- **Priority:** P2 (Double-wrap prevention)

#### 2.3-INT-002: Error from SDK becomes StreamMessage of type error
- **Level:** Integration
- **Description:** Verify query() yields error StreamMessage when SDK throws
- **Preconditions:** Mock SDK query() to throw
- **Steps:**
  1. Mock `sdkQuery` to throw `new Error("API unavailable")`
  2. Call `sdk.query("test prompt")`
  3. Collect yielded messages
- **Expected:** Yields `{ type: "error", code: "1001", message: "...", recoverable: true }`
- **Priority:** P1 (Error flow critical)

---

### AC3: Optional sessionId for Continuity

#### 2.3-UNIT-023: query() uses provided sessionId when present
- **Level:** Unit
- **Description:** Verify explicit sessionId passed to SDK options
- **Preconditions:** Mock SDK query()
- **Steps:**
  1. Call `sdk.query("prompt", { sessionId: "my-custom-session" })`
  2. Capture options passed to mock SDK
- **Expected:** SDK called with `resume: "my-custom-session"`
- **Priority:** P1

#### 2.3-UNIT-024: query() generates adhoc sessionId when absent
- **Level:** Unit
- **Description:** Verify default session ID generated when not provided
- **Preconditions:** Mock SDK query()
- **Steps:**
  1. Call `sdk.query("prompt")` without options
  2. Capture options passed to mock SDK
- **Expected:** SDK called with `resume: "orion-adhoc-{timestamp}"`
- **Priority:** P1

#### 2.3-UNIT-025: Generated sessionId uses correct timestamp format
- **Level:** Unit
- **Description:** Verify adhoc session ID format
- **Preconditions:** Mock Date.now() to return fixed value
- **Steps:**
  1. Mock `Date.now()` to return `1706140800000`
  2. Call `sdk.query("prompt")`
  3. Capture generated session ID
- **Expected:** Session ID is `orion-adhoc-1706140800000`
- **Priority:** P2

#### 2.3-UNIT-026: ResultMessage uses provided sessionId over SDK session_id
- **Level:** Unit
- **Description:** Verify complete message uses correct session reference
- **Preconditions:** Mock ResultMessage with different session_id
- **Steps:**
  1. Call query with `sessionId: "provided-session"`
  2. Mock SDK to return ResultMessage with `session_id: "sdk-session"`
  3. Collect complete StreamMessage
- **Expected:** `sessionId` in complete message is from ResultMessage when present, fallback to provided
- **Priority:** P2 (Session tracking accuracy)

---

### AC4: Optional Model Selection (Opus, Sonnet)

#### 2.3-UNIT-027: query() uses provided model when present
- **Level:** Unit
- **Description:** Verify explicit model passed to SDK options
- **Preconditions:** Mock SDK query()
- **Steps:**
  1. Call `sdk.query("prompt", { model: "claude-opus-4-5-20250514" })`
  2. Capture options passed to mock SDK
- **Expected:** SDK called with `model: "claude-opus-4-5-20250514"`
- **Priority:** P1

#### 2.3-UNIT-028: query() defaults to Sonnet when model absent
- **Level:** Unit
- **Description:** Verify default model is Sonnet
- **Preconditions:** Mock SDK query()
- **Steps:**
  1. Call `sdk.query("prompt")` without model option
  2. Capture options passed to mock SDK
- **Expected:** SDK called with `model: "claude-sonnet-4-20250514"`
- **Priority:** P1

#### 2.3-UNIT-029: query() accepts valid model values only
- **Level:** Unit
- **Description:** Verify TypeScript enforces model union type
- **Preconditions:** Type-checking enabled
- **Steps:**
  1. Attempt to call with invalid model: `sdk.query("prompt", { model: "gpt-4" })`
- **Expected:** TypeScript compilation error (compile-time check)
- **Priority:** P2 (Type safety)

---

### Integration Tests

#### 2.3-INT-001: query() yields StreamMessage types that match interface
- **Level:** Integration
- **Description:** Verify full query flow produces valid StreamMessage union members
- **Preconditions:** Mock SDK with realistic message sequence
- **Steps:**
  1. Mock SDK to yield: AssistantMessage (text), AssistantMessage (tool_use, tool_result), ResultMessage
  2. Call `sdk.query("test prompt")`
  3. Collect all yielded messages
  4. Validate each against StreamMessage discriminated union
- **Expected:** All messages pass StreamMessage type validation
- **Priority:** P1

#### 2.3-INT-003: Barrel export provides OrionError and ErrorCode
- **Level:** Integration
- **Description:** Verify public API exports error types
- **Preconditions:** N/A
- **Steps:**
  1. Import from `src/lib/sdk`
  2. Access `OrionError` class
  3. Access `ErrorCode` enum
- **Expected:** Both are accessible from barrel export
- **Priority:** P1

#### 2.3-INT-004: Barrel export provides type guards
- **Level:** Integration
- **Description:** Verify public API exports type guard functions
- **Preconditions:** N/A
- **Steps:**
  1. Import type guards from `src/lib/sdk`
  2. Verify all 6 guards are exported
- **Expected:** `isAssistantMessage`, `isResultMessage`, `isTextBlock`, `isThinkingBlock`, `isToolUseBlock`, `isToolResultBlock` all accessible
- **Priority:** P2

---

### Mock Tests (CI-Safe)

#### 2.3-MOCK-001: Mock SDK query() to yield text messages
- **Level:** Mock Integration
- **Description:** End-to-end mock test for text-only response
- **Preconditions:** MSW or manual mock of SDK
- **Steps:**
  1. Mock `@anthropic-ai/claude-agent-sdk` module
  2. Mock `query()` async generator to yield:
     - AssistantMessage with TextBlock "Hello"
     - ResultMessage with duration
  3. Call `sdk.query("Hi")`
  4. Collect all messages
- **Expected:** Receives `[{ type: "text", content: "Hello" }, { type: "complete", ... }]`
- **Priority:** P1 (CI must pass without API key)

#### 2.3-MOCK-002: Mock SDK query() to yield tool messages
- **Level:** Mock Integration
- **Description:** End-to-end mock test for tool execution flow
- **Preconditions:** MSW or manual mock
- **Steps:**
  1. Mock `query()` to yield:
     - AssistantMessage with ToolUseBlock
     - AssistantMessage with ToolResultBlock
     - AssistantMessage with TextBlock (summary)
     - ResultMessage
  2. Call `sdk.query("Read the file")`
  3. Collect all messages
- **Expected:** Receives tool_start, tool_complete, text, complete in order
- **Priority:** P1

#### 2.3-MOCK-003: Mock SDK query() to throw errors
- **Level:** Mock Integration
- **Description:** End-to-end mock test for error handling
- **Preconditions:** MSW or manual mock
- **Steps:**
  1. Mock `query()` to throw `new Error("rate limit exceeded")`
  2. Call `sdk.query("test")`
  3. Collect messages
- **Expected:** Receives `[{ type: "error", code: "3001", recoverable: true, ... }]`
- **Priority:** P1

---

## Test Coverage Matrix

| AC | Unit | Integration | Mock | Total |
|----|------|-------------|------|-------|
| AC1 | 13 | 2 | 2 | 17 |
| AC2 | 9 | 1 | 1 | 11 |
| AC3 | 4 | 0 | 0 | 4 |
| AC4 | 3 | 0 | 0 | 3 |
| **Total** | **29** | **3** | **3** | **35** |

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P1 | 22 | Critical path - must pass for story completion |
| P2 | 13 | Extended coverage - edge cases and robustness |

---

## Test File Locations

| Test Type | File Path |
|-----------|-----------|
| Unit - Message Transform | `tests/unit/sdk/transform-sdk-message.test.ts` |
| Unit - Error Wrapping | `tests/unit/sdk/wrap-sdk-error.test.ts` |
| Unit - Type Guards | `tests/unit/sdk/type-guards.test.ts` |
| Unit - Query Options | `tests/unit/sdk/query-options.test.ts` |
| Integration - Full Flow | `tests/integration/sdk/query-wrapper.test.ts` |
| Integration - Exports | `tests/integration/sdk/barrel-exports.test.ts` |

---

## Dependencies for Testing

1. **Vitest** - Unit and integration test runner
2. **Mock SDK Module** - For CI without API credentials
3. **Factory helpers** - Create consistent mock SDK messages

---

## Notes for DEV Agent

1. **Type guards are foundational** - Implement and test these first (2.3-UNIT-013)
2. **Error wrapping is critical** - Cover all error categories for proper UI handling
3. **Mock strategy** - Use `vi.mock('@anthropic-ai/claude-agent-sdk')` for CI tests
4. **Session ID format** - Follow `orion-{type}-{identifier}` convention strictly
5. **Model defaults** - Sonnet is default per NFR-6.2 (stable SDK features)

---

*Generated by TEA (Master Test Architect) - Risk-based testing, depth scales with impact.*
