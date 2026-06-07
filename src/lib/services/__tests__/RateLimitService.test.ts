import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';
import { addHours, subHours } from 'date-fns';

vi.mock('@/lib/db/prisma', () => ({
  default: {
    rateLimit: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: {
        create: vi.fn()
    }
  },
}));

describe('RateLimitService', () => {
  const userId = 'user-123';
  const key = 'ai_explain';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow a request if under the limit', async () => {
    const mockRateLimit = {
      id: 'rl-1',
      userId,
      key,
      count: 5,
      resetAt: addHours(new Date(), 20),
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);
    (prisma.rateLimit.update as any).mockResolvedValue({
      ...mockRateLimit,
      count: 6,
    });

    const result = await RateLimitService.checkLimit(userId, key, 10);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: 'rl-1' },
      data: { count: { increment: 1 } },
    });
  });

  it('should block a request if over the limit', async () => {
    const mockRateLimit = {
      id: 'rl-1',
      userId,
      key,
      count: 10,
      resetAt: addHours(new Date(), 20),
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);

    const result = await RateLimitService.checkLimit(userId, key, 10);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should reset the counter if the window has expired', async () => {
    const expiredResetAt = subHours(new Date(), 1);
    const mockRateLimit = {
      id: 'rl-1',
      userId,
      key,
      count: 10,
      resetAt: expiredResetAt,
    };

    const newResetAt = addHours(new Date(), 24);

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);
    (prisma.rateLimit.update as any).mockResolvedValue({
      ...mockRateLimit,
      count: 1,
      resetAt: newResetAt,
    });

    const result = await RateLimitService.checkLimit(userId, key, 10);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: 'rl-1' },
      data: expect.objectContaining({
        count: 1,
        resetAt: expect.any(Date),
      }),
    });
  });
});
