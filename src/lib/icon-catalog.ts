/**
 * Icon Catalog - Centralized icon reference
 * Story 1.20: Icon System
 *
 * This provides a single source of truth for which Lucide icons
 * are used in the application, organized by category.
 *
 * Benefits:
 * - Easy to audit which icons are used
 * - Prevents duplicate imports of similar icons
 * - Enables future icon migration (e.g., to custom SVGs)
 * - Type-safe icon references via IconCategory and IconName types
 *
 * @example
 * // Import icons by category
 * import { icons } from '@/lib/icon-catalog'
 * <Icon icon={icons.navigation.menu} size="lg" />
 *
 * @example
 * // Direct import still works for components
 * import { Menu } from 'lucide-react'
 * import { Icon } from '@/components/ui'
 * <Icon icon={Menu} />
 */

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
  // Add more as components are migrated
} from 'lucide-react'

/**
 * Centralized icon catalog organized by category
 *
 * Categories:
 * - navigation: Menu, close, chevrons for navigation UI
 * - actions: Common action icons (send, edit, delete, etc.)
 * - gtd: GTD/productivity related icons (inbox, calendar, etc.)
 * - status: Status indicators (success, error, loading)
 */
export const icons = {
  // Navigation icons - menu controls, directional navigation
  navigation: {
    menu: Menu,
    close: X,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
  },

  // Action icons - user interactions
  actions: {
    send: Send,
    plus: Plus,
    search: Search,
    settings: Settings,
    edit: Edit,
    copy: Copy,
    trash: Trash,
  },

  // GTD/Sidebar icons - productivity features
  gtd: {
    home: Home,
    inbox: Inbox,
    calendar: Calendar,
    clock: Clock,
    star: Star,
  },

  // Status icons - feedback and state indicators
  status: {
    checkCircle: CheckCircle,
    alertCircle: AlertCircle,
    loader: Loader2,
  },
} as const

/**
 * Type representing available icon categories
 * @example
 * const category: IconCategory = 'navigation' // valid
 * const category: IconCategory = 'invalid' // TypeScript error
 */
export type IconCategory = keyof typeof icons

/**
 * Type representing icon names within a specific category
 * @example
 * const navIcon: IconName<'navigation'> = 'menu' // valid
 * const navIcon: IconName<'navigation'> = 'send' // TypeScript error (send is in 'actions')
 */
export type IconName<T extends IconCategory> = keyof (typeof icons)[T]
