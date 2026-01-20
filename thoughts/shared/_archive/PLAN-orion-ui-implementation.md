# Plan: Orion UI Implementation

## Goal

Build the Orion personal butler UI - a multi-purpose productivity and creative workspace with chat-based agent interaction, dynamic canvas system, and PARA-based organization.

**Updated 2026-01-14:** Aligned with Tauri desktop architecture. Primary data in SQLite, Supabase for auth/sync/billing.

## Tech Stack (Final)

| Layer | Technology |
|-------|------------|
| **Desktop Shell** | Tauri 2.0 (Rust backend) |
| **Frontend** | Next.js 14+ (App Router) |
| **Styling** | **Orion Design System** + Tailwind CSS + shadcn/ui |
| **State** | Zustand + XState (for streaming) |
| **Local Database** | SQLite (via Tauri) |
| **Cloud Database** | Supabase PostgreSQL (sync + auth) |
| **Auth** | Supabase Auth (Google/Apple OAuth) |
| **Document Editor** | TipTap |
| **Design Canvas** | Polotno SDK (POST-MVP) |
| **Agent UI** | json-render (Vercel) + shadcn/ui |
| **AI** | Claude Agent SDK + Composio MCP |
| **Payments** | Stripe (USD + USDC) |
| **Distribution** | DMG installer (macOS) |

## Design System (2026-01-14)

**Location:** `design-system/`

The Orion Design System provides a unified editorial luxury aesthetic. See `design-system/README.md` for full documentation.

### Quick Setup
```typescript
// tailwind.config.ts
import { orionTailwindPreset } from './design-system/tailwind.config'

export default {
  presets: [orionTailwindPreset],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
}
```

