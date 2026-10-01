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

  describe('check', () => {
    it('should create a new rate limit record on first request and allow it', async () => {
      (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
      (prisma.rateLimit.create as any).mockResolvedValue({
        identifier: 'test-id',
        requestCount: 1,
        windowStart: new Date(),
      });

      const result = await RateLimitService.check('test-id', 10, 600);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.totalLimit).toBe(10);
      expect(prisma.rateLimit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identifier: 'test-id',
          requestCount: 1,
        }),
      });
    });

    it('should increment request count if within limit and window', async () => {
      const windowStart = new Date(); // now
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        identifier: 'test-id',
        requestCount: 3,
        windowStart,
      });
      (prisma.rateLimit.update as any).mockResolvedValue({
        identifier: 'test-id',
        requestCount: 4,
        windowStart,
      });

      const result = await RateLimitService.check('test-id', 10, 600);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(6);
      expect(prisma.rateLimit.update).toHaveBeenCalledWith({
        where: { identifier: 'test-id' },
        data: { requestCount: { increment: 1 } },
      });
    });

    it('should block requests if request limit is reached within window', async () => {
      const windowStart = new Date(); // now
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        identifier: 'test-id',
        requestCount: 10,
        windowStart,
      });

      const result = await RateLimitService.check('test-id', 10, 600);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetInSeconds).toBeGreaterThan(0);
      expect(prisma.rateLimit.update).not.toHaveBeenCalled();
    });

    it('should reset window if current time is past window duration', async () => {
      const expiredStart = new Date(Date.now() - 700 * 1000); // 700 seconds ago (> 600s window)
      (prisma.rateLimit.findUnique as any).mockResolvedValue({
        identifier: 'test-id',
        requestCount: 10,
        windowStart: expiredStart,
      });
      (prisma.rateLimit.update as any).mockResolvedValue({
        identifier: 'test-id',
        requestCount: 1,
        windowStart: new Date(),
      });

      const result = await RateLimitService.check('test-id', 10, 600);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(prisma.rateLimit.update).toHaveBeenCalledWith({
        where: { identifier: 'test-id' },
        data: expect.objectContaining({
          requestCount: 1,
        }),
      });
    });
  });

  describe('getRateLimitHeaders', () => {
    it('should generate rate limit headers for allowed request', () => {
      const result = {
        allowed: true,
        remaining: 8,
        resetInSeconds: 300,
        totalLimit: 10,
      };

      const headers = RateLimitService.getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('8');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should generate rate limit headers with Retry-After when request is blocked', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetInSeconds: 120,
        totalLimit: 10,
      };

      const headers = RateLimitService.getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBe('120');
    });
  });
});
