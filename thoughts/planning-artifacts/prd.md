# Product Requirements Document: Orion Personal Butler

**Version:** 1.3
**Status:** Draft
**Date:** 2026-01-13
**Last Updated:** 2026-01-15
**Author:** Product & Engineering Team

### Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.4 | 2026-01-20 | Added §5.4 Claude Agent SDK Harness (CC v3 Infrastructure) - Skills, Hooks, BDI Agents, Sessions |
| 1.3 | 2026-01-15 | Expanded §6.5 with Claude Agent SDK capabilities (Built-in Tools, MCP Config, Prompt Caching, Extended Thinking) |
| 1.2 | 2026-01-14 | Added Orion Design System (§7.1.1), updated layout to match design tokens |
| 1.1 | 2026-01-14 | Added json-render (§5.1.8), replaced A2UI references, updated risks & glossary |
| 1.0 | 2026-01-13 | Initial PRD with full feature requirements |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [User Personas](#3-user-personas)
4. [User Stories & Jobs to Be Done](#4-user-stories--jobs-to-be-done)
5. [Feature Requirements](#5-feature-requirements)
   - 5.1 [Core Features (MVP)](#51-core-features-mvp)
   - 5.2 [Agent System](#52-agent-system)
   - 5.3 [Integrations (Composio)](#53-integrations-composio)
   - 5.4 [Claude Agent SDK Harness (CC v3)](#54-claude-agent-sdk-harness-cc-v3-infrastructure) ⭐ NEW
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
| Custom AI model training | Too complex for MVP | v2.0 |
| Voice input | Nice-to-have, not core | v1.1 |
| Windows/Linux support | macOS first for quality | v1.5 |

### 2.5 Monetization (Updated 2026-01-14)

**IN SCOPE for MVP:**

| Feature | Implementation |
|---------|----------------|
| Stripe payments (USD) | Checkout + Customer Portal |
| USDC payments | Stripe Crypto On-Ramp |
| Usage-based billing | Track API calls per user |
| Free tier | 1,000 API calls/month |
| Pro tier | 10,000 API calls/month ($29/mo) |

**Claude API Strategy:** Proxied through Supabase Edge Functions. Users don't need their own Anthropic API key. Usage tracked and metered per user.

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
- [ ] Messages send and receive with <500ms latency to first token (p95)
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
- [ ] Semantic search returns relevant contacts (80%+ precision in top 5 results)
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

#### 5.1.8 Dynamic AI UI (json-render)

**Description:** AI-generated structured UI components rendered in chat and canvas panels

**User Stories Addressed:** All agent-interaction stories (triage, scheduling, email composition)

**Feature Details:**
- **json-render** library from Vercel Labs for guardrailed AI UI generation
- Zod-based component catalog with 27 components:
  - Layout: Card, Row, Column, Divider
  - Display: Text, Badge, Avatar, ProgressIndicator
  - Interactive: Button, TextField, Select, RadioGroup, Checkbox, DatePicker, TimePicker
  - Orion-specific: EmailComposer, CalendarSlotPicker, InboxItem, TriagePanel, TaskList, etc.
- Streaming support via `useUIStream` hook for progressive rendering
- Action system for declarative interactions (send_email, schedule_meeting, etc.)
- Data binding via `valuePath` for reactive form fields

**Canvas Mode Integration:**
| Mode | Technology | Use Case |
|------|------------|----------|
| `json-render` | json-render | AI-generated structured UI (forms, pickers, cards) |
| `document` | TipTap | User-authored rich text (emails, docs) |
| `design` | Polotno | User-authored visual content (designs, photos) |
| `calendar` | Custom | Calendar views |

> **Note:** json-render replaces the originally planned A2UI integration. A2UI was not available for React at time of implementation (2026-01-14).

**Acceptance Criteria:**
- [ ] Component catalog validates with Zod schemas
- [ ] Streaming renders UI progressively as agent responds
- [ ] Actions trigger correctly (email, calendar, task operations)
- [ ] json-render components embed TipTap/Polotno where appropriate
- [ ] Agent system prompt includes catalog schema

**Dependencies:** @json-render/core, @json-render/react, Zod 4.x

**Reference:** `thoughts/shared/plans/PLAN-json-render-integration.md`

---

#### 5.1.9 Visual Editing (Polotno) - Post-MVP

**Description:** Canvas-based visual editing for designs, photos, and videos

**User Stories Addressed:** (Post-MVP feature)

**Feature Details:**
- Drag-and-drop canvas
- Shape and text tools
- Image placement
- Export to PNG/PDF

**Note:** Deferred to post-MVP to manage scope. Will integrate as a canvas mode alongside json-render and TipTap.

---

#### 5.1.10 Areas Management

**Description:** Ongoing responsibility tracking with standards and goals

**User Stories Addressed:** A-001 through A-005

**Feature Details:**
- Area fields: name, description, goals/standards, status
- Hierarchical view: Area > Projects > Tasks
- Area-specific preferences and triage rules
- Suggested areas during onboarding (Career, Health, Finance, Relationships, Home)
- Area metrics/standards tracking

**Acceptance Criteria:**
- [ ] Areas create, edit, delete with required fields
- [ ] Projects display under associated area
- [ ] Area goals/standards stored and editable
- [ ] Onboarding suggests common areas
- [ ] Area-specific preferences apply to triage

**Dependencies:** SQLite database, PARA structure

---

#### 5.1.10 Archive Management

**Description:** Inactive item storage with search and restore capabilities

**User Stories Addressed:** AR-001 through AR-003

**Feature Details:**
- Archive from any PARA category (Projects, Areas, Resources)
- Archive reason/context stored
- Full-text and semantic search across archive
- Restore to original category
- Archive audit log

**Acceptance Criteria:**
- [ ] Items archive with reason field
- [ ] Archived items searchable via text and semantic search
- [ ] Archive search returns relevant items (80%+ precision)
- [ ] Items restore to original category
- [ ] Archive history viewable

**Dependencies:** SQLite database, BGE embeddings

---

#### 5.1.11 Memory/Recall System

**Description:** Semantic memory for preferences, decisions, and context

**User Stories Addressed:** M-001 through M-004

**Feature Details:**
- Learning storage (PostgreSQL with pgvector)
- BGE embeddings (BGE-M3, 1024 dimensions, 8192 token context, 100+ languages)
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

### 5.4 Claude Agent SDK Harness (CC v3 Infrastructure)

Orion leverages the battle-tested **Continuous Claude v3** infrastructure for skills, hooks, and agent orchestration. This section defines how Orion extends the existing 115+ skills, 20+ hooks, and 20+ agents rather than building from scratch.

**Philosophy:** The Claude Agent SDK is THE core product architecture, not an implementation detail. Orion is a harness that maximizes every SDK capability.

#### 5.4.1 Skills Library

Skills are modular knowledge units that load dynamically based on context. Orion inherits all CC v3 skills and adds Butler-specific skills.

**Skill File Structure:**
```
.claude/skills/
├── butler-inbox-process/
│   ├── SKILL.md           # Main skill definition
│   └── references/        # Large reference docs (if needed)
├── butler-calendar-manage/
│   └── SKILL.md
├── butler-briefing-generate/
│   └── SKILL.md
└── [115+ inherited CC v3 skills]
```

**Butler-Specific Skills (NEW):**

| Skill | Activation | Purpose | User Stories |
|-------|------------|---------|--------------|
| `butler-inbox-process` | `/inbox` or auto on "triage", "inbox", "email" | Inbox triage workflow with priority scoring | I-001 to I-007 |
| `butler-calendar-manage` | `/calendar` or auto on "schedule", "meeting" | Calendar operations with preferences | C-001 to C-005 |
| `butler-email-compose` | `/email` or auto on "draft", "reply", "send" | Email drafting with tone matching | E-001 to E-005 |
| `butler-briefing-generate` | `/briefing` or auto on "morning", "summary" | Daily briefing generation | M-003 |
| `butler-memory-context` | Auto (hook-triggered) | User context injection | M-001 to M-004 |
| `butler-preference-learn` | Auto on corrections | Preference pattern extraction | M-001 |
| `butler-task-delegate` | Auto (agent routing) | PARA-based task routing | P-004, I-005 |

**Inherited CC v3 Skills (Key Examples):**

| Skill | Use in Orion |
|-------|--------------|
| `recall` | Memory retrieval for contact context |
| `remember` | Store user preferences and decisions |
| `research` | External research for meeting prep |
| `tldr-code` | Token-efficient context loading |
| `create_handoff` | Session handoff between contexts |
| `agentic-workflow` | Multi-agent orchestration patterns |

**Skill Activation System:**

Skills activate via `skill-rules.json`:
```json
{
  "butler-inbox-process": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": {
      "keywords": ["inbox", "triage", "email priority", "what's urgent"],
      "intentPatterns": ["process.*inbox", "prioritize.*email"]
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Butler skills follow CC v3 SKILL.md format (YAML frontmatter + markdown)
- [ ] Skills activate on keyword/intent patterns
- [ ] Progressive disclosure works (metadata → full instructions → references)
- [ ] Skills can invoke inherited CC v3 skills (e.g., `butler-briefing-generate` uses `recall`)

---

#### 5.4.2 Hooks Pipeline

Hooks intercept SDK events for security, context injection, and audit logging. Orion inherits the CC v3 hook infrastructure and adds Butler-specific hooks.

**Hook Events Used:**

| Event | Purpose | Butler Hooks |
|-------|---------|--------------|
| **SessionStart** | Initialize session context | `butler-session-start` - Load user profile, preferences, PARA structure |
| **PreToolUse** | Validate/block tool calls | `butler-tool-permission` - Permission system, `butler-context-inject` - Inject context before Task spawn |
| **PostToolUse** | Process results, audit | `butler-audit-log` - Log Gmail/Calendar operations |
| **SessionEnd** | Cleanup, save state | `butler-preference-sync` - Save learned preferences |
| **SubagentStart** | Configure subagent | Cost budgets, context injection |
| **SubagentStop** | Process subagent results | Aggregate results, update parent context |
| **PreCompact** | Context compaction | Preserve PARA structure in summary |
| **PermissionRequest** | Custom approval flow | Auto-approve Gmail reads, prompt sends |

**Butler-Specific Hooks (NEW):**

| Hook | Event | Implementation | Purpose |
|------|-------|----------------|---------|
| `butler-session-start.ts` | SessionStart | TypeScript | Load user profile, preferences, active projects, recent contacts |
| `butler-context-inject.ts` | PreToolUse (Task) | TypeScript | Inject Butler context before spawning subagents |
| `butler-tool-permission.ts` | PreToolUse | TypeScript | Permission system: auto-approve reads, prompt writes |
| `butler-audit-log.ts` | PostToolUse | TypeScript | Log all external tool calls (Gmail, Calendar, Slack) |
| `butler-preference-sync.ts` | SessionEnd | TypeScript | Extract and save learned preferences |
| `butler-para-compact.ts` | PreCompact | TypeScript | Preserve PARA structure during context compaction |

**Hook Registration (settings.json):**
```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/dist/butler-session-start.mjs"
      }]
    }],
    "PreToolUse": [{
      "matcher": "Task",
      "hooks": [{
        "type": "command",
        "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/dist/butler-context-inject.mjs"
      }]
    }, {
      "matcher": "mcp__composio__gmail_send|mcp__composio__calendar_create",
      "hooks": [{
        "type": "command",
        "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/dist/butler-tool-permission.mjs"
      }]
    }],
    "PostToolUse": [{
      "matcher": "mcp__composio__*",
      "hooks": [{
        "type": "command",
        "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/dist/butler-audit-log.mjs"
      }]
    }]
  }
}
```

**Hook Output Pattern:**
```typescript
interface HookOutput {
  decision?: "allow" | "block";
  reason?: string;
  systemMessage?: string;  // Inject context into Claude
  hookSpecificOutput?: {
    hookEventName: string;
    permissionDecision?: "allow" | "deny" | "ask";
    updatedInput?: object;  // Modify tool input
  };
}
```

**Inherited CC v3 Hooks (Key Examples):**

| Hook | Use in Orion |
|------|--------------|
| `memory-awareness.js` | Load relevant memories at session start |
| `file-claims.sh` | Cross-terminal file locking |
| `epistemic-reminder.mjs` | Verify claims after searches |
| `skill-activation-prompt.mjs` | Show available Butler skills |

**Acceptance Criteria:**
- [ ] Hooks follow CC v3 TypeScript pattern (stdin JSON → stdout JSON)
- [ ] Hooks compile to ESM bundles via esbuild
- [ ] SessionStart injects user profile, preferences, PARA structure
- [ ] PreToolUse blocks sensitive operations (Gmail send) without user approval
- [ ] PostToolUse logs all external tool calls to `action_log` table
- [ ] Hooks can inject `systemMessage` for context

---

#### 5.4.3 Agent Architecture (BDI Mental States)

Orion agents use explicit **Belief-Desire-Intention (BDI)** structures for auditable, debuggable reasoning. This pattern from context engineering fundamentals ensures agents produce structured outputs.

**BDI Pattern:**
```yaml
# Agent outputs structured mental states
beliefs:
  sender_importance: high        # From contact lookup
  project_relevance: true        # Matches active project "Q4 Expansion"
  urgency_signals: ["deadline mentioned", "ASAP"]
  historical_context: "Last email was about budget approval"

desires:
  - accurate_priority_score      # Primary goal
  - actionable_categorization    # Secondary goal
  - suggest_appropriate_filing   # Tertiary goal

intentions:
  - priority: 0.85               # Committed action
  - action: respond_today        # Committed action
  - para_location: "projects/q4-expansion"  # Committed action
  - suggested_response: "Acknowledge receipt, confirm timeline"
```

**Butler Agents with BDI:**

| Agent | Beliefs (What it knows) | Desires (Goals) | Intentions (Actions) |
|-------|------------------------|-----------------|---------------------|
| **Butler (Orchestrator)** | User context, active projects, request type | Route efficiently, maintain context | Delegate to specialist, inject context |
| **Triage Agent** | Sender identity, urgency signals, project relevance | Accurate priority, complete extraction | Priority score, action list, filing suggestion |
| **Scheduler Agent** | Calendar availability, contact preferences, meeting patterns | Find optimal time, avoid conflicts | Time slots, event creation, conflict resolution |
| **Communicator Agent** | Contact tone history, user writing style, templates | Match tone, convey intent | Draft email, apply template, suggest edits |
| **Navigator Agent** | PARA structure, search scope, query intent | Find relevant info, minimize noise | Search results, relevance ranking |

**Agent Definition Format (.claude/agents/butler-core.md):**
```markdown
---
name: butler-core
description: Main Butler orchestrator using PARA-first thinking
model: opus
tools: [Read, Glob, Grep, Task, mcp__orion__*]
---

# Butler Core Agent

You are the main Orion Butler orchestrator.

## Mental Model (BDI)

Before responding, structure your reasoning:

### Beliefs (What I know)
- User's active projects: [load from context]
- User's preferences: [load from memory]
- Request type: [classify: triage/schedule/communicate/search]

### Desires (What I want to achieve)
- Primary: [main goal based on request]
- Secondary: [supporting goals]

### Intentions (What I will do)
- Immediate action: [specific next step]
- Delegation: [which specialist agent, if any]

## Routing Rules

| Intent Pattern | Delegate To | Context to Pass |
|----------------|-------------|-----------------|
| "Schedule...", "meeting with..." | scheduler-agent | Contact info, calendar context |
| "Email...", "reply to...", "draft..." | communicator-agent | Contact preferences, templates |
| "What's in my inbox", "triage..." | triage-agent | Inbox items, priority rules |
| "Find...", "search for..." | navigator-agent | Search scope |
| General queries | Self-handle | Full context |

## Output Format

Always output your BDI state before taking action:
\`\`\`yaml
beliefs: { ... }
desires: [ ... ]
intentions: [ ... ]
\`\`\`
```

**Progressive Context Loading:**

Agents load context in layers to save tokens:
```
L1: Metadata only (85% token savings)
    - Item: sender, subject, date
    - Contact: name, relationship

L2: Add context (if high potential priority)
    - Contact: company, last interaction
    - Project: linked project if any

L3: Full content (only for high-priority)
    - Full email body
    - Thread history

L4: Historical context (only when needed)
    - Past decisions with this contact
    - Related project history
```

**Acceptance Criteria:**
- [ ] All Butler agents output BDI structure in reasoning
- [ ] Agents use progressive context loading (L1 → L2 → L3 → L4)
- [ ] Agent outputs are structured (TriageResult, ScheduleResult, etc.)
- [ ] Agents can spawn other agents via Task tool
- [ ] Agent reasoning is auditable (BDI state logged)

---

#### 5.4.4 Session Management

Sessions enable conversation continuity, resume, and isolation.

**Session Types:**

| Type | Naming Convention | Use Case |
|------|-------------------|----------|
| **Daily Session** | `orion-daily-2026-01-20` | General daily work (auto-resume same day) |
| **Project Session** | `orion-project-q4-expansion` | Focused project work |
| **Inbox Session** | `orion-inbox-2026-01-20` | Inbox triage context |
| **Ad-hoc Session** | `orion-adhoc-{uuid}` | One-off queries |

**Session Capabilities:**

| Feature | Implementation | Use Case |
|---------|----------------|----------|
| **Resume** | `resume: sessionId` option | Continue interrupted work |
| **Fork** | `forkSession: true` option | "What-if" scenarios without affecting original |
| **Search** | Query session metadata | "Find sessions about Q4 planning" |
| **Export** | JSONL transcript | Audit trail, handoffs |

**Session State Storage:**
```
~/.claude/projects/<project-hash>/
├── orion-daily-2026-01-20.jsonl
├── orion-project-q4-expansion.jsonl
└── sessions-index.json  # Metadata for search
```

**Session Resume Logic:**
```typescript
async function getOrCreateSession(type: 'daily' | 'project' | 'inbox', context?: string) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const sessionId = type === 'daily'
    ? `orion-daily-${today}`
    : type === 'inbox'
    ? `orion-inbox-${today}`
    : `orion-project-${slugify(context)}`;

  const existingSession = await findSession(sessionId);

  if (existingSession && isSameDay(existingSession.lastActive, new Date())) {
    return { resume: sessionId };  // Resume existing
  }

  return { sessionId };  // New session
}
```

**Acceptance Criteria:**
- [ ] Daily sessions auto-resume within same day
- [ ] Project sessions persist across days
- [ ] User can list all sessions (`/sessions` skill)
- [ ] Sessions include full tool call history
- [ ] Sessions survive app restart
- [ ] Fork creates copy with new ID

---

#### 5.4.5 Context Compaction Strategy

Long conversations (inbox triage with 50+ emails) will hit context limits. The SDK's auto-compaction preserves context while staying within token limits.

**Compaction Configuration:**
```typescript
{
  enableCompaction: true,
  contextTokenThreshold: 75000,  // 50-75% of Opus 200k window

  hooks: {
    PreCompact: [{
      callback: async (history) => {
        // Custom: Preserve PARA structure and user preferences
        return {
          customSummary: await generateOrionContextSummary(history)
        };
      }
    }]
  }
}
```

**Orion-Specific Compaction Rules:**

| Preserve | Discard | Rationale |
|----------|---------|-----------|
| Active projects list | Old resolved email threads | Projects define current context |
| User preferences | Completed inbox items | Preferences apply to future work |
| Contact relationships | Raw tool call outputs | Relationships persist |
| BDI reasoning traces | Verbose search results | Reasoning aids debugging |
| Current session goals | Superseded decisions | Goals guide next actions |

**Custom Summary Format:**
```xml
<orion_context_summary>
  <active_projects>
    <project id="q4-expansion" deadline="2026-03-31">Q4 Strategic Expansion</project>
  </active_projects>
  <user_preferences>
    <preference key="email_tone">professional but warm</preference>
    <preference key="meeting_times">prefer afternoons</preference>
  </user_preferences>
  <session_state>
    <processed_items>42</processed_items>
    <pending_actions>3</pending_actions>
    <current_focus>inbox triage</current_focus>
  </session_state>
</orion_context_summary>
```

**Acceptance Criteria:**
- [ ] Compaction triggers at 75k tokens
- [ ] PreCompact hook generates Orion-specific summary
- [ ] PARA structure preserved in summary
- [ ] User preferences preserved in summary
- [ ] Compaction is transparent to user (no visible interruption)

---

#### 5.4.6 Permission Architecture

Orion uses the SDK's permission modes with custom `canUseTool` logic for fine-grained control.

**Permission Modes by Agent:**

| Agent | Mode | Behavior |
|-------|------|----------|
| **Butler (Main)** | `default` | Reads auto, writes prompt |
| **Triage Agent** | `plan` | Read-only analysis (no writes) |
| **Scheduler Agent** | `default` → `acceptEdits` | Prompts for time, then auto-creates event |
| **Communicator Agent** | `default` | Drafts auto, sends prompt |
| **Navigator Agent** | `plan` | Search only (no modifications) |

**Custom Permission Rules (via PreToolUse hooks):**

| Rule | Tools | Behavior |
|------|-------|----------|
| **Auto-approve reads** | `mcp__composio__gmail_get_*`, `mcp__composio__calendar_list_*` | Allow without prompt |
| **Prompt for writes** | `mcp__composio__gmail_send_*`, `mcp__composio__calendar_create_*` | Require user confirmation |
| **Block sensitive files** | `Read`, `Write`, `Edit` | Deny access to `.env`, `credentials.*`, `*secret*` |
| **Block dangerous Bash** | `Bash` | Deny `rm -rf`, `sudo`, `chmod 777` |
| **Auto-approve PARA** | `Read`, `Write` | Allow within `~/Orion/` directory |

**canUseTool Callback:**
```typescript
const canUseTool = async (toolName: string, input: object) => {
  // Auto-approve reads
  if (toolName.match(/gmail_get|calendar_list|gmail_search/)) {
    return { decision: 'allow' };
  }

  // Prompt for writes
  if (toolName.match(/gmail_send|calendar_create|slack_send/)) {
    return {
      decision: 'ask',
      message: `Orion wants to ${formatAction(toolName, input)}. Allow?`
    };
  }

  // Block dangerous operations
  if (isDangerous(toolName, input)) {
    return { decision: 'deny', reason: 'Operation blocked by security policy' };
  }

  return { decision: 'allow' };
};
```

**Acceptance Criteria:**
- [ ] Triage agent cannot write (plan mode enforced)
- [ ] Gmail/Calendar reads auto-approved
- [ ] Gmail/Calendar writes require user confirmation
- [ ] Sensitive file access blocked
- [ ] Dangerous Bash commands blocked
- [ ] PARA directory operations auto-approved

---

#### 5.4.7 Tool Search Mode (Composio Optimization)

Composio has 500+ tools. Loading all in system prompt wastes tokens. Tool search mode loads tools dynamically.

**Configuration:**
```typescript
{
  mcpServers: {
    composio: {
      url: "https://api.composio.dev/...",
      toolSearchMode: 'auto'  // Load tools dynamically as needed
    }
  }
}
```

**Behavior:**
- User: "Check my inbox"
- SDK fetches only Gmail tools (~10 tools)
- User: "Schedule a meeting"
- SDK fetches only Calendar tools (~8 tools)
- **Result:** ~5k tokens saved per query vs loading all 500+ tools

**Acceptance Criteria:**
- [ ] Composio configured with `toolSearchMode: 'auto'`
- [ ] Token usage reduced when not all tools needed
- [ ] Tool discovery works correctly (agent can still request any tool)

---

#### 5.4.8 Directory-Based Agent Handoff

Subagents write results to files instead of returning large outputs that flood context.

**Pattern:**
```
❌ DON'T: TaskOutput (floods main context with 70K tokens)
✅ DO: Agent writes to .claude/cache/agents/<agent>/output/
```

**Implementation:**
```
.claude/cache/agents/
├── triage/
│   └── output/
│       ├── summary.md           # 2KB summary for main context
│       └── full-results.json    # 70KB full data if needed
├── scheduler/
│   └── output/
│       └── availability.json
└── communicator/
    └── output/
        └── draft.md
```

**Agent Output Pattern:**
```typescript
// Triage agent writes to file
const results = await triageInbox(items);

// Write full results
await writeFile('.claude/cache/agents/triage/output/full-results.json', results);

// Write summary for main context
const summary = summarizeTriageResults(results);
await writeFile('.claude/cache/agents/triage/output/summary.md', summary);

// Return only summary path
return { summaryPath: '.claude/cache/agents/triage/output/summary.md' };
```

**Acceptance Criteria:**
- [ ] Subagents write to `.claude/cache/agents/<agent>/output/`
- [ ] Main context receives summary path, not full data
- [ ] Full results available if needed via Read tool
- [ ] Cache cleared at session end

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

**Model:** BGE-M3 (BAAI/bge-m3)

**Dimensions:** 1024

**Context Length:** 8192 tokens (vs 512 for bge-large-en-v1.5)

**Languages:** 100+ (multilingual support)

**Use Cases:**
- Semantic contact search
- Memory recall
- Similar item finding
- Long document embedding (up to 8192 tokens)

---

### 6.5 Key SDK Features to Use

> **See also:** §5.4 Claude Agent SDK Harness for detailed implementation of Skills, Hooks, Sessions, and BDI Agents.

| Feature | Implementation | PRD Section |
|---------|----------------|-------------|
| **Skills System** | Butler-specific skills + 115 inherited CC v3 skills | §5.4.1 |
| **Hooks Pipeline** | Session, PreToolUse, PostToolUse hooks | §5.4.2 |
| **BDI Agent Architecture** | Belief-Desire-Intention structured reasoning | §5.4.3 |
| **Session Management** | Daily/Project/Inbox sessions with resume | §5.4.4 |
| **Context Compaction** | PARA-preserving auto-summarization | §5.4.5 |
| **Permission Architecture** | Mode per agent + custom canUseTool | §5.4.6 |
| **Tool Search Mode** | Dynamic Composio tool loading | §5.4.7 |
| **Directory-Based Handoff** | Subagent file outputs (not TaskOutput) | §5.4.8 |
| **Structured Outputs** | Guaranteed JSON schemas for triage, contacts, tasks | Below |
| **Extended Thinking** | Complex scheduling/conflict resolution | §6.5.4 |
| **Prompt Caching** | TTL-based caching strategy | §6.5.3 |

#### 6.5.1 Built-in Tools

The Claude Agent SDK provides built-in tools for desktop automation:

| Tool | Type | Capabilities |
|------|------|--------------|
| **Bash** | `bash_20250124` | Persistent shell session, macOS terminal access, script execution |
| **Text Editor** | `text_editor_20250728` | File view, create, str_replace, insert, undo_edit |
| **Computer Use** | `computer_20251124` | GUI automation: screenshot, click, type, scroll (post-MVP) |

**Note:** Computer Use is marked post-MVP due to beta status.

#### 6.5.2 MCP Server Configuration

Beyond custom tools, Orion extends capabilities via MCP servers:

| Server | Type | Purpose |
|--------|------|---------|
| **Composio** | HTTP | Gmail, Calendar, Slack integrations |
| **Filesystem** | stdio | Local file access beyond text_editor |
| **SQLite** | stdio | Direct database queries |

#### 6.5.3 Prompt Caching Strategy

Reduce costs by caching frequently-used context:

| Content | TTL | Rationale |
|---------|-----|-----------|
| System prompt | 5 min (default) | Rarely changes, frequently used |
| PARA context | 1 hour | Changes infrequently during session |
| User preferences | 1 hour | Stable within session |
| Recent messages | No cache | Changes every turn |

**Cost Impact:** 50-80% savings for typical butler conversations (90% discount on cache reads, 25% premium on first write).

#### 6.5.4 Extended Thinking

Enable extended thinking for complex reasoning tasks:

| Use Extended Thinking | Skip Extended Thinking |
|-----------------------|-----------------------|
| Complex scheduling conflicts | Simple "what's next?" queries |
| Multi-step task planning | Quick lookups |
| Analyzing email threads for priorities | Single email summaries |
| Financial/budget reasoning | Basic PARA searches |
| Debugging/troubleshooting workflows | Status updates |

**Budget Strategy:** Adaptive based on task type (1,024 min → 15,000 max tokens).

**Reference:** See Tech Spec §6.5-6.8 for implementation details.

---

### 6.6 Observability & Tracing

Orion uses a dual-system observability architecture:

| System | Purpose | Key Features |
|--------|---------|--------------|
| **Braintrust** | Development & analysis | Session tracing, learning extraction, agent run datasets, sub-agent correlation |
| **Langfuse** | Production observability | Prompt management, A/B testing, LLM-as-a-Judge evaluation, human annotation queues |

**Why two systems?**
- Braintrust is already integrated in Continuous Claude for session analysis
- Langfuse provides open-source prompt management and evaluation features not in Braintrust

**Both systems operate independently** - they use separate environment variables, code paths, and storage. No conflicts.

**Environment Variables:**
```bash
# Braintrust (existing from Continuous Claude)
TRACE_TO_BRAINTRUST=true
BRAINTRUST_API_KEY=...

# Langfuse (optional, for production)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

**Use Cases:**
- **Debug a specific session**: Use Braintrust
- **A/B test prompts in production**: Use Langfuse
- **Extract learnings from past sessions**: Use Braintrust
- **Create evaluation datasets**: Use Langfuse
- **Track production costs**: Use Langfuse

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

### 7.1.1 Orion Design System (Added 2026-01-14)

**Location:** `design-system/`

Orion follows an **Editorial Luxury** aesthetic inspired by high-end magazines and luxury brand catalogs. The design system has been extracted from UI mockups and provides:

#### Visual Identity

| Principle | Implementation |
|-----------|---------------|
| **Zero Border Radius** | Sharp, architectural edges throughout |
| **Black & Gold** | Monochrome with strategic gold (#D4AF37) highlights |
| **Generous Whitespace** | Breathing room, minimal visual density |
| **Serif Headlines** | Playfair Display italics for elegance |
| **Micro Typography** | 9-11px uppercase tracking (0.25-0.4em) for labels |
| **Grayscale Imagery** | Images start B&W, reveal color on hover |

#### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `orion-primary` | `#D4AF37` | Gold accent, CTAs, highlights |
| `orion-bg` | `#F9F8F6` | Page background (warm cream) |
| `orion-fg` | `#1A1A1A` | Text, borders (near-black) |

#### Typography

| Font | Usage |
|------|-------|
| **Playfair Display** | Headlines, quotes, emphasis (`.serif` class) |
| **Inter** | Body text, labels, UI |

#### Layout Dimensions

| Element | Size |
|---------|------|
| Header Height | 80px |
| Sidebar Width | 280px |
| Agent Rail | 64px |
| Content Max Width | 850px |

#### Key Components

| Component | Description |
|-----------|-------------|
| `.btn-gold-slide` | Primary CTA with gold slide-in effect on hover |
| `.luxury-card` | Card with top border and grayscale-to-color image |
| `.input-editorial` | Underline-only input with serif italic placeholder |
| `.chat-user` | User message (black background, cream text) |
| `.chat-agent` | Agent message (gold left border accent) |

**Full Documentation:** `design-system/README.md`

### 7.2 Key Screens/Views

#### 7.2.1 Main Layout

> Layout follows design system dimensions: 80px header, 280px sidebar, 64px agent rail

```
┌─────────────────────────────────────────────────────────┐
│ 80px HEADER (logo, search, notifications, avatar)       │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│  280px   │      MAIN CONTENT            │  64px         │
│  SIDEBAR │      (Chat / Dashboard)      │  AGENT RAIL   │
│  (PARA)  │                              │  (sparkle)    │
│          │                              │               │
│          ├──────────────────────────────┤               │
│          │  INPUT BAR                   │               │
└──────────┴──────────────────────────────┴───────────────┘
```

**Design System Classes:**
- Header: `h-header` (80px)
- Sidebar: `w-sidebar` (280px)
- Rail: `w-rail` (64px)
- Content: `max-w-content` (850px)
- Background: `bg-orion-bg` (#F9F8F6)

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
| **json-render API changes** | Low | Medium | Pin version, abstract behind our types (Vercel-backed, stable) |
| **Tauri learning curve** | Medium | Medium | Follow official tutorials, use TypeScript bindings |
| **SQLite concurrent access** | Low | Medium | WAL mode, connection pooling |
| **OAuth token refresh** | Medium | Low | Add refresh hook, graceful re-auth flow |

> **Resolved (2026-01-14):** A2UI React renderer risk eliminated by switching to json-render (production-ready React support).

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
4. ~~Best approach for A2UI React renderer?~~ **RESOLVED (2026-01-14):** Using json-render from Vercel Labs instead. See `PLAN-json-render-integration.md`.

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
| **json-render** | Vercel Labs library for AI-guardrailed UI generation from JSON. Replaces A2UI for React apps. See [PLAN-json-render-integration.md](../thoughts/shared/plans/PLAN-json-render-integration.md) |
| **A2UI** | Agent-to-UI - Google's protocol for agent-generated interfaces. Not used (no React support). See [A2UI-deep-dive.md](../thoughts/research/A2UI-deep-dive.md) |
| **Composio** | Platform for AI tool integrations (500+ apps) |
| **BGE** | BAAI General Embedding - open-source embedding model |
| **RRF** | Reciprocal Rank Fusion - method for combining search rankings |
| **FTS5** | SQLite's Full-Text Search extension |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **TipTap** | Open-source rich text editor framework for rich text editing (email body, documents) |
| **Polotno** | Canvas-based visual editor for designs, photos, and videos |
| **MCP** | Model Context Protocol - Anthropic's tool integration standard |

### 12.2 References to Detailed Research

| Document | Location | Content |
|----------|----------|---------|
| **Orion Design System** | `design-system/README.md` | **Design tokens, Tailwind preset, component classes** |
| Master Design Decisions | `thoughts/research/ORION-DESIGN-CONSOLIDATED.md` | All finalized decisions |
| Architecture Overview | `thoughts/research/ORION-MASTER-RESEARCH.md` | System architecture |
| UX Research | `thoughts/research/orion-ux-deep-dive.md` | UX patterns and research |
| UI Design | `thoughts/research/orion-ui-design.md` | Screen designs |
| **json-render Integration** | `thoughts/shared/plans/PLAN-json-render-integration.md` | **AI UI generation (replaces A2UI)** |
| A2UI Protocol (archived) | `thoughts/research/A2UI-deep-dive.md` | Agent-to-UI research (not used - no React) |
| Canvas Architecture | `thoughts/research/canvas-architecture.md` | Canvas panel and editors |
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

### 12.5 UI Page Map (Added 2026-01-14)

**Location:** `pages/`

Complete map of HTML mockups to PRD features:

| Page | Title | PRD Section | User Stories |
|------|-------|-------------|--------------|
| `01-orion-executive-dashboard.html` | Executive Dashboard | 7.2.1 | - |
| `02-orion-sign-in.html` | Sign In | 7.2.5 | - |
| `03-orion-sign-up.html` | Sign Up | 7.2.5 | - |
| `04-orion-welcome-onboarding.html` | Welcome/Onboarding | 7.2.5 | - |
| `05-areas-setup-orion.html` | Areas Setup | 7.2.5 | A-004 |
| `06-orion-agent-workspace.html` | Agent Workspace | 5.1.1 | All (chat) |
| `07-orion-inbox-daily-view.html` | Inbox Daily View | 5.1.2 | I-001 to I-007 |
| `08-orion-project-portfolio.html` | Project Portfolio | 7.2.4 | P-001 to P-006 |
| `09-orion-project-detail-q4-strategic-expansion.html` | Project Detail | 7.2.4 | P-002, P-003, P-005 |
| `10-orion-areas-hub.html` | Areas Hub | 5.1.10 | A-001 to A-005 |
| `11-orion-resources.html` | Resources (PARA) | 5.1.5 | R-001 to R-006 |
| `12-orion-settings-hub.html` | Settings | - | - |
| `13-orion-billing-plans.html` | Billing & Plans | 2.5 | - |
| `14-orion-contacts-list.html` | Contacts List | 5.1.5 | R-001 to R-006 |
| `15-orion-contact-detail.html` | Contact Detail | 5.1.5 | R-003, M-004 |
| `16-orion-archive.html` | Archive (PARA) | 5.1.10 | AR-001 to AR-003 |
| `17-area-detail-financial-governance.html` | Area Detail | 5.1.10 | A-002, A-003 |
| `18-orion-global-directives.html` | Global Directives | 5.2.1 | - |
| `19-orion-calendar-week-view.html` | Calendar Week View | 5.1.3 | C-001 to C-005 |
| `20-orion-notifications-center.html` | Notifications | - | - |
| `21-orion-pricing-plans.html` | Pricing Plans | 2.5 | - |
| `22-orion-dialogue-archive.html` | Dialogue Archive | - | - |
| `23-orion-chat-project-discussion.html` | Chat (Project Context) | 5.1.1 | - |
| `24-orion-knowledge-sync.html` | Knowledge Sync | 5.3 | - |
| `25-canvas-editor-full.html` | Canvas Editor | 5.1.7, 5.1.8 | E-002 |
| `26-orion-scheduling-interaction.html` | Scheduling UI | 5.1.8 | C-002, C-003 |
| `27-orion-email-composer.html` | Email Composer | 5.1.4, 5.1.7 | E-002 to E-005 |
| `28-orion-inbox-process-mode.html` | Inbox Process Mode | 5.1.2 | I-006 |
| `29-orion-gtd-workspace.html` | GTD Workspace | - | - |
| `30-orion-tasks-list.html` | Tasks List | 5.1.6 | P-002, P-004, I-005 |
| `31-orion-memory-viewer.html` | Memory Viewer | 5.1.11 | M-001 to M-004 |
| `32-orion-action-log.html` | Action Log (Undo) | 10.4 Tiger 1 | - |

**Total: 32 pages**

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Product Team | Initial PRD created |

---

*This PRD synthesizes research from the Orion design documents. For detailed implementation guidance, refer to the documents in `thoughts/research/` and `thoughts/shared/plans/`.*
