import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '../../db/prisma';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow first request and initialize rate limit window', async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.create as any).mockResolvedValue({
      id: 'rl-1',
      identifier: 'ai_explain:user-1',
      count: 1,
      windowStart: new Date(),
    });

    const result = await RateLimitService.checkLimit('ai_explain:user-1', {
      limit: 10,
      windowSeconds: 600,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.limit).toBe(10);
    expect(result.headers['X-RateLimit-Limit']).toBe('10');
    expect(result.headers['X-RateLimit-Remaining']).toBe('9');
    expect(result.headers['Retry-After']).toBeUndefined();
    expect(prisma.rateLimit.create).toHaveBeenCalled();
  });

  it('should increment request count if within limit', async () => {
    const windowStart = new Date(); // now
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      identifier: 'ai_explain:user-1',
      count: 4,
      windowStart,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: 'rl-1',
      identifier: 'ai_explain:user-1',
      count: 5,
      windowStart,
    });

    const result = await RateLimitService.checkLimit('ai_explain:user-1', {
      limit: 10,
      windowSeconds: 600,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(5);
    expect(result.headers['X-RateLimit-Remaining']).toBe('5');
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { identifier: 'ai_explain:user-1' },
      data: { count: 5 },
    });
  });

  it('should block request and include Retry-After header when rate limit is exceeded', async () => {
    const windowStart = new Date(); // now
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      identifier: 'ai_explain:user-1',
      count: 10,
      windowStart,
    });

    const result = await RateLimitService.checkLimit('ai_explain:user-1', {
      limit: 10,
      windowSeconds: 600,
    });

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.headers['X-RateLimit-Remaining']).toBe('0');
    expect(result.headers['Retry-After']).toBeDefined();
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it('should reset window when current time exceeds window duration', async () => {
    const oldWindowStart = new Date(Date.now() - 700 * 1000); // 700 seconds ago (> 600s window)
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: 'rl-1',
      identifier: 'ai_explain:user-1',
      count: 10,
      windowStart: oldWindowStart,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: 'rl-1',
      identifier: 'ai_explain:user-1',
      count: 1,
      windowStart: new Date(),
    });

    const result = await RateLimitService.checkLimit('ai_explain:user-1', {
      limit: 10,
      windowSeconds: 600,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { identifier: 'ai_explain:user-1' },
        data: expect.objectContaining({ count: 1 }),
      })
    );
  });
});
