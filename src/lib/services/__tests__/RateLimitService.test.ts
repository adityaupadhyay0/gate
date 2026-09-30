import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '../../db/prisma';

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

  it('should create a new rate limit record when no existing record is found', async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      key: 'ai_explain:user1',
      points: 1,
      resetAt: new Date(Date.now() + 600000)
    });

    const result = await RateLimitService.checkRateLimit('ai_explain:user1', 10, 600);

    expect(result.success).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(9);
    expect(result.resetInSeconds).toBe(600);
    expect(prisma.rateLimit.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'ai_explain:user1' },
        create: expect.objectContaining({ key: 'ai_explain:user1', points: 1 })
      })
    );
  });

  it('should reset points when the rate limit window has expired', async () => {
    const expiredDate = new Date(Date.now() - 1000);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      key: 'ai_explain:user1',
      points: 10,
      resetAt: expiredDate
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      key: 'ai_explain:user1',
      points: 1,
      resetAt: new Date(Date.now() + 600000)
    });

    const result = await RateLimitService.checkRateLimit('ai_explain:user1', 10, 600);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it('should increment points when within limit window and limit not reached', async () => {
    const futureDate = new Date(Date.now() + 300000);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      key: 'ai_explain:user1',
      points: 5,
      resetAt: futureDate
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      key: 'ai_explain:user1',
      points: 6,
      resetAt: futureDate
    });

    const result = await RateLimitService.checkRateLimit('ai_explain:user1', 10, 600);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'ai_explain:user1' },
        data: { points: { increment: 1 } }
      })
    );
  });

  it('should reject request when limit is exceeded', async () => {
    const futureDate = new Date(Date.now() + 300000);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      key: 'ai_explain:user1',
      points: 10,
      resetAt: futureDate
    });

    const result = await RateLimitService.checkRateLimit('ai_explain:user1', 10, 600);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.resetInSeconds).toBeGreaterThan(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
    expect(prisma.rateLimit.upsert).not.toHaveBeenCalled();
  });
});
