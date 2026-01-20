# Implementation Plan: Orion Personal Butler MVP

Generated: 2026-01-13
Plan Agent Output

## Goal

Build a functional Orion Personal Butler MVP that provides:
1. Desktop application (Tauri + Next.js) with chat + canvas split-screen UI
2. Full Continuous Claude agent parity (16 agents, 110+ skills reused)
3. PARA-based personal information management
4. Tool integrations via Composio (Gmail, Calendar, Slack)
5. Semantic memory with recall capabilities

This plan delivers a working product in 12 weeks (3 months).

---

## Research Summary

### From Design Documents

| Decision | Choice | Source |
|----------|--------|--------|
| Desktop Framework | Tauri 2.0 + Next.js | `mac-desktop-framework-research.md` |
| Database | SQLite (local) + PostgreSQL (shared memory) | `database-schema-design.md` |
| UI Components | shadcn/ui + A2UI for dynamic content | `orion-ui-design.md` |
| Agent Framework | Claude Agent SDK with Structured Outputs | `claude-agent-sdk-deep-dive.md` |
| Tool Integration | Composio MCP | `ORION-DESIGN-CONSOLIDATED.md` |
| Embeddings | BGE (bge-large-en-v1.5) | `ORION-DESIGN-CONSOLIDATED.md` |
| Observability | Braintrust + Langfuse (dual-system) | `PLAN-langfuse-observability.md` |

### Key SDK Features to Leverage

1. **Structured Outputs (beta)** - Type-safe agent responses
2. **Extended Thinking** - For complex reasoning (inbox triage)
3. **canUseTool Callback** - Approval workflow
4. **AskUserQuestion Tool** - Clarification during agent execution
5. **File Checkpointing** - Resume from failures
6. **Agent-Scoped Hooks** - Agent-specific behavior

---

## Existing Codebase Analysis

### Assets to Reuse (from Continuous Claude)

**Agents (16 reusable):**
- `butler.md` - Primary orchestrator (already defined)
- `triage.md` - Inbox processor (already defined)
- `scout.md`, `oracle.md` - Research agents
- `architect.md`, `phoenix.md` - Planning agents
- `kraken.md`, `spark.md` - Implementation agents
- `arbiter.md` - Test/validation agent
- `sleuth.md`, `debug-agent.md` - Debugging agents
- `pathfinder.md`, `profiler.md` - Analysis agents
- `herald.md`, `scribe.md` - Documentation agents
- `maestro.md` - Multi-agent orchestrator

**Skills (110+ reusable):**
- Core: `commit`, `research`, `workflow-router`
- Search: `search-router`, `perplexity-search`, `repoprompt`
- Memory: `recall`, `remember`, `recall-reasoning`
- Development: `skill-development`, `hook-developer`
- Meta: `help`, `tour`, `mot` (system health)

**Hooks:**
- `memory-awareness` - Semantic recall injection
- `epistemic-reminder` - Claim verification
- Build/test hooks

**Memory System:**
- PostgreSQL with BGE embeddings (already running)
- `store_learning.py`, `recall_learnings.py` scripts
- Hybrid RRF search (text + vector)

### New Components Required

| Component | Type | Priority |
|-----------|------|----------|
| Desktop shell (Tauri) | Infrastructure | P0 |
| Chat + Canvas UI | Frontend | P0 |
| A2UI Renderer | Frontend | P1 |
| Orion-specific agents (scheduler, communicator) | Agents | P1 |
| Composio tool integrations | Backend | P0 |
| SQLite schema implementation | Database | P0 |
| Onboarding flow | Frontend | P2 |

---

## Implementation Phases

### Phase 0: Project Setup (Week 1)

**Goal:** Bootable desktop app with basic structure

**Files to create:**
```
orion-app/
├── src-tauri/               # Tauri Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json     # Shell permissions
│   └── src/
│       ├── main.rs
│       └── lib.rs
├── src/                     # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (app)/           # Main app routes
│   │       ├── chat/
│   │       ├── inbox/
│   │       ├── calendar/
│   │       ├── projects/
│   │       └── settings/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── chat/
│   │   ├── canvas/
│   │   └── layout/
│   └── lib/
│       ├── agent-client.ts
│       ├── database.ts
│       └── composio.ts
├── package.json
└── tailwind.config.js
```

