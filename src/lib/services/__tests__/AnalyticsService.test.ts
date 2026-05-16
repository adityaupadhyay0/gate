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
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    topic: {
      count: vi.fn(),
    },
    attempt: {
      count: vi.fn(),
      findMany: vi.fn(),
    }
  },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateOverallMastery', () => {
    it('should calculate mastery normalized against total topics', async () => {
      (prisma.userProgress.findMany as any).mockResolvedValue([
        { coverageScore: 0.8 },
        { coverageScore: 0.5 },
      ]);
      (prisma.topic.count as any).mockResolvedValue(10);

      const result = await AnalyticsService.calculateOverallMastery('user-1');
      // (0.8 + 0.5) / 10 = 0.13 -> 13%
      expect(result).toBe(13);
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

      // Verify filter was applied
      expect(prisma.attempt.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          attemptedAt: expect.objectContaining({ gte: expect.any(Date) })
        })
      }));
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

  describe('getOverallStats', () => {
    it('should return correct stats including calibration data', async () => {
      const mockDiagnostic = JSON.stringify({
        strengthMap: { "Algo": 90, "OS": 80 }
      });
      (prisma.user.findUnique as any).mockResolvedValue({
        diagnosticResult: mockDiagnostic,
        fsrsWeights: [1, 2, 3]
      });
      (prisma.userProgress.findMany as any).mockResolvedValue(new Array(80).fill({ coverageScore: 1 }));
      (prisma.topic.count as any).mockResolvedValue(100);
      (prisma.attempt.findMany as any).mockResolvedValue([]);
      (prisma.mistakeLog.findMany as any).mockResolvedValue([]);
      (prisma.attempt.count as any).mockResolvedValue(60);

      const stats = await AnalyticsService.getOverallStats('user-1');

      expect(stats.rankEstimation).toBe("Top 5000");
      expect(stats.isCalibrated).toBe(true);
      expect(stats.attemptsToCalibration).toBe(0);
    });

    it('should reflect calibration progress when not calibrated', async () => {
        (prisma.user.findUnique as any).mockResolvedValue({
          diagnosticResult: null,
          fsrsWeights: null
        });
        (prisma.userProgress.findMany as any).mockResolvedValue([]);
        (prisma.topic.count as any).mockResolvedValue(100);
        (prisma.attempt.findMany as any).mockResolvedValue([]);
        (prisma.mistakeLog.findMany as any).mockResolvedValue([]);
        (prisma.attempt.count as any).mockResolvedValue(20);

        const stats = await AnalyticsService.getOverallStats('user-1');

        expect(stats.isCalibrated).toBe(false);
        expect(stats.attemptsToCalibration).toBe(30); // 50 - 20
      });
  });

  describe('getCriticalWeaknesses', () => {
    it('should identify topics with low accuracy', async () => {
      (prisma.attempt.findMany as any).mockResolvedValue([
        { isCorrect: false, pyq: { topicId: 'topic-1' } },
        { isCorrect: false, pyq: { topicId: 'topic-1' } },
        { isCorrect: false, pyq: { topicId: 'topic-1' } },
      ]);
      (prisma.mistakeLog.findMany as any).mockResolvedValue([]);

      const result = await AnalyticsService.getCriticalWeaknesses('user-1');
      expect(result).toContain('topic-1');
    });

    it('should identify topics with high recent mistakes', async () => {
      (prisma.attempt.findMany as any).mockResolvedValue([]);
      (prisma.mistakeLog.findMany as any).mockResolvedValue([
        { pyq: { topicId: 'topic-2' } },
        { pyq: { topicId: 'topic-2' } },
        { pyq: { topicId: 'topic-2' } },
        { pyq: { topicId: 'topic-2' } },
      ]);

      const result = await AnalyticsService.getCriticalWeaknesses('user-1');
      expect(result).toContain('topic-2');
    });
  });
});
