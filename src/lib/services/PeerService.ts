import prisma from "@/lib/db/prisma";

export interface GlobalStats {
  percentile: number;
  rank: number;
  totalUsers: number;
  averageMastery: number;
  averageDiagnosticScore: number;
}

export class PeerBenchmarkingService {
  /**
   * Calculates the user's relative standing among all aspirants who completed onboarding.
   * Score Formula: (Diagnostic Avg * 0.4) + (Syllabus Coverage * 0.6)
   */
  static async getGlobalStats(userId: string): Promise<GlobalStats | null> {
    const totalTopics = await prisma.topic.count();
    if (totalTopics === 0) return null;

    // Fetch all users with progress and diagnostic results
    const users = await prisma.user.findMany({
      where: { onboardingComplete: true },
      select: {
        id: true,
        diagnosticResult: true,
        progress: {
          select: { coverageScore: true }
        }
      }
    });

    if (users.length === 0) return null;

    const userScores = users.map(user => {
      // Calculate Mastery (0-100)
      const totalScore = user.progress.reduce((acc, curr) => acc + curr.coverageScore, 0);
      const mastery = (totalScore / totalTopics) * 100;

      // Calculate Diagnostic Score (0-100)
      let diagAvg = 0;
      try {
        const diagData = typeof user.diagnosticResult === 'string'
          ? JSON.parse(user.diagnosticResult)
          : user.diagnosticResult;

        if (diagData && diagData.strengthMap) {
          const strengths = Object.values(diagData.strengthMap) as number[];
          diagAvg = strengths.length > 0 ? strengths.reduce((a, b) => a + b, 0) / strengths.length : 0;
        }
      } catch (e) {
        console.error(`Error parsing diagnostic for user ${user.id}:`, e);
      }

      // Final Rank Score (Unified Metric)
      const rankScore = (diagAvg * 0.4) + (mastery * 0.6);

      return {
        id: user.id,
        rankScore,
        mastery,
        diagAvg
      };
    });

    // Sort by rankScore descending (Higher is better)
    userScores.sort((a, b) => b.rankScore - a.rankScore);

    const currentUserIndex = userScores.findIndex(u => u.id === userId);

    // Calculate global averages
    const totalUsers = userScores.length;
    const avgMastery = userScores.reduce((a, b) => a + b.mastery, 0) / totalUsers;
    const avgDiag = userScores.reduce((a, b) => a + b.diagAvg, 0) / totalUsers;

    if (currentUserIndex === -1) {
       return {
          percentile: 0,
          rank: 0,
          totalUsers,
          averageMastery: Math.round(avgMastery),
          averageDiagnosticScore: Math.round(avgDiag)
       };
    }

    const rank = currentUserIndex + 1;
    // Percentile: (Count of users below you / Total users) * 100
    const percentile = ((totalUsers - rank) / totalUsers) * 100;

    return {
      percentile: Math.round(percentile),
      rank,
      totalUsers,
      averageMastery: Math.round(avgMastery),
      averageDiagnosticScore: Math.round(avgDiag)
    };
  }
}
