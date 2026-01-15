# Product Requirements Document: Orion Personal Butler

**Version:** 1.0
**Status:** Draft
**Date:** 2026-01-13
**Author:** Product & Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [User Personas](#3-user-personas)
4. [User Stories & Jobs to Be Done](#4-user-stories--jobs-to-be-done)
5. [Feature Requirements](#5-feature-requirements)
6. [Technical Requirements](#6-technical-requirements)
7. [UX/UI Requirements](#7-uxui-requirements)
8. [Success Metrics](#8-success-metrics)
9. [Implementation Phases](#9-implementation-phases)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Open Questions](#11-open-questions)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### 1.1 Product Vision

Orion is an AI-powered personal butler that transforms how knowledge workers manage their digital lives. By combining intelligent inbox triage, semantic memory, and seamless tool integrations, Orion acts as a proactive assistant that learns user preferences over time and handles the cognitive overhead of managing email, calendar, tasks, and relationships - freeing users to focus on meaningful work.

### 1.2 Problem Statement

Knowledge workers are overwhelmed by the volume of digital inputs they receive daily:
- **Email overload**: Professionals receive 100+ emails daily, spending 28% of worktime on email management
- **Context switching**: Jumping between Gmail, Calendar, Slack, and task tools destroys focus
- **Information fragmentation**: Important details are scattered across tools with no unified view
- **Decision fatigue**: Constantly deciding what's urgent vs. important drains mental energy
- **Lost context**: Previous conversations, decisions, and preferences must be manually recalled

Current solutions (email clients, task managers, calendar apps) treat each domain in isolation, forcing users to be the integration layer between their tools.

### 1.3 Solution Overview

Orion provides:
1. **Unified Inbox**: All actionable items (email, calendar, Slack, tasks) in one prioritized view
2. **AI-Powered Triage**: Automatic priority scoring, action extraction, and filing suggestions
3. **Semantic Memory**: Cross-session recall of contacts, preferences, decisions, and context
4. **PARA Organization**: Structured organization by actionability (Projects, Areas, Resources, Archives)
5. **Tool Integrations**: Native connections to Gmail, Calendar, Slack via Composio
6. **Desktop-First Experience**: macOS native app with chat + canvas split-screen UI

### 1.4 Target User

Primary: Knowledge workers (managers, founders, professionals) with 50+ emails/day who value productivity and are comfortable with AI assistants.

---

## 2. Product Overview

### 2.1 What is Orion?

Orion is a macOS desktop application that serves as an AI personal butler. It combines:
- A conversational AI interface powered by Claude
- A dynamic canvas for rich interactions (email composition, calendar views, forms)
- Intelligent automation for inbox triage, scheduling, and communication
- A structured personal knowledge management system based on the PARA methodology

The application runs locally, with data stored on-device for privacy, while leveraging cloud AI and tool integrations when needed.

### 2.2 Core Value Proposition

| Traditional Approach | Orion Approach |
|---------------------|----------------|
| Manually check email, calendar, Slack | Unified prioritized inbox with AI triage |
| Remember to follow up on emails | Automatic action extraction and task creation |
| Search across tools to find context | Semantic memory recalls relevant history |
| Draft responses from scratch | AI-generated drafts matching your tone |
| Manually coordinate schedules | AI finds optimal meeting times |
| Organize files/notes by topic | PARA organizes by actionability |

**Key Differentiator**: Orion learns from your behavior. Every correction, preference, and pattern improves future interactions. It's not just a tool - it's a system that compounds in value over time.

### 2.3 Key Differentiators

1. **Local-First Architecture**: Data stays on your device, not in someone else's cloud
2. **PARA Methodology**: Proven organizational framework (Projects, Areas, Resources, Archives)
3. **Multi-Agent System**: Specialized AI agents for scheduling, communication, triage
4. **Semantic Memory**: BGE embeddings enable intelligent recall across sessions
5. **Preference Learning**: System improves through observed corrections
6. **Desktop Native**: Full macOS integration via Tauri (not a wrapped web app)

### 2.4 What's NOT in Scope (MVP)

| Out of Scope | Rationale | Future Consideration |
|--------------|-----------|---------------------|
| Multi-user/team features | Complexity; focus on single-user experience | v2.0 |
| Mobile application | Desktop-first for richer interactions | Post-MVP (Tauri mobile) |
| Web version | Local data model requires desktop | Maybe never |
| Payment/subscription | Free MVP for validation | Post-MVP |
| Custom AI model training | Too complex for MVP | v2.0 |
| Voice input | Nice-to-have, not core | v1.1 |
| Windows/Linux support | macOS first for quality | v1.5 |

---

## 3. User Personas

### 3.1 Primary Persona: "Alex the Overwhelmed Manager"

**Demographics:**
- Age: 32-45
- Role: Product Manager / Engineering Manager / Founder
- Company size: 50-500 employees
- Daily emails: 80-150
- Tech comfort: High (early adopter)

**Goals:**
- Zero inbox by end of each day
- Never miss important follow-ups
- Reduce time spent on email from 3 hours to 1 hour
- Better prepare for meetings with context
- Track project progress across tools

**Pain Points:**
- Spends first 2 hours of morning triaging email
- Important emails get buried in threads
- Forgets context from previous conversations with contacts
- Calendar conflicts and scheduling takes too long
- Notes/tasks scattered across Notion, Linear, email

**Behaviors:**
- Uses Gmail, Google Calendar, Slack daily
- Has tried various productivity apps (Notion, Superhuman, Linear)
- Values keyboard shortcuts and efficiency
- Willing to pay for tools that save time
- Privacy-conscious but pragmatic

**Quote:** "I feel like I work for my inbox instead of my inbox working for me. I know AI can help, but I don't want to send my data to another company."

### 3.2 Secondary Personas

#### "Sam the Startup Founder"
- Wears multiple hats (sales, product, hiring)
- 200+ emails daily from investors, candidates, customers
- Needs to track relationships across many contexts
- Values speed and getting things done quickly
- Budget-conscious but time-poor

#### "Jordan the Consultant"
- Works with multiple clients simultaneously
- Needs to switch context frequently
- Must track billable time and deliverables
- Professional communication is critical
- Organizes work by client/project

#### "Taylor the Executive Assistant"
- Manages calendar and inbox for executives
- Coordinates with many external contacts
- Handles scheduling conflicts daily
- Needs templates and consistent communication
- Values reliability over flashy features

---

## 4. User Stories & Jobs to Be Done

### 4.1 Projects (Active Work with Deadlines)

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| P-001 | P0 | As a user, I want to create projects with goals and deadlines so that I can track active work | Projects have name, description, deadline, status |
| P-002 | P0 | As a user, I want to see all tasks for a project so that I know what needs to be done | Task list grouped by status (todo, in-progress, done) |
| P-003 | P1 | As a user, I want to link contacts to projects as stakeholders so that I know who's involved | Contacts can be added with roles (owner, collaborator) |
| P-004 | P1 | As a user, I want to extract tasks from emails and add to projects so that nothing falls through cracks | Agent extracts action items, suggests project |
| P-005 | P1 | As a user, I want to see project progress at a glance so that I can prioritize | Progress bar based on completed tasks |
| P-006 | P2 | As a user, I want to archive completed projects so that I can focus on active work | Archive with reason, searchable in archive |

### 4.2 Areas (Ongoing Responsibilities)

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| A-001 | P0 | As a user, I want to define life areas (Career, Health, Finance) so that I can organize responsibilities | Areas can be created, edited, deleted |
| A-002 | P1 | As a user, I want to see all projects under an area so that I understand scope | Hierarchical view: Area > Projects > Tasks |
| A-003 | P1 | As a user, I want to set goals/standards for areas so that I can track maintenance | Goals field with optional metrics |
| A-004 | P2 | As a user, I want suggested areas during onboarding so that I can get started quickly | Common areas: Career, Health, Finance, Relationships, Home |
| A-005 | P2 | As a user, I want area-specific preferences so that behavior adapts per context | Different triage rules per area |

### 4.3 Resources (Reference Material)

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| R-001 | P0 | As a user, I want to store contacts with details so that I can find people easily | Contact fields: name, email, phone, company, notes |
| R-002 | P0 | As a user, I want to search contacts semantically so that I can find "the designer from TechConf" | Embedding-based search works |
| R-003 | P1 | As a user, I want to see interaction history with contacts so that I have context | Last email, meeting, interaction date |
| R-004 | P1 | As a user, I want to save templates for common communications so that I can respond faster | Template storage and retrieval |
| R-005 | P1 | As a user, I want to store learned preferences so that they persist | Preference storage with source (user/learned) |
| R-006 | P2 | As a user, I want to link contacts to organizations so that I understand relationships | Organization entity with contacts |

### 4.4 Archive (Inactive Items)

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| AR-001 | P1 | As a user, I want to search archived items so that I can find past work | Full-text + semantic search |
| AR-002 | P1 | As a user, I want to restore archived items if needed so that I can reactivate | Restore to original category |
| AR-003 | P2 | As a user, I want to know why something was archived so that I have context | Archive reason stored |

### 4.5 Inbox Triage

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| I-001 | P0 | As a user, I want to see all actionable items in one inbox so that I don't miss things | Unified view of email, calendar, Slack |
| I-002 | P0 | As a user, I want items prioritized automatically so that I focus on what matters | Priority score 0.0-1.0 per item |
| I-003 | P0 | As a user, I want to file items to projects/areas so that they're organized | Quick-file action with suggestions |
| I-004 | P1 | As a user, I want draft replies suggested so that I can respond faster | Agent-generated drafts |
| I-005 | P1 | As a user, I want to extract action items from emails so that I create tasks | Action extraction with confidence |
| I-006 | P1 | As a user, I want to bulk process inbox items so that I can triage efficiently | Multi-select + bulk actions |
| I-007 | P2 | As a user, I want to snooze items until later so that I handle them at the right time | Snooze with reminder |

### 4.6 Calendar Management

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| C-001 | P0 | As a user, I want to see my calendar events so that I know my schedule | Calendar view (day/week) |
| C-002 | P0 | As a user, I want to create events through chat so that scheduling is easy | "Schedule meeting with John" works |
| C-003 | P1 | As a user, I want AI to find mutual availability so that scheduling is automatic | Checks both calendars, suggests times |
| C-004 | P1 | As a user, I want to protect focus time so that I have deep work blocks | Auto-block focus time |
| C-005 | P2 | As a user, I want meeting prep context so that I'm prepared | Related emails, contact info surfaced |

### 4.7 Email Handling

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| E-001 | P0 | As a user, I want to read emails in Orion so that I don't switch apps | Email content displays |
| E-002 | P0 | As a user, I want to send emails through Orion so that I don't switch apps | Compose + send works |
| E-003 | P1 | As a user, I want AI-drafted replies so that I respond faster | Draft in my voice/tone |
| E-004 | P1 | As a user, I want drafts saved before sending so that I can review | Review before send |
| E-005 | P2 | As a user, I want email templates for common responses so that I'm consistent | Template insertion |

### 4.8 Memory & Recall

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| M-001 | P1 | As a user, I want Orion to remember my preferences so that I don't repeat myself | Preferences persist across sessions |
| M-002 | P1 | As a user, I want Orion to recall past decisions so that I'm consistent | Decision history searchable |
| M-003 | P1 | As a user, I want relevant context surfaced automatically so that I don't have to ask | Memory injection in prompts |
| M-004 | P2 | As a user, I want to see what Orion remembers about a contact so that I have context | Per-contact memory view |

---

## 5. Feature Requirements

### 5.1 Core Features (MVP)

#### 5.1.1 Chat Interface

**Description:** Primary interaction method - conversational AI with streaming responses

**User Stories Addressed:** All user stories (primary interface)

**Feature Details:**
- Split-screen layout: Chat panel (35%) + Canvas panel (65%)
- Message history with conversation threading
- Streaming responses with typing indicators
- Tool call visualization (collapsible cards)
- Suggested quick actions as chips
- Voice input placeholder (future)

**Acceptance Criteria:**
- [ ] Messages send and receive with <500ms latency to first token
- [ ] Responses stream in real-time
- [ ] Tool calls display with status (pending, success, error)
- [ ] Conversation history persists across sessions
- [ ] Keyboard shortcuts: Cmd+Enter to send, Cmd+K for palette

**Dependencies:** Agent integration (5.2)

---

#### 5.1.2 Inbox Triage

**Description:** Unified inbox with AI-powered prioritization and action extraction

**User Stories Addressed:** I-001 through I-007

**Feature Details:**
- Unified view pulling from Gmail, Slack, Calendar
- Priority score (0.0-1.0) with weighted factors:
  - Sender importance (contact relationship)
  - Urgency signals (deadlines, escalation language)
  - Action required (questions, requests)
  - Staleness (time since received)
- Action extraction: Tasks, events, decisions identified
- Filing suggestions based on content and contacts
- Bulk actions: Archive, file, snooze, create task

**Acceptance Criteria:**
- [ ] Items sync from Gmail within 30 seconds of arrival
- [ ] Priority scores calculated with explainable factors
- [ ] Actions extracted with 80%+ accuracy
- [ ] Filing suggestions match project/area 70%+ of time
- [ ] Bulk actions process 10+ items in <5 seconds

**Dependencies:** Composio integration (5.3.1)

---

#### 5.1.3 Calendar Management

**Description:** Calendar viewing, event creation, and intelligent scheduling

**User Stories Addressed:** C-001 through C-005

**Feature Details:**
- Week and day calendar views
- Event creation via chat ("schedule meeting with John")
- Availability checking (user's calendar + contact's if accessible)
- Smart time slot suggestions based on:
  - Mutual availability
  - Meeting duration preferences
  - Time-of-day preferences
  - Travel time between meetings
- Focus time protection with auto-blocking
- Meeting prep context (related emails, contact info)

**Acceptance Criteria:**
- [ ] Calendar displays events from Google Calendar
- [ ] Events created via chat appear in Google Calendar
- [ ] Availability check returns open slots within 3 seconds
- [ ] Focus time blocks respected by scheduling agent
- [ ] Meeting context includes last 3 interactions with attendees

**Dependencies:** Composio integration (5.3.2)

---

#### 5.1.4 Email Handling

**Description:** Read, compose, and send emails without leaving Orion

**User Stories Addressed:** E-001 through E-005

**Feature Details:**
- Email reading with full content rendering
- Rich text composer (TipTap)
- AI-generated draft replies
- Review-before-send workflow
- Draft saving and auto-save
- Attachment viewing (images, PDFs)

**Acceptance Criteria:**
- [ ] Emails render correctly (HTML, plain text, images)
- [ ] Composed emails send successfully via Gmail
- [ ] AI drafts generate in <5 seconds
- [ ] User can edit AI drafts before sending
- [ ] Attachments display inline where possible

**Dependencies:** Composio integration (5.3.1), TipTap

---

#### 5.1.5 Contact Management

**Description:** Contact database with semantic search and interaction history

**User Stories Addressed:** R-001 through R-006

**Feature Details:**
- Contact fields: name, email, phone, company, title, relationship
- Organization linking
- Semantic search ("the designer from TechConf")
- Interaction history (last email, meeting)
- Contact preferences (preferred channel, timezone)
- Auto-enrichment from email signatures

**Acceptance Criteria:**
- [ ] Contacts created with required fields
- [ ] Semantic search returns relevant contacts
- [ ] Last interaction date automatically updated
- [ ] Contact cards display in canvas on request
- [ ] New contacts auto-created from emails if unknown

**Dependencies:** SQLite database, BGE embeddings

---

#### 5.1.6 Task Management

**Description:** Tasks linked to projects with status tracking

**User Stories Addressed:** P-002, P-004, I-005

**Feature Details:**
- Task fields: title, description, status, priority, due date
- Project/area linking
- Source tracking (manual, Gmail, Linear)
- Status workflow: pending > in_progress > completed > cancelled
- Due date reminders
- Extracted tasks from email (with confirmation)

**Acceptance Criteria:**
- [ ] Tasks create, update, complete, delete
- [ ] Tasks display under associated project
- [ ] Overdue tasks highlighted
- [ ] Extracted tasks require user confirmation
- [ ] Task completion updates project progress

**Dependencies:** SQLite database

---

#### 5.1.7 Document Editing (TipTap)

**Description:** Rich text editing for notes, drafts, and documents

**User Stories Addressed:** E-002, E-003, E-005

**Feature Details:**
- WYSIWYG editor based on TipTap
- Formatting: bold, italic, headers, lists
- Code blocks with syntax highlighting
- Link handling
- Image embedding
- Markdown export/import

**Acceptance Criteria:**
- [ ] Editor renders in canvas panel
- [ ] Formatting controls work correctly
- [ ] Content saves automatically
- [ ] Markdown import/export works
- [ ] Editor handles 10,000+ word documents

**Dependencies:** TipTap library

---

#### 5.1.8 Visual Editing (Polotno) - Post-MVP

**Description:** Canvas-based visual editing for designs and diagrams

**User Stories Addressed:** (Post-MVP feature)

**Feature Details:**
- Drag-and-drop canvas
- Shape and text tools
- Image placement
- Export to PNG/PDF

**Note:** Deferred to post-MVP to manage scope.

---

#### 5.1.9 Memory/Recall System

**Description:** Semantic memory for preferences, decisions, and context

**User Stories Addressed:** M-001 through M-004

**Feature Details:**
- Learning storage (PostgreSQL with pgvector)
- BGE embeddings (bge-large-en-v1.5, 1024 dimensions)
- Hybrid search (text + vector with RRF fusion)
- Memory types:
  - `CONTACT_INFO` - Contact details and preferences
  - `USER_PREFERENCE` - Learned behaviors
  - `DECISION_RECORD` - Past decisions with rationale
  - `WORKING_SOLUTION` - What worked in the past
- Automatic injection in agent prompts
- Memory viewer for transparency

**Acceptance Criteria:**
- [ ] Learnings store with embeddings
- [ ] Recall returns relevant memories (RRF score > 0.02)
- [ ] Agent prompts include relevant memory context
- [ ] User can view what Orion remembers
- [ ] Preferences learned from corrections

**Dependencies:** PostgreSQL, BGE model

---

### 5.2 Agent System

#### 5.2.1 Butler Agent (Main Orchestrator)

**Role:** Primary agent that receives user requests, loads context, and delegates to specialists

**Key Behaviors:**
- PARA-first thinking: Classifies requests by actionability
- Context loading: Injects relevant projects, contacts, memory
- Smart routing: Delegates to specialist agents
- Preference learning: Observes corrections and stores patterns

**Delegation Matrix:**
| Intent Pattern | Delegate To | Context to Pass |
|----------------|-------------|-----------------|
| "Schedule...", "meeting with..." | Scheduler | Contact info, calendar |
| "Email...", "reply to...", "draft..." | Communicator | Contact preferences, templates |
| "What's in my inbox", "triage..." | Triage | Inbox items, priority rules |
| "Find...", "search for..." | Navigator | Search scope |
| General queries | Self-handle | Relevant context |

---

#### 5.2.2 Triage Agent

**Role:** Processes inbox items - scores priority, extracts actions, suggests filing

**Key Behaviors:**
- Priority scoring with weighted factors
- Action extraction from text patterns
- Entity linking (contacts, projects)
- Filing suggestions based on PARA

**Output Schema:**
```typescript
interface TriageResult {
  item_id: string;
  priority_score: number;  // 0.0-1.0
  urgency: 'urgent' | 'normal' | 'low';
  needs_response: boolean;
  suggested_response_by: string | null;
  detected_actions: Action[];
  related_project: string | null;
  filing_suggestion: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
}
```

---

#### 5.2.3 Scheduler Agent

**Role:** Calendar management - find times, schedule meetings, handle conflicts

**Key Behaviors:**
- Checks user calendar availability
- Checks contact calendar (if accessible)
- Applies scheduling preferences (no meetings before 10am, etc.)
- Handles conflicts with rebooking suggestions
- Creates calendar events with video links

**Tools Used:**
- `GOOGLECALENDAR_LIST_EVENTS`
- `GOOGLECALENDAR_CREATE_EVENT`
- `GOOGLECALENDAR_UPDATE_EVENT`

---

#### 5.2.4 Communicator Agent

**Role:** Drafts emails, Slack messages - maintains tone per contact

**Key Behaviors:**
- Matches user's writing tone
- Uses contact-specific preferences
- Applies templates where appropriate
- Draft-review-send workflow

**Tools Used:**
- `GMAIL_SEND_EMAIL`
- `GMAIL_CREATE_DRAFT`
- `SLACK_SEND_MESSAGE`

---

#### 5.2.5 Adapted Agents (From Continuous Claude)

| Original Agent | Orion Version | Adaptation |
|----------------|---------------|------------|
| scout | navigator | Search PARA structure instead of codebase |
| architect | planner | Plan personal projects instead of code |
| debug-agent | troubleshooter | Debug workflow issues |
| kraken | executor | Execute multi-step personal tasks |
| spark | quick-action | Fast single-action responses |
| phoenix | reorganizer | Reorganize PARA structure |
| critic | reviewer | Review communications before send |
| herald | notifier | Send notifications/alerts |

---

### 5.3 Integrations (Composio)

#### 5.3.1 Gmail (P0)

**Priority:** Must Have

**Capabilities:**
- `GMAIL_GET_EMAILS` - Fetch emails with filters
- `GMAIL_SEND_EMAIL` - Send new emails
- `GMAIL_CREATE_DRAFT` - Create drafts
- `GMAIL_SEARCH_EMAILS` - Search by query
- `GMAIL_DELETE_EMAIL` - Delete emails
- `GMAIL_GET_THREAD` - Get full conversation

**Use Cases:**
- Inbox sync for triage
- Email reading and sending
- Draft creation and editing
- Search for context

---

#### 5.3.2 Google Calendar (P0)

**Priority:** Must Have

**Capabilities:**
- `GOOGLECALENDAR_LIST_EVENTS` - Get events in range
- `GOOGLECALENDAR_CREATE_EVENT` - Create new events
- `GOOGLECALENDAR_UPDATE_EVENT` - Modify events
- `GOOGLECALENDAR_DELETE_EVENT` - Remove events
- `GOOGLECALENDAR_GET_FREE_BUSY` - Check availability

**Use Cases:**
- Calendar view display
- Meeting scheduling
- Availability checking
- Event creation via chat

---

#### 5.3.3 Slack (P1)

**Priority:** Should Have

**Capabilities:**
- `SLACK_SEND_MESSAGE` - Post messages
- `SLACK_LIST_CHANNELS` - Get available channels
- `SLACK_SEARCH_MESSAGES` - Search history
- `SLACK_GET_USER` - User info lookup

**Use Cases:**
- Inbox items from Slack mentions
- Sending messages through Orion
- Searching Slack context

---

#### 5.3.4 Other Integrations (P2)

| Integration | Priority | Use Case |
|-------------|----------|----------|
| Notion | P2 | Project/document sync |
| Linear | P2 | Task sync from engineering |
| Google Drive | P2 | File access and search |

---

## 6. Technical Requirements

### 6.1 Platform: macOS Desktop (Tauri)

**Framework:** Tauri 2.0 + Next.js 14

**Rationale:**
- Native macOS performance (Rust backend)
- Modern web UI (React/Next.js)
- Smaller bundle size than Electron (~10MB vs ~150MB)
- Better security model (capability-based permissions)
- Future mobile support (Tauri Mobile)

**System Requirements:**
- macOS 12 (Monterey) or later
- 4GB RAM minimum, 8GB recommended
- 500MB disk space for application
- Internet connection for AI and integrations

---

### 6.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              ORION APP                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     TAURI DESKTOP SHELL                          │    │
│  │  (Rust backend, WebView frontend)                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                 │                                        │
│         ┌───────────────────────┼───────────────────────┐               │
│         │                       │                       │               │
│  ┌──────▼──────┐        ┌───────▼───────┐       ┌───────▼───────┐      │
│  │  NEXT.JS    │        │   CLAUDE CLI  │       │   COMPOSIO    │      │
│  │   UI        │        │    AGENTS     │       │     MCP       │      │
│  │             │        │               │       │               │      │
│  │ - Chat      │        │ - Butler      │       │ - Gmail       │      │
│  │ - Canvas    │        │ - Triage      │       │ - Calendar    │      │
│  │ - PARA      │        │ - Scheduler   │       │ - Slack       │      │
│  │ - Settings  │        │ - Communicator│       │               │      │
│  └──────┬──────┘        └───────┬───────┘       └───────┬───────┘      │
│         │                       │                       │               │
│         └───────────────────────┼───────────────────────┘               │
│                                 │                                        │
│                    ┌────────────▼────────────┐                          │
│                    │      DATA LAYER          │                          │
│                    │                          │                          │
│                    │ SQLite      PostgreSQL   │                          │
│                    │ (local)     (memory)     │                          │
│                    │                          │                          │
│                    │ - Contacts   - Learnings │                          │
│                    │ - Tasks      - Embeddings│                          │
│                    │ - Inbox      - Sessions  │                          │
│                    │ - Prefs                  │                          │
│                    └──────────────────────────┘                          │
│                                 │                                        │
│                    ┌────────────▼────────────┐                          │
│                    │    FILE SYSTEM (PARA)    │                          │
│                    │                          │                          │
│                    │ ~/Orion/                 │                          │
│                    │ ├── projects/            │                          │
│                    │ ├── areas/               │                          │
│                    │ ├── resources/           │                          │
│                    │ ├── archive/             │                          │
│                    │ └── inbox/               │                          │
│                    └──────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 6.3 Database Architecture

#### 6.3.1 SQLite (Local Application Data)

**Location:** `~/Library/Application Support/Orion/orion.db`

**Tables:**
| Table | Purpose |
|-------|---------|
| `contacts` | People and organizations |
| `organizations` | Company data |
| `contact_methods` | Email, phone, social links |
| `projects` | PARA Projects |
| `areas` | PARA Areas |
| `tasks` | Todo items with source tracking |
| `inbox_items` | Unified action queue |
| `conversations` | Chat sessions |
| `messages` | Individual messages |
| `tool_connections` | Composio connection state |
| `preferences` | User settings + learned patterns |
| `resources` | General reference material |
| `entity_links` | Cross-references |

**Optimizations:**
- WAL mode for concurrent reads
- FTS5 for full-text search
- Indexes on frequently queried columns

#### 6.3.2 PostgreSQL (Shared Memory)

**Purpose:** Semantic memory with embeddings, cross-session persistence

**Tables (from opc/ infrastructure):**
| Table | Purpose |
|-------|---------|
| `archival_memory` | Learnings with 1024-dim embeddings |
| `sessions` | Multi-terminal coordination |
| `handoffs` | Session transfers |

**Vector Search:** pgvector extension for similarity search

---

### 6.4 AI Integration

#### 6.4.1 Claude API

**Model:** Claude Opus 4.5 (claude-opus-4-5-20251101)

**Features Used:**
| Feature | Use Case |
|---------|----------|
| Structured Outputs | Type-safe triage results, task extraction |
| Extended Thinking | Complex scheduling, conflict resolution |
| 200k Context | Long email threads, document analysis |
| canUseTool Callback | Approval workflow (reads auto, writes ask) |
| AskUserQuestion Tool | Clarification during agent execution |

**Beta Headers:**
- `structured-outputs-2025-11-13`
- `interleaved-thinking-2025-05-14`

#### 6.4.2 Embedding Model

**Model:** BGE (bge-large-en-v1.5)

**Dimensions:** 1024

**Use Cases:**
- Semantic contact search
- Memory recall
- Similar item finding

---

### 6.5 Key SDK Features to Use

| Feature | Implementation |
|---------|----------------|
| **Structured Outputs** | Guaranteed JSON schemas for triage, contacts, tasks |
| **Extended Thinking** | Complex scheduling/conflict resolution ("ultrathink") |
| **Context Fork Skills** | Isolated research operations (no context pollution) |
| **canUseTool Callback** | Smart routing (reads auto, writes ask) |
| **AskUserQuestion Tool** | Natural clarification/disambiguation flows |
| **File Checkpointing** | Safe PARA file modifications with undo |
| **Skills Hot-Reload** | Rapid skill development during MVP |
| **Agent-Scoped Hooks** | Per-agent security policies and audit logging |

---

## 7. UX/UI Requirements

### 7.1 Design Principles

1. **Task-Based Over Chat-First**
   - Chat for complex queries, buttons for common actions
   - Minimize typing for frequent operations
   - Keyboard shortcuts for power users

2. **Progressive Disclosure**
   - Show summary by default, details on demand
   - Collapse agent activity unless requested
   - Settings from simple to advanced

3. **Invisible PARA**
   - Agent uses PARA internally for organization
   - User never needs to learn "PARA methodology"
   - Benefits without jargon

4. **Suggest and Confirm**
   - AI suggests, user approves
   - No actions without user awareness
   - Undo available for mistakes

5. **Transparency in Agent Actions**
   - Show what agent is doing (collapsible)
   - Explain reasoning on request
   - Clear error messages with recovery options

6. **Local-First Feeling**
   - App feels snappy and responsive
   - Works offline for core features
   - Data clearly stays on device

### 7.2 Key Screens/Views

#### 7.2.1 Main Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Home  |  Inbox  |  Calendar  |  Projects  |  Settings    [User]│
├────────────────────────────┬────────────────────────────────────────────┤
│                            │                                            │
│      CHAT PANEL (35%)      │          CANVAS PANEL (65%)                │
│                            │                                            │
│  Conversation with agent   │  Dynamic content based on context:         │
│  Tool call indicators      │  - Email composer                          │
│  Suggested quick actions   │  - Calendar view                           │
│                            │  - Meeting scheduler                       │
│  ┌──────────────────────┐  │  - Contact details                         │
│  │ Type message...    🎤│  │  - Data tables                             │
│  └──────────────────────┘  │  - Forms (A2UI)                            │
│                            │                                            │
└────────────────────────────┴────────────────────────────────────────────┘
```

#### 7.2.2 Inbox View

- Left: Prioritized item list (sortable, filterable)
- Right: Preview panel with suggested actions
- Bottom: Bulk action toolbar
- Items grouped: "Needs Response" (urgent), "Informational"

#### 7.2.3 Calendar View

- Week view default, day view available
- Events color-coded by type
- Focus time blocks highlighted
- Quick-add event from chat

#### 7.2.4 Project View

- Project list with progress indicators
- Project detail with task list
- Stakeholder sidebar
- Linked tools/resources

#### 7.2.5 Onboarding Flow

- 5-step wizard with progress indicator
- Welcome > API Key > Connect Tools > Select Areas > Complete
- Skip options at each step
- Conversational tone

### 7.3 Interaction Patterns

#### 7.3.1 Agent Status Display

```
┌────────────────────────────────┐
│ 🎩 Butler [Working]            │
│ ├─📅 Scheduler                 │
│ │  └─ Checking availability... │
│ │     ✓ Your calendar checked  │
│ │     → Checking John's...     │
│ └─📧 Gmail                     │
│    └─ Fetching context         │
│                                │
│ [Collapse] [Cancel]            │
└────────────────────────────────┘
```

#### 7.3.2 Tool Call Cards

```
┌────────────────────────────────┐
│ 📧 Gmail                [Done] │
├────────────────────────────────┤
│ Fetched 3 threads from John    │
│ • Q1 Planning (2 days ago)     │
│ • Budget Review (1 week ago)   │
│                                │
│ [Show raw data ▼]              │
└────────────────────────────────┘
```

#### 7.3.3 Error Recovery

```
┌────────────────────────────────┐
│ ⚠️ Gmail Connection Issue      │
├────────────────────────────────┤
│ Couldn't send the email due to │
│ a temporary error.             │
│                                │
│ [Try Again] [Save Draft]       │
│ [Open Gmail]                   │
│                                │
│ Technical: 429 Rate Limit ▼    │
└────────────────────────────────┘
```

### 7.4 Accessibility Requirements

- Keyboard navigation throughout
- Screen reader compatible (ARIA labels)
- Color-blind friendly palette
- Minimum AA contrast ratios
- Focus indicators visible
- Reduced motion option

---

## 8. Success Metrics

### 8.1 Quantitative KPIs

| Metric | Target (MVP) | Measurement |
|--------|--------------|-------------|
| **Daily Active Users** | 10+ (beta testers) | Analytics |
| **Inbox Processing Time** | 50% reduction vs. manual | User survey |
| **Emails Sent via Orion** | 20+ per week per user | Event tracking |
| **Calendar Events Created** | 5+ per week per user | Event tracking |
| **Triage Accuracy** | 80% filing suggestions accepted | Acceptance rate |
| **App Launch Time** | < 3 seconds | Performance monitoring |
| **Crash Rate** | < 1% of sessions | Error tracking |
| **Memory Recall Relevance** | 70% helpful ratings | User feedback |

### 8.2 Qualitative Measures

| Measure | Method |
|---------|--------|
| User satisfaction with AI drafts | 5-star ratings on drafts |
| Trust in prioritization | Post-triage survey |
| Perceived time savings | Weekly check-in |
| Feature discovery | Onboarding completion rate |
| Learning curve | Time to first successful triage |

### 8.3 MVP Validation Criteria

**MVP is validated if:**

1. **Core Flow Works**: User can complete daily triage (inbox > prioritize > respond/file) entirely in Orion
2. **Users Return**: 60%+ of beta users return daily for 2+ weeks
3. **Time Saved**: Users self-report saving 30+ minutes/day
4. **Low Churn**: <20% of beta users abandon after first week
5. **Reliability**: 95%+ uptime, <5 critical bugs reported

---

## 9. Implementation Phases

### Phase 0: Foundation (Week 1)

**Goal:** Bootable desktop app with basic structure

**Deliverables:**
- Tauri + Next.js project scaffolding
- Shell permissions configured
- shadcn/ui components installed
- Basic routing structure

**Exit Criteria:**
- `pnpm tauri dev` launches desktop window
- Basic routes render

---

### Phase 1: Core Infrastructure (Week 2-4)

**Goal:** Split-screen UI + database + agent connection

**Deliverables:**
- Chat + Canvas split-screen layout
- SQLite schema implemented
- Claude CLI integration working
- Basic chat functional

**Exit Criteria:**
- Send message, receive streamed response
- Data persists in SQLite
- Keyboard shortcuts work

---

### Phase 2: Core Features (Week 5-8)

**Goal:** Inbox, calendar, email, contacts working

**Deliverables:**
- Composio integrations (Gmail, Calendar)
- Inbox view with sync
- Triage agent processing
- Email reading/sending
- Contact database

**Exit Criteria:**
- Inbox syncs from Gmail
- Emails send successfully
- Calendar events create
- Contacts searchable

---

### Phase 3: Integrations & Agents (Week 9-10)

**Goal:** Full agent system + PARA structure

**Deliverables:**
- Scheduler, Communicator agents
- PARA views (Projects, Areas)
- A2UI canvas components
- Slack integration (P1)

**Exit Criteria:**
- "Schedule meeting" works end-to-end
- Projects display with tasks
- Dynamic canvas renders

---

### Phase 4: Polish & Validation (Week 11-12)

**Goal:** Production-ready MVP

**Deliverables:**
- Onboarding flow
- Settings pages
- Memory system integration
- Error handling
- Performance optimization
- Documentation

**Exit Criteria:**
- New user can complete onboarding
- App handles errors gracefully
- Performance targets met
- DMG installer works

---

### Timeline Summary

| Phase | Weeks | Focus |
|-------|-------|-------|
| Phase 0 | 1 | Project setup |
| Phase 1 | 2-4 | Core infrastructure |
| Phase 2 | 5-8 | Core features |
| Phase 3 | 9-10 | Integrations & agents |
| Phase 4 | 11-12 | Polish & validation |
| **Total** | **12 weeks** | |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Claude CLI spawn latency** | Medium | High | Cache subprocess, reuse sessions, add loading states |
| **Composio rate limits** | Medium | High | Batch requests, exponential backoff, queue system |
| **A2UI React renderer immature** | High | Medium | Start with custom components, add A2UI progressively |
| **Tauri learning curve** | Medium | Medium | Follow official tutorials, use TypeScript bindings |
| **SQLite concurrent access** | Low | Medium | WAL mode, connection pooling |
| **OAuth token refresh** | Medium | Low | Add refresh hook, graceful re-auth flow |

### 10.2 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Triage accuracy too low** | Medium | High | Configurable rules, user corrections feed learning |
| **Users don't trust AI actions** | Medium | High | Confirm-before-send for writes, transparency |
| **Feature creep** | High | Medium | Strict MVP scope, defer to post-MVP list |
| **Privacy concerns** | Low | High | Local-first architecture, clear data policies |
| **Learning curve too high** | Medium | Medium | Guided onboarding, skip options, progressive disclosure |

### 10.3 Mitigation Strategies

1. **For latency issues**: Add skeleton loading states, optimistic UI updates
2. **For accuracy issues**: Collect feedback, retrain on corrections
3. **For trust issues**: Always allow undo, show reasoning
4. **For scope creep**: Maintain "won't do" list, defer diplomatically
5. **For learning curve**: Invest in onboarding, add contextual help

### 10.4 Pre-Mortem Mitigations (2026-01-13)

#### TIGER 1: No Rollback/Undo Strategy for Agent Actions

**Risk:** If triage agent files email to wrong project or scheduler double-books, no clear undo path.

**Mitigation (Added to Phase 1):**
- Implement `action_log` table to record all agent actions with before/after state
- Add "Undo Last Action" button in UI (Cmd+Z for keyboard users)
- Store reversible action metadata: `{ action_type, entity_id, previous_state, new_state, timestamp }`
- For irreversible actions (sent emails), show confirmation with 5-second cancel window

**Schema Addition:**
```sql
CREATE TABLE action_log (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,  -- 'file_email', 'create_event', 'send_email'
    entity_type TEXT NOT NULL,  -- 'inbox_item', 'calendar_event', 'task'
    entity_id TEXT NOT NULL,
    previous_state TEXT,        -- JSON snapshot
    new_state TEXT,             -- JSON snapshot
    reversible INTEGER DEFAULT 1,
    reversed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

#### TIGER 2: Composio Rate Limits Unknown

**Risk:** If rate limited during inbox sync (50+ emails), UX degrades.

**Mitigation (Added to Phase 2):**
- Add `tool_rate_limits` table to track limits per tool
- Implement request queue with priority (user-initiated > background sync)
- Pre-flight rate limit check before batch operations
- Degrade gracefully: show "Syncing paused, will resume in X minutes" instead of errors
- Query Composio for rate limit headers on first connection and cache

**Implementation:**
```typescript
// Rate limit aware execution
const rateLimiter = new RateLimiter({
  gmail: { requestsPerMinute: 60, burstLimit: 10 },
  calendar: { requestsPerMinute: 100, burstLimit: 20 },
});

async function syncInbox() {
  if (!rateLimiter.canProceed('gmail')) {
    showNotification('Sync paused - resuming in ' + rateLimiter.getWaitTime('gmail'));
    return;
  }
  // Proceed with sync
}
```

#### Accepted Risks (Elephants)

1. **12-week timeline vs 4,700+ lines of spec** - Accepted. Will prioritize ruthlessly and cut scope if needed. Weekly checkpoint to reassess.
2. **Single-user hardcoded ('orion-user')** - Accepted for MVP. Added TODO comment in code for future multi-user refactor.

---

## 11. Open Questions

### 11.1 Unresolved Decisions

| Question | Options | Leaning | Decision Needed By |
|----------|---------|---------|-------------------|
| How to handle multiple Gmail accounts? | Single account MVP vs. multi-account | Single for MVP | Phase 2 start |
| Should Orion auto-archive processed items? | Auto vs. manual vs. configurable | Configurable | Phase 2 |
| How to handle offline mode? | Full offline vs. read-only vs. queue actions | Read-only + queue | Phase 4 |
| Voice input priority? | MVP vs. v1.1 | v1.1 | Already decided |

### 11.2 Questions Requiring User Research

1. What's the ideal default triage priority threshold?
2. How many suggested draft iterations before user gives up?
3. Do users want to see the PARA organization or keep it hidden?
4. What keyboard shortcuts do Superhuman/Gmail users expect?

### 11.3 Questions Requiring Technical Investigation

1. Can we run BGE embeddings locally or need API?
2. What's the Composio rate limit for our use case?
3. How to handle Tauri auto-updates with code signing?
4. Best approach for A2UI React renderer?

---

## 12. Appendices

### 12.1 Glossary

#### PARA Terms

| Term | Definition |
|------|------------|
| **PARA** | Projects, Areas, Resources, Archives - organizational framework |
| **Project** | Active work with a defined goal AND deadline |
| **Area** | Ongoing responsibility with a standard to maintain |
| **Resource** | Reference material with no active responsibility |
| **Archive** | Inactive items from other categories |
| **Inbox** | Capture zone for unprocessed items |

#### Technical Terms

| Term | Definition |
|------|------------|
| **Tauri** | Rust-based desktop application framework |
| **A2UI** | Agent-to-UI - Google's protocol for agent-generated interfaces |
| **Composio** | Platform for AI tool integrations (500+ apps) |
| **BGE** | BAAI General Embedding - open-source embedding model |
| **RRF** | Reciprocal Rank Fusion - method for combining search rankings |
| **FTS5** | SQLite's Full-Text Search extension |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **TipTap** | Open-source rich text editor framework |
| **MCP** | Model Context Protocol - Anthropic's tool integration standard |

### 12.2 References to Detailed Research

| Document | Location | Content |
|----------|----------|---------|
| Master Design Decisions | `thoughts/research/ORION-DESIGN-CONSOLIDATED.md` | All finalized decisions |
| Architecture Overview | `thoughts/research/ORION-MASTER-RESEARCH.md` | System architecture |
| UX Research | `thoughts/research/orion-ux-deep-dive.md` | UX patterns and research |
| UI Design | `thoughts/research/orion-ui-design.md` | Screen designs, A2UI |
| Database Schema | `thoughts/research/database-schema-design.md` | Full SQLite schema |
| Composio Guide | `thoughts/research/composio-deep-dive.md` | Tool integration details |
| PARA Framework | `thoughts/research/PARA-DEEP-DIVE-SYNTHESIS.md` | PARA methodology |
| MVP Implementation Plan | `thoughts/shared/plans/PLAN-orion-mvp.md` | Phase-by-phase plan |

### 12.3 Agent Prompts (Summary)

**Butler Agent**: Routes requests, loads context, delegates to specialists, learns preferences

**Triage Agent**: Scores priority (0.0-1.0), extracts actions, suggests filing, handles bulk processing

**Scheduler Agent**: Checks availability, suggests times, creates events, handles conflicts

**Communicator Agent**: Drafts emails/messages, matches user tone, applies templates

### 12.4 Schema Summary (Key Tables)

```sql
-- Core entities
contacts (id, name, organization_id, relationship, embedding)
projects (id, name, area_id, deadline, status, stakeholders)
areas (id, name, responsibilities, goals)
tasks (id, title, project_id, status, due_date, source_tool)
inbox_items (id, source_tool, priority_score, needs_response, processed)

-- Support tables
preferences (category, key, value, source, confidence)
tool_connections (tool_name, account_alias, status)
entity_links (source_type, source_id, target_type, target_id, relationship)
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Product Team | Initial PRD created |

---

*This PRD synthesizes research from the Orion design documents. For detailed implementation guidance, refer to the documents in `thoughts/research/` and `thoughts/shared/plans/`.*