### Core Principles
- **Zero border radius** - Sharp, architectural edges
- **Black & Gold** - Monochrome with strategic gold highlights (#D4AF37)
- **Serif headlines** - Playfair Display for elegance
- **Generous whitespace** - Editorial luxury spacing
- **Micro typography** - 9-11px uppercase tracking for labels

### Key Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `orion-primary` | `#D4AF37` | Gold accent, CTAs |
| `orion-bg` | `#F9F8F6` | Page background (cream) |
| `orion-fg` | `#1A1A1A` | Text, borders (near-black) |
| `tracking-luxury` | `0.3em` | Editorial label tracking |

### Component Classes
- `.btn-gold-slide` - Gold slide-in effect on hover
- `.luxury-card` - Card with top border, grayscale image hover
- `.input-editorial` - Underline input with serif placeholder
- `.grid-bg` - Subtle 40px grid pattern

### Fonts
Add to `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..700&display=swap" rel="stylesheet">
```

## Technical Choices

- **Tauri over Electron**: Smaller bundle, better security, Rust performance
- **SQLite + Supabase**: Local-first with cloud sync (works offline)
- **Orion Design System**: Extracted from mockups, Tailwind preset, CSS variables
- **json-render over A2UI**: First-class React support, Zod schemas, streaming built-in
- **TipTap for docs**: Best-in-class rich text, used by Notion/Linear
- **Polotno deferred**: POST-MVP to reduce initial complexity
- **Zustand + XState**: Simple state + state machines for streaming
- **Stripe for payments**: Native USDC support, usage-based billing
- **Claude proxy**: API key on backend, users don't need own key

## Current State Analysis

### Existing Assets:
- `thoughts/research/orion-ui-design.md` - UI design research
- `thoughts/research/orion-ux-deep-dive.md` - UX patterns research
- `pages/` - 25+ HTML mockups (canonical UI reference)
- `design-system/` - Extracted Tailwind preset + tokens
- `docs/CHAT-CANVAS-INTERACTION-SPEC.md` - Layout dimensions, interaction patterns
- `thoughts/shared/plans/PLAN-json-render-integration.md` - Agent UI component system

### Key Files to Create:
- Canvas mode system (design/document/form switching)
- json-render integration (see PLAN-json-render-integration.md)
- Supabase schema + client
- Agent integration layer

---

## Phase 0: Pre-Flight Check (30 min)

### Task 0.1: Verify Fork Status
- [ ] Check project-dashboard/ fork - is it usable?
- [ ] If YES: Note what needs updating
- [ ] If NO: Plan to init fresh Next.js project
- [ ] Decision: Record in this file before proceeding

**Rationale:** Avoid 2-3 day surprise if fork is broken.

---

## Phase 1: Foundation (Setup & Structure)

### Task 1.1: Verify/Setup Base Project
- [ ] Check project-dashboard fork status
- [ ] If usable: Update dependencies, clean unused code
- [ ] If not: Init fresh Next.js 14 + shadcn project
- [ ] Configure Tailwind, TypeScript strict mode

**Files:**
- `package.json`
- `tailwind.config.ts`
- `tsconfig.json`

### Task 1.2: Supabase Setup
- [ ] Create Supabase project
- [ ] Design initial schema (users, projects, areas, resources, archive, contacts, tasks)
- [ ] Enable pgvector extension
- [ ] Configure Auth providers (Google, email)
- [ ] Setup Storage buckets (assets, exports)
- [ ] Install @supabase/supabase-js, @supabase/auth-helpers-nextjs

**Files:**
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/types.ts` (generated)
- `supabase/migrations/001_initial_schema.sql`

### Task 1.3: OAuth Token Management (PRE-MORTEM MITIGATION)
- [ ] Setup Composio OAuth token storage in Supabase
- [ ] Create token refresh middleware
- [ ] Build re-auth prompt component for expired tokens
- [ ] Test token expiry flow with Gmail

**Files:**
- `lib/auth/token-refresh.ts`
- `lib/auth/composio-tokens.ts`
- `components/auth/reauth-prompt.tsx`

**Rationale:** OAuth tokens expire. Without refresh flow, users get randomly logged out.

### Task 1.4: Project Structure
- [ ] Setup folder structure following feature-based organization
- [ ] Configure path aliases
- [ ] Setup environment variables

**Structure:**
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Main app routes
│   │   ├── inbox/
│   │   ├── calendar/
│   │   ├── projects/
│   │   ├── contacts/
│   │   └── settings/
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn components
│   ├── chat/              # Chat panel components
│   ├── canvas/            # Canvas system
│   └── layout/            # Navigation, sidebar
├── lib/
│   ├── supabase/          # Supabase client
│   ├── agent/             # Claude integration
│   ├── json-render/       # json-render integration
│   └── utils/             # Helpers
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

---

## Phase 2: Core Layout & Navigation

### Task 2.0: Integrate Orion Design System (NEW)
- [ ] Import `design-system/styles/globals.css` in app globals
- [ ] Add `orionTailwindPreset` to `tailwind.config.ts`
- [ ] Add Google Fonts (Inter + Playfair Display) to layout
- [ ] Verify CSS variables are available (--orion-*)

**Files:**
- `tailwind.config.ts` - Add preset
- `app/globals.css` - Import design system
- `app/layout.tsx` - Add fonts

**Reference:** `design-system/README.md`

### Task 2.1: Main Layout
- [ ] Create app shell with sidebar + header using design system classes
- [ ] Implement split-screen layout (chat 35% + canvas 65%)
- [ ] Add resizable panels (react-resizable-panels)
- [ ] Use `--orion-header-height: 80px`, `--orion-sidebar-width: 280px`

**Files:**
- `app/(dashboard)/layout.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/header.tsx`
- `components/layout/split-panel.tsx`

### Task 2.2: Navigation
- [ ] PARA-based sidebar navigation (Projects, Areas, Resources, Archive)
- [ ] Quick actions menu (Cmd+K)
- [ ] User menu with settings, logout

**Files:**
- `components/layout/nav-items.tsx`
- `components/layout/command-menu.tsx`
- `components/layout/user-menu.tsx`

---

## Phase 3: Chat Panel

### Task 3.1: Chat Interface
- [ ] Install Vercel AI SDK + AI Elements
- [ ] Create message list component
- [ ] Implement streaming response display
- [ ] Add typing indicator
- [ ] Create chat input with submit

**Files:**
- `components/chat/chat-panel.tsx`
- `components/chat/message-list.tsx`
- `components/chat/message-item.tsx`
- `components/chat/chat-input.tsx`

### Task 3.2: Agent Status Display
- [ ] Agent activity indicator (working/idle)
- [ ] Collapsible agent step view
- [ ] Tool call cards (Gmail, Calendar, etc.)
- [ ] Progress tracker for multi-step tasks

**Files:**
- `components/chat/agent-status.tsx`
- `components/chat/tool-call-card.tsx`
- `components/chat/progress-tracker.tsx`

### Task 3.3: Chat API Route
- [ ] Create /api/chat route
- [ ] Integrate Claude Agent SDK
- [ ] Setup Composio tools
- [ ] Handle streaming responses

**Files:**
- `app/api/chat/route.ts`
- `lib/agent/client.ts`
- `lib/agent/tools.ts`

### Task 3.4: API Resilience (PRE-MORTEM MITIGATION)
- [ ] Implement circuit breaker for Composio tool calls
- [ ] Add retry logic with exponential backoff
- [ ] Create graceful degradation UI (show cached data when API down)
- [ ] Add user-facing error states ("Gmail unavailable, showing cached emails")

**Files:**
- `lib/agent/circuit-breaker.ts`
- `lib/agent/retry.ts`
- `components/ui/service-unavailable.tsx`
- `components/ui/cached-data-banner.tsx`

**Rationale:** External APIs (Gmail, Calendar) WILL go down. App must not break.

### Task 3.5: Claude API Rate Limiting (PRE-MORTEM MITIGATION)
- [ ] Implement per-user rate limiting (requests/minute)
- [ ] Add cost circuit breaker (pause if daily spend > threshold)
- [ ] Create request queue to prevent burst abuse
- [ ] Add admin dashboard for cost monitoring

**Files:**
- `lib/agent/rate-limiter.ts`
- `lib/agent/cost-guard.ts`
- `app/api/chat/middleware.ts`

**Rationale:** Without rate limiting, bugs or abuse can cause runaway API costs.

### Task 3.6: Error Handling Infrastructure
- [ ] Add global error boundary
- [ ] Setup Sentry or similar error reporting
- [ ] Create toast notification system for errors
- [ ] Log errors to Supabase for debugging

**Files:**
- `app/error.tsx`
- `lib/error-reporting.ts`
- `components/ui/toast.tsx`

---

## Phase 4: Canvas System

### Task 4.1: Canvas Container
> **Reference:** `docs/CHAT-CANVAS-INTERACTION-SPEC.md` for layout dimensions

- [ ] Create canvas mode switcher (hidden/document/email-compose/design/json-render)
- [ ] Implement mode-specific rendering
- [ ] Canvas width: 50% when open, 0 when hidden
- [ ] Add asset tray for generated content
- [ ] Handle canvas state in Zustand
- [ ] Keyboard shortcuts: Esc to close canvas

**Dimensions (from spec):**
- Sidebar: 280px expanded → 72px collapsed
- Header: 80px
- Canvas: 50% width when open

**Files:**
- `components/canvas/canvas-panel.tsx`
- `components/canvas/canvas-switcher.tsx`
- `components/canvas/asset-tray.tsx`
- `stores/canvas-store.ts`

### Task 4.2: json-render Integration
> **See:** `PLAN-json-render-integration.md` for full implementation details

- [ ] Install @json-render/core, @json-render/react, zod
- [ ] Create component catalog with Zod schemas
- [ ] Map catalog components to shadcn/ui implementations
- [ ] Implement action handlers (send_email, schedule_meeting, etc.)
- [ ] Setup streaming with useUIStream hook
- [ ] Add json-render canvas mode to canvas-store

**Files:**
- `lib/json-render/catalog.ts` - Zod component schemas
- `lib/json-render/registry.tsx` - React component mapping
- `lib/json-render/actions.ts` - Action handlers
- `lib/json-render/stream.ts` - Streaming integration
- `components/canvas/editors/JsonRenderCanvas.tsx`

**Reference Specs:**
- `docs/CHAT-CANVAS-INTERACTION-SPEC.md` - When to use inline vs canvas
- `PLAN-json-render-integration.md` - Full implementation phases

### Task 4.3: Polotno Integration (Design Mode)
- [ ] Install Polotno SDK
- [ ] Create design canvas wrapper
- [ ] Configure default tools and panels
- [ ] Implement save/load to Supabase Storage
- [ ] Add export functionality (PNG, PDF)

**Files:**
- `components/canvas/design/polotno-canvas.tsx`
- `components/canvas/design/toolbar.tsx`
- `lib/polotno/config.ts`
- `lib/polotno/storage.ts`

### Task 4.4: TipTap Integration (Document Mode)
- [ ] Install TipTap + extensions
- [ ] Create document editor component
- [ ] Configure toolbar (headings, lists, formatting)
- [ ] Implement autosave to Supabase
- [ ] Add export (Markdown, PDF)

**Files:**
- `components/canvas/document/tiptap-editor.tsx`
- `components/canvas/document/toolbar.tsx`
- `lib/tiptap/extensions.ts`
- `lib/tiptap/config.ts`

---

## Phase 5: Core Pages

### Task 5.1: Daily Briefing (Home)
- [ ] Today's schedule card
- [ ] Priority emails card
- [ ] Tasks due card
- [ ] Quick actions

**Files:**
- `app/(dashboard)/page.tsx`
- `components/briefing/schedule-card.tsx`
- `components/briefing/emails-card.tsx`
- `components/briefing/tasks-card.tsx`

### Task 5.2: Inbox Page
- [ ] Email list with filters
- [ ] Email preview in canvas
- [ ] Quick actions (reply, archive, snooze)
- [ ] Composio Gmail integration

**Files:**
- `app/(dashboard)/inbox/page.tsx`
- `components/inbox/email-list.tsx`
- `components/inbox/email-preview.tsx`
- `components/inbox/email-actions.tsx`

### Task 5.3: Calendar Page
- [ ] Week/day view
- [ ] Event cards
- [ ] Quick scheduling
- [ ] Composio Calendar integration

**Files:**
- `app/(dashboard)/calendar/page.tsx`
- `components/calendar/calendar-view.tsx`
- `components/calendar/event-card.tsx`

### Task 5.4: Projects & Tasks
- [ ] Project list with PARA organization
- [ ] Task list with filters
- [ ] Task detail in canvas
- [ ] Drag-drop reordering

**Files:**
- `app/(dashboard)/projects/page.tsx`
- `app/(dashboard)/projects/[id]/page.tsx`
- `components/projects/project-list.tsx`
- `components/tasks/task-list.tsx`

### Task 5.5: Contacts
- [ ] Contact list
- [ ] Contact card in canvas
- [ ] Interaction history
- [ ] Add/edit contact

**Files:**
- `app/(dashboard)/contacts/page.tsx`
- `components/contacts/contact-list.tsx`
- `components/contacts/contact-card.tsx`

### Task 5.6: Settings
- [ ] Profile settings
- [ ] Connected accounts (OAuth)
- [ ] Notification preferences
- [ ] PARA area configuration
- [ ] Skills management (power users)

**Files:**
- `app/(dashboard)/settings/page.tsx`
- `app/(dashboard)/settings/accounts/page.tsx`
- `app/(dashboard)/settings/areas/page.tsx`

---

## Phase 6: Onboarding

### Task 6.1: Onboarding Flow
- [ ] Welcome screen
- [ ] Area selection (PARA setup)
- [ ] Account connections (Gmail, Calendar)
- [ ] First task prompt
- [ ] Skip option for minimal setup

**Files:**
- `app/(auth)/onboarding/page.tsx`
- `components/onboarding/welcome-step.tsx`
- `components/onboarding/areas-step.tsx`
- `components/onboarding/connections-step.tsx`
- `components/onboarding/complete-step.tsx`

---

## Phase 7: Image Generation

### Task 7.1: Generation Queue
- [ ] Create generation job queue
- [ ] Progress tracking
- [ ] Result storage in Supabase

**Files:**
- `lib/generation/queue.ts`
- `lib/generation/image.ts`
- `app/api/generate/image/route.ts`

### Task 7.2: Image Gallery Canvas
- [ ] Grid view of generated images
- [ ] Selection and download
- [ ] Send to Polotno editor

**Files:**
- `components/canvas/gallery/image-gallery.tsx`
- `components/canvas/gallery/image-card.tsx`

---

## Phase 8: File Export (Simplified - PRE-MORTEM REVISION)

**Note:** Original plan used chokidar for file watching, but this requires Node.js and won't work in a browser. Full bi-directional sync moved to "Out of Scope" until desktop app is built.

### Task 8.1: Manual File Export
- [ ] Create "Export to Desktop" button for documents
- [ ] Use browser File System Access API (Chrome) with fallback to download
- [ ] Export designs as PNG/PDF via Polotno
- [ ] Export documents as Markdown/PDF via TipTap
- [ ] Batch export for projects

**Files:**
- `lib/files/export.ts`
- `lib/files/download.ts`
- `components/ui/export-button.tsx`

### Task 8.2: Import from Files
- [ ] Drag-drop file upload
- [ ] Import images to Polotno
- [ ] Import Markdown to TipTap
- [ ] Store in Supabase Storage

**Files:**
- `lib/files/import.ts`
- `components/ui/file-dropzone.tsx`

**Rationale:** Bi-directional file sync requires desktop app (Electron/Tauri). Web app can only export/import on demand.

---

## Phase 9: Payments & Subscriptions

### Task 9.1: Stripe Setup
- [ ] Create Stripe account and configure
- [ ] Create products and prices (Free, Pro, Team tiers)
- [ ] Setup webhook endpoint secret
- [ ] Install stripe and @stripe/stripe-js

**Files:**
- `lib/stripe/client.ts`
- `lib/stripe/config.ts`

### Task 9.2: Database Schema for Billing
- [ ] Add subscriptions table
- [ ] Add usage tracking table
- [ ] Add plan_limits table
- [ ] Create RLS policies for billing data

**Files:**
- `supabase/migrations/002_billing_schema.sql`

**Schema:**
```sql
-- Subscriptions (synced from Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free', -- 'free', 'pro', 'team'
  status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  payment_method TEXT, -- 'card', 'usdc'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT, -- 'agent_action', 'image_gen', 'video_gen'
  count INTEGER DEFAULT 1,
  period_start DATE DEFAULT date_trunc('month', NOW()),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan limits
CREATE TABLE plan_limits (
  plan TEXT PRIMARY KEY,
  agent_actions INTEGER,
  image_generations INTEGER,
  video_minutes INTEGER,
  storage_gb INTEGER
);

INSERT INTO plan_limits VALUES
  ('free', 50, 5, 0, 1),
  ('pro', 500, 100, 10, 10),
  ('team', -1, 500, 60, 100); -- -1 = unlimited
```

### Task 9.3: Webhook Handler
- [ ] Create /api/webhooks/stripe route
- [ ] Handle checkout.session.completed
- [ ] Handle customer.subscription.updated
- [ ] Handle customer.subscription.deleted
- [ ] Handle invoice.payment_succeeded
- [ ] Handle invoice.payment_failed
- [ ] Sync subscription status to Supabase

**Files:**
- `app/api/webhooks/stripe/route.ts`
- `lib/stripe/webhook-handlers.ts`

### Task 9.4: Pricing Page
- [ ] Create pricing comparison component
- [ ] Show current plan indicator
- [ ] Feature comparison table
- [ ] CTA buttons for each tier

**Files:**
- `app/(marketing)/pricing/page.tsx`
- `components/pricing/pricing-card.tsx`
- `components/pricing/feature-table.tsx`

### Task 9.5: Checkout Flow
- [ ] Payment method selector (Card vs USDC)
- [ ] Stripe Checkout for card payments
- [ ] Stripe USDC payment flow
- [ ] Handle success/cancel redirects
- [ ] Show confirmation page

**Files:**
- `app/(dashboard)/upgrade/page.tsx`
- `components/billing/payment-method-selector.tsx`
- `components/billing/checkout-button.tsx`
- `app/api/checkout/route.ts`

### Task 9.6: USDC Stablecoin Payments (PRE-MORTEM NOTE)
- [ ] Enable Stripe stablecoin payments
- [ ] Configure supported networks (Base, Polygon, Solana)
- [ ] Wallet connection UI (Stripe built-in)
- [ ] Handle stablecoin webhook events
- [ ] **Add geo-detection** - USDC subscriptions US-only currently
- [ ] **Fallback for international** - USDC one-time payments or card-only

**Files:**
- `lib/stripe/stablecoin.ts`
- `lib/stripe/geo-detect.ts`
- `components/billing/usdc-payment.tsx`

**Note:** Stripe USDC recurring subscriptions are US-only (as of Oct 2025 preview). International users see card-only or USDC one-time top-up option.

### Task 9.7: Customer Portal
- [ ] Add Stripe Customer Portal link
- [ ] Allow subscription management
- [ ] Allow payment method updates
- [ ] Show invoice history

**Files:**
- `app/api/billing/portal/route.ts`
- `components/billing/manage-subscription.tsx`

### Task 9.8: Usage Tracking
- [ ] Create usage tracking middleware
- [ ] Track agent actions
- [ ] Track image generations
- [ ] Track storage usage
- [ ] Report usage to Stripe Billing Meters

**Files:**
- `lib/billing/track-usage.ts`
- `lib/billing/check-limits.ts`
- `middleware.ts` (update)

### Task 9.9: Usage Limits Enforcement
- [ ] Check limits before expensive operations
- [ ] Show upgrade prompts when near limit
- [ ] Block actions when over limit (free tier)
- [ ] Allow overages for paid tiers

**Files:**
- `lib/billing/enforce-limits.ts`
- `components/billing/usage-warning.tsx`
- `components/billing/upgrade-prompt.tsx`

### Task 9.10: Usage Dashboard
- [ ] Current usage display
- [ ] Usage by category chart
- [ ] Period reset countdown
- [ ] Projected overage cost

**Files:**
- `app/(dashboard)/settings/billing/page.tsx`
- `components/billing/usage-chart.tsx`
- `components/billing/usage-summary.tsx`

---

## Success Criteria

### Automated Verification:
- [ ] `pnpm build`: No errors
- [ ] `pnpm lint`: No warnings
- [ ] `pnpm test`: All tests pass
- [ ] Lighthouse score > 90

### Manual Verification:
- [ ] Can sign up and complete onboarding
- [ ] Can chat with agent and see responses stream
- [ ] Agent can show json-render form in canvas
- [ ] Can create design in Polotno, save, reload
- [ ] Can write document in TipTap, autosaves
- [ ] Can view inbox with real Gmail data
- [ ] Can schedule meeting via chat
- [ ] Mobile responsive (viewport test)
- [ ] Can upgrade plan with card payment
- [ ] Can upgrade plan with USDC payment
- [ ] Usage limits enforced correctly
- [ ] Can view usage dashboard in settings

---

## Out of Scope (Future Phases)

- Video generation (Runway integration)
- Mobile native apps (React Native)
- Team/collaboration features
- Custom skill builder UI
- Voice input/output
- Offline mode
- Desktop app (Electron/Tauri)
- Additional crypto payments (BTC, ETH, USDT via NOWPayments)
- Enterprise billing (custom contracts, invoicing)
- **Bi-directional file sync** (requires desktop app - moved from Phase 8)
- **Real-time collaboration** (Supabase Realtime available but not in v1)

---

## Testing Strategy (PRE-MORTEM ADDITION)

### Per-Phase Testing

Each phase should include testing before moving to next:

| Phase | Test Type | Coverage Target |
|-------|-----------|-----------------|
| Phase 1 | Unit tests for lib/ | Supabase client, auth utils |
| Phase 2 | Component tests | Layout, navigation components |
| Phase 3 | Integration tests | Chat API, streaming, tool calls |
| Phase 4 | Component tests | Canvas modes, json-render components |
| Phase 5 | E2E tests | Inbox, calendar, projects flows |
| Phase 6 | E2E tests | Onboarding flow |
| Phase 7 | Integration tests | Generation queue, storage |
| Phase 8 | Unit tests | Export/import functions |
| Phase 9 | Integration tests | Stripe webhooks, checkout |

### Critical Path E2E Tests

Must pass before launch:
- [ ] User can sign up → onboard → connect Gmail
- [ ] User can chat → agent fetches emails → displays in canvas
- [ ] User can schedule meeting via chat
- [ ] User can upgrade plan via card
- [ ] User can upgrade plan via USDC (US only)
- [ ] Usage limits are enforced

### Test Files

- `__tests__/` - Unit and integration tests (Vitest)
- `e2e/` - E2E tests (Playwright)
- `package.json` - Add test scripts

---

## Risks (Updated via Pre-Mortem)

### Tigers - MITIGATED in Plan:
- **[HIGH] No fallback for Composio failures** → Added Task 3.4 (circuit breaker, retry, graceful degradation)
- **[HIGH] No Claude API rate limiting** → Added Task 3.5 (rate limiter, cost guard)
- **[HIGH] File sync won't work in browser** → Revised Phase 8 to export/import only
- **[MEDIUM] No OAuth token refresh** → Added Task 1.3 (token refresh middleware)
- **[MEDIUM] USDC subscriptions US-only** → Added geo-detection to Task 9.6

### Tigers - ACKNOWLEDGED (still need attention):
- **Polotno license cost** (MEDIUM) - Verify pricing fits budget before Phase 4
  - Mitigation: Start with trial, have tldraw as fallback
- **json-render version stability** (LOW) - Vercel Labs project, may have API changes
  - Mitigation: Pin version, abstract behind our types (see json-render plan)

### Elephants (Unspoken Concerns):
- **Scope creep** (MEDIUM) - Creative canvas adds significant complexity
  - Note: Consider launching productivity-first, creative as v2
- **Timeline optimism** (MEDIUM) - 28-40 days assumes no hiccups
  - Note: Realistic with first-time integrations is 40-60 days
- **Solo developer burnout** (LOW) - 40 days continuous is intense
  - Note: Add break points after Phases 3, 5, 7

### Pre-Mortem Run:
- **Date:** 2026-01-13
- **Mode:** Deep
- **Tigers identified:** 5 (3 HIGH, 2 MEDIUM)
- **Elephants identified:** 4
- **All HIGH tigers mitigated in plan:** ✓

---

## Dependency Graph

```
Phase 1 (Foundation)
    ↓
Phase 2 (Layout) ──────────────────┐
    ↓                              │
Phase 3 (Chat) ←───────────────────┤
    ↓                              │
Phase 4 (Canvas) ←─────────────────┘
    ↓
Phase 5 (Pages) ← depends on Chat + Canvas
    ↓
Phase 6 (Onboarding)
    ↓
Phase 7 (Generation) ← depends on Canvas
    ↓
Phase 8 (File Sync)
    ↓
Phase 9 (Payments) ← can start after Phase 1, parallel with others
```

Note: Phase 9 only depends on Phase 1 (Supabase). Can be developed in parallel with Phases 2-8 if desired.

---

## Estimated Effort (Updated with Mitigations)

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 0: Pre-Flight | 0.5 days | Verify fork status |
| Phase 1: Foundation | 3-4 days | +1 day for OAuth token management |
| Phase 2: Layout | 2-3 days | |
| Phase 3: Chat | 5-6 days | +2 days for resilience, rate limiting, error handling |
| Phase 4: Canvas | 5-7 days | |
| Phase 5: Pages | 5-7 days | |
| Phase 6: Onboarding | 2-3 days | |
| Phase 7: Generation | 2-3 days | |
| Phase 8: File Export | 1-2 days | Simplified from sync to export/import |
| Phase 9: Payments | 4-5 days | +1 day for geo-detection |

**Total: ~31-45 days** for full implementation (with mitigations)

MVP (Phases 0-5): ~18-25 days
MVP + Payments (Phases 0-5, 9): ~22-30 days

**Realistic estimate with buffer:** 45-60 days (accounting for first-time integrations)

---

## Pricing Tiers Summary

| Tier | Price | Agent Actions | Image Gens | Storage |
|------|-------|---------------|------------|---------|
| **Free** | $0/mo | 50/mo | 5/mo | 1 GB |
| **Pro** | $19/mo | 500/mo | 100/mo | 10 GB |
| **Team** | $49/mo | Unlimited | 500/mo | 100 GB |

**Usage Overages (paid tiers):**
- Agent actions: $0.01 each
- Image generations: $0.05 each
- Video minutes: $0.10/min

**Payment Methods:**
- Credit/Debit Card (Stripe)
- USDC Stablecoin (Base, Polygon, Solana networks)