**Steps:**
1. Initialize Tauri project with Next.js template
   ```bash
   npm create tauri-app@latest orion-app -- --template next
   cd orion-app
   pnpm install
   ```

2. Configure Tauri shell permissions for Claude CLI
   ```json
   // src-tauri/capabilities/default.json
   {
     "permissions": [
       "shell:allow-spawn",
       "shell:allow-execute",
       "fs:allow-read",
       "fs:allow-write"
     ]
   }
   ```

3. Install core dependencies
   ```bash
   pnpm add @tauri-apps/plugin-shell @tauri-apps/plugin-fs
   pnpm add zustand @tanstack/react-query
   npx shadcn@latest init
   ```

4. Copy shadcn/ui components from project-dashboard fork
   - Button, Card, Dialog, Input, Textarea
   - Sidebar, ScrollArea, Tooltip
   - Form components

5. Set up basic layout (sidebar + main area)

**Acceptance Criteria:**
- [ ] `pnpm tauri dev` launches desktop window
- [ ] Basic Next.js routes render
- [ ] shadcn/ui components work
- [ ] Can execute shell commands via Tauri

**Dependencies:** None

---

### Phase 1: Core UI Shell (Week 2-3)

**Goal:** Split-screen chat + canvas layout working

**Files to modify/create:**

`src/components/layout/AppLayout.tsx`:
```typescript
// Split-screen layout with resizable panels
export function AppLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={25}>
          <ChatPanel />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={65}>
          <CanvasPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
```

`src/components/chat/ChatPanel.tsx`:
- Message history display
- Input with voice button placeholder
- Agent status indicator
- Suggested actions chips

`src/components/canvas/CanvasPanel.tsx`:
- Mode-switching container
- Empty state
- Loading state
- Error boundary

`src/stores/chat-store.ts`:
```typescript
// Zustand store for chat state
interface ChatStore {
  messages: Message[]
  isAgentThinking: boolean
  canvasMode: CanvasMode
  sendMessage: (content: string) => Promise<void>
  setCanvasMode: (mode: CanvasMode) => void
}
```

**Steps:**
1. Install resizable panel library
   ```bash
   pnpm add react-resizable-panels
   ```

2. Create base layout components

3. Implement chat message display
   - User messages (right-aligned)
   - Agent messages (left-aligned, with streaming)
   - Tool call indicators
   - Thinking indicator

4. Create canvas panel skeleton
   - Mode enum (empty, briefing, email, calendar, form)
   - Mode switching logic
   - Placeholder content per mode

5. Add keyboard shortcuts
   - Cmd+K: Command palette
   - Cmd+Enter: Send message
   - Cmd+/: Toggle canvas

**Acceptance Criteria:**
- [ ] Split-screen layout with resizable panels
- [ ] Chat input sends messages (to console for now)
- [ ] Messages display in conversation format
- [ ] Canvas switches between modes
- [ ] Keyboard shortcuts work

**Dependencies:** Phase 0

---

### Phase 2: Database, Auth & Local Storage (Week 3-4)

**Goal:** SQLite + Supabase setup with auth working

**Updated 2026-01-14:** Added Supabase Auth integration. See `database-schema-design.md` for full Supabase cloud schema.

**Files to create:**

`src/lib/database/schema.sql`:
```sql
-- Full schema from database-schema-design.md
-- Core tables: inbox_items, tasks, projects, areas, contacts
-- Support tables: tags, action_log, preferences
-- Sync table: sync_log (for tracking pending syncs)
```

`src/lib/database/migrations/`:
- `001_initial_schema.sql`
- `002_add_embeddings.sql`
- `003_add_sync_tracking.sql`

`src/lib/database/repositories/`:
- `inbox.ts` - Inbox CRUD
- `tasks.ts` - Task CRUD
- `contacts.ts` - Contact CRUD
- `projects.ts` - Project CRUD
- `preferences.ts` - Preference CRUD
- `sync.ts` - Sync state management

