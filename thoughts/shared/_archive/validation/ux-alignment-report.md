# UX Specification Alignment Report

**Generated:** 2026-01-15  
**Validator:** Scout Agent (Sonnet 4.5)  
**Stories Analyzed:** 14  
**UX Spec:** `thoughts/planning-artifacts/ux-design-specification.md`

---

## Executive Summary

| Metric | Count | %  |
|--------|-------|----|
| **Stories Validated** | 14 | 100% |
| **UX Compliant** | 11 | 79% |
| **Partial Compliance** | 3 | 21% |
| **Non-Compliant** | 0 | 0% |
| **Critical Gaps** | 2 | - |

### Overall Assessment

**PASS with MINOR GAPS** - The stories demonstrate strong UX alignment with the design specification. Most critical requirements are present in story acceptance criteria and implementation guidance. Two critical gaps identified require attention before implementation.

---

## UX Requirements Matrix

### Core Visual Tokens

| UX Ref | Requirement | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 1-6 | 1-7 | 1-8 | 1-9 | 1-10 | 1-11 | 2-1 | 2-2 | 2-2b |
|--------|-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|------|-----|-----|------|
| **Zero Border Radius** | All corners sharp (0px) | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | ✓ | ✓ | N/A | N/A | N/A |
| **Color: Gold** | #D4AF37 for CTAs, accents | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | ✓ | ✓ | N/A | N/A | N/A |
| **Color: Cream** | #F9F8F6 for backgrounds | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | ✓ | ✓ | N/A | N/A | N/A |
| **Color: Black** | #1A1A1A for text/borders | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | ✓ | ✓ | N/A | N/A | N/A |
| **Font: Playfair** | Headlines, quotes, emphasis | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Font: Inter** | Body text, UI labels | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | ✓ | N/A | N/A | N/A |
| **Font Preloading** | Google Fonts preconnect | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

### Layout Dimensions

| UX Ref | Requirement | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 1-6 | 1-7 | 1-8 | 1-9 | 1-10 | 1-11 | 2-1 | 2-2 | 2-2b |
|--------|-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|------|-----|-----|------|
| **Header Height** | 80px fixed | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Sidebar Width** | 280px expanded | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Sidebar Collapsed** | 72px icon-only | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Agent Rail** | 64px width | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Content Max Width** | 850px for main content | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Chat/Canvas Split** | 35% / 65% ratio | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |

### Animations & Interactions

| UX Ref | Requirement | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 1-6 | 1-7 | 1-8 | 1-9 | 1-10 | 1-11 | 2-1 | 2-2 | 2-2b |
|--------|-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|------|-----|-----|------|
| **Canvas Animation** | 600ms cubic-bezier slide | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Luxury Easing** | cubic-bezier(0.25, 0.46, 0.45, 0.94) | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A | ✓ | ✓ | N/A | N/A | N/A | N/A |
| **Canvas Width** | 50% default, 70% expanded | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A | N/A |
| **Tool Card Expand** | 300ms smooth expand/collapse | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ✓ | N/A | N/A | N/A | N/A |

### User Flows

| Flow | Requirement | Story Coverage | Status |
|------|-------------|----------------|--------|
| **Flow 1: Inbox Triage** | Keyboard shortcuts (j/k, a, r) | 1-11 | ✓ Partial |
| **Flow 2: Canvas Handoff** | 600ms slide-in, 50% width | 1-9 | ✓ Complete |
| **Flow 3: Project Context** | Not in Epic 1 | N/A | N/A |
| **Flow 4: Onboarding** | Not in Epic 1 | N/A | N/A |
| **Flow 5: Memory Recall** | Not in Epic 1 | N/A | N/A |

### Multi-Chat Architecture

