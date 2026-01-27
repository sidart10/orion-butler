/**
 * Canvas Store Unit Tests
 * Story 1.6: Canvas Column Placeholder
 *
 * Tests for the Zustand canvas store that manages canvas visibility state.
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { useCanvasStore } from '@/stores/canvasStore'

describe('canvasStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    useCanvasStore.setState({ isCanvasOpen: false })
  })

  test('1.6-UNIT-001: initial state is closed', () => {
    const { isCanvasOpen } = useCanvasStore.getState()
    expect(isCanvasOpen).toBe(false)
  })

  test('1.6-UNIT-002: openCanvas sets isCanvasOpen to true', () => {
    const store = useCanvasStore.getState()
    store.openCanvas()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(true)
  })

  test('1.6-UNIT-003: closeCanvas sets isCanvasOpen to false', () => {
    useCanvasStore.setState({ isCanvasOpen: true })
    useCanvasStore.getState().closeCanvas()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
  })

  test('1.6-UNIT-004: toggleCanvas alternates state', () => {
    const store = useCanvasStore.getState()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)

    store.toggleCanvas()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(true)

    store.toggleCanvas()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
  })

  test('multiple rapid toggles work correctly', () => {
    const store = useCanvasStore.getState()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)

    // Toggle 5 times: false -> true -> false -> true -> false -> true
    for (let i = 0; i < 5; i++) {
      store.toggleCanvas()
    }
    expect(useCanvasStore.getState().isCanvasOpen).toBe(true)
  })

  test('openCanvas is idempotent', () => {
    const store = useCanvasStore.getState()
    store.openCanvas()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(true)

    // Calling again should not change anything
    store.openCanvas()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(true)
  })

  test('closeCanvas is idempotent', () => {
    const store = useCanvasStore.getState()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)

    // Calling when already closed should not change anything
    store.closeCanvas()
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
  })
})
