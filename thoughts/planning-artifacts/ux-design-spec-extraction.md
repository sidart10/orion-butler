# UX Design Specification Extraction from PRD v2

**Source:** prd-v2-draft.md
**Date:** 2026-01-20
**Extraction Purpose:** Comprehensive UX-relevant information for design specification

---

## 1. USER PERSONAS

### Primary User: Knowledge Worker
- **Description:** Non-technical user seeking AI-assisted productivity
- **Primary Goal:** Get things done without learning technical systems
- **Context:** Want autonomous AI assistant with Claude Code power but for life/work management, not coding
- **Pain Point:** Needs to organize tasks, emails, meetings without manual PARA/GTD management

### Secondary User: Power User
- **Description:** Technical user who customizes their setup
- **Primary Goal:** Optimize workflows with custom skills/agents
- **Context:** Comfortable with file-based configuration, wants extensibility

### Tertiary User: Developer/Builder
- **Description:** Builder creating extensions for Orion platform
- **Primary Goal:** Build and distribute new capabilities (plugins)
- **Context:** Creating skills, agents, hooks for the Orion ecosystem

---

## 2. CORE USER JOURNEYS

### UJ-1: Morning Briefing
**Trigger:** User opens Orion at start of day, or says "start my day"
**Flow:**
1. Agent activates `morning-briefing` skill
2. Spawns specialist subagents (triage, scheduler)
3. Synthesizes briefing with top 3 priorities
4. Presents in GTD-organized format

**Success State:** User knows what to focus on today without manually checking calendar, email, tasks

### UJ-2: Inbox Triage
**Trigger:** User says "check inbox", "what's urgent", or `/inbox` command
**Flow:**
1. Agent fetches unread emails via Composio (Gmail)
2. Scores each item (0.0-1.0) based on sender, urgency, action required
3. Presents sorted list with recommended actions
4. User approves/modifies; agent executes

**Success State:** Inbox processed, urgent items surfaced, actions queued

### UJ-3: Schedule Meeting
**Trigger:** User says "schedule lunch with Omar" or `/schedule`
**Flow:**
1. Agent checks calendar availability
2. Applies user preferences (no mornings, focus time blocks)
3. **Spawns inline Calendar Canvas** with time options
4. User selects time
5. Agent creates event via Composio

**Success State:** Meeting scheduled with minimal user effort

### UJ-4: Draft Communication
**Trigger:** User says "email Omar about the project" or `/email`
**Flow:**
1. Agent loads contact context and prior communication history
2. Analyzes user's writing style from past emails
3. Generates draft matching tone
4. **Spawns inline Email Canvas** with draft
5. User reviews/edits
6. User approves send; agent sends via Composio

**Success State:** Email sent that sounds like the user wrote it

### UJ-5: Capture & Organize
**Trigger:** User types anything into "New Inbox" (quick capture)
**Flow:**
1. User captures thought: "Call dentist tomorrow"
2. Agent parses intent using routing skill
3. Determines: actionable? multi-step? waiting on someone?
4. Routes to appropriate GTD category (invisible PARA filesystem write)
5. Updates GTD sidebar

**Success State:** Captured item appears in correct GTD bucket without user categorization

### UJ-6: Weekly Review
**Trigger:** User says "weekly review" or `/review`, typically Sunday
**Flow:**
1. Agent guides through GTD review steps (completed, inbox, projects, waiting, someday)
2. Spawns subagents for each review phase
3. Generates review summary
4. Suggests next week's priorities

**Success State:** All GTD buckets reviewed, stuck items identified, next week planned

### Developer Journeys (UJ-7 to UJ-10)
- Create custom skill (file-based, hot-reload)
- Create custom agent (declarative definition)
- Build meta-skill (compose existing skills)
- Package & distribute plugin

---

## 3. UI REQUIREMENTS

### 3.1 Core Philosophy