| Requirement | Story Coverage | Status |
|-------------|----------------|--------|
| **Chat Status Indicators** | ● ○ ✓ ⚠ | 1-6, 1-10 | ✓ Partial |
| **Multiple Parallel Chats** | Sidebar chat list | 1-6 | ✓ Partial |
| **Context Preservation** | Message storage + restoration | 1-6 | ✓ Complete |
| **Background Processing** | Agent server continues in bg | 1-5 | ✓ Complete |

### Emotional Design

| Principle | Story Coverage | Status |
|-----------|----------------|--------|
| **Trust Through Transparency** | Tool card visualization | 1-10 | ✓ Complete |
| **Graceful Uncertainty** | Error states in tool cards | 1-10 | ✓ Complete |
| **Calm Notifications** | Not in Epic 1 | N/A | N/A |
| **Zero Inbox Celebration** | Not in Epic 1 | N/A | N/A |

---

## Findings by Severity

### 🔴 Critical

**C1: Inbox Triage Keyboard Shortcuts Incomplete**
- **Issue:** Story 1-11 implements global shortcuts (Cmd+K, Cmd+N) but **missing** inbox-specific j/k navigation, a/r/s actions from Flow 1
- **UX Spec Reference:** Flow 1 states "j/k navigate, a=archive, r=reply" as core triage pattern
- **Impact:** HIGH - Power users expect these shortcuts for fast inbox processing
- **Story:** 1-11
- **Recommendation:** Add AC for inbox-specific shortcuts or create new story for triage controls

**C2: Missing Emotional Design Moments**
- **Issue:** Zero inbox celebration, subtle gold shimmer, "All clear" moment not in any story
- **UX Spec Reference:** "Zero Inbox Moment" in Opportunities section, "All clear" in Playfair italic
- **Impact:** MEDIUM - These moments build emotional connection and trust
- **Story:** None (gap)
- **Recommendation:** Add to Story 1-6 (Chat Message Storage) or create micro-story for celebrations

### 🟡 High

**H1: Canvas Placeholder Design Partially Specified**
- **Issue:** Story 1-9 includes placeholder but doesn't explicitly reference UX spec design details
- **UX Spec Reference:** Empty state should use Playfair Display italic, gold accent line, specific messaging
- **Impact:** MEDIUM - Affects first impression and onboarding
- **Story:** 1-9
- **Fix:** Story 1-9 Task 6 DOES include gold accent and Playfair italic ✓ (verified on review)

**H2: Tool Card Design System Compliance Not Fully Tested**
- **Issue:** Story 1-10 AC8 states "follows Orion Design System" but lacks specific visual regression test for sharp corners, gold accents
- **UX Spec Reference:** Component should have 0 radius, gold left border, editorial tracking
- **Impact:** MEDIUM - Risk of inconsistent visual identity
- **Story:** 1-10
- **Recommendation:** Add explicit visual regression test in Task 8 covering all design tokens

**H3: Quick Action Chip Design Partial Match**
- **Issue:** Story 1-11 specifies "sharp corners, gold border on hover, cream bg" but UX spec also requires tracking-editorial for labels
- **UX Spec Reference:** "tracking-editorial: 0.25em letter-spacing for labels"
- **Impact:** LOW - Minor typography consistency
- **Story:** 1-11
- **Recommendation:** Add `tracking-editorial` class to chip label in implementation

### 🟢 Medium

**M1: Relative Time Formatting Not Specified**
- **Issue:** Story 1-6 AC4 requires "relative format ('2 hours ago')" but doesn't reference UX spec's specific ranges
- **UX Spec Reference:** UX spec doesn't explicitly define time formatting
- **Impact:** LOW - Functional requirement met, just not UX-specified
- **Story:** 1-6
- **Status:** Acceptable - Story provides implementation in Task 10

**M2: Message Bubble Role Styling Not Detailed**
- **Issue:** Story 1-6 mentions MessageBubble component but doesn't specify UX patterns for user vs agent styling
- **UX Spec Reference:** User = black bg, cream text, right-aligned; Agent = cream bg, gold left border, left-aligned
- **Impact:** MEDIUM - Core visual distinction for chat roles
- **Story:** 1-6
- **Recommendation:** Add AC for message role styling or reference Story 1-3 design system classes