`src/lib/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

`src/lib/supabase/auth.ts`:
```typescript
// OAuth login with Google/Apple
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'orion://auth/callback',
    }
  });
  return { data, error };
}
```

`src-tauri/src/database.rs`:
```rust
// Rust side for SQLite operations
use rusqlite::Connection;
use tauri::State;

#[tauri::command]
fn query_database(sql: &str, params: Vec<Value>) -> Result<Vec<Row>, Error> {
    // Execute query
}
```

**Steps:**
1. Create Supabase project
   - Go to supabase.com → New Project
   - Enable Email, Google, Apple auth providers
   - Run cloud schema from `database-schema-design.md`

2. Add SQLite to Tauri
   ```bash
   cargo add rusqlite --features bundled
   ```

3. Set up Supabase client in Next.js
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

4. Implement auth flow:
   - Sign in with Google/Apple → Supabase OAuth
   - Handle `orion://auth/callback` deep link in Tauri
   - Store session in Supabase, cache user in SQLite

5. Implement core tables in SQLite:
   - `inbox_items`, `tasks`, `projects`, `areas`, `contacts`, `preferences`
   - `sync_log` for tracking pending syncs

6. Create TypeScript repository layer with type safety

7. Implement background sync:
   - Track changes in `sync_log` table
   - Push pending changes to Supabase on network available
   - Pull changes from Supabase on app launch

**Acceptance Criteria:**
- [ ] Supabase project created with auth enabled
- [ ] Google/Apple OAuth working in Tauri app
- [ ] Deep link callback (`orion://auth/callback`) handled
- [ ] User profile synced to Supabase `profiles` table
- [ ] SQLite database created on first launch
- [ ] All core tables exist with indexes
- [ ] Sync tracking in place (`sync_log` table)
- [ ] Basic CRUD operations work
- [ ] Can store/retrieve embeddings

**Dependencies:** Phase 0

---

### Phase 3: Agent Integration (Week 4-5)

**Goal:** Claude Agent SDK connected, basic chat working

**Files to create:**

`src/lib/agent/client.ts`:
```typescript
// Wrapper around Claude Agent SDK
import { spawn } from '@tauri-apps/plugin-shell'

export class OrionAgentClient {
  async chat(message: string, context: OrionContext): Promise<AgentResponse> {
    // Spawn claude CLI with --print flag
    // Stream response back
    // Handle tool calls
  }

  async streamChat(message: string, onChunk: (chunk: string) => void): Promise<void> {
    // Streaming version
  }
}
```

`src/lib/agent/context.ts`:
```typescript
// Build context for agent calls
export function buildOrionContext(state: OrionState): string {
  return `
## Orion Context
User: ${state.user.name}
Active Projects: ${state.projects.map(p => p.name).join(', ')}
Recent Contacts: ${state.recentContacts.map(c => c.name).join(', ')}
Current Focus: ${state.currentFocus || 'None'}
  `
}
```

`src/lib/agent/hooks/`:
- `pre-message.ts` - Inject Orion context
- `post-response.ts` - Extract structured data

**Steps:**
1. Create Tauri command to spawn Claude CLI
   ```rust
   #[tauri::command]
   async fn run_claude(prompt: String, context: String) -> Result<String, Error> {
       // spawn claude CLI process
       // capture stdout/stderr
   }
   ```

2. Implement TypeScript client wrapper

3. Add streaming support (read stdout line by line)

4. Handle structured outputs from agent
   ```typescript
   interface AgentResponse {
     message: string
     toolCalls?: ToolCall[]
     canvasUpdate?: A2UIPayload
     extractedTasks?: Task[]
   }
   ```

5. Connect to chat UI
   - Send messages via client
   - Display streamed response
   - Show tool call indicators

6. Add context building
   - Current page/mode
   - Recent messages
   - Active projects
   - User preferences

**Acceptance Criteria:**
- [ ] Can send message and get response from Claude
- [ ] Response streams to UI in real-time
- [ ] Tool calls display as collapsible cards
- [ ] Context injection works
- [ ] Errors display gracefully

**Dependencies:** Phase 1, Phase 2

---

### Phase 4: Composio Tool Integration (Week 5-6)

**Goal:** Gmail, Calendar, Slack connected and working

**Files to create:**

