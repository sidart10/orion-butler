---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - thoughts/planning-artifacts/prd.md
  - thoughts/planning-artifacts/architecture.md
  - thoughts/planning-artifacts/architecture-diagrams.md
  - thoughts/planning-artifacts/ux-design-specification.md
---

# Orion Personal Butler - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Orion Personal Butler, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Projects (PARA)**
- FR-P001: Users can create projects with name, description, deadline, and status
- FR-P002: Users can see all tasks for a project grouped by status (todo, in-progress, done)
- FR-P003: Users can link contacts to projects as stakeholders with roles (owner, collaborator)
- FR-P004: Agent extracts action items from emails and suggests project to add tasks to
- FR-P005: Users can see project progress at a glance via progress bar based on completed tasks
- FR-P006: Users can archive completed projects with reason, searchable in archive

**Areas (PARA)**
- FR-A001: Users can define life areas (Career, Health, Finance) with create/edit/delete
- FR-A002: Users can see hierarchical view: Area > Projects > Tasks
- FR-A003: Users can set goals/standards for areas with optional metrics
- FR-A004: System suggests common areas during onboarding (Career, Health, Finance, Relationships, Home)
- FR-A005: Users can set area-specific preferences for different triage rules per area

**Resources (PARA)**
- FR-R001: Users can store contacts with fields: name, email, phone, company, notes
- FR-R002: Users can search contacts semantically (e.g., "the designer from TechConf")
- FR-R003: Users can see interaction history with contacts (last email, meeting, date)
- FR-R004: Users can save templates for common communications
- FR-R005: Users can store learned preferences with source (user/learned)
- FR-R006: Users can link contacts to organizations

**Archive (PARA)**
- FR-AR001: Users can search archived items via full-text + semantic search
- FR-AR002: Users can restore archived items to original category
- FR-AR003: Archive stores reason for archival with context

**Inbox Triage**
- FR-I001: Users see all actionable items (email, calendar, Slack) in one unified inbox view
- FR-I002: Items are prioritized automatically with priority score 0.0-1.0 per item
- FR-I003: Users can file items to projects/areas with quick-file action and suggestions
- FR-I004: Agent generates draft replies for emails
- FR-I005: Agent extracts action items from emails with confidence scores
- FR-I006: Users can bulk process inbox items with multi-select + bulk actions
- FR-I007: Users can snooze items until later with reminder

**Calendar Management**
- FR-C001: Users can see calendar events in day/week view
- FR-C002: Users can create events through chat (e.g., "Schedule meeting with John")
- FR-C003: AI finds mutual availability and suggests times
- FR-C004: System can auto-block focus time periods
- FR-C005: System surfaces meeting prep context (related emails, contact info)

**Email Handling**
- FR-E001: Users can read emails in Orion (HTML, plain text, images render correctly)
- FR-E002: Users can send emails through Orion
- FR-E003: AI generates draft replies in user's tone
- FR-E004: Users can review and edit drafts before sending
- FR-E005: Users can use email templates for common responses

**Memory & Recall**
- FR-M001: System remembers user preferences across sessions
- FR-M002: System recalls past decisions for consistency
- FR-M003: Relevant context is surfaced automatically via memory injection in prompts
- FR-M004: Users can see what Orion remembers about a contact (per-contact memory view)

**Chat Interface**
- FR-CH001: Split-screen layout with Chat panel (35%) + Canvas panel (65%)
- FR-CH002: Message history with conversation threading
- FR-CH003: Streaming responses with typing indicators
- FR-CH004: Tool call visualization with collapsible cards
- FR-CH005: Suggested quick actions as chips
- FR-CH006: Keyboard shortcuts (Cmd+Enter to send, Cmd+K for palette)

**Dynamic AI UI (json-render)**
- FR-UI001: AI-generated structured UI components render in chat and canvas
- FR-UI002: 27 component catalog including layout, display, and interactive components
- FR-UI003: Streaming support via useUIStream hook for progressive rendering
- FR-UI004: Action system for declarative interactions (send_email, schedule_meeting)
- FR-UI005: Data binding via valuePath for reactive form fields

**Document Editing**
- FR-DE001: WYSIWYG editor based on TipTap with formatting controls
- FR-DE002: Code blocks with syntax highlighting
- FR-DE003: Markdown import/export
- FR-DE004: Auto-save for documents

**Task Management**
- FR-TM001: Tasks have title, description, status, priority, due date
- FR-TM002: Tasks can be linked to project/area
- FR-TM003: Tasks track source (manual, Gmail, Linear)
- FR-TM004: Task status workflow: pending > in_progress > completed > cancelled
- FR-TM005: Due date reminders for tasks
- FR-TM006: Extracted tasks from email require user confirmation

**Contact Management**
- FR-CM001: Contact fields include name, email, phone, company, title, relationship
- FR-CM002: Organization linking for contacts
- FR-CM003: Contact preferences (preferred channel, timezone)
- FR-CM004: Auto-enrichment from email signatures
- FR-CM005: New contacts auto-created from emails if unknown

### Non-Functional Requirements

**Performance**
- NFR-P001: Messages send/receive with <500ms latency to first token (p95)
- NFR-P002: Responses stream in real-time
- NFR-P003: App launch time < 3 seconds
- NFR-P004: Bulk actions process 10+ items in <5 seconds
- NFR-P005: Availability check returns open slots within 3 seconds
- NFR-P006: AI drafts generate in <5 seconds
- NFR-P007: Editor handles 10,000+ word documents

**Reliability**
- NFR-R001: Crash rate < 1% of sessions
- NFR-R002: 95%+ uptime for core features
- NFR-R003: <5 critical bugs in production

**Accuracy**
- NFR-A001: Actions extracted with 80%+ accuracy
- NFR-A002: Filing suggestions match project/area 70%+ of time
- NFR-A003: Triage accuracy 80% filing suggestions accepted
- NFR-A004: Semantic search returns relevant contacts (80%+ precision in top 5)
- NFR-A005: Memory recall relevance 70% helpful ratings

**User Satisfaction**
- NFR-U001: 60%+ daily return rate for beta users over 2+ weeks
- NFR-U002: Users self-report saving 30+ minutes/day
- NFR-U003: <20% beta user abandonment after first week
- NFR-U004: Inbox processing time 50% reduction vs manual

**Security & Privacy**
- NFR-S001: Local-first architecture - data stays on device
- NFR-S002: OAuth tokens refresh automatically with graceful re-auth
- NFR-S003: No sensitive data sent to external services without user consent

**Platform**
- NFR-PL001: macOS 12 (Monterey) or later required
- NFR-PL002: 4GB RAM minimum, 8GB recommended
- NFR-PL003: 500MB disk space for application
- NFR-PL004: Internet connection required for AI and integrations

### Additional Requirements

**From Architecture - Starter Template:**
- ARCH-001: Tauri 2.0 + Next.js 14 desktop application scaffolding
- ARCH-002: SQLite + sqlite-vec for local database with FTS5 full-text search
- ARCH-003: PostgreSQL + pgvector for shared memory and embeddings
- ARCH-004: Claude Agent SDK integration with Composio MCP
- ARCH-005: Agent Server (Node.js localhost:3001) as separate process
- ARCH-006: Tauri IPC for frontend-backend communication

**From Architecture - Infrastructure:**
- ARCH-007: Database location: ~/Library/Application Support/Orion/orion.db
- ARCH-008: WAL mode enabled for SQLite concurrent reads
- ARCH-009: BGE-M3 embeddings (1024 dimensions, 8192 token context)
- ARCH-010: Dual observability: Braintrust (dev) + Langfuse (production)

**From Architecture - Agent System:**
- ARCH-011: Butler Agent as main orchestrator
- ARCH-012: Triage Agent for inbox processing
- ARCH-013: Scheduler Agent for calendar management
- ARCH-014: Communicator Agent for email/message drafting
- ARCH-015: Navigator Agent for PARA search
- ARCH-016: Preference Learner Agent for pattern detection
- ARCH-017: 26 total agents (4 core, 10 adapted from CC v3, 6 reused, 6 new)

**From Architecture - Claude SDK Features:**
- ARCH-018: Structured Outputs for type-safe triage results
- ARCH-019: Extended Thinking for complex scheduling (1,024-15,000 tokens)
- ARCH-020: Prompt Caching (50-80% cost savings)
- ARCH-021: canUseTool callback (reads auto, writes ask)
- ARCH-022: 200k context window for long email threads

**From Architecture - Streaming:**
- ARCH-023: SSE (Server-Sent Events) for agent response streaming
- ARCH-024: Tauri events for IPC streaming

**From UX - Design System:**
- UX-001: Orion Design System with editorial luxury aesthetic
- UX-002: Zero border radius (sharp corners) throughout
- UX-003: Color palette: Gold #D4AF37, Cream #F9F8F6, Black #1A1A1A
- UX-004: Typography: Playfair Display (serif headlines), Inter (body)
- UX-005: Layout: 80px header, 280px sidebar, 64px agent rail, 850px content max

**From UX - Interaction Patterns:**
- UX-006: Keyboard shortcuts (j/k navigation, Cmd+N new chat, Cmd+K palette)
- UX-007: 5-second undo window for actions
- UX-008: Canvas slides in at 50% width (600ms cubic-bezier ease)
- UX-009: Chat status indicators (● needs attention, ○ working, ✓ done)
- UX-010: Multi-chat parallel task management

**From UX - Trust & Delegation:**
- UX-011: Progressive trust model - more autonomy earned over time
- UX-012: Never auto-send without permission
- UX-013: Show reasoning on demand ("See what I did")
- UX-014: Corrections improve future behavior

**From UX - Onboarding:**
- UX-015: 5-step wizard: Welcome > API Key > Connect Tools > Select Areas > Complete
- UX-016: Time-to-value under 2 minutes
- UX-017: First triage scoped to last 7 days
- UX-018: Skip options at every step

**From UX - Monetization:**
- UX-019: Stripe payments (USD + USDC)
- UX-020: Free tier: 1,000 API calls/month
- UX-021: Pro tier: 10,000 API calls/month ($29/mo)
- UX-022: Usage-based billing tracking via Supabase Edge Functions

**From PRD - Pre-Mortem Mitigations:**
- PM-001: action_log table for undo/rollback of agent actions
- PM-002: Rate limiter for Composio tool execution
- PM-003: Graceful degradation when rate limited ("Syncing paused...")

### FR Coverage Map

| FR ID | Epic | Description |
|-------|------|-------------|
| FR-CH001 | Epic 1 | Split-screen layout with Chat panel + Canvas panel |
| FR-CH002 | Epic 1 | Message history with conversation threading |
| FR-CH003 | Epic 1 | Streaming responses with typing indicators |
| FR-CH004 | Epic 1 | Tool call visualization with collapsible cards |
| FR-CH005 | Epic 1 | Suggested quick actions as chips |
| FR-CH006 | Epic 1 | Keyboard shortcuts (Cmd+Enter, Cmd+K) |
| FR-I001 | Epic 4 | Unified inbox view for all actionable items |
| FR-I002 | Epic 4 | Automatic priority scoring (0.0-1.0) |
| FR-I003 | Epic 4 | File items to projects/areas |
| FR-I004 | Epic 5 | Agent generates draft replies |
| FR-I005 | Epic 4 | Extract action items with confidence scores |
| FR-I006 | Epic 4 | Bulk process inbox items |
| FR-I007 | Epic 4 | Snooze items until later |
| FR-E001 | Epic 5 | Read emails (HTML, plain text, images) |
| FR-E002 | Epic 5 | Send emails through Orion |
| FR-E003 | Epic 5 | AI generates drafts in user's tone |
| FR-E004 | Epic 5 | Review and edit drafts before sending |
| FR-E005 | Epic 5 | Email templates for common responses |
| FR-C001 | Epic 6 | Calendar events in day/week view |
| FR-C002 | Epic 6 | Create events through chat |
| FR-C003 | Epic 6 | AI finds mutual availability |
| FR-C004 | Epic 6 | Auto-block focus time periods |
| FR-C005 | Epic 6 | Meeting prep context (emails, contacts) |
| FR-R001 | Epic 7 | Store contacts with all fields |
| FR-R002 | Epic 7 | Semantic contact search |
| FR-R003 | Epic 7 | Interaction history with contacts |
| FR-R004 | Epic 10 | Save communication templates |
| FR-R005 | Epic 10 | Store learned preferences |
| FR-R006 | Epic 7 | Link contacts to organizations |
| FR-CM001 | Epic 7 | Contact fields (name, email, etc.) |
| FR-CM002 | Epic 7 | Organization linking |
| FR-CM003 | Epic 7 | Contact preferences (channel, timezone) |
| FR-CM004 | Epic 7 | Auto-enrichment from signatures |
| FR-CM005 | Epic 7 | Auto-create contacts from emails |
| FR-P001 | Epic 8 | Create projects with name, description, deadline |
| FR-P002 | Epic 8 | Tasks grouped by status per project |
| FR-P003 | Epic 8 | Link contacts as stakeholders |
| FR-P004 | Epic 8 | Extract action items, suggest project |
| FR-P005 | Epic 8 | Project progress bar |
| FR-P006 | Epic 8 | Archive completed projects |
| FR-TM001 | Epic 8 | Task fields (title, status, priority, due) |
| FR-TM002 | Epic 8 | Link tasks to project/area |
| FR-TM003 | Epic 8 | Track task source |
| FR-TM004 | Epic 8 | Task status workflow |
| FR-TM005 | Epic 8 | Due date reminders |
| FR-TM006 | Epic 8 | Confirm extracted tasks |
| FR-A001 | Epic 9 | Define life areas (create/edit/delete) |
| FR-A002 | Epic 9 | Hierarchical view: Area > Projects > Tasks |
| FR-A003 | Epic 9 | Goals/standards for areas |
| FR-A004 | Epic 12 | Suggest common areas during onboarding |
| FR-A005 | Epic 9 | Area-specific triage preferences |
| FR-AR001 | Epic 9 | Search archived items |
| FR-AR002 | Epic 9 | Restore archived items |
| FR-AR003 | Epic 9 | Archive with reason/context |
| FR-M001 | Epic 10 | Remember preferences across sessions |
| FR-M002 | Epic 10 | Recall past decisions |
| FR-M003 | Epic 10 | Surface context via memory injection |
| FR-M004 | Epic 10 | Per-contact memory view |
| FR-UI001 | Epic 11 | AI-generated UI components render |
| FR-UI002 | Epic 11 | 27 component catalog |
| FR-UI003 | Epic 11 | Streaming via useUIStream |
| FR-UI004 | Epic 11 | Action system for interactions |
| FR-UI005 | Epic 11 | Data binding via valuePath |
| FR-DE001 | Epic 11 | TipTap WYSIWYG editor |
| FR-DE002 | Epic 11 | Code blocks with syntax highlighting |
| FR-DE003 | Epic 11 | Markdown import/export |
| FR-DE004 | Epic 11 | Auto-save for documents |

