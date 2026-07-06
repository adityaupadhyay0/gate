import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PeerBenchmarkingService } from '../PeerBenchmarkingService';
import prisma from '../../db/prisma';

vi.mock('../../db/prisma', () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
    userProgress: {
      groupBy: vi.fn(),
    },
    topic: {
      count: vi.fn(),
    }
  },
}));

describe('PeerBenchmarkingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  describe('calculateScore', () => {
    it('should calculate score correctly with diagnostic data', () => {
      const mastery = 80;
      const diagnosticData = {
        strengthMap: {
          "Sub1": 100,
          "Sub2": 100,
          "Sub3": 100,
          "Sub4": 100,
          "Sub5": 100,
          "Sub6": 100,
          "Sub7": 100,
          "Sub8": 100,
          "Sub9": 100,
          "Sub10": 100,
          "Sub11": 100,
          "Sub12": 100
        }
      };
      // diagAvg = 100
      // score = (100 * 0.4) + (80 * 0.6) = 40 + 48 = 88
      const score = PeerBenchmarkingService.calculateScore(mastery, diagnosticData);
      expect(score).toBe(88);
    });

    it('should fallback if diagnostic data is missing', () => {
      const mastery = 50;
      const score = PeerBenchmarkingService.calculateScore(mastery, null);
      expect(score).toBe(30); // 50 * 0.6
    });
  });

  describe('getRankAndPercentile', () => {
    it('should calculate rank and percentile correctly', async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'user-1', diagnosticResult: JSON.stringify({ strengthMap: { "S": 100 } }) },
        { id: 'user-2', diagnosticResult: JSON.stringify({ strengthMap: { "S": 50 } }) },
        { id: 'user-3', diagnosticResult: JSON.stringify({ strengthMap: { "S": 0 } }) }
      ]);

      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: 'user-1', _sum: { coverageScore: 10 } },
        { userId: 'user-2', _sum: { coverageScore: 5 } },
        { userId: 'user-3', _sum: { coverageScore: 0 } }
      ]);

      // User with score 75 (mastery 75, diag 75)
      // Scores: [100, 50, 0]
      // 75 is between 100 and 50.
      // Rank should be 2.
      // Percentile: round((3 - 2) / 3 * 100) = round(33.33) = 33
      const { rank, percentile } = await PeerBenchmarkingService.getRankAndPercentile(
        'user-new',
        75,
        { strengthMap: { "S": 75 } }
      );

      expect(rank).toBe(2);
      expect(percentile).toBe(33);
    });

    it('should handle empty user list', async () => {
        (prisma.user.findMany as any).mockResolvedValue([]);
        const { rank, percentile } = await PeerBenchmarkingService.getRankAndPercentile('u', 50, null);
        expect(rank).toBe(1);
        expect(percentile).toBe(100);
    });
  });

  describe('Caching', () => {
    it('should use cache and not call prisma multiple times', async () => {
        (prisma.user.findMany as any).mockResolvedValue([{ id: 'u1' }]);
        (prisma.userProgress.groupBy as any).mockResolvedValue([]);
        (prisma.topic.count as any).mockResolvedValue(0);

        await PeerBenchmarkingService.getGlobalScores();
        await PeerBenchmarkingService.getGlobalScores();

        expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
