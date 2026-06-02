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
        create: vi.fn(),
    }
  },
}));

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'ai-explain';
  const limit = 5;
  const windowHours = 24;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow request if count is below limit', async () => {
    const mockRateLimit = {
      id: 'rl-id',
      userId,
      key,
      count: 2,
      resetAt: addHours(new Date(), 10),
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);

    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
    expect(result.limit).toBe(5);
  });

  it('should deny request if count is at limit', async () => {
    const mockRateLimit = {
      id: 'rl-id',
      userId,
      key,
      count: 5,
      resetAt: addHours(new Date(), 10),
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);

    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset count if resetAt is in the past', async () => {
    const pastDate = subHours(new Date(), 1);
    const mockRateLimit = {
      id: 'rl-id',
      userId,
      key,
      count: 5,
      resetAt: pastDate,
    };

    const newResetAt = addHours(new Date(), 24);
    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);
    (prisma.rateLimit.update as any).mockResolvedValue({
      ...mockRateLimit,
      count: 0,
      resetAt: newResetAt,
    });

    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: 'rl-id' },
      data: {
        count: 0,
        resetAt: expect.any(Date),
      },
    });
  });

  it('should increment count', async () => {
    await RateLimitService.increment(userId, key);

    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });
  });
});
