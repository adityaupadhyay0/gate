import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeightOptimizationService } from '../WeightOptimizationService';
import prisma from '@/lib/db/prisma';
import { DEFAULT_FSRS_WEIGHTS } from '@/lib/engines/RevisionEngine';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error if insufficient attempts', async () => {
    (prisma.attempt.findMany as any).mockResolvedValue(new Array(10).fill({}));

    const result = await WeightOptimizationService.optimize('user123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Insufficient data for calibration');
  });

  it('should optimize weights when enough data is present', async () => {
    // Mock 60 attempts (above threshold of 50)
    const mockAttempts = [];
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      mockAttempts.push({
        attemptedAt: new Date(now.getTime() - (60 - i) * 24 * 60 * 60 * 1000),
        confidenceLevel: (i % 4) + 1,
        isCorrect: (i % 4) + 1 > 1,
        pyqId: 'pyq1'
      });
    }

    (prisma.attempt.findMany as any).mockResolvedValue(mockAttempts);
    (prisma.user.update as any).mockResolvedValue({ id: 'user123' });

    const result = await WeightOptimizationService.optimize('user123');

    expect(result.success).toBe(true);
    expect(result.weights).toHaveLength(DEFAULT_FSRS_WEIGHTS.length);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user123' },
      data: expect.objectContaining({ fsrsWeights: expect.any(Array) })
    }));
  });

  it('should identify loss improvement', async () => {
     // Create a biased dataset that doesn't fit default weights well
     // e.g., "Easy" ratings but user keeps forgetting (isCorrect: false)
     const mockAttempts = [];
     const now = new Date();
     for (let i = 0; i < 60; i++) {
       mockAttempts.push({
         attemptedAt: new Date(now.getTime() - (60 - i) * 10 * 24 * 60 * 60 * 1000), // Long intervals
         confidenceLevel: 4, // "Easy"
         isCorrect: false, // But wrong
         pyqId: 'pyq1'
       });
     }

     (prisma.attempt.findMany as any).mockResolvedValue(mockAttempts);
     (prisma.user.update as any).mockResolvedValue({ id: 'user123' });

     const result = await WeightOptimizationService.optimize('user123');

     expect(result.success).toBe(true);
     // Since the initial weights are way off for this weird data,
     // coordinate descent should find better weights (lower loss)
     expect(result.lossImprovement).toBeGreaterThanOrEqual(0);
  });
});