**M3: Command Palette Visual Design Not Fully Specified**
- **Issue:** Story 1-11 covers functionality but lacks explicit UX design requirements for palette appearance
- **UX Spec Reference:** Palette should use Orion tokens (cream bg, sharp corners, gold focus ring, 560px max width)
- **Impact:** MEDIUM - Risk of visual inconsistency
- **Story:** 1-11
- **Recommendation:** Add design tokens section referencing UX spec dimensions and colors

---

## Story-by-Story Analysis

### ✅ Story 1-1: Tauri Desktop Shell
**UX Impact:** LOW - Infrastructure only  
**UX References:** None  
**Status:** N/A (no UX requirements)

---

### ✅ Story 1-2: Next.js Frontend Integration
**UX Impact:** LOW - Framework setup  
**UX References:** None  
**Status:** N/A (no UX requirements)

---

### ✅ Story 1-3: Design System Foundation ⭐
**UX Impact:** CRITICAL - Foundation for all visual design  
**UX References:** Typography, Colors, Layout, Border Radius, Animations  
**Status:** EXCELLENT ✓

**Strengths:**
- ✓ All core tokens explicitly defined (AC2, AC3, AC4)
- ✓ Zero border radius enforced via CSS variable override (AC3)
- ✓ Font preloading with Google Fonts (AC1, Task 1)
- ✓ Layout dimensions match UX spec exactly (80px header, 280px sidebar, 64px rail)
- ✓ Accessibility contrast ratios verified (AC7, Task 7)
- ✓ shadcn/ui integration with Orion overrides (AC5)

**Concerns:**
- ⚠️ AC7 tests gold on cream contrast but UX spec states gold should only be decorative (not text)
- ✓ Story addresses this: "Gold text acceptable only on black backgrounds (5.9:1)"

**Verification:**
- Task 7 explicitly tests contrast ratios
- Task 9 creates visual regression baseline
- Dev Notes section references UX spec sections correctly

**Verdict:** FULLY COMPLIANT ✓

---

### ✅ Story 1-4: SQLite Database Setup
**UX Impact:** None (backend data layer)  
**UX References:** None  
**Status:** N/A

---

### ✅ Story 1-5: Agent Server Process
**UX Impact:** Indirect (enables background processing for multi-chat)  
**UX References:** Multi-Chat Architecture  
**Status:** COMPLIANT ✓

**Multi-Chat Support:**
- ✓ Story enables parallel task processing
- ✓ Supports background execution while user switches chats
- ✓ Aligns with "Parallel by Default" experience principle

---

### ✅ Story 1-6: Chat Message Storage
**UX Impact:** HIGH - Enables conversation continuity and context preservation  
**UX References:** Multi-Chat Architecture, Context Preservation  
**Status:** PARTIAL COMPLIANCE ⚠️

**Strengths:**
- ✓ Message persistence (AC1, AC2) enables "Continuity is Sacred" principle
- ✓ Conversation history restoration (AC2) matches UX requirement
- ✓ Timestamps with relative formatting (AC4) - "2 hours ago"
- ✓ Conversation list sorted by last_message_at (AC8)
- ✓ Chat status tracking for tool calls (AC7)

**Gaps:**
- ⚠️ Missing explicit reference to message bubble role styling (user vs agent)
  - UX Spec: User = black bg, right-aligned; Agent = gold left border, left-aligned
  - Story mentions MessageBubble component (Task 7) but no styling AC
- ⚠️ Missing chat status indicators (●○✓⚠) visualization
  - UX Spec defines status colors and meanings
  - Story stores status but no AC for UI representation
- ✓ Title auto-generation (AC3) aligns with UX flow

