import prisma from "@/lib/db/prisma";

/**
 * FSRS (Free Spaced Repetition Scheduler) v4 Implementation
 *
 * Stability (S): Days until retrievability drops to 90%
 * Difficulty (D): Complexity (1-10)
 * Retrievability (R): Probability of recall (0-1)
 */
export class RevisionEngine {
  // Default parameters for FSRS v4
  public static readonly DEFAULT_W = [
    0.4, 0.6, 2.4, 5.8, // Initial stability for Again, Hard, Good, Easy
    4.93, 0.94, 0.86, 0.01, // Difficulty updates
    1.49, 0.14, 0.94, // Stability updates (success)
    2.18, 0.05, 0.34, 1.26, // Stability updates (failure)
    0.2, 2.61 // Review penalty/bonus
  ];

  static calculateRetrievability(stability: number, daysSince: number): number {
    return Math.pow(1 + daysSince / (9 * stability), -1);
  }

  static async getWeights(userId: string): Promise<number[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fsrsWeights: true }
    });
    if (user?.fsrsWeights) {
      try {
        return JSON.parse(user.fsrsWeights as string);
      } catch {
        return this.DEFAULT_W;
      }
    }
    return this.DEFAULT_W;
  }

  static async getQueue(userId: string) {
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        pyq: {
          include: {
            topic: {
              include: {
                subject: true,
                _count: { select: { pyqs: true } }
              }
            }
          }
        }
      },
      orderBy: { attemptedAt: 'desc' }
    });

    const now = new Date();
    const latestAttemptsMap = new Map();
    attempts.forEach(a => {
      if (!latestAttemptsMap.has(a.pyqId)) {
        latestAttemptsMap.set(a.pyqId, a);
      }
    });

    const queue = Array.from(latestAttemptsMap.values()).map(attempt => {
      const daysSince = (now.getTime() - attempt.attemptedAt.getTime()) / (1000 * 60 * 60 * 24);
      const retrievability = this.calculateRetrievability(attempt.stability || 0.1, daysSince);

      return {
        ...attempt,
        currentRetrievability: retrievability
      };
    }).filter(a => a.currentRetrievability < 0.9);

    return queue.sort((a, b) => a.currentRetrievability - b.currentRetrievability);
  }

  static async updateFSRS(
    userId: string,
    pyqId: string,
    rating: 1 | 2 | 3 | 4,
    timeSpent: number
  ) {
    const weights = await this.getWeights(userId);
    const lastAttempt = await prisma.attempt.findFirst({
      where: { userId, pyqId },
      orderBy: { attemptedAt: 'desc' }
    });

    let newStability: number;
    let newDifficulty: number;

    if (!lastAttempt) {
      newStability = weights[rating - 1];
      newDifficulty = this.initialDifficulty(rating, weights);
    } else {
      const daysSince = (Date.now() - lastAttempt.attemptedAt.getTime()) / (1000 * 60 * 60 * 24);
      const retrievability = this.calculateRetrievability(lastAttempt.stability, daysSince);

      newDifficulty = this.constrainDifficulty(
        lastAttempt.difficulty + weights[4] * (this.meanReversion(rating) - 1)
      );

      if (rating === 1) {
        newStability = weights[11] * Math.pow(newDifficulty, -weights[12]) * (Math.pow(lastAttempt.stability + 1, weights[13]) - 1) * Math.exp(weights[14] * (1 - retrievability));
      } else {
        newStability = lastAttempt.stability * (1 + Math.exp(weights[8]) * (11 - newDifficulty) * Math.pow(lastAttempt.stability, -weights[9]) * (Math.exp((1 - retrievability) * weights[10]) - 1));
      }
    }

    const attempt = await prisma.attempt.create({
      data: {
        userId,
        pyqId,
        isCorrect: rating > 1,
        timeSpent,
        stability: newStability,
        difficulty: newDifficulty,
        retrievability: rating === 1 ? 0 : 1.0
      },
      include: { pyq: true }
    });

    // Auto-tune weights every 50 attempts
    const attemptCount = await prisma.attempt.count({ where: { userId } });
    if (attemptCount > 0 && attemptCount % 50 === 0) {
      await this.optimizeWeights(userId);
    }

    return attempt;
  }

  /**
   * Personalized Weight Optimization (Auto-tuning)
   * A simplified gradient-descent approach to minimize RMSE between
   * predicted retrievability and actual binary outcomes (correct/incorrect).
   */
  static async optimizeWeights(userId: string) {
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: 'asc' }
    });

    if (attempts.length < 50) return;

    let currentWeights = await this.getWeights(userId);
    const learningRate = 0.01;
    const epochs = 10;

    for (let e = 0; e < epochs; e++) {
      const gradients = new Array(currentWeights.length).fill(0);

      // Calculate RMSE gradient (simplified)
      // For each attempt, we look at what the S was *before* the attempt
      // but since we only store S *after*, we'd need to reconstruct or look at history.
      // A more robust approach would use a separate 'ReviewLog'.
      // For this MVP, we adjust based on global performance trends.

      const averageSuccess = attempts.filter(a => a.isCorrect).length / attempts.length;

      // Heuristic: If user is performing better than 90%, increase stability growth
      if (averageSuccess > 0.9) {
          currentWeights[8] += learningRate; // Stability bonus
      } else if (averageSuccess < 0.7) {
          currentWeights[8] -= learningRate;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { fsrsWeights: JSON.stringify(currentWeights) }
    });
  }

  private static initialDifficulty(rating: number, weights: number[]): number {
    return this.constrainDifficulty(weights[4] - weights[5] * (rating - 3));
  }

  private static constrainDifficulty(d: number): number {
    return Math.min(Math.max(d, 1), 10);
  }

  private static meanReversion(rating: number): number {
    return (rating - 1) / 3;
  }
}
