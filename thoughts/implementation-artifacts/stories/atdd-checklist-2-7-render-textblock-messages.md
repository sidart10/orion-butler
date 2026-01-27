# ATDD Checklist: 2-7-render-textblock-messages

**Story:** 2-7-render-textblock-messages
**Epic:** 2 - First Conversation
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)
**Status:** Ready for Development

---

## Overview

This ATDD checklist provides comprehensive test scenarios for Story 2.7: Render TextBlock Messages. The story implements the first user-visible streaming output - rendering Claude's text responses with markdown support and typewriter effects.

**Acceptance Criteria Summary:**
1. Text appends to message bubble on TextBlock events
2. Typewriter effect with configurable speed
3. Markdown rendering (bold, italic, code, links)

**Test Distribution:**
- Unit Tests: 45 tests (70%)
- Component Tests: 12 tests (19%)
- Integration Tests: 5 tests (8%)
- E2E Tests: 5 tests (3%)

---

## AC1: Text Appends to Message Bubble on TextBlock Events

**Requirement:** Given a streaming response is active, When a TextBlock event arrives, Then text appends to the current assistant message bubble.

### Happy Path Tests

- [ ] **2.7-UNIT-001**: AssistantMessage renders provided content prop
  - Given: AssistantMessage component with content="Hello world"
  - When: Component renders
  - Then: "Hello world" text is visible in the DOM

- [ ] **2.7-UNIT-002**: AssistantMessage appends content as prop grows
  - Given: AssistantMessage rendered with content="Hello"
  - When: Content prop updates to "Hello world"
  - Then: Full "Hello world" text is displayed

- [ ] **2.7-UNIT-003**: AssistantMessage renders content incrementally during streaming
  - Given: AssistantMessage with isStreaming=true, content="H"
  - When: Content updates through "He", "Hel", "Hell", "Hello"
  - Then: Each update appends without replacing previous content

- [ ] **2.7-UNIT-004**: AssistantMessage has role="article" for accessibility
  - Given: AssistantMessage component
  - When: Component renders
  - Then: Root element has role="article"

- [ ] **2.7-UNIT-005**: AssistantMessage has aria-label="Assistant message"
  - Given: AssistantMessage component
  - When: Component renders
  - Then: Root element has aria-label="Assistant message"

- [ ] **2.7-UNIT-006**: AssistantMessage displays agent header "Orion"
  - Given: AssistantMessage component
  - When: Component renders
  - Then: Header text "Orion" is visible

- [ ] **2.7-UNIT-007**: Message bubble has 0px border radius (Editorial Luxury)
  - Given: AssistantMessage component
  - When: Component renders
  - Then: Root element has class "rounded-none" or computed border-radius: 0px

- [ ] **2.7-UNIT-008**: Message bubble uses orion-surface background
  - Given: AssistantMessage component
  - When: Component renders
  - Then: Root element has bg-orion-surface class

- [ ] **2.7-UNIT-009**: Message bubble has 16px padding (p-4)
  - Given: AssistantMessage component
  - When: Component renders
  - Then: Root element has class "p-4" or computed padding: 16px

### Edge Cases

- [ ] **2.7-UNIT-010**: AssistantMessage handles empty content gracefully
  - Given: AssistantMessage with content=""
  - When: Component renders
  - Then: Component renders without error, shows empty message area

- [ ] **2.7-UNIT-011**: AssistantMessage handles null/undefined content
  - Given: AssistantMessage with content={undefined}
  - When: Component renders
  - Then: Component renders without crash, displays nothing or placeholder

- [ ] **2.7-UNIT-012**: AssistantMessage handles very long content (10000+ chars)
  - Given: AssistantMessage with content of 10000 characters
  - When: Component renders
  - Then: All content is rendered without truncation

- [ ] **2.7-UNIT-013**: AssistantMessage handles rapid content updates (100 updates/second)
  - Given: AssistantMessage receiving simulated rapid updates
  - When: 100 content prop changes occur in 1 second
  - Then: Final content is correctly displayed, no lost characters

