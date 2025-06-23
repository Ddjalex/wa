/**
 * Comprehensive Keno Payout Engine with configurable odds and RTP calculations
 */

export interface PayoutEntry {
  spots: number;      // Numbers selected by player
  matches: number;    // Numbers that match
  multiplier: number; // Payout multiplier (e.g., 50x)
}

export interface SpotAnalysis {
  spots: number;
  totalCombinations: number;
  expectedRTP: number;
  payoutEntries: PayoutEntry[];
}

export class PayoutEngine {
  private static payoutTable: PayoutEntry[] = [
    // 1 Spot
    { spots: 1, matches: 1, multiplier: 3 },
    
    // 2 Spots
    { spots: 2, matches: 2, multiplier: 12 },
    { spots: 2, matches: 1, multiplier: 0 },
    
    // 3 Spots - User requested 50x for 3/3 match
    { spots: 3, matches: 3, multiplier: 50 },  // 1,500 birr for 30 birr bet
    { spots: 3, matches: 2, multiplier: 2 },
    { spots: 3, matches: 1, multiplier: 0 },
    
    // 4 Spots
    { spots: 4, matches: 4, multiplier: 100 },
    { spots: 4, matches: 3, multiplier: 5 },
    { spots: 4, matches: 2, multiplier: 1 },
    { spots: 4, matches: 1, multiplier: 0 },
    
    // 5 Spots
    { spots: 5, matches: 5, multiplier: 300 },
    { spots: 5, matches: 4, multiplier: 15 },
    { spots: 5, matches: 3, multiplier: 2 },
    { spots: 5, matches: 2, multiplier: 0 },
    { spots: 5, matches: 1, multiplier: 0 },
    
    // 6 Spots
    { spots: 6, matches: 6, multiplier: 1000 },
    { spots: 6, matches: 5, multiplier: 50 },
    { spots: 6, matches: 4, multiplier: 5 },
    { spots: 6, matches: 3, multiplier: 1 },
    { spots: 6, matches: 2, multiplier: 0 },
    { spots: 6, matches: 1, multiplier: 0 },
    
    // 7 Spots
    { spots: 7, matches: 7, multiplier: 5000 },
    { spots: 7, matches: 6, multiplier: 150 },
    { spots: 7, matches: 5, multiplier: 15 },
    { spots: 7, matches: 4, multiplier: 2 },
    { spots: 7, matches: 3, multiplier: 0 },
    { spots: 7, matches: 2, multiplier: 0 },
    { spots: 7, matches: 1, multiplier: 0 },
    
    // 8 Spots
    { spots: 8, matches: 8, multiplier: 10000 },
    { spots: 8, matches: 7, multiplier: 500 },
    { spots: 8, matches: 6, multiplier: 50 },
    { spots: 8, matches: 5, multiplier: 8 },
    { spots: 8, matches: 4, multiplier: 2 },
    { spots: 8, matches: 3, multiplier: 0 },
    { spots: 8, matches: 2, multiplier: 0 },
    { spots: 8, matches: 1, multiplier: 0 },
    
    // 9 Spots
    { spots: 9, matches: 9, multiplier: 25000 },
    { spots: 9, matches: 8, multiplier: 2500 },
    { spots: 9, matches: 7, multiplier: 200 },
    { spots: 9, matches: 6, multiplier: 25 },
    { spots: 9, matches: 5, multiplier: 5 },
    { spots: 9, matches: 4, multiplier: 1 },
    { spots: 9, matches: 3, multiplier: 0 },
    { spots: 9, matches: 2, multiplier: 0 },
    { spots: 9, matches: 1, multiplier: 0 },
    
    // 10 Spots
    { spots: 10, matches: 10, multiplier: 100000 },
    { spots: 10, matches: 9, multiplier: 10000 },
    { spots: 10, matches: 8, multiplier: 1000 },
    { spots: 10, matches: 7, multiplier: 100 },
    { spots: 10, matches: 6, multiplier: 20 },
    { spots: 10, matches: 5, multiplier: 3 },
    { spots: 10, matches: 4, multiplier: 1 },
    { spots: 10, matches: 3, multiplier: 0 },
    { spots: 10, matches: 2, multiplier: 0 },
    { spots: 10, matches: 1, multiplier: 0 },
  ];

  /**
   * Calculate combinations (n choose k)
   */
  private static combinations(n: number, k: number): number {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  }

  /**
   * Calculate probability of getting exactly 'matches' when picking 'spots' numbers
   * in an 80-ball, 20-draw Keno game
   */
  private static calculateProbability(spots: number, matches: number): number {
    // Ways to get 'matches' correct from 'spots' chosen
    const waysToMatch = this.combinations(20, matches);
    // Ways to get remaining spots wrong from remaining numbers
    const waysToMiss = this.combinations(60, spots - matches);
    // Total ways to choose 'spots' from 80
    const totalWays = this.combinations(80, spots);
    
    return (waysToMatch * waysToMiss) / totalWays;
  }

