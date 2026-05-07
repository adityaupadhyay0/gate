import { RoadmapEngine } from "@/lib/engines/RoadmapEngine";
import { RevisionEngine } from "@/lib/engines/RevisionEngine";

export class RankOptimizer {
  /**
   * Rank Mode shifts focus from 'coverage' to 'precision'.
   * It prioritizes topics with the highest ROI where (Marks At Stake) is maximum.
   */
  static async generateSprintPlan(userId: string) {
    const subjects = await RoadmapEngine.generate(userId);
    const allTopics = subjects.flatMap(s => s.topics);

    // Filter for topics not yet mastered but with high exam weight
    const priorityTargets = allTopics
      .filter(t => t.userProgress[0]?.status !== 'Completed')
      .sort((a, b) => b.roiScore - a.roiScore)
      .slice(0, 10);

    // Identify critical revision targets (High weight + Low memory)
    const queue = await RevisionEngine.getQueue(userId);
    const revisionTargets = queue
      .sort((a, b) => a.currentRetrievability - b.currentRetrievability)
      .slice(0, 5);

    return {
      priorityTargets,
      revisionTargets,
      daysToExam: 30, // Mocked for now
      estimatedRankImprovement: 150 * priorityTargets.length
    };
  }
}
