import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PeerBenchmarkingService } from '../PeerBenchmarkingService';
import prisma from '../../db/prisma';

vi.mock('../../db/prisma', () => ({
  default: {
    topic: {
      count: vi.fn(),
    },
    subject: {
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    userProgress: {
      groupBy: vi.fn(),
    },
  },
}));

describe('PeerBenchmarkingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  describe('getGlobalDistribution', () => {
    it('should calculate global distribution using formula (DiagAvg * 0.4) + (Coverage * 0.6)', async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(2);
      (prisma.user.findMany as any).mockResolvedValue([
        {
          id: 'user-1',
          diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 80, 'OS': 60 } })
        },
        {
          id: 'user-2',
          diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 40, 'OS': 20 } })
        }
      ]);

      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: 'user-1', _sum: { coverageScore: 8 } },
        { userId: 'user-2', _sum: { coverageScore: 2 } }
      ]);

      const dist = await PeerBenchmarkingService.getGlobalDistribution();

      expect(dist.length).toBe(2);

      // User 1:
      // totalCoverage = 8 / 10 = 80% syllabusCoverage
      // diagAvg = (80 + 60) / 2 = 70
      // overallScore = (70 * 0.4) + (80 * 0.6) = 28 + 48 = 76
      const u1 = dist.find(u => u.userId === 'user-1');
      expect(u1).toBeDefined();
      expect(u1?.syllabusCoverage).toBe(80);
      expect(u1?.diagnosticAverage).toBe(70);
      expect(u1?.overallScore).toBe(76);

      // User 2:
      // totalCoverage = 2 / 10 = 20% syllabusCoverage
      // diagAvg = (40 + 20) / 2 = 30
      // overallScore = (30 * 0.4) + (20 * 0.6) = 12 + 12 = 24
      const u2 = dist.find(u => u.userId === 'user-2');
      expect(u2).toBeDefined();
      expect(u2?.overallScore).toBe(24);

      // Sorted descending
      expect(dist[0].userId).toBe('user-1');
      expect(dist[1].userId).toBe('user-2');
    });

    it('should cache distribution for 10 minutes and use cache on subsequent calls', async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(2);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'user-1', diagnosticResult: null }
      ]);
      (prisma.userProgress.groupBy as any).mockResolvedValue([]);

      await PeerBenchmarkingService.getGlobalDistribution();
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      // Second call should hit cache
      await PeerBenchmarkingService.getGlobalDistribution();
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      // Clear cache and call again
      PeerBenchmarkingService._clearCache();
      await PeerBenchmarkingService.getGlobalDistribution();
      expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserBenchmarking', () => {
    it('should return rank 1 and topPercentile 1 when user has highest score', async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(2);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'user-top', diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 100, 'OS': 100 } }) },
        { id: 'user-low', diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 20, 'OS': 20 } }) }
      ]);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: 'user-top', _sum: { coverageScore: 10 } },
        { userId: 'user-low', _sum: { coverageScore: 1 } }
      ]);

      const result = await PeerBenchmarkingService.getUserBenchmarking('user-top');

      expect(result.rank).toBe(1);
      expect(result.totalUsers).toBe(2);
      expect(result.topPercentile).toBe(1);
      expect(result.overallPercentile).toBe(99);
      expect(result.estimatedRankString).toBe('Top 1%');
    });

    it('should correctly calculate topPercentile and overallPercentile for non-rank 1 user', async () => {
      (prisma.topic.count as any).mockResolvedValue(100);
      (prisma.subject.count as any).mockResolvedValue(10);

      // Create 10 mock users
      const users = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i + 1}`,
        diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': (10 - i) * 10 } })
      }));
      (prisma.user.findMany as any).mockResolvedValue(users);

      const userProgress = users.map((u, i) => ({
        userId: u.id,
        _sum: { coverageScore: (10 - i) * 10 }
      }));
      (prisma.userProgress.groupBy as any).mockResolvedValue(userProgress);

      // Target user-5 (rank 5 out of 10)
      const result = await PeerBenchmarkingService.getUserBenchmarking('user-5');

      expect(result.rank).toBe(5);
      expect(result.totalUsers).toBe(10);
      // topPercentile = Math.round((5 / 10) * 100) = 50
      expect(result.topPercentile).toBe(50);
      expect(result.overallPercentile).toBe(50);
      expect(result.estimatedRankString).toBe('Top 50%');
    });

    it('should handle edge case when distribution is empty', async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(2);
      (prisma.user.findMany as any).mockResolvedValue([]);
      (prisma.userProgress.groupBy as any).mockResolvedValue([]);

      const result = await PeerBenchmarkingService.getUserBenchmarking('unknown-user');

      expect(result.rank).toBe(1);
      expect(result.totalUsers).toBe(1);
      expect(result.topPercentile).toBe(1);
      expect(result.overallPercentile).toBe(99);
      expect(result.estimatedRankString).toBe('Top 1%');
    });
  });
});