**Recommendations:**
1. Add AC for message bubble styling per UX spec role patterns
2. Cross-reference Story 1-10 for tool status visualization
3. Add visual regression test for chat message appearance

**Verdict:** PARTIAL COMPLIANCE - Functional requirements met, visual requirements missing

---

### ✅ Story 1-7: Claude Integration
**UX Impact:** None (API integration layer)  
**UX References:** None  
**Status:** N/A

---

### ✅ Story 1-8: Streaming Responses
**UX Impact:** HIGH - Enables real-time feedback and tool event tracking  
**UX References:** Tool Call Visualization, Multi-Chat Architecture  
**Status:** COMPLIANT ✓

**Strengths:**
- ✓ Stream events include tool_start, tool_complete, tool_error (enables Story 1-10)
- ✓ Supports suggested_actions event type (enables Story 1-11 quick actions)
- ✓ Real-time streaming aligns with "notify, don't nag" principle

---

### ✅ Story 1-9: Split-Screen Layout ⭐
**UX Impact:** CRITICAL - Core visual structure and canvas interaction  
**UX References:** Layout Architecture, Canvas Handoff, Animations  
**Status:** EXCELLENT ✓

**Strengths:**
- ✓ 35% / 65% chat/canvas split explicitly defined (AC1, AC8)
- ✓ Canvas animation: 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) (AC5)
- ✓ All layout dimensions match UX spec (AC2):
  - Header: 80px
  - Sidebar: 280px (72px collapsed)
  - Agent Rail: 64px
- ✓ Canvas slide-in animation (AC5) matches Flow 2 specification
- ✓ Responsive breakpoints (AC6, AC7):
  - <1000px: canvas collapses
  - <800px: sidebar collapses to icons
- ✓ Keyboard shortcuts (AC9): Cmd+\ toggle, Esc close
- ✓ Canvas placeholder (AC3) uses Playfair italic and gold accent (Task 6)
- ✓ Design system compliance (AC2) - uses all Orion tokens

**Verification:**
- Task 14: Visual regression tests panel proportions (35/65 +/- 2%)
- Task 14: Tests responsive behavior at breakpoints
- Task 8: Canvas state persists via zustand
- Task 2: Exact animation specs in code (ANIMATION_DURATION = 0.6, CANVAS_EASING)

**Minor Notes:**
- ⚠️ AC10 (resize handle) is "Stretch Goal" - may not be implemented
- ✓ Story provides fallback: fixed proportions with toggle (acceptable)

**Verdict:** FULLY COMPLIANT ✓

---

### ✅ Story 1-10: Tool Call Visualization ⭐
**UX Impact:** HIGH - Builds trust through transparency  
**UX References:** Emotional Design (Trust Through Transparency)  
**Status:** EXCELLENT ✓

**Strengths:**
- ✓ Tool cards show running status with animated spinner (AC1)
- ✓ Expand/collapse with 300ms ease (AC3)
- ✓ Error states with red styling (AC5)
- ✓ Multiple tools stack correctly (AC6)
- ✓ XSS protection via escapeHtml (AC7)
- ✓ Design system compliance (AC8):
  - Sharp corners (no border-radius)
  - Gold accent for running state
  - Monospace font for JSON
  - Editorial tracking for labels
- ✓ Accessibility (AC9): keyboard navigation, aria-expanded
- ✓ Aligns with "Graceful Uncertainty" principle - shows what AI is doing

**Verification:**
- Task 7: Comprehensive XSS tests with malicious payloads
- Task 8: Visual regression for collapsed/expanded states
- Task 1: Uses Orion design tokens (border-orion-fg/10, bg-orion-bg/50, text-orion-primary)

**Minor Gap:**
- ⚠️ AC8 states "follows Orion Design System" but could be more explicit
  - Recommendation: Add visual regression test checking sharp corners specifically

**Verdict:** FULLY COMPLIANT ✓

---

