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
      findUnique: vi.fn(),
    },
    userProgress: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

describe('PeerBenchmarkingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  describe('getRankBand', () => {
    it('should map score bands to GATE rank estimates', () => {
      expect(PeerBenchmarkingService.getRankBand(90)).toBe('Top 100');
      expect(PeerBenchmarkingService.getRankBand(75)).toBe('Top 500');
      expect(PeerBenchmarkingService.getRankBand(60)).toBe('Top 2000');
      expect(PeerBenchmarkingService.getRankBand(45)).toBe('Top 5000');
      expect(PeerBenchmarkingService.getRankBand(30)).toBe('Top 10000');
      expect(PeerBenchmarkingService.getRankBand(15)).toBe('Top 20000+');
    });
  });

  describe('calculateUserScore', () => {
    it('should correctly calculate score using formula (Diagnostic Avg * 0.4) + (Coverage * 0.6)', async () => {
      const mockDiagnostic = JSON.stringify({
        strengthMap: { OS: 80, Algo: 100, CN: 60 }
      });

      (prisma.user.findUnique as any).mockResolvedValue({ diagnosticResult: mockDiagnostic });
      (prisma.userProgress.aggregate as any).mockResolvedValue({ _sum: { coverageScore: 50 } });

      // totalTopics = 100 -> Syllabus Coverage = 50%
      // subjectCount = 3 -> Diagnostic Average = (80 + 100 + 60) / 3 = 80
      // Expected Score = (80 * 0.4) + (50 * 0.6) = 32 + 30 = 62
      const result = await PeerBenchmarkingService.calculateUserScore('user-1', 100, 3);

      expect(result.syllabusCoverage).toBe(50);
      expect(result.diagnosticAverage).toBe(80);
      expect(result.score).toBe(62);
    });

    it('should handle zero topics or missing diagnostic gracefully', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ diagnosticResult: null });
      (prisma.userProgress.aggregate as any).mockResolvedValue({ _sum: { coverageScore: 0 } });

      const result = await PeerBenchmarkingService.calculateUserScore('user-1', 0, 0);

      expect(result.syllabusCoverage).toBe(0);
      expect(result.diagnosticAverage).toBe(0);
      expect(result.score).toBe(0);
    });
  });

  describe('getUserBenchmark', () => {
    it('should compute percentile metrics correctly for a single onboarded user', async () => {
      (prisma.topic.count as any).mockResolvedValue(100);
      (prisma.subject.count as any).mockResolvedValue(10);
      (prisma.user.findMany as any).mockResolvedValue([{ id: 'user-1' }]);

      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: 'user-1', _sum: { coverageScore: 80 } }
      ]);

      const mockDiagnostic = JSON.stringify({
        strengthMap: { OS: 90, Algo: 90 }
      });

      (prisma.user.findUnique as any).mockResolvedValue({ diagnosticResult: mockDiagnostic });
      (prisma.userProgress.aggregate as any).mockResolvedValue({ _sum: { coverageScore: 80 } });

      const benchmark = await PeerBenchmarkingService.getUserBenchmark('user-1');

      expect(benchmark.rank).toBe(1);
      expect(benchmark.totalUsers).toBe(1);
      expect(benchmark.topPercentile).toBe(1);
      expect(benchmark.overallPercentile).toBe(99);
      expect(benchmark.rankBand).toBeDefined();
    });

    it('should rank multiple onboarded users and return correct topPercentile and overallPercentile', async () => {
      (prisma.topic.count as any).mockResolvedValue(100);
      (prisma.subject.count as any).mockResolvedValue(2);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'user-top' },
        { id: 'user-mid' },
        { id: 'user-low' }
      ]);

      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: 'user-top', _sum: { coverageScore: 90 } },
        { userId: 'user-mid', _sum: { coverageScore: 50 } },
        { userId: 'user-low', _sum: { coverageScore: 10 } }
      ]);

      (prisma.user.findUnique as any).mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === 'user-top') {
          return Promise.resolve({ diagnosticResult: JSON.stringify({ strengthMap: { S1: 100, S2: 100 } }) });
        }
        if (where.id === 'user-mid') {
          return Promise.resolve({ diagnosticResult: JSON.stringify({ strengthMap: { S1: 50, S2: 50 } }) });
        }
        return Promise.resolve({ diagnosticResult: JSON.stringify({ strengthMap: { S1: 0, S2: 0 } }) });
      });

      (prisma.userProgress.aggregate as any).mockImplementation(({ where }: { where: { userId: string } }) => {
        if (where.userId === 'user-top') return Promise.resolve({ _sum: { coverageScore: 90 } });
        if (where.userId === 'user-mid') return Promise.resolve({ _sum: { coverageScore: 50 } });
        return Promise.resolve({ _sum: { coverageScore: 10 } });
      });

      const topBenchmark = await PeerBenchmarkingService.getUserBenchmark('user-top');
      expect(topBenchmark.rank).toBe(1);
      expect(topBenchmark.topPercentile).toBe(1);

      PeerBenchmarkingService._clearCache();

      const midBenchmark = await PeerBenchmarkingService.getUserBenchmark('user-mid');
      expect(midBenchmark.rank).toBe(2);
      // rank = 2, totalUsers = 3 -> Math.round((2/3)*100) = 67 -> topPercentile = 67, overallPercentile = 33
      expect(midBenchmark.topPercentile).toBe(67);
      expect(midBenchmark.overallPercentile).toBe(33);
    });

    it('should use internal in-memory cache on subsequent calls within TTL', async () => {
      (prisma.topic.count as any).mockResolvedValue(100);
      (prisma.subject.count as any).mockResolvedValue(5);
      (prisma.user.findMany as any).mockResolvedValue([{ id: 'user-1' }]);
      (prisma.userProgress.groupBy as any).mockResolvedValue([]);
      (prisma.user.findUnique as any).mockResolvedValue({ diagnosticResult: null });
      (prisma.userProgress.aggregate as any).mockResolvedValue({ _sum: { coverageScore: 0 } });

      await PeerBenchmarkingService.getUserBenchmark('user-1');
      await PeerBenchmarkingService.getUserBenchmark('user-1');

      // User list should only be queried once due to caching
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
