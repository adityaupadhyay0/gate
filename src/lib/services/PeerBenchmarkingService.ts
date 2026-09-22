import prisma from "@/lib/db/prisma";

export interface PeerBenchmarkingResult {
  estimatedRank: string;
  percentile: number;
  totalOnboardedPeers: number;
  userScore: number;
  isCalibrated: boolean;
}

interface CacheEntry {
  timestamp: number;
  scores: { userId: string; score: number }[];
}

let cachedDistribution: CacheEntry | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class PeerBenchmarkingService {
  /**
   * Calculates composite score for a user:
   * (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  static calculateCompositeScore(
    coveragePercent: number,
    diagnosticResultJson: string | null | undefined,
    subjectCount: number
  ): { score: number; isCalibrated: boolean } {
    let diagnosticAvg = 0;
    let isCalibrated = false;

    if (diagnosticResultJson) {
      try {
        const diag = typeof diagnosticResultJson === "string" ? JSON.parse(diagnosticResultJson) : diagnosticResultJson;
        if (diag && diag.strengthMap && typeof diag.strengthMap === "object") {
          const strengths = Object.values(diag.strengthMap) as number[];
          if (strengths.length > 0) {
            const count = subjectCount > 0 ? subjectCount : strengths.length;
            const sum = strengths.reduce((a, b) => a + b, 0);
            diagnosticAvg = sum / count;
            isCalibrated = true;
          }
        }
      } catch (e) {
        console.error("Failed to parse diagnostic result in PeerBenchmarkingService:", e);
      }
    }

    const score = Math.round((diagnosticAvg * 0.4) + (coveragePercent * 0.6));
    return { score, isCalibrated };
  }

  /**
   * Retrieves or computes cached score distribution across all onboarded users.
   */
  private static async getScoreDistribution(): Promise<{ userId: string; score: number }[]> {
    const now = Date.now();
    if (cachedDistribution && now - cachedDistribution.timestamp < CACHE_TTL_MS) {
      return cachedDistribution.scores;
    }

    const [users, totalTopics, userProgressGroups] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true }
      }),
      prisma.topic.count(),
      prisma.userProgress.groupBy({
        by: ['userId'],
        _sum: { coverageScore: true }
      })
    ]);

    const subjectCount = await prisma.subject.count();

    const coverageMap = new Map<string, number>();
    for (const group of userProgressGroups) {
      const sum = group._sum.coverageScore || 0;
      const coverage = totalTopics > 0 ? Math.round((sum / totalTopics) * 100) : 0;
      coverageMap.set(group.userId, coverage);
    }

    const scores = users.map((u) => {
      const coverage = coverageMap.get(u.id) || 0;
      const { score } = this.calculateCompositeScore(coverage, u.diagnosticResult as string, subjectCount);
      return { userId: u.id, score };
    });

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);

    cachedDistribution = {
      timestamp: now,
      scores
    };

    return scores;
  }

  /**
   * Computes peer rank & percentile for a specific user.
   */
  static async getBenchmark(
    userId: string,
    userCoveragePercent: number,
    userDiagnosticJson: string | null | undefined
  ): Promise<PeerBenchmarkingResult> {
    const subjectCount = await prisma.subject.count();
    const { score: userScore, isCalibrated } = this.calculateCompositeScore(
      userCoveragePercent,
      userDiagnosticJson,
      subjectCount
    );

    const scores = await this.getScoreDistribution();
    const totalPeers = scores.length;

    if (totalPeers === 0) {
      return {
        estimatedRank: this.scoreToEstimatedRank(userScore),
        percentile: 50,
        totalOnboardedPeers: 1,
        userScore,
        isCalibrated
      };
    }

    // Rank is 1-indexed position in descending sorted list
    const userIndex = scores.findIndex((s) => s.userId === userId);
    let rank = 1;

    if (userIndex !== -1) {
      rank = userIndex + 1;
    } else {
      // User not in onboarded cache yet, calculate rank insertion
      rank = scores.filter((s) => s.score > userScore).length + 1;
    }

    const effectiveTotal = Math.max(totalPeers, userIndex === -1 ? totalPeers + 1 : totalPeers);
    const calculatedPercentile = Math.round(((effectiveTotal - rank) / effectiveTotal) * 100);
    const percentile = Math.min(100, Math.max(1, calculatedPercentile));

    const estimatedRank = this.scoreToEstimatedRank(userScore);

    return {
      estimatedRank,
      percentile,
      totalOnboardedPeers: effectiveTotal,
      userScore,
      isCalibrated
    };
  }

  private static scoreToEstimatedRank(score: number): string {
    if (score > 85) return "Top 100";
    if (score > 70) return "Top 500";
    if (score > 55) return "Top 2000";
    if (score > 40) return "Top 5000";
    if (score > 25) return "Top 10000";
    return "Top 20000+";
  }

  /**
   * Helper method for testing to clear cache.
   */
  static _clearCache(): void {
    cachedDistribution = null;
  }
}
