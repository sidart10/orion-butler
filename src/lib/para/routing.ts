/**
 * Inbox Item Auto-Routing
 * Story 4.16: Inbox Item Auto-Routing
 *
 * Routes inbox items to appropriate PARA destinations based on:
 * 1. Schema fields (highest priority): target_project, target_area, priority, type
 * 2. Content analysis (medium priority): keyword detection
 * 3. Default routing (lowest priority): type-based fallback
 */

import type { InboxItem } from '@/lib/para/schemas/inbox';

// =============================================================================
// Types
// =============================================================================

/**
 * Possible routing destinations in the PARA system
 */
export type RoutingDestination = 'project' | 'area' | 'resource' | 'someday';

/**
 * Confidence level for routing decisions
 */
export type RoutingConfidence = 'high' | 'medium' | 'low';

/**
 * Result of routing an inbox item
 */
export interface RoutingDecision {
  /** Destination category in PARA */
  destination: RoutingDestination;
  /** Confidence in the routing decision */
  confidence: RoutingConfidence;
  /** Human-readable explanation for the routing */
  reasoning: string;
  /** Suggested target ID (project or area) if explicitly set */
  suggested_target?: string;
}

// =============================================================================
// Keyword Patterns
// =============================================================================

/** Keywords indicating deadline/time-bound items -> project */
const DEADLINE_KEYWORDS = [
  'deadline',
  'due by',
  'due tomorrow',
  'due next',
  'by friday',
  'by monday',
  'by tuesday',
  'by wednesday',
  'by thursday',
  'by saturday',
  'by sunday',
  'urgent',
  'asap',
  'time-sensitive',
];

/** Keywords indicating reference materials -> resource */
const REFERENCE_KEYWORDS = [
  'reference',
  'bookmark',
  'article',
  'documentation',
  'save for',
  'for future reference',
  'keep for',
  'archive this',
];

/** Keywords indicating ongoing responsibilities -> area */
const ONGOING_KEYWORDS = [
  'ongoing',
  'recurring',
  'routine',
  'maintenance',
  'regular',
  'daily',
  'weekly',
  'monthly',
  'annual',
];