## Epic List

### Epic 1: Foundation & First Chat
Users can launch Orion, have their first conversation with the AI butler, and experience streaming responses.

**FRs covered:** FR-CH001, FR-CH002, FR-CH003, FR-CH004, FR-CH005, FR-CH006

**Additional Requirements:** ARCH-001 through ARCH-010, ARCH-023, ARCH-024, UX-001 through UX-005, NFR-P001, NFR-P002, NFR-P003

**Delivers:** Working Tauri desktop app, Next.js frontend, SQLite database, Agent Server, chat interface with Claude, streaming responses, Orion Design System foundation

---

### Epic 2: Agent & Automation Infrastructure
Users benefit from an intelligent agent system with hooks, skills, and specialized agents adapted from Continuous Claude v3.

**FRs covered:** (Agent infrastructure - enables all AI capabilities)

**Additional Requirements:** ARCH-011 through ARCH-017

**Delivers:** Claude Code hooks integration (34 hooks), 31 agent templates (6 Orion core + 6 reusable + 14 adaptable + 5 optional), sub-agent spawning, tool permission system (canUseTool), Butler/Triage/Scheduler/Communicator/Navigator/Preference Learner as core 6

---

### Epic 3: Connect Your Tools
Users can connect Gmail and Google Calendar via OAuth, see connection status, and verify that tools work.

**FRs covered:** (Tool connection infrastructure - enables all integrations)

**Additional Requirements:** ARCH-004, ARCH-022, PM-002, NFR-S002

**Delivers:** Composio integration, OAuth flow, tool connection management, rate limiting, token refresh

---

### Epic 4: Unified Inbox Experience
Users can see all their emails in a unified inbox with AI-powered priority scoring and triage actions.

**FRs covered:** FR-I001, FR-I002, FR-I003, FR-I005, FR-I006, FR-I007

**Additional Requirements:** ARCH-011, ARCH-012, ARCH-018, UX-006, UX-007, UX-009, PM-001, NFR-P004, NFR-A001, NFR-A002, NFR-A003

**Delivers:** Inbox sync from Gmail, priority scoring (0.0-1.0), action extraction, bulk actions, snooze, undo support, Triage Agent

---

### Epic 5: Email Communication
Users can read, compose, and send emails through Orion with AI-generated drafts in their tone.

**FRs covered:** FR-E001, FR-E002, FR-E003, FR-E004, FR-E005, FR-I004

**Additional Requirements:** ARCH-014, UX-008, UX-012, NFR-P006

**Delivers:** Email reading, TipTap composer in canvas, AI drafts, templates, review-before-send, Communicator Agent

---

### Epic 6: Calendar Management
Users can view their calendar, create events via chat, and get AI assistance finding meeting times.

**FRs covered:** FR-C001, FR-C002, FR-C003, FR-C004, FR-C005

**Additional Requirements:** ARCH-013, ARCH-019, NFR-P005

**Delivers:** Calendar views (day/week), chat scheduling, mutual availability finder, focus time blocking, meeting prep, Scheduler Agent

---

### Epic 7: Contact & Relationship Management
Users can manage contacts, search semantically, and see interaction history with each contact.

**FRs covered:** FR-R001, FR-R002, FR-R003, FR-R006, FR-CM001, FR-CM002, FR-CM003, FR-CM004, FR-CM005

**Additional Requirements:** ARCH-009, NFR-A004

**Delivers:** Contact database, organizations, semantic search with embeddings, auto-enrichment from signatures, auto-create from emails

---

### Epic 8: Projects & Tasks (PARA)
Users can create projects, manage tasks, track progress, and file inbox items to projects.

**FRs covered:** FR-P001, FR-P002, FR-P003, FR-P004, FR-P005, FR-P006, FR-TM001, FR-TM002, FR-TM003, FR-TM004, FR-TM005, FR-TM006

**Additional Requirements:** UX-010

**Delivers:** Project CRUD, task management, stakeholder linking, progress tracking, email-to-task extraction with confirmation

---

### Epic 9: Areas & Archive (PARA)
Users can define life areas, organize hierarchically, and archive/restore completed work.

**FRs covered:** FR-A001, FR-A002, FR-A003, FR-A005, FR-AR001, FR-AR002, FR-AR003

**Additional Requirements:** ARCH-015

**Delivers:** Areas with goals/standards, area-specific preferences, archive with search/restore, Navigator Agent

---

### Epic 10: Memory & Recall System
Users can see what Orion remembers, correct memories, and benefit from cross-session context.

**FRs covered:** FR-M001, FR-M002, FR-M003, FR-M004, FR-R004, FR-R005

**Additional Requirements:** ARCH-003, ARCH-016, UX-013, UX-014, NFR-A005

**Delivers:** PostgreSQL shared memory, preference storage, decision recall, memory injection in prompts, memory viewer, Preference Learner Agent

---

### Epic 11: Dynamic AI Canvas (json-render)
Users see rich, interactive UI components generated by the AI (meeting pickers, email previews, forms).

**FRs covered:** FR-UI001, FR-UI002, FR-UI003, FR-UI004, FR-UI005, FR-DE001, FR-DE002, FR-DE003, FR-DE004

**Additional Requirements:** ARCH-020, ARCH-021, NFR-P007

**Delivers:** json-render integration, 27-component catalog, streaming UI, TipTap editor, action system, data binding

---

### Epic 12: Onboarding & First Run
New users complete setup, connect tools, and experience their first AI triage within 2 minutes.

**FRs covered:** FR-A004

**Additional Requirements:** UX-015, UX-016, UX-017, UX-018, NFR-U003

**Delivers:** 5-step wizard, area suggestions, first triage preview (last 7 days), skip options, time-to-value optimization

---

### Epic 13: Billing & Monetization
Users can subscribe, manage their plan, and see usage tracking.

**FRs covered:** (Monetization requirements)

**Additional Requirements:** UX-019, UX-020, UX-021, UX-022

**Delivers:** Stripe integration (USD + USDC), free tier (1,000 calls), Pro tier ($29/mo, 10,000 calls), usage metering via Supabase Edge

---

### Epic 14: Observability & Quality
Development team can trace sessions, debug issues, and improve the system over time.

**FRs covered:** (Developer/operational requirements)

**Additional Requirements:** ARCH-010, PM-003, NFR-R001, NFR-R002, NFR-R003

**Delivers:** Braintrust tracing (dev), Langfuse prompts (production), graceful degradation, crash/uptime monitoring

---

## Epic 1: Foundation & First Chat

Users can launch Orion, have their first conversation with the AI butler, and experience streaming responses.

### Story 1.1: Tauri Desktop Shell

As a user,
I want to launch Orion as a native macOS application,
So that I have a dedicated desktop experience for my AI butler.

**Acceptance Criteria:**

**Given** Orion is installed on macOS 12+
**When** I double-click the app icon or launch from Spotlight
**Then** the application window opens within 3 seconds
**And** the window has correct dimensions (minimum 1200x800)
**And** the app appears in the Dock with the Orion icon

**Given** the app is running
**When** I close the window
**Then** the app quits gracefully without errors

**Tests:**
- [ ] E2E: App launches successfully on macOS 12 (Monterey)
- [ ] E2E: App launches successfully on macOS 13+ (Ventura/Sonoma)
- [ ] E2E: Launch time is under 3 seconds (NFR-P003)
- [ ] Unit: Tauri window configuration matches spec
- [ ] E2E: App quits cleanly with exit code 0

---

### Story 1.2: Next.js Frontend Integration

As a user,
I want the app to display a modern React interface,
So that I have a responsive and familiar web-like experience.

**Acceptance Criteria:**

**Given** the Tauri shell is running
**When** the app initializes
**Then** the Next.js frontend loads in the webview
**And** React components render without hydration errors
**And** the frontend communicates with Tauri via IPC

**Given** there is a JavaScript error in the frontend
**When** the error occurs
**Then** it is caught and logged (not silent failure)
**And** the app remains functional

**Tests:**
- [ ] E2E: Frontend renders without console errors
- [ ] Integration: Tauri IPC invoke/listen works bidirectionally
- [ ] Unit: Error boundary catches and reports errors
- [ ] E2E: Hot reload works in development mode

---

### Story 1.3: Design System Foundation

As a user,
I want Orion to have a distinctive editorial luxury aesthetic,
So that it feels premium and differentiated from other tools.

**Acceptance Criteria:**

**Given** the app is running
**When** any screen loads
**Then** typography uses Playfair Display for headlines, Inter for body (UX-004)
**And** colors follow the palette: Gold #D4AF37, Cream #F9F8F6, Black #1A1A1A (UX-003)
**And** all corners are sharp (zero border radius) (UX-002)
**And** the layout follows the grid: 80px header, 280px sidebar, 64px agent rail (UX-005)

**Given** the design system is implemented
**When** a developer creates a new component
**Then** Tailwind/CSS tokens enforce the design constraints
**And** deviations are visually obvious

**Tests:**
- [ ] Visual regression: Screenshots match design spec
- [ ] Unit: Tailwind config exports correct color tokens
- [ ] Unit: Typography scale matches spec
- [ ] Accessibility: Color contrast meets WCAG AA (4.5:1 for text)

---

### Story 1.4: SQLite Database Setup

As a user,
I want my data stored locally on my device,
So that my information stays private and under my control.

**Acceptance Criteria:**

**Given** the app launches for the first time
**When** initialization completes
**Then** SQLite database is created at ~/Library/Application Support/Orion/orion.db (ARCH-007)
**And** WAL mode is enabled for concurrent reads (ARCH-008)
**And** the schema includes: conversations, messages tables

**Given** the database exists
**When** the app launches again
**Then** existing data is preserved
**And** migrations run if schema version is outdated

**Tests:**
- [ ] Integration: Database file created at correct path
- [ ] Integration: WAL mode is active (PRAGMA journal_mode)
- [ ] Unit: Schema migrations run idempotently
- [ ] Unit: conversations table has correct columns
- [ ] Unit: messages table has correct columns and foreign keys

---

### Story 1.5: Agent Server Process

As a user,
I want the AI agent to run as a local service,
So that my requests are processed quickly without external dependencies.

**Acceptance Criteria:**

**Given** the Tauri app launches
**When** initialization completes
**Then** the Agent Server (Node.js) starts on localhost:3001 (ARCH-005)
**And** the server is a child process managed by Tauri
**And** health endpoint responds at /health

**Given** the Agent Server is running
**When** the Tauri app quits
**Then** the Agent Server process is terminated cleanly

**Given** the Agent Server crashes
**When** Tauri detects the failure
**Then** the server is automatically restarted
**And** the user sees a non-blocking notification

