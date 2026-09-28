import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PeerBenchmarkingService } from '../PeerBenchmarkingService';
import prisma from '../../db/prisma';

vi.mock('../../db/prisma', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    subject: {
      count: vi.fn(),
    },
    topic: {
      count: vi.fn(),
    },
    userProgress: {
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

describe('PeerBenchmarkingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  describe('calculateBenchmarkingScore', () => {
    it('should correctly calculate score with valid diagnostic result and progress', () => {
      const diagnosticResult = JSON.stringify({
        strengthMap: { "Algo": 80, "OS": 100 }
      });
      const score = PeerBenchmarkingService.calculateBenchmarkingScore(
        diagnosticResult,
        5,
        10,
        2
      );
      expect(score).toBe(66);
    });

    it('should handle null diagnosticResult gracefully', () => {
      const score = PeerBenchmarkingService.calculateBenchmarkingScore(
        null,
        10,
        10,
        12
      );
      expect(score).toBe(60);
    });
  });

  describe('getUserBenchmark', () => {
    it('should calculate global rank and percentile relative to onboarded peer distribution', async () => {
      const u1Diag = JSON.stringify({ strengthMap: { "Algo": 100 } });
      const u2Diag = JSON.stringify({ strengthMap: { "Algo": 50 } });

      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'user-1', diagnosticResult: u1Diag },
        { id: 'user-2', diagnosticResult: u2Diag },
      ]);
      (prisma.subject.count as any).mockResolvedValue(1);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: 'user-1', _sum: { coverageScore: 10 } }, // Coverage = 100%, Score = (100*0.4)+(100*0.6) = 100
        { userId: 'user-2', _sum: { coverageScore: 5 } },  // Coverage = 50%, Score = (50*0.4)+(50*0.6) = 50
      ]);

      const benchmarkUser1 = await PeerBenchmarkingService.getUserBenchmark('user-1');
      expect(benchmarkUser1.rank).toBe(1);
      expect(benchmarkUser1.totalUsers).toBe(2);
      expect(benchmarkUser1.topPercentileLabel).toBe('Top 1%');

      const benchmarkUser2 = await PeerBenchmarkingService.getUserBenchmark('user-2');
      expect(benchmarkUser2.rank).toBe(2);
      expect(benchmarkUser2.totalUsers).toBe(2);
      expect(benchmarkUser2.topPercentileLabel).toBe('Top 100%');
    });

    it('should handle target user not yet in the onboarded distribution', async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'peer-1', diagnosticResult: JSON.stringify({ strengthMap: { "Algo": 80 } }) },
      ]);
      (prisma.subject.count as any).mockResolvedValue(1);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: 'peer-1', _sum: { coverageScore: 8 } }, // Score = 80
      ]);

      (prisma.user.findUnique as any).mockResolvedValue({
        diagnosticResult: JSON.stringify({ strengthMap: { "Algo": 100 } })
      });
      (prisma.userProgress.aggregate as any).mockResolvedValue({
        _sum: { coverageScore: 10 } // Score = 100
      });

      const result = await PeerBenchmarkingService.getUserBenchmark('new-user');
      expect(result.rank).toBe(1);
      expect(result.totalUsers).toBe(2); // peer-1 + new-user
      expect(result.score).toBe(100);
      expect(result.topPercentileLabel).toBe('Top 1%');
    });

    it('should use cached distribution on subsequent calls within TTL', async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'user-1', diagnosticResult: null },
      ]);
      (prisma.subject.count as any).mockResolvedValue(1);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.userProgress.groupBy as any).mockResolvedValue([]);

      await PeerBenchmarkingService.getUserBenchmark('user-1');
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      await PeerBenchmarkingService.getUserBenchmark('user-1');
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      PeerBenchmarkingService._clearCache();
      await PeerBenchmarkingService.getUserBenchmark('user-1');
      expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
