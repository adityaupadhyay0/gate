import prisma from "@/lib/db/prisma";

export interface PeerBenchmarkingResult {
  rank: number;
  totalUsers: number;
  percentile: number;
  topPercentileLabel: string;
  score: number;
  rankEstimation: string;
}

interface UserScoreData {
  userId: string;
  score: number;
}

interface CachedDistribution {
  timestamp: number;
  users: UserScoreData[];
  totalSubjectsCount: number;
  totalTopicsCount: number;
}

export class PeerBenchmarkingService {
  private static cache: CachedDistribution | null = null;
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Resets the in-memory cache.
   * Useful for unit test isolation.
   */
  public static _clearCache(): void {
    PeerBenchmarkingService.cache = null;
  }

  /**
   * Computes benchmarking score for a single user given their diagnostic result and syllabus coverage.
   * Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  public static calculateBenchmarkingScore(
    diagnosticResult: any,
    coverageSum: number,
    totalTopicsCount: number,
    totalSubjectsCount: number
  ): number {
    let diagnosticAvg = 0;
    if (diagnosticResult) {
      try {
        const parsed = typeof diagnosticResult === "string" ? JSON.parse(diagnosticResult) : diagnosticResult;
        if (parsed && parsed.strengthMap) {
          const values = Object.values(parsed.strengthMap) as number[];
          const sum = values.reduce((acc, v) => acc + (Number(v) || 0), 0);
          const subjCount = Math.max(1, totalSubjectsCount);
          diagnosticAvg = sum / subjCount;
        }
      } catch (e) {
        console.error("Failed to parse diagnosticResult for benchmarking:", e);
      }
    }

    const syllabusCoverage = totalTopicsCount > 0 ? (coverageSum / totalTopicsCount) * 100 : 0;
    const score = (diagnosticAvg * 0.4) + (syllabusCoverage * 0.6);
    return Math.max(0, Math.min(100, score));
  }

  private static async getDistribution(): Promise<CachedDistribution> {
    const now = Date.now();
    if (
      PeerBenchmarkingService.cache &&
      now - PeerBenchmarkingService.cache.timestamp < PeerBenchmarkingService.CACHE_TTL_MS
    ) {
      return PeerBenchmarkingService.cache;
    }

    const [onboardedUsers, totalSubjectsCount, totalTopicsCount, progressGrouped] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true }
      }),
      prisma.subject.count(),
      prisma.topic.count(),
      prisma.userProgress.groupBy({
        by: ["userId"],
        _sum: {
          coverageScore: true
        }
      })
    ]);

    const progressMap = new Map<string, number>();
    progressGrouped.forEach((p) => {
      progressMap.set(p.userId, p._sum.coverageScore || 0);
    });

    const userScores: UserScoreData[] = onboardedUsers.map((user) => {
      const coverageSum = progressMap.get(user.id) || 0;
      const score = PeerBenchmarkingService.calculateBenchmarkingScore(
        user.diagnosticResult,
        coverageSum,
        totalTopicsCount,
        totalSubjectsCount
      );
      return { userId: user.id, score };
    });

    userScores.sort((a, b) => b.score - a.score);

    const newCache: CachedDistribution = {
      timestamp: now,
      users: userScores,
      totalSubjectsCount,
      totalTopicsCount
    };

    PeerBenchmarkingService.cache = newCache;
    return newCache;
  }

  public static async getUserBenchmark(userId: string): Promise<PeerBenchmarkingResult> {
    const distribution = await PeerBenchmarkingService.getDistribution();

    let targetUserScore: number;
    const existingUser = distribution.users.find((u) => u.userId === userId);

    if (existingUser) {
      targetUserScore = existingUser.score;
    } else {
      // User is not in onboarded distribution yet, calculate score individually
      const [user, progressSumAgg] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { diagnosticResult: true }
        }),
        prisma.userProgress.aggregate({
          where: { userId },
          _sum: { coverageScore: true }
        })
      ]);

      const coverageSum = progressSumAgg._sum.coverageScore || 0;
      targetUserScore = PeerBenchmarkingService.calculateBenchmarkingScore(
        user?.diagnosticResult,
        coverageSum,
        distribution.totalTopicsCount,
        distribution.totalSubjectsCount
      );
    }

    const peerScores = existingUser
      ? distribution.users.map((u) => u.score)
      : [...distribution.users.map((u) => u.score), targetUserScore];

    const totalUsers = Math.max(1, peerScores.length);

    // Rank 1 is highest score. Rank = 1 + count of peers strictly higher
    const rank = 1 + peerScores.filter((s) => s > targetUserScore).length;

    // Top percentile calculation: Rank 1 maps to Top 1%
    const rawTopPercentile = Math.round((rank / totalUsers) * 100);
    const topPercentileNum = rank === 1 ? 1 : Math.max(1, Math.min(100, rawTopPercentile));

    const percentile = Math.max(1, Math.min(100, 100 - topPercentileNum));
    const topPercentileLabel = `Top ${topPercentileNum}%`;

    return {
      rank,
      totalUsers,
      percentile,
      topPercentileLabel,
      score: Math.round(targetUserScore * 10) / 10,
      rankEstimation: topPercentileLabel
    };
  }
}
