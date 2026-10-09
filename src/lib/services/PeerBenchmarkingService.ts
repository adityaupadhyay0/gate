import prisma from "@/lib/db/prisma";

export interface UserBenchmarkingResult {
  userId: string;
  rank: number;
  totalUsers: number;
  topPercentile: number;
  overallPercentile: number;
  overallScore: number;
  syllabusCoverage: number;
  diagnosticAverage: number;
  peerAverageScore: number;
  estimatedRankString: string;
}

interface UserScoreEntry {
  userId: string;
  overallScore: number;
  syllabusCoverage: number;
  diagnosticAverage: number;
}

interface CacheEntry {
  distribution: UserScoreEntry[];
  timestamp: number;
}

export class PeerBenchmarkingService {
  private static cache: CacheEntry | null = null;
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Clears the in-memory cache. Used for testing and cache invalidation.
   */
  static _clearCache(): void {
    this.cache = null;
  }

  /**
   * Fetches or computes the global user distribution.
   * Uses database-level aggregation (`prisma.userProgress.groupBy`) to avoid OOM.
   */
  static async getGlobalDistribution(): Promise<UserScoreEntry[]> {
    const now = Date.now();
    if (this.cache && (now - this.cache.timestamp) < this.CACHE_TTL_MS) {
      return this.cache.distribution;
    }

    const [totalTopics, totalSubjects, activeUsers, userProgressAgg] = await Promise.all([
      prisma.topic.count(),
      prisma.subject.count(),
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true }
      }),
      prisma.userProgress.groupBy({
        by: ['userId'],
        _sum: { coverageScore: true },
        where: {
          user: { onboardingComplete: true }
        }
      })
    ]);

    const coverageMap = new Map<string, number>();
    for (const item of userProgressAgg) {
      const sum = item._sum.coverageScore || 0;
      coverageMap.set(item.userId, sum);
    }

    const distribution: UserScoreEntry[] = activeUsers.map(user => {
      const totalCoverageSum = coverageMap.get(user.id) || 0;
      const syllabusCoverage = totalTopics > 0 ? (totalCoverageSum / totalTopics) * 100 : 0;

      let diagAvg = 0;
      if (user.diagnosticResult) {
        try {
          const parsed = typeof user.diagnosticResult === "string"
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;
          if (parsed && parsed.strengthMap && typeof parsed.strengthMap === "object") {
            const values = Object.values(parsed.strengthMap) as number[];
            if (values.length > 0 && totalSubjects > 0) {
              const totalStrength = values.reduce((acc, v) => acc + (typeof v === "number" ? v : 0), 0);
              diagAvg = totalStrength / totalSubjects;
            }
          }
        } catch (e) {
          console.error("Failed to parse user diagnosticResult:", e);
        }
      }

      // Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
      const overallScore = Math.round(((diagAvg * 0.4) + (syllabusCoverage * 0.6)) * 100) / 100;

      return {
        userId: user.id,
        overallScore,
        syllabusCoverage: Math.round(syllabusCoverage * 10) / 10,
        diagnosticAverage: Math.round(diagAvg * 10) / 10
      };
    });

    // Sort in descending order of overallScore
    distribution.sort((a, b) => b.overallScore - a.overallScore);

    this.cache = {
      distribution,
      timestamp: now
    };

    return distribution;
  }

  /**
   * Calculates peer benchmarking metrics for a specific user against all active users.
   */
  static async getUserBenchmarking(userId: string): Promise<UserBenchmarkingResult> {
    const distribution = await this.getGlobalDistribution();
    const totalUsers = distribution.length;

    if (totalUsers === 0) {
      return {
        userId,
        rank: 1,
        totalUsers: 1,
        topPercentile: 1,
        overallPercentile: 99,
        overallScore: 0,
        syllabusCoverage: 0,
        diagnosticAverage: 0,
        peerAverageScore: 0,
        estimatedRankString: "Top 1%"
      };
    }

    let rankIndex = distribution.findIndex(u => u.userId === userId);
    let userEntry = distribution[rankIndex];

    if (!userEntry) {
      // If user is not yet in distribution (e.g. guest or onboarding incomplete)
      userEntry = {
        userId,
        overallScore: 0,
        syllabusCoverage: 0,
        diagnosticAverage: 0
      };
      rankIndex = distribution.length; // placed at bottom
    }

    const rank = rankIndex + 1;
    const effectiveTotalUsers = Math.max(totalUsers, rank);

    const topPercentile = rank === 1
      ? 1
      : Math.max(1, Math.min(100, Math.round((rank / effectiveTotalUsers) * 100)));

    const overallPercentile = Math.max(1, Math.min(100, 100 - topPercentile));

    const totalSum = distribution.reduce((sum, u) => sum + u.overallScore, 0);
    const peerAverageScore = Math.round((totalSum / totalUsers) * 10) / 10;

    const estimatedRankString = `Top ${topPercentile}%`;

    return {
      userId,
      rank,
      totalUsers: effectiveTotalUsers,
      topPercentile,
      overallPercentile,
      overallScore: userEntry.overallScore,
      syllabusCoverage: userEntry.syllabusCoverage,
      diagnosticAverage: userEntry.diagnosticAverage,
      peerAverageScore,
      estimatedRankString
    };
  }
}
