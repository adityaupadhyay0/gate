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

  describe('checkRateLimit', () => {
    it('should create a new rate limit if none exists', async () => {
      (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
      (prisma.rateLimit.upsert as any).mockResolvedValue({
        count: 1,
        resetAt: addHours(new Date(), 24),
      });

      const result = await RateLimitService.checkRateLimit('user-1', 'test-key', 5, 24);

      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(4);
      expect(prisma.rateLimit.upsert).toHaveBeenCalled();
    });

    it('should reset the limit if current time is past resetAt', async () => {
      const pastDate = subHours(new Date(), 1);
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        count: 5,
        resetAt: pastDate,
      });
      (prisma.rateLimit.upsert as any).mockResolvedValue({
        count: 1,
        resetAt: addHours(new Date(), 24),
      });

      const result = await RateLimitService.checkRateLimit('user-1', 'test-key', 5, 24);

      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(4);
      expect(prisma.rateLimit.upsert).toHaveBeenCalled();
    });

    it('should increment count if within limit', async () => {
      const futureDate = addHours(new Date(), 12);
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        count: 2,
        resetAt: futureDate,
      });
      (prisma.rateLimit.update as any).mockResolvedValue({
        count: 3,
        resetAt: futureDate,
      });

      const result = await RateLimitService.checkRateLimit('user-1', 'test-key', 5, 24);

      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(2);
      expect(prisma.rateLimit.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { count: { increment: 1 } }
      }));
    });

    it('should return isLimited true if limit reached', async () => {
      const futureDate = addHours(new Date(), 12);
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        count: 5,
        resetAt: futureDate,
      });

      const result = await RateLimitService.checkRateLimit('user-1', 'test-key', 5, 24);

      expect(result.isLimited).toBe(true);
      expect(result.remaining).toBe(0);
      expect(prisma.rateLimit.update).not.toHaveBeenCalled();
    });
  });

  describe('getHeaders', () => {
    it('should return correct headers', () => {
      const reset = new Date('2025-05-16T00:00:00Z');
      const result = {
        isLimited: false,
        limit: 20,
        remaining: 15,
        reset,
      };

      const headers = RateLimitService.getHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('20');
      expect(headers['X-RateLimit-Remaining']).toBe('15');
      expect(headers['X-RateLimit-Reset']).toBe(Math.ceil(reset.getTime() / 1000).toString());
    });
  });
});