- [ ] **2.7-UNIT-014**: AssistantMessage handles Unicode content (emojis, CJK, RTL)
  - Given: AssistantMessage with content containing emojis, Chinese, and Arabic text
  - When: Component renders
  - Then: All Unicode characters render correctly

- [ ] **2.7-UNIT-015**: AssistantMessage handles content with only whitespace
  - Given: AssistantMessage with content="   \n\t  "
  - When: Component renders
  - Then: Whitespace is preserved in rendered output

- [ ] **2.7-UNIT-016**: AssistantMessage handles content with HTML entities
  - Given: AssistantMessage with content="&lt;script&gt;"
  - When: Component renders
  - Then: Entities render as literal text "<script>", not as HTML

- [ ] **2.7-UNIT-017**: AssistantMessage handles newlines correctly
  - Given: AssistantMessage with content="Line1\nLine2\nLine3"
  - When: Component renders
  - Then: Content renders with appropriate line breaks

### Error Handling

- [ ] **2.7-UNIT-018**: AssistantMessage recovers from markdown parse errors
  - Given: AssistantMessage with malformed markdown "**unclosed bold"
  - When: Component renders
  - Then: Content renders without crash, displays raw text if parse fails

### Component Tests

- [ ] **2.7-COMP-001**: ChatMessageList renders AssistantMessage when state is streaming
  - Given: useStreamingMachine returns state="streaming", context.text="Hello"
  - When: ChatMessageList renders
  - Then: AssistantMessage component is visible with content "Hello"

- [ ] **2.7-COMP-002**: ChatMessageList renders AssistantMessage when state is complete
  - Given: useStreamingMachine returns state="complete", context.text="Final answer"
  - When: ChatMessageList renders
  - Then: AssistantMessage component is visible with content "Final answer"

- [ ] **2.7-COMP-003**: ChatMessageList does NOT render AssistantMessage when state is idle
  - Given: useStreamingMachine returns state="idle", context.text=""
  - When: ChatMessageList renders
  - Then: No AssistantMessage component in DOM

- [ ] **2.7-COMP-004**: ChatMessageList does NOT render AssistantMessage when state is sending
  - Given: useStreamingMachine returns state="sending", context.text=""
  - When: ChatMessageList renders
  - Then: No AssistantMessage component in DOM (or loading indicator only)

- [ ] **2.7-COMP-005**: ChatMessageList has aria-live="polite" for screen readers
  - Given: ChatMessageList component
  - When: Component renders
  - Then: Container has aria-live="polite" attribute

- [ ] **2.7-COMP-006**: ChatMessageList has aria-relevant="additions"
  - Given: ChatMessageList component
  - When: Component renders
  - Then: Container has aria-relevant="additions" attribute

---

## AC2: Typewriter Effect with Configurable Speed

**Requirement:** A typewriter effect displays characters smoothly (configurable speed).

### Happy Path Tests

- [ ] **2.7-UNIT-019**: Typewriter effect instant when typewriterSpeed=0 (default)
  - Given: AssistantMessage with typewriterSpeed=0, content="Hello world"
  - When: Component renders
  - Then: All content displayed immediately (no animation delay)

- [ ] **2.7-UNIT-020**: Typewriter effect displays chars progressively when speed > 0
  - Given: AssistantMessage with typewriterSpeed=100 (chars/sec), content="Hello"
  - When: Component renders and 25ms passes
  - Then: Approximately 2-3 characters are displayed

- [ ] **2.7-UNIT-021**: Typewriter catches up when content grows faster than display
  - Given: AssistantMessage with typewriterSpeed=10, content starts at "H"
  - When: Content rapidly updates to "Hello world!"
  - Then: Display eventually catches up to full content

- [ ] **2.7-UNIT-022**: StreamingCursor has pulse animation class
  - Given: StreamingCursor component
  - When: Component renders
  - Then: Element has class "animate-pulse"

- [ ] **2.7-UNIT-023**: StreamingCursor has aria-hidden="true"
  - Given: StreamingCursor component
  - When: Component renders
  - Then: Element has aria-hidden="true" attribute