**Tests:**
- [ ] Integration: Server starts and responds on port 3001
- [ ] Integration: Server stops when app quits
- [ ] Integration: Server auto-restarts after simulated crash
- [ ] Unit: Health endpoint returns 200 with status JSON
- [ ] E2E: App remains functional during server restart

---

### Story 1.6: Chat Message Storage

As a user,
I want my conversations saved locally,
So that I can continue where I left off and search past chats.

**Acceptance Criteria:**

**Given** I send a message to Orion
**When** the message is submitted
**Then** it is persisted to the messages table with timestamp, role, content
**And** it belongs to a conversation record

**Given** I have past conversations
**When** I relaunch the app
**Then** my conversation history is restored
**And** messages appear in correct chronological order

**Given** a conversation exists
**When** I view it
**Then** the conversation has a title (auto-generated or user-set)
**And** I can see when it was last updated

**Tests:**
- [ ] Integration: Message persists to SQLite after send
- [ ] Integration: Messages load on app restart
- [ ] Unit: Message schema validates role (user/assistant/system)
- [ ] Unit: Conversation auto-generates title from first message
- [ ] E2E: 100 messages load in under 500ms

---

### Story 1.7: Claude Integration

As a user,
I want to chat with Claude through Orion,
So that I can get AI assistance for my daily tasks.

**Acceptance Criteria:**

