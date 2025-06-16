// Admin-side betting engine - players cannot access this logic
export class BettingEngine {
  private static readonly MULTIPLIER = 50;
  private static readonly MIN_BET = 20; // Birr
  private static readonly MAX_BET = 5000; // Birr
  private static readonly CURRENCY = "Birr";

  // Admin-only method to calculate winnings
  static calculateWin(betAmount: number): number {
    if (betAmount < this.MIN_BET || betAmount > this.MAX_BET) {
      throw new Error(`Bet must be between ${this.MIN_BET} and ${this.MAX_BET} ${this.CURRENCY}`);
    }
    return betAmount * this.MULTIPLIER;
  }

  // Admin-only method to validate bet amount
  static isValidBet(betAmount: number): boolean {
    return betAmount >= this.MIN_BET && 
           betAmount <= this.MAX_BET && 
           Number.isInteger(betAmount);
  }

  // Admin-only method to get betting limits
  static getBettingLimits() {
    return {
      min: this.MIN_BET,
      max: this.MAX_BET,
      currency: this.CURRENCY,
      multiplier: this.MULTIPLIER // Only exposed for admin interface
    };
  }

  // Generate payout table for admin reference
  static generatePayoutTable(): Array<{bet: number, win: number}> {
    const table = [];
    for (let bet = this.MIN_BET; bet <= this.MAX_BET; bet += 10) {
      table.push({
        bet,
        win: this.calculateWin(bet)
      });
    }
    return table;
  }

  // Player-facing method - only returns result, not internal logic
  static processPlayerBet(betAmount: number): {
    success: boolean;
    winAmount?: number;
    error?: string;
  } {
    try {
      if (!this.isValidBet(betAmount)) {
        return {
          success: false,
          error: `Invalid bet amount. Must be between ${this.MIN_BET} and ${this.MAX_BET} ${this.CURRENCY}`
        };
      }

      return {
        success: true,
        winAmount: this.calculateWin(betAmount)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Betting error"
      };
    }
  }
}