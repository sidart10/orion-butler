# Orion Butler Design System

**Aesthetic:** Editorial Luxury with Functional Restraint
**Emotion:** "Capable Calm" - like having a brilliant, quiet assistant

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `gold` | #D4AF37 | Primary accent, success, active states, focus rings |
| `gold-muted` | #C4A052 | Backgrounds, borders, subtle accents |
| `cream` | #FAF8F5 | Main background |
| `black` | #1A1A1A | Primary text |
| `gray` | #6B6B6B | Secondary text, disabled states |
| `waiting-blue` | #3B82F6 | Waiting/blocked states, needs attention |
| `error-red` | #9B2C2C | Error text only (never backgrounds) |

### Color Philosophy
- **Gold** = Everything positive (success, progress, active)
- **Blue** = Waiting on user input
- **Gray** = Idle, secondary
- **Red** = Text only for errors (no red backgrounds)

---

## Typography

| Level | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Display | Playfair Display | 32px | 400 | 1.2 |
| H1 | Playfair Display | 24px | 400 | 1.3 |
| H2 | Inter | 20px | 600 | 1.4 |
| H3 | Inter | 16px | 600 | 1.5 |
| Body | Inter | 16px | 400 | 1.6 |
| Small | Inter | 14px | 400 | 1.5 |
| Tiny | Inter | 12px | 500 | 1.4 |

### Typography Philosophy
- **Playfair Display** is the accent font - used sparingly (logo, H1, display only)
- **Inter** is the workhorse - everything else
- Tracking: 0.15em for luxury feel on headings
- No decorative fonts

---

## Spacing Scale

Base unit: 8px

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

---

## Layout Dimensions

| Element | Value |
|---------|-------|
| Sidebar width | 280px |
| Header height | 80px |
| Border radius | 0px (sharp corners everywhere) |
| Max content width | 720px |
| Canvas max width | 480px |

---

## Animation Timing

| Type | Duration | Easing |
|------|----------|--------|
| Entrance | 200ms | ease-out |
| Exit | 150ms | ease-in |
| State change | 100ms | ease |
| Pulse (loop) | 1500ms | ease-in-out |

### Animation Philosophy
- Premium = swift + smooth (never slow "luxury" animations)
- All animations are **non-blocking** - content renders immediately
- Support `prefers-reduced-motion`

---

## State Indicators

| State | Visual | Color | Copy Style |
|-------|--------|-------|------------|
| Success | Filled dot | Gold | "Done." |
| Working | Pulsing dot | Gold | "Finding times..." |
| Waiting | Pulsing dot | Blue | "Waiting for input" |
| Error | Filled dot | Red | "Couldn't access calendar." |
| Idle | Filled dot | Gray | "Ready" |

Geometric shapes + confident copy. **No emojis ever.**

---

## Iconography

### No Emojis Rule
Emojis break the Editorial Luxury aesthetic. Use:
- Typography weight/color for hierarchy
- Geometric dots for status (●, ◐)
- Lucide Icons only when functionally necessary

### Icon Exceptions (Functional Only)
| Element | Icon | Style |
|---------|------|-------|
| Collapse/Expand | Chevron | 1.5px stroke, 12px |
| Settings | Gear | 1.5px stroke, 16px |
| Close | X mark | 1.5px stroke, 12px |
| Search | Magnifying glass | 1.5px stroke, 16px |

