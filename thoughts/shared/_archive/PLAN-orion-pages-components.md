# Plan: Orion UI Pages & Components Implementation

## Goal
Convert 29 HTML design mockups into a production React/Next.js application with consistent branding, shared design system, and properly structured components. Fix the 4 chat pages ("Orion _" prefix) to align with the main design language.

## Technical Choices
- **Framework**: Next.js 15 with App Router (already set up)
- **Styling**: **Orion Design System** (`design-system/`) + Tailwind CSS + shadcn/ui
- **UI Base**: shadcn/ui + design system luxury components (`.btn-gold-slide`, `.luxury-card`, etc.)
- **Icons**: lucide-react (already available)
- **Fonts**: Inter + Playfair Display (via design system Google Fonts URL)
- **State Management**: Zustand (for panel state, canvas state)
- **Canvas/Editor**: TipTap (for document editing in canvas)

## Design System Reference (2026-01-14)

**Location:** `design-system/`

The design tokens and Tailwind preset have been extracted from the HTML mockups and are ready to use.

### Setup (already done in design-system/)
```typescript
// Import in tailwind.config.ts
import { orionTailwindPreset } from './design-system/tailwind.config'
export default { presets: [orionTailwindPreset], ... }

// Import in app/globals.css
@import '../design-system/styles/globals.css';
```

### Available Components (from design system)
| Class | Description |
|-------|-------------|
| `.btn-gold-slide` | Gold slide-in effect on hover |
| `.luxury-card` | Card with top border, grayscale-to-color images |
| `.input-editorial` | Underline input with serif placeholder |
| `.grid-bg` | Subtle 40px grid pattern |
| `.chat-user` | User message styling (black bg, cream text) |
| `.chat-agent` | Agent message styling (gold left border) |
| `.serif` | Playfair Display font family |
| `.tracking-luxury` | 0.3em letter spacing |

### Layout Variables
| Variable | Value |
|----------|-------|
| `--orion-header-height` | 80px |
| `--orion-sidebar-width` | 280px |
| `--orion-rail-width` | 64px |
| `--orion-content-max-width` | 850px |

## Design System Analysis

> **NOTE:** Design tokens have been extracted to `design-system/`. Use the preset and CSS classes instead of defining manually.

### Color Palette (from `design-system/tokens/colors.ts`)
```css
--orion-primary: #D4AF37       /* Gold - accent, CTAs */
--orion-bg: #F9F8F6            /* Off-white - main bg */
--orion-fg: #1A1A1A            /* Black - text, borders */
--orion-border-muted: rgba(26,26,26,0.15) /* Subtle borders */
```

### Typography (from `design-system/tokens/typography.ts`)
- **Sans**: Inter (UI text, labels) - `font-sans` or default
- **Serif**: Playfair Display (headlines) - `.serif` class
- **Letter Spacing**: `tracking-editorial` (0.25em), `tracking-luxury` (0.3em), `tracking-ultra` (0.4em)

### Branding (Logo)
**Standard format**: `Or<span class="text-orion-primary">i</span>on` (serif, gold "i")
- This is the canonical logo treatment
- 4 chat pages need to be updated to use this

### Key Design Patterns (all available in design system)
1. **Gold Slide Buttons**: `.btn-gold-slide` class
2. **Sharp Corners**: Global `border-radius: 0` via CSS reset
3. **Editorial Spacing**: `.tracking-luxury` class
4. **Panel Layout**: Use `--orion-sidebar-width`, `--orion-rail-width` variables
5. **Animations**: `animate-reveal`, `animate-fade-in` classes with delays

## Current State Analysis

### Existing Structure:
```
orion-app/src/
├── app/
│   ├── (app)/           # Protected routes group
│   │   ├── chat/page.tsx      # Placeholder
│   │   ├── inbox/page.tsx     # Placeholder
│   │   ├── calendar/page.tsx  # Placeholder
│   │   ├── projects/page.tsx  # Placeholder
│   │   ├── settings/page.tsx  # Placeholder
│   │   └── layout.tsx         # App layout with sidebar
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # shadcn components
│   ├── canvas/           # CanvasPanel.tsx
│   ├── chat/             # ChatPanel.tsx
│   └── layout/           # AppSidebar, AppLayout
├── hooks/
├── lib/
├── stores/
└── pages/                # 29 HTML design files (source)
```

