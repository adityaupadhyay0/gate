import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PeerBenchmarkingService } from '../PeerBenchmarkingService';
import prisma from '../../db/prisma';

vi.mock('../../db/prisma', () => ({
  default: {
    user: {
      findMany: vi.fn(),
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

  it('should calculate rank #1 for the top scorer', async () => {
    (prisma.topic.count as any).mockResolvedValue(10);
    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: 'user-1',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { s1: 100 } }),
        progress: [{ coverageScore: 10 }] // 100% mastery
      },
      {
        id: 'user-2',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { s1: 50 } }),
        progress: [{ coverageScore: 5 }] // 50% mastery
      },
      {
        id: 'user-3',
        onboardingComplete: true,
        diagnosticResult: null,
        progress: [] // 0% mastery
      }
    ]);

    // user-1 score: (100 * 0.4) + (100 * 0.6) = 100
    // user-2 score: (50 * 0.4) + (50 * 0.6) = 50
    // user-3 score: (0 * 0.4) + (0 * 0.6) = 0

    const benchmark = await PeerBenchmarkingService.getBenchmark('user-1', 100, { strengthMap: { s1: 100 } });

    expect(benchmark.rank).toBe(1);
    expect(benchmark.totalUsers).toBe(3);
    expect(benchmark.percentile).toBe(67); // (3 - 1) / 3 * 100 = 66.66
  });

  it('should calculate rank #2 for the middle scorer', async () => {
    (prisma.topic.count as any).mockResolvedValue(10);
    (prisma.user.findMany as any).mockResolvedValue([
      { id: 'u1', onboardingComplete: true, diagnosticResult: { strengthMap: { x: 100 } }, progress: [{ coverageScore: 10 }] },
      { id: 'u2', onboardingComplete: true, diagnosticResult: { strengthMap: { x: 50 } }, progress: [{ coverageScore: 5 }] },
      { id: 'u3', onboardingComplete: true, diagnosticResult: { strengthMap: { x: 0 } }, progress: [] }
    ]);

    const benchmark = await PeerBenchmarkingService.getBenchmark('u2', 50, { strengthMap: { x: 50 } });

    expect(benchmark.rank).toBe(2);
    expect(benchmark.percentile).toBe(33); // (3 - 2) / 3 * 100 = 33.33
  });

  it('should handle users not yet in the distribution', async () => {
    (prisma.topic.count as any).mockResolvedValue(10);
    (prisma.user.findMany as any).mockResolvedValue([
      { id: 'u1', onboardingComplete: true, diagnosticResult: { strengthMap: { x: 100 } }, progress: [{ coverageScore: 10 }] },
    ]);

    const benchmark = await PeerBenchmarkingService.getBenchmark('new-user', 50, { strengthMap: { x: 50 } });

    expect(benchmark.rank).toBe(2);
    expect(benchmark.totalUsers).toBe(2);
    expect(benchmark.percentile).toBe(1); // (2-2)/2 * 100 = 0, clamped to min 1
  });

  it('should use cache for subsequent calls', async () => {
    (prisma.topic.count as any).mockResolvedValue(10);
    (prisma.user.findMany as any).mockResolvedValue([]);

    await PeerBenchmarkingService.getBenchmark('u1', 100, null);
    await PeerBenchmarkingService.getBenchmark('u1', 100, null);

    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
  });
});
