# Chat + Canvas Interaction Specification

**Source:** Consolidated from 4 HTML mockups (2026-01-14)
**Status:** Canonical reference for implementation

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ORION APP                                   │
├──────────┬─────────────────────────────────┬────────────────────────┤
│          │         HEADER (80px)           │                        │
│  SIDEBAR ├─────────────────────────────────┤   CANVAS PANEL         │
│  (280px) │                                 │   (50% when open)      │
│          │         CHAT PANEL              │                        │
│          │         (flex-1)                │   - Email Composer     │
│          │                                 │   - Scheduler/Picker   │
│          │                                 │   - Document Editor    │
│          │                                 │   - (future: Design)   │
│          ├─────────────────────────────────┤                        │
│          │         INPUT BAR               │                        │
└──────────┴─────────────────────────────────┴────────────────────────┘
```

---

## Dimensions (Final)

| Element | Expanded | Collapsed |
|---------|----------|-----------|
| **Sidebar** | 280px | 72px |
| **Header** | 80px | 80px |
| **Canvas** | 50% | 0px (hidden) |
| **Chat** | flex-1 (remaining) | flex-1 |

### CSS Variables (from design system)
```css
:root {
  --orion-sidebar-width: 280px;
  --orion-sidebar-collapsed: 72px;
  --orion-header-height: 80px;
  --orion-canvas-width: 50%;
}
```

---

## Sidebar

### Structure
```
┌─────────────────┐
│ ORION (logo)  ≡ │  ← Toggle button
├─────────────────┤
│ INBOX           │  ← Section label (10px, uppercase, tracking-luxury)
│                 │
│ ▸ All Items  24 │  ← Item: icon + label + count
│ ▸ Unread     03 │  ← Active: gold left border
│ ▸ Today      08 │
│ ▸ Done       13 │
├─────────────────┤
│ [User Avatar]   │  ← Bottom: user info
│ SID SINGH       │
└─────────────────┘
```

### Active Item Style
```css
/* Active state - gold left border */
.sidebar-item-active {
  background-color: rgba(26, 26, 26, 0.05);
  border-left: 2px solid #D4AF37;
}

.sidebar-item-active .item-icon {
  color: #D4AF37;
}