### HTML Pages to Convert:
| # | File | Route | Priority |
|---|------|-------|----------|
| 01 | orion-executive-dashboard | /dashboard | High |
| 02 | orion-sign-in | /auth/signin | High |
| 03 | orion-sign-up | /auth/signup | High |
| 04 | orion-welcome-onboarding | /onboarding | Medium |
| 05 | areas-setup-orion | /onboarding/areas | Medium |
| 06 | orion-agent-workspace | /chat | **High** |
| 07 | orion-inbox-daily-view | /inbox | **High** |
| 08 | orion-project-portfolio | /projects | High |
| 09 | orion-project-detail | /projects/[id] | Medium |
| 10 | orion-areas-hub | /areas | Medium |
| 11 | orion-knowledge-archive | /knowledge | Medium |
| 12 | orion-settings-hub | /settings | High |
| 13 | orion-billing-plans | /settings/billing | Low |
| 14 | orion-contacts-list | /contacts | Medium |
| 15 | orion-contact-detail | /contacts/[id] | Medium |
| 16 | orion-knowledge-archive (dup) | - | Skip |
| 17 | area-detail-financial-governance | /areas/[id] | Medium |
| 18 | orion-global-directives | /directives | Medium |
| 19 | orion-calendar-week-view | /calendar | High |
| 20 | orion-notifications-center | /notifications | Medium |
| 21 | orion-pricing-plans | /pricing (marketing) | Low |
| 22 | orion-dialogue-archive | /dialogues | Medium |
| 23 | orion-chat-project-discussion | /chat/[id] | Medium |
| 24 | orion-knowledge-sync | /knowledge/sync | Low |
| 25 | canvas-editor-full | (component) | High |

### 4 Chat Pages (Need Branding Fix):
| File | Issue | Fix |
|------|-------|-----|
| Orion _ A2UI Scheduling Interaction | Logo plain "Orion" | Use gold-i treatment |
| Orion _ Canvas Email Composer | Logo plain "Orion" | Use gold-i treatment |
| Orion _ Inbox Process Mode | Logo uppercase "ORION" | Use gold-i treatment |
| Orion _ Luxury GTD Workspace | Different sidebar style | Align with main sidebar |

---

## Tasks

### Phase 1: Design System Integration

> **STATUS:** Design system already extracted to `design-system/`. These tasks are about INTEGRATING it into the app, not creating from scratch.

#### Task 1.1: Integrate Tailwind Preset
Import the Orion design system preset.

- [ ] Add `orionTailwindPreset` to `tailwind.config.ts`
- [ ] Verify colors (`orion-primary`, `orion-bg`, `orion-fg`) are available
- [ ] Verify utilities (`.serif`, `.tracking-luxury`) work

**Files to modify:**
- `tailwind.config.ts`

**Reference:**
```typescript
import { orionTailwindPreset } from './design-system/tailwind.config'
export default { presets: [orionTailwindPreset], ... }
```

#### Task 1.2: Import Global Styles
Import the design system CSS.

- [ ] Import `design-system/styles/globals.css` in app globals
- [ ] Verify CSS variables are available (--orion-*)
- [ ] Verify component classes work (.btn-gold-slide, .luxury-card)

**Files to modify:**
- `src/app/globals.css`

**Reference:**
```css
@import '../design-system/styles/globals.css';
```

#### Task 1.3: Setup Google Fonts
Add the fonts to the HTML head.

- [ ] Add Google Fonts link to layout or document head
- [ ] Verify Inter and Playfair Display render correctly

**Files to modify:**
- `src/app/layout.tsx`

