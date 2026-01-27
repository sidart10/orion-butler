/**
 * Vitest Test Setup
 *
 * This file configures the testing environment for React component tests.
 * Story 1.11: Added matchMedia mock for responsive breakpoint hooks
 */

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Mock localStorage for tests that need it
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

// Mock window.matchMedia for responsive hooks
// Default: desktop breakpoint (>=1280px) - sidebar expanded, canvas in-flow
beforeAll(() => {
  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: localStorageMock,
  })

  // Setup matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, // Default to desktop (not laptop/tablet/mobile)
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
