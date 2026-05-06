import prisma from "@/lib/db/prisma";

export class MistakeAnalyzer {
  static async run(userId: string, subjectId: string) {
    const logs = await prisma.mistakeLog.findMany({
      where: {
        userId,
        pyq: { topic: { subjectId } }
      },
      take: 10,
      orderBy: { loggedAt: 'desc' }
    });

    if (logs.length < 10) return null;

    const conceptualCount = logs.filter(l => l.mistakeType === 'Conceptual').length;
    const timePressureCount = logs.filter(l => l.mistakeType === 'TimePressure').length;
    const sillyCount = logs.filter(l => l.mistakeType === 'Silly').length;

    const insights = [];

    if (conceptualCount / logs.length > 0.5) {
      insights.push({
        type: 'CRITICAL',
        message: 'High conceptual error rate. Flagging subject for deep re-study.'
      });
    }

    if (timePressureCount > 3) {
      insights.push({
        type: 'ACTION',
        message: 'Time pressure detected. Recommend timed practice drills.'
      });
    }

    if (sillyCount > 4) {
      insights.push({
        type: 'ALERT',
        message: 'Review your checking habit to reduce silly mistakes.'
      });
    }

    // New: Confidence Mismatch Detection
    const attemptsWithConfidence = await prisma.attempt.findMany({
      where: { userId, confidenceLevel: { not: null } },
      take: 20,
      orderBy: { attemptedAt: 'desc' }
    });

    const overconfidentCount = attemptsWithConfidence.filter(a => !a.isCorrect && (a.confidenceLevel || 0) >= 4).length;
    const underconfidentCount = attemptsWithConfidence.filter(a => a.isCorrect && (a.confidenceLevel || 0) <= 2).length;

    if (overconfidentCount > 3) {
      insights.push({
        type: 'PSYCHOLOGICAL',
        message: 'Overconfidence signal detected. You are certain but often wrong in this subject.'
      });
    }

    if (underconfidentCount > 5) {
      insights.push({
        type: 'PSYCHOLOGICAL',
        message: 'Underconfidence detected. You know more than you think—trust your first instinct.'
      });
    }

    return insights;
  }
}
