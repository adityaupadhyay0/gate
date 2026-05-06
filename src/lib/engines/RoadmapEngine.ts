import prisma from "@/lib/db/prisma";

export class RoadmapEngine {
  static async generate(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const diagnostic = user?.diagnosticResult ? JSON.parse(user.diagnosticResult as string) : null;
    const weakAreas = diagnostic?.weakAreas || [];

    const subjects = await prisma.subject.findMany({
      include: {
        topics: {
          include: {
            _count: {
              select: { pyqs: true }
            }
          }
        }
      }
    });

    // Score topics
    const scoredSubjects = subjects.map(subject => {
      const scoredTopics = subject.topics.map(topic => {
        const pyqWeight = topic._count.pyqs;
        const dependencyOrder = topic.dependencyOrder;
        const userWeakness = weakAreas.includes(topic.name) ? 100 : 0;

        // priority_score = (pyq_weight × 0.5) + (dependency_order × 0.3) + (user_weakness × 0.2)
        // Normalizing for this demo
        const score = (pyqWeight * 0.5) + (dependencyOrder * 0.3) + (userWeakness * 0.2);

        return {
          ...topic,
          priorityScore: score
        };
      });

      // Sort topics within subject by priority score descending
      scoredTopics.sort((a, b) => b.priorityScore - a.priorityScore);

      return {
        ...subject,
        topics: scoredTopics
      };
    });

    return scoredSubjects;
  }
}