### ✅ Story 1-11: Quick Actions & Keyboard Shortcuts
**UX Impact:** HIGH - Power user productivity and efficiency  
**UX References:** Keyboard Patterns, Flow 1 (Inbox Triage), Command Palette  
**Status:** PARTIAL COMPLIANCE ⚠️

**Strengths:**
- ✓ Cmd+Enter sends message (AC1)
- ✓ Cmd+K command palette (AC2)
- ✓ Quick action chips after response (AC3)
- ✓ Command palette real-time filtering <50ms (AC4)
- ✓ Keyboard navigation (arrows, Enter, Escape) (AC5)
- ✓ Global shortcuts (Cmd+/, Cmd+N, ?) (AC6)
- ✓ Keyboard hints visible (AC7)
- ✓ Accessibility compliance (AC8)
- ✓ Chip design: sharp corners, gold border on hover, cream bg (AC9)
- ✓ No browser shortcut conflicts (AC10)

**Gaps:**
- 🔴 **CRITICAL:** Missing inbox triage shortcuts from Flow 1:
  - UX Spec: "j/k navigate, a=archive, r=reply, s=schedule"
  - Story: Only implements global shortcuts (Cmd+K, Cmd+N, Cmd+/, ?)
  - Impact: Power users expect these for fast inbox processing
  - Table in Dev Notes shows "Chat Shortcuts" (j/k/a/r/s) but no AC or task for implementation
- ⚠️ Quick action chip design missing `tracking-editorial` class
  - UX Spec: Labels should use 0.25em letter-spacing
  - Story: Specifies Inter 13px but no tracking mention
- ⚠️ Command palette design not fully specified
  - UX Spec: 560px max width, cream bg, sharp corners, gold focus ring
  - Story: Covers functionality but lacks explicit design token references

**Recommendations:**
1. Add AC for inbox triage shortcuts (j/k/a/r/s) or clarify if deferred to later epic
2. Add `tracking-editorial` to chip label styling
3. Add design tokens section for command palette appearance

**Verdict:** PARTIAL COMPLIANCE - Core functionality present, missing inbox-specific shortcuts

---

### ✅ Story 2-1: Butler Agent Core
**UX Impact:** None (backend agent logic)  
**UX References:** None  
**Status:** N/A

---

### ✅ Story 2-2: Agent Prompt Templates
**UX Impact:** None (backend prompt engineering)  
**UX References:** None  
**Status:** N/A

---

### ✅ Story 2-2b: Hooks Integration
**UX Impact:** None (backend integration)  
**UX References:** None  
**Status:** N/A

---

## Summary of Compliance

### By Story Priority

| Story | Priority | UX Impact | Compliance | Notes |
|-------|----------|-----------|------------|-------|
| 1-3 | HIGH | CRITICAL | ✓ FULL | Design system foundation - excellent |
| 1-9 | HIGH | CRITICAL | ✓ FULL | Split-screen layout - excellent |
| 1-10 | HIGH | HIGH | ✓ FULL | Tool visualization - excellent |
| 1-6 | HIGH | HIGH | ⚠️ PARTIAL | Missing visual styling ACs |
| 1-11 | MEDIUM | HIGH | ⚠️ PARTIAL | Missing inbox shortcuts |
| 1-5 | MEDIUM | MEDIUM | ✓ FULL | Enables multi-chat |
| 1-8 | MEDIUM | HIGH | ✓ FULL | Streaming infrastructure |
| 1-1, 1-2, 1-4, 1-7 | - | LOW | N/A | Infrastructure only |
| 2-1, 2-2, 2-2b | - | NONE | N/A | Backend only |

### UX Requirements Coverage

| Category | Total Refs | Covered | Partial | Missing |
|----------|-----------|---------|---------|---------|
| **Visual Tokens** | 7 | 7 | 0 | 0 |
| **Layout Dimensions** | 6 | 6 | 0 | 0 |
| **Animations** | 4 | 4 | 0 | 0 |
| **Keyboard Shortcuts** | 12 | 6 | 6 | 0 |
| **Multi-Chat** | 4 | 3 | 1 | 0 |
| **Emotional Design** | 4 | 2 | 0 | 2 |

