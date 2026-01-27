/**
 * UI Components - Barrel Export
 *
 * Central export point for all UI components in the Orion Design System.
 *
 * @example
 * import { Button, Input, Textarea, Tooltip } from '@/components/ui'
 */

export { Button, buttonVariants, type ButtonProps } from './button'
export { Input, type InputProps } from './input'
export {
  StatusIndicator,
  statusIndicatorVariants,
  type StatusIndicatorProps,
  type StatusType,
} from './status-indicator'
export { Textarea, type TextareaProps } from './textarea'
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip'
export {
  ShortcutHint,
  ShortcutHintCompact,
  type ShortcutHintProps,
} from './shortcut-hint'
export { VisuallyHidden, type VisuallyHiddenProps } from './visually-hidden'
export { Icon, type IconProps } from './icon'
export { IconButton, type IconButtonProps } from './icon-button'