  /**
   * Get payout multiplier for specific spots and matches
   */
  static getMultiplier(spots: number, matches: number): number {
    const entry = this.payoutTable.find(p => p.spots === spots && p.matches === matches);
    return entry?.multiplier || 0;
  }

  /**
   * Calculate winnings for a bet
   */
  static calculateWinnings(betAmount: number, selectedNumbers: number[], drawnNumbers: number[]): {
    winAmount: number;
    matchedNumbers: number;
    multiplier: number;
    probability: number;
  } {
    const spots = selectedNumbers.length;
    const matches = selectedNumbers.filter(num => drawnNumbers.includes(num)).length;
    const multiplier = this.getMultiplier(spots, matches);
    const probability = this.calculateProbability(spots, matches);
    
    return {
      winAmount: betAmount * multiplier,
      matchedNumbers: matches,
      multiplier,
      probability
    };
  }

  /**
   * Calculate expected RTP for a specific spot count
   */
  static calculateRTP(spots: number): number {
    let expectedReturn = 0;
    
    for (let matches = 0; matches <= spots; matches++) {
      const probability = this.calculateProbability(spots, matches);
      const multiplier = this.getMultiplier(spots, matches);
      expectedReturn += probability * multiplier;
    }
    
    return expectedReturn;
  }

  /**
   * Get analysis for all spot types
   */
  static getSpotAnalysis(): SpotAnalysis[] {
    const analysis: SpotAnalysis[] = [];
    
    for (let spots = 1; spots <= 10; spots++) {
      const payoutEntries = this.payoutTable.filter(p => p.spots === spots);
      const expectedRTP = this.calculateRTP(spots);
      const totalCombinations = this.combinations(80, spots);
      
      analysis.push({
        spots,
        totalCombinations,
        expectedRTP,
        payoutEntries
      });
    }
    
    return analysis;
  }

  /**
   * Update payout table entry
   */
  static updatePayout(spots: number, matches: number, multiplier: number): void {
    const index = this.payoutTable.findIndex(p => p.spots === spots && p.matches === matches);
    if (index >= 0) {
      this.payoutTable[index].multiplier = multiplier;
    } else {
      this.payoutTable.push({ spots, matches, multiplier });
    }
  }

  /**
   * Get the full payout table
   */
  static getPayoutTable(): PayoutEntry[] {
    return [...this.payoutTable];
  }

  /**
   * Get probability details for a specific spot/match combination
   */
  static getProbabilityDetails(spots: number, matches: number): {
    probability: number;
    odds: string;
    frequency: string;
  } {
    const probability = this.calculateProbability(spots, matches);
    const odds = `1 in ${Math.round(1 / probability)}`;
    const frequency = `${(probability * 100).toFixed(4)}%`;
    
    return { probability, odds, frequency };
  }

  /**
   * Validate if current payouts are fair based on house edge
   */
  static validateHouseEdge(targetHouseEdge: number = 0.25): {
    spot: number;
    currentRTP: number;
    targetRTP: number;
    recommendation: string;
  }[] {
    const recommendations = [];
    const targetRTP = 1 - targetHouseEdge;
    
    for (let spots = 1; spots <= 10; spots++) {
      const currentRTP = this.calculateRTP(spots);
      let recommendation = 'Balanced';
      
      if (currentRTP > targetRTP + 0.05) {
        recommendation = 'Reduce payouts - too favorable to players';
      } else if (currentRTP < targetRTP - 0.05) {
        recommendation = 'Increase payouts - too favorable to house';
      }
      
      recommendations.push({
        spot: spots,
        currentRTP,
        targetRTP,
        recommendation
      });
    }
    
    return recommendations;
  }

  /**
   * Get recommended multipliers for balanced gameplay
   */
  static getRecommendedMultipliers(spots: number, targetRTP: number = 0.75): PayoutEntry[] {
    const recommendations: PayoutEntry[] = [];
    let totalExpectedReturn = 0;
    
    // Calculate what the multipliers should be for target RTP
    for (let matches = 0; matches <= spots; matches++) {
      const probability = this.calculateProbability(spots, matches);
      
      if (matches === spots) {
        // Highest payout should be the most attractive
        const suggestedMultiplier = Math.round(targetRTP * 0.6 / probability);
        recommendations.push({ spots, matches, multiplier: suggestedMultiplier });
        totalExpectedReturn += probability * suggestedMultiplier;
      } else if (matches === spots - 1 && spots > 2) {
        // Second highest payout
        const suggestedMultiplier = Math.round(targetRTP * 0.25 / probability);
        recommendations.push({ spots, matches, multiplier: suggestedMultiplier });
        totalExpectedReturn += probability * suggestedMultiplier;
      } else if (matches === spots - 2 && spots > 3) {
        // Third highest payout
        const suggestedMultiplier = Math.round(targetRTP * 0.1 / probability);
        recommendations.push({ spots, matches, multiplier: suggestedMultiplier });
        totalExpectedReturn += probability * suggestedMultiplier;
      } else {
        recommendations.push({ spots, matches, multiplier: 0 });
      }
    }
    
    return recommendations;
  }
}