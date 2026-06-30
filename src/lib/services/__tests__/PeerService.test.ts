import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PeerBenchmarkingService } from '../PeerService';
import prisma from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  default: {
    topic: {
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

describe('PeerBenchmarkingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null if no topics exist', async () => {
    (prisma.topic.count as any).mockResolvedValue(0);
    const stats = await PeerBenchmarkingService.getGlobalStats('user1');
    expect(stats).toBeNull();
  });

  it('returns null if no users exist', async () => {
    (prisma.topic.count as any).mockResolvedValue(100);
    (prisma.user.findMany as any).mockResolvedValue([]);
    const stats = await PeerBenchmarkingService.getGlobalStats('user1');
    expect(stats).toBeNull();
  });

  it('calculates percentile and rank correctly for multiple users', async () => {
    (prisma.topic.count as any).mockResolvedValue(10);

    const mockUsers = [
      {
        id: 'user1',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 100 } }),
        progress: [{ coverageScore: 1.0 }, { coverageScore: 1.0 }] // Mastery = (2/10)*100 = 20
      },
      {
        id: 'user2',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 50 } }),
        progress: [{ coverageScore: 1.0 }] // Mastery = (1/10)*100 = 10
      },
      {
        id: 'user3',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 0 } }),
        progress: []
      }
    ];

    (prisma.user.findMany as any).mockResolvedValue(mockUsers);

    const stats = await PeerBenchmarkingService.getGlobalStats('user2');

    // Scores:
    // User1: Mastery = (2/10)*100 = 20. Diag = 100. Score = 0.4*100 + 0.6*20 = 40 + 12 = 52.
    // User2: Mastery = (1/10)*100 = 10. Diag = 50. Score = 0.4*50 + 0.6*10 = 20 + 6 = 26.
    // User3: Mastery = (0/10)*100 = 0. Diag = 0. Score = 0.4*0 + 0.6*0 = 0.

    // Ranks: user1 (1), user2 (2), user3 (3)
    // Percentile for user2: ((3 - 2) / 3) * 100 = 33.33... -> 33

    expect(stats).not.toBeNull();
    expect(stats?.rank).toBe(2);
    expect(stats?.percentile).toBe(33);
    expect(stats?.totalUsers).toBe(3);
    expect(stats?.averageMastery).toBe(10); // (20 + 10 + 0) / 3 = 10
    expect(stats?.averageDiagnosticScore).toBe(50); // (100 + 50 + 0) / 3 = 50
  });

  it('handles guest/non-existent user in global pool', async () => {
    (prisma.topic.count as any).mockResolvedValue(10);
    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: 'user1',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { 'Algo': 80 } }),
        progress: [{ coverageScore: 5 }]
      }
    ]);

    const stats = await PeerBenchmarkingService.getGlobalStats('guest');
    expect(stats?.rank).toBe(0);
    expect(stats?.percentile).toBe(0);
    expect(stats?.totalUsers).toBe(1);
  });
});
