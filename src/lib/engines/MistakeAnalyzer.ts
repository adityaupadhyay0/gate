import prisma from "@/lib/db/prisma";

export class MistakeAnalyzer {
  /**
   * Clusters mistakes by conceptTags and mistakeType to identify systemic weaknesses.
   */
  static async run(userId: string, subjectId?: string) {
    const logs = await prisma.mistakeLog.findMany({
      where: {
        userId,
        ...(subjectId ? { pyq: { topic: { subjectId } } } : {})
      },
      include: {
        pyq: {
          include: { metadata: true }
        }
      },
      orderBy: { loggedAt: 'desc' }
    });

    if (logs.length === 0) return null;

    // 1. Cluster by Concept Tags
    const conceptClusters: Record<string, number> = {};
    logs.forEach(log => {
      const tags = log.pyq.metadata?.conceptTags?.split(',').map(t => t.trim()) || [];
      tags.forEach(tag => {
        conceptClusters[tag] = (conceptClusters[tag] || 0) + 1;
      });
    });

    // 2. Identify Top Conceptual Blockers
    const topBlockers = Object.entries(conceptClusters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([concept, count]) => ({ concept, count }));

    // 3. Cluster by Mistake Type
    const typeClusters: Record<string, number> = {
      'Conceptual': 0,
      'TimePressure': 0,
      'Silly': 0
    };
    logs.forEach(log => {
      typeClusters[log.mistakeType] = (typeClusters[log.mistakeType] || 0) + 1;
    });

    const insights = [];

    if (typeClusters['Conceptual'] / logs.length > 0.4) {
      insights.push({
        type: 'CRITICAL',
        message: 'High conceptual error rate. You need to revisit foundational theory for your top blockers.'
      });
    }

    if (typeClusters['TimePressure'] > 5) {
      insights.push({
        type: 'ACTION',
        message: 'Time pressure detected across multiple topics. Recommend switching to Rank Mode for timed practice.'
      });
    }

    // 4. Confidence Mismatch
    const attemptsWithConfidence = await prisma.attempt.findMany({
      where: { userId, confidenceLevel: { not: null } },
      take: 20,
      orderBy: { attemptedAt: 'desc' }
    });

    const overconfidentCount = attemptsWithConfidence.filter(a => !a.isCorrect && (a.confidenceLevel || 0) >= 4).length;
    if (overconfidentCount > 3) {
      insights.push({
        type: 'PSYCHOLOGICAL',
        message: 'High overconfidence detected. You often feel certain about incorrect answers.'
      });
    }

    return {
      topBlockers,
      typeClusters,
      insights
    };
  }
}
