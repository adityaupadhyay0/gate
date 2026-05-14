import prisma from "@/lib/db/prisma";
import { DEFAULT_FSRS_WEIGHTS, RevisionEngine } from "@/lib/engines/RevisionEngine";

export class WeightOptimizationService {
  private static readonly ATTEMPT_THRESHOLD = 50;

  /**
   * Optimizes FSRS weights for a user based on their attempt history.
   * Uses a simplified gradient descent to minimize Log Loss.
   */
  static async optimize(userId: string) {
    const attempts = await prisma.attempt.findMany({
      where: { userId, confidenceLevel: { not: null } },
      orderBy: { attemptedAt: 'asc' },
      select: {
        attemptedAt: true,
        confidenceLevel: true,
        isCorrect: true,
        pyqId: true
      }
    });

    if (attempts.length < this.ATTEMPT_THRESHOLD) {
      return { success: false, message: "Insufficient data for calibration" };
    }

    // Group attempts by PYQ to calculate intervals
    const historyMap = new Map<string, any[]>();
    attempts.forEach(a => {
      if (!historyMap.has(a.pyqId)) historyMap.set(a.pyqId, []);
      historyMap.get(a.pyqId)?.push(a);
    });

    let currentWeights = [...DEFAULT_FSRS_WEIGHTS];
    let bestLoss = this.calculateLoss(historyMap, currentWeights);

    // Simplified optimization: One-at-a-time coordinate descent
    const iterations = 5;
    const learningRate = 0.05;

    for (let i = 0; i < iterations; i++) {
      let improved = false;
      for (let j = 0; j < currentWeights.length; j++) {
        const originalValue = currentWeights[j];

        // Try increasing
        currentWeights[j] = originalValue * (1 + learningRate);
        const lossPlus = this.calculateLoss(historyMap, currentWeights);

        // Try decreasing
        currentWeights[j] = originalValue * (1 - learningRate);
        const lossMinus = this.calculateLoss(historyMap, currentWeights);

        if (lossPlus < bestLoss && lossPlus < lossMinus) {
          bestLoss = lossPlus;
          currentWeights[j] = originalValue * (1 + learningRate);
          improved = true;
        } else if (lossMinus < bestLoss) {
          bestLoss = lossMinus;
          currentWeights[j] = originalValue * (1 - learningRate);
          improved = true;
        } else {
          currentWeights[j] = originalValue;
        }
      }
      if (!improved) break;
    }

    // Save optimized weights to user profile
    await prisma.user.update({
      where: { id: userId },
      data: { fsrsWeights: currentWeights }
    });

    return {
      success: true,
      weights: currentWeights,
      lossImprovement: this.calculateLoss(historyMap, DEFAULT_FSRS_WEIGHTS) - bestLoss
    };
  }

  /**
   * Calculates Log Loss (binary cross-entropy) for a set of weights.
   */
  private static calculateLoss(historyMap: Map<string, any[]>, weights: number[]): number {
    let totalLoss = 0;
    let count = 0;

    historyMap.forEach((attempts) => {
      let stability = 0;
      let difficulty = 0;

      for (let i = 0; i < attempts.length; i++) {
        const attempt = attempts[i];
        const rating = attempt.confidenceLevel;

        if (i > 0) {
          const daysSince = (attempt.attemptedAt.getTime() - attempts[i - 1].attemptedAt.getTime()) / (1000 * 60 * 60 * 24);
          const r = RevisionEngine.calculateRetrievability(stability, daysSince);

          // Log Loss: -[y*log(p) + (1-y)*log(1-p)]
          const y = attempt.isCorrect ? 1 : 0;
          const p = Math.max(0.01, Math.min(0.99, r));
          totalLoss -= y * Math.log(p) + (1 - y) * Math.log(1 - p);
          count++;

          // Update for next using shared logic
          const nextState = RevisionEngine.nextState(stability, difficulty, rating, daysSince, weights);
          stability = nextState.stability;
          difficulty = nextState.difficulty;
        } else {
          // Initial state using shared logic
          const nextState = RevisionEngine.nextState(0, 0, rating, 0, weights);
          stability = nextState.stability;
          difficulty = nextState.difficulty;
        }
      }
    });

    return count > 0 ? totalLoss / count : 0;
  }
}
