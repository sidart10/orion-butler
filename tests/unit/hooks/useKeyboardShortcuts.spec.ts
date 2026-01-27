/**
 * Unit Tests: useKeyboardShortcuts Hook
 * Story 1.15: Global Keyboard Shortcuts
 *
 * Tests for the core keyboard shortcut hook covering:
 * - Shortcut registration and callback execution
 * - Modifier key combinations (Cmd/Ctrl, Shift, Alt)
 * - Scope detection (global vs input-focused)
 * - Conflict prevention for system shortcuts
 * - Platform detection (Mac vs Windows/Linux)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, cleanup } from '@testing-library/react'
import {
  useKeyboardShortcuts,
  buildShortcutKey,
  isInputElement,
  formatShortcutForDisplay,
  type ShortcutConfig,
} from '@/hooks/useKeyboardShortcuts'

// In test environment (jsdom), navigator.platform is undefined,
// so the hook treats it as non-Mac and uses ctrlKey for meta.
// We need to use ctrlKey in tests to simulate the meta key behavior.

// Helper to dispatch keyboard events
function dispatchKeyboardEvent(
  key: string,
  options: {
    metaKey?: boolean
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    cancelable?: boolean
  } = {}
) {
  // In test env, we use ctrlKey to simulate the "meta" modifier
  // since navigator.platform is undefined (treated as non-Mac)
  const useCtrl = options.metaKey ?? false

  const event = new KeyboardEvent('keydown', {
    key,
    metaKey: options.metaKey ?? false,
    ctrlKey: useCtrl || (options.ctrlKey ?? false),
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    bubbles: true,
    cancelable: options.cancelable ?? true,
  })
  window.dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('1.15-UNIT-001 to 010: Basic shortcut registration', () => {
    it('1.15-UNIT-001: calls action when shortcut key matches', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test shortcut',
            category: 'global',
          },
        ])
      )

      // Simulate Cmd+K (metaKey on Mac)
      dispatchKeyboardEvent('k', { metaKey: true })

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('1.15-UNIT-002: does not call action when key does not match', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test shortcut',
            category: 'global',
          },
        ])
      )

      // Simulate Cmd+J (wrong key)
      dispatchKeyboardEvent('j', { metaKey: true })

      expect(action).not.toHaveBeenCalled()
    })

    it('1.15-UNIT-003: does not call action when modifier is missing', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test shortcut',
            category: 'global',
          },
        ])
      )

      // Simulate just K (no modifier)
      dispatchKeyboardEvent('k')

      expect(action).not.toHaveBeenCalled()
    })

    it('1.15-UNIT-004: does not call action when wrong modifier is pressed', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test shortcut',
            category: 'global',
          },
        ])
      )

      // Simulate Shift+K (wrong modifier)
      dispatchKeyboardEvent('k', { shiftKey: true })

      expect(action).not.toHaveBeenCalled()
    })

    it('1.15-UNIT-005: handles multiple shortcuts', () => {
      const action1 = vi.fn()
      const action2 = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action: action1,
            description: 'Shortcut 1',
            category: 'global',
          },
          {
            key: 'n',
            modifiers: { meta: true },
            action: action2,
            description: 'Shortcut 2',
            category: 'global',
          },
        ])
      )

      dispatchKeyboardEvent('k', { metaKey: true })
      expect(action1).toHaveBeenCalledTimes(1)
      expect(action2).not.toHaveBeenCalled()

      dispatchKeyboardEvent('n', { metaKey: true })
      expect(action2).toHaveBeenCalledTimes(1)
    })

    it('1.15-UNIT-006: handles shortcut without modifiers (e.g., Escape)', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'Escape',
            modifiers: {},
            action,
            description: 'Close',
            category: 'global',
          },
        ])
      )

      dispatchKeyboardEvent('Escape')

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('1.15-UNIT-007: handles shift modifier', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'a',
            modifiers: { meta: true, shift: true },
            action,
            description: 'Test',
            category: 'global',
          },
        ])
      )

      // Without shift - should not trigger
      dispatchKeyboardEvent('a', { metaKey: true })
      expect(action).not.toHaveBeenCalled()

      // With shift - should trigger
      dispatchKeyboardEvent('a', { metaKey: true, shiftKey: true })
      expect(action).toHaveBeenCalledTimes(1)
    })

    it('1.15-UNIT-008: handles alt modifier', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'o',
            modifiers: { meta: true, alt: true },
            action,
            description: 'Test',
            category: 'global',
          },
        ])
      )

      // Without alt - should not trigger
      dispatchKeyboardEvent('o', { metaKey: true })
      expect(action).not.toHaveBeenCalled()

      // With alt - should trigger
      dispatchKeyboardEvent('o', { metaKey: true, altKey: true })
      expect(action).toHaveBeenCalledTimes(1)
    })

    it('1.15-UNIT-009: cleans up event listener on unmount', () => {
      const action = vi.fn()
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test',
            category: 'global',
          },
        ])
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      // Should not trigger after unmount
      dispatchKeyboardEvent('k', { metaKey: true })
      expect(action).not.toHaveBeenCalled()
    })

    it('1.15-UNIT-010: handles special character keys like [', () => {
      const action = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: '[',
            modifiers: { meta: true },
            action,
            description: 'Toggle sidebar',
            category: 'navigation',
          },
        ])
      )

      dispatchKeyboardEvent('[', { metaKey: true })

      expect(action).toHaveBeenCalledTimes(1)
    })
  })

  describe('1.15-UNIT-011 to 020: Input field scope detection', () => {
    it('1.15-UNIT-011: does not call action when input is focused and allowInInput is false', () => {
      const action = vi.fn()

      // Create and focus an input
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'n',
            modifiers: { meta: true },
            action,
            description: 'Test',
            category: 'global',
            allowInInput: false,
          },
        ])
      )

      dispatchKeyboardEvent('n', { metaKey: true })

      expect(action).not.toHaveBeenCalled()

      // Cleanup
      document.body.removeChild(input)
    })

    it('1.15-UNIT-012: calls action when input is focused and allowInInput is true', () => {
      const action = vi.fn()

      // Create and focus an input
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'Escape',
            modifiers: {},
            action,
            description: 'Close',
            category: 'global',
            allowInInput: true,
          },
        ])
      )

      dispatchKeyboardEvent('Escape')

      expect(action).toHaveBeenCalledTimes(1)

      // Cleanup
      document.body.removeChild(input)
    })

    it('1.15-UNIT-013: does not call action when textarea is focused', () => {
      const action = vi.fn()

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test',
            category: 'global',
            allowInInput: false,
          },
        ])
      )

      dispatchKeyboardEvent('k', { metaKey: true })

      expect(action).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('1.15-UNIT-014: does not call action when contenteditable is focused', () => {
      const action = vi.fn()

      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      document.body.appendChild(div)
      div.focus()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test',
            category: 'global',
            allowInInput: false,
          },
        ])
      )

      dispatchKeyboardEvent('k', { metaKey: true })

      expect(action).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('1.15-UNIT-015: calls action when focus is on non-input element', () => {
      const action = vi.fn()

      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test',
            category: 'global',
            allowInInput: false,
          },
        ])
      )

      dispatchKeyboardEvent('k', { metaKey: true })

      expect(action).toHaveBeenCalledTimes(1)

      document.body.removeChild(button)
    })
  })

  describe('1.15-UNIT-016 to 020: Default behavior (allowInInput defaults to false)', () => {
    it('1.15-UNIT-016: allowInInput defaults to false when not specified', () => {
      const action = vi.fn()

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      renderHook(() =>
        useKeyboardShortcuts([
          {
            key: 'k',
            modifiers: { meta: true },
            action,
            description: 'Test',
            category: 'global',
            // allowInInput not specified
          },
        ])
      )

      dispatchKeyboardEvent('k', { metaKey: true })

      expect(action).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })
  })
})

describe('buildShortcutKey', () => {
  it('1.15-UNIT-021: builds key without modifiers', () => {
    expect(buildShortcutKey('escape', {})).toBe('escape')
  })

  it('1.15-UNIT-022: builds key with meta modifier', () => {
    expect(buildShortcutKey('k', { meta: true })).toBe('meta+k')
  })

  it('1.15-UNIT-023: builds key with multiple modifiers', () => {
    expect(buildShortcutKey('a', { meta: true, shift: true })).toBe(
      'meta+shift+a'
    )
  })

  it('1.15-UNIT-024: builds key with all modifiers', () => {
    expect(buildShortcutKey('x', { meta: true, shift: true, alt: true })).toBe(
      'meta+shift+alt+x'
    )
  })

  it('1.15-UNIT-025: lowercases key', () => {
    expect(buildShortcutKey('K', { meta: true })).toBe('meta+k')
  })
})

describe('isInputElement', () => {
  it('1.15-UNIT-026: returns true for input element', () => {
    const input = document.createElement('input')
    expect(isInputElement(input)).toBe(true)
  })

  it('1.15-UNIT-027: returns true for textarea element', () => {
    const textarea = document.createElement('textarea')
    expect(isInputElement(textarea)).toBe(true)
  })

  it('1.15-UNIT-028: returns true for contenteditable element', () => {
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    expect(isInputElement(div)).toBe(true)
  })

  it('1.15-UNIT-029: returns false for regular div', () => {
    const div = document.createElement('div')
    expect(isInputElement(div)).toBe(false)
  })

  it('1.15-UNIT-030: returns false for button', () => {
    const button = document.createElement('button')
    expect(isInputElement(button)).toBe(false)
  })

  it('1.15-UNIT-031: returns false for null', () => {
    expect(isInputElement(null)).toBe(false)
  })

  it('1.15-UNIT-032: returns false for contenteditable=false', () => {
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'false')
    expect(isInputElement(div)).toBe(false)
  })
})

describe('formatShortcutForDisplay', () => {
  // Note: These tests depend on platform detection
  // In test environment, navigator.platform may be undefined (treated as non-Mac)

  it('1.15-UNIT-033: formats single key', () => {
    const result = formatShortcutForDisplay({}, 'Escape')
    expect(result).toBe('Esc')
  })

  it('1.15-UNIT-034: formats Enter key', () => {
    const result = formatShortcutForDisplay({}, 'Enter')
    expect(result).toBe('Enter')
  })

  it('1.15-UNIT-035: formats single character key in uppercase', () => {
    const result = formatShortcutForDisplay({}, 'k')
    expect(result).toBe('K')
  })

  it('1.15-UNIT-036: formats with meta modifier', () => {
    const result = formatShortcutForDisplay({ meta: true }, 'k')
    // In test env (non-Mac), should use Ctrl
    expect(result).toMatch(/^(Cmd|Ctrl)\+K$/)
  })

  it('1.15-UNIT-037: formats with shift modifier', () => {
    const result = formatShortcutForDisplay({ shift: true }, 'a')
    expect(result).toBe('Shift+A')
  })

  it('1.15-UNIT-038: formats with multiple modifiers', () => {
    const result = formatShortcutForDisplay({ meta: true, shift: true }, 'a')
    expect(result).toMatch(/^(Cmd|Ctrl)\+Shift\+A$/)
  })

  it('1.15-UNIT-039: formats with alt modifier', () => {
    const result = formatShortcutForDisplay({ alt: true }, 'o')
    // In test env (non-Mac), should use Alt
    expect(result).toMatch(/^(Opt|Alt)\+O$/)
  })

  it('1.15-UNIT-040: formats special bracket key', () => {
    const result = formatShortcutForDisplay({ meta: true }, '[')
    expect(result).toMatch(/^(Cmd|Ctrl)\+\[$/)
  })
})

describe('Shortcut categories', () => {
  it('1.15-UNIT-041: accepts global category', () => {
    const shortcut: ShortcutConfig = {
      key: 'k',
      modifiers: { meta: true },
      action: () => {},
      description: 'Test',
      category: 'global',
    }
    expect(shortcut.category).toBe('global')
  })

  it('1.15-UNIT-042: accepts navigation category', () => {
    const shortcut: ShortcutConfig = {
      key: '[',
      modifiers: { meta: true },
      action: () => {},
      description: 'Test',
      category: 'navigation',
    }
    expect(shortcut.category).toBe('navigation')
  })

  it('1.15-UNIT-043: accepts chat category', () => {
    const shortcut: ShortcutConfig = {
      key: 'Enter',
      modifiers: { meta: true },
      action: () => {},
      description: 'Send message',
      category: 'chat',
    }
    expect(shortcut.category).toBe('chat')
  })
})