- [ ] **2.7-UNIT-024**: StreamingCursor has gold color (bg-orion-gold)
  - Given: StreamingCursor component
  - When: Component renders
  - Then: Element has class "bg-orion-gold" or computed gold background

- [ ] **2.7-UNIT-025**: StreamingCursor shows when isStreaming=true
  - Given: AssistantMessage with isStreaming=true
  - When: Component renders
  - Then: StreamingCursor element is visible in DOM

- [ ] **2.7-UNIT-026**: StreamingCursor hides when isStreaming=false
  - Given: AssistantMessage with isStreaming=false
  - When: Component renders
  - Then: StreamingCursor element is NOT in DOM

- [ ] **2.7-UNIT-027**: Typewriter cleans up RAF on unmount
  - Given: AssistantMessage with typewriterSpeed=100 mid-animation
  - When: Component unmounts
  - Then: cancelAnimationFrame is called, no memory leak

- [ ] **2.7-UNIT-028**: Typewriter resets when content completely changes
  - Given: AssistantMessage showing "First message"
  - When: Content prop changes to entirely new "Second message"
  - Then: Display resets and shows new content appropriately

### Edge Cases

- [ ] **2.7-UNIT-029**: Typewriter handles speed=1 (very slow)
  - Given: AssistantMessage with typewriterSpeed=1, content="ABC"
  - When: 2 seconds pass
  - Then: Approximately 2 characters displayed

- [ ] **2.7-UNIT-030**: Typewriter handles speed=10000 (very fast)
  - Given: AssistantMessage with typewriterSpeed=10000, content="Hello"
  - When: 1ms passes
  - Then: All content displayed nearly instantly

- [ ] **2.7-UNIT-031**: Typewriter handles negative speed (treats as 0)
  - Given: AssistantMessage with typewriterSpeed=-100
  - When: Component renders
  - Then: Content displays instantly (no crash)

### Component Tests

- [ ] **2.7-COMP-007**: ChatMessageList passes isStreaming=true during streaming state
  - Given: useStreamingMachine returns state="streaming"
  - When: ChatMessageList renders
  - Then: AssistantMessage receives isStreaming={true} prop

- [ ] **2.7-COMP-008**: ChatMessageList passes isStreaming=false during complete state
  - Given: useStreamingMachine returns state="complete"
  - When: ChatMessageList renders
  - Then: AssistantMessage receives isStreaming={false} prop

---

## AC3: Markdown Rendering (Bold, Italic, Code, Links)

**Requirement:** Text supports markdown rendering (bold, italic, code, links).

### Happy Path Tests - Bold

- [ ] **2.7-UNIT-032**: MarkdownRenderer renders **bold** as strong element
  - Given: MarkdownRenderer with content="**bold text**"
  - When: Component renders
  - Then: DOM contains `<strong>bold text</strong>`

- [ ] **2.7-UNIT-033**: MarkdownRenderer renders __bold__ with underscores
  - Given: MarkdownRenderer with content="__also bold__"
  - When: Component renders
  - Then: DOM contains `<strong>also bold</strong>`

### Happy Path Tests - Italic

- [ ] **2.7-UNIT-034**: MarkdownRenderer renders *italic* as em element
  - Given: MarkdownRenderer with content="*italic text*"
  - When: Component renders
  - Then: DOM contains `<em>italic text</em>`

- [ ] **2.7-UNIT-035**: MarkdownRenderer renders _italic_ with underscores
  - Given: MarkdownRenderer with content="_also italic_"
  - When: Component renders
  - Then: DOM contains `<em>also italic</em>`

### Happy Path Tests - Code

- [ ] **2.7-UNIT-036**: MarkdownRenderer renders `code` as inline code element
  - Given: MarkdownRenderer with content="`inline code`"
  - When: Component renders
  - Then: DOM contains `<code>inline code</code>` with inline styling

- [ ] **2.7-UNIT-037**: MarkdownRenderer renders fenced code blocks
  - Given: MarkdownRenderer with content="```\ncode block\n```"
  - When: Component renders
  - Then: DOM contains code block with appropriate styling

