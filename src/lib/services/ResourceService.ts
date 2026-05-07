import prisma from "@/lib/db/prisma";

export class ResourceService {
  /**
   * Helpfulness Score = Learning Gain / Time Spent
   */
  static async trackUsage(resourceId: string, timeSpent: number, beforeMastery: number, afterMastery: number) {
    const learningGain = Math.max(0, afterMastery - beforeMastery);

    await prisma.topicResource.update({
      where: { id: resourceId },
      data: {
        totalTimeSpent: { increment: timeSpent },
        learningGain: { increment: learningGain },
        usageCount: { increment: 1 }
      }
    });
  }

  static async getTopResources(topicId: string) {
    const resource = await prisma.topicResource.findUnique({
      where: { topicId }
    });

    if (!resource) return null;

    // In a real app with many resource options per topic, we would sort them.
    // For this system, we store them as JSON arrays and rank the items internally or via Gemini.
    return resource;
  }
}
