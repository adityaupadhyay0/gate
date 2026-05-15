import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeightOptimizationService } from '../WeightOptimizationService';
import prisma from '@/lib/db/prisma';
import { RevisionEngine } from '@/lib/engines/RevisionEngine';

vi.mock('@/lib/db/prisma', () => ({
  default: {
    attempt: {
      findMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

describe('WeightOptimizationService', () => {
  const userId = 'test-user';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not optimize if attempts are fewer than threshold', async () => {
    (prisma.attempt.findMany as any).mockResolvedValue(new Array(49).fill({}));

    const result = await WeightOptimizationService.optimizeForUser(userId);

    expect(result).toBeNull();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should optimize weights and reduce log loss for a sample dataset with confidence levels', async () => {
    const baseDate = new Date('2024-01-01');
    const attempts = [];
    for (let i = 0; i < 60; i++) {
      attempts.push({
        pyqId: 'pyq-1',
        isCorrect: i % 2 === 0,
        confidenceLevel: i % 4 + 1, // Store rating 1-4
        attemptedAt: new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000),
      });
    }

    (prisma.attempt.findMany as any).mockResolvedValue(attempts);
    (prisma.user.update as any).mockResolvedValue({});

    const result = await WeightOptimizationService.optimizeForUser(userId);

    expect(result).toBeDefined();
    expect(result?.length).toBe(RevisionEngine.DEFAULT_W.length);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { fsrsWeights: result }
    });
  });
});
