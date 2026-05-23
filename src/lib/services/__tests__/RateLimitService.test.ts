import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '../../db/prisma';
import { addDays, subDays } from 'date-fns';

vi.mock('../../db/prisma', () => ({
  default: {
    rateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('RateLimitService', () => {
  const userId = 'user-1';
  const key = 'test-key';
  const limit = 5;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow request and create record if none exists', async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.create as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      key,
      count: 1,
      resetAt: addDays(new Date(), 1)
    });

    const result = await RateLimitService.checkLimit(userId, key, limit);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(limit - 1);
    expect(prisma.rateLimit.create).toHaveBeenCalled();
  });

  it('should increment count if within window and limit', async () => {
    const resetAt = addDays(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      key,
      count: 2,
      resetAt
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: 'rl-1',
      count: 3
    });

    const result = await RateLimitService.checkLimit(userId, key, limit);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(limit - 3);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { count: { increment: 1 } }
    }));
  });

  it('should deny request if limit reached', async () => {
    const resetAt = addDays(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      key,
      count: 5,
      resetAt
    });

    const result = await RateLimitService.checkLimit(userId, key, limit);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should reset window if resetAt is in the past', async () => {
    const pastResetAt = subDays(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      key,
      count: 5,
      resetAt: pastResetAt
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: 'rl-1',
      count: 1
    });

    const result = await RateLimitService.checkLimit(userId, key, limit);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(limit - 1);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        count: 1,
        resetAt: expect.any(Date)
      })
    }));
  });
});
