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

    return insights;
  }
}