---

## Recommendations

### Immediate Action Required (Before Dev Starts)

1. **Story 1-11:** Add AC for inbox triage shortcuts (j/k/a/r/s) or explicitly defer to Epic 2
2. **Story 1-6:** Add AC for message bubble role styling (user vs agent visual patterns)
3. **Story 1-11:** Add design tokens section for command palette and quick action chips

### Nice-to-Have Improvements

1. **Story 1-10:** Add explicit visual regression test for sharp corners on tool cards
2. **Story 1-6:** Add visual regression test for chat message appearance
3. **Story 1-11:** Add `tracking-editorial` class to chip label implementation
4. **All Stories:** Consider adding "Zero Inbox Celebration" as micro-story or to Story 1-6

### Documentation Updates

1. Add cross-references between stories for shared UX patterns:
   - Story 1-6 ← Story 1-3 (message bubble styling)
   - Story 1-10 ← Story 1-3 (tool card design tokens)
   - Story 1-11 ← Story 1-3 (chip and palette design)

2. Create "UX Pattern Library" document mapping:
   - UX Spec section → Story implementation
   - Design tokens → Component usage
   - Keyboard shortcuts → Story coverage

---

## Gate Criteria for Epic 1

Before marking Epic 1 complete, verify:

- [ ] All visual regression tests pass for Stories 1-3, 1-9, 1-10, 1-11
- [ ] Accessibility audit passes (WCAG AA minimum)
- [ ] Animation timings verified (600ms canvas, 300ms tool card)
- [ ] Design tokens verified in production build
- [ ] Keyboard shortcuts functional (global + canvas)
- [ ] Inbox triage shortcuts decision documented (implement or defer)
- [ ] Zero inbox celebration decision documented (implement or defer)

---

## Appendix: UX Spec Reference Mapping

### Core Visual Tokens → Stories
- Border Radius (0px): 1-3 (AC3)
- Gold (#D4AF37): 1-3 (AC2)
- Cream (#F9F8F6): 1-3 (AC2)
- Black (#1A1A1A): 1-3 (AC2)
- Playfair Display: 1-3 (AC1), 1-9 (Task 6)
- Inter: 1-3 (AC1), 1-11 (AC9)

### Layout Dimensions → Stories
- Header (80px): 1-3 (AC4), 1-9 (AC2)
- Sidebar (280px): 1-3 (AC4), 1-9 (AC2)
- Sidebar Collapsed (72px): 1-9 (AC7)
- Agent Rail (64px): 1-3 (AC4), 1-9 (AC2)
- Chat/Canvas Split (35/65): 1-9 (AC1, AC8)

### Animations → Stories
- Canvas Slide (600ms cubic-bezier): 1-9 (AC5, Task 2)
- Tool Card Expand (300ms): 1-10 (AC3, Task 1)
- Luxury Easing: 1-3 (design system), 1-9 (AC5)

### Keyboard Shortcuts → Stories
- Global (Cmd+K, Cmd+N, Cmd+/): 1-11 (AC6)
- Chat Input (Cmd+Enter): 1-11 (AC1)
- Canvas (Esc): 1-9 (AC9)
- Inbox Triage (j/k/a/r/s): ⚠️ MISSING in 1-11

### User Flows → Stories
- Flow 2 (Canvas Handoff): 1-9 (complete)
- Flow 1 (Inbox Triage): 1-11 (partial - missing shortcuts)
- Flow 3, 4, 5: Not in Epic 1

---

**Report End**

**Next Steps:**
1. Review critical gaps with PM/UX
2. Update Story 1-11 with inbox shortcuts decision
3. Update Story 1-6 with visual styling ACs
4. Proceed to implementation