/** Keywords indicating someday/maybe items -> someday */
const SOMEDAY_KEYWORDS = [
  'someday',
  'maybe',
  'might',
  'one day',
  'eventually',
  'would be nice',
  'could be',
  'possibly',
  'might be interesting',
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if text contains any of the given keywords (case-insensitive)
 */
function containsKeyword(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Get combined text from title and content for keyword analysis
 * Limits to first 1000 chars for performance
 */
function getSearchableText(item: InboxItem): string {
  const title = item.title || '';
  const content = item.content || '';
  const combined = `${title} ${content}`;
  return combined.slice(0, 1000);
}

// =============================================================================
// Main Routing Function
// =============================================================================

/**
 * Route an inbox item to the appropriate PARA destination
 *
 * Routing priority:
 * 1. Explicit target_project -> project (high confidence)
 * 2. Explicit target_area -> area (high confidence)
 * 3. High priority (>=70) -> project (high confidence)
 * 4. Type = reference -> resource (high confidence)
 * 5. Type = idea + low priority -> someday (medium confidence)
 * 6. Deadline keywords -> project (medium confidence)
 * 7. Reference keywords -> resource (medium confidence)
 * 8. Ongoing keywords -> area (medium confidence)
 * 9. Someday keywords -> someday (medium/low confidence)
 * 10. Default by type (low confidence)
 *
 * @param item The inbox item to route
 * @returns Routing decision with destination, confidence, and reasoning
 */
export function routeInboxItem(item: InboxItem): RoutingDecision {
  // ---------------------------------------------------------------------------
  // 1. Explicit target_project (highest priority)
  // ---------------------------------------------------------------------------
  if (item.target_project) {
    return {
      destination: 'project',
      confidence: 'high',
      reasoning: 'Explicit target project specified',
      suggested_target: item.target_project,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Explicit target_area (highest priority)
  // ---------------------------------------------------------------------------
  if (item.target_area) {
    return {
      destination: 'area',
      confidence: 'high',
      reasoning: 'Explicit target area specified',
      suggested_target: item.target_area,
    };
  }

  // ---------------------------------------------------------------------------
  // 3. High priority (>=70) -> project
  // ---------------------------------------------------------------------------
  if (item.priority_score !== undefined && item.priority_score >= 70) {
    const hasDueDate = !!item.due_date;
    return {
      destination: 'project',
      confidence: 'high',
      reasoning: hasDueDate
        ? `High priority (${item.priority_score}) with due date - time-bound actionable item`
        : `High priority (${item.priority_score}) - urgent actionable item`,
    };
  }

  // ---------------------------------------------------------------------------
  // 4. Type = reference -> resource
  // ---------------------------------------------------------------------------
  if (item.type === 'reference') {
    return {
      destination: 'resource',
      confidence: 'high',
      reasoning: 'Reference type indicates resource material',
    };
  }

  // ---------------------------------------------------------------------------
  // 5. Type = idea + low priority -> someday
  // ---------------------------------------------------------------------------
  if (
    item.type === 'idea' &&
    item.priority_score !== undefined &&
    item.priority_score < 50 &&
    !item.due_date
  ) {
    return {
      destination: 'someday',
      confidence: 'medium',
      reasoning: 'Low priority idea without deadline - suitable for someday/maybe',
    };
  }

  // ---------------------------------------------------------------------------
  // 6-9. Content analysis (keyword detection)
  // ---------------------------------------------------------------------------
  const searchText = getSearchableText(item);

  // 6. Deadline keywords -> project
  if (containsKeyword(searchText, DEADLINE_KEYWORDS)) {
    return {
      destination: 'project',
      confidence: 'medium',
      reasoning: 'Deadline or time-sensitive keyword detected',
    };
  }

  // 7. Reference keywords -> resource (before ongoing to catch "for future reference")
  if (containsKeyword(searchText, REFERENCE_KEYWORDS)) {
    return {
      destination: 'resource',
      confidence: 'medium',
      reasoning: 'Reference or bookmark keyword detected',
    };
  }

  // 8. Ongoing keywords -> area
  if (containsKeyword(searchText, ONGOING_KEYWORDS)) {
    return {
      destination: 'area',
      confidence: 'medium',
      reasoning: 'Ongoing or recurring keyword detected',
    };
  }

  // 9. Someday keywords -> someday
  if (containsKeyword(searchText, SOMEDAY_KEYWORDS)) {
    // "might" alone gets low confidence, others get medium
    const hasMightOnly =
      searchText.toLowerCase().includes('might') &&
      !containsKeyword(searchText, SOMEDAY_KEYWORDS.filter((k) => k !== 'might' && k !== 'might be interesting'));
    return {
      destination: 'someday',
      confidence: hasMightOnly ? 'low' : 'medium',
      reasoning: 'Someday/maybe keyword detected',
    };
  }

  // ---------------------------------------------------------------------------
  // 10. Default routing by type (lowest priority)
  // ---------------------------------------------------------------------------
  switch (item.type) {
    case 'task':
      return {
        destination: 'project',
        confidence: 'low',
        reasoning: 'Task type defaults to project for action tracking',
      };

    case 'note':
      return {
        destination: 'resource',
        confidence: 'low',
        reasoning: 'Note type defaults to resource for reference',
      };

    case 'idea':
      return {
        destination: 'someday',
        confidence: 'medium',
        reasoning: 'Idea type defaults to someday for future exploration',
      };

    case 'capture':
      return {
        destination: 'project',
        confidence: 'low',
        reasoning: 'Capture type defaults to project for processing',
      };

    default:
      // Fallback for any unexpected types
      return {
        destination: 'project',
        confidence: 'low',
        reasoning: 'No routing signals detected, defaulting to project',
      };
  }
}
