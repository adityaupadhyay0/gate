import prisma from "@/lib/db/prisma";
import { AnalyticsService } from "@/lib/services/AnalyticsService";

export interface SubjectPeerBenchmark {
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  userMastery: number;
  peerAverageMastery: number;
  topPerformersMastery: number;
  diffFromAverage: number;
}

export interface UserPeerBenchmark {
  userId: string;
  compositeScore: number;
  rank: number;
  totalUsers: number;
  topPercentile: number;
  percentile: number;
  estimatedNationalRank: number;
  rankLabel: string;
  subjectBenchmarks: SubjectPeerBenchmark[];
  insights: {
    topSubject: { name: string; advantage: number } | null;
    focusSubject: { name: string; gap: number } | null;
  };
}

interface CachedDistribution {
  timestamp: number;
  userScores: {
    userId: string;
    compositeScore: number;
    subjectMasteryMap: Record<string, number>;
  }[];
}

let cachedDistribution: CachedDistribution | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class PeerBenchmarkingService {
  /**
   * Clears in-memory distribution cache (useful for testing).
   */
  static _clearCache() {
    cachedDistribution = null;
  }

  /**
   * Computes the global user distribution across all platform users.
   */
  private static async getGlobalDistribution() {
    const now = Date.now();
    if (cachedDistribution && now - cachedDistribution.timestamp < CACHE_TTL_MS) {
      return cachedDistribution.userScores;
    }

    const [users, subjects] = await Promise.all([
      prisma.user.findMany({
        where: { onboardingComplete: true },
        select: {
          id: true,
          diagnosticResult: true,
        }
      }),
      prisma.subject.findMany({
        include: {
          topics: {
            select: { id: true }
          }
        }
      })
    ]);

    // Efficiently query progress grouped by user and topic
    const allProgress = await prisma.userProgress.groupBy({
      by: ['userId', 'topicId'],
      _avg: { coverageScore: true }
    });

    const userProgressMap: Record<string, Record<string, number>> = {};
    allProgress.forEach(p => {
      if (!userProgressMap[p.userId]) userProgressMap[p.userId] = {};
      userProgressMap[p.userId][p.topicId] = p._avg.coverageScore || 0;
    });

    const totalTopicsCount = subjects.reduce((sum, s) => sum + s.topics.length, 0);

    const userScores = users.map(user => {
      let diagAvg = 0;
      if (user.diagnosticResult) {
        try {
          const parsed = typeof user.diagnosticResult === 'string'
            ? JSON.parse(user.diagnosticResult)
            : user.diagnosticResult;
          if (parsed && parsed.strengthMap) {
            const values = Object.values(parsed.strengthMap) as number[];
            if (values.length > 0) {
              diagAvg = values.reduce((a, b) => a + b, 0) / values.length;
            }
          }
        } catch (e) {
          console.error(`Failed parsing diagnosticResult for user ${user.id}:`, e);
        }
      }

      // Compute syllabus coverage & subject-wise mastery
      const userProgress = userProgressMap[user.id] || {};
      let totalCoverageScoreSum = 0;
      const subjectMasteryMap: Record<string, number> = {};

      subjects.forEach(subject => {
        if (subject.topics.length === 0) {
          subjectMasteryMap[subject.id] = 0;
          return;
        }

        let subjectScoreSum = 0;
        subject.topics.forEach(topic => {
          const score = userProgress[topic.id] || 0;
          subjectScoreSum += score;
          totalCoverageScoreSum += score;
        });

        const subjectMastery = Math.round((subjectScoreSum / subject.topics.length) * 100);
        subjectMasteryMap[subject.id] = Math.min(100, Math.max(0, subjectMastery));
      });

      const overallSyllabusCoverage = totalTopicsCount > 0
        ? Math.round((totalCoverageScoreSum / totalTopicsCount) * 100)
        : 0;

      const compositeScore = Math.round((diagAvg * 0.4) + (overallSyllabusCoverage * 0.6));

      return {
        userId: user.id,
        compositeScore,
        subjectMasteryMap
      };
    });

    // Sort descending by compositeScore
    userScores.sort((a, b) => b.compositeScore - a.compositeScore);

    cachedDistribution = {
      timestamp: now,
      userScores
    };

    return userScores;
  }

  /**
   * Generates comprehensive peer benchmarking metrics for a specific user.
   */
  static async getUserBenchmark(userId: string): Promise<UserPeerBenchmark> {
    const [distribution, subjects, user, userOverallMastery] = await Promise.all([
      this.getGlobalDistribution(),
      prisma.subject.findMany({
        include: {
          topics: {
            include: {
              userProgress: { where: { userId } }
            }
          }
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, diagnosticResult: true }
      }),
      AnalyticsService.calculateOverallMastery(userId)
    ]);

    // Parse diagnostic average
    let diagAvg = 0;
    if (user?.diagnosticResult) {
      try {
        const parsed = typeof user.diagnosticResult === 'string'
          ? JSON.parse(user.diagnosticResult)
          : user.diagnosticResult;
        if (parsed && parsed.strengthMap) {
          const values = Object.values(parsed.strengthMap) as number[];
          if (values.length > 0) {
            diagAvg = values.reduce((a, b) => a + b, 0) / values.length;
          }
        }
      } catch (e) {
        console.error("Error parsing diagnostic result in PeerBenchmarkingService:", e);
      }
    }

    const userCompositeScore = Math.round((diagAvg * 0.4) + (userOverallMastery * 0.6));

    // Find user in global distribution or position them
    let userRank = distribution.findIndex(u => u.userId === userId) + 1;
    let totalUsers = distribution.length;

    if (userRank === 0) {
      // User is not yet in onboardingComplete cohort, insert virtually
      totalUsers += 1;
      const higherCount = distribution.filter(u => u.compositeScore > userCompositeScore).length;
      userRank = higherCount + 1;
    }

    // Percentile calculations
    const topPercentile = userRank === 1 ? 1 : Math.max(1, Math.min(100, Math.round((userRank / totalUsers) * 100)));
    const percentile = Math.max(1, Math.min(100, 100 - topPercentile));
    const estimatedNationalRank = Math.max(1, Math.round((topPercentile / 100) * 100000));

    let rankLabel = `Top ${topPercentile}%`;
    if (estimatedNationalRank <= 100) rankLabel = "Top 100";
    else if (estimatedNationalRank <= 500) rankLabel = "Top 500";
    else if (estimatedNationalRank <= 2000) rankLabel = "Top 2000";

    // Top 10% Decile subset
    const top10Count = Math.max(1, Math.ceil(distribution.length * 0.1));
    const top10Cohort = distribution.slice(0, top10Count);

    const subjectBenchmarks: SubjectPeerBenchmark[] = subjects.map(subject => {
      // Calculate user's mastery for this subject
      const totalTopics = subject.topics.length;
      let userSubjectMastery = 0;

      if (totalTopics > 0) {
        const totalScore = subject.topics.reduce((acc, topic) => {
          const progress = topic.userProgress[0];
          return acc + (progress?.coverageScore || 0);
        }, 0);
        userSubjectMastery = Math.round((totalScore / totalTopics) * 100);
      }

      // Calculate cohort average
      let peerAvgSum = 0;
      distribution.forEach(u => {
        peerAvgSum += u.subjectMasteryMap[subject.id] || 0;
      });
      const peerAverageMastery = distribution.length > 0
        ? Math.round(peerAvgSum / distribution.length)
        : userSubjectMastery;

      // Calculate top 10% decile average
      let top10Sum = 0;
      top10Cohort.forEach(u => {
        top10Sum += u.subjectMasteryMap[subject.id] || 0;
      });
      const topPerformersMastery = top10Cohort.length > 0
        ? Math.round(top10Sum / top10Cohort.length)
        : Math.max(userSubjectMastery, peerAverageMastery);

      const diffFromAverage = userSubjectMastery - peerAverageMastery;

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectSlug: subject.slug,
        userMastery: userSubjectMastery,
        peerAverageMastery,
        topPerformersMastery,
        diffFromAverage
      };
    });

    // Insights computation
    let topSubject: { name: string; advantage: number } | null = null;
    let focusSubject: { name: string; gap: number } | null = null;

    if (subjectBenchmarks.length > 0) {
      const sortedByDiff = [...subjectBenchmarks].sort((a, b) => b.diffFromAverage - a.diffFromAverage);
      const highest = sortedByDiff[0];
      const lowest = sortedByDiff[sortedByDiff.length - 1];

      if (highest && highest.diffFromAverage > 0) {
        topSubject = { name: highest.subjectName, advantage: highest.diffFromAverage };
      }
      if (lowest && lowest.diffFromAverage < 0) {
        focusSubject = { name: lowest.subjectName, gap: Math.abs(lowest.diffFromAverage) };
      }
    }

    return {
      userId,
      compositeScore: userCompositeScore,
      rank: userRank,
      totalUsers,
      topPercentile,
      percentile,
      estimatedNationalRank,
      rankLabel,
      subjectBenchmarks,
      insights: {
        topSubject,
        focusSubject
      }
    };
  }
}
