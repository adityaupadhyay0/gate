import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  },
}));

describe('RateLimitService', () => {
  const userId = 'user-1';
  const key = 'ai_explain';
  const limit = 3;
  const windowHours = 24;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow the first request and create a record', async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      resetAt: addHours(new Date(), windowHours),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(2);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it('should increment count for subsequent requests within limit', async () => {
    const resetAt = addHours(new Date(), windowHours);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      key,
      count: 1,
      resetAt,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 2,
      resetAt,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(1);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it('should limit requests when quota is exceeded', async () => {
    const resetAt = addHours(new Date(), windowHours);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      key,
      count: 3,
      resetAt,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should reset count after the window expires', async () => {
    const expiredResetAt = subHours(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      key,
      count: 3,
      resetAt: expiredResetAt,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      resetAt: addHours(new Date(), windowHours),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(limit - 1);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });
});
