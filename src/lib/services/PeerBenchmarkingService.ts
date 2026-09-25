import prisma from "@/lib/db/prisma";

export interface BenchmarkResult {
  percentile: number; // e.g. 95 means Top 5%
  rank: number; // e.g. 450
  totalUsers: number; // e.g. 10000
  compositeScore: number; // 0 - 100 scale
  label: string; // "Top 5%"
  estimatedRankLabel: string; // "Top 5% (~Rank 450/10,000)"
  isCalibrated: boolean;
}

interface DistributionCache {
  timestamp: number;
  scores: Array<{ userId: string; score: number }>;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
let cachedDistribution: DistributionCache | null = null;

export class PeerBenchmarkingService {
  /**
   * Clears the in-memory cache (primarily used for unit testing isolation).
   */
  static _clearCache() {
    cachedDistribution = null;
  }

  /**
   * Calculates dynamic benchmark position (rank, percentile, composite score)
   * relative to all onboarded users in the system.
   */
  static async getPeerBenchmarking(userId: string): Promise<BenchmarkResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { diagnosticResult: true, fsrsWeights: true, onboardingComplete: true }
    });

    if (!user) {
      return this.getUncalibratedFallback();
    }

    let diagnosticData = null;
    try {
      if (user.diagnosticResult) {
        diagnosticData = typeof user.diagnosticResult === "string"
          ? JSON.parse(user.diagnosticResult)
          : user.diagnosticResult;
      }
    } catch (e) {
      console.error("[PeerBenchmarkingService] Error parsing diagnosticResult:", e);
    }

    const hasDiagnostic = diagnosticData && diagnosticData.strengthMap;

    if (!hasDiagnostic) {
      return this.getUncalibratedFallback();
    }

    // Get distribution across all onboarded users
    const distribution = await this.getDistribution();

    if (distribution.length === 0) {
      return this.getUncalibratedFallback();
    }

    // Find current user score or compute if missing in distribution
    let userEntry = distribution.find((d) => d.userId === userId);
    let userScore = userEntry ? userEntry.score : 0;

    if (!userEntry) {
      userScore = await this.computeUserCompositeScore(userId, diagnosticData);
    }

    // Rank is 1-indexed (1 = highest score)
    // For tied scores, lower rank index is assigned
    const totalUsers = distribution.length;
    let rank = 1;
    for (const entry of distribution) {
      if (entry.score > userScore) {
        rank++;
      }
    }

    // Percentile calculation: percentage of users score is higher than or equal to
    // Percentile 95 = Top 5%
    const percentile = Math.min(
      100,
      Math.max(1, Math.round(((totalUsers - rank) / totalUsers) * 100))
    );

    const topPercentage = Math.max(1, 100 - percentile);
    const label = topPercentage <= 1 ? "Top 1%" : `Top ${topPercentage}%`;
    const estimatedRankLabel = `${label} (~Rank ${rank}/${totalUsers})`;

    return {
      percentile,
      rank,
      totalUsers,
      compositeScore: Math.round(userScore * 10) / 10,
      label,
      estimatedRankLabel,
      isCalibrated: true
    };
  }

  private static getUncalibratedFallback(): BenchmarkResult {
    return {
      percentile: 0,
      rank: 0,
      totalUsers: 0,
      compositeScore: 0,
      label: "Uncalibrated",
      estimatedRankLabel: "Not Calibrated",
      isCalibrated: false
    };
  }

  private static async getDistribution(): Promise<Array<{ userId: string; score: number }>> {
    const now = Date.now();
    if (cachedDistribution && now - cachedDistribution.timestamp < CACHE_TTL_MS) {
      return cachedDistribution.scores;
    }

    // Query all users who have completed onboarding
    const onboardedUsers = await prisma.user.findMany({
      where: { onboardingComplete: true },
      select: { id: true, diagnosticResult: true }
    });

    if (onboardedUsers.length === 0) {
      return [];
    }

    // Fetch syllabus coverage scores grouped by user
    const totalTopics = await prisma.topic.count();
    const progressAggregates = await prisma.userProgress.groupBy({
      by: ["userId"],
      _sum: {
        coverageScore: true
      }
    });

    const userCoverageMap = new Map<string, number>();
    progressAggregates.forEach((p) => {
      if (totalTopics > 0) {
        const avgCoverage = ((p._sum.coverageScore || 0) / totalTopics) * 100;
        userCoverageMap.set(p.userId, avgCoverage);
      } else {
        userCoverageMap.set(p.userId, 0);
      }
    });

    const scores: Array<{ userId: string; score: number }> = [];

    for (const u of onboardedUsers) {
      let diagnosticData = null;
      try {
        if (u.diagnosticResult) {
          diagnosticData = typeof u.diagnosticResult === "string"
            ? JSON.parse(u.diagnosticResult)
            : u.diagnosticResult;
        }
      } catch {
        // ignore invalid json
      }

      const coverage = userCoverageMap.get(u.id) || 0;
      let diagAvg = 0;

      if (diagnosticData && diagnosticData.strengthMap) {
        const strengths = Object.values(diagnosticData.strengthMap) as number[];
        if (strengths.length > 0) {
          diagAvg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        }
      }

      // Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
      const compositeScore = diagAvg * 0.4 + coverage * 0.6;
      scores.push({ userId: u.id, score: compositeScore });
    }

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);

    cachedDistribution = {
      timestamp: now,
      scores
    };

    return scores;
  }

  private static async computeUserCompositeScore(userId: string, diagnosticData: any): Promise<number> {
    const [progress, totalTopics] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId },
        select: { coverageScore: true }
      }),
      prisma.topic.count()
    ]);

    const totalScore = progress.reduce((acc, curr) => acc + curr.coverageScore, 0);
    const coverage = totalTopics > 0 ? (totalScore / totalTopics) * 100 : 0;

    let diagAvg = 0;
    if (diagnosticData && diagnosticData.strengthMap) {
      const strengths = Object.values(diagnosticData.strengthMap) as number[];
      if (strengths.length > 0) {
        diagAvg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
      }
    }

    return diagAvg * 0.4 + coverage * 0.6;
  }
}