**Reference:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..700&display=swap" rel="stylesheet">
```

---

### Phase 2: Core Primitives (React Wrappers)

> **NOTE:** Base styling is available via design system CSS classes. These React components wrap the classes for better DX.

#### Task 2.1: Create Luxury Button Component
React wrapper for `.btn-gold-slide` with variants.

- [ ] Create `LuxuryButton` component using `.btn-gold-slide` base
- [ ] Add variants (primary uses gold-slide, secondary, ghost)
- [ ] Add size variants (sm, md, lg) via padding
- [ ] Add icon support

**Files to create:**
- `src/components/ui/luxury-button.tsx`

**Usage:**
```tsx
<LuxuryButton variant="primary">Execute</LuxuryButton>
// Renders with: className="btn-gold-slide px-10 py-4 uppercase text-xs tracking-luxury font-bold"
```

#### Task 2.2: Create Luxury Input Component
React wrapper for `.input-editorial`.

- [ ] Create `LuxuryInput` component using `.input-editorial` base
- [ ] Add label support with `.tracking-luxury .uppercase`
- [ ] Focus styling already in design system CSS

**Files to create:**
- `src/components/ui/luxury-input.tsx`

**Usage:**
```tsx
<LuxuryInput label="Email Address" placeholder="Search your archive..." />
```

#### Task 2.3: Create Luxury Select Component
Editorial select dropdown.

- [ ] Create `LuxurySelect` component
- [ ] Style with underline border (like input-editorial)
- [ ] Add option styling

**Files to create:**
- `src/components/ui/luxury-select.tsx`

#### Task 2.4: Create Luxury Card Component
React wrapper for `.luxury-card`.

- [ ] Create `LuxuryCard` component using `.luxury-card` base
- [ ] Grayscale-to-color image effect already in CSS
- [ ] Add variants (default, bordered, featured)

**Files to create:**
- `src/components/ui/luxury-card.tsx`

**Usage:**
```tsx
<LuxuryCard>
  <img src="..." className="w-full h-48 object-cover" />
  <p className="text-xs uppercase tracking-widest">Category</p>
  <h3 className="serif text-xl">Title</h3>
