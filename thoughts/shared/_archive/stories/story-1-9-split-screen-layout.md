# Story 1.9: Split-Screen Layout

Status: done

---

## Story

As a user,
I want a split-screen with chat on one side and a canvas on the other,
So that I can converse with Orion while viewing rich content.

---

## Acceptance Criteria

1. **AC1: Default Panel Layout**
   - **Given** the app is open
   - **When** I view the main interface
   - **Then** the layout shows Chat panel (35%) + Canvas panel (65%) (FR-CH001)
   - **And** the sidebar (280px) is on the left
   - **And** the agent rail (64px) is visible on the right edge
   - **And** the header (80px) is fixed at the top

2. **AC2: Design System Layout Tokens**
   - **Given** the layout renders
   - **When** inspecting the DOM
   - **Then** the sidebar uses `w-sidebar` (280px) from Orion Design System (UX-005)
   - **And** the agent rail uses `w-rail` (64px)
   - **And** the header uses `h-header` (80px)
   - **And** the content area uses `max-w-content` (850px) for main content

3. **AC3: Empty Canvas State**
   - **Given** the canvas is empty
   - **When** no content is displayed
   - **Then** a helpful placeholder/welcome message appears
   - **And** the placeholder uses Playfair Display italic for elegance
   - **And** the message includes subtle gold (#D4AF37) accent

4. **AC4: Canvas Collapse/Expand**
   - **Given** the canvas is visible
   - **When** I collapse the canvas (via button or keyboard)
   - **Then** the chat panel expands to full width (minus sidebar/rail)
   - **And** the canvas slides out with 600ms cubic-bezier ease (UX-008)
   - **And** a collapse indicator/button remains visible to re-expand

5. **AC5: Canvas Expand Animation**
   - **Given** the canvas is collapsed
   - **When** I click to expand or trigger canvas content
   - **Then** the canvas slides in from the right at 50% width
   - **And** the animation uses 600ms `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (UX-008)
   - **And** the chat panel smoothly adjusts to 35% width

6. **AC6: Responsive Behavior - 1000px Breakpoint**
   - **Given** I resize the window
   - **When** the window is narrower than 1000px
   - **Then** the layout gracefully adapts
   - **And** the canvas collapses automatically OR switches to tabs
   - **And** no horizontal overflow occurs

7. **AC7: Responsive Behavior - 800px Breakpoint**
   - **Given** I resize the window
   - **When** the window is narrower than 800px
   - **Then** the sidebar collapses to icon-only mode (72px)
   - **And** the canvas is hidden entirely (chat-only mode)
   - **And** the layout remains fully functional

8. **AC8: Panel Proportions Accuracy**
   - **Given** the app is at standard desktop width (1440px+)
   - **When** measuring panel widths
   - **Then** Chat panel is 35% of content area (+/- 2%)
   - **And** Canvas panel is 65% of content area (+/- 2%)
   - **And** proportions are calculated after subtracting sidebar/rail

9. **AC9: Keyboard Navigation**
   - **Given** I'm using the app
   - **When** I press Cmd+\ or designated shortcut
   - **Then** the canvas toggles between collapsed/expanded
   - **And** focus management is correct (no focus trap issues)
   - **And** Esc key closes canvas if expanded

10. **AC10: Panel Resize Handle (Stretch Goal)**
    - **Given** the split-screen is visible
    - **When** I hover over the divider between chat and canvas
    - **Then** a resize cursor appears
    - **And** I can drag to adjust proportions (min 25%, max 75% each)
    - **And** proportions persist in user preferences

---

## Tasks / Subtasks

- [x] **Task 1: Create Layout Shell Component** (AC: 1, 2)
  - [x] 1.1 Create `src/components/layout/AppLayout.tsx`:
    ```typescript
    // src/components/layout/AppLayout.tsx

    'use client';

    import { ReactNode } from 'react';
    import { Header } from './Header';
    import { Sidebar } from './Sidebar';
    import { AgentRail } from './AgentRail';
    import { cn } from '@/lib/utils';

    interface AppLayoutProps {
      children: ReactNode;
    }

    export function AppLayout({ children }: AppLayoutProps) {
      return (
        <div className="h-screen flex flex-col bg-orion-bg overflow-hidden">
          {/* Fixed Header */}
          <Header className="h-header flex-shrink-0" />

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar className="w-sidebar flex-shrink-0" />

            {/* Main Content (Chat + Canvas) */}
            <main className="flex-1 overflow-hidden">
              {children}
            </main>

            {/* Agent Rail */}
            <AgentRail className="w-rail flex-shrink-0" />
          </div>
        </div>
      );
    }
    ```
  - [x] 1.2 Implement fixed dimensions from design system
  - [x] 1.3 Add overflow handling for nested scrolling

- [x] **Task 2: Create Split Panel Container** (AC: 1, 8)
  - [x] 2.1 Create `src/components/layout/SplitPanel.tsx`:
    ```typescript
    // src/components/layout/SplitPanel.tsx

    'use client';

    import { ReactNode, useState, useCallback } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { cn } from '@/lib/utils';

    interface SplitPanelProps {
      chatContent: ReactNode;
      canvasContent?: ReactNode;
      defaultCanvasOpen?: boolean;
    }

    const ANIMATION_DURATION = 0.6;
    const CANVAS_EASING = [0.25, 0.46, 0.45, 0.94];

    export function SplitPanel({
      chatContent,
      canvasContent,
      defaultCanvasOpen = true,
    }: SplitPanelProps) {
      const [isCanvasOpen, setIsCanvasOpen] = useState(defaultCanvasOpen);

      const toggleCanvas = useCallback(() => {
        setIsCanvasOpen((prev) => !prev);
      }, []);

      return (
        <div className="flex h-full w-full relative">
          {/* Chat Panel */}
          <motion.div
            className="h-full overflow-hidden"
            animate={{
              width: isCanvasOpen ? '35%' : '100%',
            }}
            transition={{
              duration: ANIMATION_DURATION,
              ease: CANVAS_EASING,
            }}
          >
            {chatContent}
          </motion.div>

          {/* Divider / Toggle */}
          <button
            onClick={toggleCanvas}
            className={cn(
              'w-1 h-full bg-orion-fg/10 hover:bg-orion-primary/50',
              'cursor-col-resize transition-colors',
              'flex-shrink-0'
            )}
            aria-label={isCanvasOpen ? 'Collapse canvas' : 'Expand canvas'}
          />

          {/* Canvas Panel */}
          <AnimatePresence mode="wait">
            {isCanvasOpen && (
              <motion.div
                className="h-full overflow-hidden"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '65%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  duration: ANIMATION_DURATION,
                  ease: CANVAS_EASING,
                }}
              >
                {canvasContent}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    ```
  - [x] 2.2 Implement 35/65 split ratio
  - [x] 2.3 Add framer-motion animations with design system easing
  - [x] 2.4 Include divider button for toggle

- [x] **Task 3: Create Header Component** (AC: 1, 2)
  - [x] 3.1 Create `src/components/layout/Header.tsx`:
    ```typescript
    // src/components/layout/Header.tsx

    'use client';

    import { cn } from '@/lib/utils';
    import { Search, Bell, Settings } from 'lucide-react';

    interface HeaderProps {
      className?: string;
    }

    export function Header({ className }: HeaderProps) {
      return (
        <header
          className={cn(
            'bg-orion-bg border-b border-orion-fg/10',
            'px-6 flex items-center justify-between',
            className
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orion-primary flex items-center justify-center">
              <span className="text-orion-fg font-serif font-semibold text-lg">O</span>
            </div>
            <span className="font-serif text-xl text-orion-fg">Orion</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orion-fg/40" />
              <input
                type="text"
                placeholder="Search..."
                className={cn(
                  'w-full pl-10 pr-4 py-2',
                  'bg-transparent border-b border-orion-fg/20',
                  'text-orion-fg placeholder:text-orion-fg/40',
                  'focus:border-orion-primary focus:outline-none',
                  'font-serif italic text-sm'
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-orion-fg/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-orion-fg/60" />
            </button>
            <button
              className="p-2 hover:bg-orion-fg/5 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-orion-fg/60" />
            </button>
            {/* User Avatar */}
            <div className="w-8 h-8 bg-orion-fg rounded-none overflow-hidden">
              <div className="w-full h-full bg-orion-primary/20" />
            </div>
          </div>
        </header>
      );
    }
    ```
  - [x] 3.2 Implement logo with Orion branding
  - [x] 3.3 Add search input with editorial styling
  - [x] 3.4 Include notification and settings icons

- [x] **Task 4: Create Sidebar Component** (AC: 1, 2, 7)
  - [x] 4.1 Create `src/components/layout/Sidebar.tsx`:
    ```typescript
    // src/components/layout/Sidebar.tsx

    'use client';

    import { useState } from 'react';
    import { cn } from '@/lib/utils';
    import {
      Inbox,
      Calendar,
      FolderKanban,
      Users,
      Archive,
      ChevronLeft,
      ChevronRight,
    } from 'lucide-react';
    import { useMediaQuery } from '@/hooks/useMediaQuery';

    interface SidebarProps {
      className?: string;
    }

    const navItems = [
      { icon: Inbox, label: 'Inbox', href: '/inbox', badge: 3 },
      { icon: Calendar, label: 'Calendar', href: '/calendar' },
      { icon: FolderKanban, label: 'Projects', href: '/projects' },
      { icon: Users, label: 'Contacts', href: '/contacts' },
      { icon: Archive, label: 'Archive', href: '/archive' },
    ];

    export function Sidebar({ className }: SidebarProps) {
      const isMobile = useMediaQuery('(max-width: 800px)');
      const [isCollapsed, setIsCollapsed] = useState(isMobile);

      // Auto-collapse on mobile
      const effectiveCollapsed = isMobile || isCollapsed;

      return (
        <aside
          className={cn(
            'bg-orion-bg border-r border-orion-fg/10',
            'flex flex-col transition-all duration-300',
            effectiveCollapsed ? 'w-[72px]' : 'w-sidebar',
            className
          )}
        >
          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5',
                      'text-orion-fg/70 hover:text-orion-fg',
                      'hover:bg-orion-fg/5 transition-colors',
                      'group relative'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!effectiveCollapsed && (
                      <span className="text-sm tracking-wide">{item.label}</span>
                    )}
                    {item.badge && (
                      <span
                        className={cn(
                          'bg-orion-primary text-orion-fg text-xs px-1.5 py-0.5',
                          effectiveCollapsed
                            ? 'absolute -top-1 -right-1 min-w-[18px] text-center'
                            : 'ml-auto'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collapse Toggle (desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'mx-2 mb-4 p-2 border border-orion-fg/10',
                'hover:bg-orion-fg/5 transition-colors',
                'flex items-center justify-center'
              )}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-orion-fg/60" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-orion-fg/60" />
              )}
            </button>
          )}
        </aside>
      );
    }
    ```
  - [x] 4.2 Implement navigation items with icons
  - [x] 4.3 Add collapse/expand behavior
  - [x] 4.4 Handle responsive collapse at 800px

- [x] **Task 5: Create Agent Rail Component** (AC: 1, 2)
  - [x] 5.1 Create `src/components/layout/AgentRail.tsx`:
    ```typescript
    // src/components/layout/AgentRail.tsx

    'use client';

    import { cn } from '@/lib/utils';
    import { Sparkles, MessageCircle, Plus } from 'lucide-react';

    interface AgentRailProps {
      className?: string;
    }

    export function AgentRail({ className }: AgentRailProps) {
      return (
        <aside
          className={cn(
            'bg-orion-bg border-l border-orion-fg/10',
            'flex flex-col items-center py-4 gap-4',
            className
          )}
        >
          {/* New Chat Button */}
          <button
            className={cn(
              'w-10 h-10 bg-orion-primary',
              'flex items-center justify-center',
              'hover:bg-orion-primary/80 transition-colors',
              'group'
            )}
            aria-label="New chat"
          >
            <Plus className="w-5 h-5 text-orion-fg" />
          </button>

          {/* Active Agent Indicator */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'w-10 h-10 border border-orion-primary',
                'flex items-center justify-center',
                'bg-orion-primary/10'
              )}
              title="Orion Butler"
            >
              <Sparkles className="w-5 h-5 text-orion-primary" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-orion-fg/40">
              Active
            </span>
          </div>

          {/* Recent Chats (collapsed) */}
          <div className="flex-1 flex flex-col items-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <button
                key={i}
                className={cn(
                  'w-8 h-8 border border-orion-fg/10',
                  'flex items-center justify-center',
                  'hover:border-orion-fg/30 transition-colors'
                )}
                aria-label={`Chat ${i}`}
              >
                <MessageCircle className="w-4 h-4 text-orion-fg/40" />
              </button>
            ))}
          </div>
        </aside>
      );
    }
    ```
  - [x] 5.2 Add gold sparkle indicator for active agent
  - [x] 5.3 Include new chat button
  - [x] 5.4 Show recent chats as collapsed indicators

- [x] **Task 6: Create Canvas Placeholder** (AC: 3)
  - [x] 6.1 Create `src/components/canvas/CanvasPlaceholder.tsx`:
    ```typescript
    // src/components/canvas/CanvasPlaceholder.tsx

    'use client';

    import { cn } from '@/lib/utils';
    import { Sparkles } from 'lucide-react';

    interface CanvasPlaceholderProps {
      className?: string;
    }

    export function CanvasPlaceholder({ className }: CanvasPlaceholderProps) {
      return (
        <div
          className={cn(
            'h-full flex flex-col items-center justify-center',
            'bg-orion-bg px-8',
            className
          )}
        >
          {/* Gold accent line */}
          <div className="w-16 h-0.5 bg-orion-primary mb-8" />

          {/* Welcome message */}
          <h2 className="font-serif italic text-3xl text-orion-fg/80 text-center mb-4">
            Your canvas awaits
          </h2>

          <p className="text-sm text-orion-fg/50 text-center max-w-xs mb-8">
            Start a conversation with Orion, and rich content will appear here.
            Schedule meetings, compose emails, view documents.
          </p>

          {/* Hint */}
          <div className="flex items-center gap-2 text-orion-fg/30">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs uppercase tracking-editorial">
              Try: "Schedule a meeting with John"
            </span>
          </div>
        </div>
      );
    }
    ```
  - [x] 6.2 Use Playfair Display italic for headline
  - [x] 6.3 Add gold accent decoration
  - [x] 6.4 Include helpful hint text

- [x] **Task 7: Create useMediaQuery Hook** (AC: 6, 7)
  - [x] 7.1 Create `src/hooks/useMediaQuery.ts`:
    ```typescript
    // src/hooks/useMediaQuery.ts

    import { useState, useEffect } from 'react';

    export function useMediaQuery(query: string): boolean {
      const [matches, setMatches] = useState(false);

      useEffect(() => {
        // Check if window is available (SSR safety)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create listener
        const handler = (event: MediaQueryListEvent) => {
          setMatches(event.matches);
        };

        // Add listener
        mediaQuery.addEventListener('change', handler);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', handler);
      }, [query]);

      return matches;
    }
    ```
  - [x] 7.2 Implement SSR-safe media query detection
  - [x] 7.3 Support dynamic breakpoint changes

- [x] **Task 8: Create useCanvasState Hook** (AC: 4, 5, 9)
  - [x] 8.1 Create `src/hooks/useCanvasState.ts`:
    ```typescript
    // src/hooks/useCanvasState.ts

    import { create } from 'zustand';
    import { persist } from 'zustand/middleware';

    interface CanvasState {
      isOpen: boolean;
      width: number; // Percentage (default 65)
      content: 'placeholder' | 'email' | 'calendar' | 'document' | 'json-render';

      // Actions
      toggle: () => void;
      open: () => void;
      close: () => void;
      setWidth: (width: number) => void;
      setContent: (content: CanvasState['content']) => void;
    }

    export const useCanvasState = create<CanvasState>()(
      persist(
        (set) => ({
          isOpen: true,
          width: 65,
          content: 'placeholder',

          toggle: () => set((state) => ({ isOpen: !state.isOpen })),
          open: () => set({ isOpen: true }),
          close: () => set({ isOpen: false }),
          setWidth: (width) => set({ width: Math.min(75, Math.max(25, width)) }),
          setContent: (content) => set({ content, isOpen: true }),
        }),
        {
          name: 'orion-canvas-state',
          partialize: (state) => ({ width: state.width }), // Only persist width
        }
      )
    );
    ```
  - [x] 8.2 Implement zustand store with persistence
  - [x] 8.3 Add width constraints (25-75%)
  - [x] 8.4 Track content type for mode switching

- [x] **Task 9: Implement Keyboard Shortcuts** (AC: 9)
  - [x] 9.1 Create `src/hooks/useLayoutShortcuts.ts`:
    ```typescript
    // src/hooks/useLayoutShortcuts.ts

    import { useEffect } from 'react';
    import { useCanvasState } from './useCanvasState';

    export function useLayoutShortcuts() {
      const { toggle, close, isOpen } = useCanvasState();

      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          // Cmd+\ to toggle canvas
          if (e.metaKey && e.key === '\\') {
            e.preventDefault();
            toggle();
          }

          // Esc to close canvas (only if open)
          if (e.key === 'Escape' && isOpen) {
            e.preventDefault();
            close();
          }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [toggle, close, isOpen]);
    }
    ```
  - [x] 9.2 Implement Cmd+\ toggle shortcut
  - [x] 9.3 Implement Esc to close canvas
  - [x] 9.4 Register shortcuts in layout component

- [x] **Task 10: Update Tailwind Config with Layout Tokens** (AC: 2)
  - [x] 10.1 Verify/add layout tokens in `tailwind.config.ts`:
    ```typescript
    // Ensure these exist in tailwind.config.ts

    module.exports = {
      theme: {
        extend: {
          width: {
            'sidebar': '280px',
            'sidebar-collapsed': '72px',
            'rail': '64px',
          },
          height: {
            'header': '80px',
          },
          maxWidth: {
            'content': '850px',
          },
          transitionTimingFunction: {
            'orion-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
          transitionDuration: {
            'canvas': '600ms',
          },
        },
      },
    };
    ```
  - [x] 10.2 Add width tokens for sidebar, rail
  - [x] 10.3 Add height token for header
  - [x] 10.4 Add custom easing function

- [x] **Task 11: Create Main Page Integration** (AC: 1)
  - [x] 11.1 Update `src/app/page.tsx`:
    ```typescript
    // src/app/page.tsx

    'use client';

    import { AppLayout } from '@/components/layout/AppLayout';
    import { SplitPanel } from '@/components/layout/SplitPanel';
    import { ChatContainer } from '@/components/chat/ChatContainer';
    import { CanvasContainer } from '@/components/canvas/CanvasContainer';
    import { useLayoutShortcuts } from '@/hooks/useLayoutShortcuts';

    export default function Home() {
      // Register layout keyboard shortcuts
      useLayoutShortcuts();

      return (
        <AppLayout>
          <SplitPanel
            chatContent={<ChatContainer />}
            canvasContent={<CanvasContainer />}
          />
        </AppLayout>
      );
    }
    ```
  - [x] 11.2 Integrate layout components
  - [x] 11.3 Connect chat and canvas containers

- [x] **Task 12: Create Canvas Container** (AC: 3, 4, 5)
  - [x] 12.1 Create `src/components/canvas/CanvasContainer.tsx`:
    ```typescript
    // src/components/canvas/CanvasContainer.tsx

    'use client';

    import { useCanvasState } from '@/hooks/useCanvasState';
    import { CanvasPlaceholder } from './CanvasPlaceholder';

    export function CanvasContainer() {
      const { content } = useCanvasState();

      // Render based on content type
      switch (content) {
        case 'placeholder':
        default:
          return <CanvasPlaceholder />;

        // Future canvas modes will be added here:
        // case 'email':
        //   return <EmailComposer />;
        // case 'calendar':
        //   return <CalendarPicker />;
        // case 'document':
        //   return <TipTapEditor />;
        // case 'json-render':
        //   return <JsonRenderCanvas />;
      }
    }
    ```
  - [x] 12.2 Implement mode switching logic
  - [x] 12.3 Default to placeholder when empty

- [x] **Task 13: Responsive Breakpoint Handling** (AC: 6, 7)
  - [x] 13.1 Create `src/components/layout/ResponsiveLayout.tsx`:
    ```typescript
    // src/components/layout/ResponsiveLayout.tsx

    'use client';

    import { useEffect } from 'react';
    import { useMediaQuery } from '@/hooks/useMediaQuery';
    import { useCanvasState } from '@/hooks/useCanvasState';

    export function ResponsiveLayoutHandler() {
      const isNarrow = useMediaQuery('(max-width: 1000px)');
      const isMobile = useMediaQuery('(max-width: 800px)');
      const { close, isOpen } = useCanvasState();

      // Auto-close canvas on narrow screens
      useEffect(() => {
        if (isNarrow && isOpen) {
          close();
        }
      }, [isNarrow, close, isOpen]);

      return null; // This component only handles side effects
    }
    ```
  - [x] 13.2 Auto-collapse canvas at 1000px
  - [x] 13.3 Collapse sidebar to icons at 800px
  - [x] 13.4 Ensure no layout overflow

- [x] **Task 14: Visual Regression Tests Setup** (AC: 8)
  - [x] 14.1 Create `tests/e2e/layout.spec.ts`:
    ```typescript
    // tests/e2e/layout.spec.ts

    // Using Vercel Browser Agent per architecture.md;

    test.describe('Split-Screen Layout', () => {
      test('matches design spec at 1440px width', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');
        await page.waitForSelector('[data-testid="app-layout"]');

        // Visual regression snapshot
        await expect(page).toHaveScreenshot('layout-1440px.png', {
          maxDiffPixels: 100,
        });
      });

      test('panel proportions are 35/65 (+/- 2%)', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');

        const chatPanel = page.locator('[data-testid="chat-panel"]');
        const canvasPanel = page.locator('[data-testid="canvas-panel"]');

        const chatBox = await chatPanel.boundingBox();
        const canvasBox = await canvasPanel.boundingBox();

        if (chatBox && canvasBox) {
          const totalWidth = chatBox.width + canvasBox.width;
          const chatPercentage = (chatBox.width / totalWidth) * 100;
          const canvasPercentage = (canvasBox.width / totalWidth) * 100;

          // Allow 2% tolerance
          expect(chatPercentage).toBeGreaterThan(33);
          expect(chatPercentage).toBeLessThan(37);
          expect(canvasPercentage).toBeGreaterThan(63);
          expect(canvasPercentage).toBeLessThan(67);
        }
      });

      test('canvas collapse/expand works', async ({ page }) => {
        await page.goto('/');

        // Canvas should be visible initially
        await expect(page.locator('[data-testid="canvas-panel"]')).toBeVisible();

        // Click divider to collapse
        await page.click('[data-testid="panel-divider"]');

        // Canvas should be hidden
        await expect(page.locator('[data-testid="canvas-panel"]')).not.toBeVisible();

        // Click again to expand
        await page.click('[data-testid="panel-divider"]');

        // Canvas should be visible again
        await expect(page.locator('[data-testid="canvas-panel"]')).toBeVisible();
      });

      test('responsive behavior at 1000px', async ({ page }) => {
        await page.goto('/');

        // Canvas visible at default size
        await expect(page.locator('[data-testid="canvas-panel"]')).toBeVisible();

        // Resize to 1000px
        await page.setViewportSize({ width: 999, height: 900 });

        // Canvas should auto-collapse
        await expect(page.locator('[data-testid="canvas-panel"]')).not.toBeVisible();
      });

      test('responsive behavior at 800px', async ({ page }) => {
        await page.setViewportSize({ width: 799, height: 900 });
        await page.goto('/');

        // Sidebar should be collapsed (72px)
        const sidebar = page.locator('[data-testid="sidebar"]');
        const sidebarBox = await sidebar.boundingBox();
        expect(sidebarBox?.width).toBeLessThan(100);

        // Canvas should be hidden
        await expect(page.locator('[data-testid="canvas-panel"]')).not.toBeVisible();
      });
    });
    ```
  - [x] 14.2 Test layout at various breakpoints
  - [x] 14.3 Test panel proportion accuracy
  - [x] 14.4 Test collapse/expand behavior

- [x] **Task 15: Unit Tests for Layout Components** (AC: 1, 8)
  - [x] 15.1 Create `tests/unit/components/layout/SplitPanel.test.tsx`:
    ```typescript
    // tests/unit/components/layout/SplitPanel.test.tsx

    import { describe, test, expect, vi } from 'vitest';
    import { render, screen, fireEvent } from '@testing-library/react';
    import { SplitPanel } from '@/components/layout/SplitPanel';

    describe('SplitPanel', () => {
      test('renders chat and canvas panels', () => {
        render(
          <SplitPanel
            chatContent={<div data-testid="chat">Chat</div>}
            canvasContent={<div data-testid="canvas">Canvas</div>}
          />
        );

        expect(screen.getByTestId('chat')).toBeInTheDocument();
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
      });

      test('toggles canvas on divider click', () => {
        render(
          <SplitPanel
            chatContent={<div>Chat</div>}
            canvasContent={<div data-testid="canvas">Canvas</div>}
          />
        );

        // Canvas visible initially
        expect(screen.getByTestId('canvas')).toBeVisible();

        // Click divider
        fireEvent.click(screen.getByLabelText(/collapse canvas/i));

        // Canvas should animate out (test presence, animation tested in E2E)
      });

      test('respects defaultCanvasOpen prop', () => {
        render(
          <SplitPanel
            chatContent={<div>Chat</div>}
            canvasContent={<div data-testid="canvas">Canvas</div>}
            defaultCanvasOpen={false}
          />
        );

        // Canvas should not be visible when defaultCanvasOpen is false
        expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
      });
    });
    ```
  - [x] 15.2 Test panel rendering
  - [x] 15.3 Test toggle behavior
  - [x] 15.4 Test default props

- [x] **Task 16: Add Framer Motion Dependency** (AC: 4, 5)
  - [x] 16.1 Install framer-motion:
    ```bash
    pnpm add framer-motion
    ```
  - [x] 16.2 Verify compatibility with Next.js 14

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Chat/Canvas Split | 35% / 65% ratio | FR-CH001 |
| Header Height | 80px fixed | UX-005 |
| Sidebar Width | 280px (72px collapsed) | UX-005 |
| Agent Rail Width | 64px | UX-005 |
| Content Max Width | 850px | UX-005 |
| Canvas Animation | 600ms cubic-bezier ease | UX-008 |
| Design System | Orion tokens (gold, cream, black) | UX-001 to UX-004 |

### Layout Architecture

```
+------------------------------------------------------------------+
|                     HEADER (80px fixed)                           |
+----------+----------------------------------------+----------------+
|          |                                        |                |
| SIDEBAR  |         MAIN CONTENT AREA             | AGENT RAIL     |
| (280px)  |    +-------------+---------------+    |   (64px)       |
|          |    | CHAT (35%)  | CANVAS (65%) |    |                |
|          |    |             |               |    |                |
|          |    |             |               |    |                |
|          |    |             |               |    |                |
|          |    +-------------+---------------+    |                |
|          |                                        |                |
+----------+----------------------------------------+----------------+
```

### CSS Custom Properties to Use

```css
/* From design-system/styles/globals.css */
--orion-header: 80px;
--orion-sidebar: 280px;
--orion-sidebar-collapsed: 72px;
--orion-rail: 64px;
--orion-content-max: 850px;
--orion-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--orion-duration-canvas: 600ms;
```

### Animation Specifications

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Canvas slide in | 600ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Content trigger or toggle |
| Canvas slide out | 600ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Collapse toggle |
| Sidebar collapse | 300ms | ease-in-out | Breakpoint or toggle |
| Panel width change | 600ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Canvas toggle |

### Directory Structure for This Story

```
src/
├── app/
│   └── page.tsx                    # MODIFY: Add AppLayout wrapper
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           # CREATE: Main layout shell
│   │   ├── SplitPanel.tsx          # CREATE: Chat/Canvas splitter
│   │   ├── Header.tsx              # CREATE: Top navigation bar
│   │   ├── Sidebar.tsx             # CREATE: Left navigation
│   │   ├── AgentRail.tsx           # CREATE: Right agent indicator
│   │   └── ResponsiveLayout.tsx    # CREATE: Breakpoint handler
│   └── canvas/
│       ├── CanvasContainer.tsx     # CREATE: Canvas mode switcher
│       └── CanvasPlaceholder.tsx   # CREATE: Empty state
├── hooks/
│   ├── useMediaQuery.ts            # CREATE: Responsive detection
│   ├── useCanvasState.ts           # CREATE: Canvas state management
│   └── useLayoutShortcuts.ts       # CREATE: Keyboard shortcuts
└── lib/
    └── utils.ts                    # EXISTS: cn() utility

