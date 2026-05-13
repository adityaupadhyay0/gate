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
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      select: { coverageScore: true }
    });

    if (progress.length === 0) return 0;

    const totalScore = progress.reduce((acc, curr) => acc + curr.coverageScore, 0);
    return Math.round((totalScore / 95) * 100); // Normalized against 95 core topics
  }

  static async calculateStreak(userId: string): Promise<number> {
    const attempts = await prisma.attempt.findMany({
      where: { userId },
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
    // A topic is critical if accuracy < 40% with at least 3 attempts
    // OR if it has more than 3 MistakeLogs in the last 7 days
    const sevenDaysAgo = subDays(new Date(), 7);

    // Logic for weak topics would ideally be more complex (accuracy < 40% with at least 3 attempts).
    // Let's use UserProgress status for simplicity in this MVP+ stage.
    const failingProgress = await prisma.userProgress.findMany({
        where: {
            userId,
            coverageScore: { lt: 0.3 },
            status: "InProgress"
        }
    });

    return failingProgress;
  }

  private static estimateRank(mastery: number, diagnosticData: any): string {
    if (!diagnosticData) return "Not Calibrated";

    const diagScore = Object.values(diagnosticData.strengthMap || {}).reduce((a: any, b: any) => a + b, 0) as number / 12;

    // Heuristic: (Diagnostic Score * 0.4) + (Syllabus Coverage * 0.6)
    const overallScore = (diagScore * 0.4) + (mastery * 0.6);

    if (overallScore > 85) return "Top 100";
    if (overallScore > 70) return "Top 500";
    if (overallScore > 50) return "Top 2000";
    if (overallScore > 30) return "Top 5000";
    return "Top 10000+";
  }
}