`src/lib/composio/client.ts`:
```typescript
// Composio MCP client
export class ComposioClient {
  async searchTools(query: string): Promise<Tool[]>
  async executeMulti(tools: ToolExecution[]): Promise<ToolResult[]>
  async manageConnections(toolkits: string[]): Promise<ConnectionStatus>
}
```

`src/lib/composio/tools/`:
- `gmail.ts` - Gmail-specific wrappers
- `calendar.ts` - Calendar wrappers
- `slack.ts` - Slack wrappers

`src/components/settings/ConnectionsPage.tsx`:
- OAuth connection UI
- Connection status display
- Reconnect/disconnect buttons

**Steps:**
1. Set up Composio MCP server
   ```json
   // .claude/mcp_config.json update
   {
     "mcpServers": {
       "rube": {
         "command": "npx",
         "args": ["@composio/mcp-server"]
       }
     }
   }
   ```

2. Create TypeScript wrappers for common operations
   - `fetchEmails(filter)` - Get Gmail messages
   - `sendEmail(to, subject, body)` - Send email
   - `getCalendarEvents(range)` - Get events
   - `createCalendarEvent(event)` - Create event
   - `searchSlackMessages(query)` - Search Slack

3. Implement OAuth connection flow
   - Display connection button in settings
   - Open OAuth URL in browser
   - Handle callback and store token

4. Add tool execution UI
   - Tool call cards in chat
   - Progress indicators
   - Error handling with retry

5. Test end-to-end flows
   - "Check my email" -> fetches and displays
   - "Schedule meeting" -> creates calendar event
   - "Send message to John on Slack" -> sends

**Acceptance Criteria:**
- [ ] Gmail OAuth works, can read emails
- [ ] Google Calendar connected, can create events
- [ ] Slack connected, can send messages
- [ ] Tool calls display with results in chat
- [ ] Error handling shows retry options
- [ ] Rate limiting implementation complete (see spec below)

**Rate Limiting Implementation Spec:**
```typescript
// src/lib/composio/rate-limiter.ts
interface RateLimitConfig {
  maxRetries: 3;
  baseDelayMs: 1000;           // 1 second initial delay
  maxDelayMs: 30000;           // 30 second max delay
  backoffMultiplier: 2;        // Exponential backoff
  perToolLimits: {
    gmail: { requestsPerMinute: 60, dailyQuota: 1000 };
    calendar: { requestsPerMinute: 100, dailyQuota: 5000 };
    slack: { requestsPerMinute: 50, dailyQuota: 10000 };
  };
}

// Circuit breaker states: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
// Open after 5 consecutive failures, reset after 60s success window
```

**Dependencies:** Phase 3

---

### Phase 5: Orion Agents (Week 6-7)

**Goal:** Butler, Triage, Scheduler, Communicator agents working

**Files to create/modify:**

`.claude/agents/scheduler.md`:
```markdown
# Scheduler Agent
Handles calendar management, finding free time, scheduling meetings.
- Uses Google Calendar via Composio
- Respects user's scheduling preferences
- Handles conflicts and suggestions
```

`.claude/agents/communicator.md`:
```markdown
# Communicator Agent
Drafts emails, Slack messages, and other communications.
- Matches user's tone and style
- Uses contact context for personalization
- Supports draft/review/send workflow
```

`.claude/agents/researcher-personal.md`:
```markdown
# Personal Researcher Agent
Research about people, companies, topics relevant to user's life.
- Uses web search for current info
- Cross-references with contacts database
- Summarizes findings for butler
```

`src/lib/agent/routing.ts`:
```typescript
// Route requests to appropriate agent
export function routeToAgent(intent: UserIntent): AgentConfig {
  switch (intent.type) {
    case 'schedule': return { agent: 'scheduler', ... }
    case 'email': return { agent: 'communicator', ... }
    case 'triage': return { agent: 'triage', ... }
    default: return { agent: 'butler', ... }
  }
}
```

**Steps:**
1. Create remaining Orion-specific agents
   - `scheduler.md` - Calendar management
   - `communicator.md` - Email/message drafting
   - `researcher-personal.md` - People/company research

2. Implement butler orchestration
   - Intent detection from user message
   - Context gathering (projects, contacts)
   - Agent delegation with handoff

