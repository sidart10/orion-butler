/**
 * Chat Module Export Tests
 * Story 1.5: Main Chat Column
 *
 * Test ID: 1.5-UNIT-008
 */

import { describe, it, expect } from 'vitest'
import { ChatColumn, MessageArea, ChatInput } from '@/components/chat'

describe('Chat module exports', () => {
  it('1.5-UNIT-008a: should export ChatColumn', () => {
    expect(ChatColumn).toBeDefined()
  })

  it('1.5-UNIT-008b: should export MessageArea', () => {
    expect(MessageArea).toBeDefined()
  })

  it('1.5-UNIT-008c: should export ChatInput', () => {
    expect(ChatInput).toBeDefined()
  })
})
