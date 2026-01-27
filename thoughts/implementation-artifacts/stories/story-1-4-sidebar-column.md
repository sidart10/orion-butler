# Story 1.4: Sidebar Column

Status: done

---

## Story

As a **user**,
I want to see a 280px left sidebar,
So that I can navigate between GTD views.

---

## Acceptance Criteria

1. **Given** the app is launched
   **When** I view the main screen at desktop width
   **Then** the left sidebar is exactly 280px wide

2. **And** it has proper background color from design tokens (`--orion-surface`)

3. **And** it uses border token (`--orion-border`) for the right edge divider

4. **And** it is keyboard navigable (NFR-5.1)

---

## Tasks / Subtasks

- [x] Task 1: Create Sidebar component container (AC: #1, #2, #3)
  - [x] 1.1: Create `src/components/sidebar/Sidebar.tsx` file
  - [x] 1.2: Set fixed width to `var(--orion-sidebar-width)` (280px)
  - [x] 1.3: Apply background color `var(--orion-surface)` or Tailwind `bg-orion-surface`
  - [x] 1.4: Add right border using `var(--orion-border)` or Tailwind `border-r border-orion-border`
  - [x] 1.5: Set height to fill viewport (`h-screen` or `100vh`)
  - [x] 1.6: Set flex-shrink-0 to prevent sidebar from shrinking

- [x] Task 2: Create sidebar internal layout structure (AC: #1)
  - [x] 2.1: Add header area (72px height) for future logo/branding
  - [x] 2.2: Add scrollable navigation area (flex-1, overflow-y-auto)
  - [x] 2.3: Add footer area for future user settings/account

- [x] Task 3: Create placeholder navigation sections (AC: #1)
  - [x] 3.1: Add GTD section dividers with thin gray lines (1px `var(--orion-border)`)
  - [x] 3.2: Add placeholder text for "Inbox", "Next", "Waiting", "Someday" items
  - [x] 3.3: Add placeholder text for "Projects" section
  - [x] 3.4: Use typography tokens (Inter, 14px small text for nav items)

- [x] Task 4: Implement keyboard navigation foundation (AC: #4, NFR-5.1)
  - [x] 4.1: Add `role="navigation"` and `aria-label="GTD Navigation"` to sidebar
  - [x] 4.2: Ensure all placeholder nav items are focusable (tabindex or native button/link)
  - [x] 4.3: Add visible focus state: 2px gold outline with 2px offset
  - [x] 4.4: Implement arrow key navigation within sidebar (up/down to move between items)
  - [x] 4.5: Add `aria-current="true"` for active item (placeholder for future)

- [x] Task 5: Integrate sidebar into main layout (AC: #1)
  - [x] 5.1: Create or update `src/components/layout/AppShell.tsx` with flex layout
  - [x] 5.2: Add Sidebar as first child with fixed width
  - [x] 5.3: Add main content area as flex-1 sibling
  - [x] 5.4: Ensure layout uses CSS Grid or Flexbox per architecture

- [x] Task 6: Apply design system styling (AC: #2, #3)
  - [x] 6.1: Verify background color matches light mode (`#FFFFFF`)
  - [x] 6.2: Verify background color matches dark mode (`#1A1A1A`)
  - [x] 6.3: Verify border color matches light mode (`#E5E5E5`)
  - [x] 6.4: Verify border color matches dark mode (`#2D2D2D`)
  - [x] 6.5: Ensure 0px border-radius on all elements

- [x] Task 7: Add accessibility attributes (AC: #4, NFR-5.1, NFR-5.2)
  - [x] 7.1: Add `<nav>` semantic element for navigation container
  - [x] 7.2: Add landmark role for screen readers
  - [x] 7.3: Add skip link target for accessibility
  - [ ] 7.4: Test with VoiceOver on macOS (manual testing required)

---

## Dev Notes

### Architecture Compliance

This story creates the sidebar column component following the UX Design Specification and Architecture patterns.

**Layout Reference (from ux-design-specification.md):**

```
+----------------+----------------------+------------------+
|  LEFT SIDEBAR  |      CHAT AREA       |   RIGHT PANEL    |
|     280px      |      (flex-1)        |   (320px/480px)  |
+----------------+----------------------+------------------+
```

**Sidebar Dimensions (from Story 1.3 tokens):**
- Width: `--orion-sidebar-width: 280px`
- Collapsed width: `--orion-sidebar-collapsed: 72px` (future story)

### Design System Tokens to Use

**From Story 1.3 established tokens:**

| Token | Value | Usage |
|-------|-------|-------|
| `--orion-sidebar-width` | 280px | Sidebar width |
| `--orion-surface` | #FFFFFF (light) / #1A1A1A (dark) | Sidebar background |
| `--orion-border` | #E5E5E5 (light) / #2D2D2D (dark) | Right edge divider |
| `--orion-fg` | #1A1A1A (light) / #FAF8F5 (dark) | Primary text |
| `--orion-fg-muted` | #6B6B6B (light) / #9CA3AF (dark) | Secondary text, counts |
| `--orion-gold` | #D4AF37 | Active state accent |

### GTD Sidebar Visual Hierarchy (from ux-design-specification.md)

No emojis. Typography weight and color provide hierarchy:
- **Semibold** for section labels
- **Regular** for item text
- **Gray** for count badges (right-aligned)
- **Gold left border** (4px) for active item
- **Cream background** on hover

**Sidebar Order:**
1. Inbox
2. Next
3. Waiting
4. Someday
5. (Divider)
6. Projects

**Note:** The "Now" activity section is POST-MVP (deferred to v1.1).

### Keyboard Navigation Requirements (NFR-5.1)

From architecture.md and ux-design-specification.md:
- Full keyboard navigation for all actions
- 2px gold focus outline with 2px offset
- Arrow keys navigate within sidebar
- Tab moves between major sections
- Enter/Space activates items

**Focus Style Implementation:**
```css
.sidebar-item:focus-visible {
  outline: 2px solid var(--orion-gold);
  outline-offset: 2px;
}
```

### Component Structure Pattern

```tsx
// src/components/sidebar/Sidebar.tsx
export function Sidebar() {
  return (
    <aside
      className="w-sidebar flex-shrink-0 h-screen bg-orion-surface border-r border-orion-border"
    >
      <nav
        role="navigation"
        aria-label="GTD Navigation"
        className="flex flex-col h-full"
      >
        {/* Header - 72px */}
        <div className="h-[72px] px-space-4 flex items-center">
          {/* Logo/brand placeholder */}
        </div>

        {/* Navigation - flex-1, scrollable */}
        <div className="flex-1 overflow-y-auto px-space-3">
          {/* GTD Items */}
          <SidebarNavItem label="Inbox" count={0} />
          <SidebarNavItem label="Next" count={0} />
          <SidebarNavItem label="Waiting" count={0} />
          <SidebarNavItem label="Someday" count={0} />

          {/* Divider */}
          <div className="my-space-2 border-b border-orion-border" />

          {/* Projects */}
          <SidebarNavItem label="Projects" count={0} />
        </div>

        {/* Footer - settings */}
        <div className="h-[56px] px-space-4 border-t border-orion-border">
          {/* Settings placeholder */}
        </div>
      </nav>
    </aside>
  );
}
```

### SidebarNavItem Component Pattern

```tsx
// src/components/sidebar/SidebarNavItem.tsx
interface SidebarNavItemProps {
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ label, count, isActive, onClick }: SidebarNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "w-full flex items-center justify-between py-space-2 px-space-3",
        "text-sm font-normal text-orion-fg",
        "hover:bg-orion-gold/5",
        "focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2",
        isActive && "border-l-4 border-orion-gold bg-orion-gold/5 -ml-space-3 pl-[calc(var(--space-3)-4px)]"
      )}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-sm text-orion-fg-muted">{count}</span>
      )}
    </button>
  );
}
```

### Touch Target Requirements (44x44px minimum)

From ux-design-specification.md:
- Clickable area must be at least 44x44px
- Visual size can be smaller, padding expands clickable area
- Nav items should have full row clickable, not just text

**Implementation:**
```css
/* py-space-2 (8px top + 8px bottom) + text height (~18px) = 34px */
/* Need additional padding to reach 44px */
.sidebar-item {
  min-height: 44px;
  padding-top: 13px;
  padding-bottom: 13px;
}
```

### AppShell Layout Pattern

```tsx
// src/components/layout/AppShell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-orion-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
```

### Dependency on Story 1.3

This story requires the design tokens from Story 1.3:
- `--orion-sidebar-width: 280px`
- `--orion-surface` / `bg-orion-surface`
- `--orion-border` / `border-orion-border`
- `--orion-fg` / `text-orion-fg`
- `--orion-fg-muted` / `text-orion-fg-muted`
- `--orion-gold` / `border-orion-gold`
- Spacing tokens: `--space-2`, `--space-3`, `--space-4`

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/sidebar/Sidebar.tsx` | Create - main sidebar component |
| `src/components/sidebar/SidebarNavItem.tsx` | Create - nav item component |
| `src/components/sidebar/index.ts` | Create - barrel export |
| `src/components/layout/AppShell.tsx` | Create - main layout wrapper |
| `src/components/layout/index.ts` | Create - barrel export |
| `src/app/page.tsx` | Modify - use AppShell layout |

### Testing Considerations

**Visual Tests:**
- Sidebar renders at 280px width
- Background and border colors match design tokens
- Dark mode colors switch correctly
- Active state shows gold left border

**Accessibility Tests:**
- Tab navigation works through sidebar items
- Arrow key navigation works within sidebar
- Focus visible outline appears on keyboard focus
- VoiceOver announces navigation landmarks

**Unit Tests:**
- SidebarNavItem renders with correct props
- Active state applies correct classes
- Count badge displays when count > 0
- Count badge hidden when count is 0 or undefined

Test ID Convention: `1.4-UNIT-001`, `1.4-E2E-001`

### References

- [Source: thoughts/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Canvas System Architecture]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- [Source: thoughts/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.4: Sidebar Column]
- [Dependency: story-1-3-define-css-design-tokens.md]

---

## Technical Requirements

### Layout Specifications

| Property | Value |
|----------|-------|
| Width | 280px (fixed, `--orion-sidebar-width`) |
| Height | 100vh (fill viewport) |
| Position | Left edge, flex-shrink-0 |
| Background | `--orion-surface` |
| Border | 1px right, `--orion-border` |
| Border-radius | 0px (Editorial Luxury) |

### Internal Layout

| Section | Height | Purpose |
|---------|--------|---------|
| Header | 72px | Logo/branding area |
| Navigation | flex-1 | Scrollable GTD items |
| Footer | 56px | Settings/account area |

### Accessibility Specifications

| Requirement | Implementation |
|-------------|----------------|
| Semantic HTML | `<aside>` + `<nav>` elements |
| ARIA role | `role="navigation"` |
| ARIA label | `aria-label="GTD Navigation"` |
| Focus style | 2px gold outline, 2px offset |
| Keyboard nav | Tab + Arrow keys |
| Touch target | 44x44px minimum |

### Dark Mode Compatibility

The component must work with both light and dark modes using CSS variables:
- No hardcoded colors
- All colors via `--orion-*` tokens
- Automatic switching via CSS media query or `.dark` class

### Performance Metrics

- Sidebar renders on initial paint (no lazy loading)
- No layout shift during hydration
- Smooth 60fps scroll on nav overflow

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Vitest config updated to support tsx files and path aliases
- React testing library dependencies installed
- @vitejs/plugin-react added for JSX support in tests

### Completion Notes List

**AC Implementation Summary:**
- AC#1: Left sidebar exactly 280px wide - COMPLETE (uses `w-sidebar` Tailwind class mapped to `--orion-sidebar-width`)
- AC#2: Background color from design tokens - COMPLETE (uses `bg-orion-surface`)
- AC#3: Border token for right edge - COMPLETE (uses `border-r border-orion-border`)
- AC#4: Keyboard navigable (NFR-5.1) - COMPLETE (Tab navigation, focus-visible styles, aria-current, aria-label)

**Tests Created:** 49 unit tests across 3 test files - ALL PASSING
- `tests/unit/components/sidebar/Sidebar.spec.tsx` - 19 tests
- `tests/unit/components/sidebar/SidebarNavItem.spec.tsx` - 19 tests
- `tests/unit/components/layout/AppShell.spec.tsx` - 11 tests

**Test ID Range:** 1.4-UNIT-001 through 1.4-UNIT-050

**Key Implementation Details:**
- Sidebar uses semantic HTML: `<aside>` wrapper with `<nav>` inside
- SidebarNavItem uses `<button type="button">` for accessibility
- All nav items have `min-h-[44px]` for touch target compliance
- Focus states use `focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2`
- Active state shows gold left border (4px) with `aria-current="true"`
- AppShell provides flex layout with sidebar as first child

**Vitest Configuration Updates:**
- Added `@vitejs/plugin-react` for JSX support
- Added path alias `@` -> `./src` for imports
- Changed project configs to use `extends: true` to inherit root config
- Created `tests/setup.tsx` with testing-library cleanup

### File List

**Created:**
- `/Users/sid/Desktop/orion-butler/src/components/sidebar/Sidebar.tsx` - Main sidebar component
- `/Users/sid/Desktop/orion-butler/src/components/sidebar/SidebarNavItem.tsx` - Navigation item component
- `/Users/sid/Desktop/orion-butler/src/components/sidebar/index.ts` - Barrel export
- `/Users/sid/Desktop/orion-butler/src/components/layout/AppShell.tsx` - Main layout wrapper
- `/Users/sid/Desktop/orion-butler/src/components/layout/index.ts` - Barrel export
- `/Users/sid/Desktop/orion-butler/tests/unit/components/sidebar/Sidebar.spec.tsx` - 19 unit tests
- `/Users/sid/Desktop/orion-butler/tests/unit/components/sidebar/SidebarNavItem.spec.tsx` - 19 unit tests
- `/Users/sid/Desktop/orion-butler/tests/unit/components/layout/AppShell.spec.tsx` - 11 unit tests
- `/Users/sid/Desktop/orion-butler/tests/setup.tsx` - Test setup with cleanup

**Modified:**
- `/Users/sid/Desktop/orion-butler/src/app/page.tsx` - Updated to use AppShell layout
- `/Users/sid/Desktop/orion-butler/vitest.config.ts` - Added React plugin and path aliases