- [ ] **2.7-UNIT-038**: Inline code has monospace font (font-mono)
  - Given: MarkdownRenderer with inline code
  - When: Component renders
  - Then: Code element has class "font-mono"

- [ ] **2.7-UNIT-039**: Code block has 0px border radius (Editorial Luxury)
  - Given: MarkdownRenderer with fenced code block
  - When: Component renders
  - Then: Code block has class "rounded-none"

- [ ] **2.7-UNIT-040**: Code block has orion-bg background
  - Given: MarkdownRenderer with fenced code block
  - When: Component renders
  - Then: Code block has bg-orion-bg class

### Happy Path Tests - Links

- [ ] **2.7-UNIT-041**: MarkdownRenderer renders [links](url) as anchor elements
  - Given: MarkdownRenderer with content="[Click here](https://example.com)"
  - When: Component renders
  - Then: DOM contains `<a href="https://example.com">Click here</a>`

- [ ] **2.7-UNIT-042**: Links have gold color (text-orion-gold)
  - Given: MarkdownRenderer with link
  - When: Component renders
  - Then: Anchor element has class "text-orion-gold"

- [ ] **2.7-UNIT-043**: Links open in new tab (target="_blank")
  - Given: MarkdownRenderer with link
  - When: Component renders
  - Then: Anchor element has target="_blank" attribute

- [ ] **2.7-UNIT-044**: Links have rel="noopener noreferrer" for security
  - Given: MarkdownRenderer with link
  - When: Component renders
  - Then: Anchor element has rel="noopener noreferrer"

- [ ] **2.7-UNIT-045**: Links have focus ring on keyboard focus
  - Given: MarkdownRenderer with link
  - When: Link receives keyboard focus
  - Then: Visible focus ring (gold outline) appears

### Happy Path Tests - Lists

- [ ] **2.7-UNIT-046**: MarkdownRenderer renders unordered lists
  - Given: MarkdownRenderer with content="- Item 1\n- Item 2"
  - When: Component renders
  - Then: DOM contains `<ul><li>Item 1</li><li>Item 2</li></ul>`

- [ ] **2.7-UNIT-047**: MarkdownRenderer renders ordered lists
  - Given: MarkdownRenderer with content="1. First\n2. Second"
  - When: Component renders
  - Then: DOM contains `<ol><li>First</li><li>Second</li></ol>`

### Happy Path Tests - Other Markdown

- [ ] **2.7-UNIT-048**: MarkdownRenderer renders blockquotes
  - Given: MarkdownRenderer with content="> Quote text"
  - When: Component renders
  - Then: DOM contains `<blockquote>Quote text</blockquote>` with gold left border

- [ ] **2.7-UNIT-049**: MarkdownRenderer renders horizontal rules
  - Given: MarkdownRenderer with content="---"
  - When: Component renders
  - Then: DOM contains `<hr>` element

- [ ] **2.7-UNIT-050**: MarkdownRenderer renders paragraphs with spacing
  - Given: MarkdownRenderer with content="Para 1\n\nPara 2"
  - When: Component renders
  - Then: Two `<p>` elements with appropriate margin-bottom

### Edge Cases

- [ ] **2.7-UNIT-051**: MarkdownRenderer handles nested formatting
  - Given: MarkdownRenderer with content="***bold and italic***"
  - When: Component renders
  - Then: Renders with both strong and em elements

- [ ] **2.7-UNIT-052**: MarkdownRenderer handles incomplete markdown mid-stream
  - Given: MarkdownRenderer with content="**incomplete"
  - When: Component renders
  - Then: Renders raw text without crash (react-markdown handles gracefully)

- [ ] **2.7-UNIT-053**: MarkdownRenderer handles XSS attempts in content
  - Given: MarkdownRenderer with content="<script>alert('xss')</script>"
  - When: Component renders
  - Then: Script tag is escaped/sanitized, not executed