3. Create agent-specific tools
   - `schedule-meeting` - Full scheduling flow
   - `draft-email` - Email composition
   - `check-availability` - Calendar lookup

4. Implement inter-agent communication
   - Butler delegates to specialist
   - Specialist returns result
   - Butler synthesizes for user

5. Add preference learning
   - Track user edits to drafts
   - Store communication preferences
   - Apply in future interactions

**Acceptance Criteria:**
- [ ] Butler routes to correct specialist agent
- [ ] Scheduler can find free time and create meetings
- [ ] Communicator drafts emails in user's style
- [ ] Preferences are learned and applied
- [ ] Multi-turn conversations work

**Dependencies:** Phase 4

---

### Phase 6: A2UI Canvas (Week 7-8)

**Goal:** Dynamic canvas content generated by agents

**Files to create:**

`src/lib/a2ui/types.ts`:
```typescript
// A2UI type definitions
interface A2UIPayload {
  version: '0.8'
  components: A2UIComponent[]
}

interface A2UIComponent {
  id: string
  type: ComponentType
  parentId?: string
  // Component-specific props
}
```

`src/lib/a2ui/renderer.tsx`:
```typescript
// A2UI to React component mapper
const componentMap: Record<string, React.ComponentType> = {
  'card': CardComponent,
  'button': ButtonComponent,
  'text-field': TextFieldComponent,
  'email-composer': EmailComposerComponent,
  'calendar-week': CalendarWeekComponent,
  // ...
}

export function A2UIRenderer({ payload, onAction }) {
  // Render components from payload
}
```

`src/components/canvas/`:
- `EmailComposer.tsx` - Rich email editor
- `CalendarView.tsx` - Week/day calendar
- `MeetingScheduler.tsx` - Time slot picker
- `ContactCard.tsx` - Contact details
- `TaskList.tsx` - Task list with actions

**Steps:**
1. Define A2UI TypeScript types
   - Base component interface
   - All standard components
   - Orion custom components

2. Create renderer component
   - Parse A2UI JSON
   - Map to React components
   - Handle actions (button clicks, form submits)

3. Build Orion-specific components
   - Email composer with TipTap
   - Calendar week view
   - Meeting scheduler with time slots
   - Contact card with edit mode
   - Task list with drag-and-drop

4. Connect to agent responses
   - Agent returns A2UI in response
   - Canvas updates with new components
   - State syncs between chat and canvas

5. Add incremental updates
   - Partial A2UI updates (just changed components)
   - Smooth transitions
   - Loading states per component

**Acceptance Criteria:**
- [ ] A2UI payloads render correctly
- [ ] Email composer works (create, edit, send)
- [ ] Calendar view shows events
- [ ] Meeting scheduler shows availability
- [ ] Actions in canvas work (buttons, forms)

**Dependencies:** Phase 5

---

### Phase 7: Inbox & Triage (Week 8-9)

**Goal:** Unified inbox with AI-powered triage

**Files to create:**

`src/app/(app)/inbox/page.tsx`:
```typescript
// Inbox page with triage view
export default function InboxPage() {
  return (
    <div className="flex h-full">
      <InboxList />
      <InboxPreview />
    </div>
  )
}
```

`src/components/inbox/`:
- `InboxList.tsx` - Prioritized item list
- `InboxItem.tsx` - Single inbox item
- `InboxPreview.tsx` - Item detail/preview
- `TriageResults.tsx` - Triage summary
- `BulkActions.tsx` - Multi-select actions

`src/lib/inbox/`:
- `sync.ts` - Sync from Gmail/Slack/Calendar
- `triage.ts` - Run triage agent
- `actions.ts` - Process actions (file, archive, etc.)

**Steps:**
1. Create inbox sync mechanism
   - Fetch new items from connected tools
   - Store in `inbox_items` table
   - Track sync cursors per source

2. Implement inbox list UI
   - Priority-sorted display
   - Source indicators (Gmail, Slack, etc.)
   - Unread/read states
   - Multi-select mode

3. Create preview panel
   - Email content display
   - Slack message threads
   - Calendar invite details
   - Suggested actions from triage

