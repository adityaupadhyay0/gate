import prisma from "@/lib/db/prisma";

export interface PeerRank {
  rank: number;
  totalUsers: number;
  percentile: number;
  score: number;
}

export class PeerBenchmarkingService {
  /**
   * Calculates the global rank and percentile for a user.
   * Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
   */
  static async getGlobalRank(userId: string): Promise<PeerRank> {
    const allUsers = await prisma.user.findMany({
      where: { onboardingComplete: true },
      select: {
        id: true,
        diagnosticResult: true,
        progress: {
          select: { coverageScore: true }
        }
      }
    });

    const totalTopics = await prisma.topic.count();

    const userScores = allUsers.map((user) => {
      // 1. Calculate Diagnostic Average
      let diagAvg = 0;
      try {
        const diagData = user.diagnosticResult ? (typeof user.diagnosticResult === 'string' ? JSON.parse(user.diagnosticResult) : user.diagnosticResult) : null;
        if (diagData?.strengthMap) {
          const strengths = Object.values(diagData.strengthMap) as number[];
          diagAvg = strengths.reduce((a: number, b: number) => a + b, 0) / (strengths.length || 1);
        }
      } catch (e) {
        console.error(`Failed to parse diagnostic for user ${user.id}`, e);
      }

      // 2. Calculate Syllabus Coverage (0-100)
      const totalCoverage = user.progress.reduce((acc: number, curr) => acc + curr.coverageScore, 0);
      const coveragePercent = totalTopics > 0 ? (totalCoverage / totalTopics) * 100 : 0;

      // 3. Weighted Score
      const finalScore = (diagAvg * 0.4) + (coveragePercent * 0.6);

      return {
        userId: user.id,
        score: finalScore
      };
    });

    // Sort by score descending
    userScores.sort((a, b) => b.score - a.score);

    const userRankIndex = userScores.findIndex((u) => u.userId === userId);
    const rank = userRankIndex === -1 ? userScores.length + 1 : userRankIndex + 1;
    const totalUsers = userScores.length;

    // Percentile = ((TotalUsers - Rank) / TotalUsers) * 100
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - rank) / totalUsers) * 100) : 0;

    return {
      rank,
      totalUsers,
      percentile: Math.max(0, percentile),
      score: userScores[userRankIndex]?.score || 0
    };
  }
}
