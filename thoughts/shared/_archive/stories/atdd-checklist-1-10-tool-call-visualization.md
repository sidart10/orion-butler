# ATDD Checklist: 1-10-tool-call-visualization

**Story:** Tool Call Visualization
**Status:** Ready for Implementation
**Generated:** 2026-01-15
**Author:** TEA (Test Architect Agent - Murat)

---

## Overview

This checklist covers all acceptance criteria for Story 1.10, ensuring tool call visualization works correctly, is accessible, secure against XSS, and follows the Orion Design System.

**Total Test Count:** 45 tests
**Test Levels:** Unit (18), Integration (8), E2E (15), Visual (4)

---

## AC1: Tool Card Appears on Invocation

**Criterion:** Given Claude invokes a tool during response (tool_start event), when the tool call is made, then a collapsible card appears showing the tool name, icon, and running status indicator.

### Happy Path
- [ ] **Test 1.1.1 (E2E):** Tool card renders on tool_start event
  - Given: User sends a message that triggers tool use
  - When: Claude responds with tool_start event containing toolId and toolName
  - Then: A tool card appears with data-testid="tool-card"
  - And: The tool name is displayed (e.g., "get_weather")

- [ ] **Test 1.1.2 (E2E):** Tool card shows running spinner during execution
  - Given: Tool card is displayed
  - When: Tool status is "running"
  - Then: An animated spinner (Loader2 with animate-spin) is visible
  - And: The spinner uses orion-primary color (#D4AF37)

- [ ] **Test 1.1.3 (Integration):** Chat store receives tool_start and creates tool entry
  - Given: Chat store is initialized
  - When: addTool() is called with { id, name, status: 'running', input, startTime }
  - Then: activeTools array contains the new tool
  - And: Tool status is "running"

### Edge Cases
- [ ] **Test 1.1.4 (Unit):** Tool card handles empty/undefined tool name
  - Given: Tool name is empty string or undefined
  - When: ToolCard renders
  - Then: Gracefully displays fallback text or empty state
  - And: Does not crash

- [ ] **Test 1.1.5 (Unit):** Tool card handles very long tool names (>50 chars)
  - Given: Tool name is "super_long_tool_name_that_exceeds_normal_display_length"
  - When: ToolCard renders in collapsed state
  - Then: Name is truncated with ellipsis or wraps appropriately
  - And: Full name visible on expand

### Error Handling
- [ ] **Test 1.1.6 (Integration):** Missing toolId in event does not crash
  - Given: Streaming handler receives tool_start event
  - When: toolId is missing or null
  - Then: Event is logged as error
  - And: No card is created (graceful degradation)

---

## AC2: Tool Card Shows Input Parameters

**Criterion:** Given a tool card is displayed, when the tool is invoked with input parameters, then the card shows summarized input (max 80 chars) with truncation and full view on expand.

### Happy Path
- [ ] **Test 1.2.1 (Unit):** summarizeJson truncates at 80 characters
  - Given: JSON input is `{"query": "very long search query that exceeds the limit..."}`
  - When: summarizeJson() is called
  - Then: Returns string with max 80 chars ending in "..."

- [ ] **Test 1.2.2 (Unit):** Short inputs display fully
  - Given: JSON input is `{"city": "Tokyo"}`
  - When: summarizeJson() is called
  - Then: Returns full JSON string without truncation

- [ ] **Test 1.2.3 (E2E):** Input summary visible in collapsed state
  - Given: Tool card with input `{"city": "Tokyo"}`
  - When: Card is collapsed (default state)
  - Then: Summary text shows `{"city": "Tokyo"}` below tool name

### Edge Cases
- [ ] **Test 1.2.4 (Unit):** Nested object input is summarized correctly
  - Given: Input is `{"filters": {"date": "today", "category": "work"}, "limit": 10}`
  - When: summarizeJson() is called
  - Then: Returns flattened JSON up to 80 chars

- [ ] **Test 1.2.5 (Unit):** Array input is summarized correctly
  - Given: Input is `{"ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}`
  - When: summarizeJson() is called
  - Then: Returns truncated array representation

- [ ] **Test 1.2.6 (Unit):** Null/undefined input shows empty state
  - Given: Input is null or undefined
  - When: ToolCard renders
  - Then: No input summary is shown
  - And: Expand still works (shows "No input" or empty section)

### Error Handling
- [ ] **Test 1.2.7 (Unit):** Circular reference input handled gracefully
  - Given: Input object has circular reference (edge case from malformed data)
  - When: formatJson() is called
  - Then: Returns String(data) fallback
  - And: Does not throw

---

## AC3: Tool Card Expand/Collapse

**Criterion:** Given a tool card is displayed, when I click to expand it, then I see full JSON with syntax highlighting, can collapse back, and animation is 300ms ease.

### Happy Path
- [ ] **Test 1.3.1 (E2E):** Click toggles expand state
  - Given: Tool card in collapsed state
  - When: User clicks the card header button
  - Then: Card expands to show full input/output JSON
  - And: aria-expanded changes from "false" to "true"

- [ ] **Test 1.3.2 (E2E):** Expanded JSON uses monospace font
  - Given: Tool card is expanded
  - When: Inspecting input/output pre elements
  - Then: Font-family is monospace (font-mono class)

- [ ] **Test 1.3.3 (E2E):** Collapse returns to summary view
  - Given: Tool card is expanded
  - When: User clicks the card header button again
  - Then: Card collapses to summary view
  - And: Full JSON is hidden

- [ ] **Test 1.3.4 (Unit):** Animation duration is 300ms ease
  - Given: ToolCard component with framer-motion
  - When: Expand/collapse animation config is inspected
  - Then: transition.duration is 0.3 (300ms)
  - And: transition.ease is 'easeInOut'

### Edge Cases
- [ ] **Test 1.3.5 (E2E):** Large JSON (>10KB) renders without lag
  - Given: Tool output is very large (10KB+ JSON)
  - When: User expands the card
  - Then: Expansion completes within 500ms
  - And: Scrolling within pre element is smooth

- [ ] **Test 1.3.6 (Unit):** JSON with special characters renders correctly
  - Given: Input contains newlines, tabs, unicode characters
  - When: formatJson() is called
  - Then: JSON.stringify(data, null, 2) preserves formatting
  - And: Special chars are properly escaped

### Error Handling
- [ ] **Test 1.3.7 (Unit):** Rapid expand/collapse does not cause state issues
  - Given: ToolCard component
  - When: User rapidly clicks expand/collapse 10 times
  - Then: Final state matches last click intent
  - And: No React state warnings

---

## AC4: Tool Card Shows Output Result

**Criterion:** Given a tool execution completes (tool_complete event), when the result is received, then card shows "complete" status with green checkmark and summarized output.

### Happy Path
- [ ] **Test 1.4.1 (E2E):** Complete status shows green checkmark
  - Given: Tool card with status "complete"
  - When: Card renders
  - Then: CheckCircle2 icon is visible with text-green-600 class

- [ ] **Test 1.4.2 (Integration):** updateTool updates status to complete
  - Given: Tool exists in activeTools with status "running"
  - When: updateTool(id, { status: 'complete', output, endTime }) is called
  - Then: Tool status changes to "complete"
  - And: Output is stored

- [ ] **Test 1.4.3 (E2E):** Output summary shows truncated result
  - Given: Tool completes with output `{"temp": 22, "condition": "sunny", "humidity": 65}`
  - When: Card shows complete state
  - Then: Output summary visible (max 80 chars)

### Edge Cases
- [ ] **Test 1.4.4 (Unit):** Empty output displays gracefully
  - Given: Tool completes with output {} or null
  - When: Card renders output section
  - Then: Shows empty object or "No output" indicator

- [ ] **Test 1.4.5 (Unit):** Boolean/number output formats correctly
  - Given: Tool output is `true` or `42`
  - When: summarizeJson() is called
  - Then: Returns "true" or "42" as string

### Error Handling
- [ ] **Test 1.4.6 (Integration):** Duplicate tool_complete events are idempotent
  - Given: Tool is already complete
  - When: Another tool_complete event arrives for same toolId
  - Then: State remains complete (no change)
  - And: No errors thrown

---

## AC5: Tool Card Error State

**Criterion:** Given a tool execution fails (tool_error event), when an error is received, then card shows "error" status with red X, error message, and distinct error styling.

### Happy Path
- [ ] **Test 1.5.1 (E2E):** Error status shows red X icon
  - Given: Tool card with status "error"
  - When: Card renders
  - Then: XCircle icon is visible with text-red-600 class

- [ ] **Test 1.5.2 (E2E):** Error message is displayed
  - Given: Tool fails with error "API rate limit exceeded"
  - When: Card is expanded
  - Then: Error message text is visible in red styling

- [ ] **Test 1.5.3 (E2E):** Error card has distinct styling
  - Given: Tool card with status "error"
  - When: Card renders
  - Then: Card has border-red-500/50 class
  - And: Card has bg-red-50/10 background

### Edge Cases
- [ ] **Test 1.5.4 (Unit):** Very long error message is handled
  - Given: Error message is 500+ characters
  - When: Card renders error section
  - Then: Error message is scrollable or truncated appropriately

- [ ] **Test 1.5.5 (Unit):** Error with special characters renders safely
  - Given: Error message contains `<script>`, HTML tags, or SQL injection
  - When: escapeHtml() is applied
  - Then: Error displays as escaped text, not executed

### Error Handling
- [ ] **Test 1.5.6 (Integration):** Both output and error can exist
  - Given: Tool has partial output before error
  - When: Tool fails with both output and error
  - Then: Both sections are displayed
  - And: Error styling takes precedence

---

## AC6: Multiple Tools Stack Correctly

**Criterion:** Given multiple tools are called in sequence, when they execute, then each gets its own card in sequence with timing shown.

### Happy Path
- [ ] **Test 1.6.1 (E2E):** Multiple tools render in order
  - Given: Claude calls search_contacts, then get_calendar
  - When: Both tool_start events arrive
  - Then: Two tool cards appear in correct order
  - And: search_contacts card appears before get_calendar

- [ ] **Test 1.6.2 (E2E):** Duration displays for completed tools
  - Given: Tool starts at t=0 and completes at t=1200ms
  - When: Card renders after completion
  - Then: Duration shows "1.2s"

- [ ] **Test 1.6.3 (Unit):** Duration calculation is correct
  - Given: startTime=1000, endTime=2500
  - When: Duration is calculated
  - Then: Result is 1500ms, displayed as "1.5s"

### Edge Cases
- [ ] **Test 1.6.4 (E2E):** 10+ tools render without performance issues
  - Given: Claude calls 10 tools in sequence
  - When: All tool cards render
  - Then: Rendering completes within 500ms
  - And: Scrolling through list is smooth

- [ ] **Test 1.6.5 (Unit):** Tools with same name get unique cards
  - Given: Claude calls get_weather twice for different cities
  - When: Both complete
  - Then: Two separate cards exist with unique IDs

### Error Handling
- [ ] **Test 1.6.6 (Integration):** Mixed success/error tools display correctly
  - Given: Tool 1 succeeds, Tool 2 fails, Tool 3 succeeds
  - When: All complete
  - Then: Cards show correct status for each
  - And: Only Tool 2 has error styling

---

## AC7: Tool Card XSS Protection

**Criterion:** Given tool input/output contains potentially malicious content, when the card renders the data, then all content is properly escaped with no script execution.

### Happy Path
- [ ] **Test 1.7.1 (Unit):** Script tags are escaped
  - Given: Input contains `<script>alert("xss")</script>`
  - When: escapeHtml() is applied and content renders
  - Then: Renders as `&lt;script&gt;alert("xss")&lt;/script&gt;`
  - And: No script execution occurs

- [ ] **Test 1.7.2 (Unit):** Image onerror is escaped
  - Given: Input contains `<img src=x onerror=alert(1)>`
  - When: escapeHtml() is applied
  - Then: Renders as `&lt;img src=x onerror=alert(1)&gt;`

- [ ] **Test 1.7.3 (Unit):** JSON displayed as text
  - Given: Tool output is rendered in pre element
  - When: Content is set via textContent (not innerHTML)
  - Then: All content is text, never interpreted as HTML

### Edge Cases
- [ ] **Test 1.7.4 (Unit):** Encoded XSS variants are escaped
  - Given: Input contains `&#60;script&#62;` or `%3Cscript%3E`
  - When: Content renders
  - Then: Encoded characters display literally
  - And: No decoding/execution occurs

- [ ] **Test 1.7.5 (Unit):** Template literal injection is safe
  - Given: Input contains `${document.cookie}`
  - When: Content renders
  - Then: Displays as literal string `${document.cookie}`

- [ ] **Test 1.7.6 (Unit):** Unicode homoglyphs don't bypass escaping
  - Given: Input contains Unicode characters that look like `<>`
  - When: Content renders
  - Then: All characters display as text

### Error Handling
- [ ] **Test 1.7.7 (Integration):** escapeHtml handles all data types
  - Given: Input is number, boolean, object, or array
  - When: escapeHtml(String(data)) is called
  - Then: Returns safe string representation

---

## AC8: Tool Card Design Compliance

**Criterion:** Given a tool card is rendered, when inspecting the visual design, then it follows Orion Design System with correct colors, fonts, and dimensions.

### Happy Path
- [ ] **Test 1.8.1 (Visual):** Collapsed card matches design spec
  - Given: Tool card in collapsed state
  - When: Screenshot taken
  - Then: Matches baseline `tool-card-collapsed.png`
  - And: Pixel diff < 1%

- [ ] **Test 1.8.2 (Visual):** Expanded card matches design spec
  - Given: Tool card in expanded state
  - When: Screenshot taken
  - Then: Matches baseline `tool-card-expanded.png`

- [ ] **Test 1.8.3 (E2E):** Collapsed card height is max 60px
  - Given: Tool card in collapsed state
  - When: boundingBox() is measured
  - Then: Height is <= 60px

- [ ] **Test 1.8.4 (Unit):** Design tokens are correct
  - Given: ToolCard component CSS classes
  - When: Inspecting applied styles
  - Then: Uses border-orion-fg/10, bg-orion-bg/50
  - And: Running status uses text-orion-primary (#D4AF37)
  - And: Complete status uses text-green-600
  - And: Error status uses text-red-600

### Edge Cases
- [ ] **Test 1.8.5 (E2E):** Card renders correctly in dark/light mode
  - Given: System theme changes
  - When: Card renders
  - Then: Design tokens adapt appropriately

### Error Handling
- [ ] **Test 1.8.6 (Visual):** Error state card matches design spec
  - Given: Tool card with error status
  - When: Screenshot taken
  - Then: Matches baseline `tool-card-error.png`
  - And: Red border and background visible

---

## AC9: Tool Card Accessibility

**Criterion:** Given a tool card is displayed, when using keyboard navigation, then it is focusable, expandable via Enter/Space, and announced by screen readers.

### Happy Path
- [ ] **Test 1.9.1 (E2E):** Card is keyboard focusable
  - Given: Tool card in page
  - When: User presses Tab
  - Then: Card header button receives focus
  - And: Focus ring is visible (focus:ring-2)

- [ ] **Test 1.9.2 (E2E):** Enter key toggles expand
  - Given: Tool card is focused
  - When: User presses Enter
  - Then: Card expands
  - And: Pressing Enter again collapses

- [ ] **Test 1.9.3 (E2E):** Space key toggles expand
  - Given: Tool card is focused
  - When: User presses Space
  - Then: Card expands
  - And: Default scroll behavior is prevented

- [ ] **Test 1.9.4 (Unit):** aria-expanded reflects state
  - Given: ToolCard component
  - When: isExpanded state changes
  - Then: aria-expanded attribute updates to match

- [ ] **Test 1.9.5 (Unit):** aria-controls links to details
  - Given: ToolCard with id="tool_001"
  - When: Inspecting button attributes
  - Then: aria-controls="tool-card-details-tool_001"
  - And: Details div has matching id

### Edge Cases
- [ ] **Test 1.9.6 (E2E):** Screen reader announces tool name and status
  - Given: Tool card with name="get_weather" and status="complete"
  - When: Screen reader parses content
  - Then: Announces "get_weather" tool name
  - And: Status can be determined from icon alt text or sr-only text

### Error Handling
- [ ] **Test 1.9.7 (Unit):** Focus management on expand/collapse
  - Given: User expands card via keyboard
  - When: Card expands
  - Then: Focus remains on the toggle button
  - And: User can continue keyboard navigation

---

## AC10: Tool Card Integration with Chat Flow

**Criterion:** Given a tool is called during a streaming response, when text and tool events are interleaved, then tool cards appear inline at correct position and chat flow remains coherent.

### Happy Path
- [ ] **Test 1.10.1 (E2E):** Tool card appears inline during stream
  - Given: Claude streams "Let me check..." then tool_start then "The result is..."
  - When: Stream completes
  - Then: Tool card appears between the two text segments
  - And: Text before and after is visible

- [ ] **Test 1.10.2 (Integration):** Interleaved events handled correctly
  - Given: Events arrive: text -> tool_start -> tool_complete -> text -> complete
  - When: All events processed
  - Then: Message contains both text content and tool reference
  - And: Tool card positioned correctly in flow

- [ ] **Test 1.10.3 (E2E):** Chat continues after tool cards
  - Given: Tool cards are displayed in message
  - When: User sends follow-up message
  - Then: New message appears after tool cards
  - And: Chat scroll position is maintained

### Edge Cases
- [ ] **Test 1.10.4 (E2E):** Tool at start of response
  - Given: Claude immediately calls tool (no text before)
  - When: Response renders
  - Then: Tool card appears at start of assistant message
  - And: Subsequent text follows tool card

- [ ] **Test 1.10.5 (E2E):** Tool at end of response
  - Given: Claude calls tool after all text
  - When: Response renders
  - Then: Tool card appears at end of assistant message
  - And: No text follows (expected behavior)

### Error Handling
- [ ] **Test 1.10.6 (Integration):** Orphan tool_complete handled gracefully
  - Given: tool_complete arrives without prior tool_start
  - When: Event handler processes it
  - Then: Event is logged as warning
  - And: No crash or undefined behavior

- [ ] **Test 1.10.7 (E2E):** Tools cleared on new conversation
  - Given: Previous conversation had tool cards
  - When: User starts new conversation
  - Then: activeTools is cleared
  - And: No stale tool cards appear

---

## Summary

| AC | Total Tests | Unit | Integration | E2E | Visual |
|----|-------------|------|-------------|-----|--------|
| AC1 | 6 | 2 | 1 | 2 | 0 |
| AC2 | 7 | 5 | 0 | 1 | 0 |
| AC3 | 7 | 3 | 0 | 3 | 0 |
| AC4 | 6 | 2 | 2 | 2 | 0 |
| AC5 | 6 | 2 | 1 | 2 | 0 |
| AC6 | 6 | 2 | 1 | 2 | 0 |
| AC7 | 7 | 6 | 1 | 0 | 0 |
| AC8 | 6 | 1 | 0 | 2 | 3 |
| AC9 | 7 | 3 | 0 | 3 | 0 |
| AC10 | 7 | 0 | 3 | 4 | 0 |
| **Total** | **65** | **26** | **9** | **21** | **3** |

---

## Test File Locations

```
tests/
  unit/
    components/
      chat/
        ToolCard.test.tsx           # AC1, AC2, AC3, AC4, AC5, AC7, AC8, AC9
        ToolCardList.test.tsx       # AC6
        summarizeJson.test.ts       # AC2 helper function tests
        escapeHtml.test.ts          # AC7 XSS protection tests
  integration/
    stores/
      chatStore-tools.test.ts       # AC1, AC4, AC5, AC6, AC10
    streaming/
      tool-events.test.ts           # AC10 interleaved events
  e2e/
    tool-cards.spec.ts              # AC1-AC6, AC9, AC10
    tool-cards-visual.spec.ts       # AC8 visual regression
  visual/
    __snapshots__/
      tool-card-collapsed.png       # AC8 baseline
      tool-card-expanded.png        # AC8 baseline
      tool-card-error.png           # AC8 baseline
```

---

## Gate Criteria for Story Completion

- [ ] All 65 tests pass
- [ ] Unit test coverage >= 80% for ToolCard, ToolCardList
- [ ] Visual regression approved (3 snapshots)
- [ ] No XSS vulnerabilities (AC7 tests critical)
- [ ] Accessibility audit passes (axe-core)
- [ ] Performance: 10+ tool cards render < 500ms
- [ ] Code review approved
- [ ] No P0/P1 bugs open

---

_Generated by TEA (Test Architect Agent - Murat) - 2026-01-15_
