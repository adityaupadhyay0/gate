import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '../../db/prisma';

vi.mock('../../db/prisma', () => ({
  default: {
    rateLimit: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}));

describe('RateLimitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow first request and create rate limit record', async () => {
      (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
      (prisma.rateLimit.upsert as any).mockResolvedValue({
        key: 'ai_explain:user-1',
        count: 1,
        expiresAt: new Date(Date.now() + 600000)
      });

      const result = await RateLimitService.checkRateLimit({
        action: 'ai_explain',
        identifier: 'user-1',
        maxRequests: 10,
        windowMs: 600000
      });

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
      expect(result.headers['X-RateLimit-Limit']).toBe('10');
      expect(result.headers['X-RateLimit-Remaining']).toBe('9');
      expect(prisma.rateLimit.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'ai_explain:user-1' }
        })
      );
    });

    it('should increment count and allow request if below limit', async () => {
      const futureDate = new Date(Date.now() + 300000);
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        key: 'ai_explain:user-1',
        count: 5,
        expiresAt: futureDate
      });
      (prisma.rateLimit.update as any).mockResolvedValue({
        key: 'ai_explain:user-1',
        count: 6,
        expiresAt: futureDate
      });

      const result = await RateLimitService.checkRateLimit({
        action: 'ai_explain',
        identifier: 'user-1',
        maxRequests: 10,
        windowMs: 600000
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.headers['X-RateLimit-Remaining']).toBe('4');
      expect(prisma.rateLimit.update).toHaveBeenCalledWith({
        where: { key: 'ai_explain:user-1' },
        data: { count: { increment: 1 } }
      });
    });

    it('should reject request and set Retry-After header when limit is reached', async () => {
      const futureDate = new Date(Date.now() + 300000); // 300 seconds left
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        key: 'ai_explain:user-1',
        count: 10,
        expiresAt: futureDate
      });

      const result = await RateLimitService.checkRateLimit({
        action: 'ai_explain',
        identifier: 'user-1',
        maxRequests: 10,
        windowMs: 600000
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
      expect(result.headers['X-RateLimit-Remaining']).toBe('0');
      expect(result.headers['Retry-After']).toBe(result.retryAfterSeconds.toString());
      expect(prisma.rateLimit.update).not.toHaveBeenCalled();
    });

    it('should reset window if existing record is expired', async () => {
      const pastDate = new Date(Date.now() - 1000);
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        key: 'ai_explain:user-1',
        count: 10,
        expiresAt: pastDate
      });
      (prisma.rateLimit.upsert as any).mockResolvedValue({
        key: 'ai_explain:user-1',
        count: 1,
        expiresAt: new Date(Date.now() + 600000)
      });

      const result = await RateLimitService.checkRateLimit({
        action: 'ai_explain',
        identifier: 'user-1',
        maxRequests: 10,
        windowMs: 600000
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(prisma.rateLimit.upsert).toHaveBeenCalled();
    });
  });

  describe('resetRateLimit', () => {
    it('should delete rate limit record for action and identifier', async () => {
      (prisma.rateLimit.deleteMany as any).mockResolvedValue({ count: 1 });

      await RateLimitService.resetRateLimit('ai_explain', 'user-1');

      expect(prisma.rateLimit.deleteMany).toHaveBeenCalledWith({
        where: { key: 'ai_explain:user-1' }
      });
    });
  });
});
