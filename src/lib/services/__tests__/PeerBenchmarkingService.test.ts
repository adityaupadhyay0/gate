import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PeerBenchmarkingService } from '../PeerBenchmarkingService';
import prisma from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
    topic: {
      count: vi.fn(),
    },
      subject: {
        count: vi.fn(),
      },
  },
}));

describe('PeerBenchmarkingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (PeerBenchmarkingService as any)._clearCache();
  });

  it('should return null if no users have completed onboarding', async () => {
    (prisma.user.findMany as any).mockResolvedValue([]);
    const result = await PeerBenchmarkingService.calculateRank('user1');
    expect(result).toBeNull();
  });

  it('should correctly calculate rank and percentile based on score', async () => {
    const mockUsers = [
      {
        id: 'user1',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { s1: 100, s2: 100, s3: 100, s4: 100, s5: 100, s6: 100, s7: 100, s8: 100, s9: 100, s10: 100, s11: 100, s12: 100 } }),
        progress: [{ coverageScore: 1.0 }, { coverageScore: 1.0 }] // 100% mastery
      },
      {
        id: 'user2',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { s1: 50, s2: 50, s3: 50, s4: 50, s5: 50, s6: 50, s7: 50, s8: 50, s9: 50, s10: 50, s11: 50, s12: 50 } }),
        progress: [{ coverageScore: 0.5 }, { coverageScore: 0.5 }] // 50% mastery
      },
      {
        id: 'user3',
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { s1: 20, s2: 20, s3: 20, s4: 20, s5: 20, s6: 20, s7: 20, s8: 20, s9: 20, s10: 20, s11: 20, s12: 20 } }),
        progress: [{ coverageScore: 0.2 }, { coverageScore: 0.2 }] // 20% mastery
      }
    ];

    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    (prisma.topic.count as any).mockResolvedValue(2);
    (prisma.subject.count as any).mockResolvedValue(12);

    // Score user1: (100 * 0.4) + (100 * 0.6) = 100
    // Score user2: (50 * 0.4) + (50 * 0.6) = 50
    // Score user3: (20 * 0.4) + (20 * 0.6) = 20

    // Test user1
    const result1 = await PeerBenchmarkingService.calculateRank('user1');
    expect(result1?.rank).toBe(1);
    expect(result1?.percentile).toBe(Math.round(((3 - 1) / 3) * 100)); // 67%

    // Test user2
    const result2 = await PeerBenchmarkingService.calculateRank('user2');
    expect(result2?.rank).toBe(2);
    expect(result2?.percentile).toBe(Math.round(((3 - 2) / 3) * 100)); // 33%

    // Test user3
    const result3 = await PeerBenchmarkingService.calculateRank('user3');
    expect(result3?.rank).toBe(3);
    expect(result3?.percentile).toBe(Math.round(((3 - 3) / 3) * 100)); // 0%
  });

  it('should handle missing diagnostic result gracefully', async () => {
    const mockUsers = [
      {
        id: 'user1',
        onboardingComplete: true,
        diagnosticResult: null,
        progress: [{ coverageScore: 1.0 }]
      }
    ];

    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    (prisma.topic.count as any).mockResolvedValue(1);
    (prisma.subject.count as any).mockResolvedValue(12);

    const result = await PeerBenchmarkingService.calculateRank('user1');
    expect(result?.score).toBe(60); // (0 * 0.4) + (100 * 0.6) = 60
  });
});