tailwind.config.ts                  # MODIFY: Add layout tokens
design-system/styles/globals.css    # MODIFY: Add CSS variables

tests/
├── unit/
│   └── components/
│       └── layout/
│           └── SplitPanel.test.tsx # CREATE: Unit tests
└── e2e/
    └── layout.spec.ts              # CREATE: Visual regression tests
```

### Dependencies

**New npm dependencies:**
- `framer-motion` - For smooth panel animations

**Existing dependencies used:**
- `zustand` - State management for canvas state
- `lucide-react` - Icons for sidebar, header, agent rail

### Project Structure Notes

- **Dependency:** Story 1-3 (Design System Foundation) - provides CSS tokens and variables
- **Dependency:** Story 1-2 (Next.js Frontend) - provides React infrastructure
- **Parallel:** Can run alongside Stories 1-7, 1-8 (chat functionality)
- **Enables:** Story 1-10 (Tool Call Visualization) - canvas will display tool results
- **Enables:** Epic 11 (json-render) - canvas will host AI-generated UI

### Orion Design System Usage

| Element | Class/Token | Value |
|---------|-------------|-------|
| Header | `h-header` | 80px |
| Sidebar | `w-sidebar` | 280px |
| Sidebar collapsed | `w-sidebar-collapsed` | 72px |
| Agent Rail | `w-rail` | 64px |
| Primary gold | `orion-primary` | #D4AF37 |
| Background cream | `orion-bg` | #F9F8F6 |
| Foreground black | `orion-fg` | #1A1A1A |
| Border | `border-orion-fg/10` | #1A1A1A @ 10% |
| Serif font | `font-serif` | Playfair Display |
| Editorial tracking | `tracking-editorial` | 0.25em |

### Testing Standards

| Test Type | Framework | Location | Notes |
|-----------|-----------|----------|-------|
| Unit | Vitest + RTL | `tests/unit/components/layout/*.test.tsx` | Mock zustand |
| E2E | Vercel Browser Agent | `tests/e2e/layout.spec.ts` | Visual regression |

### Performance Considerations

- Use CSS transitions where possible (GPU-accelerated)
- Minimize React re-renders during animation
- Use `will-change` hint on animated elements
- Lazy load canvas content until needed

### Accessibility Requirements

- `aria-label` on all icon buttons
- `aria-expanded` on collapsible panels
- Focus management when canvas opens/closes
- Keyboard navigation (Tab, Arrow keys)
- Screen reader announcements for layout changes

---

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.9: Split-Screen Layout]
- [Source: thoughts/planning-artifacts/prd.md#5.1.1 Chat Interface (FR-CH001)]
- [Source: thoughts/planning-artifacts/prd.md#7.1.1 Orion Design System]
- [Source: thoughts/planning-artifacts/prd.md#7.2 Key Screens/Views]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Design System Foundation]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Flow 2: Chat to Canvas Handoff]
- [Source: thoughts/planning-artifacts/architecture-diagrams.md#7. Canvas Mode Selection]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build succeeded after fixing ChatContainer sendMessage type mismatch
- All 517 unit tests pass
- framer-motion v12.26.2 installed successfully

### Completion Notes List

1. **Task 16 (framer-motion)**: Installed framer-motion for smooth panel animations per UX-008
2. **Tasks 7-8 (Hooks)**: Created useMediaQuery (SSR-safe breakpoint detection) and useCanvasState (zustand store with persistence)
3. **Tasks 1-5 (Layout Components)**: Created AppLayout, SplitPanel, Header, Sidebar, AgentRail with design system tokens
4. **Task 6 (Canvas)**: Created CanvasPlaceholder with Playfair Display italic and gold accent
5. **Task 9 (Keyboard)**: Implemented Cmd+\ toggle and Esc to close canvas shortcuts
6. **Task 10 (Tailwind)**: Added orion-ease timing function and canvas duration token
7. **Tasks 11-12 (Integration)**: Updated page.tsx with AppLayout, SplitPanel, ChatContainer, CanvasContainer
8. **Task 13 (Responsive)**: Created ResponsiveLayoutHandler for auto-collapse at 1000px breakpoint
9. **Tasks 14-15 (Tests)**: Created 42 unit tests for hooks and layout components, E2E tests for all ACs

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive split-screen implementation guide | SM Agent (Bob) |
| 2026-01-16 | Full implementation complete: all 16 tasks, 42 unit tests pass, E2E tests created | Dev Agent (Amelia) |
| 2026-01-16 | Code review: 5 test coverage gaps identified (CanvasPlaceholder, CanvasContainer, AgentRail, useLayoutShortcuts, ResponsiveLayoutHandler) | Dev Agent (Amelia) |
| 2026-01-16 | All 5 test gaps fixed: ~25 new unit tests added, all 543 tests pass, review passed | Dev Agent (Amelia) |

### File List

**Created:**
- `src/components/layout/AppLayout.tsx` - Main layout shell
- `src/components/layout/SplitPanel.tsx` - Chat/Canvas split container with animations
- `src/components/layout/Header.tsx` - Fixed header with logo, search, actions
- `src/components/layout/Sidebar.tsx` - Navigation sidebar with collapse
- `src/components/layout/AgentRail.tsx` - Agent indicator rail
- `src/components/layout/ResponsiveLayout.tsx` - Breakpoint handler
- `src/components/layout/index.ts` - Layout exports
- `src/components/canvas/CanvasPlaceholder.tsx` - Empty canvas state
- `src/components/canvas/CanvasContainer.tsx` - Canvas mode switcher
- `src/components/canvas/index.ts` - Canvas exports
- `src/components/chat/ChatContainer.tsx` - Chat wrapper for split panel
- `src/hooks/useMediaQuery.ts` - SSR-safe media query hook
- `src/hooks/useCanvasState.ts` - Canvas state zustand store
- `src/hooks/useLayoutShortcuts.ts` - Keyboard shortcuts hook
- `tests/unit/components/layout/AppLayout.test.tsx` - AppLayout tests
- `tests/unit/components/layout/SplitPanel.test.tsx` - SplitPanel tests
- `tests/unit/components/layout/Header.test.tsx` - Header tests
- `tests/unit/components/layout/Sidebar.test.tsx` - Sidebar tests
- `tests/unit/hooks/useCanvasState.test.ts` - Canvas state tests
- `tests/unit/hooks/useMediaQuery.test.ts` - Media query tests
- `tests/e2e/story-1.9-layout.spec.ts` - E2E layout tests

**Modified:**
- `src/app/page.tsx` - Integrated AppLayout with SplitPanel
- `src/components/chat/index.ts` - Added ChatContainer export
- `design-system/tailwind.config.ts` - Added orion-ease and canvas duration
- `package.json` - Added framer-motion dependency