**Conversation-First Design:**
- Everything is a conversation (not separate app pages)
- Agent routes and organizes (user doesn't manually categorize)
- GTD is the view, not the input
- Canvas spawns contextually inline
- Start minimal, expand later

**Anti-Patterns to Avoid:**
- ❌ Separate "Chat" page (chat IS the product)
- ❌ Manual GTD categorization (agent handles this)
- ❌ Feature-rich GTD app (Notion/Things already exist)
- ❌ Forcing users to learn PARA (PARA is for agents, GTD is for users)

### 3.2 Shell Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [≡]  ORION                                          [⌘K] [⚙️]    │
├──────────────────────┬─────────────────────────────────────────────┤
│                      │                                             │
│  + New Inbox         │         CONVERSATION + CANVAS               │
│  ════════════════    │                                             │
│                      │  [Current inbox/conversation displayed      │
│  📥 INBOX (3)    [▼] │   here with inline canvas when needed]      │
│     └─ Quick thought │                                             │
│     └─ Voice memo    │                                             │
│     └─ Screenshot    │                                             │
│                      │                                             │
│  ⚡ NEXT (5)     [▼] │                                             │
│     └─ Reply Omar    │                                             │
│     └─ Book dentist  │                                             │
│                      │                                             │
│  📁 PROJECTS     [▼] │                                             │
│     └─ Q4 Expansion  │                                             │
│     └─ Website redo  │                                             │
│                      │                                             │
│  ⏳ WAITING (2)  [▼] │                                             │
│     └─ Contractor    │                                             │
│                      │                                             │
│  💭 SOMEDAY      [▼] │                                             │
│     └─ Learn piano   │                                             │
│                      │                                             │
│  [◀ Collapse]        │                                             │
└──────────────────────┴─────────────────────────────────────────────┘
```

**Key Elements:**
- **+ New Inbox**: Creates new conversation (capture anything)
- **GTD Sections**: Collapsible, show agent-organized conversations
- **Conversation list**: Each item is a conversation thread
- **Main area**: Selected conversation + inline canvas
- **Collapse toggle**: Sidebar collapses for focus mode

**Layout Variables (CSS):**
```css
--orion-sidebar-width: 280px;
--orion-sidebar-collapsed: 0px;
--orion-content-max-width: 850px;
```

### 3.3 The Inbox Model

**Everything starts as an "inbox"** - a conversation that gets processed and organized.

**Inbox Lifecycle:**
```
CAPTURE (user creates new inbox)
  ↓
PROCESS (agent asks clarifying questions)
  ↓
ORGANIZE (agent moves to GTD slot)
  ↓
├─ ⚡ NEXT (actionable)
├─ 📁 PROJECTS (multi-step)
└─ 💭 SOMEDAY (future)
```

**What Can Be Captured:**

| Input Type | Example | Agent Routes To |
|------------|---------|-----------------|
| Task | "Call dentist tomorrow" | Next Actions |
| Project idea | "Plan Q4 expansion" | Projects |
| Quick note | "Remember: Omar's birthday 3/15" | Resources (notes) |
| Question | "What's on my calendar?" | Processes inline, no filing |
| Delegation | "Waiting for contractor quote" | Waiting For |
| Someday | "Maybe learn piano" | Someday/Maybe |

**Important:** "Inbox" ≠ email. It's the GTD concept: anything captured that needs processing.

---

## 4. CHAT/CONVERSATION UX

### 4.1 Conversation Interface

**Anatomy:**
```
┌────────────────────────────────────────────────────────────────┐
│  📁 Q4 Expansion                              [Archive] [···]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  You: Plan the Q4 expansion project                            │
│                                                                │
│  ┌─ 🤖 Butler ─────────────────────────────────────────────┐   │
│  │ This looks like a project. Let me help you structure it.│   │
│  │                                                         │   │
│  │ [INLINE CANVAS HERE]                                    │   │
│  │                                                         │   │
│  │ What's the main goal for this expansion?                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Type a message...                              [Send]   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Components:**
- **Header**: Conversation title, GTD status, actions (Archive, More)
- **Message thread**: User + agent messages, chronological
- **Inline canvas**: Rich UI spawned by agent when needed
- **Input bar**: Text input with `/command` support

### 4.2 Agent Activity Display

**Progressive Disclosure:**

| Level | What's Shown | Toggle |
|-------|--------------|--------|
| **Hidden** | Nothing (just agent response) | Default for simple responses |
| **Summary** | "Checking calendar... ✓" | Auto-shown during processing |
| **Expanded** | Tool inputs/outputs | Click to expand |

**Activity Indicator (during processing):**
```
┌─ 🤖 Butler ─────────────────────────────────────────────────┐
│                                                             │
│  ⏳ Working on it...                                        │
│                                                             │
│  ├─ ✓ Checking your calendar                               │
│  ├─ ✓ Looking up Omar's availability                       │
│  └─ ⏳ Finding optimal times...                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. CANVAS/WORKSPACE UX

### 5.1 Canvas Philosophy

Canvas is **rich UI that spawns inline within a conversation** when the context requires it.

**Canvas Types:**

| Canvas | Triggered When | What It Shows |
|--------|----------------|---------------|
| **Calendar Picker** | Scheduling request | Available time slots, conflict warnings |
| **Email Composer** | Drafting email | To/Subject/Body with tone controls |
| **Project Board** | Project planning | Goals, milestones, tasks |
| **Task List** | Multiple action items | Checkable task list |
| **File Preview** | Discussing a document | Document viewer/editor |
| **Contact Card** | Person mentioned | Contact details, recent interactions |
| **Approval Card** | Permission needed | Action details + Allow/Deny/Edit |

### 5.2 Canvas Behavior

| Behavior | Description |
|----------|-------------|
| **Spawns inline** | Appears within message thread, not separate page |
| **Agent-triggered** | Agent decides when canvas is needed |
| **Interactive** | User can interact (pick time, edit draft, check tasks) |
| **Persists in thread** | Canvas state saved with conversation |
| **Collapsible** | Can minimize if conversation continues |

### 5.3 Example: Calendar Canvas

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 SCHEDULE: Lunch with Omar                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Available slots (next 7 days):                             │
│                                                             │
│  ○ Tue 1/21  12:00 PM - 1:00 PM  ✓ Omar free               │
│  ○ Wed 1/22  12:30 PM - 1:30 PM  ✓ Omar free               │
│  ● Thu 1/23  1:00 PM - 2:00 PM   ✓ Omar free  ← selected   │
│                                                             │
│  Duration: [1 hour ▼]   Location: [Suggest ▼]              │
│                                                             │
│  [Cancel]                              [Create Event]       │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Example: Email Canvas

```
┌─────────────────────────────────────────────────────────────┐
│ 📧 EMAIL COMPOSER                                           │
├─────────────────────────────────────────────────────────────┤
│  To: omar@samba.tv                                          │
│  Subject: [Lunch Thursday?                    ]             │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Hey Omar,                                              │ │
│  │                                                        │ │
│  │ Want to grab lunch Thursday at 1pm? I found a good    │ │
│  │ spot near the office...                               │ │
│  │                                                        │ │
│  │ Let me know!                                           │ │
│  │ - Sid                                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  Tone: ○ Formal  ● Professional  ○ Casual                   │
│                                                             │
│  [Cancel]         [Save Draft]              [Send]          │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Example: Project Canvas

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 PROJECT CANVAS: Q4 Expansion                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ **Goal:** [Expand into 3 new markets                    ]   │
│ **Timeline:** [Q4 2026 (Oct-Dec)                        ]   │
│                                                             │
│ **Key milestones:**                                         │
│   ☐ Market research (Week 1-2)                              │
│   ☐ Budget approval (Week 3)                                │
│   ☐ Team hiring (Week 4-8)                                  │
│   ☐ Product launch (Week 12)                                │
│                                                             │
│ [+ Add milestone]                                           │
│                                                             │
│ **Next Actions:**                                           │
│   ⚡ Schedule kickoff meeting                                │
│   ⚡ Draft budget proposal                                   │
│                                                             │
│  [Save & Close]                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Example: Approval/Permission Card

```
┌─────────────────────────────────────────────────────────────┐
│ 📤 PERMISSION REQUIRED                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Send email to omar@samba.tv?                               │
│                                                             │
│  Subject: Lunch Thursday?                                   │
│  Preview: "Hey Omar, want to grab lunch Thursday at 1pm?    │
│            I found a good spot near the office..."          │
│                                                             │
│  [View Full]                                                │
│                                                             │
│         [Deny]        [Edit Draft]        [Send]            │
└─────────────────────────────────────────────────────────────┘
```

**Permission States:**

| State | Visual | Next |
|-------|--------|------|
| **Pending** | Yellow border, buttons active | User decides |
| **Approved** | Green checkmark, "Sent ✓" | Action executed |
| **Denied** | Red X, "Cancelled" | Agent acknowledges |
| **Edited** | Opens editor canvas | User modifies, then approves |

---

## 6. NAVIGATION PATTERNS

### 6.1 GTD Sidebar Organization

The sidebar shows conversations organized by GTD status. **Agent does categorization, not user.**

**GTD Categories:**

| Category | Icon | Contains | Auto-moves When |
|----------|------|----------|-----------------|
| **Inbox** | 📥 | Unprocessed conversations | New capture |
| **Next** | ⚡ | Actionable items | Agent identifies clear next action |
| **Projects** | 📁 | Multi-step outcomes | Agent identifies project scope |
| **Waiting** | ⏳ | Delegated/blocked | Agent detects dependency on others |
| **Someday** | 💭 | Future/maybe items | User or agent marks "not now" |

### 6.2 Sidebar Interactions

| Action | Behavior |
|--------|----------|
| **Click item** | Opens conversation in main area |
| **Collapse section** | Hides items, shows count badge |
| **Collapse sidebar** | Full focus mode, main area expands |
| **Drag item** | Manual override of GTD category (rare) |

**Section Behavior:**
```
📁 PROJECTS (3)     [▼ expanded]
   └─ Q4 Expansion        ● active conversation
   └─ Website Redesign
   └─ Hiring Plan

📁 PROJECTS (3)     [▶ collapsed]
```

### 6.3 Command Palette

Accessed via `⌘K` - provides quick access to commands, skills, and navigation.

### 6.4 No Separate Pages (MVP)

**Rule:** If it can be a canvas, don't make it a page.

**Future expansion (add only when conversation + canvas model insufficient):**
- Calendar view (week-at-a-glance)
- Project dashboard (birds-eye progress)
- Settings page (when preferences outgrow inline config)
- Connections page (OAuth management)

---

## 7. KEY SCREENS/VIEWS

### 7.1 Main View: Conversation + Canvas
- **Primary screen** where user spends 95% of time
- Sidebar on left (collapsible)
- Conversation thread in main area
- Canvas spawns inline as needed

### 7.2 Inbox Capture (New Inbox)
- Quick input field for capturing anything
- Appears immediately on `⌘N`
- Agent processes and routes automatically

### 7.3 GTD Sidebar Views
- Each GTD category (Inbox, Next, Projects, Waiting, Someday) is a filter, not a separate page
- Clicking items opens conversation in main area

---

## 8. INTERACTION PARADIGMS

### 8.1 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ N` | New inbox (quick capture) |
| `⌘ K` | Command palette |
| `⌘ [` | Collapse sidebar |
| `⌘ ↑/↓` | Navigate conversations |
| `⌘ Enter` | Send message |
| `Esc` | Close canvas / collapse activity |

### 8.2 Slash Commands

- User types `/inbox` → Activates inbox-triage skill
- User types `/schedule` → Activates calendar-manage skill
- User types `/email` → Activates email-compose skill
- User types `/review` → Activates weekly-review skill
- User types `/briefing` → Generates morning briefing

### 8.3 Natural Language Triggers

**Agent auto-detects intent:**
- "Check my inbox" → Inbox triage skill
- "Schedule lunch with Omar" → Calendar management
- "Email Omar about the project" → Email composition
- "Start my day" → Morning briefing

### 8.4 Drag and Drop (Manual Override)

- Rare usage: User can drag conversation between GTD categories
- Agent respects manual override and learns preference

---

## 9. ACCESSIBILITY REQUIREMENTS

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard navigation** | Full tab order, visible focus rings |
| **Screen reader** | ARIA labels, semantic HTML, live regions for agent activity |
| **Color contrast** | WCAG AA minimum (4.5:1) |
| **Reduced motion** | Respect `prefers-reduced-motion` |
| **Font scaling** | Relative units, 200% zoom support |

---

## 10. RESPONSIVE/PLATFORM REQUIREMENTS

### 10.1 Platform: macOS Desktop (MVP)

**Primary Platform:** macOS native desktop app via Tauri 2.0
- Full macOS integration
- Native window management
- Menu bar integration

**Out of Scope (MVP):**
- Windows/Linux (future v1.5)
- Mobile app (post-MVP)
- Web app

### 10.2 Responsive Breakpoints

| Breakpoint | Sidebar | Conversation |
|------------|---------|--------------|
| **Desktop** (≥1280px) | Fixed 280px | Centered, max 850px |
| **Laptop** (1024-1279px) | Collapsible | Full width |
| **Tablet/Mobile** (< 1024px) | Hidden (swipe to reveal) | Full width |

---

## 11. DESIGN LANGUAGE

### 11.1 Visual Style: "Editorial Luxury"

Premium feel without productivity app clutter.

| Element | Specification |
|---------|---------------|
| **Typography** | Playfair Display (headings), Inter (body) |
| **Colors** | Cream background, charcoal text, gold accents |
| **Spacing** | Generous whitespace, content breathes |
| **Borders** | Sharp geometry, 0px border-radius (sharp edges) |
| **Motion** | Subtle, luxury easing |

**Reference:** Full design system at `design-system/README.md`

### 11.2 Color Palette (Inferred)

- **Background:** Cream/off-white (warm, not stark white)
- **Text:** Charcoal (not pure black)
- **Accents:** Gold (premium feel)
- **Status Colors:**
  - Green: Approved/completed
  - Yellow: Pending/warning
  - Red: Denied/error

### 11.3 Typography Scale

- **Headings:** Playfair Display (serif, editorial feel)
- **Body:** Inter (sans-serif, readable)
- **Monospace:** (for code/technical content)

---

## 12. UI RESPONSIBILITIES & CONSTRAINTS

### 12.1 The UI DOES

- Render conversations in GTD-organized sidebar
- Display conversation thread with inline canvas
- Show agent activity (progressive disclosure)
- Handle permission prompts inline
- Route `/commands` to skills
- Provide capture input ("New Inbox")

### 12.2 The UI Does NOT

- Decide GTD categorization (agent does this)
- Contain business logic
- Make routing decisions
- Process or transform data
- Directly call external APIs

**Principle:** The UI is a viewport into agent-organized conversations, not a productivity application.

---

## 13. CANVAS SYSTEM DETAILS

### 13.1 Canvas as "Rich UI Inline"

Canvas is **NOT a separate page or modal**. It appears inline within the conversation thread.

### 13.2 Canvas Lifecycle

1. **Trigger:** Agent detects need for rich UI (scheduling, email drafting, etc.)
2. **Spawn:** Canvas appears inline in conversation
3. **Interact:** User interacts with canvas (select time, edit text, check boxes)
4. **Persist:** Canvas state saved with conversation
5. **Collapse:** User can minimize canvas if conversation continues
6. **Result:** Agent proceeds based on user interaction

### 13.3 Canvas Interaction Patterns

**Selection:**
- Radio buttons for single-choice (time slots)
- Checkboxes for multi-select (tasks)

**Input:**
- Text fields for subject/body
- Dropdowns for options (duration, tone)

**Actions:**
- Cancel (dismiss canvas)
- Save Draft (store for later)
- Submit/Send (execute action)

---

## 14. FUTURE CONSIDERATIONS

### 14.1 Not in MVP Scope

| Feature | Rationale | Future Version |
|---------|-----------|----------------|
| Plugin marketplace UI | Focus on harness first | v1.1 |
| Multi-user/team | Single-user MVP | v2.0 |
| Mobile app | Desktop-first | Post-MVP |
| Windows/Linux | macOS quality first | v1.5 |
| Custom model training | Too complex | v2.0 |

### 14.2 Progressive Enhancement

Start minimal. Add features only when conversation + canvas model proves insufficient.

**Potential future expansions:**
- Calendar view (week-at-a-glance)
- Project dashboard
- Settings page
- Connections/OAuth management

---

## 15. KEY UX PATTERNS SUMMARY

### 15.1 Meta-Pattern for All Interactions

```
[Trigger] → [Skill Activation] → [Subagent Orchestration]
                                          ↓
                                   [Synthesize]
                                          ↓
                              [Canvas/UI (if needed)]
                                          ↓
                                  [User Approval]
                                          ↓
                                    [Execute]
```

### 15.2 Capture → Process → Organize Flow

```
CAPTURE (user input)
  ↓
PROCESS (agent clarification)
  ↓
ORGANIZE (agent routes to GTD/PARA)
  ↓
UPDATE UI (reflects in sidebar)
```

### 15.3 Invisible PARA, Visible GTD

- **User sees:** GTD categories (Inbox, Next, Projects, Waiting, Someday)
- **Agent uses:** PARA filesystem (projects/, areas/, resources/, archive/, inbox/)
- **Mapping is automatic and invisible to user**

---

## 16. QUICK DESIGN DECISIONS REFERENCE

### DO:
✅ Conversation-first (everything is an inbox)
✅ Agent does organization (invisible PARA)
✅ Canvas spawns inline (not separate pages)
✅ GTD categories in sidebar
✅ Progressive disclosure for agent activity
✅ Permission cards inline
✅ Sharp geometry (0px border-radius)
✅ Editorial luxury aesthetic

### DON'T:
❌ Separate "Chat" page
❌ Manual GTD categorization UI
❌ Build another Notion/Things clone
❌ Expose PARA to users
❌ Create separate pages for features
❌ Use rounded corners (sharp edges only)
❌ Productivity app clutter

