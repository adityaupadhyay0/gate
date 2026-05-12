import prisma from "@/lib/db/prisma";

export class BenchmarkingEngine {
  /**
   * Estimates the user's global standing based on cumulative mastery.
   * Compares the user's average coverageScore against the population.
   */
  static async getStats(userId: string) {
    // 1. Calculate current user's average mastery
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      select: { coverageScore: true }
    });

    // Total topics in syllabus is 95
    const totalTopics = 95;
    const userAverage = userProgress.length > 0
      ? userProgress.reduce((acc, curr) => acc + curr.coverageScore, 0) / totalTopics
      : 0;

    // 2. Fetch all users' averages for comparison
    const allUserAverages = await prisma.userProgress.groupBy({
      by: ['userId'],
      _avg: {
        coverageScore: true
      }
    });

    let populationAverages = allUserAverages.map(a => a._avg.coverageScore || 0);

    // 3. Mock Baseline: If we have few users, inject a realistic GATE aspirant distribution
    if (populationAverages.length < 10) {
      // Mocked averages representing a typical bell curve of 100,000 aspirants
      const mockDistribution = [
        0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9
      ];
      populationAverages.push(...mockDistribution);
    }

    // 4. Calculate Percentile
    populationAverages.sort((a, b) => a - b);
    const rankIndex = populationAverages.findIndex(avg => userAverage <= avg);

    // Percentile is (number of people below you / total people) * 100
    const percentile = rankIndex === -1
      ? 100
      : Math.min(100, Math.max(1, (rankIndex / populationAverages.length) * 100));

    // 5. Estimate Rank (Assuming ~100,000 serious GATE CSE aspirants)
    const totalAspirants = 100000;
    const numericRank = Math.round(totalAspirants * (1 - (percentile / 100)));

    let estimatedRank = `~${numericRank}`;
    if (numericRank <= 100) estimatedRank = "Top 100";
    else if (numericRank <= 500) estimatedRank = "Top 500";
    else if (numericRank <= 1000) estimatedRank = "Top 1000";

    return {
      percentile: Math.round(percentile),
      estimatedRank,
      userAverage: Math.round(userAverage * 100)
    };
  }
}
