import prisma from "@/lib/db/prisma";

export interface BenchmarkingResult {
  rank: number;
  totalUsers: number;
  percentile: number;
  score: number;
}

// Simple in-memory cache for user scores to prevent re-calculating everything on every request
let cachedUserScores: { id: string; score: number }[] | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export class PeerBenchmarkingService {
  /**
   * Calculates the real-time global rank and percentile for a user.
   * Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  static async calculateRank(userId: string): Promise<BenchmarkingResult | null> {
    const now = Date.now();

    // 1. Refresh cache if empty or expired
    if (!cachedUserScores || (now - lastCacheUpdate) > CACHE_TTL) {
      await this.refreshCache();
    }

    if (!cachedUserScores || cachedUserScores.length === 0) return null;

    // 2. Find the target user's rank in the cached distribution
    const userRankIndex = cachedUserScores.findIndex(u => u.id === userId);

    // If user hasn't completed onboarding or is a guest, they won't be in the list
    if (userRankIndex === -1) {
       // If not in cache, maybe they just finished onboarding.
       // For a small scale, we can force refresh or just wait for next cycle.
       // Here we force refresh once if user is missing to handle just-finished-onboarding
       await this.refreshCache();
       const retryIndex = cachedUserScores.findIndex(u => u.id === userId);
       if (retryIndex === -1) return null;

       return this.formatResult(retryIndex, cachedUserScores);
    }

    return this.formatResult(userRankIndex, cachedUserScores);
  }

  private static formatResult(index: number, scores: { id: string; score: number }[]) {
    const rank = index + 1;
    const totalUsers = scores.length;
    const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
    const score = scores[index].score;

    return {
      rank,
      totalUsers,
      percentile,
      score
    };
  }

  /** @internal - For testing only */
  static async _clearCache() {
    cachedUserScores = null;
    lastCacheUpdate = 0;
  }

  private static async refreshCache() {
    try {
      const [users, subjectCount, totalTopics] = await Promise.all([
        prisma.user.findMany({
          where: { onboardingComplete: true },
          select: {
            id: true,
            diagnosticResult: true,
            progress: {
              select: { coverageScore: true }
            }
          }
        }),
        prisma.subject.count(),
        prisma.topic.count()
      ]);

      if (users.length === 0 || totalTopics === 0) {
        cachedUserScores = [];
        lastCacheUpdate = Date.now();
        return;
      }

      // Default to 12 if no subjects yet, but use dynamic count if available
      const divisor = subjectCount || 12;

      const userScores = users.map(u => {
        let diagAvg = 0;
        try {
          const diagData = typeof u.diagnosticResult === 'string'
            ? JSON.parse(u.diagnosticResult)
            : u.diagnosticResult as any;

          if (diagData?.strengthMap) {
            const strengths = Object.values(diagData.strengthMap) as number[];
            diagAvg = strengths.reduce((a, b) => a + b, 0) / divisor;
          }
        } catch (e) {
          console.error(`[PeerBenchmarking] Failed to parse diagnostic for user ${u.id}:`, e);
        }

        const totalCoverage = u.progress.reduce((acc, p) => acc + p.coverageScore, 0);
        const mastery = (totalCoverage / totalTopics) * 100;

        const score = (diagAvg * 0.4) + (mastery * 0.6);
        return { id: u.id, score };
      });

      userScores.sort((a, b) => b.score - a.score);

      cachedUserScores = userScores;
      lastCacheUpdate = Date.now();
      console.log(`[PeerBenchmarking] Cache refreshed with ${userScores.length} users.`);
    } catch (e) {
      console.error("[PeerBenchmarking] Cache refresh failed:", e);
    }
  }
}