- [ ] **2.7-UNIT-054**: MarkdownRenderer handles JavaScript URLs
  - Given: MarkdownRenderer with content="[click](javascript:alert('xss'))"
  - When: Component renders
  - Then: Link is sanitized or not rendered as clickable

- [ ] **2.7-UNIT-055**: MarkdownRenderer handles very long code blocks
  - Given: MarkdownRenderer with 500-line code block
  - When: Component renders
  - Then: Code block renders with horizontal scroll (overflow-x-auto)

- [ ] **2.7-UNIT-056**: MarkdownRenderer preserves indentation in code blocks
  - Given: MarkdownRenderer with indented code
  - When: Component renders
  - Then: Indentation preserved exactly

### Component Tests

- [ ] **2.7-COMP-009**: AssistantMessage integrates MarkdownRenderer for content
  - Given: AssistantMessage with content="**bold** and *italic*"
  - When: Component renders
  - Then: MarkdownRenderer output appears with correct formatting

- [ ] **2.7-COMP-010**: Markdown renders correctly during active streaming
  - Given: AssistantMessage streaming with partial markdown "**bo"
  - When: Content updates to "**bold**"
  - Then: Final output shows properly formatted bold text

- [ ] **2.7-COMP-011**: Dark mode markdown styling works correctly
  - Given: AssistantMessage in dark mode (.dark class on html)
  - When: Component renders with markdown content
  - Then: Text colors, code blocks, links use dark mode tokens

- [ ] **2.7-COMP-012**: Prose-orion typography variant applied
  - Given: AssistantMessage component
  - When: Component renders
  - Then: Prose container has "prose-orion" class or equivalent styling

---

## Integration Tests

- [ ] **2.7-INT-001**: Full flow - text chunk events render in message bubble
  - Given: State machine in streaming state
  - When: TEXT_CHUNK events arrive with partial content
  - Then: AssistantMessage displays accumulated text correctly

- [ ] **2.7-INT-002**: Full flow - streaming cursor appears then disappears
  - Given: Chat flow initiated
  - When: Response starts streaming (state="streaming")
  - Then: Cursor visible during streaming, hidden when state="complete"

- [ ] **2.7-INT-003**: Full flow - markdown renders correctly in streamed content
  - Given: Claude response contains markdown formatting
  - When: Full response received
  - Then: Markdown renders with correct HTML elements and styling

- [ ] **2.7-INT-004**: State machine integration - context.text maps to content
  - Given: useStreamingMachine provides context.text
  - When: ChatMessageList renders
  - Then: context.text passed to AssistantMessage content prop

- [ ] **2.7-INT-005**: State machine integration - isLoading maps to isStreaming
  - Given: useStreamingMachine provides isLoading flag
  - When: ChatMessageList renders
  - Then: isLoading passed to AssistantMessage isStreaming prop

---

## E2E Tests

- [ ] **2.7-E2E-001**: User sees text stream in real-time
  - Given: User sends a message in chat
  - When: Claude responds
  - Then: Text appears progressively in message bubble (not all at once)

- [ ] **2.7-E2E-002**: Streaming cursor visible during response
  - Given: User sends a message
  - When: Response is streaming
  - Then: Gold pulsing cursor visible at end of text

- [ ] **2.7-E2E-003**: Markdown formatting displays correctly
  - Given: User asks a question that produces markdown response
  - When: Response completes
  - Then: Bold, italic, code, and links render correctly

- [ ] **2.7-E2E-004**: Message persists after streaming completes
  - Given: Streaming response completes
  - When: User scrolls or interacts with UI
  - Then: Message remains visible and intact

- [ ] **2.7-E2E-005**: Dark mode renders correctly
  - Given: System is in dark mode
  - When: Message renders
  - Then: Colors match dark mode design tokens, contrast meets WCAG AA

---

## Accessibility Tests

- [ ] **2.7-A11Y-001**: Screen reader announces new content via aria-live
  - Given: Screen reader active
  - When: New text appears in message
  - Then: Content announced politely (not interrupting)

- [ ] **2.7-A11Y-002**: Links are keyboard navigable
  - Given: Message contains links
  - When: User presses Tab
  - Then: Links receive focus in order

