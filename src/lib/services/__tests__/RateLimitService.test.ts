import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '../../db/prisma';
import { addHours, subHours } from 'date-fns';

vi.mock('../../db/prisma', () => ({
  default: {
    rateLimit: {
      upsert: vi.fn(),
      update: vi.fn(),
    }
  },
}));

describe('RateLimitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize a new rate limit window', async () => {
    const mockRateLimit = {
      id: 'rl-1',
      userId: 'user-1',
      key: 'test-key',
      count: 0,
      resetAt: addHours(new Date(), 24)
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);
    (prisma.rateLimit.update as any).mockResolvedValue({ ...mockRateLimit, count: 1 });

    const status = await RateLimitService.checkAndIncrement('user-1', 'test-key', 5);

    expect(status.isLimited).toBe(false);
    expect(status.limit).toBe(5);
    expect(status.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
    expect(prisma.rateLimit.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { count: { increment: 1 } }
    }));
  });

  it('should block if limit is exceeded within window', async () => {
    const mockRateLimit = {
      id: 'rl-1',
      userId: 'user-1',
      key: 'test-key',
      count: 5,
      resetAt: addHours(new Date(), 20)
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);

    const status = await RateLimitService.checkAndIncrement('user-1', 'test-key', 5);

    expect(status.isLimited).toBe(true);
    expect(status.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should reset window if resetAt has passed', async () => {
    const pastResetAt = subHours(new Date(), 1);
    const mockRateLimit = {
      id: 'rl-1',
      userId: 'user-1',
      key: 'test-key',
      count: 10,
      resetAt: pastResetAt
    };

    const newResetAt = addHours(new Date(), 24);
    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);
    (prisma.rateLimit.update as any).mockResolvedValue({
      ...mockRateLimit,
      count: 1,
      resetAt: newResetAt
    });

    const status = await RateLimitService.checkAndIncrement('user-1', 'test-key', 5);

    expect(status.isLimited).toBe(false);
    expect(status.remaining).toBe(4);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { count: 1, resetAt: expect.any(Date) }
    }));
  });
});
