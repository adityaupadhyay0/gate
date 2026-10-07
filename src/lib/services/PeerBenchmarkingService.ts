import prisma from "@/lib/db/prisma";

export interface UserBenchmarkMetrics {
  userId: string;
  score: number;
  diagnosticAverage: number;
  syllabusCoverage: number;
  rank: number;
  totalUsers: number;
  topPercentile: number;
  overallPercentile: number;
  rankBand: string;
}

interface CachedDistribution {
  timestamp: number;
  scores: { userId: string; score: number }[];
  totalTopics: number;
  subjectCount: number;
}

export class PeerBenchmarkingService {
  private static distributionCache: CachedDistribution | null = null;
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  public static _clearCache(): void {
    this.distributionCache = null;
  }

  public static getRankBand(score: number): string {
    if (score > 85) return "Top 100";
    if (score > 70) return "Top 500";
    if (score > 55) return "Top 2000";
    if (score > 40) return "Top 5000";
    if (score > 25) return "Top 10000";
    return "Top 20000+";
  }

  public static async calculateUserScore(
    userId: string,
    totalTopics: number,
    subjectCount: number
  ): Promise<{ score: number; diagnosticAverage: number; syllabusCoverage: number }> {
    const [user, progressSum] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { diagnosticResult: true }
      }),
      prisma.userProgress.aggregate({
        where: { userId },
        _sum: { coverageScore: true }
      })
    ]);

    // Calculate Syllabus Coverage (0-100 scale)
    const rawCoverageSum = progressSum._sum.coverageScore || 0;
    const syllabusCoverage = totalTopics > 0 ? Math.round((rawCoverageSum / totalTopics) * 100) : 0;

    // Calculate Diagnostic Average using dynamic subject count
    let diagnosticAverage = 0;
    if (user?.diagnosticResult) {
      try {
        const diagObj = typeof user.diagnosticResult === "string"
          ? JSON.parse(user.diagnosticResult)
          : user.diagnosticResult;

        if (diagObj && diagObj.strengthMap && typeof diagObj.strengthMap === "object") {
          const strengths = Object.values(diagObj.strengthMap) as number[];
          if (strengths.length > 0) {
            const totalStrength = strengths.reduce((sum, val) => sum + (Number(val) || 0), 0);
            const countToUse = subjectCount > 0 ? subjectCount : strengths.length;
            diagnosticAverage = totalStrength / countToUse;
          }
        }
      } catch (e) {
        console.error("Failed to parse user diagnosticResult:", e);
      }
    }

    // Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
    const score = Math.round((diagnosticAverage * 0.4) + (syllabusCoverage * 0.6));

    return {
      score,
      diagnosticAverage: Math.round(diagnosticAverage * 10) / 10,
      syllabusCoverage
    };
  }

  public static async getUserBenchmark(userId: string): Promise<UserBenchmarkMetrics> {
    const now = Date.now();
    let cache = this.distributionCache;

    if (!cache || (now - cache.timestamp) > this.CACHE_TTL_MS) {
      const [totalTopics, subjectCount, onboardedUsers] = await Promise.all([
        prisma.topic.count(),
        prisma.subject.count(),
        prisma.user.findMany({
          where: { onboardingComplete: true },
          select: { id: true, diagnosticResult: true }
        })
      ]);

      // Database-level aggregation of coverage scores across all users using groupBy
      const userProgressGroup = await prisma.userProgress.groupBy({
        by: ['userId'],
        _sum: {
          coverageScore: true
        }
      });

      const userCoverageMap = new Map<string, number>();
      userProgressGroup.forEach(group => {
        userCoverageMap.set(group.userId, group._sum.coverageScore || 0);
      });

      // Calculate scores for all onboarded users in a single batch without N+1 queries
      const scoresList: { userId: string; score: number }[] = [];

      for (const u of onboardedUsers) {
        const rawCoverageSum = userCoverageMap.get(u.id) || 0;
        const syllabusCoverage = totalTopics > 0 ? Math.round((rawCoverageSum / totalTopics) * 100) : 0;

        let diagnosticAverage = 0;
        if (u.diagnosticResult) {
          try {
            const diagObj = typeof u.diagnosticResult === "string"
              ? JSON.parse(u.diagnosticResult)
              : u.diagnosticResult;

            if (diagObj && diagObj.strengthMap && typeof diagObj.strengthMap === "object") {
              const strengths = Object.values(diagObj.strengthMap) as number[];
              if (strengths.length > 0) {
                const totalStrength = strengths.reduce((sum, val) => sum + (Number(val) || 0), 0);
                const countToUse = subjectCount > 0 ? subjectCount : strengths.length;
                diagnosticAverage = totalStrength / countToUse;
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        }

        const userScore = Math.round((diagnosticAverage * 0.4) + (syllabusCoverage * 0.6));
        scoresList.push({ userId: u.id, score: userScore });
      }

      // Sort descending by score
      scoresList.sort((a, b) => b.score - a.score);

      cache = {
        timestamp: now,
        scores: scoresList,
        totalTopics,
        subjectCount
      };
      this.distributionCache = cache;
    }

    const { scores, totalTopics, subjectCount } = cache;

    // Calculate specific target user score
    const targetUserScoreDetails = await this.calculateUserScore(userId, totalTopics, subjectCount);

    // If target user is in the onboarded distribution, find rank; otherwise position relative to cohort
    const totalUsers = Math.max(1, scores.length);
    let rank = scores.findIndex(s => s.userId === userId) + 1;

    if (rank === 0) {
      // User not in onboarded list; compute rank by insertion position
      rank = scores.filter(s => s.score > targetUserScoreDetails.score).length + 1;
    }

    // Top Percentile formula
    const topPercentile = rank === 1 ? 1 : Math.max(1, Math.min(100, Math.round((rank / totalUsers) * 100)));
    const overallPercentile = Math.max(1, Math.min(100, 100 - topPercentile));
    const rankBand = this.getRankBand(targetUserScoreDetails.score);

    return {
      userId,
      score: targetUserScoreDetails.score,
      diagnosticAverage: targetUserScoreDetails.diagnosticAverage,
      syllabusCoverage: targetUserScoreDetails.syllabusCoverage,
      rank,
      totalUsers,
      topPercentile,
      overallPercentile,
      rankBand
    };
  }
}
