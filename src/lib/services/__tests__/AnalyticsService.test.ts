import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../AnalyticsService';
import prisma from '../../db/prisma';
import { startOfDay, subDays } from 'date-fns';

vi.mock('../../db/prisma', () => ({
  default: {
    userProgress: {
      findMany: vi.fn(),
    },
    attempt: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    mistakeLog: {
      groupBy: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateOverallMastery', () => {
    it('should calculate mastery normalized against 95 topics', async () => {
      (prisma.userProgress.findMany as any).mockResolvedValue([
        { coverageScore: 0.8 },
        { coverageScore: 0.5 },
      ]);

      const result = await AnalyticsService.calculateOverallMastery('user-1');
      // (0.8 + 0.5) / 95 = 0.01368... -> 1%
      expect(result).toBe(1);
    });

    it('should return 0 if no progress found', async () => {
      (prisma.userProgress.findMany as any).mockResolvedValue([]);
      const result = await AnalyticsService.calculateOverallMastery('user-1');
      expect(result).toBe(0);
    });
  });

  describe('calculateStreak', () => {
    it('should calculate a 3-day streak correctly', async () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const dayBefore = subDays(today, 2);

      (prisma.attempt.findMany as any).mockResolvedValue([
        { attemptedAt: today },
        { attemptedAt: yesterday },
        { attemptedAt: dayBefore },
      ]);

      const result = await AnalyticsService.calculateStreak('user-1');
      expect(result).toBe(3);
    });

    it('should return 0 if last attempt was > 1 day ago', async () => {
      const threeDaysAgo = subDays(new Date(), 3);

      (prisma.attempt.findMany as any).mockResolvedValue([
        { attemptedAt: threeDaysAgo },
      ]);

      const result = await AnalyticsService.calculateStreak('user-1');
      expect(result).toBe(0);
    });

    it('should handle multiple attempts on the same day', async () => {
        const today = new Date();
        const yesterday = subDays(today, 1);

        (prisma.attempt.findMany as any).mockResolvedValue([
          { attemptedAt: today },
          { attemptedAt: today },
          { attemptedAt: yesterday },
        ]);

        const result = await AnalyticsService.calculateStreak('user-1');
        expect(result).toBe(2);
      });
  });

  describe('estimateRank', () => {
    it('should return correct tier based on score', async () => {
      const mockDiagnostic = JSON.stringify({
        strengthMap: { "Algo": 90, "OS": 80 }
      });
      (prisma.user.findUnique as any).mockResolvedValue({ diagnosticResult: mockDiagnostic });
      (prisma.userProgress.findMany as any).mockResolvedValue(new Array(80).fill({ coverageScore: 1 }));

      const stats = await AnalyticsService.getOverallStats('user-1');
      // mastery = 80/95 = ~84%
      // diagScore = (90+80)/12 = 14.16 (wait, strength map is 0-100, so diagScore is average of that)
      // Actually my estimateRank formula: (diagScore * 0.4) + (mastery * 0.6)
      // diagScore = (90+80)/2 = 85 (if only 2 subjects present, but the code divides by length of strengthMap values)
      // Code: const diagScore = Object.values(diagnosticData.strengthMap || {}).reduce((a, b) => a + b, 0) / 12;
      // diagScore = 170 / 12 = 14.16
      // overall = (14.16 * 0.4) + (84 * 0.6) = 5.66 + 50.4 = 56.06 -> "Top 2000"
      expect(stats.rankEstimation).toBe("Top 2000");
    });
  });
});
