import prisma from "@/lib/db/prisma";

export class CompletionEngine {
  static async check(userId: string, topicId: string) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        _count: {
          select: { pyqs: true }
        }
      }
    });

    if (!topic) return { complete: false, score: 0 };

    const solvedPYQs = await prisma.attempt.count({
      where: {
        userId,
        pyq: { topicId },
        isCorrect: true
      }
    });

    const totalAvailable = topic._count.pyqs;
    const coverageScore = totalAvailable > 0 ? (solvedPYQs / totalAvailable) : 0;

    // Threshold: coverage_score ≥ 0.80 (80%)
    // Minimum floor: solve at least 15 PYQs, no matter what
    // Topics with < 15 PYQs: must hit 100% of available PYQs

    let isComplete = false;
    if (totalAvailable < 15) {
      isComplete = coverageScore >= 1.0;
    } else {
      isComplete = coverageScore >= 0.8 && solvedPYQs >= 15;
    }

    if (isComplete) {
      await prisma.userProgress.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: { status: "Completed", coverageScore },
        create: { userId, topicId, status: "Completed", coverageScore }
      });
    } else {
      await prisma.userProgress.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: { status: "InProgress", coverageScore },
        create: { userId, topicId, status: "InProgress", coverageScore }
      });
    }

    return {
      complete: isComplete,
      score: coverageScore,
      remaining: totalAvailable < 15 ? Math.max(0, totalAvailable - solvedPYQs) : Math.max(0, 15 - solvedPYQs)
    };
  }
}
