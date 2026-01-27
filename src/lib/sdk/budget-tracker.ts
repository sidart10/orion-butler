/**
 * Budget Tracker
 * Story 2.3: Cost and token tracking
 *
 * Per NFR-5.7: Track tokens and emit 80% warning
 */

export interface BudgetStatus {
  /** Whether budget has been exceeded */
  exceedsBudget: boolean;
  /** Whether 80% warning threshold has been crossed */
  warningThreshold: boolean;
  /** Current accumulated cost in USD */
  currentCostUsd: number;
  /** Current accumulated token count */
  currentTokens: number;
}

/**
 * Tracks accumulated costs and tokens for a query session
 */
export class BudgetTracker {
  private accumulatedCostUsd: number = 0;
  private accumulatedTokens: number = 0;
  private readonly maxBudgetUsd: number | null;
  private readonly warningThresholdPercent: number = 0.8; // 80% per NFR-5.7
  private warningEmitted: boolean = false;

  /**
   * Create a new budget tracker
   * @param maxBudgetUsd - Maximum allowed cost in USD (null for unlimited)
   */
  constructor(maxBudgetUsd?: number) {
    this.maxBudgetUsd = maxBudgetUsd ?? null;
  }

  /**
   * Add cost and tokens to the accumulated totals
   * @param costUsd - Cost to add in USD
   * @param tokens - Token count to add
   * @returns Budget status after addition
   */
  addCost(costUsd: number, tokens: number): BudgetStatus {
    this.accumulatedCostUsd += costUsd;
    this.accumulatedTokens += tokens;

    const exceedsBudget =
      this.maxBudgetUsd !== null &&
      this.accumulatedCostUsd >= this.maxBudgetUsd;

    // Only trigger warning once
    let warningThreshold = false;
    if (
      !this.warningEmitted &&
      this.maxBudgetUsd !== null &&
      this.accumulatedCostUsd >= this.maxBudgetUsd * this.warningThresholdPercent
    ) {
      warningThreshold = true;
      this.warningEmitted = true;
    }

    return {
      exceedsBudget,
      warningThreshold,
      currentCostUsd: this.accumulatedCostUsd,
      currentTokens: this.accumulatedTokens,
    };
  }

  /**
   * Reset all accumulated values
   */
  reset(): void {
    this.accumulatedCostUsd = 0;
    this.accumulatedTokens = 0;
    this.warningEmitted = false;
  }

  /**
   * Get current accumulated cost
   */
  get currentCostUsd(): number {
    return this.accumulatedCostUsd;
  }

  /**
   * Get current accumulated tokens
   */
  get currentTokens(): number {
    return this.accumulatedTokens;
  }

  /**
   * Get configured max budget (null if unlimited)
   */
  get budget(): number | null {
    return this.maxBudgetUsd;
  }

  /**
   * Check if budget has been exceeded
   */
  get isExceeded(): boolean {
    return this.maxBudgetUsd !== null &&
           this.accumulatedCostUsd >= this.maxBudgetUsd;
  }

  /**
   * Get remaining budget (null if unlimited)
   */
  get remaining(): number | null {
    if (this.maxBudgetUsd === null) return null;
    return Math.max(0, this.maxBudgetUsd - this.accumulatedCostUsd);
  }

  /**
   * Get budget usage percentage (null if unlimited)
   */
  get usagePercent(): number | null {
    if (this.maxBudgetUsd === null || this.maxBudgetUsd === 0) return null;
    return (this.accumulatedCostUsd / this.maxBudgetUsd) * 100;
  }
}