- [ ] **2.7-A11Y-003**: Focus visible on links (gold outline)
  - Given: Link in message
  - When: Link receives keyboard focus
  - Then: 2px gold outline visible

- [ ] **2.7-A11Y-004**: Color contrast meets WCAG AA
  - Given: Message text on background
  - When: Contrast ratio measured
  - Then: Ratio >= 4.5:1 for body text, >= 3:1 for large text

- [ ] **2.7-A11Y-005**: Streaming cursor not announced (aria-hidden)
  - Given: Screen reader active, streaming in progress
  - When: Cursor pulses
  - Then: Cursor not announced (aria-hidden="true")

---

## Visual Regression Tests

- [ ] **2.7-VIS-001**: AssistantMessage default appearance
  - Screenshot comparison of AssistantMessage with sample content

- [ ] **2.7-VIS-002**: AssistantMessage with streaming cursor
  - Screenshot comparison during streaming state

- [ ] **2.7-VIS-003**: Markdown rendering - all elements
  - Screenshot with bold, italic, code, links, lists, blockquotes

- [ ] **2.7-VIS-004**: Dark mode appearance
  - Screenshot comparison in dark mode

- [ ] **2.7-VIS-005**: Long content overflow
  - Screenshot with very long message to verify scrolling/wrapping

---

## Test Data Requirements

### Mock Content

```typescript
// Simple content
const SIMPLE_CONTENT = "Hello, world!";

// Markdown content
const MARKDOWN_CONTENT = `
# Heading

This is **bold** and *italic* text.

Here's \`inline code\` and a code block:

\`\`\`javascript
const x = 42;
console.log(x);
\`\`\`

- List item 1
- List item 2

[Link to docs](https://example.com)

> Blockquote text
`;

// Unicode content
const UNICODE_CONTENT = "Hello 世界 مرحبا 🌍";

// Long content (for overflow testing)
const LONG_CONTENT = "Lorem ipsum ".repeat(1000);

// XSS attempt
const XSS_CONTENT = "<script>alert('xss')</script>";
```

### State Machine Mocks

```typescript
// Mock useStreamingMachine for component tests
const mockStreamingMachine = (overrides = {}) => ({
  state: 'idle',
  context: { text: '', thinking: '', tools: new Map() },
  send: vi.fn(),
  reset: vi.fn(),
  isLoading: false,
  isError: false,
  isComplete: false,
  ...overrides
});
```

---

## Dependencies

### Test Infrastructure Required

- [x] Vitest configured (from Sprint 0)
- [x] React Testing Library
- [x] Playwright for E2E
- [ ] @testing-library/jest-dom matchers
- [ ] Mock for useStreamingMachine hook
- [ ] Visual regression tooling (Playwright screenshots or Percy)

### Component Dependencies

| Dependency | Source | Required For |
|------------|--------|--------------|
| useStreamingMachine | Story 2.6 | ChatMessageList integration |
| Design tokens | Story 1.3 | Styling verification |
| Dark mode | Story 1.13 | Dark mode tests |

---

## Coverage Targets

| Category | Target | Actual |
|----------|--------|--------|
| Unit Tests | 80%+ line coverage | TBD |
| Component Tests | 75%+ | TBD |
| Integration Tests | 70%+ | TBD |
| E2E Tests | Critical paths | TBD |

---

## Notes

1. **Typewriter Default:** Speed=0 is intentional for NFR-1.1 (first token < 500ms). Typewriter is aesthetic, streaming is functional.

2. **Markdown Security:** react-markdown with remark-gfm handles XSS sanitization by default. Test confirms this behavior.

3. **Editorial Luxury:** All tests verify 0px border-radius, gold accents, and no emojis in chrome.

4. **State Machine Dependency:** Most tests require mocking useStreamingMachine. Consider creating a shared test utility.

5. **Visual Tests:** May be deferred to CI pipeline with screenshot comparison tooling.

---

*Generated by TEA (Master Test Architect) - Risk-based testing, depth scales with impact.*