4. Integrate triage agent
   - Score priority on sync
   - Extract actions
   - Suggest filing
   - Generate draft replies

5. Implement bulk actions
   - Archive selected
   - File to project
   - Create tasks from selected
   - Snooze until later

**Acceptance Criteria:**
- [ ] Inbox syncs from Gmail, Calendar, Slack
- [ ] Items display with priority scores
- [ ] Triage agent processes new items
- [ ] Can file, archive, snooze items
- [ ] Draft replies show in preview

**Dependencies:** Phase 4, Phase 5

---

### Test Prep Buffer (1 day between Phase 7-8)

**Goal:** Stabilize and validate before PARA integration

**Tasks:**
1. Run E2E tests for Journeys 1-7 (Onboarding, Chat, Gmail, Calendar, Inbox)
2. Fix any P0 test failures
3. Update test fixtures with real data patterns
4. Document any deferred P1 issues for Phase 11

**Why:** A2UI Canvas (J9) and Inbox Triage (J5) tests run back-to-back without buffer. This prep day prevents cascading failures into PARA phase.

---

### Phase 8: PARA Structure (Week 9-10)

**Goal:** Projects, Areas, Resources, Archives fully working

**Files to create:**

`src/app/(app)/projects/`:
- `page.tsx` - Project list
- `[id]/page.tsx` - Project detail

`src/app/(app)/areas/`:
- `page.tsx` - Areas list
- `[id]/page.tsx` - Area detail

`src/components/para/`:
- `ProjectCard.tsx` - Project summary
- `ProjectDetail.tsx` - Full project view
- `AreaCard.tsx` - Area summary
- `TaskBoard.tsx` - Kanban-style tasks
- `FileExplorer.tsx` - Resource browser

`src/lib/para/`:
- `sync.ts` - Sync with filesystem
- `search.ts` - Cross-PARA search
- `linking.ts` - Entity relationships

**Steps:**
1. Create project management UI
   - Project list with progress
   - Project detail with tasks
   - Stakeholder linking
   - Deadline tracking

2. Implement areas management
   - Area list with sub-items
   - Responsibility tracking
   - Area-specific preferences

3. Build resource browser
   - Contact list with details
   - Template management
   - Preference editor
   - File explorer

4. Add archive functionality
   - Complete and archive projects
   - Search archived items
   - Restore from archive

5. Implement filesystem sync
   - Watch `orion/` folder for changes
   - Sync to database on change
   - Handle external edits

**Acceptance Criteria:**
- [ ] Projects display with tasks and progress
- [ ] Areas show ongoing responsibilities
- [ ] Resources (contacts, templates) browsable
- [ ] Can archive and restore items
- [ ] Filesystem changes sync to database

**Dependencies:** Phase 2

---

### Phase 9: Onboarding, Settings & Payments (Week 10-11)

**Goal:** First-run experience, configuration, and Stripe billing

**Updated 2026-01-14:** Added Stripe payment integration (USD + USDC). Claude API proxied through backend - no user API key needed.

**Files to create:**

`src/app/onboarding/`:
- `page.tsx` - Welcome
- `connect/page.tsx` - Tool connections (Gmail, Calendar, Slack)
- `areas/page.tsx` - Area selection
- `plan/page.tsx` - Subscription plan selection
- `complete/page.tsx` - Ready to use

`src/components/onboarding/`:
- `WelcomeScreen.tsx`
- `ServiceConnector.tsx`
- `AreaSelector.tsx`
- `PlanSelector.tsx` - Free/Pro tier selection
- `CompletionScreen.tsx`

`src/app/(app)/settings/`:
- `page.tsx` - Settings overview
- `connections/page.tsx` - Tool connections
- `preferences/page.tsx` - User preferences
- `agents/page.tsx` - Agent configuration
- `billing/page.tsx` - Subscription & usage
- `data/page.tsx` - Data export/import

`src/lib/stripe/`:
- `client.ts` - Stripe client setup
- `checkout.ts` - Create checkout session
- `portal.ts` - Customer portal link
- `webhooks.ts` - Handle Stripe webhooks

