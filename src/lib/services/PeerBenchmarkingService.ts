import prisma from "@/lib/db/prisma";

export interface PeerBenchmarkResult {
  userId: string;
  score: number;
  rank: number;
  totalUsers: number;
  percentile: number;
  estimatedGateRank: string;
  subjectBreakdown?: Record<string, number>;
}

interface UserScoreEntry {
  userId: string;
  score: number;
  subjectBreakdown?: Record<string, number>;
}

interface CacheData {
  timestamp: number;
  distribution: UserScoreEntry[];
  totalTopics: number;
  totalSubjects: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let cache: CacheData | null = null;

export class PeerBenchmarkingService {
  /**
   * Clears in-memory distribution cache for testing isolation.
   */
  static _clearCache() {
    cache = null;
  }

  /**
   * Returns peer benchmarking metrics including global rank and percentile.
   */
  static async getPeerBenchmark(userId: string): Promise<PeerBenchmarkResult> {
    const distributionData = await this.getScoreDistribution();
    let { distribution, totalTopics, totalSubjects } = distributionData;

    let userIndex = distribution.findIndex((u) => u.userId === userId);

    // If user is not yet in the distribution (e.g. guest or onboarding incomplete), compute their score on the fly
    if (userIndex === -1) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { diagnosticResult: true }
      });

      const userProgressAgg = await prisma.userProgress.aggregate({
        where: { userId },
        _sum: { coverageScore: true }
      });

      const userProgressSum = userProgressAgg._sum.coverageScore || 0;
      const targetScore = this.calculateUserScore(
        user?.diagnosticResult,
        userProgressSum,
        totalTopics,
        totalSubjects
      );

      const targetEntry: UserScoreEntry = {
        userId,
        score: targetScore.score,
        subjectBreakdown: targetScore.subjectBreakdown
      };

      // Create a temporary distribution copy including target user
      const tempDistribution = [...distribution, targetEntry].sort((a, b) => b.score - a.score);
      distribution = tempDistribution;
      userIndex = distribution.findIndex((u) => u.userId === userId);
    }

    const totalUsers = distribution.length;
    const rank = userIndex + 1;

    let percentile = 100;
    if (totalUsers > 0) {
      const rawPercentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
      percentile = Math.max(1, Math.min(100, rawPercentile));
    }

    const userEntry = distribution[userIndex];
    const score = userEntry ? userEntry.score : 0;
    const estimatedGateRank = this.estimateGateRank(score);

    return {
      userId,
      score,
      rank,
      totalUsers,
      percentile,
      estimatedGateRank,
      subjectBreakdown: userEntry?.subjectBreakdown
    };
  }

  /**
   * Fetches or calculates global user score distribution with 10-min caching.
   */
  private static async getScoreDistribution(): Promise<CacheData> {
    const now = Date.now();
    if (cache && now - cache.timestamp < CACHE_TTL_MS) {
      return cache;
    }

    const [onboardedUsers, totalTopics, totalSubjects, userProgressSums] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true }
      }),
      prisma.topic.count(),
      prisma.subject.count(),
      prisma.userProgress.groupBy({
        by: ["userId"],
        _sum: { coverageScore: true }
      })
    ]);

    const progressMap = new Map<string, number>();
    userProgressSums.forEach((item) => {
      progressMap.set(item.userId, item._sum.coverageScore || 0);
    });

    const distribution: UserScoreEntry[] = onboardedUsers.map((user) => {
      const progressSum = progressMap.get(user.id) || 0;
      const scoreResult = this.calculateUserScore(
        user.diagnosticResult,
        progressSum,
        totalTopics,
        totalSubjects
      );

      return {
        userId: user.id,
        score: scoreResult.score,
        subjectBreakdown: scoreResult.subjectBreakdown
      };
    });

    distribution.sort((a, b) => b.score - a.score);

    cache = {
      timestamp: now,
      distribution,
      totalTopics,
      totalSubjects
    };

    return cache;
  }

  /**
   * Calculates score formula: (Diagnostic Avg * 0.4) + (Syllabus Coverage * 0.6)
   */
  public static calculateUserScore(
    diagnosticResultRaw: any,
    coverageSum: number,
    totalTopics: number,
    totalSubjects: number
  ): { score: number; subjectBreakdown: Record<string, number> } {
    let strengthMap: Record<string, number> = {};

    if (diagnosticResultRaw) {
      try {
        const parsed = typeof diagnosticResultRaw === "string"
          ? JSON.parse(diagnosticResultRaw)
          : diagnosticResultRaw;
        if (parsed && parsed.strengthMap && typeof parsed.strengthMap === "object") {
          strengthMap = parsed.strengthMap;
        }
      } catch (e) {
        console.error("Failed to parse diagnosticResult in PeerBenchmarkingService:", e);
      }
    }

    const strengths = Object.values(strengthMap).map((v) => Number(v) || 0);
    const totalStrengthsSum = strengths.reduce((a, b) => a + b, 0);

    const subjectCount = totalSubjects > 0 ? totalSubjects : Math.max(Object.keys(strengthMap).length, 12);
    const diagAvg = strengths.length > 0 ? totalStrengthsSum / subjectCount : 0;

    const syllabusCoverage = totalTopics > 0
      ? Math.min(100, (coverageSum / totalTopics) * 100)
      : 0;

    const score = Math.round(((diagAvg * 0.4) + (syllabusCoverage * 0.6)) * 10) / 10;

    return {
      score,
      subjectBreakdown: strengthMap
    };
  }

  /**
   * Converts score to GATE rank tier estimation.
   */
  public static estimateGateRank(score: number): string {
    if (score > 85) return "Top 100";
    if (score > 70) return "Top 500";
    if (score > 55) return "Top 2000";
    if (score > 40) return "Top 5000";
    if (score > 25) return "Top 10000";
    return "Top 20000+";
  }
}
