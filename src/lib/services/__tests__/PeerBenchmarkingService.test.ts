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
      findMany: vi.fn(),
    },
    userProgress: {
      findMany: vi.fn(),
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

  it('should calculate global percentile and national rank estimation correctly for a high scorer', async () => {
    const mockUsers = [
      { id: 'user-1', diagnosticResult: JSON.stringify({ strengthMap: { Algo: 90, OS: 90 } }) },
      { id: 'user-2', diagnosticResult: JSON.stringify({ strengthMap: { Algo: 50, OS: 50 } }) },
      { id: 'user-3', diagnosticResult: JSON.stringify({ strengthMap: { Algo: 20, OS: 20 } }) },
    ];

    const mockSubjects = [
      {
        id: 'sub-1',
        name: 'Algorithms',
        slug: 'algorithms',
        topics: [
          {
            id: 'top-1',
            userProgress: [{ coverageScore: 0.9 }]
          }
        ]
      },
      {
        id: 'sub-2',
        name: 'Operating Systems',
        slug: 'os',
        topics: [
          {
            id: 'top-2',
            userProgress: [{ coverageScore: 0.8 }]
          }
        ]
      }
    ];

    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    (prisma.subject.findMany as any).mockResolvedValue(mockSubjects);
    (prisma.userProgress.groupBy as any).mockResolvedValue([
      { userId: 'user-1', topicId: 'top-1', _avg: { coverageScore: 0.9 } },
      { userId: 'user-1', topicId: 'top-2', _avg: { coverageScore: 0.8 } },
      { userId: 'user-2', topicId: 'top-1', _avg: { coverageScore: 0.5 } },
      { userId: 'user-2', topicId: 'top-2', _avg: { coverageScore: 0.4 } },
      { userId: 'user-3', topicId: 'top-1', _avg: { coverageScore: 0.2 } },
      { userId: 'user-3', topicId: 'top-2', _avg: { coverageScore: 0.1 } },
    ]);

    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-1',
      diagnosticResult: JSON.stringify({ strengthMap: { Algo: 90, OS: 90 } })
    });

    (prisma.userProgress.findMany as any).mockResolvedValue([
      { coverageScore: 0.9 },
      { coverageScore: 0.8 }
    ]);
    (prisma.topic.count as any).mockResolvedValue(2);

    const benchmark = await PeerBenchmarkingService.getUserBenchmark('user-1');

    expect(benchmark.userId).toBe('user-1');
    expect(benchmark.rank).toBe(1);
    expect(benchmark.totalUsers).toBe(3);
    expect(benchmark.topPercentile).toBeLessThanOrEqual(34);
    expect(benchmark.percentile).toBeGreaterThanOrEqual(66);
    expect(benchmark.subjectBenchmarks.length).toBe(2);
  });

  it('should handle single user edge case cleanly', async () => {
    const mockUsers = [
      { id: 'solo-user', diagnosticResult: JSON.stringify({ strengthMap: { Algo: 70 } }) }
    ];

    const mockSubjects = [
      {
        id: 'sub-1',
        name: 'Algorithms',
        slug: 'algorithms',
        topics: [{ id: 'top-1', userProgress: [{ coverageScore: 0.7 }] }]
      }
    ];

    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    (prisma.subject.findMany as any).mockResolvedValue(mockSubjects);
    (prisma.userProgress.groupBy as any).mockResolvedValue([
      { userId: 'solo-user', topicId: 'top-1', _avg: { coverageScore: 0.7 } }
    ]);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'solo-user',
      diagnosticResult: JSON.stringify({ strengthMap: { Algo: 70 } })
    });
    (prisma.userProgress.findMany as any).mockResolvedValue([{ coverageScore: 0.7 }]);
    (prisma.topic.count as any).mockResolvedValue(1);

    const benchmark = await PeerBenchmarkingService.getUserBenchmark('solo-user');

    expect(benchmark.rank).toBe(1);
    expect(benchmark.totalUsers).toBe(1);
    expect(benchmark.percentile).toBe(99);
    expect(benchmark.subjectBenchmarks[0].diffFromAverage).toBe(0);
  });

  it('should identify top advantage subject and focus gap subject', async () => {
    const mockUsers = [
      { id: 'user-a', diagnosticResult: JSON.stringify({ strengthMap: { Algo: 100, OS: 20 } }) },
      { id: 'user-b', diagnosticResult: JSON.stringify({ strengthMap: { Algo: 50, OS: 80 } }) }
    ];

    const mockSubjects = [
      {
        id: 'sub-algo',
        name: 'Algorithms',
        slug: 'algorithms',
        topics: [{ id: 'top-1', userProgress: [{ coverageScore: 1.0 }] }]
      },
      {
        id: 'sub-os',
        name: 'Operating Systems',
        slug: 'os',
        topics: [{ id: 'top-2', userProgress: [{ coverageScore: 0.2 }] }]
      }
    ];

    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    (prisma.subject.findMany as any).mockResolvedValue(mockSubjects);
    (prisma.userProgress.groupBy as any).mockResolvedValue([
      { userId: 'user-a', topicId: 'top-1', _avg: { coverageScore: 1.0 } },
      { userId: 'user-a', topicId: 'top-2', _avg: { coverageScore: 0.2 } },
      { userId: 'user-b', topicId: 'top-1', _avg: { coverageScore: 0.5 } },
      { userId: 'user-b', topicId: 'top-2', _avg: { coverageScore: 0.8 } }
    ]);

    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-a',
      diagnosticResult: JSON.stringify({ strengthMap: { Algo: 100, OS: 20 } })
    });

    (prisma.userProgress.findMany as any).mockResolvedValue([
      { coverageScore: 1.0 },
      { coverageScore: 0.2 }
    ]);
    (prisma.topic.count as any).mockResolvedValue(2);

    const benchmark = await PeerBenchmarkingService.getUserBenchmark('user-a');

    expect(benchmark.insights.topSubject?.name).toBe('Algorithms');
    expect(benchmark.insights.focusSubject?.name).toBe('Operating Systems');
  });
});
