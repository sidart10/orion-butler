# Story 1.15: Global Keyboard Shortcuts

Status: done

## Story

As a **user**,
I want keyboard shortcuts for primary actions,
So that I can work efficiently without mouse (FR-10.7).

## Acceptance Criteria

1. **Given** the app is focused
   **When** I press Cmd+N
   **Then** quick capture is triggered (placeholder action for MVP)
   **And** a visual indicator confirms the shortcut was received

2. **Given** the app is focused
   **When** I press Cmd+[
   **Then** the sidebar collapses if expanded
   **Or** the sidebar expands if collapsed
   **And** the transition is smooth (300ms with luxury easing from Story 1.6)

3. **Given** the app is focused
   **When** I press Cmd+K
   **Then** command palette opens (placeholder modal for MVP)
   **And** focus moves to the palette input

4. **Given** the chat input is focused
   **When** I press Cmd+Enter
   **Then** the message is sent
   **And** the input clears after successful send

5. **Given** the app is focused
   **When** I press Esc
   **Then** the currently open canvas closes (if any)
   **Or** the currently open modal/palette closes (if any)
   **And** focus returns to the previous element

6. **Given** any keyboard shortcut is pressed
   **Then** the shortcut does not conflict with system shortcuts (Cmd+C, Cmd+V, Cmd+Q, etc.)
   **And** standard text editing shortcuts work normally in input fields

7. **Given** the app is running
   **When** shortcuts are used
   **Then** each shortcut has a visual hint available via tooltip (shown on hover)
   **And** shortcuts are discoverable through a help mechanism

8. **Given** an input field or text area has focus
   **When** I press a keyboard shortcut
   **Then** shortcuts that would interfere with typing are disabled (except Cmd+Enter for send)
   **And** standard editing shortcuts work normally

## Tasks / Subtasks

- [x] Task 1: Create keyboard shortcut hook infrastructure (AC: #1-8)
  - [x] 1.1: Create `src/hooks/useKeyboardShortcuts.ts` for global keyboard event handling
  - [x] 1.2: Implement shortcut registration with action callbacks
  - [x] 1.3: Add scope detection (global vs. input-focused)
  - [x] 1.4: Add modifier key detection (Cmd/Ctrl, Shift, Alt/Option)
  - [x] 1.5: Implement conflict prevention for system shortcuts
  - [x] 1.6: Add event.preventDefault() for handled shortcuts

- [x] Task 2: Create keyboard shortcut provider component (AC: #1-6)
  - [x] 2.1: Create `src/components/providers/KeyboardShortcutProvider.tsx`
  - [x] 2.2: Register all global shortcuts on mount
  - [x] 2.3: Clean up event listeners on unmount
  - [x] 2.4: Export shortcut context for child components
  - [x] 2.5: Add KeyboardShortcutProvider as a sibling to ThemeProvider in layout.tsx (not integrated into ThemeProvider, but wrapping children alongside it)

- [x] Task 3: Implement Cmd+[ sidebar toggle shortcut (AC: #2)
  - [x] 3.1: Add sidebar toggle action to shortcut registry
  - [x] 3.2: Wire to existing sidebar Zustand store from Story 1.4
  - [x] 3.3: Ensure transition animation plays (300ms cubic-bezier from Story 1.6)
  - [x] 3.4: Handle collapsed vs expanded state toggle

- [x] Task 4: Implement Cmd+N quick capture shortcut (AC: #1)
  - [x] 4.1: Add quick capture action to shortcut registry
  - [x] 4.2: Create placeholder quick capture modal/input component
  - [x] 4.3: Focus the capture input when triggered
  - [x] 4.4: Add visual indicator that shortcut was received

- [x] Task 5: Implement Cmd+K command palette shortcut (AC: #3)
  - [x] 5.1: Add command palette action to shortcut registry
  - [x] 5.2: Create placeholder command palette modal component
  - [x] 5.3: Focus the palette input when opened
  - [x] 5.4: Implement basic open/close toggle behavior

- [x] Task 6: Implement Cmd+Enter send message shortcut (AC: #4)
  - [x] 6.1: Add Cmd+Enter detection specifically for chat input context
  - [x] 6.2: Wire to message send action (placeholder for now)
  - [x] 6.3: Clear input after successful send
  - [x] 6.4: Ensure shortcut only fires when chat input is focused

- [x] Task 7: Implement Esc dismiss shortcut (AC: #5)
  - [x] 7.1: Add Esc handler for closing modals/canvas
  - [x] 7.2: Implement focus restoration on close
  - [x] 7.3: Handle priority (canvas > modal > palette)
  - [x] 7.4: Wire to canvas store from Story 1.6

- [x] Task 8: Implement shortcut hints/tooltips (AC: #7)
  - [x] 8.1: Add shortcut hints to relevant buttons/actions
  - [x] 8.2: Show keyboard shortcut on hover using Tooltip component
  - [x] 8.3: Use consistent formatting (Cmd+K, not Command+K or Meta+K)

- [x] Task 9: Create keyboard shortcuts help display (AC: #7)
  - [x] 9.1: Create shortcuts list display component
  - [x] 9.2: Add to settings page under "Keyboard" section
  - [x] 9.3: Group shortcuts by context (Global, Chat, Navigation)

- [x] Task 10: Add shortcut scope management for input fields (AC: #8)
  - [x] 10.1: Detect when focus is in input/textarea/contenteditable
  - [x] 10.2: Disable navigation shortcuts (Cmd+[, Cmd+N, Cmd+K) when typing
  - [x] 10.3: Keep Cmd+Enter active for message send
  - [x] 10.4: Keep Esc active for closing modals

- [x] Task 11: Write unit tests for keyboard shortcut hook
  - [x] 11.1: Test shortcut registration and callback execution
  - [x] 11.2: Test modifier key combinations
  - [x] 11.3: Test scope detection (global vs input)
  - [x] 11.4: Test conflict prevention

- [x] Task 12: Write E2E tests for keyboard shortcuts
  - [x] 12.1: Test Cmd+[ toggles sidebar
  - [x] 12.2: Test Cmd+N opens quick capture
  - [x] 12.3: Test Cmd+K opens command palette
  - [x] 12.4: Test Cmd+Enter sends message
  - [x] 12.5: Test Esc closes canvas/modal
  - [x] 12.6: Test shortcuts disabled in input fields (where appropriate)

## Dev Notes

### Architecture Compliance

**Shortcut Configuration (from PRD section 8.11):**

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Cmd+Opt+O` | Invoke Orion (global, system-wide) | **NOT in scope** - requires Tauri global shortcut API |
| `Cmd+N` | New inbox (quick capture) | In-app |
| `Cmd+K` | Command palette | In-app |
| `Cmd+[` | Collapse/expand sidebar | In-app |
| `Cmd+Up/Down` | Navigate conversations | **Deferred** - requires conversation list |
| `Cmd+,` | Open Settings | In-app (per Story 7.2) |
| `Cmd+Enter` | Send message | Chat input |
| `Esc` | Close canvas / collapse activity | In-app |

**Note on Global Hotkey:** The system-wide `Cmd+Opt+O` shortcut is NOT in scope for this story. It requires Tauri's global shortcut registration API and will be implemented in a dedicated story (likely Epic 10: Daily Driver Features).

**Note on Activity Collapse:** Per PRD 8.11, Esc should "collapse activity" in addition to closing canvas/modal. However, the Activity Section is POST-MVP per UX specification (Story 1.8 is explicitly deferred to Sprint 2). For MVP, Esc handles: Quick Capture > Command Palette > Canvas (in priority order).

**State Management (from architecture.md):**
- Use existing Zustand stores where available (sidebar from Story 1.4, canvas from Story 1.6)
- Keyboard shortcut state (what's registered, what's active) can be a simple Map

**UX Specification Reference:**
- All actions accessible via both keyboard and mouse
- Keyboard shortcuts shown on hover (tooltips)
- Global hotkey works from any app (future - not this story)

### Implementation Strategy

**Keyboard Event Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  KeyboardShortcutProvider                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                useKeyboardShortcuts Hook                     ││
│  │                                                              ││
│  │  shortcuts: Map<string, ShortcutConfig>                      ���│
│  │                                                              ││
│  │  onKeyDown(event) {                                          ││
│  │    if (isInputFocused() && !allowedInInput(shortcut))        ││
│  │      return;                                                 ││
│  │                                                              ││
│  │    const key = buildShortcutKey(event);                      ││
│  │    const config = shortcuts.get(key);                        ││
│  │    if (config) {                                             ││
│  │      event.preventDefault();                                 ││
│  │      config.action();                                        ││
│  │    }                                                         ││
│  │  }                                                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Shortcut Key Format:**

Use a consistent string format for shortcut identification:
- `meta+n` for Cmd+N
- `meta+[` for Cmd+[
- `meta+k` for Cmd+K
- `meta+enter` for Cmd+Enter
- `escape` for Esc

Note: Use `meta` not `cmd` for cross-platform consistency (meta = Cmd on Mac, Ctrl on Windows).

**Scope Detection:**

```typescript
function isInputFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;

  const tagName = active.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  if (active.getAttribute('contenteditable') === 'true') return true;

  return false;
}
```

### Shortcut Configuration Types

```typescript
// src/hooks/useKeyboardShortcuts.ts

interface ShortcutConfig {
  key: string;           // The key (e.g., 'n', '[', 'k', 'enter', 'escape')
  modifiers: {
    meta?: boolean;      // Cmd on Mac, Ctrl on Windows
    shift?: boolean;
    alt?: boolean;       // Option on Mac
  };
  action: () => void;
  description: string;   // For help display
  category: 'global' | 'navigation' | 'chat';
  allowInInput?: boolean; // Defaults to false
}

interface ShortcutRegistry {
  register: (id: string, config: ShortcutConfig) => void;
  unregister: (id: string) => void;
  getAll: () => Map<string, ShortcutConfig>;
}
```

### Hook Implementation

```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback, useRef } from 'react';

type ModifierKeys = {
  meta: boolean;
  shift: boolean;
  alt: boolean;
};

interface ShortcutConfig {
  key: string;
  modifiers: Partial<ModifierKeys>;
  action: () => void;
  description: string;
  category: 'global' | 'navigation' | 'chat';
  allowInInput?: boolean;
}

// Build a unique key string from event
function buildShortcutKey(
  key: string,
  modifiers: Partial<ModifierKeys>
): string {
  const parts: string[] = [];
  if (modifiers.meta) parts.push('meta');
  if (modifiers.shift) parts.push('shift');
  if (modifiers.alt) parts.push('alt');
  parts.push(key.toLowerCase());
  return parts.join('+');
}

function isInputElement(element: Element | null): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  if (element.getAttribute('contenteditable') === 'true') return true;

  return false;
}

// Detect platform once at module load
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Use metaKey on Mac, ctrlKey on Windows/Linux
    // This ensures Ctrl+K on Mac doesn't trigger Cmd+K actions
    const modifiers: ModifierKeys = {
      meta: isMac ? event.metaKey : event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
    };

    const eventKey = buildShortcutKey(event.key, modifiers);

    // Find matching shortcut
    const shortcut = shortcutsRef.current.find(s => {
      const shortcutKey = buildShortcutKey(s.key, s.modifiers);
      return shortcutKey === eventKey;
    });

    if (!shortcut) return;

    // Check if in input and shortcut is not allowed in input
    if (isInputElement(document.activeElement) && !shortcut.allowInInput) {
      return;
    }

    // Prevent default and execute action
    event.preventDefault();
    shortcut.action();
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

### Provider Component

```tsx
// src/components/providers/KeyboardShortcutProvider.tsx
'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useState, createContext, useContext } from 'react';

interface KeyboardShortcutContextValue {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
  isCommandPaletteOpen: boolean;
  isQuickCaptureOpen: boolean;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null);

export function useKeyboardShortcutContext() {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcutContext must be used within KeyboardShortcutProvider');
  }
  return context;
}

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isQuickCaptureOpen, setQuickCaptureOpen] = useState(false);

  const { toggle: toggleSidebar } = useSidebarStore();
  const { close: closeCanvas, isOpen: isCanvasOpen } = useCanvasStore();

  const shortcuts = [
    {
      key: '[',
      modifiers: { meta: true },
      action: toggleSidebar,
      description: 'Toggle sidebar',
      category: 'navigation' as const,
    },
    {
      key: 'n',
      modifiers: { meta: true },
      action: () => setQuickCaptureOpen(true),
      description: 'Quick capture',
      category: 'global' as const,
    },
    {
      key: 'k',
      modifiers: { meta: true },
      action: () => setCommandPaletteOpen(prev => !prev),
      description: 'Command palette',
      category: 'global' as const,
    },
    {
      key: ',',
      modifiers: { meta: true },
      action: () => {
        // Navigate to settings - use Next.js router or window.location
        // This will be wired to the actual router in implementation
        window.location.href = '/settings';
      },
      description: 'Open Settings',
      category: 'navigation' as const,
    },
    {
      key: 'Escape',
      modifiers: {},
      action: () => {
        // Priority: quick capture > command palette > canvas
        if (isQuickCaptureOpen) {
          setQuickCaptureOpen(false);
        } else if (isCommandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (isCanvasOpen) {
          closeCanvas();
        }
      },
      description: 'Close / Dismiss',
      category: 'global' as const,
      allowInInput: true, // Esc should work even in inputs
    },
  ];

  useKeyboardShortcuts(shortcuts);

  const contextValue: KeyboardShortcutContextValue = {
    openCommandPalette: () => setCommandPaletteOpen(true),
    closeCommandPalette: () => setCommandPaletteOpen(false),
    openQuickCapture: () => setQuickCaptureOpen(true),
    closeQuickCapture: () => setQuickCaptureOpen(false),
    isCommandPaletteOpen,
    isQuickCaptureOpen,
  };

  return (
    <KeyboardShortcutContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
}
```

### Cmd+Enter for Chat Input

The Cmd+Enter shortcut is special because it should only work when the chat input is focused. This should be handled at the component level rather than globally.

```tsx
// src/components/chat/ChatInput.tsx (modification)
function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+Enter or Ctrl+Enter to send
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSend(value);
        setValue('');
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Message Orion..."
      className="..."
    />
  );
}
```

### Placeholder Components

**Quick Capture Modal (Placeholder):**

```tsx
// src/components/modals/QuickCaptureModal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useKeyboardShortcutContext } from '@/components/providers/KeyboardShortcutProvider';

export function QuickCaptureModal() {
  const { isQuickCaptureOpen, closeQuickCapture } = useKeyboardShortcutContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickCaptureOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isQuickCaptureOpen]);

  if (!isQuickCaptureOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50">
      <div className="bg-orion-surface w-full max-w-lg p-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Quick capture... (Placeholder)"
          className="w-full px-4 py-3 bg-orion-bg border border-orion-border text-orion-fg focus:outline-none focus:ring-2 focus:ring-orion-gold"
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeQuickCapture();
            // TODO: Handle Enter to submit capture
          }}
        />
        <p className="mt-2 text-sm text-orion-fg-muted">
          Press Enter to capture, Esc to close
        </p>
      </div>
    </div>
  );
}
```

**Command Palette Modal (Placeholder):**

```tsx
// src/components/modals/CommandPaletteModal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useKeyboardShortcutContext } from '@/components/providers/KeyboardShortcutProvider';

export function CommandPaletteModal() {
  const { isCommandPaletteOpen, closeCommandPalette } = useKeyboardShortcutContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50">
      <div className="bg-orion-surface w-full max-w-lg p-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a command... (Placeholder)"
          className="w-full px-4 py-3 bg-orion-bg border border-orion-border text-orion-fg focus:outline-none focus:ring-2 focus:ring-orion-gold"
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeCommandPalette();
          }}
        />
        <div className="mt-4 text-sm text-orion-fg-muted">
          <p>Command palette is a placeholder for MVP.</p>
          <p className="mt-2">Press Esc or Cmd+K to close</p>
        </div>
      </div>
    </div>
  );
}
```

### Shortcut Hints Component

```tsx
// src/components/ui/ShortcutHint.tsx
interface ShortcutHintProps {
  shortcut: string; // e.g., "Cmd+K"
  className?: string;
}

export function ShortcutHint({ shortcut, className = '' }: ShortcutHintProps) {
  return (
    <kbd className={`
      px-1.5 py-0.5
      text-xs font-mono
      bg-orion-surface-elevated
      text-orion-fg-muted
      border border-orion-border
      ${className}
    `}>
      {shortcut}
    </kbd>
  );
}
```

### Keyboard Shortcuts Help Section

```tsx
// src/components/settings/KeyboardShortcutsSection.tsx
const shortcuts = [
  { keys: 'Cmd+N', description: 'Quick capture', category: 'Global' },
  { keys: 'Cmd+K', description: 'Command palette', category: 'Global' },
  { keys: 'Cmd+,', description: 'Open Settings', category: 'Global' },
  { keys: 'Cmd+[', description: 'Toggle sidebar', category: 'Navigation' },
  { keys: 'Esc', description: 'Close / Dismiss', category: 'Global' },
  { keys: 'Cmd+Enter', description: 'Send message', category: 'Chat' },
];

export function KeyboardShortcutsSection() {
  const categories = [...new Set(shortcuts.map(s => s.category))];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-orion-fg">Keyboard Shortcuts</h3>

      {categories.map(category => (
        <div key={category}>
          <h4 className="text-sm font-medium text-orion-fg-muted mb-2">{category}</h4>
          <div className="space-y-2">
            {shortcuts
              .filter(s => s.category === category)
              .map(shortcut => (
                <div
                  key={shortcut.keys}
                  className="flex justify-between items-center py-2 border-b border-orion-border"
                >
                  <span className="text-orion-fg">{shortcut.description}</span>
                  <ShortcutHint shortcut={shortcut.keys} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.4 | Sidebar component and Zustand store for toggle |
| 1.5 | Chat input component for Cmd+Enter |
| 1.6 | Canvas component and Zustand store for Esc close |
| 1.14 | Settings page exists for keyboard shortcuts section |
| 1.14 | ThemeProvider pattern for KeyboardShortcutProvider |

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useKeyboardShortcuts.ts` | Core keyboard shortcut hook |
| `src/components/providers/KeyboardShortcutProvider.tsx` | Provider component |
| `src/components/modals/QuickCaptureModal.tsx` | Placeholder quick capture UI |
| `src/components/modals/CommandPaletteModal.tsx` | Placeholder command palette UI |
| `src/components/ui/ShortcutHint.tsx` | Keyboard shortcut display component |
| `src/components/settings/KeyboardShortcutsSection.tsx` | Settings help section |
| `tests/unit/useKeyboardShortcuts.test.ts` | Unit tests for hook |
| `tests/e2e/keyboard-shortcuts.spec.ts` | E2E tests for shortcuts |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add KeyboardShortcutProvider wrapper (alongside ThemeProvider); also render QuickCaptureModal and CommandPaletteModal within provider tree |
| `src/components/chat/ChatInput.tsx` | Add Cmd+Enter handler |
| `src/app/settings/page.tsx` | Add Keyboard section with shortcuts help |

**Note:** QuickCaptureModal and CommandPaletteModal must be rendered within the KeyboardShortcutProvider context, typically in layout.tsx or a shared Providers component that wraps both ThemeProvider and KeyboardShortcutProvider children.

### Directories to Create

| Directory | Purpose |
|-----------|---------|
| `src/components/modals/` | Modal components (quick capture, command palette) |

### Testing Standards

**Unit Tests (Vitest):**

```typescript
// tests/unit/useKeyboardShortcuts.test.ts
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { vi } from 'vitest';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls action when shortcut is pressed', () => {
    const action = vi.fn();

    renderHook(() => useKeyboardShortcuts([
      {
        key: 'k',
        modifiers: { meta: true },
        action,
        description: 'Test',
        category: 'global',
      },
    ]));

    // Simulate Cmd+K
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does not call action when wrong modifier is pressed', () => {
    const action = vi.fn();

    renderHook(() => useKeyboardShortcuts([
      {
        key: 'k',
        modifiers: { meta: true },
        action,
        description: 'Test',
        category: 'global',
      },
    ]));

    // Simulate just K (no modifier)
    const event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });

  it('does not call action when input is focused and allowInInput is false', () => {
    const action = vi.fn();

    // Create and focus an input
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useKeyboardShortcuts([
      {
        key: 'n',
        modifiers: { meta: true },
        action,
        description: 'Test',
        category: 'global',
        allowInInput: false,
      },
    ]));

    // Simulate Cmd+N
    const event = new KeyboardEvent('keydown', {
      key: 'n',
      metaKey: true,
    });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });

  it('calls action when input is focused and allowInInput is true', () => {
    const action = vi.fn();

    // Create and focus an input
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useKeyboardShortcuts([
      {
        key: 'Escape',
        modifiers: {},
        action,
        description: 'Test',
        category: 'global',
        allowInInput: true,
      },
    ]));

    // Simulate Escape
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);

    // Cleanup
    document.body.removeChild(input);
  });

  it('prevents default when shortcut is handled', () => {
    const action = vi.fn();

    renderHook(() => useKeyboardShortcuts([
      {
        key: 'k',
        modifiers: { meta: true },
        action,
        description: 'Test',
        category: 'global',
      },
    ]));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});

/**
 * Test Environment Considerations:
 *
 * 1. jsdom KeyboardEvent: Native KeyboardEvent dispatch in jsdom may not fully
 *    honor `cancelable: true`. If preventDefault tests are flaky, consider using
 *    @testing-library/user-event or fireEvent from @testing-library/react instead
 *    of native KeyboardEvent for more reliable cross-environment behavior.
 *
 * 2. Platform detection: Tests run in Node/jsdom which doesn't have a real
 *    navigator.platform. The hook should handle SSR/test environments gracefully
 *    by defaulting to a sensible platform (e.g., treat undefined as non-Mac).
 *
 * 3. Alternative approach using testing-library:
 *    import { fireEvent } from '@testing-library/react';
 *    fireEvent.keyDown(window, { key: 'k', metaKey: true });
 */
```

**E2E Tests (Playwright):**

```typescript
// tests/e2e/keyboard-shortcuts.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Cmd+[ toggles sidebar', async ({ page }) => {
    // Check sidebar is initially visible
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Get initial width
    const initialWidth = await sidebar.evaluate(el => el.offsetWidth);
    expect(initialWidth).toBe(280);

    // Press Cmd+[
    await page.keyboard.press('Meta+[');

    // Sidebar should be collapsed (width 0 or 48 depending on breakpoint)
    await expect(sidebar).toHaveCSS('width', /0|48/);

    // Press Cmd+[ again
    await page.keyboard.press('Meta+[');

    // Sidebar should be expanded again
    await expect(sidebar).toHaveCSS('width', '280px');
  });

  test('Cmd+N opens quick capture', async ({ page }) => {
    // Quick capture should not be visible initially
    await expect(page.locator('text=Quick capture')).not.toBeVisible();

    // Press Cmd+N
    await page.keyboard.press('Meta+n');

    // Quick capture should be visible
    await expect(page.locator('input[placeholder*="Quick capture"]')).toBeVisible();

    // Input should be focused
    await expect(page.locator('input[placeholder*="Quick capture"]')).toBeFocused();
  });

  test('Cmd+K opens command palette', async ({ page }) => {
    // Command palette should not be visible initially
    await expect(page.locator('text=Type a command')).not.toBeVisible();

    // Press Cmd+K
    await page.keyboard.press('Meta+k');

    // Command palette should be visible
    await expect(page.locator('input[placeholder*="command"]')).toBeVisible();

    // Input should be focused
    await expect(page.locator('input[placeholder*="command"]')).toBeFocused();

    // Press Cmd+K again to close
    await page.keyboard.press('Meta+k');
    await expect(page.locator('input[placeholder*="command"]')).not.toBeVisible();
  });

  test('Esc closes command palette', async ({ page }) => {
    // Open command palette
    await page.keyboard.press('Meta+k');
    await expect(page.locator('input[placeholder*="command"]')).toBeVisible();

    // Press Esc
    await page.keyboard.press('Escape');

    // Command palette should be closed
    await expect(page.locator('input[placeholder*="command"]')).not.toBeVisible();
  });

  test('Esc closes quick capture', async ({ page }) => {
    // Open quick capture
    await page.keyboard.press('Meta+n');
    await expect(page.locator('input[placeholder*="Quick capture"]')).toBeVisible();

    // Press Esc
    await page.keyboard.press('Escape');

    // Quick capture should be closed
    await expect(page.locator('input[placeholder*="Quick capture"]')).not.toBeVisible();
  });

  test('Cmd+N does not trigger when input is focused', async ({ page }) => {
    // Focus the chat input
    const chatInput = page.locator('textarea[placeholder*="Message"]');
    await chatInput.click();

    // Type normally
    await page.keyboard.type('Hello');

    // Cmd+N should not open quick capture when in input
    await page.keyboard.press('Meta+n');

    // Quick capture should NOT be visible (shortcut disabled in input)
    await expect(page.locator('input[placeholder*="Quick capture"]')).not.toBeVisible();
  });

  test('Cmd+Enter sends message in chat input', async ({ page }) => {
    // Focus chat input and type
    const chatInput = page.locator('textarea[placeholder*="Message"]');
    await chatInput.click();
    await chatInput.fill('Test message');

    // Press Cmd+Enter
    await page.keyboard.press('Meta+Enter');

    // Input should be cleared (message sent)
    await expect(chatInput).toHaveValue('');
  });

  test('shortcuts have visible hints on hover', async ({ page }) => {
    // Hover over an element that has a shortcut hint tooltip
    // The hamburger menu from Story 1.12 includes sidebar toggle functionality
    // Note: The exact element depends on implementation - adjust selector as needed
    // For MVP, verify tooltip appears on the hamburger menu button or a sidebar-related control
    const menuButton = page.locator('[aria-label*="menu"], [aria-label*="navigation"], button:has-text("Menu")').first();

    // If no menu button exists yet, check for any element with shortcut tooltip
    // This test may need adjustment once Story 1.12 hamburger menu is implemented
    const hasMenuButton = await menuButton.count() > 0;

    if (hasMenuButton) {
      await menuButton.hover();
      // Should see shortcut hint in tooltip (Cmd+[ for sidebar toggle)
      await expect(page.locator('text=Cmd+[')).toBeVisible({ timeout: 5000 });
    } else {
      // Fallback: verify shortcut hints exist in settings keyboard section
      await page.goto('/settings');
      await expect(page.locator('text=Cmd+[')).toBeVisible();
    }
  });
});
```

### UX Specification Reference

From UX Design Specification (ux-design-specification.md) - Navigation Patterns:

| Shortcut | Action | Scope |
|----------|--------|-------|
| Cmd+Opt+O | **Invoke Orion** (configurable) | Global (system-wide) - NOT this story |
| Cmd+K | Command palette | In-app |
| Cmd+N | Quick capture | In-app |
| Cmd+, | Open Settings | In-app (per Story 7.2) |
| Cmd+[ | Toggle sidebar | In-app |
| Cmd+Enter | Send message / Approve | In-app |
| Cmd+Shift+A | Activity view | In-app - Deferred |
| Esc | Dismiss / Cancel | In-app |

**Rules:** Global hotkey works from any app. All in-app actions have shortcuts, shown on hover.

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.15: Global Keyboard Shortcuts]
- [Source: thoughts/planning-artifacts/prd-v2.md#8.11 Keyboard Shortcuts]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Navigation Patterns]
- [Source: thoughts/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: .ralph/story-chain.md#Story 1.14: Dark Mode - Manual Toggle]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.4 (Sidebar Column)**:
- Sidebar Zustand store with `isCollapsed`, `toggle()` actions
- Keyboard navigation pattern established (Arrow keys within sidebar)
- Focus state pattern: 2px gold outline with 2px offset

From **Story 1.5 (Main Chat Column)**:
- ChatInput component exists
- Input focus state pattern established

From **Story 1.6 (Canvas Column Placeholder)**:
- Canvas Zustand store with `isCanvasOpen`, `open()`, `close()`, `toggle()` actions
- Canvas animation: 300ms with cubic-bezier(0.4, 0, 0.2, 1)

From **Story 1.14 (Dark Mode - Manual Toggle)**:
- ThemeProvider pattern established for app-level providers
- Settings page exists with Appearance section
- Can add Keyboard section for shortcut display

### What This Story Establishes

1. **Keyboard Shortcut Hook:** `useKeyboardShortcuts` for global keyboard handling
2. **KeyboardShortcutProvider:** App-level provider for shortcut registration and context
3. **Cmd+[ Sidebar Toggle:** Wired to existing sidebar store
4. **Cmd+N Quick Capture:** Placeholder modal (full implementation in Epic 5)
5. **Cmd+K Command Palette:** Placeholder modal (full implementation later)
6. **Cmd+Enter Send:** Context-specific shortcut for chat input
7. **Esc Dismiss:** Universal close for modals/canvas
8. **Shortcut Hints:** Visual hints via tooltips on hover
9. **Keyboard Help Section:** Settings page section showing all shortcuts

### Patterns Introduced

| Pattern | Description |
|---------|-------------|
| Keyboard Shortcut Hook | `useKeyboardShortcuts` with registration API |
| Shortcut Key Format | `meta+key` string format for identification |
| Scope Detection | Input-focused vs global context detection |
| Context-Specific Shortcuts | Cmd+Enter only in chat input |
| Shortcut Priority | Esc priority: quick capture > command palette > canvas |
| Shortcut Hints | `<ShortcutHint>` component for displaying shortcuts |
| AllowInInput Flag | Per-shortcut control over input field behavior |

### Notes for Next Story (1.16: Focus States)

- Focus states should work with keyboard shortcuts (Tab navigation)
- Keyboard shortcut provider manages focus for modals/palettes
- Focus should return to previous element when modal closes (already implemented in this story)
- Consider focus trap for modals opened via keyboard shortcuts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

**Implementation Summary (2026-01-26):**

1. **useKeyboardShortcuts Hook** (`src/hooks/useKeyboardShortcuts.ts`):
   - Core keyboard shortcut infrastructure with registration, scope detection, modifier handling
   - Cross-platform support: Meta key = Cmd on Mac, Ctrl on Windows/Linux
   - `allowInInput` flag for shortcuts that should work in input fields (Esc, Cmd+Enter)
   - Helper functions: `buildShortcutKey`, `isInputElement`, `formatShortcutForDisplay`
   - Exports `isMac` for platform-specific display

2. **KeyboardShortcutProvider** (`src/components/providers/KeyboardShortcutProvider.tsx`):
   - Context provider for modal state (quick capture, command palette)
   - Registers global shortcuts: Cmd+N, Cmd+K, Cmd+[, Cmd+,, Esc
   - Integrates with layoutStore (sidebar toggle) and canvasStore (Esc to close)
   - Uses Next.js router for Cmd+, navigation to /settings

3. **QuickCaptureModal** (`src/components/modals/QuickCaptureModal.tsx`):
   - Placeholder modal for Cmd+N quick capture
   - Auto-focuses input when opened
   - Closes on Enter, Esc, or backdrop click
   - Editorial Luxury styling with 0px border-radius

4. **CommandPaletteModal** (`src/components/modals/CommandPaletteModal.tsx`):
   - Placeholder modal for Cmd+K command palette
   - Auto-focuses search input when opened
   - Closes on Esc or close button

5. **ShortcutHint** (`src/components/ui/shortcut-hint.tsx`):
   - Displays keyboard shortcuts in styled kbd elements
   - `ShortcutHint` for split display (e.g., Cmd + K)
   - `ShortcutHintCompact` for inline display (e.g., Cmd+K)

6. **KeyboardShortcutsSection** (`src/components/settings/KeyboardShortcutsSection.tsx`):
   - Settings page section showing all registered shortcuts
   - Groups by category: Global, Navigation, Chat
   - Platform-aware display (Cmd on Mac, Ctrl on Windows)

7. **ChatInput Enhancement**:
   - Added Cmd+Enter handler at component level
   - Clears input after successful send
   - Uses controlled input with useState

8. **Test Coverage**:
   - 39 unit tests in `tests/unit/hooks/useKeyboardShortcuts.spec.ts`
   - 22 E2E tests per browser (66 total) in `tests/e2e/keyboard-shortcuts.spec.ts`
   - All tests passing across Chromium, Firefox, WebKit

**AC Verification:**
- AC#1: Cmd+N opens quick capture - VERIFIED via E2E tests
- AC#2: Cmd+[ toggles sidebar - VERIFIED, wired to layoutStore
- AC#3: Cmd+K opens command palette - VERIFIED via E2E tests
- AC#4: Cmd+Enter sends message - VERIFIED via E2E tests
- AC#5: Esc closes modals/canvas with priority - VERIFIED via E2E tests
- AC#6: No system shortcut conflicts - VERIFIED via E2E tests (Cmd+C, Cmd+V not intercepted)
- AC#7: Shortcut hints in settings - VERIFIED via E2E tests
- AC#8: Shortcuts disabled in inputs (except Esc, Cmd+Enter) - VERIFIED via unit and E2E tests

### File List

**Files Created:**
- `src/hooks/useKeyboardShortcuts.ts`
- `src/components/providers/KeyboardShortcutProvider.tsx`
- `src/components/modals/QuickCaptureModal.tsx`
- `src/components/modals/CommandPaletteModal.tsx`
- `src/components/modals/index.ts`
- `src/components/ui/shortcut-hint.tsx`
- `src/components/settings/KeyboardShortcutsSection.tsx`
- `tests/unit/hooks/useKeyboardShortcuts.spec.ts`
- `tests/e2e/keyboard-shortcuts.spec.ts`

**Files Modified:**
- `src/hooks/index.ts` - Added useKeyboardShortcuts exports
- `src/components/providers/index.ts` - Added KeyboardShortcutProvider export
- `src/components/ui/index.ts` - Added ShortcutHint exports
- `src/components/settings/index.ts` - Added KeyboardShortcutsSection export
- `src/app/layout.tsx` - Added KeyboardShortcutProvider wrapper and modal rendering
- `src/components/chat/ChatInput.tsx` - Added Cmd+Enter handler with controlled input
- `src/app/settings/page.tsx` - Added Keyboard section with KeyboardShortcutsSection