</LuxuryCard>
```

---

### Phase 3: Layout Components

#### Task 3.1: Create Orion Logo Component
Canonical logo with gold "i" treatment.

- [ ] Create `OrionLogo` component with size variants
- [ ] Add serif styling with gold highlight
- [ ] Support horizontal and stacked layouts

**Files to create:**
- `src/components/brand/orion-logo.tsx`

#### Task 3.2: Refactor AppSidebar with Luxury Styling
Update sidebar with editorial design.

- [ ] Add collapsible functionality with animation
- [ ] Update nav items with new styling (tracking, hover effects)
- [ ] Add inbox filter section
- [ ] Add user avatar section at bottom
- [ ] Use OrionLogo component

**Files to modify:**
- `src/components/layout/app-sidebar.tsx`

#### Task 3.3: Create GlobalHeader Component
Top navigation bar with command hints.

- [ ] Create header with logo, search, settings, user avatar
- [ ] Add keyboard shortcut hints (Cmd+K, Cmd+N)
- [ ] Add notification bell

**Files to create:**
- `src/components/layout/global-header.tsx`

#### Task 3.4: Refactor AppLayout
Update main layout structure.

- [ ] Add GlobalHeader
- [ ] Update sidebar integration
- [ ] Add canvas panel slot
- [ ] Add panel state management

**Files to modify:**
- `src/app/(app)/layout.tsx`

---

### Phase 4: Canvas System

#### Task 4.1: Create Canvas Panel Component
Sliding canvas panel for documents/editors.

- [ ] Create `CanvasPanel` component with slide animation
- [ ] Add header with title and close button
- [ ] Add content slot
- [ ] Integrate with panel state store

**Files to modify:**
- `src/components/canvas/CanvasPanel.tsx`

#### Task 4.2: Create Canvas Email Composer
Email composition canvas view.

- [ ] Create `EmailComposer` component
- [ ] Add To/Subject fields with luxury styling
- [ ] Add toolbar (bold, italic, link, list, AI sparkle)
- [ ] Add rich text area placeholder (TipTap integration later)
- [ ] Add Send/Save actions

**Files to create:**
- `src/components/canvas/EmailComposer.tsx`

#### Task 4.3: Create Canvas Document Editor
Document editing canvas view.

- [ ] Create `DocumentEditor` component
- [ ] Add TipTap placeholder structure
- [ ] Add title field

**Files to create:**
- `src/components/canvas/DocumentEditor.tsx`

---

### Phase 5: Chat System

#### Task 5.1: Create Chat Message Components
Message bubbles for chat interface.

- [ ] Create `UserMessage` component (left-aligned, serif, bordered)
- [ ] Create `AgentMessage` component (gold accent, sparkle icon)
- [ ] Add avatar support
- [ ] Add timestamp formatting

**Files to create:**
- `src/components/chat/UserMessage.tsx`
- `src/components/chat/AgentMessage.tsx`

#### Task 5.2: Create A2UI Components
Agent-to-User Interface widgets.

- [ ] Create `A2UIRadioGroup` (slot selection style)
- [ ] Create `A2UISelect` (duration, location selection)
- [ ] Create `A2UIActionBar` (primary/secondary CTA buttons)

**Files to create:**
- `src/components/chat/a2ui/RadioGroup.tsx`
- `src/components/chat/a2ui/Select.tsx`
- `src/components/chat/a2ui/ActionBar.tsx`

#### Task 5.3: Create Chat Input Component
Bottom input area with luxury styling.

- [ ] Create `ChatInput` component
- [ ] Add serif italic input styling
- [ ] Add attachment and send icons
- [ ] Add keyboard hints

**Files to modify:**
- `src/components/chat/ChatPanel.tsx`

#### Task 5.4: Implement Chat Page
Full chat/agent workspace page.

- [ ] Implement `/chat` page with message list
- [ ] Add chat input at bottom
- [ ] Wire up canvas trigger
- [ ] Add scroll behavior

**Files to modify:**
- `src/app/(app)/chat/page.tsx`

---

### Phase 6: Core Pages

#### Task 6.1: Implement Dashboard Page
Executive dashboard with welcome state.

- [ ] Create welcome hero section (Good morning, X items awaiting)
- [ ] Add background O motif
- [ ] Add quick action buttons
- [ ] Add input area

**Files to create:**
- `src/app/(app)/dashboard/page.tsx`

#### Task 6.2: Implement Inbox Page
Inbox with daily view and filters.

- [ ] Create inbox item list component
- [ ] Add filter tabs (All, Unread, Today, Done)
- [ ] Add item preview on click
- [ ] Wire up to chat/canvas

**Files to modify:**
- `src/app/(app)/inbox/page.tsx`

#### Task 6.3: Implement Calendar Page
Week view calendar.

- [ ] Create week view grid
- [ ] Add time slots
- [ ] Add event cards
- [ ] Add navigation (prev/next week)

**Files to modify:**
- `src/app/(app)/calendar/page.tsx`

#### Task 6.4: Implement Projects Page
Project portfolio view.

- [ ] Create project card grid
- [ ] Add project status badges
- [ ] Add filter/search
- [ ] Link to project detail

**Files to modify:**
- `src/app/(app)/projects/page.tsx`

#### Task 6.5: Implement Settings Page
Settings hub.

- [ ] Create settings section layout
- [ ] Add profile section
- [ ] Add notification preferences
- [ ] Add integrations section

**Files to modify:**
- `src/app/(app)/settings/page.tsx`

---

### Phase 7: Auth Pages

#### Task 7.1: Create Auth Layout
Shared layout for auth pages.

- [ ] Create split layout (image left, form right)
- [ ] Add editorial image with gradient overlay
- [ ] Add grid background on form side

**Files to create:**
- `src/app/auth/layout.tsx`

#### Task 7.2: Implement Sign In Page
Sign in form with luxury styling.

- [ ] Create form with email/password fields
- [ ] Add social login buttons (Google, Apple)
- [ ] Add editorial footer
- [ ] Add links to signup/forgot password

**Files to create:**
- `src/app/auth/signin/page.tsx`

#### Task 7.3: Implement Sign Up Page
Sign up form.

- [ ] Create form with name/email/password fields
- [ ] Add social signup buttons
- [ ] Add terms checkbox

**Files to create:**
- `src/app/auth/signup/page.tsx`

---

### Phase 8: State Management

#### Task 8.1: Create Panel State Store
Zustand store for panel visibility.

- [ ] Create `usePanelStore` with sidebar/canvas state
- [ ] Add toggle functions
- [ ] Add canvas content type state

**Files to create:**
- `src/stores/panel-store.ts`

#### Task 8.2: Create Chat State Store
Store for chat messages and context.

- [ ] Create `useChatStore` with messages array
- [ ] Add selected item state
- [ ] Add send message action

**Files to create:**
- `src/stores/chat-store.ts`

---

### Phase 9: Fix 4 Chat Pages Branding

#### Task 9.1: Audit Chat Page Inconsistencies
Document specific issues in each page.

- [ ] Compare logo treatments
- [ ] Compare sidebar styling
- [ ] Note color/spacing differences

#### Task 9.2: Create Unified Chat Page Reference
Extract best patterns from all 4 pages.

- [ ] Identify best A2UI patterns
- [ ] Extract canvas interactions
- [ ] Document conversation flows

#### Task 9.3: Update Components to Match
Ensure React components match unified design.

- [ ] Verify OrionLogo matches spec
- [ ] Verify sidebar matches numbered pages
- [ ] Verify chat message styling consistent

---

## Success Criteria

### Automated Verification:
- [ ] `pnpm build`: Build passes without errors
- [ ] `pnpm lint`: No ESLint errors
- [ ] `pnpm typecheck`: No TypeScript errors

### Manual Verification:
- [ ] Logo displays consistently as "Or**i**on" with gold "i"
- [ ] Sidebar collapse/expand works with smooth animation
- [ ] Canvas panel slides in/out correctly
- [ ] Gold slide button effect works on hover
- [ ] Fonts render correctly (Inter + Playfair Display)
- [ ] All pages match HTML mockup styling
- [ ] Keyboard shortcuts work (Cmd+/, Cmd+K, Esc)

---

## Out of Scope
- **TipTap Integration**: Rich text editing deferred to separate task
- **Authentication Logic**: Actual auth flow (just UI for now)
- **API Integration**: Backend connections
- **Data Persistence**: Database integration
- **Onboarding Flow**: Steps 4-5 (lower priority)
- **Marketing Pages**: Pricing, landing pages

---

## Component Mapping Summary

| HTML Design | React Component | Priority |
|-------------|-----------------|----------|
| Gold Slide Button | `LuxuryButton` | High |
| Editorial Input | `LuxuryInput` | High |
| Logo | `OrionLogo` | High |
| Global Header | `GlobalHeader` | High |
| Sidebar | `AppSidebar` (refactor) | High |
| Canvas Panel | `CanvasPanel` (refactor) | High |
| Chat Message | `UserMessage`, `AgentMessage` | High |
| A2UI Widgets | `A2UIRadioGroup`, `A2UISelect` | High |
| Email Composer | `EmailComposer` | Medium |
| Document Editor | `DocumentEditor` | Medium |
| Inbox Item | `InboxItem` | Medium |
| Project Card | `ProjectCard` | Medium |
| Calendar Grid | `CalendarWeekView` | Medium |

---

## Route Structure

```
/ (redirect to /dashboard)
├── auth/
│   ├── signin
│   └── signup
├── (app)/ (protected, with sidebar)
│   ├── dashboard (01-executive-dashboard)
│   ├── chat (06-agent-workspace)
│   │   └── [id] (23-chat-project-discussion)
│   ├── inbox (07-inbox-daily-view)
│   ├── calendar (19-calendar-week-view)
│   ├── projects (08-project-portfolio)
│   │   └── [id] (09-project-detail)
│   ├── areas (10-areas-hub)
│   │   └── [id] (17-area-detail)
│   ├── contacts (14-contacts-list)
│   │   └── [id] (15-contact-detail)
│   ├── knowledge (11-knowledge-archive)
│   ├── directives (18-global-directives)
│   ├── notifications (20-notifications-center)
│   └── settings (12-settings-hub)
│       └── billing (13-billing-plans)
├── onboarding/ (04-05, separate flow)
└── pricing (21, marketing)
```

---

## Estimated Effort by Phase

| Phase | Tasks | Files | Complexity |
|-------|-------|-------|------------|
| 1. Design System | 3 | 3 | Low |
| 2. Primitives | 4 | 4 | Medium |
| 3. Layout | 4 | 4 | Medium |
| 4. Canvas | 3 | 3 | Medium |
| 5. Chat | 4 | 6 | High |
| 6. Pages | 5 | 5 | High |
| 7. Auth | 3 | 3 | Low |
| 8. State | 2 | 2 | Low |
| 9. Branding Fix | 3 | 0 | Low |

**Total: 31 tasks across 9 phases**
