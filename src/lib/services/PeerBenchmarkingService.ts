import prisma from "@/lib/db/prisma";

export interface UserBenchmarkingResult {
  score: number;
  rank: number;
  totalUsers: number;
  percentile: number;
  topPercentileLabel: string;
  syllabusCoverage: number;
  diagnosticAverage: number;
}

interface CachedScoresDistribution {
  timestamp: number;
  totalSubjects: number;
  totalTopics: number;
  userScores: Map<string, { score: number; syllabusCoverage: number; diagnosticAverage: number }>;
  sortedScores: number[];
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
let cache: CachedScoresDistribution | null = null;

export class PeerBenchmarkingService {
  /**
   * Resets the internal cache. Useful for unit test isolation.
   */
  static _clearCache(): void {
    cache = null;
  }

  /**
   * Calculates the peer benchmarking score for a user given their diagnostic average and syllabus coverage.
   * Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  static calculateScore(diagnosticAverage: number, syllabusCoverage: number): number {
    const diag = Math.min(100, Math.max(0, diagnosticAverage || 0));
    const cov = Math.min(100, Math.max(0, syllabusCoverage || 0));
    return Number(((diag * 0.4) + (cov * 0.6)).toFixed(2));
  }

  /**
   * Computes or retrieves cached score distribution for all onboarded users.
   */
  private static async getDistribution(): Promise<CachedScoresDistribution> {
    const now = Date.now();
    if (cache && (now - cache.timestamp < CACHE_TTL_MS)) {
      return cache;
    }

    const [totalSubjects, totalTopics, onboardedUsers, progressGrouped] = await Promise.all([
      prisma.subject.count(),
      prisma.topic.count(),
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true }
      }),
      prisma.userProgress.groupBy({
        by: ["userId"],
        _sum: {
          coverageScore: true
        }
      })
    ]);

    const coverageSumMap: Record<string, number> = {};
    for (const p of progressGrouped) {
      if (p.userId) {
        coverageSumMap[p.userId] = p._sum.coverageScore || 0;
      }
    }

    const userScores = new Map<string, { score: number; syllabusCoverage: number; diagnosticAverage: number }>();
    const sortedScores: number[] = [];

    const effectiveSubjectCount = totalSubjects > 0 ? totalSubjects : 12;

    for (const user of onboardedUsers) {
      // 1. Syllabus Coverage
      const coverageSum = coverageSumMap[user.id] || 0;
      const syllabusCoverage = totalTopics > 0 ? (coverageSum / totalTopics) * 100 : 0;

      // 2. Diagnostic Average
      let diagnosticAverage = 0;
      if (user.diagnosticResult) {
        try {
          const diagResult = typeof user.diagnosticResult === "string"
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;

          if (diagResult && diagResult.strengthMap && typeof diagResult.strengthMap === "object") {
            const strengths = Object.values(diagResult.strengthMap) as number[];
            if (strengths.length > 0) {
              const sum = strengths.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
              diagnosticAverage = sum / effectiveSubjectCount;
            }
          }
        } catch (e) {
          console.error(`Failed to parse diagnostic result for user ${user.id}:`, e);
        }
      }

      const score = this.calculateScore(diagnosticAverage, syllabusCoverage);
      userScores.set(user.id, { score, syllabusCoverage, diagnosticAverage });
      sortedScores.push(score);
    }

    sortedScores.sort((a, b) => b - a);

    cache = {
      timestamp: now,
      totalSubjects: effectiveSubjectCount,
      totalTopics,
      userScores,
      sortedScores
    };

    return cache;
  }

  /**
   * Retrieves benchmarking details for a specific user relative to the global distribution.
   */
  static async getUserBenchmarking(userId: string): Promise<UserBenchmarkingResult> {
    const distribution = await this.getDistribution();

    let userStats = distribution.userScores.get(userId);

    if (!userStats) {
      // User is not in the onboarded distribution (or Guest / onboarding incomplete). Calculate manually.
      const [user, progressGroup] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { diagnosticResult: true }
        }),
        prisma.userProgress.groupBy({
          by: ["userId"],
          where: { userId },
          _sum: {
            coverageScore: true
          }
        })
      ]);

      const coverageSum = progressGroup[0]?._sum?.coverageScore || 0;
      const syllabusCoverage = distribution.totalTopics > 0 ? (coverageSum / distribution.totalTopics) * 100 : 0;

      let diagnosticAverage = 0;
      if (user?.diagnosticResult) {
        try {
          const diagResult = typeof user.diagnosticResult === "string"
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;

          if (diagResult && diagResult.strengthMap && typeof diagResult.strengthMap === "object") {
            const strengths = Object.values(diagResult.strengthMap) as number[];
            if (strengths.length > 0) {
              const sum = strengths.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
              diagnosticAverage = sum / (distribution.totalSubjects || 12);
            }
          }
        } catch (e) {
          console.error(`Failed to parse diagnostic result for user ${userId}:`, e);
        }
      }

      const score = this.calculateScore(diagnosticAverage, syllabusCoverage);
      userStats = { score, syllabusCoverage, diagnosticAverage };
    }

    const { score, syllabusCoverage, diagnosticAverage } = userStats;

    const totalUsers = Math.max(distribution.sortedScores.length, 1);

    // Determine rank (1-indexed)
    // Find index of first score that is <= user's score
    let rank = distribution.sortedScores.findIndex(s => s <= score) + 1;
    if (rank === 0) {
      // User's score is lower than all onboarded users
      rank = totalUsers + 1;
    }

    // Percentile formula: Math.round(((totalUsers - rank) / totalUsers) * 100), clamped 1-100
    let rawPercentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
    if (totalUsers === 1 && rank === 1) {
      rawPercentile = 100;
    }
    const percentile = Math.min(100, Math.max(1, rawPercentile));

    // Top X% label: where X = 100 - percentile + 1 or Top X%
    const topX = Math.max(1, 100 - percentile);
    const topPercentileLabel = `Top ${topX}%`;

    return {
      score,
      rank,
      totalUsers,
      percentile,
      topPercentileLabel,
      syllabusCoverage: Math.round(syllabusCoverage),
      diagnosticAverage: Math.round(diagnosticAverage)
    };
  }
}
