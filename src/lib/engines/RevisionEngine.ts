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
  private static readonly w = [
    0.4, 0.6, 2.4, 5.8, // Initial stability for Again, Hard, Good, Easy
    4.93, 0.94, 0.86, 0.01, // Difficulty updates
    1.49, 0.14, 0.94, // Stability updates (success)
    2.18, 0.05, 0.34, 1.26, // Stability updates (failure)
    0.2, 2.61 // Review penalty/bonus
  ];

  static calculateRetrievability(stability: number, daysSince: number): number {
    return Math.pow(1 + daysSince / (9 * stability), -1);
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
    const lastAttempt = await prisma.attempt.findFirst({
      where: { userId, pyqId },
      orderBy: { attemptedAt: 'desc' }
    });

    let newStability: number;
    let newDifficulty: number;

    if (!lastAttempt) {
      // First attempt
      newStability = this.w[rating - 1];
      newDifficulty = this.initialDifficulty(rating);
    } else {
      const daysSince = (Date.now() - lastAttempt.attemptedAt.getTime()) / (1000 * 60 * 60 * 24);
      const retrievability = this.calculateRetrievability(lastAttempt.stability, daysSince);

      newDifficulty = this.constrainDifficulty(
        lastAttempt.difficulty + this.w[4] * (this.meanReversion(rating) - 1)
      );

      if (rating === 1) {
        // Failure
        newStability = this.w[11] * Math.pow(newDifficulty, -this.w[12]) * (Math.pow(lastAttempt.stability + 1, this.w[13]) - 1) * Math.exp(this.w[14] * (1 - retrievability));
      } else {
        // Success
        newStability = lastAttempt.stability * (1 + Math.exp(this.w[8]) * (11 - newDifficulty) * Math.pow(lastAttempt.stability, -this.w[9]) * (Math.exp((1 - retrievability) * this.w[10]) - 1));
      }
    }

    return await prisma.attempt.create({
      data: {
        userId,
        pyqId,
        isCorrect: rating > 1,
        timeSpent,
        stability: newStability,
        difficulty: newDifficulty,
        retrievability: rating === 1 ? 0 : 1.0 // Reset retrievability on attempt
      },
      include: { pyq: true }
    });
  }

  private static initialDifficulty(rating: number): number {
    return this.constrainDifficulty(this.w[4] - this.w[5] * (rating - 3));
  }

  private static constrainDifficulty(d: number): number {
    return Math.min(Math.max(d, 1), 10);
  }

  private static meanReversion(rating: number): number {
    return (rating - 1) / 3;
  }
}
