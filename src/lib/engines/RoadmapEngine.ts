import prisma from "@/lib/db/prisma";

export class RoadmapEngine {
  /**
   * Topological Order (dependencies) + ROI Priority Score
   * ROI = (ExamWeight × ImprovementPotential) / TimeCost
   */
  static async generate(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attempts: true,
        progress: true,
      }
    });

    const diagnostic = user?.diagnosticResult ? JSON.parse(user.diagnosticResult as string) : null;
    const weakAreas = diagnostic?.weakAreas || [];

    // 1. Fetch all topics with dependencies and metadata
    const allTopics = await prisma.topic.findMany({
      include: {
        subject: true,
        dependencies: true,
        prerequisites: true,
        _count: { select: { pyqs: true } },
        userProgress: { where: { userId } },
        summaries: true,
      }
    });

    // 2. ROI Scoring
    const scoredTopics = allTopics.map(topic => {
      const examWeight = topic._count.pyqs; // Proxy for weight
      const mastery = topic.userProgress[0]?.coverageScore || 0;

      // ImprovementPotential = (1 - mastery) + (diagnostic_weakness ? 0.5 : 0)
      const improvementPotential = (1 - mastery) + (weakAreas.includes(topic.name) ? 0.5 : 0);

      // TimeCost: Base 1.0, can be refined later by actual usage
      const timeCost = 1.0;

      const roiScore = (examWeight * improvementPotential) / timeCost;

      return {
        ...topic,
        roiScore,
        isUnlocked: topic.prerequisites.every(p => {
          const preTopic = allTopics.find(t => t.id === p.prerequisiteId);
          return preTopic?.userProgress[0]?.status === 'Completed';
        })
      };
    });

    // 3. Subject Grouping (as requested by SRS)
    const subjects = await prisma.subject.findMany();
    const roadmap = subjects.map(subject => {
      const topicsInSubject = scoredTopics
        .filter(t => t.subjectId === subject.id)
        .sort((a, b) => b.roiScore - a.roiScore); // Within subject, show high ROI first

      return {
        ...subject,
        topics: topicsInSubject
      };
    });

    return roadmap;
  }
}
