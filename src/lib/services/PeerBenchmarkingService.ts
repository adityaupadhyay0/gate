import prisma from "@/lib/db/prisma";

export interface SubjectBenchmark {
  subjectId: string;
  subjectName: string;
  userStrength: number;
  cohortAverage: number;
}

export interface PeerBenchmarkingResult {
  rank: number;
  totalUsers: number;
  topPercentile: number;
  percentileRank: number;
  score: number;
  cohortAverageScore: number;
  estimatedRankRange: string;
  subjectBenchmarks: SubjectBenchmark[];
}

interface CachedScores {
  timestamp: number;
  userScores: Map<string, { score: number; diagAvg: number; coveragePct: number }>;
  cohortAverageScore: number;
  totalSubjectsCount: number;
  totalTopicsCount: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in-memory cache

export class PeerBenchmarkingService {
  private static cache: CachedScores | null = null;

  /**
   * Clears the in-memory cache. Used for unit testing isolation.
   */
  static _clearCache(): void {
    this.cache = null;
  }

  /**
   * Fetches or updates cached distribution of all onboarded users.
   */
  private static async getDistribution(): Promise<CachedScores> {
    const now = Date.now();
    if (this.cache && (now - this.cache.timestamp < CACHE_TTL_MS)) {
      return this.cache;
    }

    const [onboardedUsers, progressAgg, totalSubjectsCount, totalTopicsCount] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: { id: true, diagnosticResult: true }
      }),
      prisma.userProgress.groupBy({
        by: ["userId"],
        _sum: { coverageScore: true }
      }),
      prisma.subject.count(),
      prisma.topic.count()
    ]);

    const subjectsCount = totalSubjectsCount > 0 ? totalSubjectsCount : 12;
    const topicsCount = totalTopicsCount > 0 ? totalTopicsCount : 1;

    // Map progress sum by userId
    const progressMap = new Map<string, number>();
    progressAgg.forEach((p) => {
      progressMap.set(p.userId, p._sum.coverageScore || 0);
    });

    const userScores = new Map<string, { score: number; diagAvg: number; coveragePct: number }>();
    let scoreSum = 0;

    for (const user of onboardedUsers) {
      let diagAvg = 0;
      if (user.diagnosticResult) {
        try {
          const diag = typeof user.diagnosticResult === "string"
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;

          if (diag && diag.strengthMap && typeof diag.strengthMap === "object") {
            const strengths = Object.values(diag.strengthMap) as number[];
            if (strengths.length > 0) {
              const sumStrengths = strengths.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
              diagAvg = sumStrengths / strengths.length;
            }
          }
        } catch (e) {
          console.error(`Error parsing diagnosticResult for user ${user.id}:`, e);
        }
      }

      const rawCoverageSum = progressMap.get(user.id) || 0;
      const coveragePct = Math.min(100, (rawCoverageSum / topicsCount) * 100);

      // Preparation Score Formula: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
      const prepScore = Math.round((diagAvg * 0.4) + (coveragePct * 0.6));

      userScores.set(user.id, {
        score: prepScore,
        diagAvg: Math.round(diagAvg),
        coveragePct: Math.round(coveragePct)
      });
      scoreSum += prepScore;
    }

    const totalCount = onboardedUsers.length;
    const cohortAverageScore = totalCount > 0 ? Math.round(scoreSum / totalCount) : 0;

    this.cache = {
      timestamp: now,
      userScores,
      cohortAverageScore,
      totalSubjectsCount: subjectsCount,
      totalTopicsCount: topicsCount
    };

    return this.cache;
  }

  /**
   * Main method to benchmark a specific user against the active cohort.
   */
  static async getPeerBenchmarking(userId: string): Promise<PeerBenchmarkingResult> {
    const distribution = await this.getDistribution();
    const { userScores, cohortAverageScore } = distribution;

    let userMetrics = userScores.get(userId);

    // If user is not in the onboarded distribution yet, calculate on the fly
    if (!userMetrics) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { diagnosticResult: true }
      });

      let diagAvg = 0;
      if (user?.diagnosticResult) {
        try {
          const diag = typeof user.diagnosticResult === "string"
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;

          if (diag && diag.strengthMap && typeof diag.strengthMap === "object") {
            const strengths = Object.values(diag.strengthMap) as number[];
            if (strengths.length > 0) {
              const sumStrengths = strengths.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
              diagAvg = sumStrengths / strengths.length;
            }
          }
        } catch (e) {
          console.error(`Failed to parse diagnostic result for user ${userId}`, e);
        }
      }

      const userProgress = await prisma.userProgress.findMany({
        where: { userId },
        select: { coverageScore: true }
      });

      const rawCoverageSum = userProgress.reduce((acc, curr) => acc + curr.coverageScore, 0);
      const coveragePct = Math.min(100, (rawCoverageSum / distribution.totalTopicsCount) * 100);
      const prepScore = Math.round((diagAvg * 0.4) + (coveragePct * 0.6));

      userMetrics = {
        score: prepScore,
        diagAvg: Math.round(diagAvg),
        coveragePct: Math.round(coveragePct)
      };
    }

    const targetScore = userMetrics.score;
    const totalUsers = Math.max(1, userScores.size);

    // Rank calculation: count how many users have a strictly higher score
    let higherCount = 0;
    userScores.forEach((val) => {
      if (val.score > targetScore) {
        higherCount++;
      }
    });

    const rank = higherCount + 1;

    // Percentile calculations
    const topPercentile = rank === 1 ? 1 : Math.max(1, Math.min(100, Math.round((rank / totalUsers) * 100)));
    const percentileRank = Math.max(0, Math.min(100, 100 - topPercentile));

    const estimatedRankRange = this.computeRankRange(targetScore, rank);

    // Fetch subject strength benchmarks vs cohort
    const subjectBenchmarks = await this.getSubjectBenchmarks(userId);

    return {
      rank,
      totalUsers,
      topPercentile,
      percentileRank,
      score: targetScore,
      cohortAverageScore,
      estimatedRankRange,
      subjectBenchmarks
    };
  }

  private static computeRankRange(score: number, rank: number): string {
    if (rank === 1 && score > 80) return "Rank #1 Candidate";
    if (score > 85) return "Top 100";
    if (score > 70) return "Top 500";
    if (score > 55) return "Top 2000";
    if (score > 40) return "Top 5000";
    if (score > 25) return "Top 10000";
    return "Top 20000+";
  }

  private static async getSubjectBenchmarks(userId: string): Promise<SubjectBenchmark[]> {
    const subjects = await prisma.subject.findMany({
      include: {
        topics: {
          include: {
            userProgress: true
          }
        }
      }
    });

    const results: SubjectBenchmark[] = [];

    for (const subject of subjects) {
      if (subject.topics.length === 0) continue;

      let userSum = 0;
      let totalCohortSum = 0;
      let totalCohortEntries = 0;

      for (const topic of subject.topics) {
        topic.userProgress.forEach((p) => {
          totalCohortSum += p.coverageScore;
          totalCohortEntries++;
          if (p.userId === userId) {
            userSum += p.coverageScore;
          }
        });
      }

      const userStrength = Math.min(100, Math.round((userSum / subject.topics.length) * 100));
      const cohortAvgRaw = totalCohortEntries > 0
        ? Math.min(100, Math.round((totalCohortSum / totalCohortEntries) * 100))
        : 0;

      results.push({
        subjectId: subject.id,
        subjectName: subject.name,
        userStrength,
        cohortAverage: cohortAvgRaw
      });
    }

    return results;
  }
}
