import prisma from "@/lib/db/prisma";

export interface PeerBenchmarkingMetrics {
  userScore: number;
  peerAverageScore: number;
  estimatedRank: number;
  totalPeerCount: number;
  topPercentile: number;
  overallPercentile: number;
  percentileHighlight: string;
  rankEstimationText: string;
  isCalibrated: boolean;
}

interface UserScoreData {
  userId: string;
  score: number;
}

interface CacheStore {
  timestamp: number;
  userScores: UserScoreData[];
  totalTopicsCount: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
let globalDistributionCache: CacheStore | null = null;

export class PeerBenchmarkingService {
  /**
   * Clears in-memory distribution cache. Used for unit testing and cache invalidation.
   */
  static _clearCache(): void {
    globalDistributionCache = null;
  }

  /**
   * Calculates peer benchmarking metrics for a given user against all onboarded users.
   */
  static async getUserPeerMetrics(userId: string): Promise<PeerBenchmarkingMetrics> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { diagnosticResult: true, onboardingComplete: true }
    });

    const totalTopics = await this.getTotalTopicsCount();
    const userCoverage = await this.getUserSyllabusCoverage(userId, totalTopics);

    let diagAvg = 0;
    let isCalibrated = false;

    if (user?.diagnosticResult) {
      try {
        const parsed = typeof user.diagnosticResult === "string"
          ? JSON.parse(user.diagnosticResult)
          : user.diagnosticResult;

        if (parsed?.strengthMap && typeof parsed.strengthMap === "object") {
          const strengths = Object.values(parsed.strengthMap) as number[];
          const subjectCount = strengths.length || 1;
          diagAvg = strengths.reduce((acc, curr) => acc + (typeof curr === "number" ? curr : 0), 0) / subjectCount;
          isCalibrated = true;
        }
      } catch (e) {
        console.error("Failed to parse diagnosticResult in PeerBenchmarkingService:", e);
      }
    }

    // Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
    const userScore = Math.round((diagAvg * 0.4) + (userCoverage * 0.6));

    const distribution = await this.getGlobalScoreDistribution(totalTopics);

    // If user is not in onboarded distribution yet, include them dynamically
    const allUserScores = [...distribution.userScores];
    const existingIndex = allUserScores.findIndex(u => u.userId === userId);
    if (existingIndex >= 0) {
      allUserScores[existingIndex].score = userScore;
    } else {
      allUserScores.push({ userId, score: userScore });
    }

    const totalUsers = allUserScores.length || 1;

    // Sort descending by score
    allUserScores.sort((a, b) => b.score - a.score);

    // Rank is 1-indexed count of users with higher score + 1
    const higherScoresCount = allUserScores.filter(u => u.score > userScore).length;
    const estimatedRank = higherScoresCount + 1;

    // Percentile calculations
    const topPercentile = estimatedRank === 1 ? 1 : Math.max(1, Math.min(100, Math.round((estimatedRank / totalUsers) * 100)));
    const overallPercentile = Math.max(1, Math.min(100, 100 - topPercentile));

    const totalScoreSum = allUserScores.reduce((sum, u) => sum + u.score, 0);
    const peerAverageScore = Math.round(totalScoreSum / totalUsers);

    const percentileHighlight = `Top ${topPercentile}%`;
    const rankEstimationText = this.formatRankEstimationText(userScore, isCalibrated);

    return {
      userScore,
      peerAverageScore,
      estimatedRank,
      totalPeerCount: totalUsers,
      topPercentile,
      overallPercentile,
      percentileHighlight,
      rankEstimationText,
      isCalibrated
    };
  }

  private static async getTotalTopicsCount(): Promise<number> {
    if (globalDistributionCache && (Date.now() - globalDistributionCache.timestamp) < CACHE_TTL_MS) {
      return globalDistributionCache.totalTopicsCount;
    }
    const count = await prisma.topic.count();
    return count || 1;
  }

  private static async getUserSyllabusCoverage(userId: string, totalTopics: number): Promise<number> {
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      select: { coverageScore: true }
    });

    if (userProgress.length === 0 || totalTopics === 0) return 0;
    const totalScore = userProgress.reduce((acc, curr) => acc + curr.coverageScore, 0);
    return Math.round((totalScore / totalTopics) * 100);
  }

  private static async getGlobalScoreDistribution(totalTopicsCount: number): Promise<CacheStore> {
    if (globalDistributionCache && (Date.now() - globalDistributionCache.timestamp) < CACHE_TTL_MS) {
      return globalDistributionCache;
    }

    // Fetch onboarded users
    const onboardedUsers = await prisma.user.findMany({
      where: { onboardingComplete: true },
      select: { id: true, diagnosticResult: true }
    });

    // Use prisma.userProgress.groupBy for DB-level aggregation of syllabus coverage per user
    const coverageAggregations = await prisma.userProgress.groupBy({
      by: ['userId'],
      _sum: {
        coverageScore: true
      }
    });

    const coverageMap = new Map<string, number>();
    coverageAggregations.forEach(item => {
      const sumScore = item._sum.coverageScore || 0;
      const coverage = Math.round((sumScore / totalTopicsCount) * 100);
      coverageMap.set(item.userId, coverage);
    });

    const userScores: UserScoreData[] = onboardedUsers.map(user => {
      let diagAvg = 0;
      if (user.diagnosticResult) {
        try {
          const parsed = typeof user.diagnosticResult === "string"
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;
          if (parsed?.strengthMap && typeof parsed.strengthMap === "object") {
            const strengths = Object.values(parsed.strengthMap) as number[];
            const subjectCount = strengths.length || 1;
            diagAvg = strengths.reduce((a, b) => a + (typeof b === "number" ? b : 0), 0) / subjectCount;
          }
        } catch (e) {
          // fallback to 0
        }
      }

      const coverage = coverageMap.get(user.id) || 0;
      const score = Math.round((diagAvg * 0.4) + (coverage * 0.6));
      return { userId: user.id, score };
    });

    globalDistributionCache = {
      timestamp: Date.now(),
      userScores,
      totalTopicsCount
    };

    return globalDistributionCache;
  }

  private static formatRankEstimationText(score: number, isCalibrated: boolean): string {
    if (!isCalibrated) return "Not Calibrated";
    if (score > 85) return "Top 100";
    if (score > 70) return "Top 500";
    if (score > 55) return "Top 2000";
    if (score > 40) return "Top 5000";
    if (score > 25) return "Top 10000";
    return "Top 20000+";
  }
}
