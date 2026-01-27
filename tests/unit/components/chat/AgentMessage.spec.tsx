/**
 * AgentMessage Component Tests
 * Phase 2: Message Rendering
 *
 * Test IDs: AGENTMSG-UNIT-001 through AGENTMSG-UNIT-015
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentMessage } from '@/components/chat/AgentMessage'
import { Calendar, User, Mail } from 'lucide-react'

describe('AgentMessage Component', () => {
  describe('Layout and Structure', () => {
    it('AGENTMSG-UNIT-001: should render with flex layout and gap', () => {
      render(<AgentMessage content="Test response" />)
      const container = screen.getByTestId('agent-message')
      expect(container).toHaveClass('flex', 'items-start', 'gap-3')
    })

    it('AGENTMSG-UNIT-002: should have gold dot indicator', () => {
      render(<AgentMessage content="Test response" />)
      const dot = screen.getByTestId('agent-message-dot')
      expect(dot).toHaveClass('bg-orion-gold')
      expect(dot).toHaveClass('w-1.5', 'h-1.5')
    })

    it('AGENTMSG-UNIT-003: should have cream background (#FAF8F5)', () => {
      render(<AgentMessage content="Test response" />)
      const bubble = screen.getByTestId('agent-message-bubble')
      expect(bubble).toHaveClass('bg-orion-surface')
    })

    it('AGENTMSG-UNIT-004: should have dark text (#1A1A1A)', () => {
      render(<AgentMessage content="Test response" />)
      // With ReactMarkdown, text is in <p>, so check the prose container
      const bubble = screen.getByTestId('agent-message-bubble')
      const proseContainer = bubble.querySelector('.prose')
      expect(proseContainer).toHaveClass('text-orion-fg')
    })

    it('AGENTMSG-UNIT-005: should have correct padding (px-5 py-3.5)', () => {
      render(<AgentMessage content="Test response" />)
      const bubble = screen.getByTestId('agent-message-bubble')
      expect(bubble).toHaveClass('px-5', 'py-3.5')
    })

    it('AGENTMSG-UNIT-006: should constrain width to 85%', () => {
      render(<AgentMessage content="Test response" />)
      const bubble = screen.getByTestId('agent-message-bubble')
      expect(bubble).toHaveClass('max-w-[85%]')
    })
  })

  describe('Content Display', () => {
    it('AGENTMSG-UNIT-007: should display the provided content', () => {
      render(<AgentMessage content="I've drafted the email for you." />)
      expect(screen.getByText("I've drafted the email for you.")).toBeInTheDocument()
    })

    it('AGENTMSG-UNIT-008: should have 14px font size with relaxed leading', () => {
      render(<AgentMessage content="Test response" />)
      // With ReactMarkdown, text is in <p>, so check the prose container
      const bubble = screen.getByTestId('agent-message-bubble')
      const proseContainer = bubble.querySelector('.prose')
      expect(proseContainer).toHaveClass('text-[14px]', 'leading-relaxed')
    })

    it('AGENTMSG-UNIT-009: should render markdown bold text', () => {
      render(<AgentMessage content="Sarah is available **Tuesday at 2pm**" />)
      const strong = screen.getByText('Tuesday at 2pm')
      expect(strong.tagName).toBe('STRONG')
    })
  })

  describe('ActivityBar Integration', () => {
    it('AGENTMSG-UNIT-010: should render ActivityBar when activity prop is provided', () => {
      render(
        <AgentMessage
          content="Test response"
          activity={{
            summary: 'Checked calendar, found contact',
            durationMs: 2800,
            tools: [
              { icon: <Calendar className="w-4 h-4" />, label: 'Found 3 slots', status: 'complete' }
            ]
          }}
        />
      )
      expect(screen.getByTestId('activity-bar')).toBeInTheDocument()
      expect(screen.getByText('Checked calendar, found contact')).toBeInTheDocument()
    })

    it('AGENTMSG-UNIT-011: should NOT render ActivityBar when activity prop is absent', () => {
      render(<AgentMessage content="Test response" />)
      expect(screen.queryByTestId('activity-bar')).not.toBeInTheDocument()
    })
  })

  describe('ArtifactCard Integration', () => {
    it('AGENTMSG-UNIT-012: should render ArtifactCard when artifact prop is provided', () => {
      render(
        <AgentMessage
          content="Test response"
          artifact={{
            type: 'email',
            title: 'Q4 Roadmap Discussion',
            preview: <p>To: sarah.chen@company.com</p>
          }}
        />
      )
      expect(screen.getByTestId('artifact-card')).toBeInTheDocument()
    })

    it('AGENTMSG-UNIT-013: should NOT render ArtifactCard when artifact prop is absent', () => {
      render(<AgentMessage content="Test response" />)
      expect(screen.queryByTestId('artifact-card')).not.toBeInTheDocument()
    })

    it('AGENTMSG-UNIT-014: should call onArtifactClick when artifact card is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <AgentMessage
          content="Test response"
          artifact={{
            type: 'email',
            title: 'Q4 Roadmap Discussion',
            preview: <p>To: sarah.chen@company.com</p>
          }}
          onArtifactClick={handleClick}
        />
      )

      await user.click(screen.getByTestId('artifact-card'))
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('AGENTMSG-UNIT-015: should have article role for semantic markup', () => {
      render(<AgentMessage content="Test response" />)
      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()
    })
  })
})
