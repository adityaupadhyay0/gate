import prisma from "@/lib/db/prisma";

interface UserScore {
  userId: string;
  score: number;
}

export class PeerBenchmarkingService {
  private static cachedScores: UserScore[] | null = null;
  private static cacheTimestamp: number = 0;
  private static CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Calculates the global rank and percentile for a user based on their
   * diagnostic performance and syllabus coverage.
   */
  static async getBenchmark(userId: string, currentMastery: number, diagnosticData: any) {
    const userScore = this.calculateScore(currentMastery, diagnosticData);

    const distribution = await this.getScoreDistribution();

    // Filter out the current user if they are already in the distribution to avoid double counting,
    // although in a real scenario we'd just use the cached distribution.
    const otherScores = distribution.filter(u => u.userId !== userId).map(u => u.score);
    const allScores = [...otherScores, userScore].sort((a, b) => b - a);

    const totalUsers = allScores.length;

    // Find rank: number of people with strictly higher score + 1
    const rank = allScores.filter(s => s > userScore).length + 1;

    // Global percentile: percentage of users with score <= current user
    // Formula: ((totalUsers - rank) / totalUsers) * 100
    const percentile = totalUsers > 0
      ? Math.round(((totalUsers - rank) / totalUsers) * 100)
      : 100;

    return {
      rank,
      totalUsers,
      percentile: Math.max(1, Math.min(100, percentile))
    };
  }

  /**
   * Peer Benchmarking Score Formula:
   * (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  private static calculateScore(mastery: number, diagnosticData: any): number {
    if (!diagnosticData || !diagnosticData.strengthMap) return mastery * 0.6;

    let strengths = diagnosticData.strengthMap;
    if (typeof strengths === 'string') {
      try {
        strengths = JSON.parse(strengths);
      } catch (e) {
        return mastery * 0.6;
      }
    }

    const subjectStrengths = Object.values(strengths) as number[];
    if (subjectStrengths.length === 0) return mastery * 0.6;

    const diagAvg = subjectStrengths.reduce((a, b) => a + b, 0) / subjectStrengths.length;
    return (diagAvg * 0.4) + (mastery * 0.6);
  }

  private static async getScoreDistribution(): Promise<UserScore[]> {
    const now = Date.now();
    if (this.cachedScores && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.cachedScores;
    }

    // Fetch all users who have completed onboarding
    const [users, totalTopics] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: {
          id: true,
          diagnosticResult: true,
          progress: {
            select: { coverageScore: true }
          }
        }
      }),
      prisma.topic.count()
    ]);

    const scores: UserScore[] = users.map(user => {
      let diagData = null;
      try {
        diagData = user.diagnosticResult;
        if (typeof diagData === 'string') {
          diagData = JSON.parse(diagData);
        }
      } catch (e) {
        // Fallback for malformed data
      }

      const totalCoverage = user.progress.reduce((acc, curr) => acc + curr.coverageScore, 0);
      const mastery = totalTopics > 0 ? (totalCoverage / totalTopics) * 100 : 0;

      return {
        userId: user.id,
        score: this.calculateScore(mastery, diagData)
      };
    });

    this.cachedScores = scores;
    this.cacheTimestamp = now;
    return scores;
  }

  /**
   * Internal method to clear cache for testing purposes.
   */
  static _clearCache() {
    this.cachedScores = null;
    this.cacheTimestamp = 0;
  }
}