`supabase/functions/stripe-webhook/`:
```typescript
// Supabase Edge Function for Stripe webhooks
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'stripe';

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // Update user subscription in Supabase
      break;
    case 'customer.subscription.updated':
      // Handle plan changes
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
  }

  return new Response(JSON.stringify({ received: true }));
});
```

**Steps:**
1. Create Stripe account & products
   - Free tier: 1,000 API calls/month
   - Pro tier: 10,000 API calls/month ($29/month)
   - Usage-based: $0.01 per additional call
   - Enable USDC payments (Stripe Crypto On-Ramp)

2. Create onboarding flow
   - Welcome with value prop
   - Sign in with Google/Apple (Supabase Auth)
   - Connect Gmail, Calendar, Slack (Composio OAuth)
   - Select life areas (Career, Health, etc.)
   - Choose plan (Free or Pro)
   - First triage run

3. Build billing pages
   - Current plan display
   - Usage meter (calls this month)
   - Upgrade/downgrade buttons
   - Payment history
   - Cancel subscription

4. Implement Stripe integration
   - Checkout session creation
   - Customer portal for self-service
   - Webhook handler in Supabase Edge Function
   - USDC payment option

5. Build settings pages
   - View/edit connections
   - Manage preferences
   - Agent behavior settings
   - Data export/import

6. Add skip/minimal options
   - "Just email" minimal setup
   - "Skip for now" at each step
   - Progressive enhancement later

**Acceptance Criteria:**
- [ ] First-run shows onboarding (no API key needed)
- [ ] Google/Apple sign-in works
- [ ] OAuth tool connections work
- [ ] Areas can be selected/created
- [ ] Stripe checkout works (USD)
- [ ] USDC payment option available
- [ ] Usage tracked per user
- [ ] Rate limiting enforced per tier
- [ ] Settings pages all functional

**Dependencies:** Phase 4, Phase 8

---

### Phase 10: Memory, Context & Observability (Week 11)

**Goal:** Semantic memory with recall across sessions + production observability

**Updated 2026-01-15:** Added Langfuse integration for production observability. See `PLAN-langfuse-observability.md`.

**Files to create:**

`src/lib/memory/`:
- `embeddings.ts` - BGE embedding generation
- `store.ts` - Store learnings to PostgreSQL
- `recall.ts` - Query semantic memory
- `context.ts` - Build context from memory

`src/lib/context/`:
- `builder.ts` - Assemble full context
- `compressor.ts` - Token-efficient summaries
- `relevance.ts` - Score context relevance

**Steps:**
1. Set up embedding generation
   - Call BGE model for embeddings
   - Store in PostgreSQL with pgvector
   - Cache in SQLite for offline

2. Implement memory store
   - Store learnings from agent interactions
   - Store user corrections
   - Store preference patterns

3. Create recall system
   - Hybrid search (text + vector)
   - RRF fusion for ranking
   - Context window management

4. Build context assembly
   - Current conversation
   - Relevant memories
   - Active project context
   - User preferences

5. Add memory hooks
   - Pre-message: inject relevant memories
   - Post-response: extract learnings
   - On correction: store preference

**Acceptance Criteria:**
- [ ] Learnings store with embeddings
- [ ] Recall returns relevant memories
- [ ] Context includes memory in prompts
- [ ] Preferences persist across sessions
- [ ] Memory improves over time

**Dependencies:** Phase 3, existing OPC memory system

---

### Phase 11: Polish & Testing (Week 12)

**Goal:** Production-ready MVP

**Tasks:**

1. **Error handling**
   - Graceful degradation for tool failures
   - Retry logic with backoff
   - User-friendly error messages
   - Offline mode basics

2. **Performance**
   - Lazy loading for routes
   - Virtual scrolling for long lists
   - Debounced search
   - Response caching

3. **Testing**
   - Unit tests for repositories
   - Integration tests for agent flows
   - E2E tests for critical paths
   - Manual testing checklist

4. **Packaging**
   - Tauri build configuration
   - Code signing setup
   - Auto-updater integration
   - DMG installer

5. **Documentation**
   - User guide
   - Keyboard shortcuts reference
   - FAQ
   - Known limitations

**Acceptance Criteria:**
- [ ] No unhandled exceptions in normal use
- [ ] App starts in < 3 seconds
- [ ] All critical paths have E2E tests
- [ ] DMG installer works on macOS
- [ ] Basic documentation complete

