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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new rate limit if none exists', async () => {
    const userId = 'user-1';
    const key = 'test-key';
    const resetDate = addHours(new Date(), 24);

    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      userId,
      key,
      count: 1,
      resetAt: resetDate,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it('should reset rate limit if resetAt has passed', async () => {
    const userId = 'user-1';
    const key = 'test-key';
    const oldResetAt = subHours(new Date(), 1);
    const newResetAt = addHours(new Date(), 24);

    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      userId,
      key,
      count: 5,
      resetAt: oldResetAt,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      userId,
      key,
      count: 1,
      resetAt: newResetAt,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it('should increment existing rate limit if within limit', async () => {
    const userId = 'user-1';
    const key = 'test-key';
    const resetAt = addHours(new Date(), 23);

    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      userId,
      key,
      count: 2,
      resetAt,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      userId,
      key,
      count: 3,
      resetAt,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { userId_key: { userId, key } },
      data: { count: { increment: 1 } },
    });
  });

  it('should deny request if limit reached', async () => {
    const userId = 'user-1';
    const key = 'test-key';
    const resetAt = addHours(new Date(), 23);

    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      userId,
      key,
      count: 5,
      resetAt,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should return correct reset date even when denied', async () => {
    const userId = 'user-1';
    const key = 'test-key';
    const resetAt = addHours(new Date(), 23);

    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      userId,
      key,
      count: 5,
      resetAt,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.reset).toEqual(resetAt);
  });
});
