import prisma from "@/lib/db/prisma";

export interface FSRSState {
  stability: number;
  difficulty: number;
}

export class WeightOptimizationService {
  private static readonly MIN_ATTEMPTS = 50;

  /**
   * Optimizes FSRS weights for a specific user based on their attempt history.
   * Uses a basic coordinate descent to minimize Log Loss.
   */
  static async optimizeForUser(userId: string) {
    console.log(`[FSRS] Starting weight optimization for user ${userId}`);
    const { RevisionEngine } = await import("@/lib/engines/RevisionEngine");
    const defaultWeights = RevisionEngine.DEFAULT_W;

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: 'asc' },
    });

    if (attempts.length < this.MIN_ATTEMPTS) {
      console.log(`[FSRS] Not enough attempts (${attempts.length}) for optimization.`);
      return null;
    }

    let bestWeights = [...defaultWeights];
    let minLoss = await this.calculateTotalLoss(attempts, bestWeights);

    // Coordinate descent with learning rate decay
    const iterations = 5;
    let stepSize = 0.05;

    for (let iter = 0; iter < iterations; iter++) {
      let improved = false;
      for (let i = 0; i < bestWeights.length; i++) {
        const originalValue = bestWeights[i];

        // Try increasing
        bestWeights[i] = originalValue * (1 + stepSize);
        let loss = await this.calculateTotalLoss(attempts, bestWeights);
        if (loss < minLoss) {
          minLoss = loss;
          improved = true;
          continue;
        }

        // Try decreasing
        bestWeights[i] = originalValue * (1 - stepSize);
        loss = await this.calculateTotalLoss(attempts, bestWeights);
        if (loss < minLoss) {
          minLoss = loss;
          improved = true;
          continue;
        }

        // Revert if no improvement
        bestWeights[i] = originalValue;
      }

      stepSize *= 0.8; // Decay step size
      if (!improved && stepSize < 0.01) break;
    }

    // Save optimized weights to user
    await prisma.user.update({
      where: { id: userId },
      data: { fsrsWeights: bestWeights as any }
    });

    console.log(`[FSRS] Optimization complete for ${userId}. New weights saved.`);
    return bestWeights;
  }

  /**
   * Calculates the Log Loss of the current weights against the attempt history.
   */
  private static async calculateTotalLoss(attempts: any[], weights: number[]): Promise<number> {
    const { RevisionEngine } = await import("@/lib/engines/RevisionEngine");
    let totalLoss = 0;
    const states: Record<string, FSRSState> = {};
    const pyqLastAttemptAt: Record<string, Date> = {};

    for (const attempt of attempts) {
      const pyqId = attempt.pyqId;

      // Use stored confidenceLevel (rating) if available, fallback to basic mapping
      const rating = attempt.confidenceLevel || (attempt.isCorrect ? 3 : 1);

      if (states[pyqId]) {
        const lastAt = pyqLastAttemptAt[pyqId];
        const daysSince = (attempt.attemptedAt.getTime() - lastAt.getTime()) / (1000 * 60 * 60 * 24);
        const retrievability = RevisionEngine.calculateRetrievability(states[pyqId].stability, daysSince);

        // Binary Cross Entropy (Log Loss)
        const y = attempt.isCorrect ? 1 : 0;
        const eps = 1e-15;
        const r = Math.max(Math.min(retrievability, 1 - eps), eps);
        totalLoss -= y * Math.log(r) + (1 - y) * Math.log(1 - r);

        // Update state for next time
        states[pyqId] = RevisionEngine.nextState(states[pyqId], rating, daysSince, weights);
      } else {
        // Initial state
        states[pyqId] = RevisionEngine.nextState(null, rating, 0, weights);
      }
      pyqLastAttemptAt[pyqId] = attempt.attemptedAt;
    }

    return totalLoss / attempts.length;
  }
}
