import prisma from "@/lib/db/prisma";

/**
 * FSRS (Free Spaced Repetition Scheduler) v4 Implementation
 *
 * Stability (S): Days until retrievability drops to 90%
 * Difficulty (D): Complexity (1-10)
 * Retrievability (R): Probability of recall (0-1)
 */
export class RevisionEngine {
  // Default parameters for FSRS
  public static readonly DEFAULT_W = [
    0.4, 0.6, 2.4, 5.8, // Initial stability for Again, Hard, Good, Easy
    4.93, 0.94, 0.86, 0.01, // Difficulty updates
    1.49, 0.14, 0.94, // Stability updates (success)
    2.18, 0.05, 0.34, 1.26, // Stability updates (failure)
    0.2, 2.61 // Review penalty/bonus
  ];

  public static calculateRetrievability(stability: number, daysSince: number): number {
    return Math.pow(1 + daysSince / (9 * stability), -1);
  }

  static async getQueue(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fsrsWeights: true }
    });
    const weights = (user?.fsrsWeights as number[]) || this.DEFAULT_W;

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

    // Group by PYQ to get only the latest attempt for each
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
    }).filter(a => a.currentRetrievability < 0.9); // Target 90% retention

    return queue.sort((a, b) => a.currentRetrievability - b.currentRetrievability);
  }

  static async updateFSRS(
    userId: string,
    pyqId: string,
    rating: 1 | 2 | 3 | 4, // 1: Again, 2: Hard, 3: Good, 4: Easy
    timeSpent: number
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fsrsWeights: true }
    });
    const weights = (user?.fsrsWeights as number[]) || this.DEFAULT_W;

    const lastAttempt = await prisma.attempt.findFirst({
      where: { userId, pyqId },
      orderBy: { attemptedAt: 'desc' }
    });

    const nextState = this.nextState(
      lastAttempt ? { stability: lastAttempt.stability, difficulty: lastAttempt.difficulty } : null,
      rating,
      lastAttempt ? (Date.now() - lastAttempt.attemptedAt.getTime()) / (1000 * 60 * 60 * 24) : 0,
      weights
    );

    return await prisma.attempt.create({
      data: {
        userId,
        pyqId,
        isCorrect: rating > 1,
        timeSpent,
        stability: nextState.stability,
        difficulty: nextState.difficulty,
        retrievability: rating === 1 ? 0 : 1.0, // Reset retrievability on attempt
        confidenceLevel: rating // Store rating for future optimization
      },
      include: { pyq: true }
    });
  }

  /**
   * Pure function to calculate next FSRS state.
   * Centralized here to ensure consistency between real-time updates and optimization.
   */
  public static nextState(
    state: { stability: number; difficulty: number } | null,
    rating: number,
    daysSince: number,
    w: number[]
  ): { stability: number; difficulty: number } {
    if (!state) {
      return {
        stability: w[rating - 1],
        difficulty: this.constrainDifficulty(w[4] - w[5] * (rating - 3))
      };
    }

    const retrievability = this.calculateRetrievability(state.stability, daysSince);

    // Improved difficulty update logic
    // Mean reversion: rating=3 (Good) is neutral, rating=1 (Again) increases difficulty
    const newDifficulty = this.constrainDifficulty(
      state.difficulty + w[6] * ((rating - 3) * -1) // Corrected: failure (1) increases difficulty
    );

    let newStability: number;
    if (rating === 1) {
      // Failure
      newStability = w[11] * Math.pow(newDifficulty, -w[12]) * (Math.pow(state.stability + 1, w[13]) - 1) * Math.exp(w[14] * (1 - retrievability));
    } else {
      // Success
      newStability = state.stability * (1 + Math.exp(w[8]) * (11 - newDifficulty) * Math.pow(state.stability, -w[9]) * (Math.exp((1 - retrievability) * w[10]) - 1));
    }

    return { stability: newStability, difficulty: newDifficulty };
  }

  private static constrainDifficulty(d: number): number {
    return Math.min(Math.max(d, 1), 10);
  }
}
