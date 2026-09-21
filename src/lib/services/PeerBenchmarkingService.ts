import prisma from "@/lib/db/prisma";

export interface PeerBenchmarkingStats {
  rank: number | null;
  percentile: number | null;
  totalUsers: number;
  score: number;
}

interface UserScoreDistribution {
  userId: string;
  score: number;
}

interface CacheEntry {
  timestamp: number;
  totalUsers: number;
  distribution: UserScoreDistribution[];
}

export class PeerBenchmarkingService {
  private static cache: CacheEntry | null = null;
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  static _clearCache(): void {
    this.cache = null;
  }

  static async getBenchmarkingStats(userId: string): Promise<PeerBenchmarkingStats> {
    const distributionData = await this.getOrUpdateDistribution();
    const { totalUsers, distribution } = distributionData;

    if (totalUsers === 0) {
      return { rank: null, percentile: null, totalUsers: 0, score: 0 };
    }

    const userIndex = distribution.findIndex((u) => u.userId === userId);

    if (userIndex === -1) {
      // User is either not onboarded or not found in distribution
      return { rank: null, percentile: null, totalUsers, score: 0 };
    }

    const rank = userIndex + 1;
    // Formula: Math.round(((totalUsers - rank) / totalUsers) * 100), clamped between 1 and 100
    const rawPercentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
    const percentile = Math.max(1, Math.min(100, rawPercentile));
    const score = Math.round(distribution[userIndex].score * 10) / 10;

    return {
      rank,
      percentile,
      totalUsers,
      score,
    };
  }

  private static async getOrUpdateDistribution(): Promise<CacheEntry> {
    const now = Date.now();
    if (this.cache && now - this.cache.timestamp < this.CACHE_TTL_MS) {
      return this.cache;
    }

    const [onboardedUsers, totalSubjectsCount, totalTopicsCount, userProgressSums] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true },
      }),
      prisma.subject.count(),
      prisma.topic.count(),
      prisma.userProgress.groupBy({
        by: ["userId"],
        _sum: { coverageScore: true },
      }),
    ]);

    const totalSubjects = totalSubjectsCount > 0 ? totalSubjectsCount : 12;
    const totalTopics = totalTopicsCount > 0 ? totalTopicsCount : 100;

    // Map user progress sum
    const progressMap = new Map<string, number>();
    for (const group of userProgressSums) {
      if (group.userId && group._sum.coverageScore !== null) {
        progressMap.set(group.userId, group._sum.coverageScore);
      }
    }

    const distribution: UserScoreDistribution[] = [];

    for (const user of onboardedUsers) {
      // 1. Calculate Diagnostic Average
      let diagnosticAverage = 0;
      if (user.diagnosticResult) {
        try {
          const parsed = typeof user.diagnosticResult === "string"
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;

          if (parsed && parsed.strengthMap && typeof parsed.strengthMap === "object") {
            const strengths = Object.values(parsed.strengthMap) as number[];
            if (strengths.length > 0) {
              const sumStrength = strengths.reduce((a, b) => a + Number(b), 0);
              diagnosticAverage = sumStrength / totalSubjects;
            }
          }
        } catch (e) {
          console.error(`Failed to parse diagnosticResult for user ${user.id}:`, e);
        }
      }

      // 2. Calculate Syllabus Coverage percentage
      const totalCoverageScore = progressMap.get(user.id) || 0;
      const syllabusCoverage = Math.min(100, (totalCoverageScore / totalTopics) * 100);

      // 3. Benchmarking Score Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
      const benchmarkingScore = (diagnosticAverage * 0.4) + (syllabusCoverage * 0.6);

      distribution.push({
        userId: user.id,
        score: benchmarkingScore,
      });
    }

    // Sort descending by score
    distribution.sort((a, b) => b.score - a.score);

    const cacheEntry: CacheEntry = {
      timestamp: now,
      totalUsers: onboardedUsers.length,
      distribution,
    };

    this.cache = cacheEntry;
    return cacheEntry;
  }
}
