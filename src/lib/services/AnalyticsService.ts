import prisma from "@/lib/db/prisma";
import { startOfDay, subDays, differenceInDays } from "date-fns";

export interface DashboardStats {
  overallMastery: number;
  revisionStreak: number;
  criticalWeaknessesCount: number;
  rankEstimation: string;
}

export class AnalyticsService {
  static async getOverallStats(userId: string): Promise<DashboardStats> {
    const [progress, streak, weaknesses, user] = await Promise.all([
      this.calculateOverallMastery(userId),
      this.calculateStreak(userId),
      this.getCriticalWeaknesses(userId),
      prisma.user.findUnique({ where: { id: userId }, select: { diagnosticResult: true } })
    ]);

    let diagnosticData = null;
    try {
      diagnosticData = user?.diagnosticResult ? JSON.parse(user.diagnosticResult as string) : null;
    } catch (e) {
      console.error("Failed to parse diagnostic result:", e);
    }
    const rankEstimation = this.estimateRank(progress, diagnosticData);

    return {
      overallMastery: progress,
      revisionStreak: streak,
      criticalWeaknessesCount: weaknesses.length,
      rankEstimation
    };
  }

  static async calculateOverallMastery(userId: string): Promise<number> {
    const [progress, totalTopics] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId },
        select: { coverageScore: true }
      }),
      prisma.topic.count()
    ]);

    if (progress.length === 0 || totalTopics === 0) return 0;

    const totalScore = progress.reduce((acc, curr) => acc + curr.coverageScore, 0);
    return Math.round((totalScore / totalTopics) * 100);
  }

  static async calculateStreak(userId: string): Promise<number> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        attemptedAt: { gte: thirtyDaysAgo }
      },
      select: { attemptedAt: true },
      orderBy: { attemptedAt: 'desc' }
    });

    if (attempts.length === 0) return 0;

    const uniqueDays = Array.from(new Set(
      attempts.map(a => startOfDay(a.attemptedAt).getTime())
    )).map(t => new Date(t));

    let streak = 0;
    const today = startOfDay(new Date());
    let currentCheck = today;

    // If no attempt today, check if there was one yesterday
    if (uniqueDays[0].getTime() !== today.getTime()) {
      const yesterday = subDays(today, 1);
      if (uniqueDays[0].getTime() !== yesterday.getTime()) {
        return 0; // Streak broken
      }
      currentCheck = yesterday;
    }

    for (const day of uniqueDays) {
      if (differenceInDays(currentCheck, day) === 0) {
        streak++;
        currentCheck = subDays(currentCheck, 1);
      } else {
        break;
      }
    }

    return streak;
  }

  static async getCriticalWeaknesses(userId: string) {
    const sevenDaysAgo = subDays(new Date(), 7);

    // 1. Identify topics with accuracy < 40% (minimum 3 attempts)
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        pyq: { select: { topicId: true } }
      }
    });

    const topicStats: Record<string, { total: number; correct: number }> = {};
    attempts.forEach(a => {
      const topicId = a.pyq.topicId;
      if (!topicStats[topicId]) topicStats[topicId] = { total: 0, correct: 0 };
      topicStats[topicId].total++;
      if (a.isCorrect) topicStats[topicId].correct++;
    });

    const weakTopicIds = new Set<string>();
    Object.entries(topicStats).forEach(([topicId, stats]) => {
      if (stats.total >= 3 && (stats.correct / stats.total) < 0.4) {
        weakTopicIds.add(topicId);
      }
    });

    // 2. Identify topics with > 3 MistakeLogs in the last 7 days
    const recentMistakes = await prisma.mistakeLog.findMany({
      where: {
        userId,
        loggedAt: { gte: sevenDaysAgo }
      },
      select: { pyq: { select: { topicId: true } } }
    });

    const mistakeCounts: Record<string, number> = {};
    recentMistakes.forEach(m => {
      const topicId = m.pyq.topicId;
      mistakeCounts[topicId] = (mistakeCounts[topicId] || 0) + 1;
      if (mistakeCounts[topicId] > 3) {
        weakTopicIds.add(topicId);
      }
    });

    return Array.from(weakTopicIds);
  }

  private static estimateRank(mastery: number, diagnosticData: any): string {
    if (!diagnosticData || !diagnosticData.strengthMap) return "Not Calibrated";

    // Average strength across all 12 core subjects (0-100 scale)
    const subjectStrengths = Object.values(diagnosticData.strengthMap) as number[];
    const diagAvg = subjectStrengths.reduce((a, b) => a + b, 0) / 12;

    // Heuristic: (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)
    // Both are on a 0-100 scale.
    const overallScore = (diagAvg * 0.4) + (mastery * 0.6);

    if (overallScore > 85) return "Top 100";
    if (overallScore > 70) return "Top 500";
    if (overallScore > 55) return "Top 2000";
    if (overallScore > 40) return "Top 5000";
    if (overallScore > 25) return "Top 10000";
    return "Top 20000+";
  }
}