**Dependencies:** All previous phases

---

## Dependencies Graph

```
Phase 0 (Setup)
    │
    ├──► Phase 1 (UI Shell)
    │        │
    │        └──► Phase 3 (Agent Integration)
    │                  │
    │                  ├──► Phase 4 (Composio Tools)
    │                  │        │
    │                  │        ├──► Phase 5 (Orion Agents)
    │                  │        │        │
    │                  │        │        └──► Phase 6 (A2UI Canvas)
    │                  │        │
    │                  │        └──► Phase 7 (Inbox & Triage)
    │                  │
    │                  └──► Phase 10 (Memory)
    │
    └──► Phase 2 (Database)
              │
              └──► Phase 8 (PARA Structure)
                        │
                        └──► Phase 9 (Onboarding)

Phase 11 (Polish) depends on all above
```

---

## Success Criteria (MVP Definition)

### Must Have (MVP)
- [ ] Desktop app launches and is stable
- [ ] Chat with Claude works with streaming
- [ ] Gmail read/send works
- [ ] Calendar read/create events works
- [ ] Inbox triage with priority scoring
- [ ] Projects with tasks
- [ ] Contacts database
- [ ] Basic preferences storage
- [ ] Onboarding flow

### Should Have (Week 12+)
- [ ] Slack integration
- [ ] A2UI dynamic canvas
- [ ] Email draft suggestions
- [ ] Meeting scheduling with availability
- [ ] PARA filesystem sync
- [ ] Semantic memory recall
- [ ] Keyboard shortcuts throughout

### Nice to Have (Post-MVP)
- [ ] Voice input
- [ ] Polotno document editor
- [ ] Linear/Notion integration
- [ ] Mobile companion (Tauri iOS/Android)
- [ ] Team sharing

---

## Risk Identification (Pre-Mortem)

### High Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude CLI spawn slow | Medium | High | Cache subprocess, reuse sessions |
| Composio rate limits | Medium | High | Batch requests, add exponential backoff |
| A2UI React renderer immature | High | Medium | Start with custom components, add A2UI later |
| Tauri learning curve | Medium | Medium | Follow official tutorials, use TypeScript bindings |

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SQLite performance at scale | Low | Medium | Add indexes, consider hybrid with PostgreSQL |
| OAuth token refresh failures | Medium | Low | Add token refresh hook, graceful re-auth |
| Memory context too large | Medium | Medium | Implement context compression |
| Agent routing accuracy | Medium | Medium | Add fallback to butler for unclear intents |

### Low Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Embedding model unavailable | Low | Medium | Bundle model or use OpenAI fallback |
| Filesystem sync conflicts | Low | Low | Prompt user on conflict, prefer DB |

---

## Resource Estimates

| Phase | Weeks | Primary Focus |
|-------|-------|---------------|
| Phase 0-1 | 2 | Desktop shell, basic UI |
| Phase 2-3 | 2 | Database, agent integration |
| Phase 4-5 | 2 | Tool integration, Orion agents |
| Phase 6-7 | 2 | A2UI canvas, inbox triage |
| Phase 8-9 | 2 | PARA structure, onboarding |
| Phase 10-11 | 2 | Memory, polish |
| **Total** | **12 weeks** | |

---

## Next Steps

1. **Immediate:** Set up Tauri project with Next.js
2. **This week:** Complete Phase 0, start Phase 1
3. **First milestone (Week 3):** Chat working with Claude
4. **Second milestone (Week 6):** Gmail/Calendar connected
5. **Third milestone (Week 9):** Inbox triage working
6. **MVP (Week 12):** Full feature set, polished

---

## References

- Design: `thoughts/research/ORION-DESIGN-CONSOLIDATED.md`
- Database: `thoughts/research/database-schema-design.md`
- SDK: `thoughts/research/claude-agent-sdk-deep-dive.md`
- UI: `thoughts/research/orion-ui-design.md`
- UX: `thoughts/research/orion-ux-deep-dive.md`
- Agents: `.claude/agents/butler.md`, `.claude/agents/triage.md`
- Skills: `.claude/skills/inbox-process/SKILL.md`