.sidebar-item-active .item-count {
  color: #D4AF37;
}
```

### Collapsed State (72px)
- Hide text labels (opacity: 0)
- Show only icons
- Toggle button changes to `panel-left-open` icon

### Navigation Items (Canonical)
| Item | Icon | Description |
|------|------|-------------|
| All Items | `lucide:layers` | All inbox items |
| Unread | `lucide:inbox` | Unread items (primary) |
| Today | `lucide:calendar` | Today's items |
| Done | `lucide:check-circle-2` | Completed items |

---

## Chat Panel

### Header
```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  ⌘ + / to toggle         [Search] [Bell] [Settings]   │
└─────────────────────────────────────────────────────────────┘
```

- Height: 80px
- Left: Toggle sidebar button + keyboard hint
- Right: Search, Notifications, Settings

### Message Area

#### User Message (from inbox item)
```
┌─────────────────────────────────────────────────────┐
│ ────  Q1 Planning Meeting                          │
│                                                     │
│       FROM: John Doe (john@company.com)            │
│       SENT: Today, 10:42 AM                        │
│                                                     │
│       "Hi Sid, Can we schedule a meeting to        │
│        discuss Q1 planning? I'm free most of       │
│        next week. Best, John"                      │
└─────────────────────────────────────────────────────┘
```

- Serif italic for quoted content
- Small uppercase labels for metadata

#### Agent Response
```
┌─────────────────────────────────────────────────────┐
│ ✦ ORION INTELLIGENCE                               │  ← Gold dot + uppercase label
│                                                     │
│ I checked both calendars. Wednesday afternoon      │
│ or Friday morning look promising.                  │
│                                                     │
│ ┌────────────────┐ ┌─────────────┐ ┌──────────┐   │
│ │ Yes, Schedule  │ │ Just Reply  │ │ Archive  │   │  ← Action buttons
│ └────────────────┘ └─────────────┘ └──────────┘   │
└─────────────────────────────────────────────────────┘
```

- Gold dot indicator for agent messages
- Action buttons rendered inline (json-render)
- Primary action: filled, `gold-slide-btn` effect
- Secondary actions: outlined
- Tertiary: text only, opacity 30%

### Input Bar
```
┌─────────────────────────────────────────────────────┐
│ ──────────────────────────────────────────────────  │  ← Top border
│                                                     │
│ Ask Orion anything...                    [📎] [➤]  │  ← Serif italic placeholder
│                                                     │
│ Enter to send    ⌘ + K for command palette         │
└─────────────────────────────────────────────────────┘
```

- Border-top only (1px solid foreground)
- Serif italic placeholder
- Attachment + Send buttons (opacity 40% → 100% on hover)

---

## Canvas Panel

### States
| State | Width | Visibility |
|-------|-------|------------|
| Hidden | 0px | Not visible |
| Open | 50% | Visible with content |

### Trigger Conditions
1. **Agent opens canvas:** When agent needs to show a form/editor
2. **User clicks action:** "Just Reply" → opens Email Composer
3. **Keyboard:** Press 'E' to toggle (Esc to close)

### Canvas Header
```
┌─────────────────────────────────────────────────────┐
│ COMPOSE EMAIL                        [⤢] [✕]       │
└─────────────────────────────────────────────────────┘
```
- 80px height (matches main header)
- Title: 10px uppercase tracking-[0.4em]
- Actions: Expand, Close

### Canvas Modes

#### 1. Email Composer
```
┌─────────────────────────────────────────────────────┐
│ COMPOSE EMAIL                            [⤢] [✕]   │
├─────────────────────────────────────────────────────┤
│ TO:      john@company.com                          │
│ SUBJECT: Re: Q1 Planning Meeting                   │
├─────────────────────────────────────────────────────┤
│ [B] [I] [🔗] [≡] │ [✦ AI]                          │  ← Toolbar
├─────────────────────────────────────────────────────┤
│                                                     │
│ Hi John,                                           │
│                                                     │
│ Wednesday at 11am works great...                   │  ← TipTap editor
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Edit More]                         [Send Email]   │
└─────────────────────────────────────────────────────┘
```

#### 2. Scheduler/Time Picker
```
┌─────────────────────────────────────────────────────┐
│ SCHEDULE MEETING                         [⤢] [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ MON 14   10:00 AM                       [✓] │    │
│ └─────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────┐    │
│ │ TUE 15   2:00 PM                        [✓] │    │
│ └─────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────┐    │
│ │ WED 16   11:00 AM     [BEST MATCH]      ✓  │    │  ← Selected
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ DURATION: 30 min ▼    LOCATION: Google Meet ▼     │
│                                                     │
├─────────────────────────────────────────────────────┤
│         [Schedule and Send Invite]                 │
└─────────────────────────────────────────────────────┘
```

#### 3. Document Editor
- TipTap for rich text editing
- Used for drafts, notes, documents

---

## Interaction Flow

### Typical Email Response Flow

```
1. User opens inbox item (displayed in chat)
           │
           ▼
2. Agent analyzes and responds with options
   "I found a slot. Want me to schedule?"
           │
           ├─► [Yes, Schedule] ──► Opens Canvas (Scheduler)
           │                              │
           │                              ▼
           │                       User picks time
           │                              │
           │                              ▼
           │                       [Schedule and Send]
           │                              │
           │                              ▼
           │                       Canvas closes, confirmation in chat
           │
           ├─► [Just Reply] ────► Opens Canvas (Email Composer)
           │                              │
           │                              ▼
           │                       User edits draft
           │                              │
           │                              ▼
           │                       [Send Email]
           │
           └─► [Archive] ────────► Confirms in chat, item archived
```

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `⌘ + /` | Toggle sidebar |
| `Esc` | Close canvas |
| `⌘ + K` | Command palette |
| `⌘ + N` | New entry |
| `Enter` | Send message |

---

## Agent Awareness

When the agent generates UI (via json-render), it should:

1. **Know the layout context:**
   - Chat panel is for conversation flow
   - Canvas panel is for complex interactions
   - Inline components (buttons, quick pickers) go in chat
   - Full forms/editors open canvas

2. **Open canvas when:**
   - User needs to compose email (EmailComposer)
   - User needs to pick from multiple options (CalendarSlotPicker)
   - User needs to edit a document (TipTap)
   - Complex forms with multiple fields

3. **Keep inline when:**
   - Simple confirmations (Yes/No)
   - Quick actions (Archive, Snooze)
   - Single-select options (< 3 choices)

4. **Announce canvas actions:**
   - "I've opened the composer in the workspace."
   - "Check the canvas for available time slots."
   - Not required for inline components

---

## CSS Classes Reference

### Layout
```css
.sidebar-expanded { width: 280px; }
.sidebar-collapsed { width: 72px; }
.canvas-open { width: 50%; }
.canvas-closed { width: 0; }
```

### Transitions
```css
.sidebar-transition {
  transition: width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.canvas-transition {
  transition: width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### Active States
```css
.sidebar-item-active {
  background-color: rgba(26, 26, 26, 0.05);
  border-left: 2px solid #D4AF37;
}
```

---

## Files to Implement

| Component | File | Technology |
|-----------|------|------------|
| Sidebar | `components/layout/sidebar.tsx` | React + Zustand |
| Chat Panel | `components/chat/chat-panel.tsx` | React |
| Canvas Panel | `components/canvas/canvas-panel.tsx` | React + Zustand |
| Email Composer | `components/canvas/email-composer.tsx` | TipTap |
| Scheduler | `components/canvas/scheduler-picker.tsx` | json-render |
| Document Editor | `components/canvas/document-editor.tsx` | TipTap |

---

## Source Mockups

| File | Primary Pattern Demonstrated |
|------|------------------------------|
| `Orion _ A2UI Scheduling Interaction.html` | Time slot picker in chat |
| `Orion _ Canvas Email Composer.html` | Canvas email composer |
| `Orion _ Inbox Process Mode.html` | Chat + Canvas interaction |
| `Orion _ Luxury GTD Workspace.html` | Welcome state, sidebar structure |