### Icon Colors
- Default: Gray (#6B6B6B)
- Hover: Black (#1A1A1A)
- Active: Gold (#D4AF37)
- Disabled: 30% opacity

---

## Focus States

| Element | Focus Style |
|---------|-------------|
| Buttons | 2px gold outline, 2px offset |
| Inputs | Gold underline thickens |
| Cards | Subtle gold border |
| Links | Gold underline |

---

## Button Hierarchy

| Level | Style | Usage |
|-------|-------|-------|
| Primary | Black fill, gold hover | Main action (Confirm, Send, Allow) |
| Secondary | Border only | Alternative (Cancel, Edit) |
| Tertiary | Text underline | Low-priority (View, Expand) |
| Destructive | Red text | Deny, Remove (rare) |

**Rule:** One primary per context, always rightmost.

---

## Key Components

### Shell Layout (3-Panel)
1. **Left Sidebar** (280px) - GTD navigation
2. **Main Area** - Conversation thread
3. **Right Canvas** (optional) - Inline interactive UI

### Sidebar Navigation (Epic 5)
| Section | Purpose |
|---------|---------|
| New Session | Start new conversation (44px CTA) |
| Inbox | Pending approvals & captures |
| Projects | Active/Paused/Archived projects |
| Recent | Recent conversation sessions |
| Settings | App configuration |

**Note:** GTD terminology (Next, Waiting, Someday) removed - Orion AI handles task processing, not human GTD workflow.

### Canvas Types
| Type | Purpose |
|------|---------|
| calendar | Time slot selection |
| email | Email composition |
| approval | Permission requests |
| task-list | Checklist management |
| review-guide | Weekly review flow |

---

## Component Sizing (Epic 5 Plan 1B)

### Height Standards

| Component Type | Height | Tailwind | Rationale |
|----------------|--------|----------|-----------|
| Primary CTA (New Session) | 44px | `min-h-[44px]` | Touch-friendly main action |
| Nav items (Inbox, etc.) | 36px | `h-9` | Desktop standard (shadcn/ui) |
| Section headers (Projects) | 36px | `h-9` | Consistent with nav items |
| Session list items | 36px | `h-9` | Consistent sizing |

### Spacing Standards

| Context | Spacing | Token | Notes |
|---------|---------|-------|-------|
| Section gaps | 12px | `mb-space-3` | Between Inbox/Projects/Recent |
| Nav container padding | 12px | `py-space-3` | Top/bottom of scrollable area |
| Within sections | 2px | `gap-0.5` | Tight grouping of related items |

### Why 36px (not 44px)?

- **44px** is WCAG AAA for touch devices (mobile)
- **36px** is industry standard for desktop nav (Linear, Notion, shadcn/ui)
- **24px** is WCAG AA minimum

We use 36px for desktop nav items because:
1. 50% above WCAG AA minimum (accessible)
2. Matches modern desktop app conventions
3. Creates refined, non-bulky sidebar aesthetic

---

## Anti-Patterns (DON'T)

- No rounded corners (sharp 0px radius only)
- No emojis in UI
- No slow "luxury" animations
- No apologetic error copy ("Sorry, I couldn't...")
- No toasts/modals for feedback (always inline)
- No spinners (use gold pulse dot)
- No feature navigation (conversation IS the interface)
- No colorful/playful icons

---

## CSS Variables

```css
:root {
  /* Colors - Light Mode (Default) */
  --orion-gold: #D4AF37;
  --orion-gold-muted: #C4A052;
  --orion-bg: #FAF8F5;
  --orion-surface: #FFFFFF;
  --orion-surface-elevated: #FFFFFF;
  --orion-fg: #1A1A1A;
  --orion-fg-muted: #6B6B6B;
  --orion-border: #E5E5E5;
  --orion-scrollbar: #CCCCCC;
  --orion-blue: #3B82F6;
  --orion-success: #059669;
  --orion-error: #9B2C2C;

  /* Typography */
  --font-serif: 'Playfair Display', serif;
  --font-sans: 'Inter', sans-serif;

  /* Layout */
  --sidebar-width: 280px;
  --header-height: 80px;
  --radius: 0px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Animation */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 1500ms;
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in: cubic-bezier(0.32, 0, 0.67, 0);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --orion-bg: #121212;
    --orion-surface: #1A1A1A;
    --orion-surface-elevated: #242424;
    --orion-fg: #FAF8F5;
    --orion-fg-muted: #9CA3AF;
    --orion-border: #2D2D2D;
    --orion-scrollbar: #333333;
    --orion-success: #10B981;
    --orion-error: #EF4444;
    /* Gold remains constant */
  }
}

/* Manual dark mode class */
.dark {
  --orion-bg: #121212;
  --orion-surface: #1A1A1A;
  --orion-surface-elevated: #242424;
  --orion-fg: #FAF8F5;
  --orion-fg-muted: #9CA3AF;
  --orion-border: #2D2D2D;
  --orion-scrollbar: #333333;
  --orion-success: #10B981;
  --orion-error: #EF4444;
}
```

---

## Dark Mode

Orion supports system-preference dark mode and manual toggle.

### Token Mapping (Light → Dark)

| Token | Light | Dark |
|-------|-------|------|
| `--orion-bg` | #FAF8F5 | #121212 |
| `--orion-surface` | #FFFFFF | #1A1A1A |
| `--orion-surface-elevated` | #FFFFFF | #242424 |
| `--orion-fg` | #1A1A1A | #FAF8F5 |
| `--orion-fg-muted` | #6B6B6B | #9CA3AF |
| `--orion-border` | #E5E5E5 | #2D2D2D |
| `--orion-success` | #059669 | #10B981 |
| `--orion-error` | #9B2C2C | #EF4444 |

### Constant Tokens (Same Both Modes)

- `--orion-gold`: #D4AF37
- `--orion-gold-muted`: #C4A052
- `--orion-blue`: #3B82F6

### Dark Mode Opacity Overlays

| Value | Usage |
|-------|-------|
| `rgba(212, 175, 55, 0.05)` | Hover background |
| `rgba(212, 175, 55, 0.08)` | Active/running state |
| `rgba(212, 175, 55, 0.10)` | Pressed state |
| `rgba(239, 68, 68, 0.08)` | Error background |

---

## Accessibility

- WCAG AA contrast (14:1 black on cream)
- Touch/click targets:
  - **Desktop nav items:** 36px height (h-9) - shadcn/ui standard
  - **Primary CTAs:** 44px height - touch-friendly for main actions
  - **Mobile:** 44px minimum for all interactive elements
- Visible focus rings on all interactive elements (2px gold, 2px offset)
- `prefers-reduced-motion` support
- Screen reader friendly (ARIA labels, semantic HTML)
