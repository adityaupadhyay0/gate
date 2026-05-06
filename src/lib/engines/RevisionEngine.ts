import prisma from "@/lib/db/prisma";

export class RevisionEngine {
  // memory_score(t) = base_score × e^(−λ × days_since_last_review)
  static calculateMemoryScore(baseScore: number, lambda: number, daysSinceLastReview: number) {
    return baseScore * Math.exp(-lambda * daysSinceLastReview);
  }

  static async enqueue(userId: string, topicId: string) {
    // Topic completion already triggers userProgress status change
    // This could involve specific logic for initial review scheduling
  }

  static async getQueue(userId: string) {
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: { pyq: { include: { topic: { include: { _count: { select: { pyqs: true } } } } } } },
      orderBy: { attemptedAt: 'desc' }
    });

    const now = new Date();
    const queue = attempts.map(attempt => {
      const daysSince = (now.getTime() - attempt.attemptedAt.getTime()) / (1000 * 60 * 60 * 24);

      // Dual Difficulty lambda calculation
      // Effective λ = α * Global_λ + (1 - α) * Personal_λ
      const globalDiff = (attempt.pyq as any).metadata?.globalDifficulty || 0.5;
      const personalDiff = attempt.personalDifficulty || 0.5;

      // Map 0-1 diff to 0.1-0.4 lambda
      const alpha = 0.5;
      const effectiveDiff = (alpha * globalDiff) + ((1 - alpha) * personalDiff);
      const lambda = 0.1 + (effectiveDiff * 0.3);

      const currentMemoryScore = this.calculateMemoryScore(attempt.isCorrect ? 1.0 : 0.5, lambda, daysSince);

      return {
        ...attempt,
        currentMemoryScore
      };
    }).filter(a => a.currentMemoryScore < 0.6); // Revisit Trigger

    // Priority Score for Revision Queue
    // revision_priority = (1 − memory_score) × topic_pyq_weight
    return queue.sort((a, b) => {
      const weightA = a.pyq.topic._count.pyqs;
      const weightB = b.pyq.topic._count.pyqs;
      const priorityA = (1 - a.currentMemoryScore) * weightA;
      const priorityB = (1 - b.currentMemoryScore) * weightB;
      return priorityB - priorityA;
    });
  }

  static async updateScores(userId: string, results: { pyqId: string, isCorrect: boolean, timeSpent: number }[]) {
    for (const res of results) {
      await prisma.attempt.create({
        data: {
          userId,
          pyqId: res.pyqId,
          isCorrect: res.isCorrect,
          timeSpent: res.timeSpent,
          memoryScore: res.isCorrect ? 1.0 : 0.5
        }
      });
    }
  }
}
