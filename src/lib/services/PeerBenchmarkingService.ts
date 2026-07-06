import prisma from "@/lib/db/prisma";

export interface UserScore {
  userId: string;
  score: number;
}

export class PeerBenchmarkingService {
  private static scoreCache: UserScore[] | null = null;
  private static lastCacheUpdate: number = 0;
  private static CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  static async getRankAndPercentile(userId: string, currentMastery: number, diagnosticResult: any) {
    const scores = await this.getGlobalScores();
    const userScore = this.calculateScore(currentMastery, diagnosticResult);

    const totalUsers = scores.length;
    if (totalUsers === 0) return { rank: 1, percentile: 100 };

    const rank = scores.filter(s => s.score > userScore).length + 1;
    const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

    return {
      rank,
      percentile: Math.max(1, Math.min(100, percentile))
    };
  }

  static async getGlobalScores(): Promise<UserScore[]> {
    const now = Date.now();
    if (this.scoreCache && (now - this.lastCacheUpdate < this.CACHE_TTL)) {
      return this.scoreCache;
    }

    // 1. Get all users who have completed onboarding
    const users = await prisma.user.findMany({
      where: { onboardingComplete: true },
      select: {
        id: true,
        diagnosticResult: true,
      }
    });

    if (users.length === 0) return [];

    // 2. Aggregate mastery scores at DB level
    const masteryAggregations = await prisma.userProgress.groupBy({
      by: ['userId'],
      where: {
        userId: { in: users.map(u => u.id) }
      },
      _sum: {
        coverageScore: true
      }
    });

    const masteryMap: Record<string, number> = {};
    masteryAggregations.forEach(agg => {
      masteryMap[agg.userId] = agg._sum.coverageScore || 0;
    });

    const totalTopics = await prisma.topic.count();

    const scores: UserScore[] = users.map(user => {
      const totalScore = masteryMap[user.id] || 0;
      const mastery = totalTopics > 0 ? Math.round((totalScore / totalTopics) * 100) : 0;

      let diagnosticData = null;
      try {
        diagnosticData = user.diagnosticResult ? (typeof user.diagnosticResult === 'string' ? JSON.parse(user.diagnosticResult) : user.diagnosticResult) : null;
      } catch (e) {
        console.error("Failed to parse diagnostic result for user", user.id, e);
      }

      return {
        userId: user.id,
        score: this.calculateScore(mastery, diagnosticData)
      };
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    this.scoreCache = scores;
    this.lastCacheUpdate = now;

    return scores;
  }

  static calculateScore(mastery: number, diagnosticData: any): number {
    if (!diagnosticData || !diagnosticData.strengthMap) return mastery * 0.6;

    const subjectStrengths = Object.values(diagnosticData.strengthMap) as number[];
    if (subjectStrengths.length === 0) return mastery * 0.6;

    const diagAvg = subjectStrengths.reduce((a, b) => a + b, 0) / subjectStrengths.length;
    return (diagAvg * 0.4) + (mastery * 0.6);
  }

  static _clearCache() {
    this.scoreCache = null;
    this.lastCacheUpdate = 0;
  }
}
