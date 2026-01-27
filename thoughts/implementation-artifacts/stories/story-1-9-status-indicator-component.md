# Story 1.9: Status Indicator Component

**Epic:** 1 - Harness Foundation (UI/UX Shell)
**Status:** done
**Created:** 2026-01-24
**Priority:** P1

---

## Overview

Create a StatusIndicator component that visualizes agent states (idle, thinking, acting, waiting, success, error) using geometric dots and animations. This component is fundamental to the chat experience, showing users what Orion is doing at any moment. Uses the Editorial Luxury aesthetic with typography-first design - no emojis, only geometric shapes (filled circles, pulsing circles) with state-specific colors.

## User Story

As a **user**,
I want to see agent status (Working/Waiting/Idle),
So that I know what Orion is doing.

---

## Acceptance Criteria

- [ ] **AC1:** Given the chat interface, when the agent is processing, then a "Working" indicator displays with pulse animation
- [ ] **AC2:** Given the chat interface, when the agent is waiting for external response, then a "Waiting" indicator displays in blue (#3B82F6)
- [ ] **AC3:** Given the chat interface, when the agent is idle, then an "Idle" indicator displays in muted gray
- [ ] **AC4:** Status indicator uses geometric dots (filled circle) - no emojis per Editorial Luxury aesthetic
- [ ] **AC5:** Success state displays gold checkmark icon (from Lucide) instead of filled dot
- [ ] **AC6:** Error state displays red indicator
- [ ] **AC7:** Three size variants available: 6px (inline), 8px (sidebar), 12px (activity panel)
- [ ] **AC8:** Pulse animation runs at 1500ms ease-in-out loop for thinking/waiting states
- [ ] **AC9:** Component is accessible with appropriate ARIA labels for screen readers
- [ ] **AC10:** Focus states use 2px gold outline with 2px offset (consistent with buttons/inputs)

---

## Technical Notes

### Component Architecture

```
src/components/ui/StatusIndicator.tsx
```

### Props Interface

```typescript
interface StatusIndicatorProps {
  status: 'idle' | 'thinking' | 'acting' | 'waiting' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';  // 6px, 8px, 12px
  showLabel?: boolean;        // Optional text label beside indicator
  className?: string;
}
```

### State-to-Visual Mapping (from UX Specification)

| State | Color | Animation | Icon |
|-------|-------|-----------|------|
| idle | Gray (`--orion-fg-muted`) | None | Filled circle |
| thinking | Gold (`--orion-gold`) | Pulse (1500ms) | Filled circle |
| acting | Gold (`--orion-gold`) | Spin | Filled circle |
| waiting | Blue (#3B82F6) | Pulse (1500ms) | Filled circle |
| success | Gold (`--orion-gold`) | None | Checkmark (lucide:check) |
| error | Red (`--orion-error`) | None | Filled circle |

### Size Specifications

| Size | Dimension | Use Context |
|------|-----------|-------------|
| sm (6px) | 6x6px | Inline with text |
| md (8px) | 8x8px | Sidebar indicators |
| lg (12px) | 12x12px | Activity panel, prominent display |

### Animation Details

**Pulse Animation (thinking/waiting):**
```css
@keyframes status-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
}

.status-pulse {
  animation: status-pulse 1500ms ease-in-out infinite;
}
```

**Spin Animation (acting):**
```css
@keyframes status-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-spin {
  animation: status-spin 1000ms linear infinite;
}
```

### Design Token Integration

Uses tokens from Story 1.3:
- `--orion-gold: #D4AF37` - Primary accent for active/success states
- `--orion-fg-muted` - Gray for idle state
- `--orion-error: #9B2C2C` - Red for error state
- Waiting blue: `#3B82F6` (may need to add as `--orion-waiting`)

### Accessibility Requirements

- `role="status"` for ARIA live region when status changes
- `aria-label` describing current state (e.g., "Agent is thinking")
- No animation for users with `prefers-reduced-motion: reduce`
- Sufficient color contrast (WCAG AA compliance)

---

## Dependencies

### Stories This Depends On

| Story | Dependency Reason |
|-------|-------------------|
| 1.1 | Project scaffold with components/ui directory |
| 1.3 | Design tokens (colors, animations) must exist |

### Stories That Will Depend On This

- Story 1.10+ (chat message components will use StatusIndicator)
- AgentHeader component (uses StatusIndicator + status label)
- ActivityIndicator component (uses StatusIndicator for tool call states)

---

## Implementation Guidance

### File Structure

```
src/components/ui/StatusIndicator.tsx    # Main component
src/components/ui/status-indicator.css   # Animation styles (or in globals.css)
```

### Component Implementation Pattern

Follow shadcn/ui component patterns:
- Use `cva` (class-variance-authority) for variant styling
- Export as named export
- Include displayName for DevTools debugging

### Example Usage

```tsx
// Inline with text
<StatusIndicator status="thinking" size="sm" />

// Sidebar with label
<StatusIndicator status="idle" size="md" showLabel />

// Activity panel
<StatusIndicator status="success" size="lg" />
```

### CSS Animation Tokens

Add to globals.css (extends Story 1.3):
```css
:root {
  --orion-waiting: #3B82F6;
  --orion-anim-pulse: 1500ms;
  --orion-anim-spin: 1000ms;
}
```

---

## Test Considerations

### Unit Tests

| Test ID | Description | Type |
|---------|-------------|------|
| 1.9-UNIT-001 | Renders correct color for each status state | Unit |
| 1.9-UNIT-002 | Applies pulse animation for thinking/waiting states | Unit |
| 1.9-UNIT-003 | Applies spin animation for acting state | Unit |
| 1.9-UNIT-004 | Renders correct size for sm/md/lg variants | Unit |
| 1.9-UNIT-005 | Renders checkmark icon for success state | Unit |
| 1.9-UNIT-006 | Includes correct aria-label for each state | Unit |
| 1.9-UNIT-007 | Disables animation when prefers-reduced-motion is set | Unit |

### Integration Tests

| Test ID | Description | Type |
|---------|-------------|------|
| 1.9-INT-001 | StatusIndicator integrates with Tailwind design tokens | Integration |

### Visual Testing

| Test ID | Description | Type |
|---------|-------------|------|
| 1.9-VIS-001 | All 6 states render correctly (screenshot comparison) | Visual |
| 1.9-VIS-002 | Animation timing matches specification | Visual |

---

## Out of Scope

- ActivityIndicator component (separate story - uses StatusIndicator internally)
- AgentHeader component (separate story)
- StepProgress component (separate story)
- Integration with actual agent state management

---

## Definition of Done

- [ ] StatusIndicator component created at `src/components/ui/StatusIndicator.tsx`
- [ ] All 6 status states implemented with correct colors
- [ ] All 3 size variants (sm/md/lg) implemented
- [ ] Pulse animation works for thinking/waiting states
- [ ] Spin animation works for acting state
- [ ] Success state shows checkmark icon (Lucide)
- [ ] ARIA labels present for accessibility
- [ ] Reduced motion preference respected
- [ ] Unit tests passing
- [ ] Component follows shadcn/ui patterns (cva, displayName)
- [ ] TypeScript strict mode compliant

---

## References

- UX Specification: StatusIndicator section (lines 1422-1433)
- Design tokens: Story 1.3
- Focus state pattern: Story 1.7, 1.8
- No emojis rule: UX Specification "Typography-First Navigation" (lines 843-853)
