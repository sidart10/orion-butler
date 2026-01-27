/**
 * Icon Catalog Tests
 * Story 1.20: Icon System
 *
 * Tests for the centralized icon catalog that provides a single source of truth
 * for which Lucide icons are used in the application.
 */

import { describe, it, expect } from 'vitest'
import { icons, type IconCategory, type IconName } from '@/lib/icon-catalog'
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  Plus,
  Search,
  Settings,
  Home,
  Inbox,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash,
  Edit,
  Copy,
} from 'lucide-react'

describe('Icon Catalog', () => {
  /**
   * Test: 1.20-UNIT-200
   * Category: Icon catalog exports all expected categories
   */
  it('[1.20-UNIT-200] exports navigation, actions, gtd, and status categories', () => {
    expect(icons).toHaveProperty('navigation')
    expect(icons).toHaveProperty('actions')
    expect(icons).toHaveProperty('gtd')
    expect(icons).toHaveProperty('status')
  })

  describe('Navigation Icons', () => {
    /**
     * Test: 1.20-UNIT-201
     * Category: Navigation icons include Menu
     */
    it('[1.20-UNIT-201] includes Menu icon', () => {
      expect(icons.navigation.menu).toBe(Menu)
    })

    /**
     * Test: 1.20-UNIT-202
     * Category: Navigation icons include X (close)
     */
    it('[1.20-UNIT-202] includes X (close) icon', () => {
      expect(icons.navigation.close).toBe(X)
    })

    /**
     * Test: 1.20-UNIT-203
     * Category: Navigation icons include chevrons
     */
    it('[1.20-UNIT-203] includes chevron icons', () => {
      expect(icons.navigation.chevronLeft).toBe(ChevronLeft)
      expect(icons.navigation.chevronRight).toBe(ChevronRight)
      expect(icons.navigation.chevronDown).toBe(ChevronDown)
      expect(icons.navigation.chevronUp).toBe(ChevronUp)
    })
  })

  describe('Action Icons', () => {
    /**
     * Test: 1.20-UNIT-204
     * Category: Action icons include send
     */
    it('[1.20-UNIT-204] includes send icon', () => {
      expect(icons.actions.send).toBe(Send)
    })

    /**
     * Test: 1.20-UNIT-205
     * Category: Action icons include plus, search, settings
     */
    it('[1.20-UNIT-205] includes plus, search, settings icons', () => {
      expect(icons.actions.plus).toBe(Plus)
      expect(icons.actions.search).toBe(Search)
      expect(icons.actions.settings).toBe(Settings)
    })

    /**
     * Test: 1.20-UNIT-206
     * Category: Action icons include edit, copy, trash
     */
    it('[1.20-UNIT-206] includes edit, copy, trash icons', () => {
      expect(icons.actions.edit).toBe(Edit)
      expect(icons.actions.copy).toBe(Copy)
      expect(icons.actions.trash).toBe(Trash)
    })
  })

  describe('GTD Icons', () => {
    /**
     * Test: 1.20-UNIT-207
     * Category: GTD icons include home and inbox
     */
    it('[1.20-UNIT-207] includes home and inbox icons', () => {
      expect(icons.gtd.home).toBe(Home)
      expect(icons.gtd.inbox).toBe(Inbox)
    })

    /**
     * Test: 1.20-UNIT-208
     * Category: GTD icons include calendar, clock, star
     */
    it('[1.20-UNIT-208] includes calendar, clock, star icons', () => {
      expect(icons.gtd.calendar).toBe(Calendar)
      expect(icons.gtd.clock).toBe(Clock)
      expect(icons.gtd.star).toBe(Star)
    })
  })

  describe('Status Icons', () => {
    /**
     * Test: 1.20-UNIT-209
     * Category: Status icons include checkCircle
     */
    it('[1.20-UNIT-209] includes checkCircle icon', () => {
      expect(icons.status.checkCircle).toBe(CheckCircle)
    })

    /**
     * Test: 1.20-UNIT-210
     * Category: Status icons include alertCircle
     */
    it('[1.20-UNIT-210] includes alertCircle icon', () => {
      expect(icons.status.alertCircle).toBe(AlertCircle)
    })

    /**
     * Test: 1.20-UNIT-211
     * Category: Status icons include loader
     */
    it('[1.20-UNIT-211] includes loader icon', () => {
      expect(icons.status.loader).toBe(Loader2)
    })
  })

  describe('Type Safety', () => {
    /**
     * Test: 1.20-UNIT-212
     * Category: IconCategory type works for all categories
     */
    it('[1.20-UNIT-212] IconCategory type includes all categories', () => {
      const categories: IconCategory[] = ['navigation', 'actions', 'gtd', 'status']
      categories.forEach((category) => {
        expect(icons[category]).toBeDefined()
      })
    })

    /**
     * Test: 1.20-UNIT-213
     * Category: IconName type works for navigation category
     */
    it('[1.20-UNIT-213] IconName type works for navigation category', () => {
      const navIcons: IconName<'navigation'>[] = [
        'menu',
        'close',
        'chevronLeft',
        'chevronRight',
        'chevronDown',
        'chevronUp',
      ]
      navIcons.forEach((iconName) => {
        expect(icons.navigation[iconName]).toBeDefined()
      })
    })

    /**
     * Test: 1.20-UNIT-214
     * Category: All icons are valid Lucide components (have displayName or name)
     */
    it('[1.20-UNIT-214] all icons are valid React components', () => {
      Object.values(icons).forEach((category) => {
        Object.values(category).forEach((icon) => {
          // Lucide icons are forwardRef components with displayName
          expect(typeof icon).toBe('object')
          expect(icon).toHaveProperty('$$typeof')
        })
      })
    })
  })
})
