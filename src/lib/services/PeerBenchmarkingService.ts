import prisma from "@/lib/db/prisma";

export interface BenchmarkResult {
  score: number;
  rank: number;
  totalUsers: number;
  topPercentile: number;
  percentile: number;
  rankEstimation: string;
}

interface UserScoreMap {
  userId: string;
  score: number;
}

let cachedScores: UserScoreMap[] | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class PeerBenchmarkingService {
  /**
   * Clears in-memory cache. Used for testing and cache invalidation.
   */
  static _clearCache(): void {
    cachedScores = null;
    lastCacheTime = 0;
  }

  /**
   * Calculates composite score for a user: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  static async calculateUserScore(
    userId: string,
    diagnosticResultRaw: unknown,
    coverageSum: number,
    totalTopics: number,
    subjectCount: number
  ): Promise<number> {
    let diagAvg = 0;
    if (diagnosticResultRaw) {
      try {
        const diagObj =
          typeof diagnosticResultRaw === "string"
            ? JSON.parse(diagnosticResultRaw)
            : diagnosticResultRaw;

        if (diagObj && typeof diagObj === "object" && diagObj.strengthMap) {
          const strengths = Object.values(diagObj.strengthMap) as number[];
          if (strengths.length > 0) {
            const count = subjectCount > 0 ? subjectCount : strengths.length;
            const sum = strengths.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
            diagAvg = sum / count;
          }
        }
      } catch (e) {
        console.error("Failed to parse diagnostic result in PeerBenchmarkingService:", e);
      }
    }

    const syllabusCoverage = totalTopics > 0 ? (coverageSum / totalTopics) * 100 : 0;
    const score = diagAvg * 0.4 + syllabusCoverage * 0.6;
    return Math.round(score * 100) / 100;
  }

  /**
   * Computes or returns cached user composite scores across all users with onboardingComplete: true
   */
  static async getGlobalDistribution(): Promise<UserScoreMap[]> {
    const now = Date.now();
    if (cachedScores && now - lastCacheTime < CACHE_TTL_MS) {
      return cachedScores;
    }

    const [onboardedUsers, totalTopics, subjectCount] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true }
      }),
      prisma.topic.count(),
      prisma.subject.count()
    ]);

    if (onboardedUsers.length === 0) {
      cachedScores = [];
      lastCacheTime = now;
      return [];
    }

    const onboardedUserIds = onboardedUsers.map((u) => u.id);

    // Database-level aggregation using groupBy to prevent OOM
    const progressAgg = await prisma.userProgress.groupBy({
      by: ["userId"],
      where: { userId: { in: onboardedUserIds } },
      _sum: { coverageScore: true }
    });

    const progressMap = new Map<string, number>();
    for (const p of progressAgg) {
      progressMap.set(p.userId, p._sum.coverageScore || 0);
    }

    const scores: UserScoreMap[] = [];
    for (const u of onboardedUsers) {
      const coverageSum = progressMap.get(u.id) || 0;
      const score = await this.calculateUserScore(
        u.id,
        u.diagnosticResult,
        coverageSum,
        totalTopics,
        subjectCount
      );
      scores.push({ userId: u.id, score });
    }

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);

    cachedScores = scores;
    lastCacheTime = now;
    return scores;
  }

  /**
   * Gets peer benchmark estimation for a given user.
   */
  static async getBenchmarkForUser(userId: string): Promise<BenchmarkResult> {
    const distribution = await this.getGlobalDistribution();
    const totalUsers = distribution.length;

    const userEntry = distribution.find((d) => d.userId === userId);

    let score = 0;
    if (userEntry) {
      score = userEntry.score;
    } else {
      // User not onboarded or not in global distribution list yet; calculate on the fly
      const [user, totalTopics, subjectCount, userProgress] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { diagnosticResult: true }
        }),
        prisma.topic.count(),
        prisma.subject.count(),
        prisma.userProgress.aggregate({
          where: { userId },
          _sum: { coverageScore: true }
        })
      ]);

      const coverageSum = userProgress._sum.coverageScore || 0;
      score = await this.calculateUserScore(
        userId,
        user?.diagnosticResult,
        coverageSum,
        totalTopics,
        subjectCount
      );
    }

    if (totalUsers === 0) {
      return {
        score,
        rank: 1,
        totalUsers: 1,
        topPercentile: 1,
        percentile: 99,
        rankEstimation: this.getRankEstimationTier(score, 1)
      };
    }

    // Rank is 1-indexed position in descending sorted array
    let rank = distribution.findIndex((d) => d.userId === userId) + 1;
    if (rank === 0) {
      // If user wasn't in list (e.g. not onboarded yet), determine rank relative to distribution
      const higherCount = distribution.filter((d) => d.score > score).length;
      rank = higherCount + 1;
    }

    const topPercentile =
      rank === 1 ? 1 : Math.max(1, Math.min(100, Math.round((rank / totalUsers) * 100)));
    const percentile = Math.max(1, Math.min(100, 100 - topPercentile));
    const rankEstimation = this.getRankEstimationTier(score, topPercentile);

    return {
      score,
      rank,
      totalUsers: Math.max(totalUsers, 1),
      topPercentile,
      percentile,
      rankEstimation
    };
  }

  private static getRankEstimationTier(score: number, topPercentile: number): string {
    if (score === 0) return "Not Calibrated";
    if (topPercentile <= 1 || score > 85) return "Top 100";
    if (topPercentile <= 5 || score > 70) return "Top 500";
    if (topPercentile <= 15 || score > 55) return "Top 2000";
    if (topPercentile <= 30 || score > 40) return "Top 5000";
    if (topPercentile <= 50 || score > 25) return "Top 10000";
    return "Top 20000+";
  }
}
