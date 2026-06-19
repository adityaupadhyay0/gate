import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '../../db/prisma';
import { addHours, subHours } from 'date-fns';

vi.mock('../../db/prisma', () => ({
  default: {
    rateLimit: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: {
      create: vi.fn(),
    }
  },
}));

describe('RateLimitService', () => {
  const userId = 'test-user';
  const key = 'test-key';
  const limit = 5;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow and initialize a new rate limit record if none exists', async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.allowed).toBe(true);
    expect(result.count).toBe(1);
    expect(result.remaining).toBe(limit - 1);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it('should allow and increment if count is below limit and window is active', async () => {
    const resetAt = addHours(new Date(), 12);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      count: 2,
      resetAt,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 3,
      resetAt,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.allowed).toBe(true);
    expect(result.count).toBe(3);
    expect(result.remaining).toBe(limit - 3);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it('should block if count is at or above limit', async () => {
    const resetAt = addHours(new Date(), 12);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      count: 5,
      resetAt,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.allowed).toBe(false);
    expect(result.count).toBe(5);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should reset and allow if current time is after resetAt', async () => {
    const oldResetAt = subHours(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      count: 5,
      resetAt: oldResetAt,
    });

    const newResetAt = addHours(new Date(), 24);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: newResetAt,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.allowed).toBe(true);
    expect(result.count).toBe(1);
    expect(result.remaining).toBe(limit - 1);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });
});