**Given** I have entered my Anthropic API key (or it's configured)
**When** I send a message
**Then** the message is sent to Claude API via the Agent Server
**And** Claude's response is received and displayed
**And** the conversation context is maintained

**Given** the API key is invalid or missing
**When** I try to send a message
**Then** I see a clear error message explaining the issue
**And** I'm prompted to enter/fix my API key

**Given** Claude API returns an error
**When** the error occurs
**Then** the error is displayed to me in a user-friendly format
**And** I can retry the message

**Tests:**
- [ ] Integration: Message round-trip to Claude API works
- [ ] Integration: Multi-turn conversation maintains context
- [ ] Unit: API key validation rejects malformed keys
- [ ] E2E: Invalid API key shows helpful error message
- [ ] E2E: Network error shows retry option

---

### Story 1.8: Streaming Responses

As a user,
I want to see Claude's response appear word-by-word,
So that I get immediate feedback and the experience feels responsive.

**Acceptance Criteria:**

**Given** I send a message to Claude
**When** Claude starts responding
**Then** tokens stream in real-time via SSE (ARCH-023)
**And** I see a typing indicator before first token
**And** latency to first token is <500ms p95 (NFR-P001)

**Given** streaming is in progress
**When** tokens arrive
**Then** they append smoothly without flickering
**And** the chat auto-scrolls to show new content

**Given** streaming completes
**When** the final token arrives
**Then** the typing indicator disappears
**And** the message is marked as complete in the database

**Tests:**
- [ ] Integration: SSE connection established to Agent Server
- [ ] E2E: First token appears within 500ms (measure p95)
- [ ] E2E: Tokens render without visual glitches
- [ ] Unit: Typing indicator state machine is correct
- [ ] E2E: Long response (1000+ tokens) streams smoothly

---

### Story 1.9: Split-Screen Layout

As a user,
I want a split-screen with chat on one side and a canvas on the other,
So that I can converse with Orion while viewing rich content.

**Acceptance Criteria:**

**Given** the app is open
**When** I view the main interface
**Then** the layout shows Chat panel (35%) + Canvas panel (65%) (FR-CH001)
**And** the sidebar (280px) is on the left
**And** the agent rail (64px) is visible

**Given** the canvas is empty
**When** no content is displayed
**Then** a helpful placeholder/welcome message appears
**And** the canvas can be collapsed to give chat full width

**Given** I resize the window
**When** the window is narrower than 1000px
**Then** the layout gracefully adapts (canvas collapses or tabs)

**Tests:**
- [ ] Visual regression: Layout matches design spec at 1440px width
- [ ] E2E: Panel proportions are 35/65 (±2%)
- [ ] E2E: Canvas collapse/expand works
- [ ] E2E: Responsive behavior at 1000px, 800px breakpoints
- [ ] Unit: Layout component calculates widths correctly

---

### Story 1.10: Tool Call Visualization

As a user,
I want to see what tools Orion is using during a conversation,
So that I understand what's happening and can trust the AI's actions.

**Acceptance Criteria:**

**Given** Claude invokes a tool during response
**When** the tool call is made
**Then** a collapsible card appears showing the tool name (FR-CH004)
**And** the card shows input parameters (summarized)
**And** the card shows output result (summarized)

**Given** a tool card is displayed
**When** I click to expand it
**Then** I see the full tool input and output JSON
**And** I can collapse it again

**Given** multiple tools are called
**When** they execute
**Then** each gets its own card in sequence
**And** timing/duration is shown for each

**Tests:**
- [ ] E2E: Tool card appears when mock tool is invoked
- [ ] E2E: Card expands/collapses correctly
- [ ] Unit: Tool card renders input/output safely (no XSS)
- [ ] E2E: Multiple tool cards stack correctly
- [ ] Visual regression: Tool card matches design spec

---

### Story 1.11: Quick Actions & Keyboard Shortcuts

As a power user,
I want keyboard shortcuts and suggested actions,
So that I can work efficiently without reaching for the mouse.

**Acceptance Criteria:**

**Given** I'm in the chat input
**When** I press Cmd+Enter
**Then** my message sends (FR-CH006)

**Given** I'm anywhere in the app
**When** I press Cmd+K
**Then** the command palette opens (FR-CH006)

**Given** Claude has context about possible actions
**When** a response completes
**Then** suggested quick actions appear as chips (FR-CH005)
**And** clicking a chip triggers that action

**Given** the command palette is open
**When** I type a query
**Then** matching commands filter in real-time
**And** I can select with arrow keys and Enter

**Tests:**
- [ ] E2E: Cmd+Enter sends message
- [ ] E2E: Cmd+K opens command palette
- [ ] E2E: Quick action chips are clickable
- [ ] Unit: Keyboard event handlers are registered correctly
- [ ] E2E: Command palette filters and selects
- [ ] Accessibility: All shortcuts have visible hints

---

## Epic 2: Agent & Automation Infrastructure

Users benefit from an intelligent agent system with hooks, skills, and specialized agents adapted from Continuous Claude v3.

### Story 2.1: Butler Agent Core

As a user,
I want a main orchestrator agent that understands my requests,
So that complex tasks are handled intelligently without manual coordination.

**Acceptance Criteria:**

**Given** I send a message to Orion
**When** the Butler Agent receives it
**Then** it analyzes intent and determines if it can handle directly or needs to delegate
**And** it maintains conversation context across turns
**And** it has access to the full tool catalog

**Given** a task requires multiple steps
**When** the Butler Agent processes it
**Then** it breaks down the task into sub-tasks
**And** it coordinates execution in logical order
**And** it synthesizes results into a coherent response

**Tests:**
- [ ] Unit: Butler agent prompt template loads correctly
- [ ] Integration: Butler processes simple query end-to-end
- [ ] Integration: Butler delegates to specialist agent when appropriate
- [ ] Unit: Intent classification identifies task types
- [ ] E2E: Multi-step task completes with synthesized result

---

### Story 2.2: Agent Prompt Templates

As a developer,
I want standardized prompt templates for each agent type,
So that agent behavior is consistent and maintainable.

**Acceptance Criteria:**

**Given** an agent is initialized
**When** it loads its configuration
**Then** it uses the prompt template from the templates directory
**And** templates support variable interpolation (user name, context, etc.)
**And** templates include system instructions, persona, and constraints

**Given** 31 agents are available (6 Orion-specific + 25 reusable/adapted)
**When** templates are validated
**Then** each has: name, description, system prompt, tools list
**And** the 6 Orion-specific agents have detailed prompts (> 1000 chars)

**Agent Inventory (31 total):**
- **Orion Core (6):** butler, triage, scheduler, communicator, navigator, preference_learner
- **Reusable (6):** oracle, maestro, scribe, memory-extractor, chronicler, context-query-agent
- **Adaptable (14):** scout, architect, sleuth, spark, critic, herald, profiler, plan-agent, review-agent, validate-agent, debug-agent, onboard, pathfinder, phoenix
- **Optional (5):** aegis, arbiter, atlas, kraken, liaison

**NOT IN SCOPE:** BMAD agents, code-only agents (braintrust-analyst, research-codebase, session-analyst, surveyor, judge)

**Tests:**
- [ ] Unit: All 31 agent templates parse without errors
- [ ] Unit: Variable interpolation works ({{user_name}}, {{context}})
- [ ] Unit: 6 Orion core agents have complete prompt definitions (> 1000 chars)
- [ ] Unit: butler.md and triage.md have valid YAML frontmatter
- [ ] Integration: Agent loads and uses correct template at runtime

---

### Story 2.2b: CC v3 Hooks Integration

As a developer,
I want Claude Code hooks integrated into Orion,
So that automatic behaviors (search routing, validation, coordination) work.

**Acceptance Criteria:**

**Given** Orion starts up
**When** the hook system initializes
**Then** hooks are registered in `.claude/settings.json`
**And** hooks receive correct lifecycle events
**And** hooks can inject context, block tools, or modify behavior

**Given** an agent wants to read a code file
**When** Read tool is invoked
**Then** `tldr-read-enforcer` hook intercepts and returns TLDR context (95% token savings)

**Given** an agent edits a TypeScript file
**When** Edit completes
**Then** `typescript-preflight` runs type checking and returns errors immediately

**Given** a user submits a prompt
**When** UserPromptSubmit fires
**Then** `skill-activation-prompt` suggests relevant skills
**And** `memory-awareness` injects relevant past learnings

**Hook Categories (34 hooks total from CC v3):**
- **Session Lifecycle (4):** session-register, session-start-recall, session-end-cleanup, session-outcome
- **User Prompt (3):** skill-activation-prompt, memory-awareness, premortem-suggest
- **Tool Interception (4):** tldr-read-enforcer, smart-search-router, file-claims, signature-helper
- **Validation (3):** typescript-preflight, compiler-in-the-loop, import-validator
- **Subagent (3):** subagent-start, subagent-stop, subagent-learning

**Tests:**
- [ ] Unit: Hook registration JSON is valid
- [ ] Unit: All hook scripts are executable
- [ ] Integration: SessionStart hooks register session in PostgreSQL
- [ ] Integration: PreToolUse Read hook returns TLDR context
- [ ] Integration: PostToolUse runs type checking
- [ ] E2E: Full session lifecycle (start → prompt → tool → end)

---

### Story 2.3: Sub-Agent Spawning

As a user,
I want the Butler to delegate to specialist agents,
So that domain-specific tasks get expert handling.

**Acceptance Criteria:**

**Given** the Butler identifies a specialized task (e.g., scheduling)
**When** it decides to delegate
**Then** it spawns the appropriate sub-agent (e.g., Scheduler Agent)
**And** passes relevant context to the sub-agent
**And** receives the sub-agent's result

**Given** a sub-agent is working
**When** I view the chat
**Then** I can see which agent is currently active
**And** the agent rail shows the active agent highlighted

**Given** a sub-agent completes
**When** control returns to Butler
**Then** the Butler incorporates the result into its response
**And** conversation history includes the delegation

**Tests:**
- [ ] Integration: Butler spawns Triage Agent for inbox tasks
- [ ] Integration: Butler spawns Scheduler Agent for calendar tasks
- [ ] Integration: Context passes correctly between agents
- [ ] E2E: Agent rail updates to show active agent
- [ ] Unit: Agent handoff preserves conversation state

---

### Story 2.4: Tool Permission System (canUseTool)

As a user,
I want control over what actions agents can take automatically,
So that I maintain oversight of sensitive operations.

**Acceptance Criteria:**

**Given** an agent wants to use a tool
**When** it calls canUseTool callback (ARCH-021)
**Then** read-only tools execute automatically
**And** write/send tools require user confirmation
**And** destructive tools are blocked until explicitly approved

**Given** a tool requires confirmation
**When** the agent requests it
**Then** I see a clear prompt explaining what the tool will do
**And** I can approve, deny, or modify the action
**And** my decision is logged for audit

**Given** I've approved a tool type before
**When** the same tool is requested again in the session
**Then** I can choose "always allow" for the session
**And** session permissions reset on app restart

**Tests:**
- [ ] Unit: canUseTool categorizes tools correctly (read/write/destructive)
- [ ] E2E: Read tools execute without prompt
- [ ] E2E: Write tools show confirmation dialog
- [ ] E2E: "Always allow" persists for session
- [ ] Integration: Permission decisions are logged to action_log

---

### Story 2.5: Triage Agent Definition

As a user,
I want a specialist agent for inbox processing,
So that my emails are analyzed and prioritized intelligently.

**Acceptance Criteria:**

**Given** the Triage Agent is invoked (ARCH-012)
**When** it processes inbox items
**Then** it uses structured outputs for type-safe results (ARCH-018)
**And** it calculates priority scores (0.0-1.0)
**And** it extracts action items with confidence scores

**Given** the Triage Agent analyzes an email
**When** analysis completes
**Then** results include: priority, category, suggested actions, extracted tasks
**And** results are validated against the TriageResult schema

**Tests:**
- [ ] Unit: Triage agent prompt includes scoring criteria
- [ ] Unit: TriageResult schema validates correctly
- [ ] Integration: Triage produces structured output for sample email
- [ ] Unit: Priority score is always 0.0-1.0
- [ ] Unit: Extracted tasks include confidence scores

---

### Story 2.6: Scheduler Agent Definition

As a user,
I want a specialist agent for calendar management,
So that scheduling is handled with awareness of my availability.

**Acceptance Criteria:**

**Given** the Scheduler Agent is invoked (ARCH-013)
**When** it handles a scheduling request
**Then** it uses extended thinking for complex scheduling (ARCH-019)
**And** thinking budget is 1,024-15,000 tokens based on complexity

**Given** a scheduling conflict exists
**When** the Scheduler analyzes options
**Then** it considers: existing events, preferences, travel time, focus blocks
**And** it proposes alternatives ranked by suitability

**Tests:**
- [ ] Unit: Scheduler agent prompt includes availability logic
- [ ] Integration: Extended thinking activates for complex requests
- [ ] Unit: Thinking budget scales with request complexity
- [ ] Integration: Scheduler identifies conflicts correctly
- [ ] E2E: Scheduling suggestion respects existing calendar

---

### Story 2.7: Communicator Agent Definition

As a user,
I want a specialist agent for drafting messages,
So that my communications match my tone and style.

**Acceptance Criteria:**

**Given** the Communicator Agent is invoked (ARCH-014)
**When** it drafts a message
**Then** it references my past communications for tone
**And** it considers the recipient relationship
**And** it produces a draft with appropriate formality

**Given** the agent generates a draft
**When** I review it
**Then** I can edit before sending (never auto-send)
**And** edits inform future drafts (learning)

**Tests:**
- [ ] Unit: Communicator prompt includes tone-matching instructions
- [ ] Integration: Draft quality varies by recipient relationship
- [ ] E2E: Draft appears in canvas for editing
- [ ] Unit: Never auto-sends (requires explicit user action)
- [ ] Integration: User edits are stored for learning

---

### Story 2.8: Navigator Agent Definition

As a user,
I want a specialist agent for searching my PARA system,
So that I can find information across projects, areas, and archives.

**Acceptance Criteria:**

**Given** the Navigator Agent is invoked (ARCH-015)
**When** I search for something
**Then** it queries across projects, areas, resources, and archive
**And** it uses semantic search with embeddings
**And** results are ranked by relevance

**Given** search results are found
**When** displayed to user
**Then** each result shows: title, category (P/A/R/Archive), relevance score
**And** I can navigate directly to the item

**Tests:**
- [ ] Unit: Navigator prompt includes PARA search logic
- [ ] Integration: Search queries all four PARA categories
- [ ] Integration: Semantic search uses embeddings correctly
- [ ] E2E: Results are clickable and navigate to item
- [ ] Unit: Relevance scoring is consistent

---

### Story 2.9: Preference Learner Agent Definition

As a user,
I want Orion to learn my preferences over time,
So that it gets better at anticipating my needs.

**Acceptance Criteria:**

**Given** the Preference Learner Agent observes my behavior (ARCH-016)
**When** it detects a pattern
**Then** it records the preference with source (observed vs explicit)
**And** it stores confidence level based on repetition

**Given** preferences are stored
**When** other agents make decisions
**Then** preferences are injected into their context
**And** decisions align with learned preferences

**Tests:**
- [ ] Unit: Preference Learner prompt includes pattern detection
- [ ] Integration: Repeated behavior increases confidence
- [ ] Unit: Preference schema includes source and confidence
- [ ] Integration: Preferences inject into Butler context
- [ ] E2E: Agent behavior reflects learned preference

---

### Story 2.10: Prompt Caching Setup

As a system,
I want to cache common prompt prefixes,
So that API costs are reduced by 50-80% (ARCH-020).

**Acceptance Criteria:**

**Given** an agent sends a request to Claude
**When** the system prompt is cacheable
**Then** cache_control markers are applied correctly
**And** subsequent requests reuse cached tokens

**Given** caching is active
**When** monitoring API usage
**Then** cache hit rate is visible in logs
**And** cost savings are trackable

**Tests:**
- [ ] Unit: Prompt caching headers are set correctly
- [ ] Integration: Cache hits occur on repeated agent calls
- [ ] Unit: Cache control markers are in correct positions
- [ ] Integration: Logs show cache hit/miss ratio
- [ ] E2E: Measurable cost reduction in API billing

---

## Epic 3: Connect Your Tools

Users can connect Gmail and Google Calendar via OAuth, see connection status, and verify that tools work.

### Story 3.1: Composio MCP Integration

As a developer,
I want Composio integrated as the tool provider,
So that agents can access external services through a unified interface.

**Acceptance Criteria:**

**Given** the Agent Server starts
**When** Composio MCP initializes (ARCH-004)
**Then** the MCP server connects successfully
**And** available tools are registered in the tool catalog
**And** connection health is monitored

**Given** Composio connection fails
**When** the error occurs
**Then** the system gracefully degrades
**And** user sees "Tool connections unavailable" message
**And** retry is attempted with exponential backoff

**Tests:**
- [ ] Integration: Composio MCP connects on server start
- [ ] Unit: Tool catalog populates from Composio
- [ ] Integration: Connection failure triggers graceful degradation
- [ ] Unit: Retry logic uses exponential backoff
- [ ] E2E: App remains functional when Composio is down

---

### Story 3.2: OAuth Flow for Gmail

As a user,
I want to connect my Gmail account securely,
So that Orion can access my emails with my permission.

**Acceptance Criteria:**

**Given** I click "Connect Gmail"
**When** the OAuth flow starts
**Then** I'm redirected to Google's consent screen
**And** I can review requested permissions (read, send, labels)
**And** I can approve or deny access

**Given** I approve the OAuth request
**When** the callback completes
**Then** access and refresh tokens are stored securely
**And** connection status shows "Connected"
**And** I can see which Gmail account is connected

**Given** I deny the OAuth request
**When** the flow cancels
**Then** I return to the app with no connection
**And** I can try again later

**Tests:**
- [ ] E2E: OAuth flow opens Google consent screen
- [ ] Integration: Tokens are stored after successful auth
- [ ] E2E: Connection status updates to "Connected"
- [ ] E2E: Denied OAuth returns gracefully
- [ ] Unit: Tokens are encrypted at rest

---

### Story 3.3: OAuth Flow for Google Calendar

As a user,
I want to connect my Google Calendar,
So that Orion can view and manage my schedule.

**Acceptance Criteria:**

**Given** I click "Connect Calendar"
**When** the OAuth flow starts
**Then** I'm redirected to Google's consent screen
**And** requested permissions include: read events, create events
**And** the flow can be combined with Gmail if same account

**Given** I already connected Gmail
**When** I connect Calendar with same Google account
**Then** the existing OAuth is extended (not duplicated)
**And** both connections show as active

**Tests:**
- [ ] E2E: Calendar OAuth flow completes successfully
- [ ] Integration: Calendar tokens stored correctly
- [ ] E2E: Combined auth with Gmail works
- [ ] Unit: Scopes are correctly requested
- [ ] E2E: Both Gmail and Calendar show connected

---

### Story 3.4: Token Refresh Mechanism

As a user,
I want my connections to stay active,
So that I don't have to re-authenticate constantly.

**Acceptance Criteria:**

**Given** an OAuth token is about to expire
**When** the system detects expiry (< 5 min remaining)
**Then** it automatically refreshes using the refresh token (NFR-S002)
**And** the new token is stored without user intervention

**Given** a refresh token is invalid or revoked
**When** refresh fails
**Then** I'm prompted to re-authenticate
**And** the error message explains why
**And** my data remains intact

**Tests:**
- [ ] Integration: Token refresh happens before expiry
- [ ] Unit: Refresh triggers at < 5 min remaining
- [ ] E2E: Expired token prompts re-auth gracefully
- [ ] Integration: Revoked token is handled correctly
- [ ] Unit: Token refresh doesn't interrupt active operations

---

### Story 3.5: Connection Status Dashboard

As a user,
I want to see which tools are connected,
So that I know what Orion can access.

**Acceptance Criteria:**

**Given** I open settings or the connection panel
**When** viewing tool connections
**Then** I see a list of available integrations (Gmail, Calendar, etc.)
**And** each shows status: Connected, Not Connected, or Error
**And** connected items show the account (e.g., user@gmail.com)

**Given** a connection has an error
**When** I view the status
**Then** I see a clear error description
**And** I can click to reconnect or troubleshoot

**Tests:**
- [ ] E2E: Connection panel shows all integration options
- [ ] E2E: Connected services show account email
- [ ] E2E: Error state displays with reconnect option
- [ ] Unit: Connection status updates in real-time
- [ ] Visual regression: Connection panel matches design

---

### Story 3.6: Rate Limiting for Tool Calls

As a system,
I want to respect API rate limits,
So that connections aren't throttled or blocked.

**Acceptance Criteria:**

**Given** agents make tool calls via Composio
**When** rate limits are approached
**Then** the rate limiter (PM-002) throttles requests
**And** requests are queued rather than failed

**Given** rate limit is hit
**When** further requests are made
**Then** user sees "Syncing paused, will resume shortly" (PM-003)
**And** requests resume automatically when limit resets

**Tests:**
- [ ] Unit: Rate limiter tracks calls per minute
- [ ] Integration: Requests queue when near limit
- [ ] E2E: User sees graceful "paused" message
- [ ] Integration: Requests resume after rate limit reset
- [ ] Unit: Rate limits are per-service (Gmail vs Calendar)

---

### Story 3.7: Tool Connection Verification

As a user,
I want to verify my connections work,
So that I have confidence before relying on Orion.

**Acceptance Criteria:**

**Given** I've connected Gmail
**When** I click "Test Connection"
**Then** a test API call fetches my recent emails
**And** success shows "Connection verified"
**And** failure shows specific error

**Given** I've connected Calendar
**When** I click "Test Connection"
**Then** a test API call fetches today's events
**And** results confirm access is working

**Tests:**
- [ ] E2E: Gmail test connection succeeds with valid auth
- [ ] E2E: Calendar test connection succeeds
- [ ] E2E: Test shows failure for invalid token
- [ ] Unit: Test calls are minimal (not full sync)
- [ ] E2E: Success message appears within 3 seconds

---

## Epic 4: Unified Inbox Experience

Users can see all their emails in a unified inbox with AI-powered priority scoring and triage actions.

### Story 4.1: Email Sync from Gmail

As a user,
I want my emails synced to Orion,
So that I can manage them without switching to Gmail.

**Acceptance Criteria:**

**Given** Gmail is connected
**When** sync runs
**Then** emails from the last 7 days are fetched
**And** emails are stored in the local SQLite database
**And** sync is incremental (only new/changed emails)

**Given** I have 500+ emails
**When** initial sync runs
**Then** sync completes within 30 seconds
**And** progress indicator shows sync status
**And** I can start using the app before sync completes

**Tests:**
- [ ] Integration: Emails sync from Gmail API
- [ ] Unit: Only new emails fetched on subsequent sync
- [ ] E2E: 500 emails sync in under 30 seconds
- [ ] E2E: Progress indicator shows during sync
- [ ] Unit: Email schema stores all required fields

---

### Story 4.2: Unified Inbox View

As a user,
I want to see all actionable items in one place,
So that I don't miss important things across different services.

**Acceptance Criteria:**

**Given** I open the Inbox view
**When** it loads
**Then** I see emails displayed in a unified list (FR-I001)
**And** items show: sender, subject, preview, timestamp
**And** unread items are visually distinct

**Given** the inbox has 100+ items
**When** I scroll
**Then** items virtualize for performance
**And** scrolling is smooth (60fps)

**Tests:**
- [ ] E2E: Inbox displays synced emails
- [ ] E2E: Unread items have distinct styling
- [ ] E2E: 100+ items scroll smoothly
- [ ] Unit: Virtualization activates for large lists
- [ ] Visual regression: Inbox matches design spec

---

### Story 4.3: Priority Scoring Engine

As a user,
I want my inbox items prioritized automatically,
So that I focus on what matters most.

**Acceptance Criteria:**

**Given** an email is processed by Triage Agent
**When** analysis completes
**Then** it receives a priority score 0.0-1.0 (FR-I002)
**And** score factors include: sender importance, urgency signals, deadlines

**Given** emails have priority scores
**When** viewing inbox
**Then** items can be sorted by priority (highest first)
**And** high-priority items (>0.7) are visually highlighted

**Tests:**
- [ ] Unit: Priority score is always in 0.0-1.0 range
- [ ] Integration: Triage Agent produces scores for emails
- [ ] E2E: Inbox sorts by priority correctly
- [ ] E2E: High-priority items are visually distinct
- [ ] Unit: Score factors are weighted correctly

---

### Story 4.4: Action Item Extraction

As a user,
I want tasks extracted from emails automatically,
So that I don't forget action items buried in messages.

**Acceptance Criteria:**

**Given** an email contains action items
**When** Triage Agent analyzes it
**Then** action items are extracted with confidence scores (FR-I005)
**And** each action has: description, due date (if mentioned), source email

**Given** action items are extracted
**When** I view the email
**Then** I see extracted actions as chips below the email
**And** I can click to convert to a task (with confirmation)

**Tests:**
- [ ] Integration: Triage extracts actions from sample emails
- [ ] Unit: Confidence scores are 0.0-1.0
- [ ] E2E: Action chips appear on emails with tasks
- [ ] E2E: Clicking chip converts to task with confirmation
- [ ] Unit: Due date parsing handles various formats

---

### Story 4.5: Quick File to Project/Area

As a user,
I want to file inbox items to my projects quickly,
So that I can organize and clear my inbox efficiently.

**Acceptance Criteria:**

**Given** I'm viewing an inbox item
**When** I click "File" or press F
**Then** I see a dropdown with suggested projects/areas (FR-I003)
**And** suggestions are ranked by relevance
**And** I can search for other destinations

**Given** I select a destination
**When** filing completes
**Then** the item is linked to that project/area
**And** the item is removed from inbox (or marked as processed)

**Tests:**
- [ ] E2E: File dropdown shows suggestions
- [ ] Integration: Suggestions use AI relevance scoring
- [ ] E2E: Filing links item to project
- [ ] E2E: Filed item leaves inbox
- [ ] Unit: Keyboard shortcut F triggers file action

---

### Story 4.6: Bulk Actions

As a user,
I want to process multiple inbox items at once,
So that I can clear my inbox quickly.

**Acceptance Criteria:**

**Given** I'm in the inbox
**When** I select multiple items (checkbox or Shift+click)
**Then** a bulk action bar appears (FR-I006)
**And** available actions: Archive, File, Snooze, Mark Read

**Given** multiple items are selected
**When** I apply a bulk action
**Then** all selected items are processed in <5 seconds (NFR-P004)
**And** I see progress indicator for large batches

**Tests:**
- [ ] E2E: Multi-select works with checkbox and Shift
- [ ] E2E: Bulk action bar appears on selection
- [ ] E2E: 10+ items process in under 5 seconds
- [ ] E2E: Progress shows for bulk operations
- [ ] Unit: Each bulk action type works correctly

---

### Story 4.7: Snooze Until Later

As a user,
I want to snooze items until a better time,
So that I can focus now and handle them later.

**Acceptance Criteria:**

**Given** I'm viewing an inbox item
**When** I click "Snooze" or press S
**Then** I see options: Later Today, Tomorrow, Next Week, Custom (FR-I007)
**And** I can pick a specific date/time

**Given** I snooze an item
**When** snooze time arrives
**Then** the item reappears in my inbox
**And** it shows as "Snoozed from [date]"

**Tests:**
- [ ] E2E: Snooze options display correctly
- [ ] E2E: Custom date/time picker works
- [ ] Integration: Snoozed item returns at scheduled time
- [ ] Unit: Snooze reminders use system notifications
- [ ] E2E: Returned item shows snooze origin

---

### Story 4.8: Undo Support for Actions

As a user,
I want to undo recent actions,
So that I can recover from mistakes quickly.

**Acceptance Criteria:**

**Given** I perform an action (file, archive, snooze, bulk)
**When** the action completes
**Then** a toast appears with "Undo" option (UX-007)
**And** undo window is 5 seconds
**And** clicking Undo reverses the action

**Given** I undo an action
**When** undo completes
**Then** the item returns to its previous state
**And** action_log records both action and undo (PM-001)

**Tests:**
- [ ] E2E: Undo toast appears after actions
- [ ] E2E: Undo reverses file action
- [ ] E2E: Undo reverses archive action
- [ ] Unit: 5-second timeout dismisses toast
- [ ] Integration: action_log records undo events

---

### Story 4.9: Inbox Status Indicators

As a user,
I want to see the status of each inbox item at a glance,
So that I know what needs attention.

**Acceptance Criteria:**

**Given** I view the inbox
**When** items display
**Then** each has a status indicator (UX-009)
**And** indicators: ● needs attention (red), ○ working (yellow), ✓ done (green)

**Given** an item's status changes
**When** I process it or AI updates it
**Then** the indicator updates in real-time
**And** transitions are animated smoothly

**Tests:**
- [ ] E2E: Status indicators display on all items
- [ ] E2E: Indicator changes when item is processed
- [ ] Unit: Three status states render correctly
- [ ] E2E: Real-time updates work
- [ ] Visual regression: Indicators match design

---

## Epic 5: Email Communication

Users can read, compose, and send emails through Orion with AI-generated drafts in their tone.

### Story 5.1: Email Reading View

As a user,
I want to read emails in Orion,
So that I can stay focused without switching to Gmail.

**Acceptance Criteria:**

**Given** I click an email in the inbox
**When** the email opens
**Then** it displays in the canvas panel (FR-E001)
**And** HTML emails render correctly with styling
**And** Plain text emails display with proper formatting
**And** Images load (with option to block)

**Given** an email has attachments
**When** viewing the email
**Then** attachments are listed with file names and sizes
**And** I can download attachments

**Tests:**
- [ ] E2E: HTML email renders correctly
- [ ] E2E: Plain text email displays properly
- [ ] E2E: Inline images load
- [ ] E2E: Attachments are downloadable
- [ ] Unit: Email sanitization prevents XSS

---

### Story 5.2: Email Composer in Canvas

As a user,
I want to compose emails in Orion,
So that I can respond without leaving the app.

**Acceptance Criteria:**

**Given** I click "Reply" or "Compose"
**When** the composer opens
**Then** it appears in the canvas panel (UX-008)
**And** canvas slides in at 50% width with 600ms animation
**And** composer includes: To, CC, BCC, Subject, Body

**Given** I'm composing a reply
**When** the composer loads
**Then** it pre-fills To, Subject (Re:), and quoted original message
**And** cursor is positioned at the start of the body

**Tests:**
- [ ] E2E: Reply opens composer with pre-filled fields
- [ ] E2E: Compose opens blank composer
- [ ] E2E: Canvas slide animation is smooth
- [ ] Unit: Reply prefills correct fields
- [ ] E2E: CC/BCC fields expand on click

---

### Story 5.3: AI Draft Generation

As a user,
I want Orion to draft emails for me,
So that I can respond quickly in my own style.

**Acceptance Criteria:**

**Given** I'm composing a reply
**When** I click "Draft Reply" or AI suggests a draft (FR-I004)
**Then** Communicator Agent generates a draft in <5 seconds (NFR-P006)
**And** draft matches my communication style (FR-E003)
**And** draft appears in the composer body

**Given** a draft is generated
**When** I view it
**Then** I can accept, edit, or regenerate
**And** regenerate offers options: more formal, more casual, shorter, longer

**Tests:**
- [ ] Integration: Communicator Agent generates draft
- [ ] E2E: Draft appears in under 5 seconds
- [ ] E2E: Regenerate options work
- [ ] Integration: Tone matches user's past emails
- [ ] Unit: Draft respects email context (thread, recipient)

---

### Story 5.4: Draft Review Before Send

As a user,
I want to review and edit drafts before sending,
So that I maintain control over my communications.

**Acceptance Criteria:**

**Given** I have a draft (AI or manual)
**When** I click "Send"
**Then** I see a confirmation dialog (UX-012, never auto-send)
**And** dialog shows: recipient(s), subject, preview

**Given** the confirmation dialog is shown
**When** I confirm
**Then** the email is sent via Gmail API (FR-E002)
**And** I see "Sent" confirmation
**And** email appears in Sent folder

**Tests:**
- [ ] E2E: Send button shows confirmation dialog
- [ ] E2E: Confirm sends email via API
- [ ] E2E: Cancel returns to composer
- [ ] Integration: Sent email appears in Gmail Sent folder
- [ ] Unit: Never sends without explicit confirmation

---

### Story 5.5: Email Templates

As a user,
I want to use templates for common responses,
So that I can handle repetitive emails quickly.

**Acceptance Criteria:**

**Given** I'm composing an email
**When** I click "Use Template"
**Then** I see a list of saved templates (FR-E005)
**And** templates show: name, preview
**And** I can search templates

**Given** I select a template
**When** it's applied
**Then** template content inserts into the composer
**And** placeholders ({{name}}, {{date}}) are highlighted for filling

**Given** I want to save a new template
**When** I compose an email and click "Save as Template"
**Then** I can name and save the template
**And** it appears in my template list

**Tests:**
- [ ] E2E: Template picker shows saved templates
- [ ] E2E: Template inserts into composer
- [ ] E2E: Placeholders highlight correctly
- [ ] E2E: Save as template works
- [ ] Unit: Template search filters correctly

---

### Story 5.6: Email Thread View

As a user,
I want to see email threads as conversations,
So that I have context for my replies.

**Acceptance Criteria:**

**Given** an email is part of a thread
**When** I view it
**Then** the full thread is displayed (oldest to newest)
**And** each message shows sender and timestamp
**And** the most recent message is highlighted

**Given** a thread has 10+ messages
**When** viewing
**Then** older messages are collapsed by default
**And** I can expand to see all messages
**And** context window handles up to 200k tokens (ARCH-022)

**Tests:**
- [ ] E2E: Thread displays multiple messages
- [ ] E2E: Messages are in chronological order
- [ ] E2E: Collapse/expand works for long threads
- [ ] Unit: Thread grouping uses message IDs correctly
- [ ] Integration: Long threads don't exceed context limits

---

## Epic 6: Calendar Management

Users can view their calendar, create events via chat, and get AI assistance finding meeting times.

### Story 6.1: Calendar Day/Week Views

As a user,
I want to see my calendar events,
So that I know what's on my schedule.

**Acceptance Criteria:**

**Given** Calendar is connected
**When** I open the Calendar view
**Then** I see events in a day or week view (FR-C001)
**And** I can toggle between day and week views
**And** events show: title, time, duration, attendees

**Given** I have overlapping events
**When** viewing the calendar
**Then** they display side-by-side (not obscured)
**And** I can click any event to see details

**Tests:**
- [ ] E2E: Day view displays today's events
- [ ] E2E: Week view shows 7 days
- [ ] E2E: Overlapping events display correctly
- [ ] E2E: Event click opens detail view
- [ ] Visual regression: Calendar matches design

---

### Story 6.2: Create Events via Chat

As a user,
I want to schedule meetings by telling Orion,
So that I don't have to manually fill calendar forms.

**Acceptance Criteria:**

**Given** I'm chatting with Orion
**When** I say "Schedule a meeting with John tomorrow at 2pm" (FR-C002)
**Then** Scheduler Agent parses the request
**And** it confirms: title, date, time, duration, attendees
**And** I can approve, modify, or cancel

**Given** I approve the event
**When** creation completes
**Then** the event is added to Google Calendar
**And** invites are sent to attendees

**Tests:**
- [ ] Integration: Natural language parsing extracts event details
- [ ] E2E: Confirmation shows correct parsed values
- [ ] E2E: Approved event appears in Calendar
- [ ] Integration: Attendees receive invites
- [ ] Unit: Parser handles various date/time formats

---

### Story 6.3: Mutual Availability Finder

As a user,
I want Orion to find times that work for everyone,
So that I don't have to manually check calendars.

**Acceptance Criteria:**

**Given** I want to schedule with multiple people
**When** I ask "Find a time for me and Sarah next week" (FR-C003)
**Then** Scheduler Agent checks available calendars
**And** it suggests 3-5 open slots
**And** slots show: date, time, duration

**Given** availability is checked
**When** results are shown
**Then** availability check completes within 3 seconds (NFR-P005)
**And** conflicts are explained if no slots exist

**Tests:**
- [ ] Integration: Scheduler queries multiple calendars
- [ ] E2E: Results appear within 3 seconds
- [ ] E2E: 3-5 suggestions displayed
- [ ] Unit: Conflict detection works correctly
- [ ] E2E: No availability case handled gracefully

---

### Story 6.4: Focus Time Blocking

As a user,
I want Orion to protect my focus time,
So that I have uninterrupted time for deep work.

**Acceptance Criteria:**

**Given** I set focus time preferences
**When** I ask to block focus time (FR-C004)
**Then** Scheduler Agent finds open slots in my calendar
**And** it creates "Focus Time" blocks
**And** blocks are marked as busy

**Given** focus time is scheduled
**When** someone tries to book during that time
**Then** the slot shows as unavailable
**And** I receive a notification of the conflict

**Tests:**
- [ ] E2E: Focus blocks appear on calendar
- [ ] E2E: Blocks marked as busy
- [ ] Integration: Availability excludes focus time
- [ ] Unit: Preference for focus time duration is respected
- [ ] E2E: Recurring focus blocks work

---

### Story 6.5: Meeting Prep Context

As a user,
I want relevant context before meetings,
So that I'm prepared for discussions.

**Acceptance Criteria:**

**Given** I have an upcoming meeting
**When** I view the event or ask about it (FR-C005)
**Then** Orion surfaces: recent emails with attendees, related documents, contact info
**And** context is gathered from PARA system

**Given** the meeting is in 15 minutes
**When** the reminder triggers
**Then** prep context is automatically shown
**And** I can dismiss or expand the prep card

**Tests:**
- [ ] Integration: Related emails fetched for attendees
- [ ] Integration: Contact info pulled from contacts
- [ ] E2E: Prep context appears on meeting click
- [ ] E2E: 15-minute reminder shows prep
- [ ] Unit: Context relevance scoring works

---

## Epic 7: Contact & Relationship Management

Users can manage contacts, search semantically, and see interaction history with each contact.

### Story 7.1: Contact Database Schema

As a user,
I want my contacts stored locally,
So that I have a single source of truth for relationships.

**Acceptance Criteria:**

**Given** the app initializes
**When** the database sets up
**Then** contacts table includes: name, email, phone, company, title, relationship (FR-CM001)
**And** organizations table links contacts to companies (FR-CM002)
**And** contact_preferences stores: preferred channel, timezone (FR-CM003)

**Tests:**
- [ ] Unit: Contact schema has all required fields
- [ ] Unit: Organization-contact relationship works
- [ ] Unit: Preferences schema stores channel and timezone
- [ ] Integration: CRUD operations work on contacts
- [ ] Unit: Unique constraint on email prevents duplicates

---

### Story 7.2: Contact CRUD Operations

As a user,
I want to create, view, edit, and delete contacts,
So that I can manage my network.

**Acceptance Criteria:**

**Given** I want to add a contact
**When** I create via UI or chat
**Then** the contact is saved with all provided fields (FR-R001)
**And** validation ensures email format is correct

**Given** I view a contact
**When** the detail page loads
**Then** I see all fields plus interaction history (FR-R003)

**Given** I delete a contact
**When** deletion completes
**Then** the contact is removed
**And** related items (tasks, emails) maintain references

**Tests:**
- [ ] E2E: Create contact via form
- [ ] E2E: Edit contact fields
- [ ] E2E: Delete contact with confirmation
- [ ] Unit: Email validation rejects invalid formats
- [ ] Integration: Deletion preserves related item references

---

### Story 7.3: Semantic Contact Search

As a user,
I want to search contacts by description,
So that I can find people even without exact names.

**Acceptance Criteria:**

**Given** I search "the designer from TechConf" (FR-R002)
**When** Navigator Agent processes the query
**Then** it uses semantic search with embeddings (ARCH-009)
**And** returns relevant contacts ranked by relevance
**And** precision is 80%+ in top 5 results (NFR-A004)

**Given** search results appear
**When** I view them
**Then** each shows: name, company, relevance indicator
**And** clicking navigates to contact detail

**Tests:**
- [ ] Integration: Semantic search uses BGE embeddings
- [ ] E2E: Natural language queries return results
- [ ] E2E: Top 5 results are relevant (80%+ precision)
- [ ] Unit: Embeddings are generated for new contacts
- [ ] E2E: Click navigates to contact

---

### Story 7.4: Interaction History

As a user,
I want to see my history with each contact,
So that I have context for relationships.

**Acceptance Criteria:**

**Given** I view a contact
**When** the history section loads (FR-R003)
**Then** I see: last email date, last meeting date, recent conversations
**And** history is sorted by recency

**Given** I've never interacted with a contact
**When** viewing history
**Then** I see "No interactions yet"
**And** I can initiate first contact from the profile

**Tests:**
- [ ] Integration: History aggregates from email, calendar
- [ ] E2E: History shows on contact detail page
- [ ] E2E: Sorted by most recent first
- [ ] E2E: Empty state shows correctly
- [ ] Unit: History query is performant (<500ms)

---

### Story 7.5: Auto-Enrichment from Signatures

As a user,
I want contact info extracted from email signatures,
So that my contacts stay up to date automatically.

**Acceptance Criteria:**

**Given** I receive an email from a contact
**When** the signature contains new info (FR-CM004)
**Then** Orion extracts: phone, title, company
**And** I'm prompted to update the contact
**And** I can approve, reject, or edit the update

**Given** I approve an enrichment
**When** the update saves
**Then** the contact reflects new information
**And** update source is marked as "auto-enriched"

**Tests:**
- [ ] Integration: Signature parsing extracts fields
- [ ] E2E: Enrichment prompt appears
- [ ] E2E: Approved update saves to contact
- [ ] Unit: Parser handles various signature formats
- [ ] Unit: Source tracking marks auto-enriched fields

---

### Story 7.6: Auto-Create Contacts from Email

As a user,
I want contacts created automatically when I email new people,
So that my network grows without manual entry.

**Acceptance Criteria:**

**Given** I send or receive email from an unknown address
**When** the email is processed (FR-CM005)
**Then** a new contact is created with name and email
**And** contact is marked as "auto-created"

**Given** an auto-created contact exists
**When** I view it
**Then** I can enrich with additional details
**And** I can merge if it's a duplicate

**Tests:**
- [ ] Integration: New contacts created from email
- [ ] Unit: Name parsed from email header
- [ ] E2E: Auto-created contacts appear in list
- [ ] E2E: Manual enrichment works
- [ ] E2E: Duplicate merge functionality works

---

### Story 7.7: Organization Linking

As a user,
I want to group contacts by company,
So that I can see my relationships with organizations.

**Acceptance Criteria:**

**Given** I have contacts at the same company
**When** viewing an organization (FR-R006)
**Then** I see all contacts linked to it
**And** I can see aggregate stats (total contacts, recent interactions)

**Given** I want to link a contact to an organization
**When** I edit the contact
**Then** I can select or create an organization
**And** the link is saved

**Tests:**
- [ ] E2E: Organization page shows linked contacts
- [ ] E2E: Contact can be linked to organization
- [ ] E2E: New organization creation works
- [ ] Unit: Organization has correct schema
- [ ] E2E: Aggregate stats calculate correctly

---

## Epic 8: Projects & Tasks (PARA)

Users can create projects, manage tasks, track progress, and file inbox items to projects.

### Story 8.1: Project Database Schema

As a user,
I want projects stored locally with all necessary fields,
So that I can track work comprehensively.

**Acceptance Criteria:**

**Given** the app initializes
**When** database sets up
**Then** projects table includes: name, description, deadline, status (FR-P001)
**And** project_stakeholders table links contacts with roles (FR-P003)
**And** status enum includes: active, on_hold, completed, archived

**Tests:**
- [ ] Unit: Project schema has all required fields
- [ ] Unit: Stakeholder relationship table works
- [ ] Unit: Status enum validates correctly
- [ ] Integration: CRUD operations work on projects
- [ ] Unit: Deadline stores as timestamp

---

### Story 8.2: Project CRUD Operations

As a user,
I want to create, view, edit, and archive projects,
So that I can manage my work.

**Acceptance Criteria:**

**Given** I want to create a project
**When** I fill the form or describe via chat
**Then** the project is created with name, description, deadline (FR-P001)
**And** I'm taken to the project view

**Given** I view a project
**When** the page loads
**Then** I see all tasks grouped by status: todo, in-progress, done (FR-P002)
**And** I see a progress bar based on completed tasks (FR-P005)

**Given** I archive a project
**When** archival completes (FR-P006)
**Then** I provide an archive reason
**And** the project moves to archive
**And** it's searchable in archive

**Tests:**
- [ ] E2E: Create project via form
- [ ] E2E: Create project via chat
- [ ] E2E: Tasks display grouped by status
- [ ] E2E: Progress bar updates with task completion
- [ ] E2E: Archive with reason works

---

### Story 8.3: Task Management

As a user,
I want to manage tasks within projects,
So that I can track work items.

**Acceptance Criteria:**

**Given** I create a task
**When** I fill in details
**Then** it has: title, description, status, priority, due date (FR-TM001)
**And** it's linked to a project/area (FR-TM002)
**And** source is tracked: manual, Gmail, Linear (FR-TM003)

**Given** I update a task status
**When** transitioning status
**Then** workflow is: pending > in_progress > completed > cancelled (FR-TM004)
**And** transitions are logged

**Tests:**
- [ ] E2E: Task creation with all fields
- [ ] E2E: Task status transitions work
- [ ] Unit: Status workflow validation
- [ ] Unit: Source tracking is correct
- [ ] E2E: Task linked to project displays correctly

---

### Story 8.4: Due Date Reminders

As a user,
I want reminders for task due dates,
So that I don't miss deadlines.

**Acceptance Criteria:**

**Given** a task has a due date
**When** the due date approaches (FR-TM005)
**Then** I receive a reminder notification
**And** notification shows: task title, due date, project

**Given** a task is overdue
**When** viewing the task list
**Then** overdue tasks are visually highlighted
**And** they appear at the top when sorted by due date

**Tests:**
- [ ] Integration: Reminder triggers at due date
- [ ] E2E: Notification displays correctly
- [ ] E2E: Overdue tasks highlighted
- [ ] E2E: Sorting by due date works
- [ ] Unit: Reminder scheduling is correct

---

### Story 8.5: Email-to-Task Extraction

As a user,
I want action items from emails to become tasks,
So that I capture commitments without manual entry.

**Acceptance Criteria:**

**Given** Triage Agent extracts action items from email (FR-P004)
**When** items are extracted
**Then** suggested project is shown based on email context
**And** I can accept, modify, or reject each task

**Given** I confirm an extracted task (FR-TM006)
**When** confirmation completes
**Then** task is created with source = "Gmail"
**And** task links back to source email

**Tests:**
- [ ] Integration: Extracted actions suggest correct project
- [ ] E2E: Confirmation dialog shows extracted tasks
- [ ] E2E: Confirmed task appears in project
- [ ] Unit: Source linkage to email works
- [ ] E2E: Rejection dismisses without creating task

---

### Story 8.6: Project Stakeholders

As a user,
I want to track who's involved in each project,
So that I know who to communicate with.

**Acceptance Criteria:**

**Given** I view a project
**When** looking at stakeholders (FR-P003)
**Then** I see contacts linked as: owner, collaborator, stakeholder
**And** I can add/remove stakeholders

**Given** I add a stakeholder
**When** selecting a contact
**Then** I assign a role
**And** the contact appears in project view

**Tests:**
- [ ] E2E: Stakeholders display on project page
- [ ] E2E: Add stakeholder with role works
- [ ] E2E: Remove stakeholder works
- [ ] Unit: Role types validate correctly
- [ ] E2E: Click stakeholder navigates to contact

---

## Epic 9: Areas & Archive (PARA)

Users can define life areas, organize hierarchically, and archive/restore completed work.

### Story 9.1: Area CRUD Operations

As a user,
I want to define life areas,
So that I can organize work by domain.

**Acceptance Criteria:**

**Given** I create an area
**When** I fill in details (FR-A001)
**Then** it's created with: name, description, icon
**And** areas include: Career, Health, Finance, Relationships, Home

**Given** I view an area
**When** the page loads (FR-A002)
**Then** I see hierarchical view: Area > Projects > Tasks
**And** I can drill down to any level

**Tests:**
- [ ] E2E: Create area works
- [ ] E2E: Edit area works
- [ ] E2E: Delete area (with confirmation)
- [ ] E2E: Hierarchical view displays correctly
- [ ] E2E: Drill-down navigation works

---

### Story 9.2: Area Goals and Standards

As a user,
I want to set goals for each area,
So that I can track progress toward outcomes.

**Acceptance Criteria:**

**Given** I'm viewing an area
**When** I add goals/standards (FR-A003)
**Then** I can set: goal description, target metric (optional), deadline
**And** goals display on area dashboard

**Given** a goal has a metric
**When** viewing progress
**Then** I see current vs target value
**And** visual indicator shows progress percentage

**Tests:**
- [ ] E2E: Add goal to area works
- [ ] E2E: Goal with metric displays progress
- [ ] E2E: Edit/delete goal works
- [ ] Unit: Progress calculation is correct
- [ ] Visual regression: Goal cards match design

---

### Story 9.3: Area-Specific Triage Preferences

As a user,
I want different triage rules for different areas,
So that work vs personal items are handled appropriately.

**Acceptance Criteria:**

**Given** I configure an area's preferences (FR-A005)
**When** setting triage rules
**Then** I can set: priority boost/penalty, auto-file rules, notification preferences
**And** preferences apply to items filed to that area

**Given** an email is triaged
**When** it matches an area's rules
**Then** the area-specific preferences modify the triage result

**Tests:**
- [ ] E2E: Area preferences UI works
- [ ] Integration: Triage respects area preferences
- [ ] Unit: Priority boost/penalty applies correctly
- [ ] E2E: Auto-file rules trigger appropriately
- [ ] E2E: Notification preferences respected

---

### Story 9.4: Archive Search

As a user,
I want to search my archive,
So that I can find completed or old work.

**Acceptance Criteria:**

**Given** items are archived (projects, tasks, etc.)
**When** I search the archive (FR-AR001)
**Then** full-text search finds matches
**And** semantic search finds contextually relevant items
**And** results show: item type, archive date, archive reason

**Tests:**
- [ ] E2E: Full-text search finds archived items
- [ ] Integration: Semantic search works on archive
- [ ] E2E: Results display with metadata
- [ ] E2E: Click navigates to archived item
- [ ] Unit: Search is performant (<1 second)

---

### Story 9.5: Archive Restore

As a user,
I want to restore archived items,
So that I can reactivate work when needed.

**Acceptance Criteria:**

**Given** I view an archived item
**When** I click "Restore" (FR-AR002)
**Then** I choose destination: original location or new location
**And** item returns to active state
**And** archive reason is preserved in history

**Given** an item is restored
**When** viewing its history
**Then** I see: original archive date/reason, restore date

**Tests:**
- [ ] E2E: Restore to original location works
- [ ] E2E: Restore to new location works
- [ ] E2E: Archive history preserved after restore
- [ ] Unit: Item state correctly changes to active
- [ ] E2E: Restored item appears in correct location

---

### Story 9.6: Archive with Context

As a user,
I want to document why items are archived,
So that I have context when reviewing later.

**Acceptance Criteria:**

**Given** I archive an item
**When** completing the archive action (FR-AR003)
**Then** I provide: reason (required), additional notes (optional)
**And** context is stored with the archived item

**Given** I view an archived item
**When** checking archive details
**Then** I see: who archived, when, why

**Tests:**
- [ ] E2E: Archive requires reason
- [ ] E2E: Additional notes saved
- [ ] E2E: Archive details display correctly
- [ ] Unit: Archive metadata schema is correct
- [ ] E2E: Search includes archive reasons

---

## Epic 10: Memory & Recall System

Users can see what Orion remembers, correct memories, and benefit from cross-session context.

### Story 10.1: PostgreSQL Shared Memory Setup

As a system,
I want a shared memory database,
So that context persists across sessions and devices.

**Acceptance Criteria:**

**Given** the app initializes
**When** memory system starts (ARCH-003)
**Then** PostgreSQL + pgvector connection is established
**And** memory tables include: preferences, decisions, facts
**And** embeddings use BGE-M3 (BAAI/bge-m3), 1024 dimensions

**Tests:**
- [ ] Integration: PostgreSQL connection works
- [ ] Unit: pgvector extension is available
- [ ] Unit: Memory tables have correct schema
- [ ] Integration: Embedding storage works
- [ ] Unit: Connection retry on failure

---

### Story 10.2: Preference Storage

As a user,
I want my preferences remembered,
So that Orion behaves consistently with my style.

**Acceptance Criteria:**

**Given** I express a preference (explicit or observed)
**When** Preference Learner records it (FR-M001)
**Then** preference is stored with: content, source (user/learned), confidence
**And** learned preferences indicate observation count

**Given** preferences exist
**When** I view the memory panel
**Then** I see my stored preferences
**And** I can edit or delete any preference

**Tests:**
- [ ] Integration: Explicit preference saves
- [ ] Integration: Learned preference saves with confidence
- [ ] E2E: Memory panel shows preferences
- [ ] E2E: Edit preference works
- [ ] E2E: Delete preference works

---

### Story 10.3: Decision Recall

As a user,
I want Orion to remember past decisions,
So that it's consistent and doesn't re-ask solved questions.

**Acceptance Criteria:**

**Given** I made a decision in a past session
**When** a similar situation arises (FR-M002)
**Then** Orion recalls the past decision
**And** it references it in context: "Last time you chose X"

**Given** I want to change a past decision
**When** I make a new choice
**Then** the new decision supersedes the old
**And** both are kept in history

**Tests:**
- [ ] Integration: Decision stored after making choice
- [ ] Integration: Similar situation triggers recall
- [ ] E2E: Past decision referenced in conversation
- [ ] E2E: Overriding decision works
- [ ] Unit: Decision similarity matching works

---

### Story 10.4: Memory Injection in Prompts

As an agent,
I want relevant context injected into my prompts,
So that I make informed decisions.

**Acceptance Criteria:**

**Given** an agent is processing a request
**When** building the prompt (FR-M003)
**Then** relevant memories are retrieved via semantic search
**And** memories are injected into the system prompt
**And** injection doesn't exceed token budget

**Given** memories are injected
**When** the agent responds
**Then** response reflects the injected context
**And** response quality is improved (70%+ helpful ratings target, NFR-A005)

**Tests:**
- [ ] Integration: Semantic retrieval finds relevant memories
- [ ] Unit: Memory injection respects token limits
- [ ] Integration: Injected memories appear in prompt
- [ ] E2E: Response quality improves with memory
- [ ] Unit: Embedding similarity threshold is tuned

---

### Story 10.5: Per-Contact Memory View

As a user,
I want to see what Orion remembers about each contact,
So that I can review and correct relationship context.

**Acceptance Criteria:**

**Given** I view a contact
**When** checking the memory section (FR-M004)
**Then** I see: preferences for communication, past decisions, noted facts
**And** each memory shows source and date

**Given** I want to correct a memory
**When** I edit or delete it
**Then** future interactions reflect the change
**And** corrections are logged

**Tests:**
- [ ] E2E: Memory section appears on contact page
- [ ] E2E: Memories display with source/date
- [ ] E2E: Edit memory works
- [ ] E2E: Delete memory works
- [ ] Integration: Correction affects future responses

---

### Story 10.6: Communication Templates Storage

As a user,
I want my email templates stored in memory,
So that they're available across sessions.

**Acceptance Criteria:**

**Given** I save an email template (FR-R004)
**When** it's stored
**Then** it syncs to shared memory
**And** it's available on any device

**Given** I access templates
**When** composing an email
**Then** templates load from memory
**And** recently used templates appear first

**Tests:**
- [ ] Integration: Template saves to PostgreSQL
- [ ] Integration: Template syncs across sessions
- [ ] E2E: Templates load in composer
- [ ] E2E: Recent templates prioritized
- [ ] Unit: Template schema is correct

---

### Story 10.7: Learned Preferences Storage

As a user,
I want observed preferences tracked with provenance,
So that I know what Orion has learned about me.

**Acceptance Criteria:**

**Given** Preference Learner detects a pattern (FR-R005)
**When** storing the preference
**Then** source is marked as "learned" (not "user")
**And** confidence score reflects observation count
**And** triggering observations are linked

**Given** I view a learned preference
**When** checking details
**Then** I see: what was observed, how many times, first/last occurrence
**And** I can promote to explicit preference or reject

**Tests:**
- [ ] Integration: Learned preferences have correct source
- [ ] E2E: Confidence increases with observations
- [ ] E2E: Observation details viewable
- [ ] E2E: Promote to explicit works
- [ ] E2E: Reject learned preference works

---

## Epic 11: Dynamic AI Canvas (json-render)

Users see rich, interactive UI components generated by the AI (meeting pickers, email previews, forms).

### Story 11.1: json-render Integration

As a developer,
I want to render AI-generated UI schemas,
So that Claude can create rich interactive interfaces.

**Acceptance Criteria:**

**Given** Claude generates a UI schema
**When** the schema is received (FR-UI001)
**Then** json-render parses and renders the component tree
**And** components render in the canvas panel
**And** invalid schemas show error gracefully

**Tests:**
- [ ] Integration: json-render library loads
- [ ] E2E: Simple schema renders correctly
- [ ] E2E: Complex nested schema renders
- [ ] Unit: Invalid schema handling
- [ ] E2E: Components appear in canvas

---

### Story 11.2: Component Catalog (27 Components)

As a developer,
I want a comprehensive component catalog,
So that AI can generate diverse UI patterns.

**Acceptance Criteria:**

**Given** the component registry initializes
**When** checking available components (FR-UI002)
**Then** 27 components are registered including:
**And** Layout: Container, Stack, Grid, Divider
**And** Display: Text, Heading, Badge, Card, Alert, Image
**And** Interactive: Button, Input, Select, Checkbox, DatePicker, TimePicker

**Tests:**
- [ ] Unit: All 27 components registered
- [ ] E2E: Each component type renders
- [ ] Unit: Component props validate correctly
- [ ] Visual regression: Components match design system
- [ ] Unit: Missing component shows placeholder

---

### Story 11.3: Streaming UI Support

As a user,
I want to see UI build progressively,
So that I get immediate feedback during generation.

**Acceptance Criteria:**

**Given** Claude streams a UI schema
**When** tokens arrive (FR-UI003)
**Then** useUIStream hook processes partial JSON
**And** valid subtrees render immediately
**And** incomplete parts show skeleton/loading state

**Given** streaming completes
**When** full schema is received
**Then** final UI renders without flash
**And** interactions become active

**Tests:**
- [ ] Integration: useUIStream processes partial JSON
- [ ] E2E: Progressive rendering works
- [ ] E2E: Skeleton states display
- [ ] E2E: Final render is seamless
- [ ] Unit: Streaming parser handles malformed chunks

---

### Story 11.4: Action System

As a user,
I want to interact with AI-generated UI,
So that I can take actions directly from the canvas.

**Acceptance Criteria:**

**Given** a component has an action (FR-UI004)
**When** I click/interact with it
**Then** the action type is dispatched: send_email, schedule_meeting, confirm_task, etc.
**And** Butler Agent receives and processes the action
**And** result updates the UI or triggers further flow

**Given** an action fails
**When** error occurs
**Then** user sees error message in context
**And** retry option is available

**Tests:**
- [ ] E2E: Button action triggers dispatch
- [ ] Integration: Action reaches Butler Agent
- [ ] E2E: Action result updates UI
- [ ] E2E: Failed action shows error
- [ ] Unit: All action types are handled

---

### Story 11.5: Data Binding (valuePath)

As a user,
I want form inputs to be reactive,
So that my input is captured correctly.

**Acceptance Criteria:**

**Given** a form component has valuePath (FR-UI005)
**When** I type or select a value
**Then** the value updates the data model at that path
**And** other components bound to same path update

**Given** form data is submitted
**When** action triggers
**Then** all bound values are included in action payload
**And** validation errors display inline

**Tests:**
- [ ] E2E: Input updates data model
- [ ] E2E: Bound components stay in sync
- [ ] E2E: Form submission includes all values
- [ ] E2E: Validation errors display
- [ ] Unit: valuePath parsing handles nested paths

---

### Story 11.6: TipTap WYSIWYG Editor

As a user,
I want a rich text editor for documents,
So that I can create formatted content.

**Acceptance Criteria:**

**Given** I open a document in the canvas
**When** the editor loads (FR-DE001)
**Then** TipTap editor initializes with formatting toolbar
**And** toolbar includes: bold, italic, headings, lists, links

**Given** I'm editing
**When** I use formatting controls (FR-DE002)
**Then** text is styled correctly
**And** code blocks have syntax highlighting
**And** markdown shortcuts work (**, ##, -)

**Tests:**
- [ ] E2E: TipTap editor loads
- [ ] E2E: Formatting toolbar works
- [ ] E2E: Code blocks highlight syntax
- [ ] E2E: Markdown shortcuts convert
- [ ] Visual regression: Editor matches design

---

### Story 11.7: Document Import/Export

As a user,
I want to import and export markdown,
So that I can work with documents in other tools.

**Acceptance Criteria:**

**Given** I have content in the editor
**When** I export as markdown (FR-DE003)
**Then** the document downloads as .md file
**And** formatting is preserved (headings, lists, code)

**Given** I have a markdown file
**When** I import it
**Then** content loads into the editor
**And** markdown is rendered as rich text

**Tests:**
- [ ] E2E: Export generates valid markdown
- [ ] E2E: Import parses markdown correctly
- [ ] E2E: Roundtrip preserves content
- [ ] Unit: Complex markdown structures handled
- [ ] E2E: File download works in Tauri

---

### Story 11.8: Document Auto-Save

As a user,
I want my documents saved automatically,
So that I don't lose work.

**Acceptance Criteria:**

**Given** I'm editing a document
**When** I make changes (FR-DE004)
**Then** changes auto-save after 2 seconds of inactivity
**And** save indicator shows "Saving..." then "Saved"

**Given** auto-save fails
**When** error occurs
**Then** user sees warning
**And** manual save option is available
**And** content is preserved locally

**Tests:**
- [ ] E2E: Auto-save triggers after inactivity
- [ ] E2E: Save indicator shows correct states
- [ ] E2E: Failed save shows warning
- [ ] Integration: Content persists to database
- [ ] E2E: Large documents save correctly (10,000+ words, NFR-P007)

---

## Epic 12: Onboarding & First Run

New users complete setup, connect tools, and experience their first AI triage within 2 minutes.

### Story 12.1: Onboarding Wizard Framework

As a user,
I want a guided setup experience,
So that I can start using Orion quickly.

**Acceptance Criteria:**

**Given** I launch Orion for the first time
**When** the app detects no setup
**Then** the onboarding wizard starts (UX-015)
**And** wizard has 5 steps: Welcome, API Key, Connect Tools, Select Areas, Complete
**And** progress indicator shows current step

**Tests:**
- [ ] E2E: Wizard launches on first run
- [ ] E2E: 5 steps display correctly
- [ ] E2E: Progress indicator updates
- [ ] E2E: Skip option available at each step (UX-018)
- [ ] Unit: First-run detection works

---

### Story 12.2: API Key Entry

As a user,
I want to enter my Anthropic API key,
So that Orion can use Claude.

**Acceptance Criteria:**

**Given** I'm on the API Key step
**When** I enter my key
**Then** the key is validated with a test call
**And** valid key shows success indicator
**And** invalid key shows error with help link

**Given** I don't have an API key
**When** I click "Get API Key"
**Then** I'm directed to Anthropic's website
**And** I can skip and add later

**Tests:**
- [ ] E2E: API key entry field works
- [ ] Integration: Validation makes test API call
- [ ] E2E: Valid key shows success
- [ ] E2E: Invalid key shows error
- [ ] E2E: Skip works correctly

---

### Story 12.3: Tool Connection During Setup

As a user,
I want to connect Gmail and Calendar during setup,
So that Orion can immediately help with my inbox.

**Acceptance Criteria:**

**Given** I'm on the Connect Tools step
**When** I view the options
**Then** I see Gmail and Calendar connection buttons
**And** each shows OAuth flow when clicked
**And** connection status updates on success

**Given** I skip tool connections
**When** I proceed
**Then** I can complete setup without connections
**And** I'm reminded to connect later

**Tests:**
- [ ] E2E: Tool connection options display
- [ ] E2E: OAuth flow works from wizard
- [ ] E2E: Connection status updates
- [ ] E2E: Skip proceeds without connection
- [ ] E2E: Reminder shows in app after skip

---

### Story 12.4: Area Selection

As a user,
I want to select my life areas during setup,
So that Orion is pre-configured for my needs.

**Acceptance Criteria:**

**Given** I'm on the Select Areas step
**When** options display (FR-A004)
**Then** I see suggested areas: Career, Health, Finance, Relationships, Home
**And** I can select multiple
**And** I can add custom areas

**Given** I select areas
**When** proceeding
**Then** selected areas are created in the database
**And** they appear in sidebar after setup

**Tests:**
- [ ] E2E: 5 suggested areas display
- [ ] E2E: Multi-select works
- [ ] E2E: Custom area creation works
- [ ] E2E: Selected areas created in DB
- [ ] E2E: Areas appear in app post-setup

---

### Story 12.5: First Triage Preview

As a user,
I want to see Orion triage my inbox during setup,
So that I experience value immediately.

**Acceptance Criteria:**

**Given** I've connected Gmail
**When** completing setup (UX-017)
**Then** Orion syncs last 7 days of emails
**And** it shows a preview of triage results
**And** I see top 3 priority items

**Given** triage completes
**When** viewing preview
**Then** time-to-value is under 2 minutes (UX-016)
**And** I can proceed to main app

**Tests:**
- [ ] Integration: 7-day email sync works
- [ ] E2E: Triage preview displays results
- [ ] E2E: Top 3 priority items shown
- [ ] E2E: Total flow completes in under 2 minutes
- [ ] E2E: Proceed navigates to main app

---

### Story 12.6: Setup Completion

As a user,
I want a clear completion of onboarding,
So that I know I'm ready to use Orion.

**Acceptance Criteria:**

**Given** I complete all wizard steps
**When** I reach the completion screen
**Then** I see a summary of what's configured
**And** quick start tips are shown
**And** "Get Started" takes me to main app

**Given** setup is marked complete
**When** I relaunch the app
**Then** the wizard doesn't show again
**And** I go directly to main app

**Tests:**
- [ ] E2E: Completion screen shows summary
- [ ] E2E: Quick start tips display
- [ ] E2E: Get Started navigates correctly
- [ ] E2E: Subsequent launches skip wizard
- [ ] Unit: Completion flag persists

---

## Epic 13: Billing & Monetization

Users can subscribe, manage their plan, and see usage tracking.

### Story 13.1: Stripe Integration

As a system,
I want Stripe integrated for payments,
So that users can subscribe to paid plans.

**Acceptance Criteria:**

**Given** the billing module initializes
**When** Stripe SDK loads (UX-019)
**Then** connection to Stripe is established
**And** payment methods supported: Card (USD), USDC

**Given** Stripe is connected
**When** a user initiates payment
**Then** Stripe checkout flow opens
**And** payment completes securely

**Tests:**
- [ ] Integration: Stripe SDK connects
- [ ] Integration: Test payment succeeds
- [ ] E2E: Checkout flow opens
- [ ] Unit: USDC payment option works
- [ ] Security: No PCI data stored locally

---

### Story 13.2: Free Tier Implementation

As a user,
I want a free tier,
So that I can try Orion before committing.

**Acceptance Criteria:**

**Given** I'm a new user
**When** I start using Orion (UX-020)
**Then** I have 1,000 API calls per month
**And** usage counter tracks my calls
**And** I see remaining calls in settings

**Given** I approach the limit
**When** at 80% usage
**Then** I receive a warning notification
**And** upgrade prompt shows

**Tests:**
- [ ] E2E: Free tier is default for new users
- [ ] Integration: Usage counter increments
- [ ] E2E: Remaining calls displays
- [ ] E2E: 80% warning triggers
- [ ] E2E: Upgrade prompt appears

---

### Story 13.3: Pro Tier Subscription

As a user,
I want to upgrade to Pro,
So that I get more API calls.

**Acceptance Criteria:**

**Given** I'm on the free tier
**When** I click "Upgrade to Pro"
**Then** I see Pro benefits: 10,000 API calls/month (UX-021)
**And** price shows $29/month
**And** I can complete subscription via Stripe

**Given** subscription succeeds
**When** payment completes
**Then** my account is upgraded immediately
**And** usage limit increases to 10,000
**And** I receive confirmation email

**Tests:**
- [ ] E2E: Upgrade flow works
- [ ] E2E: Pro benefits display correctly
- [ ] Integration: Subscription creates in Stripe
- [ ] E2E: Account upgrades immediately
- [ ] E2E: Limit increases to 10,000

---

### Story 13.4: Usage Metering

As a user,
I want to see my API usage,
So that I can manage my consumption.

**Acceptance Criteria:**

**Given** I use Orion
**When** API calls are made (UX-022)
**Then** usage is tracked via Supabase Edge Functions
**And** tracking includes: timestamp, call type, tokens used

**Given** I view usage
**When** opening the usage panel
**Then** I see: calls this month, calls remaining, usage chart
**And** breakdown by feature (chat, triage, scheduling)

**Tests:**
- [ ] Integration: Usage tracks on API calls
- [ ] E2E: Usage panel shows data
- [ ] E2E: Chart displays correctly
- [ ] E2E: Feature breakdown accurate
- [ ] Unit: Edge function counts correctly

---

### Story 13.5: Subscription Management

As a user,
I want to manage my subscription,
So that I can upgrade, downgrade, or cancel.

**Acceptance Criteria:**

**Given** I have an active subscription
**When** I open billing settings
**Then** I see: current plan, next billing date, payment method
**And** I can: update payment, cancel subscription

**Given** I cancel
**When** cancellation processes
**Then** I keep Pro access until end of billing period
**And** downgrade to free after period ends

**Tests:**
- [ ] E2E: Billing settings show current plan
- [ ] E2E: Update payment works
- [ ] E2E: Cancel subscription works
- [ ] E2E: Access maintained until period end
- [ ] E2E: Downgrade happens at period end

---

## Epic 14: Observability & Quality

Development team can trace sessions, debug issues, and improve the system over time.

### Story 14.1: Braintrust Tracing (Development)

As a developer,
I want to trace agent sessions,
So that I can debug and improve AI behavior.

**Acceptance Criteria:**

**Given** the app runs in development mode
**When** an agent processes a request (ARCH-010)
**Then** the session is logged to Braintrust
**And** traces include: prompt, response, tool calls, latency

**Given** I view Braintrust dashboard
**When** checking a session
**Then** I see full conversation trace
**And** I can replay and analyze

**Tests:**
- [ ] Integration: Braintrust SDK connects
- [ ] Integration: Traces log correctly
- [ ] Unit: All trace fields populated
- [ ] E2E: Dashboard shows sessions
- [ ] Unit: Dev-only flag works

---

### Story 14.2: Langfuse Prompt Management (Production)

As a developer,
I want to manage prompts via Langfuse,
So that I can iterate without deployments.

**Acceptance Criteria:**

**Given** the app runs in production mode
**When** an agent loads its prompt (ARCH-010)
**Then** it fetches from Langfuse if available
**And** falls back to local template if unavailable

**Given** I update a prompt in Langfuse
**When** the agent next loads
**Then** it uses the updated prompt
**And** A/B testing is supported

**Tests:**
- [ ] Integration: Langfuse SDK connects
- [ ] Integration: Prompt fetch works
- [ ] E2E: Fallback to local works
- [ ] Integration: Updated prompt is used
- [ ] Unit: A/B routing works

---

### Story 14.3: Graceful Degradation

As a user,
I want the app to handle failures gracefully,
So that I'm not blocked by errors.

**Acceptance Criteria:**

**Given** an external service fails (Claude, Gmail, Calendar)
**When** the error occurs (PM-003)
**Then** user sees friendly message: "Syncing paused, will resume shortly"
**And** retry happens automatically
**And** core app functionality continues

**Given** the service recovers
**When** retry succeeds
**Then** normal operation resumes
**And** user sees "Syncing resumed"

**Tests:**
- [ ] E2E: Service failure shows friendly message
- [ ] E2E: Auto-retry triggers
- [ ] E2E: Core features work during outage
- [ ] E2E: Recovery notification shows
- [ ] Integration: Retry backoff is appropriate

---

### Story 14.4: Crash Monitoring

As a developer,
I want crash data collected,
So that I can fix stability issues.

**Acceptance Criteria:**

**Given** the app crashes or throws uncaught error
**When** the error occurs
**Then** crash report is generated with: stack trace, app state, user actions
**And** report is sent to monitoring service (NFR-R001)

**Given** crash rate is monitored
**When** checking metrics
**Then** I see crash rate target: <1% of sessions
**And** top crash causes are ranked

**Tests:**
- [ ] Integration: Crash reporter captures errors
- [ ] Unit: Stack trace is complete
- [ ] E2E: Crash report sends
- [ ] E2E: Metrics dashboard shows rate
- [ ] Unit: User PII is not included

---

### Story 14.5: Uptime Monitoring

As a developer,
I want uptime tracked,
So that I can ensure reliability.

**Acceptance Criteria:**

**Given** the app is deployed
**When** monitoring runs
**Then** uptime is tracked for core features (NFR-R002)
**And** target is 95%+ availability

**Given** downtime occurs
**When** service is unavailable
**Then** alert is triggered
**And** incident is logged with duration

**Tests:**
- [ ] Integration: Uptime monitoring active
- [ ] E2E: Availability calculation correct
- [ ] E2E: Alert triggers on downtime
- [ ] Unit: Incident logging works
- [ ] E2E: Dashboard shows uptime %

---

### Story 14.6: Critical Bug Tracking

As a developer,
I want critical bugs tracked separately,
So that we stay under the <5 bugs threshold.

**Acceptance Criteria:**

**Given** a bug is reported
**When** it's triaged as critical (NFR-R003)
**Then** it's flagged in the tracking system
**And** P0 bugs are counted against the threshold

**Given** we're tracking critical bugs
**When** viewing the dashboard
**Then** I see: current count, target (<5), trend
**And** bugs link to issues/PRs

**Tests:**
- [ ] E2E: Critical bug flag works
- [ ] E2E: Count displays correctly
- [ ] E2E: Threshold warning at 4+ bugs
- [ ] Unit: Severity levels validate
- [ ] E2E: Links to issue tracker work
