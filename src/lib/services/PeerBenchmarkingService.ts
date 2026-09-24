import prisma from "@/lib/db/prisma";

export interface PeerBenchmarkResult {
  userId: string;
  rank: number;
  totalUsers: number;
  percentile: number;
  topPercentile: number;
  overallScore: number;
  tier: string;
}

interface DistributionEntry {
  userId: string;
  score: number;
}

export class PeerBenchmarkingService {
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private static cache: {
    timestamp: number;
    distribution: DistributionEntry[];
    totalTopics: number;
    totalSubjects: number;
  } | null = null;

  /**
   * Clears in-memory distribution cache.
   * Used primarily for unit tests to ensure test isolation.
   */
  static _clearCache(): void {
    this.cache = null;
  }

  /**
   * Computes individual overall score based on formula:
   * (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  static async computeUserScore(
    userId: string,
    totalTopicsCount?: number,
    totalSubjectsCount?: number
  ): Promise<{ overallScore: number; coverageScore: number; diagnosticAvg: number }> {
    const totalTopics = totalTopicsCount ?? (await prisma.topic.count());
    const totalSubjects = totalSubjectsCount ?? (await prisma.subject.count());

    const [userProgress, user] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId },
        select: { coverageScore: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { diagnosticResult: true },
      }),
    ]);

    const totalCoverage = userProgress.reduce((acc, curr) => acc + curr.coverageScore, 0);
    const coveragePercentage = totalTopics > 0 ? (totalCoverage / totalTopics) * 100 : 0;
    const coverageScoreClamped = Math.min(100, Math.max(0, coveragePercentage));

    let diagnosticAvg = 0;
    if (user?.diagnosticResult) {
      try {
        const diagData = typeof user.diagnosticResult === "string"
          ? JSON.parse(user.diagnosticResult)
          : user.diagnosticResult;

        if (diagData && diagData.strengthMap) {
          const strengths = Object.values(diagData.strengthMap) as number[];
          if (strengths.length > 0) {
            const sum = strengths.reduce((a, b) => a + b, 0);
            const subjectsDivisor = totalSubjects > 0 ? totalSubjects : strengths.length;
            diagnosticAvg = sum / subjectsDivisor;
          }
        }
      } catch (e) {
        console.error("Failed to parse diagnosticResult for benchmarking:", e);
      }
    }

    const overallScore = Math.round((diagnosticAvg * 0.4) + (coverageScoreClamped * 0.6));

    return {
      overallScore,
      coverageScore: Math.round(coverageScoreClamped),
      diagnosticAvg: Math.round(diagnosticAvg),
    };
  }

  /**
   * Fetches or builds the global distribution of scores for all onboarded users.
   * Employs DB-level aggregation via `prisma.userProgress.groupBy` and 10-minute caching.
   */
  private static async getDistribution(): Promise<{ distribution: DistributionEntry[]; totalTopics: number; totalSubjects: number }> {
    const now = Date.now();
    if (this.cache && now - this.cache.timestamp < this.CACHE_TTL_MS) {
      return {
        distribution: this.cache.distribution,
        totalTopics: this.cache.totalTopics,
        totalSubjects: this.cache.totalSubjects,
      };
    }

    const [totalTopics, totalSubjects, onboardedUsers, progressGrouped] = await Promise.all([
      prisma.topic.count(),
      prisma.subject.count(),
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true },
      }),
      prisma.userProgress.groupBy({
        by: ["userId"],
        _sum: { coverageScore: true },
      }),
    ]);

    const coverageMap = new Map<string, number>();
    progressGrouped.forEach((p) => {
      if (p.userId) {
        coverageMap.set(p.userId, p._sum.coverageScore || 0);
      }
    });

    const distribution: DistributionEntry[] = onboardedUsers.map((u) => {
      const userCoverage = coverageMap.get(u.id) || 0;
      const coveragePercentage = totalTopics > 0 ? (userCoverage / totalTopics) * 100 : 0;
      const coverageClamped = Math.min(100, Math.max(0, coveragePercentage));

      let diagAvg = 0;
      if (u.diagnosticResult) {
        try {
          const diagData = typeof u.diagnosticResult === "string"
            ? JSON.parse(u.diagnosticResult)
            : u.diagnosticResult;

          if (diagData && diagData.strengthMap) {
            const strengths = Object.values(diagData.strengthMap) as number[];
            if (strengths.length > 0) {
              const sum = strengths.reduce((a, b) => a + b, 0);
              const divisor = totalSubjects > 0 ? totalSubjects : strengths.length;
              diagAvg = sum / divisor;
            }
          }
        } catch (e) {
          console.error(`Failed to parse diagnostic result for user ${u.id}:`, e);
        }
      }

      const overallScore = Math.round((diagAvg * 0.4) + (coverageClamped * 0.6));
      return { userId: u.id, score: overallScore };
    });

    distribution.sort((a, b) => b.score - a.score);

    this.cache = {
      timestamp: now,
      distribution,
      totalTopics,
      totalSubjects,
    };

    return { distribution, totalTopics, totalSubjects };
  }

  /**
   * Returns peer benchmarking metrics for a given user.
   */
  static async getPeerBenchmark(userId: string): Promise<PeerBenchmarkResult> {
    const { distribution, totalTopics, totalSubjects } = await this.getDistribution();

    let userScoreObj = await this.computeUserScore(userId, totalTopics, totalSubjects);
    let userScore = userScoreObj.overallScore;

    const totalUsers = Math.max(1, distribution.length);
    let userIndex = distribution.findIndex((d) => d.userId === userId);

    let rank: number;
    if (userIndex !== -1) {
      rank = userIndex + 1;
    } else {
      // User is not in onboarded list; determine position in distribution
      rank = distribution.findIndex((d) => d.score < userScore) + 1;
      if (rank === 0) {
        rank = distribution.length + 1;
      }
    }

    // Formula: Math.round(((totalUsers - rank) / totalUsers) * 100) clamped [1, 100]
    const calculatedPercentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
    const percentile = Math.min(100, Math.max(1, calculatedPercentile));
    const topPercentile = Math.max(1, 100 - percentile);

    let tier = "Top 20000+";
    if (userScore > 85) tier = "Top 100";
    else if (userScore > 70) tier = "Top 500";
    else if (userScore > 55) tier = "Top 2000";
    else if (userScore > 40) tier = "Top 5000";
    else if (userScore > 25) tier = "Top 10000";

    return {
      userId,
      rank,
      totalUsers,
      percentile,
      topPercentile,
      overallScore: userScore,
      tier,
    };
  }
}
