import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';
import { addHours, subHours } from 'date-fns';

vi.mock('@/lib/db/prisma', () => ({
  default: {
    rateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('RateLimitService', () => {
  const userId = 'test-user';
  const action = 'ai_explain';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should create a new rate limit record if none exists', async () => {
    const now = new Date();
    vi.setSystemTime(now);

    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.create as any).mockResolvedValue({
      userId,
      action,
      count: 1,
      windowStart: now,
    });

    const status = await RateLimitService.checkAndIncrement(userId, action);

    expect(status.allowed).toBe(true);
    expect(status.remaining).toBe(19);
    expect(prisma.rateLimit.create).toHaveBeenCalled();
  });

  it('should increment existing rate limit record within window', async () => {
    const now = new Date();
    vi.setSystemTime(now);
    const windowStart = subHours(now, 1);

    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      action,
      count: 5,
      windowStart,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 6,
    });

    const status = await RateLimitService.checkAndIncrement(userId, action);

    expect(status.allowed).toBe(true);
    expect(status.remaining).toBe(14);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it('should block if limit reached within window', async () => {
    const now = new Date();
    vi.setSystemTime(now);
    const windowStart = subHours(now, 1);

    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      action,
      count: 20,
      windowStart,
    });

    const status = await RateLimitService.checkAndIncrement(userId, action);

    expect(status.allowed).toBe(false);
    expect(status.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should reset count if window has expired', async () => {
    const now = new Date();
    vi.setSystemTime(now);
    const windowStart = subHours(now, 25);

    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      userId,
      action,
      count: 20,
      windowStart,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 1,
      windowStart: now,
    });

    const status = await RateLimitService.checkAndIncrement(userId, action);

    expect(status.allowed).toBe(true);
    expect(status.remaining).toBe(19);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: 'rl-1' },
      data: {
        count: 1,
        windowStart: now,
      },
    });
  });
});
